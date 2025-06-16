
// Add event listener to the stick image menu for hover actions
const stickImageMenu = document.querySelector('.stick-image-menu');
const hoverPanel = document.querySelector('.hover-panel');

stickImageMenu.addEventListener('mouseenter', function() {
  hoverPanel.classList.add('open'); // Keep the hover panel visible when entering the menu area
});

stickImageMenu.addEventListener('mouseleave', function() {
  hoverPanel.classList.remove('open'); // Hide the hover panel when leaving the menu area
});

let lastScrollY = window.scrollY;
let rotation = 0;
const img = document.getElementById("scrollImage");

function rotateImage() {
  const currentScrollY = window.scrollY;
  const delta = currentScrollY - lastScrollY;

  if (delta > 0) {
    rotation += 2;
  } else if (delta < 0) {
    rotation -= 4;
  }

  img.style.transform = `rotate(${rotation}deg)`;
  lastScrollY = currentScrollY;
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      rotateImage();
      ticking = false;
    });
    ticking = true;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const textPath = document.getElementById('text-path');
  const initialOffset = -286.87522611188;
  const scrollSpeed = 0.5; // Adjust this to control the scroll speed

  if (textPath) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const newOffset = initialOffset + scrollY * scrollSpeed;
      textPath.setAttribute('startOffset', newOffset);
    });
  }
});

// @ts-check
'use strict';

/**
 * @typedef {Object} Slide
 * @property {string} src - Image source URL
 * @property {string} alt - Image alt text
 */

/**
 * @typedef {Object} SlideshowConfig
 * @property {number} intervalTime - Time between slides in ms
 * @property {number} transitionDuration - Animation duration in ms
 * @property {Slide[]} slides - Array of slide objects
 * @property {boolean} enableAutoPlay - Whether to auto-advance slides
 * @property {boolean} enableKeyboard - Whether to enable keyboard navigation
 * @property {boolean} enableTouch - Whether to enable touch/swipe controls
 * @property {number} [swipeThreshold=50] - Minimum swipe distance to trigger navigation
 */

document.addEventListener('DOMContentLoaded', function() {
  /** @type {SlideshowConfig} */
  const config = {
    intervalTime: 5000,
    transitionDuration: 600,
    slides: [
      { src: 'your-image-1.jpg', alt: 'Your first image description' },
      { src: 'your-image-2.jpg', alt: 'Your second image description' },
      { src: 'your-image-3.jpg', alt: 'Your third image description' }
    ],
    enableAutoPlay: true,
    enableKeyboard: true,
    enableTouch: true,
    swipeThreshold: 50
  };

  // DOM Elements with proper typing
  /** @type {HTMLElement | null} */
  const slideshowContainer = document.querySelector('.kt-slideshow-container');
  /** @type {HTMLElement | null} */
  const slidesWrapper = document.querySelector('.kt-slides-wrapper');
  /** @type {HTMLElement | null} */
  const dotsContainer = document.querySelector('.kt-slide-dots');
  /** @type {HTMLElement | null} */
  const loadingIndicator = document.querySelector('.kt-slideshow-loading');
  /** @type {HTMLButtonElement | null} */
  const prevBtn = document.querySelector('.kt-prev-arrow');
  /** @type {HTMLButtonElement | null} */
  const nextBtn = document.querySelector('.kt-next-arrow');

  // State management
  /** @type {number} */
  let currentIndex = 0;
  /** @type {number | null} */
  let slideInterval = null;
  /** @type {boolean} */
  let isAnimating = false;
  /** @type {number} */
  let touchStartX = 0;
  /** @type {number} */
  let touchEndX = 0;
  /** @type {number} */
  let loadedImages = 0;

  /**
   * Initialize the slideshow
   * @returns {void}
   */
  function initSlideshow() {
    if (!slideshowContainer || !slidesWrapper || !dotsContainer || !loadingIndicator) {
      console.error('Required DOM elements not found');
      return;
    }

    createSlides();
    setupEventListeners();
    
    if (config.enableAutoPlay) {
      startAutoSlide();
    }
  }

  /**
   * Create slide elements from config
   * @returns {void}
   */
  function createSlides() {
    if (!slidesWrapper || !dotsContainer) return;

    config.slides.forEach((slide, index) => {
      // Create slide element
      const slideElement = document.createElement('div');
      slideElement.className = `kt-slide ${index === 0 ? 'active' : ''}`;
      slideElement.innerHTML = `<img src="${slide.src}" alt="${slide.alt}" loading="lazy">`;
      slidesWrapper.appendChild(slideElement);

      // Create navigation dot
      createDot(index);
    });

    trackImageLoading();
  }

  /**
   * Create a navigation dot for a slide
   * @param {number} index - Slide index
   * @returns {void}
   */
  function createDot(index) {
    if (!dotsContainer) return;

    const dot = document.createElement('button');
    dot.className = `kt-dot ${index === 0 ? 'active' : ''}`;
    dot.dataset.index = index.toString();
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  }

  /**
   * Track when all images are loaded
   * @returns {void}
   */
  function trackImageLoading() {
    const images = document.querySelectorAll('.kt-slide img');
    
    if (images.length === 0 && loadingIndicator) {
      loadingIndicator.style.display = 'none';
      return;
    }

    images.forEach(img => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        img.addEventListener('error', handleImageLoad);
      }
    });
  }

  /**
   * Handle image load events
   * @returns {void}
   */
  function handleImageLoad() {
    loadedImages++;
    if (loadedImages >= config.slides.length && loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  }

  /**
   * Set up event listeners
   * @returns {void}
   */
  function setupEventListeners() {
    if (prevBtn) prevBtn.addEventListener('click', goToPrevSlide);
    if (nextBtn) nextBtn.addEventListener('click', goToNextSlide);

    if (config.enableTouch && slideshowContainer) {
      slideshowContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
      slideshowContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    if (config.enableKeyboard) {
      document.addEventListener('keydown', handleKeyDown);
    }

    if (config.enableAutoPlay && slideshowContainer) {
      slideshowContainer.addEventListener('mouseenter', pauseAutoSlide);
      slideshowContainer.addEventListener('mouseleave', startAutoSlide);
    }
  }

  /**
   * Navigate to a specific slide
   * @param {number} index - Slide index to navigate to
   * @returns {void}
   */
  function goToSlide(index) {
    if (isAnimating || index === currentIndex) return;
    
    // Validate index
    index = Math.max(0, Math.min(index, config.slides.length - 1));
    
    const slides = document.querySelectorAll('.kt-slide');
    const dots = document.querySelectorAll('.kt-dot');
    
    if (!slides[index] || !dots[index]) return;
    
    isAnimating = true;
    
    // Update active classes
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentIndex = index;
    
    // Reset animation lock
    setTimeout(() => {
      isAnimating = false;
    }, config.transitionDuration);
    
    resetAutoSlide();
  }

  /**
   * Go to next slide
   * @returns {void}
   */
  function goToNextSlide() {
    goToSlide((currentIndex + 1) % config.slides.length);
  }

  /**
   * Go to previous slide
   * @returns {void}
   */
  function goToPrevSlide() {
    goToSlide((currentIndex - 1 + config.slides.length) % config.slides.length);
  }

  /**
   * Start automatic slideshow
   * @returns {void}
   */
  function startAutoSlide() {
    if (!config.enableAutoPlay || slideInterval !== null) return;
    slideInterval = window.setInterval(goToNextSlide, config.intervalTime);
  }

  /**
   * Pause automatic slideshow
   * @returns {void}
   */
  function pauseAutoSlide() {
    if (slideInterval !== null) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  /**
   * Reset automatic slideshow timer
   * @returns {void}
   */
  function resetAutoSlide() {
    pauseAutoSlide();
    startAutoSlide();
  }

  /**
   * Handle touch start event
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }

  /**
   * Handle swipe gesture
   * @returns {void}
   */
  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    
    if (diff < -config.swipeThreshold) {
      goToNextSlide();
    } else if (diff > config.swipeThreshold) {
      goToPrevSlide();
    }
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {void}
   */
  function handleKeyDown(e) {
    switch(e.key) {
      case 'ArrowLeft':
        goToPrevSlide();
        break;
      case 'ArrowRight':
        goToNextSlide();
        break;
      case 'Home':
        goToSlide(0);
        break;
      case 'End':
        goToSlide(config.slides.length - 1);
        break;
    }
  }

  // Initialize the slideshow
  initSlideshow();
});



