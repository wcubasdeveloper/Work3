/**
 * Created by JEAN PIERRE on 2/07/2016.
 */
var idInforme = $_GET("idInforme");
var codEvento = $_GET("codEvento");
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var arrayDatos = new Array();
var dataTable = undefined;
cargarInicio(function(){
    var parametros = "&codEvento="+codEvento;
    DAO.consultarWebServiceGet("getAgraviados", parametros, listarAgraviados);
	$("#btnRegistro").click(abrirRegistroCarta);
    $("#btnEdicion").click(editarCarta);
});
function listarAgraviados(resultsData){
    try{
        arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'codAgraviado', alineacion:'center'},
            {campo:'nroDocumento', alineacion:'center'},
            {campo:'nombreAgraviado', alineacion:'lef'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_agraviados", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns=[
            { "width": "30%" },
            { "width": "20%"},
            { "width": "50%"}
        ];
        dataTable=parseDataTable("tabla_agraviados", columns, 225, false, false, false, false);
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "listarAgraviados");
    }
}
function editarCarta(){
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un agraviado");
        }else{
            if(arrayDatos[filaSeleccionada].idCarta>0){
                var codEvento = arrayDatos[filaSeleccionada].codEvento;
                var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
                var idCarta = arrayDatos[filaSeleccionada].idCarta;
				var UIT = arrayDatos[filaSeleccionada].UIT;
                parent.abrirVentanaFancyBox(700, 375, "cartagarantia?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&idCarta="+idCarta+"&UIT="+UIT, true);
            }else{
                fancyAlert("¡El agraviado seleccionado no cuenta con el registro de alguna carta!");
            }
        }
    }catch(err){
        emitirErrorCatch(err, "editarCarta")
    }
}
function abrirRegistroCarta(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un agraviado");
        }else{
			if(arrayDatos[filaSeleccionada].idCarta>0){
				fancyAlert("¡Este agraviado ya cuenta con una carta de garantia!");
			}else{
				var codEvento = arrayDatos[filaSeleccionada].codEvento;
				var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
				var UIT = arrayDatos[filaSeleccionada].UIT;
				parent.abrirVentanaFancyBox(700, 375, "cartagarantia?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&idCarta=0&UIT="+UIT, true);
			}			
		}		
	}catch(err){
		emitirErrorCatch(err, "abrirRegistroCarta");
	}
}
