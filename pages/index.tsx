import React from 'react';
import Head from 'next/head';
import LandingPage from '../components/LandingPage';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Turneringsplanlegger</title>
        <meta name="description" content="Planlegg din egen turnering med vår enkle planlegger." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col">
        <LandingPage />
      </main>
    </>
  );
};

export default Home; 