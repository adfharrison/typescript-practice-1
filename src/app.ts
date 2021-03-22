//drag and drop interfaces, to force draggable item to conform to these rules

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// enum to state project status. Active is 0, Finished is 1
enum ProjectStatus {
  Active,
  Finished,
}

// project class
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// create a listener type, which must be a function that takes an array of Projects
// and the return value is not important
type Listener<T> = (items: T[]) => void;

// create a class template for State classes

class State<T> {
  protected listeners: Listener<T>[] = [];

  // method to add listeners to listeres array, must take a listener function
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
// project state class
class ProjectState extends State<Project> {
  // array of listeners

  //array of projects, to be rendered into a list
  private projects: Project[] = [];

  // this is part of the logic to make sure theres only ever one instance of state
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  // this checks if we have already inatantiated the class
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  // method to add a project object into the state array
  addProject(title: string, description: string, people: number) {
    // create new project class
    const newProject = new Project(
      Math.random.toString(),
      title,
      description,
      people,
      // use project status enum
      ProjectStatus.Active
    );
    this.projects.push(newProject);

    // whenever a project is added to the list, we need to tell any listener
    // that needs to know that the state hase changed, to re render lists
    this.updateListeners();
  }

  // method to move projects between lists and change their status
  moveProject(projId: string, newStatus: ProjectStatus) {
    // search projects array in list, to find the one that matches the id provided
    const project = this.projects.find((prj) => {
      return prj.id === projId;
    });
    // if we have found one that matches
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    // loop through listeners array
    for (let listenerFn of this.listeners) {
      // feed a copy of the projects state into all currently existing listeners
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// validation interface, used to check objects fed to validate contain
//the correct properties
interface Validatable {
  value: string | number;

  // added ? means it can be undefined
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

//method to validate. takes an object of type Validatable
const validate = (validateInput: Validatable) => {
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
  if (
    validateInput.minLength != null &&
    typeof validateInput.value === 'string'
  ) {
    // check value length is longer than set minimum length
    isValid = isValid && validateInput.value.length >= validateInput.minLength;
  }

  // if requred maxLength is set and isnt zero, and value is a string not a number
  if (
    validateInput.maxLength != null &&
    typeof validateInput.value === 'string'
  ) {
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
  _: any,
  _2: string,
  // descriptor is the method we add this decorator to. type of Property Descriptor
  descriptor: PropertyDescriptor
) => {
  // get original method value from args
  const originalMethod = descriptor.value;
  // set up a new method using a new descriptor
  const newDescriptor: PropertyDescriptor = {
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

// abstract base class, used only for inheritance. can take 2 types of html element to genereate
// this class is used as a template for the individual classes below
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    // get the template elements we want to render by the id we have entered
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;

    // get container from host element id
    this.hostElement = document.getElementById(hostElementId)! as T;

    // retrieve node by importing the selected template
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    // get first child of the node we made
    this.element = importedNode.firstElementChild as U;
    // assign element a new id for styling, based on the id we feed the constructor
    if (newElementId) {
      this.element.id = newElementId;
    }

    // attach the node back into the app container at desired point
    this.attach(insertAtStart);
  }

  // modified attach method with where to insert this new component
  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  // these abstract methods mean that any class inheriting this class must
  // have these
  abstract configure(): void;
  abstract renderContent(): void;
}

// set up a project item class

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  private project: Project;

  // create getter to use when rendering the number of people on project
  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} people`;
    }
  }
  constructor(HostId: string, project: Project) {
    // call Component constructor with necassary info
    super('single-project', HostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }
  // drag handlers, as required by Draggable interface
  // use autobind so these methods have access to This
  @autobind
  dragStartHandler(event: DragEvent) {
    // set data transfer data allows us to track which project is being moved
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_: DragEvent) {
    console.log('drag ended');
  }

  // set up any listeners
  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  // grab tags from template and render the project details within them
  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}
// set up a class for the List

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  assignedProjects: Project[];

  // cosntructor needs identifier for which type of list to render, and also
  // sets this as the value to the property 'type' in the class
  constructor(private type: 'active' | 'finished') {
    // feed in the values required by the Component class to it's constructor
    super('project-list', 'app', false, `${type}-projects`);
    // all this is done when a new instance of ProjectINput is instantiated

    this.assignedProjects = [];
    // assign element a new id for styling, based on the id we feed the constructor

    // create listener in state
    projectState.addListener((projects: Project[]) => {
      // in the state class, this inner fn will now get called any time the projects
      // array changes, thus updating the assigned projects property in this class

      // need a check to ensure we are working in the correct list
      const relevantProjects = projects.filter((prj) => {
        // check to see if this was called by ongoing or finished list
        if (this.type === 'active') {
          // if we are in active list, return only those projects which are active, to be rendered
          return prj.status === ProjectStatus.Active;
        }
        // else return the finished projects to be rendered
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      //call render projects to re - render list
      this.renderProjects();
    });

    this.configure();
    this.renderContent();
  }

  // add the relevant drag handlers as required by the drag interface
  // use autobind so these methods have access to This
  @autobind
  dragOverHandler(event: DragEvent) {
    // check to make sure the currently dragged item has the relevant permission
    // to be dropped here (set in the drag start handler in list item)
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      // JS default is to NOT allow dropping. so must be overruled
      event.preventDefault();
      // get the currently hovered over list id
      const listEl = this.element.querySelector('ul')!;
      // add the css class Droppable, which will help highlight the list as a target
      listEl.classList.add('droppable');
    }
  }
  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    // remove the css class Droppable, which will help highlight the list as a target
    listEl.classList.remove('droppable');
  }
  @autobind
  dropHandler(event: DragEvent) {
    // get the currently dragged project id from the event data
    const projId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      projId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  //add any listeners
  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    // state listener
    projectState.addListener((projects: Project[]) => {
      // in the state class, this inner fn will now get called any time the projects
      // array changes, thus updating the assigned projects property in this class

      // need a check to ensure we are working in the correct list
      const relevantProjects = projects.filter((prj) => {
        // check to see if this was called by ongoing or finished list
        if (this.type === 'active') {
          // if we are in active list, return only those projects which are active, to be rendered
          return prj.status === ProjectStatus.Active;
        }
        // else return the finished projects to be rendered
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      //call render projects to re - render list
      this.renderProjects();
    });
  }
  // method to fill in the list section
  renderContent() {
    const listId = `${this.type}-projects-list`;
    // set id of unordered lsit element
    this.element.querySelector('ul')!.id = listId;
    // set content of h2 element
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }
  // method to render projects into list
  private renderProjects() {
    // get the type of list we want to change, ongoing or finished
    const list = document.getElementById(`${this.type}-projects-list`)!;
    // wipe contents of list, to prevent duplicate entries
    list.innerHTML = '';

    // loop over all projects
    for (let proj of this.assignedProjects) {
      // create a list item per project, passing in host list id, and project details
      new ProjectItem(this.element.querySelector('ul')!.id, proj);
    }
  }

  // configure method is required by Component class

  // attach method to render within app container
}
// set up class for the input fields

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // set up properties

  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    // feed in the values required by the Component class to it's constructor
    super('project-input', 'app', true, 'user-input');

    // assign input elements the input fields from the html using their id
    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;
    // start submit listener and configure element
    this.configure();
  }

  // attach the form node to the inside of the app container

  // set up submit listner for form
  configure() {
    // listen for the submit, then call submit handler
    this.element.addEventListener('submit', this.submitHandler);
  }

  // this is only here to satisfy typescript that we are inheriting Component properly
  renderContent() {}

  // method to collect and validate form inputs
  // will return array with input, description, and number of people assigned
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // create validation objects, and give them my validation settings,
    // to pass to validate
    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    // call validate with each validation object. if any fail, create alert
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert(
        'Please complete all fields. There must be a title. The description should be 5 or more characters. People should be a number between 1 and 5'
      );
      return;
    } else {
      // if theyre all true, can return the required data array
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  // set up submit handler, add autobind decorator
  @autobind
  private submitHandler(event: Event) {
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
  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }
}

// instantiate ProjectInput
const projInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');
