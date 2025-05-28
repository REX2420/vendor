import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 200,
    },
    featuredImage: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    author: {
      type: ObjectId,
      ref: "Vendor",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Fragrance Tips", "Product Reviews", "Lifestyle", "Beauty", "Fashion", "Health & Wellness"],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
    seoTitle: {
      type: String,
      maxlength: 60,
    },
    seoDescription: {
      type: String,
      maxlength: 160,
    },
  },
  {
    timestamps: true,
  }
);

// Set publishedAt when status changes to published
blogSchema.pre('save', function(next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
export default Blog;