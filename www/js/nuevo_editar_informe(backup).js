/**
 * Created by JEAN PIERRE on 23/06/2016.
 */
var dataTable_Agraviados;
var accion; // E=Editar Informe / N=Nuevo Informe
var codEvento;
var idProcurador=0;
var idAsociado=0;
var idInforme=0;
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var arrayDepartamentos=new Array();
var idNosocomioPorCentralEmergencia="";
var idAgraviadoKey = 0; // flat unico cuando se agrega un agraviado
var montoGarantia={} //{"E":0.5, "U":0.1, "I":1.5};
var UIT=0;// = 3950;
var listaCalificacion=[
	{id:1, description:"¿Accidente probado de manera cierta?"},
	{id:2, description:"¿Se entrevistó al conductor AD?"},
	{id:3, description:"¿Se entrevistó a los demás participantes?"},
	{id:4, description:"¿Existe parte policial en el C. de Salud?"},
	{id:5, description:"¿El accidente fue constatado por la policía?"},
	{id:6, description:"¿Se verificaron daños del vehículo?"},
	{id:7, description:"¿Está determinada la participación del AD?"},
	{id:8, description:"¿Existen posibilidades de Recupero?"},
	{id:9, description:"¿Conductor ebrio o en estado de drogadicción?"},
	{id:10, description:"¿Conductor sin licencia?"},
	{id:11, description:"¿TP Responsable?"},
	{id:12, description:"¿Licencia faculta a manejar vehículo asociado?"},
	{id:13, description:"¿Uso del vehiculo distinto al del CAT Asociado?"},
	{id:14, description:"¿Uso fraudulento del CAT?"}	
];
var rebuildingAgraviados = true;
cargarInicio(function(){
    $("#ui-id-4").parent().click(function(){ // Click TAB DE COMISARIA: Valida que se haya seleccionado previamente el distrito del accidente.
        if($("#idComisaria").val()==""){ // No existe ninguna comisaria seleccionada
            if($("#select_E").val()==""){
                $("#idComisaria").html("<option value=''>Seleccione</option>");
                fancyAlertFunction("¡Debe seleccionar el distrito del accidente para que se cargen las comisarias!", function(rpta){
                    if(rpta){
                        $("#ui-id-1").click();
                        $("#select_E").focus();
                    }
                });
            }
        }
    });
    $("#ui-id-5").parent().click(function(){ // click TAB AGRAVIADOS : Ajusta el ancho de las columnas de la tabla
        if(rebuildingAgraviados){
            dataTable_Agraviados.columns.adjust().draw();
            rebuildingAgraviados = false;
        }
    });
    accion = $_GET('accion');
    codEvento = $_GET("codEvento");
    $("#idFechaAccidente").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
    $("#idFechaAviso").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
	$("#idHoraExCualitativo").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
	$("#idHoraExCuantitativo").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
    $("#idFechaInicioInv").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
    $("#idFechaFinInv").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
    $("#idResultadoDosaje").keypress(function(event){
        return isNumberKey(event);
    });
	DAO.consultarWebServiceGet("consultarCostosGlobales", "", function(datos){
		UIT = datos[0].UIT;
		montoGarantia.E = datos[0].asistencia_E;
		montoGarantia.U = datos[0].asistencia_U;
		montoGarantia.I = datos[0].asistencia_I;
		cargarTipoAccidentes(function(){ // carga la lista de los tipos de accidente
			cargarListaCausales(function(){
				DAO.consultarWebServiceGet("getAllDistritos", "", function(data){
					arrayDistritos=data; // Guarda los distritos
					DAO.consultarWebServiceGet("getAllProvincias", "", function(datos){
						arrayProvincias=datos;
						DAO.consultarWebServiceGet("getAllDepartamentos", "", function(depas){
							arrayDepartamentos=depas;
							/** Carga combo distrito para el evento **/                        
							$("#select_E").change(function(){
								cargarProvinciasDep("E", idProvinciaSelect);
							});
							$("#select_E").change(function(){ // carga las comisaria segun el distrito que se selecciona
								if($("#select_E").val()!="OTRP"){ // sino se ha seleccionado ninguna comisaria se cargan las comisarias del distrito del accidente seleccionado.
									if($("#idComisaria").val()==""){
										cargarComisariaXdistrito($("#select_E").val(), function(){
											$.fancybox.close();
										});
									}
									cargarNosocomiosAgraviados($("#select_E").val(), function(){
										$.fancybox.close();
									});
								}else{
									if($("#select_E").val()=='OTRP'){
										$("#select_E").val("");
									}
								}
							});
							$("#btnCambiarProv_E").click(function(){
								cargarProvinciasDep("E", idProvinciaSelect, "button");
							});
							//$("#select_E").select2();

							/** carga combo distrito para el asociado **/                        
							$("#select_A").change(function(){
								cargarProvinciasDep("A", idProvinciaSelect);
							})
							$("#btnCambiarProv_A").click(function(){
								cargarProvinciasDep("A", idProvinciaSelect, "button");
							});
							//$("#select_A").select2();
							$("#wb_idBucarComisaria").click(buscarComisaria); // Boton para buscar otra comisaria
							$("#idBtnAgregarAgraviado").click(agregarAgraviado);
							$("#idBtnNuevoVehiculo").click(agregarVehiculo);
							$("#btnRegistro").click(guardarDatos);
							if(accion == 'N'){
								cargarInfoCentralEmergencia()
								// agrega funcion a los botones de busqueda de DNI
								$("#btnBuscarPersona_pc").click(function(){
									buscarPersona("pc");
								});
								$("#btnBuscarPersona_pp").click(function(){
									buscarPersona("pp");
								});
								$("#btnBuscarPersona_pp2").click(function(){
									buscarPersona("pp2");
								});
								$("#btnBuscarPersona_pmc").click(function(){
									buscarPersona("pmc");
								});
								$("#btnBuscarPersona_ppc").click(function(){
									buscarPersona("ppc");
								});
							}else{
								idInforme = $_GET("idInforme");
								cargarInfoInforme();
							}
						})
					})
				});
			});
		});
	});    
});
function cargarInfoCentralEmergencia() {
    try{
        // cargar la informacion de la ocurrencia registrada por la central de emergencias
        var parametros = "&codEvento="+codEvento;
        DAO.consultarWebServiceGet("getInfoCentralDeEmergencias", parametros, function(resultsData){
            idProcurador = resultsData[0].idProcurador;
            idAsociado = resultsData[0].idAsociado;
			if(resultsData[0].idNosocomio>0){
				idNosocomioPorCentralEmergencia = resultsData[0].idNosocomio+"-"+resultsData[0].tipoNosocomio;				
			}            
            if(resultsData.length>0){
				/* valida los valores de algunos campos */
				resultsData[0].polizaAccidente=quitarEspaciosEnBlanco(resultsData[0].polizaAccidente);
				resultsData[0].placa = quitarEspaciosEnBlanco(resultsData[0].placa);
				if(resultsData[0].polizaAccidente==0){
					resultsData[0].polizaAccidente="";
				}
				if(resultsData[0].idTipoAccidente==0){
					resultsData[0].idTipoAccidente="";
				}
				if(resultsData[0].idNosocomio==0){
					resultsData[0].idNosocomio="";
				}
				if(resultsData[0].idComisaria==0){
					resultsData[0].idComisaria="";
				}
				resultsData[0].asociado="";
				switch(resultsData[0].tipoPersona){
					case 'N':
						resultsData[0].asociado=resultsData[0].nombreAsociado;
						break;
					case 'J':
						resultsData[0].asociado=resultsData[0].razonSocial;
						break;
				}
                cargarOcurrenciaTAB(resultsData);
                cargarAsociadoTAB(resultsData);
                cargarResponsablesTAB(resultsData);
                cargarComisariaTAB(resultsData);
				cargarAgraviadosTAB(resultsData[0].listaAgraviados); // carga agraviados
                cargarCalificacionTAB(); // carga las preguntas de la clasificacion
                $.fancybox.close();
            }else{
                fancyAlert("ERROR, No se encontro informacion de la central de emergencia")
            }
        });
    }catch(err){
        emitirErrorCatch(err, "cargarInfoCentralEmergencia()")
    }
};
function cargarInfoInforme(){
    try{
        var parametros = "&idInforme="+idInforme+"&codEvento="+codEvento;
        DAO.consultarWebServiceGet("getInfoInforme", parametros, function(resultsData){
            idProcurador = resultsData[0].idProcurador;
            idAsociado = resultsData[0].idAsociado;
			UIT = resultsData[0].UIT;
            if(resultsData.length>0) {
                /* valida los valores de algunos campos */
                resultsData[0].placa = quitarEspaciosEnBlanco(resultsData[0].placa);
                if (resultsData[0].idTipoAccidente == 0) {
                    resultsData[0].idTipoAccidente = "";
                }
                if (resultsData[0].idNosocomio == 0) {
                    resultsData[0].idNosocomio = "";
                }
                if (resultsData[0].idComisaria == 0) {
                    resultsData[0].idComisaria = "";
                }
                resultsData[0].asociado = "";
                switch (resultsData[0].tipoPersona) {
                    case 'N':
                        resultsData[0].asociado = resultsData[0].nombreAsociado;
                        break;
                    case 'J':
                        resultsData[0].asociado = resultsData[0].razonSocial;
                        break;
                }
                resultsData[0].referenciaAccidente = "";
            }
            //** cargar ocurrencia
            cargarOcurrenciaTAB(resultsData);
            //** cargar asociado
			cargarAsociadoTAB(resultsData);
            //** cagar responsables
			cargarResponsablesTAB(resultsData);
            //** cagar comisaria / Dosaje etilico
            cargarComisariaTAB(resultsData);
            //** cargar agraviados
            cargarAgraviadosTAB(resultsData[0].listaAgraviados, resultsData[0].distritoAccidente)
            //** cargar calificacion
			cargarCalificacionTAB(resultsData);
            var vencimientoPoliza =false;
            if($("#idVencPoliza").val()!=""){
                var fechaVencimiento = $("#idVencPoliza").val().split("/");
                var DateVencimiento = new Date(fechaVencimiento[2], (parseInt(fechaVencimiento[1])-1), fechaVencimiento[0]);
                var hoy = new Date();
                if(hoy>DateVencimiento && $_GET('soloLectura')!='T'){
                    vencimientoPoliza=true;
                    clickPestaña("Asociado");
                    fancyAlert("¡ El CAT ha caducado !");
                }
            }
            if(!vencimientoPoliza){
                $.fancybox.close();
            }
        });
    }catch(err){
        emitirErrorCatch(err, "cargarInfoInforme()")
    }
}
function cargarOcurrenciaTAB(resultsData){
    try{
        // ** cargar ocurrencia
        $("#idFechaAccidente").val(resultsData[0].fechaAccidente);
        $("#idFechaAviso").val(resultsData[0].fechaAviso);
        $("#idTipoAccidente").val(resultsData[0].idTipoAccidente);
        cargarComboDistritos("E", resultsData[0].distritoAccidente);
        if(resultsData[0].distritoAccidente!=null){
            $("#select_E").val(resultsData[0].distritoAccidente);
        }
        $("#idDireccion").val(resultsData[0].lugarAccidente+((resultsData[0].referenciaAccidente!="")?", "+resultsData[0].referenciaAccidente:""));
        if(accion=='E'){ // carga los demas campos
            $("#idCausal").val(resultsData[0].idCausal);
            cargarListaVehiculos(resultsData[0].vehiculos); // carga los vehiculos
        }else{
            cargarListaVehiculos();
        }
    }catch(err){
        emitirErrorCatch(err, "cargarOcurrenciaTAB()");
    }
}
function cargarAsociadoTAB(resultsData){
    try{
        // ** cargar asociado
        // CAT:
		if(accion == 'N'){
			$("#nroCAT").val(resultsData[0].polizaAccidente);
			$("#placa").val(resultsData[0].placaAccidente);
		}else{
			$("#nroCAT").val(resultsData[0].nroCAT);
			$("#placa").val(resultsData[0].placa);
		}
        $("#idVencPoliza").val(resultsData[0].fechaCaducidad);
        
        if(resultsData[0].nroCAT!=null){
            $("#idNombreAsociado").val(resultsData[0].asociado);
            $("#idNroDocAsociado").val(resultsData[0].nroDocumento);
            cargarComboDistritos("A", resultsData[0].distrito_a);
            $("#select_A").val((resultsData[0].distrito_a!=null) ? resultsData[0].distrito_a : "");
            $("#idCalle").val(resultsData[0].calle_a);
            $("#idNro").val(resultsData[0].nro_a);
            $("#idMzLt").val(resultsData[0].mzLote_a);
            $("#idSector").val(resultsData[0].sector_a);
            $("#idReferencia").val(resultsData[0].referencia_a);
            // datos del vehiculo del asociado
            $("#idPlaca_v").val(resultsData[0].placa);
            $("#idMarca_v").val(resultsData[0].marca);
            $("#idModelo_v").val(resultsData[0].modelo);
            $("#idAno_v").val(resultsData[0].anno)

            $("#btnValidarPoliza").val("Cambiar")
            $("#btnValidarPoliza").click(cambiarPoliza);

            $("#nroCAT").prop("disabled", true);
            $("#placa").prop("disabled", true);
        }else{
            $("#btnValidarPoliza").click(validarPoliza);
        }
    }catch(err){
        emitirErrorCatch(err, "cargarAsociadoTAB()");
    }
}
var idChofer = 0;
var idPropietario = 0;
var idPropietario2 = 0
function cargarResponsablesTAB(resultsData){
    try{
        switch (accion){
            case 'N':
                // ** cargar responsable chofer
                $("#idDNI_pc").val(resultsData[0].DNIChoferAccidente);
                $("#idNombres_pc").val(resultsData[0].choferAccidente);
                break;
            case 'E':
				var dniChofer = resultsData[0].DNI_pc;
				var dniPropietario = resultsData[0].DNI_pp;
				var dniPropietario2 = resultsData[0].DNI_pp2;
				var dniMadreChofer = resultsData[0].DNI_pmc;
				var dniPadreChofer = resultsData[0].DNI_ppc;
				// Chofer:
				if(dniChofer!=null){
					idChofer = resultsData[0].idChofer;
					var persona_pc = crearObjectoPersona("pc", resultsData[0]);
					cargarResultPersona(persona_pc, "pc");
					$("#idLicencia").val(resultsData[0].licenciaChofer);
					$("#idClase").val(resultsData[0].claseChofer);
				}else{
					$("#btnBuscarPersona_pc").click(function(){
						buscarPersona("pc");
					});				
				}
				// Propietario
				if(dniPropietario!=null){
					idPropietario = resultsData[0].idPropietario;
					var persona_pp = crearObjectoPersona("pp", resultsData[0]);	
					cargarResultPersona(persona_pp, "pp");	
				}else{
					$("#btnBuscarPersona_pp").click(function(){
						buscarPersona("pp");
					});				
				}
				// Propietario2
				if(dniPropietario2!=null){
					idPropietario2 = resultsData[0].idPropietario2;
					var persona_pp2 = crearObjectoPersona("pp2", resultsData[0]);
					cargarResultPersona(persona_pp2, "pp2");	
				}else{
					$("#btnBuscarPersona_pp2").click(function(){
						buscarPersona("pp2");
					});				
				}
				// Madre del chofer
				if(dniMadreChofer!=null){
					var persona_pmc = crearObjectoPersona("pmc", resultsData[0]);
					cargarResultPersona(persona_pmc, "pmc");	
				}else{
					$("#btnBuscarPersona_pmc").click(function(){
						buscarPersona("pmc");
					});
				}
				// Padre del chofer
				if(dniPadreChofer!=null){
					var persona_ppc = crearObjectoPersona("ppc", resultsData[0]);
					cargarResultPersona(persona_ppc, "ppc");
				}else{
					$("#btnBuscarPersona_ppc").click(function(){
						buscarPersona("ppc");
					});
				}				
                break;
        }
    }catch(err){
        emitirErrorCatch(err, "cargarResponsablesTAB()")
    }
}
function crearObjectoPersona(flagPersona, objetoData){
	try{
		$("#idDNI_"+flagPersona).val(objetoData['DNI_'+flagPersona]);
		return 	[{
				idPersona: objetoData['idPersona_'+flagPersona],
				nombres: objetoData['nombres_'+flagPersona],
				apellidoPaterno: objetoData['apellidoPaterno_'+flagPersona],
				apellidoMaterno: objetoData['apellidoMaterno_'+flagPersona]
			}]
	}catch(err){
		emitirErrorCatch(err, "crearObjectoPersona");
	}
}
function cargarComisariaTAB(resultsData){
    try{
        // ** cargar comisarias
        var idDistritoComisaria = resultsData[0].distritoComisaria;
        if(idDistritoComisaria==null){
            if(resultsData[0].distritoAccidente!=null){
                idDistritoComisaria=resultsData[0].distritoAccidente;
            }
        }
        if(idDistritoComisaria!=null){
            cargarComisariaXdistrito(idDistritoComisaria, function(){
                $("#idComisaria").val((resultsData[0].idComisaria!=null) ? resultsData[0].idComisaria : "");
            });
        }
        if(accion=='E'){
            $("#idCodDenuncia").val(resultsData[0].codigoDenuncia);
            $("#idHoraExCualitativo").val(resultsData[0].horaExamenCualitativo);
            $("#idHoraExCuantitativo").val(resultsData[0].horaExamenCuantitativo);
            $("#idResultadoDosaje").val(resultsData[0].resultadoExamenEtilico);
            $("#idFechaInicioInv").val(resultsData[0].fechaInicioInvestigacion);
            $("#idFechaFinInv").val(resultsData[0].fechaFinInvestigacion);
        }
    }catch(err){
        emitirErrorCatch(err, "cargarComisariaTAB()");
    }
}
function cargarComisariaXdistrito(idDistritoComisaria, callback){
    try{
        var param = "&idDistrito="+idDistritoComisaria;
        DAO.consultarWebServiceGet("getListaComisarias", param, function(datos){
            agregarOpcionesToCombo("idComisaria", datos, {"keyId":"idComisaria", "keyValue":"nombre"});
            if(typeof callback == 'function'){
                callback();
            };
        });
    }catch(err){
        emitirErrorCatch(err, "cargarComisariaXdistrito()")
    }
}
function cargarNosocomiosAgraviados(idDistritoAccidente, callback){
    try{
        var param = "&idDistrito="+idDistritoAccidente;
        DAO.consultarWebServiceGet("getListaNosocomios", param, function(datos){
            for(var i=0; i<datos.length; i++){
                datos[i].idNosocomio_tipo = datos[i].idNosocomio+"-"+datos[i].tipo;
            }
            $("#tabla_agraviados > tbody >tr").each(function(){
                var idNosocomioSeleccionado = $(this).find("td").eq(7).find("select").val();
                var idSelectNosocomio = $(this).find("td").eq(7).find("select").attr("id");
                if(idNosocomioSeleccionado==""){
                    agregarOpcionesToCombo(idSelectNosocomio, datos, {keyValue:"nombre", keyId:"idNosocomio_tipo"});
                }
            });
            if(typeof callback == 'function'){
                callback();
            };
        });
    }catch(err){
        emitirErrorCatch(err, "cargarNosocomiosAgraviados");
    }
}
var listaNosocomiosXagraviado = new Array();
function cargarAgraviadosTAB(data, distritoAccidente){
    try{
        switch(accion){
            case 'N':
                for(var i=0; i<data.length; i++){
                    data[i].html_dni = "<input id='idDNI_"+data[i].codAgraviado+"' class='"+data[i].codAgraviado+"' type='text' style='width: 65px; font-size:12px;' value='"+data[i].dniAccidente+"'>&nbsp<input id='btnBuscarPersona_"+data[i].codAgraviado+"' type='button' value='Buscar' onclick='buscarPersona("+'"'+data[i].codAgraviado+'"'+")'/>";
                    data[i].html_nombres = "<input id='idNombres_"+data[i].codAgraviado+"' type='text' style='width: 220px; font-size:12px;' value='"+data[i].nombreAccidente+"' disabled>";
                    data[i].html_paterno = "<input id='idApePat_"+data[i].codAgraviado+"' type='text' style='width: 160px; font-size:12px;' value='' disabled>";
                    data[i].html_materno = "<input id='idApeMat_"+data[i].codAgraviado+"' type='text' style='width: 160px; font-size:12px;' value='' disabled>";
                    data[i].html_edad = "<input id='idEdad_"+data[i].codAgraviado+"' type='text' style='width: 50px; font-size:12px;' value='"+data[i].edadAccidente+"'>";
                    data[i].html_diagnostico = "<input id='' type='text' style='width: 300px; font-size:12px;' value='"+data[i].diagnosticoAccidente+"'>";
                    var selectedU="";
                    var selectedI="";
                    var selectedE="";
                    var montoGarantia_disabled = calcularMontoGarantiaDB(data[i].tipoAsistencia, idNosocomioPorCentralEmergencia);

                    var monto = montoGarantia_disabled[0];
                    var disabled = montoGarantia_disabled[1];
					
					//listaNosocomiosXagraviado.push({codAgraviado:data[i].codAgraviado, idNosocomio:idNosocomioPorCentralEmergencia});

                    eval("selected"+data[i].tipoAsistencia+" = 'selected';");
                    data[i].html_asistencia = "<select id='tipoAsistencia_"+data[i].codAgraviado+"' onchange='calcularMontoGarantia("+'"'+data[i].codAgraviado+'"'+")'>" +
                        "<option value='U' "+selectedU+">Urgencia</option>" +
                        "<option value='I' "+selectedI+">Internamiento</option>" +
                        "<option value='E' "+selectedE+">Emergencia</option>" +
                        "</select>";
                    data[i].html_monto = "<input id='monto_"+data[i].codAgraviado+"' type='text' style='width: 70px; font-size:13px;' value='"+monto+"' "+disabled+">";
                    data[i].html_nosocomio = "<select style='width:185px;' class='lista_nosocomio' id='idNosocomio_"+data[i].codAgraviado+"' onchange='calcularMontoGarantia("+'"'+data[i].codAgraviado+'"'+")'><option value=''>Seleccione</option></select>&nbsp&nbsp<input type='text' placeholder='Buscar Nosocomio' id='buscarNosocomio_"+data[i].codAgraviado+"' style='width:120px; font-size:12px;'/>&nbsp&nbsp<img src='wpimages/search-icon.png' onclick='buscarNosocomio("+'"'+data[i].codAgraviado+'"'+")' width='18' height='18' style='cursor: pointer;'>";
                    data[i].html_telf = "<input id='idTelf_"+data[i].codAgraviado+"' type='text' style='width: 85px; font-size:12px;' value=''>";
                    data[i].html_borrar= "<a class='eraser' onclick='borrar(this, "+'"'+data[i].codAgraviado+'"'+")' style='cursor: pointer; text-decoration: none; font-size:11px;'>Borrar</a>";
                }
               break;
            case 'E':
                for(var i=0; i<data.length; i++){
                    var disabledDNI="";
                    var disabledNombres = "";
                    var onclick = "";
                    var nombres = "";
                    var paterno = "";
                    var materno = "";
                    var edad = "";
                    var DNI = "";
                    var telf = "";
                    var tituloBoton="";
                    if(data[i].idPersona>0){
                        disabledDNI = "disabled";
                        onclick = "cambiarDNI"
                        DNI = data[i].DNI;
                        nombres = data[i].nombres;
                        paterno = data[i].apellidoPaterno;
                        materno = data[i].apellidoMaterno;
                        edad = data[i].edad;
                        telf = data[i].telefonoMovil;
                        tituloBoton="Cambiar";
                    }else{
                        disabledNombres = "disabled";
                        onclick = "buscarPersona";
                        DNI = data[i].dniAccidente;
                        nombres=data[i].nombreAccidente;
                        edad = data[i].edadAccidente;
                        tituloBoton="Buscar";
                    }
                    data[i].html_dni = "<input id='idDNI_"+data[i].codAgraviado+"' "+disabledDNI+" class='"+data[i].codAgraviado+"' type='text' style='width: 65px; font-size:12px;' idPersona='"+data[i].idPersona+"' value='"+DNI+"'>&nbsp<input id='btnBuscarPersona_"+data[i].codAgraviado+"' type='button' value='"+tituloBoton+"' onclick='"+onclick+"("+'"'+data[i].codAgraviado+'"'+")'/>";
                    data[i].html_nombres = "<input id='idNombres_"+data[i].codAgraviado+"' type='text' style='width: 220px; font-size:12px;' value='"+nombres+"' "+disabledNombres+" >";
                    data[i].html_paterno = "<input id='idApePat_"+data[i].codAgraviado+"' type='text' style='width: 160px; font-size:12px;' value='"+paterno+"' "+disabledNombres+" >";
                    data[i].html_materno = "<input id='idApeMat_"+data[i].codAgraviado+"' type='text' style='width: 160px; font-size:12px;' value='"+materno+"' "+disabledNombres+" >";
                    data[i].html_edad = "<input id='idEdad_"+data[i].codAgraviado+"' type='text' style='width: 50px; font-size:12px;' value='"+edad+"'>";
                    data[i].html_diagnostico = "<input id='' type='text' style='width: 300px; font-size:12px;' value='"+data[i].diagnostico+"'>";
                    var selectedU="";
                    var selectedI="";
                    var selectedE="";
                    var idNosocomioAgraviado = "";
                    if(data[i].idNosocomio>0){
                        idNosocomioAgraviado = data[i].idNosocomio+"-"+data[i].tipoNosocomio;
                    }
                    var montoGarantia_disabled = calcularMontoGarantiaDB(data[i].tipoAsistencia, idNosocomioAgraviado);
                    var monto = montoGarantia_disabled[0];
                    var disabled = montoGarantia_disabled[1];
					if(disabled==false){
						monto = data[i].montoCartaGarantia;
					}
					
					listaNosocomiosXagraviado.push({
                        codAgraviado:data[i].codAgraviado,
                        idNosocomio:idNosocomioAgraviado,
                        nombreNosocomio:data[i].nombreNosocomio,
                        distritoAccidente:distritoAccidente,
                        distritoNosocomio:data[i].distritoNosocomio
                    });
                    eval("selected"+data[i].tipoAsistencia+" = 'selected';");
                    data[i].html_asistencia = "<select id='tipoAsistencia_"+data[i].codAgraviado+"' onchange='calcularMontoGarantia("+'"'+data[i].codAgraviado+'"'+")'>" +
                        "<option value='U' "+selectedU+">Urgencia</option>" +
                        "<option value='I' "+selectedI+">Internamiento</option>" +
                        "<option value='E' "+selectedE+">Emergencia</option>" +
                        "</select>";
                    data[i].html_monto = "<input id='monto_"+data[i].codAgraviado+"' type='text' style='width: 70px; font-size:13px;' value='"+monto+"' "+disabled+">";
                    data[i].html_nosocomio = "<select style='width:185px;' class='lista_nosocomio' id='idNosocomio_"+data[i].codAgraviado+"' onchange='calcularMontoGarantia("+'"'+data[i].codAgraviado+'"'+")'><option value=''>Seleccione</option></select>&nbsp&nbsp<input type='text' placeholder='Buscar Nosocomio' id='buscarNosocomio_"+data[i].codAgraviado+"' style='width:120px; font-size:12px;'/>&nbsp&nbsp<img src='wpimages/search-icon.png' onclick='buscarNosocomio("+'"'+data[i].codAgraviado+'"'+")' width='18' height='18' style='cursor: pointer;'>";
                    data[i].html_telf = "<input id='idTelf_"+data[i].codAgraviado+"' type='text' style='width: 85px; font-size:12px;' value='"+telf+"'>";
                    data[i].html_borrar= "<a class='eraser' onclick='borrar(this, "+'"'+data[i].codAgraviado+'"'+")' style='cursor: pointer; text-decoration: none; font-size:11px;'>Borrar</a>";
                }
                break;
        }
        //arrayInfoEvento.listaAgraviados=data;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'html_dni', alineacion:'center'},
            {campo:'html_nombres', alineacion:'center'},
            {campo:'html_paterno', alineacion:'center'},
            {campo:'html_materno', alineacion:'center'},
            {campo:'html_edad', alineacion:'center'},
            {campo:'html_diagnostico', alineacion:'center'},
            {campo:'html_asistencia', alineacion:'center'},
            {campo:'html_nosocomio', alineacion:'center'},
            {campo:'html_monto', alineacion:'center'},
            {campo:'html_telf', alineacion:'center'},
            {campo:'html_borrar', alineacion:'center'}
        ];
        if(dataTable_Agraviados!=undefined){
            dataTable_Agraviados.destroy();
        }
        crearFilasHTML("tabla_agraviados", data, camposAmostrar, false, 12); // crea la tabla HTML
        var columns=[
            { "width": "11%" },
            { "width": "14%"},
            { "width": "9%"},
            { "width": "9%"},
            { "width": "3%"},
            { "width": "13%"},
            { "width": "9%"},
            { "width": "21%"},
            { "width": "4%"},
            { "width": "6%"},
            { "width": "4%"}
        ];

        dataTable_Agraviados=parseDataTable("tabla_agraviados", columns, 190, false, false, false, false, function(){
            var idDistritoAccidente = $("#select_E").val(); // distrito del accidente
			if(accion == 'N'){
				if(idDistritoAccidente!=""){ // CARGA LOS NOSOCOMIOS DEL ACCIDENTE
					var parametros = "&idDistrito="+idDistritoAccidente;
					DAO.consultarWebServiceGet("getListaNosocomios", parametros, function(datos) {
						$(".lista_nosocomio").html(""); // Limpia opciones
						$(".lista_nosocomio").append(new Option("Seleccione",""));
						for(var i=0; i<datos.length; i++){
						   $(".lista_nosocomio").append(new Option(datos[i]["nombre"], datos[i]["idNosocomio"]+"-"+datos[i]["tipo"]));
						}
						if(idNosocomioPorCentralEmergencia!=""){
							$(".lista_nosocomio").val(idNosocomioPorCentralEmergencia);
						}						
					});				
				}
			}else{ // Editar
				for(var i=0; i<listaNosocomiosXagraviado.length; i++){
                    var idNosocomio = listaNosocomiosXagraviado[i].idNosocomio;
                    var idDistrito="";
                    if(idNosocomio!=""){ // existe un nosocomio seleccionado
                        idDistrito = listaNosocomiosXagraviado[i].distritoNosocomio;
                    }else{
                        idDistrito = listaNosocomiosXagraviado[i].distritoAccidente;
                    }
                    if(idDistrito!=""){
                        var parametros = "&idDistrito="+idDistrito;
                        DAO.consultarWebServiceGet("getListaNosocomios", parametros, function(datos, message, dataAgraviado) {
                            $("#idNosocomio_"+dataAgraviado.codAgraviado).html("");
                            $("#idNosocomio_"+dataAgraviado.codAgraviado).append(new Option("Seleccione",""));
                            for(var i=0; i<datos.length; i++){
                                datos[i].idNosocomio_tipo = datos[i].idNosocomio+"-"+datos[i].tipo;
                            }
                            agregarOpcionesToCombo("idNosocomio_"+dataAgraviado.codAgraviado, datos, {keyValue:"nombre", keyId:"idNosocomio_tipo"});
                            if(quitarEspaciosEnBlanco(dataAgraviado.idNosocomio)!=""){
                                $("#idNosocomio_"+dataAgraviado.codAgraviado).val(dataAgraviado.idNosocomio);
                            }
                        }, false, null, listaNosocomiosXagraviado[i]);
                    }
				}												
			}
            $.fancybox.close();
        });
        $.fancybox.close();

    }catch(err){
        emitirErrorCatch(err, "cargarAgraviadosTAB()");
    }
}
function agregarAgraviado(){
    try{
        idAgraviadoKey++;
        var codAgraviado = idAgraviadoKey;
        var trAgraviado="<tr style='font-family: Arial; height: 30px; cursor: pointer; font-size: 12px;'>" +
            "<td style='text-align: center;'><input id='idDNI_"+codAgraviado+"' type='text' style='width: 65px; font-size:12px;' value='' class=''>&nbsp<input id='btnBuscarPersona_"+codAgraviado+"' type='button' value='Buscar' onclick='buscarPersona("+'"'+codAgraviado+'"'+")'/></td>"+
            "<td style='text-align: center;'><input id='idNombres_"+codAgraviado+"' type='text' style='width: 220px; font-size:12px;' value='' disabled></td>"+
            "<td style='text-align: center;'><input id='idApePat_"+codAgraviado+"' type='text' style='width: 160px; font-size:12px;' value='' disabled></td>"+
            "<td style='text-align: center;'><input id='idApeMat_"+codAgraviado+"' type='text' style='width: 160px; font-size:12px;' value='' disabled></td>"+
            "<td style='text-align: center;'><input id='idEdad_"+codAgraviado+"' type='text' style='width: 50px; font-size:12px;' value=''></td>"+
            "<td style='text-align: center;'><input id='' type='text' style='width: 300px; font-size:12px;' value=''></td>"+
            "<td style='text-align: center;'><select id='tipoAsistencia_"+codAgraviado+"' onchange='calcularMontoGarantia("+'"'+codAgraviado+'"'+")'>" +
            "<option value='U'>Urgencia</option>" +
            "<option value='I'>Internamiento</option>" +
            "<option value='E'>Emergencia</option>" +
            "</select></td>"+
            "<td style='text-align: center;'><select style='width:185px;' class='lista_nosocomio' id='idNosocomio_"+codAgraviado+"' onchange='calcularMontoGarantia("+'"'+codAgraviado+'"'+")'><option value=''>Seleccione</option></select>&nbsp&nbsp<input type='text' placeholder='Buscar Nosocomio' id='buscarNosocomio_"+codAgraviado+"' style='width:120px; font-size:12px;'/>&nbsp&nbsp<img src='wpimages/search-icon.png' onclick='buscarNosocomio("+'"'+codAgraviado+'"'+")' width='18' height='18' style='cursor: pointer;'></td>"+
            "<td style='text-align: center;'><input id='monto_"+codAgraviado+"' type='text' style='width: 70px; font-size:13px;' value='0' disabled/></td>"+
            "<td style='text-align: center;'><input id='idTelf_"+codAgraviado+"' type='text' style='width: 85px; font-size:12px;' value=''></td>"+
            "<td style='text-align: center;'><a class='eraser' onclick='borrar(this)' style='cursor: pointer; text-decoration: none; font-size:11px;'>Borrar</a></td>";
        "</tr>";
        $("#tabla_agraviados > tbody").append(trAgraviado);
        var idDistritoAccidente = $("#select_E").val(); // distrito del accidente
        if(idDistritoAccidente!=""){ // CARGA LOS NOSOCOMIOS DEL ACCIDENTE
            var parametros = "&idDistrito="+idDistritoAccidente;
            DAO.consultarWebServiceGet("getListaNosocomios", parametros, function(datos) {
                for(var i=0; i<datos.length; i++){
                    datos[i].idNosocomio_tipo = datos[i].idNosocomio+"-"+datos[i].tipo;
                }
                agregarOpcionesToCombo("idNosocomio_"+codAgraviado, datos, {keyValue:"nombre", keyId:"idNosocomio_tipo"});
                $.fancybox.close();
            });
        }
    }catch(err){
        emitirErrorCatch(err, "agregarAgraviado()")
    }
}
function cargarCalificacionTAB(resultsData){
    try{
		// parte la lista de preguntas en 2 columnas
		var countFilas = Math.round(listaCalificacion.length/2);
		var preguntas_columnas=new Array();
		for(var i=0; i<countFilas; i++){
			preguntas_columnas.push({numero1: i+1, id1:listaCalificacion[i].id, description1:listaCalificacion[i].description, respuesta1:"<input name='rptaId_"+listaCalificacion[i].id+"' type='radio' value='S'/>Si<input name='rptaId_"+listaCalificacion[i].id+"' type='radio' value='N'/>No"})
		}
		for(var i=countFilas; i<listaCalificacion.length; i++){
			preguntas_columnas[i-countFilas].numero2=i+1;
			preguntas_columnas[i-countFilas].id2=listaCalificacion[i].id;
			preguntas_columnas[i-countFilas].respuesta2="<input name='rptaId_"+listaCalificacion[i].id+"' type='radio' value='S'/>Si<input name='rptaId_"+listaCalificacion[i].id+"' type='radio' value='N'/>No";
			preguntas_columnas[i-countFilas].description2=listaCalificacion[i].description;
		}
		
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'numero1', alineacion:'center'},
            {campo:'description1', alineacion:'left'},
            {campo:'respuesta1', alineacion:'center'},
			{campo:'numero2', alineacion:'center'},
            {campo:'description2', alineacion:'left'},
            {campo:'respuesta2', alineacion:'center'}
        ];
        
        crearFilasHTML("tabla_calificacion", preguntas_columnas, camposAmostrar, false, 12); // crea la tabla HTML
        var columns=[
            { "width": "4%" },
            { "width": "30%"},
            { "width": "16%"},
            { "width": "4%"},
			{ "width": "30%"},
            { "width": "16%"}
        ];
        if(accion == 'E'){ // carga la calificacion :
			var preguntasCalificacion = JSON.parse(resultsData[0].preguntasCalificacion);
			for(var i=0; i<preguntasCalificacion.length; i++){
				if(preguntasCalificacion[i].rpta!=""){
					$("input[name=rptaId_"+preguntasCalificacion[i].id+"][value="+preguntasCalificacion[i].rpta+ "]").prop('checked', true);
				}				
			}
			$("#idCalificacion").val(resultsData[0].calificacion);
			$("#idObservaciones").val(resultsData[0].observaciones);
		}
        var soloLectura = $_GET("soloLectura");
        if(soloLectura == 'T'){
            $(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
            $('.eraser').attr('onclick', '');
        }
    }catch(err){
        emitirErrorCatch(err, "cargarCalificacionTAB()")
    }
}
function cargarListaVehiculos(lista_Vehiculos){
    try{
		if(typeof lista_Vehiculos !='undefined' ){
			if(lista_Vehiculos.length>0){
				for(var i=0; i<lista_Vehiculos.length; i++){
					lista_Vehiculos[i].html_placa = "<input class='"+lista_Vehiculos[i].idVehiculoInformado+"' type='text' style='width: 90px; font-size:12px; text-align:center;' value='"+lista_Vehiculos[i].placa+"'/>";
					lista_Vehiculos[i].html_marca = "<input type='text' style='width: 90px; font-size:12px; text-align:center;' value='"+lista_Vehiculos[i].marca+"'/>";
					lista_Vehiculos[i].html_modelo = "<input type='text' style='width: 90px; font-size:12px; text-align:center;' value='"+lista_Vehiculos[i].modelo+"'/>";
					lista_Vehiculos[i].html_anno = "<input type='text' style='width: 90px; font-size:12px; text-align:center;' value='"+lista_Vehiculos[i].anno+"'/>";
					lista_Vehiculos[i].html_borrar = "<a class='eraser' onclick='borrarVehiculo(this, "+'"'+lista_Vehiculos[i].idVehiculoInformado+'"'+")' style='cursor: pointer; text-decoration: none; font-size:12px;'>Borrar</a>";
				}
				var camposAmostrar = [ // asigna los campos a mostrar en la grilla
					{campo:'html_placa', alineacion:'center'},
					{campo:'html_marca', alineacion:'center'},
					{campo:'html_modelo', alineacion:'center'},
					{campo:'html_anno', alineacion:'center'},
					{campo:'html_borrar', alineacion:'center'}
				];
				crearFilasHTML("tabla_vehiculos", lista_Vehiculos, camposAmostrar, false, 12); // crea la tabla HTML				
            }
		}
        var columns=[
            { "width": "22%"},
            { "width": "22%"},
            { "width": "22%"},
            { "width": "22%"},
            { "width": "12%"}
        ];
        parseDataTable("tabla_vehiculos", columns, 95, false, false, false, false, function(){
            if($("#tabla_vehiculos > tbody >tr").length==1 && $("#tabla_vehiculos > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_vehiculos > tbody").html("");
            }
        });
    }catch(err){
        emitirErrorCatch(err, "cargarListaVehiculos()")
    }
}
function agregarVehiculo(){
	try{
        $("#tabla_vehiculos > tbody").append("<tr style='font-family: Arial; height: 20px; font-size:11px;'>" +
            "<td style='text-align: center;'><input class='' type='text' style='width: 90px; font-size:12px; text-align:center;'/></td>"+
            "<td style='text-align: center;'><input type='text' style='width: 90px; font-size:12px; text-align:center;'/></td>"+
            "<td style='text-align: center;'><input type='text' style='width: 90px; font-size:12px; text-align:center;'/></td>"+
            "<td style='text-align: center;'><input type='text' style='width: 90px; font-size:12px; text-align:center;'/></td>"+
            "<td style='text-align: center;'><a class='eraser' onclick='borrarVehiculo(this)' style='cursor: pointer; text-decoration: none; font-size:12px;'>Borrar</a> </td>"+
            "</tr>");
	}catch(err){
		emitirErrorCatch(err, "agregarVehiculo");
	}
}
var vehiculosEliminados=[];
function borrarVehiculo(idCampo, idVehiculo){
    try{
        if(typeof idVehiculo == 'string'){
            vehiculosEliminados.push("'"+idVehiculo+"'");
        }
        $(idCampo).parent().parent().remove();
    }catch(err){
        emitirErrorCatch(err, "borrar")
    }
}
function cargarTipoAccidentes(callback){
    try{
        DAO.consultarWebServiceGet("getListaTipoAccidentes", "", function(data){
            agregarOpcionesToCombo("idTipoAccidente", data, {"keyId":"idTipoAccidente", "keyValue":"descripcion"})
            if(typeof callback == "function"){
                callback();
            }
        });
    }catch(err){
        emitirErrorCatch(err, "cargarTipoAccidentes()")
    }
}
function cargarListaCausales(callback){
    try{
        DAO.consultarWebServiceGet("getListaCausales", "", function(data){
            agregarOpcionesToCombo("idCausal", data, {"keyId":"codCausal", "keyValue":"descripcion"})
            if(typeof callback == "function"){
                callback();
            }
        });
    }catch(err){
        emitirErrorCatch(err, "cargarTipoAccidentes()")
    }
}
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
function cambiarPoliza(){ // vuelve a activar la validacion de poliza
    try{
		//Limpia los campos de la poliza y reincia los valores de busqueda
        idAsociado = 0;
        $("#placa").val("");
        $("#nroCAT").val("");
        $("#idVencPoliza").val("");
        $("#idNombreAsociado").val("");
		$("#idNroDocAsociado").val("");
		$("#select_A").val("");
		$("#idCalle").val("");
		$("#idNro").val("");
		$("#idMzLt").val("");
		$("#idSector").val("");
		$("#idReferencia").val("");
		
		$("#idPlaca_v").val("");
		$("#idMarca_v").val("");
		$("#idModelo_v").val("");
		$("#idAno_v").val("");		
		
        $("#placa").prop("disabled", false);
        $("#nroCAT").prop("disabled", false);
		
        $("#btnValidarPoliza").unbind("click");
        $("#btnValidarPoliza").val("Validar");
        $("#btnValidarPoliza").click(validarPoliza)
        
    }catch(err){
        emitirErrorCatch(err, "cambiarPoliza()")
    }
}
function validarPoliza(){ // Valida el certificado previa busqueda por medio del Nro de CAT y/o Placa
    try{
        var placa = $("#placa").val();
        var nroCAT = $("#nroCAT").val();
        var parametros = "&placa="+placa+
            "&nroCAT="+nroCAT;
        DAO.consultarWebServiceGet("buscarPoliza", parametros, function(data){
            if(data.length==0){
                fancyAlertFunction("No se encontro ningun certificado", function(rpta){
                    if(rpta){
                        $("#nroCAT").focus();
                    }
                })
            }else{
				// verifica fecha de vencimientom del cat
				var vencimientoPoliza =false;
                if(data[0].vencPoliza!=null || data[0].vencPoliza!=""){
					var fechaVencimiento = data[0].vencPoliza.split("/");				
					var DateVencimiento = new Date(fechaVencimiento[2], (parseInt(fechaVencimiento[1])-1), fechaVencimiento[0]);				
					var hoy = new Date();
					if(hoy>DateVencimiento){
                        vencimientoPoliza=true;
						fancyAlert("¡ El CAT ha caducado !");
					}
				}
                // carga la informacion de la poliza:
                idAsociado = data[0].idAsociado;
                $("#placa").val(data[0].placa);
                $("#nroCAT").val(data[0].nroCAT);
                $("#idVencPoliza").val(data[0].vencPoliza);
                switch (data[0].tipoPersona){
                    case 'N':
                        data[0].asociado=data[0].nombreAsociado;
                        break;
                    case 'J':
                        data[0].asociado=data[0].razonSocial;
                        break;
                }
                // datos del asociado
				$("#idNombreAsociado").val(data[0].asociado);
				$("#idNroDocAsociado").val(data[0].nroDocumento);
				cargarComboDistritos("A", data[0].distrito_a);
				$("#select_A").val((data[0].distrito_a!=null) ? data[0].distrito_a : "");
				$("#idCalle").val(data[0].calle_a);
				$("#idNro").val(data[0].nro_a);
				$("#idMzLt").val(data[0].mzLote_a);
				$("#idSector").val(data[0].sector_a);
				$("#idReferencia").val(data[0].referencia_a);
				// datos del vehiculo del asociado
				$("#idPlaca_v").val(data[0].placa);
				$("#idMarca_v").val(data[0].marca);
				$("#idModelo_v").val(data[0].modelo);						
				$("#idAno_v").val(data[0].anno)
                
				// Bloquea el boton de "Validar" y le cambia de nombre a "Cambiar"
                $("#btnValidarPoliza").val("Cambiar");
                $("#btnValidarPoliza").unbind("click");
                $("#btnValidarPoliza").click(cambiarPoliza);
                $("#placa").prop("disabled", true);
                $("#nroCAT").prop("disabled", true);
                if(!vencimientoPoliza){
                    $.fancybox.close();
                }
            }
        })
    }catch(err){
        emitirErrorCatch(err, "validarPoliza");
    }
}
function buscarPersona(tipoPersona){
	try{
		var DNI = $("#idDNI_"+tipoPersona).val();
		var cantidadDigitos = DNI.split("").length;
		if(cantidadDigitos == 8){
			var parametros = "&nroDoc="+DNI;
			DAO.consultarWebServiceGet("getPersonaByNroDoc", parametros, function(data){
                cargarResultPersona(data, tipoPersona);
				$.fancybox.close();				
			});
		}else{
			fancyAlertFunction("¡ Formato de DNI incorrecto !", function(rpta){
				if(rpta){
					$("#idDNI_"+tipoPersona).focus();
				}
			})
		}	
	}catch(err){
		emitirErrorCatch(err, "buscarPersona");
	}
}
function cargarResultPersona(data, tipoPersona){
	try{
		$("#idDNI_"+tipoPersona).attr("idPersona", "0");
        if(data.length>0){ // encontro a la persona que se buscaba
			$("#idNombres_"+tipoPersona).val(data[0].nombres);
			$("#idApePat_"+tipoPersona).val(data[0].apellidoPaterno);
			$("#idApeMat_"+tipoPersona).val(data[0].apellidoMaterno);
            $("#idEdad_"+tipoPersona).val(data[0].edad);
            $("#idTelf_"+tipoPersona).val(data[0].telefonoMovil);
            $("#idDNI_"+tipoPersona).attr("idPersona", data[0].idPersona);
        }
		$("#idDNI_"+tipoPersona).prop("disabled", true); 
		$("#idNombres_"+tipoPersona).prop("disabled", false);
		$("#idApePat_"+tipoPersona).prop("disabled", false);
		$("#idApeMat_"+tipoPersona).prop("disabled", false);
				
		$("#btnBuscarPersona_"+tipoPersona).unbind("click");
        $("#btnBuscarPersona_"+tipoPersona).attr("onclick", ""); // para los agraviados
        $("#btnBuscarPersona_"+tipoPersona).val("Cambiar");
		$("#btnBuscarPersona_"+tipoPersona).click(function(){
			cambiarDNI(tipoPersona);
		});
		$("#idNombres_"+tipoPersona).focus();		
	}catch(err){
		emitirErrorCatch(err, "cargarResultPersona");
	}
}
function cambiarDNI(tipoPersona){
	try{
		//Limpia los campos de la poliza y reincia los valores de busqueda
        $("#idDNI_"+tipoPersona).attr("idPersona", "0");
        $("#idDNI_"+tipoPersona).val("");
		$("#idNombres_"+tipoPersona).val("");
		$("#idApePat_"+tipoPersona).val("");
		$("#idApeMat_"+tipoPersona).val("");
        $("#idEdad_"+tipoPersona).val("");
        $("#idTelf_"+tipoPersona).val("");
		
        $("#idDNI_"+tipoPersona).prop("disabled", false); 
		$("#idNombres_"+tipoPersona).prop("disabled", true);
		$("#idApePat_"+tipoPersona).prop("disabled", true);
		$("#idApeMat_"+tipoPersona).prop("disabled", true);
		
        $("#btnBuscarPersona_"+tipoPersona).unbind("click");
        $("#btnBuscarPersona_"+tipoPersona).attr("onclick", ""); // para los agraviados
		$("#btnBuscarPersona_"+tipoPersona).val("Buscar");
		$("#btnBuscarPersona_"+tipoPersona).click(function(){
			buscarPersona(tipoPersona);
		});
		$("#idDNI_"+tipoPersona).focus();
	}catch(err){
		emitirErrorCatch(err, "cambiarDNI");
	}
}
function buscarComisaria(){
    try{
        if($("#comisariaBuscar").val()!=""){
            var parametros = "&comisaria="+$("#comisariaBuscar").val();
            DAO.consultarWebServiceGet("getComisariaByNombre", parametros, function(data){
                agregarOpcionesToCombo("idComisaria", data, {"keyId":"idComisaria", "keyValue":"nombre"});
                $("#idComisaria").focus();
                $.fancybox.close();
            });
        }else{
            fancyAlertFunction("¡Debe ingresar la comisaria a buscar!", function(rpta){
                if(rpta){
                    $("#comisariaBuscar").focus();
                }
            })
        }
    }catch(err){
        emitirErrorCatch(err, "abrirBusquedaComisaria()");
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
                $("#monto_"+keyAgraviado).val(0)
                $("#monto_"+keyAgraviado).prop("disabled", true);
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
        $("#monto_"+keyAgraviado).prop("disabled", true);
        var monto=0;
        var nosocomio = $("#idNosocomio_"+keyAgraviado).val();
        var tipoAsistencia = $("#tipoAsistencia_"+keyAgraviado).val();
        if(nosocomio!="" && tipoAsistencia!=""){
            var tipoNosocomio = nosocomio.split("-")[1];
            monto = montoGarantia[tipoAsistencia]*UIT;
            if(tipoNosocomio=='H'){ // hospital
                $("#monto_"+keyAgraviado).prop("disabled", true);
            }else{ // clinica
                $("#monto_"+keyAgraviado).prop("disabled", false);
            }
        }
        $("#monto_"+keyAgraviado).val(monto);
    }catch(err){
        emitirErrorCatch(err, "calcularMontoGarantia()")
    }
}
function calcularMontoGarantiaDB(tipoAsistencia, idNosocomio_tipo){
    try{
        var monto = 0;
        var disabled = "disabled";
        if(quitarEspaciosEnBlanco(tipoAsistencia)!="" && quitarEspaciosEnBlanco(idNosocomio_tipo)!=""){
            var tipoNosocomio = idNosocomio_tipo.split("-")[1];
            monto = montoGarantia[tipoAsistencia]*UIT;
            if(tipoNosocomio=='H'){
                disabled='disabled';
            }else{
                disabled='';
            }
        }
        return [monto, disabled];
    }catch(err){
        emitirErrorCatch(err, "calcularMontoGarantiaDB()")
    }
}
var agraviadosPostEliminacion=[];
function borrar(idCampo, codAgraviado){
    try{
        if(typeof  codAgraviado == 'string'){
            agraviadosPostEliminacion.push("'"+codAgraviado+"'");
        }
        $(idCampo).parent().parent().remove();
    }catch(err){
        emitirErrorCatch(err, "borrar")
    }
}
var validandoDNIAgraviado;
function guardarDatos(){
	try{
        var datos={idInforme:idInforme, codEvento:codEvento, UIT:UIT, idAsociado:idAsociado, idProcurador:idProcurador, idNosocomio: idNosocomioPorCentralEmergencia.split("-")[0], idChofer:idChofer, idPropietario:idPropietario, idPropietario2:idPropietario2};
        var continuous = true;
        // OBTIENE DATOS DEL TAB OCURRENCIA
        clickPestaña("Ocurrencia");
        if(validarCamposRequeridos("idPanelLugarAccidente")){
            datos.fechaAccidente = dateTimeFormat($("#idFechaAccidente").val());
            datos.fechaAviso = dateTimeFormat($("#idFechaAviso").val());
            datos.idTipoAccidente = $("#idTipoAccidente").val();
            datos.idCausal = $("#idCausal").val();
            datos.idDistritoAccidente = $("#select_E").val();
            datos.direccionAccidente = $("#idDireccion").val();
        }else{
            continuous=false;
        }
        if(continuous){ // obtiene los datos de los vehiculos
            datos.listaVehiculos = new Array();
            $("#tabla_vehiculos > tbody >tr").each(function(){
                var idVehiculo = $(this).find("td").eq(0).find("input").attr("class");
                var placa = $(this).find("td").eq(0).find("input").val();
                var marca = $(this).find("td").eq(1).find("input").val();
                var modelo = $(this).find("td").eq(2).find("input").val();
                var anno = $(this).find("td").eq(3).find("input").val();
                datos.listaVehiculos.push({idVehiculo:idVehiculo, placa:placa, marca:marca, modelo:modelo, anno:anno});
            });
        }
        // OBTIENE DATOS DEL TAB DEL ASOCIADO
        if(continuous){
            clickPestaña("Asociado");
            if(validarCamposRequeridos("idPanelDireccionAsociado")){
                if($("#nroCAT").prop("disabled")==true){ // se valido el CAT correctamente
                    var continuous = true;
                    if($("#idVencPoliza").val()!=""){
                        var fechaVencimiento = $("#idVencPoliza").val().split("/");
                        var DateVencimiento = new Date(fechaVencimiento[2], (parseInt(fechaVencimiento[1])-1), fechaVencimiento[0]);
                        var hoy = new Date();
                        if(hoy>DateVencimiento){
                            continuous=false;
                            fancyAlert("¡ El CAT ha caducado !");
                        }
                    }
                    if(continuous){
                        datos.nroCAT=$("#nroCAT").val();
                        datos.nroDocAsociado = $("#idNroDocAsociado").val();
                        datos.distritoAsociado = $("#select_A").val();
                        datos.calleAsociado = $("#idCalle").val();
                        datos.nroAsociado = $("#idNro").val();
                        datos.mzLtAsociado = $("#idMzLt").val();
                        datos.sectorAsociado = $("#idSector").val();
                        datos.referenciaAsociado = $("#idReferencia").val();
                    }
                }else{
                    continuous=false;
                    fancyAlertFunction("Debe validar el Nro CAT", function(){
                        $("#nroCAT").focus();
                    });
                }
            }else{
                continuous=false;
            }
        }
        // OBTIENE DATOS DEL TAB RESPONSABLES
            if(continuous){
                clickPestaña("Responsables");
                // Panel Chofer:
                // verifica si ha identificado el dni del chofer
                if(verificaDNIValidado("pc")){
                    datos.choferPersona=crearParametroPersona("pc");
                    datos.licenciaChofer = $("#idLicencia").val();
                    datos.claseChofer = $("#idClase").val();
                }else{
                    continuous=false;
                    fancyAlertFunction("Debe validar el Nro de DNI del chofer", function(){
                        $("#idDNI_pc").focus();
                    });
                }
                // Panel Propietario:
                // verifica si ha identificado el dni del propietario
                if(continuous){
                    if(verificaDNIValidado("pp")){
                        datos.propietarioPersona = crearParametroPersona("pp");
                    }else{
                        continuous=false;
                        fancyAlertFunction("Debe validar el Nro de DNI del Propietario", function(){
                            $("#idDNI_pp").focus();
                        });
                    }
                }
                if(continuous){ // Propietario 2
                    if($("#idDNI_pp2").val()!=""){
                        if(verificaDNIValidado("pp2")){
                            datos.propietario2Persona = crearParametroPersona("pp2");
                        }else{
                            continuous=false;
                            fancyAlertFunction("Debe validar el Nro de DNI del Propietario 2", function(){
                                $("#idDNI_pp2").focus();
                            });
                        }
                    }
                }
                if(continuous){ // Madre del chofer
                    if($("#idDNI_pmc").val()!=""){
                        if(verificaDNIValidado("pmc")){
                            datos.pmcPersona = crearParametroPersona("pmc");
                        }else{
                            continuous=false;
                            fancyAlertFunction("Debe validar el Nro de DNI de la madre del chofer", function(){
                                $("#idDNI_pmc").focus();
                            });
                        }
                    }
                }
                if(continuous){ // Padre del chofer
                    if($("#idDNI_ppc").val()!=""){
                        if(verificaDNIValidado("ppc")){
                            datos.ppcPersona = crearParametroPersona("ppc");
                        }else{
                            continuous=false;
                            fancyAlertFunction("Debe validar el Nro de DNI de la padre del chofer", function(){
                                $("#idDNI_ppc").focus();
                            });
                        }
                    }
                }
            }
        // OBTIENE DATOS DEL TAB COMISARIA/DOSAJE
            if(continuous){
                clickPestaña("Comisaría/Dosaje");
                if(validarCamposRequeridos("idPanelComisaria")){
                    datos.idComisaria = $("#idComisaria").val();
                    datos.codDenuncia = $("#idCodDenuncia").val();
                }else{
                    continuous=false;
                }
                if(continuous){
                    if(validarCamposRequeridos("idPanelDosaje")){
                        datos.horaExamenCualitativo = dateTimeFormat($("#idHoraExCualitativo").val());
                        datos.horaExamenCuantitativo = dateTimeFormat($("#idHoraExCuantitativo").val());
                        datos.resultadoDosaje = $("#idResultadoDosaje").val();
                        datos.fechaInicioInvestigacion = dateTimeFormat($("#idFechaInicioInv").val());
                        datos.fechaFinInvestigacion = dateTimeFormat($("#idFechaFinInv").val());
                    }else{
                        continuous=false;
                    }
                }
            }
        // OBTIENE DATOS DEL TAB DE AGRAVIADOS:
        if(continuous){
            clickPestaña("Agraviados");
            datos.listaAgraviados=[];
            $("#tabla_agraviados > tbody >tr").each(function(){
                var keyAgraviado = $(this).find("td").eq(0).find("input").attr("id");
                keyAgraviado=keyAgraviado.split("_")[1];
                validandoDNIAgraviado=keyAgraviado;
                if(verificaDNIValidado(keyAgraviado)){
                    datos.listaAgraviados.push({
                        codAgraviado:$(this).find("td").eq(0).find("input").attr("class"),
                        idPersona:$(this).find("td").eq(0).find("input").attr("idPersona"),
                        DNI:$(this).find("td").eq(0).find("input").val(),
                        nombres:$(this).find("td").eq(1).find("input").val(),
                        paterno:$(this).find("td").eq(2).find("input").val(),
                        materno:$(this).find("td").eq(3).find("input").val(),
                        edad:$(this).find("td").eq(4).find("input").val(),
                        diagnostico:$(this).find("td").eq(5).find("input").val(),
                        asistencia:$(this).find("td").eq(6).find("select").val(),
                        nosocomio:($(this).find("td").eq(7).find("select").val()).split("-")[0],
                        monto:$(this).find("td").eq(8).find("input").val(),
                        telf:$(this).find("td").eq(9).find("input").val()
                    });
                }else{
                    continuous=false;
                    fancyAlertFunction("Debe validar el DNI del agraviado", function(){
                        $("#idDNI_"+validandoDNIAgraviado).focus();
                    })
                    return false;
                }
            });
            if(continuous){ // verifica que la cantidad de agraviados a registrar sea mayor que 0
                if(datos.listaAgraviados.length==0){
                    fancyAlert("¡ Debe ingresar al menos un agraviado !");
                    continuous=false;
                }
            }
        }
        // OBTIENE DATOS DEL TAB CALIFICACION:
        if(continuous){
            clickPestaña("Calificación");
            datos.listaCalificacion=new Array();
            for(var i=0; i<listaCalificacion.length; i++){
                var rpta = "";
                var selected = $("input[type='radio'][name='rptaId_"+listaCalificacion[i].id+"']:checked");
                if(selected.length>0){
                    rpta=selected.val();
                }
                datos.listaCalificacion.push({id:listaCalificacion[i].id, rpta:rpta});
            }
            datos.listaCalificacion = JSON.stringify(datos.listaCalificacion);
            datos.calificacionEvento=$("#idCalificacion").val();
            datos.observaciones = $("#idObservaciones").val();
        }
        if(continuous){
            datos.vehiculosEliminados=vehiculosEliminados;
            fancyConfirm("¿Procede con la operación?", function(rpta){
                if(rpta){
                    var mensajeRpta;
                    var funcionWebservice;
                    switch (accion){
                        case 'N':
                            mensajeRpta="¡Se guardó la información correctamente!";
                            funcionWebservice="registrarInforme";
                            break;
                        case 'E':
                            mensajeRpta="¡Se guardarón los cambios correctamente!";
                            funcionWebservice="actualizarInforme";
                            break;
                    }
                    DAO.consultarWebServicePOST(datos, funcionWebservice, function(data){
                        if(data[0]>0){
                            fancyAlertFunction(mensajeRpta, function(){
                                if(agraviadosPostEliminacion.length>0){
                                    eliminacionAgraviadosPost();
                                }
                                rptaCallback=[data[0]];
                                realizoTarea=true;
                                parent.$.fancybox.close();
                            })
                        }else{
							fancyAlert("Operación Fallida");
						}
                    });

                }
            });
        }
	}catch(err){
		emitirErrorCatch(err, "guardarDatos");
	}
}
function eliminacionAgraviadosPost(){ // Elimina desde la BD, los agraviados eliminados en la grilla.
    try{
        var parametros = "&codAgraviados="+agraviadosPostEliminacion;
        DAO.consultarWebServiceGet("eliminarAgraviados", parametros, function(){},false);
    }catch(err){
        emitirErrorCatch(err, "eliminacionAgraviadosPost()")
    }
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
function crearParametroPersona(flagPersona){
    try{
        return {
            idPersona:$("#idDNI_"+flagPersona).attr("idPersona"),
            DNI:$("#idDNI_"+flagPersona).val(),
            nombres:$("#idNombres_"+flagPersona).val(),
            paterno:$("#idApePat_"+flagPersona).val(),
            materno:$("#idApeMat_"+flagPersona).val()
        }
    }catch(err){
        emitirErrorCatch(err, "crearParametroPersona")
    }
}
function verificaDNIValidado(flag){
    try{
        return $("#idDNI_"+flag).prop("disabled");
    }catch(err){
        emitirErrorCatch(err, "verificaDNIValidado")
    }
}
