/**
 * CTB LECIP MON2 DRIVER CONTROLLER CONSOLE
 * Interacts with Mon2Display and Audio Engine
 */

class Mon2Controller {
  constructor(display, audio) {
    this.display = display;
    this.audio = audio;
    this.autoPlayTimer = null;
    this.autoPlayInterval = 12000; // 12 seconds per stop in auto mode
    this.isAutoPlaying = false;
  }

  init() {
    this.bindDOM();
    this.populateRoutes();
    this.loadSelectedRoute();
    this.syncDriverProfileFromDOM();
  }

  bindDOM() {
    // Route Selection
    const routeSelect = document.getElementById("ctrl-route-select");
    if (routeSelect) {
      routeSelect.addEventListener("change", () => {
        this.loadSelectedRoute();
      });
    }

    // Stop Jump Select
    const stopSelect = document.getElementById("ctrl-stop-select");
    if (stopSelect) {
      stopSelect.addEventListener("change", (e) => {
        const idx = parseInt(e.target.value, 10);
        this.jumpToStop(idx);
      });
    }

    // Mode Selection Pills (Matching Mon2.osc Modes 1, 2, 3, 4, 5)
    [1, 2, 3, 4, 5].forEach(mNum => {
      const btn = document.getElementById(`pill-m${mNum}`);
      if (btn) {
        btn.addEventListener("click", () => {
          this.display.setMode(mNum);
          this.updateModePills(mNum);
        });
      }
    });

    const cycleCheck = document.getElementById("ctrl-cycle-enable");
    if (cycleCheck) {
      cycleCheck.addEventListener("change", (e) => {
        this.display.isCyclePaused = !e.target.checked;
      });
    }

    const randomPosterCheck = document.getElementById("ctrl-random-poster");
    if (randomPosterCheck) {
      randomPosterCheck.addEventListener("change", (e) => {
        this.display.randomPosterMode = e.target.checked;
      });
    }

    const btnShuffle = document.getElementById("btn-shuffle-poster");
    if (btnShuffle) {
      btnShuffle.addEventListener("click", () => {
        this.display.advancePosterIndex();
        this.display.setMode(4);
      });
    }

    // Stop Navigation Buttons
    const btnPrev = document.getElementById("btn-prev-stop");
    const btnArrive = document.getElementById("btn-arrive-stop");
    const btnNext = document.getElementById("btn-next-stop");
    const btnAuto = document.getElementById("btn-auto-play");
    const btnChime = document.getElementById("btn-chime-only");
    const btnSeatbelt = document.getElementById("btn-seatbelt-alert");

    if (btnPrev) btnPrev.addEventListener("click", () => this.handlePrevStop());
    if (btnArrive) btnArrive.addEventListener("click", () => this.handleArriveStop());
    if (btnNext) btnNext.addEventListener("click", () => this.handleNextStop());
    if (btnAuto) btnAuto.addEventListener("click", () => this.toggleAutoPlay());
    if (btnChime) btnChime.addEventListener("click", () => this.audio.playChime());
    if (btnSeatbelt) btnSeatbelt.addEventListener("click", () => this.triggerSeatbeltAlert());

    // Power Controls
    const powerSelect = document.getElementById("ctrl-power-select");
    if (powerSelect) {
      powerSelect.addEventListener("change", (e) => {
        this.display.setPower(e.target.value);
        this.updateStatusPill();
      });
    }

    // Dep Timer (Departure Countdown)
    const depTimerInput = document.getElementById("ctrl-dep-timer");
    const depTimerVal = document.getElementById("val-dep-timer");
    if (depTimerInput && depTimerVal) {
      depTimerInput.addEventListener("input", (e) => {
        const mins = parseInt(e.target.value, 10);
        depTimerVal.textContent = `${mins} 分鐘 min`;
        this.display.setDepartureTimer(mins);
      });
    }

    // Screen Settings
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

    // Customizable Driver ID & Captain Profile (X車長 / Bus Captain X)
    const driverZhInput = document.getElementById("ctrl-driver-surname-zh");
    const driverEnInput = document.getElementById("ctrl-driver-surname-en");
    const driverIdInput = document.getElementById("ctrl-driver-id");
    const driverCheck = document.getElementById("ctrl-driver-logged");

    const updateProfile = () => {
      const surnameZh = driverZhInput ? driverZhInput.value : "李";
      const surnameEn = driverEnInput ? driverEnInput.value : "Li";
      const id = driverIdInput ? driverIdInput.value : "34006";
      const logged = driverCheck ? driverCheck.checked : true;

      this.display.driverPrivacyHidden = !logged;
      this.display.setDriverProfile({ id, surnameZh, surnameEn, logged });
    };

    if (driverZhInput) driverZhInput.addEventListener("input", updateProfile);
    if (driverEnInput) driverEnInput.addEventListener("input", updateProfile);
    if (driverIdInput) driverIdInput.addEventListener("input", updateProfile);
    if (driverCheck) driverCheck.addEventListener("change", updateProfile);

    // Audio & Speech
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

    const volInput = document.getElementById("ctrl-volume");
    if (volInput) {
      volInput.addEventListener("input", (e) => {
        this.audio.volume = parseFloat(e.target.value);
      });
    }

    // Custom Route Modal
    const btnCustom = document.getElementById("btn-custom-route");
    const modal = document.getElementById("custom-modal");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnSaveCustom = document.getElementById("btn-save-custom");
    const textarea = document.getElementById("custom-json-input");

    if (btnCustom && modal && textarea) {
      btnCustom.addEventListener("click", () => {
        textarea.value = JSON.stringify(this.display.currentRoute || MON2_DATA.routes[0], null, 2);
        modal.classList.remove("hidden");
      });
    }

    if (btnCloseModal && modal) {
      btnCloseModal.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    }

    if (btnSaveCustom && modal && textarea) {
      btnSaveCustom.addEventListener("click", () => {
        try {
          const parsed = JSON.parse(textarea.value);
          if (!parsed.code || !parsed.stops || !Array.isArray(parsed.stops)) {
            alert("無效的路線格式：需包含 code 與 stops 陣列。");
            return;
          }
          MON2_DATA.routes.push(parsed);
          this.populateRoutes();
          const routeSelect = document.getElementById("ctrl-route-select");
          if (routeSelect) {
            routeSelect.value = parsed.id || parsed.code;
            this.loadSelectedRoute();
          }
          modal.classList.add("hidden");
          alert(`成功載入自訂路線：${parsed.code}`);
        } catch (err) {
          alert("JSON 解析錯誤：" + err.message);
        }
      });
    }

    // Fullscreen Viewport Toggle
    const btnFullscreen = document.getElementById("btn-fullscreen");
    if (btnFullscreen) {
      btnFullscreen.addEventListener("click", () => {
        const frame = document.getElementById("mon2-frame");
        if (frame) {
          if (!document.fullscreenElement) {
            frame.requestFullscreen().catch(err => {
              alert(`無法啟用全螢幕: ${err.message}`);
            });
          } else {
            document.exitFullscreen();
          }
        }
      });
    }
  }

  syncDriverProfileFromDOM() {
    const surnameZh = document.getElementById("ctrl-driver-surname-zh")?.value || "李";
    const surnameEn = document.getElementById("ctrl-driver-surname-en")?.value || "Li";
    const id = document.getElementById("ctrl-driver-id")?.value || "34006";
    const logged = document.getElementById("ctrl-driver-logged")?.checked ?? true;

    this.display.setDriverProfile({ id, surnameZh, surnameEn, logged });
  }

  updateModePills(modeNum) {
    [1, 2, 3, 4, 5].forEach(mNum => {
      const btn = document.getElementById(`pill-m${mNum}`);
      if (btn) {
        if (modeNum === mNum) {
          btn.classList.add("pill-active");
        } else {
          btn.classList.remove("pill-active");
        }
      }
    });
  }

  syncDriverCheckbox() {
    const loggedEl = document.getElementById("ctrl-driver-logged");
    if (loggedEl) {
      loggedEl.checked = !this.display.driverPrivacyHidden && this.display.driverLogged;
    }
  }

  populateRoutes() {
    const select = document.getElementById("ctrl-route-select");
    if (!select) return;
    select.innerHTML = "";
    MON2_DATA.routes.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r.id;
      let badge = r.isAirport ? "【機場快線】" : (r.isRickshaw ? "【人力車】" : `【${r.company}】`);
      opt.textContent = `${badge} ${r.code} (${r.origin.zh} ➔ ${r.dest.zh})`;
      select.appendChild(opt);
    });
  }

  loadSelectedRoute() {
    const select = document.getElementById("ctrl-route-select");
    if (!select) return;
    const routeId = select.value;
    const route = MON2_DATA.routes.find(r => r.id === routeId) || MON2_DATA.routes[0];
    this.display.setRoute(route, 0);
    this.populateStopSelect();
    this.updateStatusPill();
  }

  populateStopSelect() {
    const stopSelect = document.getElementById("ctrl-stop-select");
    if (!stopSelect || !this.display.currentRoute) return;
    stopSelect.innerHTML = "";
    this.display.currentRoute.stops.forEach((s, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `${s.num}. ${s.zh} (${s.en}) ${s.isTerminus ? '[總站]' : ''}`;
      stopSelect.appendChild(opt);
    });
    stopSelect.value = this.display.currentStopIndex;
  }

  syncStopSelect() {
    const stopSelect = document.getElementById("ctrl-stop-select");
    if (stopSelect) {
      stopSelect.value = this.display.currentStopIndex;
    }
  }

  jumpToStop(index) {
    this.display.setStopIndex(index, "next");
    this.syncStopSelect();
    this.audio.playChime();
    const stop = this.display.currentRoute.stops[index];
    if (stop) this.audio.speakAnnouncement(stop, "next");
  }

  handleNextStop() {
    const advanced = this.display.nextStop();
    if (advanced) {
      this.syncStopSelect();
      this.audio.playChime();
      const stop = this.display.currentRoute.stops[this.display.currentStopIndex];
      if (stop) this.audio.speakAnnouncement(stop, "next");
    } else {
      const stop = this.display.currentRoute.stops[this.display.currentStopIndex];
      this.audio.playChime();
      if (stop) this.audio.speakAnnouncement(stop, "arrived");
    }
  }

  handlePrevStop() {
    const moved = this.display.prevStop();
    if (moved) {
      this.syncStopSelect();
      this.audio.playChime();
      const stop = this.display.currentRoute.stops[this.display.currentStopIndex];
      if (stop) this.audio.speakAnnouncement(stop, "next");
    }
  }

  handleArriveStop() {
    this.display.arriveStop();
    this.audio.playChime();
    const stop = this.display.currentRoute.stops[this.display.currentStopIndex];
    if (stop) this.audio.speakAnnouncement(stop, "arrived");
  }

  triggerSeatbeltAlert() {
    this.display.currentPosterIndex = 0;
    this.display.renderPoster();
    this.display.showPage(3);
    this.audio.playChime();
  }

  toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    const btn = document.getElementById("btn-auto-play");

    if (this.isAutoPlaying) {
      if (btn) {
        btn.classList.add("btn-danger");
        btn.innerHTML = `<span>⏹</span> 停止自動行駛`;
      }
      this.autoPlayTimer = setInterval(() => {
        const canAdvance = this.display.nextStop();
        if (canAdvance) {
          this.syncStopSelect();
          this.audio.playChime();
          const stop = this.display.currentRoute.stops[this.display.currentStopIndex];
          if (stop) this.audio.speakAnnouncement(stop, "next");
        } else {
          this.toggleAutoPlay();
        }
      }, this.autoPlayInterval);
    } else {
      if (btn) {
        btn.classList.remove("btn-danger");
        btn.innerHTML = `<span>▶</span> 自動巡航 (模擬行駛)`;
      }
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = null;
      }
    }
  }

  updateStatusPill() {
    const pill = document.getElementById("console-status-pill");
    if (!pill) return;
    if (this.display.power === "OFF") {
      pill.textContent = "電源關閉 OFF";
      pill.style.background = "#DC2626";
    } else if (this.display.power === "STANDBY" || this.display.depTimerMinutes > 10) {
      pill.textContent = "系統待機 STANDBY";
      pill.style.background = "#D97706";
    } else {
      pill.textContent = "正常運作 RUNNING";
      pill.style.background = "#16A34A";
    }
  }
}

window.Mon2Controller = Mon2Controller;
