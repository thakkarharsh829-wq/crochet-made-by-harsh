document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('order-form');
  const year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = form.elements.namedItem('name')?.value?.trim() || 'there';
      alert(`Thank you, ${name}! Your request has been received. I will be in touch soon.`);
      form.reset();
    });
  }
});
