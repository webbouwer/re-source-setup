<?php
require_once('functions.php');
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

	// default wp jquery
	wp_enqueue_script("jquery");

    // include wp head
    wp_head();

?>
<!-- older IE versions: declare css3 queries and html5 tags through js -->
<!--[if lt IE 9]><script src="<?php echo get_template_directory_uri(); ?>/assets/html5.js"></script><script src="<?php echo get_template_directory_uri(); ?>/assets/cssmediaqueries.js"></script><![endif]-->
<script src="<?php echo get_template_directory_uri(); ?>/assets/isotope.js" type="text/javascript" language="javascript"></script>
<script src="<?php echo get_template_directory_uri(); ?>/assets/imagesloaded.js" type="text/javascript" language="javascript"></script>
<link rel="stylesheet" id="wp-startup-theme-style"  href="<?php echo get_template_directory_uri(); ?>/assets/isotope.css" type="text/css" media="all" />
<link rel="stylesheet" id="wp-startup-theme-style"  href="<?php echo get_template_directory_uri(); ?>/style.css" type="text/css" media="all" />
<script src="<?php echo get_template_directory_uri(); ?>/js/view.js" type="text/javascript" language="javascript"></script>
</head>
<body <?php body_class(); ?>>

    <div id="pagecontainer" class="site">

    <?php if( is_front_page() ){ ?>

        <div id="topframe">

                <div id="mainbuttonleft">
                    <div class="left-titlebar">
                        <h4>Artikelen</h4>
                    </div>
                </div>

                <div id="mainmenucontainer">


                    <div id="mainmenucontent">
                        <div id="mainmenutitlebox" class="info-titlebar">
                            <div id="logobox">RE-source</div><div id="topbarsearch"><input id="searchbox" class="basic-search" placeholder="in development" size="24" /></div>
                        </div>
                        <div id="mainmenuinfobox" class="info-contentbar">
                            <div id="topmenu">
                            Team | Stromen | Info
                            </div>
                            <div id="topinfo">
                            Info container
                            </div>

                         </div>
                    </div>

                </div>

                <div id="mainbuttonright">
                    <div class="right-titlebar">
                        <h4>Labels</h4>
                    </div>
                </div>
        </div>
        <div id="topplaceholder">
        </div>
        <div id="mainframe">

            <div id="leftcontainer">
                <div id="contentbar" class="left-contentbar">
                     content titles
                </div>
            </div>

            <div id="infocontainer">

                <div id="contentcontainer">
                    <div id="pagecontent" class="page-contentbar">
                        Text example for pages etc.
                    </div>

                </div>

            </div>


            <div id="rightcontainer">
                <div id="tagmenucontainer" class="right-contentbar">
                </div>
            </div>

            <div id="postcontainer">

                <div id="contentswitch">
                    <div class="switchbutton"><span class="leftswapbutton">Theorie & Reflectie</span><span class="rightswapbutton">Praktijk en Design</span></div>
                </div>

                <div id="itemcontainer" class="info-contentbar">
                </div>

            </div>

        </div>
    <?php }else{ // end frontpage

        if ( have_posts() ) :
            while( have_posts() ) : the_post();

                $title_link = '<a href="'.get_the_permalink().'" target="_self" title="'.get_the_title().'">';
                $image_link = '<a class="coverimage" href="'.get_the_permalink().'" target="_self" title="'.get_the_title().'">';
                // begin html item
                echo '<div id="post-'.get_the_ID().'"';
                post_class();
                echo '>';

                // image
                $featuredImage = wp_get_attachment_image_src( get_post_thumbnail_id($post->ID), 'medium' );
                if($featuredImage){
                    echo $image_link;
                    echo '<img class="post-featured-image" src="'.$featuredImage[0].'" />';
                    echo '</a>';
                }
                // title
                echo '<div class="post-title">'. $title_link . get_the_title().'</a><div class="clr"></div></div>';
                // content
                echo '<div class="post-content">';
                if( is_single() || is_page() ){
                    echo apply_filters('the_content', get_the_content());
                }else{
                    echo the_excerpt_length( 12 );
                }
                echo '<div class="clr"></div></div>';

                echo '<div class="clr"></div></div>'; // end  html item

            endwhile;
        endif;
        ?>

    <? } // end page/post content ?>

    </div>

	<?php wp_footer(); ?>

</body>
