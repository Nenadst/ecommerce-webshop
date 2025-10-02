import { gql } from 'graphql-tag';
import productResolvers from '../../entities/product/api/product.resolver';
import categoryResolvers from '../../entities/category/api/category.resolver';
import userResolvers from '../../entities/user/api/user.resolver';
import cartResolvers from '../../entities/cart/api/cart.resolver';

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

  type User {
    id: ID!
    email: String!
    name: String
    role: String!
  }

  type AuthResponse {
    user: User!
    token: String!
  }

  type CartItem {
    id: ID!
    productId: ID!
    product: Product!
    quantity: Int!
    createdAt: String!
  }

  type Cart {
    items: [CartItem!]!
    total: Float!
    itemCount: Int!
  }

  input ProductFilterInput {
    categoryId: ID
    categoryIds: [ID!]
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
    productsByIds(ids: [ID!]!): [Product!]!
    categories: [Category!]
    category(id: ID!): Category
    userFavorites: [ID!]!
    favoriteProducts: [Product!]!
    cart: Cart!
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

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    toggleFavorite(productId: ID!): Boolean!

    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    register(input: RegisterInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!
    updateUser(id: ID!, input: UpdateUserInput!): AuthResponse!

    addToCart(productId: ID!, quantity: Int): CartItem!
    removeFromCart(productId: ID!): Boolean!
    updateCartItemQuantity(productId: ID!, quantity: Int!): CartItem!
    clearCart: Boolean!
  }
`;

export const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...categoryResolvers.Query,
    ...cartResolvers.Query,
  },
  Mutation: {
    ...productResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...userResolvers.Mutation,
    ...cartResolvers.Mutation,
  },
};
