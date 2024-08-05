/**
 * 
 */
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var DAOV = new DAOWebServiceGeT("wbs_ventas")

var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
var arrayOrdenes = [];
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
var tipoChequesArray = [
    { id: "N", nombre: "NORMAL" },
    { id: "D", nombre: "DIFERIDO" }
]
var accion;
var nroDocumento = "", tipoDocumento = "";
var totalChq = 0.0;
cargarInicio(function () {
    $("#btnBuscar").click(function () {
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscarOrd(); // realiza la busqueda de las Ordenes aprobadas para este Proveedor
    });
    $("#txtTotal").addClass("decimales")
    $("#txtTotal").attr("requerido", "Monto total");
    $("#txtTotal").prop("readonly", false)
    $("#txtNroOrden").attr("requerido", "Nro Cheque")
    asignarNumericos()
    asignarDecimalNumericos()

    $("#fechaOrden").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
    DAOV.consultarWebServiceGet("getProveedores", "", function (arrayList) {
        var campos = { "keyId": 'idProveedor', "keyValue": 'nombreProveedor' }
        agregarOpcionesToCombo("idCmbProveedor", arrayList, campos);
        $("#idCmbProveedor").select2();
        var campos = { "keyId": 'id', "keyValue": 'nombre' }
        agregarOpcionesToCombo("cmbTipoCheq", tipoChequesArray, campos);
        DAO.consultarWebServiceGet("getCuentasBancarias", "", function (arrayCuentas) {
            var campos = { "keyId": 'idCuentaBancaria', "keyValue": 'ctaBanco' }
            agregarOpcionesToCombo("cmbCtaBancaria", arrayCuentas, campos);
            $("#cmbTipoDoc").change(prepararUI)

            accion = $_GET("accion")
            if (accion == "N") {
                $("#btnGuardar").click(guardar)
                $("#btnAnular").hide()
                $("#fechaOrden").val(convertirAfechaString(new Date(), false));
                $("#txtNroOrden").prop("readonly", false)
            } else {
                $("#btnGuardar").hide();
                $("#btnAnular").click(AnularCheq);
                nroDocumento = $_GET("nroDocumento");
                $("#txtNroOrden").val(nroDocumento);
                $("#txtNroOrden").prop("readonly", false);
                tipoDocumento = $_GET("tipoDocumento");
                $("#cmbTipoDoc").val($_GET("tipoDocumento"))
                $("#cmbTipoDoc").prop("disabled", true)
                var parametros = "&nroDocumento=" + nroDocumento + "&tipoDocumento=" + tipoDocumento
                DAO.consultarWebServiceGet("getChequeReciboDetallePr", parametros, function (results) {
                    $("#fechaOrden").val(results[0].fechaDocumento)
                    $("#txtObservaciones").val(results[0].observaciones)
                    prepararUI()
                    var tipoDoc = $("#cmbTipoDoc").val()
                    if (tipoDoc == 'C') {
                        $("#cmbTipoCheq").val(results[0].tipoCheque)
                        $("#cmbCtaBancaria").val(results[0].idCuentaBancaria)
                    }
                    $("#idCmbProveedor").val(results[0].idProveedor)
                    $("#idCmbProveedor").select2();

                    $("#txtObservaciones").val(results[0].observaciones)
                    $("#txtTotal").val(results[0].monto)
                    //Ordenes de Pago relacionadas
                    var parametros = "&nroDocumento=" + nroDocumento + "&tipoDocumento=" + tipoDocumento
                    DAO.consultarWebServiceGet("getOrdenesChequeReciboPr", parametros, cargarGrilla, true, paginacion);
                })
            }
            prepararUI()
            $.fancybox.close();
        })
    })
})
function modoSoloLectura() {
    try {
        $(":input").prop("disabled", true);
        $(":input").css("opacity", "0.5")
    } catch (err) {
        emitirErrorCatch(err, "modoSoloLectura")
    }
}

function buscarOrd() {
    try {
        var idProveedor = $("#idCmbProveedor").val();
        var parametros = "&idProveedor=" + idProveedor;

        DAO.consultarWebServiceGet("getListaOrdenesPagoProveedoresB", parametros, cargarGrilla, true, paginacion);

    } catch (err) {
        emitirErrorCatch(err, "buscar");
    }
}
function marcarFila(element) {
    var tr = $(element).parent().parent()
    var TDs = $(tr).find("td"); // Busca todos los TD dentro de la Fila
    var monto = parseFloat($(element).attr("monto"))
    TDs.each(function () { // Pinta cada td encontrado
        if ($(element).prop("checked")) {
            $(this).css("background-color", "gray");
            $(this).css("color", "white");
        } else {
            $(this).css("background-color", "transparent");
            $(this).css("color", "black");
        }
    });
    if ($(element).prop("checked")) {
        totalChq = totalChq + monto;
    } else {
        totalChq = totalChq - monto;
    }
    $("#txtTotal").val(totalChq.toFixed(2))
}
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
function cargarGrilla(listOrdenes) {
    for (var i = 0; i < listOrdenes.length; i++) {
        listOrdenes[i].tipoExp = tipoExp[listOrdenes[i].tipoExpediente]
        listOrdenes[i].htmlIncluye = "<input type='checkbox' monto=" + listOrdenes[i].montoTotalDocumentos +
            " idExpediente=" + listOrdenes[i].idExpediente + " nroOrdenPago=" + listOrdenes[i].nroOrdenPago + " onchange='marcarFila(this)'/>"
        //" onchange='marcarFila(this)'/>"

        arrayOrdenes.push(listOrdenes[i]);
    }
    //16/ENE/20 por algun motivo la ultima linea no responde el evento onchange(), se agrega linea en blanco al final!
    var lineaEnBlanco = { htmlIncluye: "", nroOrdenPago: "", fechaRegistro: "", tipoExp: "", idExpediente: "", codAgraviado: "", nombreAgraviado: "", numerosDocumentos: "", montoTotalDocumentos: "" };
    arrayOrdenes.push(lineaEnBlanco);
    try {
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            { campo: 'htmlIncluye', alineacion: 'center' },
            { campo: 'nroOrdenPago', alineacion: 'center' },
            { campo: 'fechaRegistro', alineacion: 'center' },
            { campo: 'tipoExp', alineacion: 'center' },
            { campo: 'idExpediente', alineacion: 'center', LPAD: true },
            { campo: 'codAgraviado', alineacion: 'center' },
            { campo: 'nombreAgraviado', alineacion: 'left' },
            { campo: 'numerosDocumentos', alineacion: 'center' },
            { campo: 'montoTotalDocumentos', alineacion: 'center' }
        ];
        if (dataTable != undefined) {
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", arrayOrdenes, camposAmostrar, false, 12); // crea la tabla HTML
        var columns = [
            { "width": "5%" },
            { "width": "9%" },
            { "width": "9%", "type": "date-eu" },
            { "width": "9%" },
            { "width": "9%" },
            { "width": "9%" },
            { "width": "20%" },
            { "width": "20%" },
            { "width": "10%" }
        ];

        dataTable = parseDataTable("tabla_datos", columns, 200, false, false, false, false);
        //deshabilita busquedas de Ordenes x proveedor
        $("#idCmbProveedor").prop("disabled", true);
        $("#idCmbProveedor").css("opacity", "0.5")
        $("#btnBuscar").prop("disabled", true);
        $("#btnBuscar").css("opacity", "0.5")
        if (accion == "E") {
            modoSoloLectura() //Todo excepto el boton Anular si es Admin
            var tipoUsuario = parent.perfilUsuario1
            if (tipoUsuario == "1" || tipoUsuario == "2") {
                $("#btnAnular").prop("disabled", false);
                $("#btnAnular").css("opacity", "1")
            }
        }
        $.fancybox.close();
    } catch (err) {
        emitirErrorCatch(err, "cargarGrilla()")
    }
}
function guardar() {
    try {
        var OrdenesSeleccionadas = []
        $("#tabla_datos > tbody").find("tr").each(function () {
            var inputCheck = $(this).find("td").eq(0).find("input")
            if ($(inputCheck).prop("checked")) {
                var nroOrdenPago = $(inputCheck).attr("nroOrdenPago")
                var idExpediente = $(inputCheck).attr("idExpediente")
                OrdenesSeleccionadas.push({
                    "nroOrdenPago": nroOrdenPago,
                    "idExpediente": idExpediente
                })
            }
        })
        if (OrdenesSeleccionadas.length > 0) {
            if (validarCamposRequeridos("Layer1")) {
                var montoTotal = $("#txtTotal").val()
                montoTotal = parseFloat(montoTotal)
                if (montoTotal <= 0) {
                    fancyAlert("¡El valor total tiene que ser mayor que 0!")
                    return
                }
                fancyConfirm("¿Esta seguro de guardar el cheque/recibo?", function (rpta) {
                    if (rpta) {
                        var jsonObject = {
                            tipoDocumento: $("#cmbTipoDoc").val(),
                            nroDocumento: $("#txtNroOrden").val(),
                            fecha: dateTimeFormat($("#fechaOrden").val()),
                            monto: montoTotal,
                            idCuentaBancaria: $("#cmbCtaBancaria").val(),
                            tipoCheque: $("#cmbTipoCheq").val(),

                            //nroOrdenPago: nroOrdenPago,
                            //tipoExpediente: tipoExpediente,
                            //idExpediente: idExpediente,
                            //codEvento: $("#codEvento").val(),
                            //codAgraviado: codAgraviado,

                            nombreDestino: $("#idCmbProveedor option:selected").text(),
                            observaciones: $("#txtObservaciones").val(),
                            idProveedor: $("#idCmbProveedor").val(),
                            listaOrdenes: OrdenesSeleccionadas
                        }

                        if (accion == "N") {
                            DAO.consultarWebServicePOST(jsonObject, "guardarChequeReciboPr", function (data) {
                                if (data.length > 0) {
                                    realizoTarea = true;
                                    parent.window.frames[0].buscar();
                                    parent.$.fancybox.close();
                                } else {
                                    fancyAlert("Fallo al registrar el cheque/recibo!")
                                }
                            })
                        } else { // Editar
                            jsonObject["nroDocumentoOriginal"] = nroDocumento
                            DAO.consultarWebServicePOST(jsonObject, "ActualizarChequeReciboPr", function (data) {
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
        } else {
            fancyAlert("¡Debe Seleccionar al menos una Orden de Pago!")
        }
    } catch (err) {
        emitirErrorCatch(err, "guardar()")
    }
}

function AnularCheq() {
    fancyConfirm("¿Esta seguro de ANULAR el cheque/recibo?", function (rpta) {
        if (rpta) {
            var OrdenesSeleccionadas = []; //selecciona todas las ordenes
            $("#tabla_datos > tbody").find("tr").each(function () {
                var inputCheck = $(this).find("td").eq(0).find("input")
                var nroOrdenPago = $(inputCheck).attr("nroOrdenPago")
                var idExpediente = $(inputCheck).attr("idExpediente")
                OrdenesSeleccionadas.push({
                    "nroOrdenPago": nroOrdenPago,
                    "idExpediente": idExpediente
                })
            })
            var jsonObject = {
                tipoDocumento: $("#cmbTipoDoc").val(),
                nroDocumento: $("#txtNroOrden").val(),
                listaOrdenes: OrdenesSeleccionadas
            }
            DAO.consultarWebServicePOST(jsonObject, "anularChequeReciboPr", function (data) {
                if (data.length > 0) {
                    realizoTarea = true;
                    parent.window.frames[0].buscar();
                    parent.$.fancybox.close();
                } else {
                    fancyAlert("¡Operacion Fallida!")
                }
            })
        }
    })

}