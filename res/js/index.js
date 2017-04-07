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
            // TODO: for testing, will handle formatting of data here in the future
            console.log(data);
            $('#output').text('Complete, see log.');
        },
        error: function (xhr, status, errorMessage) {
            displayError(errorMessage);
        }
    });
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
 *
 * @param message
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