import { useParams, useNavigate } from 'react-router';
import type { Program } from '~/lib/dataTypes';
import ProgramDetails from './ProgramDetails';
import { PageLayout } from './ui/layout';
import { getProgramById } from '~/lib/firestoreService';
import { useEffect } from 'react';
import { useState } from 'react';

export default function Program() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgram = async (id: string) => {
      try {
        setLoading(true);
        const program = await getProgramById(id);
        if (program) {
          setProgram(program);
        } else {
          navigate('/explore');
        }
      } catch (error) {
        console.error('Error fetching program:', error);
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProgram(id);
    } else {
      navigate('/explore');
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <PageLayout fullHeight={false}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (!program) {
    return null;
  }

  return (
    <PageLayout fullHeight={false}>
      <ProgramDetails
        programId={program.id}
        title={program.title}
        description={program.description}
        logoUrl={program.logo_url}
      />
    </PageLayout>
  );
}
