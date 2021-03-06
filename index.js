const 	express 	= require("express"),
		app 		= express(),
		bodyParser 	= require("body-parser"),
		mongoose 	= require("mongoose"),
	  	flash		= require("connect-flash"),
	  	passport	= require("passport"),
	  	LocalStrategy = require("passport-local"),
	  	methodOverride = require("method-override"),
		Asset 		= require("./models/asset"),
		Comment 	= require("./models/comment"),
	  	User		= require("./models/user"),
		seedDB 		= require("./seeds");

// require routes
const	commentRoutes	= require("./routes/comments"),
	  	assetRoutes		= require("./routes/assets"),
	  	indexRoutes		= require("./routes/index");


const url = process.env.DBURL || "mongodb://localhost:27017/CMMS"

//Local database in Goorm
// mongoose.connect("mongodb://localhost:27017/CMMS", {useNewUrlParser: true});

//Production database
mongoose.connect(url, {
	useNewUrlParser: true, 
	useCreateIndex: true
}).then( () => {
	console.log("Successfully connected to DB")
}).catch( (err) => {
	console.log('ERROR:', err.message);
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(flash());

// seedDB(); //Seed the database

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "This is a secret for now",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //authentication comes from passportLocalMongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to pass user into each route
app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/assets", assetRoutes);
app.use("/assets/:id/comments", commentRoutes);


app.listen(process.env.PORT || 3000, ()=>{console.log("Server initialized")});