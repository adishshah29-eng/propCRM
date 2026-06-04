import { Sidebar } from '@/components/common/Sidebar'
import { Topbar } from '@/components/common/Topbar'
import { MobileNav } from '@/components/common/MobileNav'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-16 transition-all duration-200 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
