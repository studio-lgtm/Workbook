// Portfolio App - Main JavaScript

class PortfolioApp {
    constructor() {
        this.projects = [];
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.renderProjectsDropdown();
        this.renderProjects();
        this.setupDropdownToggle();
        this.setupScrollSpy();
    }

    async loadProjects() {
        try {
            const response = await fetch('projects.json');
            const data = await response.json();
            this.projects = data.projects || [];
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projects = [];
        }
    }

    renderProjectsDropdown() {
        const dropdown = document.getElementById('projectsDropdown');
        if (!dropdown) return;

        dropdown.innerHTML = this.projects.map(project => `
            <a href="#${this.createSlug(project.title)}" class="dropdown-link" data-project="${this.createSlug(project.title)}">
                ${project.title}
            </a>
        `).join('');
    }

    setupDropdownToggle() {
        const toggle = document.getElementById('projectsToggle');
        const dropdown = document.getElementById('projectsDropdown');

        if (!toggle || !dropdown) return;

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                dropdown.classList.remove('show');
            }
        });

        // Close dropdown when clicking a project link
        dropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-link')) {
                dropdown.classList.remove('show');
            }
        });
    }

    renderProjects() {
        const container = document.getElementById('projectsContainer');
        if (!container) return;

        container.innerHTML = this.projects.map(project => this.createProjectHTML(project)).join('');
    }

    createProjectHTML(project) {
        const slug = this.createSlug(project.title);
        const mediaHTML = this.createMediaHTML(project.media);
        const creditsHTML = project.credits ? `<div class="project-credits">${project.credits}</div>` : '';
        const linkHTML = project.link ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link">View Project →</a>` : '';

        return `
            <section class="project-section" id="${slug}">
                <div class="project-info">
                    <h2 class="project-title">${project.title}</h2>
                    <div class="project-description">${project.description}</div>
                    ${creditsHTML}
                    ${linkHTML}
                </div>
                <div class="project-media-container">
                    ${mediaHTML}
                </div>
            </section>
        `;
    }

    createMediaHTML(media) {
        if (!media || media.length === 0) return '';

        return media.map(item => {
            if (item.type === 'image') {
                return `
                    <div class="media-item">
                        <img src="${item.url}" alt="${item.alt || ''}" loading="lazy">
                    </div>
                `;
            } else if (item.type === 'video') {
                const videoSrc = item.url;
                const posterAttr = item.poster ? `poster="${item.poster}"` : '';
                const mutedAttr = item.muted !== false ? 'muted' : '';

                return `
                    <div class="media-item">
                        <video
                            ${item.autoplay ? 'autoplay' : ''}
                            ${item.loop ? 'loop' : ''}
                            ${mutedAttr}
                            ${posterAttr}
                            playsinline
                            preload="metadata"
                            disablePictureInPicture
                            controlsList="nodownload nofullscreen noremoteplayback">
                            <source src="${videoSrc}" type="video/mp4">
                            ${item.poster ? `<img src="${item.poster}" alt="${item.alt || 'Video thumbnail'}">` : ''}
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            }
            return '';
        }).join('');
    }

    createSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    setupScrollSpy() {
        const dropdownLinks = document.querySelectorAll('.dropdown-link');
        const sections = document.querySelectorAll('.project-section');

        if (dropdownLinks.length === 0 || sections.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -66% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    dropdownLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-project') === id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PortfolioApp());
} else {
    new PortfolioApp();
}
