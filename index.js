let message;
let currentSelectedContact = null;

function getLatestMessage(messageList, timestamp) {
  for (let index = 0; index < messageList.length; index++) {
    const messageItem = messageList[index];
    if (messageItem.timestamp === timestamp) {
      return messageItem.message;
    }
  }
  return "";
}

function getMessageById(id) {
  for (let index = 0; index < message.length; index++) {
    const messageItem = message[index];
    if (messageItem.id === id) {
      return messageItem;
    }
  }
  return;
}

function formatDMY(d) {
  // Default to today
  d = d || new Date();
  return (
    ("0" + d.getDate()).slice(-2) +
    "/" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "/" +
    ("000" + d.getFullYear()).slice(-4)
  );
}

function handleContactSection(contactListArray) {
  let contactList = [];
  let contactSection = document.querySelector(".scrollable-contact");
  contactSection.innerHTML = null;
  contactListArray.forEach((user) => {
    const mainContactBox = document.createElement("div");
    mainContactBox.classList.add("main-contact-box");

    mainContactBox.addEventListener("click", () =>
      handleMessageSection(user.id)
    );

    const userLogoBox = document.createElement("div");
    userLogoBox.classList.add("user-logo-box");

    const userDetailsBox = document.createElement("div");
    userDetailsBox.classList.add("user-details-box");
    const userName = document.createElement("p");
    userName.classList.add("user-name");
    userName.innerText = user.title;
    userDetailsBox.append(userName);

    const userOrderId = document.createElement("p");
    userOrderId.classList.add("user-order");
    userOrderId.innerText = "Order " + user.orderId;
    userDetailsBox.append(userOrderId);

    const userLastMessage = document.createElement("p");
    userLastMessage.classList.add("user-last-message");
    userLastMessage.innerText = user.messageList.length
      ? getLatestMessage(user.messageList, user.latestMessageTimestamp)
      : "";
    if (userLastMessage.innerText) {
      userDetailsBox.append(userLastMessage);
    }

    const userImg = document.createElement("img");
    userImg.setAttribute("src", user.imageURL);
    userImg.classList.add("user-img");
    userLogoBox.append(userImg);

    const userDate = document.createElement("div");
    userDate.classList.add("user-date");
    userDate.innerText = formatDMY(new Date(user.latestMessageTimestamp));

    mainContactBox.append(userLogoBox);
    mainContactBox.append(userDetailsBox);
    mainContactBox.append(userDate);
    contactList.push(mainContactBox);
  });
  contactSection.append(...contactList);
}

function handleMessageSection(index, dontCheck) {
  const scrollableMessage = document.querySelector(".scrollable-message");
  scrollableMessage.innerHTML = null;
  scrollableMessage.classList.remove("center-message-section");
  const noMessage = document.createElement("div");
  noMessage.classList.add("no-message");
  noMessage.innerText = "Send a message to start chatting";
  const messageItem = getMessageById(index);
  const userImg = document.getElementById("message-section-title-image");
  userImg.setAttribute("src", messageItem.imageURL);
  const userName = document.getElementById("message-section-title-text");
  userName.innerText = messageItem.title;
  if (!dontCheck && messageItem.messageList.length === 0) {
    scrollableMessage.classList.add("center-message-section");
    scrollableMessage.append(noMessage);
    return;
  }
  const chatSection = document.querySelector(".chat-section");
  chatSection.classList.add("chat-section-split");
  currentSelectedContact = index;
  const mainMessageBox = document.createElement("div");
  mainMessageBox.classList.add("main-message-box");

  let messageArray = [];

  messageItem.messageList.forEach((msg) => {
    const messageTextContainer = document.createElement("div");
    messageTextContainer.classList.add(
      msg.sender === "BOT"
        ? "message-text-container"
        : "message-text-container-right"
    );
    const messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.innerText = msg.message;
    messageTextContainer.appendChild(messageText);
    messageArray.push(messageTextContainer);
  });
  mainMessageBox.append(...messageArray);
  scrollableMessage.append(mainMessageBox);
}

function handleFilter(searchQuery) {
  let filteredContact = message.filter((contactItem) => {
    if (
      contactItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contactItem.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return contactItem;
  });
  handleContactSection(filteredContact);
}

function handleContactFilter() {
  const inputBox = document.querySelector(".contact-search-input-box");
  inputBox.addEventListener("keyup", (event) => {
    handleFilter(event.target.value);
  });
}

function handleMessageSend() {
  const inputBox = document.querySelector(".message-input");
  const iconClick = document.getElementById("message-click");
  const handleEvent = (event) => {
    if (event.key === "Enter" || event.type === "click") {
      if (inputBox.value.trim() === "") return;
      // message need to be sent
      const messageItem = getMessageById(currentSelectedContact);
      if (!messageItem.messageList) {
        messageItem.messageList = [];
      }
      messageItem.messageList.push({
        message: inputBox.value,
      });
      handleMessageSection(currentSelectedContact, true);
      inputBox.value = null;
    }
  };

  inputBox.addEventListener("keyup", handleEvent);
  iconClick.addEventListener("click", handleEvent);
}

async function fetchData() {
  const chatBox = document.querySelector(".chat-box-container");
  const loader = document.querySelector(".loader");
  try {
    const response = await fetch(
      "https://my-json-server.typicode.com/codebuds-fk/chat/chats"
    );
    const data = await response.json();
    message = data;
    handleContactSection(data);
    handleContactFilter();
    handleMessageSend();
    chatBox.style.display = "block";
    loader.style.display = "none";
  } catch (error) {
    loader.innerText = "Something went wrong.";
    console.warn("Something went wrong.", error);
  }
}
fetchData();
