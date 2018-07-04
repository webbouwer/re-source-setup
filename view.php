<?php
/**
 * localize functions AJAX filter posts
 */
function data_view_scripts() {
  // Enqueue script
  wp_register_script('dv_script', get_template_directory_uri().'/js/view.js', false, null, false);
  wp_enqueue_script('dv_script');

  wp_localize_script( 'dv_script', 'dv_vars', array(
        'dv_nonce' => wp_create_nonce( 'dv_nonce' ), // Create nonce which we later will use to verify AJAX request
        'dv_ajax_url' => admin_url( 'admin-ajax.php' ),
      )
  );
}
add_action('wp_enqueue_scripts', 'data_view_scripts', 100);
?>
