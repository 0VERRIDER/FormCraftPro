import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Field, FormSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PublicFormProps {
  form: Form;
}

export function PublicForm({ form }: PublicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const settings = form.settings as FormSettings;
  const fields = form.fields as Field[];

  // Unique key for localStorage per form
  const localStorageKey = `form_submitted_${form.uuid}`;

  // On mount, check if form was submitted (from localStorage)
  useEffect(() => {
    const submitted = localStorage.getItem(localStorageKey);
    if (submitted === "true") {
      setIsSubmitted(true);
    }
  }, [localStorageKey]);

  // Generate validation schema dynamically based on form fields
  const generateValidationSchema = () => {
    const schema: Record<string, any> = {};
    
    fields.forEach((field) => {
      let fieldSchema: any = z.any();
      
      switch (field.type) {
        case 'text':
        case 'textarea':
          fieldSchema = z.string();
          if (field.validation?.pattern) {
            fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern), 
              field.validation.message || "Invalid format");
          }
          break;
          
        case 'email':
          fieldSchema = z.string().email(field.validation?.message || "Invalid email address");
          break;
          
        case 'number':
          fieldSchema = z.string().refine(
            (val) => !isNaN(Number(val)),
            { message: "Must be a number" }
          );
          
          if (field.validation?.min) {
            const minValue = Number(field.validation.min);
            fieldSchema = fieldSchema.refine(
              (val) => Number(val) >= minValue,
              { message: field.validation.message || `Must be at least ${minValue}` }
            );
          }
          
          if (field.validation?.max) {
            const maxValue = Number(field.validation.max);
            fieldSchema = fieldSchema.refine(
              (val) => Number(val) <= maxValue,
              { message: field.validation.message || `Must be at most ${maxValue}` }
            );
          }
          break;
          
        case 'checkbox':
          fieldSchema = z.boolean().optional();
          break;
          
        case 'date':
          fieldSchema = z.string().refine(
            (val) => !val || !isNaN(Date.parse(val)),
            { message: field.validation?.message || "Invalid date" }
          );
          break;
          
        case 'dropdown':
        case 'radio':
          fieldSchema = z.string();
          break;
          
        case 'file':
          // File validation is handled separately
          fieldSchema = z.any().optional();
          break;
          
        case 'hidden':
          fieldSchema = z.any().optional();
          break;
      }
      
      if (field.validation?.required && field.type !== 'checkbox') {
        fieldSchema = fieldSchema.min(1, field.validation.message || "This field is required");
      }
      
      schema[field.key] = fieldSchema;
    });
    
    return z.object(schema);
  };

  const formSchema = generateValidationSchema();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  });
  
  // Handle hidden fields from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hiddenFields = fields.filter(field => field.type === 'hidden' && field.valueSource === 'query');
    
    if (hiddenFields.length > 0) {
      const defaultValues: Record<string, string> = {};
      
      hiddenFields.forEach(field => {
        if (field.sourceParameter) {
          const paramValue = urlParams.get(field.sourceParameter);
          if (paramValue) {
            defaultValues[field.key] = paramValue;
          }
        }
      });
      
      if (Object.keys(defaultValues).length > 0) {
        reset(defaultValues);
      }
    }
  }, [fields, reset]);
  
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      // Add any hidden fields with static values
      fields.forEach(field => {
        if (field.type === 'hidden' && field.valueSource === 'static' && field.sourceParameter) {
          data[field.key] = field.sourceParameter;
        }
      });
      
      // Add browser metadata for fields configured to use it
      fields.forEach(field => {
        if (field.type === 'hidden' && field.valueSource === 'browser') {
          switch (field.sourceParameter) {
            case 'userAgent':
              data[field.key] = navigator.userAgent;
              break;
            case 'referrer':
              data[field.key] = document.referrer;
              break;
            case 'screenSize':
              data[field.key] = `${window.innerWidth}x${window.innerHeight}`;
              break;
            case 'timestamp':
              data[field.key] = new Date().toISOString();
              break;
          }
        }
      });
      
      // Submit the form
      await apiRequest('POST', `/api/public/forms/${form.uuid}/submit`, data);
      
      // Show success message
      setIsSubmitted(true);
      localStorage.setItem(localStorageKey, "true");
      
      // If redirect URL is set, redirect after a short delay
      if (settings.redirectUrl) {
        setTimeout(() => {
          window.location.href = settings.redirectUrl!;
        }, 1500);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrorMessage("There was an error submitting the form. Please try again.");
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Use a variable to store the content based on conditions instead of early returns
  let content;
  
  if (isSubmitted && !settings.redirectUrl) {
    content = (
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fas fa-check text-green-600 text-xl"></i>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
          <p className="text-gray-600">
            {settings.successMessage || "Your form has been submitted successfully."}
          </p>
          {/* <Button 
            className="mt-6"
            onClick={() => {
              setIsSubmitted(false);
              localStorage.removeItem(localStorageKey);
              reset();
            }}
          >
            Submit Another Response
          </Button> */}
        </CardContent>
      </Card>
    );
  }
  
  const themeColor = settings.themeColor || "#4f46e5";
  
  // Check if form is active
  const isFormActive = settings.isActive !== false;
  
  // Apply custom theme color
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.id = 'dynamic-form-styles';
    
    // Add CSS rules for the custom color
    style.innerHTML = `
      .custom-form-button { 
        background-color: ${themeColor}; 
      }
      .custom-form-button:hover { 
        background-color: ${themeColor}; 
        filter: brightness(0.9);
      }
    `;
    
    // Add to document head
    document.head.appendChild(style);
    
    // Cleanup
    return () => {
      const existingStyle = document.getElementById('dynamic-form-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [themeColor]);

  // If content wasn't set by the submission success state, set it now
  if (!content) {
    content = (
      <Card className="w-full max-w-xl mx-auto">
        {(settings.showTitle !== false || settings.showDescription !== false) && (
          <CardHeader>
            {settings.showTitle !== false && (
              <CardTitle>{form.title}</CardTitle>
            )}
            {settings.showDescription !== false && form.description && (
              <CardDescription>{form.description}</CardDescription>
            )}
          </CardHeader>
        )}
        
        <CardContent>
          {!isFormActive ? (
            <Alert className="mb-6">
              <AlertTitle>Form Unavailable</AlertTitle>
              <AlertDescription>This form is currently inactive. Please check back later.</AlertDescription>
            </Alert>
          ) : (
            <>
              {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {fields.map((field) => {
                    if (field.type === 'hidden') {
                      return (
                        <input
                          key={field.id}
                          type="hidden"
                          {...register(field.key)}
                        />
                      );
                    }
                    
                    return (
                      <div key={field.id}>
                        {field.type !== 'checkbox' && (
                          <Label 
                            htmlFor={field.id}
                            className="block text-sm font-medium mb-1.5"
                          >
                            {field.label}
                            {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                        )}
                        
                        {field.type === 'text' && (
                          <Input
                            id={field.id}
                            placeholder={field.placeholder}
                            {...register(field.key)}
                            className={errors[field.key] ? "border-red-300" : ""}
                          />
                        )}
                        
                        {field.type === 'textarea' && (
                          <Textarea
                            id={field.id}
                            placeholder={field.placeholder}
                            rows={4}
                            {...register(field.key)}
                            className={errors[field.key] ? "border-red-300" : ""}
                          />
                        )}
                        
                        {field.type === 'email' && (
                          <Input
                            id={field.id}
                            type="email"
                            placeholder={field.placeholder}
                            {...register(field.key)}
                            className={errors[field.key] ? "border-red-300" : ""}
                          />
                        )}
                        
                        {field.type === 'number' && (
                          <Input
                            id={field.id}
                            type="number"
                            placeholder={field.placeholder}
                            min={field.validation?.min}
                            max={field.validation?.max}
                            {...register(field.key)}
                            className={errors[field.key] ? "border-red-300" : ""}
                          />
                        )}
                        
                        {field.type === 'date' && (
                          <Input
                            id={field.id}
                            type="date"
                            {...register(field.key)}
                            className={errors[field.key] ? "border-red-300" : ""}
                          />
                        )}
                        
                        {field.type === 'checkbox' && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={field.id}
                              {...register(field.key)}
                            />
                            <Label htmlFor={field.id}>
                              {field.label}
                              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                          </div>
                        )}
                        
                        {field.type === 'radio' && field.options && (
                          <RadioGroup
                            defaultValue={field.options[0]}
                            className="flex flex-col space-y-2"
                            {...register(field.key)}
                          >
                            {field.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value={option} 
                                  id={`${field.id}-option-${index}`} 
                                />
                                <Label htmlFor={`${field.id}-option-${index}`}>{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        
                        {field.type === 'dropdown' && field.options && (
                          <Select
                            {...register(field.key)}
                          >
                            <SelectTrigger className={errors[field.key] ? "border-red-300" : ""}>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option, index) => (
                                <SelectItem key={index} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {field.type === 'file' && (
                          <Input
                            id={field.id}
                            type="file"
                            accept={field.fileTypes}
                            {...register(field.key)}
                            className={errors[field.key] ? "border-red-300" : ""}
                          />
                        )}
                        
                        {errors[field.key] && (
                          <p className="mt-1 text-sm text-red-600">
                            {String(errors[field.key]?.message)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <CardFooter className="flex justify-center px-0 pt-6 pb-0">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full custom-form-button"
                  >
                    {isSubmitting ? "Submitting..." : (settings.buttonLabel || "Submit")}
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Always return the content
  return content;
}