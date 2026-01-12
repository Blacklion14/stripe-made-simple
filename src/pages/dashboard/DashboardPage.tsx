import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchDashboardData } from '@/store/slices/dashboardSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  FileText, 
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, revenueChart, recentCustomers, recentInvoices, isLoading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue || 0,
      format: 'currency',
      change: stats?.revenueGrowth || 0,
      icon: DollarSign,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      format: 'number',
      change: stats?.customerGrowth || 0,
      icon: Users,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      format: 'number',
      change: 5.2,
      icon: CreditCard,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      title: 'Pending Invoices',
      value: stats?.pendingInvoices || 0,
      format: 'number',
      change: -2.4,
      icon: FileText,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'open':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'void':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's an overview of your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-3 sm:p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground truncate pr-2">{stat.title}</span>
                    <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                      <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <span className="text-lg sm:text-2xl font-bold text-foreground">
                      {stat.format === 'currency' ? formatCurrency(stat.value) : stat.value}
                    </span>
                  </div>
                  <div className="mt-1 sm:mt-2 flex items-center gap-1 text-xs sm:text-sm">
                    {stat.change >= 0 ? (
                      <>
                        <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                        <span className="text-success font-medium">+{stat.change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                        <span className="text-destructive font-medium">{stat.change}%</span>
                      </>
                    )}
                    <span className="text-muted-foreground hidden sm:inline">from last month</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Revenue Overview</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Monthly revenue for the past year</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-[200px] sm:h-[300px] w-full" />
            ) : (
              <div className="h-[200px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      className="text-xs" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                      tickFormatter={(value) => `$${value / 1000}k`}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Recent Invoices</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest invoice activity</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 sm:pt-0">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between py-2 gap-2">
                    <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{invoice.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{invoice.id}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-medium">{formatCurrency(invoice.amount)}</span>
                      <Badge variant="outline" className={`${getStatusColor(invoice.status)} text-xs`}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Recent Customers</CardTitle>
          <CardDescription className="text-xs sm:text-sm">New customers added this month</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 sm:pt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentCustomers.map((customer) => (
                <div key={customer.clientId} className="flex items-center gap-3 sm:gap-4 py-2">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm flex-shrink-0">
                    {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">{customer.subscriptions} subs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
