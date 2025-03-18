import { useParams } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import { PageLayout } from './ui/layout';
import InspirationDetails from './InspirationDetails';
export default function Inspiration() {
  const { id } = useParams();

  return (
    <>
      <Header />
      <PageLayout fullHeight={false}>{id && <InspirationDetails inspirationId={id} />}</PageLayout>
      <Footer />
    </>
  );
}
