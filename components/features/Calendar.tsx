'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Task, Transaction, CompanyTransaction } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface CalendarProps {
  tasks: Task[];
  transactions?: Transaction[];
  companyTransactions?: CompanyTransaction[];
  onTaskClick?: (task: Task) => void;
  onTransactionClick?: (transaction: Transaction) => void;
  onCompanyTransactionClick?: (transaction: CompanyTransaction) => void;
}

export default function Calendar({ 
  tasks, 
  transactions = [], 
  companyTransactions = [], 
  onTaskClick, 
  onTransactionClick, 
  onCompanyTransactionClick 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState<Map<string, Task[]>>(new Map());
  const [transactionsByDate, setTransactionsByDate] = useState<Map<string, Transaction[]>>(new Map());
  const [companyTransactionsByDate, setCompanyTransactionsByDate] = useState<Map<string, CompanyTransaction[]>>(new Map());

  useEffect(() => {
    // 날짜별로 작업 그룹화
    const groupedTasks = new Map<string, Task[]>();
    
    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = format(new Date(task.due_date), 'yyyy-MM-dd');
        if (!groupedTasks.has(dateKey)) {
          groupedTasks.set(dateKey, []);
        }
        groupedTasks.get(dateKey)!.push(task);
      }
    });
    
    setTasksByDate(groupedTasks);
  }, [tasks]);

  useEffect(() => {
    // 날짜별로 개인 거래 그룹화
    const groupedTransactions = new Map<string, Transaction[]>();
    
    transactions.forEach(transaction => {
      const dateKey = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!groupedTransactions.has(dateKey)) {
        groupedTransactions.set(dateKey, []);
      }
      groupedTransactions.get(dateKey)!.push(transaction);
    });
    
    setTransactionsByDate(groupedTransactions);
  }, [transactions]);

  useEffect(() => {
    // 날짜별로 회사 거래 그룹화
    const groupedCompanyTransactions = new Map<string, CompanyTransaction[]>();
    
    companyTransactions.forEach(transaction => {
      const dateKey = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!groupedCompanyTransactions.has(dateKey)) {
        groupedCompanyTransactions.set(dateKey, []);
      }
      groupedCompanyTransactions.get(dateKey)!.push(transaction);
    });
    
    setCompanyTransactionsByDate(groupedCompanyTransactions);
  }, [companyTransactions]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // 달력 그리드를 위해 월의 첫 번째 날이 시작하는 요일을 맞춤
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay()); // 일요일로 맞춤
  
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay())); // 토요일로 맞춤
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTaskStatusColor = (task: Task) => {
    if (task.status === 'completed') return 'bg-green-100 text-green-800';
    if (task.status === 'in_progress') return 'bg-blue-100 text-blue-800';
    if (task.status === 'overdue') return 'bg-red-100 text-red-800';
    if (isPast(new Date(task.due_date!)) && (task.status as string) !== 'completed') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getDayClasses = (day: Date) => {
    const baseClasses = 'h-8 w-8 flex items-center justify-center text-sm rounded-full';
    
    if (!isSameMonth(day, currentDate)) {
      return `${baseClasses} text-gray-300`;
    }
    
    if (isToday(day)) {
      return `${baseClasses} bg-blue-500 text-white font-bold`;
    }
    
    return `${baseClasses} hover:bg-gray-100`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  return (
    <Card>
      <div className="p-4">
        {/* 달력 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateMonth('prev')}
          >
            ←
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateMonth('next')}
          >
            →
          </Button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate.get(dateKey) || [];
            const dayTransactions = transactionsByDate.get(dateKey) || [];
            const dayCompanyTransactions = companyTransactionsByDate.get(dateKey) || [];
            
            // 총 항목 수 계산
            const totalItems = dayTasks.length + dayTransactions.length + dayCompanyTransactions.length;
            
            return (
              <div key={dateKey} className="min-h-[80px] border border-gray-100 p-1">
                <div className={getDayClasses(day)}>
                  {format(day, 'd')}
                </div>
                
                {/* 해당 날짜의 모든 항목들 */}
                <div className="mt-1 space-y-1">
                  {/* 작업들 */}
                  {dayTasks.slice(0, 1).map(task => (
                    <div
                      key={`task-${task.id}`}
                      className={`text-xs px-1 py-0.5 rounded cursor-pointer truncate ${getTaskStatusColor(task)}`}
                      onClick={() => onTaskClick?.(task)}
                      title={`업무: ${task.title}`}
                    >
                      📋 {task.title}
                    </div>
                  ))}
                  
                  {/* 개인 거래들 */}
                  {dayTransactions.slice(0, 1).map(transaction => (
                    <div
                      key={`transaction-${transaction.id}`}
                      className={`text-xs px-1 py-0.5 rounded cursor-pointer truncate ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      onClick={() => onTransactionClick?.(transaction)}
                      title={`개인재정: ${transaction.category} ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}`}
                    >
                      💰 {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  ))}
                  
                  {/* 회사 거래들 */}
                  {dayCompanyTransactions.slice(0, 1).map(transaction => (
                    <div
                      key={`company-${transaction.id}`}
                      className={`text-xs px-1 py-0.5 rounded cursor-pointer truncate ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : transaction.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                      onClick={() => onCompanyTransactionClick?.(transaction)}
                      title={`회사재무: ${transaction.category} ${transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '↔'}${formatCurrency(transaction.amount)}`}
                    >
                      🏢 {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '↔'}{formatCurrency(transaction.amount)}
                    </div>
                  ))}
                  
                  {/* 더 많은 항목이 있을 때 */}
                  {totalItems > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{totalItems - 3}개 더
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span>완료 작업</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>진행중 작업</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>할일</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span>지연/지출</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600">💰</span>
            <span>개인재정</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-600">🏢</span>
            <span>회사재무</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
