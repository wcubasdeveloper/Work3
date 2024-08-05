var realizoTarea=false;
var rptaCallback;
var arrayExpedientesEncontrados=new Array();
var datatable;
cargarInicio(function(){
	$("#idBtnSeleccionar").click(seleccionarExpediente)
	$("#inicio").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#fin").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("input[type='radio'][name='busqueda']").change(
		function(){
			var valorSeleccionado=$("input[type='radio'][name='busqueda']:checked").val(); // obtiene el valor del radio seleccionado
			$("#panel_busqueda").css("display", "block");
			if(valorSeleccionado=='F'){
				$("#buscar_x_codigo").css("display", "none");
				$("#buscar_x_fechas").css("display", "block");
				$("#inicio").focus();				

			}else{
				var nombreLabel; // nombre de label
				if(valorSeleccionado=="C"){
					nombreLabel="Nº CAT";
				}
				if(valorSeleccionado=="D"){
					nombreLabel="DNI Solicitante";
				}
				if(valorSeleccionado=="P"){
					nombreLabel="Placa";
				}
				if(valorSeleccionado=="AS"){
					nombreLabel="Nombres Asociado";
				}
				if(valorSeleccionado=="AG"){
					nombreLabel="Nombres Agraviado";
				}
				$("#buscar_x_fechas").css("display", "none");
				$("#buscar_x_codigo").css("display", "block");
				$("#idLabel").html("<p class='Body-P'><span class='Body-C'>"+nombreLabel+"</span></p>");
				$("#codigo").focus();
			}
		}
	);
})

/*@BuscarExpediente: Busca los expediente por NRO CAT, DNI TRAMITADOR, PLACA, Nombre agraviado o Asociado.
*/
function BuscarExpediente(){
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
				if(valorSeleccionado=="D"){
					mensaje="DNI Tramitador";
				}
				if(valorSeleccionado=="P"){
					mensaje="Placa";
				}
				if(valorSeleccionado=="AS"){
					mensaje="Asociado";
				}
				if(valorSeleccionado=="AG"){
					mensaje="Agraviado";
				}                
				campoValidar="codigo-"+mensaje;				
			}
			var soloPrevios=getUrlVars()["soloPrevios"];
			if(soloPrevios=='T'){
				parametros=parametros+"&soloPrevios="+soloPrevios; // Filtra solo Previos y devueltos
				parametros=parametros+"&estados_a_Buscar="+getUrlVars()["estados_a_Buscar"];
			} 
			if(validarInputsValueXid(campoValidar)){ // verifica que se hayan llenado los campos requeridos
				if($("#inicio").val()==$("#fin").val() && valorSeleccionado=='F'){
					fancyAlertFunction("La fecha de Inicio y Fin no pueden ser iguales", function(estado){
						if(estado){
							$("#inicio").focus();
						}
					});
				}else{
					consultarWebServiceGet("getExpedientes", parametros, function(data){
						if(datatable!=undefined){
				            datatable.destroy();
				            $('#tabla_datos > tbody').html("");
				        }
				        arrayExpedientesEncontrados.length=0; // reinicia el arreglo
				        for(var i=0; i<data.length; i++){
				        	if(data[i].tipoPersona=='J'){
				                data[i].nombreCompletoAsociado=quitarEspaciosBlanco(data[i].razonSocial);
				            }else{
				                data[i].nombreCompletoAsociado=quitarEspaciosBlanco(data[i].nombreAsociado);
				            }
				            $("#tabla_datos > tbody").append("<tr id='tr_"+i+"' style='height:30px; font-size:10px; font-family:Arial; cursor:pointer;' onclick='seleccionarFila("+'"'+i+'"'+")' >"+
				            	"<td style='vertical-align: middle; text-align:center;'>"+LPAD(data[i].idExpediente, numeroLPAD)+"</td>"+
				            	"<td style='vertical-align: middle;'>"+data[i].personaQpresenta+"</td>"+
				            	"<td style='vertical-align: middle; text-align:center;'>"+quitarEspaciosBlanco(data[i].nroCAT+"")+"</td>"+
				            	"<td style='vertical-align: middle;'>"+data[i].nombreCompletoAsociado+"</td>"+
				            	"<td style='vertical-align: middle; text-align:center;'>"+data[i].fechaExpediente+"</td>"+
				            	"</tr>");
				        }
   				        arrayExpedientesEncontrados=data; // Guarda info
   				        //borrarFilaSeleccionada();
				        datatable=$('#tabla_datos').DataTable({
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
						        { "width": "8%" },
						        { "width": "35%" },
						        { "width": "9%", "type":"date-eu" }
						    ]
						});
						$('#tabla_datos').on("search.dt", function(){
				            borrarFilaSeleccionada();
				        });
				        $("#oculta").css("display","none");
				        $.fancybox.close();
					})
				}
			}
		}else{
			fancyAlert("Debe seleccionar un tipo de busqueda");
		}
	}catch(err){
		emitirErrorCatch("err", "BuscarExpediente")
	}
}
function seleccionarExpediente(){
	try{
		if(filaSeleccionada!=undefined){
			var expediente=arrayExpedientesEncontrados[filaSeleccionada];
			realizoTarea=true;
			rptaCallback=[{
				idExpediente:expediente.idExpediente,
				tipoExpediente:expediente.tipoExpediente,
				estado:expediente.estado,
				fechaExpediente:expediente.fechaExpediente,
				diasRespuesta:expediente.diasRespuesta,
				codAgraviado:expediente.codAgraviado,
				nroFolios:expediente.nroFolios,
				nroDocReferencia:expediente.nroDocReferencia,
				Observaciones:expediente.Observaciones,
				idExpedientePrevio:expediente.idExpedientePrevio,
				personaQpresenta:expediente.personaQpresenta,
				nroDocumento:expediente.nroDocumento,
				telefonoMovil:expediente.telefonoMovil,
				direccion:expediente.direccion,
				codEvento:expediente.codEvento,
				nroCAT:expediente.nroCAT,
				placa:expediente.placa,
				fechaAccidente:expediente.fechaAccidente,
				nombreAsociado:expediente.nombreAsociado,
				tipoPersona:expediente.tipoPersona,
				razonSocial:expediente.razonSocial,
				nombresAgraviado:expediente.nombresAgraviado,
				nombresTramitador:expediente.nombresTramitador,
				apellidosTramitador:expediente.apellidosTramitador,
				idPersonaTramitador:expediente.idPersonaTramitador,
				email:expediente.email
			}];
			parent.$.fancybox.close();
		}else{
			fancyAlert("Debe seleccionar un Expediente");
		}
	}catch(err){
		emitirErrorCatch(err, "seleccionarExpediente")
	}
}