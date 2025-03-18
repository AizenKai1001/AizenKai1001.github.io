// script.js - Main JavaScript file for the portfolio website

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Preloader
  setTimeout(function () {
    document.querySelector(".preloader").classList.add("fade-out");
  }, 1500);

  // Particles
  const particlesContainer = document.querySelector(".particles");
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
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

  // Custom Cursor
  const cursor = document.querySelector(".cursor-follower");
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

  // Header scroll effect
  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    const backToTop = document.querySelector(".back-to-top");

    if (window.scrollY > 50) {
      header.classList.add("scrolled");
      backToTop.classList.add("active");
    } else {
      header.classList.remove("scrolled");
      backToTop.classList.remove("active");
    }

    // Check for elements to animate on scroll
    animateOnScroll();
  });

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector(".mobile-toggle");
  const menu = document.querySelector(".menu");

  mobileToggle.addEventListener("click", function () {
    menu.classList.toggle("active");
    this.classList.toggle("active");
  });

  // Smooth scrolling for nav links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });

      // Close mobile menu if open
      if (menu.classList.contains("active")) {
        menu.classList.remove("active");
        mobileToggle.classList.remove("active");
      }
    });
  });

  // Logo animation
  const logoLetters = document.querySelectorAll(".logo span");
  logoLetters.forEach((letter, index) => {
    letter.style.transitionDelay = index * 0.05 + "s";
  });

  // Animate skill bars
  function animateSkillBars() {
    const skillBars = document.querySelectorAll(".skill-progress");
    skillBars.forEach((bar) => {
      const width = bar.getAttribute("data-width");
      bar.style.width = width + "%";
    });
  }

  // Portfolio filtering
  const filterButtons = document.querySelectorAll(".filter-btn");
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");

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
    const elements = document.querySelectorAll(
      ".about-image, .about-content, .service-card, .portfolio-item, .contact-info, .contact-form"
    );

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (elementPosition < windowHeight - 100) {
        element.classList.add("active");

        // If it's a service card or portfolio item, add delay
        if (
          element.classList.contains("service-card") ||
          element.classList.contains("portfolio-item")
        ) {
          const delay = element.getAttribute("data-delay");
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
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("form-message");

  if (contactForm) {
    // Override the form's submit event
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Show sending message
      formMessage.innerHTML =
        '<div class="alert alert-info">Sending message...</div>';

      // Submit the form using fetch API
      fetch(contactForm.action, {
        method: contactForm.method,
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            // Success message
            formMessage.innerHTML =
              '<div class="alert alert-success">Thank you for your message! I\'ll get back to you soon.</div>';
            contactForm.reset(); // Clear the form
          } else {
            response.json().then((data) => {
              if (Object.hasOwn(data, "errors")) {
                // Show specific error from Formspree
                formMessage.innerHTML =
                  '<div class="alert alert-danger">' +
                  data.errors.map((error) => error.message).join(", ") +
                  "</div>";
              } else {
                // Generic error message
                formMessage.innerHTML =
                  '<div class="alert alert-danger">Oops! There was a problem submitting your form. Please try again.</div>';
              }
            });
          }
        })
        .catch((error) => {
          // Network error message
          formMessage.innerHTML =
            '<div class="alert alert-danger">Oops! There was a problem connecting to the server. Please check your internet connection.</div>';
          console.error("Form submission error:", error);
        });
    });
  }

  // Trigger animations on initial load
  setTimeout(function () {
    animateOnScroll();
  }, 500);
});
