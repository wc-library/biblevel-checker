/**
 * Scripts for index.php
 */

/* Variables */

// Spinning loading icon
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';


/* Functions */

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
        }
    });
});