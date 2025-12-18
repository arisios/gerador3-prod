// Templates de Copywriting para o Gerador 3

// ===== TEMPLATES DE CARROSSEL (19) =====
export const carouselTemplates = [
  { id: "tutorial", name: "Tutorial Passo a Passo", description: "Ensina algo em etapas claras", slides: 7, structure: ["Hook", "Problema", "Passo 1", "Passo 2", "Passo 3", "Resultado", "CTA"] },
  { id: "list", name: "Lista de Dicas", description: "Lista numerada de dicas ou itens", slides: 7, structure: ["Hook", "Dica 1", "Dica 2", "Dica 3", "Dica 4", "Dica 5", "CTA"] },
  { id: "storytelling", name: "Storytelling", description: "Conta uma história envolvente", slides: 7, structure: ["Hook", "Contexto", "Conflito", "Virada", "Resolução", "Lição", "CTA"] },
  { id: "myth-truth", name: "Mito vs Verdade", description: "Desmistifica crenças comuns", slides: 7, structure: ["Hook", "Mito 1", "Verdade 1", "Mito 2", "Verdade 2", "Conclusão", "CTA"] },
  { id: "before-after", name: "Antes e Depois", description: "Mostra transformação", slides: 5, structure: ["Hook", "Antes", "Processo", "Depois", "CTA"] },
  { id: "comparison", name: "Comparativo", description: "Compara duas opções", slides: 7, structure: ["Hook", "Opção A", "Opção B", "Diferença 1", "Diferença 2", "Veredito", "CTA"] },
  { id: "checklist", name: "Checklist", description: "Lista de verificação", slides: 7, structure: ["Hook", "Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "CTA"] },
  { id: "mistakes", name: "Erros Comuns", description: "Erros que as pessoas cometem", slides: 7, structure: ["Hook", "Erro 1", "Erro 2", "Erro 3", "Erro 4", "Como Evitar", "CTA"] },
  { id: "secrets", name: "Segredos Revelados", description: "Revela informações exclusivas", slides: 7, structure: ["Hook", "Segredo 1", "Segredo 2", "Segredo 3", "Segredo 4", "Bônus", "CTA"] },
  { id: "case-study", name: "Estudo de Caso", description: "Análise de um caso real", slides: 7, structure: ["Hook", "Contexto", "Desafio", "Estratégia", "Resultados", "Aprendizados", "CTA"] },
  { id: "trends", name: "Tendências", description: "Apresenta tendências do momento", slides: 7, structure: ["Hook", "Tendência 1", "Tendência 2", "Tendência 3", "Tendência 4", "Previsão", "CTA"] },
  { id: "how-to", name: "Como Fazer", description: "Ensina a fazer algo específico", slides: 7, structure: ["Hook", "Material", "Passo 1", "Passo 2", "Passo 3", "Resultado", "CTA"] },
  { id: "faq", name: "Perguntas Frequentes", description: "Responde dúvidas comuns", slides: 7, structure: ["Hook", "Pergunta 1", "Pergunta 2", "Pergunta 3", "Pergunta 4", "Pergunta 5", "CTA"] },
  { id: "data", name: "Dados e Estatísticas", description: "Apresenta dados relevantes", slides: 7, structure: ["Hook", "Dado 1", "Dado 2", "Dado 3", "Análise", "Conclusão", "CTA"] },
  { id: "timeline", name: "Linha do Tempo", description: "Mostra evolução cronológica", slides: 7, structure: ["Hook", "Início", "Fase 1", "Fase 2", "Fase 3", "Atual", "CTA"] },
  { id: "pros-cons", name: "Prós e Contras", description: "Analisa vantagens e desvantagens", slides: 7, structure: ["Hook", "Pró 1", "Pró 2", "Contra 1", "Contra 2", "Veredito", "CTA"] },
  { id: "framework", name: "Framework/Método", description: "Apresenta um método estruturado", slides: 7, structure: ["Hook", "Visão Geral", "Etapa 1", "Etapa 2", "Etapa 3", "Aplicação", "CTA"] },
  { id: "prediction", name: "Previsões", description: "Faz previsões sobre o futuro", slides: 7, structure: ["Hook", "Contexto", "Previsão 1", "Previsão 2", "Previsão 3", "Preparação", "CTA"] },
  { id: "behind-scenes", name: "Bastidores", description: "Mostra os bastidores de algo", slides: 7, structure: ["Hook", "Contexto", "Bastidor 1", "Bastidor 2", "Bastidor 3", "Revelação", "CTA"] },
];

// ===== TEMPLATES DE IMAGEM ÚNICA (15) =====
export const imageTemplates = [
  { id: "quote", name: "Citação", description: "Frase impactante ou inspiradora" },
  { id: "tip", name: "Dica Rápida", description: "Uma dica única e valiosa" },
  { id: "statistic", name: "Estatística", description: "Dado ou número impactante" },
  { id: "question", name: "Pergunta", description: "Pergunta que gera reflexão" },
  { id: "announcement", name: "Anúncio", description: "Comunicado ou novidade" },
  { id: "motivation", name: "Motivacional", description: "Mensagem de motivação" },
  { id: "fact", name: "Fato Curioso", description: "Informação surpreendente" },
  { id: "opinion", name: "Opinião", description: "Posicionamento sobre algo" },
  { id: "meme", name: "Meme/Humor", description: "Conteúdo humorístico" },
  { id: "reminder", name: "Lembrete", description: "Lembrete importante" },
  { id: "challenge", name: "Desafio", description: "Propõe um desafio ao público" },
  { id: "confession", name: "Confissão", description: "Compartilha algo pessoal" },
  { id: "unpopular", name: "Opinião Impopular", description: "Visão controversa" },
  { id: "lesson", name: "Lição Aprendida", description: "Aprendizado de experiência" },
  { id: "hack", name: "Hack/Atalho", description: "Truque ou atalho útil" },
];

// ===== TEMPLATES DE VÍDEO (12) =====
export const videoTemplates = [
  { id: "direct-hook", name: "Gancho Direto", description: "Começa com afirmação forte", duration: "30-60s" },
  { id: "pov", name: "POV", description: "Ponto de vista específico", duration: "15-30s" },
  { id: "reaction", name: "Reação", description: "Reage a algo", duration: "15-30s" },
  { id: "storytime", name: "Storytime", description: "Conta uma história", duration: "60-90s" },
  { id: "tutorial-video", name: "Tutorial Rápido", description: "Ensina algo rapidamente", duration: "30-60s" },
  { id: "trend-video", name: "Trend", description: "Participa de uma trend", duration: "15-30s" },
  { id: "day-in-life", name: "Um Dia Na Vida", description: "Mostra rotina", duration: "60-90s" },
  { id: "get-ready", name: "Get Ready With Me", description: "Se arruma enquanto fala", duration: "60-90s" },
  { id: "ranking", name: "Ranking", description: "Classifica itens", duration: "30-60s" },
  { id: "duet", name: "Dueto/Resposta", description: "Responde outro vídeo", duration: "15-30s" },
  { id: "transformation", name: "Transformação", description: "Mostra mudança", duration: "15-30s" },
  { id: "voiceover", name: "Voiceover", description: "Narração sobre imagens", duration: "30-60s" },
];

// ===== TEMPLATES DE SOFT SELL - INFLUENCIADORES (8) =====
export const softSellTemplates = [
  { id: "daily-routine", name: "Rotina Diária", description: "Mostra produto na rotina natural" },
  { id: "honest-review", name: "Review Honesto", description: "Avaliação sincera do produto" },
  { id: "problem-solution", name: "Problema-Solução", description: "Mostra como resolve um problema" },
  { id: "unboxing", name: "Unboxing", description: "Abre e mostra o produto" },
  { id: "comparison-soft", name: "Comparação Sutil", description: "Compara com alternativas" },
  { id: "lifestyle", name: "Lifestyle", description: "Produto integrado ao estilo de vida" },
  { id: "testimonial", name: "Depoimento", description: "Conta experiência pessoal" },
  { id: "behind-brand", name: "Por Trás da Marca", description: "Mostra valores da marca" },
];

// ===== HOOKS VIRAIS (8 tipos) =====
export const hookTypes = [
  { id: "question", name: "Pergunta", examples: ["Você sabia que...?", "Já se perguntou por que...?", "O que acontece quando...?"] },
  { id: "negative", name: "Negativo", examples: ["Pare de fazer isso agora", "O erro que está destruindo...", "Por que você nunca vai conseguir..."] },
  { id: "controversial", name: "Controverso", examples: ["Ninguém quer admitir, mas...", "A verdade que te escondem...", "Isso vai irritar muita gente..."] },
  { id: "promise", name: "Promessa", examples: ["Em 30 dias você vai...", "O segredo para...", "Como conseguir... em..."] },
  { id: "number", name: "Número", examples: ["5 formas de...", "3 erros que...", "7 segredos para..."] },
  { id: "experience", name: "Experiência", examples: ["Depois de 10 anos...", "Testei por 30 dias e...", "O que aprendi quando..."] },
  { id: "surprising", name: "Surpreendente", examples: ["Isso mudou tudo...", "Descobri algo incrível...", "Você não vai acreditar..."] },
  { id: "suspense", name: "Suspense", examples: ["O que aconteceu depois...", "Ninguém esperava que...", "O final vai te surpreender..."] },
];

// ===== FÓRMULAS DE COPYWRITING =====
export const copyFormulas = [
  { id: "aida", name: "AIDA", description: "Atenção, Interesse, Desejo, Ação", steps: ["Atenção", "Interesse", "Desejo", "Ação"] },
  { id: "pas", name: "PAS", description: "Problema, Agitação, Solução", steps: ["Problema", "Agitação", "Solução"] },
  { id: "bab", name: "BAB", description: "Before, After, Bridge", steps: ["Antes", "Depois", "Ponte"] },
  { id: "fab", name: "FAB", description: "Features, Advantages, Benefits", steps: ["Características", "Vantagens", "Benefícios"] },
  { id: "4us", name: "4 U's", description: "Útil, Urgente, Único, Ultra-específico", steps: ["Útil", "Urgente", "Único", "Ultra-específico"] },
];

// ===== OBJETIVOS =====
export const objectives = [
  { id: "sale", name: "Venda", description: "Foco em conversão e vendas" },
  { id: "authority", name: "Autoridade", description: "Foco em posicionamento como especialista" },
  { id: "growth", name: "Crescimento", description: "Foco em alcance e novos seguidores" },
];

// ===== PESSOA GRAMATICAL =====
export const grammaticalPersons = [
  { id: "first", name: "1ª Pessoa", description: "Eu, meu, minha", examples: ["Eu descobri...", "Minha experiência..."] },
  { id: "second", name: "2ª Pessoa", description: "Você, seu, sua", examples: ["Você precisa saber...", "Seu problema é..."] },
  { id: "third", name: "3ª Pessoa", description: "Ele, ela, nosso", examples: ["Especialistas recomendam...", "Nossos clientes..."] },
];

// ===== CATEGORIAS DE VIRAIS =====
export const viralCategories = [
  "Humor", "Animais", "Fails", "Emocionante", "Surpreendente", "Talento",
  "Comida", "Moda", "Beleza", "Fitness", "Viagem", "Tech", "Música", "Dança", "DIY", "Educativo"
];

// ===== CATEGORIAS DE TRENDS =====
export const trendCategories = [
  "Moda", "Beleza", "Fitness", "Humor", "Lifestyle", "Tech", "Música", "Dança",
  "Comida", "Viagem", "Educação", "Negócios", "Entretenimento", "Esportes"
];
