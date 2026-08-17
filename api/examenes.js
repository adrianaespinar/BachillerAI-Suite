export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Parseo seguro de req.body por si llega como string (igual que en feynman.js)
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

  const apiKey = process.env.GROQ_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la clave GROQ_KEY en .env.local' });
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'Eres un generador de exámenes especializado ÚNICAMENTE en el diseño, formato y preparación de exámenes con criterio PAU/Selectividad. Genera preguntas realistas, claras y bien estructuradas según lo que te pida el usuario, e incluye siempre al final un apartado de "Soluciones" con la respuesta correcta de cada pregunta tipo test.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5
      })
    });

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text();
      return res.status(groqResponse.status).json({ error: 'Error de Groq', detalle: errorBody });
    }

    const data = await groqResponse.json();
    const texto = data.choices?.[0]?.message?.content ?? '';

    return res.status(200).json({ resultado: texto });
  } catch (error) {
    return res.status(500).json({ error: 'Error al contactar con Groq', detalle: error.message });
  }
}