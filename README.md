To launch this project, use next steps:  

### 1. Cloning the repository and installing dependencies  
Open a terminal in VS Code, clone the repository, and navigate to the project folder. Then install the required libraries:  

```bash
git clone [https://github.com/ваше-ім'я-користувача/назва-репозиторію.git](https://github.com/ваше-ім'я-користувача/назва-репозиторію.git)  
cd mongodb  

# dependencies for Python  
pip install -r requirements.txt  

**### 2. In the root folder of your project, create a file called .env and add your MongoDB Atlas connection string there.**  

**3. Loading raw data**   
python 01_load_raw_data.py

**4. Transformation**    
mongosh mongodb+srv:MONGOURI  --file 02_transform.js  

**5. Part 2 queries**   
mongosh mongodb+srv:MONGOURI  --file part2_queries.js  

**6. Part 3 queries**   
mongosh mongodb+srv:MONGOURI  --file part3_queries.js  

**7. Part 4 indexes**   
mongosh mongodb+srv:MONGOURI  --file part4_indexes.js  

ANSWERS TO PRACTICAL QUESTIONS:  
PART 1   
1. Why audio features are placed in the object apart? When is it useful and when creates problems?
   Audio features are placed apart to place them logically together in one group as technical numeric characteristics of a track,
   that can be later analysed. So we do not need to do any join, we already have access to all features in 1 document.
   The problem of using embedding might appear when the document gets too big, and in case of change
   of some feature, db has to go through the whole document, so it takes memory, time and can lead to inconsistencies.
2. Why artists are saved as array, not string? Which queries get simpler?
   We placed artists in array so db can see them as separate elements that it can analyse. So we can search easily
   tracks by a particular artist, perform aggregations by artists etc.
3. What is $out and how it differs from $merge? When to use each?
   $out takes result of an aggregation and creates a new collection from it. If a collection with same name existed
   before, it will replace it completely. $merge will first check whether collection existed before, and will
   add/replace new information, if not existed before - it will create a new.
   We can use $out when we want to recalc some metrics and we do not need old data (best track for today). We can
   use $merge when we want just add an update to existing collection.
PART 2
1. What is $unwind used for?  
   It is used to unpack the values in the array into the separate documents.  
2. What's the difference between $stdDevPop and $stdDevSamp?
   This is stitistics - stddevpop returns standard deviation of the entire population, whereas stddevsamp - of some sample of this population.
PART 3
1. If we take artists with just 1 track, it may statistically be incorrect as it will show the popularity of the track, not artist. If we take artists
   with more than 50 tracks, we will take into account only mega-stars with long scene life or popular productive artists, and average populatiry may
   fall as we will not take into analysis "average" artists with 10-20 tracks.
2. In task 3 if we take only genres with minimum 50 tracks (not 100) to calculate "danceability", we will allow less popular genres be included,
   and these genres might be mixes of more general genres or sub-genres with less affection on audience.  
PART 4
Task1.1. Before indexing time spent was 76 ms, whereas after - just 2 ms. Before indexing whole collection was scanned, after - just 300 docs.
Before:  
{  
  executionSuccess: true,  
  nReturned: 354,  
  executionTimeMillis: 76,  
  totalKeysExamined: 0,  
  totalDocsExamined: 113999,  
  executionStages: {  
    isCached: false,  
    stage: 'SORT',  
    nReturned: 354,  
    executionTimeMillisEstimate: 67,  
    works: 114355,   
    advanced: 354,  
    needTime: 114000,  
    needYield: 0,  
    saveState: 4,  
    restoreState: 4,  
    isEOF: 1,  
    sortPattern: {  
      popularity: -1  
    },  
    memLimit: 33554432,  
    type: 'simple',  
    totalDataSizeSorted: 197854,  
    usedDisk: false,  
    spills: 0,  
    spilledDataStorageSize: 0,  
    inputStage: {  
      stage: 'COLLSCAN',  ......

AFTER:
 executionSuccess: true,  
  nReturned: 354,  
  executionTimeMillis: 2,  
  totalKeysExamined: 412,  
  totalDocsExamined: 354,  
  executionStages: {  
    isCached: false,  
    stage: 'FETCH',  
    nReturned: 354,  
    executionTimeMillisEstimate: 2,  
    works: 412,  
    advanced: 354,  
    needTime: 57,  
    needYield: 0,  
    saveState: 0,  
    restoreState: 0,  
    isEOF: 1,  
    docsExamined: 354,  
    alreadyHasObj: 0,  
    inputStage: {  
      stage: 'IXSCAN',  
      nReturned: 354,  
      executionTimeMillisEstimate: 2,  
Task1.2. Main marker is IXSCAN that tells that search is by index. Also amount of the scanned documents.
   inputStage: {  
      stage: 'IXSCAN',  
      nReturned: 354,...
Task2. Result of explain:
{  
  executionSuccess: true,  
  nReturned: 16141,  
  executionTimeMillis: 50,  
  totalKeysExamined: 16602,  
  totalDocsExamined: 16141,  
  executionStages: {  
    isCached: false,  
    stage: 'PROJECTION_SIMPLE',  
    nReturned: 16141,  
    executionTimeMillisEstimate: 45,  
    works: 16602,  
    advanced: 16141,  
    needTime: 460,  
    needYield: 0,  
    saveState: 2,  
    restoreState: 2,  
    isEOF: 1,  
    transformBy: {  
      track_name: 1,  
      artists: 1,  
      _id: 0  
    },  
    inputStage: {  
      stage: 'FETCH',  
      nReturned: 16141,  
      executionTimeMillisEstimate: 35,  
      works: 16602,  
      advanced: 16141,  
      needTime: 460,  
      needYield: 0,  
      saveState: 2,  
      restoreState: 2,  
      isEOF: 1,  
      docsExamined: 16141,  
      alreadyHasObj: 0,  
      inputStage: {  
        stage: 'IXSCAN',  
        nReturned: 16141,  
        executionTimeMillisEstimate: 11,  
        works: 16602,  
        advanced: 16141,  
        needTime: 460,  
        needYield: 0,  
        saveState: 2,  
        restoreState: 2,  
        isEOF: 1,  
        keyPattern: {  
          explicit: 1,  
          'audio_features.instrumentalness': 1,  
          'audio_features.speechiness': 1  
        },  
        indexName: 'explicit_1_audio_features.instrumentalness_1_audio_features.speechiness_1',  
        isMultiKey: false,  
        multiKeyPaths: {  
          explicit: [],  
          'audio_features.instrumentalness': [],  
          'audio_features.speechiness': []  
        },  
        isUnique: false,  
        isSparse: false,  
        isPartial: false,  
        indexVersion: 2,  
        direction: 'forward',  
        indexBounds: {  
          explicit: [  
            '[false, false]'  
          ],  
          'audio_features.instrumentalness': [  
            '(0.5, inf.0]'  
          ],  
          'audio_features.speechiness': [  
            '[-inf.0, 0.1)'  
          ]  
        },  
        keysExamined: 16602,  
        seeks: 461,   
        dupsTested: 0,  
        dupsDropped: 0  
      }  
Task3. This query is Not covered, since covered query is designed so Mongodb takes all info from index, not accessing the documents.  
   The index does not have _id, so in any case mongodb has to go and search that id in documents. Also there is no  
   projection with only fields that are in index.    


   
