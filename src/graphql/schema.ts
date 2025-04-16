import { gql } from 'apollo-server-micro';
import productResolvers from './resolvers/product';
import categoryResolvers from './resolvers/category';

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

  type Query {
    products: [Product!]
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
