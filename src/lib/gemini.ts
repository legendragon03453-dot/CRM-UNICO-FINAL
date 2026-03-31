import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export interface AIAnalysis {
  score_potencial: number
  tags_ai: string[]
  ai_summary: string
}

export const analyzeLead = async (leadData: any): Promise<AIAnalysis> => {
  try {
    const prompt = `Você é um especialista em Social Selling para o UNICO Studio (Design Boutique). 
    Analise os dados deste lead e forneça uma classificação estratégica em formato JSON:
    
    Dados do Lead:
    - Nome: ${leadData.name}
    - Faturamento Estimado: R$ ${leadData.faturamento_estimado}
    - Instagram: ${leadData.instagram}
    
    CRITÉRIOS DE SCORE (0-100):
    - Faturamento > 10k: +40 pontos
    - Faturamento > 50k: +70 pontos
    - Tem Instagram: +15 pontos
    
    O seu output deve ser APENAS um JSON puro no seguinte formato (sem markdown):
    {
      "score_potencial": número de 0-100,
      "tags_ai": ["tag1", "tag2", "tag3"],
      "ai_summary": "resumo de 1 frase do potencial"
    }`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Remove potential markdown block if AI adds it
    const cleanJson = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleanJson)
  } catch (error) {
    console.error('Gemini Analysis Error:', error)
    return {
      score_potencial: 50,
      tags_ai: ["Erro na Análise"],
      ai_summary: "Não foi possível analisar o lead automaticamente no momento."
    }
  }
}
