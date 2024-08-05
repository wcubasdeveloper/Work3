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
exports.eliminacionGeneral=function(req, res, funcionName){
    eliminacionGeneral(req, res, funcionName); // elimina un registro de cualquier tabla, especifandole por parametros la tabla a eliminar y el campo por el cual se eliminara.
}
exports.getListaProcurador = function(req, res, funcionName){
    var query = "Select pr.idProcurador, concat(pe.Nombres,' ', pe.Apellidos) as nombreProcurador, pe.DNI, pe.email as correo, pe.UName as usuario from Procurador pr inner join UsuarioIntranet pe on pr.idUsuario = pe.idUsuario ";
    ejecutarQUERY_MYSQL(query,[],res, funcionName)
}
exports.getListaComisaria = function(req, res, funcionName){
	var query = "Select c.idComisaria, c.nombre, c.calle as direccion, d.nombre as nombreDistrito, p.nombreProvincia  from Comisaria c "+
		" inner join Distrito d on c.idDistrito = d.idDistrito "+
		" inner join Provincia p on d.idProvincia = p.idProvincia order by p.nombreProvincia, d.nombre ";
	ejecutarQUERY_MYSQL(query,[],res, funcionName)
}
exports.getListaNosocomio = function(req, res, funcionName){
	var query = "Select n.idNosocomio, n.nombre, n.calle as direccion, n.telefono, n.tipo, if(n.tipo='C','Clinica','Hospital') as tipoNosocomio, "+
		" d.nombre as nombreDistrito, p.nombreProvincia from Nosocomio n "+
		" left join Distrito d on n.idDistrito = d.idDistrito "+
		" left join Provincia p on d.idProvincia = p.idProvincia order by p.nombreProvincia, d.nombre ";
	ejecutarQUERY_MYSQL(query,[],res, funcionName)
}
exports.getListaMedico = function(req, res, funcionName){
	var query = "";
	ejecutarQUERY_MYSQL(query,[],res, funcionName)
}
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
exports.getListaLocal = function(req, res, funcionName){
	var query = "Select idLocal, Nombre, if(estado='1', 'Activo', 'Inactivo') as estado, RUC, direccion from  Local ";
	var params = [];
	ejecutarQUERY_MYSQL(query, params, res, funcionName);
}
/* @getAllAreas: Obtiene los registros de las áreas de la TABLA AREA
*/
exports.getAllAreas = function(req, res, funcionName){
	var query = "select idArea, Nombre, plantilla from Area";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
};
exports.consultarInfoProcurador = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select p.idProcurador, u.idUsuario, u.Nombres, u.Apellidos, u.UName, u.password, u.DNI, u.telefono, u.email, u.idPerfil1, u.idPerfil2, u.idPerfil3, u.idLocal, "+
		" u.idArea from Procurador p inner join UsuarioIntranet u on p.idUsuario = u.idUsuario where p.idProcurador = ? ";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getListaConcesionario = function(req, res, funcionName){
	//** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;	
	var query = "SELECT c.idConcesionario, if(p.tipoPersona='N', concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno), p.razonSocial) as nombreConcesionario, if(c.estado='1', 'Activo', 'Inactivo') as estado, l.Nombre as nombreSede, concat(u.nombres,' ',u.apellidos) as promotor, c.diaSemanaAtt as diaSemana FROM Concesionario c "+
	"left join Persona p on c.idPersona = p.idPersona "+
	"left join Persona r on c.idResponsable = r.idPersona "+
	"left join Local l on c.idSede = l.idLocal "+
	"left join Promotor pr on c.idPromotor = pr.idPromotor "+
	"left join UsuarioIntranet u on pr.idUsuario = u.idUsuario ";
	
	// parametros:
	var idLocal = req.query.idLocal;
	var responsable = req.query.responsable;
	var razonSocial = req.query.razonSocial;
	var fechaDesde = req.query.fechaInicio;
	var fechaHasta = req.query.fechaFin;
	
	var queryWhere = new QueryWhere("");
	if(idLocal!=""){
		queryWhere.validarWhere("c.idSede = '"+idLocal+"'");
	}
	if(razonSocial!=""){
		queryWhere.validarWhere(" (p.razonSocial like '%"+razonSocial+"%' or concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '%"+razonSocial+"%')");
	}
	if(responsable!=""){
		queryWhere.validarWhere(" (r.razonSocial like '%"+responsable+"%' or concat(r.nombres,' ',r.apellidoPaterno,' ',r.apellidoMaterno) like '%"+responsable+"%')");
	}
	if(fechaDesde!="" || fechaHasta!=""){
        //orderBy = "e.fechaAccidente";
        if(fechaDesde!="" && fechaHasta!=""){
            fechaHasta=fechaHasta+" 23:59:59";
            queryWhere.validarWhere("( c.fechaAfiliacion between '"+fechaDesde+"' and '"+fechaHasta+"' )");
        }else{
            if(fechaDesde!=""){
                queryWhere.validarWhere("c.fechaAfiliacion>='"+fechaDesde+"'");
            }
            if(fechaHasta!=""){
                fechaHasta=fechaHasta+" 23:59:59";
                queryWhere.validarWhere("c.fechaAfiliacion<='"+fechaHasta+"'");
            }
        }
    }
	query = query+queryWhere.getQueryWhere()+" order by if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) asc";
	
	query = agregarLimit(page, registrosxpagina, query);	
	ejecutarQUERY_MYSQL(query, [], res, funcionName, function(res, resultados){
		if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="Select count(*) as cantidad FROM Concesionario c "+
				"left join Persona p on c.idPersona = p.idPersona "+
				"left join Persona r on c.idResponsable = r.idPersona "+
				"left join Local l on c.idSede = l.idLocal "+
				"left join Promotor pr on c.idPromotor = pr.idPromotor "+
				"left join UsuarioIntranet u on pr.idUsuario = u.idUsuario "+queryWhere.getQueryWhere();				
				
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
	})
}
exports.guardarProcurador = function(req, res, funcionName){
	var idNombres = req.query.idNombres;
	var idApellidos = req.query.idApellidos;
	var idDNI = req.query.idDNI;
	var idUName = req.query.idUName;
	var idClave = req.query.idClave;
	var idPerfil1 = req.query.idPerfil1;
	var idPerfil2 = req.query.idPerfil2;
	var idPerfil3 = req.query.idPerfil3;
	var idTelefono = req.query.idTelefono;
	var idCorreo = req.query.idCorreo;
	var idArea = req.query.idArea;
	var idLocal = req.query.idLocal;
	var idUsuario = req.query.idUsuario;
	var arrayParametros = [idNombres, idApellidos, idDNI, idUName, idClave, idPerfil1, idPerfil2, idPerfil3, idTelefono, idCorreo, idArea, idLocal];
	var query = "";
	if(idUsuario=="0"){ // registra un usuario y luego el procurador
		query = "Insert into UsuarioIntranet (Nombres, Apellidos, DNI, UName, password, idPerfil1, idPerfil2, "+ 
			"idPerfil3, telefono, email, idArea, idLocal) values (?,?,?,?,?,?,?,?,?,?,?,?)";
	}else{ // actualiza el registro
		arrayParametros.push(idUsuario);
		query = "Update UsuarioIntranet set Nombres = ?, Apellidos=?, DNI=?, UName=?, password=?, "+
			" idPerfil1=?, idPerfil2=?, idPerfil3=?, telefono=?, email=?, idArea=?, idLocal=? where idUsuario = ? ";	
	}
	ejecutarQUERY_MYSQL_Extra(idUsuario,query, arrayParametros, res, funcionName, function(res, resultados, idUsuario){
		if(idUsuario=="0"){
			var idUsuario = resultados.insertId;
			var queryInsert = "Insert into Procurador (idUsuario) values (?)";
			ejecutarQUERY_MYSQL(queryInsert, [idUsuario], res, funcionName, "insertId");			
		}else{
			enviarResponse(res, [resultados.affectedRows])			
		}
	});
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
exports.consultarInfoLocal = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "SELECT Nombre as nombre, RUC, direccion, celular, telefono, correo, estado, localRemoto, nombres_contacto, apellidos_contacto from Local where idLocal = ? ";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarLocal = function(req, res, funcionName){
	var idLocal = req.query.idLocal;
	var nombre = req.query.nombre;
	var RUC = req.query.RUC;
	var direccion = req.query.direccion;
	var telefono = req.query.telefono;
	var celular = req.query.celular;
	var correo = req.query.correo;
	var estado = req.query.estado;
	var remoto = req.query.remoto;
	var nombreContacto = req.query.nombreContacto;
	var apellidoContacto = req.query.apellidoContacto;	
	var arrayParametros = [nombre, RUC, direccion, telefono, celular, correo, estado, remoto, nombreContacto, apellidoContacto];
	var query = "";
	if(idLocal=="0"){ // Registro
		query = "Insert into Local(Nombre, RUC, direccion, Telefono, celular, correo, estado, localRemoto, nombres_contacto, apellidos_contacto) values (?,?,?,?,?,?,?,?,?,?)";
	}else{ // Actualizacion
		arrayParametros.push(idLocal);
		query = "Update Local set Nombre=?, RUC=?, direccion=?, Telefono=?, celular=?, correo=?, estado=?, localRemoto=?, nombres_contacto=?, apellidos_contacto=? where idLocal=? ";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.getListaAlmacen = function(req, res, funcionName){ // Obtiene los datos para la grilla de mantenimiento de Almacenes
	var query = "Select a.idAlmacen, a.nombre, l.Nombre as local, a.ubicacion, concat(u.Nombres,' ',u.Apellidos) as responsable from Almacen a "+
		" inner join Local l on a.idLocal = l.idLocal "+
		" left join UsuarioIntranet u on a.responsable = u.idUsuario";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName)
}
exports.getUsuarios = function(req, res, funcionName){ // FALTCOMP
	var query = "select u.idUsuario, concat(u.Nombres,' ',u.Apellidos) as nombreUsuario, u.Nombres, u.Apellidos, u.idArea, u.idPerfil1, u.idPerfil2, u.idPerfil3, u.UName, u.password as pasx, u.DNI, u.idLocal, u.email from UsuarioIntranet u order by concat(u.Nombres,' ',u.Apellidos)";
	var arrayParametros = [];
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.consultarInfoAlmacen = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select idLocal, nombre as nombreCompleto, nombreBreve, ubicacion, responsable from Almacen where idAlmacen = ? ";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarAlmacen = function(req, res, funcionName){
	var idNombreCompleto = req.query.idNombreCompleto;
	var idNombreBreve = req.query.idNombreBreve;
	var idUbicacion = req.query.idUbicacion;
	var idLocal = req.query.idLocal;
	var idUsuario = req.query.idUsuario;
	var idAlmacen = req.query.idAlmacen;
	var arrayParametros = [idNombreCompleto, idNombreBreve, idUbicacion, idLocal, idUsuario];
	var query = "";
	if(idAlmacen=="0"){ // Registro
		query = "Insert into Almacen(nombre, nombreBreve, ubicacion, idLocal, responsable) values (?,?,?,?,?)";
	}else{ // Actualizacion
		arrayParametros.push(idAlmacen);
		query = "Update Almacen set nombre=?, nombreBreve=?, ubicacion=?, idLocal=?, responsable=? where idAlmacen=? ";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.getListaArticulo = function(req, res, funcionName){
	var query = "Select idArticulo, descripcion, if(esCAT='S', 'Si', 'No') as esCAT, stock from Articulo";
	var arrayParametros = []
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.consultarInfoArticulo = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select idArticulo, descripcion, esCAT, stock from Articulo where idArticulo = ? order by idArticulo";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarArticulo = function(req, res, funcionName){
	var idArticulo = req.query.idArticulo;
	var descripcion = req.query.descripcion;
	var esCAT = req.query.esCAT;
	var arrayParametros = [descripcion, esCAT];
	var query = ""
	if(idArticulo=="0"){ // registrara un nuevo articulo
		query = "Insert into Articulo(descripcion, esCAT) values (?,?)"; 
	}else{// solo actualizara
		arrayParametros.push(idArticulo)
		query = "Update Articulo set descripcion=?, esCAT=? where idArticulo=?";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.getListaArticulos_almacen = function(req, res, funcionName){
	var idAlmacen = req.query.idAlmacen;
	var query = "Select aa.idArticulos_almacen, a.descripcion as articulo from Articulos_almacen aa inner join Articulo a on aa.idArticulo = a.idArticulo where aa.idAlmacen = ?";
	var arrayParametros = [idAlmacen]
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getArticulosPorAgregarAalmacen = function(req, res, funcionName){ // obtiene los articulos que aun no han sido agregados en un almacen
	var idAlmacen = req.query.idAlmacen;
	var idRegistro = req.query.idRegistro;
	var arrayParametros = [idAlmacen]
	var query = "select idArticulo, descripcion as nombre from Articulo where idArticulo not in (select aa.idArticulo from Articulos_almacen aa where aa.idAlmacen = ? ";
	if(idRegistro!="0"){
		query = query+" and aa.idArticulos_almacen!=? ";
		arrayParametros.push(idRegistro);
	}
	query = query+" ) ";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName)
	
}
exports.consultarInfoArticulos_almacen = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select idArticulo, idAlmacen from Articulos_almacen where idArticulos_almacen = ?";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarArticulosXalmacen = function(req, res, funcionName){
	var idArticulo = req.query.idArticulo;
	var idAlmacen = req.query.idAlmacen;
	var idArticulos_almacen = req.query.idArticulos_almacen;
	var arrayParametros = [idArticulo, idAlmacen];
	var query = ""
	if(idArticulos_almacen=="0"){ // Registro
		query = "Insert into Articulos_almacen(idArticulo, idAlmacen) values (?,?)";
	}else{ // Actualizacion
		arrayParametros.push(idArticulos_almacen);
		query = "Update Articulos_almacen set idArticulo=?, idAlmacen=? where idArticulos_almacen=? ";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.getListaPromotor  = function(req, res, funcionName){
    var query = "Select pr.idPromotor, concat(pe.Nombres,' ', pe.Apellidos) as nombrePromotor, pe.DNI, pe.email as correo, pe.UName as usuario, pe.idLocal from Promotor pr inner join UsuarioIntranet pe on pr.idUsuario = pe.idUsuario order by concat(pe.Nombres,' ', pe.Apellidos) ";
    ejecutarQUERY_MYSQL(query,[],res, funcionName)
}
exports.consultarInfoPromotor = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select p.idPromotor, u.idUsuario, u.Nombres, u.Apellidos, u.UName, u.password, u.DNI, u.telefono, u.email, u.idPerfil1, u.idPerfil2, u.idPerfil3, u.idLocal, "+
		" u.idArea, p.nroConcesionarios, if(p.ultVisitaConcesionario=0, '',p.ultVisitaConcesionario) as ultVisitaConcesionario, date_format(p.ultVisitaFecha, '%d/%m/%Y') as ultVisitaFecha from Promotor p inner join UsuarioIntranet u on p.idUsuario = u.idUsuario where p.idPromotor = ? ";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.concesionariosXpromotor = function(req, res, funcionName){
	var idPromotor = req.query.idPromotor;
	var arrayParametros = [idPromotor]
	var query = "Select c.idConcesionario, if(pe.tipoPersona='N', concat(pe.nombres,' ',pe.apellidoPaterno,' ',pe.apellidoMaterno), pe.razonSocial) as nombreConcesionario from Concesionario c inner join Persona pe on c.idPersona = pe.idPersona where c.idPromotor = ? order by if(pe.tipoPersona='N', concat(pe.nombres,' ',pe.apellidoPaterno,' ',pe.apellidoMaterno), pe.razonSocial)";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarPromotor = function(req, res, funcionName){
	var idNombres = req.query.idNombres;
	var idApellidos = req.query.idApellidos;
	var idDNI = req.query.idDNI;
	var idUName = req.query.idUName;
	var idClave = req.query.idClave;
	var idPerfil1 = req.query.idPerfil1;
	var idPerfil2 = req.query.idPerfil2;
	var idPerfil3 = req.query.idPerfil3;
	var idTelefono = req.query.idTelefono;
	var idCorreo = req.query.idCorreo;
	var idArea = req.query.idArea;
	var idLocal = req.query.idLocal;
	var idUsuario = req.query.idUsuario;
	var arrayParametros = [idNombres, idApellidos, idDNI, idUName, idClave, idPerfil1, idPerfil2, idPerfil3, idTelefono, idCorreo, idArea, idLocal];
	var query = "";
	if(idUsuario=="0"){ // registra un usuario y luego el procurador
		query = "Insert into UsuarioIntranet (Nombres, Apellidos, DNI, UName, password, idPerfil1, idPerfil2, "+ 
			"idPerfil3, telefono, email, idArea, idLocal) values (?,?,?,?,?,?,?,?,?,?,?,?)";
	}else{ // actualiza el registro
		arrayParametros.push(idUsuario);
		query = "Update UsuarioIntranet set Nombres = ?, Apellidos=?, DNI=?, UName=?, password=?, "+
			" idPerfil1=?, idPerfil2=?, idPerfil3=?, telefono=?, email=?, idArea=?, idLocal=? where idUsuario = ? ";	
	}
	ejecutarQUERY_MYSQL_Extra(idUsuario,query, arrayParametros, res, funcionName, function(res, resultados, idUsuario){
		if(idUsuario=="0"){
			var idUsuario = resultados.insertId;
			var queryInsert = "Insert into Promotor (idUsuario) values (?)";
			ejecutarQUERY_MYSQL(queryInsert, [idUsuario], res, funcionName, "insertId");			
		}else{
			var nroConcesionarios = req.query.nroConcesionarios;
			var ultimoConcesionario = req.query.ultimoConcesionario;
			var ultimaVisita = req.query.ultimaVisita;
			// actualiza los datos en la tabla Promotor
			var queryUpdatePromotor = "Update Promotor set nroConcesionarios=?, ultVisitaConcesionario=?, ultVisitaFecha=? where idUsuario = ?";
			var arrayParametros = [nroConcesionarios, ultimoConcesionario, ultimaVisita, idUsuario];
			ejecutarQUERY_MYSQL(queryUpdatePromotor, arrayParametros, res, funcionName, "affectedRows");
		}
	});
}
exports.consultarInfoConcesionario = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "select co.idConcesionario, p.idPersona, co.estado, if(co.idSede=0,'',co.idSede) as idSede, if(co.idPromotor=0, '', co.idPromotor) as idPromotor, "+
		"if(co.diaSemanaAtt is null, '', co.diaSemanaAtt) as diaSemana, p.nombres, p.apellidoPaterno, p.apellidoMaterno, p.razonSocial, p.tipoPersona, p.telefonoFijo, p.telefonoMovil, "+ 
		"p.nroDocumento, if(p.idDistrito is null, '', p.idDistrito) as idDistrito, p.calle, date_format(co.fechaAfiliacion, '%d/%m/%Y') as fechaAfiliacion, "+
		" co.idResponsable as idPersona_resp, r.nroDocumento as DNI_Resp, r.nombres as nombres_resp, r.apellidoPaterno as apePat_resp, r.apellidoMaterno as apeMat_resp from Concesionario co "+
		"inner join Persona p on co.idPersona = p.idPersona "+
		"left join Persona r on co.idResponsable = r.idPersona "+
		"where co.idConcesionario=?";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarConcesionario = function(req, res, funcionName){
	var idPersona = req.query.idPersona;
	var tipoPersona = req.query.tipoPersona;
	var nombres = req.query.nombres;
	var apellidoPaterno = req.query.apellidoPaterno;
	var apellidoMaterno = req.query.apellidoMaterno;
	var razonSocial = req.query.razonSocial;
	var nroDocumento = req.query.nroDocumento;
	var distrito = req.query.distrito;
	var calle = req.query.calle;
	var telefono = req.query.telefono;
	var celular = req.query.celular;
	
	var arrayParametros = [tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, distrito, calle, telefono, celular];
	var query = "";
	if(idPersona=="0"){ // registra un usuario y luego el procurador
		query = "Insert into Persona (tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, idDistrito, calle, telefonoFijo, telefonoMovil)"+ 
			" values (?,?,?,?,?,?,?,?,?,?)";
	}else{ // actualiza el registro
		arrayParametros.push(idPersona);
		query = "Update Persona set tipoPersona=?, nombres=?, apellidoPaterno=?, apellidoMaterno=?, razonSocial=?, nroDocumento=?, idDistrito=?, calle=?, telefonoFijo=?, telefonoMovil=? where idPersona=?";		
	}
	ejecutarQUERY_MYSQL_Extra(idPersona, query, arrayParametros, res, funcionName, function(res, resultados, idPersona){
		var idResponsable = req.query.idResponsable;
		if(idResponsable=="0" && req.query.dni_resp!="" && req.query.nombres_resp!=""){ // registra el responsable
			
			// insert persona responsable:
			var dni_resp = req.query.dni_resp;
			var nombres_resp = req.query.nombres_resp;
			var apePat_resp = req.query.apePat_resp;
			var apeMat_resp = req.query.apeMat_resp;

			var queryInsertResponsable = "Insert into Persona (nroDocumento, nombres, apellidoPaterno, apellidoMaterno) values (?,?,?,?)";
			var parametrosResp = [dni_resp, nombres_resp, apePat_resp, apeMat_resp];
			ejecutarQUERY_MYSQL_Extra([idPersona, resultados.insertId], queryInsertResponsable, parametrosResp, res, funcionName, function(res, resultados, resultsAnterior){
				var idPersona = resultsAnterior[0];
				var idPersonaActual = resultsAnterior[1];
				var idResponsable = resultados.insertId;
				var afiliacion = req.query.afiliacion;
				if(idPersona=="0"){
					var idPersona = idPersonaActual;
					var queryInsert = "Insert into Concesionario (idPersona, idSede, idPromotor, diaSemanaAtt, estado, fechaAfiliacion, idResponsable) values (?,?,?,?,?,?,?)";
					var local = req.query.local;
					var promotor = req.query.promotor;
					var visita = req.query.visita;
					var estado = req.query.estado;
					var parametros = [idPersona, local, promotor, visita, estado, afiliacion, idResponsable];
					ejecutarQUERY_MYSQL(queryInsert, parametros, res, funcionName, "insertId");			
				}else{
					var idConcesionario = req.query.idConcesionario;
					var local = req.query.local;
					var promotor = req.query.promotor;
					var visita = req.query.visita;
					var estado = req.query.estado;
					
					var queryUpdateConcesionario= "Update Concesionario set idSede=?, idPromotor=?, diaSemanaAtt=?, estado=?, fechaAfiliacion=?, idResponsable=?  where idConcesionario = ?";
					var arrayParametros = [local, promotor, visita, estado, afiliacion, idResponsable, idConcesionario];
					ejecutarQUERY_MYSQL(queryUpdateConcesionario, arrayParametros, res, funcionName, "affectedRows");		
				}
			});
		}else{
			// update persona responsable:
			var dni_resp = req.query.dni_resp;
			var nombres_resp = req.query.nombres_resp;
			var apePat_resp = req.query.apePat_resp;
			var apeMat_resp = req.query.apeMat_resp;

			var queryUpdateResponsable = "Update Persona set nroDocumento=?, nombres=?, apellidoPaterno=?, apellidoMaterno=? where idPersona=?";
			var parametrosResp = [dni_resp, nombres_resp, apePat_resp, apeMat_resp, idResponsable];
			ejecutarQUERY_MYSQL(queryUpdateResponsable, parametrosResp, res, funcionName, "false");
			
			var afiliacion = req.query.afiliacion;
			if(idPersona=="0"){
				var idPersona = resultados.insertId;
				var queryInsert = "Insert into Concesionario (idPersona, idSede, idPromotor, diaSemanaAtt, estado, fechaAfiliacion, idResponsable) values (?,?,?,?,?,?,?)";
				var local = req.query.local;
				var promotor = req.query.promotor;
				var visita = req.query.visita;
				var estado = req.query.estado;
				var parametros = [idPersona, local, promotor, visita, estado, afiliacion, idResponsable];
				ejecutarQUERY_MYSQL(queryInsert, parametros, res, funcionName, "insertId");			
			}else{
				var idConcesionario = req.query.idConcesionario;
				var local = req.query.local;
				var promotor = req.query.promotor;
				var visita = req.query.visita;
				var estado = req.query.estado;
				
				var queryUpdateConcesionario= "Update Concesionario set idSede=?, idPromotor=?, diaSemanaAtt=?, estado=?, fechaAfiliacion=?, idResponsable=?  where idConcesionario = ?";
				var arrayParametros = [local, promotor, visita, estado, afiliacion, idResponsable, idConcesionario];
				ejecutarQUERY_MYSQL(queryUpdateConcesionario, arrayParametros, res, funcionName, "affectedRows");		
			}
		}		
	});
}
exports.getListaProveedor  = function(req, res, funcionName){
    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
	var query = "SELECT pr.idProveedor, if(p.tipoPersona='N', concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno), p.razonSocial) as nombreProveedor, "+
	" p.nroDocumento, p.telefonoFijo, p.calle, case pr.tipoProveedor "+
	" when 'N' then 'Nosocomio' "+
	" when 'F' then 'Funeraria' "+
	" when 'O' then 'Otros' "+
	" when '' then '' "+
	" END as tipoProveedor "+
	" FROM Proveedor pr "+
	" inner join Persona p on pr.idPersona = p.idPersona order by  if(p.tipoPersona='N', concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno), p.razonSocial)";
    
	query = agregarLimit(page, registrosxpagina, query);	
	ejecutarQUERY_MYSQL(query,[],res, funcionName, function(res, resultados){
		if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="Select count(*) as cantidad from Proveedor pr inner join Persona p on pr.idPersona = p.idPersona";
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
	})
}
exports.consultarInfoProveedor = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "select pr.idProveedor, pr.tipoProveedor, date_format(pr.fechaUltCompra, '%d/%m/%Y') as fechaUltCompra, p.idPersona, p.nombres, p.apellidoPaterno, p.apellidoMaterno, p.razonSocial, p.tipoPersona, "+ 
		"p.nroDocumento, if(p.idDistrito is null, '', p.idDistrito) as idDistrito, p.calle from Proveedor pr "+
		"inner join Persona p on pr.idPersona = p.idPersona where pr.idProveedor=?";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
function guardarNosocomioFuneraria(proveedorId, req, res, funcionName){
	var tipoPersona = req.query.tipoPersona;
	var nombres = req.query.nombres;
	var apellidoPaterno = req.query.apellidoPaterno;
	var apellidoMaterno = req.query.apellidoMaterno;
	var razonSocial = req.query.razonSocial;
	var nroDocumento = req.query.nroDocumento;
	var distrito = req.query.distrito;
	var calle = req.query.calle;
	var tipoProveedor = req.query.tipoProveedor;
	
	var nombre = razonSocial;
	if(tipoPersona=='N'){
		nombre = nombres+" "+apellidoPaterno+" "+apellidoMaterno
	}
	var query = "";
	var params = []
	switch(tipoProveedor){
		case 'N':
			query = "Insert into Nosocomio(nombre, calle, RUC, idDistrito, tipo, idProveedor) values (?,?,?,?,?,?)";
			params = [nombre, calle, nroDocumento, distrito, 'H', proveedorId]
			break;
		case 'F':
			query = "Insert into Funeraria(nombre, calle, RUC, idDistrito, idProveedor) values (?,?,?,?,?)";
			params = [nombre, calle, nroDocumento, distrito, proveedorId]
			break;
		
	}
	ejecutarQUERY_MYSQL(query, params, res, funcionName, "false")
}
exports.guardarProveedor = function(req, res, funcionName){
	var idPersona = req.query.idPersona;
	var tipoPersona = req.query.tipoPersona;
	var nombres = req.query.nombres;
	var apellidoPaterno = req.query.apellidoPaterno;
	var apellidoMaterno = req.query.apellidoMaterno;
	var razonSocial = req.query.razonSocial;
	var nroDocumento = req.query.nroDocumento;
	var distrito = req.query.distrito;
	var calle = req.query.calle;		
	var arrayParametros = [tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, distrito, calle];
	var query = "";
	if(idPersona=="0"){ // registra un usuario y luego el proveedor
		query = "Insert into Persona (tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, idDistrito, calle)"+ 
			" values (?,?,?,?,?,?,?,?)";
	}else{ // actualiza el registro
		arrayParametros.push(idPersona);
		query = "Update Persona set tipoPersona=?, nombres=?, apellidoPaterno=?, apellidoMaterno=?, razonSocial=?, nroDocumento=?, idDistrito=?, calle=? where idPersona=?";		
	}
	ejecutarQUERY_MYSQL_Extra(idPersona, query, arrayParametros, res, funcionName, function(res, resultados, idPersona){
		if(idPersona=="0"){
			var idPersona = resultados.insertId;
			var queryInsert = "Insert into Proveedor (idPersona, tipoProveedor, fechaUltCompra) values (?,?,?)";
			var tipoProveedor = req.query.tipoProveedor;
			var ultimaCompra = req.query.ultimaCompra;			
			var parametros = [idPersona, tipoProveedor, ultimaCompra];
			ejecutarQUERY_MYSQL(queryInsert, parametros, res, funcionName, function(res, results){
				var proveedorId = results.insertId
				enviarResponse(res, [proveedorId])
				if(req.query.tipoProveedor=='N' || req.query.tipoProveedor=='F'){
					guardarNosocomioFuneraria(proveedorId, req, res, "guardarNosocomioFuneraria")
				}				
			}) ;			
		}else{
			var idProveedor = req.query.idProveedor;
			var tipoProveedor = req.query.tipoProveedor;
			var ultimaCompra = req.query.ultimaCompra;	
			
			var queryUpdate= "Update Proveedor set tipoProveedor=?, fechaUltCompra=? where idProveedor = ?";
			var arrayParametros = [tipoProveedor, ultimaCompra, idProveedor];
			ejecutarQUERY_MYSQL(queryUpdate, arrayParametros, res, funcionName, "affectedRows");		
		}
	});
}
exports.getListaAsociado = function(req, res, funcionName){
	//** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
	var query = "select a.idAsociado, if(p.tipoPersona='N', concat(COALESCE(nombres,''),' ',COALESCE(apellidoPaterno,''),' ',COALESCE(apellidoMaterno,'')), p.razonSocial) as nombre, "+
		"p.nroDocumento, p.calle, p.telefonoMovil, p.email  from Asociado a inner join Persona p on a.idPersona = p.idPersona "+
		" order by if(p.tipoPersona='N', concat(COALESCE(nombres,''),' ',COALESCE(apellidoPaterno,''),' ',COALESCE(apellidoMaterno,'')), p.razonSocial)";
	query = agregarLimit(page, registrosxpagina, query);	
	ejecutarQUERY_MYSQL(query,[],res, funcionName, function(res, resultados){
		if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="Select count(*) as cantidad from Asociado a inner join Persona p on a.idPersona = p.idPersona ";
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
exports.consultarInfoAsociado = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "select a.idAsociado, date_format(p.fechaNacimiento, '%d/%m/%Y') as fechaNacimiento, p.idPersona, p.nombres, p.apellidoPaterno, p.apellidoMaterno, p.razonSocial, p.tipoPersona, p.nroDocumento, if(p.idDistrito is null, '', p.idDistrito) as idDistrito, p.calle, "+
	" p.nro, p.mzLote, p.sector, p.referencia, p.telefonoFijo, p.telefonoMovil, p.email "+
	" from Asociado a "+
	"inner join Persona p on a.idPersona = p.idPersona where a.idAsociado=?";;
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarAsociado = function(req, res, funcionName){
	var idPersona = req.query.idPersona;
	var tipoPersona = req.query.tipoPersona;
	var nombres = req.query.nombres;
	var apellidoPaterno = req.query.apellidoPaterno;
	var apellidoMaterno = req.query.apellidoMaterno;
	var razonSocial = req.query.razonSocial;
	var nroDocumento = req.query.nroDocumento;
	var distrito = req.query.distrito;
	var calle = req.query.calle;
	var nro = req.query.nro;
	var mzLote = req.query.mzLote;
	var sector = req.query.sector;
	var referencia = req.query.referencia;
	var telfijo = req.query.telfijo;
	var telmovil = req.query.telmovil;
	var correo = req.query.correo;
	var fechaNac = req.query.fechaNac;
	var idAsociado = req.query.idAsociado;
	
	var arrayParametros = [tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, distrito, calle, nro, mzLote, sector, referencia, telfijo, telmovil, correo, fechaNac];
	var query = "";
	if(idPersona=="0"){ // registra un usuario y luego el proveedor
		query = "Insert into Persona (tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, idDistrito, calle, nro, mzLote, sector, referencia, telefonoFijo, telefonoMovil, email, fechaNacimiento)"+ 
			" values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
	}else{ // actualiza el registro
		arrayParametros.push(idPersona);
		query = "Update Persona set tipoPersona=?, nombres=?, apellidoPaterno=?, apellidoMaterno=?, razonSocial=?, nroDocumento=?, idDistrito=?, calle=?, nro=?, mzLote=?, sector=?, referencia=?, telefonoFijo=?, telefonoMovil=?, email=?, fechaNacimiento=? where idPersona=?";		
	}
	ejecutarQUERY_MYSQL_Extra(idPersona, query, arrayParametros, res, funcionName, function(res, resultados, idPersona){
		if(idPersona=="0"){
			var idPersona = resultados.insertId;
			var queryInsert = "Insert into Asociado (idPersona) values (?)";			
			var parametros = [idPersona];
			ejecutarQUERY_MYSQL(queryInsert, parametros, res, funcionName, "insertId");			
		}else{
			enviarResponse(res, [resultados.affectedRows]);		
		}
	});
}
exports.getListaAgraviado = function(req, res, funcionName){
	//** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;
	var query = "select a.codAgraviado, a.codEvento, concat(COALESCE(nombres,''),' ',COALESCE(apellidoPaterno,''),' ',COALESCE(apellidoMaterno,'')) as nombre, p.nroDocumento as DNI, p.telefonoMovil as telefono, a.diagnostico from Agraviado a inner join Persona p on a.idPersona = p.idPersona "+
		" order by a.codAgraviado desc";
	query = agregarLimit(page, registrosxpagina, query);	
	ejecutarQUERY_MYSQL(query,[],res, funcionName, function(res, resultados){
		if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="Select count(*) as cantidad from Agraviado a inner join Persona p on a.idPersona = p.idPersona ";
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
exports.consultarInfoAgraviado = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select a.codEvento, a.diagnostico, a.tipoAgraviado, if(a.idNosocomio>0, a.idNosocomio, '') as idNosocomio, a.idTipoAtencion, date_format(a.fechaIngreso, '%d/%m/%Y') as fechaIngreso, p.idPersona, "+ 
		"p.nroDocumento as DNI, p.nombres, p.apellidoPaterno, p.apellidoMaterno, p.edad, p.idDistrito as distritoInicial, p.calle, p.nro, p.mzLote, p.sector, p.referencia, "+
		" p.telefonoFijo, p.telefonoMovil, p.email from Agraviado a inner join Persona p on a.idPersona = p.idPersona where a.codAgraviado=?";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getTipoAtencionList = function(req, res, funcionName){ // obtiene todos los tipos de atencion
	var query = "Select idTipoAtencion, descripcion from TipoAtencion order by descripcion";
	var parametros = [];
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.getListaNosocomios = function(req, res, funcionName){ // obtiene todos los registros de la Tabla Nosocomio, campos: idNosocomio, nombre
    var arrayParametros = [];
    var query = "Select idNosocomio, nombre as nombreNosocomio from Nosocomio order by nombre";
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getPersonaByNroDoc = function(req, res, funcionName){
    var nroDoc = req.query.nroDoc;
    var query="select idPersona, edad, tipoPersona, concat(nombres,' ',apellidoPaterno,' ',apellidoMaterno) as nombrePersona, nombres, "+
		" apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, calle, nro, mzLote, sector, referencia, d.idDistrito, "+
		" d1.idDistrito as distritoInicial, d.idProvincia,  calle1, nro1, mzLote1, sector1, referencia1, telefonoFijo, telefonoMovil, "+
		" email from Persona p "+ 
		" left join Distrito d on p.idDistrito1=d.idDistrito "+ 
		" left join Distrito d1 on p.idDistrito = d1.idDistrito "+
		" where p.nroDocumento=?";
    var arrayParametros = [nroDoc];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarAgraviado = function(req, res, funcionName){
	var idPersona = req.query.idPersona;
	var nombres = req.query.nombres;
	var apellidoPaterno = req.query.apellidoPaterno;
	var apellidoMaterno = req.query.apellidoMaterno;
	var nroDocumento = req.query.nroDocumento;
	var distrito = req.query.distrito;
	var calle = req.query.calle;
	var nro = req.query.nro;
	var mzLote = req.query.mzLote;
	var sector = req.query.sector;
	var referencia = req.query.referencia;
	var telfijo = req.query.telfijo;
	var telmovil = req.query.telmovil;
	var correo = req.query.correo;
	var edad = req.query.edad;

	var arrayParametros = [nombres, apellidoPaterno, apellidoMaterno, nroDocumento, distrito, calle, nro, mzLote, sector, referencia, telfijo, telmovil, correo, edad];
	var query = "";
	if(idPersona=="0"){ // registra un usuario y luego el proveedor
		query = "Insert into Persona (nombres, apellidoPaterno, apellidoMaterno, nroDocumento, idDistrito, calle, nro, mzLote, sector, referencia, telefonoFijo, telefonoMovil, email, edad)"+ 
			" values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
	}else{ // actualiza el registro
		arrayParametros.push(idPersona);
		query = "Update Persona set nombres=?, apellidoPaterno=?, apellidoMaterno=?, nroDocumento=?, idDistrito=?, calle=?, nro=?, mzLote=?, sector=?, referencia=?, telefonoFijo=?, telefonoMovil=?, email=?, edad=? where idPersona=?";		
	}
	ejecutarQUERY_MYSQL_Extra(idPersona, query, arrayParametros, res, funcionName, function(res, resultados, idPersona){		
		if(idPersona=="0"){
			idPersona = resultados.insertId;
		}
		var esNuevo = req.query.esNuevo;
		var codAgraviado = req.query.codAgraviado;
		var codEvento = req.query.codEvento;
		var diagnostico = req.query.diagnostico;
		var tipoAgraviado = req.query.tipoAgraviado;
		var idNosocomio = req.query.idNosocomio;
		var tipoAtencion = req.query.tipoAtencion;
		var fechaIngreso = req.query.fechaIngreso;

		var queryAgraviado = "";
		var arrayParams = []
		
		if(esNuevo=="T"){// Inserta agraviado
			arrayParams = [codAgraviado, codEvento, diagnostico, tipoAgraviado, idNosocomio, tipoAtencion, fechaIngreso, idPersona];
			queryAgraviado = "Insert into Agraviado(codAgraviado, codEvento, diagnostico, tipoAgraviado, idNosocomio, idTipoAtencion, fechaIngreso, idPersona) values (?,?,?,?,?,?,?,?)"
		}else{ // actualiza agraviado
			arrayParams = [codEvento, diagnostico, tipoAgraviado, idNosocomio, tipoAtencion, fechaIngreso, idPersona, codAgraviado];
			queryAgraviado = "Update Agraviado set codEvento=?, diagnostico=?, tipoAgraviado=?, idNosocomio=?, idTipoAtencion=?, fechaIngreso=?, idPersona=? where codAgraviado=?";
		}
		ejecutarQUERY_MYSQL(queryAgraviado, arrayParams, res, funcionName, "affectedRows");
	});
}
exports.getListaUso_Vehiculo = function(req, res, funcionName){
	var query = "Select idUso, nombreUso from Uso_Vehiculo ";
    ejecutarQUERY_MYSQL(query,[],res, funcionName)
}
exports.consultarInfoUso_Vehiculo = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select idUso, nombreUso from Uso_Vehiculo where idUso = ? ";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarUso_Vehiculo = function(req, res, funcionName){
	var idUso = req.query.idUso;
	var descripcion = req.query.descripcion;	
	var arrayParametros = [descripcion];
	var query = ""
	if(idUso=="0"){ // registrara un nuevo articulo
		query = "Insert into Uso_Vehiculo(nombreUso) values (?)"; 
	}else{// solo actualizara
		arrayParametros.push(idUso)
		query = "Update Uso_Vehiculo set nombreUso=? where idUso=?";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.getListaClase_Vehiculo = function(req, res, funcionName){
	var query = "Select idClase, nombreClase from Clase_Vehiculo ";
    ejecutarQUERY_MYSQL(query,[],res, funcionName)
}
exports.consultarInfoClase_Vehiculo = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select idClase, nombreClase from Clase_Vehiculo where idClase = ? ";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarClase_Vehiculo = function(req, res, funcionName){
	var idClase = req.query.idClase;
	var descripcion = req.query.descripcion;	
	var arrayParametros = [descripcion];
	var query = ""
	if(idClase=="0"){ // registrara un nuevo articulo
		query = "Insert into Clase_Vehiculo(nombreClase) values (?)"; 
	}else{// solo actualizara
		arrayParametros.push(idClase)
		query = "Update Clase_Vehiculo set nombreClase=? where idClase=?";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.getListaUsoClaseVehiculo = function(req, res, funcionName){
	var idUso = req.query.idUso;
	var query = "Select ucv.idUsoClaseVehiculo, c.nombreClase, ucv.prima, ucv.montoPoliza  from UsoClaseVehiculo ucv inner join Clase_Vehiculo c on ucv.idClaseVehiculo = c.idClase where ucv.idUso = ? order by c.nombreClase";
	var arrayParametros = [idUso]
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getClasesPorAgregarAUso = function(req, res, funcionName){ // obtiene los articulos que aun no han sido agregados en un almacen
	var idUso = req.query.idUso;
	var idRegistro = req.query.idRegistro;
	var arrayParametros = [idUso]
	var query = "select idClase, nombreClase from Clase_Vehiculo where idClase not in (select ucv.idClaseVehiculo from UsoClaseVehiculo ucv where ucv.idUso = ? ";
	if(idRegistro!="0"){
		query = query+" and ucv.idUsoClaseVehiculo!=? ";
		arrayParametros.push(idRegistro);
	}
	query = query+" ) ";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName)
	
}
exports.consultarInfoUsoClaseVehiculo = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select idClaseVehiculo as idClase, idUso, prima, montoPoliza from UsoClaseVehiculo where idUsoClaseVehiculo = ?";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarUsoClaseVehiculo = function(req, res, funcionName){
	var idArticulo = req.query.idArticulo;
	var idAlmacen = req.query.idAlmacen;
	var idArticulos_almacen = req.query.idArticulos_almacen;
	var arrayParametros = [idArticulo, idAlmacen];
	var query = ""
	if(idArticulos_almacen=="0"){ // Registro
		query = "Insert into Articulos_almacen(idArticulo, idAlmacen) values (?,?)";
	}else{ // Actualizacion
		arrayParametros.push(idArticulos_almacen);
		query = "Update Articulos_almacen set idArticulo=?, idAlmacen=? where idArticulos_almacen=? ";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.guardarUsoClaseVehiculo = function(req, res, funcionName){
	var idClase = req.query.idClase;
	var idUso = req.query.idUso;
	var prima = req.query.prima;
	var montoPoliza = req.query.montoPoliza;
	var idUsoClaseVehiculo = req.query.idUsoClaseVehiculo;
	var arrayParametros = [idClase, idUso, prima, montoPoliza];
	var query = ""
	if(idUsoClaseVehiculo=="0"){ // Registro
		query = "Insert into UsoClaseVehiculo(idClaseVehiculo, idUso, prima, montoPoliza) values (?,?,?,?)";
	}else{ // Actualizacion
		arrayParametros.push(idUsoClaseVehiculo);
		query = "Update UsoClaseVehiculo set idClaseVehiculo=?, idUso=?, prima=?, montoPoliza=? where idUsoClaseVehiculo=? ";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.getVariablesGlobales = function(req, res, funcionName){
	var query = "Select UIT, sueldoMinVital, plantillaCuerpoNotificacion, plantillaPieNotificacion from ConstantesGenerales";
	ejecutarQUERY_MYSQL(query, [], res, funcionName)
}
exports.actualizarVariablesGlobales = function(req, res, funcionName){
	var plantillaCuerpo = req.body.plantillaCuerpo;
	var plantillaPie = req.body.plantillaPie;
	var UIT = req.body.UIT;
	var sueldoMinVital = req.body.sueldoMinVital;
	var fechaUIT = req.body.fechaUIT;
	var fechaSueldoMinVital = req.body.fechaSueldoMinVital
	var arrayParametros = [plantillaCuerpo, plantillaPie, sueldoMinVital, UIT]
	var query = "Update ConstantesGenerales set plantillaCuerpoNotificacion=?, plantillaPieNotificacion=?, sueldoMinVital=?, UIT = ? ";
	if(fechaUIT!=""){
		query = query +", fechaUIT=CURRENT_TIMESTAMP ";
	}
	if(fechaSueldoMinVital!=""){
		query = query +", fechaSueldoMinVital=CURRENT_TIMESTAMP ";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.consultarInfoNosocomio = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select nombre, calle, idDistrito, telefono, tipo from Nosocomio where idNosocomio = ?";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.consultarInfoComisaria = function(req, res, funcionName){
	var id = req.query.id;
	var arrayParametros = [id];
	var query = "Select nombre, calle, idDistrito, telefono from Comisaria where idComisaria = ?";
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.guardarNosocomio = function(req, res, funcionName){
	var idNosocomio = req.query.idNosocomio;
	var nombre = req.query.nombre;
	var distrito = req.query.distrito;
	var direccion = req.query.direccion;
	var telf = req.query.telf;
	var tipo = req.query.tipo;
	
	var arrayParametros = [nombre, distrito, direccion, telf, tipo];
	var query = ""
	if(idNosocomio=="0"){ // Registro
		query = "Insert into Nosocomio(nombre, idDistrito, calle, telefono, tipo) values (?,?,?,?,?)";
	}else{ // Actualizacion
		arrayParametros.push(idNosocomio);
		query = "Update Nosocomio set nombre=?, idDistrito=?, calle=?, telefono=?, tipo=?  where idNosocomio=? ";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
exports.guardarComisaria = function(req, res, funcionName){
	var idComisaria = req.query.idComisaria;
	var nombre = req.query.nombre;
	var distrito = req.query.distrito;
	var direccion = req.query.direccion;
	var telf = req.query.telf;
	
	var arrayParametros = [nombre, distrito, direccion, telf];
	var query = ""
	if(idComisaria=="0"){ // Registro
		query = "Insert into Comisaria(nombre, idDistrito, calle, telefono) values (?,?,?,?)";
	}else{ // Actualizacion
		arrayParametros.push(idComisaria);
		query = "Update Comisaria set nombre=?, idDistrito=?, calle=?, telefono=? where idComisaria=? ";
	}
	ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, "affectedRows")
}
//*** GUIAS **//
exports.recomponerGuias = function(req, res, funcionName){
	var archivo = req.query.archivo;
	var delimitador = req.query.delimitador;
	var ruta_archivo = "./www/files/"+archivo;
	if(delimitador==undefined){
		delimitador=",";
	}
	// se ingresaran los guias provenientes de un proveedor con sus respectivos detalles:
	
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:delimitador});
	/*var lista_proveedores =  {
		"proveedor1":"1",
		"proveedor2":"2"
	}; // id de los proveedores.
	var results = [{
		"nroCertificado":"100200",
		"proveedor":"1",
		"docReferencia":"12345"		
	},
	{
		"nroCertificado":"100209",
		"proveedor":"1",
		"docReferencia":"12346"	
	},
	{
		"nroCertificado":"100201",
		"proveedor":"2",
		"docReferencia":"67891"	
	},
	{
		"nroCertificado":"100203",
		"proveedor":"1",
		"docReferencia":"12345"	
	},
	{
		"nroCertificado":"100205",
		"proveedor":"1",
		"docReferencia":"12346"	
	},
	{
		"nroCertificado":"100204",
		"proveedor":"2",
		"docReferencia":"67891"	
	}
	]*/
	
		// registra las guias de Ingreso:
		//for(var y=0; y<resultGroup.length; y++){
			
			var fecha = "2016-07-01";
			var idAlmacen = "1"; // Almacen principal
			var tipoOperacion = "ING";
			var idUsuario = "121"; // Vilma
			var idProveedor = "1";
			var docReferencia = "7777777";
			
			var queryInsertGuia="Insert into Guia_movimiento_cabecera (tipoOperacion, fechaOperacion, idAlmacen, idUsuario, idProveedor, docRefProveedor, idOrdenCompra) values (?,?,?,?,?,?,?)";
			var parametros = [tipoOperacion, fecha, idAlmacen, idUsuario, idProveedor, docReferencia, 'O/C'];
			
			ejecutarQUERY_MYSQL(queryInsertGuia, parametros, res, funcionName, function(res, resultados){
				req.query.idGuia = resultados.insertId;
				csvConverter.fromFile(ruta_archivo,function(err,results){
					/*for(var i=0; i<results.length; i++){
						results[i].idProveedor = lista_proveedores[results[i].proveedor]
					}
					var listaGuias = [];		
					var resultGroup = groupBy(results, function(item){
						return [item.docReferencia, item.idProveedor];
					});*/
					var idGuia=req.query.idGuia;
					
					var queryActualizarStockGeneral = "Update Articulo set stock = stock + "+results.length+" where idArticulo=1";
					ejecutarQUERY_MYSQL(queryActualizarStockGeneral, [], res, funcionName, "false");
					
					results = results.sort(function (a, b) {
						return (a.nroCertificado - b.nroCertificado)
					}) // ordena los certificados de formas asc
					
					var detalleIngreso = [];
					var certifInicio=0;					
					for(var i=0; i<results.length; i++){
						if(i>0){
							var certificadoAnterior = parseInt(results[i-1].nroCertificado);
							var certificadoActual = parseInt(results[i].nroCertificado);
							if(certificadoActual-certificadoAnterior>1){
								var certifFin = certificadoAnterior;
								var cantidad = certifFin - certifInicio + 1;
								var detalle = {
									idGuia : idGuia,
									idArticulo : "1",
									unidad:"UNID",
									cantidad:cantidad,
									inicio:certifInicio,
									fin:certifFin,
									observacion:"recuperacion"
								}
								detalleIngreso.push(detalle);
								certifInicio = certificadoActual;
								
								if(results.length - i == 1){ // ultimo								
									var certifFin = parseInt(results[i].nroCertificado);
									var cantidad = certifFin - certifInicio + 1;
									var detalle = {
										idGuia : idGuia,
										idArticulo : "1",
										unidad:"UNID",
										cantidad:cantidad,
										inicio:certifInicio,
										fin:certifFin,
										observacion:"recuperacion"
									}
									detalleIngreso.push(detalle);								
								}
							}else{
								if(results.length - i == 1){ // ultimo
									var certifFin = parseInt(results[i].nroCertificado);
									var cantidad = certifFin - certifInicio + 1;
									var detalle = {
										idGuia : idGuia,
										idArticulo : "1",
										unidad:"UNID",
										cantidad:cantidad,
										inicio:certifInicio,
										fin:certifFin,
										observacion:"recuperacion"
									}
									detalleIngreso.push(detalle);
								}
							}
						}else{
							certifInicio = results[i].nroCertificado;
						}
					}
					var queryInsertDetalles = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo, unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values ";
					var values = "";
					for(var y=0; y<detalleIngreso.length; y++){
						var idGuia = detalleIngreso[y].idGuia;
						var idArticulo = detalleIngreso[y].idArticulo;
						var unidad = detalleIngreso[y].unidad;
						var cantidad = detalleIngreso[y].cantidad;
						var inicio = detalleIngreso[y].inicio;
						var fin = detalleIngreso[y].fin;
						var observacion = detalleIngreso[y].observacion;
						if(y>0){
							values = values+" , ";
						}
						values = values+" ('"+idGuia+"', '"+idArticulo+"', '"+unidad+"', '"+cantidad+"', '"+inicio+"', '"+fin+"', '"+observacion+"')";
					}
					queryInsertDetalles = queryInsertDetalles+values;
					ejecutarQUERY_MYSQL(queryInsertDetalles, [], res, funcionName, "false");
					
					// inserta los movimientos
					var queryInsertMovimientos = "Insert into Certificado_movimiento(nroCertificado, idArticulo, tipOperacion, idUbicacion, idUsuarioResp, idGuia, fechaOperacion) values ";
					var valuesMovimientos = "";
					for(var i=0; i<results.length; i++){
						if(i>0){
							valuesMovimientos = valuesMovimientos+" , ";
						}
						valuesMovimientos = valuesMovimientos+" ('"+results[i].nroCertificado+"', '1', 'I', '1', '121', '"+idGuia+"', '2016-07-01')";
					}
					queryInsertMovimientos = queryInsertMovimientos+valuesMovimientos;
				
					ejecutarQUERY_MYSQL_Extra(detalleIngreso, queryInsertMovimientos, [], res, funcionName, function(res, results, detalleIngreso){
						// Ingresa las guias de salidas:
						var fecha = "2016-07-02";
						var idAlmacen = "1"; // Almacen principal
						var tipoOperacion = "SAL";
						var idUsuario = "121"; // Vilma
						var idUsuarioResp = "121";
						
						var queryInsertGuia="Insert into Guia_movimiento_cabecera (tipoOperacion, fechaOperacion, idAlmacen, idUsuario, idUsuarioResp) values (?,?,?,?,?)";
						var parametros = [tipoOperacion, fecha, idAlmacen, idUsuario, idUsuarioResp];
						
						ejecutarQUERY_MYSQL_Extra(detalleIngreso, queryInsertGuia, parametros, res, funcionName, function(res, results, detalleIngreso){
							var idGuiaSalida = results.insertId;
							// Inserta los detalles
							var queryInsertDetalles = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo, unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values ";
							var values = "";
							for(var y=0; y<detalleIngreso.length; y++){
								var idArticulo = detalleIngreso[y].idArticulo;
								var unidad = detalleIngreso[y].unidad;
								var cantidad = detalleIngreso[y].cantidad;
								var inicio = detalleIngreso[y].inicio;
								var fin = detalleIngreso[y].fin;
								var observacion = detalleIngreso[y].observacion;
								if(y>0){
									values = values+" , ";
								}
								values = values+" ('"+idGuiaSalida+"', '"+idArticulo+"', '"+unidad+"', '"+cantidad+"', '"+inicio+"', '"+fin+"', '"+observacion+"')";
							}
							queryInsertDetalles = queryInsertDetalles+values;
							ejecutarQUERY_MYSQL(queryInsertDetalles, [], res, funcionName, "false");
							var queryUpdateMovimientos = "Update Certificado_movimiento set idGuiaSalida=?, fechaSalida = ? where idGuia = ? ";
							var idGuiaIngreso = detalleIngreso[0].idGuia;
							var parametros = [idGuiaSalida, "2016-07-02", idGuiaIngreso];
							ejecutarQUERY_MYSQL(queryUpdateMovimientos, parametros, res, funcionName, "false");
						});						
					});
				});
			});
		//}
		//enviarResponse(res, resultGroup);
		
	
}
exports.ingresarDistribucion = function(req, res, funcionName){
	var archivo = req.query.archivo;
	var delimitador = req.query.delimitador;
	var ruta_archivo = "./www/files/"+archivo;
	if(delimitador==undefined){
		delimitador=",";
	}		
	//Converter Class
	var Converter = require("csvtojson").Converter;
	//new converter instance
	var csvConverter=new Converter({delimiter:delimitador});
	
	csvConverter.fromFile(ruta_archivo,function(err,results){
		results = results.sort(function (a, b) {
			return (a.nroCertificado - b.nroCertificado)
		}) // ordena los certificados de formas asc		
		var newResults = [];
		for(var i=0; i<results.length; i++){
			if(results[i].idConcesionario!='' && results[i].idConcesionario!='0'){
				newResults.push(results[i]);
			}
		}
		var resultGroup = groupBy(newResults, function(item){
			//return [item.idSede, item.idConcesionario];
			return [item.idSede];
		});
		// agrupa por sede y concesionario.
		
		for(var y=0; y<resultGroup.length; y++){
			var almacenes = {
				"14":"2",
				"15":"3",
				"16":"4",
				"17":"5"
			}
			// ingresa la guia de ING al almacen del cono:
			var fecha = "2016-07-03";
			var idAlmacen = almacenes[resultGroup[y][0].idSede]; // Almacen del conor
			var tipoOperacion = "ING";
			var idUsuario = resultGroup[y][0].idUsuarioResponsableSede;
			
			var queryInsertGuia="Insert into Guia_movimiento_cabecera (tipoOperacion, fechaOperacion, idAlmacen, idUsuario, idOrdenCompra) values (?,?,?,?,?)";
			var parametros = [tipoOperacion, fecha, idAlmacen, idUsuario, 'O/C'];
			
			ejecutarQUERY_MYSQL_Extra(resultGroup[y], queryInsertGuia, parametros, res, funcionName, function(res, resultados, results){
				var almacenes = {
					"14":"2",
					"15":"3",
					"16":"4",
					"17":"5"				
				}
				var idGuia = resultados.insertId;
				// ingresa los detalles de la guia de ingreso
					var detalleIngreso = [];
					var certifInicio=0;					
					for(var i=0; i<results.length; i++){
						if(i>0){
							var certificadoAnterior = parseInt(results[i-1].nroCertificado);
							var certificadoActual = parseInt(results[i].nroCertificado);
							if(certificadoActual-certificadoAnterior>1){
								var certifFin = certificadoAnterior;
								var cantidad = certifFin - certifInicio + 1;
								var detalle = {
									idGuia : idGuia,
									idArticulo : "1",
									unidad:"UNID",
									cantidad:cantidad,
									inicio:certifInicio,
									fin:certifFin,
									observacion:"recuperacion"
								}
								detalleIngreso.push(detalle);
								certifInicio = certificadoActual;
								
								if(results.length - i == 1){ // ultimo								
									var certifFin = parseInt(results[i].nroCertificado);
									var cantidad = certifFin - certifInicio + 1;
									var detalle = {
										idGuia : idGuia,
										idArticulo : "1",
										unidad:"UNID",
										cantidad:cantidad,
										inicio:certifInicio,
										fin:certifFin,
										observacion:"recuperacion"
									}
									detalleIngreso.push(detalle);								
								}
							}else{
								if(results.length - i == 1){ // ultimo
									var certifFin = parseInt(results[i].nroCertificado);
									var cantidad = certifFin - certifInicio + 1;
									var detalle = {
										idGuia : idGuia,
										idArticulo : "1",
										unidad:"UNID",
										cantidad:cantidad,
										inicio:certifInicio,
										fin:certifFin,
										observacion:"recuperacion"
									}
									detalleIngreso.push(detalle);
								}
							}
						}else{
							certifInicio = results[i].nroCertificado;
						}
					}
					
					var queryInsertDetalles = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo, unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values ";
					var values = "";
					for(var y=0; y<detalleIngreso.length; y++){
						var idGuia = detalleIngreso[y].idGuia;
						var idArticulo = detalleIngreso[y].idArticulo;
						var unidad = detalleIngreso[y].unidad;
						var cantidad = detalleIngreso[y].cantidad;
						var inicio = detalleIngreso[y].inicio;
						var fin = detalleIngreso[y].fin;
						var observacion = detalleIngreso[y].observacion;
						if(y>0){
							values = values+" , ";
						}
						values = values+" ('"+idGuia+"', '"+idArticulo+"', '"+unidad+"', '"+cantidad+"', '"+inicio+"', '"+fin+"', '"+observacion+"')";
					}
					queryInsertDetalles = queryInsertDetalles+values;
					ejecutarQUERY_MYSQL(queryInsertDetalles, [], res, funcionName, "false");
					
					// inserta los movimientos
					var queryInsertMovimientos = "Insert into Certificado_movimiento(nroCertificado, idArticulo, tipOperacion, idUbicacion, idUsuarioResp, idGuia, fechaOperacion) values ";
					var valuesMovimientos = "";
					for(var i=0; i<results.length; i++){
						if(i>0){
							valuesMovimientos = valuesMovimientos+" , ";
						}
						valuesMovimientos = valuesMovimientos+" ('"+results[i].nroCertificado+"', '1', 'I', '"+almacenes[results[i].idSede]+"', '"+results[i].idUsuarioResponsableSede+"', '"+idGuia+"', '2016-07-03')";
					}
					queryInsertMovimientos = queryInsertMovimientos+valuesMovimientos;
					
					ejecutarQUERY_MYSQL_Extra([results, idGuia], queryInsertMovimientos, [], res, funcionName, function(res, resultados, resultsRows){
						var almacenes = {
							"14":"2",
							"15":"3",
							"16":"4",
							"17":"5"
						}
						var results = resultsRows[0];
						var idGuia = resultsRows[1];
						// se agrupa x concesionario
						var resultGroup = groupBy(results, function(item){
							//return [item.idSede, item.idConcesionario];
							return [item.idConcesionario];
						});
						for(var x=0; x<resultGroup.length; x++){						
							var registroGrupo = resultGroup[x];
							// registra la guia de salidas
							var fecha = "2016-07-04";
							var idAlmacen = almacenes[registroGrupo[0].idSede]; // Almacen principal
							var tipoOperacion = "SAL";
							var idUsuario = registroGrupo[0].idUsuarioResponsableSede;
							var idUsuarioResp = registroGrupo[0].idUsuarioPromotorConcesionario;
							
							var queryInsertGuia="Insert into Guia_movimiento_cabecera (tipoOperacion, fechaOperacion, idAlmacen, idUsuario, idUsuarioResp) values (?,?,?,?,?)";
							var parametros = [tipoOperacion, fecha, idAlmacen, idUsuario, idUsuarioResp];
							
							ejecutarQUERY_MYSQL_Extra([registroGrupo, idGuia], queryInsertGuia, parametros, res, funcionName, function(res, resultados, resultsRows){
								var results = resultsRows[0];
								var idGuia = resultsRows[1];
								var idGuiaSalida = resultados.insertId;								
								// ingresa los detalles de la guia de ingreso
									var detalleIngreso = [];
									var certifInicio=0;					
									var certificadosList = [];
									for(var i=0; i<results.length; i++){
										certificadosList.push(parseInt(results[i].nroCertificado));
										if(i>0){
											var certificadoAnterior = parseInt(results[i-1].nroCertificado);
											var certificadoActual = parseInt(results[i].nroCertificado);
											if(certificadoActual-certificadoAnterior>1){
												var certifFin = certificadoAnterior;
												var cantidad = certifFin - certifInicio + 1;
												var detalle = {
													idGuia : idGuiaSalida,
													idArticulo : "1",
													unidad:"UNID",
													cantidad:cantidad,
													inicio:certifInicio,
													fin:certifFin,
													observacion:"recuperacion"
												}
												detalleIngreso.push(detalle);
												certifInicio = certificadoActual;
												
												if(results.length - i == 1){ // ultimo								
													var certifFin = parseInt(results[i].nroCertificado);
													var cantidad = certifFin - certifInicio + 1;
													var detalle = {
														idGuia : idGuiaSalida,
														idArticulo : "1",
														unidad:"UNID",
														cantidad:cantidad,
														inicio:certifInicio,
														fin:certifFin,
														observacion:"recuperacion"
													}
													detalleIngreso.push(detalle);								
												}
											}else{
												if(results.length - i == 1){ // ultimo
													var certifFin = parseInt(results[i].nroCertificado);
													var cantidad = certifFin - certifInicio + 1;
													var detalle = {
														idGuia : idGuiaSalida,
														idArticulo : "1",
														unidad:"UNID",
														cantidad:cantidad,
														inicio:certifInicio,
														fin:certifFin,
														observacion:"recuperacion"
													}
													detalleIngreso.push(detalle);
												}
											}
										}else{
											certifInicio = results[i].nroCertificado;
										}
									}
									
									var queryInsertDetalles = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo, unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values ";
									var values = "";
									for(var y=0; y<detalleIngreso.length; y++){
										var idGuia = detalleIngreso[y].idGuia;
										var idArticulo = detalleIngreso[y].idArticulo;
										var unidad = detalleIngreso[y].unidad;
										var cantidad = detalleIngreso[y].cantidad;
										var inicio = detalleIngreso[y].inicio;
										var fin = detalleIngreso[y].fin;
										var observacion = detalleIngreso[y].observacion;
										if(y>0){
											values = values+" , ";
										}
										values = values+" ('"+idGuia+"', '"+idArticulo+"', '"+unidad+"', '"+cantidad+"', '"+inicio+"', '"+fin+"', '"+observacion+"')";
									}
									queryInsertDetalles = queryInsertDetalles+values;
									ejecutarQUERY_MYSQL(queryInsertDetalles, [], res, funcionName, "false"); // se inserta los detalles de la guia de salida.																		
									// actualiza los movimientos asignando la guia de salida
									var queryUpdateMovimientos = "Update Certificado_movimiento set idGuiaSalida=?, fechaSalida = ? where idGuia = ? and nroCertificado in ("+certificadosList+") ";									
									var parametros = [idGuiaSalida, "2016-07-04", idGuia];
									ejecutarQUERY_MYSQL(queryUpdateMovimientos, parametros, res, funcionName, "false");
									// Registra la guia de Distribucion
									var tipoOperacion = 'DIST';
									var fecha = '2016-07-05';
									var idUsuario = results[0].idUsuarioResponsableSede;
									var idUsuarioResp = results[0].idUsuarioPromotorConcesionario;
									var idConcesionario = results[0].idConcesionario;
									var nroGuiaManual = '0'+idGuiaSalida;
									
									var queryInsertGuia="Insert into Guia_movimiento_cabecera (tipoOperacion, fechaOperacion, idUsuario, idUsuarioResp, idConcesionario, nroGuiaManual) values (?,?,?,?,?,?)";
									var parametros = [tipoOperacion, fecha, idUsuario, idUsuarioResp, idConcesionario, nroGuiaManual];
				
									ejecutarQUERY_MYSQL_Extra([detalleIngreso, results], queryInsertGuia, parametros, res, funcionName, function(res, resultados, resultsRows){
										var detalleIngreso = resultsRows[0];
										var results = resultsRows[1];
										var idGuiaDist = resultados.insertId;
										
										var queryInsertDetalles = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo, unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values ";
										var values = "";
										for(var y=0; y<detalleIngreso.length; y++){
											var idGuia = idGuiaDist;
											var idArticulo = detalleIngreso[y].idArticulo;
											var unidad = detalleIngreso[y].unidad;
											var cantidad = detalleIngreso[y].cantidad;
											var inicio = detalleIngreso[y].inicio;
											var fin = detalleIngreso[y].fin;
											var observacion = detalleIngreso[y].observacion;
											if(y>0){
												values = values+" , ";
											}
											values = values+" ('"+idGuia+"', '"+idArticulo+"', '"+unidad+"', '"+cantidad+"', '"+inicio+"', '"+fin+"', '"+observacion+"')";
										}
										queryInsertDetalles = queryInsertDetalles+values;
										ejecutarQUERY_MYSQL(queryInsertDetalles, [], res, funcionName, "false"); // se inserta los detalles de la guia de salida.
										// ingresa los movimientos de la distribucion
										var almacenes = {
											"14":"2",
											"15":"3",
											"16":"4",
											"17":"5"
						
										}
										var queryInsertMovimientos = "Insert into Certificado_movimiento(nroCertificado, idArticulo, tipOperacion, idUbicacion, idUsuarioResp, idGuia, fechaOperacion) values ";
										var valuesMovimientos = "";
										for(var i=0; i<results.length; i++){
											if(i>0){
												valuesMovimientos = valuesMovimientos+" , ";
											}
											valuesMovimientos = valuesMovimientos+" ('"+results[i].nroCertificado+"', '1', 'E', '"+results[i].idConcesionario+"', '"+results[i].idUsuarioResponsableSede+"', '"+idGuiaDist+"', '2016-07-05')";
										}
										queryInsertMovimientos = queryInsertMovimientos+valuesMovimientos;
										ejecutarQUERY_MYSQL(queryInsertMovimientos, [], res, funcionName, "false");
									});
							});
						}
					});
			});
		}
	})
}
function groupBy( array , f ){
  var groups = {};
  array.forEach( function( o )
  {
    var group = JSON.stringify( f(o) );
    groups[group] = groups[group] || [];
    groups[group].push( o );  
  });
  return Object.keys(groups).map( function( group )
  {
    return groups[group]; 
  })
}

