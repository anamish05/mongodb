
db = db.getSiblingDB('spotify');

print("-------Task 1 results: ")
// task 1 
printjson(
  db.tracks.aggregate([
    {
      // unwind artists
      $unwind: "$artists"
    },
    {
      // group by artist
      $group: {
        _id: "$artists",
        total_tracks: { $sum: 1 },
        avg_popularity: { $avg: "$popularity" }
      }
    },
    {
      // filter those with less than 5 tracks
      $match: {
        total_tracks: { $gte: 5 }
      }
    },
    {
      $project: {
        _id: 0,
        artist_name: "$_id",
        avg_popularity: { $round: ["$avg_popularity", 1] }
      }
    },
    {
      // sort
      $sort: {
        avg_popularity: -1
      }
    },
    {
      $limit: 5
    }
  ]).toArray()
);

// task 2
print("-------Task 2 results: ")

printjson(
  db.tracks.aggregate([
    {
      // classifying tracks by mood
      $project: {
        mood: {
          $cond: {
            if: { $gte: ["$audio_features.valence", 0.5] },
            then: {
              $cond: {
                if: { $gte: ["$audio_features.energy", 0.5] },
                then: "happy",
                else: "calm"
              }
            },
            else: {
              $cond: {
                if: { $gte: ["$audio_features.energy", 0.5] },
                then: "angry",
                else: "sad"
              }
            }
          }
        }
      }
    },
    {
      //  group by mood
      $group: {
        _id: "$mood",
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        mood: "$_id",
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]).toArray()
);

// task 3
print("-------Task 3 results: ")

printjson(
  db.tracks.aggregate([
    {
      // group by genre and calc features
      $group: {
        _id: "$track_genre",
        total_tracks: { $sum: 1 },
        avg_danceability: { $avg: "$audio_features.danceability" },
        avg_energy: { $avg: "$audio_features.energy" },
        avg_valence: { $avg: "$audio_features.valence" }
      }
    },
    {
      // filter statistically significant
      $match: {
        total_tracks: { $gte: 100 }
      }
    },
    {
      
      $project: {
        _id: 0,
        genre: "$_id",
        total_tracks: 1,
        avg_danceability: { $round: ["$avg_danceability", 3] },
        avg_energy: { $round: ["$avg_energy", 3] },
        avg_valence: { $round: ["$avg_valence", 3] }
      }
    },
    {
      // sort
      $sort: {
        avg_danceability: -1
      }
    },
    {
      $limit: 5
    }
  ]).toArray()
);