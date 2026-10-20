// Vercel Serverless Function: api/generate.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'POST required' });

  try {
    const { prompt, negativePrompt = '', style = 'cinematic', aspectRatio = '1:1', engine = 'auto', seed = Math.floor(Math.random() * 1000000) } = req.body || {};

    if (!prompt) return res.status(400).json({ success: false, error: 'Prompt is required' });

    let enhancedPrompt = prompt;
    if (style === 'cinematic') enhancedPrompt += ', cinematic lighting, 8k, photorealistic';
    else if (style === 'cyberpunk') enhancedPrompt += ', cyberpunk neon, high-tech, futuristic 8k';
    else if (style === 'anime') enhancedPrompt += ', vibrant anime artwork, crisp linework, makoto shinkai style';

    // 1. Try Perchance AI
    if (engine === 'perchance' || engine === 'auto') {
      try {
        const verify = await fetch('https://image-generation.perchance.org/api/verifyUser?thread=' + Math.random().toString(36).substring(7));
        const vdata = await verify.json();
        const userKey = vdata.userKey;

        if (userKey) {
          const gen = await fetch('https://image-generation.perchance.org/api/generate?userKey=' + userKey + '&prompt=' + encodeURIComponent(enhancedPrompt) + '&seed=' + seed);
          if (gen.ok) {
            const buf = await gen.arrayBuffer();
            const b64 = Buffer.from(buf).toString('base64');
            const mime = gen.headers.get('content-type') || 'image/jpeg';
            return res.json({ success: true, provider: 'perchance', imageUrl: 'data:' + mime + ';base64,' + b64 });
          }
        }
      } catch (e) {
        console.warn('Perchance attempt failed, switching to failover:', e.message);
      }
    }

    // 2. High-Res Uncensored Flux Pipeline Failover
    const pollinationsUrl = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(enhancedPrompt) + '?seed=' + seed + '&nologo=true&model=flux';
    const fallbackRes = await fetch(pollinationsUrl);
    const buf = await fallbackRes.arrayBuffer();
    const b64 = Buffer.from(buf).toString('base64');
    const mime = fallbackRes.headers.get('content-type') || 'image/jpeg';

    return res.json({
      success: true,
      provider: 'flux-uncensored',
      imageUrl: 'data:' + mime + ';base64,' + b64
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
