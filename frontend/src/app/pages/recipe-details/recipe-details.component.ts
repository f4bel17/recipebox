import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card" *ngIf="recipe">
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
        <a class="button-link secondary" routerLink="/recipes">Vissza</a>
        <a class="button-link primary" [routerLink]="['/recipes', recipe.id, 'edit']">Szerkesztés</a>
      </div>
    </div>
  `
})
export class RecipeDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  recipe?: Recipe;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipeService.getById(id).subscribe((recipe: Recipe) => this.recipe = recipe);
    }
  }
}
