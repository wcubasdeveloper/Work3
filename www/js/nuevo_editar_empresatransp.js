var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "EmpresaTransp";
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var arrayDepartamentos=new Array();
var idPersona=0;
var idDistrito='';
var idRepresentante = 0;

cargarInicio(function(){
	$("#razonsocialEmpresa").attr("requerido", "Razon social de la empresa")
	$("#ruc").attr("requerido","RUC de la empresa")
	$("#btnGuardar").click(guardar);
	$("#idNombres").attr("class", "N_persona");
	$("#idApellidoPat").attr("class", "N_persona");
	$("#idApellidoMat").attr("class", "N_persona");
	$("#idRazonSocial").attr("class", "J_persona");
	DAO.consultarWebServiceGet("getAllDistritos", "", function(data){
		arrayDistritos=data; // Guarda los distritos
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
				$("#idTipoPersona").change(cargarTipoPersona)
				$("#idTipoPersona").change();
				if(parseFloat(idRegistro)>0){
					$("#idID").val(idRegistro);
					cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
						idDistrito = data[0].idDistrito;
						idPersona = data[0].idPersona
						
						$("#razonsocialEmpresa").val(data[0].razonSocial)
						$("#ruc").val(data[0].ruc)
						$("#idNombreCorto").val(data[0].nombreCorto)
						$("#nroResolucion").val(data[0].nroResolucion)
						$("#telefono").val(data[0].telefonoFijo)
						$("#select_C").val(data[0].idDistrito)
						$("#idCalle").val(data[0].calle)
						
						// carga representante legal
						if(data[0].idRepresentanteLegal>0){
							idRepresentante = data[0].idRepresentanteLegal
							$("#idTipoPersona").val(data[0].tipoPersona);
							$("#idTipoPersona").change();
							switch(data[0].tipoPersona){
								case 'N':
									$("#idNombres").val(data[0].nombres);
									$("#idApellidoPat").val(data[0].apellidoPaterno);
									$("#idApellidoMat").val(data[0].apellidoMaterno);
									break;
								case 'J':
									$("#idRazonSocial").val(data[0].razonSocialRepresentante)
									break;
							}
							
							$("#idNroDocumento").val(data[0].nroDocumento)							
						}
						
						$.fancybox.close();	
											
					})
				}else{
					$("#idID").css("display", "none");
					$("#wb_lblID").css("display", "none");
					$("#idTipoPersona").change()
					$("#razonsocialEmpresa").focus()
					$.fancybox.close();
				}
				$.fancybox.close();
			})
		});
	});
})
function guardar(){
	try{
		if(validarCamposRequeridos("idForm")){
			fancyConfirm("¿Desea proceder con la operación?", function(rpta){
				if(rpta){
					var parametros = "&idPersona="+idPersona+
						"&razonsocialEmpresa="+$("#razonsocialEmpresa").val()+
						"&ruc="+$("#ruc").val()+
						"&nombreCorto="+$("#idNombreCorto").val()+
						"&nroResolucion="+$("#nroResolucion").val()+
						"&telefonoFijo="+$("#telefono").val()+
						"&distrito="+$("#select_C").val()+
                        "&calle="+$("#idCalle").val()+
						
						"&idRepresentante="+idRepresentante+
                        "&tipoPersona="+$("#idTipoPersona").val()+
                        "&nombres="+$("#idNombres").val().trim()+
                        "&apellidoPaterno="+$("#idApellidoPat").val().trim()+
                        "&apellidoMaterno="+$("#idApellidoMat").val().trim()+
                        "&razonSocial="+$("#idRazonSocial").val().trim()+
                        "&nroDocumento="+$("#idNroDocumento").val()+
						
                        "&idEmpresaTransp="+idRegistro;
					DAO.consultarWebServiceGet("guardarEmpresaTransp", parametros, function(data){
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
			})
		}		
	}catch(err){
		emitirErrorCatch(err, "guardar")
	}
}
function cargarTipoPersona(){
	try{
		var tipo = $("#idTipoPersona").val();
		$("."+tipo+"_persona").prop("disabled", false)			
		var tipoOpuesto;
		if(tipo=='N'){
			tipoOpuesto='J';
			//$("#idNombres").attr("requerido", "Nombres")
			//$("#idApellidoPat").attr("requerido", "Apellido Paterno")
			//$("#idApellidoMat").attr("requerido", "Apellido Materno")
			//$("#idRazonSocial").attr("requerido", "")
			$("#idRazonSocial").val("")
			$("#idNombres").focus();
		}else{
			tipoOpuesto='N';
			//$("#idNombres").attr("requerido", "")
			$("#idNombres").val("")
			//$("#idApellidoPat").attr("requerido", "")
			$("#idApellidoPat").val("")
			//$("#idApellidoMat").attr("requerido", "")
			$("#idApellidoMat").val("")
			
			//$("#idRazonSocial").attr("requerido", "Razon Social")
			$("#idRazonSocial").focus();
		}
		$("."+tipoOpuesto+"_persona").prop("disabled",true)
	}catch(err){
		emitirErrorCatch(err, "cargarTipoPersona")
	}
}
// funciones de la carga de provincias, distritos
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