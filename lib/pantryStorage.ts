export interface PantryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  carbonFootprint: number;
  addedDate: string;
}

const PANTRY_STORAGE_KEY = "ecorecipes-pantry";

export const getPantryItems = (): PantryItem[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(PANTRY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addPantryItem = (item: Omit<PantryItem, "id" | "addedDate">): void => {
  if (typeof window === "undefined") return;
  
  const items = getPantryItems();
  const newItem: PantryItem = {
    ...item,
    id: Date.now().toString(),
    addedDate: new Date().toISOString(),
  };
  
  items.push(newItem);
  localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items));
};

export const removePantryItem = (id: string): void => {
  if (typeof window === "undefined") return;
  
  const items = getPantryItems();
  const updatedItems = items.filter(item => item.id !== id);
  localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(updatedItems));
};

export const updatePantryItem = (id: string, updates: Partial<PantryItem>): void => {
  if (typeof window === "undefined") return;
  
  const items = getPantryItems();
  const updatedItems = items.map(item =>
    item.id === id ? { ...item, ...updates } : item
  );
  localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(updatedItems));
};

export const calculatePantryCarbonFootprint = (): number => {
  const items = getPantryItems();
  return items.reduce((total, item) => total + item.carbonFootprint, 0);
};


export const getPantryInsights = () => {
  const items = getPantryItems();
  const totalCarbon = calculatePantryCarbonFootprint();
  
  // Categorize ingredients by carbon impact
  const highCarbonItems = items.filter(item => item.carbonFootprint > 10);
  const lowCarbonItems = items.filter(item => item.carbonFootprint <= 2);
  
  // Calculate carbon level for the overall pantry
  let carbonLevel: "low" | "medium" | "high";
  if (totalCarbon < 20) carbonLevel = "low";
  else if (totalCarbon < 60) carbonLevel = "medium";
  else carbonLevel = "high";
  
  return {
    totalItems: items.length,
    totalCarbon,
    carbonLevel,
    highCarbonItems: highCarbonItems.length,
    lowCarbonItems: lowCarbonItems.length,
    topCarbonContributors: items
      .sort((a, b) => b.carbonFootprint - a.carbonFootprint)
      .slice(0, 3)
  };
};

export const clearPantry = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PANTRY_STORAGE_KEY);
};
//hardcoded carbon data for common ingredients (TODO: replace with API data)
const ingredientCarbonData: Record<string, number> = {
  "beef": 27.0,
  "lamb": 24.0,
  "pork": 7.6,
  "chicken": 6.9,
  "turkey": 5.8,
  "fish": 5.4,
  "salmon": 6.0,
  "tuna": 4.9,
  "shrimp": 18.0,
  "eggs": 4.8,
  "milk": 3.2,
  "cheese": 13.5,
  "butter": 23.8,
  "yogurt": 2.2,
  "rice": 2.7,
  "wheat": 1.4,
  "bread": 1.6,
  "pasta": 1.1,
  "potatoes": 0.5,
  "tomatoes": 2.1,
  "onions": 0.5,
  "carrots": 0.4,
  "broccoli": 2.0,
  "spinach": 2.0,
  "lettuce": 1.0,
  "cucumber": 0.3,
  "bell peppers": 1.3,
  "mushrooms": 0.5,
  "garlic": 0.4,
  "beans": 0.4,
  "lentils": 0.9,
  "chickpeas": 0.4,
  "olive oil": 5.4,
  "coconut oil": 3.5,
  "sugar": 1.8,
  "honey": 2.9,
  "almonds": 5.2,
  "walnuts": 1.4,
  "cashews": 3.3,
  "peanuts": 2.3,
  "bananas": 0.7,
  "apples": 0.4,
  "oranges": 0.4,
  "avocado": 2.1,
  "strawberries": 1.4,
  "blueberries": 1.2,
  "grapes": 1.1,
  "corn": 1.1,
  "quinoa": 1.9,
  "oats": 1.6,
  "flour": 1.4,
  "vanilla": 4.0,
  "cinnamon": 2.5,
  "black pepper": 3.0,
  "salt": 0.1,
  "ginger": 1.2,
  "basil": 2.1,
  "oregano": 2.8,
  "thyme": 3.2,
  "rosemary": 2.9
};

export const estimateCarbonFootprint = (ingredientName: string, amount: number = 1): number => {
  const normalizedName = ingredientName.toLowerCase().trim();
  
  for (const [key, carbonValue] of Object.entries(ingredientCarbonData)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return carbonValue * amount;
    }
  }
  
  return 1.5 * amount;
};