import { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchCustomers } from '@/store/slices/customersSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { fetchTaxes } from '@/store/slices/taxesSlice';
import { createSubscription, updateSubscription } from '@/store/slices/subscriptionsSlice';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon,
  User,
  Package,
  Receipt,
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { toast } from 'sonner';
import type { Subscription, SubscriptionItem, SubscriptionInterval, Customer, Product, Tax } from '@/types';
import { cn } from '@/lib/utils';

interface SubscriptionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  mode: 'create' | 'edit';
}

interface LineItem {
  id: string;
  productId: string;
  quantity: number;
  taxId: string;
}

export function SubscriptionSheet({ open, onOpenChange, subscription, mode }: SubscriptionSheetProps) {
  const dispatch = useAppDispatch();
  const { customers } = useAppSelector((state) => state.customers);
  const { products } = useAppSelector((state) => state.products);
  const { taxes } = useAppSelector((state) => state.taxes);

  const [customerId, setCustomerId] = useState('');
  const [intervalCount, setIntervalCount] = useState(1);
  const [interval, setInterval] = useState<SubscriptionInterval>('month');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (open) {
      if (customers.length === 0) dispatch(fetchCustomers({}));
      if (products.length === 0) dispatch(fetchProducts({}));
      if (taxes.length === 0) dispatch(fetchTaxes());
    }
  }, [open, dispatch, customers.length, products.length, taxes.length]);

  // Initialize form when editing
  useEffect(() => {
    if (mode === 'edit' && subscription) {
      setCustomerId(subscription.customerId);
      setIntervalCount(subscription.intervalCount);
      setInterval(subscription.interval);
      setStartDate(new Date(subscription.startDate));
      setLineItems(
        subscription.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          taxId: item.taxId || '',
        }))
      );
    } else if (mode === 'create') {
      resetForm();
    }
  }, [mode, subscription, open]);

  const resetForm = () => {
    setCustomerId('');
    setIntervalCount(1);
    setInterval('month');
    setStartDate(new Date());
    setLineItems([]);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `li_${crypto.randomUUID().slice(0, 8)}`,
        productId: '',
        quantity: 1,
        taxId: '',
      },
    ]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  // Calculate totals
  const calculations = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;

    const items: SubscriptionItem[] = lineItems
      .filter((li) => li.productId)
      .map((li) => {
        const product = products.find((p) => p.productId === li.productId);
        const tax = taxes.find((t) => t.id === li.taxId);
        
        if (!product) {
          return null;
        }

        const itemSubtotal = product.price * li.quantity;
        const itemTaxAmount = tax ? (itemSubtotal * tax.rate) / 100 : 0;
        const itemTotal = itemSubtotal + itemTaxAmount;

        subtotal += itemSubtotal;
        taxTotal += itemTaxAmount;

        return {
          id: li.id,
          productId: li.productId,
          productName: product.name,
          quantity: li.quantity,
          unitPrice: product.price,
          taxId: tax?.id,
          taxName: tax?.name,
          taxRate: tax?.rate,
          subtotal: itemSubtotal,
          taxAmount: itemTaxAmount,
          total: itemTotal,
        };
      })
      .filter(Boolean) as SubscriptionItem[];

    return {
      items,
      subtotal,
      taxTotal,
      total: subtotal + taxTotal,
    };
  }, [lineItems, products, taxes]);

  const calculatePeriodEnd = (start: Date, count: number, intervalType: SubscriptionInterval): Date => {
    switch (intervalType) {
      case 'day':
        return addDays(start, count);
      case 'week':
        return addWeeks(start, count);
      case 'month':
        return addMonths(start, count);
      case 'year':
        return addYears(start, count);
      default:
        return addMonths(start, count);
    }
  };

  const handleSubmit = async () => {
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (lineItems.length === 0 || calculations.items.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setIsSubmitting(true);

    try {
      const customer = customers.find((c) => c.clientId === customerId);
      if (!customer) {
        toast.error('Customer not found');
        return;
      }

      const periodEnd = calculatePeriodEnd(startDate, intervalCount, interval);
      
      // Generate product name summary
      const productName = calculations.items.length === 1
        ? calculations.items[0].productName
        : `${calculations.items[0].productName} + ${calculations.items.length - 1} more`;

      const subscriptionData = {
        customerId: customer.clientId,
        customerName: customer.name,
        customerEmail: customer.email,
        productId: calculations.items[0]?.productId,
        productName,
        items: calculations.items,
        status: 'active' as const,
        amount: calculations.total,
        subtotal: calculations.subtotal,
        taxTotal: calculations.taxTotal,
        currency: 'USD',
        intervalCount,
        interval,
        startDate: startDate.toISOString(),
        currentPeriodStart: startDate.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (mode === 'create') {
        await dispatch(createSubscription(subscriptionData));
        toast.success('Subscription created successfully');
      } else if (subscription) {
        await dispatch(updateSubscription({ 
          id: subscription.id, 
          data: subscriptionData 
        }));
        toast.success('Subscription updated successfully');
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getIntervalLabel = (count: number, int: SubscriptionInterval) => {
    const label = count === 1 ? int : `${int}s`;
    return `Every ${count} ${label}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {mode === 'create' ? 'Create Subscription' : 'Update Subscription'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Set up a new recurring subscription for a customer.'
              : 'Modify the subscription details, products, or billing interval.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </Label>
              <Select value={customerId} onValueChange={setCustomerId} disabled={mode === 'edit'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.clientId} value={customer.clientId}>
                      <div className="flex flex-col">
                        <span>{customer.name}</span>
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products
                </Label>
                <Button variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </div>

              {lineItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No products added yet</p>
                  <Button variant="ghost" size="sm" onClick={addLineItem} className="mt-2">
                    Add your first product
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg space-y-3 bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Item {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Product</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateLineItem(item.id, 'productId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.filter((p) => p.active).map((product) => (
                                <SelectItem key={product.productId} value={product.productId}>
                                  <div className="flex items-center justify-between gap-4 w-full">
                                    <span>{product.name}</span>
                                    <span className="text-muted-foreground">
                                      {formatCurrency(product.price, product.currency)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Tax</Label>
                            <Select
                              value={item.taxId || 'none'}
                              onValueChange={(value) => updateLineItem(item.id, 'taxId', value === 'none' ? '' : value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="No tax" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No tax</SelectItem>
                                {taxes.filter((t) => t.active).map((tax) => (
                                  <SelectItem key={tax.id} value={tax.id}>
                                    {tax.name} ({tax.rate}%)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Billing Interval */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Billing Interval
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Every</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={intervalCount}
                    onChange={(e) => setIntervalCount(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Period</Label>
                  <Select value={interval} onValueChange={(v) => setInterval(v as SubscriptionInterval)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day(s)</SelectItem>
                      <SelectItem value="week">Week(s)</SelectItem>
                      <SelectItem value="month">Month(s)</SelectItem>
                      <SelectItem value="year">Year(s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Billing occurs {getIntervalLabel(intervalCount, interval).toLowerCase()}
              </p>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            {/* Summary */}
            {calculations.items.length > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">Summary</h4>
                <div className="space-y-2 text-sm">
                  {calculations.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item.productName} × {item.quantity}
                        {item.taxName && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {item.taxName}
                          </Badge>
                        )}
                      </span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(calculations.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>{formatCurrency(calculations.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base pt-2">
                    <span>Total {getIntervalLabel(intervalCount, interval).toLowerCase()}</span>
                    <span>{formatCurrency(calculations.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !customerId || calculations.items.length === 0}
            className="w-full sm:flex-1"
          >
            {isSubmitting
              ? 'Saving...'
              : mode === 'create'
              ? 'Create Subscription'
              : 'Update Subscription'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
