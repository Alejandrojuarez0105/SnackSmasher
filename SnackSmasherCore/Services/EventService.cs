using Microsoft.EntityFrameworkCore;
using SnackSmasherCore.Data;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Models;

namespace SnackSmasherCore.Services
{
    public class EventService : IEventService
    {
        private readonly ApplicationDbContext _context;

        public EventService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<EventDto>> GetAllEvents()
        {
            return await _context.Events
                .Select(e => new EventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    ImageUrl = e.ImageUrl,
                    IsActive = e.IsActive
                })
                .OrderByDescending(e => e.EventDate)
                .ToListAsync();
        }

        public async Task<List<EventDto>> GetActiveEvents()
        {
            return await _context.Events
                .Where(e => e.IsActive)
                .Select(e => new EventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    ImageUrl = e.ImageUrl,
                    IsActive = e.IsActive
                })
                .OrderByDescending(e => e.EventDate)
                .ToListAsync();
        }

        public async Task<List<EventDto>> GetUpcomingEvents()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);

            return await _context.Events
                .Where(e => e.IsActive && e.EventDate >= today)
                .Select(e => new EventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    ImageUrl = e.ImageUrl,
                    IsActive = e.IsActive
                })
                .OrderBy(e => e.EventDate)
                .ThenBy(e => e.StartTime)
                .ToListAsync();
        }

        public async Task<EventDto?> GetEventById(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null) return null;

            return new EventDto
            {
                Id = eventItem.Id,
                Title = eventItem.Title,
                Description = eventItem.Description,
                EventDate = eventItem.EventDate,
                StartTime = eventItem.StartTime,
                EndTime = eventItem.EndTime,
                ImageUrl = eventItem.ImageUrl,
                IsActive = eventItem.IsActive
            };
        }

        public async Task<EventDto?> CreateEvent(CreateEventDto createDto)
        {
            var newEvent = new Event
            {
                Title = createDto.Title,
                Description = createDto.Description,
                EventDate = createDto.EventDate,
                StartTime = createDto.StartTime,
                EndTime = createDto.EndTime,
                ImageUrl = createDto.ImageUrl,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            return new EventDto
            {
                Id = newEvent.Id,
                Title = newEvent.Title,
                Description = newEvent.Description,
                EventDate = newEvent.EventDate,
                StartTime = newEvent.StartTime,
                EndTime = newEvent.EndTime,
                ImageUrl = newEvent.ImageUrl,
                IsActive = newEvent.IsActive
            };
        }

        public async Task<EventDto?> UpdateEvent(int id, UpdateEventDto updateDto)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null) return null;

            if (updateDto.Title != null) eventItem.Title = updateDto.Title;
            if (updateDto.Description != null) eventItem.Description = updateDto.Description;
            if (updateDto.EventDate.HasValue) eventItem.EventDate = updateDto.EventDate.Value;
            if (updateDto.StartTime.HasValue) eventItem.StartTime = updateDto.StartTime.Value;
            if (updateDto.EndTime.HasValue) eventItem.EndTime = updateDto.EndTime;
            if (updateDto.ImageUrl != null) eventItem.ImageUrl = updateDto.ImageUrl;
            if (updateDto.IsActive.HasValue) eventItem.IsActive = updateDto.IsActive.Value;

            await _context.SaveChangesAsync();

            return new EventDto
            {
                Id = eventItem.Id,
                Title = eventItem.Title,
                Description = eventItem.Description,
                EventDate = eventItem.EventDate,
                StartTime = eventItem.StartTime,
                EndTime = eventItem.EndTime,
                ImageUrl = eventItem.ImageUrl,
                IsActive = eventItem.IsActive
            };
        }

        public async Task<bool> DeleteEvent(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null) return false;

            _context.Events.Remove(eventItem);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}