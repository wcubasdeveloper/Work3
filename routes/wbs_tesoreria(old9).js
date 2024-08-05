
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

exports.getLocales = function(req, res, funcionName){
    var idLocal = req.query.idLocal;
    var mWhere = "where ";
    if (idLocal>0) { mWhere += " idLocal=" + idLocal; }
    var query = "Select idLocal, Nombre as nombreLocal from Local " + mWhere +" estado='1' order by Nombre";
    var arrayParametros = [];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName);
}
exports.getEmpresasTransp=function(req, res, funcionName){
    var query = "Select c.idEmpresaTransp, c.nombreCorto, " +
        "concat(if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno))) as nombreEmpresa "+
    "from EmpresaTransp c "+
    "inner join Persona p on c.idPersona = p.idPersona "+
    "where registroEstado='0' order by nombreEmpresa asc ";
    //"Select idEmpresaTransp, nombreCorto from EmpresaTransp where registroEstado='0' order by nombreCorto";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
//Recupera todos los voucher por ventas a PJ (contratos)
exports.getListaVoucherPJ = function(req,res,funcionName){
    // Parametros GE
    var queryFechas = "", mQuery="", mQueryCount="";
    var idEmpresaTransp = parseInt(req.query.idEmpresaTransp);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta;
    if(fechaDesde!="" || fechaHasta!=""){
        var fechaHasta = req.query.fechaHasta+" 23:59:59";
        if(fechaDesde!="" && fechaHasta!=""){
            queryFechas+=" (d.fecha between '"+fechaDesde+"' and '"+fechaHasta+"' ) ";
        }else{
            if(fechaDesde!=""){
                queryFechas += " d.fecha>='"+fechaDesde+"'";
            }
            if(fechaHasta!=""){
                queryFechas += " d.fecha<='"+fechaHasta+"'";
            }
        }
    }

    if(idEmpresaTransp>0){ //buscar en tabla detalle : DepositoPJ_Contrato x idEmpresaTransp
        mQuery="select CASE d.estado  " +
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
        "where dc.idEmpresaTransp =" +idEmpresaTransp +" group by dc.idEmpresaTransp,dc.idDepositoPJ ";
        mQueryCount="select count(*) as cantidad "+
                    "from DepositoPJ_Contrato dc "+
                    "left join DepositoPJ d on d.idDepositoPJ= dc.idDepositoPJ "+
                    "where dc.idEmpresaTransp= "+idEmpresaTransp+" group by dc.idEmpresaTransp,dc.idDepositoPJ ";
        if (queryFechas != ""){
            mQuery += " and " + queryFechas;
            mQueryCount += " and " + queryFechas;
        }
    } else {  //buscar directamente en tabla cabecera: DepositoPJ
        mQuery="select   "+
            "CASE d.estado  "+
            "WHEN 'A' THEN 'ANUL' "+
            "WHEN 'B' THEN 'APROB' "+
            "ELSE 'PEND' "+
            "END as estado, "+
            "idDepositoPJ, date_format(d.fecha, '%d/%m/%Y') as fecha, "+
            "concat('S/. ',format( "+
            "    (SELECT SUM(dc3.total) AS tCuotas FROM DepositoPJ_Contrato dc3 where dc3.idDepositoPJ = d.idDepositoPJ) "+
            ",2)) as total, "+
            "(Select GROUP_CONCAT(e.nombreCorto SEPARATOR ', ') "+
            "FROM DepositoPJ_Contrato dc "+
            "left join EmpresaTransp e on e.idEmpresaTransp=dc.idEmpresaTransp "+
            "where dc.idDepositoPJ = d.idDepositoPJ) as nombreEmpresas, "+
            "   (Select GROUP_CONCAT(concat(lpad(cr.idContrato,6,0),'-',cr.nroCuota) SEPARATOR ', ') "+
            "FROM DepositoPJ_Contrato dc2 "+
            "left join Contrato_Renovacion cr on dc2.idContratoRenovacion=cr.idContratoRenovacion "+
            "where dc2.idDepositoPJ = d.idDepositoPJ) as idContratos "+
            "from DepositoPJ d "
        mQueryCount="select count(*) as cantidad from DepositoPJ d ";
        if (queryFechas != ""){
            mQuery += " where " + queryFechas;
            mQueryCount += " where " + queryFechas;
        }
    }
    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    mQuery = agregarLimit(page, registrosxpagina, mQuery);

    ejecutarQUERY_MYSQL(mQuery,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
            if(cantPaginas==0){
                ejecutarQUERY_MYSQL_Extra(resultados, mQueryCount, [], res, funcionName, function(res, rows, resultados){
                    var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            }else{
                res.send(resultados);
            }
        }else{
            res.send(resultados);
        }
    });

}

exports.getDetallesVoucherPJ = function(req,res,funcionName){
    var idDepositoPJ = req.query.idDepositoPJ;
    //1ro Datos de la cabecera en DepositoPJ
    var queryCabecera = "Select date_format(fecha, '%d/%m/%Y') as fechaDeposito, " +
        "total as totalDeposito, idUsuario, estado " +
        "from DepositoPJ where idDepositoPJ = ? ";
    var parametros = [idDepositoPJ];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function(res, resultados){
        console_log("(1)Cabecera_DepositosPJ="+resultados.length,2);
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
        query = "Select dc.idDetalle_DepositoPJ_Contr as idDetalle, cr.idContrato as idContrato, "+
            "dc.idContratoRenovacion as idContratoRenovacion, dc.total, concat('S/. ',format(dc.total,2)) as totalSoles, "+
            "date_format(ct.fechaVigenciaContr, '%d/%m/%Y') as fechaContr, "+
            "et.nombreCorto as nombreEmpresa, "+
            "dc.idEmpresaTransp as idEmpresaTransp, "+
            "ct.nCuotas  as nCuotas, "+
            "cr.nroCuota as nroCuota, "+
            "date_format(cr.fechaRenovacion, '%d/%m/%Y') as vigenciaCertIni, "+
            "date_format(DATE_ADD(cr.fechaRenovacion, INTERVAL 30 DAY), '%d/%m/%Y') as vigenciaCertFin "+
            "from DepositoPJ_Contrato dc "+
            "left join Contrato_Renovacion cr on dc.idContratoRenovacion = cr.idContratoRenovacion "+
            "left join Contrato ct on cr.idContrato = ct.idContrato "+
            "left join EmpresaTransp et on cr.idEmpresaTransp = et.idEmpresaTransp "+
            "where dc.idDepositoPJ=? ";
        //OCT/27 Debe incluir (Left Join) los registros de redondeo q no pertenecen a un contrato-cuota
        var parametros = [idDepositoPJ];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
            function(res2, results, resultados){
                console_log("(2)Detalle_LiquidacionesPN="+resultados.length,2);
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
                    "dp.tipo as tipoDeposito, dp.idCuenta as idCuentaBancaria, "+
                    "dp.nroVoucherBanco as nroVoucher, date_format(dp.fechaDeposito, '%d/%m/%Y') as fechaDep, " +
                    "dp.monto as monto,concat('S/. ',format(dp.monto,2)) as montoSoles, " +
                    "concat(c.nroCuenta,' / ',b.nombreReducido) as cuentaBanco " +
                    "from DepositoPJ_Detalle dp " +
                    "inner join CuentaBancaria c on dp.idCuenta = c.idCuentaBancaria " +
                    "inner join Banco b on c.idBanco = b.idBanco " +
                    "where dp.idDepositoPJ=?";
                var parametros = [req.query.idDepositoPJ];
                ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
                    function(res2, results, resultados){
                        console_log ("(3)Detalle_DepositosPN="+results.length,2);
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
exports.getContratoRenovacion = function(req, res, funcionName){
    var idContratoRenovacion = req.query.idContratoRenovacion;
    //1ro Datos de la cabecera en Contrato
    var queryCabecera = "Select date_format(cr.fechaRenovacion, '%d/%m/%Y') as InicioCATS, " +
        "date_format(DATE_ADD(cr.fechaRenovacion, INTERVAL 30 DAY), '%d/%m/%Y') as FinCATS, "+
        "cr.totalCuota, cr.flotaActual, cr.idEmpresaTransp, cr.nroCuota, cr.idContrato, " +
        "ct.nCuotas, date_format(ct.fechaVigenciaContr, '%d/%m/%Y') as InicioContr," +
        "concat(if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno))) as nombreEmpresa "+
        "from Contrato_Renovacion cr " +
        "inner join Contrato ct on cr.idContrato = ct.idContrato "+
        "inner join EmpresaTransp et on cr.idEmpresaTransp = et.idEmpresaTransp "+
        "inner join Persona p on et.idPersona = p.idPersona "+
        " where idContratoRenovacion = ? ";
    var parametros = [idContratoRenovacion];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function(res, resultados) {
        //datos desde Contrato_Renovacion + Contrato
        // idContrato, InicioContr, nCuotas, nroCuota, idEmpresaTransp, nombreEmpresa, InicioCATS, FinCATS,
        // flotaActual, totalCuota
        var midContrato=resultados[0].idContrato;
        var mnroCuota=resultados[0].nroCuota;

        //buscar datos relacionados >> Contrato_Certificados
         query = "Select idContratoCertificado as idDetalle," +
            "nroCertificado,v.placa,v.marca,v.modelo,v.anno,v.nroSerieMotor," +
            "cc.valorCuota as precio, " +
            "u.nombreUso, cl.nombreClase  " +
            "from Contrato_Certificados cc "+
            "inner join Vehiculo v on cc.idVehiculo = v.idVehiculo "+
            "inner join UsoClaseVehiculo ucv on v.idUsoClaseVehiculo = ucv.idUsoClaseVehiculo "+
            "inner join Uso_Vehiculo u on ucv.idUso = u.idUso "+
            "inner join Clase_Vehiculo cl on ucv.idClaseVehiculo = cl.idClase "+
            "where cc.idContrato=? and cc.nroCuota=? ";
        var parametros = [midContrato,mnroCuota];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
            function(res2, results, resultados){
                //[nroCertificado,placa,nombreClase,marca,modelo,anno,nroSerieMotor,precio]
                resultados[0].detalleContr = results;
                res2.send(resultados);
            })
    });
}
exports.guardarDepositoPJ = function(req, res, funcionName){
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
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
        var idDepositoPJ = resultados.insertId;
        console_log ("wbs_tesoreria: idDepositoPJ= "+idDepositoPJ,2);
        if(idDepositoPJ>0){ //Cabecera de Deposito creada => agregar detalles de depositos
            var lDetalle = req.body.detallesD;
            var i=0;
            for(i=0; i<lDetalle.length; i++){
                // Guarda la lista de depositos
                var queryInsertDetalle = "Insert " +
                    "into DepositoPJ_Detalle(idDepositoPJ, tipo, nroVoucherBanco, fechaDeposito, idCuenta, monto)" +
                    " values (?,?,?,?,?,?)";
                var parametrosDetalle = [idDepositoPJ, lDetalle[i].tipoDeposito,lDetalle[i].nroVoucher,
                    lDetalle[i].fechaDep,lDetalle[i].idCuentaBancaria,lDetalle[i].monto];
                //console_log ("wbs_tesoreria: Depositos: parametros ='"+parametrosDetalle,2);
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
            }
            lDetalle = req.body.detallesC;
            for(i=0; i<lDetalle.length; i++){
                // Guarda la lista de Liquidaciones incluidas en la transaccion
                var queryInsertDetalle = "Insert " +
                    "into DepositoPJ_Contrato(idDepositoPJ, idContratoRenovacion,idEmpresaTransp, total)" +
                    " values (?,?,?,?)";
                var parametrosDetalle = [idDepositoPJ, lDetalle[i].idContratoRenovacion,lDetalle[i].idEmpresaTransp, lDetalle[i].total];
                //console_log ("wbs_tesoreria: Contratos: parametros ='"+parametrosDetalle,2);
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
            }

            res.send([idDepositoPJ]);
        }
    });
}
exports.actualizaDepositoPJ = function(req, res, funcionName){
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
    var idDepositoPJ= req.body.idDepositoPJ;
    var fecha = req.body.fecha;
    var total = req.body.total;
    var idUsuario = req.body.idUsuario;
    var query = "update DepositoPJ set fecha=?, total=?, idUsuario=? where idDepositoPJ=?";
    var parametros = [fecha, total, idUsuario, idDepositoPJ];

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName,
        function(res, resultados){
            //2do actualizar o agregar registros de detalle de depositos
            var lDetalle = req.body.detallesD;
            var i=0;
            for(i=0; i<lDetalle.length; i++){
                if(lDetalle[i].estado!='O'){
                    if(lDetalle[i].estado=='U'){//actualizar registro
                        var queryDetalle = "Update DepositoPJ_Detalle " +
                            "set tipo=?, nroVoucherBanco=?, fechaDeposito=?, " +
                            "idCuenta=?, monto=? where idDetalle_DepositoPJ=? ";
                        var parametrosDetalle = [lDetalle[i].tipoDeposito,lDetalle[i].nroVoucher,
                            lDetalle[i].fechaDep,lDetalle[i].idCuentaBancaria,
                            lDetalle[i].monto,lDetalle[i].idDetalle];
                    }
                    if(lDetalle[i].estado=='N'){ //inserta nuevo registro
                        var queryDetalle = "Insert " +
                            "into DepositoPJ_Detalle(idDepositoPJ, tipo, nroVoucherBanco, " +
                            "fechaDeposito, idCuenta, monto) values (?,?,?,?,?,?)";
                        var parametrosDetalle = [idDepositoPJ, lDetalle[i].tipoDeposito,lDetalle[i].nroVoucher,
                            lDetalle[i].fechaDep,lDetalle[i].idCuentaBancaria,lDetalle[i].monto];
                    }
                    if(lDetalle[i].estado=='B'){
                        var queryDetalle = "Delete from DepositoPJ_Detalle where idDetalle_DepositoPJ = ?";
                        var parametrosDetalle = [lDetalle[i].idDetalle];
                    }
                    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
                }
            }
            lDetalle = req.body.detallesC;
            for(i=0; i<lDetalle.length; i++){
                if(lDetalle[i].estado!='O') {
                    if(lDetalle[i].estado=='U') {//actualizar registro
                        var queryDetalle = "Update DepositoPJ_Contrato " +
                            "set idDepositoPJ=?, idContratoRenovacion=?,idEmpresaTransp=?, total=? " +
                            "where idDetalle_DepositosPJ_Contr=? ";
                        var parametrosDetalle = [idDepositoPJ, lDetalle[i].idContratoRenovacion,lDetalle[i].idEmpresaTransp,
                            lDetalle[i].total,lDetalle[i].idDetalle];
                    }
                    if(lDetalle[i].estado=='N') {// Guarda la lista de renovaciones incluidas en la transaccion
                        var queryDetalle = "Insert " +
                            "into DepositoPJ_Contrato(idDepositoPJ, idContratoRenovacion, idEmpresaTransp,total)" +
                            " values (?,?,?,?)";
                        var parametrosDetalle = [idDepositoPJ, lDetalle[i].idContratoRenovacion, lDetalle[i].idEmpresaTransp,lDetalle[i].total];
                    }
                    if(lDetalle[i].estado=='B'){
                        var queryDetalle = "Delete from DepositoPJ_Contrato where idDetalle_DepositosPJ_Contr = ? ";
                        var parametrosDetalle = [lDetalle[i].idDetalle];
                    }
                    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
                }
            }

            res.send([idDepositoPJ]);

        });
}

exports.getRenovacionesxEmpresaTransp = function(req,res,funcionName){
    var idEmpresaTransp = req.query.idEmpresaTransp;

    var query="SELECT cr.idContratoRenovacion, cr.idContrato, cr.nroCuota, "+
        "concat(lpad(cr.idContrato,6,0),'-',cr.nroCuota) as contratoCuota, "+
        "date_format(c.fechaVigenciaContr, '%d/%m/%Y') as fechaVigenciaContr,c.nCuotas, "+
        "date_format(cr.fechaRenovacion, '%d/%m/%Y') as fechaRenovacion, "+
        "date_format(DATE_ADD(cr.fechaRenovacion, INTERVAL 30 DAY), '%d/%m/%Y') as fechaVigenciaFin, "+
        "flotaActual, totalCuota,concat('S/.',format(cr.totalCuota,2)) as totalCuotaSoles "+
        "from Contrato_Renovacion cr "+
        "inner join Contrato c on c.idContrato = cr.idContrato "+
        "where cr.idEmpresaTransp=? and idDepositoPJ=0";  //Renovacion que no ha sido depositada todavia
    var parametros = [idEmpresaTransp];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}

//getListaVoucherPN: recupera todos los Vouches de depositos x Ventas a Personas Naturales, para un determinado local
// o para todos si es un Administrador (idLocal=0)
exports.getListaVoucherPN = function(req, res, funcionName){
    // Parametros GE
    var queryWhere = "";
    var idLocal = parseInt(req.query.idLocal);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta+" 23:59:59";
    console_log ("Buscando idLocal: "+idLocal,2);
    if(idLocal>0){
        queryWhere+=" where d.idLocal="+idLocal;
     }
    if(fechaDesde!="" || fechaHasta!=""){
        if (queryWhere==""){
            queryWhere = " where ";
        } else{
            queryWhere+=" and "
        }
        if(fechaDesde!="" && fechaHasta!=""){
            queryWhere+=" (d.fecha between '"+fechaDesde+"' and '"+fechaHasta+"' ) ";
        }else{
            if(fechaDesde!=""){
                queryWhere += " d.fecha>='"+fechaDesde+"'";
            }
            if(fechaHasta!=""){
                queryWhere += " d.fecha<='"+fechaHasta+"'";
            }
        }
    }
    var query = "select " +
        "CASE d.estado "+
        "WHEN 'A' THEN 'ANUL' "+
        "WHEN 'B' THEN 'APROB' "+
        "ELSE 'PEND' "+
        "END as estado,"+
        "d.idDepositoPN as idDeposito, date_format(d.fecha, '%d/%m/%Y') as fecha, l.Nombre as nombreLocal, concat('S/. ',format(d.total,2)) as total "+
        "from DepositoPN d "+
        "left join Local l on d.idLocal = l.idLocal "+queryWhere+" order by d.fecha desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query,[], res, funcionName, function(res, resultados){
        if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="select count(*) as cantidad "+
                    "from DepositoPN d "+
                    "left join Local l on d.idLocal = l.idLocal "+queryWhere+" order by d.fecha desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function(res, rows, resultados){
                    var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            }else{
                res.send(resultados);
            }
        }else{
            res.send(resultados);
        }
    });
}
//Lista de Contratos que cumplan las condiciones
exports.getListaContratos = function(req, res, funcionName){
    var queryWhere = "";
    var idEmpresaTransp = parseInt(req.query.idEmpresaTransp);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta+" 23:59:59";
    if(idEmpresaTransp>0){
        queryWhere+=" where c.idEmpresaTransp="+idEmpresaTransp;
    }
    if(fechaDesde!="" || fechaHasta!=""){
        if (queryWhere==""){
            queryWhere = " where ";
        } else{
            queryWhere+=" and "
        }
        if(fechaDesde!="" && fechaHasta!=""){
            queryWhere+=" (c.fechaEmision between '"+fechaDesde+"' and '"+fechaHasta+"' ) ";
        }else{
            if(fechaDesde!=""){
                queryWhere += " c.fechaEmision>='"+fechaDesde+"'";
            }
            if(fechaHasta!=""){
                queryWhere += " c.fechaEmision<='"+fechaHasta+"'";
            }
        }
    }
    var query = "select " +
        "CASE c.estado "+
        "WHEN 'R' THEN '----' "+
        "WHEN 'I' THEN 'IMPR' "+
        "WHEN 'A' THEN 'ANUL' "+
        "WHEN 'T' THEN 'TERM' "+
        "ELSE '----' "+
        "END as estado,"+
		"c.estado as codEstado, "+
        "c.idContrato, date_format(c.fechaEmision, '%d/%m/%Y') as fechaEmision, " +
        "e.nombreCorto, c.nCuotas, c.flota, " +
        "date_format(c.fechaVigenciaContr, '%d/%m/%Y') as fechaIniVigencia, " +
        "date_format(DATE_ADD(c.fechaVigenciaContr, INTERVAL 1 YEAR), '%d/%m/%Y') as fechaFinVigencia " +
        "from Contrato c "+
        "inner join EmpresaTransp e on e.idEmpresaTransp = c.idEmpresaTransp "+queryWhere+" order by fechaEmision desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query,[], res, funcionName, function(res, resultados){
        //estado, idContrato, fechaEmision, nombreCorto, nCuotas, flota, fechaIniVigencia, fechaFinVigencia
        if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="select count(*) as cantidad "+
                    "from Contrato c "+queryWhere+" order by c.fechaEmision desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function(res, rows, resultados){
                    var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            }else{
                res.send(resultados);
            }
        }else{
            res.send(resultados);
        }
    });
}

exports.getDetallesVoucherPN = function(req, res, funcionName){
    var idDepositoPN = req.query.idDepositoPN;
    //1ro Datos de la cabecera en DepositoPN
    var queryCabecera = "Select date_format(fecha, '%d/%m/%Y') as fechaDeposito, " +
        "if(idLocal=0, '', idLocal) as idLocal, total as totalDeposito, idUsuario, " +
        "estado "+
        "from DepositoPN where idDepositoPN = ?";
    var parametros = [idDepositoPN];
    console_log("Buscando: "+idDepositoPN,2);
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function(res, resultados){
        console_log("(1)Cabecera_DepositosPN="+resultados.length,2);
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
            "lqc.idConcesionario as idConcesionario,"+
            "if( p.tipoPersona='J',p.RazonSocial,concat(p.nombres,', ',p.apellidoPaterno,' ',p.apellidoMaterno)) as nombreConcesionario "+
            "from DepositoPN_Detalle_Liquidaciones lq " +
            "inner join Liquidacion_ventas_cabecera lqc on lq.idLiquidacion_ventas_cabecera = lqc.idLiquidacion_ventas_cabecera " +
            "inner join Concesionario cn on lqc.idConcesionario = cn.idConcesionario " +
            "inner join Persona p on cn.idPersona = p.idPersona " +
            "where lq.idDepositoPN=?";
        var parametros = [idDepositoPN];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
            function(res2, results, resultados){
                console_log("(2)Detalle_LiquidacionesPN="+resultados.length,2);
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
                    "dp.tipo as tipoDeposito, dp.idCuenta as idCuentaBancaria, "+
                    "dp.nroVoucherBanco as nroVoucher, date_format(dp.fechaDeposito, '%d/%m/%Y') as fechaDep, " +
                    "dp.monto as monto,concat('S/. ',format(dp.monto,2)) as montoSoles, " +
                    "concat(c.nroCuenta,' / ',b.nombreReducido) as cuentaBanco " +
                    "from DepositoPN_Detalle dp " +
                    "inner join CuentaBancaria c on dp.idCuenta = c.idCuentaBancaria " +
                    "inner join Banco b on c.idBanco = b.idBanco " +
                    "where dp.idDepositoPN=?";
                var parametros = [req.query.idDepositoPN];
                ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName,
                    function(res2, results, resultados){
                        console_log ("(3)Detalle_DepositosPN="+results.length,2);
                        resultados[0].detalleDep = results;
                        //resultados: fechaDeposito, idLocal, totalDeposito, idUsuario,
                        //  [idDetalle, idLiquidacion, total, totalSoles, fechaLiq, nroPreImpreso,idConcesionario, nombreConcesionario]
                        //  [idDetalle, tipoDeposito, nroVoucher, fechaDep, monto, montoSoles,cuentaBanco]
                        res2.send(resultados);
                    })
            })
    });
}
exports.guardarDepositoPN = function(req, res, funcionName){
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
    var arrayParametros = [fecha,idLocal, total, idUsuario];
    ejecutarQUERY_MYSQL(query, arrayParametros, res, funcionName, function(res, resultados){
        var idDepositoPN = resultados.insertId;
        console_log ("wbs_tesoreria: idDepositoPN= "+idDepositoPN,2);
        if(idDepositoPN>0){ //Cabecera de Deposito creada => agregar detalles de depositos
            var lDetalle = req.body.detallesD;
            var i=0;
            for(i=0; i<lDetalle.length; i++){
                // Guarda la lista de depositos
                var queryInsertDetalle = "Insert " +
                    "into DepositoPN_Detalle(idDepositoPN, tipo, nroVoucherBanco, fechaDeposito, idCuenta, monto)" +
                    " values (?,?,?,?,?,?)";
                var parametrosDetalle = [idDepositoPN, lDetalle[i].tipoDeposito,lDetalle[i].nroVoucher,
                    lDetalle[i].fechaDep,lDetalle[i].idCuentaBancaria,lDetalle[i].monto];
                console_log ("wbs_tesoreria: Depositos: parametros ='"+parametrosDetalle,2);
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
            }
            lDetalle = req.body.detallesL;
            for(i=0; i<lDetalle.length; i++){
                // Guarda la lista de Liquidaciones incluidas en la transaccion
                var queryInsertDetalle = "Insert " +
                    "into DepositoPN_Detalle_Liquidaciones(idDepositoPN, idLiquidacion_ventas_cabecera, total)" +
                    " values (?,?,?)";
                var parametrosDetalle = [idDepositoPN, lDetalle[i].idLiquidacion, lDetalle[i].total];
                console_log ("wbs_tesoreria: Liquidaciones: parametros ='"+parametrosDetalle,2);
                ejecutarQUERY_MYSQL(queryInsertDetalle, parametrosDetalle, res, funcionName, "false");
            }

            res.send([idDepositoPN]);
        }
    });
}
exports.actualizaDepositoPN = function(req, res, funcionName){
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
    var idDepositoPN= req.body.idDepositoPN;
    var fecha = req.body.fecha;
    var idLocal = req.body.idLocal;
    var total = req.body.total;
    var idUsuario = req.body.idUsuario;
    var query = "update DepositoPN set fecha=?, idLocal=?, total=?, idUsuario=? where idDepositoPN=?";
    var parametros = [fecha, idLocal, total, idUsuario, idDepositoPN];

    ejecutarQUERY_MYSQL(query, parametros, res, funcionName,
        function(res, resultados){
        //2do actualizar o agregar registros de detalle de depositos
            var lDetalle = req.body.detallesD;
            var i=0;
            for(i=0; i<lDetalle.length; i++){
                if(lDetalle[i].estado!='O'){
                    if(lDetalle[i].estado=='U'){//actualizar registro
                        var queryDetalle = "Update DepositoPN_Detalle " +
                            "set tipo=?, nroVoucherBanco=?, fechaDeposito=?, " +
                            "idCuenta=?, monto=? where idDetalle_DepositoPN=? ";
                        var parametrosDetalle = [lDetalle[i].tipoDeposito,lDetalle[i].nroVoucher,
                            lDetalle[i].fechaDep,lDetalle[i].idCuentaBancaria,
                            lDetalle[i].monto,lDetalle[i].idDetalle];
                    }
                    if(lDetalle[i].estado=='N'){ //inserta nuevo registro
                        var queryDetalle = "Insert " +
                            "into DepositoPN_Detalle(idDepositoPN, tipo, nroVoucherBanco, " +
                            "fechaDeposito, idCuenta, monto) values (?,?,?,?,?,?)";
                        var parametrosDetalle = [idDepositoPN, lDetalle[i].tipoDeposito,lDetalle[i].nroVoucher,
                            lDetalle[i].fechaDep,lDetalle[i].idCuentaBancaria,lDetalle[i].monto];
                    }
                    if(lDetalle[i].estado=='B'){
                        var queryDetalle = "Delete from DepositoPN_Detalle where idDetalle_DepositoPN = ?";
                        var parametrosDetalle = [lDetalle[i].idDetalle];
                    }
                    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
                }
            }
            lDetalle = req.body.detallesL;
            for(i=0; i<lDetalle.length; i++){
                if(lDetalle[i].estado!='O') {
                    if(lDetalle[i].estado=='U') {//actualizar registro
                        var queryDetalle = "Update DepositoPN_Detalle_Liquidaciones " +
                            "set idDepositoPN=?, idLiquidacion_ventas_cabecera=?, total=? " +
                            "where idDetalle_DepositosPN_Liq=? ";
                        var parametrosDetalle = [idDepositoPN, lDetalle[i].idLiquidacion,
                            lDetalle[i].total,lDetalle[i].idDetalle];
                    }
                    if(lDetalle[i].estado=='N') {// Guarda la lista de Liquidaciones incluidas en la transaccion
                        var queryDetalle = "Insert " +
                            "into DepositoPN_Detalle_Liquidaciones(idDepositoPN, idLiquidacion_ventas_cabecera, total)" +
                            " values (?,?,?)";
                        var parametrosDetalle = [idDepositoPN, lDetalle[i].idLiquidacion, lDetalle[i].total];
                    }
                    if(lDetalle[i].estado=='B'){
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
exports.getLiquidacionesxConcesionario = function(req, res, funcionName){
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
        " ( select if(sum(ld.precio) is null,0,sum(ld.precio)) as total "+
        "   from Liquidacion_ventas_detalle ld "+
        "   where ld.idLiquidacion_ventas_cabecera = lc.idLiquidacion_ventas_cabecera)  as precioTotal,"+
        " ( select if(sum(ld.comision) is null,0,sum(ld.comision)) as total "+
        "   from Liquidacion_ventas_detalle ld "+
        "   where ld.idLiquidacion_ventas_cabecera = lc.idLiquidacion_ventas_cabecera)  as comisionTotal "+
        "from Liquidacion_ventas_cabecera lc " +
        "where registroEstado=0 and (idDepositoPN=0 or idDepositoPN is null) and idConcesionario = ? " +
        "order by idLiquidacion_ventas_cabecera ";
    var parametros = [idConcesionario];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName);
}
exports.getConcesionariosxLocal = function(req, res, funcionName){
    var idLocal = req.query.idLocal;
    var queryWhere = "";
    if(idLocal!="0"){queryWhere=" and c.idSede = '"+idLocal+"'"; }
    var query = "select * from " +
        "(Select c.idConcesionario, " +
        "concat(if(p.tipoPersona='J', p.razonSocial, concat(p.nombres,' ',p.apellidoPaterno,' ',p.apellidoMaterno)),' / ',l.Nombre) as nombreCompuesto " +
        "from Concesionario c " +
        "inner join Persona p on c.idPersona = p.idPersona " +
        "inner join Local l on c.idSede = l.idLocal " +
        "where l.estado='1' and c.estado='1' "+queryWhere+") as v order by v.nombreCompuesto asc";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}

exports.getCuentasBancarias = function(req, res, funcionName){
    var query = "select idCuentaBancaria, concat(nroCuenta,' / ',b.nombreReducido) as ctaBanco " +
        "from CuentaBancaria c "+
        "left join Banco b on c.idBanco = b.idBanco "+
        "where c.registroEstado='0' ";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}
exports.getDetallesLiquidacion = function(req, res, funcionName){
    var idLiquidacion = req.query.idLiquidacion;

    var queryCabecera = "Select date_format(fechaLiquidacion, '%d/%m/%Y') as fechaLiquidacion, if(idConcesionario=0, '', " +
        "idConcesionario) as idConcesionario, idUsuarioResp, idUsuario, nroLiquidacion " +
        "from Liquidacion_ventas_cabecera " +
        "where idLiquidacion_ventas_cabecera = ?";
    var parametros = [idLiquidacion];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function(res, resultados){
        // busca los detalles:
        query = "Select gd.idLiquidacion_ventas_detalle as idDetalle, gd.nroCertificado, gd.precio, gd.comision, " +
            "gd.claseVehiculo as idClaseVehiculo, c.nombreClase as claseVehiculo " +
            "from Liquidacion_ventas_detalle gd " +
            "inner join Clase_Vehiculo c on gd.claseVehiculo = c.idClase " +
            "where gd.idLiquidacion_ventas_cabecera=?";
        var parametros = [req.query.idLiquidacion];
        ejecutarQUERY_MYSQL_Extra(resultados, query, parametros, res, funcionName, function(res2, results, resultados){
            resultados[0].detalle = results;
            res.send(resultados);
        })
    });
}
exports.getPromotores = function(req, res, funcionName){
    var idLocal = req.query.idLocal;
    var queryWhere = "";
    if(idLocal!="0"){
        queryWhere=" where u.idLocal = '"+idLocal+"'";
    }
    var query = "Select p.idPromotor, u.idUsuario, concat(u.Nombres,' ',u.Apellidos) as nombreUsuario " +
        "from Promotor p " +
        "inner join UsuarioIntranet u on p.idUsuario = u.idUsuario "+queryWhere+
        " order by u.Nombres";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}

exports.actualizaEstadoDepositoPN= function(req, res, funcionName){
    var idDepositoPN= req.body.idDepositoPN;
    var mestado = req.body.estado;
    var queryDetalle = "Update DepositoPN " +
        "set estado=? " +
        "where idDepositoPN=? ";
    var parametrosDetalle = [mestado,idDepositoPN];
    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
    res.send([idDepositoPN]);
}

exports.actualizaEstadoDepositoPJ=function(req,res,funcionName){
    var idDepositoPJ= req.body.idDepositoPJ;
    var mestado = req.body.estado;
    var queryDetalle = "Update DepositoPJ " +
        "set estado=? " +
        "where idDepositoPJ=? ";
    var parametrosDetalle = [mestado,idDepositoPJ];
    ejecutarQUERY_MYSQL(queryDetalle, parametrosDetalle, res, funcionName, "false");
    res.send([idDepositoPJ]);
}
//RUTINAS >> VENTAS A EMPRESAS (CONTRATOS)
exports.getEmpresaTranspByNroDoc=function(req,res,funcionName){
    var NDocumento = req.query.nroDoc;
    var queryCabecera = "Select " +
        "idPersona, tipoPersona, nombres, apellidoPaterno, apellidoMaterno, razonSocial, nroDocumento, " +
        "calle, nro, mzLote, sector, referencia, telefonoFijo, telefonoMovil, email, idDistrito "+
        "from Persona " +
        "where nroDocumento = ?";
    var parametros = [NDocumento];
    ejecutarQUERY_MYSQL(queryCabecera, parametros, res, funcionName, function(res, resultados){
        if(resultados.length==0) {
            res.send(resultados); //envia resultado nulo
        }else {
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
exports.consultarConstGlobales=function(req, res, funcionName){
    var query = "Select * from ConstantesGenerales";
    ejecutarQUERY_MYSQL(query, [], res, funcionName);
}

//Recupera los certificados disponibles desde el concesionario asignado para Ventas Corporativas
exports.getCertificadosVtasCorp=function(req,res,funcionName){
    var idConcesionario = req.query.idConcesionario;
    var NFlota = parseInt( req.query.NFlota);
    var query = "Select nroCertificado as nCertificado from Certificado_movimiento " +
        "where tipOperacion='E' and idUbicacion = ? and ( idGuiaSalida = 0 or idGuiaSalida is null) " +
        "and registroEstado='0' order by nroCertificado limit ? ";

    var parametros = [idConcesionario,NFlota];
    ejecutarQUERY_MYSQL(query, parametros, res, funcionName);

}

//Lista de Contratos en estado IMPRESO para el modulo de Inclusion/exclusion
exports.getListaContratosImpresos = function(req, res, funcionName){
    var queryWhere = "where c.estado='I' ";
    var idEmpresaTransp = parseInt(req.query.idEmpresaTransp);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta+" 23:59:59";
    if(idEmpresaTransp>0){
        queryWhere+=" and c.idEmpresaTransp="+idEmpresaTransp;
    }
    if(fechaDesde!="" || fechaHasta!=""){       
        if(fechaDesde!="" && fechaHasta!=""){
            queryWhere+=" and (c.fechaEmision between '"+fechaDesde+"' and '"+fechaHasta+"' ) ";
        }else{
            if(fechaDesde!=""){
                queryWhere += " and c.fechaEmision>='"+fechaDesde+"'";
            }
            if(fechaHasta!=""){
                queryWhere += " and c.fechaEmision<='"+fechaHasta+"'";
            }
        }
    }
    var query = "select " +
        "c.idContrato, date_format(c.fechaEmision, '%d/%m/%Y') as fechaEmision, r.nroCuota as utlCuota, " +
        "e.nombreCorto, c.nCuotas, r.flotaActual as flota, " +
        "date_format(c.fechaVigenciaContr, '%d/%m/%Y') as fechaIniVigencia, " +
        "date_format(DATE_ADD(c.fechaVigenciaContr, INTERVAL 1 YEAR), '%d/%m/%Y') as fechaFinVigencia " +
        "from Contrato c "+
        "inner join EmpresaTransp e on e.idEmpresaTransp = c.idEmpresaTransp "+
        "inner join Contrato_Renovacion r on c.idContrato = r.idContrato "+queryWhere+
        "and r.idContratoRenovacion in (select max(cr.idContratoRenovacion) from Contrato_Renovacion cr group by cr.idContrato) "+
        "and r.estado='I' order by fechaEmision desc ";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query,[], res, funcionName, function(res, resultados){
        //estado, idContrato, fechaEmision, nombreCorto, nCuotas, flota, fechaIniVigencia, fechaFinVigencia
        if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="select count(*) as cantidad "+
                    "from Contrato c "+
                    "inner join Contrato_Renovacion r on c.idContrato = r.idContrato "+
                    "and r.idContratoRenovacion in (select max(cr.idContratoRenovacion) from Contrato_Renovacion cr group by cr.idContrato) "+
                    queryWhere+" and r.estado='I' order by c.fechaEmision desc";

                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function(res, rows, resultados){
                    var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            }else{
                res.send(resultados);
            }
        }else{
            res.send(resultados);
        }
    });
}
// CUS03: Lista de Contratos con su ultima cuota
exports.getListaContratosRenovacion = function(req, res, funcionName){
    var idEmpresaTransp = parseInt(req.query.idEmpresaTransp);
    var fechaDesde = req.query.fechaDesde;
    var fechaHasta = req.query.fechaHasta+" 23:59:59";
    var queryWhere=" where r.estado!='A' ";
    if(idEmpresaTransp>0){
        queryWhere+=" and c.idEmpresaTransp="+idEmpresaTransp;
    }
    if(fechaDesde!="" || fechaHasta!=""){
        if(fechaDesde!="" && fechaHasta!=""){
            queryWhere+=" and (r.fechaPagoCuota between '"+fechaDesde+"' and '"+fechaHasta+"' ) ";
        }else{
            if(fechaDesde!=""){
                queryWhere += " and r.fechaPagoCuota>='"+fechaDesde+"'";
            }
            if(fechaHasta!=""){
                queryWhere += " and r.fechaPagoCuota<='"+fechaHasta+"'";
            }
        }
    }
    var query = "select r.idContratoRenovacion, r.estado, " +
        "c.idContrato, r.nroCuota as ultCuota , date_format(c.fechaEmision, '%d/%m/%Y') as fechaEmision, date_format(r.fechaRenovacion, '%d/%m/%Y') as fechaRenovacion, " +
        "e.nombreCorto, r.flotaActual as flota, " +
        "date_format(c.fechaVigenciaContr, '%d/%m/%Y') as fechaIniVigencia, " +
        "date_format(DATE_ADD(c.fechaVigenciaContr, INTERVAL 1 YEAR), '%d/%m/%Y') as fechaFinVigencia, " +
        "date_format(r.fechaPagoCuota, '%d/%m/%Y') as fechaPagoCuota, e.nroResolucion, c.nCuotas as nroCuotas from Contrato c "+
        "inner join EmpresaTransp e on e.idEmpresaTransp = c.idEmpresaTransp "+
        "inner join Contrato_Renovacion r on c.idContrato = r.idContrato "+queryWhere+
        " and c.estado='I' and r.idContratoRenovacion in (select max(cr.idContratoRenovacion) from Contrato_Renovacion cr group by cr.idContrato) order by r.fechaRenovacion desc";

    //** Parametros de Paginacion ****
    var page = req.query.page;
    var cantPaginas = req.query.cantPaginas;
    var registrosxpagina = req.query.registrosxpagina;

    query = agregarLimit(page, registrosxpagina, query);

    ejecutarQUERY_MYSQL(query,[], res, funcionName, function(res, resultados){
        //estado, idContrato, fechaEmision, nombreCorto, nCuotas, flota, fechaIniVigencia, fechaFinVigencia
        if(resultados.length>0){
            if(cantPaginas==0){
                var queryCantidad="select count(*) as cantidad "+
                    "from Contrato c "+
                    "inner join Contrato_Renovacion r on c.idContrato = r.idContrato "+queryWhere+" group by r.idContrato order by r.fechaRenovacion desc";
                ejecutarQUERY_MYSQL_Extra(resultados, queryCantidad, [], res, funcionName, function(res, rows, resultados){
                    var cantidadPag = Math.ceil(rows[0].cantidad/registrosxpagina);
                    resultados[0].numeroPaginas = cantidadPag;
                    res.send(resultados);
                });
            }else{
                res.send(resultados);
            }
        }else{
            res.send(resultados);
        }
    });
}
exports.anularContrato = function(req, res, funcionName){
	var idContrato = req.query.idContrato;
	var query = "Update Contrato set estado = 'A' where idContrato = ?";
	var parametros = [idContrato]
	ejecutarQUERY_MYSQL(query, parametros, res, funcionName, "affectedRows")
}