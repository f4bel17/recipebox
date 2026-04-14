import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.css']
})
export class RecipeFormComponent implements OnInit {
  recipeId: string | null = null;
  isEditMode = false;
  isLoading = false;

  form = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    category: ['', [Validators.required]],
    prepTimeMinutes: [0, [Validators.required, Validators.min(1)]],
    ingredientsText: ['', [Validators.required]],
    stepsText: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.recipeId;

    if (this.recipeId) {
      this.isLoading = true;
      this.recipeService.getById(this.recipeId).subscribe({
        next: (recipe) => {
          this.form.patchValue({
            name: recipe.name,
            description: recipe.description,
            category: recipe.category,
            prepTimeMinutes: recipe.prepTimeMinutes,
            ingredientsText: recipe.ingredients.join('\n'),
            stepsText: recipe.steps.join('\n')
          });
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

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

    if (this.isEditMode && this.recipeId) {
      this.recipeService.update(this.recipeId, payload).subscribe({
        next: () => this.router.navigate(['/recipes'])
      });
    } else {
      this.recipeService.create(payload).subscribe({
        next: () => this.router.navigate(['/recipes'])
      });
    }
  }
}