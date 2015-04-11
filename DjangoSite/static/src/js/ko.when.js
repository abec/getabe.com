ko.when = function(observable) {
  var deferred = $.Deferred(), value = observable.peek(), subs;
  if (value) {
    deferred.resolve(value);
  } else {
    subs = observable.subscribe(function(newValue) {
      if (newValue) {
        subs.dispose();
        deferred.resolve(newValue);
      }
    });
  }
  return deferred;
};