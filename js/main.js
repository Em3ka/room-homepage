const nextButton = document.getElementById('sliderNext');
const prevButton = document.getElementById('sliderPrev');
const hero = document.getElementById('hero');
const heroPicture = document.getElementById('heroPicture');
const heroTitle = document.getElementById('heroTitle');
const heroBody = document.getElementById('heroBody');
const heroSource = document.querySelector('#heroPicture source');
const heroImg = document.querySelector('#heroPicture img');

const SWIPE_THRESHOLD = 50;
let currentSlide = 0;
let touchStartX = 0;
let touchEndX = 0;
let slideIntervalId;

const images = [
  {
    desktop: './images/desktop-image-hero-1.jpg',
    mobile: './images/mobile-image-hero-1.jpg',
    alt: 'Modern dining table with bonsai plant',
    title: 'Discover innovative ways to decorate',
    body: 'We provide unmatched quality, comfort, and style for property owners across the country. Our experts combine form and function in bringing your vision to life. Create a room in your own style with our collection and make your property a reflection of you and what you love.',
  },
  {
    desktop: './images/desktop-image-hero-2.jpg',
    mobile: './images/mobile-image-hero-2.jpg',
    alt: 'Stylish modern chairs in sunlight',
    title: 'We are available all across the globe',
    body: "With stores all over the world, it's easy for you to find furniture for your home or place of business. Locally, we’re in most major cities throughout the country. Find the branch nearest you using our store locator. Any questions? Don't hesitate to contact us today.",
  },
  {
    desktop: './images/desktop-image-hero-3.jpg',
    mobile: './images/mobile-image-hero-3.jpg',
    alt: 'Minimalist living room setup',
    title: 'Shop now Manufactured with the best materials',
    body: 'Our modern furniture store provide a high level of quality. Our company has invested in advanced technology to ensure that every product is made as perfect and as consistent as possible. With three decades of experience in this industry, we understand what customers want for their home and office.',
  },
];

const animateWords = function (text, element) {
  element.innerHTML = '';
  const wordArr = text.split(' ');

  wordArr.forEach((word, i) => {
    const span = document.createElement('span');
    span.textContent = word + '\u00A0';
    span.style.animationDelay = `${i * 0.05}s`;
    span.classList.add('word-animate');
    element.appendChild(span);
  });
};

const clearSlideShow = function () {
  if (slideIntervalId) clearInterval(slideIntervalId);
};

const startSlideShow = function () {
  clearSlideShow();
  slideIntervalId = setInterval(prevSlide, 5000);
};

const goToSlide = function (index, direction = 'forward') {
  // heroTitle.innerText = images[index].title;
  // heroBody.innerText = images[index].body;

  animateWords(images[index].title, heroTitle);
  animateWords(images[index].body, heroBody);

  heroSource.srcset = images[index].desktop;
  heroImg.alt = images[index].alt;
  heroImg.src = images[index].mobile;

  heroPicture.classList.remove('slide-in-forward', 'slide-in-reverse');
  void heroPicture.offsetWidth;
  heroPicture.classList.add(
    direction === 'forward' ? 'slide-in-forward' : 'slide-in-reverse'
  );
};

const nextSlide = function () {
  currentSlide = (currentSlide + 1) % images.length;
  goToSlide(currentSlide, 'forward');
  saveToLocalStorage();
  startSlideShow();
};

const prevSlide = function () {
  currentSlide = (currentSlide - 1 + images.length) % images.length;
  goToSlide(currentSlide, 'reverse');
  saveToLocalStorage();
  startSlideShow();
};

const saveToLocalStorage = function () {
  localStorage.setItem('slide', JSON.stringify(currentSlide));
};

const handleKeyBoardNav = function (e) {
  if (e.key === 'ArrowLeft') {
    prevSlide();
  }
  if (e.key === 'ArrowRight') {
    nextSlide();
  }
};

const handleSwipe = function () {
  if (touchEndX < touchStartX - SWIPE_THRESHOLD) {
    // Swipe left - show next slide
    nextSlide();
  }

  if (touchEndX > touchStartX + SWIPE_THRESHOLD) {
    // Swipe right - show previous slide
    prevSlide();
  }
};

const init = function () {
  startSlideShow();
  const savedSlide = JSON.parse(localStorage.getItem('slide'));
  goToSlide(savedSlide);
};

heroPicture.addEventListener(
  'touchstart',
  (e) => (touchStartX = e.changedTouches[0].screenX)
);
heroPicture.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});
hero.addEventListener('mouseenter', clearSlideShow);
hero.addEventListener('mouseleave', startSlideShow);
document.addEventListener('keydown', handleKeyBoardNav);
prevButton.addEventListener('click', prevSlide);
nextButton.addEventListener('click', nextSlide);

init();
