import React from 'react';
import TournamentPlanner from '@/components/TournamentPlanner';
import Head from 'next/head';

const PlannerPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Turneringsplanlegger | Minirundeplanlegger</title>
        <meta name="description" content="Planlegg din turnering med Minirundeplanlegger" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
        <TournamentPlanner />
      </main>
    </>
  );
};

export default PlannerPage; 