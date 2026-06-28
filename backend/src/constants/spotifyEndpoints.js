export const SPOTIFY_ENDPOINTS = {
  // User Profile
  CURRENT_USER: '/me',
  
  // Player & History
  RECENTLY_PLAYED: '/me/player/recently-played',
  CURRENTLY_PLAYING: '/me/player/currently-playing',
  
  // Personalization
  TOP_TRACKS: '/me/top/tracks',
  TOP_ARTISTS: '/me/top/artists',
  
  // Library
  SAVED_TRACKS: '/me/tracks',
  SAVED_ALBUMS: '/me/albums',
  
  // Playlists
  CURRENT_USER_PLAYLISTS: '/me/playlists',
  PLAYLIST_TRACKS: (playlistId) => `/playlists/${playlistId}/tracks`,
  
  // Catalog
  TRACK: (trackId) => `/tracks/${trackId}`,
  TRACKS: '/tracks',
  ARTIST: (artistId) => `/artists/${artistId}`,
  ARTISTS: '/artists',
  ARTIST_TOP_TRACKS: (artistId) => `/artists/${artistId}/top-tracks`,
  ALBUM: (albumId) => `/albums/${albumId}`,
  ALBUMS: '/albums',
  
  // Audio Features
  AUDIO_FEATURES: '/audio-features',
  AUDIO_ANALYSIS: (trackId) => `/audio-analysis/${trackId}`
};
