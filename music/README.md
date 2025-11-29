# Music Folder

Place your MP3 files in this folder to have them randomly play when the secret message is opened.

## How to Add More Songs

1. **Add MP3 files** to this `music/` folder
2. **Open `utils/music.ts`**
3. **Import the new song** at the top:
   ```typescript
   import newSong from '../music/your-song-name.mp3';
   ```
4. **Add it to the playlist array**:
   ```typescript
   const MUSIC_PLAYLIST = [
     oldWithYou,
     newSong,  // Add your new song here
   ];
   ```

## Current Songs

- `grentperez - Old With You (Mini Music Video) - grentperez (youtube).mp3`

## How It Works

- When the bouncing cat is clicked, a random song from the playlist will play
- The song loops continuously while the message is open
- The song stops when the message is closed
- Volume is set to 50% by default

## Notes

- Only MP3 files are supported
- Make sure file names don't have special characters that might cause issues
- The music will play in the background while reading the message

