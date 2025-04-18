import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

interface FieldTypeSelectorProps {
  addField: (field: Field) => void;
}

export function FieldTypeSelector({ addField }: FieldTypeSelectorProps) {
  const fieldTypes = [
    {
      type: "text",
      icon: "font",
      label: "Text Field",
      description: "Single line text input"
    },
    {
      type: "textarea",
      icon: "align-left",
      label: "Textarea",
      description: "Multi-line text input"
    },
    {
      type: "number",
      icon: "hashtag",
      label: "Number",
      description: "Numeric input field"
    },
    {
      type: "email",
      icon: "envelope",
      label: "Email",
      description: "Email address input"
    },
    {
      type: "date",
      icon: "calendar",
      label: "Date",
      description: "Date picker input"
    },
    {
      type: "checkbox",
      icon: "check-square",
      label: "Checkbox",
      description: "Single checkbox option"
    },
    {
      type: "radio",
      icon: "dot-circle",
      label: "Radio Buttons",
      description: "Multiple choice options"
    },
    {
      type: "dropdown",
      icon: "caret-square-down",
      label: "Dropdown",
      description: "Select from a list"
    },
    {
      type: "file",
      icon: "file-upload",
      label: "File Upload",
      description: "Allow file attachments"
    },
    {
      type: "hidden",
      icon: "eye-slash",
      label: "Hidden Field",
      description: "Not visible to users"
    }
  ];

  const handleAddField = (type: string) => {
    const field: Field = {
      id: uuidv4(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: type === "text" || type === "textarea" || type === "email" || type === "number" 
        ? "Enter value" 
        : undefined,
      key: `field_${Date.now()}`,
      options: type === "dropdown" || type === "radio" ? ["Option 1", "Option 2", "Option 3"] : undefined,
      validation: { required: false }
    };
    
    addField(field);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Field Types</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <p className="text-xs text-muted-foreground mb-3">
          Click to add fields to your form
        </p>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-3 pr-3">
            {fieldTypes.map((fieldType) => (
              <Button
                key={fieldType.type}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleAddField(fieldType.type)}
              >
                <i className={`fas fa-${fieldType.icon} text-muted-foreground w-8`}></i>
                <div>
                  <span className="block font-medium">{fieldType.label}</span>
                  <span className="text-xs text-muted-foreground">{fieldType.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
