import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Recipe } from '../../models/recipe.model';

interface PagedRecipesResponse {
  items: Recipe[];
  page: number;
  pageSize: number;
  totalCount: number;
}

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
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
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  recipes: Recipe[] = [];
  page = 1;
  pageSize = 5;
  totalCount = 0;

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    const params = new HttpParams()
      .set('page', this.page)
      .set('pageSize', this.pageSize);

    this.http
      .get<PagedRecipesResponse>('http://localhost:8080/api/recipes', { params })
      .subscribe({
        next: (result) => {
          this.recipes = result.items ?? [];
          this.page = result.page ?? 1;
          this.pageSize = result.pageSize ?? 5;
          this.totalCount = result.totalCount ?? 0;
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          console.error('Hiba a receptek betöltésekor:', err);
          this.recipes = [];
          this.totalCount = 0;
          this.cdr.detectChanges();
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

    this.http
      .delete(`http://localhost:8080/api/recipes/${id}`)
      .subscribe({
        next: () => this.loadRecipes(),
        error: (err: unknown) => {
          console.error('Hiba törléskor:', err);
        }
      });
  }
}