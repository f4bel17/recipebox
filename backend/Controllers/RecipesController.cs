using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using RecipeBox.Api.Models;

namespace RecipeBox.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    private readonly IMongoCollection<Recipe> _recipesCollection;

    public RecipesController(IMongoDatabase database)
    {
        _recipesCollection = database.GetCollection<Recipe>("recipes");
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetAll(int page = 1, int pageSize = 10)
    {
        var totalCount = await _recipesCollection.CountDocumentsAsync(_ => true);

        var items = await _recipesCollection
            .Find(_ => true)
            .SortByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return Ok(new
        {
            items,
            page,
            pageSize,
            totalCount
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recipe>> GetById(string id)
    {
        var recipe = await _recipesCollection
            .Find(r => r.Id == id)
            .FirstOrDefaultAsync();

        if (recipe == null)
        {
            return NotFound();
        }

        return Ok(recipe);
    }

    [HttpPost]
    public async Task<ActionResult<Recipe>> Create(Recipe recipe)
    {
        recipe.CreatedAt = DateTime.UtcNow;
        await _recipesCollection.InsertOneAsync(recipe);

        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Recipe updatedRecipe)
    {
        updatedRecipe.Id = id;

        var existing = await _recipesCollection
            .Find(r => r.Id == id)
            .FirstOrDefaultAsync();

        if (existing == null)
        {
            return NotFound();
        }

        updatedRecipe.CreatedAt = existing.CreatedAt;

        var result = await _recipesCollection.ReplaceOneAsync(r => r.Id == id, updatedRecipe);

        if (result.MatchedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _recipesCollection.DeleteOneAsync(r => r.Id == id);

        if (result.DeletedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }
}