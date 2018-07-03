/* AJAX filter posts */
// https://www.bobz.co/ajax-filter-posts-tag/
jQuery(document).ready(function($) {
	var selected_tagfilter = '', selected_catfilter = '';
	$('.tag-filter,.cat-filter').click( function(event) {


        // Prevent default action - opening tag page
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }


		// reset tag filter
		var catList = [];

		// reset tag filter
		var tagList = [];

 		$(this).toggleClass('active');

 		$('.tag-filter.active').each( function( index ){
			tagList[index] = $(this).attr('title');
		});
        var selected_tagfilter = tagList.join();

		$('.cat-filter.active').each( function( index ){
			catList[index] = $(this).attr('title');
		});
        var selected_catfilter = catList.join();

		$.ajax({
				url: afp_vars.afp_ajax_url,
				data:{
					'action': 'filter_posts', // function to execute
					'afp_nonce': afp_vars.afp_nonce, // wp_nonce
					'tagfilter': selected_tagfilter, // selected tag
					'catfilter': selected_catfilter, // selected tag
				}, // form data
				dataType: 'json',
				type: 'POST', // POST
				beforeSend:function(xhr){
					$('.tagged-posts').fadeOut();
					console.log( selected_tagfilter + ' + '+selected_catfilter );
				},
				success:function(data){
					// Display posts on page
					$('.tagged-posts').html( jsonToPost(data) );
					// Restore div visibility
					$('.tagged-posts').fadeIn();
				}
			});



    });

	function jsonToPost( data ){
        console.log( JSON.stringify(data) );
		var html = '';
		for( var key in data ){
			html += '<div>'+data[key].title+'</div>';
		}
		return html;
	}

});

