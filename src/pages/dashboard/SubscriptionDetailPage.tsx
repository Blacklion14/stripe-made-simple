import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchSubscriptions, cancelSubscription, pauseSubscription, resumeSubscription } from '@/store/slices/subscriptionsSlice';
import { fetchInvoices } from '@/store/slices/invoicesSlice';
import { fetchCustomers } from '@/store/slices/customersSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { SubscriptionSheet } from '@/components/subscriptions/SubscriptionSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft,
  CreditCard,
  Calendar,
  User,
  Mail,
  Package,
  Clock,
  DollarSign,
  Pause,
  Play,
  XCircle,
  RefreshCw,
  Pencil,
  Receipt,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import type { SubscriptionStatus, InvoiceStatus } from '@/types';
import { toast } from 'sonner';

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { subscriptions, isLoading } = useAppSelector((state) => state.subscriptions);
  const { invoices, isLoading: invoicesLoading } = useAppSelector((state) => state.invoices);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (subscriptions.length === 0) {
      dispatch(fetchSubscriptions({}));
    }
    dispatch(fetchInvoices({}));
    dispatch(fetchCustomers({}));
    dispatch(fetchProducts({}));
  }, [dispatch, subscriptions.length]);

  const subscription = subscriptions.find((s) => s.id === id);
  
  // Filter invoices linked to this subscription
  const linkedInvoices = invoices.filter((inv) => inv.subscriptionId === id);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'trialing':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'past_due':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'canceled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'paused':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getInvoiceStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'open':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'draft':
        return 'bg-muted text-muted-foreground border-muted';
      case 'void':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'uncollectible':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getInvoiceStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'open':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'void':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getIntervalLabel = (count: number, interval: string) => {
    if (count === 1) return interval;
    return `${count} ${interval}s`;
  };

  const handleCancel = async () => {
    if (subscription) {
      await dispatch(cancelSubscription(subscription.id));
      toast.success('Subscription canceled');
    }
  };

  const handlePause = async () => {
    if (subscription) {
      await dispatch(pauseSubscription(subscription.id));
      toast.success('Subscription paused');
    }
  };

  const handleResume = async () => {
    if (subscription) {
      await dispatch(resumeSubscription(subscription.id));
      toast.success('Subscription resumed');
    }
  };

  const handleEdit = () => {
    setIsSheetOpen(true);
  };

  if (isLoading || !subscription) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/subscriptions')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {subscription.productName || `${subscription.items?.length || 0} Products`}
              </h1>
              <Badge variant="outline" className={getStatusColor(subscription.status)}>
                {subscription.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{subscription.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {subscription.status !== 'canceled' && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {subscription.status === 'active' && (
            <Button variant="outline" size="sm" onClick={handlePause}>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          {subscription.status === 'paused' && (
            <Button variant="outline" size="sm" onClick={handleResume}>
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
          {subscription.status !== 'canceled' && (
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Subscription Details</CardTitle>
              <CardDescription>Overview of this subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Customer</p>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-lg flex-shrink-0">
                    {subscription.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{subscription.customerName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{subscription.customerEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Products/Items */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products ({subscription.items?.length || 1} items)
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Tax</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscription.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{item.productId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice, subscription.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.taxName ? (
                              <span className="text-muted-foreground">
                                {item.taxName} ({item.taxRate}%)
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.total, subscription.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Totals Summary */}
                <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subscription.subtotal, subscription.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(subscription.taxTotal, subscription.currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">
                      {formatCurrency(subscription.amount, subscription.currency)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{getIntervalLabel(subscription.intervalCount, subscription.interval)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Billing Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(subscription.amount, subscription.currency)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{getIntervalLabel(subscription.intervalCount, subscription.interval)}
                    </span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm font-medium">Billing Cycle</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    Every {getIntervalLabel(subscription.intervalCount, subscription.interval)}
                  </p>
                  <p className="text-sm text-muted-foreground">Recurring</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Invoices */}
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Invoices
                  </CardTitle>
                  <CardDescription>All invoices generated from this subscription</CardDescription>
                </div>
                <Badge variant="secondary">{linkedInvoices.length} invoices</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : linkedInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No invoices generated yet</p>
                  <p className="text-xs mt-1">Invoices will appear here after each billing cycle</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/invoices`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {getInvoiceStatusIcon(invoice.status)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{invoice.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(invoice.amount, invoice.currency)}</p>
                          <Badge variant="outline" className={`text-xs ${getInvoiceStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Period */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Current Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Start</p>
                <p className="font-medium">{format(new Date(subscription.currentPeriodStart), 'MMMM d, yyyy')}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">End</p>
                <p className="font-medium">{format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{format(new Date(subscription.startDate), 'MMM d, yyyy')}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{format(new Date(subscription.createdAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{format(new Date(subscription.updatedAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
              {subscription.canceledAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Canceled</p>
                    <p className="font-medium text-destructive">
                      {format(new Date(subscription.canceledAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to={`/customers`}>
                  <User className="mr-2 h-4 w-4" />
                  View Customer
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to={`/invoices`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  View All Invoices
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to={`/products`}>
                  <Package className="mr-2 h-4 w-4" />
                  View Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Subscription Sheet */}
      <SubscriptionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        subscription={subscription}
        mode="edit"
      />
    </div>
  );
}
