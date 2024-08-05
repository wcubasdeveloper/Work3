var idInforme;
var tipoAccion = parent.tipoAccion;
cargarInicio(function(){
    fancyAlertWait("Cargando");
    switch (tipoAccion) {
        case 'N': // Nuevo
            labelTextWebPlus("idLabelTitulo", "NUEVO VEHICULO");
            idInforme = parent.idInforme
            break;
        case 'E': // Editar
            var vehiculo = parent.arrayListaVehiculos[parent.filaSeleccionada];
            idInforme=vehiculo.idInforme;
            cargarInfo(vehiculo)
            break;
    }
    $.fancybox.close();
})

/* @cargarInfo: Carga la información de vehículo seleccionado.
*/
function cargarInfo(objeto){
    try{
        $("#idPlaca").val(quitarEspaciosEnBlanco(objeto.placa));
        $("#idMotor").val(quitarEspaciosEnBlanco(objeto.motor));
        $("#idMarca").val(quitarEspaciosEnBlanco(objeto.marca));
        $("#idColor").val(quitarEspaciosEnBlanco(objeto.color));
        $("#idAño").val(quitarEspaciosEnBlanco(objeto.anno));
        $("#idKilometro").val(quitarEspaciosEnBlanco(objeto.kilometro));
        $("#idCIA").val(quitarEspaciosEnBlanco(objeto.cia));
    }catch(err){
        emitirErrorCatch(err, "cargarInfo")
    }
}
function guardar(){
    try{
        var camposAvalidar="idPlaca-Placa";
        if(validarInputsValueXid(camposAvalidar)){
            var tituloConfirm = "¿Estas seguro de actualizar la información del vehiculo?";
			if(tipoAccion=='N'){
				tituloConfirm = "¿Estas seguro de proceder con el registro del nuevo vehiculo?"
			}
			fancyConfirm(tituloConfirm, function(e){
				if(e){
				    var parametros="";
				    var funcionWebService="";
				    var idVehiculo_Informado = 0;
				    parametros=parametros+"&placa="+$("#idPlaca").val();
        			parametros=parametros+"&motor="+$("#idMotor").val();
        		    parametros=parametros+"&marca="+$("#idMarca").val();
        			parametros=parametros+"&color="+$("#idColor").val();
        			parametros=parametros+"&anno="+$("#idAño").val();
        			parametros=parametros+"&kilometro="+$("#idKilometro").val();
        		    parametros=parametros+"&cia="+$("#idCIA").val();
        		    parametros=parametros+"&idInforme="+idInforme;
        		    if(tipoAccion=='E'){ // Editar
        		        idVehiculo_Informado = parent.arrayListaVehiculos[parent.filaSeleccionada].idVehiculoInformado;
        		        funcionWebService="editarVehiculo";
        		    }else{
        		        funcionWebService="insertarVehiculo";
        		    }
        		    parametros=parametros+"&idVehiculo="+idVehiculo_Informado;
        		    consultarWebServiceGet(funcionWebService, parametros, function(data){
        		       if(data[0]>0){ // actualizo o inserto
        		            var mensajeFinal = "";
        		            if(tipoAccion=='N'){
        		                mensajeFinal="¡Se registró el vehículo correctamente!";
        		            }else{
        		                mensajeFinal="¡Se actualizó el vehículo correctamente!";
        		            }
        		            fancyAlertFunction(mensajeFinal, function(estado){
								if(estado){
								    parent.filaSeleccionada=undefined;
									parent.$.fancybox.close();
									parent.cargarListaDeVehiculos();
								}
							});	
        		       }else{
        		           fancyAlert("No se pudo registrar o actualizar la informacion")
        		       }
        		    });
				}
			});
            
        }
    }catch(err){
        emitirErrorCatch(err, "guardar")
    }
}