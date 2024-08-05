var TIPO_EMISION_PERSONA = "tipoPersona"
var TIPO_EMISION_EMPRESA = "tipoEmpresa"
var TIPO_EMISION_MULTIPLES = "tipoMultiples"

var DAO = new DAOWebServiceGeT("wbs_ventas") // Objeto del web service de Ventas
var DAOT = new DAOWebServiceGeT("wbs_tesoreria")

var listaCuotas_porEmpresa = {} 
var campos_listaCuotas = {"keyId":'idContratoRenovacion', "keyValue":'contrato_nroCuota'}

function initPantalla(){
	try{		
		reiniciarOpcionesBusqueda()
		reiniciarRadionButtons()
	}catch(err){
		emitirErrorCatch(err, "initPantalla")
	}
}
// reinicia solo los input text & selects
function reiniciarOpcionesBusqueda(){
	try{
		
		// reinicia valores en cajas de texto y lista desplegables:
		$("input[type=text]").each(function(){
			$(this).val("")
			$(this).attr("requerido", "")
		})
		$("select").each(function(){
			$(this).val("")			
			$(this).attr("requerido", "")
			$(this).change()
			$(this).select2()
		})
		$("#idDescripcionGlosa").val("")
		// desactiva todos los elementos menos los checkbox de seleccion:
		$(":input").not("input[name=tipoEmision], #idDescripcionGlosa, #btnGuardar").prop("disabled", true);
		$("#idPanelGuardar").hide()
	}catch(err){
		emitirErrorCatch(err, "reiniciarOpcionesBusqueda")
	}
}
function reiniciarRadionButtons(){
	try{
		$("input[name=tipoEmision]").each(function(){
			$(this).prop("checked", false)
		})
	}catch(err){
		emitirErrorCatch(err, "reiniciarRadionButtons")
	}
}
function initActionsInUI(){
	try{
		$("input[name=tipoEmision]").change(
            function(){
			    var tipoEmision = $(this).val()
			    habilitarCamposPorTipoEmision(tipoEmision)
		    })
		$("#idBtnBuscar").click(buscar)
		$("#btnGuardar").click(guardar)
		$("#cmbEmpresas").change(function(){
			var idEmpresa = $(this).val()
			cargarCuotas(idEmpresa)
		})
        $("#RadioButton2").prop('disabled', true); //Temporalmente se deshabilita la emision de Facturas
        $("#wb_Text8").hide()
        $("#idFecha").hide() // Se usa el periodo de los ultimos 7 dias (26/03/19)
        $("#Eliminar").hide()
		//$("#idFecha").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	}catch(err){
		emitirErrorCatch(err, "initActionsInUI")
	}
}
function habilitarUIGuardar(){
	try{
		$("#idPanelGuardar").show()	
		$("#idDescripcionGlosa").focus()
	}catch(err){
		emitirErrorCatch(err, "habilitarUIGuardar")
	}
}
function cancelarOperacion(){
	try{
		$("#idBtnBuscar").val("Buscar")	
		$("#idBtnBuscar").unbind("click")
		$("#idBtnBuscar").click(buscar)
		initPantalla()
	}catch(err){
		emitirErrorCatch(err, "cancelarOperacion")
	}
}
function habilitarCancelar(){
	try{
		$("#idBtnBuscar").val("Cancelar")	
		$("#idBtnBuscar").unbind("click")
		$("#idBtnBuscar").click(cancelarOperacion)
	}catch(err){
		emitirErrorCatch(err, "habilitarCancelar")
	}
}
function buscar(){
	try{
        $("#idFecha").val('01/01/2019');  //Solo para cumplir con asignacion de valor

        if(validarCamposRequeridos("Layer1")){
			
			var tipoEmision = $("input[name=tipoEmision]:checked").val()
			
			switch(tipoEmision){
				case TIPO_EMISION_PERSONA:
					// verifica que el numero de CAT insertado sea valido:
					var nroCAT = $("#idNroCAT").val().trim()
					var parametros = "&nroCAT="+nroCAT
					DAO.consultarWebServiceGet("validarCATParaEmisionPorPersona", parametros, function(results){
						
						$.fancybox.close()
						if(results[0].CATPermitido==0){
							fancyAlert("CAT invalido!")
						}else{
							habilitarUIGuardar()
							habilitarCancelar()
						}
						
					})
					break;
				case TIPO_EMISION_EMPRESA:
					habilitarUIGuardar()
					habilitarCancelar()
					break;
				case TIPO_EMISION_MULTIPLES:
					habilitarUIGuardar()
					habilitarCancelar()
					break;
			}
		}		
	}catch(err){
		emitirErrorCatch(err, "buscar")
	}
}
function generarRegistros(){
	try{
		
	}catch(err){
		emitirErrorCatch(err, "generarRegistros")
	}
}
function procedeGuardar(textConfirm){
	try{
		fancyConfirm(textConfirm, function(rpta){
			if(rpta){				
				var tipoEmision = $("input[name=tipoEmision]:checked").val()
				var nroCAT = $("#idNroCAT").val()
				var idEmpresa = $("#cmbEmpresas").val()
				var idContratoRenovacion = $("#idNroCuota").val();
                //var fechaLimite = dateTimeFormat($("#idFecha").val())
				var descripcionGlosa = $("#idDescripcionGlosa").val()
				
				var parametros = "&tipoEmision="+tipoEmision+"&nroCAT="+nroCAT+"&idEmpresa="+idEmpresa+
					"&idContratoRenovacion="+idContratoRenovacion+"&descripcionGlosa="+descripcionGlosa
                //"&fechaLimite="+fechaLimite+ **Ya no se usa
				DAO.consultarWebServiceGet("guardarEmisionBVFACT", parametros,
                    function(data){
                        if(data[0]>0){
                            fancyAlertFunction("¡Operación exitosa!", function(){
                                cancelarOperacion()
                                window.open("/wbs_ventas?funcion=generarExcelBVFACTemporal&idRegistro="+data)
                            })
                        }else{
                            if(data[0].includes("NO SE ENCONTRARON CATS")){
                                fancyAlert(data[0])
                            }else{
                                fancyAlert("¡Operación exitosa!", function(){
                                    cancelarOperacion()
                                    window.open("/wbs_ventas?funcion=generarExcelBVFACTemporal&idRegistro="+data)
                                })
                            }
                        }
				    })
			}
		})
	}catch(err){
		emitirErrorCatch(err, "procedeGuardar")
	}
}
function guardar(){
	try{
		DAO.consultarWebServiceGet("getCantidadRegistrosTemporales", "", function(datos){
			var cantidad = datos[0].cantidad
			var textConfirm = "¿Desea proceder con la operación?" 
			if(cantidad>0){
				textConfirm = "¡Se borraran los registros temporales existentes!<br>"+textConfirm
			}
			procedeGuardar(textConfirm)
		})
			
	}catch(err){
		emitirErrorCatch(err, "guardar")
	}
}
function habilitarCamposPorTipoEmision(tipoEmision){
	try{
		// reinicia solo los input text & selects
		reiniciarOpcionesBusqueda()
		// activa campos:
		$("input."+tipoEmision+", select."+tipoEmision).each(function(){
			$(this).prop("disabled", false)
			$(this).attr("requerido", $(this).attr("name"))
		})
		$("select."+tipoEmision).select2()
		$($("input."+tipoEmision+", select."+tipoEmision).first()).focus()
		if(tipoEmision == TIPO_EMISION_EMPRESA){
			$("#cmbEmpresas").select2('open')
		}
		$("#idBtnBuscar").prop("disabled", false)
		
		
	}catch(err){
		emitirErrorCatch(err, "habilitarCamposPorTipoEmision")
	}
}
// carga las cuotas activas por cada contrato de cada empresa
function cargarCuotas(idEmpresa){
	try{
		if(idEmpresa!="" && idEmpresa!=null){
			var listaLocal = listaCuotas_porEmpresa[idEmpresa]
			if(listaLocal!=undefined && listaLocal!=null){
				agregarOpcionesToCombo("idNroCuota", listaLocal, campos_listaCuotas, true, true)
			}else{
				// obtiene la lista de cuotas de la BD
				var parametros = "&idEmpresa="+idEmpresa
				DAO.consultarWebServiceGet("getCuotasPorEmpresa", parametros, function(listaCuotasBD){
					for(var i=0; i<listaCuotasBD.length; i++){
						listaCuotasBD[i][campos_listaCuotas["keyValue"]] = "Contrato: "+LPAD(listaCuotasBD[i].idContrato.toString(), numeroLPAD)+",  cuota: "+listaCuotasBD[i].nroCuota
					}
					listaCuotas_porEmpresa[idEmpresa] = listaCuotasBD
					// carga el combobox
					agregarOpcionesToCombo("idNroCuota", listaCuotasBD, campos_listaCuotas, true, true)
					$.fancybox.close()
				})
			}
		}else{
			// carga el combobox vacio		
			agregarOpcionesToCombo("idNroCuota", [], campos_listaCuotas, true, true)
		}	
	}catch(err){
		emitirErrorCatch(err, "cargarCuotas")
	}
}
cargarInicio(function(){
	// carga el combobox de empresas:
	DAOT.consultarWebServiceGet("getEmpresasTransp", "", function(data){
		var campos =  {"keyId":'idEmpresaTransp', "keyValue":'nombreEmpresa'}
		agregarOpcionesToCombo("cmbEmpresas", data, campos);
		$("#cmbEmpresas").select2();
		initActionsInUI()
		initPantalla()
        $.fancybox.close()
	});	
})
