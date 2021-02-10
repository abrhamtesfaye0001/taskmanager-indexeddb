// Define UI Variables 
const taskInput = document.querySelector('#task'); //the task input text field
const form = document.querySelector('#task-form'); //The form at the top
const filter = document.querySelector('#filter'); //the task filter text field
const taskList = document.querySelector('.collection'); //The UL
const clearBtn = document.querySelector('.clear-tasks'); //the all task clear button
const sortDateAscBtn = document.querySelector("#sortDateAscBtn");
const sortDateDescBtn = document.querySelector("#sortDateDescBtn")
const sortNameAscBtn = document.querySelector("#sortNameAscBtn")
const sortNameDescBtn = document.querySelector("#sortNameDescBtn")
const reloadIcon = document.querySelector('.fa'); //the reload button at the top navigation 

//DB variable 

let DB;



// Add Event Listener [on Load]
document.addEventListener('DOMContentLoaded', () => {
    // create the database
    let TasksDB = indexedDB.open('tasks', 1);

    // if there's an error
    TasksDB.onerror = function() {
            console.log('There was an error');
        }
        // if everything is fine, assign the result to the instance
    TasksDB.onsuccess = function() {
        // console.log('Database Ready');

        // save the result
        DB = TasksDB.result;

        // display the Task List 
        displayTaskList();
    }

    // This method runs once (great for creating the schema)
    TasksDB.onupgradeneeded = function(e) {
        // the event will be the database
        let db = e.target.result;

        // create an object store, 
        // keypath is going to be the Indexes
        let objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });

        // createindex: 1) field name 2) keypath 3) options
        objectStore.createIndex('taskname', 'taskname', { unique: false });

        console.log('Database ready and fields created!');
    }

    form.addEventListener('submit', addNewTask);

    function addNewTask(e) {
        e.preventDefault();

        // Check empty entry
        if (taskInput.value === '') {
            taskInput.style.borderColor = "red";

            return;
        }

        // create a new object with the form info
        let dateVar = new Date()
        let newTask = {
            taskname: taskInput.value,
            date: dateVar
        }

        // Insert the object into the database 
        let transaction = DB.transaction(['tasks'], 'readwrite');
        let objectStore = transaction.objectStore('tasks');

        let request = objectStore.add(newTask);

        // on success
        request.onsuccess = () => {
            form.reset();
        }
        transaction.oncomplete = () => {
            console.log('New appointment added');

            displayTaskList();
        }
        transaction.onerror = () => {
            console.log('There was an error, try again!');
        }

    }


    function displayTaskList() {
        // clear the previous task list
        while (taskList.firstChild) {
            taskList.removeChild(taskList.firstChild);
        }

        // create the object store
        let objectStore = DB.transaction('tasks').objectStore('tasks');

        objectStore.openCursor().onsuccess = function(e) {
            // assign the current cursor
            let cursor = e.target.result;

            if (cursor) {

                // Create an li element when the user adds a task 
                const li = document.createElement('li');
                //add Attribute for delete 
                li.setAttribute('data-task-id', cursor.value.id);
                // Adding a class
                li.className = 'collection-item';
                // Create text node and append it 
                li.appendChild(document.createTextNode(cursor.value.taskname));
               
                
                const link = document.createElement('a');
                // Add class and the x marker for a 
                link.className = 'delete-item secondary-content';
                link.innerHTML = `${cursor.value.date.toString().slice(8,24).replace(" ","/")}
                 <i class="fa fa-remove"></i>
                &nbsp;
                <a href="./edit.html?id=${cursor.value.id}"><i class="fa fa-edit"></i> </a>
                `;
                // Append link to li            
                
                li.appendChild(link);
                // Append to UL 
                taskList.appendChild(li);
                cursor.continue();
            }
        }
    }
    function compareDateAsc(a,b){
        if(a.date<b.date){
            return -1;
        }
        if(a.date>b.date){
            return 1;
        }
        return 0;
    }
    function compareDateDesc(a,b){
        if(a.date<b.date){
            return 1;
        }
        if(a.date>b.date){
            return -1;
        }
        return 0;
    }
    function compareNameDesc(a,b){
        if(a.taskname<b.taskname){
            return 1;
        }
        if(a.taskname>b.taskname){
            return -1;
        }
        return 0;
    }
    function compareNameAsc(a,b){
        if(a.taskname<b.taskname){
            return -1;
        }
        if(a.taskname>b.taskname){
            return 1;
        }
        return 0;
    }
    

    sortDateAscBtn.addEventListener("click",()=>{
        sort(0);
    })
    sortDateDescBtn.addEventListener("click",()=>{
        sort(1);
    })
    sortNameAscBtn.addEventListener("click",()=>{
        sort(2);
    })
    sortNameDescBtn.addEventListener("click",()=>{
        sort(3);
    })
    function sort(direction){
        let transaction = DB.transaction(['tasks'], "readonly");
        let objectStore = transaction.objectStore('tasks');
        let tasksArray = []
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            
            if(cursor) {
              tasksArray.push(cursor.value)
            //   console.log(cursor.value)

            cursor.continue();
            } else {
            console.log('Entries all inserted.');
            }
        };
        setTimeout(()=>{
            switch (direction) {
                case 0:
                    tasksArray.sort(compareDateAsc);
                    break;
                case 1:
                    tasksArray.sort(compareDateDesc);
                    break;
                case 2:
                    tasksArray.sort(compareNameAsc);
                break;
                case 3:
                    tasksArray.sort(compareNameDesc);
                break;
            
                default:
                    break;
            }
            console.log(tasksArray)
            taskList.innerHTML = ""
           tasksArray.forEach(
               (task)=>{
                   console.log("task")
                // loop through every task object in the tasksArray and append the li in ul
                // Create an li element when the user adds a task 
                
                const li = document.createElement('li');
                //add Attribute for delete 
                li.setAttribute('data-task-id', task.id);
                // Adding a class
                li.className = 'collection-item';
                // Create text node and append it 
                li.appendChild(document.createTextNode(task.taskname));
               
                
                const link = document.createElement('a');
                // Add class and the x marker for a 
                link.className = 'delete-item secondary-content';
                link.innerHTML = `
                ${task.date.toString().slice(8,24).replace(" ","/")}
                 <i class="fa fa-remove"></i>
                &nbsp;
                <a href="./edit.html?id=${task.id}"><i class="fa fa-edit"></i> </a>
                `;
                
                
                
                li.appendChild(link);
                // Append to UL 
                taskList.appendChild(li);
               }
           )
        },100)
       


    }
    function search(){
        let transaction = DB.transaction(['tasks'], "readonly");
        let objectStore = transaction.objectStore('tasks');
        let tasksArray = []
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            
            if(cursor) {
              tasksArray.push(cursor.value)
            //   console.log(cursor.value)

            cursor.continue();
            } else {
            // console.log('Entries all inserted.');
            }
        };

        setTimeout(()=>{
            
            
            newTaskArray = []
            for(let task of tasksArray){
                
                if(task["taskname"].includes(filter.value)){
                    
                    newTaskArray.push(task)
                }
            }
            
            
            taskList.innerHTML = ""
            newTaskArray.forEach(
                (task)=>{
                
                 // loop through every task object in the tasksArray and append the li in ul
                 // Create an li element when the user adds a task 
                 
                 const li = document.createElement('li');
                 //add Attribute for delete 
                 li.setAttribute('data-task-id', task.id);
                 // Adding a class
                 li.className = 'collection-item';
                 // Create text node and append it 
                 li.appendChild(document.createTextNode(task.taskname));
                
                 
                 const link = document.createElement('a');
                 // Add class and the x marker for a 
                 link.className = 'delete-item secondary-content';
                 link.innerHTML = `
                 ${task.date.toString().slice(8,24).replace(" ","/")}
                  <i class="fa fa-remove"></i>
                 &nbsp;
                 <a href="./edit.html?id=${task.id}"><i class="fa fa-edit"></i> </a>
                 `;
                 
                 
                 
                 li.appendChild(link);
                 // Append to UL 
                 taskList.appendChild(li);
                }
            )
        }
        ,100)
    }    
    filter.addEventListener("keyup",search)

    // Remove task event [event delegation]
    taskList.addEventListener('click', removeTask);

    function removeTask(e) {

        if (e.target.parentElement.classList.contains('delete-item')) {
            if (confirm('Are You Sure about that ?')) {
                // get the task id
                let taskID = Number(e.target.parentElement.parentElement.getAttribute('data-task-id'));
                // use a transaction
                let transaction = DB.transaction(['tasks'], 'readwrite');
                let objectStore = transaction.objectStore('tasks');
                objectStore.delete(taskID);

                transaction.oncomplete = () => {
                    e.target.parentElement.parentElement.remove();
                }

            }

        }

    }

    //clear button event listener   
    clearBtn.addEventListener('click', clearAllTasks);

    //clear tasks 
    function clearAllTasks() {
        let transaction = DB.transaction("tasks", "readwrite");
        let tasks = transaction.objectStore("tasks");
        // clear the table.
        tasks.clear();
        displayTaskList();
        console.log("Tasks Cleared !!!");
    }


});
var p = 0;