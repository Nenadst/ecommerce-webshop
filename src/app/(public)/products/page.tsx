import { BreadCrumb } from '@/shared/components/layouts/BreadCrumb';
import Products from '@/features/products';
import { getClient } from '@/shared/lib/apollo-server-client';
import { GET_PRODUCTS } from '@/entities/product/api/product.queries';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const { data } = await getClient().query({
    query: GET_PRODUCTS,
    variables: {
      page: 1,
      limit: 1000,
      filter: {},
      sort: { field: 'createdAt', order: -1 },
    },
  });

  return (
    <>
      <BreadCrumb />
      <Products initialData={data.products?.items || []} />
    </>
  );
}
