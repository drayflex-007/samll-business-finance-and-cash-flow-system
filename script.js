// ---------------------------------------------------------------
// Small Business Finance & Cash-Flow System — Sales Page
// ---------------------------------------------------------------

// Set this once you have a checkout/delivery link (Gumroad, Payhip,
// Lemon Squeezy, etc). Leave empty to show the in-page notice instead
// of sending visitors to a dead link.
const CHECKOUT_URL = "";

document.addEventListener("DOMContentLoaded", () => {
  // --- Buy button wiring ---
  const buyButton = document.getElementById("buy-button");
  const checkoutNotice = document.getElementById("checkout-notice");

  if (buyButton) {
    buyButton.addEventListener("click", (e) => {
      if (!CHECKOUT_URL) {
        e.preventDefault();
        if (checkoutNotice) checkoutNotice.hidden = false;
        return;
      }
      buyButton.setAttribute("href", CHECKOUT_URL);
    });
  }

  // --- FAQ accordion ---
  const faqButtons = document.querySelectorAll(".faq-question");
  faqButtons.forEach((btn) => {
    const answer = btn.nextElementSibling;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // Close all others
      faqButtons.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherBtn.nextElementSibling.style.maxHeight = null;
        }
      });

      if (isOpen) {
        btn.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
      } else {
        btn.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
});
