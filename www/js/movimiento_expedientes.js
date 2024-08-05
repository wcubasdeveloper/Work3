// Variables Globales
// Dinamica
var dataTableExpedientes=undefined;
var usuarioIdentificado=parent.idUsuario; // obtiene el id del usuario identificado en el sistema
var idAreaDelUsuario = parent.idArea; // Obtiene el id de la area a que pertenece el usuario
var nombreAreaDelUsuario = parent.nombreArea; // nombre de la area a la que pertenece el usuario
var arrayExpedientes=new Array();
cargarInicio(function(){	
	$("#idBtnBusquedaAvanzada").click(abrirBusquezaAvanzada);
	$("#idBtnRecibir").click(recibirTramite);
	$("#idBtnMover").click(moverTramite);
	$("#idBtnRefrescar").click(buscarTramites);
	$("#idBtnInforme").click(abrirInforme)
	$("#divTABLA").css("padding-top", "28px");	
	agregarOpcionesToCombo("tipoExpediente", arrayTipoExpediente, {keyValue:"descripcion", keyId:"id"})
	$("#tipoExpediente").change(function(){
		arrayOpcionesBusqueda = {}
		labelTextWebPlus("lblBusquedaAvanza","");
		buscarTramites();
	});
	$("#lblBusquedaAvanza").css("margin-top", "3px");
	buscarTramites();
});
var opcionesBusqueda = [
	{
		nombreVariable:"nroExpediente",
		nombreTexto : "Nro Expediente"
	},
	{
		nombreVariable:"codAgraviado",
		nombreTexto : "Cod Agraviado"
	},
	{
		nombreVariable:"evento",
		nombreTexto : "Evento"
	},
	{
		nombreVariable:"placa",
		nombreTexto : "Placa"
	},
	{
		nombreVariable:"agraviado",
		nombreTexto : "Agraviado"
	},
	{
		nombreVariable:"beneficiario",
		nombreTexto : "Beneficiario"
	}
]
var arrayOpcionesBusqueda = {};
function abrirBusquezaAvanzada(){
	try{
		abrirVentanaFancyBox(700, 300, "busqueda_avanzada_movimientos", true, function(data){
			arrayOpcionesBusqueda = data;
			var textoBusqueda = "<b>|CRITERIOS DE BUSQUEDA| </b>";
			for(var i=0; i<opcionesBusqueda.length; i++){				
				var opcion = opcionesBusqueda[i].nombreVariable;
				if(arrayOpcionesBusqueda[opcion]!=undefined && arrayOpcionesBusqueda[opcion]!=""){
					if(textoBusqueda!="<b>|CRITERIOS DE BUSQUEDA| </b>"){
						textoBusqueda = textoBusqueda+", ";
					}
					textoBusqueda = textoBusqueda +"<b>"+opcionesBusqueda[i].nombreTexto+":</b> "+arrayOpcionesBusqueda[opcion];
				}
			}			
			labelTextWebPlus("lblBusquedaAvanza",textoBusqueda);
			// aplica la busqueda avanzada
			  // reinicia el filtro "Tipo Expediente"
			  $("#tipoExpediente").val("");			  
			var parametrosPost = {
			  "filtros": arrayOpcionesBusqueda,
			  "idUsuario":usuarioIdentificado,
			  "idAreaUsuario":idAreaDelUsuario
			}
			consultarWebServicePOST(parametrosPost, "busquedaAvanzadaTramites", cargarListaExpedientes); 
		})
		
	}catch(err){
		emitirErrorCatch(err, "abrirBusquezaAvanzada");
	}
}

/* @buscarTramites: Realiza la busqueda de los expedientes derivados para el usuario logeado / o para usuarios de su misma área.
*/
function buscarTramites(){
	try{
		var parametros = "&idUsuario="+usuarioIdentificado+
			"&idAreaUsuario="+idAreaDelUsuario+"&tipoExp="+(($("#tipoExpediente").val()==undefined)?"":$("#tipoExpediente").val());
		consultarWebServiceGet("getTramitesByidUsuario", parametros, function(info){ // Busca los expedientes asociado al usuario
			cargarListaExpedientes(info); // carga todos los documentos asignados al usuario		
		});
	}catch(err){
		emitirErrorCatch(err, "buscarTramites")
	}
}
	
function captura_click(e) {
	// Funcion para capturar el click del raton
	var HaHechoClick;
	if (e == null) {
		// Si hac click un elemento, lo leemos
		HaHechoClick = event.srcElement;
	} else {
		// Si ha hecho click sobre un destino, lo leemos
		HaHechoClick = e.target;
		var tagname = HaHechoClick.tagName;
		return tagname;
	}
	return '';
}
var arrayTipoExpediente = [
	{
		id:"1",
		descripcion:"Solicitud Reembolso por Gastos médicos"
	},
	{
		id:"2",
		descripcion:"Solicitud Indemnización por Muerte"
	},
	{
		id:"3",
		descripcion:"Solicitud Indemnización por Sepelio"
	},
	{
		id:"4",
		descripcion:"Solicitud Indemnización por Incapacidad Temporal"
	},
	{
		id:"5",
		descripcion:"Solicitud Indemnización por Invalidez Permanente"
	},
	{
		id:"6",
		descripcion:"Solicitud de Subsanacion"
	},
	{
		id:"7",
		descripcion:"Documento Administrativo"
	},
	{
		id:"9",
		descripcion:"Otros"
	},
	{
		id:"10",
		descripcion:"Solicitudes de Pago a las IPRESS"
	},
	{
		id:"11",
		descripcion:"Regularizaciones de Solicitudes"
	},
]

function cargarListaExpedientes(data){
	try{
		if(dataTableExpedientes!=undefined){
            dataTableExpedientes.destroy(); // elimina
        }
        $("#tabla_datos > tbody").html("");
		for(var i=0; i<data.length; i++){
			// Obtiene el tipo de expediente
			switch(data[i].tipoExpediente){
				case '1':
					data[i].tipo='Solicitud Reembolso por Gastos médicos';
					break;
				case '2':
					data[i].tipo='Solicitud Indemnización por Muerte';
					break;
				case '3':
					data[i].tipo='Solicitud Indemnización por Sepelio';
					break;
				case '4':
					data[i].tipo='Solicitud Indemnización por Incapacidad Temporal';
					break;
				case '5':
					data[i].tipo='Solicitud Indemnización por Invalidez Permanente';
					break;
				case '6':
					data[i].tipo='Solicitud de Subsanacion';
					break;
				case '7':
					data[i].tipo='Documento Administrativo';
					break;
				case '9':
					data[i].tipo='Otros';
					break;
				case '10':
					data[i].tipo='Solicitudes de Pago a las IPRESS';
					break;
				case '11':
					data[i].tipo='Regularizaciones de Solicitudes';
					break;
				default:
					data[i].tipo='Virtual';
					break;
			}
			switch(data[i].estadoExpediente){
				case '1':
					data[i].nombreEstadoExpediente='En Proceso';
					break;
				case '2':
					data[i].nombreEstadoExpediente='Observado';
					break;
				case '3':
					data[i].nombreEstadoExpediente='Aprobado';
					break;
			}
			// estado de expediente:
			switch(data[i].estadoNotificacion){
				case "1":
					data[i].estado='Pend. Recibir';
					break;
				case "2":
					data[i].estado='Recibido';
					break;
				case "0":
					data[i].estado='Por Derivar';
					break;
			}
			data[i].fechaIngreso=convertirAfechaString(data[i].fechaIngreso)
			data[i].asociado=data[i].nombreAgraviado;
			if(data[i].tipoPersona=='J'){ //
				data[i].asociado=data[i].razonSocial;
			}
			// Quita campos nullos y vacios
			data[i].nroDocReferencia=quitarEspaciosBlanco(data[i].nroDocReferencia);
			data[i].Observaciones=quitarEspaciosBlanco(data[i].Observaciones);
			data[i].comentarios=quitarEspaciosBlanco(data[i].comentarios);
			data[i].asociado = quitarEspaciosBlanco(data[i].asociado);
			data[i].codEvento = quitarEspaciosBlanco(data[i].codEvento);
			data[i].nombreAgraviado = quitarEspaciosBlanco(data[i].nombreAgraviado);	
			
			var colorResaltado ="";
			if(data[i].idUsuarioDestino==usuarioIdentificado && data[i].estadoNotificacion=='1'){
				colorResaltado="background-color:#B0C4DE;"
			}
			if(data[i].tipoAccidente==null){
				data[i].tipoAccidente='';
			}
			// Crea la tabla
			$("#tabla_datos > tbody").append("<tr style='font-family: Arial; "+colorResaltado+" height: 30px; cursor: pointer; font-size:11px;' onclick='changeMultiple("+'"'+i+'"'+")' id='tr_"+i+"'>"+
				"<td style='vertical-align: middle; text-align:center; '><input id='chck_"+i+"' type='checkbox' onchange='seleccionMultiple("+'"'+i+'"'+")'/></td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+LPAD(data[i].idExpediente, numeroLPAD)+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].fechaIngresoExp+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].fechaIngreso+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].codAgraviado+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].codEvento+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].placa+"</td>"+
				"<td style='vertical-align: middle; text-align:left; '>"+data[i].tipoAccidente+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].fechaAccidente+"</td>"+
				"<td style='vertical-align: middle; text-align:left; '>"+data[i].nombreAgraviado+"</td>"+
				"<td style='vertical-align: middle; text-align:left; '>"+((data[i].beneficiario==null)?"":data[i].beneficiario)+"</td>"+
				"<td style='vertical-align: middle; text-align:left; '>"+((data[i].IPRESS==null)?"":data[i].IPRESS)+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].nombreArea+"</td>"+				
				"<td style='vertical-align: middle; text-align:left; '>"+((data[i].usuarioDestino==null)?"":data[i].usuarioDestino)+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].estado+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].tipo+"</td>"+
				"<td style='vertical-align: middle; text-align:center; '>"+data[i].nroFolios+"</td>"+
				"<td style='vertical-align: middle; text-align:left; '>"+data[i].Observaciones+"</td>"+				
				"</tr>");
		}
        arrayExpedientes=data;
        // Asignamos dataTables a la tabla ya creada
        var arrayColumnWidth=[
            { "width": "1%"},
			{ "width": "4%"},
            { "width": "4%"},
            { "width": "4%"},
            { "width": "4%"},
            { "width": "4%"},
            { "width": "4%"},
            { "width": "7%"},
            { "width": "4%"},
			{ "width": "9%"},
            { "width": "9%"},
            { "width": "9%"},
            { "width": "8%"},
            { "width": "4%"},
            { "width": "4%"},
            { "width": "5%"},
			{ "width": "2%"},
			{ "width": "5%"}
        ];        
        var orderByColum=[2, "desc"];
        dataTableExpedientes=parseDataTable("tabla_datos", arrayColumnWidth, 318, false, false, false);
		$("#tabla_datos_filter").css({
			"float":"left",
			"margin-left":"10px",
			"font-size":"14px",
			"margin-top":"3px",
			"margin-bottom":"3px"
		});
		$("#oculta").css("display", "none");
		$("#divTABLA").css("height", "420px");
        $.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "cargarListaExpedientes");
	}
}
function changeMultiple(index){
	try{
		var tagname = captura_click(event)
		if(tagname!='INPUT'){
			$("#chck_"+index).click();
		}		
		$("#chck_"+index).change();
				
	}catch(err){
		emitirErrorCatch(err, "changeMultiple");
	}	
}
function seleccionMultiple(index){
	try{
		var isChecked = $("#chck_"+index).prop("checked");
		if(isChecked){ // resalta la fila seleccionada
			var TDs=$("#tr_"+index).find("td"); // Busca todos los TD dentro de la Fila
			TDs.each(function(){ // Pinta cada td encontrado
				$(this).css("background-color", "gray");
				$(this).css("color", "white");
			});
		}else{ // quita el filtro
			 var TDs=$("#tr_"+index).find("td"); // Busca todos los <TD></TD> dentro de la Fila <TR></TR>
            TDs.each(function(){ // agrega estilo a cada <TD></TD> 
            	$(this).css("background-color", "transparent"); // Lo vuelve a color transparente                
                $(this).css("color", "black"); // Asigna como color negro a la fuente.
            });
		}
	}catch(err){
		emitirErrorCatch(err, "seleccionMultiple");
	}
}

function recibirTramite(){
	try{
		if($("input:checked").length>0){
			var listaDisponible = true;
			var idExpediente = "";
			var tipo = "";
			var nombreArea = "";
			var areaOrigen = "";
			var comentarios = "";
			var idHistorial = "";
			var estadoExpediente = "";
			$("input:checked").each(function(){
				var fila = $(this).attr("id").split("chck_")[1];
				var tramite=arrayExpedientes[fila];
				if(tramite.idAreaDestino==idAreaDelUsuario){
					
					if(tramite.estadoNotificacion=='1'){
					
						if(tramite.idUsuarioOrigen!=usuarioIdentificado){
							
							if(idExpediente!=""){
								idExpediente=idExpediente+",";
							}
							
							idExpediente = idExpediente+tramite.idExpediente;
							if(tipo!=""){
								tipo=tipo+" | ";					
							}
							tipo =  tipo+tramite.tipo;
							
							if(nombreArea!=""){
								nombreArea=nombreArea+" | ";
							}
							
							nombreArea = nombreArea+tramite.nombreArea;
							
							if(comentarios!=""){
								comentarios=comentarios+" | "; 
							}
							comentarios = comentarios+tramite.comentarios;
																			
							if(idHistorial!=""){
								idHistorial = idHistorial+",";
							}
							idHistorial = idHistorial+tramite.idHistorial;
							
							if(estadoExpediente!=""){
								estadoExpediente = estadoExpediente+","
							}
							estadoExpediente = estadoExpediente+tramite.estadoExpediente;
													
						}else{
							listaDisponible=false;
							fancyAlert("No se puede recibir el documento. Este documento ha sido derivado al usuario destinatario ("+tramite.usuarioDestino+") ");
						}					
					}else{
						listaDisponible = false;
						fancyAlert("Este documento "+tramite.idExpediente+" ya fue 'Recibido'");
					}
				}else{
					listaDisponible = false;
					if(tramite.idAreaOrigen==idAreaDelUsuario){						
						if(tramite.estadoNotificacion=='0'){
							fancyAlert("El documento "+tramite.idExpediente+" ya fue recibido. (Solo se puede derivar)");
						}if(tramite.estadoNotificacion=='1' || tramite.estadoNotificacion=='2'){
							fancyAlert("El documento "+tramite.idExpediente+" ya fue recibido y derivado");
						}
					}else{
						fancyAlert("No se puede recibir el documento "+tramite.idExpediente+", porque el Area Destino no es la misma que el Área del Usuario identificado");
					}
				}
			});
			if(listaDisponible){
				var parametros="?idExpediente="+idExpediente+
					"&tipo="+tipo+
					"&areaOrigen="+nombreArea+
					"&comentarios="+comentarios+
					"&idAreaUsuario="+idAreaDelUsuario+
					"&idUsuario="+usuarioIdentificado+
					"&fechaIngreso="+dateTimeFormat(convertirAfechaString(new Date()))+
					"&idHistorial="+idHistorial+
					"&estadoExpediente="+estadoExpediente;
				abrirVentanaFancyBox(625, 404, "recibir_tramite"+parametros, true);
			}			
		}else{
			fancyAlert("Tiene que seleccionar un expediente");
		}
	}catch(err){
		emitirErrorCatch(err, "recibirTramite");		
	}
}
function moverTramite(){
	try{
		if($("input:checked").length>0){
			if($("input:checked").length==1){
				var fila = $("input:checked").attr("id").split("chck_")[1];
				var tramite=arrayExpedientes[fila];
				if(tramite.idUsuarioOrigen==usuarioIdentificado){ 			
					if(tramite.estadoNotificacion=='0'){ // Generado
						var parametros="?idExpediente="+tramite.idExpediente+
							"&idUsuario="+usuarioIdentificado+
							"&idArea="+idAreaDelUsuario+
							"&fechaExpediente="+dateTimeFormat(convertirAfechaString(new Date()))+// Fecha de ingreso en el historial
							"&activar=T"+ // Para
							"&estadoExpediente="+tramite.estadoExpediente+
							"&idHistorial="+tramite.idHistorial; 
						abrirVentanaFancyBox(500, 350, "derivartramite"+parametros, true);			
					}else{
						if(parseInt(tramite.estadoNotificacion)>0){
							fancyAlert("Este documento ya fue derivado");
						}
					}
				}else{
					if(tramite.estadoNotificacion=='1'){
						fancyAlert("Para derivar este documento, primero tiene que 'RECIBIRLO'");
					}else{
						if(tramite.estadoExpediente!='1'){
							fancyAlert("La Gestion de este expediente, ya ha expirado");
						}else{
							fancyAlert("Ud. no es propietario de este documento. Solo puede mover los documentos que Ud. haya generado");
						}
					}
				}
			}else{
				fancyAlert("¡Debe seleccionar un solo Expediente!")
			}									
		}else{
			fancyAlert("Tiene que seleccionar un expediente");
		}
	}catch(err){
		emitirErrorCatch(err, "moverTramite");
	}
}
function abrirInforme(){ // Abre popup para editar informe @autor=JP
	try{
		if($("input:checked").length>0){
			if($("input:checked").length==1){
				var fila = $("input:checked").attr("id").split("chck_")[1];
				filaSeleccionada = fila;
				var tramite=arrayExpedientes[fila];
				if(tramite.idUsuarioOrigen==usuarioIdentificado){
					if(tramite.tipoExpediente!='7' && tramite.tipoExpediente!='9'){
						var parametros="?nombreArea="+tramite.nombreArea;
						abrirVentanaFancyBox(700, 400, "mantenimiento_informepdf"+parametros, true)	
					}else{
						fancyAlert("Solo se pueden agregar Informes a expedientes de tipo 'Solicitud'");
					}				
				}else{
					if(tramite.estadoExpediente=='1'){
						fancyAlert("Primero debe dar por recibido el expediente antes de agregar un informe");
					}else{
						fancyAlert("Usted no es propietario del documento. (La Gestion del expediente ha expirado)");
					}
				}
			}else{
				fancyAlert("¡Debe seleccionar un solo Expediente!")
			}			
		}else{
			fancyAlert("Debe seleccionar un expediente")
		}
	}catch(err){
		emitirErrorCatch(err, "abrirInforme")
	}
}