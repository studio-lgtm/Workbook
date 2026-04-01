class App {
    constructor() {
        this.projects = [];
        this.homepageAssets = [];
        this.slideshowIndex = 0;
        this.currentProjectIndex = 0;
        this.currentSlideIndex = 0;
        this.dimmedView = null;
        this.infoOpen = false;
        this.infoTransitioning = false;
        this.slidDownViews = [];
        this.init();
    }

    async init() {
        await this.loadData();
        await this.loadInfo();
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
        this.projects = (projectsData.projects || []).filter(p => !p.hidden);
        this.homepageAssets = landingData.images || [];
    }

    async loadInfo() {
        const data = await fetch('info.json').then(r => r.json()).catch(() => ({}));
        const el = document.getElementById('info-panel-content');
        if (el && data.body) el.innerHTML = data.body;
    }


    // ── HOME SLIDESHOW ──────────────────────────────────────────────

    renderHomeSlideshow() {
        const container = document.getElementById('homeSlideshow');
        if (!container || this.homepageAssets.length === 0) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;image-rendering:pixelated;pointer-events:none;z-index:1;opacity:0;';
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
                el.preload = i === 0 ? 'auto' : 'none';
            } else {
                el = document.createElement('img');
                el.alt = asset.alt || '';
            }
            // Only set src immediately for the first asset; defer the rest
            if (i === 0) {
                el.src = asset.url;
                el.classList.add('active');
            } else {
                el.dataset.src = asset.url;
            }
            container.appendChild(el);
        });

        container.parentElement.addEventListener('click', () => this.advanceSlideshow());
    }

    advanceSlideshow() {
        const container = document.getElementById('homeSlideshow');
        const items = container.querySelectorAll('img, video');
        if (items.length === 0) return;
        items[this.slideshowIndex].classList.remove('active');
        this.slideshowIndex = (this.slideshowIndex + 1) % items.length;
        const next = items[this.slideshowIndex];

        // Load deferred asset on first access
        if (next.dataset.src) {
            next.src = next.dataset.src;
            delete next.dataset.src;
            if (next.tagName === 'VIDEO') next.load();
        }

        next.classList.add('active');
        if (next.tagName === 'IMG' && this.slideshowCanvas) {
            this.runSlideshowPixelation(next);
        }

        // Preload the one after next
        const preloadIndex = (this.slideshowIndex + 1) % items.length;
        const preloadEl = items[preloadIndex];
        if (preloadEl?.dataset.src) {
            preloadEl.src = preloadEl.dataset.src;
            delete preloadEl.dataset.src;
            if (preloadEl.tagName === 'VIDEO') { preloadEl.preload = 'auto'; preloadEl.load(); }
        }
    }

    runSlideshowPixelation(img) {
        const canvas = this.slideshowCanvas;
        const ctx = canvas.getContext('2d');
        const steps = [6, 12, 24, 48, 96];

        const run = () => {
            const containerRect = canvas.parentElement.getBoundingClientRect();
            const imgRect = img.getBoundingClientRect();
            if (!imgRect.width || !imgRect.height) return;

            // Size and position canvas to exactly match the image, not the full container
            const left = imgRect.left - containerRect.left;
            const top = imgRect.top - containerRect.top;
            Object.assign(canvas.style, {
                left: left + 'px',
                top: top + 'px',
                width: imgRect.width + 'px',
                height: imgRect.height + 'px',
                transition: 'none',
                opacity: '1',
            });
            canvas.width = Math.round(imgRect.width);
            canvas.height = Math.round(imgRect.height);
            ctx.imageSmoothingEnabled = false;

            let step = 0;
            const next = () => {
                if (step >= steps.length) {
                    canvas.style.transition = 'opacity 0.15s ease';
                    canvas.style.opacity = '0';
                    return;
                }
                const px = steps[step++];
                const cw = canvas.width;
                const ch = canvas.height;
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
            run();
        } else {
            img.addEventListener('load', run, { once: true });
        }
    }


    // ── SHARED UTILITIES ────────────────────────────────────────────

    // Expands image-pair / video-pair into individual items so each counts separately
    flattenMedia(media) {
        const isImg = url => /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(url || '');
        const result = [];
        for (const item of (media || [])) {
            if (item.type === 'image-pair') {
                result.push({ type: 'image', url: item.url, alt: item.alt });
                result.push({ type: 'image', url: item.url2 || '', alt: item.alt2 });
            } else if (item.type === 'video-pair') {
                result.push({ type: isImg(item.url) ? 'image' : 'video', url: item.url, loop: true, muted: true });
                result.push({ type: isImg(item.url2 || '') ? 'image' : 'video', url: item.url2 || '', loop: true, muted: true });
            } else {
                result.push(item);
            }
        }
        return result;
    }

    runPixelation(img, containerEl) {
        const steps = [6, 12, 24, 48, 96];
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;image-rendering:pixelated;pointer-events:none;z-index:1;opacity:0;';
        containerEl.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const run = () => {
            const containerRect = containerEl.getBoundingClientRect();
            const imgRect = img.getBoundingClientRect();
            if (!imgRect.width || !imgRect.height) { canvas.remove(); return; }

            const left = imgRect.left - containerRect.left;
            const top = imgRect.top - containerRect.top;
            Object.assign(canvas.style, {
                left: left + 'px',
                top: top + 'px',
                width: imgRect.width + 'px',
                height: imgRect.height + 'px',
                transition: 'none',
                opacity: '1',
            });
            canvas.width = Math.round(imgRect.width);
            canvas.height = Math.round(imgRect.height);
            ctx.imageSmoothingEnabled = false;

            let step = 0;
            const next = () => {
                if (step >= steps.length) {
                    canvas.style.transition = 'opacity 0.15s ease';
                    canvas.style.opacity = '0';
                    canvas.addEventListener('transitionend', () => canvas.remove(), { once: true });
                    return;
                }
                const px = steps[step++];
                const cw = canvas.width, ch = canvas.height;
                const sw = Math.max(1, Math.round(cw / px));
                const sh = Math.max(1, Math.round(ch / px));
                ctx.clearRect(0, 0, cw, ch);
                ctx.drawImage(img, 0, 0, sw, sh);
                ctx.drawImage(canvas, 0, 0, sw, sh, 0, 0, cw, ch);
                setTimeout(next, 40);
            };
            next();
        };

        if (img.complete && img.naturalWidth) run();
        else img.addEventListener('load', run, { once: true });
    }

    runVideoPixelation(video, containerEl) {
        video.pause();

        const doEffect = () => {
            const steps = [6, 12, 24, 48, 96];
            const canvas = document.createElement('canvas');
            canvas.style.cssText = 'position:absolute;image-rendering:pixelated;pointer-events:none;z-index:1;opacity:0;';
            containerEl.appendChild(canvas);
            const ctx = canvas.getContext('2d');

            const containerRect = containerEl.getBoundingClientRect();
            const videoRect = video.getBoundingClientRect();
            if (!videoRect.width || !videoRect.height) { canvas.remove(); video.play(); return; }

            const left = videoRect.left - containerRect.left;
            const top = videoRect.top - containerRect.top;
            Object.assign(canvas.style, {
                left: left + 'px',
                top: top + 'px',
                width: videoRect.width + 'px',
                height: videoRect.height + 'px',
                transition: 'none',
                opacity: '1',
            });
            canvas.width = Math.round(videoRect.width);
            canvas.height = Math.round(videoRect.height);
            ctx.imageSmoothingEnabled = false;

            let step = 0;
            const cw = canvas.width, ch = canvas.height;
            const next = () => {
                if (step >= steps.length) {
                    canvas.style.transition = 'opacity 0.15s ease';
                    canvas.style.opacity = '0';
                    canvas.addEventListener('transitionend', () => {
                        canvas.remove();
                        video.play();
                    }, { once: true });
                    return;
                }
                const px = steps[step++];
                const sw = Math.max(1, Math.round(cw / px));
                const sh = Math.max(1, Math.round(ch / px));
                ctx.clearRect(0, 0, cw, ch);
                ctx.drawImage(video, 0, 0, sw, sh);
                ctx.drawImage(canvas, 0, 0, sw, sh, 0, 0, cw, ch);
                setTimeout(next, 40);
            };
            next();
        };

        const ready = () => {
            if (video.readyState >= 2) {
                doEffect();
            } else {
                video.addEventListener('loadeddata', doEffect, { once: true });
            }
        };

        if (video.currentTime !== 0) {
            video.currentTime = 0;
            video.addEventListener('seeked', ready, { once: true });
        } else {
            ready();
        }

        if (video.readyState < 1) video.load();
    }


    // ── PROJECTS GALLERY ────────────────────────────────────────────

    renderGallery() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        // Build slot list: every 3rd slot (s % 3 === 2) is blank
        const slots = [];
        let pi = 0, s = 0;
        while (pi < this.projects.length) {
            if (s % 3 === 2) {
                slots.push(null);
            } else {
                slots.push(this.projects[pi++]);
            }
            s++;
        }

        grid.innerHTML = slots.map(project => {
            if (!project) return `<div class="gallery-item-blank"></div>`;

            const i = this.projects.indexOf(project);
            const thumb = project.thumbnail
                || (project.media && project.media.find(m => m.type === 'image')?.url)
                || (project.media && project.media[0]?.url)
                || '';
            const isVideo = thumb && !project.thumbnail && project.media && project.media[0]?.type === 'video';
            const imgHTML = thumb && !isVideo
                ? `<img src="${thumb}" alt="${project.title}" loading="lazy">`
                : '';
            const assetCount = this.flattenMedia(project.media).length;
            return `
                <div class="gallery-item" data-index="${i}"${project.locked ? ' data-locked="true"' : ''}>
                    <div class="gallery-img-wrap">${imgHTML}</div>
                    <div class="gallery-item-label">
                        <span>${project.title}</span>
                        ${!project.locked ? `<span class="gallery-item-count">(${assetCount} assets)</span>` : ''}
                    </div>
                    ${project.locked ? '<div class="gallery-item-confidential">Confidential</div>' : ''}
                </div>
            `;
        }).join('');

        grid.addEventListener('click', e => {
            const item = e.target.closest('.gallery-item');
            if (!item) return;
            const index = parseInt(item.dataset.index);
            if (this.projects[index]?.locked) return;
            this.openProject(index);
        });
    }


    // ── PROJECT DETAIL ──────────────────────────────────────────────

    renderProjectScroll() {
        const container = document.getElementById('projectScroll');
        if (!container) return;

        container.innerHTML = this.projects.map((project, i) => {
            const flat = this.flattenMedia(project.media);
            const total = flat.length;
            const slides = flat.map((item, si) =>
                `<div class="project-slide${si === 0 ? ' active' : ''}" data-slide="${si}">
                    ${this.createSlideHTML(item)}
                </div>`
            ).join('');
            return `<section class="project-section" data-index="${i}">
                <div class="project-slideshow">${slides}</div>
                <div class="project-asset-counter">
                    <span class="counter-current">1</span> / ${total}
                </div>
            </section>`;
        }).join('');

        container.addEventListener('click', e => {
            if (e.clientX < window.innerWidth / 2) {
                this.prevProjectSlide();
            } else {
                this.advanceProjectSlide();
            }
        });
    }

    createSlideHTML(item) {
        if (item.type === 'image') {
            return `<img src="${item.url}" alt="${item.alt || ''}" loading="lazy">`;
        }
        if (item.type === 'video') {
            const poster = item.poster ? `poster="${item.poster}"` : '';
            const muted = item.muted !== false ? 'muted' : '';
            return `<video ${item.loop ? 'loop' : ''} ${muted} ${poster} playsinline preload="none" disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback">
                <source src="${item.url}" type="video/mp4">
            </video>`;
        }
        if (item.type === 'image-pair') {
            return `<div class="project-slide-pair">
                <img src="${item.url}" alt="${item.alt || ''}" loading="lazy">
                <img src="${item.url2 || ''}" alt="${item.alt2 || ''}" loading="lazy">
            </div>`;
        }
        if (item.type === 'video-pair') {
            const isImg = url => /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(url || '');
            const makeEl = url => isImg(url)
                ? `<img src="${url}" loading="lazy">`
                : `<video autoplay loop muted playsinline preload="none" disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback"><source src="${url}" type="video/mp4"></video>`;
            return `<div class="project-slide-pair">${makeEl(item.url)}${makeEl(item.url2 || '')}</div>`;
        }
        return '';
    }

    advanceProjectSlide() {
        const container = document.getElementById('projectScroll');
        const section = container.querySelector('.project-section.active');
        if (!section) return;

        const slides = section.querySelectorAll('.project-slide');
        if (slides.length <= 1) return;

        // Pause any video on the outgoing slide
        const outgoing = slides[this.currentSlideIndex];
        outgoing.querySelector('video')?.pause();
        outgoing.classList.remove('active');

        this.currentSlideIndex = (this.currentSlideIndex + 1) % slides.length;
        const nextSlide = slides[this.currentSlideIndex];
        nextSlide.classList.add('active');

        const counter = section.querySelector('.counter-current');
        if (counter) counter.textContent = this.currentSlideIndex + 1;

        const img = nextSlide.querySelector('img');
        const video = nextSlide.querySelector('video');
        if (img) this.runPixelation(img, nextSlide);
        else if (video) {
            if (video.preload === 'none') { video.preload = 'auto'; video.load(); }
            this.runVideoPixelation(video, nextSlide);
        }
    }

    prevProjectSlide() {
        const container = document.getElementById('projectScroll');
        const section = container.querySelector('.project-section.active');
        if (!section) return;

        const slides = section.querySelectorAll('.project-slide');
        if (slides.length <= 1) return;

        const outgoing = slides[this.currentSlideIndex];
        outgoing.querySelector('video')?.pause();
        outgoing.classList.remove('active');

        this.currentSlideIndex = (this.currentSlideIndex - 1 + slides.length) % slides.length;
        const prevSlide = slides[this.currentSlideIndex];
        prevSlide.classList.add('active');

        const counter = section.querySelector('.counter-current');
        if (counter) counter.textContent = this.currentSlideIndex + 1;

        const img = prevSlide.querySelector('img');
        const video = prevSlide.querySelector('video');
        if (img) this.runPixelation(img, prevSlide);
        else if (video) {
            if (video.preload === 'none') { video.preload = 'auto'; video.load(); }
            this.runVideoPixelation(video, prevSlide);
        }
    }

    getNextProjectIndex(fromIndex) {
        const total = this.projects.length;
        for (let i = 1; i <= total; i++) {
            const idx = (fromIndex + i) % total;
            if (!this.projects[idx].locked) return idx;
        }
        return -1;
    }

    showSection(container, index) {
        this.currentProjectIndex = index;
        this.currentSlideIndex = 0;

        // Pause all videos in the currently active section before switching
        container.querySelectorAll('.project-section.active video').forEach(v => v.pause());

        container.querySelectorAll('.project-section').forEach(s => s.classList.remove('active'));
        const section = container.querySelector(`.project-section[data-index="${index}"]`);
        if (section) {
            section.classList.add('active');
            section.querySelectorAll('.project-slide').forEach((s, i) => {
                s.classList.toggle('active', i === 0);
            });
            const counter = section.querySelector('.counter-current');
            if (counter) counter.textContent = '1';

            const firstSlide = section.querySelector('.project-slide.active');
            if (firstSlide) {
                const img = firstSlide.querySelector('img');
                const video = firstSlide.querySelector('video');
                if (img) requestAnimationFrame(() => this.runPixelation(img, firstSlide));
                else if (video) {
                    if (video.preload === 'none') { video.preload = 'auto'; video.load(); }
                    requestAnimationFrame(() => this.runVideoPixelation(video, firstSlide));
                }
            }
        }

        const project = this.projects[index];
        if (!project) return;

        const infoEl = document.getElementById('projectNavInfo');
        if (infoEl) {
            const parts = [project.title, project.description].filter(Boolean);
            infoEl.textContent = parts.join(' — ');
        }

        const titleM = document.getElementById('projectInfoTitleM');
        if (titleM) titleM.textContent = project.title || '';
        const descM = document.getElementById('projectInfoDescM');
        if (descM) descM.textContent = project.description || '';

        // Reset mobile drawer
        const mobileNav = document.getElementById('projectNavMobile');
        if (mobileNav) mobileNav.classList.remove('open');
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
        // Force-close info if open so its state doesn't bleed across view switches
        if (this.infoOpen) {
            this.infoOpen = false;
            this.infoTransitioning = false;
            this.slidDownViews = [];
            const panel = document.getElementById('info-panel');
            panel.style.transition = 'none';
            panel.style.opacity = '0';
            panel.style.pointerEvents = 'none';
        }
        document.querySelectorAll('.view').forEach(v => {
            const isTarget = v.id === id;
            v.classList.toggle('view--hidden', !isTarget);
            v.style.zIndex = isTarget ? 2 : 1;
            // Clear stuck transforms from info reveal — but skip view-project
            // which manages its own slide animation via CSS transition
            if (v.id !== 'view-project') {
                v.style.transition = 'none';
                v.style.transform = '';
                v.style.opacity = '';
                v.style.pointerEvents = '';
            }
        });

        // Underline Index link when on the index view
        const onIndex = id === 'view-projects';
        document.querySelectorAll('#openProjects, #closeProjects').forEach(el => {
            el.classList.toggle('nav-active', onIndex);
        });
        // Clear info underline when switching views
        document.querySelectorAll('.info-link').forEach(el => el.classList.remove('nav-active'));
    }

    isLightColor(hex) {
        if (!hex) return false;
        let h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        if (h.length !== 6) return false;
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) > 128;
    }

    setProjectHeaderColor(isLight) {
        const color = isLight ? '#000' : '';
        const blend = isLight ? 'normal' : '';
        const view = document.getElementById('view-project');
        [
            view.querySelector('#closeProject'),
            view.querySelector('.project-info-header'),
            view.querySelector('#projectNavInfo'),
            view.querySelector('#projectInfoTitleM'),
            view.querySelector('.project-mobile-sep'),
            view.querySelector('#projectInfoToggle'),
            view.querySelector('#projectInfoClose'),
            view.querySelector('.project-asset-counter'),
        ].forEach(el => {
            if (!el) return;
            el.style.color = color;
            el.style.mixBlendMode = blend;
        });
    }

    openProject(index) {
        const project = this.projects[index];
        const view = document.getElementById('view-project');
        if (view) {
            view.style.backgroundColor = project?.backgroundColor || '';
            this.setProjectHeaderColor(this.isLightColor(project?.backgroundColor));
        }

        // Dim the currently visible source view instead of hiding it instantly
        const sourceView = document.querySelector('.view:not(.view--hidden):not(#view-project)');
        if (sourceView) {
            this.dimmedView = sourceView;
            sourceView.style.transition = 'opacity 0.5s ease';
            sourceView.style.opacity = '0.5';
            sourceView.style.pointerEvents = 'none';
        }

        // Bring project view on top without hiding source
        view.style.zIndex = 3;
        view.classList.remove('view--hidden');

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
            document.querySelectorAll('#projectScroll .project-slide.active video').forEach(v => v.pause());

            const projectView = document.getElementById('view-project');

            // Restore dimmed source view
            if (this.dimmedView) {
                const src = this.dimmedView;
                src.style.transition = 'opacity 0.5s ease';
                src.style.opacity = '1';
                src.style.pointerEvents = '';
                this.dimmedView = null;
            }

            // Slide project view down over the restored source view
            projectView.style.zIndex = 3;
            projectView.classList.add('view--hidden');

            setTimeout(() => { projectView.style.zIndex = 1; }, 650);
        });

        document.getElementById('projectInfoToggle').addEventListener('click', () => {
            document.getElementById('projectNavMobile').classList.add('open');
        });

        document.getElementById('projectInfoClose').addEventListener('click', () => {
            document.getElementById('projectNavMobile').classList.remove('open');
        });

        document.querySelectorAll('.info-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                this.openInfo();
            });
        });

        const panel = document.getElementById('info-panel');
        panel.addEventListener('click', () => this.closeInfo());
    }

    openInfo() {
        if (this.infoOpen || this.infoTransitioning) return;
        this.infoOpen = true;
        this.infoTransitioning = true;
        document.querySelectorAll('.info-link').forEach(el => el.classList.add('nav-active'));

        // Only slide the single primary visible view — exclude project view and any dimmed source
        this.slidDownViews = Array.from(
            document.querySelectorAll('.view:not(.view--hidden)')
        ).filter(v => v.id !== 'view-project' && v !== this.dimmedView);

        this.slidDownViews.forEach(v => {
            v.style.transition = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
            v.style.transform = 'translateY(20%)';
            v.style.pointerEvents = 'none';
        });

        const panel = document.getElementById('info-panel');
        panel.style.transition = 'opacity 0.3s ease';
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'auto';

        setTimeout(() => { this.infoTransitioning = false; }, 650);
    }

    closeInfo() {
        if (!this.infoOpen || this.infoTransitioning) return;
        this.infoOpen = false;
        this.infoTransitioning = true;
        document.querySelectorAll('.info-link').forEach(el => el.classList.remove('nav-active'));

        this.slidDownViews.forEach(v => {
            v.style.transition = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
            v.style.transform = '';
            v.style.pointerEvents = '';
        });
        this.slidDownViews = [];

        const panel = document.getElementById('info-panel');
        panel.style.transition = 'opacity 0.3s ease';
        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';

        setTimeout(() => { this.infoTransitioning = false; }, 650);
    }
}

new App();
