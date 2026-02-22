using SnackSmasherCore.DTOs;

namespace SnackSmasherCore.Services
{
    public interface IUserService
    {
        Task<List<UserDto>> GetAllUsers();
        Task<UserDto?> GetUserById(int id);
        Task<UserDto?> CreateUser(CreateUserDto createUserDto);
        Task<UserDto?> UpdateUser(int id, UpdateUserDto updateUserDto);
        Task<bool> DeleteUser(int id);
    }
}