/*
Ventas a Empresas de Transporte = Generacion de contratos
    Permite la creacion y edicion de contratos + responsable + flota + CATS
 */
var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){
    //Usuario regular (No administrador o Supervisor MHBSoft)
	idLocal = parent.idLocal; //solo se muestra la informacion relacionada a su LOCAL
}
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
	$("#btnRevisarContrato").click(revisarContrato);
	$("#btnNuevoContrato").click(nuevoContrato);
	$("#btnAnularContrato").click(anularContrato)
	var parametros="";
    DAO.consultarWebServiceGet("getEmpresasTransp", parametros, function(data){
		var campos =  {"keyId":'idEmpresaTransp', "keyValue":'nombreEmpresa'}
		agregarOpcionesToCombo("cmbEmpresas", data, campos);
		$("#cmbEmpresas").select2();
        buscar();
	});
});
function buscar(){ // busca los contratos que cumplan las condiciones
	try{
        var idEmpresa = $("#cmbEmpresas").val();
		var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
		var parametros = "&idEmpresaTransp="+idEmpresa+"&fechaDesde="+fechaDesde+"&fechaHasta="+fechaHasta;
		DAO.consultarWebServiceGet("getListaContratos", parametros, listar, true, paginacion);
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
            {campo:'estado'             , alineacion:'left'           },
			{campo:'idContrato'         , alineacion:'left',LPAD:true },
			{campo:'fechaEmision'       , alineacion:'left'           },
			{campo:'nombreCorto'        , alineacion:'left'           },
            {campo:'nCuotas'            , alineacion:'left'           },
            {campo:'flota'              , alineacion:'left'           },
            {campo:'fechaIniVigencia'   , alineacion:'left'           },
            {campo:'fechaFinVigencia'   , alineacion:'left'           }
        ];
		if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
		var columns=[
            { "width": "5%"                     },
 			{ "width": "10%"                    },
            { "width": "15%","type":"date-eu"   },
            { "width": "30%"                    },
			{ "width": "5%"                    },
            { "width": "5%"                    },
            { "width": "15%"                    },
            { "width": "15%"                    }
        ];
		var orderByColumn=[2, "desc"];
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

function revisarContrato(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un Contrato!");
        }else{
			parent.abrirVentanaFancyBox(1150, 750,
                    "vtaspj-contrato-detalle?accion=E&idContrato="+arrayDatos[filaSeleccionada].idContrato, true,
                function(){
                    buscar();
                },
                true);
		}		
	}catch(err){
		emitirErrorCatch(err, "revisarContrato");
	}
}
function nuevoContrato(){
	try{
		parent.abrirVentanaFancyBox(1150, 750, "vtaspj-contrato-detalle?accion=N", true, function(){
			buscar();
		}, true);				
	}catch(err){
		emitirErrorCatch(err, "nuevoContrato");
	}
}
function anularContrato(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un Contrato!");
        }else{
			var codEstado = arrayDatos[filaSeleccionada].codEstado;
			if(codEstado == 'R'){
				fancyConfirm("¿Procede con la anulación del contrato?", function(rpta){
					if(rpta){
						// anula el contrato
						var idContrato = arrayDatos[filaSeleccionada].idContrato;
						var parametros = "&idContrato="+idContrato
						DAO.consultarWebServiceGet("anularContrato", parametros, function(data){
							var filasAfectadas = data[0]
							if(filasAfectadas>0){
								buscar()
							}else{
								fancyAlert("¡Operacion Fallida!")
							}
						})
					}
				})
			}else{
				fancyAlert("¡Solo se pueden anular contratos que se hayan registrado recientemente!")
			}
		}		
	}catch(err){
		emitirErrorCatch(err, "anularContrato()")
	}
}