
var FlashCard = function(english, chinese, category) {
  var self = this;

  self.english = ko.observable(english);
  self.chinese = ko.observable(chinese);
  self.category = ko.observable(category);
};

var Game = function() {
  var self = this;

  self.cards = ko.observableArray();
  self.reverse = ko.observable(false);
  self.index = ko.observable(0);
  self.answered = ko.observable(false);
  self.currentCard = ko.computed(function() {
    if (self.cards().length == 0) {
      return null;
    }
    if (self.index() < 0 || self.index() >= self.cards().length) {
      self.index(0);
      self.shuffle();
    }
    return self.cards()[self.index()];
  });

  self.testAnswer = function(answer) {
    var regex = /[\,\;]/;
    var card = self.currentCard();
    var cardAnswers = (self.reverse()) ? card.question().split(regex) : card.answer().split(regex);
    for (var index in cardAnswers) {
      var cardAnswer = cardAnswers[index];
      if (answer.toLowerCase() == cardAnswer.toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  self.shuffle = function() {
    self.cards.sort(function(leftCard, rightCard) {
      return Math.random() - 0.5;
    });
  };

  self.next = function() {
    if (self.index() == self.cards().length - 1) {
      self.index(0);
      self.shuffle();
    } else {
      self.index(self.index() + 1);
    }
  };

  self.previous = function() {
    if (self.index() == 0) {
      self.index(self.cards().length - 1);
      self.shuffle();
    } else {
      self.index(self.index() - 1);
    }
  };

  self.reset = function() {
    self.index(0);
    self.answered(false);
    self.shuffle();
  };
};

var FlashCardsViewModel = function() {
  var self = this;

  self.game = new Game();
  self.cards = ko.observable();
  self.categories = {
    'list': ko.observableArray(),
    'selected': ko.observableArray()
  };
  self.add = {
    'category': ko.observable(),
    'cards': ko.observable()
  };

  self.cards.subscribe(function() {
    var categories = ko.utils.arrayMap(self.cards(), function(card) {
      return card.category();
    });
    self.categories.list(ko.utils.arrayGetDistinctValues(categories).sort());
  });

  var filterGameCards = function() {
    var cards = self.cards();
    cards = ko.utils.arrayFilter(cards, function(card) {
      return self.categories.selected.indexOf(card.category()) > -1;
    });
    self.game.cards(cards);
  };
  self.cards.subscribe(filterGameCards);
  self.categories.list.subscribe(filterGameCards);
  self.categories.selected.subscribe(filterGameCards);

  self.addCards = function() {
    return $.ajax({
      'type': 'POST',
      'url': '/flashcards/api/cards/',
      'data': ko.toJS(self.add)
    }).success(function(cards) {
      $(document).trigger('reset');
    });
  };

  self.load = function() {
    var left = function() {
      if (self.game.answered()) {
        self.game.answered(false);
      } else {
        self.game.answered(true);
        self.game.previous();
      }
    };

    var right = function() {
      if (self.game.answered()) {
        self.game.answered(false);
        self.game.next();
      } else {
        self.game.answered(true);
      }
    };

    var reset = function() {
      self.add.cards("");
      self.add.category("");
      $.ajax({
        'type': 'GET',
        'url': '/flashcards/api/cards/',
        'dataType': 'json',
        'contentType': "application/json; charset=utf-8"
      }).success(function(cards) {
        self.cards(ko.mapping.fromJS(cards || [])());
        self.game.reset();
      });
    };

    // Left and Right
    $(document).on('keyup', function(e) {
      if (e.keyCode == 39) {
        right();
      } else if (e.keyCode == 37) {
        left();
      }
    });

    // Swipe left and right.
    $(document).on('swipeleft', right);
    $(document).on('swiperight', left);

    // Reset
    $(document).on('reset', reset);

    $(document).trigger('reset');
  };
};
