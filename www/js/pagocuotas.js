/**
 * Created by Jean on 16/07/2015.
 */
var arrayPagos=new Array();
var dataTablePagos=undefined;
function finEfectuarPagos(data){
    try{
        var contador=data[0];
        if(contador==arrayPagos.length){
            fancyAlertFunction("¡¡Se efectuo el pago correctamente!!", function(estado){
                if(estado){
                    generarPDF("4", arrayInfoAcuerdo.idPersonaPagador, idPagosComa);
                    $("#idBtnBuscarAcuerdo").val("Buscar Acuerdo");
                    $("#oculta").css("display", "block");
                }
            });
        }else{
            if(contador>0){
                fancyAlert("No se pudo completar registrar el pago de todas las cuotas");
            }else{
                fancyAlert("No se registro el pago");
            }
        }
    }catch(err){
        emitirErrorCatch(err, "finEfectuarPagos")
    }
}
var idPagosComa="";
/* @efectuarPagos: Registra el pago de la orden de pago.
*/
function efectuarPagos(){
    try{
        idPagosComa="";
        idPagos="";
        for(var i=0; i<arrayPagos.length; i++){
            if(i>0){
                idPagos=idPagos+";";
                idPagosComa=idPagosComa+", ";
            }
            arrayPagos[i].monto=arrayPagos[i].monto.replace("S/. ", "");
            idPagos=idPagos+arrayPagos[i].idPago+"-"+arrayPagos[i].monto+"-"+arrayPagos[i].idCuota;
            idPagosComa=idPagosComa+arrayPagos[i].idPago;
        }
        fancyConfirm("¿ Confirmar efectuar el pago ?", function(estado){
            if(estado){
                var parametros="&idPagos="+idPagos+"&idPersona="+arrayInfoAcuerdo.idPersonaPagador;
                consultarWebServiceGet("efectuarPagos", parametros, finEfectuarPagos, "Guardando");
            }
        });
    }catch(err){
        emitirErrorCatch(err, "efectuarPagos")
    }
}
function cargarComboPersonas(){
    try{
        var arrayPersonasAcuerdo=arrayInfoAcuerdo.responsables;
        var arrayPersonasCombo=new Array();
        for(var i=0; i<arrayPersonasAcuerdo.length; i++){
            arrayPersonasCombo[arrayPersonasCombo.length]={id:arrayPersonasAcuerdo[i].idPersona, texto:arrayPersonasAcuerdo[i].nombre};
        }
        agregarOpcionesToCombo("idCombResponsables", arrayPersonasCombo);
    }catch(err){
        emitirErrorCatch(err, "cargarComboPersonas");
    }
}
function listaOrdenPago(data){
    try{
        var pagoTotal=0;
        for(var i=0; i<data.length;i++){
            pagoTotal=pagoTotal+parseFloat(data[i].monto);
            data[i].monto="S/. "+data[i].monto;
        }
        if(dataTablePagos!=undefined){
            dataTablePagos.destroy();
        }
        var camposAlineacion=[
            {campo:"nroCuota", alineacion:"center"},
            {campo:"monto", alineacion:"center"}
        ]
        arrayPagos=data;
        crearFilasHTML("tabla_datos_pagos", data, camposAlineacion, false, 12)
        var columns=[
            {width:"30%"},
            {width:"70%"}
        ];
        dataTablePagos=parseDataTable("tabla_datos_pagos", columns, 245, false);
        $("#idMontoTotal").val("S/. "+pagoTotal);
        //cargarComboPersonas();
        //$("#idCombResponsables").select2();
        $("#idTextPagante").val(arrayInfoAcuerdo.nombrePagador);
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "listaOrdenPago")
    }
}

/* @cargarOrdenPago: Carga las cuotas que tienen ordenes de pago.
*/
funcionUltima = function cargarOrdenPago(){
    try{
        var parametros="&idAcuerdo="+arrayInfoAcuerdo.idAcuerdo+"&estado=G"; // estado=G : Generado
        consultarWebServiceGet("getPagosByAcuerdo", parametros, listaOrdenPago);
    }catch(err){
        emitirErrorCatch(err, "cargarOrdenPago")
    }
}
cargarInicio(function(){
    $("#idLblFechaEmision").val(fechaFormateada((new Date()), false, true));
    parent.abrirVentanaFancyBox(900,500, "buscarordenesxacuerdo", true, cargarInfoAcuerdo, true);
    $("#idBtnBuscarAcuerdo").click(function(){
        if($("#idBtnBuscarAcuerdo").val()=="Buscar Acuerdo"){
            parent.abrirVentanaFancyBox(900,500, "buscarordenesxacuerdo", true, cargarInfoAcuerdo, true);
        }else{
            cancelarTareaControlPago();
        }
    })
    $("#idBtnPagar").click(efectuarPagos)
});