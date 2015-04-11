// Back up!
/**
 * Implementation of adaptive energy voice activity detection.
 * http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.176.6740&rep=rep1&type=pdf
 */
;(function(factory) {
  if (typeof define === "function" && define.amd) {
    // AMD anonymous module
    // @TODO(Abe): Make sure this is right.
    define(["fft"], factory);
  } else {
    // No module loader (plain <script> tag) - put directly in global namespace
    factory(FFT);
  }
})(function(FFT) {

  var CONFIGURATION_PARAMETERS = {
    'SAMPLE_RATE': 44100,     // 44100 Hz or 44100 samples per second
    'FRAME_SIZE': 512,        // ~10 ms
    'PRIMARY_ENERGY_THRESHOLD': 40,   // somewhere between 0-1000000? This is weird.
    'PRIMARY_DOMINANT_FREQUENCY_THRESHOLD': 185,  // 185 Hz
    'PRIMARY_SPECTRAL_FLATNESS_THRESHOLD': 5,
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

    /**
     * sum(x(n)^2).
     * @param {array} frames sample of signal.
     * @return {int} short term energy.
     */
    function calculateEnergy(buffer) {
      var sumOfSquares = 0;
      for (var i = 0; i < buffer.length; ++i) {
        sumOfSquares += buffer[i] * buffer[i];
      }
      return sumOfSquares;
    }

    /**
     * 10 * log base 10 (G / A)
     * where G = geometric mean and A = arithmetic mean.
     * @param  {array} spectrum Array that is the frequency domain representation of a signal.
     * @return {int} spectral flatness.
     */
    function calculateSpectralFlatness(spectrum) {
      if (spectrum.length === 0) {
        return 0;
      }

      var i, geometricMean = 1, arithmeticMean = 0;

      // Calculate geometric mean.
      for (i = 0; i < spectrum.length; ++i) {
        if (!!spectrum[i]) {
          geometricMean *= spectrum[i];
        }
      }
      geometricMean = Math.pow(geometricMean, 1/spectrum.length);

      // Calculate arithmetic mean.
      for (i = 0; i < spectrum.length; ++i) {
        arithmeticMean += spectrum[i];
      }
      arithmeticMean /= spectrum.length;

      return 10 * Math.log(geometricMean / arithmeticMean) / Math.LN10;
    }

    /**
     * max(abs(spectrum)).
     * @param  {array} spectrum Array that is the frequency domain representation of a signal.
     * @return {int} Dominant frequency, or maximum absolute amplitude in frequency domain.
     */
    function findDominantFrequency(spectrum) {
      var i, maxI, maxIAbsValue = 0, absValue;
      for (i = 0; i < spectrum.length; ++i) {
        absValue = Math.abs(spectrum[i]);
        if (absValue > maxIAbsValue) {
          maxI = i;
          maxIAbsValue = absValue;
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
      var frameFFT = new FFT(buffer.length, CONFIG.SAMPLE_RATE);
      frameFFT.forward(buffer);
      console.log(frameFFT);
      var spectrum = frameFFT.spectrum;
      var energy = calculateEnergy(buffer);
      var dominantFrequency = findDominantFrequency(spectrum);
      var spectralFlatness = calculateSpectralFlatness(spectrum);
      return [energy, dominantFrequency, spectralFlatness];
    }

    /**
     * Test for the existence of vocals in a signal.
     * @param {array} buffer signal in the form of an array of amplitudes.
     * @return {boolean} true or false depending on the existence of voice in the buffer.
     */
    self.test = function(buffer) {
      var i, counter, successiveSilenceCount, successiveSpeechCount,
          subBuffer, features, numberOfFrames = buffer.length / CONFIG.FRAME_SIZE;

      // Not enough frames.
      if (numberOfFrames < 30) return false;

      // Make buffer values exist between 1-100.
      // for (i = 0; i < buffer.length; ++i) {
      //   buffer[i] *= 10000;
      // }
      // if (CONFIG.DEBUG) {
      //   console.debug(buffer);
      // }

      // Test the first 30 frames and find proper starting thresholds.
      for (i = 0; i < 30; ++i) {
        subBuffer = buffer.subarray(i * CONFIG.FRAME_SIZE, (i + 1) * CONFIG.FRAME_SIZE);
        features = getFeatures(subBuffer);
        // Use mean of energy.
        // See http://dsp.stackexchange.com/questions/2386/libraries-for-voice-activity-detection-not-speech-recognition.
        self.minEnergy += features[0] / 30;
        self.minDominantFrequency = Math.min(self.minDominantFrequency, features[1]) || features[1];
        self.minSpectralFlatness = Math.min(self.minSpectralFlatness, features[2]) || features[2];
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

        if (features[0] - self.minEnergy >= self.energyThreshold) {
          counter++;
          if (CONFIG.DEBUG) {
            // console.debug("Energy: " + features[0]);
            // console.debug("Minimum energy: " + self.minEnergy);
            // console.debug("Energy threshold: " + self.energyThreshold);
            // console.debug("Energy difference: " + (features[0] - self.minEnergy));
          }
        }

        // if (features[1] - self.minDominantFrequency >= self.dominantFrequencyThreshold) {
        //   counter++;
        //   if (CONFIG.DEBUG) {
        //     console.debug("Dominant frequency: " + features[1]);
        //     console.debug("Minimum dominant frequency: " + self.minDominantFrequency);
        //     console.debug("Dominant frequency threshold: " + self.dominantFrequencyThreshold);
        //     console.debug("Dominant frequency difference: " + (features[1] - self.minDominantFrequency));
        //   }
        // }

        if (features[2] - self.minSpectralFlatness >= self.spectralFlatnessThreshold) {
          counter++;
          if (CONFIG.DEBUG) {
            // console.debug("Spectral flatness: " + features[2]);
            // console.debug("Minimum spectral flatness: " + self.minSpectralFlatness);
            // console.debug("Spectral flatness threshold: " + self.spectralFlatnessThreshold);
            // console.debug("Spectral flatness difference: " + (features[2] - self.minSpectralFlatness));
          }
        }

        // Update minimum energy value.
        // This is the "adaptive" part.
        if (counter === 0) {
          successiveSpeechCount = 0;
          self.minEnergy = (successiveSilenceCount * self.minEnergy + features[0]) / (successiveSilenceCount + 1);
          if (++successiveSilenceCount == 10) return false;
        } else {
          successiveSilenceCount = 0;
          if (++successiveSpeechCount == 5) return true;
        }
      }

      return false;
    };
  };
});