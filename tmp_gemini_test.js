const key = process.env.GOOGLE_AI_API_KEY;
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{ parts: [{ text: 'Output JSON: {\"a\": 1}' }] }],
        generationConfig: { response_mime_type: 'application/json' }
    })
}).then(async r => {
    console.log('Status:', r.status);
    console.log('Body:', await r.text());
}).catch(console.error);
