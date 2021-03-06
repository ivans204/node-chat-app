var socket = io();

function scrollToBottom() {
  // Selectors
  var messages = $("#messages");
  var newMessage = messages.children("li:last-child");

  // Heights
  var clientHeight = messages.prop("clientHeight");
  var scrollTop = messages.prop("scrollTop");
  var scrollHeight = messages.prop("scrollHeight");
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on("connect", function() {
  var params = $.deparam(window.location.search);
  var showRoomName = $(".chat__room");
  showRoomName.text(params.room.toLowerCase());
  var tabTitle = $("title");
  tabTitle.text(params.room.toLowerCase() + " | Chat app");

  socket.emit("join", params, function(err) {
    if (err) {
      alert(err);
      window.location.href = "/";
    } else {
      console.log("No error.");
    }
  });
});

socket.on("disconnect", function() {
  console.log("Disconnect from server");
});

socket.on("updateUserList", function(users) {
  var ul = $("<ul></ul>");

  users.forEach(function(user) {
    ul.append($("<li></li>").text(user));
  });

  $("#users").html(ul);
});

socket.on("newMessage", function(message) {
  var formattedTime = moment(message.createdAt).format("H:mm");
  var template = $("#message-template").html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  $("#messages").append(html);
  scrollToBottom();
});

socket.on("newLocationMessage", function(message) {
  var formattedTime = moment(message.createdAt).format("H:mm");
  var template = $("#location-message-template").html();
  var html = Mustache.render(template, {
    url: message.url,
    from: message.from,
    createdAt: formattedTime
  });

  $("#messages").append(html);
  scrollToBottom();
});

$("#message-form").on("submit", function(e) {
  e.preventDefault();
  var messageTextBox = $("[name=message]");

  socket.emit(
    "createMessage",
    {
      text: messageTextBox.val()
    },
    function() {
      messageTextBox.val("");
    }
  );
});

var loactionButton = $("#send-location");

loactionButton.on("click", function() {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by yout browser.");
  }

  loactionButton.attr("disabled", "disabled").text("Sending location...");

  navigator.geolocation.getCurrentPosition(
    function(position) {
      loactionButton
        .removeAttr("disabled")
        .html('<i class="fas fa-map-marker-alt"></i>');
      socket.emit("createLocationMessage", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    function() {
      loactionButton
        .removeAttr("disabled")
        .text('<i class="fas fa-map-marker-alt"></i>');
      alert("Unable to fetch location.");
    }
  );
});

var hamburger = $("#hamburger");
var mobMenu = $(".chat__sidebar");
hamburger.on("click", function() {
  $(mobMenu).toggleClass("chat__sidebarShow");
});
