'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProjectForm from '@/components/features/ProjectForm';
import { formatCurrency, getProjectStatusColor, getProjectStatusLabel } from '@/lib/utils';
import type { Project, ProjectStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<{ status?: ProjectStatus }>({});

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);

      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('이 프로젝트를 삭제하시겠습니까? 연결된 작업과 거래도 함께 삭제됩니다.')) return;

    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    fetchProjects();
  };

  return (
    <MainLayout
      title="프로젝트"
      action={
        <Button onClick={handleCreateProject}>
          + 새 프로젝트
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 필터 */}
        <Card>
          <div className="flex gap-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filter.status || ''}
              onChange={(e) => setFilter({ status: e.target.value as ProjectStatus || undefined })}
            >
              <option value="">전체 상태</option>
              <option value="planning">계획</option>
              <option value="in_progress">진행 중</option>
              <option value="completed">완료</option>
              <option value="on_hold">보류</option>
            </select>

            {filter.status && (
              <Button variant="ghost" onClick={() => setFilter({})}>
                필터 초기화
              </Button>
            )}
          </div>
        </Card>

        {/* 프로젝트 목록 */}
        {projects.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              프로젝트가 없습니다. 새 프로젝트를 추가해보세요.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{project.name}</CardTitle>
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getProjectStatusColor(project.status)
                    )}>
                      {getProjectStatusLabel(project.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                  )}

                  {/* 진행률 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">진행률</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 재정 정보 */}
                  <div className="space-y-2 mb-4 text-sm">
                    {project.target_revenue && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">목표 수익:</span>
                        <span className="font-medium">{formatCurrency(project.target_revenue)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">실제 수익:</span>
                      <span className={cn(
                        'font-medium',
                        project.actual_revenue >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {formatCurrency(project.actual_revenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">수입: {formatCurrency(project.total_income || 0)}</span>
                      <span className="text-gray-500">지출: {formatCurrency(project.total_expense || 0)}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEditProject(project)} className="flex-1">
                      수정
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteProject(project.id)} className="flex-1">
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 프로젝트 생성/수정 모달 */}
      {isModalOpen && (
        <ProjectForm
          project={editingProject}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProject(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </MainLayout>
  );
}

