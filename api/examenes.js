export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el campo "prompt" en el body' });
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'Eres un generador de exámenes tipo PAU/Selectividad. Genera preguntas realistas, claras y bien estructuradas según lo que te pida el usuario.'
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

    res.status(200).json({ resultado: texto });
  } catch (error) {
    res.status(500).json({ error: 'Error al contactar con Groq', detalle: error.message });
  }
}