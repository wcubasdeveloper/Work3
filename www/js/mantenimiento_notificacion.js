var DAO = new DAOWebServiceGeT("webservice")
var myEditor
var notificacion;
cargarInicio(function(){
	$("#btnGuardar").click(guardar);
	$("#btnEliminar").click(cancelar)
	myEditor = new dhtmlXEditor({
		parent: "panelInforme",
		toolbar: true, // force dhtmlxToolbar using
		iconsPath: "js_editor/codebase/imgs/", // path for toolbar icons
		skin: "dhx_skyblue",
	});
	notificacion = parent.window.frames[0].datos_array[parent.window.frames[0].filaSeleccionada]
	var parametros = "&codEvento="+notificacion.codEvento;
	DAO.consultarWebServiceGet("getInfoEventoAyuda", parametros, function(datos){
		console.log(datos);
		if(datos.length>0){
			$("#idCodEvento").val(notificacion.codEvento);
			$("#idCAT").val(datos[0].nroCAT);
			$("#idPlaca").val(datos[0].placa);
			$("#idAsociado").val(datos[0].asociado);
			$("#idConductor").val(datos[0].propietario);
			$("#idPropietario").val(datos[0].chofer);
			$("#idLugar").val(datos[0].fechaLugar);
			$("#idCausales").val(datos[0].causales);
			$("#idGastos").val(datos[0].gastos);
			$("#idAgraviados").val(datos[0].agraviados);				
		}
		// carga Motivos
		DAO.consultarWebServiceGet("getAllMotivos", "", function(datos){
			var campos =  {"keyId":'idMotivo', "keyValue":'descripcion'}
			agregarOpcionesToCombo("id_motivo", datos, campos);
			$("#idID").val(LPAD(notificacion.idNotificacion, numeroLPAD))
			$("#idDestinatario").val(reemplazarNullXpuntos(notificacion.nombreAsociado))
			$("#id_motivo").val(notificacion.idMotivo)
			$("#id_descripcion").val(notificacion.descripcionBreve)
			$("#id_medio").val(notificacion.medio)
			myEditor.setContent(notificacion.contenidoNotificacion);
			$.fancybox.close();
		})
	});
});
function guardar(){
	try{
		if(validarCamposRequeridos("idForm")){
				var parametros={
					motivo:$("#id_motivo").val(),
					notificacion:myEditor.getContent(),
					medio:$("#id_medio").val(),
					idNotificacion:notificacion.idNotificacion
				};
				fancyConfirm("¿Confirma actualizar la notificacion?",function(rpta){
					if(rpta){
						DAO.consultarWebServicePOST(parametros, "actualizarNotificacion", function(data){
							if(data[0]>0){
								realizoTarea=true;
								fancyAlertFunction("¡Se actualizo correctamente!", function(){
									parent.$.fancybox.close();
								});					
							}else{
								fancyAlert("No se pudo Actualizar");
							}
						});
					}
				})
				
		}		
	}catch(err){
		emitirErrorCatch(err, "guardar")
	}
}
function cancelar(){
	try{
			var estado_notificacion=notificacion.estado.trim();
            if(estado_notificacion!='C' && estado_notificacion!='T'){ //si es diferente del estado 'cancelado'
                //codEventoNotificacionSelecionada=notificacion.codEvento;
                codNotificacion=notificacion.idNotificacion;
                fancyConfirm("¿Esta seguro que desea proceder con la cancelación de la notificación "+codNotificacion+"?", function(estado){
                    if(estado){
                        var parametros="&idNotificacion="+codNotificacion;
                        consultarWebServiceGet("cancelarNotificacion", parametros, function(data){
                            if(data[0]>0){ // se cancelo la notificacion
                                realizoTarea = true;
								parent.$.fancybox.close();
                            }else{
                                fancyAlert("No se pudo cancelar la notificación")
                            }
                        })
                    }
                })
            }else{
                switch(estado_notificacion){
                    case 'C':
                        fancyAlert("La notificación ya se encuentra cancelada")
                        break;
                    case 'T':
                        fancyAlert("La notificación se encuentra en estado Terminado")
                        break;
                }                
            }
	}catch(err){
		emitirErrorCatch(err, "cancelar")
	}
}
function cargarInfoEventoAyuda(){
	try{
		var parametros = "&codEvento="+codEvento;
		console.log(parametros);
		DAO.consultarWebServiceGet("getInfoEventoAyuda", parametros, function(datos){
			console.log(datos);
			if(datos.length>0){
				$("#idCodEvento").val(codEvento);
				$("#idCAT").val(datos[0].nroCAT);
				$("#idPlaca").val(datos[0].placa);
				$("#idAsociado").val(datos[0].asociado);
				$("#idConductor").val(datos[0].propietario);
				$("#idPropietario").val(datos[0].chofer);
				$("#idLugar").val(datos[0].fechaLugar);
				$("#idCausales").val(datos[0].causales);
				$("#idGastos").val(datos[0].gastos);
				$("#idAgraviados").val(datos[0].agraviados);				
			}
			$.fancybox.close();
		});
	}catch(err){
		emitirErrorCatch(err, "cargarInfoEventoAyuda");
	}
}