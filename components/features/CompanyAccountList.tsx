'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { CompanyAccount } from '@/types';

interface CompanyAccountListProps {
  accounts: CompanyAccount[];
  onEdit: (account: CompanyAccount) => void;
  onDelete: (id: number) => void;
}

const accountTypeLabels: Record<string, string> = {
  crypto: '암호화폐',
  checking: '당좌예금',
  savings: '보통예금',
  investment: '투자계좌',
  other: '기타',
};

export default function CompanyAccountList({ accounts, onEdit, onDelete }: CompanyAccountListProps) {
  if (accounts.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          계좌가 없습니다. 새 계좌를 추가해보세요.
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <Card key={account.id}>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{account.account_name}</h3>
                <p className="text-sm text-gray-500">{accountTypeLabels[account.account_type]}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {account.is_active ? '활성' : '비활성'}
              </span>
            </div>

            {account.account_type === 'crypto' ? (
              <div className="space-y-1">
                {account.exchange_name && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">거래소:</span> {account.exchange_name}
                  </div>
                )}
                {account.wallet_address && (
                  <div className="text-xs text-gray-500 truncate" title={account.wallet_address}>
                    <span className="font-medium">주소:</span> {account.wallet_address}
                  </div>
                )}
                {account.network && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">네트워크:</span> {account.network}
                  </div>
                )}
              </div>
            ) : (
              account.bank_name && (
                <div className="text-sm text-gray-600">
                  {account.bank_name}
                  {account.account_number && ` • ${account.account_number}`}
                </div>
              )
            )}

            <div className="pt-3 border-t border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(account.balance)}
              </div>
              <div className="text-xs text-gray-500 mt-1">{account.currency}</div>
            </div>

            {account.description && (
              <p className="text-sm text-gray-600">{account.description}</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => onEdit(account)} className="flex-1">
                수정
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(account.id)} className="flex-1">
                삭제
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

