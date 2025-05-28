"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlog } from "@/lib/database/actions/vendor/blog/blog.actions";
import Link from "next/link";

const categories = [
  "Fragrance Tips",
  "Product Reviews", 
  "Lifestyle",
  "Beauty",
  "Fashion",
  "Health & Wellness"
];

const CreateBlogPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    category: "",
    status: "draft" as "draft" | "published",
    featured: false,
    seoTitle: "",
    seoDescription: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<{url: string, public_id: string}> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "website");
    formData.append("tags", "blog_images");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dtxh3ew7s/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Cloudinary error: ${result.error.message}`);
      }

      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.excerpt || !imageFile || !formData.category) {
      alert("Please fill in all required fields and upload an image");
      return;
    }

    setLoading(true);
    try {
      console.log("Starting blog creation...");
      console.log("Image file:", imageFile);
      
      // Upload image to Cloudinary
      console.log("Uploading image to Cloudinary...");
      const uploadedImage = await uploadImageToCloudinary(imageFile);
      console.log("Image uploaded successfully:", uploadedImage);

      // Validate the uploaded image object
      if (!uploadedImage || !uploadedImage.url || !uploadedImage.public_id) {
        throw new Error("Invalid image upload response from Cloudinary");
      }

      // Ensure the featuredImage object is properly structured
      const featuredImageData = {
        url: String(uploadedImage.url),
        public_id: String(uploadedImage.public_id)
      };

      const blogDataToSend = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        featuredImage: featuredImageData,
        category: formData.category,
        tags: tags,
        status: formData.status,
        featured: formData.featured,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
      };

      console.log("Creating blog with data:", JSON.stringify(blogDataToSend, null, 2));

      const response = await createBlog(blogDataToSend);

      console.log("Blog creation response:", response);

      if (response.success) {
        alert("Blog created successfully!");
        router.push("/vendor/dashboard/blogs");
      } else {
        console.error("Blog creation failed:", response.message);
        alert(`Failed to create blog: ${response.message}`);
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      alert(`Failed to create blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/vendor/dashboard/blogs">
          <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50">
            ← Back to Blogs
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
          <p className="text-gray-600">Write and publish your blog post</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4">Blog Content</h2>
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter blog title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">Excerpt *</label>
                  <textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    placeholder="Brief description of your blog post..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    maxLength={200}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.excerpt.length}/200 characters
                  </p>
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Write your blog content here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[400px]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                  <input
                    id="seoTitle"
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                    placeholder="SEO optimized title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    maxLength={60}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.seoTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                  <textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                    placeholder="SEO meta description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.seoDescription.length}/160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4">Publish Settings</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value as "draft" | "published")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Post</label>
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange("featured", e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Category & Tags */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4">Category & Tags</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2">
                    <input
                      id="tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add tags..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                      Add
                    </button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4">Featured Image</h2>
              <div>
                <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                <input
                  id="featuredImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Featured image preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                💾 {loading ? "Creating..." : "Create Blog"}
              </button>
              
              <Link href="/vendor/dashboard/blogs">
                <button type="button" className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogPage;