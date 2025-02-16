import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth,onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection,updateDoc,limit,writeBatch,setDoc, doc, getDoc,where, query, orderBy, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { onSnapshot } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// 🚀 Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCib5ywnEJvXXIePdWeKZtrKMIi2-Q_9sM",
    authDomain: "geo-orbit-ed7a7.firebaseapp.com",
    databaseURL: "https://geo-orbit-ed7a7-default-rtdb.firebaseio.com",
    projectId: "geo-orbit-ed7a7",
    storageBucket: "geo-orbit-ed7a7.firebasestorage.app",
    messagingSenderId: "807202826514",
    appId: "1:807202826514:web:5630f581f6f9dff46aebcb",
    measurementId: "G-H15DN69132"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Get Logged-in User Info
const company = sessionStorage.getItem('company');
const userUID = sessionStorage.getItem('userUID');

onAuthStateChanged(auth,(user) => {
    if (!user) {
        // Redirect to login page
        alert("hel");
        window.location.href = "/index.html"; 
    } else {
        console.log("User is signed in:", user.uid);
    }
});


if (!company || !userUID) {
    alert("User not authenticated!");
    window.location.href="/index.html";
} else {
    const userRef = doc(db, `company/${company}/users`, userUID);
    const userDoc = await getDoc(userRef);
    var userData = userDoc.data();
}

// 🔹 Get Online Time (IST)

// Fetch time before using it
timestamp: serverTimestamp() // Store Firebase server timestamp
const chatscon = document.querySelector('.chats');
async function displayAllEmployees() {
    try {
        const usersCollection = collection(db, `company/${company}/users`);
        onSnapshot(usersCollection, async (querySnapshot) => {
            let employeeList = [];

            chatscon.innerHTML = ""; // Clear the chat container

            for (const doc of querySnapshot.docs) {
                const employeeData = doc.data();

                if (employeeData.EmployeeID !== userData.EmployeeID) {
                    const chatRoomID = generateChatRoomID(userData.EmployeeID, employeeData.EmployeeID);
                    const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
                    const lastMessageQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(1));

                    onSnapshot(lastMessageQuery, (messageSnapshot) => {
                        let lastMessage = "";
                        let lastTimestamp = 0;

                        if (!messageSnapshot.empty) {
                            const lastMessageData = messageSnapshot.docs[0].data();
                            lastMessage = lastMessageData.message || "";
                            lastTimestamp = lastMessageData.timestamp?.toMillis() || 0;
                        }

                        const existingIndex = employeeList.findIndex(emp => emp.EmployeeID === employeeData.EmployeeID);
                        if (existingIndex !== -1) {
                            employeeList[existingIndex].lastMessage = lastMessage;
                            employeeList[existingIndex].lastTimestamp = lastTimestamp;
                        } else {
                            employeeList.push({
                                ...employeeData,
                                lastMessage,
                                lastTimestamp,
                            });
                        }

                        renderEmployeeList(employeeList);
                    });
                }
            }
        });
    } catch (error) {
        console.error("Error fetching employees:", error);
    }
}
// Function to render employee list in real-time
function renderEmployeeList(employeeList) {
    employeeList.sort((a, b) => b.lastTimestamp - a.lastTimestamp); // Sort by latest message timestamp

    const fragment = document.createDocumentFragment();

    employeeList.forEach((employee, index) => {
        let chatitem = document.getElementById(`chat-${employee.EmployeeID}`);

        if (!chatitem) {
            chatitem = document.createElement("div");
            chatitem.classList.add("chat-item");
            chatitem.id = `chat-${employee.EmployeeID}`;
            chatitem.style.opacity = 0; // Start with opacity 0 for fade-in

            setTimeout(() => {
                chatitem.style.opacity = 1; // Fade-in effect
            }, 50);
        }
        const trimmedMessage = employee.lastMessage.length > 15 ? employee.lastMessage.substring(0, 15) + "..." : employee.lastMessage;

        chatitem.innerHTML = `
            <div class="chat-details">
                <div id="img">
                    <img id="profile-pic" src="${employee.photoURL || 'default.png'}" alt="Profile Picture" class="profile-pic">
                </div>
                <div id="det">
                    <div id="name">${employee.name || "Not provided"}</div>
                    <div id="lastmes">${trimmedMessage || "No messages yet"}</div>
                </div>
            </div>
        `;

        chatitem.onclick = () => chattingWith(employee);
        fragment.appendChild(chatitem);
    });

    // Animate reordering
    chatscon.innerHTML = "";
    chatscon.appendChild(fragment);
    chatscon.style.transition = "all 0.3s ease-in-out";
}

// Helper function to generate a chat room ID
function generateChatRoomID(id1, id2) {
    let sortedIDs = [id1,id2].sort();
    
    return `${sortedIDs[0]}_${sortedIDs[1]}`;
}

displayAllEmployees();
let isSendButtonListenerAttached = false;
let cchat=null;
async function chattingWith(employeeData) {
    document.getElementById('textmessage').value="";
    document.getElementById('profile').src = employeeData.photoURL || 'default.png';
    document.querySelector('.name').innerHTML = `${employeeData.name}`;
    document.getElementById('role').innerHTML = `${employeeData.Role}`;

    // 🔹 Generate Unique Chat Room ID
    let sortedIDs = [userData.EmployeeID, employeeData.EmployeeID].sort();
    let chatRoomID = `${sortedIDs[0]}_${sortedIDs[1]}`;

    await markMessagesAsRead(chatRoomID);
    cchat=chatRoomID;
    // Display Messages for the selected chat
    displayMessages(chatRoomID, employeeData);
    document.getElementById('clearChat').addEventListener('click',() => clearChatForUser(chatRoomID));

    // 🔹 Remove Previous Event Listeners
    const sendButton = document.getElementById('send');
    const textInput = document.getElementById('textmessage');

    sendButton.replaceWith(sendButton.cloneNode(true));
    textInput.replaceWith(textInput.cloneNode(true));

    // Re-select the new elements
    document.getElementById('send').addEventListener('click', () => sendMessage(chatRoomID, employeeData));
    document.getElementById('textmessage').addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage(chatRoomID, employeeData);
        }
    });
}
async function sendMessage(chatRoomID, employeeData) {
    const textInput = document.getElementById('textmessage');
    const textMessage = textInput.value.trim();  
    textInput.value = ""; // Clear input immediately

    if (!textMessage) {
        alert("No message entered!");
        return;
    }

    try {
        const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);

        // 🔹 Send message immediately with serverTimestamp
        const messageRef = await addDoc(messagesRef, {
            senderID: userData.EmployeeID,
            receiverID: employeeData.EmployeeID,
            message: textMessage,
            timestamp: serverTimestamp(),
            Date:"Today",
            Time:"Just Now",
            read: false,
            notified:false
        });


        // 🔹 Fetch IST Date & Time asynchronously without blocking message sending
        fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata")
            .then(response => response.json())
            .then(async data => {
                const [month, day, year] = data.date.split("/");
                const formattedDate = `${day}-${month}-${year}`;
                const formattedTime = data.time.slice(0, 5); // Extract "HH:MM"

                // 🔹 Update message with actual IST date & time
                await updateDoc(doc(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`, messageRef.id), {
                    Date: formattedDate,
                    Time: formattedTime
                });
            })
            .catch(error => console.error("Error fetching IST time:", error));

    } catch (error) {
        console.error("Error sending message:", error);
    }
}
let todaydate=null;
fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata")
            .then(response => response.json())
            .then(async data => {
                const [month, day, year] = data.date.split("/");
                 todaydate = `${day}-${month}-${year}`;


            })
            .catch(error => console.error("Error fetching IST time:", error));

let unsubscribeMessages = null; // Store the unsubscribe function
let unsubsnap=null;
let mesc=0

async function displayMessages(chatRoomID, employeeData) {
    const chatContainer = document.getElementById("chat1");
    chatContainer.innerHTML = ""; // Clear previous messages
    document.getElementById('chat').style.display = "flex";
    const chatRoomRef = doc(db, `company/${company}/OrbitConnect`, chatRoomID);
    const chatRoomSnapshot = await getDoc(chatRoomRef);

    if (!chatRoomSnapshot.exists()) {
        // If the chat room does not exist, create it
        await setDoc(chatRoomRef, {
            createdAt: serverTimestamp(),
            members: [userData.EmployeeID, employeeData.EmployeeID]
        });
    }

    const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
    let lastMessageDate = null;
    let isInitialLoad = true;

    // 🔹 Unsubscribe from any previous listener before attaching a new one
    if (unsubscribeMessages) {
        unsubscribeMessages(); // Stop listening to the old chat room
    }
    let lastSenderID=null;
    // Attach a new listener to the correct chat room
    unsubscribeMessages = onSnapshot(query(messagesRef, orderBy("timestamp", "asc")), (snapshot) => {
        chatContainer.innerHTML = ""; // Clear chat before reloading messages

        snapshot.forEach((doc) => {
            const messageData = doc.data();
            const messageDiv = document.createElement("div");
            if (messageData.hiddenFor && messageData.hiddenFor.includes(userData.EmployeeID)) {
                return; // Skip this message
            }
            const messageDate = messageData.Date;

            if (messageDate !== lastMessageDate && messageDate !== "Today") { 
                // Add a date separator only if it's different from the last message date
                const dateSeparator = document.createElement("div");
                dateSeparator.classList.add("date-separator");
                if(messageDate==todaydate){
                    dateSeparator.innerText = "Today";
                }else{
                dateSeparator.innerText = messageDate;
                }
                chatContainer.appendChild(dateSeparator);
                lastMessageDate = messageDate;  // Update last message date
            }
            

            let isFirstMessage = lastSenderID !== messageData.senderID || mesc==0;
            let readStatusIcon = messageData.read
            ? '<img id="check" src="/Images/check.png" class="tick-img">'  // ✅✅ Blue Double Check
            : '<img id="check" src="/Images/check1.png" class="tick-img">';        // Single Gray Tick
            mesc=mesc+1;

            if (messageData.senderID === userData.EmployeeID) {
                messageDiv.classList.add("msg", "right-msg");
                messageDiv.innerHTML = `

                    <div class="msg-img" style="background-image: url(${userData.photoURL}); visibility: ${isFirstMessage ? 'visible' : 'hidden'};"></div>
                    <div class="msg-bubble ${isFirstMessage ? "" : "no-tail"}" style="position: relative;">
                                <div class="msg-text">${messageData.message}</div>
                        <div class="msg-info-time">${messageData.Time}<span class="read-status">${readStatusIcon}</span>
</div>
                        <div class="msg-tail" style="display: ${isFirstMessage ? 'block' : 'none'};"></div>
                    </div>
                `;
            } else {
                messageDiv.classList.add("msg", "left-msg");
                messageDiv.innerHTML = `
                    <div class="msg-img" style="background-image: url(${employeeData.photoURL}); visibility: ${isFirstMessage ? 'visible' : 'hidden'};"></div>
                    <div class="msg-bubble ${isFirstMessage ? "" : "no-tail"}" style="position: relative;">
                        <div class="msg-text">${messageData.message}</div>
                        <div class="msg-info-time">${messageData.Time}</div>
                        <div class="msg-tail" style="display: ${isFirstMessage ? 'block' : 'none'};"></div>
                    </div>
                `;
            }

            chatContainer.appendChild(messageDiv);
            lastSenderID = messageData.senderID;
        });

        if (!isInitialLoad) {
            chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        } else {
            chatContainer.scrollTo({ top: chatContainer.scrollHeight });
        }

        isInitialLoad = false;
    });
}



async function markMessagesAsRead(chatRoomID) {
    const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    if (unsubsnap) {
        unsubsnap(); // Stop listening to the old chat room
    }
    unsubsnap=onSnapshot(q, async (snapshot) => {
        snapshot.forEach(async (docSnap) => {
            const messageData = docSnap.data();

            if (messageData.receiverID === userData.EmployeeID && !messageData.read) {
                try {
                    await updateDoc(doc(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`, docSnap.id), {
                        read: true
                    });
                } catch (error) {
                    console.error("Error updating read status:", error);
                }
            }
        });
    });
}



async function clearChatForUser(chatRoomID) {
    if (!confirm("Are you sure you want to clear the chat? This will not delete messages for the other user.")) return;

    try {
        const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
        const querySnapshot = await getDocs(messagesRef);

        // Update each message to mark it as hidden for the current user
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
            const messageData = docSnap.data();
            let hiddenFor = messageData.hiddenFor || []; 

            if (!hiddenFor.includes(userData.EmployeeID)) {
                hiddenFor.push(userData.EmployeeID);
            }

            batch.update(docSnap.ref, { hiddenFor: hiddenFor });
        });

        await batch.commit(); // Execute batch update

        // Clear chat UI for this user only
        document.getElementById("chat1").innerHTML = "";

        // alert("Chat cleared successfully for you. The other user will still see the messages.");
    } catch (error) {
        console.error("Error clearing chat:", error);
        alert("Failed to clear chat. Please try again.");
    }
}
const notificationSound = new Audio("/Images/notifi.mp3"); // Place a valid audio file in your project

async function listenForUserMessages() {
    try {
        const chatRoomsRef = collection(db, `company/${company}/OrbitConnect`);
        const q = query(chatRoomsRef);

        const querySnapshot = await getDocs(q);
        console.log("Total chat rooms found:", querySnapshot.size);

        querySnapshot.forEach((chatRoomDoc) => {
            const chatRoomID = chatRoomDoc.id;
            const chatRoomData = chatRoomDoc.data();

            if (chatRoomData.members && chatRoomData.members.includes(userData.EmployeeID)) {
                console.log("Listening for messages in chat room:", chatRoomID);

                const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
                onSnapshot(query(messagesRef, orderBy("timestamp", "asc")), async (snapshot) => {
                    snapshot.docChanges().forEach(async (change) => {
                        if (change.type === "added") {
                            const messageData = change.doc.data();
                            console.log("New message received:", messageData);
                            setTimeout(async () => {},5000);

                            if (messageData.receiverID === userData.EmployeeID && !messageData.read && chatRoomID!=cchat && !messageData.notified) {
                                console.log("Triggering notification for:", messageData.message);

                                // Fetch sender details
                                const senderQuery = query(
                                    collection(db, `company/${company}/users`),
                                    where("EmployeeID", "==", messageData.senderID)
                                );

                                const senderSnapshot = await getDocs(senderQuery);

                                let senderData = {
                                    name: "Unknown Sender",
                                    photoURL: "https://via.placeholder.com/40"
                                };

                                if (!senderSnapshot.empty) {
                                    senderSnapshot.forEach(doc => {
                                        senderData = doc.data();
                                    });
                                }
                                notificationSound.play().catch(error => console.log("Audio play blocked:", error));

                                // Trigger the toast notification with message details
                                showToast(senderData.name, senderData.photoURL, messageData.message);
                                try {
                                    await updateDoc(doc(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`, change.doc.id), {
                                        notified: true
                                    });
                                } catch (error) {
                                    console.error("Error updating read status:", error);
                                }
                            }
                        }
                    });
                });
            }
        });
    } catch (error) {
        console.error("Error listening for user messages:", error);
    }
}

// Function to show toast notification
function showToast(senderName, senderPhoto, messageText) {
    let toast = document.getElementById("toast");
    if (!toast) {
        console.error("Toast element not found!");
        return;
    }

    // Update toast content dynamically
    const trimmedMessage = messageText.length > 15 ? messageText.substring(0, 15) + "..." : messageText;

    document.querySelector(".notification-user-avatar").src = senderPhoto;
    document.querySelector(".notification-text strong").innerText = senderName;
    document.querySelector(".mestxt").innerHTML=trimmedMessage;

    // Show notification with animation
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.transform = "translateY(0)";
    }, 100);

    // Auto-hide after 5 seconds
    setTimeout(hideToast, 5000);
}

function hideToast() {
    let toast = document.getElementById("toast");
    if (toast) {
        toast.style.transform = "translateY(200%)";
        setTimeout(() => {
            toast.style.display = "none";
        }, 500);
    }
}

// Start Listening for Messages
// listenForUserMessages();


// ✅ Start Listening for Messages Only for the User
const unsubscribe = db.collection("messages")
  .where("chatId", "==", "12345")
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        console.log("New message: ", change.doc.data());
      }
    });
  });
  
  document.getElementById('dhome').addEventListener('click', () => {
    const content = document.getElementById('profile');
    content.classList.add('fade-out');
    setTimeout(() => {
        unsubscribe();
      window.location.href = 'home.html';

    }, 500); // Duration of the fade-out
  });
// Call this when component unmounts or when real-time updates aren't needed
