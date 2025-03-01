export default function Footer() {
  return (
    <footer className="bg-white shadow w-full mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-xs mb-2 md:mb-0">&copy; 2025 Insbay</div>
          <div className="flex space-x-6">
            <a href="/terms-and-conditions" className="text-gray-500 hover:text-gray-700 text-xs">
              Terms & Conditions
            </a>
            <a href="/privacy-policy" className="text-gray-500 hover:text-gray-700 text-xs">
              Privacy Policy
            </a>
            <a href="/about-us" className="text-gray-500 hover:text-gray-700 text-xs">
              About Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
