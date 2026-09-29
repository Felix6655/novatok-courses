import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCertificateByCredentialId } from "@/server/learning/certificate";

export const metadata: Metadata = {
  title: "Verify certificate | NovaTok Courses",
  robots: { index: false, follow: false },
};

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(credentialId)) notFound();

  const certificate = await getCertificateByCredentialId(credentialId);
  if (!certificate) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
          Verified NovaTok credential
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
          Certificate of Completion
        </h1>
        <p className="mt-6 text-lg text-neutral-700 dark:text-neutral-300">
          This credential confirms completion of <strong>{certificate.courseTitle}</strong>.
        </p>
        <dl className="mt-8 grid gap-5 rounded-xl bg-neutral-50 p-5 text-sm dark:bg-neutral-900">
          <div>
            <dt className="text-neutral-500">Credential ID</dt>
            <dd className="mt-1 break-all font-mono text-neutral-900 dark:text-neutral-100">{certificate.credentialId}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Instructor</dt>
            <dd className="mt-1 text-neutral-900 dark:text-neutral-100">{certificate.instructorName}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Issued</dt>
            <dd className="mt-1 text-neutral-900 dark:text-neutral-100">
              {new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(certificate.issuedAt))}
            </dd>
          </div>
        </dl>
        <Link href={`/courses/${certificate.courseSlug}`} className="mt-8 inline-block text-sm font-medium text-neutral-700 hover:underline dark:text-neutral-300">
          View course
        </Link>
      </section>
    </main>
  );
}
