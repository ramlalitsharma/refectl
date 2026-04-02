const { NewsImagerySearch } = require('./lib/news-imagery-search');

async function test() {
    console.log('Testing Image Discovery for "China peacemaker Iran"...');
    const url = await NewsImagerySearch.findFreeStockPhoto(['China', 'peacemaker', 'Iran']);
    console.log('Discovered URL:', url);
    process.exit(0);
}

test();
