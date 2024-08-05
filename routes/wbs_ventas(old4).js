
// Web service para el modulo Ventas
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
var convertirAfechaString = modulo_global.convertirAfechaString;
var dateTimeFormat = modulo_global.dateTimeFormat;
const tempfile = require('tempfile');
var cantidadDigitosLPAD = 6;

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
exports.buscarConcesionario = function(req, res, funcionName){ // realiza la busqueda de un concesionario
	var nombre = req.query.stringBusqueda;
	if(nombre==''){
		var query = "select * from (select co.idConcesionario, if(c.tipoPersona='J', c.razonSocial, concat(c.nombres,' ',c.apellidoPaterno,' ',c.apellidoMaterno)) as nombre, s.idLocal as idSede from Concesionario co inner join Persona c on co.idPersona = c.idPersona inner join Local s on co.idSede = s.idLocal where co.estado='1' and s.estado='1') as v where v.nombre like '%"+nombre+"%' order by v.nombre";
	}else{
		var query = "select * from (select co.idConcesionario, if(c.tipoPersona='J', concat(c.razonSocial,'/',s.Nombre), concat(concat(c.nombres,' ',c.apellidoPaterno,' ',c.apellidoMaterno),'/',s.Nombre)) as nombre, s.idLocal as idSede from Concesionario co inner join Persona c on co.idPersona = c.idPersona inner join Local s on co.idSede = s.idLocal where co.estado='1' and s.estado='1') as v where v.nombre like '%"+nombre+"%' order by v.nombre";
	}
	var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getCertificados = function(req, res, funcionName){
	var queryWhere = new QueryWhere("");
	var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
	var idSede = req.query.idSede;
	
	if(idSede!=""){
		queryWhere.validarWhere("co.idSede="+idSede);
	}
	if(fechaDesde!="" || fechaHasta!=""){
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere("( c.fechaLiquidacion between '"+fechaDesde+"' and '"+fechaHasta+"' )");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere("c.fechaLiquidacion>='"+fechaDesde+"'");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere("c.fechaLiquidacion<='"+fechaHasta+"'");
            }
        }
    }
	var query = "Select c.nroCAT, date_format(c.fechaEmision, '%d/%m/%Y %H:%i') as fechaEmision, "+
		"date_format(c.fechaInicio, '%d/%m/%Y') as fechaInicio, "+
		"date_format(c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, "+
		"date_format(c.fechaControlInicio, '%d/%m/%Y') as fechaControlInicio, "+
		"date_format(c.fechaControlFin, '%d/%m/%Y') as fechaControlFin, "+
		"c.conDeuda, "+
		"date_format(c.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, "+
		"se.Nombre as nombreSede, "+
		"if(pco.tipoPersona='J', pco.razonSocial, concat(pco.nombres,' ',pco.apellidoPaterno,' ',pco.apellidoMaterno)) as nombreConcesionario, "+
		"c.prima, "+
		"c.aporte, "+
		"c.comision, "+
		"a.idAsociado, "+
		"p.nroDocumento, "+
		"concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAsociado, "+
		"p.razonSocial, v.* , u.nombreUso, cl.nombreClase from Cat c "+
		"inner join Asociado a on c.idAsociado = a.idAsociado "+
		"inner join Persona p on a.idPersona = p.idPersona "+
		"inner join Concesionario co on c.idConcesionario = co.idConcesionario "+
		"inner join Persona pco on co.idPersona = pco.idPersona "+
		"inner join Local se on co.idSede = se.idLocal "+
		"inner join Vehiculo v on c.idVehiculo = v.idVehiculo "+
		"inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo "+
		"inner join Uso_Vehiculo u on ucv.idUso = u.idUso "+
		"inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase "+queryWhere.getQueryWhere()+" limit 950";
	
		ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getCertificadosFactura = function(req, res, funcionName){
    var queryWhere = new QueryWhere("");
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var idSede = req.query.idSede;

    if(idSede!=""){
        queryWhere.validarWhere("co.idSede="+idSede);
    }
    if(fechaDesde!="" || fechaHasta!=""){
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere("( c.fechaLiquidacion between '"+fechaDesde+"' and '"+fechaHasta+"' )");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere("c.fechaLiquidacion>='"+fechaDesde+"'");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere("c.fechaLiquidacion<='"+fechaHasta+"'");
            }
        }
    }
    var query = "Select c.nroCAT, " +
        "date_format(c.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, "+
        "se.Nombre as nombreSede, "+
        "a.idAsociado, "+
        "p.nroDocumento, p.tipoPersona,"+
        "if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreAsociado, "+
        "d.nombre as distrito,"+
        "p.calle, p.nro,"+
        "c.prima, c.aporte, c.comision, "+
        "v.placa, v.marca, v.modelo, v.anno,"+
        "u.nombreUso, cl.nombreClase " +
        "from Cat c "+
        "inner join Asociado a on c.idAsociado = a.idAsociado "+
        "inner join Persona p on a.idPersona = p.idPersona "+
        "inner join Distrito d on p.idDistrito = d.idDistrito "+
        "inner join Concesionario co on c.idConcesionario = co.idConcesionario "+
        "inner join Local se on co.idSede = se.idLocal "+
        "inner join Vehiculo v on c.idVehiculo = v.idVehiculo "+
        "inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo "+
        "inner join Uso_Vehiculo u on ucv.idUso = u.idUso "+
        "inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase "+
        queryWhere.getQueryWhere();
        //+" limit 950";

    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}

exports.buscarCertificado = function(req, res, funcionName){ // realiza la busqueda de un certificado
	var nroCertificado = req.query.nroCertificado;
	var liquidacionPendiente = req.query.liquidacionPendiente;
	var arrayParametros = [nroCertificado];
	if(liquidacionPendiente=='true'){ // realiza la busqueda de certificado distribuidos.
		var queryBusquedaCAT = "Select c.nroCertificado, m.tipOperacion, m.idGuiaSalida, c.estado from Certificado c inner join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento where c.nroCertificado = ? and c.registroEstado='0'";
		ejecutarQUERY_MYSQL(queryBusquedaCAT, arrayParametros, res, funcionName);
	}else{
		// primero realiza la busqueda en la tabla CAT:
		var queryBusquedaCAT = "Select c.nroCAT as nroCertificado, 'CAT' as estado, c.placa, date_format(c.fechaEmision, '%d/%m/%Y %H:%i') as fechaEmision, date_format(c.fechaInicio, '%d/%m/%Y') as fechaInicio, date_format(c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, date_format(c.fechaControlInicio, '%d/%m/%Y') as fechaControlInicio, date_format(c.fechaControlFin, '%d/%m/%Y') as fechaControlFin, c.conDeuda, date_format(c.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, c.idConcesionario, c.prima, c.aporte, c.comision, a.idAsociado, p.tipoPersona, p.nroDocumento from Cat c inner join Asociado a on c.idAsociado = a.idAsociado inner join Persona p on a.idPersona = p.idPersona where c.nroCAT = ? ";
		ejecutarQUERY_MYSQL(queryBusquedaCAT, arrayParametros, res, funcionName, function(res, resultados){
			if(resultados.length==0){
				var nroCertificado = req.query.nroCertificado;
				var query = "Select c.nroCertificado, c.estadoCertificadoAntiguo as estado, m.estado as estadoMovimiento from Certificado c left join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento where c.nroCertificado = ? and c.registroEstado='0'";
				var arrayParametros = [nroCertificado];
				ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName); 
			}else{
				enviarResponse(res, resultados); // envia los resultados del CAT encontrado
			}
		});
	}
	
}
exports.getPersonaByNroDoc = function(req, res, funcionName){
    var nroDoc = req.query.nroDoc;
    var query="call sp_getPersonaByNroDoc(?)";
    var arrayParametros = [nroDoc];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getConos = function(req, res, funcionName){
	var query = "Select idLocal as idSede, Nombre as nombreSede from Local where estado='1' order by Nombre";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAllUsos = function(req, res, funcionName){
	var query = "Select idUso, nombreUso from Uso_Vehiculo order by nombreUso";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAllClasesXuso = function(req, res, funcionName){
	var query = "Select Distinct ucv.idUsoClaseVehiculo as idClase, cv.nombreClase, ucv.idUso, ucv.prima, ucv.montoPoliza from UsoClaseVehiculo ucv inner join Clase_Vehiculo cv on ucv.idClaseVehiculo = cv.idClase order by cv.nombreClase";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.buscarPlaca = function(req, res, funcionName){
	var placa = req.query.placa;
	var query = "Select v.idVehiculo, ucv.idUso, v.marca, v.modelo, v.anno, v.nroAsientos, v.nroSerieMotor, v.idUsoClaseVehiculo as idClase from Vehiculo v inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo where v.placa = ? ";
	var arrayParametros = [placa];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.actualizarCAT = function(req, res, funcionName){
	var idConcesionario = req.query.idConcesionario;
	var fechaEmision = req.query.fechaEmision;
	var fechaV_inicio = req.query.fechaV_inicio;
	var fechaV_fin = req.query.fechaV_fin;
	var fechaCP_inicio = req.query.fechaCP_inicio;
	var fechaCP_fin = req.query.fechaCP_fin;
	var idPersona = req.query.idPersona;
	var tipoPersona = req.query.tipoPersona;
	var DNI = req.query.DNI;
	var nombres = req.query.nombres;
	var apePat = req.query.apePat;
	var apeMat = req.query.apeMat;
	var razonSocial = req.query.razonSocial;
	var telf = req.query.telf;
	var idDistrito = req.query.idDistrito;
	var direccion = req.query.direccion;
	var idVehiculo = req.query.idVehiculo;
	var placa = req.query.placa;
	var idUso = req.query.idUso;
	var idClase = req.query.idClase;
	var marca = req.query.marca;
	var anno = req.query.anno;
	var serieMotor = req.query.serieMotor;
	// guarda o actualiza la personalbar
	var persona={};
	persona.idPersona=idPersona;
	persona.tipoPersona = tipoPersona;
	persona.nombres=nombres; 
	persona.paterno=apePat; 
	persona.materno=apeMat;
	persona.razonSocial=razonSocial;
	persona.DNI=DNI;
	persona.telf=telf;
	persona.idDistrito=idDistrito;
	persona.direccion=direccion;
	
	abstractGuardarActualizarPersona(res, funcionName, persona, function(idPersona_Asociado){
		// guarda el asociado:
		var query = "update Asociado set idPersona=? where idAsociado=?";
		var parametros = [idPersona_Asociado, req.query.idAsociado];
		ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function(res, resultados){
			
			// guarda o actualiza un vehiculo
			var vehiculo = {};
			
			vehiculo.idVehiculo= req.query.idVehiculo; 
			vehiculo.placa= req.query.placa; 
			vehiculo.idClase= req.query.idClase; 
			vehiculo.idUso= req.query.idUso; 
			vehiculo.marca= req.query.marca;
			vehiculo.modelo= req.query.modelo;
			vehiculo.anno= req.query.anno;
			vehiculo.nroSerieMotor=req.query.serieMotor;
			vehiculo.nroAsientos = req.query.nroAsientos;
			
			abstractGuardarActualizarVehiculo(res, funcionName, vehiculo, function(idVehiculo_CAT){
				// actualiza el cat
				var idUsuarioUpdate = req.query.idUsuarioUpdate;
				
				var queryInsertCat = "Update Cat set placa=?, marca=?, modelo=?, annoFabricacion=?, nMotorserie=?, fechaInicio=?, fechaCaducidad=?, idConcesionario=?, fechaEmision=?, fechaControlInicio=?, fechaControlFin=?, idVehiculo=?, conDeuda=?, fechaLiquidacion=?, prima=?, comision=?, aporte=?, ultActualizaFecha=now(), ultActualizaUsuario=? where nroCAT=? ";
				
				var parametros = [req.query.placa, req.query.marca, req.query.modelo, req.query.anno, req.query.serieMotor, req.query.fechaV_inicio, req.query.fechaV_fin, req.query.idConcesionario, req.query.fechaEmision, req.query.fechaCP_inicio, req.query.fechaCP_fin, idVehiculo_CAT, req.query.conDeuda, req.query.fechaLiquidacion, req.query.prima, req.query.comision, req.query.aporte, idUsuarioUpdate, req.query.nroCertificado];
				
				ejecutarQUERY_MYSQL(queryInsertCat, parametros, res, funcionName, "affectedRows");
			});
		});
	});
}
exports.anularCAT = function(req, res, funcionName){
	var nroCertificado = req.query.nroCertificado;
	var queryDelete = "Delete from Cat_anulados where nroCAT = ?";
	var params = [nroCertificado]
	ejecutarQUERY_MYSQL(queryDelete, params, res, funcionName, function(res, resultados){
		// copia los datos del cat a la tabla Cat_anulados.
		var queryInsert = "Insert into Cat_anulados select * from Cat where nroCAT = ?";
		var params = [req.query.nroCertificado];
		ejecutarQUERY_MYSQL(queryInsert, params, res, funcionName, function(res, resultados){
			// Elimina el cat:
			var deleteCat = "Delete from Cat where nroCAT = ?";
			var parametros = [req.query.nroCertificado];
			ejecutarQUERY_MYSQL(deleteCat, parametros, res, funcionName, "affectedRows");
			// vuelve al estado anterior del certificado.
			var actualizarCertificado = "Update Certificado set estadoRegistroCAT='0', ultActualizaFecha=now(), ultActualizaUsuario=? where nroCertificado=? and registroEstado='0'"
			var nroCertificado = req.query.nroCertificado;
			var idUsuarioUpdate = req.query.idUsuarioUpdate;
			var params = [idUsuarioUpdate, nroCertificado]
			ejecutarQUERY_MYSQL(actualizarCertificado, params, res, funcionName, "false");
		})
	})
}
exports.guardarCAT = function(req, res, funcionName){
	var idConcesionario = req.query.idConcesionario;
	var fechaEmision = req.query.fechaEmision;
	var fechaV_inicio = req.query.fechaV_inicio;
	var fechaV_fin = req.query.fechaV_fin;
	var fechaCP_inicio = req.query.fechaCP_inicio;
	var fechaCP_fin = req.query.fechaCP_fin;
	var idPersona = req.query.idPersona;
	var tipoPersona = req.query.tipoPersona;
	var DNI = req.query.DNI;
	var nombres = req.query.nombres;
	var apePat = req.query.apePat;
	var apeMat = req.query.apeMat;
	var razonSocial = req.query.razonSocial;
	var telf = req.query.telf;
	var idDistrito = req.query.idDistrito;
	var direccion = req.query.direccion;
	var idVehiculo = req.query.idVehiculo;
	var placa = req.query.placa;
	var idUso = req.query.idUso;
	var idClase = req.query.idClase;
	var marca = req.query.marca;
	var anno = req.query.anno;
	var serieMotor = req.query.serieMotor;
	// guarda o actualiza la personalbar
	var persona={};
	persona.idPersona=idPersona;
	persona.tipoPersona = tipoPersona;
	persona.nombres=nombres; 
	persona.paterno=apePat; 
	persona.materno=apeMat;
	persona.razonSocial=razonSocial;
	persona.DNI=DNI;
	persona.telf=telf;
	persona.idDistrito=idDistrito;
	persona.direccion=direccion;	
	
	// guarda o se actualiza una persona, el ID de la Persona es retornada en la funcion callback (idPersona_Asociado)
	abstractGuardarActualizarPersona(res, funcionName, persona, function(idPersona_Asociado){
		// guarda el asociado:
		var query = "Insert into Asociado (idPersona) values (?)";
		var parametros = [idPersona_Asociado];
		ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function(res, resultados){
			var idAsociado = resultados.insertId; // obtiene el id del asociado registrado
			req.query.idAsociado = idAsociado;
			// guarda o actualiza un vehiculo
			var vehiculo = {};			
			vehiculo.idVehiculo= req.query.idVehiculo; 
			vehiculo.placa= req.query.placa; 
			vehiculo.idClase= req.query.idClase; 
			vehiculo.idUso= req.query.idUso; 
			vehiculo.marca= req.query.marca;
			vehiculo.modelo= req.query.modelo;
			vehiculo.anno= req.query.anno;
			vehiculo.nroSerieMotor=req.query.serieMotor;
			vehiculo.nroAsientos = req.query.nroAsientos;
			
			// guarda o se actualiza el vehiculo, el ID del vehiculo es retornado en la funcion callback (idVehiculo_CAT)
			abstractGuardarActualizarVehiculo(res, funcionName, vehiculo, function(idVehiculo_CAT){
				// guarda el cat
				var queryInsertCat = "Insert into Cat (nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, fechaInicio, fechaCaducidad, idConcesionario, fechaEmision, fechaControlInicio, fechaControlFin, idVehiculo, conDeuda, fechaLiquidacion, prima, comision, aporte) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
				
				var parametros = [req.query.nroCertificado, req.query.idAsociado, req.query.placa, req.query.marca, req.query.modelo, req.query.anno,	req.query.serieMotor, req.query.fechaV_inicio, req.query.fechaV_fin, req.query.idConcesionario, req.query.fechaEmision, req.query.fechaCP_inicio, req.query.fechaCP_fin,
				idVehiculo_CAT, req.query.conDeuda, req.query.fechaLiquidacion, req.query.prima, req.query.comision, req.query.aporte];
				
				ejecutarQUERY_MYSQL(queryInsertCat, parametros, res, funcionName, function(res, results){
					var affectedRows = [results.affectedRows];
					enviarResponse(res, affectedRows);// envia como respuesta al cliente el numero de filas afectadas
					// actualiza el estado del certificado.
					var liquidacionPendiente = req.query.liquidacionPendiente;
					var estado = '9';
					if(liquidacionPendiente == 'true'){
						estado = '8'; // Certificado con liquidacion pendiente por registrar.
					}
					var idUsuario = req.query.idUsuarioUpdate;
					var nroCertificado = req.query.nroCertificado;
					var updateCertificado = "Update Certificado set estadoRegistroCAT = ?, ultActualizaUsuario = ?, ultActualizaFecha = now() where nroCertificado=? and registroEstado='0'"; // cambia el estado del certificado a vendido
					var params = [estado, idUsuario, nroCertificado];
					ejecutarQUERY_MYSQL(updateCertificado, params, res, funcionName, "false");
				});
			});
		});
	});
}
function abstractGuardarActualizarVehiculo(res, funcionName, vehiculo, callback){ // Guarda o actualiza un vehiculo
	var queryInsert = "Insert into Vehiculo (placa, idUsoClaseVehiculo, marca, modelo, anno, nroSerieMotor, nroAsientos) values (?,?,?,?,?,?,?)";
	var queryUpdate = "Update Vehiculo set idUsoClaseVehiculo=?, marca=?, modelo=?, anno=?, nroSerieMotor=?, nroAsientos=? where idVehiculo=?";
	if(vehiculo.idVehiculo ==0){ // Vehiculo  no existe, por lo tanto se registra uno nuevo
		ejecutarQUERY_MYSQL(queryInsert, [vehiculo.placa, vehiculo.idClase, vehiculo.marca, vehiculo.modelo, vehiculo.anno, vehiculo.nroSerieMotor, vehiculo.nroAsientos], res, funcionName, function(res, resultados){
            if(typeof  callback == 'function'){
               var idVehiculo = resultados.insertId;
                vehiculo.idVehiculo=idVehiculo;
                callback(idVehiculo); // Devuelve el id del vehiculo registrado en la funcion callback
            }
        });
	}else{
		ejecutarQUERY_MYSQL(queryUpdate, [vehiculo.idClase, vehiculo.marca, vehiculo.modelo, vehiculo.anno, vehiculo.nroSerieMotor, vehiculo.nroAsientos, vehiculo.idVehiculo], res, funcionName, function(res, resultados){
            if(typeof  callback == 'function'){
                callback(vehiculo.idVehiculo); // Devuelve el id del vehiculo actualizado en la funcion callback
            }
        });
	}
}
function abstractGuardarActualizarPersona(res, funcionName, persona, callback){ // Guarda o actualiza una Persona
    
	var queryInsert = "Insert into Persona (tipoPersona, razonSocial, nombres, apellidoPaterno, apellidoMaterno, nroDocumento, idDistrito, calle, telefonoMovil) values (?,?,?,?,?,?,?,?,?)";
    var queryUpdate = "Update Persona set tipoPersona=?, razonSocial=?, nombres = ?, apellidoPaterno = ?, apellidoMaterno = ? , idDistrito=?, calle = ?, telefonoMovil=? where idPersona = ? ";
    
    if(persona.idPersona==0){ // se registra una nueva persona
        ejecutarQUERY_MYSQL(queryInsert, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.paterno, persona.materno, persona.DNI, persona.idDistrito, persona.direccion,  persona.telf ], res, funcionName, function(res, resultados){
            if(typeof  callback == 'function'){
               var idPersona = resultados.insertId;
                persona.idPersona=idPersona;
                callback(idPersona); // Devuelve el id de la Persona registrada
            }
        });
    }else{ // solo se actualizara el registro de la persona
        ejecutarQUERY_MYSQL(queryUpdate, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.paterno, persona.materno, persona.idDistrito, persona.direccion, persona.telf, persona.idPersona], res, funcionName, function(res, resultados){
            if(typeof  callback == 'function'){
                callback(persona.idPersona); // Devuelve el id de la persona actualizada
            }
        });
    }
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
/** CUS 04: AS-VTAS_CU_004 **/
exports.getLocales = function(req, res, funcionName){
	var query = "Select idLocal, Nombre as nombreLocal from Local where estado='1' order by Nombre";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAlmacenes = function(req, res, funcionName){
	var query = "Select idAlmacen, idLocal, nombre as nombreAlmacen, nombreBreve from Almacen order by nombre, nombreBreve";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getListaGuias = function(req, res, funcionName){ // Obtiene las guías de ingreso (ING) y de salida (SAL).
	// Parametros GET:
	var tipo = req.query.tipo; // Tipo de Guia: ING=Ingreso; SAL=Salida	
	var queryWhere = new QueryWhere(" where g.tipoOperacion='"+tipo+"' and g.registroEstado = '0' "); // agrega el filtro de tipo de Guia
	var idAlmacen = req.query.idAlmacen;	
	var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;	
	var conjutoAlmacenes = req.query.conjutoAlmacenes;
	
	if(idAlmacen!=""){
		queryWhere.validarWhere("a.idAlmacen="+idAlmacen);
	}else{
		// verifica que solo se filtren los almacenes correctos
		if(conjutoAlmacenes!=""){
			queryWhere.validarWhere("a.idAlmacen in ("+conjutoAlmacenes+") ");
		}
	}
	if(fechaDesde!="" || fechaHasta!=""){
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere("( g.fechaOperacion between '"+fechaDesde+"' and '"+fechaHasta+"' )");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere("g.fechaOperacion>='"+fechaDesde+"'");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere("g.fechaOperacion<='"+fechaHasta+"'");
            }
        }
    }
	var query = "select g.idGuia_movimiento_cabecera as idGuia, g.idAlmacen, g.idProveedor, if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno))  as nombreProveedor, g.nroGuiaManual as nroGuia, "+
		"date_format(g.fechaOperacion, '%d/%m/%Y') as fechaRegistro, g.tipoOperacion as tipo, a.nombreBreve as nombreAlmacen, concat(u.Nombres,' ',u.Apellidos) as usuarioResponsable from Guia_movimiento_cabecera g "+
		"left join Proveedor pro on g.idProveedor = pro.idProveedor "+
		"left join Persona p on pro.idPersona = p.idPersona "+
		"left join UsuarioIntranet u on g.idUsuarioResp = u.idUsuario "+
		"inner join Almacen a on g.idAlmacen = a.idAlmacen "+queryWhere.getQueryWhere()+" order by g.fechaOperacion desc";

	//** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
	
	query = agregarLimit(page, registrosxpagina, query);
	ejecutarQUERY_MYSQL(query,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
			if(cantPaginas==0){
				var queryCantidad="select count(*) as cantidad from Guia_movimiento_cabecera g "+
					"left join Proveedor p on g.idProveedor = p.idProveedor "+
					"inner join Almacen a on g.idAlmacen = a.idAlmacen "+queryWhere.getQueryWhere()+" order by g.fechaOperacion desc";
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
exports.getProveedores = function(req, res, funcionName){ 
	var query = "Select * from (Select pro.idProveedor, if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreProveedor from Proveedor pro inner join Persona p on pro.idPersona = p.idPersona) as v order by v.nombreProveedor ";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getArticulosXalmacen = function(req, res, funcionName){
	var idAlmacen = req.query.idAlmacen;
	var arrayParametros=[];
	if(idAlmacen!="0"){
		var query = "Select aa.idArticulos_almacen, aa.idArticulo, if(a.esCAT='S', Concat(a.descripcion,' [--CAT--]'), a.descripcion) as descripcion from Articulos_almacen aa inner join Articulo a on aa.idArticulo = a.idArticulo where aa.idAlmacen=?";	
		arrayParametros = [idAlmacen];
	}else{
		var query = "Select idArticulo, if(esCAT='S', Concat(descripcion,' [--CAT--]'), descripcion) as descripcion from Articulo where esCAT='S' order by descripcion asc";
	}	
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAlmacenesXlocal = function(req, res, funcionName){
	var idLocal = req.query.idLocal;
	var queryWhere = "";
	if(idLocal!="0"){
		queryWhere=" where idLocal = '"+idLocal+"'";
	}
	var query = "Select idAlmacen, nombre as nombreAlmacen, nombreBreve from Almacen "+queryWhere+" order by nombre, nombreBreve";
	ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
function actualizarUltimoMovimientoEnCertificados(res, funcionName, certificadoInicio, certificadoFin){
	
	var queryUpdate = "Update Certificado c set c.ultimoMovimiento = (Select max(m.idCertificado_movimiento) from Certificado_movimiento m where m.nroCertificado=c.nroCertificado) "+
	" where c.registroEstado='0' and c.nroCertificado between "+parseInt(certificadoInicio)+" and "+parseInt(certificadoFin);
	
	ejecutarQUERY_MYSQL(queryUpdate, [], res, funcionName, "false");
}
function registrarCertificados(indice, listaCATS, idProveedor, res, funcionName, callback){
	if(idProveedor!=""){
		var queryInsertCertificados = "Insert into Certificado(nroCertificado, idArticulo)";				
		var values = " values ";
					
		for(var z=parseInt(listaCATS[indice].nroInicio); z<=parseInt(listaCATS[indice].nroFinal); z++){
			if(z>parseInt(listaCATS[indice].nroInicio)){
				values = values+", ";
			}
			values = values+" ('"+z+"', '"+listaCATS[indice].codArticulo+"')";
		}
		queryInsertCertificados = queryInsertCertificados+values;		
		ejecutarQUERY_MYSQL_Extra({indice:indice, listaCATS:listaCATS, res:res, funcionName:funcionName}, queryInsertCertificados, [], res, funcionName, function(res, results, row){
			callback(row.indice, row.listaCATS, row.res, row.funcionName);
		})
	}else{
		callback(indice, listaCATS, res, funcionName);
	}
}
exports.guardarGuia = function(req, res, funcionName){
	var tipo = req.body.tipo;
	if(tipo=='DEV' || tipo=='DIST'){
		var fecha = req.body.fecha;
		var concesionario = req.body.concesionario;
		var nroGuia = req.body.nroGuia;
		var idUsuarioDestino = req.body.idUsuarioDestino;		
		var idUsuario = req.body.idUsuario;
		
		var queryInsertGuia = "Insert into Guia_movimiento_cabecera(tipoOperacion, fechaOperacion, idConcesionario, idUsuario, idUsuarioResp, nroGuiaManual) values (?,?,?,?,?,?)"; // Registra la guia
		
		var arrayParametros = [tipo, fecha, concesionario, idUsuario, idUsuarioDestino, nroGuia];
		ejecutarQUERY_MYSQL(queryInsertGuia, arrayParametros, res, funcionName, function(res, resultados){
			var idGuia = resultados.insertId;
			var listaCATS = [];
			
			var listaDetalles = req.body.detalle;
			
			for(var i=0; i<listaDetalles.length; i++){
				if((listaDetalles[i].descArticulo).indexOf("[--CAT--]") >= 0){ // CAT
					listaCATS.push(listaDetalles[i]);
				}
				// inserta el detalle:
				var queryInsertDetalle = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo,	unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values (?,?,?,?,?,?,?)";
				
				var parametrosDetalle = [idGuia, listaDetalles[i].codArticulo, listaDetalles[i].unidad, listaDetalles[i].cantidad, listaDetalles[i].nroInicio, listaDetalles[i].nroFinal, listaDetalles[i].observaciones];
				
				console.log("Insertando detalles");
				ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
			}
			// Registra los CATS:
			if(tipo=='DIST'){
				for(var y=0; y<listaCATS.length; y++){
				
					var queryInsertCATS = "Insert into Certificado_movimiento(nroCertificado, idArticulo, tipOperacion, idUbicacion, idUsuarioResp, idGuia)";
					
					var values = " values ";
					
					for(var z=parseInt(listaCATS[y].nroInicio); z<=parseInt(listaCATS[y].nroFinal); z++){
						if(z>parseInt(listaCATS[y].nroInicio)){
							values = values+", ";
						}
						values = values+" ('"+z+"', '"+listaCATS[y].codArticulo+"', 'E', '"+req.body.concesionario+"', '"+req.body.idUsuario+"', '"+idGuia+"')";
					}
					queryInsertCATS = queryInsertCATS+values;
					//console.log("Insertando certificados");
					ejecutarQUERY_MYSQL_Extra({nroInicio:listaCATS[y].nroInicio, nroFinal:listaCATS[y].nroFinal}, queryInsertCATS, [], res, funcionName, function(res, results, row){
						// actualiza ultimo movimiento del certificado:
						actualizarUltimoMovimientoEnCertificados(res, funcionName, row.nroInicio, row.nroFinal);
					});					
				}
			}else{ // DEV = Devolucion
				// Ingresa la fecha de salida de los CATS:
				var updateFechaSalidaCAT = "Update Certificado_movimiento set fechaSalida=now(), idGuiaSalida='"+idGuia+"' where nroCertificado in ";
				
				var listaCertificados = [];
				
				for(var y=0; y<listaCATS.length; y++){
					
					for(var z=parseInt(listaCATS[y].nroInicio); z<=parseInt(listaCATS[y].nroFinal); z++){
				
						listaCertificados.push(z);
					}
				
				}
				if(listaCertificados.length>0){
					updateFechaSalidaCAT = updateFechaSalidaCAT+"("+listaCertificados+") and idUbicacion=? and (fechaSalida is null or fechaSalida = '0000-00-00 00:00:00')";
					ejecutarQUERY_MYSQL(updateFechaSalidaCAT, [req.body.concesionario], res, funcionName, "false");
				}
			}			
			enviarResponse(res, [idGuia]);
		});		
	}
	if(tipo=='ING'){ // para ingresos
		var fecha = req.body.fecha;
		var almacen = req.body.almacen;
		var proveedor = req.body.proveedor;
		var ordenCompra = req.body.ordenCompra;
		var docRef = req.body.docRef;		
		var idUsuario = req.body.idUsuario;
		
		/*var idAlmacenOrigen = req.body.idAlmacenOrigen;
		var idUsuarioRespOrigen = req.body.idUsuarioRespOrigen;
		var idGuiaOrigen = req.body.idGuiaOrigen;*/
		
		var queryInsertGuia = "Insert into Guia_movimiento_cabecera(tipoOperacion, fechaOperacion, idAlmacen, idUsuario, idProveedor, docRefProveedor, idOrdenCompra) values (?,?,?,?,?,?,?)";
		
		var arrayParametros = [tipo, fecha, almacen, idUsuario, proveedor, docRef, ordenCompra];
		ejecutarQUERY_MYSQL(queryInsertGuia, arrayParametros, res, funcionName, function(res, resultados){
			var idGuia = resultados.insertId;
			var listaCATS = [];
			
			var listaDetalles = req.body.detalle;
			
			for(var i=0; i<listaDetalles.length; i++){
				if((listaDetalles[i].descArticulo).indexOf("[--CAT--]") >= 0){ // CAT
					listaCATS.push(listaDetalles[i]);
				}
				// inserta el detalle:
				var queryInsertDetalle = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo,	unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values (?,?,?,?,?,?,?)";
				
				var parametrosDetalle = [idGuia, listaDetalles[i].codArticulo, listaDetalles[i].unidad, listaDetalles[i].cantidad, listaDetalles[i].nroInicio, listaDetalles[i].nroFinal, listaDetalles[i].observaciones];
				
				console.log("Insertando detalles");
				ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
				
				// actualiza stock en almacen por articulo				
				var queryUpdateStockAlmacen = "Update Articulos_almacen set stock=stock+"+listaDetalles[i].cantidad+" where idArticulo='"+listaDetalles[i].codArticulo+"' and idAlmacen='"+req.body.almacen+"'";				
				ejecutarQUERY_MYSQL(queryUpdateStockAlmacen, [], res, funcionName, "false");
				
				var idProveedor = req.body.proveedor;
				if(idProveedor!=""){ // no proviene de una guia sino de un proveedor
					// actualiza stock general del articulo
					var queryUpdateStockGeneral = "Update Articulo set stock=stock+"+listaDetalles[i].cantidad+" where idArticulo='"+listaDetalles[i].codArticulo+"'";
					ejecutarQUERY_MYSQL(queryUpdateStockGeneral, [], res, funcionName, "false");
				}/*else{
					var updateCantidadPendSalida = "Update Guia_movimiento_detalle set cantidadPendienteSalida=cantidadPendienteSalida-"+listaDetalles[i].cantidad+" where idArticulo=? and idGuia_movimiento_cabecera=?";
					
					var params = [listaDetalles[i].codArticulo, idGuiaOrigen];
					ejecutarQUERY_MYSQL(updateCantidadPendSalida, params, res, funcionName, "false");
				}*/				
			}
			// Registra los movimientos de CATS:
			for(var y=0; y<listaCATS.length; y++){
				var idProveedor = req.body.proveedor;
				registrarCertificados(y, listaCATS, idProveedor, res, funcionName, function(y, listaCATS, res, funcionName){
					
					var queryInsertCATS = "Insert into Certificado_movimiento(nroCertificado, idArticulo, tipOperacion, estado, idUbicacion, idUsuarioResp, idGuia)";				
					var values = " values ";
					
					for(var z=parseInt(listaCATS[y].nroInicio); z<=parseInt(listaCATS[y].nroFinal); z++){
						if(z>parseInt(listaCATS[y].nroInicio)){
							values = values+", ";
						}
						var estadoCAT = 'D';
						if(listaCATS[y].estado!=''){
							estadoCAT = listaCATS[y].estado;
						}
						values = values+" ('"+z+"', '"+listaCATS[y].codArticulo+"', 'I', '"+estadoCAT+"', '"+req.body.almacen+"', '"+req.body.idUsuario+"', '"+idGuia+"')";
					}
					queryInsertCATS = queryInsertCATS+values;
					
					ejecutarQUERY_MYSQL_Extra({nroInicio:listaCATS[y].nroInicio, nroFinal:listaCATS[y].nroFinal}, queryInsertCATS, [], res, funcionName, function(res, results, row){
						// actualiza ultimo movimiento del certificado:
						actualizarUltimoMovimientoEnCertificados(res, funcionName, row.nroInicio, row.nroFinal);
					});						
				});
			}
			enviarResponse(res, [idGuia]);
		});		
	}
	if(tipo=='SAL'){
		var fecha = req.body.fecha;
		var almacen = req.body.almacen;
		var idUsuarioDestino = req.body.idUsuarioDestino;	
		var idUsuario = req.body.idUsuario;
		
		var queryInsertGuia = "Insert into Guia_movimiento_cabecera(tipoOperacion, fechaOperacion, idAlmacen, idUsuario, idUsuarioResp) values (?,?,?,?,?)";
		
		var arrayParametros = [tipo, fecha, almacen, idUsuario, idUsuarioDestino];
		ejecutarQUERY_MYSQL(queryInsertGuia, arrayParametros, res, funcionName, function(res, resultados){
			var idGuia = resultados.insertId;
			var listaCATS = [];
			
			var listaDetalles = req.body.detalle;
			
			for(var i=0; i<listaDetalles.length; i++){
				if((listaDetalles[i].descArticulo).indexOf("[--CAT--]") >= 0){ // CAT
					listaCATS.push(listaDetalles[i]);
				}
				// inserta el detalle:
				var queryInsertDetalle = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo,	unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values (?,?,?,?,?,?,?)";
				
				var parametrosDetalle = [idGuia, listaDetalles[i].codArticulo, listaDetalles[i].unidad, listaDetalles[i].cantidad, listaDetalles[i].nroInicio, listaDetalles[i].nroFinal, listaDetalles[i].observaciones];
				
				console.log("Insertando detalles");
				ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
				
				// actualiza stock en almacen por articulo (Resta)
				var queryUpdateStockAlmacen = "Update Articulos_almacen set stock=stock-"+listaDetalles[i].cantidad+" where idArticulo='"+listaDetalles[i].codArticulo+"' and idAlmacen='"+req.body.almacen+"'";				
				ejecutarQUERY_MYSQL(queryUpdateStockAlmacen, [], res, funcionName, "false");

				var esVenta = req.body.esVenta; // si los articulos seran vendidos se actualiza el stock global
				console.log("Es Venta : "+esVenta);
				if(esVenta==true || esVenta=='true'){
					// actualiza stock general del articulo
					var queryUpdateStockGeneral = "Update Articulo set stock=stock-"+listaDetalles[i].cantidad+" where idArticulo='"+listaDetalles[i].codArticulo+"'";
					ejecutarQUERY_MYSQL(queryUpdateStockGeneral, [], res, funcionName, "false");
				}
				
			}
			// Ingresa la fecha de salida de los CATS:
			var updateFechaSalidaCAT = "Update Certificado_movimiento set fechaSalida=now(), idGuiaSalida='"+idGuia+"' where nroCertificado in "
			var listaCertificados = [];
			for(var y=0; y<listaCATS.length; y++){
				
				/*var queryInsertCATS = "Insert into Certificado_movimiento(nroCertificado, idArticulo, estado, idUbicacion, idUsuarioResp, idGuia)";
				
				var values = " values ";*/
				
				for(var z=parseInt(listaCATS[y].nroInicio); z<=parseInt(listaCATS[y].nroFinal); z++){
					/*if(z>parseInt(listaCATS[y].nroInicio)){
						values = values+", ";
					}
					values = values+" ('"+z+"', '"+listaCATS[y].codArticulo+"', 'S', '"+req.body.almacen+"', '"+req.body.idUsuarioDestino+"', '"+idGuia+"')";*/
					listaCertificados.push(z);
				}
				/*queryInsertCATS = queryInsertCATS+values;
				console.log("Insertando certificados");
				ejecutarQUERY_MYSQL(queryInsertCATS, [], res, funcionName, "false");*/
			}
			if(listaCertificados.length>0){
				updateFechaSalidaCAT = updateFechaSalidaCAT+"("+listaCertificados+") and idUbicacion=? and (fechaSalida is null or fechaSalida = '0000-00-00 00:00:00')";
				ejecutarQUERY_MYSQL(updateFechaSalidaCAT, [req.body.almacen], res, funcionName, "false");
			}			
			enviarResponse(res, [idGuia]);
		});
	}
}
exports.getDetallesGuia = function(req, res, funcionName){
	var idGuia = req.query.idGuia;
	
	var queryCabecera = "Select date_format(fechaOperacion, '%d/%m/%Y') as fechaOperacion, idAlmacen, if(idProveedor=0, '', idProveedor) as idProveedor, docRefProveedor, if(idConcesionario=0, '', idConcesionario) as idConcesionario, idUsuarioResp, tipoOperacion, idOrdenCompra from Guia_movimiento_cabecera where idGuia_movimiento_cabecera = ?";
	
	var parametros = [idGuia];
	ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function(res, resultados){
		// busca los detalles:
		query = "Select gd.idGuia_movimiento_detalle as idDetalle, gd.idArticulo as codArticulo, a.descripcion as descArticulo, gd.unidad, gd.cantidad, gd.nroCertificadoInicio as nroInicio, gd.nroCertificadoFin as nroFinal, gd.observacion as observaciones from Guia_movimiento_detalle gd inner join Articulo a on gd.idArticulo = a.idArticulo where gd.idGuia_movimiento_cabecera=?";
		
		var parametros = [req.query.idGuia];
		ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName, function(res2, results, resultados){
			resultados[0].detalle = results;
			enviarResponse(res, resultados);
		})
	});
}
/*
exports.getGuiasXusuarioResp = function(req, res, funcionName){
	var idUsuarioResp = req.query.idUsuarioResp;
	var query = "Select  LPAD(g.idGuia_movimiento_cabecera, 4, '0') as idGuia, g.idAlmacen, concat(LPAD(g.idGuia_movimiento_cabecera, 4, '0'),' / ',a.nombreBreve) as descripcionGuia from Guia_movimiento_cabecera g inner join Almacen a on g.idAlmacen = a.idAlmacen where g.idUsuarioResp = ? order by g.idGuia_movimiento_cabecera";
	var arrayParametros = [idUsuarioResp];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
		// Busca los detalles
		if(resultados.length>0){
			var idGuiaArray = [];
			for(var i=0; i<resultados.length; i++){
				idGuiaArray.push(resultados[i].idGuia);
			}
			var query2 = "Select LPAD(idGuia_movimiento_cabecera, 4, '0') as idGuia, idArticulo , cantidadPendienteSalida from Guia_movimiento_detalle where idGuia_movimiento_cabecera in ("+idGuiaArray+") order by idGuia_movimiento_cabecera desc";
			ejecutarQUERY_MYSQL_Extra(resultados, query2, [], res, funcionName, function(res2, results, resultados){
				for(var i=0; i<resultados.length; i++){
					resultados[i].guia_detalle=[];
					for(var y=0; y<results.length; y++){
						if(results[y].idGuia == resultados[i].idGuia){
							resultados[i].guia_detalle.push(results[y]);
						}
					}
				}
				enviarResponse(res, resultados);
			});
		}else{
			enviarResponse(res, resultados);
		}
	}); 
}*/
/** fin de CUS04 **/
// CUS 05
exports.getUsuarios = function(req, res, funcionName){
	var idUsuarioActual = req.query.idUsuario;
	var query = "Select u.idUsuario, concat(u.Nombres,' ',u.Apellidos) as nombreUsuario, p.idPromotor from UsuarioIntranet u left join Promotor p on u.idUsuario = p.idUsuario where u.idUsuario!=?";
	var idLocal = parseInt(req.query.idLocal);
	if(idLocal>0){
		query = query+" and idLocal = '"+idLocal+"'";
	}
	query = query+" order by concat(u.Nombres,' ',u.Apellidos)";
	var arrayParametros = [idUsuarioActual];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.stockArticuloXalmacen = function(req, res, funcionName){
	var idArticulo = req.query.idArticulo;
	var idAlmacen = req.query.idAlmacen;
	var query = "Select stock from Articulos_almacen where idArticulo=? and idAlmacen=?";
	var arrayParametros = [idArticulo, idAlmacen];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.verficarDisponibilidadCATS = function(req, res, funcionName){ // verifica la disponibilidad de salida o ingreso de los CATS
	var nroInicio = req.query.nroInicio;
	var nroFinal = req.query.nroFinal;
	var idAlmacen = req.query.idAlmacen;
	var idArticulo = req.query.idArticulo;
	var tipo = req.query.tipo;
	var query = "";
	var subQuery = "";
	
	if(tipo=='S'){ // certificados que se han retirado de un almacen y que ingresaran en otro
		// verifica existencia de CATS
		var queryExistencia = "SELECT nroCertificado FROM Certificado where nroCertificado between ? and ? and registroEstado='0' and ultimoMovimiento>0 order by nroCertificado"; // Filtra solo los certificados nuevos que tengan "Ultimo movimiento"
		var params = [nroInicio, nroFinal];
		ejecutarQUERY_MYSQL(queryExistencia, params, res, funcionName, function(res, resultados){
			var idProveedor = req.query.idProveedor;
			if(idProveedor!=""){
				if(resultados.length>0){
					var inicioCertif = resultados[0].nroCertificado;
					var finCertif = resultados[resultados.length-1].nroCertificado;
					if(resultados.length==1){
						enviarResponse(res, [false, "Ya encuentra registrado el CAT Nro: "+inicioCertif]);
					}else{
						enviarResponse(res, [false, "Ya se encuentran registrado los CATs del : "+inicioCertif+" al "+finCertif]);
					}
				}else{
					enviarResponse(res, []);
				}
			}else{
				var cantidadTotal = parseInt(req.query.nroFinal)-parseInt(req.query.nroInicio)+1;
				if(cantidadTotal == resultados.length){
					
					var arrayParametros;
					
					subQuery = " and ( estado in ('A', 'V', 'R') or fechaSalida is null)";
					
					query = "select nroCertificado, idUbicacion, estado, fechaSalida from Certificado_movimiento where (nroCertificado between ? and ? ) "+	subQuery+" and idArticulo=? and registroEstado='0' order by nroCertificado";
					
					arrayParametros = [nroInicio, nroFinal, idArticulo];
					ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
				}else{				
					if(resultados.length==0){
						enviarResponse(res, [false, "No existe ningun registro de los CAT's"]);
					}else{
						var inicioCertif = resultados[0].nroCertificado;
						var finCertif = resultados[resultados.length-1].nroCertificado;
						if(resultados.length==1){
							enviarResponse(res, [false, "Solo se encuentra registrado el CAT Nro: "+inicioCertif]);
						}else{
							enviarResponse(res, [false, "Solo se encuentra registrado los CATs del : "+inicioCertif+" al "+finCertif]);
						}
					}
				}
			}
			
		})
		
		
	}else{ // Ceritificados que ingresaron en un almacen y se van a retirar de el mismo
		var arrayParametros;
		subQuery = " and (fechaSalida is null or fechaSalida='0000-00-00 00:00:00') ";
		
		query = "Select nroCertificado from Certificado_movimiento where (nroCertificado between ? and ? ) and idUbicacion=? "+subQuery+" and idArticulo=? and estado='D' and registroEstado='0' order by nroCertificado";
		arrayParametros = [nroInicio, nroFinal, idAlmacen, idArticulo];
		ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
	}
}
// CUS10
exports.consultaPlaca = function(req, res, funcionName){
	var nroPlaca = req.query.nroPlaca;
	var query = "Select c.nroCAT, date_format(c.fechaInicio, '%d/%m/%Y') as fechaInicio, date_format(c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, c.placa, if(p.tipoPersona='N', CONCAT(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno), p.razonSocial) as asociado, cl.nombreClase, if(c.fechaCaducidad>now(), 'Activo', 'Caducado') as estado from Cat c inner join Asociado a on c.idAsociado = a.idAsociado inner join Persona p on a.idPersona=p.idPersona left join Vehiculo v on c.idVehiculo=v.idVehiculo left join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo left join Clase_Vehiculo cl on ucv.idClaseVehiculo=cl.idClase where c.placa = ? order by c.fechaCaducidad desc";
	var parametros = [nroPlaca];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
// CUS06:
exports.getAllConcesionarios = function(req, res, funcionName){
	
	var idLocal = req.query.idLocal;
	var queryWhere = "";
	if(idLocal!="0"){
		queryWhere=" and c.idSede = '"+idLocal+"'";
	}
	
	var query = "select * from (Select c.idConcesionario, concat(if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)),' / ',l.Nombre) as nombreCompuesto from Concesionario c inner join Persona p on c.idPersona = p.idPersona inner join Local l on c.idSede = l.idLocal where l.estado='1' and c.estado='1' "+queryWhere+") as v order by v.nombreCompuesto asc";
	ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getListaGuiasConcesionarios = function(req, res, funcionName){ // NOTA: Esta funcion es usada tambien en el CUS 05 para obtener la lista de Guias de Salida
	// Parametros GET:
	var queryWhere = new QueryWhere(" where g.tipoOperacion in ('DIST', 'DEV') and g.registroEstado='0' "); // agrega el filtro de tipo de Guia
	var idConcesionario = req.query.idConcesionario;	
	var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;	
	var conjutoConcesionarios = req.query.conjutoConcesionarios;
	
	if(idConcesionario!=""){
		queryWhere.validarWhere("g.idConcesionario="+idConcesionario);
	}else{
		// verifica que solo se filtren los almacenes correctos
		if(conjutoConcesionarios!=""){
			queryWhere.validarWhere("g.idConcesionario in ("+conjutoConcesionarios+") ");
		}		
	}
	if(fechaDesde!="" || fechaHasta!=""){
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere("( g.fechaOperacion between '"+fechaDesde+"' and '"+fechaHasta+"' )");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere("g.fechaOperacion>='"+fechaDesde+"'");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere("g.fechaOperacion<='"+fechaHasta+"'");
            }
        }
    }
	
	var query = "select g.idGuia_movimiento_cabecera as idGuia, g.nroGuiaManual, if(pe.tipoPersona='J', pe.razonSocial, concat(pe.nombres,' ',pe.apellidoPaterno,' ',pe.apellidoMaterno)) as nombreConcesionario, l.Nombre as sede, g.nroGuiaManual as nroGuia, "+
		"date_format(g.fechaOperacion, '%d/%m/%Y') as fechaRegistro, g.tipoOperacion as tipo, if(g.tipoOperacion='DIST', 'Distribucion', 'Devolucion') as tipoOperacion from Guia_movimiento_cabecera g "+
		"left join Concesionario c on g.idConcesionario = c.idConcesionario "+
		"left join Persona pe on c.idPersona = pe.idPersona "+
		"left join Local l on c.idSede = l.idLocal "+queryWhere.getQueryWhere()+" order by g.fechaOperacion desc";

	//** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
	
	query = agregarLimit(page, registrosxpagina, query);
	ejecutarQUERY_MYSQL(query,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
			if(cantPaginas==0){
				var queryCantidad="select count(*) as cantidad from Guia_movimiento_cabecera g "+
					"left join Concesionario c on g.idConcesionario = c.idConcesionario "+
					"left join Persona pe on c.idPersona = pe.idPersona "+
					"left join Local l on c.idSede = l.idLocal "+queryWhere.getQueryWhere()+" order by g.fechaOperacion desc";
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
// CUS07
exports.getListaLiquidaciones = function(req, res, funcionName){ // NOTA: Esta funcion es usada tambien en el CUS 05 para obtener la lista de Guias de Salida
	// Parametros GET:
	var queryWhere = new QueryWhere(""); // agrega el filtro de tipo de Guia
	var idConcesionario = req.query.idConcesionario;	
	var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;	
	var conjutoConcesionarios = req.query.conjutoConcesionarios;
	
	if(idConcesionario!=""){
		queryWhere.validarWhere("li.idConcesionario="+idConcesionario);
	}else{
		// verifica que solo se filtren los almacenes correctos
		if(conjutoConcesionarios!=""){
			queryWhere.validarWhere("li.idConcesionario in ("+conjutoConcesionarios+") ");
		}		
	}
	if(fechaDesde!="" || fechaHasta!=""){
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere("( li.fechaLiquidacion between '"+fechaDesde+"' and '"+fechaHasta+"' )");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere("li.fechaLiquidacion>='"+fechaDesde+"'");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere("li.fechaLiquidacion<='"+fechaHasta+"'");
            }
        }
    }
	queryWhere.validarWhere(" li.registroEstado='0' ");
	
	var query = "select li.idLiquidacion_ventas_cabecera as idLiquidacion, li.nroLiquidacion, "+
		"if(pe.tipoPersona='J', pe.razonSocial, concat(pe.nombres,' ',pe.apellidoPaterno,' ',pe.apellidoMaterno)) as nombreConcesionario,"+
		"date_format(li.fechaLiquidacion, '%d/%m/%Y') as fechaRegistro, "+
		"(select sum(d.precio) from Liquidacion_ventas_detalle d where d.idLiquidacion_ventas_cabecera = li.idLiquidacion_ventas_cabecera) "+
		"as totalVenta, (select sum(d2.comision) from Liquidacion_ventas_detalle d2 where d2.idLiquidacion_ventas_cabecera = li.idLiquidacion_ventas_cabecera) "+
		"as totalComision, (Select GROUP_CONCAT(d3.nroCertificado SEPARATOR ', ') FROM Liquidacion_ventas_detalle d3 "+
		"where d3.idLiquidacion_ventas_cabecera = li.idLiquidacion_ventas_cabecera) as nroCertificados "+
		"from Liquidacion_ventas_cabecera li "+
		"left join Concesionario c on li.idConcesionario = c.idConcesionario "+
		"left join Persona pe on c.idPersona = pe.idPersona "+
		"left join Local l on c.idSede = l.idLocal"+queryWhere.getQueryWhere()+" order by li.fechaLiquidacion desc";

	//** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
	
	query = agregarLimit(page, registrosxpagina, query);
	ejecutarQUERY_MYSQL(query,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
			if(cantPaginas==0){
				var queryCantidad="select count(*) as cantidad "+
				"from Liquidacion_ventas_cabecera li "+
				"left join Concesionario c on li.idConcesionario = c.idConcesionario "+
				"left join Persona pe on c.idPersona = pe.idPersona "+
				"left join Local l on c.idSede = l.idLocal"+queryWhere.getQueryWhere()+" order by li.fechaLiquidacion desc";
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
exports.getPromotores = function(req, res, funcionName){
	var idLocal = req.query.idLocal;
	var queryWhere = "";
	if(idLocal!="0"){
		queryWhere=" where u.idLocal = '"+idLocal+"'";
	}	
	var query = "Select p.idPromotor, u.idUsuario, concat(u.Nombres,' ',u.Apellidos) as nombreUsuario from Promotor p inner join UsuarioIntranet u on p.idUsuario = u.idUsuario "+queryWhere+" order by u.Nombres";
	ejecutarQUERY_MYSQL(query, [], res, funcionName);	
}
exports.getAllClasesVehiculo = function(req, res, funcionName){
	var query = "select idClase, nombreClase from Clase_Vehiculo order by nombreClase";
	ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.verificarDiponibilidadVentaCAT = function (req, res, funcionName){ // identifica todos los movimientos de lo certificados que no se encuentren anulado (registroEstado=0)
	var nroCertificado = req.query.nroCertificado;
	var query = "Select nroCertificado, tipOperacion, idUbicacion, estado, fechaSalida from Certificado_movimiento where nroCertificado=? and registroEstado='0'"
	ejecutarQUERY_MYSQL(query, [nroCertificado], res, funcionName);
}
exports.guardarLiquidacion = function(req, res, funcionName){
	var fecha = req.body.fecha;
	var concesionario = req.body.concesionario;
	var nroLiquidacion = req.body.nroLiquidacion;
	var idPromotor = req.body.idPromotor;
	var idUsuario = req.body.idUsuario;
	
	var query = "Insert into Liquidacion_ventas_cabecera(nroLiquidacion, fechaLiquidacion, idConcesionario, idUsuarioResp, idUsuario) values (?,?,?,?,?)";
	var arrayParametros = [nroLiquidacion, fecha, concesionario, idPromotor, idUsuario];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
		var idLiquidacion = resultados.insertId;
		if(idLiquidacion>0){			
			var listaDetalles = req.body.detalles;
			var listaCertif = [];
			for(var i=0; i<listaDetalles.length; i++){				
				listaCertif.push(listaDetalles[i].nroCertificado);
				// Inserta los detalles de liquidacion:
				var queryInsertDetalle = "Insert into Liquidacion_ventas_detalle(idLiquidacion_ventas_cabecera, nroCertificado,	claseVehiculo, precio, comision) values (?,?,?,?,?)";				
				var parametrosDetalle = [idLiquidacion, listaDetalles[i].nroCertificado, listaDetalles[i].idClaseVehiculo, listaDetalles[i].precio, listaDetalles[i].comision];				
				// Actualiza stock global:
				var queryUpdateStockGlobal = "Update Articulo a set a.stock=stock-1 where a.idArticulo = (select c.idArticulo from Certificado c where c.nroCertificado = "+listaDetalles[i].nroCertificado+")";
				ejecutarQUERY_MYSQL(queryUpdateStockGlobal, [], res, funcionName, "false");
				ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");				
			}
			// actualiza la fecha de Salida en los certificados y cambia su estado a Vendido
			var idUsuarioUpdate = req.query.idUsuarioUpdate;				
			var queryUpdate = "Update Certificado_movimiento set fechaSalida=now(), estado='V', idGuiaSalida='"+idLiquidacion+"', ultActualizaUsuario='"+idUsuarioUpdate+"', ultActualizaFecha=now() where idUbicacion='"+concesionario+"' and tipOperacion='E' and fechaSalida is null and nroCertificado in ("+listaCertif+")";			
			ejecutarQUERY_MYSQL_Extra(listaCertif, queryUpdate, [], res, funcionName, function(res, results, rowsCertif){
				// actualiza a vendido (ESTADO = "9") si ha sido registrado el certificado con liquidación pendiente (ESTADO = 8)
				var idUsuarioUpdate = req.query.idUsuarioUpdate;
			var queryUpdateCertificado = "Update Certificado set estadoRegistroCAT='9', ultActualizaUsuario='"+idUsuarioUpdate+"', ultActualizaFecha=now() where nroCertificado in ("+rowsCertif+") and estadoRegistroCAT = '8' and registroEstado='0'";
				console.log("update CERTIFICADO : "+queryUpdateCertificado);
				ejecutarQUERY_MYSQL(queryUpdateCertificado, [], res, funcionName, "false");
			});
			enviarResponse(res, [idLiquidacion]);
		}
	});
}
exports.getDetallesLiquidacion = function(req, res, funcionName){
	var idLiquidacion = req.query.idLiquidacion;
	
	var queryCabecera = "Select date_format(fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, if(idConcesionario=0, '', idConcesionario) as idConcesionario, idUsuarioResp, idUsuario, nroLiquidacion from Liquidacion_ventas_cabecera where idLiquidacion_ventas_cabecera = ?";
	
	var parametros = [idLiquidacion];
	ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function(res, resultados){
		// busca los detalles:
		query = "Select gd.idLiquidacion_ventas_detalle as idDetalle, gd.nroCertificado, gd.precio, gd.comision, gd.claseVehiculo as idClaseVehiculo, c.nombreClase as claseVehiculo from Liquidacion_ventas_detalle gd inner join Clase_Vehiculo c on gd.claseVehiculo = c.idClase where gd.idLiquidacion_ventas_cabecera=?";
		
		var parametros = [req.query.idLiquidacion];
		ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName, function(res2, results, resultados){
			resultados[0].detalle = results;
			enviarResponse(res, resultados);
		})
	});
}
// CUS 09 :
exports.generarReporteCertificado = function(req, res, funcionName){
	var tipoReporte = req.query.tipoReporte;
	var parametros;
	var query = "";
	switch(tipoReporte){
		case 'CER': 			
			var query = "Select * from ((select c.nroCertificado, c.fechaOperacion as fechaRegistro, date_format(c.fechaOperacion, '%d/%m/%Y') as fechaOperacion , g.tipoOperacion, c.estado, c.idUbicacion, if(c.tipOperacion='I', a.nombre, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno))) as nombreUbicacion, c.idGuia, "+
			"concat(u.Nombres,' ', u.Apellidos) as nombreUsuario "+
			"from Certificado_movimiento c "+
			"left join Almacen a on c.tipOperacion = 'I' and c.idUbicacion = a.idAlmacen "+
			"left join Concesionario con on c.tipOperacion = 'E' and c.idUbicacion = con.idConcesionario "+
            "left join Persona co on con.idPersona = co.idPersona "+
			"left join Guia_movimiento_cabecera g on c.idGuia = g.idGuia_movimiento_cabecera "+
			"left join UsuarioIntranet u on g.idUsuario = u.idUsuario "+
			"where c.nroCertificado between ? and ? and c.idUbicacion>0 and c.idGuia>0 and c.registroEstado='0' order by c.nroCertificado, g.fechaOperacion, g.idGuia_movimiento_cabecera) UNION "+ // Salidas
			
			"(select c.nroCertificado, c.fechaSalida as fechaRegistro, date_format(c.fechaSalida, '%d/%m/%Y') as fechaOperacion , if(c.estado='V', 'VEND', g.tipoOperacion) as tipoOperacion, c.estado, c.idUbicacion, if(c.tipOperacion='I', a.nombre, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno))) as nombreUbicacion,  if(c.estado='V', concat('LIQ - ',gl.idLiquidacion_ventas_cabecera), c.idGuiaSalida) as idGuia, "+
			"if(c.estado='V', concat(ul.Nombres,' ', ul.Apellidos), concat(u.Nombres,' ', u.Apellidos)) as nombreUsuario "+
			"from Certificado_movimiento c "+
			"left join Almacen a on c.tipOperacion = 'I' and c.idUbicacion = a.idAlmacen "+
			"left join Concesionario con on c.tipOperacion = 'E' and c.idUbicacion = con.idConcesionario "+
            "left join Persona co on con.idPersona = co.idPersona "+			
			"left join Guia_movimiento_cabecera g on c.idGuiaSalida = g.idGuia_movimiento_cabecera and c.estado !='V' "+
			"left join Liquidacion_ventas_cabecera gl on c.idGuiaSalida = gl.idLiquidacion_ventas_cabecera and c.estado ='V'"+
			"left join UsuarioIntranet u on g.idUsuarioResp = u.idUsuario "+
			"left join UsuarioIntranet ul on gl.idUsuario = ul.idUsuario "+
			"where c.nroCertificado between ? and ? and c.idUbicacion>0  and c.idGuia>0 and c.idGuiaSalida>0 and c.registroEstado='0' order by c.nroCertificado, c.fechaSalida, g.idGuia_movimiento_cabecera)) as v order by v.nroCertificado, v.fechaRegistro";
			
			var inicio = req.query.inicio;
			var fin = req.query.fin;
			if(fin==""){
				fin = inicio;
			}
			parametros = [inicio, fin, inicio, fin];			
			
			break;
		case 'CON':
			var query = "select c.nroCertificado, date_format(c.fechaOperacion, '%d/%m/%Y') as fechaOperacion , if(c.estado='V', 'VEND', g.tipoOperacion) as tipOperacion, c.estado, c.idUbicacion, c.idGuia, "+
				" concat(u.Nombres,' ', u.Apellidos) as nombreUsuario, g.nroGuiaManual, "+
				" date_format(gl.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, gl.idLiquidacion_ventas_cabecera as idLiquidacion from Certificado_movimiento c "+
				" inner join Concesionario con on c.idUbicacion = con.idConcesionario "+
				" left join Persona co on con.idPersona = co.idPersona "+
				" inner join Guia_movimiento_cabecera g on c.idGuia = g.idGuia_movimiento_cabecera "+
				" inner join UsuarioIntranet u on g.idUsuario = u.idUsuario "+
				" inner join Certificado cer on c.nroCertificado = cer.nroCertificado "+
				" left join Liquidacion_ventas_cabecera gl on c.idGuiaSalida = gl.idLiquidacion_ventas_cabecera and c.estado = 'V'"+
				" where c.tipOperacion = 'E' and c.idUbicacion=?  and c.registroEstado='0' and g.registroEstado='0' and cer.registroEstado='0' and gl.registroEstado='0' and cer.ultimoMovimiento = c.idCertificado_movimiento order by c.nroCertificado ";
				
			var idConcesionario = req.query.idConcesionario;
			parametros = [idConcesionario];
			
			break;
		case 'PRO':
			var dias = req.query.dias;
			var query = "select c.nroCertificado, date_format(c.fechaOperacion, '%d/%m/%Y') as fechaOperacion , if(c.estado='V', 'VEND', g.tipoOperacion) as tipOperacion, c.estado, c.idUbicacion, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno)) as nombreConcesionario, c.idGuia, con.diaSemanaAtt, g.nroGuiaManual, "+
				" concat(u.Nombres,' ', u.Apellidos) as nombreUsuario, g.nroGuiaManual, con.diaSemanaAtt, co.calle as direccion, di.nombre as nombreDistrito "+
				" from Certificado cer "+
				" inner join Certificado_movimiento c on cer.ultimoMovimiento = c.idCertificado_movimiento "+			
				" inner join Concesionario con on c.idUbicacion = con.idConcesionario "+
				" left join Persona co on con.idPersona = co.idPersona "+
				" left join Distrito di on co.idDistrito =  di.idDistrito "+
				" inner join Guia_movimiento_cabecera g on c.idGuia = g.idGuia_movimiento_cabecera "+
				" inner join UsuarioIntranet u on g.idUsuario = u.idUsuario "+
				" where c.tipOperacion = 'E' and c.idGuiaSalida=0 and con.idPromotor=? and con.diaSemanaAtt in ("+dias+") and c.idUbicacion>0 and c.estado!='V' and c.registroEstado='0' and g.registroEstado='0' order by con.diaSemanaAtt, c.nroCertificado";  
			
			var idPromotor = req.query.idPromotor;			
			parametros = [idPromotor];			
			
			break;
	}
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
// CUS 07: // Encuentra los Certificados disponibles para vender en el concesionario
exports.getCertificadosXconcesionarioId = function(req, res, funcionName){
	var idConcesionario = req.query.idConcesionario;
	var query = "Select nroCertificado from Certificado_movimiento where tipOperacion='E' and idUbicacion = ? and ( idGuiaSalida = 0 or idGuiaSalida is null) and registroEstado='0' order by nroCertificado ";
	
	var parametros = [idConcesionario];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}

// CUS 11: obtiene los certificados asignados a un promotor
exports.certificadosXpromotor = function(req, res, funcionName){
	var idPromotor = req.query.idPromotor;
	var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
	
	var queryWhere = new QueryWhere(" where g.idUsuarioResp = '"+idPromotor+"' and g.registroEstado='0' and cer.registroEstado='0' ");
	
	if(fechaDesde!="" || fechaHasta!=""){
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere("( g.fechaOperacion between '"+fechaDesde+"' and '"+fechaHasta+"' )");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere("g.fechaOperacion>='"+fechaDesde+"'");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere("g.fechaOperacion<='"+fechaHasta+"'");
            }
        }
    }
	var query = "select g.idGuia_movimiento_cabecera as idGuia, g.tipoOperacion, date_format(g.fechaOperacion, '%d/%m/%Y') as fechaOperacion, "+
		" a.nombre as almacen, if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as concesionario, "+
		" cer.nroCertificado "+
		" from Guia_movimiento_cabecera g "+
		" inner join Certificado_movimiento cer on  cer.idGuiaSalida = g.idGuia_movimiento_cabecera and cer.estado!='V' "+
		" left join Almacen a on g.idAlmacen = a.idAlmacen "+
		" left join Concesionario co on g.idConcesionario = co.idConcesionario "+
		" left join Persona p on co.idPersona = p.idPersona "+
		queryWhere.getQueryWhere()+
		" and g.tipoOperacion in ('SAL', 'DEV') "+
		" and (select count(*) from Certificado_movimiento cex where cex.nroCertificado = cer.nroCertificado and ( cex.idGuiaSalida>g.idGuia_movimiento_cabecera or cex.estado='V' ))=0 "+
		" order by cer.nroCertificado";
	ejecutarQUERY_MYSQL(query, [], res, funcionName)
}
function actualizarStockDetalle(idGuia, idAlmacen, idProveedor, tipo, res, funcionName){
	var query = "select idArticulo, cantidad, nroCertificadoInicio from Guia_movimiento_detalle where idGuia_movimiento_cabecera = ?";
	ejecutarQUERY_MYSQL(query, [idGuia], res, funcionName, function(res, results){
		var signo = "";
		if(tipo=='ING'){
			signo = "-";
		}else{
			signo = "+";
		}
		for(var i=0; i<results.length; i++){
			
			var queryUpdateStockArticulosXalmacen = "Update Articulos_almacen set stock = stock"+signo+""+results[i].cantidad+" where idAlmacen = ? and idArticulo = ?";
			
			ejecutarQUERY_MYSQL(queryUpdateStockArticulosXalmacen, [idAlmacen, results[i].idArticulo], res, funcionName, "false");
			
			if(idProveedor!="" && tipo=="ING" /*&& results[i].nroCertificadoInicio>0*/){ // actualiza el stock global
			
				var queryUpdateStockGlobalArticulos = "Update Articulo set stock=stock"+signo+""+results[i].cantidad+" where idArticulo=?";
				ejecutarQUERY_MYSQL(queryUpdateStockGlobalArticulos, [results[i].idArticulo], res, funcionName, "false");
				
			}
		}
	});
}
exports.anularLiquidacion = function(req, res, funcionName){ // una liquidacion siempre es el ultimo proceso.
	var idUsuario = req.query.idUsuarioUpdate;
	var listaCertificados = req.body.listaCertificados;
	var idLiquidacion = req.body.idLiquidacion;
	
	var queryExistenCATS = "Select nroCAT from Cat where nroCAT in ("+listaCertificados+") order by nroCAT";
	ejecutarQUERY_MYSQL(queryExistenCATS, [], res, funcionName, function(res, resultados){
		if(resultados.length==0){ // no se ha registrado ninguna venta del cat, por lo tanto procede con la operacion;
			// anula la liquidacion en los movimientos de los certificados
			var queryAnularMovimientos = "Update Certificado_movimiento m set m.idGuiaSalida=0, m.fechaSalida=null, m.estado='D', m.ultActualizaFecha=now(), m.ultActualizaUsuario=? where m.idCertificado_movimiento in (Select cer.ultimoMovimiento from Certificado cer where cer.nroCertificado in ("+req.body.listaCertificados+"))";
			ejecutarQUERY_MYSQL(queryAnularMovimientos, [req.query.idUsuarioUpdate], res, funcionName, function(res, results){
				// anula los detalles
				var queryAnulaDetalles = "Update Liquidacion_ventas_detalle set registroEstado='1', ultActualizaFecha=now(), ultActualizaUsuario=? where idLiquidacion_ventas_cabecera=?";
				var params = [req.query.idUsuarioUpdate, req.body.idLiquidacion];
				ejecutarQUERY_MYSQL(queryAnulaDetalles, params, res, funcionName, function(res, results){					
					//actualiza el stock de los articulos:
					var queryCantidadXarticulos = "Select sum(idArticulo) as cantidad, idArticulo from Certificado where nroCertificado in ("+req.body.listaCertificados+") group by idArticulo";
					ejecutarQUERY_MYSQL(queryCantidadXarticulos, [], res, funcionName, function(res, results){
						for(var i=0; i<results.length; i++){
							var cantidad = results[i].cantidad;
							var idArticulo = results[i].idArticulo;
							
							var queryActualizaStock = "Update Articulo set stock = stock + "+cantidad+" where idArticulo = ?";
							var params = [idArticulo]							
							ejecutarQUERY_MYSQL(queryActualizaStock, params, res, funcionName, "false");
						}						
						// Anula la liquidacion:
						var anulaLiquidacion = "Update Liquidacion_ventas_cabecera set registroEstado='1', ultActualizaFecha=now(), ultActualizaUsuario=? where idLiquidacion_ventas_cabecera=?";
						var params = [req.query.idUsuarioUpdate, req.body.idLiquidacion];
						ejecutarQUERY_MYSQL(anulaLiquidacion, params, res, funcionName,	"affectedRows"); // envia la cantidad de filas afectadas al lado cliente.
					})
				});				
			})
		}else{
			enviarResponse(res, [false, resultados])
		}
	})
}
exports.anularGuia = function(req, res, funcionName){
	var idUsuario = req.query.idUsuario;
	var idGuia = req.query.idGuia;
	var tipo = req.query.tipo;
	
	// verifica los detalles de la Guia:
	var query = "select nroCertificadoInicio, nroCertificadoFin from Guia_movimiento_detalle where idGuia_movimiento_cabecera = ?";
	
	ejecutarQUERY_MYSQL(query, [idGuia], res, funcionName, function(res, resultados){
		var idGuia = req.query.idGuia;
		var idAlmacen = req.query.idAlmacen;
		var idProveedor = req.query.idProveedor;
		var tipo = req.query.tipo;
		var idUsuario = req.query.idUsuario;
		
		if(resultados.length>0){
			// Verifica si contiene certificados:
			var conCertificados = false;
			for(var i=0; i<resultados.length; i++){
				if(resultados[i].nroCertificadoInicio>0){
					conCertificados = true;
					break;
				}
			}
			if(!conCertificados){
				console.log("No hay certificados en los detalles")
				var queryAnularGuia = "Update Guia_movimiento_cabecera set registroEstado='1', ultActualizaUsuario=?, ultActualizaFecha=now()  where idGuia_movimiento_cabecera = ?";
				ejecutarQUERY_MYSQL(queryAnularGuia, [idUsuario, idGuia], res, funcionName, "false");				
				actualizarStockDetalle(idGuia, idAlmacen, idProveedor, tipo, res, funcionName);
				enviarResponse(res, [true]);
			}else{
				console.log("Existen certificados en los detalles")
				var listaCertificadosGuia = [];
				for(var i=0; i<resultados.length; i++){
					for(var certif = resultados[i].nroCertificadoInicio; certif<=resultados[i].nroCertificadoFin; certif++){
						listaCertificadosGuia.push(certif);
					}					
				}
				// verifica que el ultimo movimiento de los CATS corresponda con la guia que se requiere anular.
				var queryUltimoMovimiento = "select * from (Select if(m.idGuiaSalida>0, m.idGuiaSalida, m.idGuia) as idGuia from Certificado c inner join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento where c.nroCertificado in ("+listaCertificadosGuia+")) as v group by v.idGuia ";
				/*if(req.query.tipo=='ING' || req.query.tipo=='DIST'){
					queryUltimoMovimiento = "Select m.idGuia from Certificado c inner join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento where c.nroCertificado in ("+listaCertificadosGuia+") group by m.idGuia ";
				}else{
					queryUltimoMovimiento = "Select m.idGuiaSalida as idGuia from Certificado c inner join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento where c.nroCertificado in ("+listaCertificadosGuia+") group by m.idGuiaSalida ";
				}*/		
				ejecutarQUERY_MYSQL(queryUltimoMovimiento, [], res, funcionName, function(res, results){
					
					var idGuia = req.query.idGuia;
					var idAlmacen = req.query.idAlmacen;
					var idProveedor = req.query.idProveedor;
					var tipo = req.query.tipo;
					var idUsuario = req.query.idUsuario;	
					
					if(results.length==1){
						if(results[0].idGuia = idGuia){
							console.log("coincide guia");
							// anula la guia completa con sus detalles, certificados y movimientos
							var queryAnularGuia = "Update Guia_movimiento_cabecera set registroEstado='1', ultActualizaUsuario=?, ultActualizaFecha=now() where idGuia_movimiento_cabecera = ?";
							ejecutarQUERY_MYSQL(queryAnularGuia, [idUsuario, idGuia], res, funcionName, function(){
								
								var idGuia = req.query.idGuia;
								var idAlmacen = req.query.idAlmacen;
								var idProveedor = req.query.idProveedor;
								var tipo = req.query.tipo;
								var idUsuario = req.query.idUsuario;	
								
								// anula los detalles:
								var queryAnulaDetalles = "Update Guia_movimiento_detalle set registroEstado='1', ultActualizaUsuario=?, ultActualizaFecha=now() where idGuia_movimiento_cabecera = ? ";
								ejecutarQUERY_MYSQL(queryAnulaDetalles, [idUsuario, idGuia], res, funcionName, function(){
									
									var idGuia = req.query.idGuia;
									var idAlmacen = req.query.idAlmacen;
									var idProveedor = req.query.idProveedor;
									var tipo = req.query.tipo;
									var idUsuario = req.query.idUsuario;	
									
										// Anula los movimientos del certificado:
										var queryAnulaCertificadosMovimientos = "";					
										if(req.query.tipo=='ING' || req.query.tipo=='DIST'){
											queryAnulaCertificadosMovimientos = "Update Certificado_movimiento set registroEstado='1', ultActualizaUsuario='"+idUsuario+"', ultActualizaFecha=now() where idGuia = ? ";
										}else{
											queryAnulaCertificadosMovimientos = "Update Certificado_movimiento set idGuiaSalida=0, fechaSalida=null, ultActualizaUsuario='"+idUsuario+"', ultActualizaFecha=now() where idGuiaSalida = ?";
										}
										ejecutarQUERY_MYSQL(queryAnulaCertificadosMovimientos, [idGuia], res, funcionName, function(){

											var idGuia = req.query.idGuia;
											var idAlmacen = req.query.idAlmacen;
											var idProveedor = req.query.idProveedor;
											var tipo = req.query.tipo;
											var idUsuario = req.query.idUsuario;

											if(idProveedor!="" && tipo=="ING"){
												
												// Elimina los registros previos en la tabla certificado_anulados
												
												var queryDelete = "Delete from Certificado_anulados where nroCertificado in ("+listaCertificadosGuia+") ";
												ejecutarQUERY_MYSQL_Extra(listaCertificadosGuia, queryDelete, [], res, funcionName, function(res, resultados, certificadosAnulados){
													// copia los datos del certificados a la tabla Certificado_anulados.
													var queryInsert = "Insert into Certificado_anulados select * from Certificado where nroCertificado in ("+certificadosAnulados+") ";
													
													ejecutarQUERY_MYSQL_Extra(certificadosAnulados, queryInsert, [], res, funcionName, function(res, resultados, certificadosAnulados){
														// Elimina el certificado:
														var deleteCertificados = "Delete from Certificado where nroCertificado in ("+certificadosAnulados+") ";
														ejecutarQUERY_MYSQL(deleteCertificados, [], res, funcionName, "false");														
													})
												})
												
											}else{										
												if(tipo=='ING' || tipo=='DIST'){
													// actualiza el ultimo movimiento en el certificado
													var queryUpdateUltMov = "Update Certificado c set c.ultimoMovimiento = (Select max(m.idCertificado_movimiento) from Certificado_movimiento m where m.nroCertificado = c.nroCertificado and m.registroEstado='0'), c.ultActualizaUsuario=?, c.ultActualizaFecha=now() where c.nroCertificado in ("+listaCertificadosGuia+") and c.registroEstado='0'";
													ejecutarQUERY_MYSQL(queryUpdateUltMov, [idUsuario], res, funcionName, "false");
												}
											}
											
											// actualiza stock
											if(req.query.tipo='ING' || req.query.tipo=='SAL'){ // Realiza la actualizacion
												//busca la cantidad de certificados por tipo de Articulo												
												actualizarStockDetalle(idGuia, idAlmacen, idProveedor, tipo, res, funcionName);
												enviarResponse(res, [true]);
											}else{
												enviarResponse(res, [true]);
											}
										});										
									//});
								});
							});
						}else{
							// No se puede anular la guia
							enviarResponse(res, [false, "Existen Certificados que sus ultimos movimientos no coinciden con esta Guia"]);
						}
					}else{
						// No se puede anular la guia
						enviarResponse(res, [false, "Existen Certificados que sus ultimos movimientos no coinciden con esta Guia"]);
					}
				});
			}
		}else{
			var queryAnularGuia = "Update Guia_movimiento_cabecera set registroEstado='1', ultActualizaUsuario=?, ultActualizaFecha=now() where idGuia_movimiento_cabecera = ?";
			ejecutarQUERY_MYSQL(queryAnularGuia, [idUsuario, idGuia], res, funcionName, "false");			
			enviarResponse(res, [true]);
		}
	})
}
exports.getListaCertificado = function(req, res, funcionName){
	
	var queryWhere = new QueryWhere("");
	var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
	var nombreAsociado = req.query.nombre;
	var docAsociado = req.query.doc;
	var tipoFiltro = req.query.tipoFiltro;
	var confechaLiquidacion = req.query.confechaLiquidacion;
	
	if(tipoFiltro!="T"){ // asociado / fecha Liquidacion
		if(tipoFiltro=='A'){
			if(nombreAsociado!=""){
				queryWhere.validarWhere(" if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) like '%"+nombreAsociado+"%' ");
			}
			if(docAsociado!=""){
				queryWhere.validarWhere("p.nroDocumento like '"+docAsociado+"%'");
			}
		}
		if(tipoFiltro=='F'){
			if(confechaLiquidacion=='true'){
				if(fechaDesde!="" || fechaHasta!=""){
					if(fechaDesde!="" && fechaHasta!=""){
						fechaHasta=fechaHasta+" 23:59:59";
						queryWhere.validarWhere("( c.fechaLiquidacion between '"+fechaDesde+"' and '"+fechaHasta+"' )");
					}else{
						if(fechaDesde!=""){
							queryWhere.validarWhere("c.fechaLiquidacion>='"+fechaDesde+"'");
						}
						if(fechaHasta!=""){
							fechaHasta=fechaHasta+" 23:59:59";
							queryWhere.validarWhere("c.fechaLiquidacion<='"+fechaHasta+"'");
						}
					}
				}
			}else{
				queryWhere.validarWhere("( c.fechaLiquidacion is null or c.fechaLiquidacion='0000-00-00 00:00:00' ) ");
			}
		}
	}
	
	var query = "Select c.nroCAT, date_format(c.fechaEmision, '%d/%m/%Y %H:%i') as fechaEmision, "+
		"date_format(c.fechaInicio, '%d/%m/%Y') as fechaInicio, "+
		"date_format(c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, "+
		"date_format(c.fechaControlInicio, '%d/%m/%Y') as fechaControlInicio, "+
		"date_format(c.fechaControlFin, '%d/%m/%Y') as fechaControlFin, "+
		"c.conDeuda, "+
		"date_format(c.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, "+
		"se.Nombre as nombreSede, "+
		"if(pco.tipoPersona='J', pco.razonSocial, concat(pco.nombres,' ',pco.apellidoPaterno,' ',pco.apellidoMaterno)) as nombreConcesionario, "+
		"c.prima, "+
		"c.aporte, "+
		"c.comision, "+
		"a.idAsociado, "+
		"p.nroDocumento, "+
		"if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreAsociado, "+
		"v.* , u.nombreUso, cl.nombreClase from Cat c "+
		"inner join Asociado a on c.idAsociado = a.idAsociado "+
		"inner join Persona p on a.idPersona = p.idPersona "+
		"inner join Concesionario co on c.idConcesionario = co.idConcesionario "+
		"inner join Persona pco on co.idPersona = pco.idPersona "+
		"inner join Local se on co.idSede = se.idLocal "+
		"inner join Vehiculo v on c.idVehiculo = v.idVehiculo "+
		"inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo "+
		"inner join Uso_Vehiculo u on ucv.idUso = u.idUso "+
		"inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase "+queryWhere.getQueryWhere()+" order by c.nroCAT";
		
	//** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
	
	query = agregarLimit(page, registrosxpagina, query);
	ejecutarQUERY_MYSQL(query,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
			if(cantPaginas==0){
				var queryCantidad="Select count(*) as cantidad from Cat c "+
					"inner join Asociado a on c.idAsociado = a.idAsociado "+
					"inner join Persona p on a.idPersona = p.idPersona "+
					"inner join Concesionario co on c.idConcesionario = co.idConcesionario "+
					"inner join Persona pco on co.idPersona = pco.idPersona "+
					"inner join Local se on co.idSede = se.idLocal "+
					"inner join Vehiculo v on c.idVehiculo = v.idVehiculo "+
					"inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo "+
					"inner join Uso_Vehiculo u on ucv.idUso = u.idUso "+
					"inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase "+queryWhere.getQueryWhere()
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
exports.editarContrato = function(req, res, funcionName){
    // agrega o actualiza el representante legal en la TABLA PERSONA:
    var personaRepresentanteLegal = req.body.repLegal;
    abstractGuardarActualizarPersona_contrato(res, funcionName, personaRepresentanteLegal, function(idPersonaRL){
        req.body.repLegal.idPersona = idPersonaRL
        // registra o actualiza la empresa en la tabla Persona:
        var personaEmpresa = req.body.empresa
        abstractGuardarActualizarPersona_contrato(res, funcionName, personaEmpresa, function(idPersonaEmpresa){

            req.body.empresa.idPersona = idPersonaEmpresa
            var idEmpresa = req.body.empresa.idEmpresa
            var idPersona = req.body.empresa.idPersona
            var idRepLegal = req.body.repLegal.idPersona
            var nroResolucion = req.body.empresa.nroResolucion
            var idUsuarioUpdate = req.body.idUsuarioUpdate
            var nombreBreve = req.body.empresa.nombreBreve

            // actualiza los datos de la empresa
            var queryUpdateEmpresa = "Update EmpresaTransp set idPersona = ?, idRepLegal = ?, nroResolucion = ?, ultActualizaUsuario=?, ultActualizaFecha=now(), nombreCorto=? where idEmpresaTransp = ? ";
            var parametros = [idPersona, idRepLegal, nroResolucion, idUsuarioUpdate, nombreBreve, idEmpresa]
            ejecutarQUERY_MYSQL(queryUpdateEmpresa, parametros, res, funcionName, function(res, resultados){

                // actualiza el contrato:

                var idEmpresa = req.body.empresa.idEmpresa
                var fechaEmision = req.body.generales.fechaEmision;
                var fechaVigenciaContrato = req.body.generales.contratoFechaInicio;
                var fechaVigenciaCertif = req.body.generales.certificadoFechaInicio;
                var flota = req.body.generales.tamanoCuotas;
                var nroCuotas = req.body.generales.nroCuotas;
                var idUsuarioUpdate = req.body.idUsuarioUpdate
                var idContrato = req.body.generales.idContrato

                var queryUpdateContrato = "Update Contrato set fechaEmision=?, fechaVigenciaContr=?, fechaVigenciaCert=?, nCuotas=?, flota=?, idEmpresaTransp=?, ultActualizaUsuario=?, ultActualizaFecha=now() where idContrato = ?";
                var params = [fechaEmision, fechaVigenciaContrato, fechaVigenciaCertif, nroCuotas, flota, idEmpresa, idUsuarioUpdate, idContrato]

                ejecutarQUERY_MYSQL(queryUpdateContrato, params, res, funcionName, function(res, resultados){
                    var affectedRows = resultados.affectedRows
                    enviarResponse(res, [affectedRows])

                    // Elimina los certificados que no se hayan eliminado en la UI
                    var listaCertificados = req.body.datosFlota
                    for(var i=0; i<listaCertificados.length; i++){
                        var certificados_No_eliminar = ""
                        if(listaCertificados[i].registrado == true){
                            // solo actualiza
                            if(certificados_No_eliminar!=""){
                                certificados_No_eliminar=certificados_No_eliminar+listaCertificados[i]+", ";
                            }
                            certificados_No_eliminar=certificados_No_eliminar+listaCertificados[i].idContratoCertificado;
                        }
                    }
                    var queryEliminarCertificados = "Delete from Contrato_Certificados where idContrato = ? "
                    if(certificados_No_eliminar!=""){
                        queryEliminarCertificados = queryEliminarCertificados + " and idContratoCertificado not in ("+certificados_No_eliminar+") ";
                    }
                    console.log("eliminando certificados")
                    var idContrato = req.body.generales.idContrato
                    var parametros = [idContrato]
                    ejecutarQUERY_MYSQL(queryEliminarCertificados, parametros, res, funcionName, function(res, resultados){

                        var listaCertificados = req.body.datosFlota
                        var idContrato = req.body.generales.idContrato

                        for(var i=0; i<listaCertificados.length; i++){
                            listaCertificados[i].idContrato = idContrato
                            abstractGuardarActualizarVehiculo_contrato(res, funcionName, listaCertificados[i], function(registroCertificado){

                                var idContrato = registroCertificado.idContrato
                                var nroOrden = registroCertificado.idDetalle
                                var nroCertificado = registroCertificado.nCertificado
                                var idVehiculo = registroCertificado.idVehiculo
                                var valorCuota = registroCertificado.precio/req.body.generales.nroCuotas
                                var nroCuota = 1
                                var precio = registroCertificado.precio
                                var prima = registroCertificado.prima

                                if(registroCertificado.registrado == true){
                                    // solo actualiza
                                    var idContratoCertificado = registroCertificado.idContratoCertificado
                                    var queryUpdateCertificado = "Update Contrato_Certificados set idContrato=?, nroOrden=?, nroCertificado=?, idVehiculo=?, valorCuota=?, nroCuota=?, precio=?, prima=? where idContratoCertificado = ?";
                                    var params = [idContrato, nroOrden, nroCertificado, idVehiculo, valorCuota, nroCuota, precio, prima, idContratoCertificado]
                                    ejecutarQUERY_MYSQL(queryUpdateCertificado, params, res, funcionName, "false");
                                }else{
                                    // registra:
                                    var queryInsertCertificado = "Insert into Contrato_Certificados (idContrato, nroOrden, nroCertificado, idVehiculo, valorCuota, nroCuota, precio, prima) values (?,?,?,?,?,?,?,?)"
                                    var params = [idContrato, nroOrden, nroCertificado, idVehiculo, valorCuota, nroCuota, precio, prima]
                                    ejecutarQUERY_MYSQL(queryInsertCertificado, params, res, funcionName, "false");
                                }
                            })
                        }
                    })
                })
            })
        })
    })
}
exports.guardarContrato = function(req, res, funcionName){
    // agrega o actualiza el representante legal en la TABLA PERSONA:
    var personaRepresentanteLegal = req.body.repLegal;
    abstractGuardarActualizarPersona_contrato(res, funcionName, personaRepresentanteLegal, function(idPersonaRL){
        req.body.repLegal.idPersona = idPersonaRL
        // registra o actualiza la empresa en la tabla Persona:
        var personaEmpresa = req.body.empresa
        abstractGuardarActualizarPersona_contrato(res, funcionName, personaEmpresa, function(idPersonaEmpresa){
            req.body.empresa.idPersona = idPersonaEmpresa
            // registra la empresa:
            var idPersona = req.body.empresa.idPersona
            var idRepLegal = req.body.repLegal.idPersona
            var nroResolucion = req.body.empresa.nroResolucion
            var idUsuarioUpdate = req.body.idUsuarioUpdate
            var nombreBreve = req.body.empresa.nombreBreve

            var queryInsertEmpresa = "Insert into EmpresaTransp (idPersona, idRepLegal, nroResolucion, fechaRegistro, ultActualizaUsuario, ultActualizaFecha, nombreCorto) values (?,?,?, now(), ?, now(),?)"
            var params = [idPersona, idRepLegal, nroResolucion, idUsuarioUpdate, nombreBreve]
            ejecutarQUERY_MYSQL(queryInsertEmpresa, params, res, funcionName, function(res, resultados){
                var idEmpresa = resultados.insertId
                // registra el contrato
                var fechaEmision = req.body.generales.fechaEmision;
                var fechaVigenciaContrato = req.body.generales.contratoFechaInicio;
                var fechaVigenciaCertif = req.body.generales.certificadoFechaInicio;
                var flota = req.body.generales.tamanoCuotas;
                var nroCuotas = req.body.generales.nroCuotas;
                var idUsuarioUpdate = req.body.idUsuarioUpdate

                var queryInsertContrato = "INSERT INTO Contrato (fechaEmision, fechaVigenciaContr, fechaVigenciaCert, nCuotas, flota, idEmpresaTransp, ultActualizaUsuario, ultActualizaFecha) values (?,?,?,?,?,?,?, now())"
                var params = [fechaEmision, fechaVigenciaContrato, fechaVigenciaCertif, nroCuotas, flota, idEmpresa, idUsuarioUpdate]

                ejecutarQUERY_MYSQL(queryInsertContrato, params, res, funcionName, function(res, resultados){
                    var idContrato = resultados.insertId;
                    enviarResponse(res,[idContrato])
                    // registra los certificados.
                    var listaCertificados = req.body.datosFlota
                    for(var i=0; i<listaCertificados.length; i++){
                        listaCertificados[i].idContrato = idContrato
                        abstractGuardarActualizarVehiculo_contrato(res, funcionName, listaCertificados[i], function(registroCertificado){
                            // registra el contrato_certificado:
                            var idContrato = registroCertificado.idContrato
                            var nroOrden = registroCertificado.idDetalle
                            var nroCertificado = registroCertificado.nCertificado
                            var idVehiculo = registroCertificado.idVehiculo
                            var valorCuota = registroCertificado.precio/req.body.generales.nroCuotas
                            var nroCuota = 1
                            var precio = registroCertificado.precio
                            var prima = registroCertificado.prima

                            var queryInsertCertificado = "Insert into Contrato_Certificados (idContrato, nroOrden, nroCertificado, idVehiculo, valorCuota, nroCuota, precio, prima) values (?,?,?,?,?,?,?,?)"
                            var params = [idContrato, nroOrden, nroCertificado, idVehiculo, valorCuota, nroCuota, precio, prima]
                            ejecutarQUERY_MYSQL(queryInsertCertificado, params, res, funcionName, "false");

                        })
                    }
                })
            })
        })
    })
}
function abstractGuardarActualizarVehiculo_contrato(res, funcionName, vehiculo, callback){
    var queryInsert = "Insert into Vehiculo (idUsoClaseVehiculo, placa, nroSerieMotor, marca, modelo, anno, nroAsientos) values (?,?,?,?,?,?,?)";
    var queryUpdate = "Update Vehiculo set idUsoClaseVehiculo=?, placa=?, nroSerieMotor=?, marca=?, modelo=?, anno=?, nroAsientos=? where idVehiculo=?";
    if(vehiculo.idVehiculo==0){
        ejecutarQUERY_MYSQL_Extra(vehiculo, queryInsert, [vehiculo.idUso, vehiculo.placa, vehiculo.nroMotor, vehiculo.marca, vehiculo.modelo, vehiculo.anno, vehiculo.nroAsientos], res, funcionName, function(res, resultados, vehiculo){
            if(typeof  callback == 'function'){
                var idVehiculo = resultados.insertId;
                vehiculo.idVehiculo=idVehiculo;
                callback(vehiculo);
            }
        });
    }else{
        ejecutarQUERY_MYSQL_Extra(vehiculo, queryUpdate, [vehiculo.idUso, vehiculo.placa, vehiculo.nroMotor, vehiculo.marca, vehiculo.modelo, vehiculo.anno, vehiculo.nroAsientos, vehiculo.idVehiculo], res, funcionName, function(res, resultados, vehiculo){
            if(typeof  callback == 'function'){
                callback(vehiculo);
            }
        });
    }
}
function abstractGuardarActualizarPersona_contrato(res, funcionName, persona, callback){
    var queryInsert = "Insert into Persona (tipoPersona, razonSocial, nombres, apellidoPaterno, apellidoMaterno, nroDocumento, telefonoMovil, idDistrito, calle, email) values (?,?,?,?,?,?,?,?,?,?)";
    var queryAdicional = "";
    if(typeof persona.email!="undefined"){
        queryAdicional = queryAdicional+", email = '"+persona.email+"' ";
    }else {
        persona.email="";
    }

    var queryUpdate = "Update Persona set razonSocial=?, nombres = ?, apellidoPaterno = ?, apellidoMaterno = ?, telefonoMovil=?, idDistrito=?, calle=? "+queryAdicional+" where idPersona = ? ";

    if(persona.idPersona==0){ // se registra una nueva persona
        ejecutarQUERY_MYSQL(queryInsert, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.apePaterno, persona.apeMaterno, persona.nroDoc, persona.telefono, persona.distrito, persona.direccion, persona.email], res, funcionName, function(res, resultados){
            if(typeof  callback == 'function'){
                var idPersona = resultados.insertId;
                persona.idPersona=idPersona;
                callback(idPersona);
            }
        });
    }else{ // solo se actualizara
        ejecutarQUERY_MYSQL(queryUpdate, [persona.razonSocial, persona.nombres, persona.apePaterno, persona.apeMaterno, persona.telefono, persona.distrito, persona.direccion, persona.idPersona], res, funcionName, function(res, resultados){
            if(typeof  callback == 'function'){
                callback(persona.idPersona);
            }
        });
    }
}
exports.imprimirCATS = function(req, res, funcionName){ // Esta opcion es llamada en el boton IMPRIMIR de la ventana de Registros de Contratos
    // 1) Registra el contrato de renovacion
    // 2) Actualiza el Estado del Contrato a I=Impreso
    // 3) Registra todos los certificados en la tabla CERTIFICADO (NO CUMPLE)
    // 4) Registra la guia de Distribucion (DIST) (NO CUMPLE)
    // 5) Registra los detalles de la guia de distribucion (NO CUMPLE)
    // 6) Registra la Guia de Liquidacion
    // 7) Registra los detalles de liquidacion
    // 8) Guada lo siguiente (con la funcion registrarCertificadoVendidoCAT() )
    //  8.1 Actualiza la guia de liquidacion dentro del movimiento del los certificados (Tabla Certificado_movimiento)
    //  8.2 Actualiza el certificado con su ultimo movimiento y su estado = 9 (Vendido)
    //  8.3 Registra el CAT => Previamente tiene que buscar o registra el Asociado


    var idContrato = req.body.idContrato;
    var nroCuota = 1;
    var idEmpresaTransp = req.body.idEmpresaTransp
    var fechaRenovacion = req.body.fechaRenovacion
    var flotaActual = req.body.flota
    var certificadosList = req.body.listaFlota

    var totalCuota = 0;
    for(var i=0; i<certificadosList.length; i++){
        totalCuota = totalCuota + certificadosList[i].valorCuota
    }

    console_log("Registrando el contrato de la Renovacion ...")

    var queryInsertRenovacion = "Insert into Contrato_Renovacion(idContrato, nroCuota, idEmpresaTransp, fechaRenovacion, flotaActual, totalCuota) values (?,?,?,?,?,?)";
    var parametros = [idContrato, nroCuota, idEmpresaTransp, fechaRenovacion, flotaActual, totalCuota]

    ejecutarQUERY_MYSQL(queryInsertRenovacion, parametros, res, funcionName, function(res, resultados){

        console_log("Actualizando el estado del contrato a Impreso ...")

        var idContrato = req.body.idContrato
        var updateContrato = "Update Contrato set estado = 'I' where idContrato = ?"
        var parametros = [idContrato]

        ejecutarQUERY_MYSQL(updateContrato, parametros, res, funcionName, function(res, resultados){

            /*console_log("Registrando los certificados (TABLA CERTIFICADO)")

            var certificadosInsertar = ""
            var certificadosList = req.body.listaFlota

            for(var i=0; i<certificadosList.length; i++){

                var idConcesionario = req.body.idConcesionario
                var idArticulo = 2 // CATS-2017
                var ultActualizaUsuario = req.body.idUsuarioUpdate
                var nroCertificado = certificadosList[i].nCertificado

                if(certificadosInsertar!=""){
                    certificadosInsertar = certificadosInsertar +" , "
                }
                certificadosInsertar = certificadosInsertar+"("+nroCertificado+", "+idArticulo+", "+idConcesionario+", "+ultActualizaUsuario+", now())"

            }

            if(certificadosInsertar!=""){

                certificadosInsertar = "Insert into Certificado(nroCertificado, idArticulo, idConcesionario, ultActualizaUsuario, ultActualizaFecha) values "+certificadosInsertar

                console_log("insertando certificados con query => "+certificadosInsertar)

                ejecutarQUERY_MYSQL(certificadosInsertar, [], res, funcionName, function(res, resultados){

                    console.log("certificados ingresados correctamente ....")

                    console_log("Registrando la Guia de Distribucion ... ")

                    var tipoOperacion = 'DIST'
                    var idUsuario = req.body.idUsuarioUpdate
                    var idUsuarioResp = req.body.idUsuarioUpdate
                    var idConcesionario = req.body.idConcesionario
                    var ultActualizaUsuario = req.body.idUsuarioUpdate

                    var queryInsertGuia = "Insert into Guia_movimiento_cabecera(tipoOperacion, fechaOperacion, idUsuario, idUsuarioResp, idConcesionario, ultActualizaUsuario, ultActualizaFecha) " +
                        "values (?,now(),?,?,?,?,now())"

                    var parametros = [tipoOperacion, idUsuario, idUsuarioResp, idConcesionario, ultActualizaUsuario]

                    ejecutarQUERY_MYSQL(queryInsertGuia, parametros, res, funcionName, function(res, resultados){

                        var idGuia = resultados.insertId;

                        console_log("Guia de distribucion registrada correctamente : "+idGuia)

                        req.body.idGuia = idGuia

                        console_log("Registrando los detalles de la guia ...")

                        var certificadosList = req.body.listaFlota
                        var detalles = []
                        var inicioCertif = 0;
                        var finCertif = 0;

                        for(var i=0; i<certificadosList.length; i++){

                            certificadosList[i].idArticulo=2

                            var nroCertificado = parseInt(certificadosList[i].nCertificado)
                            if(i==0){
                                inicioCertif = nroCertificado
                            }else{
                                var nroCertificadoPrevio = parseInt(certificadosList[i-1].nCertificado)
                                var articuloAnterior =  parseInt(certificadosList[i-1].nCertificado)
                                var articuloActual = parseInt(certificadosList[i].nCertificado)
                                if(nroCertificado-nroCertificadoPrevio!=1 || articuloAnterior!=articuloActual){
                                    finCertif = nroCertificadoPrevio
                                    var cantidad = finCertif - inicioCertif+1
                                    detalles.push({
                                        idGuia:idGuia,
                                        inicio:inicioCertif,
                                        fin:finCertif,
                                        idArticulo:certificadosList[i].idArticulo,
                                        cantidad:cantidad,
                                        ultActualizaUsuario:req.body.idUsuarioUpdate,
                                        ultActualizaFecha:"now()"
                                    })
                                    inicioCertif = nroCertificado
                                }
                            }
                            if(certificadosList.length-i==1){ // ultimo certificado
                                finCertif = nroCertificado
                                var cantidad = finCertif - inicioCertif+1
                                detalles.push({
                                    idGuia:idGuia,
                                    inicio:inicioCertif,
                                    fin:finCertif,
                                    idArticulo:certificadosList[i].idArticulo,
                                    cantidad:cantidad,
                                    ultActualizaUsuario:req.body.idUsuarioUpdate,
                                    ultActualizaFecha:"now()"
                                })
                            }
                        }

                        var queryInsertDetalles = ""

                        for(var y=0; y<detalles.length; y++){
                            if(y>0){
                                queryInsertDetalles = queryInsertDetalles+" , "
                            }
                            queryInsertDetalles = queryInsertDetalles + "("+detalles[y].idGuia+", "+detalles[y].idArticulo+"," +
                                detalles[y].cantidad+", "+detalles[y].inicio+", "+detalles[y].fin+", "+detalles[y].ultActualizaUsuario+", "+detalles[y].ultActualizaFecha+")"
                        }
                        if(queryInsertDetalles!=""){

                            queryInsertDetalles = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo, cantidad, nroCertificadoInicio, nroCertificadoFin, ultActualizaUsuario, ultActualizaFecha)" +
                                " values "+queryInsertDetalles

                            console_log("Registrando los detalles con query => "+queryInsertDetalles)

                            ejecutarQUERY_MYSQL(queryInsertDetalles, [], res, funcionName, function(res, resultados){*/

                                console_log("Registra la guia de Liquidacion ...")

                                var idConcesionario = req.body.idConcesionario
                                var idUsuario = req.body.idUsuarioUpdate
                                var idUsuarioResp = req.body.idUsuarioUpdate
                                var ultActualizaUsuario = req.body.idUsuarioUpdate

                                var queryInsertLiquidacion = "Insert into Liquidacion_ventas_cabecera(fechaLiquidacion, idConcesionario, idUsuarioResp, idUsuario, ultActualizaUsuario, ultActualizaFecha) " +
                                    "values (now(), ?, ?, ?, ?, now())"

                                var parametros = [idConcesionario, idUsuarioResp, idUsuario, ultActualizaUsuario]

                                ejecutarQUERY_MYSQL(queryInsertLiquidacion, parametros, res, funcionName, function(res, resultados){
                                    var idGuiaLiquidacion = resultados.insertId;
                                    req.body.idGuiaLiquidacion = idGuiaLiquidacion

                                    console_log("Guia de Liquidacion registrada correctamente : "+idGuiaLiquidacion)

                                    console_log("Registra los detalles de la guia de liquidacion ...")

                                    var queryInsertVentaDetalles = ""
                                    var certificadosList = req.body.listaFlota;

                                    for(var i=0; i<certificadosList.length; i++){
                                        if(i>0){
                                            queryInsertVentaDetalles = queryInsertVentaDetalles+", ";
                                        }
                                        queryInsertVentaDetalles = queryInsertVentaDetalles+"("+idGuiaLiquidacion+", "+certificadosList[i].nCertificado+", "+certificadosList[i].idClase+", " +
                                            certificadosList[i].precio+", 0, "+idUsuario+", now())"
                                    }

                                    queryInsertVentaDetalles = "Insert into Liquidacion_ventas_detalle(idLiquidacion_ventas_cabecera, nroCertificado, claseVehiculo, precio, comision, ultActualizaUsuario, ultActualizaFecha)" +
                                        " values "+queryInsertVentaDetalles

                                    console_log("Registrando los detalles de la liquidacion con query => "+queryInsertVentaDetalles)

                                    ejecutarQUERY_MYSQL(queryInsertVentaDetalles, [], res, funcionName, function(res, resultados){

                                        console_log("Detalles de la liquidacion registrados correctamente ... (Responde al cliente)")

                                        enviarResponse(res, [resultados.affectedRows])

                                        console_log("Registrando la liquidacion en los movimientos de los certificados con la funcion registrarCertificadoVendidoCAT() ")

                                        var certificadosList = req.body.listaFlota;

                                        for(var i=0; i<certificadosList.length; i++){

                                            certificadosList[i].idConcesionario = req.body.idConcesionario
                                            //certificadosList[i].idGuia = req.body.idGuia
                                            certificadosList[i].idGuiaLiquidacion = req.body.idGuiaLiquidacion
                                            //certificadosList[i].idArticulo = 2
                                            certificadosList[i].idUsuarioResp=req.body.idUsuarioUpdate
                                            certificadosList[i].ultActualizaUsuario = req.body.idUsuarioUpdate
                                            certificadosList[i].idPersonaEmpresa = req.body.idPersonaEmpresa

                                            //certificadosList[i].fechaInicio = req.body.fechaInicio
                                            //certificadosList[i].fechaCaducidad = req.body.fechaCaducidad
                                            certificadosList[i].fechaVigenciaCert=req.body.fechaVigenciaCert
                                            certificadosList[i].fechaVigenciaContr=req.body.fechaVigenciaContr
                                            certificadosList[i].nCuotas = req.body.nCuotas
                                            certificadosList[i].fechaEmision = req.body.fechaEmision

                                            registrarCertificadoVendidoCAT(res, funcionName, certificadosList[i])

                                        }
                                    })
                                })
                            //})
                        //}
                    //})
                //})
            //}
        })
    })
}
function registrarCertificadoVendidoCAT(res, funcionName, registroCertificado){

    // 1) Registra el movimiento de cada certificado  => TABLA Certificado_movimiento
    // 2) Actualiza el Certificado poniendo el ID del movimiento en la tabla CERTIFICADO, tambien se cambia el estado del Certificado a  9 = Vendido
    // 3) Se registra el CAT (Tabla Cat) previamente registra o busca el id del asociado

    console_log("registrando la liquidacion en el movimiento del certificado : "+registroCertificado.nCertificado)

    var ultimoMovimiento = registroCertificado.ultimoMovimiento
    var idGuiaSalida = registroCertificado.idGuiaLiquidacion
    var estado = "V"
    var ultActualizaUsuario = registroCertificado.ultActualizaUsuario

    var queryInsertMovimiento = "Update Certificado_movimiento set fechaSalida=now(), idGuiaSalida=?, estado=?, ultActualizaUsuario=?, ultActualizaFecha=now() where idCertificado_movimiento =? "
    var parametros = [idGuiaSalida, estado, ultActualizaUsuario, ultimoMovimiento]

    ejecutarQUERY_MYSQL_Extra(registroCertificado, queryInsertMovimiento, parametros, res, funcionName, function(res, resultados, certificado){

        console_log("movimiento actualizado : "+certificado.ultimoMovimiento+" (Certif:"+certificado.nCertificado+")")

        console_log("tambien actualiza el estado de certificado a 9=Vendido")

        var nroCertificado = certificado.nCertificado
        var queryUpdateCertif = "Update Certificado set estadoRegistroCAT = '9', ultActualizaFecha=now() where nroCertificado=? "
        var params = [nroCertificado]

        ejecutarQUERY_MYSQL(queryUpdateCertif, params, res, funcionName, "false")

        registrarAsociado(res, funcionName, certificado, function(certif){

            console_log("Registrando CAT => "+certif.nCertificado)

            var nroCAT = certif.nCertificado
            var idAsociado = certif.idAsociado
            var placa = certif.placa
            var marca = certif.marca
            var modelo = certif.modelo
            var annoFabricacion = certif.anno
            var nMotorserie = certif.nroMotor
            //var fechaInicio = certif.fechaInicio
            //var fechaCaducidad = certif.fechaCaducidad
            var monto = certif.precio/certif.nCuotas
            var prima = certif.prima/certif.nCuotas
            var aporte = monto - prima
            var idConcesionario = certif.idConcesionario
            var fechaEmision = certif.fechaEmision
            var idVehiculo = certif.idVehiculo
            var conDeuda = "N"
            var ultActualizaUsuario = certif.ultActualizaUsuario

            // ** obtiene la fecha de Fin de la vigencia del certificado **
            var mdatec = certif.fechaVigenciaCert.split("/");
            var dc = new Date(mdatec[2], parseInt(mdatec[1])-1, mdatec[0]);
            dc.setMonth(dc.getMonth() + 12/parseInt(certif.nCuotas));
            certif.fechaVigenciaCertFin = convertirAfechaString(dc, false, false)

            var fechaVigenciaCert = dateTimeFormat(certif.fechaVigenciaCert)
            var fechaVigenciaCertFin = dateTimeFormat(certif.fechaVigenciaCertFin)

            // ** obtiene la fecha de Fin de la vigencia del contrato (Resta un año) **
            var mdateCont = certif.fechaVigenciaContr.split("/");
            var dCont = new Date(mdateCont[2], parseInt(mdateCont[1])-1, mdateCont[0], 0, 0,0,0);
            dCont.setYear(dCont.getFullYear()+1);
            certif.fechaVigenciaContrFin = convertirAfechaString(dCont, false, false);

            var fechaVigenciaContr = dateTimeFormat(certif.fechaVigenciaContr)
            var fechaVigenciaContrFin = dateTimeFormat(certif.fechaVigenciaContrFin)

            var queryInsert="Insert into Cat (nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, fechaInicio, fechaCaducidad, fechaControlInicio, fechaControlFin, monto, prima, aporte, idConcesionario," +
                " fechaEmision, idVehiculo, conDeuda, fechaLiquidacion, ultActualizaUsuario, ultActualizaFecha)" +
                " values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, now(), ?, now())"

            var parametros = [nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, fechaVigenciaContr, fechaVigenciaContrFin, fechaVigenciaCert, fechaVigenciaCertFin, monto, prima, aporte, idConcesionario, fechaEmision, idVehiculo, conDeuda, ultActualizaUsuario]

            ejecutarQUERY_MYSQL(queryInsert, parametros, res, funcionName, "false")
        })
    })
}
function registrarAsociado(res, funcionName, registroCertificado, callback){ // busca si existe el asociado registrado, sino existe el asociado entonces lo registra

    console_log("Registra u obtiene el ID del Asociado .. ")

    var idPersonaEmpresa = registroCertificado.idPersonaEmpresa

    var query = "select idAsociado from Asociado where idPersona = ?"

    ejecutarQUERY_MYSQL_Extra(registroCertificado, query, [idPersonaEmpresa], res, funcionName, function(res, resultados, certif){

        if(resultados.length>0){

            console_log("ya existe el asociado")

            certif.idAsociado = resultados[0].idAsociado
            callback(certif)
        }else{
            console_log("No existe el asociado, se registrara ...")

            var idPersonaEmpresa = certif.idPersonaEmpresa
            var queryInsertAsociado = "Insert into Asociado (idPersona) values (?)";

            ejecutarQUERY_MYSQL_Extra(certif, queryInsertAsociado, [idPersonaEmpresa], res, funcionName, function(res, resultados, certifResult){

                var idAsociado = resultados.insertId
                certifResult.idAsociado = idAsociado
                callback(certifResult)

            })
        }
    })
}
exports.getContratoDetalle = function(req, res, funcionName){ // obtiene toda la informacion de un contrato
    getInfoContrato(req, res, "getInfoContrato", function(results){
        enviarResponse(res, results)
    })
}
function getInfoContrato(req, res, funcionName, callback){

    var idContrato = req.query.idContrato;

    var query = "select idContrato, date_format(fechaEmision, '%d/%m/%Y') as fechaEmision,"+
        " date_format(fechaVigenciaContr, '%d/%m/%Y') as fechaVigenciaContr,"+
        " date_format(fechaVigenciaCert, '%d/%m/%Y') as fechaVigenciaCert,"+
        " nCuotas, flota, c.estado, e.idEmpresaTransp,"+
        " e.nombreCorto as nombreEmpresa, pe.idPersona as idPersonaEmpresa, pe.tipoPersona, concat(pe.nombres,' ',pe.apellidoPaterno,' ',pe.apellidoMaterno) as nombreNaturalEmpresa, pe.razonSocial, pe.nroDocumento as nroDocumentoPersonaEmpr, pe.telefonoMovil, pe.telefonoFijo, "+
        " pe.calle as direccionEmpresa, d.nombre as distritoEmpresa, prl.nroDocumento as DNIReprLegal"+
        " from Contrato c"+
        " inner join EmpresaTransp e on c.idEmpresaTransp = e.idEmpresaTransp"+
        " inner join Persona pe on e.idPersona = pe.idPersona"+
        " inner join Persona prl on e.idRepLegal = prl.idPersona"+
        " left join Distrito d on pe.idDistrito = d.idDistrito "+
        " where c.idContrato=?"

    var parametros = [idContrato]

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function(res, resultados){

        if(resultados.length>0){
            var queryCertificadosFlota = "Select c.idContratoCertificado, c.nroOrden, "+
                " c.nroCertificado as nCertificado, ce.ultimoMovimiento, c.precio, c.prima, c.valorCuota, c.nroCuota,"+
                " v.idVehiculo, v.placa, v.nroSerieMotor as nroMotor, v.marca, v.modelo, v.anno, v.nroAsientos,"+
                " v.idUsoClaseVehiculo as idUso, u.nombreUso, cv.idClase, cv.nombreClase as clase"+
                " from Contrato_Certificados c"+
                " inner join Vehiculo v on c.idVehiculo = v.idVehiculo"+
                " inner join Certificado ce on c.nroCertificado = ce.nroCertificado "+
                " inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo"+
                " inner join Uso_Vehiculo u on ucv.idUso = u.idUso"+
                " inner join Clase_Vehiculo cv on ucv.idClaseVehiculo = cv.idClase "+
                " where c.idContrato = ? order by c.nroOrden"

            var idContrato = req.query.idContrato;
            var params = [idContrato]

            ejecutarQUERY_MYSQL_Extra(resultados, queryCertificadosFlota, params, res, funcionName, function(res, resultados, resultadosPrevios){

                resultadosPrevios[0].listaFlota = resultados

                callback(resultadosPrevios)

            })
        }else{
            callback([])
        }
    })
}
exports.reporteContratoExcel = function(req, res, funcionName){
    getInfoContrato(req, res, "getInfoContrato", function(results){
        // genera el reporte excel
        results = results[0]
        var nroContrato=results.idContrato
        var cantDigitos = results.idContrato.toString().split("").length;
        var cantDeCeros = cantidadDigitosLPAD-cantDigitos;
        for(var i=0; i<cantDeCeros; i++){
            nroContrato = "0"+nroContrato;
        }
        results.nroContrato=nroContrato
        // ** obtiene la fecha de Fin de la vigencia del certificado **
        var mdatec = results.fechaVigenciaCert.split("/");
        var dc = new Date(mdatec[2], parseInt(mdatec[1])-1, mdatec[0]);
        dc.setMonth(dc.getMonth() + 12/parseInt(results.nCuotas));
        results.fechaVigenciaCertFin = convertirAfechaString(dc, false, false)

        // ** obtiene la fecha de Fin de la vigencia del contrato (Resta un año) **
        var mdateCont = results.fechaVigenciaContr.split("/");
        var dCont = new Date(mdateCont[2], parseInt(mdateCont[1])-1, mdateCont[0], 0, 0,0,0);
        dCont.setYear(dCont.getFullYear()+1);
        results.fechaVigenciaContrFin = convertirAfechaString(dCont, false, false);

        var Excel = require('exceljs');
        var workbook = new Excel.Workbook();
        var worksheetDatos = workbook.addWorksheet('Datos'); // primera hoja
        worksheetDatos.columns = [
            { header: 'Nro certificado', key: 'nCertificado' },
            { header: 'Nro contrato', key: 'nroContrato' }, //  = Auto ancho
            { header: 'Nro Orden', key: 'nroOrden' },
            { header: 'Nombre', key: 'nombreEmpresa' },
            { header: 'RUC', key: 'nroDocEmpresa'},
            { header: 'Direccion', key: 'domicilio' },
            { header: 'Telefono', key: 'telefono' },
            { header: 'Placa', key: 'placa'},
            { header: 'Clase', key: 'clase' },
            { header: 'Uso', key: 'nombreUso' },
            { header: 'Año', key: 'anno'},
            { header: 'Asiento', key: 'nroAsientos' },
            { header: 'Marca', key: 'marca'},
            { header: 'Modelo', key: 'modelo' },
            { header: 'Motor', key: 'nroMotor'},
            { header: 'Vigencia Con Ini', key: 'fechaVigenciaContr' },
            { header: 'Vigencia Con Fin', key: 'fechaVigenciaContrFin'},
            { header: 'Vigencia Control P Ini', key: 'fechaVigenciaCert' },
            { header: 'Vigencia Control P Fin', key: 'fechaVigenciaCertFin' },
            { header: 'Fecha de emision', key: 'fechaEmision' },
            { header: 'Monto', key: 'monto' }

        ];
        worksheetDatos.getCell('A1').alignment = { wrapText: true };
        worksheetDatos.getCell('B1').alignment = { wrapText: true };
        worksheetDatos.getCell('C1').alignment = { wrapText: true };
        worksheetDatos.getCell('D1').alignment = { wrapText: true };
        worksheetDatos.getCell('E1').alignment = { wrapText: true };
        worksheetDatos.getCell('F1').alignment = { wrapText: true };
        worksheetDatos.getCell('G1').alignment = { wrapText: true };
        worksheetDatos.getCell('H1').alignment = { wrapText: true };
        worksheetDatos.getCell('I1').alignment = { wrapText: true };
        worksheetDatos.getCell('K1').alignment = { wrapText: true };
        worksheetDatos.getCell('L1').alignment = { wrapText: true };
        worksheetDatos.getCell('M1').alignment = { wrapText: true };
        worksheetDatos.getCell('N1').alignment = { wrapText: true };
        worksheetDatos.getCell('O1').alignment = { wrapText: true };
        worksheetDatos.getCell('P1').alignment = { wrapText: true };
        worksheetDatos.getCell('Q1').alignment = { wrapText: true };
        worksheetDatos.getCell('R1').alignment = { wrapText: true };
        worksheetDatos.getCell('S1').alignment = { wrapText: true };
        worksheetDatos.getCell('T1').alignment = { wrapText: true };
        worksheetDatos.getCell('U1').alignment = { wrapText: true };
        worksheetDatos.getCell('V1').alignment = { wrapText: true };


        var worksheet = workbook.addWorksheet('Imprimir'); // segunda hoja
        var flotaVehiculos = results.listaFlota;
        var razon = 21;
        var startRow = 4

        for(var i=0; i<flotaVehiculos.length; i++){

            flotaVehiculos[i].fechaEmision=results.fechaEmision
            //flotaVehiculos[i].nombreEmpresa =results.nombreEmpresa
            flotaVehiculos[i].tipoPersona = results.tipoPersona
            if(flotaVehiculos[i].tipoPersona=='N'){
                flotaVehiculos[i].nombreEmpresa = results.nombreNaturalEmpresa
            }else{
                flotaVehiculos[i].nombreEmpresa = results.razonSocial
            }

            flotaVehiculos[i].nroDocEmpresa=results.nroDocumentoPersonaEmpr
            flotaVehiculos[i].nroContrato=results.nroContrato
            flotaVehiculos[i].fechaVigenciaContr=results.fechaVigenciaContr
            flotaVehiculos[i].fechaVigenciaContrFin=results.fechaVigenciaContrFin
            flotaVehiculos[i].fechaVigenciaCert=results.fechaVigenciaCert
            flotaVehiculos[i].fechaVigenciaCertFin=results.fechaVigenciaCertFin
            var indexRow = startRow + razon*i;
            console_log("fila  :"+indexRow)
            worksheet.getCell('F'+indexRow).value = flotaVehiculos[i].placa
            worksheet.getCell('H'+indexRow).value = flotaVehiculos[i].clase

            worksheet.getCell('F'+(indexRow+1)).value=flotaVehiculos[i].anno
            worksheet.getCell('H'+(indexRow+1)).value=flotaVehiculos[i].marca

            worksheet.getCell('F'+(indexRow+3)).value=flotaVehiculos[i].nroAsientos
            worksheet.getCell('H'+(indexRow+3)).value=flotaVehiculos[i].modelo

            worksheet.mergeCells('F'+(indexRow+5)+':G'+(indexRow+5));
            worksheet.getCell('F'+(indexRow+5)).value=flotaVehiculos[i].nombreUso
            worksheet.getCell('F'+(indexRow+5)).alignment = { wrapText: true };
            worksheet.getCell('H'+(indexRow+5)).value=flotaVehiculos[i].nroMotor

            // numero de contrato:
            worksheet.getCell("C"+(indexRow+6)).value=results.nroContrato
            worksheet.getCell("D"+(indexRow+6)).value=flotaVehiculos[i].nroOrden
            // vigencia contrato
            worksheet.getCell("C"+(indexRow+8)).value=results.fechaVigenciaContr
            worksheet.getCell("C"+(indexRow+9)).value=results.fechaVigenciaContrFin

            // vigencia de certificado
            worksheet.getCell("E"+(indexRow+8)).value=results.fechaVigenciaCert
            worksheet.getCell("E"+(indexRow+9)).value=results.fechaVigenciaCertFin

            worksheet.getCell("K"+(indexRow+8)).value=flotaVehiculos[i].placa
            worksheet.getCell("K"+(indexRow+9)).value=results.fechaVigenciaCert
            worksheet.getCell("K"+(indexRow+10)).value=results.fechaVigenciaCertFin

            worksheet.mergeCells('C'+(indexRow+12)+':H'+(indexRow+12));

            worksheet.getCell("C"+(indexRow+12)).value=flotaVehiculos[i].nombreEmpresa
            worksheet.getCell('C'+(indexRow+12)).alignment = { wrapText: true };

            worksheet.getCell("C"+(indexRow+14)).value=results.nroDocumentoPersonaEmpr
            var telefono = results.telefonoMovil;
            if(telefono==null || telefono==""){
                telefono = results.telefonoFijo
            }
            flotaVehiculos[i].telefono = telefono
            worksheet.getCell("E"+(indexRow+14)).value=telefono

            worksheet.mergeCells('B'+(indexRow+16)+':F'+(indexRow+16));
            worksheet.getCell("B"+(indexRow+16)).value= results.direccionEmpresa+", "+results.distritoEmpresa;
            worksheet.getCell('B'+(indexRow+16)).alignment = { wrapText: true };

            flotaVehiculos[i].domicilio = results.direccionEmpresa+", "+results.distritoEmpresa

            worksheet.getCell("H"+(indexRow+15)).value=convertirAfechaString(new Date(), true, false)
            worksheet.getCell("H"+(indexRow+16)).value= "S/."+number_format(flotaVehiculos[i].precio,2)
            flotaVehiculos[i].monto=number_format(flotaVehiculos[i].precio,2)
            worksheetDatos.addRow(flotaVehiculos[i])
        }

        var tempFilePath = tempfile('.xlsx');
        workbook.xlsx.writeFile(tempFilePath).then(function() {
            console.log('file is written');
            res.setHeader('Content-Disposition', 'attachment; filename=Contrato nro '+results.nroContrato+'.xlsx');
            res.sendFile(tempFilePath, function(err){
                console.log('---------- error downloading file: ' + err);
            });
        });
    })
}
exports.downloadExcel = function(req, res, funcionName){
    var Excel = require('exceljs');
    var workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet('My Sheet');

    worksheet.columns = [
        { header: 'Id', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 32 },
        { header: 'D.O.B.', key: 'DOB', width: 10 }
    ];
    worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970,1,1)});
    worksheet.addRow({id: 2, name: 'Jane Doe', dob: new Date(1965,1,7)});

    var tempFilePath = tempfile('excel.xlsx');
    workbook.xlsx.writeFile(tempFilePath).then(function() {
        console.log('file is written');
        res.sendFile(tempFilePath, function(err){
            console.log('---------- error downloading file: ' + err);
        });
    });
}