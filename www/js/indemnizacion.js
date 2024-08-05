$(document).ready(function(){
	cargarReporteIndemnizacion(); // 
});
function cargarReporteIndemnizacion(){ // carga la opcion reporte de indemnizacion
    try{
    	fancyAlertWait("Cargando");
        $("#fechaInicio").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});;
        $("#fechaFin").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});;
        $.fancybox.close();
    }catch (err){
        var txt = "Se encontro un error en la funcion cargarReporteIndenizacion.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function descargarReporteIndemnizacion(){ // descarga reporte de indemnizacion
    try{
        var inputValida="fechaInicio-Fecha de inicio/fechaFin-Fecha fin";
        if(validarInputsValueXid(inputValida)){
            fechaInicio=$("#fechaFin").val().split("/");
            fechaFin = $("#fechaInicio").val().split("/");
            if((new Date(fechaInicio[2], fechaInicio[1], fechaInicio[0]))<= (new Date(fechaFin[2], fechaFin[1], fechaFin[0]))){
                fancyAlert("La fecha Fin debe ser mayor que la fecha Inicio");
                return;
            }
            fancyAlertWait("cargando");
            var parametros="&fechaInicio="+$("#fechaInicio").val()+
                "&fechaFin="+$("#fechaFin").val();
            webService( "getAllIndemnizaciones", parametros, "reporteExcelIndemnizacion()" );
        }
    }catch (err){
        var txt = "Se encontro un error en la funcion descargarReporteIndemnizacion.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function reporteExcelIndemnizacion(){
    try{
        var contentHTML="<table border='1' style='font-size: 14px; font-family: Arial;'>"+
            "<thead style='background-color: #38C55B;'>" +
            "<th><center><strong>SINIESTRO</strong></center>" +
            "<th><center><strong>NUMERO EXPEDIENTE</strong></center>" +
            "<th><center><strong>NOMBRE BENEFICIARIO</strong></center>" +
            "<th><center><strong>FECHA</strong></center>" +
            "<th><center><strong>ASUNTO</strong></center>" +
            "</thead>"+
            "<tbody>";
        if(rptaWebservice.length>0){
            for(var i=0; i<rptaWebservice.length; i++){
                contentHTML+="<tr style='font-size: 12px; '>" +
                    "<td align='left'>"+rptaWebservice[i].SINIESTRO+"</td>" +
                    "<td align='left'>"+rptaWebservice[i].NRO_EXPEDIENTE+"</td>" +
                    "<td align='left'>"+rptaWebservice[i].NOMBRE_BENEFICIARIO+"</td>" +
                    "<td align='left'>"+fechaFormateada(rptaWebservice[i].FECHA,true, false)+"</td>" +
                    "<td align='left'>"+rptaWebservice[i].asunto+"</td>" +
                    "</tr>";
            }
        }
        contentHTML+="</tbody></table>";
        nombreExcel="Indemnizaciones solicitadas_ DEL "+$("#fechaInicio").val()+" AL "+$("#fechaFin").val();
        if(generarExcelConJqueryYhtml(contentHTML, nombreExcel)){
        	var parametros="&fechaInicio="+$("#fechaInicio").val()+
            			   "&fechaFin="+$("#fechaFin").val();
        	webService( "getIndemnizacionesPagadas", parametros, "reporteExcelIndemnizacionPagadas()" );
        }else{
            fancyAlert("Ocurrio un problema al descarga el excel de Indemnizaciones solicitadas. Por favor comuniquese con el soporte técnico")
        }        
    }catch (err){
        var txt = "Se encontro un error en la funcion reporteExcelIndemnizacion.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function reporteExcelIndemnizacionPagadas(){
    try {
        var contentHTML = "<table border='1' style='font-size: 14px; font-family: Arial;'>" +
            "<thead style='background-color: #38C55B;'>" +
            "<th><center><strong>SOLICITUD</strong></center>" +
            "<th><center><strong>FECHA RECEPCION</strong></center>" +
            "<th><center><strong>SINIESTRO</strong></center>" +
            "<th><center><strong>DESCRIPCION ESTADO</strong></center>" +
            "<th><center><strong>NOMBRE SOLICITANTE</strong></center>" +
            "<th><center><strong>DESCRIPCION</strong></center>" +
            "<th><center><strong>NRO CHEQUE</strong></center>" +
            "<th><center><strong>FECHA CHEQUE</strong></center>" +
            "<th><center><strong>MONTO SOL</strong></center>" +
            "<th><center><strong>BENEFICIARIO</strong></center>" +
            "</thead>" +
            "<tbody>";
        if (rptaWebservice.length > 0) {
            for (var i = 0; i < rptaWebservice.length; i++) {
                contentHTML += "<tr style='font-size: 12px; '>" +
                "<td align='left'>" + rptaWebservice[i].solicitud + "</td>" +
                "<td align='left'>" + fechaFormateada(rptaWebservice[i].fecha_recepcion,true, false) + "</td>" +
                "<td align='left'>" + rptaWebservice[i].siniestro + "</td>" +
                "<td align='left'>" + rptaWebservice[i].descript_estado+ "</td>" +
                "<td align='left'>" + rptaWebservice[i].nombresolicitante + "</td>" +
                "<td align='left'>" + rptaWebservice[i].descripcion + "</td>" +
                "<td align='left'>" + rptaWebservice[i].nrocheque + "</td>" +
                "<td align='left'>" + fechaFormateada(rptaWebservice[i].Fecha_Cheque, true, false) + "</td>" +
                "<td align='left'>" + rptaWebservice[i].montoSol + "</td>" +
                "<td align='left'>" + rptaWebservice[i].benificiario + "</td>" +
                "</tr>";
            }
        }
        contentHTML += "</tbody></table>";
        nombreExcel = "Indemnizaciones pagadas_ DEL" + $("#fechaInicio").val() + " AL " + $("#fechaFin").val();
        if(generarExcelConJqueryYhtml(contentHTML, nombreExcel)){
        	fancyAlert("Reportes generados exitosamente");
        }else{
            fancyAlert("Ocurrio un problema al descarga el excel de Indemnizaciones Pagadas. Por favor comuniquese con el soporte técnico")
        }        
    }
    catch (err){
        var txt = "Se encontro un error en la funcion reporteExcelIndemnizacion.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}