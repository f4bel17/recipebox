using System.ComponentModel.DataAnnotations;

namespace RecipeBox.Api.Dtos;

public class UpdateRecipeDto
{
    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    [Range(1, 1000)]
    public int PrepTimeMinutes { get; set; }

    public List<string> Ingredients { get; set; } = new();
    public List<string> Steps { get; set; } = new();
}
