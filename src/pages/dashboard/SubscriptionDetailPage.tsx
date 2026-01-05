import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchSubscriptions, cancelSubscription, pauseSubscription, resumeSubscription } from '@/store/slices/subscriptionsSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';
import { format } from 'date-fns';
import type { SubscriptionStatus } from '@/types';
import { toast } from 'sonner';

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { subscriptions, isLoading } = useAppSelector((state) => state.subscriptions);

  useEffect(() => {
    if (subscriptions.length === 0) {
      dispatch(fetchSubscriptions({}));
    }
  }, [dispatch, subscriptions.length]);

  const subscription = subscriptions.find((s) => s.id === id);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
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
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{subscription.productName}</h1>
              <Badge variant="outline" className={getStatusColor(subscription.status)}>
                {subscription.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{subscription.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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

              {/* Product Info */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Product</p>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{subscription.productName}</p>
                    <p className="text-sm text-muted-foreground font-mono truncate">{subscription.productId}</p>
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
                    <span className="text-sm font-normal text-muted-foreground">/{subscription.interval}</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm font-medium">Billing Cycle</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {subscription.interval}ly
                  </p>
                  <p className="text-sm text-muted-foreground">Recurring</p>
                </div>
              </div>
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
                  View Invoices
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
