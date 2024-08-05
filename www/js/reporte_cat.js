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
		
		DAO.consultarWebServiceGet("getCertificados_CAT", parametros, function(resultsData){
			if(resultsData.length>0){
			    customizeData(resultsData);
				var camposAmostrar = [ // asigna los campos a mostrar en la grilla
					{campo:'nroCAT', alineacion:'center'},
					{campo:'tipo_movimiento', alineacion:'center'},
					{campo:'fechaEmision', alineacion:'center'},
					{campo:'fechaControlInicio', alineacion:'center'},
					{campo:'fechaControlFin', alineacion:'center'},
					{campo:'tipo_documento', alineacion:'center'},
					{campo:'nroDocumento', alineacion:'center'},
					{campo:'apellidoPaterno', alineacion:'left'},
					{campo:'apellidoMaterno', alineacion:'left'},
					{campo:'primerNombre', alineacion:'left'},
					{campo:'segundoNombre', alineacion:'left'},
					{campo:'placa', alineacion:'center'},
					{campo:'location', alineacion:'center'},
					{campo:'categoria_vehiculo', alineacion:'center'},
					{campo:'uso_vehiculo', alineacion:'center'},
					{campo:'clase_vehiculo', alineacion:'center'},
					{campo:'prima', alineacion:'center'},
					{campo:'prima_aporte_riesgos', alineacion:'center'},
					{campo:'prima_aporte_gastos', alineacion:'center'},
					{campo:'aporte', alineacion:'center'},
					{campo:'total', alineacion:'center'},
					{campo:'estado', alineacion:'left'}
				];
				crearFilasHTML("tabla_datos", resultsData, camposAmostrar, false, 12); // crea la tabla HTML
				numerosComoStringEnTablaExcel("tabla_datos");
				var contentHTML=$("#divTABLA").html();
				nombreExcel="reporte_CATS";
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

function customizeData(resultsData) {
    try {

        for(var i=0; i < resultsData.length; i++) {

            resultsData[i]['tipo_documento'] = resultsData[i].tipoPersona == 'N' ? "01" : "06";
            resultsData[i]['apellidoPaterno'] = resultsData[i].tipoPersona == 'J' ? resultsData[i].razonSocial : resultsData[i].apellidoPaterno;

            resultsData[i]['primerNombre'] = '';
            resultsData[i]['segundoNombre'] = '';

            var nombres = resultsData[i].nombres;
            var separar_nombres = nombres.split(" ");
            if(separar_nombres.length > 0) {
                var primerNombre = separar_nombres[0].trim();
                resultsData[i]['primerNombre'] = primerNombre;
                if(separar_nombres.length > 1) {
                    var otros_nombres = nombres.replace(primerNombre, '').trim();
                    resultsData[i]['segundoNombre'] = otros_nombres;
                }
            }

            resultsData[i]['prima_aporte_riesgos'] = resultsData[i].prima * 0.8;
            resultsData[i]['prima_aporte_gastos'] = resultsData[i].prima * 0.2;
            resultsData[i]['total'] = resultsData[i].prima + resultsData[i].aporte;
            resultsData[i]['estado'] = resultsData[i].prima == 15 || resultsData[i].prima == 0 ? 'DUPLICADO' : 'VENTA';
			if(resultsData[i]['estado'] == 'DUPLICADO') {
				resultsData[i]['prima_aporte_riesgos'] = 0.0;
				resultsData[i]['prima_aporte_gastos'] = 0.0;
			}
        }
    } catch(err){
     		emitirErrorCatch(err, "customizeData");
    }
}