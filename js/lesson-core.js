// ============================================
// LESSON CORE SYSTEM - Progress Tracking, Quiz, Challenges
// ============================================

const LessonCore = {
    progress: {},
    currentLesson: null,
    
    // Mapping từ số bài học sang tên file
    lessonFiles: {
        1: 'lesson-01-introduction.html',
        2: 'lesson-02-fundamentals.html',
        3: 'lesson-03-pigpen.html',
        4: 'lesson-04-caesar.html',
        5: 'lesson-05-vigenere.html',
        6: 'lesson-06-frequency-analysis.html',
        7: 'lesson-07-cryptanalysis.html',
        8: 'lesson-08-symmetric.html',
        9: 'lesson-09-asymmetric.html',
        10: 'lesson-10-hash-signatures.html',
        11: 'lesson-11-applications.html'
    },
    
    init() {
        this.loadProgress();
        this.updateNavigation();
        this.setupEventListeners();
    },
    
    loadProgress() {
        const saved = localStorage.getItem('crypto-lesson-progress');
        this.progress = saved ? JSON.parse(saved) : {};
    },
    
    saveProgress() {
        localStorage.setItem('crypto-lesson-progress', 
            JSON.stringify(this.progress));
    },
    
    getLessonProgress(lessonId) {
        return this.progress[lessonId] || { 
            completed: false, 
            score: 0, 
            quizScore: 0,
            challengesCompleted: 0 
        };
    },
    
    markLessonComplete(lessonId, score = 100) {
        if (!this.progress[lessonId]) {
            this.progress[lessonId] = { 
                completed: false, 
                score: 0,
                quizScore: 0,
                challengesCompleted: 0,
                timestamp: null
            };
        }
        this.progress[lessonId].completed = true;
        this.progress[lessonId].score = score;
        this.progress[lessonId].timestamp = new Date().toISOString();
        this.saveProgress();
        this.updateNavigation();
        this.showCompletionMessage();
    },
    
    updateQuizScore(lessonId, score) {
        if (!this.progress[lessonId]) {
            this.progress[lessonId] = { 
                completed: false, 
                score: 0,
                quizScore: 0,
                challengesCompleted: 0
            };
        }
        this.progress[lessonId].quizScore = score;
        this.saveProgress();
    },
    
    completeChallenge(lessonId, challengeId) {
        if (!this.progress[lessonId]) {
            this.progress[lessonId] = { 
                completed: false, 
                score: 0,
                quizScore: 0,
                challengesCompleted: 0
            };
        }
        if (!this.progress[lessonId].challenges) {
            this.progress[lessonId].challenges = [];
        }
        if (!this.progress[lessonId].challenges.includes(challengeId)) {
            this.progress[lessonId].challenges.push(challengeId);
            this.progress[lessonId].challengesCompleted = 
                this.progress[lessonId].challenges.length;
        }
        this.saveProgress();
    },
    
    updateNavigation() {
        // Update progress bars on navigation
        document.querySelectorAll('.lesson-card').forEach((card, index) => {
            const lessonId = card.dataset.lesson;
            const progress = this.getLessonProgress(lessonId);
            const progressBar = card.querySelector('.lesson-progress');
            const checkmark = card.querySelector('.lesson-checkmark');
            
            if (progressBar) {
                const percentage = progress.completed ? 100 : Math.round(progress.score);
                progressBar.textContent = `${percentage}%`;
                
                // Animate progress update
                setTimeout(() => {
                    progressBar.style.opacity = '0';
                    setTimeout(() => {
                        progressBar.textContent = `${percentage}%`;
                        progressBar.style.opacity = '1';
                    }, 150);
                }, index * 50);
            }
            
            if (checkmark) {
                if (progress.completed) {
                    checkmark.style.display = 'flex';
                    setTimeout(() => {
                        checkmark.classList.add('animate-in');
                    }, 300);
                } else {
                    checkmark.style.display = 'none';
                }
            }
        });
        
        // Update overall progress
        this.updateOverallProgress();
    },
    
    updateOverallProgress() {
        const totalLessons = 11;
        let completed = 0;
        let totalScore = 0;
        
        for (let i = 1; i <= totalLessons; i++) {
            const prog = this.getLessonProgress(i);
            if (prog.completed) completed++;
            totalScore += prog.score;
        }
        
        const percentage = Math.round((completed / totalLessons) * 100);
        const avgScore = Math.round(totalScore / totalLessons);
        
        const progressBar = document.getElementById('overall-progress');
        const completedCount = document.getElementById('completed-count');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
            progressBar.textContent = percentage + '%';
        }
        
        if (completedCount) {
            completedCount.textContent = completed;
        }
    },
    
    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => this.goToNextLesson());
        });
        
        document.querySelectorAll('.btn-prev').forEach(btn => {
            btn.addEventListener('click', () => this.goToPrevLesson());
        });
        
        // Mark current lesson
        const lessonBody = document.body.classList.contains('lesson');
        if (lessonBody) {
            const lessonId = parseInt(document.body.dataset.lesson);
            this.currentLesson = lessonId;
            this.updateLessonProgressBar();
        }
    },
    
    updateLessonProgressBar() {
        if (!this.currentLesson) return;
        
        const progress = this.getLessonProgress(this.currentLesson);
        const progressBar = document.querySelector('.lesson-progress-bar .progress-fill');
        
        if (progressBar) {
            progressBar.style.width = progress.score + '%';
        }
    },
    
    goToNextLesson() {
        if (!this.currentLesson) return;
        const nextLesson = this.currentLesson + 1;
        if (nextLesson <= 11 && this.lessonFiles[nextLesson]) {
            window.location.href = this.lessonFiles[nextLesson];
        }
    },
    
    goToPrevLesson() {
        if (!this.currentLesson) return;
        const prevLesson = this.currentLesson - 1;
        if (prevLesson >= 1 && this.lessonFiles[prevLesson]) {
            window.location.href = this.lessonFiles[prevLesson];
        }
    },
    
    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = `
            <div class="completion-content">
                <h3>🎉 Chúc mừng!</h3>
                <p>Bạn đã hoàn thành bài học này!</p>
                <button onclick="this.parentElement.parentElement.remove()">Đóng</button>
            </div>
        `;
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }
};

// ============================================
// QUIZ SYSTEM
// ============================================

const QuizSystem = {
    currentQuiz: null,
    userAnswers: {},
    
    init(lessonId) {
        this.lessonId = lessonId;
        this.loadQuestions(lessonId);
        this.setupEventListeners();
    },
    
    loadQuestions(lessonId) {
        const container = document.querySelector('.quiz-questions');
        if (container) {
            container.innerHTML = '<div class="loading-state">⏳ Đang tải câu hỏi...</div>';
        }
        
        fetch(`../data/quizzes.json`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load quizzes');
                return res.json();
            })
            .then(data => {
                this.currentQuiz = data[lessonId] || [];
                if (this.currentQuiz.length === 0 && container) {
                    container.innerHTML = '<div class="empty-state">📝 Chưa có câu hỏi cho bài học này.</div>';
                } else {
                    this.renderQuiz();
                }
            })
            .catch((error) => {
                console.error('Error loading quiz:', error);
                this.currentQuiz = [];
                if (container) {
                    container.innerHTML = '<div class="error-state">❌ Không thể tải câu hỏi. Vui lòng thử lại sau.</div>';
                }
            });
    },
    
    renderQuiz() {
        const container = document.querySelector('.quiz-questions');
        if (!container || !this.currentQuiz) return;
        
        container.innerHTML = '';
        this.userAnswers = {};
        
        this.currentQuiz.forEach((q, index) => {
            const questionEl = this.createQuestionElement(q, index);
            container.appendChild(questionEl);
        });
    },
    
    createQuestionElement(question, index) {
        const div = document.createElement('div');
        div.className = 'quiz-question';
        div.dataset.questionId = index;
        
        let optionsHtml = '';
        if (question.type === 'multiple-choice') {
            optionsHtml = question.options.map((opt, i) => `
                <label class="quiz-option">
                    <input type="radio" name="q${index}" value="${i}">
                    <span>${opt}</span>
                </label>
            `).join('');
        } else if (question.type === 'true-false') {
            optionsHtml = `
                <label class="quiz-option">
                    <input type="radio" name="q${index}" value="true">
                    <span>Đúng</span>
                </label>
                <label class="quiz-option">
                    <input type="radio" name="q${index}" value="false">
                    <span>Sai</span>
                </label>
            `;
        }
        
        div.innerHTML = `
            <h4>${index + 1}. ${question.question}</h4>
            <div class="quiz-options">${optionsHtml}</div>
            <div class="quiz-feedback"></div>
        `;
        
        // Add change listener
        div.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.userAnswers[index] = e.target.value;
            });
        });
        
        return div;
    },
    
    checkAnswers() {
        if (!this.currentQuiz) return;
        
        let correct = 0;
        const total = this.currentQuiz.length;
        
        this.currentQuiz.forEach((q, index) => {
            const userAnswer = this.userAnswers[index];
            const questionEl = document.querySelector(`[data-question-id="${index}"]`);
            const feedbackEl = questionEl.querySelector('.quiz-feedback');
            
            let isCorrect = false;
            if (q.type === 'multiple-choice') {
                isCorrect = parseInt(userAnswer) === q.correctAnswer;
            } else if (q.type === 'true-false') {
                isCorrect = userAnswer === String(q.correctAnswer);
            }
            
            if (isCorrect) {
                correct++;
                feedbackEl.className = 'quiz-feedback correct';
                feedbackEl.textContent = '✓ Đúng!';
            } else {
                feedbackEl.className = 'quiz-feedback incorrect';
                feedbackEl.textContent = `✗ Sai. Đáp án đúng: ${this.getCorrectAnswerText(q)}`;
            }
        });
        
        const score = Math.round((correct / total) * 100);
        this.showScore(score);
        LessonCore.updateQuizScore(this.lessonId, score);
        
        return score;
    },
    
    getCorrectAnswerText(question) {
        if (question.type === 'multiple-choice') {
            return question.options[question.correctAnswer];
        } else {
            return question.correctAnswer ? 'Đúng' : 'Sai';
        }
    },
    
    showScore(score) {
        const scoreEl = document.querySelector('.quiz-score');
        if (scoreEl) {
            scoreEl.textContent = `Điểm: ${score}%`;
            scoreEl.style.display = 'block';
        }
    },
    
    setupEventListeners() {
        const submitBtn = document.querySelector('.quiz-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.checkAnswers());
        }
    }
};

// ============================================
// CHALLENGE SYSTEM
// ============================================

const ChallengeSystem = {
    currentChallenges: [],
    lessonId: null,
    
    init(lessonId) {
        this.lessonId = lessonId;
        this.loadChallenges(lessonId);
    },
    
    loadChallenges(lessonId) {
        const container = document.querySelector('.challenges-list');
        if (container) {
            container.innerHTML = '<div class="loading-state">⏳ Đang tải thử thách...</div>';
        }
        
        fetch(`../data/challenges.json`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load challenges');
                return res.json();
            })
            .then(data => {
                this.currentChallenges = data[lessonId] || [];
                if (this.currentChallenges.length === 0 && container) {
                    container.innerHTML = '<div class="empty-state">🎯 Chưa có thử thách cho bài học này.</div>';
                } else {
                    this.renderChallenges();
                }
            })
            .catch((error) => {
                console.error('Error loading challenges:', error);
                this.currentChallenges = [];
                if (container) {
                    container.innerHTML = '<div class="error-state">❌ Không thể tải thử thách. Vui lòng thử lại sau.</div>';
                }
            });
    },
    
    renderChallenges() {
        const container = document.querySelector('.challenges-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.currentChallenges.forEach((challenge, index) => {
            const challengeEl = this.createChallengeElement(challenge, index);
            container.appendChild(challengeEl);
        });
    },
    
    createChallengeElement(challenge, index) {
        const div = document.createElement('div');
        div.className = 'challenge-item';
        div.dataset.challengeId = index;
        
        const progress = LessonCore.getLessonProgress(this.lessonId);
        const isCompleted = progress.challenges && 
            progress.challenges.includes(index);
        
        div.innerHTML = `
            <div class="challenge-header">
                <h4>Thử thách ${index + 1}: ${challenge.title}</h4>
                ${isCompleted ? '<span class="challenge-badge">✓ Hoàn thành</span>' : ''}
            </div>
            <p class="challenge-description">${challenge.description}</p>
            <div class="challenge-input">
                <input type="text" class="challenge-answer" 
                       placeholder="${challenge.placeholder || 'Nhập đáp án...'}">
                <button class="challenge-submit">Kiểm tra</button>
            </div>
            <div class="challenge-feedback"></div>
        `;
        
        const submitBtn = div.querySelector('.challenge-submit');
        submitBtn.addEventListener('click', () => {
            this.checkChallenge(index, div);
        });
        
        return div;
    },
    
    checkChallenge(index, element) {
        const challenge = this.currentChallenges[index];
        const answerInput = element.querySelector('.challenge-answer');
        const feedbackEl = element.querySelector('.challenge-feedback');
        const userAnswer = answerInput.value.trim().toUpperCase();
        
        // Normalize answer for comparison
        const correctAnswer = challenge.answer.toUpperCase();
        const isCorrect = userAnswer === correctAnswer || 
            this.fuzzyMatch(userAnswer, correctAnswer);
        
        if (isCorrect) {
            feedbackEl.className = 'challenge-feedback correct';
            feedbackEl.textContent = '🎉 Chính xác! Bạn đã hoàn thành thử thách này!';
            LessonCore.completeChallenge(this.lessonId, index);
            answerInput.disabled = true;
            element.querySelector('.challenge-submit').disabled = true;
        } else {
            feedbackEl.className = 'challenge-feedback incorrect';
            feedbackEl.textContent = '❌ Chưa đúng. Hãy thử lại!';
            if (challenge.hint) {
                feedbackEl.textContent += ` 💡 Gợi ý: ${challenge.hint}`;
            }
        }
    },
    
    fuzzyMatch(str1, str2) {
        // Simple fuzzy matching - can be improved
        return str1.replace(/\s+/g, '') === str2.replace(/\s+/g, '');
    }
};

// ============================================
// ENHANCED UI INTERACTIONS
// ============================================

const UIEnhancements = {
    init() {
        this.setupThemeToggle();
        this.setupAnimations();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.setupProgressAnimations();
    },
    
    setupThemeToggle() {
        // Xóa tất cả nút theme toggle cũ (nếu có) để tránh trùng lặp
        const existingToggles = document.querySelectorAll('.theme-toggle');
        existingToggles.forEach(toggle => toggle.remove());

        // Check saved theme preference
        const savedTheme = localStorage.getItem('crypto-theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            document.documentElement.classList.add('light-theme');
        }
        
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        themeToggle.setAttribute('data-tooltip', 'Switch theme');

        // Trang bài học: nút nổi góc phải trên
        if (document.body.classList.contains('lesson')) {
            themeToggle.classList.add('theme-toggle--floating');
            document.body.appendChild(themeToggle);
        } else {
            // Trang chủ: đặt nút sau nút đăng nhập/đăng ký trong navbar
            const authButton = document.getElementById('authButton');
            if (authButton && authButton.parentNode) {
                themeToggle.classList.add('theme-toggle--navbar');
                authButton.insertAdjacentElement('afterend', themeToggle);
            } else {
                // Fallback: nút nổi nếu không tìm thấy navbar
                themeToggle.classList.add('theme-toggle--floating');
                document.body.appendChild(themeToggle);
            }
        }

        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            document.documentElement.classList.toggle('light-theme', isLight);
            themeToggle.innerHTML = isLight ? '☀️' : '🌙';
            localStorage.setItem('crypto-theme', isLight ? 'light' : 'dark');
        });
    },
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },
    
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe lesson cards and modules
        document.querySelectorAll('.lesson-card, .module, .lesson-content section').forEach(el => {
            observer.observe(el);
        });
    },
    
    setupProgressAnimations() {
        // Animate progress bars when they come into view
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const width = bar.style.width || '0%';
                        bar.style.width = '0%';
                        setTimeout(() => {
                            bar.style.width = width;
                        }, 100);
                    }
                });
            });
            observer.observe(bar);
        });
    },
    
    setupAnimations() {
        // Add staggered animation to lesson cards
        const lessonCards = document.querySelectorAll('.lesson-card');
        lessonCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    },
    
    typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    },
    
    animateProgressCircle(element, percentage) {
        element.style.background = `conic-gradient(var(--accent) ${percentage * 3.6}deg, var(--border) 0deg)`;
    }
};

// Light theme CSS - apply to entire page when html/body has `.light-theme`
const lightThemeCSS = `
/* Override design tokens when light theme is active */
body.light-theme {
    --back: #f8f9fa;
    --back-high: rgba(0, 0, 0, 0.03);
    --text: #212529;
    --text-low: #6c757d;
    --text-inv: #ffffff;
    --border: #dee2e6;
    --border-dark: #ced4da;
    --accent: #007bff;
    --accent-secondary: #ff6b6b;
    --success: #28a745;
    --warning: #ffc107;
    --error: #dc3545;
    --plain-bar: #74c0fc;
    --cypher-bar: #f76707;
}

/* Global page background */
html.light-theme,
body.light-theme {
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%);
    color: var(--text);
}

body.light-theme::before {
    background:
        radial-gradient(circle at 20% 80%, rgba(0, 123, 255, 0.12), transparent 55%),
        radial-gradient(circle at 80% 20%, rgba(255, 193, 7, 0.12), transparent 55%),
        radial-gradient(circle at 40% 40%, rgba(40, 167, 69, 0.08), transparent 55%);
}

/* Navbar */
body.light-theme .top-navbar {
    background: linear-gradient(135deg, rgba(248, 249, 250, 0.95), rgba(233, 236, 239, 0.95));
    border-bottom-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

body.light-theme .navbar-brand a {
    -webkit-text-fill-color: initial;
    color: #0b7285;
}

body.light-theme .nav-link {
    color: var(--text-low);
}

body.light-theme .nav-link:hover,
body.light-theme .nav-link.active {
    color: var(--text);
    background: rgba(0, 123, 255, 0.08);
}

/* Sections / cards */
body.light-theme section {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.98));
    border-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

body.light-theme section:hover {
    border-color: rgba(0, 123, 255, 0.25);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
}

body.light-theme .lesson-card {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(0, 0, 0, 0.06);
}

/* Inputs */
body.light-theme input,
body.light-theme textarea {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(0, 0, 0, 0.12);
    color: var(--text);
}

body.light-theme input::placeholder,
body.light-theme textarea::placeholder {
    color: var(--text-low);
}

body.light-theme input:focus,
body.light-theme textarea:focus {
    background: #ffffff;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.18), 0 4px 12px rgba(0, 123, 255, 0.12);
}

/* Auth dialog */
body.light-theme .auth-dialog {
    background: linear-gradient(135deg, #ffffff, #f8f9fa);
    border-color: rgba(0, 0, 0, 0.08);
}

body.light-theme .auth-backdrop {
    background: rgba(0, 0, 0, 0.35);
}

/* Progress bar */
body.light-theme .progress-bar {
    background: rgba(0, 0, 0, 0.05);
}

body.light-theme .progress-fill {
    background: linear-gradient(90deg, #007bff, #20c997);
}

/* Misc text colors */
body.light-theme .sub-heading,
body.light-theme .instruction {
    color: var(--text-low);
}

body.light-theme h1,
body.light-theme h2,
body.light-theme h3 {
    color: var(--text);
}
`;

// Add light theme styles
const style = document.createElement('style');
style.textContent = lightThemeCSS;
document.head.appendChild(style);

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        LessonCore.init();
        UIEnhancements.init();
    });
} else {
    LessonCore.init();
    UIEnhancements.init();
}

