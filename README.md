# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Running the Application

To run the application, use the following command:

### `npm start`

This command will start the development server and open the application in your browser. You can then view the header component at [http://localhost:3000](http://localhost:3000).

## Project Description

This project is an Episode Manager application built with React. It allows users to search for and manage episodes of their favorite TV shows.

## Current Status

The project is still under development and has the following issues or missing parts that I want to address before completing the project:

-   Missing BEM and SCSS files structure: The project does not currently use BEM (Block Element Modifier) for CSS class naming or SCSS for CSS pre-processing to ensure a more organized and maintainable codebase.
-   .env variables not accessible in .tsx files: The application is unable to access environment variables defined in the `.env` file within the `.tsx` files.
-   401 error from GraphQL API: The application is encountering a 401 error when making requests to the GraphQL API. I've created a fallback with mockData to simulate the API response, but I need to resolve the 401 error to use the actual API. I also used the OMDB API as a fallback for the GraphQL API.

## Features

-   Search for episodes of your favorite TV shows.
-   View details about each episode.
-   Create, update, and delete episodes.
-   Filter episodes by season.
-   View popular episodes.

## How to Use

1.  Clone the repository: `git clone <repository-url>`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm start`
4.  Open the application in your browser: [http://localhost:3000](http://localhost:3000)

## Wireframes
1. On the folder wireframes you can find some quick sketches to represent the overall layout of the application. I can explain further my thought process behind the design decisions made during the creation of the application's user interface if necessary.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature/your-feature`
3.  Make your changes.
4.  Commit your changes: `git commit -m 'Add your feature'`
5.  Push to the branch: `git push origin feature/your-feature`
6.  Create a pull request.

## License

This project is licensed under the MIT License.
