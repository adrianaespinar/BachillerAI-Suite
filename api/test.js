export default function handler(req, res) {
  // Esta función NO llama a ninguna IA todavía.
  // Solo comprueba que Vercel está leyendo bien tus 3 claves desde .env.local
  // (en local) o desde las Environment Variables (una vez despliegues).

  const claves = {
    GOOGLE_AI_STUDIO_KEY: process.env.GOOGLE_AI_STUDIO_KEY ? '✅ detectada' : '❌ NO detectada',
    OPENROUTER_KEY: process.env.OPENROUTER_KEY ? '✅ detectada' : '❌ NO detectada',
    GROQ_KEY: process.env.GROQ_KEY ? '✅ detectada' : '❌ NO detectada',
  };

  res.status(200).json({
    mensaje: 'Test de variables de entorno',
    claves,
  });
}