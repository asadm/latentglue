import { Html, Head, Main, NextScript } from 'next/document'
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"
import { useEffect } from 'react'

export default function Document() {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme("dark");
  }, []);
  return (
    <Html lang="en">
      <Head />
      <body>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Main />
        <NextScript />
          </ThemeProvider>
      </body>
    </Html>
  )
}
