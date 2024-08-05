/**
 */
var accion;
var nroOrden = 0
var idExpediente, tipoExpediente, tipoExp;
var codAgraviado, codEvento;
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var arrayDatosCartas = [], arrayDatosFac = [];
var contadorIdCartas = 0, contadorIdFacturas = 0;
var listaCartas = [] // CARTAS RESTANTES del agraviado
var tiposDocumentos = []
var estados = {
    "P": "Pend."
}
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

var estadoOrden;

var camposAmostrarC = [ // asigna los campos a mostrar en la grilla
    { campo: 'etapa', alineacion: 'center' },
    { campo: 'nosocomio', alineacion: 'left' },
    { campo: 'estadoCarta', alineacion: 'Center' },
    { campo: 'nroCarta', alineacion: 'center' },
    { campo: 'fechaCarta', alineacion: 'center' },
    { campo: 'tipoAtencion', alineacion: 'left' },
    { campo: 'monto', alineacion: 'right' }
];
var camposAmostrarF = [ // asigna los campos a mostrar en la grilla
    { campo: 'nombreEtapa', alineacion: 'center' },
    { campo: 'tipoDocumento', alineacion: 'center' },
    { campo: 'nroDocumento', alineacion: 'center' },
    { campo: 'fechaEmision', alineacion: 'Center' },
    { campo: 'observaciones', alineacion: 'left' },
    { campo: 'fechaRecepcion', alineacion: 'center' },
    { campo: 'monto', alineacion: 'right' }
];

var nombreEtapas = {
    "1": "Gastos Médicos",
    "5": "Por sepelio"
}
cargarInicio(function () {
    $("#txtEstado").hide()
    $("#txtNroOrden").css("font-size", "12.5px")
    accion = $_GET("accion") // A= Anular orden; B = Aprobar una orden de pago ya existente
    nroOrden = parseInt($_GET("nroOrden"))
    $("#txtNroOrden").val(nroOrden)
    // agrega funcionalidades a los botones:
    $("#btnConfirmar").click(confirmaAccion);
    $("#fechaOrden").datetimepicker({ lan: 'es', format: 'd/m/Y', timepicker: false, closeOnDateSelect: true });

    // cargar lista de proveedores:
    DAOV.consultarWebServiceGet("getProveedores", "",
        function (arrayProveedores) {
            var campos = { "keyId": 'idProveedor', "keyValue": 'nombreProveedor' }
            agregarOpcionesToCombo("idProveedor", arrayProveedores, campos);
            aplicarDataTableCartas()
            aplicarDataTableFacturas()
            var parametros = "&nroOrdenPago=" + nroOrden
            DAO.consultarWebServiceGet("getOrdenPagoDetalle", parametros,
                function (results) {
                    idExpediente = results[0].idExpediente;
                    tipoExpediente = results[0].tipoExpediente;
                    codAgraviado = results[0].codAgraviado;
                    codEvento = results[0].codEvento;
                    estadoOrden = results[0].estado;
                    $("#fechaOrden").val(results[0].fechaRegistro);
                    $("#codEvento").val(results[0].codEvento);
                    $("#idNombre").val(results[0].nombreAgraviado);
                    $("#idAgraviado").val(codAgraviado);
                    $("#idProveedor").val(results[0].idProveedor);
                    $("#idProveedor").prop("disabled", true);
                    $("#idProveedor").select2();

                    // carga cartas de la orden
                    arrayDatosCartas = results[0].arrayDatosCartas;
                    for (var i = 0; i < arrayDatosCartas.length; i++) {
                        contadorIdCartas++;
                        arrayDatosCartas[i].idDetalle = contadorIdCartas;
                        arrayDatosCartas[i].estadoCarta = estados[arrayDatosCartas[i].estado];
                        if (arrayDatosCartas[i].idPrimeraProyeccion == 0) {
                            arrayDatosCartas[i].nroCarta = LPAD(arrayDatosCartas[i].idCarta, numeroLPAD);
                        }
                    }
                    agregaFilasHTML("tabla_datosL", arrayDatosCartas, camposAmostrarC, 12);
                    cargarTotalCartas();

                    // carga las facturas de la orden
                    arrayDatosFac = results[0].arrayDatosFac;
                    for (var y = 0; y < arrayDatosFac.length; y++) {
                        contadorIdFacturas++;
                        arrayDatosFac[y].idDetalle = contadorIdFacturas;
                        arrayDatosFac[y].nombreEtapa = nombreEtapas[arrayDatosFac[y].idEtapa];
                    }

                    agregaFilasHTML("tabla_datosD", arrayDatosFac, camposAmostrarF, 12, 1);
                    cargarTotalFacturas();
                    modoSoloLectura()
                    $.fancybox.close()
                }
            )
        }
    );
})
function modoSoloLectura() {
    try {
        $(":input").prop("disabled", true);
        $(":input").css("opacity", "0.5")
        $("#btnConfirmar").prop("disabled", false);
        $("#btnConfirmar").css("opacity", "1");
    } catch (err) {
        emitirErrorCatch(err, "modoSoloLectura")
    }
}
//NroTabla="" => un solo datTable o el primero, "1" => 2da datTable en la pantalla
function agregaFilasHTML(idTablaHTML, datos, campoAlineacionArray, fontSize, NroTabla) {
    try {
        if (fontSize == undefined) {
            fontSize = 11;
        }
        if (NroTabla == undefined) {
            NroTabla = "";
        }

        var onclick = "";
        var AlineacionTD = "";
        var cantidadAtributos = 0;
        //$("#"+idTablaHTML+" > tbody").html(""); // reinicia
        if (datos.length > 0) {
            cantidadAtributos = campoAlineacionArray.length; // obtiene la cantidad de atributos
            var filaTRAppend = "", nCampo = "", idFila = 0;
            for (var i = 0; i < datos.length; i++) {
                idFila = datos[i].idDetalle;
                //hay dos funciones globales seleccionarFila y seleccionarFila1 >> para dataTable alterno
                onclick = "onclick='seleccionarFila" + NroTabla + "(" + '"' + idFila + '"' + ")' id='tr" + NroTabla + "_" + idFila + "'";
                filaTRAppend += "<tr  style='font-family: Arial; height: 30px; cursor: pointer; font-size: " + fontSize + "px;' " + onclick + ">";
                for (var y = 0; y < cantidadAtributos; y++) { //completa las columnas segun la cantidad de atributos
                    AlineacionTD = "justify";
                    var conLPAD = false; // option que determina si el campo se completera con ceros
                    var cantidadCeros = numeroLPAD; // cantidad de ceros
                    if (campoAlineacionArray[y] != undefined) {
                        AlineacionTD = campoAlineacionArray[y].alineacion;
                        if (campoAlineacionArray[y].LPAD == true) {
                            conLPAD = true;
                            if (campoAlineacionArray[y].cantLPAD > 0) {
                                cantidadCeros = campoAlineacionArray[y].cantLPAD;
                            }
                        }
                    }
                    nCampo = campoAlineacionArray[y].campo;
                    filaTRAppend += "<td style='vertical-align: middle; text-align: " + AlineacionTD + "'>"
                        + quitarEspaciosEnBlanco((conLPAD) ? LPAD(datos[i][nCampo], cantidadCeros) : datos[i][nCampo]) + "</td>";
                }
                filaTRAppend += "</tr>";
            }
            $("#" + idTablaHTML + " > tbody").append(filaTRAppend);
        }
    } catch (err) {
        emitirErrorCatch(err, "crearFilasHTML");
    }
}
function cargarTotalCartas() {
    try {
        var totalCartas = 0;
        for (var i = 0; i < arrayDatosCartas.length; i++) {
            totalCartas = totalCartas + arrayDatosCartas[i].monto
        }
        totalCartas = "S/. " + number_format(totalCartas, 2, '.', ',')
        $("#txtTotalCarta").val(totalCartas)
    } catch (err) {
        emitirErrorCatch(err, "cargarTotalCartas")
    }
}
function cargarTotalFacturas() {
    try {
        var totalFacturas = 0;
        for (var i = 0; i < arrayDatosFac.length; i++) {
            totalFacturas = totalFacturas + arrayDatosFac[i].monto
        }
        totalFacturas = "S/. " + number_format(totalFacturas, 2, '.', ',')
        $("#txtTotalDeposito").val(totalFacturas)
    } catch (err) {
        emitirErrorCatch(err, "cargarTotalFacturas")
    }
}

function aplicarDataTableCartas() {
    try {
        var columns = [
            { "width": "10%" },
            { "width": "25%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "25%" },
            { "width": "10%" }
        ];
        parseDataTable("tabla_datosL", columns, 132, false, false, false, false,
            function () {
                if ($("#tabla_datosL > tbody >tr").length == 1 && $("#tabla_datosL > tbody >tr")[0].innerText == 'NO SE ENCONTRARON REGISTROS') {
                    $("#tabla_datosL > tbody").html("");
                }
            });
        $.fancybox.close();

    } catch (err) {
        emitirErrorCatch(err, "aplicarDataTableCartas")
    }
}
function aplicarDataTableFacturas() {
    try {
        var columns = [
            { "width": "10%" },
            { "width": "14%" },
            { "width": "14%" },
            { "width": "14%" },
            { "width": "25%" },
            { "width": "14%" },
            { "width": "9%" }
        ];
        parseDataTable1("tabla_datosD", columns, 120, false, false, false, false,
            function () {
                if ($("#tabla_datosD > tbody >tr").length == 1 && $("#tabla_datosD > tbody >tr")[0].innerText == 'NO SE ENCONTRARON REGISTROS') {
                    $("#tabla_datosD > tbody").html("");
                }
            });
        $.fancybox.close();

    } catch (err) {
        emitirErrorCatch(err, "aplicarDataTableCartas")
    }
}
// La funcion confirmaAccion solo marca la transaccion como Aprobada (estado="B") o Anulada (estado="A")
function confirmaAccion() {
    try {
        var msjConfirm = (accion == 'A') ? '¿ Anula la Orden de Pago ?' : '¿ Aprueba la Orden de Pago ?';
        fancyConfirm(msjConfirm, function (rpta) {
            if (rpta) {
                var parametrosPOST = { nroOrden: nroOrden, estado: accion, idExpediente: idExpediente };
                DAO.consultarWebServicePOST(parametrosPOST, "actualizaEstadoOrdenPago",
                    function (data) {
                        if (data[0] > 0) {
                            //19/NOV/2019 Ya no se emite Cheque de forma individual, ahora se agrupan Ordenes x Proveedor y se genera
                            //un solo cheque
                            /*if (accion == 'B'){
                                fancyConfirm("Orden de Pago Actualizada! <BR> Desea emitir el Cheque/Recibo correspondiente?",
                                    function (rpta) {
                                        if (rpta) {
                                            abrirVentanaFancyBox(1150, 300,
                                                "tesor-pago-cheq-detalle?accion=N1&nroExpediente="+idExpediente+
                                                "&codAgraviado="+codAgraviado+
                                                "&codEvento="+codEvento+
                                                "&nombreAgraviado="+$("#idNombre").val()+
                                                "&idExpediente="+idExpediente+
                                                "&tipoExp="+tipoExp[tipoExpediente]+
                                                "&tipoExpediente="+tipoExpediente+
                                                "&nroOrdenPago="+nroOrden+
                                                "&beneficiario="+$("#idProveedor :selected").text() ,
                                                true,
                                                function(){
                                                    realizoTarea=true;
                                                    parent.$.fancybox.close();                                                },
                                                false); //true);
                                    }else{ 
                                        realizoTarea=true;
                                        parent.$.fancybox.close();
                                        }
                                });
                            }else{*/
                            realizoTarea = true;
                            parent.$.fancybox.close();
                            //}
                        } else {
                            //no se pudo actualizar
                        }
                    })
            }
        });
    } catch (err) {
        emitirErrorCatch(err, "confirmaAccion")
    }
}
