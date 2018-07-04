<?php
/**
 * localize functions AJAX filter posts
 */
function data_control_scripts() {
  // Enqueue script
  wp_register_script('dc_script', get_template_directory_uri().'/js/control.js', false, null, false);
  wp_enqueue_script('dc_script');

  wp_localize_script( 'dc_script', 'dc_vars', array(
        'dc_nonce' => wp_create_nonce( 'dc_nonce' ), // Create nonce which we later will use to verify AJAX request
        'dc_ajax_url' => admin_url( 'admin-ajax.php' ),
      )
  );
}
add_action('wp_enqueue_scripts', 'data_control_scripts', 100);
?>
