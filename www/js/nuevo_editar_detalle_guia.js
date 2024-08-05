var tipoGuia = $_GET('tipo');
var DAO = new DAOWebServiceGeT("wbs_ventas")
var accion = $_GET("accion");
var idDetalle = $_GET("idDetalle");
var idAlmacen = $_GET("idAlmacen");
var soloArticulos = "";

cargarInicio(function(){
	// carga combobox de Articulos:
	/* CAMPOS REQUERIDOS EN EL FORMULARIO */
	$("#idCmbArticulo").attr("requerido", "Articulo");
	$("#idTipoUnidad").attr("requerido", "Unidad");
	$("#idCantidad").attr("requerido", "Cantidad");	
	/*************************************/	
	$("#idInicio").prop("readonly", true);
	$("#idInicio").addClass("solo-numero");
	$("#idCantidad").addClass("solo-numero");
	$(".solo-numero").keypress(function(e){ // permite ingresar solo numeros
		return textNumber(e, 0, this.value); 
	});
	$("#idInicio").keyup(cargarNumeroFin);
	$("#idCantidad").keyup(cargarNumeroFin);
	
	$("#idCmbArticulo").change(cargarFuncionalidadXarticulo);
	$("#btnGuardar").click(guardarDetalle);
	
	var parametros = "&idAlmacen="+idAlmacen;
	DAO.consultarWebServiceGet("getArticulosXalmacen", parametros, function(resultsArticulos){
		var resultsArt = [];
		for(var i=0; i<resultsArticulos.length; i++){
			if(tipoGuia=='SAL'){ // si es una guia de salida se verifica el tipo de articulos que se mostrara
				var soloArticulos = parent.$("#idTipoArticulo").prop("checked");
				if(soloArticulos){ // solo se muestren articulos NO CAT
					if(!resultsArticulos[i].descripcion.includes("--CAT--")){
						resultsArt.push(resultsArticulos[i]);
					}
				}else{ // se muestran solo articulos CAT
					if(resultsArticulos[i].descripcion.includes("--CAT--")){
						resultsArt.push(resultsArticulos[i]);
					}					
				}
			}else{
				resultsArt.push(resultsArticulos[i]);
			}
		}
		var campos =  {"keyId":'idArticulo', "keyValue":'descripcion'}
		agregarOpcionesToCombo("idCmbArticulo", resultsArt, campos);
		$("#idCmbArticulo").select2();		
		if(tipoGuia=='ING'){
			if(parent.$("#idCmbProveedor").val()!=""){ // proveedor seleccionado
				$("#wb_lblEstado").css("display", "none");
				$("#idEstado").css("display", "none");
			}else{ // No se ha seleccionado el proveedor
				$("#wb_lblEstado").css("display", "block");
				$("#idEstado").css("display", "block");
			}			
		}else{
			$("#wb_lblEstado").css("display", "none");
			$("#idEstado").css("display", "none");			
		}
		if(accion=='N'){ // Nuevo detalle
			$.fancybox.close();
			$("#idCmbArticulo").select2("open");
		}else{ // Editar
			var arrayDetalles = parent.arrayDatos;
			for(var i=0; i<arrayDetalles.length; i++){
				if(arrayDetalles[i].idDetalle == idDetalle){
					$("#idCmbArticulo").val(arrayDetalles[i].codArticulo);
					$("#idCmbArticulo").change();
					$("#idTipoUnidad").val(arrayDetalles[i].unidad);
					$("#idCantidad").val(arrayDetalles[i].cantidad);
					$("#idInicio").val(arrayDetalles[i].nroInicio);
					$("#idFin").val(arrayDetalles[i].nroFinal);
					$("#idObservacion").val(arrayDetalles[i].observaciones);
					if(arrayDetalles[i].estado=='A'){
						$("#idEstado").prop("checked", true);
					}					
					$.fancybox.close();
					break;
				}
			}
		}		
	});
})
function cargarFuncionalidadXarticulo(){
	try{
		var articulo = $("#idCmbArticulo").val();
		var esCAT = $("#idCmbArticulo option:selected").text().indexOf("[--CAT--]");
		if(articulo==''){
			fancyAlertFunction("¡Debe seleccionar un Articulo!", function(){
				$("#idCmbArticulo").select2("open");
			});
			return;
		}
		$("#idEstado").prop("checked", false);
		if(esCAT>=0){ // ES CAT
			$("#idInicio").attr("requerido", "Nro de Certificado de Inicio");			
			$("#idInicio").prop("readonly", false);
			$("#idCantidad").focus();
			$("#idEstado").val("");
			if(tipoGuia=='ING'){
				if(parent.$("#idCmbProveedor").val()!=""){ // proveedor seleccionado
					$("#wb_lblEstado").css("display", "none");
					$("#idEstado").css("display", "none");
				}else{ // No se ha seleccionado el proveedor
					$("#wb_lblEstado").css("display", "block");
					$("#idEstado").css("display", "block");
				}
			}else{
				$("#wb_lblEstado").css("display", "none");
				$("#idEstado").css("display", "none");
			}			
		}else{
			$("#idInicio").attr("requerido", "");
			$("#idInicio").prop("readonly", true);			
			$("#idInicio").val("");
			$("#idFin").val("");
			$("#idCantidad").focus();
			$("#wb_lblEstado").css("display", "none");
			$("#idEstado").css("display", "none");
		}		
	}catch(err){
		emitirErrorCatch(err, "cargarFuncionalidadXarticulo");
	}
}
function cargarNumeroFin(){// Carga el numero de cant final en funcion a la cantidad de articulos que se haya ingresado
	try{
		var nroCertif = $("#idInicio").val();
		var cantidad = $("#idCantidad").val();
		if(cantidad==""){
			cantidad=1;
		}
		nroCertif = parseInt(nroCertif);
		cantidad = parseInt(cantidad);	
		var nroFinal = nroCertif + cantidad-1;
		if(nroFinal+""=="NaN"){
			nroFinal="";
		}
		$("#idFin").val(nroFinal);		
	}catch(err){
		emitirErrorCatch(err, "cargarNumeroFin")
	}
}
function validarCATS_noRepetidos(){
	try{
		var listaCATS = [];
		var arrayArticulos = parent.arrayDatos;
		for(var i=0; i<arrayArticulos.length; i++){
			if(arrayArticulos[i].descArticulo.indexOf("[--CAT--]")>=0 && arrayArticulos[i].idDetalle!=idDetalle){ 
				for(y=arrayArticulos[i].nroInicio; y<=arrayArticulos[i].nroFinal;y++){
					listaCATS.push(y);
				}
			}
		}
		
		var continuar = true;
		var nroInicio=$("#idInicio").val();
		var nroFinal=$("#idFin").val();
					
		for(var i=parseInt(nroInicio); i<=parseInt(nroFinal); i++){
			for(var y=0; y<listaCATS.length; y++){
				if(listaCATS[y]==i){
					// CAT REPETIDO
					fancyAlert("¡El CAT "+i+" ya se encuentra ingresado en los detalles!");
					return false;
				}
			}
		}
		return true;
	}catch(err){
		emitirErrorCatch(err, "validarCATS_noRepetidos");
	}
}
function verficarDisponibilidadCATS(idAlmacen, tipo){ // tipo = "I = Si ingreso al almacen o S=si ya salio"
	try{		
		var parametros = "&nroInicio="+$("#idInicio").val()+
			"&nroFinal="+$("#idFin").val()+
			"&idAlmacen="+idAlmacen+
			"&idArticulo="+$("#idCmbArticulo").val()+
			"&tipo="+tipo;					
			if(tipo=='S'){
				var idProveedor = "";
				if(parent.$("#idCmbProveedor").length>0){
					idProveedor = parent.$("#idCmbProveedor").val();					
				}
				parametros=parametros+"&idProveedor="+idProveedor;
			}
		DAO.consultarWebServiceGet("verficarDisponibilidadCATS", parametros, function(data){
			var cantidadDetalle = parseInt($("#idCantidad").val());
			if(tipo=='I'){ // proviene de una guia de Ingreso				
				if(data.length==cantidadDetalle){
					var estado = "";
					if($("#idEstado").prop("checked")==true){
						estado="A";
					}
					var registro = {
						idDetalle : idDetalle,
						codArticulo:$("#idCmbArticulo").val(),
						descArticulo:$("#idCmbArticulo option:selected").text(),
						unidad:$("#idTipoUnidad").val(),
						cantidad:$("#idCantidad").val(),				
						nroInicio:$("#idInicio").val(),
						nroFinal:$("#idFin").val(),
						observaciones:$("#idObservacion").val(),
						estado:estado
					};							
					realizoTarea=true;
					rptaCallback = [registro];
					parent.$.fancybox.close();
								
				}else{	
					if(data.length>0){
						fancyAlertFunction("La cantidad de CATS a retirar, no esta disponible en stock (CATS disponibles del "+data[0].nroCertificado+" al "+data[data.length-1].nroCertificado+")", function(){
							$("#idCantidad").focus();
						});
					}else{
						fancyAlertFunction("¡No Existe ningun CAT Disponible!", function(){
							$("#idCantidad").focus();
						});
					}
												
				}
			}else{// proviene de una guia de salida:
				if(data.length==0){
					var estado = "";
					if($("#idEstado").prop("checked")==true){
						estado="A";
					}
					var registro = {
						idDetalle : idDetalle,
						codArticulo:$("#idCmbArticulo").val(),
						descArticulo:$("#idCmbArticulo option:selected").text(),
						unidad:$("#idTipoUnidad").val(),
						cantidad:$("#idCantidad").val(),				
						nroInicio:$("#idInicio").val(),
						nroFinal:$("#idFin").val(),
						observaciones:$("#idObservacion").val(),
						estado:estado
					};							
					realizoTarea=true;
					rptaCallback = [registro];
					parent.$.fancybox.close();
				}else{
					if(data[0]==false){
						if(data[1]=="No existe ningun registro de los CAT's"){
							if(tipoGuia=="ING"){
								if(parent.$("#idCmbProveedor").val()!=""){
									var estado = "";
									if($("#idEstado").prop("checked")==true){
										estado="A";
									}
									var registro = {
										idDetalle : idDetalle,
										codArticulo:$("#idCmbArticulo").val(),
										descArticulo:$("#idCmbArticulo option:selected").text(),
										unidad:$("#idTipoUnidad").val(),
										cantidad:$("#idCantidad").val(),				
										nroInicio:$("#idInicio").val(),
										nroFinal:$("#idFin").val(),
										observaciones:$("#idObservacion").val(),
										estado:estado
									};							
									realizoTarea=true;
									rptaCallback = [registro];
									parent.$.fancybox.close();
								}else{
									fancyAlert(data[1]);
								}
							}else{
								fancyAlert(data[1]);
							}
						}else{
							fancyAlert(data[1]);
						}				
					}else{
						if(data[0].idUbicacion == idAlmacen){
							if(data[0].fechaSalida==null){
								fancyAlert("¡El Certificado "+data[0].nroCertificado+", ya se ha sido ingresado en el almacen/concesionario seleccionado!");
							}else{
								if(data[0].estado=='A'){
									fancyAlert("¡El certificado "+data[0].nroCertificado+" ha sido anulado!");
								}
								if(data[0].estado=='R'){
									fancyAlert("¡El certificado "+data[0].nroCertificado+" ha sido robado!");
								}
								if(data[0].estado=='V'){
									fancyAlert("¡El certificado "+data[0].nroCertificado+" ha sido vendido!");
								}
							}							
						}else{
							if(data[0].fechaSalida==null){
								fancyAlert("¡El Certificado "+data[0].nroCertificado+", ya se ha ingresado en un Almacén!")
							}else{
								if(data[0].estado=='A'){
									fancyAlert("¡El certificado "+data[0].nroCertificado+" ha sido anulado!");
								}
								if(data[0].estado=='R'){
									fancyAlert("¡El certificado "+data[0].nroCertificado+" ha sido robado!");
								}
								if(data[0].estado=='V'){
									fancyAlert("¡El certificado "+data[0].nroCertificado+" ha sido vendido!");
								}
							}						
							
						}
					}										
				}
			}
		});
				
	}catch(err){
		emitirErrorCatch(err, "verficarDisponibilidadCATS");
	}
}
/*function verificarStokEnGuia(){
	try{
		var idUsuarioResp = parent.$("#cmbUsuario").val();
		var idGuia = parent.$("#cmbGuia").val();		
		var idArticulo = $("#idCmbArticulo").val();
		var arrayGuiasPorUsuarioResp = parent.arrayGuiasPorUsuarioResp;
		
		var stockGuia = 0;
		for(var i=0; i<arrayGuiasPorUsuarioResp.length; i++){							
			if(arrayGuiasPorUsuarioResp[i].idUsuario==idUsuarioResp){
				for(var y=0; y<arrayGuiasPorUsuarioResp[i].arrayGuias.length; y++){
					if(arrayGuiasPorUsuarioResp[i].arrayGuias[y].idGuia==idGuia){
						var guia_detalle = arrayGuiasPorUsuarioResp[i].arrayGuias[y].guia_detalle;
						for(z=0; z<guia_detalle.length; z++){
							if(guia_detalle[z].idArticulo==idArticulo){
								stockGuia= stockGuia+guia_detalle[z].cantidadPendienteSalida;
							}
						}
						break;
					}
				}								
				break;
			}
		}
		
		var arrayArticulos = parent.arrayDatos;
		var total = 0;
		for(var i=0; i<arrayArticulos.length; i++){
			if(arrayArticulos[i].codArticulo==idArticulo && arrayArticulos[i].idDetalle!=idDetalle){ // Suma el total de cada articulo ya ingresado anteriormente en los detalles. No se considerara la cantidad del mismo Detalle (En caso que sea una EDICION)
				total = total + parseInt(arrayArticulos[i].cantidad);
			}
		}			
		total = total + parseInt($("#idCantidad").val());
		
		if(total>stockGuia){
			fancyAlert("Cantidad insuficiente en la Guia (Stock en la Guia = "+stockGuia+")");
			return false;
		}
		return true;
	}catch(err){
		emitirErrorCatch(err, "verificarStokEnGuia");
	}
}*/
function validarStokArticulos(idAlmacen){ // validar el stock de articulos en el almacen (NO CATS)
	try{
		var total = 0;
		var idArticulo = $("#idCmbArticulo").val();
		var parametros = "&idArticulo="+idArticulo+"&idAlmacen="+idAlmacen;	
		
		DAO.consultarWebServiceGet("stockArticuloXalmacen", parametros, function(datos){
			
			var arrayArticulos = parent.arrayDatos;
			var idArticulo = $("#idCmbArticulo").val();
			for(var i=0; i<arrayArticulos.length; i++){
				if(arrayArticulos[i].codArticulo==idArticulo && arrayArticulos[i].idDetalle!=idDetalle){ // Suma el total de cada articulo ya ingresado anteriormente en los detalles. No se considerara la cantidad del mismo Detalle (En caso que sea una EDICION)
					total = total + parseInt(arrayArticulos[i].cantidad);
				}
			}
			
			total = total + parseInt($("#idCantidad").val());
			var stockActual = datos[0].stock;
			if(total>stockActual){
				fancyAlertFunction("El articulo "+$("#idCmbArticulo option:selected").text()+" tiene un stock de "+stockActual+" inferior a la CANTIDAD TOTAL que se desea registrar de "+total, function(){
					$("#idCantidad").focus();
				})
			}else{
				var registro = {
					idDetalle : idDetalle,
					codArticulo:$("#idCmbArticulo").val(),
					descArticulo:$("#idCmbArticulo option:selected").text(),
					unidad:$("#idTipoUnidad").val(),
					cantidad:$("#idCantidad").val(),				
					nroInicio:$("#idInicio").val(),
					nroFinal:$("#idFin").val(),
					observaciones:$("#idObservacion").val(),
					estado:""
				};
				realizoTarea=true;
				rptaCallback = [registro];
				parent.$.fancybox.close();
			}
		});		
	}catch(err){
		emitirErrorCatch(err, "validarStokArticulos");
	}
}
function guardarDetalle(){
	try{
		if(validarCamposRequeridos("idForm")){
			if(tipoGuia=='DIST'){
				var idConcesionario = $_GET('idConcesionario');
				var esCAT = $("#idCmbArticulo option:selected").text().indexOf("[--CAT--]");				
				if(esCAT>=0){// CAT
					if(validarCATS_noRepetidos()){
						verficarDisponibilidadCATS(idConcesionario,"S");			
					}										
				}else{ // cualquier otro articulo:
					var registro = {
						idDetalle : idDetalle,
						codArticulo:$("#idCmbArticulo").val(),
						descArticulo:$("#idCmbArticulo option:selected").text(),
						unidad:$("#idTipoUnidad").val(),
						cantidad:$("#idCantidad").val(),				
						nroInicio:$("#idInicio").val(),
						nroFinal:$("#idFin").val(),
						observaciones:$("#idObservacion").val(),
						estado:""
					};
					realizoTarea=true;
					rptaCallback = [registro];
					parent.$.fancybox.close();	
				}
			}
			else if(tipoGuia=='DEV'){
				var idConcesionario = $_GET('idConcesionario');
				var esCAT = $("#idCmbArticulo option:selected").text().indexOf("[--CAT--]");				
				if(esCAT>=0){// CAT
					if(validarCATS_noRepetidos()){
						verficarDisponibilidadCATS(idConcesionario,"I");			
					}										
				}else{ // cualquier otro articulo:
					var registro = {
						idDetalle : idDetalle,
						codArticulo:$("#idCmbArticulo").val(),
						descArticulo:$("#idCmbArticulo option:selected").text(),
						unidad:$("#idTipoUnidad").val(),
						cantidad:$("#idCantidad").val(),				
						nroInicio:$("#idInicio").val(),
						nroFinal:$("#idFin").val(),
						observaciones:$("#idObservacion").val(),
						estado:""
					};
					realizoTarea=true;
					rptaCallback = [registro];
					parent.$.fancybox.close();	
				}
			}
			else if(tipoGuia=='SAL'){ // Valida el stock en el almacen				
				var esCAT = $("#idCmbArticulo option:selected").text().indexOf("[--CAT--]");				
				if(esCAT>=0){// CAT
					if(validarCATS_noRepetidos()){
						verficarDisponibilidadCATS(idAlmacen,"I");			
					}										
				}else{ // cualquier otro articulo:
					validarStokArticulos(idAlmacen);
				}				
			}else{ // INGRESOS
				var idArticulo = $("#idCmbArticulo").val();
				var esCAT = $("#idCmbArticulo option:selected").text().indexOf("[--CAT--]");				
				// validar cantidad de articulos disponibles en la Guia:					
				if(esCAT>=0){// CAT
					if(validarCATS_noRepetidos()){
						verficarDisponibilidadCATS(idAlmacen,"S");
																
					}
				}else{
					var registro = {
						idDetalle : idDetalle,
						codArticulo:$("#idCmbArticulo").val(),
						descArticulo:$("#idCmbArticulo option:selected").text(),
						unidad:$("#idTipoUnidad").val(),
						cantidad:$("#idCantidad").val(),				
						nroInicio:$("#idInicio").val(),
						nroFinal:$("#idFin").val(),
						observaciones:$("#idObservacion").val(),
						estado:""
					};
					realizoTarea=true;
					rptaCallback = [registro];
					parent.$.fancybox.close();												
				}										
			}
		}		
	}catch(err){
		emitirErrorCatch(err, "guardarDetalle")
	}
}