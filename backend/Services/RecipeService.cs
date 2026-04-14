using MongoDB.Driver;
using RecipeBox.Api.Dtos;
using RecipeBox.Api.Models;
using RecipeBox.Api.Settings;

namespace RecipeBox.Api.Services;

public class RecipeService
{
    private readonly IMongoCollection<Recipe> _recipes;

    public RecipeService(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _recipes = database.GetCollection<Recipe>(settings.RecipesCollectionName);
    }

    public async Task<PagedResultDto<Recipe>> GetPagedAsync(int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var totalCount = await _recipes.CountDocumentsAsync(FilterDefinition<Recipe>.Empty);
        var items = await _recipes.Find(FilterDefinition<Recipe>.Empty)
            .SortByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return new PagedResultDto<Recipe>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public Task<Recipe?> GetByIdAsync(string id) =>
        _recipes.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<Recipe> CreateAsync(CreateRecipeDto dto)
    {
        var recipe = new Recipe
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            PrepTimeMinutes = dto.PrepTimeMinutes,
            Ingredients = dto.Ingredients,
            Steps = dto.Steps,
            CreatedAt = DateTime.UtcNow
        };

        await _recipes.InsertOneAsync(recipe);
        return recipe;
    }

    public async Task<bool> UpdateAsync(string id, UpdateRecipeDto dto)
    {
        var existing = await GetByIdAsync(id);
        if (existing is null) return false;

        existing.Name = dto.Name;
        existing.Description = dto.Description;
        existing.Category = dto.Category;
        existing.PrepTimeMinutes = dto.PrepTimeMinutes;
        existing.Ingredients = dto.Ingredients;
        existing.Steps = dto.Steps;

        var result = await _recipes.ReplaceOneAsync(x => x.Id == id, existing);
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _recipes.DeleteOneAsync(x => x.Id == id);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }
}
