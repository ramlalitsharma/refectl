import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { CheckoutPage } from '@/components/payments/CheckoutPage';

export const dynamic = 'force-dynamic';

interface CheckoutPageProps {
  searchParams: Promise<{ courseId?: string; amount?: string; courseSlug?: string }>;
}

export default async function Checkout({ searchParams }: CheckoutPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=' + encodeURIComponent('/checkout'));
  }

  const params = await searchParams;
  const { courseId, amount, courseSlug } = params;

  if (!courseId && !courseSlug) {
    redirect('/courses');
  }

  const db = await getDatabase();
  let course: any = null;

  if (courseId) {
    const { ObjectId } = await import('mongodb');
    if (ObjectId.isValid(courseId)) {
      course = await db.collection('courses').findOne({ _id: new ObjectId(courseId) });
    }
  }

  if (!course && courseSlug) {
    course = await db.collection('courses').findOne({ slug: courseSlug });
  }

  if (!course) {
    redirect('/courses');
  }

  const coursePrice = typeof course.price === 'number'
    ? course.price
    : (course.price?.amount || parseFloat(amount || '0'));

  const currency = typeof course.price === 'number'
    ? (course.currency || 'USD')
    : (course.price?.currency || 'USD');

  return (
    <div className="bg-[#f4f6f9] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <CheckoutPage
          courseId={course._id ? String(course._id) : course.slug}
          courseSlug={course.slug}
          courseTitle={course.title}
          amount={coursePrice}
          currency={currency}
        />
      </div>
    </div>
  );
}

