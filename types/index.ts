// PRD 7.2 스키마 기반 TypeScript 타입 정의

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'overdue' | 'completed';
export type TaskCategory = '업무' | '개인' | '프로젝트';

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = '계좌' | '카드' | '현금';

// 수입 카테고리
export type IncomeCategory = '급여' | '프리랜서 수입' | '투자 수익' | '기타';

// 지출 카테고리
export type ExpenseCategory = '식비' | '교통비' | '주거비' | '쇼핑' | '의료비' | '교육비' | '기타';

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold';

// Task (작업)
export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string; // ISO 8601 date string
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  project_id?: number;
  reference_links?: string; // 관련 문서 링크들 (JSON 문자열)
  attached_files?: string; // 첨부 파일들 (JSON 문자열)
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  category: TaskCategory;
  status?: TaskStatus;
  project_id?: number;
  reference_links?: string;
  attached_files?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  category?: TaskCategory;
  status?: TaskStatus;
  project_id?: number;
  reference_links?: string;
  attached_files?: string;
}

// Transaction (거래)
export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: string; // ISO 8601 date string
  memo?: string;
  payment_method?: PaymentMethod;
  project_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: string;
  memo?: string;
  payment_method?: PaymentMethod;
  project_id?: number;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  category?: TransactionCategory;
  date?: string;
  memo?: string;
  payment_method?: PaymentMethod;
  project_id?: number;
}

// Project (프로젝트)
export interface Project {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: ProjectStatus;
  target_revenue?: number;
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
  target_revenue?: number;
  progress?: number;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
  target_revenue?: number;
  progress?: number;
}

// Budget (예산)
export type BudgetType = 'personal' | 'company';

export interface Budget {
  id: number;
  type: BudgetType;
  category: ExpenseCategory;
  budgeted_amount: number;
  spent_amount: number;
  month: number; // 1-12
  year: number;
  description?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetInput {
  type?: BudgetType;
  category: ExpenseCategory;
  budgeted_amount: number;
  spent_amount?: number;
  month: number;
  year: number;
  description?: string;
  is_active?: number;
}

export interface UpdateBudgetInput {
  type?: BudgetType;
  category?: ExpenseCategory;
  budgeted_amount?: number;
  spent_amount?: number;
  month?: number;
  year?: number;
  description?: string;
  is_active?: number;
}

// File (파일)
export interface File {
  id: number;
  name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  file_type?: string;
  category?: string;
  task_id?: number;
  project_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFileInput {
  name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  file_type?: string;
  category?: string;
  task_id?: number;
  project_id?: number;
}

// Settings (설정)
export interface Setting {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

// 통계 및 요약 타입
export interface MonthlySummary {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  prevMonthIncome?: number;
  prevMonthExpense?: number;
}

export interface CategorySummary {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  count: number;
}

export interface TodayTaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
}

export interface DashboardStats {
  todayTasks: TodayTaskStats;
  monthlySummary: MonthlySummary;
  activeProjects: number;
  recentTransactions: Transaction[];
}

// 필터 타입
export interface TaskFilter {
  status?: TaskStatus;
  priority?: Priority;
  category?: TaskCategory;
  project_id?: number;
}

export interface TransactionFilter {
  type?: TransactionType;
  category?: TransactionCategory;
  startDate?: string;
  endDate?: string;
  project_id?: number;
}

// Company Account (회사 계좌)
export type AccountType = 'crypto' | 'bank';
export type AccountPurpose = 'deposit' | 'withdrawal' | 'both';

export interface CompanyAccount {
  id: number;
  account_name: string;
  account_number?: string;
  bank_name?: string;
  account_type: AccountType;
  account_purpose: AccountPurpose;
  currency: string;
  balance: number;
  description?: string;
  exchange_name?: string;
  wallet_address?: string;
  network?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyAccountInput {
  account_name: string;
  account_number?: string;
  bank_name?: string;
  account_type?: AccountType;
  account_purpose?: AccountPurpose;
  currency?: string;
  balance?: number;
  description?: string;
  exchange_name?: string;
  wallet_address?: string;
  network?: string;
  is_active?: number;
}

export interface UpdateCompanyAccountInput {
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  account_type?: AccountType;
  account_purpose?: AccountPurpose;
  currency?: string;
  balance?: number;
  description?: string;
  exchange_name?: string;
  wallet_address?: string;
  network?: string;
  is_active?: number;
}

// Company Transaction (회사 거래)
export type CompanyTransactionType = 'income' | 'expense' | 'transfer';

export interface CompanyTransaction {
  id: number;
  account_id: number;
  type: CompanyTransactionType;
  amount: number;
  category: string;
  date: string;
  description?: string;
  payment_method?: string;
  reference_number?: string;
  project_id?: number;
  vendor_customer?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyTransactionInput {
  account_id: number;
  type: CompanyTransactionType;
  amount: number;
  category: string;
  date: string;
  description?: string;
  payment_method?: string;
  reference_number?: string;
  project_id?: number;
  vendor_customer?: string;
}

export interface UpdateCompanyTransactionInput {
  account_id?: number;
  type?: CompanyTransactionType;
  amount?: number;
  category?: string;
  date?: string;
  description?: string;
  payment_method?: string;
  reference_number?: string;
  project_id?: number;
  vendor_customer?: string;
}

// Company Finance Summary (회사 재무 요약)
export interface CompanyFinanceSummary {
  month?: string;
  year?: string;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  accountBalances: { account_name: string; balance: number }[];
  prevMonthIncome?: number;
  prevMonthExpense?: number;
  prevYearIncome?: number;
  prevYearExpense?: number;
  monthlyData?: { month: string; income: number; expense: number }[];
}

// Daily Task (매일할일)
export interface DailyTask {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  start_time?: string;
  end_time?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDailyTaskInput {
  title: string;
  description?: string;
  category?: string;
  priority?: Priority;
  start_time?: string;
  end_time?: string;
  is_active?: number;
}

export interface UpdateDailyTaskInput {
  title?: string;
  description?: string;
  category?: string;
  priority?: Priority;
  start_time?: string;
  end_time?: string;
  is_active?: number;
}

// Daily Task Completion (매일 완료 기록)
export interface DailyTaskCompletion {
  id: number;
  daily_task_id: number;
  completion_date: string;
  completed_at: string;
  notes?: string;
}

export interface CreateDailyTaskCompletionInput {
  daily_task_id: number;
  completion_date: string;
  notes?: string;
}

// Daily Task with Completion Status
export interface DailyTaskWithStatus extends DailyTask {
  is_completed_today: boolean;
  completion_notes?: string;
  streak_count: number; // 연속 완료 일수
}

// Memo (개인메모)
export interface Memo {
  id: number;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMemoInput {
  title: string;
  content?: string;
}

export interface UpdateMemoInput {
  title?: string;
  content?: string;
}

