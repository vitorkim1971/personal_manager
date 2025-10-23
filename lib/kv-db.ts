// 간단한 메모리 기반 데이터베이스 (Vercel 호환)
class MemoryDatabase {
  private data: Map<string, any[]> = new Map();

  constructor() {
    // 기본 테이블 초기화
    this.data.set('budgets', []);
    this.data.set('tasks', []);
    this.data.set('transactions', []);
    this.data.set('projects', []);
    this.data.set('files', []);
    this.data.set('settings', []);
    this.data.set('company_accounts', []);
    this.data.set('company_transactions', []);
  }

  prepare(query: string) {
    return {
      run: (...params: any[]) => {
        if (query.includes('INSERT INTO budgets')) {
          const id = Date.now() + Math.floor(Math.random() * 1000);
          const budget = {
            id,
            type: params[0],
            category: params[1],
            budgeted_amount: params[2],
            spent_amount: params[3],
            year: params[4],
            month: params[5],
            description: params[6],
            is_active: params[7],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const budgets = this.data.get('budgets') || [];
          budgets.push(budget);
          this.data.set('budgets', budgets);
          
          return { lastInsertRowid: id };
        }
        throw new Error('Unsupported query');
      },
      
      get: (...params: any[]) => {
        if (query.includes('SELECT * FROM budgets WHERE id = ?')) {
          const budgets = this.data.get('budgets') || [];
          return budgets.find(b => b.id === params[0]);
        }
        throw new Error('Unsupported query');
      },
      
      all: (...params: any[]) => {
        if (query.includes('SELECT * FROM budgets')) {
          return this.data.get('budgets') || [];
        }
        throw new Error('Unsupported query');
      }
    };
  }
}

// 환경에 따라 적절한 데이터베이스 사용
const isVercel = process.env.VERCEL === '1';

let db: any;
if (isVercel) {
  db = new MemoryDatabase();
} else {
  // 로컬 개발 환경에서는 기존 SQLite 사용
  const Database = require('better-sqlite3');
  const path = require('path');
  const dbPath = path.join(process.cwd(), 'personal-manager.db');
  db = new Database(dbPath);
  
  // 기존 초기화 코드 실행
  require('./db');
}

export { db };
