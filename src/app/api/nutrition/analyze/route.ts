interface AnalyzeBody {
  image?: string;
  mimeType?: string;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const authorization = request.headers.get("authorization");

  if (!supabaseUrl || !supabaseKey || !authorization) {
    return Response.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseKey, Authorization: authorization },
    cache: "no-store",
  });
  if (!userResponse.ok) {
    return Response.json({ error: "Faça login novamente para usar a análise." }, { status: 401 });
  }
  if (!geminiKey) {
    return Response.json(
      { error: "A análise por IA ainda precisa da nova chave GEMINI_API_KEY no Netlify." },
      { status: 503 },
    );
  }

  let body: AnalyzeBody;
  try {
    body = (await request.json()) as AnalyzeBody;
  } catch {
    return Response.json({ error: "Imagem inválida." }, { status: 400 });
  }

  const image = body.image?.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
  if (!image || image.length > 7_000_000) {
    return Response.json({ error: "A imagem está vazia ou muito grande." }, { status: 400 });
  }

  const geminiResponse = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analise esta refeição como uma estimativa visual, não como diagnóstico. Responda em português do Brasil, de forma curta, com: ingredientes prováveis, calorias aproximadas, proteínas, carboidratos e gorduras. Inclua uma frase avisando que porções e preparo podem alterar bastante os valores.",
              },
              {
                inline_data: {
                  mime_type: body.mimeType || "image/jpeg",
                  data: image,
                },
              },
            ],
          },
        ],
      }),
      cache: "no-store",
    },
  );

  const data = (await geminiResponse.json()) as GeminiResponse;
  if (!geminiResponse.ok) {
    return Response.json(
      { error: data.error?.message || "Não foi possível analisar a imagem agora." },
      { status: geminiResponse.status },
    );
  }

  const result = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("\n")
    .trim();

  if (!result) {
    return Response.json({ error: "A IA não retornou uma análise." }, { status: 502 });
  }
  return Response.json({ result });
}
