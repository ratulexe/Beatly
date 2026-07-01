import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppRoutes from '../routes/AppRoutes';
import FloatingChat from '../components/ai/FloatingChat';

let mockProfile = {
  id: 'user-1',
  displayName: 'Test Listener',
  product: 'premium'
};

const triggerSync = vi.fn();

vi.mock('../hooks/useProfile', () => ({
  useProfile: () => ({
    profile: mockProfile,
    isLoading: false,
    isFetching: false,
    logout: vi.fn(),
  })
}));

vi.mock('../context/SyncContext', () => ({
  useSync: () => ({
    deviceId: 'device-1',
    triggerSync,
    isOnline: true,
    isConnected: true,
    isSyncing: false,
    pendingSyncs: 0,
  })
}));

vi.mock('../components/charts/TimeDistributionChart', () => ({
  TimeDistributionChart: ({ hourlyData }) => (
    <div data-testid="time-distribution-chart">Time chart {hourlyData?.length || 0}</div>
  )
}));

vi.mock('../components/charts/GenreChart', () => ({
  GenreChart: ({ genres }) => (
    <div data-testid="genre-chart">Genre chart {genres?.length || 0}</div>
  )
}));

const apiMocks = vi.hoisted(() => ({
  get: vi.fn((url) => {
    if (url === '/api/discover') {
      return Promise.resolve({
        data: {
          aiPickOfTheDay: null,
          score: null,
          genreMap: [],
          timeline: [],
          forYou: [],
          trending: [],
          smartCollections: []
        }
      });
    }
    if (url.startsWith('/api/leaderboards/global')) {
      return Promise.resolve({ rankings: [] });
    }
    if (url === '/api/achievements' || url === '/api/achievements/progress') {
      return Promise.resolve([]);
    }
    if (url === '/api/devices') {
      return Promise.resolve([]);
    }
    if (url === '/api/wrapped/archive') {
      return Promise.resolve([]);
    }
    return Promise.resolve({ data: [] });
  }),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  patch: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
}));

vi.mock('../services/apiClient', () => ({
  API_BASE_URL: 'http://127.0.0.1:5000',
  SOCKET_BASE_URL: 'http://127.0.0.1:5000',
  api: {
    defaults: { baseURL: 'http://127.0.0.1:5000' },
    get: apiMocks.get,
    post: apiMocks.post,
    patch: apiMocks.patch,
    delete: apiMocks.delete,
  },
  flushOfflineMutations: vi.fn(() => Promise.resolve({ flushed: 0, pending: 0 })),
  getPendingMutationCount: vi.fn(() => Promise.resolve(0)),
}));

vi.mock('../services/api/analyticsApi', () => ({
  analyticsApi: {
    getOverview: vi.fn(() => Promise.resolve({
      data: {
        listening: {
          totalMs: 0,
          totalSongs: 0,
          uniqueArtists: 0,
          uniqueAlbums: 0,
        }
      }
    })),
    getDailyStats: vi.fn(() => Promise.resolve({ data: [] })),
    getTopArtists: vi.fn(() => Promise.resolve({ data: [] })),
    getTopTracks: vi.fn(() => Promise.resolve({ data: [] })),
    getTopAlbums: vi.fn(() => Promise.resolve({ data: [] })),
    getGenres: vi.fn(() => Promise.resolve({ data: [] })),
    getTimeInsights: vi.fn(() => Promise.resolve({ data: { hourly: [], periods: {} } })),
  }
}));

vi.mock('../services/api/aiApi', () => ({
  aiApi: {
    getInsights: vi.fn(() => Promise.resolve({ data: [] })),
    getRecommendations: vi.fn(() => Promise.resolve({ data: [] })),
    getPersonality: vi.fn(() => Promise.resolve({ data: null })),
    getPredictions: vi.fn(() => Promise.resolve({ data: [] })),
    streamChat: vi.fn(() => Promise.resolve()),
  }
}));

vi.mock('../services/api/coachApi', () => ({
  coachApi: {
    getDashboard: vi.fn(() => Promise.resolve({
      data: {
        userId: 'user-1',
        streak: 0,
        longestStreak: 0,
        songsToday: 0,
        xp: 0,
        level: 1,
        nextLevelXp: 100,
        goals: [],
        habits: [],
        aiSuggestion: null
      }
    })),
    getCalendar: vi.fn(() => Promise.resolve({ data: [] })),
    getChallenges: vi.fn(() => Promise.resolve({ data: [] })),
    joinChallenge: vi.fn(() => Promise.resolve({ data: {} })),
  }
}));

const renderRoute = (path) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('critical route rendering and lazy-load safety', () => {
  beforeEach(() => {
    mockProfile = {
      id: 'user-1',
      displayName: 'Test Listener',
      product: 'premium'
    };
    Element.prototype.scrollIntoView = vi.fn();
    apiMocks.get.mockClear();
    triggerSync.mockClear();
  });

  it('redirects protected routes to login when there is no authenticated profile', async () => {
    mockProfile = null;

    renderRoute('/dashboard');

    expect(await screen.findByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Spotify/i })).toBeInTheDocument();
  });

  it.each([
    ['/dashboard', 'text', /Total Listening Time/i],
    ['/analytics', 'text', /Deep dive into your listening habits/i],
    ['/wrapped', 'text', /Generate Your/i],
    ['/discover', 'placeholder', /Search Artists, Albums, Genres/i],
    ['/coach', 'text', /Active Goals/i],
    ['/ai', 'text', /Beatly Intelligence/i],
    ['/leaderboard', 'text', /Global Leaderboard/i],
    ['/achievements', 'text', /Achievements will appear/i],
    ['/settings/devices', 'heading', /Connected Devices/i],
  ])('renders %s without crashing on empty real-data responses', async (path, queryType, expectedText) => {
    renderRoute(path);

    const element = queryType === 'placeholder'
      ? await screen.findByPlaceholderText(expectedText, {}, { timeout: 8000 })
      : queryType === 'heading'
        ? await screen.findByRole('heading', { name: expectedText }, { timeout: 8000 })
      : await screen.findByText(expectedText, {}, { timeout: 8000 });
    expect(element).toBeInTheDocument();
  }, 10000);

  it('renders route-level error states when API data fails', async () => {
    apiMocks.get.mockImplementation((url) => {
      if (url === '/api/devices') return Promise.reject(new Error('Devices unavailable'));
      return Promise.resolve([]);
    });

    renderRoute('/settings/devices');

    expect(await screen.findByText(/Failed to load devices/i, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/could not load your connected devices/i)).toBeInTheDocument();
  });

  it('opens the lazy-loaded floating AI panel without a runtime import error', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <FloatingChat />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Message Beatly AI/i)).toBeInTheDocument();
    });
  });
});
