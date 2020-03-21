
$("#scrape").on("click", function () {
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function (data) {
    });
});

// Grab the articles as a json //

$.getJSON("/articles", function (data) {

    // For each one //

    for (var i = 0; i < data.length; i++) {

        // Display the apropos information on the page //

        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + "<a href='" +
            data[i].link + "'>" + "Article Link" + '</a>' + "<br>" + data[i].summary + "<br>" + "<button data-id='" + data[i]._id +
            "' id='add-note'>Add Note</button>" + "<br><br>" + "</p>");
    }
});


// When someone clicks a p tag //

$(document).on("click", "#add-note", function () {

    // Empty the notes from the note section //

    $("#notes").empty();

    // Save the id from the p tag //

    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article //

    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })

        // Add note information to the page //

        .then(function (data) {
            console.log(data);

            // The title of the article //

            $("#notes").append("<h2>" + data.title + "</h2>");

            // An input to enter a new title //

            $("#notes").append("<input id='titleinput' name='title' >");

            // A textarea to add a new note body //

            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");

            // A button to submit a new note, with the id of the article saved to it //

            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
            $("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");

            // If there's a note in the article //

            if (data.note) {

                // Place the title of the note in the title input //

                $("#titleinput").val(data.note.title);

                // Place the body of the note in the body textarea //

                $("#bodyinput").val(data.note.body);
            }
        });
});


$(document).on("click", "#savenote", function () {

    // Grab the id associated with the article from the submit button //

    var thisId = $(this).attr("data-id");

    // Run a post request to change the note, using what's entered in the inputs //

    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {

            // Value taken from title input //

            title: $("#titleinput").val(),

            // Value taken from note textarea //

            body: $("#bodyinput").val()
        }
    })
        .then(function (data) {

            // Log the response //

            console.log(data);

            // Empty the notes section //

            $("#notes").empty();
        });

    // Remove values entered in the input and textarea for note entry //

    $("#titleinput").val("");
    $("#bodyinput").val("");
});


$(document).on("click", "#deletenote", function () {


    var thisId = $(this).attr("data-id");


    $.ajax({
        method: "DELETE",
        url: "/articles/" + thisId,
        data: {


            title: $("#titleinput").val(),


            body: $("#bodyinput").val()
        }
    })

        .then(function (data) {

            console.log(data);

            $("#notes").empty();
        });
});
