import Homepage from '@/features/homepage';
import { getClient } from '@/shared/lib/apollo-server-client';
import { GET_PRODUCTS } from '@/entities/product/api/product.queries';

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const { data } = await getClient().query({
      query: GET_PRODUCTS,
      variables: {
        page: 1,
        limit: 20,
        filter: {},
        sort: { field: 'createdAt', order: -1 },
      },
    });

    return <Homepage initialProducts={data.products?.items || []} />;
  } catch (error) {
    console.error('SSR fetch failed, falling back to client-side:', error);
    return <Homepage initialProducts={[]} />;
  }
}
