const delay   = 500;

class Rut{
    /**
     * 
     * @param {number} username The username without format
     * @param {boolean} isFormated Is the rut formated?
     */
    constructor(username, isFormated){
        username    = username.toString();

        if(isFormated){
            username    = username.replace(/[\.\-]/g, "");
        }

        this._username      = username.substr(0, username.length - 1);
        this._verificator   = username.charAt(username.length - 1);

        if(isFormated){
            this.assingFormat("");
        }
    }

    set username(value){
        this._username   = value;
    }

    set rut(value){
        this._rut    = value;
    }

    set verificator(value){
        this._verificator   = value;
    }

    get username(){
        return this._username;
    }

    get rut(){
        return this._rut;
    }

    get verificator(){
        return this._verificator;
    }

    /**
     * 
     * @param {string} id : Id of the input to set the rut. In other case put "" 
     */
    assingFormat(id){
        let chars  = this.username.split("");

        switch(chars.length){
            case 7:
                this._rut = chars[0] + "." + chars[1] + chars[2] + chars[3] + "." + chars[4] + chars[5] +
                        chars[6] + "-" + this.verificator;
                break;

            case 8:
                this._rut = chars[0] + chars[1] + "." + chars[2] + chars[3] + chars[4] + "." + chars[5] +
                        chars[6] + chars[7] + "-" + this.verificator;
                break;

            default:
                ModalReportEvent("Error", "15", "El rut ingresado no es válido");

                if(id != ""){ document.getElementById(id).value   = "" };
                this._rut = 0;
                return 0;
        }
    }

    isValid(id){
        var regex   = /([1-9]{1})([0-9]{0,1})\.([0-9]{3})\.([0-9]{3})\-((K|k|[0-9])){1}$/g;
	
        if( !regex.test( this.rut )){ 
            ModalReportEvent("Error", "15", "El rut ingresado no es válido");
            document.getElementById(id).value   = "";
            this._rut = 0;
            
            return false;
        }

        if( computeDv( parseInt(this.username) ).toString().toUpperCase() === this.verificator.toUpperCase() ){
            document.getElementById(id).value   = this.rut;
            return true;
            
        }else{
            ModalReportEvent("Error", 16, "El dígito verificador no coincide");
            document.getElementById(id).value   = "";
            return false;
        }

        /**
         * 
         * @param {Calculate the verificator digit} value 
         */
        function computeDv(value){
            var suma	= 0;
            var mul		= 2;
            
            if(typeof(value) !== 'number') { return ""; }
            
            value = value.toString();
            
            for(var i=value.length -1; i >= 0; i--) {
                suma = suma + value.charAt(i) * mul;
                mul = ( mul + 1 ) % 8 || 2;
            }
            
            switch(suma % 11) {
                case 1	: return 'k';
                case 0	: return 0;
                default	: return 11 - (suma % 11);
            }
        }
    }

    generateRut(){
        this.username       = this.username + this.verificator;
        this.verificator    = this.computeDv(parseInt(this.username)).toString().toUpperCase();

        this.assingFormat("");
    }

    /**
     * @param {Calculate the verificator digit} value 
     */
    computeDv(value){
        var suma	= 0;
        var mul		= 2;
        
        if(typeof(value) !== 'number') { return ""; }
        
        value = value.toString();
        
        for(var i=value.length -1; i >= 0; i--) {
            suma = suma + value.charAt(i) * mul;
            mul = ( mul + 1 ) % 8 || 2;
        }
        
        switch(suma % 11) {
            case 1	: return 'k';
            case 0	: return 0;
            default	: return 11 - (suma % 11);
        }
    }
}

class User{
    /**
     * 
     * @param {number} idCompany: Identified of the company  
     * @param {number} username: Is the rut the user without format 
     * @param {string} permissions: The permissions assigned (Admin, Mechanical, Electrician or Gardener)
     * @param {string} name: Name of the new user 
     * @param {string} lastname: Lastname of the new user 
     * @param {string} email: Email of the new user 
     * @param {number} phone: Number of movile (OPTIONAL)
     * @param {number} idOnDatabase: Id on the database (OPTIONAL)
     */
    constructor(idCompany, username, permissions, name, lastname, email, phone, idOnDatabase){
        this._idcompany     = idCompany;
        this._username      = username;
        this._permissions   = permissions;
        this._name          = NormalizeString(name);
        this._lastname      = NormalizeString(lastname);
        this._email         = email;
        this._phone         = phone;
        this._id            = idOnDatabase;
        this._lastOperation = "";
    }

    get idCompany(){
        return this._idcompany;
    }

    get username(){
        return this._username;
    }

    get permissions(){
        return this._permissions;
    }

    get name(){
        return this._name;
    }

    get lastname(){
        return this._lastname;
    }

    get email(){
        return this._email;
    }

    get phone(){
        return this._phone;
    }

    get id(){
        return this._id;
    }

    get lastOperation(){
        return this._lastOperation;
    }

    set idCompany(value){
        this._idcompany     = value;
    }

    set username(value){
        this._username      = value;
    }

    set permissions(value){
        this._permissions   = value
    }

    set name(value){
        this._name          = value;
    }

    set lastname(value){
        this._lastname      = value;
    }

    set email(value){
        this._email         = value;
    }

    set phone(value){
        this._phone         = value;
    }

    set id(value){
        this._id            = value;
    }

    set lastOperation(value){
        this._lastOperation     = value;
    }

    isValidName(inputId){
        var regex   = /([a-zA-Z\ \u00C0-\u00FF]){1,30}$/;
    
        if( !regex.test(this.name) ){
            ModalReportEvent("Error", 17, "El nombre ingresado contiene carácteres inválidos");
            document.getElementById(inputId).value  = "";

            return false;
        
        }else{
            return true;
        }
    }

    isValidLastname(inputId){
        var regex   = /([a-zA-Z\ \u00C0-\u00FF]){1,30}$/;
    
        if( !regex.test(this.lastname) ){
            ModalReportEvent("Error", 18, "El apellido ingresado contiene carácteres inválidos");
            document.getElementById(inputId).value  = "";

            return false;
        
        }else{
            return true;
        }
    }

    isValidEmail(inputId){
        var regex       = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
         
        if( !regex.test(this.email) ){
            ModalReportEvent("Error", 18, "El correo ingresado no es válido");
            document.getElementById(inputId).value  = "";

            return false;

        }else{
            return true;
        }
    }

    isValidPhone(inputId){
        var regex   = /^[3-9][0-9]{7}$/;
        
        if( !regex.test(this.phone) ){
//            ModalReportEvent("Error", 35, "El número telefónico ingresado es incorrecto");
            document.getElementById(inputId).value  = "";
            this.phone  = "";

            return true;

        }else{
            return true;
        }
    }

    add(){
        return new Promise((resolve, reject) => {
            let data    = new FormData();

            data.append("idCompany",    this.idCompany);
            data.append("username",     this.username);
            data.append("permissions",  this.permissions);
            data.append("name",         this.name);
            data.append("lastname",     this.lastname);
            data.append("email",        this.email);
            data.append("phone",        this.phone);
            
            $.ajax({
                url:            "backend/addUser.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (error)=>{ console.log(error); reject(false);},
                success:        (response)=>{
                    setTimeout(()=>{
                        CloseSpinner();

                        if( response.ERROR === true ){
                            ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                            resolve(false);

                        }else{
                            ModalReportEvent("Operación Exitosa", "", response.MESSAGE);
                            resolve(true);
                        }
                    }, delay);
                }
            });
        });
    }

    update(){
        return new Promise((resolve, reject) => {
            let data    = new FormData();

            data.append("id", this.id);
            data.append("username", this.username);
            data.append("permissions", this.permissions);
            data.append("name", this.name);
            data.append("lastname", this.lastname);
            data.append("email", this.email);
            data.append("phone", this.phone);

            $.ajax({
                url:            "backend/updateUser.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (error)=>{console.log(error); reject(false);},
                success:        (response)=>{
                    setTimeout(()=>{
                        CloseSpinner();

                        if(response.ERROR){
                            ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                            resolve(false);
                            
                        }else{
                            ModalReportEvent("Operación Exitosa", "", response.MESSAGE);
                            resolve(true);
                            
                        }
                    }, delay);
                }
            });
        });
    }

    delete(){
        return new Promise((resolve, reject) => {
            let data    = new FormData();
            
            data.append("username", this.username);

            $.ajax({
                url:            "backend/deleteUser.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (error)=>{console.log(error); reject(false);},
                success:        (response)=>{
                    setTimeout(()=>{
                        CloseSpinner();

                        if(response.ERROR){
                            ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                            resolve(false);

                        }else{
                            ModalReportEvent("Operación Exitosa", "", response.MESSAGE);
                            resolve(true);
                        }
                    }, delay);
                }
            });
        });
    }

    /**
     * 
     * @param {number} username: The username what will search to fill the inputs
     */
    get(username){
        return new Promise((resolve, reject) => {
            let data    = new FormData();
            data.append("username", username);

            $.ajax({
                url:            "backend/getUser.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (response)=>{console.log(response); reject(false);},
                success:        (response)=>{
                    if(response.ERROR){ 
                        ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                        document.getElementById("searchUname").value    = "";
                        resolve(false);
                    
                    }else{
                        this.idcompany      = sessionStorage.getItem("ID_COMPANY");
                        this.username       = username;
                        this.permissions    = response.permissions;
                        this.name           = response.name;
                        this.lastname       = response.lastname;
                        this.email          = response.email;
                        this.phone          = response.phone;
                        this.id             = response.id;

                        resolve(true);
                    }
                }
            });
        });
    }
}

class Table{
    /**
     * @param {string} id : Id of the table
     * @param {json} header : Header of the table
     * @param {number} columns : Number of columns (OPTIONAL)
     * @param {boolean} clone: Do you want to clone some table? Set the id
     */
    constructor(id, header, columns, clone){
        let table, container;

        if(clone){
            table   = document.getElementById(id);

            this._table     = table;
            this._columns   = table.children[0].children[0].childElementCount;
            this._tbody     = table.children[1];
            this._rows      = table.children[1].rows.length + 1;
        
        }else{
            switch(document.getElementById(id)){
                case null:
                case undefined:
                    container   = document.createElement("div");
                    container.setAttribute("class", "table-modal table-reponsive-xl");
                    container.setAttribute("id", "container:" + id);
                    container.setAttribute("style", header.father.style);
    
                    table       = document.createElement("table");
                    table.setAttribute("class", "table table-striped");
                    table.setAttribute("id", id);
                    table.setAttribute("style", header.table.width);
    
                    let thead       = document.createElement("thead");
                    let row         = document.createElement("tr");
    
                    for(let i=0; i<header.length; i++){
                        let cell  = document.createElement("th");
                        cell.setAttribute("scope", "col");
    
                        if(header[i].width != ""){
                            cell.setAttribute("width", header[i].width);
                        };
    
                        let name    = document.createTextNode(header[i].name);
                        cell.appendChild(name);
                        row.appendChild(cell);
                    }
    
                    thead.appendChild(row);
                    table.appendChild(thead);
                    container.appendChild(table);
                    document.getElementById(header.father.id).appendChild(container);
                    
                    columns = header.length;
    
                    break;
    
                default:
                    table           = document.getElementById(id);

                    break;
            };

            this._table     = table;
            this._columns   = columns;
            this._tbody     = document.createElement("tbody");
            this._rows      = 0;

        }

        this._id        = id;
    }

    get id(){
        return this._id;
    }

    get tbody(){
        return this._tbody;
    }

    get columns(){
        return this._columns;
    }

    get rows(){
        return this._rows;
    }

    get table(){
        return this._table;
    }

    set id(value){
        this._id        = value;
    }

    set tbody(value){
        this._tbody     = value;
    }

    set columns(value){
        this._columns   = value;
    }

    set rows(value){
        this._rows      = value;
    }

    set table(value){
        this._table     = value;
    }

    /**
     * @param {array} type: Array with the type of data (Button, Link or Text)
     * @param {array} data: Array that contains the data
     * @param {string} id: Id associated to the row (OPTIONAL)
     */
    addRow(type, data, id){
        var row     = document.createElement("tr");
        var cell    = [];

        if(id != ""){
            row.setAttribute("id", id);
        }

        for(var j=0; j<this.columns; j++){
            cell[j] = document.createElement("td");

            switch(type[j]){
                case "Button":;
                    for(let x=0; x<data[j].items; x++){
                        let textBtn = document.createTextNode(data[j][x].text);
                        let button  = document.createElement("button");
                        let icon    = document.createElement("span");

                        button.setAttribute("onclick", data[j][x].action);
                        button.setAttribute("class", data[j][x].classBtn);
                        button.setAttribute("style", data[j][x].styleBtn);
                        icon.setAttribute("class", data[j][x].classIcon);
                        
                        button.appendChild(icon);
                        button.appendChild(textBtn);

                        cell[j].appendChild(button);
                    }

                    break;
                
                case "Cell":
                    for(let x=0; x<data[j].items; x++){
                        let text    = document.createTextNode(data[j][x].text);
                        let icon    = document.createElement("span");

                        icon.setAttribute("class", data[j][x].classIcon);
                        
                        cell[j].appendChild(icon);
                        cell[j].appendChild(text);
                    }

                    break;

                case "Link":
                    let text    = document.createTextNode(data[j].content);
                    let link    = document.createElement("a");
                    link.href   = data[j].function;
                    link.appendChild(text);
                    cell[j].appendChild(link);

                    break;
             
                case "List":
                    for(let x=0; x<data[j].length; x++){
                        let container   = document.createElement("div");
                        let content     = document.createTextNode(data[j][x].name);
                        
                        container.setAttribute("style", "margin-bottom: 3%;");

                        container.appendChild(content);
                        cell[j].appendChild(container);
                    }

                    break;

                case "Select":
                    let select  = document.createElement("select");
                    select.setAttribute("class", "custom-select");

                    for(var i=0; i<data[j].options.length; i++){
                        let option  = document.createElement("option");
                        option.textContent  = data[j].options[i];
                        select.add(option);
                    }

                    switch(data[j].type){
                        case "state":
                            if(data[j].value == "1"){
                                select.value    = "Realizada";
        
                            }else if(data[j].value == "0"){
                                select.value    = "Pendiente";
        
                            }else{
                                select.value    = "Error Values";
        
                            }

                            break;
                
                        case "importance":
                            if(data[j].value == "1"){
                                select.value    = "Urgente";
        
                            }else if(data[j].value == "0"){
                                select.value    = "Normal";
        
                            }else{
                                select.value    = "Error Importance";
        
                            }

                            break;

                        default:
                            console.log("ERROR TYPE SELECT");
                    }
                    
                    cell[j].appendChild(select);

                    break;

                case "Text":
                    let content = document.createTextNode(data[j]);
                    cell[j].appendChild(content);

                    break;

                case "TextArea":
                    let textArea            = document.createElement("textarea");
                    textArea.textContent    = data[j];
                    cell[j].appendChild(textArea);

                    break;

                default:
                    let error   = document.createTextNode("Error Type");
                    cell[j].appendChild(error);

                    break;
            }

            row.appendChild(cell[j]);
            this.rows   = this.rows + 1;
        }
        
        this.tbody.appendChild(row);
    }

    clear(){
        try{
            let table   = document.getElementById(this.id);
            table.children[1].remove();
        
        }catch(e){
            console.log("No se pueden borrar los hijos de una tabla vacia");
        }
    }

    encapsulate(){
        this.clear();
        document.getElementById(this.id).appendChild(this.tbody);
    }

}

class Activity{
    /**
     * 
     * @param {string} name: Name of the activity
     * @param {date} date: When the activity can be realice
     * @param {string} frecuency: Period to do the next maintance 
     * @param {string} location: Where the activity is associated
     * @param {string} priority: Priority of the activity. This can be Alta, Media or Baja
     * @param {string} area: Area associated to the activity. This can be Mecánica, Eléctrica or Jardinería
     * @param {text} comments: Comments associated to the activity (OPTIONAL)
     * @param {number} id: Id on the database (OPTIONAL)
     */
    constructor(name, date, frecuency, location, priority, area, comments, id){
        this._name          = name;
        this._date          = date;
        this._frecuency     = frecuency;
        this._location      = location;
        this._priority      = priority;
        this._area          = area;
        this._comments      = comments == undefined || comments == null ? "" : comments;
        this._id            = id;
        this._maintances    = "";
    }

    get name(){
        return this._name;
    }

    get date(){
        return this._date;
    }

    get frecuency(){
        return this._frecuency;
    }

    get location(){
        return this._location;
    }

    get priority(){
        return this._priority;
    }

    get area(){
        return this._area;
    }

    get comments(){
        return this._comments;
    }

    get id(){
        return this._id;
    }

    get maintances(){
        return this._maintances;
    }

    set name(value){
        this._name      = value;
    }

    set date(value){
        this._date      = value;
    }

    set frecuency(value){
        value   = value.replace(/ /g, "");
        this._frecuency = value;
    }

    set location(value){
        this._location  = value;
    }

    set priority(value){
        value   = value.replace(/ /g, "");
        this._priority  = value;
    }

    set area(value){
        value   = value.replace(/ /g, "");
        this._area      = value;
    }

    set priority(value){
        value   = value.replace(/ /g, "");
        this._priority  = value;
    }

    set comments(value){
        this._comments  = value;
    }

    set id(value){
        this._id    = value;
    }

    set maintances(value){
        this._maintances        = value;
    }

    /**
     * 
     * @param {string} inputId : Id of the input that containts the name 
     * @param {number} index : If is create by the application, the value is -1
     */
    isValidName(inputId, index){
        var regex   = /([a-zA-Z0-9\ \u00C0-\u00FF]){1,50}$/;
            
        if(!regex.test(this.name)){
            if(index == -1){
                ModalReportEvent("Error", 17, "El nombre ingresado contiene carácteres inválidos");
                document.getElementById(inputId).value  = "";
         
            }else{
                setTimeout(()=>{
                    CloseSpinner();
                    ModalReportEvent("Error", 46, "El nombre en la posición " + index + " contiene carácteres inválidos");
                }, 500);
            }
            
            return false;
            
        }else{
            return true;
        }
    }
    
     /**
     * 
     * @param {string} inputId : Id of the input that containts the name 
     * @param {number} index : If is create by the application, the value is -1
     */
    isValidDate(inputId, index){
        var today   = new Date();
        today       = today.toISOString().slice(0,10);
    
        let dateAux = this.date.split("-");

        if( dateAux.length == 3 ){
            return  true;
          /*  let dateRequired    = "";
            
            if( index == -1 ){
                dateRequired    = dateAux[0] + "-" + dateAux[1] + "-" + dateAux[2];
            }else{
                dateRequired    = dateAux[2] + "-" + dateAux[1] + "-" + dateAux[0];
            }
    
            var date    = new Date( dateRequired );
            date        = date.toISOString().slice(0,10);
    
            var date    = new Date(this.date);
            date        = date.toISOString().slice(0,10);

            if( date < today ){
                if(index == -1){
                    ModalReportEvent("Error", 52, "No es posible iniciar actividades en periodos anteriores a hoy");
                    document.getElementById(inputId).value  = "";

                }else{
                /*    setTimeout(()=>{
                        CloseSpinner();
                        ModalReportEvent("Error", 47, "La fecha de inicio en la fila " + index + " es previa al dia de hoy");
                    }, 500);
                
                    return true;
                }
    
                return false;
            
            }else{
                return true;
            
            }
    */
        }else{
            if( index != -1){
                setTimeout(()=>{
                    CloseSpinner();
                    ModalReportEvent("Error", 64, "La fecha de inicio en la fila " + index + " contiene un error de escritura");
                }, 500);

            }else{
                ModalReportEvent("Error", "MODIFICAR", "La fecha ingresada es incorrecta");
                document.getElementById(inputId).value  = "";

            }

            return false;
        }
    }

     /**
     * 
     * @param {string} inputId : Id of the input that containts the name 
     * @param {number} index : If is create by the application, the value is -1
     */
    isValidFrecuency(inputId, index){
        switch(this.frecuency){
            case "Diaria":
            case "Semanal":
            case "Quincenal":
            case "Mensual":
            case "Bimensual":
            case "Trimestral":
            case "Semestral":
            case "Anual":
            case "Bianual":
            case "Trianual":
                return true;
            default:
                if(index == -1){
                    ModalReportEvent("Error", 20, "La frecuencia ingresada no es válida");
                    document.getElementById(inputId).value  = "";
    
                }else{
                    setTimeout(()=>{
                        CloseSpinner();
                        ModalReportEvent("Error", 20, "La frecuencia en la posición " + index +" es incorrecta.");
                    }, 500);
                }
    
                return false;
        }
    }

     /**
     * 
     * @param {string} inputId : Id of the input that containts the name 
     * @param {number} index : If is create by the application, the value is -1
     */
    isValidLocation(inputId, index){
        let target      = this.location;
        let found       = false;
        let locations   = document.getElementById(inputId); 
    
        for(var i=0; i<locations.length; i++){
            if( target != "" && target == locations.children[i].value ){
                found   = true;
                break;
            }
        }
    
        if(found){
            return true;

        }else{
            if(index == -1){
                ModalReportEvent("Error", "MODIFICAR", "La ubicación selecionada no es válida");
                document.getElementById(inputId).value  = "";

            }else{
                setTimeout(()=>{
                    CloseSpinner();
                    ModalReportEvent("Error", 43, "La ubicación en la posición " + index + " no está registrada");
                }, delay);
            }

            return false;
        }
    }

    /**
     * 
     * @param {string} inputId : Id of the input that containts the name 
     * @param {number} index : If is create by the application, the value is -1
     */
    isValidPriority(inputId, index){
        switch(this.priority){
            case "Baja":
                return true;
            case "Media":
                return true;
            case "Alta":
                return true;
            default:
                if(index == -1){
                    ModalReportEvent("Error", "MODIFICAR", "La prioridad selecionada no es válida");
                    document.getElementById(inputId).value  = "";
    
                }else{
                    setTimeout(()=>{
                        CloseSpinner();
                        ModalReportEvent("Error", 42, "La prioridad en la posición " + index + " es incorrecta. Sólo se acepta 'Alta', 'Media' o 'Baja'");
                    }, 500);
                }
    
                return false;
        }
    }

    /**
     * 
     * @param {string} inputId : Id of the input that containts the name 
     * @param {number} index : If is create by the application, the value is -1
     */
    isValidArea(inputId, index){
        switch(this.area){
            case "Mecánica":
                return true;
            case "Eléctrica":
                return true;
            case "Jardinería":
                return true;
            default:
                if(index == -1){
                    ModalReportEvent("Error", 44, "El área seleccionada no es válida");
                    document.getElementById(inputId).value  = "";
    
                }else{
                    setTimeout(()=>{
                        CloseSpinner();
                        ModalReportEvent("Error", 44, "El área en la posición " + index + " es incorrecta. Sólo se acepta 'Mecánica', 'Eléctrica' o 'Jardinería'");
                    }, 500);
                }
    
                return false;
        }
    }

    frecuencyToPeriod(){
        switch(this.frecuency){
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
                return 90;
            case "Semestral":
                return 180;
            case "Anual":
                return 360;
            case "Bianual":
                return 720;
            case "Trianual":
                return 1080;
            default:
                return "ERROR";
        }
    }

    /**
     * @param {boolean} showMessage : Do you want to show an message when is added an activity?
     * @param {boolean} isExcel: You are adding the data from an excel?  
     */
    add(showMessage, isExcel){
        return new Promise((resolve, reject) => {
            let data    = new FormData();

            data.append("isExcel", isExcel);
            data.append("name", this.name);
            data.append("date", this.date);
            data.append("frecuency", this.frecuencyToPeriod());
            data.append("location", this.location);
            data.append("priority", this.priority);
            data.append("area", this.area);
            data.append("comments", this.comments);

            $.ajax({
                url:            "backend/addActivity.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (response)=>{console.log(response); reject(false)},
                success:        (response)=>{
                    if(response.ERROR){
                        ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                        resolve(false);
                    }else{
                        if(showMessage){
                            ModalReportEvent("Operación exitosa", "", response.MESSAGE);
                        }
                        resolve(true);
                    }
                }
            });
        });
    }

    maintances(){
        return new Promise((resolve, reject) => {
            let data    = new FormData();
            
            data.append("idActivity", this.id);

            $.ajax({
                url:            "backend/getRecordsPerActivity.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (error)=>{console.log(error); reject(false)},
                success:        (response)=>{
                    if(response.ERROR){
                        ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                        resolve(false);
                    
                    }else{
                        this.maintances     = response;
                        resolve(true);
                    }
                }
            });
        });
    }

    update(){
        return new Promise((resolve, reject) => {
            let data    = new FormData();
            data.append("id", this.id);
            data.append("name", this.name);
            data.append("date", this.date);
            data.append("frecuency", this.frecuencyToPeriod());
            data.append("location", this.location);
            data.append("priority", this.priority);
            data.append("area", this.area);
            data.append("comments", this.comments);

            $.ajax({
                url:            "backend/updateActivity.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (response)=>{console.log(response); reject(false)},
                success:        (response)=>{
                    setTimeout(()=>{
                        CloseSpinner();

                        if(response.ERROR){
                            ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                            resolve(false);
                        }else{
                            ModalReportEvent("Operación exitosa", "", response.MESSAGE);
                            resolve(true);
                        }
                    }, delay);
                }
            });
        });
    }

    delete(){
        return new Promise((resolve, reject) => {
            let data    = new FormData();
            data.append("id",this.id);

            $.ajax({
                url:            "backend/deleteActivity.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (response)=>{console.log(response); reject(false)},
                success:        (response)=>{
                    setTimeout(()=>{
                        if(response.ERROR){
                            ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                            resolve(false);
                        }else{
                            ModalReportEvent("Operación Exitosa", "", response.MESSAGE);
                            resolve(true);
                        }
                    }, delay);
                }
            });
        });
    }
}

class PDF{
    /**
     * 
     * @param {string} logo : Image in base 64 format 
     */
    constructor(logo){
        this._doc           = new jsPDF('p', 'pt', 'letter');
        this._margins       = {top:30, bottom:40, left:50, width:550};
        this._logo          = logo;
    }

    get doc(){
        return this._doc;
    }

    get margins(){
        return this._margins;
    }

    get logo(){
        return this._logo;
    }

    get title(){
        return this._title;
    }

    set doc(value){
        this._doc       = value;
    }

    set margins(value){
        this._margins   = value;
    }

    set logo(value){
        this._logo      = value;
    }

    set title(value){
        this._title     = value;
    }

    setTitle(title){
        this.doc.addImage(this.logo,
            'JPEG',
            this.margins.left,
            this.margins.top,
            100,
            50
        );

        this.nextLine(35);
        this.title          = title;

        this.doc.text(this.title, this.margins.left + 150, this.margins.top);
    }

    setRecord(value){
        let string;

        switch (value.toString().split("").length){
            case 1:
                string  = "N° 00000" + value;
                break;
            case 2:
                string  = "N° 0000" + value;
                break;
            case 3:
                string  = "N° 000" + value;
                break;
            case 4:
                string  = "N° 00" + value;
                break;
            case 5:
                string  = "N° 0" + value;
                break;
            case 6:
                string  = "N° " + value;
                break;
            default:
                string  = "ERROR";
                break;
        }

        this.doc.text(string, this.margins.left + 400, this.margins.top);
    }

    /**
     * 
     * @param {string} type : The type of data can be Linear | Table 
     * @param {object} data : Data to show
     * @param {boolean} clone : If the data is an table, do you want to clone it?
     * @param {number} limit : Limit to clone, for example an table
     */
    setBody(type, data, clone, limit){
        this.nextLine(50);
        this.doc.setFontSize(12);

        switch(type){
            case "Linear":
                for(var i=0; i<data.length; i++){
                    this.doc.text(data[i].title, this.margins.left, this.margins.top);
                    this.doc.text(data[i].data, this.margins.left + data.position, this.margins.top);
                
                    if( data.length - i != 1 ){
                        this.nextLine(25);
                    }
                }

                break;

            case "Table":
                let objectToPrint;

                if(clone){
                    objectToPrint  = document.getElementById(data).cloneNode(true);
                    objectToPrint.rows[0].cells[limit].remove();
                
                    for( var i=0; i<objectToPrint.children[1].children.length; i++ ){
                        objectToPrint.children[1].rows[i].cells[5].remove();
                    }
                
                }else{
                    objectToPrint   = data;
                }
                
                this.doc.autoTable({
                    startY: this.margins.top,
                    html: objectToPrint,
                });

                break;

            default:
                break;
        }

    }

    /**
     * 
     * @param {number} value : Space between the current line to the next line
     */
    nextLine(value){
        this.margins.top    = this.margins.top + value;
    }

    print(name){
        if(name == ""){ return; }
        this.doc.save(name + ".pdf");
    }
}

class Guide{
    /**
     * 
     * @param {number} id : Id on the database
     * @param {string} username : User associated to the new guide
     * @param {array} activities : Activities´s list in the guide
     * @param {string} dateEmitted : Date when the guide was emitted
     * @param {string} dateFinished : Date when the guide was finished
     */
    constructor(id, username, activities, dateEmitted){
        this._id            = id;
        this._username      = username;
        this._activities    = activities;
        this._dateEmitted   = dateEmitted;
        this._lastOperation = 0;
        this._state         = 0;
        this._states        = [];
        this._observations  = [];
        this._importances   = [];
        this._piezometrias  = [];
        this._annexes       = [];
        this._warnings      = [];
    }

    get id(){
        return this._id;
    }

    get username(){
        return this._username;
    }

    get activities(){
        return this._activities;
    }

    get dateEmitted(){
        return this._dateEmitted;
    }

    get lastOperation(){
        return this._lastOperation;
    }

    get states(){
        return this._states;
    }

    get state(){
        return this._state;
    }

    get observations(){
        return this._observations;
    }

    get importances(){
        return this._importances;
    }

    get piezometrias(){
        return this._piezometrias;
    }

    get annexes(){
        return this._annexes;
    }

    get warnings(){
        return this._warnings;
    }

    set id(value){
        this._id        = value;
    }

    set username(value){
        this._username  = value;
    }

    set activities(value){
        this._activities = value;
    }

    set dateEmitted(value){
        this._dateEmitted = value
    }

    set lastOperation(value){
        this._lastOperation     = value;
    }

    set states(value){
        this._states     = value;
    }

    set state(value){
        this._state     = value;
    }

    set observations(value){
        this._observations  = value;
    }

    set importances(value){
        this._importances   = value;
    }

    set piezometrias(value){
        this._piezometrias  = value;
    }

    set annexes(value){
        this._annexes       = value;
    }

    set warnings(value){
        this._warnings      = value;
    }

    /**
     * 
     * @param {boolean} deleteSuggestion : Do you want to delete the suggestion associated?
     * @param {number} idSuggestion: Id of the suggestion (OPTIONAL) 
     */
    add(deleteSuggestion, idSuggestion){
        return new Promise((resolve, reject) => {
            let data    = new FormData();
            data.append("username", this.username);
            data.append("activities", this.activities);
            data.append("deleteSuggestion", deleteSuggestion);
            data.append("idSuggestion", idSuggestion);

            $.ajax({
                url:            "backend/addRecord.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (error)=>{console.log(error); reject(false)},
                success:        (response)=>{
                    if(response.ERROR){
                        ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                        resolve(false);
                    }else{
                        this.id             = response.id;
                        resolve(true);
                    }
                }
            });
        });
    }

    /**
     * 
     * @param {number} username : Who is request the data
     * @param {boolean} isAdmin : Is the user an admin?
     */
    get(username, isAdmin){
        return new Promise((resolve, reject) => {
            let data    = new FormData();

            data.append("idRecord", this.id);
            data.append("username", username);
            data.append("isAdmin", isAdmin);

            $.ajax({
                url:            "backend/getRecord.php",
                type:           "POST",
                data:           data,
                contentType:    false,
                processData:    false,
                error:          (error)=>{console.log(error); reject(false)},
                success:        (response)=>{
                    if(response.ERROR){
                        ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                        resolve(false);

                    }else{
                        for(let i=0; i<response.COUNT; i++){
                            let activity    = new Activity(
                                response[i].name,
                                "",
                                "",
                                response[i].location,
                                "",
                                "",
                                "",
                                response[i].id
                            );

                            let observation = "";
                            let found       = false;
                            let index       = 0;

                            try{
                                for(let j=0; j<response.observations[i].length; j++){
                                    let idAux   = response.observations[j].split("|")[0];
    
                                    if(idAux == response[i].id){
                                        found   = true;
                                        index   = j;
    
                                        break;
                                    }
                                }
    
                                if(found){
                                    let auxObs  = response.observations[index].replace(/\r\n/g, "");
                                    observation = auxObs.split("|")[1];
                                }
                            
                            }catch(e){
                                console.log("La actividad no registra observaciones");
                            }

                            this.importances.push(response[i].importance);
                            this.observations.push(observation);
                            this.activities.push(activity);
                            this.states.push(response[i].state);
                            this.annexes.push(response.annexes[i]);
                            this.warnings.push(response.warnings[i]);
                        }

                        this.state          = response.stateRecord;
                        this.username       = response.name_mandated + " " + response.lastname_mandated;
                        this.dateEmitted    = assingFormatDate(response.dateStart);
                        
                        resolve(true);
                    }
                }
            });
        });
    }

    update(){
        return new Promise((resolve, reject) => {
            let data = new FormData();

            data.append("idRecord", this.id);
            data.append("arrayObservations", this.observations);
            data.append("arrayStates", this.states);
            data.append("piezometriaData", this.piezometrias);
            data.append("arrayImportances", this.importances);
        
            $.ajax({
                type:           "POST",
                url:            "backend/updateRecord.php",
                contentType:    false,
                processData:    false,
                data:           data,
                error:          (error)=>{console.log(error); reject(false)},
                success:        (response)=>{
                    if(response.ERROR){
                        ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                        resolve(false);

                    }else{
                        ModalReportEvent("Operación exitosa", "", response.MESSAGE);
                        resolve(true);
                    }
                }
            });
        });
    }
}

/**
 * 
 * @param {Where from the data} idInput 
 */
function newRut(idInput){
    rut         = new Rut(document.getElementById(idInput).value, false);

    rut.assingFormat(idInput);
    rut.isValid(idInput);
}

function capitalCase(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * 
 * @param {string} value :Value of the date
 * @param {boolean} type : Type 1 =  | Type 2 = 
 */
function assingFormatDate(value){
    let dateAux = value.split("-");
    return dateAux[2] + "-" + dateAux[1] + "-" + dateAux[0];
}

/**
 * 
 * @param {number} value :The value will be parse to the period to frecuency
 */
function periodToFrecuency(value){
    switch(value){
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
        case 90:
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
            return "ERROR";
    }
}

/**
 * 
 * @param {string} functionName : Function that will be executed
 * @param {string} inputId : Input that will trigger the function
 */
function EventToChangeInput(functionName, inputId){
    document.getElementById(inputId).addEventListener("change", function(event){
        if( event.which != 13 || event.keyCode != 13 ){
            eval(functionName);
        }
    });
}

function EventToPressEnter(functionName, inputId){
    
    if( inputId === "" ){
        document.addEventListener("keypress", function(event){
            if (event.which == 13 || event.keyCode == 13){
                window[functionName]();
            }
        });
        
    }else{
        document.getElementById(inputId).addEventListener("keypress", function(event){
            if (event.which == 13 || event.keyCode == 13){
                window[functionName]();
            }
        });
    }
}

function removeAllChildNodes(parent) {
    while (parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
};

function RemoveElement(id){
var element = document.getElementById(id);
element.parentNode.removeChild(element);
}
 
function ShowSpinner(){
    $("#modalSpinner").modal('show');
}

function CloseSpinner(){
    $("#modalSpinner").modal("toggle");
}

function SortSelect(select){
    $(select).each(function() {            
        // Keep track of the selected option.
        var selectedValue = $(this).val();     
        // Sort all the options by text. I could easily sort these by val.
        $(this).html($("option", $(this)).sort(function(a, b) {
            return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
        }));     
        // Select one option.
        $(this).val(selectedValue);
    });
}

function FormatNumber(Value){
    
    var dot     = String(Value).split(".");
    
    if( dot[0] == "0" ){
        Value   = parseFloat(Value).toFixed(2);
        return Value;
       
    }else{
        Value       = parseFloat(Value).toFixed(0);
        Value       = String(Value).split("");
    
        var aux     = "";
        var count   = 0;
                        
        for( var i=Value.length; i>0; i-- ){
            
            if( count == 3 ){
                aux     = Value[i - 1] + "." + aux;
                count   = 1;
            
            }else{
                aux     = Value[i - 1] + aux;
                count++;
            }
        }
        
        return aux;
    }
}

function SetTitle(Title){
document.getElementById("titlePage").innerHTML  = Title;
}

function FormatDate(date){

    date    = date.split('-');
    date    = date[2] + "/" + date[1] + "/" + date[0];
    
  // let newDate     = new Date(date);
   // let currentDate = newDate.toISOString().slice(0,10);
 return date;
 //   return currentDate;
}

function FocusOn(id){
    document.getElementById(id).focus();
}

function NormalizeString(parameter1){
    var aux = parameter1.split(" ");
    aux[0]  = aux[0].toLowerCase();
    
    return aux[0].charAt(0).toUpperCase() + aux[0].slice(1);
}

function CloseModal(id) {
$(id).modal('hide');
$('body').children('div:nth-last-child(1)').fadeOut();
$('body').children('div:nth-last-child(2)').fadeOut();
}



 /*
This function was designed to verify the permissions assigned to a new user.
Here we only have four permissions, these are:
 * 1 = Administrador
 * 2 = Mecánico
 * 3 = Eléctrico
 * 4 = Jardinero
*/

function areValidPermissions(option){

    var permissions = "";
    var error       = true;
    
    if ( option == "add" || option == "edit" ){
        var administrator   = document.getElementById(option + "Administrator").checked;
        var mechanic        = document.getElementById(option + "Mechanic").checked;
        var electrician     = document.getElementById(option + "Electrician").checked;
        var gardener        = document.getElementById(option + "Gardener").checked;
        
        // Verifying if a person is administrator
        if( administrator === true ){
            permissions += "1";
            error        = false;
        }else{
            permissions += "0";
        }
        
        // Verifying if a person is mechanic
        if( mechanic === true ){
            permissions += "1";
            error        = false;
        }else{
            permissions += "0";
        }
        
        // Verifying if a person is electrician
        if( electrician === true ){
            permissions += "1";
            error        = false;
        }else{
            permissions += "0";
        }
        
        // Verifying if a person is a gardener
        if( gardener === true ){
            permissions += "1";
            error        = false;
        }else{
            permissions += "0";
        }
        
        if( error ){
            ModalReportEvent("Error", 19, "No se ha seleccionado ningún permiso");
            return "";
        }else{
            return permissions;
        }

    }else{
        ModalReportEvent("Error", 20, "La opción " + option + " no es válida dentro de los permisos");
        return "";
    }
    
 }

function getActivities(idRecord){
    return new Promise((resolve, reject) => {
        let data    = new FormData();
        data.append("all", 1);
        data.append("idRecord", idRecord);
       // data.append("arrayIdActivities", []);

        $.ajax({
            url:            "backend/getActivities.php",
            type:           "POST",
            data:           data,
            processData:    false,
            contentType:    false,
            error:          (error)=>{console.log(error); reject("")},
            success:        (response)=>{
                if(response.ERROR){
                    CloseSpinner();
                    resolve("");

                }else{
                    resolve(response);
                }
            }
        });
    });
};

function rolToPermission(idRol){
    return new Promise((resolve) => {
        let role    = document.getElementById(idRol).innerHTML;
        switch(role){
            case "Mecánico":
                resolve("Mecánica");
                break;
            case "Electricista":
                resolve("Eléctrica");
                break;
            case "Jardinero":
                resolve("Jardinería");
                break;
            default:
                resolve("ERROR");
                break;
        }
    });
}

function compareDateToToday(inputId){
    let date        = new Date(document.getElementById(inputId).value);
    let today       = new Date();

    let difference  = Math.round((today.getTime() - date.getTime()) / (1000*60*60*24));

    return difference > 0 ? true : false;
}

function clearSelect(inputId){
    let select  = document.getElementById(inputId);

    for(let i=0; i<select.length; i++){
        select.remove(i);
    }
}