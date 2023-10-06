require('dotenv').config();
require('express-async-errors');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const express = require('express');
const app = express();

// controller
const stripeController = require('./controllers/stripeController');
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
app.use(express.static('./public'));

// stripe
app.post('/stripe', stripeController);

// Function to recursively fetch directories
function fetchDirectories(basePath, currentPath) {
    const fullPath = path.join(basePath, currentPath);
    const directoryNames = fs
        .readdirSync(fullPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    // If only 'main' is present, return the parent
    if (directoryNames.length === 1 && directoryNames.includes('main')) {
        return [currentPath];
    }

    let paths = [];

    for (const dir of directoryNames) {
        const newBase = path.join(basePath, currentPath);
        const newCurrent = dir;

        if (currentPath) {
            paths = paths.concat(fetchDirectories(newBase, newCurrent).map((p) => path.join(currentPath, p)));
        } else {
            paths = paths.concat(fetchDirectories(newBase, newCurrent));
        }
    }

    // Add the parent directory if it contains other directories besides just 'main'
    // if (directoryNames.length > 0 && !(directoryNames.length === 1 && directoryNames.includes('main'))) {
    //     paths.push(currentPath);
    // }

    return paths;
}

// Test endpoint
app.get('/ledgers', cors(), (req, res) => {
    const directoryPath = path.join(__dirname, 'data');
    const result = fetchDirectories(directoryPath, '');

    res.json(result);
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5001;

const start = async () => {
    try {
        app.listen(port, () =>
            console.log(`running on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
