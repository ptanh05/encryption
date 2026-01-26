// ============================================
// PROGRESS EXPORT/IMPORT SYSTEM
// ============================================

const ProgressManager = {
    exportProgress() {
        const progress = localStorage.getItem('crypto-lesson-progress');
        if (!progress) {
            alert('Chưa có dữ liệu tiến độ để xuất!');
            return;
        }
        
        const dataStr = JSON.stringify(JSON.parse(progress), null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crypto-progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('✅ Đã xuất tiến độ thành công!');
    },
    
    importProgress() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    localStorage.setItem('crypto-lesson-progress', JSON.stringify(data));
                    this.showNotification('✅ Đã nhập tiến độ thành công!');
                    
                    // Reload page to update UI
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } catch (error) {
                    this.showNotification('❌ File không hợp lệ!', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    },
    
    resetProgress() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả tiến độ? Hành động này không thể hoàn tác!')) {
            localStorage.removeItem('crypto-lesson-progress');
            this.showNotification('✅ Đã xóa tiến độ!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    },
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `progress-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? 'rgba(255, 107, 107, 0.9)' : 'rgba(0, 212, 170, 0.9)'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Add export/import buttons to progress overview
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const progressOverview = document.getElementById('progress-overview');
        if (progressOverview) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'progress-actions';
            actionsDiv.innerHTML = `
                <button onclick="ProgressManager.exportProgress()" class="btn-progress">📥 Xuất tiến độ</button>
                <button onclick="ProgressManager.importProgress()" class="btn-progress">📤 Nhập tiến độ</button>
                <button onclick="ProgressManager.resetProgress()" class="btn-progress btn-danger">🗑️ Xóa tiến độ</button>
            `;
            progressOverview.appendChild(actionsDiv);
        }
    });
} else {
    const progressOverview = document.getElementById('progress-overview');
    if (progressOverview) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'progress-actions';
        actionsDiv.innerHTML = `
            <button onclick="ProgressManager.exportProgress()" class="btn-progress">📥 Xuất tiến độ</button>
            <button onclick="ProgressManager.importProgress()" class="btn-progress">📤 Nhập tiến độ</button>
            <button onclick="ProgressManager.resetProgress()" class="btn-progress btn-danger">🗑️ Xóa tiến độ</button>
        `;
        progressOverview.appendChild(actionsDiv);
    }
}

