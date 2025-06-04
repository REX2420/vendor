import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;
const reviewSchema = new mongoose.Schema({
  reviewBy: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  review: {
    type: String,
    required: true,
  },
});
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
    },
    brand: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: ObjectId,
      required: true,
      ref: "Category",
    },
    subCategories: [
      {
        type: ObjectId,
        ref: "subCategory",
      },
    ],
    details: [
      {
        name: String,
        value: String,
      },
    ],
    benefits: [{ name: String }],
    ingredients: [{ name: String }],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    vendor: {
      type: Object,
    },
    subProducts: [
      {
        sku: String,
        images: [],
        description_images: [],
        color: {
          color: String,
          image: String,
        },
        sizes: [
          {
            size: String,
            qty: Number,
            price: Number,
            sold: {
              type: Number,
              default: 0,
            },
          },
        ],
        discount: {
          type: Number,
          default: 0,
        },
        sold: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 🚀 OPTIMIZED INDEXES FOR SEARCH PERFORMANCE
// Text search index for full-text search capabilities
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text',
  longDescription: 'text'
}, {
  weights: {
    name: 10,        // Highest priority for product name
    brand: 5,        // Medium priority for brand
    description: 3,  // Lower priority for description
    longDescription: 1 // Lowest priority for long description
  },
  name: 'product_text_search'
});

// Compound index for category and price filtering (most common query pattern)
productSchema.index({ category: 1, 'subProducts.sizes.price': 1 });

// Index for featured products (frequently used in homepage and search)
productSchema.index({ featured: -1, createdAt: -1 });

// Index for discount filtering (sale pages)
productSchema.index({ 'subProducts.discount': -1 });

// Index for rating and review sorting
productSchema.index({ rating: -1, numReviews: -1 });

// Index for inventory filtering (in-stock products)
productSchema.index({ 'subProducts.sizes.qty': 1 });

// Index for vendor-specific queries
productSchema.index({ 'vendor._id': 1, createdAt: -1 });

// Index for slug-based queries (product detail pages)
productSchema.index({ slug: 1 }, { unique: true });

// Compound index for complex search queries
productSchema.index({ 
  featured: -1, 
  category: 1, 
  rating: -1,
  createdAt: -1 
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
