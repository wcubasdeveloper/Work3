/**
 * Created by JEAN PIERRE on 1/01/2018.
 */
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var dataTable = undefined;
var arrayDatos = [];
cargarInicio(function(){
    // Agrega campos de tipo entero:
    $("#idDNI").addClass("solo-numero")
    $("#idDNI").prop("maxlength", "8")
    $("#idNumero").addClass("solo-numero")
    $(".solo-numero").keypress(function(e){ // permite ingresar solo numeros
        return textNumber(e);
    });
    $("#btnBuscar").click(buscar)
    $("#btnContinuar").click(continuarConTransaccion)
    listar(arrayDatos)
})
function buscar(){

    var codAgraviado = $("#idCodigo").val();
    var nombre = $("#idNombre").val();
    var dni = $("#idDNI").val();
    var nroExp = $("#idNumero").val()

    var parametros = "&codAgraviado="+codAgraviado+
                     "&nombre="+nombre+
                     "&dni="+dni+"&nroExpediente="+nroExp;

    DAO.consultarWebServiceGet("getListaExpedientesAgraviados", parametros, listar, true, null);
}
function listar(resultsData){

    arrayDatos = resultsData; //guarda pagina actual en variable global
    var camposAmostrar = [ // asigna los campos a mostrar en la grilla
        {campo:'idExpediente', alineacion:'center' , LPAD:true           },
        {campo:'codEvento', alineacion:'center'},
        {campo:'codAgraviado', alineacion:'center'},
        {campo:'nroDocumento', alineacion:'center'           },
        {campo:'nombreAgraviado', alineacion:'left'           },
        {campo:'diagnostico', alineacion:'left'           },
		{campo:'nombreProveedor'  , alineacion:'left'           },
        {campo:'totalCartas'  , alineacion:'center'           },
        {campo:'totalFacturas'   , alineacion:'center'           }
    ];
    if(dataTable!=undefined){
        dataTable.destroy();
    }
    crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
    var columns=[
        { "width": "9%"                     },
        { "width": "9%"                    },
        { "width": "9%"   },
        { "width": "9%"                    },
        { "width": "24%"                    },
        { "width": "9%"                    },
        { "width": "15%"                    },
		{ "width": "8%"                    },
        { "width": "8%"                    }
    ];
    var orderByColumn=[0, "desc"];
    dataTable=parseDataTable("tabla_datos", columns, 320, orderByColumn, false, false, false)
    $.fancybox.close();
}

function continuarConTransaccion(){
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un expediente!");
        }else{
            parent.abrirVentanaFancyBox(1150, 570,
                    "tesor-pago-prov-detalle?accion=N&nroExpediente="+arrayDatos[filaSeleccionada].idExpediente+
                    "&codAgraviado="+arrayDatos[filaSeleccionada].codAgraviado+
                    "&codEvento="+arrayDatos[filaSeleccionada].codEvento+
                    "&nombreAgraviado="+arrayDatos[filaSeleccionada].nombreAgraviado+
					"&idProveedor="+arrayDatos[filaSeleccionada].idProveedor, true,
                function(){
                    buscar();
                },
                true);
        }
    }catch(err){
        emitirErrorCatch(err, "continuarConTransaccion()")
    }
}