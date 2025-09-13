// Server-side API route for secure recipe search
import { NextResponse } from 'next/server';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
  }

  if (!SPOONACULAR_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      console.error('Search API error:', response.status, response.statusText);
      
      // Check for API limit error
      if (response.status === 402) {
        return NextResponse.json(
          { error: 'Spoonacular API limit reached.' }, 
          { status: 402 }
        );
      }
      
      throw new Error(`Spoonacular API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      results: data.results || [],
      totalResults: data.totalResults || 0
    });

  } catch (error) {
    console.error('Recipe search error:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes' }, 
      { status: 500 }
    );
  }
}