var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){
	idLocal = parent.idLocal;
}
var DAO = new DAOWebServiceGeT("wbs_ventas")
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
var arrayDatos = [];
var arrayConcesionarios;
cargarInicio(function(){
	$("#btnBuscar").click(function(){ // asigna funcion al boton de busqueda de eventos
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los eventos
    });
	$("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto    
	$("#btnRevisarGuia").click(revisarGuia);
	$("#btnNuevaGuia").click(nuevaGuia);
	
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getAllConcesionarios", parametros, function(data){
		arrayConcesionarios = data;
		var campos =  {"keyId":'idConcesionario', "keyValue":'nombreCompuesto'}
		agregarOpcionesToCombo("idCmbConcesionario", data, campos);
		$("#idCmbConcesionario").select2();
		buscar(); // Realiza la busqueda de eventos en funcion a la informacion ingresada en el formulario de busqueda.
	});
});
function buscar(){ // busca las guias
	try{		
		var idConcesionario = $("#idCmbConcesionario").val();
		var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
		
		var parametros = "&idConcesionario="+idConcesionario+
			"&fechaDesde="+fechaDesde+
            "&fechaHasta="+fechaHasta;
			
		var conjutoConcesionarios = "";
		if(idConcesionario==""){
			if(idLocal>0){ // No es un usuario master
				conjutoConcesionarios = [];
				for(var i=0; i<arrayConcesionarios.length; i++){
					conjutoConcesionarios.push(arrayConcesionarios[i].idConcesionario);
				}
			}
		}
		
		parametros = parametros+"&conjutoConcesionarios="+conjutoConcesionarios;
		DAO.consultarWebServiceGet("getListaLiquidaciones", parametros, listar, true, paginacion);
	}catch(err){
		emitirErrorCatch(err, "buscar");
	}
}
function cleanDate(idInput){ // Limpia los campos Fecha. idInput = id del campo de texto
    try{
        $("#"+idInput).val("");
    }catch(err){
        emitirErrorCatch(err, "cleanDate()")
    }
}
function listar(resultsData){ // crea la grilla con la paginacion
	try{
		for(var i=0; i<resultsData.length; i++){
			if(resultsData[i].totalVenta==null){
				resultsData[i].totalVenta=0;
			}
			if(resultsData[i].totalComision==null){
				resultsData[i].totalComision=0;
			}
			resultsData[i].totalVentaSoles = "S/. "+resultsData[i].totalVenta;
			resultsData[i].totalComisionSoles = "S/. "+resultsData[i].totalComision;
		}
		arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'fechaRegistro', alineacion:'center'},
			{campo:'nombreConcesionario', alineacion:'left'},
			{campo:'nroLiquidacion', alineacion:'center'}, // PRE IMPRESO
			{campo:'nroCertificados', alineacion:'left'},
            {campo:'totalVentaSoles', alineacion:'center'},
			{campo:'totalComisionSoles', alineacion:'center'}
        ];
		if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
		var columns=[
            { "width": "8%" , "type":"date-eu" },
			{ "width": "32%" },
            { "width": "15%" },
            { "width": "20%" },
            { "width": "12%" },
			{ "width": "13%" }
        ];
		var orderByColumn=[0, "desc"];
		dataTable=parseDataTable("tabla_datos", columns, 310, orderByColumn, false, false, false, function(){
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
		emitirErrorCatch(err, "listar")
	}
}
function revisarGuia(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar una Guia");
        }else{
			parent.abrirVentanaFancyBox(1050, 560, "ingresos_liquidacion?accion=V&idLiquidacion="+arrayDatos[filaSeleccionada].idLiquidacion, true);
		}		
	}catch(err){
		emitirErrorCatch(err, "revisarGuia");
	}
}
function nuevaGuia(){
	try{
		parent.abrirVentanaFancyBox(1050, 560, "ingresos_liquidacion?accion=N", true, function(){
			buscar();
		}, true);				
	}catch(err){
		emitirErrorCatch(err, "nuevaGuia");
	}
}