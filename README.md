<!-- vscode-markdown-toc -->

-   [Getting Started](#GettingStarted)
    -   [Pre-requisites](#Pre-requisites)
    -   [Installation](#Installation)
-   [Deployment](#Deployment)
-   [Database Configuration](#DatabaseConfiguration)
-   [Deployment Account](#DeploymentAccount)
-   [User Guide](#UserGuide)
-   [Project Structure](#ProjectStructure)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

# CallQuick Project [nodejs-502070-2324-middle-project]

Project: Real-time caller using WebRTC.

Website/Production: [[https://callmate.onrender.com](https://callmate.onrender.com)]

**Warning:** The first-time access may take longer to respond because the server auto-freezes the app when there are no end-users accessing the website.

## <a name='GettingStarted'></a>Getting Started

### <a name='Pre-requisites'></a>Pre-requisites

1. Node.js version 18.18.0 or largest is required. You can download it from [Node.js Official Website](https://nodejs.org/en/).

2. Yarn version 1.22.19 is required. You can install it using the following command:

    ```bash
    npm install -g yarn
    ```

### <a name='Installation'></a>Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/nguyenhuy158/nodejs-502070-2324-midterm-project
    ```
2. Change to the project directory:
    ```bash
    cd nodejs-502070-2324-midterm-project/
    ```
3. Install project dependencies:
    ```bash
    yarn
    ```
4. Build and run the project:
    ```bash
    yarn dev
    ```
5. Open a web browser and navigate to http://localhost:8081 to access the local development version of the website.

## <a name='Deployment'></a>Deployment

To deploy your changes to the server (onrender.com):

1. Make code changes in the `nodejs-502070-2324-midterm-project` folder.

2. Push your code to the `main` branch, and the server onrender.com will automatically deploy the updated code.

3. Access the deployed website at https://callmate.onrender.com.

## <a name='DatabaseConfiguration'></a>Database Configuration

Configure your MongoDB database connection in the .env file:

```env
DB_URI=mongodb+srv://noreplaynodejs502070:9bmdioNxz8UeylCQ@techhutgc.foofgxp.mongodb.net/CallMate
```

Please note that the project currently lacks a sign-in/sign-up functionality.

## <a name='DeploymentAccount'></a>Deployment Account

Information on deployment can be found at https://render.com/.

Manage your deployed applications at https://dashboard.render.com/.

Login with the following account credentials:

-   Username: `noreplay.nodejs.502070@gmail.com`
-   Password: `noreplay.nodejs.502070`

## <a name='UserGuide'></a>User Guide

Use the application to make real-time calls using WebRTC.

-   Open a browser and go to https://callquick.onrender.com, allow access to your camera and audio, enter your name in the input field, and click 'Submit Name.'
-   Open another browser or an incognito tab and access the same link, then follow the same steps.
-   In one of the two windows, click the "Reload List" button to fetch the list of active users.
-   To initiate a call, click the "Start Call" button, enter the name of the person you want to call, and click "OK."
-   The call will be automatically established, and both parties will be able to see and hear each other.
Youtube Demo: https://youtu.be/50WUz_7X3Ag
## <a name='ProjectStructure'></a>Project Structure

The folder structure of this app is explained below:

| Name                | Description                                                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **dist**            | Contains the distributable (or output) from your TypeScript build.                                                                                                                  |
| **node_modules**    | Contains all npm dependencies                                                                                                                                                       |
| **src**             | Contains source code that will be compiled to the dist dir                                                                                                                          |
| **configuration**   | Application configuration including environment-specific configs                                                                                                                    |
| **src/controllers** | Controllers define functions to serve various express routes.                                                                                                                       |
| **src/lib**         | Common libraries to be used across your app.                                                                                                                                        |
| **src/middlewares** | Express middlewares which process the incoming requests before handling them down to the routes                                                                                     |
| **src/routes**      | Contain all express routes, separated by module/area of application                                                                                                                 |
| **src/models**      | Models define schemas that will be used in storing and retrieving data from Application database                                                                                    |
| **src/monitoring**  | Prometheus metrics                                                                                                                                                                  |
| **src**/index.ts    | Entry point to express app                                                                                                                                                          |
| package.json        | Contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped) tsconfig.json Config settings for compiling source code only written in TypeScript |
| tslint.json         | Config settings for TSLint code style checking                                                                                                                                      |
