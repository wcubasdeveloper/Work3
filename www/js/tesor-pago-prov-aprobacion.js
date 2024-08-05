/**
  */
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
var arrayDatos = [];
var perfilUsuario = parent.window.perfilUsuario1

cargarInicio(function () {
    $("#idRevertirAprobar").hide()
    $("#btnBuscar").click(function () { // asigna funcion al boton de busqueda de Ordenes
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de Ordenes
    });
    $("#fechaDesde").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
    $("#fechaHasta").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
    $("#fechaHasta").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto
    $("#btnAnular").click(anularOrden)
    $("#btnAprobar").click(aprobarOrden)
    if (perfilUsuario == '1' || perfilUsuario == '2') {
        $("#idRevertirAprobar").show()
        $("#idRevertirAprobar").click(revertirEstado)
    }
    // cargar lista de proveedores:
    DAOV.consultarWebServiceGet("getProveedores", "",
        function (arrayProveedores) {
            var campos = { "keyId": 'idProveedor', "keyValue": 'nombreProveedor' }
            agregarOpcionesToCombo("idCmbProveedor", arrayProveedores, campos);
            $("#idCmbProveedor").select2();
            $.fancybox.close()
            buscar()
        })
})
function revertirEstado() {
    try {
        if (filaSeleccionada == undefined) {
            fancyAlert("¡Debe seleccionar una Orden de Pago!");
        } else {
            var registroSeleccionado = arrayDatos[filaSeleccionada];
            var estado = registroSeleccionado.estado;
            var nroOrden = registroSeleccionado.nroOrdenPago;
            var idExp = registroSeleccionado.idExpediente;
            if (estado == "P") { // Esta PAGADO, confirmar para borrar el documento de pago tambien. Expediente->
                fancyAlert("¡La Orden ya fue PAGADA! Revisar el cheque correspondiente y ANULARLO");
                /*
                fancyConfirm("¡La Orden ya fue PAGADA! El Cheque/Recibo será borrado.<br>¿Desea continuar con el cambio de estado?",
                    function (rpta) {
                        if (rpta) { //Cambiar OrdenPagoAgraviado.estado a "I" y borrar cheque/recibo
                            var parametros = "&nroOrdenPago=" + nroOrden +"&idExpediente=" + idExp+
                                "&estado=I&estadoExp=1&borraCheque=S&esProveedor=S"
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
                    */
            } else if (estado == "B") {
                //Orden Aprobada regresar a "I"
                fancyConfirm("¡La Orden sera regresada al estado 'Ingresada'.<br>¿Desea continuar con el cambio?",
                    function (rpta) {
                        if (rpta) { //Cambiar OrdenPagoAgraviado.estado a "I"
                            var parametros = "&nroOrdenPago=" + nroOrden + "&idExpediente=" + idExp +
                                "&estado=I&estadoExp=1&borraCheque=N&esProveedor=S"
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
                fancyAlert("¡Orden recien INGRESADA!");
            }
        }
    } catch (err) {
        emitirErrorCatch(err, "revertirEstado")
    }
}

function buscar() { // busca las ordenes pendientes de aprobar
    try {
        var idProveedor = $("#idCmbProveedor").val();
        var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
        var codigo = $("#codAgraviado").val()
        var mordenPago = $("#nroOrdenPago").val()
        var midExpediente = $("#nroExpediente").val()
        var parametros = "&idProveedor=" + idProveedor + "&fechaDesde=" + fechaDesde + "&fechaHasta=" + fechaHasta +
            "&codAgraviado=" + codigo + "&nroOrdenPago=" + mordenPago + "&nroExpediente=" + midExpediente;

        DAO.consultarWebServiceGet("getListaOrdenesPagoProveedores", parametros, listar, true, paginacion);

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

        for (var i = 0; i < resultsData.length; i++) {
            resultsData[i].estadoDescripcion = estados[resultsData[i].estado]
        }

        arrayDatos = resultsData; //guarda pagina actual en variable global
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            { campo: 'estadoDescripcion', alineacion: 'center' },
            { campo: 'nroOrdenPago', alineacion: 'center' },
            { campo: 'idExpediente', alineacion: 'center' },
            { campo: 'fechaRegistro', alineacion: 'center' },
            { campo: 'nombreProveedor', alineacion: 'left' },
            { campo: 'codAgraviado', alineacion: 'left' },
            { campo: 'nombreAgraviado', alineacion: 'left' },
            { campo: 'numerosDocumentos', alineacion: 'center' },
            { campo: 'montoTotalDocumentos', alineacion: 'center' }
        ];
        if (dataTable != undefined) {
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns = [
            { "width": "7%" },
            { "width": "9%" },
            { "width": "8%" },
            { "width": "8%", "type": "date-eu" },
            { "width": "20%" },
            { "width": "8%" },
            { "width": "18%" },
            { "width": "14" },
            { "width": "8%" }
        ];
        var orderByColumn = [1, "desc"];
        dataTable = parseDataTable("tabla_datos", columns, 300, orderByColumn, false, false, false, function () {
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
//------------------------------------------------
function anularOrden() {
    try {
        if (filaSeleccionada == undefined) {
            fancyAlert("Debe seleccionar una Orden de Pago");
        } else {
            if (arrayDatos[filaSeleccionada].estado != 'I') {
                fancyAlert("La Orden seleccionada debe estar en estado 'Pendiente de Aprobacion'");
            } else {
                parent.abrirVentanaFancyBox(1150, 570,
                    "tesor-pago-prov-aprobacion-detalle?accion=A&nroOrden=" + arrayDatos[filaSeleccionada].nroOrdenPago, true,
                    function () {
                        buscar();
                    },
                    true);
            }
        }
    } catch (err) {
        emitirErrorCatch(err, "anularOrdenProveedor");
    }
}
function aprobarOrden() {
    try {
        if (filaSeleccionada == undefined) {
            fancyAlert("Debe seleccionar una Orden!");
        } else {
            if (arrayDatos[filaSeleccionada].estado != 'I') {
                fancyAlert("La Orden seleccionada debe estar en estado 'Pendiente de Aprobacion'");
            } else {
                parent.abrirVentanaFancyBox(1150, 570,
                    "tesor-pago-prov-aprobacion-detalle?accion=B&nroOrden=" + arrayDatos[filaSeleccionada].nroOrdenPago, true,
                    function () {
                        buscar();
                    }, true);
            }
        }
    } catch (err) {
        emitirErrorCatch(err, "revisarOrdenProveedor()")
    }
}
