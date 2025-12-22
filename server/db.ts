import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  projects, InsertProject, Project,
  idealClients, IdealClient,
  pains, Pain,
  contents, InsertContent, Content,
  slides, InsertSlide, Slide,
  influencers, InsertInfluencer, Influencer,
  influencerProducts, InfluencerProduct, InsertInfluencerProduct,
  influencerContents, InfluencerContent,
  influencerSlides, InfluencerSlide,
  trends, Trend,
  virals, Viral,
  userSettings, UserSettings,
  userMedia, UserMedia, InsertUserMedia,
  topics, Topic, InsertTopic,
  news, News, InsertNews
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER FUNCTIONS =====
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  if (user.name !== undefined) { values.name = user.name; updateSet.name = user.name; }
  if (user.email !== undefined) { values.email = user.email; updateSet.email = user.email; }
  if (user.loginMethod !== undefined) { values.loginMethod = user.loginMethod; updateSet.loginMethod = user.loginMethod; }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ===== PROJECT FUNCTIONS =====
export async function createProject(data: InsertProject): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return result[0].insertId;
}

export async function getProjectsByUser(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function updateProject(id: number, data: Partial<Project>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(projects).where(eq(projects.id, id));
}

export async function updateProjectBrandKit(id: number, data: {
  logoUrl?: string;
  colorPaletteId?: string;
  customColors?: { background?: string; text?: string; accent?: string };
  defaultTemplateId?: string;
  logoPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  logoSize?: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = {};
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
  if (data.colorPaletteId !== undefined) updateData.colorPaletteId = data.colorPaletteId;
  if (data.customColors !== undefined) updateData.customColors = data.customColors;
  if (data.defaultTemplateId !== undefined) updateData.defaultTemplateId = data.defaultTemplateId;
  if (data.logoPosition !== undefined) updateData.logoPosition = data.logoPosition;
  if (data.logoSize !== undefined) updateData.logoSize = data.logoSize;
  if (Object.keys(updateData).length > 0) {
    await db.update(projects).set(updateData).where(eq(projects.id, id));
  }
}

// ===== IDEAL CLIENTS FUNCTIONS =====
export async function createIdealClients(projectId: number, clients: { name: string; description?: string; demographics?: unknown; psychographics?: unknown }[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const values = clients.map(c => ({
    projectId,
    name: c.name || 'Cliente',
    description: c.description || null,
    demographics: c.demographics || null,
    psychographics: c.psychographics || null,
  }));
  if (values.length > 0) {
    await db.insert(idealClients).values(values);
  }
}

export async function getIdealClientsByProject(projectId: number): Promise<IdealClient[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(idealClients).where(eq(idealClients.projectId, projectId));
}

export async function updateIdealClient(id: number, data: Partial<IdealClient>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(idealClients).set(data).where(eq(idealClients.id, id));
}

export async function deleteIdealClientsByProject(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(idealClients).where(eq(idealClients.projectId, projectId));
}

export async function getSelectedIdealClientsByProject(projectId: number): Promise<IdealClient[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(idealClients).where(and(eq(idealClients.projectId, projectId), eq(idealClients.isSelected, true)));
}

export async function createIdealClient(projectId: number, data: { name: string; description?: string; demographics?: unknown; psychographics?: unknown }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(idealClients).values({
    projectId,
    name: data.name,
    description: data.description || null,
    demographics: data.demographics || null,
    psychographics: data.psychographics || null,
    isSelected: true,
  });
  return result[0].insertId;
}

export async function deleteIdealClient(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Também deletar dores vinculadas a este cliente
  await db.delete(pains).where(eq(pains.idealClientId, id));
  await db.delete(idealClients).where(eq(idealClients.id, id));
}

export async function getIdealClientById(id: number): Promise<IdealClient | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(idealClients).where(eq(idealClients.id, id));
  return result[0] || null;
}

// ===== PAINS FUNCTIONS =====
export async function createPains(projectId: number, painsList: { level: "primary" | "secondary" | "unexplored"; pain: string; description?: string; idealClientId?: number | null }[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const values = painsList.map(p => ({ ...p, projectId, idealClientId: p.idealClientId || null }));
  await db.insert(pains).values(values);
}

export async function getPainsByProject(projectId: number): Promise<Pain[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pains).where(eq(pains.projectId, projectId));
}

export async function getPainsByIdealClient(idealClientId: number): Promise<Pain[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pains).where(eq(pains.idealClientId, idealClientId));
}

export async function createPainsForClient(projectId: number, idealClientId: number, painsList: { level: "primary" | "secondary" | "unexplored"; pain: string; description?: string }[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const values = painsList.map(p => ({ ...p, projectId, idealClientId }));
  await db.insert(pains).values(values);
}

export async function deletePainsByIdealClient(idealClientId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(pains).where(eq(pains.idealClientId, idealClientId));
}

export async function deletePainsByProject(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(pains).where(eq(pains.projectId, projectId));
}

// ===== CONTENT FUNCTIONS =====
export async function createContent(data: InsertContent): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contents).values(data);
  return result[0].insertId;
}

export async function getContentsByProject(projectId: number): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contents).where(eq(contents.projectId, projectId)).orderBy(desc(contents.createdAt));
}

export async function getContentsByBatch(batchId: string): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contents).where(eq(contents.batchId, batchId)).orderBy(contents.createdAt);
}

export async function getContentById(id: number): Promise<Content | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contents).where(eq(contents.id, id)).limit(1);
  return result[0];
}

export async function updateContent(id: number, data: Partial<Content>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(contents).set(data).where(eq(contents.id, id));
}

export async function deleteContent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(slides).where(eq(slides.contentId, id));
  await db.delete(contents).where(eq(contents.id, id));
}

// ===== SLIDES FUNCTIONS =====
export async function createSlides(contentId: number, slidesList: Omit<InsertSlide, "contentId">[]): Promise<void> {
  console.log("[createSlides] Called with contentId:", contentId, "slides count:", slidesList.length);
  console.log("[createSlides] Slides data:", JSON.stringify(slidesList, null, 2));
  const db = await getDb();
  if (!db) {
    console.log("[createSlides] No database connection");
    return;
  }
  if (slidesList.length === 0) {
    console.log("[createSlides] No slides to insert");
    return;
  }
  const values = slidesList.map(s => ({ ...s, contentId }));
  console.log("[createSlides] Inserting values:", JSON.stringify(values, null, 2));
  try {
    await db.insert(slides).values(values);
    console.log("[createSlides] Insert successful");
  } catch (e) {
    console.error("[createSlides] Insert error:", e);
    throw e;
  }
}

export async function getSlidesByContent(contentId: number): Promise<Slide[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(slides).where(eq(slides.contentId, contentId)).orderBy(slides.order);
}

export async function updateSlide(id: number, data: Partial<Slide>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(slides).set(data).where(eq(slides.id, id));
}

export async function deleteSlidesByContent(contentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(slides).where(eq(slides.contentId, contentId));
}

export async function getSlideById(id: number): Promise<Slide | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(slides).where(eq(slides.id, id)).limit(1);
  return result[0];
}

// ===== INFLUENCER FUNCTIONS =====
export async function createInfluencer(data: InsertInfluencer): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(influencers).values(data);
  return result[0].insertId;
}

export async function getInfluencersByUser(userId: number): Promise<Influencer[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(influencers).where(eq(influencers.userId, userId)).orderBy(desc(influencers.createdAt));
}

export async function getInfluencerById(id: number): Promise<Influencer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(influencers).where(eq(influencers.id, id)).limit(1);
  return result[0];
}

export async function updateInfluencer(id: number, data: Partial<Influencer>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(influencers).set(data).where(eq(influencers.id, id));
}

export async function deleteInfluencer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(influencers).where(eq(influencers.id, id));
}

// ===== INFLUENCER PRODUCTS FUNCTIONS =====
export async function createInfluencerProduct(data: InsertInfluencerProduct): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(influencerProducts).values(data);
  return result[0].insertId;
}

export async function getInfluencerProductsByInfluencer(influencerId: number): Promise<InfluencerProduct[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(influencerProducts).where(eq(influencerProducts.influencerId, influencerId)).orderBy(desc(influencerProducts.createdAt));
}

export async function getInfluencerProductById(id: number): Promise<InfluencerProduct | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(influencerProducts).where(eq(influencerProducts.id, id)).limit(1);
  return result[0];
}

export async function updateInfluencerProduct(id: number, data: Partial<InfluencerProduct>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(influencerProducts).set(data).where(eq(influencerProducts.id, id));
}

export async function deleteInfluencerProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(influencerProducts).where(eq(influencerProducts.id, id));
}

// ===== INFLUENCER CONTENT FUNCTIONS =====
export async function createInfluencerContent(data: Omit<InfluencerContent, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(influencerContents).values(data);
  return result[0].insertId;
}

export async function getInfluencerContentsByInfluencer(influencerId: number): Promise<InfluencerContent[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(influencerContents).where(eq(influencerContents.influencerId, influencerId)).orderBy(desc(influencerContents.createdAt));
}

export async function getInfluencerContentById(id: number): Promise<InfluencerContent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(influencerContents).where(eq(influencerContents.id, id)).limit(1);
  return result[0];
}

// ===== INFLUENCER SLIDES FUNCTIONS =====
export async function createInfluencerSlides(contentId: number, slidesList: Omit<InfluencerSlide, "id" | "contentId" | "createdAt" | "updatedAt">[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const values = slidesList.map(s => ({ ...s, contentId }));
  await db.insert(influencerSlides).values(values);
}

export async function getInfluencerSlidesByContent(contentId: number): Promise<InfluencerSlide[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(influencerSlides).where(eq(influencerSlides.contentId, contentId)).orderBy(influencerSlides.order);
}

export async function updateInfluencerSlide(id: number, data: Partial<Omit<InfluencerSlide, "id" | "contentId" | "createdAt">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(influencerSlides).set({ ...data, updatedAt: new Date() }).where(eq(influencerSlides.id, id));
}

// ===== TRENDS FUNCTIONS =====
export async function createTrends(userId: number, trendsList: Omit<Trend, "id" | "userId" | "collectedAt">[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const values = trendsList.map(t => ({ ...t, userId }));
  await db.insert(trends).values(values);
}

export async function getTrendsByUser(userId: number, source?: "google" | "tiktok", limit = 50): Promise<Trend[]> {
  const db = await getDb();
  if (!db) return [];
  if (source) {
    return db.select().from(trends).where(and(eq(trends.userId, userId), eq(trends.source, source))).orderBy(desc(trends.collectedAt)).limit(limit);
  }
  return db.select().from(trends).where(eq(trends.userId, userId)).orderBy(desc(trends.collectedAt)).limit(limit);
}

export async function getTrendsBySource(userId: number, source: "google" | "tiktok"): Promise<Trend[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trends).where(and(eq(trends.userId, userId), eq(trends.source, source))).orderBy(desc(trends.collectedAt));
}

export async function getTrendById(trendId: number): Promise<Trend | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trends).where(eq(trends.id, trendId)).limit(1);
  return result[0];
}

// ===== VIRALS FUNCTIONS =====
export async function createVirals(userId: number, viralsList: Omit<Viral, "id" | "userId" | "collectedAt">[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const values = viralsList.map(v => ({ ...v, userId }));
  await db.insert(virals).values(values);
}

export async function getViralsByUser(userId: number, source?: "viralhog" | "reddit", limit = 50): Promise<Viral[]> {
  const db = await getDb();
  if (!db) return [];
  if (source) {
    return db.select().from(virals).where(and(eq(virals.userId, userId), eq(virals.source, source))).orderBy(desc(virals.collectedAt)).limit(limit);
  }
  return db.select().from(virals).where(eq(virals.userId, userId)).orderBy(desc(virals.collectedAt)).limit(limit);
}

export async function getViralsBySource(userId: number, source: "viralhog" | "reddit"): Promise<Viral[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(virals).where(and(eq(virals.userId, userId), eq(virals.source, source))).orderBy(desc(virals.collectedAt));
}

export async function getViralById(viralId: number): Promise<Viral | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(virals).where(eq(virals.id, viralId)).limit(1);
  return result[0];
}

// ===== USER SETTINGS FUNCTIONS =====
export async function getUserSettings(userId: number): Promise<UserSettings | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result[0];
}

export async function upsertUserSettings(userId: number, data: Partial<UserSettings>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(userSettings).values({ userId, ...data }).onDuplicateKeyUpdate({ set: data });
}

// ===== HISTORY/STATS FUNCTIONS =====
export async function getContentStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, byType: {}, byStatus: {} };
  
  const result = await db.select({
    type: contents.type,
    status: contents.status,
    count: sql<number>`count(*)`
  }).from(contents)
    .innerJoin(projects, eq(contents.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .groupBy(contents.type, contents.status);
  
  const stats = { total: 0, byType: {} as Record<string, number>, byStatus: {} as Record<string, number> };
  result.forEach(r => {
    stats.total += r.count;
    stats.byType[r.type] = (stats.byType[r.type] || 0) + r.count;
    stats.byStatus[r.status || 'draft'] = (stats.byStatus[r.status || 'draft'] || 0) + r.count;
  });
  
  return stats;
}

export async function getRecentContents(userId: number, limit = 10): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    id: contents.id,
    projectId: contents.projectId,
    userId: contents.userId,
    type: contents.type,
    template: contents.template,
    title: contents.title,
    description: contents.description,
    hook: contents.hook,
    hookType: contents.hookType,
    formula: contents.formula,
    objective: contents.objective,
    person: contents.person,
    clickbait: contents.clickbait,
    platform: contents.platform,
    voiceTone: contents.voiceTone,
    status: contents.status,
    batchId: contents.batchId,
    createdAt: contents.createdAt,
    updatedAt: contents.updatedAt
  }).from(contents)
    .innerJoin(projects, eq(contents.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .orderBy(desc(contents.createdAt))
    .limit(limit);
}


// ===== CREDITS FUNCTIONS =====
import { credits, creditTransactions, creditPackages, apiProviders, Credits, CreditTransaction, CreditPackage, ApiProvider } from "../drizzle/schema";

export async function getUserCredits(userId: number): Promise<Credits | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(credits).where(eq(credits.userId, userId)).limit(1);
  return result[0];
}

export async function getOrCreateUserCredits(userId: number): Promise<Credits> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let userCredits = await getUserCredits(userId);
  if (!userCredits) {
    await db.insert(credits).values({ userId, balance: 0 });
    userCredits = await getUserCredits(userId);
  }
  return userCredits!;
}

export async function addCredits(userId: number, amount: number, description: string, stripeSessionId?: string, stripePaymentIntentId?: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userCredits = await getOrCreateUserCredits(userId);
  const newBalance = userCredits.balance + amount;
  
  await db.update(credits).set({ balance: newBalance }).where(eq(credits.userId, userId));
  
  await db.insert(creditTransactions).values({
    userId,
    type: "purchase",
    amount,
    balance: newBalance,
    description,
    stripeSessionId,
    stripePaymentIntentId,
  });
  
  return newBalance;
}

export async function useCredits(userId: number, amount: number, description: string, provider?: string, generationType?: string, referenceId?: number): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, newBalance: 0, error: "Database not available" };
  
  const userCredits = await getOrCreateUserCredits(userId);
  
  if (userCredits.balance < amount) {
    return { success: false, newBalance: userCredits.balance, error: "Créditos insuficientes" };
  }
  
  const newBalance = userCredits.balance - amount;
  
  await db.update(credits).set({ balance: newBalance }).where(eq(credits.userId, userId));
  
  await db.insert(creditTransactions).values({
    userId,
    type: "usage",
    amount: -amount,
    balance: newBalance,
    description,
    provider,
    generationType,
    referenceId,
  });
  
  return { success: true, newBalance };
}

export async function addBonusCredits(userId: number, amount: number, description: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userCredits = await getOrCreateUserCredits(userId);
  const newBalance = userCredits.balance + amount;
  
  await db.update(credits).set({ balance: newBalance }).where(eq(credits.userId, userId));
  
  await db.insert(creditTransactions).values({
    userId,
    type: "bonus",
    amount,
    balance: newBalance,
    description,
  });
  
  return newBalance;
}

export async function getCreditTransactions(userId: number, limit = 50): Promise<CreditTransaction[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId)).orderBy(desc(creditTransactions.createdAt)).limit(limit);
}

export async function updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await getOrCreateUserCredits(userId);
  await db.update(credits).set({ stripeCustomerId }).where(eq(credits.userId, userId));
}

// ===== CREDIT PACKAGES FUNCTIONS =====
export async function getActiveCreditPackages(): Promise<CreditPackage[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creditPackages).where(eq(creditPackages.isActive, true)).orderBy(creditPackages.credits);
}

export async function getCreditPackageById(id: number): Promise<CreditPackage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creditPackages).where(eq(creditPackages.id, id)).limit(1);
  return result[0];
}

export async function createCreditPackage(data: { name: string; credits: number; priceInCents: number; stripePriceId?: string; isFeatured?: boolean }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(creditPackages).values(data);
  return result[0].insertId;
}

// ===== API PROVIDERS FUNCTIONS =====
export async function getActiveApiProviders(type?: "image" | "video"): Promise<ApiProvider[]> {
  const db = await getDb();
  if (!db) return [];
  if (type) {
    return db.select().from(apiProviders).where(and(eq(apiProviders.isActive, true), eq(apiProviders.type, type))).orderBy(apiProviders.creditsPerUse);
  }
  return db.select().from(apiProviders).where(eq(apiProviders.isActive, true)).orderBy(apiProviders.creditsPerUse);
}

export async function getApiProviderByName(name: string): Promise<ApiProvider | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(apiProviders).where(eq(apiProviders.name, name)).limit(1);
  return result[0];
}

export async function createApiProvider(data: { name: string; displayName: string; type: "image" | "video"; creditsPerUse: number; costPerUseInCents: number; quality: "economy" | "standard" | "premium"; config?: unknown }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(apiProviders).values(data);
  return result[0].insertId;
}


// ===== USER MEDIA FUNCTIONS =====

export async function createUserMedia(data: InsertUserMedia): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userMedia).values(data);
  return result[0].insertId;
}

export async function getUserMediaByUser(
  userId: number, 
  options?: { 
    type?: "image" | "video"; 
    source?: "upload" | "generated";
    limit?: number;
    offset?: number;
  }
): Promise<UserMedia[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Construir condições
  const conditions = [eq(userMedia.userId, userId)];
  
  if (options?.type) {
    conditions.push(eq(userMedia.type, options.type));
  }
  
  if (options?.source) {
    conditions.push(eq(userMedia.source, options.source));
  }
  
  const result = await db.select()
    .from(userMedia)
    .where(and(...conditions))
    .orderBy(desc(userMedia.createdAt))
    .limit(options?.limit || 100)
    .offset(options?.offset || 0);
  
  return result;
}

export async function getUserMediaById(id: number): Promise<UserMedia | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userMedia).where(eq(userMedia.id, id));
  return result[0];
}

export async function updateUserMedia(id: number, data: Partial<UserMedia>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(userMedia).set(data).where(eq(userMedia.id, id));
}

export async function deleteUserMedia(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(userMedia).where(eq(userMedia.id, id));
}

export async function getUserMediaCount(userId: number, type?: "image" | "video"): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  let condition = eq(userMedia.userId, userId);
  if (type) {
    condition = and(eq(userMedia.userId, userId), eq(userMedia.type, type))!;
  }
  
  const result = await db.select({ count: sql<number>`count(*)` }).from(userMedia).where(condition);
  return result[0]?.count || 0;
}

export async function searchUserMedia(
  userId: number,
  searchTerm: string,
  options?: { type?: "image" | "video"; limit?: number }
): Promise<UserMedia[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Busca por filename ou prompt
  const result = await db.select()
    .from(userMedia)
    .where(
      and(
        eq(userMedia.userId, userId),
        sql`(${userMedia.filename} LIKE ${`%${searchTerm}%`} OR ${userMedia.prompt} LIKE ${`%${searchTerm}%`})`
      )
    )
    .orderBy(desc(userMedia.createdAt))
    .limit(options?.limit || 50);
  
  return result;
}

// ===== TOPICS & NEWS FUNCTIONS =====

export async function createTopic(projectId: number, query: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(topics).values({ projectId, query });
  return result[0].insertId;
}

export async function getTopicsByProject(projectId: number): Promise<Topic[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topics).where(eq(topics.projectId, projectId)).orderBy(desc(topics.createdAt));
}

export async function getTopicById(id: number): Promise<Topic | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
  return result[0];
}

export async function deleteTopic(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Deletar notícias associadas primeiro
  await db.delete(news).where(eq(news.topicId, id));
  // Deletar tópico
  await db.delete(topics).where(eq(topics.id, id));
}

export async function createNews(topicId: number, newsList: Omit<News, "id" | "topicId" | "createdAt">[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const values = newsList.map(n => ({ ...n, topicId }));
  await db.insert(news).values(values);
}

export async function getNewsByTopic(topicId: number): Promise<News[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).where(eq(news.topicId, topicId)).orderBy(desc(news.createdAt));
}

export async function getNewsById(id: number): Promise<News | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(news).where(eq(news.id, id)).limit(1);
  return result[0];
}

export async function updateNews(id: number, data: Partial<News>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(news).set(data).where(eq(news.id, id));
}

export async function getSelectedNewsByProject(projectId: number): Promise<(News & { topicQuery: string })[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: news.id,
    topicId: news.topicId,
    title: news.title,
    description: news.description,
    url: news.url,
    source: news.source,
    publishedAt: news.publishedAt,
    imageUrl: news.imageUrl,
    isSelected: news.isSelected,
    isManual: news.isManual,
    createdAt: news.createdAt,
    topicQuery: topics.query,
  })
    .from(news)
    .innerJoin(topics, eq(news.topicId, topics.id))
    .where(and(eq(topics.projectId, projectId), eq(news.isSelected, true)))
    .orderBy(desc(news.createdAt));
  
  return result;
}
