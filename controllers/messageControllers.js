import Message from "../models/message.js";
import Chat from "../models/chat.js";
import User from "../models/user.js";

const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;

  if (!content || !chatId) {
    return res.status(400).send("No message or chat found");
  }

  var newMessage = {
    chat: chatId,
    content: content,
    sender: req.user._id,
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name profileImage");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name profileImage email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    console.log(message, "jhj");

    res.status(201).send(message);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Chat not found");
  }
};

const fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name profileImage email")
      .populate("chat");

    res.status(200).send(messages);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Chat not found");
  }
};

export default { sendMessage, fetchMessages };
