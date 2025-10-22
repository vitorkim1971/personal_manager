'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { CompanyAccount, CreateCompanyAccountInput } from '@/types';

interface CompanyAccountFormProps {
  account?: CompanyAccount | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompanyAccountForm({ account, onClose, onSuccess }: CompanyAccountFormProps) {
  const [formData, setFormData] = useState<CreateCompanyAccountInput>({
    account_name: '',
    account_number: '',
    bank_name: '',
    account_type: 'crypto',
    account_purpose: 'both',
    currency: 'USDT',
    balance: 0,
    description: '',
    exchange_name: '',
    wallet_address: '',
    network: '',
    is_active: 1,
  });

  useEffect(() => {
    if (account) {
      setFormData({
        account_name: account.account_name,
        account_number: account.account_number,
        bank_name: account.bank_name,
        account_type: account.account_type,
        account_purpose: account.account_purpose,
        currency: account.currency,
        balance: account.balance,
        description: account.description,
        exchange_name: account.exchange_name,
        wallet_address: account.wallet_address,
        network: account.network,
        is_active: account.is_active,
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = account ? `/api/company-accounts/${account.id}` : '/api/company-accounts';
      const method = account ? 'PUT' : 'POST';

      console.log('Submitting account data:', formData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Account created:', result);
        onSuccess();
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(`계좌 생성 실패: ${error.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      alert('계좌 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={account ? '계좌 수정' : '새 계좌 추가'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="계좌명"
          type="text"
          value={formData.account_name}
          onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
          required
          placeholder="예: Binance USDT 메인"
        />

        <Select
          label="계좌 유형"
          value={formData.account_type || 'crypto'}
          onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
          options={[
            { value: 'crypto', label: '암호화폐 지갑' },
            { value: 'bank', label: '은행계좌' },
          ]}
        />

        <Select
          label="계좌 용도"
          value={formData.account_purpose || 'both'}
          onChange={(e) => setFormData({ ...formData, account_purpose: e.target.value as any })}
          options={[
            { value: 'both', label: '입출금 겸용' },
            { value: 'deposit', label: '입금 전용' },
            { value: 'withdrawal', label: '출금 전용' },
          ]}
        />

        {formData.account_type === 'crypto' ? (
          <>
            <Input
              label="거래소/지갑명"
              type="text"
              value={formData.exchange_name || ''}
              onChange={(e) => setFormData({ ...formData, exchange_name: e.target.value })}
              placeholder="예: Binance, MetaMask, Trust Wallet"
            />

            <Input
              label="지갑 주소"
              type="text"
              value={formData.wallet_address || ''}
              onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
              placeholder="입출금 주소"
            />

            <Input
              label="네트워크"
              type="text"
              value={formData.network || ''}
              onChange={(e) => setFormData({ ...formData, network: e.target.value })}
              placeholder="예: TRC20, ERC20, BEP20"
            />
          </>
        ) : (
          <>
            <Input
              label="계좌번호"
              type="text"
              value={formData.account_number || ''}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            />

            <Input
              label="은행명"
              type="text"
              value={formData.bank_name || ''}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            />
          </>
        )}

        <Input
          label="통화"
          type="text"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          placeholder="예: USDT, BTC, ETH, USD"
        />

        <Input
          label="초기 잔액"
          type="number"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
          step="0.01"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <Select
          label="상태"
          value={formData.is_active !== undefined ? (formData.is_active ? '1' : '0') : '1'}
          onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
          options={[
            { value: '1', label: '활성' },
            { value: '0', label: '비활성' },
          ]}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            {account ? '수정' : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

