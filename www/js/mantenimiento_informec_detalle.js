var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Informec";

cargarInicio(function () {
	$("#btnGuardar").click(guardar);
	$("#txtUIT").addClass("solo-decimal");
	$("#txtSueldo").addClass("solo-decimal");

	// Agrega campos de tipo entero:
	$(".solo-numero").keypress(function (e) { // permite ingresar solo numeros
		return textNumber(e);
	});
	$(".solo-decimal").keypress(function (e) { // permite ingresar numero REAL
		return textDecimal(e);
	});
	$(".solo-alfanum").keypress(function (e) { // permite caract. alfanumerico
		return alfanumerico(e);
	});
	$(".solo-alfanum1").keypress(function (e) { // permite alfanumerico + " -"
		return alfanumerico1(e);
	});
	if (parseFloat(idRegistro) > 0) {
		$("#idID").val(idRegistro);
		cargarInfoAbstracto(DAO, modulo, idRegistro, function (data) {
			$("#txtEvento").val(data[0].codEvento); //solo ver
			$("#txtUIT").val(data[0].UIT);
			$("#txtSueldo").val(data[0].sueldoMinVital);
			$.fancybox.close();
		});
	} else {
		//solo Edicion => cierra ventana y regresa
		$.fancybox.close();
	}
});
function guardar() {
	try {
		fancyConfirm("¿Actualiza datos?", function (rpta) {
			if (rpta) {
				var parametros = "&UIT=" + $("#txtUIT").val() +
					"&sueldoMinVital=" + $("#txtSueldo").val() +
					"&idInforme=" + idRegistro;
				DAO.consultarWebServiceGet("actualizarInformec", parametros, function (data) {
					if (data[0] > 0) {
						realizoTarea = true;
						mensaje = "¡Se actualizarón los cambios correctamente!"
						fancyAlertFunction(mensaje, function () {
							parent.$.fancybox.close();
						})
					} else {
						fancyAlert("¡Operación Fallida!")
					}
				});
			}
		});

	} catch (err) {
		emitirErrorCatch(err, "guardar");
	}
}