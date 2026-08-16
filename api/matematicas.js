export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Parseo seguro de req.body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
    }
  }

  const { prompt } = body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el campo "prompt" en el body' });
  }

  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la clave GOOGLE_AI_STUDIO_KEY en .env.local' });
  }

  const modelo = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

  const systemInstruction = `Eres un tutor de Matemáticas y Física de 2º de Bachillerato, preparando al alumno para la PAU/Selectividad.
Reglas estrictas:
- Resuelve SIEMPRE paso a paso, mostrando cada operación intermedia, nunca solo el resultado final.
- Usa notación KaTeX para todas las expresiones matemáticas: fórmulas en línea entre $...$ y fórmulas destacadas entre $$...$$.
- Si el enunciado es ambiguo o falta un dato, dilo explícitamente en vez de asumirlo.
- No inventes datos, unidades o fórmulas: si no estás seguro de una fórmula concreta, indícalo.
- Al final, resume el resultado en una línea clara.`;

  try {
    const geminiResponse = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      return res.status(geminiResponse.status).json({ error: 'Error de Gemini', detalle: errorBody });
    }

    const data = await geminiResponse.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return res.status(200).json({ resultado: texto });
  } catch (error) {
    return res.status(500).json({ error: 'Error al contactar con Gemini', detalle: error.message });
  }
}