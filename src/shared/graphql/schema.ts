import { gql } from 'graphql-tag';
import productResolvers from '../../entities/product/api/product.resolver';
import categoryResolvers from '../../entities/category/api/category.resolver';
import { authResolvers } from '@/entities/user/api/auth.resolver';

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

  type User {
    _id: ID!
    email: String!
  }

  type AuthPayload {
    user: User!
    token: String!
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
    me: User
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    register(email: String!, password: String!): User!
    login(email: String!, password: String!): User!
    logout: Boolean!
  }
`;

export const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...categoryResolvers.Query,
    ...authResolvers.Query,
  },
  Mutation: {
    ...productResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...authResolvers.Mutation,
  },
};
