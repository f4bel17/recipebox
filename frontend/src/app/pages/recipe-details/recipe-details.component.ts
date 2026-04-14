import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" *ngIf="isLoading">
      <p>Betöltés...</p>
    </div>

    <div class="card" *ngIf="!isLoading && !recipe">
      <p>A recept nem található.</p>
      <div class="button-row">
        <a class="button-link secondary" href="/recipes">Vissza</a>
      </div>
    </div>

    <div class="card" *ngIf="!isLoading && recipe">
      <h1>{{ recipe.name }}</h1>
      <p>{{ recipe.description }}</p>
      <p><strong>Kategória:</strong> {{ recipe.category }}</p>
      <p><strong>Elkészítési idő:</strong> {{ recipe.prepTimeMinutes }} perc</p>

      <h3>Hozzávalók</h3>
      <ul>
        <li *ngFor="let ingredient of recipe.ingredients">{{ ingredient }}</li>
      </ul>

      <h3>Elkészítési lépések</h3>
      <ol>
        <li *ngFor="let step of recipe.steps">{{ step }}</li>
      </ol>

      <div class="button-row">
        <a class="button-link secondary" href="/recipes">Vissza</a>
        <a class="button-link primary" [href]="'/recipes/' + recipe.id + '/edit'">Szerkesztés</a>
      </div>
    </div>
  `
})
export class RecipeDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  recipe?: Recipe;
  isLoading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.isLoading = false;
      return;
    }

    const stored = localStorage.getItem('selectedRecipe');
    if (stored) {
      const parsed: Recipe = JSON.parse(stored);
      if (parsed.id === id) {
        this.recipe = parsed;
        this.isLoading = false;
        return;
      }
    }

    this.recipeService.getRecipe(id).subscribe({
      next: (recipe: Recipe) => {
        this.recipe = recipe;
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Hiba a recept betöltésekor:', err);
        this.isLoading = false;
      }
    });
  }
}