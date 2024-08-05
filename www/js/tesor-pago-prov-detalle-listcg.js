/**
 * Created by JEAN PIERRE on 7/01/2018.
 */
var dataTable
var arrayCartas = []
var proveedorSeleccionado = parent.$("#idProveedor option:selected").text()
cargarInicio(function(){
    var cartas = parent.listaCartas
    var index = 0;
    for(var i=0; i<cartas.length; i++){
            index++;
            cartas[i].htmlIncluye = "<input type='checkbox' idCarta='"+cartas[i].idCarta+"' onchange='marcarFila(this)'/>"
            cartas[i].index = index
            arrayCartas.push(cartas[i])
    }
    cargarGrilla()
    $("#btnAgregar").click(agregarCartas)
})
function marcarFila(element){
    var tr = $(element).parent().parent()
    var TDs=$(tr).find("td"); // Busca todos los TD dentro de la Fila
    TDs.each(function(){ // Pinta cada td encontrado
        if($(element).prop("checked")){
            $(this).css("background-color", "gray");
            $(this).css("color", "white");
        }else{
            $(this).css("background-color", "transparent");
            $(this).css("color", "black");
        }

    });
}
function cargarGrilla(){
    try{
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'htmlIncluye'             , alineacion:'center'           },
            {campo:'index'         , alineacion:'center'},
            {campo:'etapa'       , alineacion:'center'      },
            {campo:'nosocomio'        , alineacion:'left'           },
            {campo:'estadoCarta'            , alineacion:'Center'           },
            {campo:'nroCarta'              , alineacion:'center'           },
            {campo:'fechaCarta'   , alineacion:'center'           },
            {campo:'tipoAtencion'   , alineacion:'left'           },
            {campo:'monto'   , alineacion:'right'           },
            {campo:'nroOrdenPago'   , alineacion:'center'           }
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_cg", arrayCartas, camposAmostrar, false, 12); // crea la tabla HTML
        var columns=[
            { "width": "5%"                     },
            { "width": "5%"                    },
            { "width": "10%"  },
            { "width": "20%"                    },
            { "width": "10%"                    },
            { "width": "10%"                    },
            { "width": "10%" ,"type":"date-eu"  },
            { "width": "10%"                    },
            { "width": "10%"                    },
            { "width": "10%"                    }
        ];

        dataTable=parseDataTable("tabla_cg", columns, 295, false, false, false, false);
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "cargarGrilla()")
    }
}
/*
Ya no se usa esta funcion. Ahora solo se cargan las cartas de garantias cuyo proveedor coincidan con el proveedor del expediente.
function coincideConProveedor(idCarta){
	for(var i=0; i<arrayCartas.length; i++){
		if(arrayCartas[i].idCarta == idCarta){
			//debugger
			if(arrayCartas[i].nosocomio != proveedorSeleccionado){
				return { coincide:false, nombre: arrayCartas[i].nosocomio }
			}
			//break
		}
	}
	return { coincide:true }
}*/
function agregarCartas(){
    try{
        var idCartasSeleccionadas = []
        $("#tabla_cg > tbody").find("tr").each(function(){
            var inputCheck = $(this).find("td").eq(0).find("input")
            if($(inputCheck).prop("checked")){
                var idCarta_garantia = $(inputCheck).attr("idCarta")
				idCartasSeleccionadas.push({
					"idCarta":idCarta_garantia
				})
            }
        })
	   if(idCartasSeleccionadas.length>0){
        	realizoTarea=true;
            rptaCallback = idCartasSeleccionadas
            parent.$.fancybox.close();
        }else{
            fancyAlert("¡Debe Seleccionar al menos una Carta!")
        }
    }catch(err){
        emitirErrorCatch(err, "agregarCartas()")
    }
}