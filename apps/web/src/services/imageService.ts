const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

interface Meal {
  mealName: string
  description?: string
  [key: string]: any
}

// Priority food keywords - these should be extracted first
const FOOD_KEYWORDS = [
  // Dishes
  'pizza', 'pasta', 'lasagna', 'risotto', 'gnocchi', 'ravioli',
  'tacos', 'burrito', 'burritos', 'quesadilla', 'quesadillas', 'enchiladas', 'nachos', 'fajitas',
  'burger', 'burgers', 'sandwich', 'sandwiches', 'wrap', 'wraps',
  'salad', 'soup', 'stew', 'chili', 'casserole',
  'curry', 'curries', 'tikka masala', 'korma', 'vindaloo',
  'stir fry', 'stir-fry', 'fried rice', 'lo mein', 'chow mein', 'pad thai',
  'sushi', 'ramen', 'pho', 'bibimbap', 'bulgogi', 'teriyaki',
  'gyros', 'shawarma', 'falafel', 'hummus',
  'paella', 'tapas', 'ceviche',
  // Proteins
  'chicken', 'beef', 'steak', 'pork', 'lamb', 'turkey',
  'salmon', 'fish', 'shrimp', 'prawns', 'lobster', 'crab', 'scallops', 'tuna',
  'tofu', 'tempeh',
  // Bowl types
  'bowl', 'bowls', 'grain bowl', 'buddha bowl', 'poke bowl',
  // Breakfast
  'pancakes', 'waffles', 'omelette', 'frittata',
  // Baked
  'pie', 'quiche', 'roast', 'meatballs', 'meatloaf'
]

/**
 * Clean and extract the key food item from a meal name
 * "Quick Beef and Bean Quesadillas" → "quesadillas"
 */
function cleanSearchQuery(mealName: string): string {
  // Lowercase for matching
  let cleaned = mealName.toLowerCase()
  
  // Remove common modifiers
  cleaned = cleaned
    .replace(/quick\s*/gi, '')
    .replace(/easy\s*/gi, '')
    .replace(/simple\s*/gi, '')
    .replace(/homemade\s*/gi, '')
    .replace(/classic\s*/gi, '')
    .replace(/best\s*/gi, '')
    .replace(/ultimate\s*/gi, '')
    .replace(/perfect\s*/gi, '')
    .replace(/creamy\s*/gi, '')
    .replace(/crispy\s*/gi, '')
    .replace(/spicy\s*/gi, '')
    .replace(/honey\s*/gi, '')
    .replace(/garlic\s*/gi, '')
    .replace(/lemon\s*/gi, '')
  
  // Remove text after these words (usually sides/toppings)
  cleaned = cleaned
    .replace(/\s+with\s+.*/gi, '')
    .replace(/\s+and\s+.*/gi, '')
    .replace(/\s+in\s+.*/gi, '')
    .replace(/\s+on\s+.*/gi, '')
    .replace(/\s+over\s+.*/gi, '')
    .replace(/\s+served\s+.*/gi, '')
  
  // Remove text in parentheses
  cleaned = cleaned.replace(/\([^)]*\)/g, '')
  
  // Trim
  cleaned = cleaned.trim()
  
  // Find if meal name contains a known food keyword
  for (const keyword of FOOD_KEYWORDS) {
    if (cleaned.includes(keyword)) {
      console.log(`🎯 Found keyword: "${keyword}" in "${mealName}"`)
      return keyword + ' food'
    }
  }
  
  // Fallback: take the last 1-2 meaningful words (usually the dish name)
  const words = cleaned.split(/\s+/).filter(w => w.length > 2)
  if (words.length >= 2) {
    const result = words.slice(-2).join(' ')
    console.log(`📝 Using last words: "${result}" from "${mealName}"`)
    return result + ' food dish'
  }
  
  if (words.length === 1) {
    console.log(`📝 Using single word: "${words[0]}" from "${mealName}"`)
    return words[0] + ' food'
  }
  
  // Ultimate fallback
  return mealName.split(' ')[0] + ' food'
}

export async function searchFoodImage(mealName: string): Promise<string | null> {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('❌ UNSPLASH_ACCESS_KEY not set')
      return null
    }
    
    const searchQuery = cleanSearchQuery(mealName)
    console.log(`🔍 Searching Unsplash for: "${searchQuery}"`)
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular
      console.log(`✅ Found image for "${mealName}"`)
      return imageUrl
    }

    console.log(`⚠️ No image found for "${mealName}"`)
    return null
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error)
    return null
  }
}

// Batch fetch images for multiple meals
export async function fetchImagesForMeals(meals: Meal[]): Promise<Meal[]> {
  console.log(`🖼️ Fetching images for ${meals.length} meals...`)
  
  const imagePromises = meals.map(meal => searchFoodImage(meal.mealName))
  const images = await Promise.all(imagePromises)
  
  const mealsWithImages = meals.map((meal, index) => ({
    ...meal,
    imageUrl: images[index]
  }))
  
  const successCount = images.filter(img => img !== null).length
  console.log(`✅ Successfully fetched ${successCount}/${meals.length} images`)
  
  return mealsWithImages
}

// Search for multiple images (for image refresh modal)
export async function searchMultipleFoodImages(mealName: string, page: number = 1): Promise<string[]> {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('❌ UNSPLASH_ACCESS_KEY not set')
      return []
    }
    
    const searchQuery = cleanSearchQuery(mealName)
    console.log(`🔍 Searching Unsplash for: "${searchQuery}" (page ${page})`)
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=6&page=${page}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const imageUrls = data.results.map((r: any) => r.urls.regular)
      console.log(`✅ Found ${imageUrls.length} images`)
      return imageUrls
    }

    console.log(`⚠️ No images found for "${mealName}"`)
    return []
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error)
    return []
  }
}
