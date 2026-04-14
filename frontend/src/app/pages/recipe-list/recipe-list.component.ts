import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h1>Receptek</h1>
      <p class="list-meta">Oldal: {{ page }} | Összes recept: {{ totalCount }}</p>
      <div class="button-row">
        <a class="button-link primary" href="/recipes/new">Új recept</a>
      </div>
    </div>

    <div class="card" *ngIf="recipes.length === 0">
      <p>Még nincs recept.</p>
    </div>

    <div class="card" *ngFor="let recipe of recipes">
      <h3>{{ recipe.name }}</h3>
      <p>{{ recipe.description }}</p>
      <p class="list-meta">
        Kategória: {{ recipe.category }} | Idő: {{ recipe.prepTimeMinutes }} perc
      </p>

      <div class="button-row">
        <a class="button-link primary" [href]="'/recipes/' + recipe.id">Részletek</a>
        <a class="button-link secondary" [href]="'/recipes/' + recipe.id + '/edit'">Szerkesztés</a>
        <button class="warn" type="button" (click)="deleteRecipe(recipe.id)">Törlés</button>
      </div>
    </div>

    <div class="card button-row">
      <button class="secondary" type="button" (click)="previousPage()" [disabled]="page === 1">
        Előző
      </button>

      <button
        class="secondary"
        type="button"
        (click)="nextPage()"
        [disabled]="page * pageSize >= totalCount">
        Következő
      </button>
    </div>
  `
})
export class RecipeListComponent implements OnInit {
  private recipeService = inject(RecipeService);

  recipes: Recipe[] = [];
  page = 1;
  pageSize = 5;
  totalCount = 0;

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.recipeService.getRecipes(this.page, this.pageSize).subscribe({
      next: (result) => {
        this.recipes = result.items;
        this.page = result.page;
        this.pageSize = result.pageSize;
        this.totalCount = result.totalCount;
      },
      error: (err: unknown) => {
        console.error('Hiba a receptek betöltésekor:', err);
      }
    });
  }

  nextPage(): void {
    this.page++;
    this.loadRecipes();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadRecipes();
    }
  }

  deleteRecipe(id?: string): void {
    if (!id) return;

    if (!confirm('Biztosan törlöd a receptet?')) {
      return;
    }

    this.recipeService.deleteRecipe(id).subscribe({
      next: () => this.loadRecipes(),
      error: (err: unknown) => console.error('Hiba törléskor:', err)
    });
  }
}