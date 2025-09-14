// workers/tts-worker.js
// Deploy with: wrangler deploy workers/tts-worker.js --name empowerq-tts
// Set secret: wrangler secret put ELEVEN_API_KEY

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/speak") {
      return new Response("OK", {status: 200});
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    const { text, lang } = await request.json();
    if (!text) return new Response("Missing text", { status: 400 });

    const voices = { en: "Rachel", es: "Sergio" };
    const voice = voices[(lang || "en")] || voices.en;

    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`;
    const payload = {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true }
    };

    const r = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVEN_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const msg = await r.text();
      return new Response(`TTS error: ${msg}`, { status: 500 });
    }
    return new Response(r.body, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" }
    });
  }
};
