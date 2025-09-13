# EcoRecipes 🌱

A Next.js recipe discovery app that helps you find delicious recipes while understanding their environmental impact through carbon footprint analysis.

## Features

- **Recipe Search**: Find recipes using the Spoonacular API
- **Carbon Footprint Analysis**: See the environmental impact of each recipe
- **Smart Suggestions**: Get eco-friendly ingredient alternatives
- **Save Recipes**: Storage for your favorite recipes
- **Responsive Design**: Works on desktop and mobile

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Richard-31415/EcoRecipes.git
cd EcoRecipes
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get API Keys

#### Spoonacular API (Required)
- https://spoonacular.com/food-api/console#Dashboard
#### Supabase (Already configured)
- Configuration under /supabase

#### Carbon Interface API (Optional)
- https://www.carboninterface.com/

### 4. Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_key

# Spoonacular API
SPOONACULAR_API_KEY=your_spoonacular_api_key_here

# Carbon Interface API
CARBON_INTERFACE_API_KEY=your_carbon_interface_api_key_here

# Email confirmation toggle (set to 'false' to skip email verification)
EMAIL_CONFIRMATION_REQUIRED=false
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Search Recipes**: Use the search bar on the homepage to find recipes
2. **View Details**: Click on any recipe to see ingredients, instructions, and carbon impact
3. **Save Recipes**: Click the heart icon to save recipes locally
4. **Dashboard**: Visit `/dashboard` to see your saved recipes and environmental statistics
5. **Smart Suggestions**: Look for eco-friendly ingredient alternatives on recipe pages

## License

This project is open source and available under the [MIT License](LICENSE).