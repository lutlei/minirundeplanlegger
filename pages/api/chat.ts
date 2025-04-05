import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    return res.status(401).json({ 
      error: 'OpenAI API key is not configured. Please set a valid API key in your .env.local file.' 
    });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create system message with context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `Du er Jim, en hjelpsom og vennlig turneringsassistent som hjelper brukerne med å planlegge fotballturneringer. 
        Du er ekspert på områder som kampoppsett, turneringsregler, og planlegging. 
        Du kommuniserer på norsk og er høflig, tålmodig og pedagogisk i dine svar.
        Turneringen du hjelper med er en innendørs fotballturnering for barn og ungdom i aldersgruppene Mikro, Mini, og Lillegutt/jente. 
        Mikrokamper spilles på lørdag, Lillegutt/jente-kamper spilles på søndag, Mini-kamper kan spilles begge dager.
        Hvert lag skal spille minst 3 kamper. Kampene varer vanligvis 12-15 minutter.
        Baner er tilgjengelige fra 10:00 til 18:00 begge dager.
        
        Du skal svare på spørsmål om:
        - Hvordan sette opp en turnering
        - Råd om kampoppsett
        - Hva som er vanlig for fotballturneringer
        - Regler og retningslinjer
        - Praktiske tips
        
        Du skal IKKE:
        - Gi deg ut for å være et menneske
        - Love å utføre handlinger du ikke kan (som å sende e-poster, endre nettstedet, etc.)
        - Diskutere politiske, kontroversielle eller støtende emner
        
        Svar alltid på norsk.`
    };

    // Prepare messages for API call
    const messages: ChatMessage[] = [
      systemMessage,
      ...history.slice(-10), // Keep only last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || 
      'Beklager, jeg kunne ikke generere et svar akkurat nå.';

    return res.status(200).json({ content: reply });
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof OpenAI.APIError) {
      // Provide a more user-friendly message for API key errors
      if (error.code === 'invalid_api_key') {
        return res.status(401).json({ 
          error: 'OpenAI API key is invalid. Please check your API key in your .env.local file.' 
        });
      }
      
      return res.status(error.status || 500).json({ 
        error: `OpenAI API error: ${error.message}` 
      });
    }
    
    return res.status(500).json({ 
      error: 'An unexpected error occurred while processing your request'
    });
  }
} 