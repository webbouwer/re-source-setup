<?php



/**
 * Category Menu
 */
function resource_category_menu() {

$args = array(
    'orderby'                  => 'name',
    'order'                    => 'ASC',
    'public'                   => true,
);
$categories = get_categories( $args );
    $count = count( $categories );

    if ( $count > 0 ): ?>
        <div class="post-cats">
        <?php
        foreach ( $categories as $term ) {
            $term_link = get_term_link( $term, $tax );
            echo '<a href="' . $term_link . '" class="cat-filter" title="' . $term->slug . '">' . $term->name . '</a> ';
        } ?>
        </div>
    <?php endif;
 }


/**
 * Tag Menu
 */
 function resource_tag_menu() {
    $tax = 'post_tag';
    $terms = get_terms( $tax );
    $count = count( $terms );

    if ( $count > 0 ): ?>
        <div class="post-tags">
        <?php
        foreach ( $terms as $term ) {
            $term_link = get_term_link( $term, $tax );
            echo '<a href="' . $term_link . '" class="tag-filter" title="' . $term->slug . '">' . $term->name . '</a> ';
        } ?>
        </div>
    <?php endif;
}




/**
 * localize functions AJAX filter posts
 */
function ajax_filter_posts_scripts() {
  // Enqueue script
  //wp_register_script('afp_script', 'get_template_directory_uri() . '/js-folder/'ajax-filter-posts.js', false, null, false);
  wp_register_script('afp_script', get_template_directory_uri().'/assets/ajax-filter-posts.js', false, null, false);
  wp_enqueue_script('afp_script');

  wp_localize_script( 'afp_script', 'afp_vars', array(
        'afp_nonce' => wp_create_nonce( 'afp_nonce' ), // Create nonce which we later will use to verify AJAX request
        'afp_ajax_url' => admin_url( 'admin-ajax.php' ),
      )
  );
}
add_action('wp_enqueue_scripts', 'ajax_filter_posts_scripts', 100);





/**
 *
 */
function wp_startup_ajax_filter_get_posts(){

    // Verify nonce
    if( !isset( $_POST['afp_nonce'] ) || !wp_verify_nonce( $_POST['afp_nonce'], 'afp_nonce' ) )
    die('Permission denied');

    // verify request data

    // id? -> get single post
    // cats? -> if array -> cats to cvs
    // tags? -> if array -> tags to cvs

    // prepare response
    //$response = $_REQUEST;

    $tagfilter = $_REQUEST['tagfilter'];
    $catfilter = $_REQUEST['catfilter'];

    // WP Query
    $args = array(
        'tag' => $tagfilter,
        'post_type' => 'post',
      	'category_name' => $catfilter,
        'posts_per_page' => 10,
    );
    // If taxonomy is not set, remove key from array and get all posts
    if( !$tagfilter ) {
        unset( $args['tag'] );
    }
	if( !$catfilter ) {
        unset( $args['category_name'] );
    }
    $query = new WP_Query( $args );
    $response = array();
    if ( $query->have_posts() ) : while ( $query->have_posts() ) : $query->the_post();
        $response[get_the_ID()] = array( 'link' => get_the_permalink(), 'title' => get_the_title(), 'excerpt' => get_the_excerpt() , 'content' => get_the_content() ) ;
    endwhile;
    else:
       $response[0] = 'No posts found';
    endif;


    wp_reset_query();
    ob_clean();
    echo json_encode($response);
    wp_die();
}
// theme functions.php
add_action('wp_ajax_filter_posts', 'wp_startup_ajax_filter_get_posts');
// theme functions.php
add_action('wp_ajax_nopriv_filter_posts', 'wp_startup_ajax_filter_get_posts');


?>
