/**
 * Created by JEAN PIERRE on 31/05/2016.
 */
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini"; 
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
var arrayDatos;
var estadoRecup = {
	"P":"Pendiente",
	"N":"Notificado",
	"B":"En Cobranza",
	"T":"Terminado"
}
var estadoCober = {
	"C":"Cubierto",
	"R":"Recuperable",
	"T":"Desestimiento",
	"F":"Fin cobertura"
}
cargarInicio(function(){ // funcion que se carga despues que la pagina ha terminado de cargarse
    $("#btnBuscar").click(function(){ // asigna funcion al boton de busqueda de eventos
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los eventos
    })
    $("#idVerAgraviados").click(verAgraviados);
	$("#btnEliminar").click(eliminar);
    $("#btnRegistro").click(abrirRegistro);
    $("#btnEdicion").click(abrirEdicion);
    $("#btnAsignacion").click(abrirAsignacion);
    $("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto
    $("#btnTerminar").click(terminarEvento);
	buscar(); // Realiza la busqueda de eventos en funcion a la informacion ingresada en el formulario de busqueda.
})
function cleanDate(idInput){ // Limpia los campos Fecha. idInput = id del campo de texto
    try{
        $("#"+idInput).val("");
    }catch(err){
        emitirErrorCatch(err, "cleanDate()")
    }
}
function buscar(){ //** Realiza la busqueda de eventos segun los filtros seleccionados : Cod Evento, Placa, CAT, Rango de Fechas
    try{
        // obtiene valores de filtros del formulario de busqueda
        var codEvento = $("#codEvento").val();
        var placa = $("#placa").val();
        var cat = $("#cat").val();
        var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
		
		var parametros = "&codEvento="+codEvento+
			"&placa="+placa+
			"&cat="+cat+
			"&fechaDesde="+fechaDesde+
			"&fechaHasta="+fechaHasta;
		DAO.consultarWebServiceGet("getEventos", parametros, listar, true, paginacion); // consulta y muestra los resultado. La funcion "listar" es el callback. Activa la paginacion
    }catch(err){
        emitirErrorCatch(err, "buscar");
    }
}
function listar(resultsData){ // Lista los resultados de la busqueda de los eventos en la grilla con su paginacion
    try{
		for(var i=0; i<resultsData.length; i++){
			resultsData[i].direccionBreve = resultsData[i].lugarAccidente.substring(0,35); // recorta la direccion a que solo se muestre 35 caracteres seguido de puntos suspensivos
            resultsData[i].polizaAccidente=quitarEspaciosEnBlanco(resultsData[i].polizaAccidente);
            resultsData[i].fechaEvento = resultsData[i].fechaAccidente.substring(0,10);
            resultsData[i].placa = quitarEspaciosEnBlanco(resultsData[i].placa);
			resultsData[i].estadoRecup = estadoRecup[resultsData[i].estado];
			resultsData[i].estadoCober = estadoCober[resultsData[i].estadoCobertura];
			if(resultsData[i].estadoCober == null){
				resultsData[i].estadoCober = 'Pend. Informe'
			}
			if(resultsData[i].estado=='T'){
				if(resultsData[i].condonado=='C'){
					resultsData[i].estadoRecup = resultsData[i].estadoRecup+"(Cond.)"
				}
			}			
            if(resultsData[i].nroCAT1>0){
				resultsData[i].polizaAccidente=resultsData[i].nroCAT1;
				resultsData[i].placa = quitarEspaciosEnBlanco(resultsData[i].placa1);
				resultsData[i].tipoPersona = resultsData[i].tipoPersona1;
				resultsData[i].nombreAsociado = resultsData[i].nombreAsociado1;
				resultsData[i].razonSocial = resultsData[i].razonSocial1;
			}
			if(resultsData[i].polizaAccidente==0){
                resultsData[i].polizaAccidente="";
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
            if(getLenth(resultsData[i].lugarAccidente)>35){
                resultsData[i].direccionBreve=resultsData[i].direccionBreve+"....";
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

            resultsData[i].causal=resultsData[i].causal1
            if(resultsData[i].causal==null){
                resultsData[i].causal=resultsData[i].causal2
            }
        }
        arrayDatos = resultsData;
		var camposAmostrar = [ // asigna los campos que se mostrarán en la grilla
            {campo:'codEvento', alineacion:'center'}, // index = 0
			{campo:'estadoCober', alineacion:'center'}, // index = 1
			{campo:'estadoRecup', alineacion:'center'}, // index = 2
            {campo:'causal', alineacion:'left'}, // index =3
            {campo:'nombreProcurador', alineacion:'left'}, // index = 4
			{campo:'fechaEvento', alineacion:'center'}, // index = 5
            {campo:'placa', alineacion:'center'}, // index = 6
            {campo:'polizaAccidente', alineacion:'center'}, // index = 7
			{campo:'asociado', alineacion:'left'}, // index = 8
			{campo:'direccionBreve', alineacion:'left'} // index = 9
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
		crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML (Grilla)
		var columns=[ // Ancho de columnas
			{ "width": "8%"  },
			{ "width": "10%" },
			{ "width": "10%" },
            { "width": "10%" },
            { "width": "16%" },
			{ "width": "9%", "type":"date-eu" },
            { "width": "8%"  },
            { "width": "9%"  },
            { "width": "10%" },
            { "width": "10%" }
        ];
		var orderByColumn=[0, "desc"]; // La grilla sera ordenada por la primera columna (index 0 que en este caso es el cod. Evento)
        dataTable=parseDataTable("tabla_datos", columns, 300, orderByColumn, false, false, false, function(){ // aplica el plugin "DATATABLE" a la grilla HTML
			if(resultsData.length>0){ // Despues de haber terminado de aplicarse el plugin  se genera la paginacion, siempre que la cantidad de resultados encontrados sean mayor a 0
				var numeroPaginas = resultsData[0].numeroPaginas; // obtiene el numero de paginas
				if(typeof numeroPaginas != "undefined"){
					/* Carga la paginacion con la funcion paginacion.cargarPaginacion(). 
					   Para lo cual recibe los parametros: 
					   1.- numero de paginas encontradas, 
					   2.- ID del Div donde se generará la paginacion ("pagination")
					   3.- funcion callback: Esta función se ejecuta cuando se hace click en algun número de página ([1][2][3] ... [9][10]), obtiene el número de la página seleccionada y realiza la busqueda.
					*/
					paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){ 
						paginacion.paginaActual=page;
						buscar();
					});
				}
			}else{
				// si la cantidad de resultados es igual a 0. Crea una paginacion con numero de paginas igual a 0, en efecto no creará nada.
				paginacion.cargarPaginacion(0, "pagination");
			}	
		});
        $.fancybox.close();		
    }catch(err){
        emitirErrorCatch(err, "listar");
    }
}
function eliminar(){ // Elimina el evento seleccionado en la grilla (Este evento no debe haber sido asignado a ningun procurador)
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar el evento a eliminar");
        }else{
            if(verificaEventoSinProcurador()){ // verifica que el evento no haya sido asignado a un procurador (idProcurador igual a 0 o null)
                fancyConfirm("¿Estas seguro de eliminar permanentemente el evento "+arrayDatos[filaSeleccionada].codEvento+"? <br> Se eliminarán también los agraviados registrados.", function(rpta){
                    if(rpta){
                        // Elimina el evento seleccionado
                        var codEvento = arrayDatos[filaSeleccionada].codEvento; // encuentra el codigo del evento seleccionado
                        var parametros = "&codEvento="+codEvento;
                        DAO.consultarWebServiceGet("eliminarEvento", parametros, function(data){ // elimina el evento con el web service, el web service retorna la cantidad de filas eliminadas (data)
                            if(data[0]>0){ // si la cantidad de filas eliminadas es mayor de 0
                                buscar(); // efectua la busqueda
                            }else{
                                fancyAlertFunction("¡No se pudo eliminar el evento seleccionado "+arrayDatos[filaSeleccionada].codEvento+"!.<br> Es muy posible se haya asignado a un procurador , o eliminado recientemente ", function(){
                                    buscar();
                                })
                            }
                        });
                    }
                });
            }
        }
    }catch(err){
        emitirErrorCatch(err, "eliminar")
    }
}
function abrirAsignacion(){ // abre la ventana para asignar un procurador al evento seleccionado en la grilla (Este evento no debe haber sido asignado a ningun procurador)
    try{
        if(filaSeleccionada==undefined){ // filaSeleccionada = al evento seleccionado en la grilla.
            fancyAlert("Debe seleccionar el evento para asignar un procurador");
        }else{
            if(verificarEventoSinInforme()){ // verifica que el evento no cuente con ningun informe (idInforme diferente de 0 y diferente de null)
                var codEvento = arrayDatos[filaSeleccionada].codEvento; // obtiene el cod de el evento seleccionado
                var idProcurador = arrayDatos[filaSeleccionada].idProcurador; // obtiene el id del procurador a quien se le asigno el evento
                if(idProcurador==null || idProcurador==0)
                    idProcurador="";
                abrirVentanaFancyBox(410, 430, "asignarprocurador?codEvento="+codEvento+"&idProcurador="+idProcurador, true, function(data){ // abre la ventana flotante para realizar la asignacion
                    if(data[0]>0){
                        arrayDatos[filaSeleccionada].idProcurador = data[1]; // asigna el id del procurador seleccionado
                    }else{ // no se pudo asignar el procurador, se refresca la grilla de eventos
                        buscar();
                    }
                },false, codEvento);
            }
        }
    }catch(err){
        emitirErrorCatch(err, "abrirAsignacion()")
    }
}
function abrirRegistro(){ // abre la ventana flotante para registrar un nuevo evento
    try{
		parent.abrirVentanaFancyBox(950, 750, "nuevo_editar_evento?accion=N", true, function(data){ // accion = N (Nuevo Evento)
			if(data[0]>0){ // Despues de haberse registrado el evento se realiza una busqueda para actualizar la grilla.
                buscar();
            }
		},true);
    }catch(err){
        emitirErrorCatch(err, "abrirRegistro()");
    }
}
function abrirEdicion(){ // abre la ventana para editar el evento seleccionado en la grilla (Este evento no debe haber sido asignado a ningun procurador)
    try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar el evento a editar");
        }else{
			if(verificaEventoSinProcurador()){
				parent.abrirVentanaFancyBox(950, 750, "nuevo_editar_evento?accion=E&codEvento="+arrayDatos[filaSeleccionada].codEvento, true, function(data){ // accion = E (Editar Evento)
                    if(data[0]>0){
                        buscar();
                    }
				},true);
			}
		}		
    }catch(err){
        emitirErrorCatch(err, "abrirEdicion()");
    }
}
function verificaEventoSinProcurador(){ // verifica si el evento ya ha sido asignado a un procurador
    if(arrayDatos[filaSeleccionada].idProcurador>0) {
        fancyAlert("El evento "+arrayDatos[filaSeleccionada].codEvento+" ya tiene un procurador asignado");
        return false;
    }else{
        return true;
    }
}
function verificarEventoSinInforme(){ // verifica si el evento ya cuenta con un informe.
    try{
        if(arrayDatos[filaSeleccionada].idInforme>0) {
            fancyAlert("El evento "+arrayDatos[filaSeleccionada].codEvento+" ya cuenta con un informe registrado");
            return false;
        }else{
            return true;
        }
    }catch(err){
        emitirErrorCatch(err, "verificaEventoSinProcurador()")
    }
}
function verAgraviados(){
	try{
		if(filaSeleccionada==undefined){ // filaSeleccionada = al evento seleccionado en la grilla.
            fancyAlert("Debe seleccionar un evento");
        }else{
			abrirVentanaFancyBox(780, 360, "ver_agraviados?codEvento="+arrayDatos[filaSeleccionada].codEvento, true);
		}				
	}catch(err){
		emitirErrorCatch(err, "verAgraviados");
	}
}
function terminarEvento(){ // finaliza el ciclo de un evento
	try{
		if(filaSeleccionada==undefined){ // filaSeleccionada = al evento seleccionado en la grilla.
            fancyAlert("Debe seleccionar un evento");
        }else{
			if(arrayDatos[filaSeleccionada].idInforme>0){
				if(arrayDatos[filaSeleccionada].estadoCobertura=='T'){
					fancyAlert("¡El asociado desistió de usar su certificado!")
					return;
				}
				if(arrayDatos[filaSeleccionada].estadoCobertura=='F'){
					fancyAlert("¡El evento ya ha sido terminado!");
					return;
				}
				abrirVentanaFancyBox(400, 300, "motivo_terminado?codEvento="+arrayDatos[filaSeleccionada].codEvento+"&idUsuarioUpdate="+parent.idUsuario, true, function(data){ // accion = E (Editar Evento)
                    if(data[0]>0){
                        buscar();
                    }
				});
			}else{
				fancyAlert("¡Solo se puede terminar eventos con informes!")
			}
		}
	}catch(err){
		emitirErrorCatch(err,"terminarEvento");
	}
}