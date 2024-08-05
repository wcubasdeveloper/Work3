var idGuia = 0;
var contadorId = 0;
var DAO = new DAOWebServiceGeT("wbs_ventas")
var accion = $_GET("accion");
var arrayDatos = [];
var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){
	idLocal = parent.idLocal;
}
var idUsuario = parent.idUsuario;
var arrayGuiasPorUsuarioResp = [];
var idAlmacenOrigen = 0;
function validarAlmacenDestino(){
	try{
		var idAlmacen = $("#idCmbAlmacen").val();
		if(parseInt(idAlmacen)==parseInt(idAlmacenOrigen)){
			fancyAlertFunction("¡El Almacen de Destino no puede ser el mismo que el almacen de origen ("+$("#cmbGuia option:selected").text()+")!", function(){
				$("#idCmbAlmacen").val("")
				$("#idCmbAlmacen").select2();
				$("#idCmbAlmacen").select2("open");
			})
		}		
	}catch(err){
		emitirErrorCatch(err, "validarAlmacenDestino");
	}
}
function verificarTipoIngreso(){
	try{
		var tipoIngreso = $("#cmbTipoIngreso").val();
		if(tipoIngreso=='P'){// Proveedor
			$("#idCmbProveedor").attr("requerido", "Proveedor");
			$("#idCmbProveedor").prop("disabled", false);
			$("#idDocReferencia").attr("requerido", "Documento Referencia");
			$("#idDocReferencia").prop("disabled", false);
			$("#idOidAlmacenOrigenrdenCompra").attr("requerido", "");
			$("#idOrdenCompra").prop("disabled", false);
			// Desactiva los campos de tipo guia
			$("#cmbUsuario").attr("requerido", "");
			$("#cmbGuia").attr("requerido", "");
			$("#cmbUsuario").prop("disabled", true);
			$("#cmbGuia").prop("disabled", true);
			$("#cmbUsuario").val("");
			$("#cmbUsuario").select2();
			$("#cmbGuia").val("");
			$("#cmbGuia").select2();
			idAlmacenOrigen = 0;
		}else{ // Guia
			$("#idCmbAlmacen").val("");			
			$("#idCmbAlmacen").select2();
			$("#cmbUsuario").attr("requerido", "Usuario");
			$("#cmbGuia").attr("requerido", "Nro de Guia");
			$("#cmbUsuario").prop("disabled", false);
			$("#cmbGuia").prop("disabled", false);
			
			// Desactiva los campos de tipo Proveedor
			$("#idCmbProveedor").attr("requerido", "");
			$("#idDocReferencia").attr("requerido", "");
			$("#idOrdenCompra").attr("requerido", "");
			
			$("#idCmbProveedor").val("");
			$("#idCmbProveedor").prop("disabled", true);
			$("#idDocReferencia").val("");
			$("#idDocReferencia").prop("disabled", true);
			$("#idOrdenCompra").val("");
			$("#idOrdenCompra").prop("disabled", true);
			
			$("#idCmbProveedor").select2();
		}
		
	}catch(err){
		emitirErrorCatch(err, "verificarTipoIngreso");
	}
}
function cargarGuiasPorUsuario(callback){
	try{
		var idUsuario = $("#cmbUsuario").val();
		if(idUsuario!=""){
			var existeGuiasLocales = false;
			var arrayGuias = [];
			for(var i=0; i<arrayGuiasPorUsuarioResp.length; i++){
				if(arrayGuiasPorUsuarioResp[i].idUsuario == idUsuario){
					arrayGuias = arrayGuiasPorUsuarioResp[i].arrayGuias;
					existeGuiasLocales=true;
					break;
				}
			}
			if(existeGuiasLocales){
				var campos =  {"keyId":'idGuia', "keyValue":'descripcionGuia'}
				agregarOpcionesToCombo("cmbGuia", arrayGuias, campos);
				$("#cmbGuia").select2();
				$("#cmbGuia").select2("open");
				if(typeof callback == 'function'){
					callback();
				}
			}else{// Busca las guias
				var parametros = "&idUsuarioResp="+idUsuario;
				DAO.consultarWebServiceGet("getGuiasXusuarioResp", parametros, function(datos){
					arrayGuiasPorUsuarioResp.push({
						idUsuario:$("#cmbUsuario").val(),
						arrayGuias:datos
					})
					var campos =  {"keyId":'idGuia', "keyValue":'descripcionGuia'}
					agregarOpcionesToCombo("cmbGuia", datos, campos);
					$("#cmbGuia").select2();
					$.fancybox.close();
					$("#cmbGuia").select2("open");	
					if(typeof callback == 'function'){
						callback();
					}
				});			
			}
		}else{
			fancyAlertFunction("¡Debe seleccionar un Usuario!", function(){
				$("#cmbUsuario").select2("open");
			});
		}
	}catch(err){
		emitirErrorCatch(err, "cargarGuiasPorUsuario");
	}
}
var idGuiaTemporal;
cargarInicio(function(){
	/**CAMPOS REQUERIDOS**/
	$("#idFechaGuia").attr("requerido", "Fecha de Registro");
	$("#idCmbAlmacen").attr("requerido", "Almacen");	
	$("#cmbGuia").html("<option value=''>Seleccione</option>");
	$("#idOrdenCompra").html("<option value=''>Seleccione</option>"+$("#idOrdenCompra").html());
	/****/
	$("#idFechaGuia").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#idFechaGuia").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto    
	// Carga los comboboxes:
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getAlmacenesXlocal", parametros, function(arrayAlmacenes){
		var campos =  {"keyId":'idAlmacen', "keyValue":'nombreAlmacen'}
		agregarOpcionesToCombo("idCmbAlmacen", arrayAlmacenes, campos);
		$("#idCmbAlmacen").select2();
		DAO.consultarWebServiceGet("getProveedores", "", function(arrayProveedores){
			var campos =  {"keyId":'idProveedor', "keyValue":'nombreProveedor'}
			agregarOpcionesToCombo("idCmbProveedor", arrayProveedores, campos);
			$("#idCmbProveedor").select2();
			
			var parametros="&idUsuario="+idUsuario;
			DAO.consultarWebServiceGet("getUsuarios", parametros, function(arrayProveedores){
				var campos =  {"keyId":'idUsuario', "keyValue":'nombreUsuario'}
				agregarOpcionesToCombo("cmbUsuario", arrayProveedores, campos);
				$("#cmbUsuario").select2();
				
				$("#cmbTipoIngreso").change(function(){
					verificarTipoIngreso()
					if($("#cmbTipoIngreso").val()=='P'){
						$("#idCmbProveedor").select2()
						$("#idCmbProveedor").select2("open");
					}else{
						$("#cmbUsuario").select2();
						$("#cmbUsuario").select2("open");
					}
				});
				$("#cmbUsuario").change(cargarGuiasPorUsuario);
				$("#idCmbAlmacen").change(validarAlmacenDestino);
				$("#btnNuevo").click(nuevo);
				$("#btnEditar").click(editar);
				$("#btnEliminar").click(eliminar);
				$("#btnGuardar").click(guardar);
				$("#cmbGuia").change(function(){
					var idGuia = $("#cmbGuia").val();
					var idUsuarioResp = $("#cmbUsuario").val();
					if(idGuia!=""){
						for(var i=0; i<arrayGuiasPorUsuarioResp.length; i++){							
							if(arrayGuiasPorUsuarioResp[i].idUsuario==idUsuarioResp){
								for(var y=0; y<arrayGuiasPorUsuarioResp[i].arrayGuias.length; y++){
									if(arrayGuiasPorUsuarioResp[i].arrayGuias[y].idGuia==idGuia){
										idAlmacenOrigen = arrayGuiasPorUsuarioResp[i].arrayGuias[y].idAlmacen;
										break;
									}
								}								
								break;
							}
						}
					}else{
						idAlmacenOrigen=0;
					}					
				})
				verificarTipoIngreso();
				// Aplica el plugin de DataTables JS
					aplicarDataTable();
				if(accion=='N'){				
					$.fancybox.close();
				}else{ // VISTA:
					idGuia = $_GET("idGuia");
					var parametros = "&idGuia="+idGuia
					DAO.consultarWebServiceGet("getDetallesGuia", parametros, function(datos){
						$("#idFechaGuia").val(datos[0].fechaOperacion);						
						if(datos[0].idGuiaOrigen==""){
							$("#cmbTipoIngreso").val("P");
							$("#cmbTipoIngreso").change();
							$("#idCmbProveedor").val(datos[0].idProveedor)
							$("#idCmbProveedor").select2();
							$("#idDocReferencia").val(datos[0].docRefProveedor)
							$("#idOrdenCompra").val(datos[0].idOrdenCompra)
						}else{
							$("#cmbTipoIngreso").val("G");
							$("#cmbTipoIngreso").change();
							$("#cmbUsuario").val(datos[0].idUsuarioRespOrigen);
							$("#cmbUsuario").select2();
							idGuiaTemporal = datos[0].idGuiaOrigen;
							cargarGuiasPorUsuario(function(){
								$("#cmbGuia").val(idGuiaTemporal);
								$("#cmbGuia").select2();
							})							
						}
						$("#idCmbAlmacen").val(datos[0].idAlmacen)
						$("#idCmbAlmacen").select2();
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
						$.fancybox.close();
					})
				}
			});		
		});
	});
});
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
						"tipo":"ING",
						"fecha":dateTimeFormat($("#idFechaGuia").val()),
						"almacen":$("#idCmbAlmacen").val(),
						"proveedor":$("#idCmbProveedor").val(),
						"ordenCompra":$("#idOrdenCompra").val(),
						"docRef":$("#idDocReferencia").val(),
						"idUsuario":parent.idUsuario,
						"idAlmacenOrigen":idAlmacenOrigen,
						"idUsuarioRespOrigen":$("#cmbUsuario").val(),
						"idGuiaOrigen":$("#cmbGuia").val(),
						"detalle": arrayDatos
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
			var tipoIngreso = $("#cmbTipoIngreso").val();
			if(tipoIngreso=='G'){ // por Guia:
				var idGuia = $("#cmbGuia").val();
				if(idGuia==""){
					fancyAlert("¡Debe Seleccionar la guía de salida!")
					return;
				}else{
					/*var idUsuarioResp = $("#cmbUsuario").val();
					//var listaGuias;
					for(z=0; z<arrayGuiasPorUsuarioResp.length; z++){
						if(arrayGuiasPorUsuarioResp[z].idUsuario==idUsuarioResp)
					}= arrayGuiasPorUsuarioResp[idUsuarioResp];
					for(var y=0; y<listaGuias.length; y++){
						if(listaGuias[y].idGuia == idGuia){
							idAlmacenOrigen = listaGuias[y].idAlmacen;
							break;
						}
					}*/
				}
			}
			abrirVentanaFancyBox(730, 265, "nuevo_editar_detalle_guia?accion=E&idDetalle="+idDetalle+"&idAlmacen="+idAlmacen+"&idAlmacenOrigen="+idAlmacenOrigen+"&idGuia="+$("#cmbGuia").val(), true, function(rptaDatos){
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
			var tipoIngreso = $("#cmbTipoIngreso").val();
			if(tipoIngreso=='G'){ // por Guia:
				var idGuia = $("#cmbGuia").val();
				if(idGuia==""){
					fancyAlert("¡Debe Seleccionar la guía de salida!")
					return;
				}else{
					/*var idUsuarioResp = $("#cmbUsuario").val();
					var listaGuias = arrayGuiasPorUsuarioResp[idUsuarioResp];
					for(var y=0; y<listaGuias.length; y++){
						if(listaGuias[y].idGuia == idGuia){
							idAlmacenOrigen = listaGuias[y].idAlmacen;
							break;
						}
					}*/
				}
			}
			abrirVentanaFancyBox(730, 265, "nuevo_editar_detalle_guia?accion=N&idDetalle="+contadorId+"&idAlmacen="+idAlmacen+"&idAlmacenOrigen="+idAlmacenOrigen+"&idGuia="+$("#cmbGuia").val(), true, function(rptaDatos){
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
				$("#cmbTipoIngreso").prop("disabled", true);
				if($("#cmbTipoIngreso").val()=='G'){
					$("#cmbUsuario").prop("disabled", true);
					$("#cmbGuia").prop("disabled", true);
				}else{
					$("#idCmbProveedor").prop("disabled", true);
				}
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
				$("#cmbTipoIngreso").prop("disabled", false);
				if($("#cmbTipoIngreso").val()=='G'){
					$("#cmbUsuario").prop("disabled", false);
					$("#cmbGuia").prop("disabled", false);
				}else{
					$("#idCmbProveedor").prop("disabled", false);
				}
			}
		}else{
			fancyAlert("¡Debe seleccionar un Detalle!");
		}		
	}catch(err){
		emitirErrorCatch(err, "eliminar")
	}
}