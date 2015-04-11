
window.DEFAULT_SAMPLE_SIZE = 4096;
window.DEFAULT_SAMPLE_RATE = 44100;

var Segment = function(channels, sample_size, sample_rate) {
  var self = this;

  var _sample_size = sample_size || DEFAULT_SAMPLE_SIZE;
  var _sample_rate = sample_rate || DEFAULT_SAMPLE_RATE;

  self.channels = ko.observableArray(channels);

  self.averageFFT = ko.computed(function() {
    // Get forward FFT spectrums for each channel.
    // This will contain the frequency domain representation
    // for this segment.
    var spectrums = self.channels().map(function(channelbuffer) {
      var fft = new FFT(_sample_size, _sample_rate);
      fft.forward(channelbuffer.subarray(channelbuffer.length - _sample_size));
      return fft.spectrum;
    });

    // Start calculating the average FFT across channels given for segment.
    // First accumulate each value in the spectrum.
    var accspec = spectrums.reduce(function(prevspec, curspec) {
      var nextspec = [];
      for (var i = 0; i < prevspec.length; ++i) {
        nextspec.push(prevspec[i] + curspec[i]);
      }
      return nextspec;
    });

    // Then divide each value in the spectrum by the number of channels.
    var size = self.channels().length;
    var avgspec = accspec.map(function(specval) {
      return specval / size;
    });

    return avgspec;
  });

  self.amplitudeVariance = ko.computed(function() {
    
  });
};

var ChineseWord = function(word, wave) {
  var self = this;

  self.word = ko.observable(word || null);
  self.wave = ko.observable(wave || null);
};

var ToneAggregatorViewModel = function() {
  var self = this;

  var WORDS = [
    "为什么"
  ];

  self.gender = ko.observable();
  self.native = ko.observable(false);
  self.words = ko.observableArray();

  self.index = ko.observable(0);
  self.word = ko.computed(function() {
    if (self.index() < self.words().length) {
      return self.words()[self.index()];
    } else {
      return null;
    }
  });
  self.genders = ko.observableArray(["male", "female"]);

  self.finished = ko.computed(function() {
    return self.index() >= self.words().length;
  });

  self.next = function() {
    self.index(self.index() + 1);
  };

  self.record = function() {
    var formData = new FormData();

    ko.utils.arrayForEach(self.words(), function(word) {
      if (!!word.wave()) {
        formData.append(word.word(), word.wave());
        // formData.append(word.word(), word.word());
      } else {
        console.debug('could not find recording for word ' + word.word());
      }
    });
    formData.append('native', self.native());
    formData.append('gender', self.gender());
    $.ajax({
      'url': '/tones/api/record/',
      'data': formData,
      'type': 'POST',
      'cache': false,
      'contentType': false,
      'processData': false
    });
  };

  ko.utils.arrayForEach(WORDS, function(word) {
    self.words.push(new ChineseWord(word, null));
  });
};

