// PRD 7.2 스키마 기반 TypeScript 타입 정의

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
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
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  category?: TaskCategory;
  status?: TaskStatus;
  project_id?: number;
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
export interface Budget {
  id: number;
  category: ExpenseCategory;
  amount: number;
  month: number; // 1-12
  year: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetInput {
  category: ExpenseCategory;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetInput {
  category?: ExpenseCategory;
  amount?: number;
  month?: number;
  year?: number;
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

