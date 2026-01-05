import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  fetchInvoices,
  sendInvoice,
  markInvoicePaid,
  voidInvoice,
  deleteInvoice,
} from '@/store/slices/invoicesSlice';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MoreHorizontal, 
  Send,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/types';
import { format } from 'date-fns';

export default function InvoicesPage() {
  const dispatch = useAppDispatch();
  const { invoices, isLoading, pagination } = useAppSelector((state) => state.invoices);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [actionType, setActionType] = useState<'send' | 'paid' | 'void' | 'delete' | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    dispatch(fetchInvoices({}));
  }, [dispatch]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'open':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'draft':
        return 'bg-muted text-muted-foreground border-muted';
      case 'void':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'uncollectible':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = async () => {
    if (!selectedInvoice || !actionType) return;

    switch (actionType) {
      case 'send':
        await dispatch(sendInvoice(selectedInvoice.id));
        break;
      case 'paid':
        await dispatch(markInvoicePaid(selectedInvoice.id));
        break;
      case 'void':
        await dispatch(voidInvoice(selectedInvoice.id));
        break;
      case 'delete':
        await dispatch(deleteInvoice(selectedInvoice.id));
        break;
    }

    setSelectedInvoice(null);
    setActionType(null);
  };

  const openAction = (invoice: Invoice, action: 'send' | 'paid' | 'void' | 'delete') => {
    setSelectedInvoice(invoice);
    setActionType(action);
  };

  const getActionDialogContent = () => {
    switch (actionType) {
      case 'send':
        return {
          title: 'Send Invoice',
          description: `Send this invoice to ${selectedInvoice?.customerEmail}?`,
          action: 'Send Invoice',
          variant: 'default' as const,
        };
      case 'paid':
        return {
          title: 'Mark as Paid',
          description: `Mark this invoice as paid? This will record the payment as of now.`,
          action: 'Mark as Paid',
          variant: 'default' as const,
        };
      case 'void':
        return {
          title: 'Void Invoice',
          description: `Are you sure you want to void this invoice? This action cannot be undone.`,
          action: 'Void Invoice',
          variant: 'destructive' as const,
        };
      case 'delete':
        return {
          title: 'Delete Invoice',
          description: `Are you sure you want to delete this invoice? This action cannot be undone.`,
          action: 'Delete Invoice',
          variant: 'destructive' as const,
        };
      default:
        return { title: '', description: '', action: '', variant: 'default' as const };
    }
  };

  const dialogContent = getActionDialogContent();

  // Mobile card view
  const MobileInvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <div 
      className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setViewInvoice(invoice)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">{invoice.customerName}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{invoice.id}</p>
          </div>
        </div>
        <Badge variant="outline" className={`${getStatusColor(invoice.status)} flex-shrink-0`}>
          {invoice.status}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">Due {format(new Date(invoice.dueDate), 'MMM d')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Invoices</h1>
        <p className="text-sm sm:text-base text-muted-foreground">View and manage customer invoices</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {invoices.filter(i => i.status === 'paid').length} paid
              </Badge>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                {invoices.filter(i => i.status === 'open').length} open
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
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="sm:hidden">
                {filteredInvoices.map((invoice) => (
                  <MobileInvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead className="hidden md:table-cell">Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium font-mono text-foreground truncate">{invoice.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{invoice.customerName}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{invoice.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
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
                              <DropdownMenuItem onClick={() => setViewInvoice(invoice)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem onClick={() => openAction(invoice, 'send')}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send
                                </DropdownMenuItem>
                              )}
                              {invoice.status === 'open' && (
                                <DropdownMenuItem onClick={() => openAction(invoice, 'paid')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {invoice.status !== 'void' && invoice.status !== 'paid' && (
                                <DropdownMenuItem 
                                  onClick={() => openAction(invoice, 'void')}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Void
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => openAction(invoice, 'delete')}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
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

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice {viewInvoice?.id}
            </DialogTitle>
            <DialogDescription>
              Created on {viewInvoice && format(new Date(viewInvoice.createdAt), 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Bill to</p>
                  <p className="font-medium">{viewInvoice.customerName}</p>
                  <p className="text-sm text-muted-foreground truncate">{viewInvoice.customerEmail}</p>
                </div>
                <Badge variant="outline" className={getStatusColor(viewInvoice.status)}>
                  {viewInvoice.status}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Items</p>
                {viewInvoice.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unitPrice, viewInvoice.currency)}
                      </p>
                    </div>
                    <span className="font-medium flex-shrink-0 ml-2">{formatCurrency(item.amount, viewInvoice.currency)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">{formatCurrency(viewInvoice.amount, viewInvoice.currency)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Due {format(new Date(viewInvoice.dueDate), 'MMMM d, yyyy')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
