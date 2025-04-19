import axios from 'axios';
import { storage } from './storage';
import { Form, Submission, WebhookConfig } from '@shared/schema';

// Function to dispatch webhook with exponential backoff retry
export async function dispatchWebhook(
  submission: Submission,
  form: Form
): Promise<boolean> {
  try {
    // If no webhook URL is set, return success
    if (!form.webhookUrl) {
      await storage.updateSubmissionWebhookStatus(submission.id, 'skipped', 0, 'No webhook URL configured');
      return true;
    }

    // Parse webhook settings
    let webhookConfig: WebhookConfig;
    if (form.webhookHeaders) {
      if (typeof form.webhookHeaders === 'string') {
        webhookConfig = JSON.parse(form.webhookHeaders);
      } else {
        webhookConfig = form.webhookHeaders as WebhookConfig;
      }
    } else {
      webhookConfig = { authType: 'none' };
    }
    
    // Set up headers
    const headers: Record<string, string> = {};
    
    // Add authentication headers if configured
    if (webhookConfig.authType && webhookConfig.authType !== 'none') {
      switch (webhookConfig.authType) {
        case 'api_key':
          if (webhookConfig.headerName && webhookConfig.headerValue) {
            headers[webhookConfig.headerName] = webhookConfig.headerValue;
          }
          break;
        case 'bearer_token':
          headers['Authorization'] = `Bearer ${webhookConfig.headerValue || ''}`;
          break;
        case 'basic_auth':
          if (webhookConfig.headerValue) {
            headers['Authorization'] = `Basic ${Buffer.from(webhookConfig.headerValue).toString('base64')}`;
          }
          break;
      }
    }
    
    // Add additional headers if configured
    if (webhookConfig.additionalHeaders) {
      Object.entries(webhookConfig.additionalHeaders).forEach(([key, value]) => {
        headers[key] = value;
      });
    }
    
    // Set up retry configuration
    const maxRetries = webhookConfig.enableRetry ? (webhookConfig.maxRetries || 3) : 0;
    let retryCount = 0;
    let success = false;
    
    while (retryCount <= maxRetries && !success) {
      try {
        const attemptNumber = retryCount + 1;
        
        // Send webhook request
        const response = await axios.post(form.webhookUrl, submission.data, { headers });
        
        // Log the successful attempt
        await storage.createWebhookLog({
          submissionId: submission.id,
          requestUrl: form.webhookUrl,
          requestBody: submission.data as any,
          requestHeaders: headers as any,
          responseStatus: response.status,
          responseBody: JSON.stringify(response.data),
          attemptNumber,
          successful: true
        });
        
        // Update submission webhook status
        await storage.updateSubmissionWebhookStatus(
          submission.id,
          'sent',
          attemptNumber,
          `Successfully sent after ${attemptNumber} attempt(s)`
        );
        
        success = true;
      } catch (error: any) {
        // Log the failed attempt
        await storage.createWebhookLog({
          submissionId: submission.id,
          requestUrl: form.webhookUrl,
          requestBody: submission.data as any,
          requestHeaders: headers as any,
          responseStatus: error.response?.status || 0,
          responseBody: JSON.stringify(error.response?.data || error.message),
          attemptNumber: retryCount + 1,
          successful: false
        });
        
        // If max retries reached, set final status
        if (retryCount >= maxRetries) {
          await storage.updateSubmissionWebhookStatus(
            submission.id,
            'failed',
            retryCount + 1,
            `Failed after ${retryCount + 1} attempts: ${error.message}`
          );
          return false;
        }
        
        // Update status to retrying
        await storage.updateSubmissionWebhookStatus(
          submission.id,
          'retrying',
          retryCount + 1,
          `Retry ${retryCount + 1}/${maxRetries + 1}: ${error.message}`
        );
        
        // Exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        retryCount++;
      }
    }
    
    return success;
  } catch (error: any) {
    console.error('Error dispatching webhook:', error);
    await storage.updateSubmissionWebhookStatus(
      submission.id,
      'error',
      0,
      `Internal error: ${error.message}`
    );
    return false;
  }
}
