"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AuthButton } from "@/components/auth-button-mock";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Leaf, Clock, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { searchRecipes as apiSearchRecipes, type Recipe } from "@/lib/api/secure-api";

// Recipe interface is imported from @/lib/api/recipes

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      searchRecipes();
    }
  }, [searchParams]);

  const searchRecipes = async () => {
    setLoading(true);
    setError("");
    
    const query = searchParams.get("q");
    if (!query) {
      setLoading(false);
      return;
    }
    
    try {
      // API through Supabase Edge Function
      const response = await apiSearchRecipes(query);
      setRecipes(response.results);
    } catch (error: any) {
      setError(error.message || "Failed to search recipes. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <Link href="/dashboard" className="hover:underline text-muted-foreground">
              My Recipes
            </Link>
            <AuthButton />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">
              Search
            </Button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Searching recipes...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Search results for &ldquo;{searchParams.get("q")}&rdquo;
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      {recipe.image ? (
                        <Image
                          src={recipe.image}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.readyInMinutes}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {recipe.servings} servings
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && searchParams.get("q") && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recipes found for &ldquo;{searchParams.get("q")}&rdquo;</p>
            <p className="text-sm text-muted-foreground mt-2">Try searching for something else!</p>
          </div>
        )}
      </div>
    </main>
  );
}