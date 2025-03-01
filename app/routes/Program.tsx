import { useParams, useNavigate } from 'react-router';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import ProgramDetail from '~/components/ProgramDetail';

// Mock data - in a real app, this would come from a database or API
const programsData = [
  {
    id: 1,
    title: 'Cooking Master',
    description: 'Learn cooking techniques from professional chefs and discover new recipes.',
    logoText: 'CM',
    logoUrl: undefined,
  },
  {
    id: 2,
    title: 'Home Design',
    description: 'Transform your living space with expert interior design tips and inspiration.',
    logoText: 'HD',
    logoUrl: undefined,
  },
  {
    id: 3,
    title: 'Fitness Journey',
    description: 'Get fit with personalized workout routines and nutrition advice.',
    logoText: 'FJ',
    logoUrl: undefined,
  },
  {
    id: 4,
    title: 'Travel Diaries',
    description: 'Explore the world through curated travel experiences and destination guides.',
    logoText: 'TD',
    logoUrl: undefined,
  },
  {
    id: 5,
    title: 'Tech Innovations',
    description: 'Stay updated with the latest technology trends and product reviews.',
    logoText: 'TI',
    logoUrl: undefined,
  },
  {
    id: 6,
    title: 'Fashion Forward',
    description: 'Discover the latest fashion trends and style tips from industry experts.',
    logoText: 'FF',
    logoUrl: undefined,
  },
];

export default function ProgramPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const programId = parseInt(id || '1');
  const program = programsData.find(p => p.id === programId);

  if (!program) {
    // If program not found, redirect to explore page
    navigate('/explore');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow w-full">
        <div className="px-4 py-6 sm:px-0 w-full">
          <ProgramDetail
            id={program.id}
            title={program.title}
            description={program.description}
            logoText={program.logoText}
            logoUrl={program.logoUrl}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
