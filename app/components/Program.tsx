import { useParams, useNavigate } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import ProgramDetail from './ProgramDetail';
import { PageLayout } from './ui/layout';

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

export default function Program() {
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
    <>
      <Header />
      <PageLayout fullHeight={false}>
        <ProgramDetail
          id={program.id}
          title={program.title}
          description={program.description}
          logoText={program.logoText}
          logoUrl={program.logoUrl}
        />
      </PageLayout>
      <Footer />
    </>
  );
}
