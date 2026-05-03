import { Link, useLocation } from "react-router-dom";
import { Blocks, LogOut, Shield, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, role, signOut } = useAuth();
  const { pathname } = useLocation();

  if (!user) return null;

  const links =
    role === "admin"
      ? [
          { to: "/admin", label: "Dashboard" },
          { to: "/admin/kasbon", label: "Manajemen Kasbon" },
        ]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/ajukan", label: "Ajukan Kasbon" },
          { to: "/riwayat", label: "Riwayat" },
        ];

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <Link to={role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-1.5">
            <Blocks className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg glow-text">KasbonChain</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === l.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 hidden sm:flex">
            {role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {role}
          </Badge>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
