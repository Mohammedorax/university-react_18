import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api as mockApi } from '@/services/api'
import { SystemSettings } from '@/features/settings/types'

export const settingsKeys = {
    all: ['settings'] as const,
}

export const useSettings = () => {
    return useQuery({
        queryKey: settingsKeys.all,
        queryFn: () => mockApi.getSettings(),
    })
}

export const useUpdateSettings = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (settings: Partial<SystemSettings>) => mockApi.updateSettings(settings),
        onSuccess: (data) => {
            queryClient.setQueryData(settingsKeys.all, data)
        }
    })
}
