var mongoose = require('mongoose');
var DocSchema = new mongoose.Schema({
    id : {
        type : Number,
        required : true,
    },
    userId : {
        type : Number
    },
    docName : {
        type : String
    },
    discription : {
        type : String
    },
    type : {
        type : String
    },
    path : {
        type : String
    }
})

module.exports = mongoose.model('Docs', DocSchema);