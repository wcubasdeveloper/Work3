// variables de texto:
var seleccioneFecha = "Seleccione primero la fecha";
///
$(document).ready(function(){
    // coloca el plugin de datepicker
    fancyAlertWait("cargando");
    $("#fechaImpresion").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});;
    $("#fechaImpresion").val(fechaFormateada((new Date()), false, true));
    if(codEventoSeleccionado!=""){
		$('#idCodigo').val(codEventoSeleccionado);
	}
	$.fancybox.close();
});
var datable;
function getLiquidacion(){
    try{
        inputsXvalidar="idCodigo-Codigo de Evento";
        if(validarInputsValueXid(inputsXvalidar)){
            //if($("input:checked").length>0){
                fancyAlertWait("cargando");
                var parametros="&codigo="+$("#idCodigo").val()+
                "&tipoBusqueda="+$("input[type='radio'][name='busqueda']:checked").val();
                webService("getLiquidacion", parametros, "cargarTablaLiquidaciones()");
            //}else{
              //  fancyAlert("Debe seleccionar al menos una opción de busqueda");
            //}            
        }
    }catch (err){
        var txt = "Se encontro un error en la funcion  getNotificacionEvento.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }   
}
function cargarTablaLiquidaciones(){
	try{
		filaSeleccionada=undefined;
        $("#oculta").css("display", "block");
        if(datable!=undefined){
            datable.destroy();
            $("#tablaLiquidaciones > tbody").html("");
        }
        for(var i=0; i<rptaWebservice.length; i++){
			
        	array=rptaWebservice[i];
            if(rptaWebservice[i].Total==null){
				rptaWebservice[i].Total=0;
			}
			$("#tablaLiquidaciones > tbody").append("<tr id='tabla"+i+"' title='Click para descargar' onClick='openLiquidacionPDF("+'"'+rptaWebservice[i].numcentral+'", "'+rptaWebservice[i].numsiniestro+'", "'+rptaWebservice[i].fechasiniestro+'", "'+rptaWebservice[i].cat+'", "'+rptaWebservice[i].placa+'", "'+rptaWebservice[i].nombre+'", "'+rptaWebservice[i].nombreasegurado+'"'+", this.id)' style='font-size: 11px; font-weight: bold; background-color: #afcaff; height: 40px; cursor:pointer;'>" +
                "<td id='tabla"+i+"_1'><center>"+rptaWebservice[i].numcentral+"</center></td>"+
                "<td id='tabla"+i+"_2'><center>"+rptaWebservice[i].numsiniestro+"</center></td>"+
                "<td id='tabla"+i+"_3'><center>"+rptaWebservice[i].fechaevento+"</center></td>"+
                "<td id='tabla"+i+"_4'><center>"+rptaWebservice[i].nombre+"</center></td>"+
                "<td id='tabla"+i+"_5'><center>"+rptaWebservice[i].Total+"</center></td>"+
                "<td id='tabla"+i+"_6'><center>"+rptaWebservice[i].fechasiniestro+"</center></td>"+
                "</tr>");
        }
        datable= $('#tablaLiquidaciones').DataTable({
            "scrollY":"205px",
            "pagingType": "simple",
            "info":     false,
            "lengthChange": false,
            "scrollCollapse": false,
            "language": {
                "search": "Buscar:",
                "lengthMenu": "Visualizar _MENU_ por pag.",
                "zeroRecords": "Ningun Resultado - Lo Sentimos :(",
                "info": "Pag _PAGE_ de _PAGES_",
                "infoEmpty": "No Disponible",
                "infoFiltered": "(Filtrado de _MAX_ registros)",
                "paginate": {
                    "next": "Siguiente",
                    "previous": "Anterior"
                }
            },
            "columns": [
                { "width": "12%" },
                { "width": "12%" },
                { "width": "12%" },
                { "width": "34	%" },
                { "width": "15%" },
                { "width": "15%" }
            ],
            paging:false,
            searching:false
        });
        $.fancybox.close();
        $("#oculta").css("display", "none");

	}catch (err){
		var txt = "Se encontro un error en la funcion cargarTablaLiquidaciones.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
       	fancyAlert(txt);
	}
}
function openLiquidacionPDF(numcentral, numsiniestro, fechasiniestro, cat, placa, nombre, nombreasegurado,  id){
	try{
		if($("#fechaImpresion").val()!=""){
			fancyAlertWait("Cargando");
			if(id!=filaSeleccionada){
                if(filaSeleccionada!=undefined){
                    for(var i=1; i<=6; i++){
                        $("#"+filaSeleccionada+"_"+i).css("background-color", "transparent");
                        $("#"+filaSeleccionada+"_"+i).css("color", "black");
                    }
                }   
                for(var i=1; i<=6; i++){
                    $("#"+id+"_"+i).css("background-color", "gray");
                    $("#"+id+"_"+i).css("color", "white");
                }
                filaSeleccionada=id;
            }
            var parametros="&nombre="+nombre+
            "&numcentral="+numcentral+
            "&numsiniestro="+numsiniestro+
            "&fechasiniestro="+fechasiniestro+
            "&cat="+cat+
            "&placa="+placa+
            "&fechaImpresion="+$("#fechaImpresion").val()+
            "&nombreUsuario="+parent.nombreUsuario+
            "&nombreasegurado="+nombreasegurado;
            window.open("webservice?funcion=liquidacionPDF"+parametros,'_blank');
            $.fancybox.close();
		}else{
			fancyAlert(seleccioneFecha);
		}
	}catch (err){
		var txt = "Se encontro un error en la funcion openLiquidacionPDF.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
	}
}
