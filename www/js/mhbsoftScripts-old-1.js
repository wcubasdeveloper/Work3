//******************* FUNCIONES GLOBALES ******************************************//
var idUsuarioUpdate = parent.idUsuario;
var realizoTarea=false; // variable que indica si se realizo una tarea o no en una ventana fancybox
var rptaCallback=new Array();
var numeroLPAD = 6; // Cantidad maxima para formatear los codigos.
function cargarInicio(func){ // Carga funciones al iniciar la pagina
	try{
		$(document).ready(func);
	}catch(err){
		emitirErrorCatch(err, "cargarInicio"); // emite error
	}	
}
function LPAD(n, width, z) { // funcion LPAD
	try{
		/* Ejemplos de uso:
			LPAD(10, 4);      // 0010
			LPAD(9, 4);       // 0009
			LPAD(123, 4);     // 0123
			LPAD(10, 4, '-'); // --10		
		*/
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;	
	}catch(err){
		emitirErrorCatch(err, "LPAD");
	}
}
function numerosComoStringEnTablaExcel(idTabla){
	// agrega una funcion CSS a la tabla HTML para que los numeros de Guia se muestren correctamente en el excel sin eliminar los ceros a la izquierda
	// por ejemplo la guia 005612 en el excel se mostraria solo como 5612 (se elimina los 2 ceros), pero al agregar esta funcion se mostrara : 005612
	try{
		$("#"+idTabla+" > tbody >tr").each(function(){
			$(this).find("td").each(function(){
				var stylePropiertes = $(this).attr('style');
				$(this).attr('style', stylePropiertes+'; mso-number-format:"\@";');
			})
		})		
	}catch(err){
		emitirErrorCatch(err, "numerosComoStringEnTablaExcel")
	}
}
//********* PARA UTLIZAR LA SELECCION DE FILAS ES NECESARIO CREAR LA VARIABLE GLOBAL filaSeleccionada=undefined;
var filaSeleccionada=undefined; // Fila que contiene el indice del elemento (del arreglo) que contiene el registro seleccionado 
function borrarFilaSeleccionada(){ // borra una fila seleccionada (valor de la variable y la despinta)
    try{
        if(filaSeleccionada!=undefined){ // Identifica que se haya seleccionado un registro
            var TDs=$("#tr_"+filaSeleccionada).find("td"); // Busca todos los <TD></TD> dentro de la Fila <TR></TR>
            TDs.each(function(){ // agrega estilo a cada <TD></TD> 
            	$(this).css("background-color", "transparent"); // Lo vuelve a color transparente                
                $(this).css("color", colorFuenteAntesDePintar); // Asigna como color negro a la fuente.
            });
            filaSeleccionada=undefined; // borra la informacion de la fila que fue seleccionada
        }
    }catch(err){
        emitirErrorCatch(err, "borrarFilaSeleccionada"); // emite error
    }
}
function pintarNuevaFilaSeleccionada(id){ // Pinta una nueva fila y agregar su valor a la variable in
    try{
    	var TDs=$("#tr_"+id).find("td"); // Busca todos los TD dentro de la Fila
    	TDs.each(function(){ // Pinta cada td encontrado
            colorFuenteAntesDePintar=$(this).css("color");
    		$(this).css("background-color", "gray");
    		$(this).css("color", "white");
    	});
        filaSeleccionada=id;
    }catch(err){
        emitirErrorCatch(err, "pintarFilaSeleccionada"); // emite error
    }
}
function seleccionarFila(id){ // Selecciona una fila (despinta la anterior y selecciona la nueva fila)
    try{
        if(id!=filaSeleccionada){
            borrarFilaSeleccionada(); // Borra la fila seleccionada anteriormente, si es que lo hubiera
            pintarNuevaFilaSeleccionada(id); // pinta y asigna nueva fila seleccionada
        }
    }catch (err){
         emitirErrorCatch(err, "seleccionarFila"); // emite error
    }
}
function labelTextWebPlus(idLabel, text){ // Funcion UNICAMENTE usada para reemplazar texto en los labels generados con WEB PLUS
    try{
        var span=$("#"+idLabel).children().find("span"); // Busca el tag <span></span> dentro del label 
        span.html(text); // asigna el texto
    }catch (err){
        emitirErrorCatch(err, "labelTextWebPlus"); // emite error
    }
}
function labelTextWYSG(idLabel, text){ // Funcion UNICAMENTE usada para reemplazar texto en los labels generados con WEB PLUS
    try{
        var span=$("#"+idLabel).find("span"); // Busca el tag <span></span> dentro del label 
        var strong = span.find("strong");
        if(strong.length>0){
        	strong.html(text);
        }else{
        	span.html(text); // asigna el texto
        }        
    	
    }catch (err){
        emitirErrorCatch(err, "labelTextWYSG"); // emite error
    }
}
function asignarEventoChange(idPanel, Objeto, idButton){ // detecta cambios de informacion en los inputs
    try{
        var elements=$("#"+idPanel).children();
        elements.each(function(){
            var id=$(this).attr("id");
            if(id!=undefined){
                $(this).bind("change keyup",function(){
                    identificarCambios(id, Objeto, idButton);
                });
            }
        });
    }catch(err){
        emitirErrorCatch(err, "asignarEventoChange");
    }
}
function identificarCambios(idElement, objeto, idButton){// identifica los cambios que se hayan realizado en un combobox o en un input text
    try{
        var campo=$("#"+idElement).attr("campo");
        if($("#"+idElement).val().toLowerCase()!=objeto[campo].toLowerCase()){
            $("#"+idButton).prop("disabled", false);
        }else{
            $("#"+idButton).prop("disabled", true);
        }
    }catch(err){
        emitirErrorCatch(err, "identificarCambios"); // emite error
    }
}
function verificaNull(texto){
    try{        
        if(texto==null){
            return ""; // devuelve vacio
        }
        return texto;
    }catch(err){
        emitirErrorCatch(err, "verificaNull");
    }
}
function CompletarConCeros(texto, cant){
    try{
        var longitud=(texto+"").split("").length;
        var textoNuevo=texto;
        var maxCeros=cant-longitud;
        for(var i=1; i<=maxCeros;i++){
            textoNuevo="0"+textoNuevo;
        }
        return textoNuevo;
    }catch(err){
        emitirErrorCatch(err,"CompletarConCeros")
    }
}
function parseDATE(fecha){ // convierte fecha STRING de formato dd/mm/yyyy/ hh:mm:ss a variable DATE
    try{
        var dia, mes, año, hora, minuto, segundo;
        hora=0; // asigna valores por defecto
        minuto=0;
        segundo=0;
        fecha=fecha.split(" ");
        var tamaño=fecha.length; // si tamaño es = 2 quiere decir que se envio la Hora
        var soloDatosDeFecha=fecha[0].split("/"); // obtiene solo informacion de la fecha: DIA - MES Y AÑO
        dia=soloDatosDeFecha[0];
        mes=soloDatosDeFecha[1];
        año=soloDatosDeFecha[2];
        mes=parseInt(mes)-1; // restamos una unidad al mes porque en Javascript los meses empiezan desde 0=enero y terminan en 11=diciembre
        if(tamaño==2){ // si se la fecha también contiene hora, obtenemos la hora, minutos y segundos si lo hubiera
            var soloHora=fecha[1].split(":");
            hora=soloHora[0]; // obtiene la Hora
            minuto=soloHora[1]; // obtiene los minutos
            if(soloHora[2]!=undefined){ // si se enviaron los segundos
                segundo=soloHora[2];
            }
        }
        return new Date(año, mes, dia, hora, minuto, segundo);
    }catch(err){
        emitirErrorCatch(err, "parseDate")
    }
}
var cont=0;
function abrirVentanaFancyBox(width, height, paginaHtml, valor, callback, desdePaginaSuperior, parametrosPadre){ // Abre una pagina html en un iframe usando la libreria fancybox
    try{
		if(cont>0){
			cont=0;
		}
        paginaHtml=paginaHtml.split("?");
        var hrefTotal=paginaHtml[0]+".html"; // incrusta la extension html
        if(paginaHtml.length>1){
            hrefTotal=hrefTotal+"?"+paginaHtml[1];
        }
        if(valor==undefined){
            valor=false;
        }
        $.fancybox(
            {                   
                'autoScale': true,
                'autoDimensions': true,
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
                'href':hrefTotal,
				/*beforeShow: function(){
                    var frameFancybox;
                    if(desdePaginaSuperior==true){ // viene de una pagina a un superior
                        frameFancybox=parent.window.frames[parent.window.frames.length-1];
                    }else{
                        frameFancybox=window.frames[window.frames.length-1];
                    }
                    frameFancybox.rptaCallback=undefined;
                    frameFancybox.realizoTarea=false;
                    frameFancybox.parametrosPadre = parametrosPadre;
                },*/
                beforeClose:function(){
                    var verificaCallBack = typeof callback;
                    if(verificaCallBack=="function"){
                        if(cont==0){
                            cont++;
                            var frameFancybox;							
                            if(desdePaginaSuperior==true){ // viene de una pagina a un superior
                                frameFancybox=parent.window.frames[parent.window.frames.length-1];
                            }else{
                                frameFancybox=window.frames[window.frames.length-1];
                            }
                            var verificaEvento=frameFancybox.realizoTarea;
                            if(verificaEvento){
                                var data=frameFancybox.rptaCallback;
                                callback(data); // ejecuta funcion                                
                            }
                            cont=0;    
                        }                       
                    }
                }

            }
        );
    }catch(err){
        emitirErrorCatch(err, "abrirVentanaFancyBox"); // emite error
    }
}
function validarCamposRequeridos(idPanel){// Valida que los campos requeridos de un div esten completos. Se envia como parametros el id del Div (SOLO SE VALIDA INPUTS TEXT y SELECTS)
    try{
        valor=true;
        var elements=$("#"+idPanel).children(); // busca los elementos que estan incluidos en el panel
        elements.each(function(){ // hace un recorrido por cada elemento encontrado
            var esRequerido=$(this).attr("requerido") // identifica si tiene el atributo de requerido
            var esSelect=false;
            if(esRequerido!=undefined && esRequerido!=""){
                elementoActual=$(this); // Guarda el elemento actual
                valorcampo=elementoActual.val();
                // identificar si es un "Select"
                if(elementoActual.is("Select")){
                    esSelect=true;
                    valorcampo=elementoActual.find('option:selected').val();
                }
                if(valorcampo=="" || valorcampo=="Seleccione"){ // si su valor es vacio
                    elementoActual.blur(); // quita foco del elemento seleccionado
                    valor=false;
                    fancyAlertFunction("Falta completar el campo "+esRequerido, function(estado){ // emite alerta
                        if(estado){
                            elementoActual.focus();
                        }
                    });
                    return false;
                }
            }
        });
        return valor; // devuelve valor TRUE O FALSE. Si es true quiere decir que todos los elementos requeridos estan completo
    }catch(err){
        emitirErrorCatch(err, "valicarCamposRequeridos"); // emite error
    }
}
function quitarEspaciosEnBlanco(valor){ // quita espacios en blanco de una cadena de texto
    try{
        if(valor==null){
            valor='';
        }
        if(valor!=undefined && typeof valor == 'String'){           
            valor=valor.trim()
        }
        return valor;
    }catch(err){
        emitirErrorCatch(err, "quitarEspaciosBlanco")
    }
}
function consultarWebServiceGet(funcion_webService, parametros, callback,mensaje){ // genera una consulta al web service General
    try{
        if(mensaje!=false){
            if(mensaje==undefined){
                mensaje="Espere";
            }
            fancyAlertWait(mensaje);
        }
        //console.log("Ejecuta consulta al Webservice");
        $.getJSON("webservice?funcion="+funcion_webService+parametros, function(data, estatus){ // envio con JSON y responde
            try{
                //console.log("Webservice respondio - Estado: "+estatus);
                rptaWebservice=data;
                eval(callback(data, mensaje)); // ejecuta la funcion
            }catch (err){
                emitirErrorCatch(err, "consultarWebService");
            }
        }).fail(function(jqxhr, textStatus, error) { // web service falla
            try{
                //console.log("Webservice falló");
                errorMysql=jqxhr.responseText;
                if(errorMysql==""){
                    var err="FATAL ERROR: Posible Desconexion de la Red, reintentar!!";
                }else{
                    err=errorMysql+". Comunicarse con el soporte técnico.";
                }
                fancyAlert(err);
            }catch(err){
                emitirErrorCatch(err, "consultarWebService");
            }
        });
    }catch(err){
        emitirErrorCatch(err, "consultarWebService");
    }
}
function DAOWebServiceGeT(nombreWebService){
	this.nombreWebService = nombreWebService;
	this.consultarWebServiceGet=function(funcion_webService, parametros, callback,mensaje, paginacionPlugin, otrosDatos){ // accede a un web service especifico
		try{
			if(mensaje!=false){
				if(mensaje==undefined || mensaje==true){
					mensaje="Espere";
				}
				fancyAlertWait(mensaje);
			}
			if(paginacionPlugin!=null){ // agrega los parametros de la paginacion
				parametros+="&page="+paginacionPlugin.paginaActual+
					"&cantPaginas="+paginacionPlugin.cantPaginas+
					"&registrosxpagina="+paginacionPlugin.registrosXpagina;
			}
			if(!parametros.includes("&idUsuarioUpdate")){
				if(idUsuarioUpdate==undefined){
					idUsuarioUpdate=0;
				}
				parametros=parametros+"&idUsuarioUpdate="+idUsuarioUpdate; // envia el id del usuario que realiza la operacion
			}
			
			//console.log("Ejecuta consulta al Webservice");
			$.getJSON(this.nombreWebService+"?funcion="+funcion_webService+parametros, function(data, estatus){ // envio con JSON y responde
				try{
					//console.log("Webservice respondio - Estado: "+estatus);
					rptaWebservice=data;
					eval(callback(data, mensaje, otrosDatos)); // ejecuta la funcion
				}catch (err){
					emitirErrorCatch(err, "consultarWebService");
				}
			}).fail(function(jqxhr, textStatus, error) { // web service falla
				try{
					//console.log("Webservice falló");
					errorMysql=jqxhr.responseText;
					if(errorMysql==""){
						var err="FATAL ERROR: Posible Desconexion de la Red, reintentar!!";
					}else{
						err=errorMysql+". Comunicarse con el soporte técnico.";
					}
					fancyAlert(err);
				}catch(err){
					emitirErrorCatch(err, "consultarWebService");
				}
			});
		}catch(err){
			emitirErrorCatch(err, "consultarWebService_DAOWebServiceGeT");
		}
	}
    this.consultarWebServicePOST = function(formData, funcion_webService, callback, mensaje){
        try{
			if(!funcion_webService.includes("&idUsuarioUpdate")){
				if(idUsuarioUpdate==undefined){
					idUsuarioUpdate=0;
				}
				funcion_webService=funcion_webService+"&idUsuarioUpdate="+idUsuarioUpdate; // envia el id del usuario que realiza la operacion
			}
            if(mensaje!=false){
                if(mensaje==undefined){
                    mensaje="Espere";
                }
                fancyAlertWait(mensaje, mensaje);
            }
            $.post(this.nombreWebService+"?funcion="+funcion_webService, formData,
                function(data){
                    callback(data);
                }, 'json').fail(
                function(xhr, textStatus, errorThrown) {
                    fancyAlert('ERROR: '+xhr.responseText);
                }
            );
        }catch(err){
            emitirErrorCatch(err, "consultarWebServicePOST");
        }
    }
}
function consultarWebServicePOST(formData, funcion_webService, callback, mensaje){
    try{
        if(mensaje!=false){
            if(mensaje==undefined){
                mensaje="Espere";
            }
            fancyAlertWait(mensaje, mensaje);
        }
        $.post("webservice?funcion="+funcion_webService, formData,
            function(data){
                callback(data);
            }, 'json').fail(
            function(xhr, textStatus, errorThrown) {
                fancyAlert('ERROR: '+xhr.responseText);
            }
        );
    }catch(err){
       emitirErrorCatch(err, "consultarWebServicePOST");
    }
}
function crearFilasHTML(idTablaHTML, datos, campoAlineacionArray, ONCLIK_FILA_SELECCIONADA, fontSize, idPrefijo){
    try{
        var cursor="cursor: pointer;";
        if(ONCLIK_FILA_SELECCIONADA==undefined){ //
            ONCLIK_FILA_SELECCIONADA=false;
            cursor="";
        }
        if(fontSize==undefined){
            fontSize=11;
        }
		if(idPrefijo==undefined){
			idPrefijo="";
		}else{
			idPrefijo = idPrefijo+"_";
		}
        var onclick="";
        var AlineacionTD="";
        var cantidadAtributos=0;
        $("#"+idTablaHTML+" > tbody").html(""); // reinicia
        if(datos.length>0){
            cantidadAtributos=campoAlineacionArray.length; // obtiene la cantidad de atributos
            var filaTRAppend="";
            for(var i=0; i<datos.length; i++){
                if(ONCLIK_FILA_SELECCIONADA){ // si es TRUE
                    onclick="onclick='seleccionarFila("+'"'+idPrefijo+i+'"'+")' id='tr_"+idPrefijo+i+"'";
                }
                filaTRAppend+="<tr  style='font-family: Arial; height: 30px; "+cursor+" font-size: "+fontSize+"px;' "+onclick+">";
                for(var y=0; y<cantidadAtributos; y++){ //completa las columnas segun la cantidad de atributos
                    AlineacionTD="justify";
					var conLPAD = false; // option que determina si el campo se completera con ceros
                    var cantidadCeros = numeroLPAD; // cantidad de ceros
					if(campoAlineacionArray[y]!=undefined){
                        AlineacionTD=campoAlineacionArray[y].alineacion;
						if(campoAlineacionArray[y].LPAD==true){
							conLPAD = true;
							if(campoAlineacionArray[y].cantLPAD>0){
								cantidadCeros = campoAlineacionArray[y].cantLPAD;
							}
						} 
					}					
					
                    filaTRAppend+="<td style='vertical-align: middle; text-align: "+AlineacionTD+"'>"+quitarEspaciosEnBlanco((conLPAD) ? LPAD(datos[i][campoAlineacionArray[y].campo], cantidadCeros) : datos[i][campoAlineacionArray[y].campo])+"</td>";
                }
                filaTRAppend+="</tr>";
            }
            $("#"+idTablaHTML+" > tbody").append(filaTRAppend);
        }
    }catch(err){
        emitirErrorCatch(err, "crearFilasHTML");
    }
}
function parseDataTable(idTabla, columnWidthArray, scrollY, orderByColumn, ajustableAlto, searching, paging, functionInit){
    try{
        borrarFilaSeleccionada();
        var sort=true;
        if(orderByColumn==undefined || orderByColumn==false){
            sort=false;
           orderByColumn=[0, "desc"];
        }
        if(searching==undefined){
            searching=false;
        }
        if(paging==undefined){
            paging=false;
        }
        if(ajustableAlto==undefined){
            ajustableAlto=false;
        }
        var dataTable=$('#'+idTabla).DataTable({
            "searching": searching,
            "paging": paging,
            "scrollY":scrollY+"px",
            "pagingType": "simple",
            "info":     false,
            "lengthChange": false,
            "scrollCollapse": ajustableAlto,
            "language": {
                "search": "Buscar:",
                "lengthMenu": "Visualizar _MENU_ por pag.",
                "zeroRecords": "NO SE ENCONTRARON REGISTROS",
                "info": "Pag _PAGE_ de _PAGES_",
                "infoEmpty": "No Disponible",
                "infoFiltered": "(Filtrado de _MAX_ registros)"
            },
            "order": [orderByColumn],
            "bSort": sort,
            "columns": columnWidthArray,
			"initComplete":function(){
                if(typeof functionInit == 'function'){
					functionInit(idTabla);
				}
			},
            fixedColumns: true
        });
        $('#'+idTabla).on("search.dt", function(){
            borrarFilaSeleccionada();
        });
		borrarFilaSeleccionada();
        return dataTable;
    }catch(err){
        emitirErrorCatch(err, "parseDataTable")
    }
}
function textNumber(e, numeroRestringido, valor, long ){ // e=event, long=longitud maxima
    try{
        //var key = window.Event ? e.which : e.keyCode
        var key = e.charCode || e.keyCode;
        if((key >= 48 && key <= 57) || (key==8)){
            if(numeroRestringido!=undefined){
                if(valor=="" && key==(48+numeroRestringido)){// si el numero que se imprimira es el numeroRestringido
                    return false;
                }
            }
            if(long!=undefined){
                if(valor.split("").length<=(long-1)){
                    return true;
                }
                return false;
            }
            return true;
        }
        return false;

    }catch(err){
        emitirErrorCatch(err, "soloNumeros");
    }
}
function isNumberKey(evt){
    try{
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode != 46 && charCode > 31
            && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }catch (err){
        emitirErrorCatch(err, "isNumberKey()");
    }
}
function agregarOpcionesToCombo(idSelect, datos, campos){ // Agrega los datos de un Array asociativo {id:"", texto:""} en un combobox
    try{
        $("#"+idSelect).html(""); // Limpia opciones
        $("#"+idSelect).append(new Option("Seleccione",""));
        if(typeof  campos =='undefined'){
            for(var i=0; i<datos.length; i++){
                $("#"+idSelect).append(new Option(datos[i].texto, datos[i].id));
            }
        }else{
            for(var i=0; i<datos.length; i++){
                $("#"+idSelect).append(new Option(datos[i][campos.keyValue], datos[i][campos.keyId]));
            }
        }

    }catch(err){
        emitirErrorCatch(err, "agregarOpcionesToCombo");
    }
}
function convertirAfechaString(fecha, conHora, segundos, formato){ // CONVIERTE UNA FECHA  STRING (en FORMATO MYSQL YYYY-MM-DD HH:mm:ss ) O DATE a un string con formato DD/MM/YY hh:mm:ss (Hora es opcional)
    try{
        /** PARAMETROS:
         * Fecha: fecha que se convertira es Obligatorio
         * conHora: si se requiere mostrar la hora o no. No es obligatorio. Su valor x defecto es TRUE
         * segundos: si se desea mostrar los segundos o no. No es Obligatorio. Su valor x defecto es TRUE
        */
        var AM_PM="";
        var fechaSalida;
        if(conHora==undefined){
            conHora=true;
        }
        if(conHora==true){
            if(segundos==undefined){
                segundos=true;
            }
        }
        if(formato==undefined){
            formato=24;
        }
        if(fecha==null || fecha==""){
            fancyAlert("se intenta convertir una fecha incorrecta, la fecha es null o vacio (convertirAfechaString)");
            return;
        }else{
            var tipoDatoFecha = typeof fecha;// Busca si la fecha es string o Date
            if(tipoDatoFecha=="object"){
                var año = fecha.getFullYear();
                var mes = agregarCEROaLaIzquierda(fecha.getMonth()+1);
                var dia = agregarCEROaLaIzquierda(fecha.getDate());
                fechaSalida=dia+"/"+mes+"/"+año;
                if(conHora==true){ // se requiere obtener la hora de la fecha
                    var horas=agregarCEROaLaIzquierda(fecha.getHours());
                    var minutos=agregarCEROaLaIzquierda(fecha.getMinutes());
                    fechaSalida=fechaSalida+" "+horas+":"+minutos;
                    if(segundos==true){
                        var segundos=agregarCEROaLaIzquierda(fecha.getSeconds());
                        fechaSalida=fechaSalida+":"+segundos;   
                    }
                }
            }else{ // es string
                var fechaHora=fecha.split(" ");
                var soloFecha=fechaHora[0].split("-");
                fechaSalida = soloFecha[2]+"/"+soloFecha[1]+"/"+soloFecha[0];
                if(conHora==true){
                    if(segundos==true){
                        fechaSalida=fechaSalida+" "+fechaHora[1];    
                    }else{
                        var soloHora=fechaHora[1].split(":");
                        fechaSalida=fechaSalida+" "+soloHora[0]+":"+soloHora[1];
                        
                    }
                }    
            }
        }
        if(formato==12 && conHora==true){
            fechaSalida=fechaSalida.split(" "); // separa de fecha y hora
            var soloFecha=fechaSalida[0];
            var soloHora=fechaSalida[1].split(":");
            var Hora=parseInt(soloHora[0]); // obtiene solo la hora
            var minus=soloHora[1];
            if(Hora>12){
                Hora=agregarCEROaLaIzquierda(Hora-12);
                AM_PM="PM";
            }else{
				Hora=agregarCEROaLaIzquierda(Hora);
                AM_PM="AM";
            }
            fechaSalida=soloFecha+" "+Hora+":"+minus;
            if(segundos==true){
                fechaSalida=fechaSalida+":"+soloHora[2]; // agrega segundos
            }
			
            fechaSalida=fechaSalida+" "+AM_PM;
            
        }
        return fechaSalida;
    }catch(err){
        emitirErrorCatch(err, "fechaFormateada");
    }
}
function getUrlVars() { // Funcion para obtener Variables GETS
    try{
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = decodeURIComponent(value);
        });
        return vars;
    }catch(err){
        emitirErrorCatch(err, "getUrlVars")
    }
}
function $_GET(variableKey){ // Obtiene las Variables GET desde la URL
    try{
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = decodeURIComponent(value);
        });
        return vars[variableKey];
    }catch(err){
        emitirErrorCatch(err, "$_GET");
    }
}
function Paginacion(){ // CLASE PARA CREAR LA PAGINACION
    this.cantPaginas=0;
    this.registrosXpagina = 50;
    this.intervaloPaginacion = 8;
    this.paginaActual=1;
    this.cargarPaginacion = function (numPaginas, idPaginacion, paginacionData, functionOnchange){
        if(numPaginas>1){ // se encontraron resultados
            if(this.cantPaginas==0){
                this.cantPaginas=numPaginas;
                this.crearPaginacion(idPaginacion, this.cantPaginas, this.intervaloPaginacion, function(page){
                    if(typeof functionOnchange == "function"){
                        functionOnchange(page);
                    }
                });
            }
        }else{
            $("#"+idPaginacion).html(""); // Limpia la paginacion
        }
    }
    this.reiniciarPaginacion = function(){ // reinicia la cantidad de paginas a 0, y la pagina seleccionada a 1
        this.cantPaginas=0;
        this.paginaActual=1;
    }
    this.crearPaginacion = function (idPaginacion, numPaginas, intervaloPaginacion, callbackOnChange){
        try{
            if(intervaloPaginacion==undefined){
                intervaloPaginacion=8;
            }
            $("#"+idPaginacion).paginate({
                count 		: numPaginas,
                start 		: 1,
                display     : intervaloPaginacion,
                border					: true,
                border_color			: 'gray',
                text_color  			: 'black',
                background_color    	: 'white',
                border_hover_color		: '#4485A6',
                text_hover_color  		: 'white',
                background_hover_color	: '#4485A6',
                //rotate      : false,
                images		: false,
                mouse		: 'press',
                onChange    : function(page){
                    if(typeof callbackOnChange == "function"){
                        $(".jPag-pages").parent(0).css("margin-left", "6px");
                        callbackOnChange(page);
                    }
                }
            });
            $(".jPag-last").html("Último");
            $(".jPag-first").html("Primero");
            $(".jPag-pages").parent(0).css("margin-left", "30px");
            $(".jPag-control-front").css("margin-left", "30px");

        }catch(err){
            emitirErrorCatch(err, "crearPaginacion")
        }
    }
}
function getLenth(cadena){ // obtiene la cantidad de caracteres de un String
	try{
		if(typeof cadena == "string"){
			return  cadena.split("").length;
		}else{
			return 0;
		}		
	}catch(err){
		emitirErrorCatch(err, "getLenth");
	}
}
function eliminacionGeneral(nombreTabla, keyField, keyValue, DAOWebService, callback){ // Elimina registro de una determinada Tabla segun el campo que se especifica.
    try{
        var parametros = "&nombreTabla="+nombreTabla+
            "&keyField="+keyField+
            "&keyValue="+keyValue;
        DAOWebService.consultarWebServiceGet("eliminacionGeneral", parametros, function(data){
            if(typeof callback == 'function'){
                callback(data);
            }
        })
    }catch(err){
        emitirErrorCatch(err, "eliminacionGeneral()")
    }
}

// METODOS ABSTRACTOS PARA EL USO DE LOS MODULOS DE MANTENIMIENTO
var dataTableMantenimiento = undefined;
var arrayRegistros;
var paginacion = null;
function listarAbstracto(DAO, nombreModulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, params, callback, paginar, buscarParam){ // Lista de forma abstracta los registros del mantenimiento.
	try{
		if(paginar==true){
			if(paginacion==null){
				paginacion=new Paginacion();
			}			
		}
		if(params==undefined){
			params=""
		}
		if(buscarParam==undefined){
			buscarParam=true;
		}
		
			DAO.consultarWebServiceGet("getLista"+nombreModulo, params, function(data, mensaje, variablesDataTable){
				var campoAlineacionArray = variablesDataTable[0];
				var arrayColumnWidth = variablesDataTable[1];
				var orderByColum = variablesDataTable[2];
				var idTabla = variablesDataTable[3];
				var height = variablesDataTable[4];
				if(dataTableMantenimiento!=undefined){
					dataTableMantenimiento.destroy();
				}
				arrayRegistros = data;
				crearFilasHTML(idTabla, data, campoAlineacionArray, true, 12);
				if(paginar==null){
					dataTableMantenimiento=parseDataTable(idTabla, arrayColumnWidth, height, orderByColum, false, buscarParam);
				}else{
					dataTableMantenimiento=parseDataTable(idTabla, arrayColumnWidth, height, orderByColum, false, buscarParam, false, function(){
						if(data.length>0){
							var numeroPaginas = data[0].numeroPaginas;
							if(typeof numeroPaginas != "undefined"){
								paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){
									paginacion.paginaActual=page;
									buscar();
								});
							}
						}else{
							paginacion.cargarPaginacion(0, "pagination"); // con el metodo cargarPaginacion se implementa la implementacion. Recibe parametros @1: numero de paginas, @2: id DIV de la Paginacion
						}
					});
				}
				
				$.fancybox.close();
				if(typeof callback=='function'){
					callback();
				}
			}, true, paginacion, [campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height]);
			
				
	}catch(err){
		emitirErrorCatch(err, "listarAbstracto");
	}
}
function nuevoAbstracto(nombreModulo, height, width, callback){
	try{
		abrirVentanaFancyBox(width, height, "nuevo_editar_"+nombreModulo+"?id=0", true, function(data){
			callback(data);
		});
	}catch(err){
		emitirErrorCatch(err, "nuevoAbstracto");
	}
}
function editarAbstracto(nombreModulo, idColumn, height, width, callback){
	try{
		if(filaSeleccionada!=undefined){
			var id = arrayRegistros[filaSeleccionada][idColumn];
			abrirVentanaFancyBox(width, height, "nuevo_editar_"+nombreModulo+"?id="+id, true, function(data){
				callback(data);
			});
		}else{
			fancyAlert("¡Debe seleccionar un registro!");
		}		
	}catch(err){
		emitirErrorCatch(err, "editarAbstracto");
	}
}
var DAOEliminacion;
function eliminarAbstracto(DAO, nombreTabla, idColumn, callback){
	try{
		if(filaSeleccionada!=undefined){
			DAOEliminacion = DAO;
			fancyConfirm("¿Procede con la eliminación?", function(rpta){
				if(rpta){
					var idValue = arrayRegistros[filaSeleccionada][idColumn];
					eliminacionGeneral(nombreTabla, idColumn, idValue, DAOEliminacion, function(data){
						callback(data);
					});					
				}				
			});		
		}else{
			fancyAlert("Debe seleccionar el registro a eliminar")
		}		
	}catch(err){
		emitirErrorCatch(err, "editarAbstracto");
	}
}
function cargarInfoAbstracto(DAO, nombreModulo, idRegistro, callback){
	try{
		var parametros="&id="+idRegistro;
		DAO.consultarWebServiceGet("consultarInfo"+nombreModulo, parametros, function(data){
			callback(data);
		});
	}catch(err){
		emitirErrorCatch(err, "cargarInfoAbstracto");
	}
}
function openSelect(elem) { // abre un combobox
	var worked = false; 
    if (document.createEvent) {
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        worked = elem[0].dispatchEvent(e);
		
    } else if (element.fireEvent) {
        worked =elem[0].fireEvent("onmousedown");
    }
	if (!worked) { // unknown browser / error
		alert("It didn't worked in your browser.");
	}
}
function convertMayusculas(element){
	try{
		var valor= element.value;
		valor = valor.toUpperCase();
		if(valor.trim()!=""){
			$(element).val(valor) // devuelve el valor en mayusculas
		}
	}catch(err){
		emitirErrorCatch(err, "convertMayusculas")
	}
}
//********************************* FIN DE FUNCIONES GLOBALES *****************************************