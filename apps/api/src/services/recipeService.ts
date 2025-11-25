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

/**
 * Extract JSON-LD recipe schema from HTML if available
 * Many recipe sites use structured data that's easy to parse
 */
function extractJsonLdRecipe(html: string): any | null {
  try {
    // Find all JSON-LD script tags
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    let match
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonContent = match[1].trim()
        const data = JSON.parse(jsonContent)
        
        // Handle array of schemas
        const schemas = Array.isArray(data) ? data : [data]
        
        for (const schema of schemas) {
          // Check for Recipe type
          if (schema['@type'] === 'Recipe') {
            console.log('✅ Found JSON-LD Recipe schema!')
            return parseJsonLdRecipe(schema)
          }
          // Check for @graph array (common in Yoast SEO)
          if (schema['@graph']) {
            for (const item of schema['@graph']) {
              if (item['@type'] === 'Recipe') {
                console.log('✅ Found JSON-LD Recipe in @graph!')
                return parseJsonLdRecipe(item)
              }
            }
          }
        }
      } catch (e) {
        // Invalid JSON, try next match
        continue
      }
    }
    
    return null
  } catch (error) {
    console.log('⚠️ JSON-LD extraction failed:', error)
    return null
  }
}

/**
 * Parse JSON-LD Recipe schema into our format
 */
function parseJsonLdRecipe(schema: any): any {
  // Parse ingredients (can be string or array of strings/HowToSupply)
  let ingredients: string[] = []
  if (schema.recipeIngredient) {
    ingredients = Array.isArray(schema.recipeIngredient) 
      ? schema.recipeIngredient.map((i: any) => typeof i === 'string' ? i : i.name || String(i))
      : [schema.recipeIngredient]
  }
  
  // Parse instructions (can be string, array of strings, or HowToStep objects)
  let instructions: string[] = []
  if (schema.recipeInstructions) {
    if (typeof schema.recipeInstructions === 'string') {
      // Split by newlines or periods if it's a single string
      instructions = schema.recipeInstructions
        .split(/\n|(?<=[.!?])\s+/)
        .filter((s: string) => s.trim().length > 0)
    } else if (Array.isArray(schema.recipeInstructions)) {
      instructions = schema.recipeInstructions.map((step: any) => {
        if (typeof step === 'string') return step
        if (step.text) return step.text
        if (step.name) return step.name
        return String(step)
      })
    }
  }
  
  // Parse duration (ISO 8601 format like PT20M or PT1H30M)
  const parseDuration = (duration: string | undefined): number | null => {
    if (!duration) return null
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (!match) return null
    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    return hours * 60 + minutes
  }
  
  // Get image URL
  let imageUrl = null
  if (schema.image) {
    if (typeof schema.image === 'string') {
      imageUrl = schema.image
    } else if (Array.isArray(schema.image)) {
      imageUrl = schema.image[0]
    } else if (schema.image.url) {
      imageUrl = schema.image.url
    }
  }
  
  return {
    title: schema.name || null,
    description: schema.description || null,
    ingredients,
    instructions,
    prepTime: parseDuration(schema.prepTime),
    cookTime: parseDuration(schema.cookTime),
    totalTime: parseDuration(schema.totalTime),
    servings: schema.recipeYield ? parseInt(String(schema.recipeYield).match(/\d+/)?.[0] || '0', 10) || null : null,
    difficulty: null, // JSON-LD doesn't have standard difficulty
    imageUrl,
    author: schema.author?.name || (typeof schema.author === 'string' ? schema.author : null),
    tags: schema.keywords ? (typeof schema.keywords === 'string' ? schema.keywords.split(',').map((k: string) => k.trim()) : schema.keywords) : [],
    cuisine: schema.recipeCuisine || null,
    category: schema.recipeCategory || null
  }
}

/**
 * Clean HTML to reduce size while keeping recipe content
 */
function cleanHtml(html: string): string {
  // Remove script tags (except JSON-LD)
  let cleaned = html.replace(/<script(?![^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, '')
  
  // Remove style tags
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')
  
  // Remove common non-recipe sections
  cleaned = cleaned.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
  cleaned = cleaned.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
  cleaned = cleaned.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
  cleaned = cleaned.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
  
  // Remove ads and comments sections
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*comments[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*ad[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
  cleaned = cleaned.replace(/<div[^>]*id="[^"]*comments[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ')
  
  return cleaned
}

// Extract recipe using Claude AI
export async function extractRecipeFromUrl(url: string): Promise<any> {
  try {
    console.log('🔗 Fetching URL:', url)
    
    // 1. Fetch the webpage with a proper user agent
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    })
    
    if (!pageResponse.ok) {
      throw new Error(`Could not fetch URL: ${pageResponse.status} ${pageResponse.statusText}`)
    }
    
    const html = await pageResponse.text()
    console.log(`📄 Fetched ${html.length} characters of HTML`)
    
    // 2. Try to extract JSON-LD recipe schema first (fast and reliable)
    const jsonLdRecipe = extractJsonLdRecipe(html)
    if (jsonLdRecipe && jsonLdRecipe.title && jsonLdRecipe.ingredients?.length > 0) {
      console.log('✅ Using JSON-LD recipe data (fast path)')
      
      // Add source info
      try {
        const urlObj = new URL(url)
        jsonLdRecipe.source = urlObj.hostname.replace('www.', '')
        jsonLdRecipe.sourceUrl = url
      } catch {
        jsonLdRecipe.source = 'Unknown'
        jsonLdRecipe.sourceUrl = url
      }
      
      return jsonLdRecipe
    }
    
    console.log('⚠️ No JSON-LD found, using Claude AI extraction')
    
    // 3. Clean and truncate HTML for Claude
    const cleanedHtml = cleanHtml(html)
    const truncatedHtml = cleanedHtml.substring(0, 80000) // Increased limit after cleaning
    console.log(`🧹 Cleaned HTML: ${truncatedHtml.length} characters`)
    
    // 4. Extract recipe using Claude AI
    const prompt = `Extract the recipe from this webpage HTML.

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
- Extract ALL ingredients with their quantities
- Extract ALL instruction steps in order
- Parse cooking times correctly (convert to minutes)
- If info is missing, use null
- Ignore ads, comments, navigation, and sidebar content
- Focus on the main recipe content
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
    console.error('❌ Recipe extraction error:', error)
    throw new Error(`Failed to extract recipe: ${error.message}`)
  }
}
