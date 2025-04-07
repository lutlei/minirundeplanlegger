"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AssistantProvider } from '@/contexts/AssistantContext';
import ChatInterface from '@/components/assistants/ChatInterface';

interface Team {
  id: number;
  name: string;
  category: string;
}

export default function SignupPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [category, setCategory] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState('');
  const [signupOpen, setSignupOpen] = useState(false);
  const [deadlineInfo, setDeadlineInfo] = useState('Påmelding er stengt. Vennligst konfigurer innstillinger først.');
  const [nextTeamId, setNextTeamId] = useState(1);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    // In a real app, this would fetch the tournament settings and team list from the API
    const mockSettings = { 
      signupDeadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) 
    };
    
    if (mockSettings) {
      setSignupOpen(true);
      setDeadlineInfo(`Påmelding stenger: ${formatDate(mockSettings.signupDeadline)}`);
    }
    
    // Mock teams data
    const mockTeams = [
      { id: 1, name: 'Rosenborg Mikro', category: 'Mikro' },
      { id: 2, name: 'Ranheim Mini', category: 'Mini' },
      { id: 3, name: 'Trondheims-Ørn Lillegutt', category: 'Lillegutt/jente' }
    ];
    
    setTeams(mockTeams);
    setNextTeamId(mockTeams.length + 1);
  }, []);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleSignup = () => {
    setError('');
    
    if (!signupOpen) {
      setError('Påmeldingsperioden er stengt eller ikke konfigurert.');
      return;
    }
    
    if (!teamName.trim()) {
      setError('Lagnavn kan ikke være tomt.');
      return;
    }
    
    if (!category) {
      setError('Vennligst velg alderskategori.');
      return;
    }
    
    if (teams.some(team => team.name.toLowerCase() === teamName.toLowerCase())) {
      setError('Et lag med dette navnet finnes allerede.');
      return;
    }
    
    const newTeam = { id: nextTeamId, name: teamName, category };
    setTeams([...teams, newTeam]);
    setNextTeamId(nextTeamId + 1);
    setTeamName('');
    setCategory('');
    
    // In a real app, this would send the team data to the API
    setTimeout(() => {
      alert(`Lag "${teamName}" ble påmeldt!`);
    }, 100);
  };

  const removeTeam = (teamId: number) => {
    setTeams(teams.filter(team => team.id !== teamId));
    
    // In a real app, this would send a delete request to the API
    setTimeout(() => {
      alert('Lag fjernet.');
    }, 100);
  };

  return (
    <AssistantProvider initialAssistantType="sports">
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans p-4 md:p-8 transition-colors duration-300">
        <div className="container relative mx-auto max-w-4xl bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
          <button 
            onClick={toggleDarkMode}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 z-20"
            aria-label={darkMode ? "Bytt til lyst modus" : "Bytt til mørkt modus"}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Image 
                src="https://bandyforbundet.no/midt-norge-bandyregion/wp-content/uploads/sites/9/2021/06/cropped-midtnorge.png" 
                alt="Midt-Norge Bandyregion Logo" 
                width={40}
                height={40}
                className="h-10 w-auto mr-3"
              />
              <h1 className="text-2xl font-bold text-primary-dark dark:text-primary">Minirunder - påmelding og arrangering</h1>
            </div>
          </div>

          <div className="mb-4 border-b border-slate-300 dark:border-slate-600">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <Link 
                href="/app/signup" 
                className="tab-button active-tab"
              >
                Påmelding & Info
              </Link>
              <Link 
                href="/app/organizer" 
                className="tab-button inactive-tab"
              >
                Arrangør
              </Link>
              <Link 
                href="/app/schedule" 
                className="tab-button inactive-tab"
              >
                Kampprogram
              </Link>
            </nav>
          </div>

          <section className="mb-8 p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
              <span className="mr-2">📋</span> Lagpåmelding
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="team-name" className="block text-sm font-medium mb-1">Lagnavn:</label>
                <input 
                  type="text" 
                  id="team-name" 
                  name="team-name" 
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Skriv inn lagnavn"
                  className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:bg-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="age-category" className="block text-sm font-medium mb-1">Alderskategori:</label>
                <select 
                  id="age-category" 
                  name="age-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:bg-slate-600 dark:text-white"
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
                  className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">📋</span>Meld på lag
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mb-2">{error}</p>}
            <p className="text-sm mb-4 text-slate-600 dark:text-slate-400">{deadlineInfo}</p>
          </section>

          <section className="mb-8 p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-2">
              Påmeldte lag ({teams.length})
            </h3>
            <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-slate-600 rounded-md">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-600">
                <thead className="bg-slate-100 dark:bg-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Lagnavn
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Handlinger
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-700 divide-y divide-slate-200 dark:divide-slate-600">
                  {teams.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400">
                        Ingen lag påmeldt ennå.
                      </td>
                    </tr>
                  ) : (
                    teams.map((team) => (
                      <tr key={team.id} className="hover:bg-slate-100 dark:hover:bg-slate-600">
                        <td className="px-4 py-2 text-sm">{team.name}</td>
                        <td className="px-4 py-2 text-sm">{team.category}</td>
                        <td className="px-4 py-2 text-sm">
                          <button 
                            onClick={() => removeTeam(team.id)} 
                            className="text-accent hover:text-accent-dark dark:text-amber-400 dark:hover:text-amber-300"
                          >
                            <span>❌</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        
        {/* Chat Assistant */}
        <ChatInterface />
      </div>
    </AssistantProvider>
  );
} 