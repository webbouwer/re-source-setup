<?php
/**
 * localize functions AJAX filter posts
 */
function data_filter_scripts() {
  // Enqueue script
  //wp_register_script('afp_script', 'get_template_directory_uri() . '/js-folder/'ajax-filter-posts.js', false, null, false);
  wp_register_script('df_script', get_template_directory_uri().'/js/posts.js', false, null, false);
  wp_enqueue_script('df_script');

  wp_localize_script( 'df_script', 'df_vars', array(
        'df_nonce' => wp_create_nonce( 'df_nonce' ), // Create nonce which we later will use to verify AJAX request
        'df_ajax_url' => admin_url( 'admin-ajax.php' ),
      )
  );
}
add_action('wp_enqueue_scripts', 'data_filter_scripts', 100);
?>
