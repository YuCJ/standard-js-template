class Test {
  static member = "x";
  constructor() {
    this.greeting = "hello world";
  }
}

const test = new Test();

console.log(`${Test.member}, ${test.greeting}`);
