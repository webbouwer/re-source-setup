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
<link rel="stylesheet" id="wp-startup-theme-style"  href="<?php echo get_template_directory_uri(); ?>/style.css" type="text/css" media="all" />
<!-- older IE versions: declare css3 queries and html5 tags through js -->
<!--[if lt IE 9]><script src="<?php echo get_template_directory_uri(); ?>/assets/html5.js"></script><script src="<?php echo get_template_directory_uri(); ?>/assets/cssmediaqueries.js"></script><![endif]-->
<script src="<?php echo get_template_directory_uri(); ?>/assets/isotope.js" type="text/javascript" language="javascript"></script>
<script src="<?php echo get_template_directory_uri(); ?>/assets/imagesloaded.js" type="text/javascript" language="javascript"></script>
<link rel="stylesheet" id="wp-startup-theme-style"  href="<?php echo get_template_directory_uri(); ?>/assets/isotope.css" type="text/css" media="all" />

<script src="<?php echo get_template_directory_uri(); ?>/js/view.js" type="text/javascript" language="javascript"></script>
</head>
<body <?php body_class(); ?>>


    <div id="pagecontainer" class="site">

        <div id="topframe">

                <div id="mainbuttonleft">
                    <div class="left-titlebar">
                        Artikelen
                    </div>
                </div>

                <div id="mainmenucontainer">
                    <div class="info-titlebar">
                        Resource | search (Artikelen / Labels) + info menu
                    </div>
                </div>

                <div id="mainbuttonright">
                    <div class="right-titlebar">
                        Labels
                    </div>
                </div>
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


                <div id="contentswitch">
                    <div class="switchbutton">Swap</div>
                </div>
            </div>


            <div id="rightcontainer">
                <div id="tagmenucontainer" class="right-contentbar">
                </div>
            </div>

            <div id="postcontainer">


                <div id="itemcontainer" class="info-contentbar">
                </div>

            </div>

        </div>

    </div>

	<?php wp_footer(); ?>

</body>
