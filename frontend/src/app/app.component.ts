import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav class="topbar">
      <a href="/recipes">RecipeBox</a>
      <a href="/recipes/new">Új recept</a>
    </nav>

    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {}