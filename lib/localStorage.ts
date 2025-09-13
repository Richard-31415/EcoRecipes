// Local storage utilities for saving recipes without authentication

export interface SavedRecipe {
  id: string;
  recipe_id: number;
  recipe_title: string;
  image_url: string;
  carbon_score: number;
  created_at: string;
  readyInMinutes?: number;
  servings?: number;
}

const SAVED_RECIPES_KEY = 'ecorecipes_saved';

export function getSavedRecipes(): SavedRecipe[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(SAVED_RECIPES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading saved recipes:', error);
    return [];
  }
}

export function saveRecipe(recipe: {
  recipe_id: number;
  recipe_title: string;
  image_url: string;
  carbon_score: number;
  readyInMinutes?: number;
  servings?: number;
}): SavedRecipe {
  const savedRecipes = getSavedRecipes();
  
  const newSavedRecipe: SavedRecipe = {
    id: `local_${Date.now()}`,
    recipe_id: recipe.recipe_id,
    recipe_title: recipe.recipe_title,
    image_url: recipe.image_url,
    carbon_score: recipe.carbon_score,
    created_at: new Date().toISOString(),
    readyInMinutes: recipe.readyInMinutes,
    servings: recipe.servings
  };
  
  // Check if already saved
  const existingIndex = savedRecipes.findIndex(r => r.recipe_id === recipe.recipe_id);
  
  if (existingIndex !== -1) {
    // Update existing
    savedRecipes[existingIndex] = newSavedRecipe;
  } else {
    // Add new
    savedRecipes.push(newSavedRecipe);
  }
  
  try {
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
  } catch (error) {
    console.error('Error saving recipe:', error);
  }
  
  return newSavedRecipe;
}

export function removeSavedRecipe(recipeId: number): void {
  const savedRecipes = getSavedRecipes();
  const filteredRecipes = savedRecipes.filter(r => r.recipe_id !== recipeId);
  
  try {
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(filteredRecipes));
  } catch (error) {
    console.error('Error removing saved recipe:', error);
  }
}

export function isRecipeSaved(recipeId: number): boolean {
  const savedRecipes = getSavedRecipes();
  return savedRecipes.some(r => r.recipe_id === recipeId);
}