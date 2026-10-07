import { createClient } from "@supabase/supabase-js";

import {
  FrankfurterRateAdapter,
  SupabaseArticleRepository,
  SupabaseBotRepository,
  TelegramApiAdapter,
} from "./adapters/index.ts";
import {
  ArticleCrudUseCase,
  GetClientsRecentFirstUseCase,
  GetCurrencyRateUseCase,
  GetMessagesRecentFirstUseCase,
  HandleTelegramMessageUseCase,
} from "./usecases/index.ts";

export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_ANON_KEY") ||
    "";

  return createClient(supabaseUrl, supabaseServiceKey);
}

export function createBotContainer() {
  const supabase = createSupabaseClient();
  const dbRepo = new SupabaseBotRepository(supabase);
  const articleRepo = new SupabaseArticleRepository(supabase);
  const rateProvider = new FrankfurterRateAdapter();
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
  const telegramSender = new TelegramApiAdapter(botToken);

  const getCurrencyRateUseCase = new GetCurrencyRateUseCase(rateProvider);
  const handleTelegramMessageUseCase = new HandleTelegramMessageUseCase(
    dbRepo,
    telegramSender,
    getCurrencyRateUseCase,
  );
  const getClientsRecentFirstUseCase = new GetClientsRecentFirstUseCase(dbRepo);
  const getMessagesRecentFirstUseCase = new GetMessagesRecentFirstUseCase(dbRepo);
  const articleCrudUseCase = new ArticleCrudUseCase(articleRepo);

  return {
    supabase,
    dbRepo,
    articleRepo,
    rateProvider,
    telegramSender,
    // Use cases
    getCurrencyRateUseCase,
    handleTelegramMessageUseCase,
    getClientsRecentFirstUseCase,
    getMessagesRecentFirstUseCase,
    articleCrudUseCase,
  };
}

