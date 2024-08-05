$(document).ready(function(){
    // coloca el plugin de datepicker
    fancyAlertWait("cargando");
    $("#fechaImpresion").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaImpresion").val(fechaFormateada((new Date()), false, true));
    $.fancybox.close();
});
var datable;
function getNotificacionEvento(){
    try{
        inputsXvalidar="idCodigo-Codigo de Evento";
        if(validarInputsValueXid(inputsXvalidar)){
            if($("input:checked").length>0){
                fancyAlertWait("cargando");
                var parametros="&codigo="+$("#idCodigo").val()+
                "&tipoBusqueda="+$("input[type='radio'][name='busqueda']:checked").val();
                webService("getNotificacionEvento", parametros, "cargarTablaEventos()");
            }else{
                fancyAlert("Debe seleccionar al menos una opción de busqueda");
            }            
        }
    }catch (err){
        var txt = "Se encontro un error en la funcion  getNotificacionEvento.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }   
}
function cargarTablaEventos(){
    try{
    	filaSeleccionada=undefined;
        $("#oculta").css("display", "block");
        if(datable!=undefined){
            datable.destroy();
            $("#tablaNotificaciones > tbody").html("");
        }
        for(var i=0; i<rptaWebservice.length; i++){
        	arrayActual=rptaWebservice[i];
            $("#tablaNotificaciones > tbody").append("<tr id='tabla"+i+"' title='Click para descargar' onClick='openNotificacionPDF(arrayActual, this.id)' style='font-size: 11px; font-weight: bold; background-color: #afcaff; height: 40px; cursor:pointer;'>" +
                "<td id='tabla"+i+"_1'>"+rptaWebservice[i].numcentral+"</td>"+
                "<td id='tabla"+i+"_2'>"+rptaWebservice[i].Contratante+"</td>"+
                "<td id='tabla"+i+"_3'>"+rptaWebservice[i].placa+"</td>"+
                "<td id='tabla"+i+"_4'>"+rptaWebservice[i].cat+"</td>"+
                "<td id='tabla"+i+"_5'>"+fechaFormateada(rptaWebservice[i].fechaevento, false, false)+"</td>"+
                "</tr>");
        }
        datable= $('#tablaNotificaciones').DataTable({
            "scrollY":"200px",
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
                { "width": "15%" },
                { "width": "30%" },
                { "width": "15%" },
                { "width": "15%" },
                { "width": "25%" }
            ],
            paging:false,
            searching:false
        });
        $.fancybox.close();
        $("#oculta").css("display", "none");

    }catch (err){
        var txt = "Se encontro un error en la funcion  cargarTablaEventos.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
var filaSeleccionada=undefined;
function openNotificacionPDF(arrayActual, id){
    try{  
        if($("#fechaImpresion").val()!=""){
            var contentHTML="<table border='0' style='font-size: 14px; font-family: Arial;'>"+
            "<thead style='background-color: #38C55B;'>" +
            "<th><center><strong>numcentral</strong></center>" +
            "<th><center><strong>destinatario</strong></center>" +
            "<th><center><strong>cc1</strong></center>" +
            "<th><center><strong>cc2</strong></center>" +
            "<th><center><strong>direccion</strong></center>" +
            "<th><center><strong>distrito</strong></center>" +
            "<th><center><strong>placa</strong></center>" +
            "<th><center><strong>cat</strong></center>" +
            "<th><center><strong>fechaevento</strong></center>" +
            "<th><center><strong>Horaevento</strong></center>" +
            "<th><center><strong>fechaenvio</strong></center>" +
            "<th><center><strong>gastos</strong></center>" +
            "<th><center><strong>lugarsiniestro</strong></center>" +
            "<th><center><strong>nombrechofer</strong></center>" +
            "<th><center><strong>dnichofer</strong></center>" +
            "</thead>"+
            "<tbody>";
            if(id!=filaSeleccionada){
                if(filaSeleccionada!=undefined){
                    for(var i=1; i<=5; i++){
                        $("#"+filaSeleccionada+"_"+i).css("background-color", "transparent");
                        $("#"+id+"_"+i).css("color", "black");
                    }
                }   
                for(var i=1; i<=5; i++){
                    $("#"+id+"_"+i).css("background-color", "gray");
                    $("#"+id+"_"+i).css("color", "white");
                }
                filaSeleccionada=id;
            }
            var arraymeses=["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];            
            var fechaEmision=$("#fechaImpresion").val().split("/");
            fechaEmision="Lima "+fechaEmision[0]+" de "+arraymeses[parseInt(fechaEmision[1])-1]+" del "+fechaEmision[2];
            var codigo=arrayActual.numcentral;            
            var placa=arrayActual.placa;
            var lugarsiniestro=arrayActual.lugarsiniestro;
            var nombrechofer=arrayActual.nombrechofer;
            var dnichofer = arrayActual.dnichofer;
            var fechaevento=fechaFormateada(arrayActual.fechaevento, true, false);
            var fechaAccidente=fechaevento.split(" ")[0];
            var horasAccidente=fechaevento.split(" ")[1];
            var nroCAT=arrayActual.cat;
            var cantDePersonas=0;
            var arrayClientes= new Array();
            if(arrayActual.nombreasociado!=""){
                arrayClientes[arrayClientes.length]={
                    destinatario:arrayActual.nombreasociado,
                    direccion: arrayActual.direccionasociado,
                    distrito: arrayActual.asigdistritoasociado
                }
            }
            if(arrayActual.nombreasociado!=arrayActual.nombrepropietario && arrayActual.nombrepropietario!=""){ // diferentes               
                cantDePersonas++;
                arrayClientes[arrayClientes.length]={
                    destinatario:arrayActual.nombrepropietario,
                    direccion: arrayActual.direccionpropietario,
                    distrito:arrayActual.asigdistritopropietario
                }
            }            
            if(arrayActual.nombrepropietario!=arrayActual.nombrechofer && arrayActual.nombreasociado!=arrayActual.nombrechofer  && arrayActual.nombrepropietario!="" && arrayActual.nombrechofer!=""){
                cantDePersonas++;
                arrayClientes[arrayClientes.length]={
                    destinatario:arrayActual.nombrechofer,
                    direccion: arrayActual.direccionchofer,
                    distrito: arrayActual.asigdistritochofer
                }
            }            
            for(var i=0; i<=cantDePersonas; i++){
                
            }
                //var indiceActual=i;
                var nombres= arrayClientes[i].destinatario;
                var domicilio=arrayClientes[i].direccion;
                var distrito=arrayClientes[i].distrito;
                var nombres2="";
                var nombres3="";
                //if(cantDePersonas>0){
                //}               
                cont=0;
                for (var y=0; y<=cantDePersonas; y++){
                    if(y!=i){
                        cont++;
                        if(cont==1){
                            nombres2 = arrayClientes[y].destinatario;
                        }else{
                            nombres3 = arrayClientes[y].destinatario;
                        }
                    }
                }
                contentHTML+="<tr style='font-size: 12px; '>" +
                "<td align='left'>"+codigo+"</td>" +
                "<td align='left'>"+nombres+"</td>" +
                "<td align='left'>"+nombres2+"</td>" +
                "<td align='left'>"+nombres3+"</td>" +
                "<td align='left'>"+domicilio+"</td>" +
                "<td align='left'>"+distrito+"</td>" +
                "<td align='left'>"+placa+"</td>" +
                "<td align='left'>"+nroCAT+"</td>" +
                "<td align='left'>"+fechaAccidente+"</td>" +
                "<td align='left'>"+horasAccidente+"</td>" +
                "<td align='left'>"+fechaEmision+"</td>" +
                "<td align='left'></td>" +
                "<td align='left'>"+lugarsiniestro+"</td>" +
                "<td align='left'>"+nombrechofer+"</td>" +
                "<td align='left'>"+dnichofer+"</td>" +
                "</tr>";
                //window.open("reportePDF/pdf/eventoPDF.php?num="+codigo
                  //  +"&nombre="+nombres+ // nombre del destinatario
                  //  "&dir="+domicilio+ // direccion del destinatario
                  //  "&nombre2="+nombres2+
                  //  "&nombre3="+nombres3+
                  //  "&placa="+placa+
                  //  "&fechaAccidente="+fechaAccidente+
                  //  "&fechaImpresion="+$("#fechaImpresion").val()+
                  //  "&cat="+nroCAT,'_blank');
                //$.fancybox.close();                
            }
            contentHTML+="</tbody></table>";
            var nombreExcel="notificaciones";
            generarExcelConJqueryYhtml(contentHTML, nombreExcel);
            $.fancybox.close();
        }else{
            fancyAlert("Seleccione primero la fecha");
        }
        
    }catch (err){
        var txt = "Se encontro un error en la funcion  openNotificacionPDF.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }   
}