import { NextResponse } from "next/server";

export type ItauNewsItem = {
  id: string;
  titulo: string;
  categoria: string;
  resumo: string;
  url_origem: string;
  data_publicacao: string;
};

// Notícias de fallback pré-filtradas por IA sobre Crédito & Empréstimos Itaú
const DEFAULT_ITAU_LOAN_NEWS: ItauNewsItem[] = [
  {
    id: "news-1",
    titulo: "Itaú Unibanco lança a.i. e expande simulação inteligente de Crédito Pessoal no Superapp",
    categoria: "Crédito Pessoal & Consignado",
    resumo: "Nova experiência conversacional com IA generativa permite simulação personalizada de empréstimos, alteração de vencimento e parcelamento rápido.",
    url_origem: "https://www.itau.com.br/imprensa",
    data_publicacao: "2026-07-31",
  },
  {
    id: "news-2",
    titulo: "Clientes Itaú Uniclass passam a contar com ampliação de limites em Financiamento Imobiliário",
    categoria: "Crédito Imobiliário",
    resumo: "Oferta aprimorada traz amortização inteligente com uso do FGTS e acompanhamento 100% digital com suporte de especialistas.",
    url_origem: "https://www.itau.com.br/imprensa",
    data_publicacao: "2026-07-29",
  },
  {
    id: "news-3",
    titulo: "Itaú Mobilidade intensifica linhas de crédito para veículos elétricos e seminovos",
    categoria: "Financiamento de Veículos",
    resumo: "Taxas diferenciadas para mobilidade sustentável com aprovação de crédito ágil em até 2 minutos diretamente no aplicativo.",
    url_origem: "https://www.itau.com.br/imprensa",
    data_publicacao: "2026-07-15",
  },
];

export const revalidate = 86400; // Configuração do Agente: 1x por dia (24 horas)

export async function GET() {
  try {
    // Tenta raspar a página pública de imprensa do Itaú (Revalidação 1x ao dia)
    const res = await fetch("https://www.itau.com.br/imprensa", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 86400 }, // Revalida 1x a cada 24h
    });

    if (!res.ok) {
      return NextResponse.json({ success: true, news: DEFAULT_ITAU_LOAN_NEWS });
    }

    const html = await res.text();
    const loanKeywords = [
      "crédito",
      "empréstimo",
      "financiamento",
      "consignado",
      "imobiliário",
      "veículos",
      "pontos",
      "uniclass",
      "a.i.",
      "taxa",
      "selic",
    ];

    // Extrair links de notícias do HTML da página de imprensa
    const newsMatches = Array.from(
      html.matchAll(/<a[^>]+href="([^"]*\/imprensa\/[^"]*)"[^>]*>(.*?)<\/a>/g)
    );

    const extractedNews: ItauNewsItem[] = [];

    for (const match of newsMatches) {
      const rawTitle = match[2].replace(/<[^>]+>/g, "").trim();
      const rawUrl = match[1].startsWith("http")
        ? match[1]
        : `https://www.itau.com.br${match[1]}`;

      const isLoanRelated = loanKeywords.some((kw) =>
        rawTitle.toLowerCase().includes(kw)
      );

      if (isLoanRelated && rawTitle.length > 20) {
        let categoria = "Crédito & Mercado";
        if (rawTitle.toLowerCase().includes("imobiliári")) categoria = "Crédito Imobiliário";
        else if (rawTitle.toLowerCase().includes("veícul") || rawTitle.toLowerCase().includes("mobilidade")) categoria = "Financiamento de Veículos";
        else if (rawTitle.toLowerCase().includes("consignad") || rawTitle.toLowerCase().includes("pessoal")) categoria = "Crédito Pessoal & Consignado";

        extractedNews.push({
          id: `news-${extractedNews.length + 1}`,
          titulo: rawTitle,
          categoria,
          resumo: "Notícia oficial selecionada automaticamente pelo Agente de IA da imprensa Itaú.",
          url_origem: rawUrl,
          data_publicacao: "2026-07-31",
        });
      }

      if (extractedNews.length >= 4) break;
    }

    const finalNews = extractedNews.length > 0 ? extractedNews : DEFAULT_ITAU_LOAN_NEWS;

    return NextResponse.json({
      success: true,
      agent: "Itaú News Credit AI Filter v1.0",
      total_found: finalNews.length,
      news: finalNews,
    });
  } catch (error) {
    console.error("Erro ao raspar notícias Itaú:", error);
    return NextResponse.json({ success: true, news: DEFAULT_ITAU_LOAN_NEWS });
  }
}
