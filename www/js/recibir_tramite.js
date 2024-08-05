var realizoTarea=false;
var rptaCallback;
cargarInicio(function(){
	cargarInfo();
	$("#idConfirmar").click(confirmarTramite)
});
var idExpediente=0;
var idUsuario=0;
var idArea=0;
var fechaIngreso;
var idHistorial;
var estadoExpediente;
function cargarInfo(){
	try{
		// Obtiene parametros GET
		idExpediente = getUrlVars()["idExpediente"];
		idUsuario = getUrlVars()["idUsuario"];
		idArea = getUrlVars()["idAreaUsuario"];
		fechaIngreso = getUrlVars()["fechaIngreso"];
		idHistorial = getUrlVars()["idHistorial"];
		estadoExpediente = getUrlVars()["estadoExpediente"];
		var tipo = getUrlVars()["tipo"];
		var area = getUrlVars()["areaOrigen"];
		var comentarios = getUrlVars()["comentarios"];
		// Completa los campos
		$("#idExpediente").val(LPAD(idExpediente, numeroLPAD));
		$("#idTipoDocumento").val(tipo);
		$("#idAreaOrigen").val(area);
		$("#idComentario").val(comentarios);
	}catch(err){
		emitirErrorCath(err, "cargarInfo")
	}
}
/* @confirmarTramite: Marca un expediente pendiente de recibir como recibido
*/
function confirmarTramite(){
	try{
		fancyConfirm("¿Confirma la recepción del documento?", function(rpta){
			if(rpta){
				var parametros="&idExpediente="+idExpediente+
					"&idHistorial="+idHistorial+
					"&idUsuario="+idUsuario+
					"&idArea="+idArea+
					"&fechaIngreso="+fechaIngreso+
					"&estadoExpediente="+estadoExpediente;
				consultarWebServiceGet("confirmarTramite", parametros, function(data){
					if(data[0]>0){
						//realizoTarea=true;
						//rptaCallback=[{filasAfectadas:data[0]}];
						parent.buscarTramites();
						parent.parent.buscarExpedientesPendientes(); // Busca y actualiza la lista de expedientes
						parent.$.fancybox.close(); // cierra la ventana
					}else{
						fancyAlert("No se pudo completar la confirmacion, por favor reintente");
					}
				})
			}
		});
	}catch(err){
		emitirErrorCath(err, "confirmarTramite")
	}
}