// ===== FAQ Accordion =====
document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const faq = question.parentElement;
    faq.classList.toggle("open");
  });
});

// ===== Contact Form — Real Backend =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const responseMessage = document.getElementById('responseMessage');
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
      responseMessage.textContent = '⚠️ Please fill all fields before submitting.';
      responseMessage.style.color = 'red';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    responseMessage.textContent = '';

    const apiBase = window.location.origin;

    try {
      const res = await fetch(`${apiBase}/api/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (data.success) {
        responseMessage.textContent = '✅ Your message has been sent successfully!';
        responseMessage.style.color = 'green';
        contactForm.reset();
      } else {
        responseMessage.textContent = '❌ ' + (data.message || 'Something went wrong.');
        responseMessage.style.color = 'red';
      }
    } catch (err) {
      responseMessage.textContent = '❌ Could not connect to server. Please try again.';
      responseMessage.style.color = 'red';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}
