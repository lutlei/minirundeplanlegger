// Types
export interface Team {
  id: number;
  name: string;
  category: string;
}

export interface TournamentSettings {
  signupDeadline: Date;
  startDate: Date;
  matchDuration: number;
  numFields: number;
  startTime: string;
  endTime: string;
}

export interface Match {
  matchId: number;
  category: string;
  poolIndex: number;
  team1: string;
  team2: string;
  day: string | null;
  time: string | null;
  field: number | null;
  duration: number;
  scheduled: boolean;
}

export interface TimeSlot {
  day: string;
  startTime: Date;
  endTime: Date;
  field: number;
  available: boolean;
}

// Utility functions
export const formatDate = (date: Date): string => {
  if (!date) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('nb-NO', options);
};

export const formatTime = (timeString: string): string => {
  if (!timeString || !timeString.includes(':')) return '';
  
  // Time is already in HH:MM format, just return it
  return timeString;
};

export const validateSettings = (settings: Partial<TournamentSettings>): { isValid: boolean; errorMsg: string } => {
  if (!settings.signupDeadline) {
    return { isValid: false, errorMsg: 'Påmeldingsfrist må oppgis.' };
  }
  
  if (!settings.startDate) {
    return { isValid: false, errorMsg: 'Turneringsstart må oppgis.' };
  }
  
  if (settings.signupDeadline >= settings.startDate) {
    return { isValid: false, errorMsg: 'Påmeldingsfrist må være før turneringsstart.' };
  }
  
  if (!settings.matchDuration || settings.matchDuration < 5) {
    return { isValid: false, errorMsg: 'Kampvarighet må være minst 5 minutter.' };
  }
  
  if (!settings.numFields || settings.numFields < 1) {
    return { isValid: false, errorMsg: 'Minst 1 bane må være tilgjengelig.' };
  }
  
  if (!settings.startTime || !settings.endTime) {
    return { isValid: false, errorMsg: 'Start- og sluttid må oppgis.' };
  }
  
  const startTimeParts = settings.startTime.split(':');
  const endTimeParts = settings.endTime.split(':');
  
  if (startTimeParts.length !== 2 || endTimeParts.length !== 2) {
    return { isValid: false, errorMsg: 'Ugyldig format for start- eller sluttid.' };
  }
  
  const startHour = parseInt(startTimeParts[0]);
  const startMinute = parseInt(startTimeParts[1]);
  const endHour = parseInt(endTimeParts[0]);
  const endMinute = parseInt(endTimeParts[1]);
  
  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return { isValid: false, errorMsg: 'Ugyldig format for start- eller sluttid.' };
  }
  
  if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
    return { isValid: false, errorMsg: 'Starttid må være før sluttid.' };
  }
  
  return { isValid: true, errorMsg: '' };
};

export const createPools = (teams: Team[], targetPoolSize: number): Team[][] => {
  if (teams.length <= targetPoolSize) {
    return [teams];
  }
  
  const numPools = Math.ceil(teams.length / targetPoolSize);
  const pools: Team[][] = Array.from({ length: numPools }, () => []);
  
  // Sort teams randomly
  const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
  
  // Distribute teams across pools (try to keep pool sizes equal)
  shuffledTeams.forEach((team, index) => {
    const poolIndex = index % numPools;
    pools[poolIndex].push(team);
  });
  
  return pools;
};

export const generatePoolRoundRobinPairs = (teams: Team[]): [string, string][] => {
  if (teams.length < 2) return [];
  
  const teamNames = teams.map(team => team.name);
  const pairs: [string, string][] = [];
  
  // For each team, play against all other teams
  for (let i = 0; i < teamNames.length; i++) {
    for (let j = i + 1; j < teamNames.length; j++) {
      pairs.push([teamNames[i], teamNames[j]]);
    }
  }
  
  return pairs;
};

export const getDayOfWeek = (date: Date): string => {
  const days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  return days[date.getDay()];
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const roundUpToNearest5Minutes = (date: Date): Date => {
  const minutes = date.getMinutes();
  const remainder = minutes % 5;
  
  if (remainder === 0) return date;
  
  const minutesToAdd = 5 - remainder;
  return addMinutes(date, minutesToAdd);
};

export const generateTimeSlots = (settings: TournamentSettings): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  // Start with Saturday (tournament start date)
  const saturdayDate = new Date(settings.startDate);
  
  // Get Sunday date
  const sundayDate = new Date(settings.startDate);
  sundayDate.setDate(sundayDate.getDate() + 1);
  
  // Process Saturday and Sunday
  const dates = [saturdayDate, sundayDate];
  
  dates.forEach(date => {
    const day = getDayOfWeek(date);
    
    // Parse start and end times
    const [startHour, startMinute] = settings.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.endTime.split(':').map(Number);
    
    // Create Date objects for start and end times
    const dayStart = new Date(date);
    dayStart.setHours(startHour, startMinute, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, endMinute, 0, 0);
    
    // Calculate slot duration (match + buffer)
    const slotDuration = settings.matchDuration + 5; // 5 min buffer between matches
    
    // Generate slots for each field
    for (let field = 1; field <= settings.numFields; field++) {
      let currentTime = new Date(dayStart);
      
      while (currentTime.getTime() + settings.matchDuration * 60000 <= dayEnd.getTime()) {
        const endTime = addMinutes(currentTime, settings.matchDuration);
        
        slots.push({
          day,
          startTime: new Date(currentTime),
          endTime: new Date(endTime),
          field,
          available: true
        });
        
        // Move to next slot
        currentTime = addMinutes(currentTime, slotDuration);
      }
    }
  });
  
  return slots;
}; 