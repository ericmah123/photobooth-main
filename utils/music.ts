/**
 * Music utility for playing background music
 * Place MP3 files in the /music folder and import them here
 */

// Import music files
import oldWithYou from '../music/grentperez - Old With You (Mini Music Video) - grentperez (youtube).mp3';

// Add all music files to this array
const MUSIC_PLAYLIST = [
  oldWithYou,
  // Add more songs here as you import them:
  // import song2 from '../music/song2.mp3';
  // song2,
];

/**
 * Gets a random song from the playlist
 */
export const getRandomSong = (): string => {
  if (MUSIC_PLAYLIST.length === 0) {
    throw new Error('No songs in playlist');
  }
  const randomIndex = Math.floor(Math.random() * MUSIC_PLAYLIST.length);
  return MUSIC_PLAYLIST[randomIndex];
};

/**
 * Gets all songs in the playlist
 */
export const getAllSongs = (): string[] => {
  return MUSIC_PLAYLIST;
};

