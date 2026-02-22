using SnackSmasherCore.DTOs;

namespace SnackSmasherCore.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> Login(LoginDto loginDto);
        Task<AuthResponseDto?> Register(RegisterDto registerDto);
        string GenerateJwtToken(int userId, string username, int role);
    }
}