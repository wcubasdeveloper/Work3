cargarInicio(function(){
	cargarPagina(); // esta funcion identificara la accion que se desea hacer: verificar la deuda actual o generar un acuerdo
});
var calculaNroCuotas=false;
var codigoEventoSeleccionado;
var objetoAcuerdo;
var arrayInfoEvento;
var arrayInfoAgraviados;
var arrayInfoGastos;
var datatableAgraviados;
var datatableGastos;
var tipoAccion; // N=Nuevo acuerdo; D=Deuda Actual
var infoDeudaGenerada;
var temp_Destinatarios=new Array(); // Lista de responsables que se seleccionaran para el registro del acuerdo
var arrayDistritos=new Array();
var arrayProvinicias=new Array();
var arrayDepartamentos=new Array();

function validarCuotaInicial(){
	try{
		$("#idValorCuota").val("");
        $("#idNroCuotas").val("");
        limpiarResumenCuotas();
		
		var montoAcuerdo = $("#idDeudaAcordada").val()
		if(montoAcuerdo!=""){
			montoAcuerdo=parseFloat(montoAcuerdo)
			var cuotaInicial = $("#idCuotaInicial").val();
			if(cuotaInicial!=""){
				cuotaInicial = parseFloat(cuotaInicial);
			}else{
				cuotaInicial=0;
			}
			if(cuotaInicial>=montoAcuerdo){
				fancyAlertFunction("¡La cuota inicial no puede superar o ser igual a la deuda acordada !", function(rpta){
					$("#idCuotaInicial").val("")
					$("#idCuotaInicial").focus();
				})
			}			
		}else{
			fancyAlertFunction("¡Debe ingresar primero el valor de deuda acordada!", function(){
				$("#idCuotaInicial").val("")
				$("#idDeudaAcordada").focus();
			})			
		}
	
	}catch(err){
		emitirErrorCatch(err, "validarCuotaInicial")
	}
}
/* @cargarPagina: Carga la configuracion inicial de la ventana para su 3 funciones (DEUDA A CONCILIAR, GENERAR ACUERDO, CANCELAR ACUERDO)
*/
function cargarPagina(){
	try{
		tipoAccion=parent.window.frames[0].tipoAccion; // identifica si es DEUDA ACTUAL o NUEVO ACUERDO
		switch(tipoAccion){
			case 'N': // Nuevo Acuerdo
                $("#idPanelBusqueda").remove();
                $("#muestraDatos").css("top", "48px");
                $("#muestraDatos").css("height", "830px");
                $("#oculta").css("top", "46px");
                $("#idGenerarDeuda").css("display", "none");// oculta boton de generar Deuda
                $("#idGastosAdministrativos").prop("readonly", true);
                $("#idPanelDeuda").css("height", "100px");
                $("#panelDatosAcuerdo").css("display", "block");
                $("#panelDatosAcuerdo").css("top","660px");
                $("#idFechaInicio").datetimepicker({lan:'es', formatDate:'d/m/Y', format:'d/m/Y', /**minDate:0, **/timepicker:false, closeOnDateSelect:true});
                $("#idGuardarAcuerdo").click(guardarAcuerdo);
                $("#idVistaResponsables").click(abrirVistaResponsables);
                $("#idDeudaAcordada").prop("class","solo-numero-mayor0");
				$("#idCuotaInicial").prop("class","solo-numero-mayor0")
                $("#idCuotaInicial").keyup(validarCuotaInicial)
				$("#idNroCuotas").prop("class","solo-numero-mayor0");
                $("#idPeriodoDias").prop("class","solo-numero-mayor0");
                $(".solo-numero-mayor0").keypress(function(e){ // permite ingresar numeros mayores de 0
                   var valor=this.value;
                    return textNumber(e, 0, valor);
                });
                $("#idValorCuota").keypress(function(e){
                    //var key = window.Event ? e.which : e.keyCode
                    var key = e.charCode || e.keyCode;
                    if(key==13){ // presiono enter
                       $("#idValorCuota").prop("readonly", true);
                       calcularNroCuotas();
                       $("#idValorCuota").prop("readonly", false);
                    }else{
                       $("#idNroCuotas").val("");
                       var valor=this.value;
                       return textNumber(e, 0, valor);
                    }
                });
                $("#idValorCuota").keyup(function(){
                    if(calculaNroCuotas==false){
                        $("#idNroCuotas").val(""); // limpia el nro de cuotas
                        limpiarResumenCuotas();
                    }else{
                        calculaNroCuotas=false;
                    }
                });
                $("#idNroCuotas").keyup(calcularValorCuota);
                    $("#idDeudaAcordada").keyup(function(){
                    $("#idCuotaInicial").val("")
					$("#idValorCuota").val("");
                    $("#idNroCuotas").val("");
                    limpiarResumenCuotas();
                    var gastoTotal=parseFloat($("#granTotal").val().replace("S/. ", ""));
                    var deudaAcordada=parseFloat(this.value);
                    if(deudaAcordada>gastoTotal){
                        $(this).blur();
                        fancyAlertFunction("El valor de la deuda Acordada ("+deudaAcordada+") no puede ser mayor que el GASTO TOTAL ("+gastoTotal+")", function(estado){
                            if(estado){
                                $("#idDeudaAcordada").val("");
                                $("#idDeudaAcordada").focus();
                            }
                        })
                        return;
                    }
                })
                $("#idBtnVerCronograma").prop("disabled", true)
                $("#idBtnVerCronograma").click(verCronograma)
                var infoEvento=parent.window.frames[0].infoEventoSeleccionado.infoEvento;
                cargarInfoEvento(infoEvento);
				break;
			case 'D': // Deuda Actual
				if(codEventoSeleccionado!=""){
					$('#codEvento').val(codEventoSeleccionado);
				}
				$("#codEvento").focus();
				$("#idBuscarEvento").click(buscarEventoByCodigo);
                $("#muestraDatos").css("height", "770px");
                $("#idGastosAdministrativos").prop("class", "solo-numero"); // asigna clase que validar el ingreso de solo numeros
                $("#idGastosAdministrativos").prop("placeholder", "S/. 0");
                $('.solo-numero').keypress(function(e){
                    var valor=this.value;
                    return textNumber(e);
                });
                $("#idGastosAdministrativos").keyup(calcularDeudaTotal);
                $("#idGenerarDeuda").click(generarDeuda);
				break;
            case 'C': // C = Cancelar Acuerdo
                $('body').height(1050); // agranda el height a 980 px;
                $('body').children().eq(0).css("height", "1050px");
                $("#idPanelBusqueda").remove(); // eliminar Panel de Busqueda
                $("#idPanelDeuda").remove(); // elimina panel de deuda (solo se muestra en D=Deuda Actual y N=Nuevo Acuerdo)
                $("#muestraDatos").css("top", "48px");
                $("#muestraDatos").css("height", "983px");
                $("#oculta").css("top", "46px");
                $("#idPanelCancelarDeuda").css("display", "block");
                $("#idPanelCancelarDeuda").css("top", "535px");
                $("#panelDatosAcuerdo").css("display", "block");
                $("#panelDatosAcuerdo").css("top","822px");
                $("#idVistaResponsables").click(abrirVistaResponsables);
                $("#DAct_idGastosAdministrativos").prop("class", "solo-numero"); // asigna clase que validar el ingreso de solo numeros
                $("#DAct_idGastosAdministrativos").prop("placeholder", "S/. 0");                
                $("#DAct_idGastosAdministrativos").keyup(calcularGranTotal);
                $("#idNroCuotas").prop("class","solo-numero");
                $("#idPeriodoDias").prop("class","solo-numero");
                $(".solo-numero").keypress(function(e){ // permite ingresar numeros mayores de 0
                    var valor=this.value;
                    return textNumber(e, 0, valor);
                });
                $("#idDeudaAcordada").keypress(function(e){
                    var valor=this.value;
                    //var key = window.Event ? event.which : event.keyCode
                    var key = e.charCode || e.keyCode;
                    if(key==13){ // PRESIONO ENTER
                        if(valor=='0'){
                            condonarDeuda();
                        }
                    }else{
                        return textNumber(e);
                    }
                })
                $("#idValorCuota").keypress(function(e){
                    //var key = window.Event ? event.which : event.keyCode
                    var key = e.charCode || e.keyCode;
                    if(key==13){ // presiono enter
                        $("#idValorCuota").prop("readonly", true);
                        calcularNroCuotas();
                        $("#idValorCuota").prop("readonly", false);
                    }else{
                        //$("#idNroCuotas").val(""); // reinicia el valor de nro de cuotas
                        var valor=this.value;
                        return textNumber(e, 0, valor);
                    }
                });
                $("#idValorCuota").keyup(function(){
                    if(calculaNroCuotas==false){
                        $("#idNroCuotas").val(""); // limpia el nro de cuotas
                        limpiarResumenCuotas();
                    }else{
                        calculaNroCuotas=false;
                    }
                });
                $("#idNroCuotas").keyup(calcularValorCuota);
                $("#idDeudaAcordada").keyup(function(){
                    $("#idValorCuota").val(""); // limipia el valor de la cuota
                    $("#idNroCuotas").val(""); // limpia el valor de nro de cuotas
                    limpiarResumenCuotas(); // limpia el resumen de las cuotas
                    if(parseFloat($("#idDeudaAcordada").val())>0){
                        if($("#DAct_idGastosAdministrativos").val()==""){
                            $(this).blur();
                            fancyAlertFunction("Debes de ingresar el valor de los gastos administrativos, antes de establecer el valor de la Deuda Acordada", function(estado){
                                if(estado){
                                    $("#DAct_idGastosAdministrativos").focus();
                                    $("#idDeudaAcordada").val("");
                                }
                            });
                            return;
                        }else{
                            var gastoTotal=parseFloat($("#DAct_GranTotal").val().replace("S/. ", ""));
                            var deudaAcordada=parseFloat(this.value);
                            if(deudaAcordada>gastoTotal){
                                $(this).blur();
                                fancyAlertFunction("El valor de la deuda Acordada ("+deudaAcordada+") no puede ser mayor que el GRAN TOTAL ("+gastoTotal+")", function(estado){
                                    if(estado){
                                        $("#idDeudaAcordada").val("");
                                        $("#idDeudaAcordada").focus();
                                    }
                                })
                                return;
                            }
                        }
                    }
                });
                $("#idGuardarAcuerdo").click(cancelarAcuerdo);
                $("#idFechaInicio").datetimepicker({lan:'es', formatDate:'d/m/Y', format:'d/m/Y', /**minDate:0, **/timepicker:false, closeOnDateSelect:true});
                objetoAcuerdo=parent.window.frames[0].arrayLocalRegistros[parent.window.frames[0].filaSeleccionada];
                $("#idBtnVerCronograma").prop("disabled", true)
                $("#idBtnVerCronograma").click(verCronograma)
                buscarInfoAcuerdo();
                break;
		}
	}catch(err){
		emitirErrorCatch(err, "cargarPagina");
	}
}

/* @buscarInfoAcuerdo: Busca la informacion del Evento del Acuerdo ( Responsables del accidentes, informacion del accidente) 
*/
function buscarInfoAcuerdo(){ // Busca informacion del acuerdo
    try{
        // Buscar informacion solo del evento del evento:
        fancyAlertWait("Cargando");
        ocultarPanelInfo(true);
        var tipoBusqueda="codEvento";
        var parametros="&tipoBusqueda="+tipoBusqueda+"&codigo="+objetoAcuerdo.codEvento;
        consultarWebServiceGet("getEventosGeneralesDomicilioLegal",parametros, cargarInfoEvento);
    }catch(err){
        emitirErrorCatch(err, "buscarInfoAcuerdo");
    }
}

/* @getReponsables: Genera un arreglo de objetos de los responsables del accidente con todos sus atributos
    PARAMETROS:
        1) data: Array Json del evento que contiene la informacion de los responsables del accidente.
*/
function getResponsables(data){ // obtiene los responsables del evento
    try{
        temp_Destinatarios.length=0;
        nombresChofer=(data[0].nombresChofer+" "+data[0].apellidoPaternoChofer+" "+data[0].apellidoMaternoChofer).trim();
        nombresAsociado=(data[0].nombresAsociado+" "+data[0].apellidoPaternoAsociado+" "+data[0].apellidoMaternoAsociado).trim();
        nombresPropietario=(data[0].nombresPropietario+" "+data[0].apellidoPaternoPropietario+" "+data[0].apellidoMaternoPropietario).trim();
        if(data[0].tipoAsociado=='J'){ // Juridico
            nombresAsociado=data[0].razonSocial;
        }
        if(data[0].tipoPropietario=='J'){
            nombresPropietario=data[0].razonPropietario;
        }
        if(reemplazarNullXpuntos(data[0].idProvinciaAsociado)==""){
            data[0].idProvinciaAsociado="P01"; // PROVINCIA LIMA
        }
        if(reemplazarNullXpuntos(data[0].idProvinciaPropietario)==""){
            data[0].idProvinciaPropietario="P01"; // PROVINCIA LIMA
        }
        if(reemplazarNullXpuntos(data[0].idProvinciaChofer)==""){
            data[0].idProvinciaChofer="P01"; // PROVINCIA LIMA
        }
        temp_Destinatarios[temp_Destinatarios.length]={ // agrega asociado
            "idPersona":data[0].idPersonaAsociado, 
            "tipoResponsable":"ASOCIADO", 
            "tipoAbrev":"A", 
            "nombre":nombresAsociado,  
            "direccion":reemplazarNullXpuntos(data[0].calleAsociado),
            doc:reemplazarNullXpuntos(data[0].nroDocAsociado),
            nro:reemplazarNullXpuntos(data[0].nroAsociado),
            mzlote:reemplazarNullXpuntos(data[0].mzloteAsociado),
            sector:reemplazarNullXpuntos(data[0].sectorAsociado),
            referencia:reemplazarNullXpuntos(data[0].referenciaAsociado),
            distrito:reemplazarNullXpuntos(data[0].idDistritoAsociado),
            provincia:reemplazarNullXpuntos(data[0].idProvinciaAsociado), 
            "telef":data[0].telefonoFijoAsociado, 
            "celular":data[0].celularAsociado, 
            "email":"", 
            "seleccionado":""
        }; 
        if(data[0].idPersonaPropietario!=null && data[0].idPersonaPropietario!=data[0].idPersonaAsociado){
            //agrega asociado
            temp_Destinatarios[temp_Destinatarios.length]={
                "idPersona":data[0].idPersonaPropietario, 
                "tipoResponsable":"PROPIETARIO", 
                "tipoAbrev":"P", 
                "nombre":nombresPropietario, 
                "direccion":reemplazarNullXpuntos(data[0].callePropietario),
                doc:reemplazarNullXpuntos(data[0].nroDocPropietario),
                nro:reemplazarNullXpuntos(data[0].nroPropietario),
                mzlote:reemplazarNullXpuntos(data[0].mzlotePropietario),
                sector:reemplazarNullXpuntos(data[0].sectorPropietario),
                referencia:reemplazarNullXpuntos(data[0].referenciaPropietario),
                distrito:reemplazarNullXpuntos(data[0].idDistritoPropietario),
                provincia:reemplazarNullXpuntos(data[0].idProvinciaPropietario),  
                "telef":data[0].telefonoFijoPropietario, 
                "celular":data[0].celularPropietario, 
                "email":"", 
                "seleccionado":""
            };
        }
        if(data[0].idPersonaChofer!=null && data[0].idPersonaChofer!=data[0].idPersonaPropietario && data[0].idPersonaChofer!=data[0].idPersonaAsociado){
            temp_Destinatarios[temp_Destinatarios.length]={
                "idPersona":data[0].idPersonaChofer, 
                "tipoResponsable":"CHOFER", 
                "tipoAbrev":"CH", 
                "nombre":nombresChofer,  
                "direccion":reemplazarNullXpuntos(data[0].calleChofer), 
                doc:reemplazarNullXpuntos(data[0].dniChofer),
                nro:reemplazarNullXpuntos(data[0].nroChofer),
                mzlote:reemplazarNullXpuntos(data[0].mzloteChofer),
                sector:reemplazarNullXpuntos(data[0].sectorChofer),
                referencia:reemplazarNullXpuntos(data[0].referenciaChofer),
                distrito:reemplazarNullXpuntos(data[0].idDistritoChofer),
                provincia:reemplazarNullXpuntos(data[0].idProvinciaChofer), 
                "telef":data[0].telefonoFijoChofer, 
                "celular":data[0].celularChofer, 
                "email":"", 
                "seleccionado":""
            }
        }
        // Cargar distritos
        consultarWebServiceGet("getAllDistritos", "", function(data){
            arrayDistritos=data; // Guarda los distritos
            consultarWebServiceGet("getAllProvincias", "", function(datos){
                arrayProvincias=datos;
                consultarWebServiceGet("getAllDepartamentos", "", function(depas){
                    arrayDepartamentos=depas;
                    $.fancybox.close();
                })
            })
        })
    }catch(err){
        emitirErrorCatch(err, "getResponsables");
    }
}

function ocultarPanelInfo(estado){ // oculta el panel azul
	try{
		if(estado){
		   estado="block";
		}
		if(!estado){
		   estado="none";		
		}
		$("#oculta").css("display", estado);

	}catch(err){ 
		emitirErrorCatch(err, "ocultarPanelInfo"); // emite error
	}
}

/* @buscarEventoByCodigo: Realiza la busqueda del evento por su codigo.
*/
function buscarEventoByCodigo(){ // busca un evento x su codigo
	try{
		fancyAlertWait("Buscando");
		ocultarPanelInfo(true);
		var tipoBusqueda="codEvento";
		var parametros="&tipoBusqueda="+tipoBusqueda+"&codigo="+$("#codEvento").val();
		consultarWebServiceGet("getEventosGeneralesDomicilioLegal", parametros, function(data){
            if(data.length>0){
                cargarInfoEvento(data);
            }else{
                abrirBusquedaAvanzada();
            }   
        })
        BuscarEventoGeneral(parametros, "verificarResultados()", 2); // Busca el evento por codigo
	}catch(err){
		emitirErrorCatch(err, "buscarEventoByCodigo");
	}
}

/* @cargarInfoEvento: Carga la informacion del evento que se encontró.
    PARAMETROS:
        1) data: array JSON de la informacion del evento
*/
function cargarInfoEvento(data){ // carga la informacion del evento
    try{
        /// carga informacion
        switch(tipoAccion){
            case 'N':
				infoDeudaGenerada = parent.window.frames[0].infoEventoSeleccionado; 
                fancyAlertWait("Cargando Información");
                data[0]=infoDeudaGenerada.infoEvento;
                getResponsables(data); // obtiene los responsables del evento
                break;
            case 'D':
                $("#codEvento").val(data[0].codEvento)
                arrayInfoEvento=data[0];
                if(arrayInfoEvento.estado!='P' && arrayInfoEvento.estado!='N'){
                    var estadoEvento;
                    switch(arrayInfoEvento.estado){
                        case 'B':
                            estadoEvento="de cobranza";
                            break;
                        case 'T':
                            estadoEvento="Terminado";
                            if(arrayInfoEvento.condonado=='C'){
                                estadoEvento=estadoEvento+"(Condonado)";
                            }
                            break;
                    }
                    fancyAlert("¡¡ Lo sentimos, el evento Nº "+arrayInfoEvento.codEvento+" se encuentra en Estado "+estadoEvento+". !!");
                    return;
                }
                getResponsables(data)
                break;
            case 'C':
                arrayInfoEvento=data[0];
                getResponsables(data)
                break;
        }
        codigoEventoSeleccionado=data[0].codEvento;
        labelTextWebPlus("id_Titulo", "INFORMACIÓN DEL EVENTO "+codigoEventoSeleccionado);
        $("#id_fecha").val(fechaFormateada(data[0].fechaAccidente, true, false)); // FECHA
        $("#id_nroCAT").val(data[0].nroCAT);
        $("#id_nombreCompletoAsociado").val(reemplazarNullXpuntos(temp_Destinatarios[0].nombre));       
        $("#id_LugarAccidente").val(data[0].lugarAccidente);
        $("#id_Placa").val(data[0].placa);
        $("#id_Distrito").val(data[0].distritoEvento);
        var causalCompleto="No Registrado";
        if(verificaNull(data[0].causal1)!="" || verificaNull(data[0].causal2)!=""){
            if(data[0].causal1!=""){
                causalCompleto=data[0].causal1;
                if(data[0].causal2!=""){
                    causalCompleto=causalCompleto+" / "+data[0].causal2;
                }
            }else{
                causalCompleto=data[0].causal2;
            }
        }
        $("#id_Causa").val(causalCompleto);
        switch(tipoAccion){
            case 'N':
                cargarTablaAgraviados();
                break;
            case 'D':
                cargarListaAgraviados();
                break;
            case 'C':
                cargarListaAgraviados();
                break;
        }

    }catch(err){
        emitirErrorCatch(err, "cargarInfoEvento")
    }
}
function abrirBusquedaAvanzada(){ // abre ventana de busqueda avanzada
	try{
        //abrirFancyBox("700", "500", "busqueda", true);
	   abrirVentanaFancyBox(700, 500, "busqueda", true, cargarInfoEvento)
    }catch(err){
		emitirErrorCatch(err, "abrirBusquedaAvanzada");
	}
}

/* @cargarListaAgraviados: Busca y carga los agraviados de un evento
*/
function  cargarListaAgraviados(){ // busca los agraviados del accidente
	try{
		var parametros="&codEvento="+codigoEventoSeleccionado;
        webService2("getAgraviadosXcodEvento", parametros, "cargarTablaAgraviados()");
	}catch(err){
		emitirErrorCatch(err, "cargarListaAgraviados");
	}
}

/* @cargarTablaAgraviados: Carga los agraviados encontrados en una TABLA HTML
*/
function cargarTablaAgraviados(){ // carga la tabla html con los agraviados encontrados
	try{
        switch(tipoAccion){
            case 'N':
                rptaWebservice=infoDeudaGenerada.infoAgraviados;
                break;
            case 'D':
                arrayInfoAgraviados=rptaWebservice;
                break;
            case 'C':
                arrayInfoAgraviados=rptaWebservice;
                break;
        }
        if(datatableAgraviados!=undefined){
            datatableAgraviados.destroy();
            $('#tabla_datos_Agraviados > tbody').html("");
        }
		for(var i=0; i<rptaWebservice.length; i++){
			$("#tabla_datos_Agraviados > tbody").append("<tr style='height:30px; font-size:10px; font-family:Arial;'  >"+
              "<td style='vertical-align: middle; '><center>"+rptaWebservice[i].idAgraviado+"</center></td>"+
              "<td style='vertical-align: middle; '><center>"+rptaWebservice[i].nombres+" "+rptaWebservice[i].apellidoPaterno+" "+rptaWebservice[i].apellidoMaterno+"</center></td>"+
              "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].nroDocumento+"</td>"+
              "<td style='vertical-align: middle;'><center>"+rptaWebservice[i].tipo+"</center></td>"+
              "<td style='vertical-align: middle;'>"+rptaWebservice[i].diagnostico+"</td>"+
              "</tr>");
		}
		datatableAgraviados=$('#tabla_datos_Agraviados').DataTable({
            "searching": false,
            "paging": false,
            "scrollY":"122px",
            "pagingType": "simple",
            "info":     false,
            "lengthChange": false,
            "scrollCollapse": false,
            "language": {
                "search": "Buscar:",
                "lengthMenu": "Visualizar _MENU_ por pag.",
                "zeroRecords": "Ningun Resultado - Lo Sentimos :(",
                "info": "Pag _PAGE_ de _PAGES_",
                "infoEmpty": "No Disponible",
                "infoFiltered": "(Filtrado de _MAX_ registros)"
            },
            //"order": [[ 0, "desc" ]],
            "bSort": false,
            "columns": [
                { "width": "10%" },
                { "width": "35%" },
                { "width": "10%"},
                { "width": "10%" },
                { "width": "35%" }
            ]
        });
        switch(tipoAccion){
            case 'N':
                cargarTablaGastos();
                break;
            case 'D':
                cargarListaGastos();
                break;
            case 'C':
                cargarListaGastos();
                break;
        }
	}catch(err){
		emitirErrorCatch(err, "cargarTablaAgraviados");
	}
}

/* @cargarListaGastos: Busca y carga los gastos del accidente.
*/
function cargarListaGastos(){ // Busca los gastos del accidente
	try{
		var parametros="&codEvento="+codigoEventoSeleccionado;
        if(tipoAccion=="C"){ // C=Cancelar Deuda
            //var fechaAcuerdo=
            parametros=parametros+"&fechaInicioFiltro="+objetoAcuerdo.fechaAcuerdo;
            //parametros=parametros+"&fechaInicioFiltro="+objetoAcuerdo.fechaAcuerdo;
        }
		webService2("getGastosByCodEvento", parametros, "cargarTablaGastos()");

	}catch(err){
		emitirErrorCatch(err, "cargarListaGastos")
	}
}

/*@cargarTablaGastos: Carga en una TABLA HTML los gatos del accidente que se encontraron en la busqueda previa.
*/
function cargarTablaGastos(){ // muestra la lista de los gastos
	try{
        switch(tipoAccion){
            case 'N':
                rptaWebservice=infoDeudaGenerada.infoGastos;
                break;
            case 'D':
                arrayInfoGastos=rptaWebservice;
                break;
            case 'C':
                arrayInfoGastos=rptaWebservice;
                break;
        }
        if(datatableGastos!=undefined){
            datatableGastos.destroy();
            $('#tabla_datos_gastos > tbody').html("");
        }
        var totalGastos=0;
		for(var i=0; i<rptaWebservice.length; i++){
			$("#tabla_datos_gastos > tbody").append("<tr style='height:30px; font-size:10px; font-family:Arial;'  >"+
              "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].numero+"</td>"+
              "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].tipoGasto+"</td>"+
              "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].fechaDoc+"</td>"+
              "<td style='vertical-align: middle;'>"+rptaWebservice[i].nombresAgraviado+"</td>"+
              "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].monto+"</td>"+
              "</tr>");
            totalGastos=totalGastos+parseFloat(rptaWebservice[i].monto);
		}
		datatableGastos=$('#tabla_datos_gastos').DataTable({
            "searching": false,
            "paging": false,
            "scrollY":"122px",
            "pagingType": "simple",
            "info":     false,
            "lengthChange": false,
            "scrollCollapse": false,
            "language": {
                "search": "Buscar:",
                "lengthMenu": "Visualizar _MENU_ por pag.",
                "zeroRecords": "Ningun Resultado - Lo Sentimos :(",
                "info": "Pag _PAGE_ de _PAGES_",
                "infoEmpty": "No Disponible",
                "infoFiltered": "(Filtrado de _MAX_ registros)"
            },
            //"order": [[ 0, "desc" ]],
            "bSort": false,
            "columns": [
                { "width": "15%" },
                { "width": "22%" },
                { "width": "10%"},
                { "width": "40%" },
                { "width": "13%" }
            ]
        });
        switch (tipoAccion){
            case 'D': // D=Deuda Actual
                //Agrega diseño a los campos
                $("#gastoTotalAccidente").css("text-align", "center"); // centra texto
                $("#gastoTotalAccidente").css("font-weight", "bold"); // negrita
                $("#idGastosAdministrativos").css("text-align", "center");
                $("#idGastosAdministrativos").css("font-weight", "bold");
                $("#granTotal").css("text-align", "center");
                $("#granTotal").css("font-weight", "bold");
                $("#granTotal").css("color", "red");
                /// Establece valores a los campos
                $("#gastoTotalAccidente").val("S/. "+totalGastos)// Muestra el gasto total
                $("#idGastosAdministrativos").focus(); // coloca el cursor en gastos administrativos
                $("#granTotal").val("S/. "+totalGastos);
                break;
            case 'N': //N=Nuevo Acuerdo
                //Agrega diseño a los campos
                $("#gastoTotalAccidente").css("text-align", "center"); // centra texto
                $("#gastoTotalAccidente").css("font-weight", "bold"); // negrita
                $("#idGastosAdministrativos").css("text-align", "center");
                $("#idGastosAdministrativos").css("font-weight", "bold");
                $("#granTotal").css("text-align", "center");
                $("#granTotal").css("font-weight", "bold");
                $("#granTotal").css("color", "red");
                /// Establece valores a los campos
                $("#gastoTotalAccidente").val("S/. "+totalGastos)// Muestra el gasto total
                $("#idGastosAdministrativos").val("S/. "+infoDeudaGenerada.gastosAdministrativos)
                $("#granTotal").val("S/. "+(totalGastos+infoDeudaGenerada.gastosAdministrativos));
                break;
            case 'C': // C=Cancelar deuda
                cargarInfoCuentasAcuerdo(totalGastos);
                break;
        }
        ocultarPanelInfo(false); // vuelve visible el panel de informacion
        $.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "cargarTablaGastos")
	}
}

/* @cargarInfoCuentasAcuerdo: Carga los nuevos gastos de un evento (Despues de ya haberse conciliado un acuerdo). Tambien busca monto actual pagado.
    PARAMETROS:
        1) nuevoTotalGastosAccidente: Valor de los nuevos gastos de un accidente (Gastos que se dan despues de ya haberse conciliado un acuerdo)
*/
function cargarInfoCuentasAcuerdo(nuevoTotalGastosAccidente){ // muestra las cuentas del acuerdo
    try{
        //DEUDA ANTERIOR:
        var gastoTotalAccidente=parseFloat(objetoAcuerdo.gastosAccidente);
        var gastosAdministrativos=parseFloat(objetoAcuerdo.gastosAdministrativos);
        var deudaTotalAnterior=gastoTotalAccidente+gastosAdministrativos;
        var deudaAcordada=parseFloat(objetoAcuerdo.deudaAcordada);        
        // Monto pagado se buscara despues
        // Saldo se mostrara despues de saber el monto pagdo
        $("#DAnt_gastoTotalAccidente").val("S/. "+deudaTotalAnterior);
        $("#DAnt_deudaAcordada").val("S/. "+deudaAcordada);
        $("#DAct_nuevoTotalGastosAccidente").val("S/. "+nuevoTotalGastosAccidente);
        // Busca monto pagado total:
        var parametros="&idAcuerdo="+objetoAcuerdo.idAcuerdo;
        webService2("getMontoPagadoByidAcuerdo", parametros, "cargarDeudaActual()");
    }catch(err){
        emitirErrorCatch(err, "cargarInfoCuentasAcuerdo");
    }
}

/* @cargarDeudaActual: Visualiza el monto pagado hasta la fecha y vuelve a recalcular la nueva deuda del accidente.
*/
function cargarDeudaActual(){
    try{
        var montoPagado=0;
        if(rptaWebservice[0].montoPagado!=null){
            montoPagado=parseFloat(rptaWebservice[0].montoPagado);
        }        
        // CARGA DEUDA ANTERIOR Y ACTUAL
        $("#DAnt_montoPagado").val("S/. "+montoPagado);
        // calcula el Saldo
        var deudaAcordada=$("#DAnt_deudaAcordada").val().replace("S/. ", "");
        deudaAcordada=parseFloat(deudaAcordada);
        var saldo=deudaAcordada-montoPagado;
        $("#DAnt_saldo").val("S/. "+saldo);
        $("#DAct_saldo").val("S/. "+saldo);
        //Calcula la nueva deuda
        var nuevoTotalGastosAccidente=$("#DAct_nuevoTotalGastosAccidente").val().replace("S/. ", "");
        nuevoTotalGastosAccidente=parseFloat(nuevoTotalGastosAccidente);
        var nuevaDeuda=saldo+nuevoTotalGastosAccidente;
        $("#DAct_nuevaDeuda1").val("S/. "+nuevaDeuda);
        $("#DAct_nuevaDeuda2").val("S/. "+nuevaDeuda);
        $("#DAct_GranTotal").val("S/. "+nuevaDeuda);

    }catch(err){
        emitirErrorCatch(err, "cargarDeudaActual");
    }
}

/*@textNumber: Valida el ingreso de numeros enteros en una caja de texto
    PARAMETROS:
        1) e = event key
        2) numeroRestringido = Numero no permitido a q se ingrese en la caja de texto
        3) valor = Texto q contiene la caja de texto
        4) long = maxima cantidad de caracteres permitidos
*/
function textNumber(e, numeroRestringido, valor, long ){
    try{
        var key = e.charCode || e.keyCode;
        if((key >= 48 && key <= 57) || (key==8)){
            if(numeroRestringido!=undefined){
                if(valor=="" && key==(48+numeroRestringido)){
                    return false;
                }
            }
            if(long!=undefined){
                if(valor.split("").length<=(long-1)){
                    return true;
                }
                return false;
            }
            return true;
        }
        return false;

    }catch(err){
        emitirErrorCatch(err, "soloNumeros");
    }
}

/* @calcularDeudaTotal: Calcula la deuda de un acuerdo incluyendo los gastos administrativos
*/
function calcularDeudaTotal(){
    try{
        var gastosAccidente=$("#gastoTotalAccidente").val().replace("S/. ", "");
        var gastosAdministrativos=$("#idGastosAdministrativos").val();
        if(gastosAdministrativos==""){
            gastosAdministrativos=0;
        }
        var sumaTotal=parseFloat(gastosAccidente)+parseFloat(gastosAdministrativos);
        $("#granTotal").val("S/. "+sumaTotal);
    }catch(err){
        emitirErrorCatch(err, "calcularDeudaTotal");
    }
}

/* @calcularGranTotal: Calcula la nueva deuda total de un evento que ya tiene un acuerdo generado.
*/
function calcularGranTotal(){
    try{
        var nuevaDeuda=$("#DAct_nuevaDeuda2").val().replace("S/. ", "");
        var nuevosGastosAdministrativos=$("#DAct_idGastosAdministrativos").val();
        if(nuevosGastosAdministrativos==""){
            nuevosGastosAdministrativos=0;
        }
        var GranTotal=parseFloat(nuevaDeuda)+parseFloat(nuevosGastosAdministrativos);
        $("#DAct_GranTotal").val("S/. "+GranTotal);
    }catch(err){
        emitirErrorCatch(err, "calcularGranTotal");
    }
}

/* @calcularNroCuotas: Calcula el nro de cuotas en funcion al valor de la cuota ingresada
*/
function calcularNroCuotas(){ 
    try{
        calculaNroCuotas=true;
        var deudaAcordada=$("#idDeudaAcordada").val();
        if($("#idValorCuota").val()!=""){ // si el valor de la cuota es diferente de vacio
            if(deudaAcordada==""){ // si la deduda acordada no se ingreso
                $("#idValorCuota").blur(); // quita focus del input
                fancyAlertFunction("Antes de ingresar el valor de la cuota, debes definir el valor de la Deuda Acordada", function(estado){
                    if(estado){
                        $("#idValorCuota").val(""); // borra el valor ingresado en VALOR DE CUOTAS
                        $("#idDeudaAcordada").focus(); // pone el focus en el campo de deuda acordada
                    }
                });
            }else{ // SI SE INGRESO LA DEUDA ACORDARDA
                // Se procedera a obtener el nro de cuotas
                var nroCuotas=0; // valor inicial de numero de cuotas
                var gastosAdministrativos; // contendra el valor de los gastos administrativos ingresados
                switch(tipoAccion){
                    case 'N': // Nuevo Acuerdo
                        gastosAdministrativos=$("#idGastosAdministrativos").val().replace("S/. ", "");
                        break;
                    case 'C': // CANCELACION
                        gastosAdministrativos=$("#DAct_idGastosAdministrativos").val();
                        if(gastosAdministrativos==""){
                            gastosAdministrativos=0;
                        }
                        break;
                }
                // Verifica que la deuda acordada sea mayor  o igual que el valor de los gastos administrativos
                if(parseFloat($("#idDeudaAcordada").val())<parseFloat(gastosAdministrativos)){ //
                     fancyAlertFunction("La deuda acordada ("+$("#idDeudaAcordada").val()+") no puede ser menor que los gastos administrativos "+gastosAdministrativos, function(estado){
                         if(estado){
                             $("#idDeudaAcordada").focus();
                         }
                     });
                     $("#idNroCuotas").val(""); // Limpia el valor del nro de cuotas
                     $("#idValorCuota").val(""); // Limpia el valor de de la cuota
                     return;
                }else{ // La deuda acordada es mayor o igual que los gastos administrativos
                    // calculando el nro de cuotas:
                    var valorCuota=$("#idValorCuota").val();
                    //nroCuotas=((parseFloat(deudaAcordada)-parseFloat(gastosAdministrativos))/parseFloat(valorCuota))+1;  ---> Calculo antiguo
                    nroCuotas=parseFloat(deudaAcordada-(($("#idCuotaInicial").val()=="")?0:parseFloat($("#idCuotaInicial").val())))/parseFloat(valorCuota);
                    nroCuotas=Math.ceil(nroCuotas);
                    $("#idNroCuotas").val(nroCuotas);
                    calcularValorCuota(); // se revuelve a calcular el valor de la cuota ingresada en factor al nro de cuotas calculado
                }
            }
        }else{
            $("#idNroCuotas").val("");
        }

    }catch(err){
        emitirErrorCatch(err, "calcularNroCuotas");
    }
}

/*@calcularValorCuota: Calcula el valor de la cuota en función al número de cuotas ingresadas.
*/
function calcularValorCuota(){
    try{
        $("#idValorCuota").val(""); // limpiar el valor de la cuota anterior
        limpiarResumenCuotas(); // Limpia el resumen de las cuotas
        var deudaAcordada=$("#idDeudaAcordada").val();
        if($("#idNroCuotas").val()!=""){ // si se ingreso el valor de nro de cuotas
            if(deudaAcordada==""){ // si la deuda acordada es vacia
                $("#idNroCuotas").blur(); // quita focus del input
                fancyAlertFunction("Antes de ingresar el Nro de cuotas, debes definir el valor de la Deuda Acordada", function(estado){
                    if(estado){
                        $("#idNroCuotas").val(""); // borra el valor ingresado en Nro de cuotas
                        $("#idDeudaAcordada").focus(); // coloca el focus en el campo de deuda acordada
                    }
                });
            }else{ // La deduda acordada no es vacia
                var valorCuota=0; // se inicializa el valor de la cuota en 0
                var nroCuotas=$("#idNroCuotas").val(); // se obtiene el numero de cuotas
                var gastosAdministrativos; // se obtendra el valor de los gastos administrativos
                switch(tipoAccion){
                    case 'N': // Nuevo acuerdo
                        gastosAdministrativos=$("#idGastosAdministrativos").val().replace("S/. ", "");
                        break;
                    case 'C': // CANCELACION
                        gastosAdministrativos=$("#DAct_idGastosAdministrativos").val();
                        if(gastosAdministrativos==""){
                            gastosAdministrativos=0;
                        }
                        break;
                }
                // Verifica que la deuda acordada sea mayor  o igual que el valor de los gastos administrativos
                if(parseFloat($("#idDeudaAcordada").val())<parseFloat(gastosAdministrativos)){ //
                    fancyAlertFunction("La deuda acordada ("+$("#idDeudaAcordada").val()+") no puede ser menor que los gastos administrativos "+gastosAdministrativos, function(estado){
                        if(estado){
                            $("#idDeudaAcordada").focus();
                        }
                    });
                    $("#idNroCuotas").val(""); // Limpia el valor del nro de cuotas
                    $("#idValorCuota").val(""); // Limpia el valor de de la cuota
                    return;
                }else{
                    // Obtiene el valor de la cuota:
                    if(parseFloat(nroCuotas)>0){ // si el nro de cuotas mayor a 1 se hara el calculo del valor de la nueva cuota, sino se tomara el valor inicial de 0
                        //valorCuota=(parseFloat(deudaAcordada)-parseFloat(gastosAdministrativos))/(parseFloat(nroCuotas)-1); // formula para calcular el valor de las cuotas
                        valorCuota=parseFloat(deudaAcordada-(($("#idCuotaInicial").val()=="")?0:parseFloat($("#idCuotaInicial").val())))/parseFloat(nroCuotas)                        
                        /*valorCuota=valorCuota.toFixed(2);
                        // obtiene solo decimales
                        decimales=valorCuota.split(".");
                        decimales=decimales[1];// obtiene los decimales del valor de la cuota
                        decimales=decimales.split("");
                        ultimoCifraDecimal=parseFloat(decimales[1]); // obtiene el ultimo decimal (centenas)
                        if(ultimoCifraDecimal>0){
                            valorCuota=parseFloat(valorCuota);
                            valorCuota=valorCuota.toFixed(1); // redondea al primer decimal
                            valorCuota=parseFloat(valorCuota);
                            if(ultimoCifraDecimal<5){ // agrega un decima al valor de la cuota
                                valorCuota=valorCuota+0.1;
                            }
                        }*/
                    }
                    /*if(parseFloat(valorCuota)==0){ // si el valor de la cuota es igual a 0, el nro de cuotas cambiara a 1
                        $("#idNroCuotas").val(1);
                    }*/
                    valorCuota=parseFloat(valorCuota).toFixed(2);
                    $("#idValorCuota").val(valorCuota);
                    emitirResumenCuotas(); // muestra el resumen de las cuotas
                }

              /*  if(parseFloat(deudaAcordada)>parseFloat(gastosAdministrativos)){
                    if($("#idNroCuotas").val()=="1"){
                        $("#idNroCuotas").val("");
                        return;
                    }

                }else{
                    valorCuota=0;
                    $("#idNroCuotas").val("1");
                }*/
                //valorCuota=Math.ceil(valorCuota);

            }
        }else{
            $("#idValorCuota").val("");
        }
    }catch(err){
        emitirErrorCatch(err, "calcularDeudaTotal");
    }
}

/* @generarDeuda: Genera la deuda del evento (Incluyendo los gastos administrativos). Esta deuda se conciliara cuando se genere el acuerdo.
*/
function generarDeuda(){
    try{
        var mensajeAdvertencia=""; // advierte al usuario si a ingresado o no un monto en gastos administrativos
        if($("#idGastosAdministrativos").val()==""){
            mensajeAdvertencia=" <BR>¡¡ No ha registrado ningun GASTO ADMINISTRATIVO !!";
            fancyConfirm("Esta seguro de proceder a generar la deuda del evento Nº "+codigoEventoSeleccionado+mensajeAdvertencia, function(estado){
                if(estado){
                    guardarDeudaTemporal();
                }
            });
        }else{
            guardarDeudaTemporal();
        }
    }catch(err){
        emitirErrorCatch(err, "generarDeuda()");
    }
}

/* @guardarDeudaTemporal: Guarda en una variable local la deuda generada del accidente y todos los datos del evento.
*/
function guardarDeudaTemporal(){ 
    try{
        var gastosAdm;
        if($("#idGastosAdministrativos").val()==""){
            gastosAdm=0;
        }else{
            gastosAdm=parseFloat($("#idGastosAdministrativos").val());
        }

        parent.window.frames[0].infoEventoSeleccionado={
            infoEvento:arrayInfoEvento,
            infoAgraviados:arrayInfoAgraviados,
            infoGastos:arrayInfoGastos,
            gastosAdministrativos:gastosAdm
        }
        parent.window.frames[0].tipoAccion="N"; // N=Nuevo Acuerdo
        parent.$.fancybox.close();
        parent.abrirFancyBox(880, 880, "deudaactual", true); // Abre la ventana para generar el nuevo acuerdo
    }catch(err){
        emitirErrorCatch(err, "guardarDeudaTemporal()");
    }
}

/* @condonarDeuda: Condona un acuerdo, cancelandolo y generando uno nuevo con monto de deuda 0 soles y estado 'CONDONADO'
*/
function condonarDeuda(){
    try{
        //deudaAcondonar=false; // reinicia el valor de la deuda condona
        fancyConfirm("¿Esta seguro que desea condonar el acuerdo?", function(estado){
            if(estado){
                fancyAlertWait("condonando deuda");
                var parametros="&idAcuerdo="+objetoAcuerdo.idAcuerdo;
                webService2("cancelarAcuerdo", parametros, "finalizarCondonacionAcuerdo()");
            }
        });
    }catch(err){
        emitirErrorCatch(err, "condonarDeuda");
    }
}
function finalizarCondonacionAcuerdo(){
    try{
        var filasAfectadas=rptaWebservice[0];
        if(filasAfectadas>0){
            var parametros="&codEvento="+codigoEventoSeleccionado+
                "&gastosAccidente="+$("#DAct_nuevaDeuda2").val().replace("S/. ", "")+
                "&gastosAdministrativos=0"+
                "&idDeudaAcordada=0"+
				"&idCuotaInicial=0"+
                "&idValorCuota=0"+
                "&idNroCuotas=0"+
                "&idFechaInicio="+
                "&idPeriodoDias=0"+
                "&responsables="+
                "&idAcuerdoAnterior="+objetoAcuerdo.idAcuerdo+
                "&estadoAcuerdo=T";
                webService2("guardarAcuerdo", parametros, "finalizarCondonacion()");

        }else{
            fancyAlert("No se pudo condonar el acuerdo");            
        }
    }catch(err){
        emitirErrorCatch(err, "finalizarCondonacionAcuerdo");
    }
}
function finalizarCondonacion(){
    try{
        if(rptaWebservice[0]>0){
            fancyAlertFunction("¡¡ Se condono la deuda exitosamente !!", function(estado){
                if(estado){
                    parent.window.frames[0].infoEventoSeleccionado=undefined;
                    parent.$.fancybox.close();
                    parent.window.frames[0].cargarListaAcuerdos();
                }
            })
        }

    }catch(err){
        emitirErrorCatch(err, "finalizarCondonacion")
    }
}

/* @cancelarAcuerdo: Cancela un acuerdo y genera uno nuevo con la nueva deuda establecida.
*/
function cancelarAcuerdo(){
    try{
        var idPanelDeudaActual="panelDeudaActual";
        var idPanelAcuerdo="panelDatosAcuerdo";
        if(validarCamposRequeridos(idPanelDeudaActual) && validarCamposRequeridos(idPanelAcuerdo)){
            var contadorDestinatarios=0;
            for(var i=0; i<temp_Destinatarios.length; i++){
                if(temp_Destinatarios[i].seleccionado=="checked"){ // se encontro destinatario seleccinado
                    contadorDestinatarios++;
                }
            }
            if(contadorDestinatarios>0){            
                fancyConfirm("¿Desea proceder con la cancelación del acuerdo?", function(estado){
                    if(estado){
                        fancyAlertWait("Cancelando acuerdo");
                        var parametros="&idAcuerdo="+objetoAcuerdo.idAcuerdo;
                        webService2("cancelarAcuerdo", parametros, "finalizarCancelarAcuerdo()");
                    }
                });
            } else{
                fancyAlertFunction("Debe selecionar al menos un Responsable para proceder con la cancelación del acuerdo", function(estado){
                    if(estado){
                        $("#idVistaResponsables").focus();
                    }
                })
            }
        }

    }catch(err){
        emitirErrorCatch(err, "cancelarAcuerdo");
    }
}
function finalizarCancelarAcuerdo(){
    try{
        var filasAfectadas=rptaWebservice[0];
        if(filasAfectadas>0){
            var idPanelDeudaActual="panelDeudaActual";
            var idPanelAcuerdo="panelDatosAcuerdo";
            if(validarCamposRequeridos(idPanelAcuerdo) && validarCamposRequeridos(idPanelDeudaActual)){
                var responsablesSeleccionados="";
                // Busca si hay responsables seleccionados
                var contadorDestinatarios=0;
                for(var i=0; i<temp_Destinatarios.length; i++){
                    if(temp_Destinatarios[i].seleccionado=="checked"){ // se encontro destinatario seleccinado
                        if(contadorDestinatarios>0){
                            responsablesSeleccionados=responsablesSeleccionados+"{ln}";
                        }
                        responsablesSeleccionados=responsablesSeleccionados+
                            temp_Destinatarios[i].idPersona+"{;}"+
                            temp_Destinatarios[i].tipoAbrev+"{;}"+
                            temp_Destinatarios[i].direccion+"{;}"+
                            temp_Destinatarios[i].telef+"{;}"+
                            temp_Destinatarios[i].celular+"{;}"+
                            temp_Destinatarios[i].email+"{;}"+
                            temp_Destinatarios[i].doc+"{;}"+ // nro doc
                            temp_Destinatarios[i].nro+"{;}"+ // nro domicilio
                            temp_Destinatarios[i].mzlote+"{;}"+ // mz ylote
                            temp_Destinatarios[i].sector+"{;}"+ // sector
                            temp_Destinatarios[i].referencia+"{;}"+ // referencia
                            temp_Destinatarios[i].distrito; // distrito
                        if(temp_Destinatarios[i].idPersona=='N'){// Nueva Persona
                            responsablesSeleccionados=responsablesSeleccionados+"{;}"+temp_Destinatarios[i].nombre;
                        }
                        contadorDestinatarios++;
                    }
                }
                if(contadorDestinatarios>0){
                    fancyAlertWait("Generado Nuevo Acuerdo");
                    var parametros="&codEvento="+codigoEventoSeleccionado+
                        "&gastosAccidente="+$("#DAct_nuevaDeuda2").val().replace("S/. ", "")+
                        "&gastosAdministrativos="+$("#DAct_idGastosAdministrativos").val()+
                        "&idDeudaAcordada="+$("#idDeudaAcordada").val()+
						"&idCuotaInicial="+$("#idCuotaInicial").val()+
                        "&idValorCuota="+$("#idValorCuota").val()+
                        "&idNroCuotas="+$("#idNroCuotas").val()+
                        "&idFechaInicio="+dateTimeFormat($("#idFechaInicio").val())+
                        "&idPeriodoDias="+$("#idPeriodoDias").val()+
                        "&responsables="+responsablesSeleccionados+
                        "&idAcuerdoAnterior="+objetoAcuerdo.idAcuerdo;
                        webService2("guardarAcuerdo", parametros, "finalizarRegistroAcuerdo()");
                }else{
                    fancyAlertFunction("Debe selecionar al menos un Responsable para proceder con el registro del acuerdo", function(estado){
                        if(estado){
                            $("#idVistaResponsables").focus();
                        }
                    })
                }
            }        

        }else{
            fancyAlert("No se pudo cancelar el acuerdo");            
        }

    }catch(err){
        emitirErrorCatch(err, "finalizarCancelarAcuerdo");
    }
}

/* @guardarAcuerdo: Genera un acuerdos con sus cuotas de pago.
*/
function guardarAcuerdo(){
    try{
        var idPanel="panelDatosAcuerdo";
        if(validarCamposRequeridos(idPanel)){
            var responsablesSeleccionados="";
            // Busca si hay responsables seleccionados
            var contadorDestinatarios=0;
            for(var i=0; i<temp_Destinatarios.length; i++){
                if(temp_Destinatarios[i].seleccionado=="checked"){ // se encontro destinatario seleccinado
                    if(contadorDestinatarios>0){
                        responsablesSeleccionados=responsablesSeleccionados+"{ln}";
                    }
                    responsablesSeleccionados=responsablesSeleccionados+
                        temp_Destinatarios[i].idPersona+"{;}"+
                        temp_Destinatarios[i].tipoAbrev+"{;}"+
                        temp_Destinatarios[i].direccion+"{;}"+
                        temp_Destinatarios[i].telef+"{;}"+
                        temp_Destinatarios[i].celular+"{;}"+
                        temp_Destinatarios[i].email+"{;}"+
                        temp_Destinatarios[i].doc+"{;}"+ // nro doc
                        temp_Destinatarios[i].nro+"{;}"+ // nro domicilio
                        temp_Destinatarios[i].mzlote+"{;}"+ // mz ylote
                        temp_Destinatarios[i].sector+"{;}"+ // sector
                        temp_Destinatarios[i].referencia+"{;}"+ // referencia
                        temp_Destinatarios[i].distrito; // distrito;
                    if(temp_Destinatarios[i].idPersona=='N'){// Nueva Persona
                        responsablesSeleccionados=responsablesSeleccionados+"{;}"+temp_Destinatarios[i].nombre;
                    }
                    contadorDestinatarios++;
                }
            }
            if(contadorDestinatarios>0){
                fancyConfirm("¿Esta seguro de proceder con el registro del Acuerdo?", function(estado){
                    if(estado){
                        fancyAlertWait("Guardando");
                        // Obtiene parametros
                        var parametros="&codEvento="+codigoEventoSeleccionado+
                            "&gastosAccidente="+$("#gastoTotalAccidente").val().replace("S/. ", "")+
                            "&gastosAdministrativos="+$("#idGastosAdministrativos").val().replace("S/. ", "")+
                            "&idDeudaAcordada="+$("#idDeudaAcordada").val()+
                            "&idCuotaInicial="+$("#idCuotaInicial").val()+
							"&idValorCuota="+$("#idValorCuota").val()+
                            "&idNroCuotas="+$("#idNroCuotas").val()+
                            "&idFechaInicio="+dateTimeFormat($("#idFechaInicio").val())+
                            "&idPeriodoDias="+$("#idPeriodoDias").val()+
                            "&responsables="+responsablesSeleccionados;
                        webService2("guardarAcuerdo", parametros, "finalizarRegistroAcuerdo()");
                    }
                });
            }else{
                fancyAlertFunction("Debe selecionar al menos un Responsable para proceder con el registro del acuerdo", function(estado){
                    if(estado){
                        $("#idVistaResponsables").focus();
                    }
                })
            }
        }
    }catch(err){
        emitirErrorCatch(err, "guardarAcuerdo");
    }
}
function finalizarRegistroAcuerdo(){
    try{
        if(rptaWebservice[0]>0){
            var mensaje="Se registro el acuerdo correctamente";
            if(tipoAccion=="C"){ // Cancelar
                mensaje="Se registro un nuevo acuerdo correctamente";
            }
            fancyAlertFunction(mensaje+" (Id:"+rptaWebservice[0]+")", function(estado){
                if(estado){
                    parent.window.frames[0].infoEventoSeleccionado=undefined;
                    parent.$.fancybox.close();
                    parent.window.frames[0].cargarListaAcuerdos();
                }
            });
        }else{
            fancyAlert("No se pudo registrar el acuerdo");
        }

    }catch(err){
        emitirErrorCatch(err, "finalizarRegistroAcuerdo()")
    }
}
function abrirVistaResponsables(){
    try{
        abrirFancyBox(1350, 400, "listaresponsables", true);
    }catch(err){
        emitirErrorCatch(err, "abrirVistaResponsables");
    }
}
function emitirResumenCuotas(){ // genera y muestra el resumen de las cuotas
    try{
        if($("#idValorCuota").val()!="" && $("#idNroCuotas").val()!=""){ // si se conoce el valor de la cuota y numero de cuotas, se procede a mostrar el resumen del cronograma de pagos
            $("#rc_cuotaRestante").val(parseInt($("#idNroCuotas").val()))
            $("#rc_valorcuota").val($("#idValorCuota").val());
            $("#rc_valorcuota").val($("#idValorCuota").val());
            $("#rc_deudaacordada").val($("#idDeudaAcordada").val());
			$("#rc_primeracuota").val(($("#idCuotaInicial").val()=="")?0:$("#idCuotaInicial").val())
            $("#idBtnVerCronograma").prop("disabled", false);
        }
    }catch(err){
        emitirErrorCatch(err,"emitirResumenCuotas")
    }
}
function limpiarResumenCuotas(){
    try{
        $("#rc_primeracuota").val(""); // la primera cuota es el valor de los gastos administrativos
        $("#rc_cuotaRestante").val(""); // el numero de cuotas restante es igual al numero de cuotas generadas menos 1 (Por q la primera cuota son los gastos administrativos)
        $("#rc_valorcuota").val("");
        $("#rc_deudaacordada").val("");
        $("#idBtnVerCronograma").prop("disabled", true);
    }catch(err){
        emitirErrorCatch(err, "limpiarResumenCuotas");
    }
}

/* @verCronograma: Genera un arreglo con las cuotas del cronograma de pago. Luego Abre la ventana donde carga el cronograma en una tabla HTML.
*/
function verCronograma(){ // abre la ventana para que se visualiza el cronograma
    try{
        arrayCuotasCronograma.length=0; //reinicia lista de cuotas
        var gastosAdministrativos;
        switch(tipoAccion){
            case 'N': // Nuevo Acuerdo
                gastosAdministrativos=$("#idGastosAdministrativos").val().replace("S/. ", "");
                break;
            case 'C': // Cancelar acuerdo
                gastosAdministrativos=$("#DAct_idGastosAdministrativos").val();
                break;
        }
        var valorCuota=$("#idValorCuota").val(); // obtiene el valor de la cuota
        var nroCuotas=parseInt($("#idNroCuotas").val()); // obtiene el numero de cuotas
        var fechaInicio=$("#idFechaInicio").val(); // obtiene la fecha de inicio del pago convertido en una variable DATE por medio de la funcion parseDATE
        var periodo=$("#idPeriodoDias").val(); // obtiene el periodo de intervalo
        if(fechaInicio==""){ // verifica que se haya insertado la fecha de inicio
            fancyAlertFunction("Ingrese la fecha de Inicio de Pago", function(estado){
                if(estado){
                    $("#idFechaInicio").focus()
                }
            })
            return;
        }
        if(periodo==""){ // identifica que se haya insertado el periodo
            fancyAlertFunction("Ingrese el Periodo de las cuotas", function(estado){
                if(estado){
                    $("#idPeriodoDias").focus()
                }
            });
            return;
        }
		var cuotaInicial = $("#idCuotaInicial").val()
		var nro = 1;
		if(cuotaInicial!="" && cuotaInicial!="0"){ // agrega cuota inicial como primera cuota
			arrayCuotasCronograma.push({
				nroCuota:nro,
				fecha:convertirAfechaString(new Date(), false, false),
				monto:parseFloat(cuotaInicial).toFixed(2)
			})
			nro++;
			nroCuotas++;
		}
        fechaInicio=parseDATE(fechaInicio);
        periodo=parseInt(periodo);
        arrayCuotasCronograma.push({nroCuota:nro, fecha: $("#idFechaInicio").val(), monto:valorCuota }); // primera cuota
		nro++;
        // completa las cuotas restantes
        var numMeses=periodo/30;
        var fechaPago=fechaInicio;
        for(var i=nro; i<=nroCuotas; i++){
            if(periodo%30!=0){ // sino es divisible entre 30
                fechaPago=new Date(fechaPago.setDate(fechaPago.getDate()+periodo));    
            }else{                
                fechaPago=new Date(fechaPago.setMonth(fechaPago.getMonth()+numMeses));
            }            
            fechaPagoString=fechaFormateada(fechaPago, false, true);
            arrayCuotasCronograma[arrayCuotasCronograma.length]={
                nroCuota:i,
                fecha:fechaPagoString,
                monto:valorCuota
            };
        }
        abrirFancyBox(500,500, "vistacronograma", true);
    }catch(err){
        emitirErrorCatch(err, "verCronograma")
    }
}