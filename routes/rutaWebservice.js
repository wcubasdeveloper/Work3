//Este modulo valida todas las consultas provenientes desde el sistema, donde
//el usuario se ha logeado previamente
var express = require('express'); // se importa modulo express
var router = express.Router();
var moduloWebservice;
var fullUrl = "";
var mHostName = "";
router.get("/", function (req, res) { // obtiene una funcion web service mediante GET
  validaHOST(req, res);
});
router.post("/", function (req, res) { // obtiene una funcion web service mediante POST
  validaHOST(req, res);
});
function validaHOST(req, res) {
  if (req.isAuthenticated()) {
    //Valida que usuario se haya LOGEADO previamente
    llamarFuncionWebService(req, res);
  } else {
    res.redirect('/signin');
  }
}
function llamarFuncionWebService(req, res) {
  try {
    fullUrl = req.originalUrl;
    if (fullUrl.search("/activarCAT") == 0) {
      //los requerimientos enviados desde app Movil empiezan con esta URL => descartar
      var halfUrl = fullUrl.substr(11);
      fullUrl = halfUrl;
    }
    var webServiceDAO = fullUrl.split("?")[0];
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
    console.log("rutaWebService ERROR: " + e)
    res.status(500).send({ error: e })
  }
}
module.exports = router;