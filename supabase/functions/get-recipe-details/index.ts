import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  carbonFootprint: number;
}

interface CarbonSuggestion {
  originalIngredient: string;
  suggestedIngredient: string;
  carbonSaving: number;
}

interface RecipeResponse {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  ingredients: Ingredient[];
  instructions: string[];
  totalCarbonScore: number;
  carbonLevel: "low" | "medium" | "high";
  suggestion?: CarbonSuggestion;
}

// Carbon footprint data (kg CO2 per kg of ingredient)
const CARBON_FOOTPRINT_DATA: Record<string, number> = {
  // Meat & Dairy (high carbon)
  'beef': 60.0,
  'lamb': 24.0,
  'pork': 7.6,
  'chicken': 6.1,
  'turkey': 10.9,
  'cheese': 13.5,
  'milk': 3.2,
  'butter': 23.8,
  'eggs': 4.2,
  
  // Fish & Seafood
  'salmon': 11.9,
  'tuna': 6.1,
  'shrimp': 18.0,
  'cod': 2.8,
  
  // Vegetables & Fruits (low carbon)
  'potatoes': 0.3,
  'carrots': 0.4,
  'onions': 0.3,
  'tomatoes': 2.1,
  'broccoli': 2.0,
  'spinach': 2.0,
  'mushrooms': 3.3,
  'apples': 0.4,
  'bananas': 0.7,
  
  // Grains & Legumes
  'rice': 2.7,
  'wheat': 1.4,
  'pasta': 1.1,
  'bread': 1.3,
  'lentils': 0.9,
  'beans': 2.0,
  'tofu': 3.0,
  
  // Oils & Others
  'olive oil': 6.3,
  'vegetable oil': 3.8,
  'coconut oil': 6.4,
  'sugar': 1.8,
  'flour': 1.4,
}

// Low-carbon alternatives to replace high-carbon ingredients
const LOW_CARBON_ALTERNATIVES: Record<string, { alternative: string; carbonSaving: number }> = {
  'beef': { alternative: 'mushrooms (portobello)', carbonSaving: 56.7 },
  'lamb': { alternative: 'lentils', carbonSaving: 23.1 },
  'pork': { alternative: 'tofu', carbonSaving: 4.6 },
  'chicken': { alternative: 'chickpeas', carbonSaving: 4.1 },
  'cheese': { alternative: 'nutritional yeast', carbonSaving: 12.5 },
  'butter': { alternative: 'avocado', carbonSaving: 22.8 },
  'shrimp': { alternative: 'mushrooms', carbonSaving: 14.7 },
  'salmon': { alternative: 'tofu', carbonSaving: 8.9 },
}

async function searchRecipes(query: string) {
  const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY')
  
  if (!SPOONACULAR_API_KEY) {
    throw new Error('SPOONACULAR_API_KEY environment variable is not set')
  }

  const response = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true&fillIngredients=true`,
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`)
  }

  return await response.json()
}

async function getRecipeDetails(recipeId: number) {
  const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY')
  
  if (!SPOONACULAR_API_KEY) {
    throw new Error('SPOONACULAR_API_KEY environment variable is not set')
  }

  const [recipeResponse, instructionsResponse] = await Promise.all([
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=false`),
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions?apiKey=${SPOONACULAR_API_KEY}`)
  ])

  if (!recipeResponse.ok || !instructionsResponse.ok) {
    throw new Error('Failed to fetch recipe details from Spoonacular')
  }

  const recipeData = await recipeResponse.json()
  const instructionsData = await instructionsResponse.json()

  return { recipeData, instructionsData }
}

function calculateCarbonFootprint(ingredients: any[]): { 
  processedIngredients: Ingredient[], 
  totalCarbon: number, 
  suggestion?: CarbonSuggestion 
} {
  let totalCarbon = 0
  let highestCarbonIngredient: { name: string; carbon: number } | null = null
  
  const processedIngredients: Ingredient[] = ingredients.map((ingredient) => {

    const name = ingredient.name?.toLowerCase() || ingredient.originalName?.toLowerCase() || 'unknown'
    const amount = ingredient.amount || 1
    const unit = ingredient.unit || 'piece'

    // Find carbon footprint
    let carbonPerUnit = 1.0 // default
    for (const [key, carbon] of Object.entries(CARBON_FOOTPRINT_DATA)) {
      if (name.includes(key)) {
        carbonPerUnit = carbon
        break
      }
    }

    // Estimate weight conversion (approx.)
    let estimatedWeight = amount
    if (unit.includes('cup')) estimatedWeight *= 0.25 // kg conversion
    else if (unit.includes('tablespoon') || unit.includes('tbsp')) estimatedWeight *= 0.015
    else if (unit.includes('teaspoon') || unit.includes('tsp')) estimatedWeight *= 0.005
    else if (unit.includes('oz')) estimatedWeight *= 0.028
    else if (unit.includes('lb')) estimatedWeight *= 0.45
    else if (unit.includes('g')) estimatedWeight *= 0.001
    else if (['piece', 'item', 'clove', 'slice'].some(u => unit.includes(u))) estimatedWeight *= 0.1

    const carbonFootprint = carbonPerUnit * estimatedWeight
    totalCarbon += carbonFootprint

    // Track highest carbon ingredient to suggest replacement
    if (!highestCarbonIngredient || carbonFootprint > highestCarbonIngredient.carbon) {
      highestCarbonIngredient = { name, carbon: carbonFootprint }
    }

    return {
      id: ingredient.id || Math.random(),
      name: ingredient.name || ingredient.originalName || 'Unknown ingredient',
      amount,
      unit,
      carbonFootprint: Math.round(carbonFootprint * 100) / 100
    }
  })

  // Generate suggestion for highest carbon ingredient
  let suggestion: CarbonSuggestion | undefined
  if (highestCarbonIngredient && highestCarbonIngredient.carbon > 5) {
    for (const [key, alt] of Object.entries(LOW_CARBON_ALTERNATIVES)) {
      if (highestCarbonIngredient.name.includes(key)) {
        suggestion = {
          originalIngredient: highestCarbonIngredient.name,
          suggestedIngredient: alt.alternative,
          carbonSaving: Math.round(alt.carbonSaving * 100) / 100
        }
        break
      }
    }
  }

  return {
    processedIngredients,
    totalCarbon: Math.round(totalCarbon * 100) / 100,
    suggestion
  }
}

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipeId, searchQuery } = await req.json()

    // Recipe search
    if (searchQuery) {
      const searchResults = await searchRecipes(searchQuery)
      return new Response(JSON.stringify(searchResults), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Recipe details with carbon calculation
    if (recipeId) {
      const { recipeData, instructionsData } = await getRecipeDetails(recipeId)
      
      // Calculate carbon footprint
      const { processedIngredients, totalCarbon, suggestion } = calculateCarbonFootprint(
        recipeData.extendedIngredients || []
      )

      // Carbon level
      let carbonLevel: "low" | "medium" | "high" = "low"
      if (totalCarbon > 15) carbonLevel = "high"
      else if (totalCarbon > 5) carbonLevel = "medium"

      // Format instructions
      const instructions = instructionsData[0]?.steps?.map((step: any) => step.step) || []

      const response: RecipeResponse = {
        id: recipeData.id,
        title: recipeData.title,
        image: recipeData.image,
        readyInMinutes: recipeData.readyInMinutes || 30,
        servings: recipeData.servings || 4,
        summary: recipeData.summary?.replace(/<[^>]*>/g, '') || '', // Strip HTML tags
        ingredients: processedIngredients,
        instructions,
        totalCarbonScore: totalCarbon,
        carbonLevel,
        suggestion
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Either recipeId or searchQuery is required')

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})