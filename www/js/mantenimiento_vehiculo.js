var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Vehiculo";
var heightMant = 230;
var widthMant = 550;

cargarInicio(function () {
	$("#btnBuscar").click(function () {
		paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
		buscar();
	})
	$("#btnEditar").click(function () {
		try {
			if (filaSeleccionada != undefined) {
				var id = arrayRegistros[filaSeleccionada]["idVehiculo"];
				abrirVentanaFancyBox(widthMant, heightMant, "mantenimiento_vehiculo_detalle?id=" + id, true, function (data) {
					listar(data);
				});
			} else {
				fancyAlert("¡Debe seleccionar un registro!");
			}
		} catch (err) {
			emitirErrorCatch(err, "editarAbstracto");
		}
	});
	listar();
})
function buscar() {
	try {
		listar();
	} catch (err) {
		emitirErrorCatch(err, "buscar")
	}
}
function listar() {
	try {
		var campoAlineacionArray = [
			{ campo: 'idVehiculo', alineacion: 'center' },
			{ campo: 'placa', alineacion: 'center' },
			{ campo: 'nombreCategoria', alineacion: 'left' },
			{ campo: 'nombreUso', alineacion: 'left' },
			{ campo: 'nombreClase', alineacion: 'left' },
			{ campo: 'nroSerieMotor', alineacion: 'left' },
			{ campo: 'marca', alineacion: 'left' },
			{ campo: 'modelo', alineacion: 'left' },
			{ campo: 'anno', alineacion: 'center' },
			{ campo: 'nroAsientos', alineacion: 'center' }
		];
		var arrayColumnWidth = [
			{ "width": "8%" },
			{ "width": "8%" },
			{ "width": "5%" },
			{ "width": "15%" },
			{ "width": "15%" },
			{ "width": "15%" },
			{ "width": "10%" },
			{ "width": "10%" },
			{ "width": "6%" },
			{ "width": "8%" }
		];
		var orderByColum = [1, "asc"];
		var height = 320;
		var idTabla = "tabla_datos";
		var params = "&placa=" + $("#idBuscarPlaca").val().trim()
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, params, false, true, false);
	} catch (err) {
		emitirErrorCatch(err, "listar");
	}
}