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
      type: ObjectId,
      ref: "Category",
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    subCategory: {
      type: ObjectId,
      ref: "SubCategory",
      required: false,
    },
    subCategoryName: {
      type: String,
      required: false,
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

// 🚀 OPTIMIZED INDEXES FOR BLOG SEARCH PERFORMANCE
// Text search index for full-text search capabilities
blogSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text',
  tags: 'text',
  authorName: 'text',
  categoryName: 'text',
  subCategoryName: 'text',
  seoTitle: 'text',
  seoDescription: 'text'
}, {
  weights: {
    title: 10,        // Highest priority for blog title
    excerpt: 8,       // High priority for excerpt
    tags: 6,          // Medium-high priority for tags
    authorName: 5,    // Medium priority for author
    categoryName: 5,  // Medium priority for category
    subCategoryName: 4, // Medium priority for subcategory
    seoTitle: 4,      // Medium priority for SEO title
    content: 3,       // Lower priority for content
    seoDescription: 2 // Lower priority for SEO description
  },
  name: 'blog_text_search'
});

// Index for published blogs (most common query)
blogSchema.index({ status: 1, publishedAt: -1 });

// Index for category filtering (now using ObjectId)
blogSchema.index({ category: 1, publishedAt: -1 });

// Index for subcategory filtering
blogSchema.index({ subCategory: 1, publishedAt: -1 });

// Index for category and subcategory combined filtering
blogSchema.index({ category: 1, subCategory: 1, publishedAt: -1 });

// Index for featured blogs
blogSchema.index({ featured: -1, publishedAt: -1 });

// Index for popular blogs (views and likes)
blogSchema.index({ views: -1, likes: -1 });

// Index for author-specific queries
blogSchema.index({ author: 1, publishedAt: -1 });

// Index for slug-based queries (blog detail pages)
blogSchema.index({ slug: 1 }, { unique: true });

// Compound index for complex blog queries
blogSchema.index({ 
  status: 1, 
  featured: -1, 
  category: 1, 
  subCategory: 1,
  publishedAt: -1 
});

// Index for tag-based searches
blogSchema.index({ tags: 1, publishedAt: -1 });

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
export default Blog;