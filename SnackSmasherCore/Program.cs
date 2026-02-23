using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SnackSmasherCore.Data;
using SnackSmasherCore.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =============================================
// CONFIGURACIÓN DE SERVICIOS
// =============================================

// 1. DbContext - Conexión a SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Services - Inyección de dependencias
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IVideogameService, VideogameService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IGameReservationService, GameReservationService>();
builder.Services.AddScoped<ITableReservationService, TableReservationService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<ITableService, TableService>();
builder.Services.AddScoped<IEventService, EventService>();

// 3. CORS - Permitir llamadas desde el frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

// 5. Controllers
builder.Services.AddControllers();

// 6. Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "SnackSmasher Bar API",
        Version = "v1",
        Description = "API para gestión de videojuegos, reservas y eventos"
    });

    // Configuración de autenticación JWT en Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Ingresa el token JWT en el formato: Bearer {tu token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// =============================================
// CONFIGURACIÓN DEL PIPELINE HTTP
// =============================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// =============================================
// MENSAJES DE INICIO
// =============================================
Console.WriteLine("=====================================================");
Console.WriteLine("=                                                   =");
Console.WriteLine("=    SNACKSMASHER BAR API - SISTEMA INICIADO        =");
Console.WriteLine("=                                                   =");
Console.WriteLine("=====================================================");
Console.WriteLine();
Console.WriteLine($"Entorno: {app.Environment.EnvironmentName}");
Console.WriteLine($"Aplicación: https://localhost:7018");
Console.WriteLine($"Swagger UI: https://localhost:7018/swagger");
Console.WriteLine($"Hora de inicio: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
Console.WriteLine();
Console.WriteLine("Endpoints disponibles:");
Console.WriteLine("  AUTH:");
Console.WriteLine("    • POST   /api/Auth/register              - Registrar usuario");
Console.WriteLine("    • POST   /api/Auth/login                 - Iniciar sesión");
Console.WriteLine("  VIDEOJUEGOS:");
Console.WriteLine("    • GET    /api/Videogames                 - Listar videojuegos");
Console.WriteLine("    • GET    /api/Videogames/top-rated       - Top valorados");
Console.WriteLine("    • POST   /api/Videogames                 - Crear juego (Admin)");
Console.WriteLine("  RESERVAS:");
Console.WriteLine("    • GET    /api/GameReservations/active    - Reservas activas");
Console.WriteLine("    • POST   /api/GameReservations           - Reservar juego");
Console.WriteLine("    • GET    /api/TableReservations          - Ver reservas (Admin)");
Console.WriteLine("    • POST   /api/TableReservations          - Reservar mesa");
Console.WriteLine("  MENÚ:");
Console.WriteLine("    • GET    /api/Menu/categories            - Ver menú completo");
Console.WriteLine("  EVENTOS:");
Console.WriteLine("    • GET    /api/Events/upcoming            - Próximos eventos");
Console.WriteLine();
Console.WriteLine("=====================================================");
Console.WriteLine();

app.Run();