const navToggle = document.querySelector('[aria-controls="primaryNav"]');
const navWrapper = document.getElementById('primaryNav');
const nextButton = document.getElementById('sliderNext');
const prevButton = document.getElementById('sliderPrev');
const hero = document.getElementById('hero');
const heroPicture = document.getElementById('heroPicture');
const heroTitle = document.getElementById('heroTitle');
const heroText = document.getElementById('heroText');
const heroBody = document.getElementById('heroBody');
const slider = document.querySelector('.hero__media');
const overlay = document.getElementById('overlay');

const SWIPE_THRESHOLD = 50;
const MOBILE_BREAKPOINT = 1110;
let currentIndex = 0;
let isTransitioning = false;
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
    title: 'Manufactured with the best materials',
    body: 'Our modern furniture store provide a high level of quality. Our company has invested in advanced technology to ensure that every product is made as perfect and as consistent as possible. With three decades of experience in this industry, we understand what customers want for their home and office.',
  },
];

const renderNav = function (state) {
  document.querySelector('.site-header').classList.toggle('nav-open', state);
};

const toggleNavMenu = function () {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !isExpanded);
  navToggle.setAttribute(
    'aria-label',
    !isExpanded ? 'close main menu' : 'open main menu'
  );
  renderNav(!isExpanded);
  overlay.toggleAttribute('hidden', isExpanded);
};

const updateNavUI = function (state) {
  state
    ? overlay.setAttribute('hidden', '')
    : overlay.removeAttribute('hidden');
  renderNav(!state);
  navToggle.setAttribute('aria-expanded', !state);
};

const resizeObserver = new ResizeObserver(() => {
  document.body.classList.add('resizing');

  // Recalculate height on significant resize
  calculateRequiredHeight();

  const navState = navToggle.getAttribute('aria-label') === 'close main menu';

  // Desktop view: hide overlay and reset nav state
  if (window.innerWidth >= MOBILE_BREAKPOINT && navState) {
    updateNavUI(true);
  }

  // Mobile view: show overlay and maintain open nav
  if (window.innerWidth < MOBILE_BREAKPOINT && navState) {
    updateNavUI(false);
  }

  requestAnimationFrame(() => document.body.classList.remove('resizing'));
});

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
  slideIntervalId = setInterval(nextSlide, 5000);
};

const saveToLocalStorage = function (index) {
  localStorage.setItem('slide', JSON.stringify(index));
};

// Calculate the required height dynamically
const calculateRequiredHeight = function () {
  // Only apply min-height when viewport is less than 1110px
  if (window.innerWidth >= 1110) {
    heroText.style.minHeight = 'auto';
    return;
  }

  // Temporarily remove min-height to measure natural content
  heroText.style.minHeight = 'auto';

  let maxHeight = 0;

  // Measure each slide's content height
  images.forEach((slide) => {
    // Temporarily set content
    heroTitle.textContent = slide.title;
    heroBody.textContent = slide.body;

    // Measure the height with THIS content
    const height = heroText.offsetHeight;

    // Keep track of the TALLEST slide
    maxHeight = Math.max(maxHeight, height);
  });

  // Set min-height with some buffer to accommodate the TALLEST slide
  const bufferHeight = 24;
  heroText.style.minHeight = `${maxHeight + bufferHeight}px`;
};

const goToSlide = function (newIndex, direction = 'next') {
  if (isTransitioning || newIndex === currentIndex) return;

  isTransitioning = true;

  const currentPic = slider.querySelector('picture.active');
  const newPic = document.createElement('picture');
  newPic.classList.add(direction === 'next' ? 'reveal-next' : 'reveal-back');
  newPic.classList.add('hero__picture');

  // Create desktop image (source)
  const source = document.createElement('source');
  const desktopSrc = images[newIndex].desktop;
  source.srcset = desktopSrc;
  source.media = '(min-width: 760px)';

  // Create mobile image (img)
  const img = document.createElement('img');
  const mobileSrc = images[newIndex].mobile;
  img.src = mobileSrc;
  img.alt = images[newIndex].alt;

  newPic.appendChild(source);
  newPic.appendChild(img);

  /// Insert newPic before currentPic (so it's underneath)
  slider.insertBefore(newPic, currentPic);

  // Force reflow and start image transition
  void newPic.offsetWidth;
  newPic.style.clipPath = 'circle(150% at 50% 50%)';

  // Update text content (while image is transitioning)
  animateWords(images[newIndex].title, heroTitle);
  animateWords(images[newIndex].body, heroBody);

  // Clean up when image transition completes
  newPic.addEventListener(
    'transitionend',
    () => {
      currentPic.remove();
      newPic.className = 'active';
      isTransitioning = false;
    },
    { once: true }
  );

  currentIndex = newIndex;
};

const nextSlide = function () {
  const nextIndex = (currentIndex + 1) % images.length;
  saveToLocalStorage(nextIndex);
  goToSlide(nextIndex);
  startSlideShow();
};

const prevSlide = function () {
  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  saveToLocalStorage(prevIndex);
  goToSlide(prevIndex, 'back');
  startSlideShow();
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

const handleTouchStart = function (e) {
  touchStartX = e.changedTouches[0].screenX;
};

const handleTouchEnd = function (e) {
  if (!touchStartX) return; // Guard against invalid touch start

  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();

  // Reset touch coordinates
  touchStartX = 0;
  touchEndX = 0;
};

const init = function () {
  // Calculate required height after content is loaded
  setTimeout(calculateRequiredHeight, 100);

  // Start slide show
  startSlideShow();

  // Get saved index once and store in variable
  const savedIndex = Number(localStorage.getItem('slide')) || 0;

  // Set currentIndex directly without transition
  currentIndex = savedIndex;

  // Update initial content without animation
  const initialImage = images[currentIndex];
  heroTitle.textContent = initialImage.title;
  heroBody.textContent = initialImage.body;

  // Update initial image sources
  const picture = slider.querySelector('picture');
  const source = picture.querySelector('source');
  const img = picture.querySelector('img');

  source.srcset = initialImage.desktop;
  img.src = initialImage.mobile;
  img.alt = initialImage.alt;
  picture.classList.add('active');
};

slider.addEventListener('touchstart', handleTouchStart, { passive: true });
slider.addEventListener('touchend', handleTouchEnd);
[hero, navWrapper].forEach((el) =>
  el.addEventListener('mouseenter', clearSlideShow)
);
document.addEventListener('keydown', handleKeyBoardNav);
prevButton.addEventListener('click', prevSlide);
nextButton.addEventListener('click', nextSlide);
navToggle.addEventListener('click', toggleNavMenu);
resizeObserver.observe(document.body);

init();
