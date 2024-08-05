/*
Aprobacion/Anulacion de Depositos x Ventas a Empresas
 esta condicion impide que la transaccion pueda ser modificada
*/
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
var arrayDatos = [];
cargarInicio(function(){
	$("#btnBuscar").click(function(){ // asigna funcion al boton de busqueda de depositos
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los vouchers
    });
	$("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto    
	$("#btnAnularVoucher").click(anularVoucher);
	$("#btnAprobarVoucher").click(aprobarVoucher);
	var parametros="";
    DAO.consultarWebServiceGet("getEmpresasTransp", parametros, function(data){
		var campos =  {"keyId":'idEmpresaTransp', "keyValue":'nombreEmpresa'}
		agregarOpcionesToCombo("idCmbEmpresas", data, campos);
		$("#idCmbEmpresas").select2();
        buscar();
	});
});
function buscar(){ // busca los vouchers que cumplan las condiciones
	try{
        var idEmpresa = $("#idCmbEmpresas").val();
		var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
		var parametros = "&idEmpresaTransp="+idEmpresa+"&fechaDesde="+fechaDesde+"&fechaHasta="+fechaHasta;
		DAO.consultarWebServiceGet("getListaVoucherPJ", parametros, listar, true, paginacion);
	}catch(err){
		emitirErrorCatch(err, "buscarVoucherPJ");
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

		arrayDatos = resultsData; //guarda pagina actual en variable global
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'estado'         , alineacion:'left'           },
			{campo:'idDepositoPJ'   , alineacion:'left',LPAD:true },
			{campo:'fecha'          , alineacion:'left'           },
			{campo:'nombreEmpresas' , alineacion:'left'           },
            {campo:'idContratos'    , alineacion:'left'           },
            {campo:'total'          , alineacion:'left'           }
        ];
		if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
		var columns=[
            { "width": "5%"                     },
 			{ "width": "10%"                    },
            { "width": "15%","type":"date-eu"   },
            { "width": "35%"                    },
			{ "width": "25%"                    },
            { "width": "10%"                    }
        ];
		var orderByColumn=[1, "desc"];
		dataTable=parseDataTable("tabla_datos", columns, 340, orderByColumn, false, false, false, function(){
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
		emitirErrorCatch(err, "listarPJ")
	}
}

function anularVoucher(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un Voucher de depositos");
        }else{
            if(arrayDatos[filaSeleccionada].estado != 'PEND'){
                fancyAlert("El voucher seleccionado debe estar en estado 'Pendiente de Aprobacion'");
            }else {
                parent.abrirVentanaFancyBox(1100, 750,
                        "tesor-aprobacionpj-voucher?accion=A&idDepositoPJ=" + arrayDatos[filaSeleccionada].idDepositoPJ, true,
                    function () {
                        buscar();
                    },
                    true);
            }
		}		
	}catch(err){
		emitirErrorCatch(err, "anularVoucherPJ");
	}
}
function aprobarVoucher(){
	try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un Voucher de depositos");
        }else{
            if(arrayDatos[filaSeleccionada].estado != 'PEND'){
                fancyAlert("El voucher seleccionado debe estar en estado 'Pendiente de Aprobacion'");
            }else {
                parent.abrirVentanaFancyBox(1100, 750,
                        "tesor-aprobacionpj-voucher?accion=B&idDepositoPJ="+arrayDatos[filaSeleccionada].idDepositoPJ, true,
                    function(){
                        buscar();
                    }, true);
            }
        }
	}catch(err){
		emitirErrorCatch(err, "aprobarVoucherPJ");
	}
}