/**
 * Cache Utilities for VibeCart Vendor
 * Helper functions for granular cache invalidation from vendor operations
 */

/**
 * Base cache invalidation function
 */
async function invalidateCache(type: string, tag?: string): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const body = tag 
      ? { type: 'tag', tag } 
      : { type };
      
    await fetch(`${baseUrl}/api/cache/invalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log(`Cache invalidated: ${tag || type}`);
  } catch (error) {
    console.error(`Failed to invalidate cache (${tag || type}):`, error);
    // Don't throw - cache invalidation failures shouldn't break the main operation
  }
}

/**
 * Product-specific cache invalidations for vendor operations
 */
export const VendorProductCacheInvalidation = {
  // Only invalidate featured products cache
  featuredProducts: () => invalidateCache('tag', 'featured_products'),
  
  // Only invalidate new arrivals cache  
  newArrivals: () => invalidateCache('tag', 'new_arrival_products'),
  
  // Only invalidate top selling products cache
  topSelling: () => invalidateCache('tag', 'top_selling_products'),
  
  // Invalidate all product-related caches (use for general product operations)
  allProducts: () => invalidateCache('products'),
  
  // Invalidate specific product cache
  singleProduct: () => invalidateCache('tag', 'product'),
  
  // Smart invalidation based on product status
  smartInvalidation: async (product: any) => {
    // If product is featured, invalidate featured products cache
    if (product.featured) {
      await invalidateCache('tag', 'featured_products');
    }
    
    // If product is new (created recently), might affect new arrivals
    // You can add more logic here based on your business rules
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    if (product.createdAt && new Date(product.createdAt) > threeDaysAgo) {
      await invalidateCache('tag', 'new_arrival_products');
    }
    
    // Always invalidate general products cache for vendor operations
    // This affects search results, product listings, etc.
    await invalidateCache('products');
  },
};

/**
 * Blog-specific cache invalidations for vendor operations
 */
export const VendorBlogCacheInvalidation = {
  // Only invalidate featured blogs cache
  featuredBlogs: () => invalidateCache('tag', 'featured_blogs_home'),
  
  // Only invalidate published blogs cache
  publishedBlogs: () => invalidateCache('tag', 'published_blogs_home'),
  
  // Only invalidate blog categories cache
  blogCategories: () => invalidateCache('tag', 'blog_categories'),
  
  // Invalidate all blog-related caches
  allBlogs: () => invalidateCache('blogs'),
  
  // Smart invalidation based on blog status and featured state
  smartInvalidation: async (blog: any) => {
    // If blog is featured, invalidate featured blogs cache
    if (blog.featured) {
      await invalidateCache('tag', 'featured_blogs_home');
    }
    
    // If blog is published, invalidate published blogs cache
    if (blog.status === 'published') {
      await invalidateCache('tag', 'published_blogs_home');
    }
    
    // Always invalidate general blogs cache for vendor operations
    await invalidateCache('blogs');
  },
};

/**
 * Comprehensive cache invalidation (use sparingly)
 */
export const VendorComprehensiveCacheInvalidation = {
  // Invalidate all product-related caches
  allProducts: () => invalidateCache('products'),
  
  // Invalidate all blog-related caches
  allBlogs: () => invalidateCache('blogs'),
  
  // Nuclear option - invalidate everything (rarely needed)
  everything: () => invalidateCache('all'),
}; 