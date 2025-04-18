import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicForm } from "@/components/public-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FormView() {
  const { uuid } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: form, isLoading: queryLoading, error: queryError } = useQuery({
    queryKey: [`/api/public/forms/${uuid}`],
    onError: () => {
      setError("The form you are looking for could not be found or has been removed.");
    }
  });

  useEffect(() => {
    if (!queryLoading) {
      setTimeout(() => setIsLoading(false), 300); // Small delay for smoother transition
    }
  }, [queryLoading]);

  // Determine what to render after all hooks have been called
  let content;
  if (isLoading) {
    content = (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="bg-white rounded-lg shadow p-8 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-1/4 mx-auto" />
        </div>
      </div>
    );
  } else if (error || queryError) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "An error occurred while loading the form. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  } else if (form) {
    content = <PublicForm form={form} />;
  } else {
    // Fallback content if none of the above conditions are met
    content = (
      <Alert>
        <AlertTitle>Form Not Available</AlertTitle>
        <AlertDescription>This form could not be loaded.</AlertDescription>
      </Alert>
    );
  }

  // Single return statement for consistent hook calling
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {content}
      </div>
    </div>
  );
}
