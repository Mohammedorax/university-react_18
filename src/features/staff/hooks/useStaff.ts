import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { mockApi } from '@/services/mockApi'
import { Staff } from '@/features/staff/types'

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters: string) => [...staffKeys.lists(), { filters }] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
}

export const useStaff = (params?: { query?: string, department?: string, page?: number, limit?: number }) => {
  return useQuery({
    queryKey: [...staffKeys.lists(), params],
    queryFn: () => mockApi.getStaff(params),
    placeholderData: keepPreviousData,
  })
}

export const useStaffMember = (id: string) => {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => mockApi.getStaffById(id),
    enabled: !!id,
  })
}

export const useAddStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (staffData: Omit<Staff, 'id'>) => mockApi.addStaff(staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
    },
  })
}

export const useUpdateStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Staff> }) =>
      mockApi.updateStaff(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(data.id) })
    },
  })
}

export const useDeleteStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => mockApi.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
    },
  })
}
