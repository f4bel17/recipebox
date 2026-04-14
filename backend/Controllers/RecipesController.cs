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

    // GET: api/recipes?page=1&pageSize=10
    [HttpGet]
    public async Task<ActionResult<object>> GetAll(int page = 1, int pageSize = 10)
    {
        var totalCount = await _recipesCollection.CountDocumentsAsync(_ => true);

        var items = await _recipesCollection
            .Find(_ => true)
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

    // GET: api/recipes/{id}
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

    // POST: api/recipes
    [HttpPost]
    public async Task<ActionResult<Recipe>> Create(Recipe recipe)
    {
        await _recipesCollection.InsertOneAsync(recipe);

        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }

    // PUT: api/recipes/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Recipe updatedRecipe)
    {
        updatedRecipe.Id = id;

        var result = await _recipesCollection
            .ReplaceOneAsync(r => r.Id == id, updatedRecipe);

        if (result.MatchedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }

    // DELETE: api/recipes/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _recipesCollection
            .DeleteOneAsync(r => r.Id == id);

        if (result.DeletedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }
}