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

            <!-- Horizontal Screen Header Driver Card (Photo 2 / A12 Reference) -->
            <div class="header-driver-box horizontal-only" id="header-driver-box" title="點擊切換 車長資訊 / Citybus App">
              <div class="h-driver-wrap" id="h-driver-wrap">
                <div class="h-driver-col col-name">
                  <div class="h-driver-name-zh" id="h-driver-name-zh">陳車長</div>
                  <div class="h-driver-name-en" id="h-driver-name-en">Bus Captain Chan</div>
                </div>
                <div class="h-driver-col col-motto">
                  <div class="h-motto-zh">為您服務</div>
                  <div class="h-motto-en">is serving you</div>
                </div>
                <div class="h-driver-col col-id">
                  <div class="h-id-label">員工編號 Staff No.</div>
                  <div class="h-id-num" id="h-driver-id">50179</div>
                </div>
              </div>
              <div class="h-driver-app hidden" id="h-driver-app">
                <span class="app-icon-mini">📱</span> 下載 Citybus App
              </div>
            </div>

            <div class="header-time-box">
              <div class="time-label">現在時間 Time Now</div>
              <div class="time-value" id="header-clock">15:04</div>
            </div>
          </header>

          <!-- Main Content Area containing Modes 1, 2, 3, 4, 5 -->
          <main class="mon2-main" id="mon2-main">
            <!-- MODE 1: 中文停靠三站 (LECIP_Mon2_Mode1 / Chinese) -->
            <section id="panel-mode-1" class="content-page active">
              <div class="page-top-strip">
                <div class="status-callout zh-callout" id="zh-status-callout">
                  <span class="status-indicator-arrow">▼</span>
                  <span class="status-text" id="zh-status-text">下一站</span>
                </div>
                <div class="page-cycle-tag">Mode 1: 中文停靠三站</div>
              </div>
              <div class="trio-stops-container" id="zh-trio-stops"></div>
            </section>

            <!-- MODE 2: 英文停靠三站 (LECIP_Mon2_Mode1 / English) -->
            <section id="panel-mode-2" class="content-page hidden">
              <div class="page-top-strip">
                <div class="status-callout en-callout" id="en-status-callout">
                  <span class="status-indicator-arrow">▼</span>
                  <span class="status-text" id="en-status-text">Next stop</span>
                </div>
                <div class="page-cycle-tag">Mode 2: English 3-Stop</div>
              </div>
              <div class="trio-stops-container" id="en-trio-stops"></div>
            </section>

            <!-- MODE 3: 分段收費 / 轉乘路線 (LECIP_Mon2_Mode3) -->
            <section id="panel-mode-3" class="content-page hidden">
              <div class="section-title-bar interchange-header">
                <span class="bar-zh" id="mode3-title-zh">轉乘路線</span>
                <span class="bar-en" id="mode3-title-en">Interchange routes</span>
                <span class="page-indicator" id="mode3-page-num">1/1</span>
              </div>
              <div class="interchange-table-wrapper" id="mode3-content-wrap">
                <!-- Dynamically injected table or fare card -->
              </div>
              <div class="interchange-footer">
                實際抵站時間受交通情況影響 • Actual arrival time affected by traffic
              </div>
            </section>

            <!-- MODE 4: 電子海報輪播 (LECIP_Mon2_Mode4) -->
            <section id="panel-mode-4" class="content-page hidden">
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
            <section id="panel-mode-5" class="content-page hidden">
              <div class="page-top-strip">
                <div class="status-callout bi-callout" id="bi-status-callout">
                  <span class="status-indicator-arrow">▼</span>
                  <span class="status-text" id="bi-status-text">此站 This stop</span>
                </div>
                <div class="page-cycle-tag" id="allstop-page-indicator">1/2</div>
              </div>
              <div class="ladder-wrapper">
                <div class="ladder-stops-list" id="allstop-stops-list"></div>
              </div>
            </section>

            <!-- Terminus Alert Overlay -->
            <div class="terminus-alert-card hidden" id="terminus-alert-card">
              <div class="terminus-title">終點站 TERMINUS</div>
              <div class="terminus-desc">請攜帶所有隨身行李下車<br>Please alight with all your belongings</div>
              <div class="terminus-thanks">多謝乘搭城巴 • Thank You For Travelling With Us</div>
            </div>
          </main>

          <!-- Bottom Footer Bar (Vertical Screen Reference) -->
          <footer class="mon2-footer" id="mon2-footer">
            <!-- Vertical Screen Driver Card -->
            <div class="v-driver-card vertical-only" id="v-driver-card" title="點擊切換 車長資訊 / Citybus App">
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
              <div class="v-driver-app hidden" id="v-driver-app">
                <span class="app-icon-mini">📱</span>
                <span class="app-promo-text">下載 Citybus App 查閱即時抵站時間及優惠</span>
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
        vContent.classList.add("hidden");
        vApp.classList.remove("hidden");
      } else {
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
        hWrap.classList.add("hidden");
        hApp.classList.remove("hidden");
      } else {
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
        // Advance to next page of AllStop
        this.Mon2_Page_Now += 1;
        this.Mon2_Page_Timer = 0;
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

    for (const [m, el] of Object.entries(panels)) {
      if (!el) continue;
      if (parseInt(m, 10) === this.Mon2_Mode) {
        el.classList.remove("hidden");
        el.classList.add("active");
      } else {
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
    this.telargo_busarrivingstop = 1;
    this.Mon2_Timer = 0;
    this.renderAllPanels();
  }

  // --- Route & Texture Mode Detection as in Mon2.osc lines 53-85 ---
  detectRouteTexMode() {
    if (!this.currentRoute) return;
    const r = this.currentRoute;
    const frame = document.getElementById("mon2-frame");
    const badge = document.getElementById("route-badge");

    if (r.code.startsWith("H") || r.isRickshaw) {
      this.Mon2_Tex_Mode = 2; // NWFB RSB
      if (frame) {
        frame.classList.remove("mode-cityflyer", "mode-ctb", "mode-nwfb");
        frame.classList.add("mode-rickshaw");
      }
      if (badge) {
        badge.style.backgroundColor = "#8B1E1E";
        badge.style.color = "#FFD700";
      }
    } else if (r.code.startsWith("A") || r.code.startsWith("NA") || r.isAirport) {
      this.Mon2_Tex_Mode = 1; // CTB CityFlyer
      if (frame) {
        frame.classList.remove("mode-rickshaw", "mode-ctb", "mode-nwfb");
        frame.classList.add("mode-cityflyer");
      }
      if (badge) {
        badge.style.backgroundColor = r.colorHex || "#E6007E";
        badge.style.color = "#FFFFFF";
      }
    } else if (r.company === "NWFB") {
      this.Mon2_Tex_Mode = 0; // NWFB Normal
      if (frame) {
        frame.classList.remove("mode-rickshaw", "mode-cityflyer", "mode-ctb");
        frame.classList.add("mode-nwfb");
      }
      if (badge) {
        badge.style.backgroundColor = "#FF6600";
        badge.style.color = "#FFFFFF";
      }
    } else {
      this.Mon2_Tex_Mode = 0; // CTB Normal
      if (frame) {
        frame.classList.remove("mode-rickshaw", "mode-cityflyer", "mode-nwfb");
        frame.classList.add("mode-ctb");
      }
      if (badge) {
        badge.style.backgroundColor = r.colorHex || "#004B87";
        badge.style.color = r.textColor || "#FFFFFF";
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
    if (badgeNum) badgeNum.textContent = r.code;
    if (destZh) destZh.textContent = r.dest.zh;
    if (destEn) destEn.textContent = `to ${r.dest.en}`;

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

    // Terminus alert
    const isTerminus = stop.isTerminus || stop.num === r.stops.length;
    const terminusAlert = document.getElementById("terminus-alert-card");
    if (terminusAlert) {
      if (isTerminus) terminusAlert.classList.remove("hidden");
      else terminusAlert.classList.add("hidden");
    }

    this.updateDriverDisplay();
  }

  renderChineseTrioStops(curIdx) {
    const container = document.getElementById("zh-trio-stops");
    if (!container || !this.currentRoute) return;

    container.innerHTML = "";
    const stops = this.currentRoute.stops;
    const trio = stops.slice(curIdx, curIdx + 3);

    trio.forEach((s, idx) => {
      const isFirst = idx === 0;
      let etaMins = (idx * 2) + (isFirst ? 0 : 2);

      const row = document.createElement("div");
      row.className = `trio-row ${isFirst ? "row-active" : ""}`;
      row.innerHTML = `
        <div class="trio-seq-col">
          <div class="trio-circle ${isFirst ? "circle-active" : "circle-upcoming"}">
            ${s.num}
          </div>
          ${idx < trio.length - 1 ? '<div class="trio-arrow-line"></div>' : ''}
        </div>
        <div class="trio-name-col">
          <div class="trio-main-name">${s.zh} ${s.isTerminus ? '<span class="tag-term">總站</span>' : ''}</div>
          ${s.subZh || (s.landmarks && s.landmarks[0]) ? `<div class="trio-sub-text">${s.subZh || s.landmarks[0]}</div>` : ''}
        </div>
        <div class="trio-eta-col">
          ${isFirst ? '<span class="tag-active-stop">此站</span>' : `<span class="eta-big">${etaMins}</span><span class="eta-unit-text">分鐘</span>`}
        </div>
      `;
      container.appendChild(row);
    });
  }

  renderEnglishTrioStops(curIdx) {
    const container = document.getElementById("en-trio-stops");
    if (!container || !this.currentRoute) return;

    container.innerHTML = "";
    const stops = this.currentRoute.stops;
    const trio = stops.slice(curIdx, curIdx + 3);

    trio.forEach((s, idx) => {
      const isFirst = idx === 0;
      let etaMins = (idx * 2) + (isFirst ? 0 : 2);

      const row = document.createElement("div");
      row.className = `trio-row ${isFirst ? "row-active" : ""}`;
      row.innerHTML = `
        <div class="trio-seq-col">
          <div class="trio-circle ${isFirst ? "circle-active" : "circle-upcoming"}">
            ${s.num}
          </div>
          ${idx < trio.length - 1 ? '<div class="trio-arrow-line"></div>' : ''}
        </div>
        <div class="trio-name-col">
          <div class="trio-main-name">${s.en} ${s.isTerminus ? '<span class="tag-term">Terminus</span>' : ''}</div>
          ${s.subEn ? `<div class="trio-sub-text">${s.subEn}</div>` : ''}
        </div>
        <div class="trio-eta-col">
          ${isFirst ? '<span class="tag-active-stop">Now</span>' : `<span class="eta-big">${etaMins}</span><span class="eta-unit-text">min</span>`}
        </div>
      `;
      container.appendChild(row);
    });
  }

  renderMode3(stop) {
    const wrap = document.getElementById("mode3-content-wrap");
    const titleZh = document.getElementById("mode3-title-zh");
    const titleEn = document.getElementById("mode3-title-en");
    if (!wrap) return;

    wrap.innerHTML = "";

    if (stop.interchanges && stop.interchanges.length > 0) {
      if (titleZh) titleZh.textContent = "轉乘路線";
      if (titleEn) titleEn.textContent = "Interchange routes";

      let tableHtml = `
        <table class="interchange-table">
          <thead>
            <tr>
              <th style="width: 25%;">路線<br><small>Route</small></th>
              <th style="width: 50%;">方向<br><small>Direction</small></th>
              <th style="width: 25%; text-align: right;">抵站時間<br><small>ETA</small></th>
            </tr>
          </thead>
          <tbody>
      `;
      stop.interchanges.forEach(ic => {
        tableHtml += `
          <tr>
            <td><span class="ic-route-badge">${ic.route}</span></td>
            <td>
              <div class="ic-dest-zh">${ic.destZh}</div>
              <div class="ic-dest-en">${ic.destEn}</div>
            </td>
            <td style="text-align: right;">
              <strong class="ic-eta-val">${ic.eta}</strong> <span class="ic-eta-unit">分鐘<br>min</span>
            </td>
          </tr>
        `;
      });
      tableHtml += `</tbody></table>`;
      wrap.innerHTML = tableHtml;
    } else {
      if (titleZh) titleZh.textContent = "車資資訊";
      if (titleEn) titleEn.textContent = "Fare Information";

      wrap.innerHTML = `
        <div style="padding: 24px; text-align: center;">
          <div style="font-size: 16px; font-weight: 700; color: #475569;">正程成人車資 Standard Adult Fare</div>
          <div style="font-size: 42px; font-weight: 900; color: #0284C7; margin: 10px 0;">${stop.fare || "$7.7"}</div>
          <div style="font-size: 13px; color: #64748B;">支援八達通、感應式信用卡及指定電子支付<br>Supported by Octopus, Contactless Credit Cards & e-Wallets</div>
        </div>
      `;
    }
  }

  renderMode5(curIdx) {
    const listEl = document.getElementById("allstop-stops-list");
    if (!listEl || !this.currentRoute) return;

    listEl.innerHTML = "";
    const stops = this.currentRoute.stops;

    // In Mon2.osc lines 270-420: Page 1 shows up to 13 stops. Page 2 shows next 11 stops.
    const startIdx = (this.Mon2_Page_Now === 1) ? curIdx : (curIdx + 12 + (this.Mon2_Page_Now - 2) * 11);
    const displayList = stops.slice(startIdx, startIdx + 13);

    displayList.forEach((s, idx) => {
      const isFirst = (idx === 0 && this.Mon2_Page_Now === 1);
      const isYellowRow = idx % 2 === 0; // Alternating row color as in Mon2.osc
      const row = document.createElement("div");
      row.className = `ladder-row ${isYellowRow ? "row-yellow" : "row-white"} ${isFirst ? "row-current" : ""}`;

      row.innerHTML = `
        <div class="ladder-circle-col">
          <div class="ladder-circle ${isFirst ? "circle-green" : "circle-blue"}">
            ${s.num}
          </div>
          ${idx < displayList.length - 1 ? '<div class="ladder-line"></div>' : ''}
        </div>
        <div class="ladder-names-bilingual">
          <span class="ladder-zh-col">${s.zh}</span>
          <span class="ladder-en-col">${s.en}</span>
        </div>
        <div class="ladder-eta-col">
          ${isFirst ? '<span class="tag-current">此站</span>' : `<span class="eta-mins">${(idx * 2) + 1}</span><small class="eta-min-text">分</small>`}
        </div>
      `;
      listEl.appendChild(row);
    });
  }

  renderPoster() {
    const p = MON2_DATA.posters[this.currentPosterIndex] || MON2_DATA.posters[0];
    if (!p) return;

    const container = document.getElementById("poster-container");
    if (!container) return;

    container.innerHTML = this.getPosterHTML(p);
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
