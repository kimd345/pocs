sequenceDiagram
    participant browser
    participant server

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/notes
    server-->>browser: HTML, CSS, JS, JSON (on initial load, similar to MPA), but instead of just one page, the entire JS bundle for the whole web app is sent

    Note right of browser: On page reload or navigation, (re)fetches all components and assets
