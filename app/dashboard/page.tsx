"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SmartAuthButton } from "@/components/smart-auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Clock, Users, Trash2, Search, User, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getSavedRecipes, removeSavedRecipe, type SavedRecipe } from "@/lib/localStorage";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          // User is logged in - show authenticated dashboard
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchSavedRecipes();
    }
  }, [authLoading]);

  const fetchSavedRecipes = async () => {
    setLoading(true);
    
    try {
      // Get recipes from localStorage for guest users
      const localRecipes = getSavedRecipes();
      
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      setSavedRecipes(localRecipes);
    } catch (error) {
      console.error("Failed to fetch saved recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
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
              <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </main>
    );
  }

  const handleRemoveRecipe = async (savedRecipeId: string) => {
    // Find the recipe and remove from localStorage
    const recipe = savedRecipes.find(r => r.id === savedRecipeId);
    if (recipe) {
      removeSavedRecipe(recipe.recipe_id);
      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== savedRecipeId));
    }
  };

  const getCarbonBadgeColor = (score: number) => {
    if (score < 5) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score < 15) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getCarbonLevel = (score: number) => {
    if (score < 5) return "LOW";
    if (score < 15) return "MEDIUM";
    return "HIGH";
  };


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
            <Link href="/search" className="hover:underline text-muted-foreground">
              Search Recipes
            </Link>
            <Link href="/dashboard" className="hover:underline font-semibold">
              My Recipes
            </Link>
            <SmartAuthButton />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <div className="mb-8">
          {user ? (
            // Authenticated user header
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Welcome back!</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Your personal collection of favorite recipes and their environmental impact
              </p>
            </>
          ) : (
            // Guest user header
            <>
              <h1 className="text-3xl font-bold mb-2">My Saved Recipes</h1>
              <p className="text-muted-foreground">
                Your local collection of favorite recipes (saved in browser)
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  💡 <Link href="/auth/signup" className="underline font-semibold">Sign up</Link> to sync your recipes across devices and never lose your favorites!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Environmental Impact Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {savedRecipes.length}
              </div>
              <div className="text-sm text-muted-foreground">Saved Recipes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {savedRecipes.reduce((total, recipe) => total + recipe.carbon_score, 0).toFixed(1)} kg
              </div>
              <div className="text-sm text-muted-foreground">Total CO₂ Impact</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(savedRecipes.reduce((total, recipe) => total + recipe.carbon_score, 0) / savedRecipes.length || 0).toFixed(1)} kg
              </div>
              <div className="text-sm text-muted-foreground">Average per Recipe</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your saved recipes...</p>
          </div>
        ) : savedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No saved recipes yet</h3>
            <p className="text-muted-foreground mb-2">
              Start exploring recipes and save your favorites!
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Note: Recipes are saved locally in your browser. Sign up to sync across devices.
            </p>
            <Link href="/search">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search Recipes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecipes.map((recipe) => (
              <Card key={recipe.id} className="group hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  {recipe.image_url ? (
                    <Image
                      src={recipe.image_url}
                      alt={recipe.recipe_title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <Button
                    onClick={() => handleRemoveRecipe(recipe.id)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <Link href={`/recipe/${recipe.recipe_id}`}>
                    <h3 className="font-semibold mb-2 line-clamp-2 hover:text-green-600 transition-colors cursor-pointer">
                      {recipe.recipe_title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getCarbonBadgeColor(recipe.carbon_score)}>
                      {getCarbonLevel(recipe.carbon_score)} • {recipe.carbon_score} kg CO₂
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    {recipe.readyInMinutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.readyInMinutes}m
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.servings} servings
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Saved {new Date(recipe.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}