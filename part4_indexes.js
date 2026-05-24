db = db.getSiblingDB('spotify');

// task1
const explain = db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats");

printjson(explain.executionStats);

print("Optimal index by ESR");

const indexName = db.tracks.createIndex({
  "track_genre": 1,
  "popularity": -1,
  "audio_features.danceability": 1
});

print("indexes of tracks:");
printjson(db.tracks.getIndexes());

const explainAfter = db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats");

printjson(explainAfter.executionStats);

// task 2

const indexwork = db.tracks.createIndex({
  "explicit": 1,
  "audio_features.instrumentalness": 1,
  "audio_features.speechiness": 1
});

print("Index created:", indexwork);

const explainFocus = db.tracks.find(
  {
    "explicit": false,
    "audio_features.instrumentalness": { $gt: 0.5 },
    "audio_features.speechiness": { $lt: 0.1 }
  },
  {
    track_name: 1,
    artists: 1,
    _id: 0
  }
).explain("executionStats");

printjson(explainFocus.executionStats);



