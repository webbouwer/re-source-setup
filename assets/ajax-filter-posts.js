/* AJAX filter posts */
// https://www.bobz.co/ajax-filter-posts-tag/
jQuery(document).ready(function($) {

    var selected_tagfilter = '', selected_catfilter = '', active_post_id = '', active_post_list = '';

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
        selected_tagfilter = tagList.join();

		$('.cat-filter.active').each( function( index ){
			catList[index] = $(this).attr('title');
		});
        selected_catfilter = catList.join();

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

                    var newhash = '#[{"tags":'+JSON.stringify(selected_tagfilter.split(','))+',"cats":'+JSON.stringify( selected_catfilter.split(','))+'}]';
                    if(history.pushState) {
                        history.pushState(null, null, newhash );
                    }
                    else {
                        location.hash = newhash;
                    }

				}

        });

    });

	function jsonToPost( data ){
        console.log( JSON.stringify(data) );
		var html = '';
		for( var key in data ){
            if(data[key].id){
			    html += '<div id="post-'+data[key].id+'">';
                if( data[key].img ){
                    html += '<img src="'+data[key].img+'" style="max-width:100%;height:auto;" />';
                }
                html += '<h3>'+data[key].title+'</h3><sub>'+data[key].date+'</sub>';
                html += '<div>'+data[key].excerpt+'</div><div>'+data[key].tags+'</div>';
                html += '<div>'+data[key].cats+'</div>';
                html += '</div>';
            }
		}
		return html;
	}

});

