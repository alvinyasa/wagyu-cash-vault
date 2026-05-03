import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateTxHash } from "@/lib/blockchain";
import { toast } from "sonner";
import { Loader2, Blocks } from "lucide-react";

const schema = z.object({
  nominal: z.coerce.number().gt(40000, "Nominal harus lebih dari Rp 40.000"),
  alasan: z.string().trim().min(5, "Alasan min. 5 karakter").max(500),
  metode_pembayaran: z.enum(["transfer", "cash"], { message: "Pilih metode pembayaran" }),
});

export default function AjukanKasbon() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setBusy(true);
    try {
      const tx_hash = await generateTxHash({
        user_id: user.id,
        nominal: parsed.data.nominal,
        metode_pembayaran: parsed.data.metode_pembayaran,
        action: "createKasbon",
      });
      const { error } = await supabase.from("kasbon").insert({
        user_id: user.id,
        nominal: parsed.data.nominal,
        alasan: parsed.data.alasan,
        metode_pembayaran: parsed.data.metode_pembayaran,
        tx_hash,
      });
      if (error) throw error;
      toast.success("Pengajuan dicatat di blockchain", { description: tx_hash.slice(0, 22) + "…" });
      nav("/riwayat");
    } catch (err: any) {
      toast.error(err.message ?? "Gagal mengajukan kasbon");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <div className="inline-flex w-fit rounded-lg bg-gradient-to-br from-primary to-accent p-2 mb-2">
              <Blocks className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle>Ajukan Kasbon</CardTitle>
            <CardDescription>
              Pengajuan akan dicatat permanen di blockchain dan menunggu persetujuan admin.
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nominal">Nominal (Rp)</Label>
                <Input id="nominal" name="nominal" type="number" min={40000} step={1000} required placeholder="50000" />
                <p className="text-xs text-muted-foreground">Minimal lebih dari Rp 40.000</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alasan">Alasan</Label>
                <Textarea id="alasan" name="alasan" required rows={4} placeholder="Keperluan keluarga, biaya kesehatan, ..." />
              </div>
              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <RadioGroup name="metode_pembayaran" defaultValue="transfer" className="grid grid-cols-2 gap-3">
                  <Label htmlFor="m-transfer" className="flex items-center gap-2 rounded-md border border-border p-3 cursor-pointer hover:bg-accent/30">
                    <RadioGroupItem value="transfer" id="m-transfer" />
                    <span>Transfer</span>
                  </Label>
                  <Label htmlFor="m-cash" className="flex items-center gap-2 rounded-md border border-border p-3 cursor-pointer hover:bg-accent/30">
                    <RadioGroupItem value="cash" id="m-cash" />
                    <span>Cash</span>
                  </Label>
                </RadioGroup>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => nav(-1)}>Batal</Button>
                <Button type="submit" disabled={busy} className="flex-1 bg-gradient-to-r from-primary to-accent">
                  {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit ke Blockchain
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
