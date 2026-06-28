import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Artist } from '../src/database/index.js';
import { getMultipleArtists } from '../src/services/spotify/spotifyArtist.service.js';
import connectDatabase from '../src/config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function backfill() {
  try {
    await connectDatabase();
    console.log('Connected to DB');

    const user = await User.findOne({});
    if (!user) {
      console.log('No user found');
      process.exit(1);
    }

    const missingArtists = await Artist.find({ image: null }).select('spotifyArtistId name').lean();
    console.log(`Found ${missingArtists.length} artists missing images.`);

    if (missingArtists.length === 0) {
      console.log('No artists missing images!');
      process.exit(0);
    }

    // Filter out invalid or local artists that don't have a spotify ID
    const missingIds = missingArtists.map(a => a.spotifyArtistId).filter(id => id && !id.includes('local'));
    console.log(`Filtered down to ${missingIds.length} valid Spotify IDs.`);
    
    let updatedCount = 0;

    for (let i = 0; i < missingIds.length; i += 50) {
      const chunk = missingIds.slice(i, i + 50);
      console.log(`Fetching chunk ${i} to ${i + chunk.length}...`);
      
      try {
        const fullArtists = await getMultipleArtists(user, chunk);
        
        const bulkOps = fullArtists.map(full => ({
          updateOne: {
            filter: { spotifyArtistId: full.id },
            update: {
              $set: {
                image: full.images?.[0]?.url || null,
                genres: full.genres || [],
                followers: full.followers?.total || 0,
                popularity: full.popularity || 0,
              }
            }
          }
        }));

        if (bulkOps.length > 0) {
          const result = await Artist.bulkWrite(bulkOps, { ordered: false });
          updatedCount += result.modifiedCount;
          console.log(`Updated ${result.modifiedCount} artists in this chunk.`);
        }
      } catch (err) {
        console.error(`Error in chunk ${i}:`, err.message || err);
      }
    }

    console.log(`Finished! Successfully updated ${updatedCount} artists.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  }
}

backfill();
