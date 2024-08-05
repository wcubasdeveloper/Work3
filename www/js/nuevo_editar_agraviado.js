var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Agraviado";
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var arrayDepartamentos=new Array();
var idPersona=0;
var idDistrito='';
cargarInicio(function(){
	$("#idID").prop("disabled", true);
	$("#btnBuscarPersona").click(buscarPersona);
	$("#btnGuardar").click(guardar);
	$("#idTipoAgraviado").prepend("<option value='' selected>Seleccione</option>");
	$("#idFechaIngreso").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#idNombres").attr("requerido", "Nombres");
	$("#idApePat").attr("requerido", "Apellido Paterno");
	$("#idApeMat").attr("requerido", "Apellido Materno");
	$("#idDNI").attr("requerido", "DNI");
	$("#idDNI").attr("idPersona", "0")
	
	$("#idNombres").prop("disabled", true);
	$("#idApePat").prop("disabled", true);
	$("#idApeMat").prop("disabled", true);
	$("#idRazonSocial").prop("disabled", true);
    $("#idTelf").prop("disabled", true);
	$("#select_C").prop("disabled", true);
	$("#idDirec").prop("disabled", true);
	$("#nroCalle").prop("disabled", true);
	$("#nroLote").prop("disabled", true);
	$("#sector").prop("disabled", true);
	$("#referencia").prop("disabled", true);
	$("#telfijo").prop("disabled", true);
	$("#correo").prop("disabled", true);
	$("#idEdad").prop("disabled", true);
	// carga el plugin de distritos
	DAO.consultarWebServiceGet("getAllDistritos", "", function(datosDist){
		arrayDistritos=datosDist; // Guarda los distritos
		DAO.consultarWebServiceGet("getAllProvincias", "", function(datos){
			arrayProvincias=datos;
			DAO.consultarWebServiceGet("getAllDepartamentos", "", function(depas){
				arrayDepartamentos=depas;
				$("#select_C").change(function(){
					cargarProvinciasDep("C", idProvinciaSelect);
				});
				$("#btnCambiarProv_C").click(function(){
					cargarProvinciasDep("C", idProvinciaSelect, "button");
				});	
				cargarComboDistritos();
				// Carga la lista de nosocomios
				DAO.consultarWebServiceGet("getTipoAtencionList", "", function(listaTipoAsitencia){
					agregarOpcionesToCombo("idTipoAtencion", listaTipoAsitencia, {"keyId":"idTipoAtencion", "keyValue":"descripcion"});
					DAO.consultarWebServiceGet("getListaNosocomios", "", function(datos) {
						agregarOpcionesToCombo("idNosocomio", datos, {"keyId":"idNosocomio", "keyValue":"nombreNosocomio"});
						$("#idNosocomio").select2();
						// carga la lista de tipo de atencion
						if(idRegistro!="" && idRegistro!="0"){							
							$("#idID").val(idRegistro);
							cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
								if(data.length>0){
									// carga datos del agraviado.
									$("#idCodEvento").val(data[0].codEvento);
									$("#idCodEvento").prop("disabled", true);
									$("#idDiagnostico").val(data[0].diagnostico);
									$("#idTipoAgraviado").val(data[0].tipoAgraviado);
									$("#idNosocomio").val(data[0].idNosocomio);
									$("#idNosocomio").select2();
									$("#idTipoAtencion").val(data[0].idTipoAtencion);
									$("#idFechaIngreso").val(data[0].fechaIngreso);
									
									$("#idDNI").prop("disabled", true); 
									$("#idDNI").attr("idPersona", data[0].idPersona);
									$("#idNombres").prop("disabled", false);
									$("#idApePat").prop("disabled", false);
									$("#idApeMat").prop("disabled", false);
									$("#idNombres").focus();				
									$("#idTelf").prop("disabled", false);
									$("#select_C").prop("disabled", false);
									$("#idDirec").prop("disabled", false);
									$("#nroCalle").prop("disabled", false);
									$("#nroLote").prop("disabled", false);
									$("#sector").prop("disabled", false);
									$("#referencia").prop("disabled", false);
									$("#telfijo").prop("disabled", false);
									$("#correo").prop("disabled", false);
									$("#idEdad").prop("disabled", false);
									
									$("#idDNI").val(data[0].DNI);
									$("#idNombres").val(data[0].nombres);
									$("#idApePat").val(data[0].apellidoPaterno);
									$("#idApeMat").val(data[0].apellidoMaterno);
									$("#idEdad").val(data[0].edad);
									$("#idDirec").val(data[0].calle);
									$("#nroCalle").val(data[0].nro);
									$("#nroLote").val(data[0].mzLote);
									$("#sector").val(data[0].sector);
									$("#referencia").val(data[0].referencia);
									$("#telfijo").val(data[0].telefonoFijo);
									$("#idTelf").val(data[0].telefonoMovil);
									$("#correo").val(data[0].email);								
									cargarDistrito(data[0].distritoInicial);
									if(data[0].distritoInicial!=null && data[0].distritoInicial!=""){
										$("#select_C").val(data[0].distritoInicial);
										$("#select_C").select2();
									}									
									$("#btnBuscarPersona").unbind("click");
									$("#btnBuscarPersona").attr("onclick", "");
									$("#btnBuscarPersona").click(function(){
										cambiarDNI();
									});
									$("#btnBuscarPersona").val("Cambiar")
									$.fancybox.close();
								}else{
									fancyAlert("No se encontro el registro del agraviado")
								}								
							});
						}else{
							//$("#idID").css("display", "none");
							//$("#wb_lblID").css("display", "none");							
							$("#idID").focus();
							$("#idID").prop("disabled", false);
							$("#idID").prop("readonly", false)
							$.fancybox.close();
						}
					});					
				})				
			});
		});
	});
});
// busqueda una Persona por su DNI, donde tipoPersona = Flag
function buscarPersona(){
	try{
		var DNI = $("#idDNI").val();
		var cantidadDigitos = DNI.split("").length;
		if(cantidadDigitos == 8){
			var parametros = "&nroDoc="+DNI;
			DAO.consultarWebServiceGet("getPersonaByNroDoc", parametros, function(data){
                cargarResultPersona(data);
				$.fancybox.close();				
			});
		}else{
			fancyAlertFunction("¡ Formato de DNI incorrecto !", function(rpta){
				if(rpta){
					$("#idDNI").focus();
				}
			})
		}	
	}catch(err){
		emitirErrorCatch(err, "buscarPersona");
	}
}
// carga los resultados de la busqueda de una persona x su DNI
function cargarResultPersona(data){
	try{
		$("#idDNI").attr("idPersona", "0");
        if(data.length>0){ // encontro a la persona que se buscaba
			$("#idNombres").val(data[0].nombres);
			$("#idApePat").val(data[0].apellidoPaterno);
			$("#idApeMat").val(data[0].apellidoMaterno);						
            $("#idTelf").val(data[0].telefonoMovil);
            $("#idDirec").val(data[0].calle);
			$("#nroCalle").val(data[0].nro)
			$("#nroLote").val(data[0].mzLote)
			$("#sector").val(data[0].sector)
			$("#referencia").val(data[0].referencia)
			$("#telfijo").val(data[0].telefonoFijo)
			$("#correo").val(data[0].email)
			$("#idEdad").val(data[0].edad);
			$("#idDNI").attr("idPersona", data[0].idPersona);
			cargarDistrito(data[0].distritoInicial);
			if(data[0].distritoInicial!=null && data[0].distritoInicial!=""){
				$("#select_C").val(data[0].distritoInicial);
				$("#select_C").select2();
			}
			
		}
		$("#idDNI").prop("disabled", true); 
		$("#idNombres").prop("disabled", false);
		$("#idApePat").prop("disabled", false);
		$("#idApeMat").prop("disabled", false);
		$("#idNombres").focus();				
        $("#idTelf").prop("disabled", false);
        $("#select_C").prop("disabled", false);
		$("#idDirec").prop("disabled", false);
		$("#nroCalle").prop("disabled", false);
		$("#nroLote").prop("disabled", false);
		$("#sector").prop("disabled", false);
		$("#referencia").prop("disabled", false);
		$("#telfijo").prop("disabled", false);
		$("#correo").prop("disabled", false);
		$("#idEdad").prop("disabled", false);
		
		$("#btnBuscarPersona").unbind("click");
        $("#btnBuscarPersona").attr("onclick", "");
		$("#btnBuscarPersona").click(function(){
			cambiarDNI();
		});
		$("#btnBuscarPersona").val("Cambiar")
	}catch(err){
		emitirErrorCatch(err, "cargarResultPersona");
	}
}
function cargarDistrito(idDistrito){
	try{
		var idProvincia="P01";
        if(idDistrito!=null){
            for(var i=0; i<arrayDistritos.length; i++){
                if(arrayDistritos[i].idDistrito==idDistrito){
                    idProvincia=arrayDistritos[i].idProvincia;
                    break;
                }
            }
        }
		idProvinciaSelect = idProvincia;
        cargarDistritos("C", idProvincia);		
	}catch(err){
		emitirErrorCatch(err, "cargarDistrito");
	}
}
function cambiarDNI(){
	try{
		//Limpia los campos de la poliza y reincia los valores de busqueda
        $("#idDNI").attr("idPersona", "0");
        $("#idDNI").val("");
		$("#idNombres").val("");
		$("#idApePat").val("");
		$("#idApeMat").val("");        
        $("#idTelf").val("");
		$("#select_C").val("");
		$("#select_C").select2();
		$("#idDirec").val("");
		$("#nroCalle").val("")
		$("#nroLote").val("")
		$("#sector").val("")
		$("#referencia").val("")
		$("#telfijo").val("")
		$("#correo").val("")
		$("#idEdad").val("");
	    $("#idDNI").prop("disabled", false); 
		
		$("#idNombres").prop("disabled", true);
		$("#idApePat").prop("disabled", true);
		$("#idApeMat").prop("disabled", true);
		$("#idRazonSocial").prop("disabled", true);
        $("#idTelf").prop("disabled", true);
		$("#select_C").prop("disabled", true);
		$("#idDirec").prop("disabled", true);
		$("#nroCalle").prop("disabled", true);
		$("#nroLote").prop("disabled", true);
		$("#sector").prop("disabled", true);
		$("#referencia").prop("disabled", true);
		$("#telfijo").prop("disabled", true);
		$("#correo").prop("disabled", true);
		$("#idEdad").prop("disabled", true);
		
        $("#btnBuscarPersona").unbind("click");
        $("#btnBuscarPersona").attr("onclick", ""); // para los agraviados
		$("#btnBuscarPersona").val("Buscar")
		$("#btnBuscarPersona").click(function(){
			buscarPersona();
		});
		$("#idDNI").focus();
	}catch(err){
		emitirErrorCatch(err, "cambiarDNI");
	}
}
function cargarProvinciasDep(prefijo, idProvincia, button){
    try{
        var item=$("#select_"+prefijo).val();
        if(item=='OTRP' || button=="button"){ //Otra Provincia
            idProvinciaSelect=idProvincia;
            abrirVentanaFancyBox(400, 220, "provdepa", true, function(data){
                if(data!=undefined){
                    var idProvincia=data[0].provincia;
                    cargarDistritos(prefijo, idProvincia);
                }else{ // No se completo
                    $("select_"+prefijo).val("");
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "cargarProvinciasDep");
    }
}
function cargarDistritos(prefijo, idProvincia){
    try{
        $("#select_"+prefijo).html("");
        $("#select_"+prefijo).append(new Option("Seleccione", ""));
        for(var i=0; i<arrayDistritos.length; i++){
            if(arrayDistritos[i].idProvincia==idProvincia){
                $("#select_"+prefijo).append(new Option(arrayDistritos[i].nombre, arrayDistritos[i].idDistrito))
            }
        }
        $("#select_"+prefijo).append("<option value='OTRP'>Otra Provincia</option>"); // OTRP=Otra Provincia
        //$("#select_"+prefijo).select2();
        var nombreProvincia = "";
        var nombreDepartamento = "";
        for(var y=0; y<arrayProvincias.length; y++){
            if(arrayProvincias[y].idProvincia==idProvincia){
                nombreProvincia=arrayProvincias[y].nombreProvincia;
                for(var z=0; z<arrayDepartamentos.length;z++){
                    if(arrayDepartamentos[z].idDepartamento==arrayProvincias[y].idDepartamento){
                        nombreDepartamento=arrayDepartamentos[z].nombreDepartamento;
                        break;
                    }
                }
                break;
            }
        }
        $("#idDepProv_"+prefijo).val("Dpto: "+nombreDepartamento+", Prov: "+nombreProvincia);
    }catch(err){
        emitirErrorCatch(err, "cargarDistritos")
    }
}
var idProvinciaSelect="";
function cargarComboDistritos(){
    try{
		if(parseFloat(idRegistro)>0){
			var idProvincia="P01";
			if(idDistrito!=null || idDistrito!=''){
                for(var i=0; i<arrayDistritos.length; i++){
					if(arrayDistritos[i].idDistrito==idDistrito){
                        idProvincia=arrayDistritos[i].idProvincia;
                        break;
                    }
                }
            }
            idProvinciaSelect = idProvincia;
            cargarDistritos("C", idProvincia);
		}else{
			var idProvincia="P01";
            idProvinciaSelect = idProvincia;
            cargarDistritos("C", idProvincia);            
		}
    }catch(err){
        emitirErrorCatch(err, "cargarComboDistritos()")
    }
}
function guardar(){
	try{
		if(validarCamposRequeridos("idForm") && validarCamposRequeridos("Layer1")){
			// obtiene datos del formulario
			fancyConfirm("Desea proceder con la operacion", function(rpta){
				if(rpta){
					var parametros = "&idPersona="+$("#idDNI").attr("idPersona")+
						"&nombres="+$("#idNombres").val()+
						"&apellidoPaterno="+$("#idApePat").val()+
						"&apellidoMaterno="+$("#idApeMat").val()+
						"&nroDocumento="+$("#idDNI").val()+
						"&distrito="+$("#select_C").val()+
						"&calle="+$("#idDirec").val()+
						"&nro="+$("#nroCalle").val()+
						"&mzLote="+$("#nroLote").val()+
						"&sector="+$("#sector").val()+
						"&referencia="+$("#referencia").val()+
						"&telfijo="+$("#telfijo").val()+
						"&telmovil="+$("#idTelf").val()+
						"&correo="+$("#correo").val()+
						"&edad="+$("#idEdad").val()+
						"&codAgraviado="+$("#idID").val()+
						"&codEvento="+$("#idCodEvento").val()+
						"&diagnostico="+$("#idDiagnostico").val()+
						"&tipoAgraviado="+$("#idTipoAgraviado").val()+
						"&idNosocomio="+$("#idNosocomio").val()+
						"&tipoAtencion="+$("#idTipoAtencion").val()+
						"&fechaIngreso="+dateTimeFormat($("#idFechaIngreso").val())+
						"&esNuevo="+(($("#idID").prop("disabled")==true)?"F":"T");
					DAO.consultarWebServiceGet("guardarAgraviado", parametros, function(data){
						if(data[0]>0){
							realizoTarea = true;
							var mensaje = "?Se Registr? la informaci?n correctamente!";
							if(idRegistro!="0" && idRegistro!=""){
								mensaje = "?Se actualizar?n los cambios correctamente!"
							}
							fancyAlertFunction(mensaje, function(){
								parent.$.fancybox.close();
							})
						}else{
							fancyAlert("?Operaci?n Fallida!")
						}
					});					
				}
			});
		}		
	}catch(err){
		emitirErrorCatch(err, "guardar");
	}
}