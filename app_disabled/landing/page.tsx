import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Velkommen til Minirundeplanlegger</h1>
      <p className="text-xl mb-8">En enkel og effektiv måte å planlegge fotballturneringer på</p>
      
      <div className="space-y-4">
        <Link 
          href="/planner" 
          className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start planlegging
        </Link>
        
        <div className="text-sm text-gray-500 mt-10">
          Dette er landing-siden fra App Router
        </div>
      </div>
    </div>
  );
} 