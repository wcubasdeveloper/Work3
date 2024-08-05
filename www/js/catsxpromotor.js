var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if (idPerfil != 1 && idPerfil != 2) {
	idLocal = parent.idLocal;
}
var DAO = new DAOWebServiceGeT("wbs_ventas")
cargarInicio(function () {
	$("#idInicio").prop("readonly", true);
	$("#idFin").prop("readonly", true);
	$("#idInicio").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
	$("#idFin").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
	$("#idCmbPromotor").attr("requerido", "Promotor");
	$("#btnBuscar").click(reportarCertificados);
	var parametros = "&idLocal=" + idLocal;
	DAO.consultarWebServiceGet("getPromotores", parametros, function (arrayUsuarios) { // obtiene los promotores segun el local
		var campos = { "keyId": 'idPromotor', "keyValue": 'nombreUsuario' }
		agregarOpcionesToCombo("idCmbPromotor", arrayUsuarios, campos);
		$("#idCmbPromotor").select2();
		$.fancybox.close();
	});
});

function reportarCertificados() {
	try {
		if (validarCamposRequeridos("Layer1")) {
			var parametros = "&idPromotor=" + $("#idCmbPromotor").val() +
				"&fechaDesde=" + dateTimeFormat($("#idInicio").val()) +
				"&fechaHasta=" + dateTimeFormat($("#idFin").val());

			DAO.consultarWebServiceGet("catsXpromotor", parametros, generarReporte)
		}
	} catch (err) {
		emitirErrorCatch(err, "reportarCertificados");
	}
}
function generarReporte(data) {
	try {

		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{ campo: 'nroCAT', alineacion: 'center' },
			{ campo: 'fechaEmision', alineacion: 'center' },
			{ campo: 'placa', alineacion: 'center' },
			{ campo: 'comision', alineacion: 'left' },
			{ campo: 'prima', alineacion: 'left' },
			{ campo: 'aporte', alineacion: 'left' },
			{ campo: 'total', alineacion: 'left' },
			{ campo: 'nombreConcesionario', alineacion: 'left' }
		];
		crearFilasHTML("tabla_datos", data, camposAmostrar, false, 12); // crea la tabla HTML
		// agrega una funcion CSS a la tabla HTML para que los numeros de Guia se muestren correctamente en el excel sin eliminar los ceros a la izquierda
		// por ejemplo la guia 005612 en el excel se mostraria solo como 5612 (se elimina los 2 ceros), pero al agregar esta funcion se mostrara : 005612
		numerosComoStringEnTablaExcel("tabla_datos");
		var contentHTML = "<H3>PROMOTOR: " + $("#idCmbPromotor option:selected").text() + "</H3><BR>" + $("#divTABLA").html();
		nombreExcel = "CATs activados por promotor " + $("#idCmbPromotor option:selected").text();
		generarExcelConJqueryYhtml(contentHTML, nombreExcel)
		$.fancybox.close();
	} catch (err) {
		emitirErrorCatch(err, "generarReporte")
	}
}