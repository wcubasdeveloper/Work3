var realizoTarea=false;
var rptaCallback;
var text1="Debe seleccionar un tipo de busqueda";
var text2="¿Estas seguro en seleccionar este Evento?";
var datatableEventos;
var filaSeleccionadaEvento=undefined;
var arrayEventosEncontrados=new Array();
$(document).ready(function(){
	$("#inicio").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#fin").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("input[type='radio'][name='busqueda']").change(
		function(){
			var valorSeleccionado=$("input[type='radio'][name='busqueda']:checked").val(); // obtiene el valor del radio seleccionado
			$("#panel_busqueda").css("display", "block");
			if(valorSeleccionado=='F'){
				$("#buscar_x_Agraviado").css("display", "none");
				$("#buscar_x_codigo").css("display", "none");
				$("#buscar_x_fechas").css("display", "block");
				$("#inicio").focus();
			}else if(valorSeleccionado=='A'){ // Agraviado
				$("#buscar_x_codigo").css("display", "none");
				$("#buscar_x_fechas").css("display", "none");
				$("#buscar_x_Agraviado").css("display", "block");
				$("#nombreAgraviado").focus();
			}else{
				var nombreLabel; // nombre de label
				if(valorSeleccionado=="C"){
					nombreLabel="Nº CAT";
				}
				if(valorSeleccionado=="P"){
					nombreLabel="Placa";
				}
				$("#buscar_x_Agraviado").css("display", "none");
				$("#buscar_x_fechas").css("display", "none");
				$("#buscar_x_codigo").css("display", "block");
				$("#idLabel").html("<p class='Body-P'><span class='Body-C'>"+nombreLabel+"</span></p>");
				$("#codigo").focus();
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
			}else if(valorSeleccionado=="A"){ // Agraviado
				if($("#nombreAgraviado").val().trim()=="" && $("#apellidoAgraviado").val().trim()=="" && $("#dniAgraviado").val().trim()==""){
					fancyAlertFunction("Debe ingresar al menos un dato del agraviado", function(rpta){
						if(rpta){
							$("#nombreAgraviado").focus();
						}
					}); 
					return;
				}else{
					parametros+="&nombreAgraviado="+$("#nombreAgraviado").val().trim()+
						"&apellidoAgraviado="+$("#apellidoAgraviado").val().trim()+
						"&dniAgraviado="+$("#dniAgraviado").val();						
				}
			}else{ // El filtro no es x fecha, posiblemente sea solo por Nº CAT o por Placa, entonces se tiene que validar el campo de codigo de placa/cat
				parametros+="&codigo="+$("#codigo").val();
				var mensaje;
				if(valorSeleccionado=="C"){
					mensaje="Nº CAT";
				}
				if(valorSeleccionado=="P"){
					mensaje="Nº Placa";
				}
                if(valorSeleccionado=="codEvento"){
                    mensaje="Cod. Evento";
                }
				campoValidar="codigo-"+mensaje;				
			}
			if(validarInputsValueXid(campoValidar) || valorSeleccionado=="A"){ // verifica que se hayan llenado los campos requeridos
				if($("#inicio").val()==$("#fin").val() && valorSeleccionado=='F'){
					fancyAlertFunction("La fecha de Inicio y Fin no pueden ser iguales", function(estado){
						if(estado){
							$("#inicio").focus();
						}
					});
				}else{
					fancyAlertWait("Buscando");
					//webService2("getEventosGenerales", parametros, "cargarTablaResultadoEventos()");
					BuscarEventoGeneral(parametros, "cargarTablaResultadoEventos()", 2)
				}
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
            $('#tabla_datos > thead').html("");
        }
        arrayEventosEncontrados.length=0; // reinicia el arreglo
        arrayEventosEncontrados=rptaWebservice;
        if($("input[type='radio'][name='busqueda']:checked").val()=='A'){ // Asociado
        	$('#tabla_datos > thead').html("<tr style='color:white; font-size:10px; font-family:Arial;'>"+
			    "<th style='background-color:#4485A6;'><center>COD. EVENTO<center></th>"+
			    "<th style='background-color:#4485A6;'><center>AGRAVIADO</center></th>"+
			    "<th style='background-color:#4485A6;'><center>PLACA</center></th>"+
			    "<th style='background-color:#4485A6;'><center>DESCRIPCION</center></th>"+
			    "<th style='background-color:#4485A6;'><center>FECHA</center></th>"+
			  "</tr>");	
        	for(var i=0; i<rptaWebservice.length; i++){
	        	//console.log(rptaWebservice[i].fechaAccidente+" i: "+i);
				var nombreAgraviado = rptaWebservice[i].nombres+' '+rptaWebservice[i].apellidoPaterno+' '+rptaWebservice[i].apellidoMaterno;
	            $("#tabla_datos > tbody").append("<tr title='LUGAR DEL ACCIDENTE: "+rptaWebservice[i].lugarAccidente+"' style='height:30px; font-size:10px; font-family:Arial; cursor:pointer;' onclick='seleccionarEvento("+'"'+i+'", "'+rptaWebservice[i].numcentral+'"'+")' >"+
	            	"<td id='td"+i+"_1' style='vertical-align: middle; '><center>"+rptaWebservice[i].codEvento+"</center></td>"+
	            	"<td id='td"+i+"_2' style='vertical-align: middle;'><center>"+nombreAgraviado+"</center></td>"+
	            	"<td id='td"+i+"_3' style='vertical-align: middle;'><center>"+rptaWebservice[i].placa+"</center></td>"+
	            	"<td id='td"+i+"_4' style='vertical-align: middle;'><center>"+rptaWebservice[i].descripcionEvento+"</center></td>"+
	            	"<td id='td"+i+"_5' style='vertical-align: middle; text-align:center;'>"+fechaFormateada(rptaWebservice[i].fechaAccidente)+"</td>"+
	            	"</tr>");
	        }
	        datatableEventos=$('#tabla_datos').DataTable({
		        "searching": true,
		        "paging": false,
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
			        "infoFiltered": "(Filtrado de _MAX_ registros)"
			    },
			    "order": [[ 4, "desc" ]],
			    //"bSort": false,
			    "columns": [
			        { "width": "8%" },
			        { "width": "36%" },
			        { "width": "8%" },
			        { "width": "40%" },
			        { "width": "10%", "type":"date-eu" }
			    ]
			});
			$('#tabla_datos').on("search.dt", function(){
	            borrarFilaEvento();
	        });
        }else{
        	$('#tabla_datos > thead').html("<tr style='color:white; font-size:10px; font-family:Arial;'>"+
			    "<th style='background-color:#4485A6;'><center>COD. EVENTO<center></th>"+
			    "<th style='background-color:#4485A6;'><center>ASEGURADO</center></th>"+
			    "<th style='background-color:#4485A6;'><center>CONDUCTOR</center></th>"+
			    "<th style='background-color:#4485A6;'><center>CAT</center></th>"+
			    "<th style='background-color:#4485A6;'><center>FECHA</center></th>"+
			  "</tr>");	
        	for(var i=0; i<rptaWebservice.length; i++){
	        	if(arrayEventosEncontrados[i].tipoAsociado=='J'){
	                arrayEventosEncontrados[i].nombreCompletoAsociado=rptaWebservice[i].razonSocial;
	            }else{
	                arrayEventosEncontrados[i].nombreCompletoAsociado=quitarEspaciosBlanco(rptaWebservice[i].nombresAsociado)+" "+quitarEspaciosBlanco(rptaWebservice[i].apellidoPaternoAsociado)+" "+quitarEspaciosBlanco(rptaWebservice[i].apellidoMaternoAsociado);
	            }
	            $("#tabla_datos > tbody").append("<tr style='height:30px; font-size:10px; font-family:Arial; cursor:pointer;' onclick='seleccionarEvento("+'"'+i+'", "'+rptaWebservice[i].numcentral+'"'+")' >"+
	            	"<td id='td"+i+"_1' style='vertical-align: middle; '><center>"+rptaWebservice[i].codEvento+"</center></td>"+
	            	"<td id='td"+i+"_2' style='vertical-align: middle;'><center>"+arrayEventosEncontrados[i].nombreCompletoAsociado+"</center></td>"+
	            	"<td id='td"+i+"_3' style='vertical-align: middle;'><center>"+quitarEspaciosBlanco(rptaWebservice[i].nombresChofer)+" "+quitarEspaciosBlanco(rptaWebservice[i].apellidoPaternoChofer)+" "+quitarEspaciosBlanco(rptaWebservice[i].apellidoMaternoChofer)+"</center></td>"+
	            	"<td id='td"+i+"_4' style='vertical-align: middle;'><center>"+rptaWebservice[i].nroCAT+"</center></td>"+
	            	"<td id='td"+i+"_5' style='vertical-align: middle; text-align:center;'>"+fechaFormateada(rptaWebservice[i].fechaAccidente)+"</td>"+
	            	"</tr>");
	        }
	        datatableEventos=$('#tabla_datos').DataTable({
		        "searching": true,
		        "paging": false,
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
			        "infoFiltered": "(Filtrado de _MAX_ registros)"
			    },
			    "order": [[ 4, "desc" ]],
			    //"bSort": false,
			    "columns": [
			        { "width": "8%" },
			        { "width": "35%" },
			        { "width": "35%" },
			        { "width": "8%" },
			        { "width": "9%", "type":"date-eu" }
			    ]
			});
			$('#tabla_datos').on("search.dt", function(){
	            borrarFilaEvento();
	        });
        }
        $("#oculta").css("display","none");
        $.fancybox.close();        
		console.log(rptaWebservice);
	}catch(err){
		emitirErrorCatch(err, "cargarTablaResultadoEventos"); // emite error
	}
}
function borrarFilaEvento(){
	try{
		if(filaSeleccionadaEvento!=undefined){
	        for(var i=1; i<=5; i++){
	            $("#td"+filaSeleccionadaEvento+"_"+i).css("background-color", "transparent");
	            $("#td"+filaSeleccionadaEvento+"_"+i).css("color", "black");
	        }
	        filaSeleccionadaEvento=undefined;
	    }
	}catch(err){
		emitirErrorCatch(err, "borrarFilaEvento"); // emite error
	}
}
function pintarNuevaFila(id){
	try{
		for(var i=1; i<=5; i++){
            $("#td"+id+"_"+i).css("background-color", "gray");
            $("#td"+id+"_"+i).css("color", "white");
        }
        filaSeleccionadaEvento=id; 
	}catch(err){
		emitirErrorCatch(err, "pintarNuevaFila"); // emite error
	}
}
function seleccionarEvento(id, numEvento){
	try{
		if(id!=filaSeleccionadaEvento){
            borrarFilaEvento();
            pintarNuevaFila(id);                       
        }
	}catch(err){
		emitirErrorCatch(err, "seleccionarEvento"); // emite error
	}
}
function cargarEvento(){
	try{		
		if(filaSeleccionadaEvento!=undefined){
			var arrayDelEvento=arrayEventosEncontrados[filaSeleccionadaEvento];
			var codigoEvento=arrayDelEvento.codEvento;
			realizoTarea=true;
			//fancyConfirm("Esta seguro que desea seleccionar el evento con codigo "+codigoEvento, function(estado){
			//	if(estado){
					// hace una simulacion como que si el sistema ha buscado el codigo en el web service y asigna valores a la variable rptawebservice
					//parent.$("#codEvento").val(codigoEvento);
					rptaCallback=[{
						codEvento:codigoEvento,
						estado:arrayDelEvento.estado,
                        condonado:arrayDelEvento.condonado,
						fechaAccidente:arrayDelEvento.fechaAccidente,
						lugarAccidente:arrayDelEvento.lugarAccidente,
						nroCAT:arrayDelEvento.nroCAT,
						placa:arrayDelEvento.placa,
						idPersonaAsociado:arrayDelEvento.idPersonaAsociado,
						nombresAsociado:arrayDelEvento.nombresAsociado,
						apellidoPaternoAsociado:arrayDelEvento.apellidoPaternoAsociado,
						apellidoMaternoAsociado:arrayDelEvento.apellidoMaternoAsociado,
						tipoAsociado:arrayDelEvento.tipoAsociado,
						razonSocial:arrayDelEvento.razonSocial,
						calleAsociado:arrayDelEvento.calleAsociado,
						distritoAsociado:arrayDelEvento.distritoAsociado,
                        telefonoFijoAsociado:arrayDelEvento.telefonoFijoAsociado,
                        celularAsociado:arrayDelEvento.celularAsociado,
                        idPersonaPropietario:arrayDelEvento.idPersonaPropietario,
						nombresPropietario:arrayDelEvento.nombresPropietario,
						apellidoPaternoPropietario:arrayDelEvento.apellidoPaternoPropietario,
						apellidoMaternoPropietario:arrayDelEvento.apellidoMaternoPropietario,
						tipoPropietario:arrayDelEvento.tipoPropietario,
						razonPropietario:arrayDelEvento.razonPropietario,
						callePropietario:arrayDelEvento.callePropietario,
						distritoPropietario:arrayDelEvento.distritoPropietario,
                        telefonoFijoPropietario:arrayDelEvento.telefonoFijoPropietario,
                        celularPropietario:arrayDelEvento.celularPropietario,
                        idPersonaChofer:arrayDelEvento.idPersonaChofer,
						nombresChofer:arrayDelEvento.nombresChofer,
						apellidoPaternoChofer:arrayDelEvento.apellidoPaternoChofer,
						apellidoMaternoChofer:arrayDelEvento.apellidoMaternoChofer,
						dniChofer:arrayDelEvento.dniChofer,						
						calleChofer:arrayDelEvento.calleChofer,
						distritoChofer:arrayDelEvento.distritoChofer,
                        telefonoFijoChofer:arrayDelEvento.telefonoFijoChofer,
                        celularChofer:arrayDelEvento.celularChofer,
                        causal1:arrayDelEvento.causal1,
						causal2:arrayDelEvento.causal2,
						distritoEvento:arrayDelEvento.distritoEvento, // nuevo datos Asociado
						nroDocAsociado:arrayDelEvento.nroDocAsociado,
                		nroAsociado:arrayDelEvento.nroAsociado,
		                mzloteAsociado:arrayDelEvento.mzloteAsociado,
		                sectorAsociado:arrayDelEvento.sectorAsociado,
		                referenciaAsociado:arrayDelEvento.referenciaAsociado,
		                idDistritoAsociado:arrayDelEvento.idDistritoAsociado,
		                idProvinciaAsociado:arrayDelEvento.idProvinciaAsociado, // Nuevos datos Propietario
		                nroDocPropietario:arrayDelEvento.nroDocPropietario,
                		nroPropietario:arrayDelEvento.nroPropietario,
		                mzlotePropietario:arrayDelEvento.mzlotePropietario,
		                sectorPropietario:arrayDelEvento.sectorPropietario,
		                referenciaPropietario:arrayDelEvento.referenciaPropietario,
		                idDistritoPropietario:arrayDelEvento.idDistritoPropietario,
		                idProvinciaPropietario:arrayDelEvento.idProvinciaPropietario, // Nuevos datos chofer
		                dniChofer:arrayDelEvento.dniChofer,
                		nroChofer:arrayDelEvento.nroChofer,
		                mzloteChofer:arrayDelEvento.mzloteChofer,
		                sectorChofer:arrayDelEvento.sectorChofer,
		                referenciaChofer:arrayDelEvento.referenciaChofer,
		                idDistritoChofer:arrayDelEvento.idDistritoChofer,
		                idProvinciaChofer:arrayDelEvento.idProvinciaChofer,
		                idAgraviado:arrayDelEvento.idAgraviado, // DATOS SOLO DEL AGRAVIADO, SI es que LO HUBIERA
		                idPersona:arrayDelEvento.idPersona, // id Persona del agraviado
		                nombres:arrayDelEvento.nombres, // nombres del agraviado
		                apellidoPaterno:arrayDelEvento.apellidoPaterno, // Apellido paterno del agraviado
		                apellidoMaterno:arrayDelEvento.apellidoMaterno // Apellido Materno del agraviado
					}];					
					parent.$.fancybox.close();
					//parent.cargarInfoEvento();
		//		}
		//	});
		}else{
			fancyAlert("Por favor seleccione un evento");
		}
	}catch(err){
		emitirErrorCatch(err, "cargarEvento"); // emite error
	}
}