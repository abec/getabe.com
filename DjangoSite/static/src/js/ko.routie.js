
;(function(factory) {
  if (typeof define === "function" && define.amd) {
    // AMD anonymous module
    define(["knockout", "jquery"], factory);
  } else {
    // No module loader (plain <script> tag) - put directly in global namespace
    factory(window.ko, jQuery);
  }
})(function(ko, $) {
  var routes = {};

  ko.routie = {
    'configure': function(config) {
      ko.utils.extend(CONFIG, config);
    },
    'start': function() {
      ko.utils.arrayForEach(ko.routie.config.pages, function(page) {
        routie(page.url, function() {
          if (page.validator.apply(page, arguments)) {
            page.fn.apply(page, []);

            // Hide all pages
            ko.utils.arrayForEach(ko.routie.config.pages, function(page) {
              $(page.el).hide();
            });
            // Show page
            $(page.el).show();
          } else {
            window.history.back();
          }
        });
      });
      routie(ko.routie.config.start);
    },
    'config': {
      'pages': [],
      'start': '!/start'
    }
  };

  ko.bindingHandlers.routie = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var config = ko.utils.unwrapObservable(valueAccessor());
      if ($.type(config) == "string") {
        config = {'url': config};
      }
      ko.routie.config.pages.push({
        'url': config.url,
        'fn': config.fn || $.noop,
        'el': element,
        'validator': config.validator || function() {return true;}
      });
    }
  };

  ko.bindingHandlers.hash = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      $(element).click(function() {
        var obj = ko.utils.unwrapObservable(valueAccessor());
        var url = null;
        var bubble = false;
        if ($.isPlainObject(obj)) {
          url = obj.url;
          bubble = !!obj.bubble;
        } else {
          url = obj;
        }
        routie(url);
        return bubble;
      });
    }
  };
});