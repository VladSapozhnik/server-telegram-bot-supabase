import "@supabase/functions-js/edge-runtime.d.ts";
import { createBotContainer } from "../_shared/factory.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : String(error);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  // URL pathname parsing: e.g. /articles or /articles/123 or /functions/v1/articles/...
  const segments = url.pathname.split("/").filter(Boolean);
  // If path ends with articles/<id>
  const articleIndex = segments.lastIndexOf("articles");
  const articleId = articleIndex !== -1 && segments.length > articleIndex + 1 ? segments[articleIndex + 1] : url.searchParams.get("id");

  const { articleCrudUseCase } = createBotContainer();

  try {
    switch (req.method) {
      case "GET": {
        if (articleId) {
          const article = await articleCrudUseCase.getArticle(articleId);
          if (!article) {
            return errorResponse("Article not found", 404);
          }
          return jsonResponse(article);
        }
        const articles = await articleCrudUseCase.listArticles();
        return jsonResponse(articles);
      }

      case "POST": {
        const body = await req.json();
        const created = await articleCrudUseCase.createArticle(body);
        return jsonResponse(created, 201);
      }

      case "PUT":
      case "PATCH": {
        if (!articleId) {
          return errorResponse("Article ID is required for update", 400);
        }
        const body = await req.json();
        const updated = await articleCrudUseCase.updateArticle(articleId, body);
        return jsonResponse(updated);
      }

      case "DELETE": {
        if (!articleId) {
          return errorResponse("Article ID is required for delete", 400);
        }
        await articleCrudUseCase.deleteArticle(articleId);
        return jsonResponse({ success: true, deletedId: articleId });
      }

      default:
        return errorResponse("Method not allowed", 405);
    }
  } catch (err) {
    console.error(`[articles edge function] Error:`, err);
    return errorResponse(err, 400);
  }
});
