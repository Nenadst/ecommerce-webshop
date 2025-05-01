import { Product } from '@/entities/product/model/product.model';

type CreateProductInput = {
  input: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    image?: string;
    categoryId: string;
  };
};

type UpdateProductInput = {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  categoryId: string;
};

type DeleteProductArgs = {
  id: string;
};

const productResolvers = {
  Query: {
    products: async () => Product.find().populate('category'),
    product: async (_: unknown, { id }: { id: string }) =>
      Product.findById(id).populate('category'),
  },
  Mutation: {
    createProduct: async (_: unknown, args: CreateProductInput) => {
      const product = await Product.create({
        ...args.input,
        category: args.input.categoryId,
      });
      return product.populate('category');
    },

    deleteProduct: async (_: unknown, { id }: DeleteProductArgs) => {
      const result = await Product.findByIdAndDelete(id);
      return !!result;
    },
    updateProduct: async (_: unknown, { id, input }: { id: string; input: UpdateProductInput }) => {
      const updated = await Product.findByIdAndUpdate(
        id,
        {
          ...input,
          category: input.categoryId,
        },
        { new: true }
      ).populate('category');

      return updated;
    },
  },
};

export default productResolvers;
