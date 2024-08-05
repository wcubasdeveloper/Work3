/**
 * Created by Jean on 16/07/2015.
 */
var dataTableCuotas=undefined;
function listarEstadosCuenta(data){
    try{
        if(dataTableCuotas!=undefined){
            dataTableCuotas.destroy();
        }
        for(var i=0; i<data.length; i++){
            var colorSaldoPendiente='';
            if(data[i].montoPagado==null){
                data[i].montoPagado=0;
            }
            data[i].saldo=parseFloat(data[i].valorCuota)-parseFloat(data[i].montoPagado);
            data[i].saldo="S/. "+data[i].saldo;
            data[i].valorCuota="S/. "+data[i].valorCuota;
            if(data[i].ultimaFechaPago==null){
                data[i].ultimaFechaPago="----------";
            }
            switch (data[i].estadoCuota){
                case 'D':
                    data[i].estadoCuota='Pendiente';
                    colorSaldoPendiente=" color: red; ";
                    break;
                case 'S':
                    data[i].estadoCuota='Saldo Pend.';
                    colorSaldoPendiente=" color: red; ";
                    break;
                case 'C':
                    data[i].estadoCuota='Cancelado';
                    break;
                case 'P':
                    data[i].estadoCuota='Pagado';
                    break;
                case 'G':
                    data[i].estadoCuota='Orden de Pago';
                    colorSaldoPendiente=" color: red; ";
                    break;
            }
            $("#tabla_datos_cuotas > tbody").append("<tr style='font-family: Arial; height: 30px; font-size:12px;'>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].nroCuota+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].estadoCuota+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].fechaVencimiento+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].valorCuota+"</td>"+
                "<td style='vertical-align: middle; text-align:center; "+colorSaldoPendiente+"' >"+data[i].saldo+"</td>"+
                "<td style='vertical-align: middle; text-align:center'>"+data[i].ultimaFechaPago+"</td>"+
                +"</tr>");
        }
        arrayInfoAcuerdo.cuotas=data;

    /*    arrayColumAlign=[ // ANTERIORMENTE CREABA LA TABLA CON LA FUNCION crearFilasHTML
            {campo:'nroCuota', alineacion:'center'},
            {campo:'estadoCuota', alineacion:'center'},
            {campo:'fechaVencimiento', alineacion:'center'},
            {campo:'valorCuota', alineacion:'center'},
            {campo:'saldo', alineacion:'center'},
            {campo:'ultimaFechaPago', alineacion:'center'}
        ];

        crearFilasHTML("tabla_datos_cuotas", data, arrayColumAlign, false, 12);*/
        var columns=[
            {width:"8%"},
            {width:"20%"},
            {width:"13%"},
            {width:"20%"},
            {width:"20%"},
            {width:"19%"}
        ];
        dataTableCuotas=parseDataTable("tabla_datos_cuotas", columns, 336, false, false);
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "cargarTablaEstadosCuenta")
    }
}
/* @cargarEstadosCuenta: Busca y obtiene los estados de las cuotas de un acuerdo (Pend., Saldo Pendiente, Cancelado, Pagado, con Orden de pago).
*/
funcionUltima=function cargarEstadosCuenta(){
    try{
        var parametros="&idAcuerdo="+arrayInfoAcuerdo.idAcuerdo;
        consultarWebServiceGet("getCuotasByAcuerdo", parametros, listarEstadosCuenta);
    }catch(err){
        emitirErrorCatch(err, "cargarEstadosCuenta")
    }
}
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
    /*$("#idBtnGenerarExcel").click(function(){
        generarExcelCuotasPendientes(cargarTablaCuotas)
    })*/
    $("#idBtnGenerarExcel").click(function(){
        generarPDF('2');
    });
});