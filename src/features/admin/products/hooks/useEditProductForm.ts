import { useMutation, useQuery, Reference } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { GET_PRODUCT, UPDATE_PRODUCT } from '@/entities/product/api/product.queries';
import { GET_CATEGORIES } from '@/entities/category/api/category.queries';
import { Product } from '@/entities/product/types/product.types';
import { Category } from '@/entities/category/types/category.types';
import { EditProduct } from '@/entities/product/types/product-edit.types';

export function useEditProductForm() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { data: productData, loading: productLoading } = useQuery<{ product: Product }>(
    GET_PRODUCT,
    {
      variables: { id: productId },
    }
  );
  const { data: categoriesData, loading: categoriesLoading } = useQuery<{ categories: Category[] }>(
    GET_CATEGORIES
  );

  const [form, setForm] = useState<EditProduct>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: '',
    categoryId: '',
    file: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (productData?.product) {
      const product = productData.product;
      setForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        image: product.image || '',
        categoryId: product.category?.id || '',
        file: null,
      });
    }
  }, [productData]);

  const imagePreviewUrl = useMemo(() => {
    return form.file ? URL.createObjectURL(form.file) : '';
  }, [form.file]);

  const [updateProduct, { loading: updateLoading }] = useMutation(UPDATE_PRODUCT, {
    update(cache, { data }) {
      if (!data?.updateProduct) return;
      const updated = data.updateProduct;

      cache.modify({
        fields: {
          products(existing, { readField, toReference }) {
            const list = Array.isArray(existing) ? existing : [];

            return list.map((item: Reference) =>
              readField('id', item) === updated.id
                ? toReference({
                    __typename: 'Product',
                    id: updated.id,
                  })
                : item
            );
          },
        },
      });
    },
  });

  const handleUpload = async (): Promise<string> => {
    if (!form.file) return '';
    try {
      const formData = new FormData();
      formData.append('file', form.file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.url;
    } catch (err) {
      toast.error('Image upload failed');
      console.log(err);
      return '';
    }
  };

  const handleImageClear = () => {
    setForm((f) => ({ ...f, file: null, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      handleImageClear();
      return;
    }
    setForm((f) => ({ ...f, file: selected || null }));
  };

  const handleChange =
    (field: keyof EditProduct) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    let imageUrl = form.image;
    if (form.file) {
      imageUrl = await handleUpload();
    } else if (!form.image) {
      imageUrl = '';
    }

    try {
      await updateProduct({
        variables: {
          id: productId,
          input: {
            name: form.name,
            description: form.description,
            price: parseFloat(form.price),
            quantity: parseInt(form.quantity),
            image: imageUrl,
            categoryId: form.categoryId,
          },
        },
      });
      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
      submittingRef.current = false;
    }
  };

  return {
    form,
    setForm,
    categoriesData,
    fileInputRef,
    imagePreviewUrl,
    handleSubmit,
    handleImageClear,
    handleFileChange,
    handleChange,
    productLoading,
    categoriesLoading,
    updateLoading,
    router,
  };
}
