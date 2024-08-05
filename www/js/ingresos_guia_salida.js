var idGuia = 0;
var contadorId = 0;
var DAO = new DAOWebServiceGeT("wbs_ventas")
var accion = $_GET("accion");
var arrayDatos = [];
var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
var arrayUsuarios = [];
if(idPerfil!=1 && idPerfil!=2){
	idLocal = parent.idLocal;
}
var idUsuario = parent.idUsuario;
function soloArticulos(){
	try{
		var mostrarSoloArticulos = $("#idTipoArticulo").prop("checked");
		if(mostrarSoloArticulos){ 
			$("#idPanelVenta").css("display", "block");
			$("#idEfectuarVenta").prop("disabled", false);
		}else{
			$("#idPanelVenta").css("display", "none");
			$("#idEfectuarVenta").prop("checked", false);
		}
	}catch(err){
		emitirErrorCatch(err, "soloArticulos");
	}
}
cargarInicio(function(){
	
	$("#idPanelVenta").css("display", "none");
	$("#idTipoArticulo").change(soloArticulos);
	$("#idEsConcesionario").change(activarTipoUsuarios)
	/**CAMPOS REQUERIDOS**/
	$("#idFechaGuia").attr("requerido", "Fecha de Registro");
	$("#idCmbAlmacen").attr("requerido", "Almacen");
	$("#idCmbUsuarios").attr("requerido", "Usuario Responsable");
	/****/
	$("#idFechaGuia").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#idFechaGuia").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto    
	// Carga los comboboxes:
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getAlmacenesXlocal", parametros, function(arrayAlmacenes){
		var campos =  {"keyId":'idAlmacen', "keyValue":'nombreAlmacen'}
		agregarOpcionesToCombo("idCmbAlmacen", arrayAlmacenes, campos);
		$("#idCmbAlmacen").select2();
		var parametros="&idUsuario="+idUsuario+"&idLocal="+idLocal;
		DAO.consultarWebServiceGet("getUsuarios", parametros, function(arrayData){
			arrayUsuarios = arrayData;
			var campos =  {"keyId":'idUsuario', "keyValue":'nombreUsuario'}
			agregarOpcionesToCombo("idCmbUsuarios", arrayData, campos);
			$("#idCmbUsuarios").select2();
			$("#btnNuevo").click(nuevo);
			$("#btnEditar").click(editar);
			$("#btnEliminar").click(eliminar);
			$("#btnGuardar").click(guardar);
			// Aplica el plugin de DataTables JS
			aplicarDataTable();
			if(accion=='N'){				
				$.fancybox.close();
			}else{
				idGuia = $_GET("idGuia");
				var parametros = "&idGuia="+idGuia
				DAO.consultarWebServiceGet("getDetallesGuia", parametros, function(datos){
					$("#idFechaGuia").val(datos[0].fechaOperacion)
					$("#idCmbAlmacen").val(datos[0].idAlmacen)
					$("#idCmbAlmacen").select2();
					$("#idCmbUsuarios").val(datos[0].idUsuarioResp)
					$("#idCmbUsuarios").select2();
					
					var rptaDatos = datos[0].detalle;
					for(var i=0; i<rptaDatos.length; i++){
						var trFila = "<tr id='tr_"+rptaDatos[i].idDetalle+"' style='font-family: Arial; height: 30px; cursor: pointer; font-size: 12px;' onclick='seleccionarFila("+'"'+rptaDatos[i].idDetalle+'"'+")'>"+
							"<td style='text-align:center;'>"+rptaDatos[i].codArticulo+"</td>"+
							"<td style='text-align:left;'>"+rptaDatos[i].descArticulo+"</td>"+
							"<td style='text-align:center;'>"+rptaDatos[i].unidad+"</td>"+
							"<td style='text-align:center;'>"+rptaDatos[i].cantidad+"</td>"+
							"<td style='text-align:center;'>"+rptaDatos[i].nroInicio+"</td>"+
							"<td style='text-align:center;'>"+rptaDatos[i].nroFinal+"</td>"+
							"<td style='text-align:left;'>"+rptaDatos[i].observaciones+"</td>"+
						"</tr>";
						arrayDatos.push(rptaDatos[i]);
						$("#tabla_datos > tbody").append(trFila);
					}
					$(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
					$(":input").css("opacity", "0.65");					
					
					$("#idBtnAnular").click(function(){
						var arrayRegistros = parent.window.frames[0].arrayDatos[parent.window.frames[0].filaSeleccionada];
						anularGuia(arrayRegistros, function(){
							parent.window.frames[0].buscar();
							parent.$.fancybox.close();
						})
					});
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
function activarTipoUsuarios(){ // activa promotores o usuarios dependiendo si el destino de los certificados en un concesionario
	try{
		var arrayDatos = [];
		if($("#idEsConcesionario").prop("checked")){
			labelTextWYSG("wb_lblEsConcesionario", "Promotor :")
			for(var i=0; i<arrayUsuarios.length; i++){
				if(arrayUsuarios[i].idPromotor>0){
					arrayDatos.push(arrayUsuarios[i]);				
				}				
			}
		}else{
			labelTextWYSG("wb_lblEsConcesionario", "Usuario Responsable :")
			arrayDatos = arrayUsuarios;
		}
		var campos =  {"keyId":'idUsuario', "keyValue":'nombreUsuario'}
		agregarOpcionesToCombo("idCmbUsuarios", arrayDatos, campos);
				
	}catch(err){
		emitirErrorCatch(err, "activarTipoUsuarios");
	}
}

function aplicarDataTable(){
	try{
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{campo:'codigo', alineacion:'center'},
			{campo:'descripcionArticulo', alineacion:'left'},
			{campo:'unidad', alineacion:'center'},
			{campo:'cantidad', alineacion:'center'},
			{campo:'nroInicio', alineacion:'center'},
			{campo:'nroFin', alineacion:'center'},
			{campo:'Observaciones', alineacion:'left'}
		];
		var columns=[
			{"width": "10%"},
			{"width": "25%"},
			{"width": "5%"},
			{"width": "5%"},
			{"width": "12%"},
			{"width": "15"},
			{"width": "28%"}
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
						"tipo":"SAL",
						"fecha":dateTimeFormat($("#idFechaGuia").val()),
						"almacen":$("#idCmbAlmacen").val(),
						"idUsuarioDestino":$("#idCmbUsuarios").val(),
						"idUsuario":parent.idUsuario,
						"detalle": arrayDatos,
						"esVenta":$("#idEfectuarVenta").prop("checked")
					}
					DAO.consultarWebServicePOST(parametrosPOST, "guardarGuia", function(data){
						if(data[0]>0){
							fancyAlertFunction("¡Guia ingresada correctamente (ID = "+data[0]+")!", function(){
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
function editar(){
	try{
		if(filaSeleccionada!=undefined){
			var idDetalle = filaSeleccionada;
			var idAlmacen = $("#idCmbAlmacen").val();
			abrirVentanaFancyBox(730, 265, "nuevo_editar_detalle_guia?accion=E&tipo=SAL&idDetalle="+idDetalle+"&idAlmacen="+idAlmacen, true, function(rptaDatos){
				var idDetalle = rptaDatos[0].idDetalle;
				$("#tr_"+idDetalle).find("td").eq(0).html(rptaDatos[0].codArticulo);
				$("#tr_"+idDetalle).find("td").eq(1).html(rptaDatos[0].descArticulo);
				$("#tr_"+idDetalle).find("td").eq(2).html(rptaDatos[0].unidad);
				$("#tr_"+idDetalle).find("td").eq(3).html(rptaDatos[0].cantidad);
				$("#tr_"+idDetalle).find("td").eq(4).html(rptaDatos[0].nroInicio);
				$("#tr_"+idDetalle).find("td").eq(5).html(rptaDatos[0].nroFinal);
				$("#tr_"+idDetalle).find("td").eq(6).html(rptaDatos[0].observaciones);			
				
				for(var i=0; i<arrayDatos.length; i++){
					if(arrayDatos[i].idDetalle == idDetalle){
						arrayDatos[i].codArticulo = rptaDatos[0].codArticulo
						arrayDatos[i].descArticulo = rptaDatos[0].descArticulo
						arrayDatos[i].unidad = rptaDatos[0].unidad
						arrayDatos[i].cantidad = rptaDatos[0].cantidad
						arrayDatos[i].nroInicio = rptaDatos[0].nroInicio
						arrayDatos[i].nroFinal = rptaDatos[0].nroFinal
						arrayDatos[i].observaciones = rptaDatos[0].observaciones
						break;
					}				
				}
				
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
		var idAlmacen = $("#idCmbAlmacen").val();
		if(idAlmacen!=""){
			abrirVentanaFancyBox(730, 265, "nuevo_editar_detalle_guia?accion=N&tipo=SAL&idDetalle="+contadorId+"&idAlmacen="+idAlmacen, true, function(rptaDatos){
				// agrega el detalle en la grilla:
				var trFila = "<tr id='tr_"+rptaDatos[0].idDetalle+"' style='font-family: Arial; height: 30px; cursor: pointer; font-size: 12px;' onclick='seleccionarFila("+'"'+rptaDatos[0].idDetalle+'"'+")'>"+
					"<td style='text-align:center;'>"+rptaDatos[0].codArticulo+"</td>"+
					"<td style='text-align:left;'>"+rptaDatos[0].descArticulo+"</td>"+
					"<td style='text-align:center;'>"+rptaDatos[0].unidad+"</td>"+
					"<td style='text-align:center;'>"+rptaDatos[0].cantidad+"</td>"+
					"<td style='text-align:center;'>"+rptaDatos[0].nroInicio+"</td>"+
					"<td style='text-align:center;'>"+rptaDatos[0].nroFinal+"</td>"+
					"<td style='text-align:left;'>"+rptaDatos[0].observaciones+"</td>"+
				"</tr>";
				arrayDatos.push(rptaDatos[0]);
				$("#tabla_datos > tbody").append(trFila);
				$("#idCmbAlmacen").prop("disabled", true);
				$("#idTipoArticulo").prop("disabled", true);
				$("#idEfectuarVenta").prop("disabled",true);
			});
		}else{
			fancyAlertFunction("¡Debe seleccionar un Almacen!", function(){
				$("#idCmbAlmacen").select2("open");
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
				$("#idCmbAlmacen").prop("disabled", false);
				$("#idTipoArticulo").prop("disabled", false);
				$("#idEfectuarVenta").prop("disabled", false);
			}
		}else{
			fancyAlert("¡Debe seleccionar un Detalle!");
		}		
	}catch(err){
		emitirErrorCatch(err, "eliminar")
	}
}