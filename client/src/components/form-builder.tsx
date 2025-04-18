import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormBuilderField } from "@/components/ui/form-builder-field";
import { FieldTypeSelector } from "@/components/ui/field-type-selector";
import { FormProperties } from "@/components/ui/form-properties";
import { DndKitContext, handleDragEnd } from "@/lib/dndKit";
import { Field, FormSettings } from "@shared/schema";
import { DragEndEvent } from "@dnd-kit/core";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { v4 as uuidv4 } from "uuid";

interface FormBuilderProps {
  formId?: string;
  initialFields?: Field[];
  initialSettings?: FormSettings;
  initialTitle?: string;
  initialDescription?: string;
  onSave?: () => void;
}

export function FormBuilder({
  formId,
  initialFields,
  initialSettings,
  initialTitle,
  initialDescription,
  onSave
}: FormBuilderProps) {
  const [fields, setFields] = useState<Field[]>(initialFields || []);
  const [settings, setSettings] = useState<FormSettings>(initialSettings || { 
    successMessage: "Thank you for your submission!",
    showTitle: true,
    showDescription: true,
    buttonLabel: "Submit",
    themeColor: "#4f46e5",
    enableRateLimiting: true
  });
  const [title, setTitle] = useState(initialTitle || "Untitled Form");
  const [description, setDescription] = useState(initialDescription || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const addField = (field: Field) => {
    setFields([...fields, field]);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const duplicateField = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (!field) return;
    
    const index = fields.findIndex(f => f.id === id);
    const newField: Field = {
      ...JSON.parse(JSON.stringify(field)),
      id: uuidv4(),
      key: `${field.key}_copy`
    };
    
    const newFields = [...fields];
    newFields.splice(index + 1, 0, newField);
    setFields(newFields);
  };

  const updateSettings = (newSettings: Partial<FormSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const updateFormBasics = (newTitle: string, newDescription: string) => {
    setTitle(newTitle);
    setDescription(newDescription);
    
    toast({
      title: "Form details updated",
      description: "Your form details have been updated successfully"
    });
  };

  const handleDragEndEvent = (event: DragEndEvent) => {
    handleDragEnd(event, fields, setFields);
  };

  const saveForm = async () => {
    if (fields.length === 0) {
      toast({
        title: "Cannot save form",
        description: "Please add at least one field to your form",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const formData = {
        title,
        description,
        fields,
        settings
      };

      if (formId) {
        // Update existing form
        await apiRequest('PUT', `/api/forms/${formId}`, formData);
        toast({
          title: "Form updated",
          description: "Your form has been updated successfully"
        });
      } else {
        // Create new form
        await apiRequest('POST', '/api/forms', formData);
        toast({
          title: "Form created",
          description: "Your form has been created successfully"
        });
      }

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error saving form",
        description: "There was an error saving your form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3">
        <FieldTypeSelector addField={addField} />
      </div>
      
      <div className="lg:col-span-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold w-auto"
                placeholder="Form Title"
              />
              <div className="flex space-x-2">
                <Button variant="outline" disabled={isSaving}>
                  <i className="fas fa-eye mr-2"></i> Preview
                </Button>
                <Button onClick={saveForm} disabled={isSaving}>
                  <i className="fas fa-save mr-2"></i> 
                  {isSaving ? "Saving..." : "Save Form"}
                </Button>
              </div>
            </div>
            
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-6"
              placeholder="Form Description"
            />
            
            <DndKitContext items={fields} onDragEnd={handleDragEndEvent}>
              {fields.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <i className="fas fa-hand-pointer text-gray-400 text-4xl mb-3"></i>
                  <h3 className="text-lg font-medium text-gray-900">Start Building Your Form</h3>
                  <p className="mt-1 text-gray-500">
                    Add form fields by clicking on field types from the panel on the left.
                  </p>
                </div>
              ) : (
                <div>
                  {fields.map((field, index) => (
                    <FormBuilderField
                      key={field.id}
                      field={field}
                      updateField={updateField}
                      deleteField={deleteField}
                      duplicateField={duplicateField}
                      index={index}
                    />
                  ))}
                  
                  <div className="mt-8">
                    <Button type="button" className="bg-primary-600 hover:bg-primary-700">
                      {settings.buttonLabel || "Submit Form"}
                    </Button>
                  </div>
                </div>
              )}
            </DndKitContext>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-3">
        <FormProperties
          settings={settings}
          updateSettings={updateSettings}
          formUrl={formId ? `${window.location.host}/forms/${formId}` : undefined}
          formTitle={title}
          formDescription={description}
          updateFormBasics={updateFormBasics}
        />
      </div>
    </div>
  );
}
