var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Informec";
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
				var id = arrayRegistros[filaSeleccionada]["idInforme"];
				abrirVentanaFancyBox(widthMant, heightMant, "mantenimiento_informec_detalle?id=" + id, true, function (data) {
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
			{ campo: 'idInforme', alineacion: 'center' },
			{ campo: 'codEvento', alineacion: 'center' },
			{ campo: 'nroCAT', alineacion: 'center' },
			{ campo: 'placa', alineacion: 'center' },
			{ campo: 'fechaInforme', alineacion: 'center' },
			{ campo: 'UIT', alineacion: 'center' },
			{ campo: 'sueldoMinVital', alineacion: 'center' }
		];
		var arrayColumnWidth = [
			{ "width": "15%" },
			{ "width": "15%" },
			{ "width": "14%" },
			{ "width": "14%" },
			{ "width": "14%" },
			{ "width": "14%" },
			{ "width": "14%" }
		];
		var orderByColum = [1, "asc"];
		var height = 320;
		var idTabla = "tabla_datos";
		var params = "&codEvento=" + $("#idBuscarEvento").val().trim()
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, params, false, true, false);
	} catch (err) {
		emitirErrorCatch(err, "listar");
	}
}