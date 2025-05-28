"use client";

import { useState, useEffect } from "react";
import { getVendorBlogs, deleteBlog, getBlogAnalytics } from "@/lib/database/actions/vendor/blog/blog.actions";
import Link from "next/link";

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  featuredImage: {
    url: string;
    public_id: string;
  };
  category: string;
  status: "draft" | "published" | "archived";
  views: number;
  likes: number;
  createdAt: string;
  publishedAt?: string;
  featured: boolean;
}

interface Analytics {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalViews: number;
  totalLikes: number;
}

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
    fetchAnalytics();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await getVendorBlogs();
      if (response.success) {
        setBlogs(response.blogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await getBlogAnalytics();
      if (response.success && response.analytics) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    setDeleting(blogId);
    try {
      const response = await deleteBlog(blogId);
      if (response.success) {
        setBlogs(blogs.filter(blog => blog._id !== blogId));
        fetchAnalytics(); // Refresh analytics
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800 px-2 py-1 rounded text-xs";
      case "draft": return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs";
      case "archived": return "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs";
      default: return "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-2">Create and manage your blog posts</p>
        </div>
        <Link href="/vendor/dashboard/blogs/create">
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md">
            + Create New Blog
          </button>
        </Link>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                <p className="text-2xl font-bold">{analytics.totalBlogs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">{analytics.publishedBlogs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.draftBlogs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{analytics.totalViews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold">{analytics.totalLikes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Cards */}
      {blogs.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow border text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first blog post.</p>
          <Link href="/vendor/dashboard/blogs/create">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md">
              + Create Your First Blog
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-lg shadow border overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={blog.featuredImage.url}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={getStatusColor(blog.status)}>
                    {blog.status}
                  </span>
                  {blog.featured && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-2">
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 rounded text-xs">
                    {blog.category}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <span>👁 {blog.views}</span>
                    <span>❤️ {blog.likes}</span>
                  </div>
                  <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/vendor/dashboard/blogs/${blog._id}/edit`} className="flex-1">
                    <button className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50">
                      ✏️ Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    disabled={deleting === blog._id}
                    className="border border-red-300 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogsPage;