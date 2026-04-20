import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function generateTags(title: string, description: string | null): Promise<string[]> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: `Generate 3-5 short lowercase tags for this link. Return only a JSON array of strings, nothing else.

Title: ${title}
Description: ${description ?? 'none'}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const text = raw.replace(/```(?:json)?\n?/g, '').trim()
  try {
    return JSON.parse(text)
  } catch {
    return []
  }
}
