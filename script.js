"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const menuIcon = menuToggle.querySelector("use");
const navigation = document.querySelector("#navigation");
const mobileNavigation = window.matchMedia("(max-width: 56.25em)");

function isPlainClick(event) {
  return !event.defaultPrevented && event.button === 0
    && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
}

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  menuIcon.setAttribute("href", open ? "#i-close" : "#i-menu");
}

menuToggle.hidden = false;
menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
mobileNavigation.addEventListener("change", () => setMenu(false));

navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || !isPlainClick(event) || menuToggle.getAttribute("aria-expanded") !== "true") return;

  setMenu(false);
  const target = document.getElementById(link.hash.slice(1));
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});

function closeMenuOutside(event) {
  if (menuToggle.getAttribute("aria-expanded") === "true"
    && !navigation.contains(event.target) && !menuToggle.contains(event.target)) {
    setMenu(false);
  }
}

document.addEventListener("click", closeMenuOutside);
document.addEventListener("focusin", closeMenuOutside);

// Форма проверяет значения в браузере и очищает поля после успешной проверки.
const form = document.querySelector("#booking-form");
const fields = document.querySelector("#booking-fields");
const status = document.querySelector("#form-status");
const serviceChoice = document.querySelector("#service-choice");
const checks = [
  [document.querySelector("#customer"), (value) => value ? "" : "Укажите имя."],
  [document.querySelector("#phone"), checkPhone],
  [document.querySelector("#vehicle"), (value) => value ? "" : "Укажите марку автомобиля."],
  [serviceChoice, (value) => value ? "" : "Выберите услугу из списка."],
];

function checkPhone(value) {
  if (!value) return "Укажите телефон.";
  const withoutParentheses = value.replace(/\((\d+)\)/, "$1");
  const digits = value.replace(/\D/g, "");
  const formatIsValid = /^\+?\d+(?:(?:\s+|\s*-\s*)\d+)*$/.test(withoutParentheses);
  return formatIsValid && digits.length >= 10 && digits.length <= 15
    ? ""
    : "Введите телефон из 10–15 цифр, например +7 (000) 000-00-00.";
}

function showFieldError(field, message) {
  document.getElementById(field.getAttribute("aria-describedby")).textContent = message;
  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }
}

for (const [field, check] of checks) {
  field.addEventListener("input", () => {
    status.textContent = "";
    if (field.hasAttribute("aria-invalid")) showFieldError(field, check(field.value.trim()));
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = "";
  let firstInvalid = null;

  for (const [field, check] of checks) {
    const message = check(field.value.trim());
    showFieldError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  form.reset();
  status.textContent = "Поля заполнены правильно. Это демонстрационная запись, заявка не отправлена.";
});

fields.disabled = false;
window.addEventListener("pagehide", () => {
  form.reset();
  status.textContent = "";
  for (const [field] of checks) showFieldError(field, "");
});

for (const link of document.querySelectorAll("[data-service]")) {
  link.addEventListener("click", (event) => {
    if (!isPlainClick(event)) return;
    serviceChoice.value = link.dataset.service;
    showFieldError(serviceChoice, "");
    status.textContent = "";
  });
}

// Галерея использует встроенное модальное окно браузера.
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const caption = document.querySelector("#lightbox-caption");
const photos = [...document.querySelectorAll(".gallery-item")];
let currentPhoto = 0;
let galleryTrigger = null;

function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  const photo = photos[currentPhoto];
  lightboxImage.src = photo.href;
  lightboxImage.alt = photo.querySelector("img").alt;
  caption.textContent = photo.querySelector(".gallery-label").textContent
    + ` · ${currentPhoto + 1} из ${photos.length}`;
}

if (typeof lightbox.showModal === "function") {
  photos.forEach((photo, index) => {
    photo.addEventListener("click", (event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();
      galleryTrigger = photo;
      showPhoto(index);
      lightbox.showModal();
    });
  });

  document.querySelector("#gallery-prev").addEventListener("click", () => showPhoto(currentPhoto - 1));
  document.querySelector("#gallery-next").addEventListener("click", () => showPhoto(currentPhoto + 1));
  document.querySelector("#gallery-close").addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(currentPhoto + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("close", () => galleryTrigger.focus({ preventScroll: true }));
}

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: "0px 0px -24px 0px" });

  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}
