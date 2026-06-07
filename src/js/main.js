import { initAnimation } from "./animation.js";

function initLoader() {
    const loader = document.querySelector("#page-loader");
  
    if (!loader) return;
  
    setTimeout(() => {
      loader.classList.add("hide");
      document.body.classList.remove("loading");
    }, 1200);
}
  
function init() {
    initAnimation();
}
  
window.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", initLoader);