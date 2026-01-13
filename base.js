// script.js - Main JavaScript file for the portfolio website

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Preloader
  var preloader = document.querySelector(".preloader");
  if (preloader) {
    setTimeout(function () {
      preloader.classList.add("fade-out");
    }, 1500);
  }

  // Particles
  var particlesContainer = document.querySelector(".particles");
  if (particlesContainer) {
    for (let i = 0; i < 50; i++) {
      var particle = document.createElement("div");
      particle.classList.add("particle");
      particle.style.width = Math.random() * 15 + 5 + "px";
      particle.style.height = particle.style.width;
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.backgroundColor = `rgba(${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, 0.5)`;
      particle.style.animationDuration = Math.random() * 10 + 5 + "s";
      particle.style.animationDelay = Math.random() * 5 + "s";
      particlesContainer.appendChild(particle);
    }
  }

  // Custom Cursor
  var cursor = document.querySelector(".cursor-follower");
  if (cursor) {
    document.addEventListener("mousemove", function (e) {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    document.addEventListener("mousedown", function () {
      cursor.style.transform = "translate(-50%, -50%) scale(0.8)";
    });

    document.addEventListener("mouseup", function () {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
    });
  }

  // Header scroll effect
  window.addEventListener("scroll", function () {
    var header = document.querySelector("header");
    var backToTop = document.querySelector(".back-to-top");

    if (window.scrollY > 50) {
      header?.classList.add("scrolled");
      backToTop?.classList.add("active");
    } else {
      header?.classList.remove("scrolled");
      backToTop?.classList.remove("active");
    }

    // Check for elements to animate on scroll
    animateOnScroll();
  });

  // Mobile Menu Toggle
  var mobileToggle = document.querySelector(".mobile-toggle");
  var menu = document.querySelector(".menu");

  if (mobileToggle && menu) {
    mobileToggle.addEventListener("click", function () {
      menu.classList.toggle("active");
      this.classList.toggle("active");
    });
  }

  // Smooth scrolling for nav links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });

      // Close mobile menu if open
      if (menu && menu.classList.contains("active")) {
        menu.classList.remove("active");
        mobileToggle?.classList.remove("active");
      }
    });
  });

  // Logo animation
  var logoLetters = document.querySelectorAll(".logo span");
  logoLetters.forEach((letter, index) => {
    letter.style.transitionDelay = index * 0.05 + "s";
  });

  // Animate skill bars
  function animateSkillBars() {
    var skillBars = document.querySelectorAll(".skill-progress");
    skillBars.forEach((bar) => {
      var width = bar.getAttribute("data-width");
      bar.style.width = width + "%";
    });
  }

  // Portfolio filtering
  var filterButtons = document.querySelectorAll(".filter-btn");
  var portfolioItems = document.querySelectorAll(".portfolio-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      var filter = this.getAttribute("data-filter");

      portfolioItems.forEach((item) => {
        if (filter === "all" || item.getAttribute("data-category") === filter) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Animate elements on scroll
  function animateOnScroll() {
    var elements = document.querySelectorAll(
      ".about-image, .about-content, .service-card, .portfolio-item, .contact-info, .contact-form"
    );

    elements.forEach((element) => {
      var elementPosition = element.getBoundingClientRect().top;
      var windowHeight = window.innerHeight;

      if (elementPosition < windowHeight - 100) {
        element.classList.add("active");

        // If it's a service card or portfolio item, add delay
        if (
          element.classList.contains("service-card") ||
          element.classList.contains("portfolio-item")
        ) {
          var delay = element.getAttribute("data-delay");
          if (delay) {
            element.style.transitionDelay = delay + "ms";
          }
        }

        // If it's the about section, animate skill bars
        if (element.classList.contains("about-content")) {
          animateSkillBars();
        }
      }
    });
  }

  // Formspree form handling
  var contactForm = document.getElementById("contactForm");
  var formMessage = document.getElementById("form-message");

  if (contactForm) {
    // Override the form's submit event
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Show sending message
      formMessage.innerHTML =
        '<div class="alert alert-info">Sending message...</div>';

      // Submit the form using Axios (falls back to fetch if needed)
      var payload = new FormData(contactForm);

      var onError = (message) => {
        formMessage.innerHTML = `<div class="alert alert-danger">${message}</div>`;
      };

      var handleSuccess = () => {
        formMessage.innerHTML =
          '<div class="alert alert-success">Thank you for your message! I\'ll get back to you soon.</div>';
        contactForm.reset();
      };

      var handleValidation = (errors) => {
        onError(errors.map((error) => error.message).join(", "));
      };

      if (window.axios) {
        axios
          .post(contactForm.action, payload, {
            headers: { Accept: "application/json" },
          })
          .then((response) => {
            if (response.status >= 200 && response.status < 300) {
              handleSuccess();
            } else if (response.data && response.data.errors) {
              handleValidation(response.data.errors);
            } else {
              onError(
                "Oops! There was a problem submitting your form. Please try again."
              );
            }
          })
          .catch(() => {
            onError(
              "Oops! There was a problem connecting to the server. Please check your internet connection."
            );
          });
      } else {
        fetch(contactForm.action, {
          method: contactForm.method,
          body: payload,
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => {
            if (response.ok) {
              handleSuccess();
            } else {
              response.json().then((data) => {
                if (Object.hasOwn(data, "errors")) {
                  handleValidation(data.errors);
                } else {
                  onError(
                    "Oops! There was a problem submitting your form. Please try again."
                  );
                }
              });
            }
          })
          .catch(() => {
            onError(
              "Oops! There was a problem connecting to the server. Please check your internet connection."
            );
          });
      }
    });
  }

  // Trigger animations on initial load
  setTimeout(function () {
    animateOnScroll();
  }, 500);

  // Dynamic JS Bot portfolio banner (homepage only)
  (function () {
    var jsBotImg = document.querySelector('[data-dynamic="jsbot-banner"]');
    if (!jsBotImg || typeof axios === "undefined") return;

    var endpoint = "https://webhooks.veilborn-hub.com/bot-stats?password=TestPassword12345";
    var corsProxy = "https://corsproxy.io/?";

    var loadData = function (url, attempt) {
      if (attempt === void 0) attempt = "direct";
      return axios
        .get(url, { headers: { Accept: "application/json" } })
        .then(function (_ref) {
          var data = _ref.data;
          if (data && data.info) {
            if (data.info.banner) {
              jsBotImg.src = data.info.banner;
            } else if (data.info.avatar) {
              jsBotImg.src = data.info.avatar;
            }
          }
        })
        .catch(function () {
          if (attempt === "direct") {
            return loadData(corsProxy + encodeURIComponent(url), "proxied");
          }
        });
    };

    loadData(endpoint);
  })();
});
