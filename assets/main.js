function runTypingEffect() {
  const typedTarget = document.getElementById('typed-text');
  const cursor = document.querySelector('.hero__cursor');
  if (!typedTarget) return;

  const text = 'PORTFOLIO'; 
  let idx = 0;
  let typingTimer;
  let blinkTimer;
  let deleting = false;

  const type = () => {
    typedTarget.textContent = text.slice(0, idx);

    if (!deleting) {
      idx += 1;
      if (idx > text.length) {
        deleting = true;
        typingTimer = setTimeout(type, 1800);
        return;
      }
      } else {
        idx -= 1;

        typedTarget.textContent = text.slice(0, idx);
        if (idx === 0) {
          deleting = false;
          typingTimer = setTimeout(type, 1800);
          return;
        }
      }

    typingTimer = setTimeout(type, deleting ? 80 : 140);
  };

  type();

  if (cursor) {
    cursor.classList.remove('is-off');
    blinkTimer = setInterval(() => {
      cursor.classList.toggle('is-off');
    }, 520);
  }

  return () => {
    clearTimeout(typingTimer);
    clearInterval(blinkTimer);
  };
}

function initNav() {
  const nav = document.getElementById('top-nav');
  const hero = document.getElementById('hero');
  if (!nav) return;

  const showNav = () => nav.classList.add('nav--visible');
  const hideNav = () => nav.classList.remove('nav--visible');

  if (!hero) {
    showNav();
    return;
  }

  const setByScroll = () => {
    if (window.scrollY > hero.clientHeight * 0.45) {
      showNav();
    } else {
      hideNav();
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          showNav();
        } else {
          hideNav();
        }
      },
      { threshold: 0.1, rootMargin: '-10% 0px -32% 0px' }
    );

    observer.observe(hero);
  }

  window.addEventListener('scroll', setByScroll, { passive: true });
  window.addEventListener('resize', setByScroll);
  setByScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    runTypingEffect();
    initNav();
  });
} else {
  runTypingEffect();
  initNav();
}
