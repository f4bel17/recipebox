export interface Recipe {
  id?: string;
  name: string;
  description: string;
  category: string;
  prepTimeMinutes: number;
  ingredients: string[];
  steps: string[];
  createdAt?: string;
}