/**
 * Created by JEAN PIERRE on 17/10/2017.
 */
var dataTable = undefined;
var arrayDatos = []
var idContrato=0;
var nroCuota = 0;
var idContratoRenovacion=0;
var detalleContrato;
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var estadoVehiculo = {"O":"ORIG", "I":"INCL", "E":"EXCL"}
cargarInicio(function() {
    idContrato = $_GET("idContrato")
    nroCuota = parseInt($_GET("nroCuota"))
    idContratoRenovacion = $_GET("idContratoRenovacion")

    // carga la informacion del contrato con su cuota
    var parametros = "&idContrato="+idContrato+
        "&nroCuota="+nroCuota;
    DAOV.consultarWebServiceGet("getContratoDetalle", parametros, function(datos){

        detalleContrato = datos[0]

        $("#txtFechaEmision").val(detalleContrato.fechaEmision)
        $("#txtVigContr_Inicio").val(detalleContrato.fechaVigenciaContr)
        $("#txtVigContr_Fin").val(detalleContrato.fechaVigenciaContrFin)
        var nombreEmpresa = detalleContrato.razonSocial
        if(detalleContrato.tipoPersona=='N'){
            nombreEmpresa = detalleContrato.nombreNaturalEmpresa
        }
        $("#txtRazonSocial").val(nombreEmpresa)
        $("#txtNResolucion").val(detalleContrato.nroResolucion)
        $("#txtNCuota").val(nroCuota+"/"+detalleContrato.nCuotas)
        $("#txtFechaCuota").val(parent.arrayDatos[parent.filaSeleccionada].fechaPagoCuota)
        labelTextWYSG("wb_Text1", LPAD(detalleContrato.idContrato, numeroLPAD))
		
		// quita todos los certificados que hayan sido incluidos en la cuota pero que fueron agregados en la siguiente cuota (nroCertificado = null)
        for(var i=0; i<detalleContrato.listaFlota.length; i++){
            if(detalleContrato.listaFlota[i].nCertificado!=null){
                arrayDatos.push(detalleContrato.listaFlota[i])
            }
        }		
        for(var i=0; i<arrayDatos.length; i++){
            arrayDatos[i].idDetalle=i;
            arrayDatos[i].nroOrden = i+1;
            arrayDatos[i].estadoVehiculo = estadoVehiculo[arrayDatos[i].estado]
        }
        listar()
        $.fancybox.close()
    })
})
function listar() { // crea la grilla con la paginacion usando "arrayDatos"
    try{
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'nroOrden'  , alineacion:'center'},
            {campo:'estadoVehiculo'         , alineacion:'center'},
            {campo:'nCertificado'         , alineacion:'left'},
            {campo:'placa'         , alineacion:'center'},
            {campo:'marca'        , alineacion:'left'},
            {campo:'modelo'          , alineacion:'left'},
            {campo:'anno'         , alineacion:'center'},
            {campo:'nombreUso', alineacion:'left'},
            {campo:'clase'   , alineacion:'left'},
            {campo:'precio', alineacion:'right'},
            {campo:'prima', alineacion:'right'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", arrayDatos, camposAmostrar, true, 12); // crea la tabla HTML

        var columns=[
            { "width": "5%" },
            { "width": "9%"},
            { "width": "11%"},
            { "width": "10%"},
            { "width": "10%"},
            { "width": "10%" },
            { "width": "5%"},
            { "width": "14%"},
            { "width": "14%" },
            { "width": "6%" },
            { "width": "6%" }
        ];
        var orderByColumn=[0, "asc"];
        dataTable=parseDataTable("tabla_datos", columns, 290, false, false, false, false);
    }catch(err){
        emitirErrorCatch(err, "listar()")
    }
}