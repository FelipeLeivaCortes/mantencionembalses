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

    if( document.getElementById("containerTable") != null ){
        document.getElementById("containerTable").remove();
    }

    idRecord    = idRecord == -1 ? document.getElementById("idRecord").value : idRecord;
    let isAdmin = document.getElementById("user-role").innerHTML == 'Administrador' ? "1" : "0";
    
    let record  = new Guide(idRecord,"",[],"");
    
    //if(!record.isValidId()){ delete record; return }

    record.get(
        sessionStorage.getItem('USERNAME'),
        isAdmin
    );

    ShowSpinner();

    setTimeout(()=>{
        if(record.lastOperation){
            sessionStorage.setItem("ID_RECORD", idRecord);
            document.getElementById("idRecord").value       = "";

            var table   = "";
            let types   = [];

            switch(isAdmin){
                case "1":
                    document.getElementById("userMandated").value   = record.username;
                    document.getElementById("dateStart").value      = record.dateEmitted;

                    types   = ["Text","Text","Text","Text","Text"];

                    table   = new Table(
                        "tablePendingRecords",
                        types,
                        7
                    );
                    table.clear();

                    for(let i=0; i<record.activities.length; i++){
                        let data    = [];

                        let observation = record.observations[i] == "" ? "No Presenta" : record.observations[i];

                        let state       = record.states[i] == "1" ? "Realizada" : "Pendiente"; 
                        let annexe      = "";

                        if(record.annexes[i]){
                            types.push("Link");
                            types.push("Text");
                            annexe  = { content:     "Ver Anexos",
                                        function:   "javascript:showImages(" + record.activities[i].id + "," + record.id + ")",
                                    }
        
                        }else{
                            types.push("Text");
                            types.push("Text");
                            annexe  = "No Presenta";
                        }

                        let importance  = record.importances[i] == "0" ? "Normal" : "Urgente";
        
                        data    = [ i + 1,
                                    record.activities[i].name,
                                    observation,
                                    record.activities[i].location,
                                    state,
                                    annexe,
                                    importance
                                ];
        
                        table.addRow(types, data, "");
                    }
                    
                    table.encapsulate();

                    document.getElementById("printPdfBtn").setAttribute("onclick", "printRecord(" + record.id + ")");

                    $('#searchRecordForm').modal('show');

                    break;

                case "0":
                    let idTable = "tablePendingRecords";

                    try{
                        document.getElementById("container:" + idTable).remove();
                    }catch(e){
                        console.log("No se puede eliminar un elemento inexistente");
                    }

                    let header  = {
                        0:  {   name:   "N°",
                                width:  "5%"      },
                        1:  {   name:   "Actividad",
                                width:  "10%"   },
                        2:  {   name:   "Observación",
                                width:  "10%"   },
                        3:  {   name:   "Ubicación",
                                width:  "20%"      },
                        4:  {   name:   "Estado",
                                width:  "15%"      },
                        5:  {   name:   "Anexos",
                                width:  "15%"      },
                        6:  {   name:   "Importancia",
                                width:  "15%"      },
                        length:     7,
                        table:  {
                                    width:  "width: 120%",
                                },     
                        father: {   id:     "body-container",
                                    style:  "height: 300px; overflow: scroll"
                                }
                    }

                    table   = new Table(
                        idTable,
                        header
                    );

                    types   = ["Text","Text","TextArea","Text","Select","Button","Select"];

                    for(let i=0; i<record.activities.length; i++){
                        let data        = [];
                        let state       = { type:       "state",
                                            value:      record.states[i],
                                            options:    ["Realizada", "Pendiente"]
                                        };
                        let button      = { 
                            0:  {   text:       "Adjuntar Documento",
                                    styleBtn:   "",
                                    classBtn:   "btn btn-primary btn-sm",
                                    classIcon:  "icon-image icon-space",
                                    action:     "javascript:openAttachFile(" + record.activities[i].id + ");"},
                            items:  1,
                        };

                        let importance  = { type:       "importance",
                                            value:      record.importances[i],
                                            options:    ["Normal", "Urgente"]
                                        };
        
                        data            = [ i + 1,
                                            record.activities[i].name,
                                            record.observations[i],
                                            record.activities[i].location,
                                            state,
                                            button,
                                            importance
                                        ];
        
                        table.addRow(types, data, "");

                        setTimeout(()=>{
                            let select = table.table.children[1].rows[i];

                            if(record.activities[i].name == 'realizar piezometría'){
                                select.cells[4].children[0].setAttribute("id", "selectPiezometria");
                                select.cells[4].children[0].addEventListener("change", function(){
                                    if( this.value == 'Realizada' ){
                                        $('#updatePiezometriaForm').modal('show');
                                    }
                                });
        
                                $("#updatePiezometriaForm").on('hidden.bs.modal', function (){
                                    document.getElementById("selectPiezometria").value  = "Pendiente";
                                });
                            }

                            if(record.states[i] == "1"){
                                let disabled    = true;

                                select.cells[2].children[0].disabled = disabled;
                                select.cells[4].children[0].disabled = disabled;
                                select.cells[5].children[0].disabled = disabled;
                                select.cells[6].children[0].disabled = disabled;
                            
                            }
                        }, 500);
                    }
                    
                    table.encapsulate();

                    if(record.state == "0"){
                        var containerButton     = document.createElement("div");
                        var button              = document.createElement("button");
                        var span                = document.createElement("span");
                        var textButton          = document.createElement("textNode");

                        textButton.textContent  = "Guardar";

                        containerButton.setAttribute("class", "container-fluid d-flex justify-content-center");
                        span.setAttribute("class", "icon-edit");
                        button.setAttribute("class", "btn btn-primary");
                        button.setAttribute("data-toggle", "modal");

                        button.onclick  = function(){
                            let prefixTable         = table.table.children[1];

                            let arrayObservations   = [];
                            let arrayStates         = [];
                            let arrayImportances    = [];

                            for(var i=0; i<prefixTable.children.length; i++){
                                let auxObservation     = prefixTable.children[i].cells[2].children[0].value.replace(/\n/g, "");
                                let observation         = auxObservation.replace(/,/g, "|");
                                arrayObservations.push(observation);

                                switch(prefixTable.children[i].cells[4].children[0].value){
                                    case "Pendiente":
                                        arrayStates.push("0");
                                        break;

                                    case "Realizada":
                                        arrayStates.push("1");
                                        break;

                                    default:
                                        ModalReportEvent("Error", 63, "El estado de la fila " + (i + 1) + " ha sido modificado incorrectamente");
                                        return;
                                }

                                switch(prefixTable.children[i].cells[6].children[0].value){
                                    case "Normal":
                                        arrayImportances.push("0");
                                        break;

                                    case "Urgente":
                                        arrayImportances.push("1");
                                        break;

                                    default:
                                        ModalReportEvent("Error", 93, "La importancia de la actividad en la fila " + (i + 1) + " ha sido modificado incorrectamente");
                                        return;
                                }
                            }

                            document.getElementById("headerEvent").innerHTML    = " Actualizar guía de mantención";
                            document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea guardar los cambios?";

                            document.getElementById("btnConfirm").onclick       = function(){
                                $('#ModalConfirmEvent').modal('toggle');
                                
                                piezometriaData     = sessionStorage.getItem("piezometriaData");
                                piezometriaData == null ? [] : sessionStorage.removeItem("piezometriaData");
                            
                                record.observations = arrayObservations;
                                record.states       = arrayStates;
                                record.piezometrias = piezometriaData;
                                record.importances  = arrayImportances;

                                record.update();
                            
                                setTimeout(()=>{
                                    if(record.lastOperation){
                                        document.getElementById("container:" + idTable).remove();
                                    }
                                }, 1000);
                            }
                            
                            $('#ModalConfirmEvent').modal('show');
                        };

                        button.appendChild(textButton);
                        button.appendChild(span);
                        containerButton.appendChild(button);
                        document.getElementById("container:" + idTable).appendChild(containerButton);
                    }

                    break;

                default:
                    ModalReportEvent("Error", 100, "Opción no válida");
                    break;
            }
        }
    }, 1000);
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