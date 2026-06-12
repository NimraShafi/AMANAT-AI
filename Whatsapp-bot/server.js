// const {
//   default: makeWASocket,
//   useMultiFileAuthState,
//   DisconnectReason,
// } = require("@whiskeysockets/baileys");
// const axios = require("axios");
// const qrcode = require("qrcode-terminal");

// const N8N_WEBHOOK = "https://nimra-shafi.app.n8n.cloud/webhook-test/donation";

// async function startBot() {
//   // Auth state manage karne ke liye
//   const { state, saveCreds } = await useMultiFileAuthState("auth");

//   const sock = makeWASocket({
//     auth: state,
//     printQRInTerminal: false, // Isko false rakhein kyunki hum manually print karenge
//   });

//   // Credentials save karne ke liye
//   sock.ev.on("creds.update", saveCreds);

//   // Connection status aur QR code handle karne ke liye
//   sock.ev.on("connection.update", (update) => {
//     const { connection, lastDisconnect, qr } = update;

//     // Agar QR code aaye toh terminal mein dikhao
//     if (qr) {
//       console.log("\n--- SCAN THIS QR CODE ---");
//       qrcode.generate(qr, { small: true });
//     }

//     if (connection === "close") {
//       const shouldReconnect =
//         lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
//       console.log("Connection closed, reconnecting...", shouldReconnect);
//       // Agar logout nahi hua toh dobara connect karein
//       if (shouldReconnect) startBot();
//     } else if (connection === "open") {
//       console.log("✅ WhatsApp Bot Successfully Connected!");
//     }
//   });

//   // 📩 Incoming messages handle karein
//   sock.ev.on("messages.upsert", async ({ messages }) => {
//     const msg = messages[0];

//     // Check karein agar message valid hai aur aapki taraf se nahi hai
//     if (!msg.message || msg.key.fromMe) return;

//     const sender = msg.key.remoteJid;
//     const text =
//       msg.message.conversation || msg.message.extendedTextMessage?.text;

//     if (!text) return;

//     console.log(`📩 Message from ${sender}: ${text}`);

//     try {
//       // 1. n8n Webhook par data bhejein
//       const res = await axios.post(N8N_WEBHOOK, {
//         sender: sender,
//         message: text,
//         timestamp: Date.now(),
//       });

//       // 2. n8n se reply lein (agar n8n JSON response de raha hai)
//       // Maan lijiye n8n {"reply": "Hello"} bhej raha hai
//       const replyText = res.data?.reply || "Received ✔ (n8n response success)";

//       // 3. User ko wapas reply bhejein
//       await sock.sendMessage(sender, {
//         text: replyText,
//       });
//     } catch (err) {
//       console.log("❌ Error sending to n8n:", err.message);

//       await sock.sendMessage(sender, {
//         text: "System error ❌ n8n is not responding.",
//       });
//     }
//   });
// }

// // Bot start karein
// startBot();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage, // ✨ Image download karne ke liye
} = require("@whiskeysockets/baileys");

const axios = require("axios");
const qrcode = require("qrcode-terminal");
const express = require("express");
const FormData = require("form-data"); // ✨ File bhejne ke liye

const app = express();
app.use(express.json());

const N8N_WEBHOOK = "https://nimra-shafi.app.n8n.cloud/webhook-test/donation";

let sock;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  sock = makeWASocket({ auth: state, printQRInTerminal: false });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "open") console.log("✅ WhatsApp Bot Connected");
    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      )
        startBot();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const isImage = !!msg.message.imageMessage;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";

    console.log(`📩 Message from ${sender}. IsImage: ${isImage}`);

    try {
      let response;

      if (isImage) {
        // 1. ✨ WhatsApp se image download karein
        const buffer = await downloadMediaMessage(
          msg,
          "buffer",
          {},
          {
            reuploadRequest: sock.updateMediaMessage,
          },
        );

        // 2. ✨ Multipart form-data banayein taake n8n ko file mile
        const form = new FormData();
        form.append("sender", sender);
        form.append("message", text);
        form.append("data", buffer, {
          filename: "image.jpg",
          contentType: "image/jpeg",
        });

        response = await axios.post(N8N_WEBHOOK, form, {
          headers: { ...form.getHeaders() },
        });
      } else {
        // Normal text message
        response = await axios.post(N8N_WEBHOOK, {
          sender,
          message: text,
          isImage: false,
        });
      }

      const reply = response.data?.reply;
      await sock.sendMessage(sender, { text: reply });
    } catch (err) {
      console.log("❌ Error:", err.message);
    }
  });
}

startBot();

// Baaki ka express code (send-reply) waisa hi rahega...
app.post("/send-reply", async (req, res) => {
  try {
    const { to, messageText } = req.body;
    await sock.sendMessage(to, { text: messageText });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(3000, () => console.log(`🚀 Server running on port 3000`));
