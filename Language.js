// ==================== LANGUAGE SWITCHING FUNCTIONALITY ====================
class LanguageManager {
  constructor() {
    this.currentLanguage = this.getStoredLanguage() || "uz";
    this.languageSelector = null;
    this.languageBtn = null;
    this.languageDropdown = null;
    this.overlay = null;

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupLanguageSelector()
      );
    } else {
      this.setupLanguageSelector();
    }
  }

  setupLanguageSelector() {
    // Get DOM elements
    this.languageSelector = document.getElementById("languageSelector");
    this.languageBtn = document.getElementById("languageBtn");
    this.languageDropdown = document.getElementById("languageDropdown");
    this.overlay = document.getElementById("languageOverlay");

    if (!this.languageSelector || !this.languageBtn || !this.languageDropdown) {
      console.warn("Language selector elements not found");
      return;
    }

    // Set initial language
    this.updateLanguage(this.currentLanguage);
    this.updateCurrentLanguageDisplay();

    // Event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Desktop language button click
    this.languageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Language option clicks (desktop)
    const languageOptions =
      this.languageDropdown.querySelectorAll(".language-option");
    languageOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const lang = option.getAttribute("data-lang");
        this.changeLanguage(lang);
        this.closeDropdown();
      });
    });

    // Mobile language options
    const mobileLanguageOptions = document.querySelectorAll(
      ".mobile-lang-option"
    );
    mobileLanguageOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        const lang = option.getAttribute("data-lang");
        this.changeLanguage(lang);
        // Complete mobile menu cleanup
        const navMenu = document.getElementById("navMenu");
        const overlay = document.querySelector(".nav-overlay");

        if (navMenu) {
          navMenu.classList.remove("active");
        }
        if (overlay) {
          overlay.classList.remove("active");
        }

        // Reset body styles
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";

        // Force remove any remaining blur effects
        document.body.classList.remove("menu-open");
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      this.closeDropdown();
    });

    // Close dropdown on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeDropdown();
      }
    });

    // Handle overlay click
    if (this.overlay) {
      this.overlay.addEventListener("click", () => {
        this.closeDropdown();
      });
    }
  }

  toggleDropdown() {
    const isOpen = this.languageDropdown.classList.contains("active");

    if (isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.languageDropdown.classList.add("active");
    this.languageSelector.classList.add("active");

    if (this.overlay) {
      this.overlay.classList.add("active");
    }

    // Focus first option for accessibility
    const firstOption = this.languageDropdown.querySelector(".language-option");
    if (firstOption) {
      firstOption.focus();
    }
  }

  closeDropdown() {
    this.languageDropdown.classList.remove("active");
    this.languageSelector.classList.remove("active");

    if (this.overlay) {
      this.overlay.classList.remove("active");
    }
  }

  changeLanguage(lang) {
    if (lang === this.currentLanguage) return;

    this.currentLanguage = lang;
    this.storeLanguage(lang);
    this.updateLanguage(lang);
    this.updateCurrentLanguageDisplay();
    this.updateMobileLanguageSelection();

    // Dispatch custom event
    document.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { language: lang },
      })
    );

    // Show notification
    this.showLanguageChangeNotification(lang);
  }

  updateLanguage(lang) {
    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update all elements with data-translate attribute
    const elements = document.querySelectorAll("[data-translate]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-translate");
      const translation = this.getTranslation(key, lang);

      if (translation) {
        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
          element.placeholder = translation;
        } else {
          element.innerHTML = translation;
        }
      }
    });

    // Update page title and meta description
    const titleElement = document.querySelector("title[data-translate]");
    if (titleElement) {
      const titleKey = titleElement.getAttribute("data-translate");
      const titleTranslation = this.getTranslation(titleKey, lang);
      if (titleTranslation) {
        document.title = titleTranslation;
      }
    }

    const metaDescription = document.querySelector(
      'meta[name="description"][data-translate]'
    );
    if (metaDescription) {
      const metaKey = metaDescription.getAttribute("data-translate");
      const metaTranslation = this.getTranslation(metaKey, lang);
      if (metaTranslation) {
        metaDescription.setAttribute("content", metaTranslation);
      }
    }
  }

  updateCurrentLanguageDisplay() {
    const currentLangSpan = this.languageBtn.querySelector(".current-lang");
    const languageMap = {
      uz: "UZ",
      ru: "RU",
      en: "EN",
    };

    if (currentLangSpan) {
      currentLangSpan.textContent = languageMap[this.currentLanguage] || "UZ";
    }

    // Update dropdown active state
    const options = this.languageDropdown.querySelectorAll(".language-option");
    options.forEach((option) => {
      const lang = option.getAttribute("data-lang");
      option.classList.toggle("active", lang === this.currentLanguage);
    });
  }

  updateMobileLanguageSelection() {
    const mobileOptions = document.querySelectorAll(".mobile-lang-option");
    mobileOptions.forEach((option) => {
      const lang = option.getAttribute("data-lang");
      option.classList.toggle("active", lang === this.currentLanguage);
    });
  }

  getTranslation(key, lang) {
    if (typeof translations === "undefined") {
      console.warn("Translations object not found");
      return null;
    }

    return translations[lang] && translations[lang][key]
      ? translations[lang][key]
      : null;
  }

  storeLanguage(lang) {
    try {
      localStorage.setItem("active_cargo_language", lang);
    } catch (e) {
      console.warn("Could not store language preference:", e);
    }
  }

  getStoredLanguage() {
    try {
      return localStorage.getItem("active_cargo_language");
    } catch (e) {
      console.warn("Could not retrieve stored language:", e);
      return null;
    }
  }

  showLanguageChangeNotification(lang) {
    const languageNames = {
      uz: "O'zbek",
      ru: "Русский",
      en: "English",
    };

    const notification = document.createElement("div");
    notification.className = "language-notification";
    notification.innerHTML = `
            <i class="fas fa-globe"></i>
            <span>${languageNames[lang]} tili tanlandi</span>
        `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add("show"), 100);

    // Hide and remove notification
    setTimeout(() => {
      notification.classList.add("hide");
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  // Public method to get current language
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Public method to change language programmatically
  setLanguage(lang) {
    if (["uz", "ru", "en"].includes(lang)) {
      this.changeLanguage(lang);
    }
  }
}

// ==================== AUTO-DETECT BROWSER LANGUAGE ====================
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;

  if (browserLang.startsWith("ru")) {
    return "ru";
  } else if (browserLang.startsWith("en")) {
    return "en";
  } else {
    return "uz"; // Default to Uzbek
  }
}

// ==================== INITIALIZE LANGUAGE MANAGER ====================
let languageManager;

document.addEventListener("DOMContentLoaded", function () {
  // Initialize language manager
  languageManager = new LanguageManager();

  // Auto-detect language if no stored preference
  if (!languageManager.getStoredLanguage()) {
    const detectedLang = detectBrowserLanguage();
    languageManager.setLanguage(detectedLang);
  }
});

// ==================== GLOBAL LANGUAGE FUNCTIONS ====================
window.ActiveCargoLanguage = {
  getCurrentLanguage: () =>
    languageManager ? languageManager.getCurrentLanguage() : "uz",
  setLanguage: (lang) =>
    languageManager ? languageManager.setLanguage(lang) : null,
  getTranslation: (key, lang) =>
    languageManager ? languageManager.getTranslation(key, lang) : null,
};

// ==================== HANDLE LANGUAGE CHANGE EVENTS ====================
document.addEventListener("languageChanged", function (e) {
  const newLanguage = e.detail.language;
  console.log(`Language changed to: ${newLanguage}`);

  // Update any dynamic content that might need language-specific formatting
  updateDynamicContent(newLanguage);
});

function updateDynamicContent(lang) {
  // Update date formats if any
  const dateElements = document.querySelectorAll("[data-date]");
  dateElements.forEach((element) => {
    const dateValue = element.getAttribute("data-date");
    if (dateValue) {
      const formattedDate = formatDate(dateValue, lang);
      element.textContent = formattedDate;
    }
  });

  // Update number formats if any
  const numberElements = document.querySelectorAll("[data-number]");
  numberElements.forEach((element) => {
    const numberValue = element.getAttribute("data-number");
    if (numberValue) {
      const formattedNumber = formatNumber(numberValue, lang);
      element.textContent = formattedNumber;
    }
  });
}

function formatDate(dateString, lang) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };

  switch (lang) {
    case "ru":
      return date.toLocaleDateString("ru-RU", options);
    case "en":
      return date.toLocaleDateString("en-US", options);
    default:
      return date.toLocaleDateString("uz-UZ", options);
  }
}

function formatNumber(numberString, lang) {
  const number = parseFloat(numberString);

  switch (lang) {
    case "ru":
      return number.toLocaleString("ru-RU");
    case "en":
      return number.toLocaleString("en-US");
    default:
      return number.toLocaleString("uz-UZ");
  }
}

// ==================== RTL SUPPORT (if needed in future) ====================
function updateTextDirection(lang) {
  // Currently all languages use LTR, but this can be extended
  document.documentElement.dir = "ltr";
  document.body.classList.remove("rtl");
  document.body.classList.add("ltr");
}

// ==================== KEYBOARD NAVIGATION ====================
document.addEventListener("keydown", function (e) {
  if (!languageManager) return;

  const dropdown = languageManager.languageDropdown;
  if (!dropdown || !dropdown.classList.contains("active")) return;

  const options = dropdown.querySelectorAll(".language-option");
  const focusedOption = dropdown.querySelector(".language-option:focus");

  let currentIndex = Array.from(options).indexOf(focusedOption);

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      currentIndex = (currentIndex + 1) % options.length;
      options[currentIndex].focus();
      break;
    case "ArrowUp":
      e.preventDefault();
      currentIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
      options[currentIndex].focus();
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      if (focusedOption) {
        focusedOption.click();
      }
      break;
    case "Escape":
      languageManager.closeDropdown();
      languageManager.languageBtn.focus();
      break;
  }
});

// ==================== ACCESSIBILITY IMPROVEMENTS ====================
function announceLanguageChange(lang) {
  const languageNames = {
    uz: "O'zbek tili",
    ru: "Русский язык",
    en: "English language",
  };

  // Create announcement for screen readers
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = `Language changed to ${languageNames[lang]}`;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Listen for language changes and announce them
document.addEventListener("languageChanged", function (e) {
  announceLanguageChange(e.detail.language);
});

// ==================== EXPORT FOR MODULE SYSTEMS ====================
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    LanguageManager,
    detectBrowserLanguage,
    formatDate,
    formatNumber,
  };
}
