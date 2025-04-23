// src/features/admin/product/add/useAddProductForm.ts
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { CREATE_PRODUCT } from '@/shared/graphql/product';

export function useAddProductForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
    file: null as File | null,
    imagePreview: '',
  });

  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT, {
    update(cache, { data: { createProduct } }) {
      cache.modify({
        fields: {
          products(existing = []) {
            return [...existing, createProduct];
          },
        },
      });
    },
  });

  const handleUpload = useCallback(async (): Promise<string> => {
    if (!form.file) return '';
    const formData = new FormData();
    formData.append('file', form.file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  }, [form.file]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      setForm((f) => ({ ...f, file: null, imagePreview: '' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setForm((f) => ({
      ...f,
      file: selected || null,
      imagePreview: selected ? URL.createObjectURL(selected) : '',
    }));
  }, []);

  const handleImageClear = useCallback(() => {
    setForm((f) => ({ ...f, file: null, imagePreview: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((f) => ({ ...f, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        let imageUrl = '';
        if (form.file) {
          imageUrl = await handleUpload();
        }
        await createProduct({
          variables: {
            input: {
              name: form.name,
              description: form.description,
              price: parseFloat(form.price),
              quantity: parseInt(form.quantity),
              categoryId: form.categoryId,
              image: imageUrl,
            },
          },
        });
        setForm({
          name: '',
          description: '',
          price: '',
          quantity: '',
          categoryId: '',
          file: null,
          imagePreview: '',
        });
        toast.success('Product created successfully');
        router.push('/admin/products');
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error('Something went wrong.');
        }
      }
    },
    [form, createProduct, handleUpload, router]
  );

  return {
    form,
    setForm,
    fileInputRef,
    handleFileChange,
    handleImageClear,
    handleInputChange,
    handleSubmit,
    loading,
  };
}
