class Department {
  private employees: string[] = [];

  constructor(private id: string, private name: string) {}

  describe(this: Department) {
    console.log(`Department ID: ${this.id} Department name: ${this.name}`);
  }

  addEmployee(employee: string) {
    this.employees.push(employee);
  }

  printEmployeeInfo() {
    console.log(this.employees.length);
    console.log(this.employees);
  }
}

class ITDepartment extends Department {
  constructor(id: string, public admins: string[]) {
    super(id, 'IT');
  }
}
const IT = new ITDepartment('d1', ['max']);

console.log(IT);
