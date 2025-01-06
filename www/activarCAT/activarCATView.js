// ****** DEL USUARIO *************************************************************************
var idUsuario = 0; // id del usuario identificado
var idPromotor = 0;
var enCartera = false;
var idProducto = 0; //si CAT en cartera del promotor este es el idProducto usado
var prodUNID = "";  //y la unidad de medida usada
var idConcesionario = 0;
var idConcesionarioPromotor = 0;
var idArea = 0; // id Area al que pertencece
var nombreArea = "";
var perfilUsuario1 = 0; // Perfil principal del usuario
var perfilUsuario2 = 0;
var perfilUsuario3 = 0;
var idLocal = 0; // id del local donde pertenece el usuario
var localRemoto; // es remoto = S / No es remoto = N
// ***** TIMERS JAVASCRIPT *******************************************************************
var timerHoraActualizacion; // Actualiza la hora de conexion del usuario
var timerAlerta; // Cambia de color de amarillo a blanco y viceversa cada 3 milisegundos a las alertas de Expendientes pendientes
var timerAlertaCrita; // Cambia de color amarillo a blanco y viceversa cada 3 milisegundos a las alertas de Expedientes con tiempo critico. 
var timerBuscarExpedientesPendientes; // Busca expedientes pendientes y con tiempo critico

//funciones heredadas:

/* @activarAdvertencia: activa o desactiva la advertencia al salir del sistema sin cerrar sesion
     PARAMETROS:
      - estado (Boleano) : true= activa, false: desactiva
*/
function activarAdvertencia(estado) {
	try {
		if (estado) {
			window.onbeforeunload = function () { // Activa advertencia al intenta salir del sistema cerrando la pestaña del navegador 
				return "¡¡ Para salir del sistema, primero debe cerrar su sesion !!";
			}
		} else {
			window.onbeforeunload = null;
		}
	} catch (err) {
		emitirErrorCatch(err, "activarAdvertencia")
	}
}
/* @cargarDatosUsuario: carga la informacion del usuario en la cabecera del sistema y las variables globales del sistema.
    Paramatros:
    - data: array json de los datos del usuario obtenidos al validar las credenciales, 
    - callback: funcion que se ejecuta despues de cargar la informacion
*/
function cargarDatosUsuario(data, callback) {
	try {
		/* Variables relacionadas al Usuario */
		idUsuario = data.idUsuario;
		if (data.idPromotor > 0) {
			idPromotor = data.idPromotor;
		}
		idArea = data.idArea;
		nombreArea = data.nombreArea; // Nombre del area del usuario
		perfilUsuario1 = data.idPerfil1;
		perfilUsuario2 = data.idPerfil2;
		perfilUsuario3 = data.idPerfil3;
		idLocal = data.idLocal;
		localRemoto = data.localRemoto;
		// Obteniendo Fecha y hora de ingreso al sistema:
		var date = new Date();
		var solofecha = convertirAfechaString(date, false);
		var AMPM = "am.";
		var soloHora = date.getHours();
		var soloMinutos = agregarCEROaLaIzquierda(date.getMinutes());
		if (soloHora > 11) {
			if (soloHora > 12) {
				soloHora = soloHora - 12;
			}
			AMPM = "pm.";
		}
		var horaCompleta = agregarCEROaLaIzquierda(soloHora) + ":" + soloMinutos + " " + AMPM;
		var fechaIngreso = solofecha + " " + horaCompleta;
		$("#txtNombres").val(data.Nombres.trim() + ", " + data.Apellidos.trim());
		if (typeof callback == "function") {
			callback();
		}

	} catch (err) {
		emitirErrorCatch(err, "cargarDatosUsuario")
	}
}
/* @salirDelSistema: Finaliza la sesion de un usuario
*/
function salirDelSistema() {
	try {
		if (perfilUsuario1 != 2) {
			/*
			fancyConfirm("¿Esta seguro que desea cerrar su sesion?", function (estado) {
				if (estado) {
					fancyAlertWait("Cerrando sesion");
					marcarSalidaDelSistema('F');
				}
			}); */
			var rpta = confirm("¿Esta seguro que desea cerrar su sesion?");
			if (rpta) {
				fancyAlertWait("Cerrando sesion");
				marcarSalidaDelSistema('F');
			}
		} else {
			marcarSalidaDelSistema('T');
		}
	} catch (err) {
		emitirErrorCatch(err, "salirDelSistema")
	}
}
/* @marcarSalidaDelSistema: Registra la hora del salida del usuario, solo si este no es un USUARIO SUPERVISOR
    PARAMETROS:
        - esUsuarioTSIGO: T= es usuario supervisor; F = no lo es
*/

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
		console.log("rpta", rpta);

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

function marcarSalidaDelSistema(esUsuarioTSIGO) {
	try {
		var parametros = "&idUsuario=" + idUsuario +
			"&tipo=S" +
			"&esUsuarioTSIGO=" + esUsuarioTSIGO +
			"&cerrarSesion=s";
		consultarWebServiceGet("insertarAsistencia", parametros, function (data) {
			if (perfilUsuario1 == '2' || data.length > 0) {
				activarAdvertencia(false)
				location.href = "signout1"; // cierra cesion
			} else {
				fancyAlert("Lo sentimos no se ha podido cerrar correctamente su sesion, por favor comuniquese con el soporte técnico");
			}
		}, "Cerrando sesion");
	} catch (err) {
		emitirErrorCatch(err, "marcarSalidaDelSistema")
	}
}
//-------- desde parent.js ---------------------------------------
// frameWork para los distrito y provincias:
var idProvinciaSelect = "";
var arrayDistritos = new Array();
var arrayProvincias = new Array();
var arrayDepartamentos = new Array();

function cargarProvinciasDep(prefijo, idProvincia, button) {
	try {
		var item = $("#idDistrito_" + prefijo).val();
		if (item == 'OTRP' || button == "button") { //Otra Provincia
			//idProvinciaSelect=idProvincia;
			abrirVentanaFancyBox(400, 220, "provdepa", true, function (data) {
				if (data != undefined) {
					idProvinciaSelect = data[0].provincia;
					cargarDistritos(prefijo, idProvinciaSelect);
				} else { // No se completo
					$("idDistrito_" + prefijo).val("");
				}
			});
		}
	} catch (err) {
		emitirErrorCatch(err, "cargarProvinciasDep");
	}
}
function cargarDistritos(prefijo, idProvincia) {
	try {
		$("#idDistrito_" + prefijo).html("");
		$("#idDistrito_" + prefijo).append(new Option("Seleccione", ""));
		for (var i = 0; i < arrayDistritos.length; i++) {
			if (arrayDistritos[i].idProvincia == idProvincia) {
				$("#idDistrito_" + prefijo).append(new Option(arrayDistritos[i].nombre, arrayDistritos[i].idDistrito))
			}
		}
		$("#idDistrito_" + prefijo).append("<option value='OTRP'>Otra Provincia</option>"); // OTRP=Otra Provincia
		//$("#idDistrito_"+prefijo).select2();
		var nombreProvincia = "";
		var nombreDepartamento = "";
		for (var y = 0; y < arrayProvincias.length; y++) {
			if (arrayProvincias[y].idProvincia == idProvincia) {
				nombreProvincia = arrayProvincias[y].nombreProvincia;
				for (var z = 0; z < arrayDepartamentos.length; z++) {
					if (arrayDepartamentos[z].idDepartamento == arrayProvincias[y].idDepartamento) {
						nombreDepartamento = arrayDepartamentos[z].nombreDepartamento;
						break;
					}
				}
				break;
			}
		}
		labelTextWYSG("wb_label_" + prefijo, "Dpto: " + nombreDepartamento + ", Prov: " + nombreProvincia);
	} catch (err) {
		emitirErrorCatch(err, "cargarDistritos")
	}
}

//FUNCIONES QUE SE CARGAR AL INICIO:
var accion = "N"; // N = Nuevo ; E = Editar 
var idAsociado = 0;
var DAO = new DAOWebServiceGeT("wbs_ventas") // Objeto del web service de Ventas
var lista_Concesionarios = [];
var lista_Categorias = [];
var lista_Usos = [];
var lista_Clases = [];
var idLocal = 0;
var idPerfil = 0;
var NoCambiarMontos = false; //Flag usado para funcion activarMonto

cargarInicio(function () {

	activarAdvertencia(true);
	cargarDatosUsuario(arrayResponse, function () {
		idUsuarioUpdate = idUsuario; //definido en mhbsoftScript.js
		idPerfil = perfilUsuario1;
		if (idPerfil != 1 && idPerfil != 2) {
			//usuario comun => debe ser promotor
			if (idPromotor == 0) {
				alert("¡ Ud. NO es un PROMOTOR ! \r\n No puede continuar...");
				marcarSalidaDelSistema('F');
			}
		}
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
					// obtiene la lista de los usos y sus clases:
					DAO.consultarWebServiceGet("getAllUsos", "", function (data1) {
						lista_Usos = data1; // guarda la informacion de los usos
						DAO.consultarWebServiceGet("getAllClasesXuso", "", function (data2) {
							lista_Clases = data2;
							DAO.consultarWebServiceGet("getCategorias", "", function (data) {
								lista_Categorias = data;
								//Todos estos CATs se emitiran con flag conDeuda=SI

								$("#idTipoPersona_asoc").change(function () {
									cambiarTipoPersona();
								});
								crearDateTimes()
								activarBotones();
								activarCmbUsos();
								activarCmbCategorias();

								$("#idDNI_asoc").attr("idPersona", "0");
								$("#idDNI_asoc").attr("maxlength", "9");
								$("#idDNI_asoc").addClass("solo-numero");
								$("#idNombres_asoc").prop("disabled", true);
								$("#idNombres_asoc").addClass("solo-alfanum1");
								$("#idNombres_asoc").keyup(function () {
									convertMayusculas(this)
								});
								$("#idApePat_asoc").prop("disabled", true);
								$("#idApePat_asoc").addClass("solo-alfanum1");
								$("#idApePat_asoc").keyup(function () {
									convertMayusculas(this)
								});

								$("#idApeMat_asoc").prop("disabled", true);
								$("#idApeMat_asoc").addClass("solo-alfanum1");
								$("#idApeMat_asoc").keyup(function () {
									convertMayusculas(this)
								});
								$("#idRazonSocial_asoc").prop("disabled", true);
								$("#idRazonSocial_asoc").addClass("solo-alfanum1");
								$("#idRazonSocial_asoc").keyup(function () {
									convertMayusculas(this)
								});
								$("#idDistrito_asoc").prop("disabled", true);
								$("#idTelf_asoc").prop("disabled", true);
								$("#idTelf_asoc").addClass("solo-numero");
								$("#idDirec_asoc").prop("disabled", true);
								$("#idDirec_asoc").addClass("solo-alfanum1");
								$("#idDirec_asoc").keyup(function () {
									convertMayusculas(this)
								});

								$("#txtPlaca").attr("idVehiculo", "0");
								$("#txtPlaca").addClass("solo-alfanum");
								$("#txtPlaca").keyup(function () {
									convertMayusculas(this)
								});
								$("#cmbClaseVehiculo").prop("disabled", true);
								$("#cmbCategoria").prop("disabled", true);
								$("#cmbUsoVehiculo").prop("disabled", true);
								$("#txtMarca").prop("disabled", true);
								$("#txtMarca").addClass("solo-alfanum1");
								$("#txtMarca").keyup(function () {
									convertMayusculas(this)
								});
								$("#txtModelo").prop("disabled", true);
								$("#txtModelo").addClass("solo-alfanum1");
								$("#txtModelo").keyup(function () {
									convertMayusculas(this)
								});
								$("#txtAnno").prop("disabled", true);
								$("#txtAnno").attr("maxlength", "4");
								$("#txtAnno").addClass("solo-numero");
								$("#txtSerieNro").prop("disabled", true);
								$("#txtSerieNro").addClass("solo-alfanum");
								$("#txtSerieNro").keyup(function () {
									convertMayusculas(this)
								});
								$("#txtAsientos").prop("disabled", true);
								$("#txtAsientos").addClass("solo-numero");

								// agregar campos requeridos:
								$("#txtNroCAT").attr("requerido", "Nro de Certificado");
								$("#txtNroCAT").addClass("solo-numero");

								$("#txtFechaEmision").attr("requerido", "Fecha y Hora de Emision");
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
	})
});
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
function crearDateTimes() { // crea los campos de fecha 
	try {
		// Fecha y Hora de Emision que por defecto se muestra la fecha y hora actual:
		$("#txtFechaEmision").datetimepicker({ lan: 'es', format: 'd/m/Y H:i', timepicker: true, closeOnDateSelect: false, step: 15 });
		$("#txtFechaEmision").val(convertirAfechaString(new Date, true, false));

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
		$("#btnBusquedaCertificado").click(buscarCertificado); // Busqueda de certificado
		$("#btnBuscarPersona_asoc").click(function () {
			buscarPersona("asoc");
		})
		$("#idBtnBuscarPlaca").click(buscarVehiculo);
		$("#btnRegistra").click(guardar);
		$("#imgSalir").click(salirDelSistema);
	} catch (err) {
		emitirErrorCatch(err, "activarBotones");
	}
}

var temp_prima = 0;
var temp_aporte = 0;
var temp_comision = 0;
function buscarCertificado() {
	try {
		enCartera = false;
		var nroCertificado = $("#txtNroCAT").val().trim();
		if (nroCertificado == "") {
			alert("Debe ingresar el número de certificado");
			$("#txtNroCAT").focus();
			return;
		}
		var parametros = "&nroCertificado=" + nroCertificado + "&liquidacionPendiente=true" //+ $("#idCheckLiqPend").prop("checked");
		DAO.consultarWebServiceGet("buscarCertificado", parametros, function (data) {
			if (data.length == 0) {
				alert("¡El número de Certificado " + $("#txtNroCAT").val() + ", no existe!");
				$("#txtNroCAT").focus();
				if (accion == 'E') {
					refrescarPantalla(false);
				}
				accion = 'N';
			} else {
				if (data[0].tipOperacion == 'E' && data[0].idGuiaSalida == 0 && data[0].estado != '8' && data[0].estado != '9') {
					$("#txtNroCAT").prop("disabled", true); //esta accion permitira que finalmente se puedan guardar los datos
					$("#btnBusquedaCertificado").unbind("click")
					$("#btnBusquedaCertificado").attr("onclick", "");
					$("#btnBusquedaCertificado").click(reiniciarCertificado);
					$("#btnBusquedaCertificado").children().prop("class", "glyphicon glyphicon-minus-sign");
					idConcesionario = data[0].idConcesionario;
					$("#lblStatus").val("¡Certificado Distribuido y Disponible! ");
					accion = 'N';
				} else if (data[0].estado == '8' || data[0].estado == '9') {
					$("#lblStatus").val("¡Certificado ya ha sido REGISTRADO ! ");
				} else if (data[0].tipOperacion == 'I' && data[0].idGuiaSalida > 0 && data[0].estado == '0' && data[0].idPromotor == idPromotor) {
					$("#lblStatus").val("Certificado en CARTERA del Promotor...");
					$("#txtNroCAT").prop("disabled", true); //esta accion permitira que finalmente se puedan guardar los datos
					$("#btnBusquedaCertificado").unbind("click")
					$("#btnBusquedaCertificado").attr("onclick", "");
					$("#btnBusquedaCertificado").click(reiniciarCertificado);
					$("#btnBusquedaCertificado").children().prop("class", "glyphicon glyphicon-minus-sign");
					//el certificado se puede registrar asociando con un Concesionario Generico
					idConcesionarioPromotor = data[0].idConcesionarioPromotor;
					idConcesionario = idConcesionarioPromotor;
					idProducto = data[0].idArticulo;
					prodUNID = data[0].Unidad;
					enCartera = true;
				} else {
					$("#lblStatus").val("¡Certificado NO Disponible ! ");
				}
			}
		}, false)
	} catch (err) {
		emitirErrorCatch(err, "buscarCertificado");
	}
}

function reiniciarCertificado() {
	try {
		$("#lblStatus").val("Status: ");
		$("#txtNroCAT").val("");
		$("#txtNroCAT").focus();
		$("#txtNroCAT").prop("disabled", false);
		$("#btnBusquedaCertificado").unbind("click")
		$("#btnBusquedaCertificado").attr("onclick", "");
		$("#btnBusquedaCertificado").click(buscarCertificado);
		$("#btnBusquedaCertificado").children().prop("class", "glyphicon glyphicon-search");
		//Fecha de Emision:
		$("#txtFechaEmision").val(convertirAfechaString(new Date, true, false));

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

		$("#txtNroCAT").focus();
		accion = 'N';
	} catch (err) {
		emitirErrorCatch(err, "reiniciarCertificado");
	}
}
// busqueda una Persona por su DNI, donde tipoPersona = Flag
function buscarPersona(tipoPersona) {
	try {
		var tipoP = $("#idTipoPersona_" + tipoPersona).val();
		var numeroDigitos;
		var tipoDoc;
		if (tipoP == 'N') {
			tipoDoc = "DNI";
			numeroDigitos = 8;
		} else {// Persona Juridica
			tipoDoc = "RUC";
			numeroDigitos = 11;
		}
		var DNI = $("#idDNI_" + tipoPersona).val();
		var cantidadDigitos = DNI.split("").length;
		if (cantidadDigitos == numeroDigitos) {
			var parametros = "&nroDoc=" + DNI;
			$("#idBtnBuscarPersona_asoc").prop("class", "glyphicon glyphicon-refresh glyphicon-spin");
			DAO.consultarWebServiceGet("getPersonaByNroDoc", parametros, function (data) {
				cargarResultPersona(data, tipoPersona);
				$.fancybox.close();
			}, false);
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
// carga los resultados de la busqueda de una persona x su DNI
function cargarResultPersona(data, tipoPersona) {
	try {
		var idDistritoAsociado = null;
		var fueConsultadoPorServicio = false;

		var tipoP = $("#idTipoPersona_" + tipoPersona).val(); // N = Natural / J=Juridico
		$("#idDNI_" + tipoPersona).attr("idPersona", "0");
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
		$("#idTipoPersona_" + tipoPersona).prop("disabled", true);
		$("#idDNI_" + tipoPersona).prop("disabled", true);
		if (tipoP == 'N') {
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
			//$("#idDistrito_" + tipoPersona).select2();
		}

		$("#btnBuscarPersona_" + tipoPersona).unbind("click");
		$("#btnBuscarPersona_" + tipoPersona).attr("onclick", ""); // para los agraviados
		//$("#btnBuscarPersona_"+tipoPersona).val("Cambiar");
		$("#btnBuscarPersona_" + tipoPersona).prop("class", "glyphicon glyphicon-minus-sign");
		$("#btnBuscarPersona_" + tipoPersona).click(function () {
			cambiarDNI(tipoPersona);
		});

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
		//$("#idDistrito_" + tipoPersona).select2();
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
function buscarVehiculo() {
	try {
		var placa = $("#txtPlaca").val().trim();
		if (placa == "") {
			fancyAlertFunction("¡Ingrese la placa correctamente!", function () {
				$("#txtPlaca").focus();
			})
			return;
		}
		$("#idBtnBuscarPlaca").prop("class", "glyphicon glyphicon-refresh glyphicon-spin");
		var parametros = "&placa=" + placa;

		//limpiando antes de consultar
		$('#nombresPropietario').val('');
		$('#apepatPropietario').val('');
		$('#apematPropietario').val('');
		$('#selectPersonaPropietario').val('0');
		$('#selectTipoDocuPropietario').val('0');
		$('#txtNumeroDocumentoPropietario').val('');
		$('#txtNumeroDocumentoPropietario').removeAttr('id-propietario-vehiculo');
		$('#txtNumeroDocumentoPropietario').attr('id-propietario-vehiculo','0');
		
		var fueConsultadoPorServicio = false;

		DAO.consultarWebServiceGet("buscarPlaca", parametros, function (data) {
			if (data.length > 0) {
				//completa la informacion del vehiculo
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
				$("#txtPlaca").attr("idVehiculo", data[0].idVehiculo),


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
				//
				var numeroDocumentoPropietario = data[0].numDocumentoPropietario;
				var apepatPropietario  =   data[0].apepat;
				var apematPropietario = data[0].apellido_materno;
				var nombreRazonSocialPropietario = data[0].nombreRazonSocial;
				var idPropietarioVehiculo = 0;
				var tipoPersonaPropietario = data[0].tipoPersonaPropietario;
				var tipoDocumentoPropietario = data[0].tipoDocumentoPropietario;
				//
				//
		
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


		}, false);
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
		if (validarCamposRequeridos("divFechaEmision") && validarCamposRequeridos("divFechaVigencia") && validarCamposRequeridos("divFechaPolicial") && validarCamposRequeridos("divAsociado") && validarCamposRequeridos("divVehiculo") && validarCamposRequeridos("divMonto")) {
			// verifica que el numero de certificado este correcto
			if ($("#txtNroCAT").prop("disabled") == false) {
				alert("¡Debe validar la existencia del certificado ingreso!");
				$("#txtNroCAT").focus();
				return;
			}
			// valida que una fecha Fin no sea mayor o igual q el inicio
			if (!validarFechaInicioFin("txtFV")) {
				alert("¡(Fecha de Vigencia) La fecha de Inicio tiene que ser menor que la fecha de Fin!");
				$("#txtFV_Inicio").focus();
				return;
			}
			if (!validarFechaInicioFin("txtFCP")) {
				alert("¡(Control Policial) La fecha de Inicio tiene que ser menor que la fecha de Fin!");
				$("#txtFCP_Inicio").focus();
				return;
			}
			// verifica que l nro de doc. del asociado se haya validado:
			if ($("#idDNI_asoc").prop("disabled") == false) {
				alert("¡Debe validar la existencia de DNI/RUC del asociado!");
				$("#idDNI_asoc").focus();
				return;
			}
			if ($("#txtAnno").val() < 1900) {
				alert("¡Año de fabricacion del vehiculo invalido!");
				$("#txtAnno").focus();
				return;
			}
			if (enCartera && idConcesionarioPromotor == 0) {
				alert("¡No se ha definido el Concesionario para ventas de Promotores ! \r\n Coordinar con el area de Sistemas.");
				$("#txtNroCAT").focus();
				return;
			}

			//verifica año vacio
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
				
			var rpta = confirm("Se va a proceder a registrar este Certificado \r\n ¿ Esta seguro que los datos ingresados son correctos ?");
			//fancyConfirm("¿Desea continuar con la operación?", function (rpta) {
			if (rpta) {
				var dniConsultaServicio = Number($("#idDNI_asoc").attr("is_servicio"));
				var idPropietarioVehiculo_ = $('#txtNumeroDocumentoPropietario').attr('id-propietario-vehiculo');
				var nroCAT = $("#txtNroCAT").val();
				var parametros = "&idConcesionario=" + idConcesionario +
					"&nroCertificado=" + nroCAT +
					"&idPromotor=" + idPromotor +
					"&fechaEmision=" + dateTimeFormat($("#txtFechaEmision").val()) +

					"&conDeuda=S" +
					"&fechaLiquidacion=" +

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
					"&liquidacionPendiente=true" +
					"&nroDocIsServicio=" + dniConsultaServicio + 
					"&tipoPersonaPropietario=" + $('#selectPersonaPropietario').val() + 
					"&tipoDocumentoPropietario=" + $('#selectTipoDocuPropietario').val() + 
					"&numDocumentoPropietario=" + $('#txtNumeroDocumentoPropietario').val() + 
					"&nombresPropietario=" + replaceSingleQuote($('#nombresPropietario').val()) + 
					"&apepatPropietario=" + $('#apepatPropietario').val() + 
					"&apematPropietario=" + $('#apematPropietario').val() + 
					"&idpropietariovehiculo=" + idPropietarioVehiculo_ + 
					"&isServiceSUNARP=" + Number($("#txtPlaca").attr('is_servicio')) + 
					"&vistaRegistro=" + "ACTIVAR CAT"+ 
					"&certificadoDuplicado=" + 0;


				DAO.consultarWebServiceGet("guardarCAT", parametros, function (data) {
					if (enCartera) {
						// **FALTA CODARTICULO
						//si el certificado estaba en cartera del Promotor, debe agregarse una guia de DISTIBUCION al Consesionario Promotor Varios
						var mObjeto = { codArticulo: idProducto, descArticulo: "[--CAT--]", unidad: prodUNID, cantidad: 1, nroInicio: nroCAT, nroFinal: nroCAT, observaciones: "*Venta Directa PROMOTOR" }
						var arrayDatos = [mObjeto];
						var parametrosPOST = {
							"tipo": 'DIST',
							"fecha": dateTimeFormat($("#txtFechaEmision").val()),
							"concesionario": idConcesionario,
							"nroGuia": '555555',   //Numero de Guia externa 
							"idUsuarioDestino": idUsuario,     //idPromotor
							"idUsuario": idUsuario,
							"detalle": arrayDatos
						}
						DAO.consultarWebServicePOST(parametrosPOST, "guardarGuia", function (data) {
							if (data[0] > 0) {
								if (data[0] > 0) {
									migrarCertificado(nroCAT);
									fancyAlertFunction("¡Operación Exitosa!", function () {
										refrescarPantalla();
									});
									//alert("¡Operación Exitosa!");
									//refrescarPantalla();
								}
							}
						}, false);
						//----------------------------------------------------------------------------------------------------------
					} else {
						if (data[0] > 0) {
							migrarCertificado(nroCAT);
							
							fancyAlertFunction("¡Operación Exitosa!", function () {
								refrescarPantalla();
							})

							//refrescarPantalla();
						} else {

							if(data[0] == -999){
								alert("¡Verificar datos ingresados!");

							}else{
								alert("¡Operación Fallida!");
							}
						}
					}
				}, false);
			}
			//});
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
		//alert("¡Operación Exitosa!");
		refrescarPantalla();
	});
}


function refrescarPantalla(reiniciaCertif) {
	try {
		if (typeof reiniciaCertif == 'undefined') {
			reiniciaCertif = true;
		}

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

		$("#btnRegistra").val("Registrar")
		$("#btnAnular").css("display", "none");
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
			$("#idDNI_asoc").attr("maxlength",9 );
		} else {
			$("#idDNI_asoc").attr("maxlength", 11);
		}
	} catch (err) {
		emitirErrorCatch(err, "cambiarTipoPersona")
	}
}
