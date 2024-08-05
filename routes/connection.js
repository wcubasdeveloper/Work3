//*********** DB ********
// var mysql = require('mysql');
// var pool      =    mysql.createPool({
//     connectionLimit : 100, //Maximo 50 conexiones a la vez, si hay mas se ponen en cola...
//     host     : '192.52.242.169:3306',
//     user     : 'root',
//     password : '123456',
//     //database: 'autosegurobd_desarrollo',
//     database : 'respaldo_auto',
// 	debug    :  true
// });


const mysql = require('mysql');


const pool = mysql.createPool({
  connectionLimit: 10, // Número máximo de conexiones en el pool
  host: '192.52.242.169',
  user: 'wcubas',
  password: 'Wc123@123',
  database : 'respaldo_autoseguro'//,
  //database: 'desarrollo_autoseguro'
});


// const pool = mysql.createPool({
//   connectionLimit: 10, // Número máximo de conexiones en el pool
//   host: '192.52.242.169',
//   user: 'wcubas',
//   password: 'Wc123@123',
//   database : 'respaldo_autoseguro'//,
//   //database: 'desarrollo_autoseguro'
// });


module.exports.pool = pool; // exporta el pool de conexiones
