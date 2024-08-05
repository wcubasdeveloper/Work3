var codEvento = $_GET('codEvento');
var codAgraviado = $_GET('codAgraviado');
var idCarta = $_GET('idCarta');
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var idNosocomio = "";
var montoGarantia= {};
var UIT = parseFloat($_GET("UIT"));
if(UIT==null || UIT==undefined){
	UIT=0;
}
var fechaAccidente ;
var idPrimeraProyeccion;
cargarInicio(function(){
	$("#idBtnGuardar").click(guardarCarta);
	$("#idFechaCarta").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
	$("#btnBuscarNosocomio").click(function(){
		buscarNosocomio('a');
	});
	$("#tipoAsistencia_a").change(function(){
		calcularMontoGarantia('a');
	});
	$("#idNosocomio_a").change(function(){
		calcularMontoGarantia('a');
	});
	// busca y carga la lista de servicios Medicos
	DAO.consultarWebServiceGet("getServicioMedicosList", "", function(listaServicios){
		agregarOpcionesToCombo("idServicioMedico", listaServicios, {keyValue:"descripcion", keyId:"idServicioMedico"});
		DAO.consultarWebServiceGet("getTipoAtencionList", "", function(tipoAtencion){
			var listaTipoAsitencia = [];
			for(var i=0; i<tipoAtencion.length; i++){
				if(tipoAtencion[i].descripcion=='Urgencia' || tipoAtencion[i].descripcion=='Emergencia' || tipoAtencion[i].descripcion=='Internamiento'){
					listaTipoAsitencia.push(tipoAtencion[i]);
					montoGarantia[tipoAtencion[i].idTipoAtencion] = tipoAtencion[i].valorUIT;
				}				
			}
			agregarOpcionesToCombo("tipoAsistencia_a", listaTipoAsitencia, {keyValue:"descripcion", keyId:"idTipoAtencion"});
			
			var parametros= "&codAgraviado="+codAgraviado;
			DAO.consultarWebServiceGet("getCartaGarantia", parametros, function(data){
				if(data.length>0){
					switch(data[0].tipoPersona){
						case 'N':
						data[0].asociado = data[0].nombreAsociado;
							break;
						case 'J':
						data[0].asociado = data[0].razonSocial;
							break;
					}
					// carga la informacion de la carta de garantia:
					$("#idNombreAsociado").val(data[0].asociado);
					$("#idNroDoc").val(data[0].nroDocumento);
					$("#idCAT").val(data[0].nroCAT);
					$("#idPlaca").val(data[0].placa);
					$("#idNombreAgraviado").val(data[0].nombreAgraviado);
					$("#idEdad").val(data[0].edad);
					$("#idDNI").val(data[0].DNI_Agraviado);
					$("#tipoAsistencia_a").val(data[0].tipoAsistencia);
					$("#idDiagnostico").val(data[0].diagnostico);
                    $("#idObservacion").val(data[0].observaciones)
					$("#monto_a").val(data[0].monto);
					fechaAccidente = data[0].fechaAccidente;
					idPrimeraProyeccion = data[0].idPrimeraProyeccion;
					var idDistritoXcargar = "";
					// cargar lista de nosocomios:
					//$("#monto_a").prop("disabled", true); // Deshabilitado momentaneamente
					if(data[0].idNosocomio>0){
						// obtiene el distrito del nosocomio y carga todos los distritos de ese nosocomio.
						idDistritoXcargar=data[0].distritoNosocomio;	
						idNosocomio = data[0].idNosocomio+"-"+data[0].tipoNosocomio;
						if(data[0].tipoNosocomio=='C'){
							$("#monto_a").prop("disabled", false);
						}
					}else{
						// verifica si es que el evento tiene asignado un distrito
						if(data[0].idDistritoAccidente!=null){
							idDistritoXcargar=data[0].idDistritoAccidente;
						}
					}
					if(idCarta>0){ // carga los campos de la carta.
						$("#idNroCarta").val(data[0].nroCarta);
						$("#idFechaCarta").val(data[0].fechaCarta);
						
						if(data[0].servicioMedico>0){
							$("#idServicioMedico").val(data[0].servicioMedico);
						}						
					}
					if(idDistritoXcargar!=""){
						var parametros = "&idDistrito="+idDistritoXcargar;
						DAO.consultarWebServiceGet("getListaNosocomios", parametros, function(datos) {
							$("#idNosocomio").html(""); // Limpia opciones
							$("#idNosocomio").append(new Option("Seleccione",""));
							for(var i=0; i<datos.length; i++){
							   $("#idNosocomio_a").append(new Option(datos[i]["nombre"], datos[i]["idNosocomio"]+"-"+datos[i]["tipo"]));
							}
							if(idNosocomio!=""){
								$("#idNosocomio_a").val(idNosocomio);
							}
							$.fancybox.close();
						});
					}else{
						$.fancybox.close();
					}			
				}else{
					fancyAlert("No existen registros de Carta de garantia")
				}			
			});	
		}); 
	});	   
});
function buscarNosocomio(keyAgraviado){
    try{
        if($("#buscarNosocomio_"+keyAgraviado).val()!=""){
            var parametros = "&nosocomio="+$("#buscarNosocomio_"+keyAgraviado).val();
            DAO.consultarWebServiceGet("getNosocomioByNombre", parametros, function(data){
                for(var i=0; i<data.length;i++){
                    data[i].idCompuesto = data[i].idNosocomio+"-"+data[i].tipo;
                }
                agregarOpcionesToCombo("idNosocomio_"+keyAgraviado, data, {"keyId":"idCompuesto", "keyValue":"nombre"});
                //$("#idNosocomio_"+keyAgraviado).focus();
				openSelect($("#idNosocomio_"+keyAgraviado));
				$("#monto_"+keyAgraviado).val(0);
                $.fancybox.close();
            });
        }else{
            fancyAlertFunction("¡Debe ingresar el nosocomio a buscar!", function(rpta){
                if(rpta){
                    $("#buscarNosocomio_"+keyAgraviado).focus();
                }
            })
        }
    }catch(err){
        emitirErrorCatch(err, "buscarNosocomio()");
    }
}
function calcularMontoGarantia(keyAgraviado){
    try{
        var monto=0;
        var nosocomio = $("#idNosocomio_"+keyAgraviado).val();
        var tipoAsistencia = $("#tipoAsistencia_"+keyAgraviado).val();
        if((nosocomio!="" && nosocomio!='Seleccione') && tipoAsistencia!=""){
            var tipoNosocomio = nosocomio.split("-")[1];
            monto = montoGarantia[tipoAsistencia]*UIT;
            if(tipoNosocomio=='H'){ // hospital
                //$("#monto_"+keyAgraviado).prop("disabled", true);
				$("#monto_"+keyAgraviado).prop("disabled", false); //Habilitado momentaneamente solo para el proceso de actualizacion
            }else{ // clinica
                $("#monto_"+keyAgraviado).prop("disabled", false);
            }
        }else{
            $("#monto_"+keyAgraviado).prop("disabled", true);
        }
        $("#monto_"+keyAgraviado).val(monto);
    }catch(err){
        emitirErrorCatch(err, "calcularMontoGarantia()")
    }
}
function guardarCarta(){
	try{
		if(validarCamposRequeridos("divGeneral")){
			var monto = $("#monto_a").val();
			if(monto != ""){
				if(monto>0){
					fancyConfirm("¿Desea continuar con el registro?", function(rpta){
						if(rpta){
							var parametros = "&nroCarta="+$("#idNroCarta").val()+
								"&fechaCarta="+dateTimeFormat($("#idFechaCarta").val())+
								"&diagnosticoFinal="+$("#idDiagnostico").val()+ // diagnostico Final
                                "&observaciones="+$("#idObservacion").val()+
								"&asistencia="+$("#tipoAsistencia_a").val()+
								"&idNosocomio="+$("#idNosocomio_a").val().split("-")[0]+
								"&servicioMedico="+$("#idServicioMedico").val()+
								"&monto="+$("#monto_a").val()+
								"&nroCAT="+$("#idCAT").val()+
								"&codAgraviado="+codAgraviado+
								"&codEvento="+codEvento+
                                "&idCarta="+idCarta+
								"&fechaAccidente="+fechaAccidente+
								"&idPrimeraProyeccion="+idPrimeraProyeccion;
                            var funcionService = "";
                            var mensajeFinal = "";
                            if(idCarta>0){ // editar
                                funcionService = "actualizarCarta";
                                mensajeFinal = "¡Se actualizó la información correctamente!";
                            }else{ // registra nuevo
                                funcionService = "registrarCarta";
                                mensajeFinal = "¡Se guardó la carta de garantia correctamente!";
                            }
							DAO.consultarWebServiceGet(funcionService, parametros, function(data){
								if(data[0]>0){
									fancyAlertFunction(mensajeFinal, function(){
										parent.$.fancybox.close();										
									});
								}else{
									if(data[0]==false){
										fancyAlert("¡El NRO DE CARTA ya existe!")
									}else{
										fancyAlert("¡Operacion fallida!")
									}
									
								}
							})
						}
					})				
				}else{
					fancyAlert("Debe ingresar el monto de la carta de garantia");
				}
			}else{
				fancyAlert("Debe ingresar el monto de la carta de garantia");
			}
		}else{
			
		}				
	}catch(err){
		emitirErrorCatch(err, "guardarCarta");
	}
}