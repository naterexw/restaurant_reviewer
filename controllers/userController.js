const mongoose = require('mongoose');

const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('password', `Password can't be blank`).notEmpty();
  req.checkBody('password-confirm', `Confirmed password can't be blank`).notEmpty();
  req.checkBody('password-confirm', `Error your passwords don't match`).equals(req.body.password);
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return;
  }
  next();
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
  });
  const registerWithPromise = promisify(User.register, User);
  await registerWithPromise(user, req.body.password);
  next();
};
