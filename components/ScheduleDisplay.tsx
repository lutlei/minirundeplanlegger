import React, { useState, useEffect } from 'react';
import { Match, formatTime } from '@/lib/tournamentUtils';

interface ScheduleDisplayProps {
  schedule: Match[];
  numFields: number;
  onFilterChange?: (filteredSchedule: Match[]) => void;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ 
  schedule, 
  numFields,
  onFilterChange 
}) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filteredSchedule, setFilteredSchedule] = useState<Match[]>(schedule);
  const [categories, setCategories] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  
  // Extract unique categories and teams when schedule changes
  useEffect(() => {
    if (schedule.length > 0) {
      const uniqueCategories = [...new Set(schedule.map(match => match.category))];
      const uniqueTeams = [...new Set([
        ...schedule.map(match => match.team1),
        ...schedule.map(match => match.team2)
      ])].filter(team => team !== 'FRI');
      
      setCategories(uniqueCategories.sort());
      setTeams(uniqueTeams.sort());
    }
  }, [schedule]);
  
  // Apply filters when any filter or schedule changes
  useEffect(() => {
    const filtered = schedule.filter(match => {
      const categoryMatch = filterCategory === 'all' || match.category === filterCategory;
      const dayMatch = filterDay === 'all' || match.day === filterDay;
      const teamMatch = filterTeam === 'all' || match.team1 === filterTeam || match.team2 === filterTeam;
      return categoryMatch && dayMatch && teamMatch;
    });
    
    setFilteredSchedule(filtered);
    
    if (onFilterChange) {
      onFilterChange(filtered);
    }
  }, [schedule, filterCategory, filterDay, filterTeam, onFilterChange]);
  
  // Group schedule by time slots for display
  const groupedSchedule = filteredSchedule.reduce((acc, match) => {
    const key = `${match.day}-${match.time}`;
    if (!acc[key]) {
      acc[key] = {
        day: match.day,
        time: match.time,
        matchesByField: Array(numFields + 1).fill(null)
      };
    }
    if (match.field && match.field >= 1 && match.field <= numFields) {
      acc[key].matchesByField[match.field] = match;
    }
    return acc;
  }, {} as Record<string, { day: string | null; time: string | null; matchesByField: (Match | null)[] }>);
  
  // Sort time slots chronologically
  const sortedTimeSlots = Object.keys(groupedSchedule).sort((a, b) => {
    const [dayA, timeA] = a.split('-');
    const [dayB, timeB] = b.split('-');
    
    // Sort by day first (Saturday before Sunday)
    if (dayA === 'Lørdag' && dayB === 'Søndag') return -1;
    if (dayA === 'Søndag' && dayB === 'Lørdag') return 1;
    
    // Then sort by time
    if (timeA && timeB) {
      const dateA = new Date(`1970-01-01T${timeA}`);
      const dateB = new Date(`1970-01-01T${timeB}`);
      return dateA.getTime() - dateB.getTime();
    }
    
    return 0;
  });
  
  // Pool colors for visual differentiation
  const poolColors = [
    'pool-color-0', 'pool-color-1', 'pool-color-2', 'pool-color-3',
    'pool-color-4', 'pool-color-5', 'pool-color-6', 'pool-color-7'
  ];
  
  return (
    <div>
      {/* Filter controls */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="filter-category" className="block text-sm font-medium mb-1">
            Filtrer på kategori:
          </label>
          <select
            id="filter-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md"
          >
            <option value="all">Alle kategorier</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="filter-day" className="block text-sm font-medium mb-1">
            Filtrer på dag:
          </label>
          <select
            id="filter-day"
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md"
          >
            <option value="all">Alle dager</option>
            <option value="Lørdag">Lørdag</option>
            <option value="Søndag">Søndag</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="filter-team" className="block text-sm font-medium mb-1">
            Filtrer på lag:
          </label>
          <select
            id="filter-team"
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md"
          >
            <option value="all">Alle lag</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Schedule table */}
      <div className="border border-gray-300 dark:border-slate-600 rounded-md p-1 sm:p-2 overflow-x-auto">
        {filteredSchedule.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 p-4">
            {schedule.length > 0 
              ? 'Ingen kamper funnet for valgte filtre.' 
              : 'Ingen kampprogram generert ennå.'}
          </p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Tid</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Dag</th>
                {Array.from({ length: numFields }, (_, i) => (
                  <th key={i} className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">
                    Bane {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {sortedTimeSlots.map(key => {
                const { day, time, matchesByField } = groupedSchedule[key];
                return (
                  <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-2 font-medium">{time ? formatTime(time) : ''}</td>
                    <td className="px-4 py-2">{day}</td>
                    {matchesByField.slice(1).map((match, i) => (
                      <td key={i} className={`px-4 py-2 text-sm ${match ? poolColors[match.poolIndex % poolColors.length] : ''}`}>
                        {match ? (
                          <>
                            <div className="font-medium">{match.team1} vs {match.team2}</div>
                            <div className="text-xs opacity-75">{match.category} - Pool {match.poolIndex + 1}</div>
                          </>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ScheduleDisplay; 