import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($page: Int, $limit: Int, $filter: ProductFilterInput, $sort: ProductSortInput) {
    products(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      items {
        id
        name
        description
        price
        hasDiscount
        discountPrice
        quantity
        images
        category {
          id
          name
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const GET_PRODUCT = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      hasDiscount
      discountPrice
      quantity
      images
      category {
        id
        name
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      description
      price
      hasDiscount
      discountPrice
      quantity
      images
      category {
        id
        name
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
      hasDiscount
      discountPrice
      quantity
      images
      category {
        id
        name
      }
    }
  }
`;
