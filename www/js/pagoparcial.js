var arrayCuota=parent.cuotasSeleccionadas[0];
var arrayInfoAcuerdo=parent.arrayInfoAcuerdo;
cargarInicio(function(){
    cargarInfoCuota();
});
function cargarInfoCuota(){
    try{
        //carga info acuerdo
        $("#idLblAcuerdo").val(arrayInfoAcuerdo.idAcuerdo)
        $("#idLblFechaAcuerdo").val(arrayInfoAcuerdo.fechaAcuerdo)
        $("#idLblDeudaAcordada").val(arrayInfoAcuerdo.deudaAcordada)
        // carga info de la cuota:
        $("#idLblNroCuota").val(arrayCuota.nroCuota);
        $("#idLblFechaVenc").val(arrayCuota.fechaVencimiento);
        $("#idLblSaldo").val(arrayCuota.saldo);
        $("#idMontoPagar").keypress(function(e){ // permite ingresar numeros mayores de 0
            var valor=this.value;
            return textNumber(e, 0, valor);
        });
        $("#idBtnOrdenPagoParcial").click(generarOrdenPagoParcial);
        $("#idMontoPagar").focus();
    }catch(err){
        emitirErrorCatch(err, "cargarInfoCuota")
    }
}
function generarOrdenPagoParcial(){
    try{
        var montoApagar=$("#idMontoPagar").val();
        if(montoApagar!=""){
            montoApagar=parseFloat(montoApagar);
            if(montoApagar<=arrayCuota.saldo){
                fancyConfirm("¿ Esta seguro de proceder con el registro de la orden de pago ?", function(estado){
                    if(estado){                        
                        var cuota=arrayCuota.idCuota+"/"+montoApagar;
                        var idAcuerdo=arrayInfoAcuerdo.idAcuerdo;
                        var parametros="&idCuotas="+cuota+
                            "&idAcuerdo="+idAcuerdo+"&idPersona="+parent.$("#idCombResponsables").val();
                        consultarWebServiceGet("generarOrdenPago", parametros, finGenerarOrdenPagoParcial, "Registrando");
                    }
                });
            }else{
                fancyAlertFunction("El monto a pagar no debe de excederse del saldo de la cuota", function(estado){
                    if(estado){
                        $("#idMontoPagar").focus();
                    }
                });
            }
        }else{
            fancyAlertFunction("Debe definir el monto a pagar", function (estado){
                if(estado){
                    $("#idMontoPagar").focus();
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "generarOrdenPagoParcial")
    }
}
function finGenerarOrdenPagoParcial(data){
    try{
        var cantidadInsertado = data[0];
        if(cantidadInsertado>0){
            fancyAlertFunction("¡¡ Se registró la Orden de Pago exitosamente !!", function(estado){
                if(estado){
                    realizoTarea=true;
                    rptaCallback=data;
                    parent.$.fancybox.close();
                }
            });
        }else{
            fancyAlert("No se registro ninguna orden de pago");
        }
    }catch(err){
        emitirErrorCatch(err, "finGenerarOrdenPagoParcial")
    }
}