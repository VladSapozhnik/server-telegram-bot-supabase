import "@supabase/functions-js/edge-runtime.d.ts";
import { createBotContainer } from "../_shared/factory.ts";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { clientId, text, sender } = await req.json();

    if (!clientId || !text) {
      return new Response(
        JSON.stringify({ error: "clientId and text are required" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const { dbRepo, telegramSender } = createBotContainer();
    const now = new Date();

    // Если отправляем от имени бота/оператора — отправляем реальное сообщение в Telegram пользователю
    if (sender === "bot") {
      await telegramSender.sendMessage(Number(clientId), text);
    }

    // Сохраняем сообщение в БД
    await dbRepo.saveMessage({
      clientId: Number(clientId),
      sender: sender || "bot",
      text: text.trim(),
      createdAt: now,
    });

    // Обновляем активность клиента
    await dbRepo.upsertClientActivity({
      id: Number(clientId),
      activityAt: now,
    });

    return new Response(
      JSON.stringify({ success: true, clientId, text, sender }),
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error in send-message function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: corsHeaders },
    );
  }
});
