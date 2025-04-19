import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import { dispatchWebhook } from "./webhooks";
import { setupAuth } from "./auth";
import {
  insertFormSchema,
  insertSubmissionSchema,
  formSettingsSchema,
  fieldSchema,
  webhookConfigSchema,
  Form,
  FormSettings
} from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// Rate limiter for public form submissions
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submissions from this IP, please try again later" }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup authentication
  setupAuth(app);

  // Authentication middleware for protected routes
  const authenticate = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  
  // Form routes
  app.get("/api/forms", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const forms = await storage.getForms(user.id);
      
      // Map to a simplified response
      const formsList = forms.map(form => ({
        id: form.id,
        uuid: form.uuid,
        title: form.title,
        description: form.description,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        submissionCount: 0 // This would normally be calculated from submissions
      }));
      
      res.json(formsList);
    } catch (error) {
      console.error("Get forms error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/forms", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Validate form fields schema
      const fieldsSchema = z.array(fieldSchema);
      const fieldsResult = fieldsSchema.safeParse(req.body.fields);
      
      if (!fieldsResult.success) {
        return res.status(400).json({ message: "Invalid form fields", errors: fieldsResult.error.format() });
      }
      
      // Validate form settings schema
      const settingsResult = formSettingsSchema.safeParse(req.body.settings);
      
      if (!settingsResult.success) {
        return res.status(400).json({ message: "Invalid form settings", errors: settingsResult.error.format() });
      }
      
      // Validate webhook configuration if present
      if (req.body.webhookUrl) {
        const webhookResult = webhookConfigSchema.safeParse(req.body.webhookConfig);
        
        if (!webhookResult.success) {
          return res.status(400).json({ message: "Invalid webhook configuration", errors: webhookResult.error.format() });
        }
      }
      
      // Create a new form
      const form = await storage.createForm({
        userId: user.id,
        uuid: uuidv4(),
        title: req.body.title || "Untitled Form",
        description: req.body.description || "",
        fields: req.body.fields,
        settings: req.body.settings || {},
        webhookUrl: req.body.webhookUrl,
        webhookHeaders: req.body.webhookConfig || null
      });
      
      res.status(201).json(form);
    } catch (error) {
      console.error("Create form error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/forms/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const formId = parseInt(req.params.id);
      
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Check if the user owns this form
      if (form.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized access to this form" });
      }
      
      res.json(form);
    } catch (error) {
      console.error("Get form error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/forms/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const formId = parseInt(req.params.id);
      
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Check if the user owns this form
      if (form.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized access to this form" });
      }
      
      // Validate form fields schema if present
      if (req.body.fields) {
        const fieldsSchema = z.array(fieldSchema);
        const fieldsResult = fieldsSchema.safeParse(req.body.fields);
        
        if (!fieldsResult.success) {
          return res.status(400).json({ message: "Invalid form fields", errors: fieldsResult.error.format() });
        }
      }
      
      // Validate form settings schema if present
      if (req.body.settings) {
        const settingsResult = formSettingsSchema.safeParse(req.body.settings);
        
        if (!settingsResult.success) {
          return res.status(400).json({ message: "Invalid form settings", errors: settingsResult.error.format() });
        }
      }
      
      // Update the form
      const updatedForm = await storage.updateForm(formId, {
        title: req.body.title,
        description: req.body.description,
        fields: req.body.fields,
        settings: req.body.settings,
        webhookUrl: req.body.webhookUrl,
        webhookHeaders: req.body.webhookConfig
      });
      
      res.json(updatedForm);
    } catch (error) {
      console.error("Update form error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/forms/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const formId = parseInt(req.params.id);
      
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Check if the user owns this form
      if (form.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized access to this form" });
      }
      
      // Delete the form
      await storage.deleteForm(formId);
      
      res.json({ message: "Form deleted successfully" });
    } catch (error) {
      console.error("Delete form error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public form access using custom path 
  // Must be defined BEFORE the :uuid parameter route to avoid conflicts
  app.get("/api/public/forms/:uuid", async (req: Request, res: Response) => {
    try {
      const uuid = req.params.uuid;
      // Get all forms from all users to check custom path uniqueness
      const form = await storage.getFormByUuid(uuid);
      
      // Find form with matching customPath
      // const form = forms.find((f: Form) => {
      //   const settings = f.settings as FormSettings;
      //   return settings && settings.id === id;
      // });
      
      if (!form) {
        return res.status(404).json({ message: "Form not found", uuid });
      }
      
      // Return public form data (excluding webhook details)
      res.json({
        uuid: form.uuid,
        title: form.title,
        description: form.description,
        fields: form.fields,
        settings: form.settings
      });
    } catch (error) {
      console.error("Get form by custom path error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Form submission
  app.post("/api/public/forms/:uuid/submit", submissionLimiter, async (req: Request, res: Response) => {
    try {
      const uuid = req.params.uuid;
      const form = await storage.getFormByUuid(uuid);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Check if form is active
      const settings = form.settings as any;
      if (settings && settings.isActive === false) {
        return res.status(403).json({ message: "This form is currently inactive" });
      }
      
      // Validate form data against fields (basic validation)
      const formData = req.body;
      
      // Create submission
      const submission = await storage.createSubmission({
        formId: form.id,
        data: formData,
        webhookStatus: 'pending',
        webhookAttempts: 0,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || ''
      });
      
      // Dispatch webhook asynchronously
      dispatchWebhook(submission, form).catch(err => {
        console.error('Webhook dispatch error:', err);
      });
      
      res.status(201).json({
        message: "Form submitted successfully",
        submissionId: submission.id
      });
    } catch (error) {
      console.error("Form submission error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Form submissions management
  app.get("/api/forms/:id/submissions", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const formId = parseInt(req.params.id);
      
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Check if the user owns this form
      if (form.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized access to this form" });
      }
      
      const submissions = await storage.getSubmissions(formId);
      
      res.json(submissions);
    } catch (error) {
      console.error("Get submissions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/submissions/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const submissionId = parseInt(req.params.id);
      
      if (isNaN(submissionId)) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }
      
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      // Check if the user owns the form associated with this submission
      const form = await storage.getForm(submission.formId);
      
      if (!form || form.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized access to this submission" });
      }
      
      // Get webhook logs for this submission
      const webhookLogs = await storage.getWebhookLogs(submissionId);
      
      res.json({
        submission,
        webhookLogs
      });
    } catch (error) {
      console.error("Get submission error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Webhook logs
  app.get("/api/forms/:id/webhook-logs", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const formId = parseInt(req.params.id);
      
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Check if the user owns this form
      if (form.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized access to this form" });
      }
      
      // Get all submissions for this form
      const submissions = await storage.getSubmissions(formId);
      
      // Collect webhook logs for all submissions
      const logsPromises = submissions.map(submission => 
        storage.getWebhookLogs(submission.id)
      );
      
      const allWebhookLogs = await Promise.all(logsPromises);
      
      // Flatten logs and add submission info
      const logs = allWebhookLogs
        .flat()
        .map(log => {
          const submission = submissions.find(s => s.id === log.submissionId);
          return {
            ...log,
            submissionDate: submission?.createdAt
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      res.json(logs);
    } catch (error) {
      console.error("Get webhook logs error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Retry webhook
  app.post("/api/submissions/:id/retry-webhook", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const submissionId = parseInt(req.params.id);
      
      if (isNaN(submissionId)) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }
      
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      // Check if the user owns the form associated with this submission
      const form = await storage.getForm(submission.formId);
      
      if (!form || form.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized access to this submission" });
      }
      
      // Reset webhook status
      await storage.updateSubmissionWebhookStatus(
        submissionId,
        'pending',
        submission.webhookAttempts || 0, // Use 0 if webhookAttempts is null
        'Manual retry initiated'
      );
      
      // Dispatch webhook
      const success = await dispatchWebhook(submission, form);
      
      res.json({
        success,
        message: success ? "Webhook dispatched successfully" : "Webhook dispatch failed"
      });
    } catch (error) {
      console.error("Retry webhook error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
