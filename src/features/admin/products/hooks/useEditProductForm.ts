import { useMutation, useQuery, Reference } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { GET_PRODUCT, UPDATE_PRODUCT } from '@/entities/product/api/product.queries';
import { GET_CATEGORIES } from '@/entities/category/api/category.queries';
import { Product } from '@/entities/product/types/product.types';
import { Category } from '@/entities/category/types/category.types';

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

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    hasDiscount: false,
    discountPrice: '',
    quantity: '',
    categoryId: '',
    existingImages: [] as string[],
    files: [] as File[],
    imagePreviews: [] as string[],
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
        hasDiscount: product.hasDiscount || false,
        discountPrice: product.discountPrice?.toString() || '',
        quantity: product.quantity.toString(),
        categoryId: product.category?.id || '',
        existingImages: product.images || [],
        files: [],
        imagePreviews: [],
      });
    }
  }, [productData]);

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

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 2MB`);
        return false;
      }
      return true;
    });

    setForm((f) => {
      const availableSlots = 8 - (f.existingImages.length + f.files.length);
      const newFiles = [...f.files, ...validFiles].slice(0, availableSlots);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      return { ...f, files: newFiles, imagePreviews: newPreviews };
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExistingImageRemove = (index: number) => {
    setForm((f) => {
      const newExistingImages = f.existingImages.filter((_, i) => i !== index);
      return { ...f, existingImages: newExistingImages };
    });
  };

  const handleNewImageRemove = (index: number) => {
    setForm((f) => {
      const newFiles = f.files.filter((_, i) => i !== index);
      const newPreviews = f.imagePreviews.filter((_, i) => i !== index);
      return { ...f, files: newFiles, imagePreviews: newPreviews };
    });
  };

  const handleAllImagesReorder = (oldIndex: number, newIndex: number) => {
    setForm((f) => {
      const allImages = [...f.existingImages, ...f.imagePreviews];
      const [moved] = allImages.splice(oldIndex, 1);
      allImages.splice(newIndex, 0, moved);

      const existingCount = f.existingImages.length;
      const newExisting = allImages.slice(0, existingCount);
      const newPreviews = allImages.slice(existingCount);

      return { ...f, existingImages: newExisting, imagePreviews: newPreviews };
    });
  };

  const handleImageClear = () => {
    setForm((f) => ({ ...f, files: [], imagePreviews: [], existingImages: [] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const price = parseFloat(form.price);
      const discountPrice = form.discountPrice ? parseFloat(form.discountPrice) : null;

      if (price <= 0) {
        toast.error('Price must be greater than 0');
        submittingRef.current = false;
        return;
      }

      if (form.hasDiscount && discountPrice !== null && discountPrice <= 0) {
        toast.error('Discount price must be greater than 0');
        submittingRef.current = false;
        return;
      }

      if (form.hasDiscount && discountPrice !== null && discountPrice >= price) {
        toast.error('Discount price must be less than the regular price');
        submittingRef.current = false;
        return;
      }

      const newImagesBase64 = await Promise.all(form.files.map((file) => convertToBase64(file)));

      const allImages = [...form.existingImages, ...newImagesBase64];

      await updateProduct({
        variables: {
          id: productId,
          input: {
            name: form.name,
            description: form.description,
            price: price,
            hasDiscount: form.hasDiscount,
            discountPrice: discountPrice,
            quantity: parseInt(form.quantity),
            images: allImages,
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
    handleSubmit,
    handleImageClear,
    handleFileChange,
    handleExistingImageRemove,
    handleNewImageRemove,
    handleAllImagesReorder,
    handleInputChange,
    productLoading,
    categoriesLoading,
    updateLoading,
    router,
  };
}
