// Obtiene datos del expediente
var realizoTarea=false;
var rptaCallback;
//var codEvento=parent.codEventoExpediente;
//var idAgraviado=parent.$("#idComboAgraviado").val();
//var diasRespuesta = parent.$("#idDiaRespuesta").val();
var idTipoExpediente = getUrlVars()["idTipoExpediente"]; 
var codEvento=getUrlVars()["codEvento"];
var idAgraviado = getUrlVars()["idAgraviado"];
var idExpedientePrevio = getUrlVars()["idExpedientePrevio"];
var nroFolios = getUrlVars()["nroFolios"];
var observaciones = getUrlVars()["observaciones"];
var nroDocRef = getUrlVars()["nroDocRef"];
var diasRespuesta = getUrlVars()["diasRespuesta"];
var idPersonaTramitante = getUrlVars()["idPersonaTramitante"];
var fechaHoraTramite = getUrlVars()["fechaHoraTramite"];
cargarInicio(function(){
	var nombreAgraviado = parent.$("#idComboAgraviado option:selected").text();
	$("#idAgraviado").val(nombreAgraviado);
	// Carga plugin para calendario y fecha
	$("#fechaCita").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true}); // Calendario
	$("#horaCita").datetimepicker({ datepicker:false, format:'H:i', step:15});
	$("#idGuardarCita").click(guardarCita)
	buscarMedicos()
});
function buscarMedicos(){
	try{
		consultarWebServiceGet("getAllMedicos", "", cargarListaMedicos); // Busca y luego carga los nombres de los medicos
	}catch(err){
		emitirErrorCatch(err, "buscarMedicos")
	}
}
function cargarListaMedicos(data){
	try{
		for(var i=0; i<data.length; i++){
			$("#idComboMedico").append(new Option(data[0].nombreMedico, data[0].idMedico))
		}
		$.fancybox.close()
	}catch(err){
		emitirErrorCatch(err, "cargarListaMedicos")
	}
}
function guardarCita(){ // Guarda expediente y cita
	try{
		if(validarCamposRequeridos("idPanelCita")){
			fancyConfirm("¿ Desea proceder a registrar la cita ?", function(estado){
				if(estado){
					var parametros="&idTipoExpediente="+idTipoExpediente+ // 
						"&codEvento="+codEvento+
						"&idAgraviado="+idAgraviado+
						"&idExpedientePrevio="+idExpedientePrevio+
						"&nroFolios="+nroFolios+
						"&observaciones="+observaciones+
						"&nroDocRef="+nroDocRef+
						"&diasRespuesta="+diasRespuesta+
						"&idPersonaTramitante="+idPersonaTramitante+
						"&fechaHoraTramite="+fechaHoraTramite+ /// A CONTINUACION SE NOMBRA LOS PARAMETROS SOLO DE LA CITA						
						"&fechaCita="+dateTimeFormat($("#fechaCita").val())+" "+$("#horaCita").val()+
						"&idMedico="+$("#idComboMedico").val()+
						"&comentario="+$("#idComentario").val();
						if(idPersonaTramitante=='0'){
							var nombres = getUrlVars()["nombres"];
							var apellidoPaterno = getUrlVars()["apellidoPaterno"];
							var apellidoMaterno = getUrlVars()["apellidoMaterno"];
							var DNI = getUrlVars()["DNI"];							
							parametros=parametros+"&nombres="+nombres+  // DATOS DE LA PERSONA QUE TRAMITA SERA REGISTRADO
								"&apellidoPaterno="+apellidoPaterno+
								"&apellidoMaterno="+apellidoMaterno+
								"&DNI="+DNI;								
						}
						var telef = getUrlVars()["telef"];
						var direccion = getUrlVars()["direccion"];
						var email = getUrlVars()["email"];
						parametros=parametros+"&telef="+telef+
							"&direccion="+direccion+
							"&email="+email;

					consultarWebServiceGet("registrarExpediente", parametros, function(data){
						if(data[0]>0){ // Se inserto la cita
							/*realizoTarea=true; // Realizo tarea
							rptaCallback=[{idExpedienteRegistrado:data[0]}];*/
							parent.idExpedienteRegistrado=data[0];
							parent.abrirDerivacionTramite();
							//parent.$.fancybox.close()
						}else{
							fancyAlert("Error: No se pudo registrar el expediente")
						}
					});
				}
			});
		}		
	}catch(err){
		emitirErrorCatch(err, "guardarCita")
	}
}