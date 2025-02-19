// improve query accepting so \n is erased from user's textarea.

class PatientsTable {
    constructor(responseDiv) {
        this.responseDiv = responseDiv;
    }

    displayPatients(data) {
        console.log(data)
        this.responseDiv.innerHTML = ''; // clear

        // Create a table element
        const table = document.createElement('table');
        const headerRow = document.createElement('tr');

        // Create headers
        const idHeader = document.createElement('th');
        idHeader.innerText = 'ID'; 
        const nameHeader = document.createElement('th');
        nameHeader.innerText = 'Name';
        const dobHeader = document.createElement('th');
        dobHeader.innerText = 'Date of Birth';

        if (data[0].patientid)headerRow.appendChild(idHeader);
        if (data[0].name)headerRow.appendChild(nameHeader);
        if (data[0].dateOfBirth)headerRow.appendChild(dobHeader);

        table.appendChild(headerRow);

        // Each patient
        data.forEach(({ patientid, name, dateOfBirth }) => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.innerText = patientid;
            const nameCell = document.createElement('td');
            nameCell.innerText = name;
            const dobCell = document.createElement('td');
            dobCell.innerText = new Date(dateOfBirth).toLocaleDateString();

            if (patientid) row.appendChild(idCell);
            if (name) row.appendChild(nameCell);
            if (dateOfBirth) row.appendChild(dobCell);

            table.appendChild(row);
        });

        this.responseDiv.appendChild(table);
    }
}


class PatientBook {
    constructor(url) {
        this.queryInput = document.getElementById("sqlQuery");
        this.responseDiv = document.getElementById("response");
        this.serverUrl = url;
        this.patientsTable = new PatientsTable(this.responseDiv);
    }

    validateQuery(query) {
        if (!query) return enter_query_string;
        if (!/^(SELECT|INSERT)/i.test(query)) return only_select_insert_string;
        return null; // No validation errors
    }

    getRequestMethod(query) {
        return query.toLowerCase().startsWith("select") ? "GET" : "POST";
    }

    formatResponse(data, method) {
        switch (method) {
            case "GET":
                if (Array.isArray(data)) {
                    this.patientsTable.displayPatients(data);
                    return null; // no message needed
                }
                return select_failed_string + data.error;
    
            case "POST":
                if (data.affectedRows > 0) {
                    return successful_insert_string + data.affectedRows;
                } else {
                    return no_records_string;
                }
        }
    }

    async sendQuery() {
        const query = this.queryInput.value.trim();
        const validationError = this.validateQuery(query);
        if (validationError) return this.displayResponse(validationError);

        const method = this.getRequestMethod(query);
        let url = this.serverUrl + encodeURIComponent(query); // for special characters
        // what is x-www-form-urlencoded?
        let options = { method: method, headers: { "Content-Type": "application/x-www-form-urlencoded" } };

        try {
            const response = await fetch(url, options);
            const data = await response.json();

            let message = this.formatResponse(data, method);
            this.displayResponse(message);
            
        } catch (error) {
            this.displayResponse(error.message);
        }
    }

    async insertDefault() {
        this.queryInput.value = "INSERT INTO patients (name, dateOfBirth) VALUES ('Alice', '1990-01-01'), ('Bob', '1991-02-02'), ('Charlie', '1992-03-03')";
        this.sendQuery();
    }

    displayResponse(message) {
        if (message) {
            this.responseDiv.innerText = message;
        }
    }
}

class Main {
    constructor() {
        // Populate strings from en.js
        document.getElementById('app-name').innerText = app_name_string;
        document.getElementById('sqlQuery').placeholder = text_area_placeholder_string;
        document.getElementById('button-string').innerText = button_string;
        document.getElementById('insert-default').innerText = insert_default_string;
        document.title = title_string;

        // New instance of PatientBook
        this.patientBook = new PatientBook("https://lionfish-app-u8snj.ondigitalocean.app/sql/");
        document.getElementById('button-string').addEventListener("click", () => this.patientBook.sendQuery());
        document.getElementById('insert-default').addEventListener("click", () => this.patientBook.insertDefault());
    }
}
document.addEventListener("DOMContentLoaded",() => new Main());