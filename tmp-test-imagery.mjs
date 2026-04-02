import { NewsImagerySearch } from './lib/news-imagery-search.js';

async function test() {
    console.log('Testing Image Discovery for "China peacemaker Iran"...');
    const url = await NewsImagerySearch.findFreeStockPhoto(['China', 'peacemaker', 'Iran']);
    console.log('Discovered URL:', url);
}

test();
