import { handlePublicNewsGet } from '@/modules/terai-times/backend/http/publicNewsRoute';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handlePublicNewsGet(req);
}
