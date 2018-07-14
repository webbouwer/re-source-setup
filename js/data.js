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
            columnwidth     : 0,
        }

        this.filterdata = {
            alltags : filter_vars.filter_alltags,
            allcats : filter_vars.filter_allcats
        }

        this.construct = function(options){

            // set settings
            $.extend( this.control , options);

            // base filter or hash tags
            var tagfilter = root.control.tagfilter;
            var catfilter = root.control.catfilter;
            var selectedCat = root.control.selectedCat;
            if(window.location.hash){
                    var hashvars = root.getHashUrlVars();
                    if( hashvars.tags  ){
                        tagfilter = hashvars.tags.split(',');
                    }
                    if(tagfilter.length > 0 ){
                        root.control.tagfilter = tagfilter;
                    }
                    if( hashvars.c != '' ){
                        root.control.selectedCat = hashvars.c;
                    }
            }//.. catfilter
            root.setNewHash( );

            this.buildTagListMenu();

            this.getDataByFilter();


            $(window).resize(function() {
				clearTimeout(root.resizecheck);
				root.resizecheck = setTimeout( root.doneResizing, 20);
            });

        };

        this.toggleLoadBox = function(){
            if( $('.loadbox').length < 1 ){
                $('body').append('<div class="loadbox">loading..</div>');
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
                    root.toggleLoadBox();
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
                    html += 'class="'+root.elements.itemClass+' '+objfilterclasses+'" ';
                    html += 'data-tags="'+obj.tags+'" data-cats="'+obj.cats+'" data-category="'+catreverse[0]+'">';
                    html += '<div>'+obj.title+'</div>';
                    html += '<div class="itemcontent">';
                    html += '<div class="intro">'+obj.excerpt+'</div>';
                    //html += '<div class="main">'+obj.content+'</div>';
                    html += '</div>';
                    html += '<div>'+obj.tags+'</div>';
                    html += '<div>'+obj.cats+'</div>';
                    html += '<div class="matchweight"></div>';
                    html += '</div>';
                    oc++;
                }
            });
            $('#'+root.elements.containerID).append( html );

            root.activeFilterMenu( root.control.tagfilter );
            root.activateIsotope(); // reload isotope completely
        };

        // add tag menu
		this.buildTagListMenu = function(){

            var tags = root.filterdata.alltags;
			var tagmenu = '<div id="tag-filters">';
			for(i=0;i<tags.length;i++){
				tagmenu += '<a href="#tags='+tags[i]['slug']+'" class="tagbutton '+tags[i]['slug']+'" data-tag="'+tags[i]['slug']+'">'+tags[i]['name']+'</a>';
			}
			tagmenu += '</div>';
			$('body').prepend(tagmenu);
		};

		// active tag menu
		this.activeFilterMenu = function( filter ){

			if( $('#active-filters').length < 1 ){
				$('body').prepend('<div id="active-filters"></div>');
			}

			$('#tag-filters .tagbutton').each( function(){
				$(this).removeClass('selected');
				if( $.inArray( $(this).data('tag') , filter ) > -1 ){
					$(this).addClass('selected');
				}
			});
			$('#active-filters').html('');
			$('#tag-filters .tagbutton.selected').each( function(){
				$(this).clone().appendTo('#active-filters');
			});
			$('.item').each( function(){
				root.newTagWeight( this, filter );
			});

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

            $('#'+root.elements.containerID).isotope({

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
                sortBy : 'byTagWeight', //[ 'byCategory', 'byTagWeight' ],
                sortAscending: {
                          //byCategory: true, // name ascendingly
                          byTagWeight: false, // weight descendingly
                },
            })
            .isotope({ filter: filterClass })
            .isotope({
				sortBy : [ 'byCategory', 'byTagWeight' ], // 'byTagWeight', //
				sortAscending: {
					  byCategory: true, // name ascendingly
					  byTagWeight: false, // weight descendingly
				},
			});
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
            if(root.control.selectedCat.length > 0){
                newhash += '&c='+root.control.selectedCat;
            }
            if( root.control.catfilter.length > 0 ){
                if(root.control.tagfilter.length > 0){
                    newhash += '&';
                }
                newhash += 'cats='+root.control.catfilter.join();
            }
            if(history.pushState) {
                history.pushState(null, null, newhash );
            }else{
                location.hash = newhash;
            }
            //root.control.selectedCat = $this.attr('data-category');
            console.log( JSON.stringify(root.control.selectedCat));
        };

        this.getFilterClass = function(){
            var filterbyclass = '*';
			if( root.control.tagfilter.length > 0 ){
				filterbyclass = '.'+root.control.tagfilter.join(',.');
			}
            if( root.control.catfilter.length > 0 ){
				filterbyclass = '.'+root.control.catfilter.join(',.');
			}
            return filterbyclass;
        };

        this.doneResizing = function(){

			root.setColumnWidth();
			$('#'+root.elements.containerID).isotope({ masonry: { columnWidth: root.elements.columnwidth } }).isotope( 'layout' );

		};

		this.setColumnWidth = function(){

			var w = $('#'+root.elements.containerID).width();
			if(w > 640) {
			root.elements.columnwidth = w/3;
			}else{
			root.elements.columnwidth = w/2;
			}

        };

        this.construct(options);

    }



	$(document).ready(function(){

        // setup dataloader
        var shuffle = new dataShuffle({
            tagfilter     : [],
            catfilter     : []
        });

        $('body').on( 'click', '#tag-filters .tagbutton', function(event){

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}

    		var $this = $(this);
			var tag  = $this.attr('data-tag');

            $('.item').removeClass('active');

			$this.toggleClass('selected');

            shuffle.control.selectedCat = '';

			shuffle.control.tagfilter = [];
			$('#tag-filters .tagbutton.selected').each( function( index ){
				shuffle.control.tagfilter[index] = $(this).data('tag');
			});


			shuffle.activeFilterMenu( shuffle.control.tagfilter );

			shuffle.setNewHash();

			filterClass = shuffle.getFilterClass();

            shuffle.setColumnWidth();
	  		container = $('#'+shuffle.elements.containerID);
			container
            .isotope({ masonry: { columnWidth: shuffle.elements.columnwidth } })
            .isotope({ filter: filterClass })
            .isotope({
				sortBy : 'byTagWeight', //[ 'byCategory', 'byTagWeight' ],
				sortAscending: {
					  //byCategory: true, // name ascendingly
					  byTagWeight: false, // weight descendingly
				},
			});

	        $('html, body').animate({scrollTop:0}, 400);

  		});


		// on active filter click (tag)
		$('body').on( 'click', '#active-filters .tagbutton', function(event){
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
			$('#tag-filters .'+ $(this).data('tag') ).trigger('click');
		});

        // on container click (item)
		$('body').on('click', '.item', function(event){

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}

    		var selected = $(this);

			$('.item').removeClass('active');

			selected.addClass('active');

            if( selected.attr('data-category') && selected.attr('data-category') != ''){
    		   shuffle.control.selectedCat = selected.attr('data-category');
            }

			shuffle.control.tagfilter = selected.attr('data-tags').split(',');

			shuffle.activeFilterMenu( shuffle.control.tagfilter );

			shuffle.setNewHash();

			filterClass = shuffle.getFilterClass();

            shuffle.setColumnWidth();
	  		container = $('#'+shuffle.elements.containerID);
			container.prepend(selected);
			container
            .isotope('updateSortData')
            .isotope({ masonry: { columnWidth: shuffle.elements.columnwidth } })
            .isotope({ filter: filterClass })
            .isotope({
				sortBy : [ 'byCategory', 'byTagWeight' ], // 'byTagWeight', //
				sortAscending: {
					  byCategory: true, // name ascendingly
					  byTagWeight: false, // weight descendingly
				},
			});

	        $('html, body').animate({scrollTop:0}, 400);

  		});

	});

	$(window).load(function() {
    });

    $(document).ajaxStart(function() {
    });

    $(document).ajaxComplete(function() { // http://api.jquery.com/ajaxstop/

    });

});

