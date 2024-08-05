/**
 * Created by JEAN PIERRE on 15/03/2018.
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
var fs = require('fs');
var tempNroOrdenPagoList = []
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
function getNroOrdenPago(anno, index){
	var count = index+1
	count = count.toString()
	
	var cantidadDigitosCero = 5-count.split("").length;
	
	for(var i=1; i<=cantidadDigitosCero; i++){
		count="0"+count;
	}
	return anno+count.toString()
}
function getNroOrdenPagoProv(res, funcionName, callback){
	
	var fechaActual = new Date();
	var anno = fechaActual.getFullYear();
	
	var queryUltimoPago = "Select nroOrdenPago from OrdenPagoProv where nroOrdenPago like '"+anno+"%' order by nroOrdenPago desc limit 1";
	
	ejecutarQUERY_MYSQL(queryUltimoPago, [], res, funcionName, function(res, resultados){
		var nroOrdenPago;
		if(tempNroOrdenPagoList.length==0){
			if(resultados.length==0){
				nroOrdenPago=anno+"00001";
			}else{
				var numeroOrdenPago=(parseInt(resultados[0].nroOrdenPago.toString().substring(4))+1)+"";
				var cantidadDigitosCero = 5-numeroOrdenPago.split("").length;
				for(var i= 1; i<=cantidadDigitosCero; i++){
					numeroOrdenPago="0"+numeroOrdenPago;
				}
				nroOrdenPago=anno+numeroOrdenPago;
			}
		}else{
			// toma el ultimo
			var ultimaOrdenPago = tempNroOrdenPagoList[tempNroOrdenPagoList.length-1]
			
			var numeroOrdenPago=(parseInt(ultimaOrdenPago.toString().substring(4))+1)+"";
			var cantidadDigitosCero = 5-numeroOrdenPago.split("").length;
			for(var i= 1; i<=cantidadDigitosCero; i++){
				numeroOrdenPago="0"+numeroOrdenPago;
			}
			nroOrdenPago=anno+numeroOrdenPago;
		}
		
		tempNroOrdenPagoList.push(nroOrdenPago);

		console.log("orden pago : "+nroOrdenPago+" sera registrada!")
		
		callback(nroOrdenPago)
	})
}
exports.generarFlujoOriginal = function(req, res, funcionName){
	req.query.counter=0
	tempNroOrdenPagoList = []
	unificarFacturas(res, funcionName, function(res, funcionName, listaFacturas){
		for(var i=0; i<listaFacturas.length; i++){
			// registra una "orden de pago a proveedor" & "Expediente" por cada factura 
			guardarOrdenPagoYexpediente(res, funcionName, listaFacturas[i], function(idFactura){
				console.log("Se traspaso la factura : "+idFactura)
				console.log("counter : "+req.query.counter+" + 1");
				req.query.counter = req.query.counter+1;
				if(req.query.counter == listaFacturas.length){
					tempNroOrdenPagoList = []
					enviarResponse(res, [req.query.counter]);
					
				}
			})
		}
	})
}
function unificarFacturas(res, funcionName, callback){
	var query = "select idProveedor, nroDocumento, idTipoDocumento, fechaDoc, monto, idEtapa, codEvento, codAgraviado, "+
		"count(*) as contador, origen, codigoEnlace from Gasto "+
		"group by idProveedor, nroDocumento, idTipoDocumento, idEtapa, codEvento, codAgraviado "+
		"order by codEvento desc, codAgraviado limit 100";
		
	ejecutarQUERY_MYSQL(query, [], res, funcionName, function(res, results){
		callback(res, funcionName, results)
	})
}
function guardarOrdenPagoYexpediente(res, funcionName, registroFactura, callback){
	// Registra el expediente:
	var queryInsertExpediente = "Insert into Expediente(estado, fechaIngreso, codEvento, codAgraviado, nroDocReferencia, nroFolios, Observaciones, tipoExpediente, idProveedor) values (?,now(),?,?,?,?,?,?,?)";
	
	var estado = "4" // pagado
	var codEvento = registroFactura.codEvento
	var codAgraviado = registroFactura.codAgraviado
	var nroDocReferencia = "NINGUNO"
	var nroFolios = "0"
	var observaciones = "Expediente para recomponer las facturas"
	var tipoExpediente = "10"
	var idProveedor = registroFactura.idProveedor
		
	var params = [estado, codEvento, codAgraviado, nroDocReferencia, nroFolios, observaciones, tipoExpediente, idProveedor];
	ejecutarQUERY_MYSQL(queryInsertExpediente, params, res, funcionName, function(res, resultados){		
		
		registroFactura.idExpediente = resultados.insertId
		console.log("Se registro el expediente : "+registroFactura.idExpediente)
		
		getNroOrdenPagoProv(res, funcionName, function(nroOrdenPago){
			// registra la orden de pago a proveedor:
			
			registroFactura.nroOrdenPago = nroOrdenPago
			
			var queryInsertOrdenPago = "Insert into OrdenPagoProv (nroOrdenPago, estado, fechaRegistro, idProveedor, idExpediente, codEvento, codAgraviado, fechaAprobacion, monto) values (?,?, now(),?,?,?,?,now(),?) ";
					
			var estado = "P"
			var idProveedor  = registroFactura.idProveedor
			var idExpediente = registroFactura.idExpediente
			var codEvento    = registroFactura.codEvento
			var codAgraviado = registroFactura.codAgraviado
			var monto =  registroFactura.monto // observacion
			
			var parametros = [nroOrdenPago, estado, idProveedor, idExpediente, codEvento, codAgraviado, monto]
			
			ejecutarQUERY_MYSQL(queryInsertOrdenPago, parametros, res, funcionName, function(res, results){
				console.log("Se registro la orden de pago : "+registroFactura.nroOrdenPago)
				
				// busca todas las cartas de garantias afectadas
				
				var codEvento    = registroFactura.codEvento
				var codAgraviado = registroFactura.codAgraviado				
				var idProveedor = registroFactura.idProveedor 
				var nroDocumento = registroFactura.nroDocumento
				var idTipoDocumento = registroFactura.idTipoDocumento
				var idEtapa = registroFactura.idEtapa
				
				var queryCartas = "select codigoEnlace, origen from Gasto where codEvento=? and codAgraviado=? and idProveedor=? and nroDocumento=? and idTipoDocumento=? and idEtapa=? group by codigoEnlace, origen";
				var params = [codEvento, codAgraviado, idProveedor, nroDocumento, idTipoDocumento, idEtapa]
				
				ejecutarQUERY_MYSQL(queryCartas, params, res, funcionName, function(res, results){
											
					// divide las cartas de garantia en antigua y nuevas (origen = 0 & origen=1)
					var cartasNuevas = ""
					var cartasAntiguas = ""
					
					console.log("cantidad de cartas afectadas para la orden pago : "+registroFactura.nroOrdenPago+" : "+results.length)
					
					for(var i=0; i<results.length; i++){
						if(results[i].codigoEnlace!=""){
							if(results[i].origen==0){ // nueva
								if(cartasNuevas!=""){
									cartasNuevas = cartasNuevas+", "
								}
								cartasNuevas = cartasNuevas+results[i].codigoEnlace
							}else{ // antigua
								if(cartasAntiguas!=""){
									cartasAntiguas = cartasAntiguas+", "
								}
								cartasAntiguas = cartasAntiguas+results[i].codigoEnlace
							}
						}							
					}
					
					var params = [registroFactura.nroOrdenPago]
					
					console.log("cartasNuevas : "+cartasNuevas)
					console.log("cartasAntiguas : "+cartasAntiguas)
					
					if(cartasNuevas!=""){
						var queryUpdateCartasNuevas = "Update CartaGarantia set estado = 'F', nroOrdenPago=? where idCarta in ("+cartasNuevas+")"
						ejecutarQUERY_MYSQL(queryUpdateCartasNuevas, params, res, funcionName, "false")
							
					}
					if(cartasAntiguas!=""){
						var queryUpdateCartasAntiguas = "Update CartaGarantia set estado = 'F', nroOrdenPago=? where codigoEnlace in ("+cartasAntiguas+")"
						ejecutarQUERY_MYSQL(queryUpdateCartasAntiguas, params, res, funcionName, "false")
					}
					
					// Pasa las facturas desde Gastos a DocumentoPagoProv
					var queryInserFactura = "Insert into DocumentoPagoProv (idProveedor, nroDocumento, idTipoDoc, fechaEmision, fechaRecepcion, monto, idEtapa, codEvento, codAgraviado, nroOrdenPago) values (?,?,?,?,now(),?,?,?,?,?)"
					
					var parametros = [registroFactura.idProveedor, registroFactura.nroDocumento, registroFactura.idTipoDocumento,
					registroFactura.fechaDoc, registroFactura.monto, registroFactura.idEtapa, registroFactura.codEvento, registroFactura.codAgraviado, registroFactura.nroOrdenPago]
					
					ejecutarQUERY_MYSQL(queryInserFactura, parametros, res, funcionName, function(res, results){
						var idFactura = results.insertId;
						callback(idFactura)
					})
				})				
			})			
		})
	})	
}
exports.generarFlujo = function(req, res, funcionName){
	
	// 1.- obtiene todos los expedientes relacionados con las facturas
	var queryExpedienteFact = "Select idExpediente, codEvento, codAgraviado, idProveedor from Gasto group by idExpediente, codEvento, codAgraviado order by codEvento, idExpediente";
	
	ejecutarQUERY_MYSQL(queryExpedienteFact, [], res, funcionName, function(res, expedientes){
		
		var fechaActual = new Date();
		var año = fechaActual.getFullYear();
		
		for(var i=0; i<expedientes.length; i++){
			// registra la orden de pago
			var queryInsertOrdenPago = "Insert into OrdenPagoProv (nroOrdenPago, estado, fechaRegistro, idProveedor, idExpediente, codEvento, codAgraviado, fechaAprobacion) values (?,?, now(), ?,?,?,?,now()) ";
			
			var nroOrdenPago = getNroOrdenPago(año, i) 
			var estado = "P"
			var idProveedor = expedientes[i].idProveedor
			var idExpediente = expedientes[i].idExpediente
			var codEvento = expedientes[i].codEvento
			var codAgraviado = expedientes[i].codAgraviado
			
			var params = [nroOrdenPago, estado, idProveedor, idExpediente, codEvento, codAgraviado]
			
			ejecutarQUERY_MYSQL_Extra([nroOrdenPago, idExpediente] ,queryInsertOrdenPago, params, res, funcionName, function(res, results, informacionEnviada){
				if(results.affectedRows>0){
					
					var nroOrdenPago = informacionEnviada[0]
					var idExpediente = informacionEnviada[1]
					
					// busca todas las cartas de garantias afectadas
					var queryCartas = "select codigoEnlace, origen from Gasto where idExpediente = ? group by codigoEnlace, origen";
					var params = [idExpediente]
					
					ejecutarQUERY_MYSQL_Extra(informacionEnviada, queryCartas, params, res, funcionName, function(res, results, informacionEnviada){
						
						var nroOrdenPago = informacionEnviada[0]
						var idExpediente = informacionEnviada[1]
						
						// divide las cartas de garantia en antigua y nuevas (origen = 0 & origen=1)
						var cartasNuevas = ""
						var cartasAntiguas = ""
						for(var i=0; i<results.length; i++){
							if(results[i].codigoEnlace!=""){
								if(results[i].origen==0){ // nueva
									if(cartasNuevas!=""){
										cartasNuevas = cartasNuevas+", "
									}
									cartasNuevas = cartasNuevas+results[i].codigoEnlace
								}else{ // antigua
									if(cartasAntiguas!=""){
										cartasAntiguas = cartasAntiguas+", "
									}
									cartasAntiguas = cartasAntiguas+results[i].codigoEnlace
								}
							}							
						}
						
						var params = [nroOrdenPago]
						
						if(cartasNuevas!=""){
							var queryUpdateCartasNuevas = "Update CartaGarantia set estado = 'F' and nroOrdenPago=? where idCarta in ("+cartasNuevas+")"
							ejecutarQUERY_MYSQL(queryUpdateCartasNuevas, params, res, funcionName, "false")
							
						}
						if(cartasAntiguas!=""){
							var queryUpdateCartasAntiguas = "Update CartaGarantia set estado = 'F' and nroOrdenPago=? where codigoEnlace in ("+cartasAntiguas+")"
							ejecutarQUERY_MYSQL(queryUpdateCartasAntiguas, params, res, funcionName, "false")
						}
						
						// Pasa las facturas desde Gastos a DocumentoPagoProv
						
						unificacionFacturas(idExpediente, nroOrdenPago, res, funcionName, function(res, funcionName, facturas, nroOrdenPago){
							var queryInserFactura = "Insert into DocumentoPagoProv (idProveedor, nroDocumento, idTipoDoc, fechaEmision, fechaRecepcion, monto, idEtapa, codEvento, codAgraviado, nroOrdenPago) values "
							
							var values = ""
							for(var i=0; i<facturas.length; i++){
								if(values!=""){
									values = values +", "
								}
								values = values+"("+facturas[i].idProveedor+", '"+facturas[i].nroDocumento+"', '"+facturas[i].idTipoDocumento+"', '"+facturas[i].fechaDoc+"', now(), '"+facturas[i].monto+"', '"+facturas[i].idEtapa+"', '"+facturas[i].codEvento+"', '"+facturas[i].codAgraviado+"', '"+nroOrdenPago+"')"
								
							}
							if(values!=""){
								queryInserFactura = queryInserFactura + values
								ejecutarQUERY_MYSQL(queryInserFactura, [], res, funcionName, "false")
							}
						})
					})
				}
			})
		}
	})
}
function unificacionFacturas(idExpediente, nroOrdenPago, res, funcionName, callback){
	var query = "select idProveedor, nroDocumento, idTipoDocumento, fechaDoc, monto, idEtapa, codEvento, codAgraviado, "+
		"count(*) as contador, origen, codigoEnlace, idExpediente from Gasto where idExpediente = ? "+
		"group by idProveedor, nroDocumento, idTipoDocumento, idEtapa, codEvento, codAgraviado, idExpediente "+
		"order by codEvento, codAgraviado ";
		
	ejecutarQUERY_MYSQL_Extra(nroOrdenPago, query, [idExpediente], res, funcionName, function(res, results, nroOrdenPago){
		callback(res, funcionName, results, nroOrdenPago)
	})
}
exports.subirEmpresasTransportes = function(req, res, funcionName){
	req.query.counter=0
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:","});
	var archivo = req.query.archivo
	if(archivo==null || archivo==''){
		archivo = "empresasTransportes.csv"
	}
	var ruta_archivo = "./www/files/"+archivo;
	csvConverter.fromFile(ruta_archivo,function(err,result){
		for(var i=0; i<result.length; i++){
			getRepresentanteYpersonaJuridica(result[i], i, res, funcionName, function(idPersonaRepresentante, idPersonaEmpresa, index){
				var registroEmpresa = result[index]
				var queryInsertEmpresa = "Insert into EmpresaTransp(idPersona, idRepLegal, nroResolucion, fechaRegistro, registroEstado, nombreCorto) values (?,?,?, now(), '0',?) "
				var params = [idPersonaEmpresa, idPersonaRepresentante, registroEmpresa.NroResolucion, registroEmpresa.NombreCorto]
				ejecutarQUERY_MYSQL(queryInsertEmpresa, params, res, funcionName, "false")
				console.log("counter : "+req.query.counter+" + 1");
				req.query.counter = req.query.counter+1;
				if(req.query.counter == result.length){
					enviarResponse(res, [req.query.counter]);
				}
			})
		}
	})
	
}
function getRepresentanteYpersonaJuridica(registro, index, res, funcionName, callback){
	var personaEmpresa = {
		razonSocial: registro.Nombre,
		nroDocumento: registro.Ruc,
		calle:registro.DireccionEmpresa
	}
	if(registro.DNI!=null && registro.DNI!=''){
		var personaRepresentante = {
			nombres:registro.Nombres,
			nroDocumento:registro.DNI,
			calle:registro.Direccion,
			telefonoMovil:registro.Telefono
		}
		guardarObtenerPersona(personaRepresentante, personaEmpresa, res, funcionName, function(idPersonaRepr, personaEmpresa){
			registrarPersonaEmpresa(idPersonaRepr, personaEmpresa, res, funcionName, function(idPersonaRepresentante, idPersonaEmpresa){
				callback(idPersonaRepresentante, idPersonaEmpresa, index)
			})
		})		
	}else{
		registrarPersonaEmpresa(0, personaEmpresa, res, funcionName, function(idPersonaRepresentante, idPersonaEmpresa){
			callback(idPersonaRepresentante, idPersonaEmpresa, index)
		})
	}
}
function  registrarPersonaEmpresa(representanteId, personaEmpresa, res, funcionName, callback){
	var queyInsertPersonaEmpresa = "Insert into Persona (razonSocial, tipoPersona, nroDocumento, calle) values (?,'J',?,?)";
	var params = [personaEmpresa.razonSocial, personaEmpresa.nroDocumento, personaEmpresa.calle]
	ejecutarQUERY_MYSQL(queyInsertPersonaEmpresa, params, res, funcionName, function(res, results){
		var idPersonaEmpresa = results.insertId
		callback(representanteId, idPersonaEmpresa)
	})
}
function guardarObtenerPersona(personaRepr, personaEmpresa, res, funcionName, callback){
	var nroDocumento = personaRepr.nroDocumento
	var query = "Select idPersona from Persona where nroDocumento=?"
	var params = [nroDocumento]
	
	ejecutarQUERY_MYSQL(query, params, res, funcionName, function(res, results, data){
		if(results.length>0){
			callback(results[0].idPersona, personaEmpresa)
		}else{
			// registra el representante
			var queryInsert = "Insert into Persona (nombres, tipoPersona, nroDocumento, calle, telefonoMovil) values (?,'N',?,?,?)";
			var params = [personaRepr.nombres, personaRepr.nroDocumento, personaRepr.calle, personaRepr.telefonoMovil]
			ejecutarQUERY_MYSQL(queryInsert, params, res, funcionName, function(res, results){
				var idPersona = results.insertId
				callback(idPersona, personaEmpresa)
			})
		}
	})
}