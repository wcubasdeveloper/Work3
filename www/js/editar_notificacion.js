var realizoTarea=false;
var rptaCallback = [];
var codEvento = parent.codigoEvento;
var myEditor;
var notificacionSeleccionada = parent.notificacionSeleccionada;
var DAO = new DAOWebServiceGeT("webservice");
cargarInicio(function(){
	myEditor = new dhtmlXEditor({
		parent: "panelInforme",
		toolbar: true, // force dhtmlxToolbar using
		iconsPath: "js_editor/codebase/imgs/", // path for toolbar icons
		skin: "dhx_skyblue",
	});
	var inputCheck = $(notificacionSeleccionada).parent().parent().find("td").eq(0).find("input"); // obtiene el checkbox de responsable que se ha seleccionado para editar la notificacion
	var textoNotificacion = $(inputCheck).attr("notificacion");
	if(textoNotificacion=='[emplty]'){		
		DAO.consultarWebServiceGet("getPlantillaNotificacion", "", function(datos){
			myEditor.setContent(datos[0].plantillaNotificacion);
			$.fancybox.close();
			cargarInfoEventoAyuda();
		});		
	}else{
		myEditor.setContent(textoNotificacion);
		cargarInfoEventoAyuda();
	}
	$("#idAgraviados").prop("disabled", false);
	$("#idAgraviados").prop("readonly", true);
	$("#btnActualizarInforme").click(guardar)
});
function guardar(){
	try{
		realizoTarea=true;
		var contenidoInforme = myEditor.getContent();
		rptaCallback = [contenidoInforme];
		parent.$.fancybox.close();
		
	}catch(err){
		emitirErrorCatch(err, "guardar");
	}
}
function cargarInfoEventoAyuda(){
	try{
		var parametros = "&codEvento="+codEvento;
		console.log(parametros);
		DAO.consultarWebServiceGet("getInfoEventoAyuda", parametros, function(datos){
			console.log(datos);
			if(datos.length>0){
				$("#idCodEvento").val(codEvento);
				$("#idCAT").val(datos[0].nroCAT);
				$("#idPlaca").val(datos[0].placa);
				$("#idAsociado").val(datos[0].asociado);
				$("#idConductor").val(datos[0].propietario);
				$("#idPropietario").val(datos[0].chofer);
				$("#idLugar").val(datos[0].fechaLugar);
				$("#idCausales").val(datos[0].causales);
				$("#idGastos").val(datos[0].gastos);
				$("#idAgraviados").val(datos[0].agraviados);				
			}
			$.fancybox.close();
		});
	}catch(err){
		emitirErrorCatch(err, "cargarInfoEventoAyuda");
	}
}