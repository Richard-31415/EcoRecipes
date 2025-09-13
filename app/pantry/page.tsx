"use client";

import { useState, useEffect } from "react";
import { SmartAuthButton } from "@/components/smart-auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Plus, Trash2, ShoppingBasket, TrendingUp, ChefHat } from "lucide-react";
import Link from "next/link";
import { 
  getPantryItems, 
  addPantryItem, 
  removePantryItem,
  estimateCarbonFootprint,
  getPantryInsights,
  type PantryItem 
} from "@/lib/pantryStorage";
import { useRouter } from "next/navigation";

const commonUnits = ["pieces", "cups", "tbsp", "tsp", "lbs", "oz", "kg", "g", "ml", "l"];

export default function PantryPage() {
  const router = useRouter();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    amount: 1,
    unit: "pieces"
  });
  const [pantryInsights, setPantryInsights] = useState({
    totalItems: 0,
    totalCarbon: 0,
    carbonLevel: "low" as "low" | "medium" | "high",
    highCarbonItems: 0,
    lowCarbonItems: 0,
    topCarbonContributors: [] as PantryItem[]
  });
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPantryItems();
  }, []);

  const loadPantryItems = () => {
    const items = getPantryItems();
    setPantryItems(items);
    setPantryInsights(getPantryInsights());
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    
    const carbonFootprint = estimateCarbonFootprint(newItem.name, newItem.amount);
    
    addPantryItem({
      name: newItem.name,
      amount: newItem.amount,
      unit: newItem.unit,
      carbonFootprint
    });
    
    setNewItem({ name: "", amount: 1, unit: "pieces" });
    setIsAddingItem(false);
    loadPantryItems();
  };

  const handleRemoveItem = (id: string) => {
    removePantryItem(id);
    loadPantryItems();
  };

  const handleIngredientSelection = (ingredientId: string, checked: boolean) => {
    const newSelection = new Set(selectedIngredients);
    if (checked) {
      newSelection.add(ingredientId);
    } else {
      newSelection.delete(ingredientId);
    }
    setSelectedIngredients(newSelection);
  };

  const handleCreateRecipe = () => {
    if (selectedIngredients.size === 0) {
      alert("Please select some ingredients to create a recipe!");
      return;
    }
    
    const selectedItems = pantryItems.filter(item => selectedIngredients.has(item.id));
    const ingredients = selectedItems.map(item => item.name).join(",");
    router.push(`/search?ingredients=${encodeURIComponent(ingredients)}&pantry=true&recipe=create`);
  };

  const handleSelectAll = () => {
    if (selectedIngredients.size === pantryItems.length) {
      setSelectedIngredients(new Set());
    } else {
      setSelectedIngredients(new Set(pantryItems.map(item => item.id)));
    }
  };

  const getCarbonLevelColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
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
            <Link href="/search" className="hover:underline text-muted-foreground">Search Recipes</Link>
            <Link href="/dashboard" className="hover:underline text-muted-foreground">My Recipes</Link>
            <SmartAuthButton />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBasket className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold">My Pantry</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your ingredients and discover recipes based on what you have.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Your Ingredients</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={handleCreateRecipe}
                    disabled={selectedIngredients.size === 0}
                    className="flex items-center gap-2"
                  >
                    <ChefHat className="h-4 w-4" />
                    Create Recipe ({selectedIngredients.size})
                  </Button>
                  <Button
                    onClick={() => setIsAddingItem(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingItem && (
                  <div className="border rounded-lg p-4 mb-4 bg-muted/30">
                    <h3 className="font-semibold mb-3">Add New Ingredient</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="ingredient-name">Ingredient</Label>
                        <Input
                          id="ingredient-name"
                          placeholder="e.g., chicken breast"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={newItem.amount}
                          onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 1 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {commonUnits.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button onClick={handleAddItem} size="sm">Add to Pantry</Button>
                      <Button onClick={() => setIsAddingItem(false)} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {pantryItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBasket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Your pantry is empty.</p>
                    <p className="text-sm">Add some ingredients to get started!</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3 p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="select-all"
                          checked={selectedIngredients.size === pantryItems.length && pantryItems.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                        <Label htmlFor="select-all" className="text-sm font-medium">
                          Select all ingredients for recipe creation
                        </Label>
                      </div>
                      {selectedIngredients.size > 0 && (
                        <Badge variant="secondary">
                          {selectedIngredients.size} selected
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      {pantryItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Checkbox
                            id={`ingredient-${item.id}`}
                            checked={selectedIngredients.has(item.id)}
                            onCheckedChange={(checked) => 
                              handleIngredientSelection(item.id, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.amount} {item.unit} • {item.carbonFootprint.toFixed(2)} kg CO₂
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveItem(item.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Pantry Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{pantryInsights.totalItems}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
                
                <div className="text-center pt-2">
                  <div className="text-3xl font-bold text-green-600">
                    {pantryInsights.totalCarbon.toFixed(1)} kg
                  </div>
                  <div className="text-sm text-muted-foreground">Total CO₂ Footprint</div>
                  <Badge className={`mt-2 ${getCarbonLevelColor(pantryInsights.carbonLevel)}`}>
                    {pantryInsights.carbonLevel.toUpperCase()} IMPACT
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-center text-sm">
                  <div>
                    <div className="font-semibold text-red-600">{pantryInsights.highCarbonItems}</div>
                    <div className="text-muted-foreground">High Impact Items</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-600">{pantryInsights.lowCarbonItems}</div>
                    <div className="text-muted-foreground">Low Impact Items</div>
                  </div>
                </div>

                {pantryInsights.topCarbonContributors.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Top Carbon Contributors</h4>
                    <div className="space-y-2">
                      {pantryInsights.topCarbonContributors.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="truncate flex-1 pr-2">{item.name}</span>
                          <span className="text-muted-foreground">
                            {item.carbonFootprint.toFixed(1)} kg CO₂
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Eco Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {pantryInsights.carbonLevel === "high" ? (
                  <>
                    <p>🥩 Consider reducing high-impact proteins like beef and lamb</p>
                    <p>🌱 Try plant-based proteins: beans, lentils, tofu</p>
                    <p>🐟 Fish and chicken have lower footprints than red meat</p>
                    <p>🔄 Use ingredients efficiently to reduce food waste</p>
                  </>
                ) : pantryInsights.carbonLevel === "medium" ? (
                  <>
                    <p>✅ Good balance! Consider more low-impact ingredients</p>
                    <p>🥬 Add more vegetables to reduce overall carbon footprints</p>
                    <p>🔄 Plan cooking efficiently to reduce food waste</p>
                    <p>🌱 Local and seasonal ingredients reduce emissions</p>
                  </>
                ) : (
                  <>
                    <p>🌟 Great job! Your pantry has low carbon impact</p>
                    <p>♻️ Keep up the sustainable ingredient choices</p>
                    <p>🎯 Share eco-friendly recipes with friends!</p>
                    <p>🌱 Continue choosing local and seasonal ingredients</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}