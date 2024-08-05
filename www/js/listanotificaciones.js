/*campos para la busqueda*/
var filtroBusqueda ={
	codEvento : "",
	estado : "P",
	fechaDesde : "",
	fechaHasta :"",
	idNotificacion:"",
	nroCAT:"",
	placa:""
}
var paginacion;
var dataTableNotificaciones;
var datos_array;
var codNotificacion;
var codEventoNotificacionSelecionada;
var origen;
cargarInicio(function(){
	paginacion = new Paginacion(); // instancia el plugin de
    /*$("#idEstadoNotificaciones").bind("change", function(){
        cargarNotificaciones($(this).val());
    });// asigno evento al combobox de estao*/
	paginacion.paginaActual = 1; // Reinicia las variables al estado inicial
	paginacion.cantPaginas = 0; // cuando la cantidad de paginas es 0 se buscara la cantidad de paginas disponibles
	cargarFiltroBusqueda();
	cargarNotificaciones();
    // asinga eventos a botones
    $("#idSeguimientos").click(function(){
        abrirSeguimiento();
    });
    $("#idAsignarTareas").click(function(){
       asignarTareaAnotificacion();
    });
    $("#idCancelarNotificaciones").click(function(){
        editarNotificacion();
    })
	$("#idCancelarNotificaciones").val("Editar Notificacion")
});

/* @cancelarNotificacion: Se encarga de cancelar una notificacion
*/
function editarNotificacion(){
	try{
		if(filaSeleccionada!=undefined){
			parent.abrirVentanaFancyBox( 696, 595,"mantenimiento_notificacion", true, function(){
				cargarNotificaciones();
			}, true )	
		}else{
			fancyAlert("Seleccione una notificación de la lista");
		}			
	}catch(err){
		emitirErrorCatch(err, "editarNotificacion");
	}
}
/*function cancelarNotificacion(){ Este metodo ya no se usa
    try{
        if(filaSeleccionada!=undefined){
            var estado_notificacion=datos_array[filaSeleccionada].estado.trim();
            if(estado_notificacion!='C' && estado_notificacion!='T'){ //si es diferente del estado 'cancelado'
                //codEventoNotificacionSelecionada=datos_array[filaSeleccionada].codEvento;
                codNotificacion=datos_array[filaSeleccionada].idNotificacion;
                fancyConfirm("¿Esta seguro que desea proceder con la cancelación de la notificación "+codNotificacion+"?", function(estado){
                    if(estado){
                        var parametros="&idNotificacion="+codNotificacion;
                        consultarWebServiceGet("cancelarNotificacion", parametros, function(data){
                            if(data[0]>0){ // se cancelo la notificacion
                                //var estado=$("#idEstadoNotificaciones").val()
                                cargarNotificaciones();
                            }else{
                                fancyAlert("No se pudo cancelar la notificación")
                            }
                        })
                    }
                })
            }else{
                switch(estado_notificacion){
                    case 'C':
                        fancyAlert("La notificación ya se encuentra cancelada")
                        break;
                    case 'T':
                        fancyAlert("La notificación se encuentra en estado Terminado")
                        break;
                }                
            }
        }else{
            fancyAlert("Seleccione una notificación de la lista");
        }
    }catch(err){
        emitirErrorCatch(err, "cancelarNotificacion")
    }
}*/

/* @asignarTareaAnotificacion: Asigna tareas a la notificacion previa validacion de la notificacion. La cual debe de estar en estado Pendiente y no tener ninguna tarea en estado pendiente.
    Se encarga de buscar en la BD la ultima tarea de seguimiento de la notificacion.
*/
function asignarTareaAnotificacion(){ // asigna tareas para una notificacion siempre y cuando no se encuentre en estado terminado
    try{
        if(filaSeleccionada!=undefined){
            origen="NA"; // Nueva asignacion de Notificaciones
            var estado_notificacion=datos_array[filaSeleccionada].estado.trim();
            if(estado_notificacion!='T' && estado_notificacion!='C'){
                codEventoNotificacionSelecionada=datos_array[filaSeleccionada].codEvento;
                codNotificacion=datos_array[filaSeleccionada].idNotificacion;
                idNotificaciones=[{"idNotificacion":codNotificacion}];
                var parametros="&idNotificacion="+codNotificacion;
                webService2("getUltimaTareaByNotificacion", parametros, "abrirAsignacionTarea()");
            }else{
                switch(estado_notificacion){
                    case 'T':
                    fancyAlert("La notificacion seleccionada se encuentra en estado Terminado");
                        break;
                    case 'C':
                    fancyAlert("La notificacion seleccionada se encuentra en estado Cancelado");
                        break;
                }                
            }
        }else{
            fancyAlert("Seleccione una notificación de la lista");
        }
    }catch(err){
        emitirErrorCatch(err, "asignarTareaAnotificacion")
    }
}

/* @abrirAsignacionTarea: Valida la ultima tarea que se encontro (Funcion previa: asignarTareaAnotificacion)
    Solo si la cantidad de tareas encontradas es 0 ó se tiene una tarea cuyo resultado ya fue definido y el estado de la Notificacion es diferente de "Terminado", 
    se abrira la ventana para asignar una nueva tarea. 
*/
function abrirAsignacionTarea(){
    try{
        if(rptaWebservice.length==0 || (rptaWebservice[0].resultado!=null && rptaWebservice[0].estado!="T")){
            abrirFancyBox(550, 450, "seguimiento", false);
        }else{
           if(rptaWebservice[0].estado.trim()=='T'){
               fancyAlert("La notificacion seleccionada ha cambiado a estado Terminado");
               cargarNotificaciones()
           }else{
               fancyAlert("La notificacion seleccionada tiene una tarea (cod:"+LPAD(rptaWebservice[0].idTarea, numeroLPAD)+") pendiente por responder");
           }
        }
    }catch(err){
        emitirErrorCatch(err, "abrirAsignacionTarea")
    }
}

/* @cargarNotificaciones: Busca las notificaciones por su ESTADO
    PARAMETROS:
        1) estado: Estado de la notificacion (Pendiente, Reitentando, Cancelado, Terminado)
*/
function cargarNotificaciones(){
	try{
		fancyAlertWait("Cargando");
        //$("#idEstadoNotificaciones").val(estado);        
		var parametros="&estado="+filtroBusqueda.estado+
			"&codEvento="+filtroBusqueda.codEvento+
			"&fechaDesde="+dateTimeFormat(filtroBusqueda.fechaDesde)+
			"&fechaHasta="+dateTimeFormat(filtroBusqueda.fechaHasta)+
			"&idNotificacion="+filtroBusqueda.idNotificacion+
			"&nroCAT="+filtroBusqueda.nroCAT+
			"&placa="+filtroBusqueda.placa;	
		
		parametros=parametros+"&page="+paginacion.paginaActual+ // Agrega los parametros de la paginacion
			"&cantPaginas="+paginacion.cantPaginas+
			"&registrosxpagina="+paginacion.registrosXpagina;
			
		webService2("getAllNotificaciones", parametros, "cargarTablaNotificaciones()");

	}catch(err){
        emitirErrorCatch(err, "cargarNotificaciones"); // emite error
    }
}

/* @cargarTablaNotificaciones: carga las notificaciones encontradas, en una tabla HTML
*/
function cargarTablaNotificaciones(){
	try{
        var estado;
		if(dataTableNotificaciones!=undefined){
            dataTableNotificaciones.destroy();
            $('#tabla_datos > tbody').html("");
        }
        datos_array=rptaWebservice;
        for(var i=0; i<rptaWebservice.length; i++){
            if(rptaWebservice[i].resultado==null || rptaWebservice[i].resultado.trim()==""){
                rptaWebservice[i].resultado="NINGUNO";
            }
            estado = rptaWebservice[i].estado.trim();
            switch(estado){
                case 'P':
                    estado="Pend";
                    break;
                case 'R':
                    estado="Reint";
                    break;
                case 'T':
                    estado="Termin";
                    break;
                case 'C':
                    estado='Cancel'
                    break;
            }
            var nombreAsociado=rptaWebservice[i].nombreAsociado;
            if(rptaWebservice[i].tipoPersona=='J'){ // Juridico
                nombreAsociado=rptaWebservice[i].razonSocial;
            }
            $("#tabla_datos > tbody").append("<tr id='tr_"+i+"' onclick='seleccionarFila("+'"'+i+'"'+")' style='height:30px; font-size:11.5px; font-family:Arial; cursor:pointer;' >"+
                "<td style='vertical-align: middle; '><center>"+LPAD(rptaWebservice[i].idNotificacion, numeroLPAD)+"</center></td>"+
                "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].fechaEmision+"</td>"+
                "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].codEvento+"</td>"+
                "<td style='vertical-align: middle;'>"+reemplazarNullXpuntos(nombreAsociado)+"</td>"+
                "<td style='vertical-align: middle;'><center>"+rptaWebservice[i].motivo+"</center></td>"+
                "<td style='vertical-align: middle; text-align:center;'>"+estado+"</td>"+
                "<td style='vertical-align: middle;'>"+rptaWebservice[i].resultado+"</td>"+
                "</tr>");
        }
        dataTableNotificaciones=$('#tabla_datos').DataTable({
            "searching": false,
            "paging": false,
            "scrollY":"335px",
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
            "order": [[ 1, "desc" ]],
            //"bSort": false,
            "columns": [
                { "width": "10%" },
                { "width": "5%", "type":"date-eu" },
                { "width": "15%" },
                { "width": "20%" },
                { "width": "15%" },
                { "width": "10%" },
                { "width": "25%" }
            ],
            "fnDrawCallback": "",
			"initComplete":function(){
				if(datos_array.length>0){
					var numeroPaginas = datos_array[0].numeroPaginas;
					if(typeof numeroPaginas != "undefined"){
						paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){
							paginacion.paginaActual=page;
							cargarNotificaciones();
						});
					}
				}else{
					paginacion.cargarPaginacion(0, "pagination");
				}
			}
        });
        $('#tabla_datos').on("search.dt", function(){
            borrarFilaSeleccionada();
        });
		borrarFilaSeleccionada();
        $.fancybox.close();
	}catch(err){
        emitirErrorCatch(err, "cargarTablaNotificaciones"); // emite error
    }
}

/* @nuevaNotificacion: Abre la ventana para registrar una Notificacion
*/
function nuevaNotificacion(){
	try{
        origen="N"; // Nueva Notificacion
		parent.abrirFancyBox("850", "600", "nuevanotificacion", true);
	}catch(err){
        emitirErrorCatch(err, "nuevaNotificacion"); // emite error
    }
}
/* @abrirSeguimiento: Abre una ventana donde se muestra todo el historial de una notificacion
*/
function abrirSeguimiento(){
    if(filaSeleccionada!=undefined){
        codNotificacion=datos_array[filaSeleccionada].idNotificacion;
        parent.abrirFancyBox(800, 550, "seguimientoxnotificacion", true);
    }else{
        fancyAlert("Seleccione una notificación de la lista");
    }
}
function abrirBusquedaAvanzadaMantenimiento(){
	try{
		abrirVentanaFancyBox(700, 278, "busquedanotificacion", true, function(data){			
			filtroBusqueda.codEvento =data[0].codEvento;
			filtroBusqueda.nroCAT =data[0].nroCAT;
			filtroBusqueda.placa = data[0].placa;
			filtroBusqueda.idNotificacion = data[0].idNotificacion;
			filtroBusqueda.estado = data[0].estado;
			filtroBusqueda.fechaDesde = data[0].fechaDesde;
			filtroBusqueda.fechaHasta =data[0].fechaHasta;
			paginacion.cantPaginas=0;
			paginacion.paginaActual=1;			
			cargarFiltroBusqueda();
			cargarNotificaciones();
		});		
	}catch(err){
		emitirErrorCatch(err, "abrirBusquedaAvanzadaMantenimiento");
	}
}
function cargarFiltroBusqueda(){
	try{
		var estado = "";
		switch(filtroBusqueda.estado){
			case 'P':
				estado="Pend.";				
				break;
			case 'R':
				estado="Reint.";
				break;
			case 'C':
				estado="Cancel.";
				break;
			case 'T':
				estado="Termin.";
				break;
			case 'PR':
				estado="Pend./Reint.";
				break;			
		}
		labelTextWebPlus("lblcodEvento", filtroBusqueda.codEvento);
		labelTextWebPlus("lblnroCAT", filtroBusqueda.nroCAT);
		labelTextWebPlus("lblplaca", filtroBusqueda.placa);
		labelTextWebPlus("lblidNotificacion", filtroBusqueda.idNotificacion);
		labelTextWebPlus("lblEstado", estado);
		labelTextWebPlus("lblDesde", filtroBusqueda.fechaDesde);
		labelTextWebPlus("lblHasta", filtroBusqueda.fechaHasta);		
		
	}catch(err){
		emitirErrorCatch(err, "cargarFiltroBusqueda")
	}
}