import { StudentDocument } from './types'
import { initialDocuments } from './data'
import { getStorageData, setStorageData, delay } from './utils'

export const documentApi = {
    getDocuments: async (entityId: string, entityType: 'student' | 'teacher' | 'course' | 'staff') => {
        await delay(300)
        const documents = getStorageData('documents', initialDocuments)
        return documents.filter(d => d.entityId === entityId && d.entityType === entityType)
    },

    uploadDocument: async (entityId: string, entityType: 'student' | 'teacher' | 'course' | 'staff', file: File) => {
        await delay(500)
        const documents = getStorageData('documents', initialDocuments)
        const newDoc: StudentDocument = {
            id: 'doc' + Math.random().toString(36).substr(2, 9),
            entityId,
            entityType,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString(),
            url: URL.createObjectURL(file)
        }
        documents.push(newDoc)
        localStorage.setItem('documents', JSON.stringify(documents))
        return newDoc
    },

    deleteDocument: async (documentId: string) => {
        await delay(300)
        const documents = getStorageData('documents', initialDocuments)
        const filteredDocs = documents.filter(d => d.id !== documentId)
        localStorage.setItem('documents', JSON.stringify(filteredDocs))
        return true
    },
}
