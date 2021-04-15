var selDiv = "";
var storedFiles = [];

function initMaintances(){
    
    $("body").on("click", ".selFile", removeFile);
    $("#inputFiles").on("change", handleInputs);
    $("#btnStoreimages").on("click", sendDocuments);
    selDiv  = $('#selectedFiles');

    setTimeout(()=>{
        CloseSpinner();
    }, 500);
}

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
console.log(DATA);
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
                descriptionHeadCell.setAttribute("style", "width: 30%;");
                locationHeadCell.setAttribute("scope", "col");
                statusHeadCell.setAttribute("scope", "col");
                imagesHeadCell.setAttribute("scope", "col");

                var indexHead       = document.createTextNode("N°");
                var activityHead    = document.createTextNode("Actividad");
                var descriptionHead = document.createTextNode("Observación");
                var locationHead    = document.createTextNode("Ubicación");
                var statusHead      = document.createTextNode("Estado");
                var imagesHead      = document.createTextNode("Anexos");

                if( onlyRead ){
                    indexHeadCell.appendChild(indexHead);
                    activityHeadCell.appendChild(activityHead);
                    locationHeadCell.appendChild(locationHead);
                    descriptionHeadCell.appendChild(descriptionHead);
                    statusHeadCell.appendChild(statusHead);
                    imagesHeadCell.appendChild(imagesHead);

                    rowHead.appendChild(indexHeadCell);
                    rowHead.appendChild(activityHeadCell);
                    rowHead.appendChild(locationHeadCell);
                    rowHead.appendChild(descriptionHeadCell);
                    rowHead.appendChild(statusHeadCell);
                    rowHead.appendChild(imagesHeadCell);

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
                    var annexesCell     = document.createElement("td");
                    
                    // Here is storaged the content into a node
                    var index           = document.createTextNode( i + 1 );
                    var activity        = document.createTextNode( DATA[i].name );
                    var description, status, option1, option2;

                    if( onlyRead ){
                        var annexeLink  = document.createElement("a");
                        var annexeText  = document.createTextNode("Ver Anexos");
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

                        if( DATA.annexes[i] ){
                        // The function GetAnnexes is in records.js file
                            annexeLink.href     = "javascript:showImages(" + DATA[i].id + ", " + idRecord + ")";
                            annexeLink.appendChild(annexeText);
                        
                        }else{
                            annexeText.textContent  = "No Presenta";
                            annexeLink.appendChild(annexeText);

                        }

                        status.textContent  = ( DATA[i].state == '0') ? "Pendiente" : "Realizada";

                        // Here is inserted the content into the cells
                        indexCell.appendChild(index);
                        activityCell.appendChild(activity);
                        locationCell.appendChild(location);
                        descriptionCell.appendChild(description);
                        statusCell.appendChild(status);
                        annexesCell.appendChild(annexeLink);

                        // Here is inserted the cells into a row
                        row.appendChild(indexCell);
                        row.appendChild(activityCell);
                        row.appendChild(locationCell);
                        row.appendChild(descriptionCell);
                        row.appendChild(statusCell);
                        row.appendChild(annexesCell);
                        
                    }else{
                        var imageButton     = document.createElement("button");
                        var imageIcon       = document.createElement("span");
                        var textButton      = document.createTextNode("Adjuntar Documentos");

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

                        $(description).keypress(function(event){
                            if( event.charCode == 124 ){   
                                return false;
                            }
                        });

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
                            imageButton.disabled    = true;
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
                        annexesCell.appendChild(imageButton);

                        // Here is inserted the cells into a row
                        row.appendChild(indexCell);
                        row.appendChild(activityCell);
                        row.appendChild(descriptionCell);
                        row.appendChild(statusCell);
                        row.appendChild(annexesCell);

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
                    
                // Adding the mandated associated to the guide, and the date of this.
                    document.getElementById("userMandated").value   = DATA.name_mandated + " " + DATA.lastname_mandated;
                    document.getElementById("dateStart").value      = FormatDate(DATA.dateStart);
               
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
    sessionStorage.setItem("ID_ACTIVITY", idActivity);

    removeAllChildNodes(document.getElementById("selectedFiles"));
    $('#attachFileForm').modal('show');
};

function handleInputs(e){
    var files       = e.target.files;
    var filesArr    = Array.prototype.slice.call(files);
    
    filesArr.forEach(function(f) {
        if(!f.type.match("image.*") && !f.type.match(".pdf")){
            ModalReportEvent("Error", 86, "Se ha ingresado un documento incorrecto");
            return;
        }

        storedFiles.push(f);
        
        var reader = new FileReader();
        reader.onload = function (e) {
            if( f.type.match("image.*") ){
                var html = "<div><img style='width: 250; height: 250; margin-bottom: 5%;' src=\"" + e.target.result + "\" data-file='"+f.name+"' class='selFile' title='Click para quitar'>" + f.name + "<br clear=\"left\"/></div>";
                selDiv.append(html);
            
            }else{
                var html = "<div><img style='width: 100; height: 100; margin-bottom: 5%;' src='img/logo_pdf.svg' data-file='"+f.name+"' class='selFile' title='Click para quitar'>" + f.name + "<br clear=\"left\"/></div>";
                selDiv.append(html);

            }
            
        }
        reader.readAsDataURL(f); 
    });
    
};

function removeFile(e) {
    var file = $(this).data("file");

    for(var i=0;i<storedFiles.length;i++) {
        if(storedFiles[i].name === file) {
            storedFiles.splice(i,1);
            break;
        }
    }

    $(this).parent().remove();
};

function sendDocuments(e){
    $('#attachFileForm').modal('toggle');
    ShowSpinner();

    e.preventDefault();
    var formData    = new FormData();
    var i           = 0;

    for( i=0; i<storedFiles.length; i++) {
        formData.append('file_' + i, storedFiles[i]);
        console.log(storedFiles[i]);
    }

    formData.append('count', i);
    formData.append('idRecord', sessionStorage.getItem("ID_RECORD"));
    formData.append('idActivity', sessionStorage.getItem("ID_ACTIVITY"));

    $.ajax({
        url:            "backend/addAnnexes.php",
        type:           "POST",
        data:           formData,
        contentType:    false,
        processData:    false,
        success:        function(DATA){
            console.log(DATA);

            if( DATA.ERROR ){
                setTimeout(()=>{
                    CloseSpinner();
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                }, 500);
                
            }else{
                setTimeout(()=>{
                    CloseSpinner();
                    ModalReportEvent("Operación exitosa", DATA.ERRNO, DATA.MESSAGE);
                    document.getElementById("inputFiles").value = "";
                    storedFiles = [];
                }, 500);

            }

        },
        error:          function(DATA){
            console.log(DATA);
        }
    });

};



/*
function openAttachFile(idActivity){
    $("#inputFiles").on("change", function(){
        ShowSpinner();

// Cleanning the preview div
        

        var files       = document.getElementById('inputFiles').files;
        var navegador   = window.URL || window.webkitURL;
        
// Verifing all the input files
        for( var x=0; x<files.length; x++){

// Getting the size, type and name file
            var size    = 1024*1024*5;
            var types   = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            var name    = files[x].name;

            if( files[x].size > size ){
                $("#containerAttachedFiles").append("<p style='color: red'>El archivo "+name+" supera el máximo permitido 1MB</p>");
            
            }else if( files[x].type != types[0] && files[x].type != types[1] && files[x].type != types[2] && files[x].type != types[3] ){
                $("#containerAttachedFiles").append("<p style='color: red'>El archivo "+name+" no es del tipo de imagen permitida.</p>");
            
            }else{
                var objeto_url          = navegador.createObjectURL(files[x]);
                var containerGallery    = document.getElementById("containerAttachedFiles");
                var containerImagen     = document.createElement("div");
                var button              = document.createElement("button");
                var iconButton          = document.createElement("span");
                var textButton          = document.createTextNode("Eliminar");

                containerImagen.setAttribute("class", "row");
                iconButton.setAttribute("class", "icon-circle-with-cross icon-space");
                button.setAttribute("class", "btn btn-danger");
                button.setAttribute("style", "margin-left: 5%;");
                button.appendChild(iconButton);
                button.appendChild(textButton);
                button.addEventListener("click", function(event){
                    alert("Deleting ...");
                });

                var img                 = document.createElement("img");
                img.setAttribute("src", objeto_url);
                img.setAttribute("style", "width: 250; height: 250; margin-bottom: 5%;");
                img.setAttribute("class", "col-7");

                containerImagen.appendChild(img);
                containerImagen.appendChild(button);

                containerGallery.appendChild(containerImagen);

            }
        }

        setTimeout(()=>{
            var test    = files;
            sessionStorage.setItem('Files', test);
            document.getElementById('inputFiles').value = "";
            
            CloseSpinner();
        }, 1000);
    });
    
    $("#btnStoreimages").on("click", function(){
        ShowSpinner();
        document.getElementById('inputFiles').value = sessionStorage.getItem('Files');
        var formData    = new FormData($("#formImages")[0]);        
        formData.append('idRecord', sessionStorage.getItem("ID_RECORD"));
/*
        $.ajax({
            url:            "backend/addImages.php",
            type:           "POST",
            data:           formData,
            contentType:    false,
            processData:    false,
            success:        function(DATA){
                console.log(DATA);

                if( DATA.ERROR ){
                    setTimeout(()=>{
                        ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                        CloseSpinner();
                    }, 500);
                    
                }else{
                    setTimeout(()=>{
                        ModalReportEvent("Operación exitosa", DATA.ERRNO, DATA.MESSAGE);
                        CloseSpinner();
                    }, 500);

                }

            }
        });
    });
    
    $('#attachFileForm').modal('show');
};







/*


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

}; */