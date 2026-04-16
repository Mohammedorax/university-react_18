export interface SystemSettings {
    currentSemester: string
    academicYear: string
    registrationEnabled: boolean
    gradingEnabled: boolean
    systemMaintenance: boolean
    universityName: string
    contactEmail: string
    emailNotifications: boolean
    pushNotifications: boolean
    systemNotifications: boolean
    academicNotifications: boolean
    financialNotifications: boolean
    administrativeNotifications: boolean
    reportHeaderSubtitle?: string
    reportFooterText?: string
    logoUrl?: string
    language: 'ar' | 'en'
    direction: 'rtl' | 'ltr'
}

export interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system'
    primaryColor: string
    logo: string | null
}
