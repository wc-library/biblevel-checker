<?php
/**
 * Handles Ajax request for minimum encoding level checking.
 */

include_once '../config/api_key.php';
// TODO: Throw exception if $api_key isn't set or is blank

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
// Position of the ELvl code in the MARCXML leader element (see https://www.loc.gov/marc/bibliographic/bdleader.html)
const ELVL_POS = 17;


/* Functions */


/**
 * Formats the WorldCat Search API URL
 * @param string|int $oclc The OCLC number
 * @return string Formatted WorldCat Search API URL (includes the API key)
 */
function format_api_url($oclc) {
    global $api_key;
    // Remove any whitespace/new line characters
    $oclc = trim($oclc);
    return "http://www.worldcat.org/webservices/catalog/content/$oclc?wskey=$api_key";
}


/**
 * Retrieves the MARCXML data for a bibliographic resource using curl
 * @param string|int $oclc The OCLC number
 * @return mixed MARCXML string of the bibliographic resource
 */
function get_bib_resource($oclc) {
    $url = format_api_url($oclc);

    // Retrieve MARCXML data for the resource
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
 * TODO: documentation
 * @param string $marcxml_string Results of get_bib_resource()
 * @return mixed|string
 */
function check_encoding_level($marcxml_string) {
    // Return an empty string in the event of an error
    $elvl = '';

    // If $marcxml_string is false, then curl encountered an error
    if($marcxml_string !== false) {
        $marcxml = new SimpleXMLElement($marcxml_string);

        // TODO: verify the following claim
        // If resource was successfully retrieved, $marcxml->getName() should be 'record'
        if ($marcxml->getName() == 'record') {
            $leader = $marcxml->{'leader'};

            $elvl_code = substr($leader, ELVL_POS, 1);
            // TODO: handle undefined indexes more elegantly
            $elvl = (array_key_exists($elvl_code,ELVL)) ?
                ELVL[$elvl_code] : "ERROR: Unidentified level code '$elvl_code'";

            // TODO: indcate whether or not this meets minimum requirements
        }

    }

    return $elvl;
}


/* Main script */

// TODO: handle file uploads and return encoded data