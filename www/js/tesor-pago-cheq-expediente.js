/**
 * Created by JEAN PIERRE on 27/02/2018.
 */
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var dataTable = undefined;
var arrayDatos = [];
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
cargarInicio(function () {
    // Agrega campos de tipo entero:
    $("#idDNI").prop("maxlength", "8")
    $("#idDNI").addClass("solo-numero")
    $("#idNumero").addClass("solo-numero")
    $("#idOrden").addClass("solo-numero")
    $(".solo-numero").keypress(function (e) { // permite ingresar solo numeros
        return textNumber(e);
    });
    $("#btnBuscar").click(buscar)
    $("#btnContinuar").click(continuarConTransaccion)
    listar(arrayDatos)
})
function buscar() {

    var codAgraviado = $("#idCodigo").val();
    var nombre = $("#idNombre").val();
    var dni = $("#idDNI").val();
    var nroExp = $("#idNumero").val()
    var nroOrden = $("#idOrden").val()

    var parametros = "&codAgraviado=" + codAgraviado +
        "&nombre=" + nombre +
        "&dni=" + dni + "&nroExpediente=" + nroExp +
        "&nroOrden=" + nroOrden;
    //DAO.consultarWebServiceGet("getListaOrdenesPagoAgrav_Proveed", parametros, listar, true, null);
    DAO.consultarWebServiceGet("getListaOrdenesPagoAgrav", parametros, listar, true, null);
}
function listar(resultsData) {

    for (var i = 0; i < resultsData.length; i++) {
        resultsData[i].tipoExp = tipoExp[resultsData[i].tipoExpediente]
    }

    arrayDatos = resultsData; //guarda pagina actual en variable global

    var camposAmostrar = [ // asigna los campos a mostrar en la grilla
        { campo: 'tipoExp', alineacion: 'center' },
        { campo: 'idExpediente', alineacion: 'center', LPAD: true },
        { campo: 'ordenPago', alineacion: 'center' },
        { campo: 'codEvento', alineacion: 'center' },
        { campo: 'codAgraviado', alineacion: 'center' },
        { campo: 'nroDocumento', alineacion: 'center' },
        { campo: 'nombreAgraviado', alineacion: 'left' },
        { campo: 'monto', alineacion: 'right' }
    ];
    if (dataTable != undefined) {
        dataTable.destroy();
    }
    crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
    var columns = [
        { "width": "15%" },
        { "width": "10%" },
        { "width": "10%" },
        { "width": "10%" },
        { "width": "10%" },
        { "width": "10%" },
        { "width": "25%" },
        { "width": "10%" }
    ];
    var orderByColumn = [2, "desc"];
    dataTable = parseDataTable("tabla_datos", columns, 320, orderByColumn, false, false, false)
    $.fancybox.close();
}

function continuarConTransaccion() {
    try {
        if (filaSeleccionada == undefined) {
            fancyAlert("Debe seleccionar un expediente!");
        } else {
            parent.abrirVentanaFancyBox(1150, 570,
                "tesor-pago-cheq-detalle?accion=N&nroExpediente=" + arrayDatos[filaSeleccionada].idExpediente +
                "&codAgraviado=" + arrayDatos[filaSeleccionada].codAgraviado +
                "&codEvento=" + arrayDatos[filaSeleccionada].codEvento +
                "&nombreAgraviado=" + arrayDatos[filaSeleccionada].nombreAgraviado +
                "&idExpediente=" + arrayDatos[filaSeleccionada].idExpediente +
                "&tipoExp=" + arrayDatos[filaSeleccionada].tipoExp +
                "&tipoExpediente=" + arrayDatos[filaSeleccionada].tipoExpediente +
                "&nroOrdenPago=" + arrayDatos[filaSeleccionada].ordenPago +
                "&monto=" + arrayDatos[filaSeleccionada].monto +
                "&beneficiario=" + arrayDatos[filaSeleccionada].beneficiario, true,
                function () {
                    buscar();
                },
                true);
        }
    } catch (err) {
        emitirErrorCatch(err, "continuarConTransaccion()")
    }
}