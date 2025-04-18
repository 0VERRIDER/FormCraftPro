import { useLocation, Link } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  title?: string;
  actions?: React.ReactNode;
  tabs?: {
    id: string;
    label: string;
    icon?: string;
  }[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function Navbar({ title, actions, tabs, activeTab, onTabChange }: NavbarProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  return (
    <div>
      {/* Top navbar */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            {/* Mobile sidebar trigger */}
            <Sidebar mobile={true} />
            
            {/* Logo for desktop */}
            {!title && (
              <div className="hidden lg:flex items-center">
                <svg className="h-8 w-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <span className="ml-2 text-gray-800 font-bold text-lg">FormCraft</span>
              </div>
            )}
            
            {/* Page title */}
            {title && (
              <h1 className="text-xl font-semibold">{title}</h1>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Action buttons */}
            {actions}
            
            {/* User dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-100 text-primary-600">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
        
        {/* Tab navigation */}
        {tabs && tabs.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 overflow-x-auto">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange && onTabChange(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon && <i className={`fas fa-${tab.icon} mr-2`}></i>}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
