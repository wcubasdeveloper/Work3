var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion
var dataTable = undefined;
var arrayDatos;
cargarInicio(function(){
	$("#btnBuscarAgraviado").click(buscarAgraviado);
	$("#btnRevProv").click(revisarProvision);
	$("#btnAnularCarta").click(anularCarta);
	$("#btnEditarCarta").click(editarCarta);
	$("#btnNuevaCarta").click(nuevaCarta);	
});
function buscarAgraviado(){
	try{
		if($("#nombreAgraviado").val().trim()=="" && $("#idDNI").val().trim()==""){
            fancyAlertFunction("¡Debe ingresar al menos un parámetro para la búsqueda del agraviado!",function(){
                $("#nombreAgraviado").focus();
            })
        }else{
			var nombreAgraviado = $("#nombreAgraviado").val().trim();
			var DNI = $("#idDNI").val().trim();
			var parametros = "&nombre="+nombreAgraviado+"&DNI="+DNI;
			DAO.consultarWebServiceGet("getAgraviadosCartaXnombre_dni",parametros,listarAgraviados);
        }		
	}catch(err){
		emitirErrorCatch(err, "buscarAgraviado");
	}
}
function listarAgraviados(resultsData){
	try{
		for(var i=0; i<resultsData.length; i++){
			resultsData[i].gastoTotalAprox = "S/. "+resultsData[i].gastoTotalAprox;
			if(resultsData[i].totalCartas==null){
				resultsData[i].totalCartas=0;
			}
			resultsData[i].totalCartas = "S/. "+resultsData[i].totalCartas;
		}
        arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'codAgraviado', alineacion:'center'},
			{campo:'codEvento', alineacion:'center'},
            {campo:'nroDocumento', alineacion:'center'},
            {campo:'nombreAgraviado', alineacion:'lef'},
			{campo:'diagnostico', alineacion:'lef'},
			{campo:'totalCartas', alineacion:'center'},
			{campo:'gastoTotalAprox', alineacion:'center'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_agraviados", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns=[
            { "width": "10%"},
			{ "width": "10%"},
            { "width": "10%"},
            { "width": "30%"},
			{ "width": "20%"},
			{ "width": "10%"},
			{ "width": "10%"}
        ];
        dataTable=parseDataTable("tabla_agraviados", columns, 250, false, false, false, false);
        $.fancybox.close();	
		$("#idOculta").css("display", "none");		
	}catch(err){
		emitirErrorCatch(err, "listarAgraviados")
	}
}
function revisarProvision(){
	try{
		if(filaSeleccionada!=undefined){
            var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			parent.abrirVentanaFancyBox(750, 630, "provision_gastos_agraviados?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&soloLectura=T", true);
		}else{
			fancyAlert("¡Debe seleccionar un agraviado!");
		}		
	}catch(err){
		emitirErrorCatch(err, "revisarProvision")
	}
}
function anularCarta(){
	try{
		if(filaSeleccionada!=undefined){
			var informeCerrado = arrayDatos[filaSeleccionada].informeCerrado;
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			if(informeCerrado=='S'){
				
				var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
				
				parent.abrirVentanaFancyBox(950, 360, "eventos_lista_cartas?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&accion=AC", true);
			}else{
				fancyAlert("¡No se puede proseguir con la operación, por que el informe del evento "+codEvento+" no ha sido cerrado!");
			}
		}else{
			fancyAlert("¡Debe seleccionar un agraviado!");
		}		
	}catch(err){
		emitirErrorCatch(err, "anularCarta")
	}
}
function editarCarta(){
	try{
		if(filaSeleccionada!=undefined){
			var informeCerrado = arrayDatos[filaSeleccionada].informeCerrado;
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			if(informeCerrado=='S'){
				
				var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
				
				parent.abrirVentanaFancyBox(950, 360, "eventos_lista_cartas?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&accion=EC", true);			          
			}else{
				fancyAlert("¡No se puede proseguir con la operación, por que el informe del evento "+codEvento+" no ha sido cerrado!");
			}
		}else{
			fancyAlert("¡Debe seleccionar un agraviado!");
		}		
	}catch(err){
		emitirErrorCatch(err, "editarCarta");
	}
}
function nuevaCarta(){
	try{
		if(filaSeleccionada!=undefined){
			var informeCerrado = arrayDatos[filaSeleccionada].informeCerrado;
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			if(informeCerrado=='S'){

				var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
			
				parent.abrirVentanaFancyBox(1200, 880, "nueva_carta_1?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&accion=NC", true, function(){
					buscarAgraviado();
				}, true); 
			}else{
				fancyAlert("¡No se puede proseguir con la operación, por que el informe del evento "+codEvento+" no ha sido cerrado!");
			}			
		}else{
			fancyAlert("¡Debe seleccionar un agraviado!");
		}		
	}catch(err){
		emitirErrorCatch(err, "nuevaCarta");
	}
}