"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// enum to state project status. Active is 0, Finished is 1
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
// project class
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
// project state class
class ProjectState {
    constructor() {
        // array of listeners
        this.listeners = [];
        //array of projects, to be rendered into a list
        this.projects = [];
    }
    // this checks if we have already inatantiated the class
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    // method to add listeners to listeres array, must take a listener function
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
    // method to add a project object into the state array
    addProject(title, description, people) {
        // create new project class
        const newProject = new Project(Math.random.toString(), title, description, people, 
        // use project status enum
        ProjectStatus.Active);
        this.projects.push(newProject);
        // whenever a project is added to the list, we need to tell any listener
        // that needs to know that the state hase changed, to re render
        // loop through listeners array
        for (let listenerFn of this.listeners) {
            // feed a copy of the projects state into all currently existing listeners
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
//method to validate. takes an object of type Validatable
const validate = (validateInput) => {
    // start with true, change to false on failed check
    let isValid = true;
    // check if its a required field
    if (validateInput.required) {
        // if it is, means it has to have content. so check it for length, converting
        // possible number to string first
        // isValid = true, or, if logic after && is false, then isValid = false
        isValid = isValid && validateInput.value.toString().trim().length !== 0;
    }
    // if requred minLength is set and isnt zero, and value is a string not a number
    if (validateInput.minLength != null &&
        typeof validateInput.value === 'string') {
        // check value length is longer than set minimum length
        isValid = isValid && validateInput.value.length >= validateInput.minLength;
    }
    // if requred maxLength is set and isnt zero, and value is a string not a number
    if (validateInput.maxLength != null &&
        typeof validateInput.value === 'string') {
        // check value length is shorter than set max length
        isValid = isValid && validateInput.value.length <= validateInput.maxLength;
    }
    // if requred min number is set and isnt zero, and value is a number
    if (validateInput.min != null && typeof validateInput.value === 'number') {
        // check value is more than set min
        isValid = isValid && validateInput.value >= validateInput.min;
    }
    // if requred max number is set and isnt zero, and value is a number
    if (validateInput.max != null && typeof validateInput.value === 'number') {
        // check value is less than set max
        isValid = isValid && validateInput.value <= validateInput.max;
    }
    return isValid;
};
// autobind decorator, for methods that are called using events
const autobind = (
// we dont need the first 2 args so underscore them
_, _2, 
// descriptor is the method we add this decorator to. type of Property Descriptor
descriptor) => {
    // get original method value from args
    const originalMethod = descriptor.value;
    // set up a new method using a new descriptor
    const newDescriptor = {
        configurable: true,
        // get method basically returns the fact that this method, whenever called,
        //is always bound to the class, and not the event
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return newDescriptor;
};
// set up a class for the List
class ProjectList {
    // cosntructor needs identifier for which type of list to render, and also
    // sets this as the value to the property 'type' in the class
    constructor(type) {
        // all this is done when a new instance of ProjectINput is instantiated
        this.type = type;
        // get input forms from html
        this.templateElement = document.getElementById('project-list');
        // get app container from html
        this.hostElement = document.getElementById('app');
        // get node from form element, true = deep copy all elements within it
        const importedNode = document.importNode(this.templateElement.content, true);
        // get first child of the node we made
        this.element = importedNode.firstElementChild;
        this.assignedProjects = [];
        // assign element a new id for styling, based on the id we feed the constructor
        this.element.id = `${this.type}-projects`;
        // create listener in state
        projectState.addListener((projects) => {
            // in the state class, this will now get called any time the projects
            // array changes, thus updating the assigned projects property in this class
            this.assignedProjects = projects;
            //call render projects to re - render list
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    // method to render projects into list
    renderProjects() {
        // get the type of list we want to change, ongoing or finished
        const listEl = document.getElementById(`${this.type}-projects-list`);
        for (let proj of this.assignedProjects) {
            // create a list item
            const listItem = document.createElement('li');
            // set its text content with current project title
            listItem.textContent = proj.title;
            listEl.appendChild(listItem);
        }
    }
    // method to fill in the list section
    renderContent() {
        const listId = `${this.type}-projects-list`;
        // set id of unordered lsit element
        this.element.querySelector('ul').id = listId;
        // set content of h2 element
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + ' PROJECTS';
    }
    // attach method to render within app container
    attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}
// set up class for the input fields
class ProjectInput {
    constructor() {
        // all this is done when a new instance of ProjectINput is instantiated
        // get input forms from html
        this.templateElement = document.getElementById('project-input');
        // get app container from html
        this.hostElement = document.getElementById('app');
        // get node from form element, true = deep copy all elements within it
        const importedNode = document.importNode(this.templateElement.content, true);
        // get first child of the node we made
        this.element = importedNode.firstElementChild;
        // assign element a new id for styling
        this.element.id = 'user-input';
        // assign input elements the input fields from the html using their id
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        // start submit listener
        this.configure();
        //call attach method
        this.attach();
    }
    // attach the form node to the inside of the app container
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
    // set up submit listner for form
    configure() {
        // listen for the submit, then call submit handler
        this.element.addEventListener('submit', this.submitHandler);
    }
    // method to collect and validate form inputs
    // will return array with input, description, and number of people assigned
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        // create validation objects, and give them my validation settings,
        // to pass to validate
        const titleValidatable = {
            value: enteredTitle,
            required: true,
        };
        const descriptionValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5,
        };
        const peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5,
        };
        // call validate with each validation object. if any fail, create alert
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert('Please complete all fields. There must be a title. The description should be 5 or more characters. People should be a number between 1 and 5');
            return;
        }
        else {
            // if theyre all true, can return the required data array
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }
    // set up submit handler, add autobind decorator
    submitHandler(event) {
        event.preventDefault();
        // call gatherUserInput to submit it
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            // destructure the elements of userInput array
            const [title, desc, people] = userInput;
            // add the project to the state
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }
    // method to clear fields after submission
    clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
}
__decorate([
    autobind
], ProjectInput.prototype, "submitHandler", null);
// instantiate ProjectInput
const projInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');
//# sourceMappingURL=app.js.map