class AIWorkerApp {
    constructor() {
        this.isInitialized = false;
        this.settings = {
            autoSave: true,
            maxWorkers: 3000,
            updateInterval: 5000,
            enableNotifications: true,
            enableSounds: false
        };
        
        this.initialize();
    }
    
    initialize() {
        // Wait for all components to be ready
        this.waitForComponents().then(() => {
            this.setupGlobalEventListeners();
            this.loadSettings();
            this.setupNotifications();
            this.startAutoSave();
            
            this.isInitialized = true;
            this.showWelcomeMessage();
            
            console.log('🤖 AI Worker Management System fully initialized');
        });
    }
    
    async waitForComponents() {
        // Wait for all managers to be initialized
        const checkInterval = 100;
        const maxWait = 10000; // 10 seconds
        let waited = 0;
        
        while (waited < maxWait) {
            if (window.workerManager && window.virtualWindowManager && window.chartManager) {
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
        }
        
        if (waited >= maxWait) {
            console.warn('Some components may not have initialized properly');
        }
    }
    
    setupGlobalEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Window events
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
        
        // Visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Online/offline status
        window.addEventListener('online', () => {
            this.handleConnectionChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleConnectionChange(false);
        });
        
        // Error handling
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }
    
    handleKeyboardShortcuts(e) {
        // Global shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveAll();
                    break;
                case 'n':
                    e.preventDefault();
                    this.showCreateWorkersDialog();
                    break;
                case 'r':
                    e.preventDefault();
                    this.refreshAll();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportData();
                    break;
                case 'i':
                    e.preventDefault();
                    this.showImportDialog();
                    break;
                case 'h':
                    e.preventDefault();
                    this.showHelpDialog();
                    break;
                case 'q':
                    e.preventDefault();
                    this.showQuickActions();
                    break;
            }
        }
        
        // Function keys
        switch (e.key) {
            case 'F1':
                e.preventDefault();
                this.showHelpDialog();
                break;
            case 'F5':
                e.preventDefault();
                this.refreshAll();
                break;
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'Escape':
                this.closeAllModals();
                break;
        }
        
        // Alt shortcuts
        if (e.altKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.switchToView('grid');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchToView('list');
                    break;
                case '3':
                    e.preventDefault();
                    this.switchToView('windows');
                    break;
                case 'w':
                    e.preventDefault();
                    window.virtualWindowManager?.closeAllWindows();
                    break;
            }
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Tab is hidden - reduce update frequency
            this.pauseUpdates();
        } else {
            // Tab is visible - resume normal updates
            this.resumeUpdates();
        }
    }
    
    handleConnectionChange(isOnline) {
        if (isOnline) {
            this.showNotification('Connection restored', 'success');
            this.resumeUpdates();
        } else {
            this.showNotification('Connection lost - working offline', 'warning');
            this.pauseUpdates();
        }
    }
    
    handleGlobalError(e) {
        console.error('Global error:', e.error);
        
        const errorInfo = {
            message: e.error?.message || 'Unknown error',
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            timestamp: new Date().toISOString()
        };
        
        // Log error
        if (window.workerManager) {
            window.workerManager.logActivity('error', `Global error: ${errorInfo.message}`);
        }
        
        // Show user-friendly error message
        this.showNotification('An error occurred. Check the activity log for details.', 'error');
        
        // Store error for debugging
        this.storeError(errorInfo);
    }
    
    handleUnhandledRejection(e) {
        console.error('Unhandled promise rejection:', e.reason);
        
        if (window.workerManager) {
            window.workerManager.logActivity('error', `Unhandled promise rejection: ${e.reason}`);
        }
        
        // Prevent default browser behavior
        e.preventDefault();
    }
    
    // Settings management
    loadSettings() {
        const savedSettings = localStorage.getItem('aiworker_settings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                console.warn('Failed to load settings:', error);
            }
        }
        
        this.applySettings();
    }
    
    saveSettings() {
        localStorage.setItem('aiworker_settings', JSON.stringify(this.settings));
    }
    
    applySettings() {
        // Apply max workers limit
        if (window.workerManager) {
            window.workerManager.maxWorkers = this.settings.maxWorkers;
        }
        
        // Apply update interval
        if (this.settings.updateInterval !== 5000) {
            this.updateUpdateInterval();
        }
        
        // Apply notification settings
        if (!this.settings.enableNotifications) {
            this.disableNotifications();
        }
    }
    
    updateUpdateInterval() {
        // This would update the performance tracking interval
        // Implementation depends on how the intervals are managed
    }
    
    // Notification system
    setupNotifications() {
        if ('Notification' in window && this.settings.enableNotifications) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }
    
    showNotification(message, type = 'info', options = {}) {
        // In-app notification
        this.showInAppNotification(message, type);
        
        // Browser notification for important messages
        if (this.settings.enableNotifications && 
            (type === 'error' || type === 'warning' || options.important)) {
            this.showBrowserNotification(message, type);
        }
        
        // Sound notification
        if (this.settings.enableSounds && type === 'error') {
            this.playNotificationSound();
        }
    }
    
    showInAppNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 350px;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;
        
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: auto;
                opacity: 0.7;
                font-size: 1.2rem;
            ">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, type === 'error' ? 8000 : 4000);
    }
    
    showBrowserNotification(message, type) {
        if (Notification.permission === 'granted') {
            const notification = new Notification('AI Worker Manager', {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'aiworker-' + type
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            setTimeout(() => notification.close(), 5000);
        }
    }
    
    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    playNotificationSound() {
        // Create audio context for notification sounds
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Generate a simple beep sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    // Auto-save functionality
    startAutoSave() {
        if (this.settings.autoSave) {
            this.autoSaveInterval = setInterval(() => {
                this.saveAll();
            }, 60000); // Save every minute
        }
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    saveAll() {
        try {
            // Save worker data
            if (window.workerManager) {
                const workerData = {
                    workers: Array.from(window.workerManager.workers.entries()),
                    totalEarnings: window.workerManager.totalEarnings,
                    timestamp: Date.now()
                };
                
                localStorage.setItem('aiworker_data', JSON.stringify(workerData));
            }
            
            // Save settings
            this.saveSettings();
            
            // Save window positions
            if (window.virtualWindowManager) {
                const windowData = Array.from(window.virtualWindowManager.windows.entries());
                localStorage.setItem('aiworker_windows', JSON.stringify(windowData));
            }
            
            this.showNotification('Data saved successfully', 'success');
            
        } catch (error) {
            console.error('Save failed:', error);
            this.showNotification('Failed to save data', 'error');
        }
    }
    
    loadAll() {
        try {
            // Load worker data
            const workerData = localStorage.getItem('aiworker_data');
            if (workerData && window.workerManager) {
                const data = JSON.parse(workerData);
                // Restore workers would need to be implemented in workerManager
                console.log('Worker data loaded');
            }
            
            // Load window positions
            const windowData = localStorage.getItem('aiworker_windows');
            if (windowData && window.virtualWindowManager) {
                const data = JSON.parse(windowData);
                // Restore windows would need to be implemented
                console.log('Window data loaded');
            }
            
        } catch (error) {
            console.error('Load failed:', error);
            this.showNotification('Failed to load saved data', 'error');
        }
    }
    
    // Export/Import functionality
    exportData() {
        try {
            const exportData = {
                workers: window.workerManager ? Array.from(window.workerManager.workers.entries()) : [],
                settings: this.settings,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aiworker-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully', 'success');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export data', 'error');
        }
    }
    
    importData(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!this.validateImportData(data)) {
                    throw new Error('Invalid data format');
                }
                
                // Import workers
                if (data.workers && window.workerManager) {
                    // Implementation would depend on workerManager structure
                    console.log('Importing workers...');
                }
                
                // Import settings
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    this.saveSettings();
                    this.applySettings();
                }
                
                this.showNotification('Data imported successfully', 'success');
                
            } catch (error) {
                console.error('Import failed:', error);
                this.showNotification('Failed to import data: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    validateImportData(data) {
        return data && 
               typeof data === 'object' && 
               data.version && 
               data.timestamp;
    }
    
    // UI Helper methods
    showCreateWorkersDialog() {
        // Focus on worker count input
        const workerCountInput = document.getElementById('workerCount');
        if (workerCountInput) {
            workerCountInput.focus();
            workerCountInput.select();
        }
    }
    
    showImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importData(file);
            }
        };
        input.click();
    }
    
    showHelpDialog() {
        const helpModal = document.createElement('div');
        helpModal.className = 'modal';
        helpModal.style.display = 'flex';
        helpModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>AI Worker Manager - Help</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>Keyboard Shortcuts</h4>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.5rem; margin-bottom: 1rem;">
                        <strong>Ctrl+S</strong><span>Save all data</span>
                        <strong>Ctrl+N</strong><span>Create new workers</span>
                        <strong>Ctrl+R</strong><span>Refresh all</span>
                        <strong>Ctrl+E</strong><span>Export data</span>
                        <strong>Ctrl+I</strong><span>Import data</span>
                        <strong>Ctrl+H</strong><span>Show help</span>
                        <strong>Alt+1/2/3</strong><span>Switch views</span>
                        <strong>Alt+W</strong><span>Close all windows</span>
                        <strong>F1</strong><span>Help</span>
                        <strong>F5</strong><span>Refresh</span>
                        <strong>F11</strong><span>Fullscreen</span>
                        <strong>Escape</strong><span>Close modals</span>
                    </div>
                    
                    <h4>Features</h4>
                    <ul style="margin-left: 1rem;">
                        <li>Create up to 3,000 AI workers</li>
                        <li>Real-time progress monitoring</li>
                        <li>Virtual windows for each worker</li>
                        <li>Performance charts and analytics</li>
                        <li>Export/import functionality</li>
                        <li>Auto-save every minute</li>
                    </ul>
                    
                    <h4>Worker Types</h4>
                    <ul style="margin-left: 1rem;">
                        <li><strong>Survey Worker:</strong> Completes surveys and questionnaires</li>
                        <li><strong>Data Entry:</strong> Processes forms and data input</li>
                        <li><strong>Content Creator:</strong> Generates articles and content</li>
                        <li><strong>Research Assistant:</strong> Conducts research and analysis</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
    }
    
    showQuickActions() {
        const quickActionsModal = document.createElement('div');
        quickActionsModal.className = 'modal';
        quickActionsModal.style.display = 'flex';
        quickActionsModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>Quick Actions</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <button class="btn-primary" onclick="workerManager.createWorkers(); this.closest('.modal').remove();">
                            <i class="fas fa-plus"></i> Create Workers
                        </button>
                        <button class="btn-secondary" onclick="workerManager.startAllWorkers(); this.closest('.modal').remove();">
                            <i class="fas fa-play"></i> Start All Workers
                        </button>
                        <button class="btn-danger" onclick="workerManager.stopAllWorkers(); this.closest('.modal').remove();">
                            <i class="fas fa-stop"></i> Stop All Workers
                        </button>
                        <button class="btn-secondary" onclick="aiWorkerApp.exportData(); this.closest('.modal').remove();">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                        <button class="btn-secondary" onclick="aiWorkerApp.showImportDialog(); this.closest('.modal').remove();">
                            <i class="fas fa-upload"></i> Import Data
                        </button>
                        <button class="btn-secondary" onclick="virtualWindowManager.closeAllWindows(); this.closest('.modal').remove();">
                            <i class="fas fa-window-close"></i> Close All Windows
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(quickActionsModal);
    }
    
    switchToView(viewType) {
        const viewBtn = document.querySelector(`[data-view="${viewType}"]`);
        if (viewBtn) {
            viewBtn.click();
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.remove();
        });
    }
    
    refreshAll() {
        // Refresh worker grid
        if (window.workerManager) {
            window.workerManager.renderWorkerGrid();
            window.workerManager.updateStats();
        }
        
        // Refresh charts
        if (window.chartManager) {
            window.chartManager.resizeCharts();
        }
        
        // Refresh virtual windows
        if (window.virtualWindowManager) {
            window.virtualWindowManager.renderAllWindows();
        }
        
        this.showNotification('Interface refreshed', 'success');
    }
    
    pauseUpdates() {
        // Reduce update frequency when tab is hidden or offline
        this.updatesPaused = true;
    }
    
    resumeUpdates() {
        // Resume normal update frequency
        this.updatesPaused = false;
    }
    
    hasUnsavedChanges() {
        // Check if there are unsaved changes
        return window.workerManager && window.workerManager.workers.size > 0;
    }
    
    storeError(errorInfo) {
        const errors = JSON.parse(localStorage.getItem('aiworker_errors') || '[]');
        errors.push(errorInfo);
        
        // Keep only last 50 errors
        if (errors.length > 50) {
            errors.splice(0, errors.length - 50);
        }
        
        localStorage.setItem('aiworker_errors', JSON.stringify(errors));
    }
    
    showWelcomeMessage() {
        setTimeout(() => {
            this.showNotification('🤖 AI Worker Management System ready!', 'success', { important: true });
        }, 1000);
    }
    
    disableNotifications() {
        // Disable browser notifications
        this.settings.enableNotifications = false;
    }
    
    // Performance monitoring
    getSystemStats() {
        return {
            workers: window.workerManager ? window.workerManager.workers.size : 0,
            activeWorkers: window.workerManager ? window.workerManager.activeWorkers : 0,
            totalEarnings: window.workerManager ? window.workerManager.totalEarnings : 0,
            openWindows: window.virtualWindowManager ? window.virtualWindowManager.windows.size : 0,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null,
            uptime: Date.now() - this.startTime
        };
    }
    
    // Cleanup on page unload
    cleanup() {
        this.stopAutoSave();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Close all virtual windows
        if (window.virtualWindowManager) {
            window.virtualWindowManager.closeAllWindows();
        }
        
        console.log('AI Worker App cleaned up');
    }
}

// Initialize the application
let aiWorkerApp;
document.addEventListener('DOMContentLoaded', () => {
    aiWorkerApp = new AIWorkerApp();
    aiWorkerApp.startTime = Date.now();
    
    // Make globally available
    window.aiWorkerApp = aiWorkerApp;
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        aiWorkerApp.cleanup();
    });
});

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-weight: 500;
        line-height: 1.4;
    }
    
    .notification button:hover {
        opacity: 1 !important;
    }
`;

document.head.appendChild(notificationStyles);
