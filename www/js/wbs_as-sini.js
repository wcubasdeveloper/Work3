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
var generatePDF = modulo_global.generatePDF;
var number_format = modulo_global.number_format;
//var urldominio="https://autoseguro.pe/";
var urldominio = modulo_global.urldominio;
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
        //orderBy = "e.fechaAccidente";
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
        " pa.razonSocial, pa.tipoPersona, date_format (e.fechaAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, date_format (e.fechaAviso, '%d/%m/%Y %H:%i') as fechaAviso, e.lugarAccidente, e.placaAccidente, e.polizaAccidente, e.DNIChoferAccidente, "+
        " e.choferAccidente , e.idNosocomio , e.idComisaria, e.idTipoAccidente, e.lugarAccidente, e.idDistrito as distritoAccidente, e.referenciaAccidente, "+
        " c.marca, c.modelo, c.annoFabricacion as anno,  date_format (c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, i.idInforme, e.nombreContacto, e.telefonoContacto, c1.nroCAT as nroCAT1, c1.placa as placa1, Concat(pa1.nombres,' ',pa1.apellidoPaterno,' ',pa1.apellidoMaterno) as nombreAsociado1, pa1.razonSocial as razonSocial1, pa1.tipoPersona as tipoPersona1, if(e.idProcurador>0,concat(usu.Nombres,' ',usu.Apellidos), 'Sin Asignación') as nombreProcurador "+
		" from Evento e left join Cat c on e.polizaAccidente = c.nroCAT "+
        " left join Cat c1 on e.nroCAT=c1.nroCAT "+
		" left join Asociado a1 on c1.idAsociado = a1.idAsociado "+
		" left join Asociado a on c.idAsociado = a.idAsociado "+
        " left join Persona pa on a.idPersona = pa.idPersona " +
		" left join Persona pa1 on a1.idPersona = pa1.idPersona " +
        " left join Informe i on e.codEvento = i.codEvento "+
		" left join Procurador pro on e.idProcurador = pro.idProcurador "+
		" left join UsuarioIntranet usu on pro.idUsuario = usu.idUsuario "+queryWhere.getQueryWhere()+" order by "+orderBy+" desc";
    queryGeneral = agregarLimit(page, registrosxpagina, queryGeneral);
    ejecutarQUERY_MYSQL(queryGeneral,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
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
    var query = "Select a.codEvento, a.codAgraviado, cg.idCarta, a.nombreAccidente, a.edadAccidente, a.dniAccidente, a.diagnosticoAccidente, " +
        "concat (p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado , p.nroDocumento, i.UIT, a.tiempoAproxRecupera, (select sum(pry.montoAproximado) from ProyeccionGastos pry where pry.codAgraviado= a.codAgraviado ) as totalGastos, a.gastoTotalAprox "+
        "from Agraviado a " +
        "left join Persona p on a.idPersona=p.idPersona " +
        "left join CartaGarantia cg on a.codAgraviado = cg.codAgraviado and cg.primeraCarta='S' "+
        "left join Informe i on a.codEvento=i.codEvento "+
		"where a.codEvento = ?";
    var arrayParametros = [codEvento];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAgraviadoXnombre_dni=function(req, res, funcionName){
	var nombre = req.query.nombre;
	var DNI = req.query.DNI;
	var where = "";
	if(nombre!="" && DNI!=""){
		where = " where p.nroDocumento='"+DNI+"' and (concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '%"+nombre+"%' )";
	}else{
		if(DNI!=""){
			where = " where p.nroDocumento='"+DNI+"' ";
		}
		if(nombre!=""){
			where = " where (concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '%"+nombre+"%' ) ";
		}
	}
	var query = "Select a.codEvento, i.informeCerrado, a.codAgraviado, /*cg.idCarta,*/ a.nombreAccidente, a.edadAccidente, a.dniAccidente, a.diagnosticoAccidente, " +
        "concat (p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado , p.nroDocumento, i.UIT,  a.tiempoAproxRecupera, (select sum(pry.montoAproximado) from ProyeccionGastos pry where pry.codAgraviado= a.codAgraviado ) as totalGastos, a.gastoTotalAprox "+
        "from Agraviado a " +
        "inner join Persona p on a.idPersona=p.idPersona " +
        //"inner join CartaGarantia cg on a.codAgraviado = cg.codAgraviado "+
        "inner join Informe i on a.codEvento=i.codEvento "+where;
    ejecutarQUERY_MYSQL(query, [], res, funcionName);		
}
exports.getCartaGarantia = function(req, res, funcionName){
    var codAgraviado = req.query.codAgraviado;
    var query = "Select concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, pa.razonSocial, pa.tipoPersona,  " +
        "pa.nroDocumento, i.nroCAT, c.placa, i.idInforme, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado, " +
        "p.edad, p.nroDocumento as DNI_Agraviado, a.idTipoAtencion as tipoAsistencia, a.diagnostico, a.montoCartaGarantia as monto, a.idNosocomio, n.nombre as nombreNosocomio, " +
        "n.tipo as tipoNosocomio, n.idDistrito as distritoNosocomio, i.idDistritoAccidente, cg.nroCarta, date_format(cg.fecha , '%d/%m/%Y %H:%i') as fechaCarta, date_format(i.fechaHoraAccidente, '%m/%y') as fechaAccidente, cg.idServicioMedico as servicioMedico, "+
        "cg.idPrimeraProyeccion from Agraviado a "+
        "left join Informe i on a.codEvento = i.codEvento "+
        "left join Cat c on i.nroCAT = c.nroCAT "+
        "left join Asociado aso on c.idAsociado = aso.idAsociado "+
        "inner join Persona pa on aso.idPersona = pa.idPersona "+
        "left join Persona p on a.idPersona = p.idPersona "+
        "left join Nosocomio n on a.idNosocomio = n.idNosocomio "+
        "left join CartaGarantia cg on a.codAgraviado = cg.codAgraviado and cg.primeraCarta='S' "+
        "where a.codAgraviado = ?";
    var arrayParametros = [codAgraviado];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.actualizarCarta = function(req, res, funcionName){
    var idCarta = req.query.idCarta;
    var nroCarta = req.query.nroCarta;
    var fechaCarta = req.query.fechaCarta;
    var diagnostico = req.query.diagnostico;
    var asistencia= req.query.asistencia;
    var idNosocomio= req.query.idNosocomio;
    var servicioMedico= req.query.servicioMedico;
    var monto= req.query.monto;
    var codAgraviado = req.query.codAgraviado;
    var idPrimeraProyeccion = req.query.idPrimeraProyeccion;
	
	var queryValidarNro = "Select count(*) as cantidad from CartaGarantia where nroCarta=? and idCarta!=? and estado!='A'";
	var paramsValida = [nroCarta, idCarta];
	ejecutarQUERY_MYSQL(queryValidarNro, paramsValida, res, funcionName, function(res1, resultados1){
		var cantRegistros = resultados1[0].cantidad;
		
		if(cantRegistros==0){
			
			var queryUpdate = "Update CartaGarantia set nroCarta=?, fecha=?, idNosocomio=?, idServicioMedico=?, diagnostico=?, monto = ?, idTipoAtencion=? where idCarta = ?";
    
			var parametros = [nroCarta, fechaCarta, idNosocomio, servicioMedico, diagnostico, monto, asistencia, idCarta];
			
			ejecutarQUERY_MYSQL(queryUpdate, parametros, res, funcionName, function(res, resultados){
				enviarResponse(res, [resultados.affectedRows]);
				if(resultados.affectedRows>0){
					var queryUpdateAgraviado = "Update Agraviado set diagnostico = ?, idTipoAtencion=?, idNosocomio=?, montoCartaGarantia=?, gastoTotalAprox=(SELECT sum(p.montoAproximado) from ProyeccionGastos p where p.codAgraviado='"+codAgraviado+"' and p.idProyeccionGastos!='"+idPrimeraProyeccion+"')+? " +
						" where codAgraviado = ?";
					var params = [diagnostico, asistencia, idNosocomio, monto, monto, codAgraviado];
					ejecutarQUERY_MYSQL(queryUpdateAgraviado, params, res, funcionName, "false");
					var queryUpdateProyeccion = "Update ProyeccionGastos set montoAproximado=? where idProyeccionGastos = ? ";
					var params2 = [monto, idPrimeraProyeccion];
					ejecutarQUERY_MYSQL(queryUpdateProyeccion, params2, res, funcionName, "false");
				}
			});
			
		}else{
			enviarResponse(res1, [false]);// el nro de carta no se encuentra disponible
		}
	});
}
exports.registrarCarta = function(req, res, funcionName){ // registra la primera carta emitida por el procurador
    var nroCarta = req.query.nroCarta;
    var fechaCarta = req.query.fechaCarta;
    var diagnostico = req.query.diagnostico;
    var asistencia= req.query.asistencia;
    var idNosocomio= req.query.idNosocomio;
    var servicioMedico= req.query.servicioMedico;
    var monto= req.query.monto;
    var nroCAT= req.query.nroCAT;
    var codEvento= req.query.codEvento;
    var codAgraviado= req.query.codAgraviado;
    
	var queryValidarNro = "Select count(*) as cantidad from CartaGarantia where nroCarta=? and estado!='A'";
	var paramsValida = [nroCarta];
	ejecutarQUERY_MYSQL(queryValidarNro, paramsValida, res, funcionName, function(res1, resultados1){
		var cantRegistros = resultados1[0].cantidad;
		if(cantRegistros==0){
			var queryInsertPrimeraProyeccion = "Insert into ProyeccionGastos (codEvento, codAgraviado, tratamientoMes, detalleMes, mesDesembolso, montoAproximado, idSecuencia, idFase, idNosocomio)"+
				" values (?,?,?,?,?,?,?,?,?) ";
			var paramsProy = [req.query.codEvento, req.query.codAgraviado, "CARTA GARANTIA", "", req.query.fechaAccidente, req.query.monto, 1, 1, req.query.idNosocomio];
			ejecutarQUERY_MYSQL(queryInsertPrimeraProyeccion, paramsProy, res, funcionName, function(res, resultados){
				var idProyeccion = resultados.insertId;
				if(idProyeccion>0){ // inserta la primera proyeccion
					// inserta la carta
					var queryInsert = "Insert into CartaGarantia (nroCarta, idEtapa, idTipoAtencion, estado, fecha, idNosocomio, idServicioMedico, nroCAT, codEvento, codAgraviado, diagnostico, monto, primeraCarta, idPrimeraProyeccion)" +
						" values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
					var parametros = [req.query.nroCarta, "1", asistencia, 'P', req.query.fechaCarta, req.query.idNosocomio, req.query.servicioMedico, req.query.nroCAT, req.query.codEvento, req.query.codAgraviado, req.query.diagnostico, req.query.monto, "S", idProyeccion];
					ejecutarQUERY_MYSQL(queryInsert, parametros, res, funcionName, function(res2, resultados2){
						enviarResponse(res2, [resultados2.insertId]);
						if(resultados2.insertId>0){
							var queryUpdateAgraviado = "Update Agraviado set diagnostico = ?, idTipoAtencion=?, idNosocomio=?, montoCartaGarantia=?, gastoTotalAprox=gastoTotalAprox+? " +
								" where codAgraviado = ?";
							var params = [diagnostico, asistencia, idNosocomio, monto, monto, codAgraviado];
							ejecutarQUERY_MYSQL(queryUpdateAgraviado, params, res, funcionName, "false");			
						}
					})
				}
			});
		}else{
			enviarResponse(res1, [false]);	//el nro de carta no se encuentra disponible		
		}		
	});
}
exports.registrarEvento = function(req, res, funcionName){
    // 30/09/2016 Valida primero que el codigo de evento manual no exista no exista:
	var codEventoManual = req.body.codEventoManual;
	if(codEventoManual!=""){
		var query = "Select count(*) as contador from Evento where codEvento = ?";
		var arrayParametros = [codEventoManual];
		ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res2, resultados){
			var contador = resultados[0].contador;
			if(contador==0){
				// busca si los codigos de los agraviados no existen,
				var listaAgraviados = req.body.listaAgraviados
				var arrayCodAgraviados = "";
				for(var i=0; i<listaAgraviados.length; i++){
					if(i>0){
						arrayCodAgraviados=arrayCodAgraviados+", ";
					}
					arrayCodAgraviados = arrayCodAgraviados+"'"+listaAgraviados[i].codAgraviadoInput+"'";
				}
				var queryCodAgraviados = "select codAgraviado from Agraviado where codAgraviado in ("+arrayCodAgraviados+")";
				ejecutarQUERY_MYSQL(queryCodAgraviados, [], res, funcionName, function(res3, resultados){
					if(resultados.length==0){
						procesarEvento(req, res, funcionName, req.body.codEventoManual);
					}else{
						var arrayCodAgraviados = "";
						for(var i=0; i<resultados.length; i++){
							if(i>0){
								arrayCodAgraviados=arrayCodAgraviados+", ";
							}
							arrayCodAgraviados = arrayCodAgraviados+resultados[i].codAgraviado;
						} 
						enviarResponse(res, [false, arrayCodAgraviados])
					}
				})				
			}else{
				enviarResponse(res, [false, "Evento"]); // Envia un mensaje al cliente indicando que el evento ya se encuentra registrado
			}
		});
	}else{
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
			procesarEvento(req, res, funcionName, codEvento);
		});
	}
}
function procesarEvento(req, res, funcionName, codEvento){
	// recibe parametros POST Del Evento:   
	var nombreContacto = req.body.nombreContacto;
    var telfContacto = req.body.telfContacto;
    var placaAccidente = req.body.placaAccidente;
    var polizaAccidente = req.body.polizaAccidente;
    var fechaAccidente = req.body.fechaAccidente;
    var fechaNotificacion = req.body.fechaNotificacion;
    var idTipoAccidente = req.body.idTipoAccidente;
    var idNosocomio = req.body.idNosocomio;
    var idComisaria = req.body.idComisaria;
    var idDistritoAccidente = req.body.idDistritoAccidente;
    var lugarAccidente = req.body.lugarAccidente;
    var referencia = req.body.referencia;
    var dniChofer= req.body.dniChofer;
    var nombreChofer = req.body.nombreChofer;
    var listaAgraviados = req.body.listaAgraviados;
    
    // registra el evento:
    var queryInsert="Insert into Evento(codEvento, fechaAccidente, lugarAccidente, idDistrito, fechaRegistro, placaAccidente, polizaAccidente, DNIChoferAccidente, choferAccidente, "+
    "idNosocomio, idComisaria, idTipoAccidente, referenciaAccidente, nombreContacto, telefonoContacto, fechaAviso) values (?,?,?,?, CURRENT_TIMESTAMP,?,?,?,?,?,?,?,?,?,?,?)";
     var arrayParametros = [codEvento, fechaAccidente, lugarAccidente, idDistritoAccidente, placaAccidente, polizaAccidente,dniChofer, nombreChofer, idNosocomio, idComisaria, idTipoAccidente, referencia, nombreContacto, telfContacto, fechaNotificacion];
     
	ejecutarQUERY_MYSQL_Extra(codEvento, queryInsert, arrayParametros, res, funcionName, function(res, resultados, codEvento){    var filasAfectadas = resultados.affectedRows;
        if(filasAfectadas>0){
            // registra agraviados
            for(var i=0; i<listaAgraviados.length; i++){
                registrarAgraviado(listaAgraviados[i], i+1, codEvento, res, funcionName);
            }
        }
        enviarResponse(res, [filasAfectadas]);
    });
}
function registrarAgraviado(agraviado, indice, evento, res, funcionName){
	if(agraviado.codAgraviadoInput==""){
		//var fechaActual = new Date();
		var año = evento.substring(1,5);//fechaActual.getFullYear();
		var mes = evento.substring(5,7);//agregarCEROaLaIzquierda(fechaActual.getMonth()+1);
		var queryUltimoAgraviado = "Select codAgraviado from Agraviado where codAgraviado like 'S"+año+mes+"%' order by codAgraviado desc limit 1";
		ejecutarQUERY_MYSQL_Extra(agraviado, queryUltimoAgraviado, [], res, funcionName, function(res, resultados, agraviado){
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
	}else{
		
		var numeroAgraviado = agraviado.codAgraviadoInput;
		
		var queryInsert = "INSERT Into Agraviado (codAgraviado, codEvento, nombreAccidente, edadAccidente, dniAccidente, diagnosticoAccidente) values "+
				"(?,?,?,?,?,?)";
		var arrayParametros = [numeroAgraviado, evento,  agraviado.nombreAgraviado, agraviado.edadAgraviado, agraviado.dniAgraviado, agraviado.diagnosticoAgraviado];
		
		ejecutarQUERY_MYSQL(queryInsert, arrayParametros, res, funcionName, "false");
	}   
}
function actualizarAgraviado(agraviado, res, funcionName){
    var query = "update Agraviado set nombreAccidente = ?, edadAccidente = ?, dniAccidente = ?, diagnosticoAccidente = ? where codAgraviado = ?";
    var parametros = [agraviado.nombreAgraviado, agraviado.edadAgraviado, agraviado.dniAgraviado, agraviado.diagnosticoAgraviado, agraviado.codAgraviado];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "false");
}
exports.actualizarEvento = function(req, res, funcionName){
    var nombreContacto = req.body.nombreContacto;
    var telfContacto = req.body.telfContacto;
    var codEvento = req.body.codEvento;
    var placaAccidente = req.body.placaAccidente;
    var polizaAccidente = req.body.polizaAccidente;
    var fechaAccidente = req.body.fechaAccidente;
    var fechaNotificacion = req.body.fechaNotificacion;
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
        " choferAccidente=?, idNosocomio=?, idComisaria=?, idTipoAccidente=?, referenciaAccidente=?, nombreContacto=?, telefonoContacto=?, fechaAviso=? where codEvento = ?";
    var arrayParametros = [fechaAccidente, lugarAccidente, idDistritoAccidente, placaAccidente, polizaAccidente, dniChofer, nombreChofer,
        idNosocomio, idComisaria, idTipoAccidente, referencia, nombreContacto, telfContacto, fechaNotificacion, codEvento];
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
// CUS 02
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
    var queryWhere = new QueryWhere(" where e.idProcurador>0 "); // Instancia el query de WHERE FILTROS
    
	if(idProcurador!=""){
		queryWhere.validarWhere(" e.idProcurador='"+idProcurador+"' ");
	}
	if(codEvento!=""){
        queryWhere.validarWhere("e.codEvento like '"+codEvento+"%'");
    }if(placa!=""){
        queryWhere.validarWhere("e.placaAccidente like '"+placa+"%'");
    }if(cat!=""){
        queryWhere.validarWhere("e.polizaAccidente = '"+cat+"'");
    }if(fechaDesde!="" || fechaHasta!=""){        
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere(" (e.fechaAccidente between '"+fechaDesde+"' and '"+fechaHasta+"') ");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere(" e.fechaAccidente>='"+fechaDesde+"' ");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere(" e.fechaAccidente<='"+fechaHasta+"' ");
            }
        }
    }
    var queryGeneral = "Select e.codEvento, e.idProcurador, i.nroCAT, i.direccionAccidente, c.placa, c2.placa as placa2, Concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, "+
        " Concat(pa2.nombres,' ',pa2.apellidoPaterno,' ',pa2.apellidoMaterno) as nombreAsociado2, "+
        " pa.razonSocial, pa.tipoPersona, pa2.razonSocial as razonSocial2, pa2.tipoPersona as tipoPersona2, date_format (e.fechaAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, e.lugarAccidente, e.placaAccidente, e.polizaAccidente, e.DNIChoferAccidente, "+
        " e.choferAccidente , e.idNosocomio , e.idComisaria, e.idTipoAccidente, e.lugarAccidente, e.idDistrito as distritoAccidente, e.referenciaAccidente, "+
        " i.idInforme, i.informeCerrado, date_format (i.fechaHoraAccidente, '%d/%m/%Y %H:%i') as fechaAccidenteInforme from Evento e " +
        " left join Informe i on e.codEvento = i.codEvento "+
        " left join Cat c on  e.polizaAccidente = c.nroCAT " +
        " left join Cat c2 on i.nroCAT = c2.nroCAT "+
        " left join Asociado a on c.idAsociado = a.idAsociado "+
        " left join Asociado a2 on c2.idAsociado = a2.idAsociado "+
        " left join Persona pa on a.idPersona = pa.idPersona "+
        " left join Persona pa2 on a2.idPersona = pa2.idPersona "+queryWhere.getQueryWhere()+" order by "+orderBy+" desc";
    queryGeneral = agregarLimit(page, registrosxpagina, queryGeneral);
    ejecutarQUERY_MYSQL(queryGeneral,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){            
            if(cantPaginas==0){
                var queryCantidad="Select count(*) as cantidad from Evento e left join Cat c on e.polizaAccidente = c.nroCAT "+
					" left join Informe i on e.codEvento = i.codEvento "+
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
            var queryAgraviados = "Select codAgraviado, nombreAccidente, edadAccidente, dniAccidente, diagnosticoAccidente, idTipoAtencion as tipoAsistencia from Agraviado where codEvento = ?";
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
    var query = " select i.codEvento, i.UIT, e.idProcurador, c.nroCAT, c.placa, Concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, "+
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
        " date_format (i.horaExamenCuantitativo, '%d/%m/%Y %H:%i') as horaExamenCuantitativo, date_format(i.fechaInicioInvestigacion, '%d/%m/%Y %H:%i') as fechaInicioInvestigacion, date_format(i.fechaFinInvestigacion, '%d/%m/%Y %H:%i') as fechaFinInvestigacion, "+
        " i.resultadoExamenEtilico, i.observaciones, "+
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
                " a.diagnostico, a.idTipoAtencion as tipoAsistencia, a.idNosocomio, a.montoCartaGarantia, a.nombreAccidente, a.edadAccidente, a.dniAccidente, n.idNosocomio, n.tipo as tipoNosocomio, n.nombre as nombreNosocomio, n.idDistrito as distritoNosocomio from Agraviado a " +
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
    var query = "Select idComisaria, nombre from Comisaria where nombre like '%"+comisaria+"%' order by nombre";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getNosocomioByNombre = function(req, res, funcionName){
    var nosocomio = req.query.nosocomio;
    var query = "Select idNosocomio,tipo, nombre from Nosocomio where nombre like '%"+nosocomio+"%' order by nombre";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getFunerariaByNombre = function(req, res, funcionName){
    var funeraria = req.query.funeraria;
    var query = "Select idFuneraria, nombre from Funeraria where nombre like '%"+funeraria+"%' ";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.actualizarInforme = function(req, res, funcionName){
	var pmcPersona = req.body.pmcPersona;
    var ppcPersona = req.body.ppcPersona;
	guardarActualizarChofer(res, funcionName, req.body, function(p_idChofer){
		req.body.idChofer = p_idChofer;
		guardarActualizarProcurador(res, funcionName, req.body, function(p_idProcurador){
			req.body.idProcurador = p_idProcurador;
			// analiza si hay procurador2, madrechofer, padrechofer
			var propietario2Persona = req.body.propietario2Persona
			if(typeof propietario2Persona != 'undefined'){ // verifica si hay un segundo propietario
				var infoPropietario2 = {
						idPropietario:req.body.idPropietario2,
						propietarioPersona: req.body.propietario2Persona,
						nroCAT:req.body.nroCAT
					}
				guardarActualizarProcurador(res, funcionName, infoPropietario2, function(p_idProcurador2){
					req.body.idPropietario2 = p_idProcurador2;
					if(typeof pmcPersona != 'undefined'){ // verifica si hay un registro de la madre del chofer
                        abstractGuardarActualizarPersona(res, funcionName, pmcPersona, function(idPersona_Madre){
                            idPersonaMadre = idPersona_Madre;
                            req.body.idPersonaMadre = idPersonaMadre;
                            if(typeof ppcPersona != 'undefined'){ // verifica si hay registro del padre del chofer
                                abstractGuardarActualizarPersona(res, funcionName, ppcPersona, function(idPersona_Padre){
                                    idPersonaPadre = idPersona_Padre;
                                    req.body.idPersonaPadre = idPersonaPadre;
                                    updateInforme(req.body, res, funcionName);
                                });
                            }else{
                                updateInforme(req.body, res, funcionName);
                            }
                        });
                    }else{
                        if(typeof ppcPersona != 'undefined'){ // verifica si hay registro del padre del chofer
                            abstractGuardarActualizarPersona(res, funcionName, ppcPersona, function(idPersona_Padre){
								idPersonaPadre = idPersona_Padre;
                                req.body.idPersonaPadre = idPersonaPadre;
                                updateInforme(req.body, res, funcionName);
                            });
                        }else{
                            updateInforme(req.body, res, funcionName);
                        }
                    }					
				});
			}else{
				// madreChofer y madreChofer
				if(typeof pmcPersona != 'undefined'){ // verifica si hay un registro de la madre del chofer
                    abstractGuardarActualizarPersona(res, funcionName, pmcPersona, function(idPersona_Madre){
                        idPersonaMadre = idPersona_Madre;
                        req.body.idPersonaMadre = idPersonaMadre;
                        if(typeof ppcPersona != 'undefined'){ // verifica si hay registro del padre del chofer
                            abstractGuardarActualizarPersona(res, funcionName, ppcPersona, function(idPersona_Padre){
                                idPersonaPadre = idPersona_Padre;
                                req.body.idPersonaPadre = idPersonaPadre;
                                updateInforme(req.body, res, funcionName);
                            });
                        }else{
                            updateInforme(req.body, res, funcionName);
                        }
                    });
                }else{
                    if(typeof ppcPersona != 'undefined'){ // verifica si hay registro del padre del chofer
                        abstractGuardarActualizarPersona(res, funcionName, ppcPersona, function(idPersona_Padre){
							idPersonaPadre = idPersona_Padre;
                            req.body.idPersonaPadre = idPersonaPadre;
                            updateInforme(req.body, res, funcionName);
                        });
                    }else{
                        updateInforme(req.body, res, funcionName);
                    }
                }
			}			
		})
	});
}
function updateInforme(info, res, funcionName){
	console.log("por insertar el informe");
	var queryUpdateInforme = "Update Informe set idTipoAccidente = ?, idAsociado=?, idPropietario=?, idChofer=?, idPropietario2=?, madreChofer=?, padreChofer=?, "+
		" numheridos=?, codigoDenuncia=?, causal1=?, direccionAsociadoValida=?, idNosocomio=?, idComisaria=?, calificacion=?, horaExamenCualitativo=?, horaExamenCuantitativo=?, resultadoExamenEtilico=?, "+
		" observaciones =?, idDistritoAccidente=?, fechaHoraAccidente=?, fechaHoraAviso=?, preguntasCalificacion=?, nroCAT=?, direccionAccidente=?, fechaInicioInvestigacion=?, fechaFinInvestigacion=? where idInforme = ? ";
	var parametros = [info.idTipoAccidente, info.idAsociado, info.idPropietario, info.idChofer,
        info.idPropietario2, info.idPersonaMadre, info.idPersonaPadre, info.listaAgraviados.length, info.codDenuncia, info.idCausal,
        info.calleAsociado+" "+info.nroAsociado+" "+info.mzLtAsociado+" "+info.sectorAsociado+" "+info.referenciaAsociado,
        info.idNosocomio, info.idComisaria, info.calificacionEvento, info.horaExamenCualitativo, info.horaExamenCuantitativo,
        info.resultadoDosaje, info.observaciones, info.idDistritoAccidente, info.fechaAccidente, info.fechaAviso,
        info.listaCalificacion, info.nroCAT, info.direccionAccidente, info.fechaInicioInvestigacion, info.fechaFinInvestigacion, info.idInforme
    ];
	ejecutarQUERY_MYSQL_Extra(info, queryUpdateInforme, parametros, res, funcionName, function(res, resultados, info){
		if(resultados.affectedRows>0){
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
                enviarResponse(res, [resultados.affectedRows]);
            });
		}else{
			enviarResponse(res, [resultados.affectedRows]);
		}
	});
}
function guardarActualizarChofer(res, funcionName, info, callback){ // guarda o actualiza un chofer
	var idChofer = info.idChofer;
	var choferPersona = info.choferPersona;
    var licenciaChofer = info.licenciaChofer;
    var claseChofer = info.claseChofer;
	abstractGuardarActualizarPersona(res, funcionName, choferPersona, function(idPersona_chofer){ // actualiza o guarda la persona chofer
		console.log("idChofer: "+idChofer);
		if(idChofer>0){ // actualiza el registro del chofer
			var queryUpdateChofer = "Update Chofer set idPersona=?, licenciaChofer=?, claseChofer=? where idChofer=? ";
			var parametros = [idPersona_chofer, licenciaChofer, claseChofer, idChofer];
			ejecutarQUERY_MYSQL(queryUpdateChofer, parametros, res, funcionName, function(res, resultados){
				callback(info.idChofer);
			});			
		}else{ // inserta un nuevo registro del chofer
			var queryInsertChofer = "Insert into Chofer (idPersona, licenciaChofer, claseChofer) values (?,?,?) ";
			var parametros = [idPersona_chofer, licenciaChofer, claseChofer];
			ejecutarQUERY_MYSQL(queryInsertChofer, parametros, res, funcionName, function(res, resultados){
				idChofer = resultados.insertId;
				if(typeof callback == "function"){
					callback(idChofer);
				}
			});						
		}
	});		
}
function guardarActualizarProcurador(res, funcionName, info, callback){
	var idPropietario = info.idPropietario;
	var propietarioPersona = info.propietarioPersona;
	var nroCAT = info.nroCAT;
	abstractGuardarActualizarPersona(res, funcionName, propietarioPersona, function(idPersona_Propietario){
		if(idPropietario>0){
			var queryUpdatePropietario = "Update Propietario set idPersona = ?, nroCAT = ? where idPropietario=? ";	
			var parametros = [idPersona_Propietario, nroCAT, idPropietario];
			ejecutarQUERY_MYSQL(queryUpdatePropietario, parametros, res, funcionName, function(res, resultados){
				if(typeof callback == "function"){
					callback(info.idPropietario);
				}				
			});	
		}else{
			var queryInsertPropietario = "Insert into Propietario (idPersona, nroCAT) values (?,?)";
			var parametros = [idPersona_Propietario, nroCAT];
			ejecutarQUERY_MYSQL(queryInsertPropietario, parametros, res, funcionName, function(res, resultados){
				idPropietario = resultados.insertId;
				if(typeof callback == "function"){
					callback(idPropietario);
				}                
			});
		}	
	});	
}
exports.registrarInforme = function(req, res, funcionName){
    
    // DATOS DEL TAB ASOCIADO
    var nroCAT = req.body.nroCAT;
    
    // DATOS DEL TAB RESPONSABLES
    var choferPersona = req.body.choferPersona;
    var licenciaChofer = req.body.licenciaChofer;
    var claseChofer = req.body.claseChofer;
    var propietarioPersona = req.body.propietarioPersona;
    var propietario2Persona = req.body.propietario2Persona;
    var pmcPersona = req.body.pmcPersona;
    var ppcPersona = req.body.ppcPersona;
    
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
exports.cerrarInforme=function(req, res, funcionName){
    var idInforme = req.query.idInforme;
	var queryInforme = "Select codEvento, idInforme, date_format(fechaHoraAccidente, '%Y-%m-%d %H:%i') as fechaHoraAccidente, direccionAccidente, idDistritoAccidente, nroCAT, idChofer, idPropietario, calificacion from Informe where idInforme=?";
	var parametros = [idInforme];
	ejecutarQUERY_MYSQL(queryInforme, parametros, res, funcionName, function(res, resultados){
		if(resultados.length>0){
			var queryUpdateEvento = "Update Evento set fechaAccidente=?, lugarAccidente=?, idDistrito=?, nroCAT=?, idChofer=?, idPropietario=?, esRecupero=?, idInforme=?, estadoCobertura=? where codEvento=? ";
			var esRecupero = resultados[0].calificacion;
			var cobertura = '';
			if(esRecupero=='R'){
				esRecupero='S';
				cobertura='R';
			}else{
				esRecupero='N';
				cobertura='C'
			}
			var desistir = req.query.desistir; // Desistimiento
			if(desistir=='T'){
				cobertura='T';
			}
			
			var params=[resultados[0].fechaHoraAccidente, resultados[0].direccionAccidente, resultados[0].idDistritoAccidente, resultados[0].nroCAT, resultados[0].idChofer, resultados[0].idPropietario, esRecupero, req.query.idInforme, cobertura, resultados[0].codEvento];
			ejecutarQUERY_MYSQL(queryUpdateEvento, params, res, funcionName, "false");
			// cambia de estado el informe a "Cerrado"
			var queryUpdateInforme = "Update Informe set informeCerrado='S' where idInforme=?";
			var params2 = [req.query.idInforme];
			ejecutarQUERY_MYSQL(queryUpdateInforme, params2, res, funcionName, "affectedRows");
		}
	});
    
    
}
function insertarInforme(info, res, funcionName){ // inserta el informe, actualiza direccion del agraviado, inserta vehiculos y agraviados
    var queryInsertInforme = "Insert into Informe (codEvento, idTipoAccidente, idAsociado, idProcurador, idPropietario, idChofer, idPropietario2, madreChofer, padreChofer, " +
        "numheridos, codigoDenuncia, causal1, direccionAsociadoValida, idNosocomio, idComisaria, calificacion, horaExamenCualitativo, horaExamenCuantitativo, resultadoExamenEtilico, " +
        " observaciones, idDistritoAccidente, fechaHoraAccidente, fechaHoraAviso, preguntasCalificacion, nroCAT, direccionAccidente, fechaInicioInvestigacion, fechaFinInvestigacion, UIT) " +
        " values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var parametros = [info.codEvento, info.idTipoAccidente, info.idAsociado, info.idProcurador, info.idPropietario, info.idChofer,
        info.idPropietario2, info.idPersonaMadre, info.idPersonaPadre, info.listaAgraviados.length, info.codDenuncia, info.idCausal,
        info.calleAsociado+" "+info.nroAsociado+" "+info.mzLtAsociado+" "+info.sectorAsociado+" "+info.referenciaAsociado,
        info.idNosocomio, info.idComisaria, info.calificacionEvento, info.horaExamenCualitativo, info.horaExamenCuantitativo,
        info.resultadoDosaje, info.observaciones, info.idDistritoAccidente, info.fechaAccidente, info.fechaAviso,
        info.listaCalificacion, info.nroCAT, info.direccionAccidente, info.fechaInicioInvestigacion, info.fechaFinInvestigacion, info.UIT
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
        //var año = fechaActual.getFullYear();
        //var mes = agregarCEROaLaIzquierda(fechaActual.getMonth()+1);
        var año = evento.substring(1,5);//fechaActual.getFullYear();
		var mes = evento.substring(5,7);//agregarCEROaLaIzquierda(fechaActual.getMonth()+1);
		
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
                var queryInsert = "Insert into Agraviado (codAgraviado, codEvento, diagnostico, idPersona, idTipoAtencion, idNosocomio, montoCartaGarantia) " +
                    " values (?,?,?,?,?,?,?) ";
                var parametrosAg = [numeroAgraviado, evento, agraviado.diagnostico, idPersona, agraviado.asistencia, agraviado.nosocomio, agraviado.monto];
                ejecutarQUERY_MYSQL(queryInsert, parametrosAg, res, funcionName, "false");
            }
        });
    });
}
function actualizarAgraviadoInforme(agraviado, res, funcionName){
    abstractGuardarActualizarPersona(res, funcionName, agraviado, function(idPersona){
        var queryUpdateAgraviado="Update Agraviado set diagnostico = ?, idPersona = ?, idTipoAtencion=?, idNosocomio=?," +
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
    
    if(persona.idPersona==0){ // se registra una nueva persona
        ejecutarQUERY_MYSQL(queryInsert, [persona.nombres, persona.paterno, persona.materno, persona.DNI, persona.edad, persona.telf], res, funcionName, function(res, resultados){
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
exports.consultarCostosGlobales=function(req, res, funcionName){
	var query = "Select UIT /*, asistencia_U, asistencia_E, asistencia_I*/ from ConstantesGenerales";
	ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.copiarComisarias = function(req, res, funcionName){
	var listaComisarias = req.body. listaComisarias;
	var values = "";
	for(var i=0; i<listaComisarias.length; i++){
		if(i>0){
			values=values+", ";
		}
		values = values+"('"+listaComisarias[i].nombre+"', '"+listaComisarias[i].idDistrito+"', '"+listaComisarias[i].direccion+"', '"+listaComisarias[i].telefono+"')";
	}
	values=values+";";
	var query = "Insert into Comisaria (nombre, idDistrito, calle, telefono) values "+values;
	ejecutarQUERY_MYSQL(query, [], res, funcionName, "affectedRows");
}

// *** PROYECCION DE GASTOS CUS 03

exports.getEventosProyeccion=function(req, res, funcionName){ // Busca los eventos ingresados por la central de emergencia y la muestra en la grilla
    var codEvento = req.query.codEvento;
    var placa = req.query.placa;
    var cat = req.query.cat;
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
    var queryWhere = new QueryWhere(" where i.informeCerrado='S' "); // Instancia el query de WHERE FILTROS
    if(codEvento!=""){
        queryWhere.validarWhere("e.codEvento like '"+codEvento+"%'");
    }if(placa!=""){
        queryWhere.validarWhere("e.placa like '"+placa+"%'");
    }if(cat!=""){
        queryWhere.validarWhere("e.nroCAT = '"+cat+"'");
    }if(fechaDesde!="" || fechaHasta!=""){
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
    var queryGeneral = "Select e.codEvento, i.idInforme, i.informeCerrado, e.idProcurador, c.nroCAT, c.placa,  Concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, "+
        " pa.razonSocial, pa.tipoPersona, date_format (e.fechaAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, "+
        " i.direccionAccidente as lugarAccidente "+
        " from Evento e inner join Informe i on e.codEvento = i.codEvento "+
        " inner join Cat c on i.nroCAT = c.nroCAT "+
        " inner join Asociado a on c.idAsociado = a.idAsociado "+
        " inner join Persona pa on a.idPersona = pa.idPersona "+queryWhere.getQueryWhere()+" order by e.codEvento desc";
    queryGeneral = agregarLimit(page, registrosxpagina, queryGeneral);
    ejecutarQUERY_MYSQL(queryGeneral,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="Select count(*) as cantidad from Evento e inner join Informe i on e.codEvento = i.codEvento "+
                    " inner join Cat c on i.nroCAT = c.nroCAT "+
                    " inner join Asociado a on c.idAsociado = a.idAsociado "+
                    " inner join Persona pa on a.idPersona = pa.idPersona "+queryWhere.getQueryWhere();
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
exports.getProyeccionPorAgraviado=function(req, res, funcionName){
	var codAgraviado = req.query.codAgraviado;
	var query = "Select a.codAgraviado, date_format(i.fechaHoraAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, t.descripcion as descripcionAccidente, concat(pag.nombres,' ',pag.apellidoPaterno,' ',pag.apellidoMaterno) as nombreAgraviado, pag.nroDocumento as DNI, "+
		" a.codEvento, i.nroCAT, i.idDistritoAccidente, n.idDistrito as idDistritoNosocomio, c.placa, concat(paso.nombres,' ',paso.apellidoPaterno,' ',paso.apellidoMaterno) as nombreAsociado, paso.tipoPersona, paso.razonSocial, "+
		" n.nombre as nombreNosocomio, co.nombre as nombreComisaria, a.diagnostico, i.UIT from Agraviado a inner join Informe i on a.codEvento = i.codEvento "+
		" inner join Evento e on a.codEvento = e.codEvento "+
		" inner join Persona pag on a.idPersona = pag.idPersona "+
		" inner join Cat c on i.nroCAT = c.nroCAT "+
		" inner join Asociado aso on c.idAsociado = aso.idAsociado "+
		" inner join Persona paso on aso.idPersona = paso.idPersona "+
		" left join Nosocomio n on a.idNosocomio = n.idNosocomio "+
		" left join Comisaria co on i.idComisaria = co.idComisaria "+
		" left join TipoAccidente t on e.idTipoAccidente=t.idTipoAccidente "+
		" where a.codAgraviado=?";
	ejecutarQUERY_MYSQL(query,[codAgraviado], res, funcionName, function(res, resultados){
		if(resultados.length>0){
			var queryProyecciones = "select pg.tratamientoMes, pg.factor, pg.idNosocomio, n.idDistrito as distritoNosocomio, n.nombre as nombreNosocomio, n.tipo as tipoNosocomio, pg.mesDesembolso, pg.idSecuencia, pg.detalleMes, pg.idFase, pg.montoAproximado, pg.idTarifaProcedimiento, tp.codigoProcedimiento, tp.descripcion as descripcionProcedimiento, tp.unidades, tp.tipoTarifa from ProyeccionGastos pg left join TarifaProcedimientos tp on pg.idTarifaProcedimiento = tp.idTarifa left join Nosocomio n on pg.idNosocomio = n.idNosocomio where pg.codAgraviado=? order by pg.idFase, pg.mesDesembolso, pg.idSecuencia";
			ejecutarQUERY_MYSQL_Extra(resultados, queryProyecciones, [codAgraviado], res, funcionName, function(res, rows, resultados){                
				resultados[0].proyecciones = rows;
                enviarResponse(res, resultados);
            });
		}else{
			enviarResponse(res, resultados);
		}
	});	
}
exports.registrarProyecciones = function(req, res, funcionName){
	var codEvento = req.body.codEvento;
	var codAgraviado = req.body.codAgraviado;
	var totalAcumulado = req.body.totalAcumulado;
	var listaProyecciones = req.body.listaProyecciones;
	// primero elimina todas las proyecciones
	var queryElimina = "Delete from ProyeccionGastos where codEvento=? and codAgraviado=?";
	var paramsElimina = [codEvento, codAgraviado];
	ejecutarQUERY_MYSQL(queryElimina, paramsElimina, res, funcionName, function(res, resultados){
		// luego registra las nuevas proyecciones
		var queryInsert = "Insert into ProyeccionGastos (codEvento, idNosocomio, idTarifaProcedimiento, factor, codAgraviado, tratamientoMes, detalleMes, mesDesembolso, montoAproximado, idSecuencia, idFase) values ";
		var values = "";
		for(var y=0; y<listaProyecciones.length; y++){
			if(y>0){
				values=values+", ";
			}
			
			var mesSecuencia = listaProyecciones[y].mes.split("(");
			var mes = mesSecuencia[0];
			var secuencia = mesSecuencia[1].split(")")[0];
			if(listaProyecciones[y].idFase =="4" || listaProyecciones[y].idFase=="5"){ // sepelio o muerte
				listaProyecciones[y].detalle = listaProyecciones[y].tratamiento;
				listaProyecciones[y].tratamiento = "";
			}else{
				listaProyecciones[y].detalle = "";
			}
			values=values+" ('"+codEvento+"', '"+listaProyecciones[y].idNosocomio+"', '"+listaProyecciones[y].idTarifaProcedimiento+"', '"+listaProyecciones[y].factor+"', '"+codAgraviado+"', '"+listaProyecciones[y].tratamiento+"', '"+listaProyecciones[y].detalle+"', '"+mes+"', '"+listaProyecciones[y].monto+"', '"+secuencia+"', '"+listaProyecciones[y].idFase+"') ";
		}
		queryInsert=queryInsert+values;
		ejecutarQUERY_MYSQL(queryInsert, [], res, funcionName, function(res, resultados2){
			enviarResponse(res, [resultados2.affectedRows]);
			// actualiza en la tabla Agraviado:
			var queryUpdateAgraviado = "Update Agraviado set gastoTotalAprox=? where codAgraviado=?";
			var parametros = [totalAcumulado, codAgraviado];
			ejecutarQUERY_MYSQL(queryUpdateAgraviado, parametros, res, funcionName, "false");
		})
	});
}
// CUS 04:
exports.getEventosConInformeCerrado=function(req, res, funcionName){ // Busca los eventos ingresados por la central de emergencia y la muestra en la grilla
    var codEvento = req.query.codEvento;
    var placa = req.query.placa;
    var cat = req.query.cat;
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
    var queryWhere = new QueryWhere(" where i.informeCerrado='S' "); // Instancia el query de WHERE FILTROS
    if(codEvento!=""){
        queryWhere.validarWhere("e.codEvento like '"+codEvento+"%'");
    }if(placa!=""){
        queryWhere.validarWhere("c.placa like '"+placa+"%'");
    }if(cat!=""){
        queryWhere.validarWhere("c.nroCAT = '"+cat+"'");
    }if(fechaDesde!="" || fechaHasta!=""){
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
    var queryGeneral = "Select e.codEvento, i.idInforme, c.nroCAT, c.placa,  Concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, "+
        " pa.razonSocial, pa.tipoPersona, date_format (e.fechaAccidente, '%d/%m/%Y') as fechaAccidente, "+
        " i.direccionAccidente as lugarAccidente "+
        " from Evento e inner join Informe i on e.codEvento = i.codEvento "+
        " inner join Cat c on e.nroCAT = c.nroCAT "+
        " inner join Asociado a on c.idAsociado = a.idAsociado "+
        " inner join Persona pa on a.idPersona = pa.idPersona "+queryWhere.getQueryWhere()+" order by e.codEvento desc";
    queryGeneral = agregarLimit(page, registrosxpagina, queryGeneral);
    ejecutarQUERY_MYSQL(queryGeneral,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="Select count(*) as cantidad from Evento e inner join Informe i on e.codEvento = i.codEvento "+
                    " inner join Cat c on e.nroCAT = c.nroCAT "+
                    " inner join Asociado a on c.idAsociado = a.idAsociado "+
                    " inner join Persona pa on a.idPersona = pa.idPersona "+queryWhere.getQueryWhere();
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
exports.getAgraviadosCarta = function(req, res, funcionName){
    var codEvento = req.query.codEvento;
    var query = "Select a.codEvento, a.codAgraviado, a.diagnostico, concat (p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado , "+
		"p.nroDocumento, a.gastoTotalAprox, (select sum(cg.monto) from CartaGarantia cg where cg.codAgraviado=a.codAgraviado and cg.estado!='A') as totalCartas from Agraviado a " +
		"inner join Persona p on a.idPersona = p.idPersona "+
		"where a.codEvento = ?";
    var arrayParametros = [codEvento];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAgraviadosCartaXnombre_dni = function(req, res, funcionName){
    var nombre = req.query.nombre;
	var DNI = req.query.DNI;
	
	var where = "";
	
	if(nombre!="" && DNI!=""){
		where=" where p.nroDocumento='"+DNI+"' and (concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '%"+nombre+"%' )";
	}else{
		if(DNI!=""){
			where = " where p.nroDocumento='"+DNI+"' ";
		}
		if(nombre!=""){
			where = " where (concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '%"+nombre+"%' ) ";
		}
	}
	
    var query = "Select a.codEvento, i.informeCerrado, a.codAgraviado, a.diagnostico, concat (p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado , "+
		"p.nroDocumento, a.gastoTotalAprox, (select sum(cg.monto) from CartaGarantia cg where cg.codAgraviado=a.codAgraviado and cg.estado!='A') as totalCartas from Agraviado a " +
		"inner join Persona p on a.idPersona = p.idPersona "+
		"inner join Informe i on a.codEvento = i.codEvento "+where;
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getListaCartas = function(req, res, funcionName){
    var codEvento = req.query.codEvento;
	var codAgraviado = req.query.codAgraviado;
	var query = "Select LPAD(c.idCarta, 5, '0') as idCarta, c.idEtapa as idCobertura, c.estado, concat(p.nombres,' ', p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado, p.nroDocumento as DNI, "+
		" a.codAgraviado, a.codEvento, f.idFuneraria, f.nombre as nombreFuneraria, n.idNosocomio, n.nombre as nombreNosocomio, n.tipo as tipoNosocomio, n.idDistrito as distritoNosocomio, LPAD(c.nroCarta, 5, '0') as nroCarta, date_format(c.fecha, '%d/%m/%Y') as fecha, c.idTipoAtencion as tipoAsistencia, c.monto, c.idPrimeraProyeccion, "+
		" t.descripcion as asistencia from CartaGarantia c "+
		" left join Nosocomio n on c.idNosocomio=n.idNosocomio "+
		" left join Funeraria f on c.idFuneraria=f.idFuneraria "+
		" inner join Agraviado a on c.codAgraviado=a.codAgraviado "+
		" inner join Persona p on a.idPersona=p.idPersona "+
		" left join TipoAtencion t on c.idTipoAtencion = t.idTipoAtencion "+
		"where c.codAgraviado=? and c.codEvento=? order by c.fecha";
	var params = [codAgraviado, codEvento]
	ejecutarQUERY_MYSQL(query, params, res, funcionName);
}
exports.getCartaDetalle = function(req, res, funcionName){
	var idCarta = req.query.idCarta;
	var query = "select LPAD(cg.nroCarta, 5, '0') as nroCarta, date_format(cg.fecha, '%d/%m/%Y %H:%i') as fechaCarta, cg.idPrimeraProyeccion, e.codEvento, date_format(e.fechaAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, ta.descripcion as tipoAccidente, "+
		"cg.idFuneraria, n.idNosocomio, n.nombre as nombreNosocomio, n.tipo as tipoNosocomio, n.idDistrito as distritoNosocomio, co.nombre as nombreComisaria, ca.nroCAT, concat(pe_aso.nombres,' ',pe_aso.apellidoPaterno,' ',pe_aso.apellidoMaterno) as nombreAsociado, "+
		"pe_aso.razonSocial, pe_aso.tipoPersona, ca.placa, ag.codAgraviado, pe_ag.nroDocumento as DNI_Agraviado, "+
		"concat(pe_ag.nombres,' ',pe_ag.apellidoPaterno,' ',pe_ag.apellidoMaterno) as nombreAgraviado, "+
		"ag.diagnostico as diagnosticoAgraviado, cg.idEtapa as idCobertura, cg.esAmpliacion, LPAD(cg.idCartaAnterior, 5, '0') as idCartaAnterior, cg.idTipoAtencion as tipoAsistencia, cg.idAuditor, cg.idServicioMedico as servicioMedico, "+
		"cg.diagnostico as diagnosticoCarta, cg.monto, i.UIT, i.idDistritoAccidente from CartaGarantia cg "+
		"inner join Evento e on cg.codEvento = e.codEvento "+
		"inner join Informe i on e.codEvento = i.codEvento "+
		"left join TipoAccidente ta on i.idTipoAccidente = ta.idTipoAccidente "+
		"inner join Agraviado ag on cg.codAgraviado = ag.codAgraviado "+
		"left join Nosocomio n on cg.idNosocomio = n.idNosocomio "+
		"left join Comisaria co on i.idComisaria = co.idComisaria "+
		"inner join Cat ca on i.nroCAT = ca.nroCAT "+
		"inner join Asociado aso on ca.idAsociado = aso.idAsociado "+
		"inner join Persona pe_aso on aso.idPersona = pe_aso.idPersona "+
		"inner join Persona pe_ag on ag.idPersona = pe_ag.idPersona where cg.idCarta=? ";
	var parametros = [idCarta];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.getDetalleAgraviado = function(req, res, funcionName){
	var codAgraviado = req.query.codAgraviado;
	var query = "select e.codEvento, date_format(e.fechaAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, ta.descripcion as tipoAccidente, "+
		"n.idNosocomio, n.nombre as nombreNosocomio, n.tipo as tipoNosocomio, n.idDistrito as distritoNosocomio, co.nombre as nombreComisaria, ca.nroCAT, concat(pe_aso.nombres,' ',pe_aso.apellidoPaterno,' ',pe_aso.apellidoMaterno) as nombreAsociado, "+
		"pe_aso.razonSocial, pe_aso.tipoPersona, ca.placa, ag.codAgraviado, pe_ag.nroDocumento as DNI_Agraviado, "+
		"concat(pe_ag.nombres,' ',pe_ag.apellidoPaterno,' ',pe_ag.apellidoMaterno) as nombreAgraviado, "+
		"ag.diagnostico as diagnosticoAgraviado, i.UIT, i.idDistritoAccidente from Agraviado ag "+
		"inner join Evento e on ag.codEvento = e.codEvento "+
		"inner join Informe i on e.codEvento = i.codEvento "+
		"left join TipoAccidente ta on i.idTipoAccidente = ta.idTipoAccidente "+
		"left join Nosocomio n on ag.idNosocomio = n.idNosocomio "+
		"left join Comisaria co on i.idComisaria = co.idComisaria "+
		"inner join Cat ca on e.nroCAT = ca.nroCAT "+
		"inner join Asociado aso on ca.idAsociado = aso.idAsociado "+
		"inner join Persona pe_aso on aso.idPersona = pe_aso.idPersona "+
		"inner join Persona pe_ag on ag.idPersona = pe_ag.idPersona where ag.codAgraviado=? ";
	var parametros = [codAgraviado];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.getListaMedicoAuditor = function(req, res, funcionName){
	var query = "Select m.idMedico, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreMedico from Medico m inner join Persona p on m.idPersona=p.idPersona";
	ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getListaCartasPrevias = function(req, res, funcionName){
	var idCarta = req.query.idCarta;
	var codAgraviado = req.query.codAgraviado;
	var query = "Select idEtapa as idCobertura, LPAD(idCarta, 5, '0') as idCarta, LPAD(nroCarta, 5, '0') as nroCarta, date_format(fecha, '%d/%m/%Y') as fecha, monto, idEtapa as idCobertura, estado, idPrimeraProyeccion from CartaGarantia where codAgraviado=? and idCarta!=? and estado!='A' order by CartaGarantia.fecha";
	var parametros = [codAgraviado, idCarta]
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.anularCarta = function(req, res, funcionName){
	var idCarta = req.query.idCarta;
	var motivo = req.query.motivo;
	var query = "Update CartaGarantia set estado = 'A', motivoAnulacion=? where idCarta=? ";
	var parametros = [motivo, idCarta];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "affectedRows");
}
exports.editarCarta = function(req, res, funcionName){
	var idCarta = req.query.idCarta;
	var idEtapa = req.query.idEtapa;
	var ampliacion = req.query.ampliacion;
	var cartaPrevia = req.query.cartaPrevia;
	var tipoAsistencia = req.query.tipoAsistencia;
	var auditor = req.query.auditor;
	var servicioMedico = req.query.servicioMedico;
	var diagnosticoCarta = req.query.diagnosticoCarta;
	var monto = req.query.monto;
	var idNosocomio = req.query.idNosocomio;
	var idFuneraria = req.query.idFuneraria;
	var fechaCarta = req.query.fechaCarta;
	var nroCarta = req.query.nroCarta;
	var estado = req.query.estado;
	
	if(nroCarta!=""){ // verifica que el numero de carta no exista:
		var queryValidarNro = "Select count(*) as cantidad from CartaGarantia where nroCarta=? and idCarta!=? and estado!='A'";
		var paramsValida = [nroCarta, idCarta];
		ejecutarQUERY_MYSQL(queryValidarNro, paramsValida, res, funcionName, function(res1, resultados1){
			var cantRegistros = resultados1[0].cantidad;
			if(cantRegistros==0){ // el numero de carta esta disponible
				var query = "Update CartaGarantia set idEtapa=?, fecha=?, nroCarta=?, estado=?, idFuneraria=?, idNosocomio=?, esAmpliacion=?, idCartaAnterior=?, idTipoAtencion=?, idAuditor=?, idServicioMedico=?, diagnostico=?, monto=? where idCarta=?";
				var parametros = [idEtapa, fechaCarta, nroCarta, estado, idFuneraria, idNosocomio, ampliacion, cartaPrevia, tipoAsistencia, auditor, servicioMedico, diagnosticoCarta, monto, idCarta];
				ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function(res, resultados){
					var filasAfectadas = [resultados.affectedRows];
					enviarResponse(res, filasAfectadas);
					// actualiza el monto de la proyeccion si es que es necesario:
					var idProyeccion = req.query.idProyeccion;
					if(idProyeccion>0){ // Esto se implemento para ser capaz de editar la proyeccion de la primera carta de garantia 
						var monto = req.query.monto;
						var queryUpdateProyeccion = "Update ProyeccionGastos set montoAproximado = ? where idProyeccionGastos = ? ";
						var params = [monto, idProyeccion];
						ejecutarQUERY_MYSQL(queryUpdateProyeccion, params, res, funcionName, "false");
						// actualiza gastos total del agraviado:
						var codAgraviado = req.query.codAgraviado;
						var updateGastoTotalProyeccion = "Update Agraviado a set a.gastoTotalAprox = (select sum(p.montoAproximado) from ProyeccionGastos p where p.codAgraviado=?) where a.codAgraviado=?";
						var parametros2 = [codAgraviado, codAgraviado];
						ejecutarQUERY_MYSQL(updateGastoTotalProyeccion, parametros2, res, funcionName, "false");
					}
				});				
			}else{
				enviarResponse(res1, [false]);				
			}
		});
	}else{
		var query = "Update CartaGarantia set idEtapa=?, fecha=?, nroCarta=?, estado=?, idFuneraria=?, idNosocomio=?, esAmpliacion=?, idCartaAnterior=?, idTipoAtencion=?, idAuditor=?, idServicioMedico=?, diagnostico=?, monto=? where idCarta=?";
		var parametros = [idEtapa, fechaCarta, nroCarta, estado, idFuneraria, idNosocomio, ampliacion, cartaPrevia, tipoAsistencia, auditor, servicioMedico, diagnosticoCarta, monto, idCarta];
		ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function(res, resultados){
			var filasAfectadas = [resultados.affectedRows];
			enviarResponse(res, filasAfectadas);
			// actualiza el monto de la proyeccion si es que es necesario:
			var idProyeccion = req.query.idProyeccion;
			if(idProyeccion>0){ // Esto se implemento para ser capaz de editar la proyeccion de la primera carta de garantia 
				var monto = req.query.monto;
				var queryUpdateProyeccion = "Update ProyeccionGastos set montoAproximado = ? where idProyeccionGastos = ? ";
				var params = [monto, idProyeccion];
				ejecutarQUERY_MYSQL(queryUpdateProyeccion, params, res, funcionName, "false");
				// actualiza gastos total del agraviado:
				var codAgraviado = req.query.codAgraviado;
				var updateGastoTotalProyeccion = "Update Agraviado a set a.gastoTotalAprox = (select sum(p.montoAproximado) from ProyeccionGastos p where p.codAgraviado=?) where a.codAgraviado=?";
				var parametros2 = [codAgraviado, codAgraviado];
				ejecutarQUERY_MYSQL(updateGastoTotalProyeccion, parametros2, res, funcionName, "false");
			}
		});		
	}
}
exports.guardarCarta = function(req, res, funcionName){
	var idEtapa = req.query.idEtapa;
	var ampliacion = req.query.ampliacion;
	var cartaPrevia = req.query.cartaPrevia;
	var tipoAsistencia = req.query.tipoAsistencia;
	var auditor = req.query.auditor;
	var servicioMedico = req.query.servicioMedico;
	var diagnosticoCarta = req.query.diagnosticoCarta;
	var monto = req.query.monto;
	var idNosocomio = req.query.idNosocomio;	
	var idFuneraria = req.query.idFuneraria;
	var codAgraviado = req.query.codAgraviado;
	var codEvento = req.query.codEvento;
	var nroCAT = req.query.nroCAT;
	var fechaCarta = req.query.fechaCarta;
	var nroCarta = req.query.nroCarta;
	if(nroCarta!=""){ // verifica que el numero de carta no exista:
		var queryValidarNro = "Select count(*) as cantidad from CartaGarantia where nroCarta=? and estado!='A'";
		var paramsValida = [nroCarta];
		ejecutarQUERY_MYSQL(queryValidarNro, paramsValida, res, funcionName, function(res1, resultados1){
			var cantRegistros = resultados1[0].cantidad;
			if(cantRegistros==0){ // el numero de carta esta disponible
				var query = "Insert into CartaGarantia(idEtapa, fecha, nroCarta, idTipoAtencion, idFuneraria, idNosocomio, esAmpliacion, idServicioMedico, nroCAT, codEvento, codAgraviado, "+
				" diagnostico, monto, idCartaAnterior, idAuditor ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
				var parametros = [idEtapa, fechaCarta, nroCarta, tipoAsistencia, idFuneraria, idNosocomio, ampliacion, servicioMedico, nroCAT, codEvento, codAgraviado, diagnosticoCarta, monto, cartaPrevia, auditor];
				ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "insertId");
			}else{
				enviarResponse(res1, [false]);				
			}
		});
	}else{
		var query = "Insert into CartaGarantia(idEtapa, fecha, nroCarta, idTipoAtencion, idFuneraria, idNosocomio, esAmpliacion, idServicioMedico, nroCAT, codEvento, codAgraviado, "+
		" diagnostico, monto, idCartaAnterior, idAuditor ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
		var parametros = [idEtapa, fechaCarta, nroCarta, tipoAsistencia, idFuneraria, idNosocomio, ampliacion, servicioMedico, nroCAT, codEvento, codAgraviado, diagnosticoCarta, monto, cartaPrevia, auditor];
		ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "insertId");
	}	
}
exports.getTotalProyectado = function(req, res, funcionName){
	var codAgraviado = req.query.codAgraviado;
	var query = "select (Select sum(pg1.montoAproximado) as monto1 from ProyeccionGastos pg1 where pg1.idFase='1' and pg1.codAgraviado = ag.codAgraviado) as monto1 ,"+
		 "(Select sum(pg2.montoAproximado) as monto2 from ProyeccionGastos pg2 where pg2.idFase='2' and pg2.codAgraviado = ag.codAgraviado) as monto2, "+
		 "(Select sum(pg3.montoAproximado) as monto3 from ProyeccionGastos pg3 where pg3.idFase='3' and pg3.codAgraviado = ag.codAgraviado) as monto3, "+
		 "(Select sum(pg4.montoAproximado) as monto4 from ProyeccionGastos pg4 where pg4.idFase='4' and pg4.codAgraviado = ag.codAgraviado) as monto4, "+
		 "(Select sum(pg5.montoAproximado) as monto5 from ProyeccionGastos pg5 where pg5.idFase='5' and pg5.codAgraviado = ag.codAgraviado) as monto5 from Agraviado ag where ag.codAgraviado = ?"; 
	var params = [codAgraviado];
	ejecutarQUERY_MYSQL(query, params, res, funcionName);
}
exports.marcarCartaImpresa = function(req, res, funcionName){
	var idCarta = req.query.idCarta;
	var query = "Update CartaGarantia set estado = 'P' where idCarta=?";
	var params = [idCarta];
	ejecutarQUERY_MYSQL(query, params, res, funcionName, 'affectedRows');
}
// CUS02
exports.verificarCartasAgraviados = function(req, res, funcionName){ // obtiene la cantidad de cartas de garantias por cada agraviado de un evento
	var codEvento = req.query.codEvento;
	var query = "Select a.codAgraviado, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado, (select count(*) from CartaGarantia cg where cg.codAgraviado=a.codAgraviado) as cantidadCartas from Agraviado a inner join Persona p on a.idPersona=p.idPersona where a.codEvento=?";
	var parametros = [codEvento];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.getServicioMedicosList = function(req, res, funcionName){
	var query = "Select idServicioMedico, descripcion from ServicioMedico order by descripcion";
	var parametros = [];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.getTipoAtencionList = function(req, res, funcionName){ // obtiene todos los tipos de atencion
	var query = "Select idTipoAtencion, descripcion, valorUIT, tipo from TipoAtencion order by descripcion";
	var parametros = [];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
// FIN DE CUS 02

exports.getListaFunerarias = function(req, res, funcionName){ // obtiene todos los tipos de las funerarias
	var query = "Select idFuneraria, nombre from Funeraria";
	var parametros = [];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
function fechaEnPdf(fecha){
	arrayMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
	var fechaArray = fecha.split("/");
	var año = fechaArray[2];
	var dia = fechaArray[0];
	var mesIndex = parseInt(fechaArray[1])-1;
	var mesString = arrayMes[mesIndex];
	return "Lima "+dia+" de "+mesString+" del "+año;
}
exports.generarCartaGarantia_p = function(req, res, funcionName){ // Genera una carta de garantia (1=gastos , 2=sepelio)
	var tipoCarta = req.query.tipoCarta;
	var nroCarta = req.query.nroCarta;	
	var nosocomio_funeraria = req.query.nosocomio_funeraria;
	var tipoAtencion = req.query.tipoAtencion;
	var asociado = req.query.asociado;
	var paciente = req.query.paciente;
	var diagnostico = req.query.diagnostico;
	var fechaOcurrencia = req.query.fechaOcurrencia;
	var cat = req.query.cat;
	var monto = req.query.monto;
	var fechaCarta = req.query.fechaCarta;
	var codEvento = req.query.codEvento;
	var codAgraviado = req.query.codAgraviado;
	var placa = req.query.placa;
	var nombreUsuario = req.query.nombreUsuario;
	var fechaHoraImpresion = req.query.fechaHoraImpresion;
	
	var html="";
	var footer = "";
	switch(tipoCarta){
		case '1': // carta de garantia de gastos
			var font="";
			var ancho = "580px";
			var body = 
				"<div style='width:"+ancho+"; background-color:; min-height:40px; font-style:"+font+";'>"+
					"<!--logo autoseguro a la izquierda -->"+
					"<div style='float:left; width:310px;'>"+
						"<img src='"+urldominio+"images/autoseguro.jpg' style='width:160px;'/>"+
					"<div>"+
					"<br><br>"+
					"<div id='Titulo' style='font-size:17px; font-weight:bold; width:"+ancho+"; text-align:center;'>"+
						"CARTA DE GARANTIA (Referencia) : "+nroCarta+
					"</div>"+
					"<div>"+
					"<br><br>"+
					"<table style='width:"+ancho+"; margin:auto; font-style:"+font+";' >"+
						"<col style='width:10%'>"+
						"<col style='width:90%'>"+
						"<tr style='height:13px;'>"+
							"<td style='text-align:left; font-weight:bold; font-size:11px;'>Señor(es):</td>"+
							"<td style='text-align:left; font-size:11px;'>"+nosocomio_funeraria+"</td>"+
						"</tr>"+
					"</table>"+
					"<br>"+
					"<table style='width:"+ancho+"; margin:auto; font-style:"+font+";' >"+
						"<col style='width:45%'>"+
						"<col style='width:55%'>"+
						"<tr style='height:18px;'>"+
							"<td colspan='2' style='text-align:left; padding-left:20px; font-weight:bold; font-size:11px;'>Referencia del Siniestro: </td>"+							
						"</tr>"+
						"<tr style='height:18px;'>"+
							"<td style='text-align:left; padding-left:46px;; font-weight:bold; font-size:10px;'>Asociado(a): </td>"+
							"<td style='text-align:left; font-size:10px;'>"+asociado+"</td>"+
						"</tr>"+
						"<tr style='height:18px;'>"+
							"<td style='text-align:left; padding-left:46px;; font-weight:bold; font-size:10px;'>Paciente: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+paciente+"</td>"+
						"</tr>"+
						"<tr style='height:18px;'>"+
							"<td style='text-align:left; padding-left:46px;; font-weight:bold; font-size:10px;'>Vehiculo Placa de Rodaje: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+placa+"</td>"+							
						"</tr>"+
						"<tr style='height:18px;'>"+
							"<td style='text-align:left; padding-left:46px;; font-weight:bold; font-size:10px;'>Diagnóstico: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+diagnostico+"</td>"+
						"</tr>"+
						"<tr style='height:18px;'>"+
							"<td style='text-align:left; padding-left:46px;; font-weight:bold; font-size:10px;'>Fecha de Ocurrencia: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+fechaOcurrencia+"</td>"+
						"</tr>"+
						"<tr style='height:18px;'>"+
							"<td style='text-align:left; padding-left:46px;; font-weight:bold; font-size:10px;'>Certificado contra accidente de tránsito: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+cat+"</td>"+
						"</tr>"+					
					"</table>"+
					"<br>"+
					"<div id='cuerpo' style='width:"+ancho+"; margin:auto;'>"+
						"<p style='text-align:justify; font-size:10.5px; line-height:18.5px; padding-top:7px;'>"+
							"De nuestra especial consideracion: "+
						"</p>"+
						"<p style='text-align:justify; font-size:10.5px; line-height:18.5px; padding-top:7px;'>"+     
							"AUTOSEGURO AFOCAT con RUC N° 20516314398, inscrito en los Registros Públicos en la partida N° 120225509, ante ustedes "+
							"extendemos la presente Carta de GARANTIA, para atender al paciente indicando en la referencia, en todo lo que corresponda "+
							"a las lesiones sufridas como consecuencia del accidente de tránsito donde ha participado una de nuestras unidades vehiculares "+
							"asociadas; indicando que los gastos médicos efectuados, serán cubiertos por nuestra representada previo proceso de auditoría médica "+
							"y de acuerdo a la tarifa especial."+
						"</p>"+
						"<p style='text-align:justify; font-size:10.5px; line-height:18.5px; padding-top:7px;'>"+
							"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+"Asimismo, les agradeceremos nos alcancen adjunto a vuestra factura "+
							"una copia del certificado del CAT(Soat Regional), informe del médico tratante, copia de denuncia policial, las clases de lesiones atendidas, "+
							"e tratamiento dado si es necesario un tratamiento posterior, duración de la hospitalización en caso de haber sido necesario, así como el detalle de todos los "+
							"gastos, copias de las recetas médicas, copia de las solicitudes de exámenes auxiliares, sus resultados y el plan de tratamiento ambulatorio."+
						"</p>"+
						"<p style='text-align:justify; font-size:10.5px; line-height:18.5px; padding-top:7px;'>"+   
							"La presente Carta de Garantia esta destinada para el servicio de:  "+tipoAtencion+
							"<br>"+
							"<b>Nota:</b> Las Medicinas serán Genéricas"+
							"<br>"+
							"Monto para la presente cobertura S/."+number_format(monto,2)+
						"</p>"+
						"<br>"+
						"<p style='text-align:justify; font-size:10.5px; line-height:18.5px; padding-top:7px;'>"+   
							"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "+fechaEnPdf(fechaCarta)+
						"</p>"+
						"<br>"+
						"<br>"+
						"<p style='text-align:center; padding-left:300px; font-size:9.5px; line-height:18.5px; padding-top:7px;'>"+ 
							"------------------------------------------------------------------------------"+
							"<br>"+
							"Dr. Emilio"+
						"</p>"+
					"</div>"+
				"</div>";
			html=            
			"<html>"+
				"<head>"+
				   "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'>"+
				"</head>"+
				"<body style='padding-top:0px; background-color:;'>"+
					"<br>"+
					"<div style='line-height:20px; margin:auto; width:"+ancho+"; text-align:justify; margin-top:4px; background-color:;'>"+
						body+
					"</div>"+
				"</body>"+
			"</html>";
			break;
		case '2': // carta de garantia por sepelio
			var font="";
			var ancho = "635px";
			var fechaPrint = req.query.fechaPrint;
			body = 
			"<div style='width:"+ancho+"; font-size:10px; background-color:; min-height:40px; font-style:"+font+";'>"+
				"<table id='datos_impresion' style='float:right; width:250px; color:gray; font-size:9px; background-color:;'>"+
					"<col style='width:43%'>"+ 
					"<col style='width:2%'>"+
					"<col style='width:55%'>"+
					 "<tr>"+
						"<td>Fecha Impresión</td>"+
					   "<td>:</td>"+
					   "<td style='text-align:left;'>"+fechaHoraImpresion.split(" ")[0]+"</td>"+
					"</tr> "+               
					"<tr>"+
						"<td>Hora Impresión</td>"+
						"<td>:</td>"+
						"<td style='text-align:left;'>"+fechaHoraImpresion.split(" ")[1]+" "+fechaHoraImpresion.split(" ")[2]+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='3'>Usuario : "+nombreUsuario+"</td>"+
					"</tr>"+
				"</table>"+
				"<br>"+
				"<br>"+
				"<br>"+
				"<table id='datos_impresion' style='float:left; width:350px; font-size:10px; color:black; background-color:;'>"+
					"<col style='width:45%'>"+
					"<col style='width:55%'>"+
					 "<tr>"+
						"<td style='font-weight:bold;'>NRO DE CARTA SEPELIO</td>"+
						"<td style='text-align:left;'>: "+nroCarta+"("+codAgraviado+")</td>"+
					"</tr> "+
					"<tr>"+
						"<td colspan='2'>Jesus Maria, "+fechaCarta+"</td>"+
					"</tr>"+
				"</table>"+
				"<br>"+
				"<br>"+
				"<br>"+	
				"<table style='width:"+ancho+"; font-size:10px; color:black; background-color:;'>"+
					"<col style='width:6%'>"+
					"<col style='width:14%'>"+
					"<col style='width:27%'>"+
					"<col style='width:11%'>"+
					"<col style='width:42%'>"+
					"<tr>"+
						"<td colspan='5'>Señores</td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='5' style='font-weight:bold;'>"+nosocomio_funeraria+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='5'></td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='5'></td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='5'></td>"+
					"</tr>"+
					"<tr>"+
						"<td>Ref.</td>"+
						"<td>Siniestro N°</td>"+
						"<td>: "+codAgraviado+"</td>"+
						"<td>Placa</td>"+
						"<td>: "+placa+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td></td>"+
						"<td>CAT N°</td>"+
						"<td>: "+cat+"</td>"+
						"<td>Asegurado</td>"+
						"<td>: "+asociado+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td></td>"+
						"<td>Ocurrencia</td>"+
						"<td>: 08/08/2016</td>"+
						"<td>Paciente</td>"+
						"<td>: "+paciente+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td></td>"+
						"<td>Evento N°</td>"+
						"<td>: "+codEvento+"</td>"+
						"<td></td>"+
						"<td></td>"+
					"</tr>"+
					"<tr>"+
						"<td></td>"+
						"<td>Atención</td>"+
						"<td>: "+tipoAtencion+"</td>"+
						"<td></td>"+
						"<td></td>"+
					"</tr>"+
				"</table>"+
				"<br>"+
				"<p style='text-align:justify; font-size:10px; line-height:15px;'>"+
					"De nuestra consideración: "+
					"<br>"+
					"<br>"+
					"Por medio de la presente, en nuestra condición de aseguradores del vehículo de Placa de Rodaje de la referencia,según Póliza "+
					"del CAT Nº "+cat+" estamos procediendo a garantizar los gastos de sepelio de (l) (la) "+
					"señor(a) (ita) "+paciente+" quien resultó victima a consecuencia del accidente de tránsito en referencia "+
					"hasta la suma máxima de S/. "+number_format(monto,2)+" NUEVOS SOLES."+
					"<br>"+
					"<br>"+
					"Es entendido que nuestra compañía no asume responsabilidad por lo que pudiera suceder durante el internamiento del (l) (la) "+
					"mencionado(a) paciente en vuestra institución."+
					"<br>"+
					"<br>"+
					"Así mismo, apreciamos nos alcancen, adjuntos a vuestra factura correspondiente, informe medico, las guías respectivas "+
					"copia de la póliza, copia del DNI del agraviado y la copia certificada de la ocurrencia policial, documentos que deberán ser "+
					"recibidos en nuestras oficinas dentro de los 30 días emitida la presente carta, ya que en caso contrario la presente carta de "+
					"garantía queda sin efecto."+
					"<br>"+
					"<br>"+
					"<br>"+
					"Atentamente,"+
				"</p>"+
				"<br>"+
				"<br>"+
				"<br>"+
				"<p style='text-align:center; font-size:10px; line-height:15px;'>"+
					"-----------------------------------------------"+
					"<br>"+
					nombreUsuario+
					"<br>"+
					"EJECUTIVO DE SINIESTROS"+
				"</p>"+
				"<br>"+
				"<br>"+
				"<p style='text-align:justify; font-size:10px; line-height:15px;'>"+
					"Autorizado por: EMILIO FRANCISCO MENDEZ GOMEZ"+
					"<br>"+
					"<br>"+
					"1. Es importante recalcar que estamos dispuestos a asumir lo aquí garantizado siempre y cuando no existan hechos "+
					"que sean excluyentes al contrato de seguros, según lo establecido por el art. 37 del D.S. Nº 024-2002-MTC -Texto "+
					"Único Ordenado del Reglamento Nacional de Responsabilidad Civil y Seguros Obligatorios por Accidente de "+
					"Tránsito - y el numeral 4 Condiciones Generales de la Póliza del Seguro Obligatorio de Accidentes de Tránsito, "+
					"aprobada por R.M. Nº 306-2002-MTC/15.02 y sus normas modificatorias."+
					"<br>"+
					"<br>"+
					"2. Este documento, que es otorgado por la dependencia de la PNP de la jurisdicción en que ocurrió el siniestro, deberá contener "+
					"una descripción del accidente de tránsito de conformidad con la definición establecido en el art. 2º del D.S 024-2002-MTC y el "+
					"numeral 2º de las Condiciones Generales de la Póliza del CAT antes aludida, Sin embargo, en caso que el supuesto de hecho "+
					"consignado en el referido documento policial, no constituyese un accidente de tránsito de acuerdo a la definición antes "+
					"indicada, procederemos a devolver la(s) factura(s) correspondiente(s)."+
				"</p>"+
			"</div>";			
			html=            
			"<html>"+
				"<head>"+
				   "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'>"+
				"</head>"+
				"<body style='padding-top:0px; background-color:;'>"+
					"<br>"+
					"<div style='line-height:20px; margin:auto; width:"+ancho+"; text-align:justify; margin-top:4px; background-color:;'>"+
						body+
					"</div>"+
				"</body>"+
			"</html>";
			break;
	}	
	generatePDF(html, footer, res, "88px");
}
function crearCartaPDF(resultSet, req, res, funcionName){
	var tipoCarta = resultSet.tipoCarta;
	var nroCarta = resultSet.nroCarta;	
	var nosocomio_funeraria = resultSet.nosocomio_funeraria;
	var tipoAtencion = resultSet.tipoAtencion;
	var asociado = resultSet.asociado;
	var paciente = resultSet.paciente;
	var diagnostico = resultSet.diagnostico;
	var fechaOcurrencia = resultSet.fechaOcurrencia;
	var cat = resultSet.cat;
	var monto = resultSet.monto;
	var fechaCarta = resultSet.fechaCarta;
	var codEvento = resultSet.codEvento;
	var codAgraviado = resultSet.codAgraviado;
	var placa = resultSet.placa;
	var nombreUsuario = resultSet.nombreUsuario;
	var fechaHoraImpresion = resultSet.fechaHoraImpresion;
	var fechaAtencion = resultSet.fechaAtencion;
	var servicioMedico = resultSet.servicioMedico;
	var tipoAsistencia = resultSet.tipoAsistencia;
	
	var html="";
	var footer = "";
	switch(tipoCarta){
		case '1': // carta de garantia de gastos
			var font="";
			var ancho = "580px";
			var body = 
				"<div style='width:"+ancho+"; background-color:; min-height:40px; font-style:"+font+";'>"+
					"<!--logo autoseguro a la izquierda -->"+
					"<div style='float:left; width:200px; background-color:;'>"+
						"<img src='"+urldominio+"wpimages/logo_autoseguro.jpg' style='width:160px;'/>"+
					"</div>"+
					"<div style='float:right; width:250px; background-color:;'>"+
						"<table style='width:280px; font-size:11px;'>"+
							"<col style='width:50%'>"+
							"<col style='width:50%'>"+
							"<tr>"+
								"<td style='text-align:right; font-size:11px; font-weight:bold;'>F. de Accidente: </td>"+
								"<td>"+fechaOcurrencia+"</td>"+
							"</tr>"+
							"<tr>"+
								"<td style='text-align:right; font-size:11px; font-weight:bold;'>Cod Evento: </td>"+
								"<td>"+codEvento+"</td>"+
							"</tr>"+
							"<tr>"+
								"<td style='text-align:right; font-size:11px; font-weight:bold;'>Nro Siniestro: </td>"+
								"<td>"+codAgraviado+"</td>"+
							"</tr>"+
						"</table>"+
					"</div>"+
					"<br><br><br><br><br>"+
					"<div id='Titulo' style='font-size:17px; font-weight:bold; width:"+ancho+"; text-align:center;'>"+
						"CARTA DE GARANTIA (ref nro)"+nroCarta+
					"</div>"+
					"<br><br>"+
					"<table style='width:"+ancho+"; margin:auto; font-style:"+font+";' >"+
						"<col style='width:10%'>"+
						"<col style='width:90%'>"+
						"<tr style='height:13px;'>"+
							"<td style='text-align:left; font-weight:bold; font-size:11px;'>Señor(es):</td>"+
							"<td style='text-align:left; font-size:11px;'>"+nosocomio_funeraria+"</td>"+
						"</tr>"+
					"</table>"+
					"<br>"+
					"<table style='width:"+ancho+"; margin:auto; font-style:"+font+";' >"+
						"<col style='width:18%'>"+
						"<col style='width:27%'>"+
						"<col style='width:18%'>"+
						"<col style='width:37%'>"+
						"<tr style='height:22px;'>"+
							"<td colspan='4' style='text-align:left; font-weight:bold; font-size:11px;'>Referencia del Siniestro: </td>"+
						"</tr>"+
						"<tr style='height:18px;'>"+
							"<td style='text-align:right; font-weight:bold; font-size:10px;'>F. de Atención: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+fechaAtencion+"</td>"+
							"<td style='text-align:right; font-weight:bold; font-size:10px;'>Placa: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+placa+"</td>"+
						"</tr>"+
						"<tr style='height:18px;'>"+
							"<td style='text-align:right; font-weight:bold; font-size:10px;'>Nro CAT: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+cat+"</td>"+
							"<td style='text-align:right; font-weight:bold; font-size:10px;'>Asegurado: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+asociado+"</td>"+
						"</tr>"+
						"<tr style='height:18px;'>"+
							"<td style='text-align:right; font-weight:bold; font-size:10px;'>Especialidad: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+servicioMedico+"</td>"+
							"<td style='text-align:right; font-weight:bold; font-size:10px;'>Paciente: </td>"+
							"<td style='text-align:left; font-size:10px;'>"+paciente+"</td>"+
						"</tr>"+
					"</table>"+
					"<br>"+
					"<div id='cuerpo' style='width:"+ancho+"; margin:auto;'>"+
						"<p style='text-align:justify; font-size:10.5px; line-height:18.5px; padding-top:7px;'>"+
							"De nuestra especial consideracion: "+
						"</p>"+
						"<p style='text-align:justify; font-size:10.5px; line-height:18.5px; padding-top:7px;'>"+     
							"Por medio de la presente como Asociación Aseguradora del vehículo de placa de rodaje de la referencia, según póliza del CAT Nro. "+cat+" estamos procediendo a garantizar los gastos médicos, y quirúrgicos que demande la atención de (1) (la) señor(a) (ita) "+paciente+" quien resultara lesionado(a) a consecuencia del accidente de tránsito en referencia según el siguiente detalle:</p>"+
							"<table style='width:"+ancho+"; margin:auto; font-style:"+font+"; font-size:10px;' border=1>"+
								"<col style='width:33%'>"+
								"<col style='width:33%'>"+
								"<col style='width:34%'>"+
								"<tr style='height:25px; font-weight:bold;'>"+
									"<td style='text-align:center;'>Tipo de Atención</td>"+
									"<td style='text-align:center;'>Cobertura en UIT</td>"+
									"<td style='text-align:center;'>Monto en S/. Garantizado </td>"+
								"</tr>"+
								"<tr style='height:25px;'>"+
									"<td style='text-align:center;'>"+tipoAsistencia+"</td>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'>"+number_format(monto,2)+"</td>"+
								"</tr>"+
							"</table>"+
							"<p style='text-align:justify; font-size:11px; line-height:18.5px; padding-top:7px; font-weight:bold;'>"+ 
								"ATENCIONES PREVIAS EN OTRAS IPRESS"+
							"</p>"+
							"<table style='width:"+ancho+"; margin:auto; font-style:"+font+"; font-size:10px;' border=1>"+
								"<col style='width:25%'>"+
								"<col style='width:25%'>"+
								"<col style='width:25%'>"+
								"<col style='width:25%'>"+
								"<tr style='height:25px; font-weight:bold;'>"+
									"<td style='text-align:center;'>Nombre de IPRESS donde se atendió</td>"+
									"<td style='text-align:center;'>N° de carta de Garantia y Fecha de Emisión</td>"+
									"<td style='text-align:center;'>Tipo de Atención Recibida</td>"+
									"<td style='text-align:center;'>Monto en S/. Garantizado </td>"+
								"</tr>"+
								"<tr style='height:25px;'>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'></td>"+
								"</tr>"+
								"<tr style='height:25px;'>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'></td>"+
								"</tr>"+
								"<tr style='height:25px;'>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'></td>"+
									"<td style='text-align:center;'></td>"+
								"</tr>"+
							"</table>"+							
							"<p style='text-align:justify; font-size:10.5px; line-height:18.5px; padding-top:7px;'>"+ 
								"Autoseguro no asume responsabilidad por lo que pudiera suceder durante el internamiento del (1) (la) mencionado(a) paciente en vuestra institución. <br>"+
								"Así mismo, solicitamos el envío de las facturas con su respetivo expediente de reembolso completo según Directiva Administrativa Nº 210-MINSA/DGSP.V.01 para IPRESS Publicas."+
								"<br><br>"+
								"Atentamente,"+
							"</p>"+						
					"</div>"+
				"</div>";
			html=            
			"<html>"+
				"<head>"+
				   "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'>"+
				"</head>"+
				"<body style='padding-top:0px; background-color:;'>"+
					"<br>"+
					"<div style='line-height:20px; margin:auto; width:"+ancho+"; text-align:justify; margin-top:4px; background-color:;'>"+
						body+
					"</div>"+
				"</body>"+
			"</html>";
			break;
		case '2': // carta de garantia por sepelio
			var font="";
			var ancho = "635px";
			var fechaPrint = req.query.fechaPrint;
			body = 
			"<div style='width:"+ancho+"; font-size:10px; background-color:; min-height:40px; font-style:"+font+";'>"+
				"<table id='datos_impresion' style='float:right; width:250px; color:gray; font-size:9px; background-color:;'>"+
					"<col style='width:43%'>"+ 
					"<col style='width:2%'>"+
					"<col style='width:55%'>"+
					 "<tr>"+
						"<td>Fecha Impresión</td>"+
					   "<td>:</td>"+
					   "<td style='text-align:left;'>"+fechaHoraImpresion.split(" ")[0]+"</td>"+
					"</tr> "+               
					"<tr>"+
						"<td>Hora Impresión</td>"+
						"<td>:</td>"+
						"<td style='text-align:left;'>"+fechaHoraImpresion.split(" ")[1]+" "+fechaHoraImpresion.split(" ")[2]+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='3'>Usuario : "+nombreUsuario+"</td>"+
					"</tr>"+
				"</table>"+
				"<br>"+
				"<br>"+
				"<br>"+
				"<table id='datos_impresion' style='float:left; width:350px; font-size:10px; color:black; background-color:;'>"+
					"<col style='width:45%'>"+
					"<col style='width:55%'>"+
					 "<tr>"+
						"<td style='font-weight:bold;'>NRO DE CARTA SEPELIO</td>"+
						"<td style='text-align:left;'>: "+nroCarta+"("+codAgraviado+")</td>"+
					"</tr> "+
					"<tr>"+
						"<td colspan='2'>Jesus Maria, "+fechaCarta+"</td>"+
					"</tr>"+
				"</table>"+
				"<br>"+
				"<br>"+
				"<br>"+	
				"<table style='width:"+ancho+"; font-size:10px; color:black; background-color:;'>"+
					"<col style='width:6%'>"+
					"<col style='width:14%'>"+
					"<col style='width:27%'>"+
					"<col style='width:11%'>"+
					"<col style='width:42%'>"+
					"<tr>"+
						"<td colspan='5'>Señores</td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='5' style='font-weight:bold;'>"+nosocomio_funeraria+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='5'></td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='5'></td>"+
					"</tr>"+
					"<tr>"+
						"<td colspan='5'></td>"+
					"</tr>"+
					"<tr>"+
						"<td>Ref.</td>"+
						"<td>Siniestro N°</td>"+
						"<td>: "+codAgraviado+"</td>"+
						"<td>Placa</td>"+
						"<td>: "+placa+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td></td>"+
						"<td>CAT N°</td>"+
						"<td>: "+cat+"</td>"+
						"<td>Asegurado</td>"+
						"<td>: "+asociado+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td></td>"+
						"<td>Ocurrencia</td>"+
						"<td>: 08/08/2016</td>"+
						"<td>Paciente</td>"+
						"<td>: "+paciente+"</td>"+
					"</tr>"+
					"<tr>"+
						"<td></td>"+
						"<td>Evento N°</td>"+
						"<td>: "+codEvento+"</td>"+
						"<td></td>"+
						"<td></td>"+
					"</tr>"+
					"<tr>"+
						"<td></td>"+
						"<td>Atención</td>"+
						"<td>: "+tipoAtencion+"</td>"+
						"<td></td>"+
						"<td></td>"+
					"</tr>"+
				"</table>"+
				"<br>"+
				"<p style='text-align:justify; font-size:10px; line-height:15px;'>"+
					"De nuestra consideración: "+
					"<br>"+
					"<br>"+
					"Por medio de la presente, en nuestra condición de aseguradores del vehículo de Placa de Rodaje de la referencia,según Póliza "+
					"del CAT Nº "+cat+" estamos procediendo a garantizar los gastos de sepelio de (l) (la) "+
					"señor(a) (ita) "+paciente+" quien resultó victima a consecuencia del accidente de tránsito en referencia "+
					"hasta la suma máxima de S/. "+number_format(monto,2)+" NUEVOS SOLES."+
					"<br>"+
					"<br>"+
					"Es entendido que nuestra compañía no asume responsabilidad por lo que pudiera suceder durante el internamiento del (l) (la) "+
					"mencionado(a) paciente en vuestra institución."+
					"<br>"+
					"<br>"+
					"Así mismo, apreciamos nos alcancen, adjuntos a vuestra factura correspondiente, informe medico, las guías respectivas "+
					"copia de la póliza, copia del DNI del agraviado y la copia certificada de la ocurrencia policial, documentos que deberán ser "+
					"recibidos en nuestras oficinas dentro de los 30 días emitida la presente carta, ya que en caso contrario la presente carta de "+
					"garantía queda sin efecto."+
					"<br>"+
					"<br>"+
					"<br>"+
					"Atentamente,"+
				"</p>"+
				"<br>"+
				"<br>"+
				"<br>"+
				"<p style='text-align:center; font-size:10px; line-height:15px;'>"+
					"-----------------------------------------------"+
					"<br>"+
					nombreUsuario+
					"<br>"+
					"EJECUTIVO DE SINIESTROS"+
				"</p>"+
				"<br>"+
				"<br>"+
				"<p style='text-align:justify; font-size:10px; line-height:15px;'>"+
					"Autorizado por: EMILIO FRANCISCO MENDEZ GOMEZ"+
					"<br>"+
					"<br>"+
					"1. Es importante recalcar que estamos dispuestos a asumir lo aquí garantizado siempre y cuando no existan hechos "+
					"que sean excluyentes al contrato de seguros, según lo establecido por el art. 37 del D.S. Nº 024-2002-MTC -Texto "+
					"Único Ordenado del Reglamento Nacional de Responsabilidad Civil y Seguros Obligatorios por Accidente de "+
					"Tránsito - y el numeral 4 Condiciones Generales de la Póliza del Seguro Obligatorio de Accidentes de Tránsito, "+
					"aprobada por R.M. Nº 306-2002-MTC/15.02 y sus normas modificatorias."+
					"<br>"+
					"<br>"+
					"2. Este documento, que es otorgado por la dependencia de la PNP de la jurisdicción en que ocurrió el siniestro, deberá contener "+
					"una descripción del accidente de tránsito de conformidad con la definición establecido en el art. 2º del D.S 024-2002-MTC y el "+
					"numeral 2º de las Condiciones Generales de la Póliza del CAT antes aludida, Sin embargo, en caso que el supuesto de hecho "+
					"consignado en el referido documento policial, no constituyese un accidente de tránsito de acuerdo a la definición antes "+
					"indicada, procederemos a devolver la(s) factura(s) correspondiente(s)."+
				"</p>"+
			"</div>";			
			html=            
			"<html>"+
				"<head>"+
				   "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'>"+
				"</head>"+
				"<body style='padding-top:0px; background-color:;'>"+
					"<br>"+
					"<div style='line-height:20px; margin:auto; width:"+ancho+"; text-align:justify; margin-top:4px; background-color:;'>"+
						body+
					"</div>"+
				"</body>"+
			"</html>";
			break;
	}	
	generatePDF(html, footer, res, "88px");
}
exports.generarCartaGarantia = function(req, res, funcionName){ // Genera una carta de garantia (1=gastos , 2=sepelio)
	var idCarta = req.query.idCarta;
	if(idCarta!=undefined){
		var query = "select LPAD(cg.nroCarta, 5, '0') as nroCarta, date_format(cg.fecha, '%d/%m/%Y %H:%i') as fechaCarta, cg.idPrimeraProyeccion, e.codEvento, date_format(e.fechaAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, ta.descripcion as tipoAccidente, "+
		"cg.idFuneraria, n.idNosocomio, n.nombre as nombreNosocomio, fu.nombre as nombreFuneraria, n.tipo as tipoNosocomio, n.idDistrito as distritoNosocomio, co.nombre as nombreComisaria, ca.nroCAT, concat(pe_aso.nombres,' ',pe_aso.apellidoPaterno,' ',pe_aso.apellidoMaterno) as nombreAsociado, "+
		"pe_aso.razonSocial, pe_aso.tipoPersona, ca.placa, ag.codAgraviado, pe_ag.nroDocumento as DNI_Agraviado, "+
		"concat(pe_ag.nombres,' ',pe_ag.apellidoPaterno,' ',pe_ag.apellidoMaterno) as nombreAgraviado, "+
		"ag.diagnostico as diagnosticoAgraviado, cg.idEtapa as idCobertura, cg.esAmpliacion, LPAD(cg.idCartaAnterior, 5, '0') as idCartaAnterior, tip.descripcion as tipoAsistencia, cg.idAuditor, sm.descripcion as servicioMedico, "+
		"cg.diagnostico as diagnosticoCarta, cg.monto, i.UIT, i.idDistritoAccidente from CartaGarantia cg "+
		"inner join Evento e on cg.codEvento = e.codEvento "+
		"inner join Informe i on e.codEvento = i.codEvento "+
		"left join TipoAccidente ta on i.idTipoAccidente = ta.idTipoAccidente "+
		"inner join Agraviado ag on cg.codAgraviado = ag.codAgraviado "+
		"left join Nosocomio n on cg.idNosocomio = n.idNosocomio "+
		"left join Funeraria fu on cg.idFuneraria = fu.idFuneraria "+
		"left join Comisaria co on i.idComisaria = co.idComisaria "+
		"left join TipoAtencion tip on cg.idTipoAtencion = tip.idTipoAtencion "+
		"left join ServicioMedico sm on cg.idServicioMedico = sm.idServicioMedico "+
		"inner join Cat ca on i.nroCAT = ca.nroCAT "+
		"inner join Asociado aso on ca.idAsociado = aso.idAsociado "+
		"inner join Persona pe_aso on aso.idPersona = pe_aso.idPersona "+
		"inner join Persona pe_ag on ag.idPersona = pe_ag.idPersona where cg.idCarta=? ";
		var parametros = [idCarta];
		ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function(res, resultados){
			if(resultados.length>0){
				var nroCarta=idCarta+"";
				var cantDigitos = nroCarta.split("").length;
				var cantDeCeros = 5-cantDigitos;
				for(var i=0; i<cantDeCeros; i++){
					nroCarta = "0"+nroCarta;
				}
				var tipoCarta="1";
				var nosocomio_funeraria = resultados[0].nombreNosocomio;
				if(resultados[0].idCobertura=="5"){
					tipoCarta="2";
					nosocomio_funeraria = resultados[0].nombreFuneraria;
				}
				var resultSet = { 
					"tipoCarta":tipoCarta,
					"nroCarta":nroCarta,
					"nosocomio_funeraria":nosocomio_funeraria,
					"tipoAtencion":resultados[0].tipoAsistencia,
					"asociado":resultados[0].nombreAsociado,
					"paciente":resultados[0].nombreAgraviado,
					"diagnostico":resultados[0].diagnosticoAgraviado,
					"fechaOcurrencia":resultados[0].fechaAccidente,
					"cat":resultados[0].nroCAT,
					"monto":resultados[0].monto,
					"fechaCarta":(resultados[0].fechaCarta).split(" ")[0],
					"codEvento":resultados[0].codEvento,
					"codAgraviado":resultados[0].codAgraviado,
					"placa":resultados[0].placa,
					"nombreUsuario":req.query.nombreUsuario,
					"fechaHoraImpresion":req.query.fechaHoraImpresion,
					"fechaAtencion":resultados[0].fechaCarta.split(" ")[0],
					"servicioMedico":resultados[0].servicioMedico,
					"tipoAsistencia":resultados[0].tipoAsistencia
				};
				crearCartaPDF(resultSet, req, res, funcionName)
			}else{
				enviarResponse(res, "NO SE ENCONTRO CARTA") 
			}					
		});
	}else{
		crearCartaPDF(req.query, req, res, funcionName)		
	}

}
exports.getBusquedaProcedimientos = function(req, res, funcionName){ // Realiza una busqueda de procedimientos por codigo o descripcion, se usa en el CUS 03
	var campo = req.query.campo;
	var busqueda = req.query.busqueda;
	var tipo = req.query.tipoNosocomio;
	if(campo=='descripcion'){ // descripcion
		busqueda="%"+busqueda+"%";
	}else{ // codigo
		busqueda=busqueda+"%";
	}	
	var query = "Select idTarifa, codigoProcedimiento, descripcion, unidades from TarifaProcedimientos where "+campo+" like '"+busqueda+"' and tipoTarifa=?";
	var parametros = [tipo];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.getListaNosocomiosPorIdNosocomio = function(req, res, funcionName){ // obtiene los registros de los Nosocomio de un distrito de otro nosocomio previo (USADO EN CUS 03)
    var idNosocomio = req.query.idNosocomio;
	var parametros = [idNosocomio];
    var query = "Select n1.idNosocomio, n1.tipo, n1.nombre from Nosocomio n1 where n1.idDistrito in (select n2.idDistrito from Nosocomio n2 where n2.idNosocomio=?) order by n1.nombre";
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.revertirInforme = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var query = "select count(*) as cantidad from CartaGarantia where codEvento = ? and primeraCarta='N'";
	var parametros = [codEvento];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function(res, resultados){
		var cantidad = resultados[0].cantidad;
		if(cantidad>0){
			enviarResponse(res, [0]);
		}else{
			// verifica si existen nuevas proyecciones
			var queryProyecciones = "Select count(*) as cantidad from ProyeccionGastos where codEvento=? and tratamientoMes not like '%CARTA GARANTIA%'";
			var parametros = [req.query.codEvento];
			ejecutarQUERY_MYSQL(queryProyecciones, parametros, res, funcionName, function(res2, resultados2){
				var cantidad = resultados2[0].cantidad;
				if(cantidad>0){
					enviarResponse(res, [0]);
				}else{
					// revierte el informe:
					var queryUpdateInforme = "Update Informe set informeCerrado='N' where codEvento=?";
					var parametros = [req.query.codEvento];
					ejecutarQUERY_MYSQL(queryUpdateInforme, parametros, res, funcionName, "affectedRows");
				}
			});				
		}
	});
}
exports.informeProcuradorPDF = function (req, res, funcionName){
	var codEvento = req.query.codEvento;
    var idInforme = req.query.idInforme;
    var query = " select i.codEvento, i.UIT, e.idProcurador, c.nroCAT, c.placa, Concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, "+
        " pa.razonSocial, pa.tipoPersona, pa.nroDocumento, pa.idDistrito as distrito_a, pa.calle as calle_a, pa.nro as nro_a, pa.mzLote as mzLote_a, " +
        " pa.sector as sector_a, pa.referencia as referencia_a, c.idAsociado, c.marca, c.modelo, c.annoFabricacion as anno, date_format (c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, "+
        " date_format (i.fechaHoraAccidente, '%d/%m/%Y %H:%i') as fechaAccidente, date_format (i.fechaHoraAviso, '%d/%m/%Y %H:%i') as fechaAviso, i.causal1 as idCausal, i.idTipoAccidente, i.idDistritoAccidente as distritoAccidente, "+
        " i.direccionAccidente as lugarAccidente, "+
        " i.idChofer, ch.licenciaChofer, ch.claseChofer," +
        " pc.idPersona as idPersona_pc, concat(pc.nombres,' ',pc.apellidoPaterno,' ',pc.apellidoMaterno) as nombreConductor, pc.nroDocumento as DNI_pc, "+
        " i.idPropietario, pp.idPersona as idPersona_pp, concat(pp.nombres,' ',pp.apellidoPaterno,' ', pp.apellidoMaterno) as nombrePropietario, pp.nroDocumento as DNI_pp, "+
        " i.idPropietario2, pp2.idPersona as idPersona_pp2, pp2.nombres as nombres_pp2, pp2.apellidoPaterno as apellidoPaterno_pp2, pp2.apellidoMaterno as apellidoMaterno_pp2, pp2.nroDocumento as DNI_pp2, "+
        " i.madreChofer , pmc.nombres as nombres_pmc, pmc.apellidoPaterno as apellidoPaterno_pmc, pmc.apellidoMaterno as apellidoMaterno_pmc, pmc.nroDocumento as DNI_pmc, "+
        " i.padreChofer , ppc.nombres as nombres_ppc, ppc.apellidoPaterno as apellidoPaterno_ppc, ppc.apellidoMaterno as apellidoMaterno_ppc, ppc.nroDocumento as DNI_ppc, "+
        " i.idComisaria, cm.idDistrito as distritoComisaria, cm.nombre as comisariaNombre, i.codigoDenuncia, date_format (i.horaExamenCualitativo, '%d/%m/%Y %H:%i') as horaExamenCualitativo, "+
        " date_format (i.horaExamenCuantitativo, '%d/%m/%Y %H:%i') as horaExamenCuantitativo, date_format(i.fechaInicioInvestigacion, '%d/%m/%Y %H:%i') as fechaInicioInvestigacion, date_format(i.fechaFinInvestigacion, '%d/%m/%Y %H:%i') as fechaFinInvestigacion, "+
        " i.resultadoExamenEtilico, i.observaciones, "+
        " i.preguntasCalificacion, i.calificacion, dac.nombre as nombreDistroAccidente, "+
		" pac.nombreProvincia, dep_ac.nombreDepartamento, tpa.descripcion as tipoAccidenteDesc, cau.descripcion as causalDesc, comi.nombre as nombreComisaria, concat(usu.nombres,' ',usu.apellidos) as nombreProcurador "+
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
		" left join Distrito dac on i.idDistritoAccidente = dac.idDistrito "+
		" left join Provincia pac on dac.idProvincia = pac.idProvincia "+
		" left join Departamento dep_ac on pac.idDepartamento = dep_ac.idDepartamento "+
		" left join TipoAccidente tpa on i.idTipoAccidente = tpa.idTipoAccidente "+
		" left join Causal cau on i.causal1 = cau.codCausal "+
		" left join Comisaria comi on i.idComisaria = comi.idComisaria "+
		" left join Procurador proc on e.idProcurador = proc.idProcurador "+
		" left join UsuarioIntranet usu on proc.idUsuario = usu.idUsuario "+
        " where i.idInforme=?";
    var arrayParametros = [idInforme];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
        // busca los agraviados registrados por la central de emergencias
        var queryAgraviados = "Select a.codAgraviado, a.codEvento, p.idPersona, concat(p.nombres,' ',p.apellidoPaterno,' ', p.apellidoMaterno) as nombreAgraviado, p.nroDocumento as DNI, p.edad, p.telefonoMovil," +
            " a.diagnostico, a.idTipoAtencion as tipoAsistencia, a.idNosocomio, a.montoCartaGarantia, a.nombreAccidente, a.edadAccidente, a.dniAccidente, n.idNosocomio, n.tipo as tipoNosocomio, n.nombre as nombreNosocomio, n.idDistrito as distritoNosocomio from Agraviado a " +
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
				var registro = resultados[0];
				var dep_prov = registro.nombreDepartamento+" / "+registro.nombreProvincia;
				var distritoAccidente = registro.nombreDistroAccidente;
				var direccionAccidente = registro.lugarAccidente;
				var fechaAccidente = registro.fechaAccidente;
				var nombreComisaria = registro.nombreComisaria;
				var tipoAccidenteDesc = registro.tipoAccidenteDesc;
				var causalDesc = registro.causalDesc;
				var conductor = registro.nombreConductor;	
				var asociado = registro.nombreAsociado;
				if(registro.tipoPersona=='J'){
					asociado = registro.razonSocial;
				}
				var cat = registro.nroCAT;
				var vigencia = registro.fechaCaducidad;
				var nombrePropietario = registro.nombrePropietario;
				var licencia = registro.licenciaChofer;
				var clase = registro.claseChofer;
				var nombreProcurador = registro.nombreProcurador;
				var cualitativo = registro.horaExamenCualitativo;
				var cuantitativo = registro.horaExamenCuantitativo;
				var dosaje = registro.resultadoExamenEtilico;
				var inicio_invest = registro.fechaInicioInvestigacion;
				var fin_invest = registro.fechaFinInvestigacion;				
				var observaciones = registro.observaciones;
				
				var variables = [];	
				variables.push({'nombreVariable':'codEvento','value':req.query.codEvento});
				variables.push({'nombreVariable':'dep_prov','value':dep_prov});
				variables.push({'nombreVariable':'distrito','value':distritoAccidente});
				variables.push({'nombreVariable':'direccion','value':direccionAccidente});
				variables.push({'nombreVariable':'fecha_hora','value':fechaAccidente});
				variables.push({'nombreVariable':'comisaria','value':nombreComisaria});
				variables.push({'nombreVariable':'tipo_accidente','value':tipoAccidenteDesc});
				variables.push({'nombreVariable':'causal','value':causalDesc});
				variables.push({'nombreVariable':'conductor','value':conductor});
				variables.push({'nombreVariable':'asociado','value':asociado});
				variables.push({'nombreVariable':'CAT','value':cat});
				variables.push({'nombreVariable':'vigencia','value':vigencia});
				variables.push({'nombreVariable':'propietario','value':nombrePropietario});
				variables.push({'nombreVariable':'licencia','value':licencia});
				variables.push({'nombreVariable':'clase','value':clase});
				variables.push({'nombreVariable':'procurador','value':nombreProcurador});
				variables.push({'nombreVariable':'cualitativo','value':cualitativo});
				variables.push({'nombreVariable':'cuantitativo','value':cuantitativo});
				variables.push({'nombreVariable':'dosaje','value':dosaje});
				variables.push({'nombreVariable':'inicio_invest','value':inicio_invest});
				variables.push({'nombreVariable':'fin_invest','value':fin_invest});
				variables.push({'nombreVariable':'observaciones', 'value':observaciones})
				
				var listaCalificacion = JSON.parse(registro.preguntasCalificacion);
				for(var i=0; i<listaCalificacion.length; i++){
					var rpta = listaCalificacion[i].rpta;
					if(rpta=='S'){
						rpta='Si'
					}else{
						rpta='No'
					}
					variables.push({'nombreVariable':'rp'+(i+1),'value':rpta});
				}
				// grilla de Agraviados:
				var listaAgraviados = registro.listaAgraviados;
				var tablaAgraviados = '<table border="1" id="tabla_agraviados" width="100%" style="font-size:9px;">'+     
				   '<thead>'+      
					'  <tr style="color:white; background-color:#4485A6; font-size:10px; height:25px;">'+
						'<th>APELLIDOS Y NOMBRES</th>'+
						'<th>DNI</th>'+
						'<th>EDAD</th>'+
						'<th>DIAGNOSTICO</th>'+
						'<th>SALUD</th>'+
						'<th>C. GARANTIA</th>'+						
					'  </tr>'+
				   '</thead><tbody>';
				for(var i=0; i<listaAgraviados.length; i++){
					tablaAgraviados = tablaAgraviados+
						"<tr>"+
							"<td>"+listaAgraviados[i].nombreAgraviado+"</td>"+
							"<td>"+listaAgraviados[i].DNI+"</td>"+
							"<td>"+listaAgraviados[i].edad+"</td>"+
							"<td>"+listaAgraviados[i].diagnostico+"</td>"+
							"<td></td>"+
							"<td>S/. "+listaAgraviados[i].montoCartaGarantia+"</td>"+							
						"</tr>";
				}
				tablaAgraviados = tablaAgraviados+"</tbody></table>";
				
				variables.push({'nombreVariable':'tablaAgraviados','value':tablaAgraviados});
				
				var ruta_archivo = "./www/plantillas/informe_procurador.html";
				var fs = require('fs'); // requerida para leer archivos
				fs.readFile(ruta_archivo, (err, data) => {
					if (err){
						throw err;  
					}else{
						//console.log(data);  
						var htmlResponse = ""+data+"";
						var html = parseHTMLPDF(variables, htmlResponse);
						generatePDF(html, "", res, "110px");
					}	  
				});				
            });
        });
        
    });
}
function parseHTMLPDF(variables, htmlContenido){ // asigna los valores de las variables en el html
	for(var i=0; i<variables.length; i++){
		var regex = new RegExp('@'+variables[i].nombreVariable+'@', 'g');
		if(variables[i].value==null){
			variables[i].value='';
		}
		htmlContenido = htmlContenido.replace(regex, variables[i].value);
	}
	return htmlContenido;
}

exports.anularPDF = function(req, res, funcionName){ // CAMBIA EL ESTADO de la Carta de "Impreso" a "Nueva"
	var idCarta = req.query.idCarta;
	var query = "Update CartaGarantia set estado = 'N' where idCarta=? ";
	var parametros = [idCarta];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "affectedRows");
}

// FUNCIONES EXTRAS

/*exports.pasarCarta = function (req, res, funcionName){
	var ruta_archivo = "./www/files/cartas.csv";
	var fs = require('fs'); // requerida para leer archivos	
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:","});
	var campoNosocomio = "Nosocomio";	
	
	var tablaEstado = {
		"ANULADO":"A",
		"FACTURADO":"F",
		"CANCELADO":"C",
		"OBSERVADO":"O",
		"PENDIENTE":"P"
	};
	var tablaIdEtapa = {
		"SEPELIO": "5",
		"GASTOS MEDICOS": "1"
	}
	var tablaTipoAtencion = {
		"Ambulatoria":"1",
		"Diagnostico por Imagenes":"7",
		"Emergencia": "6",
		"Farmacia": "3",
		"Hospitalizacion":"5",
		"Intervencion Quirurgica":"2",
		"Terapia Fisica":"4",
		"":"0"
	}
	var si_no ={
		"SI":"S",
		"NO":"N"
	}
	var contador = 0;
	csvConverter.fromFile(ruta_archivo,function(err,result){
		console.log("llegue");
		//enviarResponse(res, result);
		for(var i=0; i<result.length; i++){
			result[i].idNosocomio = 0;
			result[i].idFuneraria = 0;
			//console.log("Nosocomio: "+result[i].Nosocomio+"");
			contador=contador+1;
			if((result[i].Nosocomio)+"".split("").length<3){ // verifica que sea una funeraria
				console.log('Es Funeraria');
				console.log("Nosocomio: "+result[i].Nosocomio+" "+contador);
				
				result[i].idEtapa = '5';
				result[i].idFuneraria = result[i][campoNosocomio];
				result[i].estado=tablaEstado[result[i].Estado_carta];
				result[i].idTipoAtencion = tablaTipoAtencion[result[i].Tipo_Atencion];
				result[i].fecha = dateTimeFormat(result[i].Fecha_Carta);
				result[i].esAmpliacion = si_no[result[i].Ampliacion];
				result[i].idEtapa = tablaIdEtapa[result[i].Etapa];
				registrarCarta(result[i], res);
			}else{ // Registrar el nosocomio
				console.log('Es Nosocomio');
				console.log("Nosocomio: "+result[i].Nosocomio+" "+contador);
				
				getIdNosocomio(result[i].Nosocomio, i, res, funcionName, function(data){
					console.log("consegui Nosocomio");
					var idNosocomio = data.idNosocomio;
					var i = data.index;
					result[i].idNosocomio = idNosocomio;
					result[i].estado=tablaEstado[result[i].Estado_carta];
					result[i].idTipoAtencion = tablaTipoAtencion[result[i].Tipo_Atencion];
					result[i].fecha = dateTimeFormat(result[i].Fecha_Carta);
					result[i].esAmpliacion = si_no[result[i].Ampliacion];				
					result[i].idEtapa = tablaIdEtapa[result[i].Etapa];
					registrarCarta(result[i], res);
				});	
			}					
		}
	});
}
function registrarCarta(re, resp){
	var queryInsertCarta = "Insert into CartaGarantia (estado, nroCarta, idEtapa, idTipoAtencion, fecha, idNosocomio, idFuneraria, esAmpliacion, nroCAT, codEvento, codAgraviado, diagnostico, monto, idAuditor, ultActualizaUsuario, codigoEnlace) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";	
	re.Monto_Carta=re.Monto_Carta+"";
	re.Monto_Carta=re.Monto_Carta.replace(",", "");
	re.Monto_Carta=re.Monto_Carta.replace(",", "");
	var parametros = [re.estado, re.Nro_carta, re.idEtapa, re.idTipoAtencion, re.fecha, re.idNosocomio, re.idFuneraria, re.esAmpliacion, re.Nro_Cat, re.Cod_Evento, re.Cod_Agraviado, re.Diagnostico1, re.Monto_Carta, re.Auditor, re.Usuario, re.id_carta_garantia];
	
	ejecutarQUERY_MYSQL(queryInsertCarta, parametros, resp, "registrarCarta", "false");
}*/

// FUNCIONES EXTRAS
var continuos = false;
var indiceGeneral;
exports.pasarCarta = function (req, res, funcionName){
	continuos=false;
	indiceGeneral=-1;
	
	var ruta_archivo = "./www/files/cartas.csv";
	var fs = require('fs'); // requerida para leer archivos	
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:","});
	csvConverter.fromFile(ruta_archivo,function(err,result){
		//enviarResponse(res, result);
		for(var i=0; i<result.length; i++){
			procesarCarta(i, result, res, funcionName);
		}
	});
}
function procesarCarta(i, result, res, funcionName){		
	if(i==0){
		var campoNosocomio = "Nosocomio";	
		var tablaEstado = {
			"ANULADO":"A",
			"FACTURADO":"F",
			"CANCELADO":"C",
			"OBSERVADO":"O",
			"PENDIENTE":"P"
		};
		var tablaIdEtapa = {
			"SEPELIO": "5",
			"GASTOS MEDICOS": "1"
		}
		var tablaTipoAtencion = {
			"Ambulatoria":"1",
			"Diagnostico por Imagenes":"7",
			"Emergencia": "6",
			"Farmacia": "3",
			"Hospitalizacion":"5",
			"Intervencion Quirurgica":"2",
			"Terapia Fisica":"4",
			"":"0"
		}
		var si_no ={
			"SI":"S",
			"NO":"N"
		}
		
		continuos=false;
		indiceGeneral = i;		
		result[i].idNosocomio = 0;
		result[i].idFuneraria = 0;
		//console.log("Nosocomio: "+result[i].Nosocomio+"");
		if((result[i].Nosocomio)+"".split("").length<3){ // verifica que sea una funeraria
			console.log('Es Funeraria');
			console.log("Nosocomio: "+result[i].Nosocomio+" "+i);
				
			result[i].idEtapa = '5';
			result[i].idFuneraria = result[i][campoNosocomio];
			result[i].estado=tablaEstado[result[i].Estado_carta];
			result[i].idTipoAtencion = tablaTipoAtencion[result[i].Tipo_Atencion];
			result[i].fecha = dateTimeFormat(result[i].Fecha_Carta);
			result[i].esAmpliacion = si_no[result[i].Ampliacion];
			result[i].idEtapa = tablaIdEtapa[result[i].Etapa];
			registrarCarta(result[i], res);
		}else{ // Registrar el nosocomio
			console.log('Es Nosocomio');
			console.log("Nosocomio: "+result[i].Nosocomio+" "+i);
				
			getIdNosocomio(result[i].Nosocomio, i, res, funcionName, function(data){
				console.log("consegui Nosocomio");
				var idNosocomio = data.idNosocomio;
				var i = data.index;
				result[i].idNosocomio = idNosocomio;
				result[i].estado=tablaEstado[result[i].Estado_carta];
				result[i].idTipoAtencion = tablaTipoAtencion[result[i].Tipo_Atencion];
				result[i].fecha = dateTimeFormat(result[i].Fecha_Carta);
				result[i].esAmpliacion = si_no[result[i].Ampliacion];				
				result[i].idEtapa = tablaIdEtapa[result[i].Etapa];
				registrarCarta(result[i], res);
			});	
		}
	}else{
		var timer = setInterval(function(){
			if(continuos==true && indiceGeneral+1==i){
				continuos=false;
				indiceGeneral = i;
				clearInterval(timer);
				
				var campoNosocomio = "Nosocomio";	
				var tablaEstado = {
					"ANULADO":"A",
					"FACTURADO":"F",
					"CANCELADO":"C",
					"OBSERVADO":"O",
					"PENDIENTE":"P"
				};
				var tablaIdEtapa = {
					"SEPELIO": "5",
					"GASTOS MEDICOS": "1"
				}
				var tablaTipoAtencion = {
					"Ambulatoria":"1",
					"Diagnostico por Imagenes":"7",
					"Emergencia": "6",
					"Farmacia": "3",
					"Hospitalizacion":"5",
					"Intervencion Quirurgica":"2",
					"Terapia Fisica":"4",
					"":"0"
				}
				var si_no ={
					"SI":"S",
					"NO":"N"
				}
				
				result[i].idNosocomio = 0;
				result[i].idFuneraria = 0;
				//console.log("Nosocomio: "+result[i].Nosocomio+"");
				if((result[i].Nosocomio)+"".split("").length<3){ // verifica que sea una funeraria
					console.log('Es Funeraria');
					console.log("Nosocomio: "+result[i].Nosocomio+" "+i);
						
					result[i].idEtapa = '5';
					result[i].idFuneraria = result[i][campoNosocomio];
					result[i].estado=tablaEstado[result[i].Estado_carta];
					result[i].idTipoAtencion = tablaTipoAtencion[result[i].Tipo_Atencion];
					result[i].fecha = dateTimeFormat(result[i].Fecha_Carta);
					result[i].esAmpliacion = si_no[result[i].Ampliacion];
					result[i].idEtapa = tablaIdEtapa[result[i].Etapa];
					registrarCarta(result[i], res);
				}else{ // Registrar el nosocomio
					console.log('Es Nosocomio');
					console.log("Nosocomio: "+result[i].Nosocomio+" "+i);
						
					getIdNosocomio(result[i].Nosocomio, i, res, funcionName, function(data){
						console.log("consegui Nosocomio");
						var idNosocomio = data.idNosocomio;
						var i = data.index;
						result[i].idNosocomio = idNosocomio;
						result[i].estado=tablaEstado[result[i].Estado_carta];
						result[i].idTipoAtencion = tablaTipoAtencion[result[i].Tipo_Atencion];
						result[i].fecha = dateTimeFormat(result[i].Fecha_Carta);
						result[i].esAmpliacion = si_no[result[i].Ampliacion];				
						result[i].idEtapa = tablaIdEtapa[result[i].Etapa];
						registrarCarta(result[i], res);
					});	
				}				
			}
		},100);
	}			
}
function registrarCarta(re, resp){
	var queryInsertCarta = "Insert into CartaGarantia (estado, nroCarta, idEtapa, idTipoAtencion, fecha, idNosocomio, idFuneraria, esAmpliacion, nroCAT, codEvento, codAgraviado, diagnostico, monto, idAuditor, ultActualizaUsuario, codigoEnlace) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";	
	re.Monto_Carta=re.Monto_Carta+"";
	re.Monto_Carta=re.Monto_Carta.replace(",", "");
	re.Monto_Carta=re.Monto_Carta.replace(",", "");
	var parametros = [re.estado, re.Nro_carta, re.idEtapa, re.idTipoAtencion, re.fecha, re.idNosocomio, re.idFuneraria, re.esAmpliacion, re.Nro_Cat, re.Cod_Evento, re.Cod_Agraviado, re.Diagnostico1, re.Monto_Carta, re.Auditor, re.Usuario, re.id_carta_garantia];
	
	ejecutarQUERY_MYSQL(queryInsertCarta, parametros, resp, "registrarCarta", function(){
		continuos=true;
	});
}

function dateTimeFormat(fecha){ // devuelve fecha en formato YYYY-dd-mm hh:mm:ss (solo se acepta fechas con el formato dd/mm/YYYY HH:mm:ss)
    try{
        if(fecha!=""){
            var partir_fecha=fecha.split(" ");
            var soloFecha=partir_fecha[0].split("/");
            var fechaConvertida=soloFecha[2]+"-"+soloFecha[1]+"-"+soloFecha[0];
            if(partir_fecha.length>1){ // esta fecha tiene asignada hora
                fechaConvertida=fechaConvertida+" "+partir_fecha[1];
            }
            return fechaConvertida;
        }else{
            return fecha;
        }

    }catch(err){
        emitirErrorCatch(err, "dateTimeFormat");
    }
}
function getIdNosocomio(nombreNosocomio, index, res, funcionName, callback){
	var query = "Select idNosocomio from Nosocomio where nombre like '%"+nombreNosocomio+"%' limit 1";
	ejecutarQUERY_MYSQL_Extra(index, query, [], res, funcionName, function(res, resultados, indexArray){
		var idNosocomio = 0;
		if(resultados.length>0){
			idNosocomio = resultados[0].idNosocomio;
			callback({
				idNosocomio:idNosocomio, 
				index:index
			});
		}else{
			// Inserta el Nosocomio:
			var queryInsertNosocomio = "Insert into Nosocomio (nombre) values (?)";
			ejecutarQUERY_MYSQL_Extra(indexArray, queryInsertNosocomio, [nombreNosocomio], res, funcionName, function(res2, resultados2, indexArray2){
				var idNosocomio = 0;
				if(resultados2.affectedRows>0){
					idNosocomio = resultados2.insertId;
				}
				callback({
					idNosocomio:idNosocomio, 
					index:index
				});
			})
		}		
	})
}
exports.pasarOrdenes = function(req, res, funcionName){
	var ruta_archivo = "./www/files/ordenes.csv";
	var fs = require('fs'); // requerida para leer archivos
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:","});
	
	var tablaIdEtapa = {
		"SEPELIO": "5",
		"GASTOS MEDICOS": "1",
		"INCAPACIDAD PERMANENTE":"3",
		"INCAPACIDAD TEMPORAL":"2",
		"MUERTE": "4"
	}
	var tablaTipoAtencion = {
		"Ambulatoria":"1",
		"Diagnostico por Imagenes":"7",
		"Emergencia": "6",
		"Farmacia": "3",
		"Hospitalizacion":"5",
		"Intervencion Quirurgica":"2",
		"Terapia Fisica":"4",
		"":"0"
	}
	
	var idTipoDocumento = {
		"BOL":"1",
		"DEC":"2",
		"FAC":"3",
		"NCR":"4",
		"NDE":"5",
		"REC":"6",
		"TCK":"7",
		"HPR":"8",
		"RAR":"9",
		"RSP":"10",
		"AEM":"11",
		"OPA":"12",
		"CEF":"13"
	}
	var estado = {
		"ANULADO":"A", 
		"INGRESADO":"I", 
		"APROBADO":"B", 
		"ESPECIAL":"E", 
		"PAGADO":"P"		
	}
	csvConverter.fromFile(ruta_archivo,function(err,result){
		for(var i=0; i<result.length; i++){
			getIdProveedor(result[i].Nosocomio,i, res, funcionName, function(data){
				var index = data.index;
				result[index].fecha = dateTimeFormat(result[index].Fecha_Factura);
				result[index].idProveedor = data.idProveedor;
				result[index].idEtapa = tablaIdEtapa[result[index].Tipo_Gasto];
				result[index].idTipoDocumento = idTipoDocumento[result[index].cod_TES_tipodocumento];
				result[index].monto = result[index].Monto_Factura.split("S/. ")[1];
				result[index].monto = result[index].monto.replace(",","");
				console.log("ESTADO : "+result[index].descript_estado);
				result[index].estado = estado[result[index].descript_estado];
				console.log("NUEVO ESTADO : "+result[index].estado)
				registrarOrden(result[index], res);
			});
		}
	});
}
function registrarOrden(res, resp){
	var idUsuario = "121" // Id Usuario de Vilma
	var queryInsert = "Insert into OrdenPago(estado, fecha, idProveedor, idTipoDocumento, nroDocumento, monto, idEtapa, codAgraviado, codEvento, ultActualizaUsuario, ultActualizaFecha) values (?,?,?,?,?,?,?,?,?,?, now())";
	res.monto = res.monto+"";
	res.monto = res.monto.replace(",", "");
	res.monto = res.monto.replace(",", "");
	var parametros = [res.estado, res.fecha, res.idProveedor, res.idTipoDocumento, res.Nro_Documento_Factura_Ipress, res.monto, res.idEtapa, res.Cod_Agraviado, res.Cod_Evento, idUsuario];
	
	ejecutarQUERY_MYSQL(queryInsert, parametros, resp, "registrarOrden", "false");
}
exports.pasarFactura = function(req, res, funcionName){
	var ruta_archivo = "./www/files/facturas.csv";
	var fs = require('fs'); // requerida para leer archivos
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:","});
	
	var tablaIdEtapa = {
		"SEPELIO": "5",
		"GASTOS MEDICOS": "1",
		"INCAPACIDAD PERMANENTE":"3"
	}
	var tablaTipoAtencion = {
		"Ambulatoria":"1",
		"Diagnostico por Imagenes":"7",
		"Emergencia": "6",
		"Farmacia": "3",
		"Hospitalizacion":"5",
		"Intervencion Quirurgica":"2",
		"Terapia Fisica":"4",
		"":"0"
	}
	
	var idTipoDocumento = {
		"BOL":"1",
		"DEC":"2",
		"FAC":"3",
		"NCR":"4",
		"NDE":"5",
		"REC":"6",
		"TCK":"7",
		"HPR":"8",
		"RAR":"9",
		"RSP":"10",
		"AEM":"11",
		"OPA":"12",
		"CEF":"13"
	}
	
	csvConverter.fromFile(ruta_archivo,function(err,result){
		for(var i=0; i<result.length; i++){
			getIdProveedor(result[i].Nosocomio,i, res, funcionName, function(data){
				var index = data.index;
				result[index].fecha = dateTimeFormat(result[index].Fecha_Factura);
				result[index].idProveedor = data.idProveedor;
				result[index].idEtapa = tablaIdEtapa[result[index].Tipo_Gasto];
				result[index].idTipoDocumento = idTipoDocumento[result[index].cod_TES_tipodocumento];
				result[index].monto = result[index].Monto_Factura.split("S/. ")[1];
				result[index].monto = result[index].monto+"";
				result[index].monto = result[index].monto.replace(",","");
				result[index].monto = result[index].monto.replace(",","");
				registrarFactura(result[index], res)
			});			
		}
	});
}
function registrarFactura(re, resp){
	var queryInsert = "Insert into Gasto(fechaDoc, idProveedor, idTipoDocumento, nroDocumento, monto, idEtapa, codAgraviado, codEvento, codigoEnlace) values (?,?,?,?,?,?,?,?,?)";
	var arrayParametros = [re.fecha, re.idProveedor, re.idTipoDocumento, re.Nro_Documento_Factura_Ipress, re.monto, re.idEtapa, re.Cod_Agraviado, re.evento, re.id_carta_garantia];
	
	ejecutarQUERY_MYSQL(queryInsert, arrayParametros, resp, "registrarFacturas", "false"); 
}
function getIdProveedor(nombreProveedor, index, res, funcionName, callback){
	var query = "Select pr.idProveedor from Proveedor pr inner join Persona p on pr.idPersona = p.idPersona where concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '"+nombreProveedor+"%' or p.razonSocial like '"+nombreProveedor+"%'";
	var parametros = []
	ejecutarQUERY_MYSQL_Extra(index, query, parametros, res, funcionName, function(res, resultados, indexArray){
		var idProveedor = 0;
		if(resultados.length>0){
			idProveedor = resultados[0].idProveedor;
		}
		callback({
			idProveedor:idProveedor,
			index:indexArray
		});
	})
}
exports.registrarProveedores = function(req, res, funcionName){
	var ruta_archivo = "./www/files/Proveedor.csv";
	var fs = require('fs'); // requerida para leer archivos
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:","});
	
	csvConverter.fromFile(ruta_archivo,function(err,result){
		for(var i=0; i<result.length; i++){
			getIdPersonaProveedor(result[i].Proveedor, i, res, funcionName, function(data){
				var idProveedor = data.idProveedor;
				if(idProveedor>0){ // ya existe el proveedor
					
				}else{ // No existe proveedor; se registra el proveedor;
					var queryInsert = "Insert into Proveedor(idPersona) values (?)";
					var arrayParametros = [data.idPersona];
					ejecutarQUERY_MYSQL(queryInsert, arrayParametros, res, funcionName, "false");// registra el Proveedor
				}
			});
		}
		
	});
}
function getIdPersonaProveedor(nombreProveedor, index, res, funcionName, callback){
	var query = "Select p.idPersona, pr.idProveedor from Persona p left join Proveedor pr on p.idPersona = pr.idPersona where concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '"+nombreProveedor+"%' or p.razonSocial like '"+nombreProveedor+"%'";
	
	var parametros = [];
	
	ejecutarQUERY_MYSQL_Extra(index, query, parametros, res, funcionName, function(res, resultados, indexArray){
		if(resultados.length==0){ // No existe registro de Persona
			var queryPersona = "Insert into Persona(tipoPersona, razonSocial) values (?,?)";
			var arrayParametros = ['J', nombreProveedor];
			ejecutarQUERY_MYSQL_Extra(indexArray, queryPersona, arrayParametros, res, funcionName, function(res, resultados, indexArray2){
				callback({
					idProveedor:0,
					idPersona: resultados.insertId,
					index:indexArray2
				});
			});
		}else{ // Existe registro de la persona			
			callback({
				idProveedor:resultados[0].idProveedor,
				idPersona: resultados[0].idPersona,
				index:index
			});
		}
	})
}
exports.promotorexconsecionarios = function(req, res, funcionName){
	var queryDistritos = "Select idDistrito, nombre from Distrito";
	ejecutarQUERY_MYSQL(queryDistritos, [], res, funcionName, function(res, results){
		var distritos = results;
		var ruta_archivo = "./www/files/concesionarios.csv";
		var fs = require('fs'); // requerida para leer archivos		
		//Converter Class
		var Converter = require("csvtojson").Converter;
		//new converter instance
		var csvConverter=new Converter({delimiter:","});	
		csvConverter.fromFile(ruta_archivo,function(err,result){
			console.log("llegue");
			//enviarResponse(res, result);
			for(var i=0; i<result.length; i++){
				var concesionario = result[i].Concesionario;
				var visita = result[i].DiaVisita;
				var idPromotor = result[i].Promotor;
				var idCono = result[i].Cono;
				var idDistrito = "";
				for(z=0; z<distritos.length; z++){
					if(distritos[z].nombre.toUpperCase().trim()== result[i].Distrito.toUpperCase().trim()){
						idDistrito = distritos[z].idDistrito;
						break;
					}
				}
				
				// busca el id del concesionario
				var query="Select idConcesionario from Concesionario where ( razonSocial = ? or concat(nombres,' ',apellidos) = ? ) and idSede=?";
				ejecutarQUERY_MYSQL_Extra([visita, idPromotor, idDistrito], query, [concesionario, concesionario, idCono], res, funcionName, function(res, resultados, datosAnt){
					if(resultados.length>0){
						var idConcesionario = resultados[0].idConcesionario;
						var dia = datosAnt[0];
						var promot = datosAnt[1];
						var idDistrito = datosAnt[2];
						console.log("id Distrito : "+idDistrito);
						var queryUpdate = "Update Concesionario set idPromotor=?, diaSemanaAtt=?, idDistrito = ? where idConcesionario=?";
						ejecutarQUERY_MYSQL(queryUpdate, [promot, dia, idDistrito, idConcesionario], res, funcionName, "false");
					}
				})			
			}
		});
	});	
}