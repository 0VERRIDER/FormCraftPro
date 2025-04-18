import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { FormBuilder } from "@/components/form-builder";
import { FormSubmissions } from "@/components/form-submissions";
import { FormSettingsComponent } from "@/components/form-settings";
import { FormWebhooks } from "@/components/form-webhooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FormSettings } from "@shared/schema";

export default function FormEditor() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  const params = useParams();
  const formId = params.formId;
  const isNewForm = formId === 'new';
  
  const [activeTab, setActiveTab] = useState("builder");
  
  // Fetch the form data
  const { data: form, isLoading, error } = useQuery<any>({
    queryKey: [`/api/forms/${formId}`],
    enabled: !!user && !isNewForm && formId !== undefined
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);
  
  // For new form - no need to wait for query
  const isReady = isNewForm || (!isLoading && form);
  
  // If still loading or not authenticated, show loading
  if (loading || !user || (!isNewForm && isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <Skeleton className="h-12 w-40 mx-auto" />
          </main>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (!isNewForm && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Form</h2>
              <p className="text-gray-600 mb-4">There was an error loading the form. It may have been deleted or you might not have permission to access it.</p>
              <Button onClick={() => navigate("/admin")}>
                Return to Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  const handleFormUpdated = () => {
    if (!isNewForm) {
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
    }
  };
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar 
          title={isNewForm ? "New Form" : form?.title || "Form Editor"} 
          tabs={[
            { id: "builder", label: "Form Builder", icon: "edit" },
            { id: "settings", label: "Settings", icon: "cog" },
            { id: "submissions", label: "Submissions", icon: "inbox" },
            { id: "webhooks", label: "Webhooks", icon: "plug" }
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === "builder" && (
              <FormBuilder
                formId={isNewForm ? undefined : formId}
                initialFields={isNewForm ? [] : (form?.fields || [])}
                initialSettings={isNewForm ? undefined : (form?.settings || {
                  successMessage: "Thank you for your submission!",
                  showTitle: true,
                  showDescription: true,
                  buttonLabel: "Submit",
                  themeColor: "#4f46e5",
                  enableRateLimiting: true
                })}
                initialTitle={isNewForm ? undefined : form?.title}
                initialDescription={isNewForm ? undefined : form?.description}
                onSave={isNewForm ? () => navigate("/admin") : undefined}
              />
            )}
            
            {activeTab === "settings" && !isNewForm && formId && (
              <FormSettingsComponent 
                formId={formId} 
                form={form || {}} 
                onFormUpdated={handleFormUpdated}
              />
            )}
            
            {activeTab === "submissions" && !isNewForm && formId && (
              <FormSubmissions formId={formId} />
            )}
            
            {activeTab === "webhooks" && !isNewForm && formId && (
              <FormWebhooks formId={formId} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
