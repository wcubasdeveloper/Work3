
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
		var query = "select * from (select c.idConcesionario, if(c.tipoPersona='J', c.razonSocial, concat(c.nombres,' ',c.apellidos)) as nombre, s.idSede from Concesionario c inner join Sede s on c.idSede = s.idSede where c.estado='1' and s.estado='1') as v where v.nombre like '%"+nombre+"%' order by v.nombre";
	}else{
		var query = "select * from (select c.idConcesionario, if(c.tipoPersona='J', concat(c.razonSocial,'/',s.nombreSede), concat(concat(c.nombres,' ',c.apellidos),'/',s.nombreSede)) as nombre, s.idSede from Concesionario c inner join Sede s on c.idSede = s.idSede where c.estado='1' and s.estado='1') as v where v.nombre like '%"+nombre+"%' order by v.nombre";
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
		"se.nombreSede, "+
		"if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidos)) as nombreConcesionario, "+
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
		"inner join Sede se on co.idSede = se.idSede "+
		"inner join Vehiculo v on c.idVehiculo = v.idVehiculo "+
		"inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo "+
		"inner join Uso_Vehiculo u on ucv.idUso = u.idUso "+
		"inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase "+queryWhere.getQueryWhere()+" limit 950";
	
		ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.buscarCertificado = function(req, res, funcionName){ // realiza la busqueda de un certificado
	var nroCertificado = req.query.nroCertificado;
	var arrayParametros = [nroCertificado];
	// primero realiza la busqueda en la tabla CAT:
	var queryBusquedaCAT = "Select c.nroCAT as nroCertificado, 'CAT' as estado, c.placa, date_format(c.fechaEmision, '%d/%m/%Y %H:%i') as fechaEmision, date_format(c.fechaInicio, '%d/%m/%Y') as fechaInicio, date_format(c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, date_format(c.fechaControlInicio, '%d/%m/%Y') as fechaControlInicio, date_format(c.fechaControlFin, '%d/%m/%Y') as fechaControlFin, c.conDeuda, date_format(c.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, c.idConcesionario, c.prima, c.aporte, c.comision, a.idAsociado, p.tipoPersona, p.nroDocumento from Cat c inner join Asociado a on c.idAsociado = a.idAsociado inner join Persona p on a.idPersona = p.idPersona where c.nroCAT = ?";
	ejecutarQUERY_MYSQL(queryBusquedaCAT, arrayParametros, res, funcionName, function(res, resultados){
		if(resultados.length==0){
			var nroCertificado = req.query.nroCertificado;
			var query = "Select nroCertificado, estado from Certificado where nroCertificado = ?";
			var arrayParametros = [nroCertificado];
			ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
		}else{
			enviarResponse(res, resultados); // envia los resultados del CAT encontrado
		}
	});
}
exports.getPersonaByNroDoc = function(req, res, funcionName){
    var nroDoc = req.query.nroDoc;
    var query="call sp_getPersonaByNroDoc(?)";
    var arrayParametros = [nroDoc];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getConos = function(req, res, funcionName){
	var query = "Select idSede, nombreSede from Sede where estado='1' order by nombreSede";
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
				// guarda el cat
				var queryInsertCat = "Update Cat set placa=?, marca=?, modelo=?, annoFabricacion=?, nMotorserie=?, fechaInicio=?, fechaCaducidad=?, idConcesionario=?, fechaEmision=?, fechaControlInicio=?, fechaControlFin=?, idVehiculo=?, conDeuda=?, fechaLiquidacion=?, prima=?, comision=?, aporte=? where nroCAT=?";
				
				var parametros = [req.query.placa, req.query.marca, req.query.modelo, req.query.anno, req.query.serieMotor, req.query.fechaV_inicio, req.query.fechaV_fin, req.query.idConcesionario, req.query.fechaEmision, req.query.fechaCP_inicio, req.query.fechaCP_fin, idVehiculo_CAT, req.query.conDeuda, req.query.fechaLiquidacion, req.query.prima, req.query.comision, req.query.aporte, req.query.nroCertificado];
				
				ejecutarQUERY_MYSQL(queryInsertCat, parametros, res, funcionName, "affectedRows");
			});
		});
	});
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
					var nroCertificado = req.query.nroCertificado;
					var updateCertificado = "Update Certificado set estado = '9' where nroCertificado=?"; // cambia el estado del certificado a vendido
					var params = [nroCertificado];
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
exports.getListaGuias = function(req, res, funcionName){ // NOTA: Esta funcion es usada tambien en el CUS 05 para obtener la lista de Guias de Salida
	// Parametros GET:
	var tipo = req.query.tipo; // Tipo de Guia: I=Ingreso; S=Salida	
	var queryWhere = new QueryWhere(" where g.tipoOperacion='"+tipo+"'"); // agrega el filtro de tipo de Guia
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
	var query = "select LPAD(g.idGuia_movimiento_cabecera, 4, '0') as idGuia, if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno))  as nombreProveedor, g.nroGuiaManual as nroGuia, "+
		"date_format(g.fechaOperacion, '%d/%m/%Y') as fechaRegistro, a.nombreBreve as nombreAlmacen, concat(u.Nombres,' ',u.Apellidos) as usuarioResponsable from Guia_movimiento_cabecera g "+
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
					"inner join Proveedor p on g.idProveedor = p.idProveedor "+
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
				
					var queryInsertCATS = "Insert into Certificado(nroCertificado, idArticulo, tipOperacion, idUbicacion, idUsuarioResp, idGuia)";
					
					var values = " values ";
					
					for(var z=parseInt(listaCATS[y].nroInicio); z<=parseInt(listaCATS[y].nroFinal); z++){
						if(z>parseInt(listaCATS[y].nroInicio)){
							values = values+", ";
						}
						values = values+" ('"+z+"', '"+listaCATS[y].codArticulo+"', 'E', '"+req.body.concesionario+"', '"+req.body.idUsuario+"', '"+idGuia+"')";
					}
					queryInsertCATS = queryInsertCATS+values;
					console.log("Insertando certificados");
					ejecutarQUERY_MYSQL(queryInsertCATS, [], res, funcionName, "false");
				}
			}else{ // DEV = Devolucion
				// Ingresa la fecha de salida de los CATS:
				var updateFechaSalidaCAT = "Update Certificado set fechaSalida=now(), idGuiaSalida='"+idGuia+"' where nroCertificado in ";
				
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
			// Registra los CATS:
			for(var y=0; y<listaCATS.length; y++){
				
				var queryInsertCATS = "Insert into Certificado(nroCertificado, idArticulo, tipOperacion, estado, idUbicacion, idUsuarioResp, idGuia)";
				
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
				console.log("Insertando certificados");
				ejecutarQUERY_MYSQL(queryInsertCATS, [], res, funcionName, "false");
				
				/*var idGuiaOrigen = req.body.idGuiaOrigen;
				if(idGuiaOrigen!=""){
					var queryUpdateFecha = "Update Certificado set fechaDestino=now() where idGuiaSalida=? and nroCertificado between ? and ? ";
					ejecutarQUERY_MYSQL(queryUpdateFecha, [idGuiaOrigen, listaCATS[y].nroInicio, listaCATS[y].nroFinal], res, funcionName, "false");
				}*/
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

			}
			// Ingresa la fecha de salida de los CATS:
			var updateFechaSalidaCAT = "Update Certificado set fechaSalida=now(), idGuiaSalida='"+idGuia+"' where nroCertificado in "
			var listaCertificados = [];
			for(var y=0; y<listaCATS.length; y++){
				
				/*var queryInsertCATS = "Insert into Certificado(nroCertificado, idArticulo, estado, idUbicacion, idUsuarioResp, idGuia)";
				
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
}
/** fin de CUS04 **/
// CUS 05
exports.getUsuarios = function(req, res, funcionName){
	var idUsuarioActual = req.query.idUsuario;
	var query = "Select u.idUsuario, concat(u.Nombres,' ',u.Apellidos) as nombreUsuario, p.idPromotor from UsuarioIntranet u left join Promotor p on u.idUsuario = p.idUsuario where u.idUsuario!=? order by concat(u.Nombres,' ',u.Apellidos)";
	var idLocal = parseInt(req.query.idLocal);
	if(idLocal>0){
		query = query+" and idLocal = '"+idLocal+"'";
	}
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
		var queryExistencia = "SELECT nroCertificado FROM Certificado where nroCertificado between ? and ? group by nroCertificado order by nroCertificado";
		var params = [nroInicio, nroFinal];
		ejecutarQUERY_MYSQL(queryExistencia, params, res, funcionName, function(res, resultados){
			var cantidadTotal = parseInt(req.query.nroFinal)-parseInt(req.query.nroInicio)+1;
			if(cantidadTotal == resultados.length){
				
				var arrayParametros;
				
				subQuery = " and ( estado in ('A', 'V', 'R') or fechaSalida is null)";
				
				query = "select nroCertificado, idUbicacion, estado, fechaSalida from Certificado where (nroCertificado between ? and ? ) "+	subQuery+" and idArticulo=? order by nroCertificado";
				
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
		})
		
		
	}else{ // Ceritificados que ingresaron en un almacen y se van a retirar de el mismo
		var arrayParametros;
		subQuery = " and (fechaSalida is null or fechaSalida='0000-00-00 00:00:00') ";
		
		query = "Select nroCertificado from Certificado where (nroCertificado between ? and ? ) and idUbicacion=? "+subQuery+" and idArticulo=? and estado='D' order by nroCertificado";
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
	
	var query = "select * from (Select c.idConcesionario, concat(if(c.tipoPersona='J', c.razonSocial, concat(c.nombres,' ',c.apellidos)),' / ',l.Nombre) as nombreCompuesto from Concesionario c inner join Local l on c.idSede = l.idLocal where l.estado='1' and c.estado='1' "+queryWhere+") as v order by v.nombreCompuesto asc";
	ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getListaGuiasConcesionarios = function(req, res, funcionName){ // NOTA: Esta funcion es usada tambien en el CUS 05 para obtener la lista de Guias de Salida
	// Parametros GET:
	var queryWhere = new QueryWhere(" where g.tipoOperacion in ('DIST', 'DEV') "); // agrega el filtro de tipo de Guia
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
	
	var query = "select LPAD(g.idGuia_movimiento_cabecera, 4, '0') as idGuia, g.nroGuiaManual, if(c.tipoPersona='J', c.razonSocial, concat(c.nombres,' ',c.apellidos)) as nombreConcesionario, l.Nombre as sede, g.nroGuiaManual as nroGuia, "+
		"date_format(g.fechaOperacion, '%d/%m/%Y') as fechaRegistro, if(g.tipoOperacion='DIST', 'Distribucion', 'Devolucion') as tipoOperacion from Guia_movimiento_cabecera g "+
		"left join Concesionario c on g.idConcesionario = c.idConcesionario "+
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
	
	var query = "select LPAD(li.idLiquidacion_ventas_cabecera, 4, '0') as idLiquidacion, li.nroLiquidacion, "+
		"if(c.tipoPersona='J', c.razonSocial, concat(c.nombres,' ',c.apellidos)) as nombreConcesionario,"+
		"date_format(li.fechaLiquidacion, '%d/%m/%Y') as fechaRegistro, "+
		"(select sum(d.precio) from Liquidacion_ventas_detalle d where d.idLiquidacion_ventas_cabecera = li.idLiquidacion_ventas_cabecera) "+
		"as totalVenta, (select sum(d2.comision) from Liquidacion_ventas_detalle d2 where d2.idLiquidacion_ventas_cabecera = li.idLiquidacion_ventas_cabecera) "+
		"as totalComision, (Select GROUP_CONCAT(d3.nroCertificado SEPARATOR ', ') FROM Liquidacion_ventas_detalle d3 "+
		"where d3.idLiquidacion_ventas_cabecera = li.idLiquidacion_ventas_cabecera) as nroCertificados "+
		"from Liquidacion_ventas_cabecera li "+
		"left join Concesionario c on li.idConcesionario = c.idConcesionario "+
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
exports.verificarDiponibilidadVentaCAT = function (req, res, funcionName){
	var nroCertificado = req.query.nroCertificado;
	var query = "Select nroCertificado, tipOperacion, idUbicacion, estado, fechaSalida from Certificado where nroCertificado=?"
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
			// actualiza la fecha de Salida en los certificados y cambia su estado a Vendido
			var listaDetalles = req.body.detalles;
			for(var i=0; i<listaDetalles.length; i++){
				
				var queryUpdate = "Update Certificado set fechaSalida=now(), estado='V', idGuiaSalida='"+idLiquidacion+"' where idUbicacion='"+concesionario+"' and tipOperacion='E' and fechaSalida is null and nroCertificado='"+listaDetalles[i].nroCertificado+"'"; 
				
				ejecutarQUERY_MYSQL(queryUpdate, [], res, funcionName, "false");				
				
				// Inserta los detalles de liquidacion:
				var queryInsertDetalle = "Insert into Liquidacion_ventas_detalle(idLiquidacion_ventas_cabecera, nroCertificado,	claseVehiculo, precio, comision) values (?,?,?,?,?)";
				
				var parametrosDetalle = [idLiquidacion, listaDetalles[i].nroCertificado, listaDetalles[i].idClaseVehiculo, listaDetalles[i].precio, listaDetalles[i].comision];
				
				console_log("Insertando detalles");
				
				// Actualiza stock global:
				var queryUpdateStockGlobal = "Update Articulo a set a.stock=stock-1 where a.idArticulo = (select c.idArticulo from Certificado c where c.nroCertificado = "+listaDetalles[i].nroCertificado+" and c.idArticulo>0 limit 1)"
				ejecutarQUERY_MYSQL(queryUpdateStockGlobal, [], res, funcionName, "false");
				ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");				
			}			
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
		case 'CER': // devuelve el registro de SALIDA / DEV / LIQ dentro de una cadena concatenada
			/*var query = "select c.nroCertificado, date_format(c.fechaOperacion, '%d/%m/%Y') as fechaOperacion , g.tipoOperacion, c.estado, c.idUbicacion, if(c.tipOperacion='I', a.nombre, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno))) as nombreUbicacion, LPAD(c.idGuia, 4, '0') as idGuia,"+
			"concat(u.Nombres,' ', u.Apellidos) as nombreUsuario, if(c.estado='V', concat(concat('LIQ - ',LPAD(gl.idLiquidacion_ventas_cabecera, 4, '0')),'||',date_format(gl.fechaLiquidacion, '%d/%m/%Y'),'||VEND||',concat(ul.Nombres,' ', ul.Apellidos)), concat(LPAD(gs.idGuia_movimiento_cabecera , 4, '0'),'||',date_format(gs.fechaOperacion, '%d/%m/%Y'),'||',gs.tipoOperacion,'||',concat(us.Nombres,' ', us.Apellidos))) as recordSalida "+
			"from Certificado c "+
			"left join Almacen a on c.tipOperacion = 'I' and c.idUbicacion = a.idAlmacen "+
			"left join Concesionario con on c.tipOperacion = 'E' and c.idUbicacion = con.idConcesionario "+
            "left join Persona co on con.idPersona = co.idPersona "+
			"left join Guia_movimiento_cabecera g on idGuia = g.idGuia_movimiento_cabecera "+
			"left join Guia_movimiento_cabecera gs on c.idGuiaSalida = gs.idGuia_movimiento_cabecera and c.estado !='V'"+
			"left join Liquidacion_ventas_cabecera gl on c.idGuiaSalida = gl.idLiquidacion_ventas_cabecera and c.estado ='V'"+
			"left join UsuarioIntranet u on g.idUsuario = u.idUsuario "+
			"left join UsuarioIntranet us on gs.idUsuario = us.idUsuario "+
			"left join UsuarioIntranet ul on gl.idUsuario = ul.idUsuario "+
			"where c.nroCertificado between ? and ? and c.idUbicacion>0 order by c.nroCertificado, g.fechaOperacion, g.idGuia_movimiento_cabecera";*/
			
			var query = "Select * from ((select c.nroCertificado, date_format(c.fechaOperacion, '%d/%m/%Y') as fechaOperacion , g.tipoOperacion, c.estado, c.idUbicacion, if(c.tipOperacion='I', a.nombre, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno))) as nombreUbicacion, LPAD(c.idGuia, 4, '0') as idGuia,"+
			"concat(u.Nombres,' ', u.Apellidos) as nombreUsuario "+
			"from Certificado c "+
			"left join Almacen a on c.tipOperacion = 'I' and c.idUbicacion = a.idAlmacen "+
			"left join Concesionario con on c.tipOperacion = 'E' and c.idUbicacion = con.idConcesionario "+
            "left join Persona co on con.idPersona = co.idPersona "+
			"left join Guia_movimiento_cabecera g on c.idGuia = g.idGuia_movimiento_cabecera "+
			"left join UsuarioIntranet u on g.idUsuario = u.idUsuario "+
			"where c.nroCertificado between ? and ? and c.idUbicacion>0 and c.idGuia>0 order by c.nroCertificado, g.fechaOperacion, g.idGuia_movimiento_cabecera) UNION "+ // Salidas
			
			"(select c.nroCertificado, if(c.estado='V', date_format(gl.fechaLiquidacion, '%d/%m/%Y'), date_format(g.fechaOperacion, '%d/%m/%Y')) as fechaOperacion , if(c.estado='V', 'VEND', g.tipoOperacion) as tipoOperacion, c.estado, c.idUbicacion, if(c.tipOperacion='I', a.nombre, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno))) as nombreUbicacion,  if(c.estado='V', concat('LIQ - ',LPAD(gl.idLiquidacion_ventas_cabecera, 4, '0')), LPAD(c.idGuiaSalida, 4, '0')) as idGuia, "+
			"if(c.estado='V', concat(ul.Nombres,' ', ul.Apellidos), concat(u.Nombres,' ', u.Apellidos)) as nombreUsuario "+
			"from Certificado c "+
			"left join Almacen a on c.tipOperacion = 'I' and c.idUbicacion = a.idAlmacen "+
			"left join Concesionario con on c.tipOperacion = 'E' and c.idUbicacion = con.idConcesionario "+
            "left join Persona co on con.idPersona = co.idPersona "+			
			"left join Guia_movimiento_cabecera g on c.idGuiaSalida = g.idGuia_movimiento_cabecera and c.estado !='V' "+
			"left join Liquidacion_ventas_cabecera gl on c.idGuiaSalida = gl.idLiquidacion_ventas_cabecera and c.estado ='V'"+
			"left join UsuarioIntranet u on g.idUsuario = u.idUsuario "+
			"left join UsuarioIntranet ul on gl.idUsuario = ul.idUsuario "+
			"where c.nroCertificado between ? and ? and c.idUbicacion>0  and c.idGuia>0 and c.idGuiaSalida>0  order by c.nroCertificado, g.fechaOperacion, g.idGuia_movimiento_cabecera)) as v order by v.nroCertificado, str_to_date(v.fechaOperacion, '%d/%m/%Y'), v.idGuia";
			
			var inicio = req.query.inicio;
			var fin = req.query.fin;
			if(fin==""){
				fin = inicio;
			}
			parametros = [inicio, fin, inicio, fin];			
			
			break;
		case 'CON':
			var query = "select c.nroCertificado, date_format(c.fechaOperacion, '%d/%m/%Y') as fechaOperacion , if(c.estado='V', 'VEND', g.tipoOperacion) as tipOperacion, c.estado, c.idUbicacion, LPAD(c.idGuia, 4, '0') as idGuia, "+
				" concat(u.Nombres,' ', u.Apellidos) as nombreUsuario, g.nroGuiaManual "+
				" from Certificado c "+
				" inner join Concesionario con on c.idUbicacion = con.idConcesionario "+
				" left join Persona co on con.idPersona = co.idPersona "+
				" inner join Guia_movimiento_cabecera g on c.idGuia = g.idGuia_movimiento_cabecera "+
				" inner join UsuarioIntranet u on g.idUsuario = u.idUsuario "+
				" where c.tipOperacion = 'E' and c.idUbicacion=? order by c.nroCertificado ";
				
			var idConcesionario = req.query.idConcesionario;
			parametros = [idConcesionario];
			
			break;
		case 'PRO':
			var dias = req.query.dias;
			var query = "select c.nroCertificado, date_format(c.fechaOperacion, '%d/%m/%Y') as fechaOperacion , if(c.estado='V', 'VEND', g.tipoOperacion) as tipOperacion, c.estado, c.idUbicacion, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno)) as nombreConcesionario, LPAD(c.idGuia, 4, '0') as idGuia, con.diaSemanaAtt, g.nroGuiaManual, "+
				" concat(u.Nombres,' ', u.Apellidos) as nombreUsuario, g.nroGuiaManual "+
				" from Certificado c "+			
				" inner join Concesionario con on c.idUbicacion = con.idConcesionario "+
				" left join Persona co on con.idPersona = co.idPersona "+
				" inner join Guia_movimiento_cabecera g on c.idGuia = g.idGuia_movimiento_cabecera "+
				" inner join UsuarioIntranet u on g.idUsuario = u.idUsuario "+
				" where c.tipOperacion = 'E' and con.idPromotor=? and con.diaSemanaAtt in ("+dias+") and c.idUbicacion>0 order by con.diaSemanaAtt, c.nroCertificado"; 
			
			var idPromotor = req.query.idPromotor;			
			parametros = [idPromotor];			
			
			break;
	}
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
// CUS 07: // Encuentra los Certificados disponibles para vender en el concesionario
exports.getCertificadosXconcesionarioId = function(req, res, funcionName){
	var idConcesionario = req.query.idConcesionario;
	var query = "Select nroCertificado from Certificado where tipOperacion='E' and idUbicacion = ? and ( idGuiaSalida = 0 or idGuiaSalida is null) order by nroCertificado ";
	
	var parametros = [idConcesionario];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}

// CUS 11: obtiene los certificados asignados a un promotor
exports.certificadosXpromotor = function(req, res, funcionName){
	var idPromotor = req.query.idPromotor;
	var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
	
	var queryWhere = new QueryWhere(" where g.idUsuarioResp = '"+idPromotor+"' ");
	
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
	var query = "select LPAD(g.idGuia_movimiento_cabecera, 4, '0') as idGuia, g.tipoOperacion, date_format(g.fechaOperacion, '%d/%m/%Y') as fechaOperacion, "+
		" a.nombre as almacen, if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as concesionario, "+
		" cer.nroCertificado "+
		" from Guia_movimiento_cabecera g "+
		" inner join Certificado cer on  cer.idGuiaSalida = g.idGuia_movimiento_cabecera and cer.estado!='V' "+
		" left join Almacen a on g.idAlmacen = a.idAlmacen "+
		" left join Concesionario co on g.idConcesionario = co.idConcesionario "+
		" left join Persona p on co.idPersona = p.idPersona "+
		queryWhere.getQueryWhere()+
		" and g.tipoOperacion in ('SAL', 'DEV') "+
		" and (select count(*) from Certificado cex where cex.nroCertificado = cer.nroCertificado and ( cex.idGuiaSalida>g.idGuia_movimiento_cabecera or cex.estado='V' ))=0 "+
		" order by cer.nroCertificado";
	ejecutarQUERY_MYSQL(query, [], res, funcionName)
}