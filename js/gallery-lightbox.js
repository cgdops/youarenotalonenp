(() => {
  const dialog = document.getElementById('gallery-lightbox');
  if (!dialog) return;

  const items = Array.from(document.querySelectorAll('.gallery-item'));
  const imgEl = document.getElementById('lightbox-img');
  const sourceWebp = document.getElementById('lightbox-source-webp');
  const captionEl = document.getElementById('lightbox-caption');
  const counterEl = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let currentIndex = 0;

  function showSlide(index) {
    const total = items.length;
    if (!total) return;
    currentIndex = ((index % total) + total) % total;

    const btn = items[currentIndex];
    const fullSrc = btn.getAttribute('data-full-src') || '';
    const fallbackSrc = btn.getAttribute('data-fallback-src') || fullSrc;
    const caption = btn.getAttribute('data-caption') || '';

    if (fullSrc.endsWith('.webp')) {
      sourceWebp.setAttribute('srcset', fullSrc);
    } else {
      sourceWebp.removeAttribute('srcset');
    }

    imgEl.src = fallbackSrc;
    imgEl.alt = caption;
    captionEl.textContent = caption;
    counterEl.textContent = `${currentIndex + 1} / ${total}`;

    // Preload adjacent images for instant navigation
    const nextIdx = (currentIndex + 1) % total;
    const prevIdx = (currentIndex - 1 + total) % total;
    [nextIdx, prevIdx].forEach((idx) => {
      const preloadUrl = items[idx].getAttribute('data-full-src') || items[idx].getAttribute('data-fallback-src');
      if (preloadUrl) {
        const preloadImg = new Image();
        preloadImg.src = preloadUrl;
      }
    });
  }

  items.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      showSlide(idx);
      if (!dialog.open) {
        dialog.showModal();
      }
    });
  });

  closeBtn.addEventListener('click', () => {
    dialog.close();
  });

  prevBtn.addEventListener('click', () => {
    showSlide(currentIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    showSlide(currentIndex + 1);
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(currentIndex + 1);
    }
  });

  dialog.addEventListener('close', () => {
    dialog.returnValue = '';
  });

  // Light-dismiss fallback for browsers without native <dialog closedby="any"> support,
  // plus backdrop/stage background click dismissal when clicking outside the image/controls
  const isInteractiveOrFigure = (target) =>
    Boolean(
      target.closest('.lightbox-img') ||
      target.closest('.lightbox-caption') ||
      target.closest('.lightbox-nav') ||
      target.closest('.lightbox-close') ||
      target.closest('.lightbox-counter')
    );

  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isDialogContent) {
          dialog.close();
          return;
        }
      }
      if (!isInteractiveOrFigure(event.target)) {
        dialog.close();
      }
    });
  } else {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog && !isInteractiveOrFigure(event.target)) {
        dialog.close();
      }
    });
  }

  // Touch swipe support for mobile lightbox navigation
  let touchStartX = 0;
  let touchStartY = 0;

  dialog.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length === 1) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }
    },
    { passive: true }
  );

  dialog.addEventListener(
    'touchend',
    (event) => {
      if (event.changedTouches.length === 1) {
        const dx = event.changedTouches[0].clientX - touchStartX;
        const dy = event.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (dx < 0) {
            showSlide(currentIndex + 1);
          } else {
            showSlide(currentIndex - 1);
          }
        }
      }
    },
    { passive: true }
  );
})();
