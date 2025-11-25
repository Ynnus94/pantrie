const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

interface Meal {
  mealName: string
  description?: string
  [key: string]: any
}

export async function searchFoodImage(mealName: string): Promise<string | null> {
  try {
    // Clean meal name for better search results
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

function cleanSearchQuery(mealName: string): string {
  // Remove common words and keep main ingredients/dish
  let query = mealName.toLowerCase()
  
  // Remove text in parentheses
  query = query.replace(/\([^)]*\)/g, '')
  
  // Common patterns to improve results
  const patterns: Record<string, string> = {
    'with rice': 'rice bowl',
    'with pasta': 'pasta',
    'with noodles': 'noodles',
    'stir fry': 'stir fry',
    'stir-fry': 'stir fry'
  }
  
  // Apply pattern replacements
  for (const [pattern, replacement] of Object.entries(patterns)) {
    if (query.includes(pattern)) {
      query = query.replace(pattern, replacement)
      break
    }
  }
  
  // Remove stop words
  const stopWords = ['with', 'and', 'the', 'in', 'on', 'over', 'served', 'a']
  let words = query.split(/[\s,]+/)
  words = words.filter(word => !stopWords.includes(word) && word.length > 2)
  
  // Take first 2-3 main words
  words = words.slice(0, 3)
  
  // Add "food" for better food photography results
  return `${words.join(' ')} food dish`
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

