// data models
//jQuery(document).ready(function($) {


jQuery(function($) {


	$(document).ready(function(){
	});

    $(document).ajaxStart(function() {
      if( $("#loadmsgbox").length < 1 ){
        $('body').append('<div id="loadmsgbox">Loading..</div>');
      }
    });

    $(document).ajaxComplete(function() { // http://api.jquery.com/ajaxstop/
    //$container.imagesLoaded(function(){
        $("#loadmsgbox").remove();
            //$("html").niceScroll();
            //$('#menucontainer').niceScroll();
      //});
    });

    /**
     * On load
     */
	$(window).load(function() {

        var container = $("#itemcontainer"),
            tagfilter = [],
            catfilter = [],
            alltags   = [],
            allcats   = [],
            idloaded  = [],
            ppload    = 10,
            filterData  = [],
            filterClass = '';

        // isotope
        var $colWidth = container.width()/7,
        $currCat = '';


        $('#tagfilterbox .tag-filter').each( function( index ){
            alltags[index] = $(this).data('slug');
        });

        if(window.location.hash) {
            var hashvars = getHashUrlVars();
            if( hashvars.tags  ){
                tagfilter = hashvars.tags.split(',');
            }
            if( hashvars.cats  ){
                catfilter = hashvars.cats.split(',');
            }
        }

        activeFilterMenu( tagfilter, catfilter );
        activeFilterData( tagfilter, catfilter );
        setNewHash( tagfilter, catfilter );

        if( tagfilter.length > 0 ){
            filterClass = '.'+tagfilter.join(',.');
        }
        if( catfilter.length > 0 ){
            filterClass = '.'+catfilter.join(',.');
        }

        /**
         * On Tag Filter
         */
        $('body').on( 'click', '#tagfilterbox .tag-filter', function(event){

                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }

                var $this = $(this);
                var tag  = $this.attr('data-slug');
                $this.toggleClass('selected');

                tagfilter = [];
                $('#tagfilterbox .tag-filter.selected').each( function( index ){
                    tagfilter[index] = $(this).data('slug');
                });

                $('.item').each( function( index ){
                    idloaded[index] = $(this).data('id');
                });

                activeFilterMenu( tagfilter, catfilter );
                activeFilterData( tagfilter, catfilter, idloaded );
                setNewHash( tagfilter, catfilter );

                filterClass = '*';
                if( tagfilter.length > 0 ){
                    filterClass = '.'+tagfilter.join(',.');
                }
                if( catfilter.length > 0 ){
                    filterClass = '.'+catfilter.join(',.');
                }
        });

        /**
         * On active Tag Filter
         */
        $('body').on( 'click', '#activefilterbox .tag-filter', function(event){
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            $('#tagfilterbox .'+ $(this).data('slug') ).trigger('click');
        });



        /**
         * On item click
         */
		container.on('click touchend', '.item', function(event){

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}

    		var $this = $(this);

    		$currCat = $this.attr('data-cats').split(',')[0]; //alert($this.find('.itemcontent').text());

			tagfilter = $this.attr('data-tags').split(',');

            activeFilterMenu( tagfilter, catfilter );
            activeFilterData( tagfilter, catfilter, idloaded );
			setNewHash( tagfilter, catfilter );


			$this.addClass('active');

	      	filterClass = '*';
			if( tagfilter.length > 0 ){
				filterClass = '.'+tagfilter.join(',.');
			}

	  		container
	  	  	//.isotope({ masonry: { columnWidth: $colWidth } })
	        .prepend($this)
			.isotope({ filter: filterClass })
			.isotope('updateSortData')
	        .isotope('reloadItems')
	        .isotope({
				sortBy: [ 'byCategory', 'byTagWeight' ],
				sortAscending: {
				  byCategory: true, // name ascendingly
				  byTagWeight: false, // weight descendingly
				}
			});  // 'original-order'

			setColumnWidth();


	        $('html, body').animate({scrollTop:0}, 400);

  		});










        /**
         * On active Filter
         */
        function activeFilterData( tagfilter = [], catfilter = [], idloaded = [] , ppload = 99 ){

                var filter_data = {
                    'tagfilter' : tagfilter.join(),
                    'catfilter' : catfilter.join(),
                    'idloaded' : idloaded,
                    'ppload' : ppload
                };

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
                        if( result[0] != 'No posts found' ){
                            markupFilterData(result);//$("#itemcontainer").html( JSON.stringify(result) );
                        }
                        $('.item').each( function(){
                            $(this).removeClass('active');
                            newTagWeight( this, tagfilter );
                        });
                        console.log( result ); //$container.html( '['+data+']' );



                            filterClass = '*';
                            if( tagfilter.length > 0 ){
                                filterClass = '.'+tagfilter.join(',.');
                            }
                            if( catfilter.length > 0 ){
                                filterClass = '.'+catfilter.join(',.');
                            }

                        if( idloaded.length < 1 ){

                            startIsotope( filterClass );

                        }else{
                            setIsotope( filterClass );
                        }

                    }
                });


        }

        /**
         * Markup Data Result
         */
        function markupFilterData(result){
                $.each( result, function(idx,obj){
                    if( $('#post-'+obj.id).length > 0 ){
                    }else{
                        var html = '', filterclass = '';

                        $(obj.tags).each(function( x , tag ){
                               filterclass += ' '+tag;
                        });
                        $(obj.cats).each(function( x , cats ){
                               filterclass += ' '+cats;
                        });

                        html += '<div id="post-'+obj.id+'" data-id="'+obj.id+'" ';
                        html += 'class="item '+filterclass+'" ';
                        html += 'data-tags="'+obj.tags+'" data-cats="'+obj.cats+'">';
                        html += '<div>'+obj.title+'</div>';
                        html += '<div class="itemcontent">'+obj.content+'</div>';
                        html += '<div>'+obj.tags+'</div>';
                        html += '<div>'+obj.cats+'</div>';
                        html += '<div class="matchweight">3</div>';
                        html += '</div>';
                        container.append( html );
                    }
                });
        }

        /**
         * Get url hash vars
         */
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

        /**
         * Set new hash
         */
            function setNewHash( tags = [], cats = [] ){
                var newhash = '#';
                if( tags.length > 0 ){
                    newhash += 'tags='+tags.join();
                }
                if( cats.length > 0 ){
                    newhash += '&cats='+cats.join();
                }
                if(history.pushState) {
                    history.pushState(null, null, newhash );
                }else{
                    location.hash = newhash;
                }
            }

           /**
            * Tag Filter Menu
            */
            function activeFilterMenu( tagfilter = [], catfilter = [] ){

                if( $('#activefilterbox').length < 1 ){
                    $('<div id="activefilterbox"></div>').insertBefore("#tagfilterbox");
                }

                $('#tagfilterbox .tag-filter').each( function(){
                    $(this).removeClass('selected');
                    if( $.inArray( $(this).data('slug') , tagfilter ) > -1 ){
                        $(this).addClass('selected');
                    }
                });
                $('#activefilterbox').html('');
                $('#tagfilterbox .tag-filter.selected').each( function(){
                    $(this).clone().appendTo('#activefilterbox');
                });
                /*
                $('.item').each( function(){
                    $(this).removeClass('active');
                    newTagWeight( this, tags );
                });*/

                if( tagfilter.length > 0 ){
                    filterClass = '.'+tagfilter.join(',.');
                }
                if( catfilter.length > 0 ){
                    filterClass = '.'+catfilter.join(',.');
                }
                console.log('filter:' + tagfilter.join() +' ('+filterClass+')');

            }


            /**
            * Item Weight Tag Filter
            */
            function newTagWeight( obj, filter ){

                var tags = $(obj).data('tags').split(',');
                var newSize = 'size-s';
                $(obj).removeClass('size-l size-m size-s');
                var mc = 0;
                if( tags.length > 0  && filter.length > 0){


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
                /*
                if( mc > 0 ){
                   $(obj).addClass(newSize).fadeIn();
                }else{
                   $(obj).fadeOut();
                }
                */

            }

            function startIsotope( filterClass ){

                /**
                * Load Isotope
                */

                // init isotope
                container.isotope({

                    itemSelector: '.item',
                    layoutMode: 'masonry',
                    animationEngine: 'best-available',
                    transitionDuration: '0.8s',
                    masonry: {
                    //isFitWidth: true,
                    //columnWidth: '.base',
                    gutter: 0,
                    },
                    getSortData: {
                        byCategory: function (elem) { // sort randomly
                                return $(elem).data('category') === $currCat ? 0 : 1;
                        },
                        byTagWeight: '.matchweight parseInt',
                    },
                    sortBy : 'byTagWeight', //[ 'byCategory', 'byTagWeight' ],
                    sortAscending: {
                              //byCategory: true, // name ascendingly
                              byTagWeight: false, // weight descendingly
                    },
                });

                container.isotope({ filter: filterClass }).isotope('updateSortData').isotope( 'layout' );

                setColumnWidth(); // ! important to get the column width for first layout

            }

            function setIsotope( filterClass ){

                container
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

            }


            // on resize isotope
            var resizeId;

            $(window).resize(function() {
                    clearTimeout(resizeId);
                    resizeId = setTimeout(doneResizing, 20);
            });

            function doneResizing(){
                setColumnWidth();
            }

            function setColumnWidth(){

                var w = container.width();
                if(w > 640) {
                $colWidth = w/7;
                }else{
                $colWidth = w/3;
                }
                container.isotope({ masonry: { columnWidth: $colWidth } }).isotope( 'layout' );
            }





        }); // end doc loaded

 }); // and jQuery $


/** filter test 2


            var $container = $('#itemcontainer'),
            elementselector = 'item',
            $colWidth = $container.width()/7,
            $currCat = '',
            $catfilter = false,
            $basefilter = [],
            $tagfilter = basefilter,
            $loaded = [],
            $allTags = [],
            $prevfilter = '',
            $filterClass = '*';//['tag2','tag3'];

            $('#tagfilterbox .tag-filter').each( function( index ){
                    $allTags[index] = $(this).data('slug');
            });

            if(window.location.hash) {
                var hashvars = getHashUrlVars();
                if( hashvars.tags  ){
                    $tagfilter = hashvars.tags.split(',');
                }
            }
            setNewHash( $tagfilter.join() );

            activeFilterMenu( $tagfilter );

            loadFilterData( $tagfilter );

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

            $('body').on( 'click', '.loadmore', function(event){
                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }

                filter = [];
                $('#tagfilterbox .tag-filter.selected').each( function( index ){
                    filter[index] = $(this).data('slug');
                });
                prevfilter = filter;

                activeFilterMenu( filter );
                loadFilterData( filter );
                setNewHash( filter.join() );

                filterClass = '*';
                if( filter.length > 0 ){
                    filterClass = '.'+filter.join(',.');
                }
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

                    var loaded = [];
                    if( prevfilter == filter ){ // post inview + load more
                        // not id's
                        $container.find('.item').each( function( index ){
                            loaded[index] = $(this).data('id');
                        });
                    }else{
                        $container.fadeOut( 200, function(){
                            $container.html('');
                            $container.fadeIn();
                        });
                    }
                    console.log( prevfilter +' vs '+ filter);
                    prevfilter = filter;

                    var filter_data = {
                        'tagfilter' : filter.join(),
                        'loaded' : loaded.join(),
                        'postsperload' : 2
                    };

                    $.ajax({
                    url: filter_vars.filter_ajax_url,
                    data:{
                        'action': 'multi_filter', // function to execute
				        'filter_nonce': filter_vars.filter_nonce, // wp_nonce
				        'filter_data': filter_data, // selected data filters
                        'query': filter_vars.posts, // that's how we get params from wp_localize_script() function
			            'page' : filter_vars.current_page
                    }, // form data
                    dataType: 'json',
                    type: 'POST', // POST
                    beforeSend:function(xhr){
                    },
                    success:function(result){
                        // Display posts on page
                        filter_vars.current_page++;
                        if( result[0] != 'No posts found' ){
                        markupFilterData(result);
                        }
                        console.log( result[0] );
                        //$container.html( html );
                        //$container.html( '['+data+']' );
                    }
                });
            }

            function markupFilterData(data){


                $.each( data, function(idx,obj){
                        var html = '';
                        html += '<div class="item" data-id="'+obj.id+'" data-tags="'+obj.tags+'">';
                        html += '<div>'+obj.title+'</div>';
                        html += '<div>'+obj.content+'</div>';
                        html += '<div>'+obj.tags+'</div>';
                        html += '<div>'+obj.cats+'</div>';
                        html += '</div>';
                        $container.append( html );
                });


                //return html;
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
                if( filter.length > 0 ){
                    newhash += 'tags='+filter..join();
                }
                if(history.pushState) {
                    history.pushState(null, null, newhash );
                }else{
                    location.hash = newhash;
                }
            }



*/

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

