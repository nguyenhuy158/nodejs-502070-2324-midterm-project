# CallQuick Project [nodejs-502070-2324-middle-project]

Project: Real-time caller using WebRTC.

Website/Production: [[https://callmate.onrender.com](https://callmate.onrender.com)]

**Warning:** The first-time access may take longer to respond because the server auto-freezes the app when there are no end-users accessing the website.

# Table of Contents
* 1. [Pre-requisites](#Pre-requisites)
* 2. [Getting Started](#GettingStarted)
* 3. [Deployment](#Deployment)
* 4. [Database Configuration](#DatabaseConfiguration)
* 5. [Deployment Account](#DeploymentAccount)
* 6. [User Guide](#UserGuide)
* 7. [Current Issue](#CurrentIssue)
* 8. [End](#End)

##  1. <a name='Pre-requisites'></a>Pre-requisites

1. Node.js version 18.18.0 or largest is required. You can download it from [Node.js Official Website](https://nodejs.org/en/).

2. Yarn version 1.22.19 is required. You can install it using the following command:

    ```bash
    npm install -g yarn
    ```

##  2. <a name='GettingStarted'></a>Getting Started

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

##  3. <a name='Deployment'></a>Deployment

To deploy your changes to the server (onrender.com):

1. Make code changes in the `nodejs-502070-2324-midterm-project` folder.

2. Push your code to the `main` branch, and the server onrender.com will automatically deploy the updated code.

3. Access the deployed website at https://callmate.onrender.com.

##  4. <a name='DatabaseConfiguration'></a>Database Configuration

Configure your MongoDB database connection in the .env file:

```env
DB_URI=mongodb+srv://noreplaynodejs502070:9bmdioNxz8UeylCQ@techhutgc.foofgxp.mongodb.net/CallMate
```

Please note that the project currently lacks a sign-in/sign-up functionality.

##  5. <a name='DeploymentAccount'></a>Deployment Account

Information on deployment can be found at https://render.com/.

Manage your deployed applications at https://dashboard.render.com/.

Login with the following account credentials:

-   Username: `noreplay.nodejs.502070@gmail.com`
-   Password: `noreplay.nodejs.502070`

##  6. <a name='UserGuide'></a>User Guide

Use the application to make real-time calls using WebRTC.

-   Open a browser and go to https://callquick.onrender.com, allow access to your camera and audio, enter your name in the input field, and click 'Submit Name.'
-   Open another browser or an incognito tab and access the same link, then follow the same steps.
-   In one of the two windows, click the "Reload List" button to fetch the list of active users.
-   To initiate a call, click the "Start Call" button, enter the name of the person you want to call, and click "OK."
-   The call will be automatically established, and both parties will be able to see and hear each other.

##  7. <a name='CurrentIssue'></a>Current Issue

If two computers are on the same network, calls can be made. However, if they are on different networks, calls between them may not work.

##  8. <a name='End'></a>End
