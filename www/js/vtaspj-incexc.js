var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
var arrayDatos = [];
cargarInicio(function(){
	$("#btnBuscar").click(function(){ // asigna funcion al boton de busqueda de contratos
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los contratos
    });
	$("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto   
	$("#btnActualizaFlota").click(actualizaFlota)
	var parametros="";
    DAO.consultarWebServiceGet("getEmpresasTransp", parametros, function(data){
		var campos =  {"keyId":'idEmpresaTransp', "keyValue":'nombreEmpresa'}
		agregarOpcionesToCombo("cmbEmpresas", data, campos);
		$("#cmbEmpresas").select2();
        buscar();
	});
})
function buscar(){ // busca los contratos que cumplan las condiciones
	try{
        var idEmpresa = $("#cmbEmpresas").val();
		var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
		var parametros = "&idEmpresaTransp="+idEmpresa+"&fechaDesde="+fechaDesde+"&fechaHasta="+fechaHasta;
		DAO.consultarWebServiceGet("getListaContratosImpresos", parametros, listar, true, paginacion);
	}catch(err){
		emitirErrorCatch(err, "buscarContrato");
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
        //estado, idContrato, fechaEmision, nombreCorto, nCuotas, flota, fechaIniVigencia, fechaFinVigencia
		arrayDatos = resultsData; //guarda pagina actual en variable global
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{campo:'idContrato'         , alineacion:'left',LPAD:true },
			{campo:'fechaEmision'       , alineacion:'left'           },
			{campo:'nombreCorto'        , alineacion:'left'           },
            {campo:'nCuotas'            , alineacion:'left'	          },
			{campo:'utlCuota'			, alineacion:'left'			  },
            {campo:'flota'              , alineacion:'left'           },
            {campo:'fechaIniVigencia'   , alineacion:'left'           },
            {campo:'fechaFinVigencia'   , alineacion:'left'           }
        ];
		if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
		var columns=[
 			{ "width": "10%"                    },
            { "width": "15%","type":"date-eu"   },
            { "width": "30%"                    },
			{ "width": "5%"                    },
			{ "width": "5%"                    },
            { "width": "5%"                    },
            { "width": "15%"                    },
            { "width": "15%"                    }
        ];
		var orderByColumn=[1, "desc"];
		dataTable=parseDataTable("tabla_datos", columns, 320, orderByColumn, false, false, false, function(){
            if(resultsData.length>0){
                var numeroPaginas = resultsData[0].numeroPaginas;
                if(typeof numeroPaginas != "undefined"){
                    paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){
                        paginacion.paginaActual=page;
                        buscar();
                    });
                }
            }else{
                paginacion.cargarPaginacion(0, "pagination");
                // Recibe parametros @1: numero de paginas, @2: id DIV de la Paginacion
            }
        });
        $.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "listarContratos")
	}
}
function actualizaFlota(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un Contrato!");
        }else{
			parent.abrirVentanaFancyBox(1056, 530, "vtaspj-incexc-detalle?idContrato="+arrayDatos[filaSeleccionada].idContrato+"&nroCuota="+arrayDatos[filaSeleccionada].utlCuota, true, function(){
				buscar();
			}, true);
		}				
	}catch(err){
		emitirErrorCatch(err, "actualizaFlota")
	}
}