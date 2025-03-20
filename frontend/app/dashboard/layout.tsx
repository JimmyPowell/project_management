"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react"
import { Footer } from "@/components/footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // 如果还在加载或未登录，显示加载状态
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="text-lg font-semibold mr-4"
        >
          项目管理系统
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
              pathname === "/dashboard"
                ? "text-foreground border-b-2 border-foreground"
                : "text-foreground/60"
            }`}
          >
            概览
          </Link>
          <Link
            href="/dashboard/tasks"
            className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
              pathname?.includes("/dashboard/tasks")
                ? "text-foreground border-b-2 border-foreground"
                : "text-foreground/60"
            }`}
          >
            任务管理
          </Link>
          <Link
            href="/dashboard/milestones"
            className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
              pathname?.includes("/dashboard/milestones")
                ? "text-foreground border-b-2 border-foreground"
                : "text-foreground/60"
            }`}
          >
            项目里程碑
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm">欢迎，{user.name}</span>
          <Button variant="outline" onClick={() => logout()}>
            退出
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
      <Footer />
    </div>
  )
}

