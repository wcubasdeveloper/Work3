var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion
var dataTable = undefined;
var arrayDatos;
cargarInicio(function () {
	$("#btnBuscar").click(function () {
		paginacion.reiniciarPaginacion();
		buscar();
	})
	$("#fechaDesde").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
	$("#fechaHasta").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
	$("#fechaHasta").val(convertirAfechaString(new Date(), false));
	$("#btnRevInf").click(revisarInforme);
	//$("#btnRevProv").click(revisarProvision); //mostrado dentro Nuevo/Edicion Carta
	$("#btnAnularCarta").click(anularCarta);
	$("#btnEditarCarta").click(editarCarta);
	$("#btnNuevaCarta").click(nuevaCarta);
	$("#btnTerminar").click(terminarEvento);
	$("#btnRevertir").click(revertirEvento);
	buscar();
})
function terminarEvento() { // finaliza el ciclo de un evento
	try {
		if (filaSeleccionada == undefined) { // filaSeleccionada = al evento seleccionado en la grilla.
			fancyAlert("Debe seleccionar un evento");
		} else {
			if (arrayDatos[filaSeleccionada].idInforme > 0) {
				if (arrayDatos[filaSeleccionada].estadoCobertura == 'T') {
					fancyAlert("¡El asociado desistió de usar su certificado!")
					return;
				}
				if (arrayDatos[filaSeleccionada].estadoCobertura == 'F') {
					fancyAlert("¡El evento ya ha sido terminado!");
					return;
				}
				abrirVentanaFancyBox(400, 300, "motivo_terminado?codEvento=" + arrayDatos[filaSeleccionada].codEvento + "&idUsuarioUpdate=" + parent.idUsuario, true, function (data) { // accion = E (Editar Evento)
					if (data[0] > 0) {
						buscar();
					}
				});
			} else {
				fancyAlert("¡Solo se puede terminar eventos con informes!")
			}
		}
	} catch (err) {
		emitirErrorCatch(err, "terminarEvento");
	}
}
function revertirEvento() { // finaliza el ciclo de un evento
	try {
		if (filaSeleccionada == undefined) { // filaSeleccionada = al evento seleccionado en la grilla.
			fancyAlert("Debe seleccionar un evento");
		} else {
			var estadoCobertura = arrayDatos[filaSeleccionada].estadoCobertura
			if (estadoCobertura != 'F') {
				fancyAlert("¡El evento aun NO ha sido terminado!");
				return;
			}
			fancyConfirm("El Evento regresara al estado (C)oberturable ¿Es correcto?",
				function (rpta) {
					if (rpta) {
						var codEvento = arrayDatos[filaSeleccionada].codEvento;
						var idUsuarioUpdate = parent.idUsuario;
						var parametros = "&codEvento=" + codEvento + "&idUsuarioUpdate=" + idUsuarioUpdate;
						DAO.consultarWebServiceGet("revertirEvento", parametros, function (data) {
							if (data[0] > 0) {
								buscar();
							} else {
								fancyAlert("¡Operación Fallida!")
							}
						})
					}
				})
		}
	} catch (err) {
		emitirErrorCatch(err, "revertirEvento");
	}
}
function buscar() { //** Realiza la busqueda de eventos segun los filtros seleccionados : Cod Evento, Placa, CAT, Rango de Fechas
	try {
		// obtiene valores de filtros
		var codEvento = $("#codEvento").val();
		var placa = $("#placa").val();
		var cat = $("#cat").val();
		var fechaDesde = dateTimeFormat($("#fechaDesde").val());
		var fechaHasta = dateTimeFormat($("#fechaHasta").val());

		var parametros = "&codEvento=" + codEvento +
			"&placa=" + placa +
			"&cat=" + cat +
			"&fechaDesde=" + fechaDesde +
			"&fechaHasta=" + fechaHasta;
		DAO.consultarWebServiceGet("getEventosConInformeCerrado", parametros, listar, true, paginacion); // consulta y muestra los resultado. La funcion "listar" es el callback. Activa la paginacion
	} catch (err) {
		emitirErrorCatch(err, "buscar");
	}
}
function listar(resultsData) { // Lista los resultados de la busqueda de los eventos en la grilla con su paginacion
	try {
		for (var i = 0; i < resultsData.length; i++) {
			resultsData[i].direccionBreve = resultsData[i].lugarAccidente.substring(0, 35);
			if (getLenth(resultsData[i].lugarAccidente) > 35) {
				resultsData[i].direccionBreve = resultsData[i].direccionBreve + "....";
			}
			resultsData[i].asociado = "";
			switch (resultsData[i].tipoPersona) {
				case 'N':
					resultsData[i].asociado = resultsData[i].nombreAsociado;
					break;
				case 'J':
					resultsData[i].asociado = resultsData[i].razonSocial;
					break;
			}
			if (resultsData[i].estadoCobertura == 'R') {
				resultsData[i].recupero = resultsData[i].estadoCobertura;
			} else {
				resultsData[i].recupero = ''
			}

			resultsData[i].causal = resultsData[i].causal1
			if (resultsData[i].causal == null) {
				resultsData[i].causal = resultsData[i].causal2
			}

		}
		arrayDatos = resultsData;
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{ campo: 'estadoCobertura', alineacion: 'center' },
			{ campo: 'codEvento', alineacion: 'center' },
			{ campo: 'causal', alineacion: 'left' },
			{ campo: 'fechaAccidente', alineacion: 'center' },
			{ campo: 'placa', alineacion: 'center' },
			{ campo: 'nroCAT', alineacion: 'center' },
			{ campo: 'asociado', alineacion: 'left' },
			{ campo: 'direccionBreve', alineacion: 'left' }
		];
		if (dataTable != undefined) {
			dataTable.destroy();
		}
		crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
		// pinta de rojo todas las filas donde el evento este como "R=RECUPERO"
		$("#tabla_datos > tbody >tr").each(function () {
			var estadoCobertura = $(this).find("td").eq(0).html();
			var color = ""
			if (estadoCobertura == "R") { // pintamos de rojo la fila de la tabla
				color = "red"
			}
			if (estadoCobertura == "F") {
				color = "yellow"
			}
			if (color != "") {
				$(this).css("background-color", color);
				$(this).find("td").each(function () {
					$(this).css("background-color", color);
				})
			}
		})
		var columns = [
			{ "width": "4%" },
			{ "width": "8%" },
			{ "width": "12%" },
			{ "width": "9%", "type": "date-eu" },
			{ "width": "8%" },
			{ "width": "9%" },
			{ "width": "25%" },
			{ "width": "25%" }
		];
		var orderByColumn = [1, "desc"];
		dataTable = parseDataTable("tabla_datos", columns, 300, orderByColumn, false, false, false, function () {
			if (resultsData.length > 0) {
				var numeroPaginas = resultsData[0].numeroPaginas;
				if (typeof numeroPaginas != "undefined") {
					paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function (page) {
						paginacion.paginaActual = page;
						buscar();
					});
				}
			} else {
				paginacion.cargarPaginacion(0, "pagination"); // con el metodo cargarPaginacion se implementa la implementacion. Recibe parametros @1: numero de paginas, @2: id DIV de la Paginacion
			}
		});
		$.fancybox.close();
	} catch (err) {
		emitirErrorCatch(err, "listar")
	}
}
function revisarInforme() {
	try {
		if (filaSeleccionada != undefined) {
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			var idInforme = arrayDatos[filaSeleccionada].idInforme;
			parent.abrirVentanaFancyBox(900, 415, "nuevo_editar_informe?accion=E&codEvento=" + codEvento + "&idInforme=" + idInforme + "&soloLectura=T", true, null, true);
		} else {
			fancyAlert("¡Debe seleccionar un evento!");
		}
	} catch (err) {
		emitirErrorCatch(err, "revisarInforme")
	}
}
function revisarProvision() {
	try {
		if (filaSeleccionada != undefined) {
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			parent.abrirVentanaFancyBox(780, 360, "eventos_carta_agraviados?codEvento=" + codEvento + "&accion=RP", true);
		} else {
			fancyAlert("¡Debe seleccionar un evento!");
		}
	} catch (err) {
		emitirErrorCatch(err, "revisarProvision")
	}
}
function anularCarta() {
	try {
		if (filaSeleccionada != undefined) {
			if (arrayDatos[filaSeleccionada].estadoCobertura == 'F') {
				fancyAlert("¡No se puede agregar/editar/ anular cartas a un evento terminado!");
				return;
			}
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			parent.abrirVentanaFancyBox(780, 360, "eventos_carta_agraviados?codEvento=" + codEvento + "&accion=AC", true);
		} else {
			fancyAlert("¡Debe seleccionar un evento!");
		}
	} catch (err) {
		emitirErrorCatch(err, "anularCarta")
	}
}
function editarCarta() {
	try {
		if (filaSeleccionada != undefined) {
			if (arrayDatos[filaSeleccionada].estadoCobertura == 'F') {
				fancyAlert("¡No se puede agregar/editar/ anular cartas a un evento terminado!");
				return;
			}
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			parent.abrirVentanaFancyBox(780, 360, "eventos_carta_agraviados?codEvento=" + codEvento + "&accion=EC", true);
		} else {
			fancyAlert("¡Debe seleccionar un evento!");
		}
	} catch (err) {
		emitirErrorCatch(err, "editarCarta");
	}
}
function nuevaCarta() {
	try {
		if (filaSeleccionada != undefined) {
			if (arrayDatos[filaSeleccionada].estadoCobertura == 'F') {
				fancyAlert("¡No se puede agregar/editar/ anular cartas a un evento terminado!");
				return;
			}
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			parent.abrirVentanaFancyBox(780, 360, "eventos_carta_agraviados?codEvento=" + codEvento + "&accion=NC", true);
		} else {
			fancyAlert("¡Debe seleccionar un evento!");
		}
	} catch (err) {
		emitirErrorCatch(err, "nuevaCarta");
	}
}