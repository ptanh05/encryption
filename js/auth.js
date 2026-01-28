// ============================================
// SIMPLE AUTH SYSTEM (LOCALSTORAGE-BASED)
// ============================================

const AuthSystem = {
    users: {},
    currentUser: null,
    modal: null,
    mode: 'login', // 'login' | 'register' | 'forgot'
    forgotPasswordData: null, // Store email, username, and OTP during reset process

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
                        <p class="auth-hint"><a href="#" class="auth-forgot-link">Quên mật khẩu?</a></p>
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

                    <!-- Forgot Password Form - Step 1: Request Reset -->
                    <form class="auth-form auth-form-forgot hidden">
                        <h3>Quên mật khẩu</h3>
                        <p class="auth-hint">Nhập tên người dùng và email đã đăng ký để nhận mã xác minh.</p>
                        <label>
                            <span>Tên người dùng</span>
                            <input type="text" id="authForgotUsername" autocomplete="username" required>
                        </label>
                        <label>
                            <span>Email</span>
                            <input type="email" id="authForgotEmail" autocomplete="email" required>
                        </label>
                        <button type="submit" class="auth-submit">Gửi mã xác minh</button>
                        <p class="auth-hint"><a href="#" class="auth-back-to-login">← Quay lại đăng nhập</a></p>
                        <p class="auth-message" id="authForgotMessage"></p>
                    </form>

                    <!-- Forgot Password Form - Step 2: Verify OTP -->
                    <form class="auth-form auth-form-verify-otp hidden">
                        <h3>Xác minh mã OTP</h3>
                        <p class="auth-hint">Mã xác minh đã được gửi đến email của bạn. Vui lòng kiểm tra email (hoặc console của trình duyệt).</p>
                        <label>
                            <span>Mã xác minh (6 chữ số)</span>
                            <input type="text" id="authOTPCode" maxlength="6" pattern="[0-9]{6}" placeholder="000000" required>
                        </label>
                        <button type="submit" class="auth-submit">Xác minh</button>
                        <button type="button" class="auth-resend-otp">Gửi lại mã</button>
                        <p class="auth-hint"><a href="#" class="auth-back-to-forgot">← Quay lại</a></p>
                        <p class="auth-message" id="authOTPMessage"></p>
                    </form>

                    <!-- Forgot Password Form - Step 3: Reset Password -->
                    <form class="auth-form auth-form-reset-password hidden">
                        <h3>Đặt lại mật khẩu</h3>
                        <p class="auth-hint">Nhập mật khẩu mới cho tài khoản của bạn.</p>
                        <label class="auth-password-field">
                            <span>Mật khẩu mới</span>
                            <div class="auth-password-wrapper">
                                <input type="password" id="authResetPassword" autocomplete="new-password" required>
                                <button type="button" class="auth-toggle-password" data-target="authResetPassword" aria-label="Hiện / ẩn mật khẩu">👁</button>
                            </div>
                        </label>
                        <label class="auth-password-field">
                            <span>Nhập lại mật khẩu mới</span>
                            <div class="auth-password-wrapper">
                                <input type="password" id="authResetPassword2" autocomplete="new-password" required>
                                <button type="button" class="auth-toggle-password" data-target="authResetPassword2" aria-label="Hiện / ẩn mật khẩu">👁</button>
                            </div>
                        </label>
                        <button type="submit" class="auth-submit">Đặt lại mật khẩu</button>
                        <p class="auth-message" id="authResetMessage"></p>
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
        const forgotForm = this.modal.querySelector('.auth-form-forgot');
        const verifyOtpForm = this.modal.querySelector('.auth-form-verify-otp');
        const resetPasswordForm = this.modal.querySelector('.auth-form-reset-password');
        const logoutBtn = this.modal.querySelector('.auth-logout');
        const changeBtn = this.modal.querySelector('.auth-change-submit');
        const forgotLink = this.modal.querySelector('.auth-forgot-link');
        const backToLoginLink = this.modal.querySelector('.auth-back-to-login');
        const backToForgotLink = this.modal.querySelector('.auth-back-to-forgot');
        const resendOtpBtn = this.modal.querySelector('.auth-resend-otp');

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

        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        if (verifyOtpForm) {
            verifyOtpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleVerifyOTP();
            });
        }

        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleResetPassword();
            });
        }

        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode('forgot');
            });
        }

        if (backToLoginLink) {
            backToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode('login');
            });
        }

        if (backToForgotLink) {
            backToForgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode('forgot');
            });
        }

        if (resendOtpBtn) {
            resendOtpBtn.addEventListener('click', () => {
                this.resendOTP();
            });
        }

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

        // OTP input - only allow numbers
        const otpInput = this.modal.querySelector('#authOTPCode');
        if (otpInput) {
            otpInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
            });
        }
    },

    openModal(mode = 'login') {
        if (!this.modal) return;
        this.modal.classList.remove('hidden');
        
        // If user is logged in, always show profile view and hide tabs
        if (this.currentUser) {
            this.switchMode('profile');
            const profileName = this.modal.querySelector('#authProfileName');
            if (profileName) {
                profileName.textContent = this.currentUser;
            }
        } else {
            // User not logged in, show login/register
            this.switchMode(mode);
        }
    },

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.add('hidden');
        // Reset forgot password data when closing modal
        this.forgotPasswordData = null;
    },

    switchMode(mode) {
        this.mode = mode;
        const loginForm = this.modal.querySelector('.auth-form-login');
        const registerForm = this.modal.querySelector('.auth-form-register');
        const forgotForm = this.modal.querySelector('.auth-form-forgot');
        const verifyOtpForm = this.modal.querySelector('.auth-form-verify-otp');
        const resetPasswordForm = this.modal.querySelector('.auth-form-reset-password');
        const profileBox = this.modal.querySelector('.auth-profile');
        const tabsContainer = this.modal.querySelector('.auth-tabs');
        const tabLogin = this.modal.querySelector('.auth-tab-login');
        const tabRegister = this.modal.querySelector('.auth-tab-register');

        if (!tabsContainer) return; // Safety check

        // Hide all forms first
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (forgotForm) forgotForm.classList.add('hidden');
        if (verifyOtpForm) verifyOtpForm.classList.add('hidden');
        if (resetPasswordForm) resetPasswordForm.classList.add('hidden');
        if (profileBox) profileBox.classList.add('hidden');

        // Show profile if user is logged in and mode is profile
        if (mode === 'profile' && this.currentUser) {
            if (profileBox) profileBox.classList.remove('hidden');
            tabsContainer.classList.add('hidden'); // Hide tabs when showing profile
            if (tabLogin) tabLogin.classList.remove('active');
            if (tabRegister) tabRegister.classList.remove('active');
        } else if (mode === 'forgot') {
            // Show forgot password form
            if (forgotForm) forgotForm.classList.remove('hidden');
            tabsContainer.classList.add('hidden'); // Hide tabs for forgot password
        } else if (mode === 'verify-otp') {
            // Show OTP verification form
            if (verifyOtpForm) verifyOtpForm.classList.remove('hidden');
            tabsContainer.classList.add('hidden'); // Hide tabs for OTP verification
        } else if (mode === 'reset-password') {
            // Show reset password form
            if (resetPasswordForm) resetPasswordForm.classList.remove('hidden');
            tabsContainer.classList.add('hidden'); // Hide tabs for reset password
        } else {
            // Show login/register forms
            tabsContainer.classList.remove('hidden'); // Show tabs for login/register
            
            if (mode === 'login') {
                if (loginForm) loginForm.classList.remove('hidden');
                if (tabLogin) tabLogin.classList.add('active');
                if (tabRegister) tabRegister.classList.remove('active');
            } else if (mode === 'register') {
                if (registerForm) registerForm.classList.remove('hidden');
                if (tabLogin) tabLogin.classList.remove('active');
                if (tabRegister) tabRegister.classList.add('active');
            }
        }

        this.clearMessages();
        
        // Reset form inputs when switching modes (except when going to profile)
        if (mode !== 'profile') {
            this.resetFormInputs(mode);
        }
    },

    resetFormInputs(mode) {
        // Reset inputs based on the mode we're switching to
        if (mode === 'login') {
            const usernameEl = this.modal.querySelector('#authLoginUsername');
            const passwordEl = this.modal.querySelector('#authLoginPassword');
            if (usernameEl) usernameEl.value = '';
            if (passwordEl) passwordEl.value = '';
        } else if (mode === 'register') {
            const usernameEl = this.modal.querySelector('#authRegisterUsername');
            const emailEl = this.modal.querySelector('#authRegisterEmail');
            const passwordEl = this.modal.querySelector('#authRegisterPassword');
            const password2El = this.modal.querySelector('#authRegisterPassword2');
            if (usernameEl) usernameEl.value = '';
            if (emailEl) emailEl.value = '';
            if (passwordEl) passwordEl.value = '';
            if (password2El) password2El.value = '';
        } else if (mode === 'forgot') {
            const usernameEl = this.modal.querySelector('#authForgotUsername');
            const emailEl = this.modal.querySelector('#authForgotEmail');
            if (usernameEl) usernameEl.value = '';
            if (emailEl) emailEl.value = '';
            // Reset forgot password data
            this.forgotPasswordData = null;
        } else if (mode === 'verify-otp') {
            const otpEl = this.modal.querySelector('#authOTPCode');
            if (otpEl) otpEl.value = '';
        } else if (mode === 'reset-password') {
            const passwordEl = this.modal.querySelector('#authResetPassword');
            const password2El = this.modal.querySelector('#authResetPassword2');
            if (passwordEl) passwordEl.value = '';
            if (password2El) password2El.value = '';
        }
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

    generateOTP() {
        // Generate a 6-digit OTP
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    handleForgotPassword() {
        const usernameEl = this.modal.querySelector('#authForgotUsername');
        const emailEl = this.modal.querySelector('#authForgotEmail');
        const msgEl = this.modal.querySelector('#authForgotMessage');

        const username = usernameEl.value.trim();
        const email = emailEl.value.trim();

        this.clearMessages();

        if (!username) {
            this.showMessage(msgEl, 'Vui lòng nhập tên người dùng.', 'error');
            return;
        }

        if (!email || !email.includes('@')) {
            this.showMessage(msgEl, 'Email không hợp lệ.', 'error');
            return;
        }

        const user = this.users[username];
        if (!user) {
            this.showMessage(msgEl, 'Tài khoản không tồn tại.', 'error');
            return;
        }

        if (!user.email) {
            this.showMessage(msgEl, 'Tài khoản này chưa có email đăng ký.', 'error');
            return;
        }

        if (user.email.toLowerCase() !== email.toLowerCase()) {
            this.showMessage(msgEl, 'Email không khớp với email đã đăng ký.', 'error');
            return;
        }

        // Generate OTP
        const otp = this.generateOTP();
        this.forgotPasswordData = {
            username: username,
            email: email,
            otp: otp,
            timestamp: Date.now()
        };

        // In a real application, you would send this OTP via email
        // For demo purposes, we'll show it in console and alert
        console.log('🔐 Mã OTP cho', email, ':', otp);
        alert(`Mã xác minh đã được "gửi" đến email ${email}.\n\nMã OTP: ${otp}\n\n(Lưu ý: Đây là demo, trong thực tế mã sẽ được gửi qua email thật)`);

        this.showMessage(msgEl, 'Mã xác minh đã được gửi! Vui lòng kiểm tra email (hoặc console/alert).', 'success');
        
        // Switch to OTP verification form
        setTimeout(() => {
            this.switchMode('verify-otp');
            const otpInput = this.modal.querySelector('#authOTPCode');
            if (otpInput) otpInput.focus();
        }, 1000);
    },

    handleVerifyOTP() {
        const otpEl = this.modal.querySelector('#authOTPCode');
        const msgEl = this.modal.querySelector('#authOTPMessage');

        const enteredOTP = otpEl.value.trim();

        this.clearMessages();

        if (!enteredOTP || enteredOTP.length !== 6) {
            this.showMessage(msgEl, 'Vui lòng nhập mã xác minh 6 chữ số.', 'error');
            return;
        }

        if (!this.forgotPasswordData) {
            this.showMessage(msgEl, 'Phiên xác minh đã hết hạn. Vui lòng thử lại.', 'error');
            this.switchMode('forgot');
            return;
        }

        // Check if OTP is expired (10 minutes)
        const now = Date.now();
        if (now - this.forgotPasswordData.timestamp > 10 * 60 * 1000) {
            this.showMessage(msgEl, 'Mã xác minh đã hết hạn. Vui lòng gửi lại mã.', 'error');
            this.forgotPasswordData = null;
            this.switchMode('forgot');
            return;
        }

        if (enteredOTP !== this.forgotPasswordData.otp) {
            this.showMessage(msgEl, 'Mã xác minh không đúng. Vui lòng thử lại.', 'error');
            otpEl.value = '';
            return;
        }

        // OTP verified successfully
        this.showMessage(msgEl, 'Xác minh thành công! Vui lòng đặt mật khẩu mới.', 'success');
        
        // Switch to reset password form
        setTimeout(() => {
            this.switchMode('reset-password');
            const newPasswordInput = this.modal.querySelector('#authResetPassword');
            if (newPasswordInput) newPasswordInput.focus();
        }, 1000);
    },

    handleResetPassword() {
        const newPwdEl = this.modal.querySelector('#authResetPassword');
        const newPwd2El = this.modal.querySelector('#authResetPassword2');
        const msgEl = this.modal.querySelector('#authResetMessage');

        const newPwd = newPwdEl.value;
        const newPwd2 = newPwd2El.value;

        this.clearMessages();

        if (!this.forgotPasswordData) {
            this.showMessage(msgEl, 'Phiên đặt lại mật khẩu đã hết hạn. Vui lòng thử lại.', 'error');
            this.switchMode('forgot');
            return;
        }

        if (newPwd.length < 6) {
            this.showMessage(msgEl, 'Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
            return;
        }

        if (newPwd !== newPwd2) {
            this.showMessage(msgEl, 'Mật khẩu nhập lại không khớp.', 'error');
            return;
        }

        const username = this.forgotPasswordData.username;
        const user = this.users[username];
        
        if (!user) {
            this.showMessage(msgEl, 'Tài khoản không tồn tại.', 'error');
            this.switchMode('forgot');
            return;
        }

        // Update password
        user.password = this.simpleHash(newPwd);
        this.saveUsers();

        // Clear forgot password data
        this.forgotPasswordData = null;

        this.showMessage(msgEl, 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');
        newPwdEl.value = '';
        newPwd2El.value = '';

        // Switch back to login form after 2 seconds
        setTimeout(() => {
            this.switchMode('login');
        }, 2000);
    },

    resendOTP() {
        if (!this.forgotPasswordData) {
            const msgEl = this.modal.querySelector('#authOTPMessage');
            this.showMessage(msgEl, 'Không có phiên xác minh. Vui lòng quay lại bước trước.', 'error');
            this.switchMode('forgot');
            return;
        }

        // Generate new OTP
        const otp = this.generateOTP();
        this.forgotPasswordData.otp = otp;
        this.forgotPasswordData.timestamp = Date.now();

        const email = this.forgotPasswordData.email;
        console.log('🔐 Mã OTP mới cho', email, ':', otp);
        alert(`Mã xác minh mới đã được "gửi" đến email ${email}.\n\nMã OTP: ${otp}\n\n(Lưu ý: Đây là demo, trong thực tế mã sẽ được gửi qua email thật)`);

        const msgEl = this.modal.querySelector('#authOTPMessage');
        this.showMessage(msgEl, 'Mã xác minh mới đã được gửi!', 'success');
        
        const otpInput = this.modal.querySelector('#authOTPCode');
        if (otpInput) {
            otpInput.value = '';
            otpInput.focus();
        }
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


