var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){
	idLocal = parent.idLocal;
}
var DAO = new DAOWebServiceGeT("wbs_ventas")
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
var arrayDatos;
var arrayAlmacenes;
cargarInicio(function(){
	$("#btnBuscar").click(function(){ // asigna funcion al boton de busqueda de eventos
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los eventos
    });
	$("#idBtnAnular").click(function(){
		anularGuia(arrayDatos, function(){
			buscar();
		})
	});
	$("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto    
	$("#btnRevisarGuia").click(revisarGuia);
	$("#btnNuevaGuia").click(nuevaGuia);
	$("#idCmbAlmacen").select2();
	
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getAlmacenesXlocal", parametros, function(data){
		arrayAlmacenes = data;
		var campos =  {"keyId":'idAlmacen', "keyValue":'nombreAlmacen'}
		agregarOpcionesToCombo("idCmbAlmacen", data, campos);
		if(data.length==1){
			$("#idCmbAlmacen").val(data[0].idAlmacen);
		}
		$("#idCmbAlmacen").select2();		
		buscar(); // Realiza la busqueda de eventos en funcion a la informacion ingresada en el formulario de busqueda.
	});		
});
function buscar(){ // busca las guias
	try{		
		var idAlmacen = $("#idCmbAlmacen").val();
		var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
		
		var parametros = "&tipo=SAL"+
			"&idAlmacen="+idAlmacen+
			"&fechaDesde="+fechaDesde+
            "&fechaHasta="+fechaHasta;
		
		var conjutoAlmacenes = "";
		if(idAlmacen==""){
			if(idLocal>0){ // No es un usuario master
				conjutoAlmacenes = [];
				for(var i=0; i<arrayAlmacenes.length; i++){
					conjutoAlmacenes.push(arrayAlmacenes[i].idAlmacen);
				}
			}
		}
		parametros = parametros+"&conjutoAlmacenes="+conjutoAlmacenes;
		DAO.consultarWebServiceGet("getListaGuias", parametros, listar, true, paginacion);
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
		arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'nombreAlmacen', alineacion:'center'},
            {campo:'idGuia', alineacion:'center', LPAD:true },
            {campo:'fechaRegistro', alineacion:'center'},
            {campo:'usuarioResponsable', alineacion:'left'}            
        ];
		if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
		var columns=[
            { "width": "30%"  },
            { "width": "10%"  },
            { "width": "15%", "type":"date-eu" },
            { "width": "45%"  }
        ];
		var orderByColumn=[2, "desc"];
		dataTable=parseDataTable("tabla_datos", columns, 330, orderByColumn, false, false, false, function(){
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
			parent.abrirVentanaFancyBox(1050, 560, "ingresos_guia_salida?accion=V&idGuia="+arrayDatos[filaSeleccionada].idGuia, true);
		}		
	}catch(err){
		emitirErrorCatch(err, "revisarGuia");
	}
}
function nuevaGuia(){
	try{
		parent.abrirVentanaFancyBox(1050, 560, "ingresos_guia_salida?accion=N", true, function(){
			buscar();
		}, true);				
	}catch(err){
		emitirErrorCatch(err, "nuevaGuia");
	}
}