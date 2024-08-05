var filaselect;
var realizoTarea=true;
var rptaCallback = [];
var tramite;
var myEditor;
function subirInforme(){
	try{
		var files = $("#idChooser").get(0).files;
		if(files.length>0){
			fancyConfirm("¿Desea continuar?", function(rpta){
				if(rpta){
					var file = files[0];
					var formData = new FormData();
					var idHistorial = tramite.idHistorial;
					var name = idHistorial+"_informe.pdf";
					formData.append('chooser', file, name);	
					fancyAlertWait("Espere");
					$.ajax({
						url: '/webservice?funcion=uploadInformePDF',
						type: 'POST',
						data: formData,
						processData: false,
						contentType: false,
						success: function(data){
							actualizarInforme();
						}
					});
				}
			});			
		}else{
			fancyAlert("¡Debe subir un archivo PDF!")
		}
	}catch(err){
		emitirErrorCatch(err, "subirInforme");
	}
}
cargarInicio(function(){
	$("#idChooser").attr("accept","application/pdf")
	var nombreArea = getUrlVars()["nombreArea"];	
	filaselect = parent.filaSeleccionada;
	tramite=parent.arrayExpedientes[filaselect];		
	parent.filaSeleccionada=undefined;
	labelTextWebPlus("idTitutloInforme", ("INFORME DEL ÁREA "+nombreArea).toUpperCase());	
	if(tramite.informe!=null){ // No se ha insertado nunca ningun informe
		// carga el PDF en el DIV.
		$("#panelInforme").attr("src","uploads_informe/"+tramite.informe);
	}
	if(tramite.estadoExpediente=='1'){ // Si aun esta en proceso
		$("#btnActualizarInforme").click(subirInforme)	
	}else{ // Ya no esta proceso
		$("#btnActualizarInforme").prop("disabled", true); // deshabilita actualizacion del informe
	}
})


/* @actualizarInforme: Actualiza el contenido del informe del expediente.
*/
function actualizarInforme(){ // actualiza el contenido de un informe
	try{		
		/*if(validarCamposRequeridos("panelInforme")){
			fancyConfirm("¿Desea actualizar el informe?", function(rpta){
				if(rpta){*/
					var parametros={
						informe:tramite.idHistorial+"_informe.pdf",
						idHistorial:tramite.idHistorial
					};
					consultarWebServicePOST(parametros, "actualizarInforme", function(data){
						if(data[0]>0){
							parent.arrayExpedientes[filaselect].informe = tramite.idHistorial+"_informe.pdf";							
							$("#panelInforme").attr("src","uploads_informe/"+tramite.informe);
							
							fancyAlert("Se actualizo correctamente");					
							//parent.$.fancybox.close();
						}else{
							fancyAlert("No se pudo Actualizar");
						}						
					})
				/*}
			})			
		}	*/
	}catch(err){
		emitirErrorCatch(err, "actualizarInforme");
	}
}