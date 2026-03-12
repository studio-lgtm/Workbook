class App {
    constructor() {
        this.projects = [];
        this.homepageAssets = [];
        this.slideshowIndex = 0;
        this.currentProjectIndex = 0;
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

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none;z-index:1;opacity:0;';
        container.appendChild(canvas);
        this.slideshowCanvas = canvas;

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
        const next = items[this.slideshowIndex];
        next.classList.add('active');
        if (next.tagName === 'IMG' && this.slideshowCanvas) {
            this.runSlideshowPixelation(next);
        }
    }

    runSlideshowPixelation(img) {
        const canvas = this.slideshowCanvas;
        const ctx = canvas.getContext('2d');
        const steps = [6, 12, 24, 48, 96];

        const run = () => {
            const cw = img.offsetWidth || canvas.parentElement.offsetWidth;
            const ch = img.offsetHeight || canvas.parentElement.offsetHeight;
            if (!cw || !ch) return;
            canvas.width = cw;
            canvas.height = ch;
            ctx.imageSmoothingEnabled = false;
            canvas.style.transition = 'none';
            canvas.style.opacity = '1';

            let step = 0;
            const next = () => {
                if (step >= steps.length) {
                    canvas.style.transition = 'opacity 0.15s ease';
                    canvas.style.opacity = '0';
                    return;
                }
                const px = steps[step++];
                const w = img.naturalWidth || cw;
                const h = img.naturalHeight || ch;
                const sw = Math.max(1, Math.round(w / px));
                const sh = Math.max(1, Math.round(h / px));
                ctx.clearRect(0, 0, cw, ch);
                ctx.drawImage(img, 0, 0, sw, sh);
                ctx.drawImage(canvas, 0, 0, sw, sh, 0, 0, cw, ch);
                setTimeout(next, 40);
            };
            next();
        };

        if (img.complete && img.naturalWidth) {
            run();
        } else {
            img.addEventListener('load', run, { once: true });
        }
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
                    ${project.locked ? '<div class="gallery-item-confidential">Confidential</div>' : ''}
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
                ${i < this.projects.length - 1 ? `<div class="project-next"><a class="next-project-link" data-next="${i + 1}">Next Project</a></div>` : ''}
            </section>`
        ).join('');

        this.setupNextProjectLinks(container);
        this.setupTitleObserver(container);
        this.setupProgressiveLoad(container);
    }

    setupNextProjectLinks(container) {
        container.addEventListener('click', e => {
            const link = e.target.closest('.next-project-link');
            if (!link) return;
            const nextIndex = parseInt(link.dataset.next);
            this.showSection(container, nextIndex);
        });
    }

    showSection(container, index) {
        this.currentProjectIndex = index;

        container.querySelectorAll('.project-section').forEach(s => s.classList.remove('active'));
        const section = container.querySelector(`.project-section[data-index="${index}"]`);
        if (section) {
            section.classList.add('active');
            container.scrollTop = 0;
        }

        const titleEl = document.getElementById('projectNavTitle');
        if (titleEl && this.projects[index]) titleEl.textContent = this.projects[index].title;
    }

    setupProgressiveLoad(container) {
        const steps = [6, 12, 24, 48, 96];

        const revealImage = (img) => {
            if (img.dataset.revealed) return;
            img.dataset.revealed = '1';

            const parent = img.closest('.media-item');
            if (!parent) return;

            img.style.opacity = '0';

            const canvas = document.createElement('canvas');
            canvas.className = 'media-pixelate';
            parent.appendChild(canvas);
            const ctx = canvas.getContext('2d');

            const draw = () => {
                const cw = img.offsetWidth;
                const ch = img.offsetHeight;
                if (!cw || !ch) return;
                canvas.width = cw;
                canvas.height = ch;
                ctx.imageSmoothingEnabled = false;

                let step = 0;
                const next = () => {
                    if (step >= steps.length) {
                        img.style.transition = 'opacity 0.15s ease';
                        img.style.opacity = '1';
                        canvas.style.transition = 'opacity 0.15s ease';
                        canvas.style.opacity = '0';
                        canvas.addEventListener('transitionend', () => canvas.remove(), { once: true });
                        return;
                    }
                    const px = steps[step++];
                    const sw = Math.max(1, Math.round(cw / px));
                    const sh = Math.max(1, Math.round(ch / px));
                    ctx.clearRect(0, 0, cw, ch);
                    ctx.drawImage(img, 0, 0, sw, sh);
                    ctx.drawImage(canvas, 0, 0, sw, sh, 0, 0, cw, ch);
                    setTimeout(next, 40);
                };
                next();
            };

            if (img.complete && img.naturalWidth) {
                draw();
            } else {
                img.addEventListener('load', draw, { once: true });
            }
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                revealImage(entry.target);
                observer.unobserve(entry.target);
            });
        }, { root: container, rootMargin: '0px 0px 200px 0px' });

        container.querySelectorAll('.media-item img').forEach(img => observer.observe(img));
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

    createMediaHTML(media) {
        if (!media || media.length === 0) return '';

        const isImageUrl = url => /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(url || '');

        return media.map(item => {
            if (item.type === 'image') {
                return `
                    <div class="media-item">
                        <img src="${item.url}" alt="${item.alt || ''}">
                    </div>`;
            }
            if (item.type === 'image-pair') {
                return `
                    <div class="media-item-pair">
                        <div class="media-item">
                            <img src="${item.url}" alt="${item.alt || ''}">
                        </div>
                        <div class="media-item">
                            <img src="${item.url2 || ''}" alt="${item.alt2 || ''}">
                        </div>
                    </div>`;
            }
            if (item.type === 'video-pair') {
                const makeMediaEl = (url, poster) => {
                    if (isImageUrl(url)) {
                        return `<div class="media-item"><img src="${url}"></div>`;
                    }
                    const p = poster ? `poster="${poster}"` : '';
                    return `<div class="media-item">
                        <video autoplay loop muted playsinline preload="metadata" disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" ${p}>
                            <source src="${url}" type="video/mp4">
                        </video>
                    </div>`;
                };
                return `<div class="media-item-pair">${makeMediaEl(item.url, item.poster)}${makeMediaEl(item.url2 || '', item.poster2 || '')}</div>`;
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
        this.showView('view-project');
        const container = document.getElementById('projectScroll');
        this.showSection(container, index);
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
