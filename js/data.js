/**
 * dataShuffle class
 * Dependency: JQuery, Isotope, (ajax file / Wordpress)
 * Masonry content-item grid ordered by tag weight (and categories)
 */
jQuery(function($) {

    var dataShuffle = function(options){

        var root = this, resizecheck, isotopecheck;

        this.control = {
            queryID             : false,
            tagfilter           : [],
            catfilter           : [],
            selectedID          : false, // selected post ID
            selectedCat         : false, // selected Category
            loadedID            : [], // loaded content id's (to not load again)
            loadedContent       : [], // loaded post data by id
            ppload              : 99, // items load max per page/shuffle
        };

        this.elements = {
            containerID         : 'itemcontainer',// '.shuffleContainer'
            itemClass           : 'item', // '.shuffleItem'
            filterMenuID        : 'filterbar', // '.shuffleMenu'
            loadmsgboxClass     : 'loadmsg',
            parentID            : 'maincontainer',// default parent
            colinrowL           : 4,
            colinrowM           : 3,
            colinrowS           : 2,
            columnwidth         : 0,
        };

        this.filterdata = {
            alltags             : filter_vars.filter_alltags,
            allcats             : filter_vars.filter_allcats,
            prevtagfilter       : [],
            prevcatfilter       : [],
        };

        this.construct = function( options ){

            // set settings
            $.extend( root.control , options[0]);
            $.extend( root.elements , options[1]);


            root.onEnable();

        };



        this.onEnable = function(){

            // filter
            root.getHashVars();
            root.buildTagListMenu();

            // data
            root.initData();

            // window listeners
            $(window).resize(function() {
				clearTimeout(root.resizecheck);
				root.resizecheck = setTimeout( root.doneResize, 20);
            });

        };

        this.doneResize = function(){

			/*root.getColumnWidth( root.elements.infoContainerID );
            $('#'+root.elements.infoContainerID).isotope({ masonry: { columnWidth: root.elements.columnwidth } }).isotope( 'layout' );
            */

            root.getColumnWidth( $('#'+root.elements.containerID) );
            $('#'+root.elements.containerID).isotope({ masonry: { columnWidth: root.elements.columnwidth } }).isotope( 'layout' );

		};



        this.initData = function( container = false ){

            if( !container ){
                var container = $('#'+root.elements.containerID);
            }

            root.loadData( function( result ){

                if( result[0] != 0 ){

                    var html = '',
                    c = 0;

                    $.each( result, function(idx,obj){

                        if( container.find('[data-id='+obj.id+']').length > 0 ){
                            // object is on screen
                        }else{
                            container.append( root.markupItemHTML( obj , c ) );
                        }
                        c++;

                    });
                }

                container.imagesLoaded( function(){

                    root.orderContent( container );

                });

            });
        };


        this.orderContent =  function( container ){


            root.activeFilterMenu( root.control.tagfilter );

            root.getColumnWidth( container );

            var filterByClass = root.getFilterClass();

            container.isotope({
                itemSelector: '.'+root.elements.itemClass,
                layoutMode: 'masonry',
                //animationEngine: 'best-available',
                transitionDuration: '0.6s',
                masonry: {
                    //columnWidth: root.elements.columnwidth,
                    gutter: 0,
                },
                getSortData: {
                    byCategory: function (elem) { // sort randomly
                            return $(elem).data('category') === root.control.selectedCat ? 0 : 1;
                    },
                    byTagWeight: '.matchweight parseInt',
                },
                sortBy : [ 'byCategory', 'byTagWeight' ],//'byTagWeight', //
                sortAscending: {
                          byCategory: true, // name ascendingly
                          byTagWeight: false, // weight descendingly
                },
            })
            .isotope('reloadItems')
            .isotope('updateSortData')
            .isotope({ filter: filterByClass });
            /*
            .isotope({ masonry: { columnWidth: root.elements.columnwidth } })
            .isotope( 'layout' );
            */
	        $('html, body').animate({scrollTop:0}, 400);

        }

        this.newTagWeight = function( obj ){

            var tagfilter = root.control.tagfilter;

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
                if( percent > 70 ){
                    newSize = 'size-l';
                }else if( percent > 30 ){
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

        this.getColumnWidth = function( container ){

            var f = $(window).width();
            var c = 1;
			var w = container.width();
            var n = w;

            $('body').removeClass('screenS screenM screenL');
			if( f > 900 ) {
                c  = root.elements.colinrowL;
                $('body').addClass('screenL');
			}else if(f > 640) {
                c  = root.elements.colinrowM;
                $('body').addClass('screenM');
			}else{
                c  = root.elements.colinrowS;
                $('body').addClass('screenS');
			}
            n = w/c;

            if( w < 420 && f > 640){
                n = w;
                container.addClass('column');
            }else{
                container.removeClass('column');
            }

            root.elements.columnwidth = n;

        };

        this.markupItemHTML = function( obj, c = false ){

            var html = '';

            root.control.loadedID.push( obj.id );
            root.control.loadedContent[obj.id] = obj;

            var objfilterclasses = '';
            $(obj.tags).each(function( x , tag ){
                objfilterclasses += ' '+tag;
            });
            $(obj.cats).each(function( x , cats ){
                objfilterclasses += ' '+cats;
            });
            var maincat = obj.cats; // obj.cats.reverse();
            if(c = 0){
                objfilterclasses += ' base';
            }

            html += '<div id="post-'+obj.id+'" data-id="'+obj.id+'" class="'+root.elements.itemClass+' shuffleItem '+objfilterclasses+'" ';
            html += 'data-author="'+obj.author+'" data-timestamp="'+obj.timestamp+'" ';
            html += 'data-tags="'+obj.tags+'" data-cats="'+obj.cats+'" data-category="'+maincat[0]+'">';
            html += '<div class="itemcontent">';
            html += '<div class="intro">';
            if(obj.image && obj.image != ''){
                html += obj.image;
            }
            html += '<div class="title"><h3>'+obj.title+'</h3></div>';
            html += '<div>'+obj.date+'</div>';
            html += '<div class="excerpt"></div>'; // not loading content yet ('+obj.excerpt+')
            html += '</div>';
            html += '<div class="main"></div>'; // not loading content yet ('+obj.content+')
            html += '</div>';
            html += '<div>'+obj.cats+'</div>';
            html += '<div>'+obj.tags+'</div>';
            html += '<div class="matchweight"></div>';
            html += '</div>';

            //container.append( JSON.stringify(obj) );
            return(html);
        }

        this.loadData = function( callback = false ){

            var get_filter = root.getFilterData();

            $.ajax({
                url: filter_vars.filter_ajax_url,
                data:{
                    'action': 'multi_filter', // function to execute ( data.php - WPData() class )
                    'filter_nonce': filter_vars.filter_nonce, // wp_nonce
                    'filter_data': get_filter, // selected data filters
                }, // form data
                dataType: 'json',
                type: 'POST', // POST
                beforeSend:function(xhr){
                    root.setLoadBox();
                },
                success:function(result){
                    callback(result);
                    root.removeLoadBox();
                }
            });

        };


        this.getFilterData = function(){

            $.extend( root.filterdata , {
                'queryID'       : root.control.queryID,
                'tagfilter'     : root.control.tagfilter,
                'catfilter'     : root.control.catfilter,
                'selectedCat'   : root.control.selectedCat,
                'loadedID'      : root.control.loadedID,
                'ppload'        : root.control.ppload,
            });
            return root.filterdata;

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


        this.setLoadBox = function(){
            if( $('.loadbox').length < 1 ){
                $('body').append('<div class="'+root.elements.loadmsgboxClass+' loadbox">loading..</div>');
            }else{
                $('.loadbox').remove();
            }
        };

        this.removeLoadBox = function(){
            if( $('.loadbox').length > 0 ){
                $('.loadbox').remove();
            }
        };


        this.getHashVars = function(){

            var queryID = root.control.queryID;
            var selectedCat = root.control.selectedCat;
            var ppload = root.control.ppload;

            var tagfilter = root.control.tagfilter;
            var catfilter = root.control.catfilter;

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
                        root.control.catfilter = catfilter;
                    }
                    if( hashvars.pid && hashvars.pid != '' && hashvars.pid != 'undefined' && hashvars.pid != typeof undefined){
                        root.control.selectedID = hashvars.pid;
                    }

                    if( hashvars.category && hashvars.category != '' && hashvars.category != 'undefined' && hashvars.category != typeof undefined){
                        root.control.selectedCat = hashvars.category;
                    }
                    if( hashvars.ppl && hashvars.ppl != '' && hashvars.ppp != 'undefined' && hashvars.ppl != typeof undefined){
                        root.control.ppload = hashvars.ppl;
                    }

            }

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
        };

        this.setNewHash = function(){

            var newhash = '#';
            if( root.control.tagfilter.length > 0 ){
                newhash += 'tags='+root.control.tagfilter.join();
            }
            if( root.control.catfilter.length > 0 ){
                if(root.control.tagfilter.length > 0){
                    newhash += '&';
                }
                newhash += 'cats='+root.control.catfilter.join();
            }
            if(root.control.selectedID != false && root.control.selectedID != typeof undefined
              && root.control.selectedID != 'undefined'){
                newhash += '&pid='+root.control.selectedID;
            }
            if(root.control.selectedCat != false && root.control.selectedCat != typeof undefined
              && root.control.selectedCat != 'undefined'  && root.control.selectedCat != ''){
                newhash += '&category='+root.control.selectedCat;
            }
            if(root.control.ppload != false && root.control.ppload != typeof undefined
              && root.control.ppload != 'undefined'){
                newhash += '&ppl='+root.control.ppload;
            }

            if(history.pushState) {
                history.pushState(null, null, newhash );
            }else{
                location.hash = newhash;
            }

        };

        // add tag menu
		this.buildTagListMenu = function(){

            var tags = root.filterdata.alltags;
            if(  $('#'+root.elements.filterMenuID).length < 1 ){
                $('body').append('<div id="'+root.elements.filterMenuID+'"></div>');
            }
            $('#'+root.elements.filterMenuID).addClass('shuffleMenu');

			var tagmenu = '<div id="tag-filters">';
			for(i=0;i<tags.length;i++){
				tagmenu += '<a href="#tags='+tags[i]['slug']+'" class="tagbutton '+tags[i]['slug']+'" data-tag="'+tags[i]['slug']+'">'+tags[i]['name']+'</a>';
			}
			tagmenu += '</div>';
			$('#'+root.elements.filterMenuID).prepend(tagmenu);
		};

		// active tag menu
		this.activeFilterMenu = function( filter ){

			if( $('#'+root.elements.filterMenuID+' #active-filters').length < 1 ){
				$('#'+root.elements.filterMenuID).prepend('<div id="active-filters"></div>');
			}

			$('#'+root.elements.filterMenuID+' #tag-filters .tagbutton').each( function(){
				$(this).removeClass('selected');
				if( $.inArray( $(this).data('tag') , filter ) > -1 ){
					$(this).addClass('selected');
				}
			});

			$('#'+root.elements.filterMenuID+' #active-filters').html('');

			$('#'+root.elements.filterMenuID+' #tag-filters .tagbutton.selected').each( function(){
				$(this).clone().appendTo('#'+root.elements.filterMenuID+' #active-filters');
			});

            root.control.selectedCat = '';
			$('#'+root.elements.containerID+' .'+root.elements.itemClass).each( function(){

                $(this).removeClass('active');
                root.control.selectedCat = '';

                if(root.control.selectedID == $(this).data('id') ){
                    if( $(this).data('category') != ''){
                        root.control.selectedCat = $(this).data('category');
                    }
                    $(this).addClass('active').prependTo( $('#'+root.elements.containerID) );
                    //$(this).trigger('click');
                }
				root.newTagWeight( this, filter );

			});

            console.log(JSON.stringify(filter));

        };


        $('body').on( 'click', '#'+root.elements.filterMenuID+' #tag-filters .tagbutton', function(event){

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}

    		var $this = $(this);

            var container = $('#'+root.elements.containerID);

			var tag  = $this.attr('data-tag');

            $('.'+root.elements.itemClass).removeClass('active');

			$this.toggleClass('selected');

            root.control.queryID = false;

            root.control.selectedID = false;

            root.control.selectedCat = '';

			root.control.tagfilter = [];

			root.control.catfilter = [];

			$('#'+root.elements.filterMenuID+' #tag-filters .tagbutton.selected').each( function( index ){
				root.control.tagfilter[index] = $(this).data('tag');
			});

            root.initData( container );

            root.setNewHash();


  		});

        // on active filter click (tag)
        $('body').on( 'click', '#'+root.elements.filterMenuID+' #active-filters .tagbutton', function(event){
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            $('#'+root.elements.filterMenuID+' #tag-filters .'+ $(this).data('tag') ).trigger('click');
        })

        $('body').on('click', '.shuffleItem', function(event){
        //$('body').on( 'click', '#'+root.elements.containerID+' .'+root.elements.itemClass, function(event){

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}

    		var selected = $(this);

	  		var container = selected.parent();

            root.control.selectedID = false;

            root.control.selectedCat = '';


            if( selected.hasClass('active') && !selected.parent().hasClass('sidebar') ){

                $('#'+root.elements.containerID+' .'+root.elements.itemClass).removeClass('active');

                root.control.tagfilter = root.filterdata.prevtagfilter;
                root.control.catfilter = root.filterdata.prevcatfilter;

            }else{

                root.filterdata.prevtagfilter = root.control.tagfilter;
                root.filterdata.prevcatfilter = root.control.catfilter;
                root.control.selectedID = selected.data('id');

                if( selected.attr('data-category') && selected.attr('data-category') != ''){
                   root.control.selectedCat = selected.attr('data-category');
                }

                root.control.tagfilter = selected.attr('data-tags').split(',');
                root.control.catfilter = selected.attr('data-cats').split(',');

            }


            root.initData( container );

            root.setNewHash();

        });

        this.construct( options );

    }

    $(document).ready(function(){


        var shuffle = new dataShuffle([
            {   // root.control
                queryID             : false,
                tagfilter           : [],
                catfilter           : [],
                ppload              : 25, // items load max per page/shuffle

                // selectedID for selected filter
                // setedCat for selected filter
            },
            {   // root.elements
                containerID         : 'itemcontainer',// '.shuffleContainer'
                itemClass           : 'item', // '.shuffleItem'
                filterMenuID        : 'filterbar', // '.shuffleMenu'
                loadmsgboxClass     : 'loadmsg',
                parentID            : 'maincontainer',// default parent
                colinrowL           : 4,
                colinrowM           : 3,
                colinrowS           : 2,
                columnwidth         : 0,
        }]);

	});
    $(window).load(function() {
   });

});

