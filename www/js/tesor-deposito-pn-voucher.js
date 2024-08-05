//Interface de Usuario para creacion y revision de voucher de depositos x Ventas a Personas Naturales
var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){	idLocal = parent.idLocal;}
var DAO = new DAOWebServiceGeT("wbs_tesoreria");
var accion = $_GET("accion");
var arrayDatosLiq = [], arrayDatosDep = [];
var idUsuario = parent.idUsuario;
var idDeposito = $_GET("idDepositoPN"); //ID de toda la transaccion (undefined en Modo Creacion)
var mestado = ""; //estado general del Voucher
var totalLIQ = 0.0, totalDEP = 0.0;
var contadorIdLiq = 0, contadorIdDep=0;
var realizoCambio=false;
cargarInicio(function(){
	$("#FechaDeposito").attr("requerido", "Fecha de Deposito");
	$("#FechaDeposito").datetimepicker({lan:'es', format:'d/m/Y',timepicker:false, closeOnDateSelect:true});
	$("#FechaDeposito").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto

    $("#idCmbLocal").attr("requerido", "Local/Cono");
    //llenar combo de locales de acuerdo al usuario (idLocal=0 => Administrador)
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getLocales", parametros, function(data){
		var campos = {"keyId":'idLocal', "keyValue":'nombreLocal'}
		agregarOpcionesToCombo("idCmbLocal", data, campos);
        $("#idCmbLocal").change(cambioInformacion);
		$("#idCmbLocal").select2();

        $("#btnGuardar").click(guardarVoucher);
        $("#btnDetalleLiq").click(muestraLiq);
        $("#btnAgregaLiq").click(nuevaLiq);
        $("#btnEditarLiq").click(editarLiq);
        $("#btnEliminarLiq").click(eliminarLiq);
        $("#btnAgregaDep").click(nuevoDep);
        $("#btnEditarDep").click(editarDep);
        $("#btnEliminarDep").click(eliminarDep);
        $("#btnImprime").click(imprimeVoucher);

        aplicarDataTableL();
        aplicarDataTableD();
        if (accion != 'N') { // VISTA > Edicion
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
                $("#idCmbLocal").prop("disabled", true); //NO puede cambiar de Local, sino debe Anular
                mestado = datos[0].estado; //A=anulado, B=Aprobado, P=Pendiente
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
                if (mestado!='P'){
                    $("#txtEstado").val(mestado=='A'?"ANULADO":"APROBADO");
                // *** si esta Aprobado o Anulado no permite modificaciones
                    $(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
                    $(":input").css("opacity", "0.65");
                    $("#btnGuardar").css("display", "none");
                    $("#btnDetalleLiq").css("display", "none");
                    $("#btnAgregaLiq").css("display", "none");
                    $("#btnEditarLiq").css("display", "none");
                    $("#btnEliminarLiq").css("display", "none");
                    $("#btnAgregaDep").css("display", "none");
                    $("#btnEditarDep").css("display", "none");
                    $("#btnEliminarDep").css("display", "none");
                    //siempre se requiere poder Imprimir
                    $("#btnImprime").prop("disabled",false); //habilita boton de Impresion
                    $("#btnImprime").css("opacity", "1")

                }else{
                    $("#txtEstado").css("display", "none");
                }
            });
        } else {
            //Nuevo Voucher
            $("#txtEstado").css("display","none");
            $("#btnImprime").prop("disabled", true); //deshabilita boton de Impresion >>> solo en Edicion
            $("#btnImprime").css("opacity", "0.5")
        }
        parent.$(".fancybox-close").unbind("click");
        parent.$(".fancybox-close").click(avisarCambiosEfectuados);
        $.fancybox.close();
	});
});
function cambioInformacion(){
    realizoCambio = true;
}
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

function muestraLiq(){
    try{
        if(filaSeleccionada!=undefined){
            var midLocal = $("#idCmbLocal").val();
            for(var i=0; i<arrayDatosLiq.length; i++){
                if(arrayDatosLiq[i].idDetalle == filaSeleccionada){
                    var midLiquidacion=arrayDatosLiq[i].idLiquidacion;
                    break;
                }
            }
            var url_comando="tesor-depositopn-liquidacion?idLocal="+midLocal+"&idLiquidacion="+midLiquidacion;
            abrirVentanaFancyBox(1000, 480, url_comando, true);
        }else{
            fancyAlert("¡Debe seleccionar una liquidacion de Ventas!");
        }
    }catch(err){
        emitirErrorCatch(err, "muestraLiq")
    }
}
//Funciones CRUD para la lista de liquidaciones de ventas
function nuevaLiq(){
	try{
		contadorIdLiq++;
		var idLocal = $("#idCmbLocal").val();
		if(idLocal!=""){
            var url_comando="tesor-depositopn-editar-liquidacion?accion=N&idDetalle="+contadorIdLiq+"&idLocal="+idLocal;
			abrirVentanaFancyBox(700, 350, url_comando, true,
                function(rptaDatos){
                    /*
                     idDetalle : idDetalle,
                     idLiquidacion : $("#cmbLiquidaciones").val(),
                     fechaLiq:$("#txtFechaLiq").val(),
                     nroPreImpreso:$("#txtNroPreImpreso").val(),
                     nombreConcesionario:$("#cmbConcesionarios").val(),
                     total:totalLiq,
                     totalSoles:"S/. "+totalLiq,
                     estado:"N"
                     */
                    // agrega el detalle en la grilla:
                    var trFila = "<tr id='tr_"+rptaDatos[0].idDetalle+"'" +
                        " style='font-family: Arial; height: 30px; cursor: pointer; font-size: 12px;' " +
                        " onclick='seleccionarFila("+'"'+rptaDatos[0].idDetalle+'"'+")'>"+
                        "<td style='text-align:left;'>"+rptaDatos[0].idLiquidacion+"</td>"+
                        "<td style='text-align:left;'>"+rptaDatos[0].fechaLiq+"</td>"+
                        "<td style='text-align:left;'>"+rptaDatos[0].nroPreImpreso+"</td>"+
                        "<td style='text-align:left;'>"+rptaDatos[0].nombreConcesionario+"</td>"+
                        "<td style='text-align:left;'>"+rptaDatos[0].totalSoles+"</td>"+
                    "</tr>";
                    arrayDatosLiq.push(rptaDatos[0]); //guarda registro completo
                    $("#tabla_datosL > tbody").append(trFila);
                    $("#idCmbLocal").prop("disabled", true); //ya no puede cambiar hasta que salga
                    actualizarTotalLIQ();
                    realizoCambio=true;
			    });
		}else{
			fancyAlertFunction("¡Debe seleccionar un Local/Cono!", function(){
				$("#idCmbLocal").select2("open");
			})
		}
	}catch(err){
		emitirErrorCatch(err, "nuevaLiq")
	}
}
function eliminarLiq(){
	try{
		if(filaSeleccionada!=undefined){
			// elimina el registro de detalle en el array:
			for(var i=0; i<arrayDatosLiq.length; i++){
				if(arrayDatosLiq[i].idDetalle==filaSeleccionada){
                    arrayDatosLiq[i].estado = 'B'; //sera borrado en webservice, modo Edicion
					//arrayDatosLiq.splice(i,1); //remover item del array
					$("#tr_"+filaSeleccionada).remove(); //remover elemento de DOM
					break;
				}
			}
            //si no hay mas liquidaciones podria cambiar de local
			if($("#tabla_datosL > tbody >tr").length == 0){
				$("#idCmbLocal").prop("disabled", false);
			}
			actualizarTotalLIQ();
            realizoCambio=true;
        }else{
			fancyAlert("¡Debe seleccionar una Liquidacion de Ventas!");
		}		
	}catch(err){
		emitirErrorCatch(err, "eliminarLiq")
	}
}
function editarLiq(){
    try{
        if(filaSeleccionada!=undefined){
            var idDetalle = filaSeleccionada;
            var idLocal = $("#idCmbLocal").val();
            var url_comando="tesor-depositopn-editar-liquidacion?accion=E&idDetalle="+idDetalle+"&idLocal="+idLocal;
            abrirVentanaFancyBox(700, 350, url_comando, true, function(rptaDatos){
                var idDetalle = rptaDatos[0].idDetalle;
                $("#tr_" + idDetalle).find("td").eq(0).html(rptaDatos[0].idLiquidacion);
                $("#tr_" + idDetalle).find("td").eq(1).html(rptaDatos[0].fechaLiq);
                $("#tr_" + idDetalle).find("td").eq(2).html(rptaDatos[0].nroPreImpreso);
                $("#tr_" + idDetalle).find("td").eq(3).html(rptaDatos[0].nombreConcesionario);
                $("#tr_" + idDetalle).find("td").eq(4).html(rptaDatos[0].totalSoles);

                for (var i = 0; i < arrayDatosLiq.length; i++) {
                    if (arrayDatosLiq[i].idDetalle == idDetalle) {
                        arrayDatosLiq[i].idLiquidacion = rptaDatos[0].idLiquidacion;
                        arrayDatosLiq[i].fechaLiq = rptaDatos[0].fechaLiq;
                        arrayDatosLiq[i].nroPreImpreso = rptaDatos[0].nroPreImpreso;
                        arrayDatosLiq[i].nombreConcesionario = rptaDatos[0].nombreConcesionario;
                        arrayDatosLiq[i].total = rptaDatos[0].total;
                        arrayDatosLiq[i].totalSoles = rptaDatos[0].totalSoles;
                        arrayDatosLiq[i].estado = rptaDatos[0].estado;
                        break;
                    }
                }
                actualizarTotalLIQ();
                realizoCambio = true;
            });
        }else{
            fancyAlert("¡Debe seleccionar una liquidacion de Ventas!");
        }
    }catch(err){
        emitirErrorCatch(err, "editarLiq")
    }
}
//Funciones CRUD para la lista de depositos en Banco
function nuevoDep(){
    try{
        contadorIdDep++;
        var idLocal = $("#idCmbLocal").val();
        if(idLocal!=""){
            var url_comando="tesor-depositopn-editar-depositobco?accion=N&idDetalle="+contadorIdDep;
            abrirVentanaFancyBox(600, 320, url_comando, true, function(rptaDatos){
                // agrega el detalle en la grilla:
                /*
                 idDetalle : idDetalle,
                 tipoDeposito : $("#cmbTipoDeposito").val(),
                 idCuentaBancaria : $("#cmbCuentaBancaria").val(),
                 cuentaBanco : $("#cmbCuentaBancaria :selected").text(),
                 fechaDep:$("#txtFecha").val(),
                 nroVoucher:$("#txtNroVoucherBanco").val(),
                 monto:$("#txtMonto").val()
                 estado: U/N
                 */
                var tDeposito="DEP"
                if(rptaDatos[0].tipoDeposito !="D"){tDeposito="CHEQ";}
                var trFila = "<tr id='tr1_"+rptaDatos[0].idDetalle+"'" +
                    " style='font-family: Arial; height: 30px; cursor: pointer; font-size: 12px;' " +
                    " onclick='seleccionarFila1("+'"'+rptaDatos[0].idDetalle+'"'+")'>"+
                    "<td style='text-align:center;'>"+tDeposito + "</td>"+
                    "<td style='text-align:center;'>"+rptaDatos[0].nroVoucher + "</td>"+
                    "<td style='text-align:center;'>"+rptaDatos[0].cuentaBanco + "</td>"+
                    "<td style='text-align:center;'>"+rptaDatos[0].fechaDep+"</td>"+
                    "<td style='text-align:center;'>"+rptaDatos[0].montoSoles+"</td>"+
                    "</tr>";
                arrayDatosDep.push(rptaDatos[0]);
                $("#tabla_datosD > tbody").append(trFila);
                $("#idCmbLocal").prop("disabled", true);
                actualizarTotalDEP();
                realizoCambio=true;
            });
        }else{
            fancyAlertFunction("¡ Debe seleccionar un Local/Cono !", function(){
                $("#idCmbLocal").select2("open");
            })
        }
    }catch(err){
        emitirErrorCatch(err, "nuevoDEP")
    }
}
function eliminarDep(){
    try{
        if(filaSeleccionada1!=undefined){  //usa filaSeleccionada1 >> dataTable alterno
            // elimina el registro de detalle en el array:
            for(var i=0; i<arrayDatosDep.length; i++){
                if(arrayDatosDep[i].idDetalle==filaSeleccionada1){
                    arrayDatosDep[i].estado='B'; //marcado para ser borrado (modo Edicion)
                    //arrayDatosDep.splice(i,1); //remover item del array
                    $("#tr1_"+filaSeleccionada1).remove(); //remover elemento de DOM
                    break;
                }
            }
            actualizarTotalDEP();
            realizoCambio=true;
        }else{
            fancyAlert("¡Debe seleccionar un deposito bancario!");
        }
    }catch(err){
        emitirErrorCatch(err, "eliminarDep")
    }
}
function editarDep(){
    try{
        if(filaSeleccionada1!=undefined){   //usa filaSeleccionada1 >> dataTable alterno
            var idDetalle = filaSeleccionada1;
            var url_comando="tesor-depositopn-editar-depositobco?accion=E&idDetalle="+idDetalle;
            abrirVentanaFancyBox(600, 320, url_comando, true, function(rptaDatos){
                var idDetalle = rptaDatos[0].idDetalle;
                var tDeposito="DEP"
                if(rptaDatos[0].tipoDeposito !="D"){tDeposito="CHEQ";}
                $("#tr1_"+idDetalle).find("td").eq(0).html(tDeposito);
                $("#tr1_"+idDetalle).find("td").eq(1).html(rptaDatos[0].nroVoucher);
                $("#tr1_"+idDetalle).find("td").eq(2).html(rptaDatos[0].cuentaBanco);
                $("#tr1_"+idDetalle).find("td").eq(3).html(rptaDatos[0].fechaDep);
                $("#tr1_"+idDetalle).find("td").eq(4).html(rptaDatos[0].montoSoles);

                for(var i=0; i<arrayDatosDep.length; i++){
                    if(arrayDatosDep[i].idDetalle == idDetalle){
                        arrayDatosDep[i].tipoDeposito = rptaDatos[0].tipoDeposito;
                        arrayDatosDep[i].nroVoucher = rptaDatos[0].nroVoucher;
                        arrayDatosDep[i].cuentaBanco = rptaDatos[0].cuentaBanco;
                        arrayDatosDep[i].fechaDep = rptaDatos[0].fechaDep;
                        arrayDatosDep[i].montoSoles = rptaDatos[0].montoSoles;
                        arrayDatosDep[i].monto = rptaDatos[0].monto;
                        arrayDatosDep[i].idCuentaBancaria = rptaDatos[0].idCuentaBancaria;
                        arrayDatosDep[i].estado = rptaDatos[0].estado;
                        break;
                    }
                }
                actualizarTotalDEP();
                realizoCambio=true;
            });
        }else{
            fancyAlert("¡Debe seleccionar un deposito bancario!");
        }
    }catch(err){
        emitirErrorCatch(err, "editarDep")
    }
}

// La funcion anularVoucher solo marca la transaccion (estado="B") y mantiene todos los datos

function guardarVoucher(){
/*  guarda el voucher completo,
    si esta en modo NUEVO => inserta todos los registros
    si esta en modo EDICION => actualizar la cabecera +
    actualizar filas marcadas en 'U'
    agregar filas marcadas en 'N'
*/
    try{
        var msjConfirm=(accion=='N')?'¿ Almacena la Transacción ?':'¿ Actualiza la Transacción ?';
        if (realizoCambio){
            if(validarCamposRequeridos("idPanel")){ //panel superior de interfase de usuario
                if($("#tabla_datosL > tbody >tr").length>0 && $("#tabla_datosD > tbody >tr").length>0){
                    if(totalLIQ == totalDEP ){
                        fancyConfirm(msjConfirm,
                            function(rpta){
                                if(rpta){
                                    var parametrosPOST = {};
                                    for (var i = 0; i < arrayDatosDep.length; i++) {
                                    //cambia formatos de fecha para los depositos
                                        arrayDatosDep[i].fechaDep =dateTimeFormat( arrayDatosDep[i].fechaDep);
                                    }
                                    var mfunctionName='guardarDepositoPN';
                                    var msjFancy="Depositos ingresados correctamente"
                                    if (accion=='N') { //NUEVO Voucher
                                        for (var i = 0; i < arrayDatosLiq.length; i++) {
                                            if (arrayDatosLiq[i].estado == "B") {
                                                arrayDatosLiq.splice(i, 1); //remover item del array
                                            }
                                        }
                                        for (var i = 0; i < arrayDatosDep.length; i++) {
                                            if (arrayDatosDep[i].estado == "B") {
                                                arrayDatosDep.splice(i, 1); //remover item del array
                                            }
                                        }
                                    }else{ //Edicion
                                        parametrosPOST.idDepositoPN=idDeposito; //agrega propiedad
                                        mfunctionName='actualizaDepositoPN'
                                        msjFancy="Depositos actualizados correctamente"
                                    }
                                    //Agrega resto de propiedades a usar x webservice
                                     parametrosPOST.fecha = dateTimeFormat($("#FechaDeposito").val());
                                     parametrosPOST.idLocal= $("#idCmbLocal").val();
                                     parametrosPOST.total= totalLIQ;
                                     parametrosPOST.idUsuario= idUsuario;
                                     parametrosPOST.detallesL= arrayDatosLiq;
                                     parametrosPOST.detallesD= arrayDatosDep;
                                    DAO.consultarWebServicePOST(parametrosPOST, mfunctionName,
                                        function(data){
                                            if(data[0]>0){
                                                fancyConfirm(msjFancy+". <BR> Imprime Transaccion? (ID = "+data[0]+")",
                                                    function(rpta) {
                                                        if (rpta) {
                                                            //Imprime documento
                                                            idDeposito=data[0]
                                                            imprimeVoucher()
                                                        }
                                                        realizoTarea=true;
                                                        parent.$.fancybox.close();

                                                    }
                                                )
 //                                               fancyAlertFunction(msjFancy+" (ID = "+data[0]+")",
 //                                                 function(){
 //                                                       realizoTarea=true;
 //                                                       parent.$.fancybox.close();
 //                                                   })
                                            }
                                        });
                                }
                            }
                        );
                    }else{
                        fancyAlert("¡El total de Liquidaciones debe ser igual a los Depositos!")
                    }
                }else{
                    fancyAlert("¡Debe ingresar al menos una liquidacion y un deposito!")
                }
            }
        }
    }catch(err){
        emitirErrorCatch(err, "guardarVoucher")
    }
}
function avisarCambiosEfectuados(){
    try{
         if(realizoCambio){
            fancyConfirm("¿Desea salir sin guardar los cambios?", function(rpta){
                if(rpta){
                    parent.$.fancybox.close(); // cierra la ventana
                }
            })
        }else{
            parent.$.fancybox.close();
        }
    }catch(err){
        emitirErrorCatch(err, "avisarCambiosEfectuados()")
    }
}
function imprimeVoucher(){
    /*  imprime toda la informacion de la Transaccion previamente guardada
        y agrega el detalle de certificados de cada liquidacion
    */
    try{
        var parametros="&idTranx="+idDeposito+"&fechTranx="+$("#FechaDeposito").val()+"&local="+$("#idCmbLocal :selected").text();
        window.open("wbs_tesoreria?funcion=imprimeDEPOSITOPN"+parametros,'_blank');
    }catch(err){
        emitirErrorCatch(err, "imprimeVoucher")
    }
}
