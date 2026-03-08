import { handlePublicEventsGet } from '@/modules/terai-times/backend/http/publicEventsRoute';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handlePublicEventsGet(req);
}
