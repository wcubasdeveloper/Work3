//Interface de Usuario para revision de voucher de depositos x Ventas a Personas Naturales y su respectiva Aprobacion
//o Anulacion
var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){	idLocal = parent.idLocal;}
var DAO = new DAOWebServiceGeT("wbs_tesoreria");
var accion = $_GET("accion");
var arrayDatosLiq = [], arrayDatosDep = [];
var idUsuario = parent.idUsuario;
var idDeposito = $_GET("idDepositoPN"); //ID de toda la transaccion (undefined en Modo Creacion)
var totalLIQ = 0.0, totalDEP = 0.0;
var contadorIdLiq = 0, contadorIdDep=0;
cargarInicio(function(){
    //llenar combo de locales de acuerdo al usuario (idLocal=0 => Administrador)
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getLocales", parametros, function(data){
		var campos = {"keyId":'idLocal', "keyValue":'nombreLocal'}
		agregarOpcionesToCombo("idCmbLocal", data, campos);
		$("#idCmbLocal").select2();
        aplicarDataTableL();
        aplicarDataTableD();
        $("#txtNroVoucher").val(LPAD(idDeposito,numeroLPAD)); //variables globales en mhbsoftScripts.js
        //Recupera todos los datos del Voucher (Tablas: DepositoPN, DepositoPN_detalle, DepositoPN_detalle_liq)
        var parametros = "&idDepositoPN=" + idDeposito;
        DAO.consultarWebServiceGet("getDetallesVoucherPN", parametros, function (datos) {
            //datos: fechaDeposito, idLocal, totalDeposito, idUsuario, estado,
            //  [idDetalle, idLiquidacion, total, totalSoles, fechaLiq, nroPreImpreso,idConcesionario, nombreConcesionario]
            //  [idDetalle, tipoDeposito, idCuentaBancaria, nroVoucher, fechaDep, monto, montoSoles,cuentaBanco]
            $("#FechaDeposito").val(datos[0].fechaDeposito);
            $("#idCmbLocal").val(datos[0].idLocal)
            $("#idCmbLocal").select2();
            $("#idCmbLocal").prop("disabled", true);
            //validar si es otro usuario el que revisa este Voucher
            var rptaDatos = datos[0].detalleLiq;
            var trFilaL="";
            for (var i = 0; i < rptaDatos.length; i++) {
                trFilaL = "<tr id='tr_" + rptaDatos[i].idDetalle +
                    "' style='font-family: Arial; height: 30px; cursor: pointer; font-size: 12px;' " +
                    "onclick='seleccionarFila(" + '"' + rptaDatos[i].idDetalle + '"' + ")'>" +
                    "<td style='text-align:left;'>" + rptaDatos[i].idLiquidacion + "</td>" +
                    "<td style='text-align:left;'>" + rptaDatos[i].fechaLiq + "</td>" +
                    "<td style='text-align:left;'>" + rptaDatos[i].nroPreImpreso + "</td>" +
                    "<td style='text-align:left;'>" + rptaDatos[i].nombreConcesionario + "</td>" +
                    "<td style='text-align:left;'>" + rptaDatos[i].totalSoles + "</td>" +
                    "</tr>";
                rptaDatos[i].estado='O';   // Nueva propiedad: estado del registro O=Original,N=Nuevo, U=Actualizado, B=Borrar
                arrayDatosLiq.push(rptaDatos[i]);
                $("#tabla_datosL > tbody").append(trFilaL);
                contadorIdLiq=rptaDatos[i].idDetalle;  //actualiza id de filas
            }

            actualizarTotalLIQ();
            rptaDatos = datos[0].detalleDep;
            var trFilaD="",tDeposito="";
            for (var i = 0; i < rptaDatos.length; i++) {
                tDeposito="DEP"
                if(rptaDatos[i].tipoDeposito !="D"){tDeposito="CHEQ";}
                trFilaD = "<tr id='tr1_" + rptaDatos[i].idDetalle +
                    "' style='font-family: Arial; height: 30px; cursor: pointer; font-size: 12px;' " +
                    "onclick='seleccionarFila1(" + '"' + rptaDatos[i].idDetalle + '"' + ")'>" +
                    "<td style='text-align:left;'>" + tDeposito + "</td>" +
                    "<td style='text-align:left;'>" + rptaDatos[i].nroVoucher + "</td>" +
                    "<td style='text-align:left;'>" + rptaDatos[i].cuentaBanco + "</td>" +
                    "<td style='text-align:left;'>" + rptaDatos[i].fechaDep + "</td>" +
                    "<td style='text-align:left;'>" + rptaDatos[i].montoSoles + "</td>" +
                    "</tr>";
                rptaDatos[i].estado='O';   // Nueva propiedad: estado del registro O=Original,N=Nuevo, U=Actualizado, B=Borrar
                arrayDatosDep.push(rptaDatos[i]);
                $("#tabla_datosD > tbody").append(trFilaD);
                contadorIdDep=rptaDatos[i].idDetalle;  //actualiza id de filas
            }
            actualizarTotalDEP();
            // *** NO permite modificaciones
            $(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
            $(":input").css("opacity", "0.65");
            $("#btnConfirmar").prop("disabled", false);
            $("#btnConfirmar").css("opacity", "1");
            $("#btnConfirmar").click(confirmaAccion);

        });
        $.fancybox.close();
	});
});

function aplicarDataTableL(){
	try{
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{campo:'idLiquidacion'      , alineacion:'left',LPAD:true},
			{campo:'fechaLiq'           , alineacion:'left'},
			{campo:'nroPreImpreso'      , alineacion:'left'},
			{campo:'nombreConcesionario', alineacion:'left'},
			{campo:'totalSoles'         , alineacion:'left'}
		];
		var columns=[
			{"width": "15%"},
			{"width": "15%"},
			{"width": "15%"},
			{"width": "40%"},
			{"width": "15%"}
		];
		crearFilasHTML("tabla_datosL", arrayDatosLiq, camposAmostrar, true, 12); // crea la tabla HTML
		parseDataTable("tabla_datosL", columns, 134, false, false, false, false,
            function(){
                if($("#tabla_datosL > tbody >tr").length==1 && $("#tabla_datosL > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                    $("#tabla_datosL > tbody").html("");
                }
		    });
		$.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "aplicarDataTableL");
	}
}
function aplicarDataTableD(){
    try{
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'tipoDeposito', alineacion:'left'},
            {campo:'nroVoucher'  , alineacion:'left'},
            {campo:'cuentaBanco' , alineacion:'left'},
            {campo:'fechaDep'    , alineacion:'left'},
            {campo:'montoSoles'  , alineacion:'left'}
        ];
        var columns=[
            {"width" : "10%"},
            {"width" : "15%"},
            {"width" : "45%"},
            {"width" : "15%"},
            {"width" : "15%"}
        ];
        crearFilasHTML1("tabla_datosD", arrayDatosDep, camposAmostrar, true, 12); // crea la tabla HTML alterna "1"
        parseDataTable1("tabla_datosD", columns, 134, false, false, false, false, function(){
            if($("#tabla_datosD > tbody >tr").length==1 && $("#tabla_datosD > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_datosD > tbody").html("");
            }
        });
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "aplicarDataTableD");
    }
}
function cleanDate(idInput){ // Limpia los campos Fecha. idInput = id del campo de texto
    try{
        $("#"+idInput).val("");
    }catch(err){
        emitirErrorCatch(err, "cleanDate()")
    }
}
function actualizarTotalLIQ(){
    try{
        totalLIQ = 0;
        for(var i=0; i<arrayDatosLiq.length; i++){
            if (arrayDatosLiq[i].estado!='B') {
                totalLIQ += parseFloat(arrayDatosLiq[i].total);
            }
        }
        $("#txtTotalLiquidacion").val(formatDec(totalLIQ,"S/.",2));
        //$("#txtTotalLiquidacion").val("S/. "+totalLIQ);
    }catch(err){
        emitirErrorCatch(err, "actualizarTotalLIQ");
    }
}
function actualizarTotalDEP(){
    try{
        totalDEP = 0;
        for(var i=0; i<arrayDatosDep.length; i++){
            if (arrayDatosDep[i].estado!='B') {
                totalDEP += parseFloat(arrayDatosDep[i].monto);
            }
        }
        $("#txtTotalDeposito").val(formatDec(totalDEP,"S/.",2));
    }catch(err){
        emitirErrorCatch(err, "actualizarTotalDEP");
    }
}

// La funcion confirmaAccion solo marca la transaccion como Aprobada (estado="B")
// o Anulada (estado="A")
function confirmaAccion(){
    try{
        var msjConfirm=(accion=='A')?'¿ Anula la Transacción ?':'¿ Aprueba la Transacción ?';
        fancyConfirm(msjConfirm, function(rpta){
            if (rpta){
                var parametrosPOST = {idDepositoPN:idDeposito,estado:accion};
                DAO.consultarWebServicePOST(parametrosPOST, "actualizaEstadoDepositoPN",
                    function(data){
                        if(data[0]>0){
                            fancyAlertFunction("Voucher de Depositos actualizado correctamente"+
                                            " (ID = "+data[0]+")",
                                function(){
                                    realizoTarea=true;
                                    parent.$.fancybox.close();
                                })
                        }
                    });
            }
        });

    }catch(err){
        emitirErrorCatch(err, "actualizaVoucherPN")
    }
}
