export class SpotifyApiError extends Error {
  constructor(message, status, retryAfter = null) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.retryAfter = retryAfter;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class SpotifyAuthenticationError extends SpotifyApiError {
  constructor(message = 'Spotify authentication failed', status = 401) {
    super(message, status);
  }
}

export class SpotifyRateLimitError extends SpotifyApiError {
  constructor(message = 'Spotify rate limit exceeded', retryAfter = 1) {
    super(message, 429, retryAfter);
  }
}

export class SpotifyServerError extends SpotifyApiError {
  constructor(message = 'Spotify server error', status = 500) {
    super(message, status);
  }
}

export class SpotifyValidationError extends SpotifyApiError {
  constructor(message = 'Invalid parameters sent to Spotify') {
    super(message, 400);
  }
}
