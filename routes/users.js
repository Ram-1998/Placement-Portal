var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var md5 = require('md5');
//var bcrypt = require('bcrypt')
var User = require('../models/user');

//Check authentication
function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else
	{
		res.redirect('/');
	}
}

//Register user
router.post('/register',function(req,res){
	var rollno = req.body.rollno;
	var email = req.body.email;
	var password = req.body.password;
	var confirm_password = req.body.confirm_password;
	//var user_level = req.body.user_level;

	//Validation
	req.checkBody('rollno','Roll Number is required').notEmpty();
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('password','Password is required').notEmpty();
	req.checkBody('confirm_password','Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('login_signup',{
			errors: errors
		});
		console.log(errors);
	}
	else{
		var newUser = new User({
			rollno: rollno,
			email: email,
			password: password
		});

		User.createUser(newUser,function(err,user){
			if(err) throw err;
			console.log(user);
		});

		console.log('registered');

		res.redirect('/');
	}
});

//login using local-strategy
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
  function(username, password, done) {
	User.getUserByEmail(username,function(err,user){
		if(err) throw err;

		// var entered_password = md5(password);
		if(!user) {
			console.log("User Not Found !");
			return done(null,false,{message: 'Unknown user'})
		}
		else{
			console.log("User Found :)");
			console.log(user[0].password);
			if(User.comparePassword(md5(password),user[0].password,function(err,user){
				if(err) throw err;
				console.log(isMatch);
				if(!isMatch){
					console.log("Password Not Match :(");
					return done(null,false,{message: 'Invalid Password'});
				}
				else{
					console.log("Logged In :)");
					return done(null,user);
				}
			}));

		}
			// else if(){
			// 	return done(null,user);
			// }
			// else{
			// 	return done(null,false,{message: 'Invalid Password'});
			// }
		// User.comparePassword(password,md5(user.password),function(err,user){
		//
		// })
	});
	}
));

//Serialization
passport.serializeUser(function(user, done) {
	console.log(user);
  done(null, user._id);
});

//Deserialization
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

//login
router.post('/login',
  passport.authenticate('local',{session:false,successRedirect: '/users/dashboard', faliureRedirect: '/', failureFlash:true}),
  function(req, res) {
		res.redirect('/users/dashboard');
});


//Dashboard
router.get('/dashboard',function(req,res){
	console.log('dashboard');
	res.render('student_dashboard');
});

module.exports = router;
