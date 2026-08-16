export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Parseo seguro de req.body por si llega como string en local
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
    }
  }

  const { apuntes } = body || {};

  if (!apuntes) {
    return res.status(400).json({ error: 'Falta el campo "apuntes" en el body' });
  }

  const apiKey = process.env.OPENROUTER_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la clave OPENROUTER_KEY en .env.local' });
  }

  const systemPrompt = `Eres un tutor que aplica el Método Feynman para ayudar a un estudiante de 2º de Bachillerato a estudiar para la PAU.
Trabaja SIEMPRE a partir del texto de apuntes que te proporciona el usuario, no añadas información que no esté en ese texto.
Tu tarea:
1. Genera un ESQUEMA claro y jerárquico (con títulos, subtítulos y viñetas) que organice las ideas del texto original.
2. Simplifica los conceptos complejos usando lenguaje sencillo, como si se lo explicaras a alguien que no sabe nada del tema.
3. Si el texto original menciona algo de forma ambigua o incompleta, señálalo en vez de inventar el resto.
Formato de salida: Markdown, con encabezados (##, ###) y listas.`;

  try {
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: apuntes }
        ],
        temperature: 0.2
      })
    });

    if (!openrouterResponse.ok) {
      const errorBody = await openrouterResponse.text();
      return res.status(openrouterResponse.status).json({ error: 'Error de OpenRouter', detalle: errorBody });
    }

    const data = await openrouterResponse.json();
    const texto = data.choices?.[0]?.message?.content ?? '';

    return res.status(200).json({ resultado: texto });
  } catch (error) {
    return res.status(500).json({ error: 'Error al contactar con OpenRouter', detalle: error.message });
  }
}