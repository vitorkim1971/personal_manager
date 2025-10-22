import { type ClassValue, clsx } from 'clsx';

// Tailwind CSS 클래스 병합 유틸리티
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// 금액 포맷팅 (달러)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// 마이너스 숫자를 위한 색상 클래스 반환
export function getAmountColorClass(amount: number, positiveColor: string = 'text-green-600', negativeColor: string = 'text-red-600'): string {
  return amount >= 0 ? positiveColor : negativeColor;
}

// 금액과 함께 색상 클래스를 반환하는 함수
export function formatCurrencyWithColor(amount: number, positiveColor: string = 'text-green-600', negativeColor: string = 'text-red-600'): { formatted: string; colorClass: string } {
  return {
    formatted: formatCurrency(amount),
    colorClass: getAmountColorClass(amount, positiveColor, negativeColor)
  };
}

// 날짜 포맷팅 (YYYY-MM-DD)
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 날짜 포맷팅 (YYYY년 MM월 DD일)
export function formatDateKorean(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

// 상대 시간 포맷팅
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInMs = target.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return '오늘';
  if (diffInDays === -1) return '어제';
  if (diffInDays === 1) return '내일';
  if (diffInDays > 0 && diffInDays <= 7) return `${diffInDays}일 후`;
  if (diffInDays < 0 && diffInDays >= -7) return `${Math.abs(diffInDays)}일 전`;
  
  return formatDate(date);
}

// 마감일 임박 여부 체크
export function isDeadlineApproaching(dueDate: string): boolean {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInMs = due.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  return diffInDays >= 0 && diffInDays <= 3; // 3일 이내
}

// 마감일 지남 여부 체크
export function isOverdue(dueDate: string): boolean {
  const now = new Date();
  const due = new Date(dueDate);
  return due < now;
}

// 우선순위 색상
export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// 우선순위 한글 이름
export function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return '높음';
    case 'medium':
      return '보통';
    case 'low':
      return '낮음';
    default:
      return '보통';
  }
}

// 상태 색상
export function getStatusColor(status: 'todo' | 'in_progress' | 'completed'): string {
  switch (status) {
    case 'todo':
      return 'text-blue-600 bg-blue-50';
    case 'in_progress':
      return 'text-purple-600 bg-purple-50';
    case 'completed':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// 상태 한글 이름
export function getStatusLabel(status: 'todo' | 'in_progress' | 'completed'): string {
  switch (status) {
    case 'todo':
      return '할 일';
    case 'in_progress':
      return '진행 중';
    case 'completed':
      return '완료';
    default:
      return '할 일';
  }
}

// 프로젝트 상태 색상
export function getProjectStatusColor(status: 'planning' | 'in_progress' | 'completed' | 'on_hold'): string {
  switch (status) {
    case 'planning':
      return 'text-blue-600 bg-blue-50';
    case 'in_progress':
      return 'text-purple-600 bg-purple-50';
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'on_hold':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// 프로젝트 상태 한글 이름
export function getProjectStatusLabel(status: 'planning' | 'in_progress' | 'completed' | 'on_hold'): string {
  switch (status) {
    case 'planning':
      return '계획';
    case 'in_progress':
      return '진행 중';
    case 'completed':
      return '완료';
    case 'on_hold':
      return '보류';
    default:
      return '계획';
  }
}

// 거래 유형 색상
export function getTransactionTypeColor(type: 'income' | 'expense'): string {
  return type === 'income' ? 'text-green-600' : 'text-red-600';
}

// 증감률 계산
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// 퍼센트 포맷팅
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

