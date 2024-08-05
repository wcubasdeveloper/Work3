var DAO = new DAOWebServiceGeT("wbs_ventas") // Objeto del web service de Ventas
var modulo = "Certificado";
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion
cargarInicio(function(){
	$("#idConFechaLiqui").change(checkFechaLiquidacion);
	$("#idTipoFiltro").change(tipoBusqueda);
    $("#btnExportar").click(exportResults)
	$("#btnBuscar").click(function(){
		paginacion.reiniciarPaginacion();
		listar();
	});
	$("#idTipoFiltro").change();
	$("#btnBuscar").click();
    $("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	
});
function tipoBusqueda(){
	try{
		var tipoBusqueda = $("#idTipoFiltro").val();
		switch(tipoBusqueda){
			case 'T':// TODOS
				$("#nombreAsociado").val("");
				$("#docAsociado").val("");
				$("#fechaDesde").val("");
				$("#fechaHasta").val("");
				$("#idConFechaLiqui").prop("checked", true);
				$("#panelAsociado").css("display", "none");
				$("#panelFechas").css("display", "none");		
				$("#btnBuscar").focus();
				$("#idTipoFiltro").focus();
				break;
			case 'A':// Por asociado
				$("#fechaDesde").val("");
				$("#fechaHasta").val("");
				$("#idConFechaLiqui").prop("checked", true);
				$("#panelFechas").css("display", "none");
				
				$("#nombreAsociado").val("");
				$("#docAsociado").val("");
				$("#panelAsociado").css("display", "block");
				$("#panelAsociado").css("top", "22px");
				$("#docAsociado").focus();
				$("#nombreAsociado").focus();
				break;
			case 'F': // por fecha de liquidacion
				$("#nombreAsociado").val("");
				$("#docAsociado").val("");
				$("#panelAsociado").css("display", "none");
				
				$("#fechaDesde").val("");
				$("#fechaHasta").val("");
				$("#idConFechaLiqui").prop("checked", true);
				$("#panelFechas").css("display", "block");				
				$("#panelFechas").css("top", "22px");
								
				$("#fechaHasta").focus();
				$("#fechaDesde").focus();				
				break;
		}
	}catch(err){
		emitirErrorCatch(err, "tipoBusqueda");
	}
}
function checkFechaLiquidacion(){
	try{
		var confechaLiquidacion = $("#idConFechaLiqui").prop("checked")				
		if(!confechaLiquidacion){
			$(".fechaComponent").css("display", "none");			
		}else{
			$(".fechaComponent").css("display", "block");
		}
	}catch(err){
		emitirErrorCatch(err, "checkFechaLiquidacion");
	}
}
function cleanDate(idInput){ // Limpia el string de los campos fechas
    try{
        $("#"+idInput).val("");
    }catch(err){
        emitirErrorCatch(err, "cleanDate()")
    }
};
function buscar(){
	try{
		listar();		
	}catch(err){
		emitirErrorCatch(err, "buscar")
	}
}
function listar(){
	try{
		var campoAlineacionArray = [ // asigna los campos a mostrar en la grilla
			{campo:'nroCAT', alineacion:'center'},
			{campo:'fechaLiquidacion', alineacion:'center'},
			{campo:'fechaInicio', alineacion:'center'},
			{campo:'fechaCaducidad', alineacion:'center'},
			{campo:'fechaControlInicio', alineacion:'center'},
			{campo:'fechaControlFin', alineacion:'center'},
			{campo:'prima', alineacion:'center'},
			{campo:'aporte', alineacion:'center'},
			{campo:'comision', alineacion:'center'},
			{campo:'nombreAsociado', alineacion:'left'},
			{campo:'nroDocumento', alineacion:'center'},
			{campo:'nombreSede', alineacion:'center'},
			{campo:'nombreConcesionario', alineacion:'left'},
			{campo:'placa', alineacion:'center'}
		];
		var parametros="&fechaDesde="+dateTimeFormat($("#fechaDesde").val())+
			"&fechaHasta="+dateTimeFormat($("#fechaHasta").val())+
			"&nombre="+$("#nombreAsociado").val()+
			"&doc="+$("#docAsociado").val()+
			"&tipoFiltro="+$("#idTipoFiltro").val()+
			"&confechaLiquidacion="+$("#idConFechaLiqui").prop("checked");
		
		var arrayColumnWidth=[
            { "width": "8%" },
            { "width": "8%" },
			{ "width": "8%" },
			{ "width": "8%" },
			{ "width": "8%" },
			{ "width": "8%" },
			{ "width": "8%" },
            { "width": "8%" },
			{ "width": "8%" },
			{ "width": "8%" },
			{ "width": "8%" },
			{ "width": "8%" },
			{ "width": "8%" },
			{ "width": "8%" }
		];
		var orderByColum=[0, "asc"];
		var height=300;
		var idTabla = "tabla_datos";	
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, parametros, false, true, false);		
		
	}catch(err){
		emitirErrorCatch(err, "listar");
	}
}
function exportResults(){
	try{
		var contentHTML=$("#divTABLA").html();
		nombreExcel="Certificados";
		generarExcelConJqueryYhtml(contentHTML, nombreExcel)
		$.fancybox.close();		
	}catch(err){
		emitirErrorCatch(err, "exportResults")
	}
}