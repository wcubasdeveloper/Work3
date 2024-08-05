var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Comisaria";
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var arrayDepartamentos=new Array();

cargarInicio(function(){
	$("#btnGuardar").click(guardar);
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
				cargarComboDistritos("C", "");
				if(parseFloat(idRegistro)>0){							
					$("#idID").val(idRegistro);
					cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
						idDistrito = data[0].idDistrito;
						cargarComboDistritos("C", idDistrito);
						$("#select_C").val(data[0].idDistrito)
						$("#idNombre").val(data[0].nombre)
						$("#idDireccion").val(data[0].calle);
						$("#idTelefono").val(data[0].telefono)
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
			fancyConfirm("¿Desea proceder con la operación?", function(rpta){
				if(rpta){
					var parametros = "&nombre="+$("#idNombre").val()+
						"&distrito="+$("#select_C").val()+
						"&direccion="+$("#idDireccion").val()+
						"&telf="+$("#idTelefono").val()+
						"&idComisaria="+idRegistro;
						
					DAO.consultarWebServiceGet("guardarComisaria", parametros, function(data){
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
var idProvinciaSelect="";
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