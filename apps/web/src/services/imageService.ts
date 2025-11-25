const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

interface Meal {
  mealName: string
  description?: string
  [key: string]: any
}

/**
 * Extract the key food from a meal name using priority tiers
 * TIER 1: Dish types (pasta, pizza, tacos) - ALWAYS prioritize
 * TIER 2: Proteins (salmon, chicken, beef) - Only if no dish type
 * NEVER: Ingredients (mushroom, spinach, garlic)
 */
function extractKeyFood(mealName: string): string {
  // Clean descriptors
  const cleaned = mealName
    .toLowerCase()
    .replace(/creamy\s*/gi, '')
    .replace(/crispy\s*/gi, '')
    .replace(/spicy\s*/gi, '')
    .replace(/quick\s*/gi, '')
    .replace(/easy\s*/gi, '')
    .replace(/simple\s*/gi, '')
    .replace(/homemade\s*/gi, '')
    .replace(/classic\s*/gi, '')
    .replace(/best\s*/gi, '')
    .replace(/ultimate\s*/gi, '')
    .replace(/perfect\s*/gi, '')
    .replace(/honey\s*/gi, '')
    .replace(/garlic\s*/gi, '')
    .replace(/lemon\s*/gi, '')
    .replace(/herb\s*/gi, '')
    .replace(/herbed\s*/gi, '')
    .replace(/glazed\s*/gi, '')
    .replace(/roasted\s*/gi, '')
    .replace(/grilled\s*/gi, '')
    .replace(/baked\s*/gi, '')
    .replace(/fried\s*/gi, '')
    .replace(/\s*with\s+.*/gi, '')
    .replace(/\s*in\s+.*/gi, '')
    .replace(/\s*and\s+.*/gi, '')
    .replace(/\s*on\s+.*/gi, '')
    .replace(/\s*over\s+.*/gi, '')
    .replace(/\([^)]*\)/g, '')
    .trim()

  console.log('🧹 Cleaned meal name:', cleaned)

  // TIER 1: Dish Types (HIGHEST PRIORITY - always check these first!)
  const dishTypes = [
    // Italian
    'pasta', 'spaghetti', 'linguine', 'fettuccine', 'penne', 'rigatoni', 'carbonara',
    'lasagna', 'ravioli', 'gnocchi', 'risotto', 'pizza', 'alfredo', 'primavera',
    // Mexican
    'tacos', 'taco', 'burrito', 'burritos', 'quesadillas', 'quesadilla', 
    'enchiladas', 'fajitas', 'nachos', 'tostadas', 'chilaquiles',
    // Asian
    'stir fry', 'stir-fry', 'stirfry', 'fried rice', 'pad thai', 'ramen', 'pho',
    'curry', 'curries', 'tikka masala', 'korma', 'vindaloo', 'biryani',
    'noodles', 'lo mein', 'chow mein', 'dumplings', 'gyoza',
    'sushi', 'teriyaki', 'bibimbap', 'bulgogi', 'katsu',
    // American/Western
    'burger', 'burgers', 'sandwich', 'sandwiches', 'wrap', 'wraps',
    'hot dog', 'wings', 'ribs', 'bbq', 'meatloaf', 'meatballs',
    // General dish types
    'bowl', 'bowls', 'grain bowl', 'buddha bowl', 'poke bowl', 'rice bowl',
    'salad', 'soup', 'stew', 'chili', 'casserole', 'pot pie',
    'omelet', 'omelette', 'frittata', 'quiche', 'shakshuka',
    'pancakes', 'waffles', 'french toast',
    // Mediterranean/Middle Eastern
    'gyros', 'shawarma', 'falafel', 'kebab', 'kabob', 'hummus',
    'paella', 'tapas', 'ceviche', 'moussaka',
    // Roasts & Bakes
    'roast', 'pie', 'wellington'
  ]

  // Check for dish types FIRST - this is the key fix!
  for (const dish of dishTypes) {
    if (cleaned.includes(dish)) {
      console.log('✅ TIER 1 - Dish type found:', dish)
      return dish
    }
  }

  // TIER 2: Proteins (only if NO dish type was found)
  const proteins = [
    // Seafood
    'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'trout', 'fish',
    'shrimp', 'prawns', 'lobster', 'crab', 'scallops', 'mussels', 'clams',
    // Poultry
    'chicken', 'turkey', 'duck',
    // Red meat
    'beef', 'steak', 'pork', 'lamb', 'veal',
    // Plant-based
    'tofu', 'tempeh', 'seitan'
  ]

  for (const protein of proteins) {
    if (cleaned.includes(protein)) {
      console.log('✅ TIER 2 - Protein found:', protein)
      return protein
    }
  }

  // TIER 3: Generic fallback - take last 1-2 words (usually the dish name)
  const words = cleaned.split(/\s+/).filter(w => w.length > 2)
  if (words.length >= 2) {
    const fallback = words.slice(-2).join(' ')
    console.log('⚠️ TIER 3 - Fallback to last words:', fallback)
    return fallback
  }
  
  if (words.length === 1) {
    console.log('⚠️ TIER 3 - Fallback to single word:', words[0])
    return words[0]
  }

  // Ultimate fallback
  console.log('⚠️ Using original name as fallback')
  return mealName.split(' ')[0]
}

export async function searchFoodImage(mealName: string): Promise<string | null> {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('❌ UNSPLASH_ACCESS_KEY not set')
      return null
    }
    
    const keyFood = extractKeyFood(mealName)
    const searchQuery = keyFood + ' food'
    console.log('🔍 Final search query:', searchQuery)
    
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
    
    const keyFood = extractKeyFood(mealName)
    const searchQuery = keyFood + ' food'
    console.log(`🔍 Final search query: "${searchQuery}" (page ${page})`)
    
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
