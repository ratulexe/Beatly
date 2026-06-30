export const validateEnv = () => {
  const requiredVariables = [
    'MONGODB_URI',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'SESSION_SECRET',
    'FRONTEND_URL',
    'NODE_ENV',
    'CACHE_DRIVER'
  ];

  const missingVariables = requiredVariables.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingVariables.length > 0) {
    console.error('❌ Environment Validation Failed!');
    console.error(`Missing required environment variables: ${missingVariables.join(', ')}`);
    console.error('Please check your .env file.');
    process.exit(1);
  }

  // Validate specific values if needed
  if (!['memory', 'redis'].includes(process.env.CACHE_DRIVER)) {
    console.error('❌ Environment Validation Failed!');
    console.error(`Invalid CACHE_DRIVER: ${process.env.CACHE_DRIVER}. Must be 'memory' or 'redis'.`);
    process.exit(1);
  }
};
