import { Metadata } from "next";
import { CommercialCalculator } from "@/components/tools/CommercialCalculator";

export const metadata: Metadata = {
    title: "Commercial Calculator | Refectl Relay Hub",
    description: "Professional grade financial calculator for commercial real estate and business analysis. Calculate NOI, Cap Rate, ROI, and DSCR with real-time accuracy.",
    keywords: ["commercial calculator", "noi calculator", "cap rate", "roi calculator", "financial tools", "refectl"],
};

export default function CalculatorPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-elite-bg py-16 px-4">
            <div className="container mx-auto">
                <CommercialCalculator />
            </div>
        </div>
    );
}
