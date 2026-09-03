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
  }

  async init() {
    this.bindDOM();
    await this.loadRoutesFromAPI();
  }

  bindDOM() {
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

  // --- Step 1: Load Routes list from Citybus Open Data API ---
  async loadRoutesFromAPI() {
    const statusBadge = document.getElementById("api-status-badge");
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="spinner-dot"></span> 正在連接城巴 Open Data API...`;
    }

    this.routesList = await this.api.getRoutes();

    if (statusBadge) {
      if (this.api.apiOnline) {
        statusBadge.innerHTML = `<span style="color:#22C55E">●</span> 城巴 API 即時連線 (DATA.GOV.HK)`;
      } else {
        statusBadge.innerHTML = `<span style="color:#EAB308">●</span> 離線備份資料庫模式 (包含實車 780, 905, A12 等)`;
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
      const badge = isAirport ? "【機場快線】" : (r.route.startsWith("H") ? "【人力車】" : "【城巴】");
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
      dirSelect.options[0].textContent = `去程 Outbound (往 ${routeMeta.dest_tc})`;
      dirSelect.options[1].textContent = `回程 Inbound (往 ${routeMeta.orig_tc})`;
    }

    // Fetch stops from API
    const stops = await this.api.getRouteStops(routeCode, direction);
    this.currentStops = stops || [];

    // Construct route object for Mon2Display
    const destZh = direction === "outbound" ? routeMeta.dest_tc : routeMeta.orig_tc;
    const destEn = direction === "outbound" ? routeMeta.dest_en : routeMeta.orig_en;
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
    this.display.setRoute(routeData, 0);

    // Fetch ETA Trips for first stop
    const firstStopId = this.currentStops[0]?.stopId || "001";
    const trips = await this.api.getTripsETA(firstStopId, routeCode);
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

    // Phase timings (in seconds):
    // 1. 'departing': 8s (showing Next stop, cycling through Mon2 modes)
    // 2. 'arriving': 6s (switches to 'This stop', chimes, approaches)
    // 3. 'dwelling': 5s (bus stopped at station, doors open)
    const transitDuration = 18; // Transit time between stops
    const dwellDuration = 6;    // Dwell time at station

    const curStop = this.currentStops[this.currentStopIndex];
    const isTerminus = (this.currentStopIndex >= this.currentStops.length - 1);

    if (this.tripStatus === "departing") {
      if (this.timeInPhase >= transitDuration) {
        // Switch to arriving / This Stop
        this.tripStatus = "arriving";
        this.timeInPhase = 0;
        this.display.arriveStop();
        this.audio.playChime();
        if (curStop) this.audio.speakAnnouncement(curStop, "arrived");
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

        // Advance to next stop automatically!
        this.currentStopIndex++;
        this.tripStatus = "departing";
        this.timeInPhase = 0;

        const nextStopData = this.currentStops[this.currentStopIndex];
        this.display.nextStop();
        this.audio.playChime();
        if (nextStopData) this.audio.speakAnnouncement(nextStopData, "next");
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
}

window.Mon2Controller = Mon2Controller;
