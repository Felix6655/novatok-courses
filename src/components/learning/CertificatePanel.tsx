"use client";

import Link from "next/link";
import { useState } from "react";

interface IssuedCertificate {
  credentialId: string;
  courseTitle: string;
  issuedAt: string;
  verificationPath: string;
}

export function CertificatePanel({ courseSlug }: { courseSlug: string }) {
  const [certificate, setCertificate] = useState<IssuedCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function issueCertificate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/learning/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error ?? "Could not issue your certificate.");
        return;
      }
      setCertificate(body.certificate);
    } catch {
      setError("Could not issue your certificate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950">
      <h3 className="font-semibold text-emerald-950 dark:text-emerald-100">Course certificate</h3>
      <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
        You completed every lesson. Issue your permanent NovaTok credential and use its public verification page.
      </p>

      {certificate ? (
        <div className="mt-4">
          <p className="text-sm text-emerald-900 dark:text-emerald-200">
            Credential ID: <span className="font-mono">{certificate.credentialId}</span>
          </p>
          <Link
            href={certificate.verificationPath}
            className="mt-3 inline-flex rounded-md bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-100 dark:text-emerald-950"
          >
            View verified certificate
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={issueCertificate}
          disabled={loading}
          className="mt-4 rounded-md bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-100 dark:text-emerald-950"
        >
          {loading ? "Issuing..." : "Issue my certificate"}
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
    </section>
  );
}
