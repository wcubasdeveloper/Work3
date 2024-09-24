
// Web service para el modulo Ventas
/* ***** funciones que se importan del modulo global *** */

const request = require('request');


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
var escribirErrorLog = modulo_global.escribirErrorLog

function QueryWhere(queryInicial) {
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
exports.buscarConcesionario = function (req, res, funcionName) { // realiza la busqueda de un concesionario
    var nombre = req.query.stringBusqueda;
    if (nombre == '') {
        var query = "select * from (select co.idConcesionario, if(c.tipoPersona='J', c.razonSocial, concat(c.nombres,' ',c.apellidoPaterno,' ',c.apellidoMaterno)) as nombre, s.idLocal as idSede from Concesionario co inner join Persona c on co.idPersona = c.idPersona inner join Local s on co.idSede = s.idLocal where co.estado='1' and s.estado='1') as v where v.nombre like '%" + nombre + "%' order by v.nombre";
    } else {
        var query = "select * from (select co.idConcesionario, if(c.tipoPersona='J', concat(c.razonSocial,'/',s.Nombre), concat(concat(c.nombres,' ',c.apellidoPaterno,' ',c.apellidoMaterno),'/',s.Nombre)) as nombre, s.idLocal as idSede from Concesionario co inner join Persona c on co.idPersona = c.idPersona inner join Local s on co.idSede = s.idLocal where co.estado='1' and s.estado='1') as v where v.nombre like '%" + nombre + "%' order by v.nombre";
    }
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

exports.getCertificados_asociado = function (req, res, funcionName) {
    var queryWhere = new QueryWhere("");
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var idSede = req.query.idSede;

    if (idSede != "") {
        queryWhere.validarWhere("co.idSede=" + idSede);
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere("( c.fechaLiquidacion between '" + fechaDesde + "' and '" + fechaHasta + "' )");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere("c.fechaLiquidacion>='" + fechaDesde + "'");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere("c.fechaLiquidacion<='" + fechaHasta + "'");
            }
        }
    }
    var query = "Select c.nroCAT, 'EM' as tipo_movimiento, date_format(c.fechaEmision, '%Y%m%d') as fechaEmision, " +
        "date_format(c.fechaControlInicio, '%d/%m/%Y') as fechaControlInicio, " +
        "date_format(c.fechaControlFin, '%d/%m/%Y') as fechaControlFin, " +
        "p.nroDocumento, p.calle as direccion, " +
        "if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreAsociado, '' as firma from Cat c " +
        "inner join Asociado a on c.idAsociado = a.idAsociado " +
        "inner join Persona p on a.idPersona = p.idPersona " +
        "inner join Concesionario co on c.idConcesionario = co.idConcesionario " + queryWhere.getQueryWhere() + " limit 950";

    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}

exports.getCertificados_CAT = function (req, res, funcionName) {
    var queryWhere = new QueryWhere("");
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var idSede = req.query.idSede;

    if (idSede != "") {
        queryWhere.validarWhere("co.idSede=" + idSede);
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere("( c.fechaLiquidacion between '" + fechaDesde + "' and '" + fechaHasta + "' )");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere("c.fechaLiquidacion>='" + fechaDesde + "'");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere("c.fechaLiquidacion<='" + fechaHasta + "'");
            }
        }
    }
    var query = "Select c.nroCAT, 'EM' as tipo_movimiento, date_format(c.fechaEmision, '%Y%m%d') as fechaEmision, " +
        "date_format(c.fechaControlInicio, '%Y%m%d') as fechaControlInicio, " +
        "date_format(c.fechaControlFin, '%Y%m%d') as fechaControlFin, " +
        "c.conDeuda, " +
        "se.Nombre as nombreSede, " +
        "c.prima, " +
        "c.aporte, " +
        "c.comision, " +
        "a.idAsociado, " +
        "p.nroDocumento, " +
        "p.tipoPersona, p.nombres, p.apellidoPaterno, p.apellidoMaterno, " +
        "vc.nombreCategoria as categoria_vehiculo, "+
        "p.razonSocial, v.placa , u.codigoUso as uso_vehiculo, cl.codigoClase as clase_vehiculo, '210100' as location from Cat c " +
        "inner join Asociado a on c.idAsociado = a.idAsociado " +
        "inner join Persona p on a.idPersona = p.idPersona " +
        "inner join Concesionario co on c.idConcesionario = co.idConcesionario " +
        "inner join Local se on co.idSede = se.idLocal " +
        "inner join Vehiculo v on c.idVehiculo = v.idVehiculo " +
        "inner join Vehiculo_Categoria vc on v.idCategoria = vc.idCategoria "+
        "inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo " +
        "inner join Uso_Vehiculo u on ucv.idUso = u.idUso " +
        "inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase " + queryWhere.getQueryWhere() + " limit 950";

    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getCertificados = function (req, res, funcionName) {
    var queryWhere = new QueryWhere("");
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var idSede = req.query.idSede;

    if (idSede != "") {
        queryWhere.validarWhere("co.idSede=" + idSede);
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere("( c.fechaLiquidacion between '" + fechaDesde + "' and '" + fechaHasta + "' )");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere("c.fechaLiquidacion>='" + fechaDesde + "'");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere("c.fechaLiquidacion<='" + fechaHasta + "'");
            }
        }
    }
    var query = "Select c.nroCAT, date_format(c.fechaEmision, '%d/%m/%Y %H:%i') as fechaEmision, " +
        "date_format(c.fechaInicio, '%d/%m/%Y') as fechaInicio, " +
        "date_format(c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, " +
        "date_format(c.fechaControlInicio, '%d/%m/%Y') as fechaControlInicio, " +
        "date_format(c.fechaControlFin, '%d/%m/%Y') as fechaControlFin, " +
        "c.conDeuda, " +
        "date_format(c.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, " +
        "se.Nombre as nombreSede, " +
        "if(pco.tipoPersona='J', pco.razonSocial, concat(pco.nombres,' ',pco.apellidoPaterno,' ',pco.apellidoMaterno)) as nombreConcesionario, " +
        "c.prima, " +
        "c.aporte, " +
        "c.comision, " +
        "a.idAsociado, " +
        "p.nroDocumento, " +
        "concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAsociado, " +
        "p.razonSocial, v.* , u.nombreUso, cl.nombreClase from Cat c " +
        "inner join Asociado a on c.idAsociado = a.idAsociado " +
        "inner join Persona p on a.idPersona = p.idPersona " +
        "inner join Concesionario co on c.idConcesionario = co.idConcesionario " +
        "inner join Persona pco on co.idPersona = pco.idPersona " +
        "inner join Local se on co.idSede = se.idLocal " +
        "inner join Vehiculo v on c.idVehiculo = v.idVehiculo " +
        "inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo " +
        "inner join Uso_Vehiculo u on ucv.idUso = u.idUso " +
        "inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase " + queryWhere.getQueryWhere() + " limit 950";

    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getCertificadosFactura = function (req, res, funcionName) {
    var queryWhere = new QueryWhere("");
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var idSede = req.query.idSede;

    if (idSede != "") {
        queryWhere.validarWhere("co.idSede=" + idSede);
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere("( c.fechaLiquidacion between '" + fechaDesde + "' and '" + fechaHasta + "' )");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere("c.fechaLiquidacion>='" + fechaDesde + "'");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere("c.fechaLiquidacion<='" + fechaHasta + "'");
            }
        }
    }
    var query = "Select c.nroCAT, " +
        "date_format(c.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, " +
        "se.Nombre as nombreSede, " +
        "a.idAsociado, " +
        "p.nroDocumento, p.tipoPersona," +
        "if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreAsociado, " +
        "d.nombre as distrito," +
        "p.calle, p.nro," +
        "c.prima, c.aporte, c.comision, " +
        "v.placa, v.marca, v.modelo, v.anno," +
        "u.nombreUso, cl.nombreClase " +
        "from Cat c " +
        "inner join Asociado a on c.idAsociado = a.idAsociado " +
        "inner join Persona p on a.idPersona = p.idPersona " +
        "inner join Distrito d on p.idDistrito = d.idDistrito " +
        "inner join Concesionario co on c.idConcesionario = co.idConcesionario " +
        "inner join Local se on co.idSede = se.idLocal " +
        "inner join Vehiculo v on c.idVehiculo = v.idVehiculo " +
        "inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo " +
        "inner join Uso_Vehiculo u on ucv.idUso = u.idUso " +
        "inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase " +
        queryWhere.getQueryWhere();
    //+" limit 950";

    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}

exports.buscarCertificado = function (req, res, funcionName) { // realiza la busqueda de un certificado
    var nroCertificado = req.query.nroCertificado;
    var liquidacionPendiente = req.query.liquidacionPendiente;
    var arrayParametros = [nroCertificado, nroCertificado, nroCertificado];
    if (liquidacionPendiente == 'true') { // realiza la busqueda de certificado distribuidos.
        var queryBusquedaCAT = "Select c.nroCertificado, m.tipOperacion, m.idGuiaSalida, c.estadoRegistroCAT as estado, " +
            " pr.idPromotor, gc.idConcesionario, gd.idArticulo, gd.Unidad, " +
            "pr.idConcesionarioPromotor " +
            "from Certificado c " +
            "inner join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento " +
            "left join Guia_movimiento_cabecera gc on gc.idGuia_movimiento_cabecera=m.idGuia " +
            "left join Guia_movimiento_cabecera g on g.idGuia_movimiento_cabecera=m.idGuiaSalida " +
            "left join Guia_movimiento_detalle gd on gd.idGuia_movimiento_cabecera=m.idGuiaSalida and (gd.nroCertificadoInicio<=? and gd.nroCertificadoFin>=?)" +
            "left join Promotor pr on pr.idUsuario=g.idUsuarioResp " +
            "where c.nroCertificado = ? and c.registroEstado='0'";
        ejecutarQUERY_MYSQL(queryBusquedaCAT, arrayParametros, res, funcionName);
    } else {
        // primero realiza la busqueda en la tabla CAT:
        var queryBusquedaCAT = "Select c.nroCAT as nroCertificado, 'CAT' as estado, c.placa, date_format(c.fechaEmision, '%d/%m/%Y %H:%i') as fechaEmision, " +
            "date_format(c.fechaInicio, '%d/%m/%Y') as fechaInicio, date_format(c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, " +
            "date_format(c.fechaControlInicio, '%d/%m/%Y') as fechaControlInicio, date_format(c.fechaControlFin, '%d/%m/%Y') as fechaControlFin, c.conDeuda, " +
            "date_format(c.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, c.idConcesionario, c.prima, c.aporte, c.comision, a.idAsociado, p.tipoPersona, " +
            "p.nroDocumento, c.idDeposito " +
            "from Cat c " +
            "inner join Asociado a on c.idAsociado = a.idAsociado " +
            "inner join Persona p on a.idPersona = p.idPersona where c.nroCAT = ? ";
        ejecutarQUERY_MYSQL(queryBusquedaCAT, arrayParametros, res, funcionName, function (res, resultados) {
            if (resultados.length == 0) {
                var nroCertificado = req.query.nroCertificado;
                var query = "Select c.nroCertificado, c.estadoCertificadoAntiguo as estado, m.estado as estadoMovimiento, m.idUbicacion as idConcesionario " +
                    "from Certificado c " +
                    "left join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento " +
                    "where c.nroCertificado = ? and c.registroEstado='0'";
                var arrayParametros = [nroCertificado];
                ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
            } else {
                enviarResponse(res, resultados); // envia los resultados del CAT encontrado
            }
        });
    }

}
exports.getPersonaByNroDoc = function (req, res, funcionName) {
    var nroDoc = req.query.nroDoc;
    var query = "call sp_getPersonaByNroDoc(?)";
    var arrayParametros = [nroDoc];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getConos = function (req, res, funcionName) {
    var query = "Select idLocal as idSede, Nombre as nombreSede from Local where estado='1' order by Nombre";
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAllUsos = function (req, res, funcionName) {
    var query = "Select idUso, nombreUso from Uso_Vehiculo order by nombreUso";
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getCategorias = function (req, res, funcionName) {
    var query = "Select idCategoria, nombreCategoria from Vehiculo_Categoria order by nombreCategoria";
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

exports.getAllClasesXuso = function (req, res, funcionName) {
    var query = "Select Distinct ucv.idUsoClaseVehiculo as idClase, cv.nombreClase, ucv.idUso, ucv.prima, ucv.montoPoliza from UsoClaseVehiculo ucv inner join Clase_Vehiculo cv on ucv.idClaseVehiculo = cv.idClase order by cv.nombreClase";
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.buscarPlaca = function (req, res, funcionName) {
    
    var placa = req.query.placa;
    //console.log("PLACABUSQUEDA", placa);

    var query = "Select v.idCategoria, v.idVehiculo, ucv.idUso, "+
                    " v.marca, v.modelo, v.anno, v.nroAsientos, v.nroSerieMotor, "+
                    " v.idUsoClaseVehiculo as idClase, v.VIENE_DE_SERVICIO, "+
                    " pv.tipopersona as tipoPersonaPropietario," +
                    " pv.tipodocumento as tipoDocumentoPropietario," +
                    " pv.nombres_razonsocial as nombreRazonSocial," +
                    " pv.apellido_paterno as apepat," +
                    " pv.apellido_materno," +
                    " pv.numerodocumento as numDocumentoPropietario," +
                    " pv.idpropietariovehiculo " +
                    " from Vehiculo v "+
                    " inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo "+
                    " left join propietario_vehiculo pv on v.idVehiculo = pv.idvehiculo " +
                    " where v.placa = ? ";
    var arrayParametros = [placa];
    //console.log("query", query);
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

exports.actualizarCAT = function (req, res, funcionName) {
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
    var idCategoria = req.query.idCategoria;
    var idUso = req.query.idUso;
    var idClase = req.query.idClase;
    var marca = req.query.marca;
    var anno = req.query.anno;
    var serieMotor = req.query.serieMotor;
    var nroDocIsServicio = req.query.nroDocIsServicio;
    var vehiculoVieneDeServicio = req.query.isServiceSUNARP; 
    //propietario
    var idPropietarioVehiculo = req.query.idpropietariovehiculo;
    var tipoPersonaPropietario = req.query.tipoPersonaPropietario;
    var tipoDocumentoPropietario = req.query.tipoDocumentoPropietario;
    var numDocumentoPropietario = req.query.numDocumentoPropietario;
    var nombresPropietario = req.query.nombresPropietario;
    var apepatPropietario = req.query.apepatPropietario;
    var apematPropietario = req.query.apematPropietario;
    var vistaEnvio =  req.query.vistaRegistro;
    console.log("--VISTA DESDE DONDE SE REGISTRA--");
    console.log(vistaEnvio);
    console.log("DATOS QUE ENVIA");
    console.log(req.query);

    // guarda o actualiza la personalbar
    var persona = {};
    persona.idPersona = idPersona;
    persona.tipoPersona = tipoPersona;
    persona.nombres = nombres;
    persona.paterno = apePat;
    persona.materno = apeMat;
    persona.razonSocial = razonSocial;
    persona.DNI = DNI;
    persona.telf = telf;
    persona.idDistrito = idDistrito;
    persona.direccion = direccion;
    persona.viene_de_servicio = nroDocIsServicio;
    
    //objeto de propietario
    var propietario = {};

    propietario.idpropietariovehiculo = Number(idPropietarioVehiculo);
    propietario.tipopersona = tipoPersonaPropietario;
    propietario.tipodocumento = tipoDocumentoPropietario;
    propietario.numerodocumento = numDocumentoPropietario;
    propietario.nombres = nombresPropietario;
    propietario.apepat = apepatPropietario;
    propietario.apemat = apematPropietario;
    //
    if(!propietario.numerodocumento || anno == ''){
        console.log("entre al error de undefined");
        console.log(req.query);
        console.log("----");
        res.send([-999]);
        return false;
    }
    abstractGuardarActualizarPersona(res, funcionName, persona, function (idPersona_Asociado) {
        // guarda el asociado:
        var query = "update Asociado set idPersona=? where idAsociado=?";
        var parametros = [idPersona_Asociado, req.query.idAsociado];
        ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, resultados) {

            // guarda o actualiza un vehiculo
            var vehiculo = {};
            vehiculo.idCategoria = req.query.idCategoria;
            vehiculo.idVehiculo = req.query.idVehiculo;
            vehiculo.placa = req.query.placa;
            vehiculo.idClase = req.query.idClase;
            vehiculo.idUso = req.query.idUso;
            vehiculo.marca = req.query.marca;
            vehiculo.modelo = req.query.modelo;
            vehiculo.anno = req.query.anno;
            vehiculo.nroSerieMotor = req.query.serieMotor;
            vehiculo.nroAsientos = req.query.nroAsientos;
            vehiculo.viene_de_servicio = vehiculoVieneDeServicio;

            abstractGuardarActualizarVehiculo(res, funcionName, vehiculo, propietario, function (idVehiculo_CAT) {
                // actualiza el cat
                var idUsuarioUpdate = req.query.idUsuarioUpdate;
                //09/04/2019 *** OJO*** el tipoPersona siempre debe coincidir, posterior facturacion
                var queryInsertCat = "Update Cat set placa=?, marca=?, modelo=?, annoFabricacion=?, nMotorserie=?, fechaInicio=?, fechaCaducidad=?, " +
                    "idConcesionario=?, fechaEmision=?, fechaControlInicio=?, fechaControlFin=?, idVehiculo=?, conDeuda=?, fechaLiquidacion=?, prima=?, " +
                    "comision=?, aporte=?, ultActualizaFecha=now(), ultActualizaUsuario=?, tipoPersona=? " +
                    "where nroCAT=? ";

                var parametros = [req.query.placa, req.query.marca, req.query.modelo, req.query.anno, req.query.serieMotor, req.query.fechaV_inicio,
                req.query.fechaV_fin, req.query.idConcesionario, req.query.fechaEmision, req.query.fechaCP_inicio, req.query.fechaCP_fin,
                    idVehiculo_CAT, req.query.conDeuda, req.query.fechaLiquidacion, req.query.prima, req.query.comision, req.query.aporte,
                    idUsuarioUpdate, req.query.tipoPersona, req.query.nroCertificado];

                ejecutarQUERY_MYSQL(queryInsertCat, parametros, res, funcionName, "affectedRows");
            });
        });
    });
}
exports.anularCAT = function (req, res, funcionName) {
    console.log("anular CAT");
    console.log(req.query);
    //
    var nroCertificado = req.query.nroCertificado;
    var queryDelete = "Delete from Cat_anulados where nroCAT = ?";
    var params = [nroCertificado]
    ejecutarQUERY_MYSQL(queryDelete, params, res, funcionName, function (res, resultados) {
        // copia los datos del cat a la tabla Cat_anulados.
        var queryInsert = "Insert into Cat_anulados select * from Cat where nroCAT = ?";
        var params = [req.query.nroCertificado];
        ejecutarQUERY_MYSQL(queryInsert, params, res, funcionName, function (res, resultados) {
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



exports.registraactualizaPropietario = function (req, res, funcionName) {
   
    //
    //propietario
    var tipoPersonaPropietario = req.query.tipoPersonaPropietario;
    var tipoDocumentoPropietario = req.query.tipoDocumentoPropietario;
    var numDocumentoPropietario = req.query.numDocumentoPropietario;
    var nombresPropietario = req.query.nombresPropietario;
    var apepatPropietario = req.query.apepatPropietario;
    var apematPropietario = req.query.apematPropietario;
    var idPropietario = req.query.idpropietario;

    //
    var queryInsert = "Insert into propietario_vehiculo (tipoPersona, razonSocial, nombres, apellidoPaterno, apellidoMaterno, nroDocumento, idDistrito, calle, telefonoMovil) values (?,?,?,?,?,?,?,?,?)";
    var queryUpdate = "Update Persona set tipoPersona=?, razonSocial=?, nombres = ?, apellidoPaterno = ?, apellidoMaterno = ? , idDistrito=?, calle = ?, telefonoMovil=?, VIENE_DE_SERVICIO=? where idPersona = ? ";

    if (persona.idPersona == 0) { // se registra una nueva persona
        ejecutarQUERY_MYSQL(queryInsert, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.paterno, persona.materno, persona.DNI, persona.idDistrito, persona.direccion, persona.telf], res, funcionName, function (res, resultados) {
            if (typeof callback == 'function') {
                var idPersona = resultados.insertId;
                persona.idPersona = idPersona;
                callback(idPersona); // Devuelve el id de la Persona registrada
            }
        });
    } else { // solo se actualizara el registro de la persona
        ejecutarQUERY_MYSQL(queryUpdate, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.paterno, persona.materno, persona.idDistrito, persona.direccion, persona.telf,persona.viene_de_servicio, persona.idPersona], res, funcionName, function (res, resultados) {
            if (typeof callback == 'function') {
                callback(persona.idPersona); // Devuelve el id de la persona actualizada
            }
        });
    }

}

exports.consulta_placa_api= function(req, respuesta){


    var placaBusqueda = req.query.placa.toUpperCase();
    var urlConsulta = "http://sistemas.atu.gob.pe/ATUTAXIService/TaxiConductorService/consultaDatosPlacaSNRP/?placa=" +placaBusqueda 

    request.post(urlConsulta, { json: {} }, (error, response, body) => {

        var jsonRespuesta = {
            codResultado : 0,
            placa : placaBusqueda,
            marca : '',
            modelo : '',
            anio : 0,
            nroSerieMotor : '',
            asientos : 0,
            propietarios : []
        }

        if (!error) { //error

            if(response.body.Success){ //trajo data
                jsonRespuesta.codResultado = 1;
                jsonRespuesta.marca = response.body.Marca;
                jsonRespuesta.modelo = response.body.Modelo;
                jsonRespuesta.anio = response.body.AnioFabricacion;
                jsonRespuesta.nroSerieMotor = response.body.Nro_Motor;
                jsonRespuesta.asientos = response.body.NumeroAsiento;
                jsonRespuesta.propietarios = response.body.LPropietario;
            }else{
                jsonRespuesta.codResultado = 0;
            }
           
        }

        respuesta.send(jsonRespuesta);


    });
  
    // Enviamos el objeto JSON como respuesta

}

exports.consulta_dni_empresa_servicio = function(req, respuesta){

    var tipodocumento = req.query.tipopersona.toUpperCase(); 
    var nrodocumento = req.query.nrodocumento.toUpperCase();
    var urlBaseConsulta = "";
    var urlConsulta = "";
    //
    if(tipodocumento == "N"){
        urlBaseConsulta = "http://192.140.56.112/servicioconsultas/api/ConsultaDNI/";
    }
    
    if(tipodocumento == "J"){
        urlBaseConsulta = "http://192.140.56.112/servicioconsultas/api/ConsultaRUC/";
    }
    urlConsulta = urlBaseConsulta + nrodocumento;
 
    request.get(urlConsulta, { json: {} }, (error, response, body) => {

        
        var jsonRespuesta = {
            codResultado : 0,
            nombres : "",
            nrodocumento : nrodocumento,
            apepat : "",
            apemat : ""
        }

/*
        console.log("---------------------")
        console.log("response");
        console.log(response);

        console.log("error");
        console.log(error);

        console.log("---------------------")
    */
        if (!error) { //error
            //console.log("response success");

           // const objetoJSON = JSON.parse(response.body);

           // console.log(objetoJSON)
            //console.log(response.body.data.nombres);

            if(response.body.hasOwnProperty('success')){ //trajo data

                if(response.body.success){
                    jsonRespuesta.codResultado = 1;
                    if(tipodocumento == "N"){ //natural
                        jsonRespuesta.nombres = response.body.data.nombres;
                        jsonRespuesta.apepat = response.body.data.apellido_paterno;
                        jsonRespuesta.apemat = response.body.data.apellido_materno;
                    }else{ //juridica
                        jsonRespuesta.nombres = response.body.data.nombre_o_razon_social;
                    }
                }else{
                    jsonRespuesta.codResultado = 0;

                }
               
            }else{
                jsonRespuesta.codResultado = 0;
            }
           
        }


        respuesta.send(jsonRespuesta);


    });
  
    // Enviamos el objeto JSON como respuesta

}


exports.migra_registro = function (req, respuesta, funcionName) {
    //
    var cat = req.query.nroCertificado;
    var query = 'call spw_obtener_datos_cat(?);'
    var arrayParametros = [cat];

    ejecutarQUERY_MYSQL(query, arrayParametros, respuesta, funcionName,function(res, resultadoBD){
        
        //respuesta.send("hola soy el rest")
        //enviando al servicio
        var idUsuario = 8; //devAutoseguro
        var placaMigra = resultadoBD[0]["placa"];
        var nombreCompania = resultadoBD[0]["nombreCompania"];
        var nroCertificado = resultadoBD[0]["nroCertificado"];
        var fechaEmision = resultadoBD[0]["fechaEmision"];
        var fechaVencimiento = resultadoBD[0]["fechaVencimiento"];
        var nombreModalidad = resultadoBD[0]["nombreModalidad"];
        var nombreClase = resultadoBD[0]["nombreClase"];
        var nombreCertificadoTipo = resultadoBD[0]["nombreCertificadoTipo"];
        var nombreAmbito = resultadoBD[0]["ambito"];
        var nombreEstado = resultadoBD[0]["nombreEstado"];
        var tipoDocumento = resultadoBD[0]["tipoDocumento"];
        var numeroDocumento = resultadoBD[0]["numeroDocumento"];
        var nombreContratante = resultadoBD[0]["nombreContratante"];
        var fechaCreacion = resultadoBD[0]["fechaCreacion"];
        var fechaVigenciaPNPIni = resultadoBD[0]["fechaVigenciaPNPIni"];
        var fechaVigenciaPNPFin = resultadoBD[0]["fechaVigenciaPNPFin"];

        //console.log("placa migra", placaMigra);

        const url = 'http://servicioBK.fenap.pe/api/afocat/registro';
        const data = {
          "idusuario": idUsuario,
          //"idusuario": "pppopopo",
          "placa": placaMigra,
          "nombreCompania": nombreCompania,
          "nroCertificado": nroCertificado,
          "fechaEmision": fechaEmision,
          "fechaVencimiento": fechaVencimiento,
          "nombreModalidad": nombreModalidad,
          "nombreClase": nombreClase,
          "nombreCertificadoTipo": nombreCertificadoTipo,
          "nombreAmbito": nombreAmbito,
          "nombreEstado": nombreEstado,
          "tipoDocumento": tipoDocumento,
          "numeroDocumento": numeroDocumento,
          "nombreContratante": nombreContratante,
          "fechaCreacion": fechaCreacion,
          "fechaVigenciaPNPIni": fechaVigenciaPNPIni,
          "fechaVigenciaPNPFin": fechaVigenciaPNPFin
        };

        console.log("data migra app");
        console.log(data);
        /*********************************************/
        var queryInserta = "call spw_certificado_no_migro_guardar("+
        " '"+ placaMigra + "','"+ nombreCompania+"','"+nroCertificado+"','"+ fechaEmision +"',"+
        " '"+ fechaVencimiento +"','"+ nombreModalidad+"','"+ nombreClase+"','"+ nombreCertificadoTipo+"',"+
        " '"+ nombreAmbito+"','"+ nombreEstado+"','"+tipoDocumento+"','"+ numeroDocumento+"','"+ nombreContratante+"' "+
        ",'"+ fechaCreacion+"','"+ fechaVigenciaPNPIni+"','"+ fechaVigenciaPNPFin+"','REGISTRAR','Error en registro de cerfificados vendidos',0);"
    
        //
        request.post(url, { json: data }, (error, response, body) => {
            //console.log("response  envio aplicativo")

           
          
            if (error) {
                console.error('Error al realizar la solicitud registra :', error.message);
                var queryInserta = "call spw_certificado_no_migro_guardar("+
                " '"+ placaMigra + "','"+ nombreCompania+"','"+nroCertificado+"','"+ fechaEmision +"',"+
                " '"+ fechaVencimiento +"','"+ nombreModalidad+"','"+ nombreClase+"','"+ nombreCertificadoTipo+"',"+
                " '"+ nombreAmbito+"','"+ nombreEstado+"','"+tipoDocumento+"','"+ numeroDocumento+"','"+ nombreContratante+"' "+
                ",'"+ fechaCreacion+"','"+ fechaVigenciaPNPIni+"','"+ fechaVigenciaPNPFin+"','REGISTRAR','ERROR"+ error.message +"',0);"
    
                ejecutarQUERY_MYSQL(queryInserta, [], respuesta, funcionName); //aqui guarda cuando ocurre un error en el insert into
                //respuesta.send(error.message);
            }else{
                console.log('Respuesta del servidor:', body);
                var codigoAuxiliar = Number(body.codresultado);
                if(codigoAuxiliar == 0){
                    var queryInserta = "call spw_certificado_no_migro_guardar("+
                    " '"+ placaMigra + "','"+ nombreCompania+"','"+nroCertificado+"','"+ fechaEmision +"',"+
                    " '"+ fechaVencimiento +"','"+ nombreModalidad+"','"+ nombreClase+"','"+ nombreCertificadoTipo+"',"+
                    " '"+ nombreAmbito+"','"+ nombreEstado+"','"+tipoDocumento+"','"+ numeroDocumento+"','"+ nombreContratante+"' "+
                    ",'"+ fechaCreacion+"','"+ fechaVigenciaPNPIni+"','"+ fechaVigenciaPNPFin+"','REGISTRAR','Error en registro de cerfificados vendidos',0);"
                    //
                    ejecutarQUERY_MYSQL(queryInserta, [], respuesta, funcionName); //aqui guarda cuando ocurre un error en el insert into
                }
            }


            
        });
      

        /*
        axios.post(url, data)
          .then(response => {
            console.log('Respuesta del servidor:', response.data);
            var codigoAuxiliar = Number(response.data.auxiliar); 
            if(codigoAuxiliar == 0){
                var queryInserta = "call spw_certificado_no_migro_guardar("+
                " '"+ placaMigra + "','"+ nombreCompania+"','"+nroCertificado+"','"+ fechaEmision +"',"+
                " '"+ fechaVencimiento +"','"+ nombreModalidad+"','"+ nombreClase+"','"+ nombreCertificadoTipo+"',"+
                " '"+ nombreAmbito+"','"+ nombreEstado+"','"+tipoDocumento+"','"+ numeroDocumento+"','"+ nombreContratante+"' "+
                ",'"+ fechaCreacion+"','"+ fechaVigenciaPNPIni+"','"+ fechaVigenciaPNPFin+"','REGISTRAR','Error en registro de cerfificados vendidos',0);"
                //
                ejecutarQUERY_MYSQL(queryInserta, [], respuesta, funcionName); //aqui guarda cuando ocurre un error en el insert into
            }
            //respuesta.send(response.data);
          })
          .catch(error => {
            console.error('Error al realizar la solicitud:', error.message);
            var queryInserta = "call spw_certificado_no_migro_guardar("+
            " '"+ placaMigra + "','"+ nombreCompania+"','"+nroCertificado+"','"+ fechaEmision +"',"+
            " '"+ fechaVencimiento +"','"+ nombreModalidad+"','"+ nombreClase+"','"+ nombreCertificadoTipo+"',"+
            " '"+ nombreAmbito+"','"+ nombreEstado+"','"+tipoDocumento+"','"+ numeroDocumento+"','"+ nombreContratante+"' "+
            ",'"+ fechaCreacion+"','"+ fechaVigenciaPNPIni+"','"+ fechaVigenciaPNPFin+"','REGISTRAR','ERROR"+ error.message +"',0);"

            ejecutarQUERY_MYSQL(queryInserta, [], respuesta, funcionName); //aqui guarda cuando ocurre un error en el insert into
            //respuesta.send(error.message);
        });
        */
    });

    // var query = "Select Distinct ucv.idUsoClaseVehiculo as idClase, cv.nombreClase, ucv.idUso, ucv.prima, ucv.montoPoliza from UsoClaseVehiculo ucv inner join Clase_Vehiculo cv on ucv.idClaseVehiculo = cv.idClase order by cv.nombreClase";
    // var arrayParametros = [];
    // ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);

    //res.send("hola soy el res");
}

exports.migra_liberacion = function (req, respuesta, funcionName) {
    console.log("migra liberacion");
    //
    var placaMigra = req.query.placa;
  
    console.log("ANULACION");
    //console.log("placa:", placaMigra);
    const url = 'http://servicioBK.fenap.pe/api/afocat/liberar';
    const data = {
      "placa": placaMigra
    };
    
    request.post(url, { json: data }, (error, response, body) => {
    if (error) {
        console.error('Error MIGRACION :', error);
        var queryInsertaLiberacion = "call spw_certificado_no_migro_guardar("+
        " '"+ placaMigra + "','-','-','-',"+
        " '-','-','-','-',"+
        " '-','-','-','-','-' "+
        ",'-','-','-','LIBERAR','Error: "+ error.message +"',0);"
        //
        ejecutarQUERY_MYSQL(queryInsertaLiberacion, [], respuesta, funcionName); //aqui guarda cuando ocurre un error en el insert into
        //return;
    }else{
        //
        var codResultado = Number(body.codresultado); 
        var desResultado = body.desresultado;
        //
        //console.log('codResultado:', codResultado);
        console.log('Respuesta del servidor:', body);
        //
        if(codResultado == 0){ //si no se registró bien en la migración entonces inserta en los pendientes a enviar
                
            var queryInsertaLibera = "call spw_certificado_no_migro_guardar("+
            " '"+ placaMigra + "','-','-','-',"+
            " '-','-','-','-',"+
            " '-','-','-','-','-' "+
            ",'-','-','-','LIBERAR','Error en registro de liberacion',0);"
            //
            ejecutarQUERY_MYSQL(queryInsertaLibera, [], respuesta, funcionName); //aqui guarda cuando ocurre un error en el insert into
        
        }
    }


    });


    /*
    axios.post(url, data)
      .then(response => {
        console.log('Respuesta libera:', response.data);
        var codResultado = Number(response.data.codresultado); 
        console.log("cod reusiltado anula", codResultado);
        if(codResultado == 0){ //si no se registró bien en la migración entonces inserta en los pendientes a enviar
            
            var queryInsertaLibera = "call spw_certificado_no_migro_guardar("+
            " '"+ placaMigra + "','-','-','-',"+
            " '-','-','-','-',"+
            " '-','-','-','-','-' "+
            ",'-','-','-','LIBERAR','Error en registro de liberacion',0);"
            //
            ejecutarQUERY_MYSQL(queryInsertaLibera, [], respuesta, funcionName); //aqui guarda cuando ocurre un error en el insert into
        
        }
        //respuesta.send(response.data);
      })
      .catch(error => {
        console.error('Error al realizar la solicitud de liberacion:', error.message);
        var queryInsertaLiberacion = "call spw_certificado_no_migro_guardar("+
        " '"+ placaMigra + "','-','-','-',"+
        " '-','-','-','-',"+
        " '-','-','-','-','-' "+
        ",'-','-','-','LIBERAR','Error: "+ error.message +"',0);"
        //
        ejecutarQUERY_MYSQL(queryInsertaLiberacion, [], respuesta, funcionName); //aqui guarda cuando ocurre un error en el insert into
    
        //respuesta.send(error.message);
    });
     
    */
}


exports.guardarCAT = function (req, res, funcionName) {

 
    var idPromotor = 0;
    if (req.query.idPromotor != undefined) {
        idPromotor = req.query.idPromotor
    }
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
    var idCategoria = req.query.idCategoria;
    var idUso = req.query.idUso;
    var idClase = req.query.idClase;
    var marca = req.query.marca;
    var anno = req.query.anno;
    var serieMotor = req.query.serieMotor;
    var nroDocIsServicio = req.query.nroDocIsServicio;
    var vehiculoVieneDeServicio = req.query.isServiceSUNARP; 

    //propietario
    var idPropietarioVehiculo = req.query.idpropietariovehiculo;
    var tipoPersonaPropietario = req.query.tipoPersonaPropietario;
    var tipoDocumentoPropietario = req.query.tipoDocumentoPropietario;
    var numDocumentoPropietario = req.query.numDocumentoPropietario;
    var nombresPropietario = req.query.nombresPropietario;
    var apepatPropietario = req.query.apepatPropietario;
    var apematPropietario = req.query.apematPropietario;

    var vistaEnvio =  req.query.vistaRegistro;
    console.log("--VISTA DESDE DONDE SE REGISTRA--");
    console.log(vistaEnvio);
    // guarda o actualiza la personalbar
    var persona = {};
    persona.idPersona = idPersona;
    persona.tipoPersona = tipoPersona;
    persona.nombres = nombres;
    persona.paterno = apePat;
    persona.materno = apeMat;
    persona.razonSocial = razonSocial;
    persona.DNI = DNI;
    persona.telf = telf;
    persona.idDistrito = idDistrito;
    persona.direccion = direccion;
    persona.viene_de_servicio = nroDocIsServicio;
    //objeto de propietario
    var propietario = {};

    propietario.idpropietariovehiculo = Number(idPropietarioVehiculo);
    propietario.tipopersona = tipoPersonaPropietario;
    propietario.tipodocumento = tipoDocumentoPropietario;
    propietario.numerodocumento = numDocumentoPropietario;
    propietario.nombres = nombresPropietario;
    propietario.apepat = apepatPropietario;
    propietario.apemat = apematPropietario;
    //
 
    //verifica si existe parametros
    if(!propietario.numerodocumento || anno == ''){
        console.log("entre al error de undefined");
        //console.log(propietario);
        console.log("---request---");
        console.log(req.query);
        console.log("----");
        res.send([-999]);
        return false;
    }

    // guarda o se actualiza una persona, el ID de la Persona es retornada en la funcion callback (idPersona_Asociado)
    abstractGuardarActualizarPersona(res, funcionName, persona,
        function (idPersona_Asociado) {
            // guarda el asociado:
            var query = "Insert into Asociado (idPersona) values (?)";
            var parametros = [idPersona_Asociado];
            ejecutarQUERY_MYSQL(query, parametros, res, funcionName,
                function (res, resultados) {
                    var idAsociado = resultados.insertId; // obtiene el id del asociado registrado
                    req.query.idAsociado = idAsociado;
                    // guarda o actualiza un vehiculo
                    var vehiculo = {};
                    vehiculo.idVehiculo = req.query.idVehiculo;
                    vehiculo.placa = req.query.placa;
                    vehiculo.idClase = req.query.idClase;
                    vehiculo.idCategoria = req.query.idCategoria;
                    vehiculo.idUso = req.query.idUso;
                    vehiculo.marca = req.query.marca;
                    vehiculo.modelo = req.query.modelo;
                    vehiculo.anno = req.query.anno;
                    vehiculo.nroSerieMotor = req.query.serieMotor;
                    vehiculo.nroAsientos = req.query.nroAsientos;
                    vehiculo.viene_de_servicio = vehiculoVieneDeServicio;

                    // guarda o se actualiza el vehiculo, el ID del vehiculo es retornado en la funcion callback (idVehiculo_CAT)
                    abstractGuardarActualizarVehiculo(res, funcionName, vehiculo,propietario,
                        function (idVehiculo_CAT) {
                           
                            // guarda el cat
                            //09/04/2019 ***Debe guardar tipoPersona*** posterior facturacion
                            // var queryInsertCat = "Insert into Cat (nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, fechaInicio, " +
                            //    "fechaCaducidad, idConcesionario, fechaEmision, fechaControlInicio, fechaControlFin, idVehiculo, conDeuda, fechaLiquidacion, " +
                            //    "prima, comision, aporte) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                            var queryInsertCat = "Insert into Cat (nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, fechaInicio, " +
                                "fechaCaducidad, idConcesionario, fechaEmision, fechaControlInicio, fechaControlFin, idVehiculo, conDeuda, fechaLiquidacion, " +
                                "prima, comision, aporte, tipoPersona, idPromotor) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,"+ (req.query.fechaLiquidacion ? "'" + req.query.fechaLiquidacion + "'" : "NULL")+",?,?,?,?,?)";
                            var parametros = [req.query.nroCertificado, req.query.idAsociado, req.query.placa, req.query.marca, req.query.modelo, req.query.anno,
                            req.query.serieMotor, req.query.fechaV_inicio, req.query.fechaV_fin, req.query.idConcesionario, req.query.fechaEmision,
                            req.query.fechaCP_inicio, req.query.fechaCP_fin, idVehiculo_CAT, req.query.conDeuda, req.query.prima,
                            req.query.comision, req.query.aporte, req.query.tipoPersona, idPromotor];

                            ejecutarQUERY_MYSQL(queryInsertCat, parametros, res, funcionName,
                                function (res, results) {
                                    var affectedRows = [results.affectedRows];
                                    enviarResponse(res, affectedRows);// envia como respuesta al cliente el numero de filas afectadas
                                    // actualiza el estado del certificado.
                                    var liquidacionPendiente = req.query.liquidacionPendiente;
                                    var estado = '9';
                                    if (liquidacionPendiente == 'true') {
                                        estado = '8'; // Certificado con liquidacion pendiente por registrar.
                                    }
                                    var idUsuario = req.query.idUsuarioUpdate;
                                    var nroCertificado = req.query.nroCertificado;
                                    var updateCertificado = "Update Certificado set estadoRegistroCAT = ?, ultActualizaUsuario = ?, ultActualizaFecha = now() where nroCertificado=? and registroEstado='0'"; // cambia el estado del certificado a vendido
                                    var params = [estado, idUsuario, nroCertificado];
                                    ejecutarQUERY_MYSQL(updateCertificado, params, res, funcionName,"false");
                                });
                        });
                });
        });
}
function abstractGuardarActualizarVehiculo(res, funcionName, vehiculo, objPropietario, callback) { // Guarda o actualiza un vehiculo
    console.log("datos vehiculo antes del guardar");
    console.log(vehiculo);

    console.log("propietario");
    console.log(objPropietario);
    var queryInsert = "Insert into Vehiculo (placa, idCategoria,idUsoClaseVehiculo, marca, modelo, anno, nroSerieMotor, nroAsientos,VIENE_DE_SERVICIO) values (?,?,?,?,?,?,?,?,?)";
    var queryUpdate = "Update Vehiculo set idCategoria=?,idUsoClaseVehiculo=?, marca=?, modelo=?, anno=?, nroSerieMotor=?, nroAsientos=?,VIENE_DE_SERVICIO=? where idVehiculo=?";
    //
    var queryPropietarioAccion = "";
    //

    //
    if (vehiculo.idVehiculo == 0) { // Vehiculo  no existe, por lo tanto se registra uno nuevo
        ejecutarQUERY_MYSQL(queryInsert, [vehiculo.placa, vehiculo.idCategoria, vehiculo.idClase, vehiculo.marca, vehiculo.modelo, vehiculo.anno, vehiculo.nroSerieMotor, vehiculo.nroAsientos, vehiculo.viene_de_servicio], res, funcionName, function (res, resultados) {
            if (typeof callback == 'function') {
                var idVehiculo = resultados.insertId;
                vehiculo.idVehiculo = idVehiculo;

                //si interta el vehiculo entonces registro el propietario
                var idPropietarioVehiculo = Number(objPropietario.idpropietariovehiculo);
                //console.log("ID PROPIETARIO ANTES DE GUARDAR")
                //console.log(idPropietarioVehiculo);
                if(idPropietarioVehiculo > 0){ //si es mayor que cero entonces actualiza
                    queryPropietarioAccion = "update propietario_vehiculo "+
                                             " set idvehiculo = "+ idVehiculo +", "+
                                             " tipopersona = '"+ objPropietario.tipopersona +"', "+
                                             " tipodocumento = '"+ objPropietario.tipodocumento+"', "+
                                             " numerodocumento ='"+ objPropietario.numerodocumento +"', "+
                                             " nombres_razonsocial = '"+ objPropietario.nombres+"',"+
                                             " apellido_paterno = '"+ objPropietario.apepat+"',"+
                                             " apellido_materno = '"+ objPropietario.apemat+"', "+
                                             " fechamodificacion = NOW() "+
                                             " where idpropietariovehiculo = " + objPropietario.idpropietariovehiculo + ";";
                }

                if(idPropietarioVehiculo == 0){
                    queryPropietarioAccion = "INSERT INTO propietario_vehiculo( idvehiculo, tipopersona, tipodocumento, numerodocumento, nombres_razonsocial, apellido_paterno, apellido_materno, idEstado, fechacreacion) "+
                    " VALUES( "+ idVehiculo +", '"+ objPropietario.tipopersona+"', "+
                    " '"+ objPropietario.tipodocumento+"', '"+ objPropietario.numerodocumento+"', "+
                    " '"+objPropietario.nombres+"', '"+ objPropietario.apepat+"', "+
                    " '"+ objPropietario.apemat +"', 1, NOW());";
                }
                
                //console.log("query propietario guarda");
                //console.log(queryPropietarioAccion)
                ejecutarQUERY_MYSQL(queryPropietarioAccion, [], res, funcionName, "false");

                callback(idVehiculo); // Devuelve el id del vehiculo registrado en la funcion callback
            }
        });
    } else {
        
        ejecutarQUERY_MYSQL(queryUpdate, [vehiculo.idCategoria, vehiculo.idClase, vehiculo.marca, vehiculo.modelo, vehiculo.anno, vehiculo.nroSerieMotor, vehiculo.nroAsientos,vehiculo.viene_de_servicio, vehiculo.idVehiculo], res, funcionName, function (res, resultados) {
            var idPropietarioVehiculo = Number(objPropietario.idpropietariovehiculo);

            if (typeof callback == 'function') {

                //si interta el vehiculo entonces registro el propietario

                if(idPropietarioVehiculo > 0){ //si es mayor que cero entonces actualiza
                    queryPropietarioAccion = "update propietario_vehiculo "+
                                                " set idvehiculo = "+ vehiculo.idVehiculo +", "+
                                                " tipopersona = '"+ objPropietario.tipopersona +"', "+
                                                " tipodocumento = '"+ objPropietario.tipodocumento+"', "+
                                                " numerodocumento ='"+ objPropietario.numerodocumento +"', "+
                                                " nombres_razonsocial = '"+ objPropietario.nombres+"',"+
                                                " apellido_paterno = '"+ objPropietario.apepat+"',"+
                                                " apellido_materno = '"+ objPropietario.apemat+"', "+
                                                " fechamodificacion = NOW() "+
                                                " where idpropietariovehiculo = " + objPropietario.idpropietariovehiculo + ";";
                }

                if(objPropietario.idpropietariovehiculo == 0){
                    queryPropietarioAccion = "INSERT INTO propietario_vehiculo( idvehiculo, tipopersona, tipodocumento, numerodocumento, nombres_razonsocial, apellido_paterno, apellido_materno, idEstado, fechacreacion) "+
                    " VALUES( "+ vehiculo.idVehiculo +", '"+ objPropietario.tipopersona+"', "+
                    " '"+ objPropietario.tipodocumento+"', '"+ objPropietario.numerodocumento+"', "+
                    " '"+objPropietario.nombres+"', '"+ objPropietario.apepat+"', "+
                    " '"+ objPropietario.apemat +"', 1, NOW());";
                }
                
                //console.log("PROPIETARIO ACCION QUERY");
                //console.log(queryPropietarioAccion);
                //
                ejecutarQUERY_MYSQL(queryPropietarioAccion, [], res, funcionName, "false");
                

                callback(vehiculo.idVehiculo); // Devuelve el id del vehiculo actualizado en la funcion callback
            }
        });
    }
}
function abstractGuardarActualizarPersona(res, funcionName, persona, callback) { // Guarda o actualiza una Persona

    var queryInsert = "Insert into Persona (tipoPersona, razonSocial, nombres, apellidoPaterno, apellidoMaterno, nroDocumento, idDistrito, calle, telefonoMovil) values (?,?,?,?,?,?,?,?,?)";
    var queryUpdate = "Update Persona set tipoPersona=?, razonSocial=?, nombres = ?, apellidoPaterno = ?, apellidoMaterno = ? , idDistrito=?, calle = ?, telefonoMovil=?, VIENE_DE_SERVICIO=? where idPersona = ? ";

    if (persona.idPersona == 0) { // se registra una nueva persona
        ejecutarQUERY_MYSQL(queryInsert, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.paterno, persona.materno, persona.DNI, persona.idDistrito, persona.direccion, persona.telf], res, funcionName, function (res, resultados) {
            if (typeof callback == 'function') {
                var idPersona = resultados.insertId;
                persona.idPersona = idPersona;
                callback(idPersona); // Devuelve el id de la Persona registrada
            }
        });
    } else { // solo se actualizara el registro de la persona
        ejecutarQUERY_MYSQL(queryUpdate, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.paterno, persona.materno, persona.idDistrito, persona.direccion, persona.telf,persona.viene_de_servicio, persona.idPersona], res, funcionName, function (res, resultados) {
            if (typeof callback == 'function') {
                callback(persona.idPersona); // Devuelve el id de la persona actualizada
            }
        });
    }
}

exports.getAllDistritos = function (req, res, funcionName) {
    ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllDistritos");
}
exports.getAllProvincias = function (req, res, funcionName) {
    ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllProvincias");
}
exports.getAllDepartamentos = function (req, res, funcionName) {
    ExecuteSelectPROCEDUREsinParametros(res, funcionName, "sp_getAllDepartamentos");
}
/** CUS 04: AS-VTAS_CU_004 **/
exports.getLocales = function (req, res, funcionName) {
    var query = "Select idLocal, Nombre as nombreLocal from Local where estado='1' order by Nombre";
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAlmacenes = function (req, res, funcionName) {
    var query = "Select idAlmacen, idLocal, nombre as nombreAlmacen, nombreBreve from Almacen order by nombre, nombreBreve";
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getListaGuias = function (req, res, funcionName) { // Obtiene las guías de ingreso (ING) y de salida (SAL).
    // Parametros GET:
    var tipo = req.query.tipo; // Tipo de Guia: ING=Ingreso; SAL=Salida 
    var queryWhere = new QueryWhere(" where g.tipoOperacion='" + tipo + "' and g.registroEstado = '0' "); // agrega el filtro de tipo de Guia
    var idAlmacen = req.query.idAlmacen;
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var conjutoAlmacenes = req.query.conjutoAlmacenes;

    if (idAlmacen != "") {
        queryWhere.validarWhere("a.idAlmacen=" + idAlmacen);
    } else {
        // verifica que solo se filtren los almacenes correctos
        if (conjutoAlmacenes != "") {
            queryWhere.validarWhere("a.idAlmacen in (" + conjutoAlmacenes + ") ");
        }
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere("( g.fechaOperacion between '" + fechaDesde + "' and '" + fechaHasta + "' )");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere("g.fechaOperacion>='" + fechaDesde + "'");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere("g.fechaOperacion<='" + fechaHasta + "'");
            }
        }
    }
    var query = "select g.idGuia_movimiento_cabecera as idGuia, g.idAlmacen, g.idProveedor, if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno))  as nombreProveedor, g.nroGuiaManual as nroGuia, " +
        "date_format(g.fechaOperacion, '%d/%m/%Y') as fechaRegistro, g.tipoOperacion as tipo, a.nombreBreve as nombreAlmacen, concat(u.Nombres,' ',u.Apellidos) as usuarioResponsable from Guia_movimiento_cabecera g " +
        "left join Proveedor pro on g.idProveedor = pro.idProveedor " +
        "left join Persona p on pro.idPersona = p.idPersona " +
        "left join UsuarioIntranet u on g.idUsuarioResp = u.idUsuario " +
        "inner join Almacen a on g.idAlmacen = a.idAlmacen " + queryWhere.getQueryWhere() + " order by g.fechaOperacion desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);
    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad from Guia_movimiento_cabecera g " +
                    "left join Proveedor p on g.idProveedor = p.idProveedor " +
                    "inner join Almacen a on g.idAlmacen = a.idAlmacen " + queryWhere.getQueryWhere() + " order by g.fechaOperacion desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    enviarResponse(res, resultados);
                });
            } else {
                enviarResponse(res, resultados);
            }
        } else {
            enviarResponse(res, resultados);
        }
    });
}
exports.getProveedores = function (req, res, funcionName) {
    var query = "Select * from (Select pro.idProveedor, if(p.tipoPersona='J', p.razonSocial, concat(IFNULL(p.nombres,''),' ',IFNULL(p.apellidoPaterno,''),' ',IFNULL(p.apellidoMaterno,''))) as nombreProveedor from Proveedor pro inner join Persona p on pro.idPersona = p.idPersona) as v order by v.nombreProveedor ";
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

exports.getIPRESS = function (req, res, funcionName) {
    var query = "Select pro.idProveedor, if(p.tipoPersona='J', p.razonSocial, concat(IFNULL(p.nombres,''),' ',IFNULL(p.apellidoPaterno,''),' ',IFNULL(p.apellidoMaterno,''))) as nombreProveedor from Proveedor pro inner join Persona p on pro.idPersona = p.idPersona where tipoProveedor in ('C','H') order by nombreProveedor "
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}

exports.getArticulosXalmacen = function (req, res, funcionName) {
    var idAlmacen = req.query.idAlmacen;
    var arrayParametros = [];
    if (idAlmacen != "0") {
        var query = "Select aa.idArticulos_almacen, aa.idArticulo, if(a.esCAT='S', Concat(a.descripcion,' [--CAT--]'), a.descripcion) as descripcion from Articulos_almacen aa inner join Articulo a on aa.idArticulo = a.idArticulo where aa.idAlmacen=?";
        arrayParametros = [idAlmacen];
    } else {
        var query = "Select idArticulo, if(esCAT='S', Concat(descripcion,' [--CAT--]'), descripcion) as descripcion from Articulo where esCAT='S' order by descripcion asc";
    }
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getAlmacenesXlocal = function (req, res, funcionName) {
    var idLocal = req.query.idLocal;
    var queryWhere = "";
    if (idLocal != "0") {
        queryWhere = " where idLocal = '" + idLocal + "'";
    }
    var query = "Select idAlmacen, nombre as nombreAlmacen, nombreBreve from Almacen " + queryWhere + " order by nombre, nombreBreve";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
function actualizarUltimoMovimientoEnCertificados(res, funcionName, certificadoInicio, certificadoFin) {

    /*var queryUpdate = "Update Certificado c set c.ultimoMovimiento = (Select max(m.idCertificado_movimiento) from Certificado_movimiento m where m.nroCertificado=c.nroCertificado) " +
        " where c.registroEstado='0' and c.nroCertificado between " + parseInt(certificadoInicio) + " and " + parseInt(certificadoFin);*/
    
    var queryUpdate = "Update Certificado cer join (select max(m.idCertificado_movimiento) as idCertificado_movimiento, c.nroCertificado from Certificado_movimiento m"+
        " inner join Certificado c on m.nroCertificado=c.nroCertificado where c.registroEstado='0' and c.nroCertificado between " + parseInt(certificadoInicio) + " and " + parseInt(certificadoFin) + 
        " group by c.nroCertificado) vals ON cer.nroCertificado = vals.nroCertificado SET cer.ultimoMovimiento = vals.idCertificado_movimiento";

    ejecutarQUERY_MYSQL(queryUpdate, [], res, funcionName, "false");
}
function registrarCertificados(indice, listaCATS, idProveedor, res, funcionName, callback) {
    if (idProveedor != "") {
        var queryInsertCertificados = "Insert into Certificado(nroCertificado, idArticulo)";
        var values = " values ";

        for (var z = parseInt(listaCATS[indice].nroInicio); z <= parseInt(listaCATS[indice].nroFinal); z++) {
            if (z > parseInt(listaCATS[indice].nroInicio)) {
                values = values + ", ";
            }
            values = values + " ('" + z + "', '" + listaCATS[indice].codArticulo + "')";
        }
        queryInsertCertificados = queryInsertCertificados + values;
        ejecutarQUERY_MYSQL_Extra({ indice: indice, listaCATS: listaCATS, res: res, funcionName: funcionName }, queryInsertCertificados, [], res, funcionName, function (res, results, row) {
            callback(row.indice, row.listaCATS, row.res, row.funcionName);
        })
    } else {
        callback(indice, listaCATS, res, funcionName);
    }
}
exports.guardarGuia = function (req, res, funcionName) {
    var tipo = req.body.tipo;
    if (tipo == 'DEV' || tipo == 'DIST') {
        var fecha = req.body.fecha;
        var concesionario = req.body.concesionario;
        var nroGuia = req.body.nroGuia;
        var idUsuarioDestino = req.body.idUsuarioDestino;
        var idUsuario = req.body.idUsuario;

        var queryInsertGuia = "Insert into Guia_movimiento_cabecera(tipoOperacion, fechaOperacion, idConcesionario, idUsuario, idUsuarioResp, nroGuiaManual) values (?,?,?,?,?,?)"; // Registra la guia

        var arrayParametros = [tipo, fecha, concesionario, idUsuario, idUsuarioDestino, nroGuia];
        ejecutarQUERY_MYSQL(queryInsertGuia, arrayParametros, res, funcionName, function (res, resultados) {
            var idGuia = resultados.insertId;
            var listaCATS = [];

            var listaDetalles = req.body.detalle;

            for (var i = 0; i < listaDetalles.length; i++) {
                if ((listaDetalles[i].descArticulo).indexOf("[--CAT--]") >= 0) { // CAT
                    listaCATS.push(listaDetalles[i]);
                }
                // inserta el detalle:
                var queryInsertDetalle = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo,   unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values (?,?,?,?,?,?,?)";

                var parametrosDetalle = [idGuia, listaDetalles[i].codArticulo, listaDetalles[i].unidad, listaDetalles[i].cantidad, listaDetalles[i].nroInicio, listaDetalles[i].nroFinal, listaDetalles[i].observaciones];

                //console.log("Insertando detalles");
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
            }
            // Registra los CATS:
            if (tipo == 'DIST') {
                for (var y = 0; y < listaCATS.length; y++) {

                    var queryInsertCATS = "Insert into Certificado_movimiento(nroCertificado, idArticulo, tipOperacion, idUbicacion, idUsuarioResp, idGuia)";

                    var values = " values ";

                    for (var z = parseInt(listaCATS[y].nroInicio); z <= parseInt(listaCATS[y].nroFinal); z++) {
                        if (z > parseInt(listaCATS[y].nroInicio)) {
                            values = values + ", ";
                        }
                        values = values + " ('" + z + "', '" + listaCATS[y].codArticulo + "', 'E', '" + req.body.concesionario + "', '" + req.body.idUsuario + "', '" + idGuia + "')";
                    }
                    queryInsertCATS = queryInsertCATS + values;
                    //console.log("Insertando certificados");
                    ejecutarQUERY_MYSQL_Extra({ nroInicio: listaCATS[y].nroInicio, nroFinal: listaCATS[y].nroFinal }, queryInsertCATS, [], res, funcionName, function (res, results, row) {
                        // actualiza ultimo movimiento del certificado:
                        actualizarUltimoMovimientoEnCertificados(res, funcionName, row.nroInicio, row.nroFinal);
                    });
                }
            } else { // DEV = Devolucion
                // Ingresa la fecha de salida de los CATS:
                var updateFechaSalidaCAT = "Update Certificado_movimiento set fechaSalida=now(), idGuiaSalida='" + idGuia + "' where nroCertificado in ";

                var listaCertificados = [];

                for (var y = 0; y < listaCATS.length; y++) {

                    for (var z = parseInt(listaCATS[y].nroInicio); z <= parseInt(listaCATS[y].nroFinal); z++) {

                        listaCertificados.push(z);
                    }

                }
                if (listaCertificados.length > 0) {
                    updateFechaSalidaCAT = updateFechaSalidaCAT + "(" + listaCertificados + ") and idUbicacion=? and (fechaSalida is null or fechaSalida = '0000-00-00 00:00:00')";
                    ejecutarQUERY_MYSQL(updateFechaSalidaCAT, [req.body.concesionario], res, funcionName, "false");
                }
            }
            enviarResponse(res, [idGuia]);
        });
    }
    if (tipo == 'ING') { // para ingresos
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
        ejecutarQUERY_MYSQL(queryInsertGuia, arrayParametros, res, funcionName, function (res, resultados) {
            var idGuia = resultados.insertId;
            var listaCATS = [];

            var listaDetalles = req.body.detalle;

            for (var i = 0; i < listaDetalles.length; i++) {
                if ((listaDetalles[i].descArticulo).indexOf("[--CAT--]") >= 0) { // CAT
                    listaCATS.push(listaDetalles[i]);
                }
                // inserta el detalle:
                var queryInsertDetalle = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo,   unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values (?,?,?,?,?,?,?)";

                var parametrosDetalle = [idGuia, listaDetalles[i].codArticulo, listaDetalles[i].unidad, listaDetalles[i].cantidad, listaDetalles[i].nroInicio, listaDetalles[i].nroFinal, listaDetalles[i].observaciones];

                //console.log("Insertando detalles");
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");

                // actualiza stock en almacen por articulo              
                var queryUpdateStockAlmacen = "Update Articulos_almacen set stock=stock+" + listaDetalles[i].cantidad + " where idArticulo='" + listaDetalles[i].codArticulo + "' and idAlmacen='" + req.body.almacen + "'";
                ejecutarQUERY_MYSQL(queryUpdateStockAlmacen, [], res, funcionName, "false");

                var idProveedor = req.body.proveedor;
                if (idProveedor != "") { // no proviene de una guia sino de un proveedor
                    // actualiza stock general del articulo
                    var queryUpdateStockGeneral = "Update Articulo set stock=stock+" + listaDetalles[i].cantidad + " where idArticulo='" + listaDetalles[i].codArticulo + "'";
                    ejecutarQUERY_MYSQL(queryUpdateStockGeneral, [], res, funcionName, "false");
                }/*else{
                    var updateCantidadPendSalida = "Update Guia_movimiento_detalle set cantidadPendienteSalida=cantidadPendienteSalida-"+listaDetalles[i].cantidad+" where idArticulo=? and idGuia_movimiento_cabecera=?";
                    
                    var params = [listaDetalles[i].codArticulo, idGuiaOrigen];
                    ejecutarQUERY_MYSQL(updateCantidadPendSalida, params, res, funcionName, "false");
                }*/
            }
            // Registra los movimientos de CATS:
            for (var y = 0; y < listaCATS.length; y++) {
                var idProveedor = req.body.proveedor;
                registrarCertificados(y, listaCATS, idProveedor, res, funcionName, function (y, listaCATS, res, funcionName) {

                    var queryInsertCATS = "Insert into Certificado_movimiento(nroCertificado, idArticulo, tipOperacion, estado, idUbicacion, idUsuarioResp, idGuia)";
                    var values = " values ";

                    for (var z = parseInt(listaCATS[y].nroInicio); z <= parseInt(listaCATS[y].nroFinal); z++) {
                        if (z > parseInt(listaCATS[y].nroInicio)) {
                            values = values + ", ";
                        }
                        var estadoCAT = 'D';
                        if (listaCATS[y].estado != '') {
                            estadoCAT = listaCATS[y].estado;
                        }
                        values = values + " ('" + z + "', '" + listaCATS[y].codArticulo + "', 'I', '" + estadoCAT + "', '" + req.body.almacen + "', '" + req.body.idUsuario + "', '" + idGuia + "')";
                    }
                    queryInsertCATS = queryInsertCATS + values;

                    ejecutarQUERY_MYSQL_Extra({ nroInicio: listaCATS[y].nroInicio, nroFinal: listaCATS[y].nroFinal }, queryInsertCATS, [], res, funcionName, function (res, results, row) {
                        // actualiza ultimo movimiento del certificado:
                        actualizarUltimoMovimientoEnCertificados(res, funcionName, row.nroInicio, row.nroFinal);
                    });
                });
            }
            enviarResponse(res, [idGuia]);
        });
    }
    if (tipo == 'SAL') {
        var fecha = req.body.fecha;
        var almacen = req.body.almacen;
        var idUsuarioDestino = req.body.idUsuarioDestino;
        var idUsuario = req.body.idUsuario;

        var queryInsertGuia = "Insert into Guia_movimiento_cabecera(tipoOperacion, fechaOperacion, idAlmacen, idUsuario, idUsuarioResp) values (?,?,?,?,?)";

        var arrayParametros = [tipo, fecha, almacen, idUsuario, idUsuarioDestino];
        ejecutarQUERY_MYSQL(queryInsertGuia, arrayParametros, res, funcionName, function (res, resultados) {
            var idGuia = resultados.insertId;
            var listaCATS = [];

            var listaDetalles = req.body.detalle;

            for (var i = 0; i < listaDetalles.length; i++) {
                if ((listaDetalles[i].descArticulo).indexOf("[--CAT--]") >= 0) { // CAT
                    listaCATS.push(listaDetalles[i]);
                }
                // inserta el detalle:
                var queryInsertDetalle = "Insert into Guia_movimiento_detalle(idGuia_movimiento_cabecera, idArticulo,   unidad, cantidad, nroCertificadoInicio, nroCertificadoFin, observacion) values (?,?,?,?,?,?,?)";

                var parametrosDetalle = [idGuia, listaDetalles[i].codArticulo, listaDetalles[i].unidad, listaDetalles[i].cantidad, listaDetalles[i].nroInicio, listaDetalles[i].nroFinal, listaDetalles[i].observaciones];

                //console.log("Insertando detalles");
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");

                // actualiza stock en almacen por articulo (Resta)
                var queryUpdateStockAlmacen = "Update Articulos_almacen set stock=stock-" + listaDetalles[i].cantidad + " where idArticulo='" + listaDetalles[i].codArticulo + "' and idAlmacen='" + req.body.almacen + "'";
                ejecutarQUERY_MYSQL(queryUpdateStockAlmacen, [], res, funcionName, "false");

                var esVenta = req.body.esVenta; // si los articulos seran vendidos se actualiza el stock global
                //console.log("Es Venta : " + esVenta);
                if (esVenta == true || esVenta == 'true') {
                    // actualiza stock general del articulo
                    var queryUpdateStockGeneral = "Update Articulo set stock=stock-" + listaDetalles[i].cantidad + " where idArticulo='" + listaDetalles[i].codArticulo + "'";
                    ejecutarQUERY_MYSQL(queryUpdateStockGeneral, [], res, funcionName, "false");
                }

            }
            // Ingresa la fecha de salida de los CATS:
            var updateFechaSalidaCAT = "Update Certificado_movimiento set fechaSalida=now(), idGuiaSalida='" + idGuia + "' where nroCertificado in "
            var listaCertificados = [];
            for (var y = 0; y < listaCATS.length; y++) {

                /*var queryInsertCATS = "Insert into Certificado_movimiento(nroCertificado, idArticulo, estado, idUbicacion, idUsuarioResp, idGuia)";
                
                var values = " values ";*/

                for (var z = parseInt(listaCATS[y].nroInicio); z <= parseInt(listaCATS[y].nroFinal); z++) {
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
            if (listaCertificados.length > 0) {
                updateFechaSalidaCAT = updateFechaSalidaCAT + "(" + listaCertificados + ") and idUbicacion=? and (fechaSalida is null or fechaSalida = '0000-00-00 00:00:00')";
                ejecutarQUERY_MYSQL(updateFechaSalidaCAT, [req.body.almacen], res, funcionName, "false");
            }
            enviarResponse(res, [idGuia]);
        });
    }
}
exports.getDetallesGuia = function (req, res, funcionName) {
    var idGuia = req.query.idGuia;

    var queryCabecera = "Select date_format(fechaOperacion, '%d/%m/%Y') as fechaOperacion, idAlmacen, if(idProveedor=0, '', idProveedor) as idProveedor, docRefProveedor, if(idConcesionario=0, '', idConcesionario) as idConcesionario, idUsuarioResp, tipoOperacion, idOrdenCompra from Guia_movimiento_cabecera where idGuia_movimiento_cabecera = ?";

    var parametros = [idGuia];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function (res, resultados) {
        // busca los detalles:
        query = "Select gd.idGuia_movimiento_detalle as idDetalle, gd.idArticulo as codArticulo, a.descripcion as descArticulo, gd.unidad, gd.cantidad, gd.nroCertificadoInicio as nroInicio, gd.nroCertificadoFin as nroFinal, gd.observacion as observaciones from Guia_movimiento_detalle gd inner join Articulo a on gd.idArticulo = a.idArticulo where gd.idGuia_movimiento_cabecera=?";

        var parametros = [req.query.idGuia];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName, function (res2, results, resultados) {
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
exports.getUsuarios = function (req, res, funcionName) {
    var idUsuarioActual = req.query.idUsuario;
    var query = "Select u.idUsuario, concat(u.Nombres,' ',u.Apellidos) as nombreUsuario, p.idPromotor from UsuarioIntranet u left join Promotor p on u.idUsuario = p.idUsuario where u.idUsuario!=?";
    var idLocal = parseInt(req.query.idLocal);
    if (idLocal > 0) {
        query = query + " and idLocal = '" + idLocal + "'";
    }
    query = query + " order by concat(u.Nombres,' ',u.Apellidos)";
    var arrayParametros = [idUsuarioActual];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.stockArticuloXalmacen = function (req, res, funcionName) {
    var idArticulo = req.query.idArticulo;
    var idAlmacen = req.query.idAlmacen;
    var query = "Select stock from Articulos_almacen where idArticulo=? and idAlmacen=?";
    var arrayParametros = [idArticulo, idAlmacen];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.verficarDisponibilidadCATS = function (req, res, funcionName) { // verifica la disponibilidad de salida o ingreso de los CATS
    var nroInicio = req.query.nroInicio;
    var nroFinal = req.query.nroFinal;
    var idAlmacen = req.query.idAlmacen;
    var idArticulo = req.query.idArticulo;
    var tipo = req.query.tipo;
    var query = "";
    var subQuery = "";

    if (tipo == 'S') { // certificados que se han retirado de un almacen y que ingresaran en otro
        // verifica existencia de CATS
        var queryExistencia = "SELECT nroCertificado FROM Certificado where nroCertificado between ? and ? and registroEstado='0' and ultimoMovimiento>0 and idArticulo = ? order by nroCertificado"; // Filtra solo los certificados nuevos que tengan "Ultimo movimiento"
        var params = [nroInicio, nroFinal, idArticulo];
        ejecutarQUERY_MYSQL(queryExistencia, params, res, funcionName, function (res, resultados) {
            var idProveedor = req.query.idProveedor;
            if (idProveedor != "") {
                if (resultados.length > 0) {
                    var inicioCertif = resultados[0].nroCertificado;
                    var finCertif = resultados[resultados.length - 1].nroCertificado;
                    if (resultados.length == 1) {
                        enviarResponse(res, [false, "Ya encuentra registrado el CAT Nro: " + inicioCertif]);
                    } else {
                        enviarResponse(res, [false, "Ya se encuentran registrado los CATs del : " + inicioCertif + " al " + finCertif]);
                    }
                } else {
                    enviarResponse(res, []);
                }
            } else {
                var cantidadTotal = parseInt(req.query.nroFinal) - parseInt(req.query.nroInicio) + 1;
                if (cantidadTotal == resultados.length) {

                    var arrayParametros;

                    subQuery = " and ( estado in ('A', 'V', 'R') or fechaSalida is null)";

                    query = "select nroCertificado, idUbicacion, estado, fechaSalida from Certificado_movimiento where (nroCertificado between ? and ? ) " + subQuery + " and idArticulo=? and registroEstado='0' order by nroCertificado";

                    arrayParametros = [nroInicio, nroFinal, idArticulo];
                    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
                } else {
                    if (resultados.length == 0) {
                        enviarResponse(res, [false, "No existe ningun registro de los CAT's"]);
                    } else {
                        var inicioCertif = resultados[0].nroCertificado;
                        var finCertif = resultados[resultados.length - 1].nroCertificado;
                        if (resultados.length == 1) {
                            enviarResponse(res, [false, "Solo se encuentra registrado el CAT Nro: " + inicioCertif]);
                        } else {
                            enviarResponse(res, [false, "Solo se encuentra registrado los CATs del : " + inicioCertif + " al " + finCertif]);
                        }
                    }
                }
            }

        })


    } else { // Ceritificados que ingresaron en un almacen y se van a retirar de el mismo
        var arrayParametros;
        subQuery = " and (fechaSalida is null or fechaSalida='0000-00-00 00:00:00') ";

        query = "Select nroCertificado from Certificado_movimiento where (nroCertificado between ? and ? ) and idUbicacion=? " + subQuery + " and idArticulo=? and estado='D' and registroEstado='0' order by nroCertificado";
        arrayParametros = [nroInicio, nroFinal, idAlmacen, idArticulo];
        ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
    }
}
// CUS10
exports.consultaPlaca = function (req, res, funcionName) {
    var nroPlaca = req.query.nroPlaca;
    var query = "Select c.nroCAT, date_format(c.fechaInicio, '%d/%m/%Y') as fechaInicio, date_format(c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, c.placa, if(p.tipoPersona='N', CONCAT(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno), p.razonSocial) as asociado, cl.nombreClase, if(date_format(c.fechaCaducidad, '%Y-%m-%d 23:59:59') > now(), 'Activo', 'Caducado') as estado from Cat c inner join Asociado a on c.idAsociado = a.idAsociado inner join Persona p on a.idPersona=p.idPersona left join Vehiculo v on c.idVehiculo=v.idVehiculo left join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo left join Clase_Vehiculo cl on ucv.idClaseVehiculo=cl.idClase where c.placa = ? order by c.fechaCaducidad desc";
    var parametros = [nroPlaca];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
// CUS06:
exports.getAllConcesionarios = function (req, res, funcionName) {

    var idLocal = req.query.idLocal;
    var queryWhere = "";
    if (idLocal != "0") {
        queryWhere = " and c.idSede = '" + idLocal + "'";
    }

    var query = "select * from (Select c.idConcesionario, concat(if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)),' / ',l.Nombre) as nombreCompuesto from Concesionario c inner join Persona p on c.idPersona = p.idPersona inner join Local l on c.idSede = l.idLocal where l.estado='1' and c.estado='1' " + queryWhere + ") as v order by v.nombreCompuesto asc";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getListaGuiasConcesionarios = function (req, res, funcionName) { // NOTA: Esta funcion es usada tambien en el CUS 05 para obtener la lista de Guias de Salida
    // Parametros GET:
    var queryWhere = new QueryWhere(" where g.tipoOperacion in ('DIST', 'DEV') and g.registroEstado='0' "); // agrega el filtro de tipo de Guia
    var idConcesionario = req.query.idConcesionario;
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var conjutoConcesionarios = req.query.conjutoConcesionarios;

    if (idConcesionario != "") {
        queryWhere.validarWhere("g.idConcesionario=" + idConcesionario);
    } else {
        // verifica que solo se filtren los almacenes correctos
        if (conjutoConcesionarios != "") {
            queryWhere.validarWhere("g.idConcesionario in (" + conjutoConcesionarios + ") ");
        }
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere("( g.fechaOperacion between '" + fechaDesde + "' and '" + fechaHasta + "' )");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere("g.fechaOperacion>='" + fechaDesde + "'");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere("g.fechaOperacion<='" + fechaHasta + "'");
            }
        }
    }

    var query = "select g.idGuia_movimiento_cabecera as idGuia, g.nroGuiaManual, if(pe.tipoPersona='J', pe.razonSocial, concat(pe.nombres,' ',pe.apellidoPaterno,' ',pe.apellidoMaterno)) as nombreConcesionario, l.Nombre as sede, g.nroGuiaManual as nroGuia, " +
        "date_format(g.fechaOperacion, '%d/%m/%Y') as fechaRegistro, g.tipoOperacion as tipo, if(g.tipoOperacion='DIST', 'Distribucion', 'Devolucion') as tipoOperacion from Guia_movimiento_cabecera g " +
        "left join Concesionario c on g.idConcesionario = c.idConcesionario " +
        "left join Persona pe on c.idPersona = pe.idPersona " +
        "left join Local l on c.idSede = l.idLocal " + queryWhere.getQueryWhere() + " order by g.fechaOperacion desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);
    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad from Guia_movimiento_cabecera g " +
                    "left join Concesionario c on g.idConcesionario = c.idConcesionario " +
                    "left join Persona pe on c.idPersona = pe.idPersona " +
                    "left join Local l on c.idSede = l.idLocal " + queryWhere.getQueryWhere() + " order by g.fechaOperacion desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    enviarResponse(res, resultados);
                });
            } else {
                enviarResponse(res, resultados);
            }
        } else {
            enviarResponse(res, resultados);
        }
    });
}
// CUS07
exports.getListaLiquidaciones = function (req, res, funcionName) { // NOTA: Esta funcion es usada tambien en el CUS 05 para obtener la lista de Guias de Salida
    // Parametros GET:
    var queryWhere = new QueryWhere(""); // agrega el filtro de tipo de Guia
    var idConcesionario = req.query.idConcesionario;
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var conjutoConcesionarios = req.query.conjutoConcesionarios;

    if (idConcesionario != "") {
        queryWhere.validarWhere("li.idConcesionario=" + idConcesionario);
    } else {
        // verifica que solo se filtren los almacenes correctos
        if (conjutoConcesionarios != "") {
            queryWhere.validarWhere("li.idConcesionario in (" + conjutoConcesionarios + ") ");
        }
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere("( li.fechaLiquidacion between '" + fechaDesde + "' and '" + fechaHasta + "' )");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere("li.fechaLiquidacion>='" + fechaDesde + "'");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere("li.fechaLiquidacion<='" + fechaHasta + "'");
            }
        }
    }
    queryWhere.validarWhere(" li.registroEstado='0' ");

    var query = "select li.idLiquidacion_ventas_cabecera as idLiquidacion, li.nroLiquidacion, " +
        "if(pe.tipoPersona='J', pe.razonSocial, concat(pe.nombres,' ',pe.apellidoPaterno,' ',pe.apellidoMaterno)) as nombreConcesionario," +
        "date_format(li.fechaLiquidacion, '%d/%m/%Y') as fechaRegistro, " +
        "(select sum(d.precio) from Liquidacion_ventas_detalle d where d.idLiquidacion_ventas_cabecera = li.idLiquidacion_ventas_cabecera) " +
        "as totalVenta, (select sum(d2.comision) from Liquidacion_ventas_detalle d2 where d2.idLiquidacion_ventas_cabecera = li.idLiquidacion_ventas_cabecera) " +
        "as totalComision, (Select GROUP_CONCAT(d3.nroCertificado SEPARATOR ', ') FROM Liquidacion_ventas_detalle d3 " +
        "where d3.idLiquidacion_ventas_cabecera = li.idLiquidacion_ventas_cabecera) as nroCertificados " +
        "from Liquidacion_ventas_cabecera li " +
        "left join Concesionario c on li.idConcesionario = c.idConcesionario " +
        "left join Persona pe on c.idPersona = pe.idPersona " +
        "left join Local l on c.idSede = l.idLocal" + queryWhere.getQueryWhere() + " order by li.fechaLiquidacion desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);
    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad " +
                    "from Liquidacion_ventas_cabecera li " +
                    "left join Concesionario c on li.idConcesionario = c.idConcesionario " +
                    "left join Persona pe on c.idPersona = pe.idPersona " +
                    "left join Local l on c.idSede = l.idLocal" + queryWhere.getQueryWhere() + " order by li.fechaLiquidacion desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    enviarResponse(res, resultados);
                });
            } else {
                enviarResponse(res, resultados);
            }
        } else {
            enviarResponse(res, resultados);
        }
    });
}
exports.getPromotores = function (req, res, funcionName) {
    var idLocal = req.query.idLocal;
    var queryWhere = "";
    if (idLocal != "0") {
        queryWhere = " where u.idLocal = '" + idLocal + "'";
    }
    var query = "Select p.idPromotor, u.idUsuario, concat(u.Nombres,' ',u.Apellidos) as nombreUsuario " +
        "from Promotor p inner join UsuarioIntranet u on p.idUsuario = u.idUsuario " + queryWhere + " order by u.Nombres";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getAllClasesVehiculo = function (req, res, funcionName) {
    var query = "select idClase, nombreClase from Clase_Vehiculo order by nombreClase";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.verificarDiponibilidadVentaCAT = function (req, res, funcionName) { // identifica todos los movimientos de lo certificados que no se encuentren anulado (registroEstado=0)
    var nroCertificado = req.query.nroCertificado;
    var query = "Select nroCertificado, tipOperacion, idUbicacion, estado, fechaSalida from Certificado_movimiento where nroCertificado=? and registroEstado='0'"
    ejecutarQUERY_MYSQL(query, [nroCertificado], res, funcionName);
}
exports.guardarLiquidacion = function (req, res, funcionName) {
    var fecha = req.body.fecha;
    var concesionario = req.body.concesionario;
    var nroLiquidacion = req.body.nroLiquidacion;
    var idPromotor = req.body.idPromotor;
    var idUsuario = req.body.idUsuario;

    var query = "Insert into Liquidacion_ventas_cabecera " +
        "(nroLiquidacion, fechaLiquidacion, idConcesionario, idUsuarioResp, idUsuario) values (?,?,?,?,?)";
    var arrayParametros = [nroLiquidacion, fecha, concesionario, idPromotor, idUsuario];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function (res, resultados) {
        var idLiquidacion = resultados.insertId;
        if (idLiquidacion > 0) {
            var listaDetalles = req.body.detalles;
            var listaCertif = [];
            for (var i = 0; i < listaDetalles.length; i++) {
                listaCertif.push(listaDetalles[i].nroCertificado);
                // Inserta los detalles de liquidacion:
                var queryInsertDetalle = "Insert into Liquidacion_ventas_detalle " +
                    "(idLiquidacion_ventas_cabecera, nroCertificado, claseVehiculo, precio, comision) values (?,?,?,?,?)";
                var parametrosDetalle = [idLiquidacion, listaDetalles[i].nroCertificado, listaDetalles[i].idClaseVehiculo, listaDetalles[i].precio, listaDetalles[i].comision];
                // Actualiza stock global:
                var queryUpdateStockGlobal = "Update Articulo a set a.stock=stock-1 where a.idArticulo = " +
                    "(select c.idArticulo from Certificado c where c.nroCertificado = " + listaDetalles[i].nroCertificado + ")";
                ejecutarQUERY_MYSQL(queryUpdateStockGlobal, [], res, funcionName, "false");
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
                //27/ABR/2020 Si el CAT ya se registró, debe actualizar fecha liquidacion
                var queryUpdateCAT = "Update Cat set fechaLiquidacion= '" + fecha + "' where nroCAT = " + listaDetalles[i].nroCertificado
                ejecutarQUERY_MYSQL(queryUpdateCAT, [], res, funcionName, "false");

            }
            // actualiza la fecha de Salida en los certificados y cambia su estado a Vendido
            var idUsuarioUpdate = req.query.idUsuarioUpdate;
            var queryUpdate = "Update Certificado_movimiento set fechaSalida=now(), estado='V', idGuiaSalida='" + idLiquidacion + "', " +
                "ultActualizaUsuario='" + idUsuarioUpdate + "', ultActualizaFecha=now() " +
                "where idUbicacion='" + concesionario + "' and tipOperacion='E' and fechaSalida is null " +
                "and nroCertificado in (" + listaCertif + ")";
            ejecutarQUERY_MYSQL_Extra(listaCertif, queryUpdate, [], res, funcionName, function (res, results, rowsCertif) {
                // actualiza a vendido (ESTADO = "9") si ha sido registrado el certificado con liquidación pendiente (ESTADO = 8)
                var idUsuarioUpdate = req.query.idUsuarioUpdate;
                var queryUpdateCertificado = "Update Certificado set estadoRegistroCAT='9', ultActualizaUsuario='" + idUsuarioUpdate + "', ultActualizaFecha=now() where nroCertificado in (" + rowsCertif + ") and estadoRegistroCAT = '8' and registroEstado='0'";
                //console.log("update CERTIFICADO : " + queryUpdateCertificado);
                ejecutarQUERY_MYSQL(queryUpdateCertificado, [], res, funcionName, "false");
            });
            enviarResponse(res, [idLiquidacion]);
        }
    });
}
exports.getDetallesLiquidacion = function (req, res, funcionName) {
    var idLiquidacion = req.query.idLiquidacion;

    var queryCabecera = "Select date_format(fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, if(idConcesionario=0, '', idConcesionario) as idConcesionario, idUsuarioResp, idUsuario, nroLiquidacion from Liquidacion_ventas_cabecera where idLiquidacion_ventas_cabecera = ?";

    var parametros = [idLiquidacion];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function (res, resultados) {
        // busca los detalles:
        query = "Select gd.idLiquidacion_ventas_detalle as idDetalle, gd.nroCertificado, gd.precio, gd.comision, gd.claseVehiculo as idClaseVehiculo, c.nombreClase as claseVehiculo from Liquidacion_ventas_detalle gd inner join Clase_Vehiculo c on gd.claseVehiculo = c.idClase where gd.idLiquidacion_ventas_cabecera=?";

        var parametros = [req.query.idLiquidacion];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName, function (res2, results, resultados) {
            resultados[0].detalle = results;
            enviarResponse(res, resultados);
        })
    });
}
// CUS 09 :
exports.generarReporteCertificado = function (req, res, funcionName) {
    var tipoReporte = req.query.tipoReporte;
    var parametros;
    var query = "";
    switch (tipoReporte) {
        case 'CER':
            var query = "Select * from ((select c.nroCertificado, c.fechaOperacion as fechaRegistro, date_format(c.fechaOperacion, '%d/%m/%Y') as fechaOperacion , g.tipoOperacion, c.estado, c.idUbicacion, if(c.tipOperacion='I', a.nombre, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno))) as nombreUbicacion, c.idGuia, " +
                "concat(u.Nombres,' ', u.Apellidos) as nombreUsuario " +
                "from Certificado_movimiento c " +
                "left join Almacen a on c.tipOperacion = 'I' and c.idUbicacion = a.idAlmacen " +
                "left join Concesionario con on c.tipOperacion = 'E' and c.idUbicacion = con.idConcesionario " +
                "left join Persona co on con.idPersona = co.idPersona " +
                "left join Guia_movimiento_cabecera g on c.idGuia = g.idGuia_movimiento_cabecera " +
                "left join UsuarioIntranet u on g.idUsuario = u.idUsuario " +
                "where c.nroCertificado between ? and ? and c.idUbicacion>0 and c.idGuia>0 and c.registroEstado='0' order by c.nroCertificado, g.fechaOperacion, g.idGuia_movimiento_cabecera) UNION " + // Salidas

                "(select c.nroCertificado, c.fechaSalida as fechaRegistro, date_format(c.fechaSalida, '%d/%m/%Y') as fechaOperacion , if(c.estado='V', 'VEND', g.tipoOperacion) as tipoOperacion, c.estado, c.idUbicacion, if(c.tipOperacion='I', a.nombre, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno))) as nombreUbicacion,  if(c.estado='V', concat('LIQ - ',gl.idLiquidacion_ventas_cabecera), c.idGuiaSalida) as idGuia, " +
                "if(c.estado='V', concat(ul.Nombres,' ', ul.Apellidos), concat(u.Nombres,' ', u.Apellidos)) as nombreUsuario " +
                "from Certificado_movimiento c " +
                "left join Almacen a on c.tipOperacion = 'I' and c.idUbicacion = a.idAlmacen " +
                "left join Concesionario con on c.tipOperacion = 'E' and c.idUbicacion = con.idConcesionario " +
                "left join Persona co on con.idPersona = co.idPersona " +
                "left join Guia_movimiento_cabecera g on c.idGuiaSalida = g.idGuia_movimiento_cabecera and c.estado !='V' " +
                "left join Liquidacion_ventas_cabecera gl on c.idGuiaSalida = gl.idLiquidacion_ventas_cabecera and c.estado ='V'" +
                "left join UsuarioIntranet u on g.idUsuarioResp = u.idUsuario " +
                "left join UsuarioIntranet ul on gl.idUsuario = ul.idUsuario " +
                "where c.nroCertificado between ? and ? and c.idUbicacion>0  and c.idGuia>0 and c.idGuiaSalida>0 and c.registroEstado='0' order by c.nroCertificado, c.fechaSalida, g.idGuia_movimiento_cabecera)) as v order by v.nroCertificado, v.fechaRegistro";

            var inicio = req.query.inicio;
            var fin = req.query.fin;
            if (fin == "") {
                fin = inicio;
            }
            parametros = [inicio, fin, inicio, fin];

            break;
        case 'CON':
            var query = "select c.nroCertificado, date_format(c.fechaOperacion, '%d/%m/%Y') as fechaOperacion , if(c.estado='V', 'VEND', g.tipoOperacion) as tipOperacion, c.estado, c.idUbicacion, c.idGuia, " +
                " concat(u.Nombres,' ', u.Apellidos) as nombreUsuario, g.nroGuiaManual, " +
                " date_format(gl.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, gl.idLiquidacion_ventas_cabecera as idLiquidacion from Certificado_movimiento c " +
                " inner join Concesionario con on c.idUbicacion = con.idConcesionario " +
                " left join Persona co on con.idPersona = co.idPersona " +
                " inner join Guia_movimiento_cabecera g on c.idGuia = g.idGuia_movimiento_cabecera " +
                " inner join UsuarioIntranet u on g.idUsuario = u.idUsuario " +
                " inner join Certificado cer on c.nroCertificado = cer.nroCertificado " +
                " left join Liquidacion_ventas_cabecera gl on c.idGuiaSalida = gl.idLiquidacion_ventas_cabecera and c.estado = 'V'" +
                " where c.tipOperacion = 'E' and c.idUbicacion=?  and c.registroEstado='0' and g.registroEstado='0' and cer.registroEstado='0' and gl.registroEstado='0' and cer.ultimoMovimiento = c.idCertificado_movimiento order by c.nroCertificado ";

            var idConcesionario = req.query.idConcesionario;
            parametros = [idConcesionario];

            break;
        case 'PRO':
            var dias = req.query.dias;
            // 22/01/19 CAMBIO: g.fechaOperacion = fecha en Cabecera de guia (antes c.fechaOperacion=fecha en Movimiento detalle - timeStamp *ERROR*)
            var query = "select c.nroCertificado, date_format(g.fechaOperacion, '%d/%m/%Y') as fechaOperacion , if(c.estado='V', 'VEND', g.tipoOperacion) as tipOperacion, c.estado, c.idUbicacion, if(co.tipoPersona='J', co.razonSocial, concat(co.nombres,' ',co.apellidoPaterno,' ',co.apellidoPaterno)) as nombreConcesionario, c.idGuia, con.diaSemanaAtt, g.nroGuiaManual, " +
                " concat(u.Nombres,' ', u.Apellidos) as nombreUsuario, g.nroGuiaManual, con.diaSemanaAtt, co.calle as direccion, di.nombre as nombreDistrito " +
                " from Certificado cer " +
                " inner join Certificado_movimiento c on cer.ultimoMovimiento = c.idCertificado_movimiento " +
                " inner join Concesionario con on c.idUbicacion = con.idConcesionario " +
                " left join Persona co on con.idPersona = co.idPersona " +
                " left join Distrito di on co.idDistrito =  di.idDistrito " +
                " inner join Guia_movimiento_cabecera g on c.idGuia = g.idGuia_movimiento_cabecera " +
                " inner join UsuarioIntranet u on g.idUsuario = u.idUsuario " +
                " where c.tipOperacion = 'E' and c.idGuiaSalida=0 and con.idPromotor=? and con.diaSemanaAtt in (" + dias + ") and c.idUbicacion>0 and c.estado!='V' and c.registroEstado='0' and g.registroEstado='0' order by con.diaSemanaAtt, c.nroCertificado";

            var idPromotor = req.query.idPromotor;
            parametros = [idPromotor];

            break;
    }
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
// CUS 07: // Encuentra los Certificados disponibles para vender en el concesionario
exports.getCertificadosXconcesionarioId = function (req, res, funcionName) {
    var idConcesionario = req.query.idConcesionario;
    var query = "Select nroCertificado from Certificado_movimiento where tipOperacion='E' and idUbicacion = ? and ( idGuiaSalida = 0 or idGuiaSalida is null) and registroEstado='0' order by nroCertificado ";

    var parametros = [idConcesionario];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}

// CUS 11: obtiene los certificados asignados a un promotor
exports.certificadosXpromotor = function (req, res, funcionName) {
    var idPromotor = req.query.idPromotor;
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;

    var queryWhere = new QueryWhere(" where g.idUsuarioResp = '" + idPromotor + "' and g.registroEstado='0' and cer.registroEstado='0' ");

    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere("( g.fechaOperacion between '" + fechaDesde + "' and '" + fechaHasta + "' )");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere("g.fechaOperacion>='" + fechaDesde + "'");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere("g.fechaOperacion<='" + fechaHasta + "'");
            }
        }
    }

    /*
    var query = "select g.idGuia_movimiento_cabecera as idGuia, g.tipoOperacion, date_format(g.fechaOperacion, '%d/%m/%Y') as fechaOperacion, " +
        " a.nombre as almacen, if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as concesionario, " +
        " cer.nroCertificado " +
        " from Guia_movimiento_cabecera g " +
        " inner join Certificado_movimiento cer on  cer.idGuiaSalida = g.idGuia_movimiento_cabecera and cer.estado!='V' " +
        " left join Almacen a on g.idAlmacen = a.idAlmacen " +
        " left join Concesionario co on g.idConcesionario = co.idConcesionario " +
        " left join Persona p on co.idPersona = p.idPersona " +
        queryWhere.getQueryWhere() +
        " and g.tipoOperacion in ('SAL', 'DEV') " +
        " and (select count(*) from Certificado_movimiento cex where cex.nroCertificado = cer.nroCertificado and ( cex.idGuiaSalida>g.idGuia_movimiento_cabecera or cex.estado='V' ))=0 " +
        " order by cer.nroCertificado";
        */

    var query = "select g.idGuia_movimiento_cabecera as idGuia, "+ 
            " g.tipoOperacion, "+
            " date_format(g.fechaOperacion, '%d/%m/%Y') as fechaOperacion, " +  
            " a.nombre as almacen, " +
            " if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as concesionario, "+
            " cer.nroCertificado " +  
" from Guia_movimiento_cabecera g  inner join Certificado_movimiento cer " +
    " on  cer.idGuiaSalida = g.idGuia_movimiento_cabecera and cer.estado!='V'  left join Almacen a " +
    " on g.idAlmacen = a.idAlmacen  left join Concesionario co " +
    " on g.idConcesionario = co.idConcesionario  left join Persona p " + 
    " on co.idPersona = p.idPersona  join certificado c " +
    " on c.ultimoMovimiento = cer.idcertificado_movimiento " + 
    queryWhere.getQueryWhere() +
    " and  cer.idArticulo = 9 " +
    " and  cer.estado <> 'A' " +
    " order by cer.nroCertificado desc;"


    ejecutarQUERY_MYSQL(query, [], res, funcionName)
}
//Certificados activados x Promotor
exports.catsXpromotor = function (req, res, funcionName) {
    var idPromotor = req.query.idPromotor;
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;

    var queryWhere = new QueryWhere(" where c.idPromotor = " + idPromotor + " ");

    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere("( c.fechaEmision between '" + fechaDesde + "' and '" + fechaHasta + "' )");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere(" c.fechaEmision>='" + fechaDesde + "'");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere(" c.fechaEmision<='" + fechaHasta + "'");
            }
        }
    }
    var query = "select c.nroCAT,date_format(c.fechaEmision, '%d/%m/%Y %H:%i') as fechaEmision,c.placa,c.comision, " +
        "c.prima,c.aporte,(c.comision+c.prima+c.aporte) as total, " +
        "if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreConcesionario " +
        "from Cat c " +
        "inner join Concesionario cn on cn.idConcesionario=c.idConcesionario " +
        "left join Persona p on p.idPersona=cn.idPersona " +
        queryWhere.getQueryWhere() +
        " order by c.nroCAT";
    ejecutarQUERY_MYSQL(query, [], res, funcionName)
}
function actualizarStockDetalle(idGuia, idAlmacen, idProveedor, tipo, res, funcionName) {
    var query = "select idArticulo, cantidad, nroCertificadoInicio from Guia_movimiento_detalle where idGuia_movimiento_cabecera = ?";
    ejecutarQUERY_MYSQL(query, [idGuia], res, funcionName, function (res, results) {
        var signo = "";
        if (tipo == 'ING') {
            signo = "-";
        } else {
            signo = "+";
        }
        for (var i = 0; i < results.length; i++) {

            var queryUpdateStockArticulosXalmacen = "Update Articulos_almacen set stock = stock" + signo + "" + results[i].cantidad + " where idAlmacen = ? and idArticulo = ?";

            ejecutarQUERY_MYSQL(queryUpdateStockArticulosXalmacen, [idAlmacen, results[i].idArticulo], res, funcionName, "false");

            if (idProveedor != "" && tipo == "ING" /*&& results[i].nroCertificadoInicio>0*/) { // actualiza el stock global

                var queryUpdateStockGlobalArticulos = "Update Articulo set stock=stock" + signo + "" + results[i].cantidad + " where idArticulo=?";
                ejecutarQUERY_MYSQL(queryUpdateStockGlobalArticulos, [results[i].idArticulo], res, funcionName, "false");

            }
        }
    });
}
exports.anularLiquidacion = function (req, res, funcionName) { // una liquidacion siempre es el ultimo proceso.
    var idUsuario = req.query.idUsuarioUpdate;
    var listaCertificados = req.body.listaCertificados;
    var idLiquidacion = req.body.idLiquidacion;

    var queryExistenCATS = "Select nroCAT from Cat where nroCAT in (" + listaCertificados + ") order by nroCAT";
    ejecutarQUERY_MYSQL(queryExistenCATS, [], res, funcionName, function (res, resultados) {
        if (resultados.length == 0) { // no se ha registrado ninguna venta del cat, por lo tanto procede con la operacion;
            // anula la liquidacion en los movimientos de los certificados
            var queryAnularMovimientos = "Update Certificado_movimiento m set m.idGuiaSalida=0, m.fechaSalida=null, m.estado='D', m.ultActualizaFecha=now(), m.ultActualizaUsuario=? where m.idCertificado_movimiento in (Select cer.ultimoMovimiento from Certificado cer where cer.nroCertificado in (" + req.body.listaCertificados + "))";
            ejecutarQUERY_MYSQL(queryAnularMovimientos, [req.query.idUsuarioUpdate], res, funcionName, function (res, results) {
                // anula los detalles
                var queryAnulaDetalles = "Update Liquidacion_ventas_detalle set registroEstado='1', ultActualizaFecha=now(), ultActualizaUsuario=? where idLiquidacion_ventas_cabecera=?";
                var params = [req.query.idUsuarioUpdate, req.body.idLiquidacion];
                ejecutarQUERY_MYSQL(queryAnulaDetalles, params, res, funcionName, function (res, results) {
                    //actualiza el stock de los articulos:
                    var queryCantidadXarticulos = "Select sum(idArticulo) as cantidad, idArticulo from Certificado where nroCertificado in (" + req.body.listaCertificados + ") group by idArticulo";
                    ejecutarQUERY_MYSQL(queryCantidadXarticulos, [], res, funcionName, function (res, results) {
                        for (var i = 0; i < results.length; i++) {
                            var cantidad = results[i].cantidad;
                            var idArticulo = results[i].idArticulo;

                            var queryActualizaStock = "Update Articulo set stock = stock + " + cantidad + " where idArticulo = ?";
                            var params = [idArticulo]
                            ejecutarQUERY_MYSQL(queryActualizaStock, params, res, funcionName, "false");
                        }
                        // Anula la liquidacion:
                        var anulaLiquidacion = "Update Liquidacion_ventas_cabecera set registroEstado='1', ultActualizaFecha=now(), ultActualizaUsuario=? where idLiquidacion_ventas_cabecera=?";
                        var params = [req.query.idUsuarioUpdate, req.body.idLiquidacion];
                        ejecutarQUERY_MYSQL(anulaLiquidacion, params, res, funcionName, "affectedRows"); // envia la cantidad de filas afectadas al lado cliente.
                    })
                });
            })
        } else {
            enviarResponse(res, [false, resultados])
        }
    })
}
exports.anularGuia = function (req, res, funcionName) {
    var idUsuario = req.query.idUsuario;
    var idGuia = req.query.idGuia;
    var tipo = req.query.tipo;

    // verifica los detalles de la Guia:
    var query = "select nroCertificadoInicio, nroCertificadoFin from Guia_movimiento_detalle where idGuia_movimiento_cabecera = ?";

    ejecutarQUERY_MYSQL(query, [idGuia], res, funcionName, function (res, resultados) {
        var idGuia = req.query.idGuia;
        var idAlmacen = req.query.idAlmacen;
        var idProveedor = req.query.idProveedor;
        var tipo = req.query.tipo;
        var idUsuario = req.query.idUsuario;

        if (resultados.length > 0) {
            // Verifica si contiene certificados:
            var conCertificados = false;
            for (var i = 0; i < resultados.length; i++) {
                if (resultados[i].nroCertificadoInicio > 0) {
                    conCertificados = true;
                    break;
                }
            }
            if (!conCertificados) {
                //console.log("No hay certificados en los detalles")
                var queryAnularGuia = "Update Guia_movimiento_cabecera set registroEstado='1', ultActualizaUsuario=?, ultActualizaFecha=now()  where idGuia_movimiento_cabecera = ?";
                ejecutarQUERY_MYSQL(queryAnularGuia, [idUsuario, idGuia], res, funcionName, "false");
                actualizarStockDetalle(idGuia, idAlmacen, idProveedor, tipo, res, funcionName);
                enviarResponse(res, [true]);
            } else {
                //console.log("Existen certificados en los detalles")
                var listaCertificadosGuia = [];
                for (var i = 0; i < resultados.length; i++) {
                    for (var certif = resultados[i].nroCertificadoInicio; certif <= resultados[i].nroCertificadoFin; certif++) {
                        listaCertificadosGuia.push(certif);
                    }
                }
                // verifica que el ultimo movimiento de los CATS corresponda con la guia que se requiere anular.
                var queryUltimoMovimiento = "select * from (Select if(m.idGuiaSalida>0, m.idGuiaSalida, m.idGuia) as idGuia from Certificado c inner join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento where c.nroCertificado in (" + listaCertificadosGuia + ")) as v group by v.idGuia ";
                /*if(req.query.tipo=='ING' || req.query.tipo=='DIST'){
                    queryUltimoMovimiento = "Select m.idGuia from Certificado c inner join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento where c.nroCertificado in ("+listaCertificadosGuia+") group by m.idGuia ";
                }else{
                    queryUltimoMovimiento = "Select m.idGuiaSalida as idGuia from Certificado c inner join Certificado_movimiento m on c.ultimoMovimiento = m.idCertificado_movimiento where c.nroCertificado in ("+listaCertificadosGuia+") group by m.idGuiaSalida ";
                }*/
                ejecutarQUERY_MYSQL(queryUltimoMovimiento, [], res, funcionName, function (res, results) {

                    var idGuia = req.query.idGuia;
                    var idAlmacen = req.query.idAlmacen;
                    var idProveedor = req.query.idProveedor;
                    var tipo = req.query.tipo;
                    var idUsuario = req.query.idUsuario;

                    if (results.length == 1) {
                        if (results[0].idGuia = idGuia) {
                            //console.log("coincide guia");
                            // anula la guia completa con sus detalles, certificados y movimientos
                            var queryAnularGuia = "Update Guia_movimiento_cabecera set registroEstado='1', ultActualizaUsuario=?, ultActualizaFecha=now() where idGuia_movimiento_cabecera = ?";
                            ejecutarQUERY_MYSQL(queryAnularGuia, [idUsuario, idGuia], res, funcionName, function () {

                                var idGuia = req.query.idGuia;
                                var idAlmacen = req.query.idAlmacen;
                                var idProveedor = req.query.idProveedor;
                                var tipo = req.query.tipo;
                                var idUsuario = req.query.idUsuario;

                                // anula los detalles:
                                var queryAnulaDetalles = "Update Guia_movimiento_detalle set registroEstado='1', ultActualizaUsuario=?, ultActualizaFecha=now() where idGuia_movimiento_cabecera = ? ";
                                ejecutarQUERY_MYSQL(queryAnulaDetalles, [idUsuario, idGuia], res, funcionName, function () {

                                    var idGuia = req.query.idGuia;
                                    var idAlmacen = req.query.idAlmacen;
                                    var idProveedor = req.query.idProveedor;
                                    var tipo = req.query.tipo;
                                    var idUsuario = req.query.idUsuario;

                                    // Anula los movimientos del certificado:
                                    var queryAnulaCertificadosMovimientos = "";
                                    if (req.query.tipo == 'ING' || req.query.tipo == 'DIST') {
                                        queryAnulaCertificadosMovimientos = "Update Certificado_movimiento set registroEstado='1', ultActualizaUsuario='" + idUsuario + "', ultActualizaFecha=now() where idGuia = ? ";
                                    } else {
                                        queryAnulaCertificadosMovimientos = "Update Certificado_movimiento set idGuiaSalida=0, fechaSalida=null, ultActualizaUsuario='" + idUsuario + "', ultActualizaFecha=now() where idGuiaSalida = ?";
                                    }
                                    ejecutarQUERY_MYSQL(queryAnulaCertificadosMovimientos, [idGuia], res, funcionName, function () {

                                        var idGuia = req.query.idGuia;
                                        var idAlmacen = req.query.idAlmacen;
                                        var idProveedor = req.query.idProveedor;
                                        var tipo = req.query.tipo;
                                        var idUsuario = req.query.idUsuario;

                                        if (idProveedor != 0 && tipo == "ING") { //ERROR antes comparaba con "" y siempre borraba
                                            //Certificados ingresados desde Proveedor externo
                                            // Elimina los registros previos en la tabla certificado_anulados

                                            var queryDelete = "Delete from Certificado_anulados where nroCertificado in (" + listaCertificadosGuia + ") ";
                                            ejecutarQUERY_MYSQL_Extra(listaCertificadosGuia, queryDelete, [], res, funcionName, function (res, resultados, certificadosAnulados) {
                                                // copia los datos del certificados a la tabla Certificado_anulados.
                                                var queryInsert = "Insert into Certificado_anulados select * from Certificado where nroCertificado in (" + certificadosAnulados + ") ";

                                                ejecutarQUERY_MYSQL_Extra(certificadosAnulados, queryInsert, [], res, funcionName, function (res, resultados, certificadosAnulados) {
                                                    // Elimina el certificado:
                                                    var deleteCertificados = "Delete from Certificado where nroCertificado in (" + certificadosAnulados + ") ";
                                                    ejecutarQUERY_MYSQL(deleteCertificados, [], res, funcionName, "false");
                                                })
                                            })

                                        } else {
                                            if (tipo == 'ING' || tipo == 'DIST') {
                                                // actualiza el ultimo movimiento en el certificado
                                                var queryUpdateUltMov = "Update Certificado c set c.ultimoMovimiento = (Select max(m.idCertificado_movimiento) from Certificado_movimiento m where m.nroCertificado = c.nroCertificado and m.registroEstado='0'), c.ultActualizaUsuario=?, c.ultActualizaFecha=now() where c.nroCertificado in (" + listaCertificadosGuia + ") and c.registroEstado='0'";
                                                ejecutarQUERY_MYSQL(queryUpdateUltMov, [idUsuario], res, funcionName, "false");
                                            }
                                        }

                                        // actualiza stock
                                        if (req.query.tipo = 'ING' || req.query.tipo == 'SAL') { // Realiza la actualizacion
                                            //busca la cantidad de certificados por tipo de Articulo                                                
                                            actualizarStockDetalle(idGuia, idAlmacen, idProveedor, tipo, res, funcionName);
                                            enviarResponse(res, [true]);
                                        } else {
                                            enviarResponse(res, [true]);
                                        }
                                    });
                                    //});
                                });
                            });
                        } else {
                            // No se puede anular la guia
                            enviarResponse(res, [false, "Existen Certificados que sus ultimos movimientos no coinciden con esta Guia"]);
                        }
                    } else {
                        // No se puede anular la guia
                        enviarResponse(res, [false, "Existen Certificados que sus ultimos movimientos no coinciden con esta Guia"]);
                    }
                });
            }
        } else {
            var queryAnularGuia = "Update Guia_movimiento_cabecera set registroEstado='1', ultActualizaUsuario=?, ultActualizaFecha=now() where idGuia_movimiento_cabecera = ?";
            ejecutarQUERY_MYSQL(queryAnularGuia, [idUsuario, idGuia], res, funcionName, "false");
            enviarResponse(res, [true]);
        }
    })
}
exports.getListaCertificado = function (req, res, funcionName) {

    var queryWhere = new QueryWhere("");
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var nombreAsociado = req.query.nombre;
    var docAsociado = req.query.doc;
    var tipoFiltro = req.query.tipoFiltro;
    var confechaLiquidacion = req.query.confechaLiquidacion;

    if (tipoFiltro != "T") { // asociado / fecha Liquidacion
        if (tipoFiltro == 'A') {
            if (nombreAsociado != "") {
                queryWhere.validarWhere(" if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) like '%" + nombreAsociado + "%' ");
            }
            if (docAsociado != "") {
                queryWhere.validarWhere("p.nroDocumento like '" + docAsociado + "%'");
            }
        }
        if (tipoFiltro == 'F') {
            if (confechaLiquidacion == 'true') {
                if (fechaDesde != "" || fechaHasta != "") {
                    if (fechaDesde != "" && fechaHasta != "") {
                        fechaHasta = fechaHasta + " 23:59:59";
                        queryWhere.validarWhere("( c.fechaLiquidacion between '" + fechaDesde + "' and '" + fechaHasta + "' )");
                    } else {
                        if (fechaDesde != "") {
                            queryWhere.validarWhere("c.fechaLiquidacion>='" + fechaDesde + "'");
                        }
                        if (fechaHasta != "") {
                            fechaHasta = fechaHasta + " 23:59:59";
                            queryWhere.validarWhere("c.fechaLiquidacion<='" + fechaHasta + "'");
                        }
                    }
                }
            } else {
                queryWhere.validarWhere("( c.fechaLiquidacion is null or c.fechaLiquidacion='0000-00-00 00:00:00' ) ");
            }
        }
    }

    var query = "Select c.nroCAT, date_format(c.fechaEmision, '%d/%m/%Y %H:%i') as fechaEmision, " +
        "date_format(c.fechaInicio, '%d/%m/%Y') as fechaInicio, " +
        "date_format(c.fechaCaducidad, '%d/%m/%Y') as fechaCaducidad, " +
        "date_format(c.fechaControlInicio, '%d/%m/%Y') as fechaControlInicio, " +
        "date_format(c.fechaControlFin, '%d/%m/%Y') as fechaControlFin, " +
        "c.conDeuda, " +
        "date_format(c.fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, " +
        "se.Nombre as nombreSede, " +
        "if(pco.tipoPersona='J', pco.razonSocial, concat(pco.nombres,' ',pco.apellidoPaterno,' ',pco.apellidoMaterno)) as nombreConcesionario, " +
        "c.prima, " +
        "c.aporte, " +
        "c.comision, " +
        "a.idAsociado, " +
        "p.nroDocumento, " +
        "if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreAsociado, " +
        "v.* , u.nombreUso, cl.nombreClase from Cat c " +
        "inner join Asociado a on c.idAsociado = a.idAsociado " +
        "inner join Persona p on a.idPersona = p.idPersona " +
        "inner join Concesionario co on c.idConcesionario = co.idConcesionario " +
        "inner join Persona pco on co.idPersona = pco.idPersona " +
        "inner join Local se on co.idSede = se.idLocal " +
        "inner join Vehiculo v on c.idVehiculo = v.idVehiculo " +
        "inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo " +
        "inner join Uso_Vehiculo u on ucv.idUso = u.idUso " +
        "inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase " + queryWhere.getQueryWhere() + " order by c.nroCAT";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);
    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "Select count(*) as cantidad from Cat c " +
                    "inner join Asociado a on c.idAsociado = a.idAsociado " +
                    "inner join Persona p on a.idPersona = p.idPersona " +
                    "inner join Concesionario co on c.idConcesionario = co.idConcesionario " +
                    "inner join Persona pco on co.idPersona = pco.idPersona " +
                    "inner join Local se on co.idSede = se.idLocal " +
                    "inner join Vehiculo v on c.idVehiculo = v.idVehiculo " +
                    "inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo " +
                    "inner join Uso_Vehiculo u on ucv.idUso = u.idUso " +
                    "inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase " + queryWhere.getQueryWhere()
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    enviarResponse(res, resultados);
                });
            } else {
                enviarResponse(res, resultados);
            }
        } else {
            enviarResponse(res, resultados);
        }
    });

}
exports.editarContrato = function (req, res, funcionName) {
    // agrega o actualiza el representante legal en la TABLA PERSONA:
    var personaRepresentanteLegal = req.body.repLegal;
    abstractGuardarActualizarPersona_contrato(res, funcionName, personaRepresentanteLegal, function (idPersonaRL) {
        req.body.repLegal.idPersona = idPersonaRL
        // registra o actualiza la empresa en la tabla Persona:
        var personaEmpresa = req.body.empresa
        abstractGuardarActualizarPersona_contrato(res, funcionName, personaEmpresa, function (idPersonaEmpresa) {

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
            ejecutarQUERY_MYSQL(queryUpdateEmpresa, parametros, res, funcionName, function (res, resultados) {

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

                ejecutarQUERY_MYSQL(queryUpdateContrato, params, res, funcionName, function (res, resultados) {
                    var affectedRows = resultados.affectedRows
                    enviarResponse(res, [affectedRows])

                    // Elimina los certificados que no se hayan eliminado en la UI
                    var listaCertificados = req.body.datosFlota
                    for (var i = 0; i < listaCertificados.length; i++) {
                        var certificados_No_eliminar = ""
                        if (listaCertificados[i].registrado == true) {
                            // solo actualiza
                            if (certificados_No_eliminar != "") {
                                certificados_No_eliminar = certificados_No_eliminar + listaCertificados[i] + ", ";
                            }
                            certificados_No_eliminar = certificados_No_eliminar + listaCertificados[i].idContratoCertificado;
                        }
                    }
                    var queryEliminarCertificados = "Delete from Contrato_Certificados where idContrato = ? "
                    if (certificados_No_eliminar != "") {
                        queryEliminarCertificados = queryEliminarCertificados + " and idContratoCertificado not in (" + certificados_No_eliminar + ") ";
                    }
                    //console.log("eliminando certificados")
                    var idContrato = req.body.generales.idContrato
                    var parametros = [idContrato]
                    ejecutarQUERY_MYSQL(queryEliminarCertificados, parametros, res, funcionName, function (res, resultados) {

                        var listaCertificados = req.body.datosFlota
                        var idContrato = req.body.generales.idContrato

                        for (var i = 0; i < listaCertificados.length; i++) {
                            listaCertificados[i].idContrato = idContrato
                            abstractGuardarActualizarVehiculo_contrato(res, funcionName, listaCertificados[i], function (registroCertificado) {

                                var idContrato = registroCertificado.idContrato
                                var nroOrden = registroCertificado.idDetalle
                                var nroCertificado = registroCertificado.nCertificado
                                var idVehiculo = registroCertificado.idVehiculo
                                var valorCuota = registroCertificado.precio / req.body.generales.nroCuotas
                                var nroCuota = 1
                                var precio = registroCertificado.precio
                                var prima = registroCertificado.prima

                                if (registroCertificado.registrado == true) {
                                    // solo actualiza
                                    var idContratoCertificado = registroCertificado.idContratoCertificado
                                    var queryUpdateCertificado = "Update Contrato_Certificados set idContrato=?, nroOrden=?, nroCertificado=?, idVehiculo=?, valorCuota=?, nroCuota=?, precio=?, prima=? where idContratoCertificado = ?";
                                    var params = [idContrato, nroOrden, nroCertificado, idVehiculo, valorCuota, nroCuota, precio, prima, idContratoCertificado]
                                    ejecutarQUERY_MYSQL(queryUpdateCertificado, params, res, funcionName, "false");
                                } else {
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
exports.guardarContrato = function (req, res, funcionName) {
    // agrega o actualiza el representante legal en la TABLA PERSONA:
    var personaRepresentanteLegal = req.body.repLegal;
    abstractGuardarActualizarPersona_contrato(res, funcionName, personaRepresentanteLegal, function (idPersonaRL) {
        req.body.repLegal.idPersona = idPersonaRL
        // registra o actualiza la empresa en la tabla Persona:
        var personaEmpresa = req.body.empresa
        abstractGuardarActualizarPersona_contrato(res, funcionName, personaEmpresa, function (idPersonaEmpresa) {
            req.body.empresa.idPersona = idPersonaEmpresa
            // registra la empresa:
            var idPersona = req.body.empresa.idPersona
            var idRepLegal = req.body.repLegal.idPersona
            var nroResolucion = req.body.empresa.nroResolucion
            var idUsuarioUpdate = req.body.idUsuarioUpdate
            var nombreBreve = req.body.empresa.nombreBreve

            var queryInsertEmpresa = "Insert into EmpresaTransp (idPersona, idRepLegal, nroResolucion, fechaRegistro, ultActualizaUsuario, ultActualizaFecha, nombreCorto) values (?,?,?, now(), ?, now(),?)"
            var params = [idPersona, idRepLegal, nroResolucion, idUsuarioUpdate, nombreBreve]
            ejecutarQUERY_MYSQL(queryInsertEmpresa, params, res, funcionName, function (res, resultados) {
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

                ejecutarQUERY_MYSQL(queryInsertContrato, params, res, funcionName, function (res, resultados) {
                    var idContrato = resultados.insertId;
                    enviarResponse(res, [idContrato])
                    // registra los certificados.
                    var listaCertificados = req.body.datosFlota
                    for (var i = 0; i < listaCertificados.length; i++) {
                        listaCertificados[i].idContrato = idContrato
                        abstractGuardarActualizarVehiculo_contrato(res, funcionName, listaCertificados[i], function (registroCertificado) {
                            // registra el contrato_certificado:
                            var idContrato = registroCertificado.idContrato
                            var nroOrden = registroCertificado.idDetalle
                            var nroCertificado = registroCertificado.nCertificado
                            var idVehiculo = registroCertificado.idVehiculo
                            var valorCuota = registroCertificado.precio / req.body.generales.nroCuotas
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
function abstractGuardarActualizarVehiculo_contrato(res, funcionName, vehiculo, callback) {
    var queryInsert = "Insert into Vehiculo (idUsoClaseVehiculo, placa, nroSerieMotor, marca, modelo, anno, nroAsientos) values (?,?,?,?,?,?,?)";
    var queryUpdate = "Update Vehiculo set idUsoClaseVehiculo=?, placa=?, nroSerieMotor=?, marca=?, modelo=?, anno=?, nroAsientos=? where idVehiculo=?";
    if (vehiculo.idVehiculo == 0) {
        ejecutarQUERY_MYSQL_Extra(vehiculo, queryInsert, [vehiculo.idClase, vehiculo.placa, vehiculo.nroMotor, vehiculo.marca, vehiculo.modelo, vehiculo.anno, vehiculo.nroAsientos], res, funcionName, function (res, resultados, vehiculo) {
            if (typeof callback == 'function') {
                var idVehiculo = resultados.insertId;
                vehiculo.idVehiculo = idVehiculo;
                callback(vehiculo);
            }
        });
    } else {
        ejecutarQUERY_MYSQL_Extra(vehiculo, queryUpdate, [vehiculo.idClase, vehiculo.placa, vehiculo.nroMotor, vehiculo.marca, vehiculo.modelo, vehiculo.anno, vehiculo.nroAsientos, vehiculo.idVehiculo], res, funcionName, function (res, resultados, vehiculo) {
            if (typeof callback == 'function') {
                callback(vehiculo);
            }
        });
    }
}
function abstractGuardarActualizarPersona_contrato(res, funcionName, persona, callback) {
    var queryInsert = "Insert into Persona (tipoPersona, razonSocial, nombres, apellidoPaterno, apellidoMaterno, nroDocumento, telefonoMovil, idDistrito, calle, email) values (?,?,?,?,?,?,?,?,?,?)";
    var queryAdicional = "";
    if (typeof persona.email != "undefined") {
        queryAdicional = queryAdicional + ", email = '" + persona.email + "' ";
    } else {
        persona.email = "";
    }

    var queryUpdate = "Update Persona set razonSocial=?, nombres = ?, apellidoPaterno = ?, apellidoMaterno = ?, telefonoMovil=?, idDistrito=?, calle=? " + queryAdicional + " where idPersona = ? ";

    if (persona.idPersona == 0) { // se registra una nueva persona
        ejecutarQUERY_MYSQL(queryInsert, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.apePaterno, persona.apeMaterno, persona.nroDoc, persona.telefono, persona.distrito, persona.direccion, persona.email], res, funcionName, function (res, resultados) {
            if (typeof callback == 'function') {
                var idPersona = resultados.insertId;
                persona.idPersona = idPersona;
                callback(idPersona);
            }
        });
    } else { // solo se actualizara
        ejecutarQUERY_MYSQL(queryUpdate, [persona.razonSocial, persona.nombres, persona.apePaterno, persona.apeMaterno, persona.telefono, persona.distrito, persona.direccion, persona.idPersona], res, funcionName, function (res, resultados) {
            if (typeof callback == 'function') {
                callback(persona.idPersona);
            }
        });
    }
}
function imprimirCuotaRegistrada(req, res, funcionName, callback) {

    ////console_log("Registra la guia de Liquidacion ...")

    var idConcesionario = req.body.idConcesionario
    var idUsuario = req.body.idUsuarioUpdate
    var idUsuarioResp = req.body.idUsuarioUpdate
    var ultActualizaUsuario = req.body.idUsuarioUpdate

    var queryInsertLiquidacion = "Insert into Liquidacion_ventas_cabecera(fechaLiquidacion, idConcesionario, idUsuarioResp, idUsuario, ultActualizaUsuario, ultActualizaFecha) " +
        "values (now(), ?, ?, ?, ?, now())"

    var parametros = [idConcesionario, idUsuarioResp, idUsuario, ultActualizaUsuario]

    ejecutarQUERY_MYSQL(queryInsertLiquidacion, parametros, res, funcionName, function (res, resultados) {

        var idGuiaLiquidacion = resultados.insertId;

        req.body.idGuiaLiquidacion = idGuiaLiquidacion

        ////console_log("Guia de Liquidacion registrada correctamente : " + idGuiaLiquidacion)

        ////console_log("Registra los detalles de la guia de liquidacion ...")

        var queryInsertVentaDetalles = ""

        var certificadosList = req.body.listaFlota;

        for (var i = 0; i < certificadosList.length; i++) {
            if (i > 0) {
                queryInsertVentaDetalles = queryInsertVentaDetalles + ", ";
            }
            queryInsertVentaDetalles = queryInsertVentaDetalles + "(" + idGuiaLiquidacion + ", " + certificadosList[i].nCertificado + ", " + certificadosList[i].idClase + ", " +
                certificadosList[i].precio + ", 0, " + idUsuario + ", now())"
        }

        queryInsertVentaDetalles = "Insert into Liquidacion_ventas_detalle(idLiquidacion_ventas_cabecera, nroCertificado, claseVehiculo, precio, comision, ultActualizaUsuario, ultActualizaFecha)" +
            " values " + queryInsertVentaDetalles

        ////console_log("Registrando los detalles de la liquidacion con query => " + queryInsertVentaDetalles)

        ejecutarQUERY_MYSQL(queryInsertVentaDetalles, [], res, funcionName, function (res, resultados) {

            ////console_log("Detalles de la liquidacion registrados correctamente ... (Responde al cliente)")

            if (typeof callback == "function") {
                callback([resultados.affectedRows])
            }

            ////console_log("Registrando la liquidacion en los movimientos de los certificados con la funcion registrarCertificadoVendidoCAT() ")

            var certificadosList = req.body.listaFlota;

            for (var i = 0; i < certificadosList.length; i++) {

                certificadosList[i].idConcesionario = req.body.idConcesionario
                certificadosList[i].idGuiaLiquidacion = req.body.idGuiaLiquidacion
                certificadosList[i].idUsuarioResp = req.body.idUsuarioUpdate
                certificadosList[i].ultActualizaUsuario = req.body.idUsuarioUpdate
                certificadosList[i].idPersonaEmpresa = req.body.idPersonaEmpresa

                certificadosList[i].fechaVigenciaCert = req.body.fechaVigenciaCert
                certificadosList[i].fechaRenovacion = req.body.fechaRenovacion
                certificadosList[i].fechaVigenciaContr = req.body.fechaVigenciaContr
                certificadosList[i].nCuotas = req.body.nCuotas
                certificadosList[i].fechaEmision = req.body.fechaEmision

                registrarCertificadoVendidoCAT(res, funcionName, certificadosList[i])

            }
        })
    })
}
exports.imprimirCATS = function (req, res, funcionName) { // Esta opcion es llamada en el boton IMPRIMIR de la ventana de Registros de Contratos

    // 1) Registra el contrato de renovacion con estado = I (Impreso)
    // 2) Actualiza el Estado del Contrato a I=Impreso
    // 3) Registra la Guia de Liquidacion
    // 4) Registra los detalles de liquidacion
    // 5) Guarda lo siguiente (con la funcion registrarCertificadoVendidoCAT() )
    //  5.1 Actualiza la guia de liquidacion dentro del movimiento del los certificados (Tabla Certificado_movimiento)
    //  5.2 Actualiza el certificado con su ultimo movimiento y su estado = 9 (Vendido)
    //  5.3 Registra el CAT => Previamente tiene que buscar o registra el Asociado

    var idContrato = req.body.idContrato;
    var nroCuota = 1;
    var idEmpresaTransp = req.body.idEmpresaTransp
    var fechaRenovacion = req.body.fechaRenovacion
    var flotaActual = req.body.flota
    var certificadosList = req.body.listaFlota

    var totalCuota = 0;
    for (var i = 0; i < certificadosList.length; i++) {
        totalCuota = totalCuota + parseFloat(certificadosList[i].valorCuota)
    }

    ////console_log("Registrando el contrato de la Renovacion ...")

    var queryInsertRenovacion = "Insert into Contrato_Renovacion(idContrato, nroCuota, idEmpresaTransp, fechaRenovacion, flotaActual, totalCuota, estado, fechaPagoCuota) values (?,?,?,?,?,?,'I', now())";
    var parametros = [idContrato, nroCuota, idEmpresaTransp, fechaRenovacion, flotaActual, totalCuota]

    ejecutarQUERY_MYSQL(queryInsertRenovacion, parametros, res, funcionName, function (res, resultados) {

        ////console_log("Actualizando el estado del contrato a Impreso ...")

        var idContrato = req.body.idContrato
        var updateContrato = "Update Contrato set estado = 'I' where idContrato = ?"
        var parametros = [idContrato]

        ejecutarQUERY_MYSQL(updateContrato, parametros, res, funcionName, function (res, resultados) {
            imprimirCuotaRegistrada(req, res, funcionName, function (results) {
                enviarResponse(res, results);
            })
        })
    })
}
function registrarCertificadoVendidoCAT(res, funcionName, registroCertificado) {

    // 1) Registra el movimiento de cada certificado  => TABLA Certificado_movimiento
    // 2) Actualiza el Certificado poniendo el ID del movimiento en la tabla CERTIFICADO, tambien se cambia el estado del Certificado a  9 = Vendido
    // 3) Se registra el CAT (Tabla Cat) previamente registra o busca el id del asociado

    ////console_log("registrando la liquidacion en el movimiento del certificado : " + registroCertificado.nCertificado)

    var ultimoMovimiento = registroCertificado.ultimoMovimiento
    var idGuiaSalida = registroCertificado.idGuiaLiquidacion
    var estado = "V"
    var ultActualizaUsuario = registroCertificado.ultActualizaUsuario

    var queryInsertMovimiento = "Update Certificado_movimiento set fechaSalida=now(), idGuiaSalida=?, estado=?, ultActualizaUsuario=?, ultActualizaFecha=now() where idCertificado_movimiento =? "
    var parametros = [idGuiaSalida, estado, ultActualizaUsuario, ultimoMovimiento]

    ejecutarQUERY_MYSQL_Extra(registroCertificado, queryInsertMovimiento, parametros, res, funcionName, function (res, resultados, certificado) {

        //console_log("movimiento actualizado : " + certificado.ultimoMovimiento + " (Certif:" + certificado.nCertificado + ")")

        //console_log("tambien actualiza el estado de certificado a 9=Vendido")

        var nroCertificado = certificado.nCertificado
        var queryUpdateCertif = "Update Certificado set estadoRegistroCAT = '9', ultActualizaFecha=now() where nroCertificado=? "
        var params = [nroCertificado]

        ejecutarQUERY_MYSQL(queryUpdateCertif, params, res, funcionName, "false")

        registrarAsociado(res, funcionName, certificado, function (certif) {

            //console_log("Registrando CAT => " + certif.nCertificado)

            var nroCAT = certif.nCertificado
            var idAsociado = certif.idAsociado
            var placa = certif.placa
            var marca = certif.marca
            var modelo = certif.modelo
            var annoFabricacion = certif.anno
            var nMotorserie = certif.nroMotor
            var monto = certif.precio / certif.nCuotas
            var prima = certif.prima / certif.nCuotas
            var aporte = monto - prima
            var idConcesionario = certif.idConcesionario
            var fechaEmision = certif.fechaEmision
            var idVehiculo = certif.idVehiculo
            var conDeuda = "N"
            var ultActualizaUsuario = certif.ultActualizaUsuario

            // ** obtiene la fecha de Fin de la vigencia del certificado **
            var mdatec = certif.fechaRenovacion.split("-");
            var dc = new Date(mdatec[0], parseInt(mdatec[1]) - 1, mdatec[2]);
            dc.setMonth(dc.getMonth() + 12 / parseInt(certif.nCuotas));
            certif.fechaVigenciaCertFin = convertirAfechaString(dc, false, false)

            var fechaVigenciaCert = certif.fechaRenovacion
            var fechaVigenciaCertFin = dateTimeFormat(certif.fechaVigenciaCertFin)

            // ** obtiene la fecha de Fin de la vigencia del contrato (Resta un año) **
            var mdateCont = certif.fechaVigenciaContr.split("/");
            var dCont = new Date(mdateCont[2], parseInt(mdateCont[1]) - 1, mdateCont[0], 0, 0, 0, 0);
            dCont.setYear(dCont.getFullYear() + 1);
            certif.fechaVigenciaContrFin = convertirAfechaString(dCont, false, false);

            var fechaVigenciaContr = dateTimeFormat(certif.fechaVigenciaContr)
            var fechaVigenciaContrFin = dateTimeFormat(certif.fechaVigenciaContrFin)

            var queryInsert = "Insert into Cat (nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, fechaInicio, fechaCaducidad, fechaControlInicio, fechaControlFin, monto, prima, aporte, idConcesionario," +
                " fechaEmision, idVehiculo, conDeuda, fechaLiquidacion, ultActualizaUsuario, ultActualizaFecha)" +
                " values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, now(), ?, now())"

            var parametros = [nroCAT, idAsociado, placa, marca, modelo, annoFabricacion, nMotorserie, fechaVigenciaContr, fechaVigenciaContrFin, fechaVigenciaCert, fechaVigenciaCertFin, monto, prima, aporte, idConcesionario, fechaEmision, idVehiculo, conDeuda, ultActualizaUsuario]

            ejecutarQUERY_MYSQL(queryInsert, parametros, res, funcionName, "false")
        })
    })
}
function registrarAsociado(res, funcionName, registroCertificado, callback) { // busca si existe el asociado registrado, sino existe el asociado entonces lo registra

    //console_log("Registra u obtiene el ID del Asociado .. ")

    var idPersonaEmpresa = registroCertificado.idPersonaEmpresa

    var query = "select idAsociado from Asociado where idPersona = ?"

    ejecutarQUERY_MYSQL_Extra(registroCertificado, query, [idPersonaEmpresa], res, funcionName, function (res, resultados, certif) {

        if (resultados.length > 0) {

            //console_log("ya existe el asociado")

            certif.idAsociado = resultados[0].idAsociado
            callback(certif)
        } else {
            //console_log("No existe el asociado, se registrara ...")

            var idPersonaEmpresa = certif.idPersonaEmpresa
            var queryInsertAsociado = "Insert into Asociado (idPersona) values (?)";

            ejecutarQUERY_MYSQL_Extra(certif, queryInsertAsociado, [idPersonaEmpresa], res, funcionName, function (res, resultados, certifResult) {

                var idAsociado = resultados.insertId
                certifResult.idAsociado = idAsociado
                callback(certifResult)

            })
        }
    })
}
exports.getContratoDetalle = function (req, res, funcionName) { // obtiene toda la informacion de un contrato
    getInfoContrato(req, res, "getInfoContrato", function (results) {
        enviarResponse(res, results)
    })
}
function getInfoContrato(req, res, funcionName, callback) {

    var idContrato = req.query.idContrato;

    var query = "select idContrato, date_format(fechaEmision, '%d/%m/%Y') as fechaEmision," +
        " date_format(fechaVigenciaContr, '%d/%m/%Y') as fechaVigenciaContr, date_format(DATE_ADD(c.fechaVigenciaContr, INTERVAL 1 YEAR), '%d/%m/%Y') as fechaVigenciaContrFin, " +
        " date_format(fechaVigenciaCert, '%d/%m/%Y') as fechaVigenciaCert," +
        " nCuotas, flota, c.estado, e.idEmpresaTransp," +
        " e.nombreCorto as nombreEmpresa, e.nroResolucion, pe.idPersona as idPersonaEmpresa, pe.tipoPersona, concat(pe.nombres,' ',pe.apellidoPaterno,' ',pe.apellidoMaterno) as nombreNaturalEmpresa, pe.razonSocial, pe.nroDocumento as nroDocumentoPersonaEmpr, pe.telefonoMovil, pe.telefonoFijo, " +
        " pe.calle as direccionEmpresa, d.nombre as distritoEmpresa, prl.nroDocumento as DNIReprLegal/*, date_format(r.fechaPagoCuota, '%d/%m/%Y') as fechaPagoCuota*/" +
        " from Contrato c" +
        " inner join EmpresaTransp e on c.idEmpresaTransp = e.idEmpresaTransp" +
        " inner join Persona pe on e.idPersona = pe.idPersona" +
        " inner join Persona prl on e.idRepLegal = prl.idPersona" +
        " left join Distrito d on pe.idDistrito = d.idDistrito " +
        " where c.idContrato=?"

    var parametros = [idContrato]

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, resultados) {

        if (resultados.length > 0) {
            var nroCuota = req.query.nroCuota
            if (nroCuota == undefined) {
                nroCuota = 1
            }
            var queryCertificadosFlota = "Select c.idContratoCertificado, c.nroOrden, " +
                " c.nroCertificado as nCertificado, ce.ultimoMovimiento, c.estadoVehiculo as estado, c.precio, c.prima, c.valorCuota, c.nroCuota," +
                " v.idVehiculo, v.placa, v.nroSerieMotor as nroMotor, v.marca, v.modelo, v.anno, v.nroAsientos," +
                " u.idUso, u.nombreUso, ucv.idUsoClaseVehiculo as idClase, cv.nombreClase as clase" +
                " from Contrato_Certificados c" +
                " inner join Vehiculo v on c.idVehiculo = v.idVehiculo" +
                " left join Certificado ce on c.nroCertificado = ce.nroCertificado " +
                " inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo" +
                " inner join Uso_Vehiculo u on ucv.idUso = u.idUso" +
                " inner join Clase_Vehiculo cv on ucv.idClaseVehiculo = cv.idClase " +
                " where c.idContrato = ? and c.nroCuota=? order by c.nroOrden"

            var idContrato = req.query.idContrato;
            var params = [idContrato, nroCuota]

            ejecutarQUERY_MYSQL_Extra(resultados, queryCertificadosFlota, params, res, funcionName, function (res, resultados, resultadosPrevios) {

                resultadosPrevios[0].listaFlota = resultados

                callback(resultadosPrevios)

            })
        } else {
            callback([])
        }
    })
}
exports.reporteContratoExcel = function (req, res, funcionName) {
    getInfoContrato(req, res, "getInfoContrato", function (results) {
        // genera el reporte excel
        results = results[0]
        var nroContrato = results.idContrato
        var cantDigitos = results.idContrato.toString().split("").length;
        var cantDeCeros = cantidadDigitosLPAD - cantDigitos;
        for (var i = 0; i < cantDeCeros; i++) {
            nroContrato = "0" + nroContrato;
        }
        results.nroContrato = nroContrato
        // ** obtiene la fecha de Fin de la vigencia del certificado **
        var mdatec = results.fechaVigenciaCert.split("/");
        var dc = new Date(mdatec[2], parseInt(mdatec[1]) - 1, mdatec[0]);
        dc.setMonth(dc.getMonth() + 12 / parseInt(results.nCuotas));
        results.fechaVigenciaCertFin = convertirAfechaString(dc, false, false)

        // ** obtiene la fecha de Fin de la vigencia del contrato (Resta un año) **
        var mdateCont = results.fechaVigenciaContr.split("/");
        var dCont = new Date(mdateCont[2], parseInt(mdateCont[1]) - 1, mdateCont[0], 0, 0, 0, 0);
        dCont.setYear(dCont.getFullYear() + 1);
        results.fechaVigenciaContrFin = convertirAfechaString(dCont, false, false);

        var Excel = require('exceljs');
        var workbook = new Excel.Workbook();
        var worksheetDatos = workbook.addWorksheet('Datos'); // primera hoja
        worksheetDatos.columns = [
            { header: 'Nro certificado', key: 'nCertificado' },
            { header: 'Nro contrato', key: 'nroContrato' }, //  = Auto ancho
            { header: 'Nro Orden', key: 'nroOrden' },
            { header: 'Nombre', key: 'nombreEmpresa' },
            { header: 'RUC', key: 'nroDocEmpresa' },
            { header: 'Direccion', key: 'domicilio' },
            { header: 'Telefono', key: 'telefono' },
            { header: 'Placa', key: 'placa' },
            { header: 'Clase', key: 'clase' },
            { header: 'Uso', key: 'nombreUso' },
            { header: 'Año', key: 'anno' },
            { header: 'Asiento', key: 'nroAsientos' },
            { header: 'Marca', key: 'marca' },
            { header: 'Modelo', key: 'modelo' },
            { header: 'Motor', key: 'nroMotor' },
            { header: 'Vigencia Con Ini', key: 'fechaVigenciaContr' },
            { header: 'Vigencia Con Fin', key: 'fechaVigenciaContrFin' },
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

        for (var i = 0; i < flotaVehiculos.length; i++) {

            flotaVehiculos[i].fechaEmision = results.fechaEmision
            //flotaVehiculos[i].nombreEmpresa =results.nombreEmpresa
            flotaVehiculos[i].tipoPersona = results.tipoPersona
            if (flotaVehiculos[i].tipoPersona == 'N') {
                flotaVehiculos[i].nombreEmpresa = results.nombreNaturalEmpresa
            } else {
                flotaVehiculos[i].nombreEmpresa = results.razonSocial
            }

            flotaVehiculos[i].nroDocEmpresa = results.nroDocumentoPersonaEmpr
            flotaVehiculos[i].nroContrato = results.nroContrato
            flotaVehiculos[i].fechaVigenciaContr = results.fechaVigenciaContr
            flotaVehiculos[i].fechaVigenciaContrFin = results.fechaVigenciaContrFin
            flotaVehiculos[i].fechaVigenciaCert = results.fechaVigenciaCert
            flotaVehiculos[i].fechaVigenciaCertFin = results.fechaVigenciaCertFin
            var indexRow = startRow + razon * i;
            //console_log("fila  :" + indexRow)
            worksheet.getCell('F' + indexRow).value = flotaVehiculos[i].placa
            worksheet.getCell('H' + indexRow).value = flotaVehiculos[i].clase

            worksheet.getCell('F' + (indexRow + 1)).value = flotaVehiculos[i].anno
            worksheet.getCell('H' + (indexRow + 1)).value = flotaVehiculos[i].marca

            worksheet.getCell('F' + (indexRow + 3)).value = flotaVehiculos[i].nroAsientos
            worksheet.getCell('H' + (indexRow + 3)).value = flotaVehiculos[i].modelo

            worksheet.mergeCells('F' + (indexRow + 5) + ':G' + (indexRow + 5));
            worksheet.getCell('F' + (indexRow + 5)).value = flotaVehiculos[i].nombreUso
            worksheet.getCell('F' + (indexRow + 5)).alignment = { wrapText: true };
            worksheet.getCell('H' + (indexRow + 5)).value = flotaVehiculos[i].nroMotor

            // numero de contrato:
            worksheet.getCell("C" + (indexRow + 6)).value = results.nroContrato
            worksheet.getCell("D" + (indexRow + 6)).value = flotaVehiculos[i].nroOrden
            // vigencia contrato
            worksheet.getCell("C" + (indexRow + 8)).value = results.fechaVigenciaContr
            worksheet.getCell("C" + (indexRow + 9)).value = results.fechaVigenciaContrFin

            // vigencia de certificado
            worksheet.getCell("E" + (indexRow + 8)).value = results.fechaVigenciaCert
            worksheet.getCell("E" + (indexRow + 9)).value = results.fechaVigenciaCertFin

            worksheet.getCell("K" + (indexRow + 8)).value = flotaVehiculos[i].placa
            worksheet.getCell("K" + (indexRow + 9)).value = results.fechaVigenciaCert
            worksheet.getCell("K" + (indexRow + 10)).value = results.fechaVigenciaCertFin

            worksheet.mergeCells('C' + (indexRow + 12) + ':H' + (indexRow + 12));

            worksheet.getCell("C" + (indexRow + 12)).value = flotaVehiculos[i].nombreEmpresa
            worksheet.getCell('C' + (indexRow + 12)).alignment = { wrapText: true };

            worksheet.getCell("C" + (indexRow + 14)).value = results.nroDocumentoPersonaEmpr
            var telefono = results.telefonoMovil;
            if (telefono == null || telefono == "") {
                telefono = results.telefonoFijo
            }
            flotaVehiculos[i].telefono = telefono
            worksheet.getCell("E" + (indexRow + 14)).value = telefono

            worksheet.mergeCells('B' + (indexRow + 16) + ':F' + (indexRow + 16));
            worksheet.getCell("B" + (indexRow + 16)).value = results.direccionEmpresa + ", " + results.distritoEmpresa;
            worksheet.getCell('B' + (indexRow + 16)).alignment = { wrapText: true };

            flotaVehiculos[i].domicilio = results.direccionEmpresa + ", " + results.distritoEmpresa

            worksheet.getCell("H" + (indexRow + 15)).value = convertirAfechaString(new Date(), true, false)
            worksheet.getCell("H" + (indexRow + 16)).value = "S/." + number_format(flotaVehiculos[i].precio, 2)
            flotaVehiculos[i].monto = number_format(flotaVehiculos[i].precio, 2)
            worksheetDatos.addRow(flotaVehiculos[i])
        }

        var tempFilePath = tempfile('.xlsx');
        workbook.xlsx.writeFile(tempFilePath).then(function () {
            //console.log('file is written');
            res.setHeader('Content-Disposition', 'attachment; filename=Contrato nro ' + results.nroContrato + '.xlsx');
            res.sendFile(tempFilePath, function (err) {
                console.log('---------- error downloading file: ' + err);
            });
        });
    })
}
exports.actualizarFlota = function (req, res, funcionName) {
    enviarResponse(res, [1]);
    var listaCertificados = req.body.listaCertificados;
    for (var i = 0; i < listaCertificados.length; i++) {
        listaCertificados[i].idContrato = req.body.idContrato
        listaCertificados[i].nroCuota = req.body.nroCuota
        abstractGuardarActualizarVehiculo_contrato(res, funcionName, listaCertificados[i], function (registroCertificado) {
            // registra el contrato_certificado:
            var idContratoCertificado = registroCertificado.idContratoCertificado
            var parametros;
            var query;
            if (idContratoCertificado == undefined) { // inserta
                query = "Insert Contrato_Certificados(idContrato, nroOrden, idVehiculo, nroCuota, prima, estadoVehiculo) values (?,?,?,?,?,?)";
                var idContrato = registroCertificado.idContrato
                var nroOrden = registroCertificado.nroOrden
                var idVehiculo = registroCertificado.idVehiculo
                var nroCuota = registroCertificado.nroCuota
                var prima = registroCertificado.prima
                var estado = registroCertificado.estado;
                parametros = [idContrato, nroOrden, idVehiculo, nroCuota, prima, estado]
            } else { // solo actualiza el estado
                var estado = registroCertificado.estado;
                query = "Update Contrato_Certificados set estadoVehiculo = ? where idContratoCertificado = ?";
                parametros = [estado, idContratoCertificado]
            }
            ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "false");

        })
    }
}
exports.guardarRenovacion = function (req, res, funcionName) {
    // inserta el registro en nuevo CONTRATO_RENOVACION
    var idContrato = req.body.generales.idContrato;
    var nroCuota = req.body.generales.nroCuota;
    var idEmpresaTransp = req.body.generales.idEmpresaTransp;
    var fechaRenovacion = req.body.generales.fechaRenovacion;
    var flotaActual = req.body.generales.flotaActual;
    var totalCuota = req.body.generales.totalCuota;

    var queryInsert = "Insert into Contrato_Renovacion(idContrato, nroCuota, idEmpresaTransp, fechaRenovacion, flotaActual, totalCuota, fechaPagoCuota) values (?,?,?,?,?,?, now())";
    var parametros = [idContrato, nroCuota, idEmpresaTransp, fechaRenovacion, flotaActual, totalCuota]
    ejecutarQUERY_MYSQL(queryInsert, parametros, res, funcionName, function (res, resultados) {

        var idContrato_renovacion = resultados.insertId;
        enviarResponse(res, [idContrato_renovacion])

        // inserta los nuevos registros en la tabla Contrato_certificados

        var listaCertificados = req.body.datosFlota
        for (var i = 0; i < listaCertificados.length; i++) {
            listaCertificados[i].idContrato = req.body.generales.idContrato
            abstractGuardarActualizarVehiculo_contrato(res, funcionName, listaCertificados[i], function (registroCertificado) {
                // registra el contrato_certificado:
                var idContrato = registroCertificado.idContrato
                var nroOrden = registroCertificado.nroOrden
                var nroCertificado = registroCertificado.nCertificado
                var valorCuota = registroCertificado.valorCuota
                var idVehiculo = registroCertificado.idVehiculo
                var nroCuota = req.body.generales.nroCuota
                var precio = registroCertificado.precio
                var prima = registroCertificado.prima
                var estado = registroCertificado.estado

                var queryInsertCertificado = "Insert into Contrato_Certificados (estadoVehiculo, idContrato, nroOrden, nroCertificado, idVehiculo, valorCuota, nroCuota, precio, prima) values (?,?,?,?,?,?,?,?,?)"
                var params = [estado, idContrato, nroOrden, nroCertificado, idVehiculo, valorCuota, nroCuota, precio, prima]
                ejecutarQUERY_MYSQL(queryInsertCertificado, params, res, funcionName, "false");
            })
        }
    })
}
exports.imprimirCuota = function (req, res, funcionName) {
    var idContrato = req.body.idContrato
    var nroCuota = req.body.nroCuota
    var updateEstadoRenovacion = "Update Contrato_Renovacion set estado='I' where idContrato=? and nroCuota=? ";
    var parametros = [idContrato, nroCuota]
    ejecutarQUERY_MYSQL(updateEstadoRenovacion, parametros, res, funcionName, function (res, resultados) {
        imprimirCuotaRegistrada(req, res, "imprimirCuotaRegistrada", function (results) {
            enviarResponse(res, results)
        })
    })
}
exports.actualizarCuota = function (req, res, funcionName) {
    enviarResponse(res, [1]);
    var listaCertificados = req.body.datosFlota;
    for (var i = 0; i < listaCertificados.length; i++) {
        listaCertificados[i].idContrato = req.body.generales.idContrato
        listaCertificados[i].nroCuota = req.body.generales.nroCuota
        abstractGuardarActualizarVehiculo_contrato(res, funcionName, listaCertificados[i], function (registroCertificado) {

            // actualia el contrato_certificado:

            var idContratoCertificado = registroCertificado.idContratoCertificado
            var idVehiculo = registroCertificado.idVehiculo
            var prima = registroCertificado.prima
            var precio = registroCertificado.precio
            var valorCuota = registroCertificado.valorCuota
            var query = "Update Contrato_Certificados set idVehiculo=?, prima=?, precio=?, valorCuota=? where idContratoCertificado = ?";
            var parametros = [idVehiculo, prima, precio, valorCuota, idContratoCertificado]
            ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "false");

        })
    }
}
exports.getCuotasPagadasPorContrato = function (req, res, funcionName) {
    var idContrato = req.query.idContrato;
    var query = "Select idContratoRenovacion, estado, nroCuota, date_format(fechaPagoCuota, '%d/%m/%Y') as fechaPagoCuota, date_format(fechaRenovacion, '%d/%m/%Y') as fechaRenovacion, flotaActual, totalCuota from Contrato_Renovacion where idContrato=? and estado='I' order by nroCuota"
    var parametros = [idContrato]
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName)
}
exports.getCuotasPorEmpresa = function (req, res, funcionName) {
    var idEmpresaTransp = req.query.idEmpresa
    var query = "Select idContratoRenovacion, idContrato, nroCuota from Contrato_Renovacion where idEmpresaTransp = ? and estado NOT IN ('A') and idRegistroVenta is NULL"
    var parametros = [idEmpresaTransp]
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName)
}
exports.validarCATParaEmisionPorPersona = function (req, res, funcionName) {
    var nroCAT = req.query.nroCAT
    var query = "Select count(*) as CATPermitido from Cat where nroCAT = ? and tipoPersona='N' and idDeposito is not null "
    query += " and idRegistroVenta is null" // 26/03/19 >> Debe validarse si ya se facturó
    var parametros = [nroCAT]
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName)
}
function registrarVentaTempDesdeCAT(req, res, funcionName, tipoDocumento, descripcion, nroCATList, contador, callback) {

    var query = "Select c.nroCAT, v.placa, c.idAsociado, pe.idPersona, pe.tipoPersona, pe.nroDocumento, " +
        "if(pe.tipoPersona='J', pe.razonSocial, concat(pe.nombres,' ',pe.apellidoPaterno,' ',pe.apellidoMaterno)) as nombreAsociado, pe.idDistrito, pe.calle, pe.nro, ucv.idUso, " +
        "ucv.idClaseVehiculo, v.modelo, v.anno, c.comision, c.prima, c.aporte ,c.fechaLiquidacion " +
        "from Cat c inner join Vehiculo v on c.idVehiculo = v.idVehiculo " +
        "inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo " +
        "inner join Asociado a on c.idAsociado = a.idAsociado " +
        "inner join Persona pe on a.idPersona = pe.idPersona " +
        "where c.nroCAT in (" + nroCATList + ")"

    ejecutarQUERY_MYSQL(query, [], res, "registrarVentaTempDesdeCAT", function (res, catList) {
        // registra la venta cabecera
        if (catList.length > 0) {
            var constantesGeneralesFields = {
                "BV": { "serie": "BVNroSerie", "correlativo": "BVCorrelativoActual" },
                "FA": { "serie": "FACTNroSerie", "correlativo": "FACTCorrelativoActual" }
            }

            var queryVentaTemp = "Insert into RegistroVentaTemp(tipo, serie, numero, fechaEmision, descripcion, idAsociado, tipoPersona, nroDocumento, nombreAsociado, idDistrito, calle, nro) " +
                "values (?, (select " + constantesGeneralesFields[tipoDocumento].serie + " from ConstantesGenerales limit 1), " +
                "(select " + constantesGeneralesFields[tipoDocumento].correlativo + " + " + contador + " from ConstantesGenerales limit 1), ?,?,?,?,?,?,?,?,?)"

            var idAsociado = catList[0].idAsociado
            var tipoPersona = catList[0].tipoPersona
            var nroDocumento = catList[0].nroDocumento
            var nombreAsociado = catList[0].nombreAsociado
            var idDistrito = catList[0].idDistrito
            var calle = catList[0].calle
            var nro = catList[0].nro
            var fechaLiquidacion = catList[0].fechaLiquidacion //Antes guardaba now(), FechaEmision debe ser Fecha Liquidacion CAT

            var arrayParametros = [tipoDocumento, fechaLiquidacion, descripcion, idAsociado, tipoPersona, nroDocumento, nombreAsociado, idDistrito, calle, nro]

            //console_log("REGISTRANDO LA VENTA con parametros : " + arrayParametros)

            ejecutarQUERY_MYSQL(queryVentaTemp, arrayParametros, res, "INGRESO_DE_VENTA_TEMPORAL", function (res, resultados) {
                var VENT_TEMP_ID = resultados.insertId;
                //console_log("REGISTRANDO DETALLES A LA VENT_TEMP_ID : " + VENT_TEMP_ID)
                // realiza un registro multiple:
                var queryDetalle = "Insert into RegistroVentaDetalleTemp(idRegistroVentaTemp, nroCAT, placa, modelo, anno, usoVehiculo, claseVehiculo, prima, aporte, comision) VALUES ";

                var parametrosString = ""
                for (var i = 0; i < catList.length; i++) {
                    if (parametrosString != "") {
                        parametrosString = parametrosString + ", "
                    }
                    parametrosString = parametrosString + "(" + VENT_TEMP_ID + ", '" + catList[i].nroCAT + "', '" + catList[i].placa + "', '" + catList[i].modelo + "', " +
                        "'" + catList[i].anno + "', '" + catList[i].idUso + "', '" + catList[i].idClaseVehiculo + "', '" + catList[i].prima + "', '" + catList[i].aporte + "', '" + catList[i].comision + "')"
                }

                var finalQuery = queryDetalle + parametrosString
                ejecutarQUERY_MYSQL(finalQuery, [], res, "insertando Detalles temporales", function (res, results) {
                    callback(VENT_TEMP_ID)
                })
            })
        }
    })
}
exports.borrarTempVentas = function (req, res, funcionName) {
    // truncate tables temporales
    var queryTruncateCabeceras = "truncate table RegistroVentaTemp"
    ejecutarQUERY_MYSQL(queryTruncateCabeceras, [], res, funcionName, function () {
        var queryTruncateDetalles = "truncate table RegistroVentaDetalleTemp"
        ejecutarQUERY_MYSQL(queryTruncateDetalles, [], res, funcionName, function () {
            res.send(["TABLAS BORRADAS"]);
        })
    })
}
exports.guardarEmisionBVFACT = function (req, res, funcionName) {
    // truncate tables temporales
    var queryTruncateCabeceras = "truncate table RegistroVentaTemp"
    ejecutarQUERY_MYSQL(queryTruncateCabeceras, [], res, funcionName,
        function () {
            var queryTruncateDetalles = "truncate table RegistroVentaDetalleTemp"
            ejecutarQUERY_MYSQL(queryTruncateDetalles, [], res, funcionName, function () {
                var tipoEmision = req.query.tipoEmision
                switch (tipoEmision) {
                    case 'tipoPersona':
                        var nroCAT = req.query.nroCAT
                        var descripcionGlosa = req.query.descripcionGlosa
                        registrarVentaTempDesdeCAT(req, res, "registrarVentaTempDesdeCAT", "BV", descripcionGlosa, [nroCAT], 1, function (registroTempId) {
                            enviarResponse(res, [registroTempId])
                        })
                        break;
                    case 'tipoEmpresa':     //Bloqueado temporalmente
                        var idContratoRenovacion = req.query.idContratoRenovacion
                        //console_log("obtiene la lista de certificados del contrato_renovacion : " + idContratoRenovacion)
                        var query = "Select nroCertificado from Contrato_Certificados where idContrato = (select cr.idContrato from Contrato_Renovacion cr where cr.idContratoRenovacion = ?)"
                        var parametros = [idContratoRenovacion]
                        ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, resultsCAT) {
                            var listaCATS = []
                            for (var i = 0; i < resultsCAT.length; i++) {
                                listaCATS.push(resultsCAT[i].nroCertificado)
                            }

                            if (listaCATS.length > 0) {
                                var descripcionGlosa = req.query.descripcionGlosa
                                registrarVentaTempDesdeCAT(req, res, "registrarVentaTempDesdeCAT", "FA", descripcionGlosa, listaCATS, 1, function (registroTempId) {
                                    enviarResponse(res, [registroTempId])
                                })
                            } else {
                                enviarResponse(res, ["NO SE ENCONTRARON CATS DISPONIBLES!"])
                            }

                        })
                        break;
                    case 'tipoMultiples':
                        var hoy = new Date(); //YYYY/mm/dd hh:mm:ss actual
                        var fechActual = dateTimeFormat(convertirAfechaString(hoy)); //dateTimeFormat($("#idFecha").val())
                        hoy.setDate(hoy.getDate() - 7); //Antiguedad maxima de los CPE
                        var ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0); //YYYY/mm/dd 00:00:00
                        var fechaLimite = dateTimeFormat(convertirAfechaString(ayer)); //dateTimeFormat($("#idFecha").val())
                        //var fechaLimite =  req.query.fechaLimite
                        ////console_log("Obteniendo CATs con fecha liquidacion en el rango: " + fechaLimite + " >> " + fechActual);

                        var query = "Select tipoPersona, idAsociado, idContrato_Renovacion, nroCAT from Cat where fechaLiquidacion >= ? and fechaLiquidacion<=? and idDeposito is not null ";
                        query += " and idRegistroVenta is null " //and tipoPersona='N' " // 26/03/19 >> Debe validarse si ya se facturó y es Pers. Natural=> NO! debe incluirse Pers. Jur.
                        query += " order by tipoPersona, idAsociado, idContrato_Renovacion "
                        var parametros = [fechaLimite, fechActual]

                        ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, resultsCAT) {
                            var grupoCATS = []
                            for (var i = 0; i < resultsCAT.length; i++) {
                                if (resultsCAT[i].tipoPersona == 'N') {
                                    grupoCATS.push({
                                        tipoPersona: resultsCAT[i].tipoPersona,
                                        tipo: "BV",
                                        nroCATList: [resultsCAT[i].nroCAT]
                                    })
                                } else if (resultsCAT[i].tipoPersona == 'J' && resultsCAT[i].idContrato_Renovacion == null) {
                                    grupoCATS.push({
                                        tipoPersona: resultsCAT[i].tipoPersona,
                                        tipo: "FA",
                                        nroCATList: [resultsCAT[i].nroCAT]
                                    })
                                }
                                else {
                                    var found = false
                                    for (var y = 0; y < grupoCATS.length; y++) {
                                        if (grupoCATS[y].tipoPersona == 'J' && grupoCATS[y].idContrato_Renovacion == resultsCAT[i].idContrato_Renovacion) {
                                            found = true
                                            grupoCATS[y].nroCATList.push(resultsCAT[i].nroCAT)
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        grupoCATS.push({
                                            tipoPersona: resultsCAT[i].tipoPersona,
                                            tipo: "FA",
                                            idContrato_Renovacion: resultsCAT[i].idContrato_Renovacion,
                                            nroCATList: [resultsCAT[i].nroCAT]
                                        })
                                    }
                                }
                            }
                            //console_log("Insertando registro por fecha liquidacion : " + JSON.stringify(grupoCATS))
                            if (grupoCATS.length > 0) {
                                var descripcionGlosa = req.query.descripcionGlosa
                                req.query.cantidadGrupoCATS = grupoCATS.length;
                                req.query.contadorGrupos = 0;
                                req.query.collectIds = []
                                var contBOL = 0;
                                var contFA = 0;
                                for (var y = 0; y < grupoCATS.length; y++) {
                                    var tipo = grupoCATS[y].tipo
                                    var cont;
                                    if (tipo == 'FA') {
                                        contFA = contFA + 1
                                        cont = contFA
                                    }
                                    if (tipo == 'BV') {
                                        contBOL = contBOL + 1
                                        cont = contBOL
                                    }
                                    var listaCATS = grupoCATS[y].nroCATList
                                    registrarVentaTempDesdeCAT(req, res, "registrarVentaTempDesdeCAT", tipo, descripcionGlosa, listaCATS, cont, function (registroTempId) {
                                        if (registroTempId > 0) {
                                            req.query.collectIds.push(registroTempId)
                                            req.query.contadorGrupos = req.query.contadorGrupos + 1
                                            if (req.query.contadorGrupos == req.query.cantidadGrupoCATS) {
                                                enviarResponse(res, req.query.collectIds)
                                            }
                                        }
                                    })
                                }
                            } else {
                                enviarResponse(res, ["NO SE ENCONTRARON CATS DISPONIBLES CON 7 DIAS DE ANTIGÜEDAD, COMO MAXIMO!"])
                            }
                        })
                        break;
                }
            })
        })
}
exports.generarExcelBVFACTemporal = function (req, res, funcionName) {

    var idRegistroVentaTemp = req.query.idRegistro.split(",")
    generarExcelTemporal(req, res, funcionName, idRegistroVentaTemp)

}

exports.listarRegistroVentaTemporales = function (req, res, funcionName) {
    getRegistroVentaTemporales("ALL", req, res, "getRegistroVentaTemporales", function (registros) {
        enviarResponse(res, registros)
    })
}

function getRegistroVentaTemporales(listaRegistroVentas, req, res, funcionName, callback) {

    var query;
    if (listaRegistroVentas == "ALL") {
        query = "Select r.idRegistroVentaTemp, r.tipo, r.serie, r.numero, date_format(r.fechaEmision, '%d/%m/%Y') as fechaEmision, r.descripcion, r.idAsociado, r.nroDocumento, r.nombreAsociado, d.nombre as nombreDistrito, r.calle, r.nro from RegistroVentaTemp r left join Distrito d on r.idDistrito = d.idDistrito order by r.idRegistroVentaTemp"
    } else {
        query = "Select r.idRegistroVentaTemp, r.tipo, r.serie, r.numero, date_format(r.fechaEmision, '%d/%m/%Y') as fechaEmision, r.descripcion, r.idAsociado, r.nroDocumento, r.nombreAsociado, d.nombre as nombreDistrito, r.calle, r.nro from RegistroVentaTemp r left join Distrito d on r.idDistrito = d.idDistrito where r.idRegistroVentaTemp in (" + listaRegistroVentas + ") order by r.idRegistroVentaTemp"
    }

    var parametros = []
    ////console_log("obteniendo cabeceras")

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, registroList) {

        var queryDetalles

        if (listaRegistroVentas == "ALL") {
            queryDetalles = "select d.idRegistroVentaDetalleTemp, d.idRegistroVentaTemp, d.nroCAT, d.placa, d.modelo, d.anno, d.usoVehiculo, d.claseVehiculo, d.prima, d.aporte, d.comision , (select concat(pv.numerodocumento,'|',pv.apellido_paterno,' ',pv.apellido_materno,' ',pv.nombres_razonsocial) from cat c join propietario_vehiculo pv on c.idVehiculo = pv.idVehiculo where c.nroCat = d.nroCAT LIMIT 1 ) as datos_propietario from RegistroVentaDetalleTemp d order by d.idRegistroVentaTemp, d.idRegistroVentaDetalleTemp;";
            //queryDetalles = "select d.idRegistroVentaDetalleTemp, d.idRegistroVentaTemp, d.nroCAT, d.placa, d.modelo, d.anno, d.usoVehiculo, d.claseVehiculo, d.prima, d.aporte, d.comision from RegistroVentaDetalleTemp d order by d.idRegistroVentaTemp, d.idRegistroVentaDetalleTemp"

        } else {
            queryDetalles = "select d.idRegistroVentaDetalleTemp, d.idRegistroVentaTemp, d.nroCAT, d.placa, d.modelo, d.anno, d.usoVehiculo, d.claseVehiculo, d.prima, d.aporte, d.comision from RegistroVentaDetalleTemp d where d.idRegistroVentaTemp in (" + listaRegistroVentas + ") order by d.idRegistroVentaTemp, d.idRegistroVentaDetalleTemp"
        }

        //console.log("------------");
        //console.log(queryDetalles);

        var found
        ejecutarQUERY_MYSQL(queryDetalles, [], res, "getDetalleTemporal", function (res, detalleList) {

            //console.log(detalleList);
            for (var i = 0; i < registroList.length; i++) {
                registroList[i].detalles = []
                registroList[i].domicilio = registroList[i].calle + ((registroList[i].nro == null) ? "" : " " + registroList[i].nro)
                found = false
                for (var y = 0; y < detalleList.length; y++) {
                    if (detalleList[y].idRegistroVentaTemp == registroList[i].idRegistroVentaTemp) {

                        if (found == false) {
                            detalleList[y].tipo = registroList[i].tipo
                            detalleList[y].serie = registroList[i].serie
                            detalleList[y].numero = registroList[i].numero
                            detalleList[y].fechaEmision = registroList[i].fechaEmision
                            detalleList[y].descripcion = registroList[i].descripcion
                            detalleList[y].idAsociado = registroList[i].idAsociado
                            detalleList[y].nombreAsociado = registroList[i].nombreAsociado
                            detalleList[y].nroDocumento = registroList[i].nroDocumento
                            detalleList[y].nombreDistrito = registroList[i].nombreDistrito
                            detalleList[y].domicilio = registroList[i].domicilio
                            detalleList[y].observaciones = ""
                            detalleList[y].idRegistro = registroList[i].idRegistroVentaTemp // id opcional
                            detalleList[y].datoPropietario = registroList[i].datos_propietario
                            detalleList[y].checkhtml = "<input "+ ( registroList[i].tipo == 'FA' ? "" : 'disabled' ) +" type='checkbox' onclick='checkPropietario("+ registroList[i].idRegistroVentaTemp+",$(this))' />"
                            detalleList[y].flagFacturaAPropietario = false;
                            found = true
                        } else {
                            detalleList[y].idRegistroVentaTemp = ""
                            detalleList[y].tipo = ""
                            detalleList[y].serie = ""
                            detalleList[y].numero = ""
                            detalleList[y].fechaEmision = ""
                            detalleList[y].descripcion = ""
                            detalleList[y].idAsociado = ""
                            detalleList[y].nombreAsociado = ""
                            detalleList[y].nroDocumento = ""
                            detalleList[y].nombreDistrito = ""
                            detalleList[y].domicilio = ""
                            detalleList[y].observaciones = ""
                            detalleList[y].idRegistro = registroList[i].idRegistroVentaTemp // id opcional
                            detalleList[y].datoPropietario = "";
                            detalleList[y].checkhtml = "";
                            detalleList[y].flagFacturaAPropietario = false;


                        }

                    }
                }
            }
            //console.log(detalleList);
            callback(detalleList)
        })

    })
}


function generarExcelTemporal(req, res, funcionName, listaRegistroVentas) {

    getRegistroVentaTemporales(listaRegistroVentas, req, res, "getRegistroVentaTemporales", function (detalleList) {

        //console_log("Generando excel!!")

        var Excel = require('exceljs');
        var workbook = new Excel.Workbook();
        var worksheetDatos = workbook.addWorksheet('Registro');

        worksheetDatos.columns = [
            { header: 'ID', key: 'idRegistroVentaTemp' },
            { header: 'Tipo', key: 'tipo' }, //  = Auto ancho
            { header: 'Serie', key: 'serie' },
            { header: 'Numero', key: 'numero' },
            { header: 'Fecha Emision', key: 'fechaEmision' },
            { header: 'Descripcion', key: 'descripcion' },
            { header: 'Asociado', key: 'nombreAsociado' },
            { header: 'Distrito', key: 'nombreDistrito' },
            { header: 'Domicilio', key: 'domicilio' },
            { header: 'Observaciones', key: 'observaciones' },
            { header: 'ID', key: 'idRegistroVentaDetalleTemp' },
            { header: 'Nro CAT', key: 'nroCAT' },
            { header: 'Placa', key: 'placa' },
            { header: 'Modelo', key: 'modelo' },
            { header: 'Año', key: 'anno' },
            { header: 'Prima', key: 'prima' },
            { header: 'Aporte', key: 'aporte' },
            { header: 'Comision', key: 'comision' }
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

        for (var i = 0; i < detalleList.length; i++) {
            worksheetDatos.addRow(detalleList[i])
        }
        worksheetDatos.getRow(1).font = { bold: true };

        var tempFilePath = tempfile('.xlsx');
        workbook.xlsx.writeFile(tempFilePath).then(function () {
            //console.log('file is written');
            res.setHeader('Content-Disposition', 'attachment; filename=EmisionTemporal.xlsx');
            res.sendFile(tempFilePath, function (err) {
                console.log('---------- error downloading file: ' + err);
            });
        });
    })

}

exports.getCantidadRegistrosTemporales = function (req, res, funcionName) {
    var query = "Select count(*) as cantidad from RegistroVentaTemp ";
    ejecutarQUERY_MYSQL(query, [], res, funcionName)
}

function ajustarColumnasReporteVentaTemporal(index, worksheetDatos) {

    worksheetDatos.getCell('A' + index).alignment = { wrapText: true };
    worksheetDatos.getCell('B' + index).alignment = { wrapText: true };
    worksheetDatos.getCell('C' + index).alignment = { wrapText: true };
    worksheetDatos.getCell('D' + index).alignment = { wrapText: true };
    worksheetDatos.getCell('E' + index).alignment = { wrapText: true };
    worksheetDatos.getCell('F' + index).alignment = { wrapText: true };
    worksheetDatos.getCell('G' + index).alignment = { wrapText: true };
    worksheetDatos.getCell('H' + index).alignment = { wrapText: true };
    worksheetDatos.getCell('I' + index).alignment = { wrapText: true };
    worksheetDatos.getCell('J' + index).alignment = { wrapText: true };

    return worksheetDatos
}
function registrarVentaCabecera(req, res, registro, callback) {

    var constantesGeneralesFields = {
        "BV": { "serie": "BVNroSerie", "correlativo": "BVCorrelativoActual" },
        "FA": { "serie": "FACTNroSerie", "correlativo": "FACTCorrelativoActual" }
    }

    // update contador:

    var queryUpdateContador = "Update ConstantesGenerales set " +
        constantesGeneralesFields[registro.tipo].correlativo + " = " + constantesGeneralesFields[registro.tipo].correlativo + " + 1 ";

    ejecutarQUERY_MYSQL(queryUpdateContador, [], res, 'registrarVentaCabecera',
        function (res, results) {
            var query = "Insert into RegistroVenta (estado, tipo, serie, numero, fechaEmision, fechaEmisionSUNAT, idComprobanteSUNAT, descripcion, monto, igv) " +
                " values ('2',?,?, (select " + constantesGeneralesFields[registro.tipo].correlativo + " from ConstantesGenerales limit 1),?,?,?,?,?,?)";

            var parametros = [registro.tipo, registro.serie, registro.fechaEmision, registro.fechaEmisionSUNAT, registro.idComprobanteSUNAT,
            registro.descripcion, registro.importeTotal, registro.sumatoriaIgv]

            ejecutarQUERY_MYSQL(query, parametros, res, 'registrarVentaCabecera', function (res, results) {
                var insertId = results.insertId
                //console_log("registrarVentaCabecera ID: " + insertId)
                registro.id = insertId
                callback(registro)
            })
        })
}

function registrarDetalles(req, res, funcionName, cabecera, callback) {
    // registra los detalles:           
    var items = cabecera.items;
    var queryInsertAllDetalles = "Insert into RegistroVentaDetalle(idRegistroVenta, nroCAT, idAsociado, prima, aporte, comision, fechaLiquidacion) VALUES ";
    var parametrosString = "";
    var mCATs = [];
    for (var i = 0; i < items.length; i++) {
        if (parametrosString != "") {
            parametrosString = parametrosString + ", "
        }
        parametrosString += "('" + cabecera.id + "', '" + items[i].nroCAT + "', '" + items[i].idAsociado + "', '" + items[i].prima;
        parametrosString += "', '" + items[i].aporte + "', '" + items[i].comision + "', (select fechaLiquidacion from Cat where nroCAT='" + items[i].nroCAT + "'))";
        mCATs.push({ nroCAT: items[i].nroCAT, idRegistroVenta: cabecera.id });
    }

    if (parametrosString != "") {
        var finalQuery = queryInsertAllDetalles + parametrosString
        ejecutarQUERY_MYSQL(finalQuery, [], res, "insertando registros Detalle", function (res, results) {
            //-----------------------------------------------------------------------------------------------
            var queryUpdateCAT = "UPDATE Cat SET idRegistroVenta = CASE nroCat"
            var mLista = "";
            for (var i = 0; i < mCATs.length; i++) {
                queryUpdateCAT += " WHEN '" + mCATs[i].nroCAT + "' THEN '" + mCATs[i].idRegistroVenta + "'"
                mLista += mCATs[i].nroCAT;
                if ((i + 1) < mCATs.length) mLista += ", ";
            }
            queryUpdateCAT += " ELSE idRegistroVenta END WHERE nroCat IN (" + mLista + ")"
            ejecutarQUERY_MYSQL(queryUpdateCAT, [], res, "actualizando CATs", function (res, results) {
                //-----------------------------------------------------------------------------------------------

                callback(true)
            })
        })
    } else {
        callback(true)
    }
}

exports.registrarVentasSUNAT = function (req, res, funcionName) {

    var jsonData = req.body.jsonData
    req.query.contador = 0;

    for (var i = 0; i < jsonData.length; i++) {
        // registra cabecera:
        var registro = jsonData[i]
        registrarVentaCabecera(req, res, "registrarVentaCabecera", registro, function (cabecera) {

            registrarDetalles(req, res, "registrarVentasSUNAT", cabecera, function () {
                req.query.contador = req.query.contador + 1
                if (req.query.contador == req.body.jsonData.length) {

                    var queryTruncate = "Truncate table RegistroVentaTemp"
                    ejecutarQUERY_MYSQL(queryTruncate, [], res, "TruncateRegistroVentaTemp", function () {
                        var queryTruncateDetalle = "Truncate table RegistroVentaDetalleTemp"
                        ejecutarQUERY_MYSQL(queryTruncateDetalle, [], res, "TruncateRegistroVentaDetalleTemp", function () {
                            enviarResponse(res, [req.query.contador])
                        })
                    })

                }
            })

        })

    }
}

// *** OCT/02/2018
//var accessKeySUNAT="64eb906e50fc2b8691348784d102ce538b0ebdce730d5b96a943f049912a7187";
//var secretKeySUNAT="35cb65aade9cf96989e6729ee828101bd3765994a94d13112156e37fa6f4d248";
//var mURLSunat="https://demoapi.facturaonline.pe";
//var accessKeySUNAT="96e706e2d7ec9ebfba66ce22110618a37090fd985b82fcafb849dba1ba0e186b";
//var secretKeySUNAT="766c498f4d818dabe75c71f73f425c5cf5ff9771968289044b108a7d491aaaf0";
//var mURLSunat="https://demoapi2.facturaonline.pe";
//10/MAYO/2019 >> Puesta en produccion
//var accessKeySUNAT = "b6f84c8ba3927d6ef25b1682dac75530a26811896391d4760c68fcabedca9fd2";
//var secretKeySUNAT = "083ffcdc9e4ac352108ac1769c26481ae74ad1d78bbc997487fc562d68f31c92";

var accessKeySUNAT = "ee097fa4a86875e9150dcb4b95a22d4f136f4f00c01ba811d9d7e427d3939bf8";
var secretKeySUNAT = "569697d1d5c429bf2451c2fa3f1cc21a097c712b6729d2f2b42a30d4c09393a9";

var mURLSunat = "https://api2.facturaonline.pe";
//*********************************************************
exports.enviarFACSUNAT = function (req, res, funcionName) {
    try {
        var accessKey = accessKeySUNAT;
        var secretKey = secretKeySUNAT;
        var mTimestamp = Math.floor(new Date() / 1000);
        var CryptoJS = require("crypto-js");
        var mSignature = CryptoJS.HmacSHA256(accessKey + "|" + mTimestamp, secretKey);
        var mFACT = req.body.jsonData
        //Cabecera campos numericos: importeTotal totalVentaGravada totalVentaInafecta totalVentaGratuita
        //  totalVentaExportacion  totalVentaExonerada montoTotalImpuestos sumatoriaIgv  
        //  sumatoriaOtrosTributos  sumatoriaOtrosCargos  sumatoriaIgvGratuitas
        mFACT.montoTotalImpuestos = 0;
        //mFACT.sumatoriaIgv = 0; //lo quité
        mFACT.importeTotal = Number(mFACT.importeTotal);
        //mFACT.totalVentaGravada = 0;
        mFACT.totalVentaInafecta = Number(mFACT.importeTotal);

        //nuevos
        mFACT.totalValorVenta = Number(mFACT.importeTotal);
        mFACT.totalPrecioVenta = Number(mFACT.importeTotal);
        //Items campos numericos: cantidad valorUnitario precioVentaUnitario  montoTotalImpuestosItem 
        //  baseAfectacionIgv montoAfectacionIgv porcentajeImpuesto  valorVenta
        mFACT.items[0].cantidad = 1;
        mFACT.items[0].valorUnitario = Number(mFACT.items[0].valorUnitario);
        mFACT.items[0].precioVentaUnitario = Number(mFACT.items[0].precioVentaUnitario);
        mFACT.items[0].montoTotalImpuestosItem = 0;
        mFACT.items[0].baseAfectacionIgv = Number(mFACT.items[0].baseAfectacionIgv);
        mFACT.items[0].montoAfectacionIgv = 0;
        mFACT.items[0].porcentajeImpuesto = 0;
        mFACT.items[0].valorVenta = Number(mFACT.items[0].valorVenta);

        console_log("----FACTURA------", 2);
        console_log(JSON.stringify(mFACT) , 2);

        var request = require("request");
        //recupera correlativo de la serie
        //var queryFA = "select FACTCorrelativoActual from ConstantesGenerales limit 1"
        var queryFA = "select FACTCorrelativoActual from ConstantesGenerales limit 1"

        ejecutarQUERY_MYSQL(queryFA, [], res, 'enviarFACSUNAT',
            function (res, resultado) {
                mFACT.numero = resultado[0].FACTCorrelativoActual + 1;  //actualiza
                var mOptions = {
                    method: 'POST',
                    url: mURLSunat + '/factura',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Fo ' + accessKey + ':' + mSignature + ':' + mTimestamp
                    },
                    body: mFACT,
                    json: true
                };
                //console_log(' enviarFACSUNAT (SERIE-Numero)= ' + mFACT.serie + '-' + mFACT.numero + ' CAT: ' + mFACT.items[0].nroCAT);
                //envia datos a OSE(SUNAT)
                request(mOptions,
                    function (error, response, body) {
                            console.log("----respuesta----");
                            console.log(body);
                            console.log("---fin---")
                        if (error) {
                            //console_log(error, 1)
                            res.send(error)
                            return;
                        }
                        var retorno = {};
                        //if (!error && response.statusCode == 200) {
                        //console_log("Dato recibido desde OSE: " + body);
                        //}
                        if (body.idFactura != undefined) {
                            //JSON proccesado OK => registrar CPE en "registroVenta y registroVentaDetalle
                            retorno.idComprobanteSUNAT = body.idFactura;
                            retorno.fechaEmisionSUNAT = body.fechaEmision;
                            retorno.numero = mFACT.numero;
                            mFACT.idComprobanteSUNAT = body.idFactura;
                            mFACT.fechaEmisionSUNAT = body.fechaEmision;
                            // registra cabecera:
                            registrarVentaCabecera(req, res, mFACT,
                                function (cabecera) {
                                    registrarDetalles(req, res, "registrarVentasDetalle", cabecera,
                                        function () {
                                            res.send(retorno);
                                            //Cuando envie todas la FACT/BV debe TRUNCATE las tablas RegistroVentaTemp
                                        })
                                })

                        } else { //error recibido desde OSE en body.code, body.status, body.message, body.description
                            retorno.msjERROR = body.description; //body.message;
                            res.send(retorno)
                        }
                    });
            });
    } catch (err) {
        //console_log('ERROR en enviarFACSUNAT: ' + err, 1);
        enviarResponse(res, err)
    }
}

exports.enviarBVSUNAT = function (req, res, funcionName) {
    try {
        var accessKey = accessKeySUNAT;
        var secretKey = secretKeySUNAT;
        var mTimestamp = Math.floor(new Date() / 1000);
        var CryptoJS = require("crypto-js");
        var mSignature = CryptoJS.HmacSHA256(accessKey + "|" + mTimestamp, secretKey);
        var mBV = req.body.jsonData
        //Cabecera campos numericos: importeTotal totalVentaGravada totalVentaInafecta totalVentaGratuita
        //  totalVentaExportacion  totalVentaExonerada montoTotalImpuestos sumatoriaIgv  
        //  sumatoriaOtrosTributos  sumatoriaOtrosCargos  sumatoriaIgvGratuitas
        mBV.montoTotalImpuestos = 0;
        //mBV.sumatoriaIgv = 0;
        mBV.importeTotal = Number(mBV.importeTotal);
        mBV.totalVentaInafecta = Number(mBV.importeTotal); //cambie por infacteca

        //nuevos
        mBV.totalValorVenta = Number(mBV.importeTotal);
        mBV.totalPrecioVenta = Number(mBV.importeTotal);

        //Items campos numericos: cantidad valorUnitario precioVentaUnitario  montoTotalImpuestosItem 
        //  baseAfectacionIgv montoAfectacionIgv porcentajeImpuesto  valorVenta
        mBV.items[0].cantidad = 1;
        mBV.items[0].valorUnitario = Number(mBV.items[0].valorUnitario);
        mBV.items[0].precioVentaUnitario = Number(mBV.items[0].precioVentaUnitario);
        mBV.items[0].montoTotalImpuestosItem = 0;
        mBV.items[0].baseAfectacionIgv = Number(mBV.items[0].baseAfectacionIgv);
        mBV.items[0].montoAfectacionIgv = 0;
        mBV.items[0].porcentajeImpuesto = 0;
        mBV.items[0].valorVenta = Number(mBV.items[0].valorVenta);


        console.log("entree");
        var request = require("request");

        //recupera correlativo de la serie
        var queryBV = "select BVCorrelativoActual from ConstantesGenerales limit 1"
        //var queryBV = "select BVCorrelativoActual, BVNroSerie from ConstantesGenerales limit 1"

        ejecutarQUERY_MYSQL(queryBV, [], res, 'enviarBVSUNAT',
            function (res, resultado) {
                mBV.numero = resultado[0].BVCorrelativoActual + 1;  //actualiza
                mBV.serie = 'B001';//resultado[0].BVNroSerie;  //actualiza
                ///console.log("---serie----");
                //console.log(resultado[0].BVNroSerie);

                console_log("----BOLETA------", 2);
                console_log(JSON.stringify(mBV), 2);

                console_log("---URL envio---", 2);
                console_log(mURLSunat, 2);
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

                var mOptions = {
                    method: 'POST',
                    url: mURLSunat + '/boleta',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Fo ' + accessKey + ':' + mSignature + ':' + mTimestamp
                    },
                    body: mBV,
                    json: true//,
                    //rejectUnauthorized: false // Añadir esta línea
                };
                //console_log(' enviarBVSUNAT (SERIE-Numero)= ' + mBV.serie + '-' + mBV.numero + ' CAT: ' + mBV.items[0].nroCAT);
                //envia datos a OSE(SUNAT)
                request(mOptions,
                    function (error, response, body) {
                         
                         console_log("----RESPUESTAA----", 2);
                         console_log(body, 2);
                         console_log("---FINN---", 2);

                        if (error) {
                            //console_log(error, 1)
                            console_log("---ERROR----", 2)
                            console_log(error, 2);
                            console_log("---RESPONSE----", 2)

                            console_log(response);
                            //console.log(error);

                            //console_log(error));

                            res.send(error)
                            return;
                        }
                        var retorno = {};
                        //if (!error && response.statusCode == 200) {
                        ////console_log("Dato recibido desde OSE: " + body);
                        //}
                        if (body.idBoleta != undefined) {
                            //JSON proccesado OK => registrar CPE en "registroVenta y registroVentaDetalle
                            retorno.idComprobanteSUNAT = body.idBoleta;
                            retorno.fechaEmisionSUNAT = body.fechaEmision;
                            retorno.numero = mBV.numero;
                            mBV.idComprobanteSUNAT = body.idBoleta;
                            mBV.fechaEmisionSUNAT = body.fechaEmision;
                            // registra cabecera:
                            registrarVentaCabecera(req, res, mBV,
                                function (cabecera) {
                                    registrarDetalles(req, res, "registrarVentasDetalle", cabecera,
                                        function () {
                                            res.send(retorno);
                                            //Cuando envie todas la BV debe TRUNCATE las tablas RegistroVentaTemp
                                        })
                                })

                        } else { //error recibido desde OSE en body.code, body.status, body.message, body.description
                            retorno.msjERROR = body.message;
                            res.send(retorno)
                        }
                    });
            });
    } catch (err) {
        //console_log('ERROR en enviaBVSUNAT: ' + err, 1);
        enviarResponse(res, err)
    }
}
///*************************************************************
//pruebas acceso a dominio remoto para envio de facturas (SUNAT)
exports.getUserSUNAT = function (req, res, funcionName) {
    try {
        var accessKey = accessKeySUNAT;
        var secretKey = secretKeySUNAT;
        var mTimestamp = Math.floor(new Date() / 1000);
        //console.log("getUserSUNAT >>>> " + mTimestamp);
        var CryptoJS = require("crypto-js");
        var mSignature = CryptoJS.HmacSHA256(accessKey + "|" + mTimestamp, secretKey);

        var request = require("request");
        var mURL = mURLSunat + '/usuario'
        var parametros = '?accessKey=' + accessKey + '&signature=' + mSignature + '&secretKey=' + secretKey;
        //console.log('Authorization:Fo ' + accessKey + ':' + mSignature + ':' + mTimestamp + ' -k https://demoapi.facturaonline.pe/usuario');
        var mOptions = {
            url: mURL,
            headers: {
                'Authorization': 'Fo ' + accessKey + ':' + mSignature + ':' + mTimestamp,
                'Content-Type': 'application/json'
            }
        };

        request(mOptions, function (error, response, body) {
            if (error) {
                //console_log(error, 1)
                res.send(error)
                return;
            }
            if (response.status = 200) {
                //console_log("body: " + body);
                res.send(body);
            } else {
                //console_log("error: " + response.message);
                res.send(response);
            }

        });

    } catch (err) {
        console.log('ERROR en getUserSUNAT: ' + err);
    }
}
//*********************************************************
exports.getReceptorSUNAT = function (req, res, funcionName) {
    try {
        var accessKey = accessKeySUNAT;
        var secretKey = secretKeySUNAT;
        var mTimestamp = Math.floor(new Date() / 1000);
        var CryptoJS = require("crypto-js");
        var mSignature = CryptoJS.HmacSHA256(accessKey + "|" + mTimestamp, secretKey);
        var request = require("request");
        var mURL = mURLSunat + '/receptor'
        var mOptions = {
            url: mURL,
            headers: {
                'Authorization': 'Fo ' + accessKey + ':' + mSignature + ':' + mTimestamp,
                'Content-Type': 'application/json'
            },
            qs: {
                tipo: 6,
                nro: '20516314398'
            }
        };
        request(mOptions, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console_log("BODY: " + body);
                res.send(body);
            }
        });

    } catch (err) {
        console.log('ERROR en getReceptorSUNAT: ' + err);
    }
}
exports.enviarBVSUNATPrueba = function (req, res, funcionName) {
    try {
        var accessKey = accessKeySUNAT;
        var secretKey = secretKeySUNAT;
        var mTimestamp = Math.floor(new Date() / 1000);
        var CryptoJS = require("crypto-js");
        var mSignature = CryptoJS.HmacSHA256(accessKey + "|" + mTimestamp, secretKey);
        var mBV = {
            /*
             tipoOperacion: 03 BOLETA / 01 FACTURA
             montoTotalImpuestos: 0.00
             totalVentagravada: 0.00
             sumatoriaIgv: 0.00
             fechaVencimiento: Indica que es la fecha de liquidacion
             codigoSunatEstablecimiento:B001
             valorUnitario: Precio total involucra (prima+comision+aporte)
             tipoPrecioVentaUnitario: -
             montoTotalImpuestosItem: 0.00
             baseAfectacionIgv: 0.00
             montoAfectacionIgv: 0.00
             tipoAfectacionIgv: 0.00
             codigoTributo : -
             */
            "tipoOperacion": "0101",
            "serie": "B001",
            "receptor": {
                "tipo": 1,
                "nro": "71523029"
            },
            "totalVentaExonerada": "120.00",
            "totalVentaGravada": "296.61",
            "sumatoriaIgv": "53.39",
            "totalVenta": "470",
            "tipoMoneda": "PEN",
            "items": [
                {
                    "unidadMedidaCantidad": "ZZ",
                    "cantidad": 1,
                    "descripcion": "Servicio VIP 1",
                    "precioVentaUnitario": 250,
                    "montoAfectacionIgv": "38.14",
                    "tipoAfectacionIgv": "10",
                    "valorVenta": "211.86",
                    "valorUnitario": "211.86"
                },
                {
                    "unidadMedidaCantidad": "ZZ",
                    "cantidad": 1,
                    "descripcion": "Servicio VIP 2",
                    "precioVentaUnitario": 100,
                    "montoAfectacionIgv": "15.25",
                    "tipoAfectacionIgv": "10",
                    "valorVenta": "84.75",
                    "valorUnitario": "84.75"
                },
                {
                    "unidadMedidaCantidad": "ZZ",
                    "cantidad": 1,
                    "descripcion": "Servicio VIP 3",
                    "precioVentaUnitario": 120,
                    "montoAfectacionIgv": 0,
                    "tipoAfectacionIgv": 20,
                    "valorVenta": "120",
                    "valorUnitario": "120"
                }
            ]

        };
        /*var mBV = {
            "tipoOperacion": "0101",
            "serie": "B001",
            "numero": 1,
            "montoTotalImpuestos": 7891.2,
            "totalVentaGravada": 43840,
            "sumatoriaIgv": 7891.2,
            "importeTotal": 51731.2,
            "adicional": {
                "fechaVencimiento": "2018-10-21",
                "codigoSunatEstablecimiento": "A000"
            },
            "items": [
                {
                "unidadMedidaCantidad": "BX",
                "cantidad": 2000,
                "descripcion": "Cerveza PILSEN x 12 bot. 620 ml.",
                "valorUnitario": 21.92,
                "precioVentaUnitario": 38,
                "tipoPrecioVentaUnitario": "01",
                "montoTotalImpuestosItem": 7891.2,
                "baseAfectacionIgv": 43840,
                "montoAfectacionIgv": 7891.2,
                "porcentajeImpuesto": 18,
                "tipoAfectacionIgv": "10",
                "codigoTributo": "1000",
                "valorVenta": 43840,
                "adicional": {}
                }
            ],
            "receptor": {
                "tipo": "6",
                "nro": "10450961219"
            }
        }; */
        var request = require("request");
        var mOptions = {
            method: 'POST',
            url: mURLSunat + '/boleta',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Fo ' + accessKey + ':' + mSignature + ':' + mTimestamp
            },
            body: mBV,
            json: true
        };
        //console.log(' enviarBVSUNAT= mOptions.url: '+mOptions.url + '  mOptions.body: '+mOptions.body);
        request(mOptions, function (error, response, body) {
            //if (!error && response.statusCode == 200) {

            if (response.statusCode == 200) {
                //console.log("body: " + body); //JSON.stringify(body));
                res.send(body);
            } else {
                console.log("error: " + error);
                console.log("RESPONSE statusCode: " + response.statusCode +
                    ", statusMessage: " + body.message +
                    ", headers: " + response.rawHeaders);
                res.send(body); //incluye code,status,message,description

            }
        });

    } catch (err) {
        console.log('ERROR en enviaBVSUNATPrueba: ' + err);
        enviarResponse(res, err)
    }
}
//------------------------------------------------------------------------------
exports.enviarBVFacturalo = function (req, res, funcionName) {
    try {
        var mBV = {
            "version_del_ubl": "v21",
            "serie_y_numero_correlativo": "B001-2",
            "fecha_de_emision": "2018-10-09",
            "hora_de_emision": "10:11:11",
            "tipo_de_documento": "03",
            "tipo_de_moneda": "PEN",
            "fecha_de_vencimiento": "2018-08-30",
            "numero_de_orden_de_compra": "0045467898",
            "datos_del_emisor": {
                "codigo_del_domicilio_fiscal": "0001"
            },
            "datos_del_cliente_o_receptor": {
                "numero_de_documento": "41784411",
                "tipo_de_documento": "1",
                "apellidos_y_nombres_o_razon_social": "Juan Hilario",
                "direccion": "Av. 2 de Mayo",
                "ubigeo": "150101"
            },
            "totales": {
                "total_operaciones_gravadas": 100,
                "sumatoria_igv": 18,
                "total_de_la_venta": 118
            },
            "items": [
                {
                    "codigo_interno_del_producto": "P0121",
                    "descripcion_detallada": "Inca Kola 250 ml",
                    "codigo_producto_de_sunat": "51121703",
                    "unidad_de_medida": "NIU",
                    "cantidad_de_unidades": 1,
                    "valor_unitario": 100,
                    "codigo_de_tipo_de_precio": "01",
                    "precio_de_venta_unitario_valor_referencial": 118,
                    "afectacion_al_igv": "10",
                    "porcentaje_de_igv": 18,
                    "monto_de_igv": 18,
                    "valor_de_venta_por_item": 100,
                    "total_por_item": 118
                }
            ],
            "informacion_adicional": {
                "tipo_de_operacion": "0101",
                "leyendas": []
            },
            "extras": {
                "forma_de_pago": "Efectivo"
            }
        };
        var request = require("request");
        var mOptions = {
            method: 'POST',
            url: 'http://demo.facturaloperuonline.com/api/documents',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer Qca4XmeFyA2RvUFXJlXXVkaM0dyftYqDB3x3iqufJr7fiydXDI'
            },
            body: mBV,
            json: true
        };
        //console.log(' enviarBVSUNAT= mOptions.url: '+mOptions.url + '  mOptions.body: '+mOptions.body);
        request(mOptions, function (error, response, body) {
            //if (!error && response.statusCode == 200) {

            //if (response.statusCode == 200) {
            console.log("error: " + error);
            console.log("RESPONSE statusCode: " + response.statusCode + ", statusMessage: " + response.statusMessage + ", headers: " + response.rawHeaders);
            console.log("RESPONSE headers: " + JSON.stringify(response.rawHeaders));
            console.log("body: " + JSON.stringify(body));
            res.send(body);
            //   }
        });

    } catch (err) {
        console.log('ERROR en enviaBVSUNATPrueba: ' + err);
        enviarResponse(res, err)
    }
}
