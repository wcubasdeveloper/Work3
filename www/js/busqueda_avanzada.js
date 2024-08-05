var text1="Debe seleccionar un tipo de busqueda";
var text2="¿Estas seguro en seleccionar este Evento?";
var datatableEventos;
var filaSeleccionada=undefined;
$(document).ready(function(){
	$("#inicio").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#fin").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("input[type='radio'][name='busqueda']").change(
		function(){
			var valorSeleccionado=$("input[type='radio'][name='busqueda']:checked").val(); // obtiene el valor del radio seleccionado
			$("#panel_busqueda").css("display", "block");
			if(valorSeleccionado=='F'){
				$("#buscar_x_codigo").css("display", "none");
				$("#buscar_x_fechas").css("display", "block");				

			}else{
				var nombreLabel; // nombre de label
				if(valorSeleccionado=="C"){
					nombreLabel="Nº CAT";
				}
				if(valorSeleccionado=="P"){
					nombreLabel="Placa";
				}
				$("#buscar_x_fechas").css("display", "none");
				$("#buscar_x_codigo").css("display", "block");
				$("#idLabel").html("<p class='Body-P'><span class='Body-C'>"+nombreLabel+"</span></p>");
			}
		}
	);

});
function BuscarEvento(){
	try{
		if($("input:checked").length>0){
			var campoValidar;
			var parametros;
			var valorSeleccionado=$("input[type='radio'][name='busqueda']:checked").val(); // valor seleccionado
			parametros="&tipoBusqueda="+valorSeleccionado;
			if(valorSeleccionado=="F"){ // si se selecciono por Fecha se debe validar que la fecha de inicio se haya completado
				campoValidar="inicio-Fecha de Inicio";
				parametros+="&fechaInicio="+dateTimeFormat($("#inicio").val())+
							"&fechaFin="+dateTimeFormat($("#fin").val());
			}else{ // El filtro no es x fecha, posiblemente sea solo por Nº CAT o por Placa, entonces se tiene que validar el campo de codigo de placa/cat
				parametros+="&codigo="+$("#codigo").val();
				var mensaje;
				if(valorSeleccionado=="C"){
					mensaje="Nº CAT";
				}
				if(valorSeleccionado=="P"){
					mensaje="Nº Placa";
				}
				campoValidar="codigo-"+mensaje;				
			}
			if(validarInputsValueXid(campoValidar)){ // verifica que se hayan llenado los campos requeridos
				fancyAlertWait("Buscando");
				webService("getEventosGenerales", parametros, "cargarTablaResultadoEventos()");
			}
		}else{
			fancyAlert(text1);
		}
	}catch(err){
		emitirErrorCatch(err, "BuscarEvento"); // emite error
	}
}
function cargarTablaResultadoEventos(){
	try{
		if(datatableEventos!=undefined){
            datatableEventos.destroy();
            $('#tabla_datos > tbody').html("");
        }
        for(var i=0; i<rptaWebservice.length; i++){
        	rptaWebservice[i].numcentral =rptaWebservice[i].codEvento;
        	var contrantante = quitarEspaciosBlanco(rptaWebservice[i].nombresAsociado+" "+rptaWebservice[i].apellidoPaternoAsociado+" "+rptaWebservice[i].apellidoMaternoAsociado);
            if(rptaWebservice[i].tipoAsociado=='J'){
            	contrantante=quitarEspaciosBlanco(rptaWebservice[i].razonSocial);
            }
            $("#tabla_datos > tbody").append("<tr style='height:30px; font-size:10px; font-family:Arial; cursor:pointer;' onclick='cargarEvento("+'"'+i+'", "'+rptaWebservice[i].numcentral+'"'+")' >"+
            	"<td id='td"+i+"_1' style='vertical-align: middle; '><center>"+rptaWebservice[i].numcentral+"</center></td>"+
            	"<td id='td"+i+"_2' style='vertical-align: middle;'><center>"+contrantante+"</center></td>"+
            	"<td id='td"+i+"_3' style='vertical-align: middle;'><center>"+quitarEspaciosBlanco(rptaWebservice[i].nombresChofer+" "+rptaWebservice[i].apellidoPaternoChofer+" "+rptaWebservice[i].apellidoMaternoChofer)+"</center></td>"+
            	"<td id='td"+i+"_4' style='vertical-align: middle;'><center>"+rptaWebservice[i].nroCAT+"</center></td>"+
            	"<td id='td"+i+"_5' style='vertical-align: middle;'><center>"+rptaWebservice[i].fechaAccidente+"</center></td>"+
            	"</tr>");
        }
        datatableEventos=$('#tabla_datos').DataTable({
	        "searching": true,
	        "paging": false,
	        "scrollY":"250px",
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
		        "infoFiltered": "(Filtrado de _MAX_ registros)"
		    },
		    //"order": [[ 1, "asc" ]],
		    "bSort": false,
		    "columns": [
		        { "width": "8%" },
		        { "width": "35%" },
		        { "width": "35%" },
		        { "width": "8%" },
		        { "width": "9%" }
		    ]
		});
        $("#oculta").css("display","none");
        $.fancybox.close();        
		console.log(rptaWebservice);
	}catch(err){
		emitirErrorCatch(err, "cargarTablaResultadoEventos"); // emite error
	}
}
function cargarEvento(id, numEvento){
	try{
		if(id!=filaSeleccionada){
            if(filaSeleccionada!=undefined){
                for(var i=1; i<=5; i++){
                    $("#td"+filaSeleccionada+"_"+i).css("background-color", "transparent");
                    $("#td"+filaSeleccionada+"_"+i).css("color", "black");
                }
            }   
            for(var i=1; i<=5; i++){
                $("#td"+id+"_"+i).css("background-color", "gray");
                $("#td"+id+"_"+i).css("color", "white");
            }
            filaSeleccionada=id;            
        }
        fancyConfirm(text2, function(rpta){
            	if(rpta){
            		parent.$("#oculta").css("display", "block");
            		parent.$("#idCodigo").val(numEvento);
            		parent.$.fancybox.close();
            	}
            });

	}catch(err){
		emitirErrorCatch(err, "cargarEvento"); // emite error
	}
}