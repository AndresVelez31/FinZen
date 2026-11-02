// Internal imports
import type { ArticleInterface } from '~/interfaces/ArticleInterface';

// Exports
export class ArticleUtil {
  /**
   * Finds an article by its slug, or undefined when no article uses it.
   */
  public static findBySlug(
    articles: ArticleInterface[],
    slug: string,
  ): ArticleInterface | undefined {
    return articles.find((article) => article.slug === slug);
  }
}
