var DAO = new DAOWebServiceGeT("wbs_as-sini");
var idCarta = $_GET("idCarta");
cargarInicio(function(){
	var codEvento = $_GET("codEvento");
	var codAgraviado = $_GET("codAgraviado");
	var nombreAgraviado = $_GET("nombreAgraviado");
	var DNI = $_GET("DNI");
	var nroCarta = $_GET("nroCarta");
	var etapa = $_GET("etapa");
	var monto = $_GET("monto");
	
	$("#idCodEvento").val(codEvento);
	$("#idNroCarta").val(nroCarta);
	$("#idEtapa").val(etapa);
	$("#idMonto").val("S/. "+monto);
	$("#idCodAgraviado").val(codAgraviado);
	$("#idNombre").val(nombreAgraviado);
	$("#idDNI").val(DNI);
	
	$("#btnConfirmar").click(anularCarta);
})
function anularCarta(){
	try{
		var advertenciaExtra = "";
		var motivoAnulacion = $("#idMotivo").val();
		if(motivoAnulacion==""){
			advertenciaExtra = " (No ha ingresado el motivo de la anulación) ";
		}
		fancyConfirm("¿Desea continuar con la anulación"+advertenciaExtra+"?", function(rpta){
			if(rpta){
				var parametros = "&motivo="+motivoAnulacion+"&idCarta="+idCarta;
				DAO.consultarWebServiceGet("anularCarta",parametros, function(data){
					var filasAfectadas = data[0];
					if(filasAfectadas>0){
						realizoTarea=true;
						parent.$.fancybox.close();
					}else{
						fancyAlert("¡Operación Fallida!")
					}
				});
			}
		});		
	}catch(err){
		emitirErrorCatch(err, "anularCarta");
	}	
}