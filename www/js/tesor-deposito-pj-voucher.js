//Interface de Usuario para creacion y revision de voucher de depositos x Ventas a Personas Juridicas
var DAO = new DAOWebServiceGeT("wbs_tesoreria");
var accion = $_GET("accion");
var arrayDatosContr = [], arrayDatosDep = [];
var idUsuario = parent.idUsuario;
var idDeposito = $_GET("idDepositoPJ"); //ID de toda la transaccion (undefined en Modo Creacion)
var mestado = ""; //estado general del Voucher
var camposAmostrarL = [],camposAmostrarD = [];
var totalCONTR = 0, totalDEP = 0;
var contadorIdContr = 0, contadorIdDep=0;
var realizoCambio=false;
cargarInicio(function(){
	$("#FechaDeposito").attr("requerido", "Fecha de Deposito");
	$("#FechaDeposito").datetimepicker({lan:'es', format:'d/m/Y',timepicker:false, closeOnDateSelect:true});
	$("#FechaDeposito").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto

        $("#btnGuardar").click(guardarVoucher);
        $("#btnDetalleContr").click(muestraContr);
        $("#btnAgregaContr").click(nuevoContr);
        $("#btnEditarContr").click(editarContr);
        $("#btnEliminarContr").click(eliminarContr);
        $("#btnAgregaDep").click(nuevoDep);
        $("#btnEditarDep").click(editarDep);
        $("#btnEliminarDep").click(eliminarDep);
        $("#btnRedondear").click(redondearContr);

        camposAmostrarL = [ // asigna los campos a mostrar en la grilla superior
            {campo:'idContrato'         , alineacion:'left',LPAD:true   },
            {campo:'fechaContr'         , alineacion:'left'             },
            {campo:'nombreEmpresa'      , alineacion:'left'             },
            {campo:'nCuotas'            , alineacion:'left'             },
            {campo:'nroCuota'           , alineacion:'left'             },
            {campo:'vigenciaCertIni'    , alineacion:'left'             },
            {campo:'vigenciaCertFin'    , alineacion:'left'             },
            {campo:'totalSoles'         , alineacion:'left'             }
        ];
        aplicarDataTableC();
        camposAmostrarD = [ // asigna los campos a mostrar en la grilla inferior
            {campo:'tipoDeposito', alineacion:'left'},
            {campo:'nroVoucher'  , alineacion:'left'},
            {campo:'cuentaBanco' , alineacion:'left'},
            {campo:'fechaDep'    , alineacion:'left'},
            {campo:'montoSoles'  , alineacion:'left'}
        ];
        aplicarDataTableD();
        if (accion != 'N') { // VISTA > Edicion
            $("#txtNroVoucher").val(LPAD(idDeposito,numeroLPAD)); //variables globales en mhbsoftScripts.js
            //Recupera todos los datos del Voucher (Tablas: DepositoPJ, DepositoPJ_Contrato, DepositoPJ_Detalle)
            var parametros = "&idDepositoPJ=" + idDeposito;
            DAO.consultarWebServiceGet("getDetallesVoucherPJ", parametros, function (datos) {
         //  fechaDeposito, totalDeposito, idUsuario, estado
         //  [idDetalle, idContrato,idContratoRenovacion, fechaContr,nombreEmpresa,idEmpresaTransp,nCuotas,nroCuota,vigenciaCertsIni,vigenciaCertsFin,total, totalSoles]
         //  [idDetalle, tipoDeposito,idCuentaBancaria, nroVoucher, fechaDep, monto, montoSoles,cuentaBanco]
                $("#FechaDeposito").val(datos[0].fechaDeposito);
                mestado = datos[0].estado; //A=anulado, B=Aprobado, P=Pendiente
                //validar si es otro usuario el que revisa este Voucher
                var rptaDatos = datos[0].detalleContr;
                agregaFilasHTML("tabla_datosL", rptaDatos, camposAmostrarL,12);
                for (var i = 0; i < rptaDatos.length; i++) {
                    rptaDatos[i].estado='O';   // Nueva propiedad: estado del registro O=Original,N=Nuevo, U=Actualizado, B=Borrar
                    arrayDatosContr.push(rptaDatos[i]);
                    contadorIdContr=rptaDatos[i].idDetalle;  //actualiza id de filas
                }
                actualizarTotalCONTR();
                rptaDatos = datos[0].detalleDep;
                var tDeposito="";
                for (var i = 0; i < rptaDatos.length; i++) {
                    tDeposito="DEP"
                    if(rptaDatos[i].tipoDeposito !="D"){tDeposito="CHEQ";}
                    rptaDatos[i].tipoDeposito=tDeposito; //traduce valor
                    rptaDatos[i].estado='O';   // Nueva propiedad: estado del registro O=Original,N=Nuevo, U=Actualizado, B=Borrar
                    arrayDatosDep.push(rptaDatos[i]);
                    contadorIdDep=rptaDatos[i].idDetalle;  //actualiza id de filas
                }
                agregaFilasHTML("tabla_datosD", rptaDatos, camposAmostrarD,12,"1");
                actualizarTotalDEP();
                if (mestado!='P'){
                    $("#txtEstado").val(mestado=='A'?"ANULADO":"APROBADO");
                // *** si esta Aprobado o Anulado no permite modificaciones
                    $(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
                    $(":input").css("opacity", "0.65");
                    $("#btnGuardar").css("display", "none");
                    $("#btnDetalleContr").css("display", "none");
                    $("#btnAgregaContr").css("display", "none");
                    $("#btnEditarContr").css("display", "none");
                    $("#btnEliminarContr").css("display", "none");
                    $("#btnAgregaDep").css("display", "none");
                    $("#btnEditarDep").css("display", "none");
                    $("#btnEliminarDep").css("display", "none");
                 }else{
                    $("#txtEstado").css("display", "none");
                }
            });
        } else {
            //Nuevo Voucher
            $("#txtEstado").css("display","none");

        }
        parent.$(".fancybox-close").unbind("click");
        parent.$(".fancybox-close").click(avisarCambiosEfectuados);
        $.fancybox.close();

});
//NroTabla="" => un solo datTable o el primero, "1" => 2da datTable en la pantalla
function agregaFilasHTML(idTablaHTML, datos, campoAlineacionArray, fontSize, NroTabla){
    try{
        if(fontSize==undefined){
            fontSize=11;
        }
        if(NroTabla==undefined ){
            NroTabla = "";
        }

        var onclick="";
        var AlineacionTD="";
        var cantidadAtributos=0;
        //$("#"+idTablaHTML+" > tbody").html(""); // reinicia
        if(datos.length>0){
            cantidadAtributos=campoAlineacionArray.length; // obtiene la cantidad de atributos
            var filaTRAppend="", nCampo="", idFila= 0, nValor="";
            for(var i=0; i<datos.length; i++){
                idFila=datos[i].idDetalle;
                //hay dos funciones globales seleccionarFila y seleccionarFila1 >> para dataTable alterno
                onclick="onclick='seleccionarFila"+NroTabla+"("+'"'+ idFila +'"'+")' id='tr"+NroTabla+"_"+idFila+"'";
                filaTRAppend+="<tr  style='font-family: Arial; height: 30px; cursor: pointer; font-size: "+fontSize+"px;' "+onclick+">";
                for(var y=0; y<cantidadAtributos; y++){ //completa las columnas segun la cantidad de atributos
                    AlineacionTD="justify";
                    var conLPAD = false; // option que determina si el campo se completera con ceros
                    var cantidadCeros = numeroLPAD; // cantidad de ceros
                    if(campoAlineacionArray[y]!=undefined){
                        AlineacionTD=campoAlineacionArray[y].alineacion;
                        if(campoAlineacionArray[y].LPAD==true){
                            conLPAD = true;
                            if(campoAlineacionArray[y].cantLPAD>0){
                                cantidadCeros = campoAlineacionArray[y].cantLPAD;
                            }
                        }
                    }
                    nCampo=campoAlineacionArray[y].campo;
                    nValor = datos[i][nCampo];
                    if(nValor == null){nValor = "";}
                    filaTRAppend+="<td style='vertical-align: middle; text-align: "+AlineacionTD+"'>"
                        +quitarEspaciosEnBlanco((conLPAD) ? LPAD(nValor, cantidadCeros) : nValor)+"</td>";
                }
                filaTRAppend+="</tr>";
            }
            $("#"+idTablaHTML+" > tbody").append(filaTRAppend);
        }
    }catch(err){
        emitirErrorCatch(err, "crearFilasHTML");
    }
}

function cambioInformacion(){
    realizoCambio = true;
}
function aplicarDataTableC(){
	try{
        /*
         {campo:'idContrato'         , alineacion:'left',LPAD:true   },
         {campo:'fechaContr'         , alineacion:'left'             },
         {campo:'nombreEmpresa'      , alineacion:'left'             },
         {campo:'nCuotas'            , alineacion:'left'             },
         {campo:'nroCuota'           , alineacion:'left'             },
         {campo:'vigenciaCertIni'   , alineacion:'left'             },
         {campo:'vigenciaCertFin'   , alineacion:'left'             },
         {campo:'totalSoles'         , alineacion:'left'             }
        */
		var columns=[
			{"width": "10%"},
			{"width": "15%"},
			{"width": "15%"},
            {"width": "10%"},
            {"width": "10%"},
            {"width": "15%"},
            {"width": "15%"},
            {"width": "10%"}
		];
		parseDataTable("tabla_datosL", columns, 134, false, false, false, false,
            function(){
                if($("#tabla_datosL > tbody >tr").length==1 && $("#tabla_datosL > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                    $("#tabla_datosL > tbody").html("");
                }
		    });
		$.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "aplicarDataTableC");
	}
}
function aplicarDataTableD(){
    try{/*
            {campo:'tipoDeposito', alineacion:'left'},
            {campo:'nroVoucher'  , alineacion:'left'},
            {campo:'cuentaBanco' , alineacion:'left'},
            {campo:'fechaDep'    , alineacion:'left'},
            {campo:'montoSoles'  , alineacion:'left'}
        */
        var columns=[
            {"width" : "10%"},
            {"width" : "15%"},
            {"width" : "45%"},
            {"width" : "15%"},
            {"width" : "15%"}
        ];
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
function actualizarTotalCONTR(){
    try{
        totalCONTR = 0;
        for(var i=0; i<arrayDatosContr.length; i++){
            if (arrayDatosContr[i].estado!='B') {
                var mNumero = (Math.round(arrayDatosContr[i].total*100)/100);
                totalCONTR = (Math.round((totalCONTR+mNumero)*100)/100);
            }
        }
        $("#txtTotalContratos").val(formatDec(totalCONTR,"S/.",2));
    }catch(err){
        emitirErrorCatch(err, "actualizarTotalCONTR");
    }
}
function actualizarTotalDEP(){
    try{
        totalDEP = 0;
        for(var i=0; i<arrayDatosDep.length; i++){
            if (arrayDatosDep[i].estado!='B') {
                var mNumero = (Math.round(arrayDatosDep[i].monto*100)/100);
                totalDEP = (Math.round(totalDEP+mNumero*100)/100);
            }
        }
        $("#txtTotalDeposito").val(formatDec(totalDEP,"S/.",2));
    }catch(err){
        emitirErrorCatch(err, "actualizarTotalDEP");
    }
}

//Funciones CRUD para la lista de contratos
function nuevoContr(){
	try{
        contadorIdContr++;
        var url_comando="tesor-depositopj-editar-contrato?accion=N&idDetalle="+contadorIdContr;
        abrirVentanaFancyBox(550, 350, url_comando, true,
            function(rptaDatos){
                agregaFilasHTML("tabla_datosL", rptaDatos, camposAmostrarL,12);
                arrayDatosContr.push(rptaDatos[0]); //guarda registro completo
                actualizarTotalCONTR();
                realizoCambio=true;
            });
	}catch(err){
		emitirErrorCatch(err, "nuevoContr")
	}
}
function redondearContr(){
    try{
        if(filaSeleccionada == undefined) {
        //*NUEVO*
            contadorIdContr++;
            var url_comando = "tesor-depositopj-redondeo?accion=N&idDetalle=" + contadorIdContr;
            abrirVentanaFancyBox(550, 350, url_comando, true,
                function (rptaDatos) {
                    agregaFilasHTML("tabla_datosL", rptaDatos, camposAmostrarL, 12);
                    arrayDatosContr.push(rptaDatos[0]); //guarda registro completo
                    actualizarTotalCONTR();
                    realizoCambio = true;
                });
        }else{
            //validar q es un registro de redondeo
            var idDetalle = filaSeleccionada;
            for(var i=0; i<arrayDatosContr.length; i++){
                if(arrayDatosContr[i].idDetalle == idDetalle){
                    if(arrayDatosContr[i].idContrato!=null){
                        fancyAlert("¡Debe seleccionar un registro de redondeo!");
                        return;
                    }
                    break;
                }
            }

            var url_comando = "tesor-depositopj-redondeo?accion=E&idDetalle=" + idDetalle;
            abrirVentanaFancyBox(550, 350, url_comando, true, function(rptaDatos){
                var idDetalle = rptaDatos[0].idDetalle;
                $("#tr_" + idDetalle).find("td").eq(7).html(rptaDatos[0].totalSoles);

                for (var i = 0; i < arrayDatosContr.length; i++) {
                    if (arrayDatosContr[i].idDetalle == idDetalle) {
                        arrayDatosContr[i].total = rptaDatos[0].total;
                        arrayDatosContr[i].totalSoles = rptaDatos[0].totalSoles;
                        arrayDatosContr[i].estado = rptaDatos[0].estado;
                        break;
                    }
                }
                actualizarTotalCONTR();
                realizoCambio = true;
            });

        }
    }catch(err){
        emitirErrorCatch(err, "redondearContr")
    }
}
function eliminarContr(){
	try{
		if(filaSeleccionada!=undefined){
			// elimina el registro de detalle en el array:
			for(var i=0; i<arrayDatosContr.length; i++){
				if(arrayDatosContr[i].idDetalle==filaSeleccionada){
                    arrayDatosContr[i].estado = 'B'; //sera borrado en webservice, modo Edicion
					$("#tr_"+filaSeleccionada).remove(); //remover elemento de DOM
					break;
				}
			}
			actualizarTotalCONTR();
            realizoCambio=true;
        }else{
			fancyAlert("¡Debe seleccionar un Contrato-Cuota!");
		}		
	}catch(err){
		emitirErrorCatch(err, "eliminarContr")
	}
}
function editarContr(){
    try{
        if(filaSeleccionada!=undefined ){
            var idDetalle = filaSeleccionada;
            for(var i=0; i<arrayDatosContr.length; i++){
                if(arrayDatosContr[i].idDetalle == idDetalle){
                    if(arrayDatosContr[i].idContrato==null){
                        fancyAlert("¡No puede modificar este registro!");
                        return;
                    }
                    break;
                }
            }
            var url_comando="tesor-depositopj-editar-contrato?accion=E&idDetalle="+idDetalle;
            abrirVentanaFancyBox(550, 350, url_comando, true, function(rptaDatos){
                var idDetalle = rptaDatos[0].idDetalle;
/*
 {campo:'idContrato'         , alineacion:'left',LPAD:true   },
 {campo:'fechaContr'         , alineacion:'left'             },
 {campo:'nombreEmpresa'      , alineacion:'left'             },
 {campo:'nCuotas'            , alineacion:'left'             },
 {campo:'nroCuota'           , alineacion:'left'             },
 {campo:'vigenciaCertIni'   , alineacion:'left'             },
 {campo:'vigenciaCertFin'   , alineacion:'left'             },
 {campo:'totalSoles'         , alineacion:'left'             }
 */
                $("#tr_" + idDetalle).find("td").eq(0).html(rptaDatos[0].idContrato);
                $("#tr_" + idDetalle).find("td").eq(1).html(rptaDatos[0].fechaContr);
                $("#tr_" + idDetalle).find("td").eq(2).html(rptaDatos[0].nombreEmpresa);
                $("#tr_" + idDetalle).find("td").eq(3).html(rptaDatos[0].nCuotas);
                $("#tr_" + idDetalle).find("td").eq(4).html(rptaDatos[0].nroCuota);
                $("#tr_" + idDetalle).find("td").eq(5).html(rptaDatos[0].vigenciaCertIni);
                $("#tr_" + idDetalle).find("td").eq(6).html(rptaDatos[0].vigenciaCertFin);
                $("#tr_" + idDetalle).find("td").eq(7).html(rptaDatos[0].totalSoles);

                for (var i = 0; i < arrayDatosContr.length; i++) {
                    if (arrayDatosContr[i].idDetalle == idDetalle) {
                        arrayDatosContr[i].idContrato = rptaDatos[0].idContrato;
                        arrayDatosContr[i].fechaContr = rptaDatos[0].fechaContr;
                        arrayDatosContr[i].nombreEmpresa = rptaDatos[0].nombreEmpresa;
                        arrayDatosContr[i].nCuotas = rptaDatos[0].nCuotas;
                        arrayDatosContr[i].vigenciaCertIni = rptaDatos[0].vigenciaCertIni;
                        arrayDatosContr[i].vigenciaCertFin = rptaDatos[0].vigenciaCertFin;
                        arrayDatosContr[i].nroCuota = rptaDatos[0].nroCuota;
                        arrayDatosContr[i].total = rptaDatos[0].total;
                        arrayDatosContr[i].totalSoles = rptaDatos[0].totalSoles;
                        arrayDatosContr[i].estado = rptaDatos[0].estado;
                        break;
                    }
                }
                actualizarTotalCONTR();
                realizoCambio = true;
            });
        }else{
            fancyAlert("¡Debe seleccionar un Contrato-Cuota!");
        }
    }catch(err){
        emitirErrorCatch(err, "editarContr")
    }
}
function muestraContr(){
    try{
        if(filaSeleccionada!=undefined){
            for(var i=0; i<arrayDatosContr.length; i++){
                if(arrayDatosContr[i].idDetalle == filaSeleccionada){
                    var midContratoRenovacion=arrayDatosContr[i].idContratoRenovacion;
                    break;
                }
            }
            var url_comando="tesor-depositopj-contrato?idContratoRenovacion="+midContratoRenovacion;
            abrirVentanaFancyBox(1075, 480, url_comando, true);
        }else{
            fancyAlert("¡Debe seleccionar un Contrato-Cuota!");
        }
    }catch(err){
        emitirErrorCatch(err, "muestraContr")
    }
}

//Funciones CRUD para la lista de depositos en Banco
function nuevoDep(){
    try{
        contadorIdDep++;
        var url_comando="tesor-depositopj-editar-depositobco?accion=N&idDetalle="+contadorIdDep;
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
            actualizarTotalDEP();
            realizoCambio=true;
        });
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
            var url_comando="tesor-depositopj-editar-depositobco?accion=E&idDetalle="+idDetalle;
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
                    if(totalCONTR == totalDEP ){
                        fancyConfirm(msjConfirm, function(rpta){
                            var parametrosPOST = {};
                            for (var i = 0; i < arrayDatosDep.length; i++) {
                            //cambia formatos de fecha para los depositos
                                arrayDatosDep[i].fechaDep =dateTimeFormat( arrayDatosDep[0].fechaDep);
                            }
                            var mfunctionName='guardarDepositoPJ';
                            var msjFancy="Depositos ingresados correctamente"
                            if (accion=='N') { //NUEVO Voucher
                                for (var i = 0; i < arrayDatosContr.length; i++) {
                                    if (arrayDatosContr[i].estado == "B") {
                                        arrayDatosContr.splice(i, 1); //remover item del array
                                    }
                                }
                                for (var i = 0; i < arrayDatosDep.length; i++) {
                                    if (arrayDatosDep[i].estado == "B") {
                                        arrayDatosDep.splice(i, 1); //remover item del array
                                    }
                                }
                            }else{ //Edicion
                                parametrosPOST.idDepositoPJ=idDeposito; //agrega propiedad
                                mfunctionName='actualizaDepositoPJ'
                                msjFancy="Depositos actualizados correctamente"
                            }
                            //Agrega resto de propiedades a usar x webservice
                             parametrosPOST.fecha = dateTimeFormat($("#FechaDeposito").val());
                             parametrosPOST.total= totalCONTR;
                             parametrosPOST.idUsuario= idUsuario;
                             parametrosPOST.detallesC= arrayDatosContr;
                             parametrosPOST.detallesD= arrayDatosDep;
                            DAO.consultarWebServicePOST(parametrosPOST, mfunctionName,
                                function(data){
                                    if(data[0]>0){
                                        fancyAlertFunction(msjFancy+" (ID = "+data[0]+")",
                                            function(){
                                                realizoTarea=true;
                                                parent.$.fancybox.close();
                                            })
                                    }
                                });
                        });
                    }else{
                        fancyAlert("¡El total de Contratos debe ser igual a los Depositos!")
                    }
                }else{
                    fancyAlert("¡Debe ingresar al menos un contrato y un deposito!")
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