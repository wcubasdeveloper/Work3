/**
 * Created by JEAN PIERRE on 7/01/2018.
 */
var accion;
var nroOrden=0
var idExpediente;
var codAgraviado;
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var arrayDatosCartas = [], arrayDatosFac = [];
var contadorIdCartas = 0, contadorIdFacturas=0;
var listaCartas = [] // CARTAS RESTANTES del agraviado
var tiposDocumentos = []
var estados = {
    "P":"Pend."
}
var estadoOrden
//var cartasEliminadas = []
var facturasEliminadas = []

var camposAmostrarC = [ // asigna los campos a mostrar en la grilla
                    {campo:'etapa'       , alineacion:'center'      },
                    {campo:'nosocomio'        , alineacion:'left'           },
                    {campo:'estadoCarta'            , alineacion:'Center'           },
                    {campo:'nroCarta'              , alineacion:'center'           },
                    {campo:'fechaCarta'   , alineacion:'center'           },
                    {campo:'tipoAtencion'   , alineacion:'left'           },
                    {campo:'monto'   , alineacion:'right'           }
                ];
var camposAmostrarF = [ // asigna los campos a mostrar en la grilla
                        {campo:'nombreEtapa', alineacion:'center'},
						{campo:'tipoDocumento'       , alineacion:'center'      },						
                        {campo:'nroDocumento'        , alineacion:'center'           },
                        {campo:'fechaEmision'            , alineacion:'Center'           },
                        {campo:'observaciones'              , alineacion:'left'           },
                        {campo:'fechaRecepcion'   , alineacion:'center'           },
                        {campo:'monto'   , alineacion:'right'           }
                    ];
				
var nombreEtapas = {
	"1":"Gastos Médicos",
	"5":"Por sepelio"
}
cargarInicio(function(){
	$("#txtEstado").hide()
	$("#txtNroOrden").css("font-size", "12.5px")
    accion = $_GET("accion") // N= Nueva orden de pago; E = Editar una orden de pago ya existente
    if(accion == "N"){
        idExpediente = $_GET("nroExpediente")
        codAgraviado = $_GET("codAgraviado")
    }else{
        nroOrden = parseInt($_GET("nroOrden"))
		$("#txtNroOrden").val(nroOrden)
	}
    // agrega funcionalidades a los botones:
    $("#btnEliminarCarta").click(eliminarCarta)
    $("#btnAgregaCarta").click(agregarCarta)
    $("#btnEliminarFac").click(eliminarFactura)
    $("#btnEditarFac").click(editarFactura)
    $("#btnAgregaFac").click(nuevaFactura)
    $("#btnGuardar").click(guardarOrden)
    $("#fechaOrden").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});

    // cargar lista de proveedores:
    DAOV.consultarWebServiceGet("getProveedores", "", function(arrayProveedores){
        
		var campos =  {"keyId":'idProveedor', "keyValue":'nombreProveedor'}
        agregarOpcionesToCombo("idProveedor", arrayProveedores, campos);
		aplicarDataTableCartas()
        aplicarDataTableFacturas()

        switch (accion){
            case 'N':
                $("#fechaOrden").val(convertirAfechaString(new Date(), false));
                $("#codEvento").val($_GET("codEvento"))
                $("#idNombre").val($_GET("nombreAgraviado"))
                $("#idAgraviado").val($_GET("codAgraviado"))
                //var proveedorSeleccionado = parent.window.frames[0].$("#idCmbProveedor").val()
                $("#idProveedor").val($_GET("idProveedor"))
                $("#idProveedor").prop("disabled", true)
				$("#idProveedor").select2();
                cargarCartasRestantes(codAgraviado)
				break;
				
            case 'E':
				var parametros = "&nroOrdenPago="+nroOrden
                DAO.consultarWebServiceGet("getOrdenPagoDetalle", parametros, function(results){
					idExpediente = results[0].idExpediente
					codAgraviado = results[0].codAgraviado
					estadoOrden = results[0].estado
					$("#fechaOrden").val(results[0].fechaRegistro);
					$("#codEvento").val(results[0].codEvento)
					$("#idNombre").val(results[0].nombreAgraviado)
					$("#idAgraviado").val(codAgraviado)
					$("#idProveedor").val(results[0].idProveedor)
					$("#idProveedor").prop("disabled", true)
					$("#idProveedor").select2();
					
					// carga cartas de la orden
					
					arrayDatosCartas = results[0].arrayDatosCartas
					for(var i=0; i<arrayDatosCartas.length; i++){
						contadorIdCartas++;
						arrayDatosCartas[i].idDetalle = contadorIdCartas; 
						arrayDatosCartas[i].estadoCarta = estados[arrayDatosCartas[i].estado]
						if(arrayDatosCartas[i].idPrimeraProyeccion==0){
							arrayDatosCartas[i].nroCarta=LPAD(arrayDatosCartas[i].idCarta, numeroLPAD);
						}
					}
					agregaFilasHTML("tabla_datosL", arrayDatosCartas, camposAmostrarC,12);
					cargarTotalCartas()
					
					// carga las facturas de la orden
					
					arrayDatosFac = results[0].arrayDatosFac
					for(var y=0; y<arrayDatosFac.length; y++){
						contadorIdFacturas++;
						arrayDatosFac[y].idDetalle = contadorIdFacturas
						arrayDatosFac[y].nombreEtapa = nombreEtapas[arrayDatosFac[y].idEtapa]
					}
					
					agregaFilasHTML("tabla_datosD", arrayDatosFac, camposAmostrarF,12,1);
					actualizarComboProveedor()
                    cargarTotalFacturas()
					
					
					cargarCartasRestantes(codAgraviado)
					if(estadoOrden == 'B' || estadoOrden=='P' || estadoOrden == 'A'){
						if(estadoOrden=='B'){
							$("#txtEstado").show()
						}
						modoSoloLectura()
					}
					$.fancybox.close()
				})
				break;
        }        
    });
})
function modoSoloLectura(){
	try{
		 $(":input").prop("disabled", true); 
		 $(":input").css("opacity", "0.5")
	}catch(err){
		emitirErrorCatch(err, "modoSoloLectura")
	}
}
// Obtiene la lista de cartas restantes que no estan asociadas a ninguna orden de pago:
function cargarCartasRestantes(codAgraviado){
	try{
		var params = "&codAgraviado="+codAgraviado
        DAO.consultarWebServiceGet("getListaCartasByAgraviado", params, function(arrayCartas){
			
			// obtiene solo cartas con el mismo proveedor del expediente
			var idProveedor = $("#idProveedor").val()
			for(var y=0; y<arrayCartas.length; y++){
				if(arrayCartas[y].idNosocomio == idProveedor){
					listaCartas.push(arrayCartas[y])
				}				
			}
			
            for(var i=0; i<listaCartas.length; i++){
                listaCartas[i].incluida = false
                listaCartas[i].estadoCarta = estados[listaCartas[i].estado]
                if(listaCartas[i].idPrimeraProyeccion==0){
                    listaCartas[i].nroCarta=LPAD(listaCartas[i].idCarta, numeroLPAD);
                }
            }
			// obtiene la lista de tipo documentos:
            DAO.consultarWebServiceGet("getListaTipoDocumento", "",function(lista){
                tiposDocumentos = lista
                $.fancybox.close()
            })
        })		
	}catch(err){
		emitirErrorCatch(err, "loadCartasRestantes")
	}
}
//NroTabla="" => un solo datTable o el primero, "1" => 2da datTable en la pantalla
function agregaFilasHTML(idTablaHTML, datos, campoAlineacionArray, fontSize, NroTabla){
    try{
        if(fontSize==undefined){
            fontSize=11;
        }
        if(NroTabla==undefined ){
            NroTabla = "";
        }

        var onclick="";
        var AlineacionTD="";
        var cantidadAtributos=0;
        //$("#"+idTablaHTML+" > tbody").html(""); // reinicia
        if(datos.length>0){
            cantidadAtributos=campoAlineacionArray.length; // obtiene la cantidad de atributos
            var filaTRAppend="", nCampo="", idFila=0;
            for(var i=0; i<datos.length; i++){
                idFila=datos[i].idDetalle;
                //hay dos funciones globales seleccionarFila y seleccionarFila1 >> para dataTable alterno
                onclick="onclick='seleccionarFila"+NroTabla+"("+'"'+ idFila +'"'+")' id='tr"+NroTabla+"_"+idFila+"'";
                filaTRAppend+="<tr  style='font-family: Arial; height: 30px; cursor: pointer; font-size: "+fontSize+"px;' "+onclick+">";
                for(var y=0; y<cantidadAtributos; y++){ //completa las columnas segun la cantidad de atributos
                    AlineacionTD="justify";
                    var conLPAD = false; // option que determina si el campo se completera con ceros
                    var cantidadCeros = numeroLPAD; // cantidad de ceros
                    if(campoAlineacionArray[y]!=undefined){
                        AlineacionTD=campoAlineacionArray[y].alineacion;
                        if(campoAlineacionArray[y].LPAD==true){
                            conLPAD = true;
                            if(campoAlineacionArray[y].cantLPAD>0){
                                cantidadCeros = campoAlineacionArray[y].cantLPAD;
                            }
                        }
                    }
                    nCampo=campoAlineacionArray[y].campo;
                    filaTRAppend+="<td style='vertical-align: middle; text-align: "+AlineacionTD+"'>"
                        +quitarEspaciosEnBlanco((conLPAD) ? LPAD(datos[i][nCampo], cantidadCeros) : datos[i][nCampo])+"</td>";
                }
                filaTRAppend+="</tr>";
            }
            $("#"+idTablaHTML+" > tbody").append(filaTRAppend);
        }
    }catch(err){
        emitirErrorCatch(err, "crearFilasHTML");
    }
}
function agregarCarta(){
    try{
        var url_comando="tesor-pago-prov-detalle-listcg";
        abrirVentanaFancyBox(900, 420, url_comando, true,
            function(idCartasMarcadas){
                var cartasAgregadas = []
                /*var lastIdDetalle = 0
                if(arrayDatosCartas.length>0){
                    lastIdDetalle = parseInt(arrayDatosCartas[arrayDatosCartas.length-1].idDetalle)
                }*/
                for(var y=0; y<idCartasMarcadas.length; y++){
                    for(var i=0; i<listaCartas.length; i++){
                        if(idCartasMarcadas[y].idCarta == listaCartas[i].idCarta){
                            contadorIdCartas++                            
                            listaCartas[i].idDetalle = contadorIdCartas
                            cartasAgregadas.push(listaCartas[i])
                            arrayDatosCartas.push(listaCartas[i])
							// delete from listaCartas:
							listaCartas.splice(i,1);
                            break;
                        }
                    }
                }

                agregaFilasHTML("tabla_datosL", cartasAgregadas, camposAmostrarC,12);
                cargarTotalCartas()
                //realizoCambio=true;
            });

    }catch(err){
        emitirErrorCatch(err, "agregarCarta()")
    }
}
function cargarTotalCartas(){
    try{
         var totalCartas = 0;
         for(var i=0; i<arrayDatosCartas.length; i++){
             totalCartas = totalCartas + arrayDatosCartas[i].monto
         }
        totalCartas = "S/. "+number_format(totalCartas, 2, '.', ',')
        $("#txtTotalCarta").val(totalCartas)
    }catch(err){
        emitirErrorCatch(err, "cargarTotalCartas")
    }
}
function cargarTotalFacturas(){
    try{
        var totalFacturas = 0;
        for(var i=0; i<arrayDatosFac.length; i++){
            totalFacturas = totalFacturas + arrayDatosFac[i].monto
        }
        totalFacturas = "S/. "+number_format(totalFacturas, 2, '.', ',')
        $("#txtTotalDeposito").val(totalFacturas)
    }catch(err){
        emitirErrorCatch(err, "cargarTotalFacturas")
    }
}
function eliminarCarta(){
    try{
        if(filaSeleccionada!=undefined){
            for(var y=0; y<arrayDatosCartas.length; y++){
                if(arrayDatosCartas[y].idDetalle==filaSeleccionada){
					
					arrayDatosCartas[y].idDetalle=""
					
					listaCartas.push(arrayDatosCartas[y])
					
					arrayDatosCartas.splice(y, 1)
					
					$("#tr_"+filaSeleccionada).remove();
					
					filaSeleccionada = undefined
					
					cargarTotalCartas()					
					
                    break;
                }
            }
        }else{
            fancyAlert("¡Debe seleccionar una Carta!")
        }

    }catch(err){
        emitirErrorCatch(err, "eliminarCarta()")
    }
}

function nuevaFactura(){
    try{
		
		var idProveedor = $("#idProveedor").val()
		
		if(idProveedor!=""){
		
			contadorIdFacturas++
			var url_comando="tesor-pago-prov-detalle-fact?accion=N&idDetalle="+contadorIdFacturas;
			abrirVentanaFancyBox(550, 350, url_comando, true,
				function(rptaDatos){
					
					rptaDatos[0].idProveedor = $("#idProveedor").val()
					rptaDatos[0].idFactura=0
					
                    agregaFilasHTML("tabla_datosD", rptaDatos, camposAmostrarF,12,1);
					arrayDatosFac.push(rptaDatos[0]); //guarda registro completo
					actualizarComboProveedor()
                    cargarTotalFacturas()
				});
			
		}else{
			fancyAlert("¡Debe seleccionar primero un proveedor!")
		}        

    }catch(err){
        emitirErrorCatch(err, "nuevaFactura()")
    }
}
function editarFactura(){
    try{
		if(filaSeleccionada1!=undefined){
			var idDetalle = filaSeleccionada1;
			var url_comando="tesor-pago-prov-detalle-fact?accion=E&idDetalle="+idDetalle;
			abrirVentanaFancyBox(550, 350, url_comando, true,
				function(rptaDatos){
					var idDetalle = rptaDatos[0].idDetalle;
					
					$("#tr1_"+idDetalle).find("td").eq(0).html(rptaDatos[0].nombreEtapa);
					$("#tr1_"+idDetalle).find("td").eq(1).html(rptaDatos[0].tipoDocumento);					
					$("#tr1_"+idDetalle).find("td").eq(2).html(rptaDatos[0].nroDocumento);
					$("#tr1_"+idDetalle).find("td").eq(3).html(rptaDatos[0].fechaEmision);
					$("#tr1_"+idDetalle).find("td").eq(4).html(rptaDatos[0].observaciones);
					$("#tr1_"+idDetalle).find("td").eq(5).html(rptaDatos[0].fechaRecepcion);
					$("#tr1_"+idDetalle).find("td").eq(6).html(rptaDatos[0].monto);

					for(var i=0; i<arrayDatosFac.length; i++){
						if(arrayDatosFac[i].idDetalle == idDetalle){
							arrayDatosFac[i].idTipoDoc = rptaDatos[0].idTipoDoc;
							arrayDatosFac[i].idEtapa = rptaDatos[0].idEtapa
							arrayDatosFac[i].tipoDocumento = rptaDatos[0].tipoDocumento;
							arrayDatosFac[i].fechaEmision = rptaDatos[0].fechaEmision;
							arrayDatosFac[i].observaciones = rptaDatos[0].observaciones;
							arrayDatosFac[i].fechaRecepcion = rptaDatos[0].fechaRecepcion;
							arrayDatosFac[i].monto = rptaDatos[0].monto;
							arrayDatosFac[i].nroDocumento = rptaDatos[0].nroDocumento;
							break;
						}
					}
					cargarTotalFacturas()
					
				}
			);
		}else{
			fancyAlert("¡Debe seleccionar una factura!");
		}

    }catch(err){
        emitirErrorCatch(err, "editarFactura()")
    }
}
function eliminarFactura(){
    try{
		if(filaSeleccionada1!=undefined){
            var idDetalle = filaSeleccionada1
            for(var y=0; y<arrayDatosFac.length; y++){
                if(arrayDatosFac[y].idDetalle==idDetalle){
                    if(accion=='E'){
						if(arrayDatosFac[y].idFactura>0){
							facturasEliminadas.push(arrayDatosFac[y].idFactura)
						}						
					}
					arrayDatosFac.splice(y, 1)
					$("#tr1_"+filaSeleccionada1).remove();
					filaSeleccionada1 = undefined
					cargarTotalFacturas()
					actualizarComboProveedor()
                    break;
                }
            }
        }else{
            fancyAlert("¡Debe seleccionar una factura!")
        }
    }catch(err){
        emitirErrorCatch(err, "eliminarFactura()")
    }
}
function eliminarComas(mystring){
	try{
		return mystring.replace(/,/g , "")
	}catch(err){
        emitirErrorCatch(err, "reemplazarComas()")
    }
}
function guardarOrden(){
    try{
		if(arrayDatosCartas.length == 0){
			fancyAlert("¡Debe ingresar al menos una carta de garantia!")
			return;
		}
		if(arrayDatosFac.length == 0){
			fancyAlert("¡Debe ingresar al menos una factura!")
			return;
		}
		var totalCartas = parseFloat(eliminarComas($("#txtTotalCarta").val().replace("S/.", "").trim()))
		var totalFacturas = parseFloat(eliminarComas($("#txtTotalDeposito").val().replace("S/.", "").trim()))
		if(totalFacturas>totalCartas){
			fancyAlert("¡El total de las facturas no puede superar al total de las cartas de garantia!")
			return;
		}
		fancyConfirm("¿Esta seguro de guardar la orden de pago?", function(rpta){
			if(rpta){
				for(var i=0; i<arrayDatosFac.length; i++){
					arrayDatosFac[i].fechaEmision = dateTimeFormat(arrayDatosFac[i].fechaEmision)
					arrayDatosFac[i].fechaRecepcion = dateTimeFormat(arrayDatosFac[i].fechaRecepcion)
				}
				var jsonObject = {
					codEvento:$("#codEvento").val(),
					codAgraviado:$("#idAgraviado").val(),				
					idProveedor:$("#idProveedor").val(),
					fechaOrden:dateTimeFormat($("#fechaOrden").val()),
					nroOrden:nroOrden,
					accion:accion,
					listaFacturas:arrayDatosFac,
					listaCartas:arrayDatosCartas,
					//cartasEliminadas:cartasEliminadas,
					facturasEliminadas:facturasEliminadas,
					idExpediente:idExpediente
				}				
				if(accion=="N"){
					DAO.consultarWebServicePOST(jsonObject, "guardarOrdenPago", function(data){
                            if(data.length>0){
                                var idOrdenPago = data[0]
                                fancyAlertFunction("¡Registro correcto ("+idOrdenPago+")!", function(rpta){
                                    realizoTarea=true;
									parent.window.frames[0].buscar()
                                    parent.$.fancybox.close();
                                })
                            }else{
                                fancyAlert("Fallo al registrar la Orden de pago!")
                            }
                        })
				}else{ // Editar
					DAO.consultarWebServicePOST(jsonObject, "actualizarOrdenPago", function(data){
                            var filasAfectadas = data[0]
                            if(filasAfectadas>0){
                                fancyAlertFunction("¡Se actualizó la orden de pago correctamente!", function(rpta){
                                    if(rpta){
                                        realizoTarea=true
                                        parent.$.fancybox.close();
                                    }
                                })
                            }else{
                                fancyAlert("¡Operacion Fallida!")
                            }
                        })
				}
				
			}						
		})			
    }catch(err){
        emitirErrorCatch(err, "guardarOrden")
    }
}
function actualizarComboProveedor(){
	try{
		if(arrayDatosFac.length>0){
			$("#idProveedor").prop("disabled", true)
		}else{
			$("#idProveedor").prop("disabled", false)
		}	
		$("#idProveedor").select2()
	}catch(err){
		emitirErrorCatch(err, "actualizarComboProveedor")
	}
}
function aplicarDataTableCartas(){
    try{
        var columns=[
            {"width": "10%"},
            {"width": "25%"},
            {"width": "10%"},
            {"width": "10%"},
            {"width": "10%"},
            {"width": "25%"},
            {"width": "10%"}
        ];
        parseDataTable("tabla_datosL", columns, 132, false, false, false, false,
            function(){
                if($("#tabla_datosL > tbody >tr").length==1 && $("#tabla_datosL > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                    $("#tabla_datosL > tbody").html("");
                }
            });
        $.fancybox.close();

    }catch(err){
        emitirErrorCatch(err, "aplicarDataTableCartas")
    }
}
function aplicarDataTableFacturas(){
    try{
        var columns=[
            {"width": "10%"},
			{"width": "14%"},
            {"width": "14%"},
            {"width": "14%"},
            {"width": "25%"},
            {"width": "14%"},
            {"width": "9%"}
        ];
        parseDataTable1("tabla_datosD", columns, 120, false, false, false, false,
            function(){
                if($("#tabla_datosD > tbody >tr").length==1 && $("#tabla_datosD > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                    $("#tabla_datosD > tbody").html("");
                }
            });
        $.fancybox.close();

    }catch(err){
        emitirErrorCatch(err, "aplicarDataTableCartas")
    }
}
