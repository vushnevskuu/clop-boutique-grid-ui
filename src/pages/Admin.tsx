import { useState, useEffect, useCallback } from "react";
import { supabase, Product, ProductImage, SizeChart } from "@/lib/supabase";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Plus, X } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Форма
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    price: "",
    size: "",
    image: "",
    hover_image: "",
  });
  
  const [productImages, setProductImages] = useState<string[]>([]);
  const [sizeChart, setSizeChart] = useState<SizeChart[]>([]);

  // Загрузка товаров
  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error(`Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Загрузка изображений товара
  const loadProductImages = useCallback(async (productId: string) => {
    const { data } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("image_order", { ascending: true });
    
    if (data) {
      setProductImages(data.map(img => img.image_url));
    }
  }, []);

  // Загрузка размерной таблицы
  const loadSizeChart = useCallback(async (productId: string) => {
    const { data } = await supabase
      .from("size_charts")
      .select("*")
      .eq("product_id", productId)
      .order("size_label", { ascending: true });
    
    if (data) {
      setSizeChart(data);
    }
  }, []);

  // Загрузка изображения в Storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Сохранение товара
  const handleSave = async () => {
    try {
      if (!formData.title || !formData.price || !formData.image) {
        toast.error("Заполните обязательные поля");
        return;
      }

      let productId: string;

      if (editingProduct) {
        // Обновление
        const { data, error } = await supabase
          .from("products")
          .update({
            title: formData.title,
            brand: formData.brand || null,
            price: formData.price,
            size: formData.size || null,
            image: formData.image,
            hover_image: formData.hover_image || null,
          })
          .eq("id", editingProduct.id)
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      } else {
        // Создание
        const { data, error } = await supabase
          .from("products")
          .insert({
            title: formData.title,
            brand: formData.brand || null,
            price: formData.price,
            size: formData.size || null,
            image: formData.image,
            hover_image: formData.hover_image || null,
          })
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Сохранение дополнительных изображений
      if (productImages.length > 0) {
        // Удаляем старые
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);

        // Добавляем новые
        const imagesToInsert = productImages.map((url, index) => ({
          product_id: productId,
          image_url: url,
          image_order: index,
        }));

        await supabase.from("product_images").insert(imagesToInsert);
      }

      // Сохранение размерной таблицы
      if (sizeChart.length > 0) {
        // Удаляем старые
        await supabase
          .from("size_charts")
          .delete()
          .eq("product_id", productId);

        // Добавляем новые
        const chartsToInsert = sizeChart.map(chart => ({
          product_id: productId,
          size_label: chart.size_label,
          chest: chart.chest || null,
          waist: chart.waist || null,
          length: chart.length || null,
        }));

        await supabase.from("size_charts").insert(chartsToInsert);
      }

      toast.success(editingProduct ? "Товар обновлен" : "Товар создан");
      resetForm();
      loadProducts();
    } catch (error: any) {
      toast.error(`Ошибка: ${error.message}`);
    }
  };

  // Удаление товара
  const handleDelete = async (id: string) => {
    if (!confirm("Удалить товар?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Товар удален");
      loadProducts();
    } catch (error: any) {
      toast.error(`Ошибка: ${error.message}`);
    }
  };

  // Редактирование товара
  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      brand: product.brand || "",
      price: product.price,
      size: product.size || "",
      image: product.image,
      hover_image: product.hover_image || "",
    });
    setShowForm(true);
    await loadProductImages(product.id);
    await loadSizeChart(product.id);
  };

  // Сброс формы
  const resetForm = () => {
    setEditingProduct(null);
    setShowForm(false);
    setFormData({
      title: "",
      brand: "",
      price: "",
      size: "",
      image: "",
      hover_image: "",
    });
    setProductImages([]);
    setSizeChart([]);
  };

  // Добавление изображения
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      setProductImages([...productImages, url]);
      toast.success("Изображение загружено");
    } catch (error: any) {
      toast.error(`Ошибка загрузки: ${error.message}`);
    }
  };

  // Удаление изображения
  const handleRemoveImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  // Добавление строки в размерную таблицу
  const handleAddSizeRow = () => {
    setSizeChart([...sizeChart, { id: "", product_id: "", size_label: "", chest: "", waist: "", length: "" }]);
  };

  // Обновление строки размерной таблицы
  const handleUpdateSizeRow = (index: number, field: string, value: string) => {
    const updated = [...sizeChart];
    updated[index] = { ...updated[index], [field]: value };
    setSizeChart(updated);
  };

  // Удаление строки размерной таблицы
  const handleRemoveSizeRow = (index: number) => {
    setSizeChart(sizeChart.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Админ-панель</h1>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Скрыть форму" : "Добавить товар"}
            </Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingProduct ? "Редактировать товар" : "Новый товар"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Название *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Бренд</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Цена *</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="size">Размер</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Основное изображение *</Label>
                    <div className="flex gap-2 items-end">
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="URL или загрузите файл"
                        className="flex-1"
                      />
                      <label className="px-4 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                        <span className="text-sm">Загрузить</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await uploadImage(file);
                                setFormData({ ...formData, image: url });
                                toast.success("Изображение загружено");
                              } catch (error: any) {
                                toast.error(`Ошибка: ${error.message}`);
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.image && (
                      <div className="mt-2">
                        <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover border" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="hover_image">Изображение при наведении</Label>
                    <div className="flex gap-2 items-end">
                      <Input
                        id="hover_image"
                        value={formData.hover_image}
                        onChange={(e) => setFormData({ ...formData, hover_image: e.target.value })}
                        placeholder="URL или загрузите файл"
                        className="flex-1"
                      />
                      <label className="px-4 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                        <span className="text-sm">Загрузить</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await uploadImage(file);
                                setFormData({ ...formData, hover_image: url });
                                toast.success("Изображение загружено");
                              } catch (error: any) {
                                toast.error(`Ошибка: ${error.message}`);
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.hover_image && (
                      <div className="mt-2">
                        <img src={formData.hover_image} alt="Preview" className="w-32 h-32 object-cover border" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Дополнительные изображения</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {productImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Image ${index + 1}`} className="w-20 h-20 object-cover" />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 border-2 border-dashed flex items-center justify-center cursor-pointer">
                      <Plus size={24} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAddImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Размерная таблица</Label>
                    <Button type="button" size="sm" onClick={handleAddSizeRow}>
                      Добавить размер
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Размер</TableHead>
                        <TableHead>Грудь</TableHead>
                        <TableHead>Талия</TableHead>
                        <TableHead>Длина</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sizeChart.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={row.size_label}
                              onChange={(e) => handleUpdateSizeRow(index, "size_label", e.target.value)}
                              placeholder="XS"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.chest || ""}
                              onChange={(e) => handleUpdateSizeRow(index, "chest", e.target.value)}
                              placeholder="86-90"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.waist || ""}
                              onChange={(e) => handleUpdateSizeRow(index, "waist", e.target.value)}
                              placeholder="66-70"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.length || ""}
                              onChange={(e) => handleUpdateSizeRow(index, "length", e.target.value)}
                              placeholder="58"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSizeRow(index)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    {editingProduct ? "Сохранить" : "Создать"}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Список товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs">{product.id.slice(0, 8)}...</TableCell>
                      <TableCell>{product.title}</TableCell>
                      <TableCell>{product.brand || "-"}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
