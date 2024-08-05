var dataTable = undefined;
var arrayDatos = []
var idContrato=0;
var nroCuota = 0;
var idConcesionarioVtasCorp;
var DAOV = new DAOWebServiceGeT("wbs_ventas")
cargarInicio(function() {
    idContrato = $_GET("idContrato")
    nroCuota = $_GET("nroCuota")
    $("#btnIncluirVehiculo").click(incluirVehiculo)
    $("#btnExcluirVehiculo").click(excluirVehiculo)
    $("#btnEliminarVehiculo").click(eliminarVehiculoAgregados)
    $("#btnGuardar").click(guardar)
    // carga la informacion del contrato con su ultima cuota:
    var parametros = "&idContrato="+idContrato+
        "&nroCuota="+nroCuota;
    DAOV.consultarWebServiceGet("getContratoDetalle", parametros, function(datos){
        var contrato = datos[0]
        $("#txtFechaEmision").val(contrato.fechaEmision)
        $("#txtVigContr_Inicio").val(contrato.fechaVigenciaContr)
        $("#txtVigContr_Fin").val(contrato.fechaVigenciaContrFin)
        var nombreEmpresa = contrato.razonSocial
        if(contrato.tipoPersona=='N'){
            nombreEmpresa = contrato.nombreNaturalEmpresa
        }
        $("#txtRazonSocial").val(nombreEmpresa)
        $("#txtNResolucion").val(contrato.nroResolucion)
        $("#txtNCuotas").val(nroCuota+"/"+contrato.nCuotas)
        labelTextWYSG("wb_Text1", LPAD(contrato.idContrato, numeroLPAD))
        arrayDatos = contrato.listaFlota;
        for(var i=0; i<arrayDatos.length; i++){
            arrayDatos[i].idDetalle=i;
            arrayDatos[i].estadoOriginal = arrayDatos[i].estado
        }
        // carga la grilla de vehiculos:
        listar()
        $.fancybox.close();
    });
})
function listar() { // crea la grilla con la paginacion usando "arrayDatos"
    try{
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'nroOrden'  , alineacion:'center'           },
            {campo:'estado'         , alineacion:'center'           },
            {campo:'placa'         , alineacion:'left'           },
            {campo:'marca'        , alineacion:'left'           },
            {campo:'modelo'          , alineacion:'left'           },
            {campo:'anno'         , alineacion:'center'           },
            {campo:'nombreUso'      , alineacion:'left'           },
            {campo:'clase'   , alineacion:'left'           },
            {campo:'prima'        , alineacion:'right'           },
            {campo:'nCertificado'        , alineacion:'center'           }
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", arrayDatos, camposAmostrar, true, 12); // crea la tabla HTML

        var columns=[
            { "width": "5%"   },
            { "width": "5%"   },
            { "width": "10%"   },
            { "width": "12%"   },
            { "width": "12%"    },
            { "width": "11%"   },
            { "width": "12%"   },
            { "width": "12%"    },
            { "width": "9%"   },
            { "width": "12%"   }
        ];
        var orderByColumn=[0, "asc"];
        dataTable=parseDataTable("tabla_datos", columns, 306, false, false, false, false, function(){
            if(arrayDatos.length>0){
                var numeroPaginas = arrayDatos[0].numeroPaginas;
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

        dataTable.columns.adjust().draw();
        $("#tabla_datos > tbody >tr").each(function(){
            var estado = $(this).find("td").eq(1).html();
            var color=""
            if(estado=="E"){ // pintamos de rojo la fila de la tabla
                color="red"
            }
            if(color!=""){
                $(this).css("background-color", color);
                $(this).find("td").each(function(){
                    $(this).css("background-color", color);
                })
            }
        })

    }catch(err){
        emitirErrorCatch(err, "listar()")
    }
}
function incluirVehiculo(){
    try{
        abrirVentanaFancyBox(550, 350, "vtaspj-inc-vehiculo", true, function(rptaDatos){
            actualizarVehiculos(rptaDatos);
        })
    }catch(err){
        emitirErrorCatch(err, "incluirVehiculo()")
    }
}
function excluirVehiculo(){
    try{
        if(filaSeleccionada!=undefined){
            var idDetalle = filaSeleccionada;
            if(arrayDatos[idDetalle].estado=='E'){
                fancyConfirm("¿Desea reponer este vehiculo?", function(rpta){
                    if(rpta){
                        if(arrayDatos[idDetalle].estadoOriginal!=undefined){
                            if(arrayDatos[idDetalle].estadoOriginal=="E"){
                                arrayDatos[idDetalle].estado ='I'
                            }else{
                                arrayDatos[idDetalle].estado = arrayDatos[idDetalle].estadoOriginal
                            }
                        }else{
                            arrayDatos[idDetalle].estado ='I'
                        }
                        listar()
                    }
                })
            }else{
                if(arrayDatos[idDetalle].estadoOriginal!=undefined){ // es antiguo u original
                    abrirVentanaFancyBox(550, 350, "vtaspj-exc-vehiculo?idDetalle="+idDetalle, true, function(rptaDatos){
                        actualizarVehiculos(rptaDatos);
                    })
                }else{
                    // es un registro nuevo
                    fancyConfirm("¿Este registro se eliminará?", function(rpta){
                        if(rpta){
                            eliminarVehiculoAgregados();
                        }
                    })
                }
            }
        }else{
            fancyAlert("¡ Debe seleccionar un Vehiculo !");
        }
    }catch(err){
        emitirErrorCatch(err, "excluirVehiculo()")
    }
}
function actualizarVehiculos(vehiculo){
    try{
        var idDetalle = vehiculo.idDetalle;
        if(idDetalle<arrayDatos.length){ // exclusion
            arrayDatos[idDetalle] = vehiculo
        }else{ // inclusion
            arrayDatos.push(vehiculo)
        }
        listar();
    }catch(err){
        emitirErrorCatch(err, "actualizarVehiculos()")
    }
}
function eliminarVehiculoAgregados(){
    try{
        if(filaSeleccionada!=undefined){
            if(arrayDatos[filaSeleccionada].estadoOriginal==undefined){
                arrayDatos.splice(parseInt(filaSeleccionada), 1);
                // reestructura los numero de orden de los certificados
                for(var i=0; i<arrayDatos.length; i++){
                    arrayDatos[i].idDetalle=i;
                    arrayDatos[i].nroOrden=(i+1);
                }
                listar();
            }else{
                fancyAlert("¡Solo se pueden eliminar los vehiculos recien ingresados!")
            }
        }else{
            fancyAlert("¡Debe seleccionar un vehiculo!")
        }
    }catch(err){
        emitirErrorCatch(err, "eliminarVehiculoAgregados()")
    }
}
function guardar(){
    try{
        fancyConfirm("¿Confirmar actualizar la flota?", function(rpta){
            if(rpta){
                /*var certificadoList = []
                for(var i=0; i<arrayDatos.length; i++){
                    if(arrayDatos[i].estado=='E'){
                        if(arrayDatos[i].estadoOriginal!=undefined){
                            certificadoList.push(arrayDatos[i])
                        }
                    }else{
                        certificadoList.push(arrayDatos[i])
                    }
                }*/
                var parametros = {
                    idContrato:idContrato,
                    nroCuota:nroCuota,
                    listaCertificados:arrayDatos
                }
                DAOV.consultarWebServicePOST(parametros, "actualizarFlota", function(datos){
                    var filasAfectadas = datos[0];
                    if(filasAfectadas>0){
                        realizoTarea=true;
                        fancyAlertFunction("¡Operación exitosa!", function(){
                            parent.$.fancybox.close();
                        })
                    }
                })
            }
        })
    }catch(err){
        emitirErrorCatch(err, "guardar()")
    }
}