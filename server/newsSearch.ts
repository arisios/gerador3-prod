import { invokeLLM } from "./_core/llm";

/**
 * News Search Helper
 * Busca notícias recentes sobre um assunto usando IA
 */

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

/**
 * Converte filtro de data em texto para o prompt
 */
function getDateFilterText(dateFilter?: "last_week" | "last_month" | "last_3_months" | "all"): string {
  switch (dateFilter) {
    case "last_week":
      return "- Ter datas recentes (últimos 7 dias)";
    case "last_month":
      return "- Ter datas recentes (último mês)";
    case "last_3_months":
      return "- Ter datas recentes (últimos 3 meses)";
    case "all":
      return "- Podem ser de qualquer período recente";
    default:
      return "- Ter datas recentes (últimos 7 dias)";
  }
}

/**
 * Busca notícias recentes sobre um assunto usando IA
 * @param query - Assunto a pesquisar
 * @param limit - Número máximo de resultados (padrão: 5)
 * @param dateFilter - Filtro de data (last_week, last_month, last_3_months, all)
 * @param sourceFilter - Filtro de fonte (opcional)
 * @returns Array de notícias encontradas
 */
export async function searchNews(
  query: string, 
  limit: number = 5,
  dateFilter?: "last_week" | "last_month" | "last_3_months" | "all",
  sourceFilter?: string
): Promise<NewsArticle[]> {
  try {
    const prompt = `Você é um assistente que busca notícias recentes e relevantes.

Assunto: ${query}

Gere ${limit} notícias REAIS e RECENTES sobre este assunto. As notícias devem:
- Ser de fontes confiáveis (portais de notícias, blogs especializados, revistas)
- Ter títulos chamativos e relevantes
- Incluir descrição detalhada do conteúdo
- Ser de diferentes ângulos sobre o assunto
${getDateFilterText(dateFilter)}
${sourceFilter ? `- Ser da fonte: ${sourceFilter}` : ""}

Retorne um JSON com array de notícias:`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um especialista em curadoria de notícias e tendências. Retorne apenas JSON válido." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "news_search",
          strict: true,
          schema: {
            type: "object",
            properties: {
              news: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Título da notícia" },
                    description: { type: "string", description: "Descrição detalhada" },
                    source: { type: "string", description: "Fonte da notícia" },
                    publishedAt: { type: "string", description: "Data de publicação (ISO 8601)" },
                  },
                  required: ["title", "description", "source", "publishedAt"],
                  additionalProperties: false
                }
              }
            },
            required: ["news"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const data = JSON.parse(contentStr);

    // Gerar URLs simuladas baseadas no título
    const articles: NewsArticle[] = data.news.map((article: any, index: number) => ({
      title: article.title,
      description: article.description,
      url: `https://news.example.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}/${index + 1}`,
      source: article.source,
      publishedAt: article.publishedAt,
      imageUrl: undefined,
    }));

    return articles.slice(0, limit);
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return [];
  }
}
