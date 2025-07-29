class AIWorkerManager {
    constructor() {
        this.workers = new Map();
        this.totalWorkers = 0;
        this.activeWorkers = 0;
        this.totalEarnings = 0;
        this.isRunning = false;
        
        // Performance tracking
        this.performanceData = [];
        this.earningsData = [];
        
        // Worker types and their configurations
        this.workerTypes = {
            survey: {
                name: 'Survey Worker',
                baseEarning: 0.50,
                taskDuration: 30000, // 30 seconds
                successRate: 0.85,
                tasks: ['Complete Survey', 'Answer Questions', 'Provide Feedback', 'Rate Products']
            },
            'data-entry': {
                name: 'Data Entry',
                baseEarning: 0.25,
                taskDuration: 15000, // 15 seconds
                successRate: 0.92,
                tasks: ['Enter Data', 'Verify Information', 'Update Records', 'Process Forms']
            },
            content: {
                name: 'Content Creator',
                baseEarning: 2.00,
                taskDuration: 120000, // 2 minutes
                successRate: 0.78,
                tasks: ['Write Article', 'Create Content', 'Edit Text', 'Generate Ideas']
            },
            research: {
                name: 'Research Assistant',
                baseEarning: 1.50,
                taskDuration: 90000, // 1.5 minutes
                successRate: 0.88,
                tasks: ['Research Topic', 'Gather Information', 'Analyze Data', 'Compile Report']
            }
        };
        
        this.initializeEventListeners();
        this.startPerformanceTracking();
    }
    
    initializeEventListeners() {
        // Main control buttons
        document.getElementById('createWorkers').addEventListener('click', () => this.createWorkers());
        document.getElementById('startAll').addEventListener('click', () => this.startAllWorkers());
        document.getElementById('stopAll').addEventListener('click', () => this.stopAllWorkers());
        
        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });
        
        // Search functionality
        document.getElementById('workerSearch').addEventListener('input', (e) => this.searchWorkers(e.target.value));
        
        // Modal controls
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('modalStartWorker').addEventListener('click', () => this.startWorkerFromModal());
        document.getElementById('modalPauseWorker').addEventListener('click', () => this.pauseWorkerFromModal());
        document.getElementById('modalStopWorker').addEventListener('click', () => this.stopWorkerFromModal());
        document.getElementById('modalViewWindow').addEventListener('click', () => this.viewFullWindow());
        
        // Log controls
        document.getElementById('clearLog').addEventListener('click', () => this.clearLog());
        document.getElementById('exportLog').addEventListener('click', () => this.exportLog());
        
        // Close modal when clicking outside
        document.getElementById('workerModal').addEventListener('click', (e) => {
            if (e.target.id === 'workerModal') {
                this.closeModal();
            }
        });
    }
    
    createWorkers() {
        const count = parseInt(document.getElementById('workerCount').value);
        const type = document.getElementById('workerType').value;
        const performanceMode = document.getElementById('performanceMode').value;
        
        if (count < 1 || count > 3000) {
            this.logActivity('error', 'Worker count must be between 1 and 3000');
            return;
        }
        
        this.logActivity('info', `Creating ${count} ${type} workers in ${performanceMode} mode...`);
        
        // Create workers in batches to avoid UI freezing
        this.createWorkersBatch(count, type, performanceMode, 0, 50);
    }
    
    createWorkersBatch(totalCount, type, performanceMode, currentIndex, batchSize) {
        const endIndex = Math.min(currentIndex + batchSize, totalCount);
        
        for (let i = currentIndex; i < endIndex; i++) {
            const workerId = `worker_${type}_${Date.now()}_${i}`;
            const worker = new AIWorker(workerId, type, performanceMode, this.workerTypes[type]);
            
            this.workers.set(workerId, worker);
            this.totalWorkers++;
        }
        
        // Update UI
        this.updateStats();
        this.renderWorkerGrid();
        
        // Continue with next batch
        if (endIndex < totalCount) {
            setTimeout(() => {
                this.createWorkersBatch(totalCount, type, performanceMode, endIndex, batchSize);
            }, 10);
        } else {
            this.logActivity('success', `Successfully created ${totalCount} workers`);
        }
    }
    
    startAllWorkers() {
        if (this.workers.size === 0) {
            this.logActivity('warning', 'No workers available. Create workers first.');
            return;
        }
        
        this.isRunning = true;
        this.logActivity('info', `Starting all ${this.workers.size} workers...`);
        
        let startedCount = 0;
        this.workers.forEach(worker => {
            if (worker.status === 'idle' || worker.status === 'offline') {
                worker.start();
                startedCount++;
            }
        });
        
        this.logActivity('success', `Started ${startedCount} workers`);
        this.updateStats();
    }
    
    stopAllWorkers() {
        this.isRunning = false;
        this.logActivity('info', 'Stopping all workers...');
        
        let stoppedCount = 0;
        this.workers.forEach(worker => {
            if (worker.status !== 'offline') {
                worker.stop();
                stoppedCount++;
            }
        });
        
        this.logActivity('success', `Stopped ${stoppedCount} workers`);
        this.updateStats();
    }
    
    startWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.start();
            this.logActivity('info', `Started worker ${workerId}`);
            this.updateStats();
        }
    }
    
    pauseWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.pause();
            this.logActivity('info', `Paused worker ${workerId}`);
            this.updateStats();
        }
    }
    
    stopWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.stop();
            this.logActivity('info', `Stopped worker ${workerId}`);
            this.updateStats();
        }
    }
    
    deleteWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.stop();
            this.workers.delete(workerId);
            this.totalWorkers--;
            this.logActivity('info', `Deleted worker ${workerId}`);
            this.updateStats();
            this.renderWorkerGrid();
        }
    }
    
    updateStats() {
        let activeCount = 0;
        let workingCount = 0;
        let idleCount = 0;
        let errorCount = 0;
        let offlineCount = 0;
        let totalEarnings = 0;
        
        this.workers.forEach(worker => {
            if (worker.status === 'working') {
                activeCount++;
                workingCount++;
            } else if (worker.status === 'idle') {
                idleCount++;
            } else if (worker.status === 'error') {
                errorCount++;
            } else if (worker.status === 'offline') {
                offlineCount++;
            }
            
            totalEarnings += worker.earnings;
        });
        
        this.activeWorkers = activeCount;
        this.totalEarnings = totalEarnings;
        
        // Update header stats
        document.getElementById('totalWorkers').textContent = this.totalWorkers;
        document.getElementById('activeWorkers').textContent = this.activeWorkers;
        document.getElementById('totalEarnings').textContent = this.totalEarnings.toFixed(2);
        
        // Update status distribution
        document.getElementById('workingCount').textContent = workingCount;
        document.getElementById('idleCount').textContent = idleCount;
        document.getElementById('errorCount').textContent = errorCount;
        document.getElementById('offlineCount').textContent = offlineCount;
        
        // Update top performers
        this.updateTopPerformers();
    }
    
    updateTopPerformers() {
        const sortedWorkers = Array.from(this.workers.values())
            .sort((a, b) => b.earnings - a.earnings)
            .slice(0, 5);
        
        const container = document.getElementById('topPerformers');
        container.innerHTML = '';
        
        sortedWorkers.forEach(worker => {
            const item = document.createElement('div');
            item.className = 'performer-item';
            item.innerHTML = `
                <span class="performer-name">${worker.id}</span>
                <span class="performer-earnings">$${worker.earnings.toFixed(2)}</span>
            `;
            container.appendChild(item);
        });
    }
    
    renderWorkerGrid() {
        const container = document.getElementById('workerGrid');
        container.innerHTML = '';
        
        this.workers.forEach(worker => {
            const card = this.createWorkerCard(worker);
            container.appendChild(card);
        });
    }
    
    createWorkerCard(worker) {
        const card = document.createElement('div');
        card.className = 'worker-card fade-in';
        card.dataset.workerId = worker.id;
        
        const statusClass = `status-${worker.status}`;
        const progressWidth = worker.currentTask ? worker.currentTask.progress : 0;
        
        card.innerHTML = `
            <div class="worker-header">
                <span class="worker-id">${worker.id}</span>
                <span class="worker-status ${statusClass}">${worker.status.toUpperCase()}</span>
            </div>
            <div class="worker-info">
                <div class="info-item">
                    <span class="info-label">Type:</span>
                    <span class="info-value">${worker.type}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tasks:</span>
                    <span class="info-value">${worker.tasksCompleted}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Success:</span>
                    <span class="info-value">${(worker.successRate * 100).toFixed(1)}%</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Earnings:</span>
                    <span class="info-value">$${worker.earnings.toFixed(2)}</span>
                </div>
            </div>
            <div class="worker-progress">
                <div class="progress-label">
                    <span>${worker.currentTask ? worker.currentTask.name : 'No active task'}</span>
                    <span>${progressWidth}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressWidth}%"></div>
                </div>
            </div>
            <div class="worker-actions">
                <button class="action-btn start" onclick="workerManager.startWorker('${worker.id}')">
                    <i class="fas fa-play"></i>
                </button>
                <button class="action-btn pause" onclick="workerManager.pauseWorker('${worker.id}')">
                    <i class="fas fa-pause"></i>
                </button>
                <button class="action-btn stop" onclick="workerManager.stopWorker('${worker.id}')">
                    <i class="fas fa-stop"></i>
                </button>
                <button class="action-btn" onclick="workerManager.showWorkerDetails('${worker.id}')">
                    <i class="fas fa-info"></i>
                </button>
            </div>
        `;
        
        // Add click handler for card
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.worker-actions')) {
                this.showWorkerDetails(worker.id);
            }
        });
        
        return card;
    }
    
    showWorkerDetails(workerId) {
        const worker = this.workers.get(workerId);
        if (!worker) return;
        
        // Update modal content
        document.getElementById('modalWorkerName').textContent = `Worker: ${worker.id}`;
        document.getElementById('modalWorkerId').textContent = worker.id;
        document.getElementById('modalWorkerStatus').textContent = worker.status.toUpperCase();
        document.getElementById('modalWorkerType').textContent = worker.type;
        document.getElementById('modalWorkerUptime').textContent = this.formatUptime(worker.uptime);
        
        document.getElementById('modalTasksCompleted').textContent = worker.tasksCompleted;
        document.getElementById('modalSuccessRate').textContent = `${(worker.successRate * 100).toFixed(1)}%`;
        document.getElementById('modalEarnings').textContent = `$${worker.earnings.toFixed(2)}`;
        document.getElementById('modalAvgTime').textContent = `${worker.avgTaskTime}s`;
        
        if (worker.currentTask) {
            document.getElementById('modalCurrentTask').textContent = worker.currentTask.name;
            document.getElementById('modalTaskProgress').style.width = `${worker.currentTask.progress}%`;
            document.getElementById('modalProgressText').textContent = `${worker.currentTask.progress}%`;
        } else {
            document.getElementById('modalCurrentTask').textContent = 'No active task';
            document.getElementById('modalTaskProgress').style.width = '0%';
            document.getElementById('modalProgressText').textContent = '0%';
        }
        
        // Update virtual window preview
        this.updateVirtualWindowPreview(worker);
        
        // Store current worker for modal actions
        this.currentModalWorker = workerId;
        
        // Show modal
        document.getElementById('workerModal').classList.add('show');
    }
    
    updateVirtualWindowPreview(worker) {
        const container = document.getElementById('modalBrowserContent');
        
        if (worker.status === 'working' && worker.currentTask) {
            container.innerHTML = `
                <div class="task-simulation">
                    <div class="simulated-website">
                        <div class="website-header">
                            <div class="url-bar">https://survey-site.com/task/${worker.currentTask.id}</div>
                        </div>
                        <div class="website-content">
                            <h3>${worker.currentTask.name}</h3>
                            <div class="form-simulation">
                                <div class="form-field">
                                    <label>Question 1:</label>
                                    <div class="input-simulation ${worker.currentTask.progress > 25 ? 'filled' : ''}"></div>
                                </div>
                                <div class="form-field">
                                    <label>Question 2:</label>
                                    <div class="input-simulation ${worker.currentTask.progress > 50 ? 'filled' : ''}"></div>
                                </div>
                                <div class="form-field">
                                    <label>Question 3:</label>
                                    <div class="input-simulation ${worker.currentTask.progress > 75 ? 'filled' : ''}"></div>
                                </div>
                                <button class="submit-btn ${worker.currentTask.progress === 100 ? 'active' : ''}">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-robot"></i>
                    <span>Worker ${worker.status}</span>
                </div>
            `;
        }
    }
    
    closeModal() {
        document.getElementById('workerModal').classList.remove('show');
        this.currentModalWorker = null;
    }
    
    startWorkerFromModal() {
        if (this.currentModalWorker) {
            this.startWorker(this.currentModalWorker);
            this.showWorkerDetails(this.currentModalWorker); // Refresh modal
        }
    }
    
    pauseWorkerFromModal() {
        if (this.currentModalWorker) {
            this.pauseWorker(this.currentModalWorker);
            this.showWorkerDetails(this.currentModalWorker); // Refresh modal
        }
    }
    
    stopWorkerFromModal() {
        if (this.currentModalWorker) {
            this.stopWorker(this.currentModalWorker);
            this.showWorkerDetails(this.currentModalWorker); // Refresh modal
        }
    }
    
    viewFullWindow() {
        if (this.currentModalWorker) {
            // Create full-size virtual window
            window.virtualWindowManager.openWorkerWindow(this.currentModalWorker);
        }
    }
    
    switchView(viewType) {
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
        
        // Show/hide views
        document.getElementById('gridView').classList.toggle('hidden', viewType !== 'grid');
        document.getElementById('windowsView').classList.toggle('hidden', viewType !== 'windows');
        
        if (viewType === 'windows') {
            window.virtualWindowManager.renderAllWindows();
        } else if (viewType === 'list') {
            this.renderWorkerList();
        }
    }
    
    renderWorkerList() {
        // Convert grid to list view
        const container = document.getElementById('workerGrid');
        container.style.gridTemplateColumns = '1fr';
        
        // Update cards for list layout
        container.querySelectorAll('.worker-card').forEach(card => {
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.padding = '1rem 1.5rem';
        });
    }
    
    searchWorkers(query) {
        const cards = document.querySelectorAll('.worker-card');
        
        cards.forEach(card => {
            const workerId = card.dataset.workerId;
            const worker = this.workers.get(workerId);
            
            const matchesSearch = !query || 
                workerId.toLowerCase().includes(query.toLowerCase()) ||
                worker.type.toLowerCase().includes(query.toLowerCase()) ||
                worker.status.toLowerCase().includes(query.toLowerCase());
            
            card.style.display = matchesSearch ? 'block' : 'none';
        });
    }
    
    startPerformanceTracking() {
        setInterval(() => {
            // Update performance data
            const timestamp = new Date().toLocaleTimeString();
            const activeWorkers = Array.from(this.workers.values()).filter(w => w.status === 'working').length;
            const totalEarnings = Array.from(this.workers.values()).reduce((sum, w) => sum + w.earnings, 0);
            
            this.performanceData.push({ timestamp, activeWorkers });
            this.earningsData.push({ timestamp, totalEarnings });
            
            // Keep only last 50 data points
            if (this.performanceData.length > 50) {
                this.performanceData.shift();
                this.earningsData.shift();
            }
            
            // Update charts if available
            if (window.chartManager) {
                window.chartManager.updateCharts(this.performanceData, this.earningsData);
            }
            
            // Update stats
            this.updateStats();
            
            // Update worker cards
            this.updateWorkerCards();
            
        }, 5000); // Update every 5 seconds
    }
    
    updateWorkerCards() {
        this.workers.forEach(worker => {
            const card = document.querySelector(`[data-worker-id="${worker.id}"]`);
            if (card) {
                // Update status
                const statusElement = card.querySelector('.worker-status');
                statusElement.className = `worker-status status-${worker.status}`;
                statusElement.textContent = worker.status.toUpperCase();
                
                // Update progress
                const progressFill = card.querySelector('.progress-fill');
                const progressText = card.querySelector('.progress-label span:last-child');
                const taskName = card.querySelector('.progress-label span:first-child');
                
                if (worker.currentTask) {
                    progressFill.style.width = `${worker.currentTask.progress}%`;
                    progressText.textContent = `${worker.currentTask.progress}%`;
                    taskName.textContent = worker.currentTask.name;
                } else {
                    progressFill.style.width = '0%';
                    progressText.textContent = '0%';
                    taskName.textContent = 'No active task';
                }
                
                // Update earnings
                const earningsElement = card.querySelector('.info-value:last-child');
                earningsElement.textContent = `$${worker.earnings.toFixed(2)}`;
            }
        });
    }
    
    logActivity(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry slide-in';
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-level ${level}">[${level.toUpperCase()}]</span>
            <span class="log-message">${message}</span>
        `;
        
        const logContent = document.getElementById('logContent');
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
        
        // Keep only last 100 log entries
        while (logContent.children.length > 100) {
            logContent.removeChild(logContent.firstChild);
        }
    }
    
    clearLog() {
        document.getElementById('logContent').innerHTML = '';
        this.logActivity('info', 'Log cleared');
    }
    
    exportLog() {
        const logEntries = Array.from(document.querySelectorAll('.log-entry'))
            .map(entry => entry.textContent)
            .join('\n');
        
        const blob = new Blob([logEntries], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `worker-log-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.logActivity('info', 'Log exported successfully');
    }
    
    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Export/Import functionality
    exportWorkers() {
        const workersData = Array.from(this.workers.values()).map(worker => ({
            id: worker.id,
            type: worker.type,
            performanceMode: worker.performanceMode,
            tasksCompleted: worker.tasksCompleted,
            earnings: worker.earnings,
            successRate: worker.successRate
        }));
        
        const data = {
            workers: workersData,
            totalEarnings: this.totalEarnings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-workers-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.logActivity('info', `Exported ${workersData.length} workers`);
    }
    
    importWorkers(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                data.workers.forEach(workerData => {
                    const worker = new AIWorker(
                        workerData.id,
                        workerData.type,
                        workerData.performanceMode || 'balanced',
                        this.workerTypes[workerData.type]
                    );
                    
                    worker.tasksCompleted = workerData.tasksCompleted || 0;
                    worker.earnings = workerData.earnings || 0;
                    worker.successRate = workerData.successRate || 0.85;
                    
                    this.workers.set(worker.id, worker);
                    this.totalWorkers++;
                });
                
                this.updateStats();
                this.renderWorkerGrid();
                this.logActivity('success', `Imported ${data.workers.length} workers`);
                
            } catch (error) {
                this.logActivity('error', `Failed to import workers: ${error.message}`);
            }
        };
        
        reader.readAsText(file);
    }
}

// Individual AI Worker Class
class AIWorker {
    constructor(id, type, performanceMode, config) {
        this.id = id;
        this.type = type;
        this.performanceMode = performanceMode;
        this.config = config;
        
        this.status = 'offline'; // offline, idle, working, error
        this.tasksCompleted = 0;
        this.earnings = 0;
        this.successRate = config.successRate;
        this.avgTaskTime = config.taskDuration / 1000;
        this.uptime = 0;
        
        this.currentTask = null;
        this.taskQueue = [];
        this.errors = [];
        
        this.startTime = null;
        this.lastTaskTime = null;
        
        // Performance mode adjustments
        this.applyPerformanceMode();
        
        // Start uptime tracking
        this.uptimeInterval = setInterval(() => {
            if (this.status !== 'offline') {
                this.uptime++;
            }
        }, 1000);
    }
    
    applyPerformanceMode() {
        switch (this.performanceMode) {
            case 'speed':
                this.config.taskDuration *= 0.7; // 30% faster
                this.successRate *= 0.95; // Slightly lower accuracy
                break;
            case 'accuracy':
                this.config.taskDuration *= 1.3; // 30% slower
                this.successRate *= 1.05; // Higher accuracy
                break;
            case 'stealth':
                this.config.taskDuration *= 1.5; // 50% slower
                this.addRandomDelays = true;
                break;
            case 'balanced':
            default:
                // No changes
                break;
        }
    }
    
    start() {
        if (this.status === 'offline' || this.status === 'idle') {
            this.status = 'idle';
            this.startTime = Date.now();
            this.scheduleNextTask();
            
            // Log start
            workerManager.logActivity('info', `Worker ${this.id} started`);
        }
    }
    
    pause() {
        if (this.status === 'working') {
            this.status = 'idle';
            if (this.currentTaskTimeout) {
                clearTimeout(this.currentTaskTimeout);
                this.currentTaskTimeout = null;
            }
            
            workerManager.logActivity('info', `Worker ${this.id} paused`);
        }
    }
    
    stop() {
        this.status = 'offline';
        if (this.currentTaskTimeout) {
            clearTimeout(this.currentTaskTimeout);
            this.currentTaskTimeout = null;
        }
        if (this.nextTaskTimeout) {
            clearTimeout(this.nextTaskTimeout);
            this.nextTaskTimeout = null;
        }
        this.currentTask = null;
        
        workerManager.logActivity('info', `Worker ${this.id} stopped`);
    }
    
    scheduleNextTask() {
        if (this.status === 'offline') return;
        
        // Random delay between tasks (1-10 seconds)
        const delay = Math.random() * 9000 + 1000;
        
        this.nextTaskTimeout = setTimeout(() => {
            this.startTask();
        }, delay);
    }
    
    startTask() {
        if (this.status === 'offline') return;
        
        this.status = 'working';
        
        // Create new task
        const taskName = this.getRandomTask();
        this.currentTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: taskName,
            progress: 0,
            startTime: Date.now()
        };
        
        // Simulate task progress
        this.simulateTaskProgress();
        
        workerManager.logActivity('info', `Worker ${this.id} started task: ${taskName}`);
    }
    
    simulateTaskProgress() {
        const progressInterval = this.config.taskDuration / 20; // 20 progress updates
        let progressStep = 0;
        
        const updateProgress = () => {
            if (this.status !== 'working' || !this.currentTask) return;
            
            progressStep++;
            this.currentTask.progress = Math.min((progressStep / 20) * 100, 100);
            
            if (this.currentTask.progress >= 100) {
                this.completeTask();
            } else {
                this.currentTaskTimeout = setTimeout(updateProgress, progressInterval);
            }
        };
        
        updateProgress();
    }
    
    completeTask() {
        if (!this.currentTask) return;
        
        const taskDuration = Date.now() - this.currentTask.startTime;
        const success = Math.random() < this.successRate;
        
        if (success) {
            this.tasksCompleted++;
            this.earnings += this.config.baseEarning * (0.8 + Math.random() * 0.4); // ±20% variation
            this.avgTaskTime = ((this.avgTaskTime * (this.tasksCompleted - 1)) + (taskDuration / 1000)) / this.tasksCompleted;
            
            workerManager.logActivity('success', `Worker ${this.id} completed task: ${this.currentTask.name} (+$${this.config.baseEarning.toFixed(2)})`);
        } else {
            this.errors.push({
                timestamp: Date.now(),
                task: this.currentTask.name,
                error: 'Task failed'
            });
            
            workerManager.logActivity('warning', `Worker ${this.id} failed task: ${this.currentTask.name}`);
        }
        
        this.currentTask = null;
        this.status = 'idle';
        
        // Schedule next task
        this.scheduleNextTask();
    }
    
    getRandomTask() {
        const tasks = this.config.tasks;
        return tasks[Math.floor(Math.random() * tasks.length)];
    }
    
    handleError(error) {
        this.status = 'error';
        this.errors.push({
            timestamp: Date.now(),
            error: error.message || error
        });
        
        workerManager.logActivity('error', `Worker ${this.id} encountered error: ${error.message || error}`);
        
        // Auto-recover after 30 seconds
        setTimeout(() => {
            if (this.status === 'error') {
                this.status = 'idle';
                this.scheduleNextTask();
            }
        }, 30000);
    }
    
    destroy() {
        this.stop();
        if (this.uptimeInterval) {
            clearInterval(this.uptimeInterval);
        }
    }
}

// Initialize the worker manager when the page loads
let workerManager;
document.addEventListener('DOMContentLoaded', () => {
    workerManager = new AIWorkerManager();
    console.log('AI Worker Manager initialized');
});
