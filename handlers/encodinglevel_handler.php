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
    // $results[$i] = ['oclc' => OCLC number, 'elvl' => encoding level] where $i = corresponding index in $oclc_list
    $results = [];
    // TODO: return list of results that don't meet the minimum encoding level

    // Iterate through each number and check its encoding level
    foreach ($oclc_list as $index => $oclc) {
        $marcxml_string = get_bib_record($oclc);
        $elvl = check_encoding_level($marcxml_string);
        $results[$index] = ['oclc' => trim($oclc), 'elvl' => $elvl];
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