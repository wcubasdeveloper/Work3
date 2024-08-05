var realizoTarea=false;
var rptaCallback;
cargarInicio(function(){
	$("#idNombre").focus();
	$("#idGuardar").click(guardar)
})
function guardar(){
	try{
		if(validarCamposRequeridos("idPanelDatos")){
			fancyConfirm("¿Esta seguro de registrar la institución?", function(rpta){
				if(rpta){
					var parametros="&nombre="+$("#idNombre").val()+
						"&direccion="+$("#idDireccion").val()+
						"&telef="+$("#idTelefono").val()+
						"&contacto="+$("#idContacto").val();
					consultarWebServiceGet("registrarInstitucion", parametros, function(data){
						if(data.length>0){
							var id=data[0].idInsertado;
							var nombre=$("#idNombre").val();
							realizoTarea=true;
							rptaCallback=[{
								idInstitucion:id,
								nombre:nombre
							}];
							fancyAlertFunction("¡Se inserto correctamente!", function(rpta){
								if(rpta){
									parent.$.fancybox.close();
								}
							})					
						}else{
							fancyAlert("No se guardo")
						}
					})
				}
			})			
		}
	}catch(err){
		emitirErrorCatch(err, "guardar")
	}
}