export default function CatchAll() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          404
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Page not found
        </p>
        <a
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
} 