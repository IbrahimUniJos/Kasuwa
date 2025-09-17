using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kasuwa.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorProfileModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VendorProfileId",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "VendorAnalytics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProductViews = table.Column<int>(type: "int", nullable: false),
                    StoreVisits = table.Column<int>(type: "int", nullable: false),
                    OrdersCount = table.Column<int>(type: "int", nullable: false),
                    Revenue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UniqueCustomers = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorAnalytics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VendorAnalytics_AspNetUsers_VendorId",
                        column: x => x.VendorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VendorProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    BusinessRegistrationNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TaxIdentificationNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    VerificationStatus = table.Column<int>(type: "int", nullable: false),
                    VerificationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VerificationNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rating = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ReviewCount = table.Column<int>(type: "int", nullable: false),
                    TotalSales = table.Column<int>(type: "int", nullable: false),
                    TotalRevenue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StoreThemeColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    StoreBannerUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StoreLogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StoreDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    BusinessHours = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FacebookUrl = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    InstagramUrl = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TwitterUrl = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    WebsiteUrl = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CommissionRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsCommissionRateCustom = table.Column<bool>(type: "bit", nullable: false),
                    OffersShipping = table.Column<bool>(type: "bit", nullable: false),
                    DefaultShippingCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OffersFreeShipping = table.Column<bool>(type: "bit", nullable: false),
                    FreeShippingThreshold = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    AcceptsReturns = table.Column<bool>(type: "bit", nullable: false),
                    ReturnPolicyDays = table.Column<int>(type: "int", nullable: true),
                    ReturnPolicyDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VendorProfiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VendorReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CustomerId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsVerifiedPurchase = table.Column<bool>(type: "bit", nullable: false),
                    VendorProfileId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VendorReviews_AspNetUsers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VendorReviews_AspNetUsers_VendorId",
                        column: x => x.VendorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VendorReviews_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VendorReviews_VendorProfiles_VendorProfileId",
                        column: x => x.VendorProfileId,
                        principalTable: "VendorProfiles",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_VendorProfileId",
                table: "Products",
                column: "VendorProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_VendorAnalytics_Date",
                table: "VendorAnalytics",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_VendorAnalytics_VendorId",
                table: "VendorAnalytics",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_VendorAnalytics_VendorId_Date",
                table: "VendorAnalytics",
                columns: new[] { "VendorId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VendorProfiles_CreatedDate",
                table: "VendorProfiles",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_VendorProfiles_Rating",
                table: "VendorProfiles",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_VendorProfiles_UserId",
                table: "VendorProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VendorProfiles_VerificationStatus",
                table: "VendorProfiles",
                column: "VerificationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_VendorReviews_CreatedDate",
                table: "VendorReviews",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_VendorReviews_CustomerId",
                table: "VendorReviews",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_VendorReviews_CustomerId_OrderId",
                table: "VendorReviews",
                columns: new[] { "CustomerId", "OrderId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VendorReviews_OrderId",
                table: "VendorReviews",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_VendorReviews_Rating",
                table: "VendorReviews",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_VendorReviews_VendorId",
                table: "VendorReviews",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_VendorReviews_VendorProfileId",
                table: "VendorReviews",
                column: "VendorProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_VendorProfiles_VendorProfileId",
                table: "Products",
                column: "VendorProfileId",
                principalTable: "VendorProfiles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_VendorProfiles_VendorProfileId",
                table: "Products");

            migrationBuilder.DropTable(
                name: "VendorAnalytics");

            migrationBuilder.DropTable(
                name: "VendorReviews");

            migrationBuilder.DropTable(
                name: "VendorProfiles");

            migrationBuilder.DropIndex(
                name: "IX_Products_VendorProfileId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "VendorProfileId",
                table: "Products");
        }
    }
}
