import { useState } from "react";
import { useSortableField } from "@/lib/dndKit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field } from "@shared/schema";

interface FormBuilderFieldProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  index: number;
}

export function FormBuilderField({ 
  field, 
  updateField, 
  deleteField,
  duplicateField,
  index 
}: FormBuilderFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, style } = useSortableField(field.id);

  const renderFieldPreview = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input 
            type="text" 
            placeholder={field.placeholder || "Enter text"}
            disabled
          />
        );
      case 'textarea':
        return (
          <Textarea 
            placeholder={field.placeholder || "Enter text"} 
            disabled
          />
        );
      case 'number':
        return (
          <Input 
            type="number" 
            placeholder={field.placeholder || "Enter number"}
            disabled
          />
        );
      case 'email':
        return (
          <Input 
            type="email" 
            placeholder={field.placeholder || "Enter email"}
            disabled
          />
        );
      case 'date':
        return (
          <Input 
            type="date"
            disabled
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={`preview-${field.id}`} disabled />
            <label
              htmlFor={`preview-${field.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
          </div>
        );
      case 'radio':
        return (
          <RadioGroup disabled>
            {field.options?.map((option, i) => (
              <div className="flex items-center space-x-2" key={i}>
                <RadioGroupItem 
                  value={option} 
                  id={`radio-${field.id}-${i}`} 
                  disabled
                />
                <Label htmlFor={`radio-${field.id}-${i}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'dropdown':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, i) => (
                <SelectItem key={i} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'file':
        return (
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={`file-${field.id}`}>Upload file</Label>
            <Input id={`file-${field.id}`} type="file" disabled />
          </div>
        );
      case 'hidden':
        return (
          <div className="bg-muted p-2 rounded text-xs font-mono">
            Hidden field - Value will be set programmatically
          </div>
        );
      default:
        return <div>Unknown field type</div>;
    }
  };

  const renderFieldSettings = () => {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`label-${field.id}`}>Field Label</Label>
            <Input
              id={`label-${field.id}`}
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor={`key-${field.id}`}>Field Key (JSON)</Label>
            <Input
              id={`key-${field.id}`}
              value={field.key}
              onChange={(e) => updateField(field.id, { key: e.target.value })}
            />
          </div>
        </div>

        {['text', 'textarea', 'email', 'number'].includes(field.type) && (
          <div>
            <Label htmlFor={`placeholder-${field.id}`}>Placeholder Text</Label>
            <Input
              id={`placeholder-${field.id}`}
              value={field.placeholder || ''}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            />
          </div>
        )}

        <div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={`required-${field.id}`}
                checked={field.validation?.required || false}
                onCheckedChange={(checked) => 
                  updateField(field.id, { 
                    validation: { 
                      ...field.validation, 
                      required: checked 
                    } 
                  })
                }
              />
              <Label htmlFor={`required-${field.id}`}>Required field</Label>
            </div>

            {['text', 'textarea', 'email'].includes(field.type) && (
              <div>
                <Label htmlFor={`pattern-${field.id}`}>Pattern (regex)</Label>
                <Input
                  id={`pattern-${field.id}`}
                  value={field.validation?.pattern || ''}
                  placeholder="e.g. ^[a-zA-Z0-9]+$"
                  onChange={(e) => 
                    updateField(field.id, { 
                      validation: { 
                        ...field.validation, 
                        pattern: e.target.value 
                      } 
                    })
                  }
                />
              </div>
            )}

            {field.type === 'number' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`min-${field.id}`}>Min value</Label>
                  <Input
                    id={`min-${field.id}`}
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => 
                      updateField(field.id, { 
                        validation: { 
                          ...field.validation, 
                          min: e.target.value 
                        } 
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`max-${field.id}`}>Max value</Label>
                  <Input
                    id={`max-${field.id}`}
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => 
                      updateField(field.id, { 
                        validation: { 
                          ...field.validation, 
                          max: e.target.value 
                        } 
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor={`error-${field.id}`}>Error message</Label>
              <Input
                id={`error-${field.id}`}
                value={field.validation?.message || ''}
                placeholder="e.g. Please enter a valid value"
                onChange={(e) => 
                  updateField(field.id, { 
                    validation: { 
                      ...field.validation, 
                      message: e.target.value 
                    } 
                  })
                }
              />
            </div>
          </div>
        </div>

        {['dropdown', 'radio'].includes(field.type) && (
          <div>
            <Label>Options</Label>
            <div className="mt-2 space-y-2">
              {field.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[optionIndex] = e.target.value;
                      updateField(field.id, { options: newOptions });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newOptions = [...(field.options || [])];
                      newOptions.splice(optionIndex, 1);
                      updateField(field.id, { options: newOptions });
                    }}
                  >
                    <i className="fas fa-times" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(field.options || []), 'New Option'];
                  updateField(field.id, { options: newOptions });
                }}
              >
                <i className="fas fa-plus mr-2" /> Add Option
              </Button>
            </div>
          </div>
        )}

        {field.type === 'file' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`filetypes-${field.id}`}>Allowed file types</Label>
              <Input
                id={`filetypes-${field.id}`}
                placeholder="e.g. .pdf,.jpg,.png"
                value={field.fileTypes || ''}
                onChange={(e) => updateField(field.id, { fileTypes: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`maxsize-${field.id}`}>Max file size (MB)</Label>
              <Input
                id={`maxsize-${field.id}`}
                type="number"
                placeholder="10"
                value={field.maxSize || ''}
                onChange={(e) => updateField(field.id, { maxSize: e.target.value })}
              />
            </div>
          </div>
        )}

        {field.type === 'hidden' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`source-${field.id}`}>Value Source</Label>
              <Select
                value={field.valueSource || 'static'}
                onValueChange={(value) => updateField(field.id, { valueSource: value })}
              >
                <SelectTrigger id={`source-${field.id}`}>
                  <SelectValue placeholder="Select value source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static Value</SelectItem>
                  <SelectItem value="query">URL Query Parameter</SelectItem>
                  <SelectItem value="browser">Browser Metadata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`sourceparam-${field.id}`}>
                {field.valueSource === 'query' ? 'Parameter name' : 
                 field.valueSource === 'browser' ? 'Metadata type' : 'Static value'}
              </Label>
              <Input
                id={`sourceparam-${field.id}`}
                value={field.sourceParameter || ''}
                onChange={(e) => updateField(field.id, { sourceParameter: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="mb-4 border shadow-sm hover:shadow transition-shadow"
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-move mr-2 text-gray-400"
              {...attributes}
              {...listeners}
            >
              <i className="fas fa-grip-vertical" />
            </Button>
            <div>
              <span className="font-medium">{field.label}</span>
              <div className="text-xs text-gray-500 mt-1">
                Type: <span className="capitalize">{field.type}</span> | 
                Key: <span>{field.key}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => duplicateField(field.id)}
            >
              <i className="fas fa-copy" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteField(field.id)}
            >
              <i className="fas fa-trash" />
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {renderFieldPreview()}
        </div>

        {expanded && renderFieldSettings()}
      </CardContent>
    </Card>
  );
}
