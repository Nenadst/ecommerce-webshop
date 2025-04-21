import { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    quantity: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = models.Product || model('Product', ProductSchema);
