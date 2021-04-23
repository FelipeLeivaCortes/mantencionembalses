
function initManuals(){
    document.getElementById("btnUploadDocument").disabled   = true;

    document.getElementById('inputFile').addEventListener('change', VerifyNameDocument, false);
    $('#inputFile').on("change", handleDocumentEvent);
        
    getManuals();
};

function VerifyNameDocument(){
/*
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("documentToUpload");

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.pdf)$/;

    if( regex.test(fileUpload.value.toLowerCase()) ){
        document.getElementById("btnUploadDocument").disabled   = false;
            
    }else{
        ModalReportEvent("Error", 53, "El archivo ingresado no es tipo pdf");
        document.getElementById("btnUploadDocument").disabled   = true;
        document.getElementById("documentToUpload").value       = "";
    }
*/
    document.getElementById("btnUploadDocument").disabled   = false;
};

function getManuals(){

    $.post("backend/getDocuments.php", "type=Manual", function(DATA){

        if( DATA.ERROR ){
            setTimeout(function(){
                CloseSpinner();
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            }, 500);
        
        }else{
            var idConteiner = "myContainer";
            var idTable     = "myTable";
            var table;
            var divTable;

            if( document.getElementById(idConteiner) == null ){
                divTable    = document.createElement("div");
                divTable.setAttribute("class", "table-modal table-reponsive-xl");
                divTable.setAttribute("id", idConteiner);
        
                table       = document.createElement("table");
                table.setAttribute("class", "table table-striped");
                table.setAttribute("id", idTable);
        
                var thead                   = document.createElement("thead");
                var rowHead                 = document.createElement("tr");

                var indexHeadCell           = document.createElement("th");
                var nameHeadCell            = document.createElement("th");
                var descriptionHeadCell     = document.createElement("th");

                indexHeadCell.setAttribute("scope", "col");
                nameHeadCell.setAttribute("scope", "col");
                descriptionHeadCell.setAttribute("scope", "col");

                var indexHead       = document.createTextNode("N°");
                var nameHead        = document.createTextNode("Nombre");
                var descriptionHead = document.createTextNode("Descripción");

                indexHeadCell.appendChild(indexHead);
                nameHeadCell.appendChild(nameHead);
                descriptionHeadCell.appendChild(descriptionHead);

                rowHead.appendChild(indexHeadCell);
                rowHead.appendChild(nameHeadCell);
                rowHead.appendChild(descriptionHeadCell);

            //  This option is only able to the administrators 
                if( document.getElementById('user-role').innerHTML == 'Administrador' ){
                    var actionsHeadCell         = document.createElement("th");
                    actionsHeadCell.setAttribute("scope", "col");
                    
                    var actionsHead     = document.createTextNode("Acciones");
                    actionsHeadCell.appendChild(actionsHead);

                    rowHead.appendChild(actionsHeadCell);
                }

                thead.appendChild(rowHead);
                table.appendChild(thead);
            
            }else{
                divTable    = document.getElementById(idConteiner);
                table       = document.getElementById(idTable);
                ClearTable(idTable);

            }
            
            var bodyTable   = document.createElement("tbody");

            // Create the rows
            for (var i=0; i < DATA.COUNT; i++){

                // Here is created every row
                var row             = document.createElement("tr");
                row.setAttribute("id", "row:" + DATA[i].id);

                // Here is created every cell
                var indexCell	    = document.createElement("td");
                var nameCell	    = document.createElement("td");
                var descriptionCell = document.createElement("td");
                
                // Here is storaged the content into a node
                var index           = document.createTextNode( i + 1 );
                var name            = document.createElement("a");
                var description     = document.createElement("a");
                var linkName        = document.createTextNode( DATA[i].name );
                var linkDescription = document.createTextNode( 'Ver Descripción' );

                // Here we set the attributes
                name.appendChild(linkName);

                var pathSplitted    = DATA.fakepath.split("/");
                var url             = "";

                for(var x=1; x<pathSplitted.length; x++){
                    url = url == "" ? "/mantencionembalses/" + pathSplitted[x] : url + "/" + pathSplitted[x];
                }

                name.href   = url + DATA[i].name;

                description.appendChild(linkDescription);
                description.href    = "javascript:showDescription('" + DATA[i].description + "');";

                // Here is inserted the content into the cells
                indexCell.appendChild(index);
                nameCell.appendChild(name);
                descriptionCell.appendChild(description);

                // Here is inserted the cells into a row
                row.appendChild(indexCell);
                row.appendChild(nameCell);
                row.appendChild(descriptionCell);

                //  This option is only able to the administrators 
                if( document.getElementById('user-role').innerHTML == 'Administrador' ){
                    var actionsCell	    = document.createElement("td");

                    var btnEdit         = document.createElement("button");
                    var btnDel          = document.createElement("button");
                    var spanEdit        = document.createElement("span");
                    var spanDel         = document.createElement("span");
                    var textEdit        = document.createElement("textNode");
                    var textDel         = document.createElement("textNode");

                    spanEdit.setAttribute("class", "icon-edit icon-space");
                    spanDel.setAttribute("class", "icon-circle-with-cross icon-space");

                    textEdit.textContent    = "Editar";
                    textDel.textContent     = "Eliminar";
                    
                    btnEdit.style.marginRight   = "1%";
                    btnEdit.style.float         = "left";

                    btnEdit.appendChild(spanEdit);
                    btnEdit.appendChild(textEdit);

                    btnDel.appendChild(spanDel);
                    btnDel.appendChild(textDel);

                    btnEdit.className   = "btn btn-warning sm-btn";
                    btnDel.className    = "btn btn-danger sm-btn";

                    btnEdit.setAttribute("onclick", "openModalEditDocument(" + DATA[i].id + ", '" + DATA[i].description + "', 'Manual'); return false;");
                    btnDel.setAttribute("onclick", "openModalDeleteDocument(" + DATA[i].id + ", 'Manual'); return false;");


                    actionsCell.appendChild(btnEdit);
                    actionsCell.appendChild(btnDel);

                    row.appendChild(actionsCell);
                }

                // Here is inserted the row into the table´s body
                bodyTable.appendChild(row);
            }

            // Here is inserted the body´s table into the table
            table.appendChild(bodyTable);
            divTable.appendChild(table);
            document.getElementById("body-container").appendChild(divTable);

            CloseSpinner();
        }
    });
};

function showDescription(description){
    document.getElementById("descriptionManual").value  = description;
    $('#descriptionForm').modal('show');
};

function openModalEditDocument(id, oldDescription, type){

    var currentNameFile = document.getElementById("row:" + id).cells[1].textContent.split(".");

//  The next tree lines are necessary to setup the confirmation windows to eject the edit function. 
    document.getElementById("headerEvent").innerHTML    = " Actualización de datos";
    document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea editar estos datos?";
    document.getElementById("btnConfirm").setAttribute("onclick", "editDocument(" + id + ", '" + currentNameFile[1] + "', '" + currentNameFile[0] + "', '" + oldDescription + "', '" + type + "');");

    document.getElementById("newNameFile").value        = currentNameFile[0];
    document.getElementById("newDescription").value     = oldDescription;

    $('#editDocumentForm').modal('show');
};

function editDocument(idFile, extension, oldName, oldDescription, type){
    var newName         = document.getElementById("newNameFile").value + "." + extension;
    var newDescription  = document.getElementById("newDescription").value;

    oldName             = oldName + "." + extension;

    if( idFile == "" || newName == "" || newDescription == "" ){
        ModalReportEvent("Error", 28, "Debe rellenar todos los campos");

    }else if( newName == oldName && newDescription == oldDescription ){
        $('#ModalConfirmEvent').modal('toggle');
        ModalReportEvent("Advertencia", "", "No se han realizado cambios");
    
    }else{
        $('#ModalConfirmEvent').modal('toggle');
        $('#editDocumentForm').modal('toggle');

        ShowSpinner();

        var data    = new FormData();
        data.append("idFile", idFile);
        data.append("type", type);
        data.append("newName", newName);
        data.append("newDescription", newDescription);

        $.ajax({
            url:            "backend/updateDocument.php",
            type:           "POST",
            data:           data,
            contentType:    false,
            processData:    false,
            success:        function(DATA){
                if( DATA.ERROR  == true ){
                    setTimeout(function(){
                        CloseSpinner();
                        ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

                    }, 500);
    
                }else{
                    setTimeout(function(){
                        if( type == "Manual" ){
                            getManuals();

                        }else if( type == "Event" ){
                            document.getElementById("aboutDocumentName").value          = newName;
                            document.getElementById("aboutDocumentDescription").value   = newDescription;

                            getDocumentEvent();

                        }

                        ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);

                    }, 500);
                }

            },
            error:          function(DATA){
                console.log(DATA);
            }
        });

    }
};

function openModalDeleteDocument(id, type){
    document.getElementById("headerEvent").innerHTML    = " Eliminar Documento";
    document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea eliminar el documento?";

    document.getElementById("btnConfirm").setAttribute("onclick", "deleteDocument(" + id + ", '" + type + "');");
    $('#ModalConfirmEvent').modal('show');
};

function deleteDocument(id, type){
    var data    = new FormData();

    data.append("id", id);
    data.append("type", type);

    $.ajax({
        url:            "backend/deleteDocument.php",
        type:           "POST",
        data:           data,
        contentType:    false,
        processData:    false,
        success:        function(DATA){

            if( DATA.ERROR  == true ){
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            
            }else{
                if( type == "Event" ){
                    $("#aboutDocumentForm").modal("toggle");
                }

                ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
    
                var table   = document.getElementById("myTable");
                var target  = "row:" + id;
                var index   = 0;

                if( table.children[1].children.length > 1 ){
                    for(var i=0; i<table.children[1].children.length; i++){
                        if( target == table.children[1].children[i].id ){
                            table.children[1].children[i].remove();
                            index   = i;

                            break;
                        }
                    }

                    for(var j=index; j<table.children[1].children.length; j++){
                        table.children[1].children[j].cells[0].textContent  = j + 1;
                    }
    
                }else{
                    document.getElementById("myContainer").remove();
                }
                
            }

        },
        error:          function(DATA){
            console.log(DATA);
        }
    });
};

function handleDocumentEvent(e){
    var files       = e.target.files;
    var filesArr    = Array.prototype.slice.call(files);
    
    filesArr.forEach(function(f) {
        if(!f.type.match(".doc") && !f.type.match(".docx") && !f.type.match(".pdf")){
            ModalReportEvent("Error", 86, "Se ha ingresado un documento incorrecto");
            document.getElementById("inputFile").value  = "";

        }else{
            storedFiles.push(f);
    
            var reader = new FileReader();
            reader.readAsDataURL(f);

        }        
    });
};

function addDocument(type){
    var file        = document.getElementById("inputFile").files;
    var description = document.getElementById("descriptionDocument").value;
    var source      = type == "Event" ? document.getElementById("typeEvent").value  : "";

    if( type == "Manual" || type == "Event" ){
        if( description == "" ){
            ModalReportEvent("Error", 54, "No se ha agregado ninguna descripción al documento");
        
        }else if( file.length == 0 ){
            ModalReportEvent("Error", 88, "Debe seleccionar algún documento");
        
        }else{

            if( type == "Event" ){
                if( source == "Internal" ){
                    source  = "Interno";
                
                }else if( source == "External" ){
                    source  = "Externo";
                
                }else{
                    return;
                }
            }

            ShowSpinner();
            $("#addDocumentForm").modal("toggle");
            
            var formData    = new FormData();
            formData.append("file", document.getElementById("inputFile").files[0]);
            formData.append("username", sessionStorage.getItem('USERNAME'));
            formData.append("description", description);
            formData.append("source", source);
    
            if( type == "Manual" ){
                formData.append("type", "Manual");
            
            }else if( type == "Event" ){
                formData.append("type", "Event");
            }
            
            $.ajax({
                url:            "backend/addDocument.php",
                type:           "POST",
                data:           formData,
                contentType:    false,
                processData:    false,
                success:        function(DATA){
                    document.getElementById("inputFile").value              = "";
                    document.getElementById("descriptionDocument").value    = "";
    
                    if( DATA.ERROR ){
                        setTimeout(()=>{
                            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                            CloseSpinner();
                        }, 500);
                        
                    }else{
                        setTimeout(()=>{
                            if( type == "Manual" ){
                                getManuals();
                            }
    
                            ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                            CloseSpinner();
                        }, 500);
    
                    }
    
                },
                error:          function(DATA){
                    console.log(DATA);
                }
            });
        }

    }else{

    }
};