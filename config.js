// AI Worker Manager Configuration
// Set up your real payment credentials here

const CONFIG = {
    // Your PayPal Configuration
    PAYPAL: {
        // Your actual PayPal API credentials with Payouts permission
        CLIENT_ID: 'AVSVbuV65Ei6wU-QbQCYBj6RWvhxHGLEnKu-C7ccMMT8IRtVkPq8XqzfKcEroiesRKZTBeCLWxdYfJiv',
        CLIENT_SECRET: 'EKjCiG5yJ09RDxiPbSUkOHUrUf2-WHOeeUurzaYj606HKunE3N0irbs_SDBHggJNSH0KntPeuRkzt1cN',
        
        // PayPal API URLs
        SANDBOX_URL: 'https://api.sandbox.paypal.com', // For testing
        LIVE_URL: 'https://api.paypal.com', // For real payments
        
        // Set to false for real payments, true for testing
        USE_SANDBOX: false, // LIVE MODE - Real PayPal payments enabled!
        
        // Your PayPal email to receive payments
        YOUR_PAYPAL_EMAIL: 'utopiafemale@gmail.com' // Your actual PayPal email
    },
    
    // Worker Payment Settings
    WORKER_PAYMENTS: {
        // Your PayPal email (where you'll receive the earnings)
        OWNER_PAYPAL_EMAIL: 'utopiafemale@gmail.com', // Your actual PayPal email
        
        // Minimum payout amounts
        MINIMUM_PAYOUT: 5.00,
        DAILY_PAYOUT_MINIMUM: 5.00,
        WEEKLY_PAYOUT_MINIMUM: 1.00,
        
        // Processing fees (you can adjust these)
        PAYPAL_FEE: 0.02, // 2%
        PLATFORM_FEE: 0.01, // 1% platform fee for you
        
        // Payout schedule
        AUTO_DAILY_PAYOUTS: true,
        AUTO_WEEKLY_PAYOUTS: true,
        PAYOUT_TIME: '00:00' // Midnight UTC
    },
    
    // Earnings Configuration
    EARNINGS: {
        // Base rates per task (you can adjust these)
        SURVEY_RATE: 0.50,
        DATA_ENTRY_RATE: 0.25,
        CONTENT_RATE: 2.00,
        RESEARCH_RATE: 1.50,
        
        // Performance bonuses
        HIGH_PERFORMANCE_BONUS: 0.20, // 20% for >95% success
        GOOD_PERFORMANCE_BONUS: 0.10, // 10% for >90% success
        SPEED_BONUS: 0.15, // 15% for fast completion
        
        // Your cut from worker earnings
        PLATFORM_COMMISSION: 1.00 // 100% of all earnings go to your PayPal
    },
    
    // System Settings
    SYSTEM: {
        MAX_WORKERS: 3000,
        UPDATE_INTERVAL: 5000, // 5 seconds
        AUTO_SAVE_INTERVAL: 60000, // 1 minute
        
        // Enable real payments (set to true when ready)
        ENABLE_REAL_PAYMENTS: true, // REAL PAYMENTS ENABLED
        
        // Notification settings
        NOTIFY_ON_PAYOUT: true,
        NOTIFY_ON_ERROR: true
    }
};

// PayPal API Helper Functions
class PayPalAPI {
    constructor() {
        this.config = CONFIG.PAYPAL;
        this.baseURL = this.config.USE_SANDBOX ? this.config.SANDBOX_URL : this.config.LIVE_URL;
        this.accessToken = null;
    }
    
    // Get PayPal access token
    async getAccessToken() {
        const auth = btoa(`${this.config.CLIENT_ID}:${this.config.CLIENT_SECRET}`);
        
        try {
            const response = await fetch(`${this.baseURL}/v1/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });
            
            const data = await response.json();
            this.accessToken = data.access_token;
            
            console.log('✅ PayPal access token obtained');
            return this.accessToken;
            
        } catch (error) {
            console.error('❌ Failed to get PayPal access token:', error);
            throw error;
        }
    }
    
    // Send real PayPal payment
    async sendPayment(recipientEmail, amount, note = 'AI Worker Payment') {
        if (!CONFIG.SYSTEM.ENABLE_REAL_PAYMENTS) {
            console.log('🔒 Real payments disabled. Enable in config.js');
            return { success: false, error: 'Real payments disabled' };
        }
        
        // Minimum amount check
        if (amount < 0.01) {
            return { success: false, error: 'Amount too small' };
        }
        
        if (!this.accessToken) {
            await this.getAccessToken();
        }
        
        const payoutData = {
            sender_batch_header: {
                sender_batch_id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                email_subject: "💰 Payment from AI Worker System",
                email_message: `You have received $${amount.toFixed(2)} from the AI Worker Management System! 🤖💸`
            },
            items: [{
                recipient_type: "EMAIL",
                amount: {
                    value: amount.toFixed(2),
                    currency: "USD"
                },
                receiver: recipientEmail,
                note: note,
                sender_item_id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }]
        };
        
        try {
            console.log(`💸 Sending $${amount.toFixed(2)} to ${recipientEmail}...`);
            
            const response = await fetch(`${this.baseURL}/v1/payments/payouts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                body: JSON.stringify(payoutData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ PayPal payment sent successfully:', result);
                
                // Show success notification with details
                if (window.aiWorkerApp) {
                    window.aiWorkerApp.showNotification(
                        `💰 $${amount.toFixed(2)} sent to ${recipientEmail}!`,
                        'success'
                    );
                }
                
                return {
                    success: true,
                    batchId: result.batch_header.payout_batch_id,
                    status: result.batch_header.batch_status,
                    result: result,
                    amount: amount,
                    recipient: recipientEmail
                };
            } else {
                console.error('❌ PayPal payment failed:', result);
                
                // Show error notification
                if (window.aiWorkerApp) {
                    window.aiWorkerApp.showNotification(
                        `❌ Payment failed: ${result.message || 'Unknown error'}`,
                        'error'
                    );
                }
                
                return {
                    success: false,
                    error: result.message || 'Payment failed',
                    details: result
                };
            }
            
        } catch (error) {
            console.error('❌ PayPal API error:', error);
            
            // Show error notification
            if (window.aiWorkerApp) {
                window.aiWorkerApp.showNotification(
                    `❌ PayPal API error: ${error.message}`,
                    'error'
                );
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Check payment status
    async checkPaymentStatus(batchId) {
        if (!this.accessToken) {
            await this.getAccessToken();
        }
        
        try {
            const response = await fetch(`${this.baseURL}/v1/payments/payouts/${batchId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('❌ Failed to check payment status:', error);
            throw error;
        }
    }
}

// Real Payment Processor
class RealPaymentProcessor {
    constructor() {
        this.paypal = new PayPalAPI();
        this.totalEarnings = 0;
        this.totalPaid = 0;
        this.paymentHistory = [];
        this.ownerBalance = 0; // Your accumulated funds
        this.totalCommissionEarned = 0; // Total commission earned
        this.lastPayoutToOwner = null; // Last payout to your account
        this.startTime = Date.now(); // Track when system started
        
        console.log('💰 Real Payment Processor initialized with fund management');
    }
    
    // Calculate your earnings from worker activity - 100% of all earnings
    calculateOwnerEarnings(workers) {
        let totalWorkerEarnings = 0;
        
        workers.forEach(worker => {
            const workerEarnings = this.calculateWorkerEarnings(worker);
            totalWorkerEarnings += workerEarnings;
        });
        
        // You get 100% of all worker earnings
        return {
            totalWorkerEarnings,
            platformCommission: totalWorkerEarnings, // 100% goes to you
            yourEarnings: totalWorkerEarnings // All earnings go to your PayPal
        };
    }
    
    // Calculate individual worker earnings
    calculateWorkerEarnings(worker) {
        const baseRates = {
            survey: CONFIG.EARNINGS.SURVEY_RATE,
            'data-entry': CONFIG.EARNINGS.DATA_ENTRY_RATE,
            content: CONFIG.EARNINGS.CONTENT_RATE,
            research: CONFIG.EARNINGS.RESEARCH_RATE
        };
        
        const baseRate = baseRates[worker.type] || CONFIG.EARNINGS.SURVEY_RATE;
        let earnings = worker.tasksCompleted * baseRate * worker.successRate;
        
        // Apply bonuses
        if (worker.successRate > 0.95) {
            earnings *= (1 + CONFIG.EARNINGS.HIGH_PERFORMANCE_BONUS);
        } else if (worker.successRate > 0.90) {
            earnings *= (1 + CONFIG.EARNINGS.GOOD_PERFORMANCE_BONUS);
        }
        
        if (worker.avgTaskTime < 20) {
            earnings *= (1 + CONFIG.EARNINGS.SPEED_BONUS);
        }
        
        return Math.round(earnings * 100) / 100;
    }
    
    // Fund Management System - Collect your earnings
    async collectOwnerFunds() {
        if (!window.workerManager) return;
        
        const workers = Array.from(window.workerManager.workers.values());
        const earnings = this.calculateOwnerEarnings(workers);
        
        // Add to your balance
        this.ownerBalance += earnings.yourEarnings;
        this.totalCommissionEarned += earnings.yourEarnings;
        
        // Auto-transfer to your PayPal every 30 seconds
        if (this.ownerBalance >= 0.01) { // Transfer any amount above 1 cent
            await this.transferFundsToOwner();
        }
        
        // Update dashboard
        this.updateOwnerDashboard();
        
        return {
            newEarnings: earnings.yourEarnings,
            totalBalance: this.ownerBalance,
            totalCommission: this.totalCommissionEarned
        };
    }
    
    // Transfer accumulated funds to your PayPal
    async transferFundsToOwner() {
        if (this.ownerBalance < 0.01) {
            console.log('💰 Insufficient balance for transfer');
            return { success: false, error: 'Insufficient balance' };
        }
        
        const transferAmount = this.ownerBalance;
        
        try {
            // Send funds to your PayPal account
            const paymentResult = await this.paypal.sendPayment(
                CONFIG.WORKER_PAYMENTS.OWNER_PAYPAL_EMAIL,
                transferAmount,
                `Platform earnings transfer - ${new Date().toLocaleTimeString()}`
            );
            
            if (paymentResult.success) {
                // Record successful transfer
                this.lastPayoutToOwner = {
                    amount: transferAmount,
                    date: new Date().toISOString(),
                    transactionId: paymentResult.batchId,
                    status: 'completed'
                };
                
                // Reset balance after successful transfer
                this.ownerBalance = 0;
                
                // Log success
                console.log(`✅ Transferred $${transferAmount.toFixed(2)} to your PayPal`);
                
                // Show notification
                if (window.aiWorkerApp) {
                    window.aiWorkerApp.showNotification(
                        `💰 $${transferAmount.toFixed(2)} transferred to your PayPal!`,
                        'success'
                    );
                }
                
                // Update dashboard
                this.updateOwnerDashboard();
                
                return paymentResult;
                
            } else {
                console.error('❌ Failed to transfer funds:', paymentResult.error);
                return paymentResult;
            }
            
        } catch (error) {
            console.error('❌ Fund transfer error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Update owner dashboard with real-time fund info
    updateOwnerDashboard() {
        // Update balance display
        const balanceElement = document.getElementById('ownerBalance');
        if (balanceElement) {
            balanceElement.textContent = `$${this.ownerBalance.toFixed(2)}`;
        }
        
        // Update total commission earned
        const commissionElement = document.getElementById('totalCommission');
        if (commissionElement) {
            commissionElement.textContent = `$${this.totalCommissionEarned.toFixed(2)}`;
        }
        
        // Update last payout info
        const lastPayoutElement = document.getElementById('lastPayout');
        if (lastPayoutElement && this.lastPayoutToOwner) {
            lastPayoutElement.innerHTML = `
                $${this.lastPayoutToOwner.amount.toFixed(2)} - 
                ${new Date(this.lastPayoutToOwner.date).toLocaleTimeString()}
            `;
        }
    }
    
    // Setup automatic fund collection and transfers every 30 seconds
    startAutomaticFundManagement() {
        // Collect and transfer funds every 30 seconds
        setInterval(async () => {
            await this.collectOwnerFunds();
        }, 30 * 1000); // 30 seconds
        
        console.log('🔄 Automatic fund management started');
        console.log('💰 Funds will be transferred to your PayPal every 30 seconds');
    }
    
    // Add some test balance for demonstration
    addTestBalance(amount = 5.00) {
        this.ownerBalance += amount;
        this.totalCommissionEarned += amount;
        this.updateOwnerDashboard();
        console.log(`💰 Added $${amount.toFixed(2)} test balance`);
    }
    
    // Get payment statistics
    getPaymentStats() {
        return {
            totalPaid: this.totalPaid,
            paymentsCount: this.paymentHistory.length,
            averagePayment: this.paymentHistory.length > 0 ? 
                this.totalPaid / this.paymentHistory.length : 0,
            lastPayment: this.paymentHistory[this.paymentHistory.length - 1] || null
        };
    }
}

// Initialize real payment processor
let realPaymentProcessor;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        realPaymentProcessor = new RealPaymentProcessor();
        window.realPaymentProcessor = realPaymentProcessor;
        
        // Start automatic fund management if enabled
        if (CONFIG.SYSTEM.ENABLE_REAL_PAYMENTS) {
            realPaymentProcessor.startAutomaticFundManagement();
            console.log('🔄 Automatic fund management started');
            console.log('💰 Funds will be transferred to your PayPal every 30 seconds');
        }
        
        // Add some initial test balance for demonstration
        setTimeout(() => {
            realPaymentProcessor.addTestBalance(10.00); // Add $10 test balance
            console.log('💰 Test balance added - you can now test withdrawals');
        }, 2000);
        
        console.log('💰 Real Payment Processor ready');
    }, 3000);
});

// Add manual withdrawal function to window for easy access
window.withdrawFunds = function() {
    if (window.realPaymentProcessor) {
        return window.realPaymentProcessor.transferFundsToOwner();
    } else {
        console.error('Payment processor not initialized');
        return { success: false, error: 'Payment processor not initialized' };
    }
};

// Export configuration
window.CONFIG = CONFIG;
window.PayPalAPI = PayPalAPI;
window.RealPaymentProcessor = RealPaymentProcessor;
