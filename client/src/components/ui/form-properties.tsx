import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Form, FormSettings } from "@shared/schema";

interface FormPropertiesProps {
  settings: FormSettings;
  updateSettings: (newSettings: Partial<FormSettings>) => void;
  formUrl?: string;
  formTitle: string;
  formDescription?: string;
  updateFormBasics: (title: string, description: string) => void;
}

export function FormProperties({
  settings,
  updateSettings,
  formUrl,
  formTitle,
  formDescription,
  updateFormBasics
}: FormPropertiesProps) {
  const [title, setTitle] = useState(formTitle);
  const [description, setDescription] = useState(formDescription || '');
  
  const handleSaveFormBasics = () => {
    updateFormBasics(title, description);
  };

  const colorOptions = [
    { color: 'bg-primary-500', value: '#4f46e5' },
    { color: 'bg-blue-500', value: '#3b82f6' },
    { color: 'bg-green-500', value: '#22c55e' },
    { color: 'bg-red-500', value: '#ef4444' },
    { color: 'bg-yellow-500', value: '#f59e0b' },
    { color: 'bg-purple-500', value: '#a855f7' }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Form Properties</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pt-0">
        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Form Details</TabsTrigger>
            <TabsTrigger value="behavior" className="flex-1">Behavior</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
          </TabsList>
          
          {/* Form Details Tab */}
          <TabsContent value="details" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input 
                id="form-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="form-description">Description</Label>
              <Textarea 
                id="form-description" 
                rows={3} 
                placeholder="Describe the purpose of this form"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            {formUrl && (
              <div>
                <Label>Form URL</Label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    https://
                  </span>
                  <Input
                    className="rounded-l-none"
                    value={formUrl.replace('https://', '')}
                    readOnly
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${formUrl}`);
                  }}
                >
                  <i className="fas fa-copy mr-2"></i> Copy URL
                </Button>
              </div>
            )}

            <div className="pt-2">
              <Button onClick={handleSaveFormBasics}>
                Save Form Details
              </Button>
            </div>
          </TabsContent>
          
          {/* Form Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="success-message">Success Message</Label>
              <Textarea
                id="success-message"
                rows={3}
                placeholder="Message to show after successful submission"
                value={settings.successMessage || ''}
                onChange={(e) => updateSettings({ successMessage: e.target.value })}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-title"
                checked={settings.showTitle !== false}
                onCheckedChange={(checked) => updateSettings({ showTitle: checked })}
              />
              <Label htmlFor="show-title">Show form title</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-description"
                checked={settings.showDescription !== false}
                onCheckedChange={(checked) => updateSettings({ showDescription: checked })}
              />
              <Label htmlFor="show-description">Show form description</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="redirect-after"
                checked={!!settings.redirectUrl}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    updateSettings({ redirectUrl: undefined });
                  } else {
                    updateSettings({ redirectUrl: '' });
                  }
                }}
              />
              <Label htmlFor="redirect-after">Redirect after submission</Label>
            </div>
            
            {settings.redirectUrl !== undefined && (
              <div className="ml-7">
                <Label htmlFor="redirect-url">Redirect URL</Label>
                <Input
                  id="redirect-url"
                  placeholder="https://example.com/thank-you"
                  value={settings.redirectUrl}
                  onChange={(e) => updateSettings({ redirectUrl: e.target.value })}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-recaptcha"
                checked={settings.enableRecaptcha || false}
                onCheckedChange={(checked) => updateSettings({ enableRecaptcha: checked })}
              />
              <Label htmlFor="enable-recaptcha">Enable reCAPTCHA</Label>
            </div>
            
            {settings.enableRecaptcha && (
              <div className="space-y-2 ml-7">
                <div>
                  <Label htmlFor="recaptcha-site-key">Site Key</Label>
                  <Input
                    id="recaptcha-site-key"
                    placeholder="Enter reCAPTCHA site key"
                    value={settings.recaptchaSiteKey || ''}
                    onChange={(e) => updateSettings({ recaptchaSiteKey: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="recaptcha-secret-key">Secret Key</Label>
                  <Input
                    id="recaptcha-secret-key"
                    type="password"
                    placeholder="Enter reCAPTCHA secret key"
                    value={settings.recaptchaSecretKey || ''}
                    onChange={(e) => updateSettings({ recaptchaSecretKey: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-rate-limiting"
                checked={settings.enableRateLimiting !== false}
                onCheckedChange={(checked) => updateSettings({ enableRateLimiting: checked })}
              />
              <Label htmlFor="enable-rate-limiting">Enable rate limiting</Label>
            </div>
          </TabsContent>
          
          {/* Form Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="button-label">Button Label</Label>
              <Input
                id="button-label"
                value={settings.buttonLabel || 'Submit'}
                onChange={(e) => updateSettings({ buttonLabel: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Theme Color</Label>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`w-8 h-8 rounded-full ${option.color} ${
                      settings.themeColor === option.value ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                    }`}
                    onClick={() => updateSettings({ themeColor: option.value })}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
