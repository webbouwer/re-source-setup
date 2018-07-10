<?php

$WPData = new WPData;

class WPData{

    /** @obj WPstartupData */
    public $data = [];


    public function WPData() {

        // load settings

        // innitiate ajax scripts
        add_action('wp_enqueue_scripts', array( $this, 'wp_data_filter_scripts' ) , 100);
        add_action('wp_ajax_multi_filter', array( $this,'wp_data_multi_filter' ) );
        add_action('wp_ajax_nopriv_multi_filter', array( $this,'wp_data_multi_filter' ) );
    }

    public function wp_data_filter_scripts() {

        //$ajaxurl .= admin_url( 'admin-ajax.php?lang=' . ICL_LANGUAGE_CODE );
        // Enqueue script
        wp_register_script('filter_script', get_template_directory_uri().'/js/data.js', false, null, false);
        wp_enqueue_script('filter_script');
        wp_localize_script( 'filter_script', 'filter_vars', array(
            'filter_nonce' => wp_create_nonce( 'filter_nonce' ), // Create nonce
            'filter_ajax_url' => admin_url( 'admin-ajax.php' ),
            'filter_noposts'  => esc_html__('No older posts found', 're_source')
            )
        );
    }

    function wp_data_multi_filter(){

        // Verify nonce
        if( !isset( $_POST['filter_nonce'] ) || !wp_verify_nonce( $_POST['filter_nonce'], 'filter_nonce' ) || !isset($_REQUEST))
        die('Permission denied');

        // verify request data
        $wpdata = $_REQUEST;

        // id? -> get single post

        // cats? -> if array -> cats to cvs

        // tags? -> if array -> tags to cvs
        $args = array(
            'tag' => $wpdata['filter_data']['tags'],
            'post_type' => 'post',
            'posts_per_page' => 10,
        );
        if( !$wpdata['filter_data']['tags'] ) {
            unset( $args['tag'] );
        }


        // prepare response $response = $wpdata['filter_data']['tags'];
        $query = new WP_Query( $args );
        $response = array();
        if ( $query->have_posts() ) : while ( $query->have_posts() ) : $query->the_post();
            $response[get_the_ID()] = array(
                'link' => get_the_permalink(),
                'title' => get_the_title(),
                'excerpt' => get_the_excerpt() ,
                'content' => apply_filters('the_content', get_the_content() ),
                'tags' => get_the_tags(),
                'date' => get_the_date(),
                'author' => get_the_author()

            );
        endwhile;
        else:
           $response[0] = 'No posts found';
        endif;


        wp_reset_query();
        ob_clean();
        echo json_encode($response);
        wp_die();

    }
}






 /* ORIGINAL WPCODE
        $taxonomy = $_POST['taxonomy'];

        // WP Query
        $args = array(
            //'tag' => $taxonomy,
            'post_type' => 'post',
            'posts_per_page' => 10,
        );
        // If taxonomy is not set, remove key from array and get all posts
        if( !$taxonomy ) {
            unset( $args['tag'] );
        }
        $query = new WP_Query( $args );
        $resp = array();
        if ( $query->have_posts() ) : while ( $query->have_posts() ) : $query->the_post();
            $resp[get_the_ID()] = array( 'link' => get_the_permalink(), 'title' => get_the_title(), 'excerpt' => get_the_excerpt() , 'content' => get_the_content() ) ;
        endwhile;
        else:
           $resp[0] = 'No posts found';
        endif;
        */

/** SETUP TEST CODE 1
 * localize functions AJAX filter posts

function data_view_filter_scripts() {
  // Enqueue script
  wp_register_script('filter_script', get_template_directory_uri().'/js/view.js', false, null, false);
  wp_enqueue_script('filter_script');

  wp_localize_script( 'filter_script', 'filter_vars', array(
        'filter_nonce' => wp_create_nonce( 'filter_nonce' ), // Create nonce which we later will use to verify AJAX request
        'filter_ajax_url' => admin_url( 'admin-ajax.php' ),
      )
  );
}
add_action('wp_enqueue_scripts', 'data_view_filter_scripts', 100);
 */

/*
function wp_data_multi_filter(){

    // Verify nonce
    if( !isset( $_POST['filter_nonce'] ) || !wp_verify_nonce( $_POST['filter_nonce'], 'filter_nonce' ) || !isset( $_REQUEST['filter_data'] ) )
    die('Permission denied');

    // verify request data
    $filter_data = $_REQUEST['filter_data'];

    // by ID
    if( isset( $filter_data['id'] ) && $filter_data['id'] != '' ){

        $response = get_post( $filter_data['id'] ); // $response->post_title;
        // post data translation
        $response->post_content = apply_filters('the_content', $response->post_content );

    }

    wp_reset_query();
    ob_clean();
    echo json_encode($response);
    wp_die();

}
*/
?>
