/**
 * Created by Jean on 20/07/2015.
 */
var arrayPagos=new Array();
var ordenesSeleccionadas=new Array();
var dataTablePagos=undefined;
cargarInicio(function(){
    buscarOrdenesPago();
    $("#idBtnSeleccionar").click(cancelarOrdenes)
})
function finCancelacionOrdenes(data){
    try{
        var cantidadCancelada=data[0];
        if(cantidadCancelada==ordenesSeleccionadas.length){
            fancyAlertFunction("¡¡ Se cancelo las ordenes de pago exitosamente !!", function(estado){
                if(estado){
                    for(var i=0; i<ordenesSeleccionadas.length; i++){
                        $("#"+ordenesSeleccionadas[i].idTr).remove();
                    }
                    ordenesSeleccionadas.length=0;
                    realizoTarea=true;
                    //parent.$.fancybox.close();
                }
            });
        }else{
            if(ordenesSeleccionadas.length>0){
                fancyAlert("ERROR: No se pudo cancelar todas las ordenes de pago");
            }else{
                fancyAlert("No se canceló ninguna orden de pago");
            }
        }
    }catch(err){
        emitirErrorCatch(err, "finCancelacionOrdenes")
    }
}

/* @cancelarOrdenes: Cancela las órdenes de pago de las cuotas seleccionadas.
*/
function cancelarOrdenes(){
    try{
        if(ordenesSeleccionadas.length>0){
            // obtiene los id de las ordenes seleccionadas
            var idordenesSeleccionadas="";
            for(var i=0; i<ordenesSeleccionadas.length; i++){
                if(i>0){
                    idordenesSeleccionadas+=", ";
                }
                idordenesSeleccionadas+=ordenesSeleccionadas[i].idCuota;
            }
            fancyConfirm("¿ Desea cancelar las ordenes de pago seleccionadas ?", function(estado){
                if(estado){
                    var parametros="&idCuotas="+idordenesSeleccionadas+
                        "&idAcuerdo="+parent.arrayInfoAcuerdo.idAcuerdo;
                    consultarWebServiceGet("cancelarOrdenPago", parametros, finCancelacionOrdenes, "Cancelando Ordenes");
                }
            })
        }else{
            fancyAlert("No hay ninguna orden seleccionada");
        }
    }catch(err){
        emitirErrorCatch(err, "cancelarOrdenes")
    }
}
/* @buscarOrdenesPago: Busca las cuotas con ordenes de pago.
*/
function buscarOrdenesPago(){
    try{
        var parametros="&idAcuerdo="+parent.arrayInfoAcuerdo.idAcuerdo+
            "&estado=G";
        consultarWebServiceGet("getPagosByidAcuerdo", parametros, listarOrdenesPago);
    }catch(err){
        emitirErrorCatch(err, "buscarOrdenesPago")
    }
}
function quitarElemento(indice){
    try{
        // buscamos id
        var returnvalor=false;
        var id=arrayPagos[indice].idPago
        for(var i=0; i<ordenesSeleccionadas.length; i++){
            if(id==ordenesSeleccionadas[i].idPago){
                returnvalor=true;
                if(ordenesSeleccionadas[i].idCheckAnt!=''){
                    $("#"+ordenesSeleccionadas[i].idCheckAnt).prop("disabled", true);
                }
                if(ordenesSeleccionadas[i].idCheckPost!=''){
                    $("#"+ordenesSeleccionadas[i].idCheckPost).prop("disabled", false);
                }
                ordenesSeleccionadas.splice(i, 1); // elimina elemento arreglo
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
        var indicePagoSeleccionado=ordenesSeleccionadas.length;
        ordenesSeleccionadas[indicePagoSeleccionado]=arrayPagos[indice]; // agrega
        ordenesSeleccionadas[indicePagoSeleccionado].indiceArrayTotal=indice;
        if(ordenesSeleccionadas[indicePagoSeleccionado].idCheckPost!=''){
            $("#"+ordenesSeleccionadas[indicePagoSeleccionado].idCheckPost).prop("disabled", true);
        }
        if(ordenesSeleccionadas[indicePagoSeleccionado].idCheckAnt!=''){
            $("#"+ordenesSeleccionadas[indicePagoSeleccionado].idCheckAnt).prop("disabled", false);
        }
    }catch(err){
        emitirErrorCatch(err, "agregarElemento")
    }
}
function seleccionarPago(radio, indice){
    try{
        var TRCuotaSeleccionada=$(radio).parents().get(1);  // obtiene todo el <tr></tr>
        if($(radio).prop('checked')==true){ // se selecciono la opcion
            agregarElemento(indice);
            $(TRCuotaSeleccionada).css("background-color", "yellow"); // pinta de amarillo la fila de la opcion seleccionada
        }else{ // quita el elemento
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
function listarOrdenesPago(data){ //
    try{
        if(dataTablePagos!=undefined){
            dataTablePagos.destroy();
            $("#tabla_datos > tbody").html("");
        }
        for(var i=0; i<data.length; i++){
            var checkBoxdisabled="disabled";
            if(i==data.length-1){
                checkBoxdisabled="";
            }
            var idTr="tr_"+i;
            data[i].idTr=idTr;
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
            $("#tabla_datos > tbody").append("<tr id='"+idTr+"' style='font-family: Arial; height: 30px; font-size:12px;'>"+
                "<td style='vertical-align: middle; text-align:center'><input id='check_"+i+"' "+checkBoxdisabled+"  type='checkbox'  onchange='seleccionarPago(this, "+'"'+i+'"'+")' /> </td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].nroCuota+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].valorCuota+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].montoApagar+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].nombrePersona+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>S/. "+data[i].fechaEmision+"</td>"
                +"</tr>");
        }
        var columns=[
            {width:"8%"},
            {width:"8%"},
            {width:"16%"},
            {width:"16%"},
            {width:"37%"},
            {width:"15%",  "type":"date-eu"}
        ];
        dataTablePagos=parseDataTable("tabla_datos", columns, 287, false, false);
        arrayPagos=data;
        $("#oculta").css("display", "none");
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "listaOrdenesPago")
    }
}