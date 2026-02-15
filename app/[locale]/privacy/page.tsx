import { Metadata } from "next";
import { BRAND_URL, BRAND_NAME } from "@/lib/brand";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `Privacy Policy | ${BRAND_NAME}`,
    description: `How we handle your data and respect your privacy at ${BRAND_NAME}.`,
    alternates: {
      canonical: `/${locale}/privacy`,
    },
  };
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose prose-blue max-w-none">
        <p>
          {BRAND_NAME} respects your privacy. We collect only the data necessary to provide our services,
          including account information, learning activity, and usage analytics. We do not sell your data.
        </p>
        <h2>Cookies</h2>
        <p>
          We use cookies to remember your preferences and for analytics. You can accept or reject cookies
          using the cookie banner.
        </p>
        <h2>Advertising</h2>
        <p>
          If ads are enabled, third-party vendors, including Google, may use cookies to serve ads based on
          your prior visits. You can opt out of personalized advertising via Google Ads Settings.
        </p>
        <h2>Data Requests</h2>
        <p>
          You can request data export or deletion by contacting support.
        </p>
      </div>
    </div>
  );
}


