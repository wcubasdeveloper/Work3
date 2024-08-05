/**
 * Created by JEAN PIERRE on 1/01/2018.
 */
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var DAOV = new DAOWebServiceGeT("wbs_ventas")
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
    $("#btnRevisar").click(revisarOrden)
    $("#btnNuevo").click(nuevaOrden)
    // cargar lista de proveedores:
    DAOV.consultarWebServiceGet("getProveedores", "", function(arrayProveedores){
        var campos =  {"keyId":'idProveedor', "keyValue":'nombreProveedor'}
        agregarOpcionesToCombo("idCmbProveedor", arrayProveedores, campos);
        $("#idCmbProveedor").select2();
        $.fancybox.close()
        buscar()
    })
})

function buscar(){ // busca los contratos que cumplan las condiciones
    try{
        var idProveedor = $("#idCmbProveedor").val();
        var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
		var codAgraviado = $("#txtCodAgraviado").val().trim()
		var nombreAgraviado = $("#txtNombreAgraviado").val().trim()
		var nroExpediente = $("#txtExpediente").val().trim()
		
        var parametros = "&idProveedor="+idProveedor+"&fechaDesde="+fechaDesde+"&fechaHasta="+fechaHasta
		+"&codAgraviado="+codAgraviado
		+"&nombreAgraviado="+nombreAgraviado
		+"&nroExpediente="+nroExpediente;

        DAO.consultarWebServiceGet("getListaOrdenesPagoProveedores", parametros, listar, true, paginacion);

    }catch(err){
        emitirErrorCatch(err, "buscar");
    }
}
var estados = {
    "A":"Anulado",
    "I":"Ingresado",
    "B":"Aprobado",
    "E":"Especial",
    "P":"Pagado"
}
function listar(resultsData){ // crea la grilla con la paginacion
    try{

        for(var i=0; i<resultsData.length;i++){
            resultsData[i].estadoDescripcion = estados[resultsData[i].estado]
        }

        arrayDatos = resultsData; //guarda pagina actual en variable global
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'estadoDescripcion'             , alineacion:'center'           },
            {campo:'nroOrdenPago'         , alineacion:'center'},
            {campo:'fechaRegistro'       , alineacion:'center'      },
            {campo:'nombreProveedor'        , alineacion:'left'           },
            {campo:'idExpediente'            , alineacion:'center', LPAD:true           },
			{campo:'codAgraviado'            , alineacion:'center'           },
			{campo:'nombreAgraviado'            , alineacion:'left'           },
            {campo:'numerosDocumentos'              , alineacion:'center'           },
            {campo:'montoTotalDocumentos'   , alineacion:'center'           }
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns=[
            { "width": "7%"                     },
            { "width": "13%"                    },
            { "width": "10%","type":"date-eu"   },
            { "width": "18%"                    },            
			{ "width": "6%"                    },
			{ "width": "8%"                    },			
			{ "width": "18%"                    },
            { "width": "12%"                    },
            { "width": "8%"                    }
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
        emitirErrorCatch(err, "listar")
    }
}
function nuevaOrden(){
    try{
        parent.abrirVentanaFancyBox(1100, 525, "tesor-pago-agraviados", true);
    }catch(err){
        emitirErrorCatch(err, "nuevaOrden()")
    }
}
function revisarOrden(){
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar una Orden!");
        }else{
            parent.abrirVentanaFancyBox(1150, 570,
                    "tesor-pago-prov-detalle?accion=E&nroOrden="+arrayDatos[filaSeleccionada].nroOrdenPago, true,
                function(){
                    buscar();
                },
                true);
        }
    }catch(err){
        emitirErrorCatch(err, "revisarOrden()")
    }
}