'use strict';
let formForNames = document.querySelector('.formForNames');
let hideButton = document.querySelector('.hide');
let isVisible = true;

function trigger() {
  isVisible = !isVisible;
  formForNames.style.display = isVisible ? "block" : "none";
}

hideButton.addEventListener('click', trigger);


function getUrl(method, params) {
  if (!method) throw new Error('No method!')
  params = params || {};
  params['access_token'] = 'vk1.a.0MPuaWxpVIuii3gjbMx0fe9Uvk6OCYB-oto6z8yoAhO9kaYXZf5rzahhShBuBx2Zuc2zgtWJNwXdr7BXXVvE9OuiIKy2ddOWp_pODjJoEe65C8E2zejetNiPI8_FT7jICPHCW91IIgbP_j9EjyzQ8hOgsJXHb4jFqjCc2GkUQooYyRyLjIdba_-Ah_OpUweooT1095uMGBryLTui0xp6pA';
  return 'https://api.vk.com/method/' + method + '?' + $.param(params) + '&v=5.131'
} // Server request p1.

function sendRequest(method, params, func) {
  $.ajax({
    url: getUrl(method, params),
    method: 'GET',
    dataType: 'JSONP',
    success: func
  })
} // Server request p2.

let loadButton = document.getElementById('load');
loadButton.addEventListener('click', loadFriends); // Button for load friends list


document.addEventListener("click", function (event) {
  event.preventDefault();
  if (event.target.classList.contains("open-detail") || event.target.closest(".open-detail")) {
    let id = +event.target.getAttribute('data-id');
    // console.log('Users id: ',id);
    sendRequest('users.get', { user_ids: id, fields: 'sex,bdate,country,city,online,last_seen,photo_max' },
      drawDetailedFriend)
  }
}); // Button for show details of friend. Working without jqery.

// $(document).on('click', '.open-detail', function(event){
//   event.preventDefault();
// let id = +$(event.target).data('id');
// console.log(id);
// }) // Working with jquery

$('#sendMessage').on('click', sendMessage); // Send message to friend


function loadFriends() {
  sendRequest('friends.search', { count: 1000, fields: 'photo_100, online, last_seen' }, function (data) {
    drawFriends(data.response.items, data.response.count)
  });
} // Here we ask for basic data about friends.

function drawFriends(friends, count) {
  console.log('Data of friends: ', friends, 'Friends: ', count);
  let html = '';

  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    let online = friend.online ? 'online' : 'offline'; // friend onlie or offline
    let lastSeen = friend.last_seen ? new Date(friend.last_seen.time * 1000) : '<br><br>';

    html += '<li class="' + online + '">' +
      '<a href="#">' +
      '<img src="' + friend.photo_100 + '"></img>' +
      '<div>' +
      '<h4>' + friend.first_name + ' ' + friend.last_name + '</h4>' +
      '<p>' + online + '</p>' +
      '<p>' + lastSeen + '</p>' +
      '<button data-id="' + friend.id + '"class="open-detail modal">Details</button>'
    '</div>' +
      '</a>' +
      '</li>';
  }

  $('.friendList').html(html);

} // Drawing basic data about friends.

function drawDetailedFriend(data) {

  let user = data.response[0];
  let $detail = $('.detail');
  let country = user.country != undefined ? user.country.title : 'Country not specified';

  let sex = '';
  if (user.sex == 1) {
    sex = 'Women';
  }
  if (user.sex == 2) {
    sex = 'Men';
  }
  if (user.sex == 0) {
    sex = 'No sex';
  }

  //user.sex == 1 ? 'Woman' : 'Men';
  let online = user.online == 1 ? 'Yes' : 'No';
  let city = user.city == undefined ? 'City not specified' : user.city.title;
  let lastSeen = user.last_seen == undefined ? 'No info' : user.last_seen;
  // let lastSeen = friend.last_seen ? new Date(friend.last_seen.time * 1000) : 'no info';
  let time = lastSeen.time == undefined ? '' : new Date(lastSeen.time * 1000);
  let cutTime = (time + '').slice(3, 33)

  let deviceList = [' ', 'Mobile', 'IPhone', 'Ipad', 'Android', 'Windows Phone', 'Win10 App', 'Full Version'];
  let device = lastSeen.platform == undefined ? 'No device info' : deviceList[lastSeen.platform];

  let ulHtml =
    '<li>' + 'B-date: ' + user.bdate + '</li>' +
    '<li>' + 'Online: ' + online + '</li>' +
    '<li>' + 'Last seen: ' + cutTime + '</li>' +
    '<li>' + 'Device: ' + device + '</li>' +
    '<li>' + 'Country: ' + country + '</li>' +
    '<li>' + 'City: ' + city + '</li>' +
    '<li>' + 'Sex: ' + sex + '</li>' +
    '<li>' + 'Id: ' + user.id + '</li>' +

    '<div id="modal_form">' +
    '<img src="' + user.photo_max + '"></img>' +
    '<h3>' + user.first_name + ' ' + user.last_name + '</h3>' +
    '<li>' + 'B-date: ' + user.bdate + '</li>' +
    '<li>' + 'Online: ' + online + '</li>' +
    '<li>' + 'Last seen: ' + cutTime + '</li>' +
    '<li>' + 'Device: ' + device + '</li>' +
    '<li>' + 'Country: ' + country + '</li>' +
    '<li>' + 'City: ' + city + '</li>' +
    '<li>' + 'Sex: ' + sex + '</li>' +
    '<li>' + 'Id: ' + user.id + '</li>' +
    '<span id="modal_close">X</span>' +
    '</div><div id="overlay"></div>';

  $detail.find('img').attr('src', user.photo_max);
  $detail.find('h3').text(user.first_name + ' ' + user.last_name);
  $detail.find('ul').html(ulHtml);
  $detail.find('button').attr('data-id', user.id);


  $detail.show();


  $('.modal').on('click', function (event) {
    event.preventDefault();
    $('body').css('overflow', 'hidden');
    $('#overlay').fadeIn(400, // анимируем показ обложки
      function () { // далее показываем мод. окно
        $('#modal_form')
          .css('display', 'flex')
          .animate({ opacity: 1, top: '48%' }, 200);
      });
  });

  // закрытие модального окна
  $('#modal_close, #overlay').on('click', function () {
    $('body').css('overflow', 'auto');
    $('#modal_form')
      .animate({ opacity: 0, top: '45%' }, 200,  // уменьшаем прозрачность
        function () { // пoсле aнимaции
          $(this).css('display', 'none'); // скрываем окно
          $('#overlay').fadeOut(400); // скрывaем пoдлoжку
        }
      );
  });


} // Drawing detailed data about a friend.

function sendMessage(event) {

  let id = +$(event.target).attr('data-id');
  let value = $('textarea').val();
  if (!value) {
    alert('Textarea is empty!');
    return;
  }

  sendRequest('message.send', { user_id: id, message: value }, function () {
    console.log('Message sent!');
  });
} // It will not work without verification!

function playSound(sound) {
  var song = document.getElementById(sound);
  song.volume = 1;
  if (song.paused) {
    song.play();
  } else {
    song.pause();
  }
}

//access_token=vk1.a.u8AdPf34b2DTOGVhsg47jE_qW0Xcxmgf8WBWiVxbI8DuMjyfbwlYghnJ5dlAq2Vcl1UovmiAxBQDaOSwclhDezFAREA50kG2A4zKaq7XiTWp65nkLcOQKSztlgrcjwaOHvII7eB-BAOYPRTXMH7qZT2FVNk8H0AVQCTTeLZYWJINRibc_pGqmluTp1n-_B8j
// window.open("https://oauth.vk.com/authorize?client_id=51552231&display=page&redirect_uri=&scope=offline,friends&response_type=token&v=5.131"); Запросить токен
