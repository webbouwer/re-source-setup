<?php
function resource_register_theme_customizer( $wp_customize ) {

	$wp_customize->remove_control('display_header_text');
	// remove default title / site-identity
	//$wp_customize->remove_section('title_tagline');
	// remove default colors
	$wp_customize->remove_control('header_textcolor');
	$wp_customize->remove_control('background_color');
	$wp_customize->remove_panel('colors');

}
add_action( 'customize_register', 'resource_register_theme_customizer' );

// default sanitize function
function resource_sanitize_default($obj){
    	return $obj;
}
function resource_sanitize_array( $values ) {
    $multi_values = !is_array( $values ) ? explode( ',', $values ) : $values;
    return !empty( $multi_values ) ? array_map( 'sanitize_text_field', $multi_values ) : array();
}
?>
