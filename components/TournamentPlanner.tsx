import React, { useState, useEffect } from 'react';
import TeamsList from './TeamsList';
import ScheduleDisplay from './ScheduleDisplay';
import ChatAssistant from './ChatAssistant';
import { useMessages } from './MessageBox';
import { 
  Team, 
  TournamentSettings, 
  Match, 
  formatDate, 
  validateSettings, 
  createPools, 
  generatePoolRoundRobinPairs,
  getDayOfWeek,
  addMinutes,
  roundUpToNearest5Minutes,
  generateTimeSlots
} from '@/lib/tournamentUtils';

const TournamentPlanner: React.FC = () => {
  // State variables
  const [activeTab, setActiveTab] = useState<'signup' | 'organizer' | 'schedule'>('organizer');
  const [teams, setTeams] = useState<Team[]>([]);
  const [nextTeamId, setNextTeamId] = useState(1);
  const [nextMatchId, setNextMatchId] = useState(1);
  const [schedule, setSchedule] = useState<Match[]>([]);
  const [tournamentSettings, setTournamentSettings] = useState<TournamentSettings | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  // Team management state
  const [teamName, setTeamName] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [signupError, setSignupError] = useState('');
  
  // Organizer settings state
  const [signupDeadline, setSignupDeadline] = useState('');
  const [tournamentStartDate, setTournamentStartDate] = useState('');
  const [matchDuration, setMatchDuration] = useState(15);
  const [numFields, setNumFields] = useState(2);
  const [startTime, setStartTime] = useState('10:30');
  const [endTime, setEndTime] = useState('18:00');
  const [settingsError, setSettingsError] = useState('');
  
  // Schedule state
  const [scheduleError, setScheduleError] = useState('');
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  
  // Message system
  const { showMessage, MessageContainer } = useMessages();
  
  // Initialize theme based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    setDarkMode(storedTheme === 'dark' || (storedTheme === null && prefersDark));
    document.documentElement.classList.toggle('dark', darkMode);
    
    // Set initial tournament start date to next Saturday
    const today = new Date();
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (6 - today.getDay() + 7) % 7);
    const nextSaturdayStr = nextSaturday.toISOString().split('T')[0];
    
    // Set initial signup deadline to Thursday before the tournament
    const deadline = new Date(nextSaturday);
    deadline.setDate(nextSaturday.getDate() - 2);
    deadline.setHours(17, 0, 0, 0);
    const deadlineStr = `${deadline.toISOString().split('T')[0]}T${deadline.getHours().toString().padStart(2, '0')}:${deadline.getMinutes().toString().padStart(2, '0')}`;
    
    setTournamentStartDate(nextSaturdayStr);
    setSignupDeadline(deadlineStr);
  }, []);
  
  // Apply dark mode class to html element when darkMode changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  
  // Check signup status when tournament settings change
  useEffect(() => {
    checkSignupStatus();
  }, [tournamentSettings]);
  
  // Toggle theme
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };
  
  // Switch tab function
  const switchTab = (tab: 'signup' | 'organizer' | 'schedule') => {
    setActiveTab(tab);
  };
  
  // Check if signup is open based on deadline
  const checkSignupStatus = () => {
    const now = new Date();
    if (tournamentSettings && now < tournamentSettings.signupDeadline) {
      setSignupOpen(true);
    } else {
      setSignupOpen(false);
    }
  };
  
  // Add team function
  const handleSignup = () => {
    // Clear previous errors
    setSignupError('');
    
    if (!signupOpen) {
      setSignupError('Påmeldingsperioden er stengt eller ikke konfigurert.');
      return;
    }
    
    if (!teamName.trim()) {
      setSignupError('Lagnavn kan ikke være tomt.');
      return;
    }
    
    if (!ageCategory) {
      setSignupError('Vennligst velg alderskategori.');
      return;
    }
    
    if (teams.some(team => team.name.toLowerCase() === teamName.trim().toLowerCase())) {
      setSignupError('Et lag med dette navnet finnes allerede.');
      return;
    }
    
    const newTeam: Team = {
      id: nextTeamId,
      name: teamName.trim(),
      category: ageCategory
    };
    
    setTeams([...teams, newTeam]);
    setNextTeamId(nextTeamId + 1);
    setTeamName('');
    setAgeCategory('');
    
    // Show success message
    showMessage(`Lag "${teamName}" ble påmeldt!`, 'success');
  };
  
  // Remove team function
  const removeTeam = (id: number) => {
    setTeams(teams.filter(team => team.id !== id));
    showMessage('Lag fjernet.', 'error');
  };
  
  // Validate and save tournament settings
  const handleConfigureSettings = () => {
    setSettingsError('');
    
    // Parse form values to create settings object
    const settings: Partial<TournamentSettings> = {
      signupDeadline: new Date(signupDeadline),
      startDate: new Date(tournamentStartDate + 'T00:00:00'),
      matchDuration,
      numFields,
      startTime,
      endTime
    };
    
    // Validate settings
    const { isValid, errorMsg } = validateSettings(settings);
    
    if (!isValid) {
      setSettingsError(errorMsg);
      return;
    }
    
    // Save settings
    setTournamentSettings(settings as TournamentSettings);
    showMessage('Turneringsinnstillinger bekreftet!', 'success');
  };
  
  // Generate match schedule
  const handleGenerateSchedule = () => {
    if (!tournamentSettings) {
      setScheduleError('Turneringsinnstillinger må konfigureres først.');
      return;
    }
    
    if (teams.length < 2) {
      setScheduleError('Minst 2 lag må være påmeldt for å generere kampprogram.');
      return;
    }
    
    setIsGeneratingSchedule(true);
    setScheduleError('');
    setSchedule([]);
    let currentMatchId = nextMatchId;
    
    try {
      // Group teams by category
      const teamsByCategory = teams.reduce((acc, team) => {
        if (!acc[team.category]) {
          acc[team.category] = [];
        }
        acc[team.category].push(team);
        return acc;
      }, {} as Record<string, Team[]>);
      
      let allMatchesToSchedule: Match[] = [];
      const teamPoolMap = new Map<string, number>();
      
      // Create pools for each category and generate round-robin matches
      for (const category in teamsByCategory) {
        const categoryTeams = teamsByCategory[category];
        
        if (categoryTeams.length < 2) {
          console.warn(`Skipping category ${category}: Less than 2 teams.`);
          continue;
        }
        
        // Create pools of teams (approximately 5 teams per pool)
        const pools = createPools(categoryTeams, 5);
        
        pools.forEach((pool, poolIndex) => {
          if (pool.length < 2) return;
          
          // Map teams to their pool for later reference
          pool.forEach(team => teamPoolMap.set(team.name, poolIndex));
          
          // Generate round-robin matchups within each pool
          const poolPairs = generatePoolRoundRobinPairs(pool);
          
          // Create match objects for each pair
          poolPairs.forEach(pair => {
            allMatchesToSchedule.push({
              matchId: currentMatchId++,
              category: category,
              poolIndex: poolIndex,
              team1: pair[0],
              team2: pair[1],
              day: null,
              time: null,
              duration: tournamentSettings.matchDuration,
              field: null,
              scheduled: false
            });
          });
        });
      }
      
      // Update the nextMatchId state with the current value
      setNextMatchId(currentMatchId);
      
      if (allMatchesToSchedule.length === 0) {
        setScheduleError('Ingen kamper kunne genereres. Sørg for at det finnes minst en kategori med minst 2 lag.');
        setIsGeneratingSchedule(false);
        return;
      }
      
      // Generate available time slots based on tournament settings
      const availableSlots = generateTimeSlots(tournamentSettings);
      
      if (availableSlots.length === 0) {
        setScheduleError('Ingen tilgjengelige tidspunkter funnet med gitte innstillinger.');
        setIsGeneratingSchedule(false);
        return;
      }
      
      // Sort slots chronologically
      availableSlots.sort((a, b) => 
        a.startTime.getTime() - b.startTime.getTime() || 
        a.field - b.field
      );
      
      // Randomize match order for fair distribution
      allMatchesToSchedule = [...allMatchesToSchedule].sort(() => 0.5 - Math.random());
      
      // Schedule matches to slots
      const teamScheduleInfo: Record<string, {
        firstMatchTime: Date | null;
        lastMatchEndTime: Date | null;
        matchesPlayed: number;
        day: string | null;
      }> = {};
      
      // Set constraints for scheduling
      const minBreakDuration = tournamentSettings.matchDuration + 5; // 5 min break
      const maxPlayTimeMillis = 4 * 60 * 60 * 1000; // 4 hours max tournament time for a team
      
      let scheduledCount = 0;
      const scheduledMatches: Match[] = [];
      
      for (const slot of availableSlots) {
        if (!slot.available) continue;
        
        const slotDay = getDayOfWeek(slot.startTime);
        
        for (const match of allMatchesToSchedule) {
          if (match.scheduled) continue;
          
          const team1 = match.team1;
          const team2 = match.team2;
          
          // Apply day constraints for different categories
          if (match.category === "Mikro" && slotDay !== "Lørdag") continue;
          if (match.category === "Lillegutt/jente" && slotDay !== "Søndag") continue;
          
          // Initialize team info if not exists
          if (!teamScheduleInfo[team1]) {
            teamScheduleInfo[team1] = {
              firstMatchTime: null,
              lastMatchEndTime: null,
              matchesPlayed: 0,
              day: null
            };
          }
          
          if (!teamScheduleInfo[team2]) {
            teamScheduleInfo[team2] = {
              firstMatchTime: null,
              lastMatchEndTime: null,
              matchesPlayed: 0,
              day: null
            };
          }
          
          const team1Info = teamScheduleInfo[team1];
          const team2Info = teamScheduleInfo[team2];
          
          // Teams should play on the same day
          if (team1Info.day !== null && slotDay !== team1Info.day) continue;
          if (team2Info.day !== null && slotDay !== team2Info.day) continue;
          
          // Limit number of matches per team
          if (team1Info.matchesPlayed >= 5 || team2Info.matchesPlayed >= 5) continue;
          
          // Check if team has sufficient break time
          const team1AvailableAt = team1Info.lastMatchEndTime 
            ? addMinutes(team1Info.lastMatchEndTime, minBreakDuration) 
            : slot.startTime;
            
          const team2AvailableAt = team2Info.lastMatchEndTime 
            ? addMinutes(team2Info.lastMatchEndTime, minBreakDuration) 
            : slot.startTime;
          
          if (slot.startTime < team1AvailableAt || slot.startTime < team2AvailableAt) continue;
          
          // Check if team's total playing time is within limits
          const team1PotentialEndTime = slot.endTime;
          const team2PotentialEndTime = slot.endTime;
          
          let team1DurationOk = true;
          let team2DurationOk = true;
          
          if (team1Info.firstMatchTime && 
              (team1PotentialEndTime.getTime() - team1Info.firstMatchTime.getTime() > maxPlayTimeMillis)) {
            team1DurationOk = false;
          }
          
          if (team2Info.firstMatchTime && 
              (team2PotentialEndTime.getTime() - team2Info.firstMatchTime.getTime() > maxPlayTimeMillis)) {
            team2DurationOk = false;
          }
          
          // If all constraints are satisfied, schedule the match
          if (team1DurationOk && team2DurationOk) {
            // Format time as HH:MM
            const timeStr = slot.startTime.toLocaleTimeString('nb-NO', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            
            // Update match and mark as scheduled
            match.day = slotDay;
            match.time = timeStr;
            match.field = slot.field;
            match.scheduled = true;
            
            // Mark slot as used
            slot.available = false;
            
            // Update team info
            team1Info.matchesPlayed++;
            team2Info.matchesPlayed++;
            
            if (!team1Info.firstMatchTime) team1Info.firstMatchTime = slot.startTime;
            if (!team2Info.firstMatchTime) team2Info.firstMatchTime = slot.startTime;
            
            if (team1Info.day === null) team1Info.day = slotDay;
            if (team2Info.day === null) team2Info.day = slotDay;
            
            team1Info.lastMatchEndTime = slot.endTime;
            team2Info.lastMatchEndTime = slot.endTime;
            
            scheduledMatches.push(match);
            scheduledCount++;
            
            break; // Proceed to next slot
          }
        }
      }
      
      // Check if all matches were scheduled
      const unscheduledMatches = allMatchesToSchedule.filter(m => !m.scheduled);
      
      if (unscheduledMatches.length > 0) {
        setScheduleError(`Advarsel: Kunne ikke planlegge ${unscheduledMatches.length} kamper grunnet tid/bane-begrensninger eller pauser.`);
      }
      
      // Check if any teams have too few matches
      let teamsBelowMin = 0;
      for (const teamName in teamScheduleInfo) {
        if (teamScheduleInfo[teamName].matchesPlayed < 3 && teams.find(t => t.name === teamName)) {
          teamsBelowMin++;
        }
      }
      
      if (teamsBelowMin > 0) {
        const currentError = scheduleError;
        setScheduleError((currentError ? currentError + " " : "") + 
          `${teamsBelowMin} lag har færre enn 3 kamper.`);
      }
      
      // Sort matches chronologically for display
      scheduledMatches.sort((a, b) => {
        // Sort by day
        if (a.day === 'Lørdag' && b.day === 'Søndag') return -1;
        if (a.day === 'Søndag' && b.day === 'Lørdag') return 1;
        
        // Sort by time
        if (a.time && b.time) {
          const timeA = new Date(`1970-01-01T${a.time}`);
          const timeB = new Date(`1970-01-01T${b.time}`);
          if (timeA < timeB) return -1;
          if (timeA > timeB) return 1;
        }
        
        // Sort by field
        if (a.field && b.field) {
          if (a.field < b.field) return -1;
          if (a.field > b.field) return 1;
        }
        
        return 0;
      });
      
      setSchedule(scheduledMatches);
      showMessage(`Kampprogram generert med ${scheduledMatches.length} kamper.`, 'success');
      
      if (scheduledMatches.length > 0) {
        setActiveTab('schedule');
      }
      
    } catch (error) {
      console.error("Error generating schedule:", error);
      setScheduleError(`En uventet feil oppstod under generering: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGeneratingSchedule(false);
    }
  };
  
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="container mx-auto max-w-4xl bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 relative">
        {/* Theme toggle button */}
        <button 
          onClick={toggleTheme}
          aria-label={darkMode ? 'Bytt til lyst modus' : 'Bytt til mørkt modus'}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 z-10"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
        
        {/* Tab navigation */}
        <div className="mb-4 border-b border-slate-300 dark:border-slate-600">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <button 
              onClick={() => switchTab('signup')} 
              className={`tab-button ${activeTab === 'signup' ? 'active-tab' : 'inactive-tab'}`}
              aria-selected={activeTab === 'signup'}
              role="tab"
            >
              Påmelding & Info
            </button>
            <button 
              onClick={() => switchTab('organizer')} 
              className={`tab-button ${activeTab === 'organizer' ? 'active-tab' : 'inactive-tab'}`}
              aria-selected={activeTab === 'organizer'}
              role="tab"
            >
              Arrangør
            </button>
            <button 
              onClick={() => switchTab('schedule')} 
              className={`tab-button ${activeTab === 'schedule' ? 'active-tab' : 'inactive-tab'}`}
              aria-selected={activeTab === 'schedule'}
              role="tab"
            >
              Kampprogram
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div>
          {/* Signup tab */}
          <div className={activeTab === 'signup' ? '' : 'hidden'} role="tabpanel">
            <section className="mb-8 p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 fade-in">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
                Lagpåmelding
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="team-name" className="block text-sm font-medium mb-1">Lagnavn:</label>
                  <input 
                    type="text" 
                    id="team-name" 
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light" 
                  />
                </div>
                <div>
                  <label htmlFor="age-category" className="block text-sm font-medium mb-1">Alderskategori:</label>
                  <select 
                    id="age-category" 
                    value={ageCategory}
                    onChange={(e) => setAgeCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light"
                  >
                    <option value="" disabled>Velg kategori</option>
                    <option value="Mikro">Mikro</option>
                    <option value="Mini">Mini</option>
                    <option value="Lillegutt/jente">Lillegutt/jente</option>
                  </select>
                </div>
                <div className="self-end">
                  <button 
                    onClick={handleSignup}
                    disabled={!signupOpen} 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center shadow disabled:opacity-50"
                  >
                    Meld på lag
                  </button>
                </div>
              </div>
              {signupError && (
                <p className="text-red-500 dark:text-red-400 text-sm mb-2">{signupError}</p>
              )}
              <p className="text-sm mb-4 text-slate-600 dark:text-slate-400">
                {tournamentSettings 
                  ? `Påmelding stenger: ${formatDate(tournamentSettings.signupDeadline)}` 
                  : 'Påmelding er stengt. Vennligst konfigurer innstillinger først.'}
              </p>
            </section>

            {/* Teams list */}
            <TeamsList teams={teams} onRemoveTeam={removeTeam} />
          </div>
          
          {/* Organizer tab */}
          <div className={activeTab === 'organizer' ? '' : 'hidden'} role="tabpanel">
            <section className="mb-8 p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 fade-in">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
                Turneringsinnstillinger
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-deadline" className="block text-sm font-medium mb-1">Påmeldingsfrist:</label>
                  <input 
                    type="datetime-local" 
                    id="signup-deadline"
                    value={signupDeadline}
                    onChange={(e) => setSignupDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light"
                  />
                </div>
                <div>
                  <label htmlFor="tournament-start-date" className="block text-sm font-medium mb-1">Turneringsstart (lørdag):</label>
                  <input 
                    type="date" 
                    id="tournament-start-date"
                    value={tournamentStartDate}
                    onChange={(e) => setTournamentStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light"
                  />
                </div>
                <div>
                  <label htmlFor="match-duration" className="block text-sm font-medium mb-1">Kampvarighet:</label>
                  <select 
                    id="match-duration"
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(parseInt(e.target.value))}
                    className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light"
                  >
                    <option value="12">12 minutter</option>
                    <option value="15">15 minutter</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="num-fields" className="block text-sm font-medium mb-1">Antall baner:</label>
                  <input 
                    type="number" 
                    id="num-fields" 
                    min="1"
                    value={numFields}
                    onChange={(e) => setNumFields(parseInt(e.target.value))}
                    className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light"
                  />
                </div>
                <div>
                  <label htmlFor="start-time" className="block text-sm font-medium mb-1">Halltid start:</label>
                  <input 
                    type="time" 
                    id="start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light"
                  />
                </div>
                <div>
                  <label htmlFor="end-time" className="block text-sm font-medium mb-1">Halltid slutt:</label>
                  <input 
                    type="time" 
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light"
                  />
                </div>
              </div>
              
              {settingsError && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-2">{settingsError}</p>
              )}
              
              <p className="text-sm mt-2 text-slate-600 dark:text-slate-400">
                Turneringen går over lørdag og søndag.
              </p>
              
              <button 
                onClick={handleConfigureSettings}
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Bekreft innstillinger
              </button>
            </section>
            
            {/* Teams list (also shown in organizer tab) */}
            <TeamsList teams={teams} onRemoveTeam={removeTeam} />
          </div>
          
          {/* Schedule tab */}
          <div className={activeTab === 'schedule' ? '' : 'hidden'} role="tabpanel">
            <section className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 fade-in">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
                Kampprogram
              </h2>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {tournamentSettings && signupOpen
                    ? `Kampprogram kan genereres etter påmeldingsfristen (${formatDate(tournamentSettings.signupDeadline)}).`
                    : tournamentSettings && teams.length >= 2
                      ? `Påmeldingsfrist utløpt. ${teams.length} lag påmeldt. Klar til å generere kampprogram.`
                      : tournamentSettings && teams.length < 2
                        ? 'Minst 2 lag må være påmeldt for å generere kampprogram.'
                        : 'Kampprogram genereres etter at påmeldingsfristen er utløpt og lag er påmeldt.'}
                </p>
                
                <button 
                  onClick={handleGenerateSchedule}
                  disabled={!tournamentSettings || signupOpen || teams.length < 2 || isGeneratingSchedule}
                  className="w-full sm:w-auto bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center shadow disabled:opacity-50"
                >
                  {isGeneratingSchedule ? 'Genererer...' : 'Generer kampprogram'}
                </button>
              </div>
              
              {scheduleError && (
                <p className="text-red-500 dark:text-red-400 text-sm mb-4">{scheduleError}</p>
              )}
              
              {schedule.length > 0 ? (
                <ScheduleDisplay 
                  schedule={schedule} 
                  numFields={tournamentSettings?.numFields || 2} 
                />
              ) : (
                <div className="mt-4 border border-gray-300 dark:border-slate-600 rounded-md p-1 sm:p-2 overflow-x-auto">
                  <p className="text-center text-slate-500 dark:text-slate-400 p-4">
                    Generer et kampprogram for å se det her.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      
      {/* Message container */}
      <MessageContainer />
      
      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
};

export default TournamentPlanner; 