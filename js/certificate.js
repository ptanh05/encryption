// ============================================
// CERTIFICATE SYSTEM
// ============================================

const CertificateSystem = {
    checkCompletion() {
        const progress = JSON.parse(localStorage.getItem('crypto-lesson-progress') || '{}');
        const totalLessons = 11;
        let completedCount = 0;
        
        for (let i = 1; i <= totalLessons; i++) {
            if (progress[i] && progress[i].completed) {
                completedCount++;
            }
        }
        
        if (completedCount === totalLessons) {
            this.showCertificate();
        }
    },
    
    showCertificate() {
        const modal = document.createElement('div');
        modal.className = 'certificate-modal';
        modal.innerHTML = `
            <div class="certificate-content">
                <div class="certificate-header">
                    <h2>🎓 Chứng chỉ hoàn thành</h2>
                    <button class="certificate-close" onclick="this.closest('.certificate-modal').remove()">×</button>
                </div>
                <div class="certificate-body">
                    <div class="certificate-title">CHỨNG CHỈ</div>
                    <div class="certificate-subtitle">Hoàn thành khóa học</div>
                    <div class="certificate-course">Mật mã học từ cơ bản đến nâng cao</div>
                    <div class="certificate-name">Được trao cho</div>
                    <div class="certificate-recipient">Người học xuất sắc</div>
                    <div class="certificate-date">Ngày: ${new Date().toLocaleDateString('vi-VN')}</div>
                    <div class="certificate-stats">
                        <p>✅ Đã hoàn thành: 11/11 bài học</p>
                        <p>📊 Tổng điểm: ${this.calculateTotalScore()}%</p>
                    </div>
                </div>
                <div class="certificate-actions">
                    <button onclick="CertificateSystem.downloadCertificate()" class="btn-certificate">📥 Tải chứng chỉ</button>
                    <button onclick="CertificateSystem.shareCertificate()" class="btn-certificate">🔗 Chia sẻ</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    calculateTotalScore() {
        const progress = JSON.parse(localStorage.getItem('crypto-lesson-progress') || '{}');
        let totalScore = 0;
        let count = 0;
        
        for (let i = 1; i <= 11; i++) {
            if (progress[i] && progress[i].score) {
                totalScore += progress[i].score;
                count++;
            }
        }
        
        return count > 0 ? Math.round(totalScore / count) : 0;
    },
    
    downloadCertificate() {
        const certificate = document.querySelector('.certificate-body');
        if (!certificate) return;
        
        // Use html2canvas if available, otherwise just show alert
        if (typeof html2canvas !== 'undefined') {
            html2canvas(certificate).then(canvas => {
                const link = document.createElement('a');
                link.download = `certificate-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        } else {
            alert('Tính năng tải chứng chỉ đang được phát triển. Vui lòng chụp màn hình để lưu chứng chỉ.');
        }
    },
    
    shareCertificate() {
        const text = `🎓 Tôi đã hoàn thành khóa học Mật mã học từ cơ bản đến nâng cao! ${this.calculateTotalScore()}% điểm số.`;
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'Chứng chỉ Mật mã học',
                text: text,
                url: url
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                alert('✅ Đã sao chép link vào clipboard!');
            });
        }
    }
};

// Check completion on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CertificateSystem.checkCompletion());
} else {
    CertificateSystem.checkCompletion();
}

