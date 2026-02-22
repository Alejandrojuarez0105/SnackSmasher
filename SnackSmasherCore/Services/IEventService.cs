using SnackSmasherCore.DTOs;

namespace SnackSmasherCore.Services
{
    public interface IEventService
    {
        Task<List<EventDto>> GetAllEvents();
        Task<List<EventDto>> GetActiveEvents();
        Task<List<EventDto>> GetUpcomingEvents();
        Task<EventDto?> GetEventById(int id);
        Task<EventDto?> CreateEvent(CreateEventDto createDto);
        Task<EventDto?> UpdateEvent(int id, UpdateEventDto updateDto);
        Task<bool> DeleteEvent(int id);
    }
}