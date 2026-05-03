import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { rupiah } from "@/lib/format";
import { ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, totalNominal: 0 });

  useEffect(() => {
    supabase.from("kasbon").select("status,nominal").then(({ data }) => {
      const rows = data ?? [];
      setStats({
        total: rows.length,
        pending: rows.filter((r) => r.status === "pending").length,
        approved: rows.filter((r) => r.status === "approved").length,
        rejected: rows.filter((r) => r.status === "rejected").length,
        totalNominal: rows.filter((r) => r.status === "approved").reduce((s, r) => s + Number(r.nominal), 0),
      });
    });
  }, []);

  return (
    <ProtectedLayout adminOnly>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground mt-1">Pantau dan kelola pengajuan kasbon karyawan.</p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent">
            <Link to="/admin/kasbon">Kelola Kasbon</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={<ClipboardList className="h-5 w-5" />} label="Total Pengajuan" value={String(stats.total)} tone="primary" />
          <Stat icon={<Clock className="h-5 w-5" />} label="Pending" value={String(stats.pending)} tone="warning" />
          <Stat icon={<CheckCircle2 className="h-5 w-5" />} label="Approved" value={String(stats.approved)} tone="success" />
          <Stat icon={<XCircle className="h-5 w-5" />} label="Rejected" value={String(stats.rejected)} tone="destructive" />
        </div>

        <Card className="glass-card">
          <CardHeader><CardTitle>Total Kasbon Disetujui</CardTitle></CardHeader>
          <CardContent>
            <p className="text-4xl font-bold glow-text">{rupiah(stats.totalNominal)}</p>
            <p className="text-sm text-muted-foreground mt-2">Akumulasi seluruh kasbon yang sudah disetujui dan tercatat di blockchain.</p>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  const cls: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    warning: "text-warning bg-warning/10",
    success: "text-success bg-success/10",
    destructive: "text-destructive bg-destructive/10",
  };
  return (
    <Card className="glass-card">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${cls[tone]}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}
