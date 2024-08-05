var listadoCartas;
var listaCartasPrevias;
var idCarta=0;
var listaCartasPrevias;
var tipoAsistList = {"E":"Emergencia", "U":"Urgencia", "I":"Internamiento"};
var nroCAT;
var disponible =0; // monto disponible
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
var estadoCartaGarantia={'N': 'Nueva', 'P':'Impresa', 'A':'Anulada', 'F':'Facturada'};

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
var montoFacturasPorEtapa;
var montoOrdenesPorEtapa;
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
		cargarInfoEtapa(idEtapa)
	});
	$("#wb_idLinkCartas").css("cursor", "pointer");
	$("#wb_idLinkCartas").click(mostrarCartasPrevias)


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
							/*Primer panel */
							$("#idCodEvento").val(carta.codEvento);
							$("#idFechaAccidente").val(carta.fechaAccidente);
							$("#idDescripcionAccidente").val(carta.tipoAccidente);							
							$("#idNroCAT").val(carta.nroCAT);
							$("#idPlaca").val(carta.placa);
							$("#idDiagnosticoInicial").val(carta.diagnosticoInicial);
							
							/*segundo panel (Agraviado)*/
							$("#idCodAgraviado").val(carta.codAgraviado);
							$("#idDNIAgraviado").val(carta.DNI_Agraviado);
							$("#idNombreAgraviado").val(carta.nombreAgraviado);
							$("#idDiagnosticoAgraviado").val(carta.diagnosticoAgraviado);
                            $("#idDiagnosticoFinal").val(carta.diagnosticoAgraviado);
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
                                                cargarProyecciones();
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
                                            cargarProyecciones();
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
//***INICIO > FUNCIONES PESTAÑA PROVISIONES
var codigoManual="55555";
//var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var dataTable = undefined;
var arrayDatos;
//var codAgraviado = $_GET("codAgraviado");
//var codEvento = $_GET("codEvento");
var UIT =0;
var primeraVez1=0;
var primeraVez2=0;
var primeraVez3=0;
var primeraVez4=0;
var primeraVez5=0;
var idDistrito=""; // id del distrito para cargar los nosocomios
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
var mesAccidente;
var añoAccidente;
var idMontoActual;
var idTablaActual=1;
var dataTable_Agraviados={}
function cargarProyecciones(){
    $("#wb_idLinkFacturas").click(abrirListaFacturas)
    $("#wb_idLinkFacturas").css("cursor", "pointer")
    for(var i=0; i<cobertura.length; i++){
        $("#btnAgregar_"+cobertura[i].id).click(function(){
            agregarMes();
        })
        $("#btnAgregarCosto_"+cobertura[i].id).click(function(){
            agregarCostoMes();
        })
        $("#btnBorrar_"+cobertura[i].id).click(function(){
            borrarMes();
        })
        $("#btnGuardarProy").click(guardarProyecciones);
    }
    $("#ui-id-3").parent().click(function(){
        //cuando muestre por primera vez Provisiones se debe actualizar las columnas de la 1ra pestaña
        idTablaActual=1;
        borrarFilaSeleccionada();
        if(primeraVez1==0){
            dataTable_Agraviados["1"].columns.adjust().draw();
            if($("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length==1 && $("#tabla_acumulado_"+idTablaActual+" > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_acumulado_"+idTablaActual+" > tbody").html("");
            }
            primeraVez1++;
        }

    });
    $("#ui-id-4").parent().click(function(){
        //cuando muestre por primera vez Provisiones se debe actualizar las columnas de la 1ra pestaña
        idTablaActual=1;
        borrarFilaSeleccionada();
        if(primeraVez1==0){
            dataTable_Agraviados["1"].columns.adjust().draw();
            if($("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length==1 && $("#tabla_acumulado_"+idTablaActual+" > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_acumulado_"+idTablaActual+" > tbody").html("");
            }
            primeraVez1++;
        }

    });
    $("#ui-id-5").parent().click(function(){
        //la primera vez debe actualizar las columnas del dataTable
        idTablaActual=2;
        borrarFilaSeleccionada();
        if(primeraVez2==0){
            dataTable_Agraviados["2"].columns.adjust().draw();
            if($("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length==1 && $("#tabla_acumulado_"+idTablaActual+" > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_acumulado_"+idTablaActual+" > tbody").html("");
            }
            primeraVez2++;
        }
    });
    $("#ui-id-6").parent().click(function(){
        idTablaActual=3;
        borrarFilaSeleccionada();
        if(primeraVez3==0){
            dataTable_Agraviados["3"].columns.adjust().draw();
            if($("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length==1 && $("#tabla_acumulado_"+idTablaActual+" > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_acumulado_"+idTablaActual+" > tbody").html("");
            }
            primeraVez3++;
        }
    });
    $("#ui-id-7").parent().click(function(){
        idTablaActual=4;
        borrarFilaSeleccionada();
        if(primeraVez4==0){
            dataTable_Agraviados["4"].columns.adjust().draw();
            if($("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length==1 && $("#tabla_acumulado_"+idTablaActual+" > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_acumulado_"+idTablaActual+" > tbody").html("");
            }
            primeraVez4++;
        }
    });
    $("#ui-id-8").parent().click(function(){
        idTablaActual=5;
        borrarFilaSeleccionada();
        if(primeraVez5==0){
            dataTable_Agraviados["5"].columns.adjust().draw();
            if($("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length==1 && $("#tabla_acumulado_"+idTablaActual+" > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_acumulado_"+idTablaActual+" > tbody").html("");
            }
            primeraVez5++;
        }
    });
    var parametros = "&codAgraviado="+codAgraviado;
    DAO.consultarWebServiceGet("totalFacturasYordenes", parametros, function(facturas){
        for(var i=0; i<facturas.length; i++){
            for(var y=0; y<cobertura.length; y++){
                if(facturas[i].idEtapa==cobertura[y].id){
                    cobertura[y].totalFacturas=cobertura[y].totalFacturas+facturas[i].monto
                    cobertura[y].arrayFacturas.push(facturas[i])
                }
            }
        }
        for(var z=0; z<cobertura.length; z++){
            $("#idTotal_Fact_"+cobertura[z].id).val(number_format(cobertura[z].totalFacturas, 2, '.', ','))
        }
        var parametros = "&codAgraviado="+codAgraviado;
        DAO.consultarWebServiceGet("getProyeccionPorAgraviado", parametros, function(data){
        // busca la informacion del agraviado asi como sus proyecciones de gastos
            if(data.length>0){
                UIT = data[0].UIT;
                data[0].asociado = data[0].nombreAsociado;
                if(data[0].tipoPersona=='J'){
                    data[0].asociado = data[0].razonSocial;
                }
                $("#idCodEvento1").val(data[0].codEvento)
                $("#idNroCAT1").val(data[0].nroCAT)
                $("#idPlaca").val(data[0].placa)
                $("#idAsociado").val(data[0].asociado)
                $("#idCodAgraviado1").val(data[0].codAgraviado)
                $("#idDNI").val(data[0].DNI)
                $("#idAgraviado").val(data[0].nombreAgraviado)
                $("#idNosocomio").val(data[0].nombreNosocomio)
                $("#idComisaria").val(data[0].nombreComisaria);
                $("#idDiagnostico").val(data[0].diagnostico);
                $("#idDiagnosticoInicial").val(data[0].diagnosticoInicial);
                $("#idFechaAccidente1").val(data[0].fechaAccidente);
                $("#idDescripcionAccidente1").val(data[0].descripcionAccidente);

                var fechaCompletaAccidente = data[0].fechaAccidente.split(" ")[0];
                fechaCompletaAccidente = fechaCompletaAccidente.split("/");
                mesAccidente = fechaCompletaAccidente[1];
                añoAccidente = parseFloat(fechaCompletaAccidente[2])-2000;
                // carga las UIT por cada pestaña: ETAPA
                cargarUITetapas();
                cargarProvisiones(data[0].proyecciones);
                // asigna el valor del distrito para cargar las listas de los nosocomios (segun el distrito)
                if(data[0].idDistritoNosocomio!=null && data[0].idDistritoNosocomio!=""){
                    idDistrito = data[0].idDistritoNosocomio; // se cargaran inicialmente los nosocomios del distrito del nosocomio inicial del agraviado
                }else{
                    if(data[0].idDistritoAccidente!=null && data[0].idDistritoAccidente!=""){
                        idDistrito = data[0].idDistritoAccidente; // se cargaran inicialmente los nosocomios del distrito del accidente
                    }
                }
                $.fancybox.close();
            }else{
                fancyAlert("¡No existe el agraviado!");
            }
        })
    });
}

function clickPestaña(pestaña){
    try{
        if(pestaña!="" || pestaña!=undefined){
            var menuTotal=$("#jQueryTabs1").find("ul").eq(0).find("li");
            menuTotal.each(function(){
                var li_Actual=$(this);
                var href_Actual=li_Actual.find("a").eq(0);
                var spanMenu=href_Actual.find("span").eq(0);
                var nombreMenu=spanMenu.html();
                if(nombreMenu==pestaña){
                    href_Actual.click();
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "clickPestaña")
    }
}
function cargarUITetapas(){
    try{
        for(var i=0; i<cobertura.length; i++){
            $("#idMaxUIT_"+cobertura[i].id).val(cobertura[i].valorUnidad+" UIT (S/."+cobertura[i].valorUnidad*UIT+")")	;
            $("#idTotal_"+cobertura[i].id).val(0);
        }
    }catch(err){
        emitirErrorCatch(err,"cargarUITetapas");
    }
}
function abrirListaFacturas(){
    // abre popup:
    abrirVentanaFancyBox(750, 430, "lista_facturas_provision?codAgraviado="+codAgraviado+"&idEtapa="+idTablaActual, true);
}
function cargarProvisiones(listaProvisiones){
    try{
        var listProvisionById={}
        for(var z=0; z<cobertura.length; z++){ // carga las 5 tablas
            acumulado=0;
            var idTabla = cobertura[z].id;
            listProvisionById[idTabla]=[];
            var indice=-1;
            var camposAmostrar;
            var columns;
            if(idTabla=="4" || idTabla=="5"){ // Para la etapa de Muerte=4 o sepelio = 5
                for(var i=0; i<listaProvisiones.length; i++){
                    if(listaProvisiones[i].idFase == idTabla){
                        indice++;
                        var htmlMes="<input id='mes_"+idTabla+"_"+indice+"' style='width: 58px; font-size:12px; text-align:center;' type='text' value='"+listaProvisiones[i].mesDesembolso+"("+listaProvisiones[i].idSecuencia+")' disabled >";
                        var htmlMonto="S/. <input id='monto_"+idTabla+"_"+indice+"' style='width: 60px; font-size:12px; text-align:center;' type='text' value='"+listaProvisiones[i].montoAproximado+"' onkeyup='recalcularAcumulado("+'"monto_'+idTabla+'_'+indice+'"'+")'>";
                        acumulado = acumulado + listaProvisiones[i].montoAproximado;
                        var htmlAcumulado = "S/. <input id='acumulado_"+idTabla+"_"+indice+"' style='width: 60px; font-size:12px; text-align:center;' type='text' value='"+acumulado+"' disabled />";
                        var htmlTratamiento="<textarea id='tratamiento_"+idTabla+"_"+indice+"' rows='2' cols='80' style='font-size:12px; text-align:left;' >"+listaProvisiones[i].detalleMes+"</textarea>"; // detalle

                        listProvisionById[idTabla].push({
                            htmlMes:htmlMes,
                            htmlMonto:htmlMonto,
                            htmlAcumulado:htmlAcumulado,
                            htmlTratamiento:htmlTratamiento
                        });
                    }
                }
                camposAmostrar = [ // asigna los campos a mostrar en la grilla
                    {campo:'htmlMes', alineacion:'center'},
                    {campo:'htmlTratamiento', alineacion:'center'},
                    {campo:'htmlMonto', alineacion:'center'},
                    {campo:'htmlAcumulado', alineacion:'center'}
                ];
                columns=[
                    { "width": "15%"},
                    { "width": "39%"},
                    { "width": "25%"},
                    { "width": "21%"}
                ];
            }else{
                // Para la etapa es Gastos Medicos = 1 / Incapacidad Temporal = 2 / Invalidez permanente = 3
                for(var i=0; i<listaProvisiones.length; i++){
                    if(listaProvisiones[i].idFase == idTabla){
                        indice++;
                        var options = "<option value=''>Seleccione</option>"; // contiene las opciones de combobox
                        if(listaProvisiones[i].idNosocomio>0){
                            options = options+"<option value='"+listaProvisiones[i].idNosocomio+"-"+listaProvisiones[i].tipoNosocomio+"' selected>"+listaProvisiones[i].nombreNosocomio+"_"+listaProvisiones[i].tipoNosocomio+"</option>";
                            disabledTratamiento = "disabled";
                        }
                        var disabledProcedimiento = "";
                        var disabledTratamiento = "";
                        var displayBotonBusqueda ="";
                        var cols="";
                        if(listaProvisiones[i].idTarifaProcedimiento>0){ // es una provision con tarifa de procedimiento
                            disabledTratamiento = "disabled";
                            listaProvisiones[i].tratamiento_descripcion = listaProvisiones[i].descripcionProcedimiento;
                            cols=41;
                        }else{ // es una provision manual
                            listaProvisiones[i].idTarifaProcedimiento="";
                            listaProvisiones[i].codigoProcedimiento=55555;
                            disabledProcedimiento = "disabled";
                            listaProvisiones[i].tratamiento_descripcion = listaProvisiones[i].tratamientoMes;
                            displayBotonBusqueda = "none";
                            cols=45;
                        }

                        var htmlMes="<input id='mes_"+idTabla+"_"+indice+"' style='width: 58px; font-size:12px; text-align:center;' type='text' value='"+listaProvisiones[i].mesDesembolso+"("+listaProvisiones[i].idSecuencia+")' disabled >";

                        var htmlNosocomio = "<select style='width:115px; font-size:12px; height:22px;' class='lista_nosocomio' id='idNosocomio_"+idTabla+"_"+indice+"'>"+options+"</select>&nbsp&nbsp<input type='text' placeholder='Buscar Nosoc' id='buscarNosocomio_"+idTabla+"_"+indice+"' style='width:90px; font-size:12px;'/>&nbsp;&nbsp;<img src='wpimages/search-icon.png' onclick='buscarNosocomio("+'"'+idTabla+"_"+indice+'"'+")' width='18' height='18' style='cursor: pointer;'>";

                        var htmlCodProced = "<input type='text' title='usar "+codigoManual+" para códigos manuales' onkeyup='validarTipoProyeccion("+'"'+idTabla+"_"+indice+'"'+")' placeholder='Buscar Cod' value='"+listaProvisiones[i].codigoProcedimiento+"' id='codProced_"+idTabla+"_"+indice+"' style='width:65px; font-size:12px;'/>&nbsp;&nbsp;<img src='wpimages/search-icon.png' onclick='buscarProcedimientoPorCodigo("+'"'+idTabla+"_"+indice+'"'+")' width='18' height='18' style='cursor: pointer;'/>"; // codigo del procedimiento

                        var htmlDescripProced = "<textarea onkeyup='resetIdTarifa("+'"'+idTabla+"_"+indice+'"'+")' id='descripProced_"+idTabla+"_"+indice+"' rows='2' cols='"+cols+"' style='font-size:12px; text-align:center; text-align:left;' >"+listaProvisiones[i].tratamiento_descripcion+"</textarea>&nbsp;&nbsp;<img id='btnBusqueda_"+idTabla+"_"+indice+"' src='wpimages/search-icon.png' onclick='buscarProcimientoPorDescripcion("+'"'+idTabla+"_"+indice+'"'+")' width='18' height='18' style='cursor: pointer; float:right; margin-right:5px; display:"+displayBotonBusqueda+";'/>"; // Descripcion del procedimiento

                        var htmlUnidades = "<input idTarifa='"+listaProvisiones[i].idTarifaProcedimiento+"' disabled type='text' value='"+quitarEspaciosEnBlanco(listaProvisiones[i].unidades)+"' id='unidades_"+idTabla+"_"+indice+"' style='width:60px; font-size:12px;'/>";

                        var htmlFactor = "<input onkeyup='calcularMontoFactor("+'"'+idTabla+"_"+indice+'"'+")' "+disabledProcedimiento+" type='text' value='"+listaProvisiones[i].factor+"' id='factor_"+idTabla+"_"+indice+"' style='width:60px; font-size:12px;'/>";

                        var htmlMonto="S/. <input "+disabledTratamiento+" id='monto_"+idTabla+"_"+indice+"' style='width: 60px; font-size:12px; text-align:center;' type='text' value='"+listaProvisiones[i].montoAproximado+"' onkeyup='recalcularAcumulado("+'"monto_'+idTabla+'_'+indice+'"'+")'>";

                        acumulado = acumulado + listaProvisiones[i].montoAproximado;

                        var htmlAcumulado = "S/. <input id='acumulado_"+idTabla+"_"+indice+"' style='width: 60px; font-size:12px; text-align:center;' type='text' value='"+acumulado+"' disabled />";

                        listProvisionById[idTabla].push({
                            htmlMes:htmlMes,
                            htmlMonto:htmlMonto,
                            htmlAcumulado:htmlAcumulado,
                            htmlNosocomio:htmlNosocomio,
                            htmlCodProced:htmlCodProced,
                            htmlDescripProced:htmlDescripProced,
                            htmlUnidades:htmlUnidades,
                            htmlFactor:htmlFactor
                        });
                    }
                }
                camposAmostrar = [ // asigna los campos a mostrar en la grilla
                    {campo:'htmlMes', alineacion:'center'},
                    {campo:'htmlNosocomio', alineacion:'center'},
                    {campo:'htmlCodProced', alineacion:'center'},
                    {campo:'htmlDescripProced', alineacion:'center'},
                    {campo:'htmlUnidades', alineacion:'center'},
                    {campo:'htmlFactor', alineacion:'center'},
                    {campo:'htmlMonto', alineacion:'center'},
                    {campo:'htmlAcumulado', alineacion:'center'}
                ];
                columns=[
                    { "width": "7%"},
                    { "width": "15%"},
                    { "width": "10%"},
                    { "width": "32%"},
                    { "width": "8%"},
                    { "width": "8%"},
                    { "width": "10%"},
                    { "width": "10%"}
                ];
            }

            $("#idTotal_"+idTabla).val(acumulado);
            crearFilasHTML("tabla_acumulado_"+idTabla, listProvisionById[idTabla], camposAmostrar, true, 12, idTabla); // crea la tabla HTML
            dataTable_Agraviados[idTabla]=parseDataTable("tabla_acumulado_"+idTabla, columns, 235);
            if($("#tabla_acumulado_"+idTabla+" > tbody >tr").length==1 && $("#tabla_acumulado_"+idTabla+" > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_acumulado_"+idTabla+" > tbody").html("");
            }
        }
    }catch(err){
        emitirErrorCatch(err, "cargarProvisiones");
    }
}
function validarTipoProyeccion(idFila){
    try{
        resetIdTarifa(idFila);
        var codProcedimiento = $("#codProced_"+idFila).val();
        if(codProcedimiento=='55555'){ // Proyeccion Manual sin tarifario
            // bloquea el campo de factor
            //$("#factor_"+idFila).prop("disabled", true);
            //$("#factor_"+idFila).val("");

            // desbloquea monto
            $("#monto_"+idFila).prop("disabled", false);
            $("#monto_"+idFila).val("");
            recalcularAcumulado("monto_"+idFila);
            $("#unidades_"+idFila).val("");
            //oculta el boton para la busqueda de descripcion del procedimiento
            $("#btnBusqueda_"+idFila).css("display", "none");
            $("#descripProced_"+idFila).attr("cols", "45");
        }else{
            // Desbloquea el campo del factor
            //$("#factor_"+idFila).prop("disabled", false);

            // bloquea el campo de monto
            $("#monto_"+idFila).prop("disabled", true);
            $("#monto_"+idFila).val("");
            recalcularAcumulado("monto_"+idFila);

            //muestra el boton para la busqueda descripcion del procedimiento
            $("#btnBusqueda_"+idFila).css("display", "block");
            $("#descripProced_"+idFila).prop("cols", "41");
        }
    }catch(err){
        emitirErrorCatch(err, "validarTipoProyeccion");
    }
}
function agregarMes(){
    try{
        var idFila = $("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length;
        var mesProyeccion="";
        var disponible=false;
        if(idFila==0){
            disponible=true;
            mesProyeccion = mesAccidente+"/"+añoAccidente+"(1)";
        }else{
            // verifica que se hay insertado el monto anterior
            var montoAnterior = $("#monto_"+idTablaActual+"_"+(idFila-1)).val();
            if(montoAnterior!=""){
                disponible=true;
                var mesPrevio = $("#mes_"+idTablaActual+"_"+(idFila-1)).val();
                mesPrevio = mesPrevio.split("/");
                var month = parseInt(mesPrevio[0]);
                var year = parseInt(mesPrevio[1]);
                if(month==12){
                    month=1;
                    year++;
                }else{
                    month++;
                }
                if(month<10){
                    month="0"+month;
                }
                mesProyeccion = month+"/"+year+"(1)";
            }
        }
        if(disponible){
            if(idTablaActual=='4' || idTablaActual=='5'){ // para muerte o sepelio
                $("#tabla_acumulado_"+idTablaActual+" > tbody").append("<tr onclick='seleccionarFila("+'"'+idTablaActual+'_'+idFila+'"'+")' id='tr_"+idTablaActual+"_"+idFila+"' style='font-family: Arial; height: 20px; font-size:11px; cursor:pointer;'>" +
                    "<td style='text-align: center;'><input id='mes_"+idTablaActual+"_"+idFila+"' type='text' style='width: 58px; font-size:12px; text-align:center;' value='"+mesProyeccion+"' disabled/></td>"+
                    "<td style='text-align: center;'><textarea id='tratamiento_"+idTablaActual+"_"+idFila+"' rows='2' cols='80' style='font-size:12px; text-align:left;'/></td>"+
                    "<td style='text-align: center;'>S/. <input id='monto_"+idTablaActual+"_"+idFila+"' style='width: 60px; font-size:12px; text-align:center;' type='text' onkeyup='recalcularAcumulado("+'"monto_'+idTablaActual+'_'+idFila+'"'+")'/></td>"+
                    "<td style='text-align: center;'>S/. <input id='acumulado_"+idTablaActual+"_"+idFila+"' style='width: 60px; font-size:12px; text-align:center;' type='text' disabled/></td>"+
                    "</tr>");
                $("#tr_"+idTablaActual+"_"+idFila).click();
                $("#monto_"+idTablaActual+"_"+idFila).focus();
            }else{ // para las otras fases
                $("#tabla_acumulado_"+idTablaActual+" > tbody").append("<tr onclick='seleccionarFila("+'"'+idTablaActual+'_'+idFila+'"'+")' id='tr_"+idTablaActual+"_"+idFila+"' style='font-family: Arial; height: 20px; font-size:11px; cursor:pointer;'>" +
                    "<td style='text-align: center;'><input id='mes_"+idTablaActual+"_"+idFila+"' type='text' style='width: 58px; font-size:12px; text-align:center;' value='"+mesProyeccion+"' disabled/></td>"+

                    "<td style='text-align: center;'><select style='width:115px; font-size:12px; height:22px;' class='lista_nosocomio' id='idNosocomio_"+idTablaActual+"_"+idFila+"'><option value=''>Seleccione</option></select>&nbsp&nbsp<input type='text' placeholder='Buscar Nosoc' id='buscarNosocomio_"+idTablaActual+"_"+idFila+"' style='width:90px; font-size:12px;'/>&nbsp;&nbsp;<img src='wpimages/search-icon.png' onclick='buscarNosocomio("+'"'+idTablaActual+"_"+idFila+'"'+")' width='18' height='18' style='cursor: pointer;'></td>"+

                    "<td style='text-align: center;'><input type='text' title='usar "+codigoManual+" para códigos manuales' onkeyup='validarTipoProyeccion("+'"'+idTablaActual+"_"+idFila+'"'+")' placeholder='Buscar Cod' value='' id='codProced_"+idTablaActual+"_"+idFila+"' style='width:65px; font-size:12px;'/>&nbsp;&nbsp;<img src='wpimages/search-icon.png' onclick='buscarProcedimientoPorCodigo("+'"'+idTablaActual+"_"+idFila+'"'+")' width='18' height='18' style='cursor: pointer;'/></td>"+

                    "<td style='text-align: center;'><textarea onkeyup='resetIdTarifa("+'"'+idTablaActual+"_"+idFila+'"'+")' id='descripProced_"+idTablaActual+"_"+idFila+"' rows='2' cols='41' style='font-size:12px; text-align:center; text-align:left;' ></textarea>&nbsp;&nbsp;<img id='btnBusqueda_"+idTablaActual+"_"+idFila+"' src='wpimages/search-icon.png' onclick='buscarProcimientoPorDescripcion("+'"'+idTablaActual+"_"+idFila+'"'+")' width='18' height='18' style='cursor: pointer; float:right; margin-right:5px; display:;'/></td>"+

                    "<td style='text-align: center;'><input idTarifa='' disabled type='text' value='' id='unidades_"+idTablaActual+"_"+idFila+"' style='width:60px; font-size:12px;'/></td>"+

                    "<td style='text-align: center;'><input onkeyup='calcularMontoFactor("+'"'+idTablaActual+"_"+idFila+'"'+")' type='text' value='' id='factor_"+idTablaActual+"_"+idFila+"' style='width:60px; font-size:12px;' disabled/></td>"+

                    "<td style='text-align: center;'>S/. <input id='monto_"+idTablaActual+"_"+idFila+"' disabled style='width: 60px; font-size:12px; text-align:center;' type='text' onkeyup='recalcularAcumulado("+'"monto_'+idTablaActual+'_'+idFila+'"'+")'/></td>"+

                    "<td style='text-align: center;'>S/. <input id='acumulado_"+idTablaActual+"_"+idFila+"' style='width: 60px; font-size:12px; text-align:center;' type='text' disabled/></td>"+
                    "</tr>");
                $("#tr_"+idTablaActual+"_"+idFila).click();
                $("#monto_"+idTablaActual+"_"+idFila).focus();
                idFilaTRActual = idFila;
                cargarNosocomios();
            }
        }else{
            fancyAlertFunction("¡Ingrese primero el monto del mes!", function(rpta){
                var ultimaFila = $("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length-1;
                $("#monto_"+idTablaActual+"_"+ultimaFila).focus();
            })
        }

    }catch(err){
        emitirErrorCatch(err, "agregarMes");
    }
}
function cargarNosocomios(){
    try{
        if(idFilaTRActual=="0"){ // primer ingreso
            var parametros = "&idDistrito="+idDistrito;
            DAO.consultarWebServiceGet("getListaNosocomios", parametros, function(datos){
                for(var i=0; i<datos.length; i++){
                    datos[i].idNosocomio_tipo = datos[i].idNosocomio+"-"+datos[i].tipo;
                }
                agregarOpcionesToCombo("idNosocomio_"+idTablaActual+"_"+idFilaTRActual, datos, {keyValue:"nombre", keyId:"idNosocomio_tipo"});
                $.fancybox.close();
                openSelect($("#idNosocomio_"+idTablaActual+"_"+idFilaTRActual));
            });
        }else{
            var idNosocomioPrevio = $("#idNosocomio_"+idTablaActual+"_"+(parseInt(idFilaTRActual)-1)).val();
            if(idNosocomioPrevio!=""){ // busca el nosocomio previo y carga los mismos nosocomio en la siguiente lista de nosocomios
                var idNosocomio = idNosocomioPrevio.split("-")[0]; //obtiene el id del nosocomio
                var parametros = "&idNosocomio="+idNosocomio;
                DAO.consultarWebServiceGet("getListaNosocomiosPorIdNosocomio", parametros, function(datos){
                    for(var i=0; i<datos.length; i++){
                        datos[i].idNosocomio_tipo = datos[i].idNosocomio+"-"+datos[i].tipo;
                    }
                    agregarOpcionesToCombo("idNosocomio_"+idTablaActual+"_"+idFilaTRActual, datos, {keyValue:"nombre", keyId:"idNosocomio_tipo"});
                    var idNosocomioPrevio = $("#idNosocomio_"+idTablaActual+"_"+(parseInt(idFilaTRActual)-1)).val()
                    $("#idNosocomio_"+idTablaActual+"_"+idFilaTRActual).val(idNosocomioPrevio);
                    $.fancybox.close();
                    openSelect($("#idNosocomio_"+idTablaActual+"_"+idFilaTRActual));
                });
            }
        }
    }catch(err){
        emitirErrorCatch(err, "cargarNosocomios");
    }
}
function recalcularAcumulado(idMonto){ // recalcula el total del acumulado cuando se edita el valor del monto de un mes
    try{
        idMontoActual = idMonto;
        var idFila = idMonto.split("_")[2];
        var montoAcumulado = 0;
        if(idFila>0){ //Si hay un mes previo
            if($("#acumulado_"+idTablaActual+"_"+(idFila-1)).val()==""){
                $("#acumulado_"+idTablaActual+"_"+(idFila-1)).val(0);
            }
            if($("#monto_"+idTablaActual+"_"+(idFila-1)).val()==""){
                $("#monto_"+idTablaActual+"_"+(idFila-1)).val(0);
            }
            montoAcumulado = $("#acumulado_"+idTablaActual+"_"+(idFila-1)).val();
        }
        for(var y=idFila; y<$("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length; y++){
            if(idFila!=y){
                if($("#monto_"+idTablaActual+"_"+y).val()==""){
                    $("#monto_"+idTablaActual+"_"+y).val(0);
                }
            }
            montoAcumulado = parseFloat(montoAcumulado) + parseFloat(($("#monto_"+idTablaActual+"_"+y).val()=="")?0:$("#monto_"+idTablaActual+"_"+y).val());
            $("#acumulado_"+idTablaActual+"_"+y).val(montoAcumulado);
        }
        validarMontoAcumulado();
    }catch(err){
        emitirErrorCatch(err, "recalcularAcumulado");
    }
}
function validarMontoAcumulado(){
    try{
        var ultimaFila = $("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length-1;
        var monto = parseFloat($("#acumulado_"+idTablaActual+"_"+ultimaFila).val());
        var montoLimite = 0;
        for(var y=0; y<cobertura.length; y++){
            if(cobertura[y].id == idTablaActual){
                montoLimite = cobertura[y].valorUnidad*UIT;
                break;
            }
        }
        var tFacturado = parseFloat($("#idTotal_Fact_"+idTablaActual).val());
        montoLimite=montoLimite-tFacturado;
        if(monto>montoLimite){
            fancyAlertFunction("El monto acumulado de S/. "+monto+" ha superado el monto limite de S/. "+montoLimite, function(){
                if(idTablaActual=="4" || idTablaActual=="5"){ // Muerte o sepelio
                    $("#"+idMontoActual).val(0);
                    recalcularAcumulado(idMontoActual);
                    $("#"+idMontoActual).focus();
                }else{
                    // obtengo la fila actual:
                    var idFila = idMontoActual.split("monto_")[1];
                    $("#"+idMontoActual).val(0);
                    recalcularAcumulado(idMontoActual);
                    $("#factor_"+idFila).val("");
                    $("#factor_"+idFila).focus();
                }
            });
        }else{
            $("#idTotal_"+idTablaActual).val(monto);
        }
    }catch(err){
        emitirErrorCatch(err, "validarMontoAcumulado")
    }
}
function agregarCostoMes(){
    try{
        var cantidadRegistros = $("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length;
        if(cantidadRegistros==0){
            fancyAlert("Ingrese primero la proyección del primer mes");
        }else{
            var filaActual = filaSeleccionada;
            if(filaSeleccionada==undefined){
                filaActual = idTablaActual+"_"+(cantidadRegistros-1);
            }
            var montoAnterior = $("#monto_"+filaActual).val();
            if(montoAnterior==""){
                idMontoActual = "monto_"+filaActual;
                fancyAlertFunction("¡Ingrese primero el monto de la proyección anterior!", function(){
                    $("#"+idMontoActual).focus();
                })
            }else{
                var registroPrevio = $("#mes_"+filaActual).val();
                var numeroFila = parseInt(filaActual.split("_")[1])+1;
                var mesAño = registroPrevio.split("(")[0];
                for(var z=numeroFila; z<$("#tabla_acumulado_"+idTablaActual+" > tbody >tr").length; z++){ // intenta buscar la mayor secuencia del mes
                    if(mesAño == $("#mes_"+idTablaActual+"_"+z).val().split("(")[0]){
                        registroPrevio = $("#mes_"+idTablaActual+"_"+z).val();
                        filaActual = idTablaActual+"_"+z;
                    }
                }
                registroPrevio = registroPrevio.split("(");
                var nuevoRegistroSecuencia = registroPrevio[0]+"("+(parseInt(registroPrevio[1].split(")")[0])+1)+")";
                console.log("ultima secuencia: "+nuevoRegistroSecuencia);
                var idFila = cantidadRegistros;
                if(idTablaActual=="4" || idTablaActual=="5"){ // Muerte o sepeleio
                    $("<tr onclick='seleccionarFila("+'"'+idTablaActual+'_'+idFila+'"'+")' id='tr_"+idTablaActual+"_"+idFila+"' style='font-family: Arial; height: 20px; font-size:11px; cursor:pointer;'>" +
                        "<td style='text-align: center;'><input id='mes_"+idTablaActual+"_"+idFila+"' type='text' style='width: 58px; font-size:12px; text-align:center;' value='"+nuevoRegistroSecuencia+"' disabled/></td>"+
                        "<td style='text-align: center;'><textarea id='tratamiento_"+idTablaActual+"_"+idFila+"' rows='2' cols='80' style='font-size:12px; text-align:center;'/></td>"+
                        "<td style='text-align: center;'>S/. <input id='monto_"+idTablaActual+"_"+idFila+"' style='width: 60px; font-size:12px; text-align:center;' type='text' onkeyup='recalcularAcumulado("+'"monto_'+idTablaActual+'_'+idFila+'"'+")'/></td>"+
                        "<td style='text-align: center;'>S/. <input id='acumulado_"+idTablaActual+"_"+idFila+"' style='width: 60px; font-size:12px; text-align:center;' type='text' disabled/></td>"+
                        "</tr>").insertAfter("#tr_"+filaActual);
                    $("#tr_"+idTablaActual+"_"+idFila).click();
                    $("#monto_"+idTablaActual+"_"+idFila).focus();

                    // recalcula los id de los componentes de la tabla de forma secuencial:
                    var count =-1;
                    var filaSeleccionadaValidada = false;
                    $("#tabla_acumulado_"+idTablaActual+" > tbody >tr").each(function(){
                        count++;
                        if($(this).attr("id").replace("tr_","")==filaSeleccionada && !filaSeleccionadaValidada){
                            filaSeleccionada = idTablaActual+"_"+count;
                            filaSeleccionadaValidada=true;
                        }
                        $(this).attr("id", "tr_"+idTablaActual+"_"+count);
                        $(this).attr("onclick", "seleccionarFila('"+idTablaActual+"_"+count+"')")
                        $(this).find("td").eq(0).find("input").prop("id", "mes_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(1).find("textarea").prop("id", "tratamiento_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(2).find("input").prop("id", "monto_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(2).find("input").attr("onkeyup", "recalcularAcumulado('monto_"+idTablaActual+"_"+count+"')")
                        $(this).find("td").eq(3).find("input").prop("id", "acumulado_"+idTablaActual+"_"+count);
                    });

                }else{
                    $("<tr onclick='seleccionarFila("+'"'+idTablaActual+'_'+idFila+'"'+")' id='tr_"+idTablaActual+"_"+idFila+"' style='font-family: Arial; height: 20px; font-size:11px; cursor:pointer;'>" +
                        "<td style='text-align: center;'><input id='mes_"+idTablaActual+"_"+idFila+"' type='text' style='width: 58px; font-size:12px; text-align:center;' value='"+nuevoRegistroSecuencia+"' disabled/></td>"+

                        "<td style='text-align: center;'><select style='width:115px; font-size:12px; height:22px;' class='lista_nosocomio' id='idNosocomio_"+idTablaActual+"_"+idFila+"'><option value=''>Seleccione</option></select>&nbsp&nbsp<input type='text' placeholder='Buscar Nosoc' id='buscarNosocomio_"+idTablaActual+"_"+idFila+"' style='width:90px; font-size:12px;'/>&nbsp;&nbsp;<img src='wpimages/search-icon.png' onclick='buscarNosocomio("+'"'+idTablaActual+"_"+idFila+'"'+")' width='18' height='18' style='cursor: pointer;'></td>"+

                        "<td style='text-align: center;'><input type='text' title='usar "+codigoManual+" para códigos manuales' onkeyup='validarTipoProyeccion("+'"'+idTablaActual+"_"+idFila+'"'+")' placeholder='Buscar Cod' value='' id='codProced_"+idTablaActual+"_"+idFila+"' style='width:65px; font-size:12px;'/>&nbsp;&nbsp;<img src='wpimages/search-icon.png' onclick='buscarProcedimientoPorCodigo("+'"'+idTablaActual+"_"+idFila+'"'+")' width='18' height='18' style='cursor: pointer;'/></td>"+

                        "<td style='text-align: center;'><textarea onkeyup='resetIdTarifa("+'"'+idTablaActual+"_"+idFila+'"'+")' id='descripProced_"+idTablaActual+"_"+idFila+"' rows='2' cols='41' style='font-size:12px; text-align:center; text-align:left;' ></textarea>&nbsp;&nbsp;<img id='btnBusqueda_"+idTablaActual+"_"+idFila+"' src='wpimages/search-icon.png' onclick='buscarProcimientoPorDescripcion("+'"'+idTablaActual+"_"+idFila+'"'+")' width='18' height='18' style='cursor: pointer; float:right; margin-right:5px; display:;'/></td>"+

                        "<td style='text-align: center;'><input idTarifa='' disabled type='text' value='' id='unidades_"+idTablaActual+"_"+idFila+"' style='width:60px; font-size:12px;'/></td>"+

                        "<td style='text-align: center;'><input onkeyup='calcularMontoFactor("+'"'+idTablaActual+"_"+idFila+'"'+")' type='text' value='' id='factor_"+idTablaActual+"_"+idFila+"' style='width:60px; font-size:12px;' disabled/></td>"+

                        "<td style='text-align: center;'>S/. <input disabled id='monto_"+idTablaActual+"_"+idFila+"' style='width: 60px; font-size:12px; text-align:center;' type='text' onkeyup='recalcularAcumulado("+'"monto_'+idTablaActual+'_'+idFila+'"'+")'/></td>"+

                        "<td style='text-align: center;'>S/. <input id='acumulado_"+idTablaActual+"_"+idFila+"' style='width: 60px; font-size:12px; text-align:center;' type='text' disabled/></td>"+

                        "</tr>").insertAfter("#tr_"+filaActual);
                    $("#tr_"+idTablaActual+"_"+idFila).click();
                    $("#codProced_"+idTablaActual+"_"+idFila).focus();

                    // recalcula los id de los componentes de la tabla de forma secuencial:
                    var count =-1;
                    var filaSeleccionadaValidada = false;
                    $("#tabla_acumulado_"+idTablaActual+" > tbody >tr").each(function(){
                        count++;
                        if($(this).attr("id").replace("tr_","")==filaSeleccionada && !filaSeleccionadaValidada){
                            filaSeleccionada = idTablaActual+"_"+count;
                            filaSeleccionadaValidada=true;
                        }
                        $(this).attr("id", "tr_"+idTablaActual+"_"+count);
                        $(this).attr("onclick", "seleccionarFila('"+idTablaActual+"_"+count+"')")
                        $(this).find("td").eq(0).find("input").prop("id", "mes_"+idTablaActual+"_"+count);
                        //Nosocomio
                        $(this).find("td").eq(1).find("select").prop("id", "idNosocomio_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(1).find("input").prop("id", "buscarNosocomio_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(1).find("img").attr("onclick", "buscarNosocomio('"+idTablaActual+"_"+count+"')");
                        //Codigo del procedimiento
                        $(this).find("td").eq(2).find("input").prop("id", "codProced_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(2).find("input").attr("onkeyup", "validarTipoProyeccion('"+idTablaActual+"_"+count+"')")
                        $(this).find("td").eq(2).find("img").attr("onclick", "buscarProcedimientoPorCodigo('"+idTablaActual+"_"+count+"')");
                        //Descripcion del procedimiento
                        $(this).find("td").eq(3).find("textarea").prop("id", "descripProced_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(3).find("textarea").attr("onkeyup", "resetIdTarifa('"+idTablaActual+"_"+count+"')")
                        $(this).find("td").eq(3).find("img").prop("id", "btnBusqueda_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(3).find("img").attr("onclick", "buscarProcimientoPorDescripcion('"+idTablaActual+"_"+count+"')");
                        //Unidades
                        $(this).find("td").eq(4).find("input").prop("id", "unidades_"+idTablaActual+"_"+count);
                        // Factor
                        $(this).find("td").eq(5).find("input").prop("id", "factor_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(5).find("input").attr("onkeyup", "calcularMontoFactor('"+idTablaActual+"_"+count+"')")

                        $(this).find("td").eq(6).find("input").prop("id", "monto_"+idTablaActual+"_"+count);
                        $(this).find("td").eq(6).find("input").attr("onkeyup", "recalcularAcumulado('monto_"+idTablaActual+"_"+count+"')")
                        $(this).find("td").eq(7).find("input").prop("id", "acumulado_"+idTablaActual+"_"+count);
                    });
                    idFilaTRActual = idFila;
                    cargarNosocomios();
                }
            }
        }
    }catch(err){
        emitirErrorCatch(err, "agregarCostoMes");
    }
}
function borrarMes(){
    try{
        if(filaSeleccionada!=undefined){
            $("#tr_"+filaSeleccionada).remove();
            var idFila = parseInt(filaSeleccionada);
            borrarFilaSeleccionada();
            recalcularTablaProyeccion();
        }else{
            fancyAlert("¡ Debe seleccionar un Mes de Proyección !");
        }
    }catch(err){
        emitirErrorCatch(err, "borrarMes")
    }
}
function recalcularTablaProyeccion(idFila){ // despues de borrar un mes se arrejustan la secuencia de los meses asi como tambien el acumulado
    try{
        var montoAcumulado = 0;
        var count=-1;
        var secuencia = 1;
        var mesProyeccionActual=mesAccidente+"/"+añoAccidente; // inicial
        var mesProyeccionReal;
        var mesXmes = {}
        $("#tabla_acumulado_"+idTablaActual+" > tbody >tr").each(function(){
            count++;
            if(idTablaActual=="4" || idTablaActual == "5"){ // Muerte o Sepelio
                // reordena ids
                $(this).attr("id", "tr_"+idTablaActual+"_"+count);
                $(this).attr("onclick", "seleccionarFila('"+idTablaActual+"_"+count+"')")
                $(this).find("td").eq(0).find("input").prop("id", "mes_"+idTablaActual+"_"+count);
                $(this).find("td").eq(1).find("textarea").prop("id", "tratamiento_"+idTablaActual+"_"+count);
                $(this).find("td").eq(2).find("input").prop("id", "monto_"+idTablaActual+"_"+count);
                $(this).find("td").eq(2).find("input").attr("onkeyup", "recalcularAcumulado('monto_"+idTablaActual+"_"+count+"')")
                $(this).find("td").eq(3).find("input").prop("id", "acumulado_"+idTablaActual+"_"+count);
            }else{
                $(this).attr("id", "tr_"+idTablaActual+"_"+count);
                $(this).attr("onclick", "seleccionarFila('"+idTablaActual+"_"+count+"')")
                $(this).find("td").eq(0).find("input").prop("id", "mes_"+idTablaActual+"_"+count);
                //Nosocomio
                $(this).find("td").eq(1).find("select").prop("id", "idNosocomio_"+idTablaActual+"_"+count);
                $(this).find("td").eq(1).find("input").prop("id", "buscarNosocomio_"+idTablaActual+"_"+count);
                $(this).find("td").eq(1).find("img").attr("onclick", "buscarNosocomio('"+idTablaActual+"_"+count+"')");
                //Codigo del procedimiento
                $(this).find("td").eq(2).find("input").prop("id", "codProced_"+idTablaActual+"_"+count);
                $(this).find("td").eq(2).find("input").attr("onkeyup", "validarTipoProyeccion('"+idTablaActual+"_"+count+"')")
                $(this).find("td").eq(2).find("img").attr("onclick", "buscarProcedimientoPorCodigo('"+idTablaActual+"_"+count+"')");
                //Descripcion del procedimiento
                $(this).find("td").eq(3).find("textarea").prop("id", "descripProced_"+idTablaActual+"_"+count);
                $(this).find("td").eq(3).find("textarea").attr("onkeyup", "resetIdTarifa('"+idTablaActual+"_"+count+"')")
                $(this).find("td").eq(3).find("img").prop("id", "btnBusqueda_"+idTablaActual+"_"+count);
                $(this).find("td").eq(3).find("img").attr("onclick", "buscarProcimientoPorDescripcion('"+idTablaActual+"_"+count+"')");
                //Unidades
                $(this).find("td").eq(4).find("input").prop("id", "unidades_"+idTablaActual+"_"+count);
                // Factor
                $(this).find("td").eq(5).find("input").prop("id", "factor_"+idTablaActual+"_"+count);
                $(this).find("td").eq(5).find("input").attr("onkeyup", "calcularMontoFactor('"+idTablaActual+"_"+count+"')")

                $(this).find("td").eq(6).find("input").prop("id", "monto_"+idTablaActual+"_"+count);
                $(this).find("td").eq(6).find("input").attr("onkeyup", "recalcularAcumulado('monto_"+idTablaActual+"_"+count+"')")
                $(this).find("td").eq(7).find("input").prop("id", "acumulado_"+idTablaActual+"_"+count);
            }
            // recalcula el monto
            if($("#monto_"+idTablaActual+"_"+count).val()==""){
                $("#monto_"+idTablaActual+"_"+count).val(0);
            }
            montoAcumulado = parseFloat(montoAcumulado) + parseFloat($("#monto_"+idTablaActual+"_"+count).val());
            $("#acumulado_"+idTablaActual+"_"+count).val(montoAcumulado);

            // recalcula la secuencia de meses

            var mesProyeccion = $(this).find("td").eq(0).find("input").val().split("(")[0];
            if(count==0){// primer registro:
                mesXmes[mesProyeccion]=mesProyeccionActual;
                $(this).find("td").eq(0).find("input").val(mesProyeccionActual+"("+secuencia+")");
            }else{
                if(mesProyeccion==mesProyeccionReal){
                    secuencia++;
                }else{
                    secuencia = 1;
                    mesXmes[mesProyeccion] = getSiguienteMes(mesProyeccionReal);
                }
                $(this).find("td").eq(0).find("input").val(mesXmes[mesProyeccion]+"("+secuencia+")");
            }
            mesProyeccionReal = mesProyeccion;
        })
        $("#idTotal_"+idTablaActual).val(montoAcumulado);
    }catch(err){
        emitirErrorCatch(err, "recalcularTablaProyeccion");
    }
}
function getSiguienteMes(mes){
    try{
        mes = mes.split("/");
        var month = parseInt(mes[0]);
        var year = parseInt(mes[1]);
        if(month==12){
            month=1;
            year++;
        }else{
            month++;
        }
        if(month<10){
            month="0"+month;
        }
        return month+"/"+year;
    }catch(err){
        emitirErrorCatch(err, "getSiguienteMes")
    }
}
function getAnteriorMes(mes){
    try{
        mes = mes.split("/");
        var month = parseInt(mes[0]);
        var year = parseInt(mes[1]);
        if(month==1){
            month=12;
            year--;
        }else{
            month--;
        }
        if(month<10){
            month="0"+month;
        }
        return month+"/"+year;
    }catch(err){
        emitirErrorCatch(err, "getAnteriorMes")
    }
}
function guardarProyecciones(){
    try{
        var listaProyecciones = [];
        var totalAcumulado=0;
        var continuar=true;
        if(validarCamposRequeridos("divAgraviado")){
            for(var z=0; z<cobertura.length; z++){
                if(continuar){
                    var idTabla = cobertura[z].id;
                    if($("#tabla_acumulado_"+idTabla+" > tbody >tr").length>0){
                        if(idTabla=='4' || idTabla=='5'){ // fase muerte o sepelio
                            for(var y=0; y<$("#tabla_acumulado_"+idTabla+" > tbody >tr").length; y++){
                                var monto = $("#monto_"+idTabla+"_"+y).val();
                                if(monto!="" && parseFloat(monto)>0){
                                    listaProyecciones.push({
                                        mes : $("#mes_"+idTabla+"_"+y).val(),
                                        idNosocomio:0,
                                        idTarifaProcedimiento:0,
                                        factor:"",
                                        tratamiento:$("#tratamiento_"+idTabla+"_"+y).val(),
                                        monto:$("#monto_"+idTabla+"_"+y).val(),
                                        idFase:idTabla
                                    });
                                    totalAcumulado = totalAcumulado + parseFloat(($("#monto_"+idTabla+"_"+y).val()=="")?0:$("#monto_"+idTabla+"_"+y).val());
                                }else{
                                    idFilaTRActual = idTabla+"_"+y;
                                    continuar=false;
                                    break;
                                }
                            }
                        }else{
                            for(var y=0; y<$("#tabla_acumulado_"+idTabla+" > tbody >tr").length; y++){
                                var monto = $("#monto_"+idTabla+"_"+y).val();
                                if(monto!="" && parseFloat(monto)>0){
                                    listaProyecciones.push({
                                        mes : $("#mes_"+idTabla+"_"+y).val(),
                                        idNosocomio:$("#idNosocomio_"+idTabla+"_"+y).val(),
                                        idTarifaProcedimiento:$("#unidades_"+idTabla+"_"+y).attr("idTarifa"),
                                        factor:$("#factor_"+idTabla+"_"+y).val(),
                                        tratamiento:$("#descripProced_"+idTabla+"_"+y).val(),
                                        monto:$("#monto_"+idTabla+"_"+y).val(),
                                        idFase:idTabla
                                    });
                                    totalAcumulado = totalAcumulado + parseFloat(($("#monto_"+idTabla+"_"+y).val()=="")?0:$("#monto_"+idTabla+"_"+y).val());
                                }else{
                                    idFilaTRActual = idTabla+"_"+y;
                                    continuar=false;
                                    break;
                                }
                            }
                        }
                    }
                }else{
                    break;
                }
            }
            if(continuar){
                if(totalAcumulado>0){
                    var parametrosPost={
                        listaProyecciones:listaProyecciones,
                        totalAcumulado:totalAcumulado,
                        codEvento:codEvento,
                        codAgraviado:codAgraviado
                    }
                    fancyConfirm("¿ Actualiza datos ?", function(rpta){
                        if(rpta){
                            DAO.consultarWebServicePOST(parametrosPost, "registrarProyecciones", function(data){
                                if(data[0]>0){
                                    //Todo OK
                                    var params = "&codAgraviado="+codAgraviado;
                                    DAO.consultarWebServiceGet("getTotalProyectado", params, function(data) {
                                        montoProyecciones = data;
                                        //cuando se seleccione esta pestaña se actualizaran los datos
                                        $("#ui-id-1").parent().click(function(){
                                            cargarCamposPorEtapa(1); //solo refresca 1ra etapa/fase
                                            cargarInfoEtapa(1);
                                        });
                                        $.fancybox.close();
                                    });
                                }
                            });
                        }
                    });
                }else{
                    fancyAlert("¡Debe proveer al menos un gasto para el Agraviado!");
                }
            }else{
                var tabla = parseInt(idFilaTRActual.split("_")[0]);
                var nombrePestañas = ["Gastos Médicos", "Incapacidad Temp.", "Invalidez Perman.", "Muerte", "Sepelio"];
                clickPestaña(nombrePestañas[tabla-1]);
                fancyAlertFunction("Debe ingresar el monto para el mes "+$("#mes_"+idFilaTRActual).val()+" de la etapa: "+nombrePestañas[tabla-1], function(){
                    $("#monto_"+idFilaTRActual).focus();
                })
            }
        }
    }catch(err){
        emitirErrorCatch(err, "guardarProyecciones");
    }
}
var idFilaTRActual = ""; // Guarda el id de la fila actual para despues realizar un focus en alguno de sus elementos
function buscarProcedimientoPorCodigo(idFila){ // Recibe como parametro el id de fila de la tabla (tr)
    try{
        idFilaTRActual = idFila;
        var codProcedimiento = $("#codProced_"+idFila).val(); // obtiene el codigo de procedimiento
        if(codProcedimiento!=""){
            if(codProcedimiento!='55555'){
                var idNosocomioSeleccionado = $("#idNosocomio_"+idFila).val();
                if(idNosocomioSeleccionado!=""){
                    // abre la ventana donde se muestran los resultados de la busqueda
                    var tipoNosocomio = idNosocomioSeleccionado.split("-")[1]; // obtiene el tipo de nosocomio (H=Hospital; C=Clinica)
                    abrirVentanaFancyBox("600", "350", "busqueda_procedimientos?tipo=C&busqueda="+codProcedimiento+"&tipoNosoc="+tipoNosocomio, true, function(data){
                        // carga el procedimiento seleccionado
                        $("#codProced_"+idFilaTRActual).val(data[0].codigoProcedimiento);
                        $("#descripProced_"+idFilaTRActual).val(data[0].descripcion);
                        $("#unidades_"+idFilaTRActual).val(data[0].unidades);
                        $("#unidades_"+idFilaTRActual).attr("idTarifa", data[0].idTarifa);
                        $("#factor_"+idFilaTRActual).val("")
                        $("#factor_"+idFilaTRActual).prop("disabled", false);
                        $("#factor_"+idFilaTRActual).focus();
                        $("#monto_"+idFilaTRActual).val("");
                        recalcularAcumulado("monto_"+idFilaTRActual);
                    });
                }else{
                    fancyAlertFunction("Debe seleccionar un nosocomio", function(){
                        $("#idNosocomio_"+idFilaTRActual).focus();
                    })
                }
            }
        }else{
            fancyAlertFunction("Debe ingresar el codigo de procedimiento a buscar", function(){
                $("#codProced_"+idFilaTRActual).focus();
            });
        }
    }catch(err){
        emitirErrorCatch(err, "buscarProcedimientoPorCodigo")
    }
}

function buscarProcimientoPorDescripcion(idFila){ // // Recibe como parametro el id de fila de la tabla (tr)
    try{
        var estado = $("#descripProced_"+idFila).prop("disabled");
        if(!estado){ // si esta habilitado el campo de texto realiza la busqueda
            idFilaTRActual = idFila;
            var descripcionProcedimiento = $("#descripProced_"+idFila).val(); // obtiene la descripcion del procedimiento
            if(descripcionProcedimiento!=""){
                var idNosocomioSeleccionado = $("#idNosocomio_"+idFila).val();
                if(idNosocomioSeleccionado!=""){
                    var tipoNosocomio = idNosocomioSeleccionado.split("-")[1]; // obtiene el tipo de nosocomio (H=Hospital; C=Clinica)
                    // abre la ventana donde se muestran los resultados de la busqueda
                    abrirVentanaFancyBox("600", "350", "busqueda_procedimientos?tipo=D&busqueda="+descripcionProcedimiento+"&tipoNosoc="+tipoNosocomio, true,function(data){
                        // carga el procedimiento seleccionado
                        $("#codProced_"+idFilaTRActual).val(data[0].codigoProcedimiento);
                        $("#descripProced_"+idFilaTRActual).val(data[0].descripcion);
                        $("#unidades_"+idFilaTRActual).val(data[0].unidades);
                        $("#unidades_"+idFilaTRActual).attr("idTarifa", data[0].idTarifa);
                        $("#factor_"+idFilaTRActual).val("")
                        $("#factor_"+idFilaTRActual).prop("disabled", false);
                        $("#factor_"+idFilaTRActual).focus();
                        $("#monto_"+idFilaTRActual).val("");
                        recalcularAcumulado("monto_"+idFilaTRActual);
                    });
                }else{
                    fancyAlertFunction("Debe seleccionar un nosocomio", function(){
                        $("#idNosocomio_"+idFilaTRActual).focus();
                    })
                }
            }else{
                fancyAlertFunction("Debe ingresar la descripcion de procedimiento a buscar", function(){
                    $("#descripProced_"+idFilaTRActual).focus();
                });
            }
        }
    }catch(err){
        emitirErrorCatch(err, "buscarProcimientoPorDescripcion")
    }
}
function buscarNosocomio(idFila){ // realiza la busqueda de un nosocomio
    try{
        var estado = $("#buscarNosocomio_"+idFila).prop("disabled");
        if(!estado){
            idFilaTRActual = idFila;
            if($("#buscarNosocomio_"+idFila).val()!=""){
                var parametros = "&nosocomio="+$("#buscarNosocomio_"+idFila).val();
                DAO.consultarWebServiceGet("getNosocomioByNombre", parametros, function(data){
                    for(var i=0; i<data.length;i++){
                        data[i].idCompuesto = data[i].idNosocomio+"-"+data[i].tipo;
                    }
                    agregarOpcionesToCombo("idNosocomio_"+idFilaTRActual, data, {"keyId":"idCompuesto", "keyValue":"nombre"});
                    openSelect($("#idNosocomio_"+idFilaTRActual));
                    $.fancybox.close();
                });
            }else{
                fancyAlertFunction("¡Debe ingresar el nosocomio a buscar!", function(rpta){
                    if(rpta){
                        $("#buscarNosocomio_"+idFilaTRActual).focus();
                    }
                })
            }
        }
    }catch(err){
        emitirErrorCatch(err, "buscarNosocomio()");
    }
}
function resetIdTarifa(idFila){ // reinicia el procedimiento
    try{
        if($("#codProced_"+idFila).val()!="55555"){ // solo para proyecciones con el tarifario
            $("#factor_"+idFila).val("");
            $("#factor_"+idFilaTRActual).prop("disabled", true);

            $("#unidades_"+idFila).val("");
            $("#monto_"+idFila).val("");
            $("#unidades_"+idFila).attr("idTarifa", "");
            recalcularAcumulado("monto_"+idFila);
        }
    }catch(err){
        emitirErrorCatch(err, "resetIdTarifa");
    }
}
function calcularMontoFactor(idFila){
    try{
        var valorFactor = $("#factor_"+idFila).val();
        if(valorFactor.trim()==""){
            valorFactor = 0;
        }
        valorFactor = parseFloat(valorFactor);
        var valorUnidades = parseFloat($("#unidades_"+idFila).val());
        var monto = valorFactor*valorUnidades;
        $("#monto_"+idFila).val(monto);
        recalcularAcumulado("monto_"+idFila); // reajusta el acumulado
    }catch(err){
        emitirErrorCatch(err, "calcularMontoFactor");
    }
}
//***FIN > FUNCIONES PESTAÑA PROVISIONES

function cargarInfoEtapa(idEtapa){ // carga informacion con respeto a las UIT disponible por etapa
	try{
		// total UIT:
		//debugger
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
		for(var i=0; i<listadoCartas.length;i++){
			if(listadoCartas[i].estado=='P' && listadoCartas[i].idCobertura == idEtapa && listadoCartas[i].idCarta!=idCarta){
				totalCartas = totalCartas+ listadoCartas[i].montoUnidades
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
function mostrarCartasPrevias(){
	// abre popup:
	abrirVentanaFancyBox(750, 430, "cartas_previas", true);
}
var dataTable1;
function listarCartas(resultsData){
	try{
		for(var i=0; i<resultsData.length; i++){
			resultsData[i].etapa=etapaList[resultsData[i].idCobertura];
			//resultsData[i].asistencia=tipoAsistList[resultsData[i].tipoAsistencia];		
			resultsData[i].estadoCarta = estadoCartaGarantia[resultsData[i].estado]; // obtiene la descripcion del estado de la carta
			resultsData[i].montoUnidades = resultsData[i].monto 
			resultsData[i].monto = "S/. "+resultsData[i].monto;
			if(resultsData[i].idPrimeraProyeccion==0){
				resultsData[i].nroCarta=LPAD(resultsData[i].idCarta, numeroLPAD);
			}
			resultsData[i].nosocomio_funeraria = resultsData[i].nombreNosocomio;
			if(resultsData[i].idCobertura == '5'){ // si es sepelio se toma el nombre de la funeraria en vez del nosocomio
				resultsData[i].nosocomio_funeraria = resultsData[i].nombreFuneraria;
			}
		}
		listadoCartas = resultsData;
        //Ampliacion 10/JUL/2019 >> llena lista de Cartas Previas en 2da pestaña

        for(var i=0; i<resultsData.length;i++){
            resultsData[i].numero=i+1
        }
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'numero', alineacion:'center'},
            {campo:'etapa', alineacion:'center'},
            {campo:'nosocomio_funeraria', alineacion:'center'},
            {campo:'estadoCarta', alineacion:'center'},
            {campo:'nroCarta', alineacion:'center'},
            {campo:'fecha', alineacion:'center'},
            {campo:'asistencia', alineacion:'center'},
            {campo:'monto', alineacion:'center'}
        ];
        if(dataTable1!=undefined){
            dataTable1.destroy();
        }
        crearFilasHTML("tabla_cartas", resultsData, camposAmostrar, false, 10.5); // crea la tabla HTML
        var columns=[
            { "width": "4%"},
            { "width": "19%"},
            { "width": "21%"},
            { "width": "12%"},
            { "width": "12%"},
            { "width": "8%"},
            { "width": "14%"},
            { "width": "10%"}
        ];
        dataTable1=parseDataTable( "tabla_cartas", columns, 470, false, false, false, false);
        //cuando se seleccione esta pestaña se actualizara el tamaño de las columnas
        $("#ui-id-2").parent().click(function(){
            dataTable1.columns.adjust().draw();
            });
        $.fancybox.close();

		DAO.consultarWebServiceGet("getTotalFacturaPorEtapa", "&codAgraviado="+codAgraviado, function(resultsFacturas){
			if(resultsFacturas.length>0){
				montoFacturasPorEtapa = resultsFacturas[0]
			}
			DAO.consultarWebServiceGet("getTotalOrdenesPorEtapa", "&codAgraviado="+codAgraviado, function(resultsOrdenes){
				if(resultsOrdenes.length>0){
					montoOrdenesPorEtapa = resultsOrdenes[0]
				}
				
				$.fancybox.close()
				$("#idEtapa").change()
				
			})
		})
		
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
							"&diagnosticoFinal="+$("#idDiagnosticoFinal").val()+
                            "&observaciones="+$("#idObservaciones").val()+
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