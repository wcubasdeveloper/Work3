var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Concesionario";
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var arrayDepartamentos=new Array();
var idPersona=0;
var idPersonaResponsable=0;
var idDistrito='';
var diaSemana = [
	{valor:"LU", dia:"Lunes"},
	{valor:"MA", dia:"Martes"},
	{valor:"MI", dia:"Miercoles"},
	{valor:"JU", dia:"Jueves"},
	{valor:"VI", dia:"Viernes"},
	{valor:"SA", dia:"Sabado"}
]
var arrayPromotores = [];
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
	$("#idNroDocumento").keypress(function(e){
		return textNumber(e);
	})
	$("#idTelef").keypress(function(e){
		return textNumber(e);
	})
	$("#idCelular").keypress(function(e){
		return textNumber(e);
	})
	$("#dni_resp").keypress(function(e){
		return textNumber(e);
	})
	$("#btnGuardar").click(guardar);
	$("#idPromotor").html("<option value=''>Seleccione</option>")
	$("#idNombres").attr("class", "N_persona");
	$("#idApellidoPat").attr("class", "N_persona");
	$("#idApellidoMat").attr("class", "N_persona");
	$("#idRazonSocial").attr("class", "J_persona");
	$("#idFechaAfiliacion").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
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
				agregarOpcionesToCombo("idDiaVisita", diaSemana, {"keyId":"valor", "keyValue":"dia"});
				DAO.consultarWebServiceGet("getListaLocal", "", function(data){
					agregarOpcionesToCombo("idLocal", data, {"keyId":"idLocal", "keyValue":"Nombre"});
					DAO.consultarWebServiceGet("getListaPromotor", "", function(dataPromotores){
						arrayPromotores=dataPromotores;
						$("#idLocal").change(cargarListaPromtorores);						
						$("#idLocal").change();
						$("#idTipoPersona").change(cargarTipoPersona)
						$("#idTipoPersona").change();
						if(parseFloat(idRegistro)>0){							
							$("#idID").val(idRegistro);
							cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
								idDistrito = data[0].idDistrito;
								idPersona = data[0].idPersona
								if(data[0].idPersona_resp>0){
									idPersonaResponsable = data[0].idPersona_resp;
								}								
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
								cargarComboDistritos();
								$("#select_C").val(data[0].idDistrito)
								$("#idCalle").val(data[0].calle)
								$("#idLocal").val(data[0].idSede);
								$("#idLocal").change()
								$("#idPromotor").val(data[0].idPromotor)
								$("#idDiaVisita").val(data[0].diaSemana);
								$("#idEstado").val(data[0].estado);
								$("#idTelef").val(data[0].telefonoFijo);
								$("#idCelular").val(data[0].telefonoMovil);
								$("#idFechaAfiliacion").val(data[0].fechaAfiliacion)
								$("#dni_resp").val(data[0].DNI_Resp);
								$("#nombre_resp").val(data[0].nombres_resp);
								$("#apePat_resp").val(data[0].apePat_resp);
								$("#apeMat_resp").val(data[0].apeMat_resp);
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
				})
			});
		});
	});
});
function cargarListaPromtorores(){
	try{
		var idLocal = $("#idLocal").val();
		var promotores = [];
		for(var i=0; i<arrayPromotores.length; i++){
			if(arrayPromotores[i].idLocal==idLocal){
				promotores.push(arrayPromotores[i])
			}
		}
		agregarOpcionesToCombo("idPromotor", promotores, {"keyId":"idPromotor", "keyValue":"nombrePromotor"});		
	}catch(err){
		emitirErrorCatch(err, "cargarList")
	}
}

function guardar(){
	try{
		if(validarCamposRequeridos("idForm")){
			// obtiene datos del formulario
			fancyConfirm("¿Desea proceder con la operación?", function(rpta){
				if(rpta){
					var parametros = "&idPersona="+idPersona+
						"&tipoPersona="+$("#idTipoPersona").val()+
						"&nombres="+$("#idNombres").val()+
						"&apellidoPaterno="+$("#idApellidoPat").val()+
						"&apellidoMaterno="+$("#idApellidoMat").val()+
						"&razonSocial="+$("#idRazonSocial").val()+
						"&nroDocumento="+$("#idNroDocumento").val()+
						"&distrito="+$("#select_C").val()+
						"&calle="+$("#idCalle").val()+
						"&local="+$("#idLocal").val()+
						"&promotor="+$("#idPromotor").val()+
						"&visita="+$("#idDiaVisita").val()+
						"&estado="+$("#idEstado").val()+
						"&telefono="+$("#idTelef").val()+
						"&celular="+$("#idCelular").val()+
						"&afiliacion="+dateTimeFormat($("#idFechaAfiliacion").val())+
						"&idResponsable="+idPersonaResponsable+
						"&dni_resp="+$("#dni_resp").val()+
						"&nombres_resp="+$("#nombre_resp").val()+
						"&apePat_resp="+$("#apePat_resp").val()+
						"&apeMat_resp="+$("#apeMat_resp").val()+
						"&idConcesionario="+idRegistro;
					DAO.consultarWebServiceGet("guardarConcesionario", parametros, function(data){
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
// distritos:
/*var idProvinciaSelect="";
function cargarComboDistritos(tipoDistrito, idDistrito){
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
        cargarDistritos(tipoDistrito, idProvincia);                
    }catch(err){
        emitirErrorCatch(err, "cargarComboDistritos()")
    }
}*/
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
