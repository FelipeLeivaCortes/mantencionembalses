
function initManuals(){
    document.getElementById("btnUploadDocument").disabled   = true;

    document.getElementById('documentToUpload').addEventListener('change', VerifyNameDocument, false);
    document.getElementById('formUploadDocument').addEventListener('submit', function(e){
        e.preventDefault();
            
        var description = document.getElementById("descriptionDocument").value;
        var file        = document.getElementById("documentToUpload").value;

        if( file != "" ){
            if( description != "" ){
                $('#uploadDocumentForm').modal('toggle');

                ShowSpinner();

                var formData    = new FormData(document.getElementById("formUploadDocument"));

                formData.append('nameFile', document.getElementById("documentToUpload").value.slice(12));
                formData.append('description', description);
                formData.append('username', sessionStorage.getItem('USERNAME'));

                $.ajax({
                    url: "backend/addDocument.php",
                    type: "post",
                    dataType: "html",
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false
                })
                .done(function(DATA){
                    DATA    = JSON.parse(DATA);
                    
                    if( DATA.ERROR ){
                        setTimeout(function(){
                            CloseSpinner();

                            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                        
                            document.getElementById('documentToUpload').value       = "";
                            document.getElementById("descriptionDocument").value   = "";
                        }, 500);

                    }else{
                        setTimeout(function(){
                            document.getElementById('documentToUpload').value       = "";
                            document.getElementById("descriptionDocument").value   = "";

                            getManuals();

                            ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                        }, 500);
                        
                    }
                });

            }else{
                ModalReportEvent("Error", 54, "No se ha agregado ninguna descripción al documento");
            }

        }else{
            ModalReportEvent("Error", 56, "No se ha seleccionado ningun documento");
        }

    });
        
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
    $.post("backend/getManuals.php", "", function(DATA){

        if( DATA.ERROR ){
            setTimeout(function(){
                CloseSpinner();
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            }, 500);
        
        }else{
            var table;
            var divTable;

            if( document.getElementById("tableManuals") == null ){
                divTable    = document.createElement("div");
                divTable.setAttribute("class", "table-modal table-reponsive-xl");
                divTable.setAttribute("id", "containerTable");
        
                table       = document.createElement("table");
                table.setAttribute("class", "table table-striped");
                table.setAttribute("id", "tableManuals");
        
                var thead               = document.createElement("thead");
                var rowHead             = document.createElement("tr");

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
                divTable    = document.getElementById("containerTable");
                table       = document.getElementById("tableManuals");
                ClearTable("tableManuals");

            }
            
            var bodyTable   = document.createElement("tbody");

            // Create the rows
            for (var i = 0; i < DATA.COUNT; i++){

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
                name.href           = "docs/empresa" + DATA[i].idCompany + "/" + DATA[i].name; 

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

                    btnEdit.setAttribute("onclick", "openModalEditDocument(" + DATA[i].id + ", '" + DATA[i].description + "'); return false;");
                    btnDel.setAttribute("onclick", "openModalDeleteDocument(" + DATA[i].id + "); return false;");


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

function openModalEditDocument(id, oldDescription){

    var currentNameFile = document.getElementById("row:" + id).cells[1].textContent.split(".");

//  The next tree lines are necessary to setup the confirmation windows to eject the edit function. 
    document.getElementById("headerEvent").innerHTML    = " Actualización de datos";
    document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea editar estos datos?";
    document.getElementById("btnConfirm").setAttribute("onclick", "editDocument(" + id + ", '" + currentNameFile[1] + "', '" + currentNameFile[0] + "', '" + oldDescription + "');");

    document.getElementById("newNameFile").value        = currentNameFile[0];
    document.getElementById("newDescription").value     = oldDescription;

    $('#editDocumentForm').modal('show');
};

function editDocument(idFile, extension, oldNameFile, oldDescription){
    var newNameFile     = document.getElementById("newNameFile").value + "." + extension;
    var newDescription  = document.getElementById("newDescription").value;

    oldNameFile         = oldNameFile + "." + extension;

    if( idFile == "" || newNameFile == "" || newDescription == "" ){
        ModalReportEvent("Error", 28, "Debe rellenar todos los campos");

    }else if( newNameFile == oldNameFile && newDescription == oldDescription ){
        $('#ModalConfirmEvent').modal('toggle');
        ModalReportEvent("Advertencia", "", "No se han realizado cambios");
    
    }else{
        $('#ModalConfirmEvent').modal('toggle');
        $('#editDocumentForm').modal('toggle');

        ShowSpinner();

        var Variables   = "idFile=" + idFile + "&newNameFile=" + newNameFile + "&newDescription=" + newDescription;

        $.post("backend/updateDocument.php", Variables, function(DATA){
            if( DATA.ERROR  == true ){
                setTimeout(function(){
                    CloseSpinner();

                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                }, 500);

            }else{
                setTimeout(function(){
                    getManuals();
                    ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
                }, 500);
            }
        });
    }
};

function openModalDeleteDocument(id){
    document.getElementById("headerEvent").innerHTML    = " Eliminar Documento";
    document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea eliminar el documento?";

    document.getElementById("btnConfirm").setAttribute("onclick", "deleteDocument(" + id + ");");
    $('#ModalConfirmEvent').modal('show');
};

function deleteDocument(id){
    $.post("backend/deleteDocument.php", "id=" + id, function(DATA){

        if( DATA.ERROR  == true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
        
        }else{
            ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);

            var table   = document.getElementById("tableManuals");
            var target  = "row:" + id;

            if( table.children[1].children.length > 1 ){
                for(var i=0; i<table.children[1].children.length; i++){
                    if( target == table.children[1].children[i].id ){
                        table.deleteRow(i + 1);

                        for(var j=i; j<table.children[1].children.length; j++){
                            table.children[1].children[j].cells[0].textContent  = j + 1;
                        }

                        break;
                    }
                }

            }else{
                document.getElementById("containerTable").remove();
            }
            
        }
    });
};