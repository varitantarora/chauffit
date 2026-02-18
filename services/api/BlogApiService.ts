import BaseApiService, { ApiResponse } from './BaseApiService';

// ============================================================================
// BLOGS API TYPES
// ============================================================================

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  author: string;
  author_name: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
}

export interface BlogDetail extends BlogListItem {
  content: string; // Markdown
  updated_at: string;
}

export interface PaginatedBlogList {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogListItem[];
}

// ============================================================================
// BLOGS API SERVICE
// ============================================================================

class BlogApiService {
  private basePath = '/blogs';

  /**
   * List Blogs
   * GET /api/v1/blogs/
   *
   * Get paginated list of published blogs.
   *
   * @param page - Page number (default: 1)
   */
  async listBlogs(page = 1): Promise<ApiResponse<PaginatedBlogList>> {
    try {
      const response = await BaseApiService.get<PaginatedBlogList>(
        `${this.basePath}/`,
        { page: page.toString() }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blogs',
      };
    }
  }

  /**
   * Get Blog Detail
   * GET /api/v1/blogs/{slug}/
   *
   * Get detailed information about a specific blog by slug.
   *
   * @param slug - The blog slug
   */
  async getBlogDetail(slug: string): Promise<ApiResponse<BlogDetail>> {
    try {
      const response = await BaseApiService.get<any>(`${this.basePath}/${slug}/`);

      // Handle both direct BlogDetail and nested { success, data } responses
      if (response.success) {
        if (response.data && 'content' in response.data) {
          // Direct BlogDetail response
          return { success: true, data: response.data };
        } else if (response.data && 'data' in response.data && 'content' in (response.data as any).data) {
          // Nested response structure
          return { success: true, data: (response.data as any).data };
        }
      }

      return response as ApiResponse<BlogDetail>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog detail',
      };
    }
  }
}

export default new BlogApiService();
