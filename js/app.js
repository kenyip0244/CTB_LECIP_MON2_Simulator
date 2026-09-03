/**
 * CTB LECIP MON2 SIMULATOR - MAIN APP INITIALIZER
 */

document.addEventListener("DOMContentLoaded", () => {
  const displayContainer = document.getElementById("mon2-display-container");
  if (!displayContainer) return;

  // Initialize Display Screen
  const display = new Mon2Display(displayContainer);

  // Initialize Audio & Controller
  const audio = window.mon2Audio;
  const controller = new Mon2Controller(display, audio);

  controller.init();

  // Expose global debug interface
  window.ctbMon2 = {
    display,
    audio,
    controller,
    data: MON2_DATA
  };

  console.log("CTB LECIP MON2 Simulator successfully initialized.");
});
