/*campos para la busqueda*/
var filtroBusqueda ={
	codEvento : "",
	nroCAT :"",
	placa : "",
	idTipoEvento : "S",
	idEstado : "P",
	fechaDesde : "",
	fechaHasta :"" 
}
var paginacion;
$(document).ready(function(){
	paginacion = new Paginacion();
	/*$("#idEstado").bind("change", function(){
		paginacion.cantPaginas=0;
        cargarListaDeAccidentes($(this).val(), paginacion.registrosXpagina, paginacion.cantPaginas, 1, paginacion);
    });// asigno evento al combobox de estado
    $("#idTipoEvento").bind("change", function(){
		$("#idEstado").val("P"); // cambia a pendiente
    	paginacion.cantPaginas=0;
    	cargarListaDeAccidentes($("#idEstado").val(), paginacion.registrosXpagina, paginacion.cantPaginas, 1, paginacion);
    	if($(this).val()=="N"){
    		$("#idEstado").css("display", "none");
    		$("#idLabelEstado").css("display", "none");
    		$("#btnCambiarRecupero").css("display", "block");
    	}else{
    		$("#idEstado").css("display", "block");
    		$("#idLabelEstado").css("display", "block");
    		$("#btnCambiarRecupero").css("display", "none");
    	}
    });*/
    // cargar accidentes
	cargarListaDeAccidentes(filtroBusqueda, paginacion.registrosXpagina, paginacion.cantPaginas, 1, paginacion);
	cargarFiltroBusqueda();
});
/* @editarDatosAccidente: Abre la ventana de Edicion sin antes primero haber seleccionado un evento
*/
function editarDatosAccidente(){
	try{
		if(filaSeleccionada==undefined){
			fancyAlert("Por favor seleccione un evento");
		}else{
			abrirFancyBox(830, 457, "editardatosevento", true);		
		}

	}catch (err){
		emitirErrorCatch(err, "editarDatosAccidente"); // emite error
	}
}
/* @cambiarArecupero: Cambio de estado de un Evento "NO Recupero" a "Recupero"
*/
function cambiarArecupero(){
	try{
		if(filaSeleccionada==undefined){
			fancyAlert("Por favor seleccione un evento");
		}else{
			if(arrayEventos[filaSeleccionada].esrecupero=='N'){
				fancyConfirm("¿ Estas seguro de cambiar el evento "+arrayEventos[filaSeleccionada].numcentral.trim()+" a RECUPERO ?",function(rpta){
					if(rpta){
						var codEvento = arrayEventos[filaSeleccionada].numcentral.trim();
						consultarWebServiceGet("cambiarArecupero", "&codEvento="+codEvento, function(data){
							if(data[0]>0){
								fancyAlertFunction("¡ El evento "+arrayEventos[filaSeleccionada].numcentral.trim()+" cambio a RECUPERO, correctamente !", function(rpta){
									cargarListaDeAccidentes(filtroBusqueda, paginacion.registrosXpagina, paginacion.cantPaginas, paginacion.paginaActual, paginacion);
								});
							}
						})
					}
				})
			}else{
				fancyAlert("El evento "+arrayEventos[filaSeleccionada].numcentral.trim()+" ya esta catalogado como 'Recupero'");				
			}					
		}
		
	}catch(err){
		emitirErrorCatch(err, "cambiarArecupero");
	}
}
function abrirBusquedaAvanzadaMantenimiento(){
	try{
		abrirVentanaFancyBox(700, 278, "busquedaevento", true, function(data){			
			filtroBusqueda.codEvento =data[0].codEvento;
			filtroBusqueda.nroCAT =data[0].nroCAT;
			filtroBusqueda.placa = data[0].placa;
			filtroBusqueda.idTipoEvento = data[0].idTipoEvento;
			filtroBusqueda.idEstado = data[0].idEstado;
			filtroBusqueda.fechaDesde = data[0].fechaDesde;
			filtroBusqueda.fechaHasta =data[0].fechaHasta;
			paginacion.cantPaginas=0;
			paginacion.paginaActual=1;
			cargarListaDeAccidentes(filtroBusqueda, paginacion.registrosXpagina, paginacion.cantPaginas, paginacion.paginaActual, paginacion)
			cargarFiltroBusqueda();
		});		
	}catch(err){
		emitirErrorCatch(err, "abrirBusquedaAvanzadaMantenimiento");
	}
}
function cargarFiltroBusqueda(){
	try{
		var esRecupero="";
		var estadoGestion="";
		switch(filtroBusqueda.idTipoEvento){
			case 'S':
				esRecupero='Recupero';
				break;
			case 'N':
				esRecupero='No Recupero';
				break;
		}
		switch(filtroBusqueda.idEstado){
			case 'P':
				if(filtroBusqueda.idTipoEvento=='S'){
					estadoGestion="Pendiente";
				}else{
					estadoGestion="No Disponible";
				}				
				break;
			case 'N':
				estadoGestion="Notificado";
				break;
			case 'B':
				estadoGestion="En cobranza";
				break;
			case 'C':
				estadoGestion="Condonados";
				break;
			case 'T':
				estadoGestion="Terminados";
				break;			
		}
		labelTextWebPlus("lblcodEvento", filtroBusqueda.codEvento);
		labelTextWebPlus("lblnroCAT", filtroBusqueda.nroCAT);
		labelTextWebPlus("lblplaca", filtroBusqueda.placa);
		labelTextWebPlus("lbltipoEvento", esRecupero);
		labelTextWebPlus("lblEstado", estadoGestion);
		labelTextWebPlus("lblDesde", filtroBusqueda.fechaDesde);
		labelTextWebPlus("lblHasta", filtroBusqueda.fechaHasta);		
		
	}catch(err){
		emitirErrorCatch(err, "cargarFiltroBusqueda")
	}
}