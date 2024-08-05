/**
 * Created by JEAN PIERRE on 11/10/2017.
 */
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
    $("#btnNuevaCuota").click(nuevaCuota)
    $("#btnRevisarCuotas").click(cuotasPagadas)
    $("#btnEditarCuota").click(editarCuota)
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
        DAO.consultarWebServiceGet("getListaContratosRenovacion", parametros, listar, true, paginacion);
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
var estado = {
    "R":"REG",
    "I":"IMPR",
    "A":"ANUL"
}
function listar(resultsData){ // crea la grilla con la paginacion
    try{
        //estado, idContrato, fechaEmision, nombreCorto, nCuotas, flota, fechaIniVigencia, fechaFinVigencia
        arrayDatos = resultsData; //guarda pagina actual en variable global
        for(var i=0; i<arrayDatos.length; i++){
            arrayDatos[i].estadoValue = estado[arrayDatos[i].estado]
            // calcula fecha fin de renovacion:

            var mdatec = arrayDatos[i].fechaRenovacion.split("/");
            var dcFin = new Date(mdatec[2], parseInt(mdatec[1])-1, mdatec[0]);
            dcFin.setMonth(dcFin.getMonth() + (12/arrayDatos[i].nroCuotas));

            arrayDatos[i].fechaFinRenovacion = convertirAfechaString(dcFin, false, false);
        }
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'estadoValue', alineacion:'left'},
            {campo:'idContrato'         , alineacion:'left',LPAD:true },
            {campo:'ultCuota'       , alineacion:'left'           },
            {campo:'fechaPagoCuota'        , alineacion:'center'           },
            {campo:'nombreCorto'            , alineacion:'left'	          },
            {campo:'flota'              , alineacion:'center'           },
            {campo:'fechaRenovacion'   , alineacion:'center'           },
            {campo:'fechaFinRenovacion'   , alineacion:'center'           }
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns=[
            { "width": "10%"                    },
            { "width": "10%"                    },
            { "width": "10%"                    },
            { "width": "10%","type":"date-eu"   },
            { "width": "30%"                    },
            { "width": "10%"                    },
            { "width": "10%"                    },
            { "width": "10%"                    }
        ];
        var orderByColumn=[3, "desc"];
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
function nuevaCuota(){
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un contrato!");
        }else{
            if(arrayDatos[filaSeleccionada].estado=='I'){
                parent.abrirVentanaFancyBox(1056, 530, "vtaspj-renovacion-detalle?idContrato="+arrayDatos[filaSeleccionada].idContrato+
                    "&accion=R"+
                    "&idContratoRenovacion="+arrayDatos[filaSeleccionada].idContratoRenovacion+"&nroCuota="+arrayDatos[filaSeleccionada].ultCuota, true, function(){
                    buscar();
                }, true);
            }else{
                fancyAlert("¡La cuota seleccionada no se encuentra Impresa!")
            }
        }
    }catch(err){
        emitirErrorCatch(err, "nuevaCuota()")
    }
}
function editarCuota(){
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un contrato!");
        }else{
            if(arrayDatos[filaSeleccionada].estado!='I'){
                parent.abrirVentanaFancyBox(1056, 530, "vtaspj-renovacion-detalle?idContrato="+arrayDatos[filaSeleccionada].idContrato+
                    "&accion=E"+
                    "&idContratoRenovacion="+arrayDatos[filaSeleccionada].idContratoRenovacion+"&nroCuota="+arrayDatos[filaSeleccionada].ultCuota, true, function(){
                    buscar();
                }, true);
            }else{
                fancyAlert("¡Solo se pueden editar cuotas que no esten impresas!")
            }
        }
    }catch(err){
        emitirErrorCatch(err, "editarCuota()")
    }
}
function cuotasPagadas(){
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un contrato!");
        }else{
            parent.abrirVentanaFancyBox(1200, 560, "vtaspj-renovacion-cuotas?idContrato="+arrayDatos[filaSeleccionada].idContrato, true, function(){
                //buscar();
            }, true);
        }
    }catch(err){
        emitirErrorCatch(err, "cuotasPagadas()")
    }
}
