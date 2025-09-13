import { AuthButton } from "@/components/auth-button-mock";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SearchForm } from "@/components/search-form";
import { Search, Leaf } from "lucide-react";
import Link from "next/link";

export default function Home() {

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

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Discover Recipes with
              <span className="text-green-600 block">Carbon Awareness</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search thousands of recipes and see their environmental impact. 
              Make delicious, climate-conscious choices.
            </p>
          </div>

          <SearchForm />

          <div className="grid md:grid-cols-3 gap-6 text-center max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Search Recipes</h3>
              <p className="text-sm text-muted-foreground">
                Find delicious recipes from our extensive database
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Carbon Score</h3>
              <p className="text-sm text-muted-foreground">
                See the environmental impact of each recipe
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-lg font-bold text-green-600">💡</span>
              </div>
              <h3 className="font-semibold">Smart Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Get eco-friendly ingredient swap recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
