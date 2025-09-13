import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary?: string;
  ingredients?: Ingredient[];
  instructions?: string[];
  totalCarbonScore?: number;
  carbonLevel?: "low" | "medium" | "high";
  suggestion?: {
    originalIngredient: string;
    suggestedIngredient: string;
    carbonSaving: number;
  };
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  carbonFootprint: number;
}

export interface SearchResponse {
  results: Recipe[];
  totalResults: number;
}

/**
 * Search for recipes using the Spoonacular API via Supabase Edge Function
 */
export async function searchRecipes(query: string): Promise<SearchResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('get-recipe-details', {
      body: { searchQuery: query }
    })

    if (error) throw error

    return {
      results: data.results || [],
      totalResults: data.totalResults || 0
    }
  } catch (error) {
    console.error('Recipe search error:', error)
    
    // Fallback to mock data if API fails
    return {
      results: [
        {
          id: 1,
          title: "Classic Beef Stew",
          image: "/api/placeholder/300/200",
          readyInMinutes: 120,
          servings: 6
        },
        {
          id: 2,
          title: "Vegetarian Pasta Primavera",
          image: "/api/placeholder/300/200",
          readyInMinutes: 30,
          servings: 4
        },
        {
          id: 3,
          title: "Chicken Tikka Masala",
          image: "/api/placeholder/300/200",
          readyInMinutes: 45,
          servings: 4
        },
        {
          id: 4,
          title: "Mushroom Risotto",
          image: "/api/placeholder/300/200",
          readyInMinutes: 40,
          servings: 4
        }
      ],
      totalResults: 4
    }
  }
}

/**
 * Get detailed recipe information with carbon scoring via Supabase Edge Function
 */
export async function getRecipeDetails(recipeId: number): Promise<Recipe> {
  try {
    const { data, error } = await supabase.functions.invoke('get-recipe-details', {
      body: { recipeId }
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Recipe details error:', error)
    
    // Fallback to mock data if API fails
    return {
      id: recipeId,
      title: "Classic Beef Stew",
      image: "/api/placeholder/600/400",
      readyInMinutes: 120,
      servings: 6,
      summary: "A hearty and comforting beef stew with tender vegetables and rich flavors. Perfect for cold days and family gatherings.",
      ingredients: [
        { id: 1, name: "Beef chuck roast", amount: 2, unit: "lbs", carbonFootprint: 18.2 },
        { id: 2, name: "Carrots", amount: 4, unit: "large", carbonFootprint: 0.4 },
        { id: 3, name: "Potatoes", amount: 3, unit: "large", carbonFootprint: 0.3 },
        { id: 4, name: "Onion", amount: 1, unit: "large", carbonFootprint: 0.2 },
        { id: 5, name: "Beef broth", amount: 4, unit: "cups", carbonFootprint: 2.1 },
        { id: 6, name: "Celery", amount: 2, unit: "stalks", carbonFootprint: 0.1 },
        { id: 7, name: "Tomato paste", amount: 2, unit: "tbsp", carbonFootprint: 0.3 },
        { id: 8, name: "Fresh thyme", amount: 2, unit: "sprigs", carbonFootprint: 0.05 }
      ],
      instructions: [
        "Cut the beef chuck roast into 2-inch cubes and season with salt and pepper.",
        "Heat oil in a large Dutch oven over medium-high heat. Brown the beef on all sides.",
        "Remove beef and set aside. Add onions to the pot and cook until softened.",
        "Add tomato paste and cook for 1 minute until fragrant.",
        "Return beef to pot and add broth, thyme, and bay leaves.",
        "Bring to a boil, then reduce heat and simmer covered for 1 hour.",
        "Add carrots, potatoes, and celery. Continue simmering for 45 minutes.",
        "Season with salt and pepper to taste before serving."
      ],
      totalCarbonScore: 21.65,
      carbonLevel: "high",
      suggestion: {
        originalIngredient: "Beef chuck roast",
        suggestedIngredient: "Mushrooms (portobello)",
        carbonSaving: 16.8
      }
    }
  }
}