// Deprecated example kept for reference.
// Manual slot injection has been retired in favor of global AdSense Auto Ads.

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-elite-bg py-16">
      <div className="container mx-auto px-4">
        
        {/* TOP SECTION */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4">Page Title</h1>
          <p>Your content here...</p>
        </div>

        {/* Auto Ads are injected globally by AdSenseScript */}
        <div className="flex justify-center my-12">
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-500">
            AdSense Auto Ads zone
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-12">
          <p>More content below the ad...</p>
        </div>

      </div>
    </div>
  );
}
