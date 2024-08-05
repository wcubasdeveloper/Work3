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
var arrayLocales;
cargarInicio(function(){
	$("#btnBuscar").click(function(){ // asigna funcion al boton de busqueda de depositos
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los vouchers
    });
	$("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto    
	$("#btnRevisarVoucher").click(revisarVoucher);
	$("#btnNuevoVoucher").click(nuevoVoucher);
	var parametros="&idLocal="+idLocal; //si idLocal=0 trae todos, sino solo trae el local del usuario
    DAO.consultarWebServiceGet("getLocales", parametros, function(data){
        arrayLocales = data;
		var campos =  {"keyId":'idLocal', "keyValue":'nombreLocal'}
		agregarOpcionesToCombo("idCmbLocales", data, campos);
		$("#idCmbLocales").select2();
		buscar(idLocal); // Realiza la busqueda de depositos en funcion a la informacion ingresada en el formulario de busqueda.
	});
});
function buscar(qLocal){ // busca los vouchers mas recientes
	try{
        if( qLocal != undefined ){//primera llamada
            var idLocal=qLocal;
        }else{
            idLocal = $("#idCmbLocales").val();
        }
		var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());
		var parametros = "&idLocal="+idLocal+"&fechaDesde="+fechaDesde+"&fechaHasta="+fechaHasta;
        console.log("Parametros usados >>Depositos: "+parametros );
		DAO.consultarWebServiceGet("getListaVoucherPN", parametros, listar, true, paginacion);
	}catch(err){
		emitirErrorCatch(err, "buscarVoucherPN");
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
        /*
         "CASE d.estado "+
         "WHEN 'A' THEN 'ANUL' "+
         "WHEN 'B' THEN 'APROB' "+
         "ELSE 'PEND' "+
         "END as estado,"+
         "d.idDepositoPN as idDeposito, date_format(d.fecha, '%d/%m/%Y') as fecha, l.Nombre as nombreLocal, concat('S/. ',d.total) as total "+
         */
		arrayDatos = resultsData; //guarda pagina actual en variable global
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'estado'     , alineacion:'left'             },
			{campo:'idDeposito' , alineacion:'left',LPAD:true },
			{campo:'fecha'      , alineacion:'left'           },
			{campo:'nombreLocal', alineacion:'left'           },
            {campo:'total'      , alineacion:'left'           }
        ];
		if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
		var columns=[
            { "width": "10%" },
			{ "width": "20%" },
            { "width": "20%","type":"date-eu" },
            { "width": "30%" },
			{ "width": "20%" }
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
                // con el metodo cargarPaginacion se implementa la implementacion.
                // Recibe parametros @1: numero de paginas, @2: id DIV de la Paginacion
            }
        });
        $.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "listar")
	}
}

function revisarVoucher(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un Voucher de depositos");
        }else{
			parent.abrirVentanaFancyBox(1100, 750,
                    "tesor-deposito-pn-voucher?accion=E&idDepositoPN="+arrayDatos[filaSeleccionada].idDeposito, true,
                function(){
                    buscar();
                },
                true);
		}		
	}catch(err){
		emitirErrorCatch(err, "revisarVoucherPN");
	}
}
function nuevoVoucher(){
	try{
		parent.abrirVentanaFancyBox(1100, 750, "tesor-deposito-pn-voucher?accion=N", true, function(){
			buscar();
		}, true);				
	}catch(err){
		emitirErrorCatch(err, "nuevoVoucherPN");
	}
}