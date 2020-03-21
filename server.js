var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");

// Require all models //

var db = require("./models");

var PORT = 3000;

// Initialize Express //

var app = express();

// Configure middleware //

// Use morgan logger for logging requests //

app.use(logger("dev"));

// Parse request body as JSON //

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder //

app.use(express.static("public"));

// Connect to the Mongo DB //

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/Headlines";

mongoose.connect(MONGODB_URI);

// A GET route for scraping the echoJS website //

app.get("/scrape", function (req, res) {

  // Grab  with axios //

  axios.get("https://www.nytimes.com/").then(function (response) {

    // Load that into cheerio and save it to $ for a shorthand selector //

    var $ = cheerio.load(response.data);

    // Grab every h2 within an article tag //

    $("article").each(function (i, element) {

      // Save an empty result object //

      var result = {};

      // Add the text and href of every link, and save them as properties of the result object //

      result.title = $(this)
        .find("h2")
        .text();
      result.link = "https://www.nytimes.com" + $(this)
        .find("a")
        .attr("href");
      result.summary = $(this)
        .find("p")
        .text();

      // Create new Article using the `result` object built from scraping //

      db.Article.create(result)
        .then(function (dbArticle) {

          // View added result in the console //

          console.log(dbArticle);
        })
        .catch(function (err) {

          // If an error occurred, log it //

          console.log(err);
        });
    });

    // Send a message //

    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db //

app.get("/articles", function (req, res) {

  db.Article.find({})
    .then(function (dbArticle) {

      // If all Users are successfully found, send them back to the client //

      res.json(dbArticle);
    })
    .catch(function (err) {

      // If an error occurs, send the error back to the client //

      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note //

app.get("/articles/:id", function (req, res) {



  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note //

app.post("/articles/:id", function (req, res) {

  // Save the new note that gets posted to the Notes collection //
  // Find article from the req.params.id //
  // Update it's "note" property with the _id of the new note //


  db.Note.create(req.body)
    .then(function (dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {

      // If the User was updated successfully, send it back to the client // 


      res.json(dbArticle);
    })
    .catch(function (err) {

      // If an error occurs, send it back to the client //

      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note //

app.delete("/articles/:id", function (req, res) {



  db.Note.remove(req.body)
    .then(function (dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {

      // If user was updated successfully, send it back to the client //

      res.json(dbArticle);
    })
    .catch(function (err) {

      // If an error occurs, send it back to the client //

      res.json(err);
    });
});

// Start the server // 

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});



