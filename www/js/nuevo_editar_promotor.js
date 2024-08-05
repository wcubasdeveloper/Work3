var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var idUsuario = 0;
var modulo = "Promotor";
var diaSemana = [
	{ nombreBreve: "LU", completo: "Lunes" },
	{ nombreBreve: "MA", completo: "Martes" },
	{ nombreBreve: "MI", completo: "Miercoles" },
	{ nombreBreve: "JU", completo: "Jueves" },
	{ nombreBreve: "VI", completo: "Viernes" },
	{ nombreBreve: "SA", completo: "Sabado" }
]
cargarInicio(function () {
	$("#idUltimoDiaVisita").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
	$("#btnGuardar").click(guardar);
	$("#idPerfil").change(function () {
		validarPerfil("1");
	});
	$("#idPerfil2").change(function () {
		validarPerfil("2");
	});
	$("#idPerfil3").change(function () {
		validarPerfil("3");
	});
	// consulta por todos los perfiles	
	DAO.consultarWebServiceGet("getPerfiles", "", function (datos) {
		// carga lista de Perfiles
		cargarPerfiles(datos);
		// Consulta por la lista de las areas:
		consultarWebServiceGet("getAllAreas", "", function (info) {
			// carga la lista de areas
			agregarOpcionesToCombo("idArea", info, { "keyId": "idArea", "keyValue": "Nombre" });
			// consulta por los locales
			consultarWebServiceGet("getLocales", "", function (data) {
				// carga la lista de locales
				agregarOpcionesToCombo("idLocal", data, { "keyId": "idLocal", "keyValue": "Nombre" });
				if (parseFloat(idRegistro) > 0) {
					// carga los concesionarios para el promotor
					DAO.consultarWebServiceGet("concesionariosXpromotor", "&idPromotor=" + idRegistro, function (dataConcesionarios) {

						agregarOpcionesToCombo("idUltimoConcesionario", dataConcesionarios, { "keyId": "idConcesionario", "keyValue": "nombreConcesionario" });
						agregarOpcionesToCombo("idUltimoDiaVisita", diaSemana, { "keyId": "nombreBreve", "keyValue": "completo" });

						$("#idID").val(idRegistro);
						cargarInfoAbstracto(DAO, modulo, idRegistro, function (data) {
							if (data.length > 0) {
								idUsuario = data[0].idUsuario;
								$("#idNombres").val(data[0].Nombres);
								$("#idApellidos").val(data[0].Apellidos);
								$("#idDNI").val(data[0].DNI);
								$("#idUsuario").val(data[0].UName);
								$("#idClave").val(data[0].password);
								$("#idPerfil").val((data[0].idPerfil1 == 0) ? "" : data[0].idPerfil1);
								$("#idPerfil2").val((data[0].idPerfil2 == 0) ? "" : data[0].idPerfil2);
								$("#idPerfil3").val((data[0].idPerfil3 == 0) ? "" : data[0].idPerfil3);
								$("#idTelefono").val(data[0].telefono);
								$("#idCorreo").val(data[0].email);
								$("#idArea").val(data[0].idArea);
								$("#idLocal").val(data[0].idLocal);
								validarPerfil("1");
								validarPerfil("2");
								validarPerfil("3");
								$("#idPerfil").change(function () {
									validarPerfil('1');
								});
								$("#idPerfil2").change(function () {
									validarPerfil('2');
								});
								$("#idPerfil3").change(function () {
									validarPerfil('3');
								});
								$("#idNroConcesionarios").val(data[0].nroConcesionarios)
								$("#idUltimoConcesionario").val(data[0].ultVisitaConcesionario)
								$("#idUltimoDiaVisita").val(data[0].ultVisitaFecha)
								$("#txtIdConcesionario").val(data[0].idConcesionarioPromotor)
								$.fancybox.close();
							} else {
								fancyAlert("¡ ERROR, no se encontro información del registro !");
							}
						});
					});
				} else {
					$("#idNroConcesionarios").css("display", "none");
					$("#idUltimoConcesionario").css("display", "none");
					$("#idUltimoDiaVisita").css("display", "none")
					$("#wb_Text11").css("display", "none")
					$("#wb_Text15").css("display", "none")
					$("#wb_Text16").css("display", "none")
					$("#wb_Text14").css("display", "none")
					$("#idID").css("display", "none");
					$("#wb_lblID").css("display", "none");
					$.fancybox.close();
				}

			})
		});
	});
});
function cargarPerfiles(data) {
	try {
		$("#idPerfil").html("<option value=''>Seleccione</option>");
		$("#idPerfil2").html("<option value=''>Seleccione</option>");
		$("#idPerfil3").html("<option value=''>Seleccione</option>");
		for (var i = 0; i < data.length; i++) {
			$("#idPerfil").append(new Option(data[i].nombrePerfil, data[i].idPerfil));
			if (data[i].idPerfil != 1 && data[i].idPerfil != 2) {
				$("#idPerfil2").append(new Option(data[i].nombrePerfil, data[i].idPerfil));
				$("#idPerfil3").append(new Option(data[i].nombrePerfil, data[i].idPerfil));
			}
		}
	} catch (err) {
		emitirErrorCatch(err, "cargarPerfiles");
	}
}
function validarPerfil(idPerfil) { // valida la seleccion de perfil para el nuevo usuario
	try {
		switch (idPerfil) {
			case '1':
				valorIdPerfil1 = $("#idPerfil").val();
				if (valorIdPerfil1 != "" && valorIdPerfil1 != "1" && valorIdPerfil1 != "2") {
					$("#idPerfil2").prop("disabled", false); // deshabilita el siguiente select cuando se ha seleccionado un perfil valido diferente de Administrador y Usuario TSIGO
				} else {
					$("#idPerfil2").val("");
					$("#idPerfil2").prop("disabled", true);
					$("#idPerfil3").val("");
					$("#idPerfil3").prop("disabled", true);
					if (valorIdPerfil1 == "") {
						fancyAlertFunction("Debe selecionar una opcion valida para el primer perfil", function (e) {
							if (e) {
								$("#idPerfil").focus();
							}
						});
					}
				}
				break;
			case '2':
				valorIdPerfil1 = $("#idPerfil").val();
				valorIdPerfil2 = $("#idPerfil2").val();
				if (valorIdPerfil2 != "" && valorIdPerfil2 != valorIdPerfil1) {
					$("#idPerfil3").prop("disabled", false);
				} else {
					$("#idPerfil3").val("");
					$("#idPerfil3").prop("disabled", true);
					if (valorIdPerfil2 == "") {
						mensaje = "Debe selecionar una opcion valida para el segundo perfil";
					} else {
						mensaje = "La opción " + $("#idPerfil2 option:selected").text() + " ya se encuentra selecionada en el primer perfil, por favor seleccione una opcion diferente";
					}
					fancyAlertFunction(mensaje, function (e) {
						if (e) {
							$("#idPerfil2").val("");
							$("#idPerfil2").focus();
						}
					});
				}
				break;
			case '3':
				valorIdPerfil1 = $("#idPerfil").val();
				valorIdPerfil2 = $("#idPerfil2").val();
				valorIdPerfil3 = $("#idPerfil3").val();
				continua = true;
				if (valorIdPerfil3 == "") {
					mensaje = "Debe selecionar una opcion valida para el tercer perfil";
					continua = false;
				}
				if (valorIdPerfil3 == valorIdPerfil2) {
					mensaje = "La opción " + $("#idPerfil3 option:selected").text() + " ya se encuentra selecionada en el segundo perfil,  por favor seleccione una opcion diferente";
					continua = false;
				}
				if (valorIdPerfil3 == valorIdPerfil1) {
					mensaje = "La opción " + $("#idPerfil3 option:selected").text() + " ya se encuentra selecionada en el primer perfil,  por favor seleccione una opcion diferente";
					continua = false;
				}
				if (!continua) {
					fancyAlertFunction(mensaje, function (e) {
						if (e) {
							$("#idPerfil3").val("");
							$("#idPerfil3").focus();
						}
					});
				}
				break;
		}
	} catch (err) {
		emitirErrorCatch(err, "validarPerfil")
	}
}
function guardar() {
	try {
		if (validarCamposRequeridos("idPrincipal")) {
			// obtiene datos del formulario
			fancyConfirm("¿Desea proceder con la operación?", function (rpta) {
				if (rpta) {
					var parametros = "&idNombres=" + $("#idNombres").val() +
						"&idApellidos=" + $("#idApellidos").val() +
						"&idDNI=" + $("#idDNI").val() +
						"&idUName=" + $("#idUsuario").val() +
						"&idClave=" + $("#idClave").val() +
						"&idPerfil1=" + $("#idPerfil").val() +
						"&idPerfil2=" + $("#idPerfil2").val() +
						"&idPerfil3=" + $("#idPerfil3").val() +
						"&idTelefono=" + $("#idTelefono").val() +
						"&idCorreo=" + $("#idCorreo").val() +
						"&idArea=" + $("#idArea").val() +
						"&idLocal=" + $("#idLocal").val() +
						"&nroConcesionarios=" + $("#idNroConcesionarios").val() +
						"&ultimoConcesionario=" + $("#idUltimoConcesionario").val() +
						"&ultimaVisita=" + dateTimeFormat($("#idUltimoDiaVisita").val()) +
						"&idConcesionarioPromotor=" + $("#txtIdConcesionario").val() +
						"&idUsuario=" + idUsuario;
					DAO.consultarWebServiceGet("guardarPromotor", parametros, function (data) {
						if (data[0] > 0) {
							realizoTarea = true;
							var mensaje = "¡Se Registró la información correctamente!";
							if (parseFloat(idRegistro) > 0) {
								mensaje = "¡Se actualizarón los cambios correctamente!"
							}
							fancyAlertFunction(mensaje, function () {
								parent.$.fancybox.close();
							})
						} else {
							fancyAlert("¡Operación Fallida!")
						}
					});
				}
			});
		}
	} catch (err) {
		emitirErrorCatch(err, "guardar");
	}
}