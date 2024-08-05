cargarInicio(function(){
    $("#fechaInicio").datetimepicker({lan:'es', formatDate:'d/m/Y', format:'d/m/Y', maxDate:0, timepicker:false, closeOnDateSelect:true});
    $("#fechaFin").datetimepicker({lan:'es', formatDate:'d/m/Y', format:'d/m/Y', maxDate:0, timepicker:false, closeOnDateSelect:true});
	$("#ReporteXperiodo").click(reporteXperiodo)
});
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
            consultarWebServiceGet("getAgraviadosXrecupero", parametros, descargarReporteXperiodo);
        }
    }catch(err){
        emitirErrorCatch(err,"reporteXperiodo")
    }
}

/*@descargarReporteXperiodo: Emite un reporte Excel de los gastos de los eventos por periodo.
*/
function descargarReporteXperiodo(data){
	var codEventoActual; // sirve como flag para saber si se debe escribir una fila de evento
	var contentHTML="<table border='1' style='font-size: 14px; font-family: Arial; background-color:#f5f5f5;'>"+
        "<thead>" +
        "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>FECHA ACCIDENTE</strong></center>" +
        "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>N° CAT</strong></center>" +
        "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>EVENTO</strong></center>" +
        "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>SINIESTRO</strong></center>" +
        "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>ASOCIADO</strong></center>" +
        "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>DEUDOR</strong></center>" +
        "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>ACCIDENTADO</strong></center>" +
        "<th style='background-color: #0067a3; color: #ffffff;'><center><strong>CAUSAL</strong></center>" +
		"<th style='background-color: #0067a3; color: #ffffff;'><center><strong>TIPO SINIESTRO</strong></center>" +
		"<th style='background-color: #0067a3; color: #ffffff;'><center><strong>IMPORTE</strong></center>" +
        "</thead>"+
        "<tbody>";	
	for(var i=0; i<data.length; i++){
		// encuentra 
		if(i==0){
			contentHTML = escribirFilaEvento(data[i], contentHTML);
			contentHTML = escribirFilaAgraviado(data[i], contentHTML);			
		}else{
			if(verificarNuevoEvento(data[i].codEvento, codEventoActual)){
				contentHTML = escribirFilaEvento(data[i], contentHTML); // escribir la fila del evento
			}
			contentHTML = escribirFilaAgraviado(data[i], contentHTML);	
		}
		codEventoActual = data[i].codEvento;
	}
	contentHTML+="</tbody></table>";
    var nombreExcel="RECUPEROS EN TRANSACCION DEL "+$("#fechaInicio").val();
    if($("#fechaFin").val()!=""){
        nombreExcel=nombreExcel+" AL "+$("#fechaFin").val();
    }
    if(generarExcelConJqueryYhtml(contentHTML, nombreExcel)){
        $.fancybox.close();
    }else{
        fancyAlert("¡¡ Ocurrio un problema al descarga el reporte. Por favor comuniquese con el soporte técnico !!")
    }
}
function escribirFilaEvento(data, contentHTML){
	try{
		// encuentra el responsable deudor
			data.nombreDeudor='';
			if(data.idPersonaResponsableFinal>0){ // existe un responsable final
				data.nombreDeudor = data.nombreRespFinal;
			}else{
				if(data.idPersonaResponsable1>0){
					data.nombreDeudor = data.nombreResponsable1;
				}
				else if(data.idPersonaResponsable2>0){
					data.nombreDeudor = data.nombreResponsable2;
				}
				else if(data.idPersonaResponsable3>0){
					data.nombreDeudor = data.nombreResponsable3;
				}
			}
		// encuentra la causal final
			data.causalFinal="";
			if(data.causal1!=null){
				data.causalFinal=data.causal1;
			}
			else if(data.causal2!=null){
				data.causalFinal=data.causal2;
			}
			
		contentHTML+="<tr style='font-size: 12px; '>" +
            "<td align='center'>"+data.fechaAccidente+"</td>" +
            "<td align='center'>"+data.nroCAT+"</td>" +
            "<td align='center'>"+data.codEvento+"</td>" +
            "<td align='left'></td>" +
            "<td align='left'>"+data.nombreAsociado+"</td>" +
            "<td align='left'>"+data.nombreDeudor+"</td>" +
            "<td align='left'></td>" +
            "<td align='left'>"+data.causalFinal+"</td>" +
			"<td align='left'></td>" +
			"<td align='left'></td>" +
            "</tr>";		
		return contentHTML;
	}catch(err){
		emitirErrorCatch(err, "escribirFilaEvento");
	}
}
function verificarNuevoEvento(actual, previo){
	try{
		if(actual!=previo){
			return true;
		}
		return false;
	}catch(err){
		emitirErrorCatch(err, "verificarNuevoEvento")
	}
}
function escribirFilaAgraviado(data, contentHTML){
	try{
		if(data.importe==null){
			data.importe=0;
		}
		data.importe="S/. "+number_format(data.importe, 2, '.', ',');
		
		contentHTML+="<tr style='font-size: 12px; '>" +
            "<td align='center'></td>" +
            "<td align='center'></td>" +
            "<td align='center'></td>" +
            "<td align='center'>"+data.codAgraviado+"</td>" +
            "<td align='left'></td>" +
            "<td align='left'></td>" +
            "<td align='left'>"+data.nombreAgraviado+"</td>" +
            "<td align='left'></td>" +
			"<td align='center'>"+data.tipoAccidente+"</td>" +
			"<td align='center'>"+data.importe+"</td>" +
            "</tr>";		
		return contentHTML;		
	}catch(err){
		emitirErrorCatch(err, "escribirFilaAgraviado")
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
function number_format(number, decimals, dec_point, thousands_sep) {
  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
};