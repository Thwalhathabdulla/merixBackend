const seedr = require('mongoose-seedr');
const path = require('path');
 
seedr.seed({
    databaseURL: 'mongodb://localhost/metrix',
    seed: [
        {
            documents: path.join(__dirname, 'users.js'),
            collection: 'users'
        }
    ]
});