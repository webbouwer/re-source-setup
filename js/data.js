// data models


jQuery(function($) {

    var dataLoader = function(options){

        var root = this;

        this.settings = {
            containerID     : 'mycontainer',
            menuboxID       : 'mymenubox',
            itemClass       : 'myitemclass',
            tagbuttonClass  : 'mytagclass',
            catbuttonClass  : 'mycatclass',
            postIDprefix    : 'post-'
        };

        this.control = {
            currentID       : false,
            tagfilter       : [],
            catfilter       : [],
            prevfilter      : [],
            loadedID        : [],
            lastResult      : [],
            alltags         : [],
            allcats         : [],
            ppload          : 2
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

            $('.'+root.settings.itemClass).each( function( index ){

                if( $.inArray( $(this).data('id'), root.control.loadedID ) == -1 ){
                    root.control.loadedID.push( $(this).data('id') );
                }

            });
            console.log(root.control.loadedID);
        };

        /**
         * On active Filter
         */
        this.loadData = function(){

            root.filterData();

            if( root.control.loadedID.length < 10 ){

                var filter_data = {
                    'tagfilter' : root.control.tagfilter.join(),
                    'catfilter' : root.control.catfilter.join(),
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
                            root.markupData(result);
                        }
                    }
                });

            }

        };

        /**
         * Markup Data Result
         */
        this.markupData = function(result){

            root.control.lastResult = result;
            var html = '';
            $.each( result, function(idx,obj){
                if( $('[data-id='+obj.id+']').length > 0 ){
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
                    html += '<div class="itemcontent">'+obj.content+'</div>';
                    html += '<div>'+obj.tags+'</div>';
                    html += '<div>'+obj.cats+'</div>';
                    html += '<div class="matchweight">3</div>';
                    html += '</div>';
                }
            });
            $('#'+root.settings.containerID).append( html );
            //console.log(JSON.stringify(root));

        };


        this.construct(options); // load constructor

    }

    /**
     * Init
     */
    var myframe = new dataLoader({
            containerID     : 'pagecontainer',
            menuboxID       : 'datamenu',
            itemClass       : 'item',
            tagbuttonClass  : 'mytagclass',
            catbuttonClass  : 'mycatclass',
            postIDprefix    : 'post-'
    });

	$(document).ready(function(){

        // load data
        myframe.loadData();

        $('body').on('click', '.'+myframe.settings.itemClass, function(){
            myframe.loadData();
        });

	});

	$(window).load(function() {
    });

    $(document).ajaxStart(function() {
    });

    $(document).ajaxComplete(function() { // http://api.jquery.com/ajaxstop/
    });


});

