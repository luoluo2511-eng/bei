import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '灰烬纪元 · 西幻人生模拟器 V2', description: '一个持续运行的真实西幻开放人生沙盘' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>
}