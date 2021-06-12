Bound function as a method
importance: 5
What will be the output?

function f() {
  console.log( this ); // ?
}

let user = {
  g: f.bind(null)
};

user.g();

The answer: null.
The context of a bound function is hard-fixed. There’s just no way to further change it.

So even while we run user.g(), the original function is called with this=null.

##############################################################
##############################################################

Second bind
importance: 5
Can we change this by additional binding?

What will be the output?

function f() {
  alert(this.name);
}

f = f.bind( {name: "John"} ).bind( {name: "Ann" } );

f();

The answer: John

function f() {
  alert(this.name);
}

f = f.bind( {name: "John"} ).bind( {name: "Pete"} );

f(); // John

The exotic bound function object returned by f.bind(...) remembers the context (and
arguments if provided) only at creation time. A function cannot be re-bound.

##############################################################
##############################################################

Function property after bind
importance: 5
There’s a value in the property of a function. Will it change after bind? Why, or why not?

function sayHi() {
  alert( this.name );
}
sayHi.test = 5;

let bound = sayHi.bind({
  name: "John"
});

alert( bound.test ); // what will be the output? why?

R: the answer is: undefined.
Because the result of bind is another object made there at call, it does not have the test
property that was created after it.

##############################################################
##############################################################

Fix a function that loses "this"
importance: 5
The call to askPassword() in the code below should check the password and then call 
user.loginOk/loginFail depending on the answer.

But it leads to an error. Why?

Fix the highlighted line for everything to start working right (other lines are not to 
be changed).

function askPassword(ok, fail) {
  let password = prompt("Password?", '');
  if (password == "rockstar") ok();
  else fail();
}

let user = {
  name: 'John',

  loginOk() {
    alert(`${this.name} logged in`);
  },

  loginFail() {
    alert(`${this.name} failed to log in`);
  },

};

askPassword(user.loginOk, user.loginFail);

// the error occurs because ask gets functions loginOk/loginFail without the object
// when it calls them, they naturally assume this=undefined.

// Let's bind the context:

askPassword(user.loginOk.bind(user), user.loginFail.bind(user));

// also there's an alternative:

askPassword(() => user.loginOk(), () => user.loginFail());

Usually that also works and looks good.

It’s a bit less reliable though in more complex situations where user variable might 
change after askPassword is called, but before the visitor answers and 
calls () => user.loginOk().

##############################################################
##############################################################

Partial application for login
importance: 5
The task is a little more complex variant of Fix a function that loses "this".

The user object was modified. Now instead of two functions loginOk/loginFail, it has 
a single function user.login(true/false).

What should we pass askPassword in the code below, so that it calls user.login(true) 
as ok and user.login(false) as fail?

askPassword(user.login.bind(user, true), use

// here we have two options

1. a wrapper functino, and arrow to be concise:

askPassword(() => user.login(true), () => user.login(false));

2. a partial from user.login that uses 'user' as a context and has the correct first argument

askPassword(user.login.bind(user, true), user.login.bind(user, false));


############################################################
############################################################

Working with prototype
importance: 5
Here’s the code that creates a pair of objects, then modifies them.

Which values are shown in the process?

let animal = {
  jumps: null
};
let rabbit = {
  __proto__: animal,
  jumps: true
};

alert( rabbit.jumps ); // ? (1)

delete rabbit.jumps;

alert( rabbit.jumps ); // ? (2)

delete animal.jumps;

alert( rabbit.jumps ); // ? (3)

## Attempt at Solution:

(1) true
(2) null
(3) undefined - there's no such property anymore'

############################################################
############################################################

Searching algorithm
importance: 5
The task has two parts.

Given the following objects:

let head = {
  glasses: 1
};

let table = {
  pen: 3
};

let bed = {
  sheet: 1,
  pillow: 2
};

let pockets = {
  money: 2000
};

Use __proto__ to assign prototypes in a way that any property 
lookup will follow the path: pockets → bed → table → head. 

For instance, pockets.pen should be 3 (found in table), and 
bed.glasses should be 1 (found in head).

Answer the question: is it faster to get glasses as 
pockets.glasses or head.glasses? Benchmark if needed.

## Attempt at solution

let head = {
  glasses: 1
};

let table = {
  pen: 3,
  __proto__: head
};

let bed = {
  sheet: 1,
  pillow: 2,
  __proto__: head
};

let pockets = {
  money: 2000,
  __proto__: bed,
};

In modern engines, performance-wise, there’s no difference 
whether we take a property from an object or its prototype. 
They remember where the property was found and reuse it in 
the next request.

For instance, for pockets.glasses they remember where they 
found glasses (in head), and next time will search right 
there. They are also smart enough to update internal caches 
if something changes, so that optimization is safe.

############################################################
############################################################

Where does it write?
importance: 5
We have rabbit inheriting from animal.

If we call rabbit.eat(), which object receives the full 
property: animal or rabbit?

let animal = {
  eat() {
    this.full = true;
  }
};

let rabbit = {
  __proto__: animal
};

rabbit.eat();

## Attempt at solution

rabbit, Because 'this' is an object before the dot. so rabbit.eat()
modifies rabbit. Property lookup and execution are two different
things. The method rabbit.eat is first found in the prototype,
then executed with this = rabbit.

############################################################
############################################################

Why are both hamsters full?
importance: 5
We have two hamsters: speedy and lazy inheriting from the general 
hamster object.

When we feed one of them, the other one is also full. 
Why? How can we fix it?

let hamster = {
  stomach: [],

  eat(food) {
    this.stomach.push(food);
  }
};

let speedy = {
  __proto__: hamster
};

let lazy = {
  __proto__: hamster
};

// This one found the food
speedy.eat("apple");
alert( speedy.stomach ); // apple

// This one also has it, why? fix please.
alert( lazy.stomach ); // apple

## Attempt at Solution

let hamster = {
  stomach: [],

  eat(food) {
    this.stomach.push(food);
  }
};

let speedy = {
  __proto__: hamster,
  stomach: []
};

let lazy = {
  __proto__: hamster,
  stomach: []
};

// This one found the food
speedy.eat("apple");
alert( speedy.stomach ); // apple

// This one also has it, why? fix please.
alert( lazy.stomach ); // apple

As a common solution, all properties that describe the state of a 
particular object, like stomach above, should be written 
into that object. That prevents such problems.

##################################################################

Changing "prototype"
importance: 5
In the code below we create new Rabbit, and then try to modify its prototype.

In the start, we have this code:

1 - true
The assignment to Rabbit.prototype sets up [[Prototype]] 
for new objects, but it does not affect the existing ones.

2 - false
Objects are assigned by reference. The object from 
Rabbit.prototype is not duplicated, it’s still a single 
object referenced both by Rabbit.prototype and 
by the [[Prototype]] of rabbit.

So when we change its content through one reference, it
 is visible through the other one.

3 - true

All delete operations are applied directly to the object. 
Here delete rabbit.eats tries to remove eats property from 
rabbit, but it doesn’t have it. So the operation won’t have 
any effect.

4 - undefined

The property eats is deleted from the prototype, 
it doesn’t exist any more.

#################################################################

Create an object with the same constructor
importance: 5
Imagine, we have an arbitrary object obj, created by a constructor 
function – we don’t know which one, but we’d like to create a
 new object using it.

Can we do it like that?

let obj2 = new obj.constructor();

Give an example of a constructor function for obj which lets 
such code work right. And an example that makes it work wrong.

## Attempt

We can use such approac if we are sure that 'constructor' property
has the correct value. For instance, if we don't touch the default
'prototype', then this code works for sure:

#
function User(name) {
  this.name = name;
}

let user = new User('John');
let user2 = new user.constructor('Pete');

alert( user2.name ); // Pete (worked!)
#

It worked Because User.prototype.constructor == User.name
... but if someone, so to speak, overwrites User.prototype
and forgets to recreate constructor to reference User,
then it would fail:

#
function User(name) {
  this.name = name;
}

User.prototype = {}; // (*)

let user = new User('John');
let user2 = new user.constructor('Pete')

alert( user2.name ); // undefined

Why user2.name is undefined?

Here’s how new user.constructor('Pete') works:

1 - First, it looks for constructor in user. Nothing.

2 - Then it follows the prototype chain. The prototype of user is User.prototype, and it also has no constructor (because we “forgot” to set it right!).

3 - Going further up the chain, User.prototype is a plain object, its prototype is the built-in Object.prototype.

4 - Finally, for the built-in Object.prototype, there’s a built-in Object.prototype.constructor == Object. So it is used.

Finally, at the end, we have let user2 = new Object('Pete').

Probably, that’s not what we want. We’d like to create new User, not new Object. That’s the outcome of the missing constructor.

(Just in case you’re curious, the new Object(...) call converts 
  its argument to an object. That’s a theoretical thing, in 
  practice no one calls new Object with a value, and generally 
  we don’t use new Object to make objects at all).

#################################################################

Add method "f.defer(ms)" to functions
importance: 5
Add to the prototype of all functions the method defer(ms), 
that runs the function after ms milliseconds.

After you do it, such code should work:

function f() {
  alert("Hello!");
}

f.defer(1000); // shows "Hello!" after 1 second

## Attempt at solution

//the way this should be done, we create a function inside
// the Function prototype:

Function.prototype.defer = function(ms) { // creating a function that
  //has ms as arguments as a method to the Function constructor obj
  setTimeout(this, ms);
};

// so when a new function f() is created it will inherit from the
// Function.prototype (common accross all functions).

##################################################################


Add the decorating "defer()" to functions
importance: 4
Add to the prototype of all functions the method defer(ms), that returns a wrapper, delaying the call by ms milliseconds.

Here’s an example of how it should work:

function f(a, b) {
  alert( a + b );
}

f.defer(1000)(1, 2); // shows 3 after 1 second

## Attempt at solution

// we need to add a method to the Function prototype that returns
// a wrapper instead of just doing something, we need a function
// inside a function

Function.prototype.defer = function(ms) {
  let f = this;
  return function(...args) {
    setTimeout(() => f.apply(this.args), ms);
  }
};

// please note: we use this in f.apply to make our decoration work
// for object methods.

// so if the wrapper function is called as an object method,
// then 'this' is passed to the original method f

#
Function.prototype.defer = function(ms) {
  let f = this;
  return function(...args) {
    setTimeout(() => f.apply(this, args), ms);
  }
};

let user = {
  name: "John",
  sayHi() {
    alert(this.name);
  }
}

user.sayHi = user.sayHi.defer(1000);

user.sayHi();
#
