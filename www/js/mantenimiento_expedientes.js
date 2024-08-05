var DAOV = new DAOWebServiceGeT("wbs_ventas")
var lista_proveedores;
var dataTable;
var arrayHistorial;
var infoExpediente;
cargarInicio(function () {
	cargarEstadosExpediente()
	DAOV.consultarWebServiceGet("getProveedores", "", function (proveedores) {
		lista_proveedores = proveedores;
		agregarOpcionesToCombo("idCmbProveedor", lista_proveedores, { keyValue: 'nombreProveedor', keyId: 'idProveedor' })
		//$("#idCmbProveedor").select2()
		$("#idCmbProveedor").hide()
		$("#idLabelProveedor").hide()
		$("#idBtnBuscarExpediente").click(buscarExpediente)
		$("#idBtnAnular").click(AnularExpediente)
		$("#idTXTBuscarExpediente").keypress(function (e) {
			var valor = this.value;
			return textNumber(e);
		});
		$("#idTXTBuscarExpediente").keypress(function (e) {
			var key = e.charCode || e.keyCode;
			if (key == 13) {
				buscarExpediente();
			}
		});
		$("#idBtnGuardar").click(actualizarExpediente)
		$.fancybox.close();
	})
});
function AnularExpediente() {
	try {
		// Anular expediente en estado=0
		var parametros = "&idExpediente=" + infoExpediente[0].idExpediente;
		fancyConfirm("¿Estas seguro de ANULAR el expediente?", function (estado) {
			if (estado) {
				consultarWebServiceGet("anularExpediente", parametros, function (data) {
					$.fancybox.close();
					limpiarDatos();
				})
			}
		});
	} catch (err) {
		emitirErrorCatch(err, "anularExpediente")
	}
}
function cargarEstadosExpediente() {
	try {
		var estados = []
		estados.push({ "id": "0", "descripcion": "Nuevo" })
		estados.push({ "id": "1", "descripcion": "En Proceso" })
		estados.push({ "id": "2", "descripcion": "Observado" })
		estados.push({ "id": "3", "descripcion": "Aprobado" })
		estados.push({ "id": "4", "descripcion": "Pagado" })
		agregarOpcionesToCombo("idEstado", estados, { keyValue: "descripcion", keyId: "id" });
	} catch (err) {
		emitirErrorCatch(err, "cargarEstadosExpediente")
	}
}
function buscarExpediente() {
	try {
		limpiarDatos();
		var codExpediente = $("#idTXTBuscarExpediente").val();
		var parametros = "&codigo=" + codExpediente + "&tipoBusqueda=exp"; // Busca por idExpediente
		//if(codExpediente!=''){
		consultarWebServiceGet("getExpedientes", parametros, function (data) {
			if (data.length > 0) {
				cargarInfo(data);
			} else {
				limpiarDatos();
				abrirBusquedaAvanzada();
			}
		})
		/*}else{
			fancyAlertFunction("Ingrese el Expediente a buscar", function(rpta){
				if(rpta){
					$("#idTXTBuscarExpediente").focus()
				}
			})
		}*/

	} catch (err) {
		emitirErrorCatch(err, "buscarExpediente")
	}
}
function limpiarDatos() {
	try {
		labelTextWebPlus("id_titulo", "INFORMACIÓN DEL EXPEDIENTE ");
		// Datos solo de lectura:
		//** Cabecera
		$("#idTipoExpediente").val("");
		// *** Panel Documentos
		$("#idDiasRespuesta").val("");
		$("#idObservacion").val("");
		$("#idNroExpPrevio").val("");
		$("#idNroDocRef").val("");
		$("#idNroFolios").val("");
		// ** Panel Evento
		$("#idAsociado").val("");
		$("#idAgraviado").val("");
		$("#idPlaca").val("");
		$("#idFechaEvento").val("");
		// Editar datos expediente
		$("#idFechaIngreso").val("");
		$("#idEstado").val("");
		// Editar datos del tramitador
		$("#idNombresTramitador").val("");
		$("#idApellidosTramitador").val("");
		$("#idDNI").val("");
		$("#idTelef").val("");
		$("#idDireccion").val("");
		$("#idCorreoTramitador").val("");
		// Limpiar tabla
		if (dataTable != undefined) {
			dataTable.destroy(); // elimina
		}
		dataTable = undefined;
		$("#tabla_datos > tbody").html("");
		$("#oculta").css("display", "block")
	} catch (err) {
		emitirErrorCatch(err, "limpiarDatos")
	}
}
function abrirBusquedaAvanzada() {
	try {
		abrirVentanaFancyBox(700, 470, "busqueda_expediente", true, function (data) {
			cargarInfo(data);
		})
	} catch (err) {
		emitirErrorCatch(err, "abrirBusquedaAvanzada")
	}
}
function cargarInfo(data) {
	try {

		$("#idCmbProveedor").val("")
		$("#idCmbProveedor").select2()
		$("#idCmbProveedor").show()
		$("#idCmbProveedor").hide()
		$("#idLabelProveedor").hide()
		if (data[0].estado > 0) {
			$("#idBtnAnular").hide(); //Oculta BOTON si expediente en Proceso (estado > 0')
		} else {
			$("#idBtnAnular").show(); //Muestra boton ANULAR expediente en estado='0'
		}
		switch (data[0].tipoExpediente) {
			case '1':
				data[0].tipo = 'Solicitud Reembolso por Gastos médicos';
				break;
			case '2':
				data[0].tipo = 'Solicitud Indemnización por Muerte';
				break;
			case '3':
				data[0].tipo = 'Solicitud Indemnización por Sepelio';
				break;
			case '4':
				data[0].tipo = 'Solicitud Indemnización por Incapacidad Temporal';
				break;
			case '5':
				data[0].tipo = 'Solicitud Indemnización por Invalidez Permanente';
				break;
			case '6':
				data[0].tipo = 'Solicitud de Subsanacion';
				break;
			case '7':
				data[0].tipo = 'Documento Administrativo';
				break;
			case '9':
				data[0].tipo = 'Otros';
				break;
			case '10':
				data[0].tipo = 'Solicitudes de Pago a las IPRESS';
				$("#idCmbProveedor").val(data[0].idProveedor)
				$("#idCmbProveedor").select2()
				$("#idCmbProveedor").show()
				$("#idLabelProveedor").show()
				break;
			case '11':
				data[0].tipo = 'Regularizaciones de Solicitudes';
				break;
			default:
				data[0].tipo = 'Virtual';
				break;
		}
		// Carga informacion del expediente
		$("#idTXTBuscarExpediente").val(LPAD(data[0].idExpediente, numeroLPAD))
		labelTextWebPlus("id_titulo", "INFORMACIÓN DEL EXPEDIENTE " + LPAD(data[0].idExpediente, numeroLPAD));
		$("#idTipoExpediente").val(data[0].tipoExpediente); // Tipo Expediente
		$("#idTipoExpediente").select2()
		$("#idTipoExpediente").show()
		// Muestra informacion solo de lectura en panel de evento:
		data[0].nombreAsociadoCompleto = "";
		switch (data[0].tipoPersona) {
			case 'N':
				data[0].nombreAsociadoCompleto = data[0].nombreAsociado;
				break;
			case 'J':
				data[0].nombreAsociadoCompleto = data[0].razonSocial
				break;
		}
		$("#idAsociado").val(reemplazarVacioXguiones(data[0].nombreAsociadoCompleto));
		$("#idAgraviado").val(reemplazarVacioXguiones(data[0].nombresAgraviado));
		$("#idPlaca").val(reemplazarVacioXguiones(data[0].placa));
		$("#idFechaEvento").val(reemplazarVacioXguiones(data[0].fechaAccidente));
		// Muestra informacion solo de lectura del panel Documentos
		$("#idDiasRespuesta").val(data[0].diasRespuesta);
		$("#idObservacion").val(reemplazarVacioXguiones(data[0].Observaciones));
		$("#idNroFolios").val(data[0].nroFolios);
		$("#idNroDocRef").val(reemplazarVacioXguiones(data[0].nroDocReferencia));
		if (data[0].idExpedientePrevio == null || data[0].idExpedientePrevio == 0) {
			$("#idNroExpPrevio").val("-------");
		} else {
			$("#idNroExpPrevio").val(LPAD(data[0].idExpedientePrevio, numeroLPAD));
		}
		/// Muestra informacion para editar del tramitador
		if (data[0].idPersonaTramitador == null) {
			data[0].idPersonaTramitador = 0;
		}
		if (data[0].idPersonaTramitador != 0) {
			$("#idNombresTramitador").val(data[0].nombresTramitador);
			$("#idApellidosTramitador").val(data[0].apellidosTramitador);
			$("#idDNI").val(data[0].nroDocumento);
			$("#idTelef").val(quitarEspaciosBlanco(data[0].telefonoMovil));
			$("#idDireccion").val(quitarEspaciosBlanco(data[0].direccion));
			$("#idCorreoTramitador").val(quitarEspaciosBlanco(data[0].email));

			$("#idNombresTramitador").attr("requerido", "Nombres");
			$("#idApellidosTramitador").attr("requerido", "Apellidos");
			$("#idDNI").attr("requerido", "DNI");
			$("#idTelef").attr("requerido", "Telefono");
			$("#idDireccion").attr("requerido", "Direccion");
			$("#idCorreoTramitador").attr("requerido", "Correo");
		} else {
			$("#idNombresTramitador").attr("requerido", "");
			$("#idApellidosTramitador").attr("requerido", "");
			$("#idDNI").attr("requerido", "");
			$("#idTelef").attr("requerido", "");
			$("#idDireccion").attr("requerido", "");
			$("#idCorreoTramitador").attr("requerido", "");
		}
		// Muestra informacion en panel para editar datos del expediente
		$("#idFechaIngreso").val(data[0].fechaExpediente);
		$("#idFechaIngreso").datetimepicker({ lan: 'es', format: 'd/m/Y H:i', timepicker: true, step: 5, closeOnDateSelect: false });
		$("#idFechaIngreso").bind("change keyup", function () {
			var nameElemento = $(this).attr("name");
			$("input[name='" + nameElemento + "']").val(this.value);
		})
		$("#idEstado").val(data[0].estado);

		infoExpediente = data;
		// Busca el historial del expediente
		buscarHistorial(data[0].idExpediente);

	} catch (err) {
		emitirErrorCatch(err, "cargarInfo")
	}
}
function buscarHistorial(idExpediente) {
	try {
		var parametros = "&idExpediente=" + idExpediente;
		consultarWebServiceGet("getHistorialByExpediente", parametros, function (data) {
			cargarTablaHistorial(data);
		})
	} catch (err) {
		emitirErrorCatch(err, "buscarHistorial")
	}
}
function cargarTablaHistorial(data) {
	try {
		fancyAlertWait("Cargando");
		for (var i = 0; i < data.length; i++) {
			data[i].fechaIngreso = convertirAfechaString(data[i].fechaIngreso, true, false);
			data[i].campoFechaIngreso = "<input type='text' value='" + data[i].fechaIngreso + "' class='date' name='fecha_" + i + "' idHistorial='" + data[i].idHistorial + "' style='width:95px; font-size:11px; text-align:center;' readonly />"
			data[i].campoFechaSalida = "";
			if (data[i].fechaSalida != "" && data[i].fechaSalida != null) {
				data[i].fechaSalida = convertirAfechaString(data[i].fechaSalida, true, false);
				data[i].campoFechaSalida = "<input type='text' value='" + data[i].fechaSalida + "' class='date' name='fecha_" + (i + 1) + "' idHistorial='" + data[i].idHistorial + "' style='width:95px; font-size:11px; text-align:center;' readonly />"
			} else {
				if (data[i].fechaSalida == null) {
					data[i].fechaSalida = "";
				}
			}
			switch (data[i].estadoNotificacion) {
				case "1":
					data[i].estado = 'Pend. Recibir';
					break;
				case "2":
					data[i].estado = 'Recibido';
					break;
				case "0":
					data[i].estado = 'Por Derivar';
					break;
			}
			data[i].areaDestino = quitarEspaciosBlanco(data[i].areaDestino)
			data[i].usuarioDestino = quitarEspaciosBlanco(data[i].usuarioDestino)
			data[i].comentarios = quitarEspaciosBlanco(data[i].comentarios)
			data[i].infoExpediente = infoExpediente;
		}
		var CampoAlineacionArray = [
			{ campo: 'campoFechaIngreso', alineacion: 'center' },
			{ campo: 'areaOrigen', alineacion: 'center' },
			{ campo: 'usuarioOrigen', alineacion: 'left' },
			{ campo: 'areaDestino', alineacion: 'center' },
			{ campo: 'usuarioDestino', alineacion: 'left' },
			{ campo: 'campoFechaSalida', alineacion: 'center' },
			{ campo: 'estado', alineacion: 'center' }
		];
		if (dataTable != undefined) {
			dataTable.destroy(); // elimina
		}
		arrayHistorial = data;
		crearFilasHTML("tabla_datos", data, CampoAlineacionArray, false, 11);
		$(".date").datetimepicker({ lan: 'es', format: 'd/m/Y H:i', timepicker: true, step: 5, closeOnDateSelect: false }); // Calendario
		$(".date").bind("change keyup", function () {
			var nameElemento = $(this).attr("name");
			$("input[name='" + nameElemento + "']").val(this.value);
		});
		var arrayColumnWidth = [
			{ "width": "10%" },
			{ "width": "15%" },
			{ "width": "20%" },
			{ "width": "15%" },
			{ "width": "20%" },
			{ "width": "10%" },
			{ "width": "10%" }
		];
		$("#tabla_datos > tbody tr:last").css("background-color", "#D3D3D3");
		//$("#tabla_datos > tbody tr:last").css("color", "white");
		var orderByColum = [0, "asc"];
		dataTable = parseDataTable("tabla_datos", arrayColumnWidth, 187, false, false, false);
		$.fancybox.close();
		$("#oculta").css("display", "none")
	} catch (err) {
		emitirErrorCatch(err, "cargarTablaHistorial")
	}
}
function reemplazarVacioXguiones(cadena) {
	try {
		cadena = quitarEspaciosBlanco(cadena);
		if (cadena == "") {
			cadena = "-------";
		}
		return cadena;
	} catch (err) {
		emitirErrorCatch(err, "reemplazarVacioXguiones")
	}
}

/* @actualizarExpediente: Actualiza los cambios realizados en los historiales y el expediente
*/
function actualizarExpediente() {
	try {
		valorTipo = $("#idTipoExpediente").find('option:selected').val()
		if (valorTipo != "Seleccione") {
			if (validarCamposRequeridos("idPanelTramitador") && validarCamposRequeridos("idPanelExpediente")) {
				var historialArray = "";
				var proseguir = true;
				$("#tabla_datos > tbody >tr").each(
					function () {
						var idHistorial = $(this).find("td").eq(0).find("input").attr("idHistorial");
						if (idHistorial != undefined) {
							var fechaInicio = $(this).find("td").eq(0).find("input").val();
							var fechaFin = $(this).find("td").eq(5).find("input").val();
							if (fechaFin != undefined) { // Si existe una fecha Fin, valida que la fecha de fin sea mayor que la fecha de inicio
								if (parseDATE(fechaFin) <= parseDATE(fechaInicio)) {
									proseguir = false;
									var elementoFocus = $(this).find("td").eq(5).find("input");
									fancyAlertFunction("La fecha de salida tiene que ser mayor que la fecha de Ingreso", function (rpta) {
										if (rpta) {
											elementoFocus.focus(); // Hace focus en el input de fecha de salida
										}
									});
									return false;
								}
							} else {
								fechaFin = "";
							}
							if (historialArray != "") {
								historialArray = historialArray + "/";
							}
							historialArray = historialArray + idHistorial + "_" + dateTimeFormat(fechaInicio) + "_" + dateTimeFormat(fechaFin);
						}
					})
				if (proseguir) {
					// obtiene valores del tramitador
					var parametros = "&idPersonaTramitador=" + infoExpediente[0].idPersonaTramitador +
						"&nombres=" + $("#idNombresTramitador").val() +
						"&apellidos=" + $("#idApellidosTramitador").val() +
						"&dni=" + $("#idDNI").val() +
						"&telef=" + $("#idTelef").val() +
						"&direccion=" + $("#idDireccion").val() +
						"&correo=" + $("#idCorreoTramitador").val();
					// obtiene valores del expediente
					var parametros = parametros + "&idExpediente=" + infoExpediente[0].idExpediente +
						"&idFechaIngreso=" + dateTimeFormat($("#idFechaIngreso").val()) +
						"&estadoExpediente=" + $("#idEstado").val() +
						"&tipoExpediente=" + valorTipo + //infoExpediente[0].tipoExpediente+
						"&idProveedor=" + $("#idCmbProveedor").val() +
						"&Observaciones=" + $("#idObservacion").val();
					// agregar los datos del historial
					var parametros = parametros + "&historial=" + historialArray;
					fancyConfirm("¿Estas seguro de proceder con la actualización del expediente?", function (estado) {
						if (estado) {
							consultarWebServiceGet("actualizarExpediente", parametros, function (data) {
								if (data[0] < 3) {
									fancyAlert("*ERROR* No se pudo actualizar correctamente el expediente!");
								}
								$.fancybox.close();
								limpiarDatos();
							})
						}
					});
				}
			}
		} else {
			fancyAlertFunction("Debe seleccionar un Tipo de Expediente valido! ",
				function (estado) { // emite alerta
					if (estado) {
						elementoActual.focus();
					}
				});
		}
	} catch (err) {
		emitirErrorCatch(err, "actualizarExpediente")
	}
}
