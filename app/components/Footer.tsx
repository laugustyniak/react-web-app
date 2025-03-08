export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow w-full mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 py-4">
          <div className="text-gray-500 dark:text-gray-400 text-sm md:text-xs w-full text-center md:text-left">
            &copy; 2025 Insbuy
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:space-x-6 w-full">
            <a
              href="#/terms-and-conditions"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm md:text-xs py-1"
            >
              Terms & Conditions
            </a>
            <a
              href="#/privacy-policy"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm md:text-xs py-1"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
