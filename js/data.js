// data models


jQuery(function($) {

    var dataLoader = function(options){

        var root = this;

        this.settings = {
            containerID     : 'pagecontainer',
            menuboxID       : 'filterbox',
            searchFieldID   : 'searchbar',
            itemClass       : 'item',
            tagbuttonClass  : 'taglink',
            catbuttonClass  : 'categorylink',
            postIDprefix    : 'post-',
            colWidth        : 0
        };

        this.control = {
            currentID       : false,
            tagfilter       : [],
            catfilter       : [],
            prevfilter      : [],
            loadedID        : [],
            loadedData      : [],
            alltags         : [],
            allcats         : [],
            ppload          : 25,
            minload         : 50,
            maxload         : 999
        };

        /**
         * Constructor
         */
        this.construct = function(options){

            // set settings
            $.extend( this.settings , options);

            var filter = [];
            if(window.location.hash) {
                var hashvars = root.getHashUrlVars();
                if( hashvars.tags  ){
                    filter = hashvars.tags.split(',');
                }
            }
            root.setNewHash( filter.join() );
            if(filter.length > 0 ){
                root.control.tagfilter = filter;
            }

            var el = '#'+root.settings.menuboxID+' .'+root.settings.tagbuttonClass;
            $(el).each( function(){
				$(this).removeClass('selected');
				if( $.inArray( $(this).data('slug') , root.control.tagfilter ) > -1 ){
					$(this).addClass('selected');
				}
			});

            $('#'+root.settings.containerID).isotope({

                itemSelector: '.'+root.settings.itemClass,
                layoutMode: 'masonry',
                animationEngine: 'best-available',
                transitionDuration: '0.5s',
                masonry: {
                //isFitWidth: true,
                //columnWidth: '.base',
                gutter: 0,
                },
                getSortData: {
                    /*byCategory: function (elem) { // sort randomly
                            return $(elem).data('category') === $currCat ? 0 : 1;
                    },*/
                    byTagWeight: '.matchweight parseInt',
                },
                sortBy : 'byTagWeight', //[ 'byCategory', 'byTagWeight' ],
                sortAscending: {
                          //byCategory: true, // name ascendingly
                          byTagWeight: false, // weight descendingly
                },

            });
            root.setColumnWidth();

        };

        /**
         * Status
         */
        this.filterData = function(){

            //root.control.tagfilter = ['smart','wannabee','mega'];
            if( $('#active-filters').length < 1 ){
				$('body').prepend('<div id="active-filters"></div>');
			}
			var el = '#'+frameload.settings.menuboxID+' .'+frameload.settings.tagbuttonClass;

			$('#active-filters').html('');
			$(el+'.selected').each( function(){
				$(this).clone().appendTo('#active-filters');
			});

            console.log(root.control.tagfilter);
            //console.log(root.control.loadedID);
        };

        /**
         * On active Filter
         */
        this.loadData = function(){

            root.filterData();

            if( root.control.loadedID.length < root.control.maxload ){ // max load 999 posts

                if(root.control.loadedID.length < root.control.minload ){ // min load 25 posts from start
                   root.control.ppload = root.control.minload;
                }

                var filter_data = {
                    'tagfilter' : root.control.tagfilter,
                    'catfilter' : root.control.catfilter,
                    'loadedID'  : root.control.loadedID,
                    'currentID' : root.control.currentID,
                    'ppload'    : root.control.ppload
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

                            // collect data
                            $.each( result, function(idx,obj){
                                root.control.loadedID.push( obj.id );
                                root.control.loadedData[obj.id] = obj;
                            });

                            root.markupHTML(result);
                        }
                        root.sortMarkupByTagweight();
                    }

                });

            }

        };

        /**
         * Markup HTML Result
         */
        this.markupHTML = function(result){

            var html = '';
            $.each( result, function(idx,obj){
                if( $('[data-id='+obj.id+']').length > 0 ){
                    // object is on screen
                }else{
                    var filterclass = '';
                    $(obj.tags).each(function( x , tag ){
                        filterclass += ' '+tag;
                    });
                    $(obj.cats).each(function( x , cats ){
                        filterclass += ' '+cats;
                    });
                    html += '<div id="'+root.settings.postIDprefix+''+obj.id+'" data-id="'+obj.id+'" ';
                    html += 'class="'+root.settings.itemClass+' '+filterclass+'" ';
                    html += 'data-tags="'+obj.tags+'" data-cats="'+obj.cats+'">';
                    html += '<div>'+obj.title+'</div>';
                    html += '<div class="itemcontent">';
                    html += '<div class="intro">'+obj.excerpt+'</div>';
                    //html += '<div class="main">'+obj.content+'</div>';
                    html += '</div>';
                    html += '<div>'+obj.tags+'</div>';
                    html += '<div>'+obj.cats+'</div>';
                    html += '<div class="matchweight"></div>';
                    html += '</div>';
                }
            });
            $('#'+root.settings.containerID).append( html );

            //console.log(JSON.stringify(root));

        };

        this.newTagWeight = function( obj, tagfilter ){

            var tags = $(obj).data('tags').split(',');
            var newSize = 'size-s';
            $(obj).removeClass('size-l size-m size-s');
            var mc = 0;
            if( tags.length > 0  && tagfilter.length > 0){
                for(i=0;i<tags.length;i++){
                    //if( basefilter[tags[i]] ){
                    if( $.inArray( tags[i], tagfilter ) > -1 ){
                        mc++;
                    }
                }

                $(obj).find('.matchweight').text(mc);

                var percent = 100 / tagfilter.length * mc;
                if( percent > 80 ){
                    newSize = 'size-l';
                }else if( percent > 40 ){
                    newSize = 'size-m';
                }

            }else{

                $(obj).find('.matchweight').text(0);

            }

            if( mc > 0 ){
                $(obj).addClass(newSize);//.fadeIn();
            }else{
                $(obj).hide();
            }

        };

        this.sortMarkupByTagweight = function(){

            var divs =  $('.'+root.settings.itemClass);
            // assign tag weight
            divs.each( function(){
                root.newTagWeight( this, root.control.tagfilter );
            });
            var matchorder = divs.sort(function (a, b) {
                return $(a).find(".matchweight").text() < $(b).find(".matchweight").text();
            });
            $('#'+root.settings.containerID).html(matchorder);


            if( root.control.tagfilter.length > 0 ){
				var filterClass = '.'+root.control.tagfilter.join(',.');
			}


			$('.'+root.settings.itemClass+'.proposed').addClass('active').removeClass('proposed');

            $('#'+root.settings.containerID)
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


            root.setColumnWidth();

        };

        this.getHashUrlVars = function(){
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

        this.setNewHash = function(){

            var newhash = '#';
            if( root.control.tagfilter.length > 0 ){
                newhash += 'tags='+root.control.tagfilter+'&';
            }
            if( root.control.catfilter.length > 0 ){
                newhash += 'cats='+root.control.catfilter;
            }
            if(history.pushState) {
                history.pushState(null, null, newhash );
            }else{
                location.hash = newhash;
            }
        };

        this.doneResizing = function(){
			root.setColumnWidth();
		};

		this.setColumnWidth = function(){

			var w = $('#'+root.settings.containerID).width();
			if(w > 640) {
			root.control.colWidth = w/3;
			}else{
			root.control.colWidth = w/2;
			}
			$('#'+root.settings.containerID).isotope({ masonry: { columnWidth: root.control.colWidth } }).isotope( 'layout' );
		};



        this.construct(options); // load constructor

    } // end Class dataLoader





    /**
     * Init
     */
    var frameload = new dataLoader({
            containerID     : 'pagecontainer',
            menuboxID       : 'filterbox',
            searchFieldID   : 'searchbar',
            itemClass       : 'item',
            tagbuttonClass  : 'taglink',
            catbuttonClass  : 'categorylink',
            postIDprefix    : 'post-'
    });

	$(document).ready(function(){

        var resizeId;
		$(window).resize(function() {
				clearTimeout(resizeId);
				resizeId = setTimeout( frameload.doneResizing, 20);
		});

        // load data
        frameload.loadData();

        var el = '#'+frameload.settings.menuboxID+' .'+frameload.settings.tagbuttonClass;

        $('body').on( 'click', el, function(event){
            if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
            $(this).toggleClass('selected');

            frameload.control.tagfilter = [];

            $('.'+frameload.settings.itemClass).removeClass('active');

            $(el+'.selected').each( function( index ){
				frameload.control.tagfilter[index] = $(this).data('slug');
			});

            frameload.loadData();

            frameload.setNewHash( frameload.control.tagfilter );
            //alert( $(this).data('slug') );
        });

        // on active filter click (tag)
        var el2 = '#active-filters .'+frameload.settings.tagbuttonClass;

		$('body').on( 'click', el2, function(event){
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
			$('#'+frameload.settings.menuboxID+' .'+ $(this).data('slug') ).trigger('click');
		});

        $('body').on('click', '.'+frameload.settings.itemClass, function(event){

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}

    		var $this = $(this);

            $('.'+frameload.settings.itemClass).removeClass('active');

			$this.addClass('proposed');
    		//$currCat = $this.attr('data-category'); //alert($this.find('.itemcontent').text());

            frameload.control.tagfilter = $this.data('tags').split(',');;
			frameload.control.catfilter = $this.data('cats').split(',');

            $('#tag-filters .tagbutton').each( function( index ){
                $(this).removeClass('selected');
                if( $.inArray( $(this).data('slug'), frameload.control.tagfilter ) > -1 ){
                    $(this).addClass('selected');
                }
			});

            frameload.loadData();


            frameload.setNewHash();

	        $('html, body').animate({scrollTop:0}, 400);

  		});


	});

	$(window).load(function() {
    });

    $(document).ajaxStart(function() {
        $('body').append('<div class="loadbox">loading..</div>');
    });

    $(document).ajaxComplete(function() { // http://api.jquery.com/ajaxstop/
        $('.loadbox').remove();
    });


});

