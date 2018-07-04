<?php
/**
 * Category Menu
 */
function re_source_category_menu() {

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
 function re_source_tag_menu() {
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
    $tagfilter = $_REQUEST['tagfilter'];
    $catfilter = $_REQUEST['catfilter'];

    // WP Query
    $args = array(
        'post_type' => 'post',
        'tag' => $tagfilter,
        'category_name' => $catfilter,
        'order_by' => date,
        'order' => 'DESC',
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

		// post text
		$excerpt_length = 64;
		$content = apply_filters('the_content', get_the_content());
		$excerpt = truncate( $content, $excerpt_length, '', false, true );
		//$excerpt .= '<a class="more-info" href="#'.$post_data['post_name'].'">...read more</a>';
		// post custom fields

		$custom_field_keys = get_post_custom_keys();
		$customfields = '';
		foreach ( $custom_field_keys as $key => $value ) {
		  	$valuet = trim($value);
		  	if ( '_' == $valuet{0} ) continue;
			$values = get_post_custom_values( $value );
			foreach ( $values as $fieldkey => $fieldvalue ){
				$customfields[ $value ] = $fieldvalue;
			}
      	}


		$thumb = get_the_post_thumbnail_url( get_the_ID(), 'thumbnail' );
        $img = get_the_post_thumbnail_url( get_the_ID(), 'medium' , array( 'class' => 'align-center' ) );
		$cover = get_the_post_thumbnail_url( get_the_ID(), 'full' , array( 'align' => 'center', 'class' => 'align-center' ) );


        $response[get_the_ID()] = array(
            'id' => get_the_ID(),
            'link' => get_the_permalink(),
            'title' => get_the_title(),

            'excerpt' => $excerpt,
            'content' => get_the_content(),

            'thumb' => $thumb,
            'img' => $img,
            'cover' => $cover,

            'tags' => wp_get_post_terms( get_the_ID(), 'post_tag', array("fields" => "slugs")), // json_encode(get_the_tags($post->ID)),
            'cats' => wp_get_post_terms( get_the_ID(), 'category', array("fields" => "slugs")), // json_encode(get_the_category($post->ID)),
            'meta' => get_post_meta( get_the_ID() ),
            'date' => get_the_time('Y/m/d'),
            'author' => get_the_author(),

			'custom' => $customfields,
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
add_action('wp_ajax_filter_posts', 'wp_startup_ajax_filter_get_posts');
add_action('wp_ajax_nopriv_filter_posts', 'wp_startup_ajax_filter_get_posts');

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
?>
