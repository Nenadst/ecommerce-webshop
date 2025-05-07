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

type ProductFilter = {
  categoryId?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
};

const productResolvers = {
  Query: {
    products: async (
      _: unknown,
      {
        page = 1,
        limit = 10,
        filter = {},
        sort = { field: 'createdAt', order: -1 },
      }: {
        page?: number;
        limit?: number;
        filter?: ProductFilter;
        sort?: { field: string; order: 1 | -1 };
      }
    ) => {
      const query: any = {};

      if (filter.name) {
        query.name = { $regex: filter.name, $options: 'i' };
      }

      if (filter.categoryId) {
        query.category = filter.categoryId;
      }

      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        query.price = {};
        if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
        if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
      }

      const skip = (page - 1) * limit;
      const sortQuery = { [sort.field]: sort.order };

      const [items, total] = await Promise.all([
        Product.find(query).sort(sortQuery).skip(skip).limit(limit).populate('category'),
        Product.countDocuments(query),
      ]);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },
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
