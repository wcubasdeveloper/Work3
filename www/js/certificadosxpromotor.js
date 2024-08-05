var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){
	idLocal = parent.idLocal;
}
var DAO = new DAOWebServiceGeT("wbs_ventas")
cargarInicio(function(){
	$("#idInicio").prop("readonly", true);
	$("#idFin").prop("readonly", true);
	$("#idInicio").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#idFin").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#idCmbPromotor").attr("requerido", "Promotor");
	$("#btnBuscar").click(reportarCertificados);
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getPromotores", parametros, function(arrayUsuarios){ // obtiene los promotores segun el local
		var campos =  {"keyId":'idUsuario', "keyValue":'nombreUsuario'}
		agregarOpcionesToCombo("idCmbPromotor", arrayUsuarios, campos);	
		$("#idCmbPromotor").select2();
		$.fancybox.close();
	});
});

function reportarCertificados(){
	try{
		if(validarCamposRequeridos("Layer1")){
			var parametros = "&idPromotor="+$("#idCmbPromotor").val()+
				"&fechaDesde="+dateTimeFormat($("#idInicio").val())+
				"&fechaHasta="+dateTimeFormat($("#idFin").val());
				
			DAO.consultarWebServiceGet("certificadosXpromotor", parametros, generarReporte)
		}				
	}catch(err){
		emitirErrorCatch(err, "reportarCertificados");
	}
}
function generarReporte(data){
	try{
		for(var i=0; i<data.length; i++){
			if(data[i].tipoOperacion == 'SAL'){
				data[i].operacion = 'SALIDA';
				data[i].origen = data[i].almacen;
			}else{
				data[i].operacion = 'DEVOLUCION';
				data[i].origen = data[i].concesionario;
			}			
		}
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{campo:'nroCertificado', alineacion:'center'},
			{campo:'idGuia', alineacion:'center', LPAD:true },
			{campo:'operacion', alineacion:'center'},
			{campo:'fechaOperacion', alineacion:'center'},
			{campo:'origen', alineacion:'left'}
		];
		crearFilasHTML("tabla_datos", data, camposAmostrar, false, 12); // crea la tabla HTML
		// agrega una funcion CSS a la tabla HTML para que los numeros de Guia se muestren correctamente en el excel sin eliminar los ceros a la izquierda
		// por ejemplo la guia 005612 en el excel se mostraria solo como 5612 (se elimina los 2 ceros), pero al agregar esta funcion se mostrara : 005612
		numerosComoStringEnTablaExcel("tabla_datos");
		var contentHTML="<H3>PROMOTOR: "+$("#idCmbPromotor option:selected").text()+"</H3><BR>"+$("#divTABLA").html();
		nombreExcel="Certificados por promotor "+$("#idCmbPromotor option:selected").text();
		generarExcelConJqueryYhtml(contentHTML, nombreExcel)
		$.fancybox.close();				
	}catch(err){
		emitirErrorCatch(err, "generarReporte")
	}
}