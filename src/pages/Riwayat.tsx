import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { HashLink } from "@/components/HashLink";
import { rupiah, formatDate } from "@/lib/format";

export default function Riwayat() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("kasbon").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, [user]);

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Riwayat Kasbon</h1>
          <p className="text-muted-foreground mt-1">Semua transaksi tercatat secara transparan di blockchain.</p>
        </div>
        <Card className="glass-card">
          <CardHeader><CardTitle>Daftar Transaksi</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {rows.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Belum ada riwayat.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Approval Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(r.created_at)}</TableCell>
                      <TableCell className="font-semibold">{rupiah(Number(r.nominal))}</TableCell>
                      <TableCell className="max-w-xs truncate">{r.alasan}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell><HashLink hash={r.tx_hash} /></TableCell>
                      <TableCell><HashLink hash={r.approval_tx_hash} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
