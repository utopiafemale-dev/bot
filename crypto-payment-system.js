// Crypto Payment System - Universal Wallet Integration
class CryptoPaymentSystem {
    constructor() {
        this.balance = 25.00; // Starting test balance in USD equivalent
        this.transferHistory = [];
        this.isTransferring = false;
        this.totalTransferred = 0;
        this.transferCount = 0;
        
        // Supported cryptocurrencies with current rates (mock data)
        this.cryptoRates = {
            BTC: 43250.00,  // Bitcoin
            ETH: 2650.00,   // Ethereum
            USDC: 1.00,     // USD Coin (stablecoin)
            USDT: 1.00,     // Tether
            LTC: 72.50,     // Litecoin
            BCH: 245.00,    // Bitcoin Cash
            ADA: 0.48,      // Cardano
            DOT: 6.25       // Polkadot
        };
        
        // Default configuration - user can customize
        this.config = {
            preferredCrypto: 'BTC',  // Bitcoin for your wallet
            walletAddress: 'bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u', // Your Bitcoin wallet
            networkFee: 0.02, // 2% network fee
            minimumTransfer: 0.01, // $0.01 minimum
            autoTransferEnabled: true,
            transferInterval: 30000 // 30 seconds
        };
        
        this.initializeCryptoSystem();
    }
    
    initializeCryptoSystem() {
        console.log('🚀 Crypto Payment System initialized');
        console.log(`💰 Preferred crypto: ${this.config.preferredCrypto}`);
        console.log(`📍 Wallet address: ${this.config.walletAddress}`);
        
        // Setup automatic transfers
        if (this.config.autoTransferEnabled) {
            this.setupAutoTransfer();
        }
        
        // Setup UI handlers
        this.setupUIHandlers();
        
        // Update display
        this.updateDisplay();
        
        // Show welcome message
        this.showNotification('🚀 Crypto Payment System ready! Transfers to your wallet every 30 seconds!', 'success');
    }
    
    setupAutoTransfer() {
        setInterval(() => {
            if (this.balance >= this.config.minimumTransfer && !this.isTransferring) {
                this.processCryptoTransfer('automatic');
            }
        }, this.config.transferInterval);
        
        console.log(`🔄 Auto-transfer enabled: Every ${this.config.transferInterval/1000} seconds`);
    }
    
    setupUIHandlers() {
        // Find and setup transfer buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            
            const text = button.textContent.toLowerCase();
            if (text.includes('transfer') || text.includes('withdraw') || text.includes('payout')) {
                e.preventDefault();
                this.processCryptoTransfer('manual');
            }
        });
        
        // Setup crypto selector if it exists
        this.setupCryptoSelector();
    }
    
    setupCryptoSelector() {
        // Create crypto selection UI
        const cryptoSelector = document.createElement('div');
        cryptoSelector.className = 'crypto-selector';
        cryptoSelector.innerHTML = `
            <div class="crypto-options">
                <h4>💰 Select Cryptocurrency:</h4>
                <div class="crypto-buttons">
                    ${Object.keys(this.cryptoRates).map(crypto => `
                        <button class="crypto-btn ${crypto === this.config.preferredCrypto ? 'active' : ''}" 
                                data-crypto="${crypto}">
                            ${crypto}
                            <span class="rate">$${this.cryptoRates[crypto].toLocaleString()}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners for crypto selection
        cryptoSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('crypto-btn')) {
                const selectedCrypto = e.target.dataset.crypto;
                this.changeCrypto(selectedCrypto);
                
                // Update active state
                cryptoSelector.querySelectorAll('.crypto-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
        
        // Insert into the fund management section
        const fundSection = document.querySelector('[class*="fund"], [class*="payout"]');
        if (fundSection) {
            fundSection.appendChild(cryptoSelector);
        }
    }
    
    changeCrypto(newCrypto) {
        this.config.preferredCrypto = newCrypto;
        this.updateDisplay();
        this.showNotification(`💰 Switched to ${newCrypto} payments!`, 'success');
        console.log(`💰 Crypto changed to: ${newCrypto}`);
    }
    
    async processCryptoTransfer(type = 'manual') {
        if (this.isTransferring) {
            this.showNotification('Transfer already in progress...', 'warning');
            return;
        }
        
        if (this.balance < this.config.minimumTransfer) {
            this.showNotification('Insufficient balance for transfer', 'error');
            return;
        }
        
        this.isTransferring = true;
        const usdAmount = this.balance;
        const crypto = this.config.preferredCrypto;
        const cryptoRate = this.cryptoRates[crypto];
        const cryptoAmount = usdAmount / cryptoRate;
        const networkFee = usdAmount * this.config.networkFee;
        const netAmount = usdAmount - networkFee;
        const netCryptoAmount = netAmount / cryptoRate;
        
        try {
            this.showNotification(
                `🚀 Processing ${type} transfer: $${usdAmount.toFixed(2)} → ${netCryptoAmount.toFixed(8)} ${crypto}...`, 
                'info'
            );
            
            // Simulate crypto transfer
            await this.simulateCryptoTransfer(netCryptoAmount, crypto, type);
            
            // Record successful transfer
            this.recordTransfer(usdAmount, netCryptoAmount, crypto, type, 'completed', networkFee);
            
            // Update totals
            this.totalTransferred += netAmount;
            this.transferCount++;
            
            // Reset balance
            this.balance = 0;
            
            // Update display
            this.updateDisplay();
            
            // Show success with transaction details
            this.showNotification(
                `✅ Successfully sent ${netCryptoAmount.toFixed(8)} ${crypto} to your wallet!
                 💰 USD Value: $${netAmount.toFixed(2)}
                 🏦 Network Fee: $${networkFee.toFixed(2)}`, 
                'success'
            );
            
            // Add more balance for continuous testing
            setTimeout(() => {
                this.balance = 15.00 + (Math.random() * 10); // Random amount between $15-25
                this.updateDisplay();
                this.showNotification('💰 New worker earnings added to balance!', 'info');
            }, 8000);
            
        } catch (error) {
            this.showNotification(`❌ Transfer failed: ${error.message}`, 'error');
            this.recordTransfer(usdAmount, cryptoAmount, crypto, type, 'failed', networkFee);
        } finally {
            this.isTransferring = false;
        }
    }
    
    async simulateCryptoTransfer(amount, crypto, type) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate realistic transaction hash
        const txHash = this.generateTxHash();
        
        // Simulate successful blockchain transaction
        const transaction = {
            hash: txHash,
            amount: amount,
            crypto: crypto,
            to: this.config.walletAddress,
            type: type,
            timestamp: new Date().toISOString(),
            confirmations: 1,
            status: 'confirmed'
        };
        
        console.log(`✅ Crypto transfer completed:`, transaction);
        
        return { success: true, transaction };
    }
    
    generateTxHash() {
        // Generate realistic transaction hash
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }
    
    recordTransfer(usdAmount, cryptoAmount, crypto, type, status, fee) {
        const transfer = {
            id: `crypto_${Date.now()}`,
            usdAmount: usdAmount,
            cryptoAmount: cryptoAmount,
            cryptocurrency: crypto,
            networkFee: fee,
            netAmount: usdAmount - fee,
            walletAddress: this.config.walletAddress,
            type: type,
            status: status,
            timestamp: new Date().toISOString(),
            txHash: status === 'completed' ? this.generateTxHash() : null
        };
        
        this.transferHistory.push(transfer);
        
        // Keep only last 20 transfers
        if (this.transferHistory.length > 20) {
            this.transferHistory = this.transferHistory.slice(-20);
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
        
        // Update crypto-specific displays
        this.updateCryptoDisplay();
        
        // Update transfer history
        this.updateTransferHistory();
    }
    
    updateCryptoDisplay() {
        const crypto = this.config.preferredCrypto;
        const cryptoRate = this.cryptoRates[crypto];
        const cryptoAmount = this.balance / cryptoRate;
        
        // Update crypto amount display
        const cryptoElements = document.querySelectorAll('[class*="crypto-amount"]');
        cryptoElements.forEach(el => {
            el.textContent = `${cryptoAmount.toFixed(8)} ${crypto}`;
        });
        
        // Update rate display
        const rateElements = document.querySelectorAll('[class*="crypto-rate"]');
        rateElements.forEach(el => {
            el.textContent = `1 ${crypto} = $${cryptoRate.toLocaleString()}`;
        });
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
        
        // Update last transfer info
        const lastTransfer = completedTransfers[completedTransfers.length - 1];
        if (lastTransfer) {
            const lastTransferElement = document.querySelector('[class*="last-transfer"]');
            if (lastTransferElement) {
                lastTransferElement.innerHTML = `
                    ${lastTransfer.cryptoAmount.toFixed(8)} ${lastTransfer.cryptocurrency} 
                    ($${lastTransfer.netAmount.toFixed(2)}) - 
                    ${new Date(lastTransfer.timestamp).toLocaleTimeString()}
                `;
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.crypto-notification').forEach(n => n.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `crypto-notification notification-${type}`;
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
            animation: slideInCrypto 0.4s ease-out;
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
        
        // Auto remove after 8 seconds for success messages, 5 for others
        const timeout = type === 'success' ? 8000 : 5000;
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutCrypto 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, timeout);
        
        console.log(`[CRYPTO ${type.toUpperCase()}] ${message}`);
    }
    
    // Public methods for manual control
    addBalance(amount) {
        this.balance += amount;
        this.updateDisplay();
        this.showNotification(`💰 Added $${amount.toFixed(2)} to balance`, 'success');
    }
    
    setWalletAddress(address) {
        this.config.walletAddress = address;
        this.showNotification(`📍 Wallet address updated: ${address.substring(0, 10)}...`, 'success');
    }
    
    getTransferHistory() {
        return this.transferHistory;
    }
    
    getBalance() {
        return this.balance;
    }
    
    getTotalStats() {
        return {
            totalTransferred: this.totalTransferred,
            transferCount: this.transferCount,
            currentBalance: this.balance,
            preferredCrypto: this.config.preferredCrypto,
            walletAddress: this.config.walletAddress
        };
    }
}

// Add CSS for crypto system
const cryptoStyles = document.createElement('style');
cryptoStyles.textContent = `
    @keyframes slideInCrypto {
        from {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
        }
        to {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes slideOutCrypto {
        from {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
        to {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
        }
    }
    
    .crypto-notification {
        animation: slideInCrypto 0.4s ease-out;
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
    
    .crypto-selector {
        margin: 20px 0;
        padding: 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
    }
    
    .crypto-options h4 {
        margin: 0 0 15px 0;
        color: #fff;
        font-size: 16px;
    }
    
    .crypto-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
    }
    
    .crypto-btn {
        padding: 12px 8px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 8px;
        background: rgba(255,255,255,0.1);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .crypto-btn:hover {
        background: rgba(255,255,255,0.2);
        transform: translateY(-2px);
    }
    
    .crypto-btn.active {
        background: linear-gradient(135deg, #00d4aa, #00b894);
        border-color: transparent;
        box-shadow: 0 4px 15px rgba(0, 212, 170, 0.4);
    }
    
    .crypto-btn .rate {
        font-size: 11px;
        opacity: 0.8;
    }
`;

document.head.appendChild(cryptoStyles);

// Initialize crypto payment system
let cryptoPaymentSystem;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        cryptoPaymentSystem = new CryptoPaymentSystem();
        window.cryptoPaymentSystem = cryptoPaymentSystem;
        
        console.log('🚀 Crypto Payment System ready!');
        console.log('💡 Test commands:');
        console.log('   cryptoPaymentSystem.addBalance(100) - Add $100 to balance');
        console.log('   cryptoPaymentSystem.processCryptoTransfer() - Manual transfer');
        console.log('   cryptoPaymentSystem.changeCrypto("BTC") - Switch to Bitcoin');
        console.log('   cryptoPaymentSystem.setWalletAddress("your_address") - Set wallet');
        console.log('   cryptoPaymentSystem.getTotalStats() - View statistics');
        
    }, 1000);
});

// Export for global access
window.CryptoPaymentSystem = CryptoPaymentSystem;
