import { Metadata } from "next";
import { BRAND_URL, BRAND_NAME } from "@/lib/brand";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `Terms of Service | ${BRAND_NAME}`,
    description: `Terms and conditions for using the ${BRAND_NAME} platform.`,
    alternates: {
      canonical: `/${locale}/terms`,
    },
  };
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <div className="prose prose-blue max-w-none">
        <p>By using {BRAND_NAME}, you agree to these terms. Do not misuse our services.</p>
        <h2>Use of Service</h2>
        <p>You must comply with applicable laws and respect intellectual property rights.</p>
        <h2>Content</h2>
        <p>You are responsible for content you upload. We may remove content that violates policies.</p>
        <h2>Liability</h2>
        <p>Services are provided "as is". We disclaim warranties to the extent permitted by law.</p>
      </div>
    </div>
  );
}


