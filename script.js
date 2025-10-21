// ==================== ACTIVE CARGO - ENHANCED MAIN JAVASCRIPT ====================
document.addEventListener("DOMContentLoaded", function () {
  // ==================== GLOBAL VARIABLES ====================
  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const navClose = document.getElementById("navClose");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const scrollProgress = document.getElementById("scrollProgress");
  const scrollTopBtn = document.getElementById("scrollTop");

  // Mobile optimization variables
  let isMobile = window.innerWidth <= 768;
  let isTablet = window.innerWidth <= 992 && window.innerWidth > 768;
  let lastScrollTime = 0;
  const scrollThrottle = 16; // ~60fps

  // Create overlay element for mobile menu
  const overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  document.body.appendChild(overlay);

  // ==================== MOBILE DETECTION ====================
  function updateDeviceType() {
    const width = window.innerWidth;
    isMobile = width <= 768;
    isTablet = width <= 992 && width > 768;

    // Add classes to body for CSS targeting
    document.body.classList.toggle("is-mobile", isMobile);
    document.body.classList.toggle("is-tablet", isTablet);
    document.body.classList.toggle("is-desktop", !isMobile && !isTablet);
  }

  // ==================== HERO SWIPER SLIDER ====================
  const heroSwiper = new Swiper(".heroSwiper", {
    loop: false,
    speed: 800, // Reduced for mobile
    autoplay: false,
    initialSlide: 0,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '"></span>';
      },
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    // Mobile optimizations
    touchRatio: isMobile ? 1 : 0.2,
    threshold: isMobile ? 10 : 5,
    on: {
      init: function () {
        console.log("Hero Swiper initialized - AVIA slide shown by default");
      },
    },
  });

  // ==================== MOBILE MENU TOGGLE ====================
  if (navToggle) {
    navToggle.addEventListener("click", function (e) {
      e.preventDefault();
      openMenu();
    });
  }

  if (navClose) {
    navClose.addEventListener("click", function (e) {
      e.preventDefault();
      closeMenu();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      closeMenu();
    });
  }

  function openMenu() {
    navMenu.classList.add("active");
    overlay.classList.add("active");
    navToggle.classList.add("active");
    navToggle.style.display = "none"; // Add this line
    document.body.style.overflow = "hidden";
    document.body.classList.add("menu-open");

    // Prevent background scrolling on mobile
    if (isMobile) {
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }
  }

  function closeMenu() {
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    navToggle.classList.remove("active");
    navToggle.style.display = "flex";
    document.body.style.overflow = "";
    document.body.classList.remove("menu-open");

    // Restore scrolling on mobile
    if (isMobile) {
      document.body.style.position = "";
      document.body.style.width = "";
    }
  }

  // Close menu when clicking nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (isMobile || isTablet) {
        setTimeout(() => closeMenu(), 300); // Delay for smooth transition
      }
    });
  });

  // ==================== OPTIMIZED SCROLL EFFECTS ====================
  let lastScroll = 0;
  let ticking = false;

  // Throttled scroll function for better performance
  function throttledScroll() {
    const now = Date.now();
    if (now - lastScrollTime < scrollThrottle) {
      return;
    }
    lastScrollTime = now;

    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }

  function updateScrollEffects() {
    const currentScroll = window.pageYOffset;

    // Header effects - reduced threshold for mobile
    const headerThreshold = isMobile ? 50 : 80;
    if (currentScroll > headerThreshold) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }

    // Update scroll progress - only if not mobile to reduce performance impact
    if (!isMobile || document.body.classList.contains("show-progress")) {
      updateScrollProgress();
    }

    // Update active navigation link - throttled
    if (currentScroll !== lastScroll) {
      updateActiveLink();
    }

    // Show/hide scroll to top button - higher threshold for mobile
    const scrollTopThreshold = isMobile ? 300 : 500;
    if (currentScroll > scrollTopThreshold) {
      scrollTopBtn?.classList.add("show");
    } else {
      scrollTopBtn?.classList.remove("show");
    }

    lastScroll = currentScroll;
    ticking = false;
  }

  // Add scroll listener with throttling
  window.addEventListener("scroll", throttledScroll, { passive: true });

  // ==================== SCROLL PROGRESS BAR ====================
  function updateScrollProgress() {
    // Skip on mobile if performance is poor
    if (isMobile && window.DeviceMotionEvent) {
      return;
    }

    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = Math.min((winScroll / height) * 100, 100);

    if (scrollProgress) {
      scrollProgress.style.width = scrolled + "%";
    }
  }

  // ==================== ACTIVE NAV LINK ON SCROLL ====================
  const sections = document.querySelectorAll("section[id]");
  let activeUpdateTimeout;

  function updateActiveLink() {
    // Debounce for better performance
    clearTimeout(activeUpdateTimeout);
    activeUpdateTimeout = setTimeout(() => {
      const scrollY = window.pageYOffset;
      const offset = isMobile ? 100 : 150;

      sections.forEach((section) => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - offset;
        const sectionId = section.getAttribute("id");
        const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (link) {
          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        }
      });
    }, 100);
  }

  // ==================== SMOOTH SCROLL - MOBILE OPTIMIZED ====================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href === "#!") return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        const headerOffset = header
          ? header.offsetHeight + (isMobile ? 10 : 20)
          : isMobile
          ? 80
          : 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        // Use different scroll behavior for mobile
        const scrollOptions = {
          top: offsetPosition,
          behavior: isMobile ? "auto" : "smooth", // Instant scroll on mobile for better performance
        };

        window.scrollTo(scrollOptions);
      }
    });
  });

  // ==================== PRICING TABS ====================
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      this.classList.add("active");
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add("active");
      }

      // Announce change for accessibility
      announceTabChange(targetTab);
    });
  });

  function announceTabChange(tabName) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `${tabName} tab selected`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }

  // ==================== FAQ ACCORDION ====================
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      const faqItem = this.parentElement;
      const isActive = faqItem.classList.contains("active");

      // Close all FAQ items with animation
      document.querySelectorAll(".faq-item.active").forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove("active");
        }
      });

      // Toggle clicked item
      if (!isActive) {
        faqItem.classList.add("active");

        // Scroll into view on mobile
        if (isMobile) {
          setTimeout(() => {
            faqItem.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }, 300);
        }
      } else {
        faqItem.classList.remove("active");
      }

      // Update ARIA attributes for accessibility
      const answer = faqItem.querySelector(".faq-answer");
      const isNowActive = faqItem.classList.contains("active");
      this.setAttribute("aria-expanded", isNowActive);
      if (answer) {
        answer.setAttribute("aria-hidden", !isNowActive);
      }
    });

    // Set initial ARIA attributes
    question.setAttribute("aria-expanded", "false");
    const answer = question.parentElement.querySelector(".faq-answer");
    if (answer) {
      answer.setAttribute("aria-hidden", "true");
    }
  });

  // ==================== SCROLL TO TOP BUTTON ====================
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      // Different scroll behavior for mobile
      const scrollOptions = {
        top: 0,
        behavior: isMobile ? "auto" : "smooth",
      };
      window.scrollTo(scrollOptions);
    });
  }

  // ==================== ENHANCED TESTIMONIALS CAROUSEL ====================
  const testimonialsTrack = document.getElementById("testimonialsTrack");
  const testimonialCards = document.querySelectorAll(
    ".testimonial-card-modern"
  );
  const prevControl = document.querySelector(".prev-control");
  const nextControl = document.querySelector(".next-control");
  const progressDots = document.querySelectorAll(".progress-dot");
  const carouselModern = document.querySelector(
    ".testimonials-carousel-modern"
  );

  if (testimonialCards.length > 0 && testimonialsTrack) {
    let currentIndex = 0;
    let autoplayInterval;
    let isAutoplayPaused = true;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    // Get cards per view based on screen size
    function getCardsPerView() {
      const width = window.innerWidth;
      if (width >= 1200) return 3;
      if (width >= 768) return 2;
      return 1;
    }

    // Calculate max index
    function getMaxIndex() {
      const cardsPerView = getCardsPerView();
      return Math.max(0, testimonialCards.length - cardsPerView);
    }

    // Update carousel position
    function updateCarousel(smooth = true) {
      const cardWidth = testimonialCards[0].offsetWidth;
      const gap = isMobile ? 20 : 25; // Reduced gap for mobile
      const offset = currentIndex * (cardWidth + gap);

      testimonialsTrack.style.transition = smooth
        ? "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)" // Faster transition
        : "none";
      testimonialsTrack.style.transform = `translateX(-${offset}px)`;

      // Update dots
      progressDots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    }

    // Navigate to specific index
    function goToIndex(index) {
      const maxIndex = getMaxIndex();
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateCarousel();
    }

    // Next slide
    function nextSlide() {
      const maxIndex = getMaxIndex();
      if (currentIndex < maxIndex) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      updateCarousel();
    }

    // Previous slide
    function prevSlide() {
      const maxIndex = getMaxIndex();
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = maxIndex;
      }
      updateCarousel();
    }

    // Autoplay functions - disabled on mobile for performance
    function startAutoplay() {
      if (!isAutoplayPaused && !isMobile) {
        autoplayInterval = setInterval(nextSlide, 4000);
      }
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Event listeners for controls
    if (prevControl) {
      prevControl.addEventListener("click", () => {
        prevSlide();
        resetAutoplay();
      });
    }

    if (nextControl) {
      nextControl.addEventListener("click", () => {
        nextSlide();
        resetAutoplay();
      });
    }

    // Event listeners for progress dots
    progressDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = parseInt(dot.getAttribute("data-index"));
        goToIndex(index);
        resetAutoplay();
      });
    });

    // Hover to enable autoplay (desktop only)
    if (carouselModern && !isMobile) {
      carouselModern.addEventListener("mouseenter", () => {
        isAutoplayPaused = false;
        startAutoplay();
      });

      carouselModern.addEventListener("mouseleave", () => {
        isAutoplayPaused = true;
        stopAutoplay();
      });
    }

    // Enhanced touch/swipe support
    if (testimonialsTrack) {
      testimonialsTrack.addEventListener(
        "touchstart",
        (e) => {
          startX = e.touches[0].clientX;
          isDragging = true;
          stopAutoplay();
        },
        { passive: true }
      );

      testimonialsTrack.addEventListener(
        "touchmove",
        (e) => {
          if (!isDragging) return;
          currentX = e.touches[0].clientX;
        },
        { passive: true }
      );

      testimonialsTrack.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;

        const diff = startX - currentX;
        const threshold = isMobile ? 30 : 50; // Lower threshold for mobile

        if (Math.abs(diff) > threshold) {
          if (diff > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }

        resetAutoplay();
      });
    }

    // Mouse drag support (desktop)
    let mouseStartX = 0;
    let mouseCurrentX = 0;
    let isMouseDragging = false;

    if (!isMobile) {
      testimonialsTrack.addEventListener("mousedown", (e) => {
        mouseStartX = e.clientX;
        isMouseDragging = true;
        testimonialsTrack.style.cursor = "grabbing";
        stopAutoplay();
      });

      document.addEventListener("mousemove", (e) => {
        if (!isMouseDragging) return;
        mouseCurrentX = e.clientX;
      });

      document.addEventListener("mouseup", () => {
        if (!isMouseDragging) return;
        isMouseDragging = false;
        testimonialsTrack.style.cursor = "grab";

        const diff = mouseStartX - mouseCurrentX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
          if (diff > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }

        resetAutoplay();
      });
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
        resetAutoplay();
      } else if (e.key === "ArrowRight") {
        nextSlide();
        resetAutoplay();
      }
    });

    // Window resize handler
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateDeviceType(); // Update device type
        const maxIndex = getMaxIndex();
        if (currentIndex > maxIndex) {
          currentIndex = maxIndex;
        }
        updateCarousel(false);
      }, 200);
    });

    // Initialize
    updateCarousel(false);
    progressDots[0]?.classList.add("active");

    // Set cursor style (desktop only)
    if (!isMobile) {
      testimonialsTrack.style.cursor = "grab";
    }
  }

  // ==================== RESIZE HANDLER WITH DEBOUNCING ====================
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      updateDeviceType();

      // Close mobile menu on desktop resize
      if (window.innerWidth > 992) {
        closeMenu();
      }

      // Reinitialize components that depend on screen size
      if (heroSwiper) {
        heroSwiper.update();
      }
    }, 250);
  });

  // ==================== KEYBOARD NAVIGATION ENHANCEMENT ====================
  document.addEventListener("keydown", function (e) {
    // Close mobile menu on escape
    if (e.key === "Escape") {
      if (navMenu.classList.contains("active")) {
        closeMenu();
      }
    }

    // Skip to main content (accessibility)
    if (e.key === "Tab" && e.shiftKey === false) {
      const focusableElements = document.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );

      // Add focus ring for keyboard users
      focusableElements.forEach((el) => {
        el.addEventListener("focus", () => {
          document.body.classList.add("keyboard-navigation");
        });
      });
    }
  });

  // Remove keyboard navigation class on mouse use
  document.addEventListener("mousedown", () => {
    document.body.classList.remove("keyboard-navigation");
  });

  // ==================== INTERSECTION OBSERVER FOR ANIMATIONS ====================
  if ("IntersectionObserver" in window) {
    const observerOptions = {
      threshold: isMobile ? 0.05 : 0.1, // Lower threshold for mobile
      rootMargin: isMobile ? "0px 0px -30px 0px" : "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";

          // Remove observer after animation to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Add animation to elements with reduced motion consideration
    const animateElements = document.querySelectorAll(
      ".service-card, .pricing-card, .contact-card, .about-content, .stat-box"
    );

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    animateElements.forEach((el) => {
      if (!prefersReducedMotion) {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)"; // Reduced from 30px
        el.style.transition = "all 0.4s ease"; // Faster transition
      }
      observer.observe(el);
    });
  }

  // ==================== LAZY LOADING IMAGES ====================
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            img.classList.add("loaded");
          }
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // ==================== FORM VALIDATION ENHANCEMENT ====================
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      console.log("Form submitted");

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        const currentLang =
          window.ActiveCargoLanguage?.getCurrentLanguage() || "uz";

        const successMessages = {
          uz: "✓ Jo'natildi!",
          ru: "✓ Отправлено!",
          en: "✓ Sent!",
        };

        submitBtn.textContent = successMessages[currentLang];
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 3000);
      }
    });
  });

  // ==================== NOTIFICATION SYSTEM ENHANCEMENT ====================
  function showNotification(message, type = "info", duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => {
      notification.remove();
    });

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${
        type === "success" ? "check-circle" : "info-circle"
      }"></i>
      <span>${message}</span>
    `;

    notification.style.cssText = `
      position: fixed;
      top: ${isMobile ? "80px" : "100px"};
      right: ${isMobile ? "15px" : "30px"};
      padding: ${isMobile ? "12px 20px" : "15px 25px"};
      background: ${type === "success" ? "#059669" : "#dc2626"};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: ${isMobile ? "14px" : "15px"};
      font-weight: 600;
      max-width: ${isMobile ? "calc(100vw - 30px)" : "350px"};
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  // ==================== PHONE NUMBER AND EXTERNAL LINK TRACKING ====================
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      console.log("Phone number clicked:", this.href);

      // Show notification on mobile
      if (isMobile) {
        const currentLang =
          window.ActiveCargoLanguage?.getCurrentLanguage() || "uz";
        const messages = {
          uz: "Telefon raqami ochilmoqda...",
          ru: "Открытие номера телефона...",
          en: "Opening phone number...",
        };
        showNotification(messages[currentLang], "info", 2000);
      }
    });
  });

  const externalLinks = document.querySelectorAll('a[target="_blank"]');
  externalLinks.forEach((link) => {
    link.addEventListener("click", function () {
      console.log("External link clicked:", this.href);
    });
  });

  // ==================== COPY TO CLIPBOARD FUNCTIONALITY ====================
  const copyButtons = document.querySelectorAll("[data-copy]");
  copyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const textToCopy = this.getAttribute("data-copy");

      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const currentLang =
            window.ActiveCargoLanguage?.getCurrentLanguage() || "uz";
          const messages = {
            uz: "Nusxalandi!",
            ru: "Скопировано!",
            en: "Copied!",
          };
          showNotification(messages[currentLang], "success");
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        const currentLang =
          window.ActiveCargoLanguage?.getCurrentLanguage() || "uz";
        const messages = {
          uz: "Nusxalandi!",
          ru: "Скопировано!",
          en: "Copied!",
        };
        showNotification(messages[currentLang], "success");
      }
    });
  });

  // ==================== PERFORMANCE MONITORING ====================
  if (window.performance && window.performance.timing) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(
          `%c Page Load Time: ${(loadTime / 1000).toFixed(2)}s`,
          "color: #059669; font-weight: bold;"
        );

        // Log performance warning for mobile if load time is high
        if (isMobile && loadTime > 5000) {
          console.warn("Slow load time detected on mobile device");
        }
      }, 0);
    });
  }

  // ==================== ERROR HANDLING ====================
  window.addEventListener("error", (event) => {
    console.error("Error occurred:", event.error);

    // Don't show error notifications to users, just log them
    if (window.location.hostname !== "localhost") {
      // Send to error logging service in production
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });

  // ==================== NETWORK STATUS MONITORING ====================
  window.addEventListener("online", () => {
    const currentLang =
      window.ActiveCargoLanguage?.getCurrentLanguage() || "uz";
    const messages = {
      uz: "Internet aloqasi tiklandi",
      ru: "Подключение к интернету восстановлено",
      en: "Internet connection restored",
    };
    showNotification(messages[currentLang], "success");
  });

  window.addEventListener("offline", () => {
    const currentLang =
      window.ActiveCargoLanguage?.getCurrentLanguage() || "uz";
    const messages = {
      uz: "Internet aloqasi uzildi",
      ru: "Соединение с интернетом потеряно",
      en: "Internet connection lost",
    };
    showNotification(messages[currentLang], "error", 5000);
  });

  // ==================== INITIALIZE ALL FUNCTIONS ====================
  function init() {
    console.log("Initializing Active Cargo website...");

    // Update device type
    updateDeviceType();

    // Update initial states
    updateScrollEffects();

    // Set initial animations
    document.body.classList.add("loaded");

    // Initialize language system integration
    document.addEventListener("languageChanged", function (e) {
      console.log(`Language changed to: ${e.detail.language}`);

      // Update any dynamic content
      updateDynamicContent(e.detail.language);
    });

    console.log("✓ Active Cargo website initialized successfully!");
  }

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

  // Run initialization
  init();

  // ==================== EXPOSE PUBLIC API ====================
  window.ActiveCargo = {
    showNotification: showNotification,
    closeMenu: closeMenu,
    openMenu: openMenu,
    goToSection: function (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        const headerOffset = header
          ? header.offsetHeight + (isMobile ? 10 : 20)
          : isMobile
          ? 80
          : 100;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        const scrollOptions = {
          top: offsetPosition,
          behavior: isMobile ? "auto" : "smooth",
        };

        window.scrollTo(scrollOptions);
      }
    },
    updateDeviceType: updateDeviceType,
    isMobile: () => isMobile,
    isTablet: () => isTablet,
    version: "2.0.0",
    author: "YUMA SOFT",
  };

  console.log(
    "%c ActiveCargo Enhanced API is ready! Access it via window.ActiveCargo",
    "color: #059669; font-weight: bold; font-size: 12px;"
  );
}); // End DOMContentLoaded

// ==================== PAGE LOAD PERFORMANCE ====================
window.addEventListener("load", function () {
  document.body.classList.remove("loading");
  document.body.classList.add("loaded");

  console.log(
    "%c ✓ All resources loaded!",
    "color: #059669; font-weight: bold;"
  );
});

// ==================== CSS ANIMATIONS FOR NOTIFICATIONS ====================
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .keyboard-navigation *:focus {
    outline: 3px solid #dc2626 !important;
    outline-offset: 2px !important;
  }

  .loaded img {
    transition: opacity 0.3s ease;
  }

  .loaded img.loaded {
    opacity: 1;
  }
`;
document.head.appendChild(style);

// ==================== END OF ENHANCED SCRIPT ====================
