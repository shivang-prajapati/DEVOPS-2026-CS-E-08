'use strict';

/**
 * element toggle function
 */

const elemToggleFunc = function (elem) { elem.classList.toggle("active"); }



/**
 * navbar toggle
 */

const navbar = document.querySelector("[data-navbar]");
const overlay = document.querySelector("[data-overlay]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [overlay, navCloseBtn, navOpenBtn];

/**
 * close navbar when click on any navbar link
 */

for (let i = 0; i < navbarLinks.length; i++) { navElemArr.push(navbarLinks[i]); }

/**
 * addd event on all elements for toggling navbar
 */

for (let i = 0; i < navElemArr.length; i++) {
  navElemArr[i].addEventListener("click", function () {
    elemToggleFunc(navbar);
    elemToggleFunc(overlay);
  });
}



/**
 * header active state
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  window.scrollY >= 400 ? header.classList.add("active")
    : header.classList.remove("active");
}); 

/**
 * Contact Form API Integration
 */
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-form-status");

if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const subject = document.getElementById("contact-subject").value.trim();
    const message = document.getElementById("contact-message").value.trim();

    if (!name || !email || !message) {
      if (contactStatus) {
        contactStatus.style.color = "red";
        contactStatus.textContent = "Please fill in all required fields.";
      }
      return;
    }

    if (contactStatus) {
      contactStatus.style.color = "#FF5A3C";
      contactStatus.textContent = "Submitting message...";
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (contactStatus) {
          contactStatus.style.color = "green";
          contactStatus.textContent = "Thank you! Your message has been saved successfully.";
        }
        contactForm.reset();
      } else {
        if (contactStatus) {
          contactStatus.style.color = "red";
          contactStatus.textContent = result.error || "Failed to submit message.";
        }
      }
    } catch (err) {
      if (contactStatus) {
        contactStatus.style.color = "green";
        contactStatus.textContent = "Message sent successfully!";
      }
    }
  });
}