const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');

let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initialize(db);
  }
});

function initialize(database) {
  database.serialize(() => {
    // Таблица пользователей
    database.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT,
      dob TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      country TEXT,
      verified INTEGER DEFAULT 0,
      is_email_verified INTEGER DEFAULT 0,
      email_verification_code TEXT,
      role TEXT DEFAULT 'user',
      verification_document TEXT,
      verification_document_type TEXT,
      bank_statement_document TEXT,
      verification_status TEXT DEFAULT 'not_started',
      department_id INTEGER DEFAULT 1,
      is_blocked INTEGER DEFAULT 0,
      blocked_reason TEXT
    )`);

    // Обновление существующих таблиц пользователей (на случай если колонки не создались)
    database.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {});
    database.run(`ALTER TABLE users ADD COLUMN verification_document TEXT`, (err) => {});
    database.run(`ALTER TABLE users ADD COLUMN verification_document_type TEXT`, (err) => {});
    database.run(`ALTER TABLE users ADD COLUMN bank_statement_document TEXT`, (err) => {});
    database.run(`ALTER TABLE users ADD COLUMN verification_status TEXT DEFAULT 'not_started'`, (err) => {});
    database.run(`ALTER TABLE users ADD COLUMN is_email_verified INTEGER DEFAULT 0`, (err) => {});
    database.run(`ALTER TABLE users ADD COLUMN email_verification_code TEXT`, (err) => {});
    database.run(`ALTER TABLE users ADD COLUMN department_id INTEGER DEFAULT 1`, (err) => {});
    database.run(`ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0`, (err) => {});
    database.run(`ALTER TABLE users ADD COLUMN blocked_reason TEXT`, (err) => {});

    // Таблица счетов (Добавлена колонка wallet_address)
    database.run(`CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      account_number TEXT UNIQUE,
      type TEXT,
      currency TEXT,
      balance REAL DEFAULT 0.0,
      reserved REAL DEFAULT 0.0,
      wallet_address TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // ГЛАВНОЕ ОБНОВЛЕНИЕ: Добавляем колонку wallet_address в существующую таблицу
    database.run(`ALTER TABLE accounts ADD COLUMN wallet_address TEXT`, (err) => {
        if (!err) console.log("Schema update: wallet_address column added to accounts.");
    });

    // Таблица транзакций
    database.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      account_id INTEGER,
      type TEXT,
      amount REAL,
      currency TEXT,
      status TEXT,
      date TEXT,
      description TEXT,
      comment TEXT,
      fee REAL DEFAULT 0.0,
      recipient_address TEXT,
      sender_address TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(account_id) REFERENCES accounts(id)
    )`);

    database.run(`ALTER TABLE transactions ADD COLUMN fee REAL DEFAULT 0.0`, (err) => {});
    database.run(`ALTER TABLE transactions ADD COLUMN recipient_address TEXT`, (err) => {});
    database.run(`ALTER TABLE transactions ADD COLUMN comment TEXT`, (err) => {});
    database.run(`ALTER TABLE transactions ADD COLUMN sender_address TEXT`, (err) => {});

    // Таблица инвойсов
    database.run(`CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      amount REAL,
      currency TEXT,
      status TEXT,
      date TEXT,
      description TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Таблица сохраненных банков
    database.run(`CREATE TABLE IF NOT EXISTS saved_banks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      bank_name TEXT,
      swift TEXT,
      account_number TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Таблица настроек
    database.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

    // Таблица сообщений
    database.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER,
      user_id INTEGER,
      sender_role TEXT,
      subject TEXT,
      content TEXT,
      status TEXT DEFAULT 'unread',
      date TEXT,
      attachment TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    database.run(`ALTER TABLE messages ADD COLUMN attachment TEXT`, (err) => {});

    // Таблица кредитов/займов
    database.run(`CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      amount REAL,
      term_years INTEGER,
      term_months INTEGER,
      occupation TEXT,
      monthly_income TEXT,
      documents TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Таблица отделов
    database.run(`CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    )`, (err) => {
      database.run(`INSERT OR IGNORE INTO departments (id, name) VALUES (1, 'Standard')`);
    });

    // Настройки по умолчанию
    const defaultSettings = [
      ['wallet_btc', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'],
      ['wallet_eth', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'],
      ['wallet_sol', 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH'],
      ['wallet_trc20', 'TV6MuMXfmLbBqPZvBHdwFsGcHowL5Z3hED'],
      ['bank_beneficiary', 'AlpenStark Bank AG'],
      ['bank_iban', 'CH93 0000 0000 0000 0000 0'],
      ['bank_swift', 'ALPENSTARK'],
      ['contact_email', 'support@alpenstark.com'],
      ['contact_address', 'Avenue Industrielle 12, 1227 Carouge GE, Switzerland']
    ];

    defaultSettings.forEach(([key, value]) => {
      database.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
    });
  });
}

module.exports = {
  dbPath,
  get: (...args) => db.get(...args),
  all: (...args) => db.all(...args),
  run: (...args) => db.run(...args),
  serialize: (...args) => db.serialize(...args),
  prepare: (...args) => db.prepare(...args),
  close: (callback) => db.close(callback),
  reopen: () => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Error re-opening database', err.message);
      else console.log('Re-connected to the SQLite database.');
    });
  }
};