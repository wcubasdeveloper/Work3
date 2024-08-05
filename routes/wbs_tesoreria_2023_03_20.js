
// Web service para el modulo Tesoreria
/* ***** funciones que se importan del modulo global *** */
var modulo_global = require("../global/global");
var console_log = modulo_global.console_log;
var emitirError = modulo_global.emitirError;
var ejecutarQUERY_MYSQL = modulo_global.ejecutarQUERY_MYSQL;
var ejecutarQUERY_MYSQL_Extra = modulo_global.ejecutarQUERY_MYSQL_Extra;
var agregarLimit = modulo_global.agregarLimit;
var eliminacionGeneral = modulo_global.eliminacionGeneral;
var agregarCEROaLaIzquierda = modulo_global.agregarCEROaLaIzquierda;
var ExecuteSelectPROCEDUREsinParametros = modulo_global.ExecuteSelectPROCEDUREsinParametros;
var generatePDF = modulo_global.generatePDF;
var number_format = modulo_global.number_format;
var QueryWhere = modulo_global.QueryWhere;
var enviarResponse = modulo_global.enviarResponse;
var convertirAfechaString = modulo_global.convertirAfechaString;

exports.getLocales = function (req, res, funcionName) {
    var idLocal = req.query.idLocal;
    var mWhere = "where ";
    if (idLocal > 0) { mWhere += " idLocal=" + idLocal + " and "; }
    var query = "Select idLocal, Nombre as nombreLocal from Local " + mWhere + " estado='1' order by Nombre";
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getEmpresasTransp = function (req, res, funcionName) {
    var query = "Select c.idEmpresaTransp, c.nombreCorto, " +
        "concat(if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno))) as nombreEmpresa " +
        "from EmpresaTransp c " +
        "inner join Persona p on c.idPersona = p.idPersona " +
        "where registroEstado='0' order by nombreEmpresa asc ";
    //"Select idEmpresaTransp, nombreCorto from EmpresaTransp where registroEstado='0' order by nombreCorto";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
//Recupera todos los voucher por ventas a PJ (contratos)
exports.getListaVoucherPJ = function (req, res, funcionName) {
    // Parametros GE
    var queryFechas = "", mQuery = "", mQueryCount = "";
    var idEmpresaTransp = parseInt(req.query.idEmpresaTransp);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    if (fechaDesde != "" || fechaHasta != "") {
        var fechaHasta = req.query.fechaHasta + " 23:59:59";
        if (fechaDesde != "" && fechaHasta != "") {
            queryFechas += " (d.fecha between '" + fechaDesde + "' and '" + fechaHasta + "' ) ";
        } else {
            if (fechaDesde != "") {
                queryFechas += " d.fecha>='" + fechaDesde + "'";
            }
            if (fechaHasta != "") {
                queryFechas += " d.fecha<='" + fechaHasta + "'";
            }
        }
    }

    if (idEmpresaTransp > 0) { //buscar en tabla detalle : DepositoPJ_Contrato x idEmpresaTransp
        mQuery = "select CASE d.estado  " +
            "WHEN 'A' THEN 'ANUL' " +
            "WHEN 'B' THEN 'APROB' " +
            "ELSE 'PEND' " +
            "END as estado, dc.idDepositoPJ, date_format(d.fecha, '%d/%m/%Y') as fecha, " +
            "    concat('S/. ',format( " +
            "        (SELECT SUM(dc3.total) AS tCuotas FROM DepositoPJ_Contrato dc3 where dc3.idDepositoPJ = dc.idDepositoPJ) " +
            "   ,2)) as total, " +
            "    (Select GROUP_CONCAT(e.nombreCorto SEPARATOR ', ') " +
            "FROM DepositoPJ_Contrato dc1 " +
            "left join EmpresaTransp e on e.idEmpresaTransp=dc1.idEmpresaTransp " +
            "where dc1.idDepositoPJ = dc.idDepositoPJ) as nombreEmpresas, " +
            "    (Select GROUP_CONCAT(concat(lpad(cr.idContrato,6,0),'-',cr.nroCuota) SEPARATOR ', ') " +
            "FROM DepositoPJ_Contrato dc2 " +
            "left join Contrato_Renovacion cr on dc2.idContratoRenovacion=cr.idContratoRenovacion " +
            "where dc2.idDepositoPJ = dc.idDepositoPJ) as idContratos " +
            "from DepositoPJ_Contrato dc " +
            "left join DepositoPJ d on d.idDepositoPJ= dc.idDepositoPJ " +
            "where dc.idEmpresaTransp =" + idEmpresaTransp + " group by dc.idEmpresaTransp,dc.idDepositoPJ ";
        mQueryCount = "select count(*) as cantidad " +
            "from DepositoPJ_Contrato dc " +
            "left join DepositoPJ d on d.idDepositoPJ= dc.idDepositoPJ " +
            "where dc.idEmpresaTransp= " + idEmpresaTransp + " group by dc.idEmpresaTransp,dc.idDepositoPJ ";
        if (queryFechas != "") {
            mQuery += " and " + queryFechas;
            mQueryCount += " and " + queryFechas;
        }
    } else {  //buscar directamente en tabla cabecera: DepositoPJ
        mQuery = "select   " +
            "CASE d.estado  " +
            "WHEN 'A' THEN 'ANUL' " +
            "WHEN 'B' THEN 'APROB' " +
            "ELSE 'PEND' " +
            "END as estado, " +
            "idDepositoPJ, date_format(d.fecha, '%d/%m/%Y') as fecha, " +
            "concat('S/. ',format( " +
            "    (SELECT SUM(dc3.total) AS tCuotas FROM DepositoPJ_Contrato dc3 where dc3.idDepositoPJ = d.idDepositoPJ) " +
            ",2)) as total, " +
            "(Select GROUP_CONCAT(e.nombreCorto SEPARATOR ', ') " +
            "FROM DepositoPJ_Contrato dc " +
            "left join EmpresaTransp e on e.idEmpresaTransp=dc.idEmpresaTransp " +
            "where dc.idDepositoPJ = d.idDepositoPJ) as nombreEmpresas, " +
            "   (Select GROUP_CONCAT(concat(lpad(cr.idContrato,6,0),'-',cr.nroCuota) SEPARATOR ', ') " +
            "FROM DepositoPJ_Contrato dc2 " +
            "left join Contrato_Renovacion cr on dc2.idContratoRenovacion=cr.idContratoRenovacion " +
            "where dc2.idDepositoPJ = d.idDepositoPJ) as idContratos " +
            "from DepositoPJ d "
        mQueryCount = "select count(*) as cantidad from DepositoPJ d ";
        if (queryFechas != "") {
            mQuery += " where " + queryFechas;
            mQueryCount += " where " + queryFechas;
        }
    }
    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    mQuery = agregarLimit(page, registrosxpagina, mQuery);

    ejecutarQUERY_MYSQL(mQuery, [], res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                ejecutarQUERY_MYSQL_Extra(resultados, mQueryCount, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });

}

exports.getDetallesVoucherPJ = function (req, res, funcionName) {
    var idDepositoPJ = req.query.idDepositoPJ;
    //1ro Datos de la cabecera en DepositoPJ
    var queryCabecera = "Select date_format(fecha, '%d/%m/%Y') as fechaDeposito, " +
        "total as totalDeposito, idUsuario, estado " +
        "from DepositoPJ where idDepositoPJ = ? ";
    var parametros = [idDepositoPJ];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function (res, resultados) {
        //console_log("(1)Cabecera_DepositosPJ="+resultados.length,2);
        //resultados: fechaDeposito, totalDeposito, idUsuario, estado
        /* 2do detalle de Contratos:
         idDetalle : idDetalle_DepositoPJ_Contr,
         idContrato : idContrato
         idContratoRenovacion : idContratoRenovacion
         fechaContr : fechaVigenciaContr
         nombreEmpresa : nombreCorto
         idEmpresaTransp : idEmpresaTransp
         nCuotas : nCuotas
         nroCuota : nroDeCuota
         vigenciaCertsIni
         vigenciaCertsFin
         total: total
         totalSoles: "S/. "+total
         */
        query = "Select dc.idDetalle_DepositoPJ_Contr as idDetalle, cr.idContrato as idContrato, " +
            "dc.idContratoRenovacion as idContratoRenovacion, dc.total, concat('S/. ',format(dc.total,2)) as totalSoles, " +
            "date_format(ct.fechaVigenciaContr, '%d/%m/%Y') as fechaContr, " +
            "et.nombreCorto as nombreEmpresa, " +
            "dc.idEmpresaTransp as idEmpresaTransp, " +
            "ct.nCuotas  as nCuotas, " +
            "cr.nroCuota as nroCuota, " +
            "date_format(cr.fechaRenovacion, '%d/%m/%Y') as vigenciaCertIni, " +
            "date_format(DATE_ADD(cr.fechaRenovacion, INTERVAL 30 DAY), '%d/%m/%Y') as vigenciaCertFin " +
            "from DepositoPJ_Contrato dc " +
            "inner join Contrato_Renovacion cr on dc.idContratoRenovacion = cr.idContratoRenovacion " +
            "inner join Contrato ct on cr.idContrato = ct.idContrato " +
            "inner join EmpresaTransp et on cr.idEmpresaTransp = et.idEmpresaTransp " +
            "where dc.idDepositoPJ=? ";
        var parametros = [idDepositoPJ];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
            function (res2, results, resultados) {
                //console_log("(2)Detalle_LiquidacionesPN="+resultados.length,2);
                resultados[0].detalleContr = results;
                /*
                 idDetalle : idDetalle,
                 tipoDeposito : $("#cmbTipoDeposito").val(),
                 idCuentaBancaria : $("#cmbCuentaBancaria").val(),
                 cuentaBanco : $("#cmbCuentaBancaria :selected").text(),  //nroCuenta + nombreBanco
                 fechaDep:$("#txtFecha").val(),
                 nroVoucher:$("#txtNroVoucherBanco").val(),
                 monto:$("#txtMonto").val(),
                 montoSoles:"S/."+$("#txtMonto").val()
                 */
                query = "Select dp.idDetalle_DepositoPJ as idDetalle, " +
                    "dp.tipo as tipoDeposito, dp.idCuenta as idCuentaBancaria, " +
                    "dp.nroVoucherBanco as nroVoucher, date_format(dp.fechaDeposito, '%d/%m/%Y') as fechaDep, " +
                    "dp.monto as monto,concat('S/. ',format(dp.monto,2)) as montoSoles, " +
                    "concat(c.nroCuenta,' / ',b.nombreReducido) as cuentaBanco " +
                    "from DepositoPJ_Detalle dp " +
                    "inner join CuentaBancaria c on dp.idCuenta = c.idCuentaBancaria " +
                    "inner join Banco b on c.idBanco = b.idBanco " +
                    "where dp.idDepositoPJ=?";
                var parametros = [req.query.idDepositoPJ];
                ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
                    function (res2, results, resultados) {
                        // ("(3)Detalle_DepositosPN="+results.length,2);
                        resultados[0].detalleDep = results;
                        //  fechaDeposito, totalDeposito, idUsuario, estado
                        //  [idDetalle, idContrato, fechaContr,nombreEmpresa,idEmpresaTransp,nCuotas,nroCuota,vigenciaCertsIni,vigenciaCertsFin,total, totalSoles]
                        //  [idDetalle, tipoDeposito,idCuentaBancaria, nroVoucher, fechaDep, monto, montoSoles,cuentaBanco]
                        res2.send(resultados);
                    })
            })
    });

}
//recupera todos los datos de un contrato y la cuota respectiva
exports.getContratoRenovacion = function (req, res, funcionName) {
    var idContratoRenovacion = req.query.idContratoRenovacion;
    //1ro Datos de la cabecera en Contrato
    var queryCabecera = "Select date_format(cr.fechaRenovacion, '%d/%m/%Y') as InicioCATS, " +
        "date_format(DATE_ADD(cr.fechaRenovacion, INTERVAL 30 DAY), '%d/%m/%Y') as FinCATS, " +
        "cr.totalCuota, cr.flotaActual, cr.idEmpresaTransp, cr.nroCuota, cr.idContrato, " +
        "ct.nCuotas, date_format(ct.fechaVigenciaContr, '%d/%m/%Y') as InicioContr," +
        "concat(if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno))) as nombreEmpresa " +
        "from Contrato_Renovacion cr " +
        "inner join Contrato ct on cr.idContrato = ct.idContrato " +
        "inner join EmpresaTransp et on cr.idEmpresaTransp = et.idEmpresaTransp " +
        "inner join Persona p on et.idPersona = p.idPersona " +
        " where idContratoRenovacion = ? ";
    var parametros = [idContratoRenovacion];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function (res, resultados) {
        //datos desde Contrato_Renovacion + Contrato
        // idContrato, InicioContr, nCuotas, nroCuota, idEmpresaTransp, nombreEmpresa, InicioCATS, FinCATS,
        // flotaActual, totalCuota
        var midContrato = resultados[0].idContrato;
        var mnroCuota = resultados[0].nroCuota;

        //buscar datos relacionados >> Contrato_Certificados
        query = "Select idContratoCertificado as idDetalle," +
            "nroCertificado,v.placa,v.marca,v.modelo,v.anno,v.nroSerieMotor," +
            "cc.valorCuota as precio, " +
            "u.nombreUso, cl.nombreClase  " +
            "from Contrato_Certificados cc " +
            "inner join Vehiculo v on cc.idVehiculo = v.idVehiculo " +
            "inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo " +
            "inner join Uso_Vehiculo u on ucv.idUso = u.idUso " +
            "inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase " +
            "where cc.idContrato=? and cc.nroCuota=? ";
        var parametros = [midContrato, mnroCuota];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
            function (res2, results, resultados) {
                //[nroCertificado,placa,nombreClase,marca,modelo,anno,nroSerieMotor,precio]
                resultados[0].detalleContr = results;
                res2.send(resultados);
            })
    });
}
exports.guardarDepositoPJ = function (req, res, funcionName) {
    /*  var parametrosPOST = {
     "fecha":dateTimeFormat($("#FechaDeposito").val()),
     "total":totalCONTR,
     "idUsuario":idUsuario,

     {campo:'idContrato'         , alineacion:'left',LPAD:true   },
     {campo:'fechaContr'         , alineacion:'left'             },
     {campo:'nombreEmpresa'      , alineacion:'left'             },
     {campo:'nCuotas'            , alineacion:'left'             },
     {campo:'nroCuota'           , alineacion:'left'             },
     {campo:'vigenciaCertIni'    , alineacion:'left'             },
     {campo:'vigenciaCertFin'    , alineacion:'left'             },
     {campo:'totalSoles'         , alineacion:'left'             }

     "detallesD": arrayDatosDep
     idDetalle : idDetalle,
     tipoDeposito : $("#cmbTipoDeposito").val(),
     idCuentaBancaria : $("#cmbCuentaBancaria").val(),
     cuentaBanco : $("#cmbCuentaBancaria :selected").text(),
     fechaDep:$("#txtFecha").val(),
     nroVoucher:$("#txtNroVoucherBanco").val(),
     monto:$("#txtMonto").val(),
     montoSoles:"S/."+$("#txtMonto").val()
     */
    var fecha = req.body.fecha;
    var total = req.body.total;
    var idUsuario = req.body.idUsuario;
    var query = "Insert into DepositoPJ(fecha,total,idUsuario) values (?,?,?)";
    //El registro se crea con estado='P' x default
    var arrayParametros = [fecha, total, idUsuario];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function (res, resultados) {
        var idDepositoPJ = resultados.insertId;
        //console_log ("wbs_tesoreria: idDepositoPJ= "+idDepositoPJ,2);
        if (idDepositoPJ > 0) { //Cabecera de Deposito creada => agregar detalles de depositos
            var lDetalle = req.body.detallesD;
            var i = 0;
            for (i = 0; i < lDetalle.length; i++) {
                // Guarda la lista de depositos
                var queryInsertDetalle = "Insert " +
                    "into DepositoPJ_Detalle(idDepositoPJ, tipo, nroVoucherBanco, fechaDeposito, idCuenta, monto)" +
                    " values (?,?,?,?,?,?)";
                var parametrosDetalle = [idDepositoPJ, lDetalle[i].tipoDeposito, lDetalle[i].nroVoucher,
                    lDetalle[i].fechaDep, lDetalle[i].idCuentaBancaria, lDetalle[i].monto];
                //console_log ("wbs_tesoreria: Depositos: parametros ='"+parametrosDetalle,2);
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
            }
            lDetalle = req.body.detallesC;
            for (i = 0; i < lDetalle.length; i++) {
                // Guarda la lista de Liquidaciones incluidas en la transaccion
                var queryInsertDetalle = "Insert " +
                    "into DepositoPJ_Contrato(idDepositoPJ, idContratoRenovacion,idEmpresaTransp, total)" +
                    " values (?,?,?,?)";
                var parametrosDetalle = [idDepositoPJ, lDetalle[i].idContratoRenovacion, lDetalle[i].idEmpresaTransp, lDetalle[i].total];
                //console_log ("wbs_tesoreria: Contratos: parametros ='"+parametrosDetalle,2);
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
            }

            res.send([idDepositoPJ]);
        }
    });
}
exports.actualizaDepositoPJ = function (req, res, funcionName) {
    /*  var parametrosPOST = {
     "fecha":dateTimeFormat($("#FechaDeposito").val()),
     "total":totalCONTR,
     "idUsuario":idUsuario,

     "detallesL": arrayDatosLiq,
     idDetalle : idDetalle,
     idLiquidacion : $("#cmbLiquidaciones").val(),
     fechaLiq:$("#txtFechaLiq").val(),
     nroPreImpreso:$("#txtNroPreImpreso").val(),
     nombreConcesionario:$("#cmbConcesionarios :selected").text(),
     idConcesionario: $("#cmbConcesionarios").val(),
     total:totalLiq,
     totalSoles:"S/. "+totalLiq
     estado: U/N/O/B

     "detallesD": arrayDatosDep
     idDetalle : idDetalle,
     tipoDeposito : $("#cmbTipoDeposito").val(),
     idCuentaBancaria : $("#cmbCuentaBancaria").val(),
     cuentaBanco : $("#cmbCuentaBancaria :selected").text(),
     fechaDep:$("#txtFecha").val(),
     nroVoucher:$("#txtNroVoucherBanco").val(),
     monto:$("#txtMonto").val(),
     montoSoles:"S/."+$("#txtMonto").val()
     estado:U/N/O/B
     "idDepositoPN:"
     */
    var idDepositoPJ = req.body.idDepositoPJ;
    var fecha = req.body.fecha;
    var total = req.body.total;
    var idUsuario = req.body.idUsuario;
    var query = "update DepositoPJ set fecha=?, total=?, idUsuario=? where idDepositoPJ=?";
    var parametros = [fecha, total, idUsuario, idDepositoPJ];

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName,
        function (res, resultados) {
            //2do actualizar o agregar registros de detalle de depositos
            var lDetalle = req.body.detallesD;
            var i = 0;
            for (i = 0; i < lDetalle.length; i++) {
                if (lDetalle[i].estado != 'O') {
                    if (lDetalle[i].estado == 'U') {//actualizar registro
                        var queryDetalle = "Update DepositoPJ_Detalle " +
                            "set tipo=?, nroVoucherBanco=?, fechaDeposito=?, " +
                            "idCuenta=?, monto=? where idDetalle_DepositoPJ=? ";
                        var parametrosDetalle = [lDetalle[i].tipoDeposito, lDetalle[i].nroVoucher,
                        lDetalle[i].fechaDep, lDetalle[i].idCuentaBancaria,
                        lDetalle[i].monto, lDetalle[i].idDetalle];
                    }
                    if (lDetalle[i].estado == 'N') { //inserta nuevo registro
                        var queryDetalle = "Insert " +
                            "into DepositoPJ_Detalle(idDepositoPJ, tipo, nroVoucherBanco, " +
                            "fechaDeposito, idCuenta, monto) values (?,?,?,?,?,?)";
                        var parametrosDetalle = [idDepositoPJ, lDetalle[i].tipoDeposito, lDetalle[i].nroVoucher,
                            lDetalle[i].fechaDep, lDetalle[i].idCuentaBancaria, lDetalle[i].monto];
                    }
                    if (lDetalle[i].estado == 'B') {
                        var queryDetalle = "Delete from DepositoPJ_Detalle where idDetalle_DepositoPJ = ?";
                        var parametrosDetalle = [lDetalle[i].idDetalle];
                    }
                    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
                }
            }
            lDetalle = req.body.detallesC;
            for (i = 0; i < lDetalle.length; i++) {
                if (lDetalle[i].estado != 'O') {
                    if (lDetalle[i].estado == 'U') {//actualizar registro
                        var queryDetalle = "Update DepositoPJ_Contrato " +
                            "set idDepositoPJ=?, idContratoRenovacion=?,idEmpresaTransp=?, total=? " +
                            "where idDetalle_DepositosPJ_Contr=? ";
                        var parametrosDetalle = [idDepositoPJ, lDetalle[i].idContratoRenovacion, lDetalle[i].idEmpresaTransp,
                            lDetalle[i].total, lDetalle[i].idDetalle];
                    }
                    if (lDetalle[i].estado == 'N') {// Guarda la lista de renovaciones incluidas en la transaccion
                        var queryDetalle = "Insert " +
                            "into DepositoPJ_Contrato(idDepositoPJ, idContratoRenovacion, idEmpresaTransp,total)" +
                            " values (?,?,?,?)";
                        var parametrosDetalle = [idDepositoPJ, lDetalle[i].idContratoRenovacion, lDetalle[i].idEmpresaTransp, lDetalle[i].total];
                    }
                    if (lDetalle[i].estado == 'B') {
                        var queryDetalle = "Delete from DepositoPJ_Contrato where idDetalle_DepositosPJ_Contr = ? ";
                        var parametrosDetalle = [lDetalle[i].idDetalle];
                    }
                    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
                }
            }

            res.send([idDepositoPJ]);

        });
}

exports.getRenovacionesxEmpresaTransp = function (req, res, funcionName) {
    var idEmpresaTransp = req.query.idEmpresaTransp;

    var query = "SELECT cr.idContratoRenovacion, cr.idContrato, cr.nroCuota, " +
        "concat(lpad(cr.idContrato,6,0),'-',cr.nroCuota) as contratoCuota, " +
        "date_format(c.fechaVigenciaContr, '%d/%m/%Y') as fechaVigenciaContr,c.nCuotas, " +
        "date_format(cr.fechaRenovacion, '%d/%m/%Y') as fechaRenovacion, " +
        "date_format(DATE_ADD(cr.fechaRenovacion, INTERVAL 30 DAY), '%d/%m/%Y') as fechaVigenciaFin, " +
        "flotaActual, totalCuota,concat('S/.',format(cr.totalCuota,2)) as totalCuotaSoles " +
        "from Contrato_Renovacion cr " +
        "inner join Contrato c on c.idContrato = cr.idContrato " +
        "where cr.idEmpresaTransp=? and idDepositoPJ=0";  //Renovacion que no ha sido depositada todavia
    var parametros = [idEmpresaTransp];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}

//getListaVoucherPN: recupera todos los Vouches de depositos x Ventas a Personas Naturales, para un determinado local
// o para todos si es un Administrador (idLocal=0)
exports.getListaVoucherPN = function (req, res, funcionName) {
    // Parametros GE
    var queryWhere = "";
    var idLocal = parseInt(req.query.idLocal);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta + " 23:59:59";
    //console_log ("Buscando idLocal: "+idLocal,2);
    if (idLocal > 0) {
        queryWhere += " where d.idLocal=" + idLocal;
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (queryWhere == "") {
            queryWhere = " where ";
        } else {
            queryWhere += " and "
        }
        if (fechaDesde != "" && fechaHasta != "") {
            queryWhere += " (d.fecha between '" + fechaDesde + "' and '" + fechaHasta + "' ) ";
        } else {
            if (fechaDesde != "") {
                queryWhere += " d.fecha>='" + fechaDesde + "'";
            }
            if (fechaHasta != "") {
                queryWhere += " d.fecha<='" + fechaHasta + "'";
            }
        }
    }
    var query = "select " +
        "CASE d.estado " +
        "WHEN 'A' THEN 'ANUL' " +
        "WHEN 'B' THEN 'APROB' " +
        "ELSE 'PEND' " +
        "END as estado," +
        "d.idDepositoPN as idDeposito, date_format(d.fecha, '%d/%m/%Y') as fecha, l.Nombre as nombreLocal, concat('S/. ',format(d.total,2)) as total " +
        "from DepositoPN d " +
        "left join Local l on d.idLocal = l.idLocal " + queryWhere + " order by d.fecha desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad " +
                    "from DepositoPN d " +
                    "left join Local l on d.idLocal = l.idLocal " + queryWhere + " order by d.fecha desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });
}
//Lista de Contratos que cumplan las condiciones
exports.getListaContratos = function (req, res, funcionName) {
    var queryWhere = "";
    var idEmpresaTransp = parseInt(req.query.idEmpresaTransp);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta + " 23:59:59";
    if (idEmpresaTransp > 0) {
        queryWhere += " where c.idEmpresaTransp=" + idEmpresaTransp;
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (queryWhere == "") {
            queryWhere = " where ";
        } else {
            queryWhere += " and "
        }
        if (fechaDesde != "" && fechaHasta != "") {
            queryWhere += " (c.fechaEmision between '" + fechaDesde + "' and '" + fechaHasta + "' ) ";
        } else {
            if (fechaDesde != "") {
                queryWhere += " c.fechaEmision>='" + fechaDesde + "'";
            }
            if (fechaHasta != "") {
                queryWhere += " c.fechaEmision<='" + fechaHasta + "'";
            }
        }
    }
    var query = "select " +
        "CASE c.estado " +
        "WHEN 'R' THEN '----' " +
        "WHEN 'I' THEN 'IMPR' " +
        "WHEN 'A' THEN 'ANUL' " +
        "WHEN 'T' THEN 'TERM' " +
        "ELSE '----' " +
        "END as estado," +
        "c.idContrato, date_format(c.fechaEmision, '%d/%m/%Y') as fechaEmision, " +
        "e.nombreCorto, c.nCuotas, c.flota, " +
        "date_format(c.fechaVigenciaContr, '%d/%m/%Y') as fechaIniVigencia, " +
        "date_format(DATE_ADD(c.fechaVigenciaContr, INTERVAL 1 YEAR), '%d/%m/%Y') as fechaFinVigencia " +
        "from Contrato c " +
        "inner join EmpresaTransp e on e.idEmpresaTransp = c.idEmpresaTransp " + queryWhere + " order by fechaEmision desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        //estado, idContrato, fechaEmision, nombreCorto, nCuotas, flota, fechaIniVigencia, fechaFinVigencia
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad " +
                    "from Contrato c " + queryWhere + " order by c.fechaEmision desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });
}

exports.getDetallesVoucherPN = function (req, res, funcionName) {
    var idDepositoPN = req.query.idDepositoPN;
    //1ro Datos de la cabecera en DepositoPN
    var queryCabecera = "Select date_format(fecha, '%d/%m/%Y') as fechaDeposito, " +
        "if(idLocal=0, '', idLocal) as idLocal, total as totalDeposito, idUsuario, " +
        "estado " +
        "from DepositoPN where idDepositoPN = ?";
    var parametros = [idDepositoPN];
    //console_log("Buscando: "+idDepositoPN,2);
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function (res, resultados) {
        //console_log("(1)Cabecera_DepositosPN="+resultados.length,2);
        //resultados: fechaDeposito, idLocal, totalDeposito, idUsuario
        // 2do detalle de Liquidaciones:
        /*
         idDetalle : idDetalle,
         idLiquidacion : $("#cmbLiquidaciones").val(),
         fechaLiq:$("#txtFechaLiq").val(),
         nroPreImpreso:$("#txtNroPreImpreso").val(),
         nombreConcesionario:$("#cmbConcesionarios :selected").text(),
         idConcesionario: $("#cmbConcesionarios").val(),
         total:totalLiq,
         totalSoles:"S/. "+totalLiq
         */
        query = "Select lq.idDetalle_DepositosPN_Liq as idDetalle, lq.idLiquidacion_ventas_cabecera as idLiquidacion, lq.total," +
            "concat('S/. ',format(lq.total,2)) as totalSoles, " +
            "date_format(lqc.fechaLiquidacion, '%d/%m/%Y') as fechaLiq, lqc.nroLiquidacion as nroPreImpreso," +
            "lqc.idConcesionario as idConcesionario," +
            "if( p.tipoPersona='J',p.RazonSocial,concat(p.nombres,', ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreConcesionario " +
            "from DepositoPN_Detalle_Liquidaciones lq " +
            "inner join Liquidacion_ventas_cabecera lqc on lq.idLiquidacion_ventas_cabecera = lqc.idLiquidacion_ventas_cabecera " +
            "inner join Concesionario cn on lqc.idConcesionario = cn.idConcesionario " +
            "inner join Persona p on cn.idPersona = p.idPersona " +
            "where lq.idDepositoPN=?";
        var parametros = [idDepositoPN];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
            function (res2, results, resultados) {
                //console_log("(2)Detalle_LiquidacionesPN="+resultados.length,2);
                resultados[0].detalleLiq = results;
                //resultados: fechaDeposito, idLocal, totalDeposito, idUsuario,
                //  [idDetalle, idLiquidacion, total, totalSoles, fechaLiq, nroPreImpreso,idConcesionario, nombreConcesionario]
                // 3ro detalle de Depositos:
                /*
                 idDetalle : idDetalle,
                 tipoDeposito : $("#cmbTipoDeposito").val(),
                 idCuentaBancaria : $("#cmbCuentaBancaria").val(),
                 cuentaBanco : $("#cmbCuentaBancaria :selected").text(),  //nroCuenta + nombreBanco
                 fechaDep:$("#txtFecha").val(),
                 nroVoucher:$("#txtNroVoucherBanco").val(),
                 monto:$("#txtMonto").val(),
                 montoSoles:"S/."+$("#txtMonto").val()
                 */
                query = "Select dp.idDetalle_DepositoPN as idDetalle, " +
                    "dp.tipo as tipoDeposito, dp.idCuenta as idCuentaBancaria, " +
                    "dp.nroVoucherBanco as nroVoucher, date_format(dp.fechaDeposito, '%d/%m/%Y') as fechaDep, " +
                    "dp.monto as monto,concat('S/. ',format(dp.monto,2)) as montoSoles, " +
                    "concat(c.nroCuenta,' / ',b.nombreReducido) as cuentaBanco " +
                    "from DepositoPN_Detalle dp " +
                    "inner join CuentaBancaria c on dp.idCuenta = c.idCuentaBancaria " +
                    "inner join Banco b on c.idBanco = b.idBanco " +
                    "where dp.idDepositoPN=?";
                var parametros = [req.query.idDepositoPN];
                ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
                    function (res2, results, resultados) {
                        //console_log ("(3)Detalle_DepositosPN="+results.length,2);
                        resultados[0].detalleDep = results;
                        //resultados: fechaDeposito, idLocal, totalDeposito, idUsuario,
                        //  [idDetalle, idLiquidacion, total, totalSoles, fechaLiq, nroPreImpreso,idConcesionario, nombreConcesionario]
                        //  [idDetalle, tipoDeposito, nroVoucher, fechaDep, monto, montoSoles,cuentaBanco]
                        res2.send(resultados);
                    })
            })
    });
}
exports.guardarDepositoPN = function (req, res, funcionName) {
    /*  var parametrosPOST = {
     "fecha":dateTimeFormat($("#FechaDeposito").val()),
     "idLocal":$("#idCmbLocal").val(),
     "total":totalLIQ,
     "idUsuario":idUsuario,
     "detallesL": arrayDatosLiq,
             idDetalle : idDetalle,
             idLiquidacion : $("#cmbLiquidaciones").val(),
             fechaLiq:$("#txtFechaLiq").val(),
             nroPreImpreso:$("#txtNroPreImpreso").val(),
             nombreConcesionario:$("#cmbConcesionarios :selected").text(),
             idConcesionario: $("#cmbConcesionarios").val(),
             total:totalLiq,
             totalSoles:"S/. "+totalLiq
     "detallesD": arrayDatosDep
             idDetalle : idDetalle,
             tipoDeposito : $("#cmbTipoDeposito").val(),
             idCuentaBancaria : $("#cmbCuentaBancaria").val(),
             cuentaBanco : $("#cmbCuentaBancaria :selected").text(),
             fechaDep:$("#txtFecha").val(),
             nroVoucher:$("#txtNroVoucherBanco").val(),
             monto:$("#txtMonto").val(),
             montoSoles:"S/."+$("#txtMonto").val()
     */
    var fecha = req.body.fecha;
    var idLocal = req.body.idLocal;
    var total = req.body.total;
    var idUsuario = req.body.idUsuario;
    var query = "Insert into DepositoPN(fecha,idLocal,total,idUsuario) values (?,?,?,?)";
    //El registro se crea con estado='P' x default
    var arrayParametros = [fecha, idLocal, total, idUsuario];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function (res, resultados) {
        var idDepositoPN = resultados.insertId;
        //console_log ("wbs_tesoreria: idDepositoPN= "+idDepositoPN,2);
        if (idDepositoPN > 0) { //Cabecera de Deposito creada => agregar detalles de depositos
            var lDetalle = req.body.detallesD;
            var i = 0;
            for (i = 0; i < lDetalle.length; i++) {
                // Guarda la lista de depositos
                var queryInsertDetalle = "Insert " +
                    "into DepositoPN_Detalle(idDepositoPN, tipo, nroVoucherBanco, fechaDeposito, idCuenta, monto)" +
                    " values (?,?,?,?,?,?)";
                var parametrosDetalle = [idDepositoPN, lDetalle[i].tipoDeposito, lDetalle[i].nroVoucher,
                    lDetalle[i].fechaDep, lDetalle[i].idCuentaBancaria, lDetalle[i].monto];
                //console_log ("wbs_tesoreria: Depositos: parametros ='"+parametrosDetalle,2);
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
            }
            lDetalle = req.body.detallesL;
            for (i = 0; i < lDetalle.length; i++) {
                // Guarda la lista de Liquidaciones incluidas en la transaccion
                var queryInsertDetalle = "Insert " +
                    "into DepositoPN_Detalle_Liquidaciones(idDepositoPN, idLiquidacion_ventas_cabecera, total)" +
                    " values (?,?,?)";
                var parametrosDetalle = [idDepositoPN, lDetalle[i].idLiquidacion, lDetalle[i].total];
                // ("wbs_tesoreria: Liquidaciones: parametros ='"+parametrosDetalle,2);
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
            }

            res.send([idDepositoPN]);
        }
    });
}
exports.actualizaDepositoPN = function (req, res, funcionName) {
    /*  var parametrosPOST = {
     "fecha":dateTimeFormat($("#FechaDeposito").val()),
     "idLocal":$("#idCmbLocal").val(),
     "total":totalLIQ,
     "idUsuario":idUsuario,
     "detallesL": arrayDatosLiq,
         idDetalle : idDetalle,
         idLiquidacion : $("#cmbLiquidaciones").val(),
         fechaLiq:$("#txtFechaLiq").val(),
         nroPreImpreso:$("#txtNroPreImpreso").val(),
         nombreConcesionario:$("#cmbConcesionarios :selected").text(),
         idConcesionario: $("#cmbConcesionarios").val(),
         total:totalLiq,
         totalSoles:"S/. "+totalLiq
         estado: U/N/O/B
     "detallesD": arrayDatosDep
         idDetalle : idDetalle,
         tipoDeposito : $("#cmbTipoDeposito").val(),
         idCuentaBancaria : $("#cmbCuentaBancaria").val(),
         cuentaBanco : $("#cmbCuentaBancaria :selected").text(),
         fechaDep:$("#txtFecha").val(),
         nroVoucher:$("#txtNroVoucherBanco").val(),
         monto:$("#txtMonto").val(),
         montoSoles:"S/."+$("#txtMonto").val()
         estado:U/N/O/B
     "idDepositoPN:"
     */
    var idDepositoPN = req.body.idDepositoPN;
    var fecha = req.body.fecha;
    var idLocal = req.body.idLocal;
    var total = req.body.total;
    var idUsuario = req.body.idUsuario;
    var query = "update DepositoPN set fecha=?, idLocal=?, total=?, idUsuario=? where idDepositoPN=?";
    var parametros = [fecha, idLocal, total, idUsuario, idDepositoPN];

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName,
        function (res, resultados) {
            //2do actualizar o agregar registros de detalle de depositos
            var lDetalle = req.body.detallesD;
            var i = 0;
            for (i = 0; i < lDetalle.length; i++) {
                if (lDetalle[i].estado != 'O') {
                    if (lDetalle[i].estado == 'U') {//actualizar registro
                        var queryDetalle = "Update DepositoPN_Detalle " +
                            "set tipo=?, nroVoucherBanco=?, fechaDeposito=?, " +
                            "idCuenta=?, monto=? where idDetalle_DepositoPN=? ";
                        var parametrosDetalle = [lDetalle[i].tipoDeposito, lDetalle[i].nroVoucher,
                        lDetalle[i].fechaDep, lDetalle[i].idCuentaBancaria,
                        lDetalle[i].monto, lDetalle[i].idDetalle];
                    }
                    if (lDetalle[i].estado == 'N') { //inserta nuevo registro
                        var queryDetalle = "Insert " +
                            "into DepositoPN_Detalle(idDepositoPN, tipo, nroVoucherBanco, " +
                            "fechaDeposito, idCuenta, monto) values (?,?,?,?,?,?)";
                        var parametrosDetalle = [idDepositoPN, lDetalle[i].tipoDeposito, lDetalle[i].nroVoucher,
                            lDetalle[i].fechaDep, lDetalle[i].idCuentaBancaria, lDetalle[i].monto];
                    }
                    if (lDetalle[i].estado == 'B') {
                        var queryDetalle = "Delete from DepositoPN_Detalle where idDetalle_DepositoPN = ?";
                        var parametrosDetalle = [lDetalle[i].idDetalle];
                    }
                    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
                }
            }
            lDetalle = req.body.detallesL;
            for (i = 0; i < lDetalle.length; i++) {
                if (lDetalle[i].estado != 'O') {
                    if (lDetalle[i].estado == 'U') {//actualizar registro
                        var queryDetalle = "Update DepositoPN_Detalle_Liquidaciones " +
                            "set idDepositoPN=?, idLiquidacion_ventas_cabecera=?, total=? " +
                            "where idDetalle_DepositosPN_Liq=? ";
                        var parametrosDetalle = [idDepositoPN, lDetalle[i].idLiquidacion,
                            lDetalle[i].total, lDetalle[i].idDetalle];
                    }
                    if (lDetalle[i].estado == 'N') {// Guarda la lista de Liquidaciones incluidas en la transaccion
                        var queryDetalle = "Insert " +
                            "into DepositoPN_Detalle_Liquidaciones(idDepositoPN, idLiquidacion_ventas_cabecera, total)" +
                            " values (?,?,?)";
                        var parametrosDetalle = [idDepositoPN, lDetalle[i].idLiquidacion, lDetalle[i].total];
                    }
                    if (lDetalle[i].estado == 'B') {
                        var queryDetalle = "Delete from DepositoPN_Detalle_Liquidaciones where idDetalle_DepositosPN_Liq = ? ";
                        var parametrosDetalle = [lDetalle[i].idDetalle];
                    }
                    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
                }
            }

            res.send([idDepositoPN]);

        });
}

// Encuentra las Liquidaciones de Ventas NO depositadas para un determinado Concesionario
exports.getLiquidacionesxConcesionario = function (req, res, funcionName) {
    var idConcesionario = req.query.idConcesionario;
    /*
     Select idLiquidacion_ventas_cabecera, nroLiquidacion, fechaLiquidacion,
     ( select if(sum(ld.precio) is null,0,sum(ld.precio)) as total
     from autosegurobd_desarrollo.Liquidacion_ventas_detalle ld
     where ld.idLiquidacion_ventas_cabecera = lc.idLiquidacion_ventas_cabecera)  as precioTotal,
     ( select if(sum(ld.comision) is null,0,sum(ld.comision)) as total
     from autosegurobd_desarrollo.Liquidacion_ventas_detalle ld
     where ld.idLiquidacion_ventas_cabecera = lc.idLiquidacion_ventas_cabecera) as comisionTotal

     from autosegurobd_desarrollo.Liquidacion_ventas_cabecera lc
     where lc.registroEstado=0 and ( lc.idDepositoPN=0 or lc.idDepositoPN is null) and lc.idConcesionario = 8945
     order by idLiquidacion_ventas_cabecera;
     */
    var query = "Select idLiquidacion_ventas_cabecera as idLiquidacion, nroLiquidacion, date_format(fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, " +
        " ( select if(sum(ld.precio) is null,0,sum(ld.precio)) as total " +
        "   from Liquidacion_ventas_detalle ld " +
        "   where ld.idLiquidacion_ventas_cabecera = lc.idLiquidacion_ventas_cabecera)  as precioTotal," +
        " ( select if(sum(ld.comision) is null,0,sum(ld.comision)) as total " +
        "   from Liquidacion_ventas_detalle ld " +
        "   where ld.idLiquidacion_ventas_cabecera = lc.idLiquidacion_ventas_cabecera)  as comisionTotal " +
        "from Liquidacion_ventas_cabecera lc " +
        "where registroEstado=0 and (idDepositoPN=0 or idDepositoPN is null) and idConcesionario = ? " +
        "order by idLiquidacion_ventas_cabecera ";
    var parametros = [idConcesionario];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.getConcesionariosxLocal = function (req, res, funcionName) {
    var idLocal = req.query.idLocal;
    var queryWhere = "";
    if (idLocal != "0") { queryWhere = " and c.idSede = '" + idLocal + "'"; }
    var query = "select * from " +
        "(Select c.idConcesionario, " +
        "concat(if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)),' / ',l.Nombre) as nombreCompuesto " +
        "from Concesionario c " +
        "inner join Persona p on c.idPersona = p.idPersona " +
        "inner join Local l on c.idSede = l.idLocal " +
        "where l.estado='1' and c.estado='1' " + queryWhere + ") as v order by v.nombreCompuesto asc";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}

exports.getCuentasBancarias = function (req, res, funcionName) {
    var query = "select idCuentaBancaria, concat(nroCuenta,' / ',b.nombreReducido) as ctaBanco " +
        "from CuentaBancaria c " +
        "left join Banco b on c.idBanco = b.idBanco " +
        "where c.registroEstado='0' ";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getDetallesLiquidacion = function (req, res, funcionName) {
    var idLiquidacion = req.query.idLiquidacion;

    var queryCabecera = "Select date_format(fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, if(idConcesionario=0, '', " +
        "idConcesionario) as idConcesionario, idUsuarioResp, idUsuario, nroLiquidacion " +
        "from Liquidacion_ventas_cabecera " +
        "where idLiquidacion_ventas_cabecera = ?";
    var parametros = [idLiquidacion];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function (res, resultados) {
        // busca los detalles:
        query = "Select gd.idLiquidacion_ventas_detalle as idDetalle, gd.nroCertificado, gd.precio, gd.comision, " +
            "gd.claseVehiculo as idClaseVehiculo, c.nombreClase as claseVehiculo " +
            "from Liquidacion_ventas_detalle gd " +
            "inner join Clase_Vehiculo c on gd.claseVehiculo = c.idClase " +
            "where gd.idLiquidacion_ventas_cabecera=?";
        var parametros = [req.query.idLiquidacion];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName, function (res2, results, resultados) {
            resultados[0].detalle = results;
            res.send(resultados);
        })
    });
}
exports.getPromotores = function (req, res, funcionName) {
    var idLocal = req.query.idLocal;
    var queryWhere = "";
    if (idLocal != "0") {
        queryWhere = " where u.idLocal = '" + idLocal + "'";
    }
    var query = "Select p.idPromotor, u.idUsuario, concat(u.Nombres,' ',u.Apellidos) as nombreUsuario " +
        "from Promotor p " +
        "inner join UsuarioIntranet u on p.idUsuario = u.idUsuario " + queryWhere +
        " order by u.Nombres";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}

function actualizarCatDeposito(req, res, tipoPersona, idDeposito) {
    switch (tipoPersona) {
        case 'N':

            // obtener los certificados de las liquidaciones
            var queryCertificados = "Select (Select GROUP_CONCAT(d3.nroCertificado SEPARATOR ',') FROM Liquidacion_ventas_detalle d3 " +
                "where d3.idLiquidacion_ventas_cabecera = ddl.idLiquidacion_ventas_cabecera) as nroCertificados from DepositoPN_Detalle_Liquidaciones ddl where ddl.idDepositoPN = ?"

            var parametros = [idDeposito]

            ejecutarQUERY_MYSQL(queryCertificados, parametros, res, "actualizarCatDeposito - Natural", function (res, results) {
                var listaCertificados = []
                for (var i = 0; i < results.length; i++) {
                    if (results[i].nroCertificados != null) {
                        var certificados = results[i].nroCertificados.split(",")
                        for (var y = 0; y < certificados.length; y++) {
                            listaCertificados.push(certificados[y])
                        }
                    }
                }
                if (listaCertificados.length > 0) {
                    //console.log("Certificados para actualizar deposito : " + listaCertificados)
                    //var parametros = [idDeposito, tipoPersona]
                    //*NO DEBE ACTUALIZAR tipoPersona* var queryUpdateCat = "Update Cat set idDeposito = ?, tipoPersona = ? where nroCAT in ("+listaCertificados+")"
                    var queryUpdateCat = "Update Cat set idDeposito = ? where nroCAT in (" + listaCertificados + ")"
                    var parametros = [idDeposito]
                    ejecutarQUERY_MYSQL(queryUpdateCat, parametros, res, "actualizarCATSDepositiosN", "false");
                }
            })
            break
        case 'J':

            // obtener los certificados de los contratos
            var queryCertificados = "Select (Select GROUP_CONCAT(cc.nroCertificado SEPARATOR ',') FROM Contrato_Certificados cc " +
                "where cc.idContrato = cr.idContrato) as nroCertificados, dc.idContratoRenovacion from DepositoPJ_Contrato dc " +
                "inner join Contrato_Renovacion cr on dc.idContratoRenovacion = cr.idContratoRenovacion " +
                "where dc.idDepositoPJ = ?"

            var parametros = [idDeposito]

            ejecutarQUERY_MYSQL(queryCertificados, parametros, res, "actualizarCatDeposito - Juridico", function (res, results) {

                for (var i = 0; i < results.length; i++) {
                    if (results[i].nroCertificados != null) {

                        var listaCertificados = results[i].nroCertificados
                        var idContratoRenovacion = results[i].idContratoRenovacion

                        //console.log("Certificados para actualizar deposito : " + listaCertificados)

                        var parametros = [idDeposito, tipoPersona, idContratoRenovacion]
                        var queryUpdateCat = "Update Cat set idDeposito = ?, tipoPersona = ?, idContrato_Renovacion=? where nroCAT in (" + listaCertificados + ")"

                        ejecutarQUERY_MYSQL(queryUpdateCat, parametros, res, "actualizarCATSDepositiosJ", "false");
                    }
                }
            })
            break;
    }
}

exports.actualizaEstadoDepositoPN = function (req, res, funcionName) {
    var idDepositoPN = req.body.idDepositoPN;
    var mestado = req.body.estado;
    var queryDetalle = "Update DepositoPN " +
        "set estado=? " +
        "where idDepositoPN=? ";
    var parametrosDetalle = [mestado, idDepositoPN];
    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");

    // si es aprobacion:
    if (mestado == 'B') {
        actualizarCatDeposito(req, res, "N", idDepositoPN)
    }

    res.send([idDepositoPN]);
}

exports.actualizaEstadoDepositoPJ = function (req, res, funcionName) {
    var idDepositoPJ = req.body.idDepositoPJ;
    var mestado = req.body.estado;
    var queryDetalle = "Update DepositoPJ " +
        "set estado=? " +
        "where idDepositoPJ=? ";
    var parametrosDetalle = [mestado, idDepositoPJ];
    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");

    // si es aprobacion:
    if (mestado == 'B') {
        actualizarCatDeposito(req, res, "J", idDepositoPJ)
    }

    res.send([idDepositoPJ]);
}
//RUTINAS >> VENTAS A EMPRESAS (CONTRATOS)
exports.getEmpresaTranspByNroDoc = function (req, res, funcionName) {
    var NDocumento = req.query.nroDoc;
    var queryCabecera = "Select " +
        "idPersona, tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, " +
        "calle, nro, mzLote, sector, referencia, telefonoFijo, telefonoMovil, email, idDistrito " +
        "from Persona " +
        "where nroDocumento = ?";
    var parametros = [NDocumento];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function (res, resultados) {
        if (resultados.length == 0) {
            res.send(resultados); //envia resultado nulo
        } else {
            // busca si existe como Empresa Transporte:
            var idPersEmpTransp = resultados[0].idPersona
            query = "Select idEmpresaTransp, idRepLegal, nroResolucion, nombreCorto " +
                "from EmpresaTransp where idPersona=? ";
            var parametros = [idPersEmpTransp];
            ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName, function (res2, results, resultados) {
                resultados[0].datosEmpresa = results;
                res.send(resultados);
            })
        }
    });
}
exports.consultarConstGlobales = function (req, res, funcionName) {
    var query = "Select * from ConstantesGenerales";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}

//Recupera los certificados disponibles desde el concesionario asignado para Ventas Corporativas
exports.getCertificadosVtasCorp = function (req, res, funcionName) {
    var idConcesionario = req.query.idConcesionario;
    var NFlota = parseInt(req.query.NFlota);
    var query = "Select nroCertificado as nCertificado from Certificado_movimiento " +
        "where tipOperacion='E' and idUbicacion = ? and ( idGuiaSalida = 0 or idGuiaSalida is null) " +
        "and registroEstado='0' order by nroCertificado limit ? ";

    var parametros = [idConcesionario, NFlota];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName);

}

//Lista de Contratos en estado IMPRESO para el modulo de Inclusion/exclusion
exports.getListaContratosImpresos = function (req, res, funcionName) {
    var queryWhere = "where c.estado='I' ";
    var idEmpresaTransp = parseInt(req.query.idEmpresaTransp);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta + " 23:59:59";
    if (idEmpresaTransp > 0) {
        queryWhere += " and c.idEmpresaTransp=" + idEmpresaTransp;
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            queryWhere += " and (c.fechaEmision between '" + fechaDesde + "' and '" + fechaHasta + "' ) ";
        } else {
            if (fechaDesde != "") {
                queryWhere += " and c.fechaEmision>='" + fechaDesde + "'";
            }
            if (fechaHasta != "") {
                queryWhere += " and c.fechaEmision<='" + fechaHasta + "'";
            }
        }
    }
    var query = "select " +
        "c.idContrato, date_format(c.fechaEmision, '%d/%m/%Y') as fechaEmision, r.nroCuota as utlCuota, " +
        "e.nombreCorto, c.nCuotas, r.flotaActual as flota, " +
        "date_format(c.fechaVigenciaContr, '%d/%m/%Y') as fechaIniVigencia, " +
        "date_format(DATE_ADD(c.fechaVigenciaContr, INTERVAL 1 YEAR), '%d/%m/%Y') as fechaFinVigencia " +
        "from Contrato c " +
        "inner join EmpresaTransp e on e.idEmpresaTransp = c.idEmpresaTransp " +
        "inner join Contrato_Renovacion r on c.idContrato = r.idContrato " + queryWhere +
        "and r.idContratoRenovacion in (select max(cr.idContratoRenovacion) from Contrato_Renovacion cr group by cr.idContrato) " +
        "and r.estado='I' order by fechaEmision desc ";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        //estado, idContrato, fechaEmision, nombreCorto, nCuotas, flota, fechaIniVigencia, fechaFinVigencia
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad " +
                    "from Contrato c " +
                    "inner join Contrato_Renovacion r on c.idContrato = r.idContrato " +
                    "and r.idContratoRenovacion in (select max(cr.idContratoRenovacion) from Contrato_Renovacion cr group by cr.idContrato) " +
                    queryWhere + " and r.estado='I' order by c.fechaEmision desc";

                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });
}
// CUS03: Lista de Contratos con su ultima cuota
exports.getListaContratosRenovacion = function (req, res, funcionName) {
    var idEmpresaTransp = parseInt(req.query.idEmpresaTransp);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta + " 23:59:59";
    var queryWhere = " where r.estado!='A' ";
    if (idEmpresaTransp > 0) {
        queryWhere += " and c.idEmpresaTransp=" + idEmpresaTransp;
    }
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            queryWhere += " and (r.fechaPagoCuota between '" + fechaDesde + "' and '" + fechaHasta + "' ) ";
        } else {
            if (fechaDesde != "") {
                queryWhere += " and r.fechaPagoCuota>='" + fechaDesde + "'";
            }
            if (fechaHasta != "") {
                queryWhere += " and r.fechaPagoCuota<='" + fechaHasta + "'";
            }
        }
    }
    var query = "select r.idContratoRenovacion, r.estado, c.nCuotas as nroCuotas," +
        "c.idContrato, r.nroCuota as ultCuota , date_format(c.fechaEmision, '%d/%m/%Y') as fechaEmision, " +
        "date_format(r.fechaRenovacion, '%d/%m/%Y') as fechaRenovacion, " +
        "e.nombreCorto, r.flotaActual as flota, " +
        "date_format(c.fechaVigenciaContr, '%d/%m/%Y') as fechaIniVigencia, " +
        "date_format(DATE_ADD(c.fechaVigenciaContr, INTERVAL 1 YEAR), '%d/%m/%Y') as fechaFinVigencia, " +
        "date_format(r.fechaPagoCuota, '%d/%m/%Y') as fechaPagoCuota, e.nroResolucion " +
        "from Contrato c " +
        "inner join EmpresaTransp e on e.idEmpresaTransp = c.idEmpresaTransp " +
        "inner join Contrato_Renovacion r on c.idContrato = r.idContrato " + queryWhere +
        " and c.estado='I' and r.idContratoRenovacion in (select max(cr.idContratoRenovacion) from Contrato_Renovacion cr group by cr.idContrato) order by r.fechaRenovacion desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        //estado, idContrato, fechaEmision, nombreCorto, nCuotas, flota, fechaIniVigencia, fechaFinVigencia
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad " +
                    "from Contrato c " +
                    "inner join Contrato_Renovacion r on c.idContrato = r.idContrato " + queryWhere + " group by r.idContrato order by r.fechaRenovacion desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });
}
// CUS 05: Tesoreria
exports.getListaOrdenesPagoProveedores = function (req, res, funcionName) {
    var idProveedor = parseInt(req.query.idProveedor);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var codAgraviado = req.query.codAgraviado;
    var nombreAgraviado = req.query.nombreAgraviado;
    var nroExpediente = req.query.nroExpediente;
    var nroOrdenPago = req.query.nroOrdenPago;

    var queryWhere = "";
    if (idProveedor != null && idProveedor > 0) {
        queryWhere += " where o.idProveedor=" + idProveedor;
    }
    if ((fechaDesde != null && fechaDesde != "") || (fechaHasta != null && fechaHasta != "")) {
        if (queryWhere == "") {
            queryWhere = " where "
        } else {
            queryWhere = queryWhere + " and "
        }
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere += " (o.fechaRegistro between '" + fechaDesde + "' and '" + fechaHasta + "' ) ";
        } else {
            if (fechaDesde != "") {
                queryWhere += " o.fechaRegistro>='" + fechaDesde + "'";
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere += " o.fechaRegistro<='" + fechaHasta + "'";
            }
        }
    }
    if (codAgraviado != null && codAgraviado != "") {
        if (queryWhere == "") {
            queryWhere = " where "
        } else {
            queryWhere = queryWhere + " and "
        }
        queryWhere += " a.codAgraviado = '" + codAgraviado + "' "
    }
    if (nombreAgraviado != null && nombreAgraviado != "") {
        if (queryWhere == "") {
            queryWhere = " where "
        } else {
            queryWhere = queryWhere + " and "
        }
        queryWhere += " if(p_a.tipoPersona='J', p_a.razonSocial, concat(IFNULL(p_a.nombres,''),' ',IFNULL(p_a.apellidoPaterno,''),' ',IFNULL(p_a.apellidoMaterno,''))) like '%" + nombreAgraviado + "%' "
    }
    if (nroExpediente != null && nroExpediente != "") {
        if (queryWhere == "") {
            queryWhere = " where "
        } else {
            queryWhere = queryWhere + " and "
        }
        queryWhere += " o.idExpediente = '" + nroExpediente + "' "
    }
    if (nroOrdenPago != null && nroOrdenPago != "") {
        if (queryWhere == "") {
            queryWhere = " where "
        } else {
            queryWhere = queryWhere + " and "
        }
        queryWhere += " o.nroOrdenPago = '" + nroOrdenPago + "' "
    }
    if (queryWhere == "") {
        queryWhere = " where "
    } else {
        queryWhere = queryWhere + " and o.estado != 'A' "
    }

    var query = "Select o.estado, o.nroOrdenPago, date_format(o.fechaRegistro, '%d/%m/%Y') as fechaRegistro, " +
        "if(p_pr.tipoPersona='J', p_pr.razonSocial, concat(IFNULL(p_pr.nombres,''),' ',IFNULL(p_pr.apellidoPaterno,''),' ',IFNULL(p_pr.apellidoMaterno,''))) as nombreProveedor, " +
        "if(p_a.tipoPersona='J', p_a.razonSocial, concat(IFNULL(p_a.nombres,''),' ',IFNULL(p_a.apellidoPaterno,''),' ',IFNULL(p_a.apellidoMaterno,''))) as nombreAgraviado, a.codAgraviado, o.idExpediente, " +
        "(select IFNULL(sum(d.monto),0) from DocumentoPagoProv d where d.nroOrdenPago=o.nroOrdenPago) as montoTotalDocumentos, " +
        "(select GROUP_CONCAT(d.nroDocumento SEPARATOR ', ') from DocumentoPagoProv d where d.nroOrdenPago=o.nroOrdenPago) as numerosDocumentos " +
        "from OrdenPagoProv o " +
        "inner join Proveedor pr on o.idProveedor = pr.idProveedor " +
        "inner join Persona p_pr on pr.idPersona = p_pr.idPersona " +
        "inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
        "inner join Persona p_a on a.idPersona = p_a.idPersona " + queryWhere + " order by o.nroOrdenPago desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad " +
                    "from OrdenPagoProv o " +
                    /*"inner join Proveedor pr on o.idProveedor = pr.idProveedor "+
                    "inner join Persona p_pr on pr.idPersona = p_pr.idPersona "+*/
                    "inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
                    "inner join Persona p_a on a.idPersona = p_a.idPersona " + queryWhere + " order by o.nroOrdenPago desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });
}
exports.getListaOrdenesPagoProveedoresB = function (req, res, funcionName) {
    //Ordenes de Pago aprobadas para un determinado proveedor
    var idProveedor = parseInt(req.query.idProveedor);
    var query = "Select o.nroOrdenPago, date_format(o.fechaRegistro, '%d/%m/%Y') as fechaRegistro, ex.tipoExpediente, " +
        "if(p_a.tipoPersona='J', p_a.razonSocial, concat(IFNULL(p_a.nombres,''),' ',IFNULL(p_a.apellidoPaterno,''),' ',IFNULL(p_a.apellidoMaterno,''))) as nombreAgraviado, " +
        " a.codAgraviado, o.idExpediente, " +
        "(select IFNULL(sum(d.monto),0) from DocumentoPagoProv d where d.nroOrdenPago=o.nroOrdenPago) as montoTotalDocumentos, " +
        "(select GROUP_CONCAT(d.nroDocumento SEPARATOR ', ') from DocumentoPagoProv d where d.nroOrdenPago=o.nroOrdenPago) as numerosDocumentos " +
        "from OrdenPagoProv o " +
        "inner join Expediente ex on ex.idExpediente = o.idExpediente " +
        "inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
        "inner join Persona p_a on a.idPersona = p_a.idPersona " +
        "where o.idProveedor=" + idProveedor + " and o.estado='B' order by o.nroOrdenPago desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, [], res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad " +
                    "from OrdenPagoProv o " +
                    "inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
                    "inner join Persona p_a on a.idPersona = p_a.idPersona where o.idProveedor=" + idProveedor + " and o.estado='B' order by o.nroOrdenPago desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });
}
//Recupera todas las Ordenes asociadas a un cheque
exports.getOrdenesChequeReciboPr = function (req, res, funcionName) {
    var tipoDocumento = req.query.tipoDocumento;
    var nroDocumento = req.query.nroDocumento;
    var query = "Select o.nroOrdenPago, date_format(o.fechaRegistro, '%d/%m/%Y') as fechaRegistro, ex.tipoExpediente, " +
        "if(p_a.tipoPersona='J', p_a.razonSocial, concat(IFNULL(p_a.nombres,''),' ',IFNULL(p_a.apellidoPaterno,''),' ',IFNULL(p_a.apellidoMaterno,''))) as nombreAgraviado, " +
        "a.codAgraviado, o.idExpediente, " +
        "(select IFNULL(sum(d.monto),0) from DocumentoPagoProv d where d.nroOrdenPago=o.nroOrdenPago) as montoTotalDocumentos, " +
        "(select GROUP_CONCAT(d.nroDocumento SEPARATOR ', ') from DocumentoPagoProv d where d.nroOrdenPago=o.nroOrdenPago) as numerosDocumentos " +
        "from Cheque_Ordenes ch " +
        "inner join OrdenPagoProv o on o.nroOrdenPago=ch.nroOrdenPago " +
        "inner join Expediente ex on ex.idExpediente = o.idExpediente " +
        "inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
        "inner join Persona p_a on a.idPersona = p_a.idPersona " +
        "where ch.tipoDocumento=? and ch.nroDocumento=? order by o.nroOrdenPago desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, [tipoDocumento, nroDocumento], res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad from Cheque_Ordenes " +
                    "where tipoDocumento='" + tipoDocumento + "' and nroDocumento='" + nroDocumento + "'";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });
}

exports.getListaExpedientesAgraviados = function (req, res, funcionName) {
    var queryWhere = new QueryWhere(" where e.tipoExpediente = '10' and e.estado='0' ")
    var codAgraviado = req.query.codAgraviado
    var parametros = []
    if (codAgraviado != "") {
        queryWhere.validarWhere(" a.codAgraviado = ?")
        parametros.push(codAgraviado)
    }
    var nombre = req.query.nombre
    if (nombre != "") {
        queryWhere.validarWhere(" concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '%" + nombre + "%'");
    }
    var dni = req.query.dni
    if (dni != "") {
        queryWhere.validarWhere(" p.nroDocumento = ?")
        parametros.push(dni)
    }
    var nroExpediente = req.query.nroExpediente
    if (nroExpediente != "") {
        queryWhere.validarWhere(" e.idExpediente = ?")
        parametros.push(nroExpediente)
    }

    var query = "Select e.idExpediente, e.codEvento, e.idProveedor, if(pp.tipoPersona='J', pp.razonSocial, concat(IFNULL(pp.nombres,''),' ',IFNULL(pp.apellidoPaterno,''),' ',IFNULL(pp.apellidoMaterno,''))) as nombreProveedor, " +
        " e.codAgraviado, p.nroDocumento, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado, " +
        "a.diagnostico, (select IFNULL(sum(c.monto),0) from CartaGarantia c where c.codAgraviado = e.codAgraviado and c.estado in ('P', 'F') ) as totalCartas, " +
        " (Select IFNULL(sum(d.monto),0) from DocumentoPagoProv d where d.codAgraviado = e.codAgraviado ) as totalFacturas from Expediente e " +
        "inner join Agraviado a on e.codAgraviado = a.codAgraviado " +
        "inner join Persona p on a.idPersona = p.idPersona " +
        "inner join Proveedor pr on e.idProveedor = pr.idProveedor " +
        "inner join Persona pp on pr.idPersona = pp.idPersona " + queryWhere.getQueryWhere();
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName)
}
// CAMBIADO: 30/08/2018 (Proveedor por nosocomio/funeraria)
exports.getListaCartasByAgraviado = function (req, res, funcionName) { // NOTA: campo "Nosocomio" puede contener el nombre de un NOCOMIO O FUNERARIA

    var codAgraviado = req.query.codAgraviado
    var query = "Select cg.idCarta, cg.nroCarta, tg.descripcion as etapa, if(prpe.tipoPersona='J', prpe.razonSocial, concat(prpe.nombres,' ',prpe.apellidoPaterno,' ',prpe.apellidoMaterno)) as nosocomio, n.idProveedor as idNosocomio, cg.estado, " +
        "date_format(cg.fecha, '%d/%m/%Y') as fechaCarta, ta.descripcion as tipoAtencion, cg.monto, cg.nroOrdenPago, cg.idPrimeraProyeccion from CartaGarantia cg " +
        "left join TipoGasto tg on cg.idEtapa = tg.idTipoGasto " +
        "left join Proveedor n on cg.idProveedor = n.idProveedor " +
        "left join Persona prpe on n.idPersona = prpe.idPersona " +
        "left join TipoAtencion ta on cg.idTipoAtencion = ta.idTipoAtencion " +
        "where cg.codAgraviado = ? and cg.nroOrdenPago is null and cg.estado in ('P')"

    var parametros = [codAgraviado]
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName)
}
exports.getListaTipoDocumento = function (req, res, funcionName) {
    var parametros = []
    var query = "Select idTipoDocumento, descripcion, descripBreve from TipoDocumento order by descripBreve";
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName)
}
// CAMBIADO: 30/08/2018 (Proveedor por Nosocomio/Funeraria)
exports.getOrdenPagoDetalle = function (req, res, funcionName) {

    var nroOrdenPago = req.query.nroOrdenPago

    var query = "Select o.estado, date_format (o.fechaRegistro, '%d/%m/%Y') as fechaRegistro, o.idProveedor, o.idExpediente, " +
        "e.tipoExpediente, o.codEvento, o.codAgraviado, o.fechaAprobacion, " +
        "concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado " +
        "from OrdenPagoProv o " +
        "inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
        "inner join Persona p on a.idPersona = p.idPersona " +
        "inner join Expediente e on e.idExpediente = o.idExpediente " +
        "where o.nroOrdenPago = ?";

    var params = [nroOrdenPago]

    ejecutarQUERY_MYSQL(query, params, res, funcionName, function (res, results) {

        // obtiene las cartas. NOTA: campo "Nosocomio" obtiene proveedores (Clinicas, hospitales, funerarias)

        var query = "Select cg.idCarta, cg.nroCarta, tg.descripcion as etapa, if(prpe.tipoPersona='J', prpe.razonSocial, concat(prpe.nombres,' ',prpe.apellidoPaterno,' ',prpe.apellidoMaterno)) as nosocomio, n.idProveedor as idNosocomio, cg.estado, " +
            "date_format(cg.fecha, '%d/%m/%Y') as fechaCarta, ta.descripcion as tipoAtencion, cg.monto, cg.nroOrdenPago, cg.idPrimeraProyeccion from CartaGarantia cg " +
            "left join TipoGasto tg on cg.idEtapa = tg.idTipoGasto " +
            "left join Proveedor n on cg.idProveedor = n.idProveedor " +
            "left join Persona prpe on n.idPersona = prpe.idPersona " +
            "left join TipoAtencion ta on cg.idTipoAtencion = ta.idTipoAtencion " +
            "where cg.nroOrdenPago = ?"

        var parametros = [nroOrdenPago]

        ejecutarQUERY_MYSQL_Extra(results, query, parametros, res, funcionName, function (res, listaCartas, listaOrdenes) {

            listaOrdenes[0].arrayDatosCartas = listaCartas

            var queryFacturas = "Select d.idDocumentoPagoProv as idFactura, d.idProveedor, d.nroDocumento, d.idTipoDoc, t.descripcion as tipoDocumento,  date_format(d.fechaEmision, '%d/%m/%Y') as fechaEmision, date_format(d.fechaRecepcion, '%d/%m/%Y') as fechaRecepcion, d.monto, d.observaciones, d.codAgraviado, d.nroOrdenPago, d.idEtapa from DocumentoPagoProv d " +
                "inner join TipoDocumento t on t.idTipoDocumento=d.idTipoDoc " +
                "where d.nroOrdenPago = ?"

            var parametros = [nroOrdenPago]

            ejecutarQUERY_MYSQL_Extra(listaOrdenes, queryFacturas, parametros, res, funcionName, function (res, listaFacturas, listaOrdenesFinal) {
                listaOrdenesFinal[0].arrayDatosFac = listaFacturas
                enviarResponse(res, listaOrdenesFinal)
            })

        })

    })
}
exports.guardarOrdenPago = function (req, res, funcionName) {

    // obtiene ultimo evento del mes
    var fechaActual = new Date();
    var año = fechaActual.getFullYear();
    var queryUltimoPago = "Select nroOrdenPago from OrdenPagoProv where nroOrdenPago like '" + año + "%' order by nroOrdenPago desc limit 1";
    ejecutarQUERY_MYSQL(queryUltimoPago, [], res, funcionName, function (res, resultados) {
        var nroOrdenPago;
        if (resultados.length == 0) {
            nroOrdenPago = año + "00001";
        } else {
            var numeroOrdenPago = (parseInt(resultados[0].nroOrdenPago.toString().substring(4)) + 1) + "";
            var cantidadDigitosCero = 5 - numeroOrdenPago.split("").length;
            for (var i = 1; i <= cantidadDigitosCero; i++) {
                numeroOrdenPago = "0" + numeroOrdenPago;
            }
            nroOrdenPago = año + numeroOrdenPago;
        }
        //console.log("orden pago : " + nroOrdenPago + " sera registrada!")

        var codEvento = req.body.codEvento
        var codAgraviado = req.body.codAgraviado
        var idProveedor = req.body.idProveedor
        var fechaOrden = req.body.fechaOrden

        var idExpediente = req.body.idExpediente
        var idUsuarioUpdate = req.query.idUsuarioUpdate

        // inserta la orden de pago en la tabla "OrdenPagoProv"
        var query = "Insert into OrdenPagoProv (nroOrdenPago, estado, fechaRegistro, idProveedor, idExpediente, codEvento, codAgraviado, ultActualizaUsuario, ultActualizaFecha) values (?,?,?,?,?,?,?,?, now())";

        var parametros = [nroOrdenPago, 'I', fechaOrden, idProveedor, idExpediente, codEvento, codAgraviado, idUsuarioUpdate]

        ejecutarQUERY_MYSQL_Extra(nroOrdenPago, query, parametros, res, funcionName, function (res, results, nroOrdenPago) {

            // actualiza las cartas asignandoles la orden de pago
            var listaCartas = req.body.listaCartas
            var idCartaList = []

            for (var i = 0; i < listaCartas.length; i++) {
                idCartaList.push(listaCartas[i].idCarta)
            }

            var queryUpdateCartas = "Update CartaGarantia set nroOrdenPago = ? where codAgraviado = ? and idCarta in (" + idCartaList + ")";

            var parametros = [nroOrdenPago, codAgraviado]

            ejecutarQUERY_MYSQL_Extra(nroOrdenPago, queryUpdateCartas, parametros, res, funcionName, function (res, results, nroOrdenPago) {

                // registra las facturas
                var listaFacturas = req.body.listaFacturas
                var codAgraviado = req.body.codAgraviado
                var codEvento = req.body.codEvento

                var queryFacturas = "Insert into DocumentoPagoProv(idEtapa, idProveedor, nroDocumento, idTipoDoc, fechaEmision, fechaRecepcion, monto, observaciones, codAgraviado, nroOrdenPago, codEvento ) values ";

                var valuesParams = ""

                for (var i = 0; i < listaFacturas.length; i++) {
                    if (i > 0) {
                        valuesParams = valuesParams + ", "
                    }
                    valuesParams = valuesParams + " ('" + listaFacturas[i].idEtapa + "', '" + listaFacturas[i].idProveedor + "', '" + listaFacturas[i].nroDocumento + "', '" + listaFacturas[i].idTipoDoc + "', '" + listaFacturas[i].fechaEmision + "', '" + listaFacturas[i].fechaRecepcion + "', '" + listaFacturas[i].monto + "', '" + listaFacturas[i].observaciones + "', '" + codAgraviado + "', '" + nroOrdenPago + "', '" + codEvento + "')";
                }

                queryFacturas = queryFacturas + valuesParams

                ejecutarQUERY_MYSQL_Extra(nroOrdenPago, queryFacturas, [], res, funcionName, function (res, results, nroOrdenPago) {
                    var idExpediente = req.body.idExpediente
                    actualizarEstadoExpediente(res, "actualizarEstadoExpediente", idExpediente, '1'); // cambia el estado del expediente a 1=En Proceso
                    enviarResponse(res, [nroOrdenPago])
                })
            })
        })
    })
}
exports.actualizarOrdenPago = function (req, res, funcionName) {

    var idProveedor = req.body.idProveedor
    var fechaOrden = req.body.fechaOrden
    var nroOrden = req.body.nroOrden
    var idUsuarioUpdate = req.query.idUsuarioUpdate

    // actualiza la orden de pago:
    var queryUpdateOrden = "Update OrdenPagoProv set fechaRegistro = ?, idProveedor = ?, ultActualizaUsuario=?, ultActualizaFecha=now() " +
        "where nroOrdenPago = ?";
    var parametros = [fechaOrden, idProveedor, idUsuarioUpdate, nroOrden]
    ejecutarQUERY_MYSQL(queryUpdateOrden, parametros, res, funcionName, function (res, results) {
        // resetea todas las cartas de garantia
        var nroOrden = req.body.nroOrden
        var queryUpdateCartas = "Update CartaGarantia set nroOrdenPago = null where nroOrdenPago = ?"
        var params = [nroOrden]

        ejecutarQUERY_MYSQL(queryUpdateCartas, params, res, funcionName, function (res, results) {

            // actualiza el nroOrdenPago en las cartas

            var codAgraviado = req.body.codAgraviado
            var listaCartas = req.body.listaCartas
            var nroOrden = req.body.nroOrden

            var idCartaList = []

            for (var i = 0; i < listaCartas.length; i++) {
                idCartaList.push(listaCartas[i].idCarta)
            }

            var queryUpdateCartas = "Update CartaGarantia set nroOrdenPago = ? where codAgraviado = ? and idCarta in (" + idCartaList + ")";

            var parametros = [nroOrden, codAgraviado]

            var datosPost = [
                req.body.facturasEliminadas,
                req.body.listaFacturas,
                req.body.codAgraviado,
                req.body.nroOrden,
                req.body.codEvento
            ]

            ejecutarQUERY_MYSQL_Extra(datosPost, queryUpdateCartas, parametros, res, funcionName, function (res, results, datosPost) {

                // elimina facturas				
                var facturasEliminadas = datosPost[0]
                //console.log("facturasEliminadas : " + facturasEliminadas)
                if (facturasEliminadas != undefined && facturasEliminadas.length > 0) {
                    var queryEliminarFacturas = "Delete from DocumentoPagoProv where idDocumentoPagoProv in (" + facturasEliminadas + ")"
                    ejecutarQUERY_MYSQL(queryEliminarFacturas, [], res, funcionName, "false")
                }

                // registra/actualiza facturas

                var listaFacturas = datosPost[1]
                var codAgraviado = datosPost[2]
                var nroOrdenPago = datosPost[3]
                var codEvento = datosPost[4]

                var queryFacturas = "Insert into DocumentoPagoProv(idEtapa, idProveedor, nroDocumento, idTipoDoc, fechaEmision, fechaRecepcion, monto, observaciones, codAgraviado, nroOrdenPago, codEvento ) values ";

                var valuesParams = ""

                for (var i = 0; i < listaFacturas.length; i++) {
                    if (listaFacturas[i].idFactura == 0) { // es una nueva factura, se agrega a la lista de facturas nuevas (Despues se registrara toda la lista de facturas nuevas)

                        if (valuesParams != "") {
                            valuesParams = valuesParams + ", "
                        }

                        valuesParams = valuesParams + " ('" + listaFacturas[i].idEtapa + "', '" + listaFacturas[i].idProveedor + "', '" + listaFacturas[i].nroDocumento + "', '" + listaFacturas[i].idTipoDoc + "', '" + listaFacturas[i].fechaEmision + "', '" + listaFacturas[i].fechaRecepcion + "', '" + listaFacturas[i].monto + "', '" + listaFacturas[i].observaciones + "', '" + codAgraviado + "', '" + nroOrdenPago + "', '" + codEvento + "')";

                    } else { // es una factura existente por lo tanto la actualiza inmediatamente

                        var queryUpdateFactura = "Update DocumentoPagoProv set idEtapa=?, idProveedor =?, idTipoDoc=?, nroDocumento=?, fechaEmision=?, fechaRecepcion=?, monto=?, observaciones=? where idDocumentoPagoProv = ?";

                        var params = [listaFacturas[i].idEtapa, listaFacturas[i].idProveedor, listaFacturas[i].idTipoDoc, listaFacturas[i].nroDocumento, listaFacturas[i].fechaEmision, listaFacturas[i].fechaRecepcion, listaFacturas[i].monto, listaFacturas[i].observaciones, listaFacturas[i].idFactura]

                        ejecutarQUERY_MYSQL(queryUpdateFactura, params, res, funcionName, "false")

                    }
                }
                if (valuesParams != "") { // if existen nuevas facturas se proceden a registrar
                    queryFacturas = queryFacturas + valuesParams
                    ejecutarQUERY_MYSQL(queryFacturas, [], res, funcionName, "false")
                }

                enviarResponse(res, [results.affectedRows]);

            })
        })
    })
}
// CUS 08 : Ordenes de Pago a Agraviados/Beneficiarios
exports.getListaOrdenesPagoBeneficiarios = function (req, res, funcionName) {
    var parametros = []
    var queryWhere = new QueryWhere("")
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta
    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere(" (o.fechaRegistro between '" + fechaDesde + "' and '" + fechaHasta + "' ) ");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere(" o.fechaRegistro>='" + fechaDesde + "' ");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere(" o.fechaRegistro<='" + fechaHasta + "' ");
            }
        }
    }
    var midExpediente = req.query.idExpediente
    if (midExpediente != "") {
        queryWhere.validarWhere(" o.idExpediente = ?")
        parametros.push(midExpediente)
    }
    var dni = req.query.dni
    if (dni != "") {
        queryWhere.validarWhere(" p.nroDocumento = ?")
        parametros.push(dni)
    }

    var codigoAgraviado = req.query.codigoAgraviado

    if (codigoAgraviado != "") {
        queryWhere.validarWhere(" a.codAgraviado = ?")
        parametros.push(codigoAgraviado)
    }

    var nombreAgraviado = req.query.nombreAgraviado

    if (nombreAgraviado != "") {
        queryWhere.validarWhere(" concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '%" + nombreAgraviado + "%'")
    }
    queryWhere.validarWhere(" o.estado != 'A' ");

    var query = "select o.nroOrdenPagoAgraviado as nroOrdenPago, o.idExpediente,o.idEtapa, t.descripcion as etapa, o.codAgraviado," +
        " concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado, o.monto, o.estado, date_format(o.fechaRegistro, '%d/%m/%Y') as fechaRegistro from OrdenPagoAgraviado o " +
        " inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
        " inner join Persona p on a.idPersona = p.idPersona " +
        " inner join TipoGasto t on o.idEtapa = t.idTipoGasto " + queryWhere.getQueryWhere() + " order by o.nroOrdenPagoAgraviado desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {
                var queryCantidad = "select count(*) as cantidad " +
                    "from OrdenPagoAgraviado o " +
                    " inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
                    " inner join Persona p on a.idPersona = p.idPersona "
                " inner join TipoGasto t on o.idEtapa = t.idTipoGasto " + queryWhere.getQueryWhere() + " order by o.nroOrdenPagoAgraviado desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, parametros, res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });

}
exports.getListaExpedientesParaOrdenAgraviados = function (req, res, funcionName) {
    var queryWhere = new QueryWhere(" where e.tipoExpediente in ('1', '2', '3', '4', '5') and e.estado='0' ")
    var codAgraviado = req.query.codAgraviado
    var parametros = []
    if (codAgraviado != "") {
        queryWhere.validarWhere(" a.codAgraviado = ?")
        parametros.push(codAgraviado)
    }
    var nombre = req.query.nombre
    if (nombre != "") {
        queryWhere.validarWhere(" concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) like '%" + nombre + "%'");
    }
    var dni = req.query.dni
    if (dni != "") {
        queryWhere.validarWhere(" p.nroDocumento = ?")
        parametros.push(dni)
    }
    var nroExpediente = req.query.nroExpediente
    if (nroExpediente != "") {
        queryWhere.validarWhere(" e.idExpediente = ?")
        parametros.push(nroExpediente)
    }

    var query = "Select e.idExpediente, e.codEvento, e.codAgraviado, p.nroDocumento, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado, e.tipoExpediente, " +
        "a.diagnostico from Expediente e " +
        "inner join Agraviado a on e.codAgraviado = a.codAgraviado " +
        "inner join Persona p on a.idPersona = p.idPersona " + queryWhere.getQueryWhere();
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName)
}
function abstractGuardarActualizarPersona(res, funcionName, persona, callback) { // Guarda o actualiza una Persona

    var queryInsert = "Insert into Persona (tipoPersona, razonSocial, nombres, apellidoPaterno, apellidoMaterno, nroDocumento, idDistrito, calle, telefonoMovil) values (?,?,?,?,?,?,?,?,?)";
    var queryUpdate = "Update Persona set tipoPersona=?, razonSocial=?, nombres = ?, apellidoPaterno = ?, apellidoMaterno = ? , idDistrito=?, calle = ?, telefonoMovil=? where idPersona = ? ";

    if (persona.idPersona == 0) { // se registra una nueva persona
        ejecutarQUERY_MYSQL(queryInsert, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.paterno, persona.materno, persona.DNI, persona.idDistrito, persona.direccion, persona.telf], res, funcionName, function (res, resultados) {
            if (typeof callback == 'function') {
                var idPersona = resultados.insertId;
                persona.idPersona = idPersona;
                callback(idPersona); // Devuelve el id de la Persona registrada
            }
        });
    } else { // solo se actualizara el registro de la persona
        ejecutarQUERY_MYSQL(queryUpdate, [persona.tipoPersona, persona.razonSocial, persona.nombres, persona.paterno, persona.materno, persona.idDistrito, persona.direccion, persona.telf, persona.idPersona], res, funcionName, function (res, resultados) {
            if (typeof callback == 'function') {
                callback(persona.idPersona); // Devuelve el id de la persona actualizada
            }
        });
    }
}
exports.guardarOrdenPagoAgraviado = function (req, res, funcionName) {
    // obtiene ultimo evento del mes
    var fechaActual = new Date();
    var año = fechaActual.getFullYear();
    var queryUltimoPago = "Select nroOrdenPagoAgraviado from OrdenPagoAgraviado where nroOrdenPagoAgraviado like '" + año + "%' order by nroOrdenPagoAgraviado desc limit 1";

    ejecutarQUERY_MYSQL(queryUltimoPago, [], res, funcionName, function (res, resultados) {
        var nroOrdenPago;
        if (resultados.length == 0) {
            nroOrdenPago = año + "00001";
        } else {
            var numeroOrdenPago = (parseInt(resultados[0].nroOrdenPagoAgraviado.toString().substring(4)) + 1) + "";
            var cantidadDigitosCero = 5 - numeroOrdenPago.split("").length;
            for (var i = 1; i <= cantidadDigitosCero; i++) {
                numeroOrdenPago = "0" + numeroOrdenPago;
            }
            nroOrdenPago = año + numeroOrdenPago;
        }
        //console.log("orden pago : " + nroOrdenPago + " sera registrada!")

        req.body.nroOrdenPago = nroOrdenPago

        var beneficiario = req.body.beneficiario

        if (beneficiario != undefined && beneficiario.length > 0) {
            // guarda o actualiza la persona
            var persona = {};
            persona.idPersona = beneficiario[0].idPersona;
            persona.tipoPersona = "N";
            persona.nombres = beneficiario[0].nombres;
            persona.paterno = beneficiario[0].apellidoPaterno;
            persona.materno = beneficiario[0].apellidoMaterno;
            persona.razonSocial = "";
            persona.DNI = beneficiario[0].nroDocumento;
            persona.telf = beneficiario[0].telefonoMovil;
            persona.idDistrito = beneficiario[0].distritoInicial;
            persona.direccion = beneficiario[0].calle;

            abstractGuardarActualizarPersona(res, funcionName, persona, function (idPersona_Resp) {

                var idUsuarioUpdate = req.query.idUsuarioUpdate
                var nroOrdenPago = req.body.nroOrdenPago
                var idPersona = idPersona_Resp
                var fechaRegistro = req.body.fecha
                var tipoExpediente = req.body.tipoExpediente
                var idExpediente = req.body.idExpediente
                var codEvento = req.body.codEvento
                var codAgraviado = req.body.codAgraviado
                var monto = req.body.monto
                var nroDiasInvalTemp = req.body.diasDescanso
                var porcInvalPerm = req.body.porcentaje
                var estado = req.body.estado
                var idEtapa = req.body.idEtapa
                var observaciones = req.body.observaciones

                var queryAprobado = ""
                var paramQueryAprobado = ""
                if (estado == 'B') {
                    queryAprobado = ",fechaAprobacion "
                    paramQueryAprobado = ", now()"
                    actualizarEstadoExpediente(res, funcionName, idExpediente, '3'); // cambia el estado del expediente a 3=Aprobado
                }
                if (estado == 'I') {
                    actualizarEstadoExpediente(res, funcionName, idExpediente, '1'); // cambia el estado del expediente a 1=En Proceso
                }


                var query = "Insert into OrdenPagoAgraviado(nroOrdenPagoAgraviado, estado, fechaRegistro, tipoExpediente, idExpediente, codEvento, codAgraviado, idPersona, ultActualizaUsuario, ultActualizaFecha, monto, nroDiasInvalTemp, porcInvalPerm, idEtapa, observaciones " + queryAprobado + ") values (?,?,?,?,?,?,?,?,?,now(),?,?,?,?,?" + paramQueryAprobado + ")"

                var parametros = [nroOrdenPago, estado, fechaRegistro, tipoExpediente, idExpediente, codEvento, codAgraviado, idPersona, idUsuarioUpdate, monto, nroDiasInvalTemp, porcInvalPerm, idEtapa, observaciones]

                ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "false")
                enviarResponse(res, [nroOrdenPago])

            })
        } else {

            var idUsuarioUpdate = req.query.idUsuarioUpdate
            var nroOrdenPago = req.body.nroOrdenPago
            var fechaRegistro = req.body.fecha
            var tipoExpediente = req.body.tipoExpediente
            var idExpediente = req.body.idExpediente
            var codEvento = req.body.codEvento
            var codAgraviado = req.body.codAgraviado
            var monto = req.body.monto
            var nroDiasInvalTemp = req.body.diasDescanso
            var porcInvalPerm = req.body.porcentaje
            var estado = req.body.estado
            var idEtapa = req.body.idEtapa
            var observaciones = req.body.observaciones

            var queryAprobado = ""
            var paramQueryAprobado = ""
            if (estado == 'B') {
                queryAprobado = ",fechaAprobacion "
                paramQueryAprobado = ", now()"
                actualizarEstadoExpediente(res, funcionName, idExpediente, '3'); // cambia el estado del expediente a 3=Aprobado
            }
            if (estado == 'I') {
                actualizarEstadoExpediente(res, funcionName, idExpediente, '1'); // cambia el estado del expediente a 1=En Proceso
            }

            var query = "Insert into OrdenPagoAgraviado(nroOrdenPagoAgraviado, estado, fechaRegistro, tipoExpediente, idExpediente, codEvento, codAgraviado, ultActualizaUsuario, ultActualizaFecha, monto, nroDiasInvalTemp, porcInvalPerm, idEtapa, observaciones " + queryAprobado + ") values (?,?,?,?,?,?,?,?,now(),?,?,?,?,?" + paramQueryAprobado + ")"

            var parametros = [nroOrdenPago, estado, fechaRegistro, tipoExpediente, idExpediente, codEvento, codAgraviado, idUsuarioUpdate, monto, nroDiasInvalTemp, porcInvalPerm, idEtapa, observaciones]

            ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "false")
            enviarResponse(res, [nroOrdenPago])
        }
    })
}
function actualizarEstadoCartasOrdenPagoProveedor(res, funcionName, estado, nroOrdenPagoProv) {
    var query = "Update CartaGarantia set estado = ? where nroOrdenPago =?";
    var params = [estado, nroOrdenPagoProv]
    ejecutarQUERY_MYSQL(query, params, res, funcionName, "false")
}
function actualizarEstadoExpediente(res, funcionName, idExpediente, estado) {
    var query = "Update Expediente set estado=? where idExpediente = ?"
    var params = [estado, idExpediente]
    ejecutarQUERY_MYSQL(query, params, res, funcionName, "false")
}
//26/JUL/2019 Esta funcion cambia de estado a la Orden de Pago dependiendo de si es
//Proveedor o Agraviado
exports.cambiarEstadoOrdenPago = function (req, res, funcionName) {
    var esProveedor = req.query.esProveedor
    var nroOrden = req.query.nroOrdenPago;
    var estado = req.query.estado;
    var idExpediente = req.query.idExpediente
    var estadoExp = req.query.estadoExp;
    var borraCheque = req.query.borraCheque;
    if (esProveedor == 'S') {
        var query = "Update OrdenPagoProv set estado=? where nroOrdenPago = ?";
    } else {
        var query = "Update OrdenPagoAgraviado set estado=? where nroOrdenPagoAgraviado = ?";
    }
    var params = [estado, nroOrden]
    ejecutarQUERY_MYSQL(query, params, res, funcionName,
        function (res, resultados) {
            var params = [estadoExp, idExpediente]
            var queryExpediente = "Update Expediente set estado=? where idExpediente = ?"
            ejecutarQUERY_MYSQL(queryExpediente, params, res, funcionName, "false")
            if (borraCheque == "S") {
                params = [nroOrden]
                //nroOrdenPago: Si tipoExpediente=10 (Pago IPRESS) este campo se busca en ordenPagoProv,
                // en el resto de casos se busca en ordenPagoAgraviado\n
                if (esProveedor == 'S') {
                    var queryEliminarCheque = "Delete from ChequeRecibo where nroOrdenPago=? and tipoExpediente = 10"
                } else {
                    var queryEliminarCheque = "Delete from ChequeRecibo where nroOrdenPago=? and tipoExpediente != 10"
                }
                ejecutarQUERY_MYSQL(queryEliminarCheque, params, res, funcionName, "false")
            }
            if (esProveedor == "S") {
                //Actualizar Cartas de Garantia asociadas a esta orden de Pago (P=imPresa=Pendientes pago)
                actualizarEstadoCartasOrdenPagoProveedor(res, 'actualizarEstadoCartasOrdenPagoProveedor', 'P', nroOrden)
            }
            res.send(resultados);
        });
}

exports.actualizarOrdenPagoAgraviado = function (req, res, funcionName) {
    var fecha = req.body.fecha
    var beneficiario = req.body.beneficiario
    if (beneficiario != undefined && beneficiario.length > 0) {
        // guarda o actualiza la persona
        var persona = {};
        persona.idPersona = beneficiario[0].idPersona;
        persona.tipoPersona = "N";
        persona.nombres = beneficiario[0].nombres;
        persona.paterno = beneficiario[0].apellidoPaterno;
        persona.materno = beneficiario[0].apellidoMaterno;
        persona.razonSocial = "";
        persona.DNI = beneficiario[0].nroDocumento;
        persona.telf = beneficiario[0].telefonoMovil;
        persona.idDistrito = beneficiario[0].distritoInicial;
        persona.direccion = beneficiario[0].calle;

        abstractGuardarActualizarPersona(res, funcionName, persona, function (idPersona_Resp) {

            var idUsuarioUpdate = req.query.idUsuarioUpdate
            var nroOrdenPago = req.body.nroOrdenPago
            var idPersona = idPersona_Resp
            var fechaRegistro = req.body.fecha

            var monto = req.body.monto
            var nroDiasInvalTemp = req.body.diasDescanso
            var porcInvalPerm = req.body.porcentaje
            var estado = req.body.estado
            var idEtapa = req.body.idEtapa
            var observaciones = req.body.observaciones

            var queryAprobado = ""
            var paramQueryAprobado = ""
            if (estado == 'B') {
                queryAprobado = ",fechaAprobacion = now() "
                var idExpediente = req.body.idExpediente
                actualizarEstadoExpediente(res, funcionName, idExpediente, '3'); // cambia el estado del expediente a 3=Aprobado
            }
            if (estado == 'A') {
                var idExpediente = req.body.idExpediente
                actualizarEstadoExpediente(res, funcionName, idExpediente, '0'); // cambia el estado del expediente a 0=Nuevo
            }
            var query = "Update OrdenPagoAgraviado set estado=?, fechaRegistro=?, idPersona=?, ultActualizaUsuario=?, ultActualizaFecha=now(), monto=?, nroDiasInvalTemp=?, porcInvalPerm=?, idEtapa=?, observaciones=? " + queryAprobado + " where nroOrdenPagoAgraviado = ? "

            var parametros = [estado, fechaRegistro, idPersona, idUsuarioUpdate, monto, nroDiasInvalTemp, porcInvalPerm, idEtapa, observaciones, nroOrdenPago]

            ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "affectedRows")

        })
    } else {
        var idUsuarioUpdate = req.query.idUsuarioUpdate
        var nroOrdenPago = req.body.nroOrdenPago
        var idPersona = null
        var fechaRegistro = req.body.fecha

        var monto = req.body.monto
        var nroDiasInvalTemp = req.body.diasDescanso
        var porcInvalPerm = req.body.porcentaje
        var estado = req.body.estado
        var idEtapa = req.body.idEtapa
        var observaciones = req.body.observaciones

        var queryAprobado = ""
        var paramQueryAprobado = ""
        if (estado == 'B') {
            queryAprobado = ",fechaAprobacion = now() "
            var idExpediente = req.body.idExpediente
            actualizarEstadoExpediente(res, funcionName, idExpediente, '3'); // cambia el estado del expediente a 3=Aprobado
        }
        if (estado == 'A') {
            var idExpediente = req.body.idExpediente
            actualizarEstadoExpediente(res, funcionName, idExpediente, '0'); // cambia el estado del expediente a 0=Nuevo
        }
        var query = "Update OrdenPagoAgraviado set estado=?, fechaRegistro=?, idPersona=?, ultActualizaUsuario=?, ultActualizaFecha=now(), monto=?, nroDiasInvalTemp=?, porcInvalPerm=?, idEtapa=?, observaciones=? " + queryAprobado + " where nroOrdenPagoAgraviado = ? "

        var parametros = [estado, fechaRegistro, idPersona, idUsuarioUpdate, monto, nroDiasInvalTemp, porcInvalPerm, idEtapa, observaciones, nroOrdenPago]

        ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "affectedRows")
    }
}
exports.getOrdenPagoAgraviadoDetalle = function (req, res, funcionName) {

    var nroOrdenPago = req.query.nroOrdenPago

    var query = "Select o.estado, date_format (o.fechaRegistro, '%d/%m/%Y') as fechaRegistro, o.idExpediente, o.codEvento, o.codAgraviado, o.fechaAprobacion, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado, o.idEtapa, t.descripcion as etapa, o.tipoExpediente, pa.idPersona, pa.nombres, pa.apellidoPaterno, pa.apellidoMaterno, pa.telefonoMovil, pa.calle, pa.idDistrito as distritoInicial, pa.nroDocumento, o.monto, o.nroDiasInvalTemp, o.porcInvalPerm, o.observaciones from OrdenPagoAgraviado o " +
        "inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
        "inner join Persona p on a.idPersona = p.idPersona " +
        "inner join TipoGasto t on o.idEtapa = t.idTipoGasto " +
        "left join Persona pa on o.idPersona = pa.idPersona " +
        "where o.nroOrdenPagoAgraviado = ?";

    var params = [nroOrdenPago]

    ejecutarQUERY_MYSQL(query, params, res, funcionName)
}
exports.getUITandSueldoMinimo = function (req, res, funcionName) {
    var codEvento = req.query.codEvento;
    var query = "Select UIT, sueldoMinVital from Informe where codEvento = ?";
    ejecutarQUERY_MYSQL(query, [codEvento], res, funcionName)
}
// CUS 07
exports.getBeneficiariosPorCheque = function (req, res, funcionName) {
    var query = "Select distinct nombreDestino from ChequeRecibo where nombreDestino is not null and nombreDestino!='' order by nombreDestino"
    ejecutarQUERY_MYSQL(query, [], res, funcionName)
}
exports.getListaPagosCheques = function (req, res, funcionName) {
    var parametros = []
    var queryWhere = new QueryWhere("")
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var codAgraviado = req.query.codAgraviado;
    var nroExpediente = req.query.nroExpediente;
    var nroOrdenPago = req.query.nroOrdenPago;
    var proveedor_benef = req.query.proveedor_benef

    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere(" (o.fechaRegistro between '" + fechaDesde + "' and '" + fechaHasta + "' ) ");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere(" o.fechaRegistro>='" + fechaDesde + "' ");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere(" o.fechaRegistro<='" + fechaHasta + "' ");
            }
        }
    }
    if (proveedor_benef != "") {
        queryWhere.validarWhere(" o.nombreDestino = ?")
        parametros.push(proveedor_benef)
    }
    if (codAgraviado != "") {
        queryWhere.validarWhere(" o.codAgraviado = ?")
        parametros.push(codAgraviado)
    }
    if (nroExpediente != "") {
        queryWhere.validarWhere(" o.idExpediente = ?")
        parametros.push(nroExpediente)
    }
    if (nroOrdenPago != "") {
        queryWhere.validarWhere(" o.nroOrdenPago = ?")
        parametros.push(nroOrdenPago)
    }

    var query = "select o.tipoDocumento, o.nroDocumento, date_format(o.fechaRegistro, '%d/%m/%Y') as fechaRegistro, o.monto, o.idExpediente, o.tipoExpediente, o.nroOrdenPago, o.nombreDestino, " +
        " concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado " +
        " from ChequeRecibo o" +
        " inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
        " inner join Persona p on a.idPersona = p.idPersona " + queryWhere.getQueryWhere() + " order by o.fechaRegistro desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {

                var queryCantidad = "select count(*) as cantidad " +
                    " from ChequeRecibo o" +
                    " inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
                    " inner join Persona p on a.idPersona = p.idPersona " + queryWhere.getQueryWhere() + " order by o.fechaRegistro desc";

                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, parametros, res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });
}
// 15/OCT/19 Lista de cheques a proveedores
exports.getListaChequesProv = function (req, res, funcionName) {
    var parametros = []
    var queryWhere = new QueryWhere("")
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    var idProveedor = req.query.idProveedor

    if (fechaDesde != "" || fechaHasta != "") {
        if (fechaDesde != "" && fechaHasta != "") {
            fechaHasta = fechaHasta + " 23:59:59";
            queryWhere.validarWhere(" (o.fechaRegistro between '" + fechaDesde + "' and '" + fechaHasta + "' ) ");
        } else {
            if (fechaDesde != "") {
                queryWhere.validarWhere(" o.fechaRegistro>='" + fechaDesde + "' ");
            }
            if (fechaHasta != "") {
                fechaHasta = fechaHasta + " 23:59:59";
                queryWhere.validarWhere(" o.fechaRegistro<='" + fechaHasta + "' ");
            }
        }
    }
    if (typeof idProveedor != "undefined" && idProveedor != "") {
        queryWhere.validarWhere(" o.idProveedor = ?")
        parametros.push(idProveedor)
    } else { //incluye todos los cheques girados a proveedores
        queryWhere.validarWhere(" o.idProveedor != 0")
    }

    var query = "select o.tipoDocumento, o.nroDocumento, date_format(o.fechaRegistro, '%d/%m/%Y') as fechaRegistro, o.monto, " +
        "if(p.tipoPersona='J', p.razonSocial, concat(IFNULL(p.nombres,''),' ',IFNULL(p.apellidoPaterno,''),' ',IFNULL(p.apellidoMaterno,''))) as nombreProveedor, " +
        "(select GROUP_CONCAT(d.nroOrdenPago SEPARATOR ', ') from Cheque_Ordenes d where (d.tipoDocumento=o.tipoDocumento AND d.nroDocumento=o.nroDocumento)) as listaOrdenPago, " +
        "(select GROUP_CONCAT(dp.nroDocumento SEPARATOR ', ') from Cheque_Ordenes d inner join DocumentoPagoProv dp on dp.nroOrdenPago=d.nroOrdenPago where (d.tipoDocumento=o.tipoDocumento AND d.nroDocumento=o.nroDocumento)) as listaFacturas " +
        "from ChequeRecibo o " +
        "inner join Proveedor pr on pr.idProveedor=o.idProveedor " +
        "inner join Persona p on p.idPersona=pr.idPersona " +
        queryWhere.getQueryWhere() + " order by o.fechaRegistro desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, resultados) {
        if (resultados.length > 0) {
            if (cantPaginas == 0) {

                var queryCantidad = "select count(*) as cantidad " +
                    " from ChequeRecibo o" +
                    " inner join Agraviado a on o.codAgraviado = a.codAgraviado " +
                    " inner join Persona p on a.idPersona = p.idPersona " + queryWhere.getQueryWhere() + " order by o.fechaRegistro desc";

                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, parametros, res, funcionName, function (res, rows, resultados) {
                    var cantidadPag = Math.ceil(rows[0].cantidad / registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            } else {
                res.send(resultados);
            }
        } else {
            res.send(resultados);
        }
    });
}
/* MODIFICACION 14/OCT/19: Separar esta consulta en 2, ya que los cheques a proveedores seran tratados diferentes 
exports.getListaOrdenesPagoAgrav_Proveed = function(req, res, funcionName){
    var queryWhere = new QueryWhere(" where v.estadoOrden='B' ") // busca los expedientes pagados
    var parametros = []
	
    var codAgraviado = req.query.codAgraviado    
    if(codAgraviado!=""){
        queryWhere.validarWhere(" v.codAgraviado = ?")
        parametros.push(codAgraviado)
    }
	
    var nombre = req.query.nombre
    if(nombre!=""){
        queryWhere.validarWhere(" v.nombreAgraviado like '%"+nombre+"%'");
    }
	
    var dni = req.query.dni
    if(dni!=""){
        queryWhere.validarWhere(" v.nroDocumento = ?")
        parametros.push(dni)
    }
	
    var nroExpediente = req.query.nroExpediente
    if(nroExpediente!=""){
        queryWhere.validarWhere(" v.idExpediente = ?")
        parametros.push(nroExpediente)
    }
	
    var nroOrden = req.query.nroOrden
    if(nroOrden!=""){
        queryWhere.validarWhere(" v.ordenPago = ?")
        parametros.push(nroOrden)
    }
	
    var query = "Select * from ( (select oa.estado as estadoOrden, oa.idExpediente, oa.codEvento, oa.codAgraviado, poa.nroDocumento, concat(poa.nombres,' ',poa.apellidoPaterno,' ',poa.apellidoMaterno) as nombreAgraviado, aoa.diagnostico, "+
    "oa.nroOrdenPagoAgraviado as ordenPago, 'A' as tipoOrden, oa.monto, eoa.tipoExpediente, "+
    "if(oa.idPersona>0, concat(boa.nombres,' ',boa.apellidoPaterno,' ',boa.apellidoMaterno), concat(poa.nombres,' ',poa.apellidoPaterno,' ',poa.apellidoMaterno)) as beneficiario "+
    " from OrdenPagoAgraviado oa inner join Agraviado aoa on aoa.codAgraviado = oa.codAgraviado inner join Persona poa on aoa.idPersona = poa.idPersona inner join Expediente eoa on oa.idExpediente = eoa.idExpediente left join Persona boa on oa.idPersona = boa.idPersona ) "+
    " UNION "+
    " (select op.estado as estadoOrden, op.idExpediente, op.codEvento, op.codAgraviado, pop.nroDocumento, concat(pop.nombres,' ',pop.apellidoPaterno,' ',pop.apellidoMaterno) as nombreAgraviado, aop.diagnostico, "+
    "op.nroOrdenPago as ordenPago, 'P' as tipoOrden, op.monto, eop.tipoExpediente, "+
    "if(ppro.tipoPersona='J', ppro.razonSocial, concat(ppro.nombres,' ',ppro.apellidoPaterno,' ',ppro.apellidoMaterno)) as beneficiario "+
    " from OrdenPagoProv op  inner join Agraviado aop on aop.codAgraviado = op.codAgraviado inner join Persona pop on aop.idPersona = pop.idPersona inner join Expediente eop on op.idExpediente = eop.idExpediente inner join Proveedor prop on op.idProveedor=prop.idProveedor inner join Persona ppro on prop.idPersona = ppro.idPersona ) "+
    ") as v "+queryWhere.getQueryWhere();
	
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName)
	
}
*/
exports.getListaOrdenesPagoAgrav = function (req, res, funcionName) {
    var queryWhere = new QueryWhere(" where v.estadoOrden='B' ") // busca los expedientes pagados
    var parametros = []

    var codAgraviado = req.query.codAgraviado
    if (codAgraviado != "") {
        queryWhere.validarWhere(" v.codAgraviado = ?")
        parametros.push(codAgraviado)
    }

    var nombre = req.query.nombre
    if (nombre != "") {
        queryWhere.validarWhere(" v.nombreAgraviado like '%" + nombre + "%'");
    }

    var dni = req.query.dni
    if (dni != "") {
        queryWhere.validarWhere(" v.nroDocumento = ?")
        parametros.push(dni)
    }

    var nroExpediente = req.query.nroExpediente
    if (nroExpediente != "") {
        queryWhere.validarWhere(" v.idExpediente = ?")
        parametros.push(nroExpediente)
    }

    var nroOrden = req.query.nroOrden
    if (nroOrden != "") {
        queryWhere.validarWhere(" v.ordenPago = ?")
        parametros.push(nroOrden)
    }

    var query = "Select * from " +
        "(select oa.estado as estadoOrden, oa.idExpediente, oa.codEvento, oa.codAgraviado, poa.nroDocumento, " +
        "concat(poa.nombres,' ',poa.apellidoPaterno,' ',poa.apellidoMaterno) as nombreAgraviado, aoa.diagnostico, " +
        "oa.nroOrdenPagoAgraviado as ordenPago, 'A' as tipoOrden, oa.monto, eoa.tipoExpediente, " +
        "if(oa.idPersona>0, concat(boa.nombres,' ',boa.apellidoPaterno,' ',boa.apellidoMaterno), " +
        "concat(poa.nombres,' ',poa.apellidoPaterno,' ',poa.apellidoMaterno)) as beneficiario " +
        " from OrdenPagoAgraviado oa inner join Agraviado aoa on aoa.codAgraviado = oa.codAgraviado " +
        " inner join Persona poa on aoa.idPersona = poa.idPersona " +
        " inner join Expediente eoa on oa.idExpediente = eoa.idExpediente " +
        " left join Persona boa on oa.idPersona = boa.idPersona ) " +
        " as v " + queryWhere.getQueryWhere();

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName)

}
// 20/OCT/19: Los cheques a Proveedores referencian multiples Ordenes de Pago 
exports.guardarChequeReciboPr = function (req, res, funcionName) {
    var tipoDocumento = req.body.tipoDocumento
    var nroDocumento = req.body.nroDocumento
    var fecha = req.body.fecha
    var monto = req.body.monto
    var idCuentaBancaria = req.body.idCuentaBancaria
    var tipoCheque = req.body.tipoCheque
    //var nroOrdenPago = req.body.nroOrdenPago
    //var tipoExpediente = req.body.tipoExpediente
    //var idExpediente = req.body.idExpediente
    //var codEvento = req.body.codEvento
    //var codAgraviado = req.body.codAgraviado
    var observaciones = req.body.observaciones
    var nombreDestino = req.body.nombreDestino
    var idProveedor = req.body.idProveedor
    var listaOrdenes = req.body.listaOrdenes
    var query = "INSERT INTO ChequeRecibo(tipoDocumento,nroDocumento,fechaDocumento,fechaRegistro,monto,idCuentaBancaria,tipoCheque, " +
        " nombreDestino, observaciones,idProveedor) values (?,?,?,now(),?,?,?,?,?,?)";
    var parametros = [tipoDocumento, nroDocumento, fecha, monto, idCuentaBancaria, tipoCheque, nombreDestino, observaciones, idProveedor]
    //-----------------------------------------------------------------------------
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, function (res, resultados) {
        var insertados = resultados.affectedRows;
        if (insertados > 0) { //Cheque creado => agregar ordenes
            var i = 0;
            for (i = 0; i < listaOrdenes.length; i++) {
                // Guarda la lista de Ordenes relacionadas
                var queryInsertDetalle = "Insert " +
                    "into Cheque_Ordenes(tipoDocumento, nroDocumento, nroOrdenPago)" +
                    " values (?,?,?)";
                var params = [tipoDocumento, nroDocumento, listaOrdenes[i].nroOrdenPago];
                ejecutarQUERY_MYSQL(queryInsertDetalle, params, res, funcionName, "false");
                // Actualiza sus estados a "P"agado
                var queryUpdate = ""
                queryUpdate = "Update OrdenPagoProv set estado = 'P', tipoDocPago=?, nroDocPago=? where nroOrdenPago=?";
                ejecutarQUERY_MYSQL(queryUpdate, params, res, funcionName, "false")
                // cambia el estado del expediente a 4=Pagado
                actualizarEstadoExpediente(res, funcionName, listaOrdenes[i].idExpediente, '4');
            }
            res.send([insertados]);
        }
    });
    //-----------------------------------------------------------------------------
}
exports.getChequeReciboDetallePr = function (req, res, funcionName) {
    var nroDocumento = req.query.nroDocumento
    var tipoDocumento = req.query.tipoDocumento
    var query = "select  date_format(fechaDocumento, '%d/%m/%Y') as fechaDocumento, tipoCheque, " +
        " idCuentaBancaria, monto, observaciones, idProveedor " +
        " from ChequeRecibo " +
        " where nroDocumento = ? and tipoDocumento = ?"
    var params = [nroDocumento, tipoDocumento]
    ejecutarQUERY_MYSQL(query, params, res, funcionName)
}
//Revierte condicion: ChequeRecibo + Cheque_Ordenes y estado de las Ordenes incluidas
exports.anularChequeReciboPr = function (req, res, funcionName) {
    var tipoDocumento = req.body.tipoDocumento;
    var nroDocumento = req.body.nroDocumento;
    var listaOrdenes = req.body.listaOrdenes;

    var queryDetalle = "Delete from ChequeRecibo where  nroDocumento = ? and tipoDocumento = ?"
    var parametrosDetalle = [nroDocumento, tipoDocumento];
    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
    var i = 0;
    for (i = 0; i < listaOrdenes.length; i++) {
        // regresa sus estados a Apro"B"ado
        var params = [listaOrdenes[i].nroOrdenPago];
        var mquery = "Update OrdenPagoProv set estado = 'B', tipoDocPago='', nroDocPago='' where nroOrdenPago=?";
        ejecutarQUERY_MYSQL(mquery, params, res, funcionName, "false")
        // cambia el estado del expediente a 3=Aprobado
        actualizarEstadoExpediente(res, funcionName, listaOrdenes[i].idExpediente, '3');
        // Quita la lista de Ordenes relacionadas
        mquery = "Delete from Cheque_Ordenes where  nroDocumento = ? and tipoDocumento = ?"
        params = [nroDocumento, tipoDocumento];
        ejecutarQUERY_MYSQL(mquery, params, res, funcionName, "false");
    }
    res.send([1]);
}

exports.guardarChequeRecibo = function (req, res, funcionName) {

    var tipoDocumento = req.body.tipoDocumento
    var nroDocumento = req.body.nroDocumento
    var fecha = req.body.fecha
    var monto = req.body.monto
    var idCuentaBancaria = req.body.idCuentaBancaria
    var tipoCheque = req.body.tipoCheque
    var nroOrdenPago = req.body.nroOrdenPago
    var tipoExpediente = req.body.tipoExpediente
    var idExpediente = req.body.idExpediente
    var codEvento = req.body.codEvento
    var codAgraviado = req.body.codAgraviado
    var observaciones = req.body.observaciones
    var nombreDestino = req.body.nombreDestino

    var query = "INSERT INTO ChequeRecibo(tipoDocumento,nroDocumento,fechaDocumento,fechaRegistro,monto,idCuentaBancaria,tipoCheque,nroOrdenPago,tipoExpediente, " +
        "idExpediente, nombreDestino, codAgraviado, codEvento, observaciones) values (?,?,?,now(),?,?,?,?,?,?,?,?,?,?)";

    var parametros = [tipoDocumento, nroDocumento, fecha, monto, idCuentaBancaria, tipoCheque, nroOrdenPago, tipoExpediente, idExpediente, nombreDestino, codAgraviado, codEvento, observaciones]

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "affectedRows")
    // actualiza la orden de pago
    var queryUpdate = ""
    var params = [tipoDocumento, nroDocumento, nroOrdenPago]
    if (tipoExpediente == '10') { // a IPRESS
        queryUpdate = "Update OrdenPagoProv set estado = 'P', tipoDocPago=?, nroDocPago=? where nroOrdenPago=?";
    } else {
        queryUpdate = "Update OrdenPagoAgraviado set estado = 'P', tipoDocPago=?, nroDocPago=? where nroOrdenPagoAgraviado=?";
    }
    ejecutarQUERY_MYSQL(queryUpdate, params, res, funcionName, "false")

    actualizarEstadoExpediente(res, funcionName, idExpediente, '4'); // cambia el estado del expediente a 4=Pagado
}
exports.getChequeReciboDetalle = function (req, res, funcionName) {
    var nroDocumento = req.query.nroDocumento
    var tipoDocumento = req.query.tipoDocumento

    var query = "select cr.codEvento, cr.codAgraviado, cr.idExpediente, cr.tipoExpediente, cr.nroOrdenPago, date_format(cr.fechaDocumento, '%d/%m/%Y') as fechaDocumento, cr.tipoCheque, cr.idCuentaBancaria, cr.monto, cr.observaciones, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno) as nombreAgraviado from ChequeRecibo cr " +
        "inner join Agraviado a on cr.codAgraviado = a.codAgraviado " +
        "inner join Persona p on a.idPersona = p.idPersona where cr.nroDocumento = ? and cr.tipoDocumento = ?"

    var params = [nroDocumento, tipoDocumento]
    ejecutarQUERY_MYSQL(query, params, res, funcionName)
}
exports.actualizarChequeRecibo = function (req, res, funcionName) {
    var tipoDocumento = req.body.tipoDocumento
    var nroDocumento = req.body.nroDocumento
    var fecha = req.body.fecha
    var monto = req.body.monto
    var idCuentaBancaria = req.body.idCuentaBancaria
    var tipoCheque = req.body.tipoCheque
    var observaciones = req.body.observaciones
    var nroDocumentoOriginal = req.body.nroDocumentoOriginal
    var queryUpdate = "Update ChequeRecibo set tipoCheque=?, idCuentaBancaria = ?, fechaDocumento=?, observaciones=?, monto=?, nroDocumento=? where nroDocumento=? and tipoDocumento=?"

    var params = [tipoCheque, idCuentaBancaria, fecha, observaciones, monto, nroDocumento, nroDocumentoOriginal, tipoDocumento]

    ejecutarQUERY_MYSQL(queryUpdate, params, res, funcionName, "affectedRows")

}
// FEB/27 18:00 Aprobacion/Anulacion Ordenes Pago Proveedores
exports.actualizaEstadoOrdenPago = function (req, res, funcionName) {
    var mEstado = req.body.estado;
    var nroOrden = req.body.nroOrden
    var idExpediente = req.body.idExpediente
    var idUsuarioUpdate = req.query.idUsuarioUpdate
    if (mEstado == 'B') { //Orden Aprobada
        actualizarEstadoExpediente(res, funcionName, idExpediente, '3'); // cambia el estado del expediente a 3=Aprobado
        actualizarEstadoCartasOrdenPagoProveedor(res, 'actualizarEstadoCartasOrdenPagoProveedor', 'F', nroOrden) // cambia el estado de la cartas a  F=Facturado
    }
    if (mEstado == 'A') { // Orden anulada
        actualizarEstadoExpediente(res, funcionName, idExpediente, '0'); // cambia el estado del expediente a 0=Nuevo
        //18/NOV/2019 Ademas debe liberar las CG: nroOrdenPago=null 
        var query = "Update CartaGarantia set estado = 'P' nroOrdenPago = null where nroOrdenPago =?";
        var params = [nroOrden]
        ejecutarQUERY_MYSQL(query, params, res, funcionName, "false")
        //borrar las facturas ingresadas
        var queryEliminarFacturas = "Delete from DocumentoPagoProv where nroOrdenPago =?"
        ejecutarQUERY_MYSQL(queryEliminarFacturas, [nroOrden], res, funcionName, "false")
        // Las ordenes ANULADAS ya no se veran en la lista general de Ordenes de Pago
    }
    // actualiza la orden de pago:
    var queryUpdateOrden = "Update OrdenPagoProv set estado = ?, ultActualizaUsuario=?, ultActualizaFecha=now() " +
        "where nroOrdenPago = ?";
    var parametros = [mEstado, idUsuarioUpdate, nroOrden]

    ejecutarQUERY_MYSQL(queryUpdateOrden, parametros, res, funcionName, "false");
    res.send([nroOrden]);
}
exports.getPlantillaOrdenPagoAgraviado = function (req, res, funcionName) {
    var nroOrdenPago = req.query.nroOrden
    var query = "select plantillaCuerpoOrdenPago, (select plantillaCuerpoOPA from ConstantesGenerales limit 1) as plantillaDefault from OrdenPagoAgraviado where nroOrdenPagoAgraviado = ?"
    var params = [nroOrdenPago]
    ejecutarQUERY_MYSQL(query, params, res, funcionName)
}
exports.actualizarPlantillaOrdenPagoAgraviado = function (req, res, funcionName) {
    var nroOrdenPago = req.body.nroOrden
    var plantilla = req.body.plantilla
    var query = "Update OrdenPagoAgraviado set plantillaCuerpoOrdenPago = ? where nroOrdenPagoAgraviado = ?"
    var params = [plantilla, nroOrdenPago]
    ejecutarQUERY_MYSQL(query, params, res, funcionName, "affectedRows")
}
function getTextoInicialOPA(texto, codAgraviado, fechaAccidente) {
    texto = texto.replace("@codAgraviado", codAgraviado)
    texto = texto.replace("@fechaAccidente", fechaAccidente)
    return texto
}
exports.imprimeDEPOSITOPN = function (req, res, funcionName) {
    var idDepositoPN = req.query.idTranx;
    var mQuery = "Select  lq.idLiquidacion_ventas_cabecera as idLiquidacion, " +
        "if( p.tipoPersona='J',p.RazonSocial,concat(p.nombres,', ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreConcesionario, " +
        "lqd.nroCertificado,c.placa,cl.nombreClase,c.prima,c.comision,c.aporte,(c.prima+c.comision+c.aporte) as monto, " +
        "concat('S/. ',format(c.prima+c.comision+c.aporte,2)) as montoSoles " +
        "from DepositoPN_Detalle_Liquidaciones lq " +
        "inner join Liquidacion_ventas_cabecera lqc on lq.idLiquidacion_ventas_cabecera = lqc.idLiquidacion_ventas_cabecera " +
        "inner join Concesionario cn on lqc.idConcesionario = cn.idConcesionario " +
        "inner join Persona p on cn.idPersona = p.idPersona " +
        "inner join Liquidacion_ventas_detalle lqd on lqc.idLiquidacion_ventas_cabecera=lqd.idLiquidacion_ventas_cabecera " +
        "inner join Cat c on c.nroCAT=lqd.nroCertificado " +
        "inner join Clase_Vehiculo cl on cl.idClase=lqd.claseVehiculo " +
        "where lq.idDepositoPN=?";
    var parametros = [idDepositoPN];
    var datos = {};
    ejecutarQUERY_MYSQL(mQuery, parametros, res, funcionName,
        function (res, resultados) {
            datos.listaCATS = resultados
            mQuery = "Select  ( case when dp.tipo='D' then 'Deposito' else 'Cheque' end )  as tipoDeposito, " +
                "date_format(dp.fechaDeposito, '%d/%m/%Y') as fechaDep,dp.nroVoucherBanco as nroVoucher, " +
                "b.nombreReducido,c.nroCuenta,dp.monto,concat('S/. ',format(dp.monto,2)) as montoSoles " +
                "from DepositoPN_Detalle dp " +
                "inner join CuentaBancaria c on dp.idCuenta = c.idCuentaBancaria " +
                "inner join Banco b on c.idBanco = b.idBanco " +
                "where dp.idDepositoPN=? ";
            parametros = [idDepositoPN];
            ejecutarQUERY_MYSQL_Extra(resultados, mQuery, parametros, res, funcionName,
                function (res, results, resultados) {
                    datos.listaDEPOSITOS = results;
                    var variables = [];
                    variables.push({ 'nombreVariable': 'nombreLocal', 'value': req.query.local });
                    variables.push({ 'nombreVariable': 'idDeposito', 'value': idDepositoPN });
                    variables.push({ 'nombreVariable': 'fechaDep', 'value': req.query.fechTranx });
                    // grilla de CATs:
                    var listaCATS = datos.listaCATS;
                    var tablaCATS = '<table border="1" id="tabla_cats" width="100%" style="font-family:Arial; font-size:9px;border-collapse: collapse;">' +
                        '<thead>' +
                        '  <tr style="color:white; background-color:#4485A6; font-size:10px; height:25px;">' +
                        '<th>N°Liquidacion</th>' +
                        '<th>CONCESIONARIO</th>' +
                        '<th>N° CAT</th>' +
                        '<th>PLACA</th>' +
                        '<th>CLASE VEHICULO</th>' +
                        '<th>PRIMA</th>' +
                        '<th>COMISION</th>' +
                        '<th>APORTE</th>' +
                        '<th>TOTAL VENTA</th>' +
                        '  </tr>' +
                        '</thead><tbody>';
                    var totalVta = 0, totalPrima = 0, totalComision = 0, totalAporte = 0;
                    for (var i = 0; i < listaCATS.length; i++) {
                        tablaCATS = tablaCATS +
                            "<tr>" +
                            "<td>" + listaCATS[i].idLiquidacion + "</td>" +
                            "<td>" + listaCATS[i].nombreConcesionario + "</td>" +
                            "<td>" + listaCATS[i].nroCertificado + "</td>" +
                            "<td>" + listaCATS[i].placa + "</td>" +
                            "<td>" + listaCATS[i].nombreClase + "</td>" +
                            "<td style='text-align: center;'>" + listaCATS[i].prima + "</td>" +
                            "<td style='text-align: center;'>" + listaCATS[i].comision + "</td>" +
                            "<td style='text-align: center;'>" + listaCATS[i].aporte + "</td>" +
                            "<td style='text-align: center;'>" + listaCATS[i].montoSoles + "</td>" +
                            "</tr>";
                        totalPrima += listaCATS[i].prima;
                        totalComision += listaCATS[i].comision;
                        totalAporte += listaCATS[i].aporte;
                        totalVta += listaCATS[i].monto;
                    }
                    tablaCATS = tablaCATS +
                        "<tr>" +
                        "<td></td>" +
                        "<td></td>" +
                        "<td></td>" +
                        "<td></td>" +
                        '<td style="text-align: right;">TOTALES</td>' +
                        "<td style='text-align: center;'>S/." + number_format(totalPrima, 2, '.', ',') + "</td>" +
                        "<td style='text-align: center;'>S/." + number_format(totalComision, 2, '.', ',') + "</td>" +
                        "<td style='text-align: center;'>S/." + number_format(totalAporte, 2, '.', ',') + "</td>" +
                        "<td style='text-align: center;'>S/." + number_format(totalVta, 2, '.', ',') + "</td>" +
                        "</tr>";
                    tablaCATS = tablaCATS + "</tbody></table>";
                    variables.push({ 'nombreVariable': 'tablaCATS', 'value': tablaCATS });
                    variables.push({ 'nombreVariable': 'totalVentas', 'value': totalVta });
                    // grilla de DEPOSITOs:
                    var listaDEPOSITOS = datos.listaDEPOSITOS;
                    var tablaDEPOSITOS = '<table border="1" id="tabla_depositos" width="100%" style="font-family:Arial; font-size:9px;border-collapse: collapse;">' +
                        '<thead>' +
                        '  <tr style="color:white; background-color:#4485A6; font-size:10px; height:25px;">' +
                        '<th>FECHA DEPOSITO</th>' +
                        '<th>TIPO</th>' +
                        '<th>N° VOUCHER</th>' +
                        '<th>BANCO</th>' +
                        '<th>CUENTA</th>' +
                        '<th>MONTO</th>' +
                        '  </tr>' +
                        '</thead><tbody>';
                    var totalDEP = 0;
                    for (var i = 0; i < listaDEPOSITOS.length; i++) {
                        tablaDEPOSITOS = tablaDEPOSITOS +
                            "<tr>" +
                            "<td>" + listaDEPOSITOS[i].fechaDep + "</td>" +
                            "<td>" + listaDEPOSITOS[i].tipoDeposito + "</td>" +
                            "<td>" + listaDEPOSITOS[i].nroVoucher + "</td>" +
                            "<td>" + listaDEPOSITOS[i].nombreReducido + "</td>" +
                            "<td>" + listaDEPOSITOS[i].nroCuenta + "</td>" +
                            "<td style='text-align: center;'>" + listaDEPOSITOS[i].montoSoles + "</td>" +
                            "</tr>";
                        totalDEP += listaDEPOSITOS[i].monto;
                    }
                    tablaDEPOSITOS = tablaDEPOSITOS +
                        "<tr>" +
                        "<td></td>" +
                        "<td></td>" +
                        "<td></td>" +
                        "<td></td>" +
                        '<td style="text-align: right;">TOTAL</td>' +
                        "<td style='text-align: center;'>S/." + number_format(totalDEP, 2, '.', ',') + "</td>" +
                        "</tr>";

                    tablaDEPOSITOS = tablaDEPOSITOS + "</tbody></table>";
                    variables.push({ 'nombreVariable': 'tablaDEPOSITOS', 'value': tablaDEPOSITOS });
                    variables.push({ 'nombreVariable': 'totalDeps', 'value': totalDEP });

                    var ruta_archivo = "./www/plantillas/reporte_depositoPN.html";
                    var fs = require('fs'); // requerida para leer archivos
                    fs.readFile(ruta_archivo, (err, data) => {
                        if (err) {
                            throw err;
                        } else {
                            var htmlResponse = "" + data + "";
                            //Reemplaza plantilla con valores para cada @variable@ definida
                            for (var i = 0; i < variables.length; i++) {
                                var regex = new RegExp('@' + variables[i].nombreVariable + '@', 'g');
                                if (variables[i].value == null) {
                                    variables[i].value = '';
                                }
                                htmlResponse = htmlResponse.replace(regex, variables[i].value);
                            }
                            var xid1 = htmlResponse.indexOf("Layer3");
                            var top1 = htmlResponse.indexOf("top", xid1);
                            var mleftHTML1 = htmlResponse.substring(0, top1 + 4);
                            var mrightHTML1 = htmlResponse.substring(top1 + 7);
                            var topCATS = 110 + (listaCATS.length) * 15;
                            htmlResponse = mleftHTML1 + topCATS.toString() + mrightHTML1

                            generatePDF(htmlResponse, "", res, "110px");
                        }
                    });
                })
        }
    )

}

function numerosAletras(n, custom_join_character) {

    var string = n.toString(),
        units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words;

    var and = custom_join_character || 'y';

    /* Is number zero? */
    if (parseInt(string) === 0) {
        return 'cero';
    }

    /* Array of units as words */
    units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidos', 'veintitres', 'veinticuatro', 'veinticinco', 'veintiseis', 'veintisiete', 'veintiocho', 'veintinueve'];

    /* Array of tens as words */
    tens = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];

    /* Array of scales as words */
    scales = ['', 'mil', 'millon', 'billon', 'trillon', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while (start > 0) {
        end = start;
        chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if (chunksLen > scales.length) {
        return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for (i = 0; i < chunksLen; i++) {

        chunk = parseInt(chunks[i]);

        if (chunk) {

            /* Split chunk into array of individual integers */
            ints = chunks[i].split('').reverse().map(parseFloat);
            debugger
            /* If tens integer is 1, i.e. 10, then add 10 to units integer */
            if (ints[1] === 1) {
                ints[0] += 10;
            }
            // para numeros de 20 a 29
            if (ints[1] === 2) {
                ints[0] += 20;
            }

            /* Add scale word if chunk is not zero and array item exists */
            if ((word = scales[i])) {
                words.push(word);
            }

            /* Add unit word if array item exists */
            if ((word = units[ints[0]])) {
                words.push(word);
            }

            /* Add tens word if array item exists */
            if ((word = tens[ints[1]])) {
                /* Add 'and' string after units or tens integer if: */
                if (ints[0] > 0 && ints[1]) {

                    // Chunk has a hundreds integer or chunk is the first of multiple chunks 
                    if (ints[2] || !i && chunksLen) {
                        words.push(and);
                    }

                }
                words.push(word);
            }

            /* Add hundreds word if array item exists */
            if ((word = units[ints[2]])) {
                words.push(word + ' cientos');
            }

        }

    }

    var numberString = words.reverse().join(' ');
    // corregir todos los cientos:
    if (numberString.endsWith("uno cientos")) {
        numberString = numberString.replace("uno cientos", "cien")
    }
    if (numberString.includes("uno cientos")) {
        numberString = numberString.replace("uno cientos", "ciento")
    }
    if (numberString.includes("dos cientos")) {
        numberString = numberString.replace("dos cientos", "doscientos")
    }
    if (numberString.includes("tres cientos")) {
        numberString = numberString.replace("tres cientos", "trescientos")
    }
    if (numberString.includes("cuatro cientos")) {
        numberString = numberString.replace("cuatro cientos", "cuatrocientos")
    }
    if (numberString.includes("cinco cientos")) {
        numberString = numberString.replace("cinco cientos", "quinientos")
    }
    if (numberString.includes("seis cientos")) {
        numberString = numberString.replace("seis cientos", "seiscientos")
    }
    if (numberString.includes("siete cientos")) {
        numberString = numberString.replace("siete cientos", "setecientos")
    }
    if (numberString.includes("ocho cientos")) {
        numberString = numberString.replace("ocho cientos", "ochocientos")
    }
    if (numberString.includes("nueve cientos")) {
        numberString = numberString.replace("nueve cientos", "novecientos")
    }
    // corregir MIL
    if (numberString.includes("uno mil")) {
        numberString = numberString.replace("uno mil", "mil")
    }

    return numberString
}
exports.imprimirOPA = function (req, res, funcionName) {
    var nroOrdenPago = req.query.nroOrden
    var queryDetalleOrden = "select opa.monto, opa.nroDiasInvalTemp as nroDias, i.UIT, i.sueldoMinVital, opa.porcInvalPerm as porcentaje, opa.nroOrdenPagoAgraviado, opa.plantillaCuerpoOrdenPago as plantillaCuerpo, (select cg.plantillaPieOPA from ConstantesGenerales cg limit 1) as plantillaPie, e.tipoExpediente, opa.codEvento, opa.codAgraviado, concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno) as nombreAgraviado, opa.idPersona as idPersonaAgraviado, if(opa.idPersona>0, concat(pb.nombres,' ',pb.apellidoPaterno,' ',pb.apellidoMaterno), concat(pa.nombres,' ',pa.apellidoPaterno,' ',pa.apellidoMaterno)) as nombreBeneficiario, " +
        "if(opa.idPersona>0, pb.nroDocumento, pa.nroDocumento) as dniBeneficiario, i.nroCAT, date_format(opa.fechaRegistro, '%d/%m/%Y') as fechaOrdenPago, date_format(i.fechaHoraAccidente, '%d/%m/%Y') as fechaAccidente, c.nroCAT, c.placa, if(paso.tipoPersona='J', paso.razonSocial, concat(paso.nombres,' ',paso.apellidoPaterno,' ',paso.apellidoMaterno)) as asociado,  " +
        " ta.descripcion as ocurrencia from OrdenPagoAgraviado opa " +
        "inner join Expediente e on opa.idExpediente = e.idExpediente " +
        "inner join Agraviado a on opa.codAgraviado = a.codAgraviado " +
        "inner join Persona pa on a.idPersona = pa.idPersona " +
        "left join Persona pb on opa.idPersona = pb.idPersona " +
        "inner join Informe i on opa.codEvento = i.codEvento " +
        "inner join Cat c on i.nroCAT = c.nroCAT " +
        "inner join Asociado aso on c.idAsociado = aso.idAsociado " +
        "inner join Persona paso on aso.idPersona = paso.idPersona " +
        "left join TipoAccidente ta on i.idTipoAccidente = ta.idTipoAccidente " +
        " where opa.nroOrdenPagoAgraviado = ?";

    var params = [nroOrdenPago]
    ejecutarQUERY_MYSQL(queryDetalleOrden, params, res, funcionName, function (res, results) {
        if (results.length > 0) {
            var dniBeneficiario = results[0].dniBeneficiario
            var nroOrdenPagoAgraviado = results[0].nroOrdenPagoAgraviado
            var tipoExpediente = results[0].tipoExpediente
            var codAgraviado = results[0].codAgraviado
            var nroCAT = results[0].nroCAT
            var asociado = results[0].asociado
            var ocurrencia = results[0].ocurrencia
            var fechaAccidente = results[0].fechaAccidente
            var nombreAgraviado = results[0].nombreAgraviado
            var nombreBeneficiario = results[0].nombreBeneficiario
            var placa = results[0].placa

            var pie = results[0].plantillaPie;
            var contenidoOP = results[0].plantillaCuerpo

            var $ancho = "780px";
            var heightCelda = "19px"
            var $fechaImpresion = results[0].fechaOrdenPago.split("/")/*convertirAfechaString(new Date(), false, false)
             $fechaImpresion = $fechaImpresion.split("/");*/
            var $mes = $fechaImpresion[1] - 1;
            var $dia = $fechaImpresion[0];
            var $año = $fechaImpresion[2];
            var $arrayMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            var $fechaImpresion = "Lima, " + $dia + " de " + $arrayMes[$mes] + " del " + $año;

            var detallesExpediente = {
                "1": {
                    subTitulo: "REEMBOLSO DE ATENCION MÉDICA",
                    detalle: "GASTOS MEDICOS",
                    subrayado: "PAGUESE A LA ORDEN",
                    inicioCuerpo: "Hemos recibido de <label style='font-weight:bold;'>AUTOSEGURO AFOCAT</label> por concepto de REEMBOLSO DE GASTOS MEDICOS la suma abajo detallada con relación al Siniestro N° @codAgraviado de fecha: @fechaAccidente",
                    textoMonto: "<label style='font-weight:bold;'>MONTO TOTAL A PAGAR =  S/. @monto SOLES</label>",
                    textoFinal: "Asimismo, Autoseguro Afocat queda subrogada en todos los derechos y acciones que pueden corresponder contra terceros responsables, en relación con los daños del presente reembolso por gastos médicos."
                },
                "2": {
                    subTitulo: "LIQUIDACION INDEMNIZATORIA POR MUERTE",
                    detalle: "MUERTE",
                    subrayado: "LIQUIDACION A FAVOR DE",
                    inicioCuerpo: "Hemos recibido de <label style='font-weight:bold;'>AUTOSEGURO AFOCAT</label> por concepto de indemnización única, total y definitiva la suma bajo detallada, con relación al Siniestro N° @codAgraviado de fecha: @fechaAccidente",
                    textoMonto: "<label style='font-weight:bold;'>PROCEDE LA INDEMNIZACION POR MUERTE POR LA CANTIDAD SEÑALADA:</label><br> S/. @monto SOLES",
                    textoFinal: "Asimismo, Autoseguro Afocat queda subrogado en todos los derechos y acciones que pueden corresponder contra terceros responsables, en relación con los daños de la presente indemnización. <br><br>De conformidad con lo establecido en el artículo 34 del reglamento nacional de responsabilidad civil y seguros obligatorios por accidentes de tránsito, yo @nombreBeneficiario, me declaro bajo juramento ( ) único beneficiario, ( )uno de los beneficiarios de quien en vida fue @nombreAgraviado, fallecido a consecuencia del accidente de tránsito de fecha @fechaAccidente, no existiendo beneficiario (s) con mayor derecho que el mío para el cobro de la presente indemnización, sometiéndome a las consecuencias penales y/o civiles de ser falso lo señalado"
                },
                "3": {
                    subTitulo: "REEEMBOLSO DE SERVICIOS FUNERARIOS",
                    detalle: "SEPELIO",
                    subrayado: "LIQUIDACION A FAVOR DE",
                    inicioCuerpo: "Hemos recibido de <label style='font-weight:bold;'>AUTOSEGURO AFOCAT</label> por concepto de REEMBOLSO POR SEPELIO,LA SUMA única, total y definitiva detallada, con relación al Siniestro N° @codAgraviado   de fecha: @fechaAccidente",
                    textoMonto: "<label style='font-weight:bold;'>PROCEDE EL PAGO POR CONCEPTO DE SEPELIO POR LA CANTIDAD SEÑALADA:</label><br> MONTO TOTAL: S/. @monto SOLES",
                    textoFinal: ""
                },
                "4": {
                    subTitulo: "LIQUIDACION INDEMNIZACION POR INCAPACIDAD TEMPORAL",
                    detalle: "INCAPACIDAD TEMPORAL",
                    subrayado: "PAGUESE A LA ORDEN",
                    inicioCuerpo: "Hemos recibido de <label style='font-weight:bold;'>AUTOSEGURO AFOCAT</label> por concepto de indemnización única, total y definitiva la suma baja detallada, de acuerdo al protocolo y estándares para la emisión del certificado de incapacidad temporal para el trabajo (CITT) y al (CIE-10), con relación al Siniestro N° @codAgraviado de fecha @fechaAccidente",
                    textoMonto: "<label style='font-weight:bold;'>PROCEDE LA INDEMNIZACION POR LA CANTIDAD SEÑALADA:</label><br> LA COBERTURA MAXIMA: 1 UIT = S/. @valorUIT SOLES (vigente al @fechaAccidente) <BR><BR><label style='font-weight:bold;'>LIQUIDACION POR:</label><BR>SUELDO MINIMO VITAL: S/. @sueldoMinimo / 30 DIAS = @resultado x @nroDias = S/. @monto SOLES",
                    textoFinal: "Asimismo, Autoseguro Afocat queda subrogada en todos los derechos y acciones que pueden corresponder contra terceros responsables, en relación con los daños de la presente indemnización."
                },
                "5": {
                    subTitulo: "LIQUIDACION INDEMNIZACION POR INVALIDEZ PERMANENTE",
                    detalle: "INVALIDEZ PERMANENTE",
                    subrayado: "LIQUIDACION A FAVOR DE",
                    inicioCuerpo: "Hemos recibido de <label style='font-weight:bold;'>AUTOSEGURO AFOCAT</label> por concepto de indemnización única, total y definitiva la suma abajo detallada, de acuerdo al DS N°024-2002-MTC, MANUAL DE EVALUACION Y CALIFICACION DEL GRADO DE INVALIDEZ (MECGI-SBS) y (Código Internacional de enfermedades - CIE-10) con relación al Siniestro N° @codAgraviado  de fecha: @fechaAccidente.",
                    textoMonto: "<label style='font-weight:bold;'>PROCEDE LA INDEMNIZACION POR INVALIDEZ PERMANENTE POR LA CANTIDAD SEÑALADA:</label><br>LIQUIDACION POR:= S/. @monto SOLES",
                    textoFinal: "Asimismo, Autoseguro Afocat queda subrogada en todos los derechos y acciones que pueden corresponder contra terceros responsables, en relación con los daños de la presente indemnización"
                }
            }

            var monto = results[0].monto
            var nroDias = results[0].nroDias
            var UIT = results[0].UIT
            var sueldoMinVital = results[0].sueldoMinVital

            var textoMonto = detallesExpediente[tipoExpediente].textoMonto
            textoMonto = textoMonto.replace("@monto", number_format(monto, 2, '.', ''))
            textoMonto = textoMonto.replace("@fechaAccidente", fechaAccidente)

            if (tipoExpediente == '4') {
                textoMonto = textoMonto.replace("@valorUIT", number_format(UIT, 2, '.', ''))
                textoMonto = textoMonto.replace("@sueldoMinimo", number_format(sueldoMinVital, 2, '.', ''))
                var proporcionSueldoMinimoVital = number_format((sueldoMinVital / 30).toFixed(2), 2, '.', '')
                textoMonto = textoMonto.replace("@resultado", proporcionSueldoMinimoVital)
                textoMonto = textoMonto.replace("@nroDias", nroDias)
            }
            var montoString = monto.toFixed(2).split(".")
            var montoEnteros = parseFloat(montoString[0])
            var montoDecimales = montoString[1]
            textoMonto = textoMonto + "<br><br><label style='font-weight:bold;'>SON: " + numerosAletras(montoEnteros).toUpperCase() + " CON " + montoDecimales + "/100 NUEVOS SOLES.</label>"

            var textoFinal = detallesExpediente[tipoExpediente].textoFinal
            textoFinal = textoFinal.replace("@nombreAgraviado", nombreAgraviado)
            textoFinal = textoFinal.replace("@nombreBeneficiario", nombreBeneficiario)
            textoFinal = textoFinal.replace("@fechaAccidente", fechaAccidente)

            var footer = "<div id ='footer' style='zoom: 85%; margin:auto; font-family:Arial; width:" + $ancho + "; text-align:justify; margin-top:5px;'>" +
                "<table style='width:880px; font-size:9px;'>" +
                "<col style='width:31%'>" +
                "<col style='width:2%'>" +
                "<col style='width:67%'>" +
                "<tr>" +
                "<td style='text-align:left;'><div>---------------------------------------------------------</div><div style='text-align:center;'>" + nombreBeneficiario + "</div><div style='text-align:center;'>Beneficiario</div><div style='text-align:center;'>DNI:" + dniBeneficiario + "</div></td>" +
                "<td></td>" +
                "<td style='text-align:left; font-size:9px; padding-bottom:21px;'>" + pie + "</td>" +
                "</tr>" +
                "</table>" +
                "</div>"
            var body = "<html>" +
                "<head>" +
                "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'>" +
                "</head>" +
                "<body style='padding-top:14px; zoom: 85%; '>" +
                //"<div style='float:left; width:260px; background-color:;'>" +
                //"<img src='https://sistema.autoseguro.pe/wpimages/logo_autoseguro.jpg' style='width:260px;'/>" +
                //"</div>" +
                "<div id ='cuerpo' style='margin:auto; font-family:Arial; width:" + $ancho + "; text-align:justify; margin-top:5px;'>" +
                "<div style='font-size:19px; font-weight:bold; text-align:left; margin-top:15px; width:100%;'>" +
                "<img src='http://sistema.autoseguro.pe/wpimages/logo_autoseguro.jpg' style='width:260px;text-align:left;' /><br><br>" +
                "</div>"+
                "<div style='font-size:19px; font-weight:bold; text-align:center; margin-top:15px;'>" +
                

                "ORDEN DE PAGO N° " + nroOrdenPagoAgraviado +
                "</div>" +
                "<div style='font-size:19px; font-weight:bold; text-align:center; margin-top:0px;'>" +
                detallesExpediente[tipoExpediente].subTitulo +
                "</div>" +
                "<div style='font-size:19px; font-weight:bold; text-align:center; margin-top:0px;'>" +
                "AUTOSEGURO AFOCAT" +
                "</div><br>" +
                "<div id='cabecera1' style='width:" + $ancho + "; font-size:14px; margin-top:0px;'>" +
                "<table style='width:" + $ancho + "; font-size:14px;'>" +
                "<col style='width:30%'>" +
                "<col style='width:3%'>" +
                "<col style='width:67%'>" +
                "<tr style='height:" + heightCelda + "; vertical-align:middle;'>" +
                "<td style='text-align:left; height:" + heightCelda + ";'>SINIESTRO N°</td>" +
                "<td>:</td>" +
                "<td>" + codAgraviado + "</td>" +
                "</tr>" +
                "<tr style='height:" + heightCelda + "; vertical-align:middle;'>" +
                "<td style='text-align:left; height:" + heightCelda + ";'>CONTRATANTE</td>" +
                "<td>:</td>" +
                "<td>" + asociado + "</td>" +
                "</tr>" +
                "<tr style='height:" + heightCelda + "; vertical-align:middle;'>" +
                "<td style='text-align:left; height:" + heightCelda + ";'>OCURRENCIA</td>" +
                "<td>:</td>" +
                "<td>" + ocurrencia + "</td>" +
                "</tr>" +
                "<tr style='height:" + heightCelda + "; vertical-align:middle;'>" +
                "<td style='text-align:left; height:" + heightCelda + ";'>FECHA DE SINIESTRO</td>" +
                "<td>:</td>" +
                "<td>" + fechaAccidente + "</td>" +
                "</tr>" +
                "<tr style='height:" + heightCelda + "; vertical-align:middle;'>" +
                "<td style='text-align:left; height:" + heightCelda + ";'>AGRAVIADO</td>" +
                "<td>:</td>" +
                "<td>" + nombreAgraviado + "</td>" +
                "</tr>" +
                "<tr style='height:" + heightCelda + "; vertical-align:middle;'>" +
                "<td style='text-align:left; height:" + heightCelda + ";'>BENEFICIARIO</td>" +
                "<td>:</td>" +
                "<td>" + nombreBeneficiario + "</td>" +
                "</tr>" +
                "<tr style='height:" + heightCelda + "; vertical-align:middle;'>" +
                "<td style='text-align:left; height:" + heightCelda + ";'>PLACA</td>" +
                "<td>:</td>" +
                "<td>" + placa + "</td>" +
                "</tr>" +
                "<tr style='height:" + heightCelda + "; vertical-align:middle;'>" +
                "<td style='text-align:left; height:" + heightCelda + ";'>DETALLE</td>" +
                "<td>:</td>" +
                "<td style='font-weight:bold;'>" + detallesExpediente[tipoExpediente].detalle + "</td>" +
                "</tr>" +
                "<tr style='height:" + heightCelda + "; vertical-align:middle; font-weight:bold;'>" +
                "<td style='text-align:left; height:" + heightCelda + ";'>" + detallesExpediente[tipoExpediente].subrayado + "</td>" +
                "<td>:</td>" +
                "<td>" + nombreBeneficiario + "</td>" +
                "</tr>" +
                "</table>" +
                "</div>" +
                "<hr style='font-weight:bold; color:black; margin-top:-3px;'>" +
                "<div style='font-size:14px; line-height: 1.5;'>" +
                "<br>" +
                getTextoInicialOPA(detallesExpediente[tipoExpediente].inicioCuerpo, codAgraviado, fechaAccidente) +
                "<br><br>" +
                textoMonto +
                "</div>" +
                "<br>" +
                "<div style='font-size:14px; line-height: 1.5;'>" +
                contenidoOP +
                "</div>" +
                "<br>" +
                "<div style='font-size:14px; line-height: 1.5;'>" +
                textoFinal +
                "</div>" +
                "<br>" +
                "<div id='fechaImpresion' style='font-size:14px; text-align:right;' >" +
                $fechaImpresion +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

            generatePDF(body, footer, res, "120px"); //"246px");

        } else {
            enviarResponse(res, ["Orden de pago no encontrada!"])
        }
    })
}