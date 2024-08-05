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

    DAO.consultarWebServiceGet("getListaExpedientesParaOrdenAgraviados", parametros, listar, true, null);
}
var tipoExp = {
	"1":"Reemb. Gastos méd.",
	"2":"Indem. por muerte",
	"3":"Indem. por sepelio",
	"4":"Indem. por Incap. temp.",
	"5":"Indem. por Inval. perm."
}

function listar(resultsData){

    arrayDatos = resultsData; //guarda pagina actual en variable global
    for(var i=0; i<arrayDatos.length; i++){
		arrayDatos[i].tipoExp = tipoExp[arrayDatos[i].tipoExpediente] 
	}
	var camposAmostrar = [ // asigna los campos a mostrar en la grilla
        {campo:'tipoExp', alineacion:'center'    },
		{campo:'idExpediente', alineacion:'center' , LPAD:true           },
        {campo:'codEvento', alineacion:'center'},
        {campo:'codAgraviado', alineacion:'center'},
        {campo:'nroDocumento', alineacion:'center'           },
        {campo:'nombreAgraviado', alineacion:'left'           },
        {campo:'diagnostico', alineacion:'left'           }
    ];
    if(dataTable!=undefined){
        dataTable.destroy();
    }
    crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
    var columns=[
        { "width": "10%"                     },
        { "width": "10%"                    },
        { "width": "10%"   },
        { "width": "10%"                    },
        { "width": "10%"                    },
        { "width": "25%"                    },
        { "width": "25%"                    }
    ];
    var orderByColumn=[1, "desc"];
    dataTable=parseDataTable("tabla_datos", columns, 320, orderByColumn, false, false, false)
    $.fancybox.close();
}

function continuarConTransaccion(){
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un expediente!");
        }else{
            parent.abrirVentanaFancyBox(1150, 570,
                    "tesor-pago-agrav-detalle?accion=N&nroExpediente="+arrayDatos[filaSeleccionada].idExpediente+
                    "&codAgraviado="+arrayDatos[filaSeleccionada].codAgraviado+
                    "&codEvento="+arrayDatos[filaSeleccionada].codEvento+
                    "&nombreAgraviado="+arrayDatos[filaSeleccionada].nombreAgraviado+
					"&idExpediente="+arrayDatos[filaSeleccionada].idExpediente+
					"&tipoExp="+arrayDatos[filaSeleccionada].tipoExp+
					"&tipoExpediente="+arrayDatos[filaSeleccionada].tipoExpediente , true,
                function(){
                    buscar();
                },
                true);
        }
    }catch(err){
        emitirErrorCatch(err, "continuarConTransaccion()")
    }
}