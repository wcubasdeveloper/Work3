var DAO = new DAOWebServiceGeT("webservice");
var codigoEvento;
var temp_Destinatarios = new Array();
cargarInicio(function(){	
    cargarPanelBusqueda();
	if(codEventoSeleccionado!=""){
		$('input[name=busqueda][value=codEvento]').attr("checked", "checked");
		$('input[name=busqueda][value=codEvento]').change();
		$('#codigo').val(codEventoSeleccionado);
	}
})
var notificacionSeleccionada;
function abrirEdicionNotificacion(id){
	try{		
		 
		 var inputCheck = $(id).parent().parent().find("td").eq(0).find("input");
		 var isChecked = $(inputCheck).prop("checked");
		 if(isChecked){
			notificacionSeleccionada=id; // guarda el boton donde se hizo click
			abrirVentanaFancyBox(700, 523, "editar_notificacion", true, function(data){ // devuelve el contenido editado
				var inputCheck = $(notificacionSeleccionada).parent().parent().find("td").eq(0).find("input"); // obtiene el checkbox de responsable que se ha seleccionado para editar la notificacion
				// Guarda localmente el contenido de la notificacion:
				$(inputCheck).attr("notificacion", data[0]);
			 });
		 }else{
			fancyAlert("¡Debe marca la casilla, antes de editar la Notificacion del responsable!")
		 }
		 
	}catch(err){
		emitirErrorCatch(err, "abrirEdicionNotificacion");
	}
}

/* @cargarTablaDestinatarios: Carga la lista de Responsables con un checkbox para que se les pueda seleccionar.
*/
function cargarTablaDestinatarios () {
	try{
		 borrarFilaSeleccionada();
		$("#id_destinatarios > tbody").html("");
		for(var i=0; i<temp_Destinatarios.length; i++){
			$("#id_destinatarios > tbody").append("<tr onclick='seleccionarFila("+'"'+i+'"'+")' id='tr_"+i+"' style='height:20px; font-size:9px; font-family:Arial;'>"+
				"<td style='text-align:center;'><input type='checkbox' name='checkDestinatario' notificacion='[emplty]' value='"+temp_Destinatarios[i].idPersona+";"+temp_Destinatarios[i].tipoAbrev+"' checked/></td>"+
				"<td style='text-align:center;'>"+temp_Destinatarios[i].tipoDestinatario+"</td>"+
				"<td>"+temp_Destinatarios[i].nombre+"</td>"+
				"<td><button onclick='abrirEdicionNotificacion(this)'>Editar</button></td>"+
				"</tr>");		
		}
	}catch(err){
		emitirErrorCatch(err, "cargarTablaDestinatarios"); // emite error
	}
}

/* @cargarInfoDespuesDeValidar: Carga la informacion del evento
	PARAMETROS:
		1) nombresAsociado: Nombre completo del asociado
*/
function cargarInfoDespuesDeValidar(nombresAsociado){
	try{
		// CARGA INFORMACION DEL ACCIDENTE
		parent.notificacionEventoActual=rptaWebservice[0];		
		var spanTitulo=$("#id_Titulo").children().find("span");
		spanTitulo.html("INFORMACIÓN DEL EVENTO "+rptaWebservice[0].codEvento);
		$("#id_fecha").val(rptaWebservice[0].fechaAccidente); // FECHA
		$("#id_nroCAT").val(rptaWebservice[0].nroCAT);
		$("#id_nombreCompletoAsociado").val(nombresAsociado);		
		cargarTablaDestinatarios();
		$("#id_fechaEmision").val(fechaFormateada((new Date()), false, true));
		$("#id_fechaEmision").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true}); 	
		$("#id_medio").val("");		
		$("#id_medio").select2();
		$("#id_descripcion").val("");
		codigoEvento=rptaWebservice[0].codEvento;		
		// carga lista de motivos
		webService2("getAllMotivos", "", "cargarMotivos()");
        $('body').scrollTop(800)
	}catch(err){
		emitirErrorCatch(err, "cargarInfoDespuesDeValidar"); // emite error
	}
}

/* @cargarInfoEvento: Valida los nombres de los responsables del accidente.
*/
function cargarInfoEvento(){
	try{
		temp_Destinatarios.length=0;
		// llena arreglo de asociados:
		nombresAsociado=(rptaWebservice[0].nombresAsociado+" "+rptaWebservice[0].apellidoPaternoAsociado+" "+rptaWebservice[0].apellidoMaternoAsociado).trim();
		if(rptaWebservice[0].tipoAsociado=='J'){
			nombresAsociado=rptaWebservice[0].razonSocial;
		}
		nombresPropietario=(rptaWebservice[0].nombresPropietario+" "+rptaWebservice[0].apellidoPaternoPropietario+" "+rptaWebservice[0].apellidoMaternoPropietario).trim();
		if(rptaWebservice[0].tipoPropietario=='J'){
			nombresPropietario=rptaWebservice[0].razonPropietario;
		}		
		nombresChofer=(rptaWebservice[0].nombresChofer+" "+rptaWebservice[0].apellidoPaternoChofer+" "+rptaWebservice[0].apellidoMaternoChofer).trim();
		temp_Destinatarios[temp_Destinatarios.length]={"idPersona":rptaWebservice[0].idPersonaAsociado, "tipoDestinatario":"ASOCIADO", "tipoAbrev":"A", "nombre":nombresAsociado, "distrito":reemplazarNullXpuntos(rptaWebservice[0].distritoAsociado), "direccion":reemplazarNullXpuntos(rptaWebservice[0].direccionAsociado), "idNotificacion":""};
		if(rptaWebservice[0].idPersonaPropietario!=null && rptaWebservice[0].idPersonaPropietario!=rptaWebservice[0].idPersonaAsociado){
			temp_Destinatarios[temp_Destinatarios.length]={"idPersona":rptaWebservice[0].idPersonaPropietario, "tipoDestinatario":"PROPIETARIO", "tipoAbrev":"P", "nombre":nombresPropietario, "distrito":reemplazarNullXpuntos(rptaWebservice[0].distritoPropietario), "direccion":reemplazarNullXpuntos(rptaWebservice[0].direccionPropietario), "idNotificacion":""};
        }
        if(rptaWebservice[0].idPersonaChofer!=null && rptaWebservice[0].idPersonaChofer!=rptaWebservice[0].idPersonaPropietario && rptaWebservice[0].idPersonaChofer!=rptaWebservice[0].idPersonaAsociado){
			temp_Destinatarios[temp_Destinatarios.length]={"idPersona":rptaWebservice[0].idPersonaChofer, "tipoDestinatario":"CHOFER", "tipoAbrev":"CH", "nombre":nombresChofer, "distrito":reemplazarNullXpuntos(rptaWebservice[0].distritoChofer), "direccion":reemplazarNullXpuntos(rptaWebservice[0].direccionChofer), "idNotificacion":""}
        }
        cargarInfoDespuesDeValidar(nombresAsociado);
	}catch(err){
        emitirErrorCatch(err, "cargarInfoEvento"); // emite error
    }
}
function ocultarPanelInfo(estado){
	try{
		if(estado){
		   estado="block";
		}
		if(!estado){
		   estado="none";		
		}
		$("#oculta").css("display", estado);

	}catch(err){ 
		emitirErrorCatch(err, "ocultarPanelInfo"); // emite error
	}
}
/* @cargarMotivos: Carga en un combobox la lista de motivos de Notificacion
*/
function cargarMotivos(){
	try{
		$("#id_motivo").html("");
		$("#id_motivo").append(new Option("Seleccione", ""));
		for(var i=0; i<rptaWebservice.length; i++){
			$("#id_motivo").append(new Option(rptaWebservice[i].descripcion, rptaWebservice[i].idMotivo));
		}
		$("#id_motivo").select2();		
		ocultarPanelInfo(false); // vuelve visible el panel de informacion
		$.fancybox.close();
	}catch (err){
		emitirErrorCatch(err, "cargarMotivos"); // emite error
	}
}

/* @guardarNotificacion: Registra las notificaciones para los destinatarios seleccionados.
*/
function guardarNotificacion(){
	try{
	// Encontrar campos requeridos
		var camposRequeridos="id_fechaEmision-Fecha de Envio/id_motivo-Motivo/id_medio-Medio de Envio";
		if(validarInputsValueXid(camposRequeridos)){
			if($("input[name='checkDestinatario']:checked").length>0){
				fancyConfirm("¿ Confirma generar la(s) notificacion(es) asociadas al evento Nº "+codigoEvento+" ? ", 
					function(estado){
						if(estado){							
							fancyAlertWait("Guardando");
							var destinatarios=[]; // esta variable contiene los id de los destinatarios							
							$("input[name='checkDestinatario']:checked").each(function () {
								destinatarios.push({ responsable: $(this).val(), notificacion: $(this).attr("notificacion")});								
							});
							var data =  {
								codEvento:codigoEvento,
								idMotivo: $("#id_motivo").val(),
								descripcionBreve:$("#id_descripcion").val(),
								medio:$("#id_medio").val(),
								fechaEmision:dateTimeFormat($("#id_fechaEmision").val()),
								destinatarios:destinatarios
							}
							
							/*var parametros="&codEvento="+codigoEvento+
							//"&idPersona="+$("#id_destinatarios").val()+
							"&idMotivo="+$("#id_motivo").val()+
							"&descripcionBreve="+$("#id_descripcion").val()+
							"&medio="+$("#id_medio").val()+
							"&fechaEmision="+dateTimeFormat($("#id_fechaEmision").val())+
							"&destinatarios="+destinatarios;*/
							DAO.consultarWebServicePOST(data, "guardarNotificacion", finalizarGuardarNotificacion);
							//webService2("guardarNotificacion", parametros, "finalizarGuardarNotificacion()");
						}
					}
				);	
			}else{
				fancyAlert("Debe seleccionar por lo menos 1 destinatario");
			}					
		}
	}catch(err){
		emitirErrorCatch(err, "guardarNotificacion"); // emite error
	}
}
function finalizarGuardarNotificacion(rptaWebservice){
	try{
		if(rptaWebservice.length>0){
			parent.idNotificaciones=rptaWebservice;
			parent.codigoEventoNotificacion=codigoEvento;
			parent.fechaEnvioNotificaciones=$("#id_fechaEmision").val();
			var destinatarios_seleccionados=new Array();
			for(var i=0; i<temp_Destinatarios.length; i++){ // Busca los destinatarios que fueron marcados
				for(var y=0; y<rptaWebservice.length; y++){
					if(temp_Destinatarios[i].idPersona==rptaWebservice[y].idPersona){
						temp_Destinatarios[i].idNotificacion=rptaWebservice[y].idNotificacion; // guarda el id de la notificacion del destinatario
						destinatarios_seleccionados[destinatarios_seleccionados.length]=temp_Destinatarios[i];
						break;
					}
				}
			}
			parent.destinatariosNotificaciones=destinatarios_seleccionados;
    		parent.abrirFancyBox(550, 415, "seguimiento",false);
		}else{
			fancyAlert("No se pudo guardar la Notificacion por favor comuniquese con el soporte técnico");
		}
	}catch(err){
		emitirErrorCatch(err, "finalizarGuardarNotificacion"); // emite error
	}
}
///******************* Busqueda avanzada *************************************************************************************
var text1="Debe seleccionar un tipo de busqueda";
var text2="¿Estas seguro en seleccionar este Evento?";
var datatableEventos;
var arrayEventosEncontrados=new Array();
function cargarPanelBusqueda(){
    try{
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
                    if(valorSeleccionado=="P"){
                        nombreLabel="Placa";
                    }
                    if(valorSeleccionado=='codEvento'){
                        nombreLabel="Cod. Evento";
                    }
                    $("#buscar_x_fechas").css("display", "none");
                    $("#buscar_x_codigo").css("display", "block");
                    $("#idLabel").html("<p class='Body-P'><span class='Body-C'>"+nombreLabel+"</span></p>");
                    $("#codigo").focus();
                }
            }
        );
    }catch(err){
        emitirErrorCatch(err, "cargarPanelBusqueda")
    }
}

/* @Realiza la busqueda del evento, por medio de la función global BuscarEventoGeneral
*/
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
                if(valorSeleccionado=="codEvento"){
                    mensaje="Cod. Evento";
                }
                campoValidar="codigo-"+mensaje;
            }
            if(validarInputsValueXid(campoValidar)){ // verifica que se hayan llenado los campos requeridos
                if($("#inicio").val()==$("#fin").val() && valorSeleccionado=='F'){
                    fancyAlertFunction("La fecha de Inicio y Fin no pueden ser iguales", function(estado){
                        if(estado){
                            $("#inicio").focus();
                        }
                    });
                }else{
                    fancyAlertWait("Buscando");
                    //webService2("getEventosGenerales", parametros, "cargarTablaResultadoEventos()");
                    BuscarEventoGeneral(parametros, "cargarTablaResultadoEventos()")
                }
            }
        }else{
            fancyAlert(text1);
        }
    }catch(err){
        emitirErrorCatch(err, "BuscarEvento"); // emite error
    }
}

/* @cargarTablaResultadoEventos: Lista en una TABLA HTML los resultados obtenidos de la busqueda del evento.
*/
function cargarTablaResultadoEventos(){
    try{
        if(datatableEventos!=undefined){
            datatableEventos.destroy();
            $('#tabla_datos > tbody').html("");
        }
        arrayEventosEncontrados.length=0; // reinicia el arreglo
        arrayEventosEncontrados=rptaWebservice;
        for(var i=0; i<arrayEventosEncontrados.length; i++){
            if(arrayEventosEncontrados[i].tipoAsociado=='J'){
                arrayEventosEncontrados[i].nombreCompletoAsociado=rptaWebservice[i].razonSocial;
            }else{
                arrayEventosEncontrados[i].nombreCompletoAsociado=quitarEspaciosBlanco(rptaWebservice[i].nombresAsociado)+" "+quitarEspaciosBlanco(rptaWebservice[i].apellidoPaternoAsociado)+" "+quitarEspaciosBlanco(rptaWebservice[i].apellidoMaternoAsociado);
            }
            arrayEventosEncontrados[i].nombreCompletoChofer=quitarEspaciosBlanco(rptaWebservice[i].nombresChofer)+" "+quitarEspaciosBlanco(rptaWebservice[i].apellidoPaternoChofer)+" "+quitarEspaciosBlanco(rptaWebservice[i].apellidoMaternoChofer);
            arrayEventosEncontrados[i].fechaAccidenteMostrar=(rptaWebservice[i].fechaAccidente).split(" ")[0];
        }
        var arrayColumAlign=[ // ANTERIORMENTE CREABA LA TABLA CON LA FUNCION crearFilasHTML
            {campo:'codEvento', alineacion:'center'},
            {campo:'nombreCompletoAsociado', alineacion:'justify'},
            {campo:'nombreCompletoChofer', alineacion:'justify'},
            {campo:'nroCAT', alineacion:'center'},
            {campo:'fechaAccidenteMostrar', alineacion:'center'}
        ];
        crearFilasHTML("tabla_datos", arrayEventosEncontrados, arrayColumAlign, true, 10);
        var columns=[
            { "width": "8%"},
            { "width": "35%"},
            { "width": "35%"},
            { "width": "8%"},
            { "width": "9%", "type":"date-eu" }
        ];
        var orderColum=[ 4, "desc" ];
        datatableEventos=parseDataTable("tabla_datos", columns, 160, orderColum);
        $("#ocultaBusqueda").css("display","none");
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "cargarTablaResultadoEventos")
    }
}

/* @cargarEvento: Obtiene la información del evento seleccionado 
*/
function cargarEvento(){
    try{
        if(filaSeleccionada!=undefined){
            var arrayDelEvento=arrayEventosEncontrados[filaSeleccionada];
            var codigoEvento=arrayDelEvento.codEvento;
            rptaWebservice=[{
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
                direccionAsociado:arrayDelEvento.direccionAsociado,
                distritoAsociado:arrayDelEvento.distritoAsociado,
                telefonoFijoAsociado:arrayDelEvento.telefonoFijoAsociado,
                celularAsociado:arrayDelEvento.celularAsociado,
                idPersonaPropietario:arrayDelEvento.idPersonaPropietario,
                nombresPropietario:arrayDelEvento.nombresPropietario,
                apellidoPaternoPropietario:arrayDelEvento.apellidoPaternoPropietario,
                apellidoMaternoPropietario:arrayDelEvento.apellidoMaternoPropietario,
                tipoPropietario:arrayDelEvento.tipoPropietario,
                razonPropietario:arrayDelEvento.razonPropietario,
                direccionPropietario:arrayDelEvento.direccionPropietario,
                distritoPropietario:arrayDelEvento.distritoPropietario,
                telefonoFijoPropietario:arrayDelEvento.telefonoFijoPropietario,
                celularPropietario:arrayDelEvento.celularPropietario,
                idPersonaChofer:arrayDelEvento.idPersonaChofer,
                nombresChofer:arrayDelEvento.nombresChofer,
                apellidoPaternoChofer:arrayDelEvento.apellidoPaternoChofer,
                apellidoMaternoChofer:arrayDelEvento.apellidoMaternoChofer,
                dniChofer:arrayDelEvento.dniChofer,
                direccionChofer:arrayDelEvento.direccionChofer,
                distritoChofer:arrayDelEvento.distritoChofer,
                telefonoFijoChofer:arrayDelEvento.telefonoFijoChofer,
                celularChofer:arrayDelEvento.celularChofer,
                causal1:arrayDelEvento.causal1,
                causal2:arrayDelEvento.causal2,
                distritoEvento:arrayDelEvento.distritoEvento
            }];
            cargarInfoEvento();
            $("#ocultaBusqueda").css("display", "block");
        }else{
            fancyAlert("Por favor seleccione un evento");
        }
    }catch(err){
        emitirErrorCatch(err, "cargarEvento"); // emite error
    }
}