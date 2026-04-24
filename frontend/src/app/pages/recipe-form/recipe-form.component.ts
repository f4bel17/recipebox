import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="card">
      <h1>{{ isEditMode ? 'Recept szerkesztése' : 'Új recept' }}</h1>

      <p *ngIf="isEditMode && isLoading">Betöltés...</p>
      <p *ngIf="loadError" style="color:#dc2626;">Nem sikerült betölteni a receptet.</p>

      <form [formGroup]="recipeForm" (ngSubmit)="save()">
        <div class="form-group">
          <label for="name">Név</label>
          <input id="name" type="text" formControlName="name" />
        </div>

        <div class="form-group">
          <label for="description">Leírás</label>
          <textarea id="description" rows="3" formControlName="description"></textarea>
        </div>

        <div class="form-group">
          <label for="category">Kategória</label>
          <input id="category" type="text" formControlName="category" />
        </div>

        <div class="form-group">
          <label for="prepTimeMinutes">Elkészítési idő (perc)</label>
          <input id="prepTimeMinutes" type="number" formControlName="prepTimeMinutes" />
        </div>

        <div class="form-group">
          <label for="ingredientsText">Hozzávalók (soronként egy)</label>
          <textarea id="ingredientsText" rows="6" formControlName="ingredientsText"></textarea>
        </div>

        <div class="form-group">
          <label for="stepsText">Elkészítési lépések (soronként egy)</label>
          <textarea id="stepsText" rows="6" formControlName="stepsText"></textarea>
        </div>

        <div class="button-row">
          <button class="primary" type="submit" [disabled]="isSaving">Mentés</button>
          <a class="button-link secondary" href="/recipes">Mégse</a>
        </div>
      </form>
    </div>
  `
})
export class RecipeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  recipeId: string | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  loadError = false;

  recipeForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    category: ['', Validators.required],
    prepTimeMinutes: [10, [Validators.required, Validators.min(1)]],
    ingredientsText: [''],
    stepsText: ['']
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.recipeId = params.get('id');
      this.isEditMode = !!this.recipeId;
      this.loadError = false;

      if (!this.recipeId) {
        this.cdr.detectChanges();
        return;
      }

      this.isLoading = true;
      this.cdr.detectChanges();

      this.http
        .get<Recipe>(`http://localhost:8080/api/recipes/${this.recipeId}`)
        .subscribe({
          next: (recipe) => {
            this.recipeForm.patchValue({
              name: recipe.name ?? '',
              description: recipe.description ?? '',
              category: recipe.category ?? '',
              prepTimeMinutes: recipe.prepTimeMinutes ?? 10,
              ingredientsText: (recipe.ingredients ?? []).join('\n'),
              stepsText: (recipe.steps ?? []).join('\n')
            });
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err: unknown) => {
            console.error('Hiba a recept betöltésekor:', err);
            this.isLoading = false;
            this.loadError = true;
            this.cdr.detectChanges();
          }
        });
    });
  }

  save(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

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

    if (this.recipeId) {
      this.http
        .put(`http://localhost:8080/api/recipes/${this.recipeId}`, payload)
        .subscribe({
          next: () => {
            window.location.href = '/recipes';
          },
          error: (err: unknown) => {
            console.error('Hiba mentéskor:', err);
            this.isSaving = false;
            this.cdr.detectChanges();
          }
        });
    } else {
      this.http
        .post(`http://localhost:8080/api/recipes`, payload)
        .subscribe({
          next: () => {
            window.location.href = '/recipes';
          },
          error: (err: unknown) => {
            console.error('Hiba létrehozáskor:', err);
            this.isSaving = false;
            this.cdr.detectChanges();
          }
        });
    }
  }
}