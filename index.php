<?php
require_once('functions.php');


/**
 * Theme functions
 * AJAX simple tag filter menu
 * action in index.php (html)
 */
function resource_tag_filter_menu() {
    $tax = 'post_tag';
    $terms = get_terms( $tax );
    $count = count( $terms );

    if ( $count > 0 ): ?>
        <div id="tagfilterbox">
        <?php
        foreach ( $terms as $term ) {
            $term_link = get_term_link( $term, $tax );
            echo '<a href="' . $term_link . '" class="tag-filter ' . $term->slug . '" title="' . $term->name . '" data-slug="' . $term->slug . '">' . $term->name . '</a> ';
        } ?>
        </div>
    <?php endif;
}


?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js no-svg">
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="profile" href="http://gmpg.org/xfn/11">
<?php

    if ( ! isset( $content_width ) ) $content_width = 360; // mobile first

    echo '<link rel="canonical" href="'.home_url(add_query_arg(array(),$wp->request)).'">'
	.'<link rel="pingback" href="'.get_bloginfo( 'pingback_url' ).'" />'
	.'<link rel="shortcut icon" href="images/favicon.ico" />'
	// tell devices wich screen size to use by default
	.'<meta name="viewport" content="initial-scale=1.0, width=device-width" />'
	.'<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">';
    // more info for og api's
    echo '<meta property="og:title" content="' . get_the_title() . '"/>'
        .'<meta property="og:type" content="website"/>'
		.'<meta property="og:url" content="' . get_permalink() . '"/>'
		.'<meta property="og:site_name" content="'.esc_attr( get_bloginfo( 'name', 'display' ) ).'"/>'
		.'<meta property="og:description" content="'.get_bloginfo( 'description' ).'"/>';

        if( !has_post_thumbnail( $post->ID )) { //the post does not have featured image, use a default image
            if( !empty($header_image) ){
                $default_image = get_header_image();
                echo '<meta property="og:image" content="' . $default_image . '"/>';
            }
		}else{
			$thumbnail_src = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'medium' );
			echo '<meta property="og:image" content="' . esc_attr( $thumbnail_src[0] ) . '"/>';
		}

	// default wp jquery
	wp_enqueue_script("jquery");

    // include wp head
    wp_head();

?>
<link rel="stylesheet" id="wp-startup-theme-style"  href="<?php echo get_template_directory_uri(); ?>/style.css" type="text/css" media="all" />
<!-- older IE versions: declare css3 queries and html5 tags through js -->
<!--[if lt IE 9]><script src="<?php echo get_template_directory_uri(); ?>/assets/html5.js"></script><script src="<?php echo get_template_directory_uri(); ?>/assets/cssmediaqueries.js"></script><![endif]-->
<script src="<?php echo get_template_directory_uri(); ?>/assets/isotope.js" type="text/javascript" language="javascript"></script>
<script src="<?php echo get_template_directory_uri(); ?>/assets/imagesloaded.js" type="text/javascript" language="javascript"></script>
<link rel="stylesheet" id="wp-startup-theme-style"  href="<?php echo get_template_directory_uri(); ?>/assets/isotope.css" type="text/css" media="all" />
</head>
<body <?php body_class(); ?>>

	<div id="pagecontainer" class="site">

        <div id="topcontentcontainer">

            <div id="headerbar">
            <?php
            /**
             * Widgets Header
             */
            if( function_exists('is_sidebar_active') && is_sidebar_active('widgets-header') ){
                echo '<div id="widgets-header">';
                dynamic_sidebar('widgets-header');
                echo '<div class="clr"></div></div>';
            }
            ?>
            </div>

        </div>

        <div id="maincontentcontainer">

            <div id="mainmenucontainer">
                <?php
                echo '<div id="site-navigation" class="main-navigation '.$mainbarclass.' '.$mainminisize.'" role="navigation"><nav>';
                if ( has_nav_menu( 'mainmenu' ) ) {
                    wp_nav_menu( array( 'theme_location' => 'mainmenu' ) );
                }else{
                    wp_nav_menu( array( 'theme_location' => 'primary', 'menu_class' => 'nav-menu' ) );
                }
                echo '<div class="clr"></div></nav></div>';
                ?>
            </div>

            <div id="pagecontainer">
            </div>

            <div id="mainlistcontainer">

                <div id="postlistbox">
                </div>

            </div>

            <div id="postcontainer">

                <div id="itemcontainer" class="isotope">
                </div>

            </div>

            <div id="mainfiltercontainer">
            <?php
            /**
             * Widgets Top Sidebar
             */
            if( function_exists('is_sidebar_active') && is_sidebar_active('widgets-top-sidebar') ){
                echo '<div id="widgets-top-sidebar">';
                dynamic_sidebar('widgets-top-sidebar');
                echo '<div class="clr"></div></div>';
            }
            ?>

            <?php resource_tag_filter_menu(); ?>

            <?php
            /**
             * Widgets Sidebar
             */
            if( function_exists('is_sidebar_active') && is_sidebar_active('sidebar') ){
                echo '<div id="sidebar">';
                dynamic_sidebar('sidebar');
                echo '<div class="clr"></div></div>';
            }
            ?>
            </div>

    </div>

    <div id="bottomcontentcontainer">
    </div>

	<?php wp_footer(); ?>

</body>
