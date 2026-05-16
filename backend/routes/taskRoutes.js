const express = require('express');
const { protect, adminOnly} = require("../middlewares/authMiddleware");
const { getTasks, getTaskById, createTask,updateTask, deleteTask, updateTaskStatus, updateTaskChecklist,
    getDashboardData,getUserDashboardData} = require('../controllers/taskController');

const router = express.Router();

//Task Mangement routes
router.get("/dashboard-data",protect,getDashboardData);
router.get("/user-dashboard-data",protect,getUserDashboardData);
router.get("/",protect,getTasks);//get all tasks (Admin:all, User:assigned)
router.get("/:id",protect,getTaskById);
router.post("/",protect,adminOnly,createTask);//create a task (admin only)
router.put("/:id",protect,updateTask);// update task details
router.delete("/:id",protect,adminOnly,deleteTask)//Delete a task(admin only)
router.put("/:id/status",protect,updateTaskStatus);
router.put("/:id/todo",protect,updateTaskChecklist);

module.exports = router;
