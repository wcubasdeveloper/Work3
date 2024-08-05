//Interface de Usuario para creacion y revision de voucher de depositos x Ventas a Personas Juridicas
var DAO = new DAOWebServiceGeT("wbs_tesoreria");
var accion = $_GET("accion");
var arrayDatosContr = [], arrayDatosDep = [];
var idUsuario = parent.idUsuario;
var idDeposito = $_GET("idDepositoPJ"); //ID de toda la transaccion (undefined en Modo Creacion)
var mestado = ""; //estado general del Voucher
var totalCONTR = 0.0, totalDEP = 0.0;
var contadorIdContr = 0, contadorIdDep=0;
var realizoCambio=false;
cargarInicio(function(){
	$("#FechaDeposito").attr("requerido", "Fecha de Deposito");
	$("#FechaDeposito").datetimepicker({lan:'es', format:'d/m/Y',timepicker:false, closeOnDateSelect:true});
	$("#FechaDeposito").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto

    aplicarDataTableC();
    aplicarDataTableD();

    $("#txtNroVoucher").val(LPAD(idDeposito,numeroLPAD)); //variables globales en mhbsoftScripts.js
    //Recupera todos los datos del Voucher (Tablas: DepositoPJ, DepositoPJ_Contrato, DepositoPJ_Detalle)
    var parametros = "&idDepositoPJ=" + idDeposito;
    DAO.consultarWebServiceGet("getDetallesVoucherPJ", parametros, function (datos) {
        //  fechaDeposito, totalDeposito, idUsuario, estado
        //  [idDetalle, idContrato, fechaContr,nombreEmpresa,idEmpresaTransp,nroCATs,vigenciaContr,vigenciaCerts, total, totalSoles]
        //  [idDetalle, tipoDeposito,idCuentaBancaria, nroVoucher, fechaDep, monto, montoSoles,cuentaBanco]
        $("#FechaDeposito").val(datos[0].fechaDeposito);
        mestado = datos[0].estado; //A=anulado, B=Aprobado, P=Pendiente
        //validar si es otro usuario el que revisa este Voucher
        var rptaDatos = datos[0].detalleContr;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'idContrato'         , alineacion:'left',LPAD:true   },
            {campo:'fechaContr'         , alineacion:'left'             },
            {campo:'nombreEmpresa'      , alineacion:'left'             },
            {campo:'nroCATs'            , alineacion:'left'             },
            {campo:'vigenciaContr'      , alineacion:'left'             },
            {campo:'vigenciaCerts'      , alineacion:'left'             },
            {campo:'totalSoles'         , alineacion:'left'             }
        ];
        agregaFilasHTML("tabla_datosL", rptaDatos, camposAmostrar,12);
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
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'tipoDeposito', alineacion:'left'},
            {campo:'nroVoucher'  , alineacion:'left'},
            {campo:'cuentaBanco' , alineacion:'left'},
            {campo:'fechaDep'    , alineacion:'left'},
            {campo:'montoSoles'  , alineacion:'left'}
        ];
        agregaFilasHTML("tabla_datosD", rptaDatos, camposAmostrar,12,"1");
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
        $("#"+idTablaHTML+" > tbody").html(""); // reinicia
        if(datos.length>0){
            cantidadAtributos=campoAlineacionArray.length; // obtiene la cantidad de atributos
            var filaTRAppend="", nCampo="", idFila=0;
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
                    filaTRAppend+="<td style='vertical-align: middle; text-align: "+AlineacionTD+"'>"
                        +quitarEspaciosEnBlanco((conLPAD) ? LPAD(datos[i][nCampo], cantidadCeros) : datos[i][nCampo])+"</td>";
                }
                filaTRAppend+="</tr>";
            }
            $("#"+idTablaHTML+" > tbody").append(filaTRAppend);
        }
    }catch(err){
        emitirErrorCatch(err, "crearFilasHTML");
    }
}

function aplicarDataTableC(){
	try{
        /*
         "<td style='text-align:left;'>" + rptaDatos[i].idContrato + "</td>" +
         "<td style='text-align:left;'>" + rptaDatos[i].fechaContr + "</td>" +
         "<td style='text-align:left;'>" + rptaDatos[i].nombreEmpresa + "</td>" +
         "<td style='text-align:left;'>" + rptaDatos[i].nroCATs + "</td>" +
         "<td style='text-align:left;'>" + rptaDatos[i].vigenciaContr + "</td>" +
         "<td style='text-align:left;'>" + rptaDatos[i].vigenciaCerts + "</td>" +
         "<td style='text-align:left;'>" + rptaDatos[i].totalSoles + "</td>" +
        */
		var columns=[
			{"width": "10%"},
			{"width": "15%"},
			{"width": "25%"},
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

function actualizarTotalCONTR(){
    try{
        totalCONTR = 0;
        for(var i=0; i<arrayDatosContr.length; i++){
            if (arrayDatosContr[i].estado!='B') {
                totalCONTR += parseFloat(arrayDatosContr[i].total);
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
        var msjConfirm = (accion == 'A') ? '¿ Anula la Transacción ?' : '¿ Aprueba la Transacción ?';
        fancyConfirm(msjConfirm, function (rpta) {
            if (rpta) {
                var parametrosPOST = {idDepositoPJ: idDeposito, estado: accion};
                DAO.consultarWebServicePOST(parametrosPOST, "actualizaEstadoDepositoPJ",
                    function (data) {
                        if (data[0] > 0) {
                            fancyAlertFunction("Voucher de Depositos actualizado correctamente" +
                                    " (ID = " + data[0] + ")",
                                function () {
                                    realizoTarea = true;
                                    parent.$.fancybox.close();
                                })
                        }
                    });
            }
        });
    }catch(err){
        emitirErrorCatch(err, "actualizaVoucherPJ")
    }
}



