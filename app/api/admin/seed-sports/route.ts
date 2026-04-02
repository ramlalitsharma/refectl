import { NextResponse } from 'next/server';
import { NewsService } from '@/lib/news-service';

export async function GET() {
  const sportsSeeds = [
    {
      title: "IPL 2024: Chennai Super Kings vs Mumbai Indians - Match Analytics",
      slug: "ipl-2024-csk-vs-mi-match-analytics-relay",
      summary: "Refectl analysis indicates a high-velocity encounter at Wankhede. Tactical shifts in middle-overs deployment detected by our sports sensors.",
      content: "The historic rivalry resumes with tactical upgrades from both camps. Our intelligence nodes indicate a pitch bias towards spinners in the second innings. Impact scores for opening bowlers are peaking at 84/100. Terminal users should monitor the live stream for real-time telemetry updates.",
      category: "Sports",
      country: "India",
      status: "published",
      published_at: new Date().toISOString(),
      view_count: 5402,
      impact_score: 88,
      sentiment: "Bullish",
      tags: ["IPL", "Cricket", "Match-Relay", "Tactical"],
      image_url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067"
    },
    {
      title: "Global Sports Ingress: Tournament Security Protocols Updated",
      slug: "global-sports-ingress-security-relay",
      summary: "New intelligence signals suggest heightened security for high-profile stadium events across Asia and Europe.",
      content: "Security-Level Orange. Analysis indicates a 15% increase in perimeter monitoring for upcoming international fixtures. All terminal users are advised to verify their source signals. Relayed via the Sports Intelligence Hub.",
      category: "Sports",
      country: "Global",
      status: "published",
      published_at: new Date(Date.now() - 3600000).toISOString(),
      view_count: 1204,
      impact_score: 64,
      sentiment: "Neutral",
      tags: ["Security", "Logistics", "Global-Sports"],
      image_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2067"
    },
    {
      title: "Rajasthan Royals Peak in Strategic Standing Table",
      slug: "rajasthan-royals-strategic-relay-analysis",
      summary: "Our sports telemetry nodes confirm Rajasthan Royals as the current leader in tactical consistency.",
      content: "With a win rate of 78% in the last 5 fixtures, RR has demonstrated superior middle-order stability. Analysis nodes report high impact scores for their bowling rotation strategy.",
      category: "Sports",
      country: "India",
      status: "published",
      published_at: new Date(Date.now() - 7200000).toISOString(),
      view_count: 890,
      impact_score: 92,
      sentiment: "Bullish",
      tags: ["IPL", "RR", "Analytics"],
      image_url: "https://images.unsplash.com/photo-1508344928928-7165bdddec3e?q=80&w=2070"
    }
  ];

  const results = [];
  for (const news of sportsSeeds) {
    try {
      const data = await NewsService.upsertNews(news as any);
      results.push({ title: news.title, status: 'OK' });
    } catch (e: any) {
      results.push({ title: news.title, status: 'FAIL', error: e.message });
    }
  }

  return NextResponse.json({ success: true, results });
}
