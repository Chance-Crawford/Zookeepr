
// for more info see google docs node.js - notes, express.js section
// local server url http://localhost:3001/api/animals
const express = require('express');

// start by creating a route that the front-end can request data from.
// This routes to a JSON containing all of the zoos animals
const { animals } = require('./data/animals');

// see node.js - notes, heroku
// has to do with the port that heroku provides
const PORT = process.env.PORT || 3001;

// instantiates a server
const app = express();

const fs = require('fs');
const path = require('path');

// for the 2 functions below see node.js - notes, stroing data in server using
// express, these functions are important for adding functionality to the server
// that allows it to parse raw data POSTED in from a client.
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());

// This function will take in req.query as an argument and filter through 
// the animals accordingly, returning the new filtered array based on
// the query parameters from the api endpoint.
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

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}


function createNewAnimal(body, animalsArray) {
    // Great! Now when we POST a new animal, we'll add it to the 
    // imported animals array from the animals.json file.
    const animal = body;
    animalsArray.push(animal);

    // updates animals.json file to add new animal from the POST
    // request by the user
    // Here, we're using the fs.writeFileSync() method, which is the synchronous 
    // version of fs.writeFile() and doesn't require a callback function. If we 
    // were writing to a much larger data set, the asynchronous version would 
    // be better. But because this isn't a large file, it will work for our 
    // needs. We want to write to our animals.json file in the data subdirectory, 
    // so we use the method path.join() to join the value of __dirname, which 
    // represents the directory of the file we execute the code in, with the 
    // path to the animals.json file.
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        // Next, we need to save the JavaScript array data as JSON, so we use 
        // JSON.stringify() to convert it. The other two arguments used in the 
        // method, null and 2, are means of keeping our data formatted. The 
        // null argument means we don't want to edit any of our existing data; 
        // if we did, we could pass something in there. The 2 indicates we want 
        // to create white space between our values to make it more readable. If 
        // we were to leave those two arguments out, the entire animals.json file 
        // would work, but it would be really hard to read.
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
    return animal;
}


// this function validates the client response from the POST request.
// validating data is a very important part of building an application because 
// it allows our app to look for values in a consistent fashion without any 
// "what if" scenarios.
// Let's add our own validation function to server.js to make sure everything is 
// okay. It is going to take our new animal data from req.body and check if 
// each key not only exists, but that it is also the right type of data.
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
      return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
      return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
      return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
      return false;
    }
    return true;
}



// the get() method creates an api endpoint for the server and
// requires two arguments. The first is a 
// string that defines the route the client will have to 
// fetch from. The second is a callback function that will execute every 
// time that route is accessed with a GET request.
// res is for response, and req is for the request.
app.get('/api/animals', (req, res) => {
    // we are using the send() method from the res parameter 
    // (short for response) to send the string Hello! to our client.
    // res.send('Hello!');

    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    // we are sending the animal data as json to the client from the server 
    res.json(results);
});

// for more info see google docs node.js - notes, express.js section
// we create an api endpoint that takes a param. Paramas
// are mostly used whenever you want a specific item to be retrieved from
// a server. for example, this param specifies the id of the animal we want
// to be returned, if the link was http://localhost:3001/api/animals/1 then
// the animal with the id of 1 would be returned from this api endpoint.
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    // if the requested id corresponds with an 
    // animal in the list, return the animal object, if not
    // throw error.
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});


// get methods send data from the server when a client requests at a
// specific endpoint. post() methods is how a client will send data to
// a server using a specific endpoint.
// we defined a route that listens for POST requests, 
// not GET requests. POST requests differ from GET requests 
// in that they represent the action of a client requesting the server 
// to accept data rather than vice versa.
// // for more info see google docs node.js - notes, storing data in server with express
app.post('/api/animals', (req, res) => {
    // req.body is where our incoming content will be.
    // Again, we're using information that the request object 
    // (the req in our callback function) gives us. Earlier, we used req.query 
    // and req.params to look for specific data that our server can send back 
    // to the client.
    // With POST requests, we can package up data, typically as an 
    // object, and send it to the server. The req.body property is 
    // where we can access that data on the server side and do something with it.

    // set id based on what the next index of the array will be.
    // this adds a unique id to every animal the client adds through this post request.
    req.body.id = animals.length.toString();

    // sends the client request to add an animal to the server, to our validate function,
    // to make sure everything was inserted correctly by the user.
    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
        // if all inputs are valid, create the animal and add and save it
        // to our server and animals.json
        const animal = createNewAnimal(req.body, animals);
        res.json(animal);
    }
});


// makes server listen for requests to the server at designated port.
// to activate server, run npm start in terminal.
// to stop server press Ctrl + C, and then Y at the prompt if
// prompted.
// for more info see google docs node.js - notes, express.js section.
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});

