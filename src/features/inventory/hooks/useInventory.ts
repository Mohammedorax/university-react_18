import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '@/services/mockApi';
import { InventoryItem } from '@/features/inventory/types';

export const useInventory = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const data = await mockApi.getInventory();
      return data as InventoryItem[];
    },
  });
};

export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemData: Omit<InventoryItem, 'id'>) => mockApi.addInventoryItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => mockApi.updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockApi.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      const data = await mockApi.getCategories();
      return data as string[];
    },
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: string) => mockApi.addCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: string) => mockApi.deleteCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
    },
  });
};
