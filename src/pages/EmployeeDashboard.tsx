import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { HashLink } from "@/components/HashLink";
import { rupiah, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingDown, Clock, PlusCircle, Banknote, ArrowLeftRight } from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ nama: string; gaji: number } | null>(null);
  const [kasbon, setKasbon] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, { data: kb }] = await Promise.all([
        supabase.from("profiles").select("nama,gaji").eq("id", user.id).maybeSingle(),
        supabase.from("kasbon").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(prof);
      setKasbon(kb ?? []);
    })();
  }, [user]);

  const approved = kasbon.filter((k) => k.status === "approved").reduce((s, k) => s + Number(k.nominal), 0);
  const pending = kasbon.filter((k) => k.status === "pending").length;
  const sisa = (profile?.gaji ?? 0) - approved;
  const transferCount = kasbon.filter((k) => k.metode_pembayaran === "transfer").length;
  const cashCount = kasbon.filter((k) => k.metode_pembayaran === "cash").length;

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Halo, {profile?.nama ?? "Karyawan"} 👋</h1>
            <p className="text-muted-foreground mt-1">Ringkasan kasbon dan saldo gaji Anda.</p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent">
            <Link to="/ajukan"><PlusCircle className="h-4 w-4 mr-2" /> Ajukan Kasbon</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Wallet className="h-5 w-5" />} label="Sisa Gaji" value={rupiah(sisa)} accent="primary" />
          <StatCard icon={<TrendingDown className="h-5 w-5" />} label="Total Kasbon Disetujui" value={rupiah(approved)} accent="accent" />
          <StatCard icon={<Clock className="h-5 w-5" />} label="Pengajuan Pending" value={String(pending)} accent="warning" />
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Riwayat Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {kasbon.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Belum ada pengajuan kasbon.</p>
            ) : (
              <div className="space-y-2">
                {kasbon.slice(0, 5).map((k) => (
                  <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="space-y-1">
                      <p className="font-semibold">{rupiah(Number(k.nominal))}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(k.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <HashLink hash={k.tx_hash} />
                      <StatusBadge status={k.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: "primary" | "accent" | "warning" }) {
  const accentClass = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    warning: "text-warning bg-warning/10",
  }[accent];
  return (
    <Card className="glass-card overflow-hidden relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`rounded-xl p-2.5 ${accentClass}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
