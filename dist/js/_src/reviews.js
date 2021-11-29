function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function ($) {
  // Enable strict mode.
  'use strict'; // Define global SUI object if it doesn't exist.

  if ('object' !== _typeof(window.SUI)) {
    window.SUI = {};
  }

  SUI.reviews = function (review, reviews, rating) {
    if (reviews <= 0) {
      return;
    }

    function init() {
      var stars = Math.round(rating),
          starsBlock = review.find('.sui-reviews__stars')[0],
          i;

      for (i = 0; i < stars; i++) {
        starsBlock.innerHTML += '<span class="sui-icon-star" aria-hidden="true"></span> ';
      }

      review.find('.sui-reviews-rating').replaceWith(rating);
      review.find('.sui-reviews-customer-count').replaceWith(reviews);
    }

    init();
    return this;
  }; // Update the reviews with the live stats.


  $('.sui-2-11-2 .sui-reviews').each(function () {
    var review = $(this);
    $.ajax({
      url: "https://api.reviews.co.uk/merchant/reviews?store=wpmudev-org",
      success: function success(data) {
        SUI.reviews(review, data.stats.reviews, data.stats.average_rating);
      }
    });
  });
})(jQuery);