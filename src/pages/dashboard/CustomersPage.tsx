import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  setCustomers,
  setPagination,
} from "@/store/slices/customersSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import type { Customer } from "@/types";
import { format } from "date-fns";
import { useDispatch } from "react-redux";

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  const dispatchState = useDispatch();
  const { customers, isLoading, pagination } = useAppSelector(
    (state) => state.customers,
  );
  const workspaceId = useAppSelector((state) => state.auth.workspaceId);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSomethingChanged, setIsSomethingChanged] = useState(false);
  const [selectedCustomer, setSelectedCustomerLocal] =
    useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    phone: "",
    countryCode: null,
    taxId: "",
    address: "",
  });

  useEffect(() => {
    if (!workspaceId) return;
    async function fetchData() {
      const result = await dispatch(fetchCustomers({ workspaceId }));
      if (fetchCustomers.fulfilled.match(result)) {
        const customers: Customer[] = [];
        const pagination = {
          page: result.payload.page,
          pageSize: result.payload.pageSize,
          total: result.payload.total,
          totalPages: result.payload.totalPages,
        };

        result.payload.data.forEach((c: Customer) => {
          customers.push(c);
        });

        dispatchState(setCustomers(customers));
        dispatchState(setPagination(pagination));
      }
    }
    fetchData();
  }, [isSomethingChanged, workspaceId, dispatch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = async () => {
    await dispatch(
      createCustomer({
        workspaceId: workspaceId,
        name: formData.name,
        email: formData.email,
        contactNumber: formData.phone,
        companyName: formData.companyName,
        countryCode: formData.countryCode,
        billingAddress: formData.address,
        taxId: formData.taxId,
      }),
    );

    setIsCreateOpen(false);
    setFormData({
      name: "",
      email: "",
      companyName: "",
      phone: "",
      countryCode: "",
      taxId: "",
      address: "",
    });
    setIsSomethingChanged(!isSomethingChanged);
  };

  const handleUpdate = async () => {
    await dispatch(
      updateCustomer({
        clientId: selectedCustomer.clientId,
        data: {
          workspaceId: workspaceId,
          name: formData.name,
          email: formData.email,
          contactNumber: formData.phone,
          companyName: formData.companyName,
          countryCode: formData.countryCode,
          billingAddress: formData.address,
          taxId: formData.taxId,
        },
      }),
    );

    setIsEditOpen(false);
    setFormData({
      name: "",
      email: "",
      companyName: "",
      phone: "",
      countryCode: "",
      taxId: "",
      address: "",
    });
    setIsSomethingChanged(!isSomethingChanged);
  };

  const handleDelete = async () => {
    if (selectedCustomer) {
      await dispatch(deleteCustomer(selectedCustomer.clientId));
      setIsDeleteOpen(false);
      setSelectedCustomerLocal(null);
    }
  };

  const openEdit = (customer: Customer) => {
    setSelectedCustomerLocal(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      companyName: customer.companyName || "",
      phone: customer.contactNumber || "",
      countryCode: customer.countryCode || null,
      taxId: customer.taxId || "",
      address: customer.billingAddress || "",
    });
    setIsEditOpen(true);
  };

  const openDelete = (customer: Customer) => {
    setSelectedCustomerLocal(customer);
    setIsDeleteOpen(true);
  };

  // Mobile card view
  const MobileCustomerCard = ({ customer }: { customer: Customer }) => (
    <div className="p-4 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">
              {customer.name}
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(customer)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDelete(customer)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-medium">
          {formatCurrency(customer.totalSpent)}
        </span>
        <Badge variant="secondary">
          {customer.subscriptions} subscriptions
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Customers
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your customer base
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="w-fit">
              {pagination.total} customers
            </Badge>
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
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="sm:hidden">
                {filteredCustomers.map((customer, i) => (
                  <MobileCustomerCard key={i} customer={customer} />
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Contact
                      </TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Subscriptions
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {customer.name}
                              </p>
                              <p className="text-sm text-muted-foreground truncate md:hidden">
                                {customer.email}
                              </p>
                              <p className="text-sm text-muted-foreground hidden md:block">
                                {customer.clientId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {customer.email}
                              </span>
                            </div>
                            {customer.contactNumber && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{customer.contactNumber}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary">
                            {customer.subscriptions}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden lg:table-cell">
                          {customer.createdAt
                            ? format(
                                new Date(customer.createdAt),
                                "MMM d, yyyy",
                              )
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEdit(customer)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDelete(customer)}
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer's information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Company or person name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="billing@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="ABC Private Limited"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc">Phone</Label>
              <Input
                id="edit-cc"
                value={formData.countryCode}
                onChange={(e) =>
                  setFormData({ ...formData, countryCode: e.target.value })
                }
              />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 555-0100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax Id</Label>
              <Input
                id="taxId"
                type="taxId"
                value={formData.taxId}
                onChange={(e) =>
                  setFormData({ ...formData, taxId: e.target.value })
                }
                placeholder="09AAHKE6240J1ZG"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Main St, City, Country"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} className="w-full sm:w-auto">
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer's information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-companyName">Company Name</Label>
              <Input
                id="edit-companyName"
                type="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cc">Phone</Label>
              <Input
                id="edit-cc"
                value={formData.countryCode}
                onChange={(e) =>
                  setFormData({ ...formData, countryCode: e.target.value })
                }
              />
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-taxId">Tax Id</Label>
              <Input
                id="edit-taxId"
                type="taxId"
                value={formData.taxId}
                onChange={(e) =>
                  setFormData({ ...formData, taxId: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            {/*Change handler in future*/}
            <Button onClick={() => handleUpdate()} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCustomer?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
