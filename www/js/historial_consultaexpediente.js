var dataTable;
var arrayExpedientes;
var infoExpediente;
var textAprobado;
var textObservado;
cargarInicio(function(){
    $("#idCaptcha").css("background-image","url(js/captcha/1.jpg)");
    DrawCaptcha();
    $("#idBtnBuscarExpediente").click(buscarExpediente);
    consultarWebServiceGet("getTextEstado", "", function(data){ // Busca textAprobado, textObservado
	 	textAprobado=data[0].textAprobado;
	 	textObservado=data[0].textObservado;
	 	$.fancybox.close();
	 });
});
function buscarExpediente(){
	try{
	    if(validarCamposRequeridos("idPanelBusqueda")){
	        if(removeSpaces($("#idCaptcha").val())==$("#idRptaCaptcha").val()){
	            limpiarDatos();
    	        var codExpediente=$("#idTXTBuscarExpediente").val().trim();
    	        var nroCAT = $("#idBuscaCAT").val().trim();
        		var parametros="&idExpediente="+codExpediente+
        		    "&nroCAT="+nroCAT;
        		consultarWebServiceGet("consultarSolicitud", parametros, function(data){
        			if(data.length>0){
        				cargarInfo(data);				
        			}else{
        				fancyAlert("¡ No se encontraron registros de solicitudes !");
        			}
        		})
	        }else{
	            fancyAlertFunction("¡Código de verificación incorrecto!", function(rpta){
	                if(rpta){
	                    $("#idRptaCaptcha").focus();
	                }
	            })
	        }
	    }
	}catch(err){
		emitirErrorCatch(err, "buscarExpediente")
	}
}
function cargarInfo(data){
	try{
		switch(data[0].tipoExpediente){
			case '1':
				data[0].tipo='Solicitud Reembolso por Gastos médicos';
				break;
			case '2':
				data[0].tipo='Solicitud Indemnización por Muerte';
				break;
			case '3':
				data[0].tipo='Solicitud Indemnización por Sepelio';
				break;
			case '4':
				data[0].tipo='Solicitud Indemnización por Incapacidad Temporal';
				break;
			case '5':
				data[0].tipo='Solicitud Indemnización por Invalidez Permanente';
				break;
			case '6':
				data[0].tipo='Solicitud de Subsanacion';
				break;
			case '7':
				data[0].tipo='Documento Administrativo';
				break;
			case '9':
				data[0].tipo='Otros';
				break;
			case '10':
				data[0].tipo='Solicitudes de Pago a las IPRESS';
				break;
			case '11':
				data[0].tipo='Regularizaciones de Solicitudes';
				break;
			default:
				data[0].tipo='Virtual';
				break;
		}
		switch(data[0].estado){
			case '1':
				data[0].nombreEstadoExpediente='En Proceso';
				break;
			case '2':
				data[0].nombreEstadoExpediente='Observado';
				break;
			case '3':
				data[0].nombreEstadoExpediente='Aprobado';
				break;
		}
		// Carga informacion del expediente
		$("#idTXTBuscarExpediente").val(LPAD(data[0].idExpediente, numeroLPAD))
		labelTextWebPlus("id_titulo", "INFORMACIÓN DEL EXPEDIENTE "+LPAD(data[0].idExpediente, numeroLPAD));
		$("#idTipoExpediente").val(data[0].tipo); // Tipo Expediente
		$("#idFechaIngreso").val(data[0].fechaExpediente);
		$("#idEstado").val(data[0].nombreEstadoExpediente);
		$("#idDiasRespuesta").val(data[0].diasRespuesta);
		$("#idObservacion").val(reemplazarVacioXguiones(data[0].Observaciones));
		data[0].nombreAsociadoCompleto="";
		switch(data[0].tipoPersona){
			case 'N':
				data[0].nombreAsociadoCompleto=data[0].nombreAsociado;
				break;
			case 'J':
				data[0].nombreAsociadoCompleto=data[0].razonSocial
				break;
		}
		$("#idAsociado").val(reemplazarVacioXguiones(data[0].nombreAsociadoCompleto));
		$("#idAgraviado").val(reemplazarVacioXguiones(data[0].nombresAgraviado));
		$("#idPlaca").val(reemplazarVacioXguiones(data[0].placa));
		$("#idFechaEvento").val(reemplazarVacioXguiones(data[0].fechaAccidente));
		$("#idNombreTramitador").val(data[0].personaQpresenta);
		$("#idDNI").val(data[0].nroDocumento);
		$("#idTelef").val(reemplazarVacioXguiones(data[0].telefonoMovil));
		$("#idDireccion").val(reemplazarVacioXguiones(data[0].direccion));
		$("#idNroFolios").val(data[0].nroFolios);
		$("#idNroDocRef").val(reemplazarVacioXguiones(data[0].nroDocReferencia));
		if(data[0].idExpedientePrevio==null || data[0].idExpedientePrevio==0){
			$("#idNroExpPrevio").val("-------");
		}else{
			$("#idNroExpPrevio").val(LPAD(data[0].idExpedientePrevio, numeroLPAD));
		}
		infoExpediente=data;
		// Busca el historial del expediente
		buscarHistorial(data[0].idExpediente);

	}catch(err){
		emitirErrorCatch(err, "cargarInfo")
	}
}
function buscarHistorial(idExpediente){
	try{
		var parametros="&idExpediente="+idExpediente;
		consultarWebServiceGet("getHistorialByExpediente", parametros, function(data){
			cargarTablaHistorial(data);
		})
	}catch(err){
		emitirErrorCatch(err, "buscarHistorial")
	}
}
function obtenerCantidadDias(fechaMayor, fechaMenor){
	try{
		var result=fechaMayor - fechaMenor;
		var cantidadDias = Math.round(result/86400000);
		if(cantidadDias>0){
			return cantidadDias+' dia(s)';
		}else{
			var cantidadHoras = Math.round(result/3600000);
			if(cantidadHoras>0){
				return cantidadHoras+' hora(s)';
			}else{
				var cantidadMinutos = Math.round(result/60000);
				return cantidadMinutos+' minuto(s)';
			}
		}
	}catch(err){
		emitirErrorCatch(err, "obtenerCantidadDias")
	}
}
function cargarTablaHistorial(data){
	try{
		fancyAlertWait("Cargando");
		for(var i=0; i<data.length; i++){
			data[i].fechaIngreso=convertirAfechaString(data[i].fechaIngreso);
			var fechaIngreso = parseDATE(data[i].fechaIngreso)
			var fechaSalida;
			if(data[i].fechaSalida!="" && data[i].fechaSalida!=null){
				fechaSalida=parseDATE(convertirAfechaString(data[i].fechaSalida));
			}else{
				fechaSalida = new Date();
			}
			data[i].diasProceso=obtenerCantidadDias(fechaSalida, fechaIngreso);
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
			data[i].areaDestino=quitarEspaciosBlanco(data[i].areaDestino)
			data[i].usuarioDestino=quitarEspaciosBlanco(data[i].usuarioDestino)
			data[i].comentarios=quitarEspaciosBlanco(data[i].comentarios)
			data[i].infoExpediente=infoExpediente;
			data[i].button = "";
			if(data[i].informe!="" && data[i].informe!=null){
			    data[i].button="<button onclick='verPDF("+i+")'>Ver Informe</button>";
			}
		}
		var CampoAlineacionArray=[
	        {campo:'fechaIngreso', alineacion:'center'},
	        {campo:'areaOrigen', alineacion:'center'},
	        {campo:'usuarioOrigen', alineacion:'left'},
	        {campo:'diasProceso', alineacion:'center'},
	        {campo:'areaDestino', alineacion:'center'},
	        {campo:'usuarioDestino', alineacion:'left'},
	        {campo:'estado', alineacion:'center'},
	        {campo:'button', alineacion:'center'}
	    ];
	    if(dataTable!=undefined){
	        dataTable.destroy(); // elimina
	    }
	    arrayExpedientes=data;
	    crearFilasHTML("tabla_datos", data, CampoAlineacionArray, false, 11);
	    var arrayColumnWidth=[
	        { "width": "8%", "type":"date-euro" },
	        { "width": "10%" },
	        { "width": "20%" },
	        { "width": "7%" },
	        { "width": "10%" },
	        { "width": "20%" },
	        { "width": "14%" },
	        { "width": "20%" }
	    ];
	    $("#tabla_datos > tbody tr:last").css("background-color", "#D3D3D3");
	    //$("#tabla_datos > tbody tr:last").css("color", "white");
	    var orderByColum=[0, "asc"];
	    dataTable=parseDataTable("tabla_datos", arrayColumnWidth, 197, false, false, false);
	    $.fancybox.close();
	    $("#oculta").css("display", "none")
	    // Ocultar panel busqueda y mover panel 
	        $("#idPanelBusqueda").css("display", "none");
	        $("#idPanelInfo").css("top", "60px");
	        $("#idHistoriales").css("top", "320px");
	    //
	}catch(err){
		emitirErrorCatch(err, "cargarTablaHistorial")
	}
}
function reemplazarVacioXguiones(cadena){
	try{
		cadena=quitarEspaciosBlanco(cadena);
		if(cadena==""){
			cadena="-------";
		}
		return cadena;
	}catch(err){
		emitirErrorCatch(err, "reemplazarVacioXguiones")
	}
}
function verPDF(indice){
    try{
        var tramite = arrayExpedientes[indice];
        var infoExpediente= tramite.infoExpediente;
        var textoSegundoEstado;
        switch(tramite.infoExpediente[0].estado){
		    case '2':
				textoSegundoEstado=textObservado;
				break;
			case '3':
				textoSegundoEstado=textAprobado;
			    break;
			default:
		        textoSegundoEstado="";
		        break;
		}
		var parametrosGET="&idExpediente="+infoExpediente[0].idExpediente+
			"&asociado="+infoExpediente[0].nombreAsociadoCompleto+
			"&placa="+infoExpediente[0].placa+
			"&codEvento="+infoExpediente[0].codEvento+
			"&agraviado="+infoExpediente[0].nombresAgraviado+
			"&tramitador="+infoExpediente[0].personaQpresenta+
			"&direccionTramitador="+infoExpediente[0].direccion+
			"&telefono="+infoExpediente[0].telefonoMovil+ // telefono del tramitador
			"&correo="+infoExpediente[0].email+ // correo del tramitador
			"&fechaSalida="+((tramite.fechaSalida!="" && tramite.fechaSalida!=null) ? convertirAfechaString(tramite.fechaSalida, false): "")+
			"&textoPorEstado="+textoSegundoEstado+
			"&tipoIngreso="+
			"&tipoDoc=";
		var parametrosPOST={ 'textoInforme' : "<div style='font-size:9.5px;'>"+tramite.informe+"</div>",
			'asunto': infoExpediente[0].tipo };	
		OpenWindowWithPost("webservice?funcion=informeExpediente"+parametrosGET, "_blank", parametrosPOST) // abre pdf
        
    }catch(err){
        emitirErrorCatch(err, "verPDF")
    }
}
function OpenWindowWithPost(url, tipo, params){
    try{       
        $("body").append("<form id='envio'></form>");        
        var form=$("#envio");
        form.attr("method", "post");
        form.attr("action", url);
        form.attr("target", tipo);
        for (var i in params) {
            if (params.hasOwnProperty(i)) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = i;
                input.value = params[i];
                form.append(input);
            }
        }           
        form.submit();            
        //document.body.removeChild(form);
    }catch(err){
    	emitirErrorCatch(err,"OpenWindowWithPost")
    }
}
function limpiarDatos(){
	try{
		labelTextWebPlus("id_titulo", "INFORMACIÓN DEL EXPEDIENTE ");
		$("#idTipoExpediente").val("");
		$("#idFechaIngreso").val("");
		$("#idEstado").val("");
		$("#idDiasRespuesta").val("");
		$("#idObservacion").val("");
		$("#idAsociado").val("");
		$("#idAgraviado").val("");
		$("#idPlaca").val("");
		$("#idFechaEvento").val("");
		$("#idNombreTramitador").val("");
		$("#idDNI").val("");
		$("#idTelef").val("");
		$("#idDireccion").val("");
		$("#idNroFolios").val("");
		$("#idNroDocRef").val("");
		$("#idNroExpPrevio").val("");
		// Limpiar tabla
		if(dataTable!=undefined){
	        dataTable.destroy(); // elimina
	    }
	    dataTable=undefined;
	    $("#tabla_datos > tbody").html("");
	    $("#oculta").css("display", "block")
	}catch(err){
		emitirErrorCatch(err, "limpiarDatos")
	}
}