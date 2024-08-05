cargarInicio(function(){
	var tramitador=getUrlVars()["tramitador"];
	var correo=getUrlVars()["correo"];
	$("#tramitador").val(tramitador);
	$("#correo").val(correo)
	$("#enviarCorreo").click(enviarCorreo)
})
function enviarCorreo(){
	try{
		if(validarCamposRequeridos("panelInforme")){
			if($("#idInforme").val()!=""){
				var parametros="&correo="+$("#correo").val()+
					"&tramitador="+$("#tramitador").val();
				var formData = new FormData($("#formulario")[0]);
                fancyAlertWait("Enviando correo");
                // Enviamos con ajax y jquery
                /*consultarWebServicePOST(formData, 'enviarInforme'+parametros, function(data){
                	if(data[0]>0){
						fancyAlertFunction("Se envio correo", function(rpta){
							if(rpta){
								parent.$.fancybox.close();
							}
						});
					}else{
						fancyAlert("No se envio")
					}
                });*/
	            $.ajax({
	                url: 'intranetDB2.php?funcion=enviarInforme'+parametros,
	                type: 'POST',
	                dataType: "json",
	                data: formData,
	                cache: false,
	                contentType: false,
	                processData: false,
	                success: function(data){
	                	if(data[0]>0){
						fancyAlertFunction("Se envio correo", function(rpta){
							if(rpta){
								parent.$.fancybox.close();
							}
						});
						}else{
							fancyAlert("No se envio")
						}
	                },
	                error: function(jqXHR, textStatus, errorThrown){
	                    alert("Hubo un error: "+jqXHR.responseText);
	                }
	            });	
			}else{
				fancyAlert("Debe adjuntar el Informe");
			}		
		}
	}catch(err){
		emitirErroCatch(err, "enviarCorreo")
	}
}