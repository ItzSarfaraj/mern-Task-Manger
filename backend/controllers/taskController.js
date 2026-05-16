const Task = require("../models/Task");

//@desc Get all tasks (Admin:all, User:only assigned task)
//@route GET/api/tasks/
//@access private

const getTasks = async (req,res)=>{
    try{
        const { status } = req.query;
        let filter = {};

        if(status){ filter.status = status;}

        let tasks;

        if(req.user.role === "admin"){
            tasks = await Task.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        }else{
           tasks = await Task.find({...filter, assignedTo: req.user._id}).populate(
                "assignedTo",
                "name email profileImageUrl"
            ); 
        }

        // Add complete todo checklist count to each task
        tasks = await Promise.all(
            tasks.map(async(task)=>{
                const completedCount = task.todoChecklist.filter(
                    (item)=> item.completed
                ).length;
                return { ...task._doc, completedTodoCount: completedCount}
            })
        );

        //status summary counts
        const allTasks = await Task.countDocuments(
            req.user.role === "admin" ? {} : {assignedTo: req.user._id}
        );


        const pendingTasks = await Task.countDocuments({
            ...filter,
            status:"Pending",
            ...(req.user.role !== "admin" && {assignedTo:req.user._id})
        });

        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status:"In Progress",
            ...(req.user.role !== "admin" && {assignedTo:req.user._id})
        });
        const completedTasks = await Task.countDocuments({
            ...filter,
            status:"Completed",
            ...(req.user.role !== "admin" && {assignedTo:req.user._id})
        });

        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks
            },
        });

    }catch(error){
        res.status(500).json({message:"Server Error",error:error.message});
    }
};


//@desc Get task by id
//@route GET/api/tasks/:id
//@access private

const getTaskById = async (req,res)=>{
    try{
      const task = await Task.findById(req.params.id).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
     // console.log(req.params.id);
     // console.log(task);

      if(!task) return res.status(404).json({message:"task not found"});

      res.json(task);
    }catch(error){
        res.status(500).json({message:"Server Error",error:error.message});
    }
};

//@desc create a new task(admin only)
//@route POST/api/tasks/
//@access private(Admin)

const createTask = async (req,res)=>{
    try{
      const {title,description,priority,dueDate,assignedTo,attachements,todoChecklist} = req.body;

      if(!Array.isArray(assignedTo)){
        return res.status(400).json({message:"Assigned to must be an array of user ids"});
      }

      const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        assignedTo,
        createdBy:req.user._id,
        todoChecklist,
        attachements
      });

      res.status(201).json({message:"Task created succesfully", task});
    }catch(error){
        res.status(500).json({message:"Server Error",error:error.message});
    }
};


//@desc update task details
//@route PUT/api/tasks/:id
//@access private

const updateTask = async (req,res)=>{
    try{
      const task = await Task.findById(req.params.id);
      console.log(req.body);

      if(!task) return res.status(404).json({message:"Task not found"});

      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
      task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
      task.attachements = req.body.attachements || task.attachements;

      if(req.body.assignedTo) {
        if(!Array.isArray(req.body.assignedTo)){
            return res.status(400).json({message:"assignedTo must be an array of user IDs"});
        }
        task.assignedTo = req.body.assignedTo;
      }

      const updatedTask = await task.save();
      res.json({message:"Task updated successfully", updatedTask});
    }catch(error){
        res.status(500).json({message:"Server Error",error:error.message});
    }
};



//@desc Delete a task(admin only)
//@route DELETE/api/tasks/:id
//@access private(Admin)

const deleteTask = async (req,res)=>{
    try{
       const task = await Task.findById(req.params.id);

       if(!task) return res.status(404).json({message: "Task not found"});
       await task.deleteOne();
       res.json({message:"Task deleted succesfully"});

    }catch(error){
        res.status(500).json({message:"Server Error",error:error.message});
    }
};


//@desc update task status
//@route PUT/api/tasks/:id/status
//@access private

const updateTaskStatus = async (req,res)=>{
    try{
       const task = await Task.findById(req.params.id);

       if(!task) return res.status(404).json({message: "Task not found"});

       const isAssigned = task.assignedTo.some(//Check whether logged-in user is assigned to this task
        // .some() checks does any assigned user match current user
        (userId) => userId.toString() === req.user._id.toString() // converting to string as ids are object
       );

       if(!isAssigned && req.user.role != "admin"){
        return res.status(403).json({message:"Not Authorized!"});
       }
       
       task.status = req.body.status || task.status;

       if(task.status == "Completed"){
        task.todoChecklist.forEach((item)=>(item.completed = true));
        task.progress = 100;
       }
       
       await task.save();
       res.json({message: "Task status updated",task});
    }catch(error){
        res.status(500).json({message:"Server Error",error:error.message});
    }
};



//@desc update task checklist
//@route PUT/api/tasks/:id/todo
//@access private

const updateTaskChecklist = async (req,res)=>{
    try{
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

       if(!task) return res.status(404).json({message: "Task not found"});

       if(!task.assignedTo.includes(req.user._id) && req.user.role != "admin"){
        return res.status(403).json({message:"Not Authorized to update the checklist!"});
       }
        task.todoChecklist = todoChecklist; //replace with updated checklist

        //auto update progress based on checklist completeion
        const completeCount = task.todoChecklist.filter(
            (item) => item.completed //Count how many checklist items are completed
        ).length;
        const totalItems = task.todoChecklist.length;
        task.progress = totalItems > 0 ? Math.round((completeCount/totalItems)*100) : 0; // progress percentage

        //auto mark task as completed if all items are checked
        if(task.progress === 100){
            task.status = "Completed";
        }else if(task.progress > 0){
            task.status = "In Progress";
        }else{
            task.status = "Pending";
        }
        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({message:"Task Checklist updated", task:updatedTask});
       
    }catch(error){
        res.status(500).json({message:"Server Error",error:error.message});
    }
};


//@desc dashboard data(admin only)
//@route PUT/api/tasks/dashboard-data
//@access private

const getDashboardData = async (req,res)=>{
    try{
        // fetch statistics
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({status:"Pending"});
        const completedTasks = await Task.countDocuments({status:"Completed"});
        const overdueTasks = await Task.countDocuments({//deadline passed and task not completed
            status : {$ne: "Completed"},
            dueDate : {$lt: new Date()},
        });

        //ensure all possible states are included
        const taskStatuses = ["Pending","In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([//group tasks by status and count them
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1},
                },
            },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) =>{// creating proper response object from array
            const formatedKey = status.replace(/\s+/g, ""); //remove spaces for response key
            acc[formatedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        },{});
        taskDistribution["All"] = totalTasks; //Add total count to task distribution


        //Ensure all priority levels are included
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1},
                },
            },
        ]);
        const taskPriorityLevels = taskPriorities.reduce((acc, priority) =>{
             acc[priority] = taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        },{});

        //Fetch recent 10 tasks
        const recentTasks = await Task.find()
          .sort({createdAt: -1})
          .limit(10)
          .select("title status priority dueDate createdAt" );

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks
        });

    }catch(error){
        res.status(500).json({message:"Server Error",error:error.message});
    }
};


//@desc dashboard data(user-specific)
//@route PUT/api/tasks/dashboard-data
//@access private

const getUserDashboardData = async (req,res)=>{
    try{
         const userId = req.user._id; // only fetch data for logged in user 

         //fetch statistics ofuser specific tasks
        const totalTasks = await Task.countDocuments({assignedTo: userId});
        const pendingTasks = await Task.countDocuments({assignedTo: userId, status:"Pending"});
        const completedTasks = await Task.countDocuments({assignedTo: userId, status:"Completed"});
        const overdueTasks = await Task.countDocuments({//deadline passed and task not completed
            assignedTo: userId,
            status : {$ne: "Completed"},
            dueDate : {$lt: new Date()},
        });

        // task distribution by status
        const taskStatuses = ["Pending","In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([//group tasks by status and count them
            {$match: {assignedTo: userId}},          
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1},
                },
            },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) =>{// creating proper response object from array
            const formatedKey = status.replace(/\s+/g, ""); //remove spaces for response key
            acc[formatedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        },{});
        taskDistribution["All"] = totalTasks;


        // task distribution by priorities
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelRaw = await Task.aggregate([
            {$match: {assignedTo: userId}},          
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1},
                },
            },
        ]);
        const taskPriorityLevels = taskPriorities.reduce((acc, priority) =>{
             acc[priority] = taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        },{});

        // fetch recent 10 tasks for logged in user 
         const recentTasks = await Task.find({assignedTo: userId})
          .sort({createdAt: -1})
          .limit(10)
          .select("title status priority dueDate createdAt" );

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks
        });
    }catch(error){
        res.status(500).json({message:"Server Error",error:error.message});
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData
};