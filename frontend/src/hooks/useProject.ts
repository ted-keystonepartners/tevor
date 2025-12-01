import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Project, ProjectCreate } from '@/lib/types';
import {
  useProjectActions,
  useUIActions,
  useCurrentProject,
  useProjects,
  useLoading,
} from '@/lib/store';

export const useProject = () => {
  const router = useRouter();
  const currentProject = useCurrentProject();
  const projects = useProjects();
  const loading = useLoading();

  const {
    setCurrentProject,
    setProjects,
    addProject,
    removeProject,
  } = useProjectActions();

  const {
    setLoading,
    setError,
    clearError,
    reset,
  } = useUIActions();

  // 프로젝트 목록 로드 (재시도 로직 포함)
  const loadProjects = useCallback(async (retryCount = 0): Promise<void> => {
    if (retryCount === 0) {
      setLoading({ isLoading: true, message: '프로젝트 목록을 불러오는 중...' });
      clearError();
    }

    try {
      const projectList = await api.listProjects();
      setProjects(projectList);
      setLoading({ isLoading: false });
    } catch (error) {
      console.error(`프로젝트 목록 로딩 실패 (시도 ${retryCount + 1}/3):`, error);
      
      // 3번까지 재시도
      if (retryCount < 2) {
        console.log('2초 후 재시도합니다...');
        setTimeout(() => {
          loadProjects(retryCount + 1);
        }, 2000);
        return;
      }
      
      // 최종 실패
      setError({
        hasError: true,
        message: error instanceof Error ? error.message : '프로젝트 목록을 불러오는데 실패했습니다.',
      });
      setLoading({ isLoading: false });
    }
  }, [setProjects, setLoading, setError, clearError]);

  // 프로젝트 생성
  const createProject = useCallback(async (data: ProjectCreate): Promise<Project | null> => {
    setLoading({ isLoading: true, message: '프로젝트를 생성하는 중...' });
    clearError();

    try {
      const newProject = await api.createProject(data);
      addProject(newProject);
      
      return newProject;
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      setError({
        hasError: true,
        message: error instanceof Error ? error.message : '프로젝트 생성에 실패했습니다.',
      });
      return null;
    } finally {
      setLoading({ isLoading: false });
    }
  }, [addProject, setLoading, setError, clearError]);

  // 프로젝트 선택
  const selectProject = useCallback(async (project: Project) => {
    setCurrentProject(project);
    
    // 채팅 페이지로 이동
    router.push(`/chat/${project.project_id}`);
  }, [setCurrentProject, router]);

  // 프로젝트 생성 후 선택
  const createAndSelectProject = useCallback(async (name: string, description?: string) => {
    const projectData: ProjectCreate = { name, description };
    const newProject = await createProject(projectData);
    if (newProject) {
      await selectProject(newProject);
      return newProject;
    }
    return null;
  }, [createProject, selectProject]);

  // 프로젝트 삭제
  const deleteProject = useCallback(async (projectId: string) => {
    setLoading({ isLoading: true, message: '프로젝트를 삭제하는 중...' });
    clearError();

    try {
      await api.deleteProject(projectId);
      removeProject(projectId);
      
      // 현재 선택된 프로젝트가 삭제된 경우 홈으로 이동
      if (currentProject?.project_id === projectId) {
        setCurrentProject(null);
        router.push('/');
      }
      
      return true;
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      setError({
        hasError: true,
        message: error instanceof Error ? error.message : '프로젝트 삭제에 실패했습니다.',
      });
      return false;
    } finally {
      setLoading({ isLoading: false });
    }
  }, [currentProject, removeProject, setCurrentProject, setLoading, setError, clearError, router]);

  // 프로젝트 세부 정보 로드
  const loadProject = useCallback(async (projectId: string): Promise<Project | null> => {
    setLoading({ isLoading: true, message: '프로젝트 정보를 불러오는 중...' });
    clearError();

    try {
      const project = await api.getProject(projectId);
      
      // 현재 프로젝트로 설정
      setCurrentProject(project);
      
      // 프로젝트 목록에도 업데이트 (없으면 추가)
      const existingProject = projects.find(p => p.project_id === projectId);
      if (!existingProject) {
        addProject(project);
      }
      
      return project;
    } catch (error) {
      console.error('프로젝트 로딩 실패:', error);
      setError({
        hasError: true,
        message: error instanceof Error ? error.message : '프로젝트를 불러오는데 실패했습니다.',
      });
      return null;
    } finally {
      setLoading({ isLoading: false });
    }
  }, [projects, setCurrentProject, addProject, setLoading, setError, clearError]);

  // 프로젝트 요약 정보 로드
  const loadProjectSummary = useCallback(async (projectId: string) => {
    try {
      const summary = await api.getProjectSummary(projectId);
      return summary;
    } catch (error) {
      console.error('프로젝트 요약 로딩 실패:', error);
      return null;
    }
  }, []);

  // 프로젝트 초기화 (홈 화면으로 돌아갈 때)
  const resetProject = useCallback(() => {
    setCurrentProject(null);
    reset(); // 전체 상태 리셋
  }, [setCurrentProject, reset]);

  // 컴포넌트 마운트 시 프로젝트 목록 로드
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    // 상태
    currentProject,
    projects,
    loading: loading.isLoading,
    
    // 액션
    loadProjects,
    createProject,
    selectProject,
    createAndSelectProject,
    deleteProject,
    loadProject,
    loadProjectSummary,
    resetProject,
    
    // 유틸리티
    hasProjects: projects.length > 0,
    canCreateProject: !loading.isLoading,
  };
};