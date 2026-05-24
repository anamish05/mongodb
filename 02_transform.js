db = db.getSiblingDB('spotify');

db.tracks.drop();

//  Трансформація та проєкція за допомогою конвеєра агрегації
print("Запуск трансформації даних з tracks_raw у tracks...");

db.tracks_raw.aggregate([
  {
    $project: {
      _id: 0, // Прибираємо оригінальний ID, MongoDB згенерує новий для нової колекції
      track_id: 1,
      track_name: 1,
      album_name: 1,
      explicit: 1,
      popularity: 1,
      duration_ms: 1,
      track_genre: 1,

      artists: {
        $map: {
          input: { $split: [ "$artists", ";" ] },
          as: "artist",
          in: { $trim: { input: "$$artist" } }
        }
      },

      audio_features: {
        danceability: "$danceability",
        energy: "$energy",
        loudness: "$loudness",
        speechiness: "$speechiness",
        acousticness: "$acousticness",
        instrumentalness: "$instrumentalness",
        liveness: "$liveness",
        valence: "$valence",
        tempo: "$tempo",
        key: "$key",
        mode: "$mode",
        time_signature: "$time_signature"
      },

      duration_sec: { 
        $round: [ { $divide: [ "$duration_ms", 1000 ] }, 1 ] 
      },

      popularity_tier: {
        $cond: {
          if: { $gte: [ "$popularity", 70 ] },
          then: "high",
          else: {
            $cond: {
              if: { $gte: [ "$popularity", 40 ] },
              then: "medium",
              else: "low"
            }
          }
        }
      }
     
    }
  },
  {
    // Зберігаємо результат виконання цього кроку у нову колекцію tracks
    $out: "tracks"
  }
]);

print("\nCheck result:");
const totalDocs = db.tracks.countDocuments({});
print("Number of documents in collection tracks:", totalDocs);

print("\nExemple of a document:");
const sampleDoc = db.tracks.findOne();
printjson(sampleDoc);