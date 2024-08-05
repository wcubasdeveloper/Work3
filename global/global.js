//var urldominio = "http://sistema.autoseguro.pe/";
var urldominio = "https://autoseguro.pe/";

var fs = require('fs'); // requerida para leer archivos
var pool = require('../routes/connection').pool; //recupera el pool de conexiones
// AQUI SE ENCONTRARAN TODAS LAS FUNCIONES Y VARIABLES GLOBALES, PARA USARLAS SE TENDRA QUE INSTANCIAR ESTA CLASE
var key = "mHb2020afocats%";
var nivelDebug = 1; // 0=No muestra nada; 1=Muestra solo erorres; 2=Muestra solo avisos; 3=Muestra errores mas avisos
var cantDigitos = 6; // cantidad de digitos para la funcion LPAD
var console_log = function (mensaje, tipo) { // tipo = 1 (ERROR) o 2 (AVISO) 
    if (tipo == undefined) {
        tipo = 2;
    }
    if (nivelDebug > 0) {
        var tipoPrint;
        switch (tipo) {
            case 1:
                tipoPrint = "ERROR: ";
                escribirErrorLog(mensaje)
                break;
            case 2:
                tipoPrint = "AVISO: ";
                escribirMensajeLog(mensaje)
                break;
        }
        if (nivelDebug == 3) { // ERRORES MAS AVISOS
            console.log(tipoPrint + mensaje);
        } else {
            if (nivelDebug == tipo) { // solo errores o avisos
                console.log(tipoPrint + mensaje);
            }
        }
    }
};
var finalizarControl = function finalizarControl(startTime, descripcion) {
    startTime = startTime.getTime();
    var endTime = new Date();
    var tiempoTomado = endTime.getTime() - startTime;
    console.log(descripcion + " | tiempo de proceso : " + tiempoTomado / 60000 + " minutos (" + tiempoTomado + " ms)");
};
var enviarResponse = function enviarResponse(response, resultados) { // enviar respuesta al cliente
    response.send(resultados);
};
function emitirError(res, err, nombreFuncion) { // Emite un error de consulta de Base datos
    var mensaje = "ERROR EN SQL (" + nombreFuncion + "): [" + err + "]";
    console_log("se envia error al cliente: " + mensaje);
    enviarResponse(res, mensaje);
}

/* DOCUMENTACION DE ExecuteSelectPROCEDUREsinParametros : 
   
   ejecuta un procedure tipo SELECT sin parametros, y envia el JSON como resuesta al cliente.
   
   @res : variable response
   @funcionaName : Nombre del funcion web service
   @procedure : Nombre del procedure SQL
*/
var ExecuteSelectPROCEDUREsinParametros = function ExecuteSelectPROCEDUREsinParametros(res, funcionName, procedure) {
    var query = "call " + procedure + "()";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
};
/* DOCUMENTACION DE ejecutarQUERY_MYSQL:
    
    ejecuta una consulta Mysql
    
    @query: consulta a la base de datos
    @parametros :  parametros de la consulta
    @res :  respuesta al cliente
    @nombreFuncion : nombre de la funcion del web service
    @tipoRespuesta : que tipo de respuesta quiere obtener (insertId, affectedRows), eso solo se da cuando no se ejecutan procedures
    @callback : funcion callback a ejecutarse despues de obtener una respuesta
*/
var ejecutarQUERY_MYSQL = function ejecutarQUERY_MYSQL(query, parametros, res, nombreFuncion, tipoRespuesta, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            //connection.release();
            
            //res.json({"code" : 100, "status" : "Error en pool de conexiones MySQL"});
            console.log("ERR: " + JSON.stringify(err));
            return;
        }
        console_log("--------------");
            console_log(query);
            console_log(parametros);
        //console_log("Conectado a BD con ID:" + connection.threadId,2);
        //Activa funcion que ejecutara query solicitado
        connection.query(query, parametros, function (err, rows) {
            connection.release();
            if (err) {
                console.log("ERROR: " + err);
                emitirError(res, err, nombreFuncion);
            } else {
                //console_log("tamaño de resultados: "+rows.length,2);
                var resultados = new Array(); // variable donde se guarda
                if (rows.length == 2) {
                    if (typeof rows[1] == 'object') {
                        if (rows[1].insertId != undefined) { // busca si existe valores de inserciones
                            resultados = rows[0];
                        } else {
                            resultados = rows;
                        }
                    }
                } else {
                    resultados = rows;
                }
                var funcionesRespuesta = { // solo se cumple cuando no se envia en procedure
                    "insertId": rows.insertId,
                    "affectedRows": rows.affectedRows,
                    "changedRows": rows.changedRows
                };
                if (tipoRespuesta != undefined) {
                    var tipoDato = typeof tipoRespuesta;
                    //console_log("tipoRespuesta es un : "+tipoDato);
                    if (typeof tipoRespuesta == "string") {
                        resultados = [funcionesRespuesta[tipoRespuesta]]; // insertId o affectedRows
                        //console_log("resultado que se va  a enviar: "+resultados[0]);
                    } else {
                        //console_log("tipoRespuesta es una funcion");
                        tipoRespuesta(res, resultados);
                    }
                }
                if (callback != undefined) { // esta definido
                    //console_log("se ha definido una funcion de retorno, envio: "+resultados);
                    callback(res, resultados);
                } else { // no se encuentra definido
                    if (typeof tipoRespuesta != "function" && tipoRespuesta != "false") {
                        //console_log("se ha enviado la respuesta al cliente");
                        enviarResponse(res, resultados);
                    }
                }
            }
        });
        //Activa funcion que manejara algun error en la conexion asignada
        /*connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error en conexion MySQL"});
              return;     
        });*/
    });
};

var ejecutarQUERY_MYSQL_Extra = function ejecutarQUERY_MYSQL_Extra(evento, query, parametros, res, nombreFuncion, tipoRespuesta, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            //connection.release();
            console.log("ERR: " + JSON.stringify(err));
            //res.json({"code" : 100, "status" : "Error en pool de conexiones MySQL"});
            return;
        }
        console_log("--------------");
            console_log(query);
            console_log(parametros);
        //console_log("Conectado a BD con ID:" + connection.threadId );
        //Activa funcion que ejecutara query solicitado
        connection.query(query, parametros, function (err, rows) {
            connection.release();
            if (err) {
                emitirError(res, err, nombreFuncion);
            } else {
                //console_log("tamaño de resultados: "+rows.length);
                var resultados = new Array(); // variable donde se guarda
                if (rows.length == 2) {
                    if (typeof rows[1] == 'object') {
                        if (rows[1].insertId != undefined) { // busca si existe valores de inserciones
                            resultados = rows[0];
                        } else {
                            resultados = rows;
                        }
                    }
                } else {
                    resultados = rows;
                }
                var funcionesRespuesta = { // solo se cumple cuando no se envia en procedure
                    "insertId": rows.insertId,
                    "affectedRows": rows.affectedRows,
                    "changedRows": rows.changedRows
                };
                if (tipoRespuesta != undefined) {
                    var tipoDato = typeof tipoRespuesta;
                    //console_log("tipoRespuesta es un : "+tipoDato);
                    if (typeof tipoRespuesta == "string") {
                        resultados = [funcionesRespuesta[tipoRespuesta]]; // insertId o affectedRows
                        //console_log("resultado que se va  a enviar: "+resultados[0]);
                    } else {
                        //console_log("tipoRespuesta es una funcion");
                        tipoRespuesta(res, resultados, evento);
                    }
                }
                if (callback != undefined) { // esta definido
                    //console_log("se ha definido una funcion de retorno, envio: "+resultados);
                    callback(res, resultados, evento);
                } else { // no se encuentra definido
                    if (typeof tipoRespuesta != "function" && tipoRespuesta != "false") {
                        //console_log("se ha enviado la respuesta al cliente");
                        enviarResponse(res, resultados);
                    }
                }
            }
        });
        //Activa funcion que manejara algun error en la conexion asignada
        /*connection.on('error', function(err) {      
            res.json({"code" : 100, "status" : "Error en conexion MySQL"});
            return;     
        });*/
    });
}
var escribirErrorLog = function escribirErrorLog(texto) {
    escribirLog("./logs/errores.txt", " ERROR: " + texto)
}
var escribirMensajeLog = function escribirMensajeLog(texto) {
    escribirLog("./logs/mensajes.txt", " MENSAJE: " + texto)
}
var escribirLog = function escribirLog(ruta, texto) {
    var fecha = convertirAfechaString(new Date())
    var info = fecha + " " + texto + "\n";
    fs.appendFile(ruta, info, function (err) {
        if (err) {
            console.log(err);
        }
        //	    else{  26/03/2019 >>> Muchas lineas
        //	        console.log('Se escribio correctamente');
        //	    }
    });
    /*fs.exists(ruta, function (exists) {
        if(exists)
        {
            fs.readFile(ruta, 'utf8', function(err, data) {
                if( err ){
                    console.log(err)
                }
                else{
                    if(data!=""){
                        data=data+"\n";
                    }
                    var info = data+fecha+" "+texto;
                    fs.appendFile(ruta, info, function(err) {
                        if( err ){
                            console.log( err );
                        }
                        else{
                            console.log('Se escribio correctamente');
                        }
                    });
                }
            });
        }else
        {
            fs.writeFile(ruta,  {flag: 'wx'}, function (err, data){ 
                var info = fecha+" "+texto;
                fs.appendFile(ruta, info, function(err) {
                    if( err ){
                        console.log( err );
                    }
                    else{
                        console.log('Se ha escrito correctamente');
                    }
                });
            })
        }
    });*/
}
var agregarCEROaLaIzquierda = function agregarCEROaLaIzquierda(numero) { // completa con 0 los numeros menores de 10
    if (numero < 10) {
        numero = '0' + numero;
    }
    return numero;
}
var convertirAfechaString = function convertirAfechaString(fecha, conHora, segundos, formato) { // CONVIERTE UNA FECHA  STRING (en FORMATO MYSQL YYYY-MM-DD HH:mm:ss ) O DATE a un string con formato DD/MM/YY hh:mm:ss (Hora es opcional)
    try {
        /** PARAMETROS:
         * Fecha: fecha que se convertira es Obligatorio
         * conHora: si se requiere mostrar la hora o no. No es obligatorio. Su valor x defecto es TRUE
         * segundos: si se desea mostrar los segundos o no. No es Obligatorio. Su valor x defecto es TRUE
        */
        var AM_PM = "";
        var fechaSalida;
        if (conHora == undefined) {
            conHora = true;
        }
        if (conHora == true) {
            if (segundos == undefined) {
                segundos = true;
            }
        }
        if (formato == undefined) {
            formato = 24;
        }
        if (fecha == null || fecha == "") {
            console_log("se intenta convertir una fecha incorrecta, la fecha es null o vacio (convertirAfechaString)");
            return;
        } else {
            var tipoDatoFecha = typeof fecha;// Busca si la fecha es string o Date
            if (tipoDatoFecha == "object") {
                var año = fecha.getFullYear();
                var mes = agregarCEROaLaIzquierda(fecha.getMonth() + 1);
                var dia = agregarCEROaLaIzquierda(fecha.getDate());
                fechaSalida = dia + "/" + mes + "/" + año;
                if (conHora == true) { // se requiere obtener la hora de la fecha
                    var horas = agregarCEROaLaIzquierda(fecha.getHours());
                    var minutos = agregarCEROaLaIzquierda(fecha.getMinutes());
                    fechaSalida = fechaSalida + " " + horas + ":" + minutos;
                    if (segundos == true) {
                        var segundos = agregarCEROaLaIzquierda(fecha.getSeconds());
                        fechaSalida = fechaSalida + ":" + segundos;
                    }
                }
            } else { // es string
                var fechaHora = fecha.split(" ");
                var soloFecha = fechaHora[0].split("-");
                fechaSalida = soloFecha[2] + "/" + soloFecha[1] + "/" + soloFecha[0];
                if (conHora == true) {
                    if (segundos == true) {
                        fechaSalida = fechaSalida + " " + fechaHora[1];
                    } else {
                        var soloHora = fechaHora[1].split(":");
                        fechaSalida = fechaSalida + " " + soloHora[0] + ":" + soloHora[1];

                    }
                }
            }
        }
        if (formato == 12 && conHora == true) {
            fechaSalida = fechaSalida.split(" "); // separa de fecha y hora
            var soloFecha = fechaSalida[0];
            var soloHora = fechaSalida[1].split(":");
            var Hora = parseInt(soloHora[0]); // obtiene solo la hora
            var minus = soloHora[1];
            if (Hora > 12) {
                Hora = agregarCEROaLaIzquierda(Hora - 12);
                AM_PM = "PM";
            } else {
                AM_PM = "AM";
            }
            fechaSalida = soloFecha + " " + Hora + ":" + minus;
            if (segundos == true) {
                fechaSalida = fechaSalida + ":" + soloHora[2]; // agrega segundos
            }
            fechaSalida = fechaSalida + " " + AM_PM;

        }
        return fechaSalida;
    } catch (err) {
        console_log(err);
    }
}
var enviarCorreoNotificacion = function enviarCorreoNotificacion(texto) {

}

// Funciones usadas para pasar los nuevos eventos
var verificaAsociadoExiste = function verificaAsociadoExiste(req, res, funcionName, evento, callback) {
    var idAsociado = evento.idAsociado;
    if (idAsociado == 0 || idAsociado == null) {
        escribirLog("./logs/getNuevosEventos.txt", "idAsociado invalido: " + idAsociado + " [" + evento.codEvento + "]");
        enviarCorreoNotificacion("idAsociado invalido: " + idAsociado + " [" + evento.codEvento + "]");
    }
    var query = "Select idAsociado, idPersona from Asociado where idAsociado=?";
    var parametros = [idAsociado];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, resultados) {
        console_log("cantidad de registros del asociado: " + resultados.length)
        if (resultados.length > 0) { // actualizar idPersona Asociado
            evento.pa_idPersona = resultados[0].idPersona;
        }
        callback(req, res, funcionName, evento, resultados);
    })
}
var insertarPersonaAsociado = function insertarPersonaAsociado(req, res, funcionName, evento, callback) {
    escribirLog("./logs/getNuevosEventos.txt", "Se registrará una PERSONA AL ASOCIADO [" + evento.codEvento + "]");
    // Inserta Persona Asociado
    var tipoPersona = evento.pa_tipoPersona
    var nombres = evento.pa_nombres
    var apellidoPaterno = evento.pa_apellidoPaterno
    var apellidoMaterno = evento.pa_apellidoMaterno
    var razonSocial = evento.pa_razonSocial
    var nroDocumento = evento.pa_nroDocumento
    var fechaNacimiento = evento.pa_fechaNacimiento
    var provincia = evento.pa_provincia
    var idDistrito = evento.pa_idDistrito
    var calle = evento.pa_calle
    var nro = evento.pa_nro
    var mzLote = evento.pa_mzLote
    var sector = evento.pa_sector
    var referencia = evento.pa_referencia
    var idDistrito1 = evento.pa_idDistrito1
    var calle1 = evento.pa_calle1
    var nro1 = evento.pa_nro1
    var mzLote1 = evento.pa_mzLote1
    var sector1 = evento.pa_sector1
    var referencia1 = evento.pa_referencia1
    var telefonoFijo = evento.pa_telefonoFijo
    var telefonoMovil = evento.pa_telefonoMovil
    var email = evento.pa_email
    var fechaRegistro = evento.pa_fechaReg
    // Inserta Persona Asociado
    var sqlInsertPersonaAsociado = "INSERT INTO Persona (tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial," +
        " nroDocumento, fechaNacimiento, provincia, idDistrito, calle, nro, mzLote, sector, referencia, idDistrito1, calle1, nro1, mzLote1, sector1," +
        "referencia1, telefonoFijo, telefonoMovil, email, fechaRegistro)" +
        "values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    var parametros = [tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, fechaNacimiento, provincia,
        idDistrito, calle, nro, mzLote, sector, referencia, idDistrito1, calle1, nro1, mzLote1, sector1, referencia1, telefonoFijo, telefonoMovil,
        email, fechaRegistro];


    ejecutarQUERY_MYSQL(sqlInsertPersonaAsociado, parametros, res, funcionName, function (res, resultados) {
        console_log("idPersonaAsociado insertada: " + resultados.insertId)
        escribirLog("./logs/getNuevosEventos.txt", "Se inserto la PERSONA DEL ASOCIADO: " + resultados.insertId + " [" + evento.codEvento + "]");
        evento.pa_idPersona = resultados.insertId; // Actualiza el id de la persona del asociado
        callback(req, res, funcionName, evento);
    })
}
var insertarAsociado = function insertarAsociado(req, res, funcionName, evento, callback) {
    escribirLog("./logs/getNuevosEventos.txt", "Se registrara el Asociado del evento " + evento.codEvento);
    var idPersona = evento.pa_idPersona;
    var idAsociado = evento.idAsociado
    // inserta Asociado:
    var queryInsertAsociado = "Insert into Asociado values (?,?)";
    var paramsAsociado = [idAsociado, idPersona];
    ejecutarQUERY_MYSQL(queryInsertAsociado, paramsAsociado, res, funcionName, function (res, resultados) {
        console_log("Asociado insertado: " + evento.idAsociado)
        escribirLog("./logs/getNuevosEventos.txt", "Se registró el Asociado del evento " + evento.codEvento + ", idAsociado: " + evento.idAsociado);
        callback(req, res, funcionName, evento);
    })
}
var insertarCAT = function insertarCAT(req, res, funcionName, evento, callback) {
    escribirLog("./logs/getNuevosEventos.txt", "Se registrara el CAT " + evento.nroCAT + " para el evento " + evento.codEvento);
    // Inserta CAT
    var nroCAT = evento.nroCAT
    var idAsociado = evento.idAsociado
    var placa = evento.placa
    var marca = evento.marca
    var modelo = evento.modelo
    var annoFabricacion = evento.annoFabricacion
    var nMotorserie = evento.nMotorserie
    var fechaInicio = evento.fechaInicio
    var fechaCaducidad = evento.fechaCaducidad
    var fechaRegistro = evento.fechaRegCat
    var monto = evento.monto
    var fechaRecepcion = evento.fechaRecepcion
    var fechaDistribCanal = evento.fechaRecepcion
    var fechaDistribCono = evento.fechaDistribCono
    var reportado = evento.reportado
    var comision = evento.comision
    var deposito = evento.deposito

    var queryInsertCAT = "INSERT INTO Cat(nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, " +
        "nMotorserie, fechaInicio, fechaCaducidad, fechaRegistro, monto, fechaRecepcion, fechaDistribCanal, fechaDistribCono, reportado, comision, deposito)" +
        " values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var arrayParametros = [nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, fechaInicio, fechaCaducidad, fechaRegistro, monto, fechaRecepcion, fechaDistribCanal, fechaDistribCono, reportado, comision, deposito]
    ejecutarQUERY_MYSQL(queryInsertCAT, arrayParametros, res, funcionName, function (res, resultados) {
        console_log("CAT insertado: " + evento.nroCAT);
        escribirLog("./logs/getNuevosEventos.txt", "Se registró el CAT " + evento.nroCAT + " correctamente");
        callback(req, res, funcionName, evento);
    });
}
var insertarPersonaChofer = function insertarPersonaChofer(req, res, funcionName, evento, callback) {
    escribirLog("./logs/getNuevosEventos.txt", "Se registrará una PERSONA AL CHOFER [" + evento.codEvento + "]");
    // INSERTA PERSONA CHOFER
    var tipoPersona = evento.pc_tipoPersona
    var nombres = evento.pc_nombres
    var apellidoPaterno = evento.pc_apellidoPaterno
    var apellidoMaterno = evento.pc_apellidoMaterno
    var razonSocial = evento.pc_razonSocial
    var nroDocumento = evento.pc_nroDocumento
    var fechaNacimiento = evento.pc_fechaNacimiento
    var provincia = evento.pc_provincia
    var idDistrito = evento.pc_idDistrito
    var calle = evento.pc_calle
    var nro = evento.pc_nro
    var mzLote = evento.pc_mzLote
    var sector = evento.pc_sector
    var referencia = evento.pc_referencia
    var idDistrito1 = evento.pc_idDistrito1
    var calle1 = evento.pc_calle1
    var nro1 = evento.pc_nro1
    var mzLote1 = evento.pc_mzLote1
    var sector1 = evento.pc_sector1
    var referencia1 = evento.pc_referencia1
    var telefonoFijo = evento.pc_telefonoFijo
    var telefonoMovil = evento.pc_telefonoMovil
    var email = evento.pc_email
    var fechaRegistro = evento.pc_fechaReg

    var sqlInsertPersonaChofer = "INSERT INTO Persona (tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial," +
        " nroDocumento, fechaNacimiento, provincia, idDistrito, calle, nro, mzLote, sector, referencia, idDistrito1, calle1, nro1, mzLote1, sector1," +
        "referencia1, telefonoFijo, telefonoMovil, email, fechaRegistro)" +
        "values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var parametros = [tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, fechaNacimiento, provincia,
        idDistrito, calle, nro, mzLote, sector, referencia, idDistrito1, calle1, nro1, mzLote1, sector1, referencia1, telefonoFijo, telefonoMovil,
        email, fechaRegistro];
    ejecutarQUERY_MYSQL(sqlInsertPersonaChofer, parametros, res, funcionName, function (res, resultados) {
        console_log("PersonaChofer insertado: " + resultados.insertId)
        escribirLog("./logs/getNuevosEventos.txt", "Se inserto la PERSONA DEL CHOFER: " + resultados.insertId + " [" + evento.codEvento + "]");
        evento.pc_idPersona = resultados.insertId;
        callback(req, res, funcionName, evento)
    })
}
var insertarChofer = function insertarChofer(req, res, funcionName, evento, callback) {
    escribirLog("./logs/getNuevosEventos.txt", "Se registrará el chofer para el evento " + evento.codEvento);
    // INSERTA CHOFER
    var pc_idPersona = evento.pc_idPersona;
    console_log("id Chofer previo: " + evento.idChofer);
    var licenciaChofer = evento.licenciaChofer;
    var claseChofer = evento.claseChofer;
    var queryInsertChofer = "Insert into Chofer (idPersona, licenciaChofer, claseChofer) values (?,?,?)";
    var arrayParamsChofer = [pc_idPersona, licenciaChofer, claseChofer];
    ejecutarQUERY_MYSQL(queryInsertChofer, arrayParamsChofer, res, funcionName, function (res, resultados) {
        evento.idChofer = resultados.insertId;
        console_log("chofer insertado: " + evento.idChofer)
        escribirLog("./logs/getNuevosEventos.txt", "Se registró el chofer, idChofer: " + resultados.insertId + " [" + evento.codEvento + "]");
        callback(req, res, funcionName, evento)
    });
}
var verificarProcurador = function verificarProcurador(req, res, funcionName, evento, callback) {
    console_log("verificar Procurador existe")
    console_log("evento: " + evento.codEvento);
    var idProcurador = evento.idProcurador
    if (idProcurador == 0 || idProcurador == null) {
        escribirLog("./logs/getNuevosEventos.txt", "idProcurador invalido: " + idProcurador + " [" + evento.codEvento + "]");
        enviarCorreoNotificacion("idProcurador invalido: " + idProcurador + " [" + evento.codEvento + "]");
    }
    // verifica si el procurador ya existe en la BD
    var queryExisteProcurador = "Select idPersona from Procurador where idProcurador=?";
    var paramsExistProcurador = [idProcurador];
    ejecutarQUERY_MYSQL(queryExisteProcurador, paramsExistProcurador, res, funcionName, function (res, resultados) {
        callback(req, res, funcionName, evento, resultados)
    });
}
var insertarPersonaProcurador = function insertarPersonaProcurador(req, res, funcionName, evento, callback) {
    escribirLog("./logs/getNuevosEventos.txt", "Se registrará una PERSONA AL PROCURADOR [" + evento.codEvento + "]");
    // Inserta Persona Procurador 
    // Datos Persona Procurador
    var tipoPersona = evento.pp_tipoPersona
    var nombres = evento.pp_nombres
    var apellidoPaterno = evento.pp_apellidoPaterno
    var apellidoMaterno = evento.pp_apellidoMaterno
    var nroDocumento = evento.pp_nroDocumento

    var queryInsertPersonaProcurador = "Insert into Persona (tipoPersona, nombres, apellidoPaterno, apellidoMaterno, nroDocumento) " +
        "values(?,?,?,?,?)";
    var paramsPersonaProcurador = [tipoPersona, nombres, apellidoPaterno, apellidoMaterno, nroDocumento];
    ejecutarQUERY_MYSQL(queryInsertPersonaProcurador, paramsPersonaProcurador, res, funcionName, function (res, resultados) {
        console_log("Persona Procurador insertado: " + resultados.insertId);
        evento.pp_idPersona = resultados.insertId;
        escribirLog("./logs/getNuevosEventos.txt", "Se registró LA PERSONA DEL PROCURADOR correctamente, idPersona: " + resultados.insertId + " [" + evento.codEvento + "]");
        callback(req, res, funcionName, evento);
    });
}
var insertarProcurador = function insertarProcurador(req, res, funcionName, evento, callback) {
    escribirLog("./logs/getNuevosEventos.txt", "Se registrará el procurador para el evento " + evento.codEvento);
    var idProcurador = evento.idProcurador;
    var pp_idPersona = evento.pp_idPersona;
    var queryInsertProcurador = "Insert into Procurador values (?,?)";
    var arrayParamsProcurador = [idProcurador, pp_idPersona];
    ejecutarQUERY_MYSQL(queryInsertProcurador, arrayParamsProcurador, res, funcionName, function (res, resultados) {
        console_log("Procurador insertado: " + evento.idProcurador)
        escribirLog("./logs/getNuevosEventos.txt", "Se registró el procurador id " + evento.idProcurador + " para el evento " + evento.codEvento);
        callback(req, res, funcionName, evento);
    });
}
var insertarEventoInforme = function insertarEventoInforme(req, res, funcionName, evento, callback) { // Inserta Evento, Informe, Agraviados y Vehiculos Informados
    escribirLog("./logs/getNuevosEventos.txt", "Se registrará el evento " + evento.codEvento);
    // INSERTA EVENTO  
    // Datos del evento
    var codEvento = evento.codEvento;
    var idProcurador = evento.idProcurador
    var fechaAccidente = evento.fechaAccidente
    var lugarAccidente = evento.lugarAccidente
    var idDistrito = evento.idDistrito
    var nroCAT = evento.nroCAT
    var nombreContacto = evento.nombreContacto
    var telefonoContacto = evento.telefonoContacto
    var idChofer = evento.idChofer
    var idPropietario = evento.idPropietario
    var esRecupero = evento.esRecupero
    var fechaRegistro = evento.fechaRegistro
    var estado = evento.estado
    var condonado = evento.condonado

    var queryInsertaEvento = "INSERT INTO Evento values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var parametrosEvento = [codEvento, idProcurador, fechaAccidente, lugarAccidente, idDistrito, nroCAT, nombreContacto, telefonoContacto, idChofer, idPropietario, esRecupero, fechaRegistro, estado, condonado]
    ejecutarQUERY_MYSQL_Extra(evento, queryInsertaEvento, parametrosEvento, res, funcionName, function (res, resultados, evento) {
        console_log("se inserto el evento: " + evento.codEvento);
        escribirLog("./logs/getNuevosEventos.txt", "Se registró el evento " + evento.codEvento + " correctamente");
        // datos del informe:
        //var idInforme= evento.idInforme
        if (evento.idInforme == 0 || evento.idInforme == null) {
            escribirLog("./logs/getNuevosEventos.txt", "idInforme invalido: " + evento.idInforme + " [" + evento.codEvento + "]");
            enviarCorreoNotificacion("idInforme invalido: " + evento.idInforme + " [" + evento.codEvento + "]");
        } else {
            var codEvento = evento.codEvento
            var idTipoAccidente = evento.idTipoAccidente
            var idAsociado = evento.idAsociado
            var idProcurador = evento.idProcurador
            var idPropietario = evento.idPropietario
            var idChofer = evento.idChofer
            var idPropietario2 = evento.idPropietario2
            var madreChofer = evento.madreChofer
            var padreChofer = evento.padreChofer
            var numheridos = evento.numheridos
            var comisaria = evento.comisaria
            var distritoComisaria = evento.distritoComisaria
            var codigoDenuncia = evento.codigoDenuncia
            var causal1 = evento.causal1
            var causal2 = evento.causal2
            var fechaInforme = evento.fechaInforme

            var queryInsertInforme = "INSERT INTO Informe(codEvento, idTipoAccidente, idAsociado, idProcurador, idPropietario, " +
                "idChofer, idPropietario2, madreChofer, padreChofer, numheridos, comisaria, distritoComisaria, codigoDenuncia, causal1, causal2, fechaInforme) " +
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            var arrayParametros = [codEvento, idTipoAccidente, idAsociado, idProcurador, idPropietario, idChofer, idPropietario2, madreChofer, padreChofer,
                numheridos, comisaria, distritoComisaria, codigoDenuncia, causal1, causal2, fechaInforme];

            ejecutarQUERY_MYSQL_Extra(evento, queryInsertInforme, arrayParametros, res, funcionName, function (res, resultados, evento) {
                evento.idInforme = resultados.insertId;
                console_log("se inserto el informe id: " + evento.idInforme);
                escribirLog("./logs/getNuevosEventos.txt", "Se registró el Informe  correctamente. idInforme: " + evento.idInforme + " [" + evento.codEvento + "]");
                // Inserta vehiculos informados:
                var vehiculos = evento.ListaVehiculosInformados
                var arrayParametros = []
                escribirLog("./logs/getNuevosEventos.txt", "Se encontraron " + vehiculos.length + " vehiculo(s) por registrar. [" + evento.codEvento + "]");
                if (vehiculos.length > 0) {
                    var query = "Insert into Vehiculos_Informados (idInforme, placa, motor, marca, anno, color, kilometro, cia, fechaRegistro) " +
                        "values ";
                    var stringVehiculos = "";
                    for (var i = 0; i < vehiculos.length; i++) {
                        if (i > 0) {
                            stringVehiculos = stringVehiculos + ", ";
                        }
                        //arrayParametros.push(vehiculos[i].idVehiculoInformado);
                        arrayParametros.push(evento.idInforme)
                        arrayParametros.push(vehiculos[i].placa)
                        arrayParametros.push(vehiculos[i].motor)
                        arrayParametros.push(vehiculos[i].marca)
                        arrayParametros.push(vehiculos[i].anno)
                        arrayParametros.push(vehiculos[i].color)
                        arrayParametros.push(vehiculos[i].kilometro)
                        arrayParametros.push(vehiculos[i].cia)
                        arrayParametros.push(vehiculos[i].fechaRegistro)

                        stringVehiculos = stringVehiculos + "(?,?,?,?,?,?,?,?,?)";
                    }
                    query = query + stringVehiculos + " ;";
                    ejecutarQUERY_MYSQL_Extra(evento, query, arrayParametros, res, funcionName, function (res, resultados, evento) {
                        escribirLog("./logs/getNuevosEventos.txt", "Se registraron " + resultados.affectedRows + " vehiculo(s) correctamente. [" + evento.codEvento + "]");
                        // Inserta Agraviados
                        insertarAgraviados(req, res, evento);
                    });
                } else {
                    // Inserta Agraviados   
                    insertarAgraviados(req, res, evento);
                }
            });
        }
    })
}
var insertarAgraviados = function insertarAgraviados(res, funcionName, evento) {
    console.log("Insertando Agraviados " + evento.codEvento);
    var agraviados = evento.ListaAgraviados;
    escribirLog("./logs/getNuevosEventos.txt", "Se encontraron " + agraviados.length + " por registrar. [" + evento.codEvento + "]");
    if (agraviados.length == 0) {
        escribirLog("./logs/getNuevosEventos.txt", "No se encontraron agraviados [" + evento.codEvento + "]");
        enviarCorreoNotificacion("No se encontraron agraviados [" + evento.codEvento + "]");
    }
    for (var y = 0; y < agraviados.length; y++) {
        // Persona Agraviado:
        var tipoPersona = agraviados[y].tipoPersona;
        var nombres = agraviados[y].nombres;
        var apellidoPaterno = agraviados[y].apellidoPaterno;
        var apellidoMaterno = agraviados[y].apellidoMaterno;
        //var razonSocial=agraviados[y].razonSocial;
        var nroDocumento = agraviados[y].nroDocumento;
        var fechaNacimiento = agraviados[y].fechaNacimiento;
        var provincia = agraviados[y].provincia;
        var idDistrito = agraviados[y].idDistrito;
        var calle = agraviados[y].calle;
        var nro = agraviados[y].nro;
        var mzLote = agraviados[y].mzLote
        var sector = agraviados[y].sector;
        var referencia = agraviados[y].referencia;
        var idDistrito1 = agraviados[y].idDistrito1;
        var calle1 = agraviados[y].calle1;
        var nro1 = agraviados[y].nro1;
        var mzLote1 = agraviados[y].mzLote1;
        var sector1 = agraviados[y].sector1;
        var referencia1 = agraviados[y].referencia1;
        var telefonoFijo = agraviados[y].telefonoFijo;
        var telefonoMovil = agraviados[y].telefonoMovil;
        var email = agraviados[y].email;
        var fechaRegistro = agraviados[y].fechaRegistro;

        // AGRAVIADO:
        var codAgraviado = agraviados[y].codAgraviado;
        var codEvento = agraviados[y].codEvento;
        var fechaIngreso = agraviados[y].fechaIngreso;
        var diagnostico = agraviados[y].diagnostico;
        var tipo = agraviados[y].tipo;
        var fechaRegistroAgraviado = agraviados[y].fechaRegistroAgraviado;

        var parametros = [tipoPersona, nombres, apellidoPaterno, apellidoMaterno, nroDocumento, fechaNacimiento, provincia,
            idDistrito, calle, nro, mzLote, sector, referencia, idDistrito1, calle1, nro1, mzLote1, sector1, referencia1, telefonoFijo, telefonoMovil,
            email, fechaRegistro, codAgraviado, codEvento, fechaIngreso, diagnostico, tipo, fechaRegistroAgraviado];

        var queryInsertPersonaAgraviado = "Call sp_insertarAgraviado(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        ejecutarQUERY_MYSQL_Extra([codAgraviado, codEvento], queryInsertPersonaAgraviado, parametros, res, funcionName, function (res, resultados, agraviadoEvento) {
            escribirLog("./logs/getNuevosEventos.txt", "Se registro el agraviado " + agraviadoEvento[0] + " correctamente [" + agraviadoEvento[1] + "]");
        });

    }
}
// ** fin de funciones de eventos ***

var number_format = function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '')
        .replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + (Math.round(n * k) / k)
                .toFixed(prec);
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
        .split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '')
        .length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1)
            .join('0');
    }
    return s.join(dec);
};

var executePDF = function executePDF($titulo, $idAcuerdo, $fechaAcuerdo, $deudaAcuerdo, $codEvento, $fechaEvento, $descripcionEvento, $cabecera3, $parteUltima, res) {
    var width = 840;
    var html = "<html>" +
        "<head>" +
        "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'>" +
        "</head>" +
        "<body style='padding-top:16px; zoom: 75%;'>" +  //OjO cambio modulo (html-pdf: zoom)
        "<div id = 'cuerpo' style='margin:auto; width:" + width + "px; height:800px; text-align:justify; '> <!-- CUERPO DEL PDF -->" +
        "<br>" +
        // R "<div id='Titulo' style='font-size:19px; font-weight:bold;'>" +
        //$titulo +
        // R "</div>" +
        "" +
        "<br>" +
        "<div style='width:280px; height:145px;  float:left; clear:both; font-size:18px; font-weight:bold; '><img src='" + urldominio + "images/autoseguro.jpg' style='width:280px; height:auto;  float:right; margin-top:-46px; font-size:18px; font-weight:bold;'>"+ $titulo +"</div>"+
        "<div style='height:75px; margin-top:160px;'>" +
        "<table style='width:400px; float:left;'>" +
        "<col style='width:55%'>" +
        "<col style='width:45%'>" +
        "<tr style='font-size:14px; vertical-align:middle;'>" +
        "<td style='font-weight:bold; text-align:left;'>Nro Acuerdo</td>" +
        "<td>:&nbsp;&nbsp;&nbsp;" + $idAcuerdo + "</td>" +
        "</tr>" +
        "<tr style='font-size:14px; vertical-align:middle;'>" +
        "<td style='font-weight:bold; text-align:left;'>Fecha de Acuerdo</td>" +
        "<td>:&nbsp;&nbsp;&nbsp;" + $fechaAcuerdo + "</td>" +
        "</tr>" +
        "<tr style='font-size:14px; vertical-align:middle;'>" +
        "<td style='font-weight:bold; text-align:left;'>Deuda Acordada</td>" +
        "<td>:&nbsp;&nbsp;&nbsp;" + $deudaAcuerdo + "</td>" +
        "</tr>" +
        "</table>" +
        "<table style='width:400px; float:right; '>" +
        "<col style='width:40%'>" +
        "<col style='width:60%'>" +
        "<tr style='font-size:14px; vertical-align:middle;'>" +
        "<td style='font-weight:bold; text-align:left;'>Cod Evento</td>" +
        "<td>:&nbsp;&nbsp;&nbsp;" + $codEvento + "</td>" +
        "</tr>" +
        "<tr style='font-size:14px; vertical-align:middle;'>" +
        "<td style='font-weight:bold; text-align:left;'>Fecha de Evento</td>" +
        "<td>:&nbsp;&nbsp;&nbsp;" + $fechaEvento + "</td>" +
        "</tr>" +
        "<tr style='font-size:14px; vertical-align:middle;'>" +
        "<td style='font-weight:bold; text-align:left;'>Descripción</td>" +
        "<td>:&nbsp;&nbsp;&nbsp;" + $descripcionEvento + "</td>" +
        "</tr>" +
        "</table>" +
        "</div>" +
        $cabecera3 +
        $parteUltima +
        "</div>" +
        "</body>" +
        "</html>";
    console_log("por generar PDF");
    generatePDF(html, "", res);
}
var generatePDF = function generatePDF(htmlCode, footer, res, footHeight) {
    /* 
    var paperSize = {}
    if (footHeight != undefined) {
        paperSize.footerHeight = footHeight;
    }
    var conversion = require("phantom-html-to-pdf")();
    conversion({ html: htmlCode, footer: footer, paperSize: paperSize }, function (err, pdf) {
        pdf.stream.pipe(res);
    });
  */
    const pdf = require('html-pdf');
    var options = { format: 'A4' };
    if (footHeight != undefined) {
        options.footer = {
            "height": footHeight,
            "contents": footer
        }
    }
    pdf.create(htmlCode, options).toStream(function (err, stream) {
        if (err) {
            console.log(err);
        } else {
            stream.pipe(res)
        }
    });
}

var agregarLimit = function agregarLimit(pagina, cantidadPorPagina, query) {
    var inicio = (pagina - 1) * cantidadPorPagina;
    //var fin = pagina*cantidadPorPagina;
    query = query + " limit " + inicio + ", " + cantidadPorPagina;
    return query;
}
var eliminacionGeneral = function (req, res, funcionName) {
    var nombreTabla = req.query.nombreTabla;
    var keyField = req.query.keyField;
    var keyValue = req.query.keyValue;
    var query = "Delete from " + nombreTabla + " where " + keyField + " = ? ";
    var arrayParametros = [keyValue];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows");
}
var convertirAfechaString = function convertirAfechaString(fecha, conHora, segundos, formato) { // CONVIERTE UNA FECHA  STRING (en FORMATO MYSQL YYYY-MM-DD HH:mm:ss ) O DATE a un string con formato DD/MM/YY hh:mm:ss (Hora es opcional)
    try {
        /** PARAMETROS:
         * Fecha: fecha que se convertira es Obligatorio
         * conHora: si se requiere mostrar la hora o no. No es obligatorio. Su valor x defecto es TRUE
         * segundos: si se desea mostrar los segundos o no. No es Obligatorio. Su valor x defecto es TRUE
         */
        var AM_PM = "";
        var fechaSalida;
        if (conHora == undefined) {
            conHora = true;
        }
        if (conHora == true) {
            if (segundos == undefined) {
                segundos = true;
            }
        }
        if (formato == undefined) {
            formato = 24;
        }
        if (fecha == null || fecha == "") {
            fancyAlert("se intenta convertir una fecha incorrecta, la fecha es null o vacio (convertirAfechaString)");
            return;
        } else {
            var tipoDatoFecha = typeof fecha;// Busca si la fecha es string o Date
            if (tipoDatoFecha == "object") {
                var año = fecha.getFullYear();
                var mes = agregarCEROaLaIzquierda(fecha.getMonth() + 1);
                var dia = agregarCEROaLaIzquierda(fecha.getDate());
                fechaSalida = dia + "/" + mes + "/" + año;
                if (conHora == true) { // se requiere obtener la hora de la fecha
                    var horas = agregarCEROaLaIzquierda(fecha.getHours());
                    var minutos = agregarCEROaLaIzquierda(fecha.getMinutes());
                    fechaSalida = fechaSalida + " " + horas + ":" + minutos;
                    if (segundos == true) {
                        var segundos = agregarCEROaLaIzquierda(fecha.getSeconds());
                        fechaSalida = fechaSalida + ":" + segundos;
                    }
                }
            } else { // es string
                var fechaHora = fecha.split(" ");
                var soloFecha = fechaHora[0].split("-");
                fechaSalida = soloFecha[2] + "/" + soloFecha[1] + "/" + soloFecha[0];
                if (conHora == true) {
                    if (segundos == true) {
                        fechaSalida = fechaSalida + " " + fechaHora[1];
                    } else {
                        var soloHora = fechaHora[1].split(":");
                        fechaSalida = fechaSalida + " " + soloHora[0] + ":" + soloHora[1];

                    }
                }
            }
        }
        if (formato == 12 && conHora == true) {
            fechaSalida = fechaSalida.split(" "); // separa de fecha y hora
            var soloFecha = fechaSalida[0];
            var soloHora = fechaSalida[1].split(":");
            var Hora = parseInt(soloHora[0]); // obtiene solo la hora
            var minus = soloHora[1];
            if (Hora > 12) {
                Hora = agregarCEROaLaIzquierda(Hora - 12);
                AM_PM = "PM";
            } else {
                Hora = agregarCEROaLaIzquierda(Hora);
                AM_PM = "AM";
            }
            fechaSalida = soloFecha + " " + Hora + ":" + minus;
            if (segundos == true) {
                fechaSalida = fechaSalida + ":" + soloHora[2]; // agrega segundos
            }

            fechaSalida = fechaSalida + " " + AM_PM;

        }
        return fechaSalida;
    } catch (err) {
        emitirErrorCatch(err, "fechaFormateada");
    }
}
var dateTimeFormat = function dateTimeFormat(fecha) { // devuelve fecha en formato YYYY-dd-mm hh:mm:ss (solo se acepta fechas con el formato dd/mm/YYYY HH:mm:ss)
    try {
        if (fecha != "") {
            var partir_fecha = fecha.split(" ");
            var soloFecha = partir_fecha[0].split("/");
            var fechaConvertida = soloFecha[2] + "-" + soloFecha[1] + "-" + soloFecha[0];
            if (partir_fecha.length > 1) { // esta fecha tiene asignada hora
                fechaConvertida = fechaConvertida + " " + partir_fecha[1];
            }
            return fechaConvertida;
        } else {
            return fecha;
        }

    } catch (err) {
        emitirErrorCatch(err, "dateTimeFormat");
    }
}
var QueryWhere = function QueryWhere(queryInicial) {
    this.query = queryInicial;
    this.validarWhere = function (parametros) {
        if (this.query != "") {
            this.query = this.query + " and " + parametros;
        } else {
            this.query = " where " + parametros;
        }
    }
    this.getQueryWhere = function () {
        return this.query;
    }
}
module.exports.key = key;
module.exports.urldominio = urldominio;
module.exports.console_log = console_log;
module.exports.finalizarControl = finalizarControl;
module.exports.enviarResponse = enviarResponse;
module.exports.emitirError = emitirError;
module.exports.ExecuteSelectPROCEDUREsinParametros = ExecuteSelectPROCEDUREsinParametros;
module.exports.ejecutarQUERY_MYSQL = ejecutarQUERY_MYSQL;
module.exports.ejecutarQUERY_MYSQL_Extra = ejecutarQUERY_MYSQL_Extra;
module.exports.escribirLog = escribirLog;
module.exports.escribirErrorLog = escribirErrorLog;
module.exports.escribirMensajeLog = escribirMensajeLog;
module.exports.agregarCEROaLaIzquierda = agregarCEROaLaIzquierda;
module.exports.convertirAfechaString = convertirAfechaString;
module.exports.enviarCorreoNotificacion = enviarCorreoNotificacion;
module.exports.verificaAsociadoExiste = verificaAsociadoExiste;
module.exports.insertarPersonaAsociado = insertarPersonaAsociado;
module.exports.insertarAsociado = insertarAsociado;
module.exports.insertarCAT = insertarCAT;
module.exports.insertarPersonaChofer = insertarPersonaChofer;
module.exports.insertarChofer = insertarChofer;
module.exports.verificarProcurador = verificarProcurador;
module.exports.insertarPersonaProcurador = insertarPersonaProcurador;
module.exports.insertarProcurador = insertarProcurador;
module.exports.insertarEventoInforme = insertarEventoInforme;
module.exports.insertarAgraviados = insertarAgraviados;
module.exports.number_format = number_format;
module.exports.executePDF = executePDF;
module.exports.generatePDF = generatePDF;
module.exports.agregarLimit = agregarLimit;
module.exports.eliminacionGeneral = eliminacionGeneral;
module.exports.cantDigitos = cantDigitos;
module.exports.convertirAfechaString = convertirAfechaString;
module.exports.dateTimeFormat = dateTimeFormat
module.exports.QueryWhere = QueryWhere