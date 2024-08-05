var dataTableCuotas=undefined;

/* @listarCuotas: Carga las cuotas pendientes de pagar en una TABLA HTML
*/
function listarCuotas(data){
    try{
        for(var i=0; i<data.length; i++){
            if(data[i].montoPagado==null){
                data[i].montoPagado=0;
            }
            data[i].saldo=parseFloat(data[i].valorCuota)-parseFloat(data[i].montoPagado);
            data[i].saldo="S/. "+data[i].saldo;
            data[i].valorCuota="S/. "+data[i].valorCuota;
        }
        arrayInfoAcuerdo.cuotas=data;
        arrayColumAlign=[
            {campo:'nroCuota', alineacion:'center'},
            {campo:'fechaVencimiento', alineacion:'center'},
            {campo:'valorCuota', alineacion:'center'},
            {campo:'saldo', alineacion:'center'}
        ];
        if(dataTableCuotas!=undefined){
            dataTableCuotas.destroy();
        }
        crearFilasHTML("tabla_datos_cuotas", data, arrayColumAlign, false, 12);
        var columns=[
            {width:"25%"},
            {width:"25%"},
            {width:"25%"},
            {width:"25%"}
        ];
        dataTableCuotas=parseDataTable("tabla_datos_cuotas", columns, 343, false, false);
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "listarCuotas")
    }
}

/* @cargarCuotasPendientes: Busca y carga las cuotas Pendientes de pagar (Saldo es mayor que 0)
*/
funcionUltima=function cargarCuotasPendientes(){
    try{
        var parametros="&idAcuerdo="+arrayInfoAcuerdo.idAcuerdo+"&estado=D-S-G"; // Pendientes y saldo pendiente
        consultarWebServiceGet("getCuotasByAcuerdo", parametros, listarCuotas)
    }catch(err){
        emitirErrorCatch(err, "cargarCuotasPendientes")
    }
}
/**
 * Created by Jean on 13/07/2015.
 */
cargarInicio(function(){
    $("#idLblFechaEmision").val(fechaFormateada((new Date()), false, true));
    parent.abrirVentanaFancyBox(900,500, "buscaracuerdos", true, cargarInfoAcuerdo, true);
    $("#idBtnBuscarAcuerdo").click(function(){
        if($("#idBtnBuscarAcuerdo").val()=="Buscar Acuerdo"){
            parent.abrirVentanaFancyBox(900,500, "buscaracuerdos", true, cargarInfoAcuerdo, true);
        }else{
            cancelarTareaControlPago();
        }
    })
    $("#idBtnGenerarExcel").click(function(){
        generarPDF('1');
    });
});
