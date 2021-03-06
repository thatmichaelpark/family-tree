/* eslint camelcase: "off" */

(function() {
  'use strict';

  // For registration
  $('#register').click(() => {
    const email = $('#email').val();
    const password = $('#password').val();
    const confirm_password = $('#confirm-password').val();

    if (!email || !email.trim()) {
      return Materialize.toast('Please enter an email!', 4000);
    }

    if ($('#email').hasClass('invalid')) {
      return Materialize.toast('Email not valid!', 4000);
    }

    if (!password || !password.trim()) {
      return Materialize.toast('Please enter a password!', 4000);
    }

    if (password !== confirm_password) {
      return Materialize.toast('Passwords do not match!', 4000);
    }

    console.log('before ajax');
    $.ajax({
      method: 'POST',
      url: '/users',
      contentType: 'application/json',
      data: JSON.stringify({
        email,
        password
      })
    })
    .then(() => {
      console.log('second ajax');
      return $.ajax({
        method: 'POST',
        url: '/session/',
        contentType: 'application/json',
        data: JSON.stringify({
          email,
          password
        })
      })
    })
    .then(() => {
      window.location.href = '/add_self';
    })
    .catch((err) => {
      if (err.status === 409) {
        Materialize.toast('Email already registered! Please log in.', 4000);
      }
      else {
        Materialize.toast('Unable to log in!', 4000);
      }
    });
  });

  // For date of birth
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 150 // Creates a dropdown of 15 years to control year
  });

  $(document).ready(() => {
    $('select').material_select();
  });

  // For login
  $('#login').click(() => {
    const email = $('#login-email').val();
    const password = $('#login-password').val();

    if (!email || !email.trim()) {
      return Materialize.toast('Please enter an email.', 4000);
    }

    if (!password || !password.trim()) {
      return Materialize.toast('Please enter a password.', 4000);
    }

    $.ajax({
      method: 'POST',
      url: '/session/',
      contentType: 'application/json',
      data: JSON.stringify({
        email,
        password
      })
    })
    .then(() => {
      window.location.href = '/tree';
    })
    .catch(() => {
      Materialize.toast('Unable to log in!', 4000);
    });
  });
})();
