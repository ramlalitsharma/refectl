require('dotenv').config({ path: '.env.local' });
const key = process.env.GOOGLE_AI_API_KEY;

function check(model) {
    return fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: "testing" }] }]
        })
    }).then(async r => {
        console.log(model, r.status);
    }).catch(console.error);
}

async function run() {
    await check('gemini-1.5-flash');
    await check('gemini-1.5-flash-latest');
    await check('gemini-1.5-pro');
}
run();
