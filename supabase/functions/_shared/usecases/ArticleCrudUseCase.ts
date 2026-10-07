import { ArticleEntity, CreateArticleDto, UpdateArticleDto } from "../domain/entities.ts";
import { IArticleRepository } from "../ports/index.ts";

export class ArticleCrudUseCase {
  private articleRepo: IArticleRepository;

  constructor(articleRepo: IArticleRepository) {
    this.articleRepo = articleRepo;
  }

  async listArticles(): Promise<ArticleEntity[]> {
    return await this.articleRepo.getAllArticles();
  }

  async getArticle(id: string): Promise<ArticleEntity | null> {
    return await this.articleRepo.getArticleById(id);
  }

  async createArticle(dto: CreateArticleDto): Promise<ArticleEntity> {
    if (!dto.title || dto.title.trim() === "") {
      throw new Error("Title is required");
    }
    if (!dto.slug || dto.slug.trim() === "") {
      throw new Error("Slug is required");
    }
    return await this.articleRepo.createArticle(dto);
  }

  async updateArticle(id: string, dto: UpdateArticleDto): Promise<ArticleEntity> {
    const existing = await this.articleRepo.getArticleById(id);
    if (!existing) {
      throw new Error(`Article with id ${id} not found`);
    }
    return await this.articleRepo.updateArticle(id, dto);
  }

  async deleteArticle(id: string): Promise<void> {
    const existing = await this.articleRepo.getArticleById(id);
    if (!existing) {
      throw new Error(`Article with id ${id} not found`);
    }
    await this.articleRepo.deleteArticle(id);
  }
}
