var DAO = new DAOWebServiceGeT("wbs_ventas")
var accion = $_GET("accion");
var idDetalle = $_GET("idDetalle");
var idConcesionario = $_GET("idConcesionario");

cargarInicio(function(){
	// carga combobox de Articulos:
	/* CAMPOS REQUERIDOS EN EL FORMULARIO */
	$("#idNroCertificado").attr("requerido", "Nro Certificado");
	$("#idClaseVehiculo").attr("requerido", "Clase Vehiculo");
	$("#idPrecio").attr("requerido", "Precio");	
	$("#idComision").attr("requerido", "Comision");	
	
	/*************************************/		
	$("#idNroCertificado").addClass("solo-numero");
	$("#idPrecio").addClass("solo-numero");
	$("#idComision").addClass("solo-numero");
	$(".solo-numero").keypress(function(e){ // permite ingresar solo numeros
		return textNumber(e); 
	});

	$("#btnGuardar").click(guardarDetalle);
	var parametros = "&idConcesionario="+idConcesionario;
	DAO.consultarWebServiceGet("getCertificadosXconcesionarioId",parametros, function(results1){ // busca los certificados disponibles para vender
		var campos = {"keyId":'nroCertificado', "keyValue":'nroCertificado'}
		agregarOpcionesToCombo("idNroCertificado", results1, campos);
		$("#idNroCertificado").select2();
		DAO.consultarWebServiceGet("getAllClasesVehiculo", "", function(results){
			var campos =  {"keyId":'idClase', "keyValue":'nombreClase'}
			agregarOpcionesToCombo("idClaseVehiculo", results, campos);
			$("#idClaseVehiculo").select2();
			if(accion=='N'){ // Nuevo detalle
				$.fancybox.close();
			}else{ // Editar
				var arrayDetalles = parent.arrayDatos;
				for(var i=0; i<arrayDetalles.length; i++){
					if(arrayDetalles[i].idDetalle == idDetalle){
						$("#idNroCertificado").val(arrayDetalles[i].nroCertificado);
						$("#idNroCertificado").select2();
						$("#idClaseVehiculo").val(arrayDetalles[i].idClaseVehiculo);
						$("#idClaseVehiculo").select2();
						$("#idPrecio").val(arrayDetalles[i].precio);
						$("#idComision").val(arrayDetalles[i].comision);
						$.fancybox.close();
						break;
					}
				}
			}		
		});
	});	
})
function validarCATS_noRepetidos(){
	try{
		var nroCertificado = $("#idNroCertificado").val();
		var arrayArticulos = parent.arrayDatos;
		for(var i=0; i<arrayArticulos.length; i++){
			if(arrayArticulos[i].idDetalle!=idDetalle){ 
				if(arrayArticulos[i].nroCertificado == nroCertificado){
					fancyAlert("¡El CAT "+arrayArticulos[i].nroCertificado+" ya se encuentra ingresado en los detalles!");
					return false;
				}
			}
		}		
		return true;
	}catch(err){
		emitirErrorCatch(err, "validarCATS_noRepetidos");
	}
}
function verificarDisponibilidad(){ // verifica si el Certificado a vender se encuentra disponible
	try{
		var nroCertificado = $("#idNroCertificado").val();
		var parametros = "&nroCertificado="+nroCertificado;
		DAO.consultarWebServiceGet("verificarDiponibilidadVentaCAT", parametros, function(data){
			if(data.length==0){
				fancyAlert("¡El Nro. de certificado NO existe!");				
			}else{
				var perteneceConcesionario = false;
				for(var i=0; i<data.length; i++){
					if(data[i].idUbicacion==idConcesionario && data[i].tipOperacion=='E'){
						if(data[i].estado == 'A'){
							fancyAlert("El Certificado ha sido Anulado")
							perteneceConcesionario=true;
							break;
						}
						if(data[i].estado == 'R'){
							fancyAlert("El Certificado ha sido Robado")
							perteneceConcesionario=true;
							break;
						}if(data[i].estado == 'V'){
							fancyAlert("El Certificado ya ha sido Vendido")
							perteneceConcesionario=true;
							break;
						}else{
							if(data[i].fechaSalida==null){
								var registro = {
									idDetalle : idDetalle,
									nroCertificado : $("#idNroCertificado").val(),						
									idClaseVehiculo:$("#idClaseVehiculo").val(),
									claseVehiculo:$("#idClaseVehiculo option:selected").text(),
									precio:$("#idPrecio").val(),
									comision:$("#idComision").val(),				
									precioVentaSoles:"S/. "+$("#idPrecio").val(),
									comisionSoles:"S/. "+$("#idComision").val()
								};
								perteneceConcesionario=true;
								realizoTarea=true;
								rptaCallback = [registro];
								parent.$.fancybox.close();							
								break;
							}							
						}
					}
				}
				if(perteneceConcesionario==false){
					fancyAlert("¡ El certificado ingresado NO pertenece al concesionario !");
				}
			}
		});
	}catch(err){
		emitirErrorCatch(err, "verificarDisponibilidad");
	}
}
function guardarDetalle(){
	try{
		if(validarCamposRequeridos("idForm")){
			if(validarCATS_noRepetidos()){
				verificarDisponibilidad();
			}
		}		
	}catch(err){
		emitirErrorCatch(err, "guardarDetalle")
	}
}