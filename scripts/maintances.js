var selDiv              = "";
var storedFiles         = [];

async function initMaintances(){
    $("body").on("click", ".selFile", removeFile);
    $("#inputFiles").on("change", handleInputs);
    $("#btnStoreimages").on("click", sendDocuments);
    selDiv  = $('#selectedFiles');

    setTimeout(()=>{
        CloseSpinner();
    }, delay);

}

async function getRecord(idRecord){

    if( document.getElementById("containerTable") != null ){
        document.getElementById("containerTable").remove();
    }

    idRecord    = idRecord == -1 ? document.getElementById("idRecord").value : idRecord;
    let isAdmin = document.getElementById("user-role").innerHTML == 'Administrador' ? "1" : "0";
    
    let record  = new Guide(idRecord,"",[],"");

    let status  = await record.get(
        sessionStorage.getItem('USERNAME'),
        isAdmin
    );

    if(status){
        ShowSpinner();

        sessionStorage.setItem("ID_RECORD", idRecord);
        document.getElementById("idRecord").value       = "";

        var table       = "";
        let types       = [];
        let idFather    = "body-container";
        let idTable     = "tablePendingRecords";

        switch(isAdmin){
            case "1":
                document.getElementById("userMandated").value   = record.username;
                document.getElementById("dateStart").value      = record.dateEmitted;

                types   = ["Text","Text","Text","Text","Text"];

                table   = new Table(
                    idTable,
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
                let activities  = await getActivities(idRecord);
                
                if(activities != ""){
                    let idActivityList      = "activityList";
                    let idActivitiesAdded   = "activitiesAdded";

                    let activityList        = document.getElementById(idActivityList);
                    let activitiesAdded     = document.getElementById(idActivitiesAdded);
                    let buttonAdd           = document.getElementById("addActivity");
                    let buttonRemove        = document.getElementById("removeActivity");
                    let buttonSuggestions   = document.getElementById("sendSuggestion");

                    clearSelect(idActivityList);
                    clearSelect(idActivitiesAdded);

                    for(let i=0; i<activities.length; i++){
                        let option  = document.createElement("option");
                        option.text = activities[i].name;
                        option.id   = "optionList:" + activities[i].id;

                        activityList.add(option);
                    }

                    buttonRemove.disabled       = true;
                    buttonSuggestions.disabled  = true;

                    buttonAdd.addEventListener("click", (e)=>{
                        e.preventDefault();

                        try{
                            let option          = document.createElement("option");
                            let idAux           = activityList.options[activityList.selectedIndex].id;
                            
                            option.id           = "optionAdded:" + idAux.split(":")[1];
                            option.text         = activityList.options[activityList.selectedIndex].value;
                            
                            activitiesAdded.add(option);
                            activityList.options[activityList.selectedIndex].remove();
                            SortSelect(activitiesAdded);

                            buttonRemove.disabled       = false;
                            buttonSuggestions.disabled  = false;

                            if(activityList.length == 0){
                                buttonAdd.disabled  = true;
                            }

                        }catch(error){
                            console.log("No se ha seleccionado ninguna actividad");
                        }
                        
                    }, false);

                    buttonRemove.addEventListener("click", (e)=>{
                        e.preventDefault();

                        try{
                            let option          = document.createElement("option");
                            let idAux           = activitiesAdded.options[activitiesAdded.selectedIndex].id;
                            
                            option.id           = "optionList:" + idAux.split(":")[1];
                            option.text         = activitiesAdded.options[activitiesAdded.selectedIndex].value;
                            
                            activityList.add(option);
                            activitiesAdded.options[activitiesAdded.selectedIndex].remove();
                            
                            SortSelect(activityList);

                            buttonAdd.disabled  = false;

                            if(activitiesAdded.length == 0){
                                buttonRemove.disabled       = true;
                                buttonSuggestions.disabled  = true;
                            }

                        }catch(error){
                            console.log("No se ha seleccionado ninguna actividad");
                        }
                        
                    }, false);

                    buttonSuggestions.addEventListener("click", (e)=>{
                        e.preventDefault();

                        let dateSuggest        = document.getElementById("dateRequired").value;
                        let activitiesSuggest   = [];

                        if(dateSuggest == ""){
                            ModalReportEvent("Error", "N", "Debe indicar la fecha estimada de la sugerencia");
                            return;
                        }

                        if(compareDateToToday("dateRequired")){
                            ModalReportEvent("Error", "N + 1", "La fecha de una sugerencia no puede ser anterior o igual al dia de hoy");
                            return;
                        }

                        $("#suggestActivityForm").modal("toggle");
                        ShowSpinner();

                        for(let i=0; i<activitiesAdded.length; i++){
                            activitiesSuggest[i]    = activitiesAdded.options[i].id.split(":")[1];
                        }

                        let data    = new FormData();
                        data.append("idRecord", sessionStorage.getItem("ID_RECORD"));
                        data.append("idActivities", activitiesSuggest);
                        data.append("dateSuggest", dateSuggest);

                        $.ajax({
                            url:            "backend/addSuggest.php",
                            type:           "POST",
                            data:           data,
                            processData:    false,
                            contentType:    false,
                            error:          (error)=>{console.log(error)},
                            success:        (response)=>{
                                setTimeout(()=>{
                                    CloseSpinner();

                                    if(response.ERROR){
                                        ModalReportEvent("Error", response.ERRNO, response.MESSAGE);

                                    }else{
                                        for(let i=0; i<activitiesAdded.length; i++){
                                            let option          = document.createElement("option");
                                            let idAux           = activitiesAdded.options[i].id;
                                            
                                            option.id           = "optionList:" + idAux.split(":")[1];
                                            option.text         = activitiesAdded.options[i].value;
                                            
                                            activityList.add(option);
                                        }

                                        clearSelect(idActivitiesAdded);
                                        SortSelect(activityList);

                                        buttonRemove.disabled       = true;
                                        buttonSuggestions.disabled  = true;

                                        document.getElementById("dateRequired").value   = "";

                                        ModalReportEvent("Operación Exitosa", "", response.MESSAGE);
                                    }
                                }, delay);
                            }
                        });
                    });
                }

                try{
                    document.getElementById("container:" + idTable).remove();
                }catch(e){
                    console.log("No se puede eliminar el container table porque no existe");
                }

                try{
                    document.getElementById("containerButtons").remove();
                }catch(e){
                    console.log("No se puede eliminar el containerButtons porque no existe");
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
                            width:  "20%"      },
                    5:  {   name:   "Anexos",
                            width:  "15%"      },
                    6:  {   name:   "Importancia",
                            width:  "15%"      },
                    length:     7,
                    table:  {
                                width:  "width: 120%",
                            },     
                    father: {   id:     idFather,
                                style:  "height: 250px; overflow: scroll"
                            }
                }

                table   = new Table(
                    idTable,
                    header,
                    header.length,
                    false
                );

                types   = ["Text","Text","TextArea","Text","Select","Button","Select"];

                for(let i=0; i<record.activities.length; i++){
                    let data            = [];
                    let state           = { type:       "state",
                                            value:      record.states[i],
                                            options:    ["Realizada", "Pendiente"]
                                        };
                    let buttonAnnexes   = { 
                            0:  {   text:       "Adjuntar Documento",
                                    styleBtn:   "",
                                    classBtn:   "btn btn-primary btn-sm",
                                    classIcon:  "icon-image icon-space",
                                    action:     "javascript:openAttachFile(" + record.activities[i].id + ");"},
                            items:  1,
                            };

                    let importance      = { type:       "importance",
                                            value:      record.importances[i],
                                            options:    ["Normal", "Urgente"]
                                        };
    
                    data            = [ i + 1,
                                        record.activities[i].name,
                                        record.observations[i],
                                        record.activities[i].location,
                                        state,
                                        buttonAnnexes,
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

                /**
                 * This container is showed only when the record is incomplete
                 */
                if(record.state == "0"){
                    let containerButtons    = document.createElement("div");
                    let containerSave       = document.createElement("div");
                    let containerSuggest    = document.createElement("div");

                    containerButtons.setAttribute("id", "containerButtons");
                    containerButtons.setAttribute("class", "row");
                    containerButtons.setAttribute("class", "container-fluid d-flex justify-content-center");
                    containerButtons.setAttribute("style", "margin-top: 3%;");
                    containerSave.setAttribute("class", "col6");
                    containerSuggest.setAttribute("class", "col6");
                    
                    let buttonSave          = document.createElement("button");
                    let buttonSuggest       = document.createElement("button");
                    let iconSave            = document.createElement("span");
                    let iconSuggest         = document.createElement("span");
                    let textSave            = document.createTextNode("Guardar");
                    let textSuggest         = document.createTextNode("Sugerir Actividades");

                    buttonSave.setAttribute("class", "btn btn-primary");
                    buttonSave.setAttribute("style", "margin-rright: 2%;");
                    buttonSuggest.setAttribute("class", "btn btn-primary");
                    buttonSuggest.setAttribute("style", "margin-left: 2%;");
                    iconSave.setAttribute("class", "icon-save icon-space");
                    iconSuggest.setAttribute("class", "icon-info icon-space");

                    buttonSave.appendChild(iconSave);
                    buttonSave.appendChild(textSave);

                    buttonSuggest.appendChild(iconSuggest);
                    buttonSuggest.appendChild(textSuggest);

                    containerSave.appendChild(buttonSave);
                    containerSuggest.appendChild(buttonSuggest);

                    containerButtons.appendChild(containerSave);
                    containerButtons.appendChild(containerSuggest);

                    document.getElementById(idFather).appendChild(containerButtons);

                    buttonSave.onclick      = function(){
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

                        document.getElementById("btnConfirm").onclick       = async function(){
                            $('#ModalConfirmEvent').modal('toggle');
                            
                            piezometriaData     = sessionStorage.getItem("piezometriaData");
                            piezometriaData == null ? [] : sessionStorage.removeItem("piezometriaData");
                        
                            record.observations = arrayObservations;
                            record.states       = arrayStates;
                            record.piezometrias = piezometriaData;
                            record.importances  = arrayImportances;

                            let status  = await record.update();
                        
                            if(status){
                                document.getElementById("container:" + idTable).remove();
                            }
                        }
                        
                        $('#ModalConfirmEvent').modal('show');
                    };

                    buttonSuggest.onclick   = function(){
                        showSuggestActivity();
                    }
                }

                break;

            default:
                ModalReportEvent("Error", 100, "Opción no válida");
                break;
        }

        setTimeout(()=>{
            CloseSpinner();
        }, delay);
    }
};

function showSuggestActivity(){
    $("#suggestActivityForm").modal("show");
}














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