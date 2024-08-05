var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){
	idLocal = parent.idLocal;
}
var DAO = new DAOWebServiceGeT("wbs_as-sini") // Objeto del web service de Siniestros
cargarInicio(function(){
    $("#btnDescargar").click(reporte)
    $("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});

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
			"&fechaHasta="+dateTimeFormat($("#fechaHasta").val());
		DAO.consultarWebServiceGet("getListaCartasPendientes", parametros, function(datos){
			if(datos.length>0){
                $("#tabla_datos > tbody").html(""); // reinicia
                var camposAmostrar = [ // asigna los campos a mostrar en la grilla
                    {campo:'idCarta', alineacion:'center'},
                    {campo:'nroCarta', alineacion:'center'},
                    {campo:'fecha', alineacion:'center'},
                    {campo:'codEvento', alineacion:'center'},
                    {campo:'codAgraviado', alineacion:'center'},
                    {campo:'razonSocial', alineacion:'center'},
                    {campo:'nroCAT', alineacion:'center'},
                    {campo:'diagnostico', alineacion:'center'},
                    {campo:'diagnosticoInforme', alineacion:'center'},
                    {campo:'diagnosticoAccidente', alineacion:'left'},
                    {campo:'nombreAgraviado', alineacion:'left'},
                    {campo:'monto', alineacion:'center'}
                ];
                crearFilasHTML("tabla_datos", datos, camposAmostrar, false, 10); // crea la tabla HTML
				var contentHTML=$("#divTABLA").html();
                ///$("#tabla_datos").table2csv({
                ///    filename: 'CartasGarantia.csv'
                ///});
				nombreExcel="ListaCG";
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
