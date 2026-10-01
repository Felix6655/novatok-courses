import { NextResponse } from "next/server";
import { getCertificateByCredentialId } from "@/server/learning/certificate";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ credentialId: string }> },
) {
  const { credentialId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(credentialId)) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }
  const certificate = await getCertificateByCredentialId(credentialId);
  if (!certificate) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  return NextResponse.json({ valid: true, certificate });
}
