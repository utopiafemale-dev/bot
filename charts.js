class ChartManager {
    constructor() {
        this.performanceChart = null;
        this.earningsChart = null;
        
        this.initializeCharts();
    }
    
    initializeCharts() {
        // Initialize performance chart
        this.setupPerformanceChart();
        
        // Initialize earnings chart
        this.setupEarningsChart();
        
        console.log('Chart Manager initialized');
    }
    
    setupPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(79, 172, 254, 0.8)');
        gradient.addColorStop(1, 'rgba(79, 172, 254, 0.1)');
        
        this.performanceChart = {
            canvas: canvas,
            ctx: ctx,
            gradient: gradient,
            data: [],
            maxDataPoints: 50
        };
        
        this.drawPerformanceChart();
    }
    
    setupEarningsChart() {
        const canvas = document.getElementById('earningsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(46, 213, 115, 0.8)');
        gradient.addColorStop(1, 'rgba(46, 213, 115, 0.1)');
        
        this.earningsChart = {
            canvas: canvas,
            ctx: ctx,
            gradient: gradient,
            data: [],
            maxDataPoints: 50
        };
        
        this.drawEarningsChart();
    }
    
    updateCharts(performanceData, earningsData) {
        if (this.performanceChart) {
            this.performanceChart.data = performanceData.slice(-this.performanceChart.maxDataPoints);
            this.drawPerformanceChart();
        }
        
        if (this.earningsChart) {
            this.earningsChart.data = earningsData.slice(-this.earningsChart.maxDataPoints);
            this.drawEarningsChart();
        }
    }
    
    drawPerformanceChart() {
        const chart = this.performanceChart;
        if (!chart || !chart.data.length) return;
        
        const { canvas, ctx, gradient, data } = chart;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set styles
        ctx.strokeStyle = '#4facfe';
        ctx.fillStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Calculate scales
        const maxWorkers = Math.max(...data.map(d => d.activeWorkers), 1);
        const xStep = width / (data.length - 1 || 1);
        const yScale = (height - 40) / maxWorkers;
        
        // Draw grid lines
        this.drawGrid(ctx, width, height, maxWorkers);
        
        // Draw area
        ctx.beginPath();
        ctx.moveTo(0, height - 20);
        
        data.forEach((point, index) => {
            const x = index * xStep;
            const y = height - 20 - (point.activeWorkers * yScale);
            
            if (index === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.lineTo(width, height - 20);
        ctx.closePath();
        ctx.fill();
        
        // Draw line
        ctx.beginPath();
        data.forEach((point, index) => {
            const x = index * xStep;
            const y = height - 20 - (point.activeWorkers * yScale);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#4facfe';
        data.forEach((point, index) => {
            const x = index * xStep;
            const y = height - 20 - (point.activeWorkers * yScale);
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw labels
        this.drawChartLabels(ctx, width, height, 'Active Workers', maxWorkers);
    }
    
    drawEarningsChart() {
        const chart = this.earningsChart;
        if (!chart || !chart.data.length) return;
        
        const { canvas, ctx, gradient, data } = chart;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set styles
        ctx.strokeStyle = '#2ed573';
        ctx.fillStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Calculate scales
        const maxEarnings = Math.max(...data.map(d => d.totalEarnings), 1);
        const xStep = width / (data.length - 1 || 1);
        const yScale = (height - 40) / maxEarnings;
        
        // Draw grid lines
        this.drawGrid(ctx, width, height, maxEarnings);
        
        // Draw area
        ctx.beginPath();
        ctx.moveTo(0, height - 20);
        
        data.forEach((point, index) => {
            const x = index * xStep;
            const y = height - 20 - (point.totalEarnings * yScale);
            
            if (index === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.lineTo(width, height - 20);
        ctx.closePath();
        ctx.fill();
        
        // Draw line
        ctx.beginPath();
        data.forEach((point, index) => {
            const x = index * xStep;
            const y = height - 20 - (point.totalEarnings * yScale);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#2ed573';
        data.forEach((point, index) => {
            const x = index * xStep;
            const y = height - 20 - (point.totalEarnings * yScale);
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw labels
        this.drawChartLabels(ctx, width, height, 'Total Earnings ($)', maxEarnings);
    }
    
    drawGrid(ctx, width, height, maxValue) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = 20 + (i * (height - 40) / gridLines);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        const verticalLines = 10;
        for (let i = 0; i <= verticalLines; i++) {
            const x = (i * width / verticalLines);
            ctx.beginPath();
            ctx.moveTo(x, 20);
            ctx.lineTo(x, height - 20);
            ctx.stroke();
        }
    }
    
    drawChartLabels(ctx, width, height, label, maxValue) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        // Y-axis labels
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = height - 20 - (i * (height - 40) / gridLines);
            const value = (i * maxValue / gridLines).toFixed(label.includes('$') ? 2 : 0);
            ctx.fillText(value, 5, y + 4);
        }
        
        // Chart title
        ctx.textAlign = 'center';
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(label, width / 2, 15);
    }
    
    // Real-time chart animation
    animateChart(chartType, newDataPoint) {
        const chart = chartType === 'performance' ? this.performanceChart : this.earningsChart;
        if (!chart) return;
        
        // Add new data point
        chart.data.push(newDataPoint);
        
        // Keep only max data points
        if (chart.data.length > chart.maxDataPoints) {
            chart.data.shift();
        }
        
        // Redraw chart
        if (chartType === 'performance') {
            this.drawPerformanceChart();
        } else {
            this.drawEarningsChart();
        }
    }
    
    // Export chart as image
    exportChart(chartType) {
        const chart = chartType === 'performance' ? this.performanceChart : this.earningsChart;
        if (!chart) return;
        
        const link = document.createElement('a');
        link.download = `${chartType}-chart-${new Date().toISOString().split('T')[0]}.png`;
        link.href = chart.canvas.toDataURL();
        link.click();
        
        workerManager.logActivity('info', `Exported ${chartType} chart`);
    }
    
    // Resize charts when window resizes
    resizeCharts() {
        if (this.performanceChart) {
            const canvas = this.performanceChart.canvas;
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            this.drawPerformanceChart();
        }
        
        if (this.earningsChart) {
            const canvas = this.earningsChart.canvas;
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            this.drawEarningsChart();
        }
    }
    
    // Generate chart statistics
    getChartStats() {
        const stats = {
            performance: {
                dataPoints: this.performanceChart?.data.length || 0,
                maxWorkers: this.performanceChart?.data.length ? Math.max(...this.performanceChart.data.map(d => d.activeWorkers)) : 0,
                avgWorkers: this.performanceChart?.data.length ? 
                    this.performanceChart.data.reduce((sum, d) => sum + d.activeWorkers, 0) / this.performanceChart.data.length : 0
            },
            earnings: {
                dataPoints: this.earningsChart?.data.length || 0,
                maxEarnings: this.earningsChart?.data.length ? Math.max(...this.earningsChart.data.map(d => d.totalEarnings)) : 0,
                totalEarnings: this.earningsChart?.data.length ? 
                    this.earningsChart.data[this.earningsChart.data.length - 1]?.totalEarnings || 0 : 0
            }
        };
        
        return stats;
    }
    
    // Clear all chart data
    clearCharts() {
        if (this.performanceChart) {
            this.performanceChart.data = [];
            this.drawPerformanceChart();
        }
        
        if (this.earningsChart) {
            this.earningsChart.data = [];
            this.drawEarningsChart();
        }
        
        workerManager.logActivity('info', 'Charts cleared');
    }
    
    // Add chart interaction handlers
    setupChartInteractions() {
        // Performance chart interactions
        if (this.performanceChart) {
            this.performanceChart.canvas.addEventListener('mousemove', (e) => {
                this.handleChartHover(e, 'performance');
            });
            
            this.performanceChart.canvas.addEventListener('click', (e) => {
                this.handleChartClick(e, 'performance');
            });
        }
        
        // Earnings chart interactions
        if (this.earningsChart) {
            this.earningsChart.canvas.addEventListener('mousemove', (e) => {
                this.handleChartHover(e, 'earnings');
            });
            
            this.earningsChart.canvas.addEventListener('click', (e) => {
                this.handleChartClick(e, 'earnings');
            });
        }
    }
    
    handleChartHover(event, chartType) {
        const chart = chartType === 'performance' ? this.performanceChart : this.earningsChart;
        if (!chart || !chart.data.length) return;
        
        const rect = chart.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Calculate which data point is being hovered
        const dataIndex = Math.round((x / chart.canvas.width) * (chart.data.length - 1));
        
        if (dataIndex >= 0 && dataIndex < chart.data.length) {
            const dataPoint = chart.data[dataIndex];
            
            // Show tooltip
            this.showChartTooltip(event, dataPoint, chartType);
        }
    }
    
    handleChartClick(event, chartType) {
        // Handle chart click events (e.g., drill down into specific time period)
        console.log(`Chart clicked: ${chartType}`);
    }
    
    showChartTooltip(event, dataPoint, chartType) {
        // Remove existing tooltip
        const existingTooltip = document.querySelector('.chart-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            left: ${event.clientX + 10}px;
            top: ${event.clientY - 10}px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            pointer-events: none;
            z-index: 10000;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        if (chartType === 'performance') {
            tooltip.innerHTML = `
                <div>Time: ${dataPoint.timestamp}</div>
                <div>Active Workers: ${dataPoint.activeWorkers}</div>
            `;
        } else {
            tooltip.innerHTML = `
                <div>Time: ${dataPoint.timestamp}</div>
                <div>Total Earnings: $${dataPoint.totalEarnings.toFixed(2)}</div>
            `;
        }
        
        document.body.appendChild(tooltip);
        
        // Remove tooltip after delay
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
    }
}

// Initialize chart manager
let chartManager;
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        chartManager = new ChartManager();
        
        // Setup chart interactions
        chartManager.setupChartInteractions();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            chartManager.resizeCharts();
        });
        
        console.log('Chart Manager ready');
    }, 1000);
});

// Export chart manager globally
window.chartManager = chartManager;
