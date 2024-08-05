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
		if($("#fechaDesde").val()=="" || $("#fechaHasta").val()==""){
			fancyAlertFunction("¡Debe seleccionar el rango de fechas!", function(){
				$("#fechaDesde").focus();
			});
			return;
		}

		var parametros="&fechaDesde="+dateTimeFormat($("#fechaDesde").val())+
			"&fechaHasta="+dateTimeFormat($("#fechaHasta").val())+
			"&idSede="+$("#cmb_cono").val();
		
		DAO.consultarWebServiceGet("getCertificadosFactura", parametros, function(datos){
			if(datos.length>0){
                $("#tabla_datos > tbody").html(""); // reinicia
                var camposAmostrar = [ // asigna los campos a mostrar en la grilla
                    {campo:'nroCAT', alineacion:'center'},
                    {campo:'fechaLiquidacion', alineacion:'center'},
                    {campo:'nombreSede', alineacion:'center'},
                    {campo:'idAsociado', alineacion:'center'},
                    {campo:'nroDocumento', alineacion:'center'},
                    {campo:'tipoPersona', alineacion:'center'},
                    {campo:'nombreAsociado', alineacion:'center'},
                    {campo:'distrito', alineacion:'center'},
                    {campo:'calle', alineacion:'center'},
                    {campo:'nro', alineacion:'left'},
                    {campo:'prima', alineacion:'left'},
                    {campo:'aporte', alineacion:'center'},
                    {campo:'comision', alineacion:'center'},
                    {campo:'placa', alineacion:'left'},
                    {campo:'marca', alineacion:'center'},
                    {campo:'modelo', alineacion:'center'},
                    {campo:'anno', alineacion:'center'},
                    {campo:'nombreUso', alineacion:'center'},
                    {campo:'nombreClase', alineacion:'center'}
                ];
                crearFilasHTML("tabla_datos", datos, camposAmostrar, false, 10); // crea la tabla HTML
				var contentHTML=$("#divTABLA").html();
				nombreExcel="ListaCATS";
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
function crearFilasHTML1(idTablaHTML, datos, campoAlineacionArray, ONCLIK_FILA_SELECCIONADA, fontSize, idPrefijo){
    try{

    }catch(err){
        emitirErrorCatch(err, "crearFilasHTML");
    }
}
