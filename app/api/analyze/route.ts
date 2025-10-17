import { NextRequest, NextResponse } from "next/server";
import { PortfolioSchema } from "@/app/lib/types";
import { INSTRUMENTS } from "@/app/lib/instruments";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod schema
    const validation = PortfolioSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid portfolio data" },
        { status: 400 }
      );
    }

    const { allocations } = validation.data;

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      const mockAnalysis = `
## Análisis de Portafolio (Modo Demo)

⚠️ **Nota**: Para obtener análisis reales con IA, configura la variable de entorno ANTHROPIC_API_KEY.

### Configuración
Este portafolio contiene ${allocations.length} instrumento(s):
${allocations
  .map((a) => {
    const inst = INSTRUMENTS.find((i) => i.id === a.instrumentId);
    return `- **${inst?.name}** (${inst?.category}): ${a.percent}%`;
  })
  .join("\n")}

### Análisis Básico
Tu portafolio incluye una combinación de diferentes categorías de activos. Para un análisis detallado de riesgo, diversificación y recomendaciones personalizadas, configura tu clave API de Anthropic.

**Cómo configurar**: Crea un archivo \`.env.local\` en la raíz del proyecto con:
\`\`\`
ANTHROPIC_API_KEY=tu_clave_aqui
\`\`\`

Puedes obtener una clave API en: https://console.anthropic.com/
      `.trim();

      return NextResponse.json({ analysis: mockAnalysis });
    }

    // Build analysis prompt
    const instrumentDetails = allocations
      .map((a) => {
        const inst = INSTRUMENTS.find((i) => i.id === a.instrumentId);
        return `- ${inst?.name} (${inst?.category}): ${a.percent}%`;
      })
      .join("\n");

    const prompt = `Analiza el siguiente portafolio de inversión y proporciona un análisis detallado en español:

Instrumentos:
${instrumentDetails}

Por favor incluye:
1. **Perfil de Riesgo**: Evalúa si el portafolio es de bajo, medio o alto riesgo basándote en las categorías y concentración de los activos.
2. **Horizonte Temporal Sugerido**: Recomienda si este portafolio es más adecuado para corto plazo (< 1 año), mediano plazo (1-5 años) o largo plazo (> 5 años).
3. **Notas sobre Diversificación**: Comenta sobre qué tan diversificado está el portafolio y sugerencias de mejora si aplica.
4. **Descripción de Instrumentos**: Proporciona un párrafo breve para cada instrumento incluido, explicando su rol en el portafolio y consideraciones importantes.

Formato: Usa markdown con títulos (##) y listas. Sé conciso pero informativo.`;

    // Call Anthropic API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const analysis = message.content[0].type === "text" ? message.content[0].text : "Error generando análisis";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error in analyze API:", error);
    return NextResponse.json(
      { error: "Error processing portfolio analysis" },
      { status: 500 }
    );
  }
}
