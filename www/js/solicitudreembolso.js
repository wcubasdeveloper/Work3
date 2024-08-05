// Variables Globales
// Dinamica
var idEventoExpediente = 0;
var idAgraviadoExpediente = 0;
var idPersonaTramitante=0;
cargarInicio(function(){
	/*// cargar fecha expediente
		$("#").val()
	// cargar Hora expediente
		$("#").val()
	// Cargar Datos del Usuario
		$("#").val()
		$("#").val()*/
	// Cargar evento change al combo tipo Expediente
		$("#idTipoExpediente").change(validarTipoSolicitud)
	// Cargar eventos Click a los botones
		$("#idBuscarEvento").click(buscarEventoXcod)
		$("#idBuscarPersona").click(buscarPersona)
		$("#idGuardarExpediente").click(registrarExpediente)
});
function validarTipoSolicitud(){
	try{
		var tipoExpediente=$("#idTipoExpediente").val();
		if(tipoExpediente!=''){
			$("#default_idTipoExpediente").remove(); // elimina la opcion x defecto ('Seleccione')
			// Reinicie valores globales 
			idEventoExpediente = 0;
			idAgraviadoExpediente = 0;
			idPersonaTramitante=0;
			// Reinicia campos Solicitud reembolso
			limpiarCamposSolicitud()
			limpiarOtrosDocumentos()
			limpiarPersonaTramitante()
			bloquearCamposPersona() // bloquea los campos de Nombres y Apellidos de la persona que tramita
			limpiarObservaciones()
		}else{
			alertFancy("Debe Seleccionar un tipo de expediente valido")
		}
	}catch(err){
		emitirErrorCatch(err, "validarTipoSolicitud")
	}
}
function limpiarCamposSolicitud(){
	try{
		$("#codEvento").val("")
		$("#idAsociado").val("")
		$("#idPlaca").val("")
		$("#idFechaAccidente").val("")
		$("#idLugarAccidente").val("")
		$("#idNroFolios_Solicitud").val("")
		$("#idNroExpPrevio").val("")
		$("#idComboAgraviado").append("<option value=''>Seleccione</option>")
		
	}catch(err){
		emitirErrorCatch(err, "limpiarCamposSolicitud")
	}
}
function limpiarOtrosDocumentos(){
	try{
		$("#idNroDocRef").val("")
		$("#idNroFolios_Otros").val("")
	}catch(err){
		emitirErrorCatch(err, "limpiarOtrosDocumentos")
	}
}
function limpiarPersonaTramitante(){
	try{
		$("#idNombres").val("")
		$("#idApellidos").val("")
		$("#idDNI").val("")
		$("#idTelef").val("")
		$("#idDireccion").val("")
	}catch(err){
		emitirErrorCatch(err, "limpiarPersonaTramitante")
	}
}
function limpiarObservaciones(){
	try{
		$("#idObservaciones").val("")
	}catch(err){
		emitirErrorCatch(err, "limpiarObservaciones")
	}
}
function registrarExpediente(){
	try{

	}catch(err){
		emitirErrorCatch(err, "registrarExpediente")
	}
} 
function bloquearCamposPersona(valor){ // funcion boleana sirve para bloquear o desbloquear los campos Nombres y Apellidos de una persona que tramita TRUE = Bloquea ; FALSE = Desbloquea
	try{
		if(valor==undefined){ // Valor x defecto
			valor=true;
		}
		$("#idNombres").prop("readonly", valor)
		$("#idApellidos").prop("readonly", valor)
	}catch(err){
		alertFancy(err, "bloquearCamposPersona")
	}
}
function buscarPersona(){
	try{
		var tipoExpedienteSeleccionado=$("#idTipoExpediente").val();
		if (tipoExpedienteSeleccionado!=""){
			var dni=$("#idDNI").val();
			if(dni!=''){
				var tamaño = dni.split('').length;
				if(tamaño==8){
					var parametros="&nroDoc="+dni;
					consultarWebServiceGet("getPersonaByNroDoc", parametros, function(data){
						try{
							var dni=$("#idDNI").val(); // vuelve a guardar el DNI antes de Limpiar el campo DNI
							limpiarPersonaTramitante(false) // Limpia todos los campos menos el DNI
							if(data.length>0){ // si se encontro persona muestra sus datos
								idPersonaTramitante=data[0].idPersona;
								$("#idNombres").val(data[0].nombres)
								$("#idApellidos").val(data[0].apellidoPaterno+' '+data[0].apellidoMaterno)
								$("#idTelef").val(data[0].telefonoMovil)
								$("#idDNI").val(data[0].nroDocumento)
								// compactando dirección de la persona:
								var direccion=quitarEspaciosBlanco(data[0].calle);
								if(quitarEspaciosBlanco(data[0].nro)!=""){
									direccion=direccion+' '+quitarEspaciosBlanco(data[0].nro);
								}
								if(quitarEspaciosBlanco(data[0].mzLote)!=""){
									direccion=direccion+" "+quitarEspaciosBlanco(data[0].mzLote);
								}
								if(quitarEspaciosBlanco(data[0].sector)!=""){
									direccion=direccion+" "+quitarEspaciosBlanco(data[0].sector);								
								}
								if(quitarEspaciosBlanco(data[0].referencia)!=""){
									direccion=direccion+" "+quitarEspaciosBlanco(data[0].referencia);								
								}
								$("#idDireccion").val(direccion)							
								bloquearCamposPersona() // Bloquea los campos nombres y apellidos para que no se puedan editar
							}else{
								idPersonaTramitante=0;
								$("#idDNI").val(dni)
								bloquearCamposPersona(false) // Desbloquea los campos Nombres y Apellidos para que pueda insertar
								$("#idNombres").focus()
							}
							$.fancybox.close()
						}catch(err){
							emitirErrorCatch(err, "buscarPersona - callback")
						}
					})
				}else{
					fancyAlertFunction("Formato DNI incorrecto", function(estado){
						if(estado){
							$("#idDNI").focus()
						}	
					})				
				}
			}else{
				fancyAlertFunction("Ingrese un Numero de DNI", function(estado){
					if(estado){
						$("#idDNI").focus()
					}	
				})
			}
		}else{
			fancyAlertFunction("Debe seleccionar un tipo de expediente", function(estado){
				if(estado){
					$("#idTipoExpediente").focus()
				}
			})	
		}		
	}catch(err){
		emitirErrorCatch(err, "buscarPersona")
	}
}
function buscarEventoXcod(){ // Busca evento por codigo del evento
	try{
		var tipoExpedienteSeleccionado=$("#idTipoExpediente").val();
		if (tipoExpedienteSeleccionado!=""){
			var tipoBusqueda="codEvento"; // Buscar evento x el campo 'codEvento'
			var parametros="&tipoBusqueda="+tipoBusqueda+"&codigo="+$("#codEvento").val();
			consultarWebServiceGet("getEventosGenerales", parametros, function(data){
				try{
					if(data.length>0){
						// muestra información del evento
						cargarInfoEvento(data);
						var codEvento=data[0].codEvento;
	        			buscarAgraviados(codEvento)
					}else{
						abrirBusquedaAvanzada(); // abre la busqueda avanzada
					}
				}catch(err){
					emitirErrorCatch(err, "callback-buscarEventoXcod")
				}
			})
		}else{
			fancyAlertFunction("Debe seleccionar un tipo de expediente", function(estado){
				if(estado){
					$("#idTipoExpediente").focus()
				}
			})			
		}
	}catch(err){
		emitirErrorCatch(err, "buscarEvento")
	}
}
function abrirBusquedaAvanzada(){ // abre ventana de busqueda avanzada
	try{
        abrirVentanaFancyBox("700", "500", "busqueda", true, function(data){
        	cargarInfoEvento(data);
        	var codEvento=data[0].codEvento;
        	buscarAgraviados(codEvento)
        });
	}catch(err){
		emitirErrorCatch(err, "abrirBusquedaAvanzada");
	}
}
function cargarInfoEvento(data){
	try{
		$("#codEvento").val(data[0].codEvento)		
		$("#idPlaca").val(data[0].placa)
		$("#idFechaAccidente").val(data[0].fechaAccidente)
		$("#idLugarAccidente").val(data[0].lugarAccidente)
		var nombreAsociado=quitarEspaciosBlanco(data[0].nombresAsociado)+" "+quitarEspaciosBlanco(data[0].apellidoPaternoAsociado)+" "+quitarEspaciosBlanco(data[0].apellidoMaternoAsociado)
		if(data[0].tipoAsociado=='J'){
			nombresAsociado=quitarEspaciosBlanco(data[0].razonSocial)
		}
		$("#idAsociado").val(nombresAsociado)
		$.fancybox.close()
	}catch(err){
		emitirErrorCatch(err, "cargarInfoEvento")
	}
}
function buscarAgraviados(codEvento){
	try{
		var parametros="&codEvento="+codEvento;
		consultarWebServiceGet("getAgraviados", parametros, cargarListaAgraviados, "Cargando Agraviados")
	}catch(err){
		emitirErrorCatch(err, "buscarAgraviados")
	}
}
function cargarListaAgraviados(data){
	try{
		$("#idComboAgraviado").html("<option value='' id='default_idComboAgraviado'>Seleccione</option>")
		for(var i=0; i<data.length; i++){
			$("#idComboAgraviado").append(new Option(quitarEspaciosBlanco(data[i].nombres)+' '+quitarEspaciosBlanco(data[i].apellidoPaterno)+' '+quitarEspaciosBlanco(data[i].apellidoMaterno), data[i].codAgraviado))
		}
		$.fancybox.close()
	}catch(err){
		emitirErrorCatch(err, "cargarListaAgraviados")
	}
}