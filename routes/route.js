var console_log = require("../global/global").console_log;
var passport = require('passport');
// Accede a aplicacion movil complementaria del sistema solo si el usuario se encuentra identificado
var activarCAT = function (req, res, next) {
   if (!req.isAuthenticated()) {
      res.redirect('/signin1');
   } else {
      var user = req.user;
      //Renderiza archivo activarCATView.html desde '/views' pero internamente carga sus recursos desde '/www/activarCAT/'
      // porque previamente ha sido 'redirigido a >>> res.redirect(successRedirect); >>> '/activarCAT/'
      res.render('activarCATView.html', { title: 'Activa CAT', user: user });
   }
};
// Accede a la pagina principal del sistema solo si el usuario se encuentra identificado
var index = function (req, res, next) {
   if (!req.isAuthenticated()) {
      res.redirect('/signin');
   } else {
      var user = req.user;
      res.render('index.html', { title: 'Home', user: user });
   }
};
//   /singin (GET):
// Abre la pagina login si el usuario no se encuentra identificado
var signIn = function (req, res, next) {
   if (req.isAuthenticated()) res.redirect('/');
   res.render('signin.html', { title: 'Sign In' });
};
var signIn1 = function (req, res, next) {
   if (req.isAuthenticated()) res.redirect('/activarCAT/');
   res.render('signin.html', { title: 'Sign In 1' });
};
//   /signin (POST):
// Valida las credenciales del usuario. si son correctas, accede al sistema.
var signInPost = function (req, res, next) {
   crearSesion(req, res, next, "/");
};
var signInPost1 = function (req, res, next) {
   crearSesion(req, res, next, "/activarCAT/");
};
function crearSesion(req, res, next, rutaOK) {
   var successRedirect = req.body.successRedirect;
   var failureRedirect = req.body.failureRedirect;
   if (typeof successRedirect == "undefined") {
      successRedirect = rutaOK; // "/";
   }
   if (typeof failureRedirect == "undefined") {
      failureRedirect = "/signin.html";
   }
   passport.authenticate('local', { successRedirect: successRedirect, failureRedirect: failureRedirect },
      function (err, user, info) {
         if (err) {
            console_log("Error al validar credenciales: " + err.message, 1);
            return res.render('signin.html', { title: 'Sign In', errorMessage: err.message });
         }
         if (!user) {
            console_log("Error del usuario: " + info.message, 2);
            return res.render('signin.html', { title: 'Sign In', errorMessage: info.message });
         }
         return req.logIn(user, function (err) {
            if (err) {
               console_log("Error login: " + err.message, 1);
               return res.render('signin.html', { title: 'Sign In', errorMessage: err.message });
            } else {
               //console_log("EL USUARIO SE IDENTIFICO CORRECTAMENTE. idUsuario: " + user.idUsuario + " Toke:" + user.tk, 2);
               return res.redirect(successRedirect);
            }
         });
      })(req, res, next);
}
//  /signout (GET)
// finaliza la sesion de un usuario y vuelva a cargar la pagina login.
var signOut = function (req, res, next) {
   if (!req.isAuthenticated()) {
      notFound404(req, res, next);
   } else {
      req.logout();
      res.redirect('/signin');
   }
};
var signOut1 = function (req, res, next) {
   if (!req.isAuthenticated()) {
      notFound404(req, res, next);
   } else {
      req.logout();
      res.redirect('/signin1');
   }
};
// 404 not found
var notFound404 = function (req, res, next) {
   res.status(404);
   res.render('404', { title: '404 Not Found' });
};

// EXPORTACION DE LAS FUNCIONES
/**************************************/
// Validate
//module.exports.validate = validate;
// index
module.exports.index = index;
// index
module.exports.activarCAT = activarCAT;
// sigin in
// GET
module.exports.signIn = signIn;
module.exports.signIn1 = signIn1;
// POST
module.exports.signInPost = signInPost;
module.exports.signInPost1 = signInPost1;
// sign out
module.exports.signOut = signOut;
module.exports.signOut1 = signOut1;
// 404 not found
module.exports.notFound404 = notFound404;
