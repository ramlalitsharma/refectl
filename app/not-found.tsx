import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 px-4 text-center">
            <div className="space-y-4">
                <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800">404</h1>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Button asChild className="mt-8">
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        </div>
    );
}
