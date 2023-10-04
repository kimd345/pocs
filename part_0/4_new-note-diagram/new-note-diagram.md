sequenceDiagram
    participant browser
    participant server

    activate browser
    Note right of browser: The user enters note content into the input and clicks `Save`
    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note
    Note right of browser: The browser responds with a 302 Found Redirect status code
    deactivate browser

    activate server
    Note left of server: The server creates the new note in the database <br> with `content` and `date` properties
    Note left of server: The server sends the static HTML document to the browser
    server-->>browser: HTML document
    deactivate server

    activate browser
    Note right of browser: The browser fetches the CSS stylesheet from the server <br> as specified in the <link> tag inside the HTML <head>
    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/main.css
    Note right of browser: The browser responds with a 200 OK Success status code
    deactivate browser

    activate server
    Note left of server: The server sends the CSS file to the browser
    server-->>browser: CSS file
    deactivate server

    activate browser
    Note right of browser: The browser fetches the JS file from the server <br> as specified in the <script> tag inside the HTML <head>
    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/main.js
    Note right of browser: The browser responds with a 200 OK Success status code
    deactivate browser

    activate server
    Note left of server: The server sends the JS file to the browser
    server-->>browser: JavaScript file
    deactivate server

    activate browser
    Note right of browser: The browser responds with a 200 OK Success status code
    Note right of browser: The browser starts executing the JavaScript code that <br> fetches the updated JSON from the server
    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/data.json
    deactivate browser

    activate server
    Note left of server: The server returns the updated JSON from to the browser
    server-->>browser: [{ "content": "HTML is easy", "date": "2023-1-1" }, ... ]
    deactivate server

    activate browser
    Note right of browser: The browser responds with a 200 OK Success status code
    Note right of browser: The browser executes the callback function that renders the notes
    deactivate browser
    
    Note right of browser: The browser executes the callback function that renders the notes