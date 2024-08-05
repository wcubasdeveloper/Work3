var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var DAOV = new DAOWebServiceGeT("wbs_ventas") // Objeto del web service de Ventas
var idRegistro = $_GET('id');
var modulo = "Vehiculo";
var lista_Categorias = [];
var lista_Usos = [];
var lista_Clases = [];

cargarInicio(function () {
	$("#btnGuardar").click(guardar);

	// obtiene la lista de los usos y sus clases:
	DAOV.consultarWebServiceGet("getAllUsos", "", function (data1) {
		lista_Usos = data1; // guarda la informacion de los usos
		DAOV.consultarWebServiceGet("getAllClasesXuso", "", function (data2) {
			lista_Clases = data2;
			DAOV.consultarWebServiceGet("getCategorias", "", function (data) {
				lista_Categorias = data;
				activarCmbCategorias();
				activarCmbUsos();

				$("#txtPlaca").addClass("solo-alfanum");
				$("#txtMarca").addClass("solo-alfanum1");
				$("#txtModelo").addClass("solo-alfanum1");
				$("#txtAnno").attr("maxlength", "4");
				$("#txtAnno").addClass("solo-numero");
				$("#txtSerieNro").addClass("solo-alfanum");
				$("#txtAsientos").addClass("solo-numero");
				$("#txtPlaca").attr("requerido", "Placa");
				$("#cmbCategoria").attr("requerido", "Categoria del Vehiculo");
				$("#cmbUsoVehiculo").attr("requerido", "Uso de Vehiculo");
				$("#cmbClaseVehiculo").attr("requerido", "Clase de Vehiculo");
				$("#txtMarca").attr("requerido", "Marca Vehiculo");
				$("#txtModelo").attr("requerido", "Modelo Vehiculo");
				$("#txtAnno").attr("requerido", "Año Vehiculo");
				$("#txtSerieNro").attr("requerido", "Nro Serie Motor");
				$("#txtAsientos").attr("requerido", "Nro de Asientos del vehiculo");

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
						idDistrito = data[0].idDistrito;
						idPersona = data[0].idPersona
						$("#txtPlaca").val(data[0].placa);
						$("#cmbCategoria").val(data[0].idCategoria);
						$("#cmbUsoVehiculo").val(data[0].idUso);
						$("#cmbUsoVehiculo").change();
						$("#cmbClaseVehiculo").val(data[0].idUsoClaseVehiculo)

						$("#txtMarca").val(data[0].marca)
						$("#txtModelo").val(data[0].modelo)
						$("#txtAnno").val(data[0].anno);
						$("#txtSerieNro").val(data[0].nroSerieMotor)
						$("#txtAsientos").val(data[0].nroAsientos)
						$.fancybox.close();
					});
				} else {
					//solo Edicion => cierra ventana y regresa
					$.fancybox.close();
				}
			});
		});
	});
});
function guardar() {
	try {
		if (validarCamposRequeridos("idForm")) {// verifica si la placa ya existe:
			var vehiculo = {
				placa: $("#txtPlaca").val(),
				idVehiculo: idRegistro
			}
			validarPlaca(vehiculo, function (listaVehiculos) {
				if (listaVehiculos.length == 0) {
					// obtiene datos del formulario
					fancyConfirm("¿Desea proceder con la operación?", function (rpta) {
						if (rpta) {
							var parametros = "&placa=" + $("#txtPlaca").val() +
								"&idCategoria=" + $("#cmbCategoria").val() +
								"&idUsoClase=" + $("#cmbClaseVehiculo").val() +
								"&marca=" + $("#txtMarca").val() +
								"&modelo=" + $("#txtModelo").val() +
								"&anno=" + $("#txtAnno").val() +
								"&serieMotor=" + $("#txtSerieNro").val() +
								"&nroAsientos=" + $("#txtAsientos").val() +
								"&idVehiculo=" + idRegistro;
							DAO.consultarWebServiceGet("actualizarVehiculo", parametros, function (data) {
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
				} else {
					fancyAlert("Ya existe un vehiculo con la misma placa! <BR> (idVehiculo = " + listaVehiculos[0].idVehiculo + ")")
				}
			})
		}
	} catch (err) {
		emitirErrorCatch(err, "guardar");
	}
}
function activarCmbCategorias() {
	try {
		var campos = { "keyId": "idCategoria", "keyValue": "nombreCategoria" };
		agregarOpcionesToCombo("cmbCategoria", lista_Categorias, campos);

	} catch (err) {
		emitirErrorCatch(err, "activarCmbCategorias")
	}
} function activarCmbUsos() {
	try {
		var campos = { "keyId": "idUso", "keyValue": "nombreUso" };
		agregarOpcionesToCombo("cmbUsoVehiculo", lista_Usos, campos);
		$("#cmbUsoVehiculo").change(function () {
			var valorUso = $("#cmbUsoVehiculo").val();
			if (valorUso == "" || valorUso == undefined) {
				fancyAlertFunction("Debe seleccionar un USO apropiado", function () {
					openSelect($("#cmbUsoVehiculo"));
				})
				$("#cmbClaseVehiculo").html("<option value=''>Seleccione</option>"); // reinicia el combobox de clases
				return;
			}
			var lista_clase_mostar = [];
			for (var i = 0; i < lista_Clases.length; i++) {
				if (lista_Clases[i].idUso == valorUso) {
					lista_clase_mostar.push(lista_Clases[i]);
				}
			}
			var campos_Clase = { "keyId": "idClase", "keyValue": "nombreClase" };
			agregarOpcionesToCombo("cmbClaseVehiculo", lista_clase_mostar, campos_Clase);
			openSelect($("#cmbClaseVehiculo"));
		});
	} catch (err) {
		emitirErrorCatch(err, "activarCmbUsos")
	}
}

function validarPlaca(vehiculo, callback) {
	try {
		var parametros = "&placa=" + vehiculo.placa + "&idVehiculo=" + vehiculo.idVehiculo
		DAO.consultarWebServiceGet("validarPlacaVehiculo", parametros, function (data) {
			callback(data)
		})
	} catch (err) {
		emitirErrorCatch(err, "validarPlaca()")
	}
}