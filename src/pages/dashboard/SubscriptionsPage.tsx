import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCustomers } from '@/store/slices/customersSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { 
  fetchSubscriptions,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
} from '@/store/slices/subscriptionsSlice';
import { SubscriptionSheet } from '@/components/subscriptions/SubscriptionSheet';
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
  Eye,
  Plus,
  Pencil,
} from 'lucide-react';
import type { Subscription, SubscriptionStatus } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SubscriptionsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { subscriptions, isLoading, pagination } = useAppSelector((state) => state.subscriptions);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'pause' | 'resume' | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create');
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    dispatch(fetchSubscriptions({}));
    dispatch(fetchCustomers({}));
    dispatch(fetchProducts({}));
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

  const getIntervalLabel = (count: number, interval: string) => {
    if (count === 1) return interval;
    return `${count} ${interval}s`;
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = async () => {
    if (!selectedSubscription || !actionType) return;

    switch (actionType) {
      case 'cancel':
        await dispatch(cancelSubscription(selectedSubscription.id));
        toast.success('Subscription canceled');
        break;
      case 'pause':
        await dispatch(pauseSubscription(selectedSubscription.id));
        toast.success('Subscription paused');
        break;
      case 'resume':
        await dispatch(resumeSubscription(selectedSubscription.id));
        toast.success('Subscription resumed');
        break;
    }

    setSelectedSubscription(null);
    setActionType(null);
  };

  const handleCreate = () => {
    setSheetMode('create');
    setEditingSubscription(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setSheetMode('edit');
    setEditingSubscription(subscription);
    setIsSheetOpen(true);
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
          description: `Are you sure you want to cancel the subscription for "${selectedSubscription?.customerName}"?`,
          action: 'Cancel Subscription',
          variant: 'destructive' as const,
        };
      case 'pause':
        return {
          title: 'Pause Subscription',
          description: `Are you sure you want to pause the subscription for "${selectedSubscription?.customerName}"?`,
          action: 'Pause Subscription',
          variant: 'default' as const,
        };
      case 'resume':
        return {
          title: 'Resume Subscription',
          description: `Are you sure you want to resume the subscription for "${selectedSubscription?.customerName}"?`,
          action: 'Resume Subscription',
          variant: 'default' as const,
        };
      default:
        return { title: '', description: '', action: '', variant: 'default' as const };
    }
  };

  const dialogContent = getActionDialogContent();

  const MobileSubscriptionCard = ({ subscription }: { subscription: Subscription }) => (
    <div 
      className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => navigate(`/subscriptions/${subscription.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
            {subscription.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">{subscription.customerName}</p>
            <p className="text-sm text-muted-foreground truncate">
              {subscription.items?.length || 1} item(s)
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`${getStatusColor(subscription.status)} flex-shrink-0`}>
          {subscription.status.replace('_', ' ')}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-medium">
          {formatCurrency(subscription.amount, subscription.currency)}/{getIntervalLabel(subscription.intervalCount, subscription.interval)}
        </span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">
            {format(new Date(subscription.currentPeriodEnd), 'MMM d')}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage recurring billing for your customers</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Subscription
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {subscriptions.filter(s => s.status === 'active').length} active
              </Badge>
              <Badge variant="secondary">{pagination.total} total</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isLoading ? (
            <div className="space-y-4 p-4 sm:p-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="sm:hidden">
                {filteredSubscriptions.map((subscription) => (
                  <MobileSubscriptionCard key={subscription.id} subscription={subscription} />
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden lg:table-cell">Billing</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => (
                      <TableRow 
                        key={subscription.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/subscriptions/${subscription.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
                              {subscription.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{subscription.customerName}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">{subscription.customerEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate max-w-[150px]">
                              {subscription.items?.length || 1} item(s)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(subscription.status)}>
                            {subscription.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium whitespace-nowrap">
                            {formatCurrency(subscription.amount, subscription.currency)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            Every {getIntervalLabel(subscription.intervalCount, subscription.interval)}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/subscriptions/${subscription.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(subscription)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {subscription.status === 'active' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openAction(subscription, 'pause')}>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause
                                  </DropdownMenuItem>
                                </>
                              )}
                              {subscription.status === 'paused' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openAction(subscription, 'resume')}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Resume
                                  </DropdownMenuItem>
                                </>
                              )}
                              {subscription.status !== 'canceled' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openAction(subscription, 'cancel')}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscription Sheet */}
      <SubscriptionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        subscription={editingSubscription}
        mode={sheetMode}
      />

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction}
              className={`w-full sm:w-auto ${dialogContent.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}
            >
              {dialogContent.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
