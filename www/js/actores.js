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
    // cargar accidentes
	cargarListaDeAccidentes(filtroBusqueda, paginacion.registrosXpagina, paginacion.cantPaginas, 1, paginacion);
	cargarFiltroBusqueda();
});

/* @editarDatosActores: Abre la ventana para la editar los datos de los responsables del accidente.
*/
function editarDatosActores(){
	try{
		if(filaSeleccionada==undefined){
			fancyAlert("Por favor seleccione un evento");
		}else{
			parent.abrirFancyBox(1270, 615, "editaractores", true);
		}
	}catch(err){
		emitirErrorCatch(err, "editarDatosActores"); // emite error
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