/**
 * @file auditLog.ts
 * @description Dedicated audit log module to avoid circular dependencies.
 * 
 * This module provides a centralized audit log service that can be used by
 * all mock API modules without creating circular import chains.
 * 
 * @module lib/auditLog
 */

import { getStorageData, setStorageData } from './utils'

/**
 * Represents a single audit log entry
 * @interface AuditLog
 */
export interface AuditLog {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    userId: string;
}

/**
 * Safely parse JSON string, returning a fallback object on failure.
 * @param str - The JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
function safeJsonParse<T>(str: string | null, fallback: T): T {
    if (!str) return fallback
    try {
        return JSON.parse(str) as T
    } catch {
        return fallback
    }
}

/**
 * Add an audit log entry
 * @param action - The action performed (e.g., 'إضافة طالب', 'حذف مدرس')
 * @param details - Detailed description of the action
 * @returns Promise resolving to the created log entry
 */
export async function addAuditLog(action: string, details: string): Promise<AuditLog> {
    const logs = getStorageData<AuditLog[]>('audit_logs', [])
    const authUser = getStorageData<Record<string, unknown>>('auth_user', {})
    const newLog: AuditLog = {
        id: Date.now().toString(),
        action,
        details,
        timestamp: new Date().toISOString(),
        // Use 'anonymous' instead of 'system' to distinguish from actual system-initiated actions
        userId: (authUser.id as string) || 'anonymous'
    }
    logs.unshift(newLog)
    setStorageData('audit_logs', logs.slice(0, 100))
    return newLog
}

/**
 * Get all audit log entries
 * @returns Promise resolving to array of audit logs
 */
export async function getAuditLogs(): Promise<AuditLog[]> {
    return getStorageData<AuditLog[]>('audit_logs', [])
}
