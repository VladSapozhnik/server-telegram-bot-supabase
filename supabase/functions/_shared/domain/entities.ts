export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

export interface ClientEntity {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  last_activity_at: string;
  created_at?: string;
}

export interface MessageEntity {
  id?: number;
  client_id: number;
  sender: "client" | "bot";
  text: string;
  created_at?: string;
}

export type ArticleStatus = "draft" | "published" | "archived";

export interface ArticleEntity {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleDto {
  title: string;
  slug: string;
  content: string;
  status?: ArticleStatus;
}

export interface UpdateArticleDto {
  title?: string;
  slug?: string;
  content?: string;
  status?: ArticleStatus;
}

