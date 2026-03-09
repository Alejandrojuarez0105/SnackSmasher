import { MenuItem, TextField } from '@mui/material';

interface TimeSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minTime?: string;
  maxTime?: string;
  required?: boolean;
}

export default function TimeSelector({ 
  label, 
  value, 
  onChange, 
  minTime = '17:30', 
  maxTime = '23:00',
  required = false 
}: TimeSelectorProps) {
  
  // Generar horarios válidos (solo :00, :15, :30, :45)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    const [minHour, minMinute] = minTime.split(':').map(Number);
    const [maxHour, maxMinute] = maxTime.split(':').map(Number);
    
    for (let hour = minHour; hour <= maxHour; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        // Validar que esté dentro del rango
        if (hour === minHour && minute < minMinute) continue;
        if (hour === maxHour && minute > maxMinute) break;
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <TextField
      fullWidth
      select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      SelectProps={{ native: false }}
    >
      <MenuItem value="">
        <em>Seleccionar hora</em>
      </MenuItem>
      {timeSlots.map((time) => (
        <MenuItem key={time} value={time}>
          {time}
        </MenuItem>
      ))}
    </TextField>
  );
}