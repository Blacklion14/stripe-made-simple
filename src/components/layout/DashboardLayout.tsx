import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface DashboardLayoutProps {
  children: ReactNode;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/products': 'Products',
  '/subscriptions': 'Subscriptions',
  '/invoices': 'Invoices',
  '/settings': 'Settings',
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle dynamic routes like /subscriptions/:id
  const pathParts = location.pathname.split('/');
  const baseRoute = `/${pathParts[1]}`;
  const currentTitle = routeTitles[location.pathname] || routeTitles[baseRoute] || 'Page';
  const isDetailPage = pathParts.length > 2 && pathParts[2];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 items-center gap-2 sm:gap-4 border-b border-border bg-background px-3 sm:px-4 lg:px-6 sticky top-0 z-10">
            <SidebarTrigger className="-ml-1 flex-shrink-0" />
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Breadcrumb className="flex-1 min-w-0">
              <BreadcrumbList className="flex-wrap">
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
                {isDetailPage ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={baseRoute}>{routeTitles[baseRoute]}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="truncate max-w-[100px] sm:max-w-none">Details</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-3 sm:p-4 lg:p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
