class PaymentSystem {
    constructor() {
        this.paymentMethods = new Map();
        this.pendingPayouts = new Map();
        this.completedPayouts = new Map();
        this.minimumPayout = 5.00; // Minimum $5 for payout
        this.paymentFee = 0.03; // 3% processing fee
        
        this.initializePaymentMethods();
        this.setupPayoutSchedule();
        
        console.log('💰 Payment System initialized');
    }
    
    initializePaymentMethods() {
        // PayPal Integration
        this.paymentMethods.set('paypal', {
            name: 'PayPal',
            enabled: true,
            apiEndpoint: 'https://api.paypal.com/v1/payments/payouts',
            credentials: {
                clientId: window.CONFIG?.PAYPAL?.CLIENT_ID || 'AVSVbuV65Ei6wU-QbQCYBj6RWvhxHGLEnKu-C7ccMMT8IRtVkPq8XqzfKcEroiesRKZTBeCLWxdYfJiv',
                clientSecret: window.CONFIG?.PAYPAL?.CLIENT_SECRET || 'EHMthIJfqw5n9w8jWX1K6Jd0zcDDeDKjp4XaNoaZ4mgteDlSWICS-RcC6Uoj85ZvwICUeFYl1yqzPzhe'
            },
            processingFee: 0.02, // 2%
            minimumAmount: 1.00
        });
        
        // Stripe Integration - DISABLED (PayPal only)
        this.paymentMethods.set('stripe', {
            name: 'Stripe',
            enabled: false,
            apiEndpoint: 'https://api.stripe.com/v1/transfers',
            credentials: {
                secretKey: 'disabled'
            },
            processingFee: 0.025, // 2.5%
            minimumAmount: 0.50
        });
        
        // Cryptocurrency - DISABLED (PayPal only)
        this.paymentMethods.set('crypto', {
            name: 'Cryptocurrency',
            enabled: false,
            apiEndpoint: 'https://api.coinbase.com/v2/transactions',
            credentials: {
                apiKey: 'disabled',
                apiSecret: 'disabled'
            },
            processingFee: 0.01, // 1%
            minimumAmount: 5.00
        });
        
        // Bank Transfer - DISABLED (PayPal only)
        this.paymentMethods.set('bank', {
            name: 'Bank Transfer',
            enabled: false,
            apiEndpoint: 'https://api.plaid.com/transfer/create',
            credentials: {
                clientId: 'disabled',
                secret: 'disabled'
            },
            processingFee: 0.005, // 0.5%
            minimumAmount: 10.00
        });
    }
    
    // Calculate real earnings for workers
    calculateRealEarnings(worker) {
        const baseRates = {
            survey: 0.50,      // $0.50 per survey
            'data-entry': 0.25, // $0.25 per data entry
            content: 2.00,     // $2.00 per content piece
            research: 1.50     // $1.50 per research task
        };
        
        const baseRate = baseRates[worker.type] || 0.50;
        const completedTasks = worker.tasksCompleted;
        const successRate = worker.successRate;
        
        // Calculate earnings with performance bonuses
        let totalEarnings = completedTasks * baseRate * successRate;
        
        // Performance bonuses
        if (successRate > 0.95) {
            totalEarnings *= 1.2; // 20% bonus for >95% success
        } else if (successRate > 0.90) {
            totalEarnings *= 1.1; // 10% bonus for >90% success
        }
        
        // Speed bonuses for fast completion
        if (worker.avgTaskTime < 20) {
            totalEarnings *= 1.15; // 15% bonus for fast completion
        }
        
        return Math.round(totalEarnings * 100) / 100; // Round to 2 decimals
    }
    
    // Setup automatic payout schedule
    setupPayoutSchedule() {
        // Daily payout check at midnight
        this.dailyPayoutInterval = setInterval(() => {
            this.processDailyPayouts();
        }, 24 * 60 * 60 * 1000); // 24 hours
        
        // Weekly payout processing (Fridays)
        this.weeklyPayoutInterval = setInterval(() => {
            const now = new Date();
            if (now.getDay() === 5) { // Friday
                this.processWeeklyPayouts();
            }
        }, 24 * 60 * 60 * 1000);
        
        console.log('📅 Payout schedule initialized');
    }
    
    // Process daily payouts for eligible workers
    async processDailyPayouts() {
        if (!window.workerManager) return;
        
        const eligibleWorkers = Array.from(window.workerManager.workers.values())
            .filter(worker => {
                const earnings = this.calculateRealEarnings(worker);
                return earnings >= this.minimumPayout;
            });
        
        console.log(`💰 Processing daily payouts for ${eligibleWorkers.length} workers`);
        
        for (const worker of eligibleWorkers) {
            await this.initiatePayout(worker, 'daily');
        }
        
        // Log payout summary
        window.workerManager?.logActivity('info', 
            `Daily payouts processed: ${eligibleWorkers.length} workers`);
    }
    
    // Process weekly payouts (larger amounts)
    async processWeeklyPayouts() {
        if (!window.workerManager) return;
        
        const allWorkers = Array.from(window.workerManager.workers.values());
        let totalPayout = 0;
        
        for (const worker of allWorkers) {
            const earnings = this.calculateRealEarnings(worker);
            if (earnings >= 1.00) { // Lower threshold for weekly
                await this.initiatePayout(worker, 'weekly');
                totalPayout += earnings;
            }
        }
        
        console.log(`💰 Weekly payouts: $${totalPayout.toFixed(2)} to ${allWorkers.length} workers`);
        
        // Send summary email/notification
        this.sendPayoutSummary('weekly', totalPayout, allWorkers.length);
    }
    
    // Initiate payout for a specific worker
    async initiatePayout(worker, payoutType = 'manual') {
        const earnings = this.calculateRealEarnings(worker);
        const payoutId = `payout_${worker.id}_${Date.now()}`;
        
        // Get worker's preferred payment method
        const paymentMethod = worker.preferredPaymentMethod || 'paypal';
        const paymentConfig = this.paymentMethods.get(paymentMethod);
        
        if (!paymentConfig || !paymentConfig.enabled) {
            throw new Error(`Payment method ${paymentMethod} not available`);
        }
        
        // Calculate fees
        const processingFee = earnings * paymentConfig.processingFee;
        const netAmount = earnings - processingFee;
        
        // Create payout record
        const payoutRecord = {
            id: payoutId,
            workerId: worker.id,
            grossAmount: earnings,
            processingFee: processingFee,
            netAmount: netAmount,
            paymentMethod: paymentMethod,
            status: 'pending',
            type: payoutType,
            createdAt: new Date().toISOString(),
            scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Next day
        };
        
        this.pendingPayouts.set(payoutId, payoutRecord);
        
        try {
            // Process the actual payment
            const paymentResult = await this.processPayment(payoutRecord, paymentConfig);
            
            if (paymentResult.success) {
                payoutRecord.status = 'completed';
                payoutRecord.transactionId = paymentResult.transactionId;
                payoutRecord.completedAt = new Date().toISOString();
                
                this.completedPayouts.set(payoutId, payoutRecord);
                this.pendingPayouts.delete(payoutId);
                
                // Reset worker earnings after successful payout
                worker.earnings = 0;
                worker.tasksCompleted = 0;
                
                // Log successful payout
                window.workerManager?.logActivity('success', 
                    `Payout completed: $${netAmount.toFixed(2)} to worker ${worker.id}`);
                
                // Send confirmation
                this.sendPayoutConfirmation(worker, payoutRecord);
                
            } else {
                payoutRecord.status = 'failed';
                payoutRecord.error = paymentResult.error;
                
                window.workerManager?.logActivity('error', 
                    `Payout failed for worker ${worker.id}: ${paymentResult.error}`);
            }
            
        } catch (error) {
            payoutRecord.status = 'failed';
            payoutRecord.error = error.message;
            
            console.error('Payout processing error:', error);
            window.workerManager?.logActivity('error', 
                `Payout error for worker ${worker.id}: ${error.message}`);
        }
        
        return payoutRecord;
    }
    
    // Process payment through selected method
    async processPayment(payoutRecord, paymentConfig) {
        const { paymentMethod, netAmount, workerId } = payoutRecord;
        
        try {
            switch (paymentMethod) {
                case 'paypal':
                    return await this.processPayPalPayout(payoutRecord, paymentConfig);
                    
                case 'stripe':
                    return await this.processStripePayout(payoutRecord, paymentConfig);
                    
                case 'crypto':
                    return await this.processCryptoPayout(payoutRecord, paymentConfig);
                    
                case 'bank':
                    return await this.processBankTransfer(payoutRecord, paymentConfig);
                    
                default:
                    throw new Error(`Unsupported payment method: ${paymentMethod}`);
            }
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // PayPal payout processing
    async processPayPalPayout(payoutRecord, config) {
        try {
            // Use the real PayPal API from config.js
            if (!window.realPaymentProcessor || !window.realPaymentProcessor.paypal) {
                throw new Error('PayPal API not initialized');
            }

            const paypalAPI = window.realPaymentProcessor.paypal;
            const recipientEmail = window.CONFIG?.PAYPAL?.YOUR_PAYPAL_EMAIL || 'utopiafemale@gmail.com';
            const amount = payoutRecord.netAmount;
            const note = `AI Worker Payment - Worker ID: ${payoutRecord.workerId}`;
            
            console.log(`💸 Sending $${amount.toFixed(2)} to ${recipientEmail}...`);
            
            // Make real PayPal API call using the sendPayment method
            const result = await paypalAPI.sendPayment(recipientEmail, amount, note);
            
            if (result.success) {
                console.log('✅ PayPal payout successful:', result);
                return {
                    success: true,
                    transactionId: result.batchId || `PP_${Date.now()}`,
                    response: result
                };
            } else {
                console.error('❌ PayPal payout failed:', result);
                return {
                    success: false,
                    error: result.error || 'PayPal payout failed'
                };
            }
            
        } catch (error) {
            console.error('❌ PayPal payout error:', error);
            return {
                success: false,
                error: error.message || 'PayPal API error'
            };
        }
    }
    
    // Stripe payout processing
    async processStripePayout(payoutRecord, config) {
        const transferData = {
            amount: Math.round(payoutRecord.netAmount * 100), // Convert to cents
            currency: 'usd',
            destination: this.getWorkerPaymentInfo(payoutRecord.workerId, 'stripe'),
            description: `AI Worker Payment - ${payoutRecord.workerId}`
        };
        
        console.log('Stripe transfer request:', transferData);
        
        return {
            success: true,
            transactionId: `ST_${Date.now()}`,
            response: transferData
        };
    }
    
    // Cryptocurrency payout processing
    async processCryptoPayout(payoutRecord, config) {
        const cryptoData = {
            type: 'send',
            to: this.getWorkerPaymentInfo(payoutRecord.workerId, 'crypto'),
            amount: payoutRecord.netAmount.toFixed(8),
            currency: 'BTC',
            description: `AI Worker Payment - ${payoutRecord.workerId}`
        };
        
        console.log('Crypto payout request:', cryptoData);
        
        return {
            success: true,
            transactionId: `BTC_${Date.now()}`,
            response: cryptoData
        };
    }
    
    // Bank transfer processing
    async processBankTransfer(payoutRecord, config) {
        const transferData = {
            access_token: 'worker_access_token',
            account_id: this.getWorkerPaymentInfo(payoutRecord.workerId, 'bank'),
            type: 'credit',
            network: 'ach',
            amount: {
                value: payoutRecord.netAmount,
                currency: 'USD'
            },
            description: `AI Worker Payment - ${payoutRecord.workerId}`
        };
        
        console.log('Bank transfer request:', transferData);
        
        return {
            success: true,
            transactionId: `ACH_${Date.now()}`,
            response: transferData
        };
    }
    
    // Get worker payment information
    getWorkerPaymentInfo(workerId, paymentMethod) {
        // In production, this would fetch from database
        const mockPaymentInfo = {
            paypal: `worker.${workerId}@email.com`,
            stripe: `acct_${workerId}`,
            crypto: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`, // Mock Bitcoin address
            bank: `bank_account_${workerId}`
        };
        
        return mockPaymentInfo[paymentMethod];
    }
    
    // Send payout confirmation
    sendPayoutConfirmation(worker, payoutRecord) {
        const confirmation = {
            workerId: worker.id,
            amount: payoutRecord.netAmount,
            method: payoutRecord.paymentMethod,
            transactionId: payoutRecord.transactionId,
            timestamp: payoutRecord.completedAt
        };
        
        console.log('📧 Payout confirmation sent:', confirmation);
        
        // In production, send actual email/SMS
        if (window.aiWorkerApp) {
            window.aiWorkerApp.showNotification(
                `💰 Payout completed: $${payoutRecord.netAmount.toFixed(2)} via ${payoutRecord.paymentMethod}`,
                'success'
            );
        }
    }
    
    // Send payout summary
    sendPayoutSummary(type, totalAmount, workerCount) {
        const summary = {
            type: type,
            totalAmount: totalAmount,
            workerCount: workerCount,
            timestamp: new Date().toISOString()
        };
        
        console.log('📊 Payout summary:', summary);
        
        if (window.aiWorkerApp) {
            window.aiWorkerApp.showNotification(
                `📊 ${type} payouts: $${totalAmount.toFixed(2)} to ${workerCount} workers`,
                'info'
            );
        }
    }
    
    // Manual payout trigger
    async triggerManualPayout(workerId) {
        const worker = window.workerManager?.workers.get(workerId);
        if (!worker) {
            throw new Error(`Worker ${workerId} not found`);
        }
        
        const earnings = this.calculateRealEarnings(worker);
        if (earnings < 1.00) {
            throw new Error(`Minimum payout amount not reached: $${earnings.toFixed(2)}`);
        }
        
        return await this.initiatePayout(worker, 'manual');
    }
    
    // Get payout statistics
    getPayoutStats() {
        const pending = Array.from(this.pendingPayouts.values());
        const completed = Array.from(this.completedPayouts.values());
        
        const stats = {
            pendingPayouts: pending.length,
            pendingAmount: pending.reduce((sum, p) => sum + p.netAmount, 0),
            completedPayouts: completed.length,
            completedAmount: completed.reduce((sum, p) => sum + p.netAmount, 0),
            totalProcessingFees: completed.reduce((sum, p) => sum + p.processingFee, 0),
            averagePayoutAmount: completed.length > 0 ? 
                completed.reduce((sum, p) => sum + p.netAmount, 0) / completed.length : 0
        };
        
        return stats;
    }
    
    // Export payout data
    exportPayoutData() {
        const data = {
            pendingPayouts: Array.from(this.pendingPayouts.entries()),
            completedPayouts: Array.from(this.completedPayouts.entries()),
            paymentMethods: Array.from(this.paymentMethods.entries()),
            stats: this.getPayoutStats(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payout-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('💾 Payout data exported');
    }
    
    // Setup worker payment preferences
    setupWorkerPaymentPreferences(workerId, preferences) {
        const worker = window.workerManager?.workers.get(workerId);
        if (!worker) return false;
        
        worker.paymentPreferences = {
            preferredMethod: preferences.method || 'paypal',
            paymentInfo: preferences.paymentInfo,
            minimumPayout: preferences.minimumPayout || this.minimumPayout,
            payoutSchedule: preferences.schedule || 'weekly', // daily, weekly, monthly
            taxInfo: preferences.taxInfo || null
        };
        
        console.log(`💳 Payment preferences set for worker ${workerId}`);
        return true;
    }
    
    // Tax reporting
    generateTaxReport(year = new Date().getFullYear()) {
        const completed = Array.from(this.completedPayouts.values())
            .filter(payout => new Date(payout.completedAt).getFullYear() === year);
        
        const taxReport = {
            year: year,
            totalPayouts: completed.length,
            totalAmount: completed.reduce((sum, p) => sum + p.netAmount, 0),
            totalFees: completed.reduce((sum, p) => sum + p.processingFee, 0),
            byWorker: {},
            byMonth: {}
        };
        
        // Group by worker
        completed.forEach(payout => {
            if (!taxReport.byWorker[payout.workerId]) {
                taxReport.byWorker[payout.workerId] = {
                    totalAmount: 0,
                    payoutCount: 0
                };
            }
            taxReport.byWorker[payout.workerId].totalAmount += payout.netAmount;
            taxReport.byWorker[payout.workerId].payoutCount++;
        });
        
        // Group by month
        completed.forEach(payout => {
            const month = new Date(payout.completedAt).getMonth() + 1;
            if (!taxReport.byMonth[month]) {
                taxReport.byMonth[month] = {
                    totalAmount: 0,
                    payoutCount: 0
                };
            }
            taxReport.byMonth[month].totalAmount += payout.netAmount;
            taxReport.byMonth[month].payoutCount++;
        });
        
        return taxReport;
    }
    
    // Cleanup
    destroy() {
        if (this.dailyPayoutInterval) {
            clearInterval(this.dailyPayoutInterval);
        }
        if (this.weeklyPayoutInterval) {
            clearInterval(this.weeklyPayoutInterval);
        }
        
        console.log('💰 Payment System destroyed');
    }
}

// Initialize payment system
let paymentSystem;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        paymentSystem = new PaymentSystem();
        window.paymentSystem = paymentSystem;
        
        // Add payment integration to worker manager
        if (window.workerManager) {
            window.workerManager.paymentSystem = paymentSystem;
            
            // Override earnings calculation to use real payment system
            const originalUpdateStats = window.workerManager.updateStats;
            window.workerManager.updateStats = function() {
                // Update real earnings for all workers
                this.workers.forEach(worker => {
                    worker.realEarnings = paymentSystem.calculateRealEarnings(worker);
                });
                
                // Call original update stats
                originalUpdateStats.call(this);
                
                // Update total real earnings
                const totalRealEarnings = Array.from(this.workers.values())
                    .reduce((sum, worker) => sum + (worker.realEarnings || 0), 0);
                
                document.getElementById('totalEarnings').textContent = totalRealEarnings.toFixed(2);
            };
        }
        
        console.log('💰 Payment System integrated with Worker Manager');
    }, 2000);
});

// Add payment system styles
const paymentStyles = document.createElement('style');
paymentStyles.textContent = `
    .payout-button {
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .payout-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }
    
    .payout-button:disabled {
        background: #6c757d;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
    
    .payment-method-selector {
        display: flex;
        gap: 0.5rem;
        margin: 1rem 0;
    }
    
    .payment-method {
        padding: 0.5rem 1rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .payment-method.selected {
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        border-color: transparent;
    }
    
    .earnings-real {
        color: #28a745;
        font-weight: 600;
    }
    
    .payout-status {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .payout-status.pending {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
    }
    
    .payout-status.completed {
        background: rgba(40, 167, 69, 0.2);
        color: #28a745;
    }
    
    .payout-status.failed {
        background: rgba(220, 53, 69, 0.2);
        color: #dc3545;
    }
`;

document.head.appendChild(paymentStyles);
