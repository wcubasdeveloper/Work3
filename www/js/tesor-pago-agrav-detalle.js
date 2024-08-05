/**
 * Created by JEAN PIERRE on 22/02/2018.
 */
var accion;
var nroOrden=0
var idExpediente;
var codAgraviado;
var codEvento;
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var DAOS = new DAOWebServiceGeT("wbs_as-sini");

var tipoExpediente;
var UIT = 0;
var sueldoMinimo = 0
var personaBeneficiario = []
var arrayDistritos = []
var arrayDepartamentos;
var arrayProvincias;
var estadoOrden
var etapas = {
	"GASTOS_MEDICOS":"1",
	"INCAPACIDAD_TEMPORAL":"2",
	"INCAPACIDAD_PERMANENTE":"3",
	"MUERTE":"4",
	"SEPELIO":"5"
}
var tipoExp = {
	"1":"Reemb. Gastos méd.",
	"2":"Indem. por muerte",
	"3":"Indem. por sepelio",
	"4":"Indem. por Incap. temp.",
	"5":"Indem. por Inval. perm."
}

function modoSoloLectura(){
	try{
		 $(":input").prop("disabled", true); 
		 $(":input").css("opacity", "0.5")
	}catch(err){
		emitirErrorCatch(err, "modoSoloLectura")
	}
}
function cargarEtapa(idEtapa){
	try{
		$("#tipoGasto").val(idEtapa)
		$("#tipoGasto").prop("disabled", true)
        cargarInfoEtapa(idEtapa)
	}catch(err){
		emitirErrorCatch(err, "cargarEtapa")
	}
	
}
cargarInicio(function(){
	$("#txtEstado").hide()
	$("#txtNroOrden").css("font-size", "12.5px")
	$("#editarBeneficiario").hide()
	$("#editarBeneficiario").click(abrirEdicionBeneficiario)
	$("#btnBuscarBeneficiario").click(buscarPersona)
    accion = $_GET("accion") // N= Nueva orden de pago; E = Editar una orden de pago ya existente
    codEvento = $_GET("codEvento")
    codAgraviado = $_GET("codAgraviado")
    if(accion == "N"){
        idExpediente = $_GET("nroExpediente")
    }else{
        var resultsOP;
        nroOrden = parseInt($_GET("nroOrden"))
		$("#txtNroOrden").val(nroOrden)
        var parametros = "&nroOrdenPago="+nroOrden
        DAO.consultarWebServiceGet("getOrdenPagoAgraviadoDetalle", parametros, function(results) {
            if (results.length == 0) {
                fancyAlert("No se encontro orden!")
                return;
            }
            resultsOP = results;
            codEvento = resultsOP[0].codEvento
            codAgraviado = resultsOP[0].codAgraviado
        })
    }
	$("#fechaOrden").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	// habilita los campos opcionales
	$("#txtObservaciones").prop("readonly", false)
	$("#txtDNIBeneficiario").prop("readonly", false)
	
	// habilita cajas de texto numericas
    $("#txtDNIBeneficiario").addClass("solo-numero")
	$("#txtDNIBeneficiario").prop("maxlength", "8")
	$("#txtTotalCarta").addClass("decimales")
	$("#txtDiasInvalidez").addClass("solo-numero")
	$("#txtPorcentajeInvalidez").addClass("solo-numero")
	asignarNumericos()
	asignarDecimalNumericos()
	$("#btnGuardar").click(function(){
		guardarOrden("I")
	})
	$("#btnAprobar").click(function(){
		guardarOrden("B")
	})
    // carga la tabla de cartas de agraviados:
    var parametros = "&codEvento="+codEvento+"&codAgraviado="+codAgraviado;
    DAOS.consultarWebServiceGet("getListaCartas", parametros, function(data){
        listadoCartas = data;
        DAOS.consultarWebServiceGet("getTotalFacturaPorEtapa", "&codAgraviado="+codAgraviado, function(resultsFacturas){
            if(resultsFacturas.length>0){
                montoFacturasPorEtapa = resultsFacturas[0]
            }
            DAOS.consultarWebServiceGet("getTotalOrdenesPorEtapa", "&codAgraviado="+codAgraviado, function(resultsOrdenes){
                if(resultsOrdenes.length>0){
                    montoOrdenesPorEtapa = resultsOrdenes[0]

                    switch (accion){
                        case 'N':
                            $("#fechaOrden").val(convertirAfechaString(new Date(), false));
                            $("#codEvento").val($_GET("codEvento"))
                            $("#idNombre").val($_GET("nombreAgraviado"))
                            $("#idAgraviado").val($_GET("codAgraviado"))
                            $("#idExpediente").val(LPAD($_GET("idExpediente"),numeroLPAD))
                            $("#idTipoExpediente").val($_GET("tipoExp"))
                            tipoExpediente = $_GET("tipoExpediente")
                            prepararUI()
                            break;
                        case 'E':
                            idExpediente = resultsOP[0].idExpediente
                            estadoOrden = resultsOP[0].estado
                            tipoExpediente = resultsOP[0].tipoExpediente
                            $("#fechaOrden").val(resultsOP[0].fechaRegistro);
                            $("#codEvento").val(resultsOP[0].codEvento)
                            $("#idNombre").val(resultsOP[0].nombreAgraviado)
                            $("#idAgraviado").val(codAgraviado)
                            $("#idExpediente").val(LPAD(idExpediente,numeroLPAD))
                            $("#idTipoExpediente").val(tipoExp[tipoExpediente])
                            if(resultsOP[0].nroDiasInvalTemp>0){
                                $("#txtDiasInvalidez").val(resultsOP[0].nroDiasInvalTemp)
                            }
                            if(resultsOP[0].porcInvalPerm>0){
                                $("#txtPorcentajeInvalidez").val(resultsOP[0].porcInvalPerm)
                            }
                            $("#txtObservaciones").val(resultsOP[0].observaciones)
                            $("#txtTotalCarta").val(resultsOP[0].monto.toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,"))
                            if(resultsOP[0].idPersona!=null && resultsOP[0].idPersona>0){
                                $("#txtDNIBeneficiario").val(resultsOP[0].nroDocumento)
                                buscarPersona()
                            }
                            prepararUI()
                            if(estadoOrden == 'B' || estadoOrden=='P' || estadoOrden == 'A'){
                                if(estadoOrden=='B'){
                                    $("#txtEstado").show()
                                }
                                modoSoloLectura()
                            }
                            $.fancybox.close()
                            break;
                    }

                }
            })
        })
    });

    // Habilita campos en funcion al tipo de expediente seleccionado
	// Los campos Beneficiario y observaciones son opcionales en cualquier tipo de expediente
	
})
//9/sep/2019 Agregar gastos consumidos por este Agraviado para ver su DISPONIBLE
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
var listadoCartas;
var montoFacturasPorEtapa;
var montoOrdenesPorEtapa;
var disponible;
function cargarInfoEtapa(idEtapa){ // carga informacion con respeto a las UIT disponible por etapa
    try{
        // total UIT:
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
            if(listadoCartas[i].estado=='P' && listadoCartas[i].idCobertura == idEtapa ){
                totalCartas = totalCartas+ listadoCartas[i].monto
            }
        }
        $("#idTotalCG").val(number_format(totalCartas, 2, '.', ','))
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

function prepararUI(){
	try{
		// primero obtiene UIT y sueldo minimo del informe
		var parametros = "&codEvento="+codEvento
		DAO.consultarWebServiceGet("getUITandSueldoMinimo", parametros, function(data){
			if(data.length>0){
				UIT = data[0].UIT
				sueldoMinimo = data[0].sueldoMinVital
			}
			switch (tipoExpediente){
				case '1':
					cargarEtapa(etapas["GASTOS_MEDICOS"])
					soloMonto()
					break;
				case '2':
					cargarEtapa(etapas["MUERTE"])
					soloMonto()
					break;
				case '3':
					cargarEtapa(etapas["SEPELIO"])
					soloMonto()
					break;
				case '4':
					cargarEtapa(etapas["INCAPACIDAD_TEMPORAL"])
					// inactiva los campos
					$("#txtPorcentajeInvalidez").prop("readonly", true)	
					$("#txtPorcentajeInvalidez").val("")
					$("#txtPorcentajeInvalidez").removeAttr("requerido");
					
					$("#txtTotalCarta").prop("readonly", true)	
					// habilitado el campo
					$("#txtDiasInvalidez").prop("readonly", false)
					$("#txtDiasInvalidez").attr("requerido", "Dias de descanso médico");
					$("#txtDiasInvalidez").keyup(function(){
						var diasDescanso = this.value
						var total = (parseFloat(diasDescanso)/30) * sueldoMinimo;
						total = number_format(total, 2, ".", "")
						$("#txtTotalCarta").val(total)
					})
					$("#txtTotalCarta").attr("requerido", "Monto")
					break;
				case '5':
					cargarEtapa(etapas["INCAPACIDAD_PERMANENTE"])
					// inactiva los campos
					$("#txtDiasInvalidez").prop("readonly", true)	
					$("#txtDiasInvalidez").val("")
					$("#txtDiasInvalidez").removeAttr("requerido")
					
					$("#txtTotalCarta").prop("readonly", true)	
					// habilitado el campo
					$("#txtPorcentajeInvalidez").prop("readonly", false)
					$("#txtPorcentajeInvalidez").attr("requerido", "Porcejante invalidez");
					$("#txtPorcentajeInvalidez").keyup(function(){
						var porcentaje = this.value
						var total = porcentaje * 4 * UIT / 100;
						//total = number_format(total, 2, ".", "")
						$("#txtTotalCarta").val(total.toFixed(1)) //.replace(/(\d)(?=(\d{3})+\.)/g, "$1,"))
					})
					$("#txtTotalCarta").attr("requerido", "Monto")
					break;		
			}
			$.fancybox.close()
		})				
	}catch(err){
		emitirErrorCatch(err, "prepararUI")
	}
}
function soloMonto(){ // habilita solo el campo monto como requerido. Esto se aplica para los expedientes tipo 1-3
	try{
		$("#txtDiasInvalidez").prop("readonly", true)	
		$("#txtPorcentajeInvalidez").prop("readonly", true)	
		$("#txtTotalCarta").prop("readonly", false)	
		// asigna como obligatorio
		$("#txtTotalCarta").attr("requerido", "Monto");
	}catch(err){
		emitirErrorCatch(err, "soloMonto")
	}
}
function guardarOrden(estado){
	try{
		if(validarCamposRequeridos("Layer1")){
			if(personaBeneficiario.length>0){
				if(personaBeneficiario[0].nombres=="" || personaBeneficiario[0].apellidoPaterno=="" || personaBeneficiario[0].apellidoMaterno==""){
					fancyAlert("¡Debe registrar el nombre del beneficiario completo!")
					return;
				}
			}
            /*
			var validarMaxMonto = false
			var maxMonto = 0
			var subMensaje = ""
			switch (tipoExpediente){
				case '4':
					validarMaxMonto = true
					maxMonto = UIT
					subMensaje = " (1 UIT) "
					break;
				case '5':
					validarMaxMonto = true
					maxMonto = 4 * UIT 
					subMensaje = " (4 UIT) "
					break;
			}
			if(validarMaxMonto){*/
				var monto=$("#txtTotalCarta").val()
				monto = parseFloat(monto)
				if(monto>disponible){
					fancyAlert(" ¡ Monto excede al máximo DISPONIBLE ! ")
					return
				}
			//}
			
			fancyConfirm("¿Esta seguro de guardar la orden de pago?", function(rpta){
				if(rpta){
					var jsonObject = {
						nroOrdenPago:nroOrden,
						beneficiario:personaBeneficiario,
						diasDescanso:$("#txtDiasInvalidez").val(),
						porcentaje:$("#txtPorcentajeInvalidez").val(),
						observaciones:$("#txtObservaciones").val(),
						monto:$("#txtTotalCarta").val(),
						fecha:dateTimeFormat($("#fechaOrden").val()),
						idExpediente:idExpediente,
						tipoExpediente:tipoExpediente,
						codEvento:$("#codEvento").val(),
						codAgraviado:codAgraviado,
						estado:estado,
						idEtapa:$("#tipoGasto").val(),
						observaciones:$("#txtObservaciones").val()
					}
					
					if(accion=="N"){
						DAO.consultarWebServicePOST(jsonObject, "guardarOrdenPagoAgraviado", function(data){
							if(data.length>0){								
								if(estado=='B'){
									fancyConfirm(" Desea imprimir la Orden de Pago ?",function(rpta){
										if(rpta){
											nroOrden = data[0]
											abrirVentanaPlantillaEdicion(nroOrden)
										}else{
											cerrarVentana(true)
										}
									})
								}else{
									cerrarVentana(true)
								}								
							}else{
								fancyAlert("Fallo al registrar la Orden de pago!")
							}
						})				
					}else{ // Editar
						DAO.consultarWebServicePOST(jsonObject, "actualizarOrdenPagoAgraviado", function(data){
							//var filasAfectadas = data
							if(data.length>0){
								if(estado=='B'){
									fancyConfirm(" Desea imprimir la Orden de Pago ?",function(rpta){
										if(rpta){
											abrirVentanaPlantillaEdicion(nroOrden,tipoExpediente)
										}else{
											cerrarVentana(false)
										}
									})
								}else{
									cerrarVentana(false)
								}
							}else{
								fancyAlert("¡Operacion Fallida!")
							}
						})
					}
				}
			})
		}		
	}catch(err){
		emitirErrorCatch(err, "guardarOrden")
	}
}
function cerrarVentana(realizarBusqueda){
	realizoTarea=true;
	if(realizarBusqueda){
		parent.window.frames[0].buscar()
	}								
	parent.$.fancybox.close();
}
function buscarPersona(){
	try{
		var DNI = $("#txtDNIBeneficiario").val();
		var cantidadDigitos = DNI.split("").length;
		if(cantidadDigitos == 8){
			var parametros = "&nroDoc="+DNI;
			DAOV.consultarWebServiceGet("getPersonaByNroDoc", parametros, function(data){
                cargarResultPersona(data);
				//$.fancybox.close();				
			});
		}else{
			fancyAlertFunction("¡ Formato de DNI es incorrecto !", function(rpta){
				if(rpta){
					$("#txtDNIBeneficiario").focus();
				}
			})
		}
		
	}catch(err){
		emitirErrorCatch(err, "buscarPersona")
	}
}
function abrirVentanaPlantillaEdicion(nroOrdenPago){
	try{
		abrirVentanaFancyBox(760, 495, "editar_ordenpago_pdf?nroOrden="+nroOrdenPago+"&IG=true", true, function (rptaDatos){
			var hacerBusqueda = false
			if(accion=="N"){
				hacerBusqueda = true
			}
			cerrarVentana(hacerBusqueda)
		})			
	}catch(err){
		emitirErrorCatch(err, "abrirVentanaPlantillaEdicion")
	}
}
function abrirEdicionBeneficiario(){
	try{
		abrirVentanaFancyBox(570, 360, "tesor-pago-agrav-benef", true, function (rptaDatos){
			personaBeneficiario = rptaDatos
			$("#txtNombreBeneficiario").val(quitarEspaciosEnBlanco(personaBeneficiario[0].nombres)+" "+quitarEspaciosEnBlanco(personaBeneficiario[0].apellidoPaterno)+" "+quitarEspaciosEnBlanco(personaBeneficiario[0].apellidoMaterno));
		})		
	}catch(err){
		emitirErrorCatch(err, "abrirEdicionBeneficiario")		
	}
}
function cargarResultPersona(data){
	try{
		$("#txtDNIBeneficiario").prop("readonly", true)
		$("#btnBuscarBeneficiario").unbind("click");
		$("#btnBuscarBeneficiario").prop("class", "glyphicon glyphicon-minus-sign");
		$("#btnBuscarBeneficiario").click(function(){
			cambiarDNI();
		});			
		if(data.length>0){ // encontro a la persona que se buscaba
			personaBeneficiario.push(data[0])
			$("#txtNombreBeneficiario").val(quitarEspaciosEnBlanco(data[0].nombres)+" "+quitarEspaciosEnBlanco(data[0].apellidoPaterno)+" "+quitarEspaciosEnBlanco(data[0].apellidoMaterno));
			$.fancybox.close()
		}else{
			// abre popup para que ingrese la persona
			personaBeneficiario = [{
				idPersona : 0,
				nroDocumento : $("#txtDNIBeneficiario").val(),
				nombres:"",
				apellidoPaterno:"",
				apellidoMaterno:"",
				telefonoMovil:"",
				calle:"",
				distritoInicial:null
			}]
			abrirEdicionBeneficiario()
		}
		$("#editarBeneficiario").show()
	}catch(err){
		emitirErrorCatch(err, "cargarResultPersona")
	}
}
function cambiarDNI(){
	try{
		$("#btnBuscarBeneficiario").unbind("click");
		$("#btnBuscarBeneficiario").prop("class", "glyphicon glyphicon-search");
		$("#btnBuscarBeneficiario").click(function(){
			buscarPersona();
		});
		$("#txtDNIBeneficiario").val("")
		$("#txtDNIBeneficiario").prop("readonly", false)
		$("#txtNombreBeneficiario").val("")
		$("#txtDNIBeneficiario").focus();
		personaBeneficiario = []
		$("#editarBeneficiario").hide()
	}catch(err){
		emitirErrorCatch(err, "cambiarDNI")
	}
}