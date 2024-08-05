var codEvento;
var origen=parent.origen; // identifica si el origen viene del modulo de notificaciones o del modulo de Agenda
if(origen==undefined){
	origen="N";
}
var objeto; 
cargarInicio(function(){
	// prepara botones:
	$("#idCancelar").click(function(){
        switch (origen){
            case 'N':
                descargarReporteExelNotificaciones();
                setTimeout(parent.window.frames[0].cargarNotificaciones(parent.window.frames[0].$("#idEstadoNotificaciones").val()),3000);
                break;
            case 'A':
                parent.bucarTareas(parent.$("#idEstadoTareas").val()); // Busca las tareas pendientes.
                break;
            case 'NA':
                parent.$.fancybox.close();
                break;
        }
	});
	$("#idGuardar").click(function(){
		guardarSeguimientos();
	});
	switch(origen){
		case 'N': // Modulo Notificaciones
			codEvento=parent.codigoEventoNotificacion;			
			labelTextWebPlus("id_Titulo", "TAREA PARA LA(S) NOTIFICACION(ES) DEL EVENTO "+codEvento);
			break;
		case 'A': // Modulo Agenda
			objeto = parent.arrayDatos[parent.filaSeleccionada];
			codEvento=objeto.codEvento;
			parent.idNotificaciones=[{"idNotificacion":objeto.idNotificacion}]; // asigna el id de la Notificacion
			labelTextWebPlus("id_Titulo", "NUEVA TAREA PARA LA NOTIFICACION Nº "+LPAD(objeto.idNotificacion, numeroLPAD));
			break;
        case 'NA':
            codEvento=parent.codEventoNotificacionSelecionada;
            labelTextWebPlus("id_Titulo", "NUEVA TAREA PARA LA NOTIFICACION Nº "+LPAD(parent.codNotificacion, numeroLPAD));
            break;
	}
	//$("#id_fechaProgramacion").val(fechaFormateada((new Date()), false, true));
	$("#id_fechaProgramacion").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true,  step:5});
	$("#id_medio").select2(); 
});
/* @guardarSeguimientos: Guarda o añade tareas de seguimiento para las notificaciones que se registraron.
*/
function guardarSeguimientos () {
	try{
		// recupera los id de las notificaciones
		//var camposRequeridos="id_fechaProgramacion-Fecha de Programacion/id_tarea-Tarea/id_medio-Medio de comunicación";
		if(validarCamposRequeridos("idDivComponents")){ // coloca el id del div que contiene los elementos requeridos
			fancyConfirm("¿Confirma registrar la tarea?", function(estado){
				if(estado){
					fancyAlertWait("Cargando");
					var notificaciones=new Array();
					notificaciones=parent.idNotificaciones;			
					var idNotificaciones="";
					for(var i=0; i<notificaciones.length; i++){
						if(i>0){
							idNotificaciones=idNotificaciones+"-";
						}
						idNotificaciones=idNotificaciones+notificaciones[i].idNotificacion;
					}
					var parametros="&codEvento="+codEvento+
								"&descripcionTarea="+$("#id_tarea").val()+
								"&medio="+$("#id_medio").val()+
								"&notificaciones="+idNotificaciones+
								"&fechaProgramada="+dateTimeFormat($("#id_fechaProgramacion").val(), true);
								console.log("Guardar datos");
					webService2("guardarSeguimientos", parametros, "finGuardarSeguimiento()");
				}
			});			
		}
	}catch(err){
		emitirErrorCatch(err, "guardarSeguimientos"); // emite error
	}
}
function finGuardarSeguimiento() {
	try{
		if(rptaWebservice[0]>0){
			switch(origen){
				case 'N': // origen de Notificaciones
					/*fancyAlertFunction("¡¡ La tarea se registro exitosamente !!", function(estado){
						//parent.$.fancybox.close();
						if(estado){*/
                            parent.window.frames[0].cargarNotificaciones(parent.window.frames[0].$("#idEstadoNotificaciones").val());
							descargarReporteExelNotificaciones();
						/*}
					});*/
					break;
				case 'A':
					/*fancyAlertFunction("¡¡ Se registró existosamente, la tarea para la Notificacion Nº "+objeto.idNotificacion+" !!", function(estado){
						if(estado){*/
							//if(parent.$("#idEstadoTareas").val()=='P'){ // si se encuentra seleccionado el filtro de pendientes
								parent.bucarTareas(parent.$("#idEstadoTareas").val()); // Busca las tareas
							//}
						/*}
					});*/
					break;
                case 'NA': // Nueva asignacionde notificacion
                        //parent.bucarTareas(parent.$("#idEstadoTareas").val()); // Busca las tareas
                        parent.$.fancybox.close();
                    break;
			}			
		}
	}catch(err){
		emitirErrorCatch(err, "finGuardarSeguimiento"); // emite error
	}
}