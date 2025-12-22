import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import * as db from "./db";
import * as prompts from "./prompts";
import { carouselTemplates, imageTemplates, videoTemplates, softSellTemplates, hookTypes, copyFormulas, voiceTones, platforms } from "@shared/templates";
import { visualTemplates, accentColors, stylePresets } from "@shared/visualTemplates";
import { designTemplates, colorPalettes } from "@shared/designTemplates";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== UPLOAD =====
  upload: router({
    image: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string().optional(),
        contentType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64
        const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const ext = input.contentType?.split('/')[1] || 'png';
        const filename = input.filename || `${nanoid()}.${ext}`;
        const key = `uploads/${ctx.user.id}/${Date.now()}-${filename}`;
        
        // Upload to S3
        const { url } = await storagePut(key, buffer, input.contentType || 'image/png');
        
        return { url, key };
      }),
  }),

  // ===== TEMPLATES =====
  templates: router({
    getCarouselTemplates: publicProcedure.query(() => carouselTemplates),
    getImageTemplates: publicProcedure.query(() => imageTemplates),
    getVideoTemplates: publicProcedure.query(() => videoTemplates),
    getSoftSellTemplates: publicProcedure.query(() => softSellTemplates),
    getHookTypes: publicProcedure.query(() => hookTypes),
    getCopyFormulas: publicProcedure.query(() => copyFormulas),
    getVisualTemplates: publicProcedure.query(() => visualTemplates),
    getAccentColors: publicProcedure.query(() => accentColors),
    
    // Obter templates de design completos
    getDesignTemplates: publicProcedure.query(() => designTemplates),
    getColorPalettes: publicProcedure.query(() => colorPalettes),

    // Seleção automática de template com IA
    selectAutoTemplate: protectedProcedure
      .input(z.object({
        text: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Criar lista de templates para o prompt
        const templatesList = visualTemplates.map(t => 
          `- ${t.id}: ${t.name} - ${t.description} (tags: ${t.tags.join(', ')})`
        ).join('\n');
        
        const response = await invokeLLM({
          messages: [
            { role: "user", content: prompts.selectVisualTemplatePrompt(input.text, templatesList) }
          ],
        });
        
        const rawContent = response.choices[0]?.message?.content;
        const content = typeof rawContent === 'string' ? rawContent : '';
        
        try {
          // Extrair JSON da resposta
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            // Fallback para template padrão
            return {
              templateId: "lifestyle-editorial",
              accentColorId: "neon-green",
              reason: "Template padrão selecionado"
            };
          }
          
          const result = JSON.parse(jsonMatch[0]);
          
          // Validar se o template existe
          const validTemplate = visualTemplates.find(t => t.id === result.templateId);
          const validColor = accentColors.find(c => c.id === result.accentColorId);
          
          return {
            templateId: validTemplate ? result.templateId : "lifestyle-editorial",
            accentColorId: validColor ? result.accentColorId : "neon-green",
            reason: result.reason || "Selecionado automaticamente"
          };
        } catch (e) {
          return {
            templateId: "lifestyle-editorial",
            accentColorId: "neon-green",
            reason: "Template padrão selecionado"
          };
        }
      }),
    getStylePresets: publicProcedure.query(() => stylePresets),

    // Seleção automática de templates VARIADOS para carrossel inteiro
    selectVariedTemplates: protectedProcedure
      .input(z.object({
        contentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const content = await db.getContentById(input.contentId);
        if (!content || content.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const slides = await db.getSlidesByContent(input.contentId);
        if (slides.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum slide encontrado" });
        }

        // Preparar dados para o prompt
        const slidesData = slides.map(s => ({
          order: s.order,
          text: s.text || ""
        }));

        const templatesList = designTemplates.map(t => 
          `- ${t.id}: ${t.name} (${t.category}) - ${t.description}`
        ).join('\n');

        const palettesList = colorPalettes.map(p => 
          `- ${p.id}: ${p.name}`
        ).join('\n');

        const response = await invokeLLM({
          messages: [
            { role: "user", content: prompts.selectVariedTemplatesPrompt(slidesData, templatesList, palettesList) }
          ],
        });

        const rawContent = response.choices[0]?.message?.content;
        const contentStr = typeof rawContent === 'string' ? rawContent : '';

        try {
          const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("JSON não encontrado");
          }

          const result = JSON.parse(jsonMatch[0]);
          const paletteId = colorPalettes.find(p => p.id === result.paletteId)?.id || 'dark-neon';

          // Atualizar cada slide com seu template E cor diferente
          const updates: { slideId: number; templateId: string; paletteId: string; reason: string }[] = [];
          
          // Usar todas as paletas escuras para variar as cores
          const darkPalettes = ['dark-purple', 'dark-green', 'dark-blue', 'dark-red', 'dark-orange', 'dark-pink', 'dark-cyan', 'dark-gold'];
          
          for (let i = 0; i < (result.slides || []).length; i++) {
            const slideResult = result.slides[i];
            const slide = slides.find(s => s.order === slideResult.order);
            if (slide) {
              const validTemplate = designTemplates.find(t => t.id === slideResult.templateId);
              const templateId = validTemplate ? slideResult.templateId : 'fullbleed-center';
              // Cada slide recebe uma cor diferente (rotaciona se tiver mais slides que cores)
              const slidePaletteId = darkPalettes[i % darkPalettes.length];
              
              await db.updateSlide(slide.id, {
                designTemplateId: templateId,
                colorPaletteId: slidePaletteId,
              });
              
              updates.push({
                slideId: slide.id,
                templateId,
                paletteId: slidePaletteId,
                reason: slideResult.reason || 'Selecionado automaticamente'
              });
            }
          }

          return { paletteId: 'varied', updates };
        } catch (e) {
          // Fallback: distribuir templates variados manualmente COM cores variadas
          // Template padrão: Full + Texto Central para todos os slides
          const fallbackTemplates = ['fullbleed-center'];
          const darkPalettes = ['dark-purple', 'dark-green', 'dark-blue', 'dark-red', 'dark-orange', 'dark-pink', 'dark-cyan', 'dark-gold'];
          const updates: { slideId: number; templateId: string; paletteId: string; reason: string }[] = [];
          
          for (let i = 0; i < slides.length; i++) {
            const templateId = fallbackTemplates[i % fallbackTemplates.length];
            const slidePaletteId = darkPalettes[i % darkPalettes.length];
            await db.updateSlide(slides[i].id, {
              designTemplateId: templateId,
              colorPaletteId: slidePaletteId,
            });
            updates.push({
              slideId: slides[i].id,
              templateId,
              paletteId: slidePaletteId,
              reason: 'Template e cor distribuídos automaticamente'
            });
          }

          return { paletteId: 'varied', updates };
        }
      }),
  }),

  // ===== PROJECTS =====
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getProjectsByUser(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const idealClients = await db.getIdealClientsByProject(input.id);
        const pains = await db.getPainsByProject(input.id);
        return { ...project, idealClients, pains };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        sourceType: z.enum(["site", "instagram", "tiktok", "description"]),
        sourceUrl: z.string().optional(),
        sourceDescription: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const projectId = await db.createProject({
          userId: ctx.user.id,
          name: input.name,
          sourceType: input.sourceType,
          sourceUrl: input.sourceUrl || null,
          sourceDescription: input.sourceDescription || null,
        });
        return { id: projectId };
      }),

    analyze: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const source = project.sourceUrl || project.sourceDescription || "";
        const analysisPrompt = prompts.analyzeProjectPrompt(source, project.sourceType);
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um especialista em marketing digital e análise de negócios. Retorne apenas JSON válido." },
            { role: "user", content: analysisPrompt }
          ]
        });

        const analysisText = (typeof response.choices[0]?.message?.content === 'string' ? response.choices[0]?.message?.content : JSON.stringify(response.choices[0]?.message?.content)) || "{}";
        let analysis;
        try {
          analysis = JSON.parse(analysisText);
        } catch {
          analysis = { raw: analysisText };
        }

        await db.updateProject(input.id, { analysis });

        // Generate ideal clients
        const clientsPrompt = prompts.generateIdealClientsPrompt(JSON.stringify(analysis));
        const clientsResponse = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um especialista em personas e público-alvo. Retorne apenas JSON válido." },
            { role: "user", content: clientsPrompt }
          ]
        });

        const clientsText = (typeof clientsResponse.choices[0]?.message?.content === 'string' ? clientsResponse.choices[0]?.message?.content : JSON.stringify(clientsResponse.choices[0]?.message?.content)) || "[]";
        console.log("[Analyze] Clients raw response:", clientsText.substring(0, 500));
        let clients;
        try {
          // Try to extract JSON from markdown code blocks
          let jsonStr = clientsText;
          const jsonMatch = clientsText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
          }
          clients = JSON.parse(jsonStr);
        } catch (e) {
          console.error("[Analyze] Failed to parse clients:", e);
          clients = [];
        }
        console.log("[Analyze] Parsed clients count:", Array.isArray(clients) ? clients.length : 0);

        if (Array.isArray(clients) && clients.length > 0) {
          await db.createIdealClients(input.id, clients);
          console.log("[Analyze] Saved ideal clients");
        }

        // Generate pains
        const idealClientsData = await db.getIdealClientsByProject(input.id);
        const painsPrompt = prompts.generatePainsPrompt(JSON.stringify(analysis), JSON.stringify(idealClientsData));
        const painsResponse = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um especialista em copywriting e dores do cliente. Retorne apenas JSON válido." },
            { role: "user", content: painsPrompt }
          ]
        });

        const painsText = (typeof painsResponse.choices[0]?.message?.content === 'string' ? painsResponse.choices[0]?.message?.content : JSON.stringify(painsResponse.choices[0]?.message?.content)) || "{}";
        console.log("[Analyze] Pains raw response:", painsText.substring(0, 500));
        let painsData;
        try {
          // Try to extract JSON from markdown code blocks
          let jsonStr = painsText;
          const jsonMatch = painsText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
          }
          painsData = JSON.parse(jsonStr);
        } catch (e) {
          console.error("[Analyze] Failed to parse pains:", e);
          painsData = { primary: [], secondary: [], unexplored: [] };
        }
        console.log("[Analyze] Parsed pains:", painsData.primary?.length || 0, painsData.secondary?.length || 0, painsData.unexplored?.length || 0);

        const allPains: { level: "primary" | "secondary" | "unexplored"; pain: string; description: string }[] = [];
        if (painsData.primary) {
          painsData.primary.forEach((p: { pain: string; description: string }) => {
            allPains.push({ level: "primary", pain: p.pain, description: p.description });
          });
        }
        if (painsData.secondary) {
          painsData.secondary.forEach((p: { pain: string; description: string }) => {
            allPains.push({ level: "secondary", pain: p.pain, description: p.description });
          });
        }
        if (painsData.unexplored) {
          painsData.unexplored.forEach((p: { pain: string; description: string }) => {
            allPains.push({ level: "unexplored", pain: p.pain, description: p.description });
          });
        }

        if (allPains.length > 0) {
          await db.createPains(input.id, allPains);
        }

        return { success: true, analysis };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.deleteProject(input.id);
        return { success: true };
      }),

    // Atualizar Kit de Marca
    updateBrandKit: protectedProcedure
      .input(z.object({
        id: z.number(),
        logoUrl: z.string().optional(),
        colorPaletteId: z.string().optional(),
        customColors: z.object({
          background: z.string().optional(),
          text: z.string().optional(),
          accent: z.string().optional(),
        }).optional(),
        defaultTemplateId: z.string().optional(),
        logoPosition: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]).optional(),
        logoSize: z.number().min(5).max(20).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.updateProjectBrandKit(input.id, {
          logoUrl: input.logoUrl,
          colorPaletteId: input.colorPaletteId,
          customColors: input.customColors,
          defaultTemplateId: input.defaultTemplateId,
          logoPosition: input.logoPosition,
          logoSize: input.logoSize,
        });
        return { success: true };
      }),

    // Análise profunda de link - retorna lista de clientes potenciais
    analyzeLink: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        sourceType: z.enum(["site", "instagram", "tiktok", "youtube"]),
        sourceUrl: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const projectId = await db.createProject({
          userId: ctx.user.id,
          name: input.name,
          sourceType: input.sourceType as "site" | "instagram" | "tiktok" | "description",
          sourceUrl: input.sourceUrl,
        });

        const analysisPrompt = prompts.analyzeLinkDeepPrompt(input.sourceUrl, input.sourceType);
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um especialista em análise de negócios e marketing digital. Analise profundamente e retorne apenas JSON válido." },
            { role: "user", content: analysisPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "link_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  businessAnalysis: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      niche: { type: "string" },
                      mainOffer: { type: "string" },
                      uniqueValue: { type: "string" },
                      tone: { type: "string" },
                      keywords: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "niche", "mainOffer", "uniqueValue", "tone", "keywords"],
                    additionalProperties: false
                  },
                  potentialClients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        demographics: {
                          type: "object",
                          properties: {
                            age: { type: "string" },
                            gender: { type: "string" },
                            location: { type: "string" },
                            income: { type: "string" },
                            occupation: { type: "string" }
                          },
                          required: ["age", "gender", "location", "income", "occupation"],
                          additionalProperties: false
                        },
                        psychographics: {
                          type: "object",
                          properties: {
                            values: { type: "array", items: { type: "string" } },
                            interests: { type: "array", items: { type: "string" } },
                            lifestyle: { type: "string" },
                            goals: { type: "array", items: { type: "string" } },
                            frustrations: { type: "array", items: { type: "string" } }
                          },
                          required: ["values", "interests", "lifestyle", "goals", "frustrations"],
                          additionalProperties: false
                        },
                        buyingMotivation: { type: "string" },
                        mainPain: { type: "string" }
                      },
                      required: ["name", "description", "demographics", "psychographics", "buyingMotivation", "mainPain"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["businessAnalysis", "potentialClients"],
                additionalProperties: false
              }
            }
          }
        });

        const analysisText = response.choices[0]?.message?.content || "{}";
        let analysisData;
        try {
          analysisData = JSON.parse(typeof analysisText === 'string' ? analysisText : JSON.stringify(analysisText));
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao analisar link" });
        }

        await db.updateProject(projectId, { analysis: analysisData.businessAnalysis });

        if (analysisData.potentialClients && analysisData.potentialClients.length > 0) {
          await db.createIdealClients(projectId, analysisData.potentialClients.map((c: { name: string; description: string; demographics: unknown; psychographics: unknown }) => ({
            name: c.name,
            description: c.description,
            demographics: c.demographics,
            psychographics: c.psychographics,
          })));
        }

        // Logo será configurada manualmente pelo usuário na aba Config do projeto

        return { projectId, businessAnalysis: analysisData.businessAnalysis, potentialClients: analysisData.potentialClients };
      }),

    selectClientsAndGeneratePains: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        selectedClientIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const allClients = await db.getIdealClientsByProject(input.projectId);
        for (const client of allClients) {
          await db.updateIdealClient(client.id, { isSelected: input.selectedClientIds.includes(client.id) });
        }

        const selectedClients = await db.getSelectedIdealClientsByProject(input.projectId);
        if (selectedClients.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Selecione pelo menos um cliente ideal" });
        }

        await db.deletePainsByProject(input.projectId);

        const painsPrompt = prompts.generatePainsBySelectedClientsPrompt(
          JSON.stringify(project.analysis),
          JSON.stringify(selectedClients)
        );

        const painsResponse = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um especialista em copywriting e psicologia do consumidor. Retorne apenas JSON válido." },
            { role: "user", content: painsPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "pains_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  primary: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pain: { type: "string" },
                        description: { type: "string" },
                        contentOpportunity: { type: "string" }
                      },
                      required: ["pain", "description", "contentOpportunity"],
                      additionalProperties: false
                    }
                  },
                  secondary: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pain: { type: "string" },
                        description: { type: "string" },
                        contentOpportunity: { type: "string" }
                      },
                      required: ["pain", "description", "contentOpportunity"],
                      additionalProperties: false
                    }
                  },
                  unexplored: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pain: { type: "string" },
                        description: { type: "string" },
                        contentOpportunity: { type: "string" }
                      },
                      required: ["pain", "description", "contentOpportunity"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["primary", "secondary", "unexplored"],
                additionalProperties: false
              }
            }
          }
        });

        const painsText = painsResponse.choices[0]?.message?.content || "{}";
        let painsData;
        try {
          painsData = JSON.parse(typeof painsText === 'string' ? painsText : JSON.stringify(painsText));
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao gerar dores" });
        }

        const allPains: { level: "primary" | "secondary" | "unexplored"; pain: string; description: string }[] = [];
        if (painsData.primary) {
          painsData.primary.forEach((p: { pain: string; description: string }) => {
            allPains.push({ level: "primary", pain: p.pain, description: p.description });
          });
        }
        if (painsData.secondary) {
          painsData.secondary.forEach((p: { pain: string; description: string }) => {
            allPains.push({ level: "secondary", pain: p.pain, description: p.description });
          });
        }
        if (painsData.unexplored) {
          painsData.unexplored.forEach((p: { pain: string; description: string }) => {
            allPains.push({ level: "unexplored", pain: p.pain, description: p.description });
          });
        }

        if (allPains.length > 0) {
          await db.createPains(input.projectId, allPains);
        }

        return { success: true, painsCount: allPains.length, pains: painsData };
      }),

    updateIdealClientSelection: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        isSelected: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.updateIdealClient(input.clientId, { isSelected: input.isSelected });
        return { success: true };
      }),

    // Adicionar cliente ideal manualmente
    addIdealClient: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const clientId = await db.createIdealClient(input.projectId, {
          name: input.name,
          description: input.description,
        });
        return { success: true, clientId };
      }),

    // Deletar cliente ideal
    deleteIdealClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteIdealClient(input.clientId);
        return { success: true };
      }),

    // Listar clientes ideais do projeto
    listIdealClients: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getIdealClientsByProject(input.projectId);
      }),

    // Obter cliente ideal com suas dores
    getIdealClientWithPains: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        const client = await db.getIdealClientById(input.clientId);
        if (!client) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const pains = await db.getPainsByIdealClient(input.clientId);
        return { ...client, pains };
      }),

    // Gerar dores para um cliente específico
    generatePainsForClient: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        clientId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const client = await db.getIdealClientById(input.clientId);
        if (!client) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Cliente ideal não encontrado" });
        }

        // Deletar dores anteriores deste cliente
        await db.deletePainsByIdealClient(input.clientId);

        const analysis = project.analysis || {};
        const painsPrompt = `
Analise o negócio e gere dores ESPECÍFICAS para este cliente ideal:

Negócio: ${JSON.stringify(analysis)}

Cliente Ideal: ${client.name}
Descrição: ${client.description || "Não especificada"}

Gere dores MUITO ESPECÍFICAS para este perfil de cliente. Pense nas frustrações, medos, desejos e obstáculos que ESTE cliente específico enfrenta.

Retorne JSON com:
- primary: 5 dores principais (mais evidentes e urgentes)
- secondary: 5 dores secundárias (importantes mas menos óbvias)
- unexplored: 3 dores inexploradas (oportunidades de conteúdo único)
`;

        const painsResponse = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um especialista em copywriting e psicologia do consumidor. Gere dores ESPECÍFICAS e PROFUNDAS para o cliente ideal fornecido." },
            { role: "user", content: painsPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "client_pains",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  primary: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pain: { type: "string" },
                        description: { type: "string" }
                      },
                      required: ["pain", "description"],
                      additionalProperties: false
                    }
                  },
                  secondary: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pain: { type: "string" },
                        description: { type: "string" }
                      },
                      required: ["pain", "description"],
                      additionalProperties: false
                    }
                  },
                  unexplored: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pain: { type: "string" },
                        description: { type: "string" }
                      },
                      required: ["pain", "description"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["primary", "secondary", "unexplored"],
                additionalProperties: false
              }
            }
          }
        });

        const painsText = painsResponse.choices[0]?.message?.content || "{}";
        let painsData;
        try {
          painsData = JSON.parse(typeof painsText === 'string' ? painsText : JSON.stringify(painsText));
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao gerar dores" });
        }

        const allPains: { level: "primary" | "secondary" | "unexplored"; pain: string; description: string }[] = [];
        if (painsData.primary) {
          painsData.primary.forEach((p: { pain: string; description: string }) => {
            allPains.push({ level: "primary", pain: p.pain, description: p.description });
          });
        }
        if (painsData.secondary) {
          painsData.secondary.forEach((p: { pain: string; description: string }) => {
            allPains.push({ level: "secondary", pain: p.pain, description: p.description });
          });
        }
        if (painsData.unexplored) {
          painsData.unexplored.forEach((p: { pain: string; description: string }) => {
            allPains.push({ level: "unexplored", pain: p.pain, description: p.description });
          });
        }

        if (allPains.length > 0) {
          await db.createPainsForClient(input.projectId, input.clientId, allPains);
        }

        return { success: true, painsCount: allPains.length, pains: painsData };
      }),
  }),

  // ===== CONTENT =====
  content: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getContentsByProject(input.projectId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const content = await db.getContentById(input.id);
        if (!content || content.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const slides = await db.getSlidesByContent(input.id);
        return { ...content, slides };
      }),

    generate: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        type: z.enum(["carousel", "image", "video"]),
        template: z.string(),
        quantity: z.number().min(1).max(10).default(1),
        painId: z.number().optional(),
        pain: z.string().optional(),
        painDescription: z.string().optional(),
        objective: z.enum(["sale", "authority", "growth"]).default("authority"),
        person: z.enum(["first", "second", "third"]).default("second"),
        platform: z.enum(["instagram", "tiktok"]).default("instagram"),
        voiceTone: z.string().default("casual"),
        clickbait: z.boolean().default(false),
        hookType: z.string().optional(),
        formula: z.string().optional(),
        idealClientId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const analysis = project.analysis as { niche?: string; businessName?: string; mainProduct?: string } | null;
        const niche = analysis?.niche || "geral";
        const businessContext = analysis ? `${analysis.businessName || ''} - ${analysis.mainProduct || ''}` : undefined;
        const batchId = nanoid();

        const templateInfo = carouselTemplates.find(t => t.id === input.template) ||
                           imageTemplates.find(t => t.id === input.template) ||
                           videoTemplates.find(t => t.id === input.template);

        // Buscar detalhes do tom de voz
        const voiceToneInfo = voiceTones.find(v => v.id === input.voiceTone);
        
        // Buscar cliente ideal se especificado
        let idealClientName: string | undefined;
        if (input.idealClientId) {
          const idealClient = await db.getIdealClientById(input.idealClientId);
          idealClientName = idealClient?.name;
        }

        const contentIds: number[] = [];

        for (let i = 0; i < input.quantity; i++) {
          const contentPrompt = prompts.generateContentPrompt({
            template: input.template,
            templateStructure: (templateInfo as { structure?: string[] })?.structure || [],
            pain: input.pain || "dor genérica",
            painDescription: input.painDescription,
            niche,
            objective: input.objective,
            person: input.person,
            platform: input.platform,
            voiceTone: input.voiceTone,
            voiceToneDetails: voiceToneInfo ? {
              characteristics: voiceToneInfo.characteristics,
              examples: voiceToneInfo.examples,
            } : undefined,
            clickbait: input.clickbait,
            hookType: input.hookType,
            formula: input.formula,
            businessContext,
            idealClient: idealClientName,
          });

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Você é um especialista em criação de conteúdo viral para redes sociais. Retorne apenas JSON válido." },
              { role: "user", content: contentPrompt }
            ]
          });

          const contentText = (typeof response.choices[0]?.message?.content === 'string' ? response.choices[0]?.message?.content : JSON.stringify(response.choices[0]?.message?.content)) || "{}";
          console.log("[Content Generate] Raw response:", contentText.substring(0, 500));
          let contentData;
          try {
            // Try to extract JSON from markdown code blocks
            let jsonStr = contentText;
            const jsonMatch = contentText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
              jsonStr = jsonMatch[1].trim();
            }
            contentData = JSON.parse(jsonStr);
          } catch (e) {
            console.error("[Content Generate] Failed to parse:", e);
            contentData = { title: "Conteúdo gerado", slides: [] };
          }
          console.log("[Content Generate] Parsed slides count:", contentData.slides?.length || 0);

          const contentId = await db.createContent({
            projectId: input.projectId,
            userId: ctx.user.id,
            type: input.type,
            template: input.template,
            title: contentData.title,
            description: contentData.description,
            hook: contentData.hook,
            hookType: input.hookType || null,
            formula: input.formula || null,
            objective: input.objective,
            person: input.person,
            clickbait: input.clickbait,
            status: "generating",
            batchId,
          });

          if (contentData.slides && Array.isArray(contentData.slides)) {
            const slidesData = contentData.slides.map((s: { order: number; text: string }, idx: number) => {
              // Gerar prompt de imagem baseado no texto do slide
              const imagePrompt = `Fotografia profissional para Instagram. Contexto: ${s.text}. Nicho: ${niche}. REGRAS: Imagem REAL sem texto, sem letras, sem números. Qualidade editorial, iluminação natural, formato 4:5.`;
              return {
                order: s.order || idx + 1,
                text: s.text,
                imagePrompt, // Prompt padrão para a imagem
                visualTemplate: visualTemplates[0]?.id || "lifestyle-editorial",
                designTemplateId: 'fullbleed-center', // Template padrão: Full + Texto Central
                colorPaletteId: 'dark-purple', // Cor padrão: Roxo Escuro
              };
            });
            await db.createSlides(contentId, slidesData);
          }

          await db.updateContent(contentId, { status: "ready" });
          contentIds.push(contentId);
        }

        return { batchId, contentIds };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        hook: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const content = await db.getContentById(input.id);
        if (!content || content.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.updateContent(input.id, {
          title: input.title,
          description: input.description,
          hook: input.hook,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const content = await db.getContentById(input.id);
        if (!content || content.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.deleteContent(input.id);
        return { success: true };
      }),
  }),

  // ===== SLIDES =====
  slides: router({
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        text: z.string().optional(),
        imageUrl: z.string().optional(),
        imagePrompt: z.string().optional(),
        selectedImageIndex: z.number().optional(),
        visualTemplate: z.string().optional(),
        designTemplateId: z.string().optional(),
        colorPaletteId: z.string().optional(),
        style: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateSlide(input.id, {
          text: input.text,
          imageUrl: input.imageUrl,
          imagePrompt: input.imagePrompt,
          selectedImageIndex: input.selectedImageIndex,
          visualTemplate: input.visualTemplate,
          designTemplateId: input.designTemplateId,
          colorPaletteId: input.colorPaletteId,
          style: input.style,
        });
        return { success: true };
      }),

    generateImage: protectedProcedure
      .input(z.object({
        slideId: z.number(),
        prompt: z.string().optional(),
        quantity: z.number().min(1).max(4).default(1),
      }))
      .mutation(async ({ input }) => {
        const imageUrls: string[] = [];
        const basePrompt = input.prompt || "Professional Instagram image, high quality, editorial style";
        const fullPrompt = `${basePrompt}

=== REGRAS OBRIGATÓRIAS ===
1. A imagem DEVE ser uma FOTOGRAFIA REAL, não ilustração, arte digital ou desenho
2. NÃO INCLUA ABSOLUTAMENTE NENHUM TEXTO na imagem - zero letras, zero palavras, zero números, zero símbolos escritos
3. NÃO inclua placas, letreiros, logos, marcas d'água, legendas ou qualquer elemento com texto
4. A imagem será usada como FUNDO em um template que já tem texto sobreposto
5. Foque apenas em elementos visuais: pessoas, objetos, cenários, texturas
6. Qualidade profissional de fotografia, iluminação natural`;
        
        for (let i = 0; i < input.quantity; i++) {
          const result = await generateImage({
            prompt: fullPrompt,
          });
          if (result.url) {
            imageUrls.push(result.url);
          }
        }

        // Get current slide to update image bank
        const currentSlide = await db.getSlideById(input.slideId);
        const currentBank = (currentSlide?.imageBank as string[]) || [];
        const newBank = [...currentBank, ...imageUrls];
        
        await db.updateSlide(input.slideId, {
          imageBank: newBank,
          imageUrl: imageUrls[0] || undefined,
          imagePrompt: input.prompt,
        });

        return { imageUrls };
      }),

    generateAllImages: protectedProcedure
      .input(z.object({
        contentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const content = await db.getContentById(input.contentId);
        if (!content || content.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const slides = await db.getSlidesByContent(input.contentId);
        const results: { slideId: number; imageUrl: string | null; error?: string }[] = [];
        
        // Armazenar a primeira imagem gerada para usar como referência de consistência
        let firstGeneratedImageUrl: string | null = null;

        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];
          try {
            const basePrompt = slide.imagePrompt || `Professional Instagram image for: ${slide.text || "lifestyle content"}`;
            let fullPrompt = `${basePrompt}

=== REGRAS OBRIGATÓRIAS ===
1. A imagem DEVE ser uma FOTOGRAFIA REAL, não ilustração, arte digital ou desenho
2. NÃO INCLUA ABSOLUTAMENTE NENHUM TEXTO na imagem - zero letras, zero palavras, zero números, zero símbolos escritos
3. NÃO inclua placas, letreiros, logos, marcas d'água, legendas ou qualquer elemento com texto
4. A imagem será usada como FUNDO em um template que já tem texto sobreposto
5. Foque apenas em elementos visuais: pessoas, objetos, cenários, texturas
6. Qualidade profissional de fotografia, iluminação natural`;
            
            // Se já temos uma imagem de referência (slide 1), usar para consistência
            // Isso mantém a mesma pessoa/personagem em todos os slides
            if (i > 0 && firstGeneratedImageUrl) {
              fullPrompt += `\n\n=== CONSISTÊNCIA DE PERSONAGEM - OBRIGATÓRIO ===
VOCÊ DEVE manter EXATAMENTE a mesma pessoa da imagem de referência.
Copie fielmente: rosto, cabelo, tom de pele, tipo físico, idade aparente.
A pessoa deve ser IDENTIFICÁVEL como a mesma em todas as imagens.
Mude apenas o contexto/cenário/roupa conforme o texto do slide.
ISTO É CRÍTICO: a consistência visual do personagem é essencial.`;
              
              const result = await generateImage({
                prompt: fullPrompt,
                originalImages: [{
                  url: firstGeneratedImageUrl,
                  mimeType: "image/jpeg"
                }]
              });

              if (result.url) {
                const currentBank = (slide.imageBank as string[]) || [];
                const newBank = [...currentBank, result.url];
                
                await db.updateSlide(slide.id, {
                  imageBank: newBank,
                  imageUrl: result.url,
                });

                results.push({ slideId: slide.id, imageUrl: result.url });
              } else {
                results.push({ slideId: slide.id, imageUrl: null, error: "Falha ao gerar" });
              }
            } else {
              // Primeiro slide: gerar normalmente e salvar como referência
              const result = await generateImage({
                prompt: fullPrompt,
              });

              if (result.url) {
                // Salvar a primeira imagem como referência para consistência
                if (i === 0) {
                  firstGeneratedImageUrl = result.url;
                }
                
                const currentBank = (slide.imageBank as string[]) || [];
                const newBank = [...currentBank, result.url];
                
                await db.updateSlide(slide.id, {
                  imageBank: newBank,
                  imageUrl: result.url,
                });

                results.push({ slideId: slide.id, imageUrl: result.url });
              } else {
                results.push({ slideId: slide.id, imageUrl: null, error: "Falha ao gerar" });
              }
            }
          } catch (error) {
            results.push({ slideId: slide.id, imageUrl: null, error: String(error) });
          }
        }

        return { results, totalGenerated: results.filter(r => r.imageUrl).length };
      }),

    uploadImage: protectedProcedure
      .input(z.object({
        slideId: z.number(),
        imageUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        const currentSlide = await db.getSlideById(input.slideId);
        const currentBank = (currentSlide?.imageBank as string[]) || [];
        const newBank = [...currentBank, input.imageUrl];
        
        await db.updateSlide(input.slideId, {
          imageBank: newBank,
          imageUrl: input.imageUrl,
        });

        return { success: true };
      }),

    // Atualizar template de design do slide
    updateDesignTemplate: protectedProcedure
      .input(z.object({
        slideId: z.number(),
        designTemplateId: z.string(),
        colorPaletteId: z.string().optional(),
        customColors: z.object({
          background: z.string().optional(),
          text: z.string().optional(),
          accent: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateSlide(input.slideId, {
          designTemplateId: input.designTemplateId,
          colorPaletteId: input.colorPaletteId,
          customColors: input.customColors,
        });
        return { success: true };
      }),

    // Salvar imagem renderizada do slide
    saveRenderedImage: protectedProcedure
      .input(z.object({
        slideId: z.number(),
        base64: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64
        const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const key = `rendered/${ctx.user.id}/${Date.now()}-slide-${input.slideId}.png`;
        
        // Upload to S3
        const { url } = await storagePut(key, buffer, 'image/png');
        
        // Update slide with rendered image URL
        await db.updateSlide(input.slideId, {
          renderedImageUrl: url,
        });
        
        return { url };
      }),
  }),

  // ===== INFLUENCERS =====
  influencers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getInfluencersByUser(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const influencer = await db.getInfluencerById(input.id);
        if (!influencer || influencer.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const contents = await db.getInfluencerContentsByInfluencer(input.id);
        return { ...influencer, contents };
      }),

    generateReferencePhotos: protectedProcedure
      .input(z.object({
        name: z.string(),
        niche: z.string(),
        description: z.string(),
        type: z.enum(["normal", "transformation"]).default("normal"),
      }))
      .mutation(async ({ ctx, input }) => {
        const prompt = `Foto profissional para Instagram de um influenciador digital.
Nome: ${input.name}
Nicho: ${input.niche}
Descrição física: ${input.description}

REGRA PRIMORDIAL: A imagem deve ser REAL e SEM NENHUM TEXTO. Não inclua letras, palavras, números ou qualquer elemento textual na imagem.

A foto deve:
- Ser uma FOTOGRAFIA REAL, não ilustração ou arte digital
- Parecer natural e autêntica
- Ter qualidade profissional de fotografia
- Mostrar a pessoa de forma atraente e confiável
- Ser adequada para perfil de Instagram
- Formato retrato 4:5
- Iluminação natural e ambiente agradável
- NÃO CONTER ABSOLUTAMENTE NENHUM TEXTO, LETRA, PALAVRA OU NÚMERO`;

        const photos: string[] = [];
        for (let i = 0; i < 3; i++) {
          try {
            const result = await generateImage({ prompt });
            if (result.url) {
              photos.push(result.url);
            }
          } catch (e) {
            console.error("Erro ao gerar foto", i, e);
          }
        }
        return { photos };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        niche: z.string().optional(),
        type: z.enum(["normal", "transformation"]).default("normal"),
        description: z.string().optional(),
        referenceImageUrl: z.string().optional(),
        beforeImageUrl: z.string().optional(),
        afterImageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createInfluencer({
          userId: ctx.user.id,
          name: input.name,
          niche: input.niche || null,
          type: input.type,
          description: input.description || null,
          referenceImageUrl: input.referenceImageUrl || null,
          beforeImageUrl: input.beforeImageUrl || null,
          afterImageUrl: input.afterImageUrl || null,
        });
        return { id };
      }),

    // Gerar fotos de perfil automáticas para o influenciador
    generateProfilePhotos: protectedProcedure
      .input(z.object({
        influencerId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const influencer = await db.getInfluencerById(input.influencerId);
        if (!influencer || influencer.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (!influencer.referenceImageUrl) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Influenciador precisa ter uma foto de referência" });
        }

        const profilePhotos: { type: string; url: string; prompt: string }[] = [];

        // Tipos de fotos a gerar
        const photoTypes = [
          {
            type: "profile",
            prompt: `Foto de perfil profissional para Instagram.
A MESMA PESSOA da foto de referência, mantendo EXATAMENTE as mesmas características físicas.
Foto em primeiro plano (close-up), sorriso natural, olhando para a câmera.
Iluminação suave e favorecedora.
Fundo neutro ou levemente desfocado.
REGRA PRIMORDIAL: Imagem REAL, SEM NENHUM TEXTO. Foto tirada pelo próprio influenciador (selfie profissional).`
          },
          {
            type: "lifestyle",
            prompt: `Foto lifestyle para feed do Instagram.
A MESMA PESSOA da foto de referência, mantendo EXATAMENTE as mesmas características físicas.
Foto casual mostrando o dia a dia, ambiente relacionado ao nicho ${influencer.niche || "lifestyle"}.
Pose natural e descontraída.
REGRA PRIMORDIAL: Imagem REAL, SEM NENHUM TEXTO. Foto em primeira pessoa, como se fosse tirada por um amigo.`
          },
          {
            type: "action",
            prompt: `Foto de ação/atividade para Instagram.
A MESMA PESSOA da foto de referência, mantendo EXATAMENTE as mesmas características físicas.
Foto realizando atividade relacionada ao nicho ${influencer.niche || "lifestyle"}.
Expressão engajada e autêntica.
REGRA PRIMORDIAL: Imagem REAL, SEM NENHUM TEXTO. Foto em primeira pessoa, selfie ou foto tirada por amigo.`
          },
        ];

        // Se for tipo transformação, adicionar foto "antes"
        if (influencer.type === "transformation") {
          photoTypes.unshift({
            type: "before",
            prompt: `Foto "ANTES" para conteúdo de transformação.
A MESMA PESSOA da foto de referência, mas em uma versão anterior (antes da transformação).
Mostrar a pessoa de forma natural, sem maquiagem elaborada, iluminação comum.
Pose simples, expressão neutra ou levemente insatisfeita.
Nicho: ${influencer.niche || "lifestyle"}
REGRA PRIMORDIAL: Imagem REAL, SEM NENHUM TEXTO. Selfie casual.`
          });
        }

        // Gerar cada foto usando a referência
        for (const photoType of photoTypes) {
          try {
            const result = await generateImage({
              prompt: photoType.prompt,
              originalImages: [{
                url: influencer.referenceImageUrl,
                mimeType: "image/jpeg"
              }]
            });
            if (result.url) {
              profilePhotos.push({
                type: photoType.type,
                url: result.url,
                prompt: photoType.prompt
              });
            }
          } catch (e) {
            console.error("Erro ao gerar foto de perfil", photoType.type, e);
          }
        }

        // Salvar fotos no banco (criar tabela ou usar campo JSON)
        // Por enquanto, retornar as fotos geradas
        return { photos: profilePhotos };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const influencer = await db.getInfluencerById(input.id);
        if (!influencer || influencer.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.deleteInfluencer(input.id);
        return { success: true };
      }),

    getContent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const content = await db.getInfluencerContentById(input.id);
        if (!content || content.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const slides = await db.getInfluencerSlidesByContent(input.id);
        return { ...content, slides };
      }),

    generateContent: protectedProcedure
      .input(z.object({
        influencerId: z.number(),
        template: z.string(),
        product: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const influencer = await db.getInfluencerById(input.influencerId);
        if (!influencer || influencer.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const response = await invokeLLM({
          messages: [
            { 
              role: "system", 
              content: `Você é um especialista em marketing de influência e soft sell.
Crie conteúdo para o influenciador virtual ${influencer.name}.
Descrição: ${influencer.description || "Influenciador digital"}
Template: ${input.template}
${input.product ? `Produto/Serviço: ${input.product}` : "Conteúdo de autoridade sem venda direta"}

O conteúdo deve parecer natural e autêntico, não vendedor demais.`
            },
            { role: "user", content: `Gere um conteúdo de carrossel no formato ${input.template} para Instagram.` }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "influencer_content",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Título do conteúdo" },
                  description: { type: "string", description: "Descrição para legenda" },
                  hook: { type: "string", description: "Frase de gancho inicial" },
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        order: { type: "integer", description: "Ordem do slide" },
                        text: { type: "string", description: "Texto do slide (máx 100 caracteres)" }
                      },
                      required: ["order", "text"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["title", "description", "hook", "slides"],
                additionalProperties: false
              }
            }
          }
        });

        const contentText = response.choices[0]?.message?.content || "{}";
        let contentData;
        try {
          contentData = JSON.parse(typeof contentText === 'string' ? contentText : JSON.stringify(contentText));
        } catch {
          contentData = { title: "Conteúdo de influenciador", description: "", hook: "", slides: [] };
        }

        const contentId = await db.createInfluencerContent({
          influencerId: input.influencerId,
          userId: ctx.user.id,
          type: "carousel",
          template: input.template,
          title: contentData.title || "Conteúdo",
          description: contentData.description || null,
          hook: contentData.hook || null,
          status: "ready",
        });

        if (contentData.slides && Array.isArray(contentData.slides)) {
          const slidesData = contentData.slides.map((s: { order?: number; text: string }, idx: number) => ({
            order: s.order || idx + 1,
            text: s.text || "",
          }));
          if (slidesData.length > 0) {
            await db.createInfluencerSlides(contentId, slidesData);
          }
        }

        return { contentId };
      }),

    generateSlideImage: protectedProcedure
      .input(z.object({
        slideId: z.number(),
        influencerId: z.number(),
        slideText: z.string(),
        context: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const influencer = await db.getInfluencerById(input.influencerId);
        if (!influencer || influencer.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (!influencer.referenceImageUrl) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Influenciador não tem imagem de referência" });
        }

        const prompt = `Gere uma foto em PRIMEIRA PESSOA como se fosse tirada pelo próprio influenciador.

A IMAGEM DE REFERÊNCIA ANEXADA é a pessoa que deve aparecer na foto. Use-a como base para manter consistência física absoluta.

Nicho: ${influencer.niche || "lifestyle"}
Contexto da foto: ${input.slideText}
${input.context ? `Contexto adicional: ${input.context}` : ""}

REGRAS PRIMORDIAIS (NÃO ALTERAR):
1. IMAGEM REAL SEM NENHUM TEXTO - Não inclua letras, palavras, números ou qualquer elemento textual
2. FOTO EM PRIMEIRA PESSOA - Como se o influenciador estivesse tirando a própria foto (selfie, foto no espelho, foto com braço estendido, ou foto tirada por amigo próximo)
3. CONSISTÊNCIA FÍSICA - A pessoa na foto DEVE ser idêntica à imagem de referência (mesmas características físicas, rosto, corpo, cabelo)
4. NATURALIDADE - A foto deve parecer real, espontânea, como posts reais de influenciadores
5. QUALIDADE - Foto de alta qualidade mas natural, não muito produzida

Estilo da foto:
- Selfie casual ou foto tirada por amigo
- Iluminação natural ou de ambiente
- Enquadramento típico de Instagram (4:5)
- Cenário condizente com o contexto
- Expressão facial natural e autêntica

Lembre-se: Esta foto será postada como se fosse do próprio influenciador, então deve parecer 100% autêntica e em primeira pessoa.`;

        const result = await generateImage({
          prompt,
          originalImages: [{
            url: influencer.referenceImageUrl,
            mimeType: "image/jpeg"
          }]
        });

        if (result.url) {
          await db.updateInfluencerSlide(input.slideId, { imageUrl: result.url });
        }

        return { imageUrl: result.url };
      }),

    generateAllSlideImages: protectedProcedure
      .input(z.object({
        contentId: z.number(),
        influencerId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const influencer = await db.getInfluencerById(input.influencerId);
        if (!influencer || influencer.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (!influencer.referenceImageUrl) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Influenciador não tem imagem de referência" });
        }

        const slides = await db.getInfluencerSlidesByContent(input.contentId);
        const results: { slideId: number; imageUrl?: string }[] = [];

        for (const slide of slides) {
          const prompt = `Gere uma foto em PRIMEIRA PESSOA como se fosse tirada pelo próprio influenciador.

A IMAGEM DE REFERÊNCIA ANEXADA é a pessoa que deve aparecer na foto. Use-a como base para manter consistência física absoluta.

Nicho: ${influencer.niche || "lifestyle"}
Contexto da foto: ${slide.text}

REGRAS PRIMORDIAIS (NÃO ALTERAR):
1. IMAGEM REAL SEM NENHUM TEXTO - Não inclua letras, palavras, números ou qualquer elemento textual
2. FOTO EM PRIMEIRA PESSOA - Como se o influenciador estivesse tirando a própria foto (selfie, foto no espelho, foto com braço estendido, ou foto tirada por amigo próximo)
3. CONSISTÊNCIA FÍSICA - A pessoa na foto DEVE ser idêntica à imagem de referência (mesmas características físicas, rosto, corpo, cabelo)
4. NATURALIDADE - A foto deve parecer real, espontânea, como posts reais de influenciadores
5. QUALIDADE - Foto de alta qualidade mas natural, não muito produzida

Estilo da foto:
- Selfie casual ou foto tirada por amigo
- Iluminação natural ou de ambiente
- Enquadramento típico de Instagram (4:5)
- Cenário condizente com o contexto
- Expressão facial natural e autêntica

Lembre-se: Esta foto será postada como se fosse do próprio influenciador, então deve parecer 100% autêntica e em primeira pessoa.`;

          try {
            const result = await generateImage({
              prompt,
              originalImages: [{
                url: influencer.referenceImageUrl,
                mimeType: "image/jpeg"
              }]
            });

            if (result.url) {
              await db.updateInfluencerSlide(slide.id, { imageUrl: result.url });
              results.push({ slideId: slide.id, imageUrl: result.url });
            }
          } catch (e) {
            console.error("Erro ao gerar imagem do slide", slide.id, e);
            results.push({ slideId: slide.id });
          }
        }

        return { results };
      }),
  }),

  // ===== TRENDS =====
  trends: router({
    list: protectedProcedure
      .input(z.object({ source: z.enum(["google", "tiktok"]).optional(), limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getTrendsByUser(ctx.user.id, input?.source, input?.limit);
      }),

    collect: protectedProcedure
      .input(z.object({ source: z.enum(["google", "tiktok"]) }))
      .mutation(async ({ ctx, input }) => {
        // Gerar trends diretamente com análise usando response_format
        const sourcePrompt = input.source === "google" 
          ? `Liste 15 tendências de busca do Google Brasil em dezembro de 2024.
Inclua: notícias, esportes, entretenimento, celebridades, tecnologia, comportamento.`
          : `Liste 15 tendências do TikTok Brasil em dezembro de 2024.
Inclua: sons virais, hashtags, desafios, danças, formatos de vídeo, trends de humor.`;

        const response = await invokeLLM({
          messages: [
            { 
              role: "system", 
              content: `Você é um especialista em tendências virais do Brasil.
Gere tendências REALISTAS e ATUAIS baseadas no seu conhecimento.
Para cada tendência, analise e classifique.` 
            },
            { role: "user", content: sourcePrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "trends_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  trends: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nome da tendência" },
                        category: { type: "string", description: "Categoria: Moda, Tech, Fitness, Humor, Música, Entretenimento, Esportes, Política, Economia, Lifestyle" },
                        classification: { type: "string", enum: ["emerging", "rising", "peak", "declining"], description: "Fase da tendência" },
                        viralProbability: { type: "number", description: "Probabilidade de viralizar 0-100" },
                        suggestedNiches: { type: "array", items: { type: "string" }, description: "Nichos que podem aproveitar" }
                      },
                      required: ["name", "category", "classification", "viralProbability", "suggestedNiches"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["trends"],
                additionalProperties: false
              }
            }
          }
        });

        let trendsData: { trends: Array<{ name: string; category: string; classification: string; viralProbability: number; suggestedNiches: string[] }> } = { trends: [] };
        try {
          const content = response.choices[0]?.message?.content;
          if (typeof content === 'string') {
            trendsData = JSON.parse(content);
          }
        } catch (e) {
          console.error("Failed to parse trends:", e);
          return { count: 0 };
        }

        if (trendsData.trends && trendsData.trends.length > 0) {
          const trendsToSave = trendsData.trends.map((t) => ({
            source: input.source,
            name: t.name,
            category: t.category || null,
            classification: t.classification as "emerging" | "rising" | "peak" | "declining" || null,
            viralProbability: t.viralProbability || null,
            suggestedNiches: t.suggestedNiches || null,
          }));
          await db.createTrends(ctx.user.id, trendsToSave);
          return { count: trendsToSave.length };
        }

        return { count: 0 };
      }),
  }),

  // ===== VIRALS =====
  virals: router({
    list: protectedProcedure
      .input(z.object({ source: z.enum(["viralhog", "reddit"]).optional(), limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getViralsByUser(ctx.user.id, input?.source, input?.limit);
      }),

    collect: protectedProcedure
      .input(z.object({ source: z.enum(["viralhog", "reddit"]) }))
      .mutation(async ({ ctx, input }) => {
        const sourcePrompt = input.source === "viralhog"
          ? `Analise conteúdos virais recentes do ViralHog (vídeos virais de situações engraçadas, animais, fails, momentos incríveis).
Identifique 12 tipos de conteúdo viral que estão em alta em dezembro de 2024.
Inclua: vídeos de animais, fails engraçados, momentos fofos, situações inesperadas, reações humorísticas.`
          : `Analise conteúdos virais recentes do Reddit (posts populares de subreddits como r/funny, r/aww, r/nextfuckinglevel, r/MadeMeSmile, r/brasil).
Identifique 12 tipos de conteúdo viral que estão em alta em dezembro de 2024.
Inclua: memes, histórias engraçadas, vídeos satisfatórios, discussões populares, conteúdo brasileiro.`;

        const response = await invokeLLM({
          messages: [
            { 
              role: "system", 
              content: `Você é um especialista em conteúdo viral da internet.
Gere conteúdos virais REALISTAS baseados em padrões atuais.
Para cada viral, sugira nichos que podem adaptar e ângulos de abordagem.` 
            },
            { role: "user", content: sourcePrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "virals_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  virals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Título/descrição do conteúdo viral" },
                        category: { type: "string", description: "Categoria: Humor, Animais, Fails, Inspiração, Satisfatório, Memes, Lifestyle, Tech" },
                        viralProbability: { type: "number", description: "Probabilidade de viralizar 0-100" },
                        suggestedNiches: { type: "array", items: { type: "string" }, description: "Nichos que podem adaptar" },
                        suggestedAngles: { type: "array", items: { type: "string" }, description: "Ângulos de adaptação" }
                      },
                      required: ["title", "category", "viralProbability", "suggestedNiches", "suggestedAngles"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["virals"],
                additionalProperties: false
              }
            }
          }
        });

        let viralsData: { virals: Array<{ title: string; category: string; viralProbability: number; suggestedNiches: string[]; suggestedAngles: string[] }> } = { virals: [] };
        try {
          const content = response.choices[0]?.message?.content;
          if (typeof content === 'string') {
            viralsData = JSON.parse(content);
          }
        } catch (e) {
          console.error("Failed to parse virals:", e);
          return { count: 0 };
        }

        if (viralsData.virals && viralsData.virals.length > 0) {
          const viralsToSave = viralsData.virals.map((v) => ({
            source: input.source,
            title: v.title,
            category: v.category || null,
            viralProbability: v.viralProbability || null,
            suggestedNiches: v.suggestedNiches || null,
            suggestedAngles: v.suggestedAngles || null,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          }));
          await db.createVirals(ctx.user.id, viralsToSave);
          return { count: viralsToSave.length };
        }

        return { count: 0 };
      }),
  }),

  // ===== SETTINGS =====
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSettings(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        defaultStyle: z.any().optional(),
        trendAlertEnabled: z.boolean().optional(),
        trendAlertThreshold: z.number().optional(),
        trendAlertCategories: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserSettings(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ===== STATS/HISTORY =====
  stats: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getContentStats(ctx.user.id);
    }),

    recentContents: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        return db.getRecentContents(ctx.user.id, input.limit);
      }),
  }),

  // ===== IMAGE PROXY =====
  proxy: router({
    getImage: publicProcedure
      .input(z.object({ url: z.string() }))
      .query(async ({ input }) => {
        try {
          const response = await fetch(input.url);
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const contentType = response.headers.get("content-type") || "image/jpeg";
          return { data: `data:${contentType};base64,${base64}` };
        } catch {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to fetch image" });
        }
      }),
  }),

  // ===== CREDITS =====
  credits: router({
    // Obter saldo de créditos do usuário
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const credits = await db.getOrCreateUserCredits(ctx.user.id);
      return { balance: credits.balance };
    }),

    // Obter histórico de transações
    getTransactions: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getCreditTransactions(ctx.user.id, input?.limit || 50);
      }),

    // Obter pacotes de créditos disponíveis
    getPackages: publicProcedure.query(async () => {
      const packages = await db.getActiveCreditPackages();
      if (packages.length === 0) {
        // Retornar pacotes padrão se não houver no banco
        return [
          { id: 1, name: "Starter", credits: 30, priceInCents: 3990, isFeatured: false },
          { id: 2, name: "Popular", credits: 100, priceInCents: 9990, isFeatured: true },
          { id: 3, name: "Pro", credits: 300, priceInCents: 24990, isFeatured: false },
        ];
      }
      return packages;
    }),

    // Obter providers disponíveis
    getProviders: publicProcedure.query(() => {
      return {
        image: [
          { name: "omniinfer", displayName: "OmniInfer (Econômico)", creditsPerUse: 1, quality: "economy" },
          { name: "dezgo", displayName: "Dezgo (Econômico)", creditsPerUse: 1, quality: "economy" },
          { name: "replicate", displayName: "Replicate FLUX (Padrão)", creditsPerUse: 2, quality: "standard" },
          { name: "runware", displayName: "Runware (Padrão)", creditsPerUse: 2, quality: "standard" },
          { name: "manus", displayName: "Manus AI (Premium)", creditsPerUse: 2, quality: "premium" },
        ],
        video: [
          { name: "kenburns", displayName: "Ken Burns (Local)", creditsPerUse: 3, quality: "economy" },
          { name: "replicate_wan", displayName: "Replicate Wan 480p", creditsPerUse: 15, quality: "standard" },
          { name: "replicate_wan_hd", displayName: "Replicate Wan 720p HD", creditsPerUse: 30, quality: "premium" },
          { name: "runware_luma", displayName: "Runware Luma (Premium)", creditsPerUse: 40, quality: "premium" },
        ],
      };
    }),

    // Consumir créditos para geração
    consume: protectedProcedure
      .input(z.object({
        amount: z.number().positive(),
        type: z.enum(["image", "video"]),
        provider: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar saldo
        const credits = await db.getOrCreateUserCredits(ctx.user.id);
        if (credits.balance < input.amount) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: `Créditos insuficientes. Você tem ${credits.balance} créditos, mas precisa de ${input.amount}.` 
          });
        }
        
        // Consumir créditos
        const result = await db.useCredits(
          ctx.user.id, 
          input.amount, 
          input.description || `Geração de ${input.type} via ${input.provider}`,
          input.provider,
          input.type
        );
        
        if (!result.success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error || "Falha ao consumir créditos" });
        }
        
        return { success: true, newBalance: result.newBalance, consumed: input.amount };
      }),

    // Adicionar créditos bônus (admin only)
    addBonus: protectedProcedure
      .input(z.object({
        userId: z.number(),
        amount: z.number().positive(),
        description: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem adicionar bônus" });
        }
        const newBalance = await db.addBonusCredits(input.userId, input.amount, input.description);
        return { success: true, newBalance };
      }),
  }),

  // ===== USER MEDIA =====
  media: router({
    // Upload de mídia
    upload: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        type: z.enum(["image", "video"]),
        mimeType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64
        const base64Data = input.base64.replace(/^data:(image|video)\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const ext = input.mimeType?.split('/')[1] || (input.type === 'image' ? 'png' : 'mp4');
        const key = `media/${ctx.user.id}/${Date.now()}-${nanoid()}.${ext}`;
        
        // Upload to S3
        const { url } = await storagePut(key, buffer, input.mimeType || `${input.type}/${ext}`);
        
        // Save to database
        const mediaId = await db.createUserMedia({
          userId: ctx.user.id,
          type: input.type,
          source: "upload",
          url,
          filename: input.filename,
          mimeType: input.mimeType,
          size: buffer.length,
        });
        
        return { id: mediaId, url };
      }),

    // Salvar mídia gerada por IA
    saveGenerated: protectedProcedure
      .input(z.object({
        url: z.string(),
        type: z.enum(["image", "video"]),
        prompt: z.string().optional(),
        provider: z.string().optional(),
        projectId: z.number().optional(),
        contentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const mediaId = await db.createUserMedia({
          userId: ctx.user.id,
          type: input.type,
          source: "generated",
          url: input.url,
          prompt: input.prompt,
          provider: input.provider,
          projectId: input.projectId,
          contentId: input.contentId,
        });
        
        return { id: mediaId };
      }),

    // Listar mídia do usuário
    list: protectedProcedure
      .input(z.object({
        type: z.enum(["image", "video"]).optional(),
        source: z.enum(["upload", "generated"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserMediaByUser(ctx.user.id, input);
      }),

    // Obter mídia por ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const media = await db.getUserMediaById(input.id);
        if (!media || media.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Mídia não encontrada" });
        }
        return media;
      }),

    // Excluir mídia
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const media = await db.getUserMediaById(input.id);
        if (!media || media.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Mídia não encontrada" });
        }
        await db.deleteUserMedia(input.id);
        return { success: true };
      }),

    // Contar mídia
    count: protectedProcedure
      .input(z.object({ type: z.enum(["image", "video"]).optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserMediaCount(ctx.user.id, input?.type);
      }),

    // Buscar mídia
    search: protectedProcedure
      .input(z.object({
        query: z.string(),
        type: z.enum(["image", "video"]).optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.searchUserMedia(ctx.user.id, input.query, { type: input.type, limit: input.limit });
      }),
  }),

  // ===== STRIPE/PAYMENTS =====
  payments: router({
    // Criar sessão de checkout
    createCheckout: protectedProcedure
      .input(z.object({
        packageId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCheckoutSession } = await import("./stripe");
        const baseUrl = process.env.VITE_APP_URL || "http://localhost:3000";
        
        const result = await createCheckoutSession(
          ctx.user.id,
          ctx.user.email || "",
          input.packageId,
          `${baseUrl}/credits?success=true`,
          `${baseUrl}/credits?canceled=true`
        );
        
        return result;
      }),

    // Verificar status do Stripe
    getStatus: publicProcedure.query(async () => {
      const { isStripeConfigured } = await import("./stripe");
      return { configured: isStripeConfigured() };
    }),
  }),

  // ===== TOPICS & NEWS (ASSUNTOS) =====
  topics: router({
    // Listar assuntos de um projeto
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getTopicsByProject(input.projectId);
      }),

    // Buscar notícias sobre um assunto
    search: protectedProcedure
      .input(z.object({ 
        projectId: z.number(),
        query: z.string(),
        limit: z.number().min(1).max(10).default(5),
        dateFilter: z.enum(["last_week", "last_month", "last_3_months", "all"]).optional(),
        sourceFilter: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Importar função de busca de notícias
        const { searchNews } = await import("./newsSearch");
        
        // Buscar notícias
        const articles = await searchNews(input.query, input.limit, input.dateFilter, input.sourceFilter);
        
        // Criar tópico
        const topicId = await db.createTopic(input.projectId, input.query);
        
        // Salvar notícias
        if (articles.length > 0) {
          await db.createNews(topicId, articles.map(a => ({
            title: a.title,
            description: a.description,
            url: a.url,
            source: a.source,
            publishedAt: a.publishedAt,
            imageUrl: a.imageUrl,
            isSelected: false,
            isManual: false,
          })));
        }
        
        return { topicId, count: articles.length };
      }),

    // Obter notícias de um assunto
    getNews: protectedProcedure
      .input(z.object({ topicId: z.number() }))
      .query(async ({ ctx, input }) => {
        const topic = await db.getTopicById(input.topicId);
        if (!topic) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const project = await db.getProjectById(topic.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const newsList = await db.getNewsByTopic(input.topicId);
        return { topic, news: newsList };
      }),

    // Selecionar/desselecionar notícia
    toggleNewsSelection: protectedProcedure
      .input(z.object({ 
        newsId: z.number(),
        isSelected: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const newsItem = await db.getNewsById(input.newsId);
        if (!newsItem) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const topic = await db.getTopicById(newsItem.topicId);
        if (!topic) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const project = await db.getProjectById(topic.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        await db.updateNews(input.newsId, { isSelected: input.isSelected });
        return { success: true };
      }),

    // Deletar assunto e suas notícias
    delete: protectedProcedure
      .input(z.object({ topicId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const topic = await db.getTopicById(input.topicId);
        if (!topic) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const project = await db.getProjectById(topic.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        await db.deleteTopic(input.topicId);
        return { success: true };
      }),

    // Adicionar notícia manualmente
    addManualNews: protectedProcedure
      .input(z.object({
        topicId: z.number(),
        title: z.string().min(1),
        description: z.string().min(1),
        source: z.string().min(1),
        url: z.string().optional(),
        publishedAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const topic = await db.getTopicById(input.topicId);
        if (!topic) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const project = await db.getProjectById(topic.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        // Criar notícia manual
        await db.createNews(input.topicId, [{
          title: input.title,
          description: input.description,
          url: input.url || null,
          source: input.source,
          publishedAt: input.publishedAt || new Date().toISOString(),
          imageUrl: null,
          isSelected: true, // notícias manuais já começam selecionadas
          isManual: true,
        }]);
        
        return { success: true };
      }),

    // Obter notícias selecionadas do projeto
    getSelectedNews: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getSelectedNewsByProject(input.projectId);
      }),

    // Gerar conteúdo a partir de notícia + nicho
    generateContentFromNews: protectedProcedure
      .input(z.object({
        newsId: z.number(),
        projectId: z.number(),
        type: z.enum(["carousel", "image", "video"]),
        template: z.string(),
        quantity: z.number().min(1).max(10).default(1),
        objective: z.enum(["sale", "authority", "growth"]).default("authority"),
        person: z.enum(["first", "second", "third"]).default("second"),
        platform: z.enum(["instagram", "tiktok"]).default("instagram"),
        voiceTone: z.string().default("casual"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar projeto
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Buscar notícia
        const news = await db.getNewsById(input.newsId);
        if (!news) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Notícia não encontrada" });
        }

        const analysis = project.analysis as { niche?: string; businessName?: string; mainProduct?: string } | null;
        const niche = analysis?.niche || "geral";
        const businessContext = analysis ? `${analysis.businessName || ''} - ${analysis.mainProduct || ''}` : undefined;
        const batchId = nanoid();

        const templateInfo = carouselTemplates.find(t => t.id === input.template) ||
                           imageTemplates.find(t => t.id === input.template) ||
                           videoTemplates.find(t => t.id === input.template);

        const voiceToneInfo = voiceTones.find(v => v.id === input.voiceTone);
        
        const contentIds: number[] = [];

        for (let i = 0; i < input.quantity; i++) {
          // Prompt especial que conecta notícia com nicho
          const newsAnglePrompt = `
Você é um especialista em criar conteúdo viral para redes sociais.

NOTÍCIA ATUAL:
Título: ${news.title}
Descrição: ${news.description}
Fonte: ${news.source}
Data: ${news.publishedAt}

NICHO DO NEGÓCIO: ${niche}
${businessContext ? `Contexto: ${businessContext}` : ''}

Sua tarefa:
1. Analise a notícia e identifique o GANCHO/ÂNGULO que conecta ela com o nicho "${niche}"
2. Crie conteúdo ${input.type === 'carousel' ? 'em carrossel' : input.type === 'image' ? 'de imagem única' : 'de vídeo'} usando o template "${input.template}"
3. Objetivo: ${input.objective === 'sale' ? 'vender' : input.objective === 'authority' ? 'gerar autoridade' : 'crescer audiência'}
4. Pessoa gramatical: ${input.person === 'first' ? '1ª pessoa (eu/nós)' : input.person === 'second' ? '2ª pessoa (você)' : '3ª pessoa (ele/ela)'}
5. Plataforma: ${input.platform}
6. Tom de voz: ${input.voiceTone}${voiceToneInfo ? ` - ${voiceToneInfo.characteristics.join(', ')}` : ''}

ESTRUTURA DO TEMPLATE:
${(templateInfo as { structure?: string[] })?.structure?.map((s, i) => `Slide ${i + 1}: ${s}`).join('\n') || 'Estrutura padrão'}

IMPORTANTE:
- Conecte a notícia com o nicho de forma NATURAL e RELEVANTE
- Use a notícia como GANCHO inicial, mas foque no valor para o nicho
- Não force a conexão - encontre o ângulo verdadeiro
- Gere conteúdo ACIONÁVEL e ÚTIL para quem trabalha com "${niche}"

Retorne JSON válido:
{
  "title": "Título do conteúdo",
  "angle": "Explicação do gancho/ângulo usado para conectar notícia + nicho",
  "slides": [
    { "text": "Texto do slide 1", "imagePrompt": "Prompt para gerar imagem" },
    ...
  ]
}
`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Você é um especialista em criar conteúdo viral para redes sociais conectando notícias atuais com nichos específicos. Retorne apenas JSON válido." },
              { role: "user", content: newsAnglePrompt }
            ]
          });

          const contentText = (typeof response.choices[0]?.message?.content === 'string' ? response.choices[0]?.message?.content : JSON.stringify(response.choices[0]?.message?.content)) || "{}";
          let contentData;
          try {
            let jsonStr = contentText;
            const jsonMatch = contentText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
              jsonStr = jsonMatch[1].trim();
            }
            contentData = JSON.parse(jsonStr);
          } catch (e) {
            console.error("[News Content Generate] Failed to parse:", e);
            contentData = { title: "Conteúdo gerado", angle: "", slides: [] };
          }

          const contentId = await db.createContent({
            projectId: input.projectId,
            userId: ctx.user.id,
            title: contentData.title || `Conteúdo baseado em: ${news.title.substring(0, 50)}...`,
            type: input.type,
            template: input.template,
            batchId,
            metadata: {
              newsId: input.newsId,
              newsTitle: news.title,
              angle: contentData.angle,
              objective: input.objective,
              person: input.person,
              platform: input.platform,
              voiceTone: input.voiceTone,
            },
          });

          contentIds.push(contentId);

          if (contentData.slides && Array.isArray(contentData.slides)) {
            for (let slideIndex = 0; slideIndex < contentData.slides.length; slideIndex++) {
              const slide = contentData.slides[slideIndex];
              await db.createSlide({
                contentId,
                slideNumber: slideIndex + 1,
                text: slide.text || "",
                imagePrompt: slide.imagePrompt || "",
                imageUrl: null,
              });
            }
          }
        }

        return { contentIds, batchId };
      }),
  }),

  // ===== PROVIDERS =====
  providers: router({
    // Obter providers de imagem disponíveis
    getImageProviders: publicProcedure.query(() => {
      const { IMAGE_PROVIDERS } = require("./providers/index");
      return Object.values(IMAGE_PROVIDERS).map((p: any) => ({
        name: p.name,
        displayName: p.displayName,
        creditsPerUse: p.creditsPerUse,
        quality: p.quality,
      }));
    }),

    // Obter providers de vídeo disponíveis
    getVideoProviders: publicProcedure.query(() => {
      const { VIDEO_PROVIDERS } = require("./providers/index");
      return Object.values(VIDEO_PROVIDERS).map((p: any) => ({
        name: p.name,
        displayName: p.displayName,
        creditsPerUse: p.creditsPerUse,
        quality: p.quality,
      }));
    }),
  }),
});

export type AppRouter = typeof appRouter;
