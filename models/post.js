var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now},
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        //Reference to comment model
        ref: "Comment"
    }]
});

module.exports = mongoose.model("Post", postSchema);