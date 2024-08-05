var codEvento = $_GET("codEvento");
var codAgraviado = $_GET("codAgraviado");
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var arrayDatos = new Array();
var dataTable = undefined;
var tipoAsistList = { "E": "Emergencia", "U": "Urgencia", "I": "Internamiento" };
var perfilUsuario = parent.window.perfilUsuario1
var etapaList = {
	1: "Gastos médicos",
	2: "Por incapacidad temporal",
	3: "Por invalidez Permanente",
	4: "Por muerte",
	5: "Por sepelio"
}
var estadoCartaGarantia = {
	'N': 'Nueva',
	'P': 'Impresa',
	'A': 'Anulada',
	// Los siguientes estados de cartas se agregaron debido a que se agregaron muchas cartas de garantia mediante los procedures (pasarCartas) (10/06/2017)
	'F': 'Facturada',
	'C': 'Cancelada',
	'O': 'Observada'
};
var accion = $_GET('accion');

cargarInicio(function () {
	$("#idRevertirEditar").hide()
	var parametros = "&codEvento=" + codEvento +
		"&codAgraviado=" + codAgraviado;
	DAO.consultarWebServiceGet("getListaCartas", parametros, listarCartas);
	if (accion == 'AC') {
		$("#btnAnular").click(anularCarta);
		$("#btnAnular").css("left", "824px");
		$("#btnAnularPDF").click(anularPDF);
		$("#btnAnularPDF").css("left", "724px");
		$("#btnEditar").css("display", "none");
	}
	if (accion == 'EC') {
		$("#btnEditar").click(editarCarta);
		$("#btnAnular").css("display", "none");
		$("#btnAnularPDF").css("display", "none");
		if (perfilUsuario == '1' || perfilUsuario == '2') {
			$("#idRevertirEditar").show()
			$("#idRevertirEditar").click(revertirEditar)
		}
	}
	$("#pdfCarta").click(PDFCarta);
});
function anularPDF() { // Revierte el estado de la carta seleccionada de Impreso a Nueva
	try {
		if (filaSeleccionada == undefined) {
			fancyAlert("¡Debe seleccionar una carta!");
		} else {
			var carta = arrayDatos[filaSeleccionada];
			var nOrdenPago = carta.nroOrdenPago;
			if (carta.estado == 'P') {// Impreso
				if (nOrdenPago === null) {
					esCartaPrevia(function (esPrevia) {
						if (esPrevia == false) {
							fancyConfirm("¿Proceder con la anulación de Impresion?", function (rpta) {
								if (rpta) {
									var carta = arrayDatos[filaSeleccionada];
									var parametros = "&idCarta=" + carta.idCarta;
									DAO.consultarWebServiceGet("anularPDF", parametros, function (data) {
										if (data[0] > 0) {
											arrayDatos[filaSeleccionada].estado = 'N';
											listarCartas(arrayDatos);
										} else {
											fancyAlert("¡Operación Fallida!")
										}
									})
								}
							});
						}
					})
				} else {
					fancyAlert("¡La Carta de Garantia ha sido asignada a una Orden de Pago! No se puede cambiar estado...");
				}
			} else {
				fancyAlert("¡La carta seleccionada no esta impresa!")
			}
		}
	} catch (err) {
		emitirErrorCatch(err, "anularPDF");
	}
}
function esCartaPrevia(func) {
	try {
		if (filaSeleccionada == undefined) {
			fancyAlert("¡Debe seleccionar una carta!");
		} else {
			var carta = arrayDatos[filaSeleccionada];
			var parametros = "&idCarta=" + carta.idCarta +
				"&codEvento=" + carta.codEvento +
				"&codAgraviado=" + carta.codAgraviado;
			DAO.consultarWebServiceGet("verificarCartaPrevia", parametros, function (data) {
				var result = false;
				if (data.length > 0) {
					var nroCarta = LPAD(data[0].idCarta, numeroLPAD);
					if (data[0].primeraCarta == 'S' && data[0].nroCarta != "") {
						nroCarta = data[0].nroCarta;
					}
					fancyAlert("¡Esta carta se encuentra registrada como carta previa (En la carta " + nroCarta + ")!")
					result = true;
				}
				if (typeof func == "function") {
					func(result);
				}
			});
		}
	} catch (err) {
		emitirErrorCatch(err, "esCartaPrevia")
	}
}
function cambiarEstadoCarta(idCarta, estado, callback) {
	var parametros = "&idCarta=" + idCarta + "&estado=" + estado
	DAO.consultarWebServiceGet("cambiarEstadoCarta", parametros, function (data) {
		var affectedRows = data[0]
		callback(affectedRows)
	});

}
function revertirEditar() {
	try {
		if (filaSeleccionada == undefined) {
			fancyAlert("¡Debe seleccionar una carta!");
		} else {
			var registroSeleccionado = arrayDatos[filaSeleccionada];
			var estado = registroSeleccionado.estado;
			var nOrdenPago = registroSeleccionado.nroOrdenPago;
			if (estado == "P") { // Solo se revierte cartas en estado IMPRESO
				if (nOrdenPago === null) {
					var idCarta = registroSeleccionado.idCarta;
					cambiarEstadoCarta(idCarta, "N", function (affectedRows) {
						if (affectedRows > 0) {
							var cartaSeleccionada = filaSeleccionada;
							arrayDatos[filaSeleccionada].estado = 'N'
							listarCartas(arrayDatos)
							seleccionarFila(cartaSeleccionada)
							fancyConfirm("¡La Carta fue revertida Exitosamente!<br>¿Desea continuar con la edición de la carta?", function (rpta) {
								if (rpta) {
									editarCarta()
								}
							})
						} else {
							fancyAlert("¡No se pudo actualizar la carta!")
						}
					})
				} else {
					fancyAlert("¡La Carta de Garantia ha sido asignada a una Orden de Pago! No se puede revertir estado...");
				}
			} else {
				fancyAlert("¡Solo se pueden revertir cartas en estado IMPRESO!");
			}
		}

	} catch (err) {
		emitirErrorCatch(err, "revertirEditar")
	}
}
function PDFCarta() {
	try {
		if (filaSeleccionada == undefined) {
			fancyAlert("¡Debe seleccionar una carta!");
		} else {
			var registroSeleccionado = arrayDatos[filaSeleccionada];
			var idCarta = registroSeleccionado.idCarta;
			var nombreUsuario = parent.$("#datosUsuario").children().find("span").html();
			var fechaHoraImpresion = convertirAfechaString(new Date(), true, false, 12);

			window.open("wbs_as-sini?funcion=generarCartaGarantia&idCarta=" + idCarta +
				"&nombreUsuario=" + nombreUsuario +
				"&fechaHoraImpresion=" + fechaHoraImpresion, '_blank'); // EMITE EL PDF
		}
	} catch (err) {
		emitirErrorCatch(err, "PDFCarta");
	}
}
function anularCarta() {
	try {
		if (filaSeleccionada == undefined) {
			fancyAlert("¡Debe seleccionar una carta!");
		} else {
			var registroSeleccionado = arrayDatos[filaSeleccionada];
			var estado = registroSeleccionado.estado;
			if (estado == "N") {
				var codAgraviado = registroSeleccionado.codAgraviado;
				var idCarta = registroSeleccionado.idCarta;
				parent.abrirVentanaFancyBox(850, 655, "anular_editar_carta?idCarta=" + idCarta + "&accion=" + accion + "&codAgraviado=" + codAgraviado +
					"&pagina=eventos_lista_cartas&codEvento=" + codEvento + "&height=" + $(document).height() + "&width=" + $(document).width(), true);
			} else {
				fancyAlert("¡La carta seleccionada ya se encuentra anulada o Impresa!");
			}
		}
	} catch (err) {
		emitirErrorCatch(err, "anularCarta");
	}
}
function editarCarta() {
	try {
		if (filaSeleccionada == undefined) {
			fancyAlert("¡Debe seleccionar una carta!");
		} else {
			var registroSeleccionado = arrayDatos[filaSeleccionada];
			var estado = registroSeleccionado.estado;
			if (estado == "N") { // edita solo cartas que no esten anuladas
				var codAgraviado = registroSeleccionado.codAgraviado;
				var idCarta = registroSeleccionado.idCarta;
				parent.abrirVentanaFancyBox(850, 655, "anular_editar_carta?idCarta=" + idCarta + "&accion=" + accion + "&codAgraviado=" + codAgraviado +
					"&pagina=eventos_lista_cartas&codEvento=" + codEvento + "&height=" + $(document).height() + "&width=" + $(document).width(), true);
			} else {
				if (estado == 'A') {
					fancyAlert("¡No se pueden editar cartas anuladas!");
				} else {
					fancyAlert("¡No se pueden editar cartas en estado 'Impreso' o no es una carta 'Nueva'!");
				}

			}
		}
	} catch (err) {
		emitirErrorCatch(err, "editarCarta");
	}
}
function listarCartas(resultsData) {
	try {

		for (var i = 0; i < resultsData.length; i++) {
			resultsData[i].etapa = etapaList[resultsData[i].idCobertura];
			//resultsData[i].asistencia=tipoAsistList[resultsData[i].tipoAsistencia];
			resultsData[i].estadoCarta = estadoCartaGarantia[resultsData[i].estado]; // obtiene la descripcion del estado de la carta
			resultsData[i].monto = "S/. " + resultsData[i].monto;
			if (resultsData[i].idPrimeraProyeccion == 0) {
				resultsData[i].nroCarta = LPAD(resultsData[i].idCarta, numeroLPAD);
			}
			resultsData[i].nosocomio_funeraria = resultsData[i].nombreNosocomio;
			/*
			if(resultsData[i].idCobertura == '5'){ // si es sepelio se toma el nombre de la funeraria en vez del nosocomio
				resultsData[i].nosocomio_funeraria = resultsData[i].nombreFuneraria;
			}*/
		}
		arrayDatos = resultsData;
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{ campo: 'etapa', alineacion: 'center' },
			{ campo: 'nosocomio_funeraria', alineacion: 'center' },
			{ campo: 'nroCarta', alineacion: 'center' },
			{ campo: 'estadoCarta', alineacion: 'center' },
			{ campo: 'fecha', alineacion: 'center' },
			{ campo: 'asistencia', alineacion: 'center' },
			{ campo: 'monto', alineacion: 'center' }
		];
		if (dataTable != undefined) {
			dataTable.destroy();
		}
		crearFilasHTML("tabla_cartas", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
		var columns = [
			{ "width": "20%" },
			{ "width": "22%" },
			{ "width": "13%" },
			{ "width": "12%" },
			{ "width": "8%" },
			{ "width": "15%" },
			{ "width": "10%" }
		];
		dataTable = parseDataTable("tabla_cartas", columns, 235, false, false, false, false);
		$.fancybox.close();
	} catch (err) {
		emitirErrorCatch(err, "listarCartas");
	}
}