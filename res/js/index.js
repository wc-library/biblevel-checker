/**
 * Scripts for index.php
 */

/* Variables */

// The function called when determining whether to disable/enable submit button
// Will be set according to what tab is selected
var formRequirementCheckFunction;
// Spinning loading icon
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';


/* Functions */

/**
 * Get the selected file and return a FormData object with the file appended to it
 * @returns {FormData|boolean} FormData if there is a file to select. If there isn't, return
 * false and display an error.
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
    formData.append('oclc_list', file);
    return formData;
}


/**
 * Uploads file to be handled by server
 * @param formData FormData object with the appended file
 */
// TODO: take callback functions for success and error as parameters?
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
            // TODO: check data['error']
            displayResults(data);
        },
        error: function (xhr, status, errorMessage) {
            displayError(errorMessage);
        },
        complete: function () {
            disableUploadForm(false);
        }
    });
}


// TODO: write uploadText() function for use w/ textarea


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

    // Iterate through results and add them to the table
    $.each(data['results'], function (i, item) {
        var isTarget = item['elvl']['is-target-elvl'];
        var tdString = '<td>' + item['oclc'] + '</td><td>' + item['elvl']['elvl'] + '</td>';
        // Add to highlighted table if the record is at one of the target ELVLs
        if (isTarget) {
            highlightedTableString += '<tr>' + tdString + '</tr>';
        }
        // Highlight row in all results table if target level is met
        var classString = isTarget ? ' class="info" ' : '';
        resultsTableString += '<tr' + classString + '>' + tdString + '</tr>';
    });
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

    // Assemble highlightedPanel and append to output
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
 * Disables or enables the file upload form
 * @param disable - disable file upload form if true, enable it if false
 */
function disableUploadForm(disable) {
    $('#file-select-form').find(':input').prop('disabled', disable);
    // Add/remove disabled class to file select button
    if (disable) {
        $('#file-select-btn').addClass('disabled');
    } else {
        $('#file-select-btn').removeClass('disabled');
    }
    // TODO: disable nav-tabs
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
    var setDisabled = !(formRequirementCheckFunction() && encodingLevelChecked());
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
            listTextInput.off('change input', onTextInput);
        } else {
            listTextInput.on('change input', onTextInput);
            // Set formRequirementCheckFunction and refresh state of submit button
            formRequirementCheckFunction = textEntered;
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
            // Set formRequirementCheckFunction and refresh state of submit button
            formRequirementCheckFunction = fileSelected;
            refreshSubmitButtonState();
        }
    });

    // #list-text-tab is selected by default, so add listener and set state on page load
    $('#list-text-input').on('change input', onTextInput);
    formRequirementCheckFunction = textEntered;

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
    // TODO: handle differently based on which tab is selected
    fileSelectForm.submit(function (event) {
        event.preventDefault();

        var formData = getFileSelectFormData();
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
});