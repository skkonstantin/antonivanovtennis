"use strict";

const menuBtn = document.querySelector("[data-js=sm-navigation-show]");
const menuBtnClose = document.querySelector("[data-js=sm-navigation-hide]");
const mainNav = document.querySelector("[data-js=sm-navigation]");

menuBtn.addEventListener("click", () => {
  showMainNav();
});

menuBtnClose.addEventListener("click", () => {
  hideMainNav();
});

mainNav.addEventListener("click", (event) => {
  if (event.target.classList.contains("main-nav__link")) {
    hideMainNav();
  }
});

function showMainNav() {
  mainNav.classList.remove("hidden");
}

function hideMainNav() {
  mainNav.classList.add("hidden");
}
