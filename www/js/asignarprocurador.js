/**
 * Created by JEAN PIERRE on 2/06/2016.
 */
var codEvento;
var idProcurador;
var document;
var arrayProcuradores;
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
cargarInicio(function(){
    listarProcuradores();
    $("#btnAsignar").click(asignarProcurador);
    $("#btnAsignar").prop("disabled", true);
})
function listarProcuradores(){
    try{
        DAO.consultarWebServiceGet("getListaProcuradores", "", function(data){
            arrayProcuradores=data;
            agregarOpcionesToCombo("idProcurador", data, {"keyValue":"nombreProcurador", "keyId": "idProcurador"});
            codEvento = $_GET('codEvento');
            idProcurador = $_GET('idProcurador');
            $("#codEvento").val(codEvento);
            $("#idProcurador").val(idProcurador); // carga el procurador del evento
            $("#idProcurador").select2();
            if(idProcurador>0){// si ya existe un procurador previamente asignado se agrega la opcion de reinicio de asignacion
                $("#btnReiniciar").css("display", "block");
                $("#btnReiniciar").click(reiniciarAsignacion);
            }
            $("#idProcurador").change(function(){
                if(this.value==idProcurador && idProcurador!=""){
                    $("#btnAsignar").prop("disabled", true);
                    fancyAlertFunction("Debe seleccionar un procurador diferente al anterior", function(rpta){
                        if(rpta){
                            $("#idProcurador").focus();
                        }
                    });
                }else{
                    $("#btnAsignar").prop("disabled", false);
                }
            });
            $.fancybox.close();
        })
    }catch(err){
        emitirErrorCatch(err, "listarProcuradores()")
    }
}
function asignarProcurador(){
    try{
        if(validarCamposRequeridos("idPanel")){
            fancyConfirm("¿Continuar con la asignación?", function(rpta){
                if(rpta){
                    var correoProcurador = "";
                    for(var i=0; i<arrayProcuradores.length; i++){
                        if(arrayProcuradores[i].idProcurador == $("#idProcurador").val()){
                            correoProcurador=arrayProcuradores[i].correo;
                            break;
                        }
                    }
                    var parametros = "&codEvento="+codEvento+
                        "&idProcurador="+$("#idProcurador").val()+"&correo="+correoProcurador;
                    // *** Datos del procuradorPrevio ***
                    parametros=parametros+"&idProcuradorPrevio="+idProcurador
                    var correoProcuradorPrevio = "";
                    if(idProcurador>0){
                        for(var i=0; i<arrayProcuradores.length; i++){
                            if(arrayProcuradores[i].idProcurador == idProcurador){
                                correoProcuradorPrevio=arrayProcuradores[i].correo;
                                break;
                            }
                        }
                        parametros = parametros+"&correoProcuradorPrevio="+correoProcuradorPrevio;
                    }
                    DAO.consultarWebServiceGet("asignarProcurador", parametros, function(data){
                        realizoTarea=true;
                        if(data[0]>0){
                            fancyAlertFunction("¡Se asignó el procurador correctamente!", function(rpta){
                                if(rpta){
                                    rptaCallback=[data[0], $("#idProcurador").val()]; // envia como respuesta un array con la cantidad de filas afectadas y el id del procurador seleccionado
                                    parent.$.fancybox.close();
                                }
                            })
                        }else{
                            fancyAlertFunction("¡No se pudo asignar el procurador!<br>Es muy posible que alguien haya registrado un Informe asociado al evento recientemente.", function(rpta){
                                if(rpta){
                                    rptaCallback=data[0];
                                    parent.$.fancybox.close();
                                }
                            });
                        }
                    });
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "asignarProcurador()");
    }
}
function reiniciarAsignacion(){
    try{
        fancyConfirm("¿Quitar la asignación previa?", function(rpta){
           if(rpta){
               var parametros = "&codEvento="+codEvento+"&idProcurador=";
               DAO.consultarWebServiceGet("asignarProcurador", parametros, function(data){
                   realizoTarea=true;
                   if(data[0]>0){
                       fancyAlertFunction("¡Se borró la asignación correctamente!", function(rpta){
                           if(rpta){
                               rptaCallback=[data[0], 0]; // envia como respuesta un array con la cantidad de filas afectadas y el id del procurador como 0
                               parent.$.fancybox.close();
                           }
                       })
                   }else{
                       fancyAlertFunction("¡No se pudo quitar la asignación del procurador!<br>Es muy posible que alguien haya registrado un Informe asociado al evento recientemente.", function(rpta){
                           if(rpta){
                               rptaCallback=data[0];
                               parent.$.fancybox.close();
                           }
                       });
                   }
               });
           }
        });
    }catch (err){
        emitirErrorCatch(err, "reiniciarAsignacion()")
    }
}