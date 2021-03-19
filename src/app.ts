class ProjectInput {
  // set up properties
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

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

    //call attack method
    this.attach();
  }

  // attach the form node to the inside of the app container
  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

// instantiate ProjectInput
const projInput = new ProjectInput();
