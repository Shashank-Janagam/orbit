// Initialize Firebase first
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ Register Fingerprint and Store in Firestore
async function registerFingerprint() {
    if (!window.PublicKeyCredential) {
        alert("WebAuthn is not supported in this browser.");
        return;
    }

    const publicKey = {
        challenge: new Uint8Array(32),
        rp: { name: "Your Website" },
        user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "User",
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000,
        attestation: "none"
    };

    try {
        const credential = await navigator.credentials.create({ publicKey });
        console.log("Fingerprint Registered:", credential);

        // Convert credential ID to base64 for storage
        const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));

        // Store in Firestore
        await db.collection("fingerprintCredentials").doc("user1").set({ credentialId });
        alert("Fingerprint registered successfully!");
    } catch (error) {
        console.error("Fingerprint registration failed:", error);
    }
}

// ✅ Authenticate Using Stored Fingerprint
async function authenticateFingerprint() {
    try {
        // Get stored credential ID
        const doc = await db.collection("fingerprintCredentials").doc("user1").get();
        if (!doc.exists) {
            alert("No fingerprint registered.");
            return;
        }
        const credentialId = atob(doc.data().credentialId);
        
        const publicKey = {
            challenge: new Uint8Array(32),
            allowCredentials: [{ id: new Uint8Array([...credentialId].map(c => c.charCodeAt(0))), type: "public-key" }],
            timeout: 60000,
            userVerification: "required"
        };

        const assertion = await navigator.credentials.get({ publicKey });
        console.log("Fingerprint Authentication Successful:", assertion);
        alert("Login successful!");
    } catch (error) {
        console.error("Fingerprint authentication failed:", error);
    }
}
