var idUsuarioUpdate = parent.idUsuario;
var rptaWebservice = new Array(); // contiene la rpta del web service
var numeroLPAD = 6; // Cantidad maxima para formatear los codigos.

var dataTable;
var DAO = new DAOWebServiceGeT("wbs_ventas_e")
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
							{ campo: 'estado', alineacion: 'center' },
							{ campo: 'estado', alineacion: 'center' }
						];
						var columns = [
							{ "width": "12%" },
							{ "width": "12%" },
							{ "width": "12%" },
							{ "width": "30%" },
							{ "width": "10%" },
							{ "width": "15" },
							{ "width": "9%" },
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
function fancyAlert(msg) { // muestra mensaje
	jQuery.fancybox({
		'modal': true,
		'content': "<div style=\"margin:1px; min-width:280px; min-height: 80px; padding-top: 18px; font-family: Arial; font-size: 14px; font-weight: bold; \">" + msg + "<div style=\"text-align:right;margin-top:10px;\"><input style=\"margin:3px;padding:0px; width:50px; color:#000000;\" type=\"button\" onclick=\"jQuery.fancybox.close();\" value=\"Ok\"></div></div>"
	});
}
function fancyAlertFunction(msg, callback) { // muestra mensaje y ejecuta una funcion al presionar boton OK
	var ret;
	jQuery.fancybox({
		modal: true,
		content: "<div id=\"confirm\" style=\"margin:1px; min-width:280px; min-height: 80px; padding-top: 18px; font-family: Arial; font-size: 14px; font-weight: bold; \">" + msg + "<div style=\"text-align:right;margin-top:10px;\"><input class=\'confirm ok\' style=\"margin:3px;padding:0px; width:50px; color:#000000;\" type=\"button\" onclick=\"jQuery.fancybox.close();\" value=\"Ok\"></div></div>",
		beforeShow: function () {
			$(".confirm").on("click", function (event) {
				if ($(event.target).is(".ok")) {
					ret = true;
					callback.call(this, ret);
				}
			});
		}
	});
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
function convertMayusculas(element) {
	try {
		var valor = element.value;
		valor = valor.toUpperCase();
		if (valor.trim() != "") {
			$(element).val(valor) // devuelve el valor en mayusculas
		}
	} catch (err) {
		emitirErrorCatch(err, "convertMayusculas")
	}
}
function alfanumerico(e, eslogin) {
	try {
		var key = window.Event ? e.which : e.keyCode
		if (key == 13) {
			if (eslogin == true) {
				validarLogin();
			}
		} else {
			var valorCaracter = String.fromCharCode(key);
			var charpos = valorCaracter.search("[^A-Za-z0-9ñÑ]");
			return ((valorCaracter.length > 0 && charpos < 0) || (key == 8))
		}
	} catch (err) {
		var txt = "Se encontro un error en la funcion alfanumerico.\n\n";
		txt += "Error: " + err.message + "\n\n";
		txt += "Click ACEPTAR para continuar.\n\n";
		fancyAlert(txt);
	}
}

function emitirErrorCatch(err, nombre_funcion) {
	try {
		var txt = "Se encontro un error en la funcion " + nombre_funcion + "\n\n";
		txt += "Error: " + err.message + "\n\n";
		txt += "Click ACEPTAR para continuar.\n\n";
		alert(txt);
		return;
	} catch (err) {
		emitirErrorCatch(err, "emitirErrorCatch");
	}
}
function validarCamposRequeridos(idPanel) {// Valida que los campos requeridos de un div esten completos. Se envia como parametros el id del Div (SOLO SE VALIDA INPUTS TEXT y SELECTS)
	try {
		var valor = true;
		var elements = $("#" + idPanel).children(); // busca los elementos que estan incluidos en el panel
		elements.each(function () { // hace un recorrido por cada elemento encontrado
			var esRequerido = $(this).attr("requerido") // identifica si tiene el atributo de requerido
			var esSelect = false;
			if (esRequerido != undefined && esRequerido != "") {
				var elementoActual = $(this); // Guarda el elemento actual
				var valorcampo = elementoActual.val();
				// identificar si es un "Select"
				if (elementoActual.is("Select")) {
					esSelect = true;
					valorcampo = elementoActual.find('option:selected').val();
				}
				if (valorcampo == "" || valorcampo == "Seleccione") { // si su valor es vacio
					elementoActual.blur(); // quita foco del elemento seleccionado
					valor = false;
					fancyAlertFunction("Falta completar el campo " + esRequerido, function (estado) { // emite alerta
						if (estado) {
							elementoActual.focus();
						}
					});
					return false;
				}
			}
		});
		return valor; // devuelve valor TRUE O FALSE. Si es true quiere decir que todos los elementos requeridos estan completo
	} catch (err) {
		emitirErrorCatch(err, "valicarCamposRequeridos"); // emite error
	}
}
function crearFilasHTML(idTablaHTML, datos, campoAlineacionArray, ONCLIK_FILA_SELECCIONADA, fontSize, idPrefijo) {
	try {
		var cursor = "cursor: pointer;";
		if (ONCLIK_FILA_SELECCIONADA == undefined) { //
			ONCLIK_FILA_SELECCIONADA = false;
			cursor = "";
		}
		if (fontSize == undefined) {
			fontSize = 11;
		}
		if (idPrefijo == undefined) {
			idPrefijo = "";
		} else {
			idPrefijo = idPrefijo + "_";
		}
		var onclick = "";
		var AlineacionTD = "";
		var cantidadAtributos = 0;
		$("#" + idTablaHTML + " > tbody").html(""); // reinicia
		if (datos.length > 0) {
			cantidadAtributos = campoAlineacionArray.length; // obtiene la cantidad de atributos
			var filaTRAppend = "";
			for (var i = 0; i < datos.length; i++) {
				if (ONCLIK_FILA_SELECCIONADA) { // si es TRUE
					onclick = "onclick='seleccionarFila(" + '"' + idPrefijo + i + '"' + ")' id='tr_" + idPrefijo + i + "'";
				}
				filaTRAppend += "<tr  style='font-family: Arial; height: 30px; " + cursor + " font-size: " + fontSize + "px;' " + onclick + ">";
				for (var y = 0; y < cantidadAtributos; y++) { //completa las columnas segun la cantidad de atributos
					AlineacionTD = "justify";
					var conLPAD = false; // option que determina si el campo se completera con ceros
					var cantidadCeros = numeroLPAD; // cantidad de ceros
					if (campoAlineacionArray[y] != undefined) {
						AlineacionTD = campoAlineacionArray[y].alineacion;
						if (campoAlineacionArray[y].LPAD == true) {
							conLPAD = true;
							if (campoAlineacionArray[y].cantLPAD > 0) {
								cantidadCeros = campoAlineacionArray[y].cantLPAD;
							}
						}
					}
					var dataex="extra";
					if(datos[i][campoAlineacionArray[y].campo]=="Activo" && y==7){
						//dataex = "Activo y:"+y+" |i:"+i;
						filaTRAppend += "<td  style='vertical-align: middle; text-align: " + AlineacionTD + "'><a href='https://autoseguro.pe/serv/constancia.php?placa="+datos[i][campoAlineacionArray[4].campo]+"&cat="+datos[i][campoAlineacionArray[0].campo]+"' target='_blank'><img src='images/pdf.jpg'></a></td>";
					}else{
						filaTRAppend += "<td data-extra='"+dataex+"' style='vertical-align: middle; text-align: " + AlineacionTD + "'>" + quitarEspaciosEnBlanco((conLPAD) ? LPAD(datos[i][campoAlineacionArray[y].campo], cantidadCeros) : datos[i][campoAlineacionArray[y].campo]) + "</td>";	
					}

					
				}
				filaTRAppend += "</tr>";
			}
			$("#" + idTablaHTML + " > tbody").append(filaTRAppend);
		}
	} catch (err) {
		emitirErrorCatch(err, "crearFilasHTML");
	}
}
function parseDataTable(idTabla, columnWidthArray, scrollY, orderByColumn, ajustableAlto, searching, paging, functionInit) {
	try {
		borrarFilaSeleccionada();
		var sort = true;
		if (orderByColumn == undefined || orderByColumn == false) {
			sort = false;
			orderByColumn = [0, "desc"];
		}
		if (searching == undefined) {
			searching = false;
		}
		if (paging == undefined) {
			paging = false;
		}
		if (ajustableAlto == undefined) {
			ajustableAlto = false;
		}
		var dataTable = $('#' + idTabla).DataTable({
			"searching": searching,
			"paging": paging,
			"scrollY": scrollY + "px",
			"pagingType": "simple",
			"info": false,
			"lengthChange": false,
			"scrollCollapse": ajustableAlto,
			"language": {
				"search": "Buscar:",
				"lengthMenu": "Visualizar _MENU_ por pag.",
				"zeroRecords": "NO SE ENCONTRARON REGISTROS",
				"info": "Pag _PAGE_ de _PAGES_",
				"infoEmpty": "No Disponible",
				"infoFiltered": "(Filtrado de _MAX_ registros)"
			},
			"order": [orderByColumn],
			"bSort": sort,
			"columns": columnWidthArray,
			"initComplete": function () {
				if (typeof functionInit == 'function') {
					functionInit(idTabla);
				}
			},
			fixedColumns: true
		});
		$('#' + idTabla).on("search.dt", function () {
			borrarFilaSeleccionada();
		});
		borrarFilaSeleccionada();
		return dataTable;
	} catch (err) {
		emitirErrorCatch(err, "parseDataTable")
	}
}
//********* PARA UTLIZAR LA SELECCION DE FILAS ES NECESARIO CREAR LA VARIABLE GLOBAL filaSeleccionada=undefined;
var filaSeleccionada = undefined; // Fila que contiene el indice del elemento (del arreglo) que contiene el registro seleccionado 
function borrarFilaSeleccionada() { // borra una fila seleccionada (valor de la variable y la despinta)
	try {
		if (filaSeleccionada != undefined) { // Identifica que se haya seleccionado un registro
			var TDs = $("#tr_" + filaSeleccionada).find("td"); // Busca todos los <TD></TD> dentro de la Fila <TR></TR>
			TDs.each(function () { // agrega estilo a cada <TD></TD> 
				$(this).css("background-color", "transparent"); // Lo vuelve a color transparente                
				$(this).css("color", colorFuenteAntesDePintar); // Asigna como color negro a la fuente.
			});
			filaSeleccionada = undefined; // borra la informacion de la fila que fue seleccionada
		}
	} catch (err) {
		emitirErrorCatch(err, "borrarFilaSeleccionada"); // emite error
	}
}
function pintarNuevaFilaSeleccionada(id) { // Pinta una nueva fila y agregar su valor a la variable in
	try {
		var TDs = $("#tr_" + id).find("td"); // Busca todos los TD dentro de la Fila
		TDs.each(function () { // Pinta cada td encontrado
			colorFuenteAntesDePintar = $(this).css("color");
			$(this).css("background-color", "gray");
			$(this).css("color", "white");
		});
		filaSeleccionada = id;
	} catch (err) {
		emitirErrorCatch(err, "pintarFilaSeleccionada"); // emite error
	}
}
function seleccionarFila(id) { // Selecciona una fila (despinta la anterior y selecciona la nueva fila)
	try {
		if (id != filaSeleccionada) {
			borrarFilaSeleccionada(); // Borra la fila seleccionada anteriormente, si es que lo hubiera
			pintarNuevaFilaSeleccionada(id); // pinta y asigna nueva fila seleccionada
		}
	} catch (err) {
		emitirErrorCatch(err, "seleccionarFila"); // emite error
	}
}
function DAOWebServiceGeT(nombreWebService) {
	this.nombreWebService = nombreWebService;
	this.consultarWebServiceGet = function (funcion_webService, parametros, callback, mensaje, paginacionPlugin, otrosDatos) {
		try {
			if (mensaje != false) {
				if (mensaje == undefined || mensaje == true) {
					mensaje = "Espere";
				}
				fancyAlertWait(mensaje);
			}
			if (paginacionPlugin != null) { // agrega los parametros de la paginacion
				parametros += "&page=" + paginacionPlugin.paginaActual +
					"&cantPaginas=" + paginacionPlugin.cantPaginas +
					"&registrosxpagina=" + paginacionPlugin.registrosXpagina;
			}
			if (!parametros.includes("&idUsuarioUpdate")) {
				if (idUsuarioUpdate == undefined) {
					idUsuarioUpdate = 0;
				}
				parametros = parametros + "&idUsuarioUpdate=" + idUsuarioUpdate; // envia el id del usuario que realiza la operacion
			}
			if (this.nombreWebService.indexOf("_e") < 0) {
				$.getJSON(this.nombreWebService + "?funcion=" + funcion_webService + parametros, function (data, estatus) {
					try {
						//console.log("Webservice respondio - Estado: "+estatus);
						rptaWebservice = data;
						eval(callback(data, mensaje, otrosDatos)); // ejecuta la funcion
					} catch (err) {
						emitirErrorCatch(err, "consultarWebService");
					}
				}).fail(erroresXHR);
			} else {
				//Consultas desde autoseguro.pe (*_e = externo)
				// cambio x AJAX para poder insertar HEADER
				$.ajax({
					dataType: "json",
					url: this.nombreWebService,
					headers: {
						'Authorization': "Bearer " + tk
					},
					type: 'GET',
					accepts: "application/json",
					crossDomain: true,
					data: "funcion=" + funcion_webService + parametros,
					success: function (data, estatus) {
						try {
							//console.log("Webservice respondio - Estado: "+estatus);
							rptaWebservice = data;
							eval(callback(data, mensaje, otrosDatos)); // ejecuta la funcion
						} catch (err) {
							emitirErrorCatch(err, "consultarWebService");
						}
					},
					error: erroresXHR
				});
			}

		} catch (err) {
			emitirErrorCatch(err, "consultarWebService_DAOWebServiceGeT");
		}
	};
	this.consultarWebServicePOST = function (formData, funcion_webService, callback, mensaje) {
		try {
			if (!funcion_webService.includes("&idUsuarioUpdate")) {
				if (idUsuarioUpdate == undefined) {
					idUsuarioUpdate = 0;
				}
				funcion_webService = funcion_webService + "&idUsuarioUpdate=" + idUsuarioUpdate; // envia el id del usuario que realiza la operacion
			}
			if (mensaje != false) {
				if (mensaje == undefined) {
					mensaje = "Espere";
				}
				fancyAlertWait(mensaje, mensaje);
			}
			$.post(this.nombreWebService + "?funcion=" + funcion_webService, formData,
				function (data) {
					callback(data);
				}, 'json')
				.fail(erroresXHR);
		} catch (err) {
			emitirErrorCatch(err, "consultarWebServicePOST");
		}
	};

}
function fancyAlertWait(msg) {// genera mensaje de espera de carga
	jQuery.fancybox({
		'modal': true,
		'content': "<div style=\"margin:1px;min-width:280px; min-height: 80px; padding-top: 28px;  font-family: Arial; font-size: 14px; font-weight: bold; \"><center><img style='margin-top: -2px;' src='css/fancybox/source/fancybox_loading.gif'> " + msg + "</center></div>"
	});
}

function erroresXHR(jqXHR, textStatus, errorThrown) {
	var msj = "";
	var tipoMSJ = "ERROR: ";
	if (jqXHR.status === 0) {
		msj = 'No hay conexion: Verificar la red de datos.';
	} else if (jqXHR.status == 404) {
		msj = 'Pagina solicitada no existe [404]';
	} else if (jqXHR.status == 500) {
		msj = 'Error Interno de Servidor Remoto [500].';
	} else if (jqXHR.responseText == "") {
		msj = 'FATAL: Posible Desconexion de la Red, reintentar!!';
	} else if (jqXHR.responseText == "Unauthorized") {
		tipoMSJ = "";
		msj = 'Debe reiniciar la pagina con [F5] para hacer otra consulta';
	} else if (jqXHR.responseText != "Unauthorized") {
		msj = jqXHR.responseText + '. Comunicarse con Soporte Tecnico.';
	} else if (textStatus === 'parsererror') {
		msj = 'Datos JSON con problemas.';
	} else if (textStatus === 'timeout') {
		msj = 'Excedió Tiempo de espera.';
	} else if (textStatus === 'abort') {
		msj = 'Solicitud AJAX terminada.';
	} else {
		msj = 'NO PREVISTO: ' + jqXHR.responseText;
	}
	fancyAlert(tipoMSJ + msj);
}
function quitarEspaciosEnBlanco(valor) { // quita espacios en blanco de una cadena de texto
	try {
		if (valor == null) {
			valor = '';
		}
		if (valor != undefined && typeof valor == 'String') {
			valor = valor.trim()
		}
		return valor;
	} catch (err) {
		emitirErrorCatch(err, "quitarEspaciosBlanco")
	}
}