/**
 * CTB LECIP MON2 DISPLAY ENGINE
 * STRICTLY FOLLOWING OMSI 2 "Mon2.osc" (Version 1.2.0 by Limit Studio)
 * 
 * Implements the exact OMSI macros, timers, and state transitions:
 * - Macro: LECIP_mon2_frame (Main loop & Timer)
 * - Macro: LECIP_Mon2_Mode1 (Mode 1: Chinese 3-Stop / Mode 2: English 3-Stop)
 * - Macro: LECIP_Mon2_Mode3 (Mode 3: Fare & Interchange)
 * - Macro: LECIP_Mon2_Mode4 (Mode 4: Poster rotation up to Max_Poster_Number)
 * - Macro: LECIP_Mon2_Mode5 (Mode 5: AllStop / 13-Stop ladder with Page_Now / Page_Totel)
 * - Trigger: LECIP_Mon2_Driver_ID_button (Toggle Driver ID / App prompt)
 * 
 * Authentic Real-life Photo Formatting:
 * - Driver Name: [X]車長 / Bus Captain [X] (e.g. 陳車長 Bus Captain Chan, 李車長, 黃車長)
 * - Staff No: 員工編號 Staff No. [ID]
 * - Slogan: 為您服務 is serving you
 * - Vertical: Bottom footer bar
 * - Horizontal: Top header bar
 */

class Mon2Display {
  // Helper: 車站名 “,” 或之後文字不顯示，且「九巴龍運車站不顯示 (XXXX)」
  cleanStopName(name) {
    if (!name) return "";
    let clean = name.split(/[,，]/)[0].trim();
    // 移除尾部括號代號 (XXXX) / (B1) / (N28) / (002598) 等九巴龍運代號
    clean = clean.replace(/\s*[\(（][A-Za-z0-9\s#_-]+[\)）]\s*$/g, "").trim();
    return clean;
  }

  constructor(containerEl) {
    this.container = containerEl;

    // --- Variables directly from Mon2_varlist.txt & Mon2.osc ---
    this.DirectionV = 1; // 1: Vertical, 0: Horizontal
    this.ColorP = 1; // 1: Purple (P), 0: Grey (G)
    this.Display_Mode = 0; // 0: Normal (7s), 1: Test Mode (3s, Blue Screen)
    this.Max_Poster_Number_V = 21;
    this.Max_Poster_Number_H = 21;

    this.Mon2_Main = 1;
    this.Mon2_Mode = 1; // 1: ZH 3-Stop, 2: EN 3-Stop, 3: Fare/IC, 4: Poster, 5: AllStop
    this.Mon2_Tex_Mode = 0; // 0: Normal, 1: CityFlyer, 2: RSB (Rickshaw)
    this.Mon2_Standby_Mode = 0; // 1: Standby (>10 mins or control=1211)
    this.telargo_mon_control = 11211; // 11211: in service, 1211: standby

    this.Mon2_Timer = 0.0;
    this.Mon2_Fare_Timer = 0.0;
    this.Mon2_Poster_Timer = 0.0;
    this.Mon2_Page_Timer = 0.0;
    this.Mon2_Last_Page_Timer = 0.0;

    this.Mon2_Now_Poster = 1;
    this.Mon2_Poster_Run = 0;
    this.Mon2_Poster_Add = 0;

    this.Mon2_Page_Now = 1;
    this.Mon2_Page_Totel = 1;
    this.Mon2_Last_Page_LeftStop = 0;

    this.Mon2_Driver_ID_Switch = 0; // 0: Show Driver ID, 1: Hide Driver ID (Show App)
    this.ddu_login = 1; // Driver card logged in
    this.manualModeNoArrive = false; // 「手動mode 不會顯示『此站』」

    this.telargo_busarrivingstop = 0; // 0: Next stop (NS), 1: This stop (TS)
    this.telargo_busstop = 1; // 1-based current stop in trip

    // Customizable Captain Profile
    this.driverInfo = {
      id: "50179",
      surnameZh: "陳",
      surnameEn: "Chan"
    };

    // Current active route
    this.currentRoute = null;

    // Simulation loop timer (runs at 10Hz, timegap = 0.1s)
    this.simTicker = null;
    this.clockTimer = null;
    this.isCyclePaused = false;

    // Posters (Real Citybus logic: Random Poster Selection 這是隨機放的)
    this.randomPosterMode = true; // 預設為隨機播放
    this.themeOverride = "auto"; // auto, cityflyer, ctb, nwfb, rickshaw
    this.currentPosterIndex = Math.floor(Math.random() * (MON2_DATA.posters ? MON2_DATA.posters.length : 21));
    this.Mon2_Now_Poster = (MON2_DATA.posters && MON2_DATA.posters[this.currentPosterIndex]) ? MON2_DATA.posters[this.currentPosterIndex].id : 1;

    this.initDOM();
    this.startClock();
    this.startScriptFSM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div id="mon2-frame" class="mon2-frame vertical theme-purple">
        <!-- Power Off Overlay -->
        <div id="screen-off" class="screen-layer hidden"></div>

        <!-- Standby / Blue Test Screen (Mon2_Standby_Mode / Display_Mode) -->
        <div id="screen-standby" class="screen-layer hidden">
          <div class="standby-content">
            <div class="standby-logo" id="standby-logo">
              <span class="brand-text">CITYBUS 城巴</span>
            </div>
            <div class="standby-title" id="standby-title">系統未入線</div>
            <div class="standby-en" id="standby-en">SYSTEM STANDBY</div>
            <div class="standby-clock" id="standby-clock">--:--:--</div>
            <div class="standby-msg" id="standby-msg">
              開車時間尚早 (距開車超過 10 分鐘)<br>
              請留意車長廣播及車頭路線牌
            </div>
            <div class="standby-qr-box">
              <div class="qr-mock"><div class="qr-pattern"></div></div>
              <div class="qr-text">
                <strong>下載城巴 App</strong><br>
                即時掌握全港巴士抵站時間
              </div>
            </div>
          </div>
        </div>

        <!-- Active Running Screen -->
        <div id="screen-run" class="screen-layer">
          <!-- Top Header Bar -->
          <header class="mon2-header" id="mon2-header">
            <div class="header-route-badge" id="route-badge">
              <span class="route-num" id="badge-route-num">780</span>
            </div>
            <div class="header-dest-box" id="header-dest-box">
              <div class="dest-zh-wrap">
                <span class="dest-prefix">往</span>
                <span class="dest-zh" id="dest-zh">中環碼頭</span>
              </div>
              <div class="dest-en" id="dest-en">to Central (Ferry Piers)</div>
            </div>

            <!-- Horizontal Screen Header Driver Card (Exact 2x2 Grid per user request) -->
            <div class="header-driver-box horizontal-only" id="header-driver-box">
              <div class="h-driver-grid" id="h-driver-grid">
                <div class="h-driver-cell-tl">
                  <span class="h-driver-name-zh" id="h-driver-name-zh">陳車長</span>
                  <span class="h-driver-name-en" id="h-driver-name-en">Bus Captain Chan</span>
                </div>
                <div class="h-driver-cell-tr">
                  <span class="h-id-label">員工編號 Staff No.</span>
                </div>
                <div class="h-driver-cell-bl">
                  <span class="h-motto-badge">為您服務 is serving you</span>
                </div>
                <div class="h-driver-cell-br">
                  <span class="h-id-num" id="h-driver-id">50179</span>
                </div>
              </div>
            </div>

            <div class="header-time-box">
              <div class="time-label-zh">現在時間</div>
              <div class="time-label-en">Time Now</div>
              <div class="time-value" id="header-clock">15:04</div>
            </div>
          </header>
          <!-- 顯示進度條 (Real-time Trip Progress Bar) -->
          <div class="mon2-trip-progress-bar-container">
            <div class="mon2-trip-progress-bar" id="mon2-trip-progress-bar" style="width: 5%;"></div>
          </div>

          <!-- Main Content Area containing Modes 1, 2, 3, 4, 5 -->
          <main class="mon2-main" id="mon2-main">
            <!-- MODE 1: 中文停靠三站 (LECIP_Mon2_Mode1 / Chinese) -->
            <section id="panel-mode-1" class="content-page active" style="display: flex;">
              <div class="trio-stops-container" id="zh-trio-stops"></div>
            </section>

            <!-- MODE 2: 英文停靠三站 (LECIP_Mon2_Mode1 / English) -->
            <section id="panel-mode-2" class="content-page hidden" style="display: none;">
              <div class="trio-stops-container" id="en-trio-stops"></div>
            </section>

            <!-- MODE 3: 分段收費 / 轉乘路線 (LECIP_Mon2_Mode3) -->
            <section id="panel-mode-3" class="content-page hidden" style="display: none;">
              <div class="mode3-content-wrapper" id="mode3-content-wrap"></div>
            </section>

            <!-- MODE 4: 電子海報輪播 (LECIP_Mon2_Mode4) -->
            <section id="panel-mode-4" class="content-page hidden" style="display: none;">
              <div class="poster-container" id="poster-container">
                <div class="poster-tag" id="poster-tag">零排放 綠色運輸 Mission Zero</div>
                <div class="poster-visual" id="poster-visual">
                  <div class="poster-icon-wrapper" id="poster-icon-wrapper"></div>
                </div>
                <h3 class="poster-title-zh" id="poster-title-zh">#MISSIONZERO 零排放 由此啟動</h3>
                <h4 class="poster-title-en" id="poster-title-en">Zero Emission Starts Here</h4>
                <p class="poster-desc-zh" id="poster-desc-zh">城巴首輛雙層電能巴士投入服務，引領香港邁向綠色公共交通新紀元。</p>
                <p class="poster-desc-en" id="poster-desc-en">Citybus launches Hong Kong's first double-decker electric bus for a greener future.</p>
                <div class="poster-dots" id="poster-dots"></div>
              </div>
            </section>

            <!-- MODE 5: 隨後十三站全覽總表 (LECIP_Mon2_Mode5 / AllStop) -->
            <section id="panel-mode-5" class="content-page hidden" style="display: none;">
              <div class="ladder-header-strip">
                <div class="ladder-header-title">隨後車站 Next stops</div>
                <div class="ladder-page-indicator" id="allstop-page-indicator">1/1</div>
              </div>
              <div class="ladder-wrapper">
                <div class="ladder-stops-list" id="allstop-stops-list"></div>
              </div>
            </section>


          </main>

          <!-- Bottom Footer Bar (Vertical Screen Reference) -->
          <footer class="mon2-footer" id="mon2-footer">
            <!-- Vertical Screen Driver Card (LECIP_Mon2_Driver_ID.png & LECIP_Mon2_No_Driver_ID.png) -->
            <div class="v-driver-card vertical-only" id="v-driver-card" title="點擊切換 車長資訊 / 路線資訊">
              <!-- When Driver Logged In: LECIP_Mon2_Driver_ID.png -->
              <div class="v-driver-content" id="v-driver-content">
                <div class="v-col v-col-captain">
                  <div class="v-captain-zh" id="v-captain-zh">陳車長</div>
                  <div class="v-captain-en" id="v-captain-en">Bus Captain Chan</div>
                </div>
                <div class="v-col v-col-id">
                  <div class="v-id-label">
                    <span class="zh">員工編號</span>
                    <span class="en">Staff No.</span>
                  </div>
                  <div class="v-id-num" id="v-id-num">50179</div>
                </div>
                <div class="v-col v-col-motto">
                  <div class="v-motto-zh">為您服務</div>
                  <div class="v-motto-en">is serving you</div>
                </div>
              </div>

              <!-- When Driver Hidden: LECIP_Mon2_No_Driver_ID.png -->
              <div class="v-driver-no-id-content hidden" id="v-driver-app" style="display: none;">
                <div class="no-id-text-wrap">
                  <div class="no-id-zh">請即下載新巴城巴App</div>
                  <div class="no-id-en">Download Citybus NWFB App</div>
                </div>
                <div class="no-id-qr">
                  <div class="qr-code-box-mini"></div>
                </div>
                <div class="v-col-route-info">
                  <div class="route-info-zh">路線資訊</div>
                  <div class="route-info-en">Route info</div>
                </div>
              </div>
            </div>

            <!-- Horizontal Footer -->
            <div class="h-footer-bar horizontal-only">
              <span class="h-footer-brand">CITYBUS 城巴</span>
              <span class="h-footer-eta-label">預計(分鐘) ETA(min)</span>
            </div>
          </footer>
        </div>
      </div>
    `;

    // Bind driver click toggle (Trigger: LECIP_Mon2_Driver_ID_button)
    const vCard = document.getElementById("v-driver-card");
    if (vCard) {
      vCard.addEventListener("click", () => this.triggerDriverIDButton());
    }

    const hCard = document.getElementById("header-driver-box");
    if (hCard) {
      hCard.addEventListener("click", () => this.triggerDriverIDButton());
    }

    this.applyConstfileConfigs();
    this.updateDriverDisplay();
  }

  // --- Trigger: LECIP_Mon2_Driver_ID_button ---
  triggerDriverIDButton() {
    this.Mon2_Driver_ID_Switch = this.Mon2_Driver_ID_Switch === 0 ? 1 : 0;
    this.updateDriverDisplay();
    if (window.ctbMon2 && window.ctbMon2.controller) {
      window.ctbMon2.controller.syncDriverCheckbox();
    }
  }

  setDriverProfile({ id, surnameZh, surnameEn, logged }) {
    if (id !== undefined) this.driverInfo.id = id;
    if (surnameZh !== undefined) this.driverInfo.surnameZh = surnameZh;
    if (surnameEn !== undefined) this.driverInfo.surnameEn = surnameEn;
    if (logged !== undefined) this.ddu_login = logged ? 1 : 0;
    this.updateDriverDisplay();
  }

  getDriverDisplayText() {
    const { id, surnameZh, surnameEn } = this.driverInfo;
    let zh = (surnameZh || "陳").trim();
    let en = (surnameEn || "Chan").trim();

    let titleZh = zh.endsWith("車長") ? zh : `${zh}車長`;
    let titleEn = en.toLowerCase().startsWith("bus captain") ? en : `Bus Captain ${en}`;
    const cleanId = (id || "50179").trim().replace(/^#/, "");

    return { titleZh, titleEn, idStr: cleanId };
  }

  updateDriverDisplay() {
    const vContent = document.getElementById("v-driver-content");
    const vApp = document.getElementById("v-driver-app");
    const vZh = document.getElementById("v-captain-zh");
    const vEn = document.getElementById("v-captain-en");
    const vId = document.getElementById("v-id-num");

    const hWrap = document.getElementById("h-driver-wrap");
    const hApp = document.getElementById("h-driver-app");
    const hZh = document.getElementById("h-driver-name-zh");
    const hEn = document.getElementById("h-driver-name-en");
    const hId = document.getElementById("h-driver-id");

    const { titleZh, titleEn, idStr } = this.getDriverDisplayText();
    const isShowingID = (this.ddu_login === 1 && this.Mon2_Driver_ID_Switch === 0);

    // 1. Vertical bottom bar update
    if (vContent && vApp) {
      if (!isShowingID) {
        vContent.style.setProperty("display", "none", "important");
        vApp.style.setProperty("display", "flex", "important");
        vContent.classList.add("hidden");
        vApp.classList.remove("hidden");
      } else {
        vContent.style.setProperty("display", "flex", "important");
        vApp.style.setProperty("display", "none", "important");
        vContent.classList.remove("hidden");
        vApp.classList.add("hidden");
        if (vZh) vZh.textContent = titleZh;
        if (vEn) vEn.textContent = titleEn;
        if (vId) vId.textContent = idStr;
      }
    }

    // 2. Horizontal header bar update
    if (hWrap && hApp) {
      if (!isShowingID) {
        hWrap.style.setProperty("display", "none", "important");
        hApp.style.setProperty("display", "flex", "important");
        hWrap.classList.add("hidden");
        hApp.classList.remove("hidden");
      } else {
        hWrap.style.setProperty("display", "flex", "important");
        hApp.style.setProperty("display", "none", "important");
        hWrap.classList.remove("hidden");
        hApp.classList.add("hidden");
        if (hZh) hZh.textContent = titleZh;
        if (hEn) hEn.textContent = titleEn;
        if (hId) hId.textContent = idStr;
      }
    }
  }

  // --- Clock updater (Time string as in Mon2.osc) ---
  startClock() {
    if (this.clockTimer) clearInterval(this.clockTimer);
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");

      const el = document.getElementById("header-clock");
      if (el) el.textContent = `${h}:${m}`;

      const stEl = document.getElementById("standby-clock");
      if (stEl) stEl.textContent = `${h}:${m}:${s}`;
    };
    updateTime();
    this.clockTimer = setInterval(updateTime, 1000);
  }

  // --- Start Script FSM Simulation Loop (100ms ticks = Timegap 0.1s) ---
  startScriptFSM() {
    if (this.simTicker) clearInterval(this.simTicker);
    const timegap = 0.1;

    this.simTicker = setInterval(() => {
      if (this.isCyclePaused || this.Mon2_Main === 0) return;
      this.stepFSM(timegap);
    }, 100);
  }

  // --- Macro: LECIP_mon2_frame & Mode Timers ---
  stepFSM(timegap) {
    if (!this.currentRoute) return;

    const totalStops = this.currentRoute.stops.length;
    // (L.L.telargo_realrouteindex) (M.V.GetBusstopCount) (L.L.telargo_busstop) - (S.L.Mon2_LeftStop)
    this.Mon2_LeftStop = Math.max(0, totalStops - (this.telargo_busstop - 1));

    // Page Total calculation from Mon2.osc:
    if (this.Mon2_LeftStop >= 25) {
      this.Mon2_Page_Totel = Math.floor((this.Mon2_LeftStop - 14) / 11) + 2;
    } else if (this.Mon2_LeftStop >= 14) {
      this.Mon2_Page_Totel = 2;
    } else {
      this.Mon2_Page_Totel = 1;
    }

    // Timer durations: 3s if Display_Mode == 1, 7s if Display_Mode == 0
    const stepTime = (this.Display_Mode === 1) ? 3.0 : 7.0;

    // Timer logic directly from Mon2.osc:
    if (this.Mon2_Standby_Mode === 1) {
      this.Mon2_Mode = 5;
      this.stepMode5(timegap, stepTime);
    } else {
      // Main Page timer
      if (this.Mon2_Mode === 1 || this.Mon2_Mode === 2 || this.Mon2_Mode === 3) {
        this.Mon2_Timer += timegap;
        if (this.Mon2_Timer >= 0 && this.Mon2_Timer <= stepTime) {
          this.Mon2_Mode = 1; // Chinese 3-Stop
        } else if (this.Mon2_Timer > stepTime && this.Mon2_Timer <= stepTime * 2) {
          this.Mon2_Mode = 2; // English 3-Stop
        } else if (this.Mon2_Timer > stepTime * 2 && this.Mon2_Timer <= stepTime * 3) {
          this.Mon2_Mode = 3; // Fare & Interchange
        } else {
          // Mode 3 finishes -> switch to Mode 5 as in Mon2.osc
          this.Mon2_Mode = 5;
          this.Mon2_Page_Timer = 0;
          this.Mon2_Page_Now = 1;
          const curIdx = Math.max(0, this.telargo_busstop - 1);
          this.renderMode5(curIdx);
        }
      } else if (this.Mon2_Mode === 4) {
        // Mode 4: Poster Mode (LECIP_Mon2_Mode4)
        this.stepMode4(timegap, stepTime);
      } else if (this.Mon2_Mode === 5) {
        // Mode 5: AllStop Mode (LECIP_Mon2_Mode5)
        this.stepMode5(timegap, stepTime);
      }
    }

    // Switch visible panel DOM based on Mon2_Mode
    this.updateActivePanel();

    // 更新行車進度條 (顯示進度條)
    if (this.currentRoute && this.currentRoute.stops && this.currentRoute.stops.length > 0) {
      const pBar = document.getElementById("mon2-trip-progress-bar");
      if (pBar) {
        const pct = Math.min(100, Math.round((this.telargo_busstop / this.currentRoute.stops.length) * 100));
        pBar.style.width = `${pct}%`;
      }
    }
  }

  // --- Macro: LECIP_Mon2_Mode4 (Poster Timer & Loop) ---
  stepMode4(timegap, stepTime) {
    this.Mon2_Poster_Timer += timegap;

    if (this.Mon2_Poster_Timer >= stepTime) {
      this.Mon2_Poster_Run = 1;
      this.Mon2_Mode = 5; // Transitions back to Mode 5 as in Mon2.osc!
      this.Mon2_Page_Timer = 0;
      this.Mon2_Last_Page_Timer = 0;
    }
  }

  // --- Macro: LECIP_Mon2_Mode5 (AllStop Pagination & Poster Trigger) ---
  stepMode5(timegap, stepTime) {
    this.Mon2_Page_Timer += timegap;

    if (this.Mon2_Page_Timer > stepTime) {
      if (this.Mon2_Page_Now >= this.Mon2_Page_Totel) {
        if (this.Mon2_Poster_Run === 0) {
          // Mon2.osc line 250: If Poster_Run == 0, go to Mode 4 (Poster)!
          this.Mon2_Poster_Timer = 0;
          this.Mon2_Poster_Add = 0;
          this.advancePosterIndex();
          this.Mon2_Mode = 4;
        } else {
          // Mon2.osc line 242: If Poster_Run == 1, wait 1.5s then reset Mon2_Timer = 0!
          this.Mon2_Last_Page_Timer += timegap;
          if (this.Mon2_Last_Page_Timer >= 1.5) {
            this.Mon2_Timer = 0;
            this.Mon2_Poster_Run = 0;
            this.Mon2_Page_Now = 1;
            this.Mon2_Mode = 1; // Restart cycle at Mode 1!
          }
        }
      } else {
        // Advance to next page of AllStop (如果多於13站 就再開一頁)
        this.Mon2_Page_Now += 1;
        this.Mon2_Page_Timer = 0;
        const curIdx = Math.max(0, this.telargo_busstop - 1);
        this.renderMode5(curIdx);
      }
    }

    // Update pagination string: Mon2_Page_Now_Total = Page_Now / Page_Totel
    const pageEl = document.getElementById("allstop-page-indicator");
    if (pageEl) {
      pageEl.textContent = `${this.Mon2_Page_Now}/${this.Mon2_Page_Totel}`;
    }
  }

  advancePosterIndex() {
    const maxPosters = (this.DirectionV === 1) ? this.Max_Poster_Number_V : this.Max_Poster_Number_H;
    const poolSize = Math.min(maxPosters, MON2_DATA.posters.length);

    if (this.randomPosterMode && poolSize > 1) {
      // 隨機放映（避免與上一張立即重複）
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * poolSize);
      } while (nextIdx === this.currentPosterIndex);

      this.currentPosterIndex = nextIdx;
      this.Mon2_Now_Poster = (MON2_DATA.posters[nextIdx] && MON2_DATA.posters[nextIdx].id) ? MON2_DATA.posters[nextIdx].id : (nextIdx + 1);
    } else {
      // 順序放映
      this.Mon2_Now_Poster += 1;
      if (this.Mon2_Now_Poster > poolSize) {
        this.Mon2_Now_Poster = 1;
      }
      this.currentPosterIndex = this.Mon2_Now_Poster - 1;
    }
    this.renderPoster();
  }

  // --- Switch visible DOM panel according to Mon2_Mode ---
  updateActivePanel() {
    const panels = {
      1: document.getElementById("panel-mode-1"),
      2: document.getElementById("panel-mode-2"),
      3: document.getElementById("panel-mode-3"),
      4: document.getElementById("panel-mode-4"),
      5: document.getElementById("panel-mode-5")
    };

    const frame = document.getElementById("mon2-frame");
    if (frame) {
      if (this.Mon2_Mode === 4) {
        frame.classList.add("in-mode-4-fullscreen");
      } else {
        frame.classList.remove("in-mode-4-fullscreen");
      }
    }

    for (const [m, el] of Object.entries(panels)) {
      if (!el) continue;
      const isActive = (parseInt(m, 10) === this.Mon2_Mode);
      if (isActive) {
        el.style.setProperty("display", "flex", "important");
        el.classList.remove("hidden");
        el.classList.add("active");
      } else {
        el.style.setProperty("display", "none", "important");
        el.classList.add("hidden");
        el.classList.remove("active");
      }
    }

    // Sync active pill on control console
    if (window.ctbMon2 && window.ctbMon2.controller) {
      window.ctbMon2.controller.updateModePills(this.Mon2_Mode);
    }
  }

  // --- Manual Mode jump via buttons ---
  setMode(modeNum) {
    this.Mon2_Mode = modeNum;
    if (modeNum === 1) this.Mon2_Timer = 0;
    else if (modeNum === 2) this.Mon2_Timer = (this.Display_Mode === 1 ? 3.1 : 7.1);
    else if (modeNum === 3) this.Mon2_Timer = (this.Display_Mode === 1 ? 6.1 : 14.1);
    else if (modeNum === 4) this.Mon2_Poster_Timer = 0;
    else if (modeNum === 5) this.Mon2_Page_Timer = 0;

    this.updateActivePanel();

    // 更新行車進度條 (顯示進度條)
    if (this.currentRoute && this.currentRoute.stops && this.currentRoute.stops.length > 0) {
      const pBar = document.getElementById("mon2-trip-progress-bar");
      if (pBar) {
        const pct = Math.min(100, Math.round((this.telargo_busstop / this.currentRoute.stops.length) * 100));
        pBar.style.width = `${pct}%`;
      }
    }
  }

  // --- Route & Stop Navigation ---
  setRoute(routeData, initialStopIndex = 0) {
    this.currentRoute = routeData;
    this.telargo_busstop = initialStopIndex + 1; // 1-based
    this.telargo_busarrivingstop = 0;
    this.Mon2_Timer = 0;
    this.Mon2_Poster_Run = 0;
    this.Mon2_Page_Now = 1;

    this.detectRouteTexMode();
    this.renderAllPanels();
  }

  setStopIndex(index, status = "next") {
    if (!this.currentRoute) return;
    this.telargo_busstop = Math.max(1, Math.min(index + 1, this.currentRoute.stops.length));
    this.telargo_busarrivingstop = (status === "arrived") ? 1 : 0;
    this.Mon2_Timer = 0;
    this.renderAllPanels();
  }

  nextStop() {
    if (!this.currentRoute) return false;
    if (this.telargo_busstop < this.currentRoute.stops.length) {
      this.telargo_busstop++;
      this.telargo_busarrivingstop = 0;
      this.Mon2_Timer = 0;
      this.renderAllPanels();
      return true;
    }
    return false;
  }

  prevStop() {
    if (!this.currentRoute) return false;
    if (this.telargo_busstop > 1) {
      this.telargo_busstop--;
      this.telargo_busarrivingstop = 1;
      this.Mon2_Timer = 0;
      this.renderAllPanels();
      return true;
    }
    return false;
  }

  arriveStop() {
    if (this.manualModeNoArrive) {
      this.telargo_busarrivingstop = 0; // 手動模式下嚴格不顯示「此站」
      return;
    }
    this.telargo_busarrivingstop = 1;
    this.Mon2_Timer = 0;
    this.renderAllPanels();
  }

  setThemeBase(theme) {
    this.themeOverride = theme;
    this.detectRouteTexMode();
  }

  // --- Route & Texture Mode Detection as in Mon2.osc lines 53-85 ---
  detectRouteTexMode() {
    if (!this.currentRoute) return;
    const r = this.currentRoute;
    const frame = document.getElementById("mon2-frame");
    const badge = document.getElementById("route-badge");
    if (!frame) return;

    frame.classList.remove("mode-cityflyer", "mode-ctb", "mode-nwfb", "mode-rickshaw");

    let targetTheme = this.themeOverride;
    if (targetTheme === "auto") {
      // 「只有A線跟cityFlyer 其他城巴普通路線排版」
      const isALine = (r.code || "").toUpperCase().startsWith("A");
      targetTheme = isALine ? "cityflyer" : "ctb";
    }

    if (targetTheme === "cityflyer") {
      this.Mon2_Tex_Mode = 1; // 城巴機場快線
      frame.classList.add("mode-cityflyer");
      if (badge) {
        badge.style.backgroundColor = "transparent";
        badge.style.color = "#FFFFFF";
      }
    } else {
      this.Mon2_Tex_Mode = 0; // 城巴普通路線
      frame.classList.add("mode-ctb");
      if (badge) {
        badge.style.backgroundColor = "#0022AA";
        badge.style.color = "#FFFFFF";
      }
    }
  }

  // --- Apply configurations from Mon2_constfile.txt ---
  applyConstfileConfigs() {
    this.setOrientation(this.DirectionV);
    this.setColorTheme(this.ColorP);
    this.setDisplayMode(this.Display_Mode);
  }

  setOrientation(directionV) {
    this.DirectionV = directionV;
    const frame = document.getElementById("mon2-frame");
    if (!frame) return;
    if (this.DirectionV === 1) {
      frame.classList.remove("horizontal");
      frame.classList.add("vertical");
    } else {
      frame.classList.remove("vertical");
      frame.classList.add("horizontal");
    }
  }

  setColorTheme(colorP) {
    this.ColorP = colorP;
    const frame = document.getElementById("mon2-frame");
    if (!frame) return;
    if (this.ColorP === 1) {
      frame.classList.remove("theme-grey");
      frame.classList.add("theme-purple");
    } else {
      frame.classList.remove("theme-purple");
      frame.classList.add("theme-grey");
    }
  }

  setDisplayMode(displayMode) {
    this.Display_Mode = displayMode;
    const frame = document.getElementById("mon2-frame");
    const titleEl = document.getElementById("standby-title");
    const msgEl = document.getElementById("standby-msg");

    if (!frame) return;

    if (this.Display_Mode === 1) {
      frame.classList.add("display-mode-blue");
      if (titleEl) titleEl.textContent = "【測試模式 DISPLAY MODE】";
      if (msgEl) msgEl.innerHTML = "專為測試及製作補檔使用<br>輪播時間縮短至 3 秒";
    } else {
      frame.classList.remove("display-mode-blue");
      if (titleEl) titleEl.textContent = "系統未入線";
      if (msgEl) msgEl.innerHTML = "開車時間尚早 (距開車超過 10 分鐘)<br>請留意車長廣播及車頭路線牌";
    }
  }

  setPower(powerState) {
    const offLayer = document.getElementById("screen-off");
    const standbyLayer = document.getElementById("screen-standby");
    const runLayer = document.getElementById("screen-run");

    if (!offLayer || !standbyLayer || !runLayer) return;

    offLayer.classList.add("hidden");
    standbyLayer.classList.add("hidden");
    runLayer.classList.add("hidden");

    if (powerState === "OFF") {
      this.Mon2_Main = 0;
      offLayer.classList.remove("hidden");
    } else if (powerState === "STANDBY" || this.telargo_mon_control === 1211) {
      this.Mon2_Main = 1;
      this.Mon2_Standby_Mode = 1;
      standbyLayer.classList.remove("hidden");
    } else {
      this.Mon2_Main = 1;
      this.Mon2_Standby_Mode = 0;
      runLayer.classList.remove("hidden");
      this.renderAllPanels();
    }
  }

  setDepartureTimer(minutes) {
    this.depTimerMinutes = minutes;
    if (minutes > 10) {
      this.telargo_mon_control = 1211; // Standby
      this.setPower("STANDBY");
    } else {
      this.telargo_mon_control = 11211; // In service
      this.setPower("RUN");
    }
  }

  // --- Render All Panel Contents ---
  renderAllPanels() {
    if (!this.currentRoute) return;

    const r = this.currentRoute;
    const curIdx = this.telargo_busstop - 1; // 0-based
    const stop = r.stops[curIdx];
    if (!stop) return;

    // Header updates
    const badgeNum = document.getElementById("badge-route-num");
    const destZh = document.getElementById("dest-zh");
    const destEn = document.getElementById("dest-en");
    if (badgeNum) {
      badgeNum.textContent = r.code;
      badgeNum.classList.remove("scale-four", "scale-three", "scale-normal");
      if (r.code.length >= 4) {
        badgeNum.classList.add("scale-four");
      } else if (r.code.length === 3) {
        badgeNum.classList.add("scale-three");
      } else {
        badgeNum.classList.add("scale-normal");
      }
    }
        // Clean up "(經港珠澳大橋香港口岸)" per user request ("no need show (經港珠澳大橋香港口岸)")
    const cleanDestZh = (r.dest.zh || "").replace(/[\(（]經港珠澳大橋.*?[\)）]/g, "").trim();
    const cleanDestEn = (r.dest.en || "").replace(/[\(（]via HZMB.*?[\)）]/gi, "").trim();

    if (destZh) {
      destZh.textContent = cleanDestZh;
      // Auto scale font size based on destination text length so it NEVER truncates with ...
      if (cleanDestZh.length > 12) {
        destZh.style.fontSize = "15px";
        destZh.style.letterSpacing = "-0.02em";
      } else if (cleanDestZh.length > 8) {
        destZh.style.fontSize = "18px";
        destZh.style.letterSpacing = "-0.01em";
      } else {
        destZh.style.fontSize = "22px";
        destZh.style.letterSpacing = "normal";
      }
    }
    if (destEn) {
      destEn.textContent = `to ${cleanDestEn}`;
      if (cleanDestEn.length > 25) {
        destEn.style.fontSize = "11px";
        destEn.style.lineHeight = "1.1";
      } else {
        destEn.style.fontSize = "12.5px";
        destEn.style.lineHeight = "1.15";
      }
    }

    // Subheader Callout updates
    const isArrived = this.telargo_busarrivingstop === 1;
    const zhCallout = document.getElementById("zh-status-text");
    const enCallout = document.getElementById("en-status-text");
    const biCallout = document.getElementById("bi-status-text");

    if (zhCallout) zhCallout.textContent = isArrived ? "此站" : "下一站";
    if (enCallout) enCallout.textContent = isArrived ? "This stop" : "Next stop";
    if (biCallout) biCallout.textContent = isArrived ? "此站 This stop" : "下一站 Next stop";

    // 1. Render Mode 1 (Chinese 3-Stop)
    this.renderChineseTrioStops(curIdx);

    // 2. Render Mode 2 (English 3-Stop)
    this.renderEnglishTrioStops(curIdx);

    // 3. Render Mode 3 (Fare / Interchange)
    this.renderMode3(stop);

    // 4. Render Mode 4 (Poster)
    this.renderPoster();

    // 5. Render Mode 5 (AllStop / 13-Stop Ladder)
    this.renderMode5(curIdx);

// Terminus card removed per user request

    this.updateDriverDisplay();
    this.updateActivePanel();

    // 更新行車進度條 (顯示進度條)
    if (this.currentRoute && this.currentRoute.stops && this.currentRoute.stops.length > 0) {
      const pBar = document.getElementById("mon2-trip-progress-bar");
      if (pBar) {
        const pct = Math.min(100, Math.round((this.telargo_busstop / this.currentRoute.stops.length) * 100));
        pBar.style.width = `${pct}%`;
      }
    }
  }

  renderChineseTrioStops(curIdx) {
    const container = document.getElementById("zh-trio-stops");
    if (!container || !this.currentRoute) return;

    const stops = this.currentRoute.stops;
    const leftStop = Math.max(1, stops.length - curIdx);
    const nCircles = Math.min(3, leftStop);
    const trio = stops.slice(curIdx, curIdx + nCircles);
    const isArrow4 = (leftStop >= 4);
    const isArrived = !this.manualModeNoArrive && (this.telargo_busarrivingstop === 1);

    // Track header cell (orange chevron aligning with subheader row)
    let trackHtml = `
      <div class="track-subheader-cell">
        <div class="track-bar-chevron"></div>
      </div>
    `;

    // Subheader row
    let rowsHtml = `
      <div class="trio-subheader-row">
        <div class="trio-subheader-title ${isArrived ? 'title-arrived' : 'title-next'}">
          ${isArrived ? "此站" : "下一站"}
        </div>
        <div class="trio-subheader-eta">
          ${isArrived ? "" : "預計"}
        </div>
      </div>
    `;

    for (let idx = 0; idx < nCircles; idx++) {
      const s = trio[idx];
      const isFirst = (idx === 0);
      const isLast = (idx === nCircles - 1);
      let etaMins = (idx * 2) + 2;

      // Chevron between rows (sits at bottom of cell, except for last cell)
      let chevronHtml = "";
      if (!isLast) {
        chevronHtml = `
          <div class="track-white-chevron">
            <svg viewBox="0 0 24 14" width="22" height="12">
              <path d="M2 2 L12 11 L22 2" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        `;
      } else if (isArrow4) {
        // Pointed arrow at bottom of last cell if more stops ahead
        chevronHtml = `<div class="track-bar-point-bottom"></div>`;
      }

      // Track row cell: vertically aligns circle to station row midpoint!
      trackHtml += `
        <div class="track-row-cell">
          <div class="${isFirst ? (isArrived ? 'track-circle-arrived-green' : 'track-circle-active') : 'track-circle-upcoming'}">
            ${s.num}
          </div>
          ${chevronHtml}
        </div>
      `;

      // Right-side ETA: 「此站」不顯示在分鐘行，分鐘數字為黑色！
      let etaColHtml = "";
      if (isFirst && isArrived) {
        etaColHtml = `<span class="eta-big">&lt;1</span><span class="eta-unit-text">分鐘</span>`;
      } else {
        etaColHtml = `<span class="eta-big">${etaMins}</span><span class="eta-unit-text">分鐘</span>`;
      }

      rowsHtml += `
        <div class="trio-row-item ${isFirst ? 'row-active' : ''}">
          <div class="trio-name-col">
            <div class="trio-main-name" style="${s.zh.length > 10 ? 'font-size: 22px; line-height: 1.15;' : (s.zh.length > 6 ? 'font-size: 26px; line-height: 1.15;' : 'font-size: 32px; line-height: 1.15;')}">${this.cleanStopName(s.zh)} </div>
            ${s.subZh || (s.landmarks && s.landmarks[0]) ? `<div class="trio-sub-text">${s.subZh || s.landmarks[0]}</div>` : ''}
          </div>
          <div class="trio-eta-col">
            ${etaColHtml}
          </div>
        </div>
      `;
    }

    const arrowClass = isArrow4 ? "arrow-pointed" : "arrow-rounded";

    container.innerHTML = `
      <div class="trio-layout-wrapper">
        <div class="route-nav-track-col ${arrowClass}">
          ${trackHtml}
        </div>
        <div class="trio-content-col">
          ${rowsHtml}
        </div>
      </div>
    `;
  }

  renderEnglishTrioStops(curIdx) {
    const container = document.getElementById("en-trio-stops");
    if (!container || !this.currentRoute) return;

    const stops = this.currentRoute.stops;
    const leftStop = Math.max(1, stops.length - curIdx);
    const nCircles = Math.min(3, leftStop);
    const trio = stops.slice(curIdx, curIdx + nCircles);
    const isArrow4 = (leftStop >= 4);
    const isArrived = !this.manualModeNoArrive && (this.telargo_busarrivingstop === 1);

    // Track header cell (orange chevron aligning with subheader row)
    let trackHtml = `
      <div class="track-subheader-cell">
        <div class="track-bar-chevron"></div>
      </div>
    `;

    // Subheader row: "Est. change to ETA" per user request!
    let rowsHtml = `
      <div class="trio-subheader-row">
        <div class="trio-subheader-title ${isArrived ? 'title-arrived' : 'title-next'}">
          ${isArrived ? "This stop" : "Next stop"}
        </div>
        <div class="trio-subheader-eta">
          ${isArrived ? "" : "ETA"}
        </div>
      </div>
    `;

    for (let idx = 0; idx < nCircles; idx++) {
      const s = trio[idx];
      const isFirst = (idx === 0);
      const isLast = (idx === nCircles - 1);
      let etaMins = (idx * 2) + 2;

      let chevronHtml = "";
      if (!isLast) {
        chevronHtml = `
          <div class="track-white-chevron">
            <svg viewBox="0 0 24 14" width="22" height="12">
              <path d="M2 2 L12 11 L22 2" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        `;
      } else if (isArrow4) {
        chevronHtml = `<div class="track-bar-point-bottom"></div>`;
      }

      trackHtml += `
        <div class="track-row-cell">
          <div class="${isFirst ? (isArrived ? 'track-circle-arrived-green' : 'track-circle-active') : 'track-circle-upcoming'}">
            ${s.num}
          </div>
          ${chevronHtml}
        </div>
      `;

      let etaColHtml = "";
      if (isFirst && isArrived) {
        etaColHtml = `<span class="eta-big">&lt;1</span><span class="eta-unit-text">min</span>`;
      } else {
        etaColHtml = `<span class="eta-big">${etaMins}</span><span class="eta-unit-text">min</span>`;
      }

      rowsHtml += `
        <div class="trio-row-item ${isFirst ? 'row-active' : ''}">
          <div class="trio-name-col">
            <div class="trio-main-name" style="${s.en.length > 25 ? 'font-size: 14px; line-height: 1.15;' : (s.en.length > 18 ? 'font-size: 17px; line-height: 1.15;' : 'font-size: 21px; line-height: 1.15;')}">${this.cleanStopName(s.en)} </div>
            ${s.subEn ? `<div class="trio-sub-text">${s.subEn}</div>` : ''}
          </div>
          <div class="trio-eta-col">
            ${etaColHtml}
          </div>
        </div>
      `;
    }

    const arrowClass = isArrow4 ? "arrow-pointed" : "arrow-rounded";

    container.innerHTML = `
      <div class="trio-layout-wrapper">
        <div class="route-nav-track-col ${arrowClass}">
          ${trackHtml}
        </div>
        <div class="trio-content-col">
          ${rowsHtml}
        </div>
      </div>
    `;
  }
  renderMode3(stop) {
    const wrap = document.getElementById("mode3-content-wrap");
    const titleZh = document.getElementById("mode3-title-zh");
    const titleEn = document.getElementById("mode3-title-en");
    const pageNum = document.getElementById("mode3-page-num");
    if (!wrap) return;

    wrap.innerHTML = "";
    const leftStop = Math.max(1, (this.currentRoute ? this.currentRoute.stops.length : 1) - (this.telargo_busstop - 1));
    const isArrived = !this.manualModeNoArrive && (this.telargo_busarrivingstop === 1);

    // If stop has interchange routes -> Render Interchange Table
    const isTransferStation = /轉乘|轉車|收費廣場|BBI|Interchange/i.test(stop.zh) || /Interchange|BBI|Toll Plaza/i.test(stop.en);
    // 「轉乘路線頁面只適用於 轉乘站」
    if (isTransferStation && stop.interchanges && stop.interchanges.length > 0) {
      if (titleZh) titleZh.textContent = "轉乘路線";
      if (titleEn) titleEn.textContent = "Interchange routes";
      if (pageNum) pageNum.textContent = "1/1";

      let tableHtml = `
        <div class="mode3-fare-base interchange-style">
          <div class="fare-black-header">
            <div class="col-route">路線<br><small>Route</small></div>
            <div class="col-direction">方向<br><small>Direction</small></div>
            <div class="col-fare-eta" style="text-align: right;">抵站時間<br><small>ETA</small></div>
          </div>
          <div class="fare-stage-list">
      `;
      stop.interchanges.forEach(ic => {
        tableHtml += `
          <div class="fare-stage-row">
            <div class="col-route"><span class="ic-route-badge">${ic.route}</span></div>
            <div class="col-direction">
              <div class="ic-dest-zh">${ic.destZh}</div>
              <div class="ic-dest-en">${ic.destEn}</div>
            </div>
            <div class="col-fare-eta" style="text-align: right;">
              <strong class="ic-eta-val">${ic.eta}</strong> <span class="ic-eta-unit">分鐘 min</span>
            </div>
          </div>
        `;
      });
      tableHtml += `
          </div>
          <div class="fare-bottom-notice">
            <div class="notice-text">
              車費優惠與巴士轉乘計劃詳情，請參閱新巴城巴網頁<br>
              <small>Please refer to Citybus NWFB website for fare concession and Bus-Bus Interchange details.</small>
            </div>
            <div class="notice-qr">
              <div class="qr-code-box"></div>
            </div>
          </div>
        </div>
      `;
      wrap.innerHTML = tableHtml;
    } else {
      // BASE CASE: Authentic Split Screen Mode 3 as in real photo 6ff992a6.png!
      // Top Half: Next stop indicator with track and ETA (<1 min)
      // Bottom Half: Fare Information table with section fares
      if (titleZh) titleZh.textContent = "車費資料";
      if (titleEn) titleEn.textContent = "Fare information";
      if (pageNum) pageNum.textContent = "1/1";

      const fareStages = this.getSectionFareStages();

      let tableHtml = `
        <div class="mode3-split-card">
          <!-- Top Next Stop Box: Circle adjacent to station name ("車站編號位置要貼合車站名稱 車站名稱加大") -->
          <div class="mode3-top-stop-banner">
            <!-- Left Navigation Track Line in Mode 3 ("Losted line" -> RESTORED) -->
            <div class="route-nav-track-col arrow-pointed mode3-nav-track">
              <div class="track-subheader-cell"><div class="track-bar-chevron"></div></div>
              <div class="track-row-cell">
                <div class="${isArrived ? 'track-circle-arrived-green' : 'track-circle-active'}">${stop.num}</div>
                <div class="track-bar-point-bottom"></div>
              </div>
            </div>

            <!-- Right Content of Top Banner -->
            <div class="mode3-stop-content">
              <div class="mode3-stop-header-row">
                <div class="mode3-status-label">${isArrived ? "此站 This stop" : "下一站 Next stop"}</div>
                <div class="mode3-eta-label">
                  <div class="eta-icon-title">預計<br>ETA</div>
                  <div class="eta-value-box">&lt;1</div>
                  <div class="eta-unit-box">分鐘<br>min</div>
                </div>
              </div>
              <div class="mode3-station-name-row align-top">
                <div class="m3-zh autofit-text">${this.cleanStopName(stop.zh)}</div>
                <div class="m3-en autofit-text">${this.cleanStopName(stop.en)}</div>
              </div>
            </div>
          </div>

          <!-- Bottom Fare Information Box (as in photo 6ff992a6.png) -->
          <div class="mode3-fare-base">
            <div class="section-title-bar">
              <span class="bar-zh">車費資料</span>
              <span class="bar-en">Fare information</span>
              <span class="page-indicator">1/1</span>
            </div>

            <!-- Black Header (由下列巴士站起 / 成人車費) -->
            <div class="fare-black-header">
              <div class="header-left">
                <div class="zh">由下列巴士站起</div>
                <div class="en">Beginning from bus stop below</div>
              </div>
              <div class="header-right">
                <div class="zh">成人車費</div>
                <div class="en">Adult Fare</div>
              </div>
            </div>

            <!-- Stage List -->
            <div class="fare-stage-list">
      `;

      fareStages.forEach((stage, idx) => {
        tableHtml += `
          <div class="fare-stage-row ${idx % 2 === 0 ? 'fare-row-even' : 'fare-row-odd'}">
            <div class="stage-name-col">
              <div class="stage-zh">${this.cleanStopName(stage.zh)}</div>
              <div class="stage-en">${this.cleanStopName(stage.en)}</div>
            </div>
            <div class="stage-price-col">
              <span class="price-val">${stage.fare}</span>
            </div>
          </div>
        `;
      });

      tableHtml += `
            </div>

            <!-- Bottom Notice with QR code as in photo 6ff992a6.png -->
            <div class="fare-bottom-notice">
              <div class="notice-text">
                車費優惠與巴士轉乘計劃詳情，請參閱城巴網頁<br>
                <small>Please refer to Citybus website for fare concession and Bus-Bus Interchange details.</small>
              </div>
              <div class="notice-qr">
                <div class="qr-code-box"></div>
              </div>
            </div>
          </div>
        </div>
      `;

      wrap.innerHTML = tableHtml;
    }
  }
  getSectionFareStages() {
    if (!this.currentRoute) return [{ zh: "由起點站起", en: "From First Stop", fare: "$7.7" }];

    const r = this.currentRoute;
    const code = (r.code || "").toUpperCase();
    const stops = r.stops || [];
    const firstStop = stops[0] || { zh: "總站", en: "Terminus" };
    const stages = [];

    // Accurate Citybus Fare Table by Route Code
    const FARE_TABLE = {
      "H3": { full: "$41.8", stages: [{ match: "香港摩天輪", fare: "$41.8" }, { match: "赤柱", fare: "$19.8" }] },
      "H1": { full: "$41.8", stages: [{ match: "中環", fare: "$41.8" }, { match: "尖沙咀", fare: "$19.8" }] },
      "H2": { full: "$41.8", stages: [{ match: "中環", fare: "$41.8" }, { match: "尖沙咀", fare: "$19.8" }] },
      "A10": { full: "$49.7", stages: [{ match: "青嶼幹線", fare: "$17.8" }, { match: "西區海底隧道", fare: "$41.8" }] },
      "A11": { full: "$41.9", stages: [{ match: "青嶼幹線", fare: "$17.8" }] },
      "A12": { full: "$47.1", stages: [{ match: "青嶼幹線", fare: "$17.8" }, { match: "西區海底隧道", fare: "$41.8" }] },
      "A21": { full: "$34.6", stages: [{ match: "青嶼幹線", fare: "$17.8" }] },
      "A22": { full: "$41.9", stages: [{ match: "青嶼幹線", fare: "$17.8" }] },
      "A29": { full: "$44.0", stages: [{ match: "青嶼幹線", fare: "$17.8" }] },
      "NA10": { full: "$60.7", stages: [{ match: "青嶼幹線", fare: "$40.2" }] },
      "NA11": { full: "$54.4", stages: [{ match: "青嶼幹線", fare: "$40.2" }] },
      "NA12": { full: "$60.7", stages: [{ match: "青嶼幹線", fare: "$40.2" }] },
      "NA21": { full: "$40.2", stages: [] },
      "NA29": { full: "$54.4", stages: [{ match: "青嶼幹線", fare: "$40.2" }] },
      "E11": { full: "$22.4", stages: [{ match: "西區海底隧道", fare: "$14.8" }, { match: "東涌", fare: "$4.0" }] },
      "E11A": { full: "$22.4", stages: [{ match: "西區海底隧道", fare: "$14.8" }, { match: "東涌", fare: "$4.0" }] },
      "E21": { full: "$14.9", stages: [{ match: "青馬", fare: "$8.2" }, { match: "東涌", fare: "$4.0" }] },
      "E22": { full: "$18.9", stages: [{ match: "青嶼幹線", fare: "$8.2" }, { match: "東涌", fare: "$4.0" }] },
      "E23": { full: "$18.9", stages: [{ match: "青嶼幹線", fare: "$8.2" }, { match: "東涌", fare: "$4.0" }] },
      "720": { full: "$8.7", stages: [{ match: "國際調解院", fare: "$5.5" }] },
      "933": { full: "$20.8", stages: [{ match: "西區海底隧道", fare: "$13.1" }, { match: "琴行街", fare: "$5.6" }] },
      "A26": { full: "$44.0", stages: [{ match: "青嶼幹線", fare: "$30.3" }, { match: "畢架山花園", fare: "$13.6" }, { match: "黃大仙站", fare: "$10.5" }, { match: "秀茂坪", fare: "$6.8" }] },
      "H3": { full: "$19.8", stages: [] },
      "914": { full: "$11.4", stages: [{ match: "西區海底隧道", fare: "$6.9" }] },
      "905": { full: "$11.4", stages: [{ match: "西區海底隧道", fare: "$6.9" }] },
      "930": { full: "$19.8", stages: [{ match: "西區海底隧道", fare: "$10.4" }] },
      "930X": { full: "$19.8", stages: [{ match: "西區海底隧道", fare: "$10.4" }] },
      "102": { full: "$11.4", stages: [{ match: "海底隧道", fare: "$6.9" }] },
      "106": { full: "$11.4", stages: [{ match: "海底隧道", fare: "$6.9" }] },
      "118": { full: "$11.4", stages: [{ match: "海底隧道", fare: "$6.9" }] },
      "780": { full: "$7.7", stages: [{ match: "舊灣仔警署", fare: "$4.4" }, { match: "分域街", fare: "$4.4" }] },
      "788": { full: "$7.7", stages: [{ match: "舊灣仔警署", fare: "$4.4" }] },
      "8P": { full: "$7.0", stages: [{ match: "興發街", fare: "$4.8" }] },
      "702": { full: "$4.4", stages: [] },
      "20": { full: "$5.6", stages: [] },
      "1": { full: "$4.8", stages: [] },
      "1P": { full: "$4.8", stages: [] },
      "2": { full: "$4.8", stages: [] },
      "H3": { full: "$41.8", stages: [{ match: "赤柱", fare: "$19.8" }, { match: "淺水灣", fare: "$30.8" }] },
      "H1": { full: "$41.8", stages: [{ match: "尖沙咀", fare: "$19.8" }] },
      "H2": { full: "$41.8", stages: [{ match: "中環", fare: "$19.8" }] },
      "A17": { full: "$45.0", stages: [{ match: "青嶼幹線", fare: "$17.8" }] },
      "H3": { full: "$19.8", stages: [{ match: "赤柱", fare: "$19.8" }] },
      "H2": { full: "$19.8", stages: [] },
      "H3": { full: "$47.6", stages: [{ match: "中環", fare: "$47.6" }, { match: "金鐘", fare: "$47.6" }] },
      "H3": { full: "$19.8", stages: [{ match: "赤柱", fare: "$19.8" }] },
      "720": { full: "$8.7", stages: [{ match: "國際調解院", fare: "$5.5" }] },
      "H3": { full: "$41.8", stages: [] },
      "77": { full: "$9.6", stages: [{ match: "模範邨", fare: "$4.6" }, { match: "琴行街", fare: "$4.6" }] },
      "11": { full: "$8.6", stages: [{ match: "灣仔", fare: "$5.6" }] },
      "H3": { full: "$41.8", stages: [] },
      "H4": { full: "$41.8", stages: [] },
      "971": { full: "$13.1", stages: [{ match: "西區海底隧道", fare: "$7.7" }, { match: "薄扶林", fare: "$5.6" }] }
    };

    const cleanRouteCode = code.replace(/[^A-Z0-9]/g, "");
    let config = FARE_TABLE[cleanRouteCode] || FARE_TABLE[code];
    if (!config && cleanRouteCode.startsWith("H")) {
      config = { full: "$41.8", stages: [{ match: "赤柱", fare: "$19.8" }, { match: "淺水灣", fare: "$30.8" }] };
    }
    if (!config) {
      if (code.startsWith("A")) {
        config = { full: "$41.9", stages: [{ match: "青嶼幹線", fare: "$17.8" }] };
      } else if (code.startsWith("NA")) {
        config = { full: "$54.4", stages: [{ match: "青嶼幹線", fare: "$40.2" }] };
      } else if (code.startsWith("E")) {
        config = { full: "$18.9", stages: [{ match: "東涌", fare: "$4.0" }] };
      } else if (code.startsWith("9") || code.startsWith("1") || code.startsWith("6")) {
        config = { full: "$11.4", stages: [{ match: "隧道", fare: "$6.9" }] };
      } else if (code.startsWith("H")) {
        config = { full: "$19.8", stages: [{ match: "中環", fare: "$19.8" }] };
      } else if (code.startsWith("7")) {
        config = { full: "$7.7", stages: [{ match: "灣仔", fare: "$4.4" }] };
      } else {
        config = { full: "$6.5", stages: [] };
      }
    }

    // Stage 1: Origin / Full Fare
    stages.push({
      zh: firstStop.zh,
      en: firstStop.en,
      fare: config.full
    });

    // Find section stages matching stop landmarks or intermediate position
    if (config.stages && config.stages.length > 0) {
      config.stages.forEach(sec => {
        const found = stops.find(s => (s.zh && s.zh.includes(sec.match)) || (s.subZh && s.subZh.includes(sec.match)));
        if (found && found !== firstStop) {
          stages.push({ zh: found.zh, en: found.en, fare: sec.fare });
        }
      });
    }

    // If no landmark matched but long route (>12 stops), provide typical mid-way section
    if (stages.length === 1 && stops.length >= 12) {
      const midIdx = Math.floor(stops.length * 0.55);
      const midStop = stops[midIdx];
      const baseNum = parseFloat(config.full.replace(/[^0-9.]/g, ""));
      const discount = code.startsWith("A") ? "$17.8" : `$${(baseNum * 0.6).toFixed(1)}`;
      stages.push({ zh: midStop.zh, en: midStop.en, fare: discount });
    }

    return stages;
  }

  renderMode5(curIdx) {
    const listEl = document.getElementById("allstop-stops-list");
    if (!listEl || !this.currentRoute) return;

    const stops = this.currentRoute.stops;
    const totalStops = stops.length;
    const isArrived = !this.manualModeNoArrive && (this.telargo_busarrivingstop === 1);

    // Stops per page: 13 stops
    const STOPS_PER_PAGE = 13;
    if (totalStops <= STOPS_PER_PAGE) {
      this.Mon2_Page_Totel = 1;
    } else {
      this.Mon2_Page_Totel = 1 + Math.ceil((totalStops - STOPS_PER_PAGE) / 12);
    }

    if (this.Mon2_Page_Now > this.Mon2_Page_Totel) {
      this.Mon2_Page_Now = this.Mon2_Page_Totel;
    }

    const headerTitleEl = document.querySelector(".ladder-header-title");
    if (headerTitleEl) {
      headerTitleEl.textContent = isArrived ? "此站 This stop" : "下一站 Next stop";
    }

    const pageEl = document.getElementById("allstop-page-indicator");
    if (pageEl) {
      pageEl.textContent = `${this.Mon2_Page_Now}/${this.Mon2_Page_Totel} ⏱`;
    }

    const isPageOne = (this.Mon2_Page_Now === 1);
    let trackHtml = `<div class="track-bar-chevron"></div>`;
    let rowsHtml = "";

    if (isPageOne) {
      // PAGE 1: Up to 13 stops
      const pageList = stops.slice(0, STOPS_PER_PAGE);

      pageList.forEach((s, idx) => {
        const isCurrent = (idx === curIdx);
        const isYellow = (idx % 2 === 0);
        let minsDiff = (idx - curIdx) * 2;
        let minsHtml = "";

        if (idx < curIdx) {
          minsHtml = "";
        } else if (idx === curIdx) {
          minsHtml = isArrived ? "" : `<span class="eta-val-num">&lt;1</span>`;
        } else {
          minsHtml = `<span class="eta-val-num">${minsDiff}</span>`;
        }

        // 「車站號碼圓形框底色: 下一站 紅色, 此站 綠色」
        let circleClass = "track-circle-upcoming";
        if (isCurrent) {
          circleClass = isArrived ? "track-circle-arrived-green" : "track-circle-active";
        }

        trackHtml += `
          <div class="ladder-track-cell">
            <div class="${circleClass}">
              ${s.num}
            </div>
          </div>
        `;

        rowsHtml += `
          <div class="ladder-name-row ${isYellow ? 'row-yellow' : 'row-white'} ${isCurrent ? 'row-current' : ''}">
            <div class="ladder-names-cell">
              <div class="ladder-zh-col ${s.zh.length > 8 ? 'text-shrink' : ''}">${this.cleanStopName(s.zh)}</div>
              <div class="ladder-en-col ${s.en.length > 18 ? 'text-shrink' : ''}">${this.cleanStopName(s.en)}</div>
            </div>
            <div class="ladder-eta-col">
              ${minsHtml}
            </div>
          </div>
        `;
      });

      listEl.innerHTML = `
        <div class="ladder-layout-wrapper">
          <div class="ladder-nav-track-col arrow-rounded">
            ${trackHtml}
          </div>
          <div class="ladder-rows-col">
            ${rowsHtml}
            <div class="ladder-eta-footer-label">
              <span>預計(分鐘) ETA(min)</span>
            </div>
          </div>
        </div>
      `;
    } else {
      // PAGE 2+: Origin stop + 3 dots + subsequent stops (Strict 1-to-1 matching, no extra circles!)
      const firstStop = stops[0] || { num: 1, zh: "起點站", en: "Origin" };
      const startIdx = STOPS_PER_PAGE + (this.Mon2_Page_Now - 2) * 12;
      const pageList = stops.slice(startIdx, startIdx + 12);

      // Row 1: Origin Stop
      trackHtml += `
        <div class="ladder-track-cell">
          <div class="track-circle-upcoming">
            ${firstStop.num}
          </div>
        </div>
      `;
      rowsHtml += `
        <div class="ladder-name-row row-yellow">
          <div class="ladder-names-cell">
            <div class="ladder-zh-col ${firstStop.zh.length > 8 ? 'text-shrink' : ''}">${this.cleanStopName(firstStop.zh)}</div>
            <div class="ladder-en-col ${firstStop.en.length > 18 ? 'text-shrink' : ''}">${this.cleanStopName(firstStop.en)}</div>
          </div>
          <div class="ladder-eta-col"></div>
        </div>
      `;

      // 3 Dots spacer in Track + Spacer row in Names
      trackHtml += `
        <div class="ladder-track-cell ladder-dots-cell">
          <div class="track-dots-group">
            <span class="track-dot"></span>
            <span class="track-dot"></span>
            <span class="track-dot"></span>
          </div>
        </div>
      `;
      rowsHtml += `
        <div class="ladder-name-row row-dots-spacer">
          <div class="ladder-names-cell"></div>
          <div class="ladder-eta-col"></div>
        </div>
      `;

      pageList.forEach((s, idx) => {
        const globalIdx = startIdx + idx;
        const isCurrent = (globalIdx === curIdx);
        const isYellow = ((idx + 1) % 2 === 0);
        let minsDiff = (globalIdx - curIdx) * 2;
        let minsHtml = "";

        if (globalIdx < curIdx) {
          minsHtml = "";
        } else if (globalIdx === curIdx) {
          minsHtml = isArrived ? "" : `<span class="eta-val-num">&lt;1</span>`;
        } else {
          minsHtml = `<span class="eta-val-num">${minsDiff}</span>`;
        }

        let circleClass = "track-circle-upcoming";
        if (isCurrent) {
          circleClass = isArrived ? "track-circle-arrived-green" : "track-circle-active";
        }

        trackHtml += `
          <div class="ladder-track-cell">
            <div class="${circleClass}">
              ${s.num}
            </div>
          </div>
        `;

        rowsHtml += `
          <div class="ladder-name-row ${isYellow ? 'row-yellow' : 'row-white'} ${isCurrent ? 'row-current' : ''}">
            <div class="ladder-names-cell">
              <div class="ladder-zh-col ${s.zh.length > 8 ? 'text-shrink' : ''}">${this.cleanStopName(s.zh)}</div>
              <div class="ladder-en-col ${s.en.length > 18 ? 'text-shrink' : ''}">${this.cleanStopName(s.en)}</div>
            </div>
            <div class="ladder-eta-col">
              ${minsHtml}
            </div>
          </div>
        `;
      });

      const isFinalPage = (this.Mon2_Page_Now === this.Mon2_Page_Totel);
      listEl.innerHTML = `
        <div class="ladder-layout-wrapper">
          <div class="ladder-nav-track-col ${isFinalPage ? 'arrow-rounded' : 'arrow-pointed'}">
            ${trackHtml}
          </div>
          <div class="ladder-rows-col">
            ${rowsHtml}
            <div class="ladder-eta-footer-label">
              <span>預計(分鐘) ETA(min)</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  setTargetDistance(meters) {
    this.targetDistanceMeters = meters;
    const badgeZh = document.getElementById("hud-target-dist-zh");
    if (badgeZh) badgeZh.textContent = `距 ${meters}m`;
    const badgeEn = document.getElementById("hud-target-dist-en");
    if (badgeEn) badgeEn.textContent = `${meters}m`;
  }

  // --- Mode 4: 讀取專案中“pomo” folder 的圖片 隨機播放其中一張 全屏播放 ---
  renderPoster() {
    const container = document.getElementById("poster-container");
    if (!container) return;

    const pomoImages = [
      "pomo/pomo1.png",
      "pomo/pomo2.png",
      "pomo/pomo3.png",
      "pomo/pomo4.png",
      "pomo/pomo5.png"
    ];

    if (this.customPomoList && this.customPomoList.length > 0) {
      pomoImages.push(...this.customPomoList);
    }

    const rndIdx = Math.floor(Math.random() * pomoImages.length);
    const chosenPomo = pomoImages[rndIdx];

    container.innerHTML = `
      <div class="poster-fullscreen-layer">
        <img class="pomo-fullscreen-img" src="${chosenPomo}" alt="Citybus Promo Poster">
      </div>
    `;
  }

  getPosterHTML(p) {
    const bulletsHtml = (p.bullets && p.bullets.length > 0)
      ? `<div class="poster-bullets-box">${p.bullets.map(b => `<div class="bullet-row"><span class="bullet-check">✔</span> <span>${b}</span></div>`).join("")}</div>`
      : "";

    return `
      <div class="poster-full-card theme-${p.theme || 'default'}" style="background: ${p.bgGradient || '#FFFFFF'};">
        <!-- Top Poster Header Bar -->
        <div class="poster-top-bar">
          <div class="poster-brand-logo">
            <span class="logo-red-arc">●</span>
            <span class="logo-brand-zh">城巴</span>
            <span class="logo-brand-en">Citybus</span>
          </div>
          <div class="poster-file-tag">LECIP Mon2 Poster #${p.id}</div>
        </div>

        <!-- Tag / Category Header -->
        <div class="poster-header-pill" style="background: ${p.accentColor || '#0284C7'};">
          ${p.tag}
        </div>

        <!-- Graphic Visual Area -->
        <div class="poster-hero-visual">
          ${this.getPosterGraphic(p)}
        </div>

        <!-- Headline & Subtitles -->
        <div class="poster-text-content">
          <h2 class="poster-main-zh" style="color: ${p.accentColor || '#0F172A'};">${p.titleZh}</h2>
          <h3 class="poster-main-en">${p.titleEn}</h3>
          ${p.subZh ? `<div class="poster-sub-zh">${p.subZh}</div>` : ''}
          ${p.subEn ? `<div class="poster-sub-en">${p.subEn}</div>` : ''}
        </div>

        <!-- Bullets & Description Box -->
        ${bulletsHtml}
        <div class="poster-desc-text">${p.descZh}</div>

        <!-- Footer Notice / Signature -->
        <div class="poster-foot-strip">
          <div class="foot-sponsor">
            <span class="anniv-badge">45</span>
            <span class="foot-text">城巴 Citybus • 陪伴香港同行</span>
          </div>
          <div class="foot-loop-info">${this.Mon2_Now_Poster} / ${MON2_DATA.posters.length}</div>
        </div>
      </div>
    `;
  }

  getPosterGraphic(p) {
    const color = p.accentColor || "#0284C7";
    switch (p.theme) {
      case "h2":
        return `
          <div class="graphic-h2-wrap">
            <div class="h2-bus-illu">
              <svg viewBox="0 0 260 120" width="100%" height="110">
                <rect x="20" y="20" width="180" height="70" rx="10" fill="#06B6D4" opacity="0.85"/>
                <rect x="25" y="25" width="40" height="25" rx="3" fill="#FFFFFF"/>
                <rect x="70" y="25" width="40" height="25" rx="3" fill="#FFFFFF"/>
                <rect x="115" y="25" width="40" height="25" rx="3" fill="#FFFFFF"/>
                <rect x="160" y="25" width="35" height="25" rx="3" fill="#FFFFFF"/>
                <rect x="25" y="55" width="40" height="25" rx="3" fill="#FFFFFF"/>
                <rect x="70" y="55" width="40" height="25" rx="3" fill="#FFFFFF"/>
                <rect x="115" y="55" width="40" height="25" rx="3" fill="#FFFFFF"/>
                <circle cx="55" cy="90" r="16" fill="#1E293B"/>
                <circle cx="55" cy="90" r="8" fill="#94A3B8"/>
                <circle cx="165" cy="90" r="16" fill="#1E293B"/>
                <circle cx="165" cy="90" r="8" fill="#94A3B8"/>
                <rect x="210" y="35" width="30" height="55" rx="4" fill="#0284C7"/>
                <text x="215" y="65" fill="white" font-size="14" font-weight="bold">H2</text>
              </svg>
            </div>
            <div class="h2-banner-ribbon">
              <span class="ribbon-text">THE FUTURE IS <strong>H2</strong> 從此氫起未來</span>
            </div>
          </div>
        `;
      case "twodollar":
        return `
          <div class="graphic-twodollar-wrap">
            <div class="twodollar-badge-row">
              <span class="badge-coin">$2</span>
              <span class="badge-title">正確使用攻略</span>
            </div>
            <div class="buses-mini-lineup">
              <div class="mini-bus-icon yellow">城巴</div>
              <div class="mini-bus-icon orange">新巴</div>
              <div class="mini-bus-icon red">九巴</div>
            </div>
          </div>
        `;
      case "stopbell":
        return `
          <div class="graphic-bell-wrap">
            <div class="bell-button-circle">
              <div class="bell-ring-btn">STOP</div>
            </div>
            <div class="bell-hand-icon">👆 按鐘示意</div>
          </div>
        `;
      case "handrail":
        return `
          <div class="graphic-handrail-wrap">
            <div class="handrail-yellow-stanchion">
              <div class="handrail-hand">✊ 緊握扶手</div>
            </div>
          </div>
        `;
      case "citybusapp":
        return `
          <div class="graphic-app-wrap">
            <div class="app-phone-mockup">
              <div class="phone-screen-header">城巴 ETA</div>
              <div class="phone-eta-row"><strong>970</strong> <span>往數碼港</span> <span class="eta-tag">2 分鐘</span></div>
            </div>
            <div class="app-qr-box">
              <div class="qr-mock-small"></div>
              <span>掃描即查</span>
            </div>
          </div>
        `;
      default:
        return `
          <div class="graphic-generic-wrap">
            <div class="generic-icon-circle" style="background: ${color};">
              ${this.getPosterSVG(p.icon)}
            </div>
          </div>
        `;
    }
  }

  getPosterSVG(iconType) {
    switch (iconType) {
      case "electric":
        return `<svg viewBox="0 0 24 24" width="72" height="72" fill="#00FFB2"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-4.66h14V17zM7.5 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/><path d="M12 9l-2 4h3l-1 4 4-5h-3z" fill="#FFD100"/></svg>`;
      case "seatbelt":
        return `<svg viewBox="0 0 24 24" width="64" height="64" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`;
      case "handrail":
        return `<svg viewBox="0 0 24 24" width="64" height="64" fill="white"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>`;
      case "app":
        return `<svg viewBox="0 0 24 24" width="64" height="64" fill="white"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" width="64" height="64" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
    }
  }
}

window.Mon2Display = Mon2Display;
