import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

// Users table
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Projects table
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  niche: varchar("niche", { length: 255 }),
  businessContext: text("businessContext"),
  sourceType: mysqlEnum("sourceType", ["site", "instagram", "tiktok", "description"]).notNull(),
  sourceUrl: text("sourceUrl"),
  sourceDescription: text("sourceDescription"),
  analysis: json("analysis"),
  // Kit de Marca
  logoUrl: text("logoUrl"),
  logoPosition: mysqlEnum("logoPosition", ["top-left", "top-right", "bottom-left", "bottom-right"]).default("bottom-right"),
  logoSize: int("logoSize").default(10), // porcentagem da largura (5-20)
  colorPaletteId: varchar("colorPaletteId", { length: 50 }),
  customColors: json("customColors"),
  defaultTemplateId: varchar("defaultTemplateId", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Ideal Clients table
export const idealClients = mysqlTable("idealClients", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  demographics: json("demographics"),
  psychographics: json("psychographics"),
  isSelected: boolean("isSelected").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Pains table
export const pains = mysqlTable("pains", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  idealClientId: int("idealClientId"), // Vincula dor ao cliente ideal específico
  level: mysqlEnum("level", ["primary", "secondary", "unexplored"]).notNull(),
  pain: text("pain").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Contents table
export const contents = mysqlTable("contents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["carousel", "image", "video"]).notNull(),
  template: varchar("template", { length: 100 }).notNull(),
  title: text("title"),
  description: text("description"),
  hook: text("hook"),
  hookType: varchar("hookType", { length: 50 }),
  formula: varchar("formula", { length: 20 }),
  objective: mysqlEnum("objective", ["sale", "authority", "growth"]).default("authority"),
  person: mysqlEnum("person", ["first", "second", "third"]).default("second"),
  platform: mysqlEnum("platform", ["instagram", "tiktok"]).default("instagram"),
  voiceTone: varchar("voiceTone", { length: 50 }).default("casual"),
  clickbait: boolean("clickbait").default(false),
  status: mysqlEnum("status", ["draft", "generating", "ready", "published"]).default("draft"),
  batchId: varchar("batchId", { length: 36 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Slides table
export const slides = mysqlTable("slides", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  order: int("order").notNull(),
  text: text("text"),
  imageUrl: text("imageUrl"),
  imagePrompt: text("imagePrompt"),
  imageBank: json("imageBank"),
  selectedImageIndex: int("selectedImageIndex").default(0),
  // Template visual completo
  designTemplateId: varchar("designTemplateId", { length: 50 }),
  colorPaletteId: varchar("colorPaletteId", { length: 50 }),
  customColors: json("customColors"),
  renderedImageUrl: text("renderedImageUrl"),
  visualTemplate: varchar("visualTemplate", { length: 50 }),
  style: json("style"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Influencers table
export const influencers = mysqlTable("influencers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  niche: varchar("niche", { length: 255 }),
  type: mysqlEnum("type", ["normal", "transformation"]).default("normal"),
  description: text("description"),
  photoUrl: text("photoUrl"),
  referenceImageUrl: text("referenceImageUrl"),
  beforeImageUrl: text("beforeImageUrl"),
  afterImageUrl: text("afterImageUrl"),
  style: json("style"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Influencer Products table
export const influencerProducts = mysqlTable("influencerProducts", {
  id: int("id").primaryKey().autoincrement(),
  influencerId: int("influencer_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  idealClient: text("ideal_client"), // Cliente ideal do produto
  pains: json("pains").$type<string[]>(), // Dores do cliente ideal
  suggestedApproaches: json("suggested_approaches").$type<string[]>(),
  selectedApproaches: json("selected_approaches").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Influencer Product References table - banco de imagens de referência do produto
export const influencerProductReferences = mysqlTable("influencerProductReferences", {
  id: int("id").primaryKey().autoincrement(),
  productId: int("product_id").notNull(),
  type: mysqlEnum("type", ["product_photo", "screenshot", "environment", "context"]).notNull(),
  url: text("url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Influencer Contents table
export const influencerContents = mysqlTable("influencerContents", {
  id: int("id").autoincrement().primaryKey(),
  influencerId: int("influencerId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["carousel", "image", "video"]).notNull(),
  template: varchar("template", { length: 100 }).notNull(),
  source: mysqlEnum("source", ["produto", "softsell", "trend", "viral", "assunto"]).notNull(),
  title: text("title"),
  description: text("description"),
  hook: text("hook"),
  status: mysqlEnum("status", ["draft", "generating", "ready", "published"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Influencer Slides table
export const influencerSlides = mysqlTable("influencerSlides", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  order: int("order").notNull(),
  text: text("text"),
  imageUrl: text("imageUrl"),
  imagePrompt: text("imagePrompt"),
  imageBank: json("imageBank"),
  selectedImageIndex: int("selectedImageIndex").default(0),
  style: json("style"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Trends table
export const trends = mysqlTable("trends", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  source: mysqlEnum("source", ["google", "tiktok"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  classification: mysqlEnum("classification", ["emerging", "rising", "peak", "declining"]),
  viralProbability: int("viralProbability"),
  suggestedNiches: json("suggestedNiches"),
  collectedAt: timestamp("collectedAt").defaultNow().notNull(),
});

// Virals table
export const virals = mysqlTable("virals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  source: mysqlEnum("source", ["viralhog", "reddit"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  viralProbability: int("viralProbability"),
  suggestedNiches: json("suggestedNiches"),
  suggestedAngles: json("suggestedAngles"),
  expiresAt: timestamp("expiresAt"),
  collectedAt: timestamp("collectedAt").defaultNow().notNull(),
});

// Credits table - saldo de créditos do usuário
export const credits = mysqlTable("credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: int("balance").notNull().default(0),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Credit Transactions table - histórico de transações
export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["purchase", "usage", "refund", "bonus"]).notNull(),
  amount: int("amount").notNull(), // positivo = crédito, negativo = débito
  balance: int("balance").notNull(), // saldo após transação
  description: text("description"),
  // Para compras
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  // Para uso
  provider: varchar("provider", { length: 50 }), // omniinfer, dezgo, replicate, runware, manus
  generationType: varchar("generationType", { length: 50 }), // image, video, ken_burns
  referenceId: int("referenceId"), // ID do conteúdo/slide gerado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Credit Packages table - pacotes de créditos disponíveis
export const creditPackages = mysqlTable("creditPackages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  credits: int("credits").notNull(),
  priceInCents: int("priceInCents").notNull(), // preço em centavos BRL
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// API Providers table - configuração de providers de API
export const apiProviders = mysqlTable("apiProviders", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["image", "video"]).notNull(),
  creditsPerUse: int("creditsPerUse").notNull(),
  costPerUseInCents: int("costPerUseInCents").notNull(), // custo real em centavos
  quality: mysqlEnum("quality", ["economy", "standard", "premium"]).notNull(),
  isActive: boolean("isActive").default(true),
  config: json("config"), // configurações específicas do provider
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// User Media table - banco de mídia unificado (uploads + geradas)
export const userMedia = mysqlTable("userMedia", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["image", "video"]).notNull(),
  source: mysqlEnum("source", ["upload", "generated"]).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  filename: varchar("filename", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  size: int("size"), // tamanho em bytes
  width: int("width"),
  height: int("height"),
  // Campos para imagens geradas
  prompt: text("prompt"),
  provider: varchar("provider", { length: 50 }),
  // Metadados
  tags: json("tags"), // array de tags para busca
  projectId: int("projectId"), // projeto associado (opcional)
  contentId: int("contentId"), // conteúdo associado (opcional)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Topics table - assuntos pesquisados
export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  query: varchar("query", { length: 255 }).notNull(), // assunto pesquisado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// News table - notícias encontradas
export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  url: text("url"),
  source: varchar("source", { length: 255 }),
  publishedAt: varchar("publishedAt", { length: 50 }),
  imageUrl: text("imageUrl"),
  isSelected: boolean("isSelected").default(false),
  isManual: boolean("isManual").default(false), // indica se foi adicionada manualmente
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// User Settings table
export const userSettings = mysqlTable("userSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  defaultStyle: json("defaultStyle"),
  trendAlertEnabled: boolean("trendAlertEnabled").default(true),
  trendAlertThreshold: int("trendAlertThreshold").default(70),
  trendAlertCategories: json("trendAlertCategories"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Influencer Niches table
export const influencerNiches = mysqlTable("influencerNiches", {
  id: int("id").autoincrement().primaryKey(),
  influencerId: int("influencerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Influencer Ideal Clients table
export const influencerIdealClients = mysqlTable("influencerIdealClients", {
  id: int("id").autoincrement().primaryKey(),
  nicheId: int("nicheId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  demographics: json("demographics"),
  psychographics: json("psychographics"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Influencer Pains table
export const influencerPains = mysqlTable("influencerPains", {
  id: int("id").autoincrement().primaryKey(),
  idealClientId: int("idealClientId").notNull(),
  level: mysqlEnum("level", ["primary", "secondary", "unexplored"]).notNull(),
  pain: text("pain").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type IdealClient = typeof idealClients.$inferSelect;
export type Pain = typeof pains.$inferSelect;
export type Content = typeof contents.$inferSelect;
export type InsertContent = typeof contents.$inferInsert;
export type Slide = typeof slides.$inferSelect;
export type InsertSlide = typeof slides.$inferInsert;
export type Influencer = typeof influencers.$inferSelect;
export type InsertInfluencer = typeof influencers.$inferInsert;
export type InfluencerProduct = typeof influencerProducts.$inferSelect;
export type InsertInfluencerProduct = typeof influencerProducts.$inferInsert;
export type InfluencerContent = typeof influencerContents.$inferSelect;
export type InfluencerSlide = typeof influencerSlides.$inferSelect;
export type Trend = typeof trends.$inferSelect;
export type Viral = typeof virals.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type Credits = typeof credits.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type CreditPackage = typeof creditPackages.$inferSelect;
export type ApiProvider = typeof apiProviders.$inferSelect;
export type UserMedia = typeof userMedia.$inferSelect;
export type InsertUserMedia = typeof userMedia.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;
export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;
export type InfluencerNiche = typeof influencerNiches.$inferSelect;
export type InsertInfluencerNiche = typeof influencerNiches.$inferInsert;
export type InfluencerIdealClient = typeof influencerIdealClients.$inferSelect;
export type InsertInfluencerIdealClient = typeof influencerIdealClients.$inferInsert;
export type InfluencerPain = typeof influencerPains.$inferSelect;
export type InsertInfluencerPain = typeof influencerPains.$inferInsert;
