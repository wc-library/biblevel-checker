/**
 * Scripts for index.php
 */

/* Variables */

// Spinning loading icon
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';


/* Functions */

/**
 * Uploads file to be handled by server
 * @param formData FormData object with the appended file
 */
// TODO: take callback functions for success and error as parameters?
function uploadFile(formData) {
    $.ajax({
        url: 'handlers/encodinglevel_handler.php',
        dataType: 'json',
        contentType: false,
        processData: false,
        data: formData,
        type: 'POST',
        success: function (data) {
            // TODO: check data['error']
            // TODO: for testing, will handle formatting of data here in the future
            //console.log(data);
            displayResults(data);
        },
        error: function (xhr, status, errorMessage) {
            displayError(errorMessage);
        }
    });
}


function displayResults(data) {
    // Results panel components
    var resultsPanel = $('<div class="panel panel-primary"></div>');
    var resultsPanelHeading = $('<div class="panel-heading"></div>');
    var resultsPanelHeadingContent = $('<h3 class="panel-title collapse-toggle" data-toggle="collapse" href="#results-collapse">Click here to see all encoding levels <span class="glyphicon collapse-chevron"></span></h3>');
    var resultsPanelCollapse = $('<div id="results-collapse" class="panel-collapse collapse"></div>');
    // Rotate chevron when div is collapsing/expanding
    var resultsPanelChevron = resultsPanelHeadingContent.find('.collapse-chevron');
    resultsPanelCollapse.on('show.bs.collapse hide.bs.collapse', function () {
        resultsPanelChevron.toggleClass('expanded');
    });
    var resultsPanelBody = $('<div class="panel-body"></div>');
    // Table containing the results of the encoding level check
    var resultsTable = $('<table class="table table-condensed table-striped"></table>');
    var resultsTableBody = $('<tbody></tbody>');
    // TODO: add table heading

    // Iterate through results and add them to the table
    // TODO: handle check for below minimum encoding level here, too?
    // TODO: highlight record rows below min encoding level as .danger
    for (var i = 0; i < data['results'].length; i++) {
        var result = data['results'][i];
        var row = $('<tr></tr>');
        var td0 = $('<td></td>');
        td0.text(result['oclc']);
        var td1 = $('<td></td>');
        td1.text(result['elvl']);
        row.append(td0, td1);
        resultsTableBody.append(row);
    }

    // Assemble the results panel and display it in the output div
    resultsPanelHeading.html(resultsPanelHeadingContent);
    resultsTable.html(resultsTableBody);
    resultsPanelBody.html(resultsTable);
    resultsPanelCollapse.html(resultsPanelBody);
    resultsPanel.append(resultsPanelHeading, resultsPanelCollapse);
    $('#output').html(resultsPanel);
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
    var errorPanel = $('<div class="panel panel-default"></div>');
    var errorPanelBody = $('<div class="panel-body text-danger"></div>');
    errorPanelBody.html('<span class="glyphicon glyphicon-info-sign"></span> ' + message);
    errorPanel.html(errorPanelBody);
    $('#output').html(errorPanel);
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
    // Listener for fileselect event
    $(':file').on('fileselect', function(event, numFiles, label) {
        var input = $('#file-select-text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        if( input.length ) {
            input.val(log);
            $('#file-select-submit').prop('disabled', false);
        }
        // enable/disable submit button
        if (numFiles > 0) {
            $('#file-select-submit').prop('disabled', false);
        } else {
            $('#file-select-submit').prop('disabled', true);
        }
    });


    var fileSelectForm = $('#file-select-form');
    var fileSelectInput = $('#file-select-input');
    var outputDiv = $('#output');

    // Assign listener to file upload form
    fileSelectForm.submit(function (event) {
        event.preventDefault();

        // Submit button is disabled if no files are selected, but just in case
        if(fileSelectInput.prop('files').length === 0) {
            displayError('Please select a file.');
            return;
        }

        // TODO: disable form while file is being uploaded
        var file = fileSelectInput.prop('files')[0];
        var formData = new FormData();
        formData.append('oclc_list', file);
        showLoader(outputDiv);
        uploadFile(formData);

    });
});