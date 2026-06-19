const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage,
} = require("@whiskeysockets/baileys");

const axios = require("axios");
const qrcode = require("qrcode-terminal");
const express = require("express");
const FormData = require("form-data");
const multer = require("multer");
require("dotenv").config();

const app = express();
const upload = multer(); // Binary files handle karne ke liye (n8n receipt)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment Variables
const N8N_WEBHOOK = process.env.N8N_WEBHOOK;
const PORT = process.env.PORT || 3000;

let sock;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["Amanat AI", "MacOS", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("Scan the QR Code below:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open")
      console.log("✅ WhatsApp Bot Connected & Active");
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log("Connection closed. Reconnecting:", shouldReconnect);
      if (shouldReconnect) startBot();
    }
  });

  // --- INBOUND: Receiving Messages from WhatsApp and sending to n8n ---
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

    console.log(
      `📩 Message from ${sender}. Type: ${isImage ? "Image" : "Text"}`,
    );

    try {
      let response;

      if (isImage) {
        // Image Download Logic
        const buffer = await downloadMediaMessage(
          msg,
          "buffer",
          {},
          { reuploadRequest: sock.updateMediaMessage },
        );

        // n8n ko image aur sender details bhejna
        const form = new FormData();
        form.append("sender", sender);
        form.append("message", text);
        form.append("isImage", "true");
        form.append("data", buffer, {
          filename: "screenshot.jpg",
          contentType: "image/jpeg",
        });

        response = await axios.post(N8N_WEBHOOK, form, {
          headers: { ...form.getHeaders() },
        });
      } else {
        // Sirf Text n8n ko bhejna
        response = await axios.post(N8N_WEBHOOK, {
          sender,
          message: text,
          isImage: false,
        });
      }

      // n8n agar fori reply bhejta hai (Optional)
      if (response.data && response.data.reply) {
        await sock.sendMessage(sender, { text: response.data.reply });
      }
    } catch (err) {
      console.error("❌ Error sending to n8n:", err.message);
    }
  });
}

// --- OUTBOUND: n8n calling this API to send receipts/messages ---
app.post("/send-reply", upload.single("image"), async (req, res) => {
  try {
    const { to, messageText } = req.body;
    const imageFile = req.file; // n8n se aane wali binary receipt

    if (!to)
      return res.status(400).json({ error: "Missing 'to' (Recipient ID)" });

    if (imageFile) {
      // 🖼️ Receipt + Caption bhejna
      console.log(`📤 Sending Receipt to ${to}`);
      await sock.sendMessage(to, {
        image: imageFile.buffer,
        caption: messageText || "JazakAllah! Here is your donation receipt.",
      });
    } else {
      // 💬 Sirf Text message bhejna
      console.log(`📤 Sending Text to ${to}`);
      await sock.sendMessage(to, { text: messageText });
    }

    res.json({ success: true, status: "Message Sent" });
  } catch (err) {
    console.error("❌ Send Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

startBot();

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🔗 Webhook URL for n8n: http://your-ngrok-url/send-reply`);
});
