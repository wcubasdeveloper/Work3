/**
 * Created by JEAN PIERRE on 16/10/2017.
 */
var contrato =  parent.window.frames[0].arrayDatos[parent.window.frames[0].filaSeleccionada];
var idContrato = $_GET("idContrato")
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var arrayDatos;
var dataTable;
cargarInicio(function(){
    labelTextWYSG("wb_Text1", LPAD(contrato.idContrato, numeroLPAD))
    $("#txtFechaEmision").val(contrato.fechaEmision)
    $("#txtVigContr_Inicio").val(contrato.fechaIniVigencia)
    $("#txtVigContr_Fin").val(contrato.fechaFinVigencia)
    $("#txtRazonSocial").val(contrato.nombreCorto)
    $("#txtNResolucion").val(contrato.nroResolucion)
    $("#btnDetalleCuota").click(verDetalleCuota)

    var parametros = "&idContrato="+idContrato;
    DAOV.consultarWebServiceGet("getCuotasPagadasPorContrato", parametros, function(results){
        arrayDatos = results;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'nroCuota'  , alineacion:'center'},
            {campo:'fechaPagoCuota', alineacion:'center'},
            {campo:'flotaActual'   , alineacion:'center'},
            {campo:'totalCuota'    , alineacion:'right'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", arrayDatos, camposAmostrar, true, 12); // crea la tabla HTML

        var columns=[
            { "width": "25%" },
            { "width": "25%"},
            { "width": "25%"},
            { "width": "25%"}
        ];
        var orderByColumn=[0, "asc"];
        dataTable=parseDataTable("tabla_datos", columns, 307, false, false, false, false);
        $.fancybox.close()
    })
})
function verDetalleCuota(){
    try{
        if(filaSeleccionada!=undefined){
            abrirVentanaFancyBox(1016, 514, "vtaspj-renovacion-cuota-detalle?idContrato="+idContrato+
                "&idContratoRenovacion="+arrayDatos[filaSeleccionada].idContratoRenovacion+"&nroCuota="+arrayDatos[filaSeleccionada].nroCuota, true);
        }else{
            fancyAlert("¡Se debe seleccionar una cuota!")
        }
    }catch(err){
        emitirErrorCatch(err, "verDetalleCuota()")
    }
}