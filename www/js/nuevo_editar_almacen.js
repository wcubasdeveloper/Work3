var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Almacen";
cargarInicio(function(){
	$("#btnGuardar").click(guardar);
	// consulta por los locales
	DAO.consultarWebServiceGet("getLocales", "", function(data){
		// carga la lista de locales
		agregarOpcionesToCombo("idLocal", data, {"keyId":"idLocal", "keyValue":"Nombre"});
		$("#idLocal").select2();
		DAO.consultarWebServiceGet("getUsuarios", "", function(dataUsuarios){
			// carga la lista de usuarios
			agregarOpcionesToCombo("idUsuario", dataUsuarios, {"keyId":"idUsuario", "keyValue":"nombreUsuario"});
			$("#idUsuario").select2();
			if(parseFloat(idRegistro)>0){
				$("#idID").val(idRegistro);
				cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
					if(data.length>0){
						$("#idNombreCompleto").val(data[0].nombreCompleto);
						$("#idNombreBreve").val(data[0].nombreBreve);
						$("#idUbicacion").val(data[0].ubicacion);
						$("#idLocal").val(data[0].idLocal);
						$("#idUsuario").val(data[0].responsable);
						$("#idLocal").select2();
						$("#idUsuario").select2();
						$.fancybox.close();
						$("#idNombreCompleto").focus();
					}else{
						fancyAlert("¡ ERROR, no se encontro información del registro !");
					}
				});
			}else{
				$("#idID").css("display", "none");
				$("#wb_lblID").css("display", "none");
				$.fancybox.close();
				$("#idNombreCompleto").focus();
			}
		})
	});
});
function guardar(){
	try{
		if(validarCamposRequeridos("idForm")){
			// obtiene datos del formulario
			fancyConfirm("¿Desea proceder con la operación?", function(rpta){
				if(rpta){
					var parametros = "&idNombreCompleto="+$("#idNombreCompleto").val()+
					"&idNombreBreve="+$("#idNombreBreve").val()+
					"&idUbicacion="+$("#idUbicacion").val()+
					"&idLocal="+$("#idLocal").val()+
					"&idUsuario="+$("#idUsuario").val()+
					"&idAlmacen="+idRegistro;					
					DAO.consultarWebServiceGet("guardarAlmacen", parametros, function(data){
						if(data[0]>0){
							realizoTarea = true;
							var mensaje = "¡Se Registró la información correctamente!";
							if(parseFloat(idRegistro)>0){
								mensaje = "¡Se actualizarón los cambios correctamente!"
							}
							fancyAlertFunction(mensaje, function(){
								parent.$.fancybox.close();
							})
						}else{
							fancyAlert("¡Operación Fallida!")
						}
					});
					
				}
			});			
		}		
	}catch(err){
		emitirErrorCatch(err, "guardar");
	}
}