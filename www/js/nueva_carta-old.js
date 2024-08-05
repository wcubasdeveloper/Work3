var listaCartasPrevias;
var idCarta=0;
var listaCartasPrevias;
var dataTable;
var tipoAsistList = {"E":"Emergencia", "U":"Urgencia", "I":"Internamiento"};
var nroCAT;
var etapaList = {
	1:"Gastos médicos", 
	2:"Por incapacidad temporal", 
	3:"Por invalidez Permanente", 
	4:"Por muerte", 
	5:"Por sepelio" 
}
var estadoCartaGarantia={'N': 'Nueva', 'P':'Impresa', 'A':'Anulada'};

var codAgraviado = $_GET("codAgraviado");
var codEvento = $_GET('codEvento');
var DAO = new DAOWebServiceGeT("wbs_as-sini");
var accion = $_GET("accion");

var listaCartasPrevias; // registro de cartas previas
var UIT=0; // UIT registrada en el informe
var idNosocomio = ""; // id Nosocomio del agraviado
var montoGarantia= {};
var arrayListTipoAsistencia; // guarda la lista de tipos de asistencia 
var montoProyecciones;
var arrayListNosocomio = [];
var arrayListFuneraria = [];
cargarInicio(function(){
	$("#idEsManual").change(function(){
		var value = $("#idEsManual").val();
		esManual(value);
	})
	$("#wb_lblNroCarta").css("display", "none");
	$("#nroCarta").css("display", "none");
	$("#idFechaCarta").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
	$("#idFechaCarta").val(convertirAfechaString(new Date, true));
	$("#btnImpreso").css("display", "none");
	$("#btnPDF").css("display", "none");
	$("#btnImpreso").click(marcaComoImpreso);	
	$("#btnPDF").click(imprimirPDF);
	$("#btnGuardar").click(guardarCarta);
	$("#idCartaPrevia").css("display", "none");
	$("#wb_lblCartaPrevia").css("display", "none");
	$("#idAmpliacion").change(function(){
		var value = $("#idAmpliacion").val();
		verificarAmplicacion(value);
	});	
	$("#idEtapa").change(function(){
		var idEtapa = $("#idEtapa").val();
		cargarCamposPorEtapa(idEtapa);
	});
	DAO.consultarWebServiceGet("getTipoAtencionList", "", function(listaTipoAsitencia){
		for(var i=0; i<listaTipoAsitencia.length; i++){
			montoGarantia[listaTipoAsitencia[i].idTipoAtencion] = listaTipoAsitencia[i].valorUIT;
		}
		arrayListTipoAsistencia = listaTipoAsitencia;
		cargarTipoAsistencia('G'); // carga los tipos de asistencia menos el sepelio
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
					var parametros = "&codAgraviado="+codAgraviado;
					DAO.consultarWebServiceGet("getDetalleAgraviado", parametros, function(data){
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
							$("#idNroCAT").val(carta.nroCAT);
							$("#idPlaca").val(carta.placa);
							$("#idNombreAsociado").val(nombreAsociado);
							$("#idCodAgraviado").val(carta.codAgraviado);
							$("#idDNIAgraviado").val(carta.DNI_Agraviado);
							$("#idNombreAgraviado").val(carta.nombreAgraviado);
							$("#idDiagnosticoAgraviado").val(carta.diagnosticoAgraviado);					
							nroCAT = carta.nroCAT;
							
							$("#btnBuscarNosocomio").click(function(){
								buscarNosocomio('a');
							});
							/*$("#tipoAsistencia_a").change(function(){
								calcularMontoGarantia('a');
							});
							$("#idNosocomio_a").change(function(){
								calcularMontoGarantia('a');
							})*;*/
							// carga la lista de Nosocomios:
							var idDistritoXcargar = "";				
							$("#monto_a").prop("disabled", false);
							if(carta.idNosocomio>0){
								// obtiene el distrito del nosocomio y carga todos los distritos de ese nosocomio.
								idDistritoXcargar=carta.distritoNosocomio;	
								idNosocomio = carta.idNosocomio;
								/*if(carta.tipoNosocomio=='C'){
									$("#monto_a").prop("disabled", false);
								}*/
							}else{
								// verifica si es que el evento tiene asignado un distrito
								if(carta.idDistritoAccidente!=null){
									idDistritoXcargar=carta.idDistritoAccidente;
								}
							}
							if(idDistritoXcargar!=""){ // si existe un distrito, se carga los nosocomios de ese distrito
								var parametros = "&idDistrito="+idDistritoXcargar;
								DAO.consultarWebServiceGet("getListaNosocomios", parametros, function(datos) {
									
									agregarOpcionesToCombo("idNosocomio_a", datos, {keyValue:"nombre", keyId:"idNosocomio"});
									arrayListNosocomio = datos; // guarda los registros de los nosocomios para la siguiente carga	
									if(idNosocomio!=""){
										$("#idNosocomio_a").val(idNosocomio);
									}
									DAO.consultarWebServiceGet("getListaFunerarias", "", function(listaFuneraria){
										arrayListFuneraria = listaFuneraria;
										// obtiene el total proyectado por fase
										var params = "&codAgraviado="+codAgraviado;
										DAO.consultarWebServiceGet("getTotalProyectado", params, function(data){
											montoProyecciones = data;
											// carga la tabla de cartas de agraviados:
											var parametros = "&codEvento="+codEvento+
												"&codAgraviado="+codAgraviado;
											DAO.consultarWebServiceGet("getListaCartas", parametros, function(data){
												listarCartas(data);												
											});
										});	
									});							
								});
							}else{
								DAO.consultarWebServiceGet("getListaFunerarias", "", function(listaFuneraria){
									arrayListFuneraria = listaFuneraria;
									// obtiene el total proyectado por fase
									var params = "&codAgraviado="+codAgraviado;
									DAO.consultarWebServiceGet("getTotalProyectado", params, function(data){
										montoProyecciones = data;
										// carga la tabla de cartas de agraviados:
										var parametros = "&codEvento="+codEvento+
											"&codAgraviado="+codAgraviado;
										DAO.consultarWebServiceGet("getListaCartas", parametros, function(data){
											listarCartas(data);												
										});
									});	
								});
							}
						}else{
							fancyAlert("No se encuentra el agraviado");
						}	
					});				
				});						
			});
		});
	});
})
function listarCartas(resultsData){
	try{
		for(var i=0; i<resultsData.length; i++){
			resultsData[i].etapa=etapaList[resultsData[i].idCobertura];
			//resultsData[i].asistencia=tipoAsistList[resultsData[i].tipoAsistencia];		
			resultsData[i].estadoCarta = estadoCartaGarantia[resultsData[i].estado]; // obtiene la descripcion del estado de la carta
			resultsData[i].monto = "S/. "+resultsData[i].monto;
			if(resultsData[i].idPrimeraProyeccion==0){
				resultsData[i].nroCarta=LPAD(resultsData[i].idCarta, numeroLPAD);
			}
			resultsData[i].nosocomio_funeraria = resultsData[i].nombreNosocomio;
			if(resultsData[i].idCobertura == '5'){ // si es sepelio se toma el nombre de la funeraria en vez del nosocomio
				resultsData[i].nosocomio_funeraria = resultsData[i].nombreFuneraria;
			}
		}
		arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'etapa', alineacion:'center'},
			{campo:'nosocomio_funeraria', alineacion:'center'},
            {campo:'estadoCarta', alineacion:'center'},
            {campo:'nroCarta', alineacion:'center'},
			{campo:'fecha', alineacion:'center'},
			{campo:'asistencia', alineacion:'center'},
			{campo:'monto', alineacion:'center'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_cartas", resultsData, camposAmostrar, false, 11); // crea la tabla HTML
        var columns=[
            { "width": "20%"},
            { "width": "22%"},
            { "width": "13%"},
			{ "width": "12%"},
			{ "width": "8%"},
			{ "width": "15%"},
			{ "width": "10%"}
        ];
        dataTable=parseDataTable("tabla_cartas", columns, 117, false, false, false, false);
        $.fancybox.close();		
	}catch(err){
		emitirErrorCatch(err, "listarCartas");
	}
}
function guardarCarta(){
	try{
		if(validarCamposRequeridos("idPanelCarta")){
			if(validarMonto()){
				fancyConfirm("¿Desea continuar con el registro?", function(rpta){
					if(rpta){
						var id_Nosocomio = 0;
						var id_Funeraria = 0;
						if($("#idEtapa").val()=='5'){ // si es sepelio toma el valor del combobox 
							id_Funeraria = $("#idNosocomio_a").val();
						}else{
							id_Nosocomio = $("#idNosocomio_a").val();
						}
						var parametros="&idEtapa="+$("#idEtapa").val()+
							"&ampliacion="+$("#idAmpliacion").val()+
							"&cartaPrevia="+$("#idCartaPrevia").val()+
							"&tipoAsistencia="+$("#tipoAsistencia_a").val()+
							"&auditor="+$("#idMedico").val()+
							"&servicioMedico="+$("#idServicioMedico").val()+
							"&diagnosticoCarta="+$("#idDiagnosticoCarta").val()+
							"&monto="+$("#monto_a").val()+						
							"&idNosocomio="+id_Nosocomio+
							"&idFuneraria="+id_Funeraria+
							"&nroCAT="+nroCAT+
							"&codAgraviado="+codAgraviado+
							"&codEvento="+codEvento+
							"&fechaCarta="+dateTimeFormat($("#idFechaCarta").val())+
							"&nroCarta="+$("#nroCarta").val();
						DAO.consultarWebServiceGet("guardarCarta", parametros, function(data){
							idCarta = data[0];
							if(idCarta>0){
								realizoTarea=true;
								fancyAlertFunction("¡Se registró la carta correctamente!", function(){
									$(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
									$('.eraser').attr('onclick', '');
									$("#btnImpreso").css("display", "block");
									$("#btnPDF").css("display", "block");
									$("#btnImpreso").prop("disabled", false);
									$("#btnPDF").prop("disabled", false);
								})
							}else{
								if(idCarta==false){
									fancyAlert("¡El NRO DE CARTA ya existe!")
								}else{
									fancyAlert("Operación Fallida");
								}								
							}
						});					
					}
				});
			}			
		}				
	}catch(err){
		emitirErrorCatch(err, "guardarCarta");
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
			var idCobertura = $("#idEtapa").val();
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
function marcaComoImpreso(){
	try{
		fancyConfirm("¿ Cambiar de estado a 'IMPRESO' ? ", function(rpta){
			if(rpta){
				var parametros="&idCarta="+idCarta;
				DAO.consultarWebServiceGet("marcarCartaImpresa", parametros, function(data){
					var filasAfectadas = data[0];
					if(filasAfectadas>0){
						fancyAlertFunction("¡ La Carta de Garantía cambio al estado 'IMPRESO' !", function(){
							parent.$.fancybox.close();
						});						
					}else{
						fancyAlert("¡Operación Fallida!");
					}
				});
			}
		});		
	}catch(err){
		emitirErrorCatch(err, "");
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
function cargarTipoAsistencia(tipo){ // 23-11-2016: Se muestran todos los tipos de atencion
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
			case '5': // Por Sepelio bloquea los combobox de tipo de atencion y Nosocomio
				/*$("#tipoAsistencia_a").val("");
				$("#tipoAsistencia_a").attr("requerido", "");
				$("#tipoAsistencia_a").prop("disabled", true);
				$("#idNosocomio_a").val("");
				$("#idNosocomio_a").attr("requerido", "");
				$("#idNosocomio_a").attr("disabled", true);*/
				$("#idServicioMedico").val("");
				$("#idServicioMedico").prop("disabled", true);
				labelTextWYSG("wb_idLblNosocomio", "Funerarias");
				/*$("#buscarNosocomio_a").prop("disabled", true);
				$("#btnBuscarNosocomio").prop("disabled", true);*/
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
				/*$("#buscarNosocomio_a").prop("disabled", true);
				$("#btnBuscarNosocomio").prop("disabled", true);*/
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