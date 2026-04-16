import { Provider } from 'react-redux'
import { store } from '@/store'
import { ThemeProvider } from '@/components/ThemeProvider'
import AppRouter from '@/router'

/**
 * Main application component that provides global state management and theming.
 * Wraps the entire application with Redux Provider and ThemeProvider for consistent
 * state management and theme handling across all components.
 *
 * @returns {JSX.Element} The root application component with all providers
 */
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="university-ui-theme">
        <AppRouter />
      </ThemeProvider>
    </Provider>
  )
}

export default App
