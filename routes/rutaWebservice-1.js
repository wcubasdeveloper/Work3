var express = require('express'); // se importa modulo express
var router = express.Router();
var moduloWebservice;

router.get("/", function (req, res) { // obtiene una funcion web service mediante GET
  //res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //console.log('ingrese al webservice usando GET');
  if (!req.isAuthenticated()) { //Valida que usuario se haya LOGEADO previamente
    res.redirect('/signin');
  } else {
    llamarFuncionWebService(req, res);
  }
});
router.post("/", function (req, res) { // obtiene una funcion web service mediante POST
  //res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //console.log('ingrese al webservice usando POST');
  if (!req.isAuthenticated()) {
    res.redirect('/signin');
  } else {
    llamarFuncionWebService(req, res);
  }
});
function llamarFuncionWebService(req, res) {
  try {
    var fullUrl = req.originalUrl;
    if (fullUrl.search("/activarCAT") == 0) {
      //los requerimientos enviados desde app Movil empiezan con esta URL => descartar
      var halfUrl = fullUrl.substr(11);
      fullUrl = halfUrl;
    }
    var webServiceDAO = fullUrl.split("?")[0]; // obtiene el nombre del Webservice a traves de la URL
    eval("moduloWebservice = require('.'+webServiceDAO)"); // Importa el modulo de web service
    var funcionName = req.query.funcion; // obtiene el nombre de la funcion a la que se intenta acceder
    if (funcionName != undefined) {
      //console.log("webService= "+webServiceDAO + " funcionName= " + funcionName + " CODIGO = ", eval("moduloWebservice."+funcionName));
      eval("moduloWebservice." + funcionName + "(req, res, funcionName)"); // mediante el metodo Eval se puede ejecutar una funcion escrita en una variable string
    }
  } catch (e) {
    console.log("rutaWebService ERROR: " + e)
    res.status(500).send({ error: e })
  }
}
module.exports = router;