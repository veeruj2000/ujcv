document.querySelectorAll('.scroll-btn').forEach(button => {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    const targetClass = this.getAttribute('data-target');
    const section = document.querySelector(targetClass);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
