// Import express, path and handlebars Modules to use in app
var express = require("express");
var path = require("path");
var fs = require("fs");
var app = express();
const exphbs = require("express-handlebars");
const { title } = require("process");
const port = process.env.port || 3000;

/* 
Allow static files in "public" directory to be served 
(use __dirname to ensure absolute path is used for different environments)
*/
app.use(express.static(path.join(__dirname, "/public")));

// Set Handlebars as the template engine
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      hasWebsite: (Website, options) => {
        return Website && Website.trim() !== "" && Website !== "N/A"
          ? true
          : false;
      },
      highlightIfNoWebsite: (website) => {
        if (!website || website.trim() === "N/A") {
          return "table-danger"; // Bootstrap class for red background
        }
        return ""; // No additional class if there's a valid website
      },
    },
  })
);
app.set("view engine", "hbs");

// Route "/" that displays the index.hbs view with passed argument title:Express
app.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});

// Route "/users" which sends a simple text response
app.get("/users", function (req, res) {
  res.send("respond with a resource");
});

// Start the server and listen on the .env defined port or port 3000
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

//Assignment 1 code ----------------------------------------------------------------------------------
//reusable path
var movieDataPath = path.join(__dirname, "/movie-dataset-a2.json");

var movieList = [];
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Step 4 Modified  from assignment 1
app.get("/data", (req, res) => {
  getMovies((movies) => {
    // Render the "page" template and pass all movie data
    res.render("data", { movies: movies, title: "Movie Data" });
  });
});

// STEP 5 Modified from assignment 1
app.get("/data/movie/:index", (req, res) => {
  const index = req.params.index;

  if (!index) {
    return res.render("movieIndex", { error: "Please Specify Index!" });
  }

  getMovies((movies) => {
    const movie = movies[index];

    if (!movie) {
      return res.render("movieIndex", { error: "Index is Incorrect!" });
    } else {
      // Render the "movieIndex" template with the movie data at the requested index
      return res.render("movieIndex", { movie });
    }
  });
});

//STEP 6 Modified
//the get route for /data/search/id
app.get("/data/search/id", (req, res) => {
  res.render("searchId");
});

//post route that searches and returns the desired movie
app.post("/data/search/id", (req, res) => {
  // Get the movie ID from the form
  const movieId = req.body.movie_id;

  // Fetch movies and search for the matching movie
  getMovies((movies) => {
    const movieResult = movies.find((movie) => movie.Movie_ID == movieId);

    // Render the page with either the found movie data or an error message
    if (movieResult) {
      res.render("searchId", { movie: movieResult });
    } else {
      res.render("searchId", { error: "Wrong Movie ID, try again" });
    }
  });
});

//Step 7 Modified:
app.get("/data/search/title", (req, res) => {
  res.render("searchTitle"); // Renders the title search form page
});
//post route that searches and returns the movie based on the title keyword
app.post("/data/search/title", (req, res) => {
  const titleKeyword = req.body.title.toLowerCase();

  getMovies((movies) => {
    const movieResults = movies.filter((movie) =>
      movie.Title.toLowerCase().includes(titleKeyword)
    );

    res.render("searchTitle", {
      movieResults, // Array of Movies containing the keyword in their title
    });
  });
});
//Asn2 Step 7
app.get("/viewData", (req, res) => {
  getMovies((movies) => {
    res.render("viewData", { movies });
  });
});

// Catches all undefined and wrong routes and displays the Error view with passed properties title:"Error" and message: "Wrong Route"
app.get("*", function (req, res) {
  res.render("error", { title: "Error", message: "Wrong Route" });
});
//reusable function to get movies, good practice to not repeat ourselves
//function will read movies from file once to save computation of reading it everytime since its static
function getMovies(callback) {
  //if movie list is already set give it to call back
  if (movieList.length > 0) {
    callback(movieList);
    return;
  }

  //if not read the movieList JSON and set the list
  fs.readFile(movieDataPath, (err, data) => {
    if (err) throw err;
    var movies = JSON.parse(data);
    movieList = movies;
    //do what we need with the movies
    callback(movies);
  });
}
