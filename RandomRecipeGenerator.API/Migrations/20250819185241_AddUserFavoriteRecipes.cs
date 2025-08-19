using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RandomRecipeGenerator.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserFavoriteRecipes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "GoogleUserID",
                table: "Users",
                newName: "GoogleUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Users_GoogleUserID",
                table: "Users",
                newName: "IX_Users_GoogleUserId");

            migrationBuilder.CreateTable(
                name: "UserFavoriteRecipes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFavoriteRecipes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserFavoriteRecipes_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserFavoriteRecipes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserFavoriteRecipes_RecipeId",
                table: "UserFavoriteRecipes",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserFavoriteRecipes_UserId_RecipeId",
                table: "UserFavoriteRecipes",
                columns: new[] { "UserId", "RecipeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserFavoriteRecipes");

            migrationBuilder.RenameColumn(
                name: "GoogleUserId",
                table: "Users",
                newName: "GoogleUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Users_GoogleUserId",
                table: "Users",
                newName: "IX_Users_GoogleUserID");
        }
    }
}
