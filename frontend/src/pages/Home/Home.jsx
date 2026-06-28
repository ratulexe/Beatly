import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <h1 className="text-4xl font-extrabold mb-4">Beatly</h1>
      <p className="text-beatly-text-sec mb-8">Understand Your Music Like Never Before.</p>
      <Button onClick={() => navigate('/login')}>Get Started</Button>
    </PageContainer>
  );
}
