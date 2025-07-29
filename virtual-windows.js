class VirtualWindowManager {
    constructor() {
        this.windows = new Map();
        this.windowCounter = 0;
        this.maxWindows = 100; // Limit for performance
        
        this.initializeWindowSystem();
    }
    
    initializeWindowSystem() {
        // Create virtual desktop environment
        this.createVirtualDesktop();
        
        // Initialize window management
        this.setupWindowControls();
        
        console.log('Virtual Window Manager initialized');
    }
    
    createVirtualDesktop() {
        // This creates the foundation for virtual windows
        this.desktop = {
            width: 1920,
            height: 1080,
            windows: [],
            activeWindow: null
        };
    }
    
    setupWindowControls() {
        // Add keyboard shortcuts for window management
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey) {
                switch (e.key) {
                    case 'w':
                        e.preventDefault();
                        this.closeActiveWindow();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.minimizeActiveWindow();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.maximizeActiveWindow();
                        break;
                }
            }
        });
    }
    
    openWorkerWindow(workerId) {
        const worker = workerManager.workers.get(workerId);
        if (!worker) return null;
        
        // Check if window already exists
        if (this.windows.has(workerId)) {
            this.focusWindow(workerId);
            return this.windows.get(workerId);
        }
        
        // Check window limit
        if (this.windows.size >= this.maxWindows) {
            workerManager.logActivity('warning', `Maximum window limit (${this.maxWindows}) reached`);
            return null;
        }
        
        const windowId = `window_${workerId}_${++this.windowCounter}`;
        const virtualWindow = this.createVirtualWindow(windowId, worker);
        
        this.windows.set(workerId, virtualWindow);
        this.renderWindow(virtualWindow);
        
        workerManager.logActivity('info', `Opened virtual window for worker ${workerId}`);
        
        return virtualWindow;
    }
    
    createVirtualWindow(windowId, worker) {
        const window = {
            id: windowId,
            workerId: worker.id,
            worker: worker,
            title: `Worker: ${worker.id}`,
            width: 800,
            height: 600,
            x: Math.random() * 400,
            y: Math.random() * 200,
            zIndex: this.getNextZIndex(),
            isMinimized: false,
            isMaximized: false,
            isActive: true,
            content: this.generateWindowContent(worker),
            lastUpdate: Date.now()
        };
        
        return window;
    }
    
    generateWindowContent(worker) {
        const content = {
            type: 'browser',
            url: this.generateWorkerURL(worker),
            browserState: {
                loading: false,
                progress: 0,
                currentPage: 'dashboard'
            },
            taskSimulation: this.createTaskSimulation(worker)
        };
        
        return content;
    }
    
    generateWorkerURL(worker) {
        const baseUrls = {
            survey: 'https://survey-platform.com',
            'data-entry': 'https://data-entry-portal.com',
            content: 'https://content-creator-hub.com',
            research: 'https://research-assistant.com'
        };
        
        const baseUrl = baseUrls[worker.type] || 'https://work-platform.com';
        return `${baseUrl}/worker/${worker.id}/dashboard`;
    }
    
    createTaskSimulation(worker) {
        const simulations = {
            survey: this.createSurveySimulation(worker),
            'data-entry': this.createDataEntrySimulation(worker),
            content: this.createContentSimulation(worker),
            research: this.createResearchSimulation(worker)
        };
        
        return simulations[worker.type] || this.createGenericSimulation(worker);
    }
    
    createSurveySimulation(worker) {
        return {
            type: 'survey',
            questions: [
                'How satisfied are you with our service?',
                'What is your age group?',
                'How often do you use our product?',
                'Would you recommend us to others?',
                'Any additional comments?'
            ],
            currentQuestion: 0,
            responses: [],
            progress: worker.currentTask ? worker.currentTask.progress : 0
        };
    }
    
    createDataEntrySimulation(worker) {
        return {
            type: 'data-entry',
            fields: [
                { name: 'First Name', value: '', completed: false },
                { name: 'Last Name', value: '', completed: false },
                { name: 'Email', value: '', completed: false },
                { name: 'Phone', value: '', completed: false },
                { name: 'Address', value: '', completed: false }
            ],
            currentField: 0,
            progress: worker.currentTask ? worker.currentTask.progress : 0
        };
    }
    
    createContentSimulation(worker) {
        return {
            type: 'content',
            document: {
                title: 'Article Draft',
                content: '',
                wordCount: 0,
                targetWords: 500
            },
            progress: worker.currentTask ? worker.currentTask.progress : 0
        };
    }
    
    createResearchSimulation(worker) {
        return {
            type: 'research',
            topic: 'Market Analysis Report',
            sources: [
                'Industry Report 2024',
                'Competitor Analysis',
                'Market Trends Data',
                'Consumer Survey Results'
            ],
            currentSource: 0,
            notes: [],
            progress: worker.currentTask ? worker.currentTask.progress : 0
        };
    }
    
    createGenericSimulation(worker) {
        return {
            type: 'generic',
            taskName: worker.currentTask ? worker.currentTask.name : 'Idle',
            progress: worker.currentTask ? worker.currentTask.progress : 0
        };
    }
    
    renderWindow(virtualWindow) {
        const windowElement = document.createElement('div');
        windowElement.className = 'virtual-window-full';
        windowElement.id = virtualWindow.id;
        windowElement.style.cssText = `
            position: fixed;
            left: ${virtualWindow.x}px;
            top: ${virtualWindow.y}px;
            width: ${virtualWindow.width}px;
            height: ${virtualWindow.height}px;
            z-index: ${virtualWindow.zIndex};
            background: rgba(30, 60, 114, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
        `;
        
        windowElement.innerHTML = this.generateWindowHTML(virtualWindow);
        
        // Add to DOM
        document.body.appendChild(windowElement);
        
        // Setup window interactions
        this.setupWindowInteractions(windowElement, virtualWindow);
        
        // Start content updates
        this.startWindowUpdates(virtualWindow);
    }
    
    generateWindowHTML(virtualWindow) {
        const worker = virtualWindow.worker;
        const content = virtualWindow.content;
        
        return `
            <div class="window-header-full">
                <div class="window-controls-full">
                    <button class="window-control-btn close" onclick="virtualWindowManager.closeWindow('${virtualWindow.workerId}')">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="window-control-btn minimize" onclick="virtualWindowManager.minimizeWindow('${virtualWindow.workerId}')">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="window-control-btn maximize" onclick="virtualWindowManager.toggleMaximize('${virtualWindow.workerId}')">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
                <div class="window-title-full">
                    <i class="fas fa-robot"></i>
                    ${virtualWindow.title}
                </div>
                <div class="window-status">
                    <span class="status-indicator ${worker.status}"></span>
                    <span class="status-text">${worker.status.toUpperCase()}</span>
                </div>
            </div>
            
            <div class="window-toolbar">
                <div class="url-bar">
                    <i class="fas fa-lock"></i>
                    <span class="url">${content.url}</span>
                    <button class="refresh-btn" onclick="virtualWindowManager.refreshWindow('${virtualWindow.workerId}')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="worker-stats">
                    <span class="stat">Tasks: ${worker.tasksCompleted}</span>
                    <span class="stat">Earnings: $${worker.earnings.toFixed(2)}</span>
                    <span class="stat">Success: ${(worker.successRate * 100).toFixed(1)}%</span>
                </div>
            </div>
            
            <div class="window-content-full" id="content_${virtualWindow.id}">
                ${this.generateContentHTML(virtualWindow)}
            </div>
            
            <div class="window-footer">
                <div class="progress-info">
                    <span>Current Task: ${worker.currentTask ? worker.currentTask.name : 'Idle'}</span>
                    <div class="mini-progress">
                        <div class="mini-progress-fill" style="width: ${worker.currentTask ? worker.currentTask.progress : 0}%"></div>
                    </div>
                    <span>${worker.currentTask ? worker.currentTask.progress : 0}%</span>
                </div>
                <div class="window-actions">
                    <button class="action-btn-small" onclick="workerManager.startWorker('${worker.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-btn-small" onclick="workerManager.pauseWorker('${worker.id}')">
                        <i class="fas fa-pause"></i>
                    </button>
                    <button class="action-btn-small" onclick="workerManager.stopWorker('${worker.id}')">
                        <i class="fas fa-stop"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    generateContentHTML(virtualWindow) {
        const content = virtualWindow.content;
        const simulation = content.taskSimulation;
        
        switch (simulation.type) {
            case 'survey':
                return this.generateSurveyHTML(simulation);
            case 'data-entry':
                return this.generateDataEntryHTML(simulation);
            case 'content':
                return this.generateContentHTML(simulation);
            case 'research':
                return this.generateResearchHTML(simulation);
            default:
                return this.generateGenericHTML(simulation);
        }
    }
    
    generateSurveyHTML(simulation) {
        const currentQ = simulation.currentQuestion;
        const progress = simulation.progress;
        
        return `
            <div class="task-simulation survey-simulation">
                <div class="simulation-header">
                    <h3>Customer Satisfaction Survey</h3>
                    <div class="survey-progress">
                        <span>Question ${currentQ + 1} of ${simulation.questions.length}</span>
                        <div class="progress-bar-sim">
                            <div class="progress-fill-sim" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="survey-content">
                    <div class="question-container">
                        <h4>${simulation.questions[currentQ] || 'Loading next question...'}</h4>
                        
                        <div class="answer-options">
                            <label class="radio-option ${progress > 20 ? 'selected' : ''}">
                                <input type="radio" name="answer" ${progress > 20 ? 'checked' : ''}>
                                <span>Very Satisfied</span>
                            </label>
                            <label class="radio-option ${progress > 40 ? 'selected' : ''}">
                                <input type="radio" name="answer" ${progress > 40 ? 'checked' : ''}>
                                <span>Satisfied</span>
                            </label>
                            <label class="radio-option ${progress > 60 ? 'selected' : ''}">
                                <input type="radio" name="answer" ${progress > 60 ? 'checked' : ''}>
                                <span>Neutral</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="answer">
                                <span>Dissatisfied</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="answer">
                                <span>Very Dissatisfied</span>
                            </label>
                        </div>
                        
                        <div class="survey-actions">
                            <button class="btn-survey ${progress < 100 ? 'disabled' : ''}" ${progress < 100 ? 'disabled' : ''}>
                                ${progress < 100 ? 'Answering...' : 'Next Question'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateDataEntryHTML(simulation) {
        const progress = simulation.progress;
        
        return `
            <div class="task-simulation data-entry-simulation">
                <div class="simulation-header">
                    <h3>Data Entry Portal</h3>
                    <div class="entry-progress">
                        <span>Fields Completed: ${Math.floor(progress / 20)} of ${simulation.fields.length}</span>
                    </div>
                </div>
                
                <div class="data-entry-form">
                    ${simulation.fields.map((field, index) => `
                        <div class="form-field ${progress > (index * 20) ? 'completed' : ''}">
                            <label>${field.name}:</label>
                            <input type="text" 
                                   value="${progress > (index * 20) ? 'Sample Data' : ''}" 
                                   ${progress > (index * 20) ? 'readonly' : ''} 
                                   class="${progress > (index * 20) ? 'filled' : ''}">
                            ${progress > (index * 20) ? '<i class="fas fa-check-circle"></i>' : ''}
                        </div>
                    `).join('')}
                    
                    <div class="form-actions">
                        <button class="btn-data-entry ${progress < 100 ? 'disabled' : ''}" ${progress < 100 ? 'disabled' : ''}>
                            ${progress < 100 ? 'Processing...' : 'Submit Data'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateGenericHTML(simulation) {
        return `
            <div class="task-simulation generic-simulation">
                <div class="simulation-center">
                    <div class="worker-activity">
                        <div class="activity-icon">
                            <i class="fas fa-robot fa-3x"></i>
                        </div>
                        <h3>${simulation.taskName}</h3>
                        <div class="activity-progress">
                            <div class="progress-circle">
                                <svg width="120" height="120">
                                    <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.2)" stroke-width="8" fill="none"/>
                                    <circle cx="60" cy="60" r="50" stroke="#4facfe" stroke-width="8" fill="none"
                                            stroke-dasharray="314" stroke-dashoffset="${314 - (314 * simulation.progress / 100)}"
                                            transform="rotate(-90 60 60)"/>
                                </svg>
                                <div class="progress-text">${simulation.progress}%</div>
                            </div>
                        </div>
                        <div class="activity-status">
                            <span class="status-dot pulse"></span>
                            <span>AI Worker Active</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupWindowInteractions(windowElement, virtualWindow) {
        // Make window draggable
        this.makeDraggable(windowElement, virtualWindow);
        
        // Make window resizable
        this.makeResizable(windowElement, virtualWindow);
        
        // Focus on click
        windowElement.addEventListener('mousedown', () => {
            this.focusWindow(virtualWindow.workerId);
        });
    }
    
    makeDraggable(windowElement, virtualWindow) {
        const header = windowElement.querySelector('.window-header-full');
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls-full')) return;
            
            isDragging = true;
            dragOffset.x = e.clientX - virtualWindow.x;
            dragOffset.y = e.clientY - virtualWindow.y;
            
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', stopDrag);
        });
        
        const handleDrag = (e) => {
            if (!isDragging) return;
            
            virtualWindow.x = e.clientX - dragOffset.x;
            virtualWindow.y = e.clientY - dragOffset.y;
            
            // Keep window within bounds
            virtualWindow.x = Math.max(0, Math.min(virtualWindow.x, window.innerWidth - virtualWindow.width));
            virtualWindow.y = Math.max(0, Math.min(virtualWindow.y, window.innerHeight - virtualWindow.height));
            
            windowElement.style.left = virtualWindow.x + 'px';
            windowElement.style.top = virtualWindow.y + 'px';
        };
        
        const stopDrag = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };
    }
    
    makeResizable(windowElement, virtualWindow) {
        // Add resize handles
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            cursor: se-resize;
            background: linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%);
        `;
        
        windowElement.appendChild(resizeHandle);
        
        let isResizing = false;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            e.stopPropagation();
            
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        });
        
        const handleResize = (e) => {
            if (!isResizing) return;
            
            const newWidth = e.clientX - virtualWindow.x;
            const newHeight = e.clientY - virtualWindow.y;
            
            virtualWindow.width = Math.max(400, Math.min(newWidth, window.innerWidth - virtualWindow.x));
            virtualWindow.height = Math.max(300, Math.min(newHeight, window.innerHeight - virtualWindow.y));
            
            windowElement.style.width = virtualWindow.width + 'px';
            windowElement.style.height = virtualWindow.height + 'px';
        };
        
        const stopResize = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        };
    }
    
    startWindowUpdates(virtualWindow) {
        const updateInterval = setInterval(() => {
            if (!this.windows.has(virtualWindow.workerId)) {
                clearInterval(updateInterval);
                return;
            }
            
            this.updateWindowContent(virtualWindow);
        }, 2000); // Update every 2 seconds
        
        virtualWindow.updateInterval = updateInterval;
    }
    
    updateWindowContent(virtualWindow) {
        const worker = virtualWindow.worker;
        const contentElement = document.getElementById(`content_${virtualWindow.id}`);
        
        if (!contentElement) return;
        
        // Update task simulation progress
        if (worker.currentTask) {
            virtualWindow.content.taskSimulation.progress = worker.currentTask.progress;
        }
        
        // Update content HTML
        contentElement.innerHTML = this.generateContentHTML(virtualWindow);
        
        // Update footer progress
        const progressFill = document.querySelector(`#${virtualWindow.id} .mini-progress-fill`);
        const progressText = document.querySelector(`#${virtualWindow.id} .progress-info span:last-child`);
        
        if (progressFill && progressText) {
            const progress = worker.currentTask ? worker.currentTask.progress : 0;
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';
        }
        
        // Update status indicator
        const statusIndicator = document.querySelector(`#${virtualWindow.id} .status-indicator`);
        const statusText = document.querySelector(`#${virtualWindow.id} .status-text`);
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator ${worker.status}`;
            statusText.textContent = worker.status.toUpperCase();
        }
    }
    
    focusWindow(workerId) {
        const virtualWindow = this.windows.get(workerId);
        if (!virtualWindow) return;
        
        virtualWindow.zIndex = this.getNextZIndex();
        virtualWindow.isActive = true;
        
        const windowElement = document.getElementById(virtualWindow.id);
        if (windowElement) {
            windowElement.style.zIndex = virtualWindow.zIndex;
        }
        
        // Unfocus other windows
        this.windows.forEach((window, id) => {
            if (id !== workerId) {
                window.isActive = false;
            }
        });
    }
    
    closeWindow(workerId) {
        const virtualWindow = this.windows.get(workerId);
        if (!virtualWindow) return;
        
        // Clear update interval
        if (virtualWindow.updateInterval) {
            clearInterval(virtualWindow.updateInterval);
        }
        
        // Remove from DOM
        const windowElement = document.getElementById(virtualWindow.id);
        if (windowElement) {
            windowElement.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (windowElement.parentNode) {
                    windowElement.parentNode.removeChild(windowElement);
                }
            }, 300);
        }
        
        // Remove from windows map
        this.windows.delete(workerId);
        
        workerManager.logActivity('info', `Closed virtual window for worker ${workerId}`);
    }
    
    minimizeWindow(workerId) {
        const virtualWindow = this.windows.get(workerId);
        if (!virtualWindow) return;
        
        const windowElement = document.getElementById(virtualWindow.id);
        if (!windowElement) return;
        
        virtualWindow.isMinimized = !virtualWindow.isMinimized;
        
        if (virtualWindow.isMinimized) {
            windowElement.style.transform = 'scale(0.1)';
            windowElement.style.opacity = '0.5';
            windowElement.style.pointerEvents = 'none';
        } else {
            windowElement.style.transform = 'scale(1)';
            windowElement.style.opacity = '1';
            windowElement.style.pointerEvents = 'auto';
        }
    }
    
    toggleMaximize(workerId) {
        const virtualWindow = this.windows.get(workerId);
        if (!virtualWindow) return;
        
        const windowElement = document.getElementById(virtualWindow.id);
        if (!windowElement) return;
        
        virtualWindow.isMaximized = !virtualWindow.isMaximized;
        
        if (virtualWindow.isMaximized) {
            // Store original dimensions
            virtualWindow.originalX = virtualWindow.x;
            virtualWindow.originalY = virtualWindow.y;
            virtualWindow.originalWidth = virtualWindow.width;
            virtualWindow.originalHeight = virtualWindow.height;
            
            // Maximize
            virtualWindow.x = 0;
            virtualWindow.y = 0;
            virtualWindow.width = window.innerWidth;
            virtualWindow.height = window.innerHeight;
        } else {
            // Restore original dimensions
            virtualWindow.x = virtualWindow.originalX || 100;
            virtualWindow.y = virtualWindow.originalY || 100;
            virtualWindow.width = virtualWindow.originalWidth || 800;
            virtualWindow.height = virtualWindow.originalHeight || 600;
        }
        
        windowElement.style.left = virtualWindow.x + 'px';
        windowElement.style.top = virtualWindow.y + 'px';
        windowElement.style.width = virtualWindow.width + 'px';
        windowElement.style.height = virtualWindow.height + 'px';
    }
    
    refreshWindow(workerId) {
        const virtualWindow = this.windows.get(workerId);
        if (!virtualWindow) return;
        
        // Simulate refresh
        const contentElement = document.getElementById(`content_${virtualWindow.id}`);
        if (contentElement) {
            contentElement.style.opacity = '0.5';
            setTimeout(() => {
                this.updateWindowContent(virtualWindow);
                contentElement.style.opacity = '1';
            }, 500);
        }
        
        workerManager.logActivity('info', `Refreshed virtual window for worker ${workerId}`);
    }
    
    renderAllWindows() {
        const container = document.getElementById('windowsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.windows.forEach((virtualWindow) => {
            const miniWindow = this.createMiniWindow(virtualWindow);
            container.appendChild(miniWindow);
        });
    }
    
    createMiniWindow(virtualWindow) {
        const miniWindow = document.createElement('div');
        miniWindow.className = 'virtual-window';
        miniWindow.innerHTML = `
            <div class="window-frame">
                <div class="window-header">
                    <div class="window-controls">
                        <span class="window-control close"></span>
                        <span class="window-control minimize"></span>
                        <span class="window-control maximize"></span>
                    </div>
                    <span class="window-title">${virtualWindow.title}</span>
                </div>
                <div class="window-content">
                    <div class="browser-simulation">
                        <div class="mini-content">
                            <div class="worker-info-mini">
                                <div class="worker-id-mini">${virtualWindow.worker.id}</div>
                                <div class="worker-status-mini ${virtualWindow.worker.status}">
                                    ${virtualWindow.worker.status.toUpperCase()}
                                </div>
                            </div>
                            <div class="task-progress-mini">
                                <div class="progress-bar-mini">
                                    <div class="progress-fill-mini" style="width: ${virtualWindow.worker.currentTask ? virtualWindow.worker.currentTask.progress : 0}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click handler to open full window
        miniWindow.addEventListener('click', () => {
            this.openWorkerWindow(virtualWindow.workerId);
        });
        
        return miniWindow;
    }
    
    getNextZIndex() {
        let maxZ = 1000;
        this.windows.forEach(window => {
            if (window.zIndex > maxZ) {
                maxZ = window.zIndex;
            }
        });
        return maxZ + 1;
    }
    
    closeActiveWindow() {
        const activeWindow = Array.from(this.windows.values()).find(w => w.isActive);
        if (activeWindow) {
            this.closeWindow(activeWindow.workerId);
        }
    }
    
    minimizeActiveWindow() {
        const activeWindow = Array.from(this.windows.values()).find(w => w.isActive);
        if (activeWindow) {
            this.minimizeWindow(activeWindow.workerId);
        }
    }
    
    maximizeActiveWindow() {
        const activeWindow = Array.from(this.windows.values()).find(w => w.isActive);
        if (activeWindow) {
            this.toggleMaximize(activeWindow.workerId);
        }
    }
    
    closeAllWindows() {
        const workerIds = Array.from(this.windows.keys());
        workerIds.forEach(workerId => {
            this.closeWindow(workerId);
        });
        
        workerManager.logActivity('info', 'Closed all virtual windows');
    }
    
    getWindowStats() {
        return {
            totalWindows: this.windows.size,
            activeWindows: Array.from(this.windows.values()).filter(w => w.isActive).length,
            minimizedWindows: Array.from(this.windows.values()).filter(w => w.isMinimized).length,
            maximizedWindows: Array.from(this.windows.values()).filter(w => w.isMaximized).length
        };
    }
}

// Initialize virtual window manager
let virtualWindowManager;
document.addEventListener('DOMContentLoaded', () => {
    virtualWindowManager = new VirtualWindowManager();
    console.log('Virtual Window Manager initialized');
});

// Add CSS for virtual windows
const virtualWindowStyles = document.createElement('style');
virtualWindowStyles.textContent = `
    .virtual-window-full {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: white;
        user-select: none;
    }
    
    .window-header-full {
        background: rgba(0, 0, 0, 0.3);
        padding: 0.75rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: move;
    }
    
    .window-controls-full {
        display: flex;
        gap: 0.5rem;
    }
    
    .window-control-btn {
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .window-control-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .window-control-btn.close:hover {
        background: #ff5f57;
    }
    
    .window-control-btn.minimize:hover {
        background: #ffbd2e;
    }
    
    .window-control-btn.maximize:hover {
        background: #28ca42;
    }
    
    .window-title-full {
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .window-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
    }
    
    .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }
    
    .status-indicator.working {
        background: #2ed573;
        animation: pulse 2s infinite;
    }
    
    .status-indicator.idle {
        background: #ffc107;
    }
    
    .status-indicator.error {
        background: #ff6b6b;
    }
    
    .status-indicator.offline {
        background: #6c757d;
    }
    
    .window-toolbar {
        background: rgba(0, 0, 0, 0.2);
        padding: 0.5rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 0.8rem;
    }
    
    .url-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .url {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-family: monospace;
        font-size: 0.75rem;
    }
    
    .refresh-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background 0.3s ease;
    }
    
    .refresh-btn:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .worker-stats {
        display: flex;
        gap: 1rem;
    }
    
    .window-content-full {
        flex: 1;
        overflow: auto;
        background: #1a1a1a;
    }
    
    .task-simulation {
        padding: 2rem;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .simulation-header {
        margin-bottom: 2rem;
    }
    
    .simulation-header h3 {
        color: #4facfe;
        margin-bottom: 1rem;
    }
    
    .survey-progress, .entry-progress {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .progress-bar-sim {
        width: 200px;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
    }
    
    .progress-fill-sim {
        height: 100%;
        background: linear-gradient(90deg, #4facfe, #00f2fe);
        transition: width 0.3s ease;
    }
    
    .question-container {
        background: rgba(255, 255, 255, 0.05);
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .question-container h4 {
        margin-bottom: 1.5rem;
        font-size: 1.1rem;
    }
    
    .answer-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .radio-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .radio-option:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: #4facfe;
    }
    
    .radio-option.selected {
        background: rgba(79, 172, 254, 0.1);
        border-color: #4facfe;
    }
    
    .btn-survey, .btn-data-entry {
        padding: 0.75rem 2rem;
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-survey.disabled, .btn-data-entry.disabled {
        background: rgba(255, 255, 255, 0.1);
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    .data-entry-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .form-field {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }
    
    .form-field.completed {
        border-color: #2ed573;
        background: rgba(46, 213, 115, 0.1);
    }
    
    .form-field label {
        min-width: 100px;
        font-weight: 600;
    }
    
    .form-field input {
        flex: 1;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: white;
    }
    
    .form-field input.filled {
        background: rgba(46, 213, 115, 0.1);
        border-color: #2ed573;
    }
    
    .form-field i {
        color: #2ed573;
    }
    
    .simulation-center {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
    
    .worker-activity {
        text-align: center;
    }
    
    .activity-icon {
        margin-bottom: 1rem;
        color: #4facfe;
    }
    
    .activity-progress {
        margin: 2rem 0;
    }
    
    .progress-circle {
        position: relative;
        display: inline-block;
    }
    
    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.2rem;
        font-weight: 600;
        color: #4facfe;
    }
    
    .activity-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    .status-dot {
        width: 8px;
        height: 8px;
        background: #2ed573;
        border-radius: 50%;
    }
    
    .window-footer {
        background: rgba(0, 0, 0, 0.3);
        padding: 0.75rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 0.8rem;
    }
    
    .progress-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
    }
    
    .mini-progress {
        width: 100px;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
    }
    
    .mini-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4facfe, #00f2fe);
        transition: width 0.3s ease;
    }
    
    .window-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .action-btn-small {
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .action-btn-small:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .resize-handle {
        background: linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%);
    }
    
    .mini-content {
        padding: 1rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .worker-info-mini {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .worker-id-mini {
        font-weight: 600;
        font-size: 0.8rem;
        color: #4facfe;
    }
    
    .worker-status-mini {
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: 600;
    }
    
    .worker-status-mini.working {
        background: rgba(46, 213, 115, 0.2);
        color: #2ed573;
    }
    
    .worker-status-mini.idle {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
    }
    
    .worker-status-mini.error {
        background: rgba(255, 107, 107, 0.2);
        color: #ff6b6b;
    }
    
    .worker-status-mini.offline {
        background: rgba(108, 117, 125, 0.2);
        color: #6c757d;
    }
    
    .task-progress-mini {
        margin-top: auto;
    }
    
    .progress-bar-mini {
        width: 100%;
        height: 3px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
    }
    
    .progress-fill-mini {
        height: 100%;
        background: linear-gradient(90deg, #4facfe, #00f2fe);
        transition: width 0.3s ease;
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
`;

document.head.appendChild(virtualWindowStyles);
