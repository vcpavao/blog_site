var express = require("express"),
    app = express(),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Post = require("./models/post.js"),
    Comment = require("./models/comment.js");
    
//App config
mongoose.connect("mongodb://localhost/posts", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

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
   Post.findById(req.params.id).populate("comments").exec(function(err, post) {
      if(err) {
         res.redirect("/posts");
      } else {
         res.render("posts/show", {post: post});
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
//New route
app.get("/posts/:id/comments/new", function(req, res) {
   Post.findById(req.params.id, function(err, foundPost) {
      if(err) {
         console.log(err);
      } else {
         res.render("comments/new", {post: foundPost});
      }
   })
});
//Create route
app.post("/posts/:id/comments", function(req, res) {
   Post.findById(req.params.id, function(err, post) {
      if(err) {
         res.redirect("/posts");
      } else {
         Comment.create(req.body.comment, function(err, comment) {
            //Sanitize (remove script tags)
            req.body.comment.text = req.sanitize(req.body.comment.text);
            if(err) {
               console.log(err);
            } else {
               post.comments.push(comment);
               post.save();
               res.redirect("/posts/" + post._id);
            }
         })
      }
   })
});

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("Server running");
});