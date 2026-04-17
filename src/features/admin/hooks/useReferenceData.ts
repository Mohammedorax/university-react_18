import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Department, Specialization } from '@/features/settings/types'

export const referenceKeys = {
    departments: ['reference', 'departments'] as const,
    specializations: ['reference', 'specializations'] as const,
    semesters: ['reference', 'semesters'] as const,
}

export const useDepartments = () =>
    useQuery({
        queryKey: referenceKeys.departments,
        queryFn: () => api.getDepartments() as Promise<Department[]>,
    })

export const useSpecializations = () =>
    useQuery({
        queryKey: referenceKeys.specializations,
        queryFn: () => api.getSpecializations() as Promise<Specialization[]>,
    })

export const useSemesters = () =>
    useQuery({
        queryKey: referenceKeys.semesters,
        queryFn: () => api.getSemesters() as Promise<string[]>,
    })

export const useCreateDepartment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: Omit<Department, 'id'>) => api.createDepartment(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: referenceKeys.departments }),
    })
}

