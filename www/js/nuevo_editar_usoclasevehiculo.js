var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "UsoClaseVehiculo";
var idUso = parent.$("#idUso").val();
cargarInicio(function(){
	$("#btnGuardar").click(guardar);
	DAO.consultarWebServiceGet("getListaUso_Vehiculo", "", function(data){
		agregarOpcionesToCombo("idUso", data, {"keyId":"idUso", "keyValue":"nombreUso"});
		$("#idUso").find("option").eq(0).remove();
		var parametros = "&idUso="+idUso+"&idRegistro="+idRegistro;
		DAO.consultarWebServiceGet("getClasesPorAgregarAUso", parametros, function(data2){
			agregarOpcionesToCombo("idClase", data2, {"keyId":"idClase", "keyValue":"nombreClase"});
			if(parseFloat(idRegistro)>0){
				$("#idID").val(idRegistro);
				cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
					if(data.length>0){
						$("#idClase").val(data[0].idClase);
						$("#idUso").val(data[0].idUso);
						$("#idPrima").val(data[0].prima);
						$("#idMonto").val(data[0].montoPoliza);
						$("#idUso").prop("disabled", true)
						$.fancybox.close();						
					}else{
						fancyAlert("¡ ERROR, no se encontro información del registro !");
					}
				});
			}else{
				$("#idUso").val(idUso);
				$("#idUso").prop("disabled", true)
				$("#idID").css("display", "none");
				$("#wb_lblID").css("display", "none");
				$.fancybox.close();
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
					var parametros = "&idClase="+$("#idClase").val()+
					"&idUso="+$("#idUso").val()+
					"&prima="+$("#idPrima").val()+
					"&montoPoliza="+$("#idMonto").val()+
					"&idUsoClaseVehiculo="+idRegistro;
					
					DAO.consultarWebServiceGet("guardarUsoClaseVehiculo", parametros, function(data){
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
		emitirErrorCatch(err, "guardar")
	}
}