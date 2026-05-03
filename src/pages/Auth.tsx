import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Blocks, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid").max(255),
  password: z.string().min(6, "Password min. 6 karakter").max(72),
});
const signupSchema = loginSchema.extend({
  nama: z.string().trim().min(2, "Nama min. 2 karakter").max(100),
});

export default function Auth() {
  const { user, loading, role } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Login berhasil");
    nav("/dashboard");
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { nama: parsed.data.nama },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Akun berhasil dibuat. Silakan login.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-primary to-accent p-3 shadow-[var(--shadow-glow)]">
            <Blocks className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold glow-text">KasbonChain</h1>
          <p className="text-muted-foreground text-sm">
            Sistem kasbon karyawan transparan berbasis blockchain
          </p>
        </div>

        <Card className="glass-card">
          <Tabs defaultValue="login">
            <CardHeader>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Daftar</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <CardDescription>Masuk ke akun karyawan atau admin Anda.</CardDescription>
                  <div className="space-y-2">
                    <Label htmlFor="li-email">Email</Label>
                    <Input id="li-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="li-password">Password</Label>
                    <Input id="li-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Masuk
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <CardDescription>Daftar sebagai karyawan baru.</CardDescription>
                  <div className="space-y-2">
                    <Label htmlFor="su-nama">Nama Lengkap</Label>
                    <Input id="su-nama" name="nama" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-password">Password</Label>
                    <Input id="su-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Buat Akun
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
