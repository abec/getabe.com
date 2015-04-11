ko.bindingHandlers.select2 = {
  init: function(el, valueAccessor, allBindingsAccessor, viewModel) {
    ko.utils.domNodeDisposal.addDisposeCallback(el, function() {
      $(el).select2('destroy');
    });

    var allBindings = allBindingsAccessor(),
        select2 = ko.utils.unwrapObservable(allBindings.select2);

    ko.utils.arrayForEach(['data', 'tags'], function(member) {
      if (ko.isObservable(select2[member])) {
        select2[member].subscribe(function() {
          $(el).select2('destroy');
          $(el).select2(ko.toJS(select2));
        });
      }
    });

    $(el).select2(ko.toJS(select2));
  }
};