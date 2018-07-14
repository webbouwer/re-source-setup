jQuery(function($) {

    // data models
    var dataShuffle = function(options){

        var root = this, resizecheck;

        this.control = {
            queryID         : false,
            tagfilter       : [],
            catfilter       : [],
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

            // hash tags
            var tagfilter = root.control.tagfilter;
            if(window.location.hash) {
                var hashvars = root.getHashUrlVars();
                if( hashvars.tags  ){
                    tagfilter = hashvars.tags.split(',');
                }
            }
            if(tagfilter.length > 0 ){
                root.setNewHash( tagfilter.join() );
                root.control.tagfilter = tagfilter;
            }

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
                    html += '<div id="post-'+obj.id+'" data-id="'+obj.id+'" ';
                    html += 'class="'+root.elements.itemClass+' '+filterclass+'" ';
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
            $('#'+root.elements.containerID).append( html );
            root.activateIsotope();
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
				$(this).removeClass('active');
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
            root.setColumnWidth;

            $('#'+root.elements.containerID).isotope({

                itemSelector: '.'+root.elements.itemClass,
                layoutMode: 'masonry',
                animationEngine: 'best-available',
                transitionDuration: '0.8s',
                masonry: {
                    //isFitWidth: true,
                    columnWidth: root.elements.columnwidth,
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
            })


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
                newhash += 'tags='+root.control.tagfilter.join()+'&';
            }
            if( root.control.catfilter.length > 0 ){
                newhash += 'cats='+root.control.catfilter.join();
            }
            if(history.pushState) {
                history.pushState(null, null, newhash );
            }else{
                location.hash = newhash;
            }
            console.log( JSON.stringify(root.control.tagfilter));
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

        this.construct();

    }

	$(document).ready(function(){

        // init dataloader
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
			$this.toggleClass('selected');

			shuffle.control.tagfilter = [];
			$('#tag-filters .tagbutton.selected').each( function( index ){
				shuffle.control.tagfilter[index] = $(this).data('tag');
			});

			shuffle.activeFilterMenu( shuffle.control.tagfilter );

			shuffle.setNewHash();

			filterClass = '*';
			if( shuffle.control.tagfilter.length > 0 ){
				filterClass = '.'+shuffle.control.tagfilter.join(',.');
			}

            shuffle.setColumnWidth;

	  		container = $('#'+shuffle.elements.containerID);
			container.isotope({ filter: filterClass })
            .isotope({ masonry: { columnWidth: root.elements.columnwidth } })
			.isotope('updateSortData')
	        .isotope('reloadItems')
	        .isotope({
				sortBy : 'byTagWeight', //[ 'byCategory', 'byTagWeight' ],
				sortAscending: {
					  //byCategory: true, // name ascendingly
					  byTagWeight: false, // weight descendingly
				},
			})
            .isotope( 'layout' );

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

	});

	$(window).load(function() {
    });

    $(document).ajaxStart(function() {
    });

    $(document).ajaxComplete(function() { // http://api.jquery.com/ajaxstop/

    });

});

