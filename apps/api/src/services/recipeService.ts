import Anthropic from '@anthropic-ai/sdk'
import * as cheerio from 'cheerio'

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
 */
function extractJsonLdRecipe(html: string): any | null {
  try {
    const $ = cheerio.load(html)
    const jsonLdScripts = $('script[type="application/ld+json"]')
    
    let recipe: any = null
    jsonLdScripts.each((_, el) => {
      if (recipe) return // Already found
      
      try {
        const content = $(el).html()
        if (!content) return
        
        const data = JSON.parse(content)
        const schemas = Array.isArray(data) ? data : [data]
        
        for (const schema of schemas) {
          if (schema['@type'] === 'Recipe') {
            console.log('✅ Found JSON-LD Recipe schema!')
            recipe = parseJsonLdRecipe(schema)
            return
          }
          if (schema['@graph']) {
            for (const item of schema['@graph']) {
              if (item['@type'] === 'Recipe') {
                console.log('✅ Found JSON-LD Recipe in @graph!')
                recipe = parseJsonLdRecipe(item)
                return
              }
            }
          }
        }
      } catch (e) {
        // Invalid JSON, try next
      }
    })
    
    return recipe
  } catch (error) {
    console.log('⚠️ JSON-LD extraction failed:', error)
    return null
  }
}

/**
 * Parse JSON-LD Recipe schema into our format
 */
function parseJsonLdRecipe(schema: any): any {
  let ingredients: string[] = []
  if (schema.recipeIngredient) {
    ingredients = Array.isArray(schema.recipeIngredient) 
      ? schema.recipeIngredient.map((i: any) => typeof i === 'string' ? i : i.name || String(i))
      : [schema.recipeIngredient]
  }
  
  let instructions: string[] = []
  if (schema.recipeInstructions) {
    if (typeof schema.recipeInstructions === 'string') {
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
  
  const parseDuration = (duration: string | undefined): number | null => {
    if (!duration) return null
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (!match) return null
    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    return hours * 60 + minutes
  }
  
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
    difficulty: null,
    imageUrl,
    author: schema.author?.name || (typeof schema.author === 'string' ? schema.author : null),
    tags: schema.keywords ? (typeof schema.keywords === 'string' ? schema.keywords.split(',').map((k: string) => k.trim()) : schema.keywords) : [],
    cuisine: schema.recipeCuisine || null,
    category: schema.recipeCategory || null
  }
}

/**
 * Extract recipe from HTML using Cheerio (fallback for Claude)
 */
function extractRecipeFromHtml(html: string): { cleanedHtml: string; hints: any } {
  const $ = cheerio.load(html)
  
  // Remove non-content elements
  $('script:not([type="application/ld+json"])').remove()
  $('style').remove()
  $('nav').remove()
  $('footer').remove()
  $('header').remove()
  $('aside').remove()
  $('.comments, #comments, .comment-section').remove()
  $('.sidebar, #sidebar').remove()
  $('.ad, .advertisement, .ads').remove()
  $('iframe').remove()
  
  // Try to find recipe container
  const recipeSelectors = [
    '.wprm-recipe-container',
    '.recipe-card',
    '.tasty-recipes',
    '[itemtype*="Recipe"]',
    '.recipe',
    'article'
  ]
  
  let recipeHtml = ''
  for (const selector of recipeSelectors) {
    const el = $(selector).first()
    if (el.length && el.text().length > 500) {
      recipeHtml = el.html() || ''
      console.log(`📋 Found recipe in: ${selector}`)
      break
    }
  }
  
  // If no recipe container, get body text
  if (!recipeHtml) {
    recipeHtml = $('body').html() || html
  }
  
  // Extract any hints we can find
  const hints: any = {}
  
  // Try to find title
  const titleSelectors = ['.wprm-recipe-name', '.recipe-title', 'h1', 'h2.recipe-name']
  for (const sel of titleSelectors) {
    const title = $(sel).first().text().trim()
    if (title && title.length > 3 && title.length < 200) {
      hints.title = title
      break
    }
  }
  
  // Try to find image
  const imgSelectors = ['.wprm-recipe-image img', '.recipe-image img', 'article img', '.post-thumbnail img']
  for (const sel of imgSelectors) {
    const img = $(sel).first()
    const src = img.attr('src') || img.attr('data-src')
    if (src && src.startsWith('http')) {
      hints.imageUrl = src
      break
    }
  }
  
  return {
    cleanedHtml: recipeHtml.substring(0, 60000),
    hints
  }
}

/**
 * Attempt to fetch URL with multiple strategies
 */
async function fetchWithRetry(url: string): Promise<string> {
  const strategies = [
    // Strategy 1: Full browser headers
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      }
    },
    // Strategy 2: Googlebot (many sites allow this)
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    },
    // Strategy 3: Simple mobile
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html',
        'Accept-Language': 'en-US'
      }
    }
  ]
  
  let lastError: Error | null = null
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`📡 Trying fetch strategy ${i + 1}...`)
      
      const response = await fetch(url, {
        ...strategies[i],
        redirect: 'follow'
      })
      
      if (response.ok) {
        const html = await response.text()
        console.log(`✅ Strategy ${i + 1} succeeded! Got ${html.length} chars`)
        return html
      }
      
      console.log(`⚠️ Strategy ${i + 1} failed: ${response.status}`)
      lastError = new Error(`HTTP ${response.status}`)
      
    } catch (error: any) {
      console.log(`⚠️ Strategy ${i + 1} error:`, error.message)
      lastError = error
    }
  }
  
  throw new Error(`All fetch strategies failed. Last error: ${lastError?.message || 'Unknown'}. The website may be blocking automated requests.`)
}

// Extract recipe using Claude AI
export async function extractRecipeFromUrl(url: string): Promise<any> {
  try {
    console.log('🔗 Fetching URL:', url)
    
    // 1. Fetch the webpage with retry strategies
    const html = await fetchWithRetry(url)
    console.log(`📄 Fetched ${html.length} characters of HTML`)
    
    // 2. Try to extract JSON-LD recipe schema first (fast and reliable)
    const jsonLdRecipe = extractJsonLdRecipe(html)
    if (jsonLdRecipe && jsonLdRecipe.title && jsonLdRecipe.ingredients?.length > 0) {
      console.log('✅ Using JSON-LD recipe data (fast path)')
      
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
    
    // 3. Clean HTML and extract hints using Cheerio
    const { cleanedHtml, hints } = extractRecipeFromHtml(html)
    console.log(`🧹 Cleaned HTML: ${cleanedHtml.length} characters`)
    if (hints.title) console.log(`💡 Hint - Title: ${hints.title}`)
    
    // 4. Extract recipe using Claude AI
    const prompt = `Extract the recipe from this webpage HTML.

${hints.title ? `The recipe title appears to be: "${hints.title}"` : ''}

HTML:
${cleanedHtml}

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
  "imageUrl": "${hints.imageUrl || 'image URL if available or null'}",
  "author": "author name or null",
  "tags": ["tag1", "tag2"]
}

Important:
- Extract ALL ingredients with their quantities
- Extract ALL instruction steps in order
- Parse cooking times correctly (convert to minutes)
- If info is missing, use null
- Focus on the main recipe content
- Return ONLY the JSON, no other text`

    const anthropic = getAnthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude API')
    }

    let recipeText = content.text
    recipeText = recipeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
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
