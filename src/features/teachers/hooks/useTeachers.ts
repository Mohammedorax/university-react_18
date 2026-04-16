import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api as mockApi } from '@/services/api'
import { Teacher } from '@/features/teachers/types'

export const teacherKeys = {
  all: ['teachers'] as const,
  lists: () => [...teacherKeys.all, 'list'] as const,
  list: (filters: string) => [...teacherKeys.lists(), { filters }] as const,
  details: () => [...teacherKeys.all, 'detail'] as const,
  detail: (id: string) => [...teacherKeys.details(), id] as const,
}

export const useTeachers = (params?: { query?: string, department?: string, page?: number, limit?: number }) => {
  return useQuery({
    queryKey: [...teacherKeys.lists(), params],
    queryFn: () => mockApi.getTeachers(params),
    placeholderData: keepPreviousData,
  })
}

export const useTeacher = (id: string) => {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => mockApi.getTeacherById(id),
    enabled: !!id,
  })
}

export const useAddTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teacherData: Omit<Teacher, 'id'>) => mockApi.addTeacher(teacherData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
    },
  })
}

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Teacher> }) =>
      mockApi.updateTeacher(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })
}

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => mockApi.deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
    },
  })
}
