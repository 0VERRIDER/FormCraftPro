import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // We'll use email as username
  fullName: text("full_name").notNull(),
  password: text("password").notNull(),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  fullName: true,
  password: true,
  clientId: true,
  clientSecret: true
});

// Form schema
export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  uuid: varchar("uuid", { length: 36 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull(),
  settings: jsonb("settings").notNull(),
  webhookUrl: text("webhook_url"),
  webhookHeaders: jsonb("webhook_headers"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertFormSchema = createInsertSchema(forms).pick({
  userId: true,
  uuid: true,
  title: true,
  description: true,
  fields: true,
  settings: true,
  webhookUrl: true,
  webhookHeaders: true
});

// Submission schema
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => forms.id),
  data: jsonb("data").notNull(),
  webhookStatus: text("webhook_status"),
  webhookAttempts: integer("webhook_attempts").default(0),
  webhookResponse: text("webhook_response"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  formId: true,
  data: true,
  webhookStatus: true,
  webhookAttempts: true,
  webhookResponse: true,
  ipAddress: true,
  userAgent: true
});

// Webhook Log schema
export const webhookLogs = pgTable("webhook_logs", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => submissions.id),
  requestUrl: text("request_url").notNull(),
  requestBody: jsonb("request_body"),
  requestHeaders: jsonb("request_headers"),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  attemptNumber: integer("attempt_number").notNull(),
  successful: boolean("successful").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).pick({
  submissionId: true,
  requestUrl: true,
  requestBody: true,
  requestHeaders: true,
  responseStatus: true,
  responseBody: true,
  attemptNumber: true,
  successful: true
});

// Field validation schema
export const fieldValidationSchema = z.object({
  required: z.boolean().optional(),
  pattern: z.string().optional(),
  min: z.union([z.string(), z.number()]).optional(),
  max: z.union([z.string(), z.number()]).optional(),
  message: z.string().optional()
});

// Field schema
export const fieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  key: z.string(),
  options: z.array(z.string()).optional(),
  validation: fieldValidationSchema.optional()
});

// Form settings schema
export const formSettingsSchema = z.object({
  successMessage: z.string().optional(),
  redirectUrl: z.string().optional(),
  showTitle: z.boolean().optional(),
  showDescription: z.boolean().optional(),
  enableRecaptcha: z.boolean().optional(),
  recaptchaSiteKey: z.string().optional(),
  recaptchaSecretKey: z.string().optional(),
  enableRateLimiting: z.boolean().optional(),
  buttonLabel: z.string().optional(),
  themeColor: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  customPath: z.string().optional(),
  colors: z.object({
    primary: z.string().optional(),
    background: z.string().optional(),
    text: z.string().optional(),
    buttonText: z.string().optional(),
    border: z.string().optional(),
    accent: z.string().optional(),
    error: z.string().optional(),
    success: z.string().optional(),
  }).optional()
});

// Webhook configuration schema
export const webhookConfigSchema = z.object({
  url: z.string().url().optional(),
  authType: z.enum(['none', 'api_key', 'bearer_token', 'basic_auth']).optional(),
  headerName: z.string().optional(),
  headerValue: z.string().optional(),
  additionalHeaders: z.record(z.string()).optional(),
  enableRetry: z.boolean().optional(),
  maxRetries: z.number().optional()
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;

export type Field = z.infer<typeof fieldSchema>;
export type FieldValidation = z.infer<typeof fieldValidationSchema>;
export type FormSettings = z.infer<typeof formSettingsSchema>;
export type WebhookConfig = z.infer<typeof webhookConfigSchema>;
