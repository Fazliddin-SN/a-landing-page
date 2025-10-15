// ==================== MODERN TESTIMONIALS CAROUSEL ====================
const testimonialsTrack = document.getElementById("testimonialsTrack");
const testimonialCards = document.querySelectorAll(".testimonial-card-modern");
const prevControl = document.querySelector(".prev-control");
const nextControl = document.querySelector(".next-control");
const progressDots = document.querySelectorAll(".progress-dot");
const carouselModern = document.querySelector(".testimonials-carousel-modern");

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
    const gap = 30;
    const offset = currentIndex * (cardWidth + gap);

    testimonialsTrack.style.transition = smooth
      ? "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)"
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

  // Autoplay functions
  function startAutoplay() {
    if (!isAutoplayPaused) {
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

  // Hover to enable autoplay
  if (carouselModern) {
    carouselModern.addEventListener("mouseenter", () => {
      isAutoplayPaused = false;
      startAutoplay();
    });

    carouselModern.addEventListener("mouseleave", () => {
      isAutoplayPaused = true;
      stopAutoplay();
    });
  }

  // Touch/Swipe support
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

  // Mouse drag support (desktop)
  let mouseStartX = 0;
  let mouseCurrentX = 0;
  let isMouseDragging = false;

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

  // Set cursor style
  testimonialsTrack.style.cursor = "grab";
} // ==================== ACTIVE CARGO - MAIN JAVASCRIPT ====================
document.addEventListener("DOMContentLoaded", function () {
  // ==================== GLOBAL VARIABLES ====================
  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const navClose = document.getElementById("navClose");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const scrollProgress = document.getElementById("scrollProgress");
  const scrollTopBtn = document.getElementById("scrollTop");

  // Create overlay element for mobile menu
  const overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  document.body.appendChild(overlay);

  // ==================== HERO SWIPER SLIDER ====================
  const heroSwiper = new Swiper(".heroSwiper", {
    loop: false,
    speed: 1000,
    autoplay: false, // Disabled autoplay
    initialSlide: 0, // Start with first slide (AVIA)
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
    on: {
      init: function () {
        console.log("Hero Swiper initialized - AVIA slide shown by default");
      },
    },
  });

  // ==================== MOBILE MENU TOGGLE ====================
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      openMenu();
    });
  }

  if (navClose) {
    navClose.addEventListener("click", function () {
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
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    navToggle.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Close menu when clicking nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 992) {
        closeMenu();
      }
    });
  });

  // ==================== STICKY HEADER & SCROLL EFFECTS ====================
  let lastScroll = 0;

  window.addEventListener("scroll", function () {
    const currentScroll = window.pageYOffset;

    // Add scrolled class for style changes
    if (currentScroll > 80) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Update scroll progress bar
    updateScrollProgress();

    // Update active navigation link
    updateActiveLink();

    // Show/hide scroll to top button
    if (currentScroll > 500) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }

    lastScroll = currentScroll;
  });

  // ==================== SCROLL PROGRESS BAR ====================
  function updateScrollProgress() {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;

    if (scrollProgress) {
      scrollProgress.style.width = scrolled + "%";
    }
  }

  // ==================== ACTIVE NAV LINK ON SCROLL ====================
  const sections = document.querySelectorAll("section[id]");

  function updateActiveLink() {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150;
      const sectionId = section.getAttribute("id");
      const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (link) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      }
    });
  }

  // ==================== SMOOTH SCROLL ====================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href === "#" || href === "#!") return;

      e.preventDefault();

      const target = document.querySelector(href);
      if (target) {
        const headerOffset = header ? header.offsetHeight + 20 : 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
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
    });
  });

  // ==================== FAQ ACCORDION ====================
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      const faqItem = this.parentElement;
      const isActive = faqItem.classList.contains("active");

      // Close all FAQ items
      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
      });

      // Open clicked item if it wasn't active
      if (!isActive) {
        faqItem.classList.add("active");
      }
    });
  });

  // ==================== SCROLL TO TOP BUTTON ====================
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // ==================== RESIZE HANDLER ====================
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // Close mobile menu on desktop resize
      if (window.innerWidth > 992) {
        closeMenu();
      }
    }, 250);
  });

  // ==================== ESCAPE KEY HANDLER ====================
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (navMenu.classList.contains("active")) {
        closeMenu();
      }
    }
  });

  // ==================== PREVENT SCROLL JUMP ON PAGE LOAD ====================
  window.addEventListener("load", function () {
    if (window.location.hash) {
      setTimeout(function () {
        const target = document.querySelector(window.location.hash);
        if (target) {
          const headerOffset = header ? header.offsetHeight + 20 : 100;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  });

  // ==================== LAZY LOADING IMAGES ====================
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // ==================== ANIMATION ON SCROLL (Simple) ====================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Add animation to elements
  const animateElements = document.querySelectorAll(
    ".service-card, .pricing-card, .contact-card, .about-content, .stat-box"
  );

  animateElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s ease";
    observer.observe(el);
  });

  // ==================== FORM VALIDATION (if needed) ====================
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Add your form submission logic here
      console.log("Form submitted");

      // Example: Show success message
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "✓ Jo'natildi!";
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 3000);
      }
    });
  });

  // ==================== PRELOADER (Optional) ====================
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    window.addEventListener("load", function () {
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 300);
    });
  }

  // ==================== DYNAMIC YEAR IN FOOTER ====================
  const yearElement = document.querySelector(".current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ==================== TOOLTIP HANDLER ====================
  const tooltipElements = document.querySelectorAll("[data-tooltip]");
  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", function () {
      // Tooltip is handled by CSS
    });
  });

  // ==================== COPY TO CLIPBOARD ====================
  const copyButtons = document.querySelectorAll("[data-copy]");
  copyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const textToCopy = this.getAttribute("data-copy");

      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showNotification("Nusxalandi!", "success");
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showNotification("Nusxalandi!", "success");
      }
    });
  });

  // ==================== NOTIFICATION SYSTEM ====================
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 30px;
      padding: 15px 25px;
      background: ${type === "success" ? "#27ae60" : "#e74c3c"};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // ==================== PHONE NUMBER FORMATTING ====================
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Track phone clicks if needed
      console.log("Phone number clicked:", this.href);
    });
  });

  // ==================== EXTERNAL LINK HANDLER ====================
  const externalLinks = document.querySelectorAll('a[target="_blank"]');
  externalLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // Track external link clicks if needed
      console.log("External link clicked:", this.href);
    });
  });

  // ==================== SCROLL REVEAL ANIMATION ====================
  function revealOnScroll() {
    const reveals = document.querySelectorAll("[data-reveal]");

    reveals.forEach((element) => {
      const windowHeight = window.innerHeight;
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < windowHeight - elementVisible) {
        element.classList.add("revealed");
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Initial check

  // ==================== COUNTER ANIMATION ====================
  function animateCounter(element) {
    const target = parseInt(element.getAttribute("data-count"));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    updateCounter();
  }

  // Observe counter elements
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !entry.target.classList.contains("counted")
        ) {
          animateCounter(entry.target);
          entry.target.classList.add("counted");
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll("[data-count]").forEach((counter) => {
    counterObserver.observe(counter);
  });

  // ==================== PARALLAX EFFECT ====================
  const parallaxElements = document.querySelectorAll("[data-parallax]");

  if (parallaxElements.length > 0 && window.innerWidth > 768) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach((element) => {
        const speed = element.getAttribute("data-parallax") || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // ==================== STICKY SIDEBAR (if needed) ====================
  function initStickySidebar() {
    const sidebar = document.querySelector(".sticky-sidebar");
    if (!sidebar) return;

    const sidebarTop = sidebar.offsetTop;
    const sidebarHeight = sidebar.offsetHeight;

    window.addEventListener("scroll", () => {
      const scrollTop = window.pageYOffset;

      if (scrollTop > sidebarTop - 100) {
        sidebar.classList.add("is-sticky");
      } else {
        sidebar.classList.remove("is-sticky");
      }
    });
  }

  initStickySidebar();

  // ==================== BACK BUTTON HANDLER ====================
  window.addEventListener("popstate", function (event) {
    // Handle browser back button if needed
    console.log("Back button pressed");
  });

  // ==================== DETECT MOBILE DEVICE ====================
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  if (isMobileDevice()) {
    document.body.classList.add("is-mobile");
  }

  // ==================== DETECT TOUCH DEVICE ====================
  function isTouchDevice() {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  if (isTouchDevice()) {
    document.body.classList.add("is-touch");
  }

  // ==================== PERFORMANCE OPTIMIZATION ====================
  // Debounce function for scroll and resize events
  function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for frequent events
  function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Apply throttle to scroll events
  const throttledScroll = throttle(() => {
    updateScrollProgress();
    updateActiveLink();
  }, 100);

  window.addEventListener("scroll", throttledScroll);

  // ==================== SERVICE WORKER REGISTRATION ====================
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Uncomment to enable service worker
      // navigator.serviceWorker
      //   .register("/sw.js")
      //   .then((registration) => {
      //     console.log("Service Worker registered:", registration);
      //   })
      //   .catch((error) => {
      //     console.log("Service Worker registration failed:", error);
      //   });
    });
  }

  // ==================== CLICK TRACKING ====================
  function trackClick(category, action, label) {
    // Integrate with your analytics service
    console.log("Click tracked:", category, action, label);

    // Example for Google Analytics
    if (typeof gtag !== "undefined") {
      gtag("event", action, {
        event_category: category,
        event_label: label,
      });
    }
  }

  // Track button clicks
  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", function () {
      const category = "Button";
      const action = "Click";
      const label = this.textContent.trim();
      trackClick(category, action, label);
    });
  });

  // ==================== NETWORK STATUS ====================
  window.addEventListener("online", () => {
    showNotification("Internet aloqasi tiklandi", "success");
  });

  window.addEventListener("offline", () => {
    showNotification("Internet aloqasi uzildi", "error");
  });

  // ==================== PAGE VISIBILITY ====================
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Page is hidden
      console.log("Page hidden");
    } else {
      // Page is visible
      console.log("Page visible");
    }
  });

  // ==================== PREVENT CONTEXT MENU (Optional) ====================
  // Uncomment to disable right-click
  // document.addEventListener("contextmenu", (e) => {
  //   e.preventDefault();
  //   return false;
  // });

  // ==================== COPY PROTECTION (Optional) ====================
  // Uncomment to prevent text selection
  // document.addEventListener("selectstart", (e) => {
  //   e.preventDefault();
  //   return false;
  // });

  // ==================== INITIALIZE AOS (Animate On Scroll) ====================
  // If you're using AOS library, initialize it here
  // if (typeof AOS !== "undefined") {
  //   AOS.init({
  //     duration: 800,
  //     easing: "ease-in-out",
  //     once: true,
  //     mirror: false,
  //   });
  // }

  // ==================== HEADER ANIMATION ON LOAD ====================
  setTimeout(() => {
    if (header) {
      header.style.transform = "translateY(0)";
      header.style.opacity = "1";
    }
  }, 100);

  // ==================== SMOOTH SCROLL POLYFILL ====================
  // For older browsers that don't support smooth scrolling
  if (!("scrollBehavior" in document.documentElement.style)) {
    const smoothScrollPolyfill = document.createElement("script");
    smoothScrollPolyfill.src =
      "https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js";
    document.head.appendChild(smoothScrollPolyfill);
  }

  // ==================== CONSOLE STYLING ====================
  const consoleStyles = {
    title:
      "background: linear-gradient(135deg, #2c3e50 0%, #e74c3c 100%); color: white; font-size: 20px; padding: 10px 20px; font-weight: bold;",
    subtitle:
      "background: #e74c3c; color: white; font-size: 14px; padding: 5px 10px;",
    info: "color: #2c3e50; font-size: 12px; padding: 5px;",
  };

  console.log("%c Active Cargo ", consoleStyles.title);
  console.log("%c Developed by YUMA SOFT ", consoleStyles.subtitle);
  console.log("%c Website loaded successfully! ", consoleStyles.info);
  console.log(
    "%c Version: 1.0.0 | " + new Date().toLocaleDateString(),
    consoleStyles.info
  );

  // ==================== PERFORMANCE MONITORING ====================
  if (window.performance && window.performance.timing) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(
          `%c Page Load Time: ${(loadTime / 1000).toFixed(2)}s`,
          "color: #27ae60; font-weight: bold;"
        );
      }, 0);
    });
  }

  // ==================== ERROR HANDLING ====================
  window.addEventListener("error", (event) => {
    console.error("Error occurred:", event.error);
    // Send error to logging service if needed
  });

  // ==================== UNHANDLED PROMISE REJECTIONS ====================
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    // Send error to logging service if needed
  });

  // ==================== BROWSER COMPATIBILITY CHECK ====================
  function checkBrowserCompatibility() {
    const isIE = /MSIE|Trident/.test(navigator.userAgent);

    if (isIE) {
      const banner = document.createElement("div");
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: #e74c3c;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 99999;
        font-size: 14px;
      `;
      banner.textContent =
        "Siz eski brauzerdan foydalanyapsiz. Yaxshi tajriba uchun zamonaviy brauzerga o'ting.";
      document.body.insertBefore(banner, document.body.firstChild);
    }
  }

  checkBrowserCompatibility();

  // ==================== FEATURE DETECTION ====================
  const features = {
    flexbox: CSS.supports("display", "flex"),
    grid: CSS.supports("display", "grid"),
    customProperties: CSS.supports("--custom", "property"),
    objectFit: CSS.supports("object-fit", "cover"),
  };

  console.log("Browser Features:", features);

  // ==================== INITIALIZE ALL FUNCTIONS ====================
  function init() {
    console.log("Initializing Active Cargo website...");

    // Update initial states
    updateScrollProgress();
    updateActiveLink();

    // Set initial animations
    document.body.classList.add("loaded");

    console.log("✓ Active Cargo website initialized successfully!");
  }

  // Run initialization
  init();

  // ==================== CUSTOM EVENTS ====================
  // Create custom event for when page is fully ready
  const pageReadyEvent = new CustomEvent("pageReady", {
    detail: {
      timestamp: Date.now(),
      message: "Page is fully loaded and ready",
    },
  });

  window.dispatchEvent(pageReadyEvent);

  // Listen for custom events
  window.addEventListener("pageReady", (e) => {
    console.log("Page Ready Event:", e.detail);
  });

  // ==================== CLEANUP ====================
  // Clean up event listeners when page is unloaded
  window.addEventListener("beforeunload", () => {
    // Perform cleanup tasks
    console.log("Cleaning up...");
  });

  // ==================== EXPOSE PUBLIC API ====================
  // Make certain functions available globally if needed
  window.ActiveCargo = {
    showNotification: showNotification,
    closeMenu: closeMenu,
    openMenu: openMenu,
    goToSection: function (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        const headerOffset = header ? header.offsetHeight + 20 : 100;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    },
    version: "1.0.0",
    author: "YUMA SOFT",
  };

  console.log(
    "%c ActiveCargo API is ready! Access it via window.ActiveCargo",
    "color: #27ae60; font-weight: bold; font-size: 12px;"
  );
}); // End DOMContentLoaded

// ==================== OUTSIDE DOMContentLoaded ====================

// Page Load Performance
window.addEventListener("load", function () {
  // Remove any loading states
  document.body.classList.remove("loading");
  document.body.classList.add("loaded");

  // Log load complete
  console.log(
    "%c ✓ All resources loaded!",
    "color: #27ae60; font-weight: bold;"
  );
});

// ==================== END OF SCRIPT ====================
