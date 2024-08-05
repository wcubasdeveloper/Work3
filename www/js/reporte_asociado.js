var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){
	idLocal = parent.idLocal;
}
var DAO = new DAOWebServiceGeT("wbs_ventas") // Objeto del web service de Ventas
cargarInicio(function(){
    $("#btnDescargar").click(reporte)
    $("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	DAO.consultarWebServiceGet("getConos", "", function(datos){
		var campos =  {"keyId":'idSede', "keyValue":'nombreSede'}
		agregarOpcionesToCombo("cmb_cono", datos, campos);
		if(idLocal>0){
			$("#cmb_cono").val(idLocal)
			$("#cmb_cono").prop("disabled", true);
		}
		$.fancybox.close();
	});
});
function cleanDate(idInput){ // Limpia el string de los campos fechas
    try{
        $("#"+idInput).val("");
    }catch(err){
        emitirErrorCatch(err, "cleanDate()")
    }
};
function reporte(){
	try{
		if($("#fechaDesde").val()=="" && $("#fechaHasta").val()==""){
			fancyAlertFunction("¡Debe seleccionar un fecha!", function(){
				$("#fechaDesde").focus();
			});
			return;
		}
		var parametros="&fechaDesde="+dateTimeFormat($("#fechaDesde").val())+
			"&fechaHasta="+dateTimeFormat($("#fechaHasta").val())+
			"&idSede="+$("#cmb_cono").val();
		
		DAO.consultarWebServiceGet("getCertificados_asociado", parametros, function(resultsData){
			if(resultsData.length>0){
				var camposAmostrar = [ // asigna los campos a mostrar en la grilla
					{campo:'nombreAsociado', alineacion:'left'},
					{campo:'direccion', alineacion:'left'},
					{campo:'nroDocumento', alineacion:'center'},
					{campo:'fechaControlInicio', alineacion:'center'},
					{campo:'fechaControlFin', alineacion:'center'},
					{campo:'firma', alineacion:'center'}
				];
				crearFilasHTML("tabla_datos", resultsData, camposAmostrar, false, 12); // crea la tabla HTML
				numerosComoStringEnTablaExcel("tabla_datos");
				var contentHTML=$("#divTABLA").html();
				nombreExcel="reporte_asociados";
				generarExcelConJqueryYhtml(contentHTML, nombreExcel)
				$.fancybox.close();
			}else{
				fancyAlert("¡No se encontrarón registros!")
			
			}			
		});		
	}catch(err){
		emitirErrorCatch(err, "reporte");
	}
}