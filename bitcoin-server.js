const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Your Coinbase API credentials
const API_KEY = 'f431e433-6d11-4d47-b9f1-49c72608dd83';
const API_SECRET = 'o9kS3BWPR8Lt2xivels3NlYnsY+HtGup1yrOr8e+EJAbBdE5Bb4OBCBAxRn50FebYH6zfDqr1nl6HIY6vg3WIw==';
const BITCOIN_WALLET = 'bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u';

// Function to make authenticated Coinbase API requests
function makeApiRequest(method, path, body = '') {
    return new Promise((resolve, reject) => {
        const timestamp = Math.floor(Date.now() / 1000);
        const message = timestamp + method + path + body;
        const signature = crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');
        
        const options = {
            hostname: 'api.coinbase.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'CB-ACCESS-KEY': API_KEY,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': timestamp,
                'CB-VERSION': '2021-06-25',
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

// Test API connection
app.get('/api/test-connection', async (req, res) => {
    try {
        console.log('🔍 Testing Coinbase API connection...');
        const response = await makeApiRequest('GET', '/v2/user');
        
        if (response.data) {
            res.json({
                success: true,
                message: 'Coinbase API connected successfully!',
                user: response.data
            });
        } else {
            res.json({
                success: false,
                message: 'API connection failed',
                error: response
            });
        }
    } catch (error) {
        console.error('API Test Error:', error);
        res.json({
            success: false,
            message: 'Connection error',
            error: error.message
        });
    }
});

// Get Bitcoin accounts
app.get('/api/accounts', async (req, res) => {
    try {
        console.log('📊 Fetching Bitcoin accounts...');
        const response = await makeApiRequest('GET', '/v2/accounts');
        
        if (response.data) {
            // Find Bitcoin account
            const btcAccount = response.data.find(account => 
                account.currency && account.currency.code === 'BTC'
            );
            
            res.json({
                success: true,
                accounts: response.data,
                btcAccount: btcAccount
            });
        } else {
            res.json({
                success: false,
                message: 'Failed to fetch accounts',
                error: response
            });
        }
    } catch (error) {
        console.error('Accounts Error:', error);
        res.json({
            success: false,
            message: 'Error fetching accounts',
            error: error.message
        });
    }
});

// Send Bitcoin to your wallet
app.post('/api/send-bitcoin', async (req, res) => {
    try {
        const { amount } = req.body;
        console.log(`💰 Attempting to send ${amount} BTC to ${BITCOIN_WALLET}...`);
        
        // First, get Bitcoin account
        const accountsResponse = await makeApiRequest('GET', '/v2/accounts');
        const btcAccount = accountsResponse.data?.find(account => 
            account.currency && account.currency.code === 'BTC'
        );
        
        if (!btcAccount) {
            return res.json({
                success: false,
                message: 'No Bitcoin account found'
            });
        }
        
        // Create transaction
        const transactionData = {
            type: 'send',
            to: BITCOIN_WALLET,
            amount: amount.toString(),
            currency: 'BTC',
            description: 'AI Worker Manager Payout'
        };
        
        const response = await makeApiRequest(
            'POST', 
            `/v2/accounts/${btcAccount.id}/transactions`,
            JSON.stringify(transactionData)
        );
        
        if (response.data) {
            console.log('✅ Bitcoin sent successfully!');
            res.json({
                success: true,
                message: `Successfully sent ${amount} BTC to ${BITCOIN_WALLET}`,
                transaction: response.data
            });
        } else {
            console.log('❌ Bitcoin send failed:', response);
            res.json({
                success: false,
                message: 'Failed to send Bitcoin',
                error: response
            });
        }
        
    } catch (error) {
        console.error('Send Bitcoin Error:', error);
        res.json({
            success: false,
            message: 'Error sending Bitcoin',
            error: error.message
        });
    }
});

// Get current Bitcoin price
app.get('/api/bitcoin-price', async (req, res) => {
    try {
        const response = await makeApiRequest('GET', '/v2/exchange-rates?currency=BTC');
        
        if (response.data) {
            const usdRate = response.data.rates.USD;
            res.json({
                success: true,
                price: parseFloat(usdRate),
                currency: 'USD'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed to fetch Bitcoin price'
            });
        }
    } catch (error) {
        res.json({
            success: false,
            message: 'Error fetching Bitcoin price',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Bitcoin Server running on http://localhost:${PORT}`);
    console.log(`💰 Bitcoin Wallet: ${BITCOIN_WALLET}`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`✅ Ready to send real Bitcoin payments!`);
});
