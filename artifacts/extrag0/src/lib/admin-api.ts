import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = "/api";

function getToken(): string {
  return localStorage.getItem("extragO_token") ?? "";
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw { status: res.status, data: err };
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalFreelancers: number;
  totalCompanies: number;
  totalAdmins: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  jobsInProgress: number;
  jobsToday: number;
  totalRevenue: number;
  totalTransacted: number;
  pendingWithdrawals: number;
  pendingWithdrawalsAmount: number;
  pendingVerifications: number;
  usersThisMonth: number;
  usersThisWeek: number;
  revenueByMonth: { month: string; amount: number; transactions: number }[];
  userGrowthByMonth: { month: string; freelancers: number; companies: number }[];
  topFreelancers: any[];
  jobsByCategory: { category: string; count: number }[];
}

export interface MonitoringStats {
  onlineUsers: number;
  activeJobs: number;
  jobsInProgress: number;
  paymentsLastHour: number;
  withdrawalsPending: number;
  withdrawalsPendingAmount: number;
  newUsersToday: number;
}

export interface PlatformSetting {
  id: number;
  key: string;
  value: string;
  label: string;
  description?: string;
  category: string;
  updatedBy?: number;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  adminId: number;
  adminName: string;
  adminRole: string;
  action: string;
  targetType?: string;
  targetId?: number;
  details?: any;
  createdAt: string;
}

export interface FinancialOverview {
  totalCommissions: number;
  totalTransacted: number;
  totalWithdrawn: number;
  distribution: {
    representative: { pct: number; amount: number };
    marketing: { pct: number; amount: number };
    humanCapital: { pct: number; amount: number };
    platform: { pct: number; amount: number };
  };
  revenueByMonth: { month: string; revenue: number; transacted: number; withdrawals: number }[];
  withdrawalsByStatus: { pending: number; completed: number; failed: number; pendingAmount: number };
  representatives: number;
}

export interface Representative {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  stateCode: string;
  stateName: string;
  commissionRate: number;
  totalEarned: number;
  totalPaid: number;
  isActive: boolean;
  createdAt: string;
}

export interface RegionalStat {
  stateCode: string;
  freelancers: number;
  companies: number;
  totalUsers: number;
  activeJobs: number;
  revenue: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats-full"],
    queryFn: () => apiFetch("/admin/stats"),
    refetchInterval: 15_000,
  });
}

export function useAdminMonitoring() {
  return useQuery<MonitoringStats>({
    queryKey: ["admin-monitoring"],
    queryFn: () => apiFetch("/admin/monitoring"),
    refetchInterval: 10_000,
  });
}

export function useAdminSettings() {
  return useQuery<PlatformSetting[]>({
    queryKey: ["admin-settings"],
    queryFn: () => apiFetch("/admin/settings"),
  });
}

export function useUpdateAdminSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      apiFetch(`/admin/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
}

export function useAuditLogs(params?: { action?: string; adminId?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.action) qs.set("action", params.action);
  if (params?.adminId) qs.set("adminId", String(params.adminId));
  if (params?.limit) qs.set("limit", String(params.limit));
  return useQuery<AuditLog[]>({
    queryKey: ["audit-logs", params],
    queryFn: () => apiFetch(`/admin/audit-logs?${qs}`),
    refetchInterval: 30_000,
  });
}

export function useFinancialOverview() {
  return useQuery<FinancialOverview>({
    queryKey: ["admin-financial"],
    queryFn: () => apiFetch("/admin/financial/overview"),
    refetchInterval: 30_000,
  });
}

export function useRepresentatives() {
  return useQuery<Representative[]>({
    queryKey: ["admin-representatives"],
    queryFn: () => apiFetch("/admin/representatives"),
  });
}

export function useAssignRepresentative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: number; stateCode: string; stateName: string; commissionRate?: number }) =>
      apiFetch("/admin/representatives", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-representatives"] });
      qc.invalidateQueries({ queryKey: ["admin-stats-full"] });
    },
  });
}

export function useRegionalStats() {
  return useQuery<RegionalStat[]>({
    queryKey: ["admin-regional-stats"],
    queryFn: () => apiFetch("/admin/regional-stats"),
    refetchInterval: 60_000,
  });
}

export function useAssignAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRole, stateCode }: { id: number; adminRole: string | null; stateCode?: string }) =>
      apiFetch(`/admin/users/${id}/role`, { method: "POST", body: JSON.stringify({ adminRole, stateCode }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function usePromoteToAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRole, stateCode }: { id: number; adminRole: string; stateCode?: string }) =>
      apiFetch(`/admin/users/${id}/promote-admin`, { method: "POST", body: JSON.stringify({ adminRole, stateCode }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useRejectWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch(`/admin/withdrawals/${id}/reject`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-withdrawals"] }),
  });
}
