import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-ideal-clients",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("ideal clients management", () => {
  let testProjectId: number;

  beforeAll(async () => {
    // Criar um projeto de teste
    testProjectId = await db.createProject({
      userId: 1,
      name: "Test Project for Ideal Clients",
      sourceType: "description",
      sourceUrl: "",
    });
  });

  afterAll(async () => {
    // Limpar projeto de teste
    if (testProjectId) {
      await db.deleteProject(testProjectId);
    }
  });

  it("should add a new ideal client to a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.addIdealClient({
      projectId: testProjectId,
      name: "Mãe Empreendedora",
      description: "Mulher entre 30-45 anos que trabalha em casa e quer empreender",
    });

    expect(result.success).toBe(true);
    expect(result.clientId).toBeDefined();
    expect(typeof result.clientId).toBe("number");
  });

  it("should list ideal clients for a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clients = await caller.projects.listIdealClients({
      projectId: testProjectId,
    });

    expect(Array.isArray(clients)).toBe(true);
    expect(clients.length).toBeGreaterThan(0);
    expect(clients[0].name).toBe("Mãe Empreendedora");
  });

  it("should update ideal client selection status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Primeiro, listar para pegar o ID
    const clients = await caller.projects.listIdealClients({
      projectId: testProjectId,
    });
    const clientId = clients[0].id;

    // Desmarcar o cliente
    const result = await caller.projects.updateIdealClientSelection({
      clientId,
      isSelected: false,
    });

    expect(result.success).toBe(true);

    // Verificar que foi desmarcado
    const updatedClients = await caller.projects.listIdealClients({
      projectId: testProjectId,
    });
    const updatedClient = updatedClients.find(c => c.id === clientId);
    expect(updatedClient?.isSelected).toBe(false);
  });

  it("should delete an ideal client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Adicionar um cliente para deletar
    const addResult = await caller.projects.addIdealClient({
      projectId: testProjectId,
      name: "Cliente Para Deletar",
    });

    // Deletar o cliente
    const deleteResult = await caller.projects.deleteIdealClient({
      clientId: addResult.clientId,
    });

    expect(deleteResult.success).toBe(true);

    // Verificar que foi deletado
    const clients = await caller.projects.listIdealClients({
      projectId: testProjectId,
    });
    const deletedClient = clients.find(c => c.id === addResult.clientId);
    expect(deletedClient).toBeUndefined();
  });

  it("should throw NOT_FOUND for non-existent project when adding client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.projects.addIdealClient({
        projectId: 999999,
        name: "Test Client",
      })
    ).rejects.toThrow();
  });

  it("should throw NOT_FOUND for non-existent project when listing clients", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.projects.listIdealClients({
        projectId: 999999,
      })
    ).rejects.toThrow();
  });
});

describe("pains by ideal client", () => {
  let testProjectId: number;
  let testClientId: number;

  beforeAll(async () => {
    // Criar um projeto de teste
    testProjectId = await db.createProject({
      userId: 1,
      name: "Test Project for Pains",
      sourceType: "description",
      sourceUrl: "",
      analysis: {
        niche: "Marketing Digital",
        mainOffer: "Curso de Redes Sociais",
      },
    });

    // Criar um cliente ideal de teste
    testClientId = await db.createIdealClient(testProjectId, {
      name: "Estudante Universitário",
      description: "Jovem de 18-25 anos que quer aprender marketing digital",
    });
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (testProjectId) {
      await db.deleteProject(testProjectId);
    }
  });

  it("should get ideal client with pains (empty initially)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.getIdealClientWithPains({
      clientId: testClientId,
    });

    expect(result.id).toBe(testClientId);
    expect(result.name).toBe("Estudante Universitário");
    expect(Array.isArray(result.pains)).toBe(true);
    expect(result.pains.length).toBe(0); // Inicialmente sem dores
  });

  it("should throw NOT_FOUND for non-existent client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.projects.getIdealClientWithPains({
        clientId: 999999,
      })
    ).rejects.toThrow();
  });
});

describe("db functions for ideal clients", () => {
  let testProjectId: number;

  beforeAll(async () => {
    testProjectId = await db.createProject({
      userId: 1,
      name: "DB Test Project",
      sourceType: "description",
      sourceUrl: "",
    });
  });

  afterAll(async () => {
    if (testProjectId) {
      await db.deleteProject(testProjectId);
    }
  });

  it("should create and retrieve ideal client", async () => {
    const clientId = await db.createIdealClient(testProjectId, {
      name: "Test DB Client",
      description: "Test description",
    });

    expect(typeof clientId).toBe("number");

    const client = await db.getIdealClientById(clientId);
    expect(client).not.toBeNull();
    expect(client?.name).toBe("Test DB Client");
    expect(client?.isSelected).toBe(true); // Default is true
  });

  it("should get ideal clients by project", async () => {
    const clients = await db.getIdealClientsByProject(testProjectId);
    expect(Array.isArray(clients)).toBe(true);
    expect(clients.length).toBeGreaterThan(0);
  });

  it("should update ideal client", async () => {
    const clients = await db.getIdealClientsByProject(testProjectId);
    const clientId = clients[0].id;

    await db.updateIdealClient(clientId, { isSelected: false });

    const updatedClient = await db.getIdealClientById(clientId);
    expect(updatedClient?.isSelected).toBe(false);
  });

  it("should delete ideal client and its pains", async () => {
    // Criar cliente para deletar
    const clientId = await db.createIdealClient(testProjectId, {
      name: "Client to Delete",
    });

    // Criar algumas dores para esse cliente
    await db.createPainsForClient(testProjectId, clientId, [
      { level: "primary", pain: "Test Pain 1" },
      { level: "secondary", pain: "Test Pain 2" },
    ]);

    // Verificar que as dores foram criadas
    const painsBeforeDelete = await db.getPainsByIdealClient(clientId);
    expect(painsBeforeDelete.length).toBe(2);

    // Deletar o cliente
    await db.deleteIdealClient(clientId);

    // Verificar que o cliente foi deletado
    const deletedClient = await db.getIdealClientById(clientId);
    expect(deletedClient).toBeNull();

    // Verificar que as dores também foram deletadas
    const painsAfterDelete = await db.getPainsByIdealClient(clientId);
    expect(painsAfterDelete.length).toBe(0);
  });

  it("should create pains for specific client", async () => {
    const clientId = await db.createIdealClient(testProjectId, {
      name: "Client with Pains",
    });

    await db.createPainsForClient(testProjectId, clientId, [
      { level: "primary", pain: "Primary Pain", description: "Description 1" },
      { level: "secondary", pain: "Secondary Pain", description: "Description 2" },
      { level: "unexplored", pain: "Unexplored Pain" },
    ]);

    const pains = await db.getPainsByIdealClient(clientId);
    expect(pains.length).toBe(3);
    expect(pains.filter(p => p.level === "primary").length).toBe(1);
    expect(pains.filter(p => p.level === "secondary").length).toBe(1);
    expect(pains.filter(p => p.level === "unexplored").length).toBe(1);
  });

  it("should delete pains by ideal client", async () => {
    const clientId = await db.createIdealClient(testProjectId, {
      name: "Client for Pain Deletion",
    });

    await db.createPainsForClient(testProjectId, clientId, [
      { level: "primary", pain: "Pain to Delete" },
    ]);

    // Verificar que a dor foi criada
    let pains = await db.getPainsByIdealClient(clientId);
    expect(pains.length).toBe(1);

    // Deletar as dores do cliente
    await db.deletePainsByIdealClient(clientId);

    // Verificar que as dores foram deletadas
    pains = await db.getPainsByIdealClient(clientId);
    expect(pains.length).toBe(0);
  });
});
