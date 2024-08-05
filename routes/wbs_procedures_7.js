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
var convertirAfechaString = modulo_global.convertirAfechaString;
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
function getNroOrdenPagoAgr(res, funcionName, callback){
	var fechaActual = new Date();
	var anno = fechaActual.getFullYear();
	
	var queryUltimoPago = "Select nroOrdenPagoAgraviado as nroOrdenPago from OrdenPagoAgraviado where nroOrdenPagoAgraviado like '"+anno+"%' order by nroOrdenPagoAgraviado desc limit 1";
	
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
function generarExpedienteOrdenPago(res, funcionName, index, registro, callback){
	var query = "Insert into Expediente(estado, fechaIngreso, codEvento, codAgraviado, nroDocReferencia, nroFolios, Observaciones, tipoExpediente, diasRespuesta) values (?,now(),?,?,?,?,?,?,?)";
	
	var estado = "" // pagado
	switch(registro.estado){
		case 'B':
			estado = '2'
			break;
		case 'P':
			estado = '4'
			break;
	}
	var codEvento = registro.codEvento
	var codAgraviado = registro.codAgraviado
	var nroDocReferencia = "NINGUNO"
	var nroFolios = "1"
	var observaciones = "*GENERACION AUTOMATICA DESDE ORDEN DE PAGO AGRAVIADO* Tipo Doc="+registro.tipoDoc+" -> descripcion, Nro. Doc="+registro.nroDocumento
	
	var tipoExpediente = ""
	switch(registro.idEtapa){
		case 1:
			tipoExpediente = "1"
			break;
		case 2:
			tipoExpediente = "4"
			break;
		case 3:
			tipoExpediente = "5"
			break;
		case 4:
			tipoExpediente = "2"
			break;
		case 5:
			tipoExpediente = "3"
			break;
	}
	registro.tipoExpediente = tipoExpediente
	registro.observaciones = observaciones
	
	var diasRespuesta = "3"
	
	var parametros = [estado, codEvento, codAgraviado, nroDocReferencia, nroFolios, observaciones, tipoExpediente, diasRespuesta]
	ejecutarQUERY_MYSQL(query, parametros, res, "Insertando Expediente", function(res, results){
		
		getNroOrdenPagoAgr(res, funcionName, function(nroOrdenPago){
			
			var idExpediente =  results.insertId;
			var estado = registro.estado
			var tipoExpediente = registro.tipoExpediente
			var codEvento = registro.codEvento
			var codAgraviado = registro.codAgraviado
			var idPersona = registro.idPersonaAgraviado
			var fechaAprobacion = registro.fecha
			var ultActualizaUsuario = registro.ultActualizaUsuario
			var idEtapa = registro.idEtapa
			var ultActualizaFecha = registro.ultActualizaFecha
			var monto = registro.monto
			var nroDiasInvalTemp = "0"
			var porcInvalPerm = "0.0"
			var observaciones = registro.observaciones
			
			var queryInsertOrdenPago = "Insert into OrdenPagoAgraviado(nroOrdenPagoAgraviado, estado, fechaRegistro, tipoExpediente, idExpediente, codEvento, codAgraviado, idPersona, fechaAprobacion, ultActualizaUsuario, idEtapa, ultActualizaFecha, monto, nroDiasInvalTemp, porcInvalPerm, Observaciones) values (?,?,now(),?,?,?,?,?,?,?,?,?,?,?,?,?)";
			
			var params = [nroOrdenPago, estado, tipoExpediente, idExpediente, codEvento, codAgraviado, idPersona, fechaAprobacion, ultActualizaUsuario, idEtapa, ultActualizaFecha, monto, nroDiasInvalTemp, porcInvalPerm, observaciones]
			
			ejecutarQUERY_MYSQL(queryInsertOrdenPago, params, res, "Insertando OrdenPago", function(res2, results2){
				callback(results2)
			})
		})
		
	})
	
}
exports.repararOrdenesPagoAgraviado = function(req, res, funcionName){
	tempNroOrdenPagoList = []
	req.query.counter=0
	var query = "select o.* , t.descripBreve as tipoDoc, a.idPersona as idPersonaAgraviado from OrdenPago o inner join TipoDocumento t on o.idTipoDocumento = t.idTipoDocumento "+
	" inner join Agraviado a on o.codAgraviado = a.codAgraviado "+
	" where o.estado in ('B','P') and o.idEtapa in ('1', '2', '3', '4', '5')";
	ejecutarQUERY_MYSQL(query, [], res, funcionName, function(res, listaOrdenes){
		for(var i=0; i<listaOrdenes.length; i++){
			generarExpedienteOrdenPago(res, funcionName, i, listaOrdenes[i], function(){				
				req.query.counter = req.query.counter+1;				
				if(req.query.counter == listaOrdenes.length){
					tempNroOrdenPagoList = []
					enviarResponse(res, [req.query.counter]);					
				}
			})
		}
	})
}
exports.generarFlujoOriginal = function(req, res, funcionName){
	
	var tipoFactura = req.query.tipoFactura // 0 = Facturas multiplicadas con montos iguales ; 1 = Facturas multiplicadas con montos dividos
	var archivo = req.query.archivo
	
	req.query.counter=0
	tempNroOrdenPagoList = []
	
	unificarFacturas(req, tipoFactura, archivo, [], res, funcionName, function(res, funcionName, listaFacturas){
		enviarResponse(res, listaFacturas)
		for(var i=0; i<listaFacturas.length; i++){
			
			listaFacturas[i].idProveedor = listaFacturas[i].listaSubFacturas[0].idProveedor
			listaFacturas[i].nroDocumento=listaFacturas[i].listaSubFacturas[0].Nro_Documento_Factura_Ipress
			listaFacturas[i].idTipoDocumento=listaFacturas[i].listaSubFacturas[0].idTipoDocumento
			listaFacturas[i].fechaDoc=listaFacturas[i].listaSubFacturas[0].fecha
			listaFacturas[i].monto=listaFacturas[i].montoTotal
			listaFacturas[i].idEtapa=listaFacturas[i].listaSubFacturas[0].idEtapa
			listaFacturas[i].codEvento=listaFacturas[i].listaSubFacturas[0].evento
			listaFacturas[i].codAgraviado=listaFacturas[i].listaSubFacturas[0].Cod_Agraviado
			listaFacturas[i].ruta = listaFacturas[i].listaSubFacturas[0].ruta
			
			//console.log("factura JSON: "+JSON.stringify(listaFacturas[i]))
			
			// registra una "orden de pago a proveedor" & "Expediente" por cada factura 
			guardarOrdenPagoYexpediente(i, res, funcionName, listaFacturas[i], function(idFactura){
				console.log("Se traspaso la factura : "+idFactura)
				console.log("counter : "+req.query.counter+" + 1");
				req.query.counter = req.query.counter+1;
				if(req.query.counter == listaFacturas.length){
					tempNroOrdenPagoList = []
					//enviarResponse(res, [req.query.counter]);
					
				}
			})
		}
	})
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
		console.log("dateTimeFormat: "+err)
    }
}
function unificarFacturas(req, tipoFactura, archivo, facturasAgrupadas, res, funcionName, callback){
	req.query.counterFacturas=0;
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:","});
	
	if(archivo==null || archivo==''){
		archivo = "reparacionFactura.csv"
	}
	
	var ruta_archivo = "./www/files/"+archivo;
	
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
	
	csvConverter.fromFile(ruta_archivo,function(err, result){
		
		for(var i=0; i<result.length; i++){			
			getIdProveedor(result[i].Nosocomio,i, res, funcionName, function(data){
				var index = data.index;
				result[index].fecha = dateTimeFormat(result[index].Fecha_Factura);
				result[index].idProveedor = data.idProveedor;
				result[index].idEtapa = tablaIdEtapa[result[index].Tipo_Gasto];
				result[index].idTipoDocumento = idTipoDocumento[result[index].cod_TES_tipodocumento];
				result[index].ruta = archivo
				
				// corrige el monto
				result[index].monto = result[index].Monto_Factura.toString()				
				result[index].monto = result[index].monto.replace("S/.", "");
				result[index].monto = result[index].monto.replace(",","");
				result[index].monto = result[index].monto.replace(",","");
				result[index].monto = result[index].monto.trim()
				
				var keyGroup = result[index].idProveedor+"#"+
					result[index].Nro_Documento_Factura_Ipress+"#"+
					result[index].idTipoDocumento+"#"+
					result[index].idEtapa+"#"+
					result[index].evento+"#"+
					result[index].Cod_Agraviado
				
				console.log("keyGroup: "+keyGroup)
				
				var encontrado = false
				
				for(var y=0; y<facturasAgrupadas.length; y++){
					if(facturasAgrupadas[y].keyGroup == keyGroup){
						
						encontrado = true;
						
						facturasAgrupadas[y].listaSubFacturas.push(result[index])
						facturasAgrupadas[y].contadorSubFacturas = facturasAgrupadas[y].listaSubFacturas.length;
						if(tipoFactura=="1"){ // suma los montos
							facturasAgrupadas[y].montoTotal = parseFloat(facturasAgrupadas[y].montoTotal)+parseFloat(result[index].monto)
						}
						break;
					}
				}
								
				if(!encontrado){
					var objetoFacturaAgrupada = {
						keyGroup : keyGroup,
						listaSubFacturas : [result[index]],
						montoTotal:parseFloat(result[index].monto),
						contadorSubFacturas:1
					}
					facturasAgrupadas.push(objetoFacturaAgrupada)
				}
				
				console.log("index : "+data.index)
				req.query.counterFacturas ++;
				console.log("termina de leer "+req.query.counterFacturas+" facturas")
				if(req.query.counterFacturas == result.length){
					
					console.log("Termina de leer todas las filas del excel ..")
					
					callback(res, funcionName, facturasAgrupadas)
				}
				
			})
			
		}
		
	})	
}
function insertarProveedor(idPersona, nombreProveedor, res, callback){
	if(idPersona==0){
		var queryPersona = "Insert into Persona(tipoPersona, razonSocial) values ('J', ?) ";
		var parametros = [nombreProveedor]
		ejecutarQUERY_MYSQL(queryPersona, parametros, res, "InsertarProveedor", function(res, results){
			var idPersona = results.insertId;
			var queryInsertarProveedor = "Insert into Proveedor(idPersona) values (?)";
			var params = [idPersona]
			ejecutarQUERY_MYSQL(queryInsertarProveedor, params, res, "insertarProveedor", function(res, resultsProv){
				var idProveedor = resultsProv.insertId
				callback(idProveedor)
			})
		})
	}else{
		var queryInsertarProveedor = "Insert into Proveedor(idPersona) values (?)";
		var params = [idPersona]
		ejecutarQUERY_MYSQL(queryInsertarProveedor, params, res, "insertarProveedor", function(res, resultsProv){
			var idProveedor = resultsProv.insertId
			callback(idProveedor)
		})
	}
}
function getIdProveedor(nombreProveedor, index, res, funcionName, callback){
	var query = "Select pr.idProveedor from Proveedor pr inner join Persona p on pr.idPersona = p.idPersona where concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '"+nombreProveedor+"%' or p.razonSocial like '"+nombreProveedor+"%'";
	var parametros = []
	ejecutarQUERY_MYSQL_Extra(index, query, parametros, res, funcionName, function(res, resultados, indexArray){		
		if(resultados.length>0){
			var idProveedor = resultados[0].idProveedor;
			callback({
				idProveedor:idProveedor,
				index:indexArray
			});
		}else{
			var queryPersona = "Select p.idPersona from Persona p where concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '"+nombreProveedor+"%' or p.razonSocial like '"+nombreProveedor+"%'";
			ejecutarQUERY_MYSQL(queryPersona, [], res, funcionName, function(res2, results2){
				var idPersona = 0
				if(results2.length>0){
					idPersona = results2[0].idPersona					
				}
				insertarProveedor(idPersona, nombreProveedor, res, function(idProveedor){
					callback({
						idProveedor:idProveedor,
						index:indexArray
					});
				})
			})
		}		
	})
}
function guardarOrdenPagoYexpediente(indice, res, funcionName, registroFactura, callback){
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
			
			console.log("parametros para insertar la orden de pago : "+parametros)
			
			ejecutarQUERY_MYSQL(queryInsertOrdenPago, parametros, res, "queryInsertOrdenPago", function(res, results){
				console.log("Se registro la orden de pago : "+registroFactura.nroOrdenPago)
				
				// busca todas las cartas de garantias afectadas
				
				var codEvento    = registroFactura.codEvento
				var codAgraviado = registroFactura.codAgraviado				
				var idProveedor = registroFactura.idProveedor 
				var nroDocumento = registroFactura.nroDocumento
				var idTipoDocumento = registroFactura.idTipoDocumento
				var idEtapa = registroFactura.idEtapa
				
				/*var queryCartas = "select codigoEnlace, origen from Gasto where codEvento=? and codAgraviado=? and idProveedor=? and nroDocumento=? and idTipoDocumento=? and idEtapa=? group by codigoEnlace, origen";
				var params = [codEvento, codAgraviado, idProveedor, nroDocumento, idTipoDocumento, idEtapa]*/
				
				/*ejecutarQUERY_MYSQL(queryCartas, params, res, funcionName, function(res, results){*/
					var resultsEnlaces = []
					var subFacturas = registroFactura.listaSubFacturas 
					for(var z=0; z<subFacturas.length; z++){
						
						var found = false;
						var origen = 0;
						var ncodigoEnlace=subFacturas[z].id_carta_garantia;
						
						if (subFacturas[z].codigoEnlace!=undefined && subFacturas[z].codigoEnlace!=null && (subFacturas[z].codigoEnlace+"").trim()!=""){							
							
							ncodigoEnlace=subFacturas[z].codigoEnlace
							origen = 1;
						}
						
						for(a=0; a<resultsEnlaces.length; a++){
							if(resultsEnlaces[a].codigoEnlace==ncodigoEnlace && resultsEnlaces[a].origen==origen ){
								found=true;
								break;
							}
						}
						if(!found){
							resultsEnlaces.push({
								origen:origen,
								codigoEnlace:ncodigoEnlace
							})
						}
					}
					
					// divide las cartas de garantia en antigua y nuevas (origen = 0 & origen=1)
					var cartasNuevas = ""
					var cartasAntiguas = ""
					
					console.log("cantidad de cartas afectadas para la orden pago : "+registroFactura.nroOrdenPago+" : "+resultsEnlaces.length)
					
					for(var i=0; i<resultsEnlaces.length; i++){
						if(resultsEnlaces[i].codigoEnlace!=""){
							if(resultsEnlaces[i].origen==0){ // nueva
								if(cartasNuevas!=""){
									cartasNuevas = cartasNuevas+", "
								}
								cartasNuevas = cartasNuevas+"'"+resultsEnlaces[i].codigoEnlace+"'"
							}else{ // antigua
								if(cartasAntiguas!=""){
									cartasAntiguas = cartasAntiguas+", "
								}
								cartasAntiguas = cartasAntiguas+"'"+resultsEnlaces[i].codigoEnlace+"'"
							}
						}							
					}
					
					var params = [registroFactura.nroOrdenPago]
					
					console.log("cartasNuevas : "+cartasNuevas)
					console.log("cartasAntiguas : "+cartasAntiguas)
					
					if(cartasNuevas!=""){
						var queryUpdateCartasNuevas = "Update CartaGarantia set estado = 'F', nroOrdenPago=? where idCarta in ("+cartasNuevas+")"
						ejecutarQUERY_MYSQL(queryUpdateCartasNuevas, params, res, "cartasNuevas", "false")
							
					}
					if(cartasAntiguas!=""){
						var queryUpdateCartasAntiguas = "Update CartaGarantia set estado = 'F', nroOrdenPago=? where codigoEnlace in ("+cartasAntiguas+")"
						ejecutarQUERY_MYSQL(queryUpdateCartasAntiguas, params, res, "cartasAntiguas", "false")
					}
					
					// Pasa las facturas desde Gastos a DocumentoPagoProv
					var queryInserFactura = "Insert into DocumentoPagoProv (idProveedor, nroDocumento, idTipoDoc, fechaEmision, fechaRecepcion, monto, idEtapa, codEvento, codAgraviado, nroOrdenPago, ruta) values (?,?,?,?,now(),?,?,?,?,?,?)"
					
					var parametros = [registroFactura.idProveedor, registroFactura.nroDocumento, registroFactura.idTipoDocumento,
					registroFactura.fechaDoc, registroFactura.monto, registroFactura.idEtapa, registroFactura.codEvento, registroFactura.codAgraviado, registroFactura.nroOrdenPago, registroFactura.ruta]
					
					console.log("indice en excel :"+indice)
					ejecutarQUERY_MYSQL(queryInserFactura, parametros, res, "InsertarFactura", function(res, results){
						var idFactura = results.insertId;
						callback(idFactura)
					})
				/*})*/				
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
/*
function (dt2, dt1) {

  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
   diff /= (60 * 60 * 24 * 7 * 4);
  return Math.abs(Math.round(diff));
  
 }*/
 function diff_months(date1, date2) {
    var Nomonths;
    Nomonths= (date2.getFullYear() - date1.getFullYear()) * 12;
    Nomonths-= date1.getMonth() + 1;
    Nomonths+= date2.getMonth() +1; // we should add + 1 to get correct month number
    return Nomonths <= 0 ? 0 : Nomonths;
}
exports.insertContratos_renovacion = function(req, res, funcionName){
	req.query.contador = 0	
	var query="Select idContrato, date_format(fechaEmision, '%d/%m/%Y') as fechaEmision,  date_format(fechaVigenciaContr, '%d/%m/%Y') as fechaVigenciaContr, date_format(fechaInicioCuota, '%d/%m/%Y') as fechaVigenciaCert, nCuotas, flota, idEmpresaTransp from Contrato where ultActualizaUsuario is null and ultActualizaFecha is null"
	ejecutarQUERY_MYSQL(query, [], res, funcionName, function(res, listaContratos){
		for(var i=0; i<listaContratos.length; i++){
			var contrato = listaContratos[i]			
			var fechaVigenciaCert = contrato.fechaVigenciaCert
			var nroCuota = contrato.nCuotas
			if(fechaVigenciaCert!=null){
				fechaVigenciaCert = fechaVigenciaCert.split("/")
				var vigenciaCert = new Date(fechaVigenciaCert[2], parseInt(fechaVigenciaCert[1])-1, fechaVigenciaCert[0], 0,0,0,0)
				var actualMenosUnAnno = new Date()
				actualMenosUnAnno = actualMenosUnAnno.setMonth(actualMenosUnAnno.getMonth() - 12);
				
				if(vigenciaCert>actualMenosUnAnno){ 7// si el certificado es reciente
					var fechaVigenciaContr = contrato.fechaVigenciaContr
					fechaVigenciaContr = fechaVigenciaContr.split("/")
					var vigenciaContrato = new Date(fechaVigenciaContr[2], parseInt(fechaVigenciaContr[1])-1, fechaVigenciaContr[0], 0,0,0,0)
					// encuentra la diferencia entre la fecha de certificado y contrato
					var diferenciaEnMeses = diff_months(vigenciaContrato, vigenciaCert)
					var intervalo = 12/contrato.nCuotas
					
					var nCuota = Math.round((diferenciaEnMeses/intervalo)+1)					
					if(nCuota<=12){
						nroCuota = nCuota
					}
				}
			}	
			var queryInsertRenovacion = "Insert into Contrato_Renovacion(idContrato, nroCuota, estado, idEmpresaTransp, fechaPagoCuota, fechaRenovacion, flotaActual) values(?,?,?,?,now(),?,?)"
				
			var idContrato = contrato.idContrato
			var estado = 'I'
			var idEmpresaTransp = contrato.idEmpresaTransp
			var fechaRenovacion = dateTimeFormat(contrato.fechaVigenciaCert)
			var flotaActual = contrato.flota
				
			var params = [idContrato, nroCuota, estado, idEmpresaTransp, fechaRenovacion, flotaActual ]
				
			ejecutarQUERY_MYSQL(queryInsertRenovacion, params, res, "insertando RENOVACION", function(res, renovacion){
				req.query.contador = req.query.contador + 1
				if(req.query.contador ==  listaContratos.length){
					enviarResponse(res, [req.query.contador]);
				}
			})						
		}
	})
}
exports.fixVehiculos = function(req, res, funcionName){
	var query="Select idVehiculo, placa from Vehiculo";
	ejecutarQUERY_MYSQL(query, [], res, funcionName, function(res, results){
		for(var i=0; i<results.length; i++){
			var vehiculo = results[i]
			var queryUpdate = "Update Vehiculo set placa = ? where idVehiculo = ?"
			var id = vehiculo.idVehiculo
			var placa = vehiculo.placa
			placa =  placa.replace("-","")
			placa = placa.replace(" ","")
			placa = placa.trim()
			var params = [placa, id]
			ejecutarQUERY_MYSQL(queryUpdate, params, res, funcionName, "false")
		}		
	})
}
exports.insertCatsAContratos = function(req, res, funcionName){
	req.query.counter=0
	req.query.contratoList = []
	req.query.soloPlacas = []
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:","});
	var archivo = req.query.archivo
	if(archivo==null || archivo==''){
		archivo = "cats_contratos.csv"
	}
	var ruta_archivo = "./www/files/"+archivo
	csvConverter.fromFile(ruta_archivo,function(err,results){
		for(var z=0; z<results.length; z++){
			var found=false
			var placa = results[z].regist
			placa =  placa.replace("-","")
			placa = placa.replace(" ","")
			placa = placa.trim()
			
			var soloPlacas = req.query.soloPlacas;
			for(var a=0; a<soloPlacas.length; a++){
				if(soloPlacas[a]==placa){
					found=true;
					break;
				}
			}
			if(!found){
				req.query.soloPlacas.push(placa)
			}
		}
		// obtiene todos los vehiculos:
		var placasVehiculos = JSON.stringify(req.query.soloPlacas)
		placasVehiculos = placasVehiculos.replace("[","")
		placasVehiculos = placasVehiculos.replace("]","")
		var regex = new RegExp("\"", "g");
        placasVehiculos = placasVehiculos.replace(regex, "'");
		
		var queryGetVehiculos = "Select v.idVehiculo, v.placa, ucv.prima, ucv.montoPoliza, v.nroSerieMotor, v.marca, v.modelo, v.anno, (Select cg.idConcesionarioVtasCorp from ConstantesGenerales cg) as idConcesionario, ucv.idClaseVehiculo from Vehiculo v inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo "+
		"where v.placa in ("+placasVehiculos+")";
		
		ejecutarQUERY_MYSQL(queryGetVehiculos, [], res, "getvehiculos", function(res, vehiculosList){
			console.log("vehiculos cargados ..")
			for(var i=0; i<results.length; i++){
				var found = false
				var placa = results[i].regist
				placa =  placa.replace("-","")
				placa = placa.replace(" ","")
				placa = placa.trim()
				
				var vehiculos = []
				// busca la placa:
				for(var t=0; t<vehiculosList.length; t++){
					if(vehiculosList[t].placa == placa){
						vehiculos.push(vehiculosList[t])						
					}
				}
				if(vehiculos.length>0){
					for(var y=0; y<req.query.contratoList.length; y++){
						if(req.query.contratoList[y].nroContrato==results[i].ncontrato){
							found=true;						
							req.query.contratoList[y].subList.push({
								nroContrato:results[i].ncontrato,
								nroOrden:req.query.contratoList[y].subList.length+1,
								cat:results[i].ncat,
								placa:placa,
								valorCuota:results[i].cuotamensual,
								vehiculos:vehiculos,
								idConcesionario:vehiculos[0].idConcesionario
							})
							req.query.contratoList[y].valorCuotaTotal = req.query.contratoList[y].valorCuotaTotal + results[i].cuotamensual
							break;
						}
					}
					if(!found){	
						req.query.contratoList.push({
							nroContrato:results[i].ncontrato,
							subList:[{
								nroContrato:results[i].ncontrato,
								nroOrden:1,
								cat:results[i].ncat,
								placa:placa,
								valorCuota:results[i].cuotamensual,
								vehiculos:vehiculos,
								idConcesionario:vehiculos[0].idConcesionario
							}],
							valorCuotaTotal:results[i].cuotamensual
						})
					}					
				}else{					
					console.log("vehiculo no existe : "+placa)
					var queryInsertPlacaNoExiste = "Insert into Vehiculo_noexiste(nroContratoAntiguo, nroCertificado, placa) values (?,?,?)"
					var paramsValues = [results[i].ncontrato, results[i].ncat, placa]
					ejecutarQUERY_MYSQL(queryInsertPlacaNoExiste, paramsValues, res, "VehiculoNoExiste", "false")
				}				
				
			}
			// DESPUES de haber agrupado los cats por cada contrato los inserta:
			var contratos = req.query.contratoList
			for(var i=0; i<contratos.length; i++){
				
				var ncontrato = contratos[i].nroContrato+''
				var valorCuotaTotal = contratos[i].valorCuotaTotal
				
				var queryUpdateRenovacion = "Update Contrato_Renovacion set totalCuota = ? where idContrato = (Select c.idContrato from Contrato c where c.nroContratoAntiguo = ?)";
				var params = [valorCuotaTotal, ncontrato]
				ejecutarQUERY_MYSQL(queryUpdateRenovacion, params, res, "actualizaCuotaTotal", "false")
				
				var subList = contratos[i].subList
				for(var y=0; y<subList.length; y++){	
						var vehiculos = subList[y].vehiculos
						var contrato_certificado = subList[y]
							
						// inserta
						var ncontrato = contrato_certificado.nroContrato+''
						var nroOrden = contrato_certificado.nroOrden
						var nroCertificado = contrato_certificado.cat
						var idVehiculo = vehiculos[0].idVehiculo
						var prima = vehiculos[0].prima
						var precio = vehiculos[0].montoPoliza
						var valorCuota = contrato_certificado.valorCuota
						var estadoVehiculo = 'O'
						var queryInsert = "Insert into Contrato_Certificados (idContrato, nroOrden, nroCertificado, idVehiculo, prima, precio, valorCuota, nroCuota, estadoVehiculo) values ((Select c.idContrato from Contrato c where c.nroContratoAntiguo = ?), ?, ?, ?, ? ,?, ?, (Select cc.nroCuota from Contrato_Renovacion cc where cc.idContrato in (Select c.idContrato from Contrato c where c.nroContratoAntiguo = ?)), ?)"
								
						var params = [ncontrato, nroOrden, nroCertificado, idVehiculo, prima, precio, valorCuota, ncontrato, estadoVehiculo]
						console.log("insertando certificado en contrato : "+ncontrato)
								
						ejecutarQUERY_MYSQL(queryInsert, params, res, "insertando cats", function(res, results){
							console.log("certificado insertado")
						})
						recomponerCertificadoMovimientos(contrato_certificado, res, "recomponerCertificadoMovimientos")
				}
			}
			
		})
	})
}
function recomponerCertificadoMovimientos (contrato_certificado, res, funcionName){
	// registra la guia de distribucion y sus detalles
	var queryInsertGuiaCabecera = "Insert into Guia_movimiento_cabecera(tipoOperacion, fechaOperacion, idUsuario, idUsuarioResp, idConcesionario, ultActualizaFecha, nroGuiaManual) values ('DIST', now(), ?, ?, ?, now(), ?)"
	var idUsuario = "138"
	var idUsuarioResp = "183"
	var idConcesionario = contrato_certificado.idConcesionario
	var nroGuiaManual = 'COMPOSICION'
	
	var params = [idUsuario, idUsuarioResp, idConcesionario, nroGuiaManual]
	
	ejecutarQUERY_MYSQL(queryInsertGuiaCabecera, params, res, "queryInsertGuiaCabecera", function(res, results){
		var idGuia = results.insertId
		contrato_certificado.idGuia = idGuia
		
		// Inserta detalles de la guia:
		var queryInsertDetalles = "Insert into Guia_movimiento_detalle (idGuia_movimiento_cabecera, idArticulo, unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion, ultActualizaFecha) values (?, '1', 'UNID', '1', ?, ?, 'COMPOSICION', now())"
		var paramsDetalle = [idGuia, contrato_certificado.cat, contrato_certificado.cat]
		
		ejecutarQUERY_MYSQL(queryInsertDetalles, paramsDetalle, res, "queryInsertDetalles", "false")
		
		// registra la liquidacion:
		var queryInsertLiquidacion = "Insert into Liquidacion_ventas_cabecera (nroLiquidacion, fechaLiquidacion, idConcesionario, idUsuarioResp, idUsuario, ultActualizaFecha) values (?, now(),?,?,?,now())"
		
		var idUsuario = "138"
		var idUsuarioResp = "183"
		var nroLiquidacion = "77777"
		
		var params = [nroLiquidacion, contrato_certificado.idConcesionario, idUsuarioResp, idUsuario]
		
		ejecutarQUERY_MYSQL(queryInsertLiquidacion, params, res, "queryInsertLiquidacion", function(res, resultados){
			var idLiquidacion =  resultados.insertId
			
			// registra detalles de la liquidacion:
			var queryInsertDetalleLiq = "Insert into Liquidacion_ventas_detalle (idLiquidacion_ventas_cabecera, nroCertificado, claseVehiculo, precio, comision, ultActualizaFecha) values (?,?,?,?,?,now())"
			
			var nroCertificado = contrato_certificado.cat
			var claseVehiculo = contrato_certificado.vehiculos[0].idClaseVehiculo
			var precio = contrato_certificado.vehiculos[0].montoPoliza
			var comision = '0'
			
			var params = [idLiquidacion, nroCertificado, claseVehiculo, precio, comision]
			ejecutarQUERY_MYSQL(queryInsertDetalleLiq, params, res, "queryInsertDetalleLiq", "false")
			
			// inserta el movimiento_certificado:
			var queryInsertarMov = "Insert into Certificado_movimiento (nroCertificado, idArticulo, tipOperacion, idUbicacion, idUsuarioResp, idGuia, fechaOperacion, fechaSalida, idGuiaSalida, estado, ultActualizaFecha) values (?,?,?,?,?,?,now(),now(),?,?,now())"
			
			var idArticulo = '1'
			var tipOperacion = 'E'
			var idUbicacion = contrato_certificado.idConcesionario
			var idUsuarioResp = "183"
			var idGuia = contrato_certificado.idGuia
			var idGuiaSalida = idLiquidacion
			var estado = 'V' // vendido
			
			var parametrosMov = [nroCertificado, idArticulo, tipOperacion, idUbicacion, idUsuarioResp, idGuia, idGuiaSalida, estado]
			
			ejecutarQUERY_MYSQL(queryInsertarMov, parametrosMov, res, "queryInsertarMov", "false")
			
			// verifica si no existe el registro del cat:
			var queryExisteCertificado = "Select nroCertificado from Certificado where nroCertificado = ? ";
			var parameters = [nroCertificado]
			
			ejecutarQUERY_MYSQL(queryExisteCertificado, parameters, res, funcionName, function(res, results){
				if(results.length==0){					
					var nroCertificado = contrato_certificado.cat
					console.log("El certificado : "+nroCertificado+" no existe!!")
					var idArticulo = '1' // CATS
					var estadoRegistroCAT = '9'
					var idConcesionario = contrato_certificado.idConcesionario
					var registroEstado = '0'
					
					// Inserta Certificado y movimientos
					var queryInsertaCertificado = "Insert into Certificado(nroCertificado, idArticulo, estadoRegistroCAT, idConcesionario, registroEstado, ultActualizaFecha) values (?,?,?,?,?, now())"			
					var parametros = [nroCertificado, idArticulo, estadoRegistroCAT, idConcesionario, registroEstado]
					
					ejecutarQUERY_MYSQL(queryInsertaCertificado, parametros, res, "queryInsertaCertificado", "false")
					
					var ncontrato = contrato_certificado.nroContrato+''
					
					var queryGetContrato = "Select c.idEmpresaTransp, emp.idPersona, date_format(c.fechaVigenciaContr, '%d/%m/%Y') as fechaVigenciaContr, date_format(c.fechaInicioCuota, '%d/%m/%Y') as fechaVigenciaCert, c.nCuotas from Contrato c inner join EmpresaTransp emp on c.idEmpresaTransp = emp.idEmpresaTransp where c.nroContratoAntiguo = ?"
					
					var params = [ncontrato]
					
					ejecutarQUERY_MYSQL(queryGetContrato, params, res, "queryGetContrato", function(res, results){
						if(results.length>0){
							contrato_certificado.nCuotas = results[0].nCuotas
							contrato_certificado.fechaVigenciaContr = results[0].fechaVigenciaContr
							contrato_certificado.fechaVigenciaCert = results[0].fechaVigenciaCert
							contrato_certificado.fechaRenovacion = dateTimeFormat(contrato_certificado.fechaVigenciaCert)
							
							var idPersonaEmpr = results[0].idPersona
							var objeto = {idPersonaEmpresa:idPersonaEmpr}
							registrarAsociado(res, "registrarAsociado", objeto, function(personaAsociado){
																

								var nroCAT = contrato_certificado.cat
								
								console_log("Registrando CAT => "+nroCAT)
								
								var idAsociado = personaAsociado.idAsociado
								var placa = contrato_certificado.vehiculos[0].placa
								var marca = contrato_certificado.vehiculos[0].marca
								var modelo = contrato_certificado.vehiculos[0].modelo
								var annoFabricacion = contrato_certificado.vehiculos[0].anno
								var nMotorserie = contrato_certificado.vehiculos[0].nroSerieMotor
								var monto = contrato_certificado.vehiculos[0].montoPoliza/contrato_certificado.nCuotas 
								var prima = contrato_certificado.vehiculos[0].prima/contrato_certificado.nCuotas 
								var aporte = monto - prima
								var idConcesionario = contrato_certificado.idConcesionario
								var idVehiculo = contrato_certificado.vehiculos[0].idVehiculo
								var conDeuda = "N"
								
								// ** obtiene la fecha de Fin de la vigencia del certificado **
								var mdatec = contrato_certificado.fechaRenovacion.split("-");
								var dc = new Date(mdatec[0], parseInt(mdatec[1])-1, mdatec[2]);
								dc.setMonth(dc.getMonth() + 12/parseInt(contrato_certificado.nCuotas));
								contrato_certificado.fechaVigenciaCertFin = convertirAfechaString(dc, false, false)

								var fechaVigenciaCert = contrato_certificado.fechaRenovacion
								var fechaVigenciaCertFin = dateTimeFormat(contrato_certificado.fechaVigenciaCertFin)

								// ** obtiene la fecha de Fin de la vigencia del contrato (Resta un año) **
								var mdateCont = contrato_certificado.fechaVigenciaContr.split("/");
								var dCont = new Date(mdateCont[2], parseInt(mdateCont[1])-1, mdateCont[0], 0, 0,0,0);
								dCont.setYear(dCont.getFullYear()+1);
								contrato_certificado.fechaVigenciaContrFin = convertirAfechaString(dCont, false, false);

								var fechaVigenciaContr = dateTimeFormat(contrato_certificado.fechaVigenciaContr)
								var fechaVigenciaContrFin = dateTimeFormat(contrato_certificado.fechaVigenciaContrFin)
								
								var queryInsertCAT="Insert into Cat (nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, monto, prima, aporte, idConcesionario," +
                " fechaEmision, idVehiculo, conDeuda, fechaLiquidacion, ultActualizaFecha, fechaInicio, fechaCaducidad, fechaControlInicio, fechaControlFin)" +
                " values (?,?,?,?,?,?,?,?,?,?,?,now(),?,?, now(), now(),?,?,?,?)"
				
            var parametros = [nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, monto, prima, aporte, idConcesionario, idVehiculo, conDeuda, fechaVigenciaContr, fechaVigenciaContrFin, fechaVigenciaCert, fechaVigenciaCertFin]
			
								ejecutarQUERY_MYSQL(queryInsertCAT, parametros, res, "queryInsertCAT", function(res, results){
									
									
								})
								
							})
						}else{
							console.log("No existe contrato")
						}
						
					})
				}else{
					var nroCertificado = contrato_certificado.cat
					console.log("El certificado : "+nroCertificado+" ya existe!!")
				}
			})
			
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
function getVehiculoContrato(contrato, res, funcionName, callback){
	var placa = contrato.placa.toString().trim()
	placa = placa.replace("-","")
	placa = placa.replace(" ","")
	var query = "Select v.idVehiculo, ucv.prima, ucv.montoPoliza from Vehiculo v inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo "+
		"where v.placa = ?";
	var params = [placa]
	console.log("buscando vehiculo con placa : "+ placa)
	ejecutarQUERY_MYSQL(query, params, res, funcionName, function(res, results){
		if(results.length>0){
			console.log("vehiculo encontrado : "+results[0].idVehiculo)
		}
		callback(results, contrato)
	})
}
exports.generarContratos = function(req, res, funcionName){
	req.query.counter=0
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:","});
	var archivo = req.query.archivo
	if(archivo==null || archivo==''){
		archivo = "contratos.csv"
	}
	var ruta_archivo = "./www/files/"+archivo
	csvConverter.fromFile(ruta_archivo,function(err,results){
		for(var i=0; i<results.length; i++){
			getEmpresaTransporte(results[i], res, funcionName, function(idEmpresa, contratoRegistro){
				var nroContrato = contratoRegistro.ncontrato		
				var fechaEmision = dateTimeFormat(contratoRegistro.fechaemision)
				var fechaInicioContrato = dateTimeFormat(contratoRegistro.fechavigenciacontdesde)
				var fechaFinContrato = dateTimeFormat(contratoRegistro.fechavigenciaconthasta)
				var fechaInicioCertif = dateTimeFormat(contratoRegistro.fechavigenciacertdesde)
				var fechaFinCertif = dateTimeFormat(contratoRegistro.fechavigenciacerthasta)
				var cuotas = contratoRegistro.cuotas
				var flota = contratoRegistro.flotas
				
				var queryInsertContrato = "Insert into Contrato(fechaEmision, fechaVigenciaContr, fechaVigenciaCert, nCuotas, flota, idEmpresaTransp, estado, nroContratoAntiguo, fechaInicioCuota) values (?,?,?,?,?,?,'I',?,?)"
				var params = [fechaEmision, fechaInicioContrato, fechaInicioContrato, cuotas, flota, idEmpresa, nroContrato, fechaInicioCertif]
				
				ejecutarQUERY_MYSQL(queryInsertContrato, params, res, funcionName, "false")
				
				console.log("counter : "+req.query.counter+" + 1");
				req.query.counter = req.query.counter+1;
				
				if(req.query.counter == results.length){
					enviarResponse(res, [req.query.counter]);
				}
				
			})
		}			
	})
}
function getEmpresaTransporte(registro, res, funcionName, callback){
	var query = "Select e.idEmpresaTransp from EmpresaTransp e inner join Persona p on e.idPersona = p.idPersona where "+
		"p.nroDocumento = ?";
	var ruc = registro.num_doc
	var params = [ruc]
	ejecutarQUERY_MYSQL(query, params, res, funcionName, function(res, results){
		if(results.length>0){
			console.log("empresa de transporte encontrada : "+results[0].idEmpresaTransp)
			callback(results[0].idEmpresaTransp, registro)
		}else{
			var personaEmpresa = {
				razonSocial: registro.cliename,
				nroDocumento: registro.num_doc,
				calle:''
			}
			console.log("se registrara la empresa de transporte : "+registro.cliename)
			registrarPersonaEmpresa(0, personaEmpresa, res, funcionName, function(idPersonaRepresentante, idPersonaEmpresa){
				// inserta la empresa
				var queryInsertEmpresa = "Insert into EmpresaTransp(idPersona, idRepLegal, fechaRegistro, registroEstado) values (?,?,now(), '0') "
				var params = [idPersonaEmpresa, idPersonaRepresentante]
				ejecutarQUERY_MYSQL(queryInsertEmpresa, params, res, funcionName, function(res, resultsEmpresas){
					var idEmpresa = resultsEmpresas.insertId;
					console.log("empresa de transporte registrada : "+idEmpresa)
					callback(idEmpresa, registro)
				})
			})
		}
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