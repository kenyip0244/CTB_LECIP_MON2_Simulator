/**
 * CTB LECIP MON2 CONTROLLER - FULLY AUTOMATED API ENGINE
 * NO MANUAL BUTTONS: Data fetched directly from Citybus Open Data API (DATA.GOV.HK).
 * Automatically handles:
 * - Route Selection (路線)
 * - Direction Selection (方向: 去程 Outbound / 回程 Inbound)
 * - Trip Selection (班次: 實時 ETA 抵站班次)
 * - Automated Trip Progression (開車 -> 巡航 -> 報站 -> 停站 -> 終點站)
 */

class Mon2Controller {
  constructor(display, audio) {
    this.display = display;
    this.audio = audio;
    this.api = window.ctbAPI;

    // Trip State
    this.routesList = [];
    this.selectedRouteCode = "780";
    this.selectedDirection = "outbound";
    this.currentStops = [];
    this.currentStopIndex = 0; // 0-based
    this.tripStatus = "departing"; // 'departing', 'transit', 'arriving', 'dwelling', 'terminus'

    // Simulation Speed & Timer
    this.speedMultiplier = 3.0; // Default 3x for pleasant realistic demo
    this.tripStepTimer = null;
    this.isTripPaused = false;
    this.timeInPhase = 0;

    // Real GPS & Dynamic Target Distance ("目標站距：實時動態顯示距離下一個目標站點的剩餘米數。是時間計算的")
    this.useRealGPS = false;
    this.gpsWatchId = null;
    this.hasAutoLocatedNearest = false;
    this.operationMode = "auto"; // 'auto' or 'manual' ("可選手動mode 手動mode 不會顯示「此站」")
    this.targetDistanceMeters = 850;
    this.legTotalDistance = 850;
    this.currentSpeedKmh = 36;
    this.currentGPSCoords = null;
  }

  async init() {
    this.bindDOM();
    await this.loadRoutesFromAPI();
  }

  bindDOM() {
    // 0. Route Search Input & Dropdown ("Api獲取所有路線資料 然後選擇路線可以搜尋")
    this.setupRouteSearch();

    // Mode Selector: Auto vs Manual ("可選手動mode 手動mode 不會顯示「此站」")
    const btnModeAuto = document.getElementById("btn-mode-auto");
    const btnModeManual = document.getElementById("btn-mode-manual");
    const manualRow = document.getElementById("manual-controls-row");
    const btnManualPrev = document.getElementById("btn-manual-prev");
    const btnManualNext = document.getElementById("btn-manual-next");

    if (btnModeAuto && btnModeManual) {
      btnModeAuto.addEventListener("click", () => {
        this.setOperationMode("auto");
        btnModeAuto.classList.add("pill-active");
        btnModeManual.classList.remove("pill-active");
        if (manualRow) manualRow.style.display = "none";
      });

      btnModeManual.addEventListener("click", () => {
        this.setOperationMode("manual");
        btnModeManual.classList.add("pill-active");
        btnModeAuto.classList.remove("pill-active");
        if (manualRow) manualRow.style.display = "flex";
      });
    }

    if (btnManualNext) {
      btnManualNext.addEventListener("click", () => {
        this.manualAdvanceStop(1);
      });
    }

    if (btnManualPrev) {
      btnManualPrev.addEventListener("click", () => {
        this.manualAdvanceStop(-1);
      });
    }

    // 0.1 Real GPS Toggle ("Use real GPS")
    const gpsToggle = document.getElementById("ctrl-real-gps-toggle");
    if (gpsToggle) {
      gpsToggle.addEventListener("change", (e) => {
        this.toggleRealGPS(e.target.checked);
      });
    }

    // 1. Route Selector
    const routeSelect = document.getElementById("api-route-select");
    if (routeSelect) {
      routeSelect.addEventListener("change", async (e) => {
        this.selectedRouteCode = e.target.value;
        await this.loadRouteDirectionAndStops();
      });
    }

    // 2. Direction Selector
    const dirSelect = document.getElementById("api-dir-select");
    if (dirSelect) {
      dirSelect.addEventListener("change", async (e) => {
        this.selectedDirection = e.target.value;
        await this.loadRouteDirectionAndStops();
      });
    }

    // 3. Trip / Departure Selector
    const tripSelect = document.getElementById("api-trip-select");
    if (tripSelect) {
      tripSelect.addEventListener("change", () => {
        this.startSelectedTrip();
      });
    }

    // 4. Speed Multiplier Buttons
    const btnSpeed1 = document.getElementById("btn-speed-1");
    const btnSpeed3 = document.getElementById("btn-speed-3");
    const btnSpeed6 = document.getElementById("btn-speed-6");
    const btnPause = document.getElementById("btn-trip-pause");

    const updateSpeedActive = (activeBtn) => {
      [btnSpeed1, btnSpeed3, btnSpeed6].forEach(b => b && b.classList.remove("pill-active"));
      if (activeBtn) activeBtn.classList.add("pill-active");
    };

    if (btnSpeed1) {
      btnSpeed1.addEventListener("click", () => {
        this.speedMultiplier = 1.0;
        updateSpeedActive(btnSpeed1);
      });
    }
    if (btnSpeed3) {
      btnSpeed3.addEventListener("click", () => {
        this.speedMultiplier = 3.0;
        updateSpeedActive(btnSpeed3);
      });
    }
    if (btnSpeed6) {
      btnSpeed6.addEventListener("click", () => {
        this.speedMultiplier = 6.0;
        updateSpeedActive(btnSpeed6);
      });
    }
    if (btnPause) {
      btnPause.addEventListener("click", () => {
        this.isTripPaused = !this.isTripPaused;
        btnPause.innerHTML = this.isTripPaused ? "<span>▶</span> 繼續行程" : "<span>⏸</span> 暫停行程";
        btnPause.classList.toggle("btn-danger", this.isTripPaused);
      });
    }

    // 5. System Configurations (Mon2_constfile)
    const themeSelect = document.getElementById("ctrl-theme-base");
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        this.display.setThemeBase(e.target.value);
      });
    }

    const orientSelect = document.getElementById("ctrl-orient-select");
    if (orientSelect) {
      orientSelect.addEventListener("change", (e) => {
        this.display.setOrientation(parseInt(e.target.value, 10));
      });
    }

    const colorSelect = document.getElementById("ctrl-color-select");
    if (colorSelect) {
      colorSelect.addEventListener("change", (e) => {
        this.display.setColorTheme(parseInt(e.target.value, 10));
      });
    }

    const modeSelect = document.getElementById("ctrl-mode-select");
    if (modeSelect) {
      modeSelect.addEventListener("change", (e) => {
        this.display.setDisplayMode(parseInt(e.target.value, 10));
      });
    }

    // 6. Driver Profile Inputs
    const driverZhInput = document.getElementById("ctrl-driver-surname-zh");
    const driverEnInput = document.getElementById("ctrl-driver-surname-en");
    const driverIdInput = document.getElementById("ctrl-driver-id");
    const driverCheck = document.getElementById("ctrl-driver-logged");

    const updateProfile = () => {
      const surnameZh = driverZhInput ? driverZhInput.value : "陳";
      const surnameEn = driverEnInput ? driverEnInput.value : "Chan";
      const id = driverIdInput ? driverIdInput.value : "50179";
      const logged = driverCheck ? driverCheck.checked : true;

      this.display.driverPrivacyHidden = !logged;
      this.display.setDriverProfile({ id, surnameZh, surnameEn, logged });
    };

    if (driverZhInput) driverZhInput.addEventListener("input", updateProfile);
    if (driverEnInput) driverEnInput.addEventListener("input", updateProfile);
    if (driverIdInput) driverIdInput.addEventListener("input", updateProfile);
    if (driverCheck) driverCheck.addEventListener("change", updateProfile);

    // 7. Fullscreen button
    const btnFullscreen = document.getElementById("btn-fullscreen");
    if (btnFullscreen) {
      btnFullscreen.addEventListener("click", () => {
        const frame = document.getElementById("mon2-frame");
        if (frame) {
          if (!document.fullscreenElement) {
            frame.requestFullscreen().catch(err => alert(err.message));
          } else {
            document.exitFullscreen();
          }
        }
      });
    }

    // 8. Random poster & audio toggles
    const randomCheck = document.getElementById("ctrl-random-poster");
    if (randomCheck) {
      randomCheck.addEventListener("change", (e) => {
        this.display.randomPosterMode = e.target.checked;
      });
    }

    const audioCheck = document.getElementById("ctrl-audio-enable");
    if (audioCheck) {
      audioCheck.addEventListener("change", (e) => {
        this.audio.enabled = e.target.checked;
      });
    }

    const ttsCheck = document.getElementById("ctrl-tts-enable");
    if (ttsCheck) {
      ttsCheck.addEventListener("change", (e) => {
        this.audio.speechEnabled = e.target.checked;
      });
    }
  }

  // --- Step 1: 首次聯網自動從 API 線上導入所有資料 (路線走法、停站位置、價錢、到站時間) ---
  async loadRoutesFromAPI() {
    const statusBadge = document.getElementById("api-status-badge");
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="spinner-dot"></span> 首次聯網：正在從 DATA.GOV.HK 導入全港路線、走法、停站座標、票價與 ETA...`;
    }

    this.routesList = await this.api.autoImportAllOnlineData((msg) => {
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="spinner-dot"></span> ${msg}`;
      }
    });

    if (statusBadge) {
      if (this.api.apiOnline) {
        statusBadge.innerHTML = `<span style="color:#22C55E">●</span> 已成功從 DATA.GOV.HK API 線上導入全港資料 (路線走法 · 停站位置 · 票價 · 到站時間)`;
      } else {
        statusBadge.innerHTML = `<span style="color:#EAB308">●</span> 離線備用模式 (已備存路線資料)`;
      }
    }

    this.populateRouteSelect();
    await this.loadRouteDirectionAndStops();
  }

  populateRouteSelect() {
    const select = document.getElementById("api-route-select");
    if (!select || !this.routesList) return;

    select.innerHTML = "";

    // Prioritize prominent routes: 780, 905, A12, 702, A21, 8P, H1
    const featured = ["780", "905", "A12", "702", "A21", "8P", "H1"];
    const sorted = [...this.routesList].sort((a, b) => {
      const aFeat = featured.indexOf(a.route);
      const bFeat = featured.indexOf(b.route);
      if (aFeat !== -1 && bFeat !== -1) return aFeat - bFeat;
      if (aFeat !== -1) return -1;
      if (bFeat !== -1) return 1;
      return a.route.localeCompare(b.route, undefined, { numeric: true });
    });

    sorted.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r.route;
      const isAirport = r.route.startsWith("A") || r.route.startsWith("NA");
      const badge = r.co === "KMB" ? "【九巴】" : (isAirport ? "【機場快線】" : "【城巴】");
      opt.textContent = `${badge} ${r.route} (${r.orig_tc} ➔ ${r.dest_tc})`;
      select.appendChild(opt);
    });

    select.value = this.selectedRouteCode;
  }

  // --- Step 2: Load Route Direction and Stop Sequence ---
  async loadRouteDirectionAndStops() {
    const routeCode = this.selectedRouteCode;
    const direction = this.selectedDirection;

    // Find route info
    const routeMeta = this.routesList.find(r => r.route === routeCode) || {
      route: routeCode,
      orig_tc: "總站",
      orig_en: "Terminus",
      dest_tc: "中環碼頭",
      dest_en: "Central (Ferry Piers)"
    };

    // Update direction dropdown text
    const dirSelect = document.getElementById("api-dir-select");
    if (dirSelect) {
      dirSelect.options[0].textContent = `去程 Outbound (往 ${routeMeta.dest_tc || "總站"})`;
      dirSelect.options[1].textContent = `回程 Inbound (往 ${routeMeta.orig_tc || "總站"})`;
    }

    // Fetch stops from API
    let stops = null;
    if (routeMeta.isKMB) {
      stops = await this.api.getKMBRouteStops(routeCode, direction, routeMeta.service_type || "1");
    } else {
      stops = await this.api.getRouteStops(routeCode, direction);
    }
    this.currentStops = stops || [];

    // Construct route object for Mon2Display
    let rawDestZh = direction === "outbound" ? routeMeta.dest_tc : routeMeta.orig_tc;
    let rawDestEn = direction === "outbound" ? routeMeta.dest_en : routeMeta.orig_en;
    const destZh = (rawDestZh || "").replace(/[\(（]經港珠澳大橋.*?[\)）]/g, "").trim();
    const destEn = (rawDestEn || "").replace(/[\(（]via HZMB.*?[\)）]/gi, "").trim();
    
    const origZh = direction === "outbound" ? routeMeta.orig_tc : routeMeta.dest_tc;
    const origEn = direction === "outbound" ? routeMeta.orig_en : routeMeta.dest_en;

    const routeData = {
      code: routeCode,
      company: routeCode.startsWith("H") ? "NWFB" : "CTB",
      isAirport: routeCode.startsWith("A") || routeCode.startsWith("NA"),
      isRickshaw: routeCode.startsWith("H"),
      origin: { zh: origZh, en: origEn },
      dest: { zh: destZh, en: destEn },
      colorHex: (routeCode.startsWith("A") || routeCode.startsWith("NA")) ? "#E6007E" : "#004B87",
      textColor: "#FFFFFF",
      stops: this.currentStops
    };

    // Load into display
    this.hasAutoLocatedNearest = false;
    this.display.setRoute(routeData, 0);

    // Fetch ETA Trips for first stop
    const firstStopId = this.currentStops[0]?.stopId || "001";
    let trips = [];
    if (routeMeta.isKMB) {
      trips = await this.api.getKMBTripsETA(firstStopId, routeCode, routeMeta.service_type || "1");
    } else {
      trips = await this.api.getTripsETA(firstStopId, routeCode);
    }
    this.populateTripSelect(trips);

    // Automatically start journey progression!
    this.startSelectedTrip();
  }

  // --- Step 3: Populate Trip (班次) Select ---
  populateTripSelect(trips) {
    const tripSelect = document.getElementById("api-trip-select");
    if (!tripSelect) return;

    tripSelect.innerHTML = "";
    trips.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.tripId;
      opt.textContent = `${t.timeLabel} - ${t.remarkZh}`;
      tripSelect.appendChild(opt);
    });
  }

  // --- Step 4: Automatic Trip Progression (NO MANUAL BUTTONS!) ---
  startSelectedTrip() {
    this.currentStopIndex = 0;
    this.tripStatus = "departing";
    this.timeInPhase = 0;
    this.display.setStopIndex(0, "next");

    this.startAutomatedTripLoop();
    this.updateTripProgressUI();

    // Initial Departure Chime and Spoken Announcement
    this.audio.playChime();
    const curStop = this.currentStops[0];
    if (curStop) {
      this.audio.speakAnnouncement(curStop, "next");
    }
  }

  startAutomatedTripLoop() {
    if (this.tripStepTimer) clearInterval(this.tripStepTimer);

    // 1-second ticks scaled by speedMultiplier
    this.tripStepTimer = setInterval(() => {
      if (this.isTripPaused || !this.currentStops || this.currentStops.length === 0) return;

      this.stepTripProgression();
    }, 1000);
  }

  stepTripProgression() {
    this.timeInPhase += this.speedMultiplier;

    const transitDuration = 22; // Transit duration between stops
    const dwellDuration = 6;    // Dwell time at stop
    const curStop = this.currentStops[this.currentStopIndex];
    const prevStop = this.currentStops[Math.max(0, this.currentStopIndex - 1)];
    const isTerminus = (this.currentStopIndex >= this.currentStops.length - 1);

    // Dynamic Target Distance Calculation: 「目標站距：實時動態顯示距離下一個目標站點的剩餘米數（例如 距離下一站: 142m）。 是時間計算的」
    if (!this.useRealGPS) {
      // Calculate leg distance from real GPS coordinates of stops, fallback to ~850m
      if (curStop && prevStop && curStop.lat && prevStop.lat && curStop !== prevStop) {
        this.legTotalDistance = Math.round(this.getHaversineDistance(prevStop.lat, prevStop.long, curStop.lat, curStop.long));
      } else {
        this.legTotalDistance = 850;
      }

      if (this.tripStatus === "departing") {
        const progress = Math.min(1.0, this.timeInPhase / transitDuration);
        this.targetDistanceMeters = Math.max(0, Math.round(this.legTotalDistance * (1.0 - progress)));
      } else if (this.tripStatus === "arriving") {
        this.targetDistanceMeters = Math.max(0, Math.round(90 * (1.0 - (this.timeInPhase / 4))));
      } else {
        this.targetDistanceMeters = 0;
      }

      // Push real-time distance to Mon2Display (HUD badge: 距 142m)
      this.display.setTargetDistance(this.targetDistanceMeters);

      const targetDistEl = document.getElementById("gps-target-distance-meters");
      if (targetDistEl) {
        targetDistEl.textContent = `距離下一站: ${this.targetDistanceMeters}m`;
      }
    }

    if (this.operationMode === "manual") return;

    if (this.tripStatus === "departing") {
      // When approaching stop (under 100 meters or time threshold) -> trigger 'arriving'
      if (this.timeInPhase >= transitDuration || (!this.useRealGPS && this.targetDistanceMeters <= 100 && this.timeInPhase >= 8)) {
        this.tripStatus = "arriving";
        this.timeInPhase = 0;
        this.display.arriveStop();
        this.audio.playChime();
        // TTS removed
      }
    } else if (this.tripStatus === "arriving") {
      if (this.timeInPhase >= 4) {
        this.tripStatus = "dwelling";
        this.timeInPhase = 0;
      }
    } else if (this.tripStatus === "dwelling") {
      if (this.timeInPhase >= dwellDuration) {
        if (isTerminus) {
          this.tripStatus = "terminus";
          this.updateTripProgressUI();
          return;
        }

        // Advance to next stop
        this.currentStopIndex++;
        this.tripStatus = "departing";
        this.timeInPhase = 0;

        const nextStopData = this.currentStops[this.currentStopIndex];
        this.display.nextStop();
        this.audio.playChime();
        // TTS removed
      }
    }

    this.updateTripProgressUI();
  }

  updateTripProgressUI() {
    const curStop = this.currentStops[this.currentStopIndex];
    const stopNameEl = document.getElementById("live-current-stop-name");
    const statusTextEl = document.getElementById("live-trip-status-text");
    const progressBar = document.getElementById("live-trip-progress-bar");
    const remainingStopsEl = document.getElementById("live-remaining-stops");

    if (!curStop) return;

    if (stopNameEl) {
      stopNameEl.textContent = `${curStop.num}. ${curStop.zh} (${curStop.en})`;
    }

    if (statusTextEl) {
      if (this.tripStatus === "departing") {
        statusTextEl.innerHTML = `<span style="color:#38BDF8">🚌 行駛中 (前往第 ${curStop.num} 站)</span>`;
      } else if (this.tripStatus === "arriving") {
        statusTextEl.innerHTML = `<span style="color:#16A34A">🛑 即將抵站 (此站停靠)</span>`;
      } else if (this.tripStatus === "dwelling") {
        statusTextEl.innerHTML = `<span style="color:#EAB308">👥 停站載客中 (客上落)</span>`;
      } else if (this.tripStatus === "terminus") {
        statusTextEl.innerHTML = `<span style="color:#DC2626">🏁 已抵達終點站 (旅程完成)</span>`;
      }
    }

    if (remainingStopsEl) {
      const left = Math.max(0, this.currentStops.length - (this.currentStopIndex + 1));
      remainingStopsEl.textContent = `剩餘站數：${left} 站`;
    }

    if (progressBar) {
      const pct = Math.round(((this.currentStopIndex + 1) / this.currentStops.length) * 100);
      progressBar.style.width = `${pct}%`;
    }
  }

  syncDriverCheckbox() {
    const loggedEl = document.getElementById("ctrl-driver-logged");
    if (loggedEl) {
      loggedEl.checked = !this.display.driverPrivacyHidden && (this.display.ddu_login === 1);
    }
  }

  updateModePills(modeNum) {
    // Keep internal state updated
  }

  // --- Searchable Route System: Api獲取所有路線資料 然後選擇路線可以搜尋 ---
  setupRouteSearch() {
    const searchInput = document.getElementById("route-search-input");
    const dropdown = document.getElementById("route-search-dropdown");
    if (!searchInput || !dropdown) return;

    searchInput.addEventListener("input", async (e) => {
      const q = e.target.value.trim();
      if (!q) {
        dropdown.classList.add("hidden");
        return;
      }

      const results = await this.api.searchRoutes(q);
      if (!results || results.length === 0) {
        dropdown.innerHTML = `<div class="route-search-item" style="color: #94A3B8;">查無相關路線</div>`;
        dropdown.classList.remove("hidden");
        return;
      }

      dropdown.innerHTML = "";
      results.forEach(r => {
        const item = document.createElement("div");
        item.className = "route-search-item";
        item.innerHTML = `
          <div>
            <span class="route-badge-mini" style="${r.co === 'KMB' ? 'background:#E1251B;' : ''}">${r.route}</span>
            <strong style="margin-left: 6px;">${r.orig_tc || ''} ➔ ${r.dest_tc || ''}</strong>
          </div>
          <small style="color: #94A3B8;">${r.orig_en || ''} ➔ ${r.dest_en || ''}</small>
        `;
        item.addEventListener("click", async () => {
          this.selectedRouteCode = r.route;
          searchInput.value = `${r.route} (${r.orig_tc} ➔ ${r.dest_tc})`;
          dropdown.classList.add("hidden");

          // Update select box if exists
          const select = document.getElementById("api-route-select");
          if (select) {
            let opt = Array.from(select.options).find(o => o.value === r.route);
            if (!opt) {
              opt = document.createElement("option");
              opt.value = r.route;
              opt.textContent = `${r.co === "KMB" ? "【九巴】" : "【城巴】"}${r.route} (${r.orig_tc} ➔ ${r.dest_tc})`;
              select.appendChild(opt);
            }
            select.value = r.route;
          }

          await this.loadRouteDirectionAndStops();
        });
        dropdown.appendChild(item);
      });

      dropdown.classList.remove("hidden");
    });

    // Close dropdown on click outside
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }

  // --- Real GPS Tracking Engine ("Use real GPS") ---
  toggleRealGPS(enable) {
    this.useRealGPS = enable;
    this.hasAutoLocatedNearest = false; // Reset so GPS immediately snaps to nearest stop
    const statusEl = document.getElementById("gps-status-indicator");

    if (enable) {
      if (!navigator.geolocation) {
        alert("您的裝置或瀏覽器不支援 HTML5 Geolocation GPS 定位功能");
        const toggle = document.getElementById("ctrl-real-gps-toggle");
        if (toggle) toggle.checked = false;
        this.useRealGPS = false;
        return;
      }

      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#38BDF8">●</span> 正在搜尋 GPS 衛星訊號 (High Accuracy)...`;
      }

      this.gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => this.onGPSUpdate(pos),
        (err) => this.onGPSError(err),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    } else {
      if (this.gpsWatchId) {
        navigator.geolocation.clearWatch(this.gpsWatchId);
        this.gpsWatchId = null;
      }
      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#EAB308">●</span> 模擬行駛時間計算模式 (Time-Based Calculation)`;
      }
    }
  }

  onGPSUpdate(pos) {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const acc = Math.round(pos.coords.accuracy || 10);
    const speedKmh = Math.round((pos.coords.speed || 0) * 3.6);

    this.currentGPSCoords = { lat, lon, acc, speedKmh };
    this.currentSpeedKmh = speedKmh;

    // GPS邏輯: 自動定位至最近車站開始
    if (!this.hasAutoLocatedNearest && this.currentStops && this.currentStops.length > 0) {
      this.autoLocateNearestStop(lat, lon);
      this.hasAutoLocatedNearest = true;
    }

    const statusEl = document.getElementById("gps-status-indicator");
    const coordsEl = document.getElementById("gps-coords-display");
    const speedEl = document.getElementById("gps-speed-kmh");

    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#22C55E">●</span> GPS 實時定位追蹤中 (High Accuracy)`;
    }
    if (coordsEl) {
      coordsEl.textContent = `${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E (±${acc}m)`;
    }
    if (speedEl) {
      speedEl.textContent = `${speedKmh} km/h`;
    }

    const curStop = this.currentStops[this.currentStopIndex];
    if (curStop && curStop.lat && curStop.long) {
      const dist = this.getHaversineDistance(lat, lon, curStop.lat, curStop.long);
      this.targetDistanceMeters = Math.max(0, Math.round(dist));

      // Update screen target distance
      this.display.setTargetDistance(this.targetDistanceMeters);

      const targetDistEl = document.getElementById("gps-target-distance-meters");
      if (targetDistEl) {
        targetDistEl.textContent = `距離下一站: ${this.targetDistanceMeters}m`;
      }

      // Real-life auto arrival detection
      if (this.operationMode !== "manual" && this.targetDistanceMeters <= 100 && this.tripStatus === "departing") {
        this.tripStatus = "arriving";
        this.display.arriveStop();
        this.audio.playChime();
        this.audio.speakAnnouncement(curStop, "arrived");
      } else if (this.tripStatus === "arriving" && this.targetDistanceMeters > 130 && speedKmh > 6) {
        // Bus departed stop in real life
        if (this.currentStopIndex < this.currentStops.length - 1) {
          this.currentStopIndex++;
          this.tripStatus = "departing";
          const nextStopData = this.currentStops[this.currentStopIndex];
          this.display.nextStop();
          this.audio.playChime();
          // TTS removed
        }
      }
    }
  }

  onGPSError(err) {
    console.warn("GPS Geolocation error:", err);
    const statusEl = document.getElementById("gps-status-indicator");
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#EF4444">●</span> GPS 定位失敗 (${err.message})，自動切換至時間計算模式`;
    }
  }

  getHaversineDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 750;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }


// --- GPS: 自動定位至最近車站開始 ---
  autoLocateNearestStop(lat, lon) {
    if (!this.currentStops || this.currentStops.length === 0) return;

    let nearestIdx = 0;
    let minDistance = Infinity;

    this.currentStops.forEach((stop, idx) => {
      if (stop.lat && stop.long) {
        const d = this.getHaversineDistance(lat, lon, stop.lat, stop.long);
        if (d < minDistance) {
          minDistance = d;
          nearestIdx = idx;
        }
      }
    });

    const nearestStop = this.currentStops[nearestIdx];
    this.currentStopIndex = nearestIdx;
    this.tripStatus = "departing";
    this.timeInPhase = 0;

    // 「自動定位至最近車站開始」
    this.display.telargo_busarrivingstop = 0;
    this.display.setStopIndex(nearestIdx, "next");
    this.updateTripProgressUI();

    const statusEl = document.getElementById("gps-status-indicator");
    if (statusEl && nearestStop) {
      statusEl.innerHTML = `<span style="color:#22C55E">●</span> GPS 已自動就近定位至第 ${nearestIdx + 1} 站：<strong>${nearestStop.zh}</strong> (距 ${Math.round(minDistance)}m)`;
    }
  }

  // --- 手動 Mode 切換: 「可選手動mode 手動mode 不會顯示『此站』」 ---
  setOperationMode(mode) {
    this.operationMode = mode;
    if (mode === "manual") {
      // 「手動mode 不會顯示『此站』」
      this.display.manualModeNoArrive = true;
      this.display.telargo_busarrivingstop = 0;
      this.tripStatus = "departing";
      this.display.renderAllPanels();
      this.updateTripProgressUI();
    } else {
      this.display.manualModeNoArrive = false;
      this.hasAutoLocatedNearest = false;
      if (this.currentGPSCoords) {
        this.autoLocateNearestStop(this.currentGPSCoords.lat, this.currentGPSCoords.lon);
      }
    }
  }

  manualAdvanceStop(delta) {
    if (!this.currentStops || this.currentStops.length === 0) return;

    const newIdx = Math.max(0, Math.min(this.currentStops.length - 1, this.currentStopIndex + delta));
    this.currentStopIndex = newIdx;
    this.timeInPhase = 0;

    // In manual mode, strictly NEVER show "此站" (telargo_busarrivingstop = 0)
    this.display.telargo_busarrivingstop = 0;
    this.tripStatus = "departing";
    this.display.setStopIndex(newIdx, "next");
    this.audio.playChime();
    this.updateTripProgressUI();
  }
}

window.Mon2Controller = Mon2Controller;
