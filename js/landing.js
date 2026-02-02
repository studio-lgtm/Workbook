// Landing Page Slideshow
class LandingSlideshow {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.init();
    }

    async init() {
        await this.loadImages();
        this.renderSlideshow();
        this.setupClickHandler();
    }

    async loadImages() {
        try {
            const response = await fetch('landing.json');
            const data = await response.json();
            this.images = data.images || [];
        } catch (error) {
            console.error('Error loading landing images:', error);
            this.images = [];
        }
    }

    renderSlideshow() {
        const container = document.getElementById('slideshowContainer');
        if (!container || this.images.length === 0) return;

        container.innerHTML = this.images.map((img, index) => `
            <img
                src="${img.url}"
                alt="${img.alt || ''}"
                class="slideshow-image ${index === 0 ? 'active' : ''}"
            >
        `).join('');
    }

    setupClickHandler() {
        const container = document.getElementById('slideshowContainer');
        if (!container) return;

        container.addEventListener('click', () => {
            this.nextImage();
        });
    }

    nextImage() {
        const images = document.querySelectorAll('.slideshow-image');
        if (images.length === 0) return;

        images[this.currentIndex].classList.remove('active');
        this.currentIndex = (this.currentIndex + 1) % images.length;
        images[this.currentIndex].classList.add('active');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LandingSlideshow());
} else {
    new LandingSlideshow();
}
