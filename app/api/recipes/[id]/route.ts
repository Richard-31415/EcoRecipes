// Server-side API route for secure recipe details
import { NextResponse } from 'next/server';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Carbon footprint data (same as before)
const CARBON_FOOTPRINT_DATA: Record<string, number> = {
  'beef': 60.0, 'lamb': 24.0, 'pork': 7.6, 'chicken': 6.1, 'turkey': 10.9,
  'cheese': 13.5, 'milk': 3.2, 'butter': 23.8, 'eggs': 4.2,
  'salmon': 11.9, 'tuna': 6.1, 'shrimp': 18.0, 'cod': 2.8,
  'potatoes': 0.3, 'carrots': 0.4, 'onions': 0.3, 'tomatoes': 2.1,
  'broccoli': 2.0, 'spinach': 2.0, 'mushrooms': 3.3, 'apples': 0.4, 'bananas': 0.7,
  'rice': 2.7, 'wheat': 1.4, 'pasta': 1.1, 'bread': 1.3, 'lentils': 0.9, 'beans': 2.0, 'tofu': 3.0,
  'olive oil': 6.3, 'vegetable oil': 3.8, 'coconut oil': 6.4, 'sugar': 1.8, 'flour': 1.4,
};

function calculateCarbonFootprint(ingredients: any[]) {
  let totalCarbon = 0;
  let highestCarbonIngredient: { name: string; carbon: number } | null = null;
  
    const processedIngredients = ingredients.map((ingredient) => {
    const name = ingredient.name?.toLowerCase() || ingredient.originalName?.toLowerCase() || 'unknown';
    const amount = ingredient.amount || 1;
    const unit = ingredient.unit || 'piece';

    let carbonPerUnit = 1.0;
    for (const [key, carbon] of Object.entries(CARBON_FOOTPRINT_DATA)) {
      if (name.includes(key)) {
        carbonPerUnit = carbon;
        break;
      }
    }

    let estimatedWeight = amount;
    if (unit.includes('cup')) estimatedWeight *= 0.25;
    else if (unit.includes('tablespoon') || unit.includes('tbsp')) estimatedWeight *= 0.015;
    else if (unit.includes('teaspoon') || unit.includes('tsp')) estimatedWeight *= 0.005;
    else if (unit.includes('oz')) estimatedWeight *= 0.028;
    else if (unit.includes('lb')) estimatedWeight *= 0.45;
    else if (unit.includes('g')) estimatedWeight *= 0.001;
    else if (['piece', 'item', 'clove', 'slice'].some(u => unit.includes(u))) estimatedWeight *= 0.1;

    const carbonFootprint = carbonPerUnit * estimatedWeight;
    totalCarbon += carbonFootprint;

    if (!highestCarbonIngredient || carbonFootprint > highestCarbonIngredient.carbon) {
      highestCarbonIngredient = { name, carbon: carbonFootprint };
    }

    return {
      id: ingredient.id || Math.random(),
      name: ingredient.name || ingredient.originalName || 'Unknown ingredient',
      amount,
      unit,
      carbonFootprint: Math.round(carbonFootprint * 100) / 100
    };
  });

  let suggestion;
  if (highestCarbonIngredient?.carbon && highestCarbonIngredient.carbon > 5) {
    if (highestCarbonIngredient.name.includes('beef')) {
      suggestion = {
        originalIngredient: highestCarbonIngredient.name,
        suggestedIngredient: 'mushrooms (portobello)',
        carbonSaving: 56.7
      };
    }
  }

  return {
    processedIngredients,
    totalCarbon: Math.round(totalCarbon * 100) / 100,
    suggestion
  };
}



async function generateRecipeHighlightsWithPerplexity(
    description: string
): Promise<string[]> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) return [];

    const prompt = `
Given the following recipe description, generate up to three short highlights about the recipe. 
Some ideas include: high in protein, easy to prepare, X number of ingredients, vegan, gluten-free, etc.
Return the highlights as a JSON array of strings. Return in plain text. Do not use a code block.

Description:
${description}
`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "sonar-pro",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
            temperature: 0.5,
        }),
    });

    const data = await response.json();

    console.log("running")
    try {
        const text = data.choices?.[0]?.message?.content || "[]";
        console.log(text)
        const highlights = JSON.parse(text);
            console.log(highlights);
        if (Array.isArray(highlights)) return highlights;
        return [];
    } catch(e) {
        console.error(e)
        return [];
    }
}


export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: recipeId } = await params;

  console.log('Fetching recipe details for ID:', recipeId);
  console.log('API key present:', !!SPOONACULAR_API_KEY);

  if (!SPOONACULAR_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const [recipeResponse, instructionsResponse] = await Promise.all([
      fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=false`),
      fetch(`https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions?apiKey=${SPOONACULAR_API_KEY}`)
    ]);

    if (!recipeResponse.ok || !instructionsResponse.ok) {
      console.error('Recipe API error:', {
        recipeStatus: recipeResponse.status,
        recipeStatusText: recipeResponse.statusText,
        instructionsStatus: instructionsResponse.status,
        instructionsStatusText: instructionsResponse.statusText
      });
      
      // Check for specific API limit error
      if (recipeResponse.status === 402 || instructionsResponse.status === 402) {
        return NextResponse.json(
          { error: 'Spoonacular API limit reached.' }, 
          { status: 402 }
        );
      }
      
      throw new Error(`Failed to fetch recipe details: Recipe ${recipeResponse.status}, Instructions ${instructionsResponse.status}`);
    }

    const recipeData = await recipeResponse.json();
    const instructionsData = await instructionsResponse.json();

    const { processedIngredients, totalCarbon, suggestion } = calculateCarbonFootprint(
      recipeData.extendedIngredients || []
    );

    let carbonLevel: "low" | "medium" | "high" = "low";
    if (totalCarbon > 15) carbonLevel = "high";
    else if (totalCarbon > 5) carbonLevel = "medium";

    const instructions = instructionsData[0]?.steps?.map((step: any) => step.step) || [];

    const highlights = await generateRecipeHighlightsWithPerplexity(
         recipeData.summary?.replace(/<[^>]*>/g, "") || ""
     );

    return NextResponse.json({
      id: recipeData.id,
      title: recipeData.title,
      image: recipeData.image,
      readyInMinutes: recipeData.readyInMinutes || 30,
      servings: recipeData.servings || 4,
      summary: recipeData.summary?.replace(/<[^>]*>/g, '') || '',
      ingredients: processedIngredients,
      instructions,
      totalCarbonScore: totalCarbon,
      carbonLevel,
      suggestion,
      highlights
    });

  } catch (error) {
    console.error('Recipe details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe details' }, 
      { status: 500 }
    );
  }
}