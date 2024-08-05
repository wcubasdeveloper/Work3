// Variables Globales
// Dinamica
var usuarioIdentificado = parent.idUsuario;
var idAreaDelUsuario = parent.idArea;
var nombreAreaDelUsuario = parent.nombreArea;
var idExpedienteRegistrado = 0;
var codEventoExpediente = "";
var idPersonaTramitante = 0;
var idExpVerificado = false;
var estados_a_Buscar;
var tipoTramite; // S=Solicitud, D=Documento
var lista_instituciones;
var lista_proveedores;
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var estadoExpediente = 0;
var mListaAgraviados = {};
cargarInicio(function () {
	try {
		// ajustado para los nuevos cambios de febrero 2018
		$("#idBtnNuevaInstitucion").hide()
		$("#idComboInstitucion").css("width", "272px");
		$("#idComboInstitucion").select2();
		// cargar fecha expediente
		var fechaHoraHoy = new Date();
		var soloFecha = convertirAfechaString(fechaHoraHoy, false) // Obtiene la fecha en String
		$("#idFechaExpediente").val(soloFecha)
		// cargar Hora expediente
		var horaActual = CompletarConCeros(fechaHoraHoy.getHours(), 2) + ":" + CompletarConCeros(fechaHoraHoy.getMinutes(), 2)
		$("#idHoraExpediente").val(horaActual)
		// activa plugin datetimepicker:
		$("#idFechaExpediente").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true }); // Calendario
		$("#idHoraExpediente").datetimepicker({ datepicker: false, format: 'H:i', step: 15 });
		// Cargar Datos del Usuario
		$("#idArea").val(nombreAreaDelUsuario)
		$("#idUsuario").val(parent.nombreUsuario)
		// Cargar evento change al combo tipo Expediente
		$("#idTipoExpediente").change(validarTipoSolicitud)
		$("#idComboAgraviado").change(cambiarDNIAgraviado)

		// Cargar eventos Click a los botones
		$("#idBuscarEvento").click(buscarEventoXcod)
		$("#idBuscarPersona").click(buscarPersona)
		$("#idGuardarExpediente").click(registrarExpediente)
		$("#idGenerarCita").click(abrirVentanaCita)
		$("#idBtnBuscarExpPrevio").click(busquedaExpediente)
		$("#idNroExpPrevio").change(function () {
			idExpVerificado = false;
		})
		$("#idNroFolios_Exp").keypress(function (e) {
			var valor = this.value;
			return textNumber(e, 0, valor, 2);
		});
		$("#idNroFolios_Otros").keypress(function (e) {
			var valor = this.value;
			return textNumber(e, 0, valor, 2);
		});
		$("#idNroExpPrevio").keypress(function (e) {
			var valor = this.value;
			return textNumber(e);
		});
		// Guarda localmente las instituciones
		consultarWebServiceGet("getInstituciones", "", function (data) { // Busca las instituciones y las carga
			lista_instituciones = data;
			DAOV.consultarWebServiceGet("getIPRESS", "", function (proveedores) {
				lista_proveedores = proveedores;
				$.fancybox.close();
			})
		})
		$("#idBtnNuevaInstitucion").click(agregarNuevaInstitucion)
		// Buscar ultimo idExpediente
		//buscarProxIDEXPEDIENTE();
	} catch (err) {
		emitirErrorCatch(err, "Cargar Inicio FUNCION")
	}
});
function cambiarDNIAgraviado() {
	var midAgraviado = $("#idComboAgraviado").val();
	if (midAgraviado != '') {
		$("#idAgraviadoDNI").val(mListaAgraviados[midAgraviado])
	}
}
function agregarNuevaInstitucion() {
	try {
		abrirVentanaFancyBox(500, 300, "nueva_institucion", true, function (data) {
			$("#idComboInstitucion").append(new Option(data[0].nombre, data[0].idInstitucion));
			$("#idComboInstitucion").val(data[0].idInstitucion);
		})
	} catch (err) {
		emitirErrorCatch(err, "agregarNuevaInstitucion")
	}
}
function buscarProxIDEXPEDIENTE() {
	try {
		consultarWebServiceGet("getExpedienteMasReciente", "", function (data) {
			var nroExpedienteUltimo = "";
			if (data.length > 0) {
				nroExpedienteUltimo = parseInt(data[0].idExpediente) + 1;
				nroExpedienteUltimo = CompletarConCeros(nroExpedienteUltimo, 5);
			} else {
				nroExpedienteUltimo = "00001";
			}
			$("#idNroExpediente").val(nroExpedienteUltimo);
			$.fancybox.close();
		});
	} catch (err) {
		emitirErrorCatch(err, "buscarProxIDEXPEDIENTE")
	}
}
function reiniciarTotal() {
	try {
		if ($("#idBtnEliminarSolicitante").css("display") == 'block') {
			resetSolicitante()
		}
		// Reinicie valores globales 
		codEventoExpediente = "";
		idExpedienteRegistrado = 0;
		idPersonaTramitante = 0;
		idExpVerificado = false;
		estadoExpediente = 0;
		// Reinicia campos Solicitud reembolso
		limpiarCamposSolicitud() // Limpia todos los campos de la solicitud
		limpiarOtrosDocumentos() // Limpia campo de otros documentos
		limpiarPersonaTramitante() // Limpia Persona Tramitante
		bloquearCamposPersona() // bloquea los campos de Nombres y Apellidos de la persona que tramita
		limpiarObservaciones() // Limpia campo de observaciones
		limpiarDiasRespuesta(); // Limpia los campos de dias de respuesta
		quitarRequeridoByidPanel("idPanelSolicitud") // hace que todos los campos del Panel de solicitud no sean requeridos
		quitarRequeridoByidPanel("idPanelOtrosDocs")
		quitarRequeridoByidPanel("idPanelPersonaTramitante")
		quitarRequeridoByidPanel("idPanelObservaciones")
		reiniciarBotones()
		$("#idNroExpediente").val("");
	} catch (err) {
		emitirErrorCatch(err, "reiniciarTotal")
	}
}
function validarTipoSolicitud() {
	try {
		var tipoExpediente = $("#idTipoExpediente").val();
		if (tipoExpediente != '') {
			$("#default_idTipoExpediente").remove(); // elimina la opcion x defecto ('Seleccione')
			reiniciarTotal();
			// A CONTINUACIÓN DEJARA HABILITADO SOLO LOS CAMPOS NECESARIOS PARA CADA TIPO DE EXPEDIENTE
			switch (tipoExpediente) {
				case "1": //  Solicitud Reembolso por gastos médicos
					habilitarPanelPersona(); // habilita para que se realice o ingrese la persona que tramita
					habilitarPanelObservaciones();
					habilitar_Solicitud_Reembolso();
					$("#idGuardarExpediente").prop("disabled", false)
					estadoExpediente = 1; //0;
					break;
				case "2": // Solicitud de Indemnización por muerte
					habilitarPanelPersona();
					habilitarPanelObservaciones();
					habilitar_Solicitud_Reembolso();
					$("#idGuardarExpediente").prop("disabled", false)
					estadoExpediente = 1; //0;					
					break;
				case "3": // Solicitud de Indemnización por sepelio
					habilitarPanelObservaciones();
					habilitarPanelPersona();
					habilitar_Solicitud_Reembolso();
					$("#idGuardarExpediente").prop("disabled", false)
					estadoExpediente = 1; //0;
					break;
				case "4": // Solicitud de Indemnización por Incapacidad Temporal
					habilitarPanelPersona();
					habilitarPanelObservaciones();
					habilitar_Solicitud_Reembolso();
					$("#idGuardarExpediente").prop("disabled", true) // Deshabilita boton para guardar Expediente
					$("#idGenerarCita").css("display", "block") // Muestra el boton para generar cita
					estadoExpediente = 1; //0;
					break;
				case "5": // Solicitud de Indemnización por Invalidez Permanente
					habilitarPanelPersona();
					habilitarPanelObservaciones();
					habilitar_Solicitud_Reembolso();
					$("#idGuardarExpediente").prop("disabled", true) // Deshabilita boton para guardar Expediente
					$("#idGenerarCita").css("display", "block") // Muestra el boton para generar cita
					estadoExpediente = 1; //0;
					break;
				case "6":
					//habilitarPanelPersona(); // habilita para que se realice o ingrese la persona que tramita
					habilitarPanelObservaciones();
					habilitar_Solicitud_Subsanacion();
					$("#idGuardarExpediente").prop("disabled", false)
					estadoExpediente = 0;
					break;
				case "7": // Documento administrativo
					habilitar_TramiteDocumentos();
					habilitarPanelPersona();
					habilitarPanelObservaciones();
					$("#idGuardarExpediente").prop("disabled", false)
					// Carga Instituciones
					cargarCombo_proveedores_instituciones("I")
					estadoExpediente = 1;
					break;
				case "9": // Otros					
					habilitar_TramiteDocumentos();
					habilitarPanelPersona();
					habilitarPanelObservaciones();
					$("#idGuardarExpediente").prop("disabled", false)
					// Carga Instituciones
					cargarCombo_proveedores_instituciones("I")
					estadoExpediente = 1;
					break;
				case "10": // Solicitudes de Pago a las IPRESS										 
					habilitar_TramiteDocumentos();
					habilitarPanelPersona();
					habilitarPanelObservaciones();
					habilitar_Solicitud_Reembolso();
					$("#idNroFolios_Exp").attr("requerido", "");
					$("#idNroFolios_Exp").attr("disabled", true);
					// Vuelve opcional el ingreso del solicitante
					$("#idNombres").attr("requerido", "");
					$("#idApellidos").attr("requerido", "");
					$("#idDNI").attr("requerido", "");
					$("#idDireccion").attr("requerido", "");
					// fin de campos de solicitantes
					$("#idGuardarExpediente").prop("disabled", false);
					// carga proveedores:
					cargarCombo_proveedores_instituciones("P")
					estadoExpediente = 0;
					break;
				case "11": // Regularizaciones de solicitudes
					//habilitar_TramiteDocumentos(); 
					//habilitarPanelPersona();
					habilitarPanelObservaciones();
					habilitar_Solicitud_Subsanacion_Documentos();
					$("#idNroFolios_Exp").attr("requerido", "");
					$("#idNroFolios_Exp").attr("disabled", true);
					// Vuelve opcional el ingreso del solicitante
					$("#idNombres").attr("requerido", "");
					$("#idApellidos").attr("requerido", "");
					$("#idDNI").attr("requerido", "");
					$("#idDireccion").attr("requerido", "");
					// fin de campos de solicitantes					
					$("#idGuardarExpediente").prop("disabled", false);
					estadoExpediente = 1;
					break;
			}
		} else {
			alertFancy("Debe Seleccionar un tipo de expediente valido")
		}
	} catch (err) {
		emitirErrorCatch(err, "validarTipoSolicitud")
	}
}
function mlabelTextWebPlus(idLabel, text) { // Funcion UNICAMENTE usada para reemplazar texto en los labels generados con WEB PLUS
	try {
		var span = $("#" + idLabel).find("span"); // Busca el tag <span></span> dentro del label
		span.html(text); // asigna el texto
	} catch (err) {
		emitirErrorCatch(err, "labelTextWebPlus"); // emite error
	}
}
function cargarCombo_proveedores_instituciones(proveedor_institucion) {
	try {
		switch (proveedor_institucion) {
			case 'I':
				mlabelTextWebPlus("wb_idLabel_inst_prov", "Institución")
				agregarOpcionesToCombo("idComboInstitucion", lista_instituciones, { keyValue: 'nombre', keyId: 'idInstitucion' })
				break;
			case 'P':
				mlabelTextWebPlus("wb_idLabel_inst_prov", "Proveedor")
				agregarOpcionesToCombo("idComboInstitucion", lista_proveedores, { keyValue: 'nombreProveedor', keyId: 'idProveedor' })
				break;
		}
		$("#idComboInstitucion").select2();

	} catch (err) {
		emitirErrorCatch(err, "cargarCombo_proveedores_instituciones")
	}
}
function reiniciarBotones() {
	try {
		$("#idBuscarEvento").prop("disabled", true)
		$("#idBuscarPersona").prop("disabled", true)
		$("#idGuardarExpediente").prop("disabled", true)
		$("#idGenerarCita").css("display", "none")
		$("#idBtnBuscarExpPrevio").prop("disabled", true);
		$("#idBtnNuevaInstitucion").prop("disabled", true);
	} catch (err) {
		emitirErrorCatch(err, "reiniciarBotones")
	}
}
// FUNCIONES PARA HABILITAR POR TIPO DE SOLICITUDES
function habilitarPanelPersona() {
	try {
		// Persona que tramita:
		$("#idNombres").attr("requerido", "Nombres")
		$("#idNombres").attr("disabled", false)
		$("#idApellidos").attr("requerido", "Apellidos")
		$("#idApellidos").attr("disabled", false)
		$("#idDNI").attr("requerido", "DNI")
		$("#idDNI").attr("disabled", false)
		//$("#idTelef").attr("requerido", "Telefono") // Ya no es requerido 21/11/2015
		$("#idTelef").attr("disabled", false)
		$("#idDireccion").attr("requerido", "Direccion")
		$("#idDireccion").attr("disabled", false)
		//$("#idEmail").attr("requerido", "Email"); // Ya no es requerido 21/11/2015
		$("#idEmail").attr("disabled", false);
		$("#idBuscarPersona").attr("disabled", false);
		$("#idBtnEliminarSolicitante").css("display", "none");
	} catch (err) {
		emitirErrorCatch(err, "habilitarPanelPersona")
	}
}
function habilitarPanelObservaciones() {
	try {
		// Observaciones
		$("#idObservaciones").attr("disabled", false);
	} catch (err) {
		emitirErrorCatch(err, "habilitarPanelObservaciones")
	}
}
function habilitar_Solicitud_Reembolso() { // Para solicitudes unicamente
	try {
		$("#codEvento").attr("requerido", "Codigo de Evento")
		$("#codEvento").attr("disabled", false) // Habilita campo
		$("#idComboAgraviado").attr("requerido", "Agraviado")
		$("#idComboAgraviado").attr("disabled", false) // Habilita campo
		$("#idBuscarEvento").prop("disabled", false)
		$("#codEvento").focus()
		$("#idNroFolios_Exp").attr("requerido", "Numero de Folios");
		$("#idNroFolios_Exp").attr("disabled", false)
	} catch (err) {
		emitirErrorCatch(err, "habilitar_Solicitud_Reembolso")
	}
}
function habilitar_Solicitud_Subsanacion() {
	try {
		estados_a_Buscar = "'1','2','3','4','5'";
		tipoTramite = 'S'; // Solicitud
		habilitar_Solicitud_Reembolso();
		$("#idNroExpPrevio").attr("requerido", "Nro de Expediente Previo");
		$("#idNroExpPrevio").attr("disabled", false);
		$("#idBtnBuscarExpPrevio").prop("disabled", false); // Habilita boton para buscar EXP PREVIO
		$("#idNroExpPrevio").focus();
		// Desactiva la busqueda manual de evento:
		$("#codEvento").attr("requerido", "");
		$("#codEvento").attr("disabled", true) // Deshabilita campo
		$("#idBuscarEvento").prop("disabled", true) // deshabilita boton para buscar evento
	} catch (err) {
		emitirErrorCatch(err, "habilitar_Solicitud_Subsanacion")
	}
}
function habilitar_Solicitud_Subsanacion_Documentos() { // habilita la subsanacion de documentos
	try {
		estados_a_Buscar = "'10'";
		tipoTramite = 'D'; // Documento
		$("#idNroExpPrevio").attr("requerido", "Nro de Expediente Previo");
		$("#idNroExpPrevio").attr("disabled", false);
		$("#idBtnBuscarExpPrevio").prop("disabled", false); // Habilita boton para buscar EXP PREVIO
		$("#idNroExpPrevio").focus();
		$("#idBtnNuevaInstitucion").prop("disabled", false);
		// Desactiva la busqueda manual de evento:
		/*$("#codEvento").attr("requerido", "");
		$("#codEvento").attr("disabled", true) // Deshabilita campo
		$("#idBuscarEvento").prop("disabled", true) // deshabilita boton para buscar evento*/
	} catch (err) {
		emitirErrorCatch(err, "habilitar_Solicitud_Subsanacion")
	}
}
function habilitar_TramiteDocumentos() {
	try {
		// Otros Documentos:
		$("#idNroFolios_Otros").attr("requerido", "Nro de folios")
		$("#idNroDocRef").attr("requerido", "Nro Doc de Referencia")
		$("#idComboInstitucion").attr("requerido", "Institucion")
		$("#idNroFolios_Otros").attr("disabled", false)
		$("#idNroDocRef").attr("disabled", false)
		$("#idComboInstitucion").attr("disabled", false)
		$("#idBtnNuevaInstitucion").prop("disabled", false)
		$("#idNroDocRef").focus();
	} catch (err) {
		emitirErrorCatch(err, "habilitar_TramiteDocumentos")
	}
}
// FIN DE FUNCIONES 
function quitarRequeridoByidPanel(idPanel) { // Quitar propiedad de requerido a todos los campos de un panel
	try {
		var elements = $("#" + idPanel).children(); // busca los elementos que estan incluidos en el panel
		elements.each(function () { // hace un recorrido por cada elemento encontrado
			var esRequerido = $(this).attr("requerido") // identifica si tiene el atributo de requerido
			if (esRequerido != undefined) {
				$(this).attr("requerido", ""); // pone en blanco el atributo de requerido (Cuando esta en blanco ya no lo hace requerido)
				$(this).attr("disabled", true)
			}
		});
	} catch (err) {
		emitirErrorCatch(err, "quitarRequeridoByidPanel")
	}
}
// FUNCIONES PARA LIMPIAR CAMPOS DE FORMULARIO
function limpiarCamposSolicitud() { // Reinicia todos los campos
	try {
		$("#codEvento").val("")
		$("#idAsociado").val("")
		$("#idPlaca").val("")
		$("#idCAT").val("")
		$("#idTipoAccidente").val("")
		$("#idFechaAccidente").val("")
		$("#idLugarAccidente").val("")
		$("#idNroFolios_Exp").val("")
		$("#idNroExpPrevio").val("")
		$("#idComboAgraviado").html("<option value=''>Seleccione</option>")
		$("#idAgraviadoDNI").val("")
	} catch (err) {
		emitirErrorCatch(err, "limpiarCamposSolicitud")
	}
}
function limpiarOtrosDocumentos() {
	try {
		$("#idNroDocRef").val("")
		$("#idNroFolios_Otros").val("")
		$("#idComboInstitucion").val("")
		$("#idComboInstitucion").select2()
	} catch (err) {
		emitirErrorCatch(err, "limpiarOtrosDocumentos")
	}
}
function limpiarPersonaTramitante() { // Limpia los campos de la persona que tramita
	try {
		$("#idNombres").val("")
		$("#idApellidos").val("")
		$("#idDNI").val("")
		$("#idTelef").val("")
		$("#idDireccion").val("")
		$("#idEmail").val("")
	} catch (err) {
		emitirErrorCatch(err, "limpiarPersonaTramitante")
	}
}
function limpiarObservaciones() {
	try {
		$("#idObservaciones").val("")
	} catch (err) {
		emitirErrorCatch(err, "limpiarObservaciones")
	} // Limpia el campo de Observaciones
}
function limpiarDiasRespuesta() {
	try {
		$("#idDiaRespuesta").val("")
	} catch (err) {
		emitirErrorCatch(err, "limpiarObservaciones")
	}
}
function bloquearCamposPersona(valor) { // funcion boleana sirve para bloquear o desbloquear los campos Nombres y Apellidos de una persona que tramita TRUE = Bloquea ; FALSE = Desbloquea
	try {
		if (valor == undefined) { // Valor x defecto siempre sera TRU = Bloquera los campos de la persona
			valor = true;
		}
		$("#idNombres").prop("readonly", valor)
		$("#idApellidos").prop("readonly", valor)
	} catch (err) {
		alertFancy(err, "bloquearCamposPersona")
	}
}
function registrarExpediente() {
	try {
		var tipoExpediente = $("#idTipoExpediente").val();
		if (codEventoExpediente != $("#codEvento").val()) { // tiene que coincidir el codigo de evento escrito en la caja de texto con el que se guardo en la variable global
			fancyAlert("Ha surgido un problema al identificar el Evento. Por favor vuelva a identificar el evento y seleccionar el agraviado");
			return;
		} else { // Procede con el registro
			if ($("#idNroExpPrevio").val() != "" && idExpVerificado == false) {
				fancyAlert("Verifique que el Nro de Expediente previo sea valido (Presionar Boton 'Buscar Exped.')")
				return;
			} else {
				if (idPersonaTramitante == 0) {
					if ($("#idDNI").val() != "") {
						if ($("#idNombres").prop('readonly') == false && ($("#idApellidos").val() == "" || $("#idNombres").val() == "")) {
							fancyAlertFunction("Debe ingresar los datos del solicitante a registrar", function (rpta) {
								if (rpta) {
									if ($("#idNombres").val() == "") {
										$("#idNombres").focus();
										return;
									}
									if ($("#idApellidos").val() == "") {
										$("#idApellidos").focus();
										return;
									}
								}
							});
							return;
						}
						if ($("#idNombres").prop('readonly') == true && ($("#idApellidos").val() == "" || $("#idNombres").val() == "")) {
							fancyAlertFunction("Debe realizar la busqueda del solicitante", function (rpta) {
								if (rpta) {
									$("#idBuscarPersona").focus();
								}
							});
							return;
						}
					}
				}
				if (validarCamposRequeridos('idPanelSolicitud') && validarCamposRequeridos("idPanelOtrosDocs") && validarCamposRequeridos('idPanelPersonaTramitante') && validarCamposRequeridos('idPanelRespuesta')) {
					fancyConfirm("¿ Estas seguro de proceder con el registro del expediente ?", function (rpta) {
						if (rpta) {
							var cantFolios = 0;
							var idInstitucion = "";
							var idProveedor = "";
							if (tipoExpediente == '7' || tipoExpediente == '9' || tipoExpediente == '10' || tipoExpediente == '11') { // si es documento administrativo
								cantFolios = $("#idNroFolios_Otros").val();
								if (tipoExpediente == '10') { // Pago a IPRESS almacenara el proveedor
									idProveedor = $("#idComboInstitucion").val()
								} else { // almacenara la institucion
									idInstitucion = $("#idComboInstitucion").val()
								}
							} else {
								cantFolios = $("#idNroFolios_Exp").val();
							}
							var parametros = "&idTipoExpediente=" + tipoExpediente + // Tipo de Expediente
								"&codEvento=" + codEventoExpediente + // cod. evento
								"&idAgraviado=" + $('#idComboAgraviado').val() + // Agraviado
								"&idExpedientePrevio=" + $("#idNroExpPrevio").val() + // Expediente Previo
								"&nroFolios=" + cantFolios + // nro folios expediente previo
								"&observaciones=" + $("#idObservaciones").val() +// Observacion
								"&nroDocRef=" + $("#idNroDocRef").val() + // nro Doc Referencial
								"&idInstitucion=" + idInstitucion + // id Institucion
								"&idProveedor=" + idProveedor + // id del proveedor
								"&diasRespuesta=" + $("#idDiaRespuesta").val() + // Dia de respuesta
								"&idPersonaTramitante=" + idPersonaTramitante;
							/// Verifica la persona que tramita
							if (idPersonaTramitante == 0) { // Sino se pudo encontrar una persona en la Base de datos, se procedera a tomar los datos de la persona e insertarlos en la tabla 'Persona'						
								var apellidoPaterno = "";
								var apellidoMaterno = "";
								if ($("#idApellidos").val() != "") {
									// Descompone apellidos: Paterno - Materno
									var apellidoPaterMater = $("#idApellidos").val().split(" "); // descompone donde encuentre un espacio en blanco								
									if (apellidoPaterMater.length >= 1) {
										apellidoPaterno = apellidoPaterMater[0]; // Obtiene el apellido Paterno 
										if (apellidoPaterMater.length > 1) {
											apellidoMaterno = apellidoPaterMater[1]; // Obtiene el apellido Materno
										}
									}
								}
								parametros = parametros + "&nombres=" + $("#idNombres").val() +  // DATOS DE LA PERSONA QUE TRAMITA SERA REGISTRADO
									"&apellidoPaterno=" + apellidoPaterno +
									"&apellidoMaterno=" + apellidoMaterno +
									"&DNI=" + $("#idDNI").val();
							}
							parametros = parametros + "&telef=" + $("#idTelef").val() +
								"&direccion=" + $("#idDireccion").val() +
								"&email=" + $("#idEmail").val();
							// Prepara para registrar
							parametros = parametros + "&fechaHoraTramite=" + dateTimeFormat($("#idFechaExpediente").val()) + " " + $("#idHoraExpediente").val(); // Agrega fecha de registro
							parametros = parametros + "&estadoExpediente=" + estadoExpediente
							consultarWebServiceGet("registrarExpediente", parametros, function (data) {
								if (data[0] > 0) {
									idExpedienteRegistrado = data[0];
									abrirDerivacionTramite() // se abre ventana para derivar un tramite
								} else {
									alertFancy("No se pudo registrar")
								}
							});
						}
					});
				}
			}

		}
	} catch (err) {
		emitirErrorCatch(err, "registrarExpediente")
	}
}
function abrirDerivacionTramite() {
	try {
		if (idExpedienteRegistrado > 0) {
			$("#idNroExpediente").val(LPAD(idExpedienteRegistrado, numeroLPAD));
			var parametros = "?idExpediente=" + idExpedienteRegistrado +
				"&idUsuario=" + usuarioIdentificado +
				"&idArea=" + idAreaDelUsuario +
				"&fechaExpediente=" + dateTimeFormat($("#idFechaExpediente").val()) + " " + $("#idHoraExpediente").val() +
				"&estadoExpediente=" + estadoExpediente + // Estado Expediente=1 => En Proceso
				"&idHistorial=0";
			abrirVentanaFancyBox(500, 350, "derivartramite" + parametros, false, function (data) {
				if (data[0].registrado == 1) {
					$("#idTipoExpediente").val(null);
					reiniciarTotal(); // reinicia todo
					fancyAlertWait("Cargando ultimo Numero Expediente")
				}
			});
		} else {
			fancyAlert("No se ha registrado ningun expediente")
		}
	} catch (err) {
		emitirErrorCatch(err, "abrirDerivacionTramite")
	}
}
function buscarPersona() {
	try {
		var tipoExpedienteSeleccionado = $("#idTipoExpediente").val();
		if (tipoExpedienteSeleccionado != "") {
			var dni = $("#idDNI").val();
			if (dni != '') {
				var tamaño = dni.split('').length;
				if (tamaño == 8) {
					var parametros = "&nroDoc=" + dni;
					consultarWebServiceGet("getPersonaByNroDoc", parametros, function (data) {
						try {
							var dni = $("#idDNI").val(); // vuelve a guardar el DNI antes de Limpiar el campo DNI
							limpiarPersonaTramitante(false) // Limpia todos los campos menos el DNI
							if (data.length > 0) { // si se encontro persona muestra sus datos
								idPersonaTramitante = data[0].idPersona;
								$("#idNombres").val(data[0].nombres)
								$("#idApellidos").val(data[0].apellidoPaterno + ' ' + data[0].apellidoMaterno)
								$("#idTelef").val(data[0].telefonoMovil)
								$("#idDNI").val(data[0].nroDocumento)
								// compactando dirección de la persona:
								var direccion = quitarEspaciosBlanco(data[0].calle);
								if (quitarEspaciosBlanco(data[0].nro) != "") {
									direccion = direccion + ' ' + quitarEspaciosBlanco(data[0].nro);
								}
								if (quitarEspaciosBlanco(data[0].mzLote) != "") {
									direccion = direccion + " " + quitarEspaciosBlanco(data[0].mzLote);
								}
								if (quitarEspaciosBlanco(data[0].sector) != "") {
									direccion = direccion + " " + quitarEspaciosBlanco(data[0].sector);
								}
								if (quitarEspaciosBlanco(data[0].referencia) != "") {
									direccion = direccion + " " + quitarEspaciosBlanco(data[0].referencia);
								}
								$("#idDireccion").val(direccion)
								$("#idEmail").val(data[0].email)
								bloquearCamposPersona() // Bloquea los campos nombres y apellidos para que no se puedan editar
								$("#idBtnEliminarSolicitante").css("display", "block"); // Muestra opcion para eliminar
								$("#idBuscarPersona").css("display", "none");
								$("#idDNI").prop("readonly", true);
							} else {
								idPersonaTramitante = 0;
								$("#idDNI").val(dni)
								bloquearCamposPersona(false) // Desbloquea los campos Nombres y Apellidos para que pueda insertar
								$("#idNombres").focus()
								$("#idBtnEliminarSolicitante").css("display", "none"); // Muestra opcion para eliminar
								$("#idBuscarPersona").css("display", "block");
								$("#idDNI").prop("readonly", false);
							}
							$.fancybox.close()
						} catch (err) {
							emitirErrorCatch(err, "buscarPersona - callback")
						}
					})
				} else {
					fancyAlertFunction("Formato DNI incorrecto", function (estado) {
						if (estado) {
							$("#idDNI").focus()
						}
					})
				}
			} else {
				fancyAlertFunction("Ingrese un Numero de DNI", function (estado) {
					if (estado) {
						$("#idDNI").focus()
					}
				})
			}
		} else {
			fancyAlertFunction("Debe seleccionar un tipo de expediente", function (estado) {
				if (estado) {
					$("#idTipoExpediente").focus()
				}
			})
		}
	} catch (err) {
		emitirErrorCatch(err, "buscarPersona")
	}
}
// FIN DE FUNCIONES

/* @buscarEventoXcod:Realiza la búsqueda del evento por su código de evento, en caso de encontrar ningún resultado se abre la ventana de búsqueda avanzada de eventos.
*/
function buscarEventoXcod() { // Busca evento por codigo del evento
	try {
		var tipoExpedienteSeleccionado = $("#idTipoExpediente").val();
		if (tipoExpedienteSeleccionado != "") {
			var tipoBusqueda = "codEvento"; // Buscar evento x el campo 'codEvento'
			var parametros = "&tipoBusqueda=" + tipoBusqueda + "&codigo=" + $("#codEvento").val();
			consultarWebServiceGet("getEventosGenerales", parametros, function (data) {
				try {
					if (data.length > 0) {
						// muestra información del evento
						cargarInfoEvento(data);
						buscarAgraviados()
					} else {
						// Limpia campos relacionados al evento
						$("#codEvento").val("")
						$("#idAsociado").val("")
						$("#idPlaca").val("")
						$("#idFechaAccidente").val("")
						$("#idLugarAccidente").val("")
						$("#idComboAgraviado").html("<option value=''>Seleccione</option>")
						$("#idAgraviadoDNI").val("")
						abrirBusquedaAvanzada(); // abre la busqueda avanzada
					}
				} catch (err) {
					emitirErrorCatch(err, "callback-buscarEventoXcod")
				}
			})
		} else {
			fancyAlertFunction("Debe seleccionar un tipo de expediente", function (estado) {
				if (estado) {
					$("#idTipoExpediente").focus()
				}
			})
		}
	} catch (err) {
		emitirErrorCatch(err, "buscarEvento")
	}
}
function abrirBusquedaAvanzada() { // abre ventana de busqueda avanzada
	try {
		abrirVentanaFancyBox("740", "440", "busqueda1", true,
			function (data) {
				cargarInfoEvento(data);
				fancyAlertWait("Buscando Agraviados");
				if (data[0].idAgraviado != undefined) { // Se ha realizado la busqueda del evento por agraviado
					var arrayAgraviado = [
						{
							idAgraviado: data[0].idAgraviado,
							nombres: data[0].nombres,
							apellidoPaterno: data[0].apellidoPaterno,
							apellidoMaterno: data[0].apellidoMaterno
						}
					];
					cargarListaAgraviados(arrayAgraviado);
				} else {
					buscarAgraviados();
				}
			});
	} catch (err) {
		emitirErrorCatch(err, "abrirBusquedaAvanzada");
	}
}
function cargarInfoEvento(data) {
	try {
		$("#codEvento").val(data[0].codEvento)
		$("#idPlaca").val(data[0].placa)
		$("#idCAT").val(data[0].nroCAT)
		$("#idTipoAccidente").val(data[0].descripcionEvento)
		$("#idFechaAccidente").val(data[0].fechaAccidente)
		$("#idLugarAccidente").val(data[0].lugarAccidente)
		var nombreAsociado = ""
		if (data[0].tipoAsociado == 'J') {
			nombreAsociado = quitarEspaciosBlanco(data[0].razonSocial)
		} else {
			nombreAsociado = quitarEspaciosBlanco(data[0].nombresAsociado) + " " + quitarEspaciosBlanco(data[0].apellidoPaternoAsociado) + " " + quitarEspaciosBlanco(data[0].apellidoMaternoAsociado)
		}
		$("#idAsociado").val(nombreAsociado)
		codEventoExpediente = data[0].codEvento;
		$.fancybox.close()
	} catch (err) {
		emitirErrorCatch(err, "cargarInfoEvento")
	}
}
function buscarAgraviados() {
	try {
		var parametros = "&codEvento=" + codEventoExpediente;
		consultarWebServiceGet("getAgraviados", parametros, cargarListaAgraviados, "Cargando Agraviados")
	} catch (err) {
		emitirErrorCatch(err, "buscarAgraviados")
	}
}
function cargarListaAgraviados(data) {
	try {
		$("#idComboAgraviado").prop("disabled", false);
		$("#idComboAgraviado").html("");
		$("#idComboAgraviado").append("<option value='' id='default_idComboAgraviado'>Seleccione</option>")
		mListaAgraviados = {};
		for (var i = 0; i < data.length; i++) {
			var midAgraviado = data[i].idAgraviado;
			var nombreAgraviado = "(" + midAgraviado + ") " + quitarEspaciosBlanco(data[i].nombres) + ' ' + quitarEspaciosBlanco(data[i].apellidoPaterno) + ' ' + quitarEspaciosBlanco(data[i].apellidoMaterno);
			$("#idComboAgraviado").append(new Option(nombreAgraviado, data[i].idAgraviado))
			mListaAgraviados[midAgraviado] = data[i].nroDocumento;
		}
		if (data.length == 1) { // si hay un solo agraviado lo seleccionara y bloqueara el combobox
			$("#idComboAgraviado").val(data[0].idAgraviado)
			$("#idAgraviadoDNI").val(mListaAgraviados[data[0].idAgraviado])
			$("#idComboAgraviado").prop("disabled", true);
		}
		$.fancybox.close()
	} catch (err) {
		emitirErrorCatch(err, "cargarListaAgraviados")
	}
}
function abrirVentanaCita() {
	try {
		if (validarCamposRequeridos('idPanelSolicitud') && validarCamposRequeridos('idPanelPersonaTramitante') && validarCamposRequeridos('idPanelRespuesta')) {
			if (codEventoExpediente != "" && codEventoExpediente == $("#codEvento").val()) {
				if ($("#idNroExpPrevio").val() != "" && idExpVerificado == false) {
					fancyAlert("Verifique que el Nro de Expediente previo sea valido (Presionar Boton 'Buscar Exped.')")
					return;
				} else {
					var cantFolios = 0;
					var tipoExpediente = $("#idTipoExpediente").val();
					if (tipoExpediente == '7' || tipoExpediente == '9') { // si es documento administrativo
						cantFolios = $("#idNroFolios_Otros").val();
					} else {
						cantFolios = $("#idNroFolios_Exp").val();
					}
					var parametros = "?idTipoExpediente=" + $("#idTipoExpediente").val() + // Tipo de Expediente
						"&codEvento=" + codEventoExpediente + // cod. evento
						"&idAgraviado=" + $('#idComboAgraviado').val() + // Agraviado
						"&idExpedientePrevio=" + $("#idNroExpPrevio").val() + // Expediente Previo
						"&nroFolios=" + cantFolios + // nro folios expediente previo
						"&observaciones=" + $("#idObservaciones").val() +// Observacion
						"&nroDocRef=" + $("#idNroDocRef").val() + // nro Doc Referencial
						"&diasRespuesta=" + $("#idDiaRespuesta").val() + // Dia de respuesta
						"&idPersonaTramitante=" + idPersonaTramitante;
					/// Verifica la persona que tramita
					if (idPersonaTramitante == 0) { // Sino se pudo encontrar una persona en la Base de datos, se procedera a tomar los datos de la persona e insertarlos en la tabla 'Persona'
						var apellidoPaterno = "";
						var apellidoMaterno = "";
						// Descompone apellidos: Paterno - Materno
						var apellidoPaterMater = $("#idApellidos").val().split(" "); // descompone donde encuentre un espacio en blanco								
						if (apellidoPaterMater.length >= 1) {
							apellidoPaterno = apellidoPaterMater[0]; // Obtiene el apellido Paterno 
							if (apellidoPaterMater.length > 1) {
								apellidoMaterno = apellidoPaterMater[1]; // Obtiene el apellido Materno
							}
						}
						parametros = parametros + "&nombres=" + $("#idNombres").val() +  // DATOS DE LA PERSONA QUE TRAMITA SERA REGISTRADO
							"&apellidoPaterno=" + apellidoPaterno +
							"&apellidoMaterno=" + apellidoMaterno +
							"&DNI=" + $("#idDNI").val();
					}
					parametros = parametros + "&telef=" + $("#idTelef").val() +
						"&direccion=" + $("#idDireccion").val() +
						"&email=" + $("#idEmail").val();

					parametros = parametros + "&fechaHoraTramite=" + dateTimeFormat($("#idFechaExpediente").val()) + " " + $("#idHoraExpediente").val(); // Agrega fecha de registro
					abrirVentanaFancyBox(500, 350, "generarcita" + parametros, true)
				}
			} else {
				fancyAlert("Ha surgido un problema al identificar el Evento. Por favor vuelva a identificar el evento y seleccionar el agraviado");
				return;
			}
		}
	} catch (err) {
		emitirErrorCatch(err, "abrirVentanaCita")
	}
}
function busquedaExpediente() {
	try {
		var nroExpPrevio = $("#idNroExpPrevio").val();
		if (nroExpPrevio != "") {
			var parametros = "&tipoBusqueda=exp" +
				"&codigo=" + nroExpPrevio + "&soloPrevios=T" +
				"&estados_a_Buscar=" + estados_a_Buscar;
			consultarWebServiceGet("getExpedientes", parametros, function (data) {
				if (data.length > 0) {
					cargarInfoExpedientePrevio(data);
				} else {// Abre Busqueda
					idExpVerificado = false;
					//$("#idNroExpPrevio").val("");
					limpiarCamposSolicitud() // Limpia todos los campos de la solicitud
					limpiarOtrosDocumentos() // Limpia campo de otros documentos
					limpiarPersonaTramitante() // Limpia Persona Tramitante
					idPersonaTramitante = 0;
					codEventoExpediente = "";
					var parametros = "?soloPrevios=T" +
						"&estados_a_Buscar=" + estados_a_Buscar;
					abrirVentanaFancyBox(700, 470, "busqueda_expediente" + parametros, true, function (data) {
						if (data.length > 0) {
							cargarInfoExpedientePrevio(data);
						}
					})
				}
			});
		} else {
			fancyAlert("Ingrese un Numero de Expediente Previo");
		}
	} catch (err) {
		emitirErrorCatch(err, "busquedaExpediente")
	}
}
function cargarInfoExpedientePrevio(data) {
	try {
		switch (tipoTramite) {
			case 'S': // Solicitud
				$("#idNroExpPrevio").val(LPAD(data[0].idExpediente, numeroLPAD));
				//fancyAlert("¡Nro de Expediente Correcto!");
				idExpVerificado = true;
				$("#codEvento").val(data[0].codEvento);
				$("#idDNI").val(data[0].nroDocumento)
				var agraviadoExp = data[0].codAgraviado;
				// Busca evento:
				var tipoBusqueda = "codEvento"; // Buscar evento x el campo 'codEvento'
				var parametros = "&tipoBusqueda=" + tipoBusqueda + "&codigo=" + $("#codEvento").val();
				consultarWebServiceGet("getEventosGenerales", parametros, function (data) {
					try {
						if (data.length > 0) {
							// muestra información del evento
							cargarInfoEvento(data);
							// buscar Agraviados:
							var parametros2 = "&codEvento=" + codEventoExpediente;
							consultarWebServiceGet("getAgraviados", parametros2, function (datos) {
								cargarListaAgraviados(datos);
								$("#idComboAgraviado").val(agraviadoExp); // selecciona el cod agraviado del expediente previo
								habilitarPanelPersona();
								if ($("#idDNI").val() != "") {
									buscarPersona(); // Busca persona solicitante
								}
								if ($("#idTipoExpediente").val() == '10' || $("#idTipoExpediente").val() == '11') {
									$("#idNombres").attr("requerido", "");
									$("#idApellidos").attr("requerido", "");
									$("#idDNI").attr("requerido", "");
									$("#idDireccion").attr("requerido", "");
								}

							}, "Cargando Agraviados");
						} else {
							fancyAlert('ERROR NO SE HA ENCONTRADO EL EVENTO ASOCIADO AL EXPEDIENTE PREVIO')
						}
					} catch (err) {
						emitirErrorCatch(err, "try-catch")
					}
				});
				break;
			case 'D': // Documentos
				idExpVerificado = true;
				$("#idNroExpPrevio").val(LPAD(data[0].idExpediente, numeroLPAD));
				// Carga info del panel OTROS DOCUMENTOS
				habilitar_TramiteDocumentos();
				$("#idNroDocRef").val(data[0].nroDocReferencia);
				$("#idNroFolios_Otros").val(data[0].nroFolios);

				var tipoExpediente = data[0].tipoExpediente;

				if (tipoExpediente == '10') { // si el expediente previo es PAGO A IPRESS (tipo=10) carga los proveedores
					cargarCombo_proveedores_instituciones("P")
					$("#idComboInstitucion").val(data[0].idProveedor);
				} else { // carga instituciones
					cargarCombo_proveedores_instituciones("I")
					$("#idComboInstitucion").val(data[0].idInstitucion);
				}
				$("#idComboInstitucion").select2()

				//***********************************************
				$("#codEvento").val(data[0].codEvento);
				$("#idDNI").val(data[0].nroDocumento)
				var agraviadoExp = data[0].codAgraviado;
				// Busca evento:
				var tipoBusqueda = "codEvento"; // Buscar evento x el campo 'codEvento'
				var parametros = "&tipoBusqueda=" + tipoBusqueda + "&codigo=" + $("#codEvento").val();
				consultarWebServiceGet("getEventosGenerales", parametros, function (data) {
					try {
						if (data.length > 0) {
							// muestra información del evento
							cargarInfoEvento(data);
							// buscar Agraviados:
							var parametros2 = "&codEvento=" + codEventoExpediente;
							consultarWebServiceGet("getAgraviados", parametros2, function (datos) {
								cargarListaAgraviados(datos);
								$("#idComboAgraviado").val(agraviadoExp); // selecciona el cod agraviado del expediente previo
								habilitarPanelPersona();
								if ($("#idDNI").val() != "") {
									buscarPersona(); // Busca persona solicitante
								}
								if ($("#idTipoExpediente").val() == '10' || $("#idTipoExpediente").val() == '11') {
									$("#idNombres").attr("requerido", "");
									$("#idApellidos").attr("requerido", "");
									$("#idDNI").attr("requerido", "");
									$("#idDireccion").attr("requerido", "");
								}
							}, "Cargando Agraviados");
						} else {
							fancyAlert('ERROR NO SE HA ENCONTRADO EL EVENTO ASOCIADO AL EXPEDIENTE PREVIO')
						}
					} catch (err) {
						emitirErrorCatch(err, "try-catch")
					}
				});
				break;
		}
	} catch (err) {
		emitirErrorCatch(err, "cargarInfoExpedientePrevio")
	}
}
function resetSolicitante() {
	try {
		limpiarPersonaTramitante();
		habilitarPanelPersona();
		idPersonaTramitante = 0;
		if ($("#idTipoExpediente").val() == '10' || $("#idTipoExpediente").val() == '11') {
			$("#idNombres").attr("requerido", "");
			$("#idApellidos").attr("requerido", "");
			$("#idDNI").attr("requerido", "");
			$("#idDireccion").attr("requerido", "");
		}
		$("#idBtnEliminarSolicitante").css("display", "none"); // Muestra opcion para eliminar
		$("#idBuscarPersona").css("display", "block");
		$("#idDNI").prop("readonly", false);
		$("#idDNI").focus();
	} catch (err) {
		emitirErrorCatch(err, "resetSolicitante");
	}
}