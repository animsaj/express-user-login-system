var express = require('express');
var passport = require("passport");
var User = require("../models/user");
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {
      title: 'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {
      title: 'Login',
      user: req.user
  });
});

//registration form submission with optional profileimage + validation + User creation + storing in db
router.post('/register', upload.single('profileimage'), function (req, res, next) {
  User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
  if(req.file) {
    console.log('uploading a file...');
    var profileImageOriginalName = req.file.profileimage.originalname;
    var profileImageName = req.file.profileimage.name;
    var profileImageMime = req.file.profileimage.mimetype;
    var profileImagePath = req.file.profileimage.path;
    var profileImageExtension = req.file.profileimage.extension;
    var profileImageSize = req.file.profileimage.size;
  } else {
    //set default image
    profileImageName = 'noimage.png';
  }
   console.log(req.body);
  
   //form validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Valid email required').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password 6 to 20 characters required').len(6, 20);
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  
  var errors = req.validationErrors();
    
    if(errors) {
      console.log(errors);
      return res.render('register', { errors: errors });
    }
    if (err) {
      console.log('error while user register!', err);
      return res.render("register", {info: "Sorry. That username already exists. Try again."});
    }
    console.log('user registered!');
    passport.authenticate('local')(req, res, function () {
        req.flash('info', 'You are now logged in');
        res.redirect('/');
    });
  });
});
  
//login process
router.post('/login', passport.authenticate('local'), function(req, res, next) {
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('info', 'You are now logged in');
        res.redirect('/');
    });
});

//logout prosess
router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('info', 'You have logged out');
        res.redirect('/users/login');
        
    });
});

module.exports = router;
