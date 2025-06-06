"use server";

import { connectToDatabase } from "@/lib/database/connect";
import Blog from "@/lib/database/models/blog.model";
import Vendor from "@/lib/database/models/vendor.model";
import Category from "@/lib/database/models/category.model";
import SubCategory from "@/lib/database/models/subCategory.model";
import { verify_vendor } from "@/utils";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { VendorBlogCacheInvalidation } from "@/lib/cache-utils";

// Get all categories for blog creation
export const getCategoriesForBlog = async () => {
  try {
    await connectToDatabase();
    const vendorAuth = await verify_vendor();
    
    if (!vendorAuth) {
      return {
        success: false,
        message: "Unauthorized. Please login as vendor.",
        categories: [],
      };
    }

    const categories = await Category.find().sort({ name: 1 }).lean();

    return {
      success: true,
      categories: JSON.parse(JSON.stringify(categories)),
      message: "Categories fetched successfully",
    };
  } catch (error: any) {
    console.error("Get categories error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch categories",
      categories: [],
    };
  }
};

// Get subcategories by category ID for blog creation
export const getSubCategoriesForBlog = async (categoryId: string) => {
  try {
    await connectToDatabase();
    const vendorAuth = await verify_vendor();
    
    if (!vendorAuth) {
      return {
        success: false,
        message: "Unauthorized. Please login as vendor.",
        subCategories: [],
      };
    }

    if (!categoryId) {
      return {
        success: true,
        subCategories: [],
        message: "No category provided",
      };
    }

    const subCategories = await SubCategory.find({ parent: categoryId })
      .sort({ name: 1 })
      .lean();

    return {
      success: true,
      subCategories: JSON.parse(JSON.stringify(subCategories)),
      message: "Subcategories fetched successfully",
    };
  } catch (error: any) {
    console.error("Get subcategories error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch subcategories",
      subCategories: [],
    };
  }
};

// Create a new blog post
export const createBlog = async (blogData: {
  title: string;
  content: string;
  excerpt: string;
  featuredImage: {
    url: string;
    public_id: string;
  };
  category: string; // This will now be a category ObjectId
  subCategory?: string; // Optional subcategory ObjectId
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}) => {
  try {
    console.log("Starting createBlog function with data:", blogData);
    
    // Validate featuredImage object structure
    if (!blogData.featuredImage || typeof blogData.featuredImage !== 'object') {
      console.log("Invalid featuredImage: not an object");
      return {
        success: false,
        message: "Featured image is required and must be a valid object.",
      };
    }

    if (!blogData.featuredImage.url || !blogData.featuredImage.public_id) {
      console.log("Invalid featuredImage: missing url or public_id");
      return {
        success: false,
        message: "Featured image must have both url and public_id.",
      };
    }

    console.log("Featured image validation passed:", blogData.featuredImage);
    
    await connectToDatabase();
    console.log("Database connected successfully");
    
    const vendorAuth = await verify_vendor();
    console.log("Vendor auth result:", vendorAuth);
    
    if (!vendorAuth) {
      console.log("Vendor authentication failed");
      return {
        success: false,
        message: "Unauthorized. Please login as vendor.",
      };
    }

    // Fetch full vendor details
    const vendor = await Vendor.findById(vendorAuth.id);
    console.log("Vendor found:", vendor ? "Yes" : "No");
    
    if (!vendor) {
      console.log("Vendor not found in database");
      return {
        success: false,
        message: "Vendor not found.",
      };
    }

    // Fetch category details to get category name
    const category = await Category.findById(blogData.category);
    if (!category) {
      console.log("Category not found");
      return {
        success: false,
        message: "Selected category not found.",
      };
    }

    // Fetch subcategory details if provided
    let subCategory = null;
    if (blogData.subCategory) {
      subCategory = await SubCategory.findById(blogData.subCategory);
      if (!subCategory) {
        console.log("Subcategory not found");
        return {
          success: false,
          message: "Selected subcategory not found.",
        };
      }
      
      // Verify that subcategory belongs to the selected category
      if (subCategory.parent.toString() !== category._id.toString()) {
        console.log("Subcategory doesn't belong to selected category");
        return {
          success: false,
          message: "Selected subcategory doesn't belong to the selected category.",
        };
      }
    }

    const slug = slugify(blogData.title);
    console.log("Generated slug:", slug);

    // Check if slug already exists and make it unique if needed
    let uniqueSlug = slug;
    let counter = 1;
    while (await Blog.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    console.log("Final unique slug:", uniqueSlug);

    // Ensure featuredImage is properly structured
    const featuredImageData = {
      url: String(blogData.featuredImage.url),
      public_id: String(blogData.featuredImage.public_id)
    };

    const blogToCreate: any = {
      title: blogData.title,
      content: blogData.content,
      excerpt: blogData.excerpt,
      featuredImage: featuredImageData,
      category: category._id,
      categoryName: category.name,
      tags: blogData.tags,
      status: blogData.status,
      featured: blogData.featured,
      seoTitle: blogData.seoTitle,
      seoDescription: blogData.seoDescription,
      slug: uniqueSlug,
      author: vendor._id,
      authorName: vendor.name,
    };

    // Add subcategory if provided
    if (subCategory) {
      blogToCreate.subCategory = subCategory._id;
      blogToCreate.subCategoryName = subCategory.name;
    }

    console.log("Blog object to create:", JSON.stringify(blogToCreate, null, 2));

    const newBlog = new Blog(blogToCreate);
    console.log("Blog model instance created");

    // Validate the blog before saving
    const validationError = newBlog.validateSync();
    if (validationError) {
      console.log("Validation error:", validationError);
      return {
        success: false,
        message: `Validation failed: ${validationError.message}`,
      };
    }

    await newBlog.save();
    console.log("Blog saved successfully");
    
    // Invalidate cache after vendor creates a blog
    await VendorBlogCacheInvalidation.smartInvalidation(newBlog);
    
    revalidatePath("/vendor/dashboard/blogs");

    return {
      success: true,
      message: "Blog created successfully!",
      blog: JSON.parse(JSON.stringify(newBlog)),
    };
  } catch (error: any) {
    console.error("Create blog error:", error);
    console.error("Error stack:", error.stack);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return {
        success: false,
        message: `Validation failed: ${validationErrors.join(', ')}`,
      };
    }
    
    return {
      success: false,
      message: error.message || "Failed to create blog",
    };
  }
};

// Get all blogs for a vendor
export const getVendorBlogs = async (page: number = 1, limit: number = 10) => {
  try {
    await connectToDatabase();
    const vendorAuth = await verify_vendor();
    
    if (!vendorAuth) {
      return {
        success: false,
        message: "Unauthorized. Please login as vendor.",
      };
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find({ author: vendorAuth.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalBlogs = await Blog.countDocuments({ author: vendorAuth.id });
    const totalPages = Math.ceil(totalBlogs / limit);

    return {
      success: true,
      blogs: JSON.parse(JSON.stringify(blogs)),
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error: any) {
    console.error("Get vendor blogs error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch blogs",
    };
  }
};

// Get single blog by ID
export const getBlogById = async (blogId: string) => {
  try {
    await connectToDatabase();
    const vendorAuth = await verify_vendor();
    
    if (!vendorAuth) {
      return {
        success: false,
        message: "Unauthorized. Please login as vendor.",
      };
    }

    const blog = await Blog.findOne({ 
      _id: blogId, 
      author: vendorAuth.id 
    }).lean();

    if (!blog) {
      return {
        success: false,
        message: "Blog not found or you don't have permission to access it.",
      };
    }

    return {
      success: true,
      blog: JSON.parse(JSON.stringify(blog)),
    };
  } catch (error: any) {
    console.error("Get blog by ID error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch blog",
    };
  }
};

// Update blog
export const updateBlog = async (
  blogId: string,
  updateData: {
    title?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: {
      url: string;
      public_id: string;
    };
    category?: string; // This will now be a category ObjectId
    subCategory?: string; // Optional subcategory ObjectId
    tags?: string[];
    status?: "draft" | "published" | "archived";
    featured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    slug?: string;
  }
) => {
  try {
    await connectToDatabase();
    const vendorAuth = await verify_vendor();
    
    if (!vendorAuth) {
      return {
        success: false,
        message: "Unauthorized. Please login as vendor.",
      };
    }

    // If title is being updated, generate new slug
    let finalUpdateData: any = { ...updateData };
    if (updateData.title) {
      finalUpdateData.slug = slugify(updateData.title);
    }

    // If category is being updated, fetch category name
    if (updateData.category) {
      const category = await Category.findById(updateData.category);
      if (!category) {
        return {
          success: false,
          message: "Selected category not found.",
        };
      }
      finalUpdateData.categoryName = category.name;
    }

    // Handle subcategory updates
    if (updateData.hasOwnProperty('subCategory')) {
      if (updateData.subCategory) {
        // Subcategory is being set or changed
        const subCategory = await SubCategory.findById(updateData.subCategory);
        if (!subCategory) {
          return {
            success: false,
            message: "Selected subcategory not found.",
          };
        }
        
        // If category is also being updated, verify subcategory belongs to it
        if (updateData.category) {
          if (subCategory.parent.toString() !== updateData.category) {
            return {
              success: false,
              message: "Selected subcategory doesn't belong to the selected category.",
            };
          }
        } else {
          // If only subcategory is being updated, verify it belongs to current category
          const currentBlog = await Blog.findById(blogId);
          if (!currentBlog) {
            return {
              success: false,
              message: "Blog not found.",
            };
          }
          if (subCategory.parent.toString() !== currentBlog.category.toString()) {
            return {
              success: false,
              message: "Selected subcategory doesn't belong to the current category.",
            };
          }
        }
        
        finalUpdateData.subCategoryName = subCategory.name;
      } else {
        // Subcategory is being removed (set to null/undefined)
        finalUpdateData.subCategory = null;
        finalUpdateData.subCategoryName = null;
      }
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, author: vendorAuth.id },
      finalUpdateData,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return {
        success: false,
        message: "Blog not found or you don't have permission to update it.",
      };
    }

    // Invalidate cache after vendor updates a blog
    await VendorBlogCacheInvalidation.smartInvalidation(blog);

    revalidatePath("/vendor/dashboard/blogs");
    revalidatePath(`/vendor/dashboard/blogs/${blogId}`);

    return {
      success: true,
      message: "Blog updated successfully!",
      blog: JSON.parse(JSON.stringify(blog)),
    };
  } catch (error: any) {
    console.error("Update blog error:", error);
    return {
      success: false,
      message: error.message || "Failed to update blog",
    };
  }
};

// Delete blog
export const deleteBlog = async (blogId: string) => {
  try {
    await connectToDatabase();
    const vendorAuth = await verify_vendor();
    
    if (!vendorAuth) {
      return {
        success: false,
        message: "Unauthorized. Please login as vendor.",
      };
    }

    // Get the blog before deleting to check its status and featured state
    const blogToDelete = await Blog.findOne({ 
      _id: blogId, 
      author: vendorAuth.id 
    });

    if (!blogToDelete) {
      return {
        success: false,
        message: "Blog not found or you don't have permission to delete it.",
      };
    }

    // Now delete the blog
    const blog = await Blog.findOneAndDelete({ 
      _id: blogId, 
      author: vendorAuth.id 
    });

    // Invalidate cache after vendor deletes a blog
    await VendorBlogCacheInvalidation.smartInvalidation(blogToDelete);

    revalidatePath("/vendor/dashboard/blogs");

    return {
      success: true,
      message: "Blog deleted successfully!",
    };
  } catch (error: any) {
    console.error("Delete blog error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete blog",
    };
  }
};

// Get published blogs for public display
export const getPublishedBlogs = async (page: number = 1, limit: number = 6) => {
  try {
    await connectToDatabase();
    
    const skip = (page - 1) * limit;
    const blogs = await Blog.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalBlogs = await Blog.countDocuments({ status: "published" });
    const totalPages = Math.ceil(totalBlogs / limit);

    return {
      success: true,
      blogs: JSON.parse(JSON.stringify(blogs)),
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error: any) {
    console.error("Get published blogs error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch blogs",
    };
  }
};

// Get blog analytics for vendor
export const getBlogAnalytics = async () => {
  try {
    await connectToDatabase();
    const vendorAuth = await verify_vendor();
    
    if (!vendorAuth) {
      return {
        success: false,
        message: "Unauthorized. Please login as vendor.",
      };
    }

    const totalBlogs = await Blog.countDocuments({ author: vendorAuth.id });
    const publishedBlogs = await Blog.countDocuments({ 
      author: vendorAuth.id, 
      status: "published" 
    });
    const draftBlogs = await Blog.countDocuments({ 
      author: vendorAuth.id, 
      status: "draft" 
    });
    const totalViews = await Blog.aggregate([
      { $match: { author: vendorAuth.id } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalLikes = await Blog.aggregate([
      { $match: { author: vendorAuth.id } },
      { $group: { _id: null, totalLikes: { $sum: "$likes" } } }
    ]);

    return {
      success: true,
      analytics: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
      },
    };
  } catch (error: any) {
    console.error("Get blog analytics error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch analytics",
    };
  }
};