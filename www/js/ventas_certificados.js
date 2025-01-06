var accion = "N"; // N = Nuevo ; E = Editar 
var idAsociado = 0;
var DAO = new DAOWebServiceGeT("wbs_ventas") // Objeto del web service de Ventas
var lista_Concesionarios = [];
var lista_Categorias = [];
var lista_Usos = [];
var lista_Clases = [];
var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
idUsuarioUpdate = parent.idUsuario;
if (idPerfil != 1 && idPerfil != 2) {
	idLocal = parent.idLocal;
}
var idDeposito = 0
var NoCambiarMontos = false; //Flag usado para funcion activarMonto
//FUNCIONES QUE SE CARGAR AL INICIO:

cargarInicio(function () {
	$("#wb_Text1").css("width", "350px");
	labelTextWYSG("wb_Text1", "Registro de certificados vendidos")
	$("#btnAnular").val("Liberar");
	$("#btnAnular").click(anularCAT);
	$("#btnAnular").css("display", "none");
	// Cargar distritos
	DAO.consultarWebServiceGet("getAllDistritos", "", function (data) {
		arrayDistritos = data; // Guarda los distritos
		DAO.consultarWebServiceGet("getAllProvincias", "", function (datos) {
			arrayProvincias = datos;
			DAO.consultarWebServiceGet("getAllDepartamentos", "", function (depas) {
				arrayDepartamentos = depas;
				$("#idDistrito_asoc").change(function () {
					cargarProvinciasDep("asoc", idProvinciaSelect);
				})
				// Obtiene la lista de Conos:
				DAO.consultarWebServiceGet("getConos", "", function (datos) {
					var campos = { "keyId": 'idSede', "keyValue": 'nombreSede' }
					agregarOpcionesToCombo("cmb_cono", datos, campos);
					// activa evento change en combobox de cono:
					$("#cmb_cono").change(cargarConcesionariosXcono);
					// obtiene la lista de los usos y sus clases:
					DAO.consultarWebServiceGet("getAllUsos", "", function (data1) {
						lista_Usos = data1; // guarda la informacion de los usos
						DAO.consultarWebServiceGet("getAllClasesXuso", "", function (data2) {
							lista_Clases = data2;
							// obtiene todos los registros de los concesionarios y los guarda en un arreglo global
							var parametros = "&stringBusqueda=";
							DAO.consultarWebServiceGet("buscarConcesionario", parametros, function (data) {
								lista_Concesionarios = data;
								DAO.consultarWebServiceGet("getCategorias", "", function (data) {
									lista_Categorias = data;

									// muestra los concesionarios del primer cono de la lista
									if (idLocal > 0) {
										$("#cmb_cono").val(idLocal);
										$("#cmb_cono").prop("disabled", true);
										$("#txtBusqueda_concesionario").css("display", "none");
										$("#btnBusquedaConcesionario").css("display", "none");
										$("#idCheckLiqPend").css("display", "none");
										$("#wb_idLabelLiqPend").css("display", "none");
									} else {
										$("#cmb_cono option").eq(1).prop("selected", true);
									}
									$("#txtBusqueda_concesionario").addClass("solo-alfanum");
									$("#cmb_cono").change();
									$("#cmb_deuda").change(function () {
										var conDeuda = $("#cmb_deuda").val();
										activaFechaLiquidacion(conDeuda);
									})
									$("#idTipoPersona_asoc").change(function () {
										cambiarTipoPersona();
									});
									crearDateTimes()
									//listarTodosLosConcesionarios();
									activarBotones();
									activarCmbUsos();
									activarCmbCategorias();

									$("#idDNI_asoc").attr("idPersona", "0");
									$("#idDNI_asoc").attr("maxlength", "9");
									$("#idDNI_asoc").addClass("solo-numero");
									$("#idNombres_asoc").prop("disabled", true);
									$("#idNombres_asoc").addClass("solo-alfanum1");
									$("#idApePat_asoc").prop("disabled", true);
									$("#idApePat_asoc").addClass("solo-alfanum1");

									$("#idApeMat_asoc").prop("disabled", true);
									$("#idApeMat_asoc").addClass("solo-alfanum1");
									$("#idRazonSocial_asoc").prop("disabled", true);
									$("#idRazonSocial_asoc").addClass("solo-alfanum1");

									$("#idDistrito_asoc").prop("disabled", true);
									$("#idTelf_asoc").prop("disabled", true);
									$("#idTelf_asoc").addClass("solo-numero");
									$("#idDirec_asoc").prop("disabled", true);
									$("#idDirec_asoc").addClass("solo-alfanum1");

									$("#txtPlaca").attr("idVehiculo", "0");
									$("#txtPlaca").addClass("solo-alfanum");
									$("#cmbClaseVehiculo").prop("disabled", true);
									$("#cmbCategoria").prop("disabled", true);
									$("#cmbUsoVehiculo").prop("disabled", true);
									$("#txtMarca").prop("disabled", true);
									$("#txtMarca").addClass("solo-alfanum1");
									$("#txtModelo").prop("disabled", true);
									$("#txtModelo").addClass("solo-alfanum1");
									$("#txtAnno").prop("disabled", true);
									$("#txtAnno").attr("maxlength", "4");
									$("#txtAnno").addClass("solo-numero");
									$("#txtSerieNro").prop("disabled", true);
									$("#txtSerieNro").addClass("solo-alfanum");
									$("#txtAsientos").prop("disabled", true);
									$("#txtAsientos").addClass("solo-numero");

									// agregar campos requeridos:
									$("#cmb_concesionario").attr("requerido", "Concesionario");
									$("#txtNroCertificado").attr("requerido", "Nro de Certificado");
									$("#txtNroCertificado").addClass("solo-alfanum");

									$("#txtFechaEmision").attr("requerido", "Fecha y Hora de Emision");
									$("#txtFechaLiquidacion").attr("requerido", "Fecha de Liquidacion");
									$("#txtFV_Inicio").attr("requerido", "Fecha de Inicio de Vigencia");
									$("#txtFV_Inicio").change(function () {
										calcularFechaFin("txtFV");
									});
									$("#txtFV_Fin").attr("requerido", "Fecha de caducidad de vigencia");
									$("#txtFV_Fin").attr("disabled", true);

									$("#txtFCP_Inicio").attr("requerido", "Fecha de Inicio del Control Policial");
									$("#txtFCP_Inicio").change(function () {
										calcularFechaFin("txtFCP");
									});
									$("#txtFCP_Fin").attr("requerido", "Fecha Final Control Policial");
									$("#txtFCP_Fin").attr("disabled", true);
									$("#idDNI_asoc").attr("requerido", "DNI/RUC del Asociado");

									$("#idDistrito_asoc").attr("requerido", "Distrito Asociado");
									//$("#idTelf_asoc").attr("requerido", "Telefono Asociado");
									$("#idDirec_asoc").attr("requerido", "Direccion Asociado");
									$("#txtPlaca").attr("requerido", "Placa");
									$("#cmbCategoria").attr("requerido", "Categoria del Vehiculo");
									$("#cmbUsoVehiculo").attr("requerido", "Uso de Vehiculo");
									$("#cmbClaseVehiculo").attr("requerido", "Clase de Vehiculo");
									$("#cmbClaseVehiculo").change(activarMonto);
									$("#txtMarca").attr("requerido", "Marca Vehiculo");
									$("#txtModelo").attr("requerido", "Modelo Vehiculo");
									$("#txtAnno").attr("requerido", "Año Vehiculo");
									$("#txtSerieNro").attr("requerido", "Nro Serie Motor");
									$("#txtAsientos").attr("requerido", "Nro de Asientos del vehiculo");

									// Monto del certificado:
									$("#txtComision").addClass("solo-decimal");
									$("#txtComision").prop("disabled", true);
									$("#txtComision").keyup(calcularAporte);
									$("#txtComision").attr("requerido", "comision");

									$("#txtPrima").addClass("solo-decimal");
									$("#txtPrima").prop("disabled", true);
									$("#txtPrima").keyup(calcularAporte);
									$("#txtPrima").attr("requerido", "Prima");

									$("#txtAporte").addClass("solo-decimal");
									$("#txtAporte").prop("disabled", true);
									$("#txtAporte").keyup(calcularComisionByAporte);
									$("#txtAporte").attr("requerido", "Aporte");

									$("#txtTotal").addClass("solo-decimal");
									$("#txtTotal").prop("disabled", true)
									$("#txtTotal").keyup(changeMonto);
									$("#txtTotal").attr("requerido", "Monto Total");

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

									$.fancybox.close();
								});
							});
						});
					});
				});
			});
		});
	});
});

function clickDuplicadoCheck(elementoCheck){

	var isChecked = elementoCheck.is(':checked');
	//console.log("isChecked",isChecked);

	if(isChecked){ //si duplicado is Checked
		$('#txtValidaCATDuplicado').focus();
		$('#txtValidaCATDuplicado').prop('disabled',false);
		$('#txtValidaCATDuplicado').removeAttr('hidden');
		$('#sectionIconoBusquedaCertitificado').removeAttr('hidden');
		$('#sectionIconoBusquedaCertitificado').find('span').eq(0).attr('class','glyphicon glyphicon-search');
		$('#txtValidaCATDuplicado').attr('data-valido-duplicado',0);


	}else{

		$('#txtValidaCATDuplicado').prop('hidden',true);
		$('#sectionIconoBusquedaCertitificado').prop('hidden',true);
		$('#txtValidaCATDuplicado').val('');
		$('#txtValidaCATDuplicado').attr('data-valido-duplicado',0);
	}

}
 
function validaCATValido() {
	var realizoValidacionDuplicado = $('#txtValidaCATDuplicado').attr('data-valido-duplicado');
	if(Number(realizoValidacionDuplicado) == 1){
		return false;
	}
	
	$('#txtValidaCATDuplicado').prop('disabled',false);
	$('#sectionIconoBusquedaCertitificado').find('span').eq(0).attr('class','glyphicon glyphicon-search');
	try {
		var nroCertificado = $("#txtValidaCATDuplicado").val().trim();
		if (nroCertificado == "") {
			fancyAlertFunction("Debe ingresar el número de certificado", function () {
				$("#txtValidaCATDuplicado").focus();
			})
			return;
		}
		var parametros = "&nroCertificado=" + nroCertificado + "&liquidacionPendiente=" + "false";
		DAO.consultarWebServiceGet("buscarCertificado", parametros, function (data) {
			console.log('--->>',data.length)
			if (data.length == 0) { //no existe certificado
				fancyAlertFunction("¡El número de Certificado " + $("#txtValidaCATDuplicado").val() + ", no existe!", function () {
					$("#txtValidaCATDuplicado").focus();
				});
				return;
			} else { //si existe 
				if (data[0].estado == 29 || data[0].estado == 24 || data[0].estado == 5 || data[0].estado == 7 || data[0].estadoMovimiento == 'V') {
					//certificado disponible
					console.log("data certificado", data);
					$('#txtValidaCATDuplicado').attr('data-valido-duplicado',1);
					$('#txtValidaCATDuplicado').prop('disabled',true);
					$('#sectionIconoBusquedaCertitificado').find('span').eq(0).attr('class','glyphicon glyphicon-ok');

				}else{
					console.log('--')
					fancyAlertFunction("¡El Certificado " + $("#txtValidaCATDuplicado").val() + " no se encuentra disponible!", function () {});
				}
			}
			$.fancybox.close();
		})
	} catch (err) {
		emitirErrorCatch(err, "buscarCertificado");
	}
}


function calcularComisionByAporte() {
	try {
		var aporte = $("#txtAporte").val();
		if (aporte == "") {
			//$("#txtComision").val(0);
			aporte = 0;
		}
		aporte = parseFloat(aporte);

		var prima = $("#txtPrima").val();
		if (prima == "") {
			//$("#txtPrima").val(0)
			prima = 0;
		}
		prima = parseFloat(prima);

		var total = $("#txtTotal").val();
		if (total == "") {
			total = 0;
		}
		total = parseFloat(total);

		if (total == 0) {
			fancyAlertFunction("¡Primero debe ingresar el monto Total!", function () {
				$("#txtTotal").focus();
			})
			return;
		}
		if (prima > total) {
			fancyAlertFunction("¡El valor del monto total (S/. " + total + ") no puede excederse del valor de la Prima (S/. " + prima + ")!", function () {
				//$("#txtComision").val("");
				//$("#txtAporte").val("");
				$("#txtTotal").val("");
				$("#txtTotal").focus();
			});
			return;
		}

		var comision = total - (prima + aporte);
		if (comision < 0) {
			$("#txtComision").val(comision);
			fancyAlertFunction("¡El valor del aporte se ha excedido!", function () {
				$("#txtAporte").val("");
				$("#txtComision").val("");
				$("#txtAporte").focus();
			});
		} else {
			$("#txtComision").val(comision);
		}

	} catch (err) {
		emitirErrorCatch(err, "calcularComisionByAporte");
	}
}
function calcularAporte() {
	try {
		var comision = $("#txtComision").val();
		if (comision == "") {
			//$("#txtComision").val(0);
			comision = 0;
		}
		comision = parseFloat(comision);

		var prima = $("#txtPrima").val();
		if (prima == "") {
			//$("#txtPrima").val(0)
			prima = 0;
		}
		prima = parseFloat(prima);

		var total = $("#txtTotal").val();
		if (total == "") {
			total = 0;
		}
		total = parseFloat(total);

		if (total == 0) {
			fancyAlertFunction("¡Primero debe ingresar el monto Total!", function () {
				$("#txtTotal").focus();
			})
			return;
		}

		if (prima > total) {
			fancyAlertFunction("¡El valor del monto total (S/. " + total + ") no puede excederse del valor de la Prima (S/. " + prima + ")!", function () {
				//$("#txtComision").val("");
				//$("#txtAporte").val("");
				$("#txtTotal").val("");
				$("#txtTotal").focus();
			});
			return;
		}

		var aporte = total - (prima + comision);
		if (aporte < 0) {
			$("#txtAporte").val(aporte);
			fancyAlertFunction("¡El valor de la comisión se ha excedido!", function () {
				$("#txtComision").val("");
				$("#txtAporte").val("");
				$("#txtComision").focus();
			});
		} else {
			$("#txtAporte").val(aporte);
		}
	} catch (err) {
		emitirErrorCatch(err, "calcularAporte");
	}
}

function changeMonto() { // cambia el valor de la comision a 0 soles
	try {
		var total = $("#txtTotal").val();
		if (total == "") {
			total = 0;
		}
		total = parseFloat(total);

		var prima = $("#txtPrima").val();
		if (prima == "") {
			prima = 0;
		}
		var comision = 0;
		$("#txtComision").val("");
		$("#txtAporte").val("");
		prima = parseFloat(prima);

		if (total >= prima) {
			$("#txtComision").val(0);
			var aporte = total - (prima + comision);
			if (aporte < 0) {
				$("#txtAporte").val(aporte);
				fancyAlertFunction("¡El valor del monto se ha excedido!", function () {
					$("#txtTotal").val("");
					$("#txtAporte").val("");
					$("#txtTotal").focus();
				});
			} else {
				$("#txtAporte").val(aporte);
			}
		}
	} catch (err) {
		emitirErrorCatch(err, "changeMonto");
	}
}
function activarMonto() {
	try {
		if (NoCambiarMontos) {
			NoCambiarMontos = false;
			return;
		}
		var usoClase = $("#cmbClaseVehiculo").val();
		if (usoClase != null && usoClase != "") {
			for (var i = 0; i < lista_Clases.length; i++) {
				if (lista_Clases[i].idClase == usoClase) {
					$("#txtPrima").val(lista_Clases[i].prima);
					$("#txtPrima").prop("disabled", false);
					$("#txtComision").val("");
					$("#txtComision").prop("disabled", false);
					$("#txtAporte").val("");
					$("#txtAporte").prop("disabled", false);
					$("#txtTotal").val(lista_Clases[i].montoPoliza);
					$("#txtTotal").prop("disabled", false);
					break;
				}
			}
		} else {
			$("#txtPrima").val("");
			$("#txtComision").val("");
			$("#txtAporte").val("");
			$("#txtTotal").val("");
		}
	} catch (err) {
		emitirErrorCatch(err, "activarMonto")
	}
}
function cargarConcesionariosXcono() { // carga la lista de concesionarios segun la sede cono seleccionada.
	try {
		var idSede = $("#cmb_cono").val();
		if (idSede != null && idSede != "" && idSede != undefined) {
			var arrayListConcesionarios = [];
			for (var i = 0; i < lista_Concesionarios.length; i++) {
				if (lista_Concesionarios[i].idSede == idSede) {
					arrayListConcesionarios.push(lista_Concesionarios[i]);
				}
			}
			var campos = { "keyId": 'idConcesionario', "keyValue": 'nombre' };
			agregarOpcionesToCombo("cmb_concesionario", arrayListConcesionarios, campos);
			$("#cmb_concesionario").select2();
		} else {
			fancyAlertFunction("¡Debe seleccionar un cono correctamente!", function () {
				$("#cmb_cono").focus();
			});
		}
	} catch (err) {
		emitirErrorCatch(err, "cargarConcesionariosXcono");
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
function listarTodosLosConcesionarios() { // obtiene y lista todos los concesionarios
	try {
		var parametros = "&stringBusqueda=";
		DAO.consultarWebServiceGet("buscarConcesionario", parametros, function (data) {
			var flag = "concesionario";
			var campos = ["idConcesionario", "nombre"];
			listarResultadosCombo(data, flag, campos);
		});
	} catch (err) {
		emitirErrorCatch(err, "listarTodosLosConcesionarios")
	}
}
function crearDateTimes() { // crea los campos de fecha 
	try {
		// Fecha y Hora de Emision que por defecto se muestra la fecha y hora actual:
		$("#txtFechaEmision").datetimepicker({ lan: 'es', format: 'd/m/Y H:i', timepicker: true, closeOnDateSelect: false, step: 15 });
		$("#txtFechaEmision").val(convertirAfechaString(new Date, true, false));

		// Fecha de Liquidacion:
		$("#txtFechaLiquidacion").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });

		// Fecha de Vigencia Inicio - Fin
		$("#txtFV_Inicio").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
		$("#txtFV_Fin").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });

		// Fecha de Control Policial Inicio - Fin
		$("#txtFCP_Inicio").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
		$("#txtFCP_Fin").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
	} catch (err) {
		emitirErrorCatch(err, "")
	}
}
function activarBotones() {
	try {
		$("#btnBusquedaConcesionario").click(buscarConcesionario); // Busqueda de Concesionario		
		$("#btnBusquedaCertificado").click(buscarCertificado); // Busqueda de certificado
		$("#btnBuscarPersona_asoc").click(function () {
			buscarPersona("asoc");
		})
		$("#idBtnBuscarPlaca").click(buscarVehiculo);
		$("#btnGuardar").click(guardar);
	} catch (err) {
		emitirErrorCatch(err, "activarBusquedaConcesionario");
	}
}
function buscarConcesionario() {
	try {
		var flag = "concesionario";
		var campos = ["idConcesionario", "nombre"];
		var funcionWebService = "buscarConcesionario"
		busquedaCombo(flag, DAO, funcionWebService, campos, function (data, flag, arrayCampos) {
			listarResultadosCombo(data, flag, arrayCampos);
			$("#cmb_concesionario").select2('open');
			$("#cmb_cono").val("");
		});
	} catch (err) {
		emitirErrorCatch(err, "buscarConcesionario");
	}
}
var temp_prima = 0;
var temp_aporte = 0;
var temp_comision = 0;
function buscarCertificado() {

	try {
		var nroCertificado = $("#txtNroCertificado").val().trim();
		if (nroCertificado == "") {
			fancyAlertFunction("Debe ingresar el número de certificado", function () {
				$("#txtNroCertificado").focus();
			})
			return;
		}
		var parametros = "&nroCertificado=" + nroCertificado + "&liquidacionPendiente=" + $("#idCheckLiqPend").prop("checked");
		DAO.consultarWebServiceGet("buscarCertificado", parametros, function (data) {
			console.log("data certificado", data);
			if (data.length == 0) {
				fancyAlertFunction("¡El número de Certificado " + $("#txtNroCertificado").val() + ", no existe!", function () {
					$("#txtNroCertificado").focus();
					if (accion == 'E') {
						refrescarPantalla(false);
					}
					accion = 'N';
				})
			} else {
				//validando la sección duplicado
				if(data[0].CertificadoDuplicado){ //si tiene una referencia de duplicado
					$('#sectionSiTieneDuplicado').removeAttr('hidden');
					$('#sectionNoTieneDuplicado').prop('hidden',true);
					$('#chckDuplicado').prop('checked',false);
					$('#txtValidaCATDuplicado').val('');
					$('#lblCertificadoDuplicadoReferencia').text(data[0].CertificadoDuplicado);
					
				}else{ //si no tiene 
					$('#sectionNoTieneDuplicado').removeAttr('hidden');
					$('#sectionSiTieneDuplicado').prop('hidden',true);
					$('#lblCertificadoDuplicadoReferencia').text('-');

				}

				if ($("#idCheckLiqPend").prop("checked")) {
					if (data[0].tipOperacion == 'E' && data[0].idGuiaSalida == 0 && data[0].estado != '8' && data[0].estado != '9') {
						$("#txtNroCertificado").prop("disabled", true);
						$("#idCheckLiqPend").prop("disabled", true);
						$("#btnBusquedaCertificado").unbind("click")
						$("#btnBusquedaCertificado").attr("onclick", "");
						$("#btnBusquedaCertificado").click(reiniciarCertificado);
						$("#btnBusquedaCertificado").children().prop("class", "glyphicon glyphicon-minus-sign");
						fancyAlert("¡Certificado Disponible!")
						setTimeout(function () {
							$.fancybox.close();
						}, 500);
						if (accion == 'E') { // si anteriormente habia una edición de un CAT limpia los campos
							refrescarPantalla(false);
						}
						accion = 'N';
					} else {
						if (data[0].estado == '8' || data[0].estado == '9') {
							fancyAlert("¡Ya se encuentra registrada la venta de este certificado!")
						} else {
							fancyAlert("¡El certificado aun no se encuentra distribuido!")
						}
					}
					
				} else { //checked false

			

					// 29, 24, 5, y 7 SON LOS ESTADOS ANTIGUOS DE AUTOSEGURO EN LOS QUE SE PUEDE REGISTRAR EL CAT DE UN CERTIFICADO
					if (data[0].estado == 29 || data[0].estado == 24 || data[0].estado == 5 || data[0].estado == 7 || data[0].estadoMovimiento == 'V') {// Disponible
						$("#txtNroCertificado").prop("disabled", true);
						$("#idCheckLiqPend").prop("disabled", true);
						$("#btnBusquedaCertificado").unbind("click")
						$("#btnBusquedaCertificado").attr("onclick", "");
						$("#btnBusquedaCertificado").click(reiniciarCertificado);
						$("#btnBusquedaCertificado").children().prop("class", "glyphicon glyphicon-minus-sign");
						fancyAlert("¡Certificado Disponible!")
						setTimeout(function () {
							$.fancybox.close();
						}, 500);
						if (accion == 'E') { // si anteriormente habia una edición de un CAT limpia los campos
							refrescarPantalla(false);
						}
						accion = 'N';
						//busca al Concesionario que vendió el certificado
						var idConcesionario = data[0].idConcesionario;


						seleccionarConcesionario(idConcesionario)

					} else {
						if (data[0].estado == 'CAT') { // Es un certificado registrado en la tabla CAT

							$("#txtNroCertificado").prop("disabled", true);
							$("#idCheckLiqPend").prop("disabled", true)
							$("#btnBusquedaCertificado").unbind("click")
							$("#btnBusquedaCertificado").attr("onclick", "");
							$("#btnBusquedaCertificado").click(reiniciarCertificado);
							$("#btnBusquedaCertificado").children().prop("class", "glyphicon glyphicon-minus-sign");
							idDeposito = data[0].idDeposito
							idAsociado = data[0].idAsociado;
							accion = 'E';
							refrescarPantalla(false);
							//  llena los campos del CAT:
						
							var idConcesionario = data[0].idConcesionario;
							var placa = data[0].placa;
							var fechaEmision = data[0].fechaEmision;
							var fechaInicio = data[0].fechaInicio;
							var fechaCaducidad = data[0].fechaCaducidad;
							var fechaControlInicio = data[0].fechaControlInicio;
							var fechaControlFin = data[0].fechaControlFin;
							var conDeuda = data[0].conDeuda;
							if (conDeuda != 'N') {
								conDeuda = 'S';
							}
							var fechaLiquidacion = data[0].fechaLiquidacion;
							temp_prima = data[0].prima;
							temp_aporte = data[0].aporte;
							temp_comision = data[0].comision;
							var tipoPersona = data[0].tipoPersona;
							var nroDoc = data[0].nroDocumento;
						
							// busca el registro completo del certificado:
							seleccionarConcesionario(idConcesionario)

							if (fechaEmision == '00/00/0000 00:00') {
								fechaEmision = '';
							}
						
							$("#txtFechaEmision").val(fechaEmision);
							$("#cmb_deuda").val(conDeuda);
							$("#cmb_deuda").change();
							if (conDeuda == 'N') {
								$("#txtFechaLiquidacion").val(fechaLiquidacion);
							}
							if (fechaInicio == '00/00/0000') {
								fechaInicio = '';
							}
							if (fechaCaducidad == '00/00/0000') {
								fechaCaducidad = '';
							}
							$("#txtFV_Inicio").val(fechaInicio);
							$("#txtFV_Fin").val(fechaCaducidad);
							if (fechaControlInicio == '00/00/0000') {
								fechaControlInicio = '';
							}
							if (fechaControlFin == '00/00/0000') {
								fechaControlFin = '';
							}
							$("#txtFCP_Inicio").val(fechaControlInicio);
							$("#txtFCP_Fin").val(fechaControlFin);

							$("#idTipoPersona_asoc").val(tipoPersona);
							$("#idTipoPersona_asoc").change();
							$("#idDNI_asoc").val(nroDoc);
							$("#btnBuscarPersona_asoc").click();

							$("#txtPlaca").val(placa);
							if (temp_prima == null) {
								temp_prima = 0;
							}
							if (temp_comision == null) {
								temp_comision = 0;
							}
							if (temp_aporte == null) {
								temp_aporte = 0;
							}
							$("#txtPrima").val(temp_prima);
							$("#txtAporte").val(temp_aporte);
							$("#txtComision").val(temp_comision);
							$("#txtTotal").val(temp_prima + temp_aporte + temp_comision);
							NoCambiarMontos = true;
							$("#idBtnBuscarPlaca").click(); //esta funcion no debe cambiar los montos del CAT (Al inicio)
							$.fancybox.close();
							$("#btnGuardar").val("Actualizar")
							$("#btnAnular").css("display", "block");
						} else {
							fancyAlertFunction("¡El Certificado " + $("#txtNroCertificado").val() + " no se encuentra disponible!", function () {
								$("#txtNroCertificado").focus();
							});
							if (accion == 'E') {
								refrescarPantalla(false);
							}
							accion = 'N';
						}
					}
				}
			}
		})
	} catch (err) {
		emitirErrorCatch(err, "buscarCertificado");
	}
}
function seleccionarConcesionario(midConcesionario) {
	// selecciona datos del concesionario usado:
	for (var i = 0; i < lista_Concesionarios.length; i++) {
		if (lista_Concesionarios[i].idConcesionario == midConcesionario) {
			$("#cmb_cono").val(lista_Concesionarios[i].idSede);
			$("#cmb_cono").change();
			$("#cmb_concesionario").val(midConcesionario);
			$("#cmb_concesionario").select2();
			break;
		}
	}

}
function reiniciarCertificado() {
	try {
		$("#txtNroCertificado").val("");
		$("#txtNroCertificado").focus();
		$("#txtNroCertificado").prop("disabled", false);
		$("#idCheckLiqPend").prop("disabled", false)
		$("#btnBusquedaCertificado").unbind("click")
		$("#btnBusquedaCertificado").attr("onclick", "");
		$("#btnBusquedaCertificado").click(buscarCertificado);
		$("#btnBusquedaCertificado").children().prop("class", "glyphicon glyphicon-search");
		$("#btnGuardar").val("Registrar");
		if (accion == 'E') {
			$("#cmb_deuda").val("N");
			$("#cmb_deuda").change();
			$("#txtFechaLiquidacion").val("");
			// concesionario
			$("#cmb_concesionario").val("");
			$("#cmb_concesionario").select2();
			$("#txtBusqueda_concesionario").val("");

			//Fecha de Emision:
			$("#txtFechaEmision").val(convertirAfechaString(new Date, true, false));

			// Fecha de Liquidacion
			$("#txtFechaLiquidacion").val("");

			// Fechas de vigencia:
			$("#txtFV_Inicio").val("");
			$("#txtFV_Fin").val("");

			// Fechas de Control Policial:
			$("#txtFCP_Inicio").val("");
			$("#txtFCP_Fin").val("");

			// reinicia los campos de Persona Asociado:
			cambiarDNI("asoc");

			// reinicia los campos de vehiculo:
			reiniciarBusquedaVehiculo();

			//reinicia los datos de duplicado
			$('#sectionNoTieneDuplicado').prop('hidden',true);
			$('#sectionSiTieneDuplicado').prop('hidden',true);

			//datos de asociado 


		}
		$("#txtNroCertificado").focus();
		$("#btnAnular").css("display", "none");
		accion = 'N';
		idDeposito = 0
	} catch (err) {
		emitirErrorCatch(err, "reiniciarCertificado");
	}
}
// busqueda una Persona por su DNI, donde tipoPersona = Flag
function buscarPersona(tipoPersona) {



	//alert("pepe");
	try {
		var tipoP = $("#idTipoPersona_" + tipoPersona).val();
		var numeroDigitos;
		var tipoDoc;
		if (tipoP == 'N') {
			tipoDoc = "DNI";
			numeroDigitos = 9;
		} else {// Persona Juridica
			tipoDoc = "RUC";
			numeroDigitos = 11;
		}
		var DNI = $("#idDNI_" + tipoPersona).val();
		var cantidadDigitos = DNI.split("").length;
		if (cantidadDigitos <= numeroDigitos) {

			var parametros = "&nroDoc=" + DNI;
			DAO.consultarWebServiceGet("getPersonaByNroDoc", parametros, function (data) {
				cargarResultPersona(data, tipoPersona, DNI, tipoP);
				$.fancybox.close();
			});

 
		} else {
			fancyAlertFunction("¡ Formato de " + tipoDoc + " incorrecto !", function (rpta) {
				if (rpta) {
					$("#idDNI_" + tipoPersona).focus();
				}
			})
		}
	} catch (err) {
		emitirErrorCatch(err, "buscarPersona");
	}
}

function busquedaSUNARP(){//wcubas

	var placa = $("#txtPlaca").val().trim();
		if (placa == "") {
			fancyAlertFunction("¡Ingrese la placa correctamente!", function () {
				$("#txtPlaca").focus();
			})
			return;
		}

	var paramBusqueda = "&placa=" + placa;
	//
	//limpiando data
	$("#txtMarca").val('')
	$("#txtModelo").val('');
	$("#txtAnno").val('');
	$("#txtSerieNro").val('');
	$("#txtAsientos").val('');
	$('#txtNumeroDocumentoPropietario').val('');
	$('#nombresPropietario').val('');
	$('#apepatPropietario').val('');
	$('#apematPropietario').val('');
	$("#txtPlaca").attr('is_servicio','0');

	DAO.consultarWebServiceGet("consulta_placa_api", paramBusqueda, function (rpta){

		$.fancybox.close();
		var codResultado = rpta.codResultado;
		var nroSerieMotor = rpta.nroSerieMotor;
		var marcaVehiculo = rpta.marca;
		var modeloVehiculo = rpta.modelo;
		var anioVehiculo = rpta.anio;
		var asientosVehiculo = rpta.asientos;
		var cantidadPropietario = rpta.propietarios.length;

		if(codResultado == 1 && nroSerieMotor.length > 0){ //data correcta

			$("#txtPlaca").attr('is_servicio','1');
			$("#txtMarca, #txtModelo,#txtAnno,#txtSerieNro, #txtAsientos").css('border','1px solid gray');

			$("#txtMarca").val(marcaVehiculo)
			$("#txtModelo").val(modeloVehiculo);
			$("#txtAnno").val(anioVehiculo);
			$("#txtSerieNro").val(nroSerieMotor);
			$("#txtAsientos").val(asientosVehiculo);
			$("#cmbCategoria").prop("disabled", false);
			$("#cmbUsoVehiculo").prop("disabled", false);
			$("#cmbClaseVehiculo").prop("disabled", false);
			if(anioVehiculo == 0 || anioVehiculo  == '####' ){
				$("#txtAnno").prop('disabled',false);
			}else{

				if(anioVehiculo.length == 4){
					$("#txtAnno").prop('disabled',true);
				}else{
					$("#txtAnno").prop('disabled',false);
				}
			}
			//seteando propietario
			if(cantidadPropietario > 0){
				var tipoPersonaPropietario = rpta.propietarios[0]["TipoPartic"].toUpperCase();
				var nombresCompletos = rpta.propietarios[0]["NombrePropietario"];
				var tipoDocumentoPropietario = rpta.propietarios[0]["TipoDocumento"].toUpperCase();
				var numeroDocumento = rpta.propietarios[0]["NroDocumento"];
				var apepatPropietario = "";
				var apematPropietario = "";
				var nombresPersonaPropietario = "";
				//
				if(tipoPersonaPropietario == "NATURAL"){
					apepatPropietario = nombresCompletos.split(' ')[0];
					apematPropietario = nombresCompletos.split(' ')[1];
					//obteniendo nombre completo
					for (let i = 0; i < nombresCompletos.split(' ').length; i++) {
						if(i > 1){
							nombresPersonaPropietario += nombresCompletos.split(' ')[i] + ' ';
						}
					}

					//nombresPersonaPropietario = nombresCompletos.slice(2).join(" ");
					$('#nombresPropietario').val(nombresPersonaPropietario);
					$('#apepatPropietario').val(apepatPropietario);
					$('#apematPropietario').val(apematPropietario);
					$('#selectPersonaPropietario').val('N');
					$('#selectTipoDocuPropietario').val(tipoDocumentoPropietario);

					$("#txtMarca,#txtModelo, #txtAnno, #txtSerieNro, #txtAsientos").css('border','1px solid gray');


				}else{
					$('#selectPersonaPropietario').val('J');
					$('#nombresPropietario').val(nombresCompletos);
					$('#selectTipoDocuPropietario').val(tipoDocumentoPropietario);
				}
				$('#txtNumeroDocumentoPropietario').val(numeroDocumento);
			}

			// desactiva el campo placa			
			$("#txtPlaca").prop("disabled", true);
			$("#idBtnBuscarPlaca").unbind("click");
			$("#idBtnBuscarPlaca").prop("class", "glyphicon glyphicon-minus-sign");
			$("#idBtnBuscarPlaca").click(reiniciarBusquedaVehiculo);
			
		}
	});

}

function busquedaReniecSUNAT(){
	var tipoPersonaBusqueda = $("#idTipoPersona_asoc").val();
	var nrodoc =  $("#idDNI_asoc").val();
	var tipoPersonaConsulta = (tipoPersonaBusqueda == "N" ? tipoPersonaBusqueda : "J");
	var paramBusquedaServicio = "&tipopersona=" + tipoPersonaConsulta + "&nrodocumento=" +nrodoc ;
	console.log("param", paramBusquedaServicio);
	DAO.consultarWebServiceGet("consulta_dni_empresa_servicio", paramBusquedaServicio, function (rpta){

		if(rpta.codResultado == 1){ // si trae data del servicio 
			$("#idDNI_asoc").attr('is_servicio','1');
			//
			if(tipoPersonaConsulta == "N"){
				$("#idNombres_asoc").val(rpta.nombres).css('border','1px solid gray');
				$("#idApePat_asoc").val(rpta.apepat).css('border','1px solid gray');
				$("#idApeMat_asoc").val(rpta.apemat).css('border','1px solid gray');
			}else{
				$("#idRazonSocial_asoc").val(rpta.nombres).css('border','1px solid gray');
			}

			$("#btnBuscarPersona_asoc").unbind("click");
			$("#btnBuscarPersona_asoc").attr("onclick", ""); // para los agraviados
			//$("#btnBuscarPersona_"+tipoPersona).val("Cambiar");
			$("#btnBuscarPersona_asoc").prop("class", "glyphicon glyphicon-minus-sign");
			$("#btnBuscarPersona_asoc" ).click(function () {
				cambiarDNI('asoc');
			});
		}
		$.fancybox.close();

	});
}
// carga los resultados de la busqueda de una persona x su DNI
function cargarResultPersona(data, tipoPersona, nrodoc, tipoPersonaBusqueda) {
	console.log("data persona",data);
	try {
		var idDistritoAsociado = null;
		var fueConsultadoPorServicio = false;
		var tipoP = $("#idTipoPersona_" + tipoPersona).val(); // N = Natural / J=Juridico
		$("#idDNI_" + tipoPersona).attr("idPersona", "0");
		$("#idDNI_" + tipoPersona).attr('is_servicio','0');
		if (data.length > 0) { // encontro a la persona que se buscaba
			idDistritoAsociado = data[0].distritoInicial;
			fueConsultadoPorServicio = ( data[0].VIENE_DE_SERVICIO ? true : false);

			if (data[0].tipoPersona == 'N') {
				$("#idNombres_" + tipoPersona).val(data[0].nombres);
				$("#idApePat_" + tipoPersona).val(data[0].apellidoPaterno);
				$("#idApeMat_" + tipoPersona).val(data[0].apellidoMaterno);

				if(!fueConsultadoPorServicio){
					$("#idNombres_" + tipoPersona).css('border','1px solid red');
					$("#idApePat_" + tipoPersona).css('border','1px solid red');
					$("#idApeMat_" + tipoPersona).css('border','1px solid red');
				}else{
					$("#idNombres_" + tipoPersona).css('border','1px solid gray');
					$("#idApePat_" + tipoPersona).css('border','1px solid gray');
					$("#idApeMat_" + tipoPersona).css('border','1px solid gray');
				}

			} else { // Juridico
				$("#idRazonSocial_" + tipoPersona).val(data[0].razonSocial);
				if(!fueConsultadoPorServicio){
					$("#idRazonSocial_" + tipoPersona).css('border','1px solid red');
				}else{
					$("#idRazonSocial_" + tipoPersona).css('border','1px solid gray');
				}

			}
			$("#idTelf_" + tipoPersona).val(data[0].telefonoMovil);
			$("#idDirec_" + tipoPersona).val(data[0].calle);
			$("#idDNI_" + tipoPersona).attr("idPersona", data[0].idPersona);
		}
			//si no encuentra nueva implementacion wcubas
			//nueva implementacion wcubas
			var tipoPersonaConsulta = (tipoPersonaBusqueda == "N" ? tipoPersonaBusqueda : "J");
			//var paramBusquedaServicio = "&tipopersona=" + tipoPersonaConsulta + "&nrodocumento=" +nrodoc ;
			// console.log("param", paramBusquedaServicio);
			//DAO.consultarWebServiceGet("consulta_dni_empresa_servicio", paramBusquedaServicio, function (rpta){
				
				// console.log("rpta", rpta);

				// if(rpta.codResultado == 1){ // si trae data del servicio 
					
				// 	if(tipoPersonaConsulta == "N"){
				// 		$("#idNombres_asoc").val(rpta.nombres);
				// 		$("#idApePat_asoc").val(rpta.apepat);
				// 		$("#idApeMat_asoc").val(rpta.apemat);
				// 	}else{
				// 		$("#idRazonSocial_asoc").val(rpta.nombres);
				// 	}
				// }

				$("#idTipoPersona_" + tipoPersona).prop("disabled", true);
				$("#idDNI_" + tipoPersona).prop("disabled", true);
				if (tipoPersonaConsulta == 'N') {
					$("#idNombres_" + tipoPersona).prop("disabled", false);
					$("#idApePat_" + tipoPersona).prop("disabled", false);
					$("#idApeMat_" + tipoPersona).prop("disabled", false);
					$("#idNombres_" + tipoPersona).focus();
		
					$("#idNombres_asoc").attr("requerido", "Nombres del Asociado");
					$("#idApePat_asoc").attr("requerido", "Apellido Paterno del Asociado");
					$("#idApeMat_asoc").attr("requerido", "Apellido Materno del Asociado");
					$("#idRazonSocial_" + tipoPersona).attr("requerido", "");
				} else {// Juridica
					$("#idRazonSocial_" + tipoPersona).prop("disabled", false);
					$("#idRazonSocial_" + tipoPersona).focus();
		
					$("#idNombres_" + tipoPersona).attr("requerido", "");
					$("#idApeMat_" + tipoPersona).attr("requerido", "");
					$("#idApePat_" + tipoPersona).attr("requerido", "");
					$("#idRazonSocial_" + tipoPersona).attr("requerido", "Razon Social del Asociado");
				}
		
				$("#idTelf_" + tipoPersona).prop("disabled", false);
				$("#idDistrito_" + tipoPersona).prop("disabled", false);
				$("#idDirec_" + tipoPersona).prop("disabled", false);
				cargarDistritoAsociado(idDistritoAsociado);
				if (idDistritoAsociado != null && idDistritoAsociado != "") {
					$("#idDistrito_" + tipoPersona).val(data[0].distritoInicial);
					$("#idDistrito_" + tipoPersona).select2();
				}
		
				$("#btnBuscarPersona_" + tipoPersona).unbind("click");
				$("#btnBuscarPersona_" + tipoPersona).attr("onclick", ""); // para los agraviados
				//$("#btnBuscarPersona_"+tipoPersona).val("Cambiar");
				$("#btnBuscarPersona_" + tipoPersona).prop("class", "glyphicon glyphicon-minus-sign");
				$("#btnBuscarPersona_" + tipoPersona).click(function () {
					cambiarDNI(tipoPersona);
				});
				$.fancybox.close();
				
			//});

		

	

		// $("#idTipoPersona_" + tipoPersona).prop("disabled", true);
		// $("#idDNI_" + tipoPersona).prop("disabled", true);
		// if (tipoP == 'N') {
		// 	$("#idNombres_" + tipoPersona).prop("disabled", false);
		// 	$("#idApePat_" + tipoPersona).prop("disabled", false);
		// 	$("#idApeMat_" + tipoPersona).prop("disabled", false);
		// 	$("#idNombres_" + tipoPersona).focus();

		// 	$("#idNombres_asoc").attr("requerido", "Nombres del Asociado");
		// 	$("#idApePat_asoc").attr("requerido", "Apellido Paterno del Asociado");
		// 	$("#idApeMat_asoc").attr("requerido", "Apellido Materno del Asociado");
		// 	$("#idRazonSocial_" + tipoPersona).attr("requerido", "");
		// } else {// Juridica
		// 	$("#idRazonSocial_" + tipoPersona).prop("disabled", false);
		// 	$("#idRazonSocial_" + tipoPersona).focus();

		// 	$("#idNombres_" + tipoPersona).attr("requerido", "");
		// 	$("#idApeMat_" + tipoPersona).attr("requerido", "");
		// 	$("#idApePat_" + tipoPersona).attr("requerido", "");
		// 	$("#idRazonSocial_" + tipoPersona).attr("requerido", "Razon Social del Asociado");
		// }

		// $("#idTelf_" + tipoPersona).prop("disabled", false);
		// $("#idDistrito_" + tipoPersona).prop("disabled", false);
		// $("#idDirec_" + tipoPersona).prop("disabled", false);
		// cargarDistritoAsociado(idDistritoAsociado);
		// if (idDistritoAsociado != null && idDistritoAsociado != "") {
		// 	$("#idDistrito_" + tipoPersona).val(data[0].distritoInicial);
		// 	$("#idDistrito_" + tipoPersona).select2();
		// }

		// $("#btnBuscarPersona_" + tipoPersona).unbind("click");
		// $("#btnBuscarPersona_" + tipoPersona).attr("onclick", ""); // para los agraviados
		// //$("#btnBuscarPersona_"+tipoPersona).val("Cambiar");
		// $("#btnBuscarPersona_" + tipoPersona).prop("class", "glyphicon glyphicon-minus-sign");
		// $("#btnBuscarPersona_" + tipoPersona).click(function () {
		// 	cambiarDNI(tipoPersona);
		// });

	} catch (err) {
		emitirErrorCatch(err, "cargarResultPersona");
	}
}
// cargar Distrito del asociado:
function cargarDistritoAsociado(idDistrito) {
	try {
		var idProvincia = "P01";
		if (idDistrito != null) {
			for (var i = 0; i < arrayDistritos.length; i++) {
				if (arrayDistritos[i].idDistrito == idDistrito) {
					idProvincia = arrayDistritos[i].idProvincia;
					break;
				}
			}
		}
		idProvinciaSelect = idProvincia;
		cargarDistritos("asoc", idProvincia);
	} catch (err) {
		emitirErrorCatch(err, "cargarDistritoAsociado");
	}
}
// realiza el cambio de DNI
function cambiarDNI(tipoPersona) {
	try {
		//Limpia los campos de la poliza y reincia los valores de busqueda
		$("#idDNI_" + tipoPersona).attr("idPersona", "0");
		$("#idDNI_" + tipoPersona).val("");
		$("#idNombres_" + tipoPersona).val("");
		$("#idApePat_" + tipoPersona).val("");
		$("#idApeMat_" + tipoPersona).val("");
		$("#idRazonSocial_" + tipoPersona).val("");
		$("#idTelf_" + tipoPersona).val("");
		$("#idDistrito_" + tipoPersona).val("");
		$("#idDistrito_" + tipoPersona).select2();
		labelTextWYSG("wb_label_asoc", "(...)");
		$("#idDirec_" + tipoPersona).val("");

		$("#idNombres_" + tipoPersona).attr("requerido", "");
		$("#idApeMat_" + tipoPersona).attr("requerido", "");
		$("#idApePat_" + tipoPersona).attr("requerido", "");
		$("#idRazonSocial_" + tipoPersona).attr("requerido", "");

		$("#idTipoPersona_" + tipoPersona).prop("disabled", false);
		$("#idDNI_" + tipoPersona).prop("disabled", false);

		$("#idNombres_" + tipoPersona).prop("disabled", true);
		$("#idApePat_" + tipoPersona).prop("disabled", true);
		$("#idApeMat_" + tipoPersona).prop("disabled", true);
		$("#idRazonSocial_" + tipoPersona).prop("disabled", true);
		$("#idTelf_" + tipoPersona).prop("disabled", true);
		$("#idDistrito_" + tipoPersona).prop("disabled", true);
		$("#idDirec_" + tipoPersona).prop("disabled", true);

		$("#btnBuscarPersona_" + tipoPersona).unbind("click");
		$("#btnBuscarPersona_" + tipoPersona).attr("onclick", ""); // para los agraviados
		//$("#btnBuscarPersona_"+tipoPersona).val("Buscar");
		$("#btnBuscarPersona_" + tipoPersona).prop("class", "glyphicon glyphicon-search");
		$("#btnBuscarPersona_" + tipoPersona).click(function () {
			buscarPersona(tipoPersona);
		});
		$("#idDNI_" + tipoPersona).focus();
	} catch (err) {
		emitirErrorCatch(err, "cambiarDNI");
	}
}
// realiza la busqueda de un vehiculo por su placa
function buscarVehiculo() {//wcubas
	//alert(8);
	$("#txtPlaca").attr('is_servicio','0');

	try {
		var placa = $("#txtPlaca").val().trim();
		if (placa == "") {
			fancyAlertFunction("¡Ingrese la placa correctamente!", function () {
				$("#txtPlaca").focus();
			})
			return;
		}

		//limpiando data
		$("#txtMarca").val('')
		$("#txtModelo").val('');
		$("#txtAnno").val('');
		$("#txtSerieNro").val('');
		$("#txtAsientos").val('');
		//
		var paramBusqueda = "&placa=" + placa;

		//limpiando antes de consultar
		$('#nombresPropietario').val('');
		$('#apepatPropietario').val('');
		$('#apematPropietario').val('');
		$('#selectPersonaPropietario').val('0');
		$('#selectTipoDocuPropietario').val('0');
		$('#txtNumeroDocumentoPropietario').val('');
		//$('#txtNumeroDocumentoPropietario').removeAttr('id-propietario-vehiculo');
		$('#txtNumeroDocumentoPropietario').attr('id-propietario-vehiculo','0');

		//DAO.consultarWebServiceGet("consulta_placa_api", paramBusqueda, function (rpta){

 
			// var codResultado = rpta.codResultado;
			// var nroSerieMotor = rpta.nroSerieMotor;
			// var marcaVehiculo = rpta.marca;
			// var modeloVehiculo = rpta.modelo;
			// var anioVehiculo = rpta.anio;
			// var asientosVehiculo = rpta.asientos;
			// var cantidadPropietario = rpta.propietarios.length;

			// $.fancybox.close();

			// if(codResultado == 1 && nroSerieMotor.length > 0){ //data correcta


			// 	$("#txtMarca").val(marcaVehiculo)
			// 	$("#txtModelo").val(modeloVehiculo);
			// 	$("#txtAnno").val(anioVehiculo);
			// 	$("#txtSerieNro").val(nroSerieMotor);
			// 	$("#txtAsientos").val(asientosVehiculo);
			// 	$("#cmbCategoria").prop("disabled", false);
			// 	$("#cmbUsoVehiculo").prop("disabled", false);
			// 	$("#cmbClaseVehiculo").prop("disabled", false);

			// 	//seteando propietario
			// 	if(cantidadPropietario > 0){
			// 		var tipoPersonaPropietario = rpta.propietarios[0]["TipoPartic"].toUpperCase();
			// 		var nombresCompletos = rpta.propietarios[0]["NombrePropietario"];
			// 		var tipoDocumentoPropietario = rpta.propietarios[0]["TipoDocumento"].toUpperCase();
			// 		var numeroDocumento = rpta.propietarios[0]["NroDocumento"];
			// 		var apepatPropietario = "";
			// 		var apematPropietario = "";
			// 		var nombresPersonaPropietario = "";
			// 		//
			// 		if(tipoPersonaPropietario == "NATURAL"){
			// 			apepatPropietario = nombresCompletos.split(' ')[0];
			// 			apematPropietario = nombresCompletos.split(' ')[1];
			// 			//obteniendo nombre completo
 
			// 			for (let i = 0; i < nombresCompletos.split(' ').length; i++) {
			// 				if(i > 1){
			// 					nombresPersonaPropietario += nombresCompletos.split(' ')[i] + ' ';
			// 				}
			// 			}

			// 			//nombresPersonaPropietario = nombresCompletos.slice(2).join(" ");
			// 			$('#nombresPropietario').val(nombresPersonaPropietario);
			// 			$('#apepatPropietario').val(apepatPropietario);
			// 			$('#apematPropietario').val(apematPropietario);
			// 			$('#selectPersonaPropietario').val('N');
			// 			$('#selectTipoDocuPropietario').val(tipoDocumentoPropietario);

			// 		}else{
			// 			$('#selectPersonaPropietario').val('J');
			// 			$('#nombresPropietario').val(nombresCompletos);
			// 			$('#selectTipoDocuPropietario').val(tipoDocumentoPropietario);

			// 		}
			// 		$('#txtNumeroDocumentoPropietario').val(numeroDocumento);

					
					
			// 	}

			// 	// desactiva el campo placa			
			// 	$("#txtPlaca").prop("disabled", true);
			// 	$("#idBtnBuscarPlaca").unbind("click");
			// 	$("#idBtnBuscarPlaca").prop("class", "glyphicon glyphicon-minus-sign");
			// 	$("#idBtnBuscarPlaca").click(reiniciarBusquedaVehiculo);
				
			// }
			
			//else{ //si no trae data entonces busca en la tabla como antes lo hacia

				var fueConsultadoPorServicio = false;
				var parametros = "&placa=" + placa;

				DAO.consultarWebServiceGet("buscarPlaca", parametros, function (data) {
					if (data.length > 0) {
						//completa la informacion del vehiculo
						console.log("data placa", data);
						//
						fueConsultadoPorServicio = ( data[0].VIENE_DE_SERVICIO ? true : false);

						$("#cmbCategoria").val(data[0].idCategoria)
						$("#cmbCategoria").change()
						$("#cmbUsoVehiculo").val(data[0].idUso)
						$("#cmbUsoVehiculo").change();
						$("#cmbClaseVehiculo").val(data[0].idClase)
						$("#cmbClaseVehiculo").change();
						$("#txtMarca").val(data[0].marca)
						$("#txtModelo").val(data[0].modelo);
						$("#txtAnno").val(data[0].anno)
						$("#txtSerieNro").val(data[0].nroSerieMotor)
						$("#txtAsientos").val(data[0].nroAsientos)
						$("#txtPlaca").attr("idVehiculo", data[0].idVehiculo)
						
						//
						var numeroDocumentoPropietario = data[0].numDocumentoPropietario;
						var apepatPropietario  =   data[0].apepat;
						var apematPropietario = data[0].apellido_materno;
						var nombreRazonSocialPropietario = data[0].nombreRazonSocial;
						var idPropietarioVehiculo = 0;
						var tipoPersonaPropietario = data[0].tipoPersonaPropietario;
						var tipoDocumentoPropietario = data[0].tipoDocumentoPropietario;
						//
						
						if(numeroDocumentoPropietario){
							idPropietarioVehiculo =  data[0].idpropietariovehiculo;
							$('#txtNumeroDocumentoPropietario').val(numeroDocumentoPropietario);
							$('#txtNumeroDocumentoPropietario').attr('id-propietario-vehiculo',idPropietarioVehiculo);

						}

						if(nombreRazonSocialPropietario){
							$('#nombresPropietario').val(nombreRazonSocialPropietario);
						}

						if(apepatPropietario){
							$('#apepatPropietario').val(apepatPropietario);
						}

						if(apematPropietario){
							$('#apematPropietario').val(apematPropietario);
						}
						//
						if(tipoPersonaPropietario){
							$('#selectPersonaPropietario').val(tipoPersonaPropietario);
						}
						//
						if(tipoDocumentoPropietario){
							$('#selectTipoDocuPropietario').val(tipoDocumentoPropietario);
						}

						if(!fueConsultadoPorServicio){
							$("#txtMarca, #txtModelo,#txtAnno,#txtSerieNro, #txtAsientos").css('border','1px solid red');
						}else{
							$("#txtMarca, #txtModelo,#txtAnno,#txtSerieNro, #txtAsientos").css('border','1px solid gray');
						}
					}
					// habilita los campos bloqueados:			
					$("#cmbCategoria").prop("disabled", false);
					$("#cmbUsoVehiculo").prop("disabled", false);
					$("#cmbClaseVehiculo").prop("disabled", false);
					$("#txtMarca").prop("disabled", false);
					$("#txtModelo").prop("disabled", false);

					$("#txtAnno").prop("disabled", false);
					$("#txtSerieNro").prop("disabled", false);
					$("#txtAsientos").prop("disabled", false);
		
					// desactiva el campo placa			
					$("#txtPlaca").prop("disabled", true);
					$("#idBtnBuscarPlaca").unbind("click");
					$("#idBtnBuscarPlaca").prop("class", "glyphicon glyphicon-minus-sign");
					$("#idBtnBuscarPlaca").click(reiniciarBusquedaVehiculo);
					$.fancybox.close();
				});

			//}
		//});



	} catch (err) {
		emitirErrorCatch(err, "buscarVehiculo");
	}
}
function reiniciarBusquedaVehiculo() {
	try {

		$("#cmbClaseVehiculo").val("")
		$("#cmbCategoria").val("")
		$("#cmbUsoVehiculo").val("")
		$("#txtMarca").val("")
		$("#txtModelo").val("")
		$("#txtAnno").val("")
		$("#txtSerieNro").val("")
		$("#txtAsientos").val("")

		$('#nombresPropietario').val('');
		$('#apepatPropietario').val('');
		$('#apematPropietario').val('');
		$('#selectPersonaPropietario').val('0');
		$('#selectTipoDocuPropietario').val('0');
		$('#txtNumeroDocumentoPropietario').val('');

		$("#cmbClaseVehiculo").prop("disabled", true);
		$("#cmbCategoria").prop("disabled", true);
		$("#cmbUsoVehiculo").prop("disabled", true);
		$("#txtMarca").prop("disabled", true);
		$("#txtModelo").prop("disabled", true);
		$("#txtAnno").prop("disabled", true);
		$("#txtSerieNro").prop("disabled", true);
		$("#txtAsientos").prop("disabled", true);

		$("#txtPlaca").attr("idVehiculo", "0")
		$("#txtPlaca").val("");
		$("#txtPlaca").prop("disabled", false);
		$("#idBtnBuscarPlaca").unbind("click");
		$("#idBtnBuscarPlaca").prop("class", "glyphicon glyphicon-search");
		$("#idBtnBuscarPlaca").click(buscarVehiculo);

		// Limpia los campos del monto
		$("#txtPrima").prop("disabled", true);
		$("#txtAporte").prop("disabled", true);
		$("#txtComision").prop("disabled", true);
		$("#txtTotal").prop("disabled", true);
		$("#txtComision").val("");
		$("#txtAporte").val("");
		$("#txtTotal").val("");
		$("#txtPrima").val("");
	} catch (err) {
		emitirErrorCatch(err, "reiniciarBusquedaVehiculo")
	}
}
function validarFechaInicioFin(flag) {
	try {
		var fechaInicio = $("#" + flag + "_Inicio").val();
		fechaInicio = fechaInicio.split("/");
		var fechaFin = $("#" + flag + "_Fin").val();
		fechaFin = fechaFin.split("/");

		var dateInicio = new Date(fechaInicio[2], parseInt(fechaInicio[1]) - 1, fechaInicio[0], 0, 0, 0, 0);
		var dateFin = new Date(fechaFin[2], parseInt(fechaFin[1]) - 1, fechaFin[0], 0, 0, 0, 0);

		if (dateFin > dateInicio) {
			return true;
		} else {
			return false;
		}

	} catch (err) {
		emitirErrorCatch(err, "validarFechaInicioFin")
	}
}
function guardar() {

	try {
		if (accion == 'E') { // inhabilita la  actualizacion de un cat si este ya contiene un deposito
			if (idDeposito != null && idDeposito > 0) {
				fancyAlert("¡No se puede editar el CAT debido a que contiene un deposito!")
				return false;
			}
		}
		if (validarCamposRequeridos("panelConcesionario") && validarCamposRequeridos("divFechaVigencia") && validarCamposRequeridos("divFechaPolicial") && validarCamposRequeridos("panelVehiculo") && validarCamposRequeridos("divMonto")) {
			//verifica que l nro de doc. del asociado se haya validado:
			if ($("#idDNI_asoc").prop("disabled") == false) {
				fancyAlertFunction("¡Debe validar la existencia de DNI/RUC del asociado!", function () {
					$("#idDNI_asoc").focus();
				})
				return;
			}
			// verifica que el numero de certificado este correcto
			if ($("#txtNroCertificado").prop("disabled") == false) {
				fancyAlertFunction("¡Debe validar la existencia del certificado ingreso!", function () {
					$("#txtNroCertificado").focus();
				})
				return;
			}
			// valida que una fecha Fin no sea mayor o igual q el inicio
			if (!validarFechaInicioFin("txtFV")) {
				fancyAlertFunction("¡(Fecha de Vigencia) La fecha de Inicio tiene que ser menor que la fecha de Fin!", function () {
					$("#txtFV_Inicio").focus();
				})
				return;
			}
			if (!validarFechaInicioFin("txtFCP")) {
				fancyAlertFunction("¡(Control Policial) La fecha de Inicio tiene que ser menor que la fecha de Fin!", function () {
					$("#txtFCP_Inicio").focus();
				})
				return;
			}
			if ($("#txtAnno").val() < 1900) {
				fancyAlertFunction("¡Año de fabricacion del vehiculo invalido!", function () {
					$("#txtAnno").focus();
				})
				return;
			}

			if ($("#txtAnno").val() == '') {
				fancyAlertFunction("¡Año de fabricacion del vehiculo invalido!", function () {
					$("#txtAnno").focus();
				})
				return;
			}

			//valida que tenga motor 
			if ($("#txtSerieNro").val().length == 0) {
				fancyAlertFunction("¡Verificar Serie del motor !", function () {
					$("#txtSerieNro").focus();
				})
				return;
			}

				//valida que tenga asientos 
			if ($("#txtAsientos").val().length == 0) {
				fancyAlertFunction("¡Verificar el campo asientos !", function () {
					$("#txtAsientos").focus();
				})
				return;
			}

			//valida propietario
			if ($("#txtNumeroDocumentoPropietario").val().length == 0) {
				fancyAlertFunction("¡Debe buscar al propietario por medio de la SUNARP !", function () {
					$("#txtNumeroDocumentoPropietario").focus();
				})
				return;
			}

				
			var certificadoDuplicado = "";
			//validando CAT duplicado
			var isDuplicadoSeleccion = $('#chckDuplicado').is(':checked');

			if(isDuplicadoSeleccion){ //si es duplicado debe validar que el duplicado sea valido o esté lleno

				var validoElCertificadoDuplicado = $('#txtValidaCATDuplicado').attr('data-valido-duplicado');
				if(Number(validoElCertificadoDuplicado) == 0){ //si no valida 
					fancyAlertFunction("¡Debe ingresar un certificado válido para el duplicado !", function () {});
					return;
				}else{
					certificadoDuplicado = $('#txtValidaCATDuplicado').val();
				}

			}else{
				certificadoDuplicado = "";
			}

			
			fancyConfirm("¿Desea continuar con la operación?", function (rpta) {
				if (rpta) {
					var dniConsultaServicio = Number($("#idDNI_asoc").attr("is_servicio"));
					var idPropietarioVehiculo_ = $('#txtNumeroDocumentoPropietario').attr('id-propietario-vehiculo');
					//

					var funcionName = "guardarCAT";
					if (accion == 'E') { // Editar CAT:

						if(isDuplicadoSeleccion){ //si es duplicado
							funcionName = "guardarCAT";
						}else{
							funcionName = "actualizarCAT";
						}
					}

					var parametros = "&idConcesionario=" + $("#cmb_concesionario").val() +
						"&nroCertificado=" + (isDuplicadoSeleccion ? certificadoDuplicado : $("#txtNroCertificado").val()) +
						"&fechaEmision=" + dateTimeFormat($("#txtFechaEmision").val()) +
						"&conDeuda=" + $("#cmb_deuda").val() +
						"&fechaLiquidacion=" + dateTimeFormat($("#txtFechaLiquidacion").val()) +
						"&fechaV_inicio=" + dateTimeFormat($("#txtFV_Inicio").val()) +
						"&fechaV_fin=" + dateTimeFormat($("#txtFV_Fin").val()) +
						"&fechaCP_inicio=" + dateTimeFormat($("#txtFCP_Inicio").val()) +
						"&fechaCP_fin=" + dateTimeFormat($("#txtFCP_Fin").val()) +
						"&idPersona=" + $("#idDNI_asoc").attr("idPersona") +
						"&tipoPersona=" + $("#idTipoPersona_asoc").val() +
						"&DNI=" + $("#idDNI_asoc").val() +
						"&nombres=" + $("#idNombres_asoc").val() +
						"&apePat=" + $("#idApePat_asoc").val() +
						"&apeMat=" + $("#idApeMat_asoc").val() +
						"&razonSocial=" + $("#idRazonSocial_asoc").val() +
						"&telf=" + $("#idTelf_asoc").val() +
						"&idDistrito=" + $("#idDistrito_asoc").val() +
						"&direccion=" + $("#idDirec_asoc").val() +
						"&idVehiculo=" + $("#txtPlaca").attr("idVehiculo") +
						"&placa=" + $("#txtPlaca").val() +
						"&idCategoria=" + $("#cmbCategoria").val() +
						"&idUso=" + $("#cmbUsoVehiculo").val() +
						"&idClase=" + $("#cmbClaseVehiculo").val() +
						"&marca=" + $("#txtMarca").val() +
						"&modelo=" + $("#txtModelo").val() +
						"&anno=" + $("#txtAnno").val() +
						"&serieMotor=" + $("#txtSerieNro").val() +
						"&nroAsientos=" + $("#txtAsientos").val() +
						"&prima=" + $("#txtPrima").val() +
						"&comision=" + $("#txtComision").val() +
						"&aporte=" + $("#txtAporte").val() +
						"&montoTotal=" + $("#txtTotal").val() +
						"&idAsociado=" + idAsociado +
						"&liquidacionPendiente=" + $("#idCheckLiqPend").prop("checked") +
						"&nroDocIsServicio=" + dniConsultaServicio + 
						"&tipoPersonaPropietario=" + $('#selectPersonaPropietario').val() + 
						"&tipoDocumentoPropietario=" + $('#selectTipoDocuPropietario').val() + 
						"&numDocumentoPropietario=" + $('#txtNumeroDocumentoPropietario').val() + 
						"&nombresPropietario=" + replaceSingleQuote($('#nombresPropietario').val()) + 
						"&apepatPropietario=" + $('#apepatPropietario').val() + 
						"&apematPropietario=" + $('#apematPropietario').val() + 
						"&idpropietariovehiculo=" + idPropietarioVehiculo_ + 
						"&isServiceSUNARP=" + Number($("#txtPlaca").attr('is_servicio')) +
						"&vistaRegistro=" + "REGISTRO CERTIFICADO VENDIDO |" + funcionName+ 
						"&certificadoDuplicado=" + (isDuplicadoSeleccion ? $("#txtNroCertificado").val() : 0 );

					//console.log("funcionName",funcionName);
					//console.log("parametros",parametros);
					
					DAO.consultarWebServiceGet(funcionName, parametros, function (data) {
						
						//console.log("data luego actualiza", data);
						//
						var idCAT = data[0];
						if (idCAT > 0) {
							migrarCertificado($("#txtNroCertificado").val());

							fancyAlertFunction("¡Operación Exitosa!", function () {
								refrescarPantalla();
							})
						} else {

							if(idCAT == -999){ //si entro a uno de las condiciones
								fancyAlert("¡verificar datos ingresados!");

							}else{
								fancyAlert("¡Operación Fallida!");

							}
						}
					});
				}
			});
		}
	} catch (err) {
		emitirErrorCatch(err, "guardar")
	}
}


function replaceSingleQuote(str) {
    // Utiliza una expresión regular para encontrar todas las ocurrencias de la comilla simple
    var regex = /'/g;
    // Reemplaza todas las ocurrencias de la comilla simple con un espacio vacío
    var newStr = str.replace(regex, ' ');
    return newStr;
}


function migrarCertificado(nroCertificado){//migra certificado wcubas
	var param = "&nroCertificado=" + nroCertificado;
	DAO.consultarWebServiceGet("migra_registro", param, function (data) {
		//console.log("holaaa");
		//refrescarPantalla();
		refrescarPantalla();
	});
}

function liberaCertificadoMigracion(placa){//migra certificado wcubas
	var param = "&placa=" + placa;
	DAO.consultarWebServiceGet("migra_liberacion", param, function (data) {
		//console.log("holaaa");
		//refrescarPantalla();
		refrescarPantalla();
	});
}

function refrescarPantalla(reiniciaCertif) {
	try {
		if (typeof reiniciaCertif == 'undefined') {
			reiniciaCertif = true;
		}
		// concesionario
		$("#cmb_concesionario").val("");
		$("#cmb_concesionario").select2();
		$("#txtBusqueda_concesionario").val("");

		//certificado:
		if (reiniciaCertif) {
			reiniciarCertificado();
		}

		//Fecha de Emision:
		$("#txtFechaEmision").val(convertirAfechaString(new Date, true, false));

		// Fecha de Liquidacion
		$("#txtFechaLiquidacion").val("");

		// Fechas de vigencia:
		$("#txtFV_Inicio").val("");
		$("#txtFV_Fin").val("");

		// Fechas de Control Policial:
		$("#txtFCP_Inicio").val("");
		$("#txtFCP_Fin").val("");

		// reinicia los campos de Persona Asociado:
		cambiarDNI("asoc");

		// reinicia los campos de vehiculo:
		reiniciarBusquedaVehiculo();

		$("#cmb_concesionario").focus();
		openSelect($("#cmb_concesionario"));
		$("#btnGuardar").val("Registrar")
		$("#btnAnular").css("display", "none");

		//reinicia datos de duplicado
		$('#chckDuplicado').prop('checked',false);
		$('#txtValidaCATDuplicado').prop('hidden',true);
		$('#sectionIconoBusquedaCertitificado').prop('hidden',true);
		$('#txtValidaCATDuplicado').val('');
		$('#txtValidaCATDuplicado').attr('data-valido-duplicado',0);
		// $('#sectionSiTieneDuplicado').prop('hidden',true);
		// $('#sectionNoTieneDuplicado').prop('hidden',true);

	} catch (err) {
		emitirErrorCatch(err, "refrescarPantalla");
	}
}
function activaFechaLiquidacion(conDeuda) {
	try {
		$("#txtFechaLiquidacion").val("");
		if (conDeuda == 'S') { // oculta la fecha de liquidacion
			$("#txtFechaLiquidacion").css("display", "none");
			$("#txtFechaLiquidacion").attr("requerido", "");
			$("#fecha_liquidacion_calendar").css("display", "none");
			$("#wb_lblLiquidacion").css("display", "none");
		} else {
			$("#txtFechaLiquidacion").css("display", "block");
			$("#txtFechaLiquidacion").attr("requerido", "Fecha de Liquidacion");
			$("#fecha_liquidacion_calendar").css("display", "block");
			$("#wb_lblLiquidacion").css("display", "block");
		}
	} catch (err) {
		emitirErrorCatch(err, "activaFechaLiquidacion")
	}
}
function calcularFechaFin(flag) { // calcula la fecha fin de control policial y de vigencia
	try {
		if ($("#" + flag + "_Inicio").val() != "") {
			var date = $("#" + flag + "_Inicio").val().split("/");
			var fechaInicio = new Date(date[2], parseInt(date[1]) - 1, date[0], 0, 0, 0, 0);
			fechaInicio.setYear(fechaInicio.getFullYear() + 1); // fecha Inicio + 1 año = fechaFin
			$("#" + flag + "_Fin").val(convertirAfechaString(fechaInicio, false, false));
		}
	} catch (err) {
		emitirErrorCatch(err, "calcularFechaFin")
	}
}
function cambiarTipoPersona() {
	try {
		var tipoP = $("#idTipoPersona_asoc").val();
		if (tipoP == 'N') {
			$("#idDNI_asoc").attr("maxlength", 9);
		} else {
			$("#idDNI_asoc").attr("maxlength", 11);
		}
	} catch (err) {
		emitirErrorCatch(err, "cambiarTipoPersona")
	}
}
function anularCAT() {
	var placaActual = $('#txtPlaca').val();
	
	try {
		fancyConfirm("¿Confirma la anulación del certificado?", function (rpta) {
			if (rpta) {
				var parametros = "&nroCertificado=" + $("#txtNroCertificado").val();
				DAO.consultarWebServiceGet("anularCAT", parametros, function (data) {
					if (data[0] > 0) {
						
						liberaCertificadoMigracion(placaActual);

						fancyAlertFunction("¡Anulación exitosa!", function () {
							refrescarPantalla();
						});
					}
				})
			}
		})
	} catch (err) {
		emitirErrorCatch(err, "anularCertificado")
	}
}