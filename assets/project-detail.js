const slidesWrapper = document.getElementById('slides');
const breadcrumbEl = document.querySelector('[data-breadcrumb]');
const titleEl = document.querySelector('[data-title]');
const descEl = document.querySelector('[data-desc]');
const notesEl = document.querySelector('[data-notes]');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const sliderEl = document.querySelector('.slider');

const pageEl = document.querySelector('.page');
const projectMetaEl = document.querySelector('.project-meta');

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

let currentIndex = 0;
let currentProject = null; // 현재 프로젝트 저장

function createMockImage(colors, height) {
  const el = document.createElement('div');
  el.className = 'mock-image' + (height > 850 ? ' tall' : '');
  el.style.backgroundImage = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
  el.style.height = `${height}px`;
  return el;
}

function createVisual(slide) {
  let el;

  if (slide.image) {
    el = document.createElement('img');
    el.src = slide.image;
    el.alt = slide.title;
    el.loading = 'lazy';
    el.className =
      'mock-image real' + (slide.orientation === 'tall' ? ' tall' : '');
  } else {
    el = createMockImage(slide.colors, slide.height);
  }

  return el;
}

function renderProject(project) {
  breadcrumbEl.textContent = project.label;
  titleEl.textContent = project.title;
  descEl.innerHTML = currentProject.description;

  // 🔥 여기서 버튼 자동 생성
  if (notesEl) {
    notesEl.innerHTML = '';

    const btnWrap = document.createElement('div');
    btnWrap.className = 'project-links';

    const addBtn = (label, url) => {
      const a = document.createElement('a');
      a.className = 'project-link-btn';
      a.textContent = label;
      a.href = url;
      btnWrap.appendChild(a);
    };

    // links 객체 안의 URL에서 slug를 뽑아서 slug별로 Map 구성
    const linkMap = {};
    if (project.links) {
      Object.keys(project.links).forEach((key) => {
        const url = project.links[key];
        try {
          const u = new URL(url, window.location.href);
          const rawSlug = u.searchParams.get('slug');
          const destSlug = rawSlug && rawSlug.trim();
          if (destSlug) {
            linkMap[destSlug] = url;
          }
        } catch (e) {
          // URL 파싱 실패하면 무시
        }
      });
    }

    // 버튼을 출력할 순서 & 라벨
    const ORDER = [
      { slug: 'main-banner', label: '메인배너' },
      { slug: 'detail-page', label: '상세페이지' },
      { slug: 'landing-page', label: '렌딩페이지' },
      { slug: 'card-news', label: '카드뉴스' },
    ];

    ORDER.forEach((item) => {
      const url = linkMap[item.slug];
      if (!url) return; // 이 프로젝트에 해당 링크가 없으면 스킵
      if (item.slug === project.slug) return; // 자기 자신 페이지는 버튼 생성 X

      addBtn(item.label, url);
    });

    if (btnWrap.children.length > 0) {
      notesEl.appendChild(btnWrap);
    }
  }

  // 슬라이드 렌더링
  slidesWrapper.innerHTML = '';

  project.slides.forEach((slide) => {
    const slideEl = document.createElement('div');
    slideEl.className = 'slide';

    const visual = document.createElement('div');
    visual.className = 'slide-visual';
    visual.appendChild(createVisual(slide));

    slideEl.append(visual);
    slidesWrapper.appendChild(slideEl);
  });

  updateSlidePosition(true);
}

/**
 * 현재 슬라이드 index에 맞춰 위치/사이즈 재계산
 */
function updateSlidePosition(isFirst = false) {
  slidesWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

  prevBtn.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
  nextBtn.style.visibility =
    currentIndex === slidesWrapper.children.length - 1 ? 'hidden' : 'visible';

  applySlideLayout(isFirst);
}

/**
 * 현재 슬라이드 width에 맞춘 레이아웃 적용
 */
function applySlideLayout() {
  const slideData = currentProject.slides[currentIndex];
  sliderEl.style.width = slideData.width || '100%';

  const currentSlideEl = slidesWrapper.children[currentIndex];
  const img = currentSlideEl.querySelector('img, .mock-image');
  if (!img) return;

  const updateHeight = () => {
    const h = img.offsetHeight;

    if (h > 0) {
      sliderEl.style.height = `${h + 58}px`;
      updateButtonPosition();
    } else {
      requestAnimationFrame(updateHeight);
    }
  };

  if (img.complete) {
    requestAnimationFrame(updateHeight);
  } else {
    img.onload = () => requestAnimationFrame(updateHeight);
  }

  const observer = new ResizeObserver(() => {
    requestAnimationFrame(updateHeight);
  });
  observer.observe(img);
}

function nextSlide() {
  currentIndex = Math.min(currentIndex + 1, slidesWrapper.children.length - 1);
  updateSlidePosition();
  window.scrollTo(0, 0);
}

function prevSlide() {
  currentIndex = Math.max(currentIndex - 1, 0);
  updateSlidePosition();
  window.scrollTo(0, 0);
}

function updateButtonPosition() {
  const winH = window.innerHeight;
  const mid = winH / 2;

  prevBtn.style.top = `${mid}px`;
  nextBtn.style.top = `${mid}px`;

  const rect = sliderEl.getBoundingClientRect();
  const offset = 30;

  prevBtn.style.left = `${rect.left - prevBtn.offsetWidth - offset}px`;
  nextBtn.style.left = `${rect.right + offset}px`;
}

window.addEventListener('scroll', updateButtonPosition);
window.addEventListener('resize', () => applySlideLayout());

function bindControls() {
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  });
}

function renderError() {
  const main = document.querySelector('main');
  if (!main) return;
  main.innerHTML =
    '<div class="error">프로젝트를 찾을 수 없습니다. 목록에서 다시 선택해주세요.</div>';
}

function init() {
  const project = PROJECT_DATA.find((item) => item.slug === slug);
  if (!project) return renderError();

  currentProject = project;
  renderProject(project);
  bindControls();
}

init();



