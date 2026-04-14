ngOnInit(): void {
  this.recipeId = this.route.snapshot.paramMap.get('id');
  this.isEditMode = !!this.recipeId;

  if (!this.recipeId) {
    this.isLoading = false;
    return;
  }

  this.isLoading = true;

  const stored = localStorage.getItem('selectedRecipe');
  if (stored) {
    const recipe: Recipe = JSON.parse(stored);
    if (recipe.id === this.recipeId) {
      this.recipeForm.patchValue({
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        prepTimeMinutes: recipe.prepTimeMinutes,
        ingredientsText: recipe.ingredients.join('\n'),
        stepsText: recipe.steps.join('\n')
      });
      this.isLoading = false;
      return;
    }
  }

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