import Chat from "../models/chat.js";
import User from "../models/user.js";

const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user_id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name profileImage email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      users: [userId, req.user._id],
      isGroupChat: false,
    };

    try {
      const createChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "password"
      );

      res.status(201).send(FullChat);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
};

const fetchChats = async (req, res) => {
  try {
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name profileImage email",
        });
        console.log(results, "fetchchat");
        res.status(200).send(results);
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

const createGroupChat = async (req, res) => {
  if (!req.body.name || !req.body.users) {
    return res.status(400).send("Name and users params are required");
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) return res.status(400).send("Users param is empty");

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    });

    const FullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "password")
      .populate("groupAdmin", "password");

    res.status(201).send(FullGroupChat);
  } catch (error) {}
};

const renameGroupChat = async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    { new: true }
  )
    .populate("users", "password")
    .populate("groupAdmin", "password");

  if (!updatedChat) {
    return res.status(400).send("Chat not found");
  } else {
    res.json(updatedChat);
  }
};

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },

    { new: true }
  )
    .populate("users", "password")
    .populate("groupAdmin", "password");

  if (!added) {
    return res.status(400).send("Chat not found");
  } else {
    res.json(added);
  }
};

const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },

    { new: true }
  )
    .populate("users", "password")
    .populate("groupAdmin", "password");

  if (!removed) {
    return res.status(400).send("Chat not found");
    throw new Error("Chat not found");
  } else {
    res.json(removed);
  }
};

export default {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
};
