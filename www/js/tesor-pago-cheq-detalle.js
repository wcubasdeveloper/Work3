/**
 * Created by JEAN PIERRE on 27/02/2018.
 */
var accion;
var nroDocumento = ""
var idExpediente;
var codAgraviado;
var nroOrdenPago
var codEvento;
var beneficiario = ""
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var tipoExpediente;
var tipoExp = {
	"1": "Reemb. Gastos méd.",
	"2": "Indem. por muerte",
	"3": "Indem. por sepelio",
	"4": "Indem. por Incap. temp.",
	"5": "Indem. por Inval. perm.",
	"6": "Solic. subsanacion",
	"7": "Doc. Administrativo",
	"9": "Otros",
	"10": "Solic. Pago a IPRESS",
	"11": "Regularizaciones de solics."

}
function modoSoloLectura() {
	try {
		$(":input").prop("disabled", true);
		$(":input").css("opacity", "0.5")
	} catch (err) {
		emitirErrorCatch(err, "modoSoloLectura")
	}
}
var tipoChequesArray = [
	{ id: "N", nombre: "NORMAL" },
	{ id: "D", nombre: "DIFERIDO" }
]
cargarInicio(function () {
	var campos = { "keyId": 'id', "keyValue": 'nombre' }
	agregarOpcionesToCombo("cmbTipoCheq", tipoChequesArray, campos);
	DAO.consultarWebServiceGet("getCuentasBancarias", "", function (arrayCuentas) {
		var campos = { "keyId": 'idCuentaBancaria', "keyValue": 'ctaBanco' }
		agregarOpcionesToCombo("cmbCtaBancaria", arrayCuentas, campos);
		accion = $_GET("accion")
		if (accion == "N" || accion == "N1") {
			idExpediente = $_GET("nroExpediente")
			codAgraviado = $_GET("codAgraviado")
			nroOrdenPago = $_GET("nroOrdenPago")
			beneficiario = $_GET("beneficiario")
		} else {
			nroDocumento = $_GET("nroDocumento")
			$("#txtNroOrden").val(nroDocumento)
			$("#txtNroOrden").prop("readonly", false)
			$("#cmbTipoDoc").val($_GET("tipoDocumento"))
			$("#cmbTipoDoc").prop("disabled", true)
		}
		$("#fechaOrden").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
		$("#txtTotalCarta").addClass("decimales")
		$("#txtTotalCarta").attr("requerido", "Monto total");
		$("#txtTotalCarta").prop("readonly", false)
		$("#txtNroOrden").attr("requerido", "Nro Documento")
		asignarNumericos()
		asignarDecimalNumericos()
		$("#cmbTipoDoc").change(prepararUI)

		switch (accion) {
			case 'N':
			case 'N1': //Nuevo Cheque desde Aprobacion de Ordenes
				$("#btnGuardar").click(guardar)
				$("#btnActualiza").hide()
				$("#fechaOrden").val(convertirAfechaString(new Date(), false));
				codEvento = $_GET("codEvento")
				$("#txtNroOrden").prop("readonly", false)
				$("#codEvento").val($_GET("codEvento"))
				$("#idNombre").val($_GET("nombreAgraviado"))
				$("#idAgraviado").val($_GET("codAgraviado"))
				$("#idExpediente").val(LPAD($_GET("idExpediente"), numeroLPAD))
				$("#idTipoExpediente").val($_GET("tipoExp"))
				$("#nroOrdenPago").val($_GET("nroOrdenPago"))
				tipoExpediente = $_GET("tipoExpediente")
				$("#txtTotalCarta").val($_GET("monto"))

				prepararUI()
				$.fancybox.close()
				break;
			case 'E':
				$("#btnGuardar").hide()
				$("#btnActualiza").click(guardar)
				//$("#btnActualiza").hide()
				var parametros = "&nroDocumento=" + nroDocumento +
					"&tipoDocumento=" + $("#cmbTipoDoc").val()
				DAO.consultarWebServiceGet("getChequeReciboDetalle", parametros, function (results) {
					idExpediente = results[0].idExpediente
					codAgraviado = results[0].codAgraviado
					nroOrdenPago = results[0].nroOrdenPago
					codEvento = results[0].codEvento

					$("#codEvento").val(codEvento)
					$("#idNombre").val(results[0].nombreAgraviado)
					$("#idAgraviado").val(codAgraviado)
					$("#idExpediente").val(LPAD(idExpediente, numeroLPAD))
					$("#idTipoExpediente").val(tipoExp[results[0].tipoExpediente])
					$("#nroOrdenPago").val(nroOrdenPago)
					$("#fechaOrden").val(results[0].fechaDocumento)
					$("#txtObservaciones").val(results[0].observaciones)

					prepararUI()

					var tipoDoc = $("#cmbTipoDoc").val()
					if (tipoDoc == 'C') {
						$("#cmbTipoCheq").val(results[0].tipoCheque)
						$("#cmbCtaBancaria").val(results[0].idCuentaBancaria)
					}
					$("#txtTotalCarta").val(results[0].monto)
					var tipoUsuario = parent.perfilUsuario1
					if (tipoUsuario != "1" && tipoUsuario != "2") {
						modoSoloLectura()
					}
					$.fancybox.close()

				})
				break;
		}
	})
})
function prepararUI() {
	try {
		var tipoDoc = $("#cmbTipoDoc").val()
		switch (tipoDoc) {
			case 'C': // Cheque
				// activa combobox
				$("#cmbTipoCheq").prop("disabled", false)
				$("#cmbTipoCheq").attr("requerido", "Tipo cheque");
				$("#cmbCtaBancaria").prop("disabled", false)
				$("#cmbCtaBancaria").attr("requerido", "Cuenta Bancaria");
				break;
			case 'R': // Recibo
				// inactiva combobox
				$("#cmbTipoCheq").prop("disabled", true)
				$("#cmbTipoCheq").removeAttr("requerido");
				$("#cmbTipoCheq").val("")
				$("#cmbCtaBancaria").prop("disabled", true)
				$("#cmbCtaBancaria").removeAttr("requerido");
				$("#cmbCtaBancaria").val("")
				break;
		}

	} catch (err) {
		emitirErrorCatch(err, "prepararUI")
	}
}
function guardar() {
	try {
		if (validarCamposRequeridos("Layer1")) {
			var montoTotal = $("#txtTotalCarta").val()
			montoTotal = parseFloat(montoTotal)
			if (montoTotal <= 0) {
				fancyAlert("¡El valor total tiene que ser mayor de 0!")
				return
			}
			fancyConfirm("¿Esta seguro de guardar el cheque/recibo?", function (rpta) {
				if (rpta) {
					var jsonObject = {
						tipoDocumento: $("#cmbTipoDoc").val(),
						nroDocumento: $("#txtNroOrden").val(),
						fecha: dateTimeFormat($("#fechaOrden").val()),
						monto: $("#txtTotalCarta").val(),
						idCuentaBancaria: $("#cmbCtaBancaria").val(),
						tipoCheque: $("#cmbTipoCheq").val(),
						nroOrdenPago: nroOrdenPago,
						tipoExpediente: tipoExpediente,
						idExpediente: idExpediente,
						codEvento: $("#codEvento").val(),
						codAgraviado: codAgraviado,
						observaciones: $("#txtObservaciones").val(),
						nombreDestino: beneficiario
					}

					if (accion == "N") {
						jsonObject['nroDocumentoOriginal'] = nroDocumento
						DAO.consultarWebServicePOST(jsonObject, "guardarChequeRecibo", function (data) {
							if (data.length > 0) {
								realizoTarea = true;
								// actualiza los beneficiarios
								DAO.consultarWebServiceGet("getBeneficiariosPorCheque", "", function (arrayList) {
									var seleccionado = parent.window.frames[0].$("#idCmbProveedor_benef").val()
									var campos = { "keyId": 'nombreDestino', "keyValue": 'nombreDestino' }
									parent.window.frames[0].agregarOpcionesToCombo("idCmbProveedor_benef", arrayList, campos);
									parent.window.frames[0].$("#idCmbProveedor_benef").val(seleccionado)
									parent.window.frames[0].$("#idCmbProveedor_benef").select2()

									parent.window.frames[0].buscar()
									parent.$.fancybox.close();
								})
							} else {
								fancyAlert("Fallo al registrar el cheque/recibo!")
							}
						})
					} else if (accion == "N1") {  //nuevo Cheque desde Aprobacion
						jsonObject['nroDocumentoOriginal'] = nroDocumento
						DAO.consultarWebServicePOST(jsonObject, "guardarChequeRecibo", function (data) {
							if (data.length > 0) {
								realizoTarea = true;
								parent.$.fancybox.close();
							} else {
								fancyAlert("Fallo al registrar el cheque/recibo!")
							}
						})
					} else { // Editar
						jsonObject["nroDocumentoOriginal"] = nroDocumento
						DAO.consultarWebServicePOST(jsonObject, "actualizarChequeRecibo", function (data) {
							if (data.length > 0) {
								realizoTarea = true
								parent.$.fancybox.close();
							} else {
								fancyAlert("¡Operacion Fallida!")
							}
						})
					}
				}
			})
		}
	} catch (err) {
		emitirErrorCatch(err, "guardar")
	}
}