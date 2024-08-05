/*campos para la busqueda*/
var filtroBusqueda ={
	codEvento : "",
	estado : "P",
	fechaDesde : "",
	fechaHasta :"",
	idNotificacion:"",
	idTarea:"",
	nroCAT:"",
	placa:""
}
var paginacion;
cargarInicio(function(){
	paginacion = new Paginacion(); // instancia el plugin de
    paginacion.paginaActual = 1; // Reinicia las variables al estado inicial
	paginacion.cantPaginas = 0; // cuando la cantidad de paginas es 0 se buscara la cantidad de paginas disponibles
	cargarFiltroBusqueda();
	bucarTareas();
    $("#idResultado").click(asignarResultado);
});
var dataTableTareas; // contiene informacion de la tabla HTML creada
var arrayDatos=new Array();
var origen="A"; // Modulo Agenda
function bucarTareas(){
	try{
		fancyAlertWait("Cargando");		
        if(filtroBusqueda.estado!="P"){ // si el estado seleccionado es diferente de pendientes, oculta el boton de Resultado
            $("#idResultado").css("display", "none");
        }else{
            $("#idResultado").css("display", "block");
        }		
		var parametros="&estado="+filtroBusqueda.estado+
			"&codEvento="+filtroBusqueda.codEvento+
			"&fechaDesde="+dateTimeFormat(filtroBusqueda.fechaDesde)+
			"&fechaHasta="+dateTimeFormat(filtroBusqueda.fechaHasta)+
			"&idNotificacion="+filtroBusqueda.idNotificacion+
			"&nroCAT="+filtroBusqueda.nroCAT+
			"&placa="+filtroBusqueda.placa+
			"&idTarea="+filtroBusqueda.idTarea;			
		parametros=parametros+"&page="+paginacion.paginaActual+ // Agrega los parametros de la paginacion
			"&cantPaginas="+paginacion.cantPaginas+
			"&registrosxpagina="+paginacion.registrosXpagina;
			
		webService2("getTareas", parametros, "cargarTareas()");
	}catch(err){
        emitirErrorCatch(err, "bucarTareas"); // emite error
    }
}
function cargarTareas(){
	try{
		if(dataTableTareas!=undefined){
            dataTableTareas.destroy();
            $('#tabla_datos > tbody').html("");
        }
        var eventoOnclick;
        var medio;
        var fechaHoraActual= new Date(); 
        var backgroundColor="";
        arrayDatos=rptaWebservice; // guarda la lista de tareas en el arreglo arrayDatos
        for(var i=0; i<rptaWebservice.length; i++){
        	eventoOnclick=""; 
        	backgroundColor=" ";       	       	
        	if(rptaWebservice[i].estado.trim()=="P"){ // si el estado de la tarea es pendiente se agrega el evento onclick a la fila
        		eventoOnclick=" onclick=seleccionarFila("+'"'+i+'"'+") ";
                    // convirtiendo fecha de programacion en variable DATE
                var fechaYhoraProgramacion=fechaFormateada(rptaWebservice[i].fechaProgramada, true).split(" ");
                var soloFecha=fechaYhoraProgramacion[0].split("/");
                var soloHora=fechaYhoraProgramacion[1].split(":");
                var fechaProgramacionDATE=new Date(soloFecha[2], (parseInt(soloFecha[1])-1), soloFecha[0], soloHora[0], soloHora[1], soloHora[2], 0);
                if(fechaHoraActual>=fechaProgramacionDATE){
                    backgroundColor=" background-color:red; color:white; ";
                }
        	}
        	medio=rptaWebservice[i].medio.trim();
        	switch(medio){
        		case 'C':
        			medio="Carta";
        			break;
        		case 'T':
        			medio="Llamada Telef.";	
        			break;
        		case 'M':
        			medio="SMS";
        			break;
        		case 'E':
        			medio="E-mail";
        			break;
        	}
        	resultado=rptaWebservice[i].resultado;
        	if(resultado==null){
        		resultado="";
        	}        	
        	$("#tabla_datos > tbody").append("<tr id='tr_"+i+"' "+eventoOnclick+" style='"+backgroundColor+" height:30px; font-size:11.5px; font-family:Arial; cursor:pointer;' >"+
                "<td style='vertical-align: middle; "+backgroundColor+" '><center>"+LPAD(rptaWebservice[i].idTarea, numeroLPAD)+"</center></td>"+
                "<td style='vertical-align: middle; "+backgroundColor+"'>"+rptaWebservice[i].descripcionTarea+"</td>"+
                "<td style='vertical-align: middle; "+backgroundColor+" text-align:center;'>"+fechaFormateada(rptaWebservice[i].fechaProgramada, true)+"</td>"+
                "<td style='vertical-align: middle; "+backgroundColor+"'><center>"+medio+"</center></td>"+
                "<td style='vertical-align: middle; "+backgroundColor+" text-align:center;'>"+LPAD(rptaWebservice[i].idNotificacion, numeroLPAD)+"</td>"+
                "<td style='vertical-align: middle; "+backgroundColor+" text-align:center;'>"+rptaWebservice[i].codEvento+"</td>"+
                "<td style='vertical-align: middle; "+backgroundColor+" '>"+resultado+"</td>"+
                "</tr>");
        }
       	dataTableTareas=$('#tabla_datos').DataTable({
	        "searching": false,
	        "paging": false,
	        "scrollY":"320px",
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
	        "order": [[ 2, "desc" ]],
	        //"bSort": false,
	        "columns": [
	            { "width": "6%" },
	            { "width": "25%"},
	            { "width": "8%" , type:"date-eu"},
	            { "width": "12%" },
	            { "width": "8%" },
	            { "width": "8%" },
	            { "width": "33%" }
	        ],
	        "fnDrawCallback": "",
			"initComplete":function(){
				if(arrayDatos.length>0){
					var numeroPaginas = arrayDatos[0].numeroPaginas;
					if(typeof numeroPaginas != "undefined"){
						paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){
							paginacion.paginaActual=page;
							bucarTareas();
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
		emitirErrorCatch(err, "cargarTareas"); // emite error
	}

}
function asignarResultado(){
    try{
        if(filaSeleccionada!=undefined){
			if(arrayDatos[filaSeleccionada].estado=='P'){
				abrirFancyBox(550, 300, "resultado", true);
			}else{
				fancyAlert("Debe seleccionar una tarea en estado pendiente");
			}
            
        }else{
            fancyAlert("Debe seleccionar una tarea para definir su resultado");
        }
    }catch(err){
        emitirErrorCatch(err, "asignarResultado");
    }
}
function abrirBusquedaAvanzadaMantenimiento(){
	try{
		abrirVentanaFancyBox(700, 278, "busquedatareas", true, function(data){			
			filtroBusqueda.codEvento =data[0].codEvento;
			filtroBusqueda.nroCAT =data[0].nroCAT;
			filtroBusqueda.placa = data[0].placa;
			filtroBusqueda.idNotificacion = data[0].idNotificacion;
			filtroBusqueda.idTarea = data[0].idTarea;
			filtroBusqueda.estado = data[0].estado;
			filtroBusqueda.fechaDesde = data[0].fechaDesde;
			filtroBusqueda.fechaHasta =data[0].fechaHasta;
			paginacion.cantPaginas=0;
			paginacion.paginaActual=1;			
			cargarFiltroBusqueda();
			bucarTareas();
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
				estado="Pendientes";				
				break;
			case 'E':
				estado="Ejecutadas";
				break;
			case 'C':
				estado="Canceladas";
				break;		
		}
		labelTextWebPlus("lblcodEvento", filtroBusqueda.codEvento);
		labelTextWebPlus("lblnroCAT", filtroBusqueda.nroCAT);
		labelTextWebPlus("lblplaca", filtroBusqueda.placa);
		labelTextWebPlus("lblidNotificacion", filtroBusqueda.idNotificacion);
		labelTextWebPlus("lblidTarea", filtroBusqueda.idTarea);
		labelTextWebPlus("lblEstado", estado);
		labelTextWebPlus("lblDesde", filtroBusqueda.fechaDesde);
		labelTextWebPlus("lblHasta", filtroBusqueda.fechaHasta);		
		
	}catch(err){
		emitirErrorCatch(err, "cargarFiltroBusqueda")
	}
}