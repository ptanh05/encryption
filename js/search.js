// ============================================
// SEARCH FUNCTIONALITY
// ============================================

const SearchSystem = {
    lessons: [],
    searchInput: null,
    searchResults: null,
    
    init() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        
        if (!this.searchInput || !this.searchResults) return;
        
        this.loadLessons();
        this.setupEventListeners();
    },
    
    async loadLessons() {
        try {
            const response = await fetch('data/lessons.json');
            const data = await response.json();
            this.lessons = data.lessons || [];
        } catch (error) {
            console.error('Error loading lessons:', error);
            this.lessons = [];
        }
    },
    
    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value) {
                this.handleSearch(this.searchInput.value);
            }
        });
        
        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && 
                !this.searchResults.contains(e.target)) {
                this.searchResults.style.display = 'none';
            }
        });
    },
    
    handleSearch(query) {
        const searchTerm = query.trim().toLowerCase();
        
        if (searchTerm.length < 2) {
            this.searchResults.style.display = 'none';
            this.searchResults.innerHTML = '';
            return;
        }
        
        const results = this.lessons.filter(lesson => {
            const title = lesson.title.toLowerCase();
            const desc = lesson.description.toLowerCase();
            return title.includes(searchTerm) || desc.includes(searchTerm);
        });
        
        this.displayResults(results, searchTerm);
    },
    
    displayResults(results, searchTerm) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    <p>Không tìm thấy bài học nào với từ khóa "${searchTerm}"</p>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = results.map(lesson => {
                const lessonPath = `lessons/lesson-${String(lesson.id).padStart(2, '0')}-${this.slugify(lesson.title)}.html`;
                return `
                    <a href="${lessonPath}" class="search-result-item">
                        <div class="search-result-title">${this.highlight(lesson.title, searchTerm)}</div>
                        <div class="search-result-desc">${lesson.description}</div>
                        <div class="search-result-meta">
                            <span>📚 Module ${lesson.module}</span>
                            <span>⏱️ ${lesson.duration}</span>
                            <span>⭐ ${lesson.difficulty}</span>
                        </div>
                    </a>
                `;
            }).join('');
        }
        
        this.searchResults.style.display = 'block';
    },
    
    highlight(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    slugify(text) {
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
};

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchSystem.init());
} else {
    SearchSystem.init();
}

