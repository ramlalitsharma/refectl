import StudyBuddy from '@/components/ai/StudyBuddy';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen">
            {/* Existing dashboard content wrap could go here if we had sidebar in layout, 
          but usually the page.tsx handles that. 
          Assuming this wraps the `app/dashboard/page.tsx` and potential sub-pages.
      */}
            {children}

            {/* AI Assistant is Global to Dashboard */}
            <StudyBuddy />
        </div>
    );
}
