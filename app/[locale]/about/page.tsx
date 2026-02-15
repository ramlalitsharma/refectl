import { Metadata } from "next";
import { BRAND_URL, BRAND_NAME } from "@/lib/brand";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: `About Us | ${BRAND_NAME}`,
        description: `Learn about ${BRAND_NAME}, our mission to revolutionize adaptive learning with AI-powered education, and the team behind the platform.`,
        alternates: {
            canonical: `/${locale}/about`,
        },
        openGraph: {
            title: `About ${BRAND_NAME} - AI-Powered Adaptive Learning`,
            description: `Discover how ${BRAND_NAME} is transforming education with AI-orchestrated adaptive quizzes and personalized learning paths.`,
            url: `/${locale}/about`,
            type: "website",
        },
    };
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
            <div className="container mx-auto px-4 py-16 space-y-16">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <p className="text-sm uppercase tracking-widest text-teal-600 font-semibold">About {BRAND_NAME}</p>
                    <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
                        Adaptive Learning, <span className="text-teal-600">Powered by AI</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        We're building the future of education with AI-orchestrated adaptive quizzes that evolve in real-time,
                        personalized learning paths, and intelligent content delivery that meets every learner where they are.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold text-slate-900">Our Mission</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {BRAND_NAME} was founded on a simple belief: every learner deserves a personalized education experience
                            that adapts to their unique needs, pace, and learning style. Traditional one-size-fits-all education
                            leaves too many students behind.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Using advanced AI and machine learning, we create adaptive quizzes that predict knowledge gaps with 95%
                            accuracy, generate personalized learning paths, and provide real-time feedback that accelerates mastery.
                        </p>
                    </div>
                    <Card className="shadow-2xl border-teal-100">
                        <CardHeader>
                            <CardTitle className="text-2xl">Platform Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                                <span className="text-slate-600">Active Learners</span>
                                <span className="text-2xl font-bold text-teal-600">10,000+</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-3">
                                <span className="text-slate-600">Courses Available</span>
                                <span className="text-2xl font-bold text-teal-600">500+</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-3">
                                <span className="text-slate-600">AI-Generated Quizzes</span>
                                <span className="text-2xl font-bold text-teal-600">1M+</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Average Improvement</span>
                                <span className="text-2xl font-bold text-teal-600">40%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">What Makes Us Different</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="border-teal-100 hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl">AI-Powered Adaptation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    Our quizzes evolve in real-time based on your performance, ensuring you're always challenged at the
                                    right level—never too easy, never too hard.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-teal-100 hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl">Personalized Learning Paths</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    AI-generated curriculums tailored to your goals, learning style, and current knowledge level. Every
                                    path is unique to you.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-teal-100 hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl">Real-Time Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    Track your progress with detailed analytics, knowledge gap predictions, and actionable insights to
                                    accelerate your learning journey.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-r from-teal-600 to-emerald-500 rounded-3xl p-12 text-white">
                    <h2 className="text-4xl font-bold">Ready to Transform Your Learning?</h2>
                    <p className="text-xl text-white/90">
                        Join thousands of learners who are mastering new skills faster with AI-powered adaptive education.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/sign-up">
                            <Button variant="inverse" className="bg-white text-teal-700 hover:bg-white/90 text-lg px-8 py-6">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/courses">
                            <Button variant="ghost" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                                Explore Courses
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
