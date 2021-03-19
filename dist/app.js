"use strict";
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
        //call attack method
        this.attach();
    }
    // attach the form node to the inside of the app container
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}
// instantiate ProjectInput
const projInput = new ProjectInput();
//# sourceMappingURL=app.js.map