var DAO = new DAOWebServiceGeT("wbs_ventas") // Objeto del web service de Ventas
var arrayDatos = new Array();
var regActual=0;
var dataTable = undefined;

cargarInicio(function(){
	var div = document.getElementById("Html2");
	div.style.zoom = 0.77;
	$(div).css("width", "1410px")
	$(div).css("height", "590px")
	DAO.consultarWebServiceGet("listarRegistroVentaTemporales", "", listarRegistros)
	$("#btnImprimir").click(enviarRegistrosASunat)
})

function listarRegistros(resultsData){
	try{
		arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'tipo', alineacion:'center'},
            {campo:'serie', alineacion:'center'},
            {campo:'numero', alineacion:'center'},
			{campo:'fechaEmision', alineacion:'center'},
			{campo:'descripcion', alineacion:'left'},
			{campo:'nombreAsociado', alineacion:'left'},
			{campo:'nombreDistrito', alineacion:'center'},
			{campo:'domicilio', alineacion:'left'},
            {campo:'idRegistroVentaDetalleTemp', alineacion:'center'},
            {campo:'nroCAT', alineacion:'center'},
			{campo:'placa', alineacion:'center'},
			{campo:'modelo', alineacion:'center'},
			{campo:'anno', alineacion:'center'},
			{campo:'prima', alineacion:'center'},
			{campo:'aporte', alineacion:'center'},
			{campo:'comision', alineacion:'center'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
		crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns=[
            { "width": "5%"},
            { "width": "5%"},
            { "width": "5%"},
			{ "width": "10%"},
			{ "width": "25%"},
			{ "width": "10%"},
			{ "width": "10%"},
			{ "width": "4%"},
			{ "width": "4%"},
			{ "width": "4%"},
			{ "width": "4%"},
			{ "width": "4%"},
			{ "width": "3%"},
			{ "width": "3%"},
			{ "width": "2%"},
			{ "width": "2%"}
        ];
        dataTable=parseDataTable("tabla_datos", columns, 525, false, false, false, false);
        $.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "listarRegistros")
	}
}
function getItems(idRegistroVentaTemp){
	try{
		var items = []
		var cabeceraObtenida = false
		for(var i=0; i<arrayDatos.length; i++){
			if(arrayDatos[i].idRegistro == idRegistroVentaTemp){
				
				var valorVenta = arrayDatos[i].prima + arrayDatos[i].aporte + arrayDatos[i].comision
				
				items.push({
                    "unidadMedidaCantidad":"NIU",
					"cantidad": 1,
					"descripcion": "CAT: "+arrayDatos[i].nroCAT+", Placa: "+arrayDatos[i].placa,
					"valorUnitario": valorVenta,
                    "precioVentaUnitario": valorVenta,
                    "tipoPrecioVentaUnitario":"01",
                    "montoTotalImpuestosItem":"0.0",
                    "baseAfectacionIgv": valorVenta,
					"montoAfectacionIgv": "0.0",
                    "porcentajeImpuesto": "0.0",
                    "tipoAfectacionIgv": "30",
                    "codigoTributo":"9998",
                    "valorVenta": valorVenta,
                    "codigoProducto": arrayDatos[i].nroCAT,
                    "codigoProductoSunat": "84131503",
					// datos usados para el registro de ventas de sunat previamente procesadas
					nroCAT:arrayDatos[i].nroCAT,
					idAsociado:arrayDatos[i].idAsociado,
					prima:arrayDatos[i].prima,
					aporte:arrayDatos[i].aporte,
					comision:arrayDatos[i].comision
				})
				
			}			
		}
		return items
	}catch(err){
		emitirErrorCatch(err, "getItems")
	}
}

function procesarRegistro(registroTemp, callback, objectoJSON=null){
	try{
		
		var funcionName;
		
		switch(registroTemp.tipo){
			case 'BV':
				objectoJSON = {
                    "tipo":"BV",
                    "tipoOperacion":"0101",
					"serie": registroTemp.serie,
					"numero": registroTemp.numero,
                    "montoTotalImpuestos": 0.0,
                    "sumatoriaIgv": 0.0,
                    fechaEmision:dateTimeFormat(registroTemp.fechaEmision),
                    "tipoMoneda": "PEN",
					"receptor": {
						"tipo": "1",
						"nro": registroTemp.nroDocumento,
						"razonSocial":registroTemp.nombreAsociado
					},
					items:getItems(registroTemp.idRegistroVentaTemp)
					/*campos usados para el registro de ventas previamente procesadas */

				}
				
				// actualiza total venta en funcion a todos los items:
				var total = 0
				for(var i=0; i<objectoJSON.items.length; i++){
					total = total + objectoJSON.items[i].valorVenta
				}
				funcionName = "enviarBVSUNAT"
				break;
				
			case 'FA':
				objectoJSON = {
                    "tipo":"FA",
                    "tipoOperacion":"0101",
					"serie": registroTemp.serie,
					"numero": registroTemp.numero,					
					"receptor": {
						"tipo": "6",
						"nro": registroTemp.nroDocumento,
						"razonSocial":registroTemp.nombreAsociado
					},
                    "montoTotalImpuestos": 0.0,
					"sumatoriaIgv": 0.0,
					fechaEmision:dateTimeFormat(registroTemp.fechaEmision),
                    "tipoMoneda": "PEN",
                    items:getItems(registroTemp.idRegistroVentaTemp)
				}
				// actualiza total venta en funcion a todos los items:
				var total = 0
				for(var i=0; i<objectoJSON.items.length; i++){
					total = total + objectoJSON.items[i].valorVenta
				}
				funcionName = "enviarFACSUNAT"
				break;
				
		}
        objectoJSON.importeTotal = total
        objectoJSON.totalVentaGravada = 0
        objectoJSON.idComprobanteSUNAT = 0;
        objectoJSON.fechaEmisionSUNAT = "";

		//envia registro a la sunat
		DAO.consultarWebServicePOST({jsonData:objectoJSON}, funcionName,
            function(data){
			    // agrega los campos registros en la sunat
                if (data.idFactura != undefined){
			        objectoJSON.idComprobanteSUNAT = data.idFactura;
			        objectoJSON.fechaEmisionSUNAT = data.fechaEmision;
			        callback(objectoJSON);
                }else if(data.idBoleta != undefined){
                    objectoJSON.idComprobanteSUNAT = data.idBoleta;
                    objectoJSON.fechaEmisionSUNAT = data.fechaEmision;
                    callback(objectoJSON);
                }else{ //error recibido desde OSE en body.code, body.status, body.message, body.description
                    callback(data.description)
                }
		    }
            , "Procesando"
            //, function(dataError){
			//callback(dataError)
		    //}
        )
	}catch(err){
		emitirErrorCatch(err, "procesarRegistro")
	}
}

var registrosProcesados = []

function enviarRegistrosASunat(contador=0){
	try{
		fancyConfirm("¿Desea proceder con la operación?",
            function(rpta){
			    if(rpta){
				    for(var i=0; i<arrayDatos.length; i++){
					    if(arrayDatos[i].idRegistroVentaTemp>0){
						    var registroTemp = arrayDatos[i]
                            regActual=i;
						    procesarRegistro( registroTemp,
                                function(registroSunat){
							        if(typeof registroSunat == 'string'){
								        console.log("Error : "+registroSunat); //devuelve mensaje de ERROR
                                        this.arrayDatos[regActual].descripcion=registroSunat;
							        }else{
                                        this.arrayDatos[regActual].descripcion="OK: idSUNAT="+registroSunat.idComprobanteSUNAT;
								        registrosProcesados.push(registroSunat)  //Todos los datos del CP devueltos
                                    }
                                    if (this.arrayDatos.length=regActual+1){
                                        //termino de procesar todos los comprobantes de pago
                                        if(registrosProcesados.length>0){
                                            DAO.consultarWebServicePOST( {jsonData:registrosProcesados}, "registrarVentasSUNAT",
                                                function(){
                                                    fancyAlertFunction("Operación finaliza!",
                                                        function(){
                                                            listarRegistros(arrayDatos);
                                                        }
                                                    )
                                                } , "Registrando ventas de la SUNAT")
                                        }else{//nada que poner en Registro de Ventas, solo mostrar respuestas SUNAT
                                            listarRegistros(arrayDatos);
                                        }

                                    }
						        }
                            )
					    }
				    }
			    }
		    }
        )
	}catch(err){
		emitirErrorCatch(err, "enviarRegistrosASunat")
	}
}
/*
function registrarVentasSUNAT(){
	try{
		DAO.consultarWebServicePOST({jsonData:registrosProcesados}, "registrarVentasSUNAT",
            function(data){
			    fancyAlertFunction("Operación finaliza!",
                    function(){
				        DAO.consultarWebServiceGet("listarRegistroVentaTemporales", "", listarRegistros)
			        })
		    },
            "Registrando ventas de la SUNAT")
	}catch(err){
		emitirErrorCatch(err, "registrarVentasSUNAT")
	}
} */