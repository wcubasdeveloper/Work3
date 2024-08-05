$(document).ready(function(){
	cargarMensajeriaCumpleaños();
});
function cargarMensajeriaCumpleaños(){
    try{
        var fechaHoy=fechaFormateada((new Date()),false,true);
        $("#fechaInicio").val(fechaHoy);
        $("#fechaInicio").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});;
        $("#fechaFin").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});;

    }catch (err){
        var txt = "Se encontro un error en la funcion cargarMensajeriaCumpleaños\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function descargarReporteCumpleaños(){ // consulta al web service por los contratantes que cumplen años
    try{
        fancyAlertWait("Cargando informacion");
        nombreExcel="Cumpleaños";
        var parametros="&fechaInicio="+$("#fechaInicio").val();
        webService( "getCumpleaños", parametros, "cargarExcelCumpleaños()" );
    }catch (err){
        var txt = "Se encontro un error en la funcion descargarReporteCumpleaños\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function cargarExcelCumpleaños(){
    try{
        var contentHTML="<table style='font-size: 14px; font-family: Arial;'>"+
            "<thead>" +
            "<th><center><strong>Celular</strong></center>" +
            "<th><center><strong>Id Contratante</strong></center>" +
            "</thead>"+
            "<tbody>";
        if(rptaWebservice.length>0){
            for(var i=0; i<rptaWebservice.length; i++){
                // Busca celular
                telefonoAmostrar="";
                telef=reemplazarCaracter(rptaWebservice[i].phone1, "-", "");
                telef=telef.split("");
                if(telef.length>=9 && telef[0]=='9'){
                    telefonoAmostrar=rptaWebservice[i].phone1;
                }else{
                    telef=reemplazarCaracter(rptaWebservice[i].phone2, "-", "");
                    telef=telef.split("");
                    if(telef.length>=9 && telef[0]=='9'){
                        telefonoAmostrar=rptaWebservice[i].phone2;
                    }
                }
                if(telefonoAmostrar!=""){
                    contentHTML+="<tr style='font-size: 12px; '>" +
                    "<td align='left'>"+reemplazarCaracter(telefonoAmostrar, "-", "")+"</td>" +
                    "<td align='left'>"+rptaWebservice[i].id_Contratante+"</td>" +
                    "</tr>";
                }                    
            }
            contentHTML+="</tbody></table>";
            nombreExcel="Cumpleaños_"+$("#fechaInicio").val();
            if(generarExcelConJqueryYhtml(contentHTML, nombreExcel)){
            	fancyAlert("Reporte generado exitosamente!!");
            }else{
            	fancyAlert("Ocurrio un problema al descarga el excel. Por favor comuniquese con el soporte técnico")
            }
            
        }else{
            fancyAlert("NINGUNA PERSONA CUMPLE AÑOS EN ESTA FECHA");
        }

    }catch (err){
        var txt = "Se encontro un error en la funcion cargarExcelCumpleaños\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
