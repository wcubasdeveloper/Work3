var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Proveedor";
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var arrayDepartamentos=new Array();
var idPersona=0;
var idDistrito='';
function cargarTipoProveedor(){
	var list = [
		{
			id: "C", value:"Clinica"
		},
		{
			id: "H", value:"Hospital"
		},
		{
			id: "F", value:"Funeraria"
		},
		{
			id: "O", value:"Otro"
		}
	]
	$("#idTipoProveedor").html("");
	agregarOpcionesToCombo("idTipoProveedor", list, {keyValue:"value", keyId:"id"});
}
function cargarTipoPersona(){
	try{
		var tipo = $("#idTipoPersona").val();
		$("."+tipo+"_persona").prop("disabled", false)			
		var tipoOpuesto;
		if(tipo=='N'){
			tipoOpuesto='J';
			$("#idNombres").attr("requerido", "Nombres")
			$("#idApellidoPat").attr("requerido", "Apellido Paterno")
			$("#idApellidoMat").attr("requerido", "Apellido Materno")
			$("#idRazonSocial").attr("requerido", "")
			$("#idRazonSocial").val("")
			$("#idNombres").focus();
		}else{
			tipoOpuesto='N';
			$("#idNombres").attr("requerido", "")
			$("#idNombres").val("")
			$("#idApellidoPat").attr("requerido", "")
			$("#idApellidoPat").val("")
			$("#idApellidoMat").attr("requerido", "")
			$("#idApellidoMat").val("")
			
			$("#idRazonSocial").attr("requerido", "Razon Social")
			$("#idRazonSocial").focus();
		}
		$("."+tipoOpuesto+"_persona").prop("disabled",true)
	}catch(err){
		emitirErrorCatch(err, "cargarTipoPersona")
	}
}
cargarInicio(function(){
	cargarTipoProveedor()
	$("#idUltimaCompra").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#btnGuardar").click(guardar);
	$("#idPromotor").html("<option value=''>Seleccione</option>")
	$("#idNombres").attr("class", "N_persona");
	$("#idApellidoPat").attr("class", "N_persona");
	$("#idApellidoMat").attr("class", "N_persona");
	$("#idRazonSocial").attr("class", "J_persona");
	// carga el plugin de distritos
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
								$("#idTipoPersona").val(data[0].tipoPersona);
								$("#idTipoPersona").change();
								switch(data[0].tipoPersona){
									case 'N':
										$("#idNombres").val(data[0].nombres);
										$("#idApellidoPat").val(data[0].apellidoPaterno);
										$("#idApellidoMat").val(data[0].apellidoMaterno);
										break;
									case 'J':
										$("#idRazonSocial").val(data[0].razonSocial)
										break;
								}
								$("#idNroDocumento").val(data[0].nroDocumento)
								
								$("#select_C").val(data[0].idDistrito)
								$("#idCalle").val(data[0].calle)
								$("#idTipoProveedor").val(data[0].tipoProveedor);
								$("#idUltimaCompra").val(data[0].fechaUltCompra)
								$.fancybox.close();
							});
						}else{
							$("#idID").css("display", "none");
							$("#wb_lblID").css("display", "none");
							var idSedeSeleccionada = parent.$("#idSede").val();
							$("#idLocal").val(idSedeSeleccionada);
							$("#idLocal").change();
							$("#idTipoPersona").change()
							$.fancybox.close();
						}
					
				
			});
		});
	});
});
function guardar(){
	try{
		if(validarCamposRequeridos("idForm")){
            // verifica si el nombre del proveedor existe:
            var persona = {
                tipoPersona:$("#idTipoPersona").val(),
                nombres:$("#idNombres").val().trim()+" "+$("#idApellidoPat").val().trim()+" "+$("#idApellidoMat").val().trim(),
                razonSocial:$("#idRazonSocial").val().trim(),
                idProveedor:idRegistro
            }
            validarNombreExistente(persona, function(listaProveedores){
                if(listaProveedores.length==0){
                    // obtiene datos del formulario
                    fancyConfirm("¿Desea proceder con la operación?", function(rpta){
                        if(rpta){
                            var parametros = "&idPersona="+idPersona+
                                "&tipoPersona="+$("#idTipoPersona").val()+
                                "&nombres="+$("#idNombres").val().trim()+
                                "&apellidoPaterno="+$("#idApellidoPat").val().trim()+
                                "&apellidoMaterno="+$("#idApellidoMat").val().trim()+
                                "&razonSocial="+$("#idRazonSocial").val().trim()+
                                "&nroDocumento="+$("#idNroDocumento").val()+
                                "&distrito="+$("#select_C").val()+
                                "&calle="+$("#idCalle").val()+
                                "&tipoProveedor="+$("#idTipoProveedor").val()+
                                "&ultimaCompra="+dateTimeFormat($("#idUltimaCompra").val())+
                                "&idProveedor="+idRegistro;
                            DAO.consultarWebServiceGet("guardarProveedor", parametros, function(data){
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
                }else{
                    fancyAlert("Ya existe un proveedor con el mismo nombre (idProveedor = "+listaProveedores[0].idProveedor +")")
                }
            })
		}
	}catch(err){
		emitirErrorCatch(err, "guardar");
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
function validarNombreExistente(persona, callback){
    try{
        var parametros = "&tipoPersona="+persona.tipoPersona+
            "&nombres="+persona.nombres+"&razonSocial="+persona.razonSocial+
            "&idProveedor="+idRegistro
        DAO.consultarWebServiceGet("validarNombreProveedor", parametros, function(data){
            callback(data)
        })
    }catch(err){
        emitirErrorCatch(err, "validarNombreExistente()")
    }
}