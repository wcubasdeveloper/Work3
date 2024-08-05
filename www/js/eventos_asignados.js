/**
 * Created by JEAN PIERRE on 22/06/2016.
 */
var idPerfil = parent.perfilUsuario1;
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini"; 
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion
var dataTable = undefined;
var idProcurador=parent.idProcuradorUsuario;
var dataTable = undefined;
var arrayDatos;
cargarInicio(function(){
	if(idPerfil==1 || idPerfil==2){ // si es administrador
		$("#idBtnRevertir").click(revertirInforme);
	}else{
		$("#idBtnRevertir").css("display", "none"); //oculta el boton de reversion
	}
    $("#btnBuscar").click(function(){
        paginacion.reiniciarPaginacion();
        buscar();
    })
    $("#btnCerrarInforme").click(cerrarInforme);
    $("#btnRegistro").click(abrirRegistroInforme);
    $("#btnEdicion").click(abrirEdicionInforme);
    $("#btnCartaGarantia").click(abrirCartaGarantia);
    $("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").val(convertirAfechaString(new Date(), false));
	$("#idBtnPDF").click(informePDF)
	
	DAO.consultarWebServiceGet("getListaProcuradores", "", function(data){
        agregarOpcionesToCombo("idCmbProcurador", data, {"keyValue":"nombreProcurador", "keyId": "idProcurador"});
		if(idProcurador>0){
			$("#idCmbProcurador").val(idProcurador);
		}
		if(idPerfil!=1 && idPerfil!=2){ // No es administrador
			$("#idCmbProcurador").prop("disabled", true); // bloquea la lista de procuradores
		}
		$("#idCmbProcurador").select2();
		buscar();
	});	
});
function cleanDate(idInput){ // Limpia el string de los campos fechas
    try{
        $("#"+idInput).val("");
    }catch(err){
        emitirErrorCatch(err, "cleanDate()")
    }
};
function buscar(){ //** Realiza la busqueda de eventos asignados al procurador identificado
    try{
        // obtiene valores de filtros
        if(idProcurador>0 || (idPerfil==1 || idPerfil==2)){
            var codEvento = $("#codEvento").val();
            var placa = $("#placa").val();
            var cat = $("#cat").val();
            var fechaDesde = dateTimeFormat($("#fechaDesde").val());
            var fechaHasta = dateTimeFormat($("#fechaHasta").val());

            var parametros = "&codEvento="+codEvento+
                "&placa="+placa+
                "&cat="+cat+
                "&fechaDesde="+fechaDesde+
                "&fechaHasta="+fechaHasta+
                "&idProcurador="+$("#idCmbProcurador").val()+
				"&idPerfil="+idPerfil;
            DAO.consultarWebServiceGet("getEventosAsignados", parametros, listar, true, paginacion); // consulta y muestra los resultado. La funcion "listar" es el callback. Activa la paginacion
        }else{
            listar([]);
        }
    }catch(err){
        emitirErrorCatch(err, "buscar");
    }
};
function listar(resultsData){ // Lista los resultados de la busqueda de los eventos en la grilla con su paginacion
    try{
		for(var i=0; i<resultsData.length; i++){
            resultsData[i].polizaAccidente=quitarEspaciosEnBlanco(resultsData[i].polizaAccidente);
			if(resultsData[i].fechaAccidente=='00/00/0000 00:00'){
				resultsData[i].fechaAccidente=resultsData[i].fechaAccidenteInforme;
			}
            resultsData[i].fechaEvento = quitarEspaciosEnBlanco(resultsData[i].fechaAccidente).substring(0,10);
            if(resultsData[i].idInforme>0){
                resultsData[i].polizaAccidente = resultsData[i].nroCAT;
                resultsData[i].lugarAccidente = resultsData[i].direccionAccidente;
                resultsData[i].placa = quitarEspaciosEnBlanco(resultsData[i].placa2);
                resultsData[i].nombreAsociado = resultsData[i].nombreAsociado2;
                resultsData[i].razonSocial=resultsData[i].razonSocial2;
                resultsData[i].tipoPersona=resultsData[i].tipoPersona2;
            }else{
                if(resultsData[i].polizaAccidente==0){
                    resultsData[i].polizaAccidente="";
                }
                resultsData[i].placa = quitarEspaciosEnBlanco(resultsData[i].placa);
            }
            resultsData[i].polizaAccidente=quitarEspaciosEnBlanco(resultsData[i].polizaAccidente);
            resultsData[i].direccionBreve = quitarEspaciosEnBlanco(resultsData[i].lugarAccidente).substring(0,35); // recorta la direccion a que solo se muestre 35 caracteres seguido de puntos suspensivos
            if(getLenth(quitarEspaciosEnBlanco(resultsData[i].lugarAccidente))>35){
                resultsData[i].direccionBreve=resultsData[i].direccionBreve+"....";
            }
            if(resultsData[i].idTipoAccidente==0){
                resultsData[i].idTipoAccidente="";
            }
            if(resultsData[i].idNosocomio==0){
                resultsData[i].idNosocomio="";
            }
            if(resultsData[i].idComisaria==0){
                resultsData[i].idComisaria="";
            }
            resultsData[i].asociado="";
            switch(resultsData[i].tipoPersona){
                case 'N':
                    resultsData[i].asociado=resultsData[i].nombreAsociado;
                    break;
                case 'J':
                    resultsData[i].asociado=resultsData[i].razonSocial;
                    break;
            }
            // Estado del evento:
            if(resultsData[i].idInforme>0){
                if(resultsData[i].informeCerrado=='S'){
                    resultsData[i].estadoInforme = "Cerrado";
                }else{
                    resultsData[i].estadoInforme = "Completo";
                }
            }else{
                resultsData[i].estadoInforme = "Pend.";
            }
		}
        arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'codEvento', alineacion:'center'},
            {campo:'estadoInforme', alineacion:'center'},
            {campo:'fechaEvento', alineacion:'center'},
            {campo:'placa', alineacion:'center'},
            {campo:'polizaAccidente', alineacion:'center'},
            {campo:'asociado', alineacion:'left'},
            {campo:'direccionBreve', alineacion:'left'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns=[
            { "width": "8%"  },
            { "width": "7%"  },
            { "width": "9%", "type":"date-eu" },
            { "width": "8%"  },
            { "width": "8%"  },
            { "width": "30%" },
            { "width": "30%" }
        ];
        var orderby = 0;
        if(resultsData.length>0){
            orderby=resultsData[0].orderBy
        }
        var orderByColumn=[0, "desc"]; // ordena por codigo de evento
        dataTable=parseDataTable("tabla_datos", columns, 300, orderByColumn, false, false, false, function(){
            if(resultsData.length>0){
                var numeroPaginas = resultsData[0].numeroPaginas;
                if(typeof numeroPaginas != "undefined"){
                    paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){
                        paginacion.paginaActual=page;
                        buscar();
                    });
                }
            }else{
                paginacion.cargarPaginacion(0, "pagination"); // con el metodo cargarPaginacion se implementa la implementacion. Recibe parametros @1: numero de paginas, @2: id DIV de la Paginacion
            }
        });
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "listar");
    }
}
function cerrarInforme(){ // cierra un informe
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un evento");
        }else{
            if(verificarInformeSinCerrar()){
				var codEvento = arrayDatos[filaSeleccionada].codEvento;
				var params = "&codEvento="+codEvento;
				DAO.consultarWebServiceGet("verificarCartasAgraviados", params, function(results){ // verifica que todos los agraviados cuenten con una carta de garantia
					var todos_tienen_carta = true;
					var cantidadCartas = 0;
					var index = -1;
					for(var i=0; i<results.length; i++){
						cantidadCartas = cantidadCartas + results[i].cantidadCartas;
						if(results[i].cantidadCartas == 0){
							if(todos_tienen_carta){
								index=i;
								todos_tienen_carta=false;
							}							
						}
					}
					if(cantidadCartas==0){
						fancyConfirm("¿Desea cerrar el informe, marcando el evento con el estado de 'DESISTIMIENTO'?", function(rpta){
							if(rpta){
								var evento = arrayDatos[filaSeleccionada];
								var idInforme = evento.idInforme;
								var parametros = "&idInforme="+idInforme+"&desistir=T"; // desistir = True
								DAO.consultarWebServiceGet("cerrarInforme", parametros, function(data){
									if(data[0]>=0){
										buscar();
									}else{
										fancyAlert("No se pudo cerrar el informe");
									}
								});
							}							
						});					
					}else{
						if(todos_tienen_carta){
							fancyConfirm("¿Desea cerrar el informe del evento "+codEvento+"?", function(rpta){
								if(rpta){// cierra el informe del evento seleccionado
									var evento = arrayDatos[filaSeleccionada];
									var idInforme = evento.idInforme;
									var parametros = "&idInforme="+idInforme+"&desistir=F"; // desistir = false
									DAO.consultarWebServiceGet("cerrarInforme", parametros, function(data){
										if(data[0]>=0){
											buscar();
										}else{
											fancyAlert("No se pudo cerrar el informe");
										}
									});
								}
							})
						}else{
							fancyAlert("El agraviado: "+results[index].nombreAgraviado+" aún no cuenta con ninguna carta de garantía");
						}
					}					
				})                
            }
        }
    }catch(err){
        emitirErrorCatch(err, "cerrarInforme")
    }
}

function abrirCartaGarantia(){ // asigna una carta de garantia para los agraviados del evento seleccionado.
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un evento");
        }else{
            if(verificarInformeSinCerrar()){
                // abre la ventana para listar los agraviados
                var codEvento = arrayDatos[filaSeleccionada].codEvento;
                var idInforme = arrayDatos[filaSeleccionada].idInforme;
                parent.abrirVentanaFancyBox(700, 360, "agraviados_carta_garantia?codEvento="+codEvento+"&idInforme="+idInforme, true);
            }
        }
    }catch(err){
        emitirErrorCatch(err, "abrirCartaGarantia()")
    }
}
function abrirRegistroInforme(){ // abre la ventana para registrar de un informe para el evento seleccionado
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un evento");
        }else{
            if(verificarEventoSinInforme()){
                var codEvento = arrayDatos[filaSeleccionada].codEvento;
                parent.abrirVentanaFancyBox(900, 415, "nuevo_editar_informe?accion=N&codEvento="+codEvento, true, function(data){
                    if(data[0]>0){
                        buscar();
                    }
                },true);
            }
        }
    }catch(err){
        emitirErrorCatch(err, "abrirRegistroInforme()");
    }
}
function abrirEdicionInforme(){ // abre la ventana para editar el informe del evento seleccionado
    try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un evento");
        }else{
			if(verificarInformeSinCerrar()){
                var codEvento = arrayDatos[filaSeleccionada].codEvento;
                var idInforme = arrayDatos[filaSeleccionada].idInforme;
                parent.abrirVentanaFancyBox(900, 415, "nuevo_editar_informe?accion=E&codEvento="+codEvento+"&idInforme="+idInforme, true, function(data){
                    if(data[0]>0){
                        buscar();
                    }
                },true);
            }
		}		
    }catch(err){
        emitirErrorCatch(err, "abrirEdicionInforme()");
    }
}
function verificarEventoSinInforme(){
    try{
        var evento = arrayDatos[filaSeleccionada];
        if(evento.idInforme==null)
            return true;
        else
            fancyAlert("El evento "+evento.codEvento+" ya cuenta con un informe registrado");
    }catch(err){
        emitirErrorCatch(err, "verificarEventoSinInforme()");
    }
}
function verificarInformeSinCerrar(){ // valida si el evento tiene un informe sin cerrar
    try{
        var evento = arrayDatos[filaSeleccionada];
        if(evento.informeCerrado!="S" && evento.idInforme>0)
            return true;
        else if(evento.informeCerrado=='S')
            fancyAlert("El informe del evento "+evento.codEvento+", ya se cerró")
        else
            fancyAlert("El evento no cuenta con ningun informe");
        return false;
    }catch (err){
        emitirErrorCatch(err, "verificarInformeSinCerrar")
    }
}
function verificarInformeCerrado(){ // valida si el evento tiene un informe sin cerrar
    try{
        var evento = arrayDatos[filaSeleccionada];
        if(evento.informeCerrado=="S" && evento.idInforme>0)
            return true;
        else if(evento.informeCerrado=='N')
            fancyAlert("El informe del evento "+evento.codEvento+", aun no ha sido cerrado")
        else
            fancyAlert("El evento no cuenta con ningun informe");
        return false;
    }catch (err){
        emitirErrorCatch(err, "verificarInformeSinCerrar")
    }
}
function revertirInforme(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un evento");
        }else{
			if(verificarInformeCerrado()){
				var codEvento = arrayDatos[filaSeleccionada].codEvento;
				var parametros = "&codEvento="+codEvento;
				DAO.consultarWebServiceGet("revertirInforme", parametros, function(filasAfectadas){
					if(filasAfectadas[0]>0){
						buscar();
					}else{
						fancyAlert("No se puede revertir el informe, porque ya existen Cartas de Garantias y/o Proyecciones registradas");
					}
				})
			}
		}		
	}catch(err){
		emitirErrorCatch(err, "revertirInforme");
	}
}
function informePDF(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un evento");
        }else{
			var evento = arrayDatos[filaSeleccionada];
			if(evento.idInforme>0){
				window.open("wbs_as-sini?funcion=informeProcuradorPDF&idInforme="+evento.idInforme+"&codEvento="+evento.codEvento, '_blank');
			}else{
				fancyAlert("¡El evento no tiene ningun informe registrado!")
			}			
		}						
	}catch(err){
		emitirErrorCatch(err, "PDF");
	}
}