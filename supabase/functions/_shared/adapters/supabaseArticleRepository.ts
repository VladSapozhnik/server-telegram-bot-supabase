import { SupabaseClient } from "npm:@supabase/supabase-js@^2.49.1";
import { ArticleEntity, CreateArticleDto, UpdateArticleDto } from "../domain/entities.ts";
import { IArticleRepository } from "../ports/index.ts";

export class SupabaseArticleRepository implements IArticleRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async getAllArticles(): Promise<ArticleEntity[]> {
    const { data, error } = await this.client
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }

    return (data as ArticleEntity[]) || [];
  }

  async getArticleById(id: string): Promise<ArticleEntity | null> {
    const { data, error } = await this.client
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching article by id:", error);
      throw error;
    }

    return (data as ArticleEntity) || null;
  }

  async createArticle(dto: CreateArticleDto): Promise<ArticleEntity> {
    const payload = {
      title: dto.title,
      slug: dto.slug,
      content: dto.content || "",
      status: dto.status || "draft",
    };

    const { data, error } = await this.client
      .from("articles")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error creating article:", error);
      throw error;
    }

    return data as ArticleEntity;
  }

  async updateArticle(id: string, dto: UpdateArticleDto): Promise<ArticleEntity> {
    const payload: Record<string, unknown> = {};
    if (dto.title !== undefined) payload.title = dto.title;
    if (dto.slug !== undefined) payload.slug = dto.slug;
    if (dto.content !== undefined) payload.content = dto.content;
    if (dto.status !== undefined) payload.status = dto.status;

    const { data, error } = await this.client
      .from("articles")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating article:", error);
      throw error;
    }

    return data as ArticleEntity;
  }

  async deleteArticle(id: string): Promise<void> {
    const { error } = await this.client
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting article:", error);
      throw error;
    }
  }
}
