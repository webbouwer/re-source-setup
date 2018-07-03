<?php
/**
 * Include more functions
 */
require get_template_directory() . '/customizer.php'; // customizer functions
require get_template_directory() . '/ajax.php'; // ajax functions


/* unregister widgets (if really not needed)"*/
 function remove_default_widgets() {
     unregister_widget('WP_Widget_Pages');
     unregister_widget('WP_Widget_Calendar');
     unregister_widget('WP_Widget_Archives');
     unregister_widget('WP_Widget_Links');
     unregister_widget('WP_Widget_Meta');
     unregister_widget('WP_Widget_Search');
     unregister_widget('WP_Widget_Text');
     unregister_widget('WP_Widget_Categories');
     unregister_widget('WP_Widget_Recent_Posts');
     unregister_widget('WP_Widget_Recent_Comments');
     unregister_widget('WP_Widget_RSS');
     unregister_widget('WP_Widget_Tag_Cloud');
     unregister_widget('WP_Nav_Menu_Widget');
 }
 add_action('widgets_init', 'remove_default_widgets', 11);




/*
 * Register widgets
 */
function basic_setup_widgets_init() {

	if (function_exists('register_sidebar')) {

   /* Not using the the default wordpress widget,
        keep the widget slot for management (repositioning options) */

		register_sidebar(array(
			'name' => 'Widgets Header',
			'id'   => 'widgets-header',
			'description'   => 'This is a standard wordpress widgetized area.',
			'before_widget' => '<div id="%1$s" class="widget %2$s"><div class="widgetpadding">',
			'after_widget'  => '<div class="clr"></div></div></div>',
			'before_title'  => '<h3>',
			'after_title'   => '</h3>'
		));

		// the top sidebar widgets
		register_sidebar(array(
			'name' => 'Widgets Top Sidebar',
			'id'   => 'widgets-top-sidebar',
			'description'   => 'This the widgetized area in the top sidebar.',
			'before_widget' => '<div id="%1$s" class="widget %2$s"><div class="widgetpadding">',
			'after_widget'  => '<div class="clr"></div></div></div>',
			'before_title'  => '<h3>',
			'after_title'   => '</h3>'
		));

		// the default wordpress sidebar
		register_sidebar(array(
			'name' => 'Widgets Sidebar',
			'id'   => 'sidebar',
			'description'   => 'This is the standard wordpress widgetized sidebar area.',
			'before_widget' => '<div id="%1$s" class="widget %2$s"><div class="widgetpadding">',
			'after_widget'  => '<div class="clr"></div></div></div>',
			'before_title'  => '<h3>',
			'after_title'   => '</h3>'
		));
	}
}
add_action( 'widgets_init', 'basic_setup_widgets_init' );


/**
 * customizer variables
 */
$wp_theme_options = json_encode( get_theme_mods() );

/*
 * Javascript with customizer variables
 */
// http://wordpress.stackexchange.com/questions/57386/how-do-i-force-wp-enqueue-scripts-to-load-at-the-end-of-head
function resource_global_js() {
    // Register the script first.
    wp_register_script( 'custom_global_js', get_template_directory_uri().'/assets/global.js', 99, '1.0', false);
    // Get the global data list.
    global $wp_theme_options;
	// Localize the global data list for the script
	wp_localize_script( 'custom_global_js', 'theme_options', $wp_theme_options );
    // The script can be enqueued now or later.
    wp_enqueue_script( 'custom_global_js');
}
add_action('wp_enqueue_scripts', 'resource_global_js');




/**
 * Global most used functions
 */


// time ago
function wp_time_ago( $t ) {
    // https://codex.wordpress.org/Function_Reference/human_time_diff
    //get_the_time( 'U' )
    printf( _x( '%s '.__('geleden','wp-startup'), '%s = human-readable time difference', 'imagazine' ), human_time_diff( $t, current_time( 'timestamp' ) ) );
}

// words in excerpts
function the_excerpt_length( $words = null, $links = true ) {
		global $_the_excerpt_length_filter;
		if( isset($words) ) {
			$_the_excerpt_length_filter = $words;
		}
		add_filter( 'excerpt_length', '_the_excerpt_length_filter' );
		if( $links == false){
			echo preg_replace('/(?i)<a([^>]+)>(.+?)<\/a>/','', get_the_excerpt() );
		}else{
			the_excerpt();
		}
		remove_filter( 'excerpt_length', '_the_excerpt_length_filter' );
		// reset the global
		$_the_excerpt_length_filter = null;
	}

function _the_excerpt_length_filter( $default ) {
    global $_the_excerpt_length_filter;
    if( isset($_the_excerpt_length_filter) ) {
        return $_the_excerpt_length_filter;
    }
    return $default;
}


// image orient
function check_image_orientation($pid){
	$orient = 'square';
    $image = wp_get_attachment_image_src( get_post_thumbnail_id($pid), '');
    $image_w = $image[1];
    $image_h = $image[2];
			if ($image_w > $image_h) {
				$orient = 'landscape';
			}elseif ($image_w == $image_h) {
				$orient = 'square';
			}else {
				$orient = 'portrait';
			}
			return $orient;
}

// get categories
function get_categories_select(){
    $get_cats = get_categories();
    $results;
    $count = count($get_cats);
			for ($i=0; $i < $count; $i++) {
				if (isset($get_cats[$i]))
					$results[$get_cats[$i]->slug] = $get_cats[$i]->name;
				else
					$count++;
			}
    return $results;
}
// Category metabox Hierarchy
function onepiece_wp_terms_checklist_args( $args, $post_id ) {

   $args[ 'checked_ontop' ] = false;

   return $args;

}
add_filter( 'wp_terms_checklist_args', 'onepiece_wp_terms_checklist_args', 1, 2 );



// check active widgets
function is_sidebar_active( $sidebar_id ){
    $the_sidebars = wp_get_sidebars_widgets();
    if( !isset( $the_sidebars[$sidebar_id] ) )
        return false;
    else
        return count( $the_sidebars[$sidebar_id] );
}

// widget empty title content wrapper fix
function check_sidebar_params( $params ) {
    global $wp_registered_widgets;
    $settings_getter = $wp_registered_widgets[ $params[0]['widget_id'] ]['callback'][0];
    $settings = $settings_getter->get_settings();
    $settings = $settings[ $params[1]['number'] ];
    if ( $params[0][ 'after_widget' ] == '<div class="clr"></div></div></div>' && isset( $settings[ 'title' ] ) &&  empty( $settings[ 'title' ] ) ){
        $params[0][ 'before_widget' ] .= '<div class="widget-contentbox">';
    }
    return $params;
}
// Add widget param check for empty html correction
add_filter( 'dynamic_sidebar_params', 'check_sidebar_params' );


/* Remove Emoji junk by Christine Cooper
 * Found on http://wordpress.stackexchange.com/questions/185577/disable-emojicons-introduced-with-wp-4-2
 */
function disable_wp_emojicons() {
  // all actions related to emojis
  remove_action( 'admin_print_styles', 'print_emoji_styles' );
  remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
  remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
  remove_action( 'wp_print_styles', 'print_emoji_styles' );
  remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
  remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
  remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );

  add_filter( 'tiny_mce_plugins', 'disable_emojicons_tinymce' ); // filter to remove TinyMCE emojis
}
add_action( 'init', 'disable_wp_emojicons' );

function disable_emojicons_tinymce( $plugins ) {
  if ( is_array( $plugins ) ) {
    return array_diff( $plugins, array( 'wpemoji' ) );
  } else {
    return array();
  }
}

// control (remove) gravatar

function bp_remove_gravatar ($image, $params, $item_id, $avatar_dir, $css_id, $html_width, $html_height, $avatar_folder_url, $avatar_folder_dir) {
	$default = get_stylesheet_directory_uri() .'/images/avatar.png';
	if( $image && strpos( $image, "gravatar.com" ) ){
		return '<img src="' . $default . '" alt="avatar" class="avatar" ' . $html_width . $html_height . ' />';
	} else {
		return $image;
	}
}
add_filter('bp_core_fetch_avatar', 'bp_remove_gravatar', 1, 9 );
function remove_gravatar ($avatar, $id_or_email, $size, $default, $alt) {
	$default = get_stylesheet_directory_uri() .'/images/avatar.png';
	return "<img alt='{$alt}' src='{$default}' class='avatar avatar-{$size} photo avatar-default' height='{$size}' width='{$size}' />";
}
add_filter('get_avatar', 'remove_gravatar', 1, 5);

function bp_remove_signup_gravatar ($image) {
	$default = get_stylesheet_directory_uri() .'/images/avatar.png';
	if( $image && strpos( $image, "gravatar.com" ) ){
		return '<img src="' . $default . '" alt="avatar" class="avatar" width="60" height="60" />';
	} else {
		return $image;
	}
}
add_filter('bp_get_signup_avatar', 'bp_remove_signup_gravatar', 1, 1 );

?>
