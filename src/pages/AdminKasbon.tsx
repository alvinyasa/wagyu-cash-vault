import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { HashLink } from "@/components/HashLink";
import { rupiah, formatDate } from "@/lib/format";
import { generateTxHash } from "@/lib/blockchain";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

type Row = {
  id: string;
  user_id: string;
  nominal: number;
  alasan: string;
  status: "pending" | "approved" | "rejected";
  tx_hash: string;
  approval_tx_hash: string | null;
  created_at: string;
  profiles?: { nama: string; email: string } | null;
};

export default function AdminKasbon() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    // Manual join: fetch kasbon then profiles by user_ids
    const { data: kb } = await supabase.from("kasbon").select("*").order("created_at", { ascending: false });
    const ids = Array.from(new Set((kb ?? []).map((k) => k.user_id)));
    let profileMap: Record<string, { nama: string; email: string }> = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,nama,email").in("id", ids);
      profileMap = Object.fromEntries((profs ?? []).map((p) => [p.id, { nama: p.nama, email: p.email }]));
    }
    setRows((kb ?? []).map((k) => ({ ...k, profiles: profileMap[k.user_id] ?? null })) as Row[]);
  }

  useEffect(() => { load(); }, []);

  async function review(row: Row, status: "approved" | "rejected") {
    if (!user) return;
    setBusyId(row.id);
    try {
      const approval_tx_hash = await generateTxHash({ id: row.id, status, action: "approveKasbon" });
      const { error } = await supabase.from("kasbon").update({
        status,
        approval_tx_hash,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }).eq("id", row.id);
      if (error) throw error;
      toast.success(`Kasbon ${status === "approved" ? "disetujui" : "ditolak"}`);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const pending = rows.filter((r) => r.status === "pending");
  const reviewed = rows.filter((r) => r.status !== "pending");

  return (
    <ProtectedLayout adminOnly>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Kasbon</h1>
          <p className="text-muted-foreground mt-1">Setujui atau tolak pengajuan kasbon karyawan.</p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="reviewed">Riwayat ({reviewed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle>Menunggu Persetujuan</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                {pending.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Tidak ada pengajuan pending.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Nominal</TableHead>
                        <TableHead>Alasan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tx Hash</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="font-medium">{r.profiles?.nama ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                          </TableCell>
                          <TableCell className="font-semibold">{rupiah(Number(r.nominal))}</TableCell>
                          <TableCell className="max-w-xs truncate">{r.alasan}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(r.created_at)}</TableCell>
                          <TableCell><HashLink hash={r.tx_hash} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => review(r, "rejected")}>
                                {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                              </Button>
                              <Button size="sm" disabled={busyId === r.id} onClick={() => review(r, "approved")} className="bg-success text-success-foreground hover:bg-success/90">
                                {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviewed" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle>Riwayat Keputusan</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                {reviewed.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Belum ada riwayat.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Nominal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tx Hash</TableHead>
                        <TableHead>Approval Hash</TableHead>
                        <TableHead>Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewed.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.profiles?.nama ?? "—"}</TableCell>
                          <TableCell className="font-semibold">{rupiah(Number(r.nominal))}</TableCell>
                          <TableCell><StatusBadge status={r.status} /></TableCell>
                          <TableCell><HashLink hash={r.tx_hash} /></TableCell>
                          <TableCell><HashLink hash={r.approval_tx_hash} /></TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(r.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  );
}
