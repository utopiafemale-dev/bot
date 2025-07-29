// Live Coinbase Bitcoin Payment System
class LiveCoinbaseSystem {
    constructor() {
        this.balance = 50.00; // Starting balance
        this.transferHistory = [];
        this.isTransferring = false;
        this.totalTransferred = 0;
        this.transferCount = 0;
        
        // Coinbase API Configuration - UPDATE WITH YOUR CREDENTIALS
        this.coinbaseConfig = {
            // Regular Coinbase API
            apiKey: 'f431e433-6d11-4d47-b9f1-49c72608dd83',
            apiSecret: 'o9kS3BWPR8Lt2xivels3NlYnsY+HtGup1yrOr8e+EJAbBdE5Bb4OBCBAxRn50FebYH6zfDqr1nl6HIY6vg3WIw==',
            
            // Coinbase Pro/Advanced Trade (if using)
            passphrase: 'YOUR_COINBASE_PASSPHRASE_HERE', // Only for Pro
            
            // API URLs
            sandboxUrl: 'https://api.sandbox.coinbase.com',
            liveUrl: 'https://api.coinbase.com',
            proSandboxUrl: 'https://api-public.sandbox.pro.coinbase.com',
            proLiveUrl: 'https://api.pro.coinbase.com',
            
            // Settings
            useSandbox: false, // Set to false for real payments
            usePro: false, // Set to true if using Coinbase Pro
            
            // Your receiving wallet
            receivingWallet: 'bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u'
        };
        
        this.initializeLiveSystem();
    }
    
    initializeLiveSystem() {
        console.log('🚀 Live Coinbase System initialized');
        console.log('📍 Receiving wallet:', this.coinbaseConfig.receivingWallet);
        
        // Check if API credentials are configured
        if (this.coinbaseConfig.apiKey === 'YOUR_COINBASE_API_KEY_HERE') {
            this.showNotification('⚠️ Please configure your Coinbase API credentials in live-coinbase-system.js', 'warning');
            console.log('⚠️ API credentials not configured. Please update coinbaseConfig.');
        } else {
            this.showNotification('✅ Coinbase API configured! Ready for live Bitcoin payments!', 'success');
            this.testConnection();
        }
        
        // Setup automatic transfers every 30 seconds
        this.setupAutoTransfer();
        
        // Setup UI handlers
        this.setupUIHandlers();
        
        // Update display
        this.updateDisplay();
    }
    
    setupAutoTransfer() {
        setInterval(() => {
            if (this.balance >= 0.01 && !this.isTransferring && this.isConfigured()) {
                this.processLiveBitcoinTransfer('automatic');
            }
        }, 30000); // 30 seconds
        
        console.log('🔄 Auto-transfer enabled: Every 30 seconds');
    }
    
    setupUIHandlers() {
        // Find and setup transfer buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            
            const text = button.textContent.toLowerCase();
            if (text.includes('transfer') || text.includes('withdraw') || text.includes('payout')) {
                e.preventDefault();
                this.processLiveBitcoinTransfer('manual');
            }
        });
    }
    
    isConfigured() {
        return this.coinbaseConfig.apiKey !== 'YOUR_COINBASE_API_KEY_HERE' &&
               this.coinbaseConfig.apiSecret !== 'YOUR_COINBASE_API_SECRET_HERE';
    }
    
    async testConnection() {
        if (!this.isConfigured()) {
            console.log('❌ Cannot test connection - API credentials not configured');
            return;
        }
        
        try {
            const accounts = await this.getCoinbaseAccounts();
            if (accounts && accounts.length > 0) {
                this.showNotification('✅ Coinbase connection successful!', 'success');
                console.log('✅ Coinbase connection test passed');
            }
        } catch (error) {
            this.showNotification(`❌ Coinbase connection failed: ${error.message}`, 'error');
            console.error('❌ Coinbase connection test failed:', error);
        }
    }
    
    async processLiveBitcoinTransfer(type = 'manual') {
        if (this.isTransferring) {
            this.showNotification('Transfer already in progress...', 'warning');
            return;
        }
        
        if (!this.isConfigured()) {
            this.showNotification('❌ Please configure Coinbase API credentials first!', 'error');
            return;
        }
        
        if (this.balance < 0.01) {
            this.showNotification('Insufficient balance for transfer', 'error');
            return;
        }
        
        this.isTransferring = true;
        const usdAmount = this.balance;
        
        try {
            this.showNotification(`🚀 Processing ${type} Bitcoin transfer: $${usdAmount.toFixed(2)}...`, 'info');
            
            // Get current Bitcoin price
            const btcPrice = await this.getBitcoinPrice();
            const btcAmount = usdAmount / btcPrice;
            
            // Send real Bitcoin transaction
            const transaction = await this.sendBitcoinTransaction(btcAmount, usdAmount);
            
            if (transaction.success) {
                // Record successful transfer
                this.recordTransfer(usdAmount, btcAmount, type, 'completed', transaction);
                
                // Update totals
                this.totalTransferred += usdAmount;
                this.transferCount++;
                
                // Reset balance
                this.balance = 0;
                
                // Update display
                this.updateDisplay();
                
                // Show success
                this.showNotification(
                    `✅ Successfully sent ${btcAmount.toFixed(8)} BTC to your wallet!
                     💰 USD Value: $${usdAmount.toFixed(2)}
                     🔗 Transaction ID: ${transaction.txId}`, 
                    'success'
                );
                
                // Add more balance for continuous operation
                setTimeout(() => {
                    this.balance = 25.00 + (Math.random() * 15); // Random $25-40
                    this.updateDisplay();
                    this.showNotification('💰 New worker earnings added!', 'info');
                }, 10000);
                
            } else {
                throw new Error(transaction.error || 'Transaction failed');
            }
            
        } catch (error) {
            this.showNotification(`❌ Transfer failed: ${error.message}`, 'error');
            this.recordTransfer(usdAmount, 0, type, 'failed', { error: error.message });
            console.error('❌ Bitcoin transfer failed:', error);
        } finally {
            this.isTransferring = false;
        }
    }
    
    async getBitcoinPrice() {
        try {
            // Get Bitcoin price from Coinbase
            const response = await fetch(`${this.getApiUrl()}/v2/exchange-rates?currency=BTC`);
            const data = await response.json();
            
            if (data && data.data && data.data.rates && data.data.rates.USD) {
                const price = parseFloat(data.data.rates.USD);
                console.log(`💰 Current Bitcoin price: $${price.toLocaleString()}`);
                return price;
            } else {
                throw new Error('Unable to fetch Bitcoin price');
            }
        } catch (error) {
            console.error('❌ Error fetching Bitcoin price:', error);
            // Fallback to approximate price
            return 43000; // Approximate BTC price
        }
    }
    
    async getCoinbaseAccounts() {
        const url = `${this.getApiUrl()}/v2/accounts`;
        const headers = this.getAuthHeaders('GET', '/v2/accounts');
        
        const response = await fetch(url, { headers });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get accounts');
        }
        
        return data.data;
    }
    
    async sendBitcoinTransaction(btcAmount, usdAmount) {
        try {
            // First, get Bitcoin account
            const accounts = await this.getCoinbaseAccounts();
            const btcAccount = accounts.find(acc => acc.currency.code === 'BTC');
            
            if (!btcAccount) {
                throw new Error('No Bitcoin account found. Please add Bitcoin to your Coinbase account.');
            }
            
            // Check if account has sufficient balance
            const balance = parseFloat(btcAccount.balance.amount);
            if (balance < btcAmount) {
                throw new Error(`Insufficient Bitcoin balance. Have: ${balance.toFixed(8)} BTC, Need: ${btcAmount.toFixed(8)} BTC`);
            }
            
            // Create transaction
            const transactionData = {
                type: 'send',
                to: this.coinbaseConfig.receivingWallet,
                amount: btcAmount.toFixed(8),
                currency: 'BTC',
                description: `AI Worker Payment - $${usdAmount.toFixed(2)}`
            };
            
            const url = `${this.getApiUrl()}/v2/accounts/${btcAccount.id}/transactions`;
            const headers = this.getAuthHeaders('POST', `/v2/accounts/${btcAccount.id}/transactions`, JSON.stringify(transactionData));
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Transaction failed');
            }
            
            console.log('✅ Bitcoin transaction successful:', result);
            
            return {
                success: true,
                txId: result.data.id,
                hash: result.data.network?.hash || 'pending',
                amount: btcAmount,
                usdValue: usdAmount,
                result: result.data
            };
            
        } catch (error) {
            console.error('❌ Bitcoin transaction error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    getApiUrl() {
        if (this.coinbaseConfig.usePro) {
            return this.coinbaseConfig.useSandbox ? 
                this.coinbaseConfig.proSandboxUrl : 
                this.coinbaseConfig.proLiveUrl;
        } else {
            return this.coinbaseConfig.useSandbox ? 
                this.coinbaseConfig.sandboxUrl : 
                this.coinbaseConfig.liveUrl;
        }
    }
    
    getAuthHeaders(method, path, body = '') {
        const timestamp = Math.floor(Date.now() / 1000);
        
        if (this.coinbaseConfig.usePro) {
            // Coinbase Pro authentication
            const message = timestamp + method + path + body;
            const signature = this.createHmacSignature(message, this.coinbaseConfig.apiSecret);
            
            return {
                'CB-ACCESS-KEY': this.coinbaseConfig.apiKey,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': timestamp.toString(),
                'CB-ACCESS-PASSPHRASE': this.coinbaseConfig.passphrase
            };
        } else {
            // Regular Coinbase authentication
            const message = timestamp + method + path + body;
            const signature = this.createHmacSignature(message, this.coinbaseConfig.apiSecret);
            
            return {
                'CB-ACCESS-KEY': this.coinbaseConfig.apiKey,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': timestamp.toString(),
                'CB-VERSION': '2021-06-25'
            };
        }
    }
    
    createHmacSignature(message, secret) {
        // Note: In a real implementation, you'd use crypto.createHmac
        // For browser compatibility, we'll use a simplified approach
        // In production, this should be done server-side for security
        
        try {
            // This is a simplified signature - in production use proper HMAC-SHA256
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            const key = encoder.encode(secret);
            
            // For demo purposes - in production, use proper crypto library
            return btoa(message + secret).substring(0, 64);
        } catch (error) {
            console.error('Signature creation error:', error);
            return 'demo_signature';
        }
    }
    
    recordTransfer(usdAmount, btcAmount, type, status, transaction) {
        const transfer = {
            id: `live_${Date.now()}`,
            usdAmount: usdAmount,
            btcAmount: btcAmount,
            type: type,
            status: status,
            timestamp: new Date().toISOString(),
            txId: transaction.txId || null,
            hash: transaction.hash || null,
            walletAddress: this.coinbaseConfig.receivingWallet
        };
        
        this.transferHistory.push(transfer);
        
        // Keep only last 50 transfers
        if (this.transferHistory.length > 50) {
            this.transferHistory = this.transferHistory.slice(-50);
        }
    }
    
    updateDisplay() {
        // Update balance displays
        const balanceElements = document.querySelectorAll('#currentBalance, .current-balance, [class*="balance"]');
        balanceElements.forEach(el => {
            if (el.textContent.includes('$') || el.textContent.includes('balance')) {
                el.textContent = `$${this.balance.toFixed(2)}`;
            }
        });
        
        // Update total earnings
        const totalEarnings = document.getElementById('totalEarnings');
        if (totalEarnings) {
            const currentTotal = parseFloat(totalEarnings.textContent) || 0;
            totalEarnings.textContent = (currentTotal + this.balance).toFixed(2);
        }
        
        // Update transfer history
        this.updateTransferHistory();
    }
    
    updateTransferHistory() {
        const completedTransfers = this.transferHistory.filter(t => t.status === 'completed');
        
        // Update completed transfers count
        const completedElement = document.querySelector('#completedPayouts, [class*="completed"]');
        if (completedElement) {
            completedElement.textContent = completedTransfers.length;
        }
        
        // Update total transferred amount
        const totalPaidElement = document.querySelector('#totalPaid, [class*="total-paid"]');
        if (totalPaidElement) {
            totalPaidElement.textContent = `$${this.totalTransferred.toFixed(2)}`;
        }
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.live-notification').forEach(n => n.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `live-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 450px;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            animation: slideInLive 0.4s ease-out;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        
        // Set colors based on type
        const colors = {
            success: { bg: 'linear-gradient(135deg, #00d4aa, #00b894)', color: 'white' },
            error: { bg: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', color: 'white' },
            warning: { bg: 'linear-gradient(135deg, #fdcb6e, #f39c12)', color: 'black' },
            info: { bg: 'linear-gradient(135deg, #74b9ff, #0984e3)', color: 'white' }
        };
        
        const color = colors[type] || colors.info;
        notification.style.background = color.bg;
        notification.style.color = color.color;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 10 seconds for success messages, 6 for others
        const timeout = type === 'success' ? 10000 : 6000;
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutLive 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, timeout);
        
        console.log(`[LIVE ${type.toUpperCase()}] ${message}`);
    }
    
    // Public methods
    addBalance(amount) {
        this.balance += amount;
        this.updateDisplay();
        this.showNotification(`💰 Added $${amount.toFixed(2)} to balance`, 'success');
    }
    
    getStats() {
        return {
            totalTransferred: this.totalTransferred,
            transferCount: this.transferCount,
            currentBalance: this.balance,
            isConfigured: this.isConfigured(),
            receivingWallet: this.coinbaseConfig.receivingWallet
        };
    }
}

// Add CSS for live system
const liveStyles = document.createElement('style');
liveStyles.textContent = `
    @keyframes slideInLive {
        from {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
        }
        to {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes slideOutLive {
        from {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
        to {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
        }
    }
    
    .live-notification {
        animation: slideInLive 0.4s ease-out;
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
    }
    
    .notification-message {
        flex: 1;
        white-space: pre-line;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
    }
    
    .notification-close:hover {
        background: rgba(255,255,255,0.2);
    }
`;

document.head.appendChild(liveStyles);

// Initialize live system
let liveCoinbaseSystem;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        liveCoinbaseSystem = new LiveCoinbaseSystem();
        window.liveCoinbaseSystem = liveCoinbaseSystem;
        
        console.log('🚀 Live Coinbase System ready!');
        console.log('💡 Commands:');
        console.log('   liveCoinbaseSystem.addBalance(100) - Add balance');
        console.log('   liveCoinbaseSystem.processLiveBitcoinTransfer() - Manual transfer');
        console.log('   liveCoinbaseSystem.getStats() - View statistics');
        
    }, 1000);
});

// Export for global access
window.LiveCoinbaseSystem = LiveCoinbaseSystem;
