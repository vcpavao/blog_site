var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
//App config
mongoose.connect("mongodb://localhost/blogs", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Schema config
var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//RESTful routes

app.get("/", function(req, res) {
   res.redirect("/blogs");
});
//Index route
app.get("/blogs", function(req, res) {
   Blog.find({}, function(err, blogs) {
      if(err) {
         console.log(err);
      } else {
         //Render index with blogs data coming from db
         res.render("index", {blogs: blogs});
      }
   })
});

//New route
app.get("/blogs/new", function(req, res) {
   res.render("new");
});
//Create route
app.post("/blogs", function(req, res) {
   Blog.create(req.body.blog, function(err, newBlog) {
      if(err) {
         res.render("new");
      } else {
         res.redirect("/blogs");
      }
   })
});

//Show route
app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog) {
      if(err) {
         res.redirect("/blogs");
      } else {
         res.render("show", {blog: foundBlog});
      }
   });
});

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("Server running");
});