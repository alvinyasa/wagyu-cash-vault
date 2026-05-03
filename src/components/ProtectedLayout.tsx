import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Loader2 } from "lucide-react";

export function ProtectedLayout({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (adminOnly && role !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-8">{children}</main>
    </div>
  );
}
