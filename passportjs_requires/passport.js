// importa modulos
var console_log = require("../global/global").console_log; // Funcion console_log
var pool = require('../routes/connection').pool; // conecion a BASE DE DATOS
var passport = require('passport'); // Modulo de passportjs
var LocalStrategy = require('passport-local').Strategy; // Metodo para validar (Local)
var CryptoJS = require("crypto-js"); // metodo de encriptacion
var key = require("../global/global").key; // clave de encriptacion

// con esta funcion se verifica si existe el usuario (valida usuario y contraseña), retorno el registro del USUARIO
passport.use(new LocalStrategy(
 function(username, password, done) {
   console_log("VALIDANDO USUARIO", 2);
   if(username=="anonymous" && password=="anonymous"){
     return done(null, {idUsuario:0, username:"anonymous", password:"anonymous", logeado:true});  
   }else{
      pool.getConnection(function(err,connection){
		  
		console.log("ERROR")
		console.log(err);
		  
        if (err) {
          connection.release();
          console_log("ERROR EN POOL DE CONEXIONES", 1);
          //res.json({"code" : 100, "status" : "Error en pool de conexiones MySQL"});
          return;
        }
        var query ="SELECT * from UsuarioIntranet where UName=?";
        connection.query(query, [username], function(err,rows){
          connection.release();
          if (err){
              console_log("ERROR EN MYSQL AL VALIDAR USUARIO", 1);
              return done(err);
          }
          if (!rows.length) {
              console_log("EL USUARIO NO EXISTE", 2);
              return done(null, false, {message:'No user found.'}); // req.flash is the way to set flashdata using connect-flash
            }
          if(!(rows[0].password==password)){
              console_log("PASSWORD ERRADO", 2);
              return done(null, false,  {message:"Oops! Wrong password."}); // create the loginMessage and save it to session as flashdata
          }else{
              console_log("VALIDACION DE CREDENCIALES CORRECTA", 2);
              return done(null, rows[0]);  
          }     
       });
    }); 
  }
}));

// Obtiene la clave de sesion del usuario, en este caso el campo idUsuario
passport.serializeUser(function(user, done) {
  done(null, user);
});

// verifica que la clave de sesion "idUsuario" sea valida. Devuelve el registro del usuario validado
passport.deserializeUser(function(user, done) {    
  pool.getConnection(function(err,connection){
    if (err) {
      connection.release();
      console_log("ERROR EN POOL DE CONEXIONES", 1);
      //res.json({"code" : 100, "status" : "Error en pool de conexiones MySQL"});
      return;
    }
    else if(user.logeado==true){ // idUsuario = 0 (ANONIMO), = 10000 (Usuario registrado)
      connection.release();
      done(err, user);
    }else{
        var query ="SELECT u.Nombres, u.Apellidos, u.password, u.idUsuario, u.idPerfil1, u.idPerfil2, u.idPerfil3,  u.idArea, a.Nombre as nombreArea, a.plantilla, u.horaActualizacion,  p.idPromotor, p.idUsuario AS promotor_usuario, "+
            "u.fechaVigencia, (select pr.idProcurador from Procurador pr where pr.idUsuario=u.idUsuario) as idProcurador, (select estadoCierrePeriodo from ConstantesGenerales) as estadoCierrePeriodo, l.Nombre as nombreLocal, l.direccion, l.idLocal, l.localRemoto "+
            "from UsuarioIntranet u "+
            "inner join Local l on u.idLocal = l.idLocal "+
            "left join Area a on u.idArea = a.idArea "+
            "left join Promotor p on u.idUsuario = p.idUsuario "+
            "where u.idUsuario=?";
        
        connection.query(query, [user.idUsuario],function(err,rows){
          connection.release();
          rows[0].logeado=true
          rows[0].idUsuario = user.idUsuario;
          user=rows[0];
          done(err, rows[0]);
        }); 
    }
  });	
});

module.exports.passport=passport;