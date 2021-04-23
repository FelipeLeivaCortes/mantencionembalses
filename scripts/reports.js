/*
    In future versions, it´s necessary to get the pit´s data according to the amount pits registered
    in the database of each company.
*/


function initReports(){
    document.getElementById("uploadDataBtn").disabled       = true;
    document.getElementById('inputExcel').addEventListener('change', handleExcelDataPiezometria, false);

    $.post("backend/getSeasonPiezometrias.php", "", function(DATA){
        if( DATA.ERROR ){
            setTimeout(()=>{
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                CloseSpinner();
            }, 500);

        }else{
            var select  = document.getElementById("seassonData");

            for( var i=0; i<DATA.COUNT; i++ ){
                var option  = document.createElement("option");
                option.text = DATA[i].year;
                select.add(option);
            }

            SortSelect(select);
            select.value    = "";
            CloseSpinner(); 
        }
    });
};

function getPiezometrias(){
    $('#getPiezometriaForm').modal('toggle');
    ShowSpinner();

    var season      = document.getElementById("seassonData").value;

    $.post("backend/getPiezometria.php", "season=" + season, function(DATA){
        if( DATA.ERROR ){
            setTimeout(() => {
                CloseSpinner();
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            }, 500);

        }else{
            var containerId = "myContainer";

            try{
                document.getElementById(containerId).remove();
            
            }catch(e){
                console.log("The container: " + containerId + " doesn´t exists");

            }

            var container   = document.createElement("div");
            container.setAttribute("id", containerId);
            container.style.overflow    = "scroll";
            container.style.width       = "120%";
            container.style.height      = "350px";

            var arrayDate       = [];
            var arrayPcg0       = [];
            var arrayPcg1       = [];
            var arrayPcg2       = [];
            var arrayPcg3       = [];
            var arrayPcg4       = [];
            var arrayPcg5       = [];
            var arrayPcg6       = [];
            var arrayPcg7       = [];
            var arrayPcg8       = [];
            var arrayPcg9       = [];
            var arrayPcg10      = [];
            var arrayPcg11      = [];
            var arrayPcg12      = [];
            var arrayPcg13      = [];
            var arrayPcg14      = [];

            for( var i=0; i<DATA.COUNT; i++ ){
                arrayDate[i]    = DATA[i].date;
                arrayPcg0[i]    = DATA[i].cota;
                arrayPcg1[i]    = DATA[i].pcg1;
                arrayPcg2[i]    = DATA[i].pcg2;
                arrayPcg3[i]    = DATA[i].pcg3;
                arrayPcg4[i]    = DATA[i].pcg4;
                arrayPcg5[i]    = DATA[i].pcg5;
                arrayPcg6[i]    = DATA[i].pcg6;
                arrayPcg7[i]    = DATA[i].pcg7;
                arrayPcg8[i]    = DATA[i].pcg8;
                arrayPcg9[i]    = DATA[i].pcg9;
                arrayPcg10[i]   = DATA[i].pcg10;
                arrayPcg11[i]   = DATA[i].pcg11;
                arrayPcg12[i]   = DATA[i].pcg12;
                arrayPcg13[i]   = DATA[i].pcg13;
                arrayPcg14[i]   = DATA[i].pcg14;
            }

            var labelsPits  = ["Cota", "Pozo Roca Ladera Sur 1", "Pozo Roca Ladera Sur 2", "Pozo Roca Ladera Sur 3", 
                                "Pozo Roca Ladera Sur 4", "Pozo Roca Ladera Norte 5", "Pozo Roca Ladera Norte 6",
                                "Pozo Roca Ladera Norte 7", "Pozo Roca Ladera Norte 8", "Pozo Fluvial 1", "Pozo Fluvial 2",
                                "Pozo Fluvial 3", "Pozo Fluvial 4", "Pozo Fluvial 5", "Pozo Fluvial 6"];

            for( var i=0; i<DATA.numPits; i++ ){
                var canvas      = document.createElement("canvas");
                canvas.width  = "90";
                canvas.height = "25";

                var ctx         = canvas.getContext('2d');

                var myChart     = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: arrayDate,
                        datasets: [{
                            label: labelsPits[i],
                            data: eval("arrayPcg" + i),
                              backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)' 
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
             
                container.appendChild(canvas);
            }

            document.getElementById("body-container").appendChild(container);
            setTimeout(() => {
                CloseSpinner();
            }, 500);
            
        }
    });
};

function handleExcelDataPiezometria(){

    ShowSpinner();

    //Reference the FileUpload element.
    var fileUpload = document.getElementById("inputExcel");

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;

    if( regex.test(fileUpload.value.toLowerCase()) ){
            
       if(typeof(FileReader) != "undefined"){
           var reader = new FileReader();

           //For Browsers other than IE.
           if(reader.readAsBinaryString){
              reader.onload = function (e) {
                ProcessExcelPiezometria(e.target.result);
              };
              
	        reader.readAsBinaryString(fileUpload.files[0]);

	        //For IE Browser.
            }else{
              reader.onload = function (e) {
                 var data = "";
                 var bytes = new Uint8Array(e.target.result);
                 for (var i = 0; i < bytes.byteLength; i++) {
                   data += String.fromCharCode(bytes[i]);
                 }
                 ProcessExcelPiezometria(data);
               };
               reader.readAsArrayBuffer(fileUpload.files[0]);
            }

            document.getElementById("uploadDataBtn").disabled    = false;
        
        }else{
            ModalReportEvent("Error", 40, "Este navegador no soporta HTML5. Comuníquese con el administrador");
        
        }

    }else{
        ModalReportEvent("Error", 39, "El archivo ingresado no es tipo excel");
        document.getElementById("inputExcel").value    = "";

    }

};

function ProcessExcelPiezometria(data){
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
         type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    sessionStorage.setItem("arrayData", JSON.stringify(excelRows));
    
    setTimeout(function(){
        CloseSpinner();
    }, 500);
    
};

function uploadPiezometriaFromExcel(){
    $('#loadExcelForm').modal('toggle');
    ShowSpinner();

    document.getElementById("uploadDataBtn").disabled    = true;
    
    var data   = JSON.parse(sessionStorage.getItem("arrayData"));
    sessionStorage.removeItem('arrayData');

    document.getElementById("inputExcel").value    = "";

    if( data.length == 0 ){
        setTimeout(function(){
            CloseSpinner();
            ModalReportEvent("Error", 41, "El documento Excel está vacio");
        }, 500);
    
    }else{
        var arrayDate       = [];
        var arrayCota       = [];
        var arrayPcg1       = [];
        var arrayPcg2       = [];
        var arrayPcg3       = [];
        var arrayPcg4       = [];
        var arrayPcg5       = [];
        var arrayPcg6       = [];
        var arrayPcg7       = [];
        var arrayPcg8       = [];
        var arrayPcg9       = [];
        var arrayPcg10      = [];
        var arrayPcg11      = [];
        var arrayPcg12      = [];
        var arrayPcg13      = [];
        var arrayPcg14      = [];

        /*
        Is necessary to asure the struture of the excel data, to avoid any posibility of fail.
        */
        
        var error  = false;

        for( var i=0; i<data.length; i++ ){
            var j = i + 2;

            arrayDate[i]    = isValidDate(data[i].Fecha, j);
            arrayCota[i]    = isValidDoubleValue(data[i].Cota, j, "B");
            arrayPcg1[i]    = isValidDoubleValue(data[i].pcg1, j, "C");
            arrayPcg2[i]    = isValidDoubleValue(data[i].pcg2, j, "D");
            arrayPcg3[i]    = isValidDoubleValue(data[i].pcg3, j, "E");
            arrayPcg4[i]    = isValidDoubleValue(data[i].pcg4, j, "F");
            arrayPcg5[i]    = isValidDoubleValue(data[i].pcg5, j, "G");
            arrayPcg6[i]    = isValidDoubleValue(data[i].pcg6, j, "H");
            arrayPcg7[i]    = isValidDoubleValue(data[i].pcg7, j, "I");
            arrayPcg8[i]    = isValidDoubleValue(data[i].pcg8, j, "J");
            arrayPcg9[i]    = isValidDoubleValue(data[i].pcg9, j, "K");
            arrayPcg10[i]   = isValidDoubleValue(data[i].pcg10, j, "L");
            arrayPcg11[i]   = isValidDoubleValue(data[i].pcg11, j, "M");
            arrayPcg12[i]   = isValidDoubleValue(data[i].pcg12, j, "N");
            arrayPcg13[i]   = isValidDoubleValue(data[i].pcg13, j, "O");
            arrayPcg14[i]   = isValidDoubleValue(data[i].pcg14, j, "P");

            if( arrayDate[i] == false ){ error   = true; break; }
            if( arrayCota[i] == NaN ){ error   = true; break; }
            if( arrayPcg1[i] == NaN ){ error   = true; break; }
            if( arrayPcg2[i] == NaN ){ error   = true; break; }
            if( arrayPcg3[i] == NaN ){ error   = true; break; }
            if( arrayPcg4[i] == NaN ){ error   = true; break; }
            if( arrayPcg5[i] == NaN ){ error   = true; break; }
            if( arrayPcg6[i] == NaN ){ error   = true; break; }
            if( arrayPcg7[i] == NaN ){ error   = true; break; }
            if( arrayPcg8[i] == NaN ){ error   = true; break; }
            if( arrayPcg9[i] == NaN ){ error   = true; break; }
            if( arrayPcg10[i] == NaN ){ error   = true; break; }
            if( arrayPcg11[i] == NaN ){ error   = true; break; }
            if( arrayPcg12[i] == NaN ){ error   = true; break; }
            if( arrayPcg13[i] == NaN ){ error   = true; break; }
            if( arrayPcg14[i] == NaN ){ error   = true; break; }
        
        }

        data    = null;

        if(error){
            setTimeout(function(){
                CloseSpinner();
            }, 1000);

        }else{
            var Variables   = "dates=" + JSON.stringify(arrayDate) + "&cota=" + JSON.stringify(arrayCota) + 
                                "&pcg1=" + JSON.stringify(arrayPcg1) + "&pcg2=" + JSON.stringify(arrayPcg2) + 
                                "&pcg3=" + JSON.stringify(arrayPcg3) + "&pcg4=" + JSON.stringify(arrayPcg4) + 
                                "&pcg5=" + JSON.stringify(arrayPcg5) + "&pcg6=" + JSON.stringify(arrayPcg6) + 
                                "&pcg7=" + JSON.stringify(arrayPcg7) + "&pcg8=" + JSON.stringify(arrayPcg8) + 
                                "&pcg9=" + JSON.stringify(arrayPcg9) + "&pcg10=" + JSON.stringify(arrayPcg10) +
                                "&pcg11=" + JSON.stringify(arrayPcg11) + "&pcg12=" + JSON.stringify(arrayPcg12) +
                                "&pcg13=" + JSON.stringify(arrayPcg13) + "&pcg14=" + JSON.stringify(arrayPcg14);

            $.post("backend/pushPiezometrias.php", Variables, function(DATA){
                console.log(DATA);
                CloseSpinner();

                if(DATA.ERROR){
                    setTimeout(function(){
                        ModalReportEvent("Precausión", DATA.ERRNO, DATA.MESSAGE);
                    }, 500);
                    
                }else{
                    setTimeout(function(){
                        ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                    }, 500);
                    
                }
            });
        }
    }
};

function isValidDate(date, index){
    var dateSplitted    = date.split("/");

    if( dateSplitted.length == 3 ){
        return dateSplitted[2] + "-" + dateSplitted[1] + "-" + dateSplitted[0];

    }else{
        ModalReportEvent("Error", 64, "La fecha de inicio en la fila " + index + " contiene un error de escritura");
        return false;

    }
};

function isValidDoubleValue(value, index, Column){
    value           = value.replace(/\,/g, ".");
    var auxValue    = value.split(".");

    if( auxValue.length == 2 ){
        value   = parseFloat(value).toFixed(2);

        if( value != NaN ){
            return value;
        
        }else{
            ModalReportEvent("Error", 74, "Existe un error con el valor en la fila " + index + ", columna " + Column);
            return NaN;

        }
    
    }else{
        ModalReportEvent("Error", 74, "Existe un error con el valor en la fila " + index + ", columna " + Column);
        return NaN;

    }
};

function downloadTemplatePiezometria(){
    location.href   = "docs/empresa" + sessionStorage.getItem("ID_COMPANY") + "/documents/templates/Plantilla Piezometria.xlsx";
};

function getDocumentEvent(){
    $("#openGetDocumentEventForm").modal("toggle");
    ShowSpinner();

    var sourceDocument  = document.getElementById("sourceDocument").value;
    var typeDocument    = document.getElementById("typeDocument").value;

    switch(sourceDocument){
        case "--- Todos ---":
            sourceDocument  = "";
            break;
        
        case "Interno":
            sourceDocument  = "Interno";
            break;

        case "Externo":
            sourceDocument  = "Externo";
            break;
        
        default:
            return;
    }

    switch(typeDocument){
        case "--- Todos ---":
            typeDocument  = "";
            break;
        
        case "Archivado":
            typeDocument  = 1;
            break;

        case "Disponible":
            typeDocument  = 0;
            break;
        
        default:
            return;
    }

    var data        = new FormData();
    data.append("type", "Event");
    data.append("sourceDocument", sourceDocument);
    data.append("typeDocument", typeDocument);

    $.ajax({
        url:            "backend/getDocuments.php",
        type:           "POST",
        data:           data,
        contentType:    false,
        processData:    false,
        success:        function(DATA){

            var idContainer = "myContainer";
            var idTable     = "myTable";
            var table;
            var divTable;

            try{
                document.getElementById(idContainer).remove();
            
            }catch(e){
                console.log("The container: " + idContainer + " doesn´t exists");

            }

            if( DATA.ERROR ){
                setTimeout(() => {
                    CloseSpinner();
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                }, 500);

            }else{
                divTable    = document.createElement("div");
                divTable.setAttribute("class", "table-modal table-reponsive-xl");
                divTable.setAttribute("style", "width: 120%;");
                divTable.setAttribute("id", idContainer);
        
                table       = document.createElement("table");
                table.setAttribute("class", "table table-striped");
                table.setAttribute("id", idTable);
        
                var thead                   = document.createElement("thead");

                var rowHead                 = document.createElement("tr");

                var indexHeadCell           = document.createElement("th");
                var documentHeadCell        = document.createElement("th");
                var authorHeadCell          = document.createElement("th");
                var dateHeadCell            = document.createElement("th");
                var sourceHeadCell          = document.createElement("th");
                var stateHeadCell           = document.createElement("th");

                indexHeadCell.setAttribute("scope", "col");
                documentHeadCell.setAttribute("scope", "col");
                documentHeadCell.setAttribute("style", "width: 40%;");
                dateHeadCell.setAttribute("scope", "col");
                sourceHeadCell.setAttribute("scope", "col");
                stateHeadCell.setAttribute("scope", "col");

                var indexHead       = document.createTextNode("N°");
                var documentHead    = document.createTextNode("Documento");
                var authorHead      = document.createTextNode("Responsable");
                var dateHead        = document.createTextNode("Fecha Emisión");
                var sourceHead      = document.createTextNode("Fuente");
                var stateHead       = document.createTextNode("Estado");

                indexHeadCell.appendChild(indexHead);
                documentHeadCell.appendChild(documentHead);
                authorHeadCell.appendChild(authorHead);
                dateHeadCell.appendChild(dateHead);
                sourceHeadCell.appendChild(sourceHead);
                stateHeadCell.appendChild(stateHead);

                rowHead.appendChild(indexHeadCell);
                rowHead.appendChild(documentHeadCell);
                rowHead.appendChild(authorHeadCell);
                rowHead.appendChild(dateHeadCell);
                rowHead.appendChild(sourceHeadCell);
                rowHead.appendChild(stateHeadCell);

                thead.appendChild(rowHead);
                table.appendChild(thead);
            
                var bodyTable   = document.createElement("tbody");

                // Create the rows
                for (var i=0; i<DATA.COUNT; i++){

                    // Here is created every row
                    var row             = document.createElement("tr");
                    row.setAttribute("id", "row:" + DATA[i].id);

                    // Here is created every cell
                    var indexCell	    = document.createElement("td");
                    var documentCell    = document.createElement("td");
                    var authorCell      = document.createElement("td");
                    var dateCell        = document.createElement("td");
                    var sourceCell      = document.createElement("td");
                    var stateCell       = document.createElement("td");
                    
                    // Here is storaged the content into a node
                    var index           = document.createTextNode( i + 1 );
                    var documentLink    = document.createElement("a");
                    var documentText    = document.createTextNode(DATA[i].name);
                    var author          = document.createTextNode(DATA[i].author);
                    var dateEmitted     = document.createTextNode( FormatDate(DATA[i].date) );
                    var source          = document.createTextNode(DATA[i].source);
                    var state           = document.createTextNode("");
                    var iconState       = document.createElement("span");

                    if( DATA[i].state == 0 ){
                        iconState.setAttribute("class", "icon-lock-open icon-space");
                        state.textContent   = "Disponible";

                    }else if( DATA[i].state == 1 ){
                        iconState.setAttribute("class", "icon-lock icon-space");
                        state.textContent   = "Archivado";

                    }else{
                        iconState.setAttribute("class", "icon-circle-with-cross icon-space");
                        state.textContent   = "Error";

                    }

                    documentLink.href   = "javascript:openModalAboutDocument(" + DATA[i].id + "," +
                        DATA[i].state + ",'" + DATA.fakepath + "','" + DATA[i].name + "','" + 
                        DATA[i].description  + "', 'Event');";
                    documentLink.appendChild(documentText);

                    // Here is inserted the content into the cells
                    indexCell.appendChild(index);
                    documentCell.appendChild(documentLink);
                    authorCell.appendChild(author);
                    dateCell.appendChild(dateEmitted);
                    sourceCell.appendChild(source);
                    stateCell.appendChild(iconState);
                    stateCell.appendChild(state);

                    // Here is inserted the cells into a row
                    row.appendChild(indexCell);
                    row.appendChild(documentCell);
                    row.appendChild(authorCell);
                    row.appendChild(dateCell);
                    row.appendChild(sourceCell);
                    row.appendChild(stateCell);
                    
                    // Here is inserted the row into the table´s body
                    bodyTable.appendChild(row);
                }

                
                // Here is inserted the body´s table into the table
                table.appendChild(bodyTable);
                divTable.appendChild(table);
                
                document.getElementById("body-container").appendChild(divTable);

                setTimeout(() => {
                    CloseSpinner();
                }, 500);
            }
        },
        error:          function(DATA){
            console.log(DATA);
        }

    });
};

function openModalArchiveDocument(id, action, type, fakepath, description){
    document.getElementById("headerEvent").innerHTML    = "Archivar Documento";
    document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea archivar el documento?";

    document.getElementById("btnConfirm").setAttribute("onclick", "archiveDocument(" + id + "," + action + ",'"
        + type + "','" + fakepath + "','" + description + "');");
    $('#ModalConfirmEvent').modal('show');
};

function archiveDocument(id, action, type, fakepath, description){
    var data    = new FormData();

    data.append("id", id);
    data.append("type", type);
    data.append("action", action);

    $.ajax({
        url:            "backend/archiveDocument.php",
        type:           "POST",
        data:           data,
        contentType:    false,
        processData:    false,
        success:        function(DATA){

            if( DATA.ERROR  == true ){
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            
            }else{
                if( type == 'Event' ){
                    $("#aboutDocumentForm").modal("toggle");
                }

                ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
    
                var table   = document.getElementById("myTable");
                var target  = "row:" + id;

                for(var i=0; i<table.children[1].children.length; i++){
                    if( target == table.children[1].children[i].id ){
                        
                        // Updating the icon and value in the state cell
                        var name        = table.children[1].children[i].cells[1].textContent;
                        var linkCell    = table.children[1].children[i].cells[1].children[0];
                        var stateCell   = table.children[1].children[i].cells[5];
                        var iconState   = document.createElement("span");
                        var textState   = document.createTextNode("");

                        removeAllChildNodes(stateCell);

                        if( action == 0 ){
                            iconState.setAttribute("class", "icon-lock-open icon-space");
                            textState.textContent   = "Disponible";

                            stateCell.appendChild(iconState);
                            stateCell.appendChild(textState);
                            linkCell.href = "";
                            linkCell.href   = "javascript:openModalAboutDocument(" + id + "," + 0 + 
                                ",'" + fakepath + "','" + name + "','" + description  + "', 'Event');";

                        }else if( action == 1 ){
                            iconState.setAttribute("class", "icon-lock icon-space");
                            textState.textContent   = "Archivado";

                            stateCell.appendChild(iconState);
                            stateCell.appendChild(textState);
                            linkCell.href = "";
                            linkCell.href   = "javascript:openModalAboutDocument(" + id + "," + 1 + 
                            ",'" + fakepath + "','" + name + "','" + description  + "', 'Event');";

                        }

                        break;
                        
                    }
                }
                
            }

        },
        error:          function(DATA){
            console.log(DATA);
        }
    });
};

function openModalAboutDocument(id, state, path, name, description, type){
    // Setting the value to the modal
    document.getElementById("aboutDocumentName").value          = name;
    document.getElementById("aboutDocumentDescription").value   = description;

    // Adapting the data, for example, the path to download the document.
    var pathSplitted        = path.split("/");
    var url                 = "";
    var archiveDocumentBtn  = document.getElementById("archiveDocumentBtn");
    var iconArchiveBtn      = document.createElement("span");
    var textArchiveBtn      = document.createTextNode("");

    removeAllChildNodes(archiveDocumentBtn);

    for(var x=1; x<pathSplitted.length; x++){
        url = url == "" ? "/mantencionembalses/" + pathSplitted[x] : url + "/" + pathSplitted[x];
    }

    // Setting the buttons to ejecute the functions respectives
    document.getElementById("downloadDocumentBtn").setAttribute("onclick", "javascript:printDocument('"
        + url + "','" + name + "');");
    
    if( state == 0 ){
        iconArchiveBtn.setAttribute("class", "icon-lock icon-space");
        textArchiveBtn.textContent   = "Archivar";

        archiveDocumentBtn.appendChild(iconArchiveBtn);
        archiveDocumentBtn.appendChild(textArchiveBtn);

        archiveDocumentBtn.setAttribute("onclick",
        "openModalArchiveDocument(" + id + "," + 1 + ",'" + type + "','" + path + "','" + description +
            "'); return false;");
        
    }else if( state == 1 ){
        iconArchiveBtn.setAttribute("class", "icon-lock-open icon-space");
        textArchiveBtn.textContent   = "Habilitar";

        archiveDocumentBtn.appendChild(iconArchiveBtn);
        archiveDocumentBtn.appendChild(textArchiveBtn);

        archiveDocumentBtn.setAttribute("onclick",
        "openModalArchiveDocument(" + id + "," + 0 + ",'" + type + "','" + path + "','" + description +
            "'); return false;");

    }else{
        archiveDocumentBtn.disabled     = true;
        iconState.setAttribute("class", "icon-circle-with-cross icon-space");
        textArchiveBtn.textContent   = "Error";

        archiveDocumentBtn.appendChild(iconArchiveBtn);
        archiveDocumentBtn.appendChild(textArchiveBtn);

    }
    
    document.getElementById("editDocumentBtn").setAttribute("onclick",
        "openModalEditDocument(" + id + ", '" + description + "', 'Event'); return false;");
    document.getElementById("deleteDocumentBtn").setAttribute("onclick",
        "openModalDeleteDocument(" + id + ", 'Event'); return false;");

    $('#aboutDocumentForm').modal('show');
};

function printDocument(url, name){
    window.location     = url + name;
}