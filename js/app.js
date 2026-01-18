// Portfolio App - Main JavaScript

class PortfolioApp {
    constructor() {
        this.projects = [];
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.renderSidebar();
        this.renderProjects();
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

    renderSidebar() {
        const sidebarNav = document.getElementById('sidebarNav');
        if (!sidebarNav) return;

        sidebarNav.innerHTML = this.projects.map(project => `
            <a href="#${this.createSlug(project.title)}" class="sidebar-link" data-project="${this.createSlug(project.title)}">
                ${project.title}
            </a>
        `).join('');
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
                <h2 class="project-title">${project.title}</h2>
                <div class="project-description">${project.description}</div>
                ${creditsHTML}
                ${linkHTML}
                ${mediaHTML}
            </section>
        `;
    }

    createMediaHTML(media) {
        if (!media || media.length === 0) return '';

        // Determine grid layout based on media count
        const gridClass = media.length === 1 ? 'grid-1' : 'grid-2';

        const mediaItems = media.map(item => {
            if (item.type === 'image') {
                return `
                    <div class="media-item">
                        <img src="${item.url}" alt="${item.alt || ''}" loading="lazy">
                    </div>
                `;
            } else if (item.type === 'video') {
                return `
                    <div class="media-item">
                        <video controls ${item.autoplay ? 'autoplay' : ''} ${item.loop ? 'loop' : ''} muted playsinline>
                            <source src="${item.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            }
            return '';
        }).join('');

        return `<div class="project-media ${gridClass}">${mediaItems}</div>`;
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
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        const sections = document.querySelectorAll('.project-section');

        if (sidebarLinks.length === 0 || sections.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -66% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    sidebarLinks.forEach(link => {
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
