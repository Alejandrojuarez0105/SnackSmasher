using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using SnackSmasherCore.Data;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Models;

namespace SnackSmasherCore.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> Login(LoginDto loginDto)
        {
            // Buscar usuario por username
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null)
                return null;

            // Verificar contraseña hasheada
            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
                return null;

            // Verificar que el usuario esté activo
            if (!user.IsActive)
                return null;

            // Generar token JWT
            var token = GenerateJwtToken(user.Id, user.Username, user.Role);

            return new AuthResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Token = token
            };
        }

        public async Task<AuthResponseDto?> Register(RegisterDto registerDto)
        {
            // Verificar si el username ya existe
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                return null;

            // Hashear la contraseña
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            // Crear nuevo usuario
            var newUser = new User
            {
                Username = registerDto.Username,
                Password = hashedPassword,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Role = 2, // Usuario normal por defecto
                CreatedAt = DateTime.Now,
                IsActive = true
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Generar token
            var token = GenerateJwtToken(newUser.Id, newUser.Username, newUser.Role);

            return new AuthResponseDto
            {
                Id = newUser.Id,
                Username = newUser.Username,
                Email = newUser.Email,
                FirstName = newUser.FirstName,
                LastName = newUser.LastName,
                Role = newUser.Role,
                Token = token
            };
        }

        public string GenerateJwtToken(int userId, string username, int role)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role == 1 ? "Admin" : "User")
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpirationMinutes"]!)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}