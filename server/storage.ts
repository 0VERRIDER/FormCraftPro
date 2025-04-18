import { v4 as uuidv4 } from 'uuid';
import { 
  User, InsertUser, 
  Form, InsertForm, 
  Submission, InsertSubmission, 
  WebhookLog, InsertWebhookLog,
  users, forms, submissions, webhookLogs
} from '@shared/schema';
import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { pool } from './db';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByClientId(clientId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Form operations
  getForms(userId: number): Promise<Form[]>;
  getAllForms(): Promise<Form[]>; // Get all forms regardless of user
  getForm(id: number): Promise<Form | undefined>;
  getFormByUuid(uuid: string): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: number, form: Partial<Form>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;
  
  // Submission operations
  getSubmissions(formId: number): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmissionWebhookStatus(id: number, status: string, attempts: number, response?: string): Promise<Submission | undefined>;
  
  // Webhook log operations
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  getWebhookLogs(submissionId: number): Promise<WebhookLog[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
    
    // Initialize admin user if it doesn't exist
    this.initAdminUser();
  }

  private async initAdminUser() {
    const existingAdmin = await this.getUserByUsername('admin@example.com');
    if (!existingAdmin) {
      this.createUser({
        username: 'admin@example.com',
        fullName: 'Admin User',
        password: '$2b$10$8qKiQa.1U87HLCF0pnl.jOFJFcuu1V1G1YAn99V5.aSbQHRZrCPq2', // hashed 'password'
        clientId: 'admin_client',
        clientSecret: 'admin_secret'
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByClientId(clientId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.clientId, clientId));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Form operations
  async getForms(userId: number): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.userId, userId));
  }
  
  async getAllForms(): Promise<Form[]> {
    return await db.select().from(forms);
  }

  async getForm(id: number): Promise<Form | undefined> {
    const result = await db.select().from(forms).where(eq(forms.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getFormByUuid(uuid: string): Promise<Form | undefined> {
    const result = await db.select().from(forms).where(eq(forms.uuid, uuid));
    return result.length > 0 ? result[0] : undefined;
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const result = await db.insert(forms).values(insertForm).returning();
    return result[0];
  }

  async updateForm(id: number, updatedFields: Partial<Form>): Promise<Form | undefined> {
    const updateData = {
      ...updatedFields,
      updatedAt: new Date()
    };
    
    const result = await db.update(forms)
      .set(updateData)
      .where(eq(forms.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteForm(id: number): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id)).returning();
    return result.length > 0;
  }

  // Submission operations
  async getSubmissions(formId: number): Promise<Submission[]> {
    return await db.select()
      .from(submissions)
      .where(eq(submissions.formId, formId))
      .orderBy(desc(submissions.createdAt));
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    const result = await db.select().from(submissions).where(eq(submissions.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const result = await db.insert(submissions).values(insertSubmission).returning();
    return result[0];
  }

  async updateSubmissionWebhookStatus(
    id: number, 
    webhookStatus: string, 
    webhookAttempts: number, 
    webhookResponse?: string
  ): Promise<Submission | undefined> {
    const updateData: Partial<Submission> = {
      webhookStatus,
      webhookAttempts
    };
    
    if (webhookResponse !== undefined) {
      updateData.webhookResponse = webhookResponse;
    }
    
    const result = await db.update(submissions)
      .set(updateData)
      .where(eq(submissions.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  // Webhook log operations
  async createWebhookLog(insertWebhookLog: InsertWebhookLog): Promise<WebhookLog> {
    const result = await db.insert(webhookLogs).values(insertWebhookLog).returning();
    return result[0];
  }

  async getWebhookLogs(submissionId: number): Promise<WebhookLog[]> {
    return await db.select()
      .from(webhookLogs)
      .where(eq(webhookLogs.submissionId, submissionId))
      .orderBy(desc(webhookLogs.createdAt));
  }
}

export const storage = new DatabaseStorage();
