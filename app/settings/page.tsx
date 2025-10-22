'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch('/api/backup?action=export');
      const data = await response.json();
      
      // JSON 파일 다운로드
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('백업이 완료되었습니다.');
    } catch (error) {
      console.error('Error backing up data:', error);
      alert('백업 중 오류가 발생했습니다.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('현재 데이터를 백업 파일로 복원하시겠습니까? 기존 데이터는 덮어씌워집니다.')) {
      event.target.value = '';
      return;
    }

    setIsRestoring(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/backup?action=import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('복원이 완료되었습니다. 페이지를 새로고침합니다.');
        window.location.reload();
      } else {
        throw new Error('복원 실패');
      }
    } catch (error) {
      console.error('Error restoring data:', error);
      alert('복원 중 오류가 발생했습니다.');
    } finally {
      setIsRestoring(false);
      event.target.value = '';
    }
  };

  return (
    <MainLayout title="설정">
      <div className="max-w-2xl space-y-6">
        {/* 사용자 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  defaultValue="사용자"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  defaultValue="user@example.com"
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 테마 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>테마 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">테마</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                <option value="light">라이트 모드</option>
                <option value="dark">다크 모드</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">다크 모드는 향후 업데이트에서 지원됩니다.</p>
            </div>
          </CardContent>
        </Card>

        {/* 데이터 관리 */}
        <Card>
          <CardHeader>
            <CardTitle>데이터 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 백업 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">데이터 백업</h4>
                <p className="text-sm text-gray-600 mb-3">
                  모든 데이터를 JSON 파일로 내보냅니다.
                </p>
                <Button onClick={handleBackup} disabled={isBackingUp}>
                  {isBackingUp ? '백업 중...' : '백업 시작'}
                </Button>
              </div>

              {/* 복원 */}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">데이터 복원</h4>
                <p className="text-sm text-gray-600 mb-3">
                  백업 파일에서 데이터를 복원합니다. 기존 데이터는 덮어씌워집니다.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  disabled={isRestoring}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50"
                />
              </div>

              {/* 초기화 */}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">데이터 초기화</h4>
                <p className="text-sm text-gray-600 mb-3">
                  모든 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                </p>
                <Button variant="danger" disabled>
                  전체 삭제 (비활성화)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

