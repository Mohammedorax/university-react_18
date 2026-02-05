import { Provider } from 'react-redux'
import { store } from '@/store'
import { ThemeProvider } from '@/components/ThemeProvider'
import AppRouter from '@/router'

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
