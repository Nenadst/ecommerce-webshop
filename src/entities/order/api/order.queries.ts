import { gql } from 'graphql-tag';

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
      total
      createdAt
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      orderNumber
      status
      paymentStatus
      total
      createdAt
      items {
        id
        name
        price
        quantity
        image
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
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

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($days: Int, $timezone: String) {
    dashboardStats(days: $days, timezone: $timezone) {
      totalRevenue
      totalOrders
      totalCustomers
      totalProducts
      averageOrderValue
      lowStockCount
      revenueChange
      ordersChange
      customersChange
      revenueByDay {
        date
        revenue
      }
      ordersByStatus {
        status
        count
      }
      recentOrders {
        id
        orderNumber
        status
        paymentStatus
        total
        createdAt
        user {
          name
          email
        }
      }
    }
  }
`;
