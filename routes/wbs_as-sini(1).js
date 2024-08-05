/**
 * Created by JEAN PIERRE on 1/06/2016.
 */
// Web service para el modulo AS-SINI
/* ***** funciones que se importan del modulo global *** */
var modulo_global = require("../global/global");
var console_log = modulo_global.console_log;
var enviarResponse = modulo_global.enviarResponse;
var emitirError = modulo_global.emitirError;
var ejecutarQUERY_MYSQL = modulo_global.ejecutarQUERY_MYSQL;
var ejecutarQUERY_MYSQL_Extra = modulo_global.ejecutarQUERY_MYSQL_Extra;
var agregarLimit = modulo_global.agregarLimit;
var eliminacionGeneral = modulo_global.eliminacionGeneral;
var agregarCEROaLaIzquierda = modulo_global.agregarCEROaLaIzquierda;
var ExecuteSelectPROCEDUREsinParametros = modulo_global.ExecuteSelectPROCEDUREsinParametros;
/**********************************************************/
var pool = require('./connection').pool; //recupera el pool de conexiones
var nodemailer = require('nodemailer'); // libreria para el envio de correos en NODE
function QueryWhere(queryInicial){
    this.query=queryInicial;
    this.validarWhere = function(parametros){
        if(this.query != ""){
            this.query = this.query+" and "+parametros;
        }else{
            this.query = " where "+parametros;
        }
    }
    this.getQueryWhere=function(){
        return this.query;
    }
}
exports.getEventos=function(req, res, funcionName){ // Busca los eventos ingresados por la central de emergencia y la muestra en la grilla
    var codEvento = req.query.codEvento;
    var placa = req.query.placa;
    var cat = req.query.cat;
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
    var orderBy = "e.codEvento"; // campo de ordenado
    var queryWhere = new QueryWhere(""); // Instancia el query de WHERE FILTROS
    if(codEvento!=""){
        queryWhere.validarWhere("e.codEvento like '"+codEvento+"%'");
    }if(placa!=""){
        queryWhere.validarWhere("e.placaAccidente like '"+placa+"%'");
    }if(cat!=""){
        queryWhere.validarWhere("e.polizaAccidente = '"+cat+"'");
    }if(fechaDesde!="" || fechaHasta!=""){
        orderBy = "e.fechaAccidente";
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere("( e.fechaAccidente between '"+fechaDesde+"' and '"+fechaHasta+"' )");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere("e.fechaAccidente>='"+fechaDesde+"'");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere("e.fechaAccidente<='"+fechaHasta+"'");
            }
        }
    }
    var queryGeneral = "Select e.codEvento, e.idProcurador, c.nroCAT, c.placa,  Concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, "+
        " pa.razonSocial, pa.tipoPersona, date_format (e.fechaAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, e.lugarAccidente, e.placaAccidente, e.polizaAccidente, e.DNIChoferAccidente, "+
        " e.choferAccidente , e.idNosocomio , e.idComisaria, e.idTipoAccidente, e.lugarAccidente, e.idDistrito as distritoAccidente, e.referenciaAccidente, "+
        " c.marca, c.modelo, c.annoFabricacion as anno,  date_format (c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, i.idInforme from Evento e left join Cat c on e.polizaAccidente = c.nroCAT "+
        " left join Asociado a on c.idAsociado = a.idAsociado "+
        " left join Persona pa on a.idPersona = pa.idPersona " +
        " left join Informe i on e.codEvento = i.codEvento "+queryWhere.getQueryWhere()+" order by "+orderBy+" desc";
    queryGeneral = agregarLimit(page, registrosxpagina, queryGeneral);
    ejecutarQUERY_MYSQL(queryGeneral,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
            if(orderBy=='e.fechaAccidente'){
                orderBy=1; // indice de la columna de Ordenamiento "Fecha de Accidente" en la grilla
            }else{
                orderBy=0; // indice de la columna de Ordenamiento "Cod. Evento" en la grilla.
            }
            resultados[0].orderBy=orderBy;
            if(cantPaginas==0){
                var queryCantidad="Select count(*) as cantidad from Evento e left join Cat c on e.polizaAccidente = c.nroCAT "+
                    " left join Asociado a on c.idAsociado = a.idAsociado "+
                    " left join Persona pa on a.idPersona = pa.idPersona "+queryWhere.getQueryWhere();
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function(res, rows, resultados){
                    var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    enviarResponse(res, resultados);
                });
            }else{
                enviarResponse(res, resultados);
            }
        }else{
            enviarResponse(res, resultados);
        }
    });
}
exports.eliminacionGeneral=function(req, res, funcionName){
    eliminacionGeneral(req, res, funcionName); // elimina un registro de cualquier tabla, especifandole por parametros la tabla a eliminar y el campo por el cual se eliminara.
}
exports.eliminarEvento=function(req, res, funcionName){ // elimina un evento y sus agraviados, que no tenga ningun procurador asignado.
    var codEvento = req.query.codEvento;
    var query = "Select codEvento from Evento where codEvento=? and (idProcurador=0 or idProcurador is null )"; // verifica si el evento esta apto a eliminar
    var arrayParametros = [codEvento];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
        if(resultados.length==0){
            // El evento no esta apto para eliminar
            enviarResponse(res, [0]);
        }else{
            // elimina agraviados y evento:
            var queryProcedure= "call sp_eliminarEvento(?,@)";
            ejecutarQUERY_MYSQL(queryProcedure, arrayParametros, res, funcionName, function(res, resultados){
                var filasAfectadas=[resultados[0].filasAfectadas];
                enviarResponse(res, filasAfectadas); // Envia la cantidad de filas eliminadas (=1).
            });
        }
    });
}
exports.getListaProcuradores = function(req, res, funcionName){
    var query = "Select pr.idProcurador, concat(pe.Nombres,' ', pe.Apellidos) as nombreProcurador, pe.email as correo from Procurador pr inner join UsuarioIntranet pe on pr.idUsuario = pe.idUsuario ";
    ejecutarQUERY_MYSQL(query,[],res, funcionName)
}
exports.asignarProcurador = function(req, res, funcionName){ // Asigna un procurador a un evento
    var codEvento = req.query.codEvento;
    var idProcurador = req.query.idProcurador;
    var query = "Update Evento e left join Informe i on e.codEvento = i.codEvento set e.idProcurador = ? where e.codEvento = ? and ( i.idInforme = 0 or i.idInforme is null) ";
    var arrayParametros = [idProcurador, codEvento]
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
        if(resultados.affectedRows>0){ // se llego asignar
            // envia correo al procurador asignado
            var correo = req.query.correo;
            var transporter = nodemailer.createTransport('smtps://jeanmaita50%40gmail.com:jean19lima190691@smtp.gmail.com');
            var mailOptions = {
                from: 'informes@autoseguro.pe', // sender address
                to: correo,
                subject: 'Asignación de Evento', // Subject line
                text: 'Se le asignó el evento '+codEvento, // plaintext body
                html: '<b>Se le asignó el evento '+codEvento+'</b>' // html body
            };
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
            var idProcuradorPrevio = req.query.idProcuradorPrevio;
            if(idProcuradorPrevio>0){
             var correoProcuradorPrevio = req.query.correoProcuradorPrevio;
                var mailOptions = {
                    from: 'informes@autoseguro.pe', // sender address
                    to: correoProcuradorPrevio,
                    subject: 'Asignación cancelada', // Subject line
                    text: 'Se canceló su asignación para el evento '+codEvento, // plaintext body
                    html: '<b>Se canceló su asignación para el evento '+codEvento+'</b>' // html body
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                });
            }
        }
        enviarResponse(res, [resultados.affectedRows]);
    }); // devuelve al cliente la cantidad de filas afectadas
}
exports.getListaTipoAccidentes = function(req, res, funcionName){ // obtiene todos los registros de la Tabla TipoAccidente, campos: idTipoAccidente, descripcion
    var procedure = "sp_getTipoAccidentes";
    ExecuteSelectPROCEDUREsinParametros(res, funcionName, procedure);
}
exports.getListaCausales = function(req, res, funcionName){
    var procedure = "sp_getAllCausales";
    ExecuteSelectPROCEDUREsinParametros(res, funcionName, procedure);
}
exports.getListaNosocomios = function(req, res, funcionName){ // obtiene todos los registros de la Tabla Nosocomio, campos: idNosocomio, nombre
    var idDistrito = req.query.idDistrito;
    var arrayParametros = [idDistrito];
    var query = "Call sp_getNosocomios(?)";
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getListaComisarias = function(req, res, funcionName){ // obtiene todos los registros de la Tabla Comisaria, campos: idComisaria, nombre
    var idDistrito = req.query.idDistrito;
    var arrayParametros = [idDistrito];
    var query = "Call sp_getComisarias(?)";
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.buscarPoliza = function(req, res, funcionName){
    var placa = req.query.placa;
    var nroCAT = req.query.nroCAT;
    var queryWhere = new QueryWhere(""); // Instancia el query de WHERE FILTROS
    if(placa!=""){
        queryWhere.validarWhere(" c.placa='"+placa+"' ");
    }if(nroCAT!=""){
        queryWhere.validarWhere(" c.nroCAT='"+nroCAT+"' ");
    }
    var query = "Select c.idAsociado, c.nroCAT, c.placa, c.marca, c.modelo, c.annoFabricacion as anno, c.fechaCaducidad, pa.tipoPersona, pa.nroDocumento, pa.razonSocial, concat(pa.nombres,' ',pa.apellidoPaterno,' ', pa.apellidoMaterno) as nombreAsociado," +
        " date_format (c.fechaCaducidad, '%d/%m/%Y') as vencPoliza, pa.idDistrito as distrito_a, pa.calle as calle_a, pa.nro as nro_a, pa.mzLote as mzLote_a, pa.sector as sector_a, pa.referencia as referencia_a "+
        " from Cat c inner join Asociado a on c.idAsociado=a.idAsociado inner join Persona pa on a.idPersona = pa.idPersona "+queryWhere.getQueryWhere();
    ejecutarQUERY_MYSQL(query, [], res, funcionName)
}
exports.getPersonaByNroDoc = function(req, res, funcionName){
    var nroDoc = req.query.nroDoc;
    var query="call sp_getPersonaByNroDoc(?)";
    var arrayParametros = [nroDoc];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAgraviados = function(req, res, funcionName){
    var codEvento = req.query.codEvento;
    var query = "Select codAgraviado, nombreAccidente, edadAccidente, dniAccidente, diagnosticoAccidente from Agraviado where codEvento = ?";
    var arrayParametros = [codEvento];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.registrarEvento = function(req, res, funcionName){
    // recibe parametros POST Del Evento:
    //var codEvento = req.body.codEvento;
    var placaAccidente = req.body.placaAccidente;
    var polizaAccidente = req.body.polizaAccidente;
    var fechaAccidente = req.body.fechaAccidente;
    var idTipoAccidente = req.body.idTipoAccidente;
    var idNosocomio = req.body.idNosocomio;
    var idComisaria = req.body.idComisaria;
    var idDistritoAccidente = req.body.idDistritoAccidente;
    var lugarAccidente = req.body.lugarAccidente;
    var referencia = req.body.referencia;
    var dniChofer= req.body.dniChofer;
    var nombreChofer = req.body.nombreChofer;
    var listaAgraviados = req.body.listaAgraviados;
    // obtiene ultimo evento del mes
    var fechaActual = new Date();
    var año = fechaActual.getFullYear();
    var mes = agregarCEROaLaIzquierda(fechaActual.getMonth()+1);
    var queryUltimoEvento = "Select codEvento from Evento where codEvento like 'E"+año+mes+"%' order by codEvento desc limit 1";
    ejecutarQUERY_MYSQL(queryUltimoEvento, [], res, funcionName, function(res, resultados){
      var codEvento;
      if(resultados.length==0){
          codEvento="E"+año+mes+"0001";
      }else{
          var numeroEvento=(parseInt(resultados[0].codEvento.substring(7))+1)+"";
          var cantidadDigitosCero = 4-numeroEvento.split("").length;
          for(var i= 1; i<=cantidadDigitosCero; i++){
              numeroEvento="0"+numeroEvento;
          }
          codEvento="E"+año+mes+numeroEvento;
      }
        // registra el evento:
        var queryInsert="Insert into Evento(codEvento, fechaAccidente, lugarAccidente, idDistrito, fechaRegistro, placaAccidente, polizaAccidente, DNIChoferAccidente, choferAccidente, "+
            "idNosocomio, idComisaria, idTipoAccidente, referenciaAccidente) values (?,?,?,?, CURRENT_TIMESTAMP,?,?,?,?,?,?,?,?)";
        var arrayParametros = [codEvento, fechaAccidente, lugarAccidente, idDistritoAccidente, placaAccidente, polizaAccidente,dniChofer,
            nombreChofer, idNosocomio, idComisaria, idTipoAccidente, referencia];
        ejecutarQUERY_MYSQL_Extra(codEvento, queryInsert, arrayParametros, res, funcionName, function(res, resultados, codEvento){
            var filasAfectadas = resultados.affectedRows;
            if(filasAfectadas>0){
                // registra agraviados
                for(var i=0; i<listaAgraviados.length; i++){
                    registrarAgraviado(listaAgraviados[i], i+1, codEvento, res, funcionName);
                }
            }
            enviarResponse(res, [filasAfectadas]);
        })

    })
}
function registrarAgraviado(agraviado, indice, evento, res, funcionName){
    var fechaActual = new Date();
    var año = fechaActual.getFullYear();
    var mes = agregarCEROaLaIzquierda(fechaActual.getMonth()+1);
    var queryUltimoAgraviado = "Select codAgraviado from Agraviado where codAgraviado like 'S"+año+mes+"%' order by codAgraviado desc limit 1";
    ejecutarQUERY_MYSQL(queryUltimoAgraviado, [], res, funcionName, function(res, resultados){
        var codEvento;
        var numeroAgraviado=0;
        if(resultados.length>0){
            var numeroAgraviado=parseInt(resultados[0].codAgraviado.substring(7));
        }
        console.log("num agraviado: "+numeroAgraviado);
        numeroAgraviado=numeroAgraviado+indice;
        console.log("nuevo num agraviado: "+numeroAgraviado);
        numeroAgraviado=numeroAgraviado+"";
        var cantidadDigitosCero = 4-numeroAgraviado.split("").length;
        for(var i= 1; i<=cantidadDigitosCero; i++){
            numeroAgraviado="0"+numeroAgraviado;
        }
        numeroAgraviado="S"+año+mes+numeroAgraviado;
        var queryInsert = "INSERT Into Agraviado (codAgraviado, codEvento, nombreAccidente, edadAccidente, dniAccidente, diagnosticoAccidente) values "+
            "(?,?,?,?,?,?)";
        var arrayParametros = [numeroAgraviado, evento,  agraviado.nombreAgraviado, agraviado.edadAgraviado, agraviado.dniAgraviado, agraviado.diagnosticoAgraviado];
        ejecutarQUERY_MYSQL(queryInsert, arrayParametros, res, funcionName, "false");
    });
}
function actualizarAgraviado(agraviado, res, funcionName){
    var query = "update Agraviado set nombreAccidente = ?, edadAccidente = ?, dniAccidente = ?, diagnosticoAccidente = ? where codAgraviado = ?";
    var parametros = [agraviado.nombreAgraviado, agraviado.edadAgraviado, agraviado.dniAgraviado, agraviado.diagnosticoAgraviado, agraviado.codAgraviado];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "false");
}
exports.actualizarEvento = function(req, res, funcionName){
    var codEvento = req.body.codEvento;
    var placaAccidente = req.body.placaAccidente;
    var polizaAccidente = req.body.polizaAccidente;
    var fechaAccidente = req.body.fechaAccidente;
    var idTipoAccidente = req.body.idTipoAccidente;
    var idNosocomio = req.body.idNosocomio;
    var idComisaria = req.body.idComisaria;
    var idDistritoAccidente = req.body.idDistritoAccidente;
    var lugarAccidente = req.body.lugarAccidente;
    var referencia = req.body.referencia;
    var dniChofer= req.body.dniChofer;
    var nombreChofer = req.body.nombreChofer;
    var listaAgraviados = req.body.listaAgraviados;
    var queryUpdateEvento = "Update Evento set fechaAccidente=?, lugarAccidente=?, idDistrito=?, placaAccidente=?, polizaAccidente=?, DNIChoferAccidente=?, "+
        " choferAccidente=?, idNosocomio=?, idComisaria=?, idTipoAccidente=?, referenciaAccidente=? where codEvento = ?";
    var arrayParametros = [fechaAccidente, lugarAccidente, idDistritoAccidente, placaAccidente, polizaAccidente, dniChofer, nombreChofer,
        idNosocomio, idComisaria, idTipoAccidente, referencia, codEvento];
    ejecutarQUERY_MYSQL(queryUpdateEvento, arrayParametros, res, funcionName, function(res, resultados){
        enviarResponse(res, [resultados.affectedRows]);
        if(resultados.affectedRows>0){
            // inserta o actualiza agraviados:
            var nuevoAgraviado=0;
            for(var i=0; i<listaAgraviados.length; i++){
                if(listaAgraviados[i].codAgraviado==""){ // registra nuevo
                    nuevoAgraviado++;
                    registrarAgraviado(listaAgraviados[i], nuevoAgraviado, codEvento, res, funcionName);
                }else{// actualiza
                    actualizarAgraviado(listaAgraviados[i], res, funcionName);
                }
            }
        }
    })
}

exports.getAllDistritos = function(req, res, funcionName){
    ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllDistritos");
}
exports.getAllProvincias = function(req, res, funcionName){
    ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllProvincias");
}

exports.getAllDepartamentos = function(req, res, funcionName){
    ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllDepartamentos");
}
exports.eliminarAgraviados = function(req, res, funcionName){ // elimina los agraviados descartados en la grilla
    var codAgraviados = req.query.codAgraviados;
    console.log("agraviados: "+codAgraviados);
    var query = "Delete from Agraviado where codAgraviado in ("+codAgraviados+")";
    ejecutarQUERY_MYSQL(query,[],res, funcionName, "false");
}
exports.getEventosAsignados=function(req, res, funcionName){ // Busca los eventos asignados a un procurador
    var idProcurador = req.query.idProcurador;
    var codEvento = req.query.codEvento;
    var placa = req.query.placa;
    var cat = req.query.cat;
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
    var orderBy = "e.codEvento"; // campo de ordenado
    var queryWhere = new QueryWhere(" where e.idProcurador='"+idProcurador+"'"); // Instancia el query de WHERE FILTROS
    if(codEvento!=""){
        queryWhere.validarWhere("e.codEvento like '"+codEvento+"%'");
    }if(placa!=""){
        queryWhere.validarWhere("e.placaAccidente like '"+placa+"%'");
    }if(cat!=""){
        queryWhere.validarWhere("e.polizaAccidente = '"+cat+"'");
    }if(fechaDesde!="" || fechaHasta!=""){
        orderBy = "e.fechaAccidente";
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere("( e.fechaAccidente between '"+fechaDesde+"' and '"+fechaHasta+"' )");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere("e.fechaAccidente>='"+fechaDesde+"'");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere("e.fechaAccidente<='"+fechaHasta+"'");
            }
        }
    }
    var queryGeneral = "Select e.codEvento, e.idProcurador, c.nroCAT, c.placa,  Concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, "+
        " pa.razonSocial, pa.tipoPersona, date_format (e.fechaAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, e.lugarAccidente, e.placaAccidente, e.polizaAccidente, e.DNIChoferAccidente, "+
        " e.choferAccidente , e.idNosocomio , e.idComisaria, e.idTipoAccidente, e.lugarAccidente, e.idDistrito as distritoAccidente, e.referenciaAccidente, "+
        " c.marca, c.modelo, c.annoFabricacion as anno,  date_format (c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, i.idInforme, i.informeCerrado from Evento e left join Cat c on e.polizaAccidente = c.nroCAT "+
        " left join Asociado a on c.idAsociado = a.idAsociado "+
        " left join Persona pa on a.idPersona = pa.idPersona " +
        " left join Informe i on e.codEvento = i.codEvento "+queryWhere.getQueryWhere()+" order by "+orderBy+" desc";
    queryGeneral = agregarLimit(page, registrosxpagina, queryGeneral);
    ejecutarQUERY_MYSQL(queryGeneral,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
            if(orderBy=='e.fechaAccidente'){
                orderBy=2; // indice de la columna de Ordenamiento "Fecha de Accidente" en la grilla
            }else{
                orderBy=0; // indice de la columna de Ordenamiento "Cod. Evento" en la grilla.
            }
            resultados[0].orderBy=orderBy;
            if(cantPaginas==0){
                var queryCantidad="Select count(*) as cantidad from Evento e left join Cat c on e.polizaAccidente = c.nroCAT "+
                    " left join Asociado a on c.idAsociado = a.idAsociado "+
                    " left join Persona pa on a.idPersona = pa.idPersona "+queryWhere.getQueryWhere();
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function(res, rows, resultados){
                    var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    enviarResponse(res, resultados);
                });
            }else{
                enviarResponse(res, resultados);
            }
        }else{
            enviarResponse(res, resultados);
        }
    });
}
exports.getInfoCentralDeEmergencias=function(req, res, funcionName){
    var codEvento = req.query.codEvento;
    var query = "Select e.codEvento, e.idProcurador, c.nroCAT, c.placa,  Concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, "+
        " pa.razonSocial, pa.tipoPersona, pa.nroDocumento, pa.idDistrito as distrito_a, pa.calle as calle_a, pa.nro as nro_a, pa.mzLote as mzLote_a, pa.sector as sector_a, pa.referencia as referencia_a, "+
		" date_format (e.fechaAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, date_format (e.fechaAviso, '%d/%m/%Y %H:%i') as fechaAviso, e.lugarAccidente, e.placaAccidente, e.polizaAccidente, e.DNIChoferAccidente, "+
        " e.choferAccidente , e.idNosocomio , n.tipo as tipoNosocomio, e.idComisaria, co.idDistrito as distritoComisaria, e.idTipoAccidente, e.lugarAccidente, e.idDistrito as distritoAccidente, e.referenciaAccidente, "+
        " c.idAsociado, c.marca, c.modelo, c.annoFabricacion as anno,  date_format (c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, pc.nroDocumento as dniChofer, pc.nombres as nombres_pc, pc.apellidoPaterno as apellidoPaterno_pc, pc.apellidoMaterno as apellidoMaterno_pc "+ " from Evento e left join Cat c on e.polizaAccidente = c.nroCAT "+
        " left join Asociado a on c.idAsociado = a.idAsociado "+
        " left join Persona pa on a.idPersona = pa.idPersona "+
		" left join Comisaria co on e.idComisaria = co.idComisaria "+
        " left join Nosocomio n on e.idNosocomio = n.idNosocomio "+
		" left join Persona pc on e.DNIChoferAccidente = pc.nroDocumento where e.codEvento = ?";
    var arrayParametros = [codEvento];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
        if(resultados.length>0){
            // busca los agraviados registrados por la central de emergencias
            var queryAgraviados = "Select codAgraviado, nombreAccidente, edadAccidente, dniAccidente, diagnosticoAccidente, tipoAsistencia from Agraviado where codEvento = ?";
            var arrayParametrosAgraviados = [codEvento];
            ejecutarQUERY_MYSQL_Extra(resultados, queryAgraviados, arrayParametrosAgraviados, res, funcionName, function(res, rowsAgraviados, resultados){
                resultados[0].listaAgraviados = rowsAgraviados;
                enviarResponse(res, resultados);
            });
        }else{
            enviarResponse(res, resultados);
        }
    });
}
exports.getInfoInforme = function(req, res, funcionName){
    var codEvento = req.query.codEvento;
    var idInforme = req.query.idInforme;
    var query = " select i.codEvento, e.idProcurador, c.nroCAT, c.placa, Concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, "+
        " pa.razonSocial, pa.tipoPersona, pa.nroDocumento, pa.idDistrito as distrito_a, pa.calle as calle_a, pa.nro as nro_a, pa.mzLote as mzLote_a, " +
        " pa.sector as sector_a, pa.referencia as referencia_a, c.idAsociado, c.marca, c.modelo, c.annoFabricacion as anno, date_format (c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, "+
        " date_format (i.fechaHoraAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, date_format (i.fechaHoraAviso, '%d/%m/%Y %H:%i') as fechaAviso, i.causal1 as idCausal, i.idTipoAccidente, i.idDistritoAccidente as distritoAccidente, "+
        " i.direccionAccidente as lugarAccidente, "+
        " i.idChofer, ch.licenciaChofer, ch.claseChofer," +
        " pc.idPersona as idPersona_pc, pc.nombres as nombres_pc, pc.apellidoPaterno as apellidoPaterno_pc, pc.apellidoMaterno as apellidoMaterno_pc, pc.nroDocumento as DNI_pc, "+
        " i.idPropietario, pp.idPersona as idPersona_pp, pp.nombres as nombres_pp, pp.apellidoPaterno as apellidoPaterno_pp, pp.apellidoMaterno as apellidoMaterno_pp, pp.nroDocumento as DNI_pp, "+
        " i.idPropietario2, pp2.idPersona as idPersona_pp2, pp2.nombres as nombres_pp2, pp2.apellidoPaterno as apellidoPaterno_pp2, pp2.apellidoMaterno as apellidoMaterno_pp2, pp2.nroDocumento as DNI_pp2, "+
        " i.madreChofer , pmc.nombres as nombres_pmc, pmc.apellidoPaterno as apellidoPaterno_pmc, pmc.apellidoMaterno as apellidoMaterno_pmc, pmc.nroDocumento as DNI_pmc, "+
        " i.padreChofer , ppc.nombres as nombres_ppc, ppc.apellidoPaterno as apellidoPaterno_ppc, ppc.apellidoMaterno as apellidoMaterno_ppc, ppc.nroDocumento as DNI_ppc, "+
        " i.idComisaria, cm.idDistrito as distritoComisaria, cm.nombre as comisariaNombre, i.codigoDenuncia, date_format (i.horaExamenCualitativo, '%d/%m/%Y %H:%i') as horaExamenCualitativo, "+
        " date_format (i.horaExamenCuantitativo, '%d/%m/%Y %H:%i') as horaExamenCuantitativo, i.resultadoExamenEtilico, i.observaciones, "+
        " i.preguntasCalificacion, i.calificacion "+
        " from Informe i " +
        " inner join Evento e on i.codEvento=e.codEvento " +
        " inner join Cat c on i.nroCAT = c.nroCAT " +
        " inner join Asociado a on c.idAsociado = a.idAsociado "+
        " inner join Persona pa on a.idPersona = pa.idPersona "+
        " left join Chofer ch on i.idChofer = ch.idChofer "+
        " left join Persona pc on ch.idPersona = pc.idPersona "+
        " left join Propietario pr on i.idPropietario = pr.idPropietario "+
        " left join Persona pp on pr.idPersona = pp.idPersona "+
        " left join Propietario pr2 on i.idPropietario2 = pr2.idPropietario "+
        " left join Persona pp2 on pr2.idPersona = pp2.idPersona "+
        " left join Persona pmc on i.madreChofer = pmc.idPersona "+
        " left join Persona ppc on i.padreChofer = ppc.idPersona "+
        " left join Comisaria cm on i.idComisaria = cm.idComisaria "+
        " where i.idInforme=?";
    var arrayParametros = [idInforme];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
        if(resultados.length>0){
            // busca los agraviados registrados por la central de emergencias
            var queryAgraviados = "Select a.codAgraviado, a.codEvento, p.idPersona, p.nombres, p.apellidoPaterno, p.apellidoMaterno, p.nroDocumento as DNI, p.edad, p.telefonoMovil," +
                " a.diagnostico, a.tipoAsistencia, a.idNosocomio, a.montoCartaGarantia, a.nombreAccidente, a.edadAccidente, a.dniAccidente, n.idNosocomio, n.tipo as tipoNosocomio, n.nombre as nombreNosocomio from Agraviado a " +
                " inner join Persona p on a.idPersona = p.idPersona " +
                " left join Nosocomio n on a.idNosocomio = n.idNosocomio "+
                " where a.codEvento = ?";
            var arrayParametrosAgraviados = [codEvento];
            ejecutarQUERY_MYSQL_Extra(resultados, queryAgraviados, arrayParametrosAgraviados, res, funcionName, function(res, rowsAgraviados, resultados){
                resultados[0].listaAgraviados = rowsAgraviados;
                // busca los vehiculos informados
                var queryVehiculos = "Select idVehiculoInformado, placa, marca, modelo, anno from Vehiculos_Informados where idInforme = ?";
                var arrayParams = [idInforme];
                ejecutarQUERY_MYSQL_Extra(resultados, queryVehiculos, arrayParams, res, funcionName, function(res, rowsVehiculos, resultados){
                    resultados[0].vehiculos = rowsVehiculos;
                    enviarResponse(res, resultados);
                });
            });
        }else{
            enviarResponse(res, resultados);
        }
    });
}
exports.getComisariaByNombre = function(req, res, funcionName){
    var comisaria = req.query.comisaria;
    var query = "Select idComisaria, nombre from Comisaria where nombre like '"+comisaria+"%' ";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getNosocomioByNombre = function(req, res, funcionName){
    var nosocomio = req.query.nosocomio;
    var query = "Select idNosocomio,tipo, nombre from Nosocomio where nombre like '"+nosocomio+"%' ";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.registrarInforme = function(req, res, funcionName){
    // DATOS DEL TAB OCURRENCIA
    /*var fechaAccidente = req.body.fechaAccidente;
    var fechaAviso = req.body.fechaAviso;
    var idTipoAccidente = req.body.idTipoAccidente;
    var idCausal = req.body.idCausal;
    var idDistritoAccidente = req.body.idDistritoAccidente;
    var direccionAccidente = req.body.direccionAccidente;
    var listaVehiculos = req.body.listaVehiculos;*/

    // DATOS DEL TAB ASOCIADO
    var nroCAT = req.body.nroCAT;
    /*var nroDocAsociado = req.body.nroDocAsociado;
    var distritoAsociado = req.body.distritoAsociado;
    var calleAsociado = req.body.calleAsociado;
    var nroAsociado = req.body.nroAsociado;
    var mzLtAsociado = req.body.mzLtAsociado;
    var sectorAsociado = req.body.sectorAsociado;
    var referenciaAsociado = req.body.referenciaAsociado;*/

    // DATOS DEL TAB RESPONSABLES
    var choferPersona = req.body.choferPersona;
    var licenciaChofer = req.body.licenciaChofer;
    var claseChofer = req.body.claseChofer;
    var propietarioPersona = req.body.propietarioPersona;
    var propietario2Persona = req.body.propietario2Persona;
    var pmcPersona = req.body.pmcPersona;
    var ppcPersona = req.body.ppcPersona;

    // DATOS DEL TAB COMISARIA/DOSAJE
    /*var idComisaria = req.body.idComisaria;
    var codDenuncia = req.body.codDenuncia;
    var horaExamenCualitativo = req.body.horaExamenCualitativo;
    var horaExamenCuantitativo = req.body.horaExamenCuantitativo;
    var resultadoDosaje = req.body.resultadoDosaje;

    // DATOS DEL TAB AGRAVIADOS
    var listaAgraviados = req.body.listaAgraviados;

    // DATOS DEL TAB CALIFICACION
    var listaCalificacion = req.body.listaCalificacion;
    var calificacionEvento = req.body.calificacionEvento;
    var observaciones = req.body.observaciones;*/

    // DATOS EXTRAS:
    var idChofer=0;
    var idPropietario=0;
    var idPropietario2=0;
    var idPersonaMadre = 0;
    var idPersonaPadre = 0;
    // Registra el chofer:
    abstractGuardarActualizarPersona(res, funcionName, choferPersona, function(idPersona_chofer){
        // inserta registro de chofer
        var queryInsertChofer = "Insert into Chofer (idPersona, licenciaChofer, claseChofer) values (?,?,?) ";
        ejecutarQUERY_MYSQL(queryInsertChofer, [idPersona_chofer, licenciaChofer, claseChofer], res, funcionName, function(res, resultados){
            idChofer = resultados.insertId;
            req.body.idChofer = idChofer;
            // Inserta Propietario:
            abstractGuardarActualizarPersona(res, funcionName, propietarioPersona, function(idPersona_Propietario){
                var queryInsertPropietario = "Insert into Propietario (idPersona, nroCAT) values (?,?)";
                ejecutarQUERY_MYSQL(queryInsertPropietario, [idPersona_Propietario, nroCAT], res, funcionName, function(res, resultados){
                    idPropietario = resultados.insertId;
                    req.body.idPropietario = idPropietario;
                    if(typeof propietario2Persona != 'undefined'){ // verifica si hay un segundo propietario
                        abstractGuardarActualizarPersona(res, funcionName, propietario2Persona, function(idPersona_Propietario2){
                            var queryInsertPropietario2 = "Insert into Propietario (idPersona, nroCAT) values (?,?)";
                            ejecutarQUERY_MYSQL(queryInsertPropietario2, [idPersona_Propietario2, nroCAT], res, funcionName, function(res, resultados) {
                                idPropietario2 = resultados.insertId;
                                req.body.idPropietario2 = idPropietario2;
                                if(typeof pmcPersona != 'undefined'){ // verifica si hay un registro de la madre del chofer
                                    abstractGuardarActualizarPersona(res, funcionName, pmcPersona, function(idPersona_Madre){
                                        idPersonaMadre = idPersona_Madre;
                                        req.body.idPersonaMadre = idPersonaMadre;
                                        if(typeof ppcPersona != 'undefined'){ // verifica si hay registro del padre del chofer
                                            abstractGuardarActualizarPersona(res, funcionName, ppcPersona, function(idPersona_Padre){
                                                idPersonaPadre = idPersona_Padre;
                                                req.body.idPersonaPadre = idPersonaPadre;
                                                insertarInforme(req.body, res, funcionName);
                                            });
                                        }else{
                                            insertarInforme(req.body, res, funcionName);
                                        }
                                    });
                                }else{
                                    if(typeof ppcPersona != 'undefined'){ // verifica si hay registro del padre del chofer
                                        abstractGuardarActualizarPersona(res, funcionName, ppcPersona, function(idPersona_Padre){
                                            idPersonaPadre = idPersona_Padre;
                                            req.body.idPersonaPadre = idPersonaPadre;
                                            insertarInforme(req.body, res, funcionName);
                                        });
                                    }else{
                                        insertarInforme(req.body, res, funcionName);
                                    }
                                }
                            });
                        })
                    }else{
                        if(typeof pmcPersona != 'undefined'){ // verifica si hay un registro de la madre del chofer
                            abstractGuardarActualizarPersona(res, funcionName, pmcPersona, function(idPersona_Madre){
                                idPersonaMadre = idPersona_Madre;
                                req.body.idPersonaMadre = idPersonaMadre;
                                if(typeof ppcPersona != 'undefined'){ // verifica si hay registro del padre del chofer
                                    abstractGuardarActualizarPersona(res, funcionName, ppcPersona, function(idPersona_Padre){
                                        idPersonaPadre = idPersona_Padre;
                                        req.body.idPersonaPadre = idPersonaPadre;
                                        insertarInforme(req.body, res, funcionName);
                                    });
                                }else{
                                    insertarInforme(req.body, res, funcionName);
                                }
                            });
                        }else{
                            if(typeof ppcPersona != 'undefined'){ // verifica si hay registro del padre del chofer
                                abstractGuardarActualizarPersona(res, funcionName, ppcPersona, function(idPersona_Padre){
                                    idPersonaPadre = idPersona_Padre;
                                    req.body.idPersonaPadre = idPersonaPadre;
                                    insertarInforme(req.body, res, funcionName);
                                });
                            }else{
                                insertarInforme(req.body, res, funcionName);
                            }
                        }
                    }
                });
            });
        })
    });
}
function insertarInforme(info, res, funcionName){ // inserta el informe, actualiza direccion del agraviado, inserta vehiculos y agraviados
    var queryInsertInforme = "Insert into Informe (codEvento, idTipoAccidente, idAsociado, idProcurador, idPropietario, idChofer, idPropietario2, madreChofer, padreChofer, " +
        "numheridos, codigoDenuncia, causal1, direccionAsociadoValida, idNosocomio, idComisaria, calificacion, horaExamenCualitativo, horaExamenCuantitativo, resultadoExamenEtilico, " +
        " observaciones, idDistritoAccidente, fechaHoraAccidente, fechaHoraAviso, preguntasCalificacion, nroCAT, direccionAccidente ) " +
        " values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var parametros = [info.codEvento, info.idTipoAccidente, info.idAsociado, info.idProcurador, info.idPropietario, info.idChofer,
        info.idPropietario2, info.idPersonaMadre, info.idPersonaPadre, info.listaAgraviados.length, info.codDenuncia, info.idCausal,
        info.calleAsociado+" "+info.nroAsociado+" "+info.mzLtAsociado+" "+info.sectorAsociado+" "+info.referenciaAsociado,
        info.idNosocomio, info.idComisaria, info.calificacionEvento, info.horaExamenCualitativo, info.horaExamenCuantitativo,
        info.resultadoDosaje, info.observaciones, info.idDistritoAccidente, info.fechaAccidente, info.fechaAviso,
        info.listaCalificacion, info.nroCAT, info.direccionAccidente
    ];
    ejecutarQUERY_MYSQL_Extra(info, queryInsertInforme, parametros, res, funcionName, function(res, resultados, info){
        var idInforme = resultados.insertId;
        if(idInforme>0){ // se registro correctamente el informe
            // actualiza direccion del asociado:
            info.idInforme = idInforme;
            var queryUpdateDireccion = "Update Persona set idDistrito=?, calle=?, nro=?, mzLote=?, sector=?, referencia=? where nroDocumento=? ";
            var parametrosAsociado = [info.distritoAsociado, info.calleAsociado, info.nroAsociado,
                info.mzLtAsociado, info.sectorAsociado, info.referenciaAsociado, info.nroDocAsociado];
            ejecutarQUERY_MYSQL_Extra(info, queryUpdateDireccion, parametrosAsociado, res, funcionName, function(res, resultados, info){
                console.log("info: "+JSON.stringify(info));
                if(typeof info.vehiculosEliminados!="undefined"){
                    eliminarVehiculos(info, res, funcionName);
                }
                insertarVehiculos(info, res, funcionName);
                insertarAgraviadosInforme(info, res, funcionName);
                enviarResponse(res, [info.idInforme]);
            });
        }else{
            enviarResponse(res, [0]);
        }
    });
}
function eliminarVehiculos(info, res, funcionName){
    var vehiculosEliminados = info.vehiculosEliminados;
    console.log("vehiculos Eliminados: "+vehiculosEliminados);
    var query = "Delete from Vehiculos_Informados where idVehiculoInformado in ("+vehiculosEliminados+")";
    ejecutarQUERY_MYSQL(query,[],res, funcionName, "false");
}
function insertarVehiculos(info, res, funcionName){
    var listaVehiculos = info.listaVehiculos;
    var values = "";
    if(typeof  listaVehiculos != "undefined"){
        for(var i=0; i<listaVehiculos.length; i++){
            var idVehiculo = listaVehiculos[i].idVehiculo
            var placa = listaVehiculos[i].placa;
            var marca = listaVehiculos[i].marca;
            var modelo = listaVehiculos[i].modelo;
            var anno = listaVehiculos[i].anno;
            var query = "";
            var arrayParametros = [];
            if(idVehiculo>0){ //
                query = "Update Vehiculos_Informados set placa = ?, marca=?, modelo=?, anno=? where idVehiculoInformado=?";
                arrayParametros=[placa, marca, modelo, anno, idVehiculo];
            }else{
                query = "Insert into Vehiculos_Informados(idInforme, placa, marca, modelo, anno) values (?,?,?,?,?) ";
                arrayParametros=[info.idInforme, placa, marca, modelo, anno];
            }
            ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "false");
        }
    }
}
function insertarAgraviadosInforme(info, res, funcionName){
    var listaAgraviados = info.listaAgraviados;
    if(typeof  listaAgraviados != 'undefined'){
        var nuevoAgraviado=0;
        for(var i=0; i<listaAgraviados.length; i++){
            var codAgraviado = listaAgraviados[i].codAgraviado;
            if(codAgraviado==""){ // nuevo registro de agraviado
                nuevoAgraviado++;
                registrarAgraviadoInforme(listaAgraviados[i], nuevoAgraviado, info.codEvento, res, funcionName);
            }else{ // actualiza agraviado
                actualizarAgraviadoInforme(listaAgraviados[i], res, funcionName);
            }
        }
    }
}
function registrarAgraviadoInforme(agraviado, indice, evento, res, funcionName){
    abstractGuardarActualizarPersona(res, funcionName, agraviado, function(idPersona){
        agraviado.idPersona=idPersona;
        var fechaActual = new Date();
        var año = fechaActual.getFullYear();
        var mes = agregarCEROaLaIzquierda(fechaActual.getMonth()+1);
        var queryUltimoAgraviado = "Select codAgraviado from Agraviado where codAgraviado like 'S"+año+mes+"%' order by codAgraviado desc limit 1";
        ejecutarQUERY_MYSQL(queryUltimoAgraviado, [], res, funcionName, function(res, resultados){
            var codEvento;
            var numeroAgraviado=0;
            if(resultados.length>0){
                var numeroAgraviado=parseInt(resultados[0].codAgraviado.substring(7));
                console.log("num agraviado: "+numeroAgraviado);
                numeroAgraviado=numeroAgraviado+indice;
                console.log("nuevo num agraviado: "+numeroAgraviado);
                numeroAgraviado=numeroAgraviado+"";
                var cantidadDigitosCero = 4-numeroAgraviado.split("").length;
                for(var i= 1; i<=cantidadDigitosCero; i++){
                    numeroAgraviado="0"+numeroAgraviado;
                }
                numeroAgraviado="S"+año+mes+numeroAgraviado;
                var queryInsert = "Insert into Agraviado (codAgraviado, codEvento, diagnostico, idPersona, tipoAsistencia, idNosocomio, montoCartaGarantia) " +
                    " values (?,?,?,?,?,?,?) ";
                var parametrosAg = [numeroAgraviado, evento, agraviado.diagnostico, idPersona, agraviado.asistencia, agraviado.nosocomio, agraviado.monto];
                ejecutarQUERY_MYSQL(queryInsert, parametrosAg, res, funcionName, "false");
            }
        });
    });
}
function actualizarAgraviadoInforme(agraviado, res, funcionName){
    abstractGuardarActualizarPersona(res, funcionName, agraviado, function(idPersona){
        var queryUpdateAgraviado="Update Agraviado set diagnostico = ?, idPersona = ?, tipoAsistencia=?, idNosocomio=?," +
            " montoCartaGarantia=? where codAgraviado = ? ";
        var params = [agraviado.diagnostico, idPersona, agraviado.asistencia, agraviado.nosocomio, agraviado.monto, agraviado.codAgraviado];
        ejecutarQUERY_MYSQL(queryUpdateAgraviado, params, res, funcionName, "false");
    });
}
function abstractGuardarActualizarPersona(res, funcionName, persona, callback){
    var queryInsert = "Insert into Persona (nombres, apellidoPaterno, apellidoMaterno, nroDocumento, edad, telefonoMovil) values (?,?,?,?,?,?)";
    var queryAdicional = "";
    if(persona.edad!=undefined){
        queryAdicional = queryAdicional+", edad = '"+persona.edad+"' ";
    }else {
        persona.edad="";
    }
    if(persona.telf!=undefined){
        queryAdicional = queryAdicional+", telefonoMovil = '"+persona.telf+"' ";
    }else{
        persona.telf="";
    }
    var queryUpdate = "Update Persona set nombres = ?, apellidoPaterno = ?, apellidoMaterno = ? "+queryAdicional+" where idPersona = ? ";
    console.log("query update: "+queryUpdate);
    if(persona.idPersona==0){ // se registra una nueva persona
        ejecutarQUERY_MYSQL(queryInsert, [persona.nombres, persona.paterno, persona.materno, persona.DNI, persona.edad, persona.telef], res, funcionName, function(res, resultados){
            if(typeof  callback == 'function'){
               var idPersona = resultados.insertId;
                persona.idPersona=idPersona;
                callback(idPersona);
            }
        });
    }else{ // solo se actualizara
        ejecutarQUERY_MYSQL(queryUpdate, [persona.nombres, persona.paterno, persona.materno, persona.idPersona], res, funcionName, function(res, resultados){
            if(typeof  callback == 'function'){
                callback(persona.idPersona);
            }
        });
    }
}
