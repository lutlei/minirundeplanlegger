import React from 'react';
import { Team } from '@/lib/tournamentUtils';

interface TeamsListProps {
  teams: Team[];
  onRemoveTeam: (id: number) => void;
}

const TeamsList: React.FC<TeamsListProps> = ({ teams, onRemoveTeam }) => {
  return (
    <section className="mb-8 p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 fade-in">
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
              teams.map(team => (
                <tr key={team.id} className="hover:bg-slate-100 dark:hover:bg-slate-600">
                  <td className="px-4 py-2 text-sm">{team.name}</td>
                  <td className="px-4 py-2 text-sm">{team.category}</td>
                  <td className="px-4 py-2 text-sm">
                    <button 
                      className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                      onClick={() => onRemoveTeam(team.id)}
                      aria-label={`Fjern lag ${team.name}`}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TeamsList; 