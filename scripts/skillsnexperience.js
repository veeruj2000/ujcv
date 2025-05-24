function scrollToSection(className) {
  const section = document.querySelector(className);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}
