
function initManuals(){
    document.getElementById("btnUploadDocument").disabled   = true;

    document.getElementById('inputFile').addEventListener('change', ()=>{
        document.getElementById("btnUploadDocument").disabled   = false;
    }, false);

    $('#inputFile').on("change", handleDocumentEvent);
        
    getManuals();
};

function getManuals(){
    let data    = new FormData();
    data.append("type", "Manual");
    data.append("sourceDocument", "");
    data.append("typeDocument", "");

    $.ajax({
        url:            "backend/getDocuments.php",
        type:           "POST",
        data:           data,
        contentType:    false,
        processData:    false,
        error:          (error)=>{console.log(error)},
        success:        (response)=>{
            setTimeout(()=>{
                CloseSpinner();

                if(response.ERROR){
                    ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
            
                }else{
                    let idTable     = "myTable";
                    let header;
                    let types       = ["Text","Link","Link"];
                    let permission  = sessionStorage.getItem("PERMISSIONS");

                    if(permission == "\"1000\""){
                        types.push("Button");
                        header  = {
                            0:  {   name:   "N°",
                                    width:  "5%"      },
                            1:  {   name:   "Nombre",
                                    width:  "10%"   },
                            2:  {   name:   "Descripción",
                                    width:  "10%"   },
                            3:  {   name:   "Acciones",
                                    width:  "20%"   },
                            length:     4,
                            father: {   id: "body-container",
                                        style: "height: 300px; overflow: scroll"
                            }
                        }
                    }else{
                        header  = {
                            0:  {   name:   "N°",
                                    width:  "5%"      },
                            1:  {   name:   "Nombre",
                                    width:  "10%"   },
                            2:  {   name:   "Descripción",
                                    width:  "10%"   },
                            length:     3,
                            father:     "body-container"
                        }
                    }

                    table   = new Table(
                        idTable,
                        header,
                        header.length,
                        false
                    );
                    
                    for(var i=0; i<response.count; i++){
                        let data        = [];

                        let name        = { content:    response[i].name,
                                            function:   "mantancionembalses/" + response.fakepath + response[i].name,
                                        };

                        let description = { content:    "Ver Descripción",
                                            function:   "javascript:showDescription('" + response[i].description + "')",                
                                        };

                        let buttons     = { 
                                            0: {    text:       "Editar",
                                                    styleBtn:   "margin-right: 2%",
                                                    classBtn:   "btn btn-warning btn-sm",
                                                    classIcon:  "icon-edit icon-space",
                                                    action:     "javascript:openModalEditDocument(" + response[i].id + ",'" + response[i].description + "','Manual')"
                                                },
                                            1: {    text:       "Eliminar",
                                                    styleBtn:   "",
                                                    classBtn:   "btn btn-danger btn-sm",
                                                    classIcon:  "icon-circle-with-cross icon-space",
                                                    action:     "javascript:openModalDeleteDocument(" + response[i].id + ", 'Manual')"
                                                },
                                            items: 2
                                        };

                        if(permission == "\"1000\""){
                            data    = [ i + 1,
                                        name,
                                        description,
                                        buttons
                                    ];       
                        }else{
                            data    = [ i + 1,
                                        name,
                                        description
                                    ];
                        }

                        table.addRow(types, data, "row:" + response[i].id);
                    }
                    
                    table.encapsulate();
                }
            }, delay);
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
                            var table   = document.getElementById("myTable");
                            var target  = "row:" + idFile;
        
                            for(var i=0; i<table.children[1].children.length; i++){
                                if( target == table.children[1].children[i].id ){
            
                                    // Updating the icon and value in the state cell
                                    var documentCell        = table.children[1].children[i].cells[1].children[0];
                                    var arrayParameters     = documentCell.href.split(",");
                                    var linkCell            = table.children[1].children[i].cells[1].children[0];
        
                                    var attrbuteName    = "";
                                    var attrDescription = "";

                                    linkCell.href       = "";

                                    // If the user changed the name
                                    if( oldName != newName ){
                                        document.getElementById("aboutDocumentName").value  = newName;
                                        attrbuteName                = newName;

                                        documentCell.textContent    = newName;
                                    }else{
                                        attrbuteName                = oldName;

                                    }

                                        // If the user changed the description
                                    if( oldDescription != newDescription ){
                                        document.getElementById("aboutDocumentDescription").value   = newDescription;
                                        attrDescription = newDescription;

                                    }else{
                                        attrDescription = oldDescription;

                                    }

                                    linkCell.href   = "javascript:openModalAboutDocument(" + idFile + "," + arrayParameters[1] +
                                        "," + arrayParameters[2] + ",'" + attrbuteName + "','" + attrDescription + "', 'Event');";           
        
                                    

                                    break;
                                }

                            }

                        }

                        CloseSpinner();
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
        error:          (error)=>{console.log(error)},
        success:        (response)=>{
            if( response.ERROR  == true ){
                ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
            
            }else{
                if( type == "Event" ){
                    $("#aboutDocumentForm").modal("toggle");
                }

                ModalReportEvent("Operación Exitosa", "", response.MESSAGE);
    
                let idTable = "myTable";
                var table   = document.getElementById(idTable);
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
                    document.getElementById("container:" + idTable).remove();
                }
                
            }
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

            $("#addDocumentForm").modal("toggle");
            ShowSpinner();
            
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
                error:          (error)=>{console.log(error)},
                success:        (response)=>{
                    setTimeout(()=>{
                        
                        document.getElementById("inputFile").value              = "";
                        document.getElementById("descriptionDocument").value    = "";
        
                        CloseSpinner();

                        if(response.ERROR){
                            ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                            
                        }else{
                            ModalReportEvent("Operación exitosa", "", response.MESSAGE);

                            if( type == "Manual" ){
                                getManuals();
                            }
                        }
                    }, delay);    
                }
            });
        }
    }
};