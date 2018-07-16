/**
 * dataShuffle class
 * Dependency: JQuery, Isotope, (ajax file / Wordpress)
 * Masonry content-item grid ordered by tag weight (and categories)
 */
jQuery(function($) {

    // data models
    var dataShuffle = function(options){

        var root = this, resizecheck;

        this.control = {
            queryID         : false,
            tagfilter       : [],
            catfilter       : [],
            selectedCat     : '',
            loadedID        : [],
            ppload          : 999
        };

        this.elements = {
            containerID     : 'itemcontainer',
            itemClass       : 'item',
            menuContainerID : 'tagmenucontainer',
            loadmsgboxClass : 'loadmsg',
            parentContainer : 'body',
            colinrowL       : 7,
            colinrowM       : 5,
            colinrowS       : 3,
            columnwidth     : 0,
        }

        this.filterdata = {
            alltags         : filter_vars.filter_alltags,
            allcats         : filter_vars.filter_allcats,
            prevtagfilter    : [],
            prevcatfilter      : [],
        }

        this.construct = function( options ){

            // set settings
            $.extend( root.control , options[0]);
            $.extend( root.elements , options[1]);

            // base filter or hash tags
            var tagfilter = root.control.tagfilter;
            var catfilter = root.control.catfilter;
            var selectedCat = root.control.selectedCat;

            if(window.location.hash){
                    var hashvars = root.getHashUrlVars();
                    if( hashvars.tags  ){
                        tagfilter = hashvars.tags.split(',');
                    }
                    if( hashvars.cats  ){
                        catfilter = hashvars.cats.split(',');
                    }
                    if(tagfilter.length > 0 ){
                        root.control.tagfilter = tagfilter;
                    }
                    if(catfilter.length > 0 ){
                        //root.control.catfilter = catfilter;
                    }
                    if( hashvars.pid && hashvars.pid != '' && hashvars.pid != 'undefined' && hashvars.pid != typeof undefined){
                        root.control.queryID = hashvars.pid;
                    }

            }//.. catfilter
            root.setNewHash( );

            root.buildTagListMenu();

            root.getDataByFilter();

            $(window).resize(function() {
				clearTimeout(root.resizecheck);
				root.resizecheck = setTimeout( root.doneResizing, 20);
            });

        };

        this.toggleLoadBox = function(){
            if( $('.loadbox').length < 1 ){
                $('body').append('<div class="'+root.elements.loadmsgboxClass+' loadbox">loading..</div>');
            }else{
                $('.loadbox').remove();
            }
        };

        this.getDataByFilter = function(){

            var filter_data = [];

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
                    root.toggleLoadBox();
                },
                success:function(result){
                    // Display posts on page
                    if( result[0] != 'No posts found' ){
                        $.each( result, function(idx,obj){
                            root.control.loadedID.push( obj.id );
                        });
                        root.markupHTML(result);
                    }
                }
            });
        };

        this.markupHTML = function(result){

            var html = '', oc = 0;
            $.each( result, function(idx,obj){
                if( $('[data-id='+obj.id+']').length > 0 ){
                    // object is on screen
                }else{
                    var objfilterclasses = '';
                    $(obj.tags).each(function( x , tag ){
                        objfilterclasses += ' '+tag;
                    });
                    $(obj.cats).each(function( x , cats ){
                        objfilterclasses += ' '+cats;
                    });
                    var catreverse = obj.cats.reverse();
                    /*if(oc = 0){
                        objfilterclasses += ' base';
                    }*/
                    html += '<div id="post-'+obj.id+'" data-id="'+obj.id+'" ';
                    html += 'class="'+root.elements.itemClass+' shuffleItem '+objfilterclasses+'" ';
                    html += 'data-tags="'+obj.tags+'" data-cats="'+obj.cats+'" data-category="'+catreverse[0]+'">';
                    html += '<div class="itemcontent">';

                    html += '<div class="intro">';
                    if(obj.image && obj.image != ''){
                    html += obj.image;
                    }
                    html += '<h3>'+obj.title+'</h3>';
                    html += '<div class="excerpt">'+obj.excerpt+'</div>';
                    html += '</div>';

                    html += '<div class="main">'+obj.content+'</div>';

                    html += '</div>';
                    html += '<div>'+obj.tags+'</div>';
                    html += '<div>'+obj.cats+'</div>';
                    html += '<div class="matchweight"></div>';
                    html += '</div>';
                    oc++;
                }
            });

            if(  $('#'+root.elements.containerID).length < 1 ){
                $('body').append('<div id="'+root.elements.containerID+'"></div>');
            }
            $('#'+root.elements.containerID).addClass('shuffleContainer');

            $('#'+root.elements.containerID).append( html );

            root.activeFilterMenu( root.control.tagfilter );

            $('#'+root.elements.containerID).imagesLoaded( function(){

                    root.toggleLoadBox();
                    root.activateIsotope(); // reload isotope completely

            });
        };

        // add tag menu
		this.buildTagListMenu = function(){

            var tags = root.filterdata.alltags;
            if(  $('#'+root.elements.menuContainerID).length < 1 ){
                $('body').append('<div id="'+root.elements.menuContainerID+'"></div>');
            }
            $('#'+root.elements.menuContainerID).addClass('shuffleMenu');

			var tagmenu = '<div id="tag-filters">';
			for(i=0;i<tags.length;i++){
				tagmenu += '<a href="#tags='+tags[i]['slug']+'" class="tagbutton '+tags[i]['slug']+'" data-tag="'+tags[i]['slug']+'">'+tags[i]['name']+'</a>';
			}
			tagmenu += '</div>';
			$('#'+root.elements.menuContainerID).prepend(tagmenu);
		};

		// active tag menu
		this.activeFilterMenu = function( filter ){

			if( $('#'+root.elements.menuContainerID+' #active-filters').length < 1 ){
				$('#'+root.elements.menuContainerID).prepend('<div id="active-filters"></div>');
			}

			$('#'+root.elements.menuContainerID+' #tag-filters .tagbutton').each( function(){
				$(this).removeClass('selected');
				if( $.inArray( $(this).data('tag') , filter ) > -1 ){
					$(this).addClass('selected');
				}
			});
			$('#'+root.elements.menuContainerID+' #active-filters').html('');
			$('#'+root.elements.menuContainerID+' #tag-filters .tagbutton.selected').each( function(){
				$(this).clone().appendTo('#'+root.elements.menuContainerID+' #active-filters');
			});
			$('#'+root.elements.containerID+' .'+root.elements.itemClass).each( function(){
                root.control.selectedCat = '';
                if(root.control.queryID == $(this).data('id') ){
                    if( $(this).data('category') != ''){
                        root.control.selectedCat = $(this).data('category');
                    }
                    $(this).addClass('active');
                    //$(this).trigger('click');
                }
				root.newTagWeight( this, filter );
			});
            console.log(JSON.stringify(filter));
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
                //$(obj).hide();
            }

        };


        this.activateIsotope = function(){

            // init isotope
            var filterClass = root.getFilterClass();

            root.setColumnWidth();

            var container = $('#'+root.elements.containerID);
            container.isotope({

                itemSelector: '.'+root.elements.itemClass,
                layoutMode: 'masonry',
                animationEngine: 'best-available',
                transitionDuration: '0.9s',
                masonry: {
                    //isFitWidth: true,
                    columnWidth: root.elements.columnwidth,
                    gutter: 0,
                },
                getSortData: {
                    byCategory: function (elem) { // sort randomly
                            return $(elem).data('category') === root.control.selectedCat ? 0 : 1;
                    },
                    byTagWeight: '.matchweight parseInt',
                },
                sortBy : [ 'byCategory', 'byTagWeight' ],
                sortAscending: {
                          byCategory: true, // name ascendingly
                          byTagWeight: false, // weight descendingly
                },
            });

            container
            //.isotope('updateSortData')
            .isotope({ masonry: { columnWidth: root.elements.columnwidth } })
                .isotope({ filter: filterClass })
                .isotope({
                    sortBy : [ 'byCategory', 'byTagWeight' ], //'byTagWeight', //
                    sortAscending: {
                          byCategory: true, // name ascendingly
                          byTagWeight: false, // weight descendingly
                    },
                });
            /*
	        .isotope('reloadItems')
            .isotope({ masonry: { columnWidth: root.elements.columnwidth } })
            .isotope({ filter: filterClass })
            .isotope({
				sortBy : 'byTagWeight', // [ 'byCategory', 'byTagWeight' ], // 'byTagWeight', //
				sortAscending: {
					  //byCategory: true, // name ascendingly
					  byTagWeight: false, // weight descendingly
				},
			})
            .isotope( 'layout' );

			/* if more content loaded use:
            .isotope('updateSortData')
	        .isotope('reloadItems')*/

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

        this.setNewHash = function( ){
            var newhash = '#';
            if( root.control.tagfilter.length > 0 ){
                newhash += 'tags='+root.control.tagfilter.join();
            }
            if(root.control.queryID != false && root.control.queryID != typeof undefined
              && root.control.queryID != 'undefined'){
                newhash += '&pid='+root.control.queryID;
            }
            /*if( root.control.catfilter.length > 0 ){
                if(root.control.tagfilter.length > 0){
                    newhash += '&';
                }
                newhash += 'cats='+root.control.catfilter.join();
            }*/
            if(history.pushState) {
                history.pushState(null, null, newhash );
            }else{
                location.hash = newhash;
            }
            //root.control.selectedCat = $this.attr('data-category');
            //console.log( JSON.stringify(root.control.selectedCat));
        };



        this.getFilterClass = function(){
            var filterbyclass = '*';

			if( root.control.tagfilter.length > 0 ){
				filterbyclass = '.'+root.control.tagfilter.join(',.');
			}
            if( root.control.catfilter.length > 0 ){
				//filterbyclass = '.'+root.control.catfilter.join(',.');
			}
            return filterbyclass;
        };

        this.doneResizing = function(){

			root.setColumnWidth();

            $('#'+root.elements.containerID).isotope({ masonry: { columnWidth: root.elements.columnwidth } }).isotope( 'layout' );

		};

		this.setColumnWidth = function(){
            var f = $(window).width();
			var w = $('#'+root.elements.containerID).width();
			if(f > 640) {
			root.elements.columnwidth = w/3;
			}else{
			root.elements.columnwidth = w/2;
			}
        };

        $('body').on( 'click', '#'+root.elements.menuContainerID+' #tag-filters .tagbutton', function(event){

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}

    		var $this = $(this);

			var tag  = $this.attr('data-tag');

            $('.'+root.elements.itemClass).removeClass('active');

			$this.toggleClass('selected');

            root.control.selectedCat = '';

            root.control.queryID = false;

			root.control.tagfilter = [];
			$('#'+root.elements.menuContainerID+' #tag-filters .tagbutton.selected').each( function( index ){
				root.control.tagfilter[index] = $(this).data('tag');
			});

			root.activeFilterMenu( root.control.tagfilter );

			root.setNewHash();

			var filterClass = root.getFilterClass();

            root.setColumnWidth();

	  		var container = $('#'+root.elements.containerID);

            if(filterClass == '*'){

                //root.activateIsotope(); // reload isotope completely
                container
                .isotope({ filter: filterClass })
                .isotope({
                    sortBy : 'byTagWeight', //[ 'byCategory', 'byTagWeight' ],
                    sortAscending: {
                          //byCategory: true, // name ascendingly
                          byTagWeight: false, // weight descendingly
                    },
                });


            }else{

                container
                .isotope({ filter: filterClass })
                .isotope({
                    sortBy : 'byTagWeight', //[ 'byCategory', 'byTagWeight' ],
                    sortAscending: {
                          //byCategory: true, // name ascendingly
                          byTagWeight: false, // weight descendingly
                    },
                });
            }



	        $('html, body').animate({scrollTop:0}, 400);

  		});


		// on active filter click (tag)
		$('body').on( 'click', '#'+root.elements.menuContainerID+' #active-filters .tagbutton', function(event){
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
			$('#'+root.elements.menuContainerID+' #tag-filters .'+ $(this).data('tag') ).trigger('click');
		});

        // on container click (item)
		$('body').on('click', '.shuffleItem', function(event){
        //$('body').on( 'click', '#'+root.elements.containerID+' .'+root.elements.itemClass, function(event){

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}

    		var selected = $(this);

	  		var container = $('#'+root.elements.containerID);

            if( selected.hasClass('active') ){

                $('#'+root.elements.containerID+' .'+root.elements.itemClass).removeClass('active');

                root.control.tagfilter = root.filterdata.prevtagfilter;
                root.control.catfilter = root.filterdata.prevcatfilter;
                root.control.queryID = false;
                root.control.selectedCat = false;

            }else{

                root.filterdata.prevtagfilter = root.control.tagfilter;
                root.filterdata.prevcatfilter = root.control.catfilter;

                $('#'+root.elements.containerID+' .'+root.elements.itemClass).removeClass('active');
                selected.addClass('active');

                root.control.queryID = selected.data('id');

                if( selected.attr('data-category') && selected.attr('data-category') != ''){
                   root.control.selectedCat = selected.attr('data-category');
                }

                root.control.tagfilter = selected.attr('data-tags').split(',');

                //root.control.catfilter = selected.attr('data-cats').split(',');
                 container.prepend(selected);
            }

			root.activeFilterMenu( root.control.tagfilter );

			root.setNewHash();

			filterClass = root.getFilterClass();

            root.setColumnWidth();

			container
            .isotope('updateSortData')
            .isotope({ masonry: { columnWidth: root.elements.columnwidth } })
            .isotope({ filter: filterClass })
            .isotope({
				sortBy : 'byTagWeight', //[ 'byCategory', 'byTagWeight' ], //
				sortAscending: {
					  //byCategory: true, // name ascendingly
					  byTagWeight: false, // weight descendingly
				},
			});

	        $('html, body').animate({scrollTop:0}, 400);

  		});

        this.construct( options );

    }



	$(document).ready(function(){

        // setup dataloader with options array ['control'={}, 'elements'={}]
        var shuffle = new dataShuffle([
        {
            queryID             : false,
            tagfilter           : ['smart'],
            catfilter           : [],
            selectedCat         : '',
            loadedID            : [],
            ppload              : 999,
        },
        {
            containerID         : 'itemcontainer',// has '.shuffleContainer'
            itemClass           : 'sourceitem', // has '.shuffleItem'
            menuContainerID     : 'tagmenucontainer', // has '.shuffleMenu'
            loadmsgboxClass     : 'loadmsg',
            parentContainerID   : 'body',
            colinrowL           : 7,
            colinrowM           : 5,
            colinrowS           : 3,
            columnwidth         : 0,
        }]);
        /*
        var detectScrollbar = function () {
            if($(window).height() >= $(document).height()){
                $('#statusNotifier1').fadeIn("slow");
                $('#statusNotifier2').hide();
            }
            else
            {
                $('#statusNotifier1').hide();
                $('#statusNotifier2').fadeIn("slow");
            }
        };

        //call it initially
        detectScrollbar();

        //pass it to .resize() so it will be called when the event fires
        $(window).resize(detectScrollbar);
        */
	});

	$(window).load(function() {
    });

    $(document).ajaxStart(function() {
    });

    $(document).ajaxComplete(function() { // http://api.jquery.com/ajaxstop/

    });

});

