# Fluree Notebook

UI for interacting with Fluree and saving queries/transactions in the form notebooks with markdown.

## Components:

1. **Vite/React Frontend**: 
    - Provides user interface to interact with Fluree.
    - Uses local storage in the browser to store notebooks (queries/transactions).
    - Facilitates sharing of notebooks between users via exporting/importing JSON files.

2. **Node Server**:
    - Minimalist server for the purpose of serving the ledger names from the "data" folder at the root directory.

3. **Fluree HTTP-API-Gateway**:
    - Booted using the image from DockerHub.

## Getting Started:

### Installation:

1. Clone the repository to your local machine.
2. From the root directory, run the following script to install dependencies for both Vite and Node:

    ```bash
    ./install.sh
    ```

### Running the Application:

- To start the notebook UI, node server, and the http-api-gateway all at once, run:

    ```bash
    ./run.sh
    ```

- Alternatively, if you wish to only start the UI (and not the node server or the http-api-gateway), use:

    ```bash
    ./run-ui.sh
    ```

    > **Note**: This can be particularly useful if you already have instance(s) of Fluree running and don't need to initialize the extra components of the project.