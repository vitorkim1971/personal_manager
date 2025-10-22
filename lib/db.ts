import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'personal-manager.db');
const db = new Database(dbPath);

// 데이터베이스 초기화
export function initDB() {
  // Tasks 테이블 (PRD 7.2.1)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATETIME,
      priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
      category TEXT NOT NULL,
      status TEXT CHECK(status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
      project_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  // Tasks 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
  `);

  // Transactions 테이블 (PRD 7.2.2)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      category TEXT NOT NULL,
      date DATE NOT NULL,
      memo TEXT,
      payment_method TEXT,
      project_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  // Transactions 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
    CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
  `);

  // Projects 테이블 (PRD 7.2.3)
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      status TEXT CHECK(status IN ('planning', 'in_progress', 'completed', 'on_hold')) DEFAULT 'planning',
      target_revenue DECIMAL(15, 2),
      progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Projects 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
  `);

  // Budgets 테이블 (PRD 7.2.5)
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
      year INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, month, year)
    )
  `);

  // Budgets 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);
  `);

  // Files 테이블 (PRD 7.2.4)
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT,
      category TEXT,
      task_id INTEGER,
      project_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Files 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
    CREATE INDEX IF NOT EXISTS idx_files_task_id ON files(task_id);
    CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
  `);

  // Settings 테이블 (PRD 7.2.7)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Company Accounts 테이블 (회사 계좌 관리)
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_name TEXT NOT NULL,
      account_number TEXT,
      bank_name TEXT,
      account_type TEXT CHECK(account_type IN ('checking', 'savings', 'investment', 'crypto', 'other')) DEFAULT 'checking',
      currency TEXT DEFAULT 'USD',
      balance DECIMAL(15, 2) DEFAULT 0,
      description TEXT,
      exchange_name TEXT,
      wallet_address TEXT,
      network TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Company Transactions 테이블 (회사 거래 내역)
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense', 'transfer')) NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      category TEXT NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      payment_method TEXT,
      reference_number TEXT,
      project_id INTEGER,
      vendor_customer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES company_accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  // Company Transactions 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_company_transactions_date ON company_transactions(date);
    CREATE INDEX IF NOT EXISTS idx_company_transactions_type ON company_transactions(type);
    CREATE INDEX IF NOT EXISTS idx_company_transactions_category ON company_transactions(category);
    CREATE INDEX IF NOT EXISTS idx_company_transactions_account_id ON company_transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_company_transactions_project_id ON company_transactions(project_id);
  `);

  console.log('Database initialized successfully');
}

// 데이터베이스 인스턴스 초기화
initDB();

export default db;

