import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SyncFreshnessBadge from '../components/sync/SyncFreshnessBadge';
import {
  resetAppOpenSpotifySyncGuardForTests,
  useAppOpenSpotifySync
} from '../hooks/useAppOpenSpotifySync';
import { useSyncTracks } from '../hooks/useSyncTracks';

const trackApiMocks = vi.hoisted(() => ({
  getSyncStatus: vi.fn(),
  syncTracks: vi.fn()
}));

vi.mock('../services/api/trackApi', () => ({
  trackApi: trackApiMocks
}));

const renderWithClient = (ui, client = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})) => render(
  <QueryClientProvider client={client}>
    {ui}
  </QueryClientProvider>
);

const AppOpenHarness = () => {
  useAppOpenSpotifySync();
  return <div>app open</div>;
};

const ManualSyncHarness = () => {
  const syncMutation = useSyncTracks();
  return (
    <button onClick={() => syncMutation.mutate()}>
      {syncMutation.isPending ? 'Syncing' : 'Manual Sync'}
    </button>
  );
};

describe('Spotify sync freshness UI and app-open sync', () => {
  beforeEach(() => {
    vi.useRealTimers();
    resetAppOpenSpotifySyncGuardForTests();
    trackApiMocks.getSyncStatus.mockReset();
    trackApiMocks.syncTracks.mockReset();
    trackApiMocks.syncTracks.mockResolvedValue({ newTracks: 1, duplicates: 0 });
  });

  it('renders fresh state', async () => {
    trackApiMocks.getSyncStatus.mockResolvedValue({
      dataFreshness: 'fresh',
      lastSuccessfulSyncAt: new Date().toISOString(),
      isSyncing: false
    });

    renderWithClient(<SyncFreshnessBadge />);

    expect(await screen.findByText(/Listening data is fresh/i)).toBeInTheDocument();
  });

  it('renders stale state', async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    trackApiMocks.getSyncStatus.mockResolvedValue({
      dataFreshness: 'stale',
      lastSuccessfulSyncAt: thirtyMinutesAgo,
      isSyncing: false
    });

    renderWithClient(<SyncFreshnessBadge />);

    expect(await screen.findByText(/Last synced 30 minutes ago/i)).toBeInTheDocument();
  });

  it('renders failed state', async () => {
    trackApiMocks.getSyncStatus.mockResolvedValue({
      dataFreshness: 'failed',
      lastFailedSyncAt: new Date().toISOString(),
      lastSyncError: 'Spotify unavailable',
      isSyncing: false
    });

    renderWithClient(<SyncFreshnessBadge />);

    expect(await screen.findByText(/Last Spotify sync failed/i)).toBeInTheDocument();
  });

  it('does not run app-open sync when data is fresh', async () => {
    trackApiMocks.getSyncStatus.mockResolvedValue({
      dataFreshness: 'fresh',
      lastSuccessfulSyncAt: new Date().toISOString(),
      isSyncing: false
    });

    renderWithClient(<AppOpenHarness />);

    await waitFor(() => expect(trackApiMocks.getSyncStatus).toHaveBeenCalledTimes(1));
    expect(trackApiMocks.syncTracks).not.toHaveBeenCalled();
  });

  it('runs app-open sync when data is stale', async () => {
    trackApiMocks.getSyncStatus.mockResolvedValue({
      dataFreshness: 'stale',
      lastSuccessfulSyncAt: '2026-01-01T10:00:00.000Z',
      isSyncing: false
    });

    renderWithClient(<AppOpenHarness />);

    await waitFor(() => expect(trackApiMocks.syncTracks).toHaveBeenCalledTimes(1));
  });

  it('does not run duplicate app-open sync requests', async () => {
    let resolveStatus;
    trackApiMocks.getSyncStatus.mockReturnValue(new Promise((resolve) => {
      resolveStatus = resolve;
    }));

    renderWithClient(
      <>
        <AppOpenHarness />
        <AppOpenHarness />
      </>
    );

    resolveStatus({
      dataFreshness: 'stale',
      lastSuccessfulSyncAt: '2026-01-01T10:00:00.000Z',
      isSyncing: false
    });

    await waitFor(() => expect(trackApiMocks.syncTracks).toHaveBeenCalledTimes(1));
  });

  it('manual sync still calls Spotify sync', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    renderWithClient(<ManualSyncHarness />, queryClient);
    fireEvent.click(screen.getByRole('button', { name: /Manual Sync/i }));

    await waitFor(() => expect(trackApiMocks.syncTracks).toHaveBeenCalledTimes(1));
  });
});
