"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SmartAuthButton } from "@/components/smart-auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Clock, Users, Heart, ArrowLeft, Lightbulb } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { saveRecipe, removeSavedRecipe, isRecipeSaved } from "@/lib/localStorage";
import { getRecipeDetails } from "@/lib/api/secure-api";

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  carbonFootprint: number;
}

interface Recipe {
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
  suggestion?: {
    originalIngredient: string;
    suggestedIngredient: string;
    carbonSaving: number;
  };
}

export default function RecipePage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const recipeId = params.id;
    if (recipeId) {
      fetchRecipe(recipeId as string);
      // Check if recipe is already saved
      setIsSaved(isRecipeSaved(parseInt(recipeId as string)));
    }
  }, [params.id]);

  const fetchRecipe = async (id: string) => {
    setLoading(true);
    setError("");

    try {
      // Call the real API through Supabase Edge Function
      const recipeData = await getRecipeDetails(parseInt(id));
      setRecipe(recipeData);
    } catch {
      setError("Failed to load recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    
    if (isSaved) {
      // Remove from localStorage
      removeSavedRecipe(recipe.id);
      setIsSaved(false);
    } else {
      // Save to localStorage
      saveRecipe({
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        image_url: recipe.image,
        carbon_score: recipe.totalCarbonScore,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings
      });
      setIsSaved(true);
      console.log("Recipe saved locally! Sign up to sync across devices.");
    }
  };

  const getCarbonBadgeColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col">
        <nav className="w-full border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-6xl mx-auto flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                EcoRecipes
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pantry" className="hover:underline text-muted-foreground">Pantry</Link>
              <Link href="/dashboard" className="hover:underline text-muted-foreground">My Recipes</Link>
              <SmartAuthButton />
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen flex flex-col">
        <nav className="w-full border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-6xl mx-auto flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                EcoRecipes
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pantry" className="hover:underline text-muted-foreground">Pantry</Link>
              <Link href="/dashboard" className="hover:underline text-muted-foreground">My Recipes</Link>
              <SmartAuthButton />
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error || "Recipe not found"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              EcoRecipes
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pantry" className="hover:underline text-muted-foreground">Pantry</Link>
            <Link href="/dashboard" className="hover:underline">My Recipes</Link>
            <SmartAuthButton />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <Link href="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                {recipe.image ? (
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image Available</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.readyInMinutes} minutes
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings} servings
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSaveRecipe}
                  variant={isSaved ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save Recipe"}
                </Button>
              </div>

              <p className="text-muted-foreground">{recipe.summary}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Carbon Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{recipe.totalCarbonScore} kg</div>
                  <div className="text-sm text-muted-foreground">CO₂ equivalent</div>
                  <Badge className={`mt-2 ${getCarbonBadgeColor(recipe.carbonLevel)}`}>
                    {recipe.carbonLevel.toUpperCase()} IMPACT
                  </Badge>
                </div>

                {recipe.suggestion && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                          Smart Suggestion
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                          Replace <strong>{recipe.suggestion.originalIngredient}</strong> with{" "}
                          <strong>{recipe.suggestion.suggestedIngredient}</strong> to save{" "}
                          <strong>{recipe.suggestion.carbonSaving} kg CO₂</strong>!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{ingredient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ingredient.amount} {ingredient.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {ingredient.carbonFootprint} kg CO₂
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}