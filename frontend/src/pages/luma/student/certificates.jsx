import { motion } from "framer-motion";
import { Award, Download, Share2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { certificates, student } from "@/features/student/data/mock";
import { toast } from "sonner";
const share = (course) => {
  const url = `https://luma.ai/verify/${course.toLowerCase().replace(/\s+/g, "-")}`;
  navigator.clipboard?.writeText(url);
  toast.success("Verification link copied to clipboard");
};
export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Your wins"
        title="Certificates"
        description="Verified, shareable, and beautifully designed."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
        {certificates.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="overflow-hidden rounded-3xl border border-border shadow-elegant"
          >
            {/* Certificate canvas */}
            <div className="relative aspect-[16/10] overflow-hidden bg-card p-6 md:p-10">
              <div className="absolute inset-0 gradient-hero opacity-80" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full gradient-aurora opacity-40 blur-3xl" />
              <div className="relative h-full">
                <div className="flex items-center justify-between">
                  <div className="font-display text-sm uppercase tracking-[0.25em] text-primary">
                    Luma Academy
                  </div>
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Certificate of Completion
                </div>
                <div className="mt-2 font-display text-3xl font-semibold leading-tight">
                  {c.course}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">awarded to</div>
                <div className="font-display text-2xl text-gradient">{student.name}</div>
                <div className="mt-6 flex items-end justify-between text-xs text-muted-foreground">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider">Issued</div>
                    <div className="text-foreground">{c.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider">Credential ID</div>
                    <div className="font-mono text-foreground">{c.id_code}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-success">
                <ShieldCheck className="h-4 w-4" /> Verified
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => share(c.course)}
                >
                  <Share2 className="mr-1 h-4 w-4" /> Share
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg gradient-primary border-0 text-primary-foreground"
                  onClick={() => toast.success(`${c.id_code} downloaded`)}
                >
                  <Download className="mr-1 h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

