import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <h1>{{ isEditMode ? 'Recept szerkesztése' : 'Új recept' }}</h1>

      <div *ngIf="isLoading">
        <p>Betöltés...</p>
      </div>

      <form [formGroup]="recipeForm" (ngSubmit)="save()" *ngIf="!isLoading">
        <label>Név</label>
        <input type="text" formControlName="name" />

        <label>Leírás</label>
        <textarea rows="3" formControlName="description"></textarea>

        <label>Kategória</label>
        <input type="text" formControlName="category" />

        <label>Elkészítési idő (perc)</label>
        <input type="number" formControlName="prepTimeMinutes" />

        <label>Hozzávalók (soronként egy)</label>
        <textarea rows="6" formControlName="ingredientsText"></textarea>

        <label>Elkészítési lépések (soronként egy)</label>
        <textarea rows="6" formControlName="stepsText"></textarea>

        <div class="button-row">
          <button class="primary" type="submit" [disabled]="recipeForm.invalid">Mentés</button>
          <a class="button-link secondary" href="/recipes">Mégse</a>
        </div>
      </form>
    </div>
  `
})
export class RecipeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private route = inject(ActivatedRoute);

  recipeId: string | null = null;
  isEditMode = false;
  isLoading = false;

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

    if (!this.recipeId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.recipeService.getRecipe(this.recipeId).subscribe({
      next: (recipe: Recipe) => {
        this.recipeForm.patchValue({
          name: recipe.name,
          description: recipe.description,
          category: recipe.category,
          prepTimeMinutes: recipe.prepTimeMinutes,
          ingredientsText: recipe.ingredients.join('\n'),
          stepsText: recipe.steps.join('\n')
        });
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Hiba a recept betöltésekor:', err);
        this.isLoading = false;
      }
    });
  }

  save(): void {
  if (this.recipeForm.invalid) {
    this.recipeForm.markAllAsTouched();
    console.log('Form invalid');
    return;
  }

  const formValue = this.recipeForm.getRawValue();

  const payload: Recipe = {
    id: this.recipeId ?? '',
    name: formValue.name ?? '',
    description: formValue.description ?? '',
    category: formValue.category ?? '',
    prepTimeMinutes: Number(formValue.prepTimeMinutes ?? 0),
    ingredients: (formValue.ingredientsText ?? '')
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean),
    steps: (formValue.stepsText ?? '')
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean)
  };

  console.log('Saving payload:', payload);

  if (this.recipeId) {
    this.recipeService.updateRecipe(this.recipeId, payload).subscribe({
      next: () => {
        console.log('Update success');
        window.location.href = '/recipes';
      },
      error: (err: unknown) => {
        console.error('Hiba mentéskor:', err);
      }
    });
  } else {
    this.recipeService.createRecipe(payload).subscribe({
      next: (created) => {
        console.log('Create success:', created);
        window.location.href = '/recipes';
      },
      error: (err: unknown) => {
        console.error('Hiba létrehozáskor:', err);
      }
    });
  }
}
}