import React from 'react';
import LandingPage from '@/components/LandingPage';
import Head from 'next/head';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Minirundeplanlegger</title>
        <meta name="description" content="Planlegg din egen minirunde med vår enkle turneringsplanlegger" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LandingPage />
    </>
  );
};

export default Home; 