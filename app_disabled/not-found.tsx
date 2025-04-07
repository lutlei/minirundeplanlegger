import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
      <h1 className="text-4xl font-bold text-purple-500 mb-4">404 - App Router Not Found</h1>
      <p className="mb-6 text-gray-600">This 404 page is from the App Router.</p>
      <div className="space-y-4">
        <p className="font-semibold">Try these links instead:</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/landing" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Landing Page
          </Link>
          <Link 
            href="/planner" 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go to Planner
          </Link>
        </div>
      </div>
      <div className="mt-8 p-4 bg-yellow-100 rounded-lg max-w-md">
        <p className="text-sm text-yellow-800">
          <strong>Debug Info:</strong> This site is using both Pages Router and App Router,
          which can cause routing conflicts. This is the App Router's 404 page.
        </p>
      </div>
    </div>
  );
} 