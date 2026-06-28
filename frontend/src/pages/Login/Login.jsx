import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      if (err === 'state_mismatch') setError('Authentication failed due to state mismatch. Please try again.');
      else if (err === 'invalid_token') setError('Failed to exchange code for token. Please try again.');
      else setError('An error occurred during authentication.');
    }
  }, [searchParams]);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = 'http://localhost:5000/api/auth/login';
  };

  return (
    <PageContainer>
      <div className="max-w-md mx-auto bg-beatly-surface p-8 rounded-2xl text-center">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        {error && (
          <div className="mb-6 p-3 bg-beatly-error/20 text-beatly-error rounded-md text-sm">
            {error}
          </div>
        )}

        <Button onClick={handleLogin} disabled={loading}>
          {loading ? 'Connecting...' : 'Continue with Spotify'}
        </Button>
      </div>
    </PageContainer>
  );
}
