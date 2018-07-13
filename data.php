<?php

$WPData = new WPData;

class WPData{

    /** @obj WPstartupData */
    public $data = [],
    $tagfilter = [],
    $catfilter =[],
    $loadedID = [],
    $ppload = '';

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
        global $wp_query;
        wp_register_script('filter_script', get_template_directory_uri().'/js/data.js', false, null, false);
        wp_enqueue_script('filter_script');
        wp_localize_script( 'filter_script', 'filter_vars', array(
            'filter_nonce' => wp_create_nonce( 'filter_nonce' ), // Create nonce
            'filter_ajax_url' => admin_url( 'admin-ajax.php' ),
            'filter_alltags'  => get_terms( 'post_tag' ),
            'filter_allcats'  => get_terms( 'post_category' ),
            )
        );

    }

    public function wp_data_multi_filter(){

        // Verify nonce
        if( !isset( $_POST['filter_nonce'] ) || !wp_verify_nonce( $_POST['filter_nonce'], 'filter_nonce' ) || !isset($_REQUEST))
        die('Permission denied');

        // verify request data
        $this->tagfilter = $_REQUEST['filter_data']['tagfilter'];
        $this->catfilter = $_REQUEST['filter_data']['catfilter'];
        $this->loadedID = $_REQUEST['filter_data']['loadedID'];
        $this->ppload = $_REQUEST['filter_data']['ppload'];

        $args = array(
            'tag'               => json_encode($this->tagfilter),
            'category_name'     => json_encode($this->catfilter),
            'post_type'         => 'post', // 'any',  = incl pages
            'post_status'       => 'publish',
            'post__not_in'      => $this->loadedID,
            'orderby'           => 'date',
            'order'             => 'DESC',      // 'DESC', 'ASC' or 'RAND'
            'posts_per_page'    => $this->ppload,
            //'posts_offset'      => $ppload,
            //'suppress_filters'  => false,
        );

        if( !$this->tagfilter || $this->tagfilter == '') {
            unset( $args['tag'] );
        }
        if( !$this->catfilter || $this->catfilter == '') {
            unset( $args['category_name'] );
        }
        if( !$this->loadedID || $this->loadedID == '') {
            unset( $args['post__not_in'] );
        }
        if( !$this->ppload || $this->ppload < 1 ) {
            $args['posts_per_page'] = 999;
        }

        // prepare response $response = $wpdata['filter_data']['tags'];
        $query = new WP_Query( $args );
        $response = array();
        $count = array();
        if ( $query->have_posts() ) :

        while ( $query->have_posts() ) : $query->the_post();

            // post text
            $excerpt_length = 120; // words
            $content = apply_filters('the_content', get_the_content());
            $excerpt = truncate( get_the_excerpt(), $excerpt_length, '', false, true );

            $response[] = array(
                'id' => get_the_ID(),
                'link' => get_the_permalink(),
                'title' => get_the_title(),
                'image' => get_the_post_thumbnail(),
                'excerpt' => $excerpt,
                'content' => apply_filters('the_content', get_the_content()),
                'cats' => wp_get_post_terms( get_the_ID(), 'category', array("fields" => "slugs")),
                'tags' => wp_get_post_terms( get_the_ID(), 'post_tag', array("fields" => "slugs")),
                'date' => get_the_date(),
                'author' => get_the_author(),
                'custom_field_keys' => get_post_custom_keys()
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


/**
* Truncates text.
*
* Cuts a string to the length of $length and replaces the last characters
* with the ending if the text is longer than length.
*
* @param string  $text String to truncate.
* @param integer $length Length of returned string, including ellipsis.
* @param string  $ending Ending to be appended to the trimmed string.
* @param boolean $exact If false, $text will not be cut mid-word
* @param boolean $considerHtml If true, HTML tags would be handled correctly
* @return string Trimmed string.
*/
function truncate($text, $length = 100, $ending = '...', $exact = true, $considerHtml = false) {
    if ($considerHtml) {
        // if the plain text is shorter than the maximum length, return the whole text
        if (strlen(preg_replace('/<.*?>/', '', $text)) <= $length) {
            return $text;
        }
        // splits all html-tags to scanable lines
        preg_match_all('/(<.+?>)?([^<>]*)/s', $text, $lines, PREG_SET_ORDER);
            $total_length = strlen($ending);
            $open_tags = array();
            $truncate = '';
        foreach ($lines as $line_matchings) {
            // if there is any html-tag in this line, handle it and add it (uncounted) to the output
            if (!empty($line_matchings[1])) {
                // if it's an "empty element" with or without xhtml-conform closing slash (f.e. <br/>)
                if (preg_match('/^<(\s*.+?\/\s*|\s*(img|br|input|hr|area|base|basefont|col|frame|isindex|link|meta|param)(\s.+?)?)>$/is', $line_matchings[1])) {
                    // do nothing
                // if tag is a closing tag (f.e. </b>)
                } else if (preg_match('/^<\s*\/([^\s]+?)\s*>$/s', $line_matchings[1], $tag_matchings)) {
                    // delete tag from $open_tags list
                    $pos = array_search($tag_matchings[1], $open_tags);
                    if ($pos !== false) {
                        unset($open_tags[$pos]);
                    }
                // if tag is an opening tag (f.e. <b>)
                } else if (preg_match('/^<\s*([^\s>!]+).*?>$/s', $line_matchings[1], $tag_matchings)) {
                    // add tag to the beginning of $open_tags list
                    array_unshift($open_tags, strtolower($tag_matchings[1]));
                }
                // add html-tag to $truncate'd text
                $truncate .= $line_matchings[1];
            }
            // calculate the length of the plain text part of the line; handle entities as one character
            $content_length = strlen(preg_replace('/&[0-9a-z]{2,8};|&#[0-9]{1,7};|&#x[0-9a-f]{1,6};/i', ' ', $line_matchings[2]));
            if ($total_length+$content_length> $length) {
                // the number of characters which are left
                $left = $length - $total_length;
                $entities_length = 0;
                // search for html entities
                if (preg_match_all('/&[0-9a-z]{2,8};|&#[0-9]{1,7};|&#x[0-9a-f]{1,6};/i', $line_matchings[2], $entities, PREG_OFFSET_CAPTURE)) {
                    // calculate the real length of all entities in the legal range
                    foreach ($entities[0] as $entity) {
                        if ($entity[1]+1-$entities_length <= $left) {
                            $left--;
                            $entities_length += strlen($entity[0]);
                        } else {
                            // no more characters left
                            break;
                        }
                    }
                }
                $truncate .= substr($line_matchings[2], 0, $left+$entities_length);
                // maximum lenght is reached, so get off the loop
                break;
            } else {
                $truncate .= $line_matchings[2];
                $total_length += $content_length;
            }

            // if the maximum length is reached, get off the loop
            if($total_length>= $length) {
                break;
            }
        }
    } else {
        if (strlen($text) <= $length) {
            return $text;
        } else {
            $truncate = substr($text, 0, $length - strlen($ending));
        }
    }

    // if the words shouldn't be cut in the middle...
    if (!$exact) {
        // ...search the last occurance of a space...
        $spacepos = strrpos($truncate, ' ');
        if (isset($spacepos)) {
            // ...and cut the text in this position
            $truncate = substr($truncate, 0, $spacepos);
        }
    }

    // add the defined ending to the text
    $truncate .= $ending;

    if($considerHtml) {

			$truncate .= '.. ';

        // close all unclosed html-tags
        foreach ($open_tags as $tag) {
            $truncate .= '</' . $tag . '>';
        }
    }
    return $truncate;
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
