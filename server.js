
// for more infoi see google docs node.js - notes, express.js section
// local server url http://localhost:3001/api/animals
const express = require('express');

// start by creating a route that the front-end can request data from.
// This routes to a JSON containing all of the zoos animals
const { animals } = require('./data/animals');

// instantiates a server
const app = express();

// This function will take in req.query as an argument and filter through 
// the animals accordingly, returning the new filtered array based on
// the query parameter.
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;

    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array.
        // If personalityTraits is a string, place it into a new array and save.
        if (typeof query.personalityTraits === 'string') {
        personalityTraitsArray = [query.personalityTraits];
        } else {
        personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
        // Check the trait against each animal in the filteredResults array.
        // Remember, it is initially a copy of the animalsArray,
        // but here we're updating it for each trait in the .forEach() loop.
        // For each trait being targeted by the filter, the filteredResults
        // array will then contain only the entries that contain the trait,
        // so at the end we'll have an array of animals that have every one 
        // of the traits when the .forEach() loop is finished.
        filteredResults = filteredResults.filter(
            // find each animal that has the current trait in the array,
            // and filter it to, just those animals then save.
            animal => animal.personalityTraits.indexOf(trait) !== -1
        );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    // return the filtered results:
    return filteredResults;
}


// the get() method requires two arguments. The first is a 
// string that describes the route the client will have to 
// fetch from. The second is a callback function that will execute every 
// time that route is accessed with a GET request.
app.get('/api/animals', (req, res) => {
    // we are using the send() method from the res parameter 
    // (short for response) to send the string Hello! to our client.
    // res.send('Hello!');

    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    // we are sending the animal data as a json to the client from the server 
    res.json(results);
});

// makes server listen for requests to the server at port 3001
// to activate server, run npm start in terminal.
// to stop server press Ctrl + C, and then Y at the prompt if
// prompted.
// for more infoi see google docs node.js - notes, express.js section.
app.listen(3001, () => {
    console.log(`API server now on port 3001!`);
});