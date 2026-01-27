// ============================================
// SIMPLE AUTH SYSTEM (LOCALSTORAGE-BASED)
// ============================================

const AuthSystem = {
    users: {},
    currentUser: null,
    modal: null,
    mode: 'login', // 'login' | 'register'

    init() {
        this.loadState();
        this.setupAuthButton();
        this.createModal();
        this.updateUI();
    },

    loadState() {
        try {
            const rawUsers = localStorage.getItem('crypto-users');
            this.users = rawUsers ? JSON.parse(rawUsers) : {};
        } catch (e) {
            console.error('Failed to parse crypto-users from localStorage', e);
            this.users = {};
        }

        this.currentUser = localStorage.getItem('crypto-current-user') || null;
    },

    saveUsers() {
        localStorage.setItem('crypto-users', JSON.stringify(this.users));
    },

    setupAuthButton() {
        const btn = document.getElementById('authButton');
        if (!btn) return;

        btn.addEventListener('click', () => {
            this.openModal(this.currentUser ? 'profile' : 'login');
        });
    },

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'auth-modal hidden';
        this.modal.innerHTML = `
            <div class="auth-backdrop"></div>
            <div class="auth-dialog">
                <button class="auth-close" aria-label="Đóng">&times;</button>
                <div class="auth-tabs">
                    <button class="auth-tab auth-tab-login active" data-mode="login">Đăng nhập</button>
                    <button class="auth-tab auth-tab-register" data-mode="register">Đăng ký</button>
                </div>
                <div class="auth-body">
                    <form class="auth-form auth-form-login">
                        <label>
                            <span>Tên người dùng</span>
                            <input type="text" id="authLoginUsername" autocomplete="username" required>
                        </label>
                        <label class="auth-password-field">
                            <span>Mật khẩu</span>
                            <div class="auth-password-wrapper">
                                <input type="password" id="authLoginPassword" autocomplete="current-password" required>
                                <button type="button" class="auth-toggle-password" data-target="authLoginPassword" aria-label="Hiện / ẩn mật khẩu">👁</button>
                            </div>
                        </label>
                        <button type="submit" class="auth-submit">Đăng nhập</button>
                        <p class="auth-hint">Chưa có tài khoản? Chuyển sang tab <strong>Đăng ký</strong>.</p>
                        <p class="auth-message" id="authLoginMessage"></p>
                    </form>

                    <form class="auth-form auth-form-register hidden">
                        <label>
                            <span>Tên người dùng</span>
                            <input type="text" id="authRegisterUsername" autocomplete="username" required>
                        </label>
                        <label>
                            <span>Email</span>
                            <input type="email" id="authRegisterEmail" autocomplete="email" required>
                        </label>
                        <label class="auth-password-field">
                            <span>Mật khẩu</span>
                            <div class="auth-password-wrapper">
                                <input type="password" id="authRegisterPassword" autocomplete="new-password" required>
                                <button type="button" class="auth-toggle-password" data-target="authRegisterPassword" aria-label="Hiện / ẩn mật khẩu">👁</button>
                            </div>
                        </label>
                        <label class="auth-password-field">
                            <span>Nhập lại mật khẩu</span>
                            <div class="auth-password-wrapper">
                                <input type="password" id="authRegisterPassword2" autocomplete="new-password" required>
                                <button type="button" class="auth-toggle-password" data-target="authRegisterPassword2" aria-label="Hiện / ẩn mật khẩu">👁</button>
                            </div>
                        </label>
                        <button type="submit" class="auth-submit">Tạo tài khoản</button>
                        <p class="auth-hint">Tài khoản chỉ lưu trên trình duyệt của bạn (localStorage).</p>
                        <p class="auth-message" id="authRegisterMessage"></p>
                    </form>

                    <div class="auth-profile hidden">
                        <h3>Xin chào, <span id="authProfileName"></span> 👋</h3>
                        <p>Tiến độ học và cài đặt của bạn được lưu trên thiết bị này.</p>
                        <div class="auth-change-password">
                            <h4>Đổi mật khẩu</h4>
                            <p class="auth-hint">Nhập email đã đăng ký và mật khẩu hiện tại để xác minh.</p>
                            <label>
                                <span>Email</span>
                                <input type="email" id="authChangeEmail" autocomplete="email">
                            </label>
                            <label class="auth-password-field">
                                <span>Mật khẩu hiện tại</span>
                                <div class="auth-password-wrapper">
                                    <input type="password" id="authCurrentPassword" autocomplete="current-password">
                                    <button type="button" class="auth-toggle-password" data-target="authCurrentPassword" aria-label="Hiện / ẩn mật khẩu">👁</button>
                                </div>
                            </label>
                            <label class="auth-password-field">
                                <span>Mật khẩu mới</span>
                                <div class="auth-password-wrapper">
                                    <input type="password" id="authNewPassword" autocomplete="new-password">
                                    <button type="button" class="auth-toggle-password" data-target="authNewPassword" aria-label="Hiện / ẩn mật khẩu">👁</button>
                                </div>
                            </label>
                            <label class="auth-password-field">
                                <span>Nhập lại mật khẩu mới</span>
                                <div class="auth-password-wrapper">
                                    <input type="password" id="authNewPassword2" autocomplete="new-password">
                                    <button type="button" class="auth-toggle-password" data-target="authNewPassword2" aria-label="Hiện / ẩn mật khẩu">👁</button>
                                </div>
                            </label>
                            <button type="button" class="auth-change-submit">Cập nhật mật khẩu</button>
                            <p class="auth-message" id="authChangeMessage"></p>
                        </div>
                        <button class="auth-logout">Đăng xuất</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.bindModalEvents();
    },

    bindModalEvents() {
        if (!this.modal) return;

        const backdrop = this.modal.querySelector('.auth-backdrop');
        const closeBtn = this.modal.querySelector('.auth-close');
        const tabs = this.modal.querySelectorAll('.auth-tab');
        const loginForm = this.modal.querySelector('.auth-form-login');
        const registerForm = this.modal.querySelector('.auth-form-register');
        const logoutBtn = this.modal.querySelector('.auth-logout');
        const changeBtn = this.modal.querySelector('.auth-change-submit');

        backdrop.addEventListener('click', () => this.closeModal());
        closeBtn.addEventListener('click', () => this.closeModal());

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.getAttribute('data-mode');
                if (mode === 'login' || mode === 'register') {
                    this.switchMode(mode);
                }
            });
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        if (changeBtn) {
            changeBtn.addEventListener('click', () => {
                this.handleChangePassword();
            });
        }

        logoutBtn.addEventListener('click', () => {
            this.logout();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Toggle password visibility
        this.modal.querySelectorAll('.auth-toggle-password').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const input = this.modal.querySelector(`#${targetId}`);
                if (!input) return;
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.textContent = isPassword ? '🙈' : '👁';
            });
        });
    },

    openModal(mode = 'login') {
        if (!this.modal) return;
        this.modal.classList.remove('hidden');
        this.switchMode(mode === 'profile' && this.currentUser ? 'login' : mode);

        if (this.currentUser) {
            const profileName = this.modal.querySelector('#authProfileName');
            profileName.textContent = this.currentUser;
        }
    },

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.add('hidden');
    },

    switchMode(mode) {
        this.mode = mode;
        const loginForm = this.modal.querySelector('.auth-form-login');
        const registerForm = this.modal.querySelector('.auth-form-register');
        const profileBox = this.modal.querySelector('.auth-profile');
        const tabLogin = this.modal.querySelector('.auth-tab-login');
        const tabRegister = this.modal.querySelector('.auth-tab-register');

        if (this.currentUser) {
            profileBox.classList.remove('hidden');
        } else {
            profileBox.classList.add('hidden');
        }

        if (mode === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            tabLogin.classList.remove('active');
            tabRegister.classList.add('active');
        }

        this.clearMessages();
    },

    clearMessages() {
        const msgs = this.modal.querySelectorAll('.auth-message');
        msgs.forEach(m => {
            m.textContent = '';
            m.classList.remove('error', 'success');
        });
    },

    handleRegister() {
        const usernameEl = this.modal.querySelector('#authRegisterUsername');
        const emailEl = this.modal.querySelector('#authRegisterEmail');
        const passwordEl = this.modal.querySelector('#authRegisterPassword');
        const password2El = this.modal.querySelector('#authRegisterPassword2');
        const msgEl = this.modal.querySelector('#authRegisterMessage');

        const username = usernameEl.value.trim();
        const email = emailEl.value.trim();
        const password = passwordEl.value;
        const password2 = password2El.value;

        this.clearMessages();

        if (username.length < 3) {
            this.showMessage(msgEl, 'Tên người dùng phải có ít nhất 3 ký tự.', 'error');
            return;
        }

        if (!email || !email.includes('@')) {
            this.showMessage(msgEl, 'Email không hợp lệ.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage(msgEl, 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
            return;
        }

        if (password !== password2) {
            this.showMessage(msgEl, 'Mật khẩu nhập lại không khớp.', 'error');
            return;
        }

        if (this.users[username]) {
            this.showMessage(msgEl, 'Tên người dùng đã tồn tại. Vui lòng chọn tên khác.', 'error');
            return;
        }

        this.users[username] = {
            password: this.simpleHash(password),
            email,
            createdAt: new Date().toISOString()
        };
        this.saveUsers();

        this.showMessage(msgEl, 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');
        usernameEl.value = '';
        emailEl.value = '';
        passwordEl.value = '';
        password2El.value = '';
    },

    handleLogin() {
        const usernameEl = this.modal.querySelector('#authLoginUsername');
        const passwordEl = this.modal.querySelector('#authLoginPassword');
        const msgEl = this.modal.querySelector('#authLoginMessage');

        const username = usernameEl.value.trim();
        const password = passwordEl.value;

        this.clearMessages();

        const user = this.users[username];
        if (!user) {
            this.showMessage(msgEl, 'Tài khoản không tồn tại.', 'error');
            return;
        }

        if (user.password !== this.simpleHash(password)) {
            this.showMessage(msgEl, 'Mật khẩu không đúng.', 'error');
            return;
        }

        this.currentUser = username;
        localStorage.setItem('crypto-current-user', username);
        this.updateUI();
        this.showMessage(msgEl, 'Đăng nhập thành công!', 'success');

        setTimeout(() => this.closeModal(), 700);
    },

    handleChangePassword() {
        if (!this.currentUser) return;

        const emailEl = this.modal.querySelector('#authChangeEmail');
        const currentPwdEl = this.modal.querySelector('#authCurrentPassword');
        const newPwdEl = this.modal.querySelector('#authNewPassword');
        const newPwd2El = this.modal.querySelector('#authNewPassword2');
        const msgEl = this.modal.querySelector('#authChangeMessage');

        const email = emailEl.value.trim();
        const currentPwd = currentPwdEl.value;
        const newPwd = newPwdEl.value;
        const newPwd2 = newPwd2El.value;

        this.clearMessages();

        const user = this.users[this.currentUser];
        if (!user) {
            this.showMessage(msgEl, 'Không tìm thấy tài khoản.', 'error');
            return;
        }

        if (!user.email) {
            this.showMessage(msgEl, 'Tài khoản này chưa có email. Vui lòng tạo tài khoản mới để dùng chức năng này.', 'error');
            return;
        }

        if (email.toLowerCase() !== String(user.email).toLowerCase()) {
            this.showMessage(msgEl, 'Email không khớp với email đã đăng ký.', 'error');
            return;
        }

        if (user.password !== this.simpleHash(currentPwd)) {
            this.showMessage(msgEl, 'Mật khẩu hiện tại không đúng.', 'error');
            return;
        }

        if (newPwd.length < 6) {
            this.showMessage(msgEl, 'Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
            return;
        }

        if (newPwd !== newPwd2) {
            this.showMessage(msgEl, 'Mật khẩu mới nhập lại không khớp.', 'error');
            return;
        }

        user.password = this.simpleHash(newPwd);
        this.saveUsers();

        this.showMessage(msgEl, 'Đổi mật khẩu thành công ✅', 'success');
        currentPwdEl.value = '';
        newPwdEl.value = '';
        newPwd2El.value = '';
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('crypto-current-user');
        this.updateUI();
        this.closeModal();
    },

    updateUI() {
        const btn = document.getElementById('authButton');
        if (!btn) return;

        if (this.currentUser) {
            btn.textContent = this.currentUser;
            btn.classList.add('auth-btn-logged-in');
        } else {
            btn.textContent = 'Đăng nhập';
            btn.classList.remove('auth-btn-logged-in');
        }
    },

    showMessage(element, text, type) {
        if (!element) return;
        element.textContent = text;
        element.classList.add(type);
    },

    // Simple reversible "hash" (not secure – for demo only)
    simpleHash(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch {
            return str;
        }
    }
};

// Initialize auth on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthSystem.init());
} else {
    AuthSystem.init();
}


