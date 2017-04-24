<?php
/**
 * Functions for checking encoding level
 */

include_once $_SERVER['DOCUMENT_ROOT'] . '/biblevel-checker/config/api_key.php';
// Throw an exception if $api_key hasn't been configured yet
if (!isset($api_key) || $api_key == '')
    throw new Exception('API key has not been configured. Please refer to README.md for setup instructions.');


/* Constants */

// Array mapping encoding level codes to their respective levels (see http://www.oclc.org/bibformats/en/fixedfield/elvl.html)
const ELVL = [
    // Code for full level according to https://www.loc.gov/marc/bibliographic/bdleader.html
    '#' => 'Full-level',
    // TODO: Verify that this character is intended to be Full-level like documentation states
    ' ' => 'Full-level',
    1 => 'Full-level, material not examined',
    2 => 'Less-than-full level, material not examined',
    3 => 'Abbreviated level',
    4 => 'Core-level',
    5 => 'Partial (preliminary) level',
    7 => 'Minimal-level',
    8 => 'Prepublication level',
    'I' => 'Full-level input by OCLC participants',
    'K' => 'Minimal-level input by OCLC participants',
    'L' => 'Full-level input added from a batch process',
    'M' => 'Less-than-full added from a batch process',
    'J' => 'Deleted record',
    // 'u' and 'z' aren't listed in the API but are listed in the Library of Congress MARC documentation
    // https://www.loc.gov/marc/bibliographic/bdleader.html
    'u' => 'Unknown',
    'z' => 'Not applicable'
];
// Maps non-numeric codes to their numeric equivalents. 0 = full-level, -1 = unknown/error
const ELVL_VAL = [
    ' ' => 0, '#' => 0, 'I' => 0, 'L' => 0,
    'M' => 2,
    'K' => 7,
    // Codes that don't map to a numeric equivalent (i.e. unknown/error)
    'J' => -1,
    'u' => -1,
    'z' => -1
];
// Position of the ELvl code in the MARCXML leader element (see https://www.loc.gov/marc/bibliographic/bdleader.html)
const ELVL_POS = 17;


/* Functions */


/**
 * Remove any non-numeric characters from the string to ensure the OCLC number format is valid
 * @param string $oclc The OCLC number to fix
 * @return string The fixed OCLC number
 */
function fix_oclc($oclc) {
    // Remove all non-numeric characters (e.g. whitespace, letters, punctuation, etc)
    return preg_replace("/[^0-9]/", "", $oclc);
}


/**
 * Formats the WorldCat Search API URL
 * @param string|int $oclc The OCLC number of the record
 * @return string Formatted WorldCat Search API URL (includes the API key)
 */
function format_api_url($oclc) {
    global $api_key;
    return "http://www.worldcat.org/webservices/catalog/content/$oclc?wskey=$api_key";
}


/**
 * Retrieves the MARCXML data for a bibliographic record using curl
 * @param string|int $oclc The OCLC number
 * @return mixed MARCXML string of the bibliographic record
 */
function get_bib_record($oclc) {
    $url = format_api_url($oclc);

    // Retrieve MARCXML data for the record
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30
    ]);
    $marcxml_string = curl_exec($ch);

    curl_close($ch);

    return $marcxml_string;
}


/**
 * Takes a MARCXML string for a bib record and returns the encoding level code
 * @param string $marcxml_string Results of get_bib_record()
 * @return string The encoding level code or '?' if no valid code could be found
 */
function get_elvl_code($marcxml_string) {
    // Return a question mark if the code can't be found
    $elvl_code = '?';

    // If $marcxml_string is false, then curl encountered an error
    if($marcxml_string !== false) {
        $marcxml = new SimpleXMLElement($marcxml_string);

        // If record was successfully retrieved, $marcxml->getName() should be 'record'
        if ($marcxml->getName() == 'record') {
            $leader = $marcxml->{'leader'};

            $elvl_code = substr($leader, ELVL_POS, 1);
            // If $elvl_code isn't in the array of known codes, return '?' instead
            if (!array_key_exists($elvl_code,ELVL))
                $elvl_code = '?';
        }

    }

    return $elvl_code;
}


/**
 * Determines the meaning of an ELVL code and checks if it is one of the the target levels
 * @param string $elvl_code The ELVL code
 * @param array $target_elvls An array of target ELVLs
 * @return array ['elvl'] = {string} Meaning of $elvl_code,
 *      ['is-target-elvl'] = {boolean} Whether or not $elvl_code is in target levels,
 *       ['is-valid-elvl'] = {boolean} Whether or not $elvl_code is valid
 */
function check_elvl_code($elvl_code, $target_elvls) {

    // Check if code is not numeric (http://stackoverflow.com/a/3377560)
    if ((string)(int) $elvl_code != $elvl_code) {
        // Get the equivalent numeric value (if there is one)
        $elvl_val = array_key_exists($elvl_code, ELVL_VAL) ?
            ELVL_VAL[$elvl_code] : -1;
    } else {
        $elvl_val = $elvl_code;
    }
    $is_target_elvl = in_array($elvl_val, $target_elvls);

    $is_valid_elvl = array_key_exists($elvl_code,ELVL);
    // If $elvl_code is a valid index, use the corresponding code interpretation. Otherwise, display an error
    $elvl = ($is_valid_elvl) ? ELVL[$elvl_code] : 'Encoding level could not be determined';

    // results can be indexed by 0, 1, 2 as well as 'elvl', 'is-target-elvl', 'is-valid-elvl'
    $elvl_array = array_fill_keys([0, 'elvl'], $elvl);
    $is_target_array = array_fill_keys([1, 'is-target-elvl'], $is_target_elvl);
    $is_valid_array = array_fill_keys([2, 'is-valid-elvl'], $is_valid_elvl);
    $results = $elvl_array + $is_target_array + $is_valid_array;
    return $results;
}