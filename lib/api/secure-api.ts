// Secure server-side API calls (no exposed keys!)

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

export async function searchRecipes(query: string): Promise<{ results: Recipe[], totalResults: number }> {
  try {
    console.log('🔒 Secure search for:', query);
    
    const response = await fetch(`/api/recipes/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Found recipes:', data.results?.length || 0);

    return {
      results: data.results || [],
      totalResults: data.totalResults || 0
    };
  } catch (error) {
    console.error('❌ Recipe search error:', error);
    throw error;
  }
}

export async function getRecipeDetails(recipeId: number): Promise<Recipe> {
  try {
    console.log('🔒 Secure recipe details for:', recipeId);
    
    const response = await fetch(`/api/recipes/${recipeId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Recipe details loaded, carbon score:', data.totalCarbonScore);

    return data;
  } catch (error) {
    console.error('❌ Recipe details error:', error);
    throw error;
  }
}