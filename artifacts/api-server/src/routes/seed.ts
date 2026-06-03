import { Router } from "express";
import {
  db,
  usersTable,
  walletsTable,
  transactionsTable,
  depositRequestsTable,
  jobsTable,
  applicationsTable,
  ratingsTable,
  notificationsTable,
  conversations,
  messages,
  userSkillsTable,
  workExperiencesTable,
  postsTable,
  userFollowsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { hashPassword, generateReferralCode } from "../lib/auth";

const router = Router();

/* ── POST /api/setup/seed ── idempotent test data seeder ── */
router.post("/setup/seed", async (_req, res) => {
  try {
    const results: string[] = [];
    const hash = hashPassword("123456");

    // ─── HELPERS ──────────────────────────────────────────────────────────

    const upsertUser = async (data: Record<string, any>): Promise<number> => {
      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .limit(1);
      if (existing) {
        await db.update(usersTable).set(data).where(eq(usersTable.id, existing.id));
        return existing.id;
      }
      const [created] = await db
        .insert(usersTable)
        .values({ referralCode: generateReferralCode(), ...data } as any)
        .returning({ id: usersTable.id });
      return created.id;
    };

    const ensureWallet = async (
      userId: number,
      walletType: "freelancer" | "company" | "platform" | "representative",
      extra: Partial<{
        balance: number;
        reservedBalance: number;
        pendingBalance: number;
        totalEarned: number;
        totalWithdrawn: number;
        totalFeesPaid: number;
        totalSpent: number;
      }> = {}
    ): Promise<number> => {
      const [existing] = await db
        .select({ id: walletsTable.id })
        .from(walletsTable)
        .where(eq(walletsTable.userId, userId))
        .limit(1);
      if (existing) {
        if (Object.keys(extra).length > 0) {
          await db.update(walletsTable).set(extra).where(eq(walletsTable.id, existing.id));
        }
        return existing.id;
      }
      const [created] = await db
        .insert(walletsTable)
        .values({ userId, walletType, balance: 0, reservedBalance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0, totalFeesPaid: 0, totalSpent: 0, ...extra })
        .returning({ id: walletsTable.id });
      return created.id;
    };

    const ensureTx = async (
      walletId: number,
      referenceId: string,
      data: Record<string, any>
    ) => {
      const [existing] = await db
        .select({ id: transactionsTable.id })
        .from(transactionsTable)
        .where(eq(transactionsTable.referenceId, referenceId))
        .limit(1);
      if (existing) return;
      await db.insert(transactionsTable).values({ walletId, referenceId, ...data } as any);
    };

    const ensureJob = async (data: Record<string, any>): Promise<number> => {
      const [existing] = await db
        .select({ id: jobsTable.id })
        .from(jobsTable)
        .where(and(eq(jobsTable.title, data.title), eq(jobsTable.companyId, data.companyId)))
        .limit(1);
      if (existing) return existing.id;
      const [created] = await db.insert(jobsTable).values(data as any).returning({ id: jobsTable.id });
      return created.id;
    };

    const ensureApp = async (data: Record<string, any>): Promise<number> => {
      const [existing] = await db
        .select({ id: applicationsTable.id })
        .from(applicationsTable)
        .where(and(eq(applicationsTable.jobId, data.jobId), eq(applicationsTable.freelancerId, data.freelancerId)))
        .limit(1);
      if (existing) return existing.id;
      const [created] = await db.insert(applicationsTable).values(data as any).returning({ id: applicationsTable.id });
      return created.id;
    };

    const ensureRating = async (data: Record<string, any>) => {
      const [existing] = await db
        .select({ id: ratingsTable.id })
        .from(ratingsTable)
        .where(and(eq(ratingsTable.jobId, data.jobId), eq(ratingsTable.raterId, data.raterId), eq(ratingsTable.ratedId, data.ratedId)))
        .limit(1);
      if (existing) return;
      await db.insert(ratingsTable).values(data as any);
    };

    const ensureNotif = async (userId: number, title: string, data: Record<string, any>) => {
      const [existing] = await db
        .select({ id: notificationsTable.id })
        .from(notificationsTable)
        .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.title, title)))
        .limit(1);
      if (existing) return;
      await db.insert(notificationsTable).values({ userId, title, ...data } as any);
    };

    const ensureConv = async (p1: number, p2: number): Promise<number> => {
      const [a, b] = p1 < p2 ? [p1, p2] : [p2, p1];
      const [existing] = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(and(eq(conversations.participant1Id, a), eq(conversations.participant2Id, b)))
        .limit(1);
      if (existing) return existing.id;
      const [created] = await db
        .insert(conversations)
        .values({ participant1Id: a, participant2Id: b, lastMessageAt: new Date() })
        .returning({ id: conversations.id });
      return created.id;
    };

    const ensureMsg = async (convId: number, senderId: number, content: string, msAgo: number) => {
      const [existing] = await db
        .select({ id: messages.id })
        .from(messages)
        .where(and(eq(messages.conversationId, convId), eq(messages.content, content)))
        .limit(1);
      if (existing) return;
      const createdAt = new Date(Date.now() - msAgo);
      await db.insert(messages).values({ conversationId: convId, senderId, content, type: "text", isRead: true, createdAt });
    };

    const ensureSkill = async (userId: number, skill: string, endorsements: number) => {
      const [existing] = await db
        .select({ id: userSkillsTable.id })
        .from(userSkillsTable)
        .where(and(eq(userSkillsTable.userId, userId), eq(userSkillsTable.skill, skill)))
        .limit(1);
      if (existing) return;
      await db.insert(userSkillsTable).values({ userId, skill, endorsements });
    };

    const ensureExp = async (userId: number, company: string, data: Record<string, any>) => {
      const [existing] = await db
        .select({ id: workExperiencesTable.id })
        .from(workExperiencesTable)
        .where(and(eq(workExperiencesTable.userId, userId), eq(workExperiencesTable.company, company)))
        .limit(1);
      if (existing) return;
      await db.insert(workExperiencesTable).values({ userId, company, ...data } as any);
    };

    const ensureFollow = async (followerId: number, followingId: number) => {
      const [existing] = await db
        .select({ id: userFollowsTable.id })
        .from(userFollowsTable)
        .where(and(eq(userFollowsTable.followerId, followerId), eq(userFollowsTable.followingId, followingId)))
        .limit(1);
      if (existing) return;
      await db.insert(userFollowsTable).values({ followerId, followingId } as any).catch(() => {});
    };

    const ensurePost = async (userId: number, content: string, postType: "general" | "job_completion" | "availability", likes: number) => {
      const [existing] = await db
        .select({ id: postsTable.id })
        .from(postsTable)
        .where(and(eq(postsTable.userId, userId), eq(postsTable.content, content)))
        .limit(1);
      if (existing) return;
      await db.insert(postsTable).values({ userId, content, postType, likes, saves: 0, reposts: 0 });
    };

    const daysAgo = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toISOString().slice(0, 10);
    };
    const daysFromNow = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() + n);
      return d.toISOString().slice(0, 10);
    };
    const hoursMs = (h: number) => h * 3600000;

    // ─── TEST ACCOUNTS ────────────────────────────────────────────────────

    // 1. Freelancer: Marcelo Silva
    const marceloId = await upsertUser({
      email: "teste.freelancer@extrago.com",
      passwordHash: hash,
      name: "Marcelo Silva",
      role: "freelancer",
      bio: "Profissional de eventos com 5 anos de experiência em hospitalidade premium. Especialista em serviços de garçom, bartending e copa para eventos corporativos e sociais de alto padrão.",
      professionalSummary: "Atuei nos principais eventos de São Paulo e Rio de Janeiro, atendendo clientes como bancos, empresas de grande porte e celebrações exclusivas. Pontual, apresentável e apaixonado pelo que faço.",
      phone: "(11) 94567-8901",
      pixKey: "teste.freelancer@extrago.com",
      categories: ["Garçom", "Bartender", "Copeiro", "Recepcionista"],
      languages: ["Português", "Inglês básico"],
      serviceRegions: ["SP", "RJ", "MG"],
      level: "silver",
      reputationScore: 4.7,
      completedJobs: 28,
      responseRate: 0.96,
      isVerified: true,
      isBanned: false,
      profileCompletion: 95,
      referralCode: "MARCELO01",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    });
    results.push(`Freelancer Marcelo: id=${marceloId}`);

    // 2. Company: Jean Carlos
    const jeanId = await upsertUser({
      email: "teste.empresa@extrago.com",
      passwordHash: hash,
      name: "Jean Carlos",
      role: "company",
      companyName: "Eventos Jean Carlos",
      bio: "Empresa especializada em organização de eventos corporativos e sociais em São Paulo. Trabalhamos com os melhores profissionais do setor de hospitalidade para entregar experiências inesquecíveis.",
      phone: "(11) 98765-4321",
      pixKey: "teste.empresa@extrago.com",
      categories: [],
      languages: ["Português"],
      serviceRegions: ["SP"],
      isVerified: true,
      isBanned: false,
      profileCompletion: 90,
      referralCode: "JEANCAR01",
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
    });
    results.push(`Company Jean: id=${jeanId}`);

    // 3. Super Admin: Leonardo
    const leonardoId = await upsertUser({
      email: "administracao@extrago.com",
      passwordHash: hash,
      name: "Leonardo",
      role: "admin",
      adminRole: "super_admin",
      bio: "Administrador da plataforma extraGO. Responsável pela gestão operacional, financeira e de usuários.",
      isVerified: true,
      isBanned: false,
      profileCompletion: 100,
      level: "elite",
      referralCode: "ADMIN2024",
    });
    results.push(`Admin Leonardo: id=${leonardoId}`);

    // ─── ADDITIONAL ECOSYSTEM USERS ───────────────────────────────────────

    const fl1Id = await upsertUser({
      email: "ana.oliveira@seed.extrago.com",
      passwordHash: hash,
      name: "Ana Oliveira",
      role: "freelancer",
      bio: "Recepcionista e copeira com 2 anos de experiência em eventos.",
      phone: "(11) 97111-2233",
      pixKey: "ana.oliveira@seed.extrago.com",
      categories: ["Recepcionista", "Copeiro"],
      languages: ["Português"],
      serviceRegions: ["SP"],
      level: "bronze",
      reputationScore: 4.2,
      completedJobs: 3,
      responseRate: 0.80,
      isVerified: true,
      isBanned: false,
      profileCompletion: 70,
      referralCode: "ANAOLIV01",
      referredById: marceloId,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    });

    const fl2Id = await upsertUser({
      email: "carlos.santos@seed.extrago.com",
      passwordHash: hash,
      name: "Carlos Santos",
      role: "freelancer",
      bio: "Garçom e bartender experiente com 4 anos no mercado de eventos.",
      phone: "(11) 96222-3344",
      pixKey: "carlos.santos@seed.extrago.com",
      categories: ["Garçom", "Bartender"],
      languages: ["Português"],
      serviceRegions: ["SP", "RJ"],
      level: "silver",
      reputationScore: 4.6,
      completedJobs: 22,
      responseRate: 0.91,
      isVerified: true,
      isBanned: false,
      profileCompletion: 82,
      referralCode: "CARLOSS01",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    });

    const fl3Id = await upsertUser({
      email: "fernanda.lima@seed.extrago.com",
      passwordHash: hash,
      name: "Fernanda Lima",
      role: "freelancer",
      bio: "Profissional multifuncional, especialista em recepção e serviços de copa.",
      phone: "(21) 98333-4455",
      pixKey: "fernanda.lima@seed.extrago.com",
      categories: ["Recepcionista", "Garçom", "Copeiro"],
      languages: ["Português", "Inglês intermediário"],
      serviceRegions: ["RJ", "MG"],
      level: "silver",
      reputationScore: 4.8,
      completedJobs: 45,
      responseRate: 0.94,
      isVerified: true,
      isBanned: false,
      profileCompletion: 88,
      referralCode: "FERNAN01",
      referredById: marceloId,
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    });

    const fl4Id = await upsertUser({
      email: "rafael.mendes@seed.extrago.com",
      passwordHash: hash,
      name: "Rafael Mendes",
      role: "freelancer",
      bio: "Garçom iniciante buscando experiência em eventos.",
      phone: "(11) 95444-5566",
      pixKey: "rafael.mendes@seed.extrago.com",
      categories: ["Garçom"],
      languages: ["Português"],
      serviceRegions: ["SP"],
      level: "bronze",
      reputationScore: 4.0,
      completedJobs: 2,
      responseRate: 0.75,
      isVerified: true,
      isBanned: false,
      profileCompletion: 60,
      referralCode: "RAFMEN01",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    });

    const fl5Id = await upsertUser({
      email: "patricia.gomes@seed.extrago.com",
      passwordHash: hash,
      name: "Patrícia Gomes",
      role: "freelancer",
      bio: "Copeira e recepcionista sênior com longa trajetória em eventos de alto padrão.",
      phone: "(31) 99555-6677",
      pixKey: "patricia.gomes@seed.extrago.com",
      categories: ["Copeiro", "Recepcionista"],
      languages: ["Português"],
      serviceRegions: ["MG", "SP"],
      level: "silver",
      reputationScore: 4.9,
      completedJobs: 35,
      responseRate: 0.97,
      isVerified: true,
      isBanned: false,
      profileCompletion: 90,
      referralCode: "PATGOM01",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    });

    results.push("Additional freelancers created");

    const co1Id = await upsertUser({
      email: "buffet.estrela@seed.extrago.com",
      passwordHash: hash,
      name: "Rodrigo Ferreira",
      role: "company",
      companyName: "Buffet Estrela Dourada",
      bio: "Buffet premium para casamentos, formaturas e eventos corporativos.",
      phone: "(11) 3001-1234",
      pixKey: "buffet.estrela@seed.extrago.com",
      categories: [],
      languages: ["Português"],
      serviceRegions: ["SP"],
      isVerified: true,
      isBanned: false,
      profileCompletion: 80,
      referralCode: "BUFFEST01",
    });

    const co2Id = await upsertUser({
      email: "hotel.grand@seed.extrago.com",
      passwordHash: hash,
      name: "Marina Costa",
      role: "company",
      companyName: "Hotel Grand Plaza",
      bio: "Hotel 5 estrelas no coração de São Paulo.",
      phone: "(11) 3002-5678",
      pixKey: "hotel.grand@seed.extrago.com",
      categories: [],
      languages: ["Português", "Inglês"],
      serviceRegions: ["SP", "RJ"],
      isVerified: true,
      isBanned: false,
      profileCompletion: 85,
      referralCode: "HOTGRAN01",
    });

    const co3Id = await upsertUser({
      email: "resort.oceano@seed.extrago.com",
      passwordHash: hash,
      name: "Thiago Almeida",
      role: "company",
      companyName: "Resort Oceano Azul",
      bio: "Resort de luxo em Angra dos Reis.",
      phone: "(24) 3003-9012",
      pixKey: "resort.oceano@seed.extrago.com",
      categories: [],
      languages: ["Português"],
      serviceRegions: ["RJ", "MG"],
      isVerified: true,
      isBanned: false,
      profileCompletion: 78,
      referralCode: "RESOCE01",
    });

    results.push("Additional companies created");

    // ─── WALLETS ──────────────────────────────────────────────────────────

    const marceloWalletId = await ensureWallet(marceloId, "freelancer", {
      balance: 85000,         // R$850 disponível
      totalEarned: 340000,    // R$3.400 ganho total
      totalWithdrawn: 100000, // R$1.000 sacado
      totalFeesPaid: 61200,   // R$612 em taxas
      pendingBalance: 3200,   // R$32 pendente
    });

    const jeanWalletId = await ensureWallet(jeanId, "company", {
      balance: 200000,        // R$2.000 disponível
      totalSpent: 300000,     // R$3.000 gasto em extras
      reservedBalance: 40000, // R$400 reservado
    });

    await ensureWallet(leonardoId, "platform", {});

    // Ecosystem user wallets
    await ensureWallet(fl1Id, "freelancer", { balance: 8500, totalEarned: 25000 });
    await ensureWallet(fl2Id, "freelancer", { balance: 42000, totalEarned: 180000, totalWithdrawn: 60000 });
    await ensureWallet(fl3Id, "freelancer", { balance: 31000, totalEarned: 320000, totalWithdrawn: 150000 });
    await ensureWallet(fl4Id, "freelancer", { balance: 4200, totalEarned: 9000 });
    await ensureWallet(fl5Id, "freelancer", { balance: 67000, totalEarned: 410000, totalWithdrawn: 200000 });
    await ensureWallet(co1Id, "company", { balance: 120000, totalSpent: 280000 });
    await ensureWallet(co2Id, "company", { balance: 350000, totalSpent: 650000 });
    await ensureWallet(co3Id, "company", { balance: 80000, totalSpent: 120000 });

    results.push("Wallets ready");

    // ─── JOBS ─────────────────────────────────────────────────────────────

    // Jean's open jobs
    const job1 = await ensureJob({
      title: "Garçom para Evento Corporativo Premium",
      description: "Precisamos de garçom experiente para evento corporativo de alto padrão com 200 convidados. O profissional deve ter postura elegante, experiência com serviço à francesa e inglês básico. Uniforme fornecido. Alimentação incluída.",
      category: "Garçom",
      location: "São Paulo — SP",
      date: daysFromNow(5),
      startTime: "17:00",
      endTime: "23:00",
      workersNeeded: 3,
      workersApproved: 0,
      hourlyRate: 4500,
      totalValue: 81000,
      status: "open",
      companyId: jeanId,
    });

    const job2 = await ensureJob({
      title: "Bartender para Casamento de Luxo",
      description: "Bartender criativo com experiência em coquetéis autorais e drinks clássicos. Evento de casamento exclusivo para 150 convidados. Ambiente elegante, sorriso fácil e agilidade são imprescindíveis.",
      category: "Bartender",
      location: "São Paulo — SP",
      date: daysFromNow(8),
      startTime: "18:00",
      endTime: "01:00",
      workersNeeded: 2,
      workersApproved: 1,
      hourlyRate: 5000,
      totalValue: 70000,
      status: "open",
      companyId: jeanId,
    });

    const job3 = await ensureJob({
      title: "Recepcionista para Congresso Internacional",
      description: "Recepcionista para congresso de tecnologia com 500 participantes. Inglês intermediário obrigatório. Responsabilidades: credenciamento, orientação e suporte geral aos participantes.",
      category: "Recepcionista",
      location: "São Paulo — SP",
      date: daysFromNow(3),
      startTime: "08:00",
      endTime: "18:00",
      workersNeeded: 4,
      workersApproved: 0,
      hourlyRate: 3500,
      totalValue: 140000,
      status: "open",
      companyId: jeanId,
    });

    // Jean's in_progress jobs
    const job4 = await ensureJob({
      title: "Copeiro para Jantar de Gala",
      description: "Copeiro para jantar de gala exclusivo com 80 convidados VIP. Serviço de copa de alta excelência, montagem de mesa e apoio ao Chef. Experiência mínima de 2 anos exigida.",
      category: "Copeiro",
      location: "São Paulo — SP",
      date: daysFromNow(-1),
      startTime: "19:00",
      endTime: "00:00",
      workersNeeded: 2,
      workersApproved: 2,
      hourlyRate: 4000,
      totalValue: 40000,
      status: "in_progress",
      companyId: jeanId,
    });

    // Buffet's in_progress job
    const job5 = await ensureJob({
      title: "Auxiliar de Serviço para Lançamento de Produto",
      description: "Auxiliar de serviço para evento de lançamento de produto de grande marca. Apoio geral, distribuição de brindes e orientação dos convidados. Evento em espaço moderno na Vila Olímpia.",
      category: "Auxiliar de Serviço",
      location: "São Paulo — SP",
      date: daysFromNow(-1),
      startTime: "14:00",
      endTime: "20:00",
      workersNeeded: 5,
      workersApproved: 4,
      hourlyRate: 3000,
      totalValue: 90000,
      status: "in_progress",
      companyId: co1Id,
    });

    // Completed jobs
    const job6 = await ensureJob({
      title: "Garçom para Formatura Universitária",
      description: "Serviço de garçom para formatura de medicina com 300 convidados. Jantar e coquetel em espaço nobre da cidade.",
      category: "Garçom",
      location: "São Paulo — SP",
      date: daysAgo(10),
      startTime: "18:00",
      endTime: "23:00",
      workersNeeded: 4,
      workersApproved: 4,
      hourlyRate: 4000,
      totalValue: 80000,
      status: "completed",
      companyId: co1Id,
    });

    const job7 = await ensureJob({
      title: "Bartender para Festa de Aniversário VIP",
      description: "Bartender para festa de 40 anos em cobertura de luxo na Zona Sul. Ambiente descontraído e exclusivo para 60 convidados.",
      category: "Bartender",
      location: "Rio de Janeiro — RJ",
      date: daysAgo(20),
      startTime: "20:00",
      endTime: "03:00",
      workersNeeded: 1,
      workersApproved: 1,
      hourlyRate: 5500,
      totalValue: 38500,
      status: "completed",
      companyId: co2Id,
    });

    const job8 = await ensureJob({
      title: "Recepcionista para Feira de Negócios",
      description: "Recepcionista para feira de negócios B2B com mais de 1.000 participantes. Credenciamento, suporte e orientação durante todo o evento.",
      category: "Recepcionista",
      location: "Belo Horizonte — MG",
      date: daysAgo(15),
      startTime: "08:00",
      endTime: "17:00",
      workersNeeded: 6,
      workersApproved: 6,
      hourlyRate: 3200,
      totalValue: 172800,
      status: "completed",
      companyId: co3Id,
    });

    const job9 = await ensureJob({
      title: "Copeiro para Evento Corporativo Anual",
      description: "Serviço de copa para evento anual de grande empresa. Café da manhã executivo e coffee breaks ao longo do dia com 200 participantes.",
      category: "Copeiro",
      location: "São Paulo — SP",
      date: daysAgo(7),
      startTime: "07:00",
      endTime: "18:00",
      workersNeeded: 3,
      workersApproved: 3,
      hourlyRate: 3500,
      totalValue: 115500,
      status: "completed",
      companyId: jeanId,
    });

    const job10 = await ensureJob({
      title: "Garçom para Casamento ao Ar Livre",
      description: "Garçom para casamento ao ar livre com buffet completo. 150 convidados, serviço de mesa e bebidas durante cerimônia e recepção.",
      category: "Garçom",
      location: "São Paulo — SP",
      date: daysAgo(30),
      startTime: "17:00",
      endTime: "23:00",
      workersNeeded: 2,
      workersApproved: 2,
      hourlyRate: 4200,
      totalValue: 50400,
      status: "completed",
      companyId: jeanId,
    });

    const job11 = await ensureJob({
      title: "Auxiliar para Show Corporativo",
      description: "Evento cancelado por força maior. Todos os profissionais foram notificados com antecedência e receberão a taxa de cancelamento.",
      category: "Auxiliar de Serviço",
      location: "Brasília — DF",
      date: daysAgo(5),
      startTime: "14:00",
      endTime: "22:00",
      workersNeeded: 8,
      workersApproved: 0,
      hourlyRate: 2800,
      totalValue: 0,
      status: "cancelled",
      companyId: co2Id,
    });

    results.push("Jobs created");

    // ─── APPLICATIONS ─────────────────────────────────────────────────────

    // Marcelo applies to open and in-progress jobs
    await ensureApp({ jobId: job1, freelancerId: marceloId, status: "pending", message: "Olá! Tenho 5 anos de experiência em eventos corporativos de alto padrão. Trabalho com serviço à francesa e tenho inglês básico para atender convidados internacionais. Estou disponível e muito motivado para contribuir com o seu evento!", proposedRate: 4500 });
    await ensureApp({ jobId: job2, freelancerId: marceloId, status: "pending", message: "Bartender com experiência em coquetéis autorais e drinks clássicos. Já trabalhei em mais de 15 casamentos de alto padrão em São Paulo. Posso levar referências de empresas anteriores.", proposedRate: 5000 });
    await ensureApp({ jobId: job4, freelancerId: marceloId, status: "approved", message: "Copeiro com 5 anos de experiência em eventos VIP e jantares de gala. Referências disponíveis mediante solicitação.", proposedRate: 4000 });
    await ensureApp({ jobId: job6, freelancerId: marceloId, status: "completed", message: "Garçom experiente disponível. Trabalho com excelência e pontualidade." });
    await ensureApp({ jobId: job9, freelancerId: marceloId, status: "completed", message: "Disponível para o serviço de copa corporativo." });
    await ensureApp({ jobId: job10, freelancerId: marceloId, status: "completed", message: "Tenho experiência com casamentos ao ar livre e serviços de buffet." });

    // Other freelancers applying
    await ensureApp({ jobId: job1, freelancerId: fl1Id, status: "pending", message: "Tenho experiência em eventos corporativos e boa apresentação pessoal." });
    await ensureApp({ jobId: job2, freelancerId: fl2Id, status: "approved", message: "Bartender com 3 anos de experiência em coquetéis." });
    await ensureApp({ jobId: job3, freelancerId: fl3Id, status: "pending", message: "Recepcionista bilíngue com experiência em congressos internacionais." });
    await ensureApp({ jobId: job3, freelancerId: fl5Id, status: "pending", message: "Recepcionista experiente, disponível para o período completo." });
    await ensureApp({ jobId: job5, freelancerId: fl4Id, status: "approved", message: "Auxiliar disponível e comprometido com o serviço." });
    await ensureApp({ jobId: job6, freelancerId: fl2Id, status: "completed", message: "Trabalho há anos com eventos de formatura." });
    await ensureApp({ jobId: job7, freelancerId: fl2Id, status: "completed", message: "Bartender especialista em festas de aniversário." });
    await ensureApp({ jobId: job8, freelancerId: fl5Id, status: "completed", message: "Experiência em grandes feiras e eventos B2B." });
    await ensureApp({ jobId: job8, freelancerId: fl3Id, status: "completed", message: "Recepcionista com inglês intermediário." });

    results.push("Applications created");

    // ─── RATINGS ──────────────────────────────────────────────────────────

    // Companies rate Marcelo
    await ensureRating({ jobId: job6, raterId: co1Id, ratedId: marceloId, score: 5.0, comment: "Marcelo foi excepcional! Pontual, elegante e extremamente profissional. Superou todas as nossas expectativas. Já pedimos para trabalhar novamente." });
    await ensureRating({ jobId: job9, raterId: jeanId, ratedId: marceloId, score: 4.8, comment: "Ótimo profissional, serviço impecável durante todo o evento corporativo. Recomendo sem hesitar." });
    await ensureRating({ jobId: job10, raterId: jeanId, ratedId: marceloId, score: 4.7, comment: "Muito bom! Cumpriu todas as tarefas com eficiência e simpatia. Voltaremos a contratá-lo." });

    // Marcelo rates companies
    await ensureRating({ jobId: job6, raterId: marceloId, ratedId: co1Id, score: 5.0, comment: "Empresa muito organizada e respeitosa com os profissionais. Pagamento correto e ambiente excelente." });
    await ensureRating({ jobId: job9, raterId: marceloId, ratedId: jeanId, score: 4.8, comment: "Jean Carlos é um cliente excelente, sempre muito claro nas instruções e pontual nos pagamentos." });
    await ensureRating({ jobId: job10, raterId: marceloId, ratedId: jeanId, score: 5.0, comment: "Evento impecável, equipe muito receptiva. Uma das melhores experiências que tive na plataforma!" });

    // Other ratings for ecosystem
    await ensureRating({ jobId: job7, raterId: co2Id, ratedId: fl2Id, score: 4.9, comment: "Carlos foi incrível no evento de aniversário!" });
    await ensureRating({ jobId: job8, raterId: co3Id, ratedId: fl5Id, score: 4.8, comment: "Patrícia é uma profissional excepcional." });
    await ensureRating({ jobId: job8, raterId: co3Id, ratedId: fl3Id, score: 4.7, comment: "Fernanda foi muito eficiente e atenciosa." });

    results.push("Ratings created");

    // ─── WALLET TRANSACTIONS ──────────────────────────────────────────────

    // Marcelo's earnings
    await ensureTx(marceloWalletId, "seed:m:job6:credit", { type: "credit", amount: 32760, description: "Pagamento — Garçom para Formatura Universitária (4h × R$45)", status: "completed" });
    await ensureTx(marceloWalletId, "seed:m:job9:credit", { type: "credit", amount: 28980, description: "Pagamento — Copeiro para Evento Corporativo Anual (11h × R$35 × 82%)", status: "completed" });
    await ensureTx(marceloWalletId, "seed:m:job10:credit", { type: "credit", amount: 20664, description: "Pagamento — Garçom para Casamento ao Ar Livre (6h × R$42 × 82%)", status: "completed" });
    await ensureTx(marceloWalletId, "seed:m:extra1", { type: "credit", amount: 14760, description: "Pagamento — Copeiro para Jantar Executivo (histórico)", status: "completed" });
    await ensureTx(marceloWalletId, "seed:m:extra2", { type: "credit", amount: 11480, description: "Pagamento — Garçom para Evento Privado (histórico)", status: "completed" });
    await ensureTx(marceloWalletId, "seed:m:extra3", { type: "credit", amount: 18900, description: "Pagamento — Bartender para Casamento (histórico)", status: "completed" });
    await ensureTx(marceloWalletId, "seed:m:ref1", { type: "commission", amount: 1200, description: "Comissão de indicação — Ana Oliveira completou primeiro extra", status: "completed" });
    await ensureTx(marceloWalletId, "seed:m:ref2", { type: "commission", amount: 900, description: "Comissão de indicação — Fernanda Lima completou extra", status: "completed" });
    await ensureTx(marceloWalletId, "seed:m:saque1", { type: "withdrawal", amount: 60000, description: "Saque PIX — R$600,00", status: "completed", pixKey: "teste.freelancer@extrago.com" });
    await ensureTx(marceloWalletId, "seed:m:saque2", { type: "withdrawal", amount: 40000, description: "Saque PIX — R$400,00", status: "completed", pixKey: "teste.freelancer@extrago.com" });
    await ensureTx(marceloWalletId, "seed:m:job4:pending", { type: "credit", amount: 3200, description: "Pagamento — Copeiro para Jantar de Gala (em andamento)", status: "pending" });

    // Jean's deposits and spending
    await ensureTx(jeanWalletId, "seed:j:dep1", { type: "deposit", amount: 300000, description: "Depósito PIX aprovado — R$3.000,00", status: "completed" });
    await ensureTx(jeanWalletId, "seed:j:dep2", { type: "deposit", amount: 200000, description: "Depósito PIX aprovado — R$2.000,00", status: "completed" });
    await ensureTx(jeanWalletId, "seed:j:job6:debit", { type: "debit", amount: 80000, description: "Pagamento Extra — Garçom para Formatura (4 profissionais)", status: "completed" });
    await ensureTx(jeanWalletId, "seed:j:job9:debit", { type: "debit", amount: 115500, description: "Pagamento Extra — Copeiro para Evento Corporativo Anual", status: "completed" });
    await ensureTx(jeanWalletId, "seed:j:job10:debit", { type: "debit", amount: 50400, description: "Pagamento Extra — Garçom para Casamento", status: "completed" });
    await ensureTx(jeanWalletId, "seed:j:job4:res", { type: "reservation", amount: 40000, description: "Reserva — Copeiro para Jantar de Gala (2 profissionais)", status: "completed" });

    results.push("Transactions created");

    // ─── DEPOSIT REQUESTS (Jean's deposit history) ────────────────────────

    const [existDep1] = await db.select({ id: depositRequestsTable.id })
      .from(depositRequestsTable)
      .where(and(eq(depositRequestsTable.userId, jeanId), eq(depositRequestsTable.amount, 300000)))
      .limit(1);
    if (!existDep1) {
      await db.insert(depositRequestsTable).values({
        walletId: jeanWalletId,
        userId: jeanId,
        amount: 300000,
        paymentMethod: "pix",
        pixKey: "pagamentos@extrago.com.br",
        status: "credited",
        adminNote: "Pagamento recebido e creditado com sucesso.",
        approvedById: leonardoId,
      });
    }

    const [existDep2] = await db.select({ id: depositRequestsTable.id })
      .from(depositRequestsTable)
      .where(and(eq(depositRequestsTable.userId, jeanId), eq(depositRequestsTable.amount, 200000)))
      .limit(1);
    if (!existDep2) {
      await db.insert(depositRequestsTable).values({
        walletId: jeanWalletId,
        userId: jeanId,
        amount: 200000,
        paymentMethod: "bank_transfer",
        pixKey: null,
        status: "credited",
        adminNote: "TED confirmado, saldo creditado.",
        approvedById: leonardoId,
      });
    }

    // Pending deposit for Jean (to test the admin flow)
    const [existDep3] = await db.select({ id: depositRequestsTable.id })
      .from(depositRequestsTable)
      .where(and(eq(depositRequestsTable.userId, jeanId), eq(depositRequestsTable.amount, 50000)))
      .limit(1);
    if (!existDep3) {
      await db.insert(depositRequestsTable).values({
        walletId: jeanWalletId,
        userId: jeanId,
        amount: 50000,
        paymentMethod: "pix",
        pixKey: "pagamentos@extrago.com.br",
        status: "pending",
        adminNote: null,
        approvedById: null,
      });
    }

    results.push("Deposit requests created");

    // ─── NOTIFICATIONS ─────────────────────────────────────────────────────

    // Marcelo
    await ensureNotif(marceloId, "✅ Candidatura aprovada!", { type: "application_approved", message: "Sua candidatura para \"Copeiro para Jantar de Gala\" foi aprovada pela Eventos Jean Carlos. Prepare-se para o evento amanhã às 19h!", isRead: false, link: "/app/applications" });
    await ensureNotif(marceloId, "🎉 Extra concluído com sucesso!", { type: "job_completed", message: "O extra \"Copeiro para Evento Corporativo Anual\" foi concluído. O pagamento de R$289,80 foi creditado na sua carteira.", isRead: true, link: "/app/wallet" });
    await ensureNotif(marceloId, "⭐ Nova avaliação 5 estrelas recebida!", { type: "rating_received", message: "Buffet Estrela Dourada avaliou você com nota 5 no extra de Formatura Universitária. Parabéns pelo excelente trabalho!", isRead: false, link: "/app/profile" });
    await ensureNotif(marceloId, "💰 Comissão de indicação recebida!", { type: "commission_earned", message: "Ana Oliveira (sua indicação) completou o primeiro extra! Você ganhou R$12,00 de comissão. Continue indicando!", isRead: true, link: "/app/wallet" });
    await ensureNotif(marceloId, "🆕 3 novos extras disponíveis para você!", { type: "new_job", message: "Extras de Garçom e Bartender em São Paulo combinam com seu perfil. Salário de R$40/h a R$55/h. Confira agora!", isRead: false, link: "/app/jobs" });
    await ensureNotif(marceloId, "🏦 Saque aprovado e processado!", { type: "withdrawal_completed", message: "Seu saque de R$600,00 foi processado via PIX. O valor deve chegar na sua conta em até 30 minutos.", isRead: true, link: "/app/wallet" });
    await ensureNotif(marceloId, "🌟 Parabéns! Você subiu de nível!", { type: "level_up", message: "Você completou 20 extras e atingiu o nível Júnior (Prata)! Sua taxa de plataforma caiu de 18% para 16% e agora tem acesso a extras premium.", isRead: true, link: "/app/profile" });
    await ensureNotif(marceloId, "💬 Nova mensagem de Jean Carlos", { type: "new_message", message: "Jean Carlos enviou uma mensagem: \"Vou aprovar sua candidatura. O evento começa às 19h...\"", isRead: false, link: "/app/chat" });

    // Jean Carlos
    await ensureNotif(jeanId, "📋 Nova candidatura de Marcelo Silva!", { type: "new_application", message: "Marcelo Silva se candidatou para \"Garçom para Evento Corporativo Premium\". Nível Júnior, 28 extras concluídos, nota 4.7 ⭐", isRead: false, link: "/app/applications" });
    await ensureNotif(jeanId, "📋 3 novas candidaturas para Congresso!", { type: "new_application", message: "3 recepcionistas se candidataram para o Congresso Internacional. Confira os perfis e selecione os melhores.", isRead: false, link: "/app/applications" });
    await ensureNotif(jeanId, "✅ Extra concluído — Avalie os profissionais!", { type: "job_completed", message: "\"Copeiro para Evento Corporativo Anual\" foi concluído com sucesso. Avalie os 3 profissionais que trabalharam no evento.", isRead: true, link: "/app/applications" });
    await ensureNotif(jeanId, "💳 Depósito de R$3.000,00 creditado!", { type: "deposit_confirmed", message: "Seu depósito via PIX foi confirmado e R$3.000,00 foram creditados na sua carteira. Pronto para contratar novos profissionais!", isRead: true, link: "/app/wallet" });
    await ensureNotif(jeanId, "⏰ Lembrete — Extra começa em 24 horas!", { type: "job_reminder", message: "\"Copeiro para Jantar de Gala\" começa amanhã às 19h. 2 profissionais confirmados. Verifique os detalhes.", isRead: false, link: "/app/jobs" });
    await ensureNotif(jeanId, "⭐ Avaliação recebida de Marcelo Silva", { type: "rating_received", message: "Marcelo Silva avaliou a Eventos Jean Carlos com nota 5 estrelas: \"Jean Carlos é um cliente excelente...\"", isRead: true, link: "/app/profile" });

    // Admin Leonardo
    await ensureNotif(leonardoId, "⚠️ 2 saques pendentes de aprovação", { type: "withdrawal_pending", message: "Existem 2 solicitações de saque aguardando revisão e aprovação no painel administrativo.", isRead: false, link: "/admin/withdrawals" });
    await ensureNotif(leonardoId, "💳 Novo depósito aguardando confirmação", { type: "deposit_pending", message: "Jean Carlos solicitou depósito de R$500,00 via PIX. Confirme o recebimento do pagamento.", isRead: false, link: "/admin/withdrawals" });
    await ensureNotif(leonardoId, "📊 Relatório semanal disponível", { type: "report_ready", message: "O relatório da semana está disponível: 8 novos usuários, 5 extras concluídos, R$2.400 em transações.", isRead: true, link: "/admin/analytics" });
    await ensureNotif(leonardoId, "👤 8 novos usuários esta semana", { type: "new_users", message: "A plataforma recebeu 8 novos cadastros esta semana — 6 freelancers e 2 empresas. Verifique os perfis.", isRead: true, link: "/admin/users" });

    results.push("Notifications created");

    // ─── CONVERSATIONS & MESSAGES ──────────────────────────────────────────

    // Jean <-> Marcelo
    const conv1 = await ensureConv(jeanId, marceloId);
    await ensureMsg(conv1, jeanId, "Olá Marcelo! Vi sua candidatura para o Jantar de Gala. Seu perfil é impressionante! Pode me contar mais sobre sua experiência com serviços VIP?", hoursMs(26));
    await ensureMsg(conv1, marceloId, "Boa tarde, Jean! Claro. Tenho 5 anos de experiência em eventos corporativos e sociais de alto padrão. Trabalhei em jantares executivos para grandes empresas em SP e RJ.", hoursMs(25));
    await ensureMsg(conv1, jeanId, "Excelente! Tem experiência com serviço à francesa?", hoursMs(24));
    await ensureMsg(conv1, marceloId, "Sim! Trabalho com serviço à francesa e americana. Também tenho experiência com vinhos, espumantes e bebidas premium.", hoursMs(24) - 1800000);
    await ensureMsg(conv1, jeanId, "Perfeito, Marcelo! Vou aprovar sua candidatura agora. O evento começa às 19h, pode chegar às 18h para a preparação?", hoursMs(20));
    await ensureMsg(conv1, marceloId, "Com certeza! Estarei lá às 18h em ponto. Muito obrigado pela oportunidade, Jean!", hoursMs(19));
    await db.update(conversations).set({ lastMessageAt: new Date(Date.now() - hoursMs(19)) }).where(eq(conversations.id, conv1)).catch(() => {});

    // Buffet <-> Marcelo
    const conv2 = await ensureConv(co1Id, marceloId);
    await ensureMsg(conv2, co1Id, "Olá Marcelo! Trabalhamos juntos na Formatura da semana passada. Seu trabalho foi simplesmente incrível! Pontual, elegante, profissional do início ao fim.", hoursMs(120));
    await ensureMsg(conv2, marceloId, "Que ótimo receber esse feedback! Foi um prazer trabalhar com a equipe de vocês. O evento estava muito bem organizado.", hoursMs(119));
    await ensureMsg(conv2, co1Id, "Temos mais 3 eventos chegando nos próximos meses. Posso contar com você?", hoursMs(118));
    await ensureMsg(conv2, marceloId, "Claro! Pode me chamar quando precisar. É sempre um prazer trabalhar com a Buffet Estrela Dourada 😊", hoursMs(117));
    await db.update(conversations).set({ lastMessageAt: new Date(Date.now() - hoursMs(117)) }).where(eq(conversations.id, conv2)).catch(() => {});

    // Jean <-> Carlos Santos
    const conv3 = await ensureConv(jeanId, fl2Id);
    await ensureMsg(conv3, jeanId, "Carlos, sua candidatura para o Casamento de Luxo foi aprovada! Confirma disponibilidade?", hoursMs(48));
    await ensureMsg(conv3, fl2Id, "Confirmado, Jean! Estarei presente no dia e horário combinado. Obrigado pela aprovação!", hoursMs(47));
    await db.update(conversations).set({ lastMessageAt: new Date(Date.now() - hoursMs(47)) }).where(eq(conversations.id, conv3)).catch(() => {});

    results.push("Conversations created");

    // ─── POSTS (Feed) ─────────────────────────────────────────────────────

    await ensurePost(marceloId, "🎉 Mais um extra incrível concluído! Trabalhar no evento corporativo anual foi uma experiência fantástica — equipe muito bem organizada e ambiente profissional de alto nível. É isso que me faz amar a hospitalidade! Obrigado, Eventos Jean Carlos! #extraGO #garçom #eventos #hospitalidade", "job_completion", 24);
    await ensurePost(marceloId, "Disponível para eventos em São Paulo este final de semana! Garçom com 5 anos de experiência, especialidade em eventos corporativos e casamentos. Entre em contato pelo chat! 🍽️ #disponivel #garçom #SP #extraGO", "availability", 12);
    await ensurePost(marceloId, "Uma dica para quem está começando na área de hospitalidade: invista na sua apresentação pessoal — uniforme impecável, pontualidade e um sorriso genuíno são seus maiores diferenciais. Com dedicação e os extras certos, a evolução de nível vem naturalmente! 💪 #dicas #hospitalidade #extraGO", "general", 31);
    await ensurePost(jeanId, "🎊 Evento corporativo anual finalizado com muito sucesso! Agradecemos a todos os profissionais incríveis que tornaram esse evento especial. Contratamos pelos extras da plataforma extraGO e a qualidade dos profissionais foi excepcional. Recomendo! #extraGO #eventos #hospitalidade", "general", 18);
    await ensurePost(fl3Id, "Recém chegando do Congresso Internacional em BH! Evento incrível com mais de 1.000 participantes. Amo o que faço 🙌 #recepcionista #congresso #extraGO", "job_completion", 8);

    results.push("Feed posts created");

    // ─── SKILLS & WORK EXPERIENCE (Marcelo) ──────────────────────────────

    await ensureSkill(marceloId, "Garçom", 18);
    await ensureSkill(marceloId, "Bartender", 12);
    await ensureSkill(marceloId, "Serviço à Francesa", 9);
    await ensureSkill(marceloId, "Vinhos e Bebidas", 7);
    await ensureSkill(marceloId, "Serviço de Copa", 11);
    await ensureSkill(marceloId, "Atendimento ao Cliente", 22);
    await ensureSkill(marceloId, "Inglês Básico", 5);
    await ensureSkill(marceloId, "Mixologia", 6);

    await ensureExp(marceloId, "Eventos & Festas Premium SP", { role: "Garçom Chefe", startDate: "2019-03", endDate: "2022-08", description: "Responsável pela coordenação da equipe de garçons em eventos corporativos e sociais para até 500 convidados.", achievements: ["Eleito melhor profissional do mês por 3 vezes", "Coordenei mais de 80 eventos sem ocorrências"] });
    await ensureExp(marceloId, "Hotel Grand Palace", { role: "Copeiro Sênior", startDate: "2022-09", endDate: "2023-12", description: "Serviços de copa e cozinha para hóspedes VIP e eventos internos do hotel 5 estrelas.", achievements: ["Atendi delegações internacionais", "Certificado em segurança alimentar"] });
    await ensureExp(marceloId, "Buffet Requinte", { role: "Bartender / Garçom", startDate: "2024-01", endDate: null, description: "Atuando em casamentos, formaturas e eventos corporativos de alto padrão em São Paulo.", achievements: ["Mais de 50 eventos realizados", "Especialização em drinks e coquetéis autorais"] });

    results.push("Skills and experience created");

    // ─── SOCIAL FOLLOWS ───────────────────────────────────────────────────

    await ensureFollow(marceloId, co1Id);
    await ensureFollow(marceloId, co2Id);
    await ensureFollow(marceloId, jeanId);
    await ensureFollow(co1Id, marceloId);
    await ensureFollow(jeanId, marceloId);
    await ensureFollow(marceloId, fl3Id);
    await ensureFollow(marceloId, fl2Id);
    await ensureFollow(fl3Id, marceloId);
    await ensureFollow(fl2Id, marceloId);

    results.push("Social follows created");

    // ─── FINAL SUMMARY ────────────────────────────────────────────────────

    res.json({
      ok: true,
      message: "Seed concluído com sucesso!",
      testAccounts: {
        freelancer: {
          name: "Marcelo Silva",
          email: "teste.freelancer@extrago.com",
          password: "123456",
          id: marceloId,
          level: "silver",
          completedJobs: 28,
        },
        company: {
          name: "Jean Carlos",
          email: "teste.empresa@extrago.com",
          password: "123456",
          id: jeanId,
          companyName: "Eventos Jean Carlos",
        },
        admin: {
          name: "Leonardo",
          email: "administracao@extrago.com",
          password: "123456",
          id: leonardoId,
          adminRole: "super_admin",
        },
      },
      seedSummary: {
        ecosystemFreelancers: [fl1Id, fl2Id, fl3Id, fl4Id, fl5Id].length,
        ecosystemCompanies: [co1Id, co2Id, co3Id].length,
        jobs: { open: 3, in_progress: 2, completed: 5, cancelled: 1 },
      },
      results,
    });
  } catch (err: any) {
    console.error("Seed error:", err);
    res.status(500).json({ error: "Seed falhou", detail: err.message });
  }
});

export default router;
