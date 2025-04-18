import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Form } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const { data: forms } = useQuery({
    queryKey: ['/api/forms'],
    enabled: !!user,
  });

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <Link href="/admin" className="flex items-center">
          <svg className="h-8 w-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <span className="ml-2 text-gray-800 font-bold text-lg">FormCraft</span>
        </Link>
      </div>
      
      {/* Sidebar content */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <Link href="/admin/forms/new">
            <Button className="w-full justify-start" onClick={() => setOpen(false)}>
              <i className="fas fa-plus mr-2"></i> New Form
            </Button>
          </Link>
          
          <div className="mt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              My Forms
            </h3>
            
            <div className="mt-2 space-y-1">
              {!forms ? (
                <div className="text-center p-4 text-sm text-gray-500">Loading forms...</div>
              ) : forms.length === 0 ? (
                <div className="text-center p-4 text-sm text-gray-500">No forms yet</div>
              ) : (
                forms.map((form: Form) => (
                  <Link
                    key={form.id}
                    href={`/admin/forms/${form.id}`}
                    onClick={() => setOpen(false)}
                  >
                    <div 
                      className={cn(
                        "block px-4 py-2 text-sm rounded-md transition-colors",
                        location === `/admin/forms/${form.id}`
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div className="truncate max-w-[180px]">{form.title}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(form.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Sidebar footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
            <i className="fas fa-user text-sm"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.username || 'User'}</p>
            <button 
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return mobile ? (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <i className="fas fa-bars"></i>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[300px]">
        {sidebarContent}
      </SheetContent>
    </Sheet>
  ) : (
    <div className="hidden lg:block w-64 border-r border-gray-200 bg-white">
      {sidebarContent}
    </div>
  );
}
