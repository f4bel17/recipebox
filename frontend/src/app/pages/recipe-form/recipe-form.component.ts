import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="card">
      <h1>{{ isEditMode ? 'Recept szerkesztése' : 'Új recept' }}</h1>

      <form [formGroup]="recipeForm" (ngSubmit)="save()">
        <label>Név</label>
        <input type="text" formControlName="name">

        <label>Leírás</label>
        <textarea rows="3" formControlName="description"></textarea>

        <label>Kategória</label>
        <input type="text" formControlName="category">

        <label>Elkészítési idő (perc)</label>
        <input type="number" formControlName="prepTimeMinutes">

        <label>Hozzávalók (soronként egy)</label>
        <textarea rows="6" formControlName="ingredientsText"></textarea>

        <label>Elkészítési lépések (soronként egy)</label>
        <textarea rows="6" formControlName="stepsText"></textarea>

        <div class="button-row">
          <button class="primary" type="submit" [disabled]="recipeForm.invalid">Mentés</button>
          <a class="button-link secondary" routerLink="/recipes">Mégse</a>
        </div>
      </form>
    </div>
  `
})
export class RecipeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  recipeId: string | null = null;
  isEditMode = false;

  recipeForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    category: ['', [Validators.required]],
    prepTimeMinutes: [10, [Validators.required, Validators.min(1)]],
    ingredientsText: [''],
    stepsText: ['']
  });

  ngOnInit(): void {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.recipeId;

    if (this.recipeId) {
      this.recipeService.getRecipe(this.recipeId).subscribe(recipe => {
        this.recipeForm.patchValue({
          name: recipe.name,
          description: recipe.description,
          category: recipe.category,
          prepTimeMinutes: recipe.prepTimeMinutes,
          ingredientsText: recipe.ingredients.join('
'),
          stepsText: recipe.steps.join('
')
        });
      });
    }
  }

  save(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    const formValue = this.recipeForm.getRawValue();
    const payload: Recipe = {
      name: formValue.name ?? '',
      description: formValue.description ?? '',
      category: formValue.category ?? '',
      prepTimeMinutes: Number(formValue.prepTimeMinutes ?? 0),
      ingredients: (formValue.ingredientsText ?? '').split('
').map(x => x.trim()).filter(Boolean),
      steps: (formValue.stepsText ?? '').split('
').map(x => x.trim()).filter(Boolean)
    };

    if (this.recipeId) {
      this.recipeService.updateRecipe(this.recipeId, payload).subscribe(() => {
        this.router.navigate(['/recipes']);
      });
    } else {
      this.recipeService.createRecipe(payload).subscribe(() => {
        this.router.navigate(['/recipes']);
      });
    }
  }
}
