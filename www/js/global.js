var codEventoSeleccionado = parent.codEventoSeleccionado;
//**************************FUNCIONES GENERALES**************************************************************
// TXTGLOBALES
var idDepartamentoDefault="C01";// Departamento de Lima
var mensajeExitoGeneracionTXT="La Generacion del TXT, se realizó satisfactoriamente, Por favor revisar la ruta: TXT/CATS.txt en el servidor";
var mensajeFalloGeneracionTXT="Se presento incoveniente al generar el archivo. Comunicarse con Soporte Tecnico";
var TEXT_GuardarUsuario="¿Esta seguro que desea guardar el usuario?";
var TEXT_IngresoDeUsuarioEfectivo="Se ingresaron los datos del usuario correctamente ";
//*****************************************************************************
var rptaWebservice=new Array(); // contiene la rpta del web service
function reemplazarCaracter(cadena, caracterAReemplazar, Reemplazo ){ // reeemplaza un caracter en una cadena en una o mas ocurrencias
    try{
        return cadena.replace(/-/g, Reemplazo);
    }catch (err){
        var txt = "Se encontro un error en la funcion reemplazarCaracter.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
    }
}
function dateTimeFormat(fecha){ // devuelve fecha en formato YYYY-dd-mm hh:mm:ss (solo se acepta fechas con el formato dd/mm/YYYY HH:mm:ss)
    try{
        if(fecha!=""){
            var partir_fecha=fecha.split(" ");
            var soloFecha=partir_fecha[0].split("/");
            var fechaConvertida=soloFecha[2]+"-"+soloFecha[1]+"-"+soloFecha[0];
            if(partir_fecha.length>1){ // esta fecha tiene asignada hora
                fechaConvertida=fechaConvertida+" "+partir_fecha[1];
            }
            return fechaConvertida;
        }else{
            return fecha;
        }

    }catch(err){
        emitirErrorCatch(err, "dateTimeFormat");
    }
}
function fechaFormateada(fecha, ObtenerMinutos, esDate){ // CONVIERTE UNA VARIABLE STRING O DATE a un string con formato DD/MM/YY hh:mm:ss (Hora es opcional)    
	var salida="01/01/1970";
	if(fecha!=null && fecha!=""){
		if(esDate==true){ // si esDate es true, quiere decir que la fecha es de TIPO DATE
			//var hoy = new Date();
			var año = fecha.getFullYear();
			var mes = agregarCEROaLaIzquierda(fecha.getMonth()+1);
			var dia = agregarCEROaLaIzquierda(fecha.getDate());
			salida=dia+"/"+mes+"/"+año;
			if(ObtenerMinutos==true){ // se requiere usar fecha
				var horas=agregarCEROaLaIzquierda(fecha.getHours());
				var minutos=agregarCEROaLaIzquierda(fecha.getMinutes());
				var segundos=agregarCEROaLaIzquierda(fecha.getSeconds());
				salida=salida+" "+horas+":"+minutos+":"+segundos;
			}
		}else{ // Cambia el formato a la fecha ingresada
			fechaHora=fecha.split(" ");			
			soloFecha=fechaHora[0].split("-");
			salida = soloFecha[2]+"/"+soloFecha[1]+"/"+soloFecha[0];
			if(ObtenerMinutos==true){
				//if(fechaHora[1]!="00:00:00"){
				if(fechaHora.length==2 || fechaHora[1]!="00:00:00"){
					salida=salida+" "+fechaHora[1];
				}
			}						
		}
	}	
    return salida;
}
function alfanumerico(e,eslogin){
    try{
        var key = window.Event ? e.which : e.keyCode 
        if(key==13){
            if(eslogin==true){
                validarLogin();
            }
        }else{
            valorCaracter=String.fromCharCode(key);
            var charpos = valorCaracter.search("[^A-Za-z0-9ñÑ]");
            return ((valorCaracter.length > 0 &&  charpos < 0) || (key==8))
        }
    }catch (err){
        var txt = "Se encontro un error en la funcion alfanumerico.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
    }
}
function alfanumerico1(e,eslogin){
    try{
        var key = window.Event ? e.which : e.keyCode
        valorCaracter=String.fromCharCode(key);
        var charpos = valorCaracter.search("[^A-Za-z0-9ñÑ -.]");
        return ((valorCaracter.length > 0 &&  charpos < 0) || (key==8))
    }catch (err){
        var txt = "Se encontro un error en la funcion Alfanumerico-1.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
    }
}
function agregarCEROaLaIzquierda(numero){ // completa con 0 los numeros menores de 10
    if(numero<10){
        numero='0'+numero;
    }
    return numero;
}
function validarInputsValueXid(IdDeInputs_mensajesAmostrar){ // Valida que un conjunto de elementos inputs que se haya llenado
    try{
        valor=true;
        camposInputs=IdDeInputs_mensajesAmostrar.split("/"); // separa por simbolo '/'
        for(var i=0; i<camposInputs.length; i++){
            inputMessage=camposInputs[i].split("-");// separa el valor del Id del input del mensaje a mostrar
            message=inputMessage[1];// Obtiene el nombre del  input que se mostrara en el mensaje
            variosInputs=inputMessage[0].split("&"); // obtiene si hay mas de un input a validar
            if(variosInputs.length>1){
                input1=$("#"+variosInputs[0]);
                input2=$("#"+variosInputs[1]);
                if(input1.val()=='' && input2.val()==''){
                    valor=false;
                    fancyAlertFunction("Falta completar "+message, function(estado){
                        if(estado){
                            input1.focus();
                        }
                    });
                    break;
                }
            }else{
                input=$("#"+inputMessage[0]);
                if(input.val()=='' || input.val()=='Seleccione'){ // Esta vacio
                    valor=false;
                    fancyAlertFunction("Falta completar el campo "+message, function(estado){
                        if(estado){
                            input.focus();
                        }
                    });
                    break;
                }
            }
        }
        return valor;
    }catch (err){
        var txt = "Se encontro un error en la funcion validarInputsValueXid.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
    }
}
function webService2(funcion, parametros, func){ // FUNCION QUE SE CONECTA AL WEB SERVICE
    try{
        archivoPhp="intranetDB2"; // Nombre del web service
        console.log("Ejecuta consulta al Webservice");
        $.getJSON("webservice?funcion="+funcion+parametros, function(data, estatus){ // envio con JSON y responde
            try{
                console.log("Webservice respondio");
                console.log("Estado: "+estatus);
                rptaWebservice=data;
                eval(func); // ejecuta la funcion
            }catch (err){
                var txt = "Se encontro un error en la funcion webService(rpta)  .\n\n";
                txt += "Error: " + err.message + "\n\n";
                txt += "Click ACEPTAR para continuar.\n\n";
                console.log(txt);
            }
        }).fail(function(jqxhr, textStatus, error) { // web service falla
            console.log("Webservice falló");
            errorMysql=jqxhr.responseText;
            if(errorMysql==""){
                var err="FATAL ERROR: Posible Desconexion de la Red, reintentar!!";
            }else{
                err=errorMysql+". Comunicarse con el soporte técnico.";
            }
            fancyAlert(err);
        });
    }catch (err){
        var txt = "Se encontro un error en la funcion webService2 .\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
    }
}
function webService(funcion, parametros, func){ // FUNCION QUE SE CONECTA AL WEB SERVICE
    try{
        archivoPhp="intranetDB"; // Nombre del web service
        console.log("Ejecuta consulta al Webservice");
        $.getJSON("webservice?funcion="+funcion+parametros, function(data, estatus){ // envio con JSON y responde
            try{
                console.log("Webservice respondio");
                console.log("Estado: "+estatus);
                rptaWebservice=data;
                eval(func); // ejecuta la funcion
            }catch (err){
                var txt = "Se encontro un error en la funcion webService(rpta)  .\n\n";
                txt += "Error: " + err.message + "\n\n";
                txt += "Click ACEPTAR para continuar.\n\n";
                console.log(txt);
            }
        }).fail(function(jqxhr, textStatus, error) { // web service falla
            console.log("Webservice falló");
            errorMysql=jqxhr.responseText;
            if(errorMysql==""){
                var err="FATAL ERROR: Posible Desconexion de la Red, reintentar!!";
            }else{
                err=errorMysql+". Comunicarse con el soporte técnico.";
            }
            fancyAlert(err);
        });
    }catch (err){
        var txt = "Se encontro un error en la funcion webService .\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
    }
}

/// ******************** Funciones usadas con el API DE FANCYBOX ***************************/////////////
function abrirFancyBox(width, height, paginaHtml, valor){ // Abre una pagina html en un iframe usando la libreria fancybox
    if(valor==undefined){
        valor=false;
    }
    $.fancybox(
        {   //'scrolling': 'yes',
            'autoSize' : false,
            'autoScale': false,
            'autoDimensions': false,
            'transitionIn': 'none',
            'transitionOut': 'none',
            'padding':5,
            helpers   : {
                overlay : {closeClick: false} // prevents closing when clicking OUTSIDE fancybox
            },
            keys : {
                // prevents closing when press ESC button
                close  : null
            },
            'closeBtn' : valor, // se muestra o no el boton de cerrar (True o False)
            'width': width,
            'height': height,
            'type': 'iframe',
            'href':paginaHtml+'.html' // Login del supervisor
        }
    );
}
function fancyAlertWait(msg) {// genera mensaje de espera de carga
    jQuery.fancybox({
        'modal' : true,
        'content' : "<div style=\"margin:1px;min-width:280px; min-height: 80px; padding-top: 28px;  font-family: Arial; font-size: 14px; font-weight: bold; \"><center><img style='margin-top: -2px;' src='css/fancybox/source/fancybox_loading.gif'> "+msg+"</center></div>"
    });
}
function fancyAlert(msg) { // muestra mensaje
    jQuery.fancybox({
        'modal' : true,
        'content' : "<div style=\"margin:1px; min-width:280px; min-height: 80px; padding-top: 18px; font-family: Arial; font-size: 14px; font-weight: bold; \">"+msg+"<div style=\"text-align:right;margin-top:10px;\"><input style=\"margin:3px;padding:0px; width:50px; color:#000000;\" type=\"button\" onclick=\"jQuery.fancybox.close();\" value=\"Ok\"></div></div>"
    });
}
function fancyAlertFunction(msg, callback ) { // muestra mensaje y ejecuta una funcion al presionar boton OK
    var ret;
    jQuery.fancybox({
        modal : true,
        content : "<div id=\"confirm\" style=\"margin:1px; min-width:280px; min-height: 80px; padding-top: 18px; font-family: Arial; font-size: 14px; font-weight: bold; \">"+msg+"<div style=\"text-align:right;margin-top:10px;\"><input class=\'confirm ok\' style=\"margin:3px;padding:0px; width:50px; color:#000000;\" type=\"button\" onclick=\"jQuery.fancybox.close();\" value=\"Ok\"></div></div>",
        beforeShow: function() {
            $(".confirm").on("click", function(event){
                if($(event.target).is(".ok")){
                    ret = true;
                    callback.call(this, ret);
                }
            });
        }
    });
}
function fancyConfirm(msg, callback) {// similar a la funcion confirm de javascript
    var ret;
    jQuery.fancybox({
        modal : true,
        content : "<div id=\"confirm\" style=\"margin:1px; min-width:280px; min-height: 80px; padding-top: 18px; font-family: Arial; font-size: 14px; font-weight: bold;\">"+msg+"<div style=\'text-align:right;margin-top:10px;\'><input id=\'fancyConfirm_cancel\' style=\'margin:3px;padding:0px; width:50px; color:#000000;\' type=\'button\' class=\'confirm yes\' value=\'SI\' ><input id=\'fancyConfirm_ok\' style=\'margin:3px;padding:0px; width:50px; color:#000000;\' type=\'button\' class=\'confirm no\' value=\'NO\'></div></div>",
        beforeShow: function() {
            $(".confirm").on("click", function(event){
                if($(event.target).is(".yes")){
                    $.fancybox.close();
                    ret = true;
                    callback.call(this, ret);
                } else if ($(event.target).is(".no")){
                    $.fancybox.close();
                    ret = false;
                    callback.call(this, ret);
                }
            });
        }
    });
}
//*************************************************************************************************///
/* @generarExcelConJqueryYhtml: Exporta un contenido HTML en un archivo Excel
    PARAMETROS:
        1) contentHTML: Contenido HTML a convertir
        2) nombreExcel: Nombre del Excel
*/
function generarExcelConJqueryYhtml(contentHTML, nombreExcel){
    try{
        $("body").append("<a id='downloadExcel'>Descarga</a>"); // Implementado para hacerlo compatible con mozilla
        var a = document.getElementById("downloadExcel");
        a.target='_blank';
        a.href='data:application/vnd.ms-excel,' + escape(contentHTML); // Tambien pudo hacerse con el siguiente href:  a.href='data:application/vnd.ms-excel,' + escape(contentHTML);
        a.download=nombreExcel+".xls";
        a.click();
        a.remove();
        return true;
    }catch (err){
        var txt = "Se encontro un error en la funcion generarExcelConJquery\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function ingresarLog(descripcion, idUsuario){
    try{
        var parametros="&idUsuario="+idUsuario+
        "&descripcion="+descripcion;
        consultarWebServiceGet("registrarAccionUsuario", parametros, function(data){}, false);
    }catch (err){
        emitirErrorCatch(err, "ingresarLog")
    }
}
function cargarPerfiles(data, idSelect, bloquear){ // carga los perfiles en select con 
    try{
        for(var i=0; i<data.length;i++){
            if(bloquear=='B'){// Bloquear
                if(data[i].idPerfil!='2' && data[i].idPerfil!='1'){
                    $("#"+idSelect).append(new Option(data[i].nombrePerfil, data[i].idPerfil));
                }
            }else{
                $("#"+idSelect).append(new Option(data[i].nombrePerfil, data[i].idPerfil));
            }
        }
        $.fancybox.close();
    }catch (err){
        emitirErrorCatch(err, "cargarPerfiles")
    }
}
function emitirErrorCatch(err, nombre_funcion){
    try{
        var txt = "Se encontro un error en la funcion "+nombre_funcion+"\n\n";
        txt += "Error: " + err.message +"\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        //fancyAlert(txt);
        alert(txt);
        return;
    }catch(err){
        emitirErrorCatch(err, "emitirErrorCatch");
    }
}
function abrirBusquedaAvanzada(){
    try{
        abrirFancyBox("750", "500", "busquedaavanzada", true);
    }catch(err){
        emitirErrorCatch(err, "abrirBusquedaAvanzada");
    }
}
/* @cargarListaDeAccidentes: Obtiene los eventos filtrandolos por su clasificación (Recupero / No Recupero) y su Estado de Gestion. (Pendiente, Notificado, En Cobranza, Condonado, Terminado)
    PARAMETROS:
        estado: estado de Gestion.
*/
function cargarListaDeAccidentes(dataFiltro, registrosXpagina, cantPaginas, pagina, paginacion){
    try{	
        fancyAlertWait("Cargando");        
		if(pagina==undefined || pagina==0){
			pagina=1;
		}
        var parametros="&page="+pagina+
			"&cantPaginas="+cantPaginas+
			"&registrosxpagina="+registrosXpagina;
		// filtros de busqueda:
		parametros=parametros+"&estado="+dataFiltro.idEstado+
            "&esRecupero="+dataFiltro.idTipoEvento+
			"&codEvento="+dataFiltro.codEvento+
			"&nroCAT="+dataFiltro.nroCAT+
			"&placa="+dataFiltro.placa+
			"&fechaDesde="+dateTimeFormat(dataFiltro.fechaDesde)+
			"&fechaHasta="+dateTimeFormat(dataFiltro.fechaHasta);
		
		paginacion.dataFiltro=dataFiltro;
		
        consultarWebServiceGet("getEventosGeneralesMantenimiento", parametros, function(data){
			cargarTablaAccidentes(data, paginacion);
		});
    }catch(err){
        emitirErrorCatch(err, "cargarListaDeAccidentes"); // emite error
    }
}
var datatableEventos; 
var arrayEventos;  
function cargarTablaAccidentes(rptaWebservice, paginacion){
    try{
        arrayEventos=rptaWebservice;
        if(datatableEventos!=undefined){
            datatableEventos.destroy();
            $('#tabla_datos > tbody').html("");
        }
        for(var i=0; i<rptaWebservice.length; i++){
            var fecha=rptaWebservice[i].fechaevento;
            if(fecha==undefined){
                fecha="0000-00-00";
            }
            var nombreAsociado=rptaWebservice[i].nombreAsociado+" "+rptaWebservice[i].apePatAsociado+" "+rptaWebservice[i].apeMatAsociado;
            if(rptaWebservice[i].tipoPersonaAsociado=="J"){ // Juridico
                nombreAsociado=rptaWebservice[i].razonSocial;
            }			
            $("#tabla_datos > tbody").append("<tr id='tr_"+i+"' style='height:30px; font-size:11.5px; font-family:Arial; cursor:pointer;' onclick='seleccionarFila("+'"'+i+'"'+")' >"+
                "<td style='vertical-align: middle; '><center>"+rptaWebservice[i].numcentral+"</center></td>"+
                "<td style='vertical-align: middle; text-align:center;'>"+fechaFormateada(fecha, false, false)+"</td>"+				
                "<td style='vertical-align: middle;'><center>"+rptaWebservice[i].placa+"</center></td>"+
                "<td style='vertical-align: middle;'><center>"+rptaWebservice[i].cat+"</center></td>"+
                "<td style='vertical-align: middle;'>"+nombreAsociado+"</td>"+
                "<td style='vertical-align: middle;'>"+rptaWebservice[i].lugarsiniestro+"</td>"+
                "</tr>");
        }
		var orderBy = 0;
		if(arrayEventos.length>0){
			orderBy=arrayEventos[0].orderBy;
		}		
        datatableEventos=$('#tabla_datos').DataTable({
            "searching": false,
            "paging": false,
            "scrollY":"345px",
            "pagingType": "simple",
            "info":     false,
            "lengthChange": false,
            "scrollCollapse": false,
            "language": {
                "search": "Buscar:",
                "lengthMenu": "Visualizar _MENU_ por pag.",
                "zeroRecords": "Ningun Resultado - Lo Sentimos :(",
                "info": "Pag _PAGE_ de _PAGES_",
                "infoEmpty": "No Disponible",
                "infoFiltered": "(Filtrado de _MAX_ registros)"
            },
            "order": [[ orderBy, "desc" ]],
            //"bSort": false,
            "columns": [
                { "width": "8%" },
                { "width": "9%", "type":"date-eu" },
                { "width": "8%" },
                { "width": "9%" },
                { "width": "33%" },
                { "width": "33%" }
            ],
            "fnDrawCallback": "",
			"initComplete":function(){
				if(arrayEventos.length>0){
					var numeroPaginas = arrayEventos[0].numeroPaginas;
					if(typeof numeroPaginas != "undefined"){
						paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){
							paginacion.paginaActual=page;
							cargarListaDeAccidentes(paginacion.dataFiltro, paginacion.registrosXpagina, paginacion.cantPaginas, page, paginacion);
						});
					}
				}else{
					paginacion.cargarPaginacion(0, "pagination");
				}								
			}
        });
        $('#tabla_datos').on("search.dt", function(){
            borrarFilaSeleccionada();
        });
		borrarFilaSeleccionada();
        $.fancybox.close();  

    }catch(err){
        emitirErrorCatch(err, "cargarTablaAccidentes"); // emite error
    }
}
var datosExcelDescargar;
function reemplazarNullXpuntos(variable){ // reemplaza un valor null por ... (3 puntos);
    if(variable==null){
        variable="";
    }    
    return variable.trim();
}
/* @descargarReporteExelNotificaciones: Emite el doc. PDF de cada notificacion registrada.
*/
function descargarReporteExelNotificaciones(){ // Descarga excel de notificaciones
    try{
    fancyAlertWait("descargando reporte");
        // declara un arreglo con los meses del año:
        var arraymeses=["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];            
        var fechaEmision=parent.fechaEnvioNotificaciones;
        //fechaEmision=fechaEmision.split("/");
        //fechaEmision="Lima "+fechaEmision[0]+" de "+arraymeses[parseInt(fechaEmision[1])-1]+" del "+fechaEmision[2];
        var arrayActual=parent.notificacionEventoActual;// recibe el objeto del evento
        //----------------DATOS DEL EVENTO---------------------------
        var codEvento=arrayActual.codEvento;            
        var placa=arrayActual.placa;
        var lugarAccidente=reemplazarNullXpuntos(arrayActual.lugarAccidente);
        var nombrechofer=arrayActual.nombresChofer+" "+arrayActual.apellidoPaternoChofer+" "+arrayActual.apellidoMaternoChofer;
        var dnichofer = reemplazarNullXpuntos(arrayActual.dniChofer);
        var fechaevento=arrayActual.fechaAccidente;
        var fechaAccidente=fechaevento.split(" ")[0];
        var horasAccidente=fechaevento.split(" ")[1];
        var nroCAT=arrayActual.nroCAT;
        var causal1=reemplazarNullXpuntos(arrayActual.causal1); // causa 1
        var causal2=reemplazarNullXpuntos(arrayActual.causal2); // causa 2
        var distritoEvento=arrayActual.distritoEvento; // distrito del evento
        var arrayDestinatarios=parent.destinatariosNotificaciones; // lista de destintarios
        for(var i=0; i<arrayDestinatarios.length; i++){
            var idNotificacion = arrayDestinatarios[i].idNotificacion;
            var nombreDestinatario=arrayDestinatarios[i].nombre;
            var direccionDestinatario=arrayDestinatarios[i].direccion;
            var distrito=arrayDestinatarios[i].distrito;
            if(distrito!=null && distrito!=''){
                direccionDestinatario=direccionDestinatario+", "+distrito.toUpperCase();
            }            
            var parametros="&codEvento="+codEvento+
                "&placa="+placa+
                "&lugarAccidente="+lugarAccidente+
                "&nombrechofer="+nombrechofer+
                "&dnichofer="+dnichofer+
                "&fechaevento="+fechaevento+
                "&fechaAccidente="+fechaAccidente+
                "&horasAccidente="+horasAccidente+
                "&nroCAT="+nroCAT+
                "&causal1="+causal1+
                "&causal2="+causal2+
                "&distritoEvento="+distritoEvento+
                "&idNotificacion="+idNotificacion+
                "&destinatario="+nombreDestinatario+
                "&direccionDestinatario="+direccionDestinatario+
                "&fechaImpresion="+fechaEmision;
            window.open("webservice?funcion=eventoPDF"+parametros,'_blank');
        }
        parent.$.fancybox.close();
    }
    catch(err){
        emitirErrorCatch(err, "descargarReporteExelNotificaciones"); // emite error
    }
}
function continuarDescargarExcel(){
    try{
        var nombresAgraviados="";
        for(var i=0; i<rptaWebservice.length; i++){
            if(i>0){
                nombresAgraviados=nombresAgraviados+", ";
            }
            nombresAgraviados=nombresAgraviados+rptaWebservice[i].nombres+" "+rptaWebservice[i].apellidoPaterno+" "+rptaWebservice[i].apellidoMaterno;
        }
        Object.defineProperty(datosExcelDescargar, "agraviados",{
                                value: 101,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
        datosExcelDescargar.agraviados=nombresAgraviados;
        var parametros="&codEvento="+parent.codigoEventoNotificacion;
        webService2("getGastos", parametros, "continuarDescargar()");       
    }catch(err){
        emitirErrorCatch(err, "continuarDescargarExcel"); // emite error
    }
}
function continuarDescargar(){
    try{
        var gastosIncurridos="";
        var gastoTotal=0;
        for(var i=0; i<rptaWebservice.length; i++){
            if(i>0){
                gastosIncurridos=gastosIncurridos+", ";
            }
            if(rptaWebservice[i].idTipoGasto==4){
                gastosIncurridos=gastosIncurridos+"asumió la cobertura de ";
            }else{
                gastosIncurridos=gastosIncurridos+"pago por ";
            }
            gastosIncurridos=gastosIncurridos+rptaWebservice[i].descripcion+" por el monto de S/. "+rptaWebservice[i].montoGasto;
            gastoTotal=gastoTotal+parseFloat(rptaWebservice[i].montoGasto);
        }
        Object.defineProperty(datosExcelDescargar, "gastosIncurridos",{
                                value: gastosIncurridos,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
        Object.defineProperty(datosExcelDescargar, "montoTotal",{
                                value: gastoTotal,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
        // Prepara excel para descargar
        var contentHTML="<table border='0' style='font-size: 14px; font-family: Arial;'>"+ // contiene el contenido en la tabla excel
            "<thead style='background-color: #38C55B;'>" +
            "<th><center><strong>CodigoNotificacion</strong></center>" +
            "<th><center><strong>codEvento</strong></center>" +
            "<th><center><strong>destinatario</strong></center>" +
            "<th><center><strong>direccion</strong></center>" +
            "<th><center><strong>distrito</strong></center>" +
            "<th><center><strong>placa</strong></center>" +
            "<th><center><strong>cat</strong></center>" +
            "<th><center><strong>fechaevento</strong></center>" +
            "<th><center><strong>Horaevento</strong></center>" +
            "<th><center><strong>fechaenvio</strong></center>" +
            "<th><center><strong>gastos</strong></center>" +
            "<th><center><strong>gatoTotal</strong></center>" +
            "<th><center><strong>lugarsiniestro</strong></center>" +
            "<th><center><strong>nombrechofer</strong></center>" +
            "<th><center><strong>dnichofer</strong></center>" +
            "<th><center><strong>agraviados</strong></center>" +
            "<th><center><strong>causa1</strong></center>" +
            "<th><center><strong>causa2</strong></center>" +
            "</thead>"+
            "<tbody>";
            var arrayDestinatarios=datosExcelDescargar.arrayDestinatarios;
            for(var i=0; i<arrayDestinatarios.length; i++){
                contentHTML+="<tr style='font-size: 12px; '>" +
                "<td align='left'>"+arrayDestinatarios[i].idNotificacion+"</td>" +
                "<td align='left'>"+datosExcelDescargar.codEvento+"</td>" +
                "<td align='left'>"+arrayDestinatarios[i].nombre+"</td>" +
                "<td align='left'>"+arrayDestinatarios[i].direccion+"</td>" +
                "<td align='left'>"+datosExcelDescargar.distritoEvento+"</td>" +
                "<td align='left'>"+datosExcelDescargar.placa+"</td>" +
                "<td align='left'>"+datosExcelDescargar.nroCAT+"</td>" +
                "<td align='left'>"+datosExcelDescargar.fechaAccidente+"</td>" +
                "<td align='left'>"+datosExcelDescargar.horasAccidente+"</td>" +
                "<td align='left'>"+datosExcelDescargar.fechaEmision+"</td>" +
                "<td align='left'>"+datosExcelDescargar.gastosIncurridos+"</td>" +
                "<td align='left'>"+datosExcelDescargar.montoTotal+"</td>" +
                "<td align='left'>"+datosExcelDescargar.lugarAccidente+"</td>" +
                "<td align='left'>"+datosExcelDescargar.nombrechofer+"</td>" +
                "<td align='left'>"+datosExcelDescargar.dnichofer+"</td>" +
                "<td align='left'>"+datosExcelDescargar.agraviados+"</td>" +
                "<td align='left'>"+datosExcelDescargar.causal1+"</td>" +
                "<td align='left'>"+datosExcelDescargar.causal2+"</td>" +
                "</tr>";
            }
            contentHTML+="</tbody></table>";
            var nombreExcel="notificaciones";
            generarExcelConJqueryYhtml(contentHTML, nombreExcel);
            parent.$.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "continuarDescargar"); // emite error
    }
}
/* @BuscarEventoGeneral: Realiza la busqueda de los eventos en funcion a los parámetros que se envian.
    PARAMETROS:
        1) parametros: cadena de parametros para la busqueda.
        2) funcion: funcion web service que se ejecutara despues de obtener el response.
        3) domicilioLegal: Si su valor es  2; se consultara al web service "getEventosGeneralesDomicilioLegal":
            que adicionalmente obtiene la informacion del domicilio legal de los responsables de un accidente.
*/
function BuscarEventoGeneral(parametros, funcion, domicilioLegal) {
    try{
        if(domicilioLegal==undefined){
            domicilioLegal=1;
        }
        var funcionWeb="getEventosGenerales"; // Busca evento generales incluyendo las direcciones de los responsables (donde viven)
        if(domicilioLegal==2){
            funcionWeb="getEventosGeneralesDomicilioLegal"; // Busca eventos generales incluyendo la dirección de los responsables (donde viven) y su direcciones juridicas
        }
        webService2(funcionWeb, parametros, funcion);

    }catch(err){
        emitirErrorCatch(err, "BuscarEventoGeneral");
    }
}
///***** mejorando *****
var arrayCuotasCronograma=new Array();
//**** CONJUNTO DE FUNCIONES PARA MOSTRAR LA INFORMACION DE LOS ACUERDOS EN EL MODULO DE CONTROL DE ACUERDOS:
var funcionUltima; // en esta variable se guardara la ultima funcion en ejecutarse despues de haberse cargado toda la informacion del acuerdo
var arrayInfoAcuerdo; // guarda en memoria toda la informacion del acuerdo
var dataTableResponsables=undefined; // Guarda la informacion datable de los responsables

/* @cargarInfoAcuerdo: Carga la informacion del evento que se selecciono en la ventana de "Busqueda de Acuerdos"
    PARAMETROS:
        1) data: Informacion del acuerdo seleccionado.
*/
function cargarInfoAcuerdo(data) { // obtiene toda la informacion del acuerdo
    try{
        var infoAcuerdo=data[0];
        cargarSoloInfoAcuerdo(infoAcuerdo)
    }catch(err){
        emitirErrorCatch(err, "cargarInfoAcuerdo")
    }
}

/*  @cargarSoloInfoAcuerdo:Carga la informacion 
*/
function cargarSoloInfoAcuerdo(infoAcuerdo) { // Carga solo la informacion de los acuerdos
    try{
        //carga info acuerdo
        $("#idLblAcuerdo").val(infoAcuerdo.idAcuerdo)
        $("#idLblFechaAcuerdo").val(infoAcuerdo.fechaAcuerdo)
        $("#idLblDeudaAcordada").val(infoAcuerdo.deudaAcordada)
        $("#idLblDeudaAcordada").prop("title", "GASTOS ADMINISTRATIVOS: S/. "+infoAcuerdo.gastosAdministrativos)
		$("#idLblCuotaInicial").val(infoAcuerdo.cuotaInicial)
        // carga info evento
        $("#idLblCodEvento").val(infoAcuerdo.codEvento)
        $("#idLblFechaEvento").val(infoAcuerdo.fechaAccidente)
        $("#idLblDescripcion").val(infoAcuerdo.descripcion)
        // carga info asociado
        $("#idLblNroCAT").val(infoAcuerdo.nroCAT)
        $("#idLblAsociado").val(infoAcuerdo.asociado)
        $("#idLblPlaca").val(infoAcuerdo.placa)
        // carga lista de responsables
        arrayInfoAcuerdo=infoAcuerdo;
        var parametros="&idAcuerdo="+infoAcuerdo.idAcuerdo;
        consultarWebServiceGet("getReponsablesByAcuerdo", parametros, cargarListaResponsables)
    }catch (err){
        emitirErrorCatch(err, "cargarSoloInfoAcuerdo")
    }
}

/*@cargarListaResponsables: Carga la lista de responsables del acuerdo en una TABLA HTML.
*/
function cargarListaResponsables(data){ // Carga la informacion de los responsables para despues cargar la funcionUltima
    try{
        var responsables=data[0];        
        var listaResponsablesArray=new Array();
        if(responsables.idPersonaAsociado>0){ // existe asociado com responsable de pago
            // Asociado es valido
            var nombreAsociado="";
            switch (responsables.tipoPersonaAsociado){
                case 'N':
                    nombreAsociado=verificaNull(responsables.nombreAsociado);
                    break;
                case 'J':
                    nombreAsociado=verificaNull(responsables.razonAsociado);
                    break;
            }
            listaResponsablesArray[listaResponsablesArray.length]={idPersona: responsables.idPersonaAsociado, nombre:nombreAsociado, nroDoc:responsables.nroDocAsociado, rol:"Asociado"};
        }
        if(responsables.idPersonaPropietario>0){
            if(responsables.idPersonaPropietario!=responsables.idPersonaAsociado){ // propietario tb es responsable de pago
                var nombrePropietario="";
                switch (responsables.tipoPersonaPropietario){
                    case 'N':
                        nombrePropietario=verificaNull(responsables.nombrePropietario);
                        break;
                    case 'J':
                        nombrePropietario=verificaNull(responsables.razonPropietario)
                        break;
                }
                listaResponsablesArray[listaResponsablesArray.length]={idPersona: responsables.idPersonaPropietario, nombre:nombrePropietario, nroDoc:responsables.nroDocPropietario, rol:"Propietario"};
            }
        }
        if(responsables.idPersonaChofer>0){            
            if(responsables.idPersonaChofer!=responsables.idPersonaPropietario && responsables.idPersonaChofer!=responsables.idPersonaAsociado){ // chofer como responsable de pago
                listaResponsablesArray[listaResponsablesArray.length]={idPersona: responsables.idPersonaChofer, nombre:verificaNull(responsables.nombreChofer), nroDoc:responsables.nroDocChofer, rol:"Chofer"};
            }
        }
        if(responsables.idPersonaFinal>0){ // existe pagador Final
            listaResponsablesArray[listaResponsablesArray.length]={idPersona: responsables.idPersonaFinal, nombre:verificaNull(responsables.nombreFinal), nroDoc:responsables.nroDocFinal, rol:"Pagador Final"};
        }
        var dataCampoAlign=[
            {campo:'nombre', alineacion:'justify'},
            {campo:'nroDoc', alineacion:'center'},
            {campo:'rol', alineacion:'center'}];
        if(dataTableResponsables!=undefined){
            dataTableResponsables.destroy();
        }
        crearFilasHTML("tabla_datos_responsables", listaResponsablesArray, dataCampoAlign, false, 12);
        var columWithArray=[
            { "width": "60%"},
            { "width": "20%"},
            { "width": "20%"}
        ];
        dataTableResponsables=parseDataTable("tabla_datos_responsables", columWithArray, 130, false, true);
        arrayInfoAcuerdo.responsables=listaResponsablesArray; // Guarda los responsables
        $("#idBtnBuscarAcuerdo").val("Cancelar"); // Cambia de nombre el boton de  Buscar Acuerdo
        $("#oculta").css("display", "none");
        // carga ultima funcion
        var tipo=typeof funcionUltima;
        if(tipo=="function"){
            funcionUltima();
        }else{
            $.fancybox.close();
        }
    }catch(err){
        emitirErrorCatch(err, "cargarListaResponsables")
    }
}
function cancelarTareaControlPago(){
    try{
        fancyConfirm("¿ Esta seguro que desea cancelar ?", function(estado){
            if(estado){
                // Limpia toda la informacion del acuerdo y vuelve abrir
                $("#idBtnBuscarAcuerdo").val("Buscar Acuerdo");
                $("#oculta").css("display", "block");
            }
        })
    }catch(err){
        emitirErrorCatch(err, "cancelarTareaControlPago")
    }
}
/* @generarPDF: Genera un reporte PDF para cronograma de cuotas pendientes/Estado de cuenta de las cuotas / Orden de Pago y Pago de cuotas.
    PARAMETROS:
        1) modulo: tipo de Reporte (1: Cronogram de cuotas pendientes / 2: Estado de cuentas / 3: Orden de pago / 4: Pago de cuotas)
        2) idPersona: Persona responsable de generar el pago.
        3) idCuotas: Cuotas que se pagaran 
*/
function generarPDF(modulo, idPersona, idCuotas) { // CONTROL DE PAGOS
    try{        
        // informacion solo del acuerdo        
        var parametros="&idAcd="+arrayInfoAcuerdo.idAcuerdo+ // idAcuerdo
            "&fecAcd="+arrayInfoAcuerdo.fechaAcuerdo+ // fecha del acuerdo
            "&fecha_Emision="+$("#idLblFechaEmision").val()+ // fecha de emision            
            "&deuAcd="+arrayInfoAcuerdo.deudaAcordada+ // deuda del acuerdo
            "&codEve="+arrayInfoAcuerdo.codEvento+
            "&fecEve="+arrayInfoAcuerdo.fechaAccidente+
            "&desEve="+arrayInfoAcuerdo.descripcion+
            "&nroCAT="+arrayInfoAcuerdo.nroCAT+
            "&asoc="+$("#idLblAsociado").val()+
            "&placa="+arrayInfoAcuerdo.placa;
        if(idPersona!=undefined){
            parametros=parametros+"&idPersona="+idPersona;
        }
        if(idCuotas!=undefined){
            parametros=parametros+"&idCuotas="+idCuotas;
        }
        window.open("webservice?funcion=docPDF&num="+modulo+parametros,'_blank');
    }catch(err){
        emitirErrorCatch(err, "generarPDF")
    }
}
// Funciones para generar combobox de Departamento, provincia y distrito
/* @cargarEventoComboDepa: CREA UN EVENTO ONCHANGE EN EL COMBOBOX DE DEPARTAMENTO PARA QUE POR MEDIO DE ESTE, SE PUEDA CARGAR EL COMBOBOX DE PROVINICIAS, con los provincias correspondientes del departamento seleccionado.
    PARAMETROS: 
        1) prefijo : Prefijo del id del combobox del departamento, estos pueden ser (Asociado, Propietario, Chofer, accidente)
        2) arrayProvincias: Lista de Provincias
*/
function cargarEventoComboDepa(prefijo, arrayProvincias){ // CREA EVENTO CHANGE PARA MOSTRAR LAS PROVINCIAS DE UN DEPARTAMENTO
    try{
        $("#idDepartamento_"+prefijo).change(function(){
            var valor=this.value;
            if(valor==""){
                $("#idProvincia_"+prefijo).html("");
                $("#idProvincia_"+prefijo).append(new Option("Seleccione", ""));
                $("#idProvincia_"+prefijo).val("") // Limpia campo
                $("#idProvincia_"+prefijo).select2()
                $("#idDistrito_"+prefijo).html("");
                $("#idDistrito_"+prefijo).append(new Option("Seleccione", ""));
                $("#idDistrito_"+prefijo).val("")
                $("#idDistrito_"+prefijo).select2()
                var tipoPersona="";
                switch(prefijo){
                    case "a":
                        tipoPersona="Asociado";
                        break;
                    case "p":
                        tipoPersona="Propietario";
                        break;
                    case "c":
                        tipoPersona="Chofer";
                        break;
                }
                if(tipoPersona!=""){
                    fancyAlert("Debe seleccionar un departamento para el "+tipoPersona);    
                }else{
                    fancyAlert("Debe seleccionar un departamento");
                }
                
            }else{
                cargarListaProvincias(prefijo, arrayProvincias)
            }                        
        });
    }catch(err){
        emitirErrorCatch(err, "cargarEventoComboDepa")
    }
}


/* @cargarEventoComboProv: CREA UN EVENTO ONCHANGE EN EL COMBOBOX DE PROVINCIA PARA QUE POR MEDIO DE ESTE, SE PUEDA CARGAR EL COMBOBOX DE DISTRITOS, con los distritos correspondientes de la provincia seleccionada.
    PARAMETROS: 
        1) prefijo : Prefijo del Nombre del combobox de la provincia, estos pueden ser (Asociado, Propietario, Chofer, accidente)
        2) arrayDistritos: Lista de Distritos
*/
function cargarEventoComboProv(prefijo, arrayDistritos){ 
    try{
        $("#idProvincia_"+prefijo).change(function(){
            var valor=this.value;
            if(valor==""){
                $("#idDistrito_"+prefijo).html("");
                $("#idDistrito_"+prefijo).append(new Option("Seleccione", ""));                     
                $("#idDistrito_"+prefijo).val("")
                $("#idDistrito_"+prefijo).select2()
                var tipoPersona="";
                switch(prefijo){
                    case "a":
                        tipoPersona="Asociado";
                        break;
                    case "p":
                        tipoPersona="Propietario";
                        break;
                    case "c":
                        tipoPersona="Chofer";
                        break;
                    case 'ac':
                        tipoPersona="accidente";
                        break;
                }
                fancyAlert("Debe seleccionar una provincia para el "+tipoPersona);
            }else{
                cargarListaDistritos(prefijo, arrayDistritos)
            }            
        })
    }catch(err){
        emitirErrorCatch(err, "cargarEventoComboProv")
    }
}

/* @listarDepartamentos: Lista los departamentos
    PARAMETROS:
        1) datos: Lista de Departamentos
        2) prefijo: Prefijo del combobox
*/
function listarDepartamentos(datos, prefijo){ // lISTA LOS DEPARTAMENTOS
    try{
        for(var i=0; i<datos.length; i++){
            $("#idDepartamento_"+prefijo).append(new Option(datos[i].nombreDepartamento, datos[i].idDepartamento));
        }       
        $("#idDepartamento_"+prefijo).select2() // agrega plugin select2
    }catch(err){
        emitirErrorCatch(err, "listarDepartamentos")
    }
}

/* @cargarListaProvincias: Carga la lista de provincias en el combobox de Provincias
    PARAMETROS:
     - prefijo: Prefijo del combobox de provincia donde se cargara la lista de provincias
     - arrayProvincias: Lista de provincias.
     - valorDepa: Departamento de donde se filtraran las provincias a listar (Por defecto es el Departamento de Lima)
*/
function cargarListaProvincias(prefijo, arrayProvincias, valorDepa){
    try{
        $("#idProvincia_"+prefijo).val("") // Limpia campo
        $("#idProvincia_"+prefijo).select2()
        $("#idDistrito_"+prefijo).val("")
        $("#idDistrito_"+prefijo).select2()
        if(valorDepa==undefined){
            var valor=$("#idDepartamento_"+prefijo).val();    
        }else{
            var valor=valorDepa;
        }
        
        // carga la lista de provincias
        $("#idProvincia_"+prefijo).html("");
        $("#idProvincia_"+prefijo).append(new Option("Seleccione", ""));
        for(var i=0; i<arrayProvincias.length; i++){
            if(arrayProvincias[i].idDepartamento==valor){ // busca todas las provincias del departamento
                $("#idProvincia_"+prefijo).append(new Option(arrayProvincias[i].nombreProvincia, arrayProvincias[i].idProvincia));
            }
        }
        $("#idProvincia_"+prefijo).select2();
    }catch(err){
        emitirErrorCatch(err,"cargarListaProvincias")
    }
}
/* @cargarListaDistritos: Llena los distritos correspondientes (en el combobox Distrito) de la provincia seleccionada
    PARAMETROS:
        1) prefijo: prefijo del combobox del distrito (Asociado, Propietario, Chofer, accidente), ambos combobox Provincia y distrito deben tener el mismo prefijo.
        2) arrayDistritos: Lista de distritos total 
*/
function cargarListaDistritos(prefijo, arrayDistritos){
    try{
        $("#idDistrito_"+prefijo).val("")
        $("#idDistrito_"+prefijo).select2();
        var valor=$("#idProvincia_"+prefijo).val();
        // carga lista distritos
        $("#idDistrito_"+prefijo).html("");
        $("#idDistrito_"+prefijo).append(new Option("Seleccione", ""));
        for(var i=0; i<arrayDistritos.length; i++){
            if(arrayDistritos[i].idProvincia==valor){
                $("#idDistrito_"+prefijo).append(new Option(arrayDistritos[i].nombre, arrayDistritos[i].idDistrito));
            }
        }
        $("#idDistrito_"+prefijo).select2();                
    }catch(err){
        emitirErrorCatch(err,"cargarListaDistritos")
    }
}
function quitarEspaciosBlanco(valor){
    try{
        if(valor==null){
            valor='';
        }
        if(valor!=undefined){
            valor=valor.trim()
        }
        return valor;
    }catch(err){
        emitirErrorCatch(err, "quitarEspaciosBlanco")
    }
}
/* realiza una busqueda de forma general y los resultados son mostrados en un combobox: donde flag */
var flagBusqueda;
function busquedaCombo(flag, DAO, funcionWebService, arrayCampos, callback){ 
	try{
		var stringBusqueda = $("#txtBusqueda_"+flag).val().trim();
		if(stringBusqueda==""){
			flagBusqueda = flag;
			fancyAlertFunction("Campo de Busqueda no puede ser vacio", function(){
				$("#txtBusqueda_"+flagBusqueda).focus();
			})
			return;
		}
		var parametros = "&stringBusqueda="+stringBusqueda;
		DAO.consultarWebServiceGet(funcionWebService, parametros, function(data){
			if(typeof callback == 'undefined'){
				listarResultadosCombo(data, flag, arrayCampos);
			}else{
				callback(data,flag, arrayCampos);
			}			
		});
	}catch(err){
		emitirErrorCatch(err, "busquedaCombo")
	}
}
function listarResultadosCombo(data, flag, arrayCampos){
	try{
		var id_combo = "cmb_"+flag;
		var campos =  {"keyId":arrayCampos[0], "keyValue":arrayCampos[1]}
		agregarOpcionesToCombo(id_combo, data, campos);
		openSelect($("#"+id_combo)); // abre el combobox completado
		//$("#"+id_combo).simulate('mousedown');
		$.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "listarResultadosCombo")
	}
}

// frameWork para los distrito y provincias:
var idProvinciaSelect="",idProvinciaSelect1="";
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var arrayDepartamentos=new Array();

function cargarProvinciasDep(prefijo, idProvincia, button){
    try{
        var item=$("#idDistrito_"+prefijo).val();
        if(item=='OTRP' || button=="button"){ //Otra Provincia
            //idProvinciaSelect=idProvincia;
            abrirVentanaFancyBox(400, 220, "provdepa", true, function(data){
                if(data!=undefined){
                    idProvinciaSelect=data[0].provincia;
                    cargarDistritos(prefijo, idProvinciaSelect);
                }else{ // No se completo
                    $("idDistrito_"+prefijo).val("");
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "cargarProvinciasDep");
    }
}
function cargarProvinciasDep1(prefijo, idProvincia, button){ //ventana alterna
    try{
        var item=$("#idDistrito_"+prefijo).val();
        if(item=='OTRP' || button=="button"){ //Otra Provincia
            //idProvinciaSelect=idProvincia;
            abrirVentanaFancyBox(400, 220, "provdepa", true, function(data){
                if(data!=undefined){
                    idProvinciaSelect1=data[0].provincia;
                    cargarDistritos(prefijo, idProvinciaSelect1);
                }else{ // No se completo
                    $("idDistrito_"+prefijo).val("");
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "cargarProvinciasDep");
    }
}
function cargarDistritos(prefijo, idProvincia){
    try{
        $("#idDistrito_"+prefijo).html("");
        $("#idDistrito_"+prefijo).append(new Option("Seleccione", ""));
        for(var i=0; i<arrayDistritos.length; i++){
            if(arrayDistritos[i].idProvincia==idProvincia){
                $("#idDistrito_"+prefijo).append(new Option(arrayDistritos[i].nombre, arrayDistritos[i].idDistrito))
            }
        }
        $("#idDistrito_"+prefijo).append("<option value='OTRP'>Otra Provincia</option>"); // OTRP=Otra Provincia
        $("#idDistrito_"+prefijo).select2();
        var nombreProvincia = "";
        var nombreDepartamento = "";
        for(var y=0; y<arrayProvincias.length; y++){
            if(arrayProvincias[y].idProvincia==idProvincia){
                nombreProvincia=arrayProvincias[y].nombreProvincia;
                for(var z=0; z<arrayDepartamentos.length;z++){
                    if(arrayDepartamentos[z].idDepartamento==arrayProvincias[y].idDepartamento){
                        nombreDepartamento=arrayDepartamentos[z].nombreDepartamento;
                        break;
                    }
                }
                break;
            }
        }
        labelTextWYSG("wb_label_"+prefijo, "Dpto: "+nombreDepartamento+", Prov: "+nombreProvincia);
    }catch(err){
        emitirErrorCatch(err, "cargarDistritos")
    }
}
function buscarNosocomio(keyAgraviado, idConTipoNosocomio, callback){
    try{
		if(keyAgraviado!=undefined && keyAgraviado!=""){
			keyAgraviado="_"+keyAgraviado;
		}else{
			keyAgraviado="";
		}
        if($("#buscarNosocomio"+keyAgraviado).val()!=""){
            var parametros = "&nosocomio="+$("#buscarNosocomio"+keyAgraviado).val();
            DAO.consultarWebServiceGet("getNosocomioByNombre", parametros, function(data){
                var idKey;
				if(idConTipoNosocomio){
					for(var i=0; i<data.length;i++){
						data[i].idCompuesto = data[i].idNosocomio+"-"+data[i].tipo;
					}
					idKey = "idCompuesto";
				}else{
					idKey = "idNosocomio";
				}				
                agregarOpcionesToCombo("idNosocomio"+keyAgraviado, data, {"keyId":idKey, "keyValue":"nombre"});
                //$("#idNosocomio"+keyAgraviado).focus();				
                openSelect($("#idNosocomio"+keyAgraviado));
				$.fancybox.close();
				if(typeof callback == 'function'){
					callback(keyAgraviado);
				}
            });
        }else{
            fancyAlertFunction("¡Debe ingresar el nosocomio a buscar!", function(rpta){
                if(rpta){
                    $("#buscarNosocomio"+keyAgraviado).focus();
                }
            })
        }
    }catch(err){
        emitirErrorCatch(err, "buscarNosocomio()");
    }
}
function anularGuia(arrayDatos, callback){ // Anula una Guia de Ingreso/Salida y Distribucion/Devolucion
	try{
		//if(filaSeleccionada!=undefined){
			var idGuia = arrayDatos.idGuia;
			var tipo = arrayDatos.tipo;			
			var idAlmacen = ""			
			var idProveedor = ""
			if(tipo=='ING' || tipo=='SAL'){
				idAlmacen = arrayDatos.idAlmacen;
				idProveedor = arrayDatos.idProveedor;
			}
			var idUsuario = parent.idUsuario;
			fancyConfirm("¿Desea continuar?", function(rpta){
				if(rpta){
					var parametros = "&idGuia="+idGuia+"&tipo="+tipo+"&idAlmacen="+idAlmacen+"&idProveedor="+idProveedor+"&idUsuario="+idUsuario;
					DAO.consultarWebServiceGet("anularGuia", parametros, function(data){
						if(data.length>0){
							var anulado = data[0];
							if(anulado){
								fancyAlertFunction("¡Guia Anulada Correctamente!", function(){
									callback();
								})
							}else{
								fancyAlert(data[1]);
							}
						}
					})
				}
			})
			
		//}
		/*else{
			fancyAlert("¡Debe seleccionar una Guia!")
		}*/				
	}catch(err){
		emitirErrorCatch(err, "anularGuia")
	}
}