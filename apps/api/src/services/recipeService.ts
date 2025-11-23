import Anthropic from '@anthropic-ai/sdk'

// Lazy-load Anthropic client to ensure env vars are loaded first
let anthropicClient: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found. Check your .env file.')
    }
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

// Extract recipe using Claude AI
export async function extractRecipeFromUrl(url: string): Promise<any> {
  try {
    // 1. Fetch the webpage
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!pageResponse.ok) {
      throw new Error(`Could not fetch URL: ${pageResponse.status} ${pageResponse.statusText}`)
    }
    
    const html = await pageResponse.text()
    
    // Limit HTML size to avoid token limits (keep first 50000 chars)
    const truncatedHtml = html.substring(0, 50000)
    
    // 2. Extract recipe using Claude AI
    const prompt = `Extract the recipe from this HTML page.

HTML:
${truncatedHtml}

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "title": "recipe name",
  "description": "brief description or null",
  "ingredients": ["ingredient 1 with quantity", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "prepTime": minutes as number or null,
  "cookTime": minutes as number or null,
  "totalTime": minutes as number or null,
  "servings": number or null,
  "difficulty": "easy" or "medium" or "hard" or null,
  "imageUrl": "image URL if available or null",
  "author": "author name or null",
  "tags": ["tag1", "tag2"]
}

Important:
- Extract ALL ingredients with quantities
- Extract ALL instruction steps in order
- Parse times correctly (convert to minutes)
- If info is missing, use null
- Ignore ads, comments, and navigation
- Return ONLY the JSON, no other text
`

    const anthropic = getAnthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude API')
    }

    let recipeText = content.text
    
    // Strip markdown code blocks if present
    recipeText = recipeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Extract JSON from response
    const jsonMatch = recipeText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not find JSON in Claude response')
    }
    
    const recipeData = JSON.parse(jsonMatch[0])
    
    // Validate required fields
    if (!recipeData.title) {
      throw new Error('Recipe title is required but was not found')
    }
    if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
      throw new Error('Recipe ingredients are required but were not found')
    }
    if (!recipeData.instructions || !Array.isArray(recipeData.instructions) || recipeData.instructions.length === 0) {
      throw new Error('Recipe instructions are required but were not found')
    }
    
    // Add source info
    try {
      const urlObj = new URL(url)
      recipeData.source = urlObj.hostname.replace('www.', '')
      recipeData.sourceUrl = url
    } catch {
      recipeData.source = 'Unknown'
      recipeData.sourceUrl = url
    }
    
    return recipeData
  } catch (error: any) {
    console.error('Recipe extraction error:', error)
    throw new Error(`Failed to extract recipe: ${error.message}`)
  }
}

