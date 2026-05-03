import { ExternalLink } from "lucide-react";
import { explorerUrl, shortHash } from "@/lib/blockchain";

export function HashLink({ hash }: { hash: string | null | undefined }) {
  if (!hash) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={explorerUrl(hash)}
      target="_blank"
      rel="noreferrer"
      className="hash-mono inline-flex items-center gap-1 text-primary hover:text-primary-glow transition-colors"
    >
      {shortHash(hash)}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
