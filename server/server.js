const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'super-secret-key-for-alpenstark';

// Multer Config for Verification Documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const utf8Name = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, Date.now() + '-' + utf8Name);
  }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Email Transporter (Configure with your real SMTP data)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER || 'alexandra.wiegand@ethereal.email',
    pass: process.env.EMAIL_PASS || 'yaKggFagFZYfehZuDA'
  }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'ERR_AUTH_UNAUTHORIZED' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'ERR_AUTH_INVALID_TOKEN' });
    req.user = user;
    next();
  });
};

// Admin Middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'ERR_AUTH_FORBIDDEN' });
  }
};

// Helper: Generate random account number
const generateAccountNumber = () => {
  return 'TBA' + Math.floor(10000000 + Math.random() * 90000000);
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, dob, address, city, state, zip, country } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'ERR_AUTH_MISSING_FIELDS' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const role = email === 'admin@alpenstark.com' ? 'admin' : 'user';

  db.run(
    `INSERT INTO users (name, email, password, phone, dob, address, city, state, zip, country, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, phone, dob, address, city, state, zip, country, role],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ message: 'ERR_AUTH_EMAIL_EXISTS' });
        }
        return res.status(500).json({ message: 'ERR_AUTH_REGISTER_FAILED' });
      }

      const userId = this.lastID;

      // Create default fiat account for new user
      const accNumber = generateAccountNumber();
      db.run(`INSERT INTO accounts (user_id, account_number, type, currency, balance) VALUES (?, ?, ?, ?, ?)`,
        [userId, accNumber, 'fiat', 'USD', 0.0], (err2) => {
          if (err2) console.error('Error creating default account', err2);
        });

      const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user: { id: userId, name, email, role } });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    if (!user) return res.status(400).json({ message: 'ERR_AUTH_INVALID_CREDENTIALS' });

    if (user.is_blocked) {
      return res.status(403).json({
        message: 'ERR_USER_BLOCKED',
        reason: user.blocked_reason
      });
    }


    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'ERR_AUTH_INVALID_CREDENTIALS' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });
});

app.post('/api/auth/send-verification', authenticateToken, (req, res) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  db.run(`UPDATE users SET email_verification_code = ? WHERE id = ?`, [code, req.user.id], async (err) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });

    console.log(`[TEST] Verification code for ${req.user.email}: ${code}`);

    try {
      await transporter.sendMail({
        from: '"AlpenStark Bank" <noreply@alpenstark.com>',
        to: req.user.email,
        subject: "Email Verification Code",
        text: `Your verification code is: ${code}`,
        html: `<b>Your verification code is: ${code}</b>`
      });
      res.json({ message: 'MSG_VERIFICATION_SENT' });
    } catch (mailErr) {
      console.error('Mail error:', mailErr);
      // For development, we still return the code in a real app you wouldn't do this
      // but if the user hasn't configured SMTP, they can't proceed.
      // I'll return success but log the error.
      res.status(500).json({ message: 'ERR_MAIL_SEND_FAILED' });
    }
  });
});

app.post('/api/auth/verify-email', authenticateToken, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'ERR_CODE_REQUIRED' });

  db.get(`SELECT email_verification_code FROM users WHERE id = ?`, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    if (!row || row.email_verification_code !== code) {
      return res.status(400).json({ message: 'ERR_INVALID_CODE' });
    }

    db.run(`UPDATE users SET is_email_verified = 1, email_verification_code = NULL WHERE id = ?`, [req.user.id], (err2) => {
      if (err2) return res.status(500).json({ message: 'ERR_DB_ERROR' });
      res.json({ message: 'MSG_EMAIL_VERIFIED' });
    });
  });
});

// --- PROTECTED API ROUTES ---

// Get user profile
app.get('/api/user', authenticateToken, (req, res) => {
  db.get(`SELECT id, name, email, phone, dob, address, city, state, zip, country, verified, is_email_verified, role, verification_status, verification_document, verification_document_type, bank_statement_document FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    if (!user) return res.status(404).json({ message: 'ERR_USER_NOT_FOUND' });
    res.json(user);
  });
});

// Update user profile
app.put('/api/user', authenticateToken, (req, res) => {
  const { name, phone, dob, address, city, state, zip, country } = req.body;

  db.run(`UPDATE users SET name=?, phone=?, dob=?, address=?, city=?, state=?, zip=?, country=? WHERE id=?`,
    [name, phone, dob, address, city, state, zip, country, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ message: 'ERR_PROFILE_UPDATE_FAILED' });
      res.json({ message: 'MSG_PROFILE_UPDATED' });
    }
  );
});

// Verification upload
app.post('/api/user/verify', authenticateToken, upload.array('document', 5), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'ERR_NO_FILES' });
  const documentType = req.body.documentType || 'passport';
  const newFiles = req.files.map(f => f.path).join(',');

  db.get(`SELECT verification_document FROM users WHERE id = ?`, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });

    const combinedPaths = row.verification_document ? `${row.verification_document},${newFiles}` : newFiles;

    db.run(`UPDATE users SET verification_document = ?, verification_document_type = ?, verification_status = 'pending' WHERE id = ?`,
      [combinedPaths, documentType, req.user.id], function(err2) {
        if (err2) return res.status(500).json({ message: 'ERR_DB_ERROR' });
        res.json({ message: 'MSG_DOCS_UPLOADED', paths: combinedPaths });
      });
  });
});

// Bank statement upload
app.post('/api/user/verify-bank', authenticateToken, upload.array('document', 5), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'ERR_NO_FILES' });
  const newFiles = req.files.map(f => f.path).join(',');

  db.get(`SELECT bank_statement_document FROM users WHERE id = ?`, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });

    const combinedPaths = row.bank_statement_document ? `${row.bank_statement_document},${newFiles}` : newFiles;

    db.run(`UPDATE users SET bank_statement_document = ? WHERE id = ?`,
      [combinedPaths, req.user.id], function(err2) {
        if (err2) return res.status(500).json({ message: 'ERR_DB_ERROR' });
        res.json({ message: 'MSG_DOCS_UPLOADED', paths: combinedPaths });
      });
  });
});

// Update user password
app.put('/api/user/password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'ERR_AUTH_MISSING_FIELDS' });
  }

  db.get(`SELECT password FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    if (!user) return res.status(404).json({ message: 'ERR_USER_NOT_FOUND' });

    const validPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!validPassword) return res.status(400).json({ message: 'ERR_AUTH_INVALID_PASSWORD' });

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

    db.run(`UPDATE users SET password=? WHERE id=?`, [hashedNewPassword, req.user.id], function(err2) {
      if (err2) return res.status(500).json({ message: 'ERR_PASSWORD_UPDATE_FAILED' });
      res.json({ message: 'MSG_PASSWORD_UPDATED' });
    });
  });
});

// Get user accounts
app.get('/api/accounts', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM accounts WHERE user_id = ?`, [req.user.id], (err, accounts) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(accounts);
  });
});

// Create user crypto account
app.post('/api/accounts/crypto', authenticateToken, (req, res) => {
  const { currency, network } = req.body;
  if (!currency) return res.status(400).json({ message: 'ERR_CURRENCY_REQUIRED' });

  // Check if wallet already exists
  db.get(`SELECT id FROM accounts WHERE user_id = ? AND currency = ? AND type = 'crypto'`, [req.user.id, currency], (err, account) => {
    if (account) return res.status(400).json({ message: 'ERR_WALLET_EXISTS' });

    const networkSuffix = network ? ` (${network})` : '';
    const accNumber = currency + networkSuffix + '-' + generateAccountNumber().substring(3);
    db.run(`INSERT INTO accounts (user_id, account_number, type, currency, balance) VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, accNumber, 'crypto', currency, 0.0], function(err2) {
        if (err2) return res.status(500).json({ message: 'ERR_WALLET_CREATE_FAILED' });
        const accountId = this.lastID;
        const date = new Date().toISOString();
        db.run(`INSERT INTO transactions (user_id, account_id, type, amount, currency, status, date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.user.id, accountId, 'account_opening', 0, currency, 'completed', date, `MSG_ACCOUNT_OPENED|{"currency":"${currency}"}`], (err3) => {
            res.json({ message: 'MSG_WALLET_CREATED', id: accountId });
          });
      });
  });
});

// Get transactions
app.get('/api/transactions', authenticateToken, (req, res) => {
  // Query param type=fiat|crypto
  const type = req.query.type;

  let query = `
    SELECT t.*, a.account_number
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE t.user_id = ?
  `;
  const params = [req.user.id];

  if (type) {
    query += ` AND a.type = ?`;
    params.push(type);
  }

  query += ` ORDER BY t.id DESC`;

  db.all(query, params, (err, transactions) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(transactions);
  });
});

// Saved Banks APIs
app.get('/api/banks', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM saved_banks WHERE user_id = ?`, [req.user.id], (err, banks) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(banks);
  });
});

app.get('/api/invoices', authenticateToken, (req, res) => {
  db.all('SELECT * FROM invoices WHERE user_id = ? ORDER BY id DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(rows);
  });
});

app.post('/api/banks', authenticateToken, (req, res) => {
  const { type, bank_name, swift, account_number } = req.body;
  if (!bank_name || !account_number) return res.status(400).json({ message: 'ERR_MISSING_FIELDS' });

  db.run(`INSERT INTO saved_banks (user_id, type, bank_name, swift, account_number) VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, type, bank_name, swift, account_number], function(err) {
      if (err) return res.status(500).json({ message: 'ERR_BANK_SAVE_FAILED' });
      res.json({ message: 'MSG_BANK_SAVED', id: this.lastID });
    });
});

// Create deposit/top-up - ONLY CREATES PENDING TRANSACTION NOW
app.post('/api/topup', authenticateToken, (req, res) => {
  const { account_id, amount, currency, method } = req.body;
  const parsedAmount = parseFloat(amount);

  if (!account_id || !parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ message: 'ERR_INVALID_DATA' });
  }

  const date = new Date().toISOString();
  let methodPretty = 'MSG_METHOD_CARD';
  if (method === 'crypto_transfer') methodPretty = 'MSG_METHOD_CRYPTO';
  else if (method === 'bank') methodPretty = 'MSG_METHOD_BANK';
  else if (method === 'cash') methodPretty = 'MSG_METHOD_CASH';

  db.run(`INSERT INTO transactions (user_id, account_id, type, amount, currency, status, date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, account_id, 'deposit', parsedAmount, currency, 'processing', date, `MSG_DEPOSIT_VIA|{"method":"${methodPretty}"}`], function(err2) {
      if (err2) return res.status(500).json({ message: 'ERR_TRANSACTION_FAILED' });
      res.json({ message: 'MSG_TOPUP_SUBMITTED' });
    });
});

// Create transfer (Bank or Crypto) - DEDUCTS BALANCE IMMEDIATELY
app.post('/api/transfer', authenticateToken, (req, res) => {
  const { account_id, amount, beneficiary, description, comment } = req.body;
  const parsedAmount = parseFloat(amount);

  if (!account_id || !parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ message: 'ERR_INVALID_DATA' });
  }

  db.get(`SELECT balance, currency FROM accounts WHERE id = ? AND user_id = ?`, [account_id, req.user.id], (err, account) => {
    if (err || !account) return res.status(404).json({ message: 'ERR_ACCOUNT_NOT_FOUND' });
    if (account.balance < parsedAmount) return res.status(400).json({ message: 'ERR_INSUFFICIENT_BALANCE' });

    const date = new Date().toISOString();

    // Deduct balance immediately
    db.run(`UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?`, [parsedAmount, account_id, parsedAmount], function(err2) {
      if (this.changes === 0) return res.status(400).json({ message: 'ERR_INSUFFICIENT_BALANCE' });
      if (err2) return res.status(500).json({ message: 'ERR_BALANCE_UPDATE_FAILED' });

      const descriptionToSave = `MSG_TRANSFER_TO|${JSON.stringify({ beneficiary, desc: description || '' })}`;
      db.run(`INSERT INTO transactions (user_id, account_id, type, amount, currency, status, date, description, recipient_address, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, account_id, 'transfer', -parsedAmount, account.currency, 'processing', date, descriptionToSave, beneficiary, comment], function(err3) {
          if (err3) {
            // Rollback balance if transaction logging fails
            db.run(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [parsedAmount, account_id]);
            return res.status(500).json({ message: 'ERR_TRANSACTION_FAILED' });
          }
          res.json({ message: 'MSG_TRANSFER_SUBMITTED' });
        });
    });
  });
});

// Exchange currency
app.post('/api/exchange', authenticateToken, (req, res) => {
  const { from_account_id, to_currency, sell_amount, rate } = req.body;
  const parsedAmount = parseFloat(sell_amount);

  if (!from_account_id || !parsedAmount || parsedAmount <= 0 || !rate) {
    return res.status(400).json({ message: 'ERR_INVALID_DATA' });
  }

  db.get(`SELECT balance, currency FROM accounts WHERE id = ? AND user_id = ?`, [from_account_id, req.user.id], (err, account) => {
    if (err || !account) return res.status(404).json({ message: 'ERR_ACCOUNT_NOT_FOUND' });
    if (account.balance < parsedAmount) return res.status(400).json({ message: 'ERR_INSUFFICIENT_BALANCE' });

    const buyAmount = parsedAmount * parseFloat(rate);
    const date = new Date().toISOString();

    // Deduct from source
    db.run(`UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?`, [parsedAmount, from_account_id, parsedAmount], function(err2) {
      if (this.changes === 0) return res.status(400).json({ message: 'ERR_INSUFFICIENT_BALANCE' });
      if (err2) return res.status(500).json({ message: 'ERR_EXCHANGE_FAILED' });

      // Log sell transaction
      db.run(`INSERT INTO transactions (user_id, account_id, type, amount, currency, status, date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, from_account_id, 'exchange', -parsedAmount, account.currency, 'completed', date, `MSG_EXCHANGED_TO|{"currency":"${to_currency}"}`]);

      // Add to destination (find or create)
      db.get(`SELECT id FROM accounts WHERE user_id = ? AND currency = ?`, [req.user.id, to_currency], (err3, destAccount) => {
        if (destAccount) {
          db.run(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [buyAmount, destAccount.id]);
          db.run(`INSERT INTO transactions (user_id, account_id, type, amount, currency, status, date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, destAccount.id, 'exchange', buyAmount, to_currency, 'completed', date, `MSG_EXCHANGED_FROM|{"currency":"${account.currency}"}`]);
        } else {
          const newAccNumber = generateAccountNumber();
          const type = ['BTC', 'ETH', 'BNB'].includes(to_currency) ? 'crypto' : 'fiat';
          db.run(`INSERT INTO accounts (user_id, account_number, type, currency, balance) VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, newAccNumber, type, to_currency, buyAmount], function(err4) {
              if (!err4) {
                db.run(`INSERT INTO transactions (user_id, account_id, type, amount, currency, status, date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                  [req.user.id, this.lastID, 'exchange', buyAmount, to_currency, 'completed', date, `MSG_EXCHANGED_FROM|{"currency":"${account.currency}"}`]);
              }
            });
        }
        res.json({ message: 'MSG_EXCHANGE_SUCCESS' });
      });
    });
  });
});

// Helper: Get exchange rates data
const getExchangeRatesData = async () => {
  try {
    // 1. Fetch Crypto from Binance API for real-time crypto data
    const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT"]');
    const binanceData = await binanceRes.json();

    // 2. Fetch Fiat from ExchangeRate-API (USD as base)
    const fiatRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const fiatData = await fiatRes.json();

    const formatCrypto = (symbol, name, icon) => {
      const data = binanceData.find(d => d.symbol === symbol + 'USDT');
      if (!data) return null;
      const price = parseFloat(data.lastPrice);
      const change = parseFloat(data.priceChange);
      const percent = parseFloat(data.priceChangePercent);
      return {
        name,
        symbol,
        icon,
        price: `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
        priceRaw: price,
        change: `USD ${Math.abs(change).toFixed(2)}`,
        changeRaw: Math.abs(change),
        percent: `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`,
        percentRaw: percent,
        isPositive: percent >= 0
      };
    };

    const cryptoRates = [
      formatCrypto('BTC', 'Bitcoin', '/assets/round-btc.webp'),
      formatCrypto('ETH', 'Ethereum', '/assets/round-eth.webp'),
      formatCrypto('BNB', 'Binance', '/assets/BNB.svg'),
      formatCrypto('SOL', 'Solana', '/assets/SOL.svg')
    ].filter(Boolean);

    // Apply a 0.5% markup/markdown for buy/sell
    const markup = 1.005; // 0.5%
    const markdown = 0.995; // 0.5%

    const formatFiat = (base, flag) => {
      const rateToUsd = 1 / (fiatData.rates[base] || 1);
      return {
        pair: `${base}/USD`,
        flag,
        buy: (rateToUsd * markdown).toFixed(4),
        buyRaw: rateToUsd * markdown,
        sell: (rateToUsd * markup).toFixed(4),
        sellRaw: rateToUsd * markup
      };
    };

    const currencyPairs = [
      formatFiat('EUR', '/assets/eu.svg'),
      formatFiat('GBP', '/assets/gb.svg'),
      formatFiat('CHF', '/assets/ch.svg')
    ];

    return { currencyPairs, cryptoRates };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Fallback data
    return {
      currencyPairs: [
        { pair: 'EUR/USD', flag: '/assets/eu.svg', buy: '1.0809', buyRaw: 1.0809, sell: '1.0916', sellRaw: 1.0916 },
        { pair: 'GBP/USD', flag: '/assets/gb.svg', buy: '1.2450', buyRaw: 1.2450, sell: '1.2623', sellRaw: 1.2623 },
        { pair: 'CHF/USD', flag: '/assets/ch.svg', buy: '0.8780', buyRaw: 0.8780, sell: '0.8853', sellRaw: 0.8853 }
      ],
      cryptoRates: [
        { name: 'Bitcoin', symbol: 'BTC', icon: '/assets/round-btc.webp', price: '70,051.10 USD', priceRaw: 70051.10, change: 'USD 801.37', changeRaw: 801.37, percent: '+1.16%', percentRaw: 1.16, isPositive: true },
        { name: 'Ethereum', symbol: 'ETH', icon: '/assets/round-eth.webp', price: '3,034.55 USD', priceRaw: 3034.55, change: 'USD 7.95', changeRaw: 7.95, percent: '+0.39%', percentRaw: 0.39, isPositive: true },
        { name: 'Binance', symbol: 'BNB', icon: '/assets/BNB.svg', price: '643.11 USD', priceRaw: 643.11, change: 'USD 6.19', changeRaw: 6.19, percent: '+0.97%', percentRaw: 0.97, isPositive: true },
        { name: 'Solana', symbol: 'SOL', icon: '/assets/SOL.svg', price: '143.11 USD', priceRaw: 143.11, change: 'USD 4.19', changeRaw: 4.19, percent: '+2.97%', percentRaw: 2.97, isPositive: true }
      ]
    };
  }
};

// Real-time Data for rates
app.get('/api/exchange-rates', authenticateToken, async (req, res) => {
  const data = await getExchangeRatesData();
  res.json(data);
});

// Public rates for landing page
app.get('/api/public/exchange-rates', async (req, res) => {
  const data = await getExchangeRatesData();
  res.json(data);
});


// --- ADMIN API ROUTES ---

app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
  const stats = {};
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    stats.totalUsers = row ? row.count : 0;
    db.get("SELECT COUNT(*) as count FROM transactions WHERE status = 'processing'", (err, row) => {
      stats.pendingTransactions = row ? row.count : 0;
      db.get('SELECT SUM(balance) as sum FROM accounts WHERE type = "fiat"', (err, row) => {
        stats.totalFiat = row ? row.sum : 0;
        res.json(stats);
      });
    });
  });
});

app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
  db.all(`SELECT id, name, email, phone, country, verified, is_email_verified, role, department_id FROM users ORDER BY id DESC`, (err, users) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(users);
  });
});

app.get('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
  const userId = req.params.id;
  db.get(`SELECT id, name, email, phone, dob, address, city, state, zip, country, verified, is_email_verified, role, verification_status, verification_document, verification_document_type, bank_statement_document, department_id FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    if (!user) return res.status(404).json({ message: 'ERR_USER_NOT_FOUND' });

    db.all(`SELECT * FROM accounts WHERE user_id = ?`, [userId], (err2, accounts) => {
      user.accounts = accounts || [];
      res.json(user);
    });
  });
});

app.put('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
  const { name, email, phone, dob, address, city, state, zip, country, verified, is_email_verified, role, verification_status, department_id, is_blocked, blocked_reason } = req.body;
  const userId = req.params.id;

  db.run(`UPDATE users SET name=?, email=?, phone=?, dob=?, address=?, city=?, state=?, zip=?, country=?, verified=?, is_email_verified=?, role=?, verification_status=?, department_id=?, is_blocked=?, blocked_reason=? WHERE id=?`,
    [
      name, email, phone, dob, address, city, state, zip, country,
      verified ? 1 : 0, is_email_verified ? 1 : 0, role, verification_status,
      department_id || 1,
      is_blocked || 0,
      blocked_reason || '',
      userId
    ],
    function(err) {
      if (err) return res.status(500).json({ message: 'ERR_USER_UPDATE_FAILED' });
      res.json({ message: 'MSG_USER_UPDATED' });
    }
  );
});

app.put('/api/admin/users/:id/department', authenticateToken, isAdmin, (req, res) => {
  const { department_id } = req.body;
  const userId = req.params.id;

  if (!department_id) return res.status(400).json({ message: 'ERR_INVALID_DATA' });

  db.run(`UPDATE users SET department_id=? WHERE id=?`, [department_id, userId], function(err) {
    if (err) return res.status(500).json({ message: 'ERR_USER_UPDATE_FAILED' });
    res.json({ message: 'MSG_USER_UPDATED' });
  });
});

app.put('/api/admin/users/:id/password', authenticateToken, isAdmin, (req, res) => {
  const { newPassword } = req.body;
  const userId = req.params.id;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'ERR_INVALID_DATA' });
  }

  const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

  db.run(`UPDATE users SET password=? WHERE id=?`, [hashedNewPassword, userId], function(err) {
    if (err) return res.status(500).json({ message: 'ERR_PASSWORD_UPDATE_FAILED' });
    res.json({ message: 'MSG_PASSWORD_UPDATED' });
  });
});

// --- DEPARTMENTS ADMIN ROUTES ---

app.get('/api/admin/departments', authenticateToken, isAdmin, (req, res) => {
  db.all(`SELECT * FROM departments ORDER BY id ASC`, (err, departments) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(departments);
  });
});

app.post('/api/admin/departments', authenticateToken, isAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'ERR_INVALID_DATA' });

  db.run(`INSERT INTO departments (name) VALUES (?)`, [name], function(err) {
    if (err) return res.status(500).json({ message: 'ERR_DEPARTMENT_CREATE_FAILED' });
    res.json({ message: 'MSG_DEPARTMENT_CREATED', id: this.lastID, name });
  });
});

app.put('/api/admin/departments/:id', authenticateToken, isAdmin, (req, res) => {
  const { name } = req.body;
  const depId = req.params.id;

  if (!name) return res.status(400).json({ message: 'ERR_INVALID_DATA' });

  db.run(`UPDATE departments SET name=? WHERE id=?`, [name, depId], function(err) {
    if (err) return res.status(500).json({ message: 'ERR_DEPARTMENT_UPDATE_FAILED' });
    res.json({ message: 'MSG_DEPARTMENT_UPDATED' });
  });
});

app.delete('/api/admin/departments/:id', authenticateToken, isAdmin, (req, res) => {
  db.run(`DELETE FROM departments WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'ERR_DELETING_DEPARTMENT' });
    // Also move users in this department to default department (or leave them with null)
    db.run(`UPDATE users SET department_id = NULL WHERE department_id = ?`, [req.params.id]);
    res.json({ message: 'MSG_DEPARTMENT_DELETED' });
  });
});

app.post('/api/admin/accounts', authenticateToken, isAdmin, (req, res) => {
  const { user_id, type, currency, balance } = req.body;
  const accNumber = type === 'crypto' ? currency + '-' + generateAccountNumber().substring(3) : generateAccountNumber();

  db.run(`INSERT INTO accounts (user_id, account_number, type, currency, balance) VALUES (?, ?, ?, ?, ?)`,
    [user_id, accNumber, type, currency, parseFloat(balance) || 0], function(err) {
      if (err) return res.status(500).json({ message: 'ERR_ACCOUNT_CREATE_FAILED' });
      res.json({ message: 'MSG_ACCOUNT_CREATED', id: this.lastID });
    });
});

app.put('/api/admin/accounts/:id', authenticateToken, isAdmin, (req, res) => {
  const { balance, wallet_address } = req.body;

  db.run(`UPDATE accounts SET balance=?, wallet_address=? WHERE id=?`,
    [parseFloat(balance), wallet_address || '', req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'ERR_BALANCE_UPDATE_FAILED' });
    res.json({ message: 'MSG_BALANCE_UPDATED' });
  });
});

app.get('/api/admin/transactions', authenticateToken, isAdmin, (req, res) => {
  const status = req.query.status;
  let query = `
    SELECT t.*, a.account_number, u.email as user_email
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN users u ON t.user_id = u.id
  `;
  const params = [];
  if (status) {
    query += ` WHERE t.status = ?`;
    params.push(status);
  }
  query += ` ORDER BY t.id DESC`;

  db.all(query, params, (err, transactions) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(transactions);
  });
});

app.put('/api/admin/transactions/:id', authenticateToken, isAdmin, (req, res) => {
  const { status, fee, recipient_address, sender_address, amount, description, comment } = req.body;
  const txId = req.params.id;

  db.get(`SELECT * FROM transactions WHERE id = ?`, [txId], (err, tx) => {
    if (err || !tx) return res.status(404).json({ message: 'ERR_TRANSACTION_NOT_FOUND' });

    const updatedFee = fee !== undefined ? parseFloat(fee) : tx.fee;
    const updatedAddress = recipient_address !== undefined ? recipient_address : tx.recipient_address;
    const updatedSender = sender_address !== undefined ? sender_address : tx.sender_address;
    const updatedDesc = description !== undefined ? description : tx.description;
    const finalComment = comment !== undefined ? comment : tx.comment;

    // Calculate new amount with correct sign
    let newAmount = tx.amount;
    if (amount !== undefined) {
        newAmount = tx.amount < 0 ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));
    }

    // Calculate current and new total impact on balance
    // For transfers: amount is negative, so total impact is amount - fee (e.g. -100 - 5 = -105)
    // For deposits: amount is positive, total impact is just amount (user gets the amount, fee was paid outside or deducted before)
    // Wait, the user said: "списано 1000, 100 налог, 900 дойдёт до пользователя".
    // In this case: amount = +900, fee = 100. Impact = +900.

    // Calculate current and new total impact on balance
    // For transfers: amount is negative, so total impact is amount - fee (e.g. -100 - 5 = -105)
    // For deposits: amount is positive, total impact is just amount

    const getImpact = (amt, f, type) => {
        const feeVal = parseFloat(f) || 0;
        const amtVal = parseFloat(amt) || 0;
        if (type === 'deposit') return amtVal;
        return amtVal - feeVal;
    };

    const currentImpact = getImpact(tx.amount, tx.fee, tx.type);
    const newImpact = getImpact(newAmount, updatedFee, tx.type);
    const impactDiff = newImpact - currentImpact;

    const performUpdate = () => {
      // Use the calculated updated values
      const finalFee = updatedFee;
      const finalAddress = updatedAddress;
      const finalSender = updatedSender;
      const finalAmount = newAmount;
      const finalDesc = updatedDesc;

      if (status === 'completed') {
        if (tx.type === 'deposit' || tx.type === 'withdraw') {
          db.run(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [finalAmount, tx.account_id], function(err2) {
            if (err2) return res.status(500).json({ message: 'ERR_BALANCE_UPDATE_FAILED' });
            db.run(`UPDATE transactions SET status = 'completed', fee = ?, recipient_address = ?, sender_address = ?, amount = ?, description = ?, comment = ? WHERE id = ?`,
              [finalFee, finalAddress, finalSender, finalAmount, finalDesc, finalComment, txId]);
            res.json({ message: 'MSG_DEPOSIT_APPROVED' });
          });
        } else {
          db.run(`UPDATE transactions SET status = 'completed', fee = ?, recipient_address = ?, sender_address = ?, amount = ?, description = ?, comment = ? WHERE id = ?`,
              [finalFee, finalAddress, finalSender, finalAmount, finalDesc, finalComment, txId], function(err2) {
            if (err2) return res.status(500).json({ message: 'ERR_STATUS_UPDATE_FAILED' });
            res.json({ message: 'MSG_TRANSFER_APPROVED' });
          });
        }
      } else if (status === 'declined') {
        if (tx.type !== 'deposit' && tx.type !== 'withdraw') {
          db.run(`UPDATE accounts SET balance = balance - ? WHERE id = ?`, [currentImpact, tx.account_id], function(err2) {
            if (err2) return res.status(500).json({ message: 'ERR_BALANCE_UPDATE_FAILED' });
            db.run(`UPDATE transactions SET status = 'declined', fee = ?, recipient_address = ?, sender_address = ?, amount = ?, description = ?, comment = ? WHERE id = ?`,
              [finalFee, finalAddress, finalSender, finalAmount, finalDesc, finalComment, txId]);
            res.json({ message: 'MSG_TRANSFER_DECLINED' });
          });
        } else {
          db.run(`UPDATE transactions SET status = 'declined', fee = ?, recipient_address = ?, sender_address = ?, amount = ?, description = ?, comment = ? WHERE id = ?`,
              [finalFee, finalAddress, finalSender, finalAmount, finalDesc, finalComment, txId]);
          res.json({ message: 'MSG_DEPOSIT_DECLINED' });
        }
      } else {
        db.run(`UPDATE transactions SET fee = ?, recipient_address = ?, sender_address = ?, amount = ?, description = ?, comment = ? WHERE id = ?`,
              [finalFee, finalAddress, finalSender, finalAmount, finalDesc, finalComment, txId], function(err2) {
            if (err2) return res.status(500).json({ message: 'ERR_TRANSACTION_UPDATE_FAILED' });
            res.json({ message: 'MSG_TRANSACTION_UPDATED', impactAdjusted: impactDiff !== 0 });
        });
      }
    };

    // If impact changed and transaction is a transfer in processing
    if (impactDiff !== 0 && tx.type !== 'deposit' && tx.status === 'processing') {
        db.run(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [impactDiff, tx.account_id], function(errBalance) {
            if (errBalance) return res.status(500).json({ message: 'ERR_BALANCE_UPDATE_FAILED' });
            performUpdate();
        });
    } else {
        performUpdate();
    }
  });
});

app.post('/api/admin/transactions', authenticateToken, isAdmin, (req, res) => {
  // Create an arbitrary transaction directly via admin
  const { user_id, account_id, type, amount, currency, status, description, comment } = req.body;
  const date = new Date().toISOString();
  const parsedAmount = parseFloat(amount);

  db.run(`INSERT INTO transactions (user_id, account_id, type, amount, currency, status, date, description, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, account_id, type, parsedAmount, currency, status, date, description, comment], function(err) {
      if (err) return res.status(500).json({ message: 'ERR_TRANSACTION_CREATE_FAILED' });

      if (status === 'completed') {
        db.run(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [parsedAmount, account_id], function(err2) {
          if (err2) return res.status(500).json({ message: 'ERR_BALANCE_UPDATE_FAILED' });
          res.json({ message: 'MSG_TRANSACTION_CREATED_BALANCE_UPDATED' });
        });
      } else {
        res.json({ message: 'MSG_TRANSACTION_CREATED' });
      }
    });
});


// --- SETTINGS API ---

app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM settings', (err, rows) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

app.put('/api/admin/settings', authenticateToken, isAdmin, (req, res) => {
  const settings = req.body; // { key: value, ... }
  const keys = Object.keys(settings);

  if (keys.length === 0) return res.status(400).json({ message: 'ERR_NO_SETTINGS' });

  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  db.serialize(() => {
    keys.forEach(key => {
      stmt.run(key, settings[key]);
    });
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ message: 'ERR_SETTINGS_UPDATE_FAILED' });
      res.json({ message: 'MSG_SETTINGS_UPDATED' });
    });
  });
});


// --- MESSAGES API ---

app.get('/api/messages', authenticateToken, (req, res) => {
  db.all('SELECT * FROM messages WHERE user_id = ? ORDER BY id DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(rows);
  });
});

app.post('/api/messages', authenticateToken, upload.single('attachment'), (req, res) => {
  const { subject, content, thread_id } = req.body;
  const date = new Date().toISOString();
  const attachment = req.file ? req.file.path : null;

  db.run('INSERT INTO messages (thread_id, user_id, sender_role, subject, content, date, attachment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [thread_id || null, req.user.id, 'user', subject, content, date, attachment], function(err) {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).json({ message: 'ERR_MESSAGE_SEND_FAILED', error: err.message });
      }
      const msgId = this.lastID;

      // If this is a new message (no thread_id), set thread_id to itself
      if (!thread_id) {
        db.run('UPDATE messages SET thread_id = ? WHERE id = ?', [msgId, msgId]);
      }

      res.status(201).json({ id: msgId, thread_id: thread_id || msgId, user_id: req.user.id, sender_role: 'user', subject, content, date, status: 'unread', attachment });
    });
});

// --- LOAN ROUTES ---

app.post('/api/loans', authenticateToken, upload.array('documents', 5), (req, res) => {
  const { amount, term_years, term_months, occupation, monthly_income } = req.body;
  const filePaths = req.files ? req.files.map(f => f.path).join(',') : '';
  const date = new Date().toISOString();

  db.run(
    `INSERT INTO loans (user_id, amount, term_years, term_months, occupation, monthly_income, documents, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, amount, term_years, term_months, occupation, monthly_income, filePaths, date],
    function(err) {
      if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
      res.json({ message: 'MSG_LOAN_SUBMITTED', id: this.lastID });
    }
  );
});

app.get('/api/loans', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM loans WHERE user_id = ? ORDER BY id DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(rows);
  });
});

app.put('/api/messages/:id/read', authenticateToken, (req, res) => {
  db.run('UPDATE messages SET status = "read" WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ message: 'ERR_MESSAGE_UPDATE_FAILED' });
    res.json({ message: 'MSG_MESSAGE_READ' });
  });
});

// Admin Message Endpoints
app.get('/api/admin/messages', authenticateToken, isAdmin, (req, res) => {
  db.all(`
    SELECT m.*, u.name as user_name, u.email as user_email
    FROM messages m
    JOIN users u ON m.user_id = u.id
    ORDER BY m.id DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(rows);
  });
});

app.get('/api/admin/messages/user/:userId', authenticateToken, isAdmin, (req, res) => {
  db.all('SELECT * FROM messages WHERE user_id = ? ORDER BY id ASC', [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(rows);
  });
});

app.post('/api/admin/messages', authenticateToken, isAdmin, upload.single('attachment'), (req, res) => {
  const { user_id, subject, content, thread_id } = req.body;
  const date = new Date().toISOString();
  const attachment = req.file ? req.file.path : null;

  db.run('INSERT INTO messages (thread_id, user_id, sender_role, subject, content, date, attachment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [thread_id || null, user_id, 'admin', subject, content, date, attachment], function(err) {
      if (err) return res.status(500).json({ message: 'ERR_MESSAGE_SEND_FAILED' });
      const msgId = this.lastID;

      if (!thread_id) {
        db.run('UPDATE messages SET thread_id = ? WHERE id = ?', [msgId, msgId]);
      }

      res.status(201).json({ id: msgId, thread_id: thread_id || msgId, user_id: user_id, sender_role: 'admin', subject, content, date, status: 'unread', attachment });
    });
});

// Admin Loan Endpoints
app.get('/api/admin/loans', authenticateToken, isAdmin, (req, res) => {
  db.all(`
    SELECT l.*, u.name as user_name, u.email as user_email
    FROM loans l
    JOIN users u ON l.user_id = u.id
    ORDER BY l.id DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json(rows);
  });
});

app.put('/api/admin/loans/:id', authenticateToken, isAdmin, (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE loans SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'ERR_DB_ERROR' });
    res.json({ message: 'MSG_LOAN_UPDATED' });
  });
});

// --- BACKUP & RESTORE ---

app.get('/api/admin/backup/export', authenticateToken, isAdmin, (req, res) => {
  const fileName = `database_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`;
  res.download(db.dbPath, fileName);
});

app.post('/api/admin/backup/import', authenticateToken, isAdmin, upload.single('backup'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'ERR_NO_FILE_UPLOADED' });

  // Close DB before replacement
  db.close((err) => {
    if (err) {
      console.error('Error closing DB for import:', err);
      return res.status(500).json({ message: 'ERR_DB_CLOSE_FAILED' });
    }

    try {
      fs.copyFileSync(req.file.path, db.dbPath);
      fs.unlinkSync(req.file.path); // remove temp file

      // Re-open DB
      db.reopen();
      res.json({ message: 'MSG_BACKUP_IMPORTED' });
    } catch (copyErr) {
      console.error('Error replacing DB file:', copyErr);
      db.reopen(); // try to reopen even if copy failed
      res.status(500).json({ message: 'ERR_BACKUP_IMPORT_FAILED' });
    }
  });
});

app.get('/api/admin/notification-counts', authenticateToken, isAdmin, (req, res) => {
  const data = {};
  db.get("SELECT COUNT(*) as count FROM messages WHERE sender_role = 'user' AND status = 'unread'", (err, row) => {
    data.messages = row ? row.count : 0;
    db.get("SELECT COUNT(*) as count FROM transactions WHERE status = 'processing'", (err, row) => {
      data.transactions = row ? row.count : 0;
      db.get("SELECT COUNT(*) as count FROM users WHERE verification_status = 'pending'", (err, row) => {
        data.verifications = row ? row.count : 0;
        res.json(data);
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
