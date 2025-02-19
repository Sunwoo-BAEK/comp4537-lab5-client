// create class for PatientTable for better display.
// double check validation method.
// improve query accepting so \n is erased from user's textarea.
// can select and insert only be valid when stated as first word?
// Try to simplify formatSELECTResponse logic. May need to relate to PatientTable class.
// Consider using a switch statement for the method in formatResponse.

class PatientBook {
    constructor(url) {
        this.queryInput = document.getElementById("sqlQuery");
        this.responseDiv = document.getElementById("response");
        this.serverUrl = url;
    }

    // Validate the query before sending it to the server
    /**
     * Consider strengthening this validation.
     * Maybe an If-Else statement to exclsively accept SELECT and INSERT only.
     * Else, return error message.
     * Double check with ChatGPT.
     * 
     * @param {*} query 
     * @returns 
     */
    validateQuery(query) {
        if (!query) return enter_query_string;
        if (/^\s*(DROP|UPDATE)\s+/i.test(query)) return only_select_insert_string; // Solidify this checking.
        return null; // No validation errors
    }

    // Determine HTTP method based on query type
    getRequestMethod(query) {
        return query.toLowerCase().startsWith("select") ? "GET" : "POST";
    }

    formatSELECTResponse(data) {
        if (Array.isArray(data)) {
            return data.map(patient => {
                // Format the patient name and date of birth
                return `${patient_string}${patient.name}, ${date_of_birth_string}${new Date(patient.dateOfBirth).toLocaleDateString()}`;
            }).join("\n");
        }
        return data;  // Return the raw data for non-SELECT responses
    }

    formatINSERTResponse(data) {
        // data = JSON.parse(data);
        if (data.affectedRows > 0) {
            return successful_insert_string + data.affectedRows;
        } else {
            return no_records_string;
        }
    }

    formatResponse(data, method) {
        if (method === "GET") {

            if (Array.isArray(data)) {
                return data.map(patient => {
                    // Format the patient name and date of birth
                    return `${patient_string}${patient.name}, ${date_of_birth_string}${new Date(patient.dateOfBirth).toLocaleDateString()}`;
                }).join("\n");
            }
            return data;  // Return the raw data for non-SELECT responses

        } else if (method === "POST") {
            if (data.affectedRows > 0) {
                return successful_insert_string + data.affectedRows;
            } else {
                return no_records_string;
            }
        }
    }

    // Send the query request
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
            if (method === "POST") {
                let message = this.formatINSERTResponse(data);
                return this.displayResponse(message);
            } else if (method === "GET") {
                let message = this.formatSELECTResponse(data);
                return this.displayResponse(message);
            }
        } catch (error) {
            this.displayResponse(error.message);
        }
    }

    // Display response in the UI
    displayResponse(message) {
        this.responseDiv.innerText = message;
    }

}

class Main {
    constructor() {
        // Populate strings from en.js
        document.getElementById('app-name').innerText = app_name_string;
        document.getElementById('sqlQuery').placeholder = text_area_placeholder_string;
        document.getElementById('button-string').innerText = button_string;
        document.title = title_string;

        // New instance of PatientBook
        this.patientBook = new PatientBook("https://lionfish-app-u8snj.ondigitalocean.app/sql/");
        document.querySelector("button").addEventListener("click", () => this.patientBook.sendQuery());
    }
}

new Main();