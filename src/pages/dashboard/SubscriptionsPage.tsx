import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  fetchSubscriptions,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
} from '@/store/slices/subscriptionsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MoreHorizontal, 
  Pause,
  Play,
  XCircle,
  CreditCard,
  Calendar,
} from 'lucide-react';
import type { Subscription, SubscriptionStatus } from '@/types';
import { format } from 'date-fns';

export default function SubscriptionsPage() {
  const dispatch = useAppDispatch();
  const { subscriptions, isLoading, pagination } = useAppSelector((state) => state.subscriptions);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'pause' | 'resume' | null>(null);

  useEffect(() => {
    dispatch(fetchSubscriptions({}));
  }, [dispatch]);

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

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = async () => {
    if (!selectedSubscription || !actionType) return;

    switch (actionType) {
      case 'cancel':
        await dispatch(cancelSubscription(selectedSubscription.id));
        break;
      case 'pause':
        await dispatch(pauseSubscription(selectedSubscription.id));
        break;
      case 'resume':
        await dispatch(resumeSubscription(selectedSubscription.id));
        break;
    }

    setSelectedSubscription(null);
    setActionType(null);
  };

  const openAction = (subscription: Subscription, action: 'cancel' | 'pause' | 'resume') => {
    setSelectedSubscription(subscription);
    setActionType(action);
  };

  const getActionDialogContent = () => {
    switch (actionType) {
      case 'cancel':
        return {
          title: 'Cancel Subscription',
          description: `Are you sure you want to cancel the subscription for "${selectedSubscription?.customerName}"? The subscription will remain active until the end of the current billing period.`,
          action: 'Cancel Subscription',
          variant: 'destructive' as const,
        };
      case 'pause':
        return {
          title: 'Pause Subscription',
          description: `Are you sure you want to pause the subscription for "${selectedSubscription?.customerName}"? Billing will be paused until you resume.`,
          action: 'Pause Subscription',
          variant: 'default' as const,
        };
      case 'resume':
        return {
          title: 'Resume Subscription',
          description: `Are you sure you want to resume the subscription for "${selectedSubscription?.customerName}"? Billing will resume immediately.`,
          action: 'Resume Subscription',
          variant: 'default' as const,
        };
      default:
        return { title: '', description: '', action: '', variant: 'default' as const };
    }
  };

  const dialogContent = getActionDialogContent();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground">Manage recurring billing for your customers</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {subscriptions.filter(s => s.status === 'active').length} active
              </Badge>
              <Badge variant="secondary">{pagination.total} total</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Current Period</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {subscription.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{subscription.customerName}</p>
                          <p className="text-sm text-muted-foreground">{subscription.customerEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>{subscription.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(subscription.status)}>
                        {subscription.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </span>
                      <span className="text-muted-foreground">/{subscription.interval}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(subscription.currentPeriodStart), 'MMM d')} - {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {subscription.status === 'active' && (
                            <>
                              <DropdownMenuItem onClick={() => openAction(subscription, 'pause')}>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {subscription.status === 'paused' && (
                            <>
                              <DropdownMenuItem onClick={() => openAction(subscription, 'resume')}>
                                <Play className="mr-2 h-4 w-4" />
                                Resume
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {subscription.status !== 'canceled' && (
                            <DropdownMenuItem 
                              onClick={() => openAction(subscription, 'cancel')}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction}
              className={dialogContent.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {dialogContent.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
