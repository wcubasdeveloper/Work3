/**
 * Created by JP on 25/06/2015.
 */
var eventoDetalle=new Array();
cargarInicio(function(){
    $("#fechaInicio").datetimepicker({lan:'es', formatDate:'d/m/Y', format:'d/m/Y', maxDate:0, timepicker:false, closeOnDateSelect:true});
    $("#fechaFin").datetimepicker({lan:'es', formatDate:'d/m/Y', format:'d/m/Y', maxDate:0, timepicker:false, closeOnDateSelect:true});
    $("#ReporteXperiodo").click(reporteXperiodo)
    $("#ReporteXevento").click(cargarInfoEvento);
	if(codEventoSeleccionado!=""){
		$('#codEvento').val(codEventoSeleccionado);
	}
});

/* @reporteXperiodo: Obtiene los gastos de cada evento encontrado dentro del periodo ingresado.
*/
function reporteXperiodo() {
    try{
        var idPanel="idPanelFechas";
        if(validarCamposRequeridos(idPanel)){
            if($("#fechaFin").val()!=""){ // Si se ingreso la fecha Fin, valida que sea mayor que FECHA DE INICIO
                var fechainicio=$("#fechaInicio").val();
                var fechaFin=$("#fechaFin").val();
                if(!verificarFechaMayor(fechainicio, fechaFin)){ // No se cumple la condicion
                    fancyAlertFunction("La fecha Fin debe ser mayor que la fecha Inicial", function(estado){
                        $("#fechaFin").val();
                    });
                    return;
                }
            }
            fancyAlertWait("Generando reporte");
            var parametros="&fechaInicio="+dateTimeFormat($("#fechaInicio").val())+
                "&fechaFin="+dateTimeFormat($("#fechaFin").val());
            webService2("getGastosXperiodo", parametros, "descargarReporteXperiodo()"); // busca los gastos de todos los eventos
        }
    }catch(err){
        emitirErrorCatch(err,"reporteXperiodo")
    }
}

/*@descargarReporteXperiodo: Emite un reporte Excel de los gastos de los eventos por periodo.
*/
function descargarReporteXperiodo(){
    try{
        var contentHTML="<table border='1' style='font-size: 14px; font-family: Arial; background-color:#f5f5f5;'>"+
            "<thead>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>COD. EVENTO</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>FECHA</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>DESCRIPCION</strong></center>" +
			"<th style='background-color: #0067a3; color: #ffffff;'><center><strong>CAUSAL 1</strong></center>" +
			"<th style='background-color: #0067a3; color: #ffffff;'><center><strong>CAUSAL 2</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>ASOCIADO</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>CAT</strong></center>" +
			"<th style='background-color: #0067a3; color: #ffffff;'><center><strong>DIRECCION DEL ASOCIADO</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>PLACA</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>CONDUCTOR</strong></center>" +
			"<th style='background-color: #0067a3; color: #ffffff;'><center><strong>DNI CONDUCTOR</strong></center>" +
			"<th style='background-color: #0067a3; color: #ffffff;'><center><strong>LICENCIA</strong></center>" +
			"<th style='background-color: #0067a3; color: #ffffff;'><center><strong>TOTAL GASTOS (S/.)</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>FECHA ULTIMO GASTO</strong></center>" +
            "</thead>"+
            "<tbody>";
        for(var i=0; i<rptaWebservice.length; i++){
            var asociado="";
            switch (rptaWebservice[i].tipoPersona){
                case 'N':
                    asociado=rptaWebservice[i].nombreAsociado;
                    break;
                case 'J':
                    asociado=rptaWebservice[i].razonSocial;
                    break;
            }
            var gastos=rptaWebservice[i].montoTotalGasto;
            var ultimaFechaGasto="No se encontraron Gastos";
            if(gastos==null){
                gastos=0;
            }else{
                ultimaFechaGasto=fechaFormateada(rptaWebservice[i].ultimaFecha, false);
            }
			var direccionAsociado = "";
			if(rptaWebservice[i].distritoAsociado!=null){
				direccionAsociado = direccionAsociado+"("+rptaWebservice[i].distritoAsociado+")";
			}
			direccionAsociado = direccionAsociado+quitarEspaciosEnBlanco(rptaWebservice[i].calle)+" "+quitarEspaciosEnBlanco(rptaWebservice[i].nro)+" "+quitarEspaciosEnBlanco(rptaWebservice[i].mzLote)+" "+quitarEspaciosEnBlanco(rptaWebservice[i].sector);
			
			if(rptaWebservice[i].referencia!=null && rptaWebservice[i].referencia!=""){
				direccionAsociado = direccionAsociado+"("+rptaWebservice[i].referencia+")";
			}
			
            contentHTML+="<tr style='font-size: 12px; '>" +
                "<td align='center'>"+rptaWebservice[i].codEvento+"</td>" +
                "<td align='center'>"+fechaFormateada(rptaWebservice[i].fechaAccidente, false)+"</td>" +
                "<td align='left'>"+rptaWebservice[i].descripcionEvento+"</td>" +
				"<td align='left'>"+quitarEspaciosEnBlanco(rptaWebservice[i].causal1)+"</td>" +
				"<td align='left'>"+quitarEspaciosEnBlanco(rptaWebservice[i].causal2)+"</td>" +
                "<td align='left'>"+asociado+"</td>" +
                "<td align='center'>"+rptaWebservice[i].nroCAT+"</td>" +
				"<td align='left'>"+direccionAsociado+"</td>"+
                "<td align='center'>"+rptaWebservice[i].placa+"</td>" +
				"<td align='left'>"+rptaWebservice[i].nombreChofer+"</td>" +
                "<td align='center'>"+rptaWebservice[i].dniChofer+"</td>" +
				"<td align='center'>"+rptaWebservice[i].licenciaChofer+"</td>" +
				"<td align='center'>"+gastos+"</td>" +
                "<td align='center'>"+ultimaFechaGasto+"</td>" +
                "</tr>";
        }
        contentHTML+="</tbody></table>";
        nombreExcel="DEUDAS POR RECUPEROS DEL "+$("#fechaInicio").val();
        if($("#fechaFin").val()!=""){
            nombreExcel=nombreExcel+" AL "+$("#fechaFin").val();
        }
        if(generarExcelConJqueryYhtml(contentHTML, nombreExcel)){
            $.fancybox.close();
        }else{
            fancyAlert("¡¡ Ocurrio un problema al descarga el reporte. Por favor comuniquese con el soporte técnico !!")
        }
    }catch(err){
        emitirErrorCatch(err, "descargarReporteXperiodo")
    }
}
function cargarInfoEvento(){ // carga detalle del evento
    try{
        var idPanel="idPanelDetalle";
        if(validarCamposRequeridos(idPanel)){
            fancyAlertWait("Buscando Evento");
            var tipoBusqueda="codEvento";
            var parametros="&tipoBusqueda="+tipoBusqueda+"&codigo="+$("#codEvento").val();
            BuscarEventoGeneral(parametros, "reporteXevento()");
        }
    }catch(err){
        emitirErrorCatch(err, "cargarInfoEvento()")
    }
}
function reporteXevento() {
    try{
        if(rptaWebservice.length>0){
            eventoDetalle[0]=rptaWebservice[0];
            fancyAlertWait("Generando Reporte");
            var parametros="&codEvento="+$("#codEvento").val();
            webService2("getGastosByCodEvento", parametros, "decargarReporteDetalle()");
        }else{
            fancyAlertFunction("El codigo de evento no existe", function(estado){
                if(estado){
                    abrirFancyBox("700", "500", "busqueda", true);
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "reporteXevento");
    }
}
function decargarReporteDetalle(){
    try{
        var asociado=eventoDetalle[0].nombresAsociado+" "+eventoDetalle[0].apellidoPaternoAsociado+" "+eventoDetalle[0].apellidoMaternoAsociado;
        if(eventoDetalle[0].tipoAsociado=='J'){
            asociado=eventoDetalle[0].razonSocial;
        }

        var contenDETALLE_Evento="<table style='font-family: Arial;  font-size: 12px; background-color:#f5f5f5; width: 400px; '>" +
            "<tr style='height: 30px;'>"+
                "<td style='font-weight: bold; font-size: 14px; text-align: center; background-color: #0067a3; color: #ffffff;' colspan='5'>INFORMACIÓN DEL EVENTO</td>"+
            "</tr>"+
            "<tr style='height:25px; '>" +
                "<td style='font-weight: bold; font-size: 12px; text-align: right;'>COD EVENTO : </td>"+
                "<td style='text-align: left;'> "+eventoDetalle[0].codEvento+"</td>"+
                "<td style='font-weight: bold; font-size: 12px; text-align: right;'>DESCRIPCION : </td>"+
                "<td style='text-align: left;' colspan='2'> "+eventoDetalle[0].descripcionEvento+"</td>"+
            "</tr>"+
            "<tr style='height:25px; '>" +
                "<td style='font-weight: bold; font-size: 12px; text-align: right;' >FECHA : </td>"+
                "<td style='text-align: left;'>"+eventoDetalle[0].fechaAccidente+"</td>"+
                "<td style='font-weight: bold; font-size: 12px; text-align: right; width: 250px;' >LUGAR : </td>"+
                "<td style='text-align: left;' colspan='2'> ("+eventoDetalle[0].distritoAsociado+") "+eventoDetalle[0].lugarAccidente+"</td>"+
            "</tr>"+
			"<tr style='height:25px; '>" +
                "<td style='font-weight: bold; font-size: 12px; text-align: right;'>CAT : </td>"+
                "<td style='text-align: left; ' colspan='4'> "+eventoDetalle[0].placa+"</td>"+
            "</tr>"+
            "<tr style='height:25px; '>" +
                "<td style='font-weight: bold; font-size: 12px; text-align: right;' >ASOCIADO : </td>"+
                "<td style='text-align: left; ' colspan='4'> "+asociado+"</td>"+
            "</tr>"+
            "<tr style='height:25px; '>" +
                "<td style='font-weight: bold; font-size: 12px; text-align: right;' >DIRECCION : </td>"+
                "<td style='text-align: left; ' colspan='4'> "+eventoDetalle[0].direccionAsociado+"</td>"+
            "</tr>"+
			"<tr style='height:25px; '>" +
                "<td style='font-weight: bold; font-size: 12px; text-align: right;' >CONDUCTOR : </td>"+
                "<td style='text-align: left; ' colspan='4'> "+quitarEspaciosEnBlanco(eventoDetalle[0].nombresChofer)+" "+quitarEspaciosEnBlanco(eventoDetalle[0].apellidoPaternoChofer)+" "+quitarEspaciosEnBlanco(eventoDetalle[0].apellidoMaternoChofer)+"</td>"+
            "</tr>"+
			"<tr style='height:25px; '>" +
                "<td style='font-weight: bold; font-size: 12px; text-align: right;'>DNI : </td>"+
                "<td style='text-align: left;'> "+eventoDetalle[0].dniChofer+"</td>"+
                "<td style='font-weight: bold; font-size: 12px; text-align: right;'>LICENCIA : </td>"+
                "<td style='text-align: left;' colspan='2'> "+eventoDetalle[0].licenciaChofer+"</td>"+
            "</tr>"+			
            "</table>";
        var contentHTML="<table border='1' style='font-size: 14px; background-color:#f5f5f5; font-family: Arial;'>"+
            "<thead >" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>Nº GASTO</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>TIPO GASTO</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>FECHA</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>AGRAVIADO</strong></center>" +
            "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>MONTO(S/.)</strong></center>" +
            "</thead>"+
            "<tbody>";
        var totalGastos=0;
        if(rptaWebservice.length>0){
            for(var i=0; i<rptaWebservice.length; i++){
                contentHTML+="<tr style='height:30px; font-size:10px; font-family:Arial;'  >"+
                "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].numero+"</td>"+
                "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].tipoGasto+"</td>"+
                "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].fechaDoc+"</td>"+
                "<td style='vertical-align: middle;'>"+rptaWebservice[i].nombresAgraviado+"</td>"+
                "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].monto+"</td>"+
                "</tr>";
                totalGastos=totalGastos+parseFloat(rptaWebservice[i].monto);
            }
        }else{
            contentHTML+="<tr style='height:30px; font-size:10px; font-family:Arial;'  >"+
            "<td style='vertical-align: middle; text-align:center;' colspan='5'>No se encontraron gastos</td>"+
            "</tr>";
        }
        contentHTML+="<tr style='height:30px; font-size:10px; font-family:Arial;'  >"+
        "<td style='vertical-align: middle; text-align:right; font-size: 14px;' colspan='4'><STRONG>TOTAL</STRONG></td>"+
        "<td style='vertical-align: middle; text-align:right; font-size: 14px; text-align: center;'><strong>S/. "+totalGastos+"</strong></td>"+
        "</tr>";
        contentHTML+="</tbody></table>";
        var contenidoCompleto=contenDETALLE_Evento+"<br>"+contentHTML;

        nombreExcel="DETALLE DE LA DEUDA DEL EVENTO "+$("#codEvento").val();
        if(generarExcelConJqueryYhtml(contenidoCompleto, nombreExcel)){
            $.fancybox.close();
        }else{
            fancyAlert("¡¡ Ocurrio un problema al descarga el reporte. Por favor comuniquese con el soporte técnico !!")
        }
    }catch(err){
        emitirErrorCatch(err, "decargarReporteDetalle")
    }
}
function verificarFechaMayor(fechaMenor, fechaMayor) { // verifica que una fecha sea mayor a la otra
    try{
        var inicio=convertirFechaDD_MM_YYYY_A_DATE(fechaMenor);
        var fin=convertirFechaDD_MM_YYYY_A_DATE(fechaMayor);
        if(fin>inicio){
            return true;
        }else{
            return false;
        }
    }catch(err){
        emitirErrorCatch(err,"verificarFechaMayor()");
    }
}
function convertirFechaDD_MM_YYYY_A_DATE(fecha) { // convierte string de fecha con formato dia/mes/YYYY
    try{
        var fechaAconvertir=fecha.split("/");
        var dia=fechaAconvertir[0];
        var mes=parseInt(fechaAconvertir[1])-1;
        var año=fechaAconvertir[2];
        return new Date(año, mes, dia);
    }catch(err){
        emitirErrorCatch(err,"convertirFechaDD_MM_YYYY_A_DATE()");
    }
}