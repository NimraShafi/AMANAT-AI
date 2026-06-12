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
require("dotenv").config();

const app = express();
app.use(express.json());

const N8N_WEBHOOK = process.env.N8N_WEBHOOK;
const PORT = process.env.PORT || 3000;

let sock;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  sock = makeWASocket({ auth: state, printQRInTerminal: false });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "open") console.log("WhatsApp Bot Connected");
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

    console.log(`Message from ${sender}. IsImage: ${isImage}`);

    try {
      let response;

      if (isImage) {
        const buffer = await downloadMediaMessage(
          msg,
          "buffer",
          {},
          {
            reuploadRequest: sock.updateMediaMessage,
          },
        );

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
        response = await axios.post(N8N_WEBHOOK, {
          sender,
          message: text,
          isImage: false,
        });
      }

      const reply = response.data?.reply;
      await sock.sendMessage(sender, { text: reply });
    } catch (err) {
      console.log("Error:", err.message);
    }
  });
}

startBot();

app.post("/send-reply", async (req, res) => {
  try {
    const { to, messageText } = req.body;
    await sock.sendMessage(to, { text: messageText });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
