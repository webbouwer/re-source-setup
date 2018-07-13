// data models


jQuery(function($) {

    var dataLoader = function(options){

        var root = this;

        this.settings = {
            containerID     : 'pagecontainer',
            menuboxID       : 'datamenu',
            searchFieldID   : 'searchbar',
            itemClass       : 'item',
            tagbuttonClass  : 'taglink',
            catbuttonClass  : 'categorylink',
            postIDprefix    : 'post-'
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

        };

        /**
         * Status
         */
        this.filterData = function(){
            // scan screen filters
            root.control.tagfilter = ['smart','wannabee','mega'];
            console.log(root.control.loadedID);
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
                            root.sortMarkupByTagweight();

                        }
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
                $(obj).addClass(newSize).fadeIn();
            }else{
                $(obj).fadeOut();
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
				filterClass = '.'+root.control.tagfilter.join(',.');
			}

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

        };

        this.construct(options); // load constructor

    } // end Class dataLoader





    /**
     * Init
     */
    var frameload = new dataLoader({
            containerID     : 'pagecontainer',
            menuboxID       : 'datamenu',
            searchFieldID   : 'searchbar',
            itemClass       : 'item',
            tagbuttonClass  : 'taglink',
            catbuttonClass  : 'categorylink',
            postIDprefix    : 'post-'
    });

	$(document).ready(function(){

        // load data
        frameload.loadData();

        $('body').on('click', '.'+frameload.settings.itemClass+',body', function(){
            frameload.loadData();
        });

	});

	$(window).load(function() {
    });

    $(document).ajaxStart(function() {
    });

    $(document).ajaxComplete(function() { // http://api.jquery.com/ajaxstop/
    });


});

