function getRecord(idRecord, onlyRead){
    ShowSpinner();

    if( document.getElementById("containerTable") != null ){
        document.getElementById("containerTable").remove();
    }

    idRecord        = ( idRecord == -1 ) ? document.getElementById("idRecord").value : idRecord;
    var aux         = isValidIntegerNumber(idRecord);
    var isAdmin;

    if( document.getElementById("user-role").innerHTML == 'Administrador' ){
        isAdmin     = "1";

    }else{
        isAdmin     = "0";
    
    }

    if( aux == 0 ){
        setTimeout(()=>{
            CloseSpinner();
            document.getElementById("idRecord").value   = "";
        }, 500);

    }else{
        var username    = sessionStorage.getItem('USERNAME');
        var Variables   = 'idRecord=' + idRecord + "&username=" + username + "&isAdmin=" + isAdmin;

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
                var locationHeadCell        = document.createElement("th");
                var statusHeadCell          = document.createElement("th");
                var imagesHeadCell          = document.createElement("th");

                indexHeadCell.setAttribute("scope", "col");
                activityHeadCell.setAttribute("scope", "col");
                activityHeadCell.setAttribute("style", "width: 25%;");
                descriptionHeadCell.setAttribute("scope", "col3");
                locationHeadCell.setAttribute("scope", "col");
                statusHeadCell.setAttribute("scope", "col");
                imagesHeadCell.setAttribute("scope", "col");

                var indexHead       = document.createTextNode("N°");
                var activityHead    = document.createTextNode("Actividad");
                var descriptionHead = document.createTextNode("Observación");
                var locationHead    = document.createTextNode("Ubicación");
                var statusHead      = document.createTextNode("Estado");
                var imagesHead      = document.createTextNode("Imágenes");

                if( onlyRead ){
                    indexHeadCell.appendChild(indexHead);
                    activityHeadCell.appendChild(activityHead);
                    locationHeadCell.appendChild(locationHead);
                    descriptionHeadCell.appendChild(descriptionHead);
                    statusHeadCell.appendChild(statusHead);

                    rowHead.appendChild(indexHeadCell);
                    rowHead.appendChild(activityHeadCell);
                    rowHead.appendChild(locationHeadCell);
                    rowHead.appendChild(descriptionHeadCell);
                    rowHead.appendChild(statusHeadCell);
                
                }else{
                    indexHeadCell.appendChild(indexHead);
                    activityHeadCell.appendChild(activityHead);
                    descriptionHeadCell.appendChild(descriptionHead);
                    statusHeadCell.appendChild(statusHead);
                    imagesHeadCell.appendChild(imagesHead);

                    rowHead.appendChild(indexHeadCell);
                    rowHead.appendChild(activityHeadCell);
                    rowHead.appendChild(descriptionHeadCell);
                    rowHead.appendChild(statusHeadCell);
                    rowHead.appendChild(imagesHeadCell);

                }

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
                    var locationCell    = document.createElement("td");
                    var descriptionCell = document.createElement("td");
                    var statusCell      = document.createElement("td");
                    
                    // Here is storaged the content into a node
                    var index           = document.createTextNode( i + 1 );
                    var activity        = document.createTextNode( DATA[i].name );
                    var description, status, option1, option2;

                    if( onlyRead ){
                        var location    = document.createTextNode( DATA[i].location );
                        description     = document.createTextNode("");
                        status          = document.createTextNode("");

                        var target  = DATA[i].id;

                        for(var j=0; j<DATA.observations.length; j++){
                           var fullLine     = DATA.observations[j].replace(/\r\n/g, "");
                           var lineSplitted = fullLine.split("|");
                            
                            if( target == lineSplitted[0] ){
                                description.textContent     = lineSplitted[1];
                                break;
                            }
                        }

                        status.textContent  = ( DATA[i].state == '0') ? "Pendiente" : "Realizada";

                        // Here is inserted the content into the cells
                        indexCell.appendChild(index);
                        activityCell.appendChild(activity);
                        locationCell.appendChild(location);
                        descriptionCell.appendChild(description);
                        statusCell.appendChild(status);

                        // Here is inserted the cells into a row
                        row.appendChild(indexCell);
                        row.appendChild(activityCell);
                        row.appendChild(locationCell);
                        row.appendChild(descriptionCell);
                        row.appendChild(statusCell);
                        
                    }else{
                        var imageCell       = document.createElement("td");
                        var imageButton     = document.createElement("button");
                        var imageIcon       = document.createElement("span");
                        var textButton      = document.createTextNode("Adjuntar Imágenes");

                        imageIcon.setAttribute("class", "icon-image icon-space");
                        imageButton.setAttribute("class", "btn btn-primary");
                        imageButton.setAttribute("onclick", "javascript:openAttachFile(" + DATA[i].id + ")");

                        imageButton.appendChild(imageIcon);
                        imageButton.appendChild(textButton);

                        description         = document.createElement( "textarea" );
                        status              = document.createElement( "select" );
                        option1             = document.createElement( "option" );
                        option2             = document.createElement( "option" );

                        // Here we set the attributes
                        option1.text        = "Pendiente";
                        option2.text        = "Realizada";

                        status.add(option1);
                        status.add(option2);

                        var target  = DATA[i].id;

                        for(var j=0; j<DATA.observations.length; j++){
                            var fullLine     = DATA.observations[j].replace(/\r\n/g, "");
                            var lineSplitted = fullLine.split("|");
                             
                             if( target == lineSplitted[0] ){
                                 description.value  = lineSplitted[1];
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
//                            imageButton.disabled    = true;
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

                        // Here is inserted the content into the cells
                        indexCell.appendChild(index);
                        activityCell.appendChild(activity);
                        descriptionCell.appendChild(description);
                        statusCell.appendChild(status);
                        imageCell.appendChild(imageButton);

                        // Here is inserted the cells into a row
                        row.appendChild(indexCell);
                        row.appendChild(activityCell);
                        row.appendChild(descriptionCell);
                        row.appendChild(statusCell);
                        row.appendChild(imageCell);

                    }
                    
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
                    button.setAttribute("onclick", "javascript:openModalConfirmEvent(" + idRecord + ")");
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
                sessionStorage.setItem("ID_RECORD", idRecord);

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

function openModalConfirmEvent(idRecord){
    var table   = document.getElementById("tablePendingRecords").children[1];
    
    var arrayObservations   = [];
    var arrayStates         = [];
    var error               = false;

    for(var i=0; i<table.children.length; i++){
        var observation     = table.children[i].cells[2].children[0].value.replace(/\n/g, "");
        arrayObservations.push( observation.replace(/,/g, "|") );

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

        document.getElementById("btnConfirm").setAttribute("onclick", "updateRecord(" + idRecord + ", '" + arrayObservations + "', '" + arrayStates + "');");

        $('#ModalConfirmEvent').modal('show');
    }
};

function updateRecord(idRecord, arrayObservations, arrayStates){
    $('#ModalConfirmEvent').modal('toggle');
    ShowSpinner();

    piezometriaData     = sessionStorage.getItem("piezometriaData");
    piezometriaData == null ? [] : sessionStorage.removeItem("piezometriaData");


    var Variables   = "idRecord=" + idRecord + "&arrayObservations=" + arrayObservations + "&arrayStates=" + 
                        arrayStates + "&piezometriaData=" + piezometriaData;

    $.ajax({
        type:   "POST",
        url:    "backend/updateRecord.php",
        data:   Variables,
        success: function(DATA){
            console.log(DATA);
            if( DATA.ERROR ){
                setTimeout(()=>{
                    CloseSpinner();
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                }, 500);
            
            }else{
                document.getElementById("containerTable").remove();

                setTimeout(()=>{
                    CloseSpinner();
                    ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                }, 500);

            }
        },
        error: function (DATA) {
            setTimeout(()=>{
                CloseSpinner();
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            }, 500);
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

function openAttachFile(idActivity){

    // Multiple images preview in browser
    var imagesPreview = function(input, container) {

        if (input.files){
            var filesAmount = input.files.length;

            for (i = 0; i < filesAmount; i++) {
                var reader          = new FileReader();
                reader.onload = function(event) {
                    var containerImg    = document.createElement('div');
                    var button          = document.createElement('button');
                    
                    containerImg.setAttribute("class", "row");
                    containerImg.setAttribute("style", "height: 50%; margin-bottom: 5%;");

                    $($.parseHTML('<img>')).attr({
                        'src'   : event.target.result,
                        'class' : 'col-7 col-xs-7',
                        'style' : 'height: 100%;'
                    }).appendTo(containerImg);
                    
                    button.setAttribute("class", "btn btn-danger");
                    button.textContent = "Eliminar";

                    $(button).on('click', function(){
                        this.parentNode.remove();
                    });

                    containerImg.appendChild(button);
                    container.appendChild(containerImg);
                }

                reader.readAsDataURL(input.files[i]);
            }

              input.value  = "";
        }
    };

    $('#inputFiles').on('change', function() {
        imagesPreview(this, document.getElementById("containerAttachedFiles"));

        document.getElementById("btnStoreimages").setAttribute("onclick", "storeImages(" + idActivity + ");");
    });
    
    removeAllChildNodes( document.getElementById("containerAttachedFiles"));
    $('#attachFileForm').modal('show');
};

function storeImages(idActivity){
    $('#attachFileForm').modal('toggle');
    ShowSpinner();

    var container   = document.getElementById("containerAttachedFiles");
    var numImages   = container.children.length;
    var arrayIds    = [];
    var arrayFiles  = [];

    for( i=0; i<numImages; i++ ){
        arrayIds.push(idActivity);

        var src         = container.children[i].children[0].src;
        var imagen      = src.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

        arrayFiles.push(imagen);
    }

    var idRecord    = sessionStorage.getItem('ID_RECORD');
    var Variables   = "idRecord=" + idRecord + "&arrayIds=" + arrayIds + "&arrayFiles=" + arrayFiles;

    $.ajax({
        type:   "POST",
        url:    "backend/addImages.php",
        data:   Variables,
        success: function(DATA){
            console.log(DATA);
            
            setTimeout(()=>{
                CloseSpinner();
                ModalReportEvent("Operación exitosa", "", "Se han adjuntado las imagenes exitosamente");
            }, 500);
        },
        error: function (DATA) {
            console.log(DATA);
            
            setTimeout(()=>{
                CloseSpinner();
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            }, 500);
        }

    });

};