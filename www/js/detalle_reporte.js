var tipoReporte = $_GET("tipoReporte");
var arrayDatos = parent.window.frames[0].dataReporte;
function descargar(){
	try{
		var contentHTML=$("#divTABLA_cabecera").html()+"<br>"+$("#divTABLA_datos").html();
		nombreExcel="SEGUIMIENTO DE CERTIFICADOS";
		generarExcelConJqueryYhtml(contentHTML, nombreExcel)
		$.fancybox.close();		
	}catch(err){
		emitirErrorCatch(err, "descargar");
	}
}
function parseIdGuia(idGuia){
	try{
		idGuia = idGuia.toString();
		if(idGuia.startsWith("LIQ - ")){
			var guiaNumero = idGuia.split("LIQ - ")[1];
			return "LIQ - "+LPAD(guiaNumero, numeroLPAD);
			
		}else{
			return LPAD(idGuia, numeroLPAD);
		}
		
	}catch(e){
		emitirErrorCatch(e, "parseIdGuia");
	}
}
cargarInicio(function(){
	var titulo = "";
	var asunto = "";
	var fechaEmision = convertirAfechaString(new Date(), true);	
	var headerBody = "";
	var tbody = "";
	$("#btnBuscar").click(descargar);
	switch(tipoReporte){			
		case 'CER':
			var inicio = $_GET('inicio');
			var fin = $_GET('fin');
			
			titulo = "SEGUIMIENTO DE CERTIFICADOS";
			asunto = "CAT N° "+inicio;
			if(fin!=""){
				asunto="CAT Del "+inicio+" al "+fin;
			}
			headerBody = "<th><center>FECHA</center></th>"+
				"<th><center></center></th>"+
				"<th><center>ALMACEN/CONCESIONARIO</center></th>"+
				"<th><center>USUARIO</center></th>"+
				"<th><center>ID_GUIA</center></th>";
			
			var nroCertificado = "";
			for(var i=0; i<arrayDatos.length; i++){
				if(arrayDatos[i].nroCertificado!=nroCertificado){
					nroCertificado = arrayDatos[i].nroCertificado;					
					tbody = tbody+"<tr style='font-size:14px; font-weight:bold;'><td colspan='5'> N° "+nroCertificado+" / Estado: "+obtenerEstado(arrayDatos[i].nroCertificado)+"</td>"+
					"<td style='display: none;'></td>"+
					"<td style='display: none;'></td>"+
					"<td style='display: none;'></td>"+
					"<td style='display: none;'></td>"+
					"</tr>";
				}
				tbody = tbody+
					"<tr><td>"+arrayDatos[i].fechaOperacion+"</td>"+
					"<td>"+arrayDatos[i].tipoOperacion+"</td>"+
					"<td>"+arrayDatos[i].nombreUbicacion+"</td>"+
					"<td>"+arrayDatos[i].nombreUsuario+"</td>"+
					"<td>"+parseIdGuia(arrayDatos[i].idGuia)+"</td></tr>";
				
				/*
				if(arrayDatos[i].recordSalida!=null){
					var record = arrayDatos[i].recordSalida.split("||");
					var fechaOperacion = record[1];
					var tipoOperacion = record[2];
					var nombreUsuario = record[3];
					var idGuia = record[0];
					
					tbody = tbody+
					"<tr><td>"+fechaOperacion+"</td>"+
					"<td>"+tipoOperacion+"</td>"+
					"<td>"+arrayDatos[i].nombreUbicacion+"</td>"+
					"<td>"+nombreUsuario+"</td>"+
					"<td>"+idGuia+"</td></tr>";
				}
				*/	
			}
			break;
		case 'CON':
			var concesionario = $_GET('nombreConcesionario');
			titulo = "SEGUIMIENTOS DE CERTIFICADOS";
			asunto = "CONCESIONARIO : "+concesionario;
			headerBody = "<th><center>NRO CERTIFICADO</center></th>"+
				"<th><center>FECHA INGRESO</center></th>"+
				"<th><center>ID_GUIA</center></th>"+
				"<th><center>NRO GUIA</center></th>"+
				"<th><center>ESTADO</center></th>";
			
			for(var i=0; i<arrayDatos.length; i++){
				if(arrayDatos[i].idLiquidacion>0){
					arrayDatos[i].status = 'Vendido ('+arrayDatos[i].fechaLiquidacion+')'
				}else{
					arrayDatos[i].status = 'Distribuido';
				}
				tbody = tbody+
					"<tr><td><center>"+arrayDatos[i].nroCertificado+"</center></td>"+
					"<td><center>"+arrayDatos[i].fechaOperacion+"</center></td>"+
					"<td><center>"+parseIdGuia(arrayDatos[i].idGuia)+"</center></td>"+
					"<td><center>"+arrayDatos[i].nroGuiaManual+"</center></td>"+
					"<td><center>"+arrayDatos[i].status+"</center></td></tr>";
			}
			
			break;
		case 'PRO':
			var nombrePromotor = $_GET('nombrePromotor');
			var dias = $_GET('dias');
			titulo = "HOJA DE RUTA";
			asunto = "PROMOTOR: "+nombrePromotor;
			
			headerBody = "<th><center>CONCESIONARIO</center></th>"+
				"<th><center>DIRECCION</center></th>"+
				"<th><center>DISTRITO</center></th>"+
				"<th><center>NRO CERTIFICADO</center></th>"+
				"<th><center>FECHA INGRESO</center></th>"+
				"<th><center>NRO GUIA</center></th>";
			var semana = [
				{breve:"LU", completo:"LUNES"},
				{breve:"MA", completo:"MARTES"},
				{breve:"MI", completo:"MIERCOLES"},
				{breve:"JU", completo:"JUEVES"},
				{breve:"VI", completo:"VIERNES"},
				{breve:"SA", completo:"SABADO"}
			];
			
			for(var y=0; y<semana.length; y++){
				var primeraVez=true;
				for(var i=0; i<arrayDatos.length; i++){
					if(semana[y].breve == arrayDatos[i].diaSemanaAtt){
						if(primeraVez){
							tbody = tbody+
							"<tr style='font-size:14px; font-weight:bold;'>"+
							"<td colspan='6'>"+semana[y].completo+"</td>"+
							"<td style='display: none;'></td>"+
							"<td style='display: none;'></td>"+
							"<td style='display: none;'></td>"+
							"<td style='display: none;'></td>"+
							"<td style='display: none;'></td>"+
							"</tr>";
							primeraVez=false;
						}
						tbody = tbody+
						"<tr>"+
							"<td>"+arrayDatos[i].nombreConcesionario+"</td>"+
							"<td>"+quitarEspaciosEnBlanco(arrayDatos[i].direccion)+"</td>"+
							"<td>"+quitarEspaciosEnBlanco(arrayDatos[i].nombreDistrito)+"</td>"+
							"<td><center>"+arrayDatos[i].nroCertificado+"</center></td>"+
							"<td><center>"+arrayDatos[i].fechaOperacion+"</center></td>"+
							"<td><center>"+arrayDatos[i].nroGuiaManual+"</center></td>"+
						"</tr>";
					}
				}
			}
			
			break;
	}	
	$("#idTitulo").html(titulo);
	$("#idAsunto").html(asunto);
	$("#idFecha").html(fechaEmision);
	
	// Cuerpo del reporte
	// cambia la cabecera en funcion
	$("#headerBody").html(headerBody);
	$("#tabla_datos > tbody").html(tbody);
	numerosComoStringEnTablaExcel("tabla_datos");
	$("#tabla_datos").DataTable({
        "searching": false,
        "paging": false,
        "scrollY":"380px",
        "info": false,
        "lengthChange": false,
        "scrollCollapse": false,
        "bSort": false
    });
})
var arrayEstado = {'A':'Anulado', 'R':'Robado', 'V':'Vendido', 'D':'Disponible'};
function obtenerEstado(nroCertificado){
	try{
		var estado='D';
		for(var i=0; i<arrayDatos.length; i++){
			if(arrayDatos[i].nroCertificado==nroCertificado){
				estado = arrayDatos[i].estado;
			}
		}
		return arrayEstado[estado];		
	}catch(err){
		emitirErrorCatch("obtenerEstado")
	}
}