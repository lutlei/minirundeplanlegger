import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const LandingPage: React.FC = () => {
  const router = useRouter();
  
  const handleStart = () => {
    router.push('/planner');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-500 to-blue-700 text-white">
      {/* Header */}
      <header className="py-6 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">Minirundeplanlegger</span>
        </div>
      </header>
      
      {/* Hero section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-4 md:px-8 py-12">
        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Planlegg din minirunde enkelt og effektivt
          </h1>
          <p className="text-xl mb-8">
            Med Minirundeplanlegger kan du raskt opprette kampprogram, 
            administrere lag og holde oversikt over hele turneringen din.
          </p>
          <ul className="mb-8 space-y-2">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Automatisk kampoppsett med puljer
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Håndtering av påmelding med kategorier
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI-assistert planlegging og hjelp
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Filtrerbare kampprogrammer og utskriftsvisning
            </li>
          </ul>
          <button 
            onClick={handleStart}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            Start planlegging
          </button>
        </div>
        
        <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-xl">
          <div className="w-full h-64 bg-gray-200 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <svg className="w-20 h-20 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-600 text-sm">
                Skjermbilde av kampplanleggeren
              </p>
            </div>
          </div>
          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-800 text-sm italic">
              "Minirundeplanleggeren har gjort det mye enklere for oss å organisere helgeturneringer. 
              Vi sparer flere timer på planleggingen, og alle lag får en rettferdig og balansert kampplan."
            </p>
            <p className="text-gray-600 text-sm mt-2">
              — Tore Hansen, Turneringsleder
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-4 md:px-8 bg-blue-900 text-blue-200 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p>© 2024 Minirundeplanlegger. Alle rettigheter reservert.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="hover:text-white">Personvern</a>
            <a href="#" className="hover:text-white">Vilkår</a>
            <a href="#" className="hover:text-white">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 