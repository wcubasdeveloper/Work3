var listaCartasPrevias;
var idCarta = $_GET("idCarta");
if(idCarta==undefined){
	idCarta=0;
}
var codAgraviado = $_GET("codAgraviado");
var DAO = new DAOWebServiceGeT("wbs_as-sini");
var accion = $_GET("accion");
var etapaList = {
	1:"Gastos médicos", 
	2:"Por incapacidad temporal", 
	3:"Por invalidez Permanente", 
	4:"Por muerte", 
	5:"Por sepelio" 
}
var cobertura = [
    {
        id:1,
        nombre:"Gastos médicos (hasta 5 UIT)",
        valorUnidad:5,
        totalFacturas:0,
        arrayFacturas:[]
    },
    {
        id:2,
        nombre:"Por incapacidad temporal (hasta 1 UIT)",
        valorUnidad:1,
        totalFacturas:0,
        arrayFacturas:[]
    },
    {
        id:3,
        nombre:"Por invalidez Permanente (hasta 4 UIT)",
        valorUnidad:4,
        totalFacturas:0,
        arrayFacturas:[]
    },
    {
		id:4,
		nombre:"Por muerte (4 UIT)",
		valorUnidad:4,
        totalFacturas:0,
        arrayFacturas:[]
	},

	{
		id:5,
		nombre:"Por sepelio (hasta 1 UIT)",
		valorUnidad:1,
        totalFacturas:0,
        arrayFacturas:[]
	}
]
var idProyeccionAsociada = 0;
var listaCartasPrevias;
var UIT=0; // UIT registrada en el informe
var idNosocomio = ""; // idNosocomio = idFuneraria = idProveedor
var idTipoAtencion = "";
var montoGarantia= {};
var arrayListNosocomio = [];
var arrayListFuneraria = [];
var arrayListTipoAsistencia; // guarda la lista de tipos de asistencia 
var montoProyecciones;
var montoFacturasPorEtapa;
var montoOrdenesPorEtapa;
var disponible =0; // monto disponible
cargarInicio(function(){
	$("#btnPDF").click(imprimirPDF);
	$("#idEsManual").change(function(){
		var value = $("#idEsManual").val();
		esManual(value);
	})
	$("#idEtapa").change(function(){ // carga los campos en el formulario segun la etapa de proyeccion que se escoja
		var idEtapa = $("#idEtapa").val();
		cargarCamposPorEtapa(idEtapa);
		cargarInfoEtapa(idEtapa)
	});
	$("#wb_lblNroCarta").css("display", "none");
	$("#nroCarta").css("display", "none");
	$("#idFechaCarta").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
	// CONSULTA LOS VALORES PARA LOS TIPOS DE ASISTENCIA:
	DAO.consultarWebServiceGet("getTipoAtencionList", "", function(listaTipoAsitencia){
		for(var i=0; i<listaTipoAsitencia.length; i++){
			montoGarantia[listaTipoAsitencia[i].idTipoAtencion] = listaTipoAsitencia[i].valorUIT;
		}
		arrayListTipoAsistencia = listaTipoAsitencia;
		DAO.consultarWebServiceGet("getListaFunerarias", "", function(listaFuneraria){
			arrayListFuneraria = listaFuneraria;
		});
		// consulta por el medico auditor
		DAO.consultarWebServiceGet("getListaMedicoAuditor", "", function(medicosList){
			// carga la lista de Medicos
			agregarOpcionesToCombo("idMedico", medicosList, {keyValue:"nombreMedico", keyId:"idMedico"});
			// busca las cartas previas:
			var params = "&idCarta="+idCarta+
				"&codAgraviado="+codAgraviado;
			DAO.consultarWebServiceGet("getListaCartasPrevias", params, function(listaCartas){
				// carga la lista de cartas previas
				var cartasImpresas = [];			
				for(var y=0; y<listaCartas.length; y++){
					if(listaCartas[y].idPrimeraProyeccion==0){
						listaCartas[y].nroCarta = LPAD(listaCartas[y].idCarta, numeroLPAD);			
					}
					listaCartas[y].descripcion = listaCartas[y].nroCarta+" - "+listaCartas[y].fecha+" - S/."+listaCartas[y].monto;
					if(listaCartas[y].estado=='P'){
						cartasImpresas.push(listaCartas[y]);
					}
				}
				listaCartasPrevias = listaCartas;			
				agregarOpcionesToCombo("idCartaPrevia", cartasImpresas, {keyValue:"descripcion", keyId:"idCarta"});
				// busca y carga la lista de servicios Medicos
				DAO.consultarWebServiceGet("getServicioMedicosList", "", function(listaServicios){
					agregarOpcionesToCombo("idServicioMedico", listaServicios, {keyValue:"descripcion", keyId:"idServicioMedico"});
					if(idCarta>0){
						var parametros = "&idCarta="+idCarta;
						DAO.consultarWebServiceGet("getCartaDetalle", parametros, function(data){
							if(data.length>0){
								var carta = data[0];
								UIT = carta.UIT;
								var nombreAsociado = carta.nombreAsociado;
								if(carta.tipoPersona == 'J'){
									nombreAsociado = carta.razonSocial;
								}
								$("#idCodEvento").val(carta.codEvento);
								$("#idFechaAccidente").val(carta.fechaAccidente);
								$("#idDescripcionAccidente").val(carta.tipoAccidente);
								$("#idNosocomio").val(carta.nombreNosocomio);
								$("#idComisaria").val(carta.nombreComisaria);
                                $("#idDiagnosticoInicial").val(carta.diagnosticoInicial)
								$("#idNroCAT").val(carta.nroCAT);
								$("#idPlaca").val(carta.placa);
								$("#idNombreAsociado").val(nombreAsociado);
								$("#idCodAgraviado").val(carta.codAgraviado);
								$("#idDNIAgraviado").val(carta.DNI_Agraviado);
								$("#idNombreAgraviado").val(carta.nombreAgraviado);
								$("#idDiagnosticoAgraviado").val(carta.diagnosticoAgraviado);
                                $("#idDiagnosticoFinal").val(carta.diagnosticoAgraviado);
                                $("#idObservaciones").val(carta.observaciones)

								$("#idEtapa").val(carta.idCobertura);
								
								$("#idAmpliacion").val(carta.esAmpliacion);
								if(carta.esAmpliacion=='S'){
									$("#idCartaPrevia").css("display", "block");
									$("#wb_lblCartaPrevia").css("display", "block");
									if(carta.idCartaAnterior!=null){
										$("#idCartaPrevia").val(carta.idCartaAnterior+"");
									}
									$("#idCartaPrevia").attr("requerido", "Carta Previa");							
								}else{
									$("#idCartaPrevia").css("display", "none");
									$("#wb_lblCartaPrevia").css("display", "none");
									$("#idCartaPrevia").val("");
									$("#idCartaPrevia").attr("requerido", "");
								}
								var manual = "N";
								if(carta.nroCarta!="" && carta.nroCarta!="00000"){
									manual="S";
								}else{
									carta.nroCarta = ""; // normalmente el query trae el numero de carta como  00000 cuando esta vacio
								}
								$("#idEsManual").val(manual);
								esManual(manual);
								$("#nroCarta").val(carta.nroCarta);
								
								$("#idFechaCarta").val(carta.fechaCarta);
								
								if(carta.servicioMedico>0){
									$("#idServicioMedico").val(carta.servicioMedico);
								}
								
								$("#idDiagnosticoCarta").val(carta.diagnosticoCarta);
								$("#monto_a").val(carta.monto);
								if(carta.idAuditor>0){
									$("#idMedico").val(carta.idAuditor);
								}
								if(carta.idPrimeraProyeccion>0){
									idProyeccionAsociada = carta.idPrimeraProyeccion;
								}
								$("#idAmpliacion").change(function(){
									var value = $("#idAmpliacion").val();
									verificarAmplicacion(value);
								})
								if(accion!=undefined){
									var nroCarta = idCarta;
									if(idProyeccionAsociada>0){
										nroCarta = carta.nroCarta;
									}
									if(accion=="AC"){
										labelTextWYSG("wb_idTitle", "ANULAR CARTA "+nroCarta);
										$("#btnAccion").val("Anular");
										$(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
										$("#idMotivo").prop("disabled", false);
										$("#btnAccion").prop("disabled", false);
										$("#btnAccion").click(anularCarta);
									}if(accion=="EC"){
										labelTextWYSG("wb_idTitle", "EDITAR CARTA "+nroCarta);
										$("#btnAccion").click(guardarCambios);
										// oculta campos de motivo:
										$("#idMotivo").css("display", "none");
										$("#wb_lblMotivo").css("display", "none");
										
										if(idProyeccionAsociada>0){
											$("#idEtapa").prop("disabled", true);
										}
									}
								}								
								
								// carga la lista de Nosocomios:
								var idDistritoXcargar = "";				
								$("#monto_a").prop("disabled", false);
								if(carta.idNosocomio>0){
									// obtiene el distrito del nosocomio (Proveedor) y carga todos los distritos de ese nosocomio.
									idDistritoXcargar=carta.distritoNosocomio;	
									idNosocomio = carta.idNosocomio;
									
								}else{
									// verifica si es que el evento tiene asignado un distrito
									if(carta.idDistritoAccidente!=null){
										idDistritoXcargar=carta.idDistritoAccidente;
									}
								}
								
								if(carta.tipoAsistencia>0){
									idTipoAtencion = carta.tipoAsistencia;
								}
								
								var parametros = "&idDistrito="+idDistritoXcargar;
								DAO.consultarWebServiceGet("getListaNosocomios", parametros, function(datos) {
									arrayListNosocomio = datos; // guarda los registros de los nosocomios para la siguiente carga
									cargarCamposPorEtapa($("#idEtapa").val()); // carga los campos segun la etapa de gastos
									if(idNosocomio!=""){
										$("#idNosocomio_a").val(idNosocomio);
									}
									
									if(idTipoAtencion!=""){
										$("#tipoAsistencia_a").val(idTipoAtencion);
									}									
									DAO.consultarWebServiceGet("getTotalFacturaPorEtapa", "&codAgraviado="+codAgraviado, function(resultsFacturas){
										if(resultsFacturas.length>0){
											montoFacturasPorEtapa = resultsFacturas[0]
										}
										DAO.consultarWebServiceGet("getTotalOrdenesPorEtapa", "&codAgraviado="+codAgraviado, function(resultsOrdenes){
											if(resultsOrdenes.length>0){
												montoOrdenesPorEtapa = resultsOrdenes[0]
											}
											//if(accion=='EC'){
												var params = "&codAgraviado="+codAgraviado;
												DAO.consultarWebServiceGet("getTotalProyectado", params, function(data){
													montoProyecciones = data;
													$.fancybox.close();
													cargarInfoEtapa($("#idEtapa").val())
												})
											/*}else{
												$.fancybox.close();
												cargarInfoEtapa($("#idEtapa").val())
											}*/
										})
									})							
								});														
							}else{
								fancyAlert("No se encuentra la carta");
							}	
						});
					}else{
						$.fancybox.close();
					}				
				});			
			});
		});
	});		
})
function cargarInfoEtapa(idEtapa){ // carga informacion con respeto a las UIT disponible por etapa
	try{
		// total UIT:
		debugger
		var unidadesUIT = 0;
		for(var i=0; i<cobertura.length;i++){
			if(cobertura[i].id == idEtapa){
				unidadesUIT = cobertura[i].valorUnidad
				break;
			}
		}
		var totalUIT = unidadesUIT*UIT
		$("#idTotalUI").val(number_format(totalUIT, 2, '.', ','))
		// total carta de garantia impresas:
		var totalCartas = 0;
		for(var i=0; i<listaCartasPrevias.length;i++){
			if(listaCartasPrevias[i].estado=='P' && listaCartasPrevias[i].idCobertura == idEtapa && listaCartasPrevias[i].idCarta!=idCarta ){
				totalCartas = totalCartas+ listaCartasPrevias[i].monto
			}
		}
		$("#idTotalCG").val(number_format(totalCartas, 2, '.', ','))
		// total proyectado:
		var montoTotalProy = montoProyecciones[0]["monto"+idEtapa]==null?0:montoProyecciones[0]["monto"+idEtapa]
		$("#idTotalProy").val(number_format(montoTotalProy, 2, '.', ','))
		// Total Facturas:
		var montoTotalFac = montoFacturasPorEtapa["monto"+idEtapa]==null?0:montoFacturasPorEtapa["monto"+idEtapa]
		$("#idTotalFact").val(number_format(montoTotalFac, 2, '.', ','))
		// Total Orden Pago
		var montoTotalOrden = montoOrdenesPorEtapa["monto"+idEtapa]==null?0:montoOrdenesPorEtapa["monto"+idEtapa]
		$("#idTotalOrdPago").val(number_format(montoTotalOrden, 2, '.', ','))
		// Disponible
		disponible = totalUIT - (totalCartas+montoTotalFac+montoTotalOrden)
		$("#idDisponible").val(number_format(disponible, 2, '.', ','))
		
	}catch(err){
		emitirErrorCatch(err, "cargarInfoEtapa")
	}
}
function anularCarta(){
	try{
		var advertenciaExtra = "";
		var motivoAnulacion = $("#idMotivo").val();
		if(motivoAnulacion==""){
			advertenciaExtra = " (No ha ingresado el motivo de la anulación) ";
		}
		fancyConfirm("¿Desea continuar con la anulación"+advertenciaExtra+"?", function(rpta){
			if(rpta){
				var parametros = "&motivo="+motivoAnulacion+"&idCarta="+idCarta;
				DAO.consultarWebServiceGet("anularCarta",parametros, function(data){
					var filasAfectadas = data[0];
					if(filasAfectadas>0){
						realizoTarea=true;
						var paginaAnterior = $_GET("pagina");
						if(paginaAnterior==undefined){
							parent.$.fancybox.close();
						}else{
							parent.abrirVentanaFancyBox($_GET("width"), $_GET("height"), paginaAnterior+"?codEvento="+$_GET("codEvento")+"&codAgraviado="+$_GET("codAgraviado")+"&accion="+$_GET("accion"), true);
						}						
					}else{
						fancyAlert("¡Operación Fallida!")
					}
				});
			}
		});		
	}catch(err){
		emitirErrorCatch(err, "anularCarta");
	}	
}
function guardarCambios(){
	try{
		if(validarCamposRequeridos("idPanelCarta")){
			if(validarMonto()){
				fancyConfirm("¿Desea guardar los cambios?", function(rpta){
					if(rpta){
						var estado = "N";
						if($("#idChckImpr").prop("checked")){
							estado = "P"; // Impresa
						}
						var id_Nosocomio = 0;
						var id_Funeraria = 0;
						if($("#idEtapa").val()=='5'){ // si es sepelio toma el valor del combobox 
							id_Funeraria = $("#idNosocomio_a").val();
						}else{
							id_Nosocomio = $("#idNosocomio_a").val();
						}
						var parametros="&idCarta="+idCarta+
							"&idEtapa="+$("#idEtapa").val()+
							"&ampliacion="+$("#idAmpliacion").val()+
							"&cartaPrevia="+$("#idCartaPrevia").val()+
							"&tipoAsistencia="+$("#tipoAsistencia_a").val()+
							"&auditor="+$("#idMedico").val()+
							"&servicioMedico="+$("#idServicioMedico").val()+
							"&diagnosticoFinal="+$("#idDiagnosticoFinal").val()+
                            "&observaciones="+$("#idObservaciones").val()+
							"&monto="+$("#monto_a").val()+
							"&idNosocomio="+id_Nosocomio+
							"&idFuneraria="+id_Funeraria+
							"&idProyeccion="+idProyeccionAsociada+
							"&codAgraviado="+codAgraviado+
							"&fechaCarta="+dateTimeFormat($("#idFechaCarta").val())+
							"&nroCarta="+$("#nroCarta").val()+
							"&estado="+estado;
						DAO.consultarWebServiceGet("editarCarta", parametros, function(data){
							var filasAfectadas = data[0];
							if(filasAfectadas>0){
								$(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
								$('.eraser').attr('onclick', '');
								$("#btnPDF").prop("disabled", false);
								fancyAlert("¡Se guardarón los cambios correctamente!")
								$.fancybox.close();
								/*realizoTarea=true;
								var paginaAnterior = $_GET("pagina");
								if(paginaAnterior==undefined){
									parent.$.fancybox.close();
								}else{
									parent.abrirVentanaFancyBox($_GET("width"), $_GET("height"), paginaAnterior+"?codEvento="+$_GET("codEvento")+"&codAgraviado="+$_GET("codAgraviado")+"&accion="+$_GET("accion"), true);
								}*/
							}else{
								if(filasAfectadas==false){
									fancyAlert("¡El NRO DE CARTA ya existe!")
								}else{
									fancyAlert("Operación Fallida");
								}
							}
						})
					}
				});
			}			
		}		
	}catch(err){
		emitirErrorCatch(err, "guardarCambios");
	}
}
function verificarAmplicacion(value){
	try{
		$("#idCartaPrevia").val("");
		switch(value){
			case 'S':
				$("#idCartaPrevia").css("display", "block");
				$("#wb_lblCartaPrevia").css("display", "block");
				$("#idCartaPrevia").attr("requerido", "Carta Previa");
				break;
			case 'N':
				$("#idCartaPrevia").css("display", "none");
				$("#wb_lblCartaPrevia").css("display", "none");
				$("#idCartaPrevia").attr("requerido", "");
				break;
		}		
	}catch(err){
		emitirErrorCatch(err, "verificarAmplicacion");
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
                $("#monto_"+keyAgraviado).prop("disabled", true);
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
function buscarFuneraria(keyAgraviado){
	try{
		if($("#buscarNosocomio_"+keyAgraviado).val()!=""){
            var parametros = "&funeraria="+$("#buscarNosocomio_"+keyAgraviado).val();
            DAO.consultarWebServiceGet("getFunerariaByNombre", parametros, function(data){                
                agregarOpcionesToCombo("idNosocomio_"+keyAgraviado, data, {"keyId":"idFuneraria", "keyValue":"nombre"});
                $("#idNosocomio_"+keyAgraviado).focus();
                $.fancybox.close();
            });
        }else{
            fancyAlertFunction("¡Debe ingresar la funeraria a buscar!", function(rpta){
                if(rpta){
                    $("#buscarNosocomio_"+keyAgraviado).focus();
                }
            })
        }		
	}catch(err){
		emitirErrorCatch(err, "buscarFuneraria");
	}
}
function buscarNosocomio(keyAgraviado){
    try{
        if($("#buscarNosocomio_"+keyAgraviado).val()!=""){
            var parametros = "&nosocomio="+$("#buscarNosocomio_"+keyAgraviado).val();
            DAO.consultarWebServiceGet("getNosocomioByNombre", parametros, function(data){
                for(var i=0; i<data.length;i++){
                    data[i].idCompuesto = data[i].idNosocomio+"-"+data[i].tipo;
                }
                agregarOpcionesToCombo("idNosocomio_"+keyAgraviado, data, {"keyId":"idCompuesto", "keyValue":"nombre"});
                $("#idNosocomio_"+keyAgraviado).focus();
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
function validarMonto(){
	try{
		var monto = $("#monto_a").val().trim();
		if(monto==""){
			monto=0;
		}
		monto = parseFloat(monto);
		if(monto>0){
			
			// comportamiento antiguo de como validar el monto de la carta de garantia:
			
			/*var idCobertura = $("#idEtapa").val();
			var montoCartas=0;
			for(var i=0; i<listaCartasPrevias.length; i++){
				if(listaCartasPrevias[i].idCobertura == idCobertura){
					montoCartas = montoCartas+parseFloat(listaCartasPrevias[i].monto);				
				}
			}
			var montoProyeccion = montoProyecciones[0]["monto"+idCobertura];
			if(montoProyeccion==null){
				montoProyeccion=0;
			}
			if(montoCartas+monto>montoProyeccion){
				fancyAlert("El monto ingresado excede al proyectado de S/. "+montoProyeccion);
				return false;			
			}*/
			
			// nuevo comportamiento:
			if(disponible==""){
				disponible=0;
			}
			disponible = parseFloat(disponible)
			if(monto>disponible){
				fancyAlert("El monto ingresado excede al disponible de S/. "+disponible);
				return false;
			}
		}else{
			fancyAlert("¡Debe ingresar el monto de la carta!");
			return false;
		}		
		return true;
	}catch(err){
        emitirErrorCatch(err, "validarMonto()");
    }
}
function esManual(value){
	try{
		$("#nroCarta").val("");
		if(value=='S'){
			$("#wb_lblNroCarta").css("display", "block");
			$("#nroCarta").css("display", "block");
			$("#nroCarta").attr("requerido", "Nro Carta");
		}else{
			$("#wb_lblNroCarta").css("display", "none");
			$("#nroCarta").css("display", "none");
			$("#nroCarta").attr("requerido", "");
		}		
	}catch(err){
		emitirErrorCatch(err, "esManual")
	}
}
function cargarTipoAsistencia(tipo){
	try{
		// obtiene los tipo de  asistencia segun su clasificiacion (Sepelio o Gastos de carta)
		var listaACargar = [];
		if(tipo=='S'){ // Sepelio
			for(var i=0; i<arrayListTipoAsistencia.length; i++){
				if(arrayListTipoAsistencia[i].tipo == tipo){
					listaACargar.push(arrayListTipoAsistencia[i]);				
				}			
			}			
		}else{
			for(var i=0; i<arrayListTipoAsistencia.length; i++){
				if(arrayListTipoAsistencia[i].tipo != "S"){
					listaACargar.push(arrayListTipoAsistencia[i]);				
				}			
			}
		}
		agregarOpcionesToCombo("tipoAsistencia_a", listaACargar, {keyValue:"descripcion", keyId:"idTipoAtencion"});
	}catch(err){
		emitirErrorCatch(err, "cargarTipoAsistencia");
	}	
}
function cargarCamposPorEtapa(idEtapa){
	try{
		switch(idEtapa){
			case '4': // Por Sepelio bloquea los combobox de tipo de atencion y Nosocomio
				$("#tipoAsistencia_a").val("");
				$("#tipoAsistencia_a").attr("requerido", "");
				$("#tipoAsistencia_a").prop("disabled", true);
				$("#idNosocomio_a").val("");
				$("#idNosocomio_a").attr("requerido", "");
				$("#idNosocomio_a").attr("disabled", true);
				break;
			default:
				//$("#tipoAsistencia_a").val("");
				$("#tipoAsistencia_a").attr("requerido", "tipo de atencion");
				$("#tipoAsistencia_a").prop("disabled", false);
				//$("#idNosocomio_a").val("");
				$("#idNosocomio_a").attr("requerido", "Nosocomio");
				$("#idNosocomio_a").attr("disabled", false);
				break;
		}
		
	}catch(err){
		emitirErrorCatch(err, "cargarCamposPorEtapa");
	}	
}
function cargarCamposPorEtapa(idEtapa){
	try{
		switch(idEtapa){
			case '5': // Por Sepelio bloquea los combobox de tipo de atencion y Nosocomio				
				$("#idServicioMedico").val("");
				$("#idServicioMedico").prop("disabled", true);
				labelTextWYSG("wb_idLblNosocomio", "Funerarias");
				cargarTipoAsistencia('S');
				// cargar funerarias:				
				agregarOpcionesToCombo("idNosocomio_a", arrayListFuneraria, {keyValue:"nombre", keyId:"idFuneraria"});
				$("#btnBuscarNosocomio").unbind("click");
				$("#buscarNosocomio_a").prop("placeholder", "Buscar Funeraria")
				$("#btnBuscarNosocomio").click(function(){
					buscarFuneraria('a');
				});
				$("#idNosocomio_a").attr("requerido", "Funeraria");
				$("#idServicioMedico").attr("requerido", "");
				break;
			default:
				$("#idServicioMedico").prop("disabled", false);
				labelTextWYSG("wb_idLblNosocomio", "Nosocomio");
				cargarTipoAsistencia('G');
				// carga Nosocomios:
				agregarOpcionesToCombo("idNosocomio_a", arrayListNosocomio, {keyValue:"nombre", keyId:"idNosocomio"});
				$("#btnBuscarNosocomio").unbind("click");
				$("#buscarNosocomio_a").prop("placeholder", "Buscar Nosocomio")
				$("#btnBuscarNosocomio").click(function(){
					buscarNosocomio('a');
				});
				$("#idNosocomio_a").attr("requerido", "Nosocomio");
				$("#idServicioMedico").attr("requerido", "Servicio Médico");
				break;
		}
		
	}catch(err){
		emitirErrorCatch(err, "cargarCamposPorEtapa");
	}	
}
function imprimirPDF(){ // imprime la carta de garantia en un PDF
	try{
		var nombreUsuario = parent.$("#datosUsuario").children().find("span").html();
			var fechaHoraImpresion = convertirAfechaString(new Date(), true, false, 12);
			
			window.open("wbs_as-sini?funcion=generarCartaGarantia&idCarta="+idCarta+
				"&nombreUsuario="+nombreUsuario+
				"&fechaHoraImpresion="+fechaHoraImpresion,'_blank'); // EMITE EL PDF
		/*
		var idEtapa = $("#idEtapa").val();
		var tipoCarta = 1; // Carta de gastos
		if(idEtapa=='5'){ //  por sepelio
			tipoCarta = 2; //Carta de sepelio
		}
		var nroCarta=idCarta+"";
		var cantDigitos = getLenth(nroCarta);
		var cantDeCeros = 5-cantDigitos;
		for(var i=0; i<cantDeCeros; i++){
			nroCarta = "0"+nroCarta;
		}
		var tipoAtencion = $( "#tipoAsistencia_a option:selected" ).text();
		var nosocomio_funeraria = $( "#idNosocomio_a option:selected" ).text();
		var asociado = $("#idNombreAsociado").val();
		var paciente = $("#idNombreAgraviado").val();
		var diagnostico = $("#idDiagnosticoCarta").val();
		var fechaOcurrencia = $("#idFechaAccidente").val();
		var cat = $("#idNroCAT").val();
		var monto = $("#monto_a").val();
		var fechaCarta = $("#idFechaCarta").val().split(" ")[0]; // obtiene solo la fecha, no la hora
		var codEvento = $("#idCodEvento").val();
		var codAgraviado = $("#idCodAgraviado").val();
		var placa = $("#idPlaca").val();
		var nombreUsuario = parent.$("#datosUsuario").children().find("span").html();
		var fechaHoraImpresion = convertirAfechaString(new Date(), true, false, 12);
		
		var parametros = "&tipoCarta="+tipoCarta+
			"&nroCarta="+nroCarta+
			"&tipoAtencion="+tipoAtencion+
			"&nosocomio_funeraria="+nosocomio_funeraria+
			"&asociado="+asociado+
			"&paciente="+paciente+
			"&diagnostico="+diagnostico+
			"&fechaOcurrencia="+fechaOcurrencia+
			"&cat="+cat+
			"&monto="+monto+
			"&fechaCarta="+fechaCarta+
			"&codEvento="+codEvento+
			"&codAgraviado="+codAgraviado+
			"&placa="+placa+
			"&nombreUsuario="+nombreUsuario+
			"&fechaHoraImpresion="+fechaHoraImpresion;
		window.open("wbs_as-sini?funcion=generarCartaGarantia"+parametros,'_blank'); // EMITE EL PDF
		*/
	}catch(err){
		emitirErrorCatch(err, "");
	}	
}