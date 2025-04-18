import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FormSettingsProps {
  formId: string;
  form: Form;
  onFormUpdated: () => void;
}

export function FormSettingsComponent({ formId, form, onFormUpdated }: FormSettingsProps) {
  const [formTitle, setFormTitle] = useState(form.title);
  const [formDescription, setFormDescription] = useState(form.description || '');
  const [settings, setSettings] = useState<FormSettings>(form.settings as FormSettings);
  const [webhookUrl, setWebhookUrl] = useState(form.webhookUrl || '');
  const [webhookAuthType, setWebhookAuthType] = useState('none');
  const [webhookHeaderName, setWebhookHeaderName] = useState('');
  const [webhookHeaderValue, setWebhookHeaderValue] = useState('');
  const [additionalHeaders, setAdditionalHeaders] = useState<{ name: string; value: string }[]>([]);
  const [enableRetry, setEnableRetry] = useState(true);
  const [maxRetries, setMaxRetries] = useState('3');
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();

  const saveFormSettings = async () => {
    setIsSaving(true);
    try {
      // Prepare webhook config if webhook URL is provided
      const webhookConfig = webhookUrl 
        ? {
            authType: webhookAuthType,
            headerName: webhookHeaderName,
            headerValue: webhookHeaderValue,
            additionalHeaders: additionalHeaders.reduce((acc, header) => {
              if (header.name && header.value) {
                acc[header.name] = header.value;
              }
              return acc;
            }, {} as Record<string, string>),
            enableRetry,
            maxRetries: parseInt(maxRetries)
          }
        : null;

      // Update form with new settings
      await apiRequest('PUT', `/api/forms/${formId}`, {
        title: formTitle,
        description: formDescription,
        settings,
        webhookUrl,
        webhookConfig
      });

      toast({
        title: "Settings saved",
        description: "Your form settings have been updated successfully"
      });
      
      onFormUpdated();
    } catch (error) {
      console.error('Error saving form settings:', error);
      toast({
        title: "Error saving settings",
        description: "There was an error saving your form settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addAdditionalHeader = () => {
    setAdditionalHeaders([...additionalHeaders, { name: '', value: '' }]);
  };

  const updateAdditionalHeader = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...additionalHeaders];
    updated[index][field] = value;
    setAdditionalHeaders(updated);
  };

  const removeAdditionalHeader = (index: number) => {
    setAdditionalHeaders(additionalHeaders.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>
          
          {/* Basic Settings Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <Label htmlFor="form-name">Form Name</Label>
                <Input
                  id="form-name"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="form-description">Form Description</Label>
                <Textarea
                  id="form-description"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div>
                <Label>Form URL</Label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    https://
                  </span>
                  <Input
                    className="rounded-l-none"
                    value={`${window.location.host}/forms/${form.uuid}`}
                    readOnly
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${window.location.host}/forms/${form.uuid}`);
                  }}
                >
                  <i className="fas fa-copy mr-2"></i> Copy URL
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Behavior Settings Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Form Behavior</h4>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Switch
                      id="form-active"
                      checked={settings.isActive !== false}
                      onCheckedChange={(checked) => {
                        setSettings({
                          ...settings,
                          isActive: checked
                        });
                      }}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="form-active" className="font-medium">
                      Form Active
                    </Label>
                    <p className="text-gray-500">
                      When turned off, the form will not accept submissions
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Switch
                      id="show-success-message"
                      checked={!!settings.successMessage}
                      onCheckedChange={(checked) => {
                        setSettings({
                          ...settings,
                          successMessage: checked 
                            ? settings.successMessage || "Thank you for your submission!" 
                            : ""
                        });
                      }}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="show-success-message" className="font-medium">
                      Show success message after submission
                    </Label>
                    <p className="text-gray-500">
                      Display a thank you message when form is successfully submitted
                    </p>
                  </div>
                </div>
                
                {settings.successMessage && (
                  <div className="ml-7">
                    <Label htmlFor="success-message">Success Message</Label>
                    <Textarea
                      id="success-message"
                      value={settings.successMessage}
                      onChange={(e) => setSettings({ ...settings, successMessage: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Switch
                      id="redirect-after"
                      checked={!!settings.redirectUrl}
                      onCheckedChange={(checked) => {
                        setSettings({
                          ...settings,
                          redirectUrl: checked ? "" : undefined
                        });
                      }}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="redirect-after" className="font-medium">
                      Redirect after submission
                    </Label>
                    <p className="text-gray-500">
                      Send users to another page after form is submitted
                    </p>
                  </div>
                </div>
                
                {settings.redirectUrl !== undefined && (
                  <div className="ml-7">
                    <Label htmlFor="redirect-url">Redirect URL</Label>
                    <Input
                      id="redirect-url"
                      placeholder="https://example.com/thank-you"
                      value={settings.redirectUrl}
                      onChange={(e) => setSettings({ ...settings, redirectUrl: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900">Form Appearance</h4>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="button-label">Button Label</Label>
                  <Input
                    id="button-label"
                    value={settings.buttonLabel || "Submit"}
                    onChange={(e) => setSettings({ ...settings, buttonLabel: e.target.value })}
                  />
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Switch
                      id="show-title"
                      checked={settings.showTitle !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, showTitle: checked })}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="show-title" className="font-medium">
                      Show form title
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Switch
                      id="show-description"
                      checked={settings.showDescription !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, showDescription: checked })}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="show-description" className="font-medium">
                      Show form description
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900">Spam Protection</h4>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Switch
                      id="enable-recaptcha"
                      checked={settings.enableRecaptcha || false}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableRecaptcha: checked })}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="enable-recaptcha" className="font-medium">
                      Enable Google reCAPTCHA
                    </Label>
                    <p className="text-gray-500">Protect your form from spam bots</p>
                  </div>
                </div>
                
                {settings.enableRecaptcha && (
                  <div className="ml-7 grid grid-cols-1 gap-y-2 gap-x-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="recaptcha-site-key">Site Key</Label>
                      <Input
                        id="recaptcha-site-key"
                        placeholder="Enter reCAPTCHA site key"
                        value={settings.recaptchaSiteKey || ""}
                        onChange={(e) => setSettings({ ...settings, recaptchaSiteKey: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="recaptcha-secret-key">Secret Key</Label>
                      <Input
                        id="recaptcha-secret-key"
                        type="password"
                        placeholder="Enter reCAPTCHA secret key"
                        value={settings.recaptchaSecretKey || ""}
                        onChange={(e) => setSettings({ ...settings, recaptchaSecretKey: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Switch
                      id="enable-rate-limiting"
                      checked={settings.enableRateLimiting !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableRateLimiting: checked })}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="enable-rate-limiting" className="font-medium">
                      Enable rate limiting
                    </Label>
                    <p className="text-gray-500">
                      Limit the number of submissions from the same IP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  https://
                </span>
                <Input
                  id="webhook-url"
                  placeholder="api.example.com/webhook"
                  value={webhookUrl.replace(/^https?:\/\//, '')}
                  onChange={(e) => setWebhookUrl(`https://${e.target.value}`)}
                  className="rounded-l-none"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter the full URL where form submissions should be sent
              </p>
            </div>
            
            <div>
              <Label htmlFor="auth-type">Authentication</Label>
              <Select 
                value={webhookAuthType} 
                onValueChange={setWebhookAuthType}
              >
                <SelectTrigger id="auth-type">
                  <SelectValue placeholder="Select authentication type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="bearer_token">Bearer Token</SelectItem>
                  <SelectItem value="basic_auth">Basic Auth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {webhookAuthType !== 'none' && (
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="header-name">Header Name</Label>
                  <Input
                    id="header-name"
                    value={webhookHeaderName}
                    onChange={(e) => setWebhookHeaderName(e.target.value)}
                    placeholder={webhookAuthType === 'api_key' ? 'X-API-Key' : 'Authorization'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="header-value">
                    {webhookAuthType === 'api_key' 
                      ? 'API Key' 
                      : webhookAuthType === 'bearer_token'
                      ? 'Token'
                      : 'Credentials'}
                  </Label>
                  <Input
                    id="header-value"
                    value={webhookHeaderValue}
                    onChange={(e) => setWebhookHeaderValue(e.target.value)}
                    placeholder={
                      webhookAuthType === 'api_key' 
                        ? 'your-api-key' 
                        : webhookAuthType === 'bearer_token'
                        ? 'your-token'
                        : 'username:password'
                    }
                    type={webhookAuthType === 'api_key' ? 'text' : 'password'}
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label>Additional Headers</Label>
              <div className="mt-2 space-y-2">
                {additionalHeaders.map((header, index) => (
                  <div key={index} className="grid grid-cols-1 gap-y-2 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <Input
                        placeholder="Header name"
                        value={header.name}
                        onChange={(e) => updateAdditionalHeader(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-3 flex">
                      <Input
                        placeholder="Header value"
                        value={header.value}
                        onChange={(e) => updateAdditionalHeader(index, 'value', e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAdditionalHeader(index)}
                        className="ml-2"
                      >
                        <i className="fas fa-times" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAdditionalHeader}
                >
                  <i className="fas fa-plus mr-1"></i> Add Header
                </Button>
              </div>
            </div>
            
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Switch
                    id="enable-retry"
                    checked={enableRetry}
                    onCheckedChange={setEnableRetry}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="enable-retry" className="font-medium">
                    Enable retry on failure
                  </Label>
                  <p className="text-gray-500">
                    Automatically retry failed webhook deliveries
                  </p>
                </div>
              </div>
              
              {enableRetry && (
                <div className="mt-4 ml-7">
                  <Label htmlFor="max-retries">Maximum Retries</Label>
                  <Select 
                    value={maxRetries} 
                    onValueChange={setMaxRetries}
                  >
                    <SelectTrigger id="max-retries">
                      <SelectValue placeholder="Select maximum retries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={saveFormSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
