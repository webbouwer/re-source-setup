// data models
//jQuery(document).ready(function($) {


jQuery(function($) {


	$(document).ready(function(){

		// taglib = [] all tags
		// catlib = [[]] all (sub)categories

		// basefilter = [];
		// usefilter = [];

		//
	});

	$(window).load(function() {


            var $container = $('#itemcontainer'),
            $colWidth = $container.width()/7,
            $currCat = '',
            allTags = [],
            basefilter = [],
            filter = basefilter,
            filterClass = '*';//['tag2','tag3'];

            $('#tagfilterbox .tag-filter').each( function( index ){
                    allTags[index] = $(this).data('slug');
            });

            if(window.location.hash) {
                var hashvars = getHashUrlVars();
                if( hashvars.tags  ){
                    filter = hashvars.tags.split(',');
                }
            }
            setNewHash( filter.join() );

            activeFilterMenu( filter );

            loadFilterData( filter );

            if( filter.length > 0 ){
                filterClass = '.'+filter.join(',.');
            }

            // ..container isotope

            // on tagbutton click (tag)

            $('body').on( 'click', '#tagfilterbox .tag-filter', function(event){

                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }

                var $this = $(this);
                var tag  = $this.attr('data-slug');
                $this.toggleClass('selected');

                filter = [];
                $('#tagfilterbox .tag-filter.selected').each( function( index ){
                    filter[index] = $(this).data('slug');
                });

                activeFilterMenu( filter );

                loadFilterData( filter );

                setNewHash( filter.join() );


                filterClass = '*';
                if( filter.length > 0 ){
                    filterClass = '.'+filter.join(',.');
                }

                /*
                //$container.isotope({ filter: filterClass }).isotope('updateSortData').isotope( 'layout' );
                $container
                .isotope({ filter: filterClass })
                .isotope('updateSortData')
                .isotope('reloadItems')
                .isotope({
                    sortBy : 'byTagWeight', //[ 'byCategory', 'byTagWeight' ],
                    sortAscending: {
                          //byCategory: true, // name ascendingly
                          byTagWeight: false, // weight descendingly
                    },
                }); // 'original-order'



                $('html, body').animate({scrollTop:0}, 400);
                */
            });

            // on active filter click (tag)
            $('body').on( 'click', '#activefilterbox .tag-filter', function(event){
                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }
                $('#tagfilterbox .'+ $(this).data('slug') ).trigger('click');
            });


            // add weight to tag relation
            function newTagWeight( obj, filter ){

                var tags = $(obj).data('tags').split(',');
                var newSize = 'size-s';
                $(obj).removeClass('size-l size-m size-s');

                if( tags.length > 0  && filter.length > 0){
                    var mc = 0;

                        for(i=0;i<tags.length;i++){
                            //if( basefilter[tags[i]] ){
                            if( $.inArray( tags[i], filter ) > -1 ){
                                mc++;
                            }
                        }
                        $(obj).find('.matchweight').text(mc);

                        var percent = 100 / filter.length * mc;

                        if( percent > 85 ){
                            newSize = 'size-l';
                        }else if( percent > 55 ){
                            newSize = 'size-m';
                        }
                        // console.log('match:' + newSize );
                }else{  // restore weight to tag count vs empty filter
                    $(obj).find('.matchweight').text(tags.length);
                }
                $(obj).addClass(newSize);
            }

            // active tag menu
            function activeFilterMenu( filter ){

                if( $('#activefilterbox').length < 1 ){
                    $('<div id="activefilterbox"></div>').insertBefore("#tagfilterbox");
                }

                $('#tagfilterbox .tag-filter').each( function(){
                    $(this).removeClass('selected');
                    if( $.inArray( $(this).data('slug') , filter ) > -1 ){
                        $(this).addClass('selected');
                    }
                });
                $('#activefilterbox').html('');
                $('#tagfilterbox .tag-filter.selected').each( function(){
                    $(this).clone().appendTo('#activefilterbox');
                });

                $('.item').each( function(){
                    $(this).removeClass('active');
                    newTagWeight( this, filter );
                });

                if( filter.length > 0 ){
                    filterClass = '.'+filter.join(',.');
                }
                console.log('filter:' + filter.join() +' ('+filterClass+')');

            }

            function loadFilterData( filter ){

                    // not id's $container.find('item').each(function(){  });
                    var notids = []
                    var filter_data = { 'tags' : filter.join(), 'notids' : notids.join() };

                    $.ajax({
                    url: filter_vars.filter_ajax_url,
                    data:{
                        'action': 'multi_filter', // function to execute
				        'filter_nonce': filter_vars.filter_nonce, // wp_nonce
				        'filter_data': filter_data, // selected data filters
                    }, // form data
                    dataType: 'json',
                    type: 'POST', // POST
                    beforeSend:function(xhr){
                    },
                    success:function(result){
                        // Display posts on page
                        var html = markupFilterData(result);
                        $container.html( html );
                        //$container.html( '['+data+']' );
                    }
                });
            }

            function markupFilterData(data){

                var html = '';
                $.each( data, function(idx,obj){
                        html += obj.title;
                });

                return html;

                //return JSON.stringify(data);
            }


            function getHashUrlVars(){
                var vars = [], hash;
                var hashes = window.location.href.slice(window.location.href.indexOf('#') + 1).split('&');
                for(var i = 0; i < hashes.length; i++)
                {
                    hash = hashes[i].split('=');
                    vars.push(hash[0]);
                    vars[hash[0]] = hash[1];
                }
                return vars;
            }


            function setNewHash( filter ){
                var newhash = '#';
                if( filter != ''){
                    newhash += 'tags='+filter;
                }
                if(history.pushState) {
                    history.pushState(null, null, newhash );
                }else{
                    location.hash = newhash;
                }
            }



    });

 });




/* Class setup

var PostFilter = function(options){

            var optionset = {
                version  : '0.0.1',
                container : 'itemcontainer', // result maincontent html element id
                filterbox : 'tagfilterbox', // filterbox html element id
                activebox : 'activefilterbox', // active filters box html element id
                tagbutton : 'tag-filter', // tag button element class
                tagdata   : 'slug', // tag element data atribute name
            };

            var root = this; // inside class functions use root. (= this.)

            this.construct = function(options){

                $.extend(optionset , options);


            };
    }


*/

   /* var container = $("#maincontainer");

       $('.tagbutton').click( function(event) {

        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }

        // Get tag slug from title attirbute
        var filter_data = $(this).attr('title');

          $.ajax({
			url: filter_vars.filter_ajax_url,
			data:{
                'action': 'multi_filter', // function to execute
				'filter_nonce': filter_vars.filter_nonce, // wp_nonce
				'filter_data': filter_data, // selected data filters
            }, // form data
            dataType: 'json',
			type: 'POST', // POST
			beforeSend:function(xhr){

			},
			success:function(data){
				// Display posts on page
                container.html( JSON.stringify(data) );
			}
		});

        console.log(filter_data);

        });  */

/* SETUP test 1 code

    var filter_data = { 'tags': 'mega'};//{ 'id' :19 };

    var container = $("#contentcontainer");

        $.ajax({

                url: filter_vars.filter_ajax_url,

				data:{
					'action': 'multi_filter', // function to execute
					'filter_nonce': filter_vars.filter_nonce, // wp_nonce
					'filter_data': filter_data, // selected data filters
				},

				dataType: 'json',
				type: 'POST', // POST
				beforeSend:function(xhr){

					console.log( filter_data );

				},
				success:function(data){
					// Display posts on page
					container.html( data.post_content ); //JSON.stringify(data)
                    console.log( JSON.stringify(data) );
                    //var newhash = '#[{"tags":'+JSON.stringify(selected_tagfilter.split(','))+',"cats":'+JSON.stringify( selected_catfilter.split(','))+'}]';

                    var newhash = '#';
                    if( filter_data.id != ''){
                         newhash += 'postid='+filter_data.id;
                    }
                    if( filter_data.tags != ''){
                         newhash += 'tags='+filter_data.tags;
                    }

                    if(history.pushState) {
                        history.pushState(null, null, newhash );
                    }
                    else {
                        location.hash = newhash;
                    }

				}

        });
*/

