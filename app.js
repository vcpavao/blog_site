//Import packages
var express = require("express"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    
    Post = require("./models/post"),
    Comment = require("./models/comment"),
    User = require("./models/user");
    
//App configuration
mongoose.connect("mongodb://localhost/posts", {useNewUrlParser: true});
var app = express();

app.use(require("express-session")({
   secret: "my secret option",
   resave: false,
   saveUninitialized: false
}));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//Middleware for passing user to all templates
app.use(function(req, res, next) {
   res.locals.currentUser = req.user;
   next();
})

//RESTful routes
app.get("/", function(req, res) {
   res.redirect("/posts");
});

app.get("/about", function(req, res) {
   res.render("about");
});

app.get("/recs", function(req, res) {
   res.render("recs");
});

//Index route
app.get("/posts", function(req, res) {
   Post.find({}, function(err, posts) {
      if(err) {
         console.log(err);
      } else {
         //Render index with posts data coming from db
         res.render("posts/index", {posts: posts, currentUser: req.user});
      }
   })
});

//New route
app.get("/posts/new", isLoggedIn, function(req, res) {
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
app.get("/posts/:id/comments/new", isLoggedIn, function(req, res) {
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

//Auth routes
app.get("/members", isLoggedIn, function(req, res) {
    res.render("members");
});

app.get("/register", function(req, res) {
   res.render("register");
});

app.post("/register", function(req, res) {
   //TODO manually check credentials before creating User object in database
   User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
      if(err) {
         console.log(err);
         res.render("register");
      }
      passport.authenticate("local")(req, res, function(){
         res.redirect("/members");
      });
   });
});

app.get("/login", function(req, res) {
   res.render("login");
});

app.post("/login", passport.authenticate("local", {
      successRedirect: "/members",
      failureRedirect: "/login"
}), function(req, res) {
   //Empty for now
});

app.get("/logout", function(req, res) {
   req.logout();
   res.redirect("/");
});

function isLoggedIn(req, res, next) {
   if(req.isAuthenticated()) {
      return next();
   }
   res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("Server running");
});