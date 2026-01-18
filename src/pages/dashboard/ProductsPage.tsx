import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProducts,
  setProductPagination,
} from "@/store/slices/productsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Package,
  DollarSign,
} from "lucide-react";
import type { Product } from "@/types";
import { useDispatch } from "react-redux";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const dispatchState = useDispatch();
  const { products, isLoading, pagination } = useAppSelector(
    (state) => state.products,
  );
  const workspaceId = useAppSelector((state) => state.auth.workspaceId);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSomethingChanged, setIsSomethingChanged] = useState(false);
  const [prices, setPrices] = useState<any[]>([
    { interval: "MONTH", amount: 0 },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currency: "USD",
    active: true,
    productCategory: "RECURRING",
  });

  useEffect(() => {
    if (!workspaceId) return;
    async function fetchData() {
      const result = await dispatch(fetchProducts({ workspaceId }));
      if (fetchProducts.fulfilled.match(result)) {
        const products: Product[] = [];
        const pagination = {
          page: result.payload.page,
          pageSize: result.payload.pageSize,
          total: result.payload.total,
          totalPages: result.payload.totalPages,
        };

        result.payload.data.forEach((c: Product) => {
          products.push(c);
        });

        dispatchState(setProducts(products));
        dispatchState(setProductPagination(pagination));
      }
    }
    fetchData();
  }, [isSomethingChanged, workspaceId, dispatch]);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMinPrice = (priceMap: Record<string, number>) =>
    Math.min(...Object.values(priceMap));

  const filteredProducts = (products ?? []).filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = async () => {
    const pricingMap = Object.fromEntries(
      prices.map((p) => [p.interval, p.amount]),
    );
    await dispatch(
      createProduct({ ...formData, price: pricingMap, workspaceId }),
    );
    setIsCreateOpen(false);
    resetForm();
    setIsSomethingChanged(!isSomethingChanged);
  };

  const handleEdit = async () => {
    if (selectedProduct) {
      const pricingMap = Object.fromEntries(
        prices.map((p) => [p.interval, p.amount]),
      );
      await dispatch(
        updateProduct({
          id: selectedProduct.productId,
          data: { ...formData, price: pricingMap, workspaceId },
        }),
      );
      setIsEditOpen(false);
      setSelectedProduct(null);
      resetForm();
      setIsSomethingChanged(!isSomethingChanged);
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      await dispatch(deleteProduct(selectedProduct.productId));
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      currency: "USD",
      active: true,
      productCategory: "Recurring",
    });
    setPrices([{ interval: "MONTH", amount: 0 }]);
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      currency: product.currency,
      active: product.active,
      productCategory: product.productCategory,
    });
    setPrices(
      Object.entries(product.price).map(([interval, amount]) => ({
        interval: interval as "DAY" | "WEEK" | "MONTH" | "YEAR",
        amount: Number(amount),
      })),
    );
    setIsEditOpen(true);
  };

  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const addPrice = () => {
    setPrices([...prices, { interval: "MONTH", amount: 0 }]);
  };

  const updatePrice = (index: number, key: string, value: any) => {
    const copy = [...prices];
    copy[index] = { ...copy[index], [key]: value };
    setPrices(copy);
  };

  const removePrice = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Products
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage your product catalog
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="w-fit">
          {pagination.total} products
        </Badge>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, i) => (
            <Card
              key={i}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3 p-4 sm:p-6 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`p-2.5 sm:p-3 rounded-lg flex-shrink-0 ${product.active ? "bg-primary/10" : "bg-muted"}`}
                    >
                      <Package
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${product.active ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {product.id}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(product)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDelete(product)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-4 sm:p-6 sm:pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold text-foreground">
                      {product.currency}
                      {/* {formatCurrency(
                        getMinPrice(product.price),
                        product.currency,
                      )} */}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / month
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {product.productCategory}
                    </Badge>
                    <Badge
                      variant={product.active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Pro Plan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your product..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Pricing</Label>
                <Button variant="outline" size="sm" onClick={addPrice}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {prices.map((price, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end border rounded-lg p-3"
                >
                  {/* Interval */}
                  <div className="space-y-1">
                    <Label className="text-xs">Interval</Label>
                    <Select
                      value={price.interval}
                      onValueChange={(v) => updatePrice(index, "interval", v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">Day</SelectItem>
                        <SelectItem value="WEEK">Week</SelectItem>
                        <SelectItem value="MONTH">Month</SelectItem>
                        <SelectItem value="YEAR">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Amount ({formData.currency})
                    </Label>
                    <Input
                      type="number"
                      className="h-9"
                      value={price.amount}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        updatePrice(index, "amount", Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Delete */}
                  {prices.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePrice(index)}
                      className="text-destructive h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.productCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, productCategory: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECURRING">Recurring</SelectItem>
                  <SelectItem value="ONE_TIME">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Make this product available for purchase
                </p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
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
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Pricing</Label>
                <Button variant="outline" size="sm" onClick={addPrice}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {prices.map((price, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end border rounded-lg p-3"
                >
                  {/* Interval */}
                  <div className="space-y-1">
                    <Label className="text-xs">Interval</Label>
                    <Select
                      value={price.interval}
                      onValueChange={(v) => updatePrice(index, "interval", v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">Day</SelectItem>
                        <SelectItem value="WEEK">Week</SelectItem>
                        <SelectItem value="MONTH">Month</SelectItem>
                        <SelectItem value="YEAR">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Amount ({formData.currency})
                    </Label>
                    <Input
                      type="number"
                      className="h-9"
                      value={price.amount}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        updatePrice(index, "amount", Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Delete */}
                  {prices.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePrice(index)}
                      className="text-destructive h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.productCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, productCategory: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECURRING">Recurring</SelectItem>
                  <SelectItem value="ONE_TIME">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Make this product available for purchase
                </p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
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
            <Button onClick={handleEdit} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This
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
