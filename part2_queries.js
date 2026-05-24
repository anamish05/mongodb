db = db.getSiblingDB('spotify');

// task 1
print("---------------Task 1 result:");
const task1=db.tracks.find({
  "audio_features.danceability": { $gt: 0.7 },
  "audio_features.energy": { $gt: 0.7 },
  "duration_ms": { $gte: 180000, $lte: 300000 }
},
{
  track_name: 1,
  artists: 1,
  "audio_features.danceability": 1,
  "audio_features.energy": 1,
  duration_ms: 1,
  _id: 0
}).limit(5);

printjson(task1);

// task 2
print("---------------Task 2 result:");
const task2 = db.tracks.aggregate([
  {
    $unwind: "$artists"
  },
  {
    // group by and get statistics
    $group: {
      _id: "$artists",
      total_tracks: { $sum: 1 },
      min_popularity: { $min: "$popularity" },
      avg_popularity: { $avg: "$popularity" }
    }
  },
  {
    // filter
    $match: {
      total_tracks: { $gte: 3 },
      min_popularity: { $gte: 60 }
    }
  },
  {
    // fields to show
    $project: {
      _id: 0,
      artist_name: "$_id",
      total_tracks: 1,
      min_popularity: 1,
      avg_popularity: { $round: ["$avg_popularity", 1] }
    }
  },
  {
    // sort 
    $sort: {
      avg_popularity: -1,
      total_tracks: -1
    }
  },
  {
    // limit to 20 artists
    $limit: 20
  }
]);
printjson(task2);

// task 3
print("---------------Task 3 result:");

const task3 = db.tracks.aggregate([
  // mean and std for each genre
  {
    $group: {
      _id: "$track_genre",
      avg_tempo: { $avg: "$audio_features.tempo" },
      std_dev: { $stdDevPop: "$audio_features.tempo" }
    }
  },
  // outlier_threshold = avg + 2std_dev
  {
    $project: {
      _id: 0,
      genre: "$_id",
      avg_tempo: { $round: ["$avg_tempo", 1] },
      outlier_threshold: { 
        $round: [ { $add: ["$avg_tempo", { $multiply: [2, "$std_dev"] }] }, 3 ] 
      }
    }
  },
  // lookup for tracks which tempo is greater then threshold
  {
    $lookup: {
      from: "tracks",
      let: { current_genre: "$genre", threshold: "$outlier_threshold" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$track_genre", "$$current_genre"] },
                { $gt: ["$audio_features.tempo", "$$threshold"] }
              ]
            }
          }
        },
      
        {
          $project: {
            _id: 1,
            track_name: 1,
            popularity: 1,
            artists: 1,
            "audio_features.tempo": 1
          }
        }
      ],
      as: "outlier_tracks"
    }
  },
  // filter genres that have no outliers
  {
    $match: {
      "outlier_tracks.0": { $exists: true }
    }
  },
  // sort
  {
    $sort: { genre: 1 }
  },
  {
    $limit: 5
  }
]);
printjson(task3);

// task 4
print("---------------Task 4 result:");

const task4 = db.tracks.find({
  "explicit": false,
  "audio_features.loudness": { $lt: -10 },
  "audio_features.speechiness": { $lt: 0.1 },
  "audio_features.instrumentalness": { $gt: 0.5 }
},
{
  track_name: 1,
  artists: 1,
  explicit: 1,
  "audio_features.loudness": 1,
  "audio_features.speechiness": 1,
  "audio_features.instrumentalness": 1,
  _id: 0
}).limit(5);
printjson(task4);