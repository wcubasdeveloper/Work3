var realizoTarea=true;
var rptaCallback = [];
var tramite;
var myEditor;
cargarInicio(function(){
	myEditor = new dhtmlXEditor({
		parent: "panelInforme",
		toolbar: true, // force dhtmlxToolbar using
		iconsPath: "js_editor/codebase/imgs/", // path for toolbar icons
		skin: "dhx_skyblue",
	});
	var tipoContenido = getUrlVars()["tipo"];
	var nombreArea = getUrlVars()["nombreArea"];
	if(tipoContenido=='Plantilla'){ // Plantilla del area
		var idArea = getUrlVars()["idArea"];
		labelTextWebPlus("idTitutloInforme", ("PLANTILLA DEL AREA "+nombreArea).toUpperCase());
		var esNuevo = getUrlVars()["esNuevo"];
		if(esNuevo =='F'){ // no es nuevo
			var contenidoPlantilla = parent.arrayAreas[parent.filaSeleccionada].plantilla;
			myEditor.setContent(contenidoPlantilla);
		}
		$("#btnActualizarInforme").click(function(){
			actualizarPlantilla(idArea);
		});
	}else{ // es un informe
		tramite=parent.arrayExpedientes[parent.filaSeleccionada];	
		var deshabilitarActualizacion = getUrlVars()["deshabilitarActualizacion"];	
		labelTextWebPlus("idTitutloInforme", ("INFORME DEL ÁREA "+nombreArea).toUpperCase());
		if(deshabilitarActualizacion=='T'){
			myEditor.setContent(tramite.informe);		
			myEditor.setReadonly(true);
			$("#btnActualizarInforme").val("Preparar Respuesta");
			$("#btnActualizarInforme").click(prepararRespuesta)
		}else{
			if(tramite.informe==null){ // No se ha insertado nunca ningun informe
				myEditor.setContent(quitarEspaciosBlanco(parent.parent.formatoInformeArea));	
			}else{
				myEditor.setContent(tramite.informe);	
			}
			if(tramite.estadoExpediente=='1'){ // Si aun esta en proceso
				$("#btnActualizarInforme").click(actualizarInforme)	
			}else{ // Ya no esta proceso
				$("#btnActualizarInforme").prop("disabled", true); // deshabilita actualizacion del informe
				myEditor.setReadonly(true);
			}		
		}
	}
})

/* @actualizarPlantilla: Actualiza la plantilla predeterminada de una área.
*/
function actualizarPlantilla(idArea){
	try{
		var contenidoPlantilla = myEditor.getContent();
		if(contenidoPlantilla!=""){
			fancyConfirm("¿Desea actualizar la plantilla?", function(rpta){
				var parametros={
					plantilla:contenidoPlantilla,
					idArea:idArea
				};
				consultarWebServicePOST(parametros, "actualizarPlantilla", function(data){
					if(data[0]>0){
						fancyAlertFunction("¡Se actualizo correctamente!", function(rpta){
							if(rpta){								
								if(parent.parent.idArea == idArea){ // si la plantilla del area actualizada es igual a la area del usuario identificado
									parent.parent.formatoInformeArea = contenidoPlantilla; // actualiza su plantilla
								}
								parent.$.fancybox.close();
							}
						});					
					}else{
						fancyAlert("No se pudo Actualizar");
					}
				});
			});
		}else{
			fancyAlert("El contenido de la plantilla no puede ser vacio");
		}
	}catch(err){
		emitirErrorCatch(err, "actualizarPlantilla");
	}
}

/* @actualizarInforme: Actualiza el contenido del informe del expediente.
*/
function actualizarInforme(){ // actualiza el contenido de un informe
	try{
		var contenidoInforme = myEditor.getContent();//.replace(/<o:p>/g,'');
		//contenidoInforme = contenidoInforme.replace(/[</o:p>]/g, "");
		if(validarCamposRequeridos("panelInforme")){
			fancyConfirm("¿Desea actualizar el informe?", function(rpta){
				if(rpta){
					var parametros={
						informe:contenidoInforme,
						idHistorial:tramite.idHistorial
					};
					consultarWebServicePOST(parametros, "actualizarInforme", function(data){
						if(data[0]>0){
							//parent.arrayExpedientes[parent.filaSeleccionada].informe=$("#txtInforme").val();
							parent.arrayExpedientes[parent.filaSeleccionada].informe = contenidoInforme;
							fancyAlert("Se actualizo correctamente");					
						}else{
							fancyAlert("No se pudo Actualizar");
						}
					})
				}
			})			
		}	
	}catch(err){
		emitirErrorCatch(err, "actualizarInforme");
	}
}

/* @prepararRespuesta: Genera el reporte PDF del Informe
*/
function prepararRespuesta(){
	try{
		//window.open("reportePDF/pdf/respuestaPDF.php",'_blank');// Abre PDF
		var infoExpediente=tramite.infoExpediente;		
		var parametrosGET="&idExpediente="+infoExpediente[0].idExpediente+
			"&asociado="+infoExpediente[0].nombreAsociadoCompleto+
			"&placa="+infoExpediente[0].placa+
			"&codEvento="+infoExpediente[0].codEvento+
			"&agraviado="+infoExpediente[0].nombresAgraviado+
			"&tramitador="+infoExpediente[0].personaQpresenta+
			"&direccionTramitador="+infoExpediente[0].direccion+
			"&telefono="+infoExpediente[0].telefonoMovil+ // telefono del tramitador
			"&correo="+infoExpediente[0].email+ // correo del tramitador
			"&fechaSalida="+convertirAfechaString(tramite.fechaSalida, false)+
			"&textoPorEstado="+getUrlVars()["textoPorEstado"]+
			"&tipoIngreso="+
			"&tipoDoc=";
		var parametrosPOST={ 'textoInforme' : tramite.informe,
			'asunto': infoExpediente[0].tipo };	
		OpenWindowWithPost("webservice?funcion=informeExpediente"+parametrosGET, "_blank", parametrosPOST) // abre pdf
		fancyAlertWait("Abriendo Informe PDF");
		setTimeout(function(){
			var parametrosFancyBox="?correo="+infoExpediente[0].email+"&tramitador="+infoExpediente[0].personaQpresenta;
			parent.abrirVentanaFancyBox(500, 290, "preparar_respuesta"+parametrosFancyBox, true);
		}, 1000)
		
	}catch(err){
		emitirErrorCatch(err, "prepararRespuesta")
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