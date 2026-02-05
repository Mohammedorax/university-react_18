import { configureStore } from '@reduxjs/toolkit'
import authSlice from '@/store/slices/authSlice'
import coursesSlice from '@/features/courses/slice/coursesSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: coursesSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

// استيراد الأنواع المحددة
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// hooks متخصصة للاستخدام
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector