var accion=parent.accion;
var datosObjeto=undefined;
function cargarInfo(){
	try{		
		switch(accion){
			case 'A': // Agregar
				labelTextWebPlus("id_Titulo","NUEVO MOTIVO")// carga titulo
				break;
			case 'E': // editar
				$("#idGuardar").val("Actualizar");
				labelTextWebPlus("id_Titulo","EDITAR MOTIVO")// carga titulo
				datosObjeto=parent.arrayLocalRegistros[parent.filaSeleccionada];
				$("#idDescripcion").val(datosObjeto.descripcion);
				asignarEventoChange("idComponents", datosObjeto, "idGuardar");
				$("#idGuardar").prop("disabled", true); // deshabiita por defecto el boton de guardar
				break;
		}
		$("#idDescripcion").focus();
		$("#idGuardar").click(function(){
			Guardar();
		});		
	}catch(err){
		emitirErrorCatch(err, "cargarInfo"); // emite error
	}
}
cargarInicio(cargarInfo);

function Guardar(){
	try{
		var inputsAvalidar="idDescripcion-Descripcion";
		if(validarInputsValueXid(inputsAvalidar)){
			//fancyConfirm("Esta seguro de proceder con la operación", function(estado){ // HE QUITADO LA PREGUNTA
			//	if(estado){
					var parametrosWebService="&descripcion="+$("#idDescripcion").val();
					switch(accion){
						case 'A':
							webService2("insertarMotivo", parametrosWebService, "finalizarGuardar()");
							break;
						case 'E':					
							parametrosWebService+="&idMotivo="+datosObjeto.idMotivo;
							webService2("actualizarMotivo", parametrosWebService, "finalizarGuardar()");
							break;
					}
			///	}
			//});
		}
	}catch(err){
		emitirErrorCatch(err, "Guardar"); // emite error
	}
}
function finalizarGuardar(){
	try{
		if(rptaWebservice[0]>0){
			var mensaje="";
			switch(accion){
				case 'A':
					mensaje="Se inserto el Motivo correctamente (Id:"+rptaWebservice[0]+")";
					break;
				case 'E':
					mensaje="Se actualizó el motivo (Id:"+datosObjeto.idMotivo+") correctamente";
					break;
			}
			fancyAlertFunction(mensaje, function(estado){
				if(estado){
					parent.filaSeleccionada=undefined;
					parent.$.fancybox.close();
					parent.cargarMotivos();
				}
			});
		}else{
			fancyAlert("No se pudo insertar el motivo");
		}
	}catch(err){
		emitirErrorCatch(err, "finalizarGuardar"); // emite error
	}
}