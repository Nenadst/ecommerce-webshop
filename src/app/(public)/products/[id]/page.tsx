import { BreadCrumb } from '@/shared/components/layouts/BreadCrumb';
import ProductDetails from '@/features/products/components/ProductDetails';
import { getClient } from '@/shared/lib/apollo-server-client';
import { GET_PRODUCT } from '@/entities/product/api/product.queries';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

const ProductDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  try {
    const { data } = await getClient().query({
      query: GET_PRODUCT,
      variables: { id },
    });

    if (!data?.product) {
      notFound();
    }

    return (
      <>
        <BreadCrumb />
        <ProductDetails initialProduct={data.product} />
      </>
    );
  } catch (error) {
    console.error('Failed to fetch product:', error);
    notFound();
  }
};

export default ProductDetailPage;
