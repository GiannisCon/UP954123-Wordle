# **Better wordle**

## **Installation**
After downloading the files and opening the project in your editor open a terminal  
and run the following commands in order  
```
npm i
npm start

```
Then open http://localhost:8080 in your preferred browser.  

## **How it works**
The project is made of two parts, client and server.  

### **Server**
I have a simple express server which listens on port 8080 for HTTP requests.  
The server stores the list of words and today's word which changes daily.  
The server provides a special path http://localhost:8080/sendattempt with POST requests.  
When a POST request is sent, the server recieves the user's current attempt and returns an array  
that contains 5 states, the index of each state is the same as the letter's index within the current attempt.     
By storing both the array of words and today's word on the server I prevent the user from cheating his way into  
finding today's word by inspecting the client code.  

### **The Client**

#### **The reason the system uses data attributes**
The reason I decided to use data attributes in my project is for 2 reasons:  
1. Searching: Instead of creating for loops to traverse through the tiles or search for buttons in the keyboard  
I used data attributes within my query selectors in order to make my searching for elements easier.  
Examples in lines 90,93 of wordle.js file.  
2. Styling: Instead of using `classList.add()` to style the tiles I use their data attributes  
because an element can have more than one data attributes which is helpful.  
Examples in lines 96,99,102 of wordle.js  

### **Local Storage**
Local storage is what makes the game function through the days,  
The reason I use the `for` loop in line 41 of wordle.js is because the order of the items  
within the local storage gets changed every time an item's value changes, so I use that `for` loop  
in combination with the `for` loop in line 39 of wordle.js so that I can correctly get the  
attempt of the current row and place it in the specific row of tiles without any errors.  
Also in line 75 of wordle.js the reason why I used a `for` loop that starts from the length  
of the local storage is because if lets say I wanted to remove both items at position 0 and 1 of local storage,  
when I remove item in position 0 the item in position 1 moves to position 0 but my index increments to 1  
so the element that was in position 1 in the beggining never gets modified.  

### **Styling the tiles and keyboard**

The reason I used the `forEach()` method in line 216 of the wordle.js file is because  
I believe it is an easier way to style each tile and keyboard button than using  
`for` loops to go through all the tiles.  
The reason why both functions `initialStyling()` and `refreshStyling()` exist is  
because the `initialStyling()` function needs more paramenters than `refreshStyling()`  
because of the way and the location that it gets called so that is why I didn't use only  
one of those functions in all the scenarios.  

## **How to use the game**

### **Adding a letter to the guess board**

After the game is initialized(local storage gets initialized) the user can enter a letter   
in the first tile by either pressing a button on the physical keyboard or  
by clicking a button on the onscreen keyboard using the mouse.  
What makes this possible is the initialization function in line 108 of wordle.js which handles those events.  
The `pressButton()` function makes finding empty tiles and adding a letter to them possible by using  
the `queryselector` on line 168 of wordle.js. The reason I use a `queryselector` is because they always return  
the first thing that they match so I use that to my advantage in order to make searching for empty tiles easier and faster.  

### **Deleting a letter from the guess board**
If the user wants to delete a letter he can either click the backspace button  
on the onscreen keyboard or the backspace button on the physical keyboard.  
By doing that the `deleteLetter()` function gets called in line 182 of wordle.js.  
This function operates using the `data-state` attribute applied to the tiles in line 171 of wordle.js,  
the reason why the tiles have this attribute is to apply styling to them but I also  
use it to identify the active tiles and delete them.  

### **Submitting a guess**

The user can submit his current guess by either pressing the enter button on the physical keyboard  
or by clicking the enter button on the onscreen keyboard using the mouse.  
After the user does either of the two the `submitCurrentGuess()` function in line 195 of wordle.js get called.  
But before this function get called in line 142 of wordle.js I remove the keydown and click event listeners.  
The reason I remove those event listeners is because if the user presses both enter and backspace buttons at the same time  
the system used to break and submit a 4 letter word instead of a five letter word which essentially broke the whole game,  
this is prevented by removing the event listeners by calling the function `stopResponding()` in line 142 of wordle.js.  
The `submitCurrentGuess()` function using the `getCurrentTiles()` gets a nodelist which then turns into an array.  
The reason I transform the nodelist into an array is so that I can use the reduce method of that array in line 204 of wordle.js  
in order to trasform the user's current attempt into a string so that I can use it in my if statement in line 209 of wordle.js  
and later on send it to my `checkPosition()` function in order to apply the appropriate styling to the tiles and keyboard buttons.  

### **Refreshing the browser**

If the user refreshes the browser after successfully completing today's challenge he is going to see  
today's word, his total games won and his active win streak.  
If the user refreshes the browser after running out of attempts the game is going to display the  
user's total games won and active win streak.  
If the user refreshes the window before successfully or unsuccessfully completing the day's challenge  
the window is going to appear as it was before refreshing allowing him to submit his remaining attempts.  

### **How the system knows when the day changes and how does the system deal with this change**

Variables in line 12-15 in the wordle.js file are the ones that let the system know when the day changes.  
Similar variables exist in the svr.js file in lines 342-348 in order for the word to change daily.  
After that once the game is initialized local storage is created and it contains `todaysDate` variable  
as a `date`(number value) which actually has the same value as `diffInDays` within svr.js.  
`todaysDate` variable in wordle.js increments by one every day. When the day changes and the user  
reloads the game, the value of `todaysDate` within wordle.js and `diffInDays` within svr.js gets  
incremented by 1.So those variables are no longer equal to the `date` variable that is stored within local storage.  
When that happens the if statement in line 69 of wordle.js is true, the user's previous day's attempts  
are being removed from local storage, the tiles are emptied, the styling of both the tiles and the keyboard buttons is removed,  
the event listeners are activated and the game starts with a new word.  
