import { gql } from 'graphql-tag';
import productResolvers from '../../entities/product/api/product.resolver';
import categoryResolvers from '../../entities/category/api/category.resolver';

export const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    quantity: Int!
    image: String
    category: Category!
  }

  type Category {
    id: ID!
    name: String!
  }

  input ProductFilterInput {
    categoryId: ID
    name: String
    minPrice: Float
    maxPrice: Float
  }

  input ProductSortInput {
    field: String!
    order: Int! # 1 for ascending, -1 for descending
  }

  type ProductPagination {
    items: [Product!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type Query {
    products(
      page: Int
      limit: Int
      filter: ProductFilterInput
      sort: ProductSortInput
    ): ProductPagination!
    product(id: ID!): Product
    categories: [Category!]
    category(id: ID!): Category
  }

  input ProductInput {
    name: String!
    description: String
    price: Float!
    quantity: Int!
    image: String
    categoryId: ID!
  }

  input CategoryInput {
    name: String!
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
  }
`;

export const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...categoryResolvers.Query,
  },
  Mutation: {
    ...productResolvers.Mutation,
    ...categoryResolvers.Mutation,
  },
};
