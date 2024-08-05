//Este modulo manejara todas las consultas desde autoseguro.pe
var path = require('path');
var jwt = require('jsonwebtoken');
var jwtOptions = {}
jwtOptions.secretOrKey = require("../global/global").key; // clave de encriptacion
var passport = require('passport');

// Envia vista HTML con token
var enviaHTML = function (req, res, next) {
   var servicio = req.originalUrl.split("?")[0];
   switch (servicio) {
      case "/consultas-1":
         res.render('consultaplaca.html', { tk: generaToken() });
         break;
      case "/consultas-2":
         res.render('consulta.html', { tk: generaToken() });
         break;
      case "/consultas-3":
         res.render('tramites.html', { tk: generaToken() });
         break;
   }
};
function generaToken() {
   var tt = Date.now();
   var payload = { id: 'publico', t: tt };
   var token = jwt.sign(payload, jwtOptions.secretOrKey);
   return token;
}
//
var enviajs = function (req, res, next) {
   var nroFile = req.query.f;
   var ruta = path.join(__dirname, '../www/js');
   var options = {
      root: ruta,
      dotfiles: 'deny',
      headers: {
         'Cache-Control': 'no-cache, no-store, must-revalidate',
         'Pragma': 'no-cache',
         'Expires': '0'
      }
   }
   switch (nroFile) {
      case "1":
         res.sendFile('consultaplaca.js', options);
         break;
      case "2":
         res.sendFile('historial_consultaexpediente.js', options);
         break;
      case "3":
         res.sendFile('historial_consultatramite.js', options);
         break;
   }
};

// Abre la pagina login si el usuario no se encuentra identificado
var get_wbs_ventas = function (req, res) {
   var moduloWebservice;
   //atiende consulta  
   try {
      var webServiceDAO = req.originalUrl.split("?")[0];
      webServiceDAO = webServiceDAO.substring(0, webServiceDAO.length - 2)
      // obtiene el nombre del Webservice a traves de la URL
      eval("moduloWebservice = require('.'+webServiceDAO)"); // Importa el modulo de web service
      // obtiene el nombre de la funcion a la que se intenta acceder
      var funcionName = req.query.funcion;
      if (funcionName != undefined) {
         eval("moduloWebservice." + funcionName + "(req, res, funcionName)"); // mediante el metodo Eval se puede ejecutar una funcion escrita en una variable string
      } else {
         res.status(500).send({ error: "Funcion invalida" })
      }
   } catch (e) {
      console.log("rutaWebService-ext ERROR: " + e)
      res.status(500).send({ error: e })
   }
};
/**************************************/
module.exports.enviaHTML = enviaHTML;
module.exports.get_wbs_ventas = get_wbs_ventas;
module.exports.enviajs = enviajs;
