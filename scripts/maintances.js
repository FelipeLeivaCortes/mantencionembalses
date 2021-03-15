function getRecord(idRecord, onlyRead){
    ShowSpinner();

    if( document.getElementById("containerTable") != null ){
        document.getElementById("containerTable").remove();
    }

    idRecord    = ( idRecord == -1 ) ? document.getElementById("idRecord").value : idRecord;

    var aux         = isValidIntegerNumber(idRecord);
    var isAdmin;

    if( document.getElementById("user-role").innerHTML == 'Administrador' ){
        isAdmin     = "1";

    }else{
        isAdmin     = "0";
    
    }

    if( aux == 0 ){
        document.getElementById("idRecord").value   = "";

    }else{
        var idCompany   = sessionStorage.getItem('ID_COMPANY');
        var username    = sessionStorage.getItem('USERNAME');
        var Variables   = 'idRecord=' + idRecord + '&idCompany=' + idCompany + "&username=" + username + "&isAdmin=" + isAdmin;

        $.post("backend/getRecord.php", Variables, function(DATA){

            document.getElementById("idRecord").value   = "";

            if( DATA.ERROR ){
                setTimeout(function(){
                    CloseSpinner();
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                }, 500);
            
            }else{
                var table;
                var divTable;
                var isComplete      = true;
                var isPiezometria   = false;

                divTable    = document.createElement("div");
                divTable.setAttribute("class", "table-modal table-reponsive-xl");
                divTable.setAttribute("id", "containerTable");
        
                table       = document.createElement("table");
                table.setAttribute("class", "table table-striped");
                table.setAttribute("id", "tablePendingRecords");
        
                var thead                   = document.createElement("thead");

                var rowHead                 = document.createElement("tr");

                var indexHeadCell           = document.createElement("th");
                var activityHeadCell        = document.createElement("th");
                var descriptionHeadCell     = document.createElement("th");
                var statusHeadCell          = document.createElement("th");

                indexHeadCell.setAttribute("scope", "col");
                activityHeadCell.setAttribute("scope", "col");
                descriptionHeadCell.setAttribute("scope", "col3");
                statusHeadCell.setAttribute("scope", "col");

                var indexHead       = document.createTextNode("N°");
                var activityHead    = document.createTextNode("Actividad");
                var descriptionHead = document.createTextNode("Observación");
                var statusHead      = document.createTextNode("Estado");

                indexHeadCell.appendChild(indexHead);
                activityHeadCell.appendChild(activityHead);
                descriptionHeadCell.appendChild(descriptionHead);
                statusHeadCell.appendChild(statusHead);

                rowHead.appendChild(indexHeadCell);
                rowHead.appendChild(activityHeadCell);
                rowHead.appendChild(descriptionHeadCell);
                rowHead.appendChild(statusHeadCell);

                thead.appendChild(rowHead);
                table.appendChild(thead);
            
                var bodyTable   = document.createElement("tbody");

                // Create the rows
                for (var i=0; i<DATA.COUNT; i++){

                    // Here is created every row
                    var row             = document.createElement("tr");

                    // Here is created every cell
                    var indexCell	    = document.createElement("td");
                    var activityCell    = document.createElement("td");
                    var descriptionCell = document.createElement("td");
                    var statusCell      = document.createElement("td");
                    
                    // Here is storaged the content into a node
                    var index           = document.createTextNode( i + 1 );
                    var activity        = document.createTextNode( DATA[i].name );
                    var description, status, option1, option2;

                    if( onlyRead ){
                        activity        = document.createTextNode( DATA[i].name );
                        description     = document.createTextNode("");
                        status          = document.createTextNode("");

                        var target  = DATA[i].id;

                        for(var j=0; j<DATA.observations.length - 1; j++){
                            var line    = DATA.observations[j].split("|");
                            
                            if( target == line[0] ){
                                description.textContent     = line[1];
                                break;
                            }
                        }

                        status.textContent  = ( DATA[i].state == '0') ? "Pendiente" : "Realizada";
                        
                    }else{
                        description     = document.createElement( "textarea" );
                        status          = document.createElement( "select" );
                        option1         = document.createElement( "option" );
                        option2         = document.createElement( "option" );

                        // Here we set the attributes
                        option1.text        = "Pendiente";
                        option2.text        = "Realizada";

                        status.add(option1);
                        status.add(option2);

                        var target  = DATA[i].id;

                        for(var j=0; j<DATA.observations.length - 1; j++){
                            var line    = DATA.observations[j].split("|");
                            
                            if( target == line[0] ){
                                description.value   = line[1];
                                break;
                            }
                        }

                    //  If the guide is incomplete
                        if( DATA[i].state == "0" ){
                            status.value        = "Pendiente";
                            isComplete          = false;

                        }else{
                            status.value            = "Realizada";
                            description.disabled    = true;
                            status.disabled         = true;
                        }

                        if( DATA[i].name == 'realizar piezometría' ){
                            isPiezometria   = true;

                            status.setAttribute("id", "selectPiezometria");
                            status.addEventListener("change", function(){
                                if( this.value == 'Realizada' ){
                                    $('#updatePiezometriaForm').modal('show');
                                }
                            });

                            $("#updatePiezometriaForm").on('hidden.bs.modal', function (){
                                document.getElementById("selectPiezometria").value  = "Pendiente";
                            });

                        }

                    }
                    
                    // Here is inserted the content into the cells
                    indexCell.appendChild(index);
                    activityCell.appendChild(activity);
                    descriptionCell.appendChild(description);
                    statusCell.appendChild(status);

                    // Here is inserted the cells into a row
                    row.appendChild(indexCell);
                    row.appendChild(activityCell);
                    row.appendChild(descriptionCell);
                    row.appendChild(statusCell);
                    
                    // Here is inserted the row into the table´s body
                    bodyTable.appendChild(row);
                }

                if( isAdmin == '0' ){
                    // We create the div that will containts the button to update the changes
                    var containerButton     = document.createElement("div");
                    var button              = document.createElement("button");
                    var span                = document.createElement("span");
                    var textButton          = document.createElement("textNode");

                    textButton.textContent  = "Guardar";

                    containerButton.setAttribute("class", "container-fluid d-flex justify-content-center");
                    span.setAttribute("class", "icon-edit");
                    button.setAttribute("class", "btn btn-primary");
                    button.setAttribute("onclick", "javascript:openModalConfirmEvent(" + idRecord + ", " + isPiezometria + ")");
                    button.setAttribute("data-toggle", "modal");

                    if( isComplete ){
                        button.disabled     = true;
                    }

                    button.appendChild(textButton);
                    button.appendChild(span);
                    containerButton.appendChild(button);
                }
                
                if( onlyRead ){
                    document.getElementById("printPdfBtn").setAttribute("onclick", "printRecord(" + idRecord + ")");
                }

                // Here is inserted the body´s table into the table
                table.appendChild(bodyTable);
                divTable.appendChild(table);

                if( isAdmin == '0' ){
                    divTable.appendChild(containerButton);
                    document.getElementById("body-container").appendChild(divTable);
                    
                    setTimeout(() => {
                        CloseSpinner();
                    }, 500);

                }else{
                    document.getElementById("containerResult").appendChild(divTable);
                    
                    setTimeout(() => {
                        CloseSpinner();
                        $('#searchRecordForm').modal('show');
                    }, 500);
                }
                
            }
        });
    }
};

function openModalConfirmEvent(idRecord, isPiezometria){
    var table   = document.getElementById("tablePendingRecords").children[1];
    
    var arrayObservations   = [];
    var arrayStates         = [];
    var error               = false;

    for(var i=0; i<table.children.length; i++){
        var observation     = table.children[i].cells[2].children[0].value.replace(/\n/g, "");
        arrayObservations.push( observation );

        if( table.children[i].cells[3].children[0].value == "Pendiente" ){
            arrayStates.push( "0" );
        
        }else if( table.children[i].cells[3].children[0].value == "Realizada" ){
            arrayStates.push( "1" );
        
        }else{
            ModalReportEvent("Error", 63, "El estado de la fila " + (i + 1) + " ha sido modificado incorrectamente");
            error   = true;
            
            break;    
        }
        
    }

    if( !error ){
        document.getElementById("headerEvent").innerHTML    = " Actualizar guía de mantención";
        document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea guardar los cambios?";

        document.getElementById("btnConfirm").setAttribute("onclick", "updateRecord(" + idRecord + ", '" + arrayObservations + "', '" + arrayStates + "', " + isPiezometria + ");");

        $('#ModalConfirmEvent').modal('show');
    }
}

function updateRecord(idRecord, arrayObservations, arrayStates, isPiezometria){
    

    $('#ModalConfirmEvent').modal('toggle');

    var idCompany   = sessionStorage.getItem("ID_COMPANY");
    var Variables;

    if( isPiezometria ){
        Variables   = "idCompany=" + idCompany + "&idRecord=" + idRecord + "&arrayObservations=" +
        arrayObservations + "&arrayStates=" + arrayStates + "&piezometriaData=" + sessionStorage.getItem("piezometriaData");
    
        sessionStorage.removeItem("piezometriaData");
    }else{
        Variables   = "idCompany=" + idCompany + "&idRecord=" + idRecord + "&arrayObservations=" +
        arrayObservations + "&arrayStates=" + arrayStates + "&piezometriaData=" + [];

    }

    $.post("backend/updateRecord.php", Variables, function(DATA){
        if( DATA.ERROR ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
        
        }else{
            document.getElementById("containerTable").remove();

            ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
        }
    });
};

function updatePiezometria(){
    var numPit      = 14;
    var data        = [];
    var error       = false;

    for( var i=0; i<numPit + 1; i++ ){
        var valueData   = document.getElementById("pcg" + ( i ) + "Data").value;

        if( valueData == "" ){
            ModalReportEvent("Error", 28, "Debe rellenar todos los campos");
            error   = true;
            break;

        }else{
            valueData       = valueData.replace(/\,/g, ".");
            var auxValue    = valueData.split(".");

            if( auxValue.length > 2 ){
                ModalReportEvent("Error", 29, "El N° ingresado contiene carácteres incorrectos");
                
                document.getElementById("pcg" + ( i ) + "Data").value   = "";
                error   = true;
                break;
            
            }else{
                data[i] = parseFloat(valueData).toFixed(2);

            }
        }
    }

    if( !error ){
        $('#updatePiezometriaForm').modal('toggle');
        sessionStorage.setItem('piezometriaData', data);

        ModalReportEvent("Operación exitosa", "", "Se han almacenado los datos de piezometría exitosamente");
        setTimeout(() => {
            document.getElementById("selectPiezometria").value  = "Realizada";
        }, 500);
        
    }
};