// chatController.js - Livestock Negotiation & Direct Buyer-Seller Messaging
const db = require('../database/adapter');
const notificationService = require('../services/notification');

exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Harap masuk terlebih dahulu.' });
    }

    const allChats = await db.findMany('chats', {});
    const safeChats = Array.isArray(allChats) ? allChats : [];

    // Filter chats where user is sender or receiver
    const userChats = safeChats.filter(c => c && (c.sender_id === currentUserId || c.receiver_id === currentUserId));

    // Group by the other participant
    const contactMap = {};
    for (const chat of userChats) {
      const otherId = chat.sender_id === currentUserId ? chat.receiver_id : chat.sender_id;
      if (!otherId) continue;

      const chatCreatedAt = chat.created_at || new Date().toISOString();
      if (!contactMap[otherId] || new Date(chatCreatedAt) > new Date(contactMap[otherId].last_message_at || 0)) {
        contactMap[otherId] = {
          contact_id: otherId,
          last_message: chat.message || '',
          last_message_at: chatCreatedAt,
          negotiated_price: chat.negotiated_price || null,
          animal_context_id: chat.animal_context_id || null,
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

      let animalContext = null;
      if (animal) {
        let animalImage = '';
        if (Array.isArray(animal.images) && animal.images.length > 0) {
          animalImage = animal.images[0];
        } else if (typeof animal.images === 'string') {
          try {
            const parsed = JSON.parse(animal.images);
            animalImage = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : animal.images;
          } catch (e) {
            animalImage = animal.images;
          }
        } else if (animal.image_url) {
          animalImage = animal.image_url;
        }

        animalContext = {
          id: animal.id,
          title: animal.title || 'Hewan Ternak',
          price: animal.price || 0,
          image: animalImage || ''
        };
      }

      conversations.push({
        ...contactMap[otherId],
        contact_name: contactUser ? contactUser.name : 'Pengguna Ternakmart',
        contact_avatar: contactUser ? contactUser.avatar_url : '',
        contact_role: contactUser ? contactUser.role : 'USER',
        animal_context: animalContext
      });
    }

    conversations.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));

    return res.json({ success: true, data: conversations });
  } catch (err) {
    console.error('💥 [getConversations error]:', err);
    return res.json({ success: true, data: [] });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Harap masuk terlebih dahulu.' });
    }
    const { targetUserId } = req.params;

    const allChats = await db.findMany('chats', {});
    const safeChats = Array.isArray(allChats) ? allChats : [];
    const messages = safeChats.filter(c =>
      c &&
      ((c.sender_id === currentUserId && c.receiver_id === targetUserId) ||
      (c.sender_id === targetUserId && c.receiver_id === currentUserId))
    );

    // Mark as read when opened/read by current receiver
    for (const msg of messages) {
      if (msg && msg.receiver_id === currentUserId && (!msg.is_read || msg.status !== 'read')) {
        await db.update('chats', msg.id, { is_read: true, status: 'read' });
        msg.is_read = true;
        msg.status = 'read';
      }
    }

    messages.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

    return res.json({ success: true, data: messages });
  } catch (err) {
    console.error('💥 [getMessages error]:', err);
    return res.json({ success: true, data: [] });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user?.id;
    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Harap masuk terlebih dahulu.' });
    }
    const { receiver_id, message, animal_context_id, negotiated_price } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ success: false, message: 'Harap sertakan ID penerima dan isi pesan.' });
    }

    const receiver = await db.findById('users', receiver_id);
    const isReceiverOnline = Boolean(receiver && receiver.is_online === true);
    const initialStatus = isReceiverOnline ? 'delivered' : 'sent';

    const newChat = await db.create('chats', {
      sender_id: senderId,
      receiver_id,
      animal_context_id: animal_context_id || null,
      message,
      negotiated_price: negotiated_price ? parseFloat(negotiated_price) : null,
      is_read: false,
      status: initialStatus
    });

    // Notify receiver & dispatch Web Push Notification
    const senderName = req.user?.name || 'Pengguna Ternakmart';
    let notifTitle = `💬 Pesan Baru dari ${senderName}`;
    let notifMsg = message;
    if (negotiated_price) {
      notifTitle = `🤝 Penawaran Harga Baru: Rp ${parseFloat(negotiated_price).toLocaleString('id-ID')}`;
      notifMsg = `${senderName} mengajukan penawaran harga untuk hewan ternak.`;
    }

    notificationService.send(receiver_id, {
      title: notifTitle,
      message: notifMsg,
      type: 'CHAT_MESSAGE',
      reference_id: newChat.id,
      url: '/chat'
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

exports.getContacts = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Harap masuk terlebih dahulu.' });
    }
    const allUsers = await db.findMany('users', {});
    const stores = await db.findMany('stores', {});

    const contacts = allUsers
      .filter(u => u.id !== currentUserId && u.role !== 'ADMIN')
      .map(u => {
        const store = stores.find(s => s.user_id === u.id);
        return {
          id: u.id,
          name: u.name,
          username: u.username,
          role: u.role,
          avatar_url: u.avatar_url,
          store_name: store ? store.store_name : null,
          store_tier: store ? store.tier : null
        };
      });

    return res.json({ success: true, data: contacts });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil kontak.' });
  }
};
