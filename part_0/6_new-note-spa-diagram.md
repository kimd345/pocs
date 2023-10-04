sequenceDiagram
    participant browser
    participant server

    activate browser
    Note right of browser: The user enters note content into the input and clicks `Save`
    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa
    Note right of browser: The browser sends new note content and date
    Note right of browser: The browser responds with a 201 Created Success status code and does not redirect
    deactivate browser

    activate server
    Note left of server: The server creates the note in the database
    deactivate server

    activate browser
    Note right of browser: The browser pushes the new note into the notes array <br> with the initial JS
    deactivate browser
