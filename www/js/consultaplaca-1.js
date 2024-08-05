var dataTable;
var DAO;
cargarInicio(function () {
	DAO = new DAOWebServiceGeT("wbs_ventas_e")
	DrawCaptcha();
	$("#btnBuscar").click(buscar);
	$("#btnRefrescar").click(DrawCaptcha);
	$("#nroPlaca").attr("requerido", "Nro Placa");
	$("#nroPlaca").keyup(function () {
		convertMayusculas(this)
	});
	$("#nroPlaca").keypress(function (e) { // permite ingresar solo alfanumerico
		return alfanumerico(e);
	});
	$("#codVerificacion").attr("requerido", "codigo de Verificacion");
});
function buscar() {
	try {
		if (validarCamposRequeridos("idPanel")) {
			if (removeSpaces($("#idCaptcha").val()) == $("#codVerificacion").val()) {
				var nroPlaca = $("#nroPlaca").val();
				//if(nroPlaca.indexOf("-")>=0){
				var parametros = "&nroPlaca=" + nroPlaca;
				DAO.consultarWebServiceGet("consultaPlaca", parametros, function (datos) {
					if (datos.length == 0) {
						fancyAlert("¡Número de Placa no existe!")
					} else {
						//datos.estado="----";
						var camposAmostrar = [ // asigna los campos a mostrar en la grilla
							{ campo: 'nroCAT', alineacion: 'center' },
							{ campo: 'fechaInicio', alineacion: 'center' },
							{ campo: 'fechaCaducidad', alineacion: 'center' },
							{ campo: 'asociado', alineacion: 'left' },
							{ campo: 'placa', alineacion: 'center' },
							{ campo: 'nombreClase', alineacion: 'center' },
							{ campo: 'estado', alineacion: 'center' }
						];
						var columns = [
							{ "width": "12%" },
							{ "width": "12%" },
							{ "width": "12%" },
							{ "width": "30%" },
							{ "width": "10%" },
							{ "width": "15" },
							{ "width": "9%" }
						];
						if (dataTable != undefined) {
							dataTable.destroy();
						}
						crearFilasHTML("tabla_datos", datos, camposAmostrar, false, 12); // crea la tabla HTML
						dataTable = parseDataTable("tabla_datos", columns, 215);
						$("#oculta").css("display", "none");
						$("#nroPlaca").prop("disabled", true);
						$("#codVerificacion").prop("disabled", true);
						//$("#idPanel").css("display", "none");
						//$("#Html2").css("top", "65px");
						//$("#Html2").css("left", "33px");
						//$("#btnBuscar").css("display", "none");
						$("#btnBuscar").unbind("click");
						$("#btnBuscar").val("Nueva Busqueda");
						$("#btnBuscar").click(reiniciarBusqueda);
						$.fancybox.close();
					}
				});
				/*}else{
					fancyAlertFunction("¡Debe ingresar un guión '-' en la placa!", function(){
						$("#nroPlaca").focus();
					})
				}*/
			} else {
				fancyAlertFunction("¡Código de verificación incorrecto!", function (rpta) {
					if (rpta) {
						$("#codVerificacion").focus();
					}
				})
			}
		}
	} catch (err) {
		emitirErrorCatch(err, "buscar");
	}
}
function reiniciarBusqueda() {
	try {
		$("#nroPlaca").prop("disabled", false);
		$("#nroPlaca").val("");
		$("#codVerificacion").prop("disabled", false);
		$("#codVerificacion").val("");
		DrawCaptcha();
		$("#btnBuscar").unbind("click");
		$("#btnBuscar").val("Buscar");
		$("#btnBuscar").click(buscar);
		dataTable.destroy();
		dataTable = undefined;
		$("#tabla_datos > tbody").html("");
		$("#oculta").css("display", "block");
		$("#nroPlaca").focus();
	} catch (err) {
		emitirErrorCatch(err, "reiniciarBusqueda");
	}
}