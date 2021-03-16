function initContacts(){
    document.getElementById("sendMessage").disabled     = true;
    document.getElementById("messageContent").value     = "";

    document.getElementById("messageContent").addEventListener("keyup", function(){
        if( this.value == "" ){
            document.getElementById("sendMessage").disabled  = true;
        }else{
            document.getElementById("sendMessage").disabled  = false;
        }
    });

    $.post("backend/getReports.php", "idCompany=" + sessionStorage.getItem('ID_COMPANY'), function(DATA){
        if( DATA.ERROR ){
            setTimeout(() => {
                console.log(DATA);
                CloseSpinner();
//                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            }, 500);

        }else{
            var table, containerTable;

            var idTable     = "tableThreads";
            var idContainer = "containerThreads";

            if( document.getElementById(idContainer) != null ){
                document.getElementById(idContainer).remove();
            }

            containerTable    = document.createElement("div");
            containerTable.setAttribute("class", "table-modal table-reponsive-md");
            containerTable.setAttribute("id", "containerTable");
    
            table       = document.createElement("table");
            table.setAttribute("class", "table table-striped");
            table.setAttribute("id", idTable);
    
            var thead                   = document.createElement("thead");

            var rowHead                 = document.createElement("tr");

            var indexHeadCell           = document.createElement("th");
            var titleHeadCell           = document.createElement("th");

            indexHeadCell.setAttribute("scope", "col");
            titleHeadCell.setAttribute("scope", "col");

            var indexHead       = document.createTextNode("N°");
            var titleHead       = document.createTextNode("Título");

            indexHeadCell.appendChild(indexHead);
            titleHeadCell.appendChild(titleHead);

            rowHead.appendChild(indexHeadCell);
            rowHead.appendChild(titleHeadCell);

            thead.appendChild(rowHead);
            table.appendChild(thead);
        
            var bodyTable   = document.createElement("tbody");

            // Create the rows
            for (var i=0; i<DATA.COUNT; i++){

                // Here is created every row
                var row             = document.createElement("tr");

                // Here is created every cell
                var indexCell	    = document.createElement("td");
                var titleCell       = document.createElement("td");
                
                // Here is storaged the content into a node
                var index           = document.createTextNode( i + 1 );
                var title           = document.createElement("a");
                var link            = document.createTextNode( DATA[i].title );

                // Setting the parameters
                title.appendChild(link);

                var stringType      = "";
                var stringAuthor    = "";
                var stringContent   = "";

                for(var j=0; j<DATA[i].content.length; j++){

                    if( stringType == "" ){
                        stringType      = DATA[i].content[j].type;
                        stringAuthor    = DATA[i].content[j].author;
                        stringContent   = DATA[i].content[j].content;

                    }else{
                        stringType      = stringType + "|" + DATA[i].content[j].type;
                        stringAuthor    = stringAuthor + "|" + DATA[i].content[j].author;
                        stringContent   = stringContent + "|" + DATA[i].content[j].content;
                        
                    }
                    
                }

                title.href  = "javascript:openContent(" + DATA[i].idReport + ", '" + DATA[i].title + "', '" + stringType + "', '" + stringAuthor + "', '" + stringContent + "');";  
                
                // Here is inserted the content into the cells
                indexCell.appendChild(index);
                titleCell.appendChild(title);

                // Here is inserted the cells into a row
                row.appendChild(indexCell);
                row.appendChild(titleCell);
                
                // Here is inserted the row into the table´s body
                bodyTable.appendChild(row);
            }

            table.appendChild(bodyTable);
            containerTable.appendChild(table);
            document.getElementById("body-container").appendChild(containerTable);

            setTimeout(() => {
                CloseSpinner();
            }, 500);
        }
    });
};

function openContent(idReport, title, stringType, stringAuthor, stringContent){
    var arrayType       = stringType.split("|");
    var arrayAuthor     = stringAuthor.split("|");
    var arrayContent    = stringContent.split("|");

    document.getElementById("titleThread").textContent  = " " + title;
    document.getElementById("contentThread").value      = "";
    document.getElementById("messageContent").value     = "";
    document.getElementById("sendMessage").disabled     = true;
    document.getElementById("sendMessage").setAttribute("onclick", "respondMessage(" + idReport + ");");

    for(var i=0; i<arrayType.length; i++){
        if( arrayType[i] == 'E' ){
            document.getElementById("contentThread").value      += arrayAuthor[i] + " : " + arrayContent[i] + "\n";
        
        }else if( arrayType[i] == 'A' ){
            if( arrayContent[i] != null || arrayContent[i] != '' ){
                document.getElementById("contentThread").value  += "Webmaster : " + arrayContent[i] + "\n";
            }

        }
    }

    $('#contentForm').modal('show');
};

function respondMessage(idReport){
    var idCompany   = sessionStorage.getItem('ID_COMPANY');
    var author      = sessionStorage.getItem('NAME') + " " + sessionStorage.getItem('LASTNAME');
    var message     = document.getElementById("messageContent").value;
    
    var Variables   = "idCompany=" + idCompany + "&idReport=" + idReport + "&author=" + author + "&message=" + message;

    $.post("backend/updateReport.php", Variables, function(DATA){
        if( DATA.ERROR ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{
            document.getElementById("contentThread").value  += author + " : " + message + "\n";
            document.getElementById("messageContent").value = "";
        }
    });
};

function addReport(){
    $('#contactForm').modal('toggle');

    var topic   = document.getElementById("topicMessage").value;
    var message = document.getElementById("bugMessage").value;

    if(topic == ""){
        ModalReportEvent("Error", 26, "No se ha ingresado el tema para la consulta");
    
    }else if(message == ""){
        ModalReportEvent("Error", 27, "No se ha ingresado ningúna consulta");
    
    }else{
        var name        = sessionStorage.getItem("NAME");
        var lastname    = sessionStorage.getItem("LASTNAME");
        var idCompany   = sessionStorage.getItem("ID_COMPANY");

        var Variables   = "idCompany=" + idCompany + "&name=" + name + "&lastname=" + lastname + "&topic=" + topic + "&message=" + message;

        $.post("backend/addReport.php", Variables, function(DATA){
            if( DATA.ERROR  === true ){
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

            }else{
                ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
            }

            //Deleting the data putted in the inputs
            document.getElementById("topicMessage").value   = "";
            document.getElementById("bugMessage").value     = "";
        });
    }
};