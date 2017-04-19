/**
 * Scripts for index.php
 */

/* Variables */

// State object representing which tab is selected on the form
var formState;

// Spinning loading icon
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';


/* Objects */

/**
 * Prototype for state objects
 * @param {function} formRequirementCheckFunction Function to call when determining if form
 * requirements are met.
 * @param {function} getFormDataFunction Function to retrieve the input value packaged as
 * part of a FormData object.
 * @param {function} disableInputFunction Function to disable/enable the form input.
 * @constructor
 */
function StateObjectPrototype(
    formRequirementCheckFunction, getFormDataFunction, disableInputFunction) {
    this.formRequirementCheck = formRequirementCheckFunction;
    this.getFormData = getFormDataFunction;
    this.disableInput = disableInputFunction;
}

/**
 * Object representing the state where the file upload tab is selected
 * @type {StateObjectPrototype}
 */
var fileSelectStateObject =
    new StateObjectPrototype(
        fileSelected,
        getFileSelectFormData,
        disableFileSelect);

/**
 * Object representing the state where the text input tab is selected
 * @type {StateObjectPrototype}
 */
var listTextStateObject =
    new StateObjectPrototype(
        textEntered,
        getTextInputFormData,
        disableTextInput);


/* Functions */

/**
 * Get the selected file and return a FormData object with the file appended to it
 * @returns {FormData|boolean} FormData if there is a file to select. If there isn't, return
 * null and display an error.
 */
function getFileSelectFormData() {
    var fileSelectInput = $('#file-select-input');
    // Submit button is disabled if no files are selected, but just in case
    if(fileSelectInput.prop('files').length === 0) {
        // TODO: throw error instead
        displayError('Please select a file.');
        return null;
    }
    // Retrieve file from the input and upload
    var file = fileSelectInput.prop('files')[0];
    var formData = new FormData();
    formData.append('oclc-list', file);
    // So handler knows which type of data is being uploaded
    formData.append('type', 'file');
    return formData;
}


/**
 * Get the entered text and return a FormData object with the data appended to it
 * @returns {FormData|boolean} FormData if textarea isn't empty. If there isn't, return
 * null and display an error.
 */
function getTextInputFormData() {
    var listTextString = $('#list-text-input').val();
    // Submit button is disabled if no text is entered, but just in case
    if(listTextString === '') {
        // TODO: throw error instead
        displayError('Please enter 1 or more OCLC numbers.');
        return null;
    }
    var listTextArray = listTextString.split('\n');
    var formData = new FormData();
    formData.append('oclc-list', listTextArray);
    // So handler knows which type of data is being uploaded
    formData.append('type', 'text');
    return formData;
}


/**
 * Uploads file to be handled by server
 * @param formData FormData object with the appended file
 */
// TODO: rename to uploadData
function uploadFile(formData) {
    // Disable form while uploading
    disableUploadForm(true);
    $.ajax({
        url: 'handlers/encodinglevel_handler.php',
        dataType: 'json',
        contentType: false,
        processData: false,
        data: formData,
        type: 'POST',
        success: function (data) {
            displayResults(data);
        },
        error: function (xhr, status, errorMessage) {
            // Get response text from server
            var data;
            try {
                data = JSON.parse(xhr.responseText);
            } catch (e) {
                data = false;
            }
            // If data['error'] doesn't exist or response text wasn't valid JSON, display the HTTP status response
            var messageString = (data && data.hasOwnProperty('error')) ? data['error'] : errorMessage;
            displayError(messageString);
        },
        complete: function () {
            disableUploadForm(false);
        }
    });
}


/**
 * Display the results of the encoding level check in #output
 * @param data Results of the encoding level check
 */
function displayResults(data) {
    // Higlighted results
    var highlightedTheadString = '<thead><tr><th>OCLC Number</th><th>Encoding Level</th></tr></thead>';
    var highlightedTableString = '<table class="table table-condensed table-striped">' + highlightedTheadString + '<tbody>';
    // All results
    var resultsTheadString = '<thead><tr><th>OCLC Number</th><th>Encoding Level</th></tr></thead>';
    var resultsTableString = '<table class="table table-condensed table-striped">' + resultsTheadString + '<tbody>';
    // TODO: add error table for OCLC numbers whose ELVL couldn't be determined
    // Check if either table is empty
    var highlightedTableIsEmpty = true;
    var resultsTableIsEmpty = true;
    // TODO: check if error table is empty and don't display it if so

    // Iterate through results and add them to the table
    $.each(data['results'], function (i, item) {
        // Function only gets executed if we have results to display
        resultsTableIsEmpty = false;

        var isTarget = item['elvl']['is-target-elvl'];
        var tdString = '<td>' + item['oclc'] + '</td><td>' + item['elvl']['elvl'] + '</td>';
        // Add to highlighted table if the record is at one of the target ELVLs
        if (isTarget) {
            highlightedTableIsEmpty = false;
            highlightedTableString += '<tr>' + tdString + '</tr>';
        }
        // Highlight row in all results table if target level is met
        var classString = isTarget ? ' class="info" ' : '';
        resultsTableString += '<tr' + classString + '>' + tdString + '</tr>';
    });
    // If no results are found and/or highlighted, display a message indicating such
    if (highlightedTableIsEmpty) {
        highlightedTableString += '<tr><td class="text-muted" colspan="2">No results found with the selected encoding level(s).</td></tr>';
    }
    if (resultsTableIsEmpty) {
        resultsTableString += '<tr><td class="text-muted" colspan="2">No results found.</td></tr>';
    }

    highlightedTableString += '</tbody></table>';
    resultsTableString += '</tbody></table>';

    var outputDiv = $('#output');
    // Assemble highlightedPanel and append to output
    var highlightedPanelHeadingString = '<div class="panel-heading"><h3 class="panel-title">Records with selected encoding level(s)</h3></div>';
    var highlightedPanelBodyString =
        '<div class="panel-body">' + highlightedTableString + '</div>';
    var highlightedPanel =
        '<div class="panel panel-primary">' + highlightedPanelHeadingString +
        highlightedPanelBodyString + '</div>';
    outputDiv.html(highlightedPanel);

    // Assemble resultsPanel and append to output
    var resultsPanelTitleString = '<h3 id="results-collapse-toggle" class="panel-title collapse-toggle" data-toggle="collapse" href="#results-collapse">Click to see all results</h3>';
    var resultsPanelHeadingString = '<div class="panel-heading">' + resultsPanelTitleString + '</div>';
    var resultsPanelBody = $('<div id="results-collapse" class="panel-collapse collapse"></div>');
    resultsPanelBody.html('<div class="panel-body">' + resultsTableString + '</div>');
    // Rotate collapse chevron in #results-collapse-toggle when div is collapsing/expanding
    resultsPanelBody.on('show.bs.collapse hide.bs.collapse', function () {
        $('#results-collapse-toggle').toggleClass('expanded');
    });
    var resultsPanel = $('<div class="panel panel-info"></div>');
    resultsPanel.append(resultsPanelHeadingString, resultsPanelBody);
    outputDiv.append('<hr>',resultsPanel);
}


/**
 * Display spinning loading icon in an element
 * @param targetId String identifer or jQuery object of the element to display the loader in
 */
function showLoader(targetId) {
    // Function accepts string representing id or jQuery object of element
    var targetElement = (targetId instanceof jQuery) ? targetId : $(targetId);
    // Clear contents of target and show loader
    targetElement.html(loader);
}


/**
 * Displays an error message in the output div
 * @param message Message to display
 */
function displayError(message) {
    var errorPanelString =
        [
            '<div class="panel panel-default">',
            '  <div class="panel-body text-danger">',
            '    <span class="glyphicon glyphicon-info-sign"></span> ' + message,
            '  </div>',
            '</div>'
        ].join('\n');
    $('#output').html(errorPanelString);
}


/**
 * Disables or enables the file select input
 * @param {boolean} setDisabled Disable input if true, enable it if false
 */
function disableFileSelect(setDisabled) {
    $('#file-select-input').prop('disabled', setDisabled);
    // Add/remove disabled class to file select button
    if (setDisabled) {
        $('#file-select-btn').addClass('disabled');
    } else {
        $('#file-select-btn').removeClass('disabled');
    }
}


/**
 * Disables or enables the list text input
 * @param {boolean} setDisabled Disable input if true, enable it if false
 */
function disableTextInput(setDisabled) {
    $('#list-text-input').prop('disabled', setDisabled);
}


/**
 * Disables or enables the form
 * @param {boolean} setDisabled Disable form if true, enable it if false
 */
function disableUploadForm(setDisabled) {
    // Disable/enable currently visible form input (prevents enabling inputs from the hidden tab)
    formState.disableInput(setDisabled);

    $('input[type="checkbox"]').prop('disabled', setDisabled);
    $('#file-select-submit').prop('disabled', setDisabled);
    $('ul.nav-tabs').find('a').prop('disabled', setDisabled);
    // TODO: collapse form?
}


/**
 * Event listener function for handling fileselect event
 * @param event The event object
 * @param numFiles Number of files selected
 * @param label Name of the file selected
 */
function onFileSelect(event, numFiles, label) {
    var input = $('#file-select-text'),
        log = numFiles > 1 ? numFiles + ' files selected' : label;
    if( input.length ) {
        input.val(log);
    }
    // refresh submit button state
    refreshSubmitButtonState();
}


/**
 * Event listener function for handling changes to the textarea
 * @param event The event object
 */
function onTextInput(event) {
    // Refresh submit button state
    refreshSubmitButtonState();
}


/**
 * Form requirement check function for #file-select-tab
 * @returns {boolean} True if a file is selected
 */
function fileSelected() {
    return $('#file-select-input').get(0).files.length > 0;
}


/**
 * Form requirement check function for #list-text-tab
 * @returns {boolean} True if textarea is not empty
 */
function textEntered() {
    return $('#list-text-input').val() !== '';
}


/**
 * Form requirement check function for encoding level checkboxes
 * @returns {boolean} True if at least one encoding level is checked
 */
function encodingLevelChecked() {
    return $('.encoding-level-checkbox:checked').length > 0;
}


/**
 * Enable/disable submit button based on form requirements.
 * Submit button will only be enabled if 1+ ELVLs are checked and if the currently selected
 * tab's input isn't empty (determined by the currently set formRequirementCheckFunction)
 */
function refreshSubmitButtonState() {
    // disabled = false if current form requirement function & encoding level check functions are true
    var setDisabled = !(formState.formRequirementCheck() && encodingLevelChecked());
    $('input[type=submit]').prop('disabled', setDisabled);
}


/* On page load */
$(function () {

    /* For file select styling (from https://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3) */
    // custom event for selecting file(s)
    $(document).on('change', ':file', function() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    // Add listeners to nav-tabs
    $('#list-text-tab').on('hidden.bs.tab shown.bs.tab', function (e) {
        // Set enabled state of #list-text-input based on which event is fired
        var hidden = e.type === 'hidden';
        var listTextInput = $('#list-text-input');
        listTextInput.prop('disabled', hidden);
        // Toggle listeners
        if (hidden) {
            listTextInput.off('change input paste', onTextInput);
        } else {
            listTextInput.on('change input paste', onTextInput);
            // Set state and refresh state of submit button
            formState = listTextStateObject;
            refreshSubmitButtonState();
        }
    });
    $('#file-select-tab').on('hidden.bs.tab shown.bs.tab', function (e) {
        // Set enabled state of #file-select-input based on which event is fired
        var hidden = e.type === 'hidden';
        var fileSeletInput = $('#file-select-input');
        fileSeletInput.prop('disabled',hidden);
        // Toggle listeners
        if (hidden) {
            fileSeletInput.off('fileselect', onFileSelect);
        } else {
            fileSeletInput.on('fileselect', onFileSelect);
            // Set state and refresh state of submit button
            formState = fileSelectStateObject;
            refreshSubmitButtonState();
        }
    });

    // Add listener to select all checkbox
    $('#encoding-levels-select-all').change(function () {
        $('.encoding-level-checkbox').prop('checked', $(this).prop('checked'));
        // Refresh submit button state
        refreshSubmitButtonState();
    });

    // Add listeners to all encoding level checkboxes
    $('.encoding-level-checkbox').change(function () {
        // uncheck select all if this gets unchecked
        if ($(this).prop('checked') === false) {
            $('#encoding-levels-select-all').prop('checked', false);
        }
        else {
            // if everything else is checked, then set select all to checked
            if ($('.encoding-level-checkbox:checked').length === $('.encoding-level-checkbox').length) {
                $('#encoding-levels-select-all').prop('checked', true);
            }
        }
        // Refresh submit button state
        refreshSubmitButtonState();
    });


    var fileSelectForm = $('#file-select-form');
    var outputDiv = $('#output');

    // Assign listener to file upload form
    fileSelectForm.submit(function (event) {
        event.preventDefault();

        var formData = formState.getFormData();
        // Don't continue data if formData is null
        if (formData === null) {
            // TODO: use try-catch instead
            return;
        }

        // Append encoding levels
        var encodingLevels = [];
        $('input[name="encoding-levels[]"]:checked').each(function () {
            encodingLevels.push($(this).val());
        });
        formData.append('encoding-levels', encodingLevels);
        // Show loader and send data to server
        showLoader(outputDiv);
        uploadFile(formData);

    });

    // #list-text-tab is selected by default, so add listener and set state on page load
    formState = listTextStateObject;
    $('#list-text-input').on('change input paste', onTextInput);
});