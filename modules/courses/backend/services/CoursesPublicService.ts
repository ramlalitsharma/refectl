import { getDatabase } from '@/lib/mongodb';
import { CourseServiceNeon } from '@/lib/course-service-neon';
import { FeatureModule } from '@/modules/core/shared';

export class CoursesPublicService extends FeatureModule {
  constructor() {
    super('courses-public');
  }

  async getPublishedCourses(selectedType?: string) {
    const db = await getDatabase();

    const query: Record<string, unknown> = { status: 'published' };
    if (selectedType === 'video') {
      query.type = 'video-course';
    } else if (selectedType === 'text') {
      query.type = { $nin: ['video-course', 'live-course'] };
    }

    const [mongoCourses, neonCourses] = await Promise.all([
      db.collection('courses').find(query).sort({ createdAt: -1 }).limit(200).toArray(),
      CourseServiceNeon.getPublishedCourses(),
    ]);

    return {
      courses: [
        ...mongoCourses,
        ...neonCourses.map((c) => ({
          ...c,
          _id: (c as any).id,
          dbSource: 'neon',
          createdAt: (c as any).updatedAt || (c as any).created_at,
        })),
      ],
      neonCourses,
    };
  }

  async getSubjects() {
    const db = await getDatabase();
    return db.collection('subjects').find({}).toArray();
  }

  async getCourseCounts(neonCourses: any[]) {
    const db = await getDatabase();
    const [totalMongo, publishedMongo] = await Promise.all([
      db.collection('courses').countDocuments({}),
      db.collection('courses').countDocuments({ status: 'published' }),
    ]);

    return {
      totalCourses: totalMongo + neonCourses.length,
      publishedCourses:
        publishedMongo + neonCourses.filter((c: any) => c.status === 'published').length,
    };
  }

  async getCourseDetailBySlug(slug: string) {
    const db = await getDatabase();
    let course = await db.collection('courses').findOne({ slug });
    if (!course) {
      const neonCourse = await CourseServiceNeon.getCourseBySlug(slug);
      if (neonCourse) {
        course = {
          ...neonCourse,
          _id: (neonCourse as any).id,
          units: (neonCourse as any).curriculum || [],
          modules: (neonCourse as any).curriculum || [],
        } as any;
      }
    }
    return course;
  }
}
