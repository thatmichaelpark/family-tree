/* eslint camelcase: "off" */

(function() {
  'use strict';

  let person;

  const saveClickHandler = function() {
    if ($('#choose-parents').val().length > 2) {
      return Materialize.toast('Maximum number of parents is two!', 4000);
    }
    const person_info = {
      given_name: $('#edit_given_name').val(),
      middle_name: $('#edit_middle_name').val(),
      family_name: $('#edit_family_name').val(),
      gender: $('#edit_gender').val()
    };

    if ($('#edit_dob').val()) {
      person_info.dob = $('#edit_dob').val();
    }

    $.ajax({ // update person
      method: 'PATCH',
      url: `/people/${person.id}`,
      contentType: 'application/json',
      data: JSON.stringify(person_info)
    })
    .then(() =>
      $.ajax({
        method: 'PATCH',
        url: `/parents_children/${person.id}`,
        contentType: 'application/json',
        data: JSON.stringify($('#choose-parents').val().map((parent) =>
          ({
            parent_id: parent,
            child_id: person.id
          })
        ))
      })
    )
    .then(() => {
      $('#modal1').closeModal();
      window.loadTreePage();
    })
    .catch(() => {
      Materialize.toast('Unable to save', 4000);
    }); // update person
  };

  const sendClickHandler = function() {
    const email = $('#invite-email').val();

    if (email.length === 0) {
      return Materialize.toast('Please enter email', 4000);
    }

    $.ajax({
      method: 'POST',
      url: '/email',
      contentType: 'application/json',
      data: JSON.stringify({ email })
    })
    .then(() => {
      Materialize.toast('Invitation sent!', 4000);
    })
    .catch(() => {
      Materialize.toast('Email failed', 4000);
    });
  };

  window.popUpEditModal = function(event) {
    const id = $(event.currentTarget).attr('data-id');

    $.ajax({  // GET info for clicked-on id.
      method: 'GET',
      url: `/people/${id}`
    })
    .then((data) => {
      person = data;
      let dob = '';

      if (person.dob) {
        const twoDigit = function(digit) {
          return `0${digit}`.slice(-2);
        };
        const date = new Date(person.dob);

        dob = `${date.getFullYear()}-${twoDigit(date.getMonth() + 1)}-${
          twoDigit(date.getDate())}`;
      }
      $('.modal-content').empty();
      $('.modal-content').append($(
        `
        <h4>Edit Family Member</h4>
        <div class="row">
          <div class="input-field col s4">
          <input value="${person.given_name}" id="edit_given_name" type="text"
            class="validate">
          <label class="active" for="edit_given_name">Given Name</label>
          </div>
        </div>
        <div class="row">
          <div class="input-field col s4">
          <input value="${person.middle_name}" id="edit_middle_name" type="text"
            class="validate">
          <label class="active" for="edit_middle_name">Middle Name</label>
          </div>
        </div>
        <div class="row">
          <div class="input-field col s4">
          <input value="${person.family_name}" id="edit_family_name" type="text"
            class="validate">
          <label class="active" for="edit_family_name">Family Name</label>
          </div>
        </div>
        <div class="row">
          <div class="input-field col s6">
            <input type="date" value="${dob}" class="datepicker" id="edit_dob">
            <label for="edit_dob" class="active">Date of Birth</label>
          </div>
          <div class="input-field col s6">
            <select id="edit_gender">
              <option value="" disabled selected>Gender</option>
              <option value="f">Female</option>
              <option value="m">Male</option>
              <option value="a">Agender</option>
              <option value="i">Intersex</option>
              <option value="p">Pangender</option>
              <option value="t">Transgender/Transsexual</option>
              <option value="s">Two-Spirit</option>
            </select>
            <label>Gender</label>
          </div>
        </div>
        <div class="row">
          <div class="input-field col s12">
            <select id="choose-parents" multiple>
              <option value="" disabled selected>Choose your parents</option>
            </select>
            <label>Choose Parents</label>
          </div>
        </div>
        <div class="row">
          <a id="save" class="waves-effect waves-light btn-large">Save</a>
        </div>
        <div class="row">
          <div class="col s6">
            <div class="card">
              <div class="card-content green-text">
                <p class="card-title">Invite Family Member to Baobab!</p>
                <div class="row">
                  <div class="input-field col s12">
                    <input id="invite-email" type="email" class="validate">
                    <label for="invite-email">Email</label>
                  </div>
                </div>
              </div>
              <div class="card-action">
                <a id="send" class="waves-effect waves-light btn-large">
                  Send invitation
                </a>
              </div>
            </div>
          </div>
        </div>
        `
      ));

      $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 150, // Creates a dropdown of 150 years to control year
        format: 'yyyy-mm-dd'
      });
      $(`#edit_gender option[value=${person.gender}]`).prop('selected', true);
      Materialize.updateTextFields();

      // Open edit modal
      return $.ajax({  // GET parent/child data
        method: 'GET',
        url: '/people',
        dataType: 'json'
      })
    })
    .then((people) => { // Populate dropdown parent menu
      for (const peep of people) {
        if (person.id === peep.id) { // the person being edited should not
                                     // be in the list of their parents
          continue;
        }
        $('#choose-parents').append(
          $('<option></option>').val(peep.id)
            .html(`${peep.given_name} ${peep.family_name}`));
      }

      return $.ajax({
        method: 'GET',
        url: `/people/${person.id}/parents`
      });
    })
    .then((parents) => {
      for (const parent of parents) {
        $(`#choose-parents option[value=${parent.parent_id}]`)
          .prop('selected', true);
      }

      $('select').material_select();
      $('#modal1').openModal();

      $('#send').click(sendClickHandler);

      $('#save').click(saveClickHandler);
    })
    .catch(() => {
      Materialize.toast('Unable to open edit window', 4000);
    });
  };

  $('#logout').click(() => {
    $.ajax({
      method: 'DELETE',
      url: '/session'
    })
    .then(() => {
      window.location.href = '/';
    })
    .catch(() => {
      Materialize.toast('Unable to log out!', 4000);
    });
  });
})();
