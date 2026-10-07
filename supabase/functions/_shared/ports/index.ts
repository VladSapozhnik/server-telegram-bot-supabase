import { ArticleEntity, ClientEntity, CreateArticleDto, MessageEntity, UpdateArticleDto } from "../domain/entities.ts";

export interface IExchangeRateProvider {
  getUsdRate(currency: string): Promise<number | null>;
  getSupportedCurrencies(): Promise<string[]>;
}

export interface IBotDatabaseRepository {
  upsertClientActivity(client: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    activityAt?: Date;
  }): Promise<void>;

  saveMessage(message: {
    clientId: number;
    sender: "client" | "bot";
    text: string;
    createdAt?: Date;
  }): Promise<void>;

  getAllClientsRecentFirst(): Promise<ClientEntity[]>;
  getAllMessagesRecentFirst(): Promise<MessageEntity[]>;
}

export interface IArticleRepository {
  getAllArticles(): Promise<ArticleEntity[]>;
  getArticleById(id: string): Promise<ArticleEntity | null>;
  createArticle(dto: CreateArticleDto): Promise<ArticleEntity>;
  updateArticle(id: string, dto: UpdateArticleDto): Promise<ArticleEntity>;
  deleteArticle(id: string): Promise<void>;
}

export interface ITelegramSender {
  sendMessage(chatId: number, text: string): Promise<void>;
}
