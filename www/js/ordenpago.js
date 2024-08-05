/**
 * Created by Jean on 16/07/2015.
 */
var cerrandoFancyBoxActivo=false;
var cuotasSeleccionadas=new Array();
var arrayCuotasTotal=new Array();
var dataTableCuotas=undefined;
function cancelarOrdenPago(){
    try{

        abrirVentanaFancyBox(850, 450, "cancelarordenes", true, cargarCuotas, false); // abre ventana para eliminar ordenes de pago
    }catch(err){
        emitirErrorCatch(err, "cancelarOrdenPago")
    }
}
function descargarReporte(data){
    try{
        var cantidadInsertada=data[0];
        if(cantidadInsertada>0){
            generarPDF('3', $("#idCombResponsables").val());
            $("#idBtnBuscarAcuerdo").val("Buscar Acuerdo");
            $("#oculta").css("display", "block");
        }
    }catch(err){
        emitirErrorCatch(err, "descargarReporte")
    }
}
function generarPagoParcial(){
    try{
        if($("#idCombResponsables").val()!=""){
            if(cuotasSeleccionadas.length>0){
                if(cuotasSeleccionadas.length==1){
                    if(cuotasSeleccionadas[0].estadoCuota=='G'){ //
                        fancyAlert("¡¡ La cuota seleccionada tiene una Orden de pago pendiente !!");
                    }else{
                        abrirVentanaFancyBox(500,370, "pagoparcial",true, descargarReporte);
                    }
                }else{
                    fancyAlert("Solo debe seleccionar una cuota para el pago parcial")
                }
            }else{
                fancyAlert("No hay ninguna cuota seleccionada");
            }
        }else{
            fancyAlertFunction("Debe asignar la persona que efectuará el pago", function(estado){
                if(estado){
                    $("#idCombResponsables").focus();
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "generarPagoParcial")
    }
}
function finGenerarOrdenPago(data){
    try{
        var cantidadPagosInsertado=data[0];
        if(cantidadPagosInsertado==cuotasSeleccionadas.length){
            fancyAlertFunction("¡¡ Se registró la Orden de Pago exitosamente !!", function(estado){
                if(estado){
                    generarPDF('3', $("#idCombResponsables").val()); // Generar PDF
                    $("#idBtnBuscarAcuerdo").val("Buscar Acuerdo");
                    $("#oculta").css("display", "block");
                }
            });
        }else{
            if(cuotasSeleccionadas.length>0){
                fancyAlert("ERROR: No se pudo completar toda la orden de pago");
            }else{
                fancyAlert("No se registro ninguna orden de pago");
            }
        }
    }catch(err){
        emitirErrorCatch(err, "finGenerarOrdenPago")
    }
}

/* @generarOrdenPago: Genera una orden de pago completa de una cuota con saldo pendiente.
*/
function generarOrdenPago(){
    try{
        if($("#idCombResponsables").val()!=""){
            if(cuotasSeleccionadas.length>0){
                // obtiene los id de las cuotas seleccionadas
                var idCuotasSeleccionadas="";
                for(var i=0; i<cuotasSeleccionadas.length; i++){
                    if(cuotasSeleccionadas[i].estadoCuota=='G'){ // Orden de pago
                        fancyAlert("¡¡ La Cuota Nro: "+cuotasSeleccionadas[i].nroCuota+"), tiene una orden de pago !!")
                        return false;
                    }
                    if(i>0){
                        idCuotasSeleccionadas+=";";
                    }
                    idCuotasSeleccionadas+=cuotasSeleccionadas[i].idCuota+"/"+cuotasSeleccionadas[i].saldo;
                }
                fancyConfirm("¿ Confirma generar la orden del Pago ?", function(estado){
                    if(estado){
                        var parametros="&idCuotas="+idCuotasSeleccionadas+
                            "&idAcuerdo="+arrayInfoAcuerdo.idAcuerdo+"&idPersona="+$("#idCombResponsables").val();
                        consultarWebServiceGet("generarOrdenPago", parametros, finGenerarOrdenPago, "Registrando");
                    }
                });
            }else{
                fancyAlert("No hay ninguna cuota seleccionada");
            }
        }else{
            fancyAlertFunction("Debe asignar la persona que efectuará el pago", function(estado){
                if(estado){
                    $("#idCombResponsables").focus();
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "generarOrdenPago")
    }
}
function quitarElemento(indice){
    try{
        // buscamos id
        var returnvalor=false;
        var id=arrayCuotasTotal[indice].idCuota
        for(var i=0; i<cuotasSeleccionadas.length; i++){
            if(id==cuotasSeleccionadas[i].idCuota){
                returnvalor=true;
                if(cuotasSeleccionadas[i].idCheckAnt!=''){
                    $("#"+cuotasSeleccionadas[i].idCheckAnt).prop("disabled", false);
                }
                if(cuotasSeleccionadas[i].idCheckPost!=''){
                    $("#"+cuotasSeleccionadas[i].idCheckPost).prop("disabled", true);
                }
                cuotasSeleccionadas.splice(i, 1); // elimina elemento arreglo
                break;
            }
        }
        return returnvalor;
    }catch(err){
        emitirErrorCatch(err, "quitarElemento")
    }
}
function agregarElemento(indice){
    try{
        var indiceCuotaSeleccionada=cuotasSeleccionadas.length;
        cuotasSeleccionadas[indiceCuotaSeleccionada]=arrayCuotasTotal[indice]
        cuotasSeleccionadas[indiceCuotaSeleccionada].indiceArrayTotal=indice;
        if(cuotasSeleccionadas[indiceCuotaSeleccionada].idCheckPost!=''){
            $("#"+cuotasSeleccionadas[indiceCuotaSeleccionada].idCheckPost).prop("disabled", false);
        }
        if(cuotasSeleccionadas[indiceCuotaSeleccionada].idCheckAnt!=''){
            $("#"+cuotasSeleccionadas[indiceCuotaSeleccionada].idCheckAnt).prop("disabled", true);
        }
    }catch(err){
        emitirErrorCatch(err, "agregarElemento")
    }
}
function seleccionarCuota(radio, indice){
    try{
        var TRCuotaSeleccionada=$(radio).parents().get(1);  // obtiene todo el <tr></tr>
        if($(radio).prop('checked')==true){ // se selecciono la opcion
            agregarElemento(indice);
            $(TRCuotaSeleccionada).css("background-color", "yellow"); // pinta de amarillo la fila de la opcion seleccionada
        }else{
            if(quitarElemento(indice)){
                $(TRCuotaSeleccionada).css("background-color", "transparent");  // caso contrario la vuelve al color anterior
            }else{
                fancyAlert("No se pudo quitar la seleccion");
            }
        }
    }catch(err){
        emitirErrorCatch(err, "seleccionarCuota")
    }
}
function cargarComboPersonas() {
    try {        
        var arrayPersonasAcuerdo = arrayInfoAcuerdo.responsables;
        var arrayPersonasCombo = new Array();
        var opcionSeleccionadaXdefecto=""; // opcion seleccionada x defecto
        if(arrayPersonasAcuerdo.length==1){ // si solo hay un solo responsable lo selecciona x defecto
            opcionSeleccionadaXdefecto=arrayPersonasAcuerdo[0].idPersona;
        }
        for (var i = 0; i < arrayPersonasAcuerdo.length; i++) {
            arrayPersonasCombo[arrayPersonasCombo.length] = {id: arrayPersonasAcuerdo[i].idPersona, texto: arrayPersonasAcuerdo[i].nombre};
        }
        agregarOpcionesToCombo("idCombResponsables", arrayPersonasCombo);
        $("#idCombResponsables").val(opcionSeleccionadaXdefecto);
        $("#idCombResponsables").select2();
    } catch (err) {
        emitirErrorCatch(err, "cargarComboPersonas");
    }
}
function listarCuentas(data){
    try{
        if(dataTableCuotas!=undefined){
            dataTableCuotas.destroy();
            $("#tabla_datos_cuotas > tbody").html("");
        }
        for(var i=0; i<data.length; i++){
            if(data[i].montoPagado==null){
                data[i].montoPagado=0;
            }
            data[i].saldo=parseFloat(data[i].valorCuota)-parseFloat(data[i].montoPagado);
            //data[i].saldo="S/. "+data[i].saldo;
            data[i].valorCuota="S/. "+data[i].valorCuota;
            if(data[i].ultimaFechaPago==null){
                data[i].ultimaFechaPago="----------";
            }
            switch (data[i].estadoCuota){
                case 'D':
                    data[i].estadoCuotaText='Pendiente';
                    break;
                case 'S':
                    data[i].estadoCuotaText='Saldo Pend.';
                    break;
                case 'G':
                    data[i].estadoCuotaText='Orden de Pago';
                    break;
            }
            var idTD_estado="td_estado_"+i;  // ID TD ESTADO
            var checkBoxdisabled="";
            if(i>0 || data[i].estadoCuota=='G'){
                checkBoxdisabled="disabled";
            }
            var idCheckBoxPost="";
            var idCheckBoxAnt="";
            if(data.length>0){
                if(i<(data.length-1)){ // si no es la ultima cuota, asigna
                    if(i>0){ // sino es el primero agregar anterior
                        idCheckBoxAnt="check_"+(i-1);
                    }
                    idCheckBoxPost="check_"+(i+1);
                }else{ //
                    idCheckBoxAnt="check_"+(i-1);
                }
            }
            data[i].idCheckAnt=idCheckBoxAnt;
            data[i].idCheckPost=idCheckBoxPost;
            $("#tabla_datos_cuotas > tbody").append("<tr style='font-family: Arial; height: 30px; font-size:12px;'>"+
                "<td style='vertical-align: middle; text-align:center'><input id='check_"+i+"' type='checkbox' "+checkBoxdisabled+" onchange='seleccionarCuota(this, "+'"'+i+'"'+")' /> </td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].nroCuota+"</td>"+
                "<td id='"+idTD_estado+"' style='vertical-align: middle; text-align:center'>"+data[i].estadoCuotaText+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].fechaVencimiento+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].valorCuota+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>S/. "+data[i].saldo+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].ultimaFechaPago+"</td>"+
                +"</tr>");
            data[i].idTD_estado=idTD_estado;
        }
        var columns=[
            {width:"8%"},
            {width:"8%"},
            {width:"20%"},
            {width:"14%"},
            {width:"17%"},
            {width:"17%"},
            {width:"16%"}
        ];
        dataTableCuotas=parseDataTable("tabla_datos_cuotas", columns, 295, false, false);
        arrayCuotasTotal=data;
        cargarComboPersonas();
        $("#idCombResponsables").select2();
        if(cerrandoFancyBoxActivo){
            cerrandoFancyBoxActivo=false;
        }else{
            $.fancybox.close();
        }

    }catch(err){
        emitirErrorCatch(err, "listarCuentas");
    }
}
/* @cargarCuotas: Carga las cuotas con saldo pendiente y con Orden de pago
*/
function cargarCuotas(){ // obtiene las cuotas
    try{
        cuotasSeleccionadas.length=0; // reinicia
        var parametros="&idAcuerdo="+arrayInfoAcuerdo.idAcuerdo+"&estado=D-S-G"; // consulta las cuotas pendientes, con saldo pendiente y con Orden de Pago
        consultarWebServiceGet("getCuotasByAcuerdo", parametros, listarCuentas, false);
    }catch(err){
        emitirErrorCatch(err, "cargarCuotas");
    }
}
funcionUltima=cargarCuotas;
cargarInicio(function() {
    $("#idLblFechaEmision").val(fechaFormateada((new Date()), false, true));
    $("#idLblFechaEmision").datetimepicker({lan:'es', formatDate:'d/m/Y', format:'d/m/Y', /**minDate:0, **/timepicker:false, closeOnDateSelect:true});
    parent.abrirVentanaFancyBox(900, 500, "buscaracuerdos", true, cargarInfoAcuerdo, true);
    $("#idBtnBuscarAcuerdo").click(function () {
        if ($("#idBtnBuscarAcuerdo").val() == "Buscar Acuerdo") {
            parent.abrirVentanaFancyBox(900, 500, "buscaracuerdos", true, cargarInfoAcuerdo, true);
        } else {
            cancelarTareaControlPago();
        }
    })
    /*$("#idBtnGenerarExcel").click(function(){
     generarExcelCuotasPendientes(cargarTablaCuotas)
     })*/
    $("#idBtnGenerarExcel").click(function () {
        generarPDF();
    });
    $("#idBtnOrdenPago").click(generarOrdenPago);
    $("#idBtnPagoParcial").click(generarPagoParcial);
    $("#idBtnCancelarOrdenPago").click(cancelarOrdenPago)
});