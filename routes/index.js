import { Router } from "express";
import userControllers from "../controllers/userControllers.js";
import chatControllers from "../controllers/chatControllers.js";
import messageControllers from "../controllers/messageControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/user", userControllers.registerUser);
router.post("/user/login", userControllers.authUser);
router.get("/user", authMiddleware.protect, userControllers.allUsers);
router.post("/chat", authMiddleware.protect, chatControllers.accessChat);
router.get("/chat", authMiddleware.protect, chatControllers.fetchChats);
router.post("/chat/group", authMiddleware.protect, chatControllers.createGroupChat);
router.put("/chat/rename", authMiddleware.protect, chatControllers.renameGroupChat);
router.put("/chat/groupadd", authMiddleware.protect, chatControllers.addToGroup);
router.put("/chat/groupremove", authMiddleware.protect, chatControllers.removeFromGroup);
router.post("/message", authMiddleware.protect, messageControllers.sendMessage);
router.get("/message/:chatId", authMiddleware.protect, messageControllers.fetchMessages);

export default router;
