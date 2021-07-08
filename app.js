const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const app = express();
app.use(express.json());
const initiateDbAndServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("server running on http://localhost:3000/");
  });
};
initiateDbAndServer();
const convertDbResponseToMovieResponseObject = (eachMovie) => {
  return {
    movieName: eachMovie.movie_name,
  };
};

const convertDbResponseToDirectorResponseObject = (directorDetails) => {
  return {
    directorId: directorDetails.director_id,
    directorName: directorDetails.director_name,
  };
};

const convertDbResponseToResponseObject = (movieDetails) => {
  return {
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
  SELECT 
  movie_name 
  FROM
   movie;`;
  const movieNamesArray = await db.all(getMovieNamesQuery);
  response.send(
    movieNamesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
  INSERT into movie (director_id,movie_name,lead_actor)
  VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
  SELECT * from movie
  WHERE movie_id=${movieId};`;
  const dbMovieDetails = await db.get(getMovieQuery);
  //console.log(movieDetails);
  response.send(convertDbResponseToResponseObject(dbMovieDetails));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
  UPDATE movie SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}';`;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE from movie where movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//AP! 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * from director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDbResponseToDirectorResponseObject(eachDirector)
    )
  );
});

//API 7
//Returns a list of all movie names directed by a specific director

//select movie_name
//from movie join director where director_id-${}
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  //console.log(directorId);
  const getMoviesOfDirectorQuery = `
  select 
  movie_name
   from 
  movie  
  where director_id='${directorId}'`;
  console.log(getMoviesOfDirectorQuery);

  const movieNames = await db.all(getMoviesOfDirectorQuery);
  response.send(
    movieNames.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
