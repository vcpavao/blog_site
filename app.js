var express = require("express");
var app = express();
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
//App config
mongoose.connect("mongodb://localhost/posts", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//Schema config
var postSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: {type: Date, default: Date.now}
});

var Post = mongoose.model("Post", postSchema);

//RESTful routes

app.get("/", function(req, res) {
   res.redirect("/posts");
});
//Index route
app.get("/posts", function(req, res) {
   Post.find({}, function(err, posts) {
      if(err) {
         console.log(err);
      } else {
         //Render index with posts data coming from db
         res.render("posts/index", {posts: posts});
      }
   })
});

//New route
app.get("/posts/new", function(req, res) {
   res.render("posts/new");
});

//Create route
app.post("/posts", function(req, res) {
   //Remove script tags
   req.body.post.body = req.sanitize(req.body.post.body);
   Post.create(req.body.post, function(err, newPost) {
      if(err) {
         res.render("posts/new");
      } else {
         res.redirect("/posts");
      }
   })
});

//Show route
app.get("/posts/:id", function(req, res) {
   Post.findById(req.params.id, function(err, foundPost) {
      if(err) {
         res.redirect("/posts");
      } else {
         res.render("posts/show", {post: foundPost});
      }
   });
});

//Edit route
app.get("/posts/:id/edit", function(req, res) {
   Post.findById(req.params.id, function(err, foundPost) {
      if(err) {
         res.redirect("/posts");
      } else {
         res.render("edit", {post: foundPost});
      }
   });
});

//Update route -- put request
app.put("/posts/:id", function(req, res) {
   Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
      if(err) {
         res.redirect("/posts");
      } else {
         res.redirect("/posts/" + req.params.id);
      }
   });
});

//Delete route
app.delete("/posts/:id", function(req, res) {
   Post.findByIdAndRemove(req.params.id, function(err) {
      if(err) {
         res.redirect("/posts");
      } else {
         res.redirect("/posts");
      }
   });
});

//-----COMMENT ROUTING

app.get("/posts/:id/comments/new", function(req, res) {
   Post.findById(req.params.id, function(err, foundPost) {
      if(err) {
         res.redirect("/posts/:id");
      } else {
         res.render("comments/new", {post: foundPost});
      }
   })
});

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("Server running");
});