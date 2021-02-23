function activityInit(){
    document.getElementById('activitiesExcel').addEventListener('change', handleExcelProject, false);
    document.getElementById("loadActivitiesBtn").disabled       = true;
    document.getElementById("addActivityFrecuency").value       = "";
    document.getElementById("addActivityPriority").value	= "";
    document.getElementById("addActivityArea").value            = "";


/*    if(sessionStorage.getItem('USERNAME') != 19040800){
        document.getElementById("loadExcelBtn").disabled    = true;
    }
*/

    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var Variables   = "idCompany=" + idCompany;

    $.post("backend/getLocations.php", Variables, function(DATA){

        if(DATA.ERROR){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
        }else{

            var selectAdd       = document.getElementById("addActivityLocation");
            var selectFilter    = document.getElementById("filterLocation");

            var allLocations    = document.createElement("option");
            allLocations.text   = "--- TODAS ---";
            selectFilter.add(allLocations);

            for(var i=0; i<DATA.count; i++){
                var option1  = document.createElement("option");
                option1.text = DATA[i].name;
                
                var option2  = document.createElement("option");
                option2.text = DATA[i].name;

                selectAdd.add(option1);
                selectFilter.add(option2);
            }

            selectAdd.value     = "";
            selectFilter.value  = "--- TODAS ---";
        }
    });

    var delay = 7000;
    ShowSpinner(delay);
    setTimeout(function(){
    }, delay);
};

function handleExcelProject(){

    var delay = 2000;

    ShowSpinner(delay);

    //Reference the FileUpload element.
    var fileUpload = document.getElementById("activitiesExcel");

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;

    if( regex.test(fileUpload.value.toLowerCase()) ){
            
       if(typeof(FileReader) != "undefined"){
           var reader = new FileReader();

           //For Browsers other than IE.
           if(reader.readAsBinaryString){
              reader.onload = function (e) {
                  ProcessExcel(e.target.result);
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
                 ProcessExcel(data);
               };
               reader.readAsArrayBuffer(fileUpload.files[0]);
            }

                document.getElementById("loadActivitiesBtn").disabled    = false;
            }else{
                ModalReportEvent("Error", 40, "Este navegador no soporta HTML5. Comuníquese con el administrador");
            }

        }else{
            ModalReportEvent("Error", 39, "El archivo ingresado no es tipo excel");
            document.getElementById("activitiesExcel").value    = "";
        }
};

function ProcessExcel(data){
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
         type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    sessionStorage.setItem("ACTIVITIES", JSON.stringify(excelRows));
};

function LoadActivitiesFromExcel(){
    document.getElementById("loadActivitiesBtn").disabled    = true;
    var data   = JSON.parse(sessionStorage.getItem("ACTIVITIES"));
    sessionStorage.removeItem('ACTIVITIES');
    document.getElementById("activitiesExcel").value    = "";

    if(data.length > 0){
        ShowSpinner(20000);

        var arrayNames      = [];
        var arrayDateStart  = [];
        var arrayFrecuency  = [];
        var arrayLocation   = [];
        var arrayPriority   = [];
        var arrayArea       = [];
        var arrayComments   = [];

        /*
        Is necessary to asure the struture of the excel data, to avoid any posibility of fail.
        */
        
        var error  = false;

        for(var i=0; i<data.length; i++){
            var j = i + 2;
            if(isValidActivityName(data[i].Nombre, j )){
                if(CompareTwoDates(data[i].FechaInicio, j)){
                    if(parseStringToDate(data[i].Frecuencia, j) != 0 ){
                        if(isValidLocation(data[i].Ubicacion, j)){
                            if(isValidPriority(data[i].Prioridad, j)){
                                if(isValidArea(data[i].Area, j)){
                                    arrayNames.push( data[i].Nombre.toLowerCase() );
                                    arrayDateStart.push( data[i].FechaInicio );
                                    arrayFrecuency.push( parseStringToDate(data[i].Frecuencia, -1 ));
                                    arrayLocation.push( data[i].Ubicacion );
					
				    var aux1 	= data[i].Prioridad.split(" ");
				    aux1[0]	= aux1[0].toLowerCase();
				    var aux2	= aux1[0].charAt(0).toUpperCase() + aux1[0].slice(1);

                                    arrayPriority.push( aux2 );
                                    arrayArea.push( data[i].Area );
                                    arrayComments.push( data[i].Comentarios );

                                }else{
                                    error   = true;
                                    break;
                                }
                            }else{
                                error   = true;
                                break;
                            }
                        }else{
                            error   = true;
                            break;
                        }
                    }else{
                        error   = true;
                        break;
                    }
                }else{
                    error = true;
                    break;    
                }
            }else{
                error  = true;
                break;
            }
        }

        data    = null;

        if(!error){
            var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
            var Variables   = "idCompany=" + idCompany + "&names=" + JSON.stringify(arrayNames) + "&dates=" + JSON.stringify(arrayDateStart) + "&frecuencies=" + JSON.stringify(arrayFrecuency) + "&locations=" + JSON.stringify(arrayLocation) + "&priorities=" + JSON.stringify(arrayPriority) + "&areas=" + JSON.stringify(arrayArea) + "&comments=" + JSON.stringify(arrayComments);

            $.post("backend/loadActivities.php", Variables, function(DATA){
                console.log(DATA);
            
                if(DATA.ERROR){
                    ModalReportEvent("Precausión", DATA.ERRNO, DATA.MESSAGE);
                }else{
                    ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                    $('#loadExcelForm').modal('toggle');
                }
            });
        }

    }else{
        ModalReportEvent("Error", 41, "No hay actividades en el documento Excel");
    }
};

function AddActivity(){
    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var name        = document.getElementById("addActivityName").value.toLowerCase();
    var date        = document.getElementById("addActivityDate").value;
    var frecuency   = parseStringToDate(document.getElementById("addActivityFrecuency").value);
    var location    = document.getElementById("addActivityLocation").value;
    var priority    = document.getElementById("addActivityPriority").value;
    var area        = document.getElementById("addActivityArea").value;
    var comments    = document.getElementById("addActivityComments").value;

    // Verifying if is a valid name
    if(isValidActivityName(name)){
	if(CompareTwoDates(date, -1)){
    	   if(frecuency != 0){

                var Variables   = "idCompany=" + idCompany + "&name=" + name + "&date=" + date + "&frecuency=" + frecuency + "&location=" + location + "&priority=" + priority + "&area=" + area + "&comments=" + comments;

                $.post("backend/addActivity.php", Variables, function(DATA){
                    if( DATA.ERROR  === true ){
                        ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

                    }else{
                        ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                        CloseModal('#addActivityForm');
                    }

                    //Deleting the data putted in the inputs
                    document.getElementById("addActivityName").value        = "";
                    document.getElementById("addActivityFrecuency").value   = "";
                    document.getElementById("addActivityLocation").value    = "";
                    document.getElementById("addActivityPriority").value    = "";
                    document.getElementById("addActivityArea").value        = "";
                    document.getElementById("addActivityComments").value    = "";
                });
            }
        }
    }
};

function isValidArea(parameter1, index){

    if(typeof(parameter1) == undefined){
        ModalReportEvent("Error", 44, "El área en la posición " + index + " es incorrecta. Sólo se acepta 'Mecánica', 'Eléctrica' o 'Jardinería'");
        return 0;
    }

    var parameter2  = NormalizeString(parameter1);
    switch(parameter2){
        case "Mecánica":
            return 1;
        case "Eléctrica":
            return 1;
        case "Jardinería":
            return 1;
        default:
            ModalReportEvent("Error", 44, "El área en la posición " + index + " es incorrecta. Sólo se acepta 'Mecánica', 'Eléctrica' o 'Jardinería'");
            return 0;
    }
};

function isValidLocation(parameter1, index){

    if(typeof(parameter1) == undefined){
        ModalReportEvent("Error", 43, "La ubicación en la posición " + index + " no está registrada");
        return 0;
    }

    var parameter2      = NormalizeString(parameter1);
    var founded         = true;
    var selectLocation  = document.getElementById("addActivityLocation"); 

    for(var i=0; i<selectLocation.length; i++){
        if(parameter2 == selectLocation.children[i].value){
            founded     = true;
            break;
        }
    }

    if(founded){
        return 1;
    }else{
        ModalReportEvent("Error", 43, "La ubicación en la posición " + index + " no está registrada");
        return 0;
    }

};

function isValidPriority(parameter1, index){
    if(typeof(parameter1) == undefined){
        ModalReportEvent("Error", 42, "La prioridad en la posición " + index + " es incorrecta. Sólo se acepta 'Alta', 'Media' o 'Baja'");
        return 0;
    }

    switch(NormalizeString(parameter1)){
        case "Baja":
            return 1;
        case "Media":
            return 1;
        case "Alta":
            return 1;
        default:
            ModalReportEvent("Error", 42, "La prioridad en la posición " + index + " es incorrecta. Sólo se acepta 'Alta', 'Media' o 'Baja'");
            return 0;
    }
};

function parseStringToDate(parameter1, index){
       
    if(typeof(parameter1) == undefined){
        ModalReportEvent("Error", 45, "La frecuencia en la posición " + index + " es incorrecta");
        return 0;
    }

    switch(NormalizeString(parameter1)){
        case "Diaria":
            return 1;
        case "Semanal":
            return 7;
        case "Quincenal":
            return 15;
        case "Mensual":
            return 30;
        case "Bimensual":
            return 60;
        case "Trimestral":
            return 120;
        case "Semestral":
            return 180;
        case "Anual":
            return 360;
        case "Bianual":
            return 720;
        case "Trianual":
            return 1080;
        default:
            if(index == -1){
                ModalReportEvent("Error", 20, "La frecuencia ingresada no es válida");
            }else{
                ModalReportEvent("Error", 45, "La frecuencia en la posición " + index + " es incorrecta");
            }
            return 0;
    }
};

function parseDateToString(variable){
    switch(variable){
        case 1:
            return "Diaria";
        case 7:
            return "Semanal";
        case 15:
            return "Quincenal";
        case 30:
            return "Mensual";
        case 60:
            return "Bimensual";
        case 120:
            return "Trimestral";
        case 180:
            return "Semestral";
        case 360:
            return "Anual";
        case 720:
            return "Bianual";
        case 1080:
            return "Trianual";
        default:
            ModalReportEvent("Error", 20, "La frecuencia ingresada no es válida");
            return 0;
    }
};

function filterActivities(){

    var delay = 1000;
    ClearTable("tableActivities");

    ShowSpinner(delay);

    var idCompany       = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var filterLocation  = document.getElementById("filterLocation").value;
    var filterArea      = document.getElementById("filterArea").value;
    var filterPriority  = document.getElementById("filterPriority").value;

    if(filterLocation == "--- TODAS ---"){
        filterLocation = "";
    }

    if(filterArea == "--- TODAS ---"){
        filterArea = "";
    }

    if(filterPriority == "--- TODAS ---"){
        filterPriority = "";
    }

    var Variables       = "idCompany=" + idCompany +  "&filterLocation=" + filterLocation + "&filterArea=" + filterArea + "&filterPriority=" + filterPriority;
    
    $.post("backend/getActivities.php", Variables, function(DATA){

        if( DATA.ERROR  === true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{

            // Create the Table´s Body
            var table       = document.getElementById("tableActivities");
            var bodyTable   = document.createElement("tbody");
        
            // Create the rows
            for (var i=0; i<DATA.COUNT; i++){

                // Here is created every row
                var row         = document.createElement("tr");
                    row.setAttribute("id", "row:" + DATA[i].id);
        
                // Here is created every cell
                var indexCell   = document.createElement("td");
                var nameCell    = document.createElement("td");
                var areaCell    = document.createElement("td");
                var actionCell  = document.createElement("td");
        
                // Here is storaged the content into a node
                var index       = document.createTextNode( i + 1 );
                var name        = document.createElement("a");
                var link        = document.createTextNode( DATA[i].name );
                var area        = document.createTextNode( DATA[i].area );
                var btnEdit     = document.createElement("button");
                var btnDel      = document.createElement("button");
                var spanEdit    = document.createElement("span");
                var spanDel     = document.createElement("span");
                var textEdit    = document.createElement("textNode");
                var textDel     = document.createElement("textNode");

                // Here we set the attributes
                name.appendChild(link);
                name.href = "javascript:aboutActivity(" + DATA[i].id + ");"; 

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

                btnEdit.setAttribute("onclick", "openModalEditActivity(" + DATA[i].id + "); return false;");
                btnDel.setAttribute("onclick", "openModalDelActivity(" + DATA[i].id + "); return false;");

                // Here is inserted the content into the cells
                indexCell.appendChild(index);
                nameCell.appendChild(name);
                areaCell.appendChild(area);
                actionCell.appendChild(btnEdit);
                actionCell.appendChild(btnDel);

                // Here is inserted the cells into a row
                row.appendChild(indexCell);
                row.appendChild(nameCell);
                row.appendChild(areaCell);
                row.appendChild(actionCell);
        
                // Here is inserted the row into the table´s body
                bodyTable.appendChild(row);
            }

        // Here is inserted the body´s table into the table
        table.appendChild(bodyTable);

        }

        document.getElementById("filterLocation").value = "--- TODAS ---";
        document.getElementById("filterArea").value     = "--- TODAS ---";
        document.getElementById("filterPriority").value = "--- TODAS ---";

        $('#filterActivityForm').modal('toggle');
    });   
};

function aboutActivity(id){
    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var Variable    = "idCompany=" + idCompany + "&id=" + id;
    
    $.post("backend/getDetailsActivity.php", Variable, function(DATA){
        if( DATA.ERROR  === true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{
            document.getElementById("aboutActivityName").value      = DATA.name;
            document.getElementById("aboutActivityDateStart").value = FormatDate(DATA.dateStart);
            document.getElementById("aboutActivityFrecuency").value = parseDateToString(DATA.frecuency);
            document.getElementById("aboutActivityLocation").value  = DATA.location;
            document.getElementById("aboutActivityPriority").value  = DATA.priority;
            document.getElementById("aboutActivityArea").value      = DATA.area;
            document.getElementById("aboutActivityComments").value  = DATA.comments;

            $('#aboutActivityForm').modal('show');
        }
    });
};

function openModalEditActivity(id){
    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var Variable    = "idCompany=" + idCompany + "&id=" + id;
    
    $.post("backend/getDetailsActivity.php", Variable, function(DATA){
        if( DATA.ERROR  === true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{
            document.getElementById("headerEvent").innerHTML    = " Actualización de datos";
            document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea editar estos datos?";
            document.getElementById("btnConfirm").setAttribute("onclick", "editActivity(" + id + ");");

            document.getElementById("codeActivity").value          = id;
            document.getElementById("editActivityName").value      = DATA.name;
            document.getElementById("editActivityDateStart").value = DATA.dateStart;
            document.getElementById("editActivityFrecuency").value = parseDateToString(DATA.frecuency);
            document.getElementById("editActivityLocation").value  = DATA.location;
            document.getElementById("editActivityPriority").value  = DATA.priority;
            document.getElementById("editActivityArea").value      = DATA.area;
            document.getElementById("editActivityComments").value  = DATA.comments;

            $('#editActivityForm').modal('show');
        }
    });
};

function editActivity(){
    $('#ModalConfirmEvent').modal('toggle');

    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var id          = document.getElementById("codeActivity").value;
    var name        = document.getElementById("editActivityName").value;
    var dateStart   = document.getElementById("editActivityDateStart").value;
    var frecuency   = parseStringToDate(document.getElementById("editActivityFrecuency").value);
    var location    = document.getElementById("editActivityLocation").value;
    var priority    = document.getElementById("editActivityPriority").value;
    var area        = document.getElementById("editActivityArea").value;
    var comments    = document.getElementById("editActivityComments").value;

    if(id == "" || name == "" || dateStart == "" || frecuency == "" || location == "" || priority == "" || area == ""){
        ModalReportEvent("Error", 28, "Debe rellenar todos los campos");

    }else if(CompareTwoDates(dateStart)){
        
        var Variables   = "idCompany=" + idCompany + "&id=" + id + "&name=" + name + "&dateStart=" + dateStart + "&frecuency=" + frecuency + "&location=" + location + "&priority=" + priority + "&area=" + area + "&comments=" + comments;

        $.post("backend/updateActivity.php", Variables, function(DATA){
            var delay   = 500;
            setTimeout(function(){
                if( DATA.ERROR  === true ){
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

                }else{
                    ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
                    $('#editActivityForm').modal('toggle');    
        
                }
            }, delay);
        });
    }

};

function openModalDelActivity(id){
    document.getElementById("headerEvent").innerHTML    = " Eliminar Actividad";
    document.getElementById("bodyEvent").innerHTML      = "¿Está seguro que desea eliminar esta actividad?";
    document.getElementById("btnConfirm").setAttribute("onclick", "delActivity(" + id + ");");
    $('#ModalConfirmEvent').modal('show');
};

function delActivity(id){
    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var Variables   = "idCompany=" + idCompany + "&id=" + id;

    $.post("backend/deleteActivity.php", Variables, function(DATA){
        if( DATA.ERROR  === true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
        
        }else{
            ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);

            var table   = document.getElementById("tableActivities");
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
