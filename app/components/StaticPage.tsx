import Header from './Header';
import Footer from './Footer';

export default function StaticPage(props: { title: string; content: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
        <h1 className="text-2xl font-bold">{props.title}</h1>
        {props.content}
      </div>
      <Footer />
    </div>
  );
}
