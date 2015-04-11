// Back up!
/**
 * Implementation of adaptive energy voice activity detection.
 * http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.176.6740&rep=rep1&type=pdf
 */
;(function(factory) {
  if (typeof define === "function" && define.amd) {
    // AMD anonymous module
    // @TODO(Abe): Make sure this is right.
    define(["complex_array", "fft"], factory);
  } else {
    // No module loader (plain <script> tag) - put directly in global namespace
    factory(complex_array.ComplexArray);
  }
})(function(ComplexArray) {

  var CONFIGURATION_PARAMETERS = {
    'SAMPLE_RATE': 44100,     // 44100 Hz or 44100 samples per second
    'FRAME_SIZE': 512,        // ~10 ms
    'PRIMARY_ENERGY_THRESHOLD': 40,   // Decibel scale!
    'PRIMARY_DOMINANT_FREQUENCY_THRESHOLD': 185,  // 185 Hz
    'PRIMARY_SPECTRAL_FLATNESS_THRESHOLD': -3, // Decibel scale
    'DEBUG': false
  };

  window.VAD = function(config) {
    var self = this;

    var CONFIG = {};
    {
      config = config || {};
      for (var parameter in CONFIGURATION_PARAMETERS) {
        CONFIG[parameter] = config[parameter] || CONFIGURATION_PARAMETERS[parameter];
      }
    }

    self.minEnergy = null;
    self.minDominantFrequency = null;
    self.minSpectralFlatness = null;
    self.energyThreshold = null;
    self.dominantFrequencyThreshold = null;
    self.spectralFlatnessThreshold = null;

    function arithmeticMean(arr) {
      var sum = 0;
      for (var i = 0; i < arr.length; ++i) {
        sum += arr[i];
      }
      return sum / arr.length;
    }

    function geometricMean(arr) {
      var sum = 0;

      // Alternative calculation for geometric mean.
      // See http://en.wikipedia.org/wiki/Spectral_flatness for more info.
      for (var i = 0; i < arr.length; ++i) {
        if (!!arr[i]) {
          sum += Math.log(arr[i]);
        }
      }

      if (sum == 0) {
        return 0;
      }

      return Math.exp(sum / arr.length);
    }

    function averageBuffers(buffers) {
      var N = buffers.length,
          n = 0,
          mean, i, j;
      
      for (i = 0; i < N; ++i) {
        n = Math.max(n, buffers[i].length);
      }

      mean = new Float32Array(n);

      for (i = 0; i < n; ++i) {
        for (j = 0; j < N; ++j) {
          mean[i] += ( buffers[j][i] || 0 ) / N;
        }
      }

      return mean;
    }

    /**
     * sum(x(n)^2).
     * @param {array} frames sample of signal.
     * @return {int} short term energy in decibels.
     */
    function calculateEnergy(buffer) {
      var largest = 0,
          sumOfSquares = 0,
          n, i;
      for (i = 0; i < buffer.length; ++i) {
        n = Math.abs(buffer[i]);
        largest = Math.max(n, largest);
        sumOfSquares += Math.pow(buffer[i] * 1000, 2);
      }

      if (sumOfSquares === 0) {
        return 0;
      } else {
        return 10 * Math.log(sumOfSquares) / Math.LN10;
      }
    }

    /**
     * 10 * log base 10 (G / A)
     * where G = geometric mean and A = arithmetic mean.
     * @param  {array} spectrum Array of magnitudes of the frequency domain representation of a signal.
     * @return {int} spectral flatness in decibels. the lower the less noisy. The less flat as well.
     */
    function calculateSpectralFlatness(magnitudes) {
      var top = geometricMean(magnitudes),
          bottom = arithmeticMean(magnitudes);

      return 10 * Math.log(top / bottom) / Math.LN10;
    }

    /**
     * max(abs(spectrum)).
     * @param  {array} spectrum Array that is the frequency domain representation of a signal.
     * @return {int} Dominant frequency, or maximum absolute amplitude in frequency domain.
     */
    function findDominantFrequency(magnitudes) {
      var i, maxI = 0;
      for (i = 0; i < magnitudes.length; ++i) {
        if (magnitudes[i] > magnitudes[maxI]) {
          maxI = i;
        }
      }
      return maxI;
    }

    /**
     * Get short term energy, dominant frequency, and spectral flatness for a signal.
     * @param {array} buffer signal in the form of an array of amplitudes.
     * @return {array} short term energy, dominant frequency, and spectral flatness in that order.
     */
    function getFeatures(buffer) {
      var complexbuffer = new ComplexArray(buffer.length);
      complexbuffer.map(function(value, i, n) {
        value.real = buffer[i];
      });
      var spectrum = complexbuffer.FFT();
      var magnitudes = [];
      for (var i = 0; i < spectrum.length; ++i) {
        magnitudes.push(Math.pow(Math.pow(spectrum.real[i], 2) + Math.pow(spectrum.imag[i], 2), 1/2));
      }
      magnitudes = magnitudes.slice(0, buffer.length / 2);
      var energy = calculateEnergy(buffer);
      var dominantFrequency = findDominantFrequency(magnitudes);
      var spectralFlatness = calculateSpectralFlatness(magnitudes);
      return [energy, dominantFrequency, spectralFlatness];
    }

    /**
     * Test for the existence of vocals in a signal.
     * @param {array} buffer signal in the form of an array of amplitudes.
     * @return {boolean} true or false depending on the existence of voice in the buffer.
     */
    self.test = function() {
      var buffer = averageBuffers(arguments),
          numberOfFrames = buffer.length / CONFIG.FRAME_SIZE,
          counter,
          successiveSilenceCount,
          successiveSpeechCount,
          subBuffer,
          features,
          energyDifference,
          dominantFrequencyDifference,
          spectralFlatnessDifference,
          i;

      // Not enough frames.
      if (numberOfFrames < 30) return false;

      if (CONFIG.DEBUG) {
        console.debug(buffer);
      }

      // Test the first 30 frames and find proper starting thresholds.
      for (i = 0; i < 30; ++i) {
        subBuffer = buffer.subarray(i * CONFIG.FRAME_SIZE, (i + 1) * CONFIG.FRAME_SIZE);
        features = getFeatures(subBuffer);
        // Use mean of energy.
        // See http://dsp.stackexchange.com/questions/2386/libraries-for-voice-activity-detection-not-speech-recognition.
        self.minEnergy += features[0] / 30;
        self.minDominantFrequency = Math.min(self.minDominantFrequency, features[1]) || features[1];
        self.minSpectralFlatness = Math.max(self.minSpectralFlatness, features[2]) || features[2];
      }

      // Counter >= 1 => speech found for frame.
      successiveSilenceCount = 0;
      successiveSpeechCount = 0;
      for (; i < numberOfFrames; ++i) {
        counter = 0;
        subBuffer = buffer.subarray(i * CONFIG.FRAME_SIZE, (i + 1) * CONFIG.FRAME_SIZE);
        features = getFeatures(subBuffer);

        self.energyThreshold = CONFIG.PRIMARY_ENERGY_THRESHOLD * Math.log(self.minEnergy) / Math.LN10;
        self.dominantFrequencyThreshold = CONFIG.PRIMARY_DOMINANT_FREQUENCY_THRESHOLD / (CONFIG.SAMPLE_RATE / CONFIG.FRAME_SIZE);
        self.spectralFlatnessThreshold = CONFIG.PRIMARY_SPECTRAL_FLATNESS_THRESHOLD;

        energyDifference = features[0] - self.minEnergy;
        dominantFrequencyDifference = features[1] - self.minDominantFrequency;
        spectralFlatnessDifference = features[2] - self.minSpectralFlatness;

        if (CONFIG.DEBUG) {
          console.debug("Energy: " + features[0]);
          console.debug("Minimum energy: " + self.minEnergy);
          console.debug("Energy threshold: " + self.energyThreshold);
          console.debug("Energy difference: " + energyDifference);
          console.debug("");
          console.debug("Spectral flatness: " + features[2]);
          console.debug("Minimum spectral flatness: " + self.minSpectralFlatness);
          console.debug("Spectral flatness threshold: " + self.spectralFlatnessThreshold);
          console.debug("Spectral flatness difference: " + (features[2] - self.minSpectralFlatness));
          console.debug("");
        }

        if (energyDifference >= self.energyThreshold) {
          console.debug("Energy wins.");
          console.debug("");
          counter++;
        }

        // Seems bad.
        // if (features[1] - self.minDominantFrequency >= self.dominantFrequencyThreshold) {
        //   counter++;
        //   if (CONFIG.DEBUG) {
        //     console.debug("Dominant frequency: " + features[1]);
        //     console.debug("Minimum dominant frequency: " + self.minDominantFrequency);
        //     console.debug("Dominant frequency threshold: " + self.dominantFrequencyThreshold);
        //     console.debug("Dominant frequency difference: " + (features[1] - self.minDominantFrequency));
        //   }
        // }

        if (spectralFlatnessDifference <= self.spectralFlatnessThreshold) {
          console.debug("Spectral flatness wins.");
          console.debug("");
          counter++;
        }

        // Update minimum energy value.
        // This is the "adaptive" part.
        if (counter === 0) {
          successiveSpeechCount = 0;
          self.minEnergy = (successiveSilenceCount * self.minEnergy + features[0]) / (successiveSilenceCount + 1);
          if (++successiveSilenceCount == 20) return false;
        } else {
          successiveSilenceCount = 0;
          if (++successiveSpeechCount == 10) return true;
        }

        console.log("Successive speech count: " + successiveSpeechCount);
      }

      return false;
    };
  };
});