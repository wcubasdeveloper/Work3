var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){
	idLocal = parent.idLocal;
}
var idLiquidacion = 0;
var contadorId = 0;
var DAO = new DAOWebServiceGeT("wbs_ventas")
var accion = $_GET("accion");
var arrayDatos = [];
var idUsuario = parent.idUsuario;
cargarInicio(function(){
	$("#idFechaLiquidacion").attr("requerido", "Fecha de Registro");
	$("#idCmbConcesionario").attr("requerido", "Concesionario");
	$("#idCmbPromotor").attr("requerido", "Promotor");
	$("#nroLiquidacion").attr("requerido", "Nro de Liquidación");
	
	$("#idFechaLiquidacion").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#idFechaLiquidacion").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto	
	
	$("#idTotalCosto").prop("readonly", true);
	$("#idTotalComision").prop("readonly", true);
	$("#idTotalRecibido").prop("readonly", true);
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getAllConcesionarios", parametros, function(data){
		var campos =  {"keyId":'idConcesionario', "keyValue":'nombreCompuesto'}
		agregarOpcionesToCombo("idCmbConcesionario", data, campos);
		$("#idCmbConcesionario").select2();
		
		var parametros = "&idLocal="+idLocal;
		DAO.consultarWebServiceGet("getPromotores", parametros, function(arrayUsuarios){ // obtiene los promotores segun el local
			var campos =  {"keyId":'idPromotor', "keyValue":'nombreUsuario'}
			agregarOpcionesToCombo("idCmbPromotor", arrayUsuarios, campos);
			$("#idCmbPromotor").select2();			
			$("#btnNuevo").click(nuevo);
			$("#btnEditar").click(editar);
			$("#btnEliminar").click(eliminar);
			$("#btnGuardar").click(guardar);
			aplicarDataTable();
			actualizarTotales();
			if(accion=='N'){				
				$.fancybox.close();
			}else{ // VISTA
				idLiquidacion = $_GET("idLiquidacion");
				var parametros = "&idLiquidacion="+idLiquidacion
				DAO.consultarWebServiceGet("getDetallesLiquidacion", parametros, function(datos){
					$("#idFechaLiquidacion").val(datos[0].fechaLiquidacion);						
					$("#idCmbConcesionario").val(datos[0].idConcesionario)
					$("#idCmbConcesionario").select2();
					$("#nroLiquidacion").val(datos[0].nroLiquidacion)
					$("#idCmbPromotor").val(datos[0].idUsuarioResp)
					$("#idCmbPromotor").select2();
					var rptaDatos = datos[0].detalle;
					for(var i=0; i<rptaDatos.length; i++){
						rptaDatos[i].precioVentaSoles = "S/. "+rptaDatos[i].precio;
						rptaDatos[i].comisionSoles = "S/. "+rptaDatos[i].comision;
						var trFila = "<tr id='tr_"+rptaDatos[i].idDetalle+"' style='font-family: Arial; height: 30px; cursor: pointer; font-size: 12px;' onclick='seleccionarFila("+'"'+rptaDatos[i].idDetalle+'"'+")'>"+
							"<td style='text-align:center;'>"+rptaDatos[i].nroCertificado+"</td>"+
							"<td style='text-align:left;'>"+rptaDatos[i].claseVehiculo+"</td>"+
							"<td style='text-align:center;'>"+rptaDatos[i].precioVentaSoles+"</td>"+
							"<td style='text-align:center;'>"+rptaDatos[i].comisionSoles+"</td>"+
							"<td style='text-align:center;'>S/. "+(rptaDatos[i].precio-rptaDatos[i].comision)+"</td>"+
						"</tr>";
						arrayDatos.push(rptaDatos[i]);
						$("#tabla_datos > tbody").append(trFila);
					}
					$(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
					$(":input").css("opacity", "0.65");
					actualizarTotales();
					
					$("#idBtnAnular").click(anularLiquidacion);
					$("#btnEliminar").css("display", "none");
					$("#btnEditar").css("display", "none");
					$("#btnNuevo").css("display", "none");
					$("#idBtnAnular").css("display", "block");
					$("#idBtnAnular").prop("disabled", false);
					$("#idBtnAnular").css("opacity", "1.00");
					
					$.fancybox.close();
				});
			}
		});
	});
});
function aplicarDataTable(){
	try{
		for(var i=0; i<arrayDatos.length; i++){
			arrayDatos[i].montoRecibido = parseFloat(arrayDatos[i].precioVentaSoles)-parseFloat(arrayDatos[i].comisionSoles);
		}
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{campo:'nroCertificado', alineacion:'center'},
			{campo:'claseVehiculo', alineacion:'center'},
			{campo:'precioVentaSoles', alineacion:'center'},
			{campo:'comisionSoles', alineacion:'center'},
			{campo:'montoRecibido', alineacion:'center'}
		];
		var columns=[
			{"width": "19%"},
			{"width": "36%"},
			{"width": "15%"},
			{"width": "15%"},
			{"width": "15%"}
		];
		crearFilasHTML("tabla_datos", arrayDatos, camposAmostrar, true, 12); // crea la tabla HTML
		parseDataTable("tabla_datos", columns, 275, false, false, false, false, function(){
            if($("#tabla_datos > tbody >tr").length==1 && $("#tabla_datos > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_datos > tbody").html("");
            }
		});		
		$.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "aplicarDataTable");
	}
}
function guardar(){// guarda las guias
	try{
		if(validarCamposRequeridos("idPanel")){
			if($("#tabla_datos > tbody >tr").length>0){
				fancyConfirm("¿Continuar con la operación?", function(rpta){
					var parametrosPOST = {
						"fecha":dateTimeFormat($("#idFechaLiquidacion").val()),
						"concesionario":$("#idCmbConcesionario").val(),
						"nroLiquidacion":$("#nroLiquidacion").val(),
						"idPromotor":$("#idCmbPromotor").val(),
						"idUsuario":parent.idUsuario,					
						"detalles": arrayDatos
					}
					DAO.consultarWebServicePOST(parametrosPOST, "guardarLiquidacion", function(data){
						if(data[0]>0){
							fancyAlertFunction("Liquidación ingresada correctamente (ID = "+data[0]+")", function(){
								realizoTarea=true;
								parent.$.fancybox.close();
							})
						}					
					});
				});			
			}else{
				fancyAlert("¡Debe ingresar al menos un detalle!")
			}			
		}		
	}catch(err){
		emitirErrorCatch(err, "guardar")
	}
}
function actualizarTotales(){
	try{
		var totalPrecio = 0;
		var totalComision = 0;
		for(var i=0; i<arrayDatos.length; i++){
			totalPrecio = totalPrecio + parseInt(arrayDatos[i].precio);
			totalComision = totalComision + parseInt(arrayDatos[i].comision);
		}
		$("#idTotalCosto").val("S/. "+totalPrecio);
		$("#idTotalComision").val("S/. "+totalComision);
		$("#idTotalRecibido").val("S/. "+(totalPrecio-totalComision));
	}catch(err){
		emitirErrorCatch(err, "actualizarTotales");
	}
}
function editar(){
	try{
		if(filaSeleccionada!=undefined){
			var idDetalle = filaSeleccionada;
			var idConcesionario = $("#idCmbConcesionario").val();
			abrirVentanaFancyBox(730, 265, "nuevo_editar_detalle_certificado?accion=E&idDetalle="+idDetalle+"&idConcesionario="+idConcesionario, true, function(rptaDatos){
				var idDetalle = rptaDatos[0].idDetalle;
				$("#tr_"+idDetalle).find("td").eq(0).html(rptaDatos[0].nroCertificado);
				$("#tr_"+idDetalle).find("td").eq(1).html(rptaDatos[0].claseVehiculo);
				$("#tr_"+idDetalle).find("td").eq(2).html(rptaDatos[0].precioVentaSoles);
				$("#tr_"+idDetalle).find("td").eq(3).html(rptaDatos[0].comisionSoles);		
				
				for(var i=0; i<arrayDatos.length; i++){
					if(arrayDatos[i].idDetalle == idDetalle){
						arrayDatos[i].nroCertificado = rptaDatos[0].nroCertificado
						arrayDatos[i].idClaseVehiculo = rptaDatos[0].idClaseVehiculo
						arrayDatos[i].claseVehiculo = rptaDatos[0].claseVehiculo
						arrayDatos[i].precio = rptaDatos[0].precio
						arrayDatos[i].comision = rptaDatos[0].comision
						arrayDatos[i].precioVentaSoles = rptaDatos[0].precioVentaSoles
						arrayDatos[i].comisionSoles = rptaDatos[0].comisionSoles
						break;
					}				
				}
				actualizarTotales();				
			});			
		}else{
			fancyAlert("¡Debe seleccionar un Detalle!");
		}		
	}catch(err){
		emitirErrorCatch(err, "editar")
	}
}
function nuevo(){
	try{
		contadorId++;
		var idConcesionario = $("#idCmbConcesionario").val();
		if(idConcesionario!=""){			
			abrirVentanaFancyBox(730, 265, "nuevo_editar_detalle_certificado?accion=N&idDetalle="+contadorId+"&idConcesionario="+idConcesionario, true, function(rptaDatos){
				// agrega el detalle en la grilla:
				var trFila = "<tr id='tr_"+rptaDatos[0].idDetalle+"' style='font-family: Arial; height: 30px; cursor: pointer; font-size: 12px;' onclick='seleccionarFila("+'"'+rptaDatos[0].idDetalle+'"'+")'>"+
					"<td style='text-align:center;'>"+rptaDatos[0].nroCertificado+"</td>"+
					"<td style='text-align:left;'>"+rptaDatos[0].claseVehiculo+"</td>"+
					"<td style='text-align:center;'>"+rptaDatos[0].precioVentaSoles+"</td>"+
					"<td style='text-align:center;'>"+rptaDatos[0].comisionSoles+"</td>"+
					"<td style='text-align:center;'>S/. "+(rptaDatos[0].precio-rptaDatos[0].comision)+"</td>"+
				"</tr>";
				
				arrayDatos.push(rptaDatos[0]);
				$("#tabla_datos > tbody").append(trFila);
				$("#idCmbConcesionario").prop("disabled", true);
				actualizarTotales();
			});
		}else{
			fancyAlertFunction("¡Debe seleccionar un Concesionario!", function(){
				$("#idCmbConcesionario").select2("open");
			})
		}
	}catch(err){
		emitirErrorCatch(err, "nuevo")
	}
}
function eliminar(){
	try{
		if(filaSeleccionada!=undefined){
			// elimina el detalle en el array:
			for(var i=0; i<arrayDatos.length; i++){
				if(arrayDatos[i].idDetalle==filaSeleccionada){
					arrayDatos.splice(i,1);
					$("#tr_"+filaSeleccionada).remove();
					break;
				}
			}
			if($("#tabla_datos > tbody >tr").length == 0){
				$("#idCmbConcesionario").prop("disabled", false);
			}
			actualizarTotales();
		}else{
			fancyAlert("¡Debe seleccionar un Detalle!");
		}		
	}catch(err){
		emitirErrorCatch(err, "eliminar")
	}
}
function anularLiquidacion(){
	try{
		fancyConfirm("¿Desea continuar con la operación?", function(rpta){
			if(rpta){
				var listaCertificados = [];
				for(var i=0; i<arrayDatos.length; i++){
					listaCertificados.push(arrayDatos[i].nroCertificado);
				}
				var parametros = {
					"idLiquidacion":idLiquidacion,
					"listaCertificados":listaCertificados
				}
				DAO.consultarWebServicePOST(parametros, "anularLiquidacion", function(data){
					if(data[0]==false){
						var certificadosVendidos = data[1];
						fancyAlert("¡El certificado "+certificadosVendidos[0].nroCAT+" ya ha sido vendido!")
					}else{				
						fancyAlertFunction("¡La liquidación fue anulada correctamente!", function(){
							parent.window.frames[0].buscar();
							parent.$.fancybox.close();
						});				
					}
				});
			}
		});		
	}catch(err){
		emitirErrorCatch(err, "anularLiquidacion")
	}
}