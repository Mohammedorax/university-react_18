import { configureStore } from '@reduxjs/toolkit'
import authSlice from '@/store/slices/authSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

/**
 * Redux store الموحّد للتطبيق.
 *
 * سياسة إدارة الحالة (Hybrid - Server-State أولًا):
 * - Server-State (طلاب، مدرسين، مقررات، مخزون، درجات، ...): يُدار عبر React Query فقط.
 * - Client/Global UI-State (مصادقة المستخدم، الجلسة، التفضيلات العامة): يُدار هنا في Redux.
 *
 * لا تضف Slice جديدة لبيانات تأتي من الـ API. استخدم React Query بدلاً من ذلك.
 * انظر: docs/STATE_MANAGEMENT.md (إن وُجد) أو ARCHITECTURE.md.
 */
export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
