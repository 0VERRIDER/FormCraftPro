import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "@shared/schema";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);
  
  const { data: forms, isLoading } = useQuery({
    queryKey: ['/api/forms'],
    enabled: !!user
  });
  
  // If still loading or not authenticated, show loading
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        title="Dashboard"
        actions={
          <Button asChild>
            <Link href="/admin/forms/new">
              <i className="fas fa-plus mr-2"></i> New Form
            </Link>
          </Button>
        }
      />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Welcome, {user.username}!</h1>
            
            <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <i className="fas fa-file-alt text-primary-600"></i>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : forms.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? '' : forms.length === 0 ? 'Create your first form' : 'Forms created'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Submissions</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <i className="fas fa-inbox text-green-600"></i>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <p className="text-xs text-muted-foreground">Submissions this week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Webhook Success Rate</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fas fa-plug text-blue-600"></i>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <p className="text-xs text-muted-foreground">Average success rate</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Forms</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : forms.length === 0 ? (
                <Card className="text-center p-6">
                  <CardContent className="pt-10 pb-10">
                    <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <i className="fas fa-file-alt text-3xl text-gray-400"></i>
                    </div>
                    <h3 className="text-xl font-medium mb-2">No forms yet</h3>
                    <p className="text-gray-500 mb-6">
                      Create your first form to start collecting responses
                    </p>
                    <Button asChild>
                      <Link href="/admin/forms/new">
                        <i className="fas fa-plus mr-2"></i> Create Form
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {forms.map((form: Form) => (
                    <Card key={form.id} className="overflow-hidden transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg truncate">{form.title}</CardTitle>
                        <CardDescription className="truncate">
                          {form.description || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created:</span>
                            <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Last updated:</span>
                            <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Form ID:</span>
                            <span className="font-mono text-xs">{form.uuid}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-between">
                        <Button asChild variant="outline" size="sm">
                          <a href={`/forms/${form.uuid}`} target="_blank" rel="noopener noreferrer">
                            <i className="fas fa-external-link-alt mr-2"></i> View
                          </a>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/admin/forms/${form.id}`}>
                            <i className="fas fa-edit mr-2"></i> Edit
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
