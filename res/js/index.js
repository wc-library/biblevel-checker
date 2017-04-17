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
        // Don't enable submit button unless 1 or more encoding levels are selected
        var nothingChecked = $('input[name="encoding-levels[]"]:checked').length === 0;
        if( input.length ) {
            input.val(log);
            $('#file-select-submit').prop('disabled', nothingChecked);
        }
        // enable/disable submit button
        if (numFiles > 0) {
            $('#file-select-submit').prop('disabled', nothingChecked);
        } else {
            $('#file-select-submit').prop('disabled', true);
        }
    });

    // Add listener to select all checkbox
    $('#encoding-levels-select-all').change(function () {
        $('.encoding-level-checkbox').prop('checked', $(this).prop('checked'));
        // Submit button won't be enabled if there aren't any files selected
        if ($('#file-select-input').get(0).files.length > 0) {
            // if nothing is checked, submit buttons should be disabled
            $('input[type=submit]').prop('disabled', !$(this).prop('checked'));
        }

    });
    // Add listeners to all encoding level checkboxes
    $('.encoding-level-checkbox').change(function () {
        // uncheck select all if this gets unchecked
        if ($(this).prop('checked') === false) {
            $('#encoding-levels-select-all').prop('checked', false);
            // Disable submit buttons if nothing is checked
            if ($('.encoding-level-checkbox:checked').length === 0) {
                $('input[type=submit]').prop('disabled', true);
            }
        }
        // if this was checked, re-enable submit buttons
        else {
            // Don't enable submit if there aren't any files selected
            if ($('#file-select-input').get(0).files.length > 0)
                $('input[type=submit]').prop('disabled', false);

            // if everything else is checked, then set select all to checked
            if ($('.encoding-level-checkbox:checked').length === $('.encoding-level-checkbox').length) {
                $('#encoding-levels-select-all').prop('checked', true);
            }
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

        // Retrieve file from the input and upload
        var file = fileSelectInput.prop('files')[0];
        var encodingLevels = [];
        $('input[name="encoding-levels[]"]:checked').each(function () {
            encodingLevels.push($(this).val());
        });
        var formData = new FormData();
        formData.append('oclc_list', file);
        formData.append('encoding-levels', encodingLevels);
        showLoader(outputDiv);
        uploadFile(formData);

    });
});