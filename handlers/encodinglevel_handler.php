<?php
/**
 * Handles Ajax file uploads for checking encoding level
 */

// Data to return
$data = [];

try {
    include_once 'functions/encodinglevel.php';

    // Get array of $oclc numbers
    $oclc_list = file($_FILES['oclc_list']['tmp_name']);
    // Array of levels to highlight
    $elvls = explode(',', $_POST['encoding-levels']);


    // $results[$i] = ['oclc' => OCLC number, 'elvl' => encoding level] where $i = corresponding index in $oclc_list
    $results = [];

    // Iterate through each number and check its encoding level
    foreach ($oclc_list as $index => $oclc) {
        // reset timeout
        set_time_limit(30);
        // Remove any whitespace or non-numeric characters from the string
        $oclc = fix_oclc($oclc);

        $marcxml_string = get_bib_record($oclc);
        $elvl_code = get_elvl_code($marcxml_string);
        $elvl_check_results = check_elvl_code($elvl_code, $elvls);
        $results[$index] = ['oclc' => $oclc, 'elvl' => $elvl_check_results];
    }

    $data['results'] = $results;
}


// Set $data['error'] if an exception was thrown
catch (Exception $e) {
    // TODO: set response header/exit code to reflect error
    $data['error'] =  $e->getMessage();
}

// Return JSON encoded data
echo json_encode($data);