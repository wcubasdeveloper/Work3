function guardarPerfil(){
	try{
		validarInputs="nombrePerfil-Nombre de Perfil";
		if(validarInputsValueXid(validarInputs)){
			fancyConfirm("Esta seguro en guardar este nuevo perfil", function(e){
				try{
					var parametros="&nombrePerfil="+$("#nombrePerfil").val();
					consultarWebServiceGet("insertarPerfil", parametros, function(data){
						if(data.length>0){
							fancyAlertFunction("Se inserto el perfil correctamente !!", function(respuesta){
								if(respuesta){
									parent.$("#idPerfil").append(new Option($("#nombrePerfil").val(), rptaWebservice[0]));
									parent.$("#idPerfil").val(rptaWebservice[0]);
									parent.$("#content_Perfil").css("display", "block");
									parent.$("#nombrePerfil").val($("#nombrePerfil").val());
									parent.abrirFancyBox(820,450, "menuxperfil", true);
								}
							});				
						}
					});
				}catch (err){
					emitirErrorCatch(err, "callback - guardarPerfil")
				}
			});
		}
	}catch (err){
		emitirErrorCatch(err, "guardarPerfil")
	}	
}