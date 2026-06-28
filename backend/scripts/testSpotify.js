import dotenv from 'dotenv';
import { getAccessToken } from '../src/services/spotify/tokenManager.js';
import { User } from '../src/database/index.js';
import connectDatabase from '../src/config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function test() {
  try {
    await connectDatabase();
    const user = await User.findOne({});
    const token = await getAccessToken(user);
    
    console.log('Got token:', token ? 'yes' : 'no');
    
    // ... inside test() after token ...
    const missingArtists = await Artist.find({ image: null }).select('spotifyArtistId').limit(50).lean();
    const missingIds = missingArtists.map(a => a.spotifyArtistId).filter(id => id); // filter out falsy just in case
    console.log(`Testing chunk of ${missingIds.length} ids`);
    
    try {
      const res = await axios.get('https://api.spotify.com/v1/artists', {
        headers: { Authorization: `Bearer ${token}` },
        params: { ids: missingIds.join(',') }
      });
      console.log('Success, artists returned:', res.data.artists?.length);
    } catch (e) {
      console.log('Error from Spotify:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();
