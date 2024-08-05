// Load required modules
var console_log = require("./global/global").console_log;
var numCPUs = require('os').cpus().length;  // Crearemos tantos workers como CPUs tengamos en el sistema
var express = require("express");           // web framework external module
var bodyParser = require('body-parser');
//** PASSPORT JS REQUIRE **//

var cookieParser = require('cookie-parser');
var session = require('express-session');
var path = require('path');
// Fin de Passport js
// Importa las rutas para las consultas del sistema () 
var rutas = require('./routes/rutaWebservice');
var route = require('./routes/route'); // RUTAS DE SIGNIN E INDEX
var rutas_ext = require('./routes/route-ext'); // Consultas externas
// create server
var app = express(); // Crea servidor Express
var puertoActual = 8081; // Numero de puerto donde se conecta http://autoseguro.in = 8080
var passport = require("./passportjs_requires/passport").passport;
//var puertoActual=process.env.PORT || 8000; // Numero de puerto donde se conecta, por defecto es 8000
// views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(cookieParser());
//app.use(bodyParser({ limit: '300mb' }));

app.use(bodyParser.urlencoded({
    extended: true,
    parameterLimit: 10000,
    limit: 1024 * 1024 * 50
}));
app.use(bodyParser.json({
    limit: 1024 * 1024 * 50,
    strict: false
}));

app.use(session({
    secret: 'secret strategic xxzzz code',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
// cross
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
    next();
}
app.use(allowCrossDomain);

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
//app.use(/*route.validate,*/ express.static(path.join(__dirname, 'www')));
app.use(express.static(path.join(__dirname, 'www')));
app.use("/webservice", rutas); // con la ruta 'webservice' llama a la funcion del archivo rutaWebservice.js
app.use("/wbs_as-sini", rutas); // ruta para el web service de SINIESTROS
app.use("/wbs_ventas", rutas);
app.use("/wbs_mant", rutas); // ruta para el web service del mantenimiento
app.use("/wbs_tesoreria", rutas); // ruta para el web service del modulo de Tesoreria
app.use("/wbs_procedures", rutas);
// Inicio > Login
app.get('/', route.index);
app.get('/signin', route.signIn); //pide Identificacion
app.post('/signin', route.signInPost); //Recibe Identificacion (POST)
// logout
app.get('/signout', route.signOut);
// Acceso a aplicacion movil
app.get('/activarCAT', route.activarCAT);
app.get('/signin1', route.signIn1); //Login desde aplicacion movil
app.post('/signin1', route.signInPost1); //Datos (POST) Login enviados desde aplicacion movil
app.use("/activarCAT/webservice", rutas); //servicios WEB
app.use("/activarCAT/wbs_ventas", rutas);
app.get('/activarCAT/signout1', route.signOut1);
// Consultas desde autoseguro.pe
app.get("/consultas-1", rutas_ext.enviaHTML);
app.get("/consultas-2", rutas_ext.enviaHTML);
app.get("/consultas-3", rutas_ext.enviaHTML);
//acceso al API validado con TOKEN
/*app.get("/wbs_ventas_e", passport.authenticate('jwt', { session: false }), rutas_ext.get_wbs_ventas);
app.get("/mhbscripts", passport.authenticate('jwt', { session: false }), rutas_ext.enviajs); */
app.get("/wbs_ventas_e",  rutas_ext.get_wbs_ventas);
app.get("/mhbscripts",  rutas_ext.enviajs);
// 404 not found
app.use(route.notFound404);

// Start Express http server on port 8080
var webServer = app.listen(puertoActual, function () { // se crea el servidor
    console_log("https://autoseguro corriendo en puerto " + puertoActual + " - numero de CPUS: " + numCPUs, 2);
});
webServer.timeout = 10000000;
var webServer2 = app.listen(80, function () { // se crea el servidor
    console_log("https://autoseguro corriendo en puerto " + puertoActual + " - numero de CPUS: " + numCPUs, 2);
});
webServer2.timeout = 10000000;
/*
C:\Certbot\live\sistema.autoseguro.pe\cert
C:\Certbot\live\sistema.autoseguro.pe\fullchain
C:\Certbot\live\sistema.autoseguro.pe\privkey
*/
var fs = require('fs');
/*const privateKey = fs.readFileSync('C:\\Certbot\\live\\sistema.autoseguro.pe\\privkey', 'utf8');
const certificate = fs.readFileSync('C:\\Certbot\\live\\sistema.autoseguro.pe\\cert', 'utf8');
const ca = fs.readFileSync('C:\\Certbot\\live\\sistema.autoseguro.pe\\fullchain', 'utf8');
*/
const privateKey = fs.readFileSync('C:\\work3\\cert\\privkey4.pem', 'utf8');
const certificate = fs.readFileSync('C:\\work3\\cert\\cert4.pem', 'utf8');
const ca = fs.readFileSync('C:\\work3\\cert\\fullchain4.pem', 'utf8');
const https = require('https');
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});
