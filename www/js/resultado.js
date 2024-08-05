var objeto=parent.arrayDatos[parent.filaSeleccionada];
cargarInicio(function(){
	  labelTextWebPlus("id_Titulo", "RESULTADO DE LA TAREA Nº "+LPAD(objeto.idTarea, numeroLPAD)) // Carga texto en el titulo
	  $("#idGuardar").click(function(){
	  		guardarResultado();
	  });
});
function guardarResultado(){
	try{
		if(validarCamposRequeridos("idPanelCampos")){ // valido que el campo resultado este completo
			if($("input[name='rptaObjetivo']:checked").length==0){ //No se respondio
                fancyAlert("¡¡ Debe responder a la pregunta sobre Objetivo alcanzado !!")
			}else{
                fancyConfirm("¿ Confirma definir el resultado de la tarea Nº "+LPAD(objeto.idTarea, numeroLPAD), function(estado){
                    if(estado){
                        var objetivoCumplido=$("input[name='rptaObjetivo']:checked").val();
                        fancyAlertWait("Guardando");
                        parent.$(".fancybox-close").hide(); // Oculta el boton de Cierre de la ventana
                        var parametros="&idTarea="+objeto.idTarea+
                            "&resultado="+$("#idResultado").val()+
                            "&objetivoCumplido="+objetivoCumplido+
                            "&idNotificacion="+objeto.idNotificacion;
                        webService2("guardarResultado", parametros, "finalizarRegistroResultado()"); //Guarda el resultado de la tarea
                    }
                });
            }
		}
	}catch(err){
		emitirErrorCatch(err, "guardarResultado");
	}
}
function finalizarRegistroResultado(){
	try{
		if(rptaWebservice[0]>0){ // devuelve la cantidad de filas afectadas en la actualizacion
			//fancyAlertFunction("¡¡ Se definió  el resultado de la tarea Nº "+objeto.idTarea+" correctamente !!", function(estado){
			//	if(estado){
					if($("input[name='rptaObjetivo']:checked").val()=='F'){ // si no se cumplio el objetivo abre nueva ventana de seguimiento
						parent.abrirFancyBox(550, 450, "seguimiento", false);
					}else{						
						//if(parent.$("#idEstadoTareas").val()=='P'){ // si se encuentra seleccionado el filtro de pendientes
							parent.bucarTareas(parent.$("#idEstadoTareas").val()); //
						//}
						//parent.$.fancybox.close();
					}
			//	}
			//});
		}else{
			fancyAlert("No se pudo guardar el resultado")
		}
	}catch(err){
		emitirErrorCatch(err, "finalizarRegistroResultado");
	}
}