/**
 * Created by JEAN PIERRE on 22/02/2018.
 */
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
let arrayDatos = [];
var perfilUsuario = parent.window.perfilUsuario1

cargarInicio(function () {
    $("#idRevertirAprobar").hide()
    $("#btnBuscar").click(function () { // asigna funcion al boton de busqueda de contratos
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los contratos
    });
    $("#fechaDesde").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
    $("#fechaHasta").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
    $("#fechaHasta").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto
    $("#btnRevisar").click(revisarOrden)
    $("#btnNuevo").click(nuevaOrden)
    $("#btnImprimir").click(imprimir)
    if (perfilUsuario == '1' || perfilUsuario == '2') {
        $("#idRevertirAprobar").show()
        $("#idRevertirAprobar").click(revertirEstado)
    }
    buscar()
})
function buscar() { // busca los contratos que cumplan las condiciones
    try {

        var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
        var codigo = $("#idCodigo").val()
        var nombre = $("#idNombre").val()
        var midExpediente = $("#nroExpediente").val()
        var dni = $("#idDNI").val()
        var parametros = "&codigoAgraviado=" + codigo +
            "&nombreAgraviado=" + nombre +
            "&idExpediente=" + midExpediente +
            "&dni=" + dni +
            "&fechaDesde=" + fechaDesde +
            "&fechaHasta=" + fechaHasta;

        DAO.consultarWebServiceGet("getListaOrdenesPagoBeneficiarios", parametros, listar, true, paginacion);

    } catch (err) {
        emitirErrorCatch(err, "buscar");
    }
}

var estados = {
    "A": "Anulado",
    "I": "Ingresado",
    "B": "Aprobado",
    "E": "Especial",
    "P": "Pagado"
}

function listar(resultsData) { // crea la grilla con la paginacion
    try {
        //arrayDatos = resultsData; //copia resultados a objeto global
        arrayDatos = JSON.parse(JSON.stringify(resultsData))
        for (var i = 0; i < resultsData.length; i++) {
            resultsData[i].estadoDescripcion = estados[resultsData[i].estado]
            resultsData[i].monto = resultsData[i].monto.toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
        }
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            { campo: 'nroOrdenPago', alineacion: 'center' },
            { campo: 'idExpediente', alineacion: 'center' },
            { campo: 'estadoDescripcion', alineacion: 'center' },
            { campo: 'fechaRegistro', alineacion: 'center' },
            { campo: 'etapa', alineacion: 'center' },
            { campo: 'codAgraviado', alineacion: 'center' },
            { campo: 'nombreAgraviado', alineacion: 'left' },
            { campo: 'monto', alineacion: 'right' }
        ];
        if (dataTable != undefined) {
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns = [
            { "width": "10%" },
            { "width": "10%" },
            { "width": "11%" },
            { "width": "10%", "type": "date-eu" },
            { "width": "12%" },
            { "width": "12%" },
            { "width": "26%" },
            { "width": "9%" },
        ];
        var orderByColumn = [0, "desc"];
        dataTable = parseDataTable("tabla_datos", columns, 320, orderByColumn, false, false, false, function () {
            if (resultsData.length > 0) {
                var numeroPaginas = resultsData[0].numeroPaginas;
                if (typeof numeroPaginas != "undefined") {
                    paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function (page) {
                        paginacion.paginaActual = page;
                        buscar();
                    });
                }
            } else {
                paginacion.cargarPaginacion(0, "pagination");
                // Recibe parametros @1: numero de paginas, @2: id DIV de la Paginacion
            }
        });
        $.fancybox.close();

    } catch (err) {
        emitirErrorCatch(err, "listar")
    }
}
function revertirEstado() {
    try {
        if (filaSeleccionada == undefined) {
            fancyAlert("¡Debe seleccionar una transaccion!");
        } else {
            var registroSeleccionado = arrayDatos[filaSeleccionada];
            var estado = registroSeleccionado.estado;
            var nroOrden = registroSeleccionado.nroOrdenPago;
            var idExp = registroSeleccionado.idExpediente;
            if (estado == "P") { // Esta PAGADO, confirmar para borrar el documento de pago tambien. Expediente->
                fancyConfirm("¡La Orden ya fue PAGADA! El Cheque/Recibo será borrado.<br>¿Desea continuar con el cambio de estado?",
                    function (rpta) {
                        if (rpta) { //Cambiar OrdenPagoAgraviado.estado a "I" y borrar cheque/recibo
                            var parametros = "&nroOrdenPago=" + nroOrden + "&idExpediente=" + idExp +
                                "&estado=I&estadoExp=1&borraCheque=S&esProveedor=N"
                            DAO.consultarWebServiceGet("cambiarEstadoOrdenPago", parametros,
                                function (data) {
                                    //var affectedRows = data[0]
                                    if (data.affectedRows > 0) {
                                        var ordenSeleccionada = filaSeleccionada;
                                        arrayDatos[filaSeleccionada].estado = 'I'
                                        listar(arrayDatos)
                                        seleccionarFila(ordenSeleccionada)
                                    } else {
                                        fancyAlert("¡No se pudo actualizar la Orden de Pago!")
                                    }
                                });
                        }
                    })

            } else if (estado == "B") {
                //Orden Aprobada regresar a "I"
                fancyConfirm("¡La Orden sera regresada al estado 'Ingresada'.<br>¿Desea continuar con el cambio?",
                    function (rpta) {
                        if (rpta) { //Cambiar OrdenPagoAgraviado.estado a "I"
                            var parametros = "&nroOrdenPago=" + nroOrden + "&idExpediente=" + idExp +
                                "&estado=I&estadoExp=1&borraCheque=N&esProveedor=N"
                            DAO.consultarWebServiceGet("cambiarEstadoOrdenPago", parametros,
                                function (data) {
                                    //var affectedRows = data[0]
                                    if (data.affectedRows > 0) {
                                        var ordenSeleccionada = filaSeleccionada;
                                        arrayDatos[filaSeleccionada].estado = 'I'
                                        listar(arrayDatos)
                                        seleccionarFila(ordenSeleccionada)
                                    } else {
                                        fancyAlert("¡No se pudo actualizar la Orden de Pago!")
                                    }
                                });
                        }
                    })
            } else if (estado == "I") {
                //fancyAlert("¡Transaccion recien INGRESADA! Desa ANULARLA?");
                fancyConfirm("¡ Orden recien INGRESADA ! <br> ¿ Desea ANULARLA ?",
                    function (rpta) {
                        if (rpta) { //Cambiar OrdenPagoAgraviado.estado a "A"
                            var parametros = "&nroOrdenPago=" + nroOrden + "&idExpediente=" + idExp +
                                "&estado=A&estadoExp=0&borraCheque=N&esProveedor=N"
                            DAO.consultarWebServiceGet("cambiarEstadoOrdenPago", parametros,
                                function (data) {
                                    //var affectedRows = data[0]
                                    if (data.affectedRows > 0) {
                                        var ordenSeleccionada = filaSeleccionada;
                                        arrayDatos[filaSeleccionada].estado = 'A'
                                        listar(arrayDatos)
                                        seleccionarFila(ordenSeleccionada)
                                    } else {
                                        fancyAlert("¡No se pudo actualizar la Orden de Pago!")
                                    }
                                });
                        }
                    })
            }
        }
    } catch (err) {
        emitirErrorCatch(err, "revertirEstado")
    }
}

function nuevaOrden() {
    try {
        parent.abrirVentanaFancyBox(1100, 525, "tesor-pago-agrav-expediente", true);
    } catch (err) {
        emitirErrorCatch(err, "nuevaOrden()")
    }
}
function revisarOrden() {
    try {
        if (filaSeleccionada == undefined) {
            fancyAlert("Debe seleccionar una Orden!");
        } else if (arrayDatos[filaSeleccionada].estado == 'A') {
            fancyAlert("Orden ANULADA, no se puede editar!");
        } else {
            parent.abrirVentanaFancyBox(1150, 570,
                "tesor-pago-agrav-detalle?accion=E&nroOrden=" + arrayDatos[filaSeleccionada].nroOrdenPago, true,
                function () {
                    buscar();
                },
                true);
        }
    } catch (err) {
        emitirErrorCatch(err, "revisarOrden()")
    }
}
function imprimir() {
    try {
        if (filaSeleccionada == undefined) {
            fancyAlert("Debe seleccionar una Orden!");
        } else {
            if (arrayDatos[filaSeleccionada].estado == 'B' || arrayDatos[filaSeleccionada].estado == 'P') {
                parent.abrirVentanaFancyBox(760, 495, "editar_ordenpago_pdf?nroOrden=" + arrayDatos[filaSeleccionada].nroOrdenPago + "&IG=false", true)
            } else {
                fancyAlert("¡Debe seleccionar una Orden en estado APROBADO o PAGADO !")
            }
        }
    } catch (err) {
        emitirErrorCatch(err, "imprimir")
    }
}