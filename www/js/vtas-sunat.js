var DAO = new DAOWebServiceGeT("wbs_ventas") // Objeto del web service de Ventas
var arrayDatos = new Array();
var regActual = 0;
var dataTable = undefined;

cargarInicio(function () {
    var div = document.getElementById("Html2");
    div.style.zoom = 0.77;
    $(div).css("width", "1410px")
    $(div).css("height", "590px")
    DAO.consultarWebServiceGet("listarRegistroVentaTemporales", "", listarRegistros)
    $("#btnImprimir").click(enviarRegistrosASunat)
})

function listarRegistros(resultsData) {

    //console.log("resultado data-", resultsData);
    try {
        arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            { campo: 'checkhtml', alineacion: 'center' },
            { campo: 'tipo', alineacion: 'center' },
            { campo: 'serie', alineacion: 'center' },
            { campo: 'numero', alineacion: 'center' },
            { campo: 'fechaEmision', alineacion: 'center' },
            { campo: 'descripcion', alineacion: 'left' },
            { campo: 'nombreAsociado', alineacion: 'left' },
            { campo: 'nombreDistrito', alineacion: 'center' },
            { campo: 'domicilio', alineacion: 'left' },
            { campo: 'idRegistroVentaDetalleTemp', alineacion: 'center' },
            { campo: 'nroCAT', alineacion: 'center' },
            { campo: 'placa', alineacion: 'center' },
            { campo: 'modelo', alineacion: 'center' },
            { campo: 'anno', alineacion: 'center' },
            { campo: 'prima', alineacion: 'center' },
            { campo: 'aporte', alineacion: 'center' },
            { campo: 'comision', alineacion: 'center' }
        ];
        if (dataTable != undefined) {
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns = [
            { "width": "5%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "10%" },
            { "width": "25%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "4%" },
            { "width": "4%" },
            { "width": "4%" },
            { "width": "4%" },
            { "width": "4%" },
            { "width": "3%" },
            { "width": "3%" },
            { "width": "2%" },
            { "width": "2%" }
        ];
        dataTable = parseDataTable("tabla_datos", columns, 525, false, false, false, false);
        $.fancybox.close();
    } catch (err) {
        emitirErrorCatch(err, "listarRegistros")
    }
}
function getItems(idRegistroVentaTemp) {
    try {
        var items = []
        var cabeceraObtenida = false
        for (var i = 0; i < arrayDatos.length; i++) {
            if (arrayDatos[i].idRegistro == idRegistroVentaTemp) {

                var valorVenta = arrayDatos[i].prima + arrayDatos[i].aporte + arrayDatos[i].comision

                items.push({
                    "unidadMedidaCantidad": "NIU",
                    "cantidad": 1,
                    "descripcion": "CAT: " + arrayDatos[i].nroCAT + ", Placa: " + arrayDatos[i].placa,
                    "valorUnitario": valorVenta,
                    "precioVentaUnitario": valorVenta,
                    "tipoPrecioVentaUnitario": "01",
                    "montoTotalImpuestosItem": 0,
                    "baseAfectacionIgv": valorVenta,
                    "montoAfectacionIgv": 0,
                    "porcentajeImpuesto": 0,
                    "tipoAfectacionIgv": "30",
                    "codigoTributo": "9998",
                    "valorVenta": valorVenta,
                    "codigoProducto": arrayDatos[i].nroCAT,
                    "codigoProductoSunat": "84131503",
                    // datos usados para el registro de ventas de sunat previamente procesadas
                    nroCAT: arrayDatos[i].nroCAT,
                    idAsociado: arrayDatos[i].idAsociado,
                    prima: arrayDatos[i].prima,
                    aporte: arrayDatos[i].aporte,
                    comision: arrayDatos[i].comision
                });
            }
        }
        return items
    } catch (err) {
        emitirErrorCatch(err, "getItems")
    }
}

function preparaJSON(registroTemp) {
    //

    var nroDocumentoReceptor = "";
    var nombresReceptor = "";
    var datosPropietario = registroTemp.datos_propietario;
    var flagFacturaAPropietario = registroTemp.flagFacturaAPropietario;
    //
    var tipoDocumento = registroTemp.tipo;
    var arrDatosPropietario = [];

    
    if(flagFacturaAPropietario){//facturar a propietario

        if(registroTemp.datos_propietario.indexOf('|') != -1){
            arrDatosPropietario = datosPropietario.split('|');
            nroDocumentoReceptor = arrDatosPropietario[0];
            nombresReceptor = arrDatosPropietario[1];
        }

    }
    
    // else{
    //     nroDocumentoReceptor = registroTemp.nroDocumento;
    //     nombresReceptor = registroTemp.nombreAsociado;
    // }

    try {

        var objectoJSON;

        if(flagFacturaAPropietario){ //siempre va a ser una factura entonces cambia a boleta
            
            objectoJSON = {
                "funcionName": "enviarBVSUNAT",
                "tipo": "BV",
                "tipoOperacion": "0101",
                "serie": registroTemp.serie,
                "numero": registroTemp.numero,
                "montoTotalImpuestos": 0,
                //"sumatoriaIgv": 0,
                fechaEmision: dateTimeFormat(registroTemp.fechaEmision),
                "tipoMoneda": "PEN",
                "receptor": {
                    "tipo": "1",
                    "nro": nroDocumentoReceptor,//registroTemp.nroDocumento,
                    "razonSocial": nombresReceptor//registroTemp.nombreAsociado
                },
                items: getItems(registroTemp.idRegistroVentaTemp)
                /*campos usados para el registro de ventas previamente procesadas */
            }

            // actualiza total venta en funcion a todos los items:
            var total = 0
            for (var i = 0; i < objectoJSON.items.length; i++) {
                total = total + objectoJSON.items[i].valorVenta
            }

            objectoJSON.importeTotal = total;
            //objectoJSON.totalVentaGravada = 0;
            objectoJSON.idComprobanteSUNAT = 0;
            objectoJSON.fechaEmisionSUNAT = "";

        }else{
            switch (registroTemp.tipo) {
                case 'BV':
                    objectoJSON = {
                        "funcionName": "enviarBVSUNAT",
                        "tipo": "BV",
                        "tipoOperacion": "0101",
                        "serie": registroTemp.serie,
                        "numero": registroTemp.numero,
                        "montoTotalImpuestos": 0,
                        //"sumatoriaIgv": 0,
                        fechaEmision: dateTimeFormat(registroTemp.fechaEmision),
                        "tipoMoneda": "PEN",
                        "receptor": {
                            "tipo": "1",
                            "nro": registroTemp.nroDocumento,//registroTemp.nroDocumento,
                            "razonSocial": registroTemp.nombreAsociado//registroTemp.nombreAsociado
                        },
                        items: getItems(registroTemp.idRegistroVentaTemp)
                        /*campos usados para el registro de ventas previamente procesadas */
                    }
    
                    // actualiza total venta en funcion a todos los items:
                    var total = 0
                    for (var i = 0; i < objectoJSON.items.length; i++) {
                        total = total + objectoJSON.items[i].valorVenta
                    }
                    break;
    
                case 'FA':
                    objectoJSON = {
                        "funcionName": "enviarFACSUNAT",
                        "tipo": "FA",
                        "tipoOperacion": "0101",
                        "serie": registroTemp.serie,
                        "numero": registroTemp.numero,
                        "receptor": {
                            "tipo": "6",
                            "nro": registroTemp.nroDocumento,
                            "razonSocial": registroTemp.nombreAsociado
                        },
                        "montoTotalImpuestos": 0,
                        "sumatoriaIgv": 0,
                        fechaEmision: dateTimeFormat(registroTemp.fechaEmision),
                        "tipoMoneda": "PEN",
                        items: getItems(registroTemp.idRegistroVentaTemp)
                    }
                    // actualiza total venta en funcion a todos los items:
                    var total = 0
                    for (var i = 0; i < objectoJSON.items.length; i++) {
                        total = total + objectoJSON.items[i].valorVenta
                    }
                    break;
    
            }
            objectoJSON.importeTotal = total;
            //objectoJSON.totalVentaGravada = 0;
            objectoJSON.idComprobanteSUNAT = 0;
            objectoJSON.fechaEmisionSUNAT = "";
        }

        return objectoJSON;

    } catch (err) {
        emitirErrorCatch(err, "preparaJSON")
    }
}

function enviarRegistrosASunat(contador = 0) {
   
   console.log("enviando....");
    try {
        fancyConfirm("¿Desea proceder con la operación?",
            function (rpta) {
                if (rpta) {
                    $("#btnImprimir").prop('disabled', true); //debera reiniciar programa
                    var registroTemp, cpeJSON;
                    var cnt = 0;
                    var maxReg = arrayDatos.length;
                    cpeJSON = preparaJSON(arrayDatos[cnt]);
                    syncPOST(cpeJSON, function callback(data) {

                        console.log('--->>',data);

                        if (typeof data.msjERROR == 'string') {
                            console.log("Error : " + data.msjERROR); //devuelve mensaje de ERROR
                            this.arrayDatos[cnt].descripcion = data.msjERROR;
                            this.arrayDatos[cnt].numero = "0000";
                        } else {
                            this.arrayDatos[cnt].descripcion = "OK: idSUNAT=" + data.idComprobanteSUNAT;
                            this.arrayDatos[cnt].numero = data.numero;
                        }

                        if (++cnt === maxReg) {
                            listarRegistros(arrayDatos);
                            fancyAlertFunction("Operacion terminada!",
                                function () {
                                    DAO.consultarWebServiceGet("borrarTempVentas", "",
                                        function () {
                                            $.fancybox.close();
                                        })
                                });
                        } else {
                            //procesa el siguiente registro

                            cpeJSON = preparaJSON(arrayDatos[cnt]);
                            syncPOST(cpeJSON, callback);

                        }
                    })
                }
            })

    } catch (err) {
        emitirErrorCatch(err, "enviarRegistrosASunat")
    }
}

function checkPropietario(idRegistro, elemento){
    var flagCheck = elemento.is(":checked");
    //console.log('chequeado',flagCheck, idRegistro);
    var dataBuscada =  buscaDataEnArreglo(idRegistro,flagCheck);
    //console.log(dataBuscada);
    elemento.parent().parent().find('td').eq(6).text(flagCheck ? dataBuscada.datosPropietario :dataBuscada.nombreAsociado)

  
}

function buscaDataEnArreglo(idBusqueda, flagFacturaPropietario){
    var respuesta = {
        nombreAsociado : "",
        datosPropietario : "",
        encontro : false
    }

    var datosPropietario = "";
    var nroDocumentoPropietario = "";
    var nombresPropietario = "";
 
    var arrDatosPropietario = [];

    $.each(arrayDatos,function(){
         if(this.idRegistroVentaTemp == idBusqueda){
            respuesta.nombreAsociado = this.nombreAsociado;
            respuesta.datosPropietario = this.datos_propietario;
            respuesta.encontro = true;
            this.flagFacturaAPropietario = flagFacturaPropietario;
            // datosPropietario = this.datos_propietario;

            // this.flagFacturaAPropietario = flagFacturaPropietario;
            
            // if(this.datos_propietario.indexOf('|') != -1){
            //     arrDatosPropietario = datosPropietario.split('|');
            //     nroDocumentoPropietario = arrDatosPropietario[0];
            //     nombresPropietario = arrDatosPropietario[1];

            //     this.nroDocumento = nroDocumentoPropietario;
            //     this.nroDocumento = nombresPropietario;
            // }
            return;
        }
    });
    return respuesta;
    //console.log(nombreAsociado,datosPropietario )

}
//Esta funcion permite ejecutar los envios al servidor uno a la vez y en secuencia
function syncPOST(cpeJSON, callback) {
    //servidor procesa (envia SUNAT)  este JSON y si OK registra
    // Comprobante Pago (registrarVentasSUNAT) sino muestra ERROR
    DAO.consultarWebServicePOST({ jsonData: cpeJSON }, cpeJSON.funcionName,
        function (data) {
            callback(data);
        }
        , "Procesando")
}

/*
var registrosProcesados = []
function enviarRegistrosASunat(contador=0){
    try{
        fancyConfirm("¿Desea proceder con la operación?",
            function(rpta){
                if(rpta){
                    $("#btnImprimir").prop('disabled', true); //debera reiniciar programa
                    var registroTemp,cpeJSON;
                    var cnt=0;
                    var maxReg=arrayDatos.length
                    for(var i=0; i<maxReg; i++){
                        if(arrayDatos[i].idRegistroVentaTemp>0){
                            registroTemp = arrayDatos[i]
                            cpeJSON=preparaJSON(registroTemp);
                            cpeJSON.regActual=i;
                            //servidor procesa (envia SUNAT)  este JSON y si OK registra Comprobante Pago (registrarVentasSUNAT)
                            // sino muestra ERROR
                            DAO.consultarWebServicePOST({jsonData:cpeJSON}, cpeJSON.funcionName,
                                function(data){
                                    if(data.msjERROR != undefined){
                                        this.arrayDatos[data.regActual].descripcion="OK: idSUNAT="+data.idComprobanteSUNAT;
                                    }else{
                                        console.log("Error : "+data.msjERROR); //devuelve mensaje de ERROR
                                        this.arrayDatos[data.regActual].descripcion=data.msjERROR;
                                    }
                                    //if(typeof data.msj [0] == 'string'){
                                    //    console.log("Error : "+data[0]); //devuelve mensaje de ERROR
                                    //    this.arrayDatos[regActual].descripcion=data[0];
                                    //}else{
                                    //    this.arrayDatos[regActual].descripcion="OK: idSUNAT="+data[0].idComprobanteSUNAT;
                                    //}
                                    if (++cnt === maxReg){
                                        listarRegistros(arrayDatos);
                                        fancyAlertFunction("Operacion terminada!",
                                            function(){
                                                DAO.consultarWebServiceGet("borrarTempVentas", "",
                                                    function(){
                                                        $.fancybox.close();
                                                    })
                                            });
                                    }
                                }
                                , "Procesando")
                        }
                    }
                }
            })

    }catch(err){
        emitirErrorCatch(err, "enviarRegistrosASunat")
    }
}
/*
function procesarRegistro(registroTemp, callback, objectoJSON=null){
    try{

        var funcionName;

        switch(registroTemp.tipo){
            case 'BV':
                objectoJSON = {
                    "funcionName":"BV",
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
                    //campos usados para el registro de ventas previamente procesadas

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
*/