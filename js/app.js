class App {
    constructor() {
        this.projects = [];
        this.homepageAssets = [];
        this.slideshowIndex = 0;
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderHomeSlideshow();
        this.renderGallery();
        this.renderProjectScroll();
        this.setupNavigation();
    }

    async loadData() {
        const [projectsData, landingData] = await Promise.all([
            fetch('projects.json').then(r => r.json()).catch(() => ({ projects: [] })),
            fetch('landing.json').then(r => r.json()).catch(() => ({ images: [] }))
        ]);
        this.projects = projectsData.projects || [];
        this.homepageAssets = landingData.images || [];
    }


    // ── HOME SLIDESHOW ──────────────────────────────────────────────

    renderHomeSlideshow() {
        const container = document.getElementById('homeSlideshow');
        if (!container || this.homepageAssets.length === 0) return;

        this.homepageAssets.forEach((asset, i) => {
            let el;
            if (asset.type === 'video') {
                el = document.createElement('video');
                el.autoplay = true;
                el.loop = true;
                el.muted = true;
                el.playsInline = true;
            } else {
                el = document.createElement('img');
                el.alt = asset.alt || '';
            }
            el.src = asset.url;
            if (i === 0) el.classList.add('active');
            container.appendChild(el);
        });

        container.addEventListener('click', () => this.advanceSlideshow());
    }

    advanceSlideshow() {
        const container = document.getElementById('homeSlideshow');
        const items = container.querySelectorAll('img, video');
        if (items.length === 0) return;
        items[this.slideshowIndex].classList.remove('active');
        this.slideshowIndex = (this.slideshowIndex + 1) % items.length;
        items[this.slideshowIndex].classList.add('active');
    }


    // ── PROJECTS GALLERY ────────────────────────────────────────────

    renderGallery() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        grid.innerHTML = this.projects.map((project, i) => {
            const thumb = project.thumbnail
                || (project.media && project.media.find(m => m.type === 'image')?.url)
                || (project.media && project.media[0]?.url)
                || '';
            const isVideo = thumb && !project.thumbnail && project.media && project.media[0]?.type === 'video';
            const imgHTML = thumb && !isVideo
                ? `<img src="${thumb}" alt="${project.title}">`
                : '';
            return `
                <div class="gallery-item" data-index="${i}">
                    <div class="gallery-img-wrap">${imgHTML}</div>
                    <div class="gallery-item-label">${project.title}</div>
                </div>
            `;
        }).join('');

        grid.addEventListener('click', e => {
            const item = e.target.closest('.gallery-item');
            if (!item) return;
            this.openProject(parseInt(item.dataset.index));
        });
    }


    // ── PROJECT DETAIL ──────────────────────────────────────────────

    renderProjectScroll() {
        const container = document.getElementById('projectScroll');
        if (!container) return;

        container.innerHTML = this.projects.map((project, i) =>
            `<section class="project-section" data-index="${i}">
                <div class="project-section-header">
                    ${project.description ? `<p class="project-section-description">${project.description}</p>` : ''}
                    ${project.credits ? `<div class="project-section-credits">${project.credits}</div>` : ''}
                    ${project.link ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-section-link">View Project →</a>` : ''}
                </div>
                <div class="project-section-media">
                    ${this.createMediaHTML(project.media)}
                </div>
            </section>`
        ).join('');

        this.setupProjectSnap(container);
        this.setupTitleObserver(container);
    }

    setupTitleObserver(container) {
        const titleEl = document.getElementById('projectNavTitle');
        if (!titleEl) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const project = this.projects[parseInt(entry.target.dataset.index)];
                    if (project) titleEl.textContent = project.title;
                }
            });
        }, {
            root: container,
            threshold: 0,
            rootMargin: '0px 0px -80% 0px'
        });

        container.querySelectorAll('.project-section').forEach(s => observer.observe(s));
    }

    setupProjectSnap(container) {
        const sections = () => container.querySelectorAll('.project-section');
        let isSnapping = false;

        container.addEventListener('scroll', () => {
            if (isSnapping) return;

            const allSections = sections();
            const scrollBottom = container.scrollTop + container.clientHeight;

            for (let i = 0; i < allSections.length - 1; i++) {
                const section = allSections[i];
                const sectionBottom = section.offsetTop + section.offsetHeight;

                if (scrollBottom >= sectionBottom - 2) {
                    const nextTop = allSections[i + 1].offsetTop;
                    if (container.scrollTop < nextTop - 10) {
                        isSnapping = true;
                        container.scrollTo({ top: nextTop, behavior: 'smooth' });
                        setTimeout(() => { isSnapping = false; }, 900);
                    }
                    break;
                }
            }
        });
    }

    createMediaHTML(media) {
        if (!media || media.length === 0) return '';

        return media.map(item => {
            if (item.type === 'image') {
                return `
                    <div class="media-item">
                        <img src="${item.url}" alt="${item.alt || ''}" loading="lazy">
                    </div>`;
            }
            if (item.type === 'image-pair') {
                return `
                    <div class="media-item-pair">
                        <div class="media-item">
                            <img src="${item.url}" alt="${item.alt || ''}" loading="lazy">
                        </div>
                        <div class="media-item">
                            <img src="${item.url2 || ''}" alt="${item.alt2 || ''}" loading="lazy">
                        </div>
                    </div>`;
            }
            if (item.type === 'video') {
                const poster = item.poster ? `poster="${item.poster}"` : '';
                const muted = item.muted !== false ? 'muted' : '';
                return `
                    <div class="media-item">
                        <video
                            ${item.autoplay ? 'autoplay' : ''}
                            ${item.loop ? 'loop' : ''}
                            ${muted}
                            ${poster}
                            playsinline
                            preload="metadata"
                            disablePictureInPicture
                            controlsList="nodownload nofullscreen noremoteplayback">
                            <source src="${item.url}" type="video/mp4">
                        </video>
                    </div>`;
            }
            return '';
        }).join('');
    }


    // ── NAVIGATION ──────────────────────────────────────────────────

    showView(id) {
        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('view--hidden', v.id !== id);
        });
    }

    openProject(index) {
        const titleEl = document.getElementById('projectNavTitle');
        if (titleEl && this.projects[index]) titleEl.textContent = this.projects[index].title;
        this.showView('view-project');
        requestAnimationFrame(() => {
            const container = document.getElementById('projectScroll');
            const section = container.querySelector(`.project-section[data-index="${index}"]`);
            if (section) container.scrollTop = section.offsetTop;
        });
    }

    setupNavigation() {
        document.getElementById('openProjects').addEventListener('click', e => {
            e.preventDefault();
            this.showView('view-projects');
        });

        document.getElementById('closeProjects').addEventListener('click', e => {
            e.preventDefault();
            this.showView('view-home');
        });

        document.getElementById('closeProject').addEventListener('click', e => {
            e.preventDefault();
            this.showView('view-home');
        });
    }
}

new App();
