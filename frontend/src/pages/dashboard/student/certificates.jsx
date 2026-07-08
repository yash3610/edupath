import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Download, Share2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { apiBlobRequest, apiRequest } from "@/services/api";
import { toast } from "sonner";

const mapCertificate = (certificate = {}) => {
  const course = certificate.course || {};
  return {
    id: certificate._id || certificate.id,
    course: course.title || certificate.courseTitle || "Course",
    student: certificate.student?.name || certificate.studentName || "Student",
    date: certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-",
    code: certificate.certificateCode || certificate.id_code || certificate._id,
    verificationUrl: certificate.verificationUrl || "",
  };
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/certificates/my")
      .then((result) => setCertificates((result.data || []).map(mapCertificate)))
      .catch((error) => toast.error(error.message || "Unable to load your certificates."))
      .finally(() => setLoading(false));
  }, []);

  const share = (certificate) => {
    if (!certificate.verificationUrl) {
      toast.error("Verification link is not available.");
      return;
    }
    navigator.clipboard?.writeText(certificate.verificationUrl);
    toast.success("Verification link copied");
  };

  const downloadPdf = async (certificate) => {
    try {
      const blob = await apiBlobRequest(`/api/certificates/${certificate.id}/download`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `certificate-${certificate.code}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Certificate downloaded");
    } catch (error) {
      toast.error(error.message || "Unable to download the certificate.");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Your wins"
        title="Certificates"
        description={loading ? "Loading verified certificates..." : `${certificates.length} verified certificate${certificates.length === 1 ? "" : "s"}.`}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
        {certificates.map((certificate, i) => (
          <motion.div
            key={certificate.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="overflow-hidden rounded-3xl border border-border shadow-elegant"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-card p-6 md:p-10">
              <div className="absolute inset-0 gradient-hero opacity-80" />
              <div className="relative h-full">
                <div className="flex items-center justify-between">
                  <div className="font-display text-sm uppercase tracking-[0.25em] text-primary">EduPath Academy</div>
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">Certificate of Completion</div>
                <div className="mt-2 font-display text-3xl font-semibold leading-tight">{certificate.course}</div>
                <div className="mt-3 text-sm text-muted-foreground">awarded to</div>
                <div className="font-display text-2xl text-gradient">{certificate.student}</div>
                <div className="mt-6 flex items-end justify-between text-xs text-muted-foreground">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider">Issued</div>
                    <div className="text-foreground">{certificate.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider">Credential ID</div>
                    <div className="font-mono text-foreground">{certificate.code}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-success">
                <ShieldCheck className="h-4 w-4" /> Verified
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => share(certificate)}>
                  <Share2 className="mr-1 h-4 w-4" /> Share
                </Button>
                <Button size="sm" className="rounded-lg gradient-primary border-0 text-primary-foreground" onClick={() => downloadPdf(certificate)}>
                  <Download className="mr-1 h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {!loading && certificates.length === 0 && (
        <div className="rounded-2xl card-premium p-12 text-center text-sm text-muted-foreground">No certificates issued yet.</div>
      )}
    </div>
  );
}
