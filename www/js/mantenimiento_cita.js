var realizoTarea=false;
var rptaCallback;
var accion=getUrlVars()["accion"];
var idCita=getUrlVars()["idCita"];
cargarInicio(function(){
	switch(accion){
		case '2': // Atender
			labelTextWebPlus("idLblTitulo", "ATENDER CITA")
			$("#idConfirmar").val("Atender")
			break;
		case '3': // Cancelar
			labelTextWebPlus("idLblTitulo", "CANCELAR CITA")
			$("#idConfirmar").val("Confirmar Cancelacion")
			break;
	}
	$("#idConfirmar").click(confirmar)
})
function confirmar(){
	try{
		if(validarCamposRequeridos("idPanelCita")){
			fancyConfirm("¿Estas seguro de proceder con la operación?", function(respuesta){
				if(respuesta){
					var parametros="&estado="+accion+"&idCita="+idCita+"&comentario="+$("#idComentario").val();
					consultarWebServiceGet("mantenimientoCita", parametros, function(data){
						if(data[0]>0){ // se actualizo mas de un registro
							realizoTarea=true;
							rptaCallback=[{
								filasAfectadas:data[0]
							}]
							parent.$.fancybox.close(); // Cierra ventana
						}
					})
				}
			})
		}
	}catch(err){
		emitirErrorCatch(err, "confirmar")
	}
}