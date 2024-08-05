/* ***** funciones que se importan del modulo global *** */
var modulo_global = require("../global/global");
var console_log = modulo_global.console_log;
var key = modulo_global.key;
var finalizarControl = modulo_global.finalizarControl;
var enviarResponse = modulo_global.enviarResponse;
var emitirError = modulo_global.emitirError;
var ExecuteSelectPROCEDUREsinParametros = modulo_global.ExecuteSelectPROCEDUREsinParametros;
var ejecutarQUERY_MYSQL = modulo_global.ejecutarQUERY_MYSQL;
var ejecutarQUERY_MYSQL_Extra = modulo_global.ejecutarQUERY_MYSQL_Extra;
var escribirLog = modulo_global.escribirLog;
var agregarCEROaLaIzquierda = modulo_global.agregarCEROaLaIzquierda;
var convertirAfechaString = modulo_global.convertirAfechaString;
var enviarCorreoNotificacion = modulo_global.enviarCorreoNotificacion;
var verificaAsociadoExiste = modulo_global.verificaAsociadoExiste;
var insertarPersonaAsociado = modulo_global.insertarPersonaAsociado;
var insertarAsociado = modulo_global.insertarAsociado;
var insertarCAT = modulo_global.insertarCAT;
var insertarPersonaChofer = modulo_global.insertarPersonaChofer;
var insertarChofer = modulo_global.insertarChofer;
var verificarProcurador = modulo_global.verificarProcurador;
var insertarPersonaProcurador = modulo_global.insertarPersonaProcurador;
var insertarProcurador = modulo_global.insertarProcurador;
var insertarEventoInforme = modulo_global.insertarEventoInforme;
var insertarAgraviados = modulo_global.insertarAgraviados;
var number_format = modulo_global.number_format;
var executePDF = modulo_global.executePDF;
var generatePDF = modulo_global.generatePDF;
var agregarLimit = modulo_global.agregarLimit;
/*  var = modulo_global.;
    var = modulo_global.;
    var = modulo_global.;
	var = modulo_global.;
	var = modulo_global.;
	var = modulo_global.;
	var = modulo_global.;
	var = modulo_global.;
	var = modulo_global.;*/
/* ***************************************************** */

var CryptoJS = require("crypto-js"); // Moment
var fs = require('fs'); // requerida para leer archivos
var pool = require('./connection').pool; //recupera el pool de conexiones
var urldominio="https://autoseguro.in/";


/*
DOCUMENTACION DE getEventosGeneralesMantenimiento:

DESCRIPCION: 
Obtiene informacion de los eventos filtrandolos por su:
 - ESTADO ("P"=Pendiente, "N"=Notificado, "T"=Terminado, "C"=Condonado)  
 - CLASIFICACION ("S"=Recupero, "N" = No Recupero)
 
MODULOS QUE LO UTILIZAN:
 - MODULO RECUPERO (Mantenimiento de Eventos)
*/
exports.getEventosGeneralesMantenimiento = function(req, res, funcionName){
	var startTime = new Date();
	var estado=req.query.estado;
	var esRecupero=req.query.esRecupero;
	var codEvento=req.query.codEvento;
	var nroCAT=req.query.nroCAT;
	var placa=req.query.placa;
	var fechaDesde=req.query.fechaDesde;
	var fechaHasta=req.query.fechaHasta;
	var orderBy="e.codEvento";
	var queryWhere="";
	if(codEvento!=""){
		if(queryWhere!=""){
			queryWhere=queryWhere+" and ";
		}
		queryWhere=queryWhere+"e.codEvento like '"+codEvento+"%'";		
	}
	if(nroCAT!=""){
		if(queryWhere!=""){
			queryWhere=queryWhere+" and ";
		}
		queryWhere=queryWhere+"e.nroCAT like '"+nroCAT+"%'";
	}
	if(placa!=""){
		if(queryWhere!=""){
			queryWhere=queryWhere+" and ";
		}
		queryWhere=queryWhere+"c.placa like '"+placa+"%'";
	}
	if(esRecupero!=""){
		if(queryWhere!=""){
			queryWhere=queryWhere+" and ";
		}
		queryWhere=queryWhere+"esrecupero='"+esRecupero+"'";
		if(estado!=""){
			queryWhere=queryWhere+" and (e.estado='"+estado+"' or e.condonado='"+estado+"')";
		}		
	}
	if(fechaDesde!="" || fechaHasta!=""){
		orderBy="e.fechaAccidente";
		if(queryWhere!=""){
			queryWhere=queryWhere+" and ";
		}
		if(fechaDesde!="" && fechaHasta!=""){
			fechaHasta=fechaHasta+" 23:59:59";
			queryWhere=queryWhere+"( e.fechaAccidente between '"+fechaDesde+"' and '"+fechaHasta+"' )";
		}else{
			if(fechaDesde!=""){
				queryWhere=queryWhere+"e.fechaAccidente>='"+fechaDesde+"'";
			}
			if(fechaHasta!=""){
				fechaHasta=fechaHasta+" 23:59:59";
				queryWhere=queryWhere+"e.fechaAccidente<='"+fechaHasta+"'";
			}
		}
	}
	var page = req.query.page;
	var registrosxpagina = req.query.registrosxpagina;
	var cantPaginas = req.query.cantPaginas;
	/* @sp_getEventosByEstado : Obtiene los Eventos por 2 filtros:
		1) estado Gestion: Pend., Notif, En Cobranza, Condonado, Terminado 
		2) Tipo Estado : RECUPERO / NO RECUPERO
	*/
	//var query="call sp_getEventosByEstado(?,?)";
	var query = "SELECT e.codEvento as numcentral, e.idDistrito, pr.idProvincia, dep.idDepartamento,  e.nombreContacto, e.telefonoContacto, c.placa, e.nroCAT as cat, date_format (e.fechaAccidente, '%Y-%m-%d %T.%f') as fechaevento, ap.razonSocial, ap.tipoPersona as tipoPersonaAsociado, ap.nroDocumento as nroDocAsociado , ap.nombres as nombreAsociado, ap.apellidoPaterno as apePatAsociado, ap.apellidoMaterno as apeMatAsociado,"+ 
		"cp.nombres as nombreChofer, cp.apellidoPaterno as apePatChofer, cp.apellidoMaterno as apeMatChofer, "+
		"e.lugarAccidente as lugarsiniestro, i.idInforme, i.causal1, i.causal2, i.comisaria, i.codigoDenuncia, i.distritoComisaria, e.estado, e.esrecupero from Evento e "+ 
		"inner join Cat c on e.nroCAT=c.nroCAT "+
		"inner join Asociado a on c.idAsociado=a.idAsociado "+
		"inner join Persona ap on a.idPersona=ap.idPersona "+
		"left join Chofer ch on e.idChofer=ch.idChofer "+
		"left join Persona cp on ch.idPersona = cp.idPersona "+
		"left join Distrito d on e.idDistrito=d.idDistrito "+
		"left join Provincia pr on d.idProvincia=pr.idProvincia "+
		"left join Departamento dep on pr.idDepartamento=dep.idDepartamento "+
		"inner join Informe i on e.codEvento = i.codEvento where "+queryWhere+" order by "+orderBy+" desc";
	query = agregarLimit(page, registrosxpagina, query);
	var arrayParametros=[];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
		if(resultados.length>0){
			if(orderBy=='e.fechaAccidente'){
				orderBy=1;
			}else{
				orderBy=0;
			}
			resultados[0].orderBy=orderBy;
		}
		if(cantPaginas==0){
			var queryCantidad = "SELECT count(*) as cantidad from Evento e "+ 
				"inner join Cat c on e.nroCAT=c.nroCAT "+
				"inner join Asociado a on c.idAsociado=a.idAsociado "+
				"inner join Persona ap on a.idPersona=ap.idPersona "+
				"left join Chofer ch on e.idChofer=ch.idChofer "+
				"left join Persona cp on ch.idPersona = cp.idPersona "+
				"left join Distrito d on e.idDistrito=d.idDistrito "+
				"left join Provincia pr on d.idProvincia=pr.idProvincia "+
				"left join Departamento dep on pr.idDepartamento=dep.idDepartamento "+
				"inner join Informe i on e.codEvento = i.codEvento where "+queryWhere;				
			var arrayParametrosCantidad=[estado, estado, esRecupero];
			ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, arrayParametrosCantidad, res, funcionName, function(res, rows, resultados){
				var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
				if(resultados.length>0){
					resultados[0].numeroPaginas = cantidadPag;					
				}
				finalizarControl(startTime, "MODULO RECUPERO ENCONTRO: "+resultados.length+" eventos");
				enviarResponse(res, resultados);
			})
		}else{
			finalizarControl(startTime, "MODULO RECUPERO ENCONTRO: "+resultados.length+" eventos");
			enviarResponse(res, resultados);
		}			
	});	
}
/*
DOCUMENTACION DE getCausales:

DESCRIPCION: 
Obtiene y retorna los registros de las causales de un accidente.

MODULOS QUE LO UTILIZAN:
- MODULO RECUPERO (Mantenimiento de Eventos(Editar datos del accidente))

*/
exports.getCausales = function(req, res, funcionName){
	ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllCausales");
}
/*
DOCUMENTACION DE getAllDistritos

DESCRIPCION: 
Obtiene los registros de los distritos

MODULOS QUE LO UTILIZAN:
 - MODULO RECUPERO (Mantenimiento de Eventos, Conciliaciones)

*/
exports.getAllDistritos = function(req, res, funcionName){
	ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllDistritos");
}
/*
getAllProvincias

DESCRIPCION: 
Obtiene los registros de las provincias

MODULOS QUE LO UTILIZAN:
 - MODULO RECUPERO (Mantenimiento de Eventos, Conciliaciones)

*/
exports.getAllProvincias = function(req, res, funcionName){
	ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllProvincias");
}

/*
getAllProvincias

DESCRIPCION: 
Obtiene los registros de los departamentos

MODULOS QUE LO UTILIZAN:
 - MODULO RECUPERO (Mantenimiento de Eventos, Conciliaciones)

*/
exports.getAllDepartamentos = function(req, res, funcionName){
	ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllDepartamentos");
}

/*@getPersonaByNroDoc: Obtiene el registro de una persona por su NRO DE DOC.
*/
exports.getPersonaByNroDoc = function(req, res, funcionName){
	var nroDoc = req.query.nroDoc;
	var query="call sp_getPersonaByNroDoc(?)";
	var arrayParametros = [nroDoc];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

/* @actualizarDatosAccidente: Actualiza los datos del accidente.
	RETORNA: la cantidad de filas afectadas
*/
exports.actualizarDatosAccidente = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var fecha = req.query.fecha;
	var lugar = req.query.lugar;
	var nombreContacto = req.query.nombreContacto;
	var telfContacto = req.query.telfContacto;
	var comisaria = req.query.comisaria;
	var idDistrito = req.query.idDistrito;
	var idCausal1 = req.query.idCausal1;
	var idCausal2 = req.query.idCausal2;
	var NroDenuncia = req.query.NroDenuncia;
	var query = "call sp_actualizarDatosAccidente(?,?,?,?,?,?,?,?,?,?,@)";
	var arrayParametros = [codEvento, fecha, lugar, nombreContacto, telfContacto, idDistrito, comisaria, idCausal1, idCausal2, NroDenuncia];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas); 
	});
}
/*
getActoresXcodEvento

DESCRIPCION: 
Obtiene la información de los responsables de accidente (ASOCIADO, PROPIETARIO, CHOFER) filtrandolos por EL CODIGO DEL EVENTO.

MODULOS QUE LO UTILIZAN:
 - MODULO RECUPERO 

*/
exports.getActoresXcodEvento = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var query = "call sp_getActoresXcodEvento(?)";
	var arrayParametros = [codEvento];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
/*
DOCUMENTACION DE guardarDatosActores:

DESCRIPCION: 

Actualiza la informacion de los responsables de un accidente.
Son 3 los responsables con sus claves foraneas idAsociado, idPropietario e idChofer.
Se recibe por cada responsable un idPersona (idPersonaAsociado, idPersonaPropietario e idPersonaChofer)
los cuales podria repetirse cuando son las misma persona. 
si el valor del idPersona de un responsable es 0, SE ENTIENDE QUE SE VA REGISTRAR UNA NUEVA PERSONA (EL RESPONSABLE ES DIFERENTE A LOS DEMAS)
QUE DESPUES SERA RELACIONADA AL RESPONSABLE.

MODULOS QUE LO UTILIZAN:
- Modulo Recupero

*/
exports.guardarDatosActores = function(req, res, funcionName){ // LISTO
	var startTime = new Date();
	var responseGeneral = res;
	// DATOS DEL ASOCIADO
	var idAsociado = req.query.idAsociado;
	var idPersonaAsociado = req.query.idPersonaAsociado;
	var calleAsociado = req.query.calleAsociado;
	var nroAsociado = req.query.nroAsociado;
	var loteAsociado = req.query.loteAsociado;
	var sectorAsociado = req.query.sectorAsociado;
	var referenciaAsociado = req.query.referenciaAsociado;
	var idDistritoAsociado = req.query.idDistritoAsociado;
	var telfijoAsociado = req.query.telfijoAsociado;
	var telmovilAsociado = req.query.telmovilAsociado;
	var queryActualizaAsociado = "call sp_actualizarAsociado(?,?,?,?,?,?,?,?,?)";
	var arrayParametrosAsociado = [idPersonaAsociado, calleAsociado, nroAsociado, 
        loteAsociado, sectorAsociado, referenciaAsociado, idDistritoAsociado, 
        telfijoAsociado, telmovilAsociado];
	ejecutarQUERY_MYSQL(queryActualizaAsociado, arrayParametrosAsociado, res, funcionName, "false");
	
	// DATOS DEL PROPIETARIO
	var idPropietario = req.query.idPropietario;
	var idPersonaPropietario = req.query.idPersonaPropietario;
	var nombrePropietario = req.query.nombrePropietario;
	var apePatPropietario = req.query.apePatPropietario;
	var apeMatPropietario = req.query.apeMatPropietario;
	var nroDocPropietario = req.query.nroDocPropietario;
	var razonSocialPropietario = req.query.razonSocialPropietario;
	var tipoPropietario = req.query.tipoPropietario;
	var fecNacPropietario = req.query.fecNacPropietario;
	var telfijoPropietario = req.query.telfijoPropietario;
	var telmovilPropietario = req.query.telmovilPropietario;
	var callePropietario = req.query.callePropietario;
	var nroPropietario = req.query.nroPropietario;
	var lotePropietario = req.query.lotePropietario;
	var sectorPropietario = req.query.sectorPropietario;
	var referenciaPropietario = req.query.referenciaPropietario;
	var idDistritoPropietario = req.query.idDistritoPropietario;
	var queryAboutPropietario = "";
	var arrayParametrosPropietario =[];
	
	// DATOS DEL CHOFER
	var idChofer = req.query.idChofer;
	var idPersonaChofer = req.query.idPersonaChofer;
	var nombreChofer = req.query.nombreChofer;
	var apePatChofer = req.query.apePatChofer;
	var apeMatChofer = req.query.apeMatChofer;
	var nroDocChofer = req.query.nroDocChofer;
	var fecNacChofer = req.query.fecNacChofer;
	var telfijoChofer = req.query.telfijoChofer;
	var telmovilChofer = req.query.telmovilChofer;
	var calleChofer = req.query.calleChofer;
	var nroChofer = req.query.nroChofer;
	var loteChofer = req.query.loteChofer;
	var sectorChofer = req.query.sectorChofer;
	var referenciaChofer = req.query.referenciaChofer;
	var claseChofer = req.query.claseChofer;
	var licenciaChofer = req.query.licenciaChofer;
	var idDistritoChofer = req.query.idDistritoChofer;
	
	var codEvento = req.query.codEvento;
	console_log("idPersona Propietario: "+idPersonaPropietario);
	if(idPersonaPropietario>0){ // ya existe la persona
	console_log("idPersonaAsociado: "+idPersonaAsociado);
		if(idPersonaPropietario!=idPersonaAsociado){ // si es diferente al asociado actualizara los datos de la persona
			// ACTUALIZA DATOS DEL PROPIETARIO
			queryAboutPropietario = "update Persona set nombres=?, apellidoPaterno=?, apellidoMaterno=?, razonSocial=?,"+ 
                "nroDocumento=?, tipoPersona=?, fechaNacimiento=?, idDistrito=?, calle=?, nro=? , mzLote=?,"+
                "sector=?, referencia=?, telefonoFijo=?, telefonoMovil=? where idPersona=?";
			arrayParametrosPropietario = [nombrePropietario, apePatPropietario,
			apeMatPropietario, razonSocialPropietario, nroDocPropietario, tipoPropietario, fecNacPropietario, idDistritoPropietario, 
			callePropietario, nroPropietario, lotePropietario, sectorPropietario, referenciaPropietario, telfijoPropietario,
			telmovilPropietario, idPersonaPropietario];
		}
	}else{ // se debe insertar una persona
		queryAboutPropietario = "insert INTO Persona (nombres, apellidoPaterno, apellidoMaterno, tipoPersona, razonSocial, nroDocumento, fechaNacimiento, idDistrito, "+
			"telefonoFijo, telefonoMovil,  calle, nro, mzLote, sector, referencia, fechaRegistro) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)";
		arrayParametrosPropietario = [nombrePropietario, apePatPropietario,	apeMatPropietario, tipoPropietario, razonSocialPropietario, nroDocPropietario, fecNacPropietario, idDistritoPropietario, 
		telfijoPropietario, telmovilPropietario, callePropietario, nroPropietario, lotePropietario, sectorPropietario, referenciaPropietario];
	}
	if(queryAboutPropietario!=""){
		ejecutarQUERY_MYSQL(queryAboutPropietario, arrayParametrosPropietario, res, funcionName, function(res, resultados) {
		    if(idPersonaPropietario==0){
		    	console_log("propietario insertado: "+resultados.insertId)
		    	idPersonaPropietario=resultados.insertId;
		    }
		    var queryExistePropietario = "";
		    var arrayExistePropietario = [];
		    if(idPropietario>0){
		    	// actualiza propietario
		    	queryExistePropietario = "Update Propietario set idPersona=? where idPropietario=?";
		    	arrayExistePropietario = [idPersonaPropietario, idPropietario];
		    }else{
		    	// inserta propietario
		    	queryExistePropietario = "Insert into Propietario (idPersona) values (?)";
		    	arrayExistePropietario = [idPersonaPropietario];
		    }
		    ejecutarQUERY_MYSQL(queryExistePropietario, arrayExistePropietario, res, funcionName, function(res, resultados2){
			   	var queryExisteChoferPersona = "";
			   	var arrayExisteChoferPersona = [];
			   	if(idPropietario==0){
			   		idPropietario = resultados2.insertId;
			   	}
			   	if(idPersonaChofer>0){
			   		if(idPersonaChofer!=idPersonaAsociado && idPersonaChofer!=idPersonaPropietario){
			    		queryExisteChoferPersona="update Persona set nombres=?, apellidoPaterno=?, apellidoMaterno=?, nroDocumento=?, fechaNacimiento=?, idDistrito=?, calle=?, "+
			              	"nro=?, mzLote=?, sector=?, referencia=?, telefonoFijo=?, telefonoMovil=? where idPersona=?";
			             arrayExisteChoferPersona = [nombreChofer, apePatChofer, apeMatChofer, nroDocChofer, fecNacChofer, idDistritoChofer, calleChofer, 
			              	nroChofer, loteChofer, sectorChofer, referenciaChofer, telfijoChofer, telmovilChofer, idPersonaChofer];
			    	}
			   	} else{
			   		queryExisteChoferPersona="insert INTO Persona (nombres, apellidoPaterno, apellidoMaterno, tipoPersona, nroDocumento, fechaNacimiento, idDistrito, telefonoFijo, "+
			   			" telefonoMovil,  calle, nro, mzLote, sector, referencia, fechaRegistro) values (?,?,?,'N',?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP )";
			   		arrayExisteChoferPersona=[nombreChofer, apePatChofer, apeMatChofer, nroDocChofer,fecNacChofer,idDistritoChofer, telfijoChofer, telmovilChofer, calleChofer, nroChofer,
			   		loteChofer, sectorChofer, referenciaChofer];
			   	}
			   	if(queryExisteChoferPersona!=""){ 
			   		ejecutarQUERY_MYSQL(queryExisteChoferPersona, arrayExisteChoferPersona, res, funcionName, function(res, resultados3){
				   		if(idPersonaChofer==0){
				   			idPersonaChofer = resultados3.insertId;
				   			console_log("PERSONA CHOFER INSERTADO: "+idPersonaChofer);
				   		}
				   		var queryExisteChofer="";
				   		var arrayExisteChofer=[];
				   		if(idChofer>0){
				   			queryExisteChofer="update Chofer set idPersona=?, licenciaChofer=?, claseChofer=? where idChofer=?";
				   			arrayExisteChofer=[idPersonaChofer, licenciaChofer, claseChofer, idChofer];
				   		}else{
				   			queryExisteChofer="Insert into Chofer(idPersona, licenciaChofer, claseChofer) values (?,?,?)";
				   			arrayExisteChofer=[idPersonaChofer, licenciaChofer, claseChofer];
				   		}
				   		ejecutarQUERY_MYSQL(queryExisteChofer, arrayExisteChofer, res, funcionName, function(res, resultados4){
				   			if(idChofer==0){
				   				idChofer = resultados4.insertId;
				   			}
				   			console_log("update informe evento");
				   			// Actualiza tablas informe y evento:
				   			var queryUpdateInformeEvento="Call sp_updateInformeEvento(?,?,?)";
				   			var arrayUpdateInformeEvento=[idPropietario, idChofer, codEvento];
				   			ejecutarQUERY_MYSQL(queryUpdateInformeEvento, arrayUpdateInformeEvento, res, funcionName, function(res, resultados5){
				   				var insertado = [resultados5[0].insertado]
				   				console_log("insertado: "+resultados5[0].insertado)
				   				finalizarControl(startTime, "Se actualizaron los responsables del accidente");
				   				enviarResponse(responseGeneral, insertado); 				
				   			});
				   		});
				   	});	
			   	}else{
			   		var queryExisteChofer="";
				   	var arrayExisteChofer=[];
				   	if(idChofer>0){
				   		queryExisteChofer="update Chofer set idPersona=?, licenciaChofer=?, claseChofer=? where idChofer=?";
				   		arrayExisteChofer=[idPersonaChofer, licenciaChofer, claseChofer, idChofer];
				   	}else{
				   		queryExisteChofer="Insert into Chofer(idPersona, licenciaChofer, claseChofer) values (?,?,?)";
				   		arrayExisteChofer=[idPersonaChofer, licenciaChofer, claseChofer];
				   	}
				   	ejecutarQUERY_MYSQL(queryExisteChofer, arrayExisteChofer, res, funcionName, function(res, resultados4){
				   		if(idChofer==0){
				   			idChofer = resultados4.insertId;
				   		}
				   		console_log("update informe evento");
				   		// Actualiza tablas informe y evento:
				   		var queryUpdateInformeEvento="Call sp_updateInformeEvento(?,?,?)";
				   		var arrayUpdateInformeEvento=[idPropietario, idChofer, codEvento];
				   		ejecutarQUERY_MYSQL(queryUpdateInformeEvento, arrayUpdateInformeEvento, res, funcionName, function(res, resultados5){
				   			var insertado = [resultados5[0].insertado]
				   			console_log("insertado: "+resultados5[0].insertado)
				   			finalizarControl(startTime, "Se actualizaron los responsables del accidente");
				   			enviarResponse(responseGeneral, insertado); 				
				   		});
				   	});
			   	}
		    });
		});
	}else{
		console_log("queryAboutPropietario esta vacio")
		console_log("idPropietario: "+idPropietario)
		// el asociado es tambien el propietario
		var queryExistePropietario = "";
		var arrayExistePropietario = [];
		if(idPropietario>0){
		 	// actualiza propietario
		  	queryExistePropietario = "Update Propietario set idPersona=? where idPropietario=?";
		   	arrayExistePropietario = [idPersonaPropietario, idPropietario];
		}else{
		  	// inserta propietario
		   	queryExistePropietario = "Insert into Propietario (idPersona) values (?)";
		   	arrayExistePropietario = [idPersonaPropietario];
		}
		ejecutarQUERY_MYSQL(queryExistePropietario, arrayExistePropietario, res, funcionName, function(res, resultados2){
		   	var queryExisteChoferPersona = "";
		   	var arrayExisteChoferPersona = [];
		   	if(idPropietario==0){
		   		idPropietario = resultados2.insertId;
		   	}
		   	if(idPersonaChofer>0){
		   		if(idPersonaChofer!=idPersonaAsociado && idPersonaChofer!=idPersonaPropietario){
		    		queryExisteChoferPersona="update Persona set nombres=?, apellidoPaterno=?, apellidoMaterno=?, nroDocumento=?, fechaNacimiento=?, idDistrito=?, calle=?, "+
		              	"nro=?, mzLote=?, sector=?, referencia=?, telefonoFijo=?, telefonoMovil=? where idPersona=?";
		             arrayExisteChoferPersona = [nombreChofer, apePatChofer, apeMatChofer, nroDocChofer, fecNacChofer, idDistritoChofer, calleChofer, 
		              	nroChofer, loteChofer, sectorChofer, referenciaChofer, telfijoChofer, telmovilChofer, idPersonaChofer];
		    	}
		   	} else{
		   		queryExisteChoferPersona="insert INTO Persona (nombres, apellidoPaterno, apellidoMaterno, tipoPersona, nroDocumento, fechaNacimiento, idDistrito, telefonoFijo, "+
		   			" telefonoMovil,  calle, nro, mzLote, sector, referencia, fechaRegistro) values (?,?,?,'N',?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP )";
		   		arrayExisteChoferPersona=[nombreChofer, apePatChofer, apeMatChofer, nroDocChofer,fecNacChofer,idDistritoChofer, telfijoChofer, telmovilChofer, calleChofer, nroChofer,
		   		loteChofer, sectorChofer, referenciaChofer];
		   	}
		   	if(queryExisteChoferPersona!=""){ 
		   		ejecutarQUERY_MYSQL(queryExisteChoferPersona, arrayExisteChoferPersona, res, funcionName, function(res, resultados3){
			   		if(idPersonaChofer==0){
			   			idPersonaChofer = resultados3.insertId;
			   			console_log("PERSONA CHOFER INSERTADO: "+idPersonaChofer);
			   		}
			   		var queryExisteChofer="";
			   		var arrayExisteChofer=[];
			   		if(idChofer>0){
			   			queryExisteChofer="update Chofer set idPersona=?, licenciaChofer=?, claseChofer=? where idChofer=?";
			   			arrayExisteChofer=[idPersonaChofer, licenciaChofer, claseChofer, idChofer];
			   		}else{
			   			queryExisteChofer="Insert into Chofer(idPersona, licenciaChofer, claseChofer) values (?,?,?)";
			   			arrayExisteChofer=[idPersonaChofer, licenciaChofer, claseChofer];
			   		}
			   		ejecutarQUERY_MYSQL(queryExisteChofer, arrayExisteChofer, res, funcionName, function(res, resultados4){
			   			if(idChofer==0){
			   				idChofer = resultados4.insertId;
			   			}
			   			console_log("update informe evento");
			   			// Actualiza tablas informe y evento:
			   			var queryUpdateInformeEvento="Call sp_updateInformeEvento(?,?,?)";
			   			var arrayUpdateInformeEvento=[idPropietario, idChofer, codEvento];
			   			ejecutarQUERY_MYSQL(queryUpdateInformeEvento, arrayUpdateInformeEvento, res, funcionName, function(res, resultados5){
			   				var insertado = [resultados5[0].insertado]
			   				console_log("insertado: "+resultados5[0].insertado)
			   				finalizarControl(startTime, "Se actualizaron los responsables del accidente");
			   				enviarResponse(responseGeneral, insertado); 				
			   			});
			   		});
			   	});	
		   	}else{
		   		var queryExisteChofer="";
			   	var arrayExisteChofer=[];
			   	if(idChofer>0){
			   		queryExisteChofer="update Chofer set idPersona=?, licenciaChofer=?, claseChofer=? where idChofer=?";
			   		arrayExisteChofer=[idPersonaChofer, licenciaChofer, claseChofer, idChofer];
			   	}else{
			   		queryExisteChofer="Insert into Chofer(idPersona, licenciaChofer, claseChofer) values (?,?,?)";
			   		arrayExisteChofer=[idPersonaChofer, licenciaChofer, claseChofer];
			   	}
			   	ejecutarQUERY_MYSQL(queryExisteChofer, arrayExisteChofer, res, funcionName, function(res, resultados4){
			   		if(idChofer==0){
			   			idChofer = resultados4.insertId;
			   		}
			   		console_log("update informe evento");
			   		// Actualiza tablas informe y evento:
			   		var queryUpdateInformeEvento="Call sp_updateInformeEvento(?,?,?)";
			   		var arrayUpdateInformeEvento=[idPropietario, idChofer, codEvento];
			   		ejecutarQUERY_MYSQL(queryUpdateInformeEvento, arrayUpdateInformeEvento, res, funcionName, function(res, resultados5){
			   			var insertado = [resultados5[0].insertado]
			   			console_log("insertado: "+resultados5[0].insertado)
			   			finalizarControl(startTime, "Se actualizaron los responsables del accidente");
			   			enviarResponse(responseGeneral, insertado); 				
			   		});
			   	});
		   	}
		});
	}
};

/* @getAgraviadosXcodEvento: Obtiene y retorna los agraviados por EL CODIGO DE EVENTO seleccionado.
*/
exports.getAgraviadosXcodEvento = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var query = "call sp_getAgraviadosXcodEvento(?)";
	var arrayParametros = [codEvento];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

/* @actualizarAgraviado: actualiza la informacion del agraviado.
	RETORNA: La cantidad de filas afectadas
*/
exports.actualizarAgraviado = function(req, res, funcionName){
	var idPersona = req.query.idPersona;
	var nombre = req.query.nombre;
	var apePat = req.query.apePat;
	var apeMat = req.query.apeMat;
	var nroDoc = req.query.nroDoc;
	var fecNac = req.query.fecNac;
	var telfijo = req.query.telfijo;
	var telmovil = req.query.telmovil;
	var calle = req.query.calle;
	var nro = req.query.nro;
	var lote = req.query.lote;
	var sector = req.query.sector;
	var idDistrito = req.query.idDistrito;
	var codEvento = req.query.codEvento;
	var fecIngreso = req.query.fecIngreso;
	var diagnostico = req.query.diagnostico;
	var tipo = req.query.tipo;
	// ACTUALIZA AGRAVIADO
	var query = "call sp_actualizarAgraviado(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@)";
	var arrayParametros = [idPersona, nombre, apePat, apeMat, nroDoc, fecNac, idDistrito, calle, nro, lote, sector, telfijo,
        telmovil, fecIngreso, diagnostico, tipo, codEvento];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas); 
	});
}

/* @nuevoAgraviado: Registra un Nuevo Agraviado para el Evento
	RETORNA EL VALOR 1 cuando se ha registrado el agraviado.
*/
exports.nuevoAgraviado = function(req, res, funcionName){
	//var idPersona = req.query.idPersona;
	var codAgraviado = req.query.codAgraviado;
	var nombre = req.query.nombre;
	var apePat = req.query.apePat;
	var apeMat = req.query.apeMat;
	var nroDoc = req.query.nroDoc;
	var fecNac = req.query.fecNac;
	var telfijo = req.query.telfijo;
	var telmovil = req.query.telmovil;
	var calle = req.query.calle;
	var nro = req.query.nro;
	var lote = req.query.lote;
	var sector = req.query.sector;
	var idDistrito = req.query.idDistrito;
	var codEvento = req.query.codEvento;
	var fecIngreso = req.query.fecIngreso;
	var diagnostico = req.query.diagnostico;
	var tipo = req.query.tipo;
	// INSERTA AGRAVIADO:
	var parametros = ['N', nombre, apePat, apeMat, nroDoc, fecNac, '', 
            idDistrito, calle, nro, lote, sector, '', '', '', '', '', '','', telfijo, telmovil, 
            '', 'CURRENT_TIMESTAMP', codAgraviado, codEvento, fecIngreso, diagnostico, tipo, 'CURRENT_TIMESTAMP'];
     var queryInsertPersonaAgraviado = "Call sp_insertarAgraviado(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";   
     ejecutarQUERY_MYSQL(queryInsertPersonaAgraviado, parametros, res, funcionName, function(res, resultados) {
         resultados=[1];
         enviarResponse(res, resultados);
     }); 
	
}
exports.getAllNotificaciones = function(req, res, funcionName){
	var queryWhere = "";
	function validarWhere(parametros){
		if(queryWhere!=""){
			return queryWhere+" and "+parametros;
		}else{
			return " where "+parametros;
		}
	}
	var estado = req.query.estado;
	var codEvento = req.query.codEvento;
	var idNotificacion = req.query.idNotificacion;
	var placa = req.query.placa;
	var nroCAT = req.query.nroCAT;
	var fechaHasta = req.query.fechaHasta;
	var fechaDesde = req.query.fechaDesde;	
	
	if(estado!=""){
		if(estado=='PR'){
			queryWhere=validarWhere("(n.estado='P' or n.estado='R')");
		}else{
			queryWhere=validarWhere("n.estado='"+estado+"'");			
		}		
	}
	if(codEvento!=""){
		queryWhere=validarWhere("n.codEvento='"+codEvento+"'");
	}
	if(idNotificacion!=""){
		queryWhere=validarWhere("n.idNotificacion='"+idNotificacion+"'");
	}
	if(placa!=""){
		queryWhere=validarWhere("c.placa like '"+placa+"%'");
	}
	if(nroCAT!=""){
		queryWhere=validarWhere("c.nroCAT = '"+nroCAT+"'");
	}
	if(fechaDesde!="" || fechaHasta!=""){
		if(fechaDesde!="" && fechaHasta!=""){
			fechaHasta=fechaHasta+" 23:59:59";
			queryWhere=validarWhere("( n.fechaEmision between '"+fechaDesde+"' and '"+fechaHasta+"' )");
		}else{
			if(fechaDesde!=""){
				queryWhere=validarWhere("n.fechaEmision>='"+fechaDesde+"'");
			}
			if(fechaHasta!=""){
				fechaHasta=fechaHasta+" 23:59:59";
				queryWhere=validarWhere("n.fechaEmision<='"+fechaHasta+"'");
			}
		}
	}	
	// parametros de la paginacion:
	var page = req.query.page;
	var cantPaginas = req.query.cantPaginas;
	var registrosxpagina = req.query.registrosxpagina;
	
	var query = "select LPAD(n.idNotificacion, 5, '0') idNotificacion, n.codEvento, DATE_FORMAT (n.fechaEmision, '%d/%m/%Y') as fechaEmision, n.descripcionBreve, n.estado, n.resultado, m.descripcion as motivo, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAsociado, p.tipoPersona, p.razonSocial from Notificacion n "+
        "inner join Evento e on n.codEvento = e.codEvento "+
		"inner join Cat c on e.nroCAT=c.nroCAT "+
		"inner join Motivo m on n.idMotivo = m.idMotivo "+
        "inner join Persona p on n.idPersona=p.idPersona "+queryWhere+" order by n.fechaEmision desc";
	//var query = "call sp_getAllNotificaciones(?)";
	//var arrayParametros = [estado];
	query = agregarLimit(page, registrosxpagina, query);
	ejecutarQUERY_MYSQL(query, [], res, funcionName, function(res, resultados){
		if(cantPaginas==0 && resultados.length>0){
			var queryCantidad = "select count(*) as cantidad from Notificacion n "+
				"inner join Evento e on n.codEvento = e.codEvento "+
				"inner join Cat c on e.nroCAT=c.nroCAT "+
				"inner join Motivo m on n.idMotivo = m.idMotivo "+
				"inner join Persona p on n.idPersona=p.idPersona "+queryWhere;		
			ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function(res, rows, resultados){
				var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
				resultados[0].numeroPaginas = cantidadPag;
				enviarResponse(res, resultados);
			})
		}else{
			enviarResponse(res, resultados);
		}
	});
}
exports.buscarEventoParaNotificacion = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var query = "call sp_buscarEventoParaNotificacion(?)";
	var arrayParametros = [codEvento];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
/* @gellAllMotivos: Obtiene los motivos de las notificaciones de la tabla BD 'Motivo'
*/
exports.getAllMotivos = function(req, res, funcionName){
	var query = "call sp_getAllMotivos()";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

/* @getEventosGenerales: Busca la informacion de los eventos por : / cod. Evento/ Fecha / Nombre Agraviado/ Nro CAT/ Placa.
*/
exports.getEventosGenerales = function(req, res, funcionName){ // FALTCOMP
	var tipoBusqueda = req.query.tipoBusqueda;
	var queryWhere = " where ";
	var queryAgraviado = "";
	var query = "";
	var arrayParametros = [];
	if(tipoBusqueda!=undefined){
       	if(tipoBusqueda=="F"){ // fecha                
            var fechaInicio=req.query.fechaInicio;            
            var fechaFin=req.query.fechaFin;
            if(fechaFin!=""){ // si se asigno una fecha de fin
                fechaFin=fechaFin+" 23:59:59";
                queryWhere=queryWhere+" e.fechaAccidente between ? and ?";
                arrayParametros = [fechaInicio, fechaFin];
            }else{
                var fechaEnd=fechaInicio+" 23:59:59";
                queryWhere=queryWhere+" e.fechaAccidente between ? and ?";
            	arrayParametros = [fechaInicio, fechaEnd];
            }                  
        }else if(tipoBusqueda=="A") { // Agraviado : solo para el CUS01 DE TRAMITE DOCUMENTARIO
            var nombreAgraviado = req.query.nombreAgraviado;
            var apellidoAgraviado = req.query.apellidoAgraviado;
            var dniAgraviado = req.query.dniAgraviado;
           	var WHERE_AGRAVIADO="where"; // sentencia where del agraviado
            if(nombreAgraviado!=""){
                WHERE_AGRAVIADO=WHERE_AGRAVIADO+" pag.nombres like ?";
                arrayParametros=[nombreAgraviado+'%'];
            }
            if(apellidoAgraviado!=""){
                if(WHERE_AGRAVIADO!="where"){
                	WHERE_AGRAVIADO = WHERE_AGRAVIADO+" and ";
            	}
                WHERE_AGRAVIADO=WHERE_AGRAVIADO+" concat(pag.apellidoPaterno,' ',pag.apellidoMaterno) like ?";
                arrayParametros.push(apellidoAgraviado+'%');
            }
            if(dniAgraviado!=""){
               if(WHERE_AGRAVIADO!="where"){
               		WHERE_AGRAVIADO = WHERE_AGRAVIADO+" and ";
            	}
               WHERE_AGRAVIADO=WHERE_AGRAVIADO+" pag.nroDocumento=?";
               arrayParametros.push(dniAgraviado);
            }
            queryAgraviado="SELECT ag.codAgraviado as idAgraviado, pag.idPersona,  pag.nombres, pag.apellidoPaterno, pag.apellidoMaterno, e.codEvento, e.estado, e.condonado, e.nroCAT , c.placa, date_format (e.fechaAccidente, '%d/%m/%Y %H:%i:%s') as fechaAccidente ,"+
                "e.lugarAccidente, ta.descripcion as descripcionEvento, de.nombre as distritoEvento, pp.idPersona as idPersonaPropietario,  pp.nombres as nombresPropietario, "+ 
                "pp.apellidoPaterno as apellidoPaternoPropietario, pp.apellidoMaterno as apellidoMaternoPropietario, pp.tipoPersona as tipoPropietario, pp.razonSocial as razonPropietario, (concat(pp.calle,' ',pp.nro,' ',pp.mzLote,' ',pp.sector)) as direccionPropietario, pp.telefonoFijo as telefonoFijoPropietario, pp.telefonoMovil as celularPropietario, dp.nombre as distritoPropietario, pc.idPersona as idPersonaChofer, "+
                "pc.nombres as nombresChofer, pc.apellidoPaterno as apellidoPaternoChofer, pc.apellidoMaterno as apellidoMaternoChofer, pc.nroDocumento as dniChofer, (concat(pc.calle,' ',pc.nro,' ',pc.mzLote,' ',pc.sector)) as direccionChofer, pc.telefonoFijo as telefonoFijoChofer, pc.telefonoMovil as celularChofer, dc.nombre as distritoChofer, "+
                "pa.idPersona as idPersonaAsociado, pa.nombres as nombresAsociado, pa.apellidoPaterno as apellidoPaternoAsociado, "+
                "pa.apellidoMaterno as apellidoMaternoAsociado, pa.tipoPersona as tipoAsociado, pa.razonSocial, (concat(pa.calle,' ',pa.nro,' ',pa.mzLote,' ',pa.sector)) as direccionAsociado, pa.telefonoFijo as telefonoFijoAsociado, pa.telefonoMovil as celularAsociado, da.nombre as distritoAsociado, c1.descripcion as causal1, c2.descripcion as causal2 "+        
                "from  Agraviado ag "+
                "inner join Persona pag on ag.idPersona = pag.idPersona "+
                "inner join Evento e on ag.codEvento = e.codEvento "+
                "left join Propietario prop on e.idPropietario=prop.idPropietario "+
                "left join Persona pp on prop.idPersona=pp.idPersona "+
                "left join Chofer ch on e.idChofer=ch.idChofer "+
                "left join Persona pc on ch.idPersona=pc.idPersona "+
                "inner join Cat c on e.nroCAT=c.nroCAT "+
                "inner join Asociado a on c.idAsociado=a.idAsociado "+
                "inner join Persona pa on a.idPersona = pa.idPersona "+
                "left join Distrito dp on pp.idDistrito=dp.idDistrito "+
                "left join Distrito dc on pc.idDistrito=dc.idDistrito "+
                "left join Distrito da on pa.idDistrito=da.idDistrito "+
                "left join Distrito de on e.idDistrito=de.idDistrito "+
                "inner join Informe inf on e.codEvento=inf.codEvento "+
                "inner join TipoAccidente ta on inf.idTipoAccidente=ta.idTipoAccidente "+
                "left join Causal c1 on inf.causal1=c1.codCausal "+
                "left join Causal c2 on inf.causal2=c2.codCausal "+WHERE_AGRAVIADO;
            }else{// CAT o Placa
                var codigo=req.query.codigo;
                var campo="";
                if(tipoBusqueda=="codEvento"){
                    campo="e.codEvento";
                }
                if(tipoBusqueda=="C"){ // cat
                    campo="e.nroCAT";
                }
                if(tipoBusqueda=="P"){ // placa
                    campo="c.placa";
                }
                queryWhere=queryWhere+""+campo+"=?";
                arrayParametros=[codigo];
            }
	}else{
		queryWhere="";
	}
	if(tipoBusqueda=="A"){
        query = queryAgraviado;
    }else{
    	console_log("ingrese ultimo");
        query="SELECT e.codEvento, e.estado, e.condonado, e.nroCAT , c.placa, date_format (e.fechaAccidente, '%d/%m/%Y %H:%i:%s') as fechaAccidente ,"+
            "e.lugarAccidente, ta.descripcion as descripcionEvento, de.nombre as distritoEvento, pp.idPersona as idPersonaPropietario,  pp.nombres as nombresPropietario, "+
            "pp.apellidoPaterno as apellidoPaternoPropietario, pp.apellidoMaterno as apellidoMaternoPropietario, pp.tipoPersona as tipoPropietario, pp.razonSocial as razonPropietario, (concat(pp.calle,' ',pp.nro,' ',pp.mzLote,' ',pp.sector)) as direccionPropietario, pp.telefonoFijo as telefonoFijoPropietario, pp.telefonoMovil as celularPropietario, dp.nombre as distritoPropietario, pc.idPersona as idPersonaChofer, "+ 
            "pc.nombres as nombresChofer, pc.apellidoPaterno as apellidoPaternoChofer, pc.apellidoMaterno as apellidoMaternoChofer, pc.nroDocumento as dniChofer, (concat(pc.calle,' ',pc.nro,' ',pc.mzLote,' ',pc.sector)) as direccionChofer, pc.telefonoFijo as telefonoFijoChofer, pc.telefonoMovil as celularChofer, dc.nombre as distritoChofer, "+ 
            "pa.idPersona as idPersonaAsociado, pa.nombres as nombresAsociado, pa.apellidoPaterno as apellidoPaternoAsociado, "+
            "pa.apellidoMaterno as apellidoMaternoAsociado, pa.tipoPersona as tipoAsociado, pa.razonSocial, (concat(pa.calle,' ',pa.nro,' ',pa.mzLote,' ',pa.sector)) as direccionAsociado, pa.telefonoFijo as telefonoFijoAsociado, pa.telefonoMovil as celularAsociado, da.nombre as distritoAsociado, c1.descripcion as causal1, c2.descripcion as causal2 "+    
            "from Evento e left join Propietario prop on e.idPropietario=prop.idPropietario "+
            "left join Persona pp on prop.idPersona=pp.idPersona "+
            "left join Chofer ch on e.idChofer=ch.idChofer "+
            "left join Persona pc on ch.idPersona=pc.idPersona "+
            "inner join Cat c on e.nroCAT=c.nroCAT "+
            "inner join Asociado a on c.idAsociado=a.idAsociado "+
            "inner join Persona pa on a.idPersona = pa.idPersona "+
            "left join Distrito dp on pp.idDistrito=dp.idDistrito "+
            "left join Distrito dc on pc.idDistrito=dc.idDistrito "+
            "left join Distrito da on pa.idDistrito=da.idDistrito "+
            "left join Distrito de on e.idDistrito=de.idDistrito "+
            "left join Informe inf on e.codEvento=inf.codEvento "+
            "left join TipoAccidente ta on inf.idTipoAccidente=ta.idTipoAccidente "+
            "left join Causal c1 on inf.causal1=c1.codCausal "+
            "left join Causal c2 on inf.causal2=c2.codCausal "+queryWhere;
    }
    console_log(query);
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
/*@getEventosGeneralesDomicilioLegal: Busca la informacion de los eventos por : / cod. Evento/ Fecha / Nombre Agraviado/ Nro CAT/ Placa.
	obtiene la informacion del domicio legal de los responsables del accidente.
*/
exports.getEventosGeneralesDomicilioLegal = function(req, res, funcionName){ // FALTCOMP
	var tipoBusqueda = req.query.tipoBusqueda;
	var queryWhere = " where ";
	var queryAgraviado = "";
	var query = "";
	var arrayParametros=[];
	if(tipoBusqueda!=undefined){
       	if(tipoBusqueda=="F"){ // fecha                
            var fechaInicio=req.query.fechaInicio;            
            var fechaFin=req.query.fechaFin;
            if(fechaFin!=""){ // si se asigno una fecha de fin
                fechaFin=fechaFin+" 23:59:59";
                queryWhere=queryWhere+" e.fechaAccidente between '"+fechaInicio+"' and '"+fechaFin+"'";
            }else{
                var fechaEnd=fechaInicio+" 23:59:59";
                queryWhere=queryWhere+" e.fechaAccidente between '"+fechaInicio+"' and '"+fechaEnd+"'";
            }                  
        }else if(tipoBusqueda=="A"){ // Agraviado : solo para el CUS01 DE TRAMITE DOCUMENTARIO
            var nombreAgraviado = req.query.nombreAgraviado;
            var apellidoAgraviado = req.query.apellidoAgraviado;
            var dniAgraviado = req.query.dniAgraviado;
           	var WHERE_AGRAVIADO="where"; // sentencia where del agraviado
            if(nombreAgraviado!=""){
                WHERE_AGRAVIADO=WHERE_AGRAVIADO+" pag.nombres like ?";
                arrayParametros.push(nombreAgraviado+'%');
            }
            if(apellidoAgraviado!=""){
            	if(WHERE_AGRAVIADO!="where"){
                	WHERE_AGRAVIADO = WHERE_AGRAVIADO+" and ";
            	}
                WHERE_AGRAVIADO=WHERE_AGRAVIADO+" concat(pag.apellidoPaterno,' ',pag.apellidoMaterno) like ?";
            	arrayParametros.push(apellidoAgraviado+'%');
            }
            if(dniAgraviado!=""){
               if(WHERE_AGRAVIADO!="where"){
               		WHERE_AGRAVIADO = WHERE_AGRAVIADO+" and ";
            	}
               WHERE_AGRAVIADO=WHERE_AGRAVIADO+" pag.nroDocumento='"+dniAgraviado+"'";
            }
            queryAgraviado="SELECT ag.codAgraviado as idAgraviado, pag.idPersona,  pag.nombres, pag.apellidoPaterno, pag.apellidoMaterno, e.codEvento, e.estado, e.condonado, e.nroCAT , c.placa, date_format (e.fechaAccidente, '%Y-%m-%d %T.%f') as fechaAccidente ,"+
                "e.lugarAccidente, ta.descripcion as descripcionEvento, de.nombre as distritoEvento, pp.idPersona as idPersonaPropietario,  pp.nombres as nombresPropietario, "+ 
                "pp.apellidoPaterno as apellidoPaternoPropietario, pp.apellidoMaterno as apellidoMaternoPropietario, pp.nroDocumento as nroDocPropietario, pp.tipoPersona as tipoPropietario, pp.razonSocial as razonPropietario, pp.calle1 as callePropietario, pp.nro1 as nroPropietario, pp.mzLote1 as mzlotePropietario, pp.sector1 as sectorPropietario, pp.referencia1 as referenciaPropietario, pp.telefonoFijo as telefonoFijoPropietario, pp.telefonoMovil as celularPropietario, dp.idDistrito as idDistritoPropietario, dp.idProvincia as idProvinciaPropietario, dp.nombre as distritoPropietario, pc.idPersona as idPersonaChofer, "+
                "pc.nombres as nombresChofer, pc.apellidoPaterno as apellidoPaternoChofer, pc.apellidoMaterno as apellidoMaternoChofer, pc.nroDocumento as dniChofer, pc.calle1 as calleChofer, pc.nro1 as nroChofer, pc.mzLote1 as mzloteChofer, pc.sector1 as sectorChofer, pc.referencia1 as referenciaChofer, pc.telefonoFijo as telefonoFijoChofer, pc.telefonoMovil as celularChofer, dc.idDistrito as idDistritoChofer, dc.idProvincia as idProvinciaChofer, dc.nombre as distritoChofer, "+
                "pa.idPersona as idPersonaAsociado, pa.nombres as nombresAsociado, pa.apellidoPaterno as apellidoPaternoAsociado, "+
                "pa.apellidoMaterno as apellidoMaternoAsociado, pa.nroDocumento as nroDocAsociado, pa.tipoPersona as tipoAsociado, pa.razonSocial, pa.calle1 as calleAsociado, pa.nro1 as nroAsociado, pa.mzLote1 as mzloteAsociado, pa.sector1 as sectorAsociado, pa.referencia1 as referenciaAsociado, pa.telefonoFijo as telefonoFijoAsociado, pa.telefonoMovil as celularAsociado, da.idDistrito as idDistritoAsociado, da.idProvincia as idProvinciaAsociado, da.nombre as distritoAsociado, c1.descripcion as causal1, c2.descripcion as causal2, pa.email as emailAsociado, pp.email as emailPropietario, pc.email as emailChofer "+        
                "from  Agraviado ag "+
                "inner join Persona pag on ag.idPersona = pag.idPersona "+
                "inner join Evento e on ag.codEvento = e.codEvento "+
                "left join Propietario prop on e.idPropietario=prop.idPropietario "+
                "left join Persona pp on prop.idPersona=pp.idPersona "+
                "left join Chofer ch on e.idChofer=ch.idChofer "+
                "left join Persona pc on ch.idPersona=pc.idPersona "+
                "inner join Cat c on e.nroCAT=c.nroCAT "+
                "inner join Asociado a on c.idAsociado=a.idAsociado "+
                "inner join Persona pa on a.idPersona = pa.idPersona "+
                "left join Distrito dp on pp.idDistrito1=dp.idDistrito "+
                "left join Distrito dc on pc.idDistrito1=dc.idDistrito "+
                "left join Distrito da on pa.idDistrito1=da.idDistrito "+
                "left join Distrito de on e.idDistrito=de.idDistrito "+
                "inner join Informe inf on e.codEvento=inf.codEvento "+
                "inner join TipoAccidente ta on inf.idTipoAccidente=ta.idTipoAccidente "+
                "left join Causal c1 on inf.causal1=c1.codCausal "+
                "left join Causal c2 on inf.causal2=c2.codCausal "+WHERE_AGRAVIADO;
                console_log("q. agraviado: "+queryAgraviado)
            }else{// CAT o Placa
                var codigo=req.query.codigo;
                var campo="";
                if(tipoBusqueda=="codEvento"){
                    campo="e.codEvento";
                }
                if(tipoBusqueda=="C"){ // cat
                    campo="e.nroCAT";
                }
                if(tipoBusqueda=="P"){ // placa
                    campo="c.placa";
                }
                queryWhere=queryWhere+""+campo+"='"+codigo+"'";
            }
	}else{
		queryWhere="";
	}
	if(tipoBusqueda=="A"){
        query = queryAgraviado;
    }else{
        query="SELECT e.codEvento, e.estado, e.condonado, e.nroCAT , c.placa, date_format (e.fechaAccidente, '%Y-%m-%d %T.%f') as fechaAccidente ,"+
            "e.lugarAccidente, ta.descripcion as descripcionEvento, de.nombre as distritoEvento, pp.idPersona as idPersonaPropietario,  pp.nombres as nombresPropietario, "+
            "pp.apellidoPaterno as apellidoPaternoPropietario, pp.apellidoMaterno as apellidoMaternoPropietario, pp.nroDocumento as nroDocPropietario, pp.tipoPersona as tipoPropietario, pp.razonSocial as razonPropietario, pp.calle1 as callePropietario, pp.nro1 as nroPropietario, pp.mzLote1 as mzlotePropietario, pp.sector1 as sectorPropietario, pp.referencia1 as referenciaPropietario, pp.telefonoFijo as telefonoFijoPropietario, pp.telefonoMovil as celularPropietario, dp.idDistrito as idDistritoPropietario, dp.idProvincia as idProvinciaPropietario, dp.nombre as distritoPropietario, pc.idPersona as idPersonaChofer, "+ 
            "pc.nombres as nombresChofer, pc.apellidoPaterno as apellidoPaternoChofer, pc.apellidoMaterno as apellidoMaternoChofer, pc.nroDocumento as dniChofer, pc.calle1 as calleChofer, pc.nro1 as nroChofer, pc.mzLote1 as mzloteChofer, pc.sector1 as sectorChofer, pc.referencia1 as referenciaChofer, pc.telefonoFijo as telefonoFijoChofer, pc.telefonoMovil as celularChofer, dc.idDistrito as idDistritoChofer, dc.idProvincia as idProvinciaChofer, dc.nombre as distritoChofer, "+ 
            "pa.idPersona as idPersonaAsociado, pa.nombres as nombresAsociado, pa.apellidoPaterno as apellidoPaternoAsociado, "+
            "pa.apellidoMaterno as apellidoMaternoAsociado, pa.nroDocumento as nroDocAsociado, pa.tipoPersona as tipoAsociado, pa.razonSocial, pa.calle1 as calleAsociado, pa.nro1 as nroAsociado, pa.mzLote1 as mzloteAsociado, pa.sector1 as sectorAsociado, pa.referencia1 as referenciaAsociado, pa.telefonoFijo as telefonoFijoAsociado, pa.telefonoMovil as celularAsociado, da.idDistrito as idDistritoAsociado, da.idProvincia as idProvinciaAsociado, da.nombre as distritoAsociado, c1.descripcion as causal1, c2.descripcion as causal2, pa.email as emailAsociado, pp.email as emailPropietario, pc.email as emailChofer "+    
            "from Evento e left join Propietario prop on e.idPropietario=prop.idPropietario "+
            "left join Persona pp on prop.idPersona=pp.idPersona "+
            "left join Chofer ch on e.idChofer=ch.idChofer "+
            "left join Persona pc on ch.idPersona=pc.idPersona "+
            "inner join Cat c on e.nroCAT=c.nroCAT "+
            "inner join Asociado a on c.idAsociado=a.idAsociado "+
            "inner join Persona pa on a.idPersona = pa.idPersona "+
            "left join Distrito dp on pp.idDistrito1=dp.idDistrito "+
            "left join Distrito dc on pc.idDistrito1=dc.idDistrito "+
            "left join Distrito da on pa.idDistrito1=da.idDistrito "+
            "left join Distrito de on e.idDistrito=de.idDistrito "+
            "left join Informe inf on e.codEvento=inf.codEvento "+
            "left join TipoAccidente ta on inf.idTipoAccidente=ta.idTipoAccidente "+
            "left join Causal c1 on inf.causal1=c1.codCausal "+
            "left join Causal c2 on inf.causal2=c2.codCausal "+queryWhere;
    }
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
/* @guardarNotificacion: Registra las notificaciones para cada uno de los responsables seleccionados (Destinatarios)
	RETURN: retorna los IDS de las notificaciones que se registraron
*/
exports.guardarNotificacion = function(req, res, funcionName){ 
	// recibe parametros:
    var $destinatarios=req.query.destinatarios;
    var $codEvento=req.query.codEvento;
    var $idMotivo=req.query.idMotivo;
    var $descripcionBreve=req.query.descripcionBreve;
    var $medio=req.query.medio;
    var $fechaEmision=req.query.fechaEmision;
    // se obtine la cantidad de destinatarios:
    var $sqlValues="";
    $destinatarios=$destinatarios.split("-");
    var $cantidadNotificaciones=$destinatarios.length;
    for(var $i=0; $i<$cantidadNotificaciones; $i++){
        var $Persona_tipo=$destinatarios[$i].split(";");
        var $idPersona=$Persona_tipo[0];
        var $tipoPersona=$Persona_tipo[1];
        if($i>0){
           $sqlValues=$sqlValues+" , ";
        }
        $sqlValues=$sqlValues+" ('"+$codEvento+"', CURRENT_TIMESTAMP, '"+$idPersona+"', '"+$tipoPersona+"', '"+$idMotivo+"', '"+$descripcionBreve+"', '"+$medio+"', '"+$fechaEmision+"') ";
    }
    var query="INSERT into Notificacion(codEvento, fechaGeneracion, idPersona, tipoPersona, idMotivo, descripcionBreve, medio, fechaEmision) values "+$sqlValues+";";
    ejecutarQUERY_MYSQL(query, [], res, funcionName, function(res, resultados) {
    	actualizarGastos($codEvento, res, funcionName);
        var queryCambiaEstadoEvento="update Evento set estado='N' where codEvento='"+$codEvento+"' and (estado!='B' and estado!='T')";
        ejecutarQUERY_MYSQL(queryCambiaEstadoEvento, [], res, funcionName, function(res, resultados) {
        	var querySelect="SELECT LPAD(idNotificacion,5,'0') as idNotificacion, idPersona from Notificacion order by idNotificacion desc limit "+$cantidadNotificaciones;
        	ejecutarQUERY_MYSQL(querySelect, [], res, funcionName);
        })
    });
}

/* @guardarSeguimientos: Registra una tarea de seguimiento para cada notificacion que se recibe en la variable notificaciones.
	RETURN: retona el id del seguimiento insertado
*/
exports.guardarSeguimientos = function(req, res, funcionName){ // FALTCOMP
	var codEvento=req.query.codEvento;
    var descripcionTarea=req.query.descripcionTarea;
    var medio=req.query.medio;
    var fechaProgramada=req.query.fechaProgramada;
    var notificaciones=req.query.notificaciones;
    // saca cantidad de notificaciones
    notificaciones=notificaciones.split("-");
    var count=notificaciones.length;
    var sqlValues="";
    for(var i=0; i<count; i++){
        var idNotificacion=notificaciones[i];
        if(i>0){
           sqlValues=sqlValues+" , ";
        }
        sqlValues=sqlValues+" ('"+fechaProgramada+"', '"+descripcionTarea+"', '"+codEvento+"', '"+idNotificacion+"', '"+medio+"') ";
    }
   	var query="INSERT into Seguimiento(fechaProgramada, descripcionTarea, codEvento, idNotificacion, medio) values "+sqlValues+";";
	ejecutarQUERY_MYSQL(query, [], res, funcionName, "insertId");
}
/*@getAgraviados: Obtiene los registros de los agraviados de un evento filtrandolos por el código del evento.
*/
exports.getAgraviados = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var query = "call sp_getAgraviadosXcodEvento(?)";
	var arrayParametros = [codEvento];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getGastos = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var query = "call sp_getGastos(?)";
	var arrayParametros = [codEvento];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getNotificacionesByCodEvento = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var query = "call sp_getNotificacionesByCodEvento(?)";
	var arrayParametros = [codEvento];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.insertarMotivo = function(req, res, funcionName){
	var descripcion = req.query.descripcion;
	var query = "call sp_insertarMotivo(?,@)";
	var arrayParametros = [descripcion];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
	   var idInsert=[resultados[0].idInsert];
	   enviarResponse(res, idInsert);
	 });
}
exports.actualizarMotivo = function(req, res, funcionName){
	var idMotivo = req.query.idMotivo;
	var descripcion = req.query.descripcion;
	var query = "call sp_actualizarMotivo(?,?,@)";
	var arrayParametros = [idMotivo, descripcion];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
}
exports.getTareas = function(req, res, funcionName){
	var queryWhere = "";
	function validarWhere(parametros){
		if(queryWhere!=""){
			return queryWhere+" and "+parametros;
		}else{
			return " where "+parametros;
		}
	}
	var estado = req.query.estado;
	var codEvento = req.query.codEvento;
	var idNotificacion = req.query.idNotificacion;
	var placa = req.query.placa;
	var nroCAT = req.query.nroCAT;
	var fechaHasta = req.query.fechaHasta;
	var fechaDesde = req.query.fechaDesde;
	var idTarea = req.query.idTarea;
	
	if(estado!=""){		
		queryWhere=validarWhere("s.estado='"+estado+"'");
	}
	if(codEvento!=""){
		queryWhere=validarWhere("n.codEvento='"+codEvento+"'");
	}
	if(idNotificacion!=""){
		queryWhere=validarWhere("n.idNotificacion='"+idNotificacion+"'");
	}
	if(idTarea!=""){
		queryWhere=validarWhere("idTarea='"+idTarea+"'");
	}
	if(placa!=""){
		queryWhere=validarWhere("c.placa like '"+placa+"%'");
	}
	if(nroCAT!=""){
		queryWhere=validarWhere("c.nroCAT = '"+nroCAT+"'");
	}
	if(fechaDesde!="" || fechaHasta!=""){
		if(fechaDesde!="" && fechaHasta!=""){
			fechaHasta=fechaHasta+" 23:59:59";
			queryWhere=validarWhere("( n.fechaProgramada between '"+fechaDesde+"' and '"+fechaHasta+"' )");
		}else{
			if(fechaDesde!=""){
				queryWhere=validarWhere("n.fechaProgramada>='"+fechaDesde+"'");
			}
			if(fechaHasta!=""){
				fechaHasta=fechaHasta+" 23:59:59";
				queryWhere=validarWhere("n.fechaProgramada<='"+fechaHasta+"'");
			}
		}
	}	
	// parametros de la paginacion:
	var page = req.query.page;
	var cantPaginas = req.query.cantPaginas;
	var registrosxpagina = req.query.registrosxpagina;
	var query = "select LPAD(s.idTarea,5,'0') idTarea, DATE_FORMAT (s.fechaProgramada, '%Y-%m-%d %T') as fechaProgramada, s.estado, s.descripcionTarea, s.medio, LPAD(s.idNotificacion,5,'0') idNotificacion, n.codEvento, s.resultado "+
		" from Seguimiento s inner join Notificacion n on s.idNotificacion=n.idNotificacion "+
		"inner join Evento e on n.codEvento = e.codEvento "+
		"inner join Cat c on e.nroCAT=c.nroCAT "+queryWhere+" order by s.fechaProgramada desc ";
	query = agregarLimit(page, registrosxpagina, query);
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
		if(cantPaginas==0 && resultados.length>0){
			var queryCantidad = "select count(*) as cantidad from Seguimiento s inner join Notificacion n on s.idNotificacion=n.idNotificacion "+
				"inner join Evento e on n.codEvento = e.codEvento "+
				"inner join Cat c on e.nroCAT=c.nroCAT "+queryWhere;		
			ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function(res, rows, resultados){
				var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
				resultados[0].numeroPaginas = cantidadPag;
				enviarResponse(res, resultados);
			})
		}else{
			enviarResponse(res, resultados);
		}
	});
}
exports.guardarResultado = function(req, res, funcionName){
	var idTarea = req.query.idTarea;
	var resultado = req.query.resultado;
	var objetivoCumplido = req.query.objetivoCumplido;
	var idNotificacion = req.query.idNotificacion;
	var query = "call sp_guardarResultado(?,?,?,?,@)";
	var arrayParametros = [idTarea, resultado, objetivoCumplido, idNotificacion];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
}
exports.getTareasByNotificacion = function(req, res, funcionName){
	var idNotificacion = req.query.idNotificacion;
	var query = "call sp_getTareasByNotificacion(?)";
	var arrayParametros = [idNotificacion];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getUltimaTareaByNotificacion = function(req, res, funcionName){
	var idNotificacion = req.query.idNotificacion;
	var query = "call sp_getUltimaTareaByNotificacion(?)";
	var arrayParametros = [idNotificacion];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.eliminarMotivo = function(req, res, funcionName){
	var idMotivo = req.query.idMotivo;
	var query = "call sp_eliminarMotivo(?,@)";
	var arrayParametros = [idMotivo];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
}

/*@getListaAcuerdos: Realiza la busqueda de acuerdos por su estado.
*/
exports.getListaAcuerdos = function(req, res, funcionName){
	var estado = req.query.estado;
	var query = "call sp_getListaAcuerdos(?)";
	var arrayParametros = [estado];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

/* @getGastosByCodEvento: Actualiza los gastos (Desde el servidor SQL de AUTOSEGURO) y obtiene los gastos de un Evento por su codigo.
*/
exports.getGastosByCodEvento = function(req, res, funcionName){ // FALTA
    var $codEvento=req.query.codEvento;
    var $filtroFecha=req.query.fechaInicioFiltro;
    // ACTUALIZA LOS GASTOS DEL EVENTO
    actualizarGastos($codEvento, res, funcionName, function(res, resultados){
    	var $queryAdicional="";
	    if($filtroFecha!=undefined){
	        $queryAdicional=" and g.fechaDoc>'"+$filtroFecha+"'";
	   	}
	    var $query="select g.numero, tg.descripcion as tipoGasto, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombresAgraviado, DATE_FORMAT (g.fechaDoc, '%d/%m/%Y') as fechaDoc, "+
	       " g.monto from Gasto g inner join TipoGasto tg on g.idTipoGasto = tg.idTipoGasto "+
	       " inner join Agraviado a on g.codAgraviado=a.codAgraviado "+
	       " inner join Persona p on a.idPersona=p.idPersona "+
	       " where g.codEvento='"+$codEvento+"'"+$queryAdicional+" order by tg.descripcion";
	    ejecutarQUERY_MYSQL($query, [], res, funcionName);	
    });
}
/* @cancelarAcuerdo: Cambia el estado de un acuerdo a “Cancelado”, así como también a las cuotas pendientes de pago.
*/
exports.cancelarAcuerdo = function(req, res, funcionName){
	var idAcuerdo = req.query.idAcuerdo;
	var query = "call sp_cancelarAcuerdo(?,@)";
	var arrayParametros = [idAcuerdo];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
}
function actualizaPersonaDomicilioLegal(res, funcionName, $idPersona, $doc, $nro, $direc, $mzlote, $sector, $referencia, $distrito, $telef, $cel, $email){ // FALTCOMP
	var query = "Call sp_actualizaPersonaDomicilioLegal(?,?,?,?,?,?,?,?,?,?,?)";
	var arrayParametros=[$doc, $direc, $nro, $mzlote, $sector, $referencia, $distrito, $telef, $cel, $email, $idPersona];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "false");
}

/* @guardarAcuerdo: Genera un acuerdo de un evento. Si el estado del acuerdo que se va a registrar es TERMINADO = 'T' se actualizara
	el estado del evento cambiara a TERMINADO = 'T' con descripcion de "CONDONADO" = "C". 
	En caso que no se cumpla la condicion anterior El estado del Evento se actualizara a COBRANZA = 'B' y genera el cronograma de Pagos
*/
exports.guardarAcuerdo = function(req, res, funcionName){ // FALTCOMP
	var acuerdoAnterior;
	var estadoAcuerdo;
	if(req.query.idAcuerdoAnterior==undefined){
        acuerdoAnterior=0;
    }else{
        acuerdoAnterior=req.query.idAcuerdoAnterior;
    }
    if(req.query.estadoAcuerdo==undefined){ // si no se ha definido el estado del acuerdo
        estadoAcuerdo='P'; // Pendiente            
    }else{
        estadoAcuerdo=req.query.estadoAcuerdo;
    }
    var estadoEvento="B"; // Estado de cobranza
    var estaCondonado="";
    if(estadoAcuerdo=='T'){ // si se ingresa un acuerdo en estado Terminado, entonces se ha condonado la deuda
       estadoEvento='T'; // cambia estado evento a 'T' de terminado
       estaCondonado='C'; // y se agrega la "C" para identificar que fue condonado
    }
    var codEvento=req.query.codEvento;
    var gastosAccidente=req.query.gastosAccidente;
    var gastosAdministrativos=req.query.gastosAdministrativos;
    var deudaAcordada=req.query.idDeudaAcordada;
    var valorCuota=req.query.idValorCuota;
    var nroCuotas=req.query.idNroCuotas;
    var fechaInicio=req.query.idFechaInicio;
    var periodo=parseInt(req.query.idPeriodoDias);
    var responsables=req.query.responsables;
    // Obtiene los datos de los responsables:
    var idPersonaResponsable1="";
    var idPersonaResponsable2="";
    var idPersonaResponsable3="";
    var idPersonaResponsable_Final="";
    if(responsables!=""){ // si se asignaron responsables
        responsables=responsables.split("{ln}");
        for(var i=0; i<responsables.length; i++){
            var persona=responsables[i];
            var personaObject=persona.split("{;}");
            var tipoPersona=personaObject[1]; //A=Asociado; P=Propietario; CH=Chofer, F=Pagador Final
            var idPersona=personaObject[0];
            var direccion=personaObject[2];
            var telefono=personaObject[3];
            var celular=personaObject[4];
            var email=personaObject[5];
            var doc=personaObject[6];
            var nro=personaObject[7];
            var mzlote=personaObject[8];
            var sector=personaObject[9];
            var referencia=personaObject[10];
            var distrito=personaObject[11];               
            
            var queryBusquedaPersona="";
            var arrayBusquedaPersona;
            switch (tipoPersona) {
                case 'A': // Asociado
                    idPersonaResponsable1=idPersona;
                    // Actualiza persona
                    actualizaPersonaDomicilioLegal(res, funcionName, idPersona, doc, nro, direccion, mzlote, sector, referencia, distrito, telefono, celular, email);
                    break;
                case 'P': // Propietario
                    idPersonaResponsable2=idPersona;
                    actualizaPersonaDomicilioLegal(res, funcionName, idPersona, doc, nro, direccion, mzlote, sector, referencia, distrito, telefono, celular, email);
                    // Actualiza persona
                    break;
                case 'CH': // CHOFER
                    idPersonaResponsable3=idPersona;
                    actualizaPersonaDomicilioLegal(res, funcionName, idPersona, doc, nro, direccion, mzlote, sector, referencia, distrito, telefono, celular, email);
                  	// Actualiza persona
                    break;                      
                case 'F': // Responsable Final
                   // Primero Busca si existe la persona:
                   queryBusquedaPersona = "Select idPersona from Persona where nroDocumento=?";
                   arrayBusquedaPersona = [doc];
                   break;
            }
        }
        if(queryBusquedaPersona!=""){
        	ejecutarQUERY_MYSQL(queryBusquedaPersona, arrayBusquedaPersona, res, funcionName, function(res, resultados) {
                if(resultados.length==0){
            		var nombreResponsableFinal=personaObject[12];
                	var queyInsertPersona = "Insert into Persona (nombres, apellidoPaterno, apellidoMaterno, nroDocumento, calle1, nro1, mzLote1, sector1, referencia1, idDistrito1, telefonoFijo, telefonoMovil, email) "+
                    	"values (?,'','',?,?,?,?,?,?,?,?,?,?)";
                    var arrayInsertPersona = [nombreResponsableFinal, doc, direccion, nro, mzlote, sector, referencia, distrito, telefono, celular, email]
                	ejecutarQUERY_MYSQL(queyInsertPersona, arrayInsertPersona, res, funcionName, function(res2, resultados2){
                		idPersonaResponsable_Final=resultados2.insertId;
                		// INSERTA ACUERDO
            			var queryInsertAcuerdo = "INSERT INTO Acuerdo(fechaAcuerdo, codEvento, estado, gastosAccidente, gastosAdministrativos,"+
            				"deudaAcordada, valorCuota, nroCuotas, fechaInicioCuotas, PeriodoCuotas, idAcuerdoAnterior, idPersonaResponsable1, idPersonaResponsable2, idPersonaResponsable3, idPersonaResponsableFinal) "+
            			    "select CURRENT_TIMESTAMP, '"+codEvento+"', '"+estadoAcuerdo+"', '"+gastosAccidente+"', '"+gastosAdministrativos+"', '"+deudaAcordada+"', '"+valorCuota+"', "+ 
            			    "'"+nroCuotas+"', '"+fechaInicio+"', '"+periodo+"', '"+acuerdoAnterior+"', '"+idPersonaResponsable1+"', '"+idPersonaResponsable2+"', '"+idPersonaResponsable3+"', "+
            			    "'"+idPersonaResponsable_Final+"'";
            			
            			ejecutarQUERY_MYSQL(queryInsertAcuerdo, [], res, funcionName, function(res, resultados){
            			  	var idAcuerdoIngresado=resultados.insertId;
            			  	if(estadoAcuerdo=="P"){ // Si el estado del acuerdo que se esta registrado es pendiente se generará un cronograma
            			  		//*************** GENERAR CRONOGRAMA DE PAGOS ******************************************************************************       
            	            	// inserta la primera cuota (GASTOS ADMINISTRATIVOS)
            			  		var queryInsertGastoAdministrativos="INSERT INTO Cronograma(valorCuota, fechaApagar, nroCuota, codEvento, idAcuerdo) "+
            	            		"select '"+valorCuota+"', '"+fechaInicio+"', '1', '"+codEvento+"', '"+idAcuerdoIngresado+"'";	
            			  		ejecutarQUERY_MYSQL(queryInsertGastoAdministrativos, [], res, funcionName, function(res, resultados) {
            			  			var fechaCuota= new Date(fechaInicio); // OBSERVACION
            	            		var numMeses=periodo/30;
            	            		var nuevaFecha;
            	            		for(var i=2; i<=nroCuotas; i++){
            	            			if(periodo%30!=0){ // si no es divisible de 30
            			                    //date_modify(fechaCuota, '+'+periodo+' day'); // suma el intervalo de dias del periodo para obtener la fecha de pago de la cuota
            			                    //nuevaFecha=date_format(fechaCuota, 'Y-m-d'); // obtiene la nueva fecha
            			                    fechaCuota.setDate(fechaCuota.getDate()+periodo);
            			                    nuevaFecha =fechaCuota.getFullYear()+"-"+((fechaCuota.getMonth()+1<10)?'0'+(fechaCuota.getMonth()+1):(fechaCuota.getMonth()+1))+"-"+
            			                    	((fechaCuota.getDate()<10)?'0'+(fechaCuota.getDate()):(fechaCuota.getDate()));
            			                }else{                    
            			                    //date_modify(fechaCuota, '+'+$numMeses+' month');
            			                    //nuevaFecha=date_format(fechaCuota, 'Y-m-d');
            			                    fechaCuota.setMonth(fechaCuota.getMonth()+numMeses);
            			                    nuevaFecha =fechaCuota.getFullYear()+"-"+((fechaCuota.getMonth()+1<10)?'0'+(fechaCuota.getMonth()+1):(fechaCuota.getMonth()+1))+"-"+
            			                    	((fechaCuota.getDate()<10)?'0'+(fechaCuota.getDate()):(fechaCuota.getDate()));
            			                } 
            			                console_log("fecha cuota: "+nuevaFecha);
            			                // inserta cuota
            			                var insertaCuota="INSERT INTO Cronograma(valorCuota, fechaApagar, nroCuota, codEvento, idAcuerdo) "+
            			                	"Select '"+valorCuota+"', '"+nuevaFecha+"', '"+i+"', '"+codEvento+"', '"+idAcuerdoIngresado+"'";
            			                ejecutarQUERY_MYSQL(insertaCuota, [], res, funcionName, "false");
            	            		}
            			  		});
            			  	}
            			  	if(acuerdoAnterior>0){ // si es una cancelacion o condonacion asigna el id del nuevo a cuerdo a las cuotas
            		        	var queryActualizaCuotas="update Cronograma set idAcuerdoNuevo='"+idAcuerdoIngresado+"' where idAcuerdo='"+acuerdoAnterior+"'";
            		        	ejecutarQUERY_MYSQL(queryActualizaCuotas, [], res, funcionName, "false");
            		        }
            		        // Actualiza estado del evento
            		        var queryActualizaEstadoEvento="update Evento set estado='"+estadoEvento+"', condonado='"+estaCondonado+"' where codEvento='"+codEvento+"'";
            		        ejecutarQUERY_MYSQL(queryActualizaEstadoEvento, [], res, funcionName, "false");
            		        enviarResponse(res, [idAcuerdoIngresado]);
            			});
                	});	
                }else{
                    idPersonaResponsable_Final = resultados[0].idPersona;
                	actualizaPersonaDomicilioLegal(res, funcionName, idPersonaResponsable_Final, doc, nro, direccion, mzlote, sector, referencia, distrito, telefono, celular, email);
                    // INSERTA ACUERDO
        			var queryInsertAcuerdo = "INSERT INTO Acuerdo(fechaAcuerdo, codEvento, estado, gastosAccidente, gastosAdministrativos,"+
        				"deudaAcordada, valorCuota, nroCuotas, fechaInicioCuotas, PeriodoCuotas, idAcuerdoAnterior, idPersonaResponsable1, idPersonaResponsable2, idPersonaResponsable3, idPersonaResponsableFinal) "+
        			    "select CURRENT_TIMESTAMP, '"+codEvento+"', '"+estadoAcuerdo+"', '"+gastosAccidente+"', '"+gastosAdministrativos+"', '"+deudaAcordada+"', '"+valorCuota+"', "+ 
        			    "'"+nroCuotas+"', '"+fechaInicio+"', '"+periodo+"', '"+acuerdoAnterior+"', '"+idPersonaResponsable1+"', '"+idPersonaResponsable2+"', '"+idPersonaResponsable3+"', "+
        			    "'"+idPersonaResponsable_Final+"'";
        			    
        			ejecutarQUERY_MYSQL(queryInsertAcuerdo, [], res, funcionName, function(res, resultados){
        			  	var idAcuerdoIngresado=resultados.insertId;
        			  	if(estadoAcuerdo=="P"){ // Si el estado del acuerdo que se esta registrado es pendiente se generará un cronograma
        			  		//*************** GENERAR CRONOGRAMA DE PAGOS ******************************************************************************       
        	            	// inserta la primera cuota (GASTOS ADMINISTRATIVOS)
        			  		var queryInsertGastoAdministrativos="INSERT INTO Cronograma(valorCuota, fechaApagar, nroCuota, codEvento, idAcuerdo) "+
        	            		"select '"+valorCuota+"', '"+fechaInicio+"', '1', '"+codEvento+"', '"+idAcuerdoIngresado+"'";	
        			  		ejecutarQUERY_MYSQL(queryInsertGastoAdministrativos, [], res, funcionName, function(res, resultados) {
        			  			var fechaCuota= new Date(fechaInicio); // OBSERVACION
        	            		var numMeses=periodo/30;
        	            		var nuevaFecha;
        	            		for(var i=2; i<=nroCuotas; i++){
        	            			if(periodo%30!=0){ // si no es divisible de 30
        			                    //date_modify(fechaCuota, '+'+periodo+' day'); // suma el intervalo de dias del periodo para obtener la fecha de pago de la cuota
        			                    //nuevaFecha=date_format(fechaCuota, 'Y-m-d'); // obtiene la nueva fecha
        			                    fechaCuota.setDate(fechaCuota.getDate()+periodo);
        			                    nuevaFecha =fechaCuota.getFullYear()+"-"+((fechaCuota.getMonth()+1<10)?'0'+(fechaCuota.getMonth()+1):(fechaCuota.getMonth()+1))+"-"+
        			                    	((fechaCuota.getDate()<10)?'0'+(fechaCuota.getDate()):(fechaCuota.getDate()));
        			                }else{                    
        			                    //date_modify(fechaCuota, '+'+$numMeses+' month');
        			                    //nuevaFecha=date_format(fechaCuota, 'Y-m-d');
        			                    fechaCuota.setMonth(fechaCuota.getMonth()+numMeses);
        			                    nuevaFecha =fechaCuota.getFullYear()+"-"+((fechaCuota.getMonth()+1<10)?'0'+(fechaCuota.getMonth()+1):(fechaCuota.getMonth()+1))+"-"+
        			                    	((fechaCuota.getDate()<10)?'0'+(fechaCuota.getDate()):(fechaCuota.getDate()));
        			                } 
        			                console_log("fecha cuota: "+nuevaFecha);
        			                // inserta cuota
        			                var insertaCuota="INSERT INTO Cronograma(valorCuota, fechaApagar, nroCuota, codEvento, idAcuerdo) "+
        			                	"Select '"+valorCuota+"', '"+nuevaFecha+"', '"+i+"', '"+codEvento+"', '"+idAcuerdoIngresado+"'";
        			                ejecutarQUERY_MYSQL(insertaCuota, [], res, funcionName, "false");
        	            		}
        			  		});
        			  	}
        			  	if(acuerdoAnterior>0){ // si es una cancelacion o condonacion asigna el id del nuevo a cuerdo a las cuotas
        		        	var queryActualizaCuotas="update Cronograma set idAcuerdoNuevo='"+idAcuerdoIngresado+"' where idAcuerdo='"+acuerdoAnterior+"'";
        		        	ejecutarQUERY_MYSQL(queryActualizaCuotas, [], res, funcionName, "false");
        		        }
        		        // Actualiza estado del evento
        		        var queryActualizaEstadoEvento="update Evento set estado='"+estadoEvento+"', condonado='"+estaCondonado+"' where codEvento='"+codEvento+"'";
        		        ejecutarQUERY_MYSQL(queryActualizaEstadoEvento, [], res, funcionName, "false");
        		        enviarResponse(res, [idAcuerdoIngresado]);
        			});
                    
                }
            });
        }else{
        	// INSERTA ACUERDO
			var queryInsertAcuerdo = "INSERT INTO Acuerdo(fechaAcuerdo, codEvento, estado, gastosAccidente, gastosAdministrativos,"+
				"deudaAcordada, valorCuota, nroCuotas, fechaInicioCuotas, PeriodoCuotas, idAcuerdoAnterior, idPersonaResponsable1, idPersonaResponsable2, idPersonaResponsable3, idPersonaResponsableFinal) "+
			    "select CURRENT_TIMESTAMP, '"+codEvento+"', '"+estadoAcuerdo+"', '"+gastosAccidente+"', '"+gastosAdministrativos+"', '"+deudaAcordada+"', '"+valorCuota+"', "+ 
			    "'"+nroCuotas+"', '"+fechaInicio+"', '"+periodo+"', '"+acuerdoAnterior+"', '"+idPersonaResponsable1+"', '"+idPersonaResponsable2+"', '"+idPersonaResponsable3+"', "+
			    "'"+idPersonaResponsable_Final+"'";
			ejecutarQUERY_MYSQL(queryInsertAcuerdo, [], res, funcionName, function(res, resultados){
			  	var idAcuerdoIngresado=resultados.insertId;
			  	if(estadoAcuerdo=="P"){ // Si el estado del acuerdo que se esta registrado es pendiente se generará un cronograma
			  		//*************** GENERAR CRONOGRAMA DE PAGOS ******************************************************************************       
	            	// inserta la primera cuota (GASTOS ADMINISTRATIVOS)
			  		var queryInsertGastoAdministrativos="INSERT INTO Cronograma(valorCuota, fechaApagar, nroCuota, codEvento, idAcuerdo) "+
	            		"select '"+valorCuota+"', '"+fechaInicio+"', '1', '"+codEvento+"', '"+idAcuerdoIngresado+"'";	
			  		ejecutarQUERY_MYSQL(queryInsertGastoAdministrativos, [], res, funcionName, function(res, resultados) {
			  			var fechaCuota= new Date(fechaInicio); // OBSERVACION
	            		var numMeses=periodo/30;
	            		var nuevaFecha;
	            		for(var i=2; i<=nroCuotas; i++){
	            			if(periodo%30!=0){ // si no es divisible de 30
			                    //date_modify(fechaCuota, '+'+periodo+' day'); // suma el intervalo de dias del periodo para obtener la fecha de pago de la cuota
			                    //nuevaFecha=date_format(fechaCuota, 'Y-m-d'); // obtiene la nueva fecha
			                    fechaCuota.setDate(fechaCuota.getDate()+periodo);
			                    nuevaFecha =fechaCuota.getFullYear()+"-"+((fechaCuota.getMonth()+1<10)?'0'+(fechaCuota.getMonth()+1):(fechaCuota.getMonth()+1))+"-"+
			                    	((fechaCuota.getDate()<10)?'0'+(fechaCuota.getDate()):(fechaCuota.getDate()));
			                }else{                    
			                    //date_modify(fechaCuota, '+'+$numMeses+' month');
			                    //nuevaFecha=date_format(fechaCuota, 'Y-m-d');
			                    fechaCuota.setMonth(fechaCuota.getMonth()+numMeses);
			                    nuevaFecha =fechaCuota.getFullYear()+"-"+((fechaCuota.getMonth()+1<10)?'0'+(fechaCuota.getMonth()+1):(fechaCuota.getMonth()+1))+"-"+
			                    	((fechaCuota.getDate()<10)?'0'+(fechaCuota.getDate()):(fechaCuota.getDate()));
			                } 
			                console_log("fecha cuota: "+nuevaFecha);
			                // inserta cuota
			                var insertaCuota="INSERT INTO Cronograma(valorCuota, fechaApagar, nroCuota, codEvento, idAcuerdo) "+
			                	"Select '"+valorCuota+"', '"+nuevaFecha+"', '"+i+"', '"+codEvento+"', '"+idAcuerdoIngresado+"'";
			                ejecutarQUERY_MYSQL(insertaCuota, [], res, funcionName, "false");
	            		}
			  		});
			  	}
			  	if(acuerdoAnterior>0){ // si es una cancelacion o condonacion asigna el id del nuevo a cuerdo a las cuotas
		        	var queryActualizaCuotas="update Cronograma set idAcuerdoNuevo='"+idAcuerdoIngresado+"' where idAcuerdo='"+acuerdoAnterior+"'";
		        	ejecutarQUERY_MYSQL(queryActualizaCuotas, [], res, funcionName, "false");
		        }
		        // Actualiza estado del evento
		        var queryActualizaEstadoEvento="update Evento set estado='"+estadoEvento+"', condonado='"+estaCondonado+"' where codEvento='"+codEvento+"'";
		        ejecutarQUERY_MYSQL(queryActualizaEstadoEvento, [], res, funcionName, "false");
		        enviarResponse(res, [idAcuerdoIngresado]);
			});
        }
   }
}

/*@getMontoPagadoByidAcuerdo: Obtiene la cantidad pagada de un acuerdo
*/
exports.getMontoPagadoByidAcuerdo = function(req, res, funcionName){
	var idAcuerdo = req.query.idAcuerdo;
	var query = "call sp_getMontoPagadoByidAcuerdo(?)";
	var arrayParametros = [idAcuerdo];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
/* @getGastosXperiodo: Busca los eventos dentro de periodo (Fecha Inicio - Fecha FIN), despues de haber identificado los eventos, actualiza sus gastos (funcion ActualizarGastos) y obtiene y devuelve el total de gasto de cada Evento.
*/
exports.getGastosXperiodo = function(req, res, funcionName){ // FALTA
	var $fechaInicio=req.query.fechaInicio;
    var $fechaFin=req.query.fechaFin;
    var $queryWhere;
    if($fechaFin!=""){ // se asigno fecha de fin
        $queryWhere=" (fechaAccidente between '"+$fechaInicio+"' and '"+$fechaFin+"')";
    }else{
        $queryWhere=" fechaAccidente = '"+$fechaInicio+"' ";
    }
    var $query="select codEvento from Evento where esRecupero='S' and "+$queryWhere+" order by fechaAccidente desc";
    ejecutarQUERY_MYSQL($query, [], res, funcionName, function(res, resultados) {
        var codigos="";
        var codigosConComillas="";
        for(var i=0; i<resultados.length; i++){
            if(i>0){
                codigos=codigos+", ";
                codigosConComillas = codigosConComillas+", ";
            }
            codigos=codigos+resultados[i].codEvento;
            codigosConComillas = codigosConComillas+"'"+resultados[i].codEvento+"'";
        }
        if(codigosConComillas!=""){
        	actualizarGastos(codigos, res, funcionName, function(res, resultados){
	        	var $queryGastosXcodEvento="select e.codEvento, ta.descripcion as descripcionEvento, DATE_FORMAT (e.fechaAccidente, '%Y-%m-%d %T') as fechaAccidente, p.tipoPersona, "+
	            "(concat(p.nombres,', ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreAsociado, p.razonSocial, e.nroCAT, c.placa, (select sum(monto) from Gasto where codEvento = e.codEvento) as montoTotalGasto, "+
	            "(select date_format(gx.fechaDoc, '%Y-%m-%d %T') as fechaDoc from Gasto gx where gx.codEvento=e.codEvento order by gx.fechaDoc desc limit 1) as ultimaFecha from Evento e "+
	            "inner join Informe i on e.codEvento=i.codEvento "+
	            "inner join TipoAccidente ta on i.idTipoAccidente=ta.idTipoAccidente "+
	            "inner join Asociado a on i.idAsociado=a.idAsociado "+
	            "inner join Persona p on a.idPersona=p.idPersona "+
	            "inner join Cat c on e.nroCAT=c.nroCAT "+
	            "where e.codEvento in ("+codigosConComillas+") group by e.codEvento, e.fechaAccidente, p.tipoPersona, p.nombres, p.apellidoPaterno, p.apellidoMaterno, p.razonSocial, e.nroCAT, c.placa, ta.descripcion";
		        console.log($queryGastosXcodEvento);
		        console_log("query ejecutado: "+$queryGastosXcodEvento);
		        ejecutarQUERY_MYSQL($queryGastosXcodEvento, [], res, funcionName);	
	        })
        }else{
        	enviarResponse(res,[]);
        }
        
    })
};
/* @actualizarGastos: Actualiza los gastos de los eventos a través de una petición a un servicio web del servidor PHP de AUTOSEGURO
	PARAMETROS:
		1) codEvento: Lista de eventos a actualizar
		2) res: variable response
		3) funcionaName: nombre de la funcion
		4) callback: funcion que se ejecuta despues de haber actualizado los gastos de los eventos
*/
function actualizarGastos(codEvento, res, funcionName, callback){
	var startTime = new Date();
	console_log("actualizarGastos");
	var request = require("request");
	var dominio = "http://www.autoseguroafocat.org/";
	var dataGastos;
	console_log("link: "+dominio+"intranet2/intranetDB2.php?funcion=actualizarGastos&eventos="+codEvento);
	//request(dominio+"intranet2/intranetDB2.php?funcion=actualizarGastos&eventos="+codEvento, function (error, response, body) { //usado para GET
	request.post({url:dominio+"intranet2/intranetDB2.php?funcion=actualizarGastos", form: {"eventos":codEvento}, headers: {'content-type' : 'application/json'}}, function(error,response,body){ // CON POST
		//console_log("rpta request");
  		if (!error && response.statusCode == 200) {
  			//console_log("rpta: "+body);
  			//body=body.split("[");
  			//body = "["+body[1];
  			body=body.trimLeft();
  			//body = body.replace(/\s/g, ''); // suprime espacios en blanco
  			console_log("body changed: "+body);
  			dataGastos = JSON.parse(body); // Obtiene los nuevos gastos
  			console_log("tamaño: "+dataGastos.length);
  			 // Elimina todos los gastos
  			 var ListaEventos = "";
  			 codEvento = codEvento.split(", ");
  			 for(var i=0; i<codEvento.length; i++){
  			 	if(i>0){
  			 		ListaEventos = ListaEventos+", ";
  			 	}
  			 	ListaEventos = ListaEventos+"'"+codEvento[i]+"'";
  			 }
  			console_log("Lista Eventos: "+ListaEventos);
  			ejecutarQUERY_MYSQL("Delete from Gasto where codEvento in ("+ListaEventos+")", [], res, funcionName, function(res, resultados){
  				 //Inserta los gastos 
  				console_log("insertando gastos");
  				var queryInsert="INSERT INTO Gasto(numero, fechaDoc, proveedor, monto, comprobante, idTipoGasto, codAgraviado, codEvento) values ";
  				var values = "";
  				console_log("tamaño nuevo: "+dataGastos.length);
  				for(var i=0; i<dataGastos.length; i++){
  					var Numero=dataGastos[i]['Numero'];
                    var FechaDoc=dataGastos[i]['FechaDoc'];
                    var Proveedor=dataGastos[i]['Proveedor'];
                    var Monto=dataGastos[i]['Monto'];
                    var comprobante=dataGastos[i]['Tipo'];
                    var idGasto=dataGastos[i]['Riesgo'];
                    var siniestro=dataGastos[i]['Siniestro'];
                    var evento=dataGastos[i]['evento'];
  					if(i>0){
  						values=values+", ";
  					}
  					values=values+"('"+Numero+"', '"+FechaDoc+"', '"+Proveedor+"', '"+Monto+"', '"+comprobante+"', '"+idGasto+"', '"+siniestro.trim()+"', '"+evento.trim()+"')";
  				}
  				if(values!=""){
  					queryInsert=queryInsert+values;
  					// Inserta Gastos
  					ejecutarQUERY_MYSQL(queryInsert, [], res, funcionName, function(res, resultados) {
  						finalizarControl(startTime, "se encontraron y registraron "+dataGastos.length+" gastos");
  						if(callback!=undefined){
  							callback(res, resultados);	
  						}
  					});
  				}else{
  					finalizarControl(startTime, "se encontraron y registraron "+dataGastos.length+" gastos");
  					if(callback!=undefined){
  						callback(res, resultados);	
  					}	
  				}
  			});
  		}
	});
}

/* @buscarAcuerdosConOrdenesPago: Obtiene los acuerdos que tienen ordenes de pago
*/
exports.buscarAcuerdosConOrdenesPago = function(req, res, funcionName){ // FALTCOMP
	var tipoBusqueda=req.query.tipoBusqueda;
    var queryWhere="";
    if(tipoBusqueda=="F"){ // fecha
        var fechaInicio=req.query.fechaInicio;            
        var fechaFin=req.query.fechaFin;
        if(fechaFin!=""){ // si se asigno una fecha de fin
            fechaFin=fechaFin+" 23:59:59";
            queryWhere=queryWhere+" PA.fechaEmision between '"+fechaInicio+"' and '"+fechaFin+"'";
        }else{
            var fechaEnd=fechaInicio+" 23:59:59";
            queryWhere=queryWhere+" PA.fechaEmision between '"+fechaInicio+"' and '"+fechaEnd+"'";
      	}        
  	}else{ // DNI=D, Placa=P, Cod Evento=codEvento
      	var campo='';
        switch (tipoBusqueda) {
            case 'D':
               	campo="Pag.nroDocumento";        
               	break;
           	case 'codEvento':
                campo="A.codEvento";        
               	break;
            case 'P':
                campo="C.placa";        
                break;
        }
        var codigo=req.query.codigo;
        queryWhere=campo+"='"+codigo+"'";
    }
    var query="Select LPAD(A.idAcuerdo,5,'0') as idAcuerdo, A.codEvento, DATE_FORMAT (A.fechaAcuerdo, '%d/%m/%Y') as fechaAcuerdo, A.deudaAcordada, "+
        "DATE_FORMAT (A.fechaInicioCuotas, '%d/%m/%Y') as fechaInicioCuotas, DATE_FORMAT (E.fechaAccidente, '%d/%m/%Y') as fechaAccidente, TP.descripcion, Concat(P.nombres,' ',P.apellidoPaterno,' ',P.apellidoMaterno) as nombreAsociado, "+
        "P.tipoPersona, P.razonSocial, C.nroCAT, C.placa, P.nroDocumento, Pag.nroDocumento as dniPagador,  Concat(Pag.nombres,' ',Pag.apellidoPaterno,' ',Pag.apellidoMaterno) as nombrePagador, Pag.idPersona as idPersonaPagador, "+
        "DATE_FORMAT (PA.fechaEmision, '%d/%m/%Y') as fechaEmisionOrden, sum(PA.monto) as montoTotalOrden from Acuerdo A "+
        "inner join Evento E on A.codEvento = E.codEvento "+
        "inner join Informe I on A.codEvento = I.codEvento "+
        "inner join TipoAccidente TP on I.idTipoAccidente=TP.idTipoAccidente "+
        "inner join Cat C on E.nroCAT = C.nroCAT "+
        "inner join Asociado ASO on C.idAsociado = ASO.idAsociado "+
        "inner join Persona P on ASO.idPersona = P.idPersona "+
        "inner join Pago PA on A.idAcuerdo = PA.idAcuerdo "+
        "inner join Persona Pag on PA.idPersona = Pag.idPersona "+
        "where PA.estado='G' and "+queryWhere+" group by A.idAcuerdo, A.codEvento, A.fechaAcuerdo, A.deudaAcordada, A.fechaInicioCuotas, E.fechaAccidente, TP.descripcion, P.nombres, P.apellidoPaterno, P.apellidoMaterno, P.tipoPersona, P.razonSocial, C.nroCAT, C.placa, P.nroDocumento,Pag.nroDocumento, Pag.nombres, Pag.apellidoPaterno, Pag.apellidoMaterno, Pag.idPersona, PA.fechaEmision, PA.monto";
    console_log("query final: "+query);
    ejecutarQUERY_MYSQL(query, [], res, funcionName);    
};

/* @buscarAcuerdos: Realiza busqueda de los acuerdos por: Fecha de registro / DNI de uno de los responsables del accidente / 
	Nro CAT/ Nro Placa / Cod Evento
*/
exports.buscarAcuerdos = function(req, res, funcionName){ // FALTCOMP
	var tipoBusqueda=req.query.tipoBusqueda;
    var queryWhere=" where ";
    if(tipoBusqueda=="F"){ // fecha
        var fechaInicio=req.query.fechaInicio;            
        var fechaFin=req.query.fechaFin;
        if(fechaFin!=""){ // si se asigno una fecha de fin
            fechaFin=fechaFin+" 23:59:59";
            queryWhere=queryWhere+" A.fechaAcuerdo between '"+fechaInicio+"' and '"+fechaFin+"'";
        }else{
            var fechaEnd=fechaInicio+" 23:59:59";
            queryWhere=queryWhere+" A.fechaAcuerdo between '"+fechaInicio+"' and '"+fechaEnd+"'";
      	}        
  	}else{
  		var codigo=req.query.codigo;
  		var campo='';
  		if(tipoBusqueda=="D"){ // DNI
           queryWhere=queryWhere+"(P.nroDocumento ='"+codigo+"' or pa.nroDocumento ='"+codigo+"' or pp.nroDocumento ='"+codigo+"' or pc.nroDocumento ='"+codigo+"' or pf.nroDocumento = '"+codigo+"')";
        }else{
        	switch (tipoBusqueda) {
                case 'A':
                    campo="A.idAcuerdo";
                        break;
                case 'E':
                    campo="A.codEvento";
                        break;
                case 'C':
                    campo="C.nroCAT";                        
                        break;
                case 'P':
                    campo="C.placa";                        
                       break;
            }
        	queryWhere=queryWhere+campo+"='"+codigo+"'";
        }    
  	}
  	var query="Select LPAD(A.idAcuerdo,5,'0') as idAcuerdo, A.codEvento, date_format( A.fechaAcuerdo, '%d/%m/%Y') as fechaAcuerdo, A.gastosAdministrativos, A.deudaAcordada, "+
        "date_format(A.fechaInicioCuotas, '%d/%m/%Y') as fechaInicioCuotas, date_format(E.fechaAccidente, '%d/%m/%Y') as fechaAccidente, TP.descripcion, concat(P.nombres,' ',P.apellidoPaterno,' ',P.apellidoMaterno) as nombreAsociado, "+
        "P.tipoPersona, P.razonSocial, C.nroCAT, C.placa, P.nroDocumento from Acuerdo A "+
        "inner join Evento E on A.codEvento = E.codEvento "+
        "inner join Informe I on A.codEvento = I.codEvento "+
        "inner join TipoAccidente TP on I.idTipoAccidente=TP.idTipoAccidente "+
        "inner join Cat C on E.nroCAT = C.nroCAT "+
        "inner join Asociado ASO on C.idAsociado = ASO.idAsociado "+
        "inner join Persona P on ASO.idPersona = P.idPersona "+
        "left join Persona pa on A.idPersonaResponsable1 = pa.idPersona "+
        "left join Persona pp on A.idPersonaResponsable2 = pp.idPersona "+
        "left join Persona pc on A.idPersonaResponsable3 = pc.idPersona "+
        "left join Persona pf on A.idPersonaResponsableFinal=pf.idPersona "+queryWhere+" and A.estado='P'";
    console_log("final query: "+query);
    ejecutarQUERY_MYSQL(query, [], res, funcionName); 
};
/* @getReponsablesByAcuerdo: Obtiene los responsables de un acuerdo.
*/
exports.getReponsablesByAcuerdo = function(req, res, funcionName){ 
	var idAcuerdo=req.query.idAcuerdo;
	var query = "Select pa.idPersona as idPersonaAsociado, IFNULL(concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno),'') as nombreAsociado, pa.tipoPersona as tipoPersonaAsociado, pa.razonSocial as razonAsociado, pa.nroDocumento as nroDocAsociado, "+
        "pp.idPersona as idPersonaPropietario, IFNULL(concat(pp.nombres,' ',pp.apellidoPaterno,' ',pp.apellidoMaterno),'') as nombrePropietario, pp.tipoPersona as tipoPersonaPropietario, pp.razonSocial as razonPropietario, pp.nroDocumento as nroDocPropietario, "+
        "pc.idPersona as idPersonaChofer, IFNULL(concat(pc.nombres,' ',pc.apellidoPaterno,' ',pc.apellidoMaterno),'') as nombreChofer, pc.tipoPersona as tipoPersonaChofer, pc.razonSocial as razonChofer, pc.nroDocumento as nroDocChofer, "+
        "pf.idPersona as idPersonaFinal, IFNULL(concat(pf.nombres,' ',pf.apellidoPaterno,' ',pf.apellidoMaterno),'') as nombreFinal, pf.tipoPersona as tipoPersonaFinal, pf.nroDocumento as nroDocFinal from Acuerdo a "+
        "left join Persona pa on a.idPersonaResponsable1=pa.idPersona "+
        "left join Persona pp on a.idPersonaResponsable2=pp.idPersona "+
        "left join Persona pc on a.idPersonaResponsable3=pc.idPersona "+
        "left join Persona pf on a.idPersonaResponsableFinal=pf.idPersona where a.idAcuerdo=?";
        ejecutarQUERY_MYSQL(query, [idAcuerdo], res, funcionName); 
};

/* @getCuotasByAcuerdo: Busca las cuotas de un acuerdo segun su estado
*/
exports.getCuotasByAcuerdo = function(req, res, funcionName){ // FALTCOMP
	var $condicionWhere="";
    var $idAcuerdo=req.query.idAcuerdo;
    var $estado=req.query.estado;
    if($estado!=undefined){ // ESTADO DECLARADO EL ESTADO
        $estado=$estado.split("-");
        var $conjuntoestados="";
        for(var $i=0; $i<$estado.length; $i++){
            if($i>0){
               $conjuntoestados+=" , ";
            }
            $conjuntoestados+=" '"+$estado[$i]+"' ";
        }
        $condicionWhere="and c.estadoCuota in ( "+$conjuntoestados+" )";
    }
    var query="select c.idCuota, c.nroCuota, c.estadoCuota, DATE_FORMAT (c.fechaApagar, '%d/%m/%Y') as fechaVencimiento, c.valorCuota, c.pagosACuenta as montoPagado , DATE_FORMAT (c.fechaPago, '%d/%m/%Y') as ultimaFechaPago from Cronograma c "+
        "where c.idAcuerdo='"+$idAcuerdo+"' "+$condicionWhere+" group by c.idCuota, c.nroCuota, c.estadoCuota, c.fechaApagar, c.valorCuota, c.fechaPago, c.pagosACuenta";
	
	ejecutarQUERY_MYSQL(query, [], res, funcionName);
};

/* @generarOrdenPago: Genera una orden de pago para todas las cuotas seleccionadas.
*/
exports.generarOrdenPago = function(req, res, funcionName){ // FALTCOMP
	var $cuotasMonto=req.query.idCuotas;
    var $idAcuerdo=req.query.idAcuerdo;
    var $idPersona = req.query.idPersona;
    // obteniendo cada cuota:
    var $sqlValues="";
    var $idCuotasTotal="";
    $cuotasMonto=$cuotasMonto.split(";");
    for(var $i=0; $i<$cuotasMonto.length; $i++){
        // obteniendo idCuotas y Monto
        var $idCuotaMontoActual=$cuotasMonto[$i];
        $idCuotaMontoActual=$idCuotaMontoActual.split("/");
        var $idCuota=$idCuotaMontoActual[0];
        var $monto=$idCuotaMontoActual[1];
        if($i>0){
           $sqlValues=$sqlValues+" , ";
           $idCuotasTotal=$idCuotasTotal+", ";
        }
        $sqlValues=$sqlValues+" ( '"+$idCuota+"', '"+$idAcuerdo+"', '"+$monto+"', '"+$idPersona+"', CURRENT_TIMESTAMP ) ";
        $idCuotasTotal=$idCuotasTotal+$idCuota;
    }
    var query="INSERT into Pago(idCuota, idAcuerdo, monto, idPersona, fechaEmision) values "+$sqlValues+";";
    ejecutarQUERY_MYSQL(query, [], res, funcionName, "false"); 
    var queryUpdateCronograma = "update Cronograma set estadoCuota='G' where idCuota in ("+$idCuotasTotal+")";
	ejecutarQUERY_MYSQL(queryUpdateCronograma, [], res, funcionName, "affectedRows");
};

/* @cancelarOrdenPago: cancela las ordenes de pago las cuotas enviada en los parametros (idCuotas)
*/
exports.cancelarOrdenPago = function(req, res, funcionName){ // FALTCOMP
	var $cuotas=req.query.idCuotas;
    var $idAcuerdo=req.query.idAcuerdo;
    // Cancela los pagos
    var queryUpdatePago="Update Pago set estado='C' where estado='G' and idCuota in ("+$cuotas+")";  
	ejecutarQUERY_MYSQL(queryUpdatePago, [], res, funcionName, "false");
	var queryUpdateCronograma = "Update Cronograma set estadoCuota = (case when pagosACuenta > 0 then 'S' else 'D' end) where idCuota in ("+$cuotas+")";
	ejecutarQUERY_MYSQL(queryUpdateCronograma, [], res, funcionName, "affectedRows");
};
exports.getPagosByAcuerdo = function(req, res, funcionName){
	var idAcuerdo = req.query.idAcuerdo;
	var estado = req.query.estado;
	var query = "call sp_getPagosByAcuerdo(?,?)";
	var arrayParametros = [idAcuerdo, estado];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};

/* @efectuarPagos: Registra el pago de las cuotas de una orden de pago.
*/
exports.efectuarPagos = function(req, res, funcionName){ // FALTCOMP
	var $idPagos = req.query.idPagos;
    $idPagos = $idPagos.split(";");
    var $pagosActualizar="";
    var $idPersonaPagador=req.query.idPersona; // id Persona que paga
    for(var $i=0; $i<$idPagos.length; $i++){
        var $elemento=$idPagos[$i];
        $elemento=$elemento.split("-");
        var $idPago = $elemento[0];
        var $monto = $elemento[1];
        var $idCuota = $elemento[2];            
        // Actualiza el pago a cuenta de la cuota 
        var queryUpdateCronograma = "Update Cronograma set pagosACuenta = pagosACuenta+"+$monto+", fechaPago=CURRENT_TIMESTAMP, idPersonaPago='"+$idPersonaPagador+"',  estadoCuota = (case when pagosACuenta+"+$monto+" < valorCuota  then 'S' else 'P' end ) where idCuota='"+$idCuota+"'";
        ejecutarQUERY_MYSQL(queryUpdateCronograma, [], res, funcionName, "false");
        if($i>0){
            $pagosActualizar=$pagosActualizar+" , ";
        }
        $pagosActualizar=$pagosActualizar+"'"+$idPago+"'";
    }       
    var queryUpdatePago = "Update Pago set estado='P' , fechaPago=CURRENT_TIMESTAMP where idPago in ("+$pagosActualizar+")";
    ejecutarQUERY_MYSQL(queryUpdatePago, [], res, funcionName, "affectedRows");
};

/* getPagosByidAcuerdo: Obtiene las cuotas con órdenes de pago de un acuerdo.
*/
exports.getPagosByidAcuerdo = function(req, res, funcionName){ // Obtiene las ordenes de pagos por id Acuerdo
	var idAcuerdo = req.query.idAcuerdo;
	var estado = req.query.estado;
	/* @sp_getPagosByidAcuerdo: Obtiene y retorna las cuotas de un acuerdo filtrándolas por su estado. 
		PARAMETROS:
			1) idAcuerdo
			2) Estado de las cuotas
	*/
	var query = "call sp_getPagosByidAcuerdo(?,?)";
	var arrayParametros = [idAcuerdo, estado];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};
exports.cancelarNotificacion = function(req, res, funcionName){ // 	FALTCOMP
	var $idNotificacion=req.query.idNotificacion;
    // cancela la misma notificacion
    var $query="Update Notificacion set estado='C' where idNotificacion='"+$idNotificacion+"'";
    var $queryCancelaTareas="Update Seguimiento set estado='C' where idNotificacion='"+$idNotificacion+"'";
    ejecutarQUERY_MYSQL($queryCancelaTareas, [], res, funcionName, function(res, resultados){
    	ejecutarQUERY_MYSQL($query, [], res, funcionName, "affectedRows");
    });
};

/* @getPeriodoActual: obtiene y retorna la informacion del periodo actual de AUTOSEGURO
*/
exports.getPeriodoActual = function(req, res, funcionName){
	var query = "call sp_getPeriodoActual()";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};

/* @insertarAsistencia: Registra la asistencia del usuario y actualiza su estado de conexion.
	Retorna la lista de usuarios conectados
*/
exports.insertarAsistencia = function(req, res, funcionName){ // FALTCOMP
	var esUsuarioTSIGO = req.query.esUsuarioTSIGO; 
    var idUsuario = req.query.idUsuario;
    var cerrarSesion="";
    if(req.query.cerrarSesion!=undefined){
        cerrarSesion=req.query.cerrarSesion;
    }
    if(esUsuarioTSIGO!="T"){ // No es un usuario de TSIGO
        var entrada = req.query.tipo; // OTIENE EL TIPO DE SESION ; INGRESO O SALIDA
        var queryInsert="INSERT INTO Asistencia(idUsuario, entSalida, fechaHora) VALUES('"+idUsuario+"','"+entrada+"', CURRENT_TIMESTAMP)";
        ejecutarQUERY_MYSQL(queryInsert,[], res, funcionName, function(res, resultados){
        	var idAsistenciaInsertada = resultados.insertId;
        	if(cerrarSesion=="s"){ // cierra el sistema y cambia el estado de usuario a N= No conectado
		    	var queryCerrar = "update UsuarioIntranet set estado='N' where idUsuario='"+idUsuario+"'";
		    	ejecutarQUERY_MYSQL(queryCerrar,[], res, funcionName,"false");
		    	enviarResponse(res, [idAsistenciaInsertada]);
		    }else{ // abre sistema , obtiene los usuarios conectados
		    	var queryAllConectados ="SELECT UName from UsuarioIntranet where estado='C' and idUsuario!='"+idUsuario+"' and idPerfil1!='2' and horaActualizacion>=DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 SECOND)";
		        ejecutarQUERY_MYSQL(queryAllConectados,[], res, funcionName);  
		     } // Inserta la asistencia de un usuario
        });
    }else{
    	var queryAllConectados ="SELECT UName from UsuarioIntranet where estado='C' and idUsuario!='"+idUsuario+"' and idPerfil1!='2' and horaActualizacion>=DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 SECOND)";
		ejecutarQUERY_MYSQL(queryAllConectados,[], res, funcionName);  
    }
};

/* @getOpcionesMenu: Obtiene las opciones permitidas al usuario segun sus 3 perfiles.
*/
exports.getOpcionesMenu = function(req, res, funcionName){
	var idPerfil1="";
	if(req.query.idPerfil1!=undefined){
		idPerfil1 = req.query.idPerfil1;
	}
	var idPerfil2="";
	if(req.query.idPerfil2!=undefined){
		idPerfil2 = req.query.idPerfil2;
	}
	var idPerfil3="";
	if(req.query.idPerfil3!=undefined){
		idPerfil3 = req.query.idPerfil3;
	}
	var query = "call sp_getOpcionesMenuXperfiles(?,?,?)";
	var arrayParametros = [idPerfil1, idPerfil2, idPerfil3];
	
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};

/* @getUsuariosConectados:  Obtiene y retorna la lista de usuarios conectados
*/
exports.getUsuariosConectados = function(req, res, funcionName){ // FALTCOMP
	var idUsuario = req.query.idUsuario;
	var queryAllConectados ="SELECT UName from UsuarioIntranet where estado='C' and idUsuario!='"+idUsuario+"' and idPerfil1!='2' and horaActualizacion>=DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 SECOND)";
	ejecutarQUERY_MYSQL(queryAllConectados,[], res, funcionName); 
};

/* @actualizarFechaConexion: Actualiza la fecha de conexion del usuario
*/
exports.actualizarFechaConexion = function(req, res, funcionName){
	var idUsuario = req.query.idUsuario;
	var query = "call sp_actualizaHoraUsuario(?)";
	var arrayParametros = [idUsuario];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};
exports.cambiarClaveExpirada = function(req, res, funcionName){
	var nuevaClave = req.query.nuevaClave;
	var idUsuario = req.query.idUsuario;
	var query = "call sp_cambiarClaveExpirada(?,?)";
	var arrayParametros = [idUsuario, nuevaClave];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
};
exports.getLocales = function(req, res, funcionName){
	var query = "call sp_getLocales()";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};
exports.getPerfiles = function(req, res, funcionName){
	var query = "call sp_getPerfiles()";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};
exports.insertarUsuario = function(req, res, funcionName){ // FALTA
	var $nombres = req.query.nombres;
    var $apellidos = req.query.apellidos;
    var $DNI = req.query.DNI;
    var $local = req.query.local;
    var $usuario = req.query.usuario;      
    var $perfil1 = req.query.perfil1;
    var $perfil2 = req.query.perfil2;
    var $perfil3 = req.query.perfil3;
    var $idArea = req.query.idArea;
    var $idUsuario = req.query.idUsuario;
    var $clave = req.query.clave;
    var $sql;
    if($idUsuario=="0"){ // Se insertará un nuevo Usuario
        $sql = "INSERT INTO UsuarioIntranet(UName, password, Nombres, Apellidos, DNI, idPerfil1, idPerfil2, idPerfil3, idLocal, idArea, fechaVigencia) "+
        "values('"+$usuario+"','"+$clave+"','"+$nombres+"','"+$apellidos+"','"+$DNI+"','"+$perfil1+"', '"+$perfil2+"', '"+$perfil3+"', '"+$local+"', '"+$idArea+"', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY))";        
    }else{ // se actualiza el usuario
        $sql = "Update UsuarioIntranet set UName='"+$usuario+"', password='"+$clave+"', Nombres='"+$nombres+"', Apellidos='"+$apellidos+"', DNI='"+$DNI+"', "+
            " idPerfil1='"+$perfil1+"', idPerfil2='"+$perfil2+"', idPerfil3='"+$perfil3+"', idLocal='"+$local+"', idArea='"+$idArea+"' where idUsuario='"+$idUsuario+"'";
    } 
    ejecutarQUERY_MYSQL($sql, [], res, funcionName, function(res, resultados) {
        if($idUsuario=="0"){
            enviarResponse(res, [resultados.insertId]);
        }else{
            enviarResponse(res, [resultados.affectedRows]);
        }
    });
};
exports.eliminarUsuario = function(req, res, funcionName){
	var idUsuario = req.query.idUsuario;
	var query = "call sp_eliminarUsuario(?,@)";
	var arrayParametros = [idUsuario];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
};
exports.registrarAccionUsuario = function(req, res, funcionName){
	var idUsuario = req.query.idUsuario;
	var descripcion = req.query.descripcion;
	var query = "call sp_registrarAccionUsuario(?,?,@)";
	var arrayParametros = [idUsuario, descripcion];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
};
exports.insertarPerfil = function(req, res, funcionName){
	var nombrePerfil = req.query.nombrePerfil;
	var query = "call sp_insertarPerfil(?)";
	var arrayParametros = [nombrePerfil];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
	  var idInsert=[resultados[0].idInsert];
	   enviarResponse(res, idInsert);
	});
};
exports.actualizarMenuXperfil = function(req, res, funcionName){ // FALTA
    var idPerfil=req.body.idPerfil;
	var query1 = "Delete from PerfilUsuario where idPerfil=?";
	var arrayParametros1 = [idPerfil];
	ejecutarQUERY_MYSQL(query1, arrayParametros1, res, funcionName, function(){
		var idPerfil=req.body.idPerfil;	
		var listaMenu=req.body.array;
    	var consulta="INSERT INTO PerfilUsuario(idPerfil, idMenu) values ";
    	var values="";
    	listaMenu=listaMenu.split(";");
	    for(var i=0; i<listaMenu.length; i++){
	    	if(i>0){
	    		values=values+", ";
	    	}
	    	values=values+"('"+idPerfil+"','"+listaMenu[i]+"')";
	    }
	    values=values+';';
	    var query = consulta+values;
		var arrayParametros = [];
	    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, 'affectedRows');
	});	
};
exports.getAllOpcionesUsadas = function(req, res, funcionName){ // FALTA
    var query = "SELECT Distinct(idMenu) FROM PerfilUsuario";
	ejecutarQUERY_MYSQL(query, [], res, funcionName);
};
exports.actualizarPerfil = function(req, res, funcionName){ // FALTA
	var $idPerfil=req.query.idPerfil;
    var $nombrePerfil = req.query.nombrePerfil;
    var $sql = "update Perfil set nombrePerfil='"+$nombrePerfil+"' where idPerfil='"+$idPerfil+"'";
    ejecutarQUERY_MYSQL($sql, [], res, funcionName, "affectedRows");
};
/**** TRAMITE DOCUMENTARIO ***************************/
/*@registrarExpediente: Registra un expediente, si el expediente es de tipo 4 o 5 (Solicitud por Incapacidad temporal o Invalidez Permanente) se registra un cita.
*/
exports.registrarExpediente = function(req, res, funcionName){ // FALTCOMP
	var startTime = new Date();
	console_log("ingrese a registro de expedientes");
	var $sql="";// query de la consulta
    var $idTipoExpediente = req.query.idTipoExpediente;
    var $codEvento = req.query.codEvento;
    var $idAgraviado = req.query.idAgraviado;
    var $idExpedientePrevio = req.query.idExpedientePrevio;
    var $nroFolios = req.query.nroFolios;
    var $observaciones = req.query.observaciones;
    var $nroDocRef = req.query.nroDocRef;
    var $idInstitucion = req.query.idInstitucion;
    if($idInstitucion==undefined){
        $idInstitucion=0;
    }
    var $diasRespuesta = req.query.diasRespuesta;
    var $fechaIngreso = req.query.fechaHoraTramite;
    var $idPersonaTramitante = req.query.idPersonaTramitante; // Persona que tramita
    if($idPersonaTramitante==0) { // Inserta Persona			
        var $nombres = req.query.nombres;
        var $apellidoPaterno = req.query.apellidoPaterno;
        var $apellidoMaterno = req.query.apellidoMaterno;
        var $dni = req.query.DNI;
        var $telefono = req.query.telef;
        var $direccion = req.query.direccion;
        var $email = req.query.email;
		if($nombres!=""){ // solo registrara si el campo nombres es diferente de vacio
			var $sqlInsertPersona = "Insert into Persona (nombres, apellidoPaterno, apellidoMaterno, nroDocumento, telefonoMovil, calle, email) select '"+$nombres+"', '"+$apellidoPaterno+"', '"+$apellidoMaterno+"', '"+$dni+"', '"+$telefono+"', '"+$direccion+"', '"+$email+"' ";
			ejecutarQUERY_MYSQL($sqlInsertPersona, [], res, funcionName, function(res, resultados){
			    $idPersonaTramitante = resultados.insertId;
			    $sql="Insert into Expediente (fechaIngreso, codEvento, codAgraviado, idExpedientePrevio, nroFolios, tipoExpediente, diasRespuesta, nroDocReferencia, idPersonaQPresenta, Observaciones, idInstitucion) "+
                    "select '"+$fechaIngreso+"', '"+$codEvento+"', '"+$idAgraviado+"', '"+$idExpedientePrevio+"', '"+$nroFolios+"', '"+$idTipoExpediente+"', '"+$diasRespuesta+"', '"+$nroDocRef+"', '"+$idPersonaTramitante+"', '"+$observaciones+"', '"+$idInstitucion+"'";
			    ejecutarQUERY_MYSQL($sql, [], res, funcionName, function(res, resultados){
			        var $idExpedienteRegistrado = resultados.insertId;
			        if($idTipoExpediente=='4' || $idTipoExpediente=='5'){ // genera cita
                        // Genera la cita:
                        var $fechaCita = req.query.fechaCita;
                        var $idMedico = req.query.idMedico;
                        var $codEvento = req.query.codEvento;
                        var $idAgraviado = req.query.idAgraviado;
                        var $comentario = req.query.comentario;
                        var $queryCita="Insert into Cita (idExpediente, codEvento, idAgraviado, fechaHora, idMedico, comentario) select '"+$idExpedienteRegistrado+"', '"+$codEvento+"', '"+$idAgraviado+"', '"+$fechaCita+"', '"+$idMedico+"', '"+$comentario+"'";
                        ejecutarQUERY_MYSQL($queryCita, [], res, funcionName, function(res, resultados){
                            var idCitaInsertada = resultados.insertId;
                            finalizarControl(startTime, "Registra el expediente : "+$idExpedienteRegistrado+" con cita (Registra persona tramitante)");
                            enviarResponse(res, [$idExpedienteRegistrado, idCitaInsertada]);
                        });
                    }else{
                        // sino, devolverá el id del expediente
                        finalizarControl(startTime, "Registra el expediente : "+$idExpedienteRegistrado+" sin cita (Registra persona tramitante)");
                        enviarResponse(res,[$idExpedienteRegistrado]);
                    }        
			    });
			});
		}else{// solo registra el expediente.
			$sql="Insert into Expediente (fechaIngreso, codEvento, codAgraviado, idExpedientePrevio, nroFolios, tipoExpediente, diasRespuesta, nroDocReferencia, idPersonaQPresenta, Observaciones, idInstitucion) "+
                    "select '"+$fechaIngreso+"', '"+$codEvento+"', '"+$idAgraviado+"', '"+$idExpedientePrevio+"', '"+$nroFolios+"', '"+$idTipoExpediente+"', '"+$diasRespuesta+"', '"+$nroDocRef+"', '"+$idPersonaTramitante+"', '"+$observaciones+"', '"+$idInstitucion+"'";
			ejecutarQUERY_MYSQL($sql, [], res, funcionName, function(res, resultados){
			    var $idExpedienteRegistrado = resultados.insertId;
			    if($idTipoExpediente=='4' || $idTipoExpediente=='5'){ // genera cita
                    // Genera la cita:
                    var $fechaCita = req.query.fechaCita;
                    var $idMedico = req.query.idMedico;
                    var $codEvento = req.query.codEvento;
                    var $idAgraviado = req.query.idAgraviado;
                    var $comentario = req.query.comentario;
                    var $queryCita="Insert into Cita (idExpediente, codEvento, idAgraviado, fechaHora, idMedico, comentario) select '"+$idExpedienteRegistrado+"', '"+$codEvento+"', '"+$idAgraviado+"', '"+$fechaCita+"', '"+$idMedico+"', '"+$comentario+"'";
                    ejecutarQUERY_MYSQL($queryCita, [], res, funcionName, function(res, resultados){
                        var idCitaInsertada = resultados.insertId;
                        finalizarControl(startTime, "Registra el expediente : "+$idExpedienteRegistrado+" con cita");
                        enviarResponse(res, [$idExpedienteRegistrado, idCitaInsertada]);
                    });
                }else{
                    // sino, devolverá el id del expediente
                    finalizarControl(startTime, "Registra el expediente : "+$idExpedienteRegistrado+" sin cita");
                    enviarResponse(res,[$idExpedienteRegistrado]);
                }        
			});
		}
    }else{ // Actualiza campos de la persona
        var $telefono = req.query.telef;
        var $direccion = req.query.direccion;
        var $email = req.query.email;
        var $sqlUpdatePersona = "Update Persona set calle='"+$direccion+"', telefonoMovil='"+$telefono+"', email='"+$email+"' where idPersona='"+$idPersonaTramitante+"'";
        ejecutarQUERY_MYSQL($sqlUpdatePersona, [], res, funcionName, "false");
        
		$sql="Insert into Expediente (fechaIngreso, codEvento, codAgraviado, idExpedientePrevio, nroFolios, tipoExpediente, diasRespuesta, nroDocReferencia, idPersonaQPresenta, Observaciones, idInstitucion) "+
            "select '"+$fechaIngreso+"', '"+$codEvento+"', '"+$idAgraviado+"', '"+$idExpedientePrevio+"', '"+$nroFolios+"', '"+$idTipoExpediente+"', '"+$diasRespuesta+"', '"+$nroDocRef+"', '"+$idPersonaTramitante+"', '"+$observaciones+"', '"+$idInstitucion+"'";
		ejecutarQUERY_MYSQL($sql, [], res, funcionName, function(res, resultados){
		    var $idExpedienteRegistrado = resultados.insertId;
		    if($idTipoExpediente=='4' || $idTipoExpediente=='5'){ // genera cita
                // Genera la cita:
                var $fechaCita = req.query.fechaCita;
                var $idMedico = req.query.idMedico;
                var $codEvento = req.query.codEvento;
                var $idAgraviado = req.query.idAgraviado;
                var $comentario = req.query.comentario;
                var $queryCita="Insert into Cita (idExpediente, codEvento, idAgraviado, fechaHora, idMedico, comentario) select '"+$idExpedienteRegistrado+"', '"+$codEvento+"', '"+$idAgraviado+"', '"+$fechaCita+"', '"+$idMedico+"', '"+$comentario+"'";
                ejecutarQUERY_MYSQL($queryCita, [], res, funcionName, function(res, resultados){
                    var idCitaInsertada = resultados.insertId;
                    finalizarControl(startTime, "Registra el expediente : "+$idExpedienteRegistrado+" con cita (Actualiza campos del tramitador)");
                    enviarResponse(res, [$idExpedienteRegistrado, idCitaInsertada]);
                });
            }else{
                // sino, devolverá el id del expediente
                finalizarControl(startTime, "Registra el expediente : "+$idExpedienteRegistrado+" sin cita (Actualiza campos del tramitador)");
                enviarResponse(res,[$idExpedienteRegistrado]);
            }        
		});
    }
};
exports.getAllExpedientesPrevios = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var query = "select LPAD(idExpediente,5,'0') as idExpediente from Expediente where codEvento=? order by idExpediente desc";
	var arrayParametros = [codEvento];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};

/* @getAllMedicos: Obtiene los registros de los medicos de la tabla MEDICO.
*/
exports.getAllMedicos = function(req, res, funcionName){ 
	var query = "select m.idMedico, m.idArea, CONCAT(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreMedico from Medico m "+
        "inner join Persona p on m.idPersona=p.idPersona";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};

/* @getAllAreas: Obtiene los registros de las áreas de la TABLA AREA
*/
exports.getAllAreas = function(req, res, funcionName){
	var query = "select idArea, Nombre, plantilla from Area";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};

/* @getAllUsuarios: Obtiene los registros de los usuarios de la TABLA UsuarioIntranet
*/
exports.getAllUsuarios = function(req, res, funcionName){
	var idUsuario= req.query.idUsuario;
	var query = "select idUsuario, concat(Nombres,' ',Apellidos) as nombreUsuario, idArea from UsuarioIntranet where idUsuario!=?";
	var arrayParametros = [idUsuario];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};

/* @guardarDerivacion: Registra un historial la primera vez que se ingreso el expediente. Caso contrario actualiza el historial asignando el area y usuario destino, asi como el estado de notificacion.
*/
exports.guardarDerivacion = function(req, res, funcionName){
	var $idAreaDestino = req.query.idAreaDestino;
    var $idUsuarioDestino = req.query.idUsuarioDestino;
    var $comentario = req.query.comentario;
    var $idExpediente = req.query.idExpediente;
    var $idUsuarioRemitente = req.query.idUsuarioRemitente;
    var $idAreaRemitente = req.query.idAreaRemitente;
    var $fechaIngreso = req.query.fechaIngreso;
    var $estado = req.query.estado;
    var $idHistorial = req.query.idHistorial;
    var $query = "";
    if($idHistorial=="0"){ // Inserta Historial
        $query="Insert into Historial (idExpediente, idUsuario, idArea, fechaIngreso, idAreaDestino, idUsuarioDestino, comentarios, estadoNotificacion) select '"+$idExpediente+"', '"+$idUsuarioRemitente+"', '"+$idAreaRemitente+"', '"+$fechaIngreso+"', '"+$idAreaDestino+"', '"+$idUsuarioDestino+"', '"+$comentario+"', '1' ";            
    }else{ // actualiza Historial que ya existe
        $query="Update Historial set idAreaDestino='"+$idAreaDestino+"', idUsuarioDestino='"+$idUsuarioDestino+"', comentarios='"+$comentario+"', estadoNotificacion='1', fechaNotificacion=CURRENT_TIMESTAMP  where idHistorial='"+$idHistorial+"'";
    }
    ejecutarQUERY_MYSQL($query, [], res, funcionName, function(res, resultados){
        var $queryActualizaExpediente = "Update Expediente set estado='"+$estado+"' where idExpediente='"+$idExpediente+"'";
        ejecutarQUERY_MYSQL($queryActualizaExpediente, [], res, funcionName, "false");
        enviarResponse(res, [resultados.affectedRows]);
    });
};

/* @getTramitesByidUsuario: Obtiene de la TABLA EXPEDIENTE los registros de los expedientes asignados al usuario logeado o a los usuarios de su área.
*/
exports.getTramitesByidUsuario = function(req, res, funcionName){
	var idUsuario = req.query.idUsuario;
	var idAreaUsuario = req.query.idAreaUsuario;
	var query = "call sp_getTramitesByidUsuario(?,?)";
	var arrayParametros = [idUsuario, idAreaUsuario];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

/*@confirmarTramite: cambia el estado de notificacion de un expediente a "recibido", 
	si el expediente ya no se encuentra en estado pendiente se marca el historial como el ultimo historial (finHistorial=1).
*/
exports.confirmarTramite = function(req, res, funcionName){
	var idExpediente = req.query.idExpediente;
	var idHistorial = req.query.idHistorial;
	var idUsuario = req.query.idUsuario;
	var idArea = req.query.idArea;
	var fechaIngreso = req.query.fechaIngreso;
	var estadoExpediente = req.query.estadoExpediente;
	var finHistorial = '0';
	if(estadoExpediente!='1'){ // si el expediente no esta en estado de proceso
        finHistorial='1'; // finaliza el historial
    }
	var query = "call sp_confirmarTramite(?,?,?,?,?,?,?,@)";
	var arrayParametros = [idHistorial, idExpediente, idUsuario, idArea, fechaIngreso, estadoExpediente, finHistorial];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
}
exports.getListaUsuarios = function(req, res, funcionName){ // FALTCOMP
	var query = "select u.idUsuario, concat(u.Nombres,' ',u.Apellidos) as nombreUsuario, u.Nombres, u.Apellidos, u.idArea, a.Nombre as nombreArea, u.idPerfil1, u.idPerfil2, u.idPerfil3, u.UName, u.password as pasx, u.DNI, u.idLocal, u.email from UsuarioIntranet u "+
        "inner join Area a on u.idArea=a.idArea ";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarArea = function(req, res, funcionName){
	var idArea = req.query.idArea;
	var nombre = req.query.nombre;
	var query = "call sp_guardarArea(?,?)";
	var arrayParametros = [idArea, nombre];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
	    enviarResponse(res, [resultados[0].resultado])
	});
}
exports.getExpedienteMasReciente = function(req, res, funcionName){
	var query = "call sp_getExpedienteMasReciente()";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

/* @getExpedientes: Realiza una busqueda de los expedientes (En estado Observado (estado=2) o todos los expedientes sin importar su estado) 
  filtrandolos por fecha, CAT, PLACA, Nro Expediente, DNI del tramitador, Nombre del Asociado, O nombre del agraviado.
*/
exports.getExpedientes = function(req, res, funcionName){
	var $tipoBusqueda=req.query.tipoBusqueda;
    var $queryWhere=" where ";
    if($tipoBusqueda=="F"){ // fecha del expediente                
        var $fechaInicio=req.query.fechaInicio;            
        var $fechaFin=req.query.fechaFin;
        if($fechaFin!=""){ // si se asigno una fecha de fin
            $fechaFin=$fechaFin+" 23:59:59";
            $queryWhere=$queryWhere+" e.fechaIngreso between '"+$fechaInicio+"' and '"+$fechaFin+"'";
        }else{
            var $fechaEnd=$fechaInicio+" 23:59:59";
            $queryWhere=$queryWhere+" e.fechaIngreso between '"+$fechaInicio+"' and '"+$fechaEnd+"'";
        }                  
    }else{// CAT o Placa
        var $codigo=req.query.codigo;
        var $campo="";
        if($tipoBusqueda=="exp"){
            $campo="e.idExpediente";
        }
        if($tipoBusqueda=="C"){ // cat
            $campo="ev.nroCAT";
        }
        if($tipoBusqueda=="D"){ // dni del que presenta
            $campo="pq.nroDocumento";
        }
        if($tipoBusqueda=="P"){
            $campo="c.placa";
        }
        switch ($tipoBusqueda) {
            case 'AS': // Asociado
                $queryWhere="where (concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) like '%"+$codigo+"%' ) or pa.razonSocial like '%"+$codigo+"%'";
                break;
            case 'AG': // Agraviado
                $queryWhere="where concat(pg.nombres,' ',pg.apellidoPaterno,' ',pg.apellidoMaterno) like '%"+$codigo+"%'";
                break;                
            default:
                $queryWhere=$queryWhere+$campo+"='"+$codigo+"'";                 
                break;
            }
        }
        if(req.query.soloPrevios!=undefined){
            if(req.query.soloPrevios=='T'){
				var $estados_a_Buscar = req.query.estados_a_Buscar;
                $queryWhere=$queryWhere+" and e.tipoExpediente in ("+$estados_a_Buscar+") and e.estado='2'";
            }
        }
        var $query="Select LPAD(e.idExpediente,5,'0') as idExpediente, e.tipoExpediente, e.estado, date_format (e.fechaIngreso, '%d/%m/%Y') as fechaExpediente, e.diasRespuesta, e.codAgraviado, e.nroFolios, nroDocReferencia, e.idInstitucion, e.Observaciones, LPAD(e.idExpedientePrevio,5,'0') as idExpedientePrevio, pq.idPersona as idPersonaTramitador, concat(pq.nombres,' ',pq.apellidoPaterno,' ',pq.apellidoMaterno) as personaQpresenta, pq.nombres as nombresTramitador, CONCAT(pq.apellidoPaterno,' ',pq.apellidoMaterno) as apellidosTramitador, pq.nroDocumento, pq.telefonoMovil, pq.email, pq.calle as direccion, "+
            "ev.codEvento, ev.nroCAT, c.placa, DATE_FORMAT (ev.fechaAccidente, '%d/%m/%Y') as fechaAccidente, concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, pa.tipoPersona, pa.razonSocial, concat(pg.nombres,' ',pg.apellidoPaterno,' ',pg.apellidoMaterno) as nombresAgraviado from Expediente e "+
            "left join Evento ev on e.codEvento=ev.codEvento "+
            "left join Cat c on ev.nroCAT = c.nroCAT "+
            "left join Asociado a on c.idAsociado=a.idAsociado "+
            "left join Persona pa on a.idPersona=pa.idPersona "+
            "left join Agraviado ag on e.codAgraviado=ag.codAgraviado "+
            "left join Persona pg on ag.idPersona = pg.idPersona "+
            "left join Persona pq on e.idPersonaQPresenta=pq.idPersona "+$queryWhere; 
            
        ejecutarQUERY_MYSQL($query, [], res, funcionName);
}

/* @getExpedientesPendientes: Obtiene y retorna los expedientes pendientes de recibir del usuario logeado.
*/
exports.getExpedientesPendientes = function(req, res, funcionName){ // // Obtiene solo expedientes en estado pendiente. Esto es utilizado en la cabecera del sistema
	var idUsuario = req.query.idUsuario;
	var query = "call sp_getExpedientesPendientes(?)";
	var arrayParametros = [idUsuario];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};

/* getHistorialByExpediente: Obtiene los registros de los historiales de un expediente
*/
exports.getHistorialByExpediente = function(req, res, funcionName){
	var idExpediente = req.query.idExpediente;
	var query = "call sp_getHistorialByExpediente(?)";
	var arrayParametros = [idExpediente];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};
exports.getcitas = function(req, res, funcionName){ // FALTCOMP
	var $tipoBusqueda=req.query.tipoBusqueda;
    var $queryWhere="";
    if($tipoBusqueda=="F"){ // fecha de cita               
        var $fechaInicio=req.query.fechaInicio;            
        var $fechaFin=req.query.fechaFin;
        if($fechaFin!=""){ // si se asigno una fecha de fin
            $fechaFin=$fechaFin+" 23:59:59";
            $queryWhere=" where c.fechaHora between '"+$fechaInicio+"' and '"+$fechaFin+"'";
        }else{
            var $fechaEnd=$fechaInicio+" 23:59:59";
            $queryWhere=" where c.fechaHora between '"+$fechaInicio+"' and '"+$fechaEnd+"'";
        }                  
    }else{            
        var $codigo=req.query.codigo;
        var $campo="";
        if($tipoBusqueda=="E"){
            $campo="c.idExpediente";
        }
        if($tipoBusqueda=="C"){
            $campo="ev.nroCAT";
        }
        if($tipoBusqueda=="P"){
            $campo="ca.placa";
        }
        $queryWhere="where "+$campo+"='"+$codigo+"'";
    }	
    var $query="Select c.idCita, DATE_FORMAT (c.fechaHora, '%d/%m/%Y %T') fechaCita, c.estado, concat(pag.nombres,' ',pag.apellidoPaterno,' ',pag.apellidoMaterno) as nombresAgraviado, "+
        "LPAD(c.idExpediente,5,'0') as idExpediente, e.tipoExpediente, ev.nroCAT, e.codEvento from Cita c "+
        "inner join Agraviado ag on c.idAgraviado=ag.codAgraviado "+
        "inner join Persona pag on ag.idPersona=pag.idPersona "+
        "inner join Expediente e on c.idExpediente=e.idExpediente "+
        "inner join Evento ev on e.codEvento=ev.codEvento "+
        "inner join Cat ca on ev.nroCAT=ca.nroCAT "+$queryWhere+" order by c.fechaHora desc";
	
	// parametros de la paginacion
	var page = req.query.page;
	var registrosxpagina = req.query.registrosxpagina;
	var cantPaginas = req.query.cantPaginas;
	
	$query = agregarLimit(page, registrosxpagina, $query);
    ejecutarQUERY_MYSQL($query, [], res, funcionName, function(res, resultados){
		if(cantPaginas==0){
			var $queryCantidad = "Select count(*) as cantidad from Cita c "+
				"inner join Agraviado ag on c.idAgraviado=ag.codAgraviado "+
				"inner join Persona pag on ag.idPersona=pag.idPersona "+
				"inner join Expediente e on c.idExpediente=e.idExpediente "+
				"inner join Evento ev on e.codEvento=ev.codEvento "+
				"inner join Cat ca on ev.nroCAT=ca.nroCAT "+$queryWhere;
			
			ejecutarQUERY_MYSQL_Extra(resultados, $queryCantidad, [], res, funcionName, function(res, rows, resultados){
				var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
				if(resultados.length>0){
					resultados[0].numeroPaginas = cantidadPag;					
				}
				enviarResponse(res, resultados);
			})
		}else{
			enviarResponse(res, resultados);
		}
	});
}
exports.mantenimientoCita = function(req, res, funcionName){
	var idCita = req.query.idCita;
	var estado = req.query.estado;
	var comentario = req.query.comentario;
	var query = "call sp_mantenimientoCita(?,?,?,@)";
	var arrayParametros = [idCita, estado, comentario];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
}

/* @actualizarInforme: actualiza el informe de un expediente
*/
exports.actualizarInforme = function(req, res, funcionName){
	var informe = req.body.informe;
	var idHistorial = req.body.idHistorial;
	var query = "call sp_actualizarInforme(?,?,@)";
	var arrayParametros = [idHistorial, informe];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
}

/* @actualizarPlantilla: Actualiza la plantilla predeterminada de un área.
*/
exports.actualizarPlantilla = function(req, res, funcionName){
	var idArea = req.body.idArea;
	var plantilla = req.body.plantilla;
	var query = "call sp_actualizarPlantilla(?,?,@)";
	var arrayParametros = [idArea, plantilla];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
}
exports.enviarInforme = function(req, res, funcionName){ // STANDBY
	/*var = req.query.;
	var query = "call ";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);*/
}

/* @getVariablesGlobales: obtiene y retorna las variables globales del modulo TRAMITE DOCUMENTARIO: 
	1) Usuarios a NOTIFICAR
	2) Tiempo critico para responder expedientes
*/
exports.getVariablesGlobales = function(req, res, funcionName){
	var query = "call sp_getVariablesGlobales()";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.actualizarVariablesGlobales = function(req, res, funcionName){
	var idUsuarioAutorizado1 = req.query.idUsuarioAutorizado1;
	var idUsuarioAutorizado2 = req.query.idUsuarioAutorizado2;
	var idUsuarioAutorizado3 = req.query.idUsuarioAutorizado3;
	var idUsuarioNotificar1 = req.query.idUsuarioNotificar1;
	var idUsuarioNotificar2 = req.query.idUsuarioNotificar2;
	var correo1 = req.query.correo1;
	var correo2 = req.query.correo2;
	var correo3 = req.query.correo3;
	var correo4 = req.query.correo4;
	var correo5 = req.query.correo5;
	var diasAnticipacion = req.query.diasAnticipacion;
	var textAprobado = req.query.textAprobado;
	var textObservado = req.query.textObservado;
	var query = "call sp_actualizarVariablesGlobales(?,?,?,?,?,?,?,?,?,?,?,?,?,@)";
	var arrayParametros = [idUsuarioAutorizado1, idUsuarioAutorizado2, idUsuarioAutorizado3, idUsuarioNotificar1, idUsuarioNotificar2, correo1,
	correo2, correo3, correo4, correo5, diasAnticipacion, textAprobado, textObservado];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
    	var filasAfectadas=[resultados[0].filasAfectadas];
    	enviarResponse(res, filasAfectadas);
    });
}

/* @actualizarExpediente: Actualiza la informacion de un expediente en la TABLA EXPEDIENTE E HISTORIAL
*/
exports.actualizarExpediente = function(req, res, funcionName){ // FALTCOMP
	// Persona tramitador
    var $cantidadRegistros=0;
    var $idPersonaTramitador = req.query.idPersonaTramitador;
    var $nombres = req.query.nombres;
    var $apellidos = req.query.apellidos;
    var $dni = req.query.dni;
    var $telef = req.query.telef;
    var $direccion = req.query.direccion;
    var $correo = req.query.correo;
    var $query = "update Persona set nombres = '"+$nombres+"', apellidoPaterno='"+$apellidos+"', apellidoMaterno='', "+
        "nroDocumento='"+$dni+"', telefonoMovil='"+$telef+"', calle='"+$direccion+"', email='"+$correo+"' where idPersona='"+$idPersonaTramitador+"'";
    ejecutarQUERY_MYSQL($query, [], res, funcionName, function(res, resultados){
        $cantidadRegistros++;
        // expediente
        var $idExpediente = req.query.idExpediente;
        var $idFechaIngreso = req.query.idFechaIngreso;
        var $estadoExpediente = req.query.estadoExpediente;
        var $query2 = "Update Expediente set estado='"+$estadoExpediente+"', fechaIngreso='"+$idFechaIngreso+"' where idExpediente='"+$idExpediente+"'";
        ejecutarQUERY_MYSQL($query2, [], res, funcionName, function(res, resultados){
            $cantidadRegistros++;
            // historial
            var $historial = req.query.historial;
            $historial = $historial.split("/");
            for(var $i=0; $i<$historial.length; $i++){
                var $item=$historial[$i].split("_");
                var $idHistorial = $item[0];
                var $fechaInicio = $item[1];
                var $fechaFin = $item[2];
                var $setFechaFin="";
                if($fechaFin!=""){
                    $setFechaFin=", fechaSalida='"+$fechaFin+"' ";
                }
                var $query3 = "Update Historial set fechaIngreso='"+$fechaInicio+"'"+$setFechaFin+" where idHistorial='"+$idHistorial+"'";
                ejecutarQUERY_MYSQL($query3, [], res, funcionName, "false");
            }
            $cantidadRegistros++;
            enviarResponse(res, [$cantidadRegistros]);
        });
    });
}
/*@getInstituciones: Obtiene los registros de las instituciones.
*/
exports.getInstituciones = function(req, res, funcionName){
	var query = "call sp_getInstituciones()";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.registrarInstitucion = function(req, res, funcionName){
	var nombre = req.query.nombre;
	var direccion = req.query.direccion;
	var telef = req.query.telef;
	var contacto = req.query.contacto;
	var query = "call sp_registrarInstitucion(?,?,?,?)";
	var arrayParametros = [nombre, direccion, telef, contacto];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

/* Obtiene los textos APROBADO Y OBSERVADO de la TABLA CONSTANTESGENERALES
*/
exports.getTextEstado = function(req, res, funcionName){
	var query = "call sp_getTextEstado()";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

/* @getExpedientesCriticos: Obtiene y retorna los expediente con tiempo critico para responder asignados al usuario logeado.
*/
exports.getExpedientesCriticos = function(req, res, funcionName){ // FALTCOMP
	var tiempoCritico=req.query.tiempoCritico;
    var aNotificar = req.query.esUsuarioAnotificar;
    var whereCondicion=" and h.estadoNotificacion!='2'"; // Lo que esten pendientes de recibir o por derivar
    if(aNotificar!="T"){ // tiene un id de Usuario
       whereCondicion=" and ((h.idUsuarioDestino='"+aNotificar+"' and h.estadoNotificacion='1') or (h.idUsuario='"+aNotificar+"' and h.estadoNotificacion='0'))";
    }
    var query="Select LPAD(e.idExpediente,5,'0') as idExpediente, CONCAT(DATE_FORMAT (e.fechaIngreso, '%d/%m/%Y'),' ',DATE_FORMAT (e.fechaIngreso, '%T')) as fechaIngreso, h.estadoNotificacion, "+
        "Aorigen.Nombre as areaOrigen, Adestino.Nombre as areaDestino, CONCAT(uo.Nombres,' ',uo.Apellidos) as usuarioOrigen, CONCAT(ud.Nombres,' ',ud.Apellidos) as usuarioDestino, e.diasRespuesta, e.estado from Expediente e "+
        "inner join Historial h on e.idExpediente = h.idExpediente "+
        "inner join Area Aorigen on h.idArea=Aorigen.idArea "+
        "left join Area Adestino on h.idAreaDestino=Adestino.idArea "+
        "inner join UsuarioIntranet uo on h.idUsuario = uo.idUsuario "+
        "left join UsuarioIntranet ud on h.idUsuarioDestino = ud.idUsuario "+
        "where CURRENT_TIMESTAMP >= DATE_SUB(DATE_ADD(h.fechaIngreso, INTERVAL e.diasRespuesta DAY), INTERVAL "+tiempoCritico+" DAY) and e.estado='1'"+whereCondicion;
	ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.eliminarArea=function(req, res, funcionName){
    var $idArea=req.query.idArea;
    var $query="Call sp_eliminarArea(?,@)";
    ejecutarQUERY_MYSQL($query, [$idArea], res, funcionName, function(res, resultados) {
        enviarResponse(res, [resultados[0].filasAfectadas]);
    })
}
exports.actualizarMenuXML = function(req, res, funcionName){
	/*
		OBJETIVO: actualiza el archivo menu xml, con las nuevas opciones
		DATOS RPTA: Devuelve un JSON con letra T = TRUE, indicando que las opciones fueron actualizadas
	*/
	var listaMenu = req.body.array;
	var dataCuerpo="";
    var saltoLinea="\r\n";
    listaMenu = listaMenu.split(';');
    for(var i=0; i<listaMenu.length; i++){
    	var opcion = listaMenu[i].split("-");
    	dataCuerpo = dataCuerpo+saltoLinea+
    	"<menu>"+saltoLinea+
        "<idMenu>"+opcion[0]+"</idMenu>"+saltoLinea+
        "<nombreMenu>"+opcion[1]+"</nombreMenu>"+saltoLinea+
        "<hijo>"+opcion[2]+"</hijo>"+saltoLinea+
        "<padre>"+opcion[3]+"</padre>"+saltoLinea+
        "<href>"+opcion[4]+"</href>"+saltoLinea+
        "<categoria>"+opcion[5]+"</categoria>"+saltoLinea+
        "</menu>";
    }
    var contentXML='<?xml version="1.0" encoding="utf-8"?>'+"\r\n"+'<rss>'+"\r\n"+'<menucompleto>'+dataCuerpo+"\r\n"+'</menucompleto>'+"\r\n"+'</rss>';
	var ruta_archivo = "./www/xml/menu.xml"; 
	fs.writeFile(ruta_archivo, contentXML, function(err) {
	    if(err){
	        emitirError(res, err, funcionName);
	    }
	    else{
	        var rows=["T"];
	        enviarResponse(res, rows);
	    }
	});
}
exports.getUltimaFechaEvento=function(req, res, funcionName){
    var query = "Select date_format(fechaAccidente, '%Y-%m-%d %T') as fecha from Evento order by fechaAccidente desc limit 1";
    ejecutarQUERY_MYSQL(query, [], res, funcionName, function(res, resultados){
        var fecha=resultados[0].fecha;
        console_log("ultima fecha: "+fecha);
        enviarResponse(res, resultados)
    });
}

/* eventoPDF: Genera Doc Pdf para cada Notificacion registrada
*/
exports.eventoPDF = function(req, res, funcionName){
    //Genera informacion HTML
    // recibe parámetros
    //*** DATOS ENVIADOS
    var $codEvento=req.query.codEvento;
    var $destinatario=req.query.destinatario; // nombre del destinatario
    var $direccionDestinatario=req.query.direccionDestinatario; // direccion del destinatario
    var $placa=req.query.placa; // placa
    var $fechaAccidente=req.query.fechaAccidente;
    var $horasAccidente=req.query.horasAccidente;
    var $lugarAccidente=req.query.lugarAccidente;
    var $nombrechofer=req.query.nombrechofer;
    var $dnichofer=req.query.dnichofer;
    var $fechaevento=req.query.fechaevento;
    var $nroCAT=req.query.nroCAT;
    var $causal1 = req.query.causal1;
    var $causal2 = req.query.causal2;
    var $distritoEvento=req.query.distritoEvento;
    var $idNotificacion = req.query.idNotificacion;
    var $fechaImpresion = req.query.fechaImpresion;
    $fechaImpresion = $fechaImpresion.split("/");
    var $mes=$fechaImpresion[1]-1;
    var $dia=$fechaImpresion[0];
    var $año=$fechaImpresion[2];
    var $arrayMes=["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    var $fechaImpresion="Lima, "+$dia+" de "+$arrayMes[$mes]+" del "+$año;
    
    // fecha Momentanea:
    /*$fechaImpresion="Lima,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";*/
    
    // obtiendo fecha de accidente en cadena:
    $fechaAccidente=$fechaAccidente.split("/");
    var $day=$fechaAccidente[0];
    var $month=$fechaAccidente[1]-1;
    var $year=$fechaAccidente[2];
    var $fechaAccidente=$day+" de "+$arrayMes[$month]+" del "+$year;
    
    /// Obteniendo hora accidente:
    $horasAccidente=$horasAccidente.split(":");
    var $tipo="am.";
    var $hour=$horasAccidente[0];
    var $minutes=$horasAccidente[1];
    if($hour>12){
        $tipo="pm.";
        $hour=$hour-12;    
    }
    $horasAccidente=$hour+":"+$minutes+" "+$tipo;
    var $ancho="575px";
    // OBTENIENDO AGRAVIADOS Y SUS SINTOMAS
    var $getAgraviados=""; // contiene los agraviados
    var $tablaGastos="";
    var $filasGastos="";
    // Busca los gastos
    var $gastoTotal=0;
    var $trsCausales="";
    
    var $queryAgraviados ="select concat(p.nombres,' ', p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado, a.diagnostico from Agraviado a "+
        "inner join Persona p on a.idPersona=p.idPersona where a.codEvento=?";
    ejecutarQUERY_MYSQL($queryAgraviados, [$codEvento], res, funcionName, function(res, resultados){
        for(var $i=0; $i<resultados.length; $i++){
            if($i==0){
                $getAgraviados=$getAgraviados+"<br><p style='text-align:justify; margin-top:15px;' >En este accidente resultaron agraviados; ";
            }
            if($i>0){
                $getAgraviados=$getAgraviados+", ";
            }
            $getAgraviados=$getAgraviados+resultados[$i].nombreAgraviado;
        }
        $getAgraviados=$getAgraviados+"</p>";
        
        var $queryGastos="select g.idTipoGasto, sum(g.monto) as montoGasto, t.descripcion from Gasto g "+
            " inner join TipoGasto t on g.idTipoGasto=t.idTipoGasto where g.codEvento=? group by g.idTipoGasto, t.descripcion;";
            
        ejecutarQUERY_MYSQL($queryGastos, [$codEvento], res, funcionName, function(res, resultados){
            for(var i=0; i<resultados.length; i++){
                $gastoTotal=$gastoTotal+resultados[i].montoGasto;
                $filasGastos=$filasGastos+
                    "<tr style='height:19px; vertical-align:middle;'>"+
                    "<td style='height:19px; vertical-align:middle; text-align:right;'>"+resultados[i].descripcion+" : </td>"+
                    "<td style='text-align:left;'> S/."+number_format(resultados[i].montoGasto, 2, '.', ',')+"</td></tr>";
            }
            $filasGastos=$filasGastos+
                "<tr style='height:19px; vertical-align:middle;'>"+
                    "<td style='height:19px; vertical-align:middle; text-align:right;'>TOTAL : </td>"+
                    "<td style='text-align:left;'> S/."+number_format($gastoTotal, 2, '.', ',')+"</td>"+
                "</tr>"; 
            if($filasGastos!=""){
                $tablaGastos="<br><br><table style='width:350px; font-size:10.5px; margin-left:20px;'>"+
                    "<col style='width:50%'>"+
                    "<col style='width:50%'>"+
                    $filasGastos+"</table>";
            }
            if($causal1!="" || $causal2!=""){ // si al menos existe un causal
                var $cont=0;
                if($causal1!=""){
                    $cont++;
                    $trsCausales=$trsCausales+
                    "<tr style='height:22px; vertical-align:middle;' >"+
                        "<td style='text-align:left; height:22px;'>"+$cont+")</td>"+
                        "<td>"+$causal1+"</td>"+
                    "</tr>";
                }
                if($causal2!="" && $causal1!=$causal2){
                    $cont++;
                    $trsCausales=$trsCausales+
                    "<tr style='height:22px; vertical-align:middle;' >"+
                        "<td style='text-align:left; height:22px;'>"+$cont+")</td>"+
                        "<td>"+$causal2+"</td>"+
                    "</tr>";
                }
            }
            // Obteniendo tabla causales
            var $tablaCausales="";
            if($trsCausales!=""){
                $tablaCausales="<br><br><table style='width:550px; font-size:10.5px; margin-left:20px;'>"+
                    "<col style='width:5%'>"+
                    "<col style='width:90%'>"+
                        $trsCausales+
                    "</table>";    
            }
            var footer="<div style='width:"+$ancho+"; margin:auto; font-size:8px;'>"+                       
                "<br>"+ 
                "<hr>"+
                "<div style='width:456px; font-size:7px; font-family:Arial; line-height:8.5px; float:left; margin-top:-19px;'>"+
                    "<br>"+
                    "<br>"+
                    "<br>"+ 
                    "(1)Dicho monto podrá ir incrementando de acuerdo a los gastos efectuados, según requerimiento del caso."+
                    "<br>"+
                    "(2) Decreto Supremo Nro. 040-2006-MTC"+
                    "<br>"+
                    "Artículo 36.- Derecho de repetición"+
                    "<br>"+
                    "La AFOCAT que pagó las indemnizaciones previstas en este Reglamento, podrá repetir lo pagado:"+
                    "<br>"+
                    "36.1. De quien (es) sea (n) civilmente responsable (s) del accidente, incluyendo al miembro titular del CAT, "+
                    "cuando por su parte hubiere mediado dolo o culpa inexcusable en la causa del accidente. Se considera que existe culpa inexcusable "+
                    "en los casos en los que el titular del CAT hubiere permitido la conducción del vehículo a:"+
                    "<br>a) Menores de edad."+
                    "<br>b) Personas a las que no se les haya otorgado licencia de conducir o que, teniéndola, no la faculte a conducir el vehículo coberturado."+
                    "<br>c) Personas en estado de ebriedad, bajo el efecto de drogas o en situación de grave perturbación de sus facultades físicas o mentales."+
                    "<br>"+$codEvento+       
                "</div>";
            "</div>"; 
                
            var body=
                "<html>"+
                  "<head>"+
                    "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'>"+
                  "</head>"+
                "<body style='padding-top:14px;'>"+
                    "<div id ='cuerpo' style='margin:auto; font-family:Arial; width:"+$ancho+"; text-align:justify; margin-top:5px;'>"+
                        "<div id='nroNotificacion' style='font-size:18px; font-weight:bold; text-align:right; margin-top:15px;'>"+
                           "Notificación N° "+$idNotificacion+
                        "</div><br>"+
                        "<div id='Titulo' style='font-size:19px; font-weight:bold; text-align:center; margin-top:13px;'>"+
                            "<u>AVISO COBRANZA PRE JUDICIAL</u>"+
                        "</div>"+
                        "<div id='fechaImpresion' style='font-size:12px; text-align:right; margin-top:10px;' >"+
                            $fechaImpresion+
                        "</div>"+
                        "<div id='cabecera1' style='width:"+$ancho+"; font-size:12px; margin-top:20px; margin-bottom:17px;'>"+
                            "<table style='width:"+$ancho+"; font-size:11px;'>"+
                                "<col style='width:30%'>"+
                                "<col style='width:3%'>"+
                                "<col style='width:67%'>"+
                                "<tr style='height:24px; vertical-align:middle;'>"+
                                    "<td style='text-align:left; height:24px;'>DESTINATARIO</td>"+
                                    "<td>:</td>"+
                                    "<td>"+$destinatario+"</td>"+
                                "</tr>"+
                                "<tr style='height:24px; vertical-align:middle;'>"+
                                    "<td style='text-align:left; height:24px;'>DOMICILIO</td>"+
                                    "<td>:</td>"+
                                    "<td>"+$direccionDestinatario+"</td>"+
                                "</tr>"+
                                "<tr style='height:24px; vertical-align:middle;'>"+
                                    "<td style='text-align:left; height:24px;'>CITADO</td>"+
                                    "<td>:</td>"+
                                    "<td><b><u>Dentro de las 48 horas de recibida la notificación</u></b></td>"+
                                "</tr>"+
                                "<tr style='height:24px; vertical-align:middle;'>"+
                                    "<td style='text-align:left; height:24px;'>HORAS</td>"+
                                    "<td>:</td>"+
                                    "<td><b><u>9:00 AM – 4:00 PM</u></b></td>"+
                                "</tr>"+
                            "</table>"+
                        "</div>"+
                        "<hr>"+
                        "<div style='font-size:10.5px; width:"+$ancho+"; height:10px; font-family:Arial; text-align:justify; line-height:18.5px; margin-top:12px;'>"+
                        "Me dirijo a usted, para comunicarle que su vehículo con placa "+$placa+", con CAT Nº "+$nroCAT+", participó en un accidente de tránsito el día "+$fechaAccidente+" a horas "+$horasAccidente+","+ 
                        "en "+$lugarAccidente+" del distrito de "+$distritoEvento+"."+ 
                        $getAgraviados+                
                        "<p style='text-align:justify;' >"+
                        "AUTOSEGURO como institución responsable de asegurar los daños personales ocasionados por su vehículo, asumió la cobertura de los gastos, "+
                        "que a la fecha ascienden a : "+
                        $tablaGastos+
                        "</p>"+
                        "Al momento del accidente el conductor del vehículo, el señor "+$nombrechofer+" Identificado con DNI Nº "+$dnichofer+", "+
                        "incurrió en la(s) siguiente(s) CAUSAL(ES) DE REPETICIÓN:"+
                        $tablaCausales+
                        "<br>"+
                        "En tal situación, la ley nos obliga realizar acciones administrativas y judiciales para exigir la devolución de todos los gastos realizados, "+
                        "por lo que en su condición de propietario y/o conductor y/o asociado, está obligado devolver dicho monto."+
                        "<br>"+
                        "<br>"+
                        "Estando a lo expuesto se le CITA, a fin de apersonarse a la oficina de AUTOSEGURO – AFOCAT ubicado en <u style='font-weight:bold;'>Av. Brasil 1124 Pueblo Libre</u> "+
                        "dentro de las 48 horas recibida la notificación para llegar a un Acuerdo Conciliatorio de la deuda que mantiene con nuestra institución."+
                        "</div>"+
                    "</div>"+
                "</body>"+
                "</html>";
               generatePDF(body, footer, res, "246px");
        })
    })     
}

/*@docPDF: Genera reporte PDF para cronograma de cuotas pendientes/Estado de cuenta de las cuotas / Orden de Pago / Pago de cuotas.
*/
exports.docPDF=function(req, res, funcionName){
    // recibe parámetros
    var $numModulo=req.query.num;
    console_log("numero Modulo: "+$numModulo);
    var $idAcuerdo = req.query.idAcd;
    var $fechaAcuerdo = req.query.fecAcd;
    var $deudaAcuerdo = req.query.deuAcd;
    var $codEvento = req.query.codEve;
    var $fechaEvento = req.query.fecEve;
    var $descripcionEvento = req.query.desEve;
    var $nroCAT = req.query.nroCAT;
    var $asociado = req.query.asoc;
    var $placa = req.query.placa;
        //$responsables = req.query.resp;
    var $titulo=""; // titulo general del documento
    var $parteUltima="";
    var $fechaHoy=req.query.fecha_Emision;
    var width=640;
    var $cabecera3="<hr>"+
                "<table style='width:"+width+"px;'>"+
                    "<col style='width:10%'>"+
                    "<col style='width:34%'>"+
                    "<col style='width:10%'>"+
                    "<col style='width:7%'>"+
                    "<col style='width:8%'>"+
                    "<col style='width:10%'>"+
                    "<col style='width:10%'>"+
                    "<col style='width:11%'>"+
                    "<tr style='font-size:9.5px; height:30px; vertical-align:middle;'>"+
                        "<td style='font-weight:bold; text-align:right;'>Asociado :</td>"+
                        "<td>"+$asociado+"</td>"+
                        "<td style='font-weight:bold; text-align:right;'>Nro CAT :</td>"+
                        "<td>"+$nroCAT+"</td>"+
                        "<td style='font-weight:bold; text-align:right;'>Placa :</td>"+
                        "<td>"+$placa+"</td>"+
                        "<td style='font-weight:bold; text-align:right;'>Emision :</td>"+
                        "<td>"+$fechaHoy+"</td>"+
                    "</tr>"+
                "</table>"+
            "<hr>";
    switch ($numModulo) {
        case "1":
            $titulo="CRONOGRAMA DE PAGOS"; 
            console_log("titulo: "+$titulo);
            var $totalCronograma=0;
            var $filasTabla="";
            var $saldo;
            var query = "select c.nroCuota, DATE_FORMAT(c.fechaApagar, '%d/%m/%Y') as fechaVencimiento, c.valorCuota, c.pagosACuenta as montoPagado  from Cronograma c "+
                "where c.idAcuerdo=? and c.estadoCuota in ('D', 'S', 'G')";
            ejecutarQUERY_MYSQL(query, [$idAcuerdo], res, funcionName, function(res, resultados){
                console_log("encuentra las cuotas");
                for(var i=0; i<resultados.length; i++){
                    $saldo=resultados[i].valorCuota-resultados[i].montoPagado;
                    $totalCronograma=$totalCronograma+$saldo;
                    $filasTabla=$filasTabla+"<tr style='background-color:#FAFAFA; font-size:9.5px; height:30px; vertical-align:middle;'>"+
                    "<td style='text-align:center; height:30px;'>"+resultados[i].nroCuota+"</td>"+
                    "<td style='text-align:center;'>"+resultados[i].fechaVencimiento+"</td>"+
                    "<td style='text-align:center;'>S/. "+resultados[i].valorCuota+"</td>"+
                    "<td style='text-align:center;'>S/. "+number_format($saldo, 2, '.','')+"</td>"+
                    "</tr>";
                }
                $parteUltima="<!-- RESULTADO FINAL -->"+
                "<br>"+
                "<table style='margin:auto; width:450px; border-width:1px; border-style:solid; border-color:gray;'>"+
                "<col style='width:15%;'>"+
                "<col style='width:25%;'>"+
                "<col style='width:30%;'>"+
                "<col style='width:30%;'>"+
                    "<tr style='background-color:#4485A6; color:white; font-size:10.5px; height:32px; vertical-align:middle;'>"+
                        "<th style='text-align:center; height:30px;'>Nro Cuota</th>"+
                        "<th style='text-align:center;'>Fecha Venc.</th>"+
                        "<th style='text-align:center;'>Monto</th>"+
                        "<th style='text-align:center;'>Saldo</th>"+
                    "</tr>"+
                    $filasTabla+
                    "</table>"+
                    "<table style='margin:auto; width:450px;'>"+
                    "<col style='width:70%;'>"+
                    "<col style='width:30%;'>"+
                    "<tr style='font-size:10.5px; font-weight:bold; height:30px; vertical-align:middle; border-width:1px; border-style:solid; border-color:gray;'>"+
                    "<td style='text-align:right; height:30px;'>TOTAL : </td>"+
                    "<td style='text-align:center;'>S/. "+number_format($totalCronograma, 2, '.', '')+"</td>"+
                    "</tr>"+
                "</table>";
                executePDF($titulo, $idAcuerdo, $fechaAcuerdo, $deudaAcuerdo, $codEvento, $fechaEvento, $descripcionEvento, $cabecera3, $parteUltima, res);
            });
            break;
        case "2":
            $titulo="ESTADOS DE CUENTA";
            var $totalSaldo=0;
            var $deuda=0;
            var $montoTotalPagado=0;
            var $filasTabla="";
            var query = "select c.nroCuota, c.estadoCuota, DATE_FORMAT (c.fechaApagar, '%d/%m/%Y') as fechaVencimiento, c.valorCuota, c.pagosACuenta as montoPagado, DATE_FORMAT (c.fechaPago, '%d/%m/%Y') as ultimaFechaPago "+
                "from Cronograma c where c.idAcuerdo=?";
            ejecutarQUERY_MYSQL(query, [$idAcuerdo], res, funcionName, function(res, resultados){
                for(var y=0; y<resultados.length;y++){
                    $saldo=resultados[y].valorCuota-resultados[y].montoPagado;
                    $totalSaldo=$totalSaldo+$saldo;
                    $deuda=$deuda+resultados[y].valorCuota;
                    $montoTotalPagado=$montoTotalPagado+resultados[y].montoPagado;
                    var $estado;
                    switch (resultados[y].estadoCuota) {
                        case 'D':
                            $estado='Pendiente';
                            break;
                        case 'P':
                            $estado='Pagado';
                            break;
                        case 'S':
                            $estado='Saldo Pend.';
                            break;
                        case 'G':
                            $estado='Orden de Pago';
                            break;
                    }
                    var $ultimaFechaPago=resultados[y].ultimaFechaPago;
                    if($ultimaFechaPago==''){
                        $ultimaFechaPago=="-------";
                    }
                    $filasTabla=$filasTabla+"<tr style='background-color:#FAFAFA; font-size:9.5px; height:30px; vertical-align:middle;'>"+
                    "<td style='text-align:center; height:30px;'>"+resultados[y].nroCuota+"</td>"+
                    "<td style='text-align:center;'>"+$estado+"</td>"+
                    "<td style='text-align:center;'>"+resultados[y].fechaVencimiento+"</td>"+
                    "<td style='text-align:center;'>S/. "+resultados[y].valorCuota+"</td>"+
                    "<td style='text-align:center;'>S/. "+number_format($saldo, 2, '.','')+"</td>"+
                    "<td style='text-align:center;'>"+(($ultimaFechaPago==null) ? "---" : $ultimaFechaPago)+"</td>"+
                    "</tr>";
                }
                
                $parteUltima="<!-- RESULTADO FINAL -->"+
                    "<br>"+
                    "<table style='margin:auto; width:550px; border-width:1px; border-style:solid; border-color:gray;'>"+
                    "<col style='width:8%;'>"+
                    "<col style='width:20%;'>"+
                    "<col style='width:13%;'>"+
                    "<col style='width:20%;'>"+
                    "<col style='width:20%;'>"+
                    "<col style='width:19%;'>"+
                        "<tr style='background-color:#4485A6; color:white; font-size:10.5px; height:32px; vertical-align:middle;'>"+
                            "<th style='text-align:center; height:30px;'>Nro Cuota</th>"+
                            "<th style='text-align:center;'>Estado</th>"+
                            "<th style='text-align:center;'>Fecha Venc.</th>"+
                            "<th style='text-align:center;'>Monto</th>"+
                            "<th style='text-align:center;'>Saldo</th>"+
                            "<th style='text-align:center;'>Ultimo Pago</th>"+
                        "</tr>"+
                        $filasTabla+                
                    "</table>"+
                    "<br>"+
                    "<br>"+
                    "<hr>"+
                        "<table style='width:"+width+"px;'>"+
                            "<col style='width:18%'>"+
                            "<col style='width:13%'>"+
                            "<col style='width:20%'>"+
                            "<col style='width:10%'>"+
                            "<col style='width:20%'>"+
                            "<col style='width:19%'>"+
                            "<tr style='font-size:10.5px; height:30px; vertical-align:middle;'>"+
                                "<td style='font-weight:bold; text-align:right;'>Deuda Total : </td>"+
                                "<td style='text-align: center;'> S/. "+number_format($deuda, 2, '.', '')+"</td>"+
                                "<td style='font-weight:bold; text-align:right;'>Total Pagado : </td>"+
                                "<td style='text-align: center;'> S/. "+number_format($montoTotalPagado, 2, '.', '')+"</td>"+
                                "<td style='font-weight:bold; text-align:right;'>Saldo: </td>"+
                                "<td style='text-align: center;'> S/. "+number_format($totalSaldo, 2, '.', '')+"</td>"+
                            "</tr>"+
                        "</table>"+
                    "<hr>";
                executePDF($titulo, $idAcuerdo, $fechaAcuerdo, $deudaAcuerdo, $codEvento, $fechaEvento, $descripcionEvento, $cabecera3, $parteUltima, res);
            })
            break;
        case "3":
            var $titulo="ORDEN DE PAGO";
            var $idPersona=req.query.idPersona;
            var query = "select concat(nombres,' ',apellidoPaterno,' ',apellidoMaterno) as nombrePersona, tipoPersona, razonSocial, nroDocumento from Persona where idPersona=?";
            ejecutarQUERY_MYSQL(query, [$idPersona], res, funcionName, function(res, resultados){
                var $r = resultados[0];
                var $nombrePersonaPagante="";
                var $tipoPersonaPagante=$r.tipoPersona;
                switch ($tipoPersonaPagante) {
                    case 'N':
                        $nombrePersonaPagante=$r.nombrePersona;
                        break;
                    case 'J':                
                        $nombrePersonaPagante=$r.razonSocial;
                        break;
                }
                if($nombrePersonaPagante!=$asociado){
                    var $nroDoc=$r.nroDocumento;
                    $cabecera3="<hr>"+
                                "<div id='cabecera3' style='width:"+width+"px;'>"+
                                    "<table style='width:310px; float:left;'>"+
                                        "<col style='width:20%'>"+
                                        "<col style='width:80%'>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Asociado :</td>"+
                                            "<td>"+$asociado+"</td>"+
                                        "</tr>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Nro CAT :</td>"+
                                            "<td>"+$nroCAT+"</td>"+
                                        "</tr>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Placa :</td>"+
                                            "<td>"+$placa+"</td>"+
                                        "</tr>"+                                
                                    "</table>"+
                                    "<table style='width:310px; margin-left:5px;'>"+
                                        "<col style='width:20%'>"+
                                        "<col style='width:80%'>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Pagador :</td>"+
                                            "<td>"+$nombrePersonaPagante+"</td>"+
                                        "</tr>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Nro Doc :</td>"+
                                            "<td>"+$nroDoc+"</td>"+
                                        "</tr>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Emisión :</td>"+
                                            "<td>"+$fechaHoy+"</td>"+
                                        "</tr> "+
                                    "</table>"+
                                "</div>"+
                            "<hr>";            
                }
                var $filasTabla="";
                var $montoTotalPago=0;
                
                var $queryOrdenesPago="select p.idPago, p.idCuota, p.monto as montoApagar,  c.nroCuota, DATE_FORMAT (c.fechaApagar, '%d/%m/%Y') as fechaVencimiento, c.valorCuota, c.pagosACuenta as montoPagado "+
                    "from Pago p inner join Cronograma c on  p.idCuota=c.idCuota where p.idPersona=? and p.estado='G' and p.idAcuerdo=?";
        
                ejecutarQUERY_MYSQL($queryOrdenesPago, [$idPersona, $idAcuerdo], res, funcionName, function(res, resultados){
                    for(var i=0; i<resultados.length; i++){
                        $saldo=resultados[i].valorCuota-resultados[i].montoPagado;
                        $montoTotalPago=$montoTotalPago+resultados[i].montoApagar;
                        
                        $filasTabla=$filasTabla+"<tr style='background-color:#FAFAFA; font-size:9.5px; height:30px; vertical-align:middle;'>"+
                        "<td style='text-align:center; height:30px;'>"+resultados[i].nroCuota+"</td>"+
                        "<td style='text-align:center;'>"+resultados[i].fechaVencimiento+"</td>"+
                        "<td style='text-align:center;'>S/. "+resultados[i].valorCuota+"</td>"+
                        "<td style='text-align:center;'>S/. "+number_format($saldo, 2, '.','')+"</td>"+
                        "<td style='text-align:center;'>S/. "+resultados[i].montoApagar+"</td>"+
                        "</tr>";
                    }
                    $parteUltima="<!-- RESULTADO FINAL -->"+
                    "<br>"+
                    "<table style='margin:auto; width:550px; border-width:1px; border-style:solid; border-color:gray;'>"+
                    "<col style='width:10%;'>"+
                    "<col style='width:15%;'>"+
                    "<col style='width:25%;'>"+
                    "<col style='width:25%;'>"+
                    "<col style='width:25%;'>"+
                        "<tr style='background-color:#4485A6; color:white; font-size:10.5px; height:32px; vertical-align:middle;'>"+
                            "<th style='text-align:center; height:30px;'>Nro Cuota</th>"+
                            "<th style='text-align:center;'>Fecha Venc.</th>"+
                            "<th style='text-align:center;'>Monto</th>"+
                            "<th style='text-align:center;'>Saldo Cuota</th>"+
                            "<th style='text-align:center;'>Monto a Pagar</th>"+
                        "</tr>"+
                        $filasTabla+
                        "</table>"+
                        "<table style='margin:auto; width:550px;'>"+
                        "<col style='width:75%;'>"+
                        "<col style='width:25%;'>"+
                        "<tr style='font-size:10.5px; font-weight:bold; height:30px; vertical-align:middle; border-width:1px; border-style:solid; border-color:gray;'>"+
                        "<td style='text-align:right; height:30px;'>TOTAL A PAGAR : </td>"+
                        "<td style='text-align:center;'>S/. "+number_format($montoTotalPago, 2, '.', '')+"</td>"+
                        "</tr>"+
                    "</table>"+
                    "<br>"+
                    "<br>"+
                    "<hr>";
                    executePDF($titulo, $idAcuerdo, $fechaAcuerdo, $deudaAcuerdo, $codEvento, $fechaEvento, $descripcionEvento, $cabecera3, $parteUltima, res);
                })
            })
            break;
        case "4":
            var fechaNow=convertirAfechaString(new Date(), true, false).split(" ");
            var $fechaEmision=fechaNow[0];
            var horaSeg = fechaNow[1].split(":")
            var $hora=horaSeg[0];
            var $minutos=horaSeg[1];
            var $amPm="am.";
            if($hora>12){
                $hora=$hora-12;
                $amPm="pm.";
            }
            var $fechaEmisionTitulo=$fechaEmision+" "+$hora+":"+$minutos+" "+$amPm;
            $titulo="PAGO DE CUOTAS : "+$fechaEmisionTitulo;
            $idPersona=req.query.idPersona;
            
            var $query="select concat(nombres,' ',apellidoPaterno,' ',apellidoMaterno) as nombrePersona, tipoPersona, razonSocial, nroDocumento from Persona where idPersona=?";
            ejecutarQUERY_MYSQL($query, [$idPersona], res, funcionName, function(res, resultados){
                var $r = resultados[0];
                var $nombrePersonaPagante="";
                var $tipoPersonaPagante=$r.tipoPersona;
                switch ($tipoPersonaPagante) {
                    case 'N':
                        $nombrePersonaPagante=$r.nombrePersona;
                        break;
                    case 'J':                
                        $nombrePersonaPagante=$r.razonSocial;
                        break;
                }
                if($nombrePersonaPagante!=$asociado){
                    var $nroDoc=$r.nroDocumento;
                    $cabecera3="<hr>"+
                                "<div id='cabecera3' style='width:"+width+"px;'>"+
                                    "<table style='width:310px; float:left;'>"+
                                        "<col style='width:20%'>"+
                                        "<col style='width:80%'>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Asociado :</td>"+
                                            "<td>"+$asociado+"</td>"+
                                        "</tr>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Nro CAT :</td>"+
                                            "<td>"+$nroCAT+"</td>"+
                                        "</tr>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Placa :</td>"+
                                            "<td>"+$placa+"</td>"+
                                        "</tr>"+                                
                                    "</table>"+
                                    "<table style='width:310px; margin-left:5px;'>"+
                                        "<col style='width:20%'>"+
                                        "<col style='width:80%'>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Pagador :</td>"+
                                            "<td>"+$nombrePersonaPagante+"</td>"+
                                        "</tr>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Nro Doc :</td>"+
                                            "<td>"+$nroDoc+"</td>"+
                                        "</tr>"+
                                        "<tr style='font-size:9.5px; vertical-align:middle;'>"+
                                            "<td style='font-weight:bold; text-align:right;'>Emisión :</td>"+
                                            "<td>"+$fechaHoy+"</td>"+
                                        "</tr> "+
                                    "</table>"+
                                "</div>"+
                            "<hr>";            
                }    
                var $filasTabla="";
                var $montoTotalPago=0;
                var $idListaPagos=req.query.idCuotas;
                
                var $queryOrdenesPago="select p.idPago, p.idCuota, p.monto as montoApagar,  c.nroCuota, DATE_FORMAT (c.fechaApagar, '%d/%m/%Y') as fechaVencimiento, c.valorCuota, c.pagosACuenta as montoPagado "+
                    "from Pago p inner join Cronograma c on  p.idCuota=c.idCuota where p.idPersona=? and p.estado='P' and p.idAcuerdo=? and p.idPago in ("+$idListaPagos+")";
            
                ejecutarQUERY_MYSQL($queryOrdenesPago, [$idPersona, $idAcuerdo], res, funcionName, function(res, resultados){
                    for(var i=0; i<resultados.length; i++){
                        var $saldo=resultados[i].valorCuota-resultados[i].montoPagado;
                        $montoTotalPago=$montoTotalPago+resultados[i].montoApagar;
                        
                        $filasTabla=$filasTabla+"<tr style='background-color:#FAFAFA; font-size:9.5px; height:30px; vertical-align:middle;'>"+
                        "<td style='text-align:center; height:30px;'>"+resultados[i].nroCuota+"</td>"+
                        "<td style='text-align:center;'>"+resultados[i].fechaVencimiento+"</td>"+
                        "<td style='text-align:center;'>S/. "+resultados[i].valorCuota+"</td>"+
                        "<td style='text-align:center;'>S/. "+number_format($saldo, 2, '.','')+"</td>"+
                        "<td style='text-align:center;'>S/. "+resultados[i].montoApagar+"</td>"+
                        "</tr>";
                    }
                    var $parteUltima="<!-- RESULTADO FINAL -->"+
                    "<br>"+
                    "<table style='margin:auto; width:550px; border-width:1px; border-style:solid; border-color:gray;'>"+
                    "<col style='width:10%;'>"+
                    "<col style='width:15%;'>"+
                    "<col style='width:25%;'>"+
                    "<col style='width:25%;'>"+
                    "<col style='width:25%;'>"+
                        "<tr style='background-color:#4485A6; color:white; font-size:10.5px; height:32px; vertical-align:middle;'>"+
                            "<th style='text-align:center; height:30px;'>Nro</th>"+
                            "<th style='text-align:center;'>Fecha Venc.</th>"+
                            "<th style='text-align:center;'>Monto</th>"+
                            "<th style='text-align:center;'>Saldo Cuota</th>"+
                            "<th style='text-align:center;'>Pago Efectuado</th>"+
                        "</tr>"+
                        $filasTabla+
                        "</table>"+
                        "<table style='margin:auto; width:550px;'>"+
                        "<col style='width:75%;'>"+
                        "<col style='width:25%;'>"+
                        "<tr style='font-size:10.5px; font-weight:bold; height:30px; vertical-align:middle; border-width:1px; border-style:solid; border-color:gray;'>"+
                        "<td style='text-align:right; height:30px;'>PAGO TOTAL EFECTUADO: </td>"+
                        "<td style='text-align:center;'>S/. "+number_format($montoTotalPago, 2, '.', '')+"</td>"+
                        "</tr>"+
                    "</table>"+
                    "<br>"+
                    "<br>"+
                    "<hr>";
                    executePDF($titulo, $idAcuerdo, $fechaAcuerdo, $deudaAcuerdo, $codEvento, $fechaEvento, $descripcionEvento, $cabecera3, $parteUltima, res);
                });
            })
            break;
    }
}
exports.getNuevosEventos = function(req, res, funcionName){
	var request = require("request");
	var evento;
	request('http://www.autoseguroafocat.org/intranet2/intranetDB2.php?funcion=getNuevosEventos', function (error, response, body) {
  		if (!error && response.statusCode == 200) {
  			body = body.trimLeft();
  			//console_log("body changed: "+body);
  			evento = JSON.parse(body);
  			console_log("cant eventos: "+evento.length);
  			escribirLog("./logs/getNuevosEventos.txt", "Se encontraron: "+evento.length+" eventos en la BD NAUTOSEGURO")
  			var eventosAeliminar="";
  			for(var i=0; i<evento.length;i++){
  				// cod Evento:
  				evento[i].codEvento = evento[i].codEvento.trim();
  				var codEvento = evento[i].codEvento;
  				escribirLog("./logs/getNuevosEventos.txt", "Procesando el evento "+codEvento);
  				if(i>0){
  					eventosAeliminar=eventosAeliminar+", ";
  				}
  				eventosAeliminar = eventosAeliminar+codEvento;
  				var verificaCodEvento = "Select count(*) as contadorEventos from Evento where codEvento='"+codEvento+"'";
  				console_log("verifica si ya existe el codigo de evento");
  				ejecutarQUERY_MYSQL_Extra(evento[i], verificaCodEvento, [], res, funcionName, function(res, resultados, evento) {
			        var contadorEventos = resultados[0].contadorEventos;
			        if(contadorEventos==0){
			        	escribirLog("./logs/getNuevosEventos.txt", "el evento "+evento.codEvento+" es nuevo");
			        	console_log("Se registrara el evento: "+evento.codEvento);
				        // tabla Nro CAT
				        var nroCAT = evento.nroCAT
				        console_log("CAT: "+nroCAT);
				        if(nroCAT=="" || nroCAT==null){
				        	escribirLog("./logs/getNuevosEventos.txt", "nroCAT invalido: "+nroCAT);
				        	enviarCorreoNotificacion("nroCAT invalido: "+nroCAT+" ["+evento.codEvento+"]");
				        }
				        var queryValidaCat = "Select a.idPersona as idPersonaAsociado from Cat c inner join Asociado a on c.idAsociado = a.idAsociado  where nroCAT ='"+nroCAT+"'";
				        ejecutarQUERY_MYSQL_Extra(evento, queryValidaCat, [], res, funcionName, function(res, resultados, evento) {
				            if(resultados.length==0){
				            	escribirLog("./logs/getNuevosEventos.txt", "CAT "+evento.nroCAT+" aun no se ha registrado ["+evento.codEvento+"]. Verifica si el Asociado se encuentra registrado.");
				                verificaAsociadoExiste(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                    if(resultados.length==0){
				                    	escribirLog("./logs/getNuevosEventos.txt", "El Asociado "+evento.idAsociado+" aun no se ha registrado ["+evento.codEvento+"]");
				                        console_log("TIPO PERSONA: "+evento.pa_tipoPersona);
				                        insertarPersonaAsociado(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                            insertarAsociado(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                insertarCAT(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                    var idChofer = evento.idChofer;
				                                    if(idChofer>0){
				                                    	escribirLog("./logs/getNuevosEventos.txt", "Existe chofer");
				                                        var pc_nroDocumento = evento.pc_nroDocumento // Nro doc del chofer
				                                        if(pc_nroDocumento!=""){
				                                            if(evento.pa_nroDocumento!=pc_nroDocumento){ // el asociado y el chofer no son la misma persona
				                                                escribirLog("./logs/getNuevosEventos.txt", "El asociado y el chofer son personas diferentes");
				                                                // Inserta persona chofer
				                                                insertarPersonaChofer(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                    insertarChofer(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                        verificarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                                                            if(resultados.length==0){
				                                                            	escribirLog("./logs/getNuevosEventos.txt", "El procurador no se encuentra registrado ["+evento.codEvento+"]");
				                                                                insertarPersonaProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                                    insertarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                                        insertarEventoInforme(req, res, funcionName, evento)  
				                                                                    })
				                                                                })
				                                                            }else{
				                                                            	escribirLog("./logs/getNuevosEventos.txt", "El procurador ya se encuentra registrado ["+evento.codEvento+"]");
				                                                                insertarEventoInforme(req, res, funcionName, evento)
				                                                            }
				                                                        })
				                                                    })
				                                                })
				                                            }else{ // el asociado y chofer son la misma persona
				                                            	escribirLog("./logs/getNuevosEventos.txt", "El asociado y el chofer son la misma persona");
				                                                evento.pc_idPersona=evento.pa_idPersona;
				                                                // solo inserta el chofer
				                                                insertarChofer(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                    verificarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                                                        if(resultados.length==0){
				                                                            insertarPersonaProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                                insertarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                                    insertarEventoInforme(req, res, funcionName, evento)  
				                                                                })
				                                                            })
				                                                        }else{
				                                                            insertarEventoInforme(req, res, funcionName, evento)
				                                                        }    
				                                                    });    
				                                                });
				                                            }
				                                        }
				                                    }else{ // No se inserta chofer
				                                    	escribirLog("./logs/getNuevosEventos.txt", "No Existe chofer");
				                                        verificarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                                            if(resultados.length==0){
				                                                insertarPersonaProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                    insertarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                        insertarEventoInforme(req, res, funcionName, evento)  
				                                                    })
				                                                })
				                                            }else{
				                                                insertarEventoInforme(req, res, funcionName, evento)
				                                            }    
				                                        });
				                                    }
				                                })
				                            })
				                        })    
				                    }else{
				                    	escribirLog("./logs/getNuevosEventos.txt", "El Asociado "+evento.idAsociado+" ya se encuentra registrado");
				                        console_log("El asociado ya se encuentra registrado, solo se inserta el CAT")
				                        insertarCAT(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                            var idChofer = evento.idChofer;
				                            if(idChofer>0){
				                                var pc_nroDocumento = evento.pc_nroDocumento // Nro doc del chofer
				                                if(pc_nroDocumento!=""){
				                                    if(evento.pa_nroDocumento!=pc_nroDocumento){ // el asociado y el chofer no son la misma persona
				                                        // Inserta persona chofer
				                                        insertarPersonaChofer(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                            insertarChofer(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                verificarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                                                    if(resultados.length==0){
				                                                        insertarPersonaProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                            insertarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                                insertarEventoInforme(req, res, funcionName, evento)  
				                                                            })
				                                                        })
				                                                    }else{
				                                                        insertarEventoInforme(req, res, funcionName, evento)
				                                                    }
				                                                })
				                                            })
				                                        })
				                                    }else{ // el asociado y chofer son la misma persona
				                                        evento.pc_idPersona=evento.pa_idPersona;
				                                        // solo inserta el chofer
				                                        insertarChofer(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                            verificarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                                                if(resultados.length==0){
				                                                    insertarPersonaProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                        insertarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                            insertarEventoInforme(req, res, funcionName, evento)  
				                                                        })
				                                                    })
				                                                }else{
				                                                    insertarEventoInforme(req, res, funcionName, evento)
				                                                }    
				                                            });    
				                                        });
				                                    }
				                                }
				                            }else{ // No se inserta chofer
				                                verificarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                                    if(resultados.length==0){
				                                        insertarPersonaProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                            insertarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                insertarEventoInforme(req, res, funcionName, evento)  
				                                            })
				                                        })
				                                    }else{
				                                        insertarEventoInforme(req, res, funcionName, evento)
				                                    }    
				                                });
				                            }
				                        })
				                    }
				                })
				            }else{
				            	escribirLog("./logs/getNuevosEventos.txt", "CAT "+evento.nroCAT+" ya se ha registrado ["+evento.codEvento+"]");
				            	var idPersonaAsociado = resultados[0].idPersonaAsociado;
				            	console_log("actualiza idPersona asociado: "+idPersonaAsociado);
				            	evento.pa_idPersona=idPersonaAsociado;
				                var idChofer = evento.idChofer;
				                if(idChofer>0){
				                    var pc_nroDocumento = evento.pc_nroDocumento // Nro doc del chofer
				                    if(pc_nroDocumento!=""){
				                        if(evento.pa_nroDocumento!=pc_nroDocumento){ // el asociado y el chofer no son la misma persona
				                            // Inserta persona chofer
				                            insertarPersonaChofer(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                insertarChofer(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                    verificarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                                        if(resultados.length==0){
				                                            insertarPersonaProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                insertarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                    insertarEventoInforme(req, res, funcionName, evento)  
				                                                })
				                                            })
				                                        }else{
				                                            insertarEventoInforme(req, res, funcionName, evento)
				                                        }
				                                    })
				                                })
				                            })
				                        }else{ // el asociado y chofer son la misma persona
				                            evento.pc_idPersona=evento.pa_idPersona;
				                            // solo inserta el chofer
				                            insertarChofer(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                verificarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                                    if(resultados.length==0){
				                                        insertarPersonaProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                            insertarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                                insertarEventoInforme(req, res, funcionName, evento)  
				                                            })
				                                        })
				                                    }else{
				                                        insertarEventoInforme(req, res, funcionName, evento)
				                                    }    
				                                });    
				                            });
				                        }
				                    }
				                }else{ // No se inserta chofer
				                    verificarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento, resultados){
				                        if(resultados.length==0){
				                            insertarPersonaProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                insertarProcurador(req, res, funcionName, evento, function(req, res, funcionName, evento){
				                                    insertarEventoInforme(req, res, funcionName, evento)  
				                                })
				                            })
				                        }else{
				                            insertarEventoInforme(req, res, funcionName, evento)
				                        }    
				                    });
				                }
				            }
				        });
			        }else{
			        	console_log("el evento "+evento.codEvento+" ya se encuentra registrado")
			        	escribirLog("./logs/getNuevosEventos.txt", "el evento "+evento.codEvento+" ya se encuentra registrado");
			        	enviarCorreoNotificacion("el evento "+evento.codEvento+" ya se encuentra registrado");
			        }
  				});		
  			}
  			/*if(eventosAeliminar!=""){
  				var dominio = "http://www.autoseguroafocat.org/";
				request.post({url:dominio+"intranet2/intranetDB2.php?funcion=deleteNuevosEventos", form: {"eventos":eventosAeliminar}, headers: {'content-type' : 'application/json'}}); // Elimina los eventos de la tabla NuevosEventos (NAUTOSEGURO)	
  			}*/
  		}
	})
}
/* @cambiarArecupero: Actualiza un evento “No Recupero” a “RECUPERO”.
	RETORNA: cantidad de filas afectadas
*/
exports.cambiarArecupero = function(req, res, funcionName){
	var codEvento = req.query.codEvento;
	var query = "Update Evento set esRecupero='S' where codEvento=?";
	var arrayParametros = [codEvento];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows");
}

/* @informeExpediente: Emite el reporte PDF del historial de un expediente
*/
exports.informeExpediente = function(req, res, funcionName){
// RECIBE PARAMETROS
var $idExpediente=req.query.idExpediente;
var $asociado = req.query.asociado;
var $placa = req.query.placa;
var $codEvento = req.query.codEvento;
var $agraviado = req.query.agraviado;
var $tipoIngreso = "";
var $tipoDoc = "";
var $tramitador=req.query.tramitador;
var $telfTramitador = req.query.telefono;
var $direccionTramitador = req.query.direccionTramitador;
var $correoTramitador = req.query.correo;
var $textoInforme = req.body.textoInforme;
var date = new Date();
var $fechaImpresion = convertirAfechaString(date, false, false);
//var $fechaImpresion = convertirAfechaString(date);
var $arrayMes=new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
var $fechaLima="Lima, "+agregarCEROaLaIzquierda(date.getDate())+" de "+$arrayMes[date.getMonth()]+" del "+date.getFullYear();
var $hora=date.getHours();
var $minutes = date.getMinutes();
var $amPm="AM";
if($hora>=12){
    $amPm="PM";
    if($hora>12){
        $hora=$hora-12;
    }
}
var $horaImpresion=agregarCEROaLaIzquierda($hora)+":"+agregarCEROaLaIzquierda($minutes)+" "+$amPm;
var $fechaInforme = req.query.fechaSalida;
var $asunto = req.body.asunto;
var $textoPorEstado = req.query.textoPorEstado;
if($textoPorEstado!=""){
    $textoPorEstado="<br>"+$textoPorEstado+"<br>"; // agrega salto de linea
}
var $footer="<div style='text-align:right; font-size:10px; width:"+$ancho+"px;'><br><hr>página {#pageNum}/{#numPages}</div>";
var $ancho = "580px";
var $body =
	"<div style='width:"+$ancho+"; background-color:; min-height:40px;'>"+
	"<div style='float:left; width:310px; background-color:;'>"+
		"<img src='"+urldominio+"images/autoseguro.jpg' style='width:160px;'/>"+
	    "<div id='direccion_local' style='font-size:6.5px; color:gray; width:300px;'>"+
	    "JR. NATALIO SANCHEZ 220 OF. 704 - JESUS MARIA"+ 
	    "</div>"+
	    "<div id='fono_local' style='margin-top:-8px; font-size:6.5px; color:gray; width:300px;'>"+
	    "TELEFONO: 423-8180 / 715-6214"+
	    "</div>"+
    "</div>"+
    "<table id='datos_impresion' style='float:right; width:170px; color:gray; font-size:8.5px; background-color:;'>"+
        "<col style='width:52%'>"+ 
        "<col style='width:2%'>"+
        "<col style='width:46%'>"+
         "<tr>"+
            "<td>Fecha Impresión</td>"+
           "<td>:</td>"+
           "<td style='text-align:left;'>"+$fechaImpresion+"</td>"+
        "</tr> "+               
        "<tr>"+
            "<td>Hora Impresión</td>"+
            "<td>:</td>"+
            "<td style='text-align:left;'>"+$horaImpresion+"</td>"+
        "</tr>"+
    "</table>"+
    "</div>"+
    "<br><br><br><br>"+
    "<div id='Titulo' style='font-size:14px; font-weight:bold; width:"+$ancho+"; text-align:center;'>"+
    "DETALLE DEL EXPEDIENTE"+
    "</div>"+
    "<br><br>"+
    "<table style='width:"+$ancho+"; margin:auto;' >"+
    	"<col style='width:15%'>"+ 
        "<col style='width:42%'>"+
        "<col style='width:15%'>"+
        "<col style='width:28%'>"+
        "<tr style='height:13px;'>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Nro Expediente</td>"+
            "<td style='text-align:left; font-size:8.5px;'>: "+$idExpediente+"</td>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Fecha Publicada</td>"+
            "<td style='text-align:left; font-size:8.5px;'>: "+$fechaInforme+"</td>"+
        "</tr>"+
        "<tr style='height:13px;'>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Solicitante</td>"+
            "<td style='text-align:left; font-size:7.5px;'>: "+$tramitador+"</td>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Telefono</td>"+
            "<td style='text-align:left; font-size:8.5px;'>: "+$telfTramitador+"</td>"+
        "</tr>"+
        "<tr style='height:13px;'>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Direccion</td>"+
            "<td style='text-align:left; font-size:7.5px;'>: "+$direccionTramitador+"</td>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Correo</td>"+
            "<td style='text-align:left; font-size:7.5px;'>: "+$correoTramitador+"</td>"+
        "</tr>"+
        "<tr style='height:13px;'>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Cod. Evento</td>"+
            "<td style='text-align:left; font-size:8.5px;'>: "+$codEvento+"</td>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Placa</td>"+
            "<td style='text-align:left; font-size:8.5px;'>: "+$placa+"</td>"+
        "</tr>"+
        "<tr style='height:13px;'>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Agraviado</td>"+
            "<td style='text-align:left; font-size:8.5px;' colspan='3'>: "+$agraviado+"</td>"+
        "</tr>"+
        "<tr style='height:13px;'>"+
            "<td style='text-align:left; font-weight:bold; font-size:8.5px;'>Asunto</td>"+
            "<td style='text-align:left; font-size:8.5px;' colspan='3'>: "+$asunto+"</td>"+
        "</tr>"+
        "</table>"+
        "<br>"+
        "<div id='Titulo_resultado' style='font-size:10px; padding-left:5px; padding-top:-5px; font-weight:300; width:"+$ancho+"; margin:auto; height:20px; background-color:#E2E7EF;'>"+
        "Resultado de la Solicitud"+
        "</div>"+
        $textoPorEstado+
        "<div id='cuerpo' style='width:"+$ancho+"; margin:auto;'>"+
            "<p style='text-align:justify; font-size:9.5px; line-height:18.5px; padding-top:7px;'>"+         
            	"Vista la solicitud presentada por "+$tramitador+", <b>SE OBSERVA</b> en consideración a lo siguiente:"+
            "</p>"+
            "<p style='text-align:justify; font-size:9px; line-height:18.5px; padding-top:7px; margin-top:-5px;'>"+           
             $textoInforme+
            "</p>"+
        "</div>"+
        "<br><br>"+
        "<div id='firma_Agraviado' style='width:270px; height:40px; text-align:center; font-size:8.5px;'>"+
         "--------------------------------------------------------------"+
        "<br>"+
        $tramitador+
        "</div>";
	
var $html=            
        "<html>"+
            "<head>"+
               "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'>"+
            "</head>"+
            "<body style='padding-top:0px; background-color:;'>"+
              	"<br>"+
    			"<div style='line-height:20px; margin:auto; width:"+$ancho+"; text-align:justify; margin-top:4px; background-color:;'>"+
					$body+
				"</div>"+
			"</body>"+
		"</html>";
	generatePDF($html, $footer, res, "88px");
}

/* @getVehiculosXidInforme: Obtiene y retorna los registros de los vehiculos informados filtrándoles por el id del informe del evento.
*/
exports.getVehiculosXidInforme=function(req, res, funcionName){
	var idInforme = req.query.idInforme;
	var query = "Select * from Vehiculos_Informados where idInforme=?";
	var arrayParametros = [idInforme];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

/* @editarVehiculo: Actualiza los datos de un vehiculo
	RETORNA: La cantidad de filas afectadas.
*/
exports.editarVehiculo=function(req, res, funcionName){
	var placa= req.query.placa
	var motor= req.query.motor
	var marca= req.query.marca
	var color= req.query.color
	var anno= req.query.anno
	var kilometro= req.query.kilometro
	var cia= req.query.cia
	var idVehiculo= req.query.idVehiculo
	
	var query = "Update Vehiculos_Informados set placa = ?, motor=?, marca=?, anno=?, color=?, kilometro=?, cia=? where idVehiculoInformado=?";
	var arrayParametros = [placa, motor, marca, anno, color, kilometro, cia, idVehiculo];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultado){
		enviarResponse(res, [resultado.affectedRows])
	});
}

/* @insertarVehiculo: Registra un nuevo vehiculo
	RETORNA: ID del vehiculo registrado
*/
exports.insertarVehiculo=function(req, res, funcionName){
	var placa= req.query.placa
	var motor= req.query.motor
	var marca= req.query.marca
	var color= req.query.color
	var anno= req.query.anno
	var kilometro= req.query.kilometro
	var cia= req.query.cia
	var idInforme = req.query.idInforme

	var query = "INSERT INTO Vehiculos_Informados (idInforme, placa, motor, marca, anno, color, kilometro, cia, fechaRegistro) values (?,?,?,?,?,?,?,?, CURRENT_TIMESTAMP)";
	var arrayParametros = [idInforme, placa, motor, marca, anno, color, kilometro, cia];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultado){
		enviarResponse(res, [resultado.insertId])
	});
}
/* @getLiquidacion: Obtiene la liquidación de cada agraviado de un evento, a través de una consulta al servicio web "getLiquidacion" del servidor PHP de AUTOSEGURO
*/
exports.getLiquidacion=function(req, res, funcionName){
	var request = require("request");
	var codigo = req.query.codigo;
	var tipoBusqueda = req.query.tipoBusqueda;
	var url = 'http://www.autoseguroafocat.org/intranet2/intranetDB.php?funcion=getLiquidacion&codigo='+codigo+"&tipoBusqueda=E";
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			body = body.trimLeft();
	  		//console_log("body changed: "+body);
	  		var liquidaciones = JSON.parse(body);
	  		enviarResponse(res, liquidaciones)
	  	}
	});
}
/*
 @liquidacionPDF: Obtiene los gastos de un agraviado y los reporta en un documento PDF, clasificándolos por el tipo de gasto.
*/
exports.liquidacionPDF=function(req, res, funcionName){
	var $nombre = req.query.nombre;
	var $numcentral = req.query.numcentral;
	var $numsiniestro = req.query.numsiniestro;
	var $fechasiniestro = req.query.fechasiniestro;
	var $cat = req.query.cat;
	var $placa = req.query.placa;
	var $fechaImpresion = req.query.fechaImpresion;
	var $nombreUsuario = req.query.nombreUsuario;
	var $contrante = req.query.nombreasegurado;
	var fecha = new Date();
	var $horaActual = agregarCEROaLaIzquierda(fecha.getDate())+":"+agregarCEROaLaIzquierda(fecha.getMinutes())+":"+agregarCEROaLaIzquierda(fecha.getSeconds());
	var $cabecera="<table style=' margin:auto; width:640px; font-size:9px; margin-top:-10px;'>"+
        "<col style='width:15%;'>"+
        "<col style='width:12%;'>"+
        "<col style='width:45%;'>"+
        "<col style='width:15%;'>"+
        "<col style='width:20%;'>"+
        "<tr style='background-color:#A7C942; color: white; font-weight:bold; font-size:11px;'>"+
            "<td>Factura/Orden</td>"+
            "<td>Fecha</td>"+
            "<td>Proveedor/Beneficiario</td>"+
            "<td>Monto</td>"+
            "<td>Tipo</td>"+
        "</tr>";
	actualizarGastos($numcentral, res, funcionName, function(res, resultados){// Actualiza los gastos
	 // obtiene los gastos por agraviado
	 	var $query="select g.numero, g.proveedor, g.comprobante, tg.descripcion as tipoGasto, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombresAgraviado, DATE_FORMAT (g.fechaDoc, '%d/%m/%Y') as fechaDoc, "+
	       " g.monto from Gasto g inner join TipoGasto tg on g.idTipoGasto = tg.idTipoGasto "+
	       " inner join Agraviado a on g.codAgraviado=a.codAgraviado "+
	       " inner join Persona p on a.idPersona=p.idPersona "+
	       " where g.codAgraviado='"+$numsiniestro+"' order by g.idTipoGasto, g.fechaDoc";
	    ejecutarQUERY_MYSQL($query, [], res, funcionName, function(res, resultados){
	    	var $tablasDetalle="";
		    var $cont=0;
		    var $totalGlobal=0;
		    var $totalTipo=0;
		    var $descripcionAnterior="";
		    var footer = "";
		    
	    	for($cont; $cont<resultados.length; $cont++){
	    		if($cont==0){ // La primera vez
                	$tablasDetalle=$tablasDetalle+
                	"<div style='font-size:9.5px; font-weight:bold; margin-left:14px;'>"+resultados[$cont]['tipoGasto']+"</div>"+$cabecera+
                    "<br>"+
                    "<tr>"+
                        "<td>"+resultados[$cont]['numero']+"</td>"+
                        "<td>"+resultados[$cont]['fechaDoc']+"</td>"+
                        "<td>"+resultados[$cont]['proveedor']+"</td>"+
                        "<td>"+number_format(resultados[$cont]['monto'],2)+"</td>"+
                        "<td>"+resultados[$cont]['comprobante']+"</td>"+
                    "</tr>";                
	            }else{
	                if(resultados[$cont]['tipoGasto']!=$descripcionAnterior){
	                    $tablasDetalle+="<tr>"+
	                    "<td colspan='3' style='font-weight:bold; text-align:right;' >TOTAL "+$descripcionAnterior+"</td>"+
	                    "<td colspan='2' style='font-weight:bold;'>:  "+number_format($totalTipo,2)+"</td>"+
	                    "</tr>"+
	                    "</table><br>"+
	                    "<div style='font-size:9.5px; font-weight:bold; margin-left:14px;'>"+resultados[$cont]['tipoGasto']+"</div><br>"+$cabecera;
	                    $totalTipo=0;
	                }
	                $tablasDetalle+="<tr>"+
	                   "<td>"+resultados[$cont]['numero']+"</td>"+
	                   "<td>"+resultados[$cont]['fechaDoc']+"</td>"+
	                   "<td>"+resultados[$cont]['proveedor']+"</td>"+
	                   "<td>"+number_format(resultados[$cont]['monto'],2)+"</td>"+
	                   "<td>"+resultados[$cont]['comprobante']+"</td>"+
	                "</tr>";
	            }            
	            //$cont++;
	            $totalGlobal=$totalGlobal+resultados[$cont]['monto'];
	            $totalTipo=$totalTipo+resultados[$cont]['monto'];            
	            $descripcionAnterior=resultados[$cont]['tipoGasto'];
	    	}
	    	if($cont>0){
            	$tablasDetalle+="<tr>"+
                    "<td colspan='3' style='font-weight:bold; text-align:right;' >TOTAL "+$descripcionAnterior+"</td>"+
                    "<td colspan='2' style='font-weight:bold;'>:  "+number_format($totalTipo,2)+"</td>"+
                    "</tr>"+
                    "</table>";
        	}
        	var $ancho="660px";
        	var body=
                "<html>"+
                  "<head>"+
                    "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'>"+
                  "</head>"+
                "<body style='padding-top:0px; background-color:;'>"+
                	"<br>"+
    				"<div style='line-height:20px; margin:auto; width:"+$ancho+"; text-align:justify; margin-top:-6px; background-color:;'>"+
    				"<table style='width:635px; font-size:9px; margin:auto;'>"+
				        "<tr>"+
				            "<td style='text-align: left; padding-top:5; width: 315px; color:gray; font-weight:bold; background-color:;'>"+
				                '<img src="'+urldominio+'images/autoseguro.jpg" style="width:140px;">'+
				                '<br><br>'+
				                    '<label style="margin-left:3px; margin-top:11px;">'+
				                        'USUARIO : '+$nombreUsuario+
				                    '</label>'+
				            '</td>'+
				            "<td style='text-align: right; width: 320px; color:gray; background-color:;'>"+
				                "<table style='float:right; background-color:;'>"+
				                    "<tr style='color:gray; font-size:10px;'>"+
				                        "<td style='text-align:left;'>Fecha   </td>"+
				                        "<td style='text-align:left;'> : "+$fechaImpresion+"</td>"+
				                    "</tr>"+
				                    "<tr style='color:gray; font-size:10px;'>"+
				                        "<td style='text-align:left;'>Hora    </td>"+
				                        "<td style='text-align:left;'> : "+$horaActual+"</td>"+
				                    "</tr>"+
				                "</table>"+
				            "</td>"+
				        "</tr>"+
				    "</table>"+
				    "<br><H4 style='text-align:center;'>DETALLE DE PAGOS-SINIESTROS</H4>"+
				    "<br>"+
				    "<table style='width:640px; font-size:9px; margin:auto;'>"+
				    '<col style="width:13%;">'+
				    '<col style="width:16%;">'+
				    '<col style="width:18%;">'+
				    '<col style="width:33%;">'+
				    '<col style="width:8%;">'+
				    '<col style="width:14%;">'+
				        "<tr>"+
				            "<td colspan='6' style='font-size:10px;'>"+
				                "Información del Siniestro :  <strong>"+$nombre+"</strong>"+ 
				            "</td>"+
				        "</tr>"+
				        "<tr>"+
				            "<td style='padding-top:7px;'>EVENTO Nº</td>"+
				            "<td style='font-weight:bold; padding-top:7px;'> : "+$numcentral+"</td>"+
				            "<td style='padding-top:7px;'>FECHA SINIESTRO</td>"+
				            "<td style='font-weight:bold; padding-top:7px;'> : "+$fechasiniestro+"</td>"+
				            "<td style='padding-top:7px;'>CAT</td>"+
				            "<td style='font-weight:bold; padding-top:7px;'> : "+$cat+"</td>"+
				        "</tr>"+
				        "<tr>"+
				            "<td>SINIESTRO Nº</td>"+
				            "<td style='font-weight:bold;'> : "+$numsiniestro+"</td>"+
				            "<td>ASOCIADO</td>"+
				            "<td style='font-weight:bold;'> : "+$contrante+"</td>"+
				            "<td>PLACA</td>"+
				            "<td style='font-weight:bold;'> : "+$placa+"</td>"+
				        "</tr>"+
				    "</table>"+
				    "<br>"+  
				    "<br>"+$tablasDetalle+
				    "<br>"+
				    "<br>"+
				    "<label style='font-weight:bold; font-size:10px;'>TOTAL DE GASTOS REALIZADOS A LA FECHA:  S/. "+$totalGlobal+"</label>"+
				    "<br>"+
				    "<label style='font-size:10px;'>*** Estos Gastos se pueden incrementar, conforme se vaya generando en su futuro, conforme a las normas legales ***</label>"+
				    "</div>"+
                "</body>"+
                "</html>";
			generatePDF(body, footer, res);
	    });
	});
}
exports.consultarSolicitud = function(req, res, funcionName){
	var idExpediente = req.query.idExpediente;
	var nroCAT = req.query.nroCAT;
	var $query="Select LPAD(e.idExpediente,5,'0') as idExpediente, e.tipoExpediente, e.estado, date_format (e.fechaIngreso, '%d/%m/%Y') as fechaExpediente, e.diasRespuesta, e.codAgraviado, e.nroFolios, nroDocReferencia, e.idInstitucion, e.Observaciones, LPAD(e.idExpedientePrevio,5,'0') as idExpedientePrevio, pq.idPersona as idPersonaTramitador, concat(pq.nombres,' ',pq.apellidoPaterno,' ',pq.apellidoMaterno) as personaQpresenta, pq.nombres as nombresTramitador, CONCAT(pq.apellidoPaterno,' ',pq.apellidoMaterno) as apellidosTramitador, pq.nroDocumento, pq.telefonoMovil, pq.email, pq.calle as direccion, "+
        "ev.codEvento, ev.nroCAT, c.placa, DATE_FORMAT (ev.fechaAccidente, '%d/%m/%Y') as fechaAccidente, concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, pa.tipoPersona, pa.razonSocial, concat(pg.nombres,' ',pg.apellidoPaterno,' ',pg.apellidoMaterno) as nombresAgraviado from Expediente e "+
        "left join Evento ev on e.codEvento=ev.codEvento "+
        "left join Cat c on ev.nroCAT = c.nroCAT "+
        "left join Asociado a on c.idAsociado=a.idAsociado "+
        "left join Persona pa on a.idPersona=pa.idPersona "+
        "left join Agraviado ag on e.codAgraviado=ag.codAgraviado "+
        "left join Persona pg on ag.idPersona = pg.idPersona "+
        "left join Persona pq on e.idPersonaQPresenta=pq.idPersona where ev.nroCAT=? and e.idExpediente=? and e.tipoExpediente<7";
    ejecutarQUERY_MYSQL($query, [nroCAT, idExpediente], res, funcionName);
}
exports.consultarTramite = function(req, res, funcionName){
	var idExpediente = req.query.idExpediente;
	var nroDoc = req.query.nroDoc;
	var $query="Select LPAD(e.idExpediente,5,'0') as idExpediente, e.tipoExpediente, e.estado, date_format (e.fechaIngreso, '%d/%m/%Y') as fechaExpediente, e.diasRespuesta, e.codAgraviado, e.nroFolios, nroDocReferencia, e.idInstitucion, e.Observaciones, LPAD(e.idExpedientePrevio,5,'0') as idExpedientePrevio, pq.idPersona as idPersonaTramitador, concat(pq.nombres,' ',pq.apellidoPaterno,' ',pq.apellidoMaterno) as personaQpresenta, pq.nombres as nombresTramitador, CONCAT(pq.apellidoPaterno,' ',pq.apellidoMaterno) as apellidosTramitador, pq.nroDocumento, pq.telefonoMovil, pq.email, pq.calle as direccion, "+
        "ev.codEvento, ev.nroCAT, c.placa, DATE_FORMAT (ev.fechaAccidente, '%d/%m/%Y') as fechaAccidente, concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAsociado, pa.tipoPersona, pa.razonSocial, concat(pg.nombres,' ',pg.apellidoPaterno,' ',pg.apellidoMaterno) as nombresAgraviado from Expediente e "+
        "left join Evento ev on e.codEvento=ev.codEvento "+
        "left join Cat c on ev.nroCAT = c.nroCAT "+
        "left join Asociado a on c.idAsociado=a.idAsociado "+
        "left join Persona pa on a.idPersona=pa.idPersona "+
        "left join Agraviado ag on e.codAgraviado=ag.codAgraviado "+
        "left join Persona pg on ag.idPersona = pg.idPersona "+
        "left join Persona pq on e.idPersonaQPresenta=pq.idPersona where e.nroDocReferencia=? and e.idExpediente=? and e.tipoExpediente>6";
    ejecutarQUERY_MYSQL($query, [nroDoc, idExpediente], res, funcionName);
}
exports.demoPDF=function(req, res, funcionName){
	var html="<div style='font-size:25px; font-family:Arial;'>Hola</div><br>"+
	"<div style='font-size:25px; font-family:Verdana;'>Hola</div><br>"+
	"<div style='font-size:25px; font-family:Comic Sans MS;'>Hola</div><br>"+
	"<div style='font-size:25px; font-family:Georgia;'>Hola</div><br>"+
	"<div style='font-size:25px; font-family:Helvetica;'>Hola</div><br>"+
	"<div style='font-size:25px; font-family:Arial Black;'>Hola</div><br>";
	var conversion = require("phantom-html-to-pdf")();
	conversion({ html: html }, function(err, pdf) {
	  console.log(pdf.logs);
	  console.log(pdf.numberOfPages);
	  pdf.stream.pipe(res);
	});
}
exports.log=function(req, res, funcionName){
	escribirLog("./logs/archivo.txt", "hola mundo", "06/05/2016");
	enviarResponse(res, "yala");
}
exports.getAgraviadosXrecupero=function(req, res, funcionName){
	var fechaInicio = req.query.fechaInicio;
	var fechaFin = req.query.fechaFin;
	var $queryWhere="where";
    if($fechaFin!=""){ // se asigno fecha de fin
        $queryWhere=" (fechaAccidente between '"+$fechaInicio+"' and '"+$fechaFin+"')";
    }else{
        $queryWhere=" fechaAccidente = '"+$fechaInicio+"' ";
    }
}