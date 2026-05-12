import '../styles/globals.css'
import '../src/chart'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '../src/theme'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
