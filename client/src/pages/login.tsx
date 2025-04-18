import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/login-form";

export default function Login() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect to admin if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/admin");
    }
  }, [user, loading, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <LoginForm />
    </div>
  );
}
