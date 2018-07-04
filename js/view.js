var WPView = function () {

    this.type = ''; // ui model
    this.init();

};

WPView.prototype = {

    init: function () {
        // onload
        this.enable();
    },
    enable: function () {
        window.alert('check');
    },

};

