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

  useEffect(() => {
    const fetchProgram = async (id: string) => {
      const program = await getProgramById(id);
      setProgram(program);
    };
    if (id) {
      fetchProgram(id);
    }
  }, [id]);
  if (!program) {
    navigate('/explore');
    return null;
  }

  return (
    <PageLayout fullHeight={false}>
      <ProgramDetails
        programId={program.program_id}
        title={program.title}
        description={program.description}
        logoUrl={program.logo_url}
      />
    </PageLayout>
  );
}
