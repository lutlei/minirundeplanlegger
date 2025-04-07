import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Create a fake threadId that persists
  const threadId = 'mock-thread-123456';
  
  // Demo response that doesn't require OpenAI
  const mockResponse = "Dette er en demo-versjon av assistenten. I en fullversjon ville dette brukt OpenAI API for å generere svar. Du sendte: " + message;
  
  // Add some delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return res.status(200).json({
    content: mockResponse,
    threadId: threadId
  });
} 