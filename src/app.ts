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

// set up class

class ProjectInput {
  // set up properties
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    // all this is done when a new instance of ProjectINput is instantiated

    // get input forms from html
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement;

    // get app container from html
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // get node from form element, true = deep copy all elements within it
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    // get first child of the node we made
    this.element = importedNode.firstElementChild as HTMLFormElement;

    // assign element a new id for styling
    this.element.id = 'user-input';

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

    // start submit listener
    this.configure();
    //call attach method
    this.attach();
  }

  // attach the form node to the inside of the app container
  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }

  // set up submit listner for form
  private configure() {
    // listen for the submit, then call submit handler
    this.element.addEventListener('submit', this.submitHandler);
  }

  // method to collect and validate form inputs
  // will return array with input, description, and number of people assigned
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    if (
      enteredTitle.trim().length === 0 ||
      enteredDescription.trim().length === 0 ||
      enteredPeople.trim().length === 0
    ) {
      alert('Please complete all fields');
      return;
    } else {
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
      const [title, desc, people] = userInput;
      console.log(title, desc, people);
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
