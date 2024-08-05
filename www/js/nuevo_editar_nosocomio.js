var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Nosocomio";
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var arrayDepartamentos=new Array();
var listaTipoNosocomio = [
	{"idTipo":"H", "descripcion":"Hospital"},
	{"idTipo":"C", "descripcion":"Clinica"}
]
var idDistrito=''

cargarInicio(function(){
	$("#btnGuardar").click(guardar);
	agregarOpcionesToCombo("idTipo", listaTipoNosocomio, {"keyId":"idTipo", "keyValue":"descripcion"});
	// carga el plugin de distritos
	DAO.consultarWebServiceGet("getAllDistritos", "", function(data){
		arrayDistritos=data; // Guarda los distritos
		DAO.consultarWebServiceGet("getAllProvincias", "", function(datos){
			arrayProvincias=datos;
			DAO.consultarWebServiceGet("getAllDepartamentos", "", function(depas){
				arrayDepartamentos=depas;
				$("#select_N").change(function(){
					cargarProvinciasDep("N", idProvinciaSelect);
				});
				$("#btnCambiarProv_N").click(function(){
					cargarProvinciasDep("N", idProvinciaSelect, "button");
				});
				cargarComboDistritos();
				if(parseFloat(idRegistro)>0){							
					$("#idID").val(idRegistro);
					cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
						idDistrito = data[0].idDistrito;
						cargarComboDistritos();
						$("#select_N").val(data[0].idDistrito)
						$("#idNombre").val(data[0].nombre)
						$("#idDireccion").val(data[0].calle);
						$("#idTelefono").val(data[0].telefono)
						$("#idTipo").val(data[0].tipo);
						$("#idNombre").focus();
						$.fancybox.close();
					});
				}else{
					$("#idID").css("display", "none");
					$("#wb_lblID").css("display", "none");					
				}
				$("#idNombre").focus();
				$.fancybox.close();
			});
		});
	});
});
function guardar(){
	try{		
		if(validarCamposRequeridos("Layer1")){
            var nombreNosocomio = $("#idNombre").val().trim()
            validarNombreExistente(nombreNosocomio, function(listaNosocomios){
                if(listaNosocomios.length==0){
                    fancyConfirm("¿Desea proceder con la operación?", function(rpta){
                        if(rpta){
                            var parametros = "&nombre="+$("#idNombre").val()+
                                "&distrito="+$("#select_N").val()+
                                "&direccion="+$("#idDireccion").val()+
                                "&telf="+$("#idTelefono").val()+
                                "&tipo="+$("#idTipo").val()+
                                "&idNosocomio="+idRegistro;

                            DAO.consultarWebServiceGet("guardarNosocomio", parametros, function(data){
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
                    fancyAlert("Ya existe un nosocomio con el mismo nombre (idNosocomio = "+listaNosocomios[0].idNosocomio +")")
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
            cargarDistritos("N", idProvincia);
		}else{
			var idProvincia="P01";
            idProvinciaSelect = idProvincia;
            cargarDistritos("N", idProvincia);            
		}
    }catch(err){
        emitirErrorCatch(err, "cargarComboDistritos()")
    }
}
function validarNombreExistente(nombreNosocomio, callback){
    try{
        var parametros = "&nombreNosocomio="+nombreNosocomio+
            "&idNosocomio="+idRegistro
        DAO.consultarWebServiceGet("validarNombreNosocomio", parametros, function(data){
            callback(data)
        })
    }catch(err){
        emitirErrorCatch(err, "validarNombreExistente()")
    }
}