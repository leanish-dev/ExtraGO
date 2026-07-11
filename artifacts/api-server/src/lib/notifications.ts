/**
 * Central notification helper.
 *
 * Every notification created anywhere in the API funnels through
 * `createNotification()` so that category/priority classification stays in
 * one place instead of being duplicated (and inevitably drifting) at every
 * call site. Pass an explicit `category`/`priority` to override the
 * type-based default when a call site knows better (e.g. a rejected KYC
 * review is "high" priority even though other "verification" events are
 * "normal").
 */
import { notificationsTable } from "@workspace/db";

export type NotificationCategory =
  | "applications"
  | "messages"
  | "payments"
  | "verification"
  | "system"
  | "security"
  | "admin";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

// Maps a notification `type` (fine-grained, used for icons/routing in the
// UI) to its coarse-grained `category` (used for filtering/grouping in the
// Notification Center) and a sensible default priority.
const TYPE_CLASSIFICATION: Record<string, { category: NotificationCategory; priority: NotificationPriority }> = {
  new_application: { category: "applications", priority: "normal" },
  application_submitted: { category: "applications", priority: "normal" },
  application_approved: { category: "applications", priority: "normal" },
  application_rejected: { category: "applications", priority: "normal" },
  application_withdrawn: { category: "applications", priority: "low" },
  counter_offer: { category: "applications", priority: "normal" },
  counter_accepted: { category: "applications", priority: "normal" },
  counter_rejected: { category: "applications", priority: "normal" },
  job_completed: { category: "applications", priority: "normal" },
  job_created: { category: "applications", priority: "low" },
  job_cancelled: { category: "applications", priority: "high" },
  level_up: { category: "system", priority: "normal" },
  commission_received: { category: "payments", priority: "normal" },
  payment_received: { category: "payments", priority: "normal" },
  payment_released: { category: "payments", priority: "normal" },
  withdrawal_approved: { category: "payments", priority: "normal" },
  withdrawal_rejected: { category: "payments", priority: "high" },
  deposit_confirmed: { category: "payments", priority: "normal" },
  deposit_rejected: { category: "payments", priority: "high" },
  new_message: { category: "messages", priority: "normal" },
  account_approved: { category: "verification", priority: "high" },
  account_rejected: { category: "verification", priority: "urgent" },
  documents_requested: { category: "verification", priority: "urgent" },
  selfie_requested: { category: "verification", priority: "urgent" },
  verification_suspended: { category: "verification", priority: "urgent" },
  verification_resumed: { category: "verification", priority: "normal" },
  admin_note: { category: "verification", priority: "low" },
  duplicate_cpf: { category: "security", priority: "urgent" },
  duplicate_cnpj: { category: "security", priority: "urgent" },
  duplicate_phone: { category: "security", priority: "urgent" },
  account_locked: { category: "security", priority: "urgent" },
  security_alert: { category: "security", priority: "urgent" },
  admin_alert: { category: "admin", priority: "high" },
  system: { category: "system", priority: "normal" },
};

export function classifyNotificationType(type: string): { category: NotificationCategory; priority: NotificationPriority } {
  return TYPE_CLASSIFICATION[type] ?? { category: "system", priority: "normal" };
}

interface CreateNotificationInput {
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  category?: NotificationCategory;
  priority?: NotificationPriority;
}

/** Minimal shape shared by `db` and a drizzle transaction (`tx`) — both expose `.insert()`. */
interface Insertable {
  insert: typeof import("@workspace/db").db.insert;
}

export async function createNotification(input: CreateNotificationInput, executor: Insertable) {
  const defaults = classifyNotificationType(input.type);
  return executor.insert(notificationsTable).values({
    userId: input.userId,
    type: input.type,
    category: input.category ?? defaults.category,
    priority: input.priority ?? defaults.priority,
    title: input.title,
    message: input.message,
    isRead: false,
    link: input.link ?? null,
  });
}
