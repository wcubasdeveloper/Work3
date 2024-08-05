/**
 *
 */
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
var arrayDatos = [];
//var listaProvs = [];
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
var tipoDoc = {
    "C": "Cheque",
    "R": "Recibo"
}

cargarInicio(function () {
    $("#btnBuscar").click(function () {
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los contratos
    });
    $("#fechaDesde").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
    $("#fechaHasta").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });
    $("#fechaHasta").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto
    $("#btnRevisar").click(revisarCheque)
    $("#btnNuevo").click(nuevoCheque)
    // cargar lista de proveedores:
    DAOV.consultarWebServiceGet("getProveedores", "", function (arrayList) {
        //localStorage.setItem('glistaProvs', arrayList);
        var campos = { "keyId": 'idProveedor', "keyValue": 'nombreProveedor' }
        agregarOpcionesToCombo("idCmbProveedor", arrayList, campos);
        $("#idCmbProveedor").select2();
        $.fancybox.close()
        buscar()
    })
})
function buscar() { // busca los cheques que cumplan las condiciones
    try {

        var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
        var proveedor = $("#idCmbProveedor").val()

        var parametros = "&idProveedor=" + proveedor + "&fechaDesde=" + fechaDesde + "&fechaHasta=" + fechaHasta;

        DAO.consultarWebServiceGet("getListaChequesProv", parametros, listar, true, paginacion);

    } catch (err) {
        emitirErrorCatch(err, "buscar");
    }
}
function listar(resultsData) { // crea la grilla con la paginacion
    try {
        for (var i = 0; i < resultsData.length; i++) {
            resultsData[i].tipoDocDescrip = tipoDoc[resultsData[i].tipoDocumento]
        }

        arrayDatos = resultsData; //guarda pagina actual en variable global
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            { campo: 'tipoDocDescrip', alineacion: 'center' },
            { campo: 'nroDocumento', alineacion: 'left' },
            { campo: 'fechaRegistro', alineacion: 'center' },
            { campo: 'monto', alineacion: 'right' },
            { campo: 'nombreProveedor', alineacion: 'left' },
            { campo: 'listaOrdenPago', alineacion: 'left' },
            { campo: 'listaFacturas', alineacion: 'left' }
        ];
        if (dataTable != undefined) {
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns = [
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%", "type": "date-eu" },
            { "width": "10%" },
            { "width": "20%" },
            { "width": "20%" },
            { "width": "20%" }

        ];
        var orderByColumn = [2, "desc"];
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
function nuevoCheque() {
    try {
        parent.abrirVentanaFancyBox(1100, 525, "tesor-pago-cheq-prov-select?accion=N", true);
    } catch (err) {
        emitirErrorCatch(err, "nuevoCheque()")
    }
}
function revisarCheque() {
    try {
        if (filaSeleccionada == undefined) {
            fancyAlert("Debe seleccionar un Cheque/Recibo!");
        } else {
            var mnroDocumento = arrayDatos[filaSeleccionada].nroDocumento;
            var mtipoDocumento = arrayDatos[filaSeleccionada].tipoDocumento;
            parent.abrirVentanaFancyBox(1150, 300,
                "tesor-pago-cheq-prov-select?accion=E&nroDocumento=" + mnroDocumento +
                "&tipoDocumento=" + mtipoDocumento, true,
                function () {
                    buscar();
                },
                true);

        }
    } catch (err) {
        emitirErrorCatch(err, "revisarCheque()")
    }
}