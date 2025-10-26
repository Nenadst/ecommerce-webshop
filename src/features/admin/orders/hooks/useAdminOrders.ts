import { gql } from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';

export const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    allOrders {
      id
      orderNumber
      status
      paymentStatus
      email
      phone
      firstName
      lastName
      address
      city
      postalCode
      country
      paymentMethod
      subtotal
      tax
      shipping
      total
      createdAt
      updatedAt
      user {
        id
        name
        email
      }
      items {
        id
        productId
        name
        price
        quantity
        image
        product {
          id
          name
          images
        }
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String, $paymentStatus: String) {
    updateOrderStatus(id: $id, status: $status, paymentStatus: $paymentStatus) {
      id
      orderNumber
      status
      paymentStatus
      updatedAt
    }
  }
`;

export const UPDATE_ORDER_DETAILS = gql`
  mutation UpdateOrderDetails(
    $id: ID!
    $email: String
    $phone: String
    $firstName: String
    $lastName: String
    $address: String
    $city: String
    $postalCode: String
    $country: String
    $paymentMethod: String
  ) {
    updateOrderDetails(
      id: $id
      email: $email
      phone: $phone
      firstName: $firstName
      lastName: $lastName
      address: $address
      city: $city
      postalCode: $postalCode
      country: $country
      paymentMethod: $paymentMethod
    ) {
      id
      orderNumber
      email
      phone
      firstName
      lastName
      address
      city
      postalCode
      country
      paymentMethod
      updatedAt
    }
  }
`;

export const UPDATE_ORDER_ITEM = gql`
  mutation UpdateOrderItem($id: ID!, $quantity: Int, $price: Float) {
    updateOrderItem(id: $id, quantity: $quantity, price: $price) {
      id
      items {
        id
        productId
        name
        price
        quantity
        image
      }
      subtotal
      tax
      shipping
      total
    }
  }
`;

export const REMOVE_ORDER_ITEM = gql`
  mutation RemoveOrderItem($id: ID!) {
    removeOrderItem(id: $id) {
      id
      items {
        id
        productId
        name
        price
        quantity
        image
      }
      subtotal
      tax
      shipping
      total
    }
  }
`;

export const ADD_ORDER_ITEM = gql`
  mutation AddOrderItem($orderId: ID!, $productId: ID!, $quantity: Int!, $price: Float!) {
    addOrderItem(orderId: $orderId, productId: $productId, quantity: $quantity, price: $price) {
      id
      items {
        id
        productId
        name
        price
        quantity
        image
      }
      subtotal
      tax
      shipping
      total
    }
  }
`;

export function useAdminOrders() {
  const { trackActivity } = useActivityTracker();
  const { data, loading, error, refetch } = useQuery(GET_ALL_ORDERS, {
    fetchPolicy: 'cache-and-network',
  });

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    refetchQueries: [{ query: GET_ALL_ORDERS }],
    onCompleted: () => {
      toast.success('Order status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  const [updateOrderDetails] = useMutation(UPDATE_ORDER_DETAILS, {
    refetchQueries: [{ query: GET_ALL_ORDERS }],
    onCompleted: () => {
      toast.success('Order details updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order details');
    },
  });

  const [updateOrderItem] = useMutation(UPDATE_ORDER_ITEM, {
    refetchQueries: [{ query: GET_ALL_ORDERS }],
    onCompleted: () => {
      toast.success('Order item updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order item');
    },
  });

  const [removeOrderItem] = useMutation(REMOVE_ORDER_ITEM, {
    refetchQueries: [{ query: GET_ALL_ORDERS }],
    onCompleted: () => {
      toast.success('Order item removed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove order item');
    },
  });

  const [addOrderItem] = useMutation(ADD_ORDER_ITEM, {
    refetchQueries: [{ query: GET_ALL_ORDERS }],
    onCompleted: () => {
      toast.success('Product added to order successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add product to order');
    },
  });

  const handleUpdateStatus = async (orderId: string, status?: string, paymentStatus?: string) => {
    const order = data?.allOrders?.find((o: { id: string }) => o.id === orderId);
    await updateOrderStatus({
      variables: {
        id: orderId,
        status,
        paymentStatus,
      },
    });

    // Track admin action
    trackActivity({
      action: 'ADMIN_ACTION',
      description: `Updated order status: ${order?.orderNumber || orderId}`,
      metadata: {
        action: 'UPDATE_ORDER_STATUS',
        orderId: orderId,
        orderNumber: order?.orderNumber,
        status: status,
        paymentStatus: paymentStatus,
      },
    });
  };

  const handleUpdateDetails = async (
    orderId: string,
    details: {
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      paymentMethod?: string;
    }
  ) => {
    const order = data?.allOrders?.find((o: { id: string }) => o.id === orderId);
    await updateOrderDetails({
      variables: {
        id: orderId,
        ...details,
      },
    });

    // Track admin action
    trackActivity({
      action: 'ADMIN_ACTION',
      description: `Updated order details: ${order?.orderNumber || orderId}`,
      metadata: {
        action: 'UPDATE_ORDER_DETAILS',
        orderId: orderId,
        orderNumber: order?.orderNumber,
        updatedFields: Object.keys(details),
      },
    });
  };

  const handleUpdateOrderItem = async (itemId: string, quantity?: number, price?: number) => {
    // Find the order and item
    const order = data?.allOrders?.find((o: { items: Array<{ id: string }> }) =>
      o.items.some((item) => item.id === itemId)
    );
    const item = order?.items.find((i: { id: string }) => i.id === itemId);

    await updateOrderItem({
      variables: {
        id: itemId,
        quantity,
        price,
      },
    });

    // Track admin action
    trackActivity({
      action: 'ADMIN_ACTION',
      description: `Updated order item: ${item?.name || 'Unknown'} in order ${order?.orderNumber || 'Unknown'}`,
      metadata: {
        action: 'UPDATE_ORDER_ITEM',
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        itemId: itemId,
        itemName: item?.name,
        quantity: quantity,
        price: price,
      },
    });
  };

  const handleRemoveOrderItem = async (itemId: string) => {
    // Find the order and item before removing
    const order = data?.allOrders?.find((o: { items: Array<{ id: string }> }) =>
      o.items.some((item) => item.id === itemId)
    );
    const item = order?.items.find((i: { id: string }) => i.id === itemId);

    await removeOrderItem({
      variables: {
        id: itemId,
      },
    });

    // Track admin action
    trackActivity({
      action: 'ADMIN_ACTION',
      description: `Removed order item: ${item?.name || 'Unknown'} from order ${order?.orderNumber || 'Unknown'}`,
      metadata: {
        action: 'REMOVE_ORDER_ITEM',
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        itemId: itemId,
        itemName: item?.name,
      },
    });
  };

  const handleAddOrderItem = async (
    orderId: string,
    productId: string,
    quantity: number,
    price: number
  ) => {
    const order = data?.allOrders?.find((o: { id: string }) => o.id === orderId);

    await addOrderItem({
      variables: {
        orderId,
        productId,
        quantity,
        price,
      },
    });

    // Track admin action
    trackActivity({
      action: 'ADMIN_ACTION',
      description: `Added product to order ${order?.orderNumber || orderId}`,
      metadata: {
        action: 'ADD_ORDER_ITEM',
        orderId: orderId,
        orderNumber: order?.orderNumber,
        productId: productId,
        quantity: quantity,
        price: price,
      },
    });
  };

  return {
    orders: data?.allOrders || [],
    loading,
    error,
    refetch,
    updateOrderStatus: handleUpdateStatus,
    updateOrderDetails: handleUpdateDetails,
    updateOrderItem: handleUpdateOrderItem,
    removeOrderItem: handleRemoveOrderItem,
    addOrderItem: handleAddOrderItem,
  };
}
