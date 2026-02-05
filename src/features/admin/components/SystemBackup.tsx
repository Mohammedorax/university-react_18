import React from 'react';
import { logger } from '@/lib/logger';
import { useMutation } from '@tanstack/react-query';

interface BackupData {
  students: any[];
  teachers: any[];
  courses: any[];
  grades: any[];
  auditLogs: any[];
  settings: any;
}

/**
 * System Backup/Restore Feature
 * نسخ احتياطي وإستعادة جميع بيانات النظام
 */
export function useSystemBackup() {
  const backupMutation = useMutation({
    mutationFn: async () => {
      try {
        const data = {
          students: localStorage.getItem('students') || [],
          teachers: localStorage.getItem('teachers') || [],
          courses: localStorage.getItem('courses') || [],
          grades: localStorage.getItem('grades') || [],
          auditLogs: localStorage.getItem('audit_logs') || [],
          settings: localStorage.getItem('settings') || '',
          timestamp: new Date().toISOString(),
        };
        
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${data.timestamp}.json`;
        a.click();
        
        logger.info('System backup created', { items: Object.keys(data).length });
        return data;
      } catch (error) {
        logger.error('Failed to create backup', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    },
  });

  return backupMutation;
}

export function useSystemRestore() {
  const restoreMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (value && Array.isArray(value)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });
        
        logger.info('System restore completed', { file: file.name });
        return data;
      } catch (error) {
        logger.error('Failed to restore backup', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    },
  });

  return restoreMutation;
}
