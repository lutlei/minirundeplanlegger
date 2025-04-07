import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const PlannerPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Turneringsplanlegger | Minirundeplanlegger</title>
        <meta name="description" content="Planlegg din egen minirunde med vår enkle turneringsplanlegger" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen p-6">
        <header className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Tilbake til forsiden
          </Link>
          <h1 className="text-3xl font-bold mt-4">Turneringsplanlegger</h1>
        </header>
        
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="text-center p-10">
            <h2 className="text-2xl font-semibold mb-4">Demo-versjon</h2>
            <p className="mb-6">
              Dette er en forenklet demo-versjon av Minirundeplanlegger for Vercel-deployment.
              Den fulle versjonen inkluderer alle funksjonene beskrevet i README.
            </p>
            <Link 
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Tilbake til forsiden
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default PlannerPage; 