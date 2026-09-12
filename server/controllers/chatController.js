// chatController.js - Livestock Negotiation & Direct Buyer-Seller Messaging
const db = require('../database/adapter');
const notificationService = require('../services/notification');

exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const allChats = await db.findMany('chats', {});

    // Filter chats where user is sender or receiver
    const userChats = allChats.filter(c => c.sender_id === currentUserId || c.receiver_id === currentUserId);

    // Group by the other participant
    const contactMap = {};
    for (const chat of userChats) {
      const otherId = chat.sender_id === currentUserId ? chat.receiver_id : chat.sender_id;
      if (!contactMap[otherId] || new Date(chat.created_at) > new Date(contactMap[otherId].last_message_at)) {
        contactMap[otherId] = {
          contact_id: otherId,
          last_message: chat.message,
          last_message_at: chat.created_at,
          negotiated_price: chat.negotiated_price,
          animal_context_id: chat.animal_context_id,
          unread_count: 0
        };
      }
      if (chat.receiver_id === currentUserId && !chat.is_read) {
        contactMap[otherId].unread_count = (contactMap[otherId].unread_count || 0) + 1;
      }
    }

    // Enrich with user names & stores
    const conversations = [];
    for (const otherId of Object.keys(contactMap)) {
      const contactUser = await db.findById('users', otherId);
      let animal = null;
      if (contactMap[otherId].animal_context_id) {
        animal = await db.findById('animals', contactMap[otherId].animal_context_id);
      }

      conversations.push({
        ...contactMap[otherId],
        contact_name: contactUser ? contactUser.name : 'Pengguna',
        contact_avatar: contactUser ? contactUser.avatar_url : '',
        contact_role: contactUser ? contactUser.role : '',
        animal_context: animal ? { id: animal.id, title: animal.title, price: animal.price, image: animal.images[0] } : null
      });
    }

    conversations.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));

    return res.json({ success: true, data: conversations });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat percakapan chat.' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.params;

    const allChats = await db.findMany('chats', {});
    const messages = allChats.filter(c =>
      (c.sender_id === currentUserId && c.receiver_id === targetUserId) ||
      (c.sender_id === targetUserId && c.receiver_id === currentUserId)
    );

    // Mark as read
    for (const msg of messages) {
      if (msg.receiver_id === currentUserId && !msg.is_read) {
        await db.update('chats', msg.id, { is_read: true });
        msg.is_read = true;
      }
    }

    messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil pesan chat.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, message, animal_context_id, negotiated_price } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ success: false, message: 'Harap sertakan ID penerima dan isi pesan.' });
    }

    const newChat = await db.create('chats', {
      sender_id: req.user.id,
      receiver_id,
      animal_context_id: animal_context_id || null,
      message,
      negotiated_price: negotiated_price ? parseFloat(negotiated_price) : null,
      is_read: false
    });

    // Notify receiver
    let notifTitle = `💬 Pesan Baru dari ${req.user.name}`;
    let notifMsg = message;
    if (negotiated_price) {
      notifTitle = `🤝 Penawaran Harga Baru: Rp ${parseFloat(negotiated_price).toLocaleString('id-ID')}`;
      notifMsg = `${req.user.name} mengajukan penawaran harga untuk hewan ternak.`;
    }

    notificationService.send(receiver_id, {
      title: notifTitle,
      message: notifMsg,
      type: 'CHAT_MESSAGE',
      reference_id: newChat.id
    });

    return res.status(201).json({
      success: true,
      message: 'Pesan berhasil terkirim.',
      data: newChat
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengirim pesan chat.' });
  }
};
